---
title: "Agent Harness 的 6 种运行模式解析"
source_url: "https://mp.weixin.qq.com/s/fCNIAdNOsT08YUBZoD97tw"
source_site: "mp.weixin.qq.com"
source_author: "皮卡秋Pika"
ingested: "2026-07-14"
sha256: "5fb655b4c20e3dce135b953c74238c429a921c555700a27a9d498c8c27b37dde"
type: "raw-article"
tags: [agent, harness, architecture, runtime-patterns, sdb, stanford]
status: "ingested"
---

# Agent Harness 的 6 种运行模式解析

> Stanford 独立研究者 Vasundra Srinivasan 提出：生产级 LLM Agent 事故的 71% 来自「随机-确定性边界」(SDB)，并给出由 6 种运行时模式、5 步选择流程、12 个失败签名组成的系统化方法论。

## 为什么「换个更强模型」救不了你的 Agent？

论文通过对 21 个已发布的 Agent 失败案例做分类，发现 15 个（71%）的事故根因都落在同一条「边界」上——LLM 的随机输出和系统的确定性写入之间的接口，正式命名为 **Stochastic-Deterministic Boundary（SDB，随机-确定性边界）**。

## SDB 四部分契约

论文把 SDB 形式化为一个四部分契约：

- **Proposer（提议者）**：LLM 本身，输出天然带随机性
- **Verifier（验证器）**：对提议做确定性检查的代码（JSON schema、权限、规则、安全）
- **Commit（提交）**：验证通过后的持久化写入（DB、API、消息队列）
- **Reject Signal（拒绝信号）**：验证失败时返回给 LLM 的类型化响应（让模型能自我修正）

> 架构的真正分界线，不在「哪段代码是 AI、哪段是传统软件」，而在「LLM 的随机输出和系统的确定性写入之间」。

作者在 5 个主流开源 Agent 框架（21 个 LLM→action 调用点）里审计，发现 19 个已经有明确的 Verifier 和 Commit 逻辑——大家都在用，只是没人给它起名字。

## 三个正交维度

LLM Agent 运行时拆成三个互不重叠的维度：

| 维度 | 核心问题 | 形式化来源 |
|------|---------|-----------|
| Coordination（协调） | 工作怎么拆分和组合？ | Hewitt 的 Actor 模型 |
| State（状态） | 系统怎么记忆？ | CAP 定理、事件时间 vs 处理时间 |
| Control（控制） | 谁决定什么运行、何时停止？ | 控制理论、Erlang 监督树 |

LLM Agent 是分布式系统经典理论在「随机提议者」这一新成员出现后的重新组装。

## 6 种运行时模式

论文给出了一个开放的模式目录：

1. **分层委托**（Hierarchical）：主管 Agent 把任务派给多个子 Agent，典型形态是对话式 Agent
2. **分散-聚合 + 补偿**（Scatter-Gather + Saga）：主 Agent 把任务打散并行跑，失败时按 Saga 模式做补偿回滚
3. **事件驱动排序**（Event-Driven）：事件作为真相来源，按工作流网推进——有坑叫「重放分歧」
4. **监督者 + 门控**（Supervisor + Gate）：在监督树下加 Policy/Budget/Role 三类 Gate
5. **共享状态机**（Shared State Machine）：用分布式状态机做单一真相来源
6. **人在回路**（Human-in-the-Loop）：LLM 提议 → 人类审批 → Commit

> 模式没有银弹。生产里 90% 的事故，事后看都是「用错了模式」或「漏掉了配套机制」。

## 5 步选择流程

可落地的决策流程，输出是 6 行架构决策记录（ADR）：

1. **Step 1：分类运行时** — 时长 > 小时 → Long-Horizon；用户在等 → Conversational；其他 → Autonomous
2. **Step 2：选择 Spine（状态主干）** — 要可重放/审计 → Event-sourced；要实时一致 → Versioned-row
3. **Step 3：用协调包装** — 可拆+并行 → Scatter-Gather；可拆+串行 → Hierarchical；不可拆 → Event-Driven
4. **Step 4：用控制边界** — 高风险操作 → Supervisor + Gate；需要人批 → Human in the Loop
5. **Step 5：排序构建** — 自检清单：每个 LLM→action 边界都有 Verifier/Commit/Reject Signal

## 可靠性分解

论文最精彩的部分——可靠性公式：

$$y(t) = μt + σξ(t)$$

| 符号 | 含义 | 谁决定的 |
|------|------|---------|
| y(t) | 系统可靠性观察值 | — |
| σ | 每次调用的方差（LLM 随机性） | 模型质量 |
| μ | 架构动量（模式 + SDB 强度） | 架构师 |
| ξ(t) | 零均值噪声 | — |

关键洞察：
- σ 随模型迭代持续压缩
- μ 一旦选定就和模型无关——换模型不会自动变好
- 当 σ → 0 时，μ 主导整体可靠性

> 当 LLM 强到「随机性几乎消失」那天，Agent 系统的可靠性瓶颈，将 100% 落在架构选择上。

## 失败签名目录（6 个典型）

| 编号 | 故障 | 缓解 |
|------|------|------|
| P3 | Replay Divergence（重放分歧）：同一历史事件日志在不同模型版本下产生不同输出 | 版本化消费者 + 提示版本控制 + 输出差异检测 |
| P2 | Saga 补偿失灵：部分成功+部分失败让补偿逻辑难回滚 | LLM 非确定性让触发条件更难判断 |
| P4 | Gate 配置错误：门没拦住 | 阈值按业务调、Policy-as-Code 覆盖最新规则 |
| P5 | 共识冲突：LLM 非确定性与状态机一致性冲突 | 额外序列化层 |
| P6 | 审批超时：人在回路延迟 | 异步审批 + SLA 监控 |
| P1 | 子 Agent 输出未聚合：只派不收 | 强制汇聚回主管再 commit |

## 参考文献

- 论文原文：A Methodology for Selecting and Composing Runtime Architecture Patterns for Production LLM Agents (arXiv 2605.20173)
- 配套仓库：https://github.com/vasundras/agent-runtime-patterns
- Hewitt, C. Actor Model of Computation
- Garcia-Molina, H. Sagas (1987)
- van der Aalst, W. Workflow Nets
- Lamport, L. Paxos Made Simple
