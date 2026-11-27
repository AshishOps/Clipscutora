"""Cooperative & subprocess job cancellation registry."""
import contextvars
import logging
import subprocess
import threading
import time
from typing import Any, Dict, List, Optional, Set

logger = logging.getLogger("viral_clipper.job_control")

_CURRENT_JOB: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar("current_job_id", default=None)
_lock = threading.Lock()
_cancelled: Set[str] = set()
_active_procs: Dict[str, Set[subprocess.Popen]] = {}


class JobCancelledError(Exception):
    """Raised when a job is stopped by the user."""


def set_current_job(job_id: Optional[str]) -> contextvars.Token:
    return _CURRENT_JOB.set(job_id)


def reset_current_job(token: contextvars.Token) -> None:
    _CURRENT_JOB.reset(token)


def get_current_job() -> Optional[str]:
    return _CURRENT_JOB.get()


def is_cancelled(job_id: Optional[str] = None) -> bool:
    jid = job_id or _CURRENT_JOB.get()
    if not jid:
        return False
    with _lock:
        return jid in _cancelled


def check_cancelled(job_id: Optional[str] = None) -> None:
    if is_cancelled(job_id):
        raise JobCancelledError("Job stopped by user.")


def clear_cancelled(job_id: str) -> None:
    with _lock:
        _cancelled.discard(job_id)
        _active_procs.pop(job_id, None)


def mark_cancelled(job_id: str) -> int:
    """Mark job_id cancelled and terminate any active subprocesses belonging to it."""
    procs_to_kill: List[subprocess.Popen] = []
    with _lock:
        _cancelled.add(job_id)
        procs_to_kill = list(_active_procs.get(job_id, set()))

    killed = 0
    for proc in procs_to_kill:
        try:
            if proc.poll() is None:
                proc.terminate()
                killed += 1
        except Exception:
            pass
    # Ensure stubborn children die promptly
    if procs_to_kill:
        time.sleep(0.15)
        for proc in procs_to_kill:
            try:
                if proc.poll() is None:
                    proc.kill()
            except Exception:
                pass
    logger.info(f"Marked job {job_id} cancelled (terminated {killed} subprocess(es)).")
    return killed


def _register_proc(job_id: Optional[str], proc: subprocess.Popen) -> None:
    if not job_id:
        return
    with _lock:
        _active_procs.setdefault(job_id, set()).add(proc)


def _unregister_proc(job_id: Optional[str], proc: subprocess.Popen) -> None:
    if not job_id:
        return
    with _lock:
        procs = _active_procs.get(job_id)
        if procs:
            procs.discard(proc)
            if not procs:
                _active_procs.pop(job_id, None)


def run_cancellable(
    cmd: List[str],
    *,
    timeout: Optional[float] = None,
    check: bool = False,
    text: bool = True,
    encoding: str = "utf-8",
    errors: str = "replace",
    job_id: Optional[str] = None,
) -> subprocess.CompletedProcess:
    """Run subprocess while honoring job cancellation cleanly without pipe deadlocks."""
    jid = job_id or _CURRENT_JOB.get()
    check_cancelled(jid)

    popen_kwargs = dict(
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if text:
        popen_kwargs.update(text=True, encoding=encoding, errors=errors)

    proc = subprocess.Popen(cmd, **popen_kwargs)
    _register_proc(jid, proc)

    stdout_chunks: List[Any] = []
    stderr_chunks: List[Any] = []

    def _drain(pipe, sink: List[Any]) -> None:
        try:
            data = pipe.read()
            sink.append(data)
        except Exception:
            pass

    t_out = threading.Thread(target=_drain, args=(proc.stdout, stdout_chunks), daemon=True)
    t_err = threading.Thread(target=_drain, args=(proc.stderr, stderr_chunks), daemon=True)
    t_out.start()
    t_err.start()

    start_time = time.monotonic()
    try:
        while True:
            rc = proc.poll()
            if rc is not None:
                break
            if is_cancelled(jid):
                try:
                    proc.terminate()
                    proc.wait(timeout=1.0)
                except Exception:
                    try:
                        proc.kill()
                    except Exception:
                        pass
                raise JobCancelledError("Job stopped by user.")
            if timeout is not None and (time.monotonic() - start_time) > timeout:
                try:
                    proc.kill()
                except Exception:
                    pass
                raise subprocess.TimeoutExpired(cmd, timeout)
            time.sleep(0.2)

        t_out.join(timeout=2.0)
        t_err.join(timeout=2.0)
        if is_cancelled(jid):
            raise JobCancelledError("Job stopped by user.")

        empty = "" if text else b""
        stdout_val = stdout_chunks[0] if stdout_chunks else empty
        stderr_val = stderr_chunks[0] if stderr_chunks else empty
        result = subprocess.CompletedProcess(cmd, rc, stdout_val, stderr_val)
        if check and rc != 0:
            raise subprocess.CalledProcessError(rc, cmd, output=stdout_val, stderr=stderr_val)
        return result
    finally:
        _unregister_proc(jid, proc)
