#!/bin/bash
# Master deployment script
# Usage: ./scripts/deploy.sh [docker|cloudflare|github|all] [--build]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

TARGET="${1:-all}"
BUILD_FLAG="${2:-}"

echo "======================================"
echo "  Wiki-Book Deployment"
echo "======================================"
echo "Target: $TARGET"
echo ""

# Build site first if needed
if [ ! -d "$PROJECT_DIR/site" ] || [ "$BUILD_FLAG" = "--build" ]; then
    echo "Building site..."
    "$SCRIPT_DIR/build.sh" "$BUILD_FLAG"
    echo ""
fi

node "$SCRIPT_DIR/check-public-build.mjs" --source "$PROJECT_DIR" --site "$PROJECT_DIR/site"

# Post-sync QC check (non-blocking warning by default; use STRICT_QC=1 to block)
if [ -f "$SCRIPT_DIR/post-sync-qc.py" ]; then
    echo "Running post-sync QC check..."
    if [ "${STRICT_QC:-}" = "1" ]; then
        python3 "$SCRIPT_DIR/post-sync-qc.py" --docs-dir "$PROJECT_DIR/docs" --quiet
    else
        python3 "$SCRIPT_DIR/post-sync-qc.py" --docs-dir "$PROJECT_DIR/docs" --quiet || \
            echo "⚠️  QC warnings detected (non-blocking; set STRICT_QC=1 to enforce)"
    fi
    echo ""
fi

# Deploy to target(s)
case "$TARGET" in
    docker)
        "$PROJECT_DIR/deploy/docker/deploy.sh" "$BUILD_FLAG"
        ;;
    cloudflare)
        "$PROJECT_DIR/deploy/cloudflare/deploy.sh"
        ;;
    github)
        "$PROJECT_DIR/deploy/github/deploy.sh"
        ;;
    all)
        echo "Deploying to all environments..."
        echo ""
        
        echo "--- Docker ---"
        "$PROJECT_DIR/deploy/docker/deploy.sh" "$BUILD_FLAG" || echo "Docker deploy failed"
        echo ""
        
        echo "--- Cloudflare ---"
        "$PROJECT_DIR/deploy/cloudflare/deploy.sh" || echo "Cloudflare deploy failed"
        echo ""
        
        echo "--- GitHub ---"
        "$PROJECT_DIR/deploy/github/deploy.sh" || echo "GitHub deploy failed"
        echo ""
        ;;
    *)
        echo "Usage: $0 [docker|cloudflare|github|all] [--build]"
        exit 1
        ;;
esac

echo "======================================"
echo "  Deployment complete!"
echo "======================================"
