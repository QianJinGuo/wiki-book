#!/usr/bin/env python3
"""Quality audit for the English-edition translation dictionaries.

Dictionary keys are FNV-1a hashes (JS charCodeAt parity) of the page's Chinese
segments, so file-level presence proves nothing. This audit re-extracts every
live page's segments with the same extractor the sweep uses, hashes them with
the same seg_key(), and reconciles dictionary content segment by segment:

  missing      - page segment with no dictionary entry (client falls back to
                 live /api/translate; batch gaps land here)
  cjk          - entry value still contains Chinese (malformed batch output)
  passthrough  - value equals the Chinese source
  truncation   - English much shorter than the Chinese source (<0.6x chars)
  protocol     - leaked batch artifacts: leading "1." numbers, fences, \n
  garbage      - U+FFFD or control characters
  collapse     - one long English string reused for several different segments
  inert        - dictionary entries no segment of the page references (stale
                 bloat shipped to the client bundle)

Exit 1 when critical screens (missing/cjk/passthrough/empty) are non-zero.

Usage: python3 scripts/audit-translations-quality.py [--json]
"""

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
GARBAGE = re.compile(r"[\ufffd\x00-\x08\x0b\x0c\x0e-\x1f]")

_spec = importlib.util.spec_from_file_location(
    "translate_all", os.path.join(ROOT, "scripts", "translate-all.py")
)
ta = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ta)


def live_pages():
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for f in sorted(files):
            if f.endswith(".html") and f != "index.html":
                yield os.path.relpath(os.path.join(root, f), SITE)


def main():
    as_json = "--json" in sys.argv
    counts = defaultdict(int)
    pages_with_issues = defaultdict(set)
    samples = defaultdict(list)
    stale_files = []

    def flag(rel, kind, detail=""):
        counts[kind] += 1
        pages_with_issues[rel].add(kind)
        if len(samples[kind]) < 6:
            samples[kind].append(f"{rel}: {detail}")

    dict_keys_seen = set()
    values_by_key = defaultdict(set)  # seg_key -> distinct EN values across pages
    for rel in live_pages():
        key = ta.page_key(rel)
        path = os.path.join(TR, key + ".json")
        entry = {}
        if os.path.exists(path):
            try:
                entry = json.load(open(path, encoding="utf-8"))
            except Exception:
                entry = {}
                flag(rel, "missing", "dictionary unparseable")
        else:
            flag(rel, "missing", "no dictionary file")
        dict_keys_seen.update(entry)
        for k, v in entry.items():
            if isinstance(v, str):
                values_by_key[k].add(v)

        segments = ta.extract(rel) or []
        matched = set()
        seen = defaultdict(list)
        for seg in segments:
            k = ta.seg_key(seg)
            if k in matched:
                continue
            matched.add(k)
            en = entry.get(k)
            if en is None:
                flag(rel, "missing", f"segment untranslated: {seg[:40]!r}")
                continue
            if not isinstance(en, str) or not en.strip():
                flag(rel, "empty", f"{seg[:40]!r}")
            elif CJK.search(en):
                flag(rel, "cjk", f"{seg[:30]!r} -> {en[:50]!r}")
            elif en.strip() == seg:
                flag(rel, "passthrough", seg[:40])
            elif (PROTO_LEAD.match(en) and not NUM_LABEL.match(seg)) or "```" in en or "\\n" in en:
                flag(rel, "protocol", f"{en[:60]!r}")
            elif GARBAGE.search(en):
                flag(rel, "garbage", f"{en[:60]!r}")
            elif len(en) < 0.6 * len(seg):
                flag(rel, "truncation", f"{len(seg)}->{len(en)}: {en[:60]!r}")
            if isinstance(en, str) and len(en) > 24:
                seen[en].append(seg)
        for en, srcs in seen.items():
            if len(srcs) > 1:
                flag(rel, "collapse", f"{len(srcs)} sources -> {en[:50]!r}")
        inert = len(entry) - len(matched & set(entry))
        if inert > 0:
            counts["inert"] += inert

    stale_files = sorted(
        fn[:-5] for fn in os.listdir(TR) if fn.endswith(".json") and fn[:-5] not in dict_keys_seen
    )
    inconsistent = {k: v for k, v in values_by_key.items() if len(v) > 1}
    for k, vs in list(inconsistent.items())[:6]:
        samples["consistency"].append(f"{k}: {sorted(vs)[:2]}")
    counts["consistency"] = len(inconsistent)
    # files no live page references at all
    live_keys = {ta.page_key(rel) for rel in live_pages()}
    orphan_files = sorted(
        fn[:-5] for fn in os.listdir(TR) if fn.endswith(".json") and fn[:-5] not in live_keys
    )

    critical = counts["missing"] + counts["cjk"] + counts["passthrough"] + counts["empty"]
    report = {
        "counts": dict(counts),
        "pages_with_issues": len(pages_with_issues),
        "orphan_files": len(orphan_files),
        "critical_total": critical,
        "samples": {k: v for k, v in samples.items() if v},
    }
    if as_json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(
            "defects: " + " ".join(
                f"{k}={counts.get(k, 0)}"
                for k in ("missing", "cjk", "passthrough", "empty", "truncation", "protocol", "garbage", "collapse", "consistency")
            )
        )
        print(f"inert entries (bundle bloat): {counts.get('inert', 0)}; orphan dictionary files: {len(orphan_files)}")
        print(f"pages with any issue: {len(pages_with_issues)}; critical total: {critical}")
        for kind in ("truncation", "protocol", "garbage", "collapse", "cjk", "missing", "consistency"):
            if samples.get(kind):
                print(f"\n{kind} samples:")
                for s in samples[kind]:
                    print(f"  {s}")
    sys.exit(1 if critical else 0)


if __name__ == "__main__":
    main()
