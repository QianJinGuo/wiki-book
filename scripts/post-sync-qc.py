#!/usr/bin/env python3
"""
Post-sync QC check for wiki-book articles.

Run after every sync to catch pipeline defects before they reach production.
Exit code 0 = clean, 1 = issues found (list printed to stderr).

Detects all defect families found in the 2026-09 full-corpus review:
  1. K-leak: QC scoring metadata leaked into article bodies
  2. M-duplicate: same archive URL across multiple article files
  3. Garbage slug: entity slug derived from short-link or date path
  4. Level anomaly: non-standard Level star ratings
  5. Scraper metadata: Published Time / Markdown Content residue
  6. Empty section: header with no content before next section
  7. Bare quoted entity: - "Entity Name" without link
  8. Citation artifact: ]"] broken citation remnants
  9. Dangling archive: → 原文存档 with no URL
  10. Double 实践启示: duplicate section headers

Usage:
  python3 scripts/post-sync-qc.py [--docs-dir docs/] [--quiet]
"""
import re
import sys
import pathlib
import collections
import argparse

# ─── Patterns ────────────────────────────────────────────────────────────────

K_LEAK = re.compile(
    r'v×c\s*=\s*\d+'
    r'|\bv\s*=\s*\d+\s*[×x*]\s*c\s*=\s*\d+'
    r'|\bvalue\s*=\s*\d+,\s*confidence\s*=\s*\d+'
    r'|\b\d+\s*[×x]\s*\d+\s*=\s*\d+\s*-\s*Article ingested'
    r'|Article ingested from newsletter candidate pipeline'
    r'|评分[:：]\s*v\s*=\s*\d+'
    r'|\bIngest score\b.*v\s*=\s*\d+'
    r'|知识价值.*置信度'
    r'|→\s*MERGE'
    r'|candidate pipeline'
)

SCRAPER_META = re.compile(r'Published Time:.*Markdown Content:')

GARBAGE_SLUG = re.compile(
    r'^[a-f0-9]{6,}$'           # hex string (e.g. 5237875, 3rdfsmp)
    r'|^\d{4}[-_]\d{2}[-_]\d{2}$'  # date-only (e.g. 2026-04-15)
    r'|^\d+$'                     # pure number
)

LEVEL_ANOMALY = re.compile(r'📊 Level (?!\⭐\⭐\⭐[\s|])')

EMPTY_SEC = re.compile(
    r'^## (?:来源|Notes|相关引用|外部参考|参考来源|原始引用|参考|关联阅读|'
    r'主题导航|可视化|关键引用|相关主题|相关链接|参考链接|参考页面|架构图)\s*$',
    re.M
)

BARE_QUOTED = re.compile(r'^- "[^"]*"\s*$', re.M)

CITATION_ARTIFACT = re.compile(r'\]"\]')

DANGLING_ARCHIVE = re.compile(r'^→ 原文存档\s*$', re.M)

DUAL_PRACTICE = re.compile(r'^## 实践启示', re.M)

ARCH_PLACEHOLDER = re.compile(r'架构图待生成')

SELF_REF_ENTITY = re.compile(
    r'^- \[.+?\]\((\d{3}-.+?\.html)\)',
    re.M
)


def check_file(path: pathlib.Path, rel: str) -> list:
    """Return list of issue dicts for one file."""
    issues = []
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return issues

    def add(category, detail):
        issues.append({
            "file": rel,
            "category": category,
            "detail": detail[:150],
            "line": 0,  # populated by caller for line-level checks
        })

    # 1. K-leak (line-level)
    for i, ln in enumerate(text.split("\n"), 1):
        m = K_LEAK.search(ln)
        if m:
            issues.append({
                "file": rel, "category": "K-leak",
                "detail": f"line {i}: {m.group()}", "line": i,
            })

    # 2. Scraper metadata
    m = SCRAPER_META.search(text)
    if m:
        add("Scraper-metadata", m.group()[:80])

    # 3. Level anomaly
    m = LEVEL_ANOMALY.search(text)
    if m:
        add("Level-anomaly", m.group()[:40])

    # 4. Empty section (needs line-level)
    lines = text.split("\n")
    empty_sec = re.compile(
        r'^## (?:来源|Notes|相关引用|外部参考|参考来源|原始引用|参考|'
        r'关联阅读|主题导航|可视化|关键引用|相关主题|相关链接|参考链接|'
        r'参考页面|架构图)\s*$'
    )
    for i, ln in enumerate(lines):
        if empty_sec.match(ln):
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j >= len(lines) or lines[j].startswith("#") or lines[j].startswith("---"):
                issues.append({
                    "file": rel, "category": "Empty-section",
                    "detail": f"line {i+1}: {ln.strip()}", "line": i + 1,
                })

    # 5. Bare quoted entity
    for m in BARE_QUOTED.finditer(text):
        issues.append({
            "file": rel, "category": "Bare-quoted-entity",
            "detail": m.group()[:80], "line": 0,
        })

    # 6. Citation artifact
    for m in CITATION_ARTIFACT.finditer(text):
        issues.append({
            "file": rel, "category": "Citation-artifact",
            "detail": "']\"]' remnant", "line": 0,
        })

    # 7. Dangling archive
    for m in DANGLING_ARCHIVE.finditer(text):
        issues.append({
            "file": rel, "category": "Dangling-archive",
            "detail": "→ 原文存档 without URL", "line": 0,
        })

    # 8. Dual practice section (skip MOC/overview files at docs/ root level —
    #    they aggregate multiple sources and legitimately have per-source sections)
    is_moc = "/" not in rel  # MOC files are directly under docs/ (e.g. docs/ch02-prompt.md)
    if not is_moc:
        practice_count = len(DUAL_PRACTICE.findall(text))
        if practice_count > 1:
            add("Dual-practice-section", f"{practice_count} '## 实践启示' headers")

    # 9. Architecture placeholder
    for m in ARCH_PLACEHOLDER.finditer(text):
        add("Arch-placeholder", "架构图待生成 placeholder")

    # 10. Garbage slug in entity path (check the HTML comment on line 3)
    slug_match = re.search(r'`entities/([^.`]+)\.?m?d?`', text)
    if slug_match:
        slug = slug_match.group(1)
        if GARBAGE_SLUG.match(slug):
            add("Garbage-slug", f"entity slug '{slug}' is non-semantic")

    # 11. M-duplicate: extract PRIMARY archive URLs only
    #     (only from explicit → [原文存档](URL) or > [原文存档](URL) declarations)
    archive_urls = re.findall(
        r'(?:→|>)\s*\[?原文存档\]?\((https?://[^\s\)"]+)\)', text
    )
    if not archive_urls:
        archive_urls = re.findall(
            r'原文存档[:：]?\s*\(?(https?://[^\s\)"]+)\)?', text
        )
    for url in archive_urls:
        issues.append({
            "file": rel, "category": "_archive_url",
            "detail": url, "line": 0,
        })

    return issues


def main():
    parser = argparse.ArgumentParser(description="Post-sync QC check")
    parser.add_argument("--docs-dir", default="docs", help="Path to docs/ directory")
    parser.add_argument("--quiet", action="store_true", help="Only print summary")
    parser.add_argument("--skip-archive-dedup", action="store_true",
                        help="Skip cross-file archive URL dedup check")
    args = parser.parse_args()

    docs = pathlib.Path(args.docs_dir)
    if not docs.exists():
        print(f"Error: {docs} does not exist", file=sys.stderr)
        sys.exit(2)

    all_issues = []
    archive_map = collections.defaultdict(list)  # url -> [files]

    for md in sorted(docs.rglob("*.md")):
        rel = str(md.relative_to(docs))
        issues = check_file(md, rel)
        for iss in issues:
            if iss["category"] == "_archive_url":
                archive_map[iss["detail"]].append(rel)
            else:
                all_issues.append(iss)

    # Cross-file archive URL dedup (M-duplicate detection).
    # Only article pages (under chapter dirs) participate: docs/-root MOC files
    # legitimately cite the archive URL of every source they aggregate.
    # Dedupe file lists first: a URL repeated inside one file (multi-source
    # section) is not a cross-file duplicate.
    if not args.skip_archive_dedup:
        for url, files in sorted(archive_map.items()):
            unique_files = sorted({f for f in files if "/" in f})
            if len(unique_files) > 1:
                all_issues.append({
                    "file": ", ".join(unique_files),
                    "category": "M-duplicate",
                    "detail": f"Same archive URL in {len(unique_files)} files: {url}",
                    "line": 0,
                })

    # Report
    by_cat = collections.Counter(i["category"] for i in all_issues)

    if not args.quiet:
        current_file = None
        for iss in all_issues:
            if iss["file"] != current_file:
                current_file = iss["file"]
                print(f"\n--- {current_file} ---")
            print(f"  [{iss['category']}] {iss['detail']}")

    print(f"\n{'=' * 60}")
    print("Post-sync QC Summary")
    print(f"{'=' * 60}")
    if by_cat:
        for cat, count in by_cat.most_common():
            print(f"  {cat}: {count}")
        print(f"\n  TOTAL ISSUES: {len(all_issues)}")
    else:
        print("  ✅ Clean — no issues detected")

    # Non-zero exit if critical issues found
    critical = {"K-leak", "Scraper-metadata", "Dual-practice-section"}
    warning = {"M-duplicate", "Garbage-slug", "Level-anomaly"}
    critical_count = sum(by_cat.get(c, 0) for c in critical)
    warning_count = sum(by_cat.get(c, 0) for c in warning)
    if critical_count > 0:
        print(f"\n  ⚠️  {critical_count} CRITICAL issues must be fixed")
        if warning_count:
            print(f"  ℹ️  {warning_count} warnings (need human review)")
        sys.exit(1)
    elif all_issues:
        print(f"\n  ℹ️  {len(all_issues)} non-critical issues (cosmetic/structural)")
        sys.exit(0)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
