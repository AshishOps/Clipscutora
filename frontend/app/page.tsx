"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stars01,
  Stars02,
  Link01,
  SearchLg,
  Clock,
  Film01,
  Lightning01,
  Type01,
  AlertCircle,
  Minus,
  Plus,
  Signal01,
  Loading01,
} from "@untitledui/icons";
import { submitJob, probeSource, uploadVideo, ProbeResult } from "@/lib/api";
import {
  Button,
  Badge,
  Input,
  Toggle,
  Card,
  FileDropzone,
  MetricCard,
  Select,
  SelectionCard,
} from "@/components/untitledui";

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
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-zinc-400 font-semibold">
        {label}
      </span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commit())}
        className="w-28 bg-white dark:bg-zinc-950/80 border border-gray-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 font-mono text-center focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-xs transition-all"
      />
    </div>
  );
}

// ── Presets & Styles ─────────────────────────────────────────────────────────
const LENGTH_PRESETS = [
  { id: "quick", label: "Quick", sub: "5–15 seconds", min: 5, max: 15, tag: "Hooks" },
  { id: "shorts", label: "Shorts", sub: "15–30 seconds", min: 15, max: 30, tag: "Default" },
  { id: "reels", label: "Reels", sub: "30–60 seconds", min: 30, max: 60, tag: "Stories" },
  { id: "long", label: "Long", sub: "60–90 seconds", min: 60, max: 90, tag: "Highlights" },
  { id: "custom", label: "Custom", sub: "Custom range", min: 0, max: 0, tag: "Manual" },
];

type StyleWord = {
  text: string;
  active?: boolean;
  upcoming?: boolean;
  color?: string;
};

type CaptionStyleSpec = {
  id: string;
  label: string;
  desc: string;
  fontFamily: string;
  fontWeight: number;
  italic?: boolean;
  upper: boolean;
  fontSizePx: number;
  textColor: string;
  activeColor: string;
  outlineColor: string;
  strokePx: number;
  shadowOffsetPx: number;
  glowColor?: string;
  glowBlurPx?: number;
  tiltDeg?: number;
  boxBg?: string;
  boxRounded?: string;
  anim: string;
  popScale?: number;
  mode: "single" | "highlight" | "chunk" | "karaoke" | "two_line" | "soft_focus";
  words: StyleWord[];
  row1?: { text: string; fontFamily: string; fontWeight: number; italic?: boolean; color: string };
  row2?: { text: string; fontFamily: string; fontWeight: number; italic?: boolean; color: string; glowColor?: string };
};

const STYLES: CaptionStyleSpec[] = [
  {
    id: "streamer",
    label: "Streamer Pop",
    desc: "Yellow 1-3 words, zoom pop",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 15,
    textColor: "#FFE135",
    activeColor: "#FFE135",
    outlineColor: "#000000",
    strokePx: 3.5,
    shadowOffsetPx: 2,
    anim: "pop",
    popScale: 1.12,
    mode: "chunk",
    words: [{ text: "BHAI" }, { text: "KYA", active: true }, { text: "SCENE" }],
  },
  {
    id: "hormozi",
    label: "Hormozi Impact",
    desc: "White words, yellow active word, reveal",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#FFE500",
    outlineColor: "#000000",
    strokePx: 3.5,
    shadowOffsetPx: 2,
    anim: "pop",
    popScale: 1.1,
    mode: "highlight",
    words: [{ text: "THIS" }, { text: "WAS" }, { text: "MASSIVE", active: true }],
  },
  {
    id: "beast",
    label: "Mr Beast Bold",
    desc: "One huge word at a time, colour cycling",
    fontFamily: "Impact, 'Anton', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 24,
    textColor: "#3CFF4A",
    activeColor: "#FFE500",
    outlineColor: "#000000",
    strokePx: 4.5,
    shadowOffsetPx: 3,
    tiltDeg: -3,
    anim: "pop",
    popScale: 1.12,
    mode: "single",
    words: [{ text: "INSANE", active: true, color: "#FFE500" }],
  },
  {
    id: "neon",
    label: "Cyber Neon",
    desc: "Glowing lime outline, electric pop",
    fontFamily: "'Segoe UI Black', 'Montserrat', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#A3FF12",
    outlineColor: "#4BC800",
    strokePx: 2.5,
    shadowOffsetPx: 0,
    glowColor: "#A3FF12",
    glowBlurPx: 12,
    anim: "pop",
    popScale: 1.12,
    mode: "highlight",
    words: [{ text: "NEXT" }, { text: "LEVEL", active: true }, { text: "PLAY" }],
  },
  {
    id: "boxed",
    label: "Subtitle Box",
    desc: "White text on solid black box, yellow active",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 13,
    textColor: "#FFFFFF",
    activeColor: "#FFE500",
    outlineColor: "transparent",
    strokePx: 0,
    shadowOffsetPx: 0,
    boxBg: "#000000",
    boxRounded: "4px",
    anim: "none",
    mode: "highlight",
    words: [{ text: "WATCH" }, { text: "TILL", active: true }, { text: "END" }],
  },
  {
    id: "karaoke",
    label: "Karaoke Sync",
    desc: "Words fill orange as they are spoken",
    fontFamily: "'Arial Black', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#FFB300",
    outlineColor: "#000000",
    strokePx: 3.5,
    shadowOffsetPx: 2,
    anim: "none",
    mode: "karaoke",
    words: [{ text: "SPEECH" }, { text: "SYNC" }, { text: "NOW" }],
  },
  {
    id: "fire",
    label: "Flame Gold",
    desc: "Gold Impact text, red outline, white pop",
    fontFamily: "Impact, 'Anton', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 20,
    textColor: "#FFC300",
    activeColor: "#FFFFFF",
    outlineColor: "#D7141A",
    strokePx: 3.5,
    shadowOffsetPx: 2.5,
    glowColor: "#FF4D00",
    glowBlurPx: 14,
    anim: "pop",
    popScale: 1.15,
    mode: "chunk",
    words: [{ text: "PURE" }, { text: "ENERGY", active: true }],
  },
  {
    id: "meme",
    label: "3D Meme",
    desc: "Comic font, 3D shadow, wobble",
    fontFamily: "'Comic Sans MS', 'Bangers', cursive",
    fontWeight: 700,
    upper: true,
    fontSizePx: 15,
    textColor: "#FFFFFF",
    activeColor: "#FFE500",
    outlineColor: "#000000",
    strokePx: 4,
    shadowOffsetPx: 3.5,
    tiltDeg: -2,
    anim: "pop",
    popScale: 1.12,
    mode: "highlight",
    words: [{ text: "NO" }, { text: "WAY", active: true }, { text: "BRO" }],
  },
  {
    id: "clean",
    label: "Minimal Clean",
    desc: "Minimal white with soft shadow & warm focus",
    fontFamily: "'Segoe UI', 'Inter', sans-serif",
    fontWeight: 600,
    upper: false,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#FFF3A0",
    outlineColor: "transparent",
    strokePx: 0,
    shadowOffsetPx: 2,
    anim: "soft-rise",
    mode: "highlight",
    words: [{ text: "Smooth" }, { text: "&" }, { text: "Minimal", active: true }],
  },
  {
    id: "bouncy_trendy",
    label: "Bouncy Trendy",
    desc: "Italic white lead over lime glow punchline, bouncy drop",
    fontFamily: "'Kanit', sans-serif",
    fontWeight: 900,
    italic: true,
    upper: true,
    fontSizePx: 15,
    textColor: "#ECECEC",
    activeColor: "#C4FF00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#C4FF00",
    glowBlurPx: 14,
    anim: "bounce-drop",
    mode: "two_line",
    words: [],
    row1: { text: "WAIT FOR", fontFamily: "'Inter', sans-serif", fontWeight: 500, italic: true, color: "#ECECEC" },
    row2: { text: "THIS DROP", fontFamily: "'Kanit', sans-serif", fontWeight: 900, italic: true, color: "#C4FF00", glowColor: "#C4FF00" },
  },
  {
    id: "aura_glow",
    label: "Aura Glow",
    desc: "Crisp white stack with glowing electric green center word",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#16FF00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#16FF00",
    glowBlurPx: 16,
    anim: "pop",
    popScale: 1.12,
    mode: "highlight",
    words: [{ text: "ZERO" }, { text: "LIMITS", active: true }, { text: "LEFT" }],
  },
  {
    id: "word_by_word",
    label: "Word by Word",
    desc: "Clean Inter white type rising smoothly word by word",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    upper: false,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#E4E4E7",
    outlineColor: "#000000",
    strokePx: 2,
    shadowOffsetPx: 1.5,
    glowColor: "#FFFFFF",
    glowBlurPx: 8,
    anim: "word-by-word",
    mode: "highlight",
    words: [{ text: "Keep" }, { text: "building" }, { text: "fast", active: true }],
  },
  {
    id: "word_staircase",
    label: "Word Staircase",
    desc: "Condensed Oswald caps climbing out of soft blur",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 700,
    upper: true,
    fontSizePx: 17,
    textColor: "#FFFFFF",
    activeColor: "#C4FF00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#8ABE4C",
    glowBlurPx: 12,
    anim: "word-wave",
    mode: "highlight",
    words: [{ text: "STEP" }, { text: "BY", active: true }, { text: "STEP" }],
  },
  {
    id: "deep_pop",
    label: "Deep Pop",
    desc: "Montserrat Black with deep layered azure neon bloom",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#60A5FA",
    outlineColor: "#0B1736",
    strokePx: 3.2,
    shadowOffsetPx: 1.5,
    glowColor: "#456FFD",
    glowBlurPx: 16,
    anim: "focus-settle",
    popScale: 1.12,
    mode: "highlight",
    words: [{ text: "STAY" }, { text: "IN" }, { text: "FLOW", active: true }],
  },
  {
    id: "kinetic_hook",
    label: "Kinetic Orange",
    desc: "White & blazing orange type resolving out of blur",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#FF6B00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FF6B00",
    glowBlurPx: 16,
    anim: "blur-in",
    popScale: 1.1,
    mode: "highlight",
    words: [{ text: "ACT" }, { text: "RIGHT", active: true }, { text: "NOW" }],
  },
  {
    id: "afterglow",
    label: "Afterglow",
    desc: "Warm radiant yellow Archivo Black with soft golden bloom",
    fontFamily: "'Archivo Black', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 14,
    textColor: "#FAF830",
    activeColor: "#FFFFFF",
    outlineColor: "#2A2000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FAF830",
    glowBlurPx: 16,
    anim: "soft-rise",
    popScale: 1.08,
    mode: "chunk",
    words: [{ text: "PURE" }, { text: "GOLD", active: true }, { text: "AURA" }],
  },
  {
    id: "devin_jatho",
    label: "Devin Jatho",
    desc: "Heavy white lead over glowing crimson emphasis line",
    fontFamily: "'Kanit', sans-serif",
    fontWeight: 900,
    italic: true,
    upper: true,
    fontSizePx: 15,
    textColor: "#FFFFFF",
    activeColor: "#FF2424",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FF0000",
    glowBlurPx: 15,
    anim: "drift-right",
    mode: "two_line",
    words: [],
    row1: { text: "DON'T MISS", fontFamily: "'Kanit', sans-serif", fontWeight: 900, italic: true, color: "#FFFFFF" },
    row2: { text: "THIS ONE", fontFamily: "'Kanit', sans-serif", fontWeight: 900, italic: true, color: "#FF2424", glowColor: "#FF0000" },
  },
  {
    id: "soft_focus",
    label: "Soft Focus",
    desc: "Unspoken words stay blurred and snap crisp on timestamp",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    upper: false,
    fontSizePx: 13.5,
    textColor: "#FFFFFF",
    activeColor: "#FFFFFF",
    outlineColor: "#000000",
    strokePx: 2,
    shadowOffsetPx: 1.5,
    glowColor: "#FFFFFF",
    glowBlurPx: 8,
    anim: "blur-in",
    mode: "soft_focus",
    words: [
      { text: "Watch" },
      { text: "focus", active: true },
      { text: "snap", upcoming: true },
      { text: "in", upcoming: true },
    ],
  },
  {
    id: "postcard",
    label: "Postcard",
    desc: "Dark serif on clean white pill card, active highlight",
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    upper: false,
    fontSizePx: 13.5,
    textColor: "#18181B",
    activeColor: "#4F46E5",
    outlineColor: "transparent",
    strokePx: 0,
    shadowOffsetPx: 0,
    boxBg: "#FFFFFF",
    boxRounded: "8px",
    anim: "soft-rise",
    mode: "highlight",
    words: [{ text: "Clean" }, { text: "editorial", active: true }, { text: "vibe" }],
  },
  {
    id: "neon_splash",
    label: "Neon Splash",
    desc: "White 3-word splash with intense lime halo",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    upper: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#A0D83E",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 1.5,
    glowColor: "#A0D83E",
    glowBlurPx: 16,
    anim: "focus-settle",
    popScale: 1.12,
    mode: "highlight",
    words: [{ text: "NEXT" }, { text: "LEVEL", active: true }, { text: "HYPE" }],
  },
  {
    id: "gold_sweep",
    label: "Gold Sweep",
    desc: "Tall Anton caps with rich gold fill & amber halo",
    fontFamily: "'Anton', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 19,
    textColor: "#FFDE00",
    activeColor: "#FFFFFF",
    outlineColor: "#000000",
    strokePx: 3.5,
    shadowOffsetPx: 2.5,
    glowColor: "#FFA318",
    glowBlurPx: 14,
    anim: "pop",
    popScale: 1.12,
    mode: "chunk",
    words: [{ text: "MILLION" }, { text: "DOLLAR", active: true }],
  },
];

const FONTS = [
  { id: "", label: "Style Default", css: "inherit" },
  { id: "Montserrat", label: "Montserrat Bold", css: "'Montserrat', sans-serif", weight: 700 },
  { id: "Montserrat Black", label: "Montserrat Black", css: "'Montserrat', sans-serif", weight: 900 },
  { id: "Poppins", label: "Poppins Bold", css: "'Poppins', sans-serif", weight: 700 },
  { id: "Poppins ExtraBold", label: "Poppins ExtraBold", css: "'Poppins', sans-serif", weight: 800 },
  { id: "Kanit", label: "Kanit Bold", css: "'Kanit', sans-serif", weight: 700 },
  { id: "Kanit Black", label: "Kanit Black Italic", css: "'Kanit', sans-serif", weight: 900, italic: true },
  { id: "Plus Jakarta Sans ExtraBold", label: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', sans-serif", weight: 800 },
  { id: "Inter", label: "Inter Bold", css: "'Inter', sans-serif", weight: 700 },
  { id: "Oswald", label: "Oswald Bold", css: "'Oswald', sans-serif", weight: 700 },
  { id: "Bebas Neue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "Anton", label: "Anton", css: "'Anton', sans-serif", weight: 400 },
  { id: "Archivo Black", label: "Archivo Black", css: "'Archivo Black', sans-serif", weight: 400 },
  { id: "Playfair Display", label: "Playfair Italic", css: "'Playfair Display', serif", weight: 700, italic: true },
  { id: "Caveat", label: "Caveat Script", css: "'Caveat', cursive", weight: 700 },
  { id: "Bangers", label: "Bangers Comic", css: "'Bangers', cursive", weight: 400 },
  { id: "Arial Black", label: "Arial Black", css: "'Arial Black', sans-serif", weight: 900 },
  { id: "Impact", label: "Impact", css: "Impact, sans-serif", weight: 400 },
  { id: "Segoe UI Black", label: "Segoe UI Black", css: "'Segoe UI Black', sans-serif", weight: 900 },
  { id: "Verdana", label: "Verdana", css: "Verdana, sans-serif", weight: 700 },
];

const GLOW_SCALE_MAP: Record<string, number> = {
  auto: 1,
  off: 0,
  subtle: 0.55,
  medium: 1,
  intense: 1.5,
};

function CaptionStylePreview({
  spec,
  overrideFont,
  overrideAnimation,
  overrideGlow,
}: {
  spec: CaptionStyleSpec;
  overrideFont: string;
  overrideAnimation: string;
  overrideGlow: string;
}) {
  const chosenFont = overrideFont ? FONTS.find((f) => f.id === overrideFont) : undefined;
  const effectiveFont = chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.fontFamily;
  const effectiveWeight = chosenFont?.weight ?? spec.fontWeight;
  const effectiveItalic = chosenFont?.italic ?? spec.italic;
  const effectiveAnim = overrideAnimation === "auto" ? spec.anim : overrideAnimation;
  const glowMult = GLOW_SCALE_MAP[overrideGlow] ?? 1;

  const animClass =
    effectiveAnim === "none"
      ? ""
      : effectiveAnim === "word-by-word"
      ? "anim-cap-soft-rise"
      : `anim-cap-${effectiveAnim}`;

  const buildShadow = (glowHex?: string, blurPx?: number, isActive?: boolean) => {
    const parts: string[] = [];
    if (spec.shadowOffsetPx > 0) {
      parts.push(`${spec.shadowOffsetPx}px ${spec.shadowOffsetPx}px 0px rgba(0,0,0,0.85)`);
    }
    if (!spec.glowColor && spec.strokePx === 0 && spec.shadowOffsetPx > 0) {
      parts.push(`0 2px 8px rgba(0,0,0,0.75)`);
    }
    if (glowHex && blurPx && glowMult > 0) {
      const r1 = Math.round(blurPx * 0.45 * glowMult);
      const r2 = Math.round(blurPx * glowMult);
      const r3 = Math.round(blurPx * 1.6 * glowMult);
      parts.push(`0 0 ${r1}px ${glowHex}`);
      parts.push(`0 0 ${r2}px ${glowHex}`);
      if (isActive || glowMult >= 1.2) {
        parts.push(`0 0 ${r3}px ${glowHex}`);
      }
    }
    return parts.length ? parts.join(", ") : undefined;
  };

  const wordStyle = (w?: StyleWord, customGlow?: string): React.CSSProperties => ({
    fontFamily: effectiveFont,
    fontWeight: effectiveWeight,
    fontStyle: effectiveItalic ? "italic" : "normal",
    fontSize: `${spec.fontSizePx}px`,
    lineHeight: 1.15,
    color: w?.color || (w?.active ? spec.activeColor : spec.textColor),
    WebkitTextStroke:
      spec.strokePx > 0 && spec.outlineColor !== "transparent"
        ? `${spec.strokePx}px ${spec.outlineColor}`
        : undefined,
    textShadow: buildShadow(customGlow ?? spec.glowColor, spec.glowBlurPx, w?.active),
    transform: w?.active && spec.popScale && spec.popScale > 1 ? `scale(${spec.popScale})` : undefined,
    opacity: w?.upcoming ? 0.48 : 1,
    filter: w?.upcoming ? "blur(2.2px)" : undefined,
    display: "inline-block",
  });

  return (
    <div className="relative h-[74px] w-full rounded-xl bg-gradient-to-b from-zinc-900 via-[#0d0e13] to-black border border-zinc-800/80 px-2.5 flex items-center justify-center overflow-hidden select-none">
      {/* Subtle 9:16 video vignette & ambient light behind captions */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: spec.glowColor && glowMult > 0
            ? `radial-gradient(circle at 50% 55%, ${spec.glowColor}26 0%, transparent 70%)`
            : "radial-gradient(circle at 50% 55%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />

      {spec.mode === "two_line" && spec.row1 && spec.row2 ? (
        <div className="relative z-10 flex flex-col items-center justify-center leading-none gap-0.5 text-center">
          <span
            className="caption-stroke tracking-tight"
            style={{
              fontFamily: chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.row1.fontFamily,
              fontWeight: spec.row1.fontWeight,
              fontStyle: spec.row1.italic ? "italic" : "normal",
              fontSize: "11px",
              color: spec.row1.color,
              WebkitTextStroke: `${Math.max(2, spec.strokePx - 0.5)}px ${spec.outlineColor}`,
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {spec.row1.text}
          </span>
          <span
            className={`caption-stroke tracking-wide ${animClass}`}
            style={{
              fontFamily: chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.row2.fontFamily,
              fontWeight: spec.row2.fontWeight,
              fontStyle: spec.row2.italic ? "italic" : "normal",
              fontSize: `${spec.fontSizePx}px`,
              color: spec.row2.color,
              WebkitTextStroke: `${spec.strokePx}px ${spec.outlineColor}`,
              textShadow: buildShadow(spec.row2.glowColor, spec.glowBlurPx, true),
            }}
          >
            {spec.row2.text}
          </span>
        </div>
      ) : spec.mode === "karaoke" ? (
        <div
          className={`relative z-10 inline-flex items-center gap-1.5 ${spec.upper ? "uppercase" : ""} ${animClass}`}
        >
          {spec.words.map((w, i) => {
            const phrase = spec.words.map((x) => x.text).join(" ");
            return i === 0 ? (
              <span key={i} className="relative inline-block">
                {/* Base white text with crisp black outline */}
                <span className="caption-stroke" style={wordStyle({ text: phrase })}>
                  {phrase}
                </span>
                {/* Animated orange progressive fill */}
                <span
                  aria-hidden
                  className="anim-cap-karaoke pointer-events-none absolute inset-0 text-transparent"
                  style={{
                    fontFamily: effectiveFont,
                    fontWeight: effectiveWeight,
                    fontSize: `${spec.fontSizePx}px`,
                    lineHeight: 1.15,
                  }}
                >
                  {phrase}
                </span>
              </span>
            ) : null;
          })}
        </div>
      ) : (
        <div
          className={`relative z-10 flex items-center justify-center flex-wrap gap-x-1.5 ${
            spec.upper ? "uppercase" : ""
          }`}
          style={{
            backgroundColor: spec.boxBg,
            borderRadius: spec.boxRounded,
            padding: spec.boxBg ? "4px 10px" : undefined,
            boxShadow: spec.boxBg === "#FFFFFF" ? "0 4px 14px rgba(0,0,0,0.45)" : undefined,
            transform: spec.tiltDeg ? `rotate(${spec.tiltDeg}deg)` : undefined,
          }}
        >
          {spec.words.map((w, idx) => (
            <span
              key={idx}
              className={`caption-stroke ${w.active || effectiveAnim === "word-wave" || effectiveAnim === "word-by-word" ? animClass : ""}`}
              style={{
                ...wordStyle(w),
                animationDelay:
                  effectiveAnim === "word-wave" || effectiveAnim === "word-by-word"
                    ? `${idx * 160}ms`
                    : undefined,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const ANIMATIONS = [
  { id: "auto", label: "Style Default (Auto)" },
  { id: "bounce-drop", label: "Bounce Drop (Spring Overshoot)" },
  { id: "word-by-word", label: "Word-by-Word Punch" },
  { id: "word-wave", label: "Word Wave" },
  { id: "blur-in", label: "Blur-In Resolve" },
  { id: "soft-rise", label: "Soft Rise" },
  { id: "drift-right", label: "Drift Right" },
  { id: "focus-settle", label: "Focus Settle" },
  { id: "flicker-in", label: "Flicker In" },
  { id: "pop", label: "Classic Pop" },
  { id: "none", label: "None (Static)" },
];

const GLOW_LEVELS = [
  { id: "auto", label: "Style Default (Auto)" },
  { id: "off", label: "Off (No Halo)" },
  { id: "subtle", label: "Subtle Bloom" },
  { id: "medium", label: "Medium Creator Halo" },
  { id: "intense", label: "Intense Neon Glow" },
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
  const [captionAnimation, setCaptionAnimation] = useState("auto");
  const [captionGlow, setCaptionGlow] = useState("auto");
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
        caption_animation: captionAnimation,
        caption_glow: captionGlow,
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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Header with Minimalist Typography */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="brand" size="md" dot leftIcon={<Stars01 className="w-3.5 h-3.5 stroke-[2]" />}>
            Multimodal Engagement Intelligence
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 dark:text-zinc-50 leading-[1.15]">
          Transform Long Videos into{" "}
          <span className="gradient-text font-bold">Viral 9:16 Shorts</span>
        </h1>

        <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base font-normal leading-relaxed">
          Autonomous viral moment extraction, intelligent speaker crop & split-cam reframing, and word-by-word animated subtitles for YouTube Shorts, Instagram Reels & TikTok.
        </p>
      </div>

      {/* Feature Stats Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Processing Engine"
          value="CUDA 12"
          hint="Whisper Turbo Fast Mode"
          icon={<Lightning01 className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2]" />}
          badge={<Badge variant="success" size="sm">Active</Badge>}
        />
        <MetricCard
          label="Aspect Ratio"
          value="9:16"
          hint="Smart Split & Solo Speaker"
          icon={<Film01 className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2]" />}
          badge={<Badge variant="brand" size="sm">1080p</Badge>}
        />
        <MetricCard
          label="Subtitle Engine"
          value="9 Styles"
          hint="Hinglish & English Sync"
          icon={<Type01 className="w-4 h-4 text-brand-600 dark:text-brand-400 stroke-[2]" />}
          badge={<Badge variant="purple" size="sm">Word-Sync</Badge>}
        />
        <MetricCard
          label="Virality Scoring"
          value="AI Judge"
          hint="Gemini + Acoustic Energy"
          icon={<Stars02 className="w-4 h-4 text-amber-500 dark:text-amber-400 stroke-[2]" />}
          badge={<Badge variant="amber" size="sm">Multimodal</Badge>}
        />
      </div>

      {/* Main Generator Form with Spatial Hierarchy */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 sm:p-9 space-y-10">
          {/* Step 1: Video Source */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/80 dark:border-brand-800/60 dark:text-brand-300 text-xs font-semibold flex items-center justify-center">
                  01
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                  Select Video Source
                </h2>
              </div>

              {/* Source Mode Segmented Tabs */}
              <div className="flex items-center p-1 bg-gray-100 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceTab("url")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    sourceTab === "url"
                      ? "bg-white text-gray-900 dark:bg-brand-600 dark:text-white shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                  }`}
                >
                  Link / Stream
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("upload")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    sourceTab === "upload"
                      ? "bg-white text-gray-900 dark:bg-brand-600 dark:text-white shadow-xs font-semibold"
                      : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {sourceTab === "url" ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Paste YouTube video, livestream URL, Twitch link, or file path..."
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
                      leadingIcon={<Link01 className="w-4 h-4 stroke-[1.75]" />}
                      inputSize="md"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => analyze()}
                    disabled={probing}
                    isLoading={probing}
                    leftIcon={<SearchLg className="w-4 h-4 stroke-[2]" />}
                    size="md"
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            ) : (
              <FileDropzone
                onFileSelect={handleFileUpload}
                uploading={uploadPct !== null}
                uploadPct={uploadPct}
              />
            )}

            {probing && (
              <div className="p-4 rounded-xl border border-brand-200 bg-brand-50 text-xs text-brand-700 dark:border-brand-500/30 dark:bg-brand-950/20 dark:text-brand-300 flex items-center gap-2.5">
                <Loading01 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400 stroke-[2]" />
                <span>Extracting video metadata, duration, audio streams, and heatmap indicators...</span>
              </div>
            )}

            {/* Probe Result Card */}
            {probe && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl border border-gray-200 bg-gray-50/60 dark:border-zinc-800 dark:bg-zinc-950/60 shadow-xs">
                {probe.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={probe.thumbnail}
                    alt={probe.title}
                    className="w-full sm:w-36 h-20 object-cover rounded-xl flex-none border border-gray-200 dark:border-zinc-800/80"
                  />
                ) : (
                  <div className="w-full sm:w-36 h-20 rounded-xl bg-gray-100 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center flex-none text-gray-400 dark:text-zinc-500">
                    <Film01 className="w-7 h-7 stroke-[1.5]" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100 line-clamp-1">{probe.title}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isLive ? (
                      <Badge variant="rose" size="sm" dot leftIcon={<Signal01 className="w-3 h-3 stroke-[2]" />}>
                        Live Stream
                      </Badge>
                    ) : (
                      <Badge variant="gray" size="sm" leftIcon={<Clock className="w-3 h-3 stroke-[2]" />}>
                        {fmtTime(duration)}
                      </Badge>
                    )}
                    {probe.channel && (
                      <Badge variant="purple" size="sm">
                        {probe.channel}
                      </Badge>
                    )}
                    {probe.has_heatmap && (
                      <Badge variant="amber" size="sm" leftIcon={<Stars02 className="w-3 h-3 stroke-[2]" />}>
                        Replay Heatmap
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {probe?.processing && (
            <div className="p-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-950/20 dark:border-amber-500/30 rounded-2xl space-y-1.5">
              <div className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2]" />
                Stream Processing In Progress on YouTube
              </div>
              <div className="text-amber-700 dark:text-amber-200/80">
                This stream concluded recently and YouTube is compiling the final high-definition VOD. For best results, use a completed video or local recording.
              </div>
            </div>
          )}

          {/* Step 2: Time Range & Duration */}
          {probe && (
            <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/80 dark:border-brand-800/60 dark:text-brand-300 text-xs font-semibold flex items-center justify-center">
                  02
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                  {isLive ? "Stream Recording Window" : "Video Selection Range"}
                </h2>
              </div>

              {isLive ? (
                <div className="space-y-3 p-4 rounded-2xl bg-gray-50/60 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-zinc-400">Capture Window</span>
                    <span className="text-brand-600 dark:text-brand-300 font-bold">{liveMinutes} minutes</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={liveMinutes}
                    onChange={(e) => setLiveMinutes(Number(e.target.value))}
                    className="w-full accent-brand-500"
                    aria-label="Minutes of live stream to record"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-zinc-500">
                    Recording initiates upon submission; short clips are rendered right after capture finishes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-gray-50/60 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800/80">
                  <div className="dual-range relative h-7">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-gray-200 dark:bg-zinc-800/90" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 shadow-xs"
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
                      <TimeInput label="From (Start)" value={rangeStart} onCommit={setStart} />
                      <span className="text-gray-400 dark:text-zinc-600 pb-2.5">→</span>
                      <TimeInput label="To (End)" value={rangeEnd} onCommit={setEnd} />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-zinc-500 font-semibold">
                          Selected Duration
                        </div>
                        <div className="text-sm font-bold text-brand-600 dark:text-brand-300 font-mono">
                          {fmtTime(selectedLen)}
                        </div>
                      </div>

                      {!isFullRange && (
                        <Button
                          type="button"
                          variant="secondary-gray"
                          size="sm"
                          onClick={() => {
                            setRangeStart(0);
                            setRangeEnd(duration);
                          }}
                        >
                          Use Full Video
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 3: Clips Output Settings */}
          <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/80 dark:border-brand-800/60 dark:text-brand-300 text-xs font-semibold flex items-center justify-center">
                03
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                Clip Count & Duration Presets
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
              {/* Number of Clips */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-300 block">Total Clips</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Fewer clips"
                    onClick={() => setClipCount((c) => Math.max(2, c - 1))}
                    className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[2]" />
                  </button>
                  <input
                    type="number"
                    min={2}
                    value={clipCount}
                    onChange={(e) => setClipCount(Math.max(2, Math.floor(Number(e.target.value) || 2)))}
                    className="w-16 h-10 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-xl text-center text-sm font-bold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-xs"
                    aria-label="Number of clips"
                  />
                  <button
                    type="button"
                    aria-label="More clips"
                    onClick={() => setClipCount((c) => c + 1)}
                    className="w-10 h-10 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-500">
                  Minimum 2.{probe && selectedLen > 0 && ` Fits ~${suggestedMax} clips.`}
                </div>
              </div>

              {/* Length Presets using SelectionCards */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-800 dark:text-zinc-300 flex items-center justify-between">
                  <span>Clip Length Target</span>
                  <span className="font-mono text-brand-600 dark:text-brand-300 font-bold">
                    {minDuration}s – {maxDuration}s
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {LENGTH_PRESETS.map((p) => (
                    <SelectionCard
                      key={p.id}
                      title={p.label}
                      description={p.sub}
                      badge={<Badge variant="brand" size="sm">{p.tag}</Badge>}
                      selected={lengthPreset === p.id}
                      onClick={() => pickLength(p.id)}
                    />
                  ))}
                </div>

                {lengthPreset === "custom" && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="number"
                      min={1}
                      max={179}
                      value={minDuration}
                      aria-label="Minimum clip seconds"
                      onChange={(e) => setMinDuration(Math.max(1, Math.min(179, Number(e.target.value))))}
                      className="w-20 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-center text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-gray-500 text-xs">to</span>
                    <input
                      type="number"
                      min={2}
                      max={180}
                      value={maxDuration}
                      aria-label="Maximum clip seconds"
                      onChange={(e) => setMaxDuration(Math.max(2, Math.min(180, Number(e.target.value))))}
                      className="w-20 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-center text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-gray-500 text-[11px]">seconds (max 180s)</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 4: Caption Styles & Aesthetics */}
          <section className="space-y-5 pt-6 border-t border-gray-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/80 dark:border-brand-800/60 dark:text-brand-300 text-xs font-semibold flex items-center justify-center">
                04
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                Captions, Fonts & Layout
              </h2>
            </div>

            {/* Feature Toggles */}
            <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-gray-50/60 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800/80">
              <Toggle
                checked={captions}
                onChange={setCaptions}
                label="Animated Captions"
                subtext="Burn word-by-word subtitles"
              />
              <Toggle
                checked={titleOverlay}
                onChange={setTitleOverlay}
                label="Hook Title Box"
                subtext="Burn black title banner overlay"
              />
            </div>

            {captions && (
              <>
                {/* Styles Grid with SelectionCards */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-zinc-300 tracking-wide block">
                    Subtitle Style Template ({STYLES.length} Presets)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STYLES.map((s) => (
                      <SelectionCard
                        key={s.id}
                        title={s.label}
                        description={s.desc}
                        selected={captionPreset === s.id}
                        onClick={() => setCaptionPreset(s.id)}
                        preview={
                          <CaptionStylePreview
                            spec={s}
                            overrideFont={font}
                            overrideAnimation={captionAnimation}
                            overrideGlow={captionGlow}
                          />
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Animation & Glow Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Caption Animation"
                    value={captionAnimation}
                    onChange={(e) => setCaptionAnimation(e.target.value)}
                  >
                    {ANIMATIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Caption Glow Intensity"
                    value={captionGlow}
                    onChange={(e) => setCaptionGlow(e.target.value)}
                  >
                    {GLOW_LEVELS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Fonts Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-zinc-300 tracking-wide block">
                    Subtitle Typography
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {FONTS.map((f) => {
                      const isSelected = font === f.id;
                      return (
                        <button
                          type="button"
                          key={f.label}
                          onClick={() => setFont(f.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/50 ring-2 ring-brand-500/25 shadow-xs"
                              : "border-gray-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-950/40 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50"
                          }`}
                        >
                          <div
                            className="text-xs text-amber-600 dark:text-yellow-300 truncate"
                            style={{
                              fontFamily: f.css,
                              fontWeight: f.weight ?? 800,
                              fontStyle: f.italic ? "italic" : "normal",
                            }}
                          >
                            VIRAL HOOK
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-1">{f.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Language & Hindi Quality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Spoken Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="auto">Auto-detect (Hinglish or English)</option>
                <option value="hi">Hindi / Hinglish (Captions in English letters)</option>
                <option value="en">English</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="ur">Urdu (اردو)</option>
              </Select>

              {language !== "en" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-800 dark:text-zinc-300 tracking-wide block">
                    Hindi Transcription Accuracy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <SelectionCard
                      title="Fast ⚡"
                      description="Whisper Turbo Model"
                      selected={hindiQuality === "fast"}
                      onClick={() => setHindiQuality("fast")}
                    />
                    <SelectionCard
                      title="Best 🎯"
                      description="Whisper Large-v3 Model"
                      selected={hindiQuality === "best"}
                      onClick={() => setHindiQuality("best")}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-none stroke-[2]" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="xl"
            fullWidth
            disabled={isLoading || !probe || !!probe?.processing}
            isLoading={isLoading}
            leftIcon={<Stars01 className="w-5 h-5 stroke-[2]" />}
          >
            {isLoading
              ? "Initializing Pipeline…"
              : !probe
              ? "Analyze a Video to Continue"
              : probe.processing
              ? "Stream Still Processing on YouTube"
              : isLive
              ? `Record ${liveMinutes}m & Generate ${clipCount} Shorts`
              : `Generate ${clipCount} Viral Shorts from ${fmtTime(selectedLen)}`}
          </Button>
        </Card>
      </form>
    </div>
  );
}
