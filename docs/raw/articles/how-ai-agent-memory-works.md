---
title: "how ai agent memory works"
source_url: https://memory.cobanov.dev/
ingested: 2026-05-08
sha256: PLACEHOLDER
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
source_feed: TLDR AI (newsletter)
source_published: 2026-05-07
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: []
---
# How AI Agent Memory Works
Mert Cobanov 的交互式深度文章，系统讲解 AI Agent 记忆系统。从 stateless LLM 到 stateful agent 的转变，涵盖记忆架构的所有核心概念。
## 记忆类型
- **Working Memory**: 上下文窗口（FIFO dropping）
- **Long-term Memory**: 向量嵌入 + 语义搜索
- **Episodic Memory**: 特定事件/交互记录
- **Semantic Memory**: 事实知识
- **Procedural Memory**: 如何做事的知识
## 六种架构权衡
1. Buffer（简单滑动窗口）
2. Rolling Summary（压缩摘要）
3. Vector Store（语义检索）
4. Knowledge Graph（结构化关系）
5. Hierarchical / MemGPT（层级管理）
6. Self-editing / Letta（自主编辑）
## 生产部署考量
- Read/Write 路径分离
- 多租户隔离
- 延迟预算（HOT/WARM/COLD 存储层级）
- Memory API 设计