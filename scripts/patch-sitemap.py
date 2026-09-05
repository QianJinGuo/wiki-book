#!/usr/bin/env python3
"""Add utility pages to the sitemap that MkDocs cannot list.

MkDocs only emits <url> entries for pages generated from markdown. The
dashboard and course UI ship as hand-written HTML under docs/, so they are
served but never appear in sitemap.xml. This script appends them after the
mkdocs build; it is idempotent and keeps the existing file formatting.
"""
import re
import sys
from datetime import date
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
SITE = PROJECT / "site"
SITEMAP = SITE / "sitemap.xml"
MKDOCS_YML = PROJECT / "mkdocs.yml"

# site-relative paths of real HTML pages not generated from markdown.
UTILITY_PAGES = ["dashboard/index.html", "learn/index.html"]


def main() -> int:
    if not SITEMAP.exists():
        print("site/sitemap.xml not found; run mkdocs build first", file=sys.stderr)
        return 1

    yml = MKDOCS_YML.read_text(encoding="utf-8")
    m = re.search(r'^site_url:\s*"([^"]+)"', yml, re.MULTILINE)
    if not m:
        print("site_url not found in mkdocs.yml", file=sys.stderr)
        return 1
    site_url = m.group(1).rstrip("/")

    content = SITEMAP.read_text(encoding="utf-8")

    lastmods = re.findall(r"<lastmod>([^<]+)</lastmod>", content)
    lastmod = max(lastmods) if lastmods else date.today().isoformat()

    added, skipped = [], []
    for page in UTILITY_PAGES:
        if not (SITE / page).is_file():
            print(f"skip {page}: file missing from site/", file=sys.stderr)
            continue
        loc = f"{site_url}/{page}"
        if f"<loc>{loc}</loc>" in content:
            skipped.append(page)
            continue
        added.append(
            f"    <url>\n"
            f"         <loc>{loc}</loc>\n"
            f"         <lastmod>{lastmod}</lastmod>\n"
            f"    </url>\n"
        )

    if added:
        content = content.replace("</urlset>", "".join(added) + "</urlset>")
        SITEMAP.write_text(content, encoding="utf-8")

    print(f"sitemap patched: +{len(added)} added, {len(skipped)} already present, "
          f"{content.count('<loc>')} total URLs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
