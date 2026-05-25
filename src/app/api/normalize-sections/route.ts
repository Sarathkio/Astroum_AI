import { NextRequest, NextResponse } from "next/server";
import { getSectionMappings } from "../../../lib/supabase";
import { normalizeSections } from "../../../lib/normalizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing or invalid content parameter" }, { status: 400 });
    }

    // 1. Fetch section mappings from Database
    const mappings = await getSectionMappings();

    // 2. Perform normalization replacement and compile alerts
    const normalized = normalizeSections(content, mappings);

    return NextResponse.json(normalized);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
