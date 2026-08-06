#!/bin/bash
# Deploy to Cloudflare Pages
# Search index served from R2 when binding configured, otherwise search disabled
set -e

cd "$(dirname "$0")"

echo "Regenerating curated course layer..."
python3 scripts/build-course.py 2>&1 | tail -2 || echo "  WARNING: course.json regeneration failed"

echo "Building site..."
.venv/bin/python -m mkdocs build

echo "Removing search index from static files (served via R2 Function)..."
rm -f site/search/search_index.json

echo "Deploying to Cloudflare Pages..."
wrangler pages deploy site --project-name=ai-engineering --commit-dirty=true
