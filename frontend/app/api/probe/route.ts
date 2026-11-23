import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export const runtime = "edge";

// Reads a video's title, length and live status before a job starts.
export async function GET(req: NextRequest) {
  const source = (new URL(req.url).searchParams.get("source") || "").trim();
  if (!source) {
    return NextResponse.json({ error: "Missing source" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/probe?source=${encodeURIComponent(source)}`, {
      signal: AbortSignal.timeout(120_000),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: data.error ? 422 : 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to contact video analysis backend" },
      { status: 502 }
    );
  }
}
