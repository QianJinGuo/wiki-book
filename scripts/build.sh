#!/bin/bash
# Shared build script for all environments
# Usage: ./scripts/build.sh [--clean]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

CLEAN="${1:-}"

echo "=== Building wiki-book site ==="
echo "Source: docs/"
echo "Output: site/"

# Clean if requested
if [ "$CLEAN" = "--clean" ]; then
    echo "Cleaning site/ directory..."
    rm -rf site/
fi

# Build with MkDocs
# Try Docker first, fall back to local mkdocs
if command -v docker &> /dev/null && docker image inspect wiki-book-builder:latest &> /dev/null; then
    echo "Using Docker builder image..."
    docker run --rm -v "$PROJECT_DIR:/build" -w /build wiki-book-builder:latest mkdocs build
elif command -v mkdocs &> /dev/null; then
    echo "Using local mkdocs..."
    mkdocs build
else
    echo "ERROR: No mkdocs available. Install mkdocs-material or build Docker image first."
    echo "  pip install mkdocs-material mkdocs-minify-plugin"
    echo "  OR: docker build --target builder -t wiki-book-builder -f deploy/docker/Dockerfile ."
    exit 1
fi

echo "=== Build complete ==="
echo "Output: site/ ($(find site -name '*.html' | wc -l) HTML files)"
