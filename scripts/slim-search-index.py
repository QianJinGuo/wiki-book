#!/usr/bin/env python3
"""
Post-process search_index.json to reduce size for browser search.
- Remove chapter INDEX pages (keep entity sub-pages)
- Limit to 5 entries per page (first 5 headings)
- Truncate text to 300 chars

Must run BEFORE build-neighbor-graph.py: the graph is keyed by position in
this slimmed docs array, which is exactly what rag-client.js searches over.
"""
import argparse
import json
import os
import re
import sys
from collections import defaultdict


def main():
    parser = argparse.ArgumentParser(description="Slim MkDocs search index for browser RAG")
    parser.add_argument(
        "--input",
        default=None,
        help="Path to search_index.json (default: <project>/site/search/search_index.json)",
    )
    args = parser.parse_args()

    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    index_path = args.input or os.path.join(project_dir, "site", "search", "search_index.json")

    if not os.path.exists(index_path):
        print(f"search_index.json not found at {index_path}, skipping", file=sys.stderr)
        sys.exit(0)

    with open(index_path) as f:
        data = json.load(f)

    original_count = len(data['docs'])
    original_size = os.path.getsize(index_path)

    CHAPTER_INDEX_RE = re.compile(r'^ch\d{2}-[a-z]')
    MAX_PER_PAGE = 5
    MAX_TEXT = 300

    # Group by page
    by_page = defaultdict(list)
    for doc in data['docs']:
        path = doc['location'].split('#')[0]
        if not path.endswith('/'):
            path += '/'
        by_page[path].append(doc)

    filtered = []
    excluded = 0
    for path, docs in by_page.items():
        basename = path.split('/')[0]

        # Skip chapter index pages
        if CHAPTER_INDEX_RE.match(basename) and not re.match(r'ch\d{2}-\d', basename):
            excluded += 1
            continue
        if path.startswith('references/') or path.startswith('index/'):
            excluded += 1
            continue

        # Keep only first N entries per page, truncate text
        for doc in docs[:MAX_PER_PAGE]:
            if len(doc.get('text', '')) > MAX_TEXT:
                doc['text'] = doc['text'][:MAX_TEXT]
            filtered.append(doc)

    data['docs'] = filtered

    with open(index_path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    new_size = os.path.getsize(index_path)
    print(f"Excluded {excluded} chapter/index pages", file=sys.stderr)
    print(f"Max {MAX_PER_PAGE} entries/page, {MAX_TEXT} char text", file=sys.stderr)
    print(f"Search index: {original_count} → {len(filtered)} entries", file=sys.stderr)
    print(f"Size: {original_size/1024/1024:.1f}MB → {new_size/1024/1024:.1f}MB")


if __name__ == "__main__":
    main()
