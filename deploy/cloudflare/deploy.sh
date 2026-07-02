#!/bin/bash
# Deploy to Cloudflare Pages
# Usage: ./deploy/cloudflare/deploy.sh [--project NAME]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

PROJECT="${2:-ai-engineering}"

echo "=== Deploying to Cloudflare Pages ==="
echo "Project: $PROJECT"

# Check if site/ exists
if [ ! -d "site" ]; then
    echo "ERROR: site/ not found. Run ./scripts/build.sh first."
    exit 1
fi

# Slim search index if needed (reduces 68MB → ~8MB)
if [ -f "scripts/slim-search-index.py" ]; then
    echo "Slimming search index..."
    python3 scripts/slim-search-index.py
fi

# Upload RAG assets to R2
echo "Uploading RAG assets to R2..."
if [ -f "/tmp/neighbor_graph.json" ]; then
  npx wrangler r2 object put ai-engineering-search/neighbor_graph.json --file /tmp/neighbor_graph.json --remote 2>&1 | tail -1
fi
# Upload slimmed search index to R2
if [ -f "site/search/search_index.json" ]; then
  npx wrangler r2 object put ai-engineering-search/search_index.json --file site/search/search_index.json --remote 2>&1 | tail -1
fi

# Safety check: remove any remaining oversized files (>25MB CF Pages limit)
find site -size +25M -delete 2>/dev/null || true

# Deploy
echo "Deploying..."
npx wrangler pages deploy site --project-name="$PROJECT"

echo "=== Cloudflare deployment complete ==="
