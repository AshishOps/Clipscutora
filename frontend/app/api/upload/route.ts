import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

export const runtime = "nodejs";

// Streams an uploaded video straight to disk or forwards to the remote backend.
export async function POST(req: NextRequest) {
  const rawName = new URL(req.url).searchParams.get("name") || "upload.mp4";
  const ext = path.extname(rawName).toLowerCase();
  if (![".mp4", ".mov", ".mkv", ".webm", ".m4v"].includes(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (!req.body) {
    return NextResponse.json({ error: "Empty upload" }, { status: 400 });
  }

  const backendUrl =
    process.env.MODAL_API_URL ||
    (process.env.BACKEND_URL &&
    !process.env.BACKEND_URL.includes("localhost") &&
    !process.env.BACKEND_URL.includes("127.0.0.1")
      ? process.env.BACKEND_URL
      : null);

  // If running with a remote backend (Cloudflare Pages -> Cloud GPU / Tunnel)
  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl}/upload?name=${encodeURIComponent(rawName)}`, {
        method: "POST",
        body: req.body,
        // @ts-ignore
        duplex: "half",
        headers: {
          "Content-Type": req.headers.get("Content-Type") || "application/octet-stream",
        },
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "Failed to upload to remote backend" }, { status: 502 });
    }
  }

  const safeBase = path.basename(rawName, ext).replace(/[^\w\- .]/g, "_").slice(0, 80) || "upload";
  const dir = path.resolve(process.cwd(), "..", "backend", "data", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${Date.now()}_${safeBase}${ext}`);

  try {
    await pipeline(Readable.fromWeb(req.body as any), fs.createWriteStream(dest));
  } catch (e: any) {
    fs.rmSync(dest, { force: true });
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
  return NextResponse.json({ path: dest });
}
