#!/usr/bin/env python3
"""Migrate translation dictionaries across chapter-renumber drift.

The daily loop renumbers entity pages (ch04__248-foo -> ch04__255-foo), which
orphans translations/<key>.json files even though the article is unchanged.
Match stale keys to live pages by slug suffix (chapter prefix + numeric page
number stripped) and merge each stale dictionary into its live counterpart.
Only unique suffix matches are migrated; ambiguous slugs (agent, ai, skill...)
and unmatched pages fall through to the sweep's normal heal path.

Usage:
  python3 scripts/migrate-translation-keys.py            # dry run
  python3 scripts/migrate-translation-keys.py --apply    # write changes
"""

import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = os.path.join(ROOT, "translations")
SITE = os.path.join(ROOT, "site")
EXCLUDE = ("assets", "search", "agent-book", "en")


def site_keys():
    keys = set()
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for f in files:
            if f.endswith(".html") and f != "index.html":
                rel = os.path.relpath(os.path.join(root, f), SITE)
                keys.add(rel[:-5].replace("/", "__"))
    return keys


def slug_suffix(key):
    body = key.split("__", 1)[1] if "__" in key else key
    return re.sub(r"^\d+-", "", body)


def main():
    apply = "--apply" in sys.argv
    live = site_keys()
    by_suffix = defaultdict(list)
    for k in live:
        by_suffix[slug_suffix(k)].append(k)

    migrated = merged = skipped_amb = skipped_nomatch = 0
    pruned = []
    for fn in sorted(os.listdir(TR)):
        if not fn.endswith(".json"):
            continue
        key = fn[:-5]
        if key in live:
            continue
        cands = by_suffix.get(slug_suffix(key), [])
        if len(cands) != 1:
            if len(cands) > 1:
                skipped_amb += 1
            else:
                skipped_nomatch += 1
            continue
        target_key = cands[0]
        src = json.load(open(os.path.join(TR, fn), encoding="utf-8"))
        tgt_path = os.path.join(TR, target_key + ".json")
        if os.path.exists(tgt_path):
            tgt = json.load(open(tgt_path, encoding="utf-8"))
            before = len(tgt)
            for k, v in src.items():
                tgt.setdefault(k, v)
            added = len(tgt) - before
            if apply:
                with open(tgt_path, "w", encoding="utf-8") as fh:
                    json.dump(tgt, fh, ensure_ascii=False, sort_keys=True)
            merged += 1
            print(f"merge  {key} -> {target_key}  (+{added} keys)")
        else:
            if apply:
                with open(tgt_path, "w", encoding="utf-8") as fh:
                    json.dump(src, fh, ensure_ascii=False, sort_keys=True)
            migrated += 1
            print(f"move   {key} -> {target_key}")
        pruned.append(fn)

    print(
        f"\n{'applied' if apply else 'dry run'}: move={migrated} merge={merged} "
        f"prune={len(pruned)} skip_ambiguous={skipped_amb} skip_nomatch={skipped_nomatch}"
    )
    if apply and pruned:
        for fn in pruned:
            os.remove(os.path.join(TR, fn))
        print(f"pruned {len(pruned)} stale dictionaries")


if __name__ == "__main__":
    main()
