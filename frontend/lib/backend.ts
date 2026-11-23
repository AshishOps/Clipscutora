// Client/Edge helper: talks to the Python backend over HTTP
export const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8765";

export async function backendUp(timeoutMs = 1500): Promise<boolean> {
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

/** Send a job to the running backend. Returns false if the backend isn't reachable. */
export async function sendJobToBackend(job: Record<string, any>): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
