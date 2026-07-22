---
title: "Agent到底需要什么样的记忆？上交清华横评12套记忆方案"
source_url: "https://mp.weixin.qq.com/s/aKusds7ohmvocsdRwScZUg"
publish_date: 2026-06-26
tags: [wechat, hyman, agent-memory, memory-in-the-llm-era, iclr2026, arxiv-2604-01707, benchmark]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6
---

# Agent到底需要什么样的记忆？上交清华横评12套记忆方案

来源：Hyman的杂货铺
解读 ICLR 2026 论文 Memory in the LLM Era（上交、清华、MemTensor），arXiv 2604.01707

## 核心论点

Agent 记忆的瓶颈已经从"能不能存"转向"能不能在更新、检索、成本之间稳定取舍"。
Agent 记忆是一套会持续写入、查询、更新、压缩和失效的数据管理系统。

## 4 模块框架

### 1. 表示与存储
记忆可以是原始文本、事实集合、树、图或复合对象。扁平文本/向量简单便宜但无法承载关系和时间结构。图/树适合处理关系、实体、时间和层级。

### 2. 抽取
决定原始对话、工具日志如何写入长期存储。最容易踩坑：写入时过度聪明——LLM摘要看似干净，实际删掉了将来有用的细节。

### 3. 检索与路由
从原生注意力、语义近邻、图遍历到Agent自主路由。相似度解决"像不像"但很多查询需要先定位证据区域再组装证据。

### 4. 维护（最被低估）
冲突解决、版本管理、容量控制、语义合并、过期删除。没有维护，系统会变成越用越脏的日志仓库。

## 12 套系统横评

评测覆盖 Mem0、MemoChat、Zep、Cognee、MemTree、Letta、LightMem、SimpleMem、MemOS、MemoryOS、A-MEM 等。

| 任务类型 | 最优方案 | 原因 |
|----------|----------|------|
| 跨会话问答 | 结构化/混合记忆 | 能保留分散证据 |
| 单跳事实召回 | 图或压缩事实 | 实体关系明确 |
| 时间更新 | 图和多版本 | 可标记旧事实 |
| 长程稳定 | 层级/关系组织 | 远距离证据不易丢 |
| 成本效率 | 局部维护 | 避免全局重写 |

### 证据级检索实测

在 LoCoMo benchmark 上：
- SimpleMem: Recall@1 = 39.0
- A-MEM: Recall@1 更高但 Recall@5=69.5, Recall@10=85.9
- MemTree: Recall@5=59.7, Recall@10=80.5

说明：只盯 top-1 指标很危险。Agent 记忆问题经常需要多条历史共同支撑。

## 工程启示

先判断 Agent 主要错在哪里：
- 跨会话聚合 → 需要时间和关系结构
- 长对话精确事实 → 粗暴摘要反而伤害结果
- 工具操作链 → 完整 trace 比抽象事实更重要
