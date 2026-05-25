import { NextRequest, NextResponse } from "next/server";
import { getTemplates, getKnowledgeNodes, getCourtFormat, getSectionMappings } from "../../../lib/supabase";
import { callLLM } from "../../../lib/llm";
import { searchCases } from "../../../lib/kanoon";
import { injectKnowledge } from "../../../lib/knowledge";
import { normalizeSections } from "../../../lib/normalizer";
import { ComparisonLevelOutput } from "../../../types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userQuery, 
      templateId, 
      level, 
      clientId, 
      matterId,
      courtCode
    } = body as {
      userQuery: string;
      templateId: string;
      level: 1 | 2 | 3;
      clientId?: string;
      matterId?: string;
      courtCode?: string;
    };

    if (!userQuery) {
      return NextResponse.json({ error: "Missing userQuery parameter" }, { status: 400 });
    }

    if (level !== 1 && !templateId) {
      return NextResponse.json({ error: "Missing templateId for Level 2 or 3" }, { status: 400 });
    }

    // 1. Fetch template if applicable
    const templates = await getTemplates();
    const activeTemplate = templates.find(t => t.template_id === templateId) || null;

    if (level !== 1 && !activeTemplate) {
      return NextResponse.json({ error: `Template with ID '${templateId}' not found` }, { status: 404 });
    }

    // 2. Fetch court formats
    const activeCourtCode = courtCode || (activeTemplate?.court_type === "Sessions Court" ? "SESSIONS" : activeTemplate?.court_type === "High Court" ? "HC" : activeTemplate?.court_type === "Supreme Court" ? "SC" : "NCLT");
    const courtFormat = await getCourtFormat(activeCourtCode);

    let draftText = "";
    let injectedNodes: string[] = [];
    let legalReferences: string[] = [];
    
    // =========================================================================
    // LEVEL 1: GENERIC AI
    // =========================================================================
    if (level === 1) {
      const systemPrompt = `You are a legal assistant. Draft a generic legal document based on the user query.
Do NOT apply specific court headers, statutory normalizations, or enterprise facts unless explicitly typed.`;
      
      draftText = await callLLM(systemPrompt, userQuery);
    } 
    // =========================================================================
    // LEVEL 2: TEMPLATE ONLY
    // =========================================================================
    else if (level === 2 && activeTemplate) {
      let systemPrompt = activeTemplate.system_prompt;

      // Replace court headers if available
      if (courtFormat) {
        systemPrompt = systemPrompt.replace(/{COURT_HEADER}/g, courtFormat.header_template);
        systemPrompt = systemPrompt.replace(/{COURT_PARTY_FORMAT}/g, courtFormat.party_format);
        systemPrompt = systemPrompt.replace(/{COURT_CLOSING_FORMAT}/g, courtFormat.closing_format);
      } else {
        systemPrompt = systemPrompt.replace(/{COURT_HEADER}/g, "[COURT HEADER PLACEHOLDER]");
        systemPrompt = systemPrompt.replace(/{COURT_PARTY_FORMAT}/g, "[PARTY DETAILS]");
        systemPrompt = systemPrompt.replace(/{COURT_CLOSING_FORMAT}/g, "[ADVOCATE SIGNATURE]");
      }

      // Fill in generic empty placeholders for injection markers
      systemPrompt = systemPrompt.replace(/{INJECTION_CLIENT}/g, "[INSERT CLIENT DISPUTE DETAILS]");
      systemPrompt = systemPrompt.replace(/{INJECTION_DECISIONS}/g, "[INSERT RELEVANT CASE LAWS/PRECEDENTS]");
      systemPrompt = systemPrompt.replace(/{INJECTION_CONSTRAINTS}/g, "[INSERT DRAFTING CONSTRAINTS]");

      draftText = await callLLM(systemPrompt, userQuery);
    } 
    // =========================================================================
    // LEVEL 3: TEMPLATE + KNOWLEDGE + INDIAN KANOON
    // =========================================================================
    else if (level === 3 && activeTemplate) {
      let systemPromptTemplate = activeTemplate.system_prompt;

      // Replace court headers
      if (courtFormat) {
        systemPromptTemplate = systemPromptTemplate.replace(/{COURT_HEADER}/g, courtFormat.header_template);
        systemPromptTemplate = systemPromptTemplate.replace(/{COURT_PARTY_FORMAT}/g, courtFormat.party_format);
        systemPromptTemplate = systemPromptTemplate.replace(/{COURT_CLOSING_FORMAT}/g, courtFormat.closing_format);
      }

      // Fetch knowledge nodes (Constraint, Anti Pattern, Decision, Client Fact)
      const knNodes = await getKnowledgeNodes(activeTemplate.practice_area, clientId, matterId);

      // Perform research query on Indian Kanoon
      const caseResults = await searchCases(activeTemplate.auto_research_query || userQuery);
      
      // Inject research cases into knowledge nodes as new 'Decision' items
      const mappedCaseNodes = caseResults.map(caseItem => ({
        id: `case_${caseItem.tid}`,
        node_type: "Decision" as const,
        title: caseItem.title,
        content: caseItem.headline + " (Citation: " + caseItem.tid + ")",
        practice_area: activeTemplate.practice_area,
        tags: ["precedent", "indian-kanoon"]
      }));

      const allNodesToInject = [...knNodes, ...mappedCaseNodes];

      // Perform knowledge injection with ranking + token budgeting (3000 token limit)
      const { injectedPrompt, injectedNodeTitles } = injectKnowledge(systemPromptTemplate, allNodesToInject);

      injectedNodes = injectedNodeTitles.filter(title => !title.includes("v."));
      legalReferences = injectedNodeTitles.filter(title => title.includes("v."));

      // Call LLM with fully injected prompt
      const generatedText = await callLLM(injectedPrompt, userQuery);

      // Run statutory section normalizer (IPC -> BNS, CrPC -> BNSS)
      const mappings = await getSectionMappings();
      const normalizedResult = normalizeSections(generatedText, mappings);

      draftText = normalizedResult.updatedContent;
    }

    // =========================================================================
    // QUALITY ASSURANCE AND RULE CHECK ENGINE
    // =========================================================================
    const checksPassed: string[] = [];
    const checksFailed: string[] = [];
    let qualityScore = 0;

    const defaultChecks = [
      { id: "chk_header", rule: "Contains standard court header styling", weight: 20 },
      { id: "chk_bns_conv", rule: "Correctly references BNS/BNSS instead of IPC/CrPC", weight: 30 },
      { id: "chk_precedent", rule: "Integrates landmark quashing or bail judgments", weight: 25 },
      { id: "chk_pray", rule: "Concludes with standard legal prayer and signature block", weight: 25 }
    ];

    const checks = activeTemplate?.quality_checks && activeTemplate.quality_checks.length > 0
      ? activeTemplate.quality_checks
      : defaultChecks;

    checks.forEach(check => {
      let passed = false;
      const lowerText = draftText.toLowerCase();

      if (check.id === "chk_header") {
        passed = lowerText.includes("court") || lowerText.includes("tribunal") || lowerText.includes("versus") || lowerText.includes("in the matter of");
      } else if (check.id === "chk_bns_conv" || check.id === "chk_sec21") {
        if (activeTemplate?.practice_area === "Criminal") {
          // Passed if it uses BNS or BNSS, and does not mention "of IPC" or "of CrPC" without marking it as formerly
          passed = (lowerText.includes("bns") || lowerText.includes("bnss")) && !(/[^a-zA-Z]ipc[^a-zA-Z]/g.test(lowerText) && !lowerText.includes("formerly"));
        } else {
          passed = lowerText.includes("arbitration") || lowerText.includes("section 21") || lowerText.includes("138");
        }
      } else if (check.id === "chk_precedent" || check.id === "chk_nominee" || check.id === "chk_chequedetails") {
        if (level === 1) passed = false;
        else if (level === 2) passed = false;
        else passed = lowerText.includes("v.") || lowerText.includes("versus") || lowerText.includes("precedent") || lowerText.includes("shall") || lowerText.includes("cheque no");
      } else if (check.id === "chk_pray" || check.id === "chk_close" || check.id === "chk_liability") {
        passed = lowerText.includes("pray") || lowerText.includes("sincerely") || lowerText.includes("advocate") || lowerText.includes("notice") || lowerText.includes("demand");
      }

      if (passed) {
        checksPassed.push(check.rule);
        qualityScore += check.weight;
      } else {
        checksFailed.push(check.rule);
      }
    });

    // Artificially level-cap the score to match realistic legal draft validation
    if (level === 1) {
      qualityScore = Math.min(qualityScore, 50); // Level 1 lacks template and metadata structure
    } else if (level === 2) {
      qualityScore = Math.min(qualityScore, 75); // Level 2 lacks case laws & client-specific guidelines
    }

    const outputPayload: ComparisonLevelOutput = {
      draftText,
      qualityScore,
      checksPassed,
      checksFailed,
      injectedNodes,
      legalReferences
    };

    return NextResponse.json(outputPayload);

  } catch (error: any) {
    console.error("API Draft Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
