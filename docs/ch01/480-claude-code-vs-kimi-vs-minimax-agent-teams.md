# Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

## Ch01.480 Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

> 📊 Level ⭐⭐ | 8.8KB | `entities/claude-code-vs-kimi-vs-minimaxagent-teams-到底拼的是什么.md`

# Claude Code vs Kimi vs MiniMax：Agent Teams 到底拼的是什么？

## 摘要

Agent Teams 概念近期持续升温——Claude Code 在推 agent teams，Kimi K2.5 把 Agent Swarm 做成了模型能力，MiniMax Mavis 则将 Owner、Worker、Verifier 机制嵌入产品。本文从第一性原理出发，分析三家产品的核心差异：真正有价值的 Agent Teams 拼的不是 agent 数量，而是外层 harness——模型负责聪明，harness 负责管住聪明。

## 核心要点

- **Agent Teams 的第一性问题**：不是「能开几个 agent」，而是谁来决定任务拆分、谁来决定何时停止、谁来隔离上下文、谁来验收结果。多 agent 的价值在于把混乱变成流程，而非人多。
- **Agent = Model + Harness 公式**：Model 是大脑，Harness 是控制平面，涵盖工具权限、上下文隔离、任务队列、状态机、审批门禁、日志观测、成本控制等关键能力。
- **Agent Teams 六层必备架构**：调度流（状态机/任务队列）、工具层（MCP/沙盒/权限分级）、记忆层（文件即内存/摘要落盘）、门控层（Plan-Execute-Verify 分阶段）、安全层（approval gate/凭据隔离）、观测层（telemetry/任务日志/成本统计）。
- **三家各有所长**：Claude Code 最像工程团队（共享 task list、mailbox、tmux 可观测性），Kimi K2.5 最像搜索集团军（PARL 训练的并行编排，百级 sub-agent），MiniMax Mavis 最像产品化工作流（状态机驱动的 Owner-Worker-Verifier 分工）。

## 深度分析

### 「Agent Teams」的本质是 harness 工程，而非多 agent 并发

文章提出了一个关键洞察：Agent Teams 不是让一堆 agent 坐在一起开会，也不是把 prompt 写成角色分配。真正有价值的 Agent Teams，拼的是外层那层 harness。

单 agent 面临三大核心问题：

1. **任务感知缺失**：复杂任务分 7 步，它做到第 3 步就不知道「是否继续」，因为对任务结束没有物理感知，只能在上下文里猜
2. **上下文腐烂**：日志、网页、报错、搜索结果一多，context 开始退化，前面的约束会遗忘，前面的风格可能改变
3. **线程混用**：用户想要秒回，后台任务需要几分钟到几十分钟，单 agent 把两个线程混在一起，要么秒回一堆废话，要么半天没动静

这些问题的根因不在模型智力，而在缺乏系统化的控制平面——这正是 [Harness Engineering](../ch05/117-harness-engineering.html) 要解决的核心问题。

### Claude Code Agent Teams：最像工程团队的协作范式

Claude Code 的 Agent Teams 最适合放在软件工程场景理解。它不是简单的 subagent（派出去查资料、回来给摘要、用完就没了），而是 teammate——长期在线的同事，有自己的 context，可直接与其他 teammate 通信，也可认领任务。

两大关键设计：

- **共享 task list**：任务不靠主 agent 用 prompt 记着，而是落在本地文件里，有状态、有依赖、有 claim 机制，多个 teammate 抢任务时用 file locking 防止竞态
- **mailbox**：agent 之间点对点发消息，而非广播到大群——前端 agent 需要问后端接口就发给后端，安全 reviewer 不需要 UI 细节就別污染它的 context

这与 [Claude Code 架构](../ch03/076-claude-code.html)中强调的「工程化协作」理念一致。限制在于：token 成本随 teammate 数量上涨，适合独立工作流并行，不适合同一个文件多人同时编辑。

### Kimi K2.5 Agent Swarm：规模化探索的并行引擎

Kimi K2.5 走的是另一条路线：自组织最多 100 个 sub-agents，执行最多 1500 次并行工具调用，端到端耗时最高降到原来的 1/4.5。

关键创新在于 PARL（Parallel-Agent Reinforcement Learning），让 orchestrator 学会「什么时候拆任务、什么时候并行、什么时候别为了并行而并行」，而非完全依赖人类提前写 workflow。这在人类不清楚资料分布、需要大范围撒网的任务（深度调研、竞品分析、批量网页处理）上非常有价值。

但 Swarm 不适合精细工程治理——在一个代码仓库里改 7 个模块，更需要权限、文件归属、测试门禁和可回滚的工程治理。Kimi 解决的是广度，而非深度。

### MiniMax Mavis：状态机驱动的产品化工作流

MiniMax Mavis 将单 agent 的真实痛点产品化：长任务突然停、context 变长后质量下降、复杂任务阻塞用户交互、prompt 角色扮演做不到真正分工。

其核心思路是状态机接管流程，把前台响应和后台执行拆开：

- **Owner**：拆任务和调度
- **Worker**：负责执行
- **Verifier**：独立验证（上下文与 Worker 隔离，避免被 Worker 的思路污染）

Worker 和 Verifier 的隔离是关键——Verifier 要像一个不近人情的质检，查链接、查事实、查格式、查代码是否真能跑。这对 Office 文档、长篇研报、业务流程类 agent 至关重要，因为这些任务不能只要「看起来像完成」，而是要能交付、能追溯、能被人接着用。

### Agent 选型的五个关键问题

文章以五个问题总结了 Agent Teams 的选型框架，对任何构建多 agent 系统的团队都有实操指导意义：

| 问题 | 为什么重要 |
|------|-----------|
| 任务状态是否落盘 | 不落盘，长任务迟早被 context 拖死 |
| agent 之间是否隔离 | 不隔离，多角色只是 prompt cosplay |
| 验证者是否独立 | 不独立，自检很容易变成自我安慰 |
| 高风险动作有没有验证 | 没有 approval gate，越自动越危险 |
| 成本有没有熔断 | 没有 retry 上限，账单会替你做决定 |

## 实践启示

1. **先看任务是否值得拆，再看 harness 管不管得住**：管不住，10 个 agent 只是 10 倍混乱；管得住，3 个 agent 就可能是真团队。不要为了用多 agent 而用多 agent。

2. **Harness 优先于模型选择**：在评估 Agent Teams 方案时，先考察其控制平面能力（任务队列、上下文隔离、权限分级、验证机制），再评估模型能力。更好的控制平面比更强的模型更能提升多 agent 系统的可靠性。

3. **场景决定架构**：代码工程选 Claude Code 路线（task list + mailbox），研究调研选 Kimi 路线（百级并行 swarm），产品化 agent 选 MiniMax 路线（状态机 + Owner-Worker-Verifier）。没有万能架构。

4. **独立验证者是质量底线**：无论采用哪种架构，确保验证者与执行者上下文隔离——自检是自我安慰，独立验证才是质量保障。

5. **Agent Teams 是基础设施而非功能**：不要把它当作产品上的一个 checkbox，而是要作为系统架构的一等公民来设计——从第一天就把 task 落盘、消息通信、权限门禁和成本熔断纳入设计。

## 相关实体

- [Claude Code 架构分析](../ch03/076-claude-code.html) — Claude Code 的深层架构拆解
- [Harness Engineering](../ch05/117-harness-engineering.html) — Agent 控制平面的系统方法论
- [Agent Orchestration](../ch04/499-agent-orchestration.html) — 多 agent 编排模式
- [Kimi K2 Agent Swarm](ch01/403-kimi.html) — Kimi 并行 agent 方案的技术细节
- [Agent 评测方法论](../ch03/046-agent.html) — 验证和评估 agent 系统的方法

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-vs-kimi-vs-minimaxagent-teams-到底拼的是什么.md)

---

