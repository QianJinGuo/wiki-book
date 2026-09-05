#!/usr/bin/env bash
# Build + deploy the book to local Docker.
#   zh: http://localhost:8005
#   en: http://localhost:8005/en/
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
./build.sh
cd ..
docker compose up -d --build harness-loop-graph
echo ""
echo "=== Book deployment complete ==="
echo "URL (zh): http://localhost:8005"
echo "URL (en): http://localhost:8005/en/"
