#!/usr/bin/env python3
"""Mechanical structure repair for wiki entity bodies.

Corruption classes observed in the published projection
(see check-article-quality.py / check-article-format-v2.py findings):

  A  mid-body metadata leak  — a body-level `--- ... ---` fence holding
     ingestion fields (source/source_url/feed_name/ingested/...), usually
     preceded by a stray scrape H1 and an empty marker heading (深度分析);
     also the fence-less variant where only the closing --- survives
  B  doubled tail sections   — 相关主题 / 相关实体 headings appearing twice;
     the second copy is a degenerate duplicate (empty links or a nav stub)
  C  empty-label links       — list items like `-  — 描述` / `- []` whose
     link text was lost; they render as blank bullets
  D  empty nav sections      — 关联阅读/资源链接/Cross-links/... headings
     with no content under them
  E  doubled table pipes     — rows starting/ending with `||` (link-conversion
     artifact); rows render with empty phantom cells

The script rewrites files in ~/wiki/entities in place. Dry-run by default;
pass --apply to write. Idempotent: a clean corpus produces a zero diff.
"""
import os
import re
import sys
from glob import glob

ENTITIES = os.path.expanduser("~/wiki/entities")

META_KEY = re.compile(r"^(source|source_url|feed_name|source_published|ingested|sha256)\s*:", re.M)
META_LINE = re.compile(r"^(source|source_url|feed_name|source_published|ingested|sha256)\s*:\s*\S", re.M)
FENCE_BLOCK = re.compile(r"^---\s*\n(.*?)^---\s*\n?", re.M | re.S)
MARKER_HEADINGS = ("深度分析", "核心内容", "概述", "摘要", "摘要·要点")
SECTION_HEAD = re.compile(r"^## (相关主题|相关实体)[ \t]*(?:\n|\Z)", re.M)
EMPTY_ITEM = re.compile(r"^[-*]\s*(?:\[\s*\]\([^)]*\)|—|—\s*.+|\s)\n", re.M)
TAIL_HEAD = re.compile(r"^## (?:相关主题|相关实体|相关概念|与本文相关|关联阅读|关联条目|Cross-links|资源链接|原文链接)[ \t]*(?:\n|\Z)", re.M)


def split_frontmatter(text):
    m = re.match(r"\A---\n.*?\n---\n", text, re.S)
    return (text[: m.end()], text[m.end():]) if m else ("", text)


def fix_metadata_leak(body):
    """Remove body-level metadata fence blocks (both fenced and fence-less
    variants) and any stranded headings left empty directly before them."""
    removed = 0

    while True:
        leak = next((m for m in FENCE_BLOCK.finditer(body) if META_KEY.search(m.group(1))), None)
        if leak is None:
            break
        body = body[: leak.start()] + body[leak.end():]
        removed += 1

    # fence-less variant: a run of bare meta lines, optionally closed by ---
    lines = body.split("\n")
    out = []
    i, n = 0, len(lines)
    in_code = False
    while i < n:
        ln = lines[i]
        if re.match(r"^\s*(`{3,}|~{3,})", ln):
            in_code = not in_code
            out.append(ln)
            i += 1
            continue
        if not in_code and META_LINE.match(ln.strip()):
            j = i
            saw_meta = False
            while j < n:
                s = lines[j].strip()
                if META_LINE.match(s):
                    saw_meta = True
                    j += 1
                elif not s and j + 1 < n:
                    j += 1
                elif s == "---":
                    j += 1
                    removed += 1
                    break
                else:
                    break
            if saw_meta:
                removed += 1
                i = j
                continue
        out.append(ln)
        i += 1
    body = "\n".join(out)

    if removed:
        lines = body.split("\n")
        out = []
        for i, ln in enumerate(lines):
            stripped = ln.strip()
            # drop headings left with no content before the next heading
            if re.match(r"^#{1,2}\s+", stripped):
                nxt = next((l for l in lines[i + 1:] if l.strip()), "")
                if re.match(r"^#{1,6}\s+", nxt) or nxt.startswith("---"):
                    label = re.sub(r"^#+\s+|\s*#*$", "", stripped)
                    is_link_only = re.match(r"^#?\s*\[.*\]\(http", stripped)
                    if is_link_only or any(label == m_ for m_ in MARKER_HEADINGS):
                        continue
            out.append(ln)
        body = "\n".join(out)
    return body, removed


def fix_doubled_sections(body):
    """Keep the first 相关主题/相关实体 section; drop later duplicates unless
    the first copy holds no links and the duplicate does. All cuts are
    applied right-to-left so earlier deletions cannot shift later spans."""
    matches = list(SECTION_HEAD.finditer(body))
    by_name = {}
    for m in matches:
        name = m.group(1)
        nxt = re.search(r"^## |\Z", body[m.end():], re.M)
        end = m.end() + (nxt.start() if nxt else len(body) - m.end())
        by_name.setdefault(name, []).append((m.start(), end, m.end(), body[m.end():end]))

    cuts = []
    for name, spans in by_name.items():
        if len(spans) < 2:
            continue
        first_has_links = bool(re.search(r"^\s*[-*]\s*\[.+\]", spans[0][3], re.M))
        drop_idx = []
        for k in range(1, len(spans)):
            seg_has_links = bool(re.search(r"^\s*[-*]\s*\[.+\]", spans[k][3], re.M))
            if first_has_links or not seg_has_links:
                drop_idx.append(k)
        if not first_has_links and not drop_idx:
            # first copy is broken but a later copy has links: keep that one
            keeper = next(k for k in range(1, len(spans))
                          if re.search(r"^\s*[-*]\s*\[.+\]", spans[k][3], re.M))
            drop_idx = [k for k in range(len(spans)) if k != keeper]
        for k in drop_idx:
            start, end, _, _ = spans[k]
            cuts.append((start, end))

    for start, end in sorted(cuts, reverse=True):
        body = body[:start] + body[end:]
    return body, len(cuts)


def fix_empty_link_items(body):
    new, n = EMPTY_ITEM.subn("", body)
    # a tail-section family heading left with no items after cleanup is dropped
    cuts = []
    for m in TAIL_HEAD.finditer(new):
        nxt = re.search(r"^## |\Z", new[m.end():], re.M)
        seg = new[m.end(): m.end() + (nxt.start() if nxt else len(new) - m.end())]
        if not seg.strip():
            cuts.append((m.start(), m.end() + len(seg)))
    for start, end in sorted(cuts, reverse=True):
        new = new[:start] + new[end:]
    return new, n + len(cuts)


def fix_double_pipes(body):
    """Table rows starting/ending with doubled `||` collapse to single pipes."""
    n1 = len(re.findall(r"^(\s*)\|{2,} ", body, flags=re.M))
    body = re.sub(r"^(\s*)\|{2,} ", r"\1| ", body, flags=re.M)
    body = re.sub(r"^(\s*)\|{2,}$", r"\1|", body, flags=re.M)
    n2 = len(re.findall(r" \|{2,}$", body, flags=re.M))
    body = re.sub(r" \|{2,}$", " |", body, flags=re.M)
    return body, n1 + n2


def main():
    apply = "--apply" in sys.argv
    files = sorted(glob(os.path.join(ENTITIES, "*.md")))
    touched = 0
    stats = {"leak": 0, "section": 0, "item": 0, "pipes": 0}
    for path in files:
        text = open(path, encoding="utf-8").read()
        fm, body = split_frontmatter(text)
        body, leaks = fix_metadata_leak(body)
        body, sections = fix_doubled_sections(body)
        body, items = fix_empty_link_items(body)
        body, pipes = fix_double_pipes(body)
        if leaks or sections or items or pipes:
            touched += 1
            stats["leak"] += leaks
            stats["section"] += sections
            stats["item"] += items
            stats["pipes"] += pipes
            print(f"{os.path.basename(path)}: leak={leaks} dup_sections={sections} empty_items={items} pipes={pipes}")
            if apply:
                open(path, "w", encoding="utf-8").write(fm + body)
    mode = "APPLIED" if apply else "DRY-RUN (pass --apply to write)"
    print(f"\n{mode}: {touched} files would change; {stats}")


if __name__ == "__main__":
    main()
