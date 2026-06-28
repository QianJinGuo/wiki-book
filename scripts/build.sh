#!/bin/bash
# Build wiki-book site with optimized search index
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== Building wiki-book ==="

# Build via Docker
docker run --rm -v "$(pwd):/build" -w /build wiki-book-builder:latest mkdocs build

# Slim search index (68MB → ~8MB)
echo "=== Slimming search index ==="
python3 scripts/slim-search-index.py

echo "=== Build complete ==="
