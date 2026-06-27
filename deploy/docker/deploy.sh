#!/bin/bash
# Deploy to local Docker
# Usage: ./deploy/docker/deploy.sh [--build]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

BUILD_FLAG="${1:-}"

echo "=== Deploying to Docker ==="

# Build image if requested or if Dockerfile changed
if [ "$BUILD_FLAG" = "--build" ] || [ ! -z "$(docker images -q wiki-book-wiki-book:latest 2>/dev/null)" ]; then
    echo "Building Docker image..."
    docker compose -f deploy/docker/docker-compose.yml build
fi

# Restart container
echo "Starting container..."
docker compose -f deploy/docker/docker-compose.yml down 2>/dev/null || true
docker compose -f deploy/docker/docker-compose.yml up -d

echo "=== Docker deployment complete ==="
echo "URL: http://localhost:8002"
