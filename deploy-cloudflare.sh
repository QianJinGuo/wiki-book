#!/bin/bash
# Deploy to Cloudflare Pages (search index excluded, exceeds 25MB file limit)
set -e

cd "$(dirname "$0")"

echo "Building site..."
.venv/bin/python -m mkdocs build

echo "Removing search index (39MB exceeds Pages 25MB limit)..."
rm -f site/search/search_index.json

echo "Deploying to Cloudflare Pages..."
wrangler pages deploy site --project-name=ai-engineering --commit-dirty=true
