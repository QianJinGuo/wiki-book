#!/bin/bash
# Build wiki-book site with optimized search index + neighbor graph
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== Building wiki-book ==="

echo "=== Checking two-layer wiki links ==="
node scripts/check-wiki-links.mjs

# Content-quality scan of the published chapter pages (report-only; pass
# --strict to make failures block the build once the corpus is clean).
# Host-side Python for course/dashboard/slim/graph steps.
# Prefers the project venv (numpy/scipy for the graph build); CI installs
# deps into the system interpreter instead. Override with PYTHON=<path>.
PYTHON="${PYTHON:-python3}"
if [ "$PYTHON" = "python3" ] && [ -x ".venv/bin/python" ]; then
  PYTHON=".venv/bin/python"
fi

# Content-quality scan of the published chapter pages (report-only; pass
# --strict to make failures block the build once the corpus is clean).
echo "=== Article quality scan ==="
"$PYTHON" scripts/check-article-quality.py || true

# Regenerate index JSONs from the actual docs/ tree before MkDocs copies
# docs/ into site/.  The auto-sync ("sync: auto-update from wiki entities")
# renumbers files, so these indexes must be rebuilt every build or the
# dashboard / course UI will emit links to stale file numbers (404s).
echo "=== Building curated course ==="
"$PYTHON" scripts/build-course.py

echo "=== Building dashboard article catalog ==="
"$PYTHON" scripts/rank-articles.py

# Strip the duplicated chapter-prefixed H2 that the external wiki-sync
# re-adds to entity pages on every run (idempotent; no-op when clean).
echo "=== Deduping entity page titles ==="
"$PYTHON" scripts/dedupe-entity-titles.py --apply

# Build via Docker
docker run --rm -v "$(pwd):/build" -w /build wiki-book-builder:latest mkdocs build

# ORDER MATTERS: slim the search index FIRST, then build the neighbor graph
# from the slimmed index.  rag-client.js searches over the slimmed docs array
# and keys the graph by position in that same array — building the graph from
# the full index (the old order) shifted every index and silently returned
# wrong neighbor documents.
echo "=== Slimming search index ==="
"$PYTHON" scripts/slim-search-index.py

echo "=== Building neighbor graph (Tier 1 RAG, aligned with slimmed index) ==="
if [ -f "site/search/search_index.json" ]; then
  "$PYTHON" scripts/build-neighbor-graph.py \
    --input site/search/search_index.json \
    --output site/assets/neighbor_graph.json \
    --top-k 20 2>&1 | tail -5
  echo "Neighbor graph: site/assets/neighbor_graph.json"
else
  echo "WARNING: site/search/search_index.json not found, skipping neighbor graph"
fi

# Copy Cloudflare Pages _headers for cache control
if [ -f "docs/_headers" ]; then
  cp docs/_headers site/_headers
  echo "Copied _headers to site/"
fi

echo "=== Checking public build boundary ==="
node scripts/check-public-build.mjs --source "$PROJECT_DIR" --site "$PROJECT_DIR/site"

echo "=== Build complete ==="
