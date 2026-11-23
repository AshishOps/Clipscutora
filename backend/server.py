"""Clipscutora Backend Server: keeps Whisper model in memory and serves HTTP API.

    python server.py            # listens on http://0.0.0.0:8765

Endpoints:
    GET  /health                -> {"ok": true, "model_ready": bool, "queued": n, "running": job_id|null}
    GET  /probe?source=...      -> video title / length / live status
    POST /jobs                  -> submit job payload {"job_id", "source", ...}
    GET  /get_status?job_id=... -> real-time job status / manifest
    GET  /video?job_id=...&filename=... -> stream output MP4 video
"""
import asyncio
import inspect
import json
import logging
import os
import queue
import shutil
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import config  # noqa: E402
from app import run_pipeline, update_status  # noqa: E402
from pipeline.download import probe_source  # noqa: E402

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8765"))
logger = logging.getLogger("clipscutora.server")

_jobs: "queue.Queue[dict]" = queue.Queue()
_state = {"model_ready": False, "running": None}
_PIPELINE_ARGS = set(inspect.signature(run_pipeline).parameters)


def _warm_up() -> None:
    """Load Whisper (and check the GPU encoder) before the first job arrives."""
    try:
        from pipeline.transcribe import _load_model, _language_id_model
        from pipeline.reframe import _video_encoder_args
        model, device = _load_model()
        _language_id_model(model, device)
        _video_encoder_args()
        _state["model_ready"] = True
        logger.info("Warm-up done: speech model is loaded and ready.")
    except Exception as e:
        logger.warning(f"Warm-up failed (jobs will still load model on demand): {e}")


def _worker() -> None:
    while True:
        job = _jobs.get()
        job_id = job["job_id"]
        _state["running"] = job_id
        job_dir = config.DATA_DIR / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        handler = logging.FileHandler(job_dir / "process.log", encoding="utf-8")
        handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
        logging.getLogger().addHandler(handler)
        try:
            kwargs = {k: v for k, v in job.items() if k in _PIPELINE_ARGS}
            asyncio.run(run_pipeline(**kwargs))
        except Exception as e:
            logger.exception(f"Job {job_id} crashed: {e}")
            update_status(job_id, "Failed", 0, status="failed", error=str(e))
        finally:
            logging.getLogger().removeHandler(handler)
            handler.close()
            _state["running"] = None
            _jobs.task_done()


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, data: dict) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.end_headers()

    def log_message(self, *args) -> None:
        pass

    def do_GET(self) -> None:
        url = urlparse(self.path)
        qs = parse_qs(url.query)

        if url.path == "/health":
            return self._send(200, {
                "ok": True,
                "model_ready": _state["model_ready"],
                "queued": _jobs.qsize(),
                "running": _state["running"]
            })

        if url.path == "/probe":
            source = (qs.get("source") or [""])[0]
            if not source:
                return self._send(400, {"error": "Missing source"})
            try:
                return self._send(200, probe_source(source))
            except Exception as e:
                return self._send(422, {"error": str(e)[:400]})

        if url.path in ("/get_status", "/status"):
            job_id = (qs.get("job_id") or qs.get("jobId") or [""])[0]
            if not job_id:
                return self._send(400, {"error": "Missing job_id"})
            manifest_file = config.OUTPUT_DIR / job_id / "clips.json"
            if manifest_file.exists():
                try:
                    with open(manifest_file, "r", encoding="utf-8") as f:
                        clips = json.load(f)
                    return self._send(200, {
                        "job_id": job_id,
                        "status": "completed",
                        "stage": "Completed",
                        "progress": 100,
                        "clips": clips
                    })
                except Exception:
                    pass
            status_file = config.DATA_DIR / job_id / "status.json"
            if status_file.exists():
                try:
                    with open(status_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    return self._send(200, data)
                except Exception:
                    pass
            return self._send(200, {
                "job_id": job_id,
                "status": "processing",
                "stage": "Processing video pipeline...",
                "progress": 15,
                "clips": []
            })

        if url.path == "/video":
            job_id = (qs.get("job_id") or qs.get("jobId") or [""])[0]
            filename = (qs.get("filename") or [""])[0]
            if not job_id or not filename:
                return self._send(400, {"error": "Missing parameters"})
            safe_filename = Path(filename).name
            safe_job_id = Path(job_id).name
            video_path = config.OUTPUT_DIR / safe_job_id / safe_filename
            if not video_path.exists():
                return self._send(404, {"error": "Video not found"})

            file_size = video_path.stat().st_size
            range_header = self.headers.get("Range")
            if range_header:
                try:
                    range_val = range_header.replace("bytes=", "").split("-")
                    start = int(range_val[0])
                    end = int(range_val[1]) if range_val[1] else file_size - 1
                    content_length = end - start + 1
                    self.send_response(206)
                    self.send_header("Content-Type", "video/mp4")
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                    self.send_header("Content-Length", str(content_length))
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    with open(video_path, "rb") as f:
                        f.seek(start)
                        self.wfile.write(f.read(content_length))
                    return
                except Exception:
                    pass

            self.send_response(200)
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Content-Length", str(file_size))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            with open(video_path, "rb") as f:
                shutil.copyfileobj(f, self.wfile)
            return

        self._send(404, {"error": "Not found"})

    def do_POST(self) -> None:
        url = urlparse(self.path)
        qs = parse_qs(url.query)

        if url.path == "/upload":
            raw_name = (qs.get("name") or ["upload.mp4"])[0]
            ext = Path(raw_name).suffix.lower()
            safe_base = Path(raw_name).stem[:80] or "upload"
            upload_dir = config.DATA_DIR / "uploads"
            upload_dir.mkdir(parents=True, exist_ok=True)
            dest = upload_dir / f"{int(asyncio.get_event_loop().time() * 1000) if False else int(__import__('time').time() * 1000)}_{safe_base}{ext}"
            try:
                length = int(self.headers.get("Content-Length") or 0)
                if length > 0:
                    with open(dest, "wb") as f:
                        remaining = length
                        while remaining > 0:
                            chunk = self.rfile.read(min(remaining, 65536))
                            if not chunk:
                                break
                            f.write(chunk)
                            remaining -= len(chunk)
                else:
                    with open(dest, "wb") as f:
                        shutil.copyfileobj(self.rfile, f)
                return self._send(200, {"path": str(dest)})
            except Exception as e:
                if dest.exists():
                    dest.unlink(missing_ok=True)
                return self._send(500, {"error": str(e)})

        if url.path not in ("/jobs", "/submit_job"):
            return self._send(404, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
            job = json.loads(self.rfile.read(length) or b"{}")
        except Exception:
            return self._send(400, {"error": "Invalid JSON"})
        if not job.get("job_id") or not job.get("source"):
            return self._send(400, {"error": "job_id and source are required"})
        if not str(job["job_id"]).replace("_", "").isalnum():
            return self._send(400, {"error": "Invalid job_id"})
        update_status(job["job_id"], "Queued", 2, status="processing")
        _jobs.put(job)
        self._send(200, {"queued": True, "position": _jobs.qsize()})


def main() -> None:
    threading.Thread(target=_warm_up, daemon=True).start()
    threading.Thread(target=_worker, daemon=True).start()
    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError:
        print(f"Clipscutora backend is already running on http://{HOST}:{PORT}")
        return
    print(f"Clipscutora backend ready on http://{HOST}:{PORT} (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
