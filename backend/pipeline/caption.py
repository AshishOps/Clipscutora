"""
Word-by-word animated ASS captions with multi-layer neon glow, bundled Google Fonts,
per-word motion presets, and burned-in title label.
Features:
- Continuation token merging (Whisper token repair)
- Character & duration budgeting
- 21 presets (9 classic + 12 Samsaam-inspired creator styles)
- 10 entrance & word animation modes (bounce-drop, word-by-word, word-wave, blur-in,
  soft-rise, drift-right, focus-settle, pop, flicker-in, none)
- Multi-layer ASS glow rendering (Layer 0 outer bloom + Layer 1 core halo + Layer 2 crisp text)
- Soft-focus upcoming word dimming & blur resolution
- Layout-aware safe margins (split-cam seam, mobile safe zone)
- Native-script captions with per-word font switching
- UTF-8 with BOM (utf-8-sig) for Windows libass reliability
"""
import logging
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import config
from .transcribe import WordTimestamp

logger = logging.getLogger("viral_clipper.caption")


def _ass_time(seconds: float) -> str:
    """Format seconds into ASS timestamp H:MM:SS.cc (centiseconds)."""
    seconds = max(0.0, seconds)
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    cs = int(round((seconds - int(seconds)) * 100))
    if cs >= 100:
        cs = 99
    return f"{hrs}:{mins:02d}:{secs:02d}.{cs:02d}"


def _escape_ass_text(text: str) -> str:
    """Neutralize characters that would interfere with ASS override tags or line breaks."""
    return (
        str(text or "")
        .replace("\\", "/")
        .replace("{", "(")
        .replace("}", ")")
        .replace("\r", " ")
        .replace("\n", " ")
        .strip()
    )


# Unicode ranges -> script key in config.CAPTION_SCRIPT_FONTS
_SCRIPT_RANGES = [
    (0x0900, 0x097F, "devanagari"), (0xA8E0, 0xA8FF, "devanagari"),
    (0x0980, 0x09FF, "bengali"), (0x0A00, 0x0A7F, "gurmukhi"), (0x0A80, 0x0AFF, "gujarati"),
    (0x0B80, 0x0BFF, "tamil"), (0x0C00, 0x0C7F, "telugu"), (0x0C80, 0x0CFF, "kannada"),
    (0x0D00, 0x0D7F, "malayalam"), (0x0600, 0x06FF, "arabic"),
    (0x3040, 0x30FF, "cjk"), (0x4E00, 0x9FFF, "cjk"), (0xAC00, 0xD7AF, "cjk"),
]
_SENTENCE_END = (".", "!", "?", ",", "।", "॥", "؟", "。", "！", "？", "，")


def _word_script(text: str) -> Optional[str]:
    """Return the non-Latin script a word is written in, or None for Latin/other."""
    for ch in text:
        cp = ord(ch)
        for lo, hi, name in _SCRIPT_RANGES:
            if lo <= cp <= hi:
                return name
    return None


def _font_override(text: str, size: int) -> str:
    """ASS override tags selecting a font that can render this word ("" for Latin words)."""
    script = _word_script(text)
    font = config.CAPTION_SCRIPT_FONTS.get(script) if script else None
    return f"\\fn{font}\\fs{size}" if font else ""


def _merge_continuation_words(words: List[WordTimestamp]) -> List[WordTimestamp]:
    """Merge faster-whisper continuation fragments onto their base word."""
    merged: List[WordTimestamp] = []
    for w in words:
        text = w.word.strip()
        is_fragment = bool(text) and (text[0] in "'’" or all(not c.isalnum() for c in text))
        if merged and is_fragment:
            prev = merged[-1]
            prev.word = f"{prev.word}{text}"
            if w.end > prev.end:
                prev.end = w.end
        else:
            merged.append(WordTimestamp(word=text.strip(), start=w.start, end=w.end, confidence=w.confidence))
    return merged


def _collect_word_blocks(
    words: List[WordTimestamp],
    max_chars: int = 16,
    max_duration: float = 1.4,
) -> List[List[WordTimestamp]]:
    """Group words into short, punchy blocks suitable for 9:16 vertical video."""
    blocks: List[List[WordTimestamp]] = []
    current_block: List[WordTimestamp] = []
    block_start: Optional[float] = None

    for w in words:
        if not current_block:
            current_block = [w]
            block_start = w.start
            continue

        curr_chars = sum(len(x.word) + 1 for x in current_block)
        duration = w.end - (block_start or w.start)
        prev_has_punct = current_block[-1].word.endswith(_SENTENCE_END)
        if curr_chars + len(w.word) > max_chars or duration > max_duration or prev_has_punct:
            blocks.append(current_block)
            current_block = [w]
            block_start = w.start
        else:
            current_block.append(w)

    if current_block:
        blocks.append(current_block)
    return blocks


def _rgb(hex_rgb: str, alpha: int = 0) -> str:
    """'FFE500' -> ASS colour &HAABBGGRR& (alpha 0 = opaque, 255 = invisible)."""
    hex_rgb = hex_rgb.lstrip("#")
    r, g, b = hex_rgb[0:2], hex_rgb[2:4], hex_rgb[4:6]
    return f"&H{alpha:02X}{b}{g}{r}&".upper()


WHITE, BLACK = _rgb("FFFFFF"), _rgb("000000")

# ── Caption Styles (9 Classic + 12 Samsaam Creator Styles) ───────────────────────
CAPTION_STYLES: Dict[str, Dict[str, Any]] = {
    # Classic Presets
    "streamer": dict(
        label="Streamer", desc="Yellow 1-3 words, zoom pop",
        font="Arial Black", size=88, char_w=0.80, text=_rgb("FFE135"), active=_rgb("FFE135"),
        outline=BLACK, border=7, shadow=3, back=_rgb("000000", 0x50),
        mode="chunk", max_words=3, upper=True, pop=116, anim="pop",
    ),
    "hormozi": dict(
        label="Hormozi", desc="White words, yellow active word, reveal",
        font="Arial Black", size=84, char_w=0.80, text=WHITE, active=_rgb("FFE500"),
        outline=BLACK, border=6, shadow=3, back=_rgb("000000", 0x50),
        mode="highlight", reveal=True, max_words=4, upper=True, pop=110, anim="pop",
    ),
    "beast": dict(
        label="Beast", desc="One huge word at a time, colour cycling",
        font="Impact", size=140, char_w=0.56, text=WHITE,
        palette=[_rgb("FFE500"), _rgb("3CFF4A"), _rgb("FF3B3B"), _rgb("2DE1FC"), WHITE],
        outline=BLACK, border=9, shadow=5, back=_rgb("000000", 0x30),
        mode="single", upper=True, pop=112, tilt=True, anim="pop",
    ),
    "neon": dict(
        label="Neon", desc="Glowing lime outline, electric pop",
        font="Segoe UI Black", size=84, char_w=0.74, text=WHITE, active=_rgb("A3FF12"),
        outline=_rgb("4BC800"), border=4, shadow=0, back=BLACK, blur=6,
        glow=dict(color="A3FF12", strength=65, blur=16),
        mode="highlight", reveal=False, max_words=3, upper=True, pop=112, anim="pop",
    ),
    "boxed": dict(
        label="Boxed", desc="White text on black box, yellow active",
        font="Arial Black", size=70, char_w=0.80, text=WHITE, active=_rgb("FFE500"),
        outline=_rgb("000000", 0x20), border=14, shadow=0, back=BLACK, border_style=3,
        mode="highlight", reveal=False, max_words=3, upper=True, pop=100, anim="none",
    ),
    "karaoke": dict(
        label="Karaoke", desc="Words fill orange as they are spoken",
        font="Arial Black", size=84, char_w=0.80, text=WHITE, active=_rgb("FFB300"),
        outline=BLACK, border=6, shadow=3, back=_rgb("000000", 0x50),
        mode="karaoke", max_words=3, upper=True, anim="none",
    ),
    "fire": dict(
        label="Fire", desc="Gold Impact text, red outline, white pop",
        font="Impact", size=112, char_w=0.56, text=_rgb("FFC300"), active=WHITE,
        outline=_rgb("D7141A"), border=6, shadow=4, back=BLACK,
        glow=dict(color="FF4D00", strength=60, blur=18),
        mode="chunk", max_words=2, upper=True, pop=120, anim="pop",
    ),
    "meme": dict(
        label="Meme", desc="Comic font, 3D shadow, wobble",
        font="Comic Sans MS", size=86, char_w=0.68, text=WHITE, active=_rgb("FFE500"),
        outline=BLACK, border=8, shadow=6, back=BLACK,
        mode="highlight", reveal=True, max_words=3, upper=True, pop=115, wobble=True, anim="pop",
    ),
    "clean": dict(
        label="Clean", desc="Minimal white, soft shadow",
        font="Segoe UI", size=76, char_w=0.58, text=WHITE, active=_rgb("FFF3A0"),
        outline=BLACK, border=0, shadow=3, back=_rgb("000000", 0x70),
        mode="highlight", reveal=False, max_words=4, upper=False, pop=104, anim="soft-rise",
    ),

    # ── Exact 12 Samsaam Showcase Styles (samsaam.io) ──────────────────────────
    "portugal": dict(
        label="Portugal", desc="White Inter stack with red Playfair italic emphasis words",
        font="Inter", size=88, char_w=0.64, text=WHITE, active=_rgb("FF0000"),
        outline=BLACK, border=4, shadow=2, back=_rgb("000000", 0x55),
        emphasis_face=dict(font="Playfair Display", italic=True, scale=1.24, upper=False),
        mode="highlight", reveal=False, max_words=4, upper=False, pop=108, anim="word-by-word",
    ),
    "business": dict(
        label="Business", desc="Crisp white TeX Gyre Heros around huge lime-gold hero word",
        font="TeXGyreHeros", size=78, char_w=0.66, text=WHITE, active=_rgb("A8E34B"),
        outline=BLACK, border=4, shadow=2, back=BLACK,
        glow=dict(color="A8E34B", strength=38, blur=14),
        hero_font="TeXGyreHeros", hero_scale=1.62, hero_upper=True,
        mode="splash_hero", max_words=4, upper=False, pop=110, anim="drift-right",
    ),
    "attention": dict(
        label="Attention", desc="Small white Montserrat lead; blazing orange italic punchline",
        font="Montserrat ExtraBold", size=86, char_w=0.78, text=WHITE, active=_rgb("FF6D00"),
        outline=BLACK, border=5, shadow=3, back=BLACK,
        glow=dict(color="FF1E00", strength=70, blur=16),
        row1_font="Montserrat", row1_color=WHITE, row1_scale=66, row1_italic=False, row1_upper=True,
        row2_italic=True, row2_upper=True, row2_scale=108,
        mode="two_line", max_words=4, upper=True, pop=112, anim="soft-rise",
    ),
    "trading_bro": dict(
        label="Trading Bro", desc="Small white Inter words tucked under glowing red Poppins caps",
        font="Inter", size=72, char_w=0.64, text=WHITE, active=_rgb("E90000"),
        outline=BLACK, border=4, shadow=3, back=BLACK,
        glow=dict(color="E90000", strength=72, blur=18),
        hero_font="Poppins", hero_scale=1.50, hero_lower=True,
        mode="splash_hero", max_words=4, upper=False, pop=110, anim="word-by-word",
    ),
    "aura_glow": dict(
        label="Aura Glow", desc="White Inter composition around electric neon-green centre word",
        font="Inter", size=78, char_w=0.64, text=WHITE, active=_rgb("16FF00"),
        outline=BLACK, border=5, shadow=2, back=BLACK,
        glow=dict(color="16FF00", strength=78, blur=24),
        hero_font="Montserrat Black", hero_scale=1.42, hero_upper=True,
        mode="splash_hero", max_words=3, upper=False, pop=114, anim="drift-right",
    ),
    "crazy": dict(
        label="Crazy", desc="Bold Plus Jakarta Sans stack with electric blue callout words",
        font="Plus Jakarta Sans ExtraBold", size=84, char_w=0.72, text=WHITE, active=_rgb("0064FF"),
        outline=BLACK, border=4, shadow=2, back=BLACK,
        glow=dict(color="FFFFFF", strength=42, blur=16),
        mode="highlight", reveal=False, max_words=4, upper=False, pop=110, anim="word-wave",
    ),
    "real_shamani": dict(
        label="Real Shamani", desc="Uppercase Montserrat stack with neon colour-cycling emphasis",
        font="Montserrat ExtraBold", size=82, char_w=0.78, text=WHITE, active=_rgb("22E55B"),
        active_palette=[
            _rgb("22E55B"), _rgb("2F7BFF"), _rgb("FF4FB8"), _rgb("FF8A1F"),
            _rgb("F5F51A"), _rgb("19E3F0"), _rgb("FF2A2A"),
        ],
        outline=BLACK, border=5, shadow=4, back=_rgb("000000", 0x55),
        glow=dict(color="FFFFFF", strength=30, blur=14),
        mode="highlight", reveal=False, max_words=4, upper=True, pop=112, anim="word-wave",
    ),
    "bouncy_trendy": dict(
        label="Bouncy Trendy", desc="Italic Inter white lead over glowing lime Kanit punchline",
        font="Kanit Black", size=88, char_w=0.72, text=_rgb("ECECEC"), active=_rgb("C4FF00"),
        outline=BLACK, border=5, shadow=4, back=_rgb("000000", 0x50),
        glow=dict(color="C4FF00", strength=72, blur=19),
        row1_font="Inter Medium", row1_color=_rgb("ECECEC"), row1_italic=True, row1_scale=88, row1_upper=True,
        row2_italic=True, row2_upper=True, row2_scale=110,
        mode="two_line", max_words=4, upper=True, pop=112, anim="bounce-drop",
    ),
    "afterglow": dict(
        label="Afterglow", desc="Glowing yellow Archivo Black caps above white Caveat script",
        font="Caveat", size=88, char_w=0.52, text=_rgb("FAF830"), active=WHITE,
        outline=BLACK, border=4, shadow=4, back=BLACK,
        glow=dict(color="FAF830", strength=68, blur=24),
        row1_font="Archivo Black", row1_color=_rgb("FAF830"), row1_italic=False, row1_scale=104, row1_upper=True,
        row2_color=WHITE, row2_italic=False, row2_upper=False, row2_scale=88,
        mode="two_line", max_words=4, upper=False, pop=108, anim="soft-rise",
    ),
    "tokyo": dict(
        label="Tokyo", desc="Tight bold lowercase Montserrat with glowing cobalt blue focus",
        font="Montserrat ExtraBold", size=86, char_w=0.76, text=WHITE, active=_rgb("456FFD"),
        outline=BLACK, border=5, shadow=5, back=_rgb("000000", 0x55),
        glow=dict(color="456FFD", strength=68, blur=16),
        mode="highlight", reveal=False, max_words=4, lower=True, pop=110, anim="word-by-word",
    ),
    "devin_jatho": dict(
        label="Devin Jatho", desc="Heavy white italic Montserrat over glowing crimson red row",
        font="Montserrat Black", size=86, char_w=0.80, text=WHITE, active=_rgb("FF0000"),
        outline=BLACK, border=5, shadow=4, back=BLACK,
        glow=dict(color="FF0000", strength=76, blur=20),
        row1_font="Montserrat Black", row1_color=WHITE, row1_italic=True, row1_scale=92, row1_upper=True,
        row2_italic=True, row2_upper=True, row2_scale=112,
        mode="two_line", max_words=4, upper=True, pop=110, anim="drift-right",
    ),
    "tech_bro": dict(
        label="Tech Bro", desc="Crisp white Montserrat over massive tall yellow Anton word",
        font="Anton", size=90, char_w=0.54, text=WHITE, active=_rgb("FFCD00"),
        outline=BLACK, border=5, shadow=4, back=BLACK,
        glow=dict(color="FFCD00", strength=38, blur=14),
        row1_font="Montserrat", row1_color=WHITE, row1_italic=False, row1_scale=68, row1_upper=True,
        row2_color=_rgb("FFCD00"), row2_italic=False, row2_upper=True, row2_scale=145,
        mode="two_line", max_words=4, upper=True, pop=110, anim="soft-rise",
    ),
}

STYLE_ALIASES = {
    "lime": "neon",
    "pill": "boxed",
    "glow": "aura_glow",
    "creator": "bouncy_trendy",
    "kalakarglow": "aura_glow",
    "mumbai": "afterglow",
    "taha-create": "devin_jatho",
    "spanish": "portugal",
    "businessman": "business",
    "word-punch": "attention",
    "trading-bro": "trading_bro",
    "choreo": "crazy",
    "real-shamani": "real_shamani",
    "kalakar-beam-2": "tech_bro",
    # Previous aliases mapped cleanly
    "word_by_word": "portugal",
    "word_staircase": "crazy",
    "deep_pop": "tokyo",
    "kinetic_hook": "attention",
    "soft_focus": "portugal",
    "postcard": "boxed",
    "neon_splash": "aura_glow",
    "gold_sweep": "tech_bro",
}

VALID_ANIMATIONS = {
    "auto", "none", "pop", "bounce-drop", "word-by-word",
    "word-wave", "blur-in", "soft-rise", "drift-right", "focus-settle", "flicker-in",
}

GLOW_MULTIPLIERS = {
    "auto": 1.0,
    "off": 0.0,
    "subtle": 0.55,
    "medium": 1.0,
    "intense": 1.45,
}


def resolve_style(name: Optional[str]) -> str:
    name = (name or config.DEFAULT_CAPTION_STYLE).lower()
    name = STYLE_ALIASES.get(name, name)
    return name if name in CAPTION_STYLES else "streamer"


def _clean_title(title: str) -> str:
    """Strip emoji/symbols (libass can't draw colour emoji) and tidy whitespace."""
    import unicodedata
    out = []
    for c in title or "":
        cp = ord(c)
        if unicodedata.category(c) in ("So", "Cs", "Co") or cp >= 0x1F000 or 0xFE00 <= cp <= 0xFE0F or c == "\u200d":
            continue
        out.append(c)
    text = re.sub(r"\s+", " ", "".join(out)).strip(" -|:")
    if len(text) > 60:
        text = text[:60].rsplit(" ", 1)[0]
    return _escape_ass_text(text)


def _build_entrance_tags(anim: str, cx: int, cy: int, pop: int, is_block_start: bool) -> str:
    """Build ASS entrance tags for the block start or individual word event."""
    if anim == "none" or not anim:
        return f"\\an5\\pos({cx},{cy})"

    if not is_block_start:
        # Keep multi-word line anchored so words don't re-slide mid-line
        return f"\\an5\\pos({cx},{cy})"

    if anim == "bounce-drop":
        return (
            f"\\an5\\move({cx},{cy - 38},{cx},{cy},0,145)\\fad(45,0)"
            f"\\fscx90\\fscy90\\t(0,115,\\fscx{max(108, pop)}\\fscy{max(108, pop)})"
            f"\\t(115,210,\\fscx100\\fscy100)"
        )
    if anim == "word-by-word":
        return f"\\an5\\move({cx},{cy + 36},{cx},{cy},0,150)\\fad(65,0)"
    if anim == "word-wave":
        return f"\\an5\\move({cx},{cy + 42},{cx},{cy},0,165)\\blur10\\fad(50,0)\\t(0,165,\\blur0)"
    if anim == "blur-in":
        return f"\\an5\\pos({cx},{cy})\\blur16\\alpha&H99&\\t(0,150,\\blur0\\alpha&H00&)"
    if anim == "soft-rise":
        return f"\\an5\\move({cx},{cy + 24},{cx},{cy},0,160)\\blur8\\fad(60,0)\\t(0,160,\\blur0)"
    if anim == "drift-right":
        return f"\\an5\\move({cx - 38},{cy},{cx},{cy},0,150)\\blur6\\fad(50,0)\\t(0,150,\\blur0)"
    if anim == "focus-settle":
        return (
            f"\\an5\\pos({cx},{cy})\\fscx124\\fscy124\\blur8\\fad(40,0)"
            f"\\t(0,155,\\fscx100\\fscy100\\blur0)"
        )
    if anim == "flicker-in":
        return (
            f"\\an5\\pos({cx},{cy})\\alpha&HFF&\\t(0,30,\\alpha&H22&)"
            f"\\t(30,60,\\alpha&HCC&)\\t(60,115,\\alpha&H00&)"
        )
    # "pop" handled per active word inline
    return f"\\an5\\pos({cx},{cy})"


async def generate_captions(
    all_words: List[WordTimestamp],
    clip_start: float,
    clip_end: float,
    output_path: Path,
    layout_type: str = "split_cam",
    preset: str = "streamer",
    title: Optional[str] = None,
    include_words: bool = True,
    font: Optional[str] = None,
    animation: Optional[str] = None,
    glow: Optional[str] = None,
) -> Path:
    """Write an ASS subtitle file with animated word captions and optional multi-layer glow."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    style_name = resolve_style(preset)
    st = dict(CAPTION_STYLES[style_name])
    font = font or config.CAPTION_FONT_OVERRIDE
    if font:
        st["font"] = font
        st["char_w"] = config.CAPTION_FONT_WIDTHS.get(font, 0.72)

    anim_mode = (animation or "auto").lower()
    if anim_mode == "auto" or anim_mode not in VALID_ANIMATIONS:
        anim_mode = st.get("anim", "pop")

    glow_mode = (glow or "auto").lower()
    glow_mult = GLOW_MULTIPLIERS.get(glow_mode, 1.0)
    glow_cfg = st.get("glow")
    if glow_mode in ("subtle", "medium", "intense") and not glow_cfg:
        # Derive a matching glow from the active/text colour when user explicitly requests glow
        hex_src = "FFE500" if style_name in ("hormozi", "streamer", "boxed") else "FFFFFF"
        glow_cfg = dict(color=hex_src, strength=65, blur=18)

    W, H = config.OUTPUT_WIDTH, config.OUTPUT_HEIGHT
    clip_dur = max(0.1, clip_end - clip_start)

    # 1. Words inside the clip, relative timestamps
    raw_clip_words: List[WordTimestamp] = []
    for w in (all_words if include_words else []):
        if w.end >= clip_start and w.start <= clip_end:
            rel_start = max(0.0, round(w.start - clip_start, 2))
            rel_end = max(rel_start + 0.10, round(min(clip_dur, w.end - clip_start), 2))
            if w.word.strip():
                raw_clip_words.append(
                    WordTimestamp(word=w.word.strip(), start=rel_start, end=rel_end, confidence=w.confidence)
                )
    clean_words = _merge_continuation_words(raw_clip_words)

    # 2. Geometry
    scale = config.CAPTION_SIZE_SCALE
    size = int(round(st["size"] * scale))
    border = round(st["border"] * (scale if st.get("border_style", 1) == 1 else 1), 1)
    split = layout_type == "split_cam"
    cy = int(H * (config.CAPTION_Y_SPLIT if split else config.CAPTION_Y_DEFAULT))
    avail_w = W - 120
    pop = st.get("pop", 100)

    def est_width(words: List[str], fs: int) -> float:
        chars = sum(len(x) for x in words) + max(0, len(words) - 1)
        return chars * fs * st["char_w"] * max(pop, 100) / 100.0

    max_chars = max(6, int(avail_w / (size * st["char_w"] * max(pop, 100) / 100.0)))
    max_words = 1 if st["mode"] == "single" else st.get("max_words", 3)

    def fmt(word: str) -> str:
        t = _escape_ass_text(word)
        if st.get("upper"):
            return t.upper()
        if st.get("lower"):
            return t.lower()
        return t

    if st["mode"] == "karaoke":
        primary, secondary = st["active"], st["text"]
    else:
        primary, secondary = st["text"], st.get("active", st["text"])

    title_size = int(round(54 * scale))
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{st['font']},{size},{primary},{secondary},{st['outline']},{st['back']},1,0,0,0,100,100,0,0,{st.get('border_style', 1)},{border},{st['shadow']},5,60,60,0,1
Style: Title,Arial Black,{title_size},{WHITE},{WHITE},{_rgb('000000', 0x10)},{_rgb('000000', 0x10)},1,0,0,0,100,100,0,0,3,14,0,2,90,90,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines: List[str] = []

    def emit_with_glow(ev_s: float, ev_e: float, lead_tags: str, body_text: str, glow_override: Optional[str] = None) -> None:
        """Emit foreground event at Layer 2, plus optional inner/outer glow layers at Layers 1 and 0."""
        ts_s, ts_e = _ass_time(ev_s), _ass_time(ev_e)
        if glow_cfg and glow_mult > 0 and st.get("border_style", 1) == 1:
            g_hex = (glow_override or glow_cfg["color"]).lstrip("#")
            g_strength = min(100.0, glow_cfg["strength"] * glow_mult)
            g_blur = max(4.0, glow_cfg["blur"] * scale * (0.7 + 0.3 * glow_mult))

            # Alpha 0 = opaque, 255 = invisible -> map strength to ASS alpha cleanly
            inner_alpha = max(60, min(230, int(255 - (g_strength / 100.0) * 165)))
            outer_alpha = max(130, min(244, int(255 - (g_strength / 100.0) * 95)))

            g_inner_col = _rgb(g_hex, inner_alpha)
            g_outer_col = _rgb(g_hex, outer_alpha)

            # Strip inline \c color overrides on glow layers? No, keep \1a&HFF& after reset/inline so fill stays hidden
            # Build glow text by ensuring primary fill is transparent (\1a&HFF&) and border carries glow
            outer_tags = f"\\1a&HFF&\\3c{g_outer_col}\\bord{round(border + 6 * scale, 1)}\\blur{round(g_blur * 1.9, 1)}\\shad0"
            inner_tags = f"\\1a&HFF&\\3c{g_inner_col}\\bord{round(border + 2.5 * scale, 1)}\\blur{round(g_blur, 1)}\\shad0"

            # Strip color changes inside body for pure halo or re-apply \1a&HFF& after resets
            clean_halo = re.sub(r"\\rDefault[^}]*", lambda m: m.group(0) + "\\1a&HFF&", body_text)
            clean_halo = re.sub(r"\\c&H[0-9A-Fa-f]+&", "", clean_halo)

            lines.append(f"Dialogue: 0,{ts_s},{ts_e},Default,,0,0,0,,{{{lead_tags}{outer_tags}}}{clean_halo}")
            lines.append(f"Dialogue: 1,{ts_s},{ts_e},Default,,0,0,0,,{{{lead_tags}{inner_tags}}}{clean_halo}")
            lines.append(f"Dialogue: 2,{ts_s},{ts_e},Default,,0,0,0,,{{{lead_tags}}}{body_text}")
        else:
            lines.append(f"Dialogue: 2,{ts_s},{ts_e},Default,,0,0,0,,{{{lead_tags}}}{body_text}")

    # 3. Title label
    clean_title = _clean_title(title) if title else ""
    if clean_title:
        if split:
            from .reframe import split_cam_height
            pos = f"\\an2\\pos({W // 2},{split_cam_height() - 30})"
        else:
            pos = f"\\an8\\pos({W // 2},{int(H * 0.12)})"
        tfn = _font_override(clean_title, int(title_size * 1.1))
        lines.append(
            f"Dialogue: 3,{_ass_time(0)},{_ass_time(clip_dur)},Title,,0,0,0,,"
            f"{{{pos}\\q0\\fad(250,0){tfn}}}{clean_title.upper()}"
        )

    # 4. Word captions
    blocks = _collect_word_blocks(clean_words, max_chars=max_chars, max_duration=1.3)
    split_blocks: List[List[WordTimestamp]] = []
    for b in blocks:
        for k in range(0, len(b), max_words):
            split_blocks.append(b[k:k + max_words])
    blocks = [b for b in split_blocks if b]

    base_blur = f"\\blur{st['blur']}" if st.get("blur") else ""
    palette = st.get("palette") or []
    word_counter = 0

    for b_idx, block in enumerate(blocks):
        texts = [fmt(w.word) for w in block]
        fs = size
        if est_width(texts, size) > avail_w:
            fs = max(int(size * 0.55), int(size * avail_w / est_width(texts, size)))
        line_tags = (f"\\fs{fs}" if fs != size else "") + base_blur
        reset = "{\\rDefault" + line_tags + "}"
        next_start = blocks[b_idx + 1][0].start if b_idx + 1 < len(blocks) else clip_dur

        def word_end(i: int) -> float:
            e = block[i + 1].start if i < len(block) - 1 else min(block[-1].end + 0.25, next_start)
            e = min(e, block[i].end + 0.6, next_start if i == len(block) - 1 else e)
            start = block[0].start if i == 0 else block[i].start
            return e if e > start else round(start + 0.12, 2)

        if st["mode"] == "karaoke":
            parts = []
            for i, w in enumerate(block):
                nxt = block[i + 1].start if i < len(block) - 1 else w.end
                dur_cs = max(5, int(round((nxt - w.start) * 100)))
                fn = _font_override(texts[i], int(fs * 1.12))
                parts.append(f"{{\\kf{dur_cs}{fn}}}{texts[i]}" + (reset if fn else ""))
            ev_s, ev_e = block[0].start, max(block[0].start + 0.2, min(block[-1].end + 0.3, next_start))
            ent = _build_entrance_tags(anim_mode, W // 2, cy, pop, True) + line_tags
            emit_with_glow(ev_s, ev_e, ent, " ".join(parts))
            continue

        # Two-line stacked mode (Bouncy Trendy, Devin Jatho, Attention, Afterglow, Tech Bro)
        if st["mode"] == "two_line" and len(block) >= 2:
            split_at = max(1, len(block) // 2)
            row1_indices = range(0, split_at)
            row2_indices = range(split_at, len(block))
            r1_font = st.get("row1_font")
            r1_italic = "\\i1" if st.get("row1_italic") else ("\\i0" if st.get("row2_italic") else "")
            r1_scale = int(fs * (st.get("row1_scale", 85) / 100.0))
            r1_color = st.get("row1_color", st["text"])
            r2_italic = "\\i1" if st.get("row2_italic") else ""
            r2_scale = int(fs * (st.get("row2_scale", 108) / 100.0))
            r2_base_color = st.get("row2_color", st.get("active", st["text"]))

            def row_fmt(word: str, is_row2: bool) -> str:
                t = _escape_ass_text(word)
                upper_flag = st.get("row2_upper", st.get("upper")) if is_row2 else st.get("row1_upper", st.get("upper"))
                return t.upper() if upper_flag else t

            r_texts = [row_fmt(w.word, idx >= split_at) for idx, w in enumerate(block)]

            for i, w in enumerate(block):
                ev_s = block[0].start if i == 0 else w.start
                ev_e = word_end(i)
                ent = _build_entrance_tags(anim_mode, W // 2, cy, pop, i == 0) + line_tags

                def render_word(j: int, is_row2: bool) -> str:
                    fn = _font_override(r_texts[j], int(fs * 1.12))
                    if not fn and not is_row2:
                        base_fn = f"\\fn{r1_font}" if r1_font else ""
                        fn = f"{base_fn}\\fs{r1_scale}{r1_italic}"
                    elif not fn and is_row2:
                        fn = f"\\fs{r2_scale}{r2_italic}"

                    if j == i:
                        col = f"\\c{st['active']}" if st.get("active") else (f"\\c{r2_base_color}" if is_row2 else f"\\c{r1_color}")
                        anim = ""
                        if anim_mode == "pop" and pop != 100:
                            anim = (
                                f"\\fscx92\\fscy92\\t(0,100,\\fscx{pop}\\fscy{pop})"
                                f"\\t(100,180,\\fscx{100 + (pop - 100) // 2}\\fscy{100 + (pop - 100) // 2})"
                            )
                        return f"{{{fn}{col}{anim}}}{r_texts[j]}{reset}"
                    elif is_row2:
                        col = f"\\c{r2_base_color}" if r2_base_color else ""
                        return f"{{{fn}{col}}}{r_texts[j]}{reset}"
                    else:
                        col = f"\\c{r1_color}" if r1_color != st["text"] else ""
                        return f"{{{fn}{col}}}{r_texts[j]}{reset}" if (fn or col) else r_texts[j]

                row1_str = " ".join(render_word(j, False) for j in row1_indices)
                row2_str = " ".join(render_word(j, True) for j in row2_indices)
                emit_with_glow(ev_s, ev_e, ent, f"{row1_str}\\N{row2_str}")
            continue

        # Splash Hero composition (Business, Trading Bro, Aura Glow): big hero active word + small white supports
        if st["mode"] == "splash_hero":
            hero_font = st.get("hero_font", st["font"])
            hero_fs = int(fs * st.get("hero_scale", 1.5))
            support_fs = max(18, int(fs * 0.72))
            for i, w in enumerate(block):
                ev_s = block[0].start if i == 0 else w.start
                ev_e = word_end(i)
                ent = _build_entrance_tags(anim_mode, W // 2, cy, pop, i == 0) + line_tags
                row_parts = []
                for j, _w in enumerate(block):
                    txt = _escape_ass_text(_w.word)
                    fn = _font_override(txt, int(fs * 1.12))
                    if j == i:
                        if st.get("hero_upper"):
                            txt = txt.upper()
                        elif st.get("hero_lower"):
                            txt = txt.lower()
                        hfn = fn or f"\\fn{hero_font}\\fs{hero_fs}"
                        col = f"\\c{st['active']}" if st.get("active") else ""
                        anim = ""
                        if anim_mode == "pop" or pop > 100:
                            anim = (
                                f"\\fscx90\\fscy90\\t(0,100,\\fscx{pop}\\fscy{pop})"
                                f"\\t(100,180,\\fscx100\\fscy100)"
                            )
                        row_parts.append(f"{{{hfn}{col}{anim}}}{txt}{reset}")
                    else:
                        sfn = fn or f"\\fs{support_fs}"
                        row_parts.append(f"{{{sfn}\\c{st['text']}}}{txt}{reset}")
                emit_with_glow(ev_s, ev_e, ent, "\\N".join(row_parts))
            continue

        active_palette = st.get("active_palette") or []
        emphasis_face = st.get("emphasis_face")

        for i, w in enumerate(block):
            ev_s = block[0].start if i == 0 else w.start
            ev_e = word_end(i)
            ent = _build_entrance_tags(anim_mode, W // 2, cy, pop, i == 0 or st["mode"] == "single") + line_tags

            if st["mode"] == "single":
                color = palette[word_counter % len(palette)] if palette else st["text"]
                tilt = f"\\frz{(-4 if word_counter % 2 else 4)}" if st.get("tilt") else ""
                fn = _font_override(texts[i], int(fs * 1.12))
                scale_anim = ""
                if anim_mode == "pop" or st.get("pop", 100) > 100:
                    scale_anim = (
                        f"\\fscx75\\fscy75\\t(0,90,\\fscx{pop}\\fscy{pop})"
                        f"\\t(90,170,\\fscx100\\fscy100)"
                    )
                body = f"{{\\c{color}{tilt}{fn}{scale_anim}}}{texts[i]}"
                emit_with_glow(ev_s, max(ev_e, ev_s + 0.25), ent, body)
                word_counter += 1
                continue

            parts = []
            for j, other in enumerate(block):
                fn = _font_override(texts[j], int(fs * 1.12))
                if j == i:
                    if active_palette:
                        act_col = active_palette[word_counter % len(active_palette)]
                        color = f"\\c{act_col}"
                    else:
                        color = f"\\c{st['active']}" if st.get("active") and st["active"] != st["text"] else ""
                    w_txt = texts[j]
                    face_tags = ""
                    if emphasis_face and not fn:
                        ef_font = emphasis_face.get("font")
                        ef_scale = int(fs * emphasis_face.get("scale", 1.2))
                        ef_it = "\\i1" if emphasis_face.get("italic") else ""
                        if ef_font:
                            face_tags = f"\\fn{ef_font}\\fs{ef_scale}{ef_it}"
                        if emphasis_face.get("upper"):
                            w_txt = w_txt.upper()
                    wob = f"\\frz{(-3 if i % 2 else 3)}" if st.get("wobble") else ""
                    anim = ""
                    if st.get("upcoming_blur"):
                        anim = f"\\blur{st['upcoming_blur']}\\alpha&H{st.get('upcoming_alpha', 0x88):02X}&\\t(0,120,\\blur0\\alpha&H00&)"
                    elif anim_mode == "pop" and pop != 100:
                        anim = (
                            f"\\fscx92\\fscy92\\t(0,100,\\fscx{pop}\\fscy{pop})"
                            f"\\t(100,180,\\fscx{100 + (pop - 100) // 2}\\fscy{100 + (pop - 100) // 2})"
                        )
                    parts.append(f"{{{fn}{face_tags}{color}{wob}{anim}}}{w_txt}{reset}")
                elif st.get("reveal") and j > i:
                    parts.append(f"{{{fn}\\alpha&HFF&}}{texts[j]}{reset}")
                elif st.get("upcoming_blur") and j > i:
                    parts.append(
                        f"{{{fn}\\blur{st['upcoming_blur']}\\alpha&H{st.get('upcoming_alpha', 0x88):02X}&}}{texts[j]}{reset}"
                    )
                else:
                    parts.append(f"{{{fn}}}{texts[j]}{reset}" if fn else texts[j])

            emit_with_glow(ev_s, ev_e, ent, " ".join(parts))
            word_counter += 1

    with open(output_path, "w", encoding="utf-8-sig") as f:
        f.write(header + "\n".join(lines) + "\n")
    logger.info(
        f"Captions: style={style_name}, anim={anim_mode}, glow={glow_mode}, "
        f"layout={layout_type}, {len(lines)} events, title={'yes' if clean_title else 'no'}"
    )
    return output_path
