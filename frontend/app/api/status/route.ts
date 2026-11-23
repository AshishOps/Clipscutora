import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId query parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/get_status?job_id=${encodeURIComponent(jobId)}`, {
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.clips)) {
        data.clips = data.clips.map((c: any) => ({
          ...c,
          url: c.url || `/api/video?jobId=${jobId}&filename=${encodeURIComponent(c.filename)}`,
        }));
      }
      return NextResponse.json(data);
    }
  } catch (e: any) {
    console.warn("Failed to fetch remote status:", e);
  }

  return NextResponse.json({
    job_id: jobId,
    status: "processing",
    stage: "Processing video pipeline...",
    progress: 15,
    clips: [],
  });
}
