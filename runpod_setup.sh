#!/usr/bin/env bash
# Clipscutora - 1-Click RunPod GPU Setup & Launcher
set -e

cd "$(dirname "$0")"

echo "=================================================="
echo "  Clipscutora — RunPod GPU Setup & Launcher"
echo "=================================================="

# 1. Install FFmpeg
echo "--> Installing system packages (FFmpeg)..."
apt-get update && apt-get install -y ffmpeg curl

# 2. Install Python packages
echo "--> Installing Python requirements (Faster-Whisper, PyTorch, OpenCV)..."
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt

# 3. Setup .env file
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "--> Created backend/.env"
fi

echo ""
echo "=================================================="
echo "  Setup Complete! Starting Server on Port 8765..."
echo "  Public URL: https://<your-pod-id>-8765.proxy.runpod.net"
echo "=================================================="
echo ""

export HOST=0.0.0.0
export PORT=8765
python backend/server.py
