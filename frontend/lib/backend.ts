// Server-side helper: talks to the always-on Python backend (backend/server.py), which keeps the
// speech model loaded so jobs start instantly. Starts it automatically when running locally.
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8765";

export const backendDir = path.resolve(process.cwd(), "..", "backend");

declare global {
  var _backendStartedAt: number | undefined;
}

export async function backendUp(timeoutMs = 1200): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Start backend/server.py in the background (at most once every 60 s, local only). */
export function startBackend(): void {
  // If BACKEND_URL points to a remote host (e.g. Cloudflare Pages -> Remote GPU / Tunnel), do not spawn locally
  if (
    BACKEND_URL &&
    !BACKEND_URL.includes("localhost") &&
    !BACKEND_URL.includes("127.0.0.1")
  ) {
    return;
  }

  try {
    const now = Date.now();
    if (global._backendStartedAt && now - global._backendStartedAt < 60_000) return;
    global._backendStartedAt = now;
    const logDir = path.join(backendDir, "data");
    fs.mkdirSync(logDir, { recursive: true });
    const logFd = fs.openSync(path.join(logDir, "server.log"), "a");
    const child = spawn("python", [path.join(backendDir, "server.py")], {
      cwd: backendDir,
      detached: true,
      stdio: ["ignore", logFd, logFd],
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });
    child.unref();
    console.log("[backend] starting always-on Python backend (server.py)");
  } catch (err) {
    console.warn("[backend] Could not start local backend process:", err);
  }
}

/** Send a job to the running backend. Returns false if the backend isn't reachable. */
export async function sendJobToBackend(job: Record<string, any>): Promise<boolean> {
  if (!(await backendUp())) return false;
  try {
    const res = await fetch(`${BACKEND_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
