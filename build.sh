#!/usr/bin/env bash
# build.sh — Build Mimpi frontend + restart dashboard server
set -e

readonly DIR="$(cd "$(dirname "$0")" && pwd)"
readonly VENV_DIR="$DIR/.venv"

cd "$DIR"

# ── Activate virtual environment ──
if [[ ! -d "$VENV_DIR" ]]; then
    echo "❌ Virtual environment '$VENV_DIR' not found."
    exit 1
fi
source "$VENV_DIR/bin/activate"

# ── Build frontend ──
echo "🚧 Building Mimpi frontend..."
cd mimpi
npm install
npx vite build
cd ..

echo "✅ Build selesai!"

# ── Restart server di tmux ──
echo "🔄 Restarting server..."
tmux kill-session -t mimpi 2>/dev/null || true
sleep 1

tmux new-session -d -s mimpi ".venv/bin/python server/main.py"
sleep 2

# ── Verifikasi ──
if tmux has-session -t mimpi 2>/dev/null; then
    echo "✅ Server running di tmux sesi 'mimpi'"
else
    echo "❌ Server gagal start"
    exit 1
fi
