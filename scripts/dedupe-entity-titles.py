#!/usr/bin/env python3
"""
Remove duplicated generated titles and demote extra H1s on entity pages.

Every split entity page (docs/ch*/NNN-*.md) carries the page title twice:

    # MemOS Hermes 记忆插件
    ## Ch06.018 MemOS Hermes 记忆插件   <-- duplicate, removed

The external wiki-sync regenerates entity files daily and re-adds these
heading artifacts, so build.sh runs this script before every `mkdocs build`
to keep the deployed site clean. Exact title repeats are removed; any
remaining source H1 is demoted to an H2 so the generated page retains one
page-level title while preserving the source heading text.

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
H1_RE = re.compile(r"^#\s+(.+?)\s*$")
FENCE_RE = re.compile(r"^\s*(```|~~~)")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def h1_indices(lines):
    """Yield top-level headings outside fenced code blocks."""
    in_fence = False
    for index, line in enumerate(lines):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence and H1_RE.match(line):
            yield index


def dedupe_file(path: str, apply: bool) -> bool:
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    h1_idx = next(h1_indices(lines), None)
    if h1_idx is None:
        return False
    h1_text = normalize(H1_RE.match(lines[h1_idx]).group(1))
    changed = False

    # first non-blank line after the H1
    j = h1_idx + 1
    while j < len(lines) and not lines[j].strip():
        j += 1
    m = DUP_HEAD_RE.match(lines[j]) if j < len(lines) else None
    if m and normalize(m.group(1)) == h1_text:
        if apply:
            # Drop the duplicate heading and one adjacent blank line.
            del lines[j]
            if j < len(lines) and not lines[j].strip():
                del lines[j]
            changed = True

    # The compiler embeds the source entity body, which may contain the page
    # title again or carry another source-level H1. Remove exact repeats and
    # demote any remaining H1 so the split page has one page-level title.
    first_h1 = next(h1_indices(lines), None)
    duplicate_h1s = [
        index for index in h1_indices(lines)
        if index != first_h1
        and normalize(H1_RE.match(lines[index]).group(1)) == h1_text
    ]
    if duplicate_h1s:
        if apply:
            for index in reversed(duplicate_h1s):
                del lines[index]
                if index < len(lines) and not lines[index].strip():
                    del lines[index]
            changed = True
        else:
            return True

    first_h1 = next(h1_indices(lines), None)
    extra_h1s = [index for index in h1_indices(lines) if index != first_h1]
    if extra_h1s:
        if apply:
            for index in extra_h1s:
                lines[index] = "#" + lines[index]
            changed = True
        else:
            return True

    if not apply:
        return bool(m and normalize(m.group(1)) == h1_text)
    if not changed:
        return False

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
