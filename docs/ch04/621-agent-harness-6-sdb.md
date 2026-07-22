# Agent Harness 6 种运行模式与 SDB 方法论

## Ch04.621 Agent Harness 6 种运行模式与 SDB 方法论

> 📊 Level ⭐⭐ | 3.5KB | `entities/agent-harness-6-runtime-patterns-sdb.md`

# Agent Harness 6 种运行模式与 SDB 方法论

> Stanford 独立研究者 Vasundra Srinivasan 提出的生产级 LLM Agent 运行时架构方法论（arXiv 2605.20173），涵盖随机-确定性边界（SDB）、6 种运行时模式、5 步选择流程和 12 类失败签名。

## Stochastic-Deterministic Boundary（SDB）

SDB 是 LLM 随机输出与系统确定性写入之间的接口，论文将其形式化为四部分契约：

- **Proposer**：LLM 输出（天然带随机性）
- **Verifier**：确定性检查代码（JSON schema、权限、规则、安全）
- **Commit**：验证通过后的持久化写入（DB、API、消息队列）
- **Reject Signal**：验证失败时返回的类型化响应（让模型自我修正）

在 5 个主流开源 Agent 框架（21 个 LLM→action 调用点）审计中发现，19 个已有明确的 Verifier 和 Commit 逻辑，但从未被显式命名。

## 三个正交维度

| 维度 | 核心问题 | 形式化来源 |
|------|---------|-----------|
| Coordination（协调） | 工作怎么拆分和组合？ | Hewitt Actor 模型 |
| State（状态） | 系统怎么记忆？ | CAP 定理、事件时间 vs 处理时间 |
| Control（控制） | 谁决定什么运行、何时停止？ | 控制理论、Erlang 监督树 |

> LLM Agent 是分布式系统经典理论在「随机提议者」这一新成员出现后的重新组装。

## 6 种运行时模式

1. **分层委托（Hierarchical）**：主管 Agent → 子 Agent，对话式 Agent 的典型形态
2. **分散-聚合 + 补偿（Scatter-Gather + Saga）**：任务打散并行跑，失败时按 Saga 补偿回滚
3. **事件驱动排序（Event-Driven）**：事件作为真相来源，按工作流网推进——有「重放分歧」风险
4. **监督者 + 门控（Supervisor + Gate）**：Policy/Budget/Role 三类 Gate，高风险操作标配
5. **共享状态机（Shared State Machine）**：分布式状态机做单一真相来源
6. **人在回路（Human-in-the-Loop）**：LLM 提议 → 人类审批 → Commit

## 可靠性分解公式

$$y(t) = μt + σξ(t)$$

- σ（模型方差）：由模型质量决定，随模型迭代持续压缩
- μ（架构动量）：由模式选择 + SDB 设计决定，换模型不会自动变好
- 当 σ → 0 时，μ 主导整体可靠性

> 当 LLM 强到「随机性几乎消失」那天，Agent 系统的可靠性瓶颈将 100% 落在架构选择上。

## 典型失败签名

| 模式 | 故障 | 缓解 |
|------|------|------|
| P3 | Replay Divergence（重放分歧） | 版本化消费者 + 提示版本控制 |
| P2 | Saga 补偿失灵 | 精确触发条件判断 |
| P4 | Gate 配置错误 | 按业务调阈值 + Policy-as-Code |
| P5 | 共识冲突 | 额外序列化层 |
| P6 | 审批超时 | 异步审批 + SLA 监控 |
| P1 | 子 Agent 输出未聚合 | 强制汇聚回主管再 commit |

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-harness-6-runtime-patterns-pikachu.md)

---

