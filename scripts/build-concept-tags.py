#!/usr/bin/env python3
"""
Build concept tags for the wiki-book dashboard.

Extracts tags from two sources:
  1. Wiki concepts/ layer  - each concept page has frontmatter tags and cites entities
  2. Wiki raw articles     - each article has frontmatter tags

Maps tags to wiki-book articles via entity-name matching and outputs:
  - Updates docs/dashboard/articles.json with a 'tags' array per article
  - Writes docs/dashboard/concept-tags.json with concept metadata for the concept map

Usage:
  python3 scripts/build-concept-tags.py [--wiki /path/to/wiki]
"""

import json
import os
import re
import sys
from pathlib import Path
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_JSON = ROOT / "docs" / "dashboard" / "articles.json"
CONCEPT_TAGS_JSON = ROOT / "docs" / "dashboard" / "concept-tags.json"

WIKI_DIR = None
CONCEPTS_DIR = None
RAW_ARTICLES_DIR = None

# Tags that carry no topical meaning - filtered out.
NOISE_TAGS = {
    "article", "wechat", "raw", "newsletter", "rss", "email",
    "aws-china-blog", "hackernews", "github-trending", "youtube",
    "twitter", "linkedin", "mp", "mp.weixin.qq.com", "blog", "news",
    "post", "share", "read", "reading", "draft", "todo", "wip",
    "reference", "tbd", "tmp", "temp", "unsorted", "inbox",
    "2024", "2025", "2026", "2027", "concept",
}

def is_noise_tag(tag):
    if tag in NOISE_TAGS:
        return True
    if tag.isdigit():
        return True
    return False
MIN_TAG_FREQUENCY = 3

_FM_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
_TAGS_LINE_RE = re.compile(r"^tags:\s*\[([^\]]+)\]", re.MULTILINE)
_TAG_ITEM_RE = re.compile(r'"([^"]+)"|\'([^\']+)\'|([^,\s]+)')

_CITE_RE = re.compile(r"\^\[raw/articles/([^\]\s]+?)\.md\]")
_ENTITY_LINK_RE = re.compile(r"\[\[entities/([^\]|]+)")


def parse_tags(fm_text):
    m = _TAGS_LINE_RE.search(fm_text)
    if not m:
        return []
    raw = m.group(1)
    tags = []
    for g in _TAG_ITEM_RE.finditer(raw):
        tag = g.group(1) or g.group(2) or g.group(3)
        tag = tag.strip().lower()
        if tag and not is_noise_tag(tag):
            tags.append(tag)
    return tags


def read_frontmatter(path):
    try:
        text = path.read_text(encoding="utf-8", errors="replace")[:3000]
    except Exception:
        return ""
    m = _FM_RE.match(text)
    return m.group(1) if m else ""


def build_article_tags():
    """Return {entity_name_without_ext: [tags]} from raw article frontmatter."""
    result = {}
    if not RAW_ARTICLES_DIR.is_dir():
        print(f"[concept-tags] WARNING: {RAW_ARTICLES_DIR} not found")
        return result
    for md in RAW_ARTICLES_DIR.glob("*.md"):
        fm = read_frontmatter(md)
        if not fm:
            continue
        tags = parse_tags(fm)
        if tags:
            result[md.stem] = tags
    print(f"[concept-tags] Article frontmatter tags: {len(result)} articles with tags")
    return result


def build_concept_tags():
    """Return a list of concept dicts: { name, title, tags, entities }."""
    concepts = []
    if not CONCEPTS_DIR.is_dir():
        print(f"[concept-tags] WARNING: {CONCEPTS_DIR} not found")
        return concepts

    for md in sorted(CONCEPTS_DIR.glob("*.md")):
        fm = read_frontmatter(md)
        if not fm:
            continue
        tags = parse_tags(fm)
        body = md.read_text(encoding="utf-8", errors="replace")

        cites = set(_CITE_RE.findall(body))
        elinks = set(_ENTITY_LINK_RE.findall(body))
        entities = cites | elinks

        concepts.append({
            "name": md.stem,
            "title": _extract_title(fm) or md.stem,
            "tags": tags,
            "entities": sorted(entities),
        })

    print(f"[concept-tags] Concepts parsed: {len(concepts)}")
    return concepts


def _extract_title(fm_text):
    m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm_text, re.MULTILINE)
    return m.group(1).strip() if m else ""


def merge_tags(articles, article_tags, concept_tags):
    """Add 'tags' array to each article. Returns (articles, tag_stats dict)."""
    entity_to_concepts = defaultdict(list)
    for c in concept_tags:
        for ent in c["entities"]:
            entity_to_concepts[ent].append(c["name"])

    tag_counter = Counter()

    for art in articles:
        entity_stem = art.get("entity", "").replace(".md", "")
        tags = set()

        if entity_stem in article_tags:
            tags.update(article_tags[entity_stem])

        if entity_stem in entity_to_concepts:
            for cname in entity_to_concepts[entity_stem]:
                tags.add(cname)
            for cname in entity_to_concepts[entity_stem]:
                for c in concept_tags:
                    if c["name"] == cname:
                        tags.update(c["tags"])
                        break

        tags_sorted = sorted(tags)
        art["tags"] = tags_sorted
        for t in tags_sorted:
            tag_counter[t] += 1

    return articles, dict(tag_counter)


def build_concept_map_data(concept_tags, articles, article_tags):
    """Build concept map structure for the frontend."""
    entity_to_article = {}
    for art in articles:
        stem = art.get("entity", "").replace(".md", "")
        if stem:
            entity_to_article[stem] = art

    concepts_out = []
    for c in concept_tags:
        matched = [e for e in c["entities"] if e in entity_to_article]
        if not matched:
            continue
        concepts_out.append({
            "name": c["name"],
            "title": c["title"],
            "tags": c["tags"],
            "articleCount": len(matched),
            "entityCount": len(c["entities"]),
        })

    tag_index = defaultdict(list)
    for c in concepts_out:
        for t in c["tags"]:
            tag_index[t].append(c["name"])

    return {
        "concepts": concepts_out,
        "tagIndex": dict(tag_index),
        "totalConcepts": len(concepts_out),
    }


def main():
    global WIKI_DIR, CONCEPTS_DIR, RAW_ARTICLES_DIR
    if "--wiki" not in sys.argv:
        print("[concept-tags] ERROR: pass --wiki /path/to/wiki explicitly; no private default is allowed", file=sys.stderr)
        sys.exit(2)
    idx = sys.argv.index("--wiki")
    if idx + 1 >= len(sys.argv):
        print("[concept-tags] ERROR: --wiki requires a directory", file=sys.stderr)
        sys.exit(2)
    WIKI_DIR = Path(sys.argv[idx + 1]).resolve()
    CONCEPTS_DIR = WIKI_DIR / "concepts"
    RAW_ARTICLES_DIR = WIKI_DIR / "raw" / "articles"

    print(f"[concept-tags] Wiki dir: {WIKI_DIR}")

    if not ARTICLES_JSON.exists():
        print(f"[concept-tags] ERROR: {ARTICLES_JSON} not found. Run rank-articles.py first.")
        sys.exit(1)
    with open(ARTICLES_JSON, encoding="utf-8") as f:
        data = json.load(f)
    articles = data["articles"]
    print(f"[concept-tags] Loaded {len(articles)} articles from articles.json")

    article_tags = build_article_tags()
    concept_tags = build_concept_tags()

    articles, tag_stats = merge_tags(articles, article_tags, concept_tags)

    popular_tags = {t: c for t, c in tag_stats.items() if c >= MIN_TAG_FREQUENCY}
    popular_tags = dict(sorted(popular_tags.items(), key=lambda x: -x[1]))

    print(f"[concept-tags] Total unique tags: {len(tag_stats)}")
    print(f"[concept-tags] Tags with >={MIN_TAG_FREQUENCY} articles: {len(popular_tags)}")
    print(f"[concept-tags] Top 15 tags:")
    for tag, count in list(popular_tags.items())[:15]:
        print(f"  {tag}: {count}")

    data["articles"] = articles
    data["tagStats"] = popular_tags
    with open(ARTICLES_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print(f"[concept-tags] Updated {ARTICLES_JSON}")

    concept_map = build_concept_map_data(concept_tags, articles, article_tags)
    with open(CONCEPT_TAGS_JSON, "w", encoding="utf-8") as f:
        json.dump(concept_map, f, ensure_ascii=False, indent=1)
    print(f"[concept-tags] Written concept map to {CONCEPT_TAGS_JSON}")
    print(f"[concept-tags] Concepts with matched articles: {concept_map['totalConcepts']}")


if __name__ == "__main__":
    main()
