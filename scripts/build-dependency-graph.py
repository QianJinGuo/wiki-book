#!/usr/bin/env python3
"""
Build article dependency graph for wiki-book dashboard.

Generates dependencies.json with:
- chapterDeps: which chapters depend on which (macro structure)
- prereqs: per-article prerequisite entities (max 3)
- unlocks: reverse mapping (what each article unlocks)

Dependency signals:
1. Chapter ordering: defined by the AI-expert learning path
2. Phase ordering: Phase N depends on Phase N-1 in same chapter
3. Within-phase score ordering: higher score = more foundational
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

# Chapter dependency order based on AI-expert learning path
CHAPTER_DEPS = {
    "ch01": [],
    "ch02": ["ch01"],
    "ch03": ["ch01"],
    "ch04": ["ch01", "ch02"],
    "ch05": ["ch04"],
    "ch06": ["ch04"],
    "ch07": ["ch04", "ch06"],
    "ch08": ["ch04", "ch06"],
    "ch09": ["ch04"],
    "ch10": ["ch06"],
    "ch12": ["ch04"],
    "ch11": ["ch01"],
    "ch13": ["ch11"],
    "ch14": ["ch11"],
    "ch15": ["ch01", "ch11"],
    "ch16": ["ch15"],
    "ch17": ["ch01"],
    "ch18": ["ch04", "ch17"],
    "ch19": ["ch01"],
    "ch20": ["ch01"],
}

CHAPTER_ORDER = [
    "ch01", "ch02", "ch03",
    "ch04", "ch05", "ch06", "ch07", "ch08",
    "ch09", "ch10", "ch12",
    "ch11", "ch13", "ch14",
    "ch15", "ch16", "ch17", "ch18",
    "ch19", "ch20",
]

CHAPTER_NAMES = {
    "ch01": "AI与LLM基础", "ch02": "提示词工程", "ch03": "AI工具与产品",
    "ch04": "Agent核心架构", "ch05": "Harness工程", "ch06": "记忆与上下文",
    "ch07": "技能/工具/MCP", "ch08": "多Agent协作", "ch09": "AI编程",
    "ch10": "RAG与知识检索", "ch11": "云基础设施", "ch12": "安全与治理",
    "ch13": "MLOps与评估", "ch14": "数据工程", "ch15": "训练与微调",
    "ch16": "推理优化", "ch17": "多模态", "ch18": "机器人与具身",
    "ch19": "前沿研究", "ch20": "AI哲学与未来",
}


def build_prereqs(articles):
    """Build per-article prerequisite relationships."""
    by_entity = {a["entity"]: a for a in articles}

    # Group by (chapter, phase), sort by score descending
    chapter_phase_articles = defaultdict(list)
    for a in articles:
        chapter_phase_articles[(a["chapter"], a["phase"])].append(a)
    for key in chapter_phase_articles:
        chapter_phase_articles[key].sort(key=lambda x: -x.get("score", 0))

    # Gateway article per (chapter, phase) = highest scored
    gateway = {}
    for (ch, phase), arts in chapter_phase_articles.items():
        if arts:
            gateway[(ch, phase)] = arts[0]["entity"]

    prereqs = {}
    for a in articles:
        entity = a["entity"]
        ch = a["chapter"]
        phase = a["phase"]
        p = []

        # 1. Same chapter, earlier phase: gateway of that phase
        if phase > 1:
            prev_gateway = gateway.get((ch, phase - 1))
            if prev_gateway and prev_gateway != entity:
                p.append(prev_gateway)

        # 2. Same chapter+phase: immediately higher-scored article
        same_group = chapter_phase_articles.get((ch, phase), [])
        idx = next((i for i, x in enumerate(same_group) if x["entity"] == entity), -1)
        if idx > 0:
            p.append(same_group[idx - 1]["entity"])

        # 3. Cross-chapter: gateway of prerequisite chapters (Phase 1 only)
        dep_chapters = CHAPTER_DEPS.get(ch, [])
        for dep_ch in dep_chapters:
            dep_gateway = gateway.get((dep_ch, 1))
            if dep_gateway and dep_gateway != entity and dep_gateway not in p:
                p.append(dep_gateway)
                if len(p) >= 3:
                    break

        # Deduplicate, cap at 3
        seen = set()
        unique = []
        for x in p:
            if x not in seen:
                seen.add(x)
                unique.append(x)
        prereqs[entity] = unique[:3]

    return prereqs


def build_unlocks(prereqs):
    """Build reverse mapping: article -> list of articles it unlocks."""
    unlocks = defaultdict(list)
    for entity, dep_list in prereqs.items():
        for dep in dep_list:
            unlocks[dep].append(entity)
    return dict(unlocks)


def main():
    articles_path = Path("docs/dashboard/articles.json")
    if not articles_path.exists():
        print(f"Error: {articles_path} not found", file=sys.stderr)
        sys.exit(1)

    with open(articles_path) as f:
        data = json.load(f)

    articles = data["articles"]
    print(f"Processing {len(articles)} articles...")

    prereqs = build_prereqs(articles)
    unlocks = build_unlocks(prereqs)

    has_prereqs = sum(1 for v in prereqs.values() if v)
    print(f"Articles with prerequisites: {has_prereqs}/{len(articles)}")
    print(f"Articles that unlock others: {len(unlocks)}")

    chapter_groups = [
        {"id": "foundation", "name": "基础", "chapters": ["ch01", "ch02", "ch03"], "color": "#8b5cf6"},
        {"id": "agent", "name": "Agent核心", "chapters": ["ch04", "ch05", "ch06", "ch07", "ch08"], "color": "#3b82f6"},
        {"id": "application", "name": "应用", "chapters": ["ch09", "ch10", "ch12"], "color": "#f59e0b"},
        {"id": "infra", "name": "基础设施", "chapters": ["ch11", "ch13", "ch14"], "color": "#06b6d4"},
        {"id": "advanced", "name": "进阶", "chapters": ["ch15", "ch16", "ch17", "ch18"], "color": "#22c55e"},
        {"id": "meta", "name": "元视角", "chapters": ["ch19", "ch20"], "color": "#64748b"},
    ]

    output = {
        "generated": data.get("generated", ""),
        "chapterOrder": CHAPTER_ORDER,
        "chapterDeps": CHAPTER_DEPS,
        "chapterNames": CHAPTER_NAMES,
        "chapterGroups": chapter_groups,
        "prereqs": prereqs,
        "unlocks": unlocks,
    }

    out_path = Path("docs/dashboard/dependencies.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024
    print(f"Written to {out_path} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
