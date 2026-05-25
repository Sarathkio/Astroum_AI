import { NextRequest, NextResponse } from "next/server";
import { injectKnowledge } from "../../../lib/knowledge";
import { KnowledgeNode } from "../../../types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { systemPromptTemplate, nodes } = body as {
      systemPromptTemplate: string;
      nodes: KnowledgeNode[];
    };

    if (!systemPromptTemplate) {
      return NextResponse.json({ error: "Missing systemPromptTemplate" }, { status: 400 });
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ error: "Missing or invalid nodes array" }, { status: 400 });
    }

    const injectionResult = injectKnowledge(systemPromptTemplate, nodes);
    return NextResponse.json(injectionResult);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
