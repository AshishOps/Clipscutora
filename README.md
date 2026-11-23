<div align="center">

# Clipscutora ⚡
### Autonomous AI 9:16 Shorts & Reels Generator

**Turn any long video, YouTube link, or livestream into high-converting 9:16 viral shorts with animated subtitles, speaker framing, and multimodal AI hook scoring.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Untitled UI](https://img.shields.io/badge/UI_System-Untitled_UI-12B76A?style=for-the-badge)](https://untitledui.com)
[![CUDA](https://img.shields.io/badge/GPU-CUDA_12_Accelerated-76B900?style=for-the-badge&logo=nvidia)](https://developer.nvidia.com/cuda-toolkit)
[![Whisper](https://img.shields.io/badge/Speech_AI-Faster--Whisper-blue?style=for-the-badge)](https://github.com/SYSTRAN/faster-whisper)

</div>

---

## ✨ Features

- **🎯 Multimodal Virality Scoring**: Combines Google Gemini AI judging, acoustic energy analysis, speech density, and YouTube replay heatmap detection to find peak viral moments.
- **🎨 Untitled UI Design System**: Built with modern Untitled UI React components, official `@untitledui/icons`, responsive spatial hierarchy, and seamless **Light / Dark Mode**.
- **📐 Smart 9:16 Portrait Framing**:
  - **Solo Speaker**: Automatic face detection and dynamic camera center-cropping.
  - **Split-Cam (Gaming / Podcasts)**: Facecam overlayed smoothly on top of gameplay / screen content.
  - **9:16 Centered Fit**: Ambient background blur for cinematic wide shots.
- **💬 9 Creator Subtitle Styles**: Word-by-word synchronized animated captions inspired by top creators (*Streamer Pop*, *Hormozi Impact*, *Mr Beast Bold*, *Cyber Neon*, *Subtitle Box*, *Karaoke Sync*, *Flame Gold*, *3D Meme*, and *Minimal Clean*).
- **🌐 Multilingual & Hinglish Recognition**: High-precision transcription powered by `faster-whisper-large-v3-turbo` with phonetic Hinglish transliteration into English letters or native scripts.
- **⚡ Local GPU Acceleration**: Optimized for NVIDIA GPUs via CUDA 12 and NVENC hardware encoding (with CPU fallback).

---

## 🏗️ Architecture

```
Clipscutora/
├── backend/                  # Python FastAPI processing engine
│   ├── pipeline/             # Audio, transcription, reframing, and rendering
│   │   ├── transcribe.py     # Faster-Whisper pipeline
│   │   ├── virality.py       # Energy analysis + Gemini hook scoring
│   │   ├── reframe.py        # OpenCV face tracking & 9:16 layout
│   │   └── subtitles.py      # ASS/SRT caption styling & rendering
│   ├── app.py                # Pipeline orchestrator & CLI
│   ├── server.py             # HTTP API proxy
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js 14 web application
│   ├── app/                  # App Router pages (Dashboard & Job Status)
│   ├── components/           # Untitled UI component library
│   │   └── untitledui/       # Button, Card, Badge, Toggle, Progress, etc.
│   └── tailwind.config.ts    # Dual-mode styling & Untitled UI tokens
├── setup_windows.ps1         # 1-click Windows installer
├── start_windows.bat         # 1-click Windows runner
├── setup_mac_linux.sh        # macOS / Linux installer
└── start_mac_linux.sh        # macOS / Linux runner
```

---

## 🚀 Quick Start

### Prerequisites
- **Python**: 3.10 – 3.12 (Python 3.11 recommended)
- **Node.js**: 18.0 or newer
- **FFmpeg**: Installed and available on your system `PATH`
- **NVIDIA GPU** *(Optional, recommended)*: For ultra-fast CUDA transcription and NVENC encoding.

---

### Windows Installation

1. Open PowerShell in the project directory:
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup_windows.ps1
   ```
2. *(Optional)* Add your free Gemini API key in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   ```
3. Start the application:
   ```cmd
   start_windows.bat
   ```
4. Open **http://localhost:3000** in your browser.

---

### macOS / Linux Installation

1. Run the setup script:
   ```bash
   bash setup_mac_linux.sh
   ```
2. *(Optional)* Add your free Gemini API key in `backend/.env`.
3. Start the application:
   ```bash
   ./start_mac_linux.sh
   ```
4. Open **http://localhost:3000** in your browser.

---

## 🛠️ CLI Usage

You can also run the clipping pipeline directly from the terminal:

```bash
# Activate your virtual environment first
python backend/app.py "https://www.youtube.com/watch?v=EXAMPLE" \
  --clips 5 \
  --min 15 \
  --max 45 \
  --style streamer \
  --language auto
```

### Common Flags:
- `--clips <n>`: Number of shorts to extract (default: 6)
- `--min <sec>`: Minimum clip length in seconds (default: 15)
- `--max <sec>`: Maximum clip length in seconds (default: 30)
- `--style <name>`: Subtitle preset (`streamer`, `hormozi`, `beast`, `neon`, `boxed`, `karaoke`, `fire`, `meme`, `clean`)
- `--font <name>`: Custom typography font (e.g., `'Impact'`, `'Arial Black'`, `'Segoe UI Black'`)
- `--language <lang>`: Spoken audio language (`auto`, `hi`, `en`)
- `--hindi-quality <fast|best>`: Faster-Whisper Turbo (`fast`) or Large-v3 (`best`)

---

## ⚙️ Configuration (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | `""` | Optional Google Gemini key for AI moment scoring |
| `GEMINI_MODEL` | `gemini-flash-lite-latest` | Model used for multimodal virality judging |
| `WHISPER_MODEL` | `auto` | `auto` selects `large-v3-turbo` on GPU or `small` on CPU |
| `WHISPER_DEVICE` | `auto` | `cuda` or `cpu` |
| `VIDEO_ENCODER` | `auto` | `h264_nvenc` (NVIDIA) with fallback to `libx264` (CPU) |
| `DEFAULT_CAPTION_STYLE`| `streamer` | Default subtitle preset |
| `SPLIT_CAM_TOP_FRACTION`| `0.40` | Height ratio of speaker window in split-cam mode |

---

## 📄 Output

- Rendered 9:16 videos are saved to `backend/output/<job-id>/` along with metadata in `clips.json`.
- Temporary audio streams and intermediate files are managed under `backend/data/`.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.
