---
title: "Claude Code 上下文工程 —— Anthropic 团队的工程实践"
source_url: "https://mp.weixin.qq.com/s/MGvMU0NENSV3cp4crUZnfA"
publish_date: 2026-06-04
tags: [wechat, article, context-engineering, claude-code, anthropic, thariq, agent, subagent, context-isolation]
review_value: 7
review_confidence: 8
review_recommendation: moderate
sha256: pending
---

# Claude Code 上下文工程 —— Anthropic 团队的工程实践
> 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/MGvMU0NENSV3cp4crUZnfA
> 官方原文：https://www.anthropic.com/engineering/claude-code-context-engineering（Anthropic 工程博客）

## 一句话定位
**Thariq Shihipar（Anthropic Claude Code 团队）** 公开撰文把"上下文管理"升格为"**上下文工程 (Context Engineering)**"——一个比 prompt engineering 范围更大的工程学科。本文是 Anthropic 官方对"为什么需要做上下文工程 + 怎么做"的**第一次系统化表述**。

## 核心论点

### 1. 命名：Prompt Engineering → Context Engineering
- **Prompt Engineering (PE)** = 关注"**这一轮**我该怎么写提示词"
- **Context Engineering (CE)** = 关注"**过去几轮**模型**看到了什么** + **接下来要让它看到什么**"
- CE 是 PE 的超集 —— CE 包含 PE，但还涉及工具输出预算、状态分舱、subagent 隔离、自动摘要、注意力分配
- Anthropic 官方话语权：**用"context engineering"代替"prompt engineering"**作为 Claude Code 团队的内部术语

### 2. 5 大实战工程模式
1. **Quarantined subagent（隔离区 subagent）** —— subagent 的本质 = 上下文隔离机制，把探索性读取丢进子 agent，主对话只看到摘要
2. **Auto-summarization（自动摘要）** —— 到阈值按比例丢最早一段消息，留尾巴 + 摘要前置
3. **Tool output budgeting（工具输出预算）** —— 每类工具输出给字符/token 上限，超大输出只留开头/结尾/preview，完整内容落盘
4. **State sharding（状态分舱）** —— 按维度分别保留：原始文档 / 工具输出 / 中间结论 / 决策日志 分舱
5. **Subagent 做 narrow read** —— 子 agent 只读相关文件范围，把"读到了什么"压缩回主 agent

### 3. Subagent 的本质 = 上下文隔离
- Anthropic 视角：**subagent 存在的主要目的不是"并行"而是"隔离"**
- 主对话的上下文窗口 = 稀缺资源；让 subagent 跑探索性 read，让它带着"我读了什么 + 我发现了什么"回来
- 这与"上下文窗口 = 工作集"理念一致：subagent 是"工作集外包"

### 4. PE vs CE 的明确分工
| 维度 | Prompt Engineering | Context Engineering |
|---|---|---|
| **关注** | 这一轮的 prompt 内容 | 过去 + 未来的整体上下文状态 |
| **范围** | 提示词技巧 | 工具输出 / 状态分舱 / 隔离 / 摘要 / 预算 |
| **优化对象** | 文本质量 | 系统性的窗口管理 |
| **执行者** | 人 + 模型 | Harness 系统（pre-query optimization） |

### 5. 与已有知识的关系
- 本文是 Anthropic 团队对**已有分散实践**（compaction / pre-query / subagent 隔离）的**官方命名 + 标准化**
- 之前社区用"上下文管理 / context management"描述这些实践；Anthropic 选了"context engineering"作为官方术语
- 多数工程模式（如 5 大模式）**已经在 Claude Code / OpenClaw / Pi / Letta Code 等系统里实现**，本文是命名 + 集大成

## 启示
1. **"Context Engineering" 是新话术锚点** —— 未来讨论 LLM 工程时，"CE" 会取代"PE"成为主流框架
2. **subagent 的本质 = 隔离**（不是并行）—— 这个 Anthropic 官方视角值得被反复引用
3. **CE 不是 PE 的对立，而是超集** —— 工程团队应该把"上下文管理"作为独立子系统
