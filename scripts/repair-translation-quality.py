#!/usr/bin/env python3
"""Repair translation-quality defects the sweep's heal rules cannot see.

The sweep re-translates entries that are missing, passthrough, or contain
CJK, but a fluent-looking wrong translation survives every heal screen:
truncations (English far shorter than the source), leaked batch numbering,
code fences, literal \\n, and collapsed duplicates (several segments sharing
one English string). This tool re-extracts every live page, re-runs the
segment screens, and re-requests the suspects with a quality-focused prompt,
patching the dictionaries in place.

Segments whose SOURCE starts with a numeric label ("2.1", "008.", "Part 2:")
get deterministic treatment: the label is stripped, the remainder is
translated, and the original label is re-attached — the batch protocol's
line-splitter would otherwise mangle embedded numbering.

Usage:
  python3 scripts/repair-translation-quality.py            # dry run
  python3 scripts/repair-translation-quality.py --apply [--max 4000]
"""

import argparse
import concurrent.futures
import importlib.util
import json
import os
import re
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = os.path.join(ROOT, "translations")
SITE = os.path.join(ROOT, "site")
EXCLUDE = ("assets", "search", "agent-book", "en")
CJK = re.compile(r"[\u4e00-\u9fff]")
PROTO_LEAD = re.compile(r"^\s*\d+(?:\.\d+)*\s*[.、)）]\s*")
NUM_LABEL = re.compile(r"^\s*(\d+(?:\.\d+)*(?:[.、)）]\s*|\s+))")

_spec = importlib.util.spec_from_file_location(
    "translate_all", os.path.join(ROOT, "scripts", "translate-all.py")
)
ta = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ta)

QUALITY_SYSTEM_PROMPT = "\n".join([
    "You are a translation engine polishing a technical AI-engineering documentation site.",
    "Translate each numbered line from Chinese to natural, complete English.",
    "Rules:",
    "- Translate EVERY line IN FULL. Never summarize, shorten or skip content.",
    "- Keep technical terms, product names, code identifiers, URLs, numbers and emoji intact.",
    "- Keep inline formatting (bold, links) as-is.",
    "- Output ONLY the numbered translated lines, same numbering as input. No commentary, no code fences.",
])


def split_label(seg):
    """Split a leading numeric label ('2.1 ', '008. ') off a source segment."""
    m = NUM_LABEL.match(seg)
    if not m:
        return "", seg
    return m.group(1), seg[m.end():]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--max", type=int, default=4000, help="max segments to re-request")
    args = ap.parse_args()

    api_key = None if not args.apply else ta.load_api_key()

    suspects = {}  # key -> (rel, source, screen)
    per_screen = defaultdict(int)
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for f in sorted(files):
            if not f.endswith(".html") or f == "index.html":
                continue
            rel = os.path.relpath(os.path.join(root, f), SITE)
            key = ta.page_key(rel)
            path = os.path.join(TR, key + ".json")
            entry = {}
            if os.path.exists(path):
                try:
                    entry = json.load(open(path, encoding="utf-8"))
                except Exception:
                    entry = {}
            segments = ta.extract(rel) or []
            pairs = {}
            for seg in segments:
                pairs.setdefault(ta.seg_key(seg), seg)
            dup = defaultdict(list)
            for k, seg in pairs.items():
                en = entry.get(k)
                if en is None or not isinstance(en, str) or not en.strip():
                    screen = "missing"
                elif CJK.search(en) or en.strip() == seg:
                    screen = "cjk"  # sweep should have caught these; retry here
                elif (PROTO_LEAD.match(en) and not NUM_LABEL.match(seg)) or "```" in en or "\\n" in en:
                    screen = "protocol"
                elif len(en) < 0.6 * len(seg):
                    screen = "truncation"
                else:
                    if len(en) > 24:
                        dup[en].append(k)
                    continue
                if len(suspects) < args.max:
                    suspects[k] = (rel, seg, screen)
                    per_screen[screen] += 1
            for en, keys in dup.items():
                if len(keys) > 1:
                    for k in keys:
                        if len(suspects) < args.max and k not in suspects:
                            suspects[k] = (rel, pairs[k], "collapse")
                            per_screen["collapse"] += 1

    print(f"suspects: {dict(per_screen)} total={len(suspects)} (cap {args.max})")
    if not args.apply or not suspects:
        return

    items = sorted(suspects.items())
    batches, batch, chars = [], [], 0
    for k, (rel, seg, screen) in items:
        if batch and (len(batch) >= ta.BATCH_ITEMS or chars + len(seg) > ta.BATCH_CHARS):
            batches.append(batch)
            batch, chars = [], 0
        batch.append((k, seg))
        chars += len(seg)
    if batch:
        batches.append(batch)

    patch = defaultdict(dict)
    failed = []

    def run(batch):
        keys = [k for k, _ in batch]
        labels, bodies = zip(*(split_label(s) for _, s in batch))
        try:
            out = ta.call_upstream(list(bodies), api_key, system_prompt=QUALITY_SYSTEM_PROMPT)
            return [(k, labels[i] + out[i]) for i, (k, _) in enumerate(batch)]
        except RuntimeError:
            failed.extend(keys)
            return []

    with concurrent.futures.ThreadPoolExecutor(max_workers=ta.CONCURRENCY) as pool:
        done = 0
        for result in pool.map(run, batches):
            for k, en in result:
                patch[suspects[k][0]][k] = en
            done += len(result)
            print(f"    {done}/{len(items)}", flush=True)

    for rel, entries in patch.items():
        path = os.path.join(TR, ta.page_key(rel) + ".json")
        entry = {}
        if os.path.exists(path):
            entry = json.load(open(path, encoding="utf-8"))
        entry.update(entries)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(entry, fh, ensure_ascii=False, sort_keys=True)

    print(f"repaired {sum(len(v) for v in patch.values())} entries across {len(patch)} pages; failed {len(failed)}")

    # Cross-page consistency: the same source segment must translate to the
    # same English everywhere. Unify minority variants to the majority value
    # (local-only rewrite, no API cost). Run after quality repairs so a fixed
    # majority propagates.
    by_key = defaultdict(lambda: defaultdict(dict))  # key -> pagekey -> value
    for fn in os.listdir(TR):
        if not fn.endswith(".json"):
            continue
        pagekey = fn[:-5]
        try:
            d = json.load(open(os.path.join(TR, fn), encoding="utf-8"))
        except Exception:
            continue
        for k, v in d.items():
            if isinstance(v, str):
                by_key[k][pagekey] = v
    unified = files_touched = 0
    pending = defaultdict(dict)
    for k, pages in by_key.items():
        if len(pages) < 2:
            continue
        values = list(pages.values())
        majority = max(set(values), key=values.count)
        minority = {p: v for p, v in pages.items() if v != majority}
        if not minority:
            continue
        unified += len(minority)
        for p, _ in minority.items():
            pending[p][k] = majority
    for pagekey, entries in pending.items():
        path = os.path.join(TR, pagekey + ".json")
        d = json.load(open(path, encoding="utf-8"))
        d.update(entries)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(d, fh, ensure_ascii=False, sort_keys=True)
        files_touched += 1
    print(f"consistency unify: {unified} minority entries across {files_touched} files")


if __name__ == "__main__":
    main()
