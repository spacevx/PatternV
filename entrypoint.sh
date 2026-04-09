#!/bin/sh
set -e

BUILDS_DIR="${BUILDS_DIR:-/data/builds}"

# Pre-extract .text sections if not already done
if ls "$BUILDS_DIR"/*.exe 1>/dev/null 2>&1; then
  TEXT_COUNT=$(ls "$BUILDS_DIR"/*.text 2>/dev/null | wc -l)
  if [ "$TEXT_COUNT" -eq 0 ]; then
    echo "[*] Extracting .text sections from build dumps..."
    /usr/local/bin/PatternV "$BUILDS_DIR" --extract-text
    echo "[*] Done. .text files ready."
  else
    echo "[*] .text files already present, skipping extraction."
  fi
fi

exec npm start
