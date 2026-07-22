---
title: "开源 AI 编程可查询的软件工程知识图谱：Graphify 完整上手攻略"
author: "技术极简主义"
source: "兔兔AGI"
source_url: "https://mp.weixin.qq.com/s/yG2JXr3AWFIdRzNDG7a70w"
created: 2026-05-24
type: raw
tags: [article]
sha256: 496b63a65b6efc4eee39c5a8d90692e792a4de9edd2aee8c417ad7e6d64dc5f1
---

# 开源 AI 编程可查询的软件工程知识图谱：Graphify 完整上手攻略

## 为什么 AI 编程需要知识图谱

传统软件开发里，我们会用 README、架构文档、接口文档、代码注释来帮助团队理解项目。到了 AI 编程时代，这些东西依然存在，只是使用方式变了。我们会把仓库、文档、截图，甚至视频一起交给 AI 助手，但它还是得反复扫描文件、拼接上下文。

**问题核心**：AI 每次理解项目，某种程度上都像「临时上岗」。它能看懂当前上下文，也能回答眼前的问题，但这些理解很难真正沉淀下来。下次换个问题，它又重新读一遍、重新找一遍。

Graphify 做的，就是把这些分散的信息整理成一张可查询的软件工程知识图谱。

## Graphify 是什么？

Graphify 把当前项目目录里的代码、文档、PDF、图片、视频等内容，映射成一张可以查询的软件工程知识图谱。

**输出文件**：
```
graphify-out/
├── graph.html       # 浏览器可视化图谱
├── GRAPH_REPORT.md  # 项目总结与关系分析
└── graph.json       # 完整结构化图谱
```

**处理方式**：
- 代码 → 本地 AST 解析（tree-sitter），不需要调用模型 API，速度更快
- 文档 / 图片 / 视频 → AI 模型语义抽取
- 最终 → 合并成一张知识图谱

**关系置信度标签**：
| 标签 | 含义 |
|------|------|
| EXTRACTED | 直接从文件中提取 |
| INFERRED | 基于上下文推断 |
| AMBIGUOUS | 存在歧义，需要人工确认 |

## 安装与配置

**环境要求**：
- Python 3.10+
- uv（官方推荐）
- pipx

**注意**：PyPI 包名是 `graphifyy`，有两个 `y`。但安装完成后的命令仍然是 `graphify`。

**推荐安装方式**：
```bash
uv tool install graphifyy
```

**注册到 AI 编程助手**：
```bash
graphify install
```

**支持的平台**：Claude Code、Codex、OpenCode、Cursor、Gemini CLI、GitHub Copilot CLI、VS Code Copilot Chat、Aider、Kimi Code、Kiro、Trae 等。

## 常用命令

**生成图谱**：
```bash
/graphify .
```

**查询命令**：
```bash
# 查询概念关系
/graphify query "what connects auth to the database?"

# 追踪两个模块之间的路径
/graphify path "UserService" "DatabasePool"

# 解释某个节点
/graphify explain "RateLimiter"
```

**增量更新**：
```bash
# 只更新变化文件
/graphify ./docs --update

# 只重新聚类，不重新抽取
/graphify . --cluster-only

# 不生成 HTML
/graphify . --no-viz
```

**生成 Markdown wiki**：
```bash
/graphify . --wiki
```

## 外部资料接入

把外部资料纳入项目图谱：
```bash
# 加入论文
/graphify add https://arxiv.org/abs/1706.03762

# 加入 YouTube 视频（转录后加入）
/graphify add <youtube-url>
```

## MCP 接入

把图谱作为 MCP server 暴露给 AI 助手：
```bash
python -m graphify.serve graphify-out/graph.json
```

提供的结构化访问能力：query_graph、get_node、get_neighbors、shortest_path。

## 可选 extras

| Extra | 能力 | 安装方式 |
|-------|------|----------|
| pdf | PDF 提取 | `pip install "graphifyy[pdf]"` |
| office | .docx、.xlsx 支持 | `pip install "graphifyy[office]"` |
| video | 视频和音频转录 | `pip install "graphifyy[video]"` |
| mcp | MCP stdio server | `pip install "graphifyy[mcp]"` |
| neo4j | 推送到 Neo4j | `pip install "graphifyy[neo4j]"` |
| ollama | 本地 Ollama 推理 | `pip install "graphifyy[ollama]"` |
| openai | OpenAI 或兼容 API | `pip install "graphifyy[openai]"` |

## 团队协作

**推荐流程**：
1. 一个人在项目里运行 `/graphify .`
2. 提交 `graphify-out/`
3. 其他人拉取代码后，AI 助手可以直接读取图谱
4. 后续通过 `--update` 或 hook 机制增量更新

**git hook 自动重建**：
```bash
graphify hook install
```

**提交前排除不稳定文件**（.gitignore）：
```
graphify-out/manifest.json
graphify-out/cost.json
```

## 注意事项

1. **图谱质量取决于输入质量**：代码命名混乱、文档过时、注释错误，都会被带进图谱里
2. **INFERRED 和 AMBIGUOUS 不能直接当结论用**：更像提示，需要人工复核
3. **隐私和成本评估**：代码文件通过 tree-sitter 本地处理；文档、PDF、图片通常发送给你的 AI 助手或配置的模型后端
4. **数据边界**：如果是企业项目、客户资料、未公开论文或敏感设计文档，需要先确认数据边界

GitHub: https://github.com/safishamsi/graphify
