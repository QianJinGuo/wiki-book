#!/bin/bash
# Deploy to Cloudflare Workers (search disabled due to 25MB KV limit)
set -e

cd "$(dirname "$0")"

echo "Building site..."
.venv/bin/python -m mkdocs build

echo "Removing search index (exceeds 25MB KV limit)..."
rm -f site/search/search_index.json

echo "Deploying to Cloudflare Workers..."
wrangler deploy
