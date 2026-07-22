---
source_url: "https://mp.weixin.qq.com/s/UA3xgiXmB7De7qp6MzIzDw"
title: "Mem0、Letta、Zep 和 VoltMem —— Agent记忆系统该选哪个？"
source: "数字莫伊拉"
author: "数字莫伊拉"
ingested: 2026-07-22
sha256: 64302c56379fc673dd7d2926f22e0e6f0e063166978f02e802c01db407b8e5eb
type: raw-article
tags: [memory, agent-memory, mem0, letta, zep, voltmem, comparison]
---

# Mem0、Letta、Zep 和 VoltMem —— Agent记忆系统该选哪个？

## 4 派记忆架构

### 派别 1：向量库派（Mem0 为代表）
将文档 chunk → embedding → 向量数据库，用户提问时相似度匹配 top_k。
- 优点：接入快（5 行代码），稳定
- 缺点：不解决关系，无时间推理，陈旧记忆持续积累
- 代表：Pinecone/Weaviate/Qdrant/Milvus/Mem0

### 派别 2：结构化笔记派（Zep 为代表）
抛弃纯向量，直接存时序知识图谱。每条事实带时间戳。
- 优点：时序感知最强，原生支持 supersede（新事实覆盖旧事实）
- 缺点：需 Neo4j 等图数据库，运维成本高；LLM 抽取实体有损耗

### 派别 3：自我管理 OS 派（Letta 为代表）
把上下文窗口当内存，外部存储当磁盘。Agent 自己决定什么该记住。
- 优点：唯一原生支持长程 session
- 缺点：学习曲线陡，调参地狱，不可观测

### 派别 4：时序衰减派（VoltMem 为代表）
给每个记忆配 volatility prior（易逝性先验），动态调整。
- 优点：解决"地址更新"类问题的理论最优方案
- 缺点：研究原型，无企业级 SLA

## 选型决策树

1. Agent 跑多久？短时 → 2，长程 → Letta
2. 事实有没有时序/关系？静态 → Mem0 + 强 reranker；演化 → 3
3. 能维护图数据库？能 → Zep；不能 → Mem0 + 手动时间戳；可容忍不稳定 → VoltMem

## 核心反思

Stability-Plasticity Dilemma（稳定性-可塑性二难）：可塑性（吸收新事实）vs 稳定性（不被薄弱证据带偏）。1989 年神经网络面临的问题，2026 年 LLM Agent 仍在挣扎。

## 链接

- 已有实体: [[entities/mem0-vs-workbuddy-agent-memory-comparison]], [[entities/agent-memory-storage-six-schools-wiki-compile-vs-raw-data-debate]]
