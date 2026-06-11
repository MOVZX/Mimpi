#!/usr/bin/env bash

readonly DIR="$(cd "$(dirname "$0")" && pwd)";
readonly VENV_DIR="$DIR/.venv";

if [[ ! -d "$VENV_DIR" ]]; then
    echo "Error: Virtual environment directory '$VENV_DIR' not found.";
    exit 1;
fi

source "$VENV_DIR/bin/activate" ||
{
    echo "Failed to activate virtual environment.";
    exit 1;
}

cd "$DIR"

echo "🚀 Starting Mimpi"
if command -v tmux &>/dev/null; then
    if ! tmux has-session -t mimpi 2>/dev/null; then
        tmux new-session -d -s mimpi \
            "python server.py" 2>/dev/null
        echo "✅ Mimpi tmux session started (mimpi)"
    else
        echo "⚠️  DMimpi tmux session already exists"
    fi
else
    echo "⚠️  tmux not available, start dMimpi manually"
    python server.py
fi
