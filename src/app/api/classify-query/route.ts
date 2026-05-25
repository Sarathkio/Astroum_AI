import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "../../../lib/llm";

// Keyword rule-engine fallback
function keywordClassification(query: string) {
  const q = query.toLowerCase();
  
  let practiceArea: "Criminal" | "Corporate" = "Criminal";
  let documentType = "Bail Petition";
  let courtType = "Sessions Court";

  // Practice area detection
  if (
    q.includes("arbitration") ||
    q.includes("shareholder") ||
    q.includes("contract") ||
    q.includes("corporate") ||
    q.includes("board resolution") ||
    q.includes("licensing") ||
    q.includes("merger") ||
    q.includes("nclt")
  ) {
    practiceArea = "Corporate";
  }

  // Document type detection
  if (q.includes("bail") || q.includes("anticipatory")) {
    documentType = "Bail Petition";
  } else if (q.includes("arbitration") || q.includes("clause 21") || q.includes("invoke")) {
    documentType = "Arbitration Notice";
  } else if (q.includes("cheque") || q.includes("138") || q.includes("negotiable")) {
    documentType = "Cheque Bounce Notice";
  } else if (practiceArea === "Corporate") {
    documentType = "Arbitration Notice";
  }

  // Court type detection
  if (q.includes("supreme court") || q.includes("sc ")) {
    courtType = "Supreme Court";
  } else if (q.includes("high court") || q.includes("hc ")) {
    courtType = "High Court";
  } else if (q.includes("nclt") || q.includes("tribunal")) {
    courtType = "NCLT";
  } else if (q.includes("district") || q.includes("magistrate") || q.includes("sessions")) {
    courtType = q.includes("sessions") ? "Sessions Court" : "District Court";
  } else {
    courtType = practiceArea === "Criminal" ? "Sessions Court" : "High Court";
  }

  return { practiceArea, documentType, courtType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid query parameter" }, { status: 400 });
    }

    // Attempt AI-based classification if environment keys exist
    const hasKeys = process.env.GEMINI_API_KEY || process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY;
    
    if (hasKeys) {
      try {
        const systemPrompt = `You are a legal query classifier. Classify the user query into the following JSON format:
{
  "practiceArea": "Criminal" | "Corporate",
  "documentType": "Bail Petition" | "Arbitration Notice" | "Cheque Bounce Notice",
  "courtType": "Supreme Court" | "High Court" | "Sessions Court" | "District Court" | "NCLT"
}

Query rules:
- Criminal covers bail, FIRs, cheating, IPC, CrPC, NI Act 138.
- Corporate covers contract disputes, arbitration notice, board resolutions, shareholders agreements.

Return ONLY raw valid JSON. Do not include markdown code block syntax.`;

        const llmResponseText = await callLLM(systemPrompt, `Classify this query: "${query}"`);
        const jsonText = llmResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed.practiceArea && parsed.documentType && parsed.courtType) {
          return NextResponse.json({
            practice_area: parsed.practiceArea,
            document_type: parsed.documentType,
            court_type: parsed.courtType,
            source: "AI"
          });
        }
      } catch (err) {
        console.warn("AI Classification failed, using keyword engine:", err);
      }
    }

    // Fall back to keyword classification rules
    const kwResult = keywordClassification(query);
    return NextResponse.json({
      practice_area: kwResult.practiceArea,
      document_type: kwResult.documentType,
      court_type: kwResult.courtType,
      source: "Keyword Fallback"
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
