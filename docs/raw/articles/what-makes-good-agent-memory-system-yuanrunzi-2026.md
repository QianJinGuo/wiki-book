---
title: "怎样才算是好的Agent记忆系统？"
source_url: "https://mp.weixin.qq.com/s/90I1qj9vI2de4KgC0oPPAQ"
source_site: "mp.weixin.qq.com"
source_account: "元闰子"
author: "元闰子"
ingested: 2026-07-31
sha256: "21b34917dc19aee4e38fdf9ab338936f7c1c0a1d59e017833e9b58ba7df3d4d6"
type: raw-article
tags: [agent-memory, memory-system, architecture, retrieval, cost-latency, mem0, zep, letta, memos]
---

# 怎样才算是好的Agent记忆系统？

记忆系统（Memory System）是 Agent 保持多轮任务连贯性的核心组件，解决了模型上下文窗口有限的问题。它把 Agent 历史交互上下文保存起来，并在必要时召回，让 Agent 具备了人类的记忆能力。

对好坏的评价，目前业界更多把效果（Agent 任务成功率）作为唯一标准，忽略了时延、成本等关键系统因素。如果你增加 100% 的成本才换来 5% 的成功率提升，这通常不会被看作是个好的设计。

## 记忆的生命周期

- **记忆摄入**：Agent 把交互上下文输入给记忆系统
- **记忆构建**：将交互上下文转换记忆单元（分块或 LLM 摘要）
- **记忆存储**：存储到存储系统并完成索引更新
- **记忆检索**：检索出相关记忆，追加到 Prompt 中发给 LLM
- **记忆维护**：更新记忆，完成记忆之间的流转、遗忘

## 系统架构的分类

- **朴素架构**：原始上下文原封不动保存 + 建索引，每次检索 top-k 相似记忆。主要问题是原始上下文有大量冗余噪声。
- **基于 LLM 的架构**：LLM 用于记忆抽取（摘要、提取事件、提取实体+关系构建图索引），也可用作记忆调度（意图分析，提炼精确子查询）。
- **基于 Agent 的架构**：把记忆更新和检索做成工具，由 Agent 自己判断是否需要调用。

## 记忆存储的分类

- **平铺型记忆**：原始上下文分块或 LLM 提取成独立记忆单元，建立向量/全文索引。缺点是记忆单元缺少关联，无法应对多跳推理。
- **关系型记忆**：基于图或树构建，把割裂的记忆单元关联起来，需要模型做实体、关系抽取。
- **混合型记忆**：结合平铺（语义/关键字匹配）与关系型（关联推理）。

## 记忆构建的分类

- **固定大小分块**：按固定 token 数切片。快、时延低，但语义不连贯、检索效果一般。
- **松散 LLM 抽取**：LLM 从上下文抽取摘要、事件、偏好等，输出无强结构化格式。小模型即可完成。
- **结构化 LLM 抽取**：转成 JSON 等结构化输出（如图记忆的实体-关系三元组）。对模型能力要求更高，成本和时延更高。

## 记忆检索的分类

- **单阶段索引检索**：一次索引检索（全文关键字/向量语义/图多跳）。快、简单，但过度检索有时反而降低效果。
- **Agent 按需检索**：检索做成 Agent 工具，由 Agent 判断是否调用。
- **多阶段混合检索**：检索前 LLM 意图分析扩展精确子查询；检索时多路多模检索（全文+向量+图）；检索后 Rerank 模型对多路结果重排序，找到全局最优 top-k。

## 记忆维护的分类

- **基于时序的多版本管理**：为每个记忆注入时间戳，新旧冲突时时间戳判断有效性。
- **容量驱动记忆淘汰**：FIFO、LRU 等策略对旧记忆做淘汰。
- **LLM 驱动记忆维护**：LLM 主动理解记忆内容，进行合并、压缩、更新或删除。可闲时离线整合（合并冗余、解决冲突），或每次更新时在线整合。也可以把维护操作作为 Agent 的工具。

## 不同记忆系统在 Benchmark 上的表现

| 记忆方式 | LongMemEva | LoCoMo | DB-Bench | 洞察 |
|---------|-----------|--------|----------|------|
| Long Context | 中 | 较好 | 较好 | Mem0 除 LongMemEva 外均比 Long Context 差 |
| Mem0 | 较好 | 差 | 差 | LLM 压缩丢失细节，LoCoMo 关注细节表现不佳 |
| Zep（关系型） | 最高 48.0 | — | — | 跨 Session 事实推导场景表现更好 |
| Letta（分层） | — | — | 好 | Recall/Core/Archival 记忆自动下沉，保留关键状态，适合多步骤执行 |
| MemOS/MemoryOS（混合） | 接近最优 | 接近最优 | 接近最优 | 混合型比单一型效果更好 |

## 成本与时延维度

对记忆系统成本和时延的考量分三个阶段：**记忆构建（含维护）、记忆检索、LLM 生成**。

- 现有记忆系统更多关注检索和生成阶段，但论文《Agent Memory: Characterization and System Implications of Stateful Long-Horizon Workloads》显示，类似 Letta 的混合型系统**记忆构建的成本和时延占比远高于检索 + LLM 生成**。
- 对比更适合用**端到端时延/请求**：构建时延 + 检索时延 + LLM 生成时延。
- MemoryOS 效果很好但时延高、成本大；Cognee 和 Zep 成本最高（图索引，LLM 抽取实体-关系 + 图索引构建）；Mem0 时延/成本高但记忆效果低（最尴尬）。

## 结论：记忆系统的好坏尽在权衡

- 想要更好的记忆效果 → 混合型、基于图记忆系统（MemOS、MemoryOS、Zep）
- 想要更低的成本 → 基于向量索引的朴素记忆系统
- 既要效果好又要低成本 → 做不到

参考：《Are We Ready For An Agent-Native Memory System?》Wei Zhou 等；《Agent Memory: Characterization and System Implications of Stateful Long-Horizon Workloads》Yasmine Omri 等
