---
title: 原始文章存档
source_url: https://mp.weixin.qq.com/s/dDczjoNM3URc8ExcJL1hPg
publish_date: 2026-04-30
tags: [wechat, article, claude, agent, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: a4ffff12f6276125a4ba8e453b13e9e565d17dbd0792a202dfb852537b04d04c
---
# 原始文章存档
> 标题：深度 | Claude Code 为什么不建索引？代码搜索架构解析
> 作者：何理扬
> 来源：腾讯云开发者（微信公众号）
> 原始链接：https://mp.weixin.qq.com/s/dDczjoNM3URc8ExcJL1hPg
## 核心要点
基于2026年3月泄露的 Claude Code CLI 源码快照，深度拆解其代码搜索架构。LLM 驱动多轮 Grep 循环（GrepTool/GlobTool/FileReadTool/AgentTool + 子 agent 隔离）；ripgrep 五层过滤；实测 ripgrep vs GNU grep 在 4500 文件上 25-33倍加速；Prompt Cache 降低 81% 成本；Claude Code vs Cursor vs Codex 架构对比；代码搜索场景 Grep 优于 embedding 的深层原因（95% 搜索关键词是标识符）；RAG 并未死去，只是"预索引"这种实现方式在代码搜索场景被替代。
## 参考来源
- Boris Cherny (Claude Code 创建者), X/Twitter
- Latent Space 播客: Claude Code: Anthropic's Agent in Your Terminal
- Pragmatic Engineer 采访: Building Claude Code
- Anthropic 官方博客: Effective Context Engineering for AI Agents
- GrepRAG (ISSTA '26): arxiv.org/abs/2601.23254
- Claude Code 源码（2026年3月泄露快照）