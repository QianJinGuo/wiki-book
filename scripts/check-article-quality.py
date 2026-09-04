#!/usr/bin/env python3
"""Published-article quality gate for wiki-book chapter pages.

Scans docs/ch*/[0-9]*.md for quality markers that indicate failed
ingestion or broken output layers:

  ERROR  scrape residue      — line-anchored "Published Time:" / "Markdown
                               Content:" or the template boilerplate sentence
  ERROR  mangled key points  — numbered "核心观点" item that is a heading fragment
  WARN   dead chapter link   — relative ../chXX/*.html link with no matching
                               chapter page (checked against site/ when built,
                               otherwise against the docs tree)
  WARN   duplicate entity section — more than one "## 相关实体" heading
  WARN   empty entity section     — "## 相关实体" with no list items
  INFO   stub size           — body under 2 KB

Report-only by default (exit 0) so nightly builds stay green while problems
are surfaced in the log. Pass --strict to exit 1 on any ERROR.
"""
import os
import re
import sys
from glob import glob

DOCS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
SITE = os.path.join(os.path.dirname(DOCS), "site")

SCRAPE_PAT = re.compile(r"^(Published Time|Markdown Content):", re.M)
BOILERPLATE = "领域的核心技术议题"
MANGLED_PAT = re.compile(r"### 核心观点.*?^[0-9]+\. # ", re.M | re.S)
LINK_PAT = re.compile(r"\]\((\.\./ch[0-9]+/[^)#]+?\.html)(?:#[^)]*)?\)")
SECTION_PAT = re.compile(r"^## 相关实体", re.M)


def chapter_pages():
    pages = set()
    for path in glob(os.path.join(DOCS, "ch[0-9]*", "*.md")):
        pages.add(os.path.relpath(path, DOCS).replace(".md", ".html"))
    return pages


def main():
    strict = "--strict" in sys.argv
    docs_pages = chapter_pages()
    errors, warnings, infos = [], [], []

    files = sorted(glob(os.path.join(DOCS, "ch[0-9]*", "[0-9]*.md")))
    for path in files:
        label = os.path.relpath(path, DOCS)
        try:
            text = open(path, encoding="utf-8", errors="replace").read()
        except OSError as exc:
            errors.append(f"{label}: unreadable ({exc})")
            continue

        if SCRAPE_PAT.search(text) or BOILERPLATE in text:
            errors.append(f"{label}: scrape residue markers present")
        if MANGLED_PAT.search(text):
            errors.append(f"{label}: 核心观点 contains heading fragments")

        for match in LINK_PAT.finditer(text):
            # "../ch03/x.html" is relative to the chapter directory, which is
            # SITE/ch03/ — strip the leading ".." and resolve against SITE.
            target = match.group(1)
            resolved = os.path.join(SITE, target.lstrip("./"))
            if os.path.exists(resolved):
                continue
            if target in docs_pages:
                continue
            warnings.append(f"{label}: dead chapter link -> {target}")

        sections = SECTION_PAT.findall(text)
        if len(sections) > 1:
            warnings.append(f"{label}: {len(sections)} 相关实体 sections (duplicated)")
        for sec in re.finditer(r"^## 相关实体\s*$([^#]*?)(?=^## |\Z)", text, re.M | re.S):
            if not re.search(r"^- ", sec.group(1), re.M):
                warnings.append(f"{label}: 相关实体 section has no entries")

        if len(text.encode("utf-8", errors="replace")) < 2048:
            infos.append(f"{label}: stub-size article")

    print(f"Checked {len(files)} chapter articles: "
          f"{len(errors)} error(s), {len(warnings)} warning(s), {len(infos)} stub(s)")
    for line in errors[:50]:
        print(f"  ERROR {line}")
    for line in warnings[:30]:
        print(f"  WARN  {line}")
    if len(errors) > 50:
        print(f"  ... and {len(errors) - 50} more error(s)")

    if strict and errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
