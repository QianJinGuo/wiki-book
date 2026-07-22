---
title: "Agent 记忆存储方案深度洞察"
source_url: https://mp.weixin.qq.com/s/v-vSF-VrIIWd2BPSRy_zZA
source: wechat
author: Frank / Q马Q马
published: 2026-06-02
ingested: 2026-06-02
type: raw-archive
tags: [wechat, agent-memory, six-schools, wiki-compile, raw-data, quantumtransf-debate, hermes-agent, mnemon, letta, mem0, mcp]
sha256: 0593729efe13d0d3e3a4ef313d5942dc045d05548cbe3d8f0e21a35903e20aa9
---

# Agent 记忆存储方案深度洞察

> 原文讨论来自 Twitter @QuantumTransf，围绕 ai-memory 项目的 Wiki 编译模式与原始数据直存模式的争论展开。

## 一条推文引发的争论

最近，AI 编码 Agent 的记忆方案在社区引发热议。@QuantumTransf 对 ai-memory 项目提出了尖锐质疑：

> 我没明白为什么要把 agent session 编译成 wiki。原始 session 本来就是结构化数据——messages、tool calls、tool results、files、subagents。直接放进 SQLite，就已经是一个很强的结构。而把它先总结成 markdown page，反而引入了一个不必要的中间实体：信息被压扁，因果链和引用关系要靠后续重建。
> 
> 对 agent 来说，这不应该首先是给人浏览的知识库，而更应该是一个可查询的工作历史数据库。
> 
> "若无必要，勿增实体"

这个质疑触及了 Agent 记忆领域最核心的设计分歧。我们调研了 GitHub 上数十个项目和最新行业实践，以下是完整的技术洞察。

## 当前主流方案全景

| 流派 | 代表项目 | 核心思路 |
|------|---------|---------|
| 向量记忆层 | mem0ai (57K⭐) | 通用记忆层，LLM 提取 + 存储 + 检索事实 |
| Wiki 编译派 | ai-memory (467⭐) | Session → LLM 总结 → Markdown wiki，Git 版本控制 |
| 知识图谱派 | mnemon (322⭐) | 从对话中提取实体关系构建知识图谱 |
| 会话历史派 | Letta/MemGPT | 完整 session 存储，支持 archival recall |
| 原始数据派 | obelisk, Hermes | 原始结构化数据直存 SQLite |
| 仿生记忆派 | Anamnesis | 情景/语义/程序记忆 + 遗忘曲线 |

## 记忆分层模型：行业共识

所有成熟的 Agent 记忆系统，都不约而同地采用了类似人类认知的分层架构：

- **持久记忆层**：
  - **语义记忆**：事实、决策、约定，无衰减，永久保留
  - **程序记忆**：技能、习惯，频率衰减，不常用则淡化
- **工作记忆层**：当前 session 的对话缓冲，session 结束后归档或丢弃

ai-memory 的 M8 策略给出了精确的衰减函数：

```python
score = salience · exp(-λΔt) + σ · log(1+access_count) · exp(-μ · days_since_access)
```

## 核心争论：信息压缩 vs 信息保真

行业正在从"二选一"走向**分层压缩**——**不是选 A 还是选 B，而是保留原始数据的同时，按需生成多个压缩层级**。

| 对比维度 | Wiki 编译模式 | 原始数据直存 |
|---------|--------------|------------|
| 人类可读性 | 极佳，Markdown 可浏览 | 差，需查询工具 |
| 信息保真度 | 有损，LLM 总结会丢失细节 | 无损，保留完整因果链 |
| 跨 Agent 互操作 | 任何能读 Markdown 的 Agent 都能理解 | 需标准化查询协议 |
| 存储成本 | 总结后体积小 | 原始数据量大 |
| 因果链追踪 | 需事后重建 | 天然保留完整时间线 |

## 检索策略演进

Agent 记忆的检索能力经历了五代演进：

1. 关键词搜索（FTS5 / BM25）
2. 向量相似度（embedding + cosine）
3. 混合检索（FTS5 + 向量并行）
4. 知识图谱邻居（图遍历 + 关系推理）
5. **RRF 融合**（当前最佳）

RRF 融合公式：

```python
score = Σ(1 / (k + rank_i))  # k 通常取 60
```

将 FTS5 关键词结果、向量相似度结果、知识图谱邻居结果通过倒数排名融合。这比单一检索方式效果好得多，因为不同检索策略捕捉的是不同的相关性信号。

## 前沿趋势

### 知识图谱记忆

从对话中自动提取实体关系——人物、决策、技术栈、依赖。支持关系推理："这个决策影响了哪些模块？"难点在于提取准确性和图谱维护成本。

### 多 Agent 共享记忆

FlockMem 等探索轻量级本地优先的集体记忆总线，让团队多个 Agent 共享项目上下文，避免每个 Agent 重复学习。

### MCP 成为标准接口

Model Context Protocol 正在成为跨 Agent 记忆的**标准接口层**。ai-memory 提供 14 个 MCP 工具，让任何支持 MCP 的客户端都能查询记忆。这是互操作性的关键一步。

### 零 LLM 模式

ai-memory 支持无 LLM 的 FTS5 搜索 + 规则总结。趋势很明显：LLM 是优化项，不是必需项。基础记忆功能应该不依赖 LLM 就能工作。

## 对 Hermes Agent 的启示

Hermes 当前已经实现了原始数据派的核心能力：

- SQLite 存储完整 session，带 FTS5 搜索
- 轨迹保存

**可能的增强方向**：

- **短期**：增加记忆衰减策略，自动管理旧 session 权重
- **长期**：按需生成 Markdown 摘要层——可选，不替代原始数据

**核心原则**：

> 保留原始结构化数据作为唯一真相源，其他表达层（wiki、图谱、向量）都是可选的派生视图。

## 总结判断

| 维度 | 当前状态 | 未来 1-2 年 |
|------|---------|------------|
| 存储介质 | SQLite + 向量 DB | SQLite 为主，向量可选 |
| 记忆分层 | 3-4 层模型共识 | 更精细的衰减/巩固策略 |
| 互操作性 | MCP 正在崛起 | MCP 成为标准接口 |
| 检索策略 | RRF 融合最佳 | RRF + 图谱推理 + 时间衰减加权 |
| LLM 依赖 | 强依赖 LLM 总结 | 零 LLM 模式 + LLM 增强双轨 |
