#!/usr/bin/env python3
"""Generate references.md from wiki raw articles."""
import os, re, yaml
from pathlib import Path
from urllib.parse import urlparse

WIKI = Path(os.path.expanduser("~/wiki"))
BOOK = Path(os.path.expanduser("~/wiki-book"))
DOCS = BOOK / "docs"

def extract_refs():
    refs = []
    raw_dir = WIKI / "raw" / "articles"
    for f in sorted(raw_dir.glob("*.md")):
        try:
            content = f.read_text(encoding="utf-8", errors="ignore")
            m = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
            if not m:
                continue
            fm = yaml.safe_load(m.group(1))
            title = fm.get("title", f.stem)
            url = fm.get("source_url", "")
            if not url:
                url_match = re.search(r"URL:\s*(https?://\S+)", content)
                url = url_match.group(1) if url_match else ""
            if not url:
                continue
            url = url.rstrip("]")
            domain = urlparse(url).netloc.replace("www.", "")
            if not domain or domain in ("unknown", "N/A"):
                continue
            pub_date = fm.get("publish_date", "")
            refs.append({"title": title, "url": url, "date": pub_date, "slug": f.stem})
        except:
            pass
    return refs

def group_by_domain(refs):
    domains = {}
    for r in refs:
        domain = urlparse(r["url"]).netloc.replace("www.", "")
        domains.setdefault(domain, []).append(r)
    return dict(sorted(domains.items(), key=lambda x: -len(x[1])))

def generate_markdown(refs):
    domains = group_by_domain(refs)
    
    lines = []
    lines.append("# 参考文献")
    lines.append("")
    lines.append(f"> 本书基于 **{len(refs)}** 篇一手 AI 材料系统编撰。")
    lines.append(f"> 涵盖 **{len(domains)}** 个来源站点。")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Top sources summary
    lines.append("## 主要来源")
    lines.append("")
    lines.append("| 来源 | 文章数 |")
    lines.append("|---|---|")
    for domain, articles in list(domains.items())[:20]:
        lines.append(f"| {domain} | {len(articles)} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Full reference list by domain
    lines.append("## 完整索引")
    lines.append("")
    for domain, articles in domains.items():
        lines.append(f"### {domain}（{len(articles)} 篇）")
        lines.append("")
        for a in articles:
            date_str = f" ({a['date']})" if a["date"] else ""
            lines.append(f"- [{a['title']}]({a['url']}){date_str}")
        lines.append("")
    
    return "\n".join(lines)

if __name__ == "__main__":
    refs = extract_refs()
    md = generate_markdown(refs)
    out = DOCS / "references.md"
    out.write_text(md, encoding="utf-8")
    print(f"Generated {out} with {len(refs)} references")
