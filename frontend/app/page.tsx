"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Link01,
  SearchLg,
  Clock,
  Film01,
  AlertCircle,
  Minus,
  Plus,
  Signal01,
  Loading01,
  Check,
  Stars01,
} from "@untitledui/icons";
import { submitJob, probeSource, uploadVideo, ProbeResult } from "@/lib/api";
import { FileDropzone, Toggle } from "@/components/untitledui";

// ── Time Helpers ─────────────────────────────────────────────────────────────
function fmtTime(sec: number): string {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function parseTime(text: string): number | null {
  const parts = text.trim().split(":").map((p) => p.trim());
  if (!parts.length || parts.some((p) => p === "" || isNaN(Number(p)))) return null;
  return parts.reduce((acc, p) => acc * 60 + Number(p), 0);
}

function TimeInput({
  value,
  onCommit,
  label,
}: {
  value: number;
  onCommit: (v: number) => void;
  label: string;
}) {
  const [text, setText] = useState(fmtTime(value));
  useEffect(() => setText(fmtTime(value)), [value]);

  const commit = () => {
    const v = parseTime(text);
    if (v === null) setText(fmtTime(value));
    else onCommit(v);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--color-muted)]">{label}</span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
        className="hm-input w-28 px-3 text-sm text-center num"
      />
    </label>
  );
}

// ── Presets & Styles ─────────────────────────────────────────────────────────
const LENGTH_PRESETS = [
  { id: "quick", label: "Quick", sub: "5 to 15 s", min: 5, max: 15 },
  { id: "shorts", label: "Shorts", sub: "15 to 30 s", min: 15, max: 30 },
  { id: "reels", label: "Reels", sub: "30 to 60 s", min: 30, max: 60 },
  { id: "long", label: "Long", sub: "60 to 90 s", min: 60, max: 90 },
  { id: "custom", label: "Custom", sub: "Manual", min: 0, max: 0 },
];

const STYLES = [
  {
    id: "streamer",
    label: "Streamer Pop",
    desc: "Active yellow keywords with pop timing",
    sampleText: "BHAI KYA SCENE HAI",
  },
  {
    id: "hormozi",
    label: "Hormozi Impact",
    desc: "Single-word reveal with strong emphasis",
    sampleText: "MASSIVE RESULT",
  },
  {
    id: "beast",
    label: "Mr Beast Bold",
    desc: "Large high-contrast display captions",
    sampleText: "WATCH THIS MOMENT",
  },
  {
    id: "neon",
    label: "Cyber Neon",
    desc: "Bright lime stroke with dark outline",
    sampleText: "NEXT LEVEL PLAY",
  },
  {
    id: "boxed",
    label: "Subtitle Box",
    desc: "Bold white type over a solid dark bar",
    sampleText: "WATCH TILL END",
  },
  {
    id: "karaoke",
    label: "Karaoke Sync",
    desc: "Progressive word fill as spoken",
    sampleText: "SPEECH SYNC ACTIVE",
  },
  {
    id: "fire",
    label: "Flame Gold",
    desc: "Gold stroke with warm contrast shadow",
    sampleText: "PURE ENERGY",
  },
  {
    id: "meme",
    label: "3D Meme",
    desc: "Playful comic cut with hard drop shadow",
    sampleText: "NO WAY BRO",
  },
  {
    id: "clean",
    label: "Minimal Clean",
    desc: "Crisp neutral subtitle with subtle shadow",
    sampleText: "Clean and clear",
  },
];

const FONTS = [
  { id: "", label: "Style Default", css: "inherit" },
  { id: "Arial Black", label: "Arial Black", css: "'Arial Black', sans-serif" },
  { id: "Impact", label: "Impact", css: "Impact, sans-serif" },
  { id: "Segoe UI Black", label: "Segoe UI Black", css: "'Segoe UI Black', sans-serif" },
  { id: "Comic Sans MS", label: "Comic Sans", css: "'Comic Sans MS', cursive" },
  { id: "Bahnschrift", label: "Bahnschrift", css: "Bahnschrift, sans-serif" },
  { id: "Franklin Gothic Medium", label: "Franklin Gothic", css: "'Franklin Gothic Medium', sans-serif" },
  { id: "Verdana", label: "Verdana", css: "Verdana, sans-serif" },
];

export default function HomePage() {
  const router = useRouter();

  // Source & Probe State
  const [sourceInput, setSourceInput] = useState("");
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "upload">("url");

  // Range & Live State
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);
  const [liveMinutes, setLiveMinutes] = useState(10);

  // Settings State
  const [clipCount, setClipCount] = useState(6);
  const [lengthPreset, setLengthPreset] = useState("shorts");
  const [minDuration, setMinDuration] = useState(15);
  const [maxDuration, setMaxDuration] = useState(30);
  const [captions, setCaptions] = useState(true);
  const [titleOverlay, setTitleOverlay] = useState(true);
  const [captionPreset, setCaptionPreset] = useState("streamer");
  const [font, setFont] = useState("");
  const [language, setLanguage] = useState("auto");
  const [hindiQuality, setHindiQuality] = useState<"fast" | "best">("fast");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duration = probe?.duration ?? 0;
  const isLive = !!probe?.is_live;
  const selectedLen = isLive ? liveMinutes * 60 : Math.max(0, rangeEnd - rangeStart);
  const isFullRange = !isLive && rangeStart <= 0.5 && rangeEnd >= duration - 0.5;
  const suggestedMax = Math.max(2, Math.floor(selectedLen / (minDuration + 8)));

  const analyze = async (src?: string) => {
    const value = (src ?? sourceInput).trim().replace(/^"|"$/g, "");
    if (!value) return setError("Please enter a valid video link or file path.");
    setError(null);
    setProbing(true);
    setProbe(null);
    try {
      const info = await probeSource(value);
      setProbe(info);
      setSourceInput(info.source);
      setRangeStart(0);
      setRangeEnd(info.duration ?? 0);
    } catch (e: any) {
      setError(e.message || "Failed to analyze this video.");
    } finally {
      setProbing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setProbe(null);
    setUploadPct(0);
    try {
      const path = await uploadVideo(file, setUploadPct);
      setSourceInput(path);
      await analyze(path);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploadPct(null);
    }
  };

  const pickLength = (id: string) => {
    setLengthPreset(id);
    const p = LENGTH_PRESETS.find((x) => x.id === id);
    if (p && p.id !== "custom") {
      setMinDuration(p.min);
      setMaxDuration(p.max);
    }
  };

  const setStart = (v: number) => setRangeStart(Math.max(0, Math.min(v, rangeEnd - 5)));
  const setEnd = (v: number) => setRangeEnd(Math.min(duration, Math.max(v, rangeStart + 5)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!probe) return setError("Analyze a video first to detect timing and format.");
    if (minDuration < 1 || maxDuration > 180 || minDuration >= maxDuration) {
      return setError("Clip length must be between 1 and 180 seconds, with min below max.");
    }
    if (clipCount < 2) return setError("Select at least 2 clips.");
    if (selectedLen < minDuration) return setError("Selected duration is shorter than a single clip.");

    setIsLoading(true);
    try {
      const res = await submitJob({
        source: probe.source,
        type: probe.type,
        clip_count: clipCount,
        clip_duration: { min: minDuration, max: maxDuration },
        captions,
        preset: captionPreset,
        language,
        range: !isLive && !isFullRange ? { start: Math.round(rangeStart), end: Math.round(rangeEnd) } : null,
        live_minutes: isLive ? liveMinutes : null,
        font,
        title_overlay: titleOverlay,
        hindi_quality: hindiQuality,
      });
      router.push(`/jobs/${res.jobId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit video clipping job");
      setIsLoading(false);
    }
  };

  const pctStart = duration ? (rangeStart / duration) * 100 : 0;
  const pctEnd = duration ? (rangeEnd / duration) * 100 : 100;

  return (
    <div className="space-y-8">
      {/* Workbench Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[var(--color-rule)]">
        <div className="space-y-1.5">
          <h1 className="hm-display text-2xl sm:text-3xl">
            Cut long video into 9:16 portrait clips
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Analyze a YouTube stream or video file, scrub the time window, and render timed portrait shorts.
          </p>
        </div>
      </div>

      {/* Main Two-Column Workbench */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-8 items-start">
        {/* Left Column: Source & Timeline Scrubber */}
        <div className="space-y-6">
          <section className="hm-surface p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Source video</h2>

              <div className="inline-flex border border-[var(--color-rule-2)] bg-[var(--color-paper)]" role="tablist" aria-label="Source input mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceTab === "url"}
                  onClick={() => setSourceTab("url")}
                  className={`px-3.5 h-9 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                    sourceTab === "url"
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Link or stream
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sourceTab === "upload"}
                  onClick={() => setSourceTab("upload")}
                  className={`px-3.5 h-9 text-xs font-medium border-l border-[var(--color-rule-2)] transition-colors duration-150 cursor-pointer ${
                    sourceTab === "upload"
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  Upload file
                </button>
              </div>
            </div>

            {sourceTab === "url" ? (
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none">
                    <Link01 className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <input
                    aria-label="Video URL or local file path"
                    placeholder="Paste YouTube video, live stream URL, or file path…"
                    value={sourceInput}
                    onChange={(e) => {
                      setSourceInput(e.target.value);
                      setProbe(null);
                    }}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData("text");
                      if (text) setTimeout(() => analyze(text), 0);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), analyze())}
                    className="hm-input w-full pl-9 pr-3 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => analyze()}
                  disabled={probing}
                  className="hm-btn-secondary px-4 inline-flex items-center gap-2 text-sm flex-none"
                >
                  {probing ? (
                    <Loading01 className="w-4 h-4 animate-spin stroke-[1.75]" />
                  ) : (
                    <SearchLg className="w-4 h-4 stroke-[1.75]" />
                  )}
                  <span>{probing ? "Analyzing…" : "Analyze"}</span>
                </button>
              </div>
            ) : (
              <FileDropzone
                onFileSelect={handleFileUpload}
                uploading={uploadPct !== null}
                uploadPct={uploadPct}
              />
            )}

            {probing && (
              <div
                role="status"
                className="p-3.5 border border-[var(--color-rule-2)] bg-[var(--color-paper)] text-xs text-[var(--color-ink-2)] flex items-center gap-2.5"
              >
                <Loading01 className="w-4 h-4 animate-spin text-[var(--color-accent)] stroke-[1.75]" />
                <span>Reading video metadata, duration, and replay heatmap…</span>
              </div>
            )}

            {/* Empty / Probed Preview */}
            {!probe && !probing && (
              <div className="p-4 border-t border-[var(--color-rule)] text-xs text-[var(--color-muted)]">
                Paste a link or upload a recording to inspect duration and set the clip range.
              </div>
            )}

            {probe && (
              <div className="pt-4 border-t border-[var(--color-rule)] flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {probe.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={probe.thumbnail}
                    alt={probe.title}
                    width={160}
                    height={90}
                    className="w-full sm:w-40 h-[90px] object-cover flex-none border border-[var(--color-rule-2)]"
                  />
                ) : (
                  <div className="w-full sm:w-40 h-[90px] bg-[var(--color-paper)] border border-[var(--color-rule-2)] flex items-center justify-center flex-none text-[var(--color-muted)]">
                    <Film01 className="w-6 h-6 stroke-[1.5]" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-sm font-medium text-[var(--color-ink)] line-clamp-2">
                    {probe.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 text-[var(--color-error)] font-medium">
                        <Signal01 className="w-3.5 h-3.5 stroke-[1.75]" />
                        Live stream
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 num">
                        <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
                        {fmtTime(duration)}
                      </span>
                    )}
                    {probe.channel && <span>{probe.channel}</span>}
                    {probe.has_heatmap && (
                      <span className="text-[var(--color-accent)]">Replay heatmap available</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {probe?.processing && (
              <div className="p-3.5 border border-[var(--color-warning)] bg-[var(--color-paper)] text-xs text-[var(--color-ink)] space-y-1">
                <div className="font-medium flex items-center gap-2 text-[var(--color-warning)]">
                  <AlertCircle className="w-4 h-4 stroke-[1.75]" />
                  Stream still processing on YouTube
                </div>
                <p className="text-[var(--color-muted)]">
                  This stream ended recently and the full HD recording is still compiling. Use a finished video or local file for best results.
                </p>
              </div>
            )}
          </section>

          {/* Timeline Range Scrubber (Signature Control) */}
          {probe && (
            <section className="hm-surface p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium text-[var(--color-ink)]">
                  {isLive ? "Stream capture window" : "Time range"}
                </h2>
                <span className="text-xs text-[var(--color-ink-2)] num">
                  Selected: <strong className="text-[var(--color-accent)] font-medium">{fmtTime(selectedLen)}</strong>
                </span>
              </div>

              {isLive ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-[var(--color-muted)]">
                    <span>Capture duration</span>
                    <span className="text-[var(--color-accent)] font-medium num">{liveMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={liveMinutes}
                    onChange={(e) => setLiveMinutes(Number(e.target.value))}
                    className="w-full accent-[var(--color-accent)]"
                    aria-label="Minutes of live stream to record"
                  />
                  <p className="text-xs text-[var(--color-muted)]">
                    Recording begins on submit; clips are extracted as soon as capture completes.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="dual-range relative h-7">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[var(--color-rule-2)]" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-[var(--color-accent)]"
                      style={{ left: `${pctStart}%`, right: `${100 - pctEnd}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={Math.max(1, Math.round(duration))}
                      value={Math.round(rangeStart)}
                      onChange={(e) => setStart(Number(e.target.value))}
                      aria-label="Start time"
                    />
                    <input
                      type="range"
                      min={0}
                      max={Math.max(1, Math.round(duration))}
                      value={Math.round(rangeEnd)}
                      onChange={(e) => setEnd(Number(e.target.value))}
                      aria-label="End time"
                    />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex items-end gap-3">
                      <TimeInput label="Start" value={rangeStart} onCommit={setStart} />
                      <TimeInput label="End" value={rangeEnd} onCommit={setEnd} />
                    </div>

                    {!isFullRange && (
                      <button
                        type="button"
                        onClick={() => {
                          setRangeStart(0);
                          setRangeEnd(duration);
                        }}
                        className="hm-btn-secondary px-3.5 text-xs"
                      >
                        Reset to full video
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Clip Count & Length Presets */}
          <section className="hm-surface p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-medium text-[var(--color-ink)]">Clip count and length</h2>
              <span className="text-xs text-[var(--color-ink-2)] num">
                {minDuration} to {maxDuration} s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-6 items-start">
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[var(--color-muted)] block">Total clips</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    aria-label="Fewer clips"
                    onClick={() => setClipCount((c) => Math.max(2, c - 1))}
                    className="w-10 h-10 border border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] inline-flex items-center justify-center transition-colors duration-150 cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[1.75]" />
                  </button>
                  <input
                    type="number"
                    min={2}
                    value={clipCount}
                    onChange={(e) => setClipCount(Math.max(2, Math.floor(Number(e.target.value) || 2)))}
                    className="hm-input w-16 text-center text-sm font-medium border-x-0 num"
                    aria-label="Number of clips"
                  />
                  <button
                    type="button"
                    aria-label="More clips"
                    onClick={() => setClipCount((c) => c + 1)}
                    className="w-10 h-10 border border-[var(--color-rule-2)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-3)] text-[var(--color-ink)] inline-flex items-center justify-center transition-colors duration-150 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Minimum 2{probe && selectedLen > 0 ? `, fits about ${suggestedMax}` : ""}.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--color-muted)] block">Target duration</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 border border-[var(--color-rule-2)] bg-[var(--color-paper)]">
                  {LENGTH_PRESETS.map((p, idx) => {
                    const active = lengthPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickLength(p.id)}
                        className={`p-2.5 text-left transition-colors duration-150 cursor-pointer ${
                          idx > 0 ? "border-t sm:border-t-0 sm:border-l border-[var(--color-rule)]" : ""
                        } ${
                          active
                            ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                        }`}
                      >
                        <div className="text-xs font-medium">{p.label}</div>
                        <div className={`text-xs mt-0.5 num ${active ? "opacity-80" : "text-[var(--color-muted)]"}`}>
                          {p.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {lengthPreset === "custom" && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <input
                      type="number"
                      min={1}
                      max={179}
                      value={minDuration}
                      aria-label="Minimum clip seconds"
                      onChange={(e) => setMinDuration(Math.max(1, Math.min(179, Number(e.target.value))))}
                      className="hm-input w-20 px-2.5 text-xs text-center num"
                    />
                    <span className="text-xs text-[var(--color-muted)]">to</span>
                    <input
                      type="number"
                      min={2}
                      max={180}
                      value={maxDuration}
                      aria-label="Maximum clip seconds"
                      onChange={(e) => setMaxDuration(Math.max(2, Math.min(180, Number(e.target.value))))}
                      className="hm-input w-20 px-2.5 text-xs text-center num"
                    />
                    <span className="text-xs text-[var(--color-muted)]">seconds (max 180 s)</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Captions, Fonts, Language & Primary Submit */}
        <div className="space-y-6">
          <section className="hm-surface p-6 space-y-6">
            <h2 className="text-base font-medium text-[var(--color-ink)]">Captions and typography</h2>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[var(--color-rule)]">
              <Toggle
                checked={captions}
                onChange={setCaptions}
                label="Animated captions"
                subtext="Burn word-timed subtitles"
              />
              <Toggle
                checked={titleOverlay}
                onChange={setTitleOverlay}
                label="Title banner"
                subtext="Burn hook title overlay"
              />
            </div>

            {captions && (
              <>
                {/* 9 Subtitle Styles Contact Grid */}
                <div className="space-y-2.5">
                  <span className="text-xs font-medium text-[var(--color-muted)] block">
                    Subtitle style (9 presets)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {STYLES.map((s) => {
                      const active = captionPreset === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setCaptionPreset(s.id)}
                          className={`p-3 border text-left transition-colors duration-150 cursor-pointer flex flex-col justify-between gap-2 ${
                            active
                              ? "border-[var(--color-accent)] bg-[var(--color-paper-3)]"
                              : "border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-rule-2)]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[var(--color-ink)]">{s.label}</span>
                            {active && <Check className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[2.25]" />}
                          </div>
                          <div className="py-1.5 px-2 bg-[var(--color-paper-2)] text-center text-xs font-medium text-[var(--color-ink-2)] truncate">
                            {s.sampleText}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Choices */}
                <div className="space-y-2.5">
                  <span className="text-xs font-medium text-[var(--color-muted)] block">
                    Subtitle font
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONTS.map((f) => {
                      const active = font === f.id;
                      return (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => setFont(f.id)}
                          className={`p-2.5 border text-left transition-colors duration-150 cursor-pointer ${
                            active
                              ? "border-[var(--color-accent)] bg-[var(--color-paper-3)]"
                              : "border-[var(--color-rule)] bg-[var(--color-paper)] hover:border-[var(--color-rule-2)]"
                          }`}
                        >
                          <div
                            className="text-xs text-[var(--color-ink)] truncate"
                            style={{ fontFamily: f.css, fontWeight: 700 }}
                          >
                            Hook sample
                          </div>
                          <div className="text-xs text-[var(--color-muted)] mt-0.5 truncate">{f.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Spoken Language & Hindi Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-rule)]">
              <label className="space-y-1.5 block">
                <span className="text-xs font-medium text-[var(--color-muted)] block">Spoken language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="hm-input w-full px-3 text-sm cursor-pointer"
                >
                  <option value="auto">Auto-detect (Hinglish or English)</option>
                  <option value="hi">Hindi / Hinglish (Roman script)</option>
                  <option value="en">English</option>
                  <option value="mr">Marathi</option>
                  <option value="bn">Bengali</option>
                  <option value="pa">Punjabi</option>
                  <option value="gu">Gujarati</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="kn">Kannada</option>
                  <option value="ml">Malayalam</option>
                  <option value="ur">Urdu</option>
                </select>
              </label>

              {language !== "en" && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-[var(--color-muted)] block">
                    Hindi transcription accuracy
                  </span>
                  <div className="grid grid-cols-2 border border-[var(--color-rule-2)] bg-[var(--color-paper)]">
                    <button
                      type="button"
                      onClick={() => setHindiQuality("fast")}
                      className={`h-[38px] px-3 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                        hindiQuality === "fast"
                          ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                      }`}
                    >
                      Fast (Turbo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHindiQuality("best")}
                      className={`h-[38px] px-3 text-xs font-medium border-l border-[var(--color-rule)] transition-colors duration-150 cursor-pointer ${
                        hindiQuality === "best"
                          ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-paper-3)]"
                      }`}
                    >
                      Best (Large-v3)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 border border-[var(--color-error)] bg-[var(--color-paper)] text-xs text-[var(--color-error)] flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-none stroke-[1.75]" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !probe || !!probe?.processing}
              className="hm-btn-primary w-full px-5 text-sm inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loading01 className="w-4 h-4 animate-spin stroke-[1.75]" />
              ) : (
                <Stars01 className="w-4 h-4 stroke-[1.75]" />
              )}
              <span>
                {isLoading
                  ? "Starting pipeline…"
                  : !probe
                  ? "Analyze a video to continue"
                  : probe.processing
                  ? "Stream still processing on YouTube"
                  : isLive
                  ? `Record ${liveMinutes} min and generate ${clipCount} clips`
                  : `Generate ${clipCount} portrait clips (${fmtTime(selectedLen)})`}
              </span>
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
