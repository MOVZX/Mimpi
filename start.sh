#!/bin/env bash

readonly DIR="/multimedia/AI/Mimpi";
readonly VENV_DIR="$DIR/venv";

if [[ ! -d "$VENV_DIR" ]]; then
    echo "Error: Virtual environment directory '$VENV_DIR' not found.";

    exit 1;
fi

source "$VENV_DIR/bin/activate" ||
{
    echo "Failed to activate virtual environment.";

    exit 1;
}

cd $DIR
python -m http.server 8000
