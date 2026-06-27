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

# Remove oversized files (>25MB limit)
echo "Removing files >25MB..."
find site -size +25M -delete 2>/dev/null || true

# Deploy
echo "Deploying..."
npx wrangler pages deploy site --project-name="$PROJECT"

echo "=== Cloudflare deployment complete ==="
