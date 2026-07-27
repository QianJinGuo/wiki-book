#!/usr/bin/env python3
"""
Article Ranking & Phasing System for Wiki-Book Dashboard

Scores all articles and assigns them to progressive learning phases.
Designed to be run as a Hermes cron job to reclassify new articles.

Output: docs/dashboard/articles.json (phased article catalog)
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUTPUT = DOCS / "dashboard" / "articles.json"

# ── Phase definitions ──────────────────────────────────────────
PHASES = [
    {"id": 1, "name": "Phase 1 · 核心必读", "count": 100, "color": "#ef4444", "desc": "最关键的 100 篇，覆盖 Agent 工程全栈核心概念"},
    {"id": 2, "name": "Phase 2 · 深入理解", "count": 100, "color": "#f59e0b", "desc": "第 101-200 篇，在核心基础上深入子域"},
    {"id": 3, "name": "Phase 3 · 扩展视野", "count": 100, "color": "#6366f1", "desc": "第 201-300 篇，扩展到相关领域和案例分析"},
    {"id": 4, "name": "Phase 4 · 广泛涉猎", "count": 200, "color": "#06b6d4", "desc": "第 301-500 篇，广泛覆盖行业动态和实践"},
    {"id": 5, "name": "Phase 5 · 专题深耕", "count": 500, "color": "#22c55e", "desc": "第 501-1000 篇，按专题方向深耕"},
    {"id": 6, "name": "Phase 6 · 全量参考", "count": None, "color": "#64748b", "desc": "第 1001+ 篇，完整知识库参考"},
]

# ── Chapter weights (importance for Agent Engineering) ─────────
CHAPTER_WEIGHTS = {
    "ch04": 1.5,  # Agent 核心架构 — 最高权重
    "ch05": 1.4,  # Harness 工程
    "ch09": 1.3,  # AI 编程
    "ch08": 1.2,  # 多 Agent
    "ch06": 1.2,  # 记忆与上下文
    "ch07": 1.1,  # 技能/工具/MCP
    "ch01": 1.0,  # AI 基础
    "ch10": 1.0,  # RAG
    "ch12": 0.9,  # 安全
    "ch13": 0.9,  # MLOps
    "ch03": 0.8,  # AI 工具/产品
    "ch11": 0.8,  # 云基础设施
    "ch14": 0.7,  # 数据工程
    "ch15": 0.7,  # 训练/微调
    "ch16": 0.7,  # 推理优化
    "ch17": 0.6,  # 多模态
    "ch18": 0.6,  # 机器人
    "ch19": 0.5,  # 前沿研究
    "ch02": 0.9,  # 提示词工程
    "ch20": 0.5,  # AI 哲学
}

# ── Chapter display names ──────────────────────────────────────
CHAPTER_NAMES = {
    "ch01": "🧠 AI 与 LLM 基础",
    "ch02": "📝 提示词与上下文工程",
    "ch03": "🔧 AI 工具与产品",
    "ch04": "🏗️ Agent 核心架构",
    "ch05": "🔒 Harness 工程",
    "ch06": "💾 记忆与上下文",
    "ch07": "🛠️ 技能/工具/MCP",
    "ch08": "🤝 多 Agent 协作",
    "ch09": "💻 AI 编程",
    "ch10": "🔍 RAG 与知识检索",
    "ch11": "☁️ 云基础设施",
    "ch12": "🛡️ 安全与治理",
    "ch13": "📊 MLOps 与评估",
    "ch14": "🗄️ 数据工程",
    "ch15": "🏋️ 训练与微调",
    "ch16": "⚡ 推理优化",
    "ch17": "🎨 多模态",
    "ch18": "🤖 机器人与具身",
    "ch19": "🔬 前沿研究",
    "ch20": "💡 AI 哲学与未来",
}


def extract_level(content: str) -> int:
    """Extract ⭐ level from article metadata. Returns 1, 2, or 3."""
    m = re.search(r'Level ⭐(⭐*)', content)
    if not m:
        return 1  # Default to basic if no marker
    stars = 1 + len(m.group(1))
    return min(stars, 3)


def extract_title(content: str) -> str:
    """Extract first H1 title from article."""
    for line in content.split('\n')[:10]:
        m = re.match(r'^# (.+)', line)
        if m:
            # Remove chapter prefix like "Ch05.003 "
            title = re.sub(r'^Ch\d+\.\d+\s+', '', m.group(1))
            return title[:120]
    return ""


def extract_entity_id(content: str) -> str:
    """Extract entity ID if present."""
    m = re.search(r'`entities/([^`]+)`', content)
    return m.group(1) if m else ""


def extract_source_name(content: str) -> str:
    """Extract source/attribution from article."""
    # Look for source patterns
    m = re.search(r'Source:\s*\[([^\]]+)\]', content)
    if m:
        return m.group(1)[:80]
    m = re.search(r'Original Source:\s*(.+)', content)
    if m:
        return m.group(1).strip()[:80]
    return ""


def extract_has_summary(content: str) -> bool:
    """Check if article has a structured summary section."""
    return bool(re.search(r'^## (核心|关键|要点|总结|TL;DR|Core|Key|Summary)', content, re.MULTILINE))


def count_code_blocks(content: str) -> int:
    """Count code blocks — indicates practical content."""
    return len(re.findall(r'```', content)) // 2


def count_tables(content: str) -> int:
    """Count markdown tables — indicates structured analysis."""
    return len(re.findall(r'^\|.*\|$\n^\|[-:|]+\|', content, re.MULTILINE))


def score_article(filepath: str, chapter: str) -> dict:
    """Score a single article and return its metadata."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return None

    # Skip very short articles (< 500 chars, likely stubs)
    if len(content) < 500:
        return None

    file_size = len(content)
    level = extract_level(content)
    title = extract_title(content)
    entity_id = extract_entity_id(content)
    has_summary = extract_has_summary(content)
    code_blocks = count_code_blocks(content)
    tables = count_tables(content)
    mtime = os.path.getmtime(filepath)

    # ── Compute composite score ────────────────────────────────
    # Base: level rating (1-3 → 10-30)
    score = level * 10.0

    # Chapter weight multiplier
    ch_weight = CHAPTER_WEIGHTS.get(chapter, 0.5)
    score *= ch_weight

    # Content depth: log-scaled file size bonus
    # 1KB → +1, 10KB → +2.3, 50KB → +3.7, 100KB → +4.6
    if file_size > 0:
        score += min(5.0, (file_size / 1024) ** 0.3)

    # Has entity link (means it's indexed in the knowledge graph)
    if entity_id:
        score += 3.0

    # Has summary section (curated quality signal)
    if has_summary:
        score += 2.0

    # Practical content: code blocks and tables
    score += min(3.0, code_blocks * 0.3)
    score += min(2.0, tables * 0.3)

    # Very large synthesis articles (>30KB) get a bonus
    if file_size > 30000:
        score += 3.0

    # Recency bonus: articles modified in last 30 days get small boost
    age_days = (datetime.now().timestamp() - mtime) / 86400
    if age_days < 30:
        score += 1.0
    elif age_days < 7:
        score += 2.0

    # Word count approximation (Chinese + English mixed)
    word_count = len(content)

    # Relative path from docs/
    rel_path = os.path.relpath(filepath, str(DOCS))

    return {
        "file": rel_path,
        "title": title,
        "words": word_count,
        "level": level,
        "chapter": chapter,
        "chapterName": CHAPTER_NAMES.get(chapter, chapter),
        "entity": entity_id,
        "hasSummary": has_summary,
        "score": round(score, 2),
        "phase": 0,  # assigned later
        "mtime": int(mtime),
    }


def collect_articles() -> list:
    """Walk docs/ and score every article."""
    articles = []
    # Skip raw/, assets/, dashboard/
    skip_dirs = {"raw", "assets", "dashboard"}

    for chapter_dir in sorted(DOCS.iterdir()):
        if not chapter_dir.is_dir():
            continue
        if chapter_dir.name in skip_dirs:
            continue
        if not chapter_dir.name.startswith("ch"):
            continue

        chapter = chapter_dir.name
        # Only go 1 level deep (ch04/xxx.md, not ch04/sub/xxx.md)
        for md_file in sorted(chapter_dir.glob("*.md")):
            if md_file.name in ("index.md", "404.md"):
                continue
            result = score_article(str(md_file), chapter)
            if result:
                articles.append(result)

    return articles


def assign_phases(articles: list) -> list:
    """Sort by score and assign phase numbers."""
    articles.sort(key=lambda a: a["score"], reverse=True)

    boundary = 0
    for phase in PHASES:
        if phase["count"] is None:
            # Last phase: everything remaining
            for a in articles[boundary:]:
                a["phase"] = phase["id"]
            break
        end = min(boundary + phase["count"], len(articles))
        for a in articles[boundary:end]:
            a["phase"] = phase["id"]
        boundary = end

    # Assign remaining if any phase was short
    for a in articles[boundary:]:
        a["phase"] = PHASES[-1]["id"]

    return articles


def main():
    print(f"[rank-articles] Scoring articles in {DOCS}...")
    articles = collect_articles()
    print(f"[rank-articles] Scored {len(articles)} articles (skipped stubs < 500 chars)")

    articles = assign_phases(articles)

    # Phase summary
    phase_counts = {}
    for a in articles:
        pid = a["phase"]
        phase_counts[pid] = phase_counts.get(pid, 0) + 1

    print("[rank-articles] Phase distribution:")
    for p in PHASES:
        cnt = phase_counts.get(p["id"], 0)
        print(f"  {p['name']}: {cnt} articles")

    # Build output
    output = {
        "generated": datetime.now().isoformat(),
        "totalArticles": len(articles),
        "phases": [
            {
                "id": p["id"],
                "name": p["name"],
                "count": phase_counts.get(p["id"], 0),
                "color": p["color"],
                "desc": p["desc"],
            }
            for p in PHASES
        ],
        "chapters": CHAPTER_NAMES,
        "articles": articles,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=1)

    print(f"[rank-articles] Written to {OUTPUT}")
    print(f"[rank-articles] Total: {len(articles)} articles across {len(PHASES)} phases")

    # Also output the top-100 for quick verification
    print("\n[top 10 articles]:")
    for a in articles[:10]:
        print(f"  Phase {a['phase']} | Score {a['score']:5.1f} | {a['chapter']} | {a['title'][:60]}")


if __name__ == "__main__":
    main()
