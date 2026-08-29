#!/usr/bin/env python3
"""
Remove the duplicated chapter-prefixed H2 title from entity pages.

Every split entity page (docs/ch*/NNN-*.md) carries the page title twice:

    # MemOS Hermes 记忆插件
    ## Ch06.018 MemOS Hermes 记忆插件   <-- duplicate, removed

The external wiki-sync regenerates entity files daily and re-adds the
duplicate, so build.sh runs this script before every `mkdocs build` to
keep the deployed site clean (idempotent; title-only rewrites when the
H2 actually repeats the H1).

Usage:
  python3 scripts/dedupe-entity-titles.py [--apply]
  (default is a dry-run summary; --apply writes changes)
"""
import argparse
import os
import re
import sys

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(PROJECT_DIR, "docs")

CHAPTER_DIRS_RE = re.compile(r"^ch\d+$")
DUP_HEAD_RE = re.compile(r"^##\s+Ch\d+\.\d+\s+(.+?)\s*$")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def dedupe_file(path: str, apply: bool) -> bool:
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    h1_idx = next((i for i, l in enumerate(lines) if l.startswith("# ")), None)
    if h1_idx is None:
        return False
    h1_text = normalize(lines[h1_idx][2:])

    # first non-blank line after the H1
    j = h1_idx + 1
    while j < len(lines) and not lines[j].strip():
        j += 1
    if j >= len(lines):
        return False
    m = DUP_HEAD_RE.match(lines[j])
    if not m or normalize(m.group(1)) != h1_text:
        return False

    if not apply:
        return True

    # drop the duplicate heading and one adjacent blank line
    del lines[j]
    if j < len(lines) and not lines[j].strip():
        del lines[j]

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="write changes (default: dry-run)")
    args = parser.parse_args()

    changed = 0
    scanned = 0
    for entry in sorted(os.listdir(DOCS_DIR)):
        chapter_dir = os.path.join(DOCS_DIR, entry)
        if not (CHAPTER_DIRS_RE.match(entry) and os.path.isdir(chapter_dir)):
            continue
        for name in sorted(os.listdir(chapter_dir)):
            if not name.endswith(".md"):
                continue
            scanned += 1
            path = os.path.join(chapter_dir, name)
            if dedupe_file(path, args.apply):
                changed += 1

    mode = "APPLIED" if args.apply else "DRY-RUN"
    print(f"[{mode}] scanned {scanned} entity files, deduped {changed}")
    if not args.apply and changed:
        print("re-run with --apply to write changes", file=sys.stderr)


if __name__ == "__main__":
    main()
