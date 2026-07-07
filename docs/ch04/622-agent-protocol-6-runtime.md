# Agent Protocol 不变层：跨框架的 6 个稳定 Runtime 对象

## Ch04.622 Agent Protocol 不变层：跨框架的 6 个稳定 Runtime 对象

> 📊 Level ⭐⭐⭐ | 6.9KB | `entities/agent-protocol-unchanged-across-frameworks-aliyun-2026-07-02.md`

# Agent Protocol 不变层：跨框架的 6 个稳定 Runtime 对象

> Agent 框架层出不穷——LangGraph、OpenAI Assistants、A2A、AG-UI、Deep Agents——名字越来越多，API 越来越像一套套独立世界观。但框架名词在变，底层问题始终围绕任务、上下文、步骤、事件、状态和产物展开。将这些名词往下拆，会发现它们都在回答同一个底层问题：**Agent Runtime 对外暴露的一组稳定对象、生命周期操作和状态迁移是什么？**

## 核心框架：Agent Runtime Protocol 6 对象

**Agent Protocol ≠ 某一个具体标准**（不等于 A2A、AG-UI、LangChain Agent Protocol 或任意单一规范）。它指的是 Agent Runtime 对外暴露的一组稳定对象、生命周期操作和状态迁移。具体协议标准和框架 API 是证据，不是主线。

跨框架反复出现的 6 个稳定对象：

| 对象 | 人话解释 | 回答的问题 |
|------|---------|-----------|
| **Thread/Session** | 一段长期上下文 | 这是谁的哪段任务？ |
| **Run/Task** | 一次具体执行 | 这次具体跑了什么？ |
| **Step** | 执行中的一个可观测步骤 | 哪一步调用了模型、工具或子 Agent？ |
| **Event** | 执行过程中的进展变化 | 现在发生了什么？ |
| **Artifact** | Agent 产出的正式结果 | 结果在哪里，由哪次执行产生？ |
| **Checkpoint** | 可以恢复的执行快照 | 失败或中断后从哪里继续？ |

这 6 个对象是理解 Agent Runtime Protocol 的入口。围绕它们，生产级 Protocol 还需表达 `stream/interrupt/resume/cancel/retry` 等生命周期操作。

## 三层概念：标准、对象、Runtime 能力

讨论 Agent Protocol 时最容易混淆的三层：

1. **具体协议标准**（A2A、AG-UI、LangChain Agent Protocol、ACP）——不同系统如何通信
2. **通用协议对象**（Thread、Run、Step、Event、Artifact、Checkpoint）——外部世界如何稳定理解一次 Agent 任务
3. **Runtime 实现能力**（状态持久化、中断恢复、可恢复流、权限控制、可观测性）——Runtime 内部如何兑现这些对象和状态机

文章重点讨论第二层：通用协议对象。具体协议标准和框架实现只作为证据。

## Runtime 与 Protocol 的关系

**Protocol 是 Runtime 的外部边界，Runtime 是 Protocol 的内部实现。**

Agent Runtime 暴露给外部世界的契约回答的是：

- **如何启动一次任务**：创建 Thread、Task、Run，或发送一条 Message
- **如何携带上下文**：历史消息、文件、结构化数据、参与者、能力声明
- **如何观察进展**：状态变更、流式事件、Artifact 增量、Trace
- **如何中断和恢复**：需要输入、需要授权、取消、重试、继续执行
- **如何拿到结果**：最终消息、Artifact、结构化输出、错误信息

## 跨框架映射

| 框架/标准 | Thread/Session | Run/Task | Step | Event | Artifact | Checkpoint |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|
| LangGraph | — | — | — | — | — | ✅ Checkpoint |
| OpenAI/Run | Thread | Run | Step | — | — | — |
| A2A | — | Task | — | — | Artifact | — |
| AG-UI | Session | — | — | Event | Artifact | — |
| Deep Agents | — | Todo | Subagent | — | VFS | — |

这组映射说明：**没有哪个框架完整实现全部 6 个对象。** 每个框架选择聚焦的对象子集，决定了它的适用场景和局限性。

## 核心洞见

1. **Agent Runtime 的核心不是模型调用，而是任务生命周期管理**——Thread/Run/Step/Event/Artifact/Checkpoint 这 6 个对象围绕的都是任务如何被创建、执行、观测、中断、恢复和完成，而非模型如何推理。

2. **Thread/Run/Step/Event/Artifact/Checkpoint 会成为跨框架的稳定对象**——框架会更迭，API 会改名，但这些对象对应的底层问题不会消失。

3. **执行模型不会统一**——Runtime Loop 承载方式和编排协议会长期分层演进。不同框架在"一次性运行 vs 长任务恢复"、"同步 vs 流式"、"单Agent vs Multi-Agent"等维度上的选择是设计偏好，不是正确性差异。

4. **真正区分玩具 Agent 和生产 Agent 的，是状态持久化、中断恢复、可观测性和可评测性**——这是协议对象之外的 Runtime 实现能力层。

5. **值得看的不是某个框架 API，而是协议边界和 Runtime 抽象**——框架会更迭，但协议边界稳定的时间更长。当你理解这 6 个对象后，看新框架时就能快速判断：它只是换了一套 API 名字，还是解决了一个真实的 Runtime 问题？

## 与其他实体的关系

- [Agent Runtime 7 大职责](../ch03/045-agent.html) — 从 Runtime 职责视角（状态持久化、工具编排、可观测性等）出发，与本文的 Protocol 视角互补
- [From Agent Protocol to Harness Skill](ch04/387-from-agent-protocol-to-harness-skill.html) — 从 MCP/A2A 协议到 Harness Skill 的演进路径，与本文的 Runtime Protocol 抽象视角不同
- [Google Agent Executor](../ch03/045-agent.html) — 分布式 Runtime 实现案例
- [Agent Harness 架构](../ch05/038-agent-harness.html) — Harness 作为 Runtime 的上层封装
- [Agent 架构关键变化：Harness 成为新后端](../ch05/009-harness.html) — Harness 作为 Runtime 演进方向
- [MCP · Skill · Agent · LLM · Harness](../ch05/075-harness-skill.html) — 高层架构关系图

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-protocol-unchanged-across-frameworks-aliyun-2026-07-02.md)

---

