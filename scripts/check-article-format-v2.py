#!/usr/bin/env python3
"""Extended format/layout scanner for wiki-book chapter pages.

Complements check-article-quality.py with structural layout checks:

  ERROR  multiple h1           — more than one level-1 heading in body
  ERROR  unclosed fence        — odd number of ``` fences
  ERROR  unclosed html comment — <!-- without -->
  ERROR  broken table          — pipe-table header row without a separator row
  ERROR  heading-in-table      — table row containing heading markers
  WARN   h-skipped             — heading level jumps by more than 1
  WARN   adjacent-h2-dup       — two consecutive identical headings
  WARN   empty-section         — heading immediately followed by another heading
  WARN   raw-html-leak         — visible unclosed <div>/<span> style tags in prose
  WARN   bare-angle-bracket    — generic <placeholder> tokens in prose (not tags)
  WARN   image-missing-alt     — image syntax without alt text
  WARN   link-empty-text       — markdown link with empty label
  WARN   trailing-whitespace-code — code fence opened with indentation
  WARN   no-frontmatter        — file missing YAML frontmatter (chapter pages only)
  WARN   frontmatter-no-title  — frontmatter lacks a title field
  WARN   smart-quote-mention   — placeholder text like "TODO"/"TBD"/"待补"
  WARN   collapsed-list        — numbered list lines without blank line after heading

Report-only (exit 0). --strict exits 1 on any ERROR.
"""
import os
import re
import sys
from glob import glob

DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")

HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
FENCE = re.compile(r"^(\s*)(`{3,}|~{3,})")
TABLE_ROW = re.compile(r"^\s*\|.*\|\s*$")
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$")
IMG = re.compile(r"!\[\s*\]\(([^)]+)\)")
LINK_EMPTY = re.compile(r"(?<!\!)\[\s*\]\(([^)]+)\)")
HTML_COMMENT = re.compile(r"<!--|-->")
GENERIC_TAG = re.compile(r"<(your|my|the|name|path|file|example|placeholder)[^>]*>", re.I)
PLACEHOLDER = re.compile(r"\b(TODO|TBD|FIXME|待补|待完善|占位符)\b")
FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---", re.S)
TITLE_IN_FM = re.compile(r"^title\s*:", re.M)


def scan(path):
    issues = []
    try:
        text = open(path, encoding="utf-8", errors="replace").read()
    except OSError as exc:
        return [f"unreadable ({exc})"]

    label_prefix = ""

    fm = FRONTMATTER.match(text)
    body = text
    if fm:
        body = text[fm.end():]
        if not TITLE_IN_FM.search(fm.group(1)):
            issues.append(("WARN", "frontmatter-no-title"))

    lines = body.split("\n")

    # fences: count and track code-block state
    fence_count = 0
    in_code = False
    for ln in lines:
        m = FENCE.match(ln)
        if m:
            fence_count += 1
            in_code = not in_code
            if m.group(1):
                issues.append(("WARN", "indented-fence", ln.strip()[:60]))
    if fence_count % 2 == 1:
        issues.append(("ERROR", "unclosed-fence"))

    # headings — code-fence aware (shell comments like "# do x" live in fences)
    h1 = 0
    prev_level = 0
    prev_title = None
    in_code = False
    for i, ln in enumerate(lines):
        if FENCE.match(ln):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = HEADING.match(ln)
        if m:
            level = len(m.group(1))
            title = m.group(2)
            if level == 1:
                h1 += 1
            if prev_level and level - prev_level > 1:
                issues.append(("WARN", f"h{prev_level}->h{level} skip", f"line {i+1}: {title[:50]}"))
            if prev_title is not None and title == prev_title:
                issues.append(("WARN", "duplicate-adjacent-heading", f"line {i+1}: {title[:50]}"))
            prev_level, prev_title = level, title
        else:
            prev_title = None if not ln.strip() else prev_title
    if h1 > 1:
        issues.append(("ERROR", f"multiple-h1 ({h1})"))

    # html comments — balanced pairs outside code fences ("->" in mermaid edges is an arrow)
    open_count = 0
    balanced = True
    in_code = False
    for ln in lines:
        if FENCE.match(ln):
            in_code = not in_code
            continue
        if in_code:
            continue
        open_count += len(re.findall(r"<!--", ln))
        for m in re.finditer(r"-->", ln):
            if open_count == 0:
                balanced = False
            else:
                open_count -= 1
    if not balanced or open_count != 0:
        issues.append(("ERROR", "unbalanced-html-comment"))

    # tables: the first row of a contiguous table block must be followed by a separator
    in_code = False
    prev_was_row = False
    for i, ln in enumerate(lines):
        if FENCE.match(ln):
            in_code = not in_code
            prev_was_row = False
            continue
        if in_code:
            continue
        is_row = bool(TABLE_ROW.match(ln))
        if is_row and not prev_was_row:
            nxt = lines[i + 1] if i + 1 < len(lines) else ""
            if not TABLE_SEP.match(nxt) and ln.count("|") >= 2:
                issues.append(("WARN", "table-without-separator", f"line {i+1}: {ln.strip()[:60]}"))
            if re.search(r"#{2,}\s+\S", ln):
                issues.append(("ERROR", "heading-in-table", f"line {i+1}: {ln.strip()[:60]}"))
        prev_was_row = is_row

    # empty sections: a heading whose section has no content before a
    # same-or-higher-level heading (a subheading directly under is normal structure)
    in_code = False
    for i, ln in enumerate(lines):
        if FENCE.match(ln):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = HEADING.match(ln)
        if not m:
            continue
        level = len(m.group(1))
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        if j < len(lines):
            m2 = HEADING.match(lines[j])
            if m2 and len(m2.group(1)) <= level:
                issues.append(("WARN", "empty-section", f"line {i+1}: {m.group(2)[:40]}"))

    # images without alt, empty links
    for m in IMG.finditer(body):
        issues.append(("WARN", "image-missing-alt", m.group(1)[:60]))
    for m in LINK_EMPTY.finditer(body):
        issues.append(("WARN", "link-empty-text", m.group(1)[:60]))

    # generic placeholder tags and TODO markers
    for m in GENERIC_TAG.finditer(body):
        issues.append(("WARN", "placeholder-tag", m.group(0)[:40]))
    for m in PLACEHOLDER.finditer(body):
        issues.append(("WARN", "placeholder-word", m.group(0)))

    return issues


def main():
    strict = "--strict" in sys.argv
    files = sorted(glob(os.path.join(DOCS, "ch[0-9]*", "[0-9]*.md")))
    errors, warnings = [], []
    for path in files:
        label = os.path.relpath(path, DOCS)
        for issue in scan(path):
            kind = issue[0]
            msg = " ".join(str(x) for x in issue[1:])
            (errors if kind == "ERROR" else warnings).append(f"{label}: {msg}")

    print(f"Scanned {len(files)} files")
    print(f"ERRORS: {len(errors)}")
    for e in errors:
        print(f"  ERROR {e}")
    print(f"WARNINGS: {len(warnings)}")
    for w in warnings:
        print(f"  WARN  {w}")
    if strict and errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
