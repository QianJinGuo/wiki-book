#!/usr/bin/env python3
"""Build a compact, coherent learning path from the wiki corpus.

The dashboard article catalog is intentionally not the source of truth here:
it can lag behind a freshly compiled docs/ tree.  This script scans the files
that will actually be published, then uses the catalog as an optional ranking
signal.  The output is a small, stable course layer for the dashboard.

Usage:
    python3 scripts/build-course.py
    python3 scripts/build-course.py --check
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUTPUT = DOCS / "learn" / "course.json"


CHAPTERS = {
    "ch01": {"title": "AI 与 LLM 基础", "overview": "ch01-ai-basics.md"},
    "ch02": {"title": "提示词与上下文工程", "overview": "ch02-prompt.md"},
    "ch03": {"title": "AI 工具与产品", "overview": "ch03-ai-tools.md"},
    "ch04": {"title": "Agent 核心架构", "overview": "ch04-agent-core.md"},
    "ch05": {"title": "Harness 工程", "overview": "ch05-harness.md"},
    "ch06": {"title": "记忆与上下文", "overview": "ch06-memory.md"},
    "ch07": {"title": "技能、工具与 MCP", "overview": "ch07-skill-tool.md"},
    "ch08": {"title": "多 Agent 协作", "overview": "ch08-multi-agent.md"},
    "ch09": {"title": "AI 编程", "overview": "ch09-ai-coding.md"},
    "ch10": {"title": "RAG 与知识检索", "overview": "ch10-rag.md"},
    "ch11": {"title": "云基础设施", "overview": "ch11-infra.md"},
    "ch12": {"title": "安全与治理", "overview": "ch12-security.md"},
    "ch13": {"title": "MLOps 与评估", "overview": "ch13-mlops.md"},
    "ch14": {"title": "数据工程", "overview": "ch14-data.md"},
    "ch15": {"title": "训练与微调", "overview": "ch15-training.md"},
    "ch16": {"title": "推理优化", "overview": "ch16-inference.md"},
    "ch17": {"title": "多模态", "overview": "ch17-multimodal.md"},
    "ch18": {"title": "机器人与具身", "overview": "ch18-robotics.md"},
    "ch19": {"title": "前沿研究", "overview": "ch19-research-frontier.md"},
    "ch20": {"title": "AI 哲学与未来", "overview": "ch20-ai-philosophy.md"},
}


MODULES = [
    {
        "id": "m01",
        "part": "基础认知",
        "title": "建立 LLM 心智模型",
        "goal": "能解释 Token、Embedding、Attention、Transformer 与推理为何决定 Agent 的能力边界。",
        "chapters": ["ch01"],
        "keywords": ["token", "embedding", "attention", "transformer", "llm", "大语言模型", "推理"],
        "lab": "画出一次用户请求从文本到下一个 Token 的数据流，并标注三个可能出错的地方。",
        "acceptance": ["能用自己的话解释上下文窗口", "能区分训练、推理与工具调用", "能指出幻觉可能来自哪一层"],
    },
    {
        "id": "m02",
        "part": "基础认知",
        "title": "提示词与上下文工程",
        "goal": "把‘会聊天’升级为能稳定产出结构化结果的上下文设计能力。",
        "chapters": ["ch01", "ch02"],
        "keywords": ["prompt", "context", "structured output", "reasoning", "提示词", "上下文", "输出格式"],
        "lab": "为 Wiki Research Agent 写一份任务提示词：目标、约束、工具使用规则、引用格式和失败处理。",
        "acceptance": ["提示词包含明确的输入输出契约", "至少设计一个反例", "连续运行三次结果结构不漂移"],
    },
    {
        "id": "m03",
        "part": "Agent 原理",
        "title": "从 LLM 到最小 Agent Loop",
        "goal": "理解 Agent 不是一个更大的 Prompt，而是模型、环境、工具和反馈组成的闭环。",
        "chapters": ["ch04"],
        "keywords": ["agent", "react", "loop", "planning", "reflection", "tool use", "行动", "规划"],
        "lab": "实现一个最小循环：读取任务 → 决定动作 → 调用工具 → 观察结果 → 判断是否结束。",
        "acceptance": ["循环有明确终止条件", "工具失败不会让程序静默卡死", "日志能还原每一步决策"],
    },
    {
        "id": "m04",
        "part": "Agent 原理",
        "title": "Harness：让 Agent 能完成长任务",
        "goal": "掌握状态、重试、检查点、上下文压缩和人工接管这些让 Agent 可靠工作的工程骨架。",
        "chapters": ["ch04", "ch05"],
        "keywords": ["harness", "workflow", "runtime", "long-horizon", "orchestration", "状态机", "长任务"],
        "lab": "给最小 Agent 加入 checkpoint、重试、预算和人工确认，并模拟一次中途失败恢复。",
        "acceptance": ["任务可暂停并恢复", "重试有上限和退避", "危险动作前需要显式确认"],
    },
    {
        "id": "m05",
        "part": "Agent 原理",
        "title": "Tool、Skill 与 MCP",
        "goal": "把外部能力设计成可发现、可组合、可审计的 Agent 接口。",
        "chapters": ["ch07", "ch04"],
        "keywords": ["tool", "function calling", "mcp", "skill", "protocol", "插件", "工具调用"],
        "lab": "为 Wiki Research Agent 暴露 search、open、cite 三个工具，并为每个工具定义输入、输出和权限。",
        "acceptance": ["工具 schema 可校验", "工具错误可被模型理解", "工具权限遵循最小授权"],
    },
    {
        "id": "m06",
        "part": "Agent 原理",
        "title": "State、Memory 与上下文生命周期",
        "goal": "区分工作记忆、会话状态、长期记忆和知识库，避免把所有信息都塞进 Prompt。",
        "chapters": ["ch06", "ch04"],
        "keywords": ["memory", "context", "session", "state", "checkpoint", "记忆", "上下文管理"],
        "lab": "设计三层记忆：当前任务上下文、用户偏好、可检索知识，并写出写入/读取/遗忘规则。",
        "acceptance": ["每种记忆有明确生命周期", "能删除或修正错误记忆", "上下文增长有预算"],
    },
    {
        "id": "m07",
        "part": "知识增强",
        "title": "RAG：让 Agent 可靠地使用知识",
        "goal": "理解切分、召回、重排、引用和评估，构建可追溯的知识检索链路。",
        "chapters": ["ch10", "ch06"],
        "keywords": ["rag", "retrieval", "embedding", "rerank", "vector", "知识库", "检索", "向量"],
        "lab": "为 wiki 建一个最小 RAG：关键词召回 + 近邻扩展 + 引用拼接，并对五个问题做人工评测。",
        "acceptance": ["答案带来源链接", "召回结果可解释", "记录 top-k 命中与错误案例"],
    },
    {
        "id": "m08",
        "part": "工程实现",
        "title": "自己设计一个 Agent Framework",
        "goal": "从抽象边界出发理解 Agent Framework，而不是停留在调用某个 SDK。",
        "chapters": ["ch04", "ch05", "ch07"],
        "keywords": ["framework", "architecture", "runtime", "abstraction", "agent framework", "框架", "架构"],
        "lab": "把前七章能力封装成一个小框架：Model、Tool、Memory、Policy、Runtime、Event 六个接口。",
        "acceptance": ["核心组件可替换", "事件流能被测试捕获", "一个示例任务可端到端运行"],
    },
    {
        "id": "m09",
        "part": "工程实现",
        "title": "Workflow 与 Multi-Agent 协作",
        "goal": "判断什么时候用单 Agent、工作流或多 Agent，并设计清晰的协作边界。",
        "chapters": ["ch08", "ch05", "ch04"],
        "keywords": ["multi-agent", "collaboration", "handoff", "swarm", "team", "delegation", "多 agent", "协作"],
        "lab": "把研究任务拆成检索、批判、综合三个角色，定义 handoff 数据结构和失败回退。",
        "acceptance": ["角色职责不重叠", "handoff 内容结构化", "总成本和最长路径可估算"],
    },
    {
        "id": "m10",
        "part": "工程实现",
        "title": "Evaluation、Tracing 与反馈闭环",
        "goal": "用可观测性和评测集回答‘Agent 为什么失败’，而不是凭感觉改 Prompt。",
        "chapters": ["ch13", "ch04", "ch05"],
        "keywords": ["evaluation", "eval", "tracing", "observability", "test", "评估", "可观测", "测试"],
        "lab": "为 Wiki Research Agent 建 20 个问题的评测集，记录检索、引用、事实性、成本和延迟。",
        "acceptance": ["有固定回归集", "失败样本能定位到具体步骤", "改动前后指标可比较"],
    },
    {
        "id": "m11",
        "part": "工程实现",
        "title": "AI Coding 与 Agentic Engineering",
        "goal": "理解 Coding Agent 的上下文、工具、检查点和验证闭环，并把它用于真实工程。",
        "chapters": ["ch09", "ch03", "ch05"],
        "keywords": ["coding agent", "claude code", "codex", "code", "software", "vibe", "编程", "软件工程"],
        "lab": "让 Agent 为项目新增一个小功能：先读规范，再改代码、跑测试、生成变更说明。",
        "acceptance": ["先建立代码库地图", "每次修改都有验证证据", "能安全处理测试失败"],
    },
    {
        "id": "m12",
        "part": "工程实现",
        "title": "Data Agent：连接真实业务数据",
        "goal": "掌握让 Agent 查询、解释和操作结构化数据时的语义层与安全边界。",
        "chapters": ["ch14", "ch10", "ch11"],
        "keywords": ["data agent", "sql", "database", "analytics", "data", "数据", "数据库", "分析"],
        "lab": "为一份业务数据定义只读 SQL 工具、指标字典和结果解释模板。",
        "acceptance": ["禁止任意写操作", "指标定义可追溯", "结果包含时间范围和数据来源"],
    },
    {
        "id": "m13",
        "part": "生产落地",
        "title": "部署、安全与可运维性",
        "goal": "把 Demo 变成可上线系统：权限、沙箱、限流、成本、日志和降级都可控。",
        "chapters": ["ch11", "ch12", "ch13"],
        "keywords": ["deploy", "security", "sandbox", "infrastructure", "production", "权限", "安全", "生产", "限流"],
        "lab": "为 Agent 写一份生产检查清单，并在本地加入权限校验、超时、限流和降级。",
        "acceptance": ["高风险工具默认拒绝", "敏感信息不进入普通日志", "服务不可用时有明确降级"],
    },
    {
        "id": "m14",
        "part": "进阶视野",
        "title": "训练、强化学习与推理优化",
        "goal": "建立模型训练、Agent 反馈和推理系统之间的联系，知道什么时候该优化模型、什么时候该优化 Harness。",
        "chapters": ["ch15", "ch16", "ch19", "ch01"],
        "keywords": ["training", "fine-tuning", "reinforcement", "rl", "inference", "强化学习", "训练", "微调", "推理"],
        "lab": "选一个 Agent 失败样本，分别提出 Prompt、检索、Harness、微调和推理层的改进方案。",
        "acceptance": ["能说明优化所在层级", "能估算数据与成本", "不把所有问题归因于模型"],
    },
    {
        "id": "m15",
        "part": "综合案例",
        "title": "Deep Research Agent",
        "goal": "把搜索、浏览、阅读、交叉验证、引用和长任务管理串成一个研究系统。",
        "chapters": ["ch04", "ch10", "ch09"],
        "keywords": ["deep research", "research agent", "browser", "search", "web", "研究", "浏览器", "搜索"],
        "lab": "实现一个能提出子问题、并行检索、比较来源、输出带引用报告的研究 Agent。",
        "acceptance": ["报告区分事实与推断", "每个关键结论有引用", "研究过程可恢复和复盘"],
    },
    {
        "id": "m16",
        "part": "毕业项目",
        "title": "Wiki Research Agent：完整毕业项目",
        "goal": "用本 wiki 作为真实环境，交付一个可检索、可解释、可评估、可部署的知识研究 Agent。",
        "chapters": ["ch04", "ch05", "ch06", "ch07", "ch08", "ch09", "ch10", "ch11", "ch12", "ch13"],
        "keywords": ["agent", "wiki", "knowledge", "research", "rag", "knowledge base", "知识库", "研究", "检索"],
        "lab": "交付 Wiki Research Agent：用户提问 → 检索 → 规划 → 阅读 → 综合 → 引用 → 评测。",
        "acceptance": ["有 README 和架构图", "有可重复运行的评测集", "有失败案例与迭代记录", "可在本地或线上部署"],
    },
]


STOP_WORDS = {
    "the", "and", "for", "with", "from", "this", "that", "agent", "ai",
    "的", "与", "和", "从", "一个", "如何", "基于", "以及", "技术", "系统",
}
NOISY_TITLE = re.compile(r"融资|招聘|裁员|股价|估值|发布会|价格|announces|funding|hiring|stock|funding", re.I)
SECTION_NAMES = re.compile(
    r"^(核心观点|核心要点|关键洞察|深度分析|实践启示|技术要点|总结|摘要|导读|overview|summary|key facts|core features|key insights|takeaways?)$",
    re.I,
)


def clean_text(value: str) -> str:
    value = re.sub(r"```.*?```", " ", value, flags=re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"[`*_>#]", "", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def title_from_markdown(text: str, fallback: str) -> str:
    for line in text.splitlines()[:30]:
        match = re.match(r"^#\s+(.+?)\s*$", line)
        if match:
            title = clean_text(match.group(1))
            title = re.sub(r"^Ch\d+[.\s]+\d*\s*", "", title, flags=re.I)
            return title[:140]
    return fallback.replace("-", " ")[:140]


def extract_essence(text: str, fallback: str) -> str:
    lines = text.splitlines()
    sections: list[list[str]] = []
    active: list[str] | None = None
    for line in lines:
        heading = re.match(r"^#{2,4}\s+(.+?)\s*$", line)
        if heading:
            name = clean_text(heading.group(1)).rstrip(":：")
            active = [] if SECTION_NAMES.match(name) else None
            if active is not None:
                sections.append(active)
            continue
        if active is not None:
            candidate = clean_text(line)
            if candidate and not candidate.startswith("原文存档") and not candidate.startswith("相关实体"):
                active.append(candidate)

    candidates: list[str] = []
    for section in sections:
        for line in section:
            if line.startswith(("-", "·")):
                line = line[1:].strip()
            line = re.sub(r"^\d+[.、）)]\s*", "", line)
            if len(line) >= 20:
                candidates.append(line)
    if not candidates:
        for line in lines:
            candidate = clean_text(line)
            if len(candidate) >= 30 and not candidate.startswith(("Ch", "原文存档", "相关实体")):
                candidates.append(candidate)
    if not candidates:
        return fallback
    result = "；".join(candidates[:2])
    return result[:360].rstrip("；。 ") + ("。" if not result[:360].endswith(("。", "！", "？")) else "")


def tokenize(value: str) -> set[str]:
    parts = set(re.findall(r"[a-z][a-z0-9-]{2,}|[\u4e00-\u9fff]{2,}", value.lower()))
    return {part for part in parts if part not in STOP_WORDS}


def normalized_title(value: str) -> str:
    """Collapse common syndication suffixes before de-duplicating selections."""
    value = re.sub(r"[（(].*?[）)]", "", value)
    value = re.sub(r"(?:机器之心|官方博客|中文全文|深度解读|完整指南).*$", "", value, flags=re.I)
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", value.lower())


def load_catalog() -> dict[str, dict]:
    path = DOCS / "dashboard" / "articles.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    result = {}
    for article in data.get("articles", []):
        file_name = article.get("file")
        if file_name:
            result[file_name] = article
    return result


def scan_articles() -> list[dict]:
    catalog = load_catalog()
    articles = []
    for chapter_dir in sorted(DOCS.glob("ch[0-9][0-9]")):
        chapter = chapter_dir.name
        for path in sorted(chapter_dir.glob("*.md")):
            if path.name in {"index.md", "404.md"}:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            if len(text) < 500:
                continue
            rel = path.relative_to(DOCS).as_posix()
            catalog_item = catalog.get(rel, {})
            title = title_from_markdown(text, path.stem)
            tags = catalog_item.get("tags", [])
            searchable = " ".join([title, path.stem, " ".join(tags), text[:16000]])
            articles.append(
                {
                    "file": rel,
                    "title": title,
                    "chapter": chapter,
                    "chapterName": CHAPTERS.get(chapter, {}).get("title", chapter),
                    "words": len(text),
                    "score": float(catalog_item.get("score", 0) or 0),
                    "level": int(catalog_item.get("level", 1) or 1),
                    "tags": tags,
                    "searchable": searchable.lower(),
                    "text": text,
                }
            )
    return articles


def rank_for_module(article: dict, module: dict) -> float:
    title = article["title"].lower()
    searchable = article["searchable"]
    terms = [term.lower() for term in module["keywords"]]
    title_hits = sum(1 for term in terms if term in title)
    body_hits = sum(1 for term in terms if term in searchable)
    chapter_bonus = (len(module["chapters"]) - module["chapters"].index(article["chapter"])) * 8 if article["chapter"] in module["chapters"] else 0
    structure_bonus = 4 if re.search(r"^##\s+(深度分析|实践启示|核心观点|核心要点|Summary|Overview)", article["text"], re.I | re.M) else 0
    practical_bonus = min(4, len(re.findall(r"```", article["text"])) // 2) + min(2, len(re.findall(r"^\|", article["text"], re.M)) // 5)
    length_bonus = min(5, article["words"] / 12000)
    catalog_bonus = min(6, article["score"] / 10) if article["score"] else 0
    noise_penalty = 5 if NOISY_TITLE.search(article["title"]) else 0
    return title_hits * 20 + body_hits * 2 + chapter_bonus + structure_bonus + practical_bonus + length_bonus + catalog_bonus - noise_penalty


def choose_articles(articles: list[dict], module: dict, limit: int = 3) -> list[dict]:
    candidates = [article for article in articles if article["chapter"] in module["chapters"]]
    if not candidates:
        candidates = articles
    ranked = sorted(candidates, key=lambda item: (-rank_for_module(item, module), item["file"]))
    selected = []
    seen_stems = set()
    seen_titles = set()
    for article in ranked:
        stem = re.sub(r"[-_](v\d+|\d{4}|c[0-9a-f]+)$", "", Path(article["file"]).stem, flags=re.I)
        title_key = normalized_title(article["title"])
        if stem in seen_stems or title_key in seen_titles:
            continue
        seen_stems.add(stem)
        seen_titles.add(title_key)
        selected.append(article)
        if len(selected) == limit:
            break
    return selected


def lesson_payload(article: dict, role: str, module: dict) -> dict:
    return {
        "role": role,
        "title": article["title"],
        "file": article["file"],
        "url": "/" + article["file"].replace(".md", ".html"),
        "chapter": article["chapter"],
        "chapterName": article["chapterName"],
        "essence": extract_essence(article["text"], module["goal"]),
        "words": article["words"],
        "level": article["level"],
    }


def build_course() -> dict:
    articles = scan_articles()
    course_modules = []
    for index, module in enumerate(MODULES, start=1):
        selected = choose_articles(articles, module)
        roles = ["核心原理", "工程案例", "延伸阅读"]
        lessons = [lesson_payload(article, roles[pos], module) for pos, article in enumerate(selected)]
        course_modules.append(
            {
                "id": module["id"],
                "order": index,
                "part": module["part"],
                "title": module["title"],
                "goal": module["goal"],
                "prerequisites": [f"m{index - 1:02d}"] if index > 1 else [],
                "chapters": module["chapters"],
                "chapterOverviews": [
                    {
                        "chapter": chapter,
                        "title": CHAPTERS[chapter]["title"],
                        "url": "/" + CHAPTERS[chapter]["overview"].replace(".md", ".html"),
                    }
                    for chapter in module["chapters"]
                    if (DOCS / CHAPTERS[chapter]["overview"]).exists()
                ],
                "lessons": lessons,
                "lab": {"title": "动手任务", "brief": module["lab"], "acceptance": module["acceptance"]},
            }
        )
    return {
        "version": "1.0",
        "title": "AI 工程主课程：从 LLM 到生产级 Agent",
        "subtitle": "从 4,000+ 篇资料中提炼 16 个连续模块，用一个 Wiki Research Agent 贯穿实践。",
        "method": {
            "core": "每个模块只保留 3 篇入口文章：核心原理、工程案例、延伸阅读。",
            "source": "课程文章来自当前 docs/ 中实际可发布的文件；文章索引只作为排序辅助。",
            "project": "每学完一个模块，都为 Wiki Research Agent 增加一项能力。",
        },
        "project": {
            "title": "Wiki Research Agent",
            "brief": "让 Agent 能检索、阅读、交叉验证并引用本 wiki 的知识，最终形成可评估的研究报告。",
            "milestones": ["能回答", "能检索", "能引用", "能恢复", "能评测", "能部署"],
        },
        "modules": course_modules,
        "stats": {"scannedArticles": len(articles), "moduleCount": len(course_modules), "lessonsPerModule": 3},
    }


def validate(course: dict) -> list[str]:
    errors = []
    modules = course.get("modules", [])
    ids = {module.get("id") for module in modules}
    if len(modules) != 16:
        errors.append(f"expected 16 modules, got {len(modules)}")
    if len(ids) != len(modules):
        errors.append("module ids are not unique")
    for module in modules:
        for prerequisite in module.get("prerequisites", []):
            if prerequisite not in ids:
                errors.append(f"{module['id']} references missing prerequisite {prerequisite}")
        lessons = module.get("lessons", [])
        if len(lessons) < 3:
            errors.append(f"{module['id']} has fewer than 3 lessons")
        for lesson in lessons:
            file_path = DOCS / lesson["file"]
            if not file_path.exists():
                errors.append(f"{module['id']} points to missing file {lesson['file']}")
        for overview in module.get("chapterOverviews", []):
            if not (DOCS / overview["url"].lstrip("/").replace(".html", ".md")).exists():
                errors.append(f"{module['id']} points to missing overview {overview['url']}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate generated course without writing it")
    args = parser.parse_args()
    course = build_course()
    errors = validate(course)
    if errors:
        print("[build-course] validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1
    if args.check:
        print(f"[build-course] OK: {len(course['modules'])} modules, {course['stats']['scannedArticles']} source articles")
        return 0
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(course, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"[build-course] wrote {OUTPUT}")
    print(f"[build-course] scanned {course['stats']['scannedArticles']} articles into {len(course['modules'])} modules")
    for module in course["modules"]:
        print(f"  {module['id']} {module['title']}: {len(module['lessons'])} lessons")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
