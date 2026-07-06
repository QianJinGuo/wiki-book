---
title: "State of Memory in Agent Harness — mem0 视角的九大 harness 横评"
source_url: https://mp.weixin.qq.com/s/2c2MV0b1biv71WdX2gCt_A
original_source: https://x.com/mem0ai/status/2061822612398014782
account: 烟花星空 AI
author: mem0
published: 2026-06-11
ingested: 2026-06-12
sha256: 048fb1b6e6f477fa825e8049e76d57793032d6c3db24dac25eca791bfd3d4d1b
type: source
tags: [agent, harness, memory, mem0, comparison, landscape, survey]
review_value: 9
review_confidence: 9
---

# State of Memory in Agent Harness

> 作者: mem0
> 原文链接 (X 原帖): https://x.com/mem0ai/status/2061822612398014782?s=46
> 转载: 烟花星空 AI (微信公众号), 2026-06-11

## 核心判断

现在真正"发货"的，越来越是 agent harness，模型本身退到后面了。

Cursor、Devin、Claude Code、Codex 这些环境，负责上下文、工具编排、agent 协调，也越来越负责 memory。这篇文章的重点，是把各家 harness 的 memory 机制拆开看，再看看它们到底还缺什么。

## Memory 到底分几种

作者先把"memory"这个词拆成三层，因为它们的失败模式完全不同。

- **Working memory**: 会话中的上下文窗口内容。会话结束就重置，窗口满了之后怎么压缩，是它的难点。
- **External memory**: weights 之外的持久化内容，比如 vector store、knowledge graph、文件。它能跨 session 保存，2026 年几乎所有 production memory 都在这里。
- **Parametric memory**: 通过训练更新到 weights 里的知识。它靠 generalized rules 工作，而非检索样例。2026 年基本没有 production 部署。

认知科学里的 semantic / episodic / procedural，说的是"存什么"；这三层说的是"存在哪里"。

## 各家 Harness 怎么做

### Claude Code
两条线：
- `CLAUDE.md`：人写的配置和约定，session 开始时读取
- Auto-memory：后台 extraction agent 生成的笔记，放在 `~/.claude/projects/<repo>/memory/`，外面再套一个 `MEMORY.md` 索引

读取阶段：每轮额外调用一个小模型，让它根据文件名和描述选要加载的文件。

**问题**：靠文件名选文件，不靠语义搜索；再加上文件数上限和静默截断，相关内容很容易被漏掉。

### Anthropic Managed Agents
Anthropic 托管的 agent runtime，和 Claude Code 这种本地产品不同。

- Session 是 append-only event log，不会被原地修改。
- Memory store 挂在 `/mnt/memory/`，每个 workspace 最多 8 个 store，单个大约 100KB。
- 多个 agent 可以共享同一 store，历史可审计。

**短板**：偏 workspace 级协作，不太像长期个人记忆；容量也不大。

### OpenAI Codex
Memory 很"朴素"：
- markdown 目录：`~/.codex/memories/`
- `memory_summary.md` 先读
- `MEMORY.md` 按需 grep
- 还有 `raw_memories.md`、`skills/`、`rollout_summaries/`

走的是 substring grep 这一路，语义搜索没有真正做起来。摘要也有固定 token budget，容易被截断得很安静。

### GitHub Copilot
特点是 **just-in-time citation verification**。Memory 项是结构化对象，带 subject、事实内容、文件行引用和 reasoning。真正使用前，会验证引用是否和当前分支一致，不一致就重写。

还有一个 **staleness 机制：28 天自动过期**。这是作者认为目前最强的"过时处理"方案之一，且有真实 A/B 结果。

### OpenClaw
Native memory 看起来很强：
- markdown
- 本地 MEMORY.md
- 每日日志
- SQLite 索引
- embedding + hybrid retrieval

但问题出在"写进去什么"。当上下文快满时，触发一次内部 turn，让模型自己决定该写什么到磁盘里。结果就是：**长期记忆的质量，强依赖那一轮模型的判断**。

### Hermes Agent
三层 memory：
- working memory：MEMORY.md 和 USER.md
- skills：工具调用多轮后沉淀出的 procedural docs
- session search：SQLite FTS5

也能接 Mem0 这类外部 provider，补 semantic retrieval 和更好的持久化。

### AWS Bedrock AgentCore
AWS 的托管 agent 平台。Memory service 会跑三种异步提取：
- semantic facts
- preferences
- narrative summary

还会把变更事实标成 INVALID，保留 lineage。

**短板**：AWS 生态锁定，且公开分数不算顶尖。

### Windsurf
Memory 由 Cascade 生成和管理，本地 workspace-scoped 存在于 `~/.codeium/windsurf/memories/`。

能记住 codebase 模式和约定，但范围被 workspace 限住了，跨项目和跨设备都很弱。

### Devin
两类 memory：
- **Knowledge**：人工审核后写入的触发性事实
- **DeepWiki**：参考文档

优点是质量控制强，缺点是门槛高 — 没人审，很多东西就不会沉淀下来。

## Benchmark 也有问题

作者判断：大多数 memory benchmark 不好。它们多数在测"能不能回忆过去对话里的事实"，已经接近饱和，且高分不等于能做出更好的决策。

### LoCoMo (最常见的问题)
- 只有十段对话，比较不稳定
- 很多题目根本不需要 memory
- adversarial 问题和目标太像，容易靠表面模式蒙对

### LongMemEval (还算可以)
覆盖：
- information extraction
- multi-session reasoning
- temporal reasoning
- knowledge updates
- abstention

但仍然更偏 recall，离 task utility 还很远。

### 更深一层
MemoryArena 和 Anatomy of Agentic Memory 这类工作，已经把问题说得更清楚了：**真正该测的是 memory 能不能指导行动**。

还有一个现实问题是规模。标准 benchmark 往往卡在 1.5M tokens 左右，而 production agents 会跑到 10M+。**BEAM 是少数真正在那个量级上设计的 benchmark**。

## 研究里还没解决的坑

作者归纳了三类常见短板：
- **稳定性 vs 可塑性**：外部 memory 并没有消灭 catastrophic forgetting
- **选择性遗忘**：删掉过时事实，同时保住结构，仍然很难
- **安全性**：memory 本身也会变成攻击面，存在 cross-user contamination 和 poisoning 风险

外部 memory 只是把问题从 weights 挪到了检索层，问题并没有被消掉。

## 共同短板

这几家系统的缺口其实很像：
- 存储是 bounded 和 local 的
- 检索大多还是 keyword 式
- memory 常常只属于某个 harness
- staleness 处理很弱
- isolation 也不够

**这些限制，本质上是 harness boundary 的限制。**

## Mem0 想填什么坑

Mem0 走另一条路：把 memory 做成一层基础设施，定位比某个 harness 内部的小功能更高。

混合架构：
- vector store 做 semantic retrieval
- knowledge graph 做 relational reasoning
- key-value 做元数据和快速访问

**v3 算法（2026 年 4 月升级）走向**：
- single-pass ADD-only extraction
- multi-signal retrieval
- entity linking inside the vector store

作者想解决的是：portable、semantically searchable、cross-agent、能吃下 production token volume 的 memory。

## 结论

Memory 现在已经是 harness 的核心能力之一。但今天大多数实现，还停留在"本地、有限、关键词式、难共享"的阶段。真正能跨 harness、跨 agent、跨会话稳定工作的 memory layer，还是行业里最难的一块底座。
