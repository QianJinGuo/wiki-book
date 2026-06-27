#!/usr/bin/env python3
"""
Post-process search_index.json to reduce size for browser search.
- Remove chapter INDEX pages (keep entity sub-pages)
- Limit to 5 entries per page (first 5 headings)
- Truncate text to 300 chars
"""
import json, sys, os, re
from collections import defaultdict

INDEX = os.path.expanduser("~/wiki-book/site/search/search_index.json")
if not os.path.exists(INDEX):
    print("search_index.json not found, skipping", file=sys.stderr)
    sys.exit(0)

with open(INDEX) as f:
    data = json.load(f)

original_count = len(data['docs'])
original_size = os.path.getsize(INDEX)

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

with open(INDEX, 'w') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

new_size = os.path.getsize(INDEX)
print(f"Excluded {excluded} chapter/index pages", file=sys.stderr)
print(f"Max {MAX_PER_PAGE} entries/page, {MAX_TEXT} char text", file=sys.stderr)
print(f"Search index: {original_count} → {len(filtered)} entries", file=sys.stderr)
print(f"Size: {original_size/1024/1024:.1f}MB → {new_size/1024/1024:.1f}MB")
