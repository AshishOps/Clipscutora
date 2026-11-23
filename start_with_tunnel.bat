@echo off
title Clipscutora Backend + Cloudflare Tunnel
cd /d "%~dp0"

echo ========================================================
echo   Clipscutora -- Local GPU Backend + Cloudflare Tunnel
echo ========================================================
echo.

:: Check for virtual environment
if not exist ".venv\Scripts\python.exe" (
    echo [!!] Setup has not been run yet. Run: powershell -ExecutionPolicy Bypass -File setup_windows.ps1
    pause
    exit /b 1
)

:: Start Python Backend in background if not already running
echo [1/2] Ensuring Python backend is running on 127.0.0.1:8765...
start /b "" powershell -Command "Set-Location backend; ..\.venv\Scripts\python.exe server.py"

timeout /t 3 /nobreak >nul

:: Start Cloudflare Tunnel to expose port 8765
echo [2/2] Launching Cloudflare Tunnel...
echo.
echo ========================================================
echo   COPY THE URL BELOW (https://....trycloudflare.com)
echo   and set it as BACKEND_URL in your Cloudflare Pages!
echo ========================================================
echo.

cloudflared tunnel --url http://127.0.0.1:8765
