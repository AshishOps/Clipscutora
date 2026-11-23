import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const filename = searchParams.get("filename");

  if (!jobId || !filename) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  try {
    const remoteVideoUrl = `${BACKEND_URL}/video?job_id=${encodeURIComponent(jobId)}&filename=${encodeURIComponent(filename)}`;
    const forwardHeaders = new Headers();
    const range = req.headers.get("range");
    if (range) {
      forwardHeaders.set("Range", range);
    }

    const upstream = await fetch(remoteVideoUrl, {
      headers: forwardHeaders,
      signal: AbortSignal.timeout(60_000),
    });

    const resHeaders = new Headers();
    resHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "video/mp4");
    if (upstream.headers.get("Content-Length")) {
      resHeaders.set("Content-Length", upstream.headers.get("Content-Length")!);
    }
    if (upstream.headers.get("Content-Range")) {
      resHeaders.set("Content-Range", upstream.headers.get("Content-Range")!);
    }
    resHeaders.set("Accept-Ranges", "bytes");

    return new NextResponse(upstream.body, { status: upstream.status, headers: resHeaders });
  } catch (err: any) {
    return new NextResponse("Video streaming unavailable", { status: 502 });
  }
}
