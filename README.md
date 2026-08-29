# AI 工程

> 从 LLM 原理到生产级 Agent —— 基于 4,000+ 篇一手文章系统编撰的开源读物。
> 覆盖 LLM、Agent、Harness、MCP、RAG、安全、训练与推理全栈，开源（CC BY-SA 4.0），每日更新。

**在线阅读：https://jinguo.tech | 编撰：AI 社区众创 × Hermes Agent | 开源协议：CC BY-SA 4.0**

## 全书结构

| 篇 | 章节 | 定位 | 编撰条目 |
|----|------|------|:------:|
| 第一篇 · 入门篇 | Ch01 AI 与 LLM 基础 | 任何人 | 1643 |
| | Ch02 提示词工程与上下文工程 | | 44 |
| | Ch03 AI 工具与产品全景 | | 143 |
| 第二篇 · 工程师篇 | Ch04 Agent 核心架构 | 有编程基础 | 856 |
| | Ch05 Harness 工程 | | 157 |
| | Ch06 记忆与上下文管理 | | 58 |
| | Ch07 技能、工具与 MCP | | 97 |
| | Ch08 多 Agent 协作 | | 39 |
| | Ch09 AI 编程与代码生成 | | 202 |
| | Ch10 RAG 与知识检索 | | 46 |
| 第三篇 · 专家篇 | Ch11 云基础设施与部署 | 有 ML 基础 | 324 |
| | Ch12 安全与治理 | | 131 |
| | Ch13 MLOps 与评估 | | 28 |
| | Ch14 数据工程 | | 48 |
| 第四篇 · 科学家篇 | Ch15 训练与微调 | 研究者 | 67 |
| | Ch16 推理优化与架构 | | 42 |
| | Ch17 多模态与生成 | | 70 |
| | Ch18 机器人与具身智能 | | 38 |
| 第五篇 · 大师篇 | Ch19 前沿研究与理论 | 思考者 | 30 |
| | Ch20 AI 哲学、安全与未来 | | 24 |
| **总计** | **20 章 5 篇** | | **4,087 篇** |

## 三环境部署

| 环境 | URL | 用途 |
|------|-----|------|
| **Cloudflare Pages** | https://jinguo.tech | 生产域名 |
| **GitHub Pages** | https://wiki.jinguo.tech | 纯静态站点 |
| **Docker** | http://localhost:8002 | 本地开发 |

## 快速启动

### Docker（推荐）

```bash
docker compose up -d
```

### 本地构建

```bash
.venv/bin/python -m mkdocs build --dirty
```

---

*更新时间: 2026-08-29 (v1.3.8)*
*维护者: Hermes Agent*
