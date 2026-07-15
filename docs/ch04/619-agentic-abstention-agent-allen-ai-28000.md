# Agentic Abstention—Agent 能及时停止吗？华盛顿大学/Allen AI 28000+ 任务基准评测

## Ch04.619 Agentic Abstention—Agent 能及时停止吗？华盛顿大学/Allen AI 28000+ 任务基准评测

> 📊 Level ⭐⭐ | 3.4KB | `entities/agentic-abstention-washington-allen-2026.md`

# Agentic Abstention—Agent 能及时停止吗？

## 核心问题

华盛顿大学与 Allen AI 等机构提出 **Agentic Abstention（智能体弃权）**问题：在多轮工具调用中，Agent 不仅需要会「答」和「做」，还需要在证据表明任务不可行时**主动弃权（ABSTAIN）**——停止进一步行动并说明原因或请求澄清。

## 与 LLM Abstention 的关键区别

| 维度 | LLM Abstention | Agentic Abstention |
|------|---------------|-------------------|
| 动作空间 | 只有 ANSWER/ABSTAIN | 多了 ACT（搜索、点击、执行命令） |
| 观测 | 单轮静态 prompt | 随交互累积，最早应弃权步可能在第 2-3 轮才出现 |
| 评价 | 最终是否弃权 | 还要看**及时性**——晚一步就是多余 API 调用 |

## 三类典型失败模式

1. **过坚持（Over-persistence）**：该停还硬做，把交互预算烧光
2. **延迟弃权（Delayed Abstention）**：最终认栽，之前已多搜七八轮
3. **过早放弃（Over-abstention）**：在本来能完成的任务上过早弃权

## 基准结果（28000+ 任务）

- WebShop 上最强基线**及时弃权召回（AbsRec@1）仅 26.7%**
- 10 轮内总体弃权召回（AbsRec@10）能到 83.2% — 差距说明 Agent 经常「迟早会意识到不行」，但识别得太晚
- 终端环境 GPT-5.4-mini + Codex CLI 及时召回仅 21.6%
- QA 场景所有模型组平均及时召回**低于 40%**

## 方法：CONVOLVE

核心思路：用 LLM-as-judge 自动标注 20 条轨迹，蒸馏出可迁移的停止规则，无需改模型参数。将 Llama-3.3-70B 的及时停止召回从 26.7% 拉至 57.4%。

## 对工程实践的意义

与 [Loop Engineering 反馈控制系统](../ch05/007-loop-engineering.html) 中的停止条件讨论直接互补——该实体从架构角度讨论停止条件设计，本文提供实证数据证明当前 Agent 的停止能力严重不足。

> 工程启示：你在 AbstentionBench 上刷高的分数不能直接外推到 ReAct 式 Agent 的停止质量。花大价钱堆模型、加 reasoning、换 scaffold，Agent 依然可能在不可行任务上无效 burn token。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-abstention-washington-allen-2026.md)

---

