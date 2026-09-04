#!/usr/bin/env python3
"""Replace raw article bodies with small, body-free public source cards.

The source URL is the only eligibility gate.  A missing or unusable URL is
removed from the public tree; this command never copies an article body to a
card or to its mapping output.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse


FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.DOTALL)
FIELD_RE = re.compile(r"^([A-Za-z0-9_-]+):\s*(.*?)\s*$", re.MULTILINE)
TAGS_RE = re.compile(r"^tags:\s*\[([^\]]*)\]\s*$", re.MULTILINE)
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.MULTILINE)


def scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1].replace('\\"', '"')
    return value


def fields(text: str) -> dict[str, str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    return {key: scalar(value) for key, value in FIELD_RE.findall(match.group(1))}


def tags(text: str) -> list[str]:
    match = TAGS_RE.search(text)
    if not match:
        return []
    return [scalar(item) for item in match.group(1).split(",") if scalar(item)]


def reliable_url(value: str) -> bool:
    if not value or re.search(r"\s", value) or any(ord(char) > 127 for char in value):
        return False
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower().rstrip(".")
    if (
        not host
        or "." not in host
        or host in {"unknown", "example.com", "localhost", "127.0.0.1", "hf-mirror.com", "jinguo.tech"}
        or host.endswith(".jinguo.tech")
    ):
        return False
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def clean_url_candidate(value: str) -> str:
    """Keep only an explicit URL, dropping common prose delimiters."""
    value = value.strip().strip('"\'')
    value = re.split(r"\\n|\\r", value, maxsplit=1)[0]
    value = re.split(r"[（，。；！？、]", value, maxsplit=1)[0]
    return value.rstrip(".,;!?\"'）】》」』`>").strip()


def body_source_url(text: str) -> str:
    """Accept only URLs explicitly labeled as the source in imported text."""
    url_re = re.compile(r"https?://[^\s<>\]\)\"']+", re.IGNORECASE)
    labels = ("地址", "链接", "论文", "原文", "视频", "参考资料", "youtube")
    lines = text.splitlines()
    for index, line in enumerate(lines):
        match = url_re.search(line)
        prefix = line[: match.start()].strip(" *`*_：:()[]") if match else ""
        if match and any(label.lower() in prefix.lower() for label in labels):
            candidate = clean_url_candidate(match.group(0))
            if reliable_url(candidate):
                return candidate
        normalized = line.strip().rstrip("：:").lower()
        if normalized and any(label.lower() in normalized for label in labels):
            for following in lines[index + 1 : index + 4]:
                match = url_re.search(following)
                if not match:
                    if following.strip():
                        break
                    continue
                candidate = clean_url_candidate(match.group(0))
                if reliable_url(candidate):
                    return candidate
                break
    return ""


def quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip() + '"'


def title_for(text: str, metadata: dict[str, str], fallback: str) -> str:
    title = metadata.get("title", "").strip()
    if title:
        title = title.replace("\\n", "\n")
        title = next((line.strip() for line in title.splitlines() if line.strip()), "")
        if title:
            return title[:240].rstrip()
    match = H1_RE.search(text)
    if match:
        value = match.group(1).replace("\\n", "\n")
        return next((line.strip()[:240].rstrip() for line in value.splitlines() if line.strip()), fallback)
    return fallback[:240].rstrip()


def card_for(path: Path, text: str) -> tuple[str, str] | None:
    metadata = fields(text)
    raw_source_url = metadata.get("source_url", "").strip().replace('\\"', '"')
    source_url = clean_url_candidate(raw_source_url)
    # Some ingesters accidentally put escaped prose or a closing quote after
    # the URL on the same YAML line. Remove only those unambiguous delimiters;
    # a real space inside the URL remains invalid and is never guessed.
    escaped_tail = re.search(r"\\n|\\r", source_url)
    if escaped_tail:
        source_url = source_url[: escaped_tail.start()].rstrip()
    if ("`" in raw_source_url or ("）" in raw_source_url and "（" not in raw_source_url)) and reliable_url(
        clean_url_candidate(metadata.get("source", ""))
    ):
        source_url = clean_url_candidate(metadata["source"])
    if not reliable_url(source_url):
        source_url = clean_url_candidate(metadata.get("source", ""))
    if not reliable_url(source_url):
        source_url = body_source_url(text)
    if not reliable_url(source_url):
        return None

    title = title_for(text, metadata, path.stem)
    source = metadata.get("source", "").strip()
    author = metadata.get("author", "").strip()
    if not source or source.startswith("raw/articles"):
        source = urlparse(source_url).netloc
    if not author:
        author = "未标注作者；来源机构见 source"
    published = (
        metadata.get("published", "").strip()
        or metadata.get("date", "").strip()
        or metadata.get("created", "").strip()
        or "未标注"
    )
    collected = (
        metadata.get("ingested", "").strip()
        or metadata.get("collected", "").strip()
        or metadata.get("updated", "").strip()
        or "未标注"
    )
    license_value = metadata.get("license", "").strip()
    if not license_value or license_value.lower() in {"unknown", "unavailable", "未声明"}:
        license_value = "未发现可验证的再发布许可证；本仓库仅保留来源卡片"

    topic_tags = [tag[:40] for tag in tags(text)[:3]]
    topic = "、".join(topic_tags) if topic_tags else "相关 AI 工程主题"
    summary = (
        f"这份来源卡片记录一篇围绕“{title}”的第三方资料，主题标签为{topic}。"
        "完整事实、论据、上下文与原文请以原始来源为准；公开仓库不保存正文副本。"
    )
    card = "\n".join(
        [
            "---",
            "type: source-card",
            f"title: {quote(title)}",
            f"source: {quote(source)}",
            f"author: {quote(author)}",
            f"source_url: {quote(source_url)}",
            f"published: {quote(published)}",
            f"collected: {quote(collected)}",
            f"license: {quote(license_value)}",
            "---",
            "",
            f"# {title}",
            "",
            "## 原创摘要",
            "",
            summary,
            "",
            "> 公开版仅保留来源信息和原创摘要，不替代原始来源的阅读。",
            "",
        ]
    )
    return card, source_url


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--mapping", type=Path, required=True)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Scan only: emit the slug→source_url mapping without converting or deleting input files",
    )
    args = parser.parse_args()
    if not args.input.is_dir():
        raise SystemExit(f"raw directory not found: {args.input}")

    cards = 0
    deleted = 0
    mapping: dict[str, str] = {}
    basename_sources: dict[str, str | None] = {}
    for path in sorted(args.input.rglob("*.md")):
        relative = path.relative_to(args.input).as_posix()
        result = card_for(path, path.read_text(encoding="utf-8", errors="replace"))
        if result is None:
            if not args.dry_run:
                path.unlink()
            deleted += 1
            continue
        card, source_url = result
        if not args.dry_run:
            path.write_text(card, encoding="utf-8")
        mapping[relative] = source_url
        if path.name not in basename_sources:
            basename_sources[path.name] = source_url
        else:
            basename_sources[path.name] = None
        cards += 1

    mapping.update(
        {name: source for name, source in basename_sources.items() if source is not None}
    )

    args.mapping.parent.mkdir(parents=True, exist_ok=True)
    args.mapping.write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"source_cards": cards, "deleted_without_reliable_source": deleted}, ensure_ascii=False))


if __name__ == "__main__":
    main()
