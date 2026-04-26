#!/usr/bin/env bash
set -euo pipefail
PORT="${1:-8080}"
echo "[SOP Dashboard] Serving at http://127.0.0.1:${PORT}"
python3 -m http.server "$PORT"
