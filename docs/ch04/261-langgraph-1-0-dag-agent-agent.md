# LangGraph 1.0：别再用 DAG 写 Agent 了，你的 Agent 需要一个操作系统

## Ch04.261 LangGraph 1.0：别再用 DAG 写 Agent 了，你的 Agent 需要一个操作系统

> 📊 Level ⭐⭐ | 9.9KB | `entities/langgraph-10别再用-dag-写-agent-了你的-agent-需要一个操作系统.md`

# LangGraph 1.0：别再用 DAG 写 Agent 了，你的 Agent 需要一个操作系统

> DAG 不是 Agent 编排的答案，它是 Agent 最简单的特例。无环图天生不能循环、反思、重试、恢复。LangGraph 的 StateGraph + Pregel 引擎 = Agent 的操作系统内核：调度、持久化、恢复三个原语 DAG 一个都没有。但 Checkpoint 不等于 Durable Execution——2026 年的 Agent 框架都停在"给了你 F5 存档键"阶段，自动恢复还需自建。

## 摘要

LangChain Expression Language（LCEL）底层的 DAG（有向无环图）模型适用于批处理脚本：数据从左往右流，每个节点最多执行一次，没有回边、没有挂起、没有恢复。然而真实的 Agent 工作流需要循环反思、条件分支、重试恢复和人工在环——这些 DAG 的数学模型都不支持。LangGraph 1.0 引入 StateGraph 作为替代计算模型，将图从"数据流管道"转变为"状态载体"，并用 Pregel BSP（批量同步并行）引擎作为执行内核，在每个 superstep 后自动 checkpoint。这篇文章系统性地对比了 DAG 与 StateGraph 的拓扑差异，详细剖析了 Pregel 的 Plan→Execute→Update 循环，并与 Microsoft Agent Framework 1.0 做了全面的设计哲学对比。

## 核心要点

- **DAG 的天花板是数学性的**：无环图这个数学模型不允许回边——它被设计来处理数据流，不是控制流。循环、反思、重试、恢复等 Agent 核心需求需要回边支持
- **StateGraph 的三个核心差别**：共享状态（任意节点可读完整 state）、Reducer 合并策略（覆盖/追加/自定义）、Conditional Edge（运行时状态决定控制流）
- **Pregel BSP 执行循环**：Plan（确定哪些节点的输入已变化）→ Execute（并行运行选中节点）→ Update（原子化写入 channel + checkpoint）
- **Checkpoint 并非 Durable Execution**：LangGraph 在每个 superstep 后写 checkpoint，但不会自动检测故障、不会自动恢复、resume 时重执行整个节点函数（需要幂等设计）
- **微内核 vs 宏内核**：LangGraph 提供四个核心原语（StateGraph、Node、Conditional Edge、Checkpointer）让开发者自由组合；Microsoft Agent Framework 提供完整的编排模式（Sequential、Handoff、Group Chat）

## 深度分析

### DAG 的数学模型局限与 StateGraph 的突破

LCEL 将 LLM 调用串成 `prompt | model | tool_executor | parser` 管道——这在简单场景下工作良好，但一旦 Agent 需要条件分支或循环反思，DAG 就暴露出根本性的拓扑限制。作者用一个生产事故说明了问题：while 循环的条件判断被 None 值绕过，Agent 在"think→没有结果→再 think"的循环里跑了 200 多步，一晚上烧了 $50。结论是：**不是 Prompt 的问题，是拓扑的问题。**

StateGraph 通过三个设计突破这一限制：**共享状态**（TypedDict/Pydantic model 在所有节点间流转）、**Reducer 合并**（自定义追加/覆盖策略）、**Conditional Edge**（运行时 state 决定路径）。这三者加在一起，使得 Agent 可以在第 5 步回看第 2 步的判断依据，决定是否改主意。

这与 `LangChain Agent Harness 架构解剖` 中讨论的"Agent 框架需要从管道思维转向状态机思维"的判断一致。

### Pregel：从图处理引擎到 Agent OS 内核

Pregel 最初是 Google 2010 年的大规模图处理系统，LangGraph 将其 BSP 模型适配为 Agent 工作流执行循环。每个 superstep 包含三个阶段：Plan（检查哪些 channel 已变更→触发对应的节点）、Execute（并行运行所有被 Plan 选中的节点）、Update（原子化写入 channel + checkpoint）。

这个循环与操作系统进程调度的相似性是精确的工程类比：OS 不关心进程内容，只做三件事——选就绪进程、分配 CPU 时间片、保存/恢复上下文。Pregel 也不关心节点是 LLM 调用还是工具执行——它只做三件事：决定哪些节点该跑、执行它们、保存状态。

### Checkpoint 与 Durable Execution 的差距

这是文章中最重要的技术洞察。LangGraph 在每个 superstep 后自动 checkpoint 到 Postgres/SQLite——这意味着 Agent 进程死掉了，重启后可以从最后一个 checkpoint 继续。但这不等于 Durable Execution。文章列出了三个具体问题：

1. **保存状态 ≠ 自动检测故障**：checkpoint 是被动存档，不是主动健康检查
2. **保存状态 ≠ 自动恢复**：LangGraph OSS 不会自动拉起新执行——你需要自己搭建重试基础设施
3. **resume 时重执行节点，不是续跑代码行**：所有有副作用的节点（发消息、写数据库、调付费 API）必须做幂等处理

一个研究实验发现，超过 75% 的 Agent 轮次产生"恢复无关"的状态，原始 checkpoint 重放正确率只有 8%。而改进后的语义感知 checkpointing 把正确率提到了 100%。

这一发现对 `Agent Harness 生产实践` 中的失败恢复设计有直接指导意义：不能只依赖 checkpoint 机制，必须同时考虑语义恢复和幂等执行保障。

### LangGraph vs Microsoft Agent Framework 的设计哲学

两种哲学分别对应于操作系统史上的 Linux vs Windows 之争。LangGraph 是**微内核**：给你四个原语，你可以定义一个 50 个节点的复杂拓扑，代价是 150 行模板代码才能跑通一个 demo。MAF 是**宏内核**：提供 Sequential、Handoff、Group Chat 等一等原语，代码量少，但当需要框架没给的模式时，高级原语变成束缚。

选型判断：Python 栈、需要严格控制流程、团队愿意花 1-2 周上手图思维 → LangGraph；.NET 栈、需要用 Azure、需要快速上线标准多 Agent → Microsoft Agent Framework；仅需简单角色分工 → CrewAI 就够了。

### Agent 编排的演进阶段

文章将 Agent 编排的演进梳理为四个阶段：
1. **2023：链式调用**——LCEL 串成管道，Agent 只是"调一次模型，选一个工具"
2. **2024：框架爆发**——CrewAI、AutoGen、Dify 出现，链式调用撑不住复杂场景
3. **2025 Q4：状态机成为共识**——LangGraph 1.0 发布，LangChain 官方承认"链式调用只是图的一个子集"
4. **2026 Q2：趋同与分化**——MAF 走向图工作流 + checkpoint，但微内核 vs 宏内核开始分化

下一个阶段的关键词是 **Durable Execution**：当所有框架都有了 checkpoint，竞争焦点从"能不能保存状态"转向"能不能保证任务一定完成"。这很像 1970 年代 OS 从批处理到分时系统的过渡。

## 实践启示

1. **超过 3 步且含条件分支的 Agent 应立即迁移到 StateGraph**：DAG 在简单场景下够用，一旦涉及循环反思或条件路由，其数学模型限制会导致不可靠的运行时行为。迁移成本比修复 DAG 强塞回边造成的 bug 低得多。

2. **生产环境必须用 PostgresSaver + sync mode**：MemorySaver 进程死了就没了；SqliteSaver 并发写性能急剧下降。PostgresSaver 是多实例生产环境的唯一选择。

3. **所有有副作用的节点必须幂等**：发消息前查"这条消息发过了吗"，写库前 `INSERT ... ON CONFLICT DO NOTHING`，调付费 API 前检查"已扣过费了吗"。LangGraph resume 时重执行节点函数，不是续跑代码行。

4. **自行搭建故障检测与恢复基础设施**：LangGraph 给了 checkpoint 原语，但没给自动检测和恢复。需要外部监控（定时任务卡住检查）+ 自动 resume（`graph.invoke(None, config)`）+ 幂等处理。

5. **框架选择的本质是微内核 vs 宏内核的取舍**：LangGraph 给你最大灵活性但要你负责组装，MAF 给你开箱体验但约束了可能的工作流形状。选型应基于团队对控制力的需求和愿意投入的学习成本。

## 相关实体

- `LangChain Agent Harness 架构解剖`
- `LangGraph 状态机底层实现`
- `Agent Harness 生产实践`
- `Agent Harness 架构设计生产指南`
- [Agent Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/langgraph-10别再用-dag-写-agent-了你的-agent-需要一个操作系统.md)

---

