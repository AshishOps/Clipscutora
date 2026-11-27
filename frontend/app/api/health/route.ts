import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export const runtime = "edge";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    // offline
  }
  return NextResponse.json({ ok: false, model_ready: false, queued: 0, running: null }, { status: 502 });
}
