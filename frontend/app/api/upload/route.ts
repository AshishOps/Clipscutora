import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export const runtime = "edge";

// Streams an uploaded video straight to the backend server.
export async function POST(req: NextRequest) {
  const rawName = new URL(req.url).searchParams.get("name") || "upload.mp4";
  const ext = rawName.slice(rawName.lastIndexOf(".")).toLowerCase();

  if (![".mp4", ".mov", ".mkv", ".webm", ".m4v"].includes(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ error: "Empty upload" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/upload?name=${encodeURIComponent(rawName)}`, {
      method: "POST",
      body: req.body,
      // @ts-ignore Web standards fetch duplex
      duplex: "half",
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/octet-stream",
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to upload video to backend" },
      { status: 502 }
    );
  }
}
