#!/bin/bash
# Deploy to local Docker
# Usage: ./deploy/docker/deploy.sh [--build]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

BUILD_FLAG="${1:-}"

echo "=== Deploying to Docker ==="

# The "wiki-book" container name is owned by the root compose project (the
# same file sync-wiki-book.sh deploys with, alongside harness-loop-graph).
# Recreating it from this subdirectory's compose project fails with a
# container-name conflict, so delegate the build+recreate to the root project.
echo "Building and starting container (root compose)..."
docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d --build wiki-book

echo "=== Docker deployment complete ==="
echo "URL: http://localhost:8002"
