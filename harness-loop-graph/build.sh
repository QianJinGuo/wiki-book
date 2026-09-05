#!/usr/bin/env bash
# Build both editions of the book for local Docker serving.
#   zh -> site-zh/   (served at /)
#   en -> site-en/   (served at /en/)
set -euo pipefail
cd "$(dirname "$0")"

REPO_ROOT="$(cd .. && pwd)"
MKDOCS="${MKDOCS:-$REPO_ROOT/.venv/bin/mkdocs}"
command -v "$MKDOCS" >/dev/null 2>&1 || MKDOCS="$(command -v mkdocs)"

rm -rf site-zh site-en
"$MKDOCS" build -f mkdocs.yml -d site-zh --quiet
"$MKDOCS" build -f mkdocs-en.yml -d site-en --quiet
echo "Built site-zh/ and site-en/"
echo "Deploy: ./deploy.sh  (or: docker compose -f ../docker-compose.yml up -d --build harness-loop-graph)"
