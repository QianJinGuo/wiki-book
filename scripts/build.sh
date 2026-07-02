#!/bin/bash
# Build wiki-book site with optimized search index + neighbor graph
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== Building wiki-book ==="

# Build via Docker
docker run --rm -v "$(pwd):/build" -w /build wiki-book-builder:latest mkdocs build

# Build semantic neighbor graph (Tier 1 RAG)
# 从完整 search_index.json 生成，在 slim 之前
echo "=== Building neighbor graph (Tier 1 RAG) ==="
if [ -f "site/search/search_index.json" ]; then
  python3 scripts/build-neighbor-graph.py \
    --input site/search/search_index.json \
    --output /tmp/neighbor_graph.json \
    --top-k 20 2>&1 | tail -5
  echo "Neighbor graph: /tmp/neighbor_graph.json"
else
  echo "WARNING: site/search/search_index.json not found, skipping neighbor graph"
fi

# Slim search index (68MB → ~8MB)
echo "=== Slimming search index ==="
python3 scripts/slim-search-index.py

echo "=== Build complete ==="
