import { NextRequest, NextResponse } from "next/server";
import { searchCases, getCaseMeta } from "../../../lib/kanoon";

// POST /api/indian-kanoon -> search
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid query parameter" }, { status: 400 });
    }

    const results = await searchCases(query);
    return NextResponse.json({ results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

// GET /api/indian-kanoon?docId=... -> docmeta
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const docIdStr = searchParams.get("docId");

    if (!docIdStr) {
      return NextResponse.json({ error: "Missing docId parameter" }, { status: 400 });
    }

    const docId = parseInt(docIdStr, 10);
    if (isNaN(docId)) {
      return NextResponse.json({ error: "Invalid docId format" }, { status: 400 });
    }

    const caseMeta = await getCaseMeta(docId);
    if (!caseMeta) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseMeta);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
