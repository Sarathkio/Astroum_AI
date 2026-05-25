"use client";

import React, { useState, useEffect } from "react";
import { 
  Scale, 
  Search, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ArrowRightLeft, 
  FolderKanban, 
  CheckCircle2, 
  XCircle,
  BookOpen,
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Zap,
  Award
} from "lucide-react";
import { 
  LegalTemplate, 
  CaseResult, 
  Matter,
  NormalizerAlert,
  ComparisonLevelOutput
} from "../types";

// Static mock matters for ease of testing
const MATTERS: Matter[] = [
  { 
    client_id: "C001", 
    matter_id: "M001", 
    display_name: "Vikram Malhotra v. State (Criminal - 420/120B)", 
    practice_area: "Criminal" 
  },
  { 
    client_id: "C002", 
    matter_id: "M002", 
    display_name: "Astroum Tech v. Zenith Holdings (Corporate - SHA Default)", 
    practice_area: "Corporate" 
  }
];

const KNOWLEDGE_NODES_DATA = {
  "M001": [
    { type: "Client Fact", title: "FIR Registry Details", content: "FIR No. 120/2026 was filed on May 10, 2026, at Patiala House Police Station under Section 420 and Section 120B of the IPC by Rajiv Mehta against Vikram Malhotra." },
    { type: "Client Fact", title: "Business Rivalry Origin", content: "The complainant Rajiv Mehta and applicant Vikram Malhotra were equal shareholders in Astroum Tech. The dispute arose following a board deadlock regarding equity transfer on April 15, 2026." },
    { type: "Constraint", title: "Roots in Society Assertion", content: "The petition must assert that the applicant is a respectable business director of Astroum Tech, has a permanent residence at Vasant Kunj, New Delhi, holds bank accounts and assets in India, and poses zero flight risk." },
    { type: "Anti Pattern", title: "No Liability Admission", content: "Do not mention any mutual settlement agreements or willingness to pay back any disputed amounts in the bail application, as this is often construed by prosecutors as an admission of corporate fraud." }
  ],
  "M002": [
    { type: "Client Fact", title: "Shareholders Agreement Clause 18.2", content: "Client Astroum Tech entered into a Shareholders Agreement (SHA) with Zenith Holdings on October 12, 2024. Clause 18.2 specifies that all disputes arising out of the agreement shall be referred to arbitration in New Delhi." },
    { type: "Constraint", title: "Explicit Dispute Trigger", content: "Clearly specify that the dispute arose due to Zenith Holdings failing to pay the licensing fee of INR 45,00,000 due under Clause 6.1 on March 1, 2026, despite multiple written reminders." },
    { type: "Anti Pattern", title: "No Forgiveness of Interest", content: "Do not waive or forget to claim the 18% per annum compound interest rate on the unpaid licensing fee, as specified in Schedule C." }
  ]
};

export default function BrahmoLegalWorkbench() {
  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Matter and Query State
  const [selectedMatter, setSelectedMatter] = useState<Matter>(MATTERS[0]);
  const [userQuery, setUserQuery] = useState(
    "Petition for anticipatory bail under 438 crpc for my client Vikram Malhotra who was accused of cheating and conspiracy by his business partner Rajiv Mehta under 420/120B IPC"
  );

  // Classification results
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState<{
    practice_area: string;
    document_type: string;
    court_type: string;
    source: string;
  } | null>(null);

  // Database lists (fetched on mount)
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCourtCode, setSelectedCourtCode] = useState<string>("SESSIONS");

  // Output levels state
  const [generating, setGenerating] = useState(false);
  const [level1Data, setLevel1Data] = useState<ComparisonLevelOutput | null>(null);
  const [level2Data, setLevel2Data] = useState<ComparisonLevelOutput | null>(null);
  const [level3Data, setLevel3Data] = useState<ComparisonLevelOutput | null>(null);
  
  // Section mapping alerts and replacement metrics
  const [alerts, setAlerts] = useState<NormalizerAlert[]>([]);
  const [replacedSections, setReplacedSections] = useState<Record<string, string>>({});

  // Research data
  const [researchQuery, setResearchQuery] = useState("");
  const [researchCases, setResearchCases] = useState<CaseResult[]>([]);
  const [searchingKanoon, setSearchingKanoon] = useState(false);

  // Engine status states (matching index.html visual dot status transitions)
  const [engineStatus, setEngineStatus] = useState("Status: Idle");
  const [engineState, setEngineState] = useState<"idle" | "active" | "complete">("idle");

  // Initialize theme and load templates on mount
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const activeTheme = savedTheme || "dark";
    setTheme(activeTheme);
    document.documentElement.setAttribute("data-theme", activeTheme);
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    async function loadConfig() {
      try {
        const res = await fetch("/api/classify-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "init template scan" })
        });
        
        // Fetch templates mock/live
        const templatesRes = await fetch("/api/claude", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userQuery: "mock query check", templateId: "criminal_bail_sessions", level: 1 })
        });
        
        // Set templates
        setTemplates([
          {
            id: "t1",
            template_id: "criminal_bail_sessions",
            jurisdiction: "India",
            practice_area: "Criminal",
            document_type: "Bail Petition",
            court_type: "Sessions Court",
            display_name: "Anticipatory Bail Petition (BNSS 482)",
            system_prompt: "",
            auto_research_query: "Anticipatory Bail Section 482 BNSS quashing",
            quality_checks: [
              { id: "chk_header", rule: "Contains standard court header styling", weight: 20 },
              { id: "chk_bns_conv", rule: "Correctly references BNS/BNSS instead of IPC/CrPC", weight: 30 },
              { id: "chk_precedent", rule: "Integrates landmark quashing or bail judgments", weight: 25 },
              { id: "chk_pray", rule: "Concludes with standard legal prayer and signature block", weight: 25 }
            ]
          },
          {
            id: "t2",
            template_id: "corporate_arbitration_invoke",
            jurisdiction: "India",
            practice_area: "Corporate",
            document_type: "Arbitration Notice",
            court_type: "High Court",
            display_name: "Arbitration Clause Invoke Notice",
            system_prompt: "",
            auto_research_query: "Notice invoking arbitration Section 21",
            quality_checks: [
              { id: "chk_header", rule: "Notice contains sender and recipient addresses", weight: 20 },
              { id: "chk_sec21", rule: "Explicitly references Section 21 invocation", weight: 30 },
              { id: "chk_nominee", rule: "Proposes a sole arbitrator and sets 30-day timeline", weight: 30 },
              { id: "chk_close", rule: "Signed by legal counsel on behalf of claimant", weight: 20 }
            ]
          },
          {
            id: "t3",
            template_id: "cheque_bounce_138",
            jurisdiction: "India",
            practice_area: "Criminal",
            document_type: "Cheque Bounce Notice",
            court_type: "District Court",
            display_name: "Section 138 NI Act Legal Notice",
            system_prompt: "",
            auto_research_query: "Section 138 NI Act cheque dishonour",
            quality_checks: [
              { id: "chk_header", rule: "Contains addressee details", weight: 20 },
              { id: "chk_timeline", rule: "Includes mandatory 15-day statutory demand timeline", weight: 30 },
              { id: "chk_chequedetails", rule: "Includes cheque details and bounce memo date", weight: 30 },
              { id: "chk_liability", rule: "Asserts legally enforceable debt liability", weight: 20 }
            ]
          }
        ]);
        setSelectedTemplateId("criminal_bail_sessions");
      } catch (e) {
        console.error("Mount config failed:", e);
      }
    }
    loadConfig();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMatterChange = (matter: Matter) => {
    setSelectedMatter(matter);
    
    // Reset workbench outputs
    setLevel1Data(null);
    setLevel2Data(null);
    setLevel3Data(null);
    setAlerts([]);
    setReplacedSections({});
    setClassification(null);
    setEngineStatus("Status: Idle");
    setEngineState("idle");

    if (matter.practice_area === "Criminal") {
      setUserQuery("Petition for anticipatory bail under 438 crpc for my client Vikram Malhotra who was accused of cheating and conspiracy by his business partner Rajiv Mehta under 420/120B IPC");
      setSelectedTemplateId("criminal_bail_sessions");
      setSelectedCourtCode("SESSIONS");
    } else {
      setUserQuery("Notice invoking arbitration under shareholders agreement SHA between Astroum Tech and Zenith Holdings due to default of payment of Rs. 45,00,000 licensing fee under clause 6.1");
      setSelectedTemplateId("corporate_arbitration_invoke");
      setSelectedCourtCode("HC");
    }
  };

  // Run Classification API
  const handleClassify = async () => {
    setClassifying(true);
    setClassification(null);
    try {
      const res = await fetch("/api/classify-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Classification failed");
      
      setClassification(data);
      
      // Auto set matching template
      const matched = templates.find(t => 
        t.practice_area.toLowerCase() === data.practice_area.toLowerCase() &&
        t.document_type.toLowerCase() === data.document_type.toLowerCase()
      );
      if (matched) {
        setSelectedTemplateId(matched.template_id);
      }

      // Auto set court format
      if (data.court_type.toLowerCase().includes("supreme")) setSelectedCourtCode("SC");
      else if (data.court_type.toLowerCase().includes("high")) setSelectedCourtCode("HC");
      else if (data.court_type.toLowerCase().includes("sessions")) setSelectedCourtCode("SESSIONS");
      else if (data.court_type.toLowerCase().includes("nclt")) setSelectedCourtCode("NCLT");
      else setSelectedCourtCode("SESSIONS");

    } catch (e: any) {
      console.error(e);
      // Local rule classification fallback
      const lower = userQuery.toLowerCase();
      const fallbackClass = lower.includes("arbitration")
        ? { practice_area: "Corporate", document_type: "Arbitration Notice", court_type: "High Court", source: "Local Client-Side Fallback" }
        : { practice_area: "Criminal", document_type: "Bail Petition", court_type: "Sessions Court", source: "Local Client-Side Fallback" };
      
      setClassification(fallbackClass);
    } finally {
      setClassifying(false);
    }
  };

  // Run Indian Kanoon Research Log manually
  const handleResearchKanoon = async () => {
    if (!researchQuery) return;
    setSearchingKanoon(true);
    try {
      const res = await fetch("/api/indian-kanoon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: researchQuery })
      });
      const data = await res.json();
      if (data && data.results) {
        setResearchCases(data.results);
      }
    } catch (e) {
      console.error("Kanoon research failed:", e);
    } finally {
      setSearchingKanoon(false);
    }
  };

  // Run Generation Pipeline
  const handleGenerateCompare = async () => {
    setGenerating(true);
    setLevel1Data(null);
    setLevel2Data(null);
    setLevel3Data(null);
    setAlerts([]);
    setReplacedSections({});
    setEngineStatus("Status: Injecting Knowledge & Precedents...");
    setEngineState("active");

    const activeTemplate = templates.find(t => t.template_id === selectedTemplateId);
    if (activeTemplate) {
      setResearchQuery(activeTemplate.auto_research_query);
    }

    try {
      // 1. Generate Level 1 (Generic)
      const res1 = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery,
          templateId: selectedTemplateId,
          level: 1,
          clientId: selectedMatter.client_id,
          matterId: selectedMatter.matter_id,
          courtCode: selectedCourtCode
        })
      });
      const l1 = await res1.json();
      setLevel1Data(l1);

      // 2. Generate Level 2 (Template-Only)
      const res2 = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery,
          templateId: selectedTemplateId,
          level: 2,
          clientId: selectedMatter.client_id,
          matterId: selectedMatter.matter_id,
          courtCode: selectedCourtCode
        })
      });
      const l2 = await res2.json();
      setLevel2Data(l2);

      // Update status to Normalizing
      setEngineStatus("Status: Normalizing statutory citations...");

      // 3. Generate Level 3 (Template + Knowledge + Kanoon)
      const res3 = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery,
          templateId: selectedTemplateId,
          level: 3,
          clientId: selectedMatter.client_id,
          matterId: selectedMatter.matter_id,
          courtCode: selectedCourtCode
        })
      });
      const l3 = await res3.json();
      setLevel3Data(l3);

      // Fetch normalizer replacements & alerts for UI logging from Level 3 result
      const normalizerRes = await fetch("/api/normalize-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: l3.draftText })
      });
      const normData = await normalizerRes.json();
      if (normData) {
        setAlerts(normData.alerts || []);
        setReplacedSections(normData.replacedSections || {});
      }

      // Fetch research logs
      if (activeTemplate) {
        const kanoonRes = await fetch("/api/indian-kanoon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: activeTemplate.auto_research_query })
        });
        const kanoonData = await kanoonRes.json();
        if (kanoonData && kanoonData.results) {
          setResearchCases(kanoonData.results);
        }
      }

      setEngineStatus("Status: Drafting Complete");
      setEngineState("complete");

    } catch (e) {
      console.error("Drafting comparison chain failed:", e);
      setEngineStatus("Status: Error generating drafts");
      setEngineState("idle");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-100">
      {/* HEADER / NAVBAR */}
      <header className="header-blur sticky top-0 z-50 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brandBlue to-brandPurple rounded-xl text-slate-950 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5 text-white">
              <span>BRAHMO</span>
              <span className="gradient-text-blue-purple font-normal">India Legal</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Option C: Criminal + Corporate AI Drafting Workbench</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* THEME TOGGLE */}
          <button className="theme-toggle-btn" onClick={toggleTheme} id="theme-btn" aria-label="Toggle theme">
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* ACTIVE MATTER SELECTOR */}
          <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/80 self-start sm:self-auto shadow-inner">
            <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1.5 shrink-0">
              <FolderKanban className="w-4 h-4 text-purple-400" /> Active Case:
            </span>
            <div className="relative flex items-center">
              <select 
                id="matter-select" 
                value={selectedMatter.matter_id}
                onChange={(e) => {
                  const mat = MATTERS.find(m => m.matter_id === e.target.value);
                  if (mat) handleMatterChange(mat);
                }} 
                className="bg-slate-950 border border-slate-800/80 text-xs font-semibold py-1.5 px-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer custom-select text-slate-200"
              >
                {MATTERS.map(m => (
                  <option key={m.matter_id} value={m.matter_id}>{m.display_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-6 pt-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="hero-badge text-[10px] uppercase tracking-wider">
                <Shield className="w-3 h-3 text-purple-400" /> Advanced Drafting Workspace
              </span>
              <span className="text-[10px] bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Sandbox
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white mt-1">
              Indian Kanoon Integration & Statutory Normalizer
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Evaluate legal draft alignment across three distinct architectural depths. Compare generic outputs, standard formats, and target context-injected, precedent-aware drafting models.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-3 rounded-xl border border-slate-900/60 shadow-inner relative z-10 shrink-0">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Knowledge Engine</span>
              <span className="text-xs text-white font-medium">BNS + BNSS Codified</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* LEFT PANEL */}
        <div className="xl:col-span-1 flex flex-col gap-6">

          {/* Query Analyzer */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold tracking-wider text-purple-400 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brandBlue" /> 1. Query Analyzer
              </h3>
              <span className="text-[9px] bg-brandBlue/10 text-brandBlue px-2 py-0.5 rounded border border-brandBlue/20 font-semibold">Auto-Detect</span>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-medium">Explain facts or request draft:</label>
              <textarea 
                id="query-input" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full h-32 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500/40 focus:outline-none text-slate-200 leading-relaxed font-sans custom-textarea" 
                placeholder="Describe the dispute or citation..."
              />
            </div>

            <button 
              onClick={handleClassify} 
              disabled={classifying || !userQuery}
              className="w-full py-2.5 btn-glass text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {classifying ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500"></span> 
                  Classifying...
                </span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-purple-400" />
                  Analyze & Auto-Classify
                </>
              )}
            </button>

            {classification && (
              <div id="class-results" className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 fade-in">
                <div className="text-[10px] text-purple-400 font-bold tracking-wider uppercase">Detected Parameters:</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Practice Area</span>
                    <span id="class-area" className="font-bold text-slate-200">{classification.practice_area}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Document Type</span>
                    <span id="class-doc" className="font-bold text-slate-200">{classification.document_type}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-900 mt-1 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Court Category</span>
                      <span id="class-court" className="font-bold text-slate-200">{classification.court_type}</span>
                    </div>
                    <span className="bg-purple-500/10 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/20">
                      {classification.source}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Config & Generate */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
            <h3 className="text-xs font-bold tracking-wider text-purple-400 uppercase flex items-center gap-2 border-b border-slate-900 pb-3">
              <FileText className="w-4 h-4 text-brandBlue" /> 2. Manual Config Overrides
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-medium">Select Template:</label>
              <div className="relative flex items-center">
                <select 
                  id="template-select" 
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer text-slate-200 custom-select"
                >
                  {templates
                    .filter(t => t.practice_area === selectedMatter.practice_area)
                    .map(t => (
                      <option key={t.template_id} value={t.template_id}>{t.display_name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400 font-medium">Court Formats:</label>
              <div className="relative flex items-center">
                <select 
                  id="court-select" 
                  value={selectedCourtCode}
                  onChange={(e) => setSelectedCourtCode(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer text-slate-200 custom-select"
                >
                  <option value="SESSIONS">Sessions Court (SESSIONS)</option>
                  <option value="HC">High Court (HC)</option>
                  <option value="SC">Supreme Court (SC)</option>
                  <option value="NCLT">Company Law Tribunal (NCLT)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerateCompare} 
              disabled={generating || !userQuery}
              className="w-full py-3 btn-gradient text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-950"></span>
                  Generating...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Evaluate & Generate Drafts
                </>
              )}
            </button>
          </div>

          {/* Statutory Alerts */}
          {alerts.length > 0 && (
            <div id="statutory-alerts-panel" className="glass-panel p-5 rounded-2xl border-amber-500/20 bg-amber-500/5 flex flex-col gap-3 shadow-xl fade-in">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Statutory Penal Alerts</h4>
              </div>
              <div id="alerts-list" className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {alerts.map((alert, index) => (
                  <div key={index} className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed">
                    <span className="text-amber-400 font-bold block mb-1">
                      Section {alert.section} {alert.oldAct} → Section {alert.newSection} {alert.newAct}
                    </span>
                    <span className="text-slate-300">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div className="xl:col-span-3 flex flex-col gap-6">

          {/* Comparison Container */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-905">

            <div className="bg-slate-950/50 p-4 border-b border-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-200">Three-Level Comparative Workbench</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`status-dot ${engineState}`} />
                <span id="engine-status" className={`text-[10px] font-medium ${
                  engineState === "active" ? "text-amber-400 animate-pulse" :
                  engineState === "complete" ? "text-emerald-400 font-semibold" : "text-slate-500"
                }`}>
                  {engineStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-900 min-h-[500px]">

              {/* LEVEL 1 */}
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[9px] bg-slate-950 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-800">LEVEL 1</span>
                    <h3 className="text-xs font-bold text-slate-300 mt-1">Generic AI Output</h3>
                  </div>
                  {level1Data && (
                    <div id="l1-score-wrapper" className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-500 block font-semibold uppercase tracking-wider mb-1">Score</span>
                      <span id="l1-score" className="text-xs font-bold text-rose-500 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
                        {level1Data.qualityScore}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  {!level1Data ? (
                    <div id="l1-empty" className="text-center py-12 text-slate-600 text-xs italic">
                      {generating ? "Generating draft..." : "Click Generate to start"}
                    </div>
                  ) : (
                    <>
                      <div id="l1-text" className="text-area-viewer p-4 text-[11px] leading-relaxed text-slate-400 h-[380px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                        {level1Data.draftText}
                      </div>
                      <div id="l1-rules" className="flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold">Rules Assessment:</span>
                        <div id="l1-rules-list" className="flex flex-wrap gap-1">
                          {level1Data.checksFailed.map((rule, idx) => (
                            <span key={idx} className="bg-rose-500/10 text-rose-400 text-[9px] px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" /> {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* LEVEL 2 */}
              <div className="p-5 flex flex-col gap-4 bg-slate-950/10">
                <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[9px] bg-slate-950 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-800">LEVEL 2</span>
                    <h3 className="text-xs font-bold text-slate-300 mt-1">Template Format Only</h3>
                  </div>
                  {level2Data && (
                    <div id="l2-score-wrapper" className="flex flex-col items-end">
                      <span className="text-[9px] text-slate-500 block font-semibold uppercase tracking-wider mb-1">Score</span>
                      <span id="l2-score" className="text-xs font-bold text-amber-500 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                        {level2Data.qualityScore}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  {!level2Data ? (
                    <div id="l2-empty" className="text-center py-12 text-slate-600 text-xs italic">
                      {generating ? "Generating draft..." : "Click Generate to start"}
                    </div>
                  ) : (
                    <>
                      <div id="l2-text" className="text-area-viewer p-4 text-[11px] leading-relaxed text-slate-300 h-[380px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                        {level2Data.draftText}
                      </div>
                      <div id="l2-rules" className="flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold">Assessment Rules:</span>
                        <div id="l2-rules-list" className="flex flex-wrap gap-1">
                          {level2Data.checksPassed.map((rule, idx) => (
                            <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {rule}
                            </span>
                          ))}
                          {level2Data.checksFailed.map((rule, idx) => (
                            <span key={idx} className="bg-rose-500/10 text-rose-400 text-[9px] px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" /> {rule}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* LEVEL 3 */}
              <div className="p-5 flex flex-col gap-4 premium-glow-panel rounded-r-2xl">
                <div className="flex justify-between items-start border-b border-slate-900/60 pb-3">
                  <div>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/30">LEVEL 3</span>
                    <h3 className="text-xs font-bold text-white mt-1 flex items-center gap-1.5">
                      Full Knowledge & Research
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                    </h3>
                  </div>
                  {level3Data && (
                    <div id="l3-score-wrapper" className="flex flex-col items-end">
                      <span className="text-[9px] text-purple-400 block font-bold uppercase tracking-wider mb-1">Score</span>
                      <span id="l3-score" className="text-xs font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        {level3Data.qualityScore}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  {!level3Data ? (
                    <div id="l3-empty" className="text-center py-12 text-slate-600 text-xs italic">
                      {generating ? "Generating draft..." : "Click Generate to start"}
                    </div>
                  ) : (
                    <>
                      <div id="l3-text" className="text-area-viewer level3-viewer p-4 text-[11.5px] leading-relaxed text-slate-200 h-[380px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                        {level3Data.draftText}
                      </div>
                      <div id="l3-details" className="flex flex-col gap-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block mb-1">Passed Standards:</span>
                          <div id="l3-rules-list" className="flex flex-wrap gap-1">
                            {level3Data.checksPassed.map((rule, idx) => (
                              <span key={idx} className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> {rule}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-900/60 pt-2.5">
                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold block mb-1">Injected Facts & Rules</span>
                            <div id="l3-injected-nodes" className="flex flex-col gap-1 mt-1">
                              {level3Data.injectedNodes.map((node, idx) => (
                                <span key={idx} className="text-[9.5px] text-slate-300 truncate" title={node}>⚙️ {node}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-semibold block mb-1">Verified Citations</span>
                            <div id="l3-legal-refs" className="flex flex-col gap-1 mt-1 text-purple-400 font-medium">
                              {level3Data.legalReferences.map((ref, idx) => (
                                <span key={idx} className="text-[9.5px] text-amber-500 truncate" title={ref}>📜 {ref}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Lower Index */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Kanoon Logs */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Indian Kanoon API Cache Logs</h3>
                </div>
                <span id="cache-count" className="text-[9px] text-slate-400 font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                  {researchCases.length} Cases Cached
                </span>
              </div>
              <div className="flex gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <input 
                  id="research-query-input" 
                  type="text" 
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  placeholder="Query Indian Kanoon..." 
                  className="flex-1 bg-transparent border-0 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:ring-0" 
                  style={{ color: "var(--text-primary)" }}
                />
                <button 
                  onClick={handleResearchKanoon} 
                  disabled={searchingKanoon}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-lg shadow-purple-500/10 shrink-0"
                >
                  {searchingKanoon ? "Searching..." : "Search"}
                </button>
              </div>
              <div id="kanoon-cache-list" className="flex flex-col gap-2.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {researchCases.length > 0 ? (
                  researchCases.map((c, index) => (
                    <div key={index} className="bg-slate-900/60 p-2.5 rounded border border-slate-900 text-xs">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="font-bold text-slate-200">{c.title}</span>
                        <span className="bg-slate-850 text-[9px] text-slate-400 px-1 rounded shrink-0">{c.docsource}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{c.headline}</p>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-600 italic py-4 text-center">No cases currently cached. Try running a draft generation.</span>
                )}
              </div>
            </div>

            {/* Knowledge Index */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Matter Knowledge Node Index</h3>
                </div>
                <span 
                  id="knowledge-badge" 
                  className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full ${
                    selectedMatter.practice_area === "Criminal" 
                      ? "text-slate-400 bg-slate-900 border border-slate-800" 
                      : "text-emerald-400 bg-emerald-950/20 border border-emerald-900/30"
                  }`}
                >
                  {selectedMatter.practice_area} Law
                </span>
              </div>
              <div id="knowledge-nodes-list" className="flex flex-col gap-2.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {KNOWLEDGE_NODES_DATA[selectedMatter.matter_id as "M001" | "M002"]?.map((node, idx) => {
                  let badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  if (node.type === "Constraint") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  else if (node.type === "Anti Pattern") badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                  
                  return (
                    <div key={idx} className="p-2.5 bg-slate-900/40 border border-slate-900 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-200">{node.title}</span>
                        <span className={`text-[9px] font-semibold px-1 rounded border ${badgeColor}`}>{node.type}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{node.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top-row">
            <span>BRAHMO India Legal Platform &copy; 2026. Custom designed with active Next.js App Router API nodes.</span>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <span>&bull;</span>
              <a href="#">Terms of Service</a>
              <span>&bull;</span>
              <a href="#">API Logs</a>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-dev-row">
            <span>Designed &amp; Developed by</span>
            <span className="footer-dev-name">Sarathkumar</span>
            <span className="footer-dot"></span>
            <span>Software Developer</span>
            <span className="footer-dot"></span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
