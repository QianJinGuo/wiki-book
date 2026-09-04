#!/bin/bash
# Deploy to Cloudflare Pages
# Usage: ./deploy/cloudflare/deploy.sh [--project NAME]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

PROJECT="${2:-ai-engineering}"
SITE_DIR="$PROJECT_DIR/site"

echo "=== Deploying to Cloudflare Pages ==="
echo "Project: $PROJECT"

# Only the public build directory is deployable. Do not accept an alternate
# path or a private build directory through a symlink or environment override.
if [ ! -d "$SITE_DIR" ]; then
    echo "ERROR: site/ not found. Run ./scripts/build.sh first."
    exit 1
fi
if [ "$(cd -P "$SITE_DIR" && pwd)" != "$PROJECT_DIR/site" ]; then
    echo "ERROR: site/ is not the public repository output directory." >&2
    exit 1
fi
node scripts/check-public-build.mjs --source "$PROJECT_DIR" --site "$SITE_DIR"

# build.sh already produced the slim index and the aligned graph. Rewriting
# either file here would allow an unverified output to reach R2.
GRAPH_FILE="$SITE_DIR/assets/neighbor_graph.json"
if [ ! -f "$SITE_DIR/search/search_index.json" ] || [ ! -f "$GRAPH_FILE" ]; then
    echo "ERROR: public RAG artifacts are missing; run scripts/build.sh first." >&2
    exit 1
fi
# Safety check: never delete an output file to make an unsafe deployment fit.
if find "$SITE_DIR" -type f -size +25M -print -quit | grep -q .; then
    echo "ERROR: public site contains a file larger than the Cloudflare Pages limit." >&2
    exit 1
fi

# Upload RAG assets to R2
echo "Uploading RAG assets to R2..."
npx wrangler r2 object put ai-engineering-search/neighbor_graph.json --file "$GRAPH_FILE" --remote 2>&1 | tail -1
# Upload slimmed search index to R2
npx wrangler r2 object put ai-engineering-search/search_index.json --file "$SITE_DIR/search/search_index.json" --remote 2>&1 | tail -1

# Deploy
echo "Deploying..."
npx wrangler pages deploy "$SITE_DIR" --project-name="$PROJECT"

echo "=== Cloudflare deployment complete ==="
