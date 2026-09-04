#!/usr/bin/env python3
"""Migrate public-book links from local raw copies to original sources."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import unquote


GITHUB_RAW = re.compile(
    r"https://github\.com/QianJinGuo/wiki-book/(?:blob|tree)/main/docs/raw/articles/([^\s<>\]\)\"'`]+)",
    re.IGNORECASE,
)
SCHEME_RAW = re.compile(r"https?://raw/articles/([^\s<>\]\)\"'`|]+)", re.IGNORECASE)
RELATIVE_RAW = re.compile(r"raw/articles/([^\s<>\]\)\"'`|]+)", re.IGNORECASE)
MARKDOWN_LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
CARET_CITATION = re.compile(r"\^\[raw/articles/([^\]]+)\]", re.IGNORECASE)
OBSIDIAN_LINK = re.compile(r"\[\[raw/articles/([^\]|]+)(?:\|([^\]]+))?\]\]", re.IGNORECASE)
PIPE_LINK = re.compile(r"\[raw/articles/([^\]|]+)(?:\|([^\]]+))?\]", re.IGNORECASE)
BRACKET_CITATION = re.compile(r"\[\^?raw/articles/([^\]]+)\]", re.IGNORECASE)


def filename(raw: str) -> str | None:
    value = unquote(raw).strip().rstrip(".,;!?\"'`")
    marker = value.lower().find(".md")
    if marker >= 0:
        value = value[: marker + 3]
    elif not value.endswith(".md"):
        value += ".md"
    return value


def target_for(raw: str, mapping: dict[str, str]) -> str | None:
    name = filename(raw)
    return mapping.get(name) if name else None


def source_label(label: str) -> str:
    """Keep meaningful prose labels, but drop labels that only mean source."""
    value = label.strip()
    if re.fullmatch(r"(?:第\s*[0-9一二三四五六七八九十]+\s*)?(?:原文|来源|source|raw)(?:链接|存档|归档)?(?:\s*[0-9一二三四五六七八九十]+)?(?:\s*[（(].*[）)])?", value, re.IGNORECASE):
        return ""
    return value


def rewrite_file(path: Path, mapping: dict[str, str]) -> tuple[bool, int, int]:
    original = path.read_text(encoding="utf-8", errors="replace")
    changed = 0
    unmapped = 0

    def rewrite_line(line: str) -> str:
        nonlocal changed, unmapped
        if line.lstrip().startswith("```") or line.lstrip().startswith("~~~"):
            return line

        protected: list[str] = []

        def protect(match: re.Match[str]) -> str:
            protected.append(match.group(0))
            return f"\x00CODE{len(protected) - 1}\x00"

        content = re.sub(r"`+[^`\n]*`+", protect, line)
        line_unmapped = False

        def markdown_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            label, target = match.group(1), match.group(2)
            raw_match = GITHUB_RAW.fullmatch(target) or SCHEME_RAW.fullmatch(target) or RELATIVE_RAW.fullmatch(target)
            if not raw_match:
                return match.group(0)
            source = target_for(raw_match.group(1), mapping)
            changed += 1
            if source:
                return f"[{label}]({source})"
            unmapped += 1
            line_unmapped = True
            return source_label(label)

        content = MARKDOWN_LINK.sub(markdown_replacement, content)

        def obsidian_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            label = source_label(match.group(2) or match.group(1))
            changed += 1
            if source:
                return f"[{label or '原始来源'}]({source})"
            unmapped += 1
            line_unmapped = True
            return label

        content = OBSIDIAN_LINK.sub(obsidian_replacement, content)

        def pipe_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            label = source_label(match.group(2) or match.group(1))
            changed += 1
            if source:
                return f"[{label or '原始来源'}]({source})"
            unmapped += 1
            line_unmapped = True
            return label

        content = PIPE_LINK.sub(pipe_replacement, content)

        def github_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            changed += 1
            if source:
                return source
            unmapped += 1
            line_unmapped = True
            return ""

        content = GITHUB_RAW.sub(github_replacement, content)

        def scheme_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            changed += 1
            if source:
                return source
            unmapped += 1
            line_unmapped = True
            return ""

        def citation_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            changed += 1
            if source:
                return f"^[{source}]"
            unmapped += 1
            line_unmapped = True
            return ""

        content = CARET_CITATION.sub(citation_replacement, content)

        def bracket_replacement(match: re.Match[str]) -> str:
            nonlocal changed, unmapped, line_unmapped
            source = target_for(match.group(1), mapping)
            changed += 1
            if source:
                return f"[{source_label(match.group(1)) or '原始来源'}]({source})"
            unmapped += 1
            line_unmapped = True
            return ""

        content = BRACKET_CITATION.sub(bracket_replacement, content)
        content = SCHEME_RAW.sub(scheme_replacement, content)

        if line_unmapped:
            # Remove empty citation/link remnants created by an unmapped source.
            content = re.sub(r"\^\[\s*\]", "", content)
            content = re.sub(r"\^\[\s*[\"'][^\n]*?[\"']\s*\]", "", content)
            content = re.sub(r"\[\s*\]", "", content)
            content = re.sub(r"(?m)^\s*(?:[-*>]\s*)?(?:→\s*)?(?:原文(?:链接|存档|归档)?|来源)\s*$\n?", "", content)
            content = re.sub(r"(?m)^\s*[-*>]?\s*原文(?:链接|存档|归档)?：\s*(?:原文(?:链接|存档|归档)?|来源)?\s*$\n?", "", content)

        for index, value in enumerate(protected):
            content = content.replace(f"\x00CODE{index}\x00", value)
        return content

    # Some imported Markdown pages contain an unclosed code fence. Process
    # every line and protect inline code instead of trusting fence state, so a
    # real source link after malformed imported markup is still migrated.
    content = "".join(rewrite_line(line) for line in original.splitlines(keepends=True))

    if content != original:
        path.write_text(content, encoding="utf-8")
    return content != original, changed, unmapped


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--docs", type=Path, required=True)
    parser.add_argument("--mapping", type=Path, required=True)
    args = parser.parse_args()
    mapping = json.loads(args.mapping.read_text(encoding="utf-8"))
    files = sorted(p for p in args.docs.rglob("*.md") if "raw" not in p.relative_to(args.docs).parts)
    modified = 0
    replacements = 0
    unmapped = 0
    chapter_files = 0
    chapter_replacements = 0
    for path in files:
        did_change, count, missing = rewrite_file(path, mapping)
        if did_change:
            modified += 1
        replacements += count
        unmapped += missing
        relative = path.relative_to(args.docs).as_posix()
        if re.match(r"^ch(?:0[1-9]|1[0-9]|20)(?:/|\.md$)", relative):
            chapter_files += int(did_change)
            chapter_replacements += count
    print(
        json.dumps(
            {
                "files_modified": modified,
                "raw_link_replacements": replacements,
                "unmapped_raw_links_removed": unmapped,
                "chapter_files_modified": chapter_files,
                "chapter_link_replacements": chapter_replacements,
            },
            ensure_ascii=False,
        )
    )
    if unmapped:
        raise SystemExit("unmapped raw links were removed; review the count before publishing")


if __name__ == "__main__":
    main()
