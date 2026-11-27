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
import { submitJob, probeSource, uploadVideo, getBackendHealth, cancelJob, ProbeResult, BackendHealth } from "@/lib/api";
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
        className="w-28 bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] rounded-xl px-3 py-2 text-sm text-[#0c1836] dark:text-[#f1f4f9] font-mono text-center focus:outline-none focus:border-[#3b86ff] focus:ring-4 focus:ring-[#3b86ff]/20 shadow-xs transition-all"
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
  hero?: boolean;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  italic?: boolean;
  scale?: number;
};

type CaptionStyleSpec = {
  id: string;
  label: string;
  desc: string;
  fontFamily: string;
  fontWeight: number;
  italic?: boolean;
  upper: boolean;
  lower?: boolean;
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
  mode: "single" | "highlight" | "chunk" | "karaoke" | "two_line" | "splash_hero";
  words: StyleWord[];
  row1?: { text: string; fontFamily: string; fontWeight: number; italic?: boolean; upper?: boolean; color: string; glowColor?: string; scale?: number };
  row2?: { text: string; fontFamily: string; fontWeight: number; italic?: boolean; upper?: boolean; color: string; glowColor?: string; activeWord?: string; activeColor?: string };
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

  // ── Exact 12 Samsaam.io Creator Styles ────────────────────────────────────
  {
    id: "portugal",
    label: "Portugal",
    desc: "White Inter stack with red Playfair italic emphasis",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    upper: false,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#FF0000",
    outlineColor: "#000000",
    strokePx: 2.5,
    shadowOffsetPx: 1.5,
    anim: "word-by-word",
    popScale: 1.08,
    mode: "highlight",
    words: [
      { text: "Stop" },
      { text: "the" },
      {
        text: "excuses",
        active: true,
        color: "#FF0000",
        fontFamily: "'Playfair Display', serif",
        fontWeight: 900,
        italic: true,
        scale: 1.24,
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    desc: "Crisp white TeX Gyre Heros around huge lime-gold hero word",
    fontFamily: "'TeXGyreHeros', 'Inter', sans-serif",
    fontWeight: 700,
    upper: false,
    fontSizePx: 11,
    textColor: "#FFFFFF",
    activeColor: "#A8E34B",
    outlineColor: "#000000",
    strokePx: 2,
    shadowOffsetPx: 1,
    glowColor: "#A8E34B",
    glowBlurPx: 10,
    anim: "drift-right",
    mode: "splash_hero",
    words: [
      { text: "Build your" },
      { text: "BUSINESS", hero: true, active: true, color: "#A8E34B", fontFamily: "'TeXGyreHeros', 'Inter', sans-serif", fontWeight: 700, scale: 1.75 },
      { text: "from anywhere" },
    ],
  },
  {
    id: "attention",
    label: "Attention",
    desc: "Small white Montserrat lead; blazing orange italic punchline",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    italic: true,
    upper: true,
    fontSizePx: 15,
    textColor: "#FFFFFF",
    activeColor: "#FF6D00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FF6D00",
    glowBlurPx: 14,
    anim: "soft-rise",
    mode: "two_line",
    words: [],
    row1: { text: "NOW PAY", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, italic: false, upper: true, color: "#FFFFFF", scale: 0.72 },
    row2: { text: "ATTENTION", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, italic: true, upper: true, color: "#FF6D00", glowColor: "#FF6D00" },
  },
  {
    id: "trading_bro",
    label: "Trading Bro",
    desc: "Small white Inter words under glowing red Poppins hero",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    upper: false,
    fontSizePx: 11,
    textColor: "#FFFFFF",
    activeColor: "#E90000",
    outlineColor: "#000000",
    strokePx: 2.2,
    shadowOffsetPx: 1.5,
    glowColor: "#E90000",
    glowBlurPx: 14,
    anim: "word-by-word",
    mode: "splash_hero",
    words: [
      { text: "Trading is not" },
      { text: "trading", hero: true, active: true, color: "#E90000", fontFamily: "'Poppins', sans-serif", fontWeight: 800, scale: 1.65 },
      { text: "for everyone" },
    ],
  },
  {
    id: "aura_glow",
    label: "Aura Glow",
    desc: "White Inter stack with glowing neon green centre word",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    upper: false,
    fontSizePx: 11.5,
    textColor: "#FFFFFF",
    activeColor: "#16FF00",
    outlineColor: "#000000",
    strokePx: 2.5,
    shadowOffsetPx: 1.5,
    glowColor: "#16FF00",
    glowBlurPx: 16,
    anim: "drift-right",
    mode: "splash_hero",
    words: [
      { text: "This is your" },
      { text: "MOMENT", hero: true, active: true, color: "#16FF00", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, scale: 1.5 },
      { text: "to shine" },
    ],
  },
  {
    id: "crazy",
    label: "Crazy",
    desc: "Bold Plus Jakarta Sans stack with electric blue callouts",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    upper: false,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#0064FF",
    outlineColor: "#000000",
    strokePx: 2.5,
    shadowOffsetPx: 1.5,
    glowColor: "#FFFFFF",
    glowBlurPx: 10,
    anim: "word-wave",
    popScale: 1.1,
    mode: "highlight",
    words: [{ text: "Five" }, { text: "visual", active: true }, { text: "hooks" }],
  },
  {
    id: "real_shamani",
    label: "Real Shamani",
    desc: "Uppercase Montserrat stack with neon colour-cycling words",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    upper: true,
    fontSizePx: 13.5,
    textColor: "#FFFFFF",
    activeColor: "#22E55B",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FFFFFF",
    glowBlurPx: 8,
    anim: "word-wave",
    popScale: 1.1,
    mode: "highlight",
    words: [
      { text: "LIVE" },
      { text: "WITHOUT", active: true, color: "#22E55B" },
      { text: "REGRET", color: "#2F7BFF" },
    ],
  },
  {
    id: "bouncy_trendy",
    label: "Bouncy Trendy",
    desc: "Italic Inter white lead over glowing lime Kanit punchline",
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
    row1: { text: "ONE IDEA", fontFamily: "'Inter', sans-serif", fontWeight: 500, italic: true, upper: true, color: "#ECECEC", glowColor: "#ECECEC", scale: 0.78 },
    row2: { text: "TEN HOOKS", fontFamily: "'Kanit', sans-serif", fontWeight: 900, italic: true, upper: true, color: "#C4FF00", glowColor: "#C4FF00" },
  },
  {
    id: "afterglow",
    label: "Afterglow",
    desc: "Glowing yellow Archivo Black caps over white Caveat script",
    fontFamily: "'Archivo Black', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 14,
    textColor: "#FAF830",
    activeColor: "#FFFFFF",
    outlineColor: "#000000",
    strokePx: 2.8,
    shadowOffsetPx: 2,
    glowColor: "#FAF830",
    glowBlurPx: 15,
    anim: "soft-rise",
    mode: "two_line",
    words: [],
    row1: { text: "BIG DREAMS WIN", fontFamily: "'Archivo Black', sans-serif", fontWeight: 400, italic: false, upper: true, color: "#FAF830", glowColor: "#FAF830", scale: 0.96 },
    row2: { text: "make it happen", fontFamily: "'Caveat', cursive", fontWeight: 700, italic: false, upper: false, color: "#FFFFFF" },
  },
  {
    id: "tokyo",
    label: "Tokyo",
    desc: "Tight bold lowercase Montserrat with cobalt blue focus",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    upper: false,
    lower: true,
    fontSizePx: 14,
    textColor: "#FFFFFF",
    activeColor: "#456FFD",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2.5,
    glowColor: "#456FFD",
    glowBlurPx: 12,
    anim: "word-by-word",
    popScale: 1.1,
    mode: "highlight",
    words: [{ text: "right" }, { text: "words", active: true }, { text: "win" }],
  },
  {
    id: "devin_jatho",
    label: "Devin Jatho",
    desc: "Heavy white italic Montserrat over glowing crimson red row",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 900,
    italic: true,
    upper: true,
    fontSizePx: 15,
    textColor: "#FFFFFF",
    activeColor: "#FF0000",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FF0000",
    glowBlurPx: 15,
    anim: "drift-right",
    mode: "two_line",
    words: [],
    row1: { text: "STOP DOING", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, italic: true, upper: true, color: "#FFFFFF", glowColor: "#FFFFFF", scale: 0.9 },
    row2: { text: "THIS NOW", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, italic: true, upper: true, color: "#FF0000", glowColor: "#FF0000" },
  },
  {
    id: "tech_bro",
    label: "Tech Bro",
    desc: "Crisp white Montserrat over massive tall yellow Anton word",
    fontFamily: "'Anton', sans-serif",
    fontWeight: 400,
    upper: true,
    fontSizePx: 20,
    textColor: "#FFFFFF",
    activeColor: "#FFCD00",
    outlineColor: "#000000",
    strokePx: 3,
    shadowOffsetPx: 2,
    glowColor: "#FFCD00",
    glowBlurPx: 10,
    anim: "soft-rise",
    mode: "two_line",
    words: [],
    row1: { text: "HOW YOU EARN", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, italic: false, upper: true, color: "#FFFFFF", scale: 0.52 },
    row2: { text: "MONEY", fontFamily: "'Anton', sans-serif", fontWeight: 400, italic: false, upper: true, color: "#FFCD00", glowColor: "#FFCD00" },
  },
];

const FONTS = [
  { id: "", label: "Style Default", css: "inherit" },
  { id: "Montserrat", label: "Montserrat Bold", css: "'Montserrat', sans-serif", weight: 700 },
  { id: "Montserrat ExtraBold", label: "Montserrat ExtraBold", css: "'Montserrat', sans-serif", weight: 800 },
  { id: "Montserrat Black", label: "Montserrat Black", css: "'Montserrat', sans-serif", weight: 900 },
  { id: "Inter", label: "Inter Bold", css: "'Inter', sans-serif", weight: 700 },
  { id: "Inter Medium", label: "Inter Medium Italic", css: "'Inter', sans-serif", weight: 500, italic: true },
  { id: "Poppins", label: "Poppins Bold", css: "'Poppins', sans-serif", weight: 700 },
  { id: "Poppins ExtraBold", label: "Poppins ExtraBold", css: "'Poppins', sans-serif", weight: 800 },
  { id: "Kanit Black", label: "Kanit Black Italic", css: "'Kanit', sans-serif", weight: 900, italic: true },
  { id: "Plus Jakarta Sans ExtraBold", label: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', sans-serif", weight: 800 },
  { id: "TeXGyreHeros", label: "TeX Gyre Heros", css: "'TeXGyreHeros', sans-serif", weight: 700 },
  { id: "Oswald", label: "Oswald Bold", css: "'Oswald', sans-serif", weight: 700 },
  { id: "Bebas Neue", label: "Bebas Neue", css: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "Anton", label: "Anton", css: "'Anton', sans-serif", weight: 400 },
  { id: "Archivo Black", label: "Archivo Black", css: "'Archivo Black', sans-serif", weight: 400 },
  { id: "Playfair Display", label: "Playfair Italic", css: "'Playfair Display', serif", weight: 900, italic: true },
  { id: "Caveat", label: "Caveat Script", css: "'Caveat', cursive", weight: 700 },
  { id: "Arial Black", label: "Arial Black", css: "'Arial Black', sans-serif", weight: 900 },
  { id: "Impact", label: "Impact", css: "Impact, sans-serif", weight: 400 },
  { id: "Segoe UI Black", label: "Segoe UI Black", css: "'Segoe UI Black', sans-serif", weight: 900 },
];

const GLOW_SCALE_MAP: Record<string, number> = {
  auto: 1,
  off: 0,
  subtle: 0.55,
  medium: 1,
  intense: 1.5,
};

const REAL_SHAMANI_CYCLE = ["#22E55B", "#2F7BFF", "#FF4FB8", "#FF8A1F", "#F5F51A", "#19E3F0", "#FF2A2A"];

function CaptionStylePreview({
  spec,
  overrideFont,
  overrideAnimation,
  overrideGlow,
  interactive = false,
}: {
  spec: CaptionStyleSpec;
  overrideFont: string;
  overrideAnimation: string;
  overrideGlow: string;
  interactive?: boolean;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    if (!interactive) return;
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((n) => (n + 1) % 6);
    }, 680);
    return () => clearInterval(id);
  }, [interactive, spec.id]);

  const chosenFont = overrideFont ? FONTS.find((f) => f.id === overrideFont) : undefined;
  const effectiveFont = chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.fontFamily;
  const effectiveWeight = chosenFont?.weight ?? spec.fontWeight;
  const effectiveItalic = chosenFont?.italic ?? spec.italic;
  const effectiveAnim = overrideAnimation === "auto" ? spec.anim : overrideAnimation;
  const glowMult = GLOW_SCALE_MAP[overrideGlow] ?? 1;
  const sizeScale = interactive ? 1.45 : 1;

  // Compute fallback glow color if user forces glow on a non-glow preset (matches backend caption.py)
  const fallbackGlow =
    !spec.glowColor && overrideGlow !== "auto" && overrideGlow !== "off"
      ? spec.activeColor
      : spec.glowColor;
  const fallbackBlur = spec.glowBlurPx ?? (fallbackGlow ? 12 : 0);

  const animClass =
    effectiveAnim === "none"
      ? ""
      : effectiveAnim === "word-by-word"
      ? "anim-cap-soft-rise"
      : `anim-cap-${effectiveAnim}`;

  const buildShadow = (glowHex?: string, blurPx?: number, isActive?: boolean) => {
    const parts: string[] = [];
    if (spec.shadowOffsetPx > 0) {
      parts.push(`${spec.shadowOffsetPx}px ${spec.shadowOffsetPx}px 0px rgba(0,0,0,0.88)`);
    }
    if (!glowHex && spec.strokePx === 0 && spec.shadowOffsetPx > 0) {
      parts.push(`0 2px 8px rgba(0,0,0,0.75)`);
    }
    if (glowHex && blurPx && glowMult > 0) {
      const r1 = Math.round(blurPx * 0.45 * glowMult * sizeScale);
      const r2 = Math.round(blurPx * glowMult * sizeScale);
      const r3 = Math.round(blurPx * 1.6 * glowMult * sizeScale);
      parts.push(`0 0 ${r1}px ${glowHex}`);
      parts.push(`0 0 ${r2}px ${glowHex}`);
      if (isActive || glowMult >= 1.2) {
        parts.push(`0 0 ${r3}px ${glowHex}`);
      }
    }
    return parts.length ? parts.join(", ") : undefined;
  };

  // For interactive preview, rotate which word is currently spoken/highlighted
  const activeWordPos = interactive && spec.words.length > 0 ? stepIdx % spec.words.length : -1;

  const wordStyle = (w?: StyleWord, customGlow?: string, isCurrentlySpoken?: boolean): React.CSSProperties => {
    const active = interactive ? !!isCurrentlySpoken : !!w?.active;
    const heroWord = interactive && spec.mode === "splash_hero" ? !!isCurrentlySpoken : !!w?.hero;
    const cycleColor =
      interactive && spec.id === "real_shamani" && active
        ? REAL_SHAMANI_CYCLE[stepIdx % REAL_SHAMANI_CYCLE.length]
        : interactive && spec.id === "beast"
        ? REAL_SHAMANI_CYCLE[stepIdx % REAL_SHAMANI_CYCLE.length]
        : undefined;
    const portugalEmphasis = spec.id === "portugal" && active;
    const baseColor =
      cycleColor ||
      (active ? spec.activeColor : spec.textColor);
    const renderedColor = !interactive && w?.color ? w.color : baseColor;
    const matchedGlow =
      customGlow ?? (heroWord || active ? (fallbackGlow ? renderedColor : undefined) : undefined);
    const wFont =
      chosenFont?.css && chosenFont.css !== "inherit"
        ? chosenFont.css
        : portugalEmphasis
        ? "'Playfair Display', serif"
        : heroWord || !interactive
        ? w?.fontFamily || effectiveFont
        : effectiveFont;
    const wWeight =
      chosenFont?.weight ??
      (portugalEmphasis ? 900 : heroWord || !interactive ? w?.fontWeight ?? effectiveWeight : effectiveWeight);
    const wItalic = chosenFont?.italic ?? (portugalEmphasis ? true : heroWord || !interactive ? w?.italic ?? effectiveItalic : effectiveItalic);
    const wScale = portugalEmphasis ? 1.24 : heroWord ? w?.scale ?? 1.5 : !interactive ? w?.scale ?? 1 : 1;
    const fs = Math.round(spec.fontSizePx * wScale * sizeScale);

    return {
      fontFamily: wFont,
      fontWeight: wWeight,
      fontStyle: wItalic ? "italic" : "normal",
      fontSize: `${fs}px`,
      lineHeight: 1.05,
      color: renderedColor,
      WebkitTextStroke:
        spec.strokePx > 0 && spec.outlineColor !== "transparent"
          ? `${spec.strokePx * (interactive ? 1.15 : 1)}px ${spec.outlineColor}`
          : undefined,
      textShadow: buildShadow(
        matchedGlow,
        fallbackBlur,
        active || heroWord
      ),
      transform: active && !heroWord && spec.popScale && spec.popScale > 1 ? `scale(${spec.popScale})` : undefined,
      opacity: w?.upcoming ? 0.48 : 1,
      filter: w?.upcoming ? "blur(2.2px)" : undefined,
      display: "inline-block",
      transition: interactive ? "transform 120ms ease, color 120ms ease" : undefined,
    };
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-[#2d3139] px-3 flex items-center justify-center overflow-hidden select-none ${
        interactive ? "samsaam-stage min-h-[190px]" : "bg-[#07080a] h-[82px]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: fallbackGlow && glowMult > 0
            ? `radial-gradient(circle at 50% 55%, ${fallbackGlow}2e 0%, transparent 70%)`
            : "radial-gradient(circle at 50% 55%, rgba(59,134,255,0.08) 0%, transparent 70%)",
        }}
      />

      {spec.mode === "two_line" && spec.row1 && spec.row2 ? (
        <div
          key={interactive ? `${spec.id}-${Math.floor(stepIdx / 3)}` : spec.id}
          className="relative z-10 flex flex-col items-center justify-center leading-none gap-0.5 text-center"
        >
          <span
            className={`caption-stroke tracking-tight ${spec.row1.upper ? "uppercase" : ""}`}
            style={{
              fontFamily: chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.row1.fontFamily,
              fontWeight: spec.row1.fontWeight,
              fontStyle: spec.row1.italic ? "italic" : "normal",
              fontSize: `${Math.round(spec.fontSizePx * (spec.row1.scale ?? 0.85) * sizeScale)}px`,
              color: spec.row1.color,
              WebkitTextStroke: `${Math.max(1.8, spec.strokePx - 0.8)}px ${spec.outlineColor}`,
              textShadow: buildShadow(spec.row1.glowColor, fallbackBlur ? fallbackBlur * 0.75 : undefined, false),
            }}
          >
            {spec.row1.text}
          </span>
          <span
            className={`caption-stroke tracking-wide ${spec.row2.upper ? "uppercase" : ""} ${animClass}`}
            style={{
              fontFamily: chosenFont?.css && chosenFont.css !== "inherit" ? chosenFont.css : spec.row2.fontFamily,
              fontWeight: spec.row2.fontWeight,
              fontStyle: spec.row2.italic ? "italic" : "normal",
              fontSize: `${Math.round(spec.fontSizePx * sizeScale)}px`,
              lineHeight: 0.98,
              color: spec.row2.color,
              WebkitTextStroke: `${spec.strokePx * (interactive ? 1.15 : 1)}px ${spec.outlineColor}`,
              textShadow: buildShadow(spec.row2.glowColor ?? fallbackGlow, fallbackBlur, true),
            }}
          >
            {spec.row2.text}
          </span>
        </div>
      ) : spec.mode === "splash_hero" ? (
        <div className="relative z-10 flex flex-col items-center justify-center leading-none text-center">
          {spec.words.map((w, idx) => {
            const isHero = interactive ? idx === activeWordPos : !!w.hero;
            return (
              <span
                key={idx}
                className={`caption-stroke ${isHero ? animClass : ""}`}
                style={{
                  ...wordStyle(w, isHero ? fallbackGlow : undefined, isHero),
                  textTransform: isHero && (spec.id === "business" || spec.id === "aura_glow")
                    ? "uppercase"
                    : isHero && spec.id === "trading_bro"
                    ? "lowercase"
                    : undefined,
                  marginTop: idx > 0 ? (isHero ? "-1px" : "-2px") : undefined,
                  zIndex: isHero ? 2 : 1,
                }}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      ) : spec.mode === "karaoke" ? (
        <div
          className={`relative z-10 inline-flex items-center gap-1.5 ${spec.upper ? "uppercase" : ""} ${animClass}`}
        >
          {spec.words.map((w, i) => {
            const phrase = spec.words.map((x) => x.text).join(" ");
            return i === 0 ? (
              <span key={i} className="relative inline-block">
                <span className="caption-stroke" style={wordStyle({ text: phrase })}>
                  {phrase}
                </span>
                <span
                  aria-hidden
                  className="anim-cap-karaoke pointer-events-none absolute inset-0 text-transparent"
                  style={{
                    fontFamily: effectiveFont,
                    fontWeight: effectiveWeight,
                    fontSize: `${Math.round(spec.fontSizePx * sizeScale)}px`,
                    lineHeight: 1.05,
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
          className={`relative z-10 flex items-center justify-center flex-wrap gap-x-2 ${
            spec.upper ? "uppercase" : spec.lower ? "lowercase" : ""
          }`}
          style={{
            backgroundColor: spec.boxBg,
            borderRadius: spec.boxRounded,
            padding: spec.boxBg ? "5px 12px" : undefined,
            boxShadow: spec.boxBg === "#FFFFFF" ? "0 4px 14px rgba(0,0,0,0.45)" : undefined,
            transform: spec.tiltDeg ? `rotate(${spec.tiltDeg}deg)` : undefined,
          }}
        >
          {spec.words.map((w, idx) => {
            const isSpoken = interactive ? idx === activeWordPos : !!w.active;
            return (
              <span
                key={idx}
                className={`caption-stroke ${isSpoken || effectiveAnim === "word-wave" || effectiveAnim === "word-by-word" ? animClass : ""}`}
                style={{
                  ...wordStyle(w, isSpoken ? fallbackGlow : undefined, isSpoken),
                  animationDelay:
                    effectiveAnim === "word-wave" || effectiveAnim === "word-by-word"
                      ? `${idx * 160}ms`
                      : undefined,
                }}
              >
                {w.text}
              </span>
            );
          })}
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
  const [captionPreset, setCaptionPreset] = useState("bouncy_trendy");
  const [font, setFont] = useState("");
  const [captionAnimation, setCaptionAnimation] = useState("auto");
  const [captionGlow, setCaptionGlow] = useState("auto");
  const [language, setLanguage] = useState("auto");
  const [hindiQuality, setHindiQuality] = useState<"fast" | "best">("fast");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [stoppingActive, setStoppingActive] = useState(false);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      const h = await getBackendHealth();
      if (active && h) setBackendHealth(h);
    };
    poll();
    const timer = setInterval(poll, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleStopRunning = async () => {
    const runningId = backendHealth?.running;
    if (!runningId || stoppingActive) return;
    setStoppingActive(true);
    try {
      await cancelJob(runningId);
      const h = await getBackendHealth();
      if (h) setBackendHealth(h);
    } catch (e: any) {
      setError(e?.message || "Could not stop the active job.");
    } finally {
      setStoppingActive(false);
    }
  };

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
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Samsaam-Style Hero Header */}
      <div className="text-center space-y-5 pt-2">
        <div className="inline-flex items-center justify-center">
          <span className="eyebrow">
            <Stars01 className="w-3.5 h-3.5 stroke-[2.2]" />
            After Effects style captions · 9:16 Studio
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-[-0.03em] text-[#0c1836] dark:text-white leading-[1.06] max-w-3xl mx-auto">
          The captions behind today&rsquo;s{" "}
          <span className="text-[#3b86ff]">viral clips.</span>
        </h1>

        <p className="text-[#4d5b85] dark:text-[#9da4b0] max-w-2xl mx-auto text-base sm:text-[18px] font-medium leading-relaxed">
          High-quality motion. Zero complexity. Autonomous 9:16 moment extraction, speaker framing, and authentic creator captions.
        </p>
      </div>

      {/* Feature Stats Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Processing Engine"
          value="CUDA 12"
          hint="Whisper Turbo Fast Mode"
          icon={<Lightning01 className="w-4 h-4 stroke-[2]" />}
          badge={<Badge variant="success" size="sm">Active</Badge>}
        />
        <MetricCard
          label="Aspect Ratio"
          value="9:16"
          hint="Smart Split & Solo Speaker"
          icon={<Film01 className="w-4 h-4 stroke-[2]" />}
          badge={<Badge variant="brand" size="sm">1080p</Badge>}
        />
        <MetricCard
          label="Subtitle Engine"
          value="21 Styles"
          hint="12 Samsaam + 9 Classic"
          icon={<Type01 className="w-4 h-4 stroke-[2]" />}
          badge={<Badge variant="brand" size="sm">Word-Sync</Badge>}
        />
        <MetricCard
          label="Virality Scoring"
          value="AI Judge"
          hint="Gemini + Acoustic Energy"
          icon={<Stars02 className="w-4 h-4 text-amber-500 dark:text-amber-400 stroke-[2]" />}
          badge={<Badge variant="amber" size="sm">Multimodal</Badge>}
        />
      </div>

      {/* Active Backend Job Banner (shows whenever a job is running/blocking queue) */}
      {backendHealth?.running && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[#3b86ff]/40 bg-[#eef4ff]/90 dark:bg-[#111e3e]/55 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#3b86ff]/15 border border-[#3b86ff]/30 flex items-center justify-center flex-none">
              <Loading01 className="w-4 h-4 text-[#3b86ff] animate-spin stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#0c1836] dark:text-white flex items-center gap-2 flex-wrap">
                <span>Job #{backendHealth.running} is currently running</span>
                {backendHealth.queued > 0 && (
                  <Badge variant="warning" size="sm">
                    {backendHealth.queued} queued
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0] truncate">
                {backendHealth.running_stage || "Processing..."}
                {typeof backendHealth.running_progress === "number" ? ` (${backendHealth.running_progress}%)` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary-gray"
              size="sm"
              onClick={() => router.push(`/jobs/${backendHealth.running}`)}
            >
              View Job
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={stoppingActive}
              onClick={handleStopRunning}
            >
              {stoppingActive ? "Stopping..." : "Stop Running Job"}
            </Button>
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} id="studio-source">
        <Card className="p-6 sm:p-9 space-y-10">
          {/* Step 1: Video Source */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#eef4ff] text-[#2563eb] border border-[#b5d2ff] dark:bg-[#111e3e] dark:border-[#3b86ff]/40 dark:text-[#85b5ff] text-xs font-bold flex items-center justify-center">
                  01
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d5b85] dark:text-[#9da4b0]">
                  Select Video Source
                </h2>
              </div>

              {/* Source Mode Segmented Pill Tabs */}
              <div className="flex items-center p-1 bg-[#eef4ff] dark:bg-[#1c1e22] rounded-full border border-[#dae7ff] dark:border-[#2a2d33] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSourceTab("url")}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    sourceTab === "url"
                      ? "bg-[#3b86ff] text-white shadow-[0_2px_10px_rgba(59,134,255,0.45)]"
                      : "text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white font-medium"
                  }`}
                >
                  Link / Stream
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("upload")}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    sourceTab === "upload"
                      ? "bg-[#3b86ff] text-white shadow-[0_2px_10px_rgba(59,134,255,0.45)]"
                      : "text-[#4d5b85] hover:text-[#0c1836] dark:text-[#9da4b0] dark:hover:text-white font-medium"
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
              <div className="p-4 rounded-xl border border-[#b5d2ff] bg-[#eef4ff] text-xs text-[#2563eb] dark:border-[#3b86ff]/30 dark:bg-[#111e3e]/40 dark:text-[#85b5ff] flex items-center gap-2.5">
                <Loading01 className="w-4 h-4 animate-spin text-[#3b86ff] stroke-[2]" />
                <span>Extracting video metadata, duration, audio streams, and heatmap indicators...</span>
              </div>
            )}

            {/* Probe Result Card */}
            {probe && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl border border-[#dae7ff] bg-[#f5f8ff] dark:border-[#2a2d33] dark:bg-[#1c1e22]/70 shadow-xs">
                {probe.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={probe.thumbnail}
                    alt={probe.title}
                    className="w-full sm:w-36 h-20 object-cover rounded-xl flex-none border border-[#dae7ff] dark:border-[#2a2d33]"
                  />
                ) : (
                  <div className="w-full sm:w-36 h-20 rounded-xl bg-[#eef4ff] border border-[#dae7ff] dark:bg-[#141518] dark:border-[#2a2d33] flex items-center justify-center flex-none text-[#4d5b85] dark:text-[#9da4b0]">
                    <Film01 className="w-7 h-7 stroke-[1.5]" />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="text-sm font-semibold text-[#0c1836] dark:text-white line-clamp-1">{probe.title}</div>
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
                      <Badge variant="brand" size="sm">
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
            <section className="space-y-4 pt-6 border-t border-[#dae7ff] dark:border-[#2a2d33]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#eef4ff] text-[#2563eb] border border-[#b5d2ff] dark:bg-[#111e3e] dark:border-[#3b86ff]/40 dark:text-[#85b5ff] text-xs font-bold flex items-center justify-center">
                  02
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d5b85] dark:text-[#9da4b0]">
                  {isLive ? "Stream Recording Window" : "Video Selection Range"}
                </h2>
              </div>

              {isLive ? (
                <div className="space-y-3 p-4 rounded-2xl bg-[#f5f8ff] dark:bg-[#1c1e22]/55 border border-[#dae7ff] dark:border-[#2a2d33]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#4d5b85] dark:text-[#9da4b0]">Capture Window</span>
                    <span className="text-[#3b86ff] font-bold">{liveMinutes} minutes</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={liveMinutes}
                    onChange={(e) => setLiveMinutes(Number(e.target.value))}
                    className="w-full accent-[#3b86ff]"
                    aria-label="Minutes of live stream to record"
                  />
                  <p className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0]">
                    Recording initiates upon submission; short clips are rendered right after capture finishes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#f5f8ff] dark:bg-[#1c1e22]/55 border border-[#dae7ff] dark:border-[#2a2d33]">
                  <div className="dual-range relative h-7">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-[#dae7ff] dark:bg-[#2a2d33]" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-[#2563eb] via-[#3b86ff] to-[#6ea8ff] shadow-xs"
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
                      <span className="text-[#4d5b85] dark:text-[#9da4b0] pb-2.5">→</span>
                      <TimeInput label="To (End)" value={rangeEnd} onCommit={setEnd} />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-[#4d5b85] dark:text-[#9da4b0] font-semibold">
                          Selected Duration
                        </div>
                        <div className="text-sm font-bold text-[#3b86ff] font-mono">
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
          <section className="space-y-4 pt-6 border-t border-[#dae7ff] dark:border-[#2a2d33]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#eef4ff] text-[#2563eb] border border-[#b5d2ff] dark:bg-[#111e3e] dark:border-[#3b86ff]/40 dark:text-[#85b5ff] text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d5b85] dark:text-[#9da4b0]">
                Clip Count & Duration Presets
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
              {/* Number of Clips */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] block">Total Clips</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Fewer clips"
                    onClick={() => setClipCount((c) => Math.max(2, c - 1))}
                    className="w-10 h-10 rounded-xl border border-[#dae7ff] dark:border-[#2a2d33] bg-white dark:bg-[#1c1e22] hover:bg-[#eef4ff] dark:hover:bg-[#24272c] text-[#0c1836] dark:text-[#f1f4f9] flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4 stroke-[2]" />
                  </button>
                  <input
                    type="number"
                    min={2}
                    value={clipCount}
                    onChange={(e) => setClipCount(Math.max(2, Math.floor(Number(e.target.value) || 2)))}
                    className="w-16 h-10 bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] rounded-xl text-center text-sm font-bold text-[#0c1836] dark:text-white focus:outline-none focus:border-[#3b86ff] focus:ring-4 focus:ring-[#3b86ff]/20 shadow-xs"
                    aria-label="Number of clips"
                  />
                  <button
                    type="button"
                    aria-label="More clips"
                    onClick={() => setClipCount((c) => c + 1)}
                    className="w-10 h-10 rounded-xl border border-[#dae7ff] dark:border-[#2a2d33] bg-white dark:bg-[#1c1e22] hover:bg-[#eef4ff] dark:hover:bg-[#24272c] text-[#0c1836] dark:text-[#f1f4f9] flex items-center justify-center transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
                <div className="text-[11px] text-[#4d5b85] dark:text-[#9da4b0]">
                  Minimum 2.{probe && selectedLen > 0 && ` Fits ~${suggestedMax} clips.`}
                </div>
              </div>

              {/* Length Presets using SelectionCards */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] flex items-center justify-between">
                  <span>Clip Length Target</span>
                  <span className="font-mono text-[#3b86ff] font-bold">
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
                      className="w-20 bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] rounded-xl px-2.5 py-1.5 text-xs text-center text-[#0c1836] dark:text-[#f1f4f9] focus:outline-none focus:border-[#3b86ff]"
                    />
                    <span className="text-[#4d5b85] dark:text-[#9da4b0] text-xs">to</span>
                    <input
                      type="number"
                      min={2}
                      max={180}
                      value={maxDuration}
                      aria-label="Maximum clip seconds"
                      onChange={(e) => setMaxDuration(Math.max(2, Math.min(180, Number(e.target.value))))}
                      className="w-20 bg-white dark:bg-[#1c1e22] border border-[#dae7ff] dark:border-[#2a2d33] rounded-xl px-2.5 py-1.5 text-xs text-center text-[#0c1836] dark:text-[#f1f4f9] focus:outline-none focus:border-[#3b86ff]"
                    />
                    <span className="text-[#4d5b85] dark:text-[#9da4b0] text-[11px]">seconds (max 180s)</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 4: Samsaam Studio — Captions, Animations & Layout */}
          <section id="caption-styles" className="space-y-6 pt-6 border-t border-[#dae7ff] dark:border-[#2a2d33]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#eef4ff] text-[#2563eb] border border-[#b5d2ff] dark:bg-[#111e3e] dark:border-[#3b86ff]/40 dark:text-[#85b5ff] text-xs font-bold flex items-center justify-center">
                04
              </span>
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#4d5b85] dark:text-[#9da4b0]">
                Captions, Animations & Layout
              </h2>
            </div>

            {/* Feature Toggles */}
            <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-[#f5f8ff] dark:bg-[#1c1e22]/55 border border-[#dae7ff] dark:border-[#2a2d33]">
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
                {/* Samsaam Two-Column Studio: Left Stage + Right Motion/Glow Pills */}
                {(() => {
                  const selectedSpec = STYLES.find((x) => x.id === captionPreset) ?? STYLES[0];
                  const resolvedAnim = captionAnimation === "auto" ? selectedSpec.anim : captionAnimation;
                  return (
                    <div
                      id="animation-studio"
                      className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-3 items-stretch"
                    >
                      {/* Left Dark Studio Stage */}
                      <div className="flex flex-col gap-2.5">
                        <CaptionStylePreview
                          spec={selectedSpec}
                          overrideFont={font}
                          overrideAnimation={captionAnimation}
                          overrideGlow={captionGlow}
                          interactive
                        />
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#dae7ff] dark:border-[#2a2d33] bg-[#f5f8ff] dark:bg-[#111216]/90 text-[11px]">
                          <span className="font-semibold text-[#0c1836] dark:text-white truncate">
                            {selectedSpec.label}
                          </span>
                          <span className="text-[#4d5b85] dark:text-[#9da4b0] truncate">
                            {font || "Paired"} · {resolvedAnim} · Glow: {captionGlow}
                          </span>
                        </div>
                      </div>

                      {/* Right Motion & Glow Pill Panel (Samsaam AnimationShowcase style) */}
                      <div className="flex flex-col justify-between gap-4 p-5 rounded-2xl border border-[#dae7ff] dark:border-[#2a2d33] bg-[#f5f8ff] dark:bg-gradient-to-b dark:from-[#111216]/90 dark:to-[#0c0d10]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold tracking-tight text-[#0c1836] dark:text-[#f1f4f9] text-center lg:text-left">
                            Animation Presets
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            {ANIMATIONS.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                data-active={captionAnimation === a.id ? "true" : "false"}
                                onClick={() => setCaptionAnimation(a.id)}
                                className="samsaam-pill cursor-pointer"
                              >
                                {a.id === "auto" ? "Auto" : a.label.replace(/\s*\([^)]*\)/g, "")}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-[#dae7ff] dark:border-[#2a2d33]">
                          <div className="text-xs font-semibold text-[#4d5b85] dark:text-[#9da4b0]">
                            Glow Intensity
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {GLOW_LEVELS.map((g) => {
                              const active = captionGlow === g.id;
                              return (
                                <button
                                  key={g.id}
                                  type="button"
                                  onClick={() => setCaptionGlow(g.id)}
                                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                    active
                                      ? "bg-[#3b86ff] text-white border-[#3b86ff] shadow-[0_0_16px_-4px_rgba(59,134,255,0.7)]"
                                      : "bg-white dark:bg-[#1c1e22] text-[#4d5b85] dark:text-[#9da4b0] border-[#dae7ff] dark:border-[#2a2d33] hover:border-[#3b86ff]/50"
                                  }`}
                                >
                                  {g.id === "auto" ? "Style Default" : g.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 12 Samsaam Creator Styles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] tracking-wide block">
                      Samsaam Collection (12 Creator Templates)
                    </label>
                    <span className="text-[11px] text-[#3b86ff] font-medium">
                      Click any card to preview live
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STYLES.slice(9).map((s) => (
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

                {/* 9 Classic Styles */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] tracking-wide block">
                    Classic Viral Styles (9 Presets)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STYLES.slice(0, 9).map((s) => (
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

                {/* Fonts Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] tracking-wide block">
                    Subtitle Typography Override
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
                              ? "border-[#3b86ff] bg-[#eef4ff] dark:bg-[#111e3e]/70 ring-2 ring-[#3b86ff]/25 shadow-xs"
                              : "border-[#dae7ff] bg-white dark:border-[#2a2d33] dark:bg-[#111216]/90 hover:border-[#b5d2ff] dark:hover:border-[#3b86ff]/40 hover:bg-[#f5f8ff] dark:hover:bg-[#181a20]"
                          }`}
                        >
                          <div
                            className="text-xs text-[#3b86ff] dark:text-[#85b5ff] truncate"
                            style={{
                              fontFamily: f.css,
                              fontWeight: f.weight ?? 800,
                              fontStyle: f.italic ? "italic" : "normal",
                            }}
                          >
                            VIRAL HOOK
                          </div>
                          <div className="text-[10px] text-[#4d5b85] dark:text-[#9da4b0] mt-1">{f.label}</div>
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
                  <label className="text-xs font-semibold text-[#0c1836] dark:text-[#f1f4f9] tracking-wide block">
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
