import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL, sendJobToBackend } from "@/lib/backend";

export const runtime = "edge";

const VALID_ANIMATIONS = new Set([
  "auto",
  "none",
  "pop",
  "bounce-drop",
  "word-by-word",
  "word-wave",
  "blur-in",
  "soft-rise",
  "drift-right",
  "focus-settle",
  "flicker-in",
]);

const VALID_GLOWS = new Set(["auto", "off", "subtle", "medium", "intense"]);
const VALID_WORD_MODES = new Set(["auto", "word", "short", "sentence"]);
const VALID_ORIENTATIONS = new Set(["horizontal", "vertical"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      source,
      type,
      clip_count,
      clip_duration,
      captions,
      preset,
      language,
      range,
      live_minutes,
      font,
      caption_animation,
      caption_glow,
      caption_words,
      caption_orientation,
      title_overlay,
      hindi_quality,
    } = body;

    const num = (v: any) =>
      v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v);
    const clipCount = Math.max(2, Math.floor(num(clip_count) ?? 6));
    const minDur = Math.max(1, num(clip_duration?.min) ?? 15);
    const maxDur = Math.min(180, Math.max(minDur + 1, num(clip_duration?.max) ?? 30));
    const rangeStart = num(range?.start);
    const rangeEnd = num(range?.end);
    const liveMinutes = num(live_minutes);
    const fontName = typeof font === "string" && /^[\w ]{1,40}$/.test(font) ? font : "";
    const lang = /^[a-z]{2,3}$|^auto$/.test(String(language || "")) ? String(language) : "auto";
    const captionAnimation = VALID_ANIMATIONS.has(String(caption_animation || ""))
      ? String(caption_animation)
      : "auto";
    const captionGlow = VALID_GLOWS.has(String(caption_glow || ""))
      ? String(caption_glow)
      : "auto";
    const captionWords = VALID_WORD_MODES.has(String(caption_words || ""))
      ? String(caption_words)
      : "auto";
    const captionOrientation = VALID_ORIENTATIONS.has(String(caption_orientation || ""))
      ? String(caption_orientation)
      : "horizontal";

    if (!source) {
      return NextResponse.json({ error: "Missing source video URL or path" }, { status: 400 });
    }

    const jobId = Math.random().toString(36).substring(2, 10);
    const jobData = {
      job_id: jobId,
      source,
      source_type: type || "url",
      clip_count: clipCount,
      clip_min_duration: minDur,
      clip_max_duration: maxDur,
      range_start: rangeStart,
      range_end: rangeEnd,
      live_minutes: liveMinutes,
      caption_font: fontName || null,
      caption_animation: captionAnimation,
      caption_glow: captionGlow,
      caption_words: captionWords,
      caption_orientation: captionOrientation,
      title_overlay: title_overlay !== false,
      hindi_quality: hindi_quality === "best" ? "best" : "fast",
      captions: captions !== false,
      caption_preset: preset || "streamer",
      language: lang,
      status: "processing",
      stage: "Queued for processing...",
      progress: 5,
      clips: [],
      created_at: new Date().toISOString(),
    };

    const ok = await sendJobToBackend(jobData);
    if (!ok) {
      return NextResponse.json(
        { error: "Could not connect to backend server. Make sure your tunnel or backend is active." },
        { status: 502 }
      );
    }

    return NextResponse.json({ jobId });
  } catch (error: any) {
    console.error("API submit error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
