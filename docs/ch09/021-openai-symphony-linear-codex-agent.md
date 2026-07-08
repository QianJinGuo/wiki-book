# OpenAI Symphony：Linear 即 Codex Agent 控制平面

## Ch09.021 OpenAI Symphony：Linear 即 Codex Agent 控制平面

> 📊 Level ⭐⭐ | 17.9KB | `entities/openai-symphony-codex-orchestration-linear-control-plane.md`

## 核心论点

Symphony 是 OpenAI 在 2026-06 前后开源的 **Codex 编排规范**：把 **Linear 这种任务管理系统**变成 **coding agent 的控制平面**，让每一个开放任务都自动对应到一个独立 agent workspace，**从「人盯 session 干活」范式跃迁到「任务系统驱动 agent 干活」**。

仓库本质上只有一个 `SPEC.md`（问题与方案定义）+ 一个 `WORKFLOW.md`（开发流程）。参考实现用 Elixir（适合并发编排和进程监督），但核心思想与语言无关，OpenAI 让 Codex 用 TypeScript / Go / Rust / Java / Python 多种语言重写，以**反向找出 spec 里的歧义**。

> For every open task, guarantee that an agent is running in its own workspace.

## 背景：从「agent 写代码」到「管理一群 agent」

OpenAI 半年前做了一次激进实验：一个生产力工具项目里**仓库每一行代码都必须由 Codex 生成**。这件事跑通后，新的瓶颈出现——当 AI 已经能写代码时，**卡住团队效率的变成了「人类如何管理这些 AI」**。

**今日 coding agent 的矛盾**：单 agent 能力越来越强（网页 / CLI / IDE 都能跑），但使用方式仍以**交互式**为主——工程师要同时开三到五个 session，分别分配任务、检查输出、补充上下文、纠正方向，**上下文切换成本急剧上升**。OpenAI 观察到「**agent 本身很快，但整个系统并没有真正变快**」，形容为「**拥有一批能力很强的初级工程师，却让高级工程师一直在旁边逐个盯进度**」。

核心问题：**人类围绕任务、需求、工单、里程碑工作，但 AI 编程却围绕代码会话和 PR 组织**。Symphony 的解法是「**换视角**」——不再直接监督 agent session，让 agent **从任务管理系统里自动领取工作**。

## 核心机制：把 Linear 变成 Agent 编排器

Symphony 的设计原则是**极简**的：**把 Linear 这样的任务管理系统变成 coding agent 的控制平面**。

### 一、Issue ↔ Agent Workspace 一一映射

每一个打开的 Linear issue 都会**映射到一个独立的 agent workspace**。Symphony 持续监听任务看板，确保**每个活跃任务都有一个 agent 在循环推进**：

- agent 崩溃/卡住 → Symphony 重启它
- 出现新任务 → Symphony 自动接管并开始组织工作
- 状态从 `open` → `in progress` → `review` → `merging`，**每个状态都对应下一步动作**

**关键变化**：Linear 不再只是项目看板，而是**变成了 agent 工作流的状态机**。工程师不需要在多个终端窗口之间来回切换，**只需要在任务系统里看工作流推进**。

### 二、抽象层：Ticket 承载更大的工作单元

一个 issue 不一定只对应一个 PR——可能**跨多个仓库产生多个 PR**，也可能**只是调研、分析、整理方案，不修改代码**。任务被抽象到这个层面后，ticket 就能承载**更大的工作单元**。

复杂功能的标准流程：

1. agent 先**分析代码库 / Slack / Notion**，生成实施计划
2. 计划确认后，**拆出任务树**，定义阶段和依赖关系
3. 如果某任务被另一任务阻塞，agent **不会提前启动**；前置完成后再自动展开
4. 这就是一个**很自然的 DAG 并行执行过程**

OpenAI 给的例子：**React 升级被标记为依赖 Vite 迁移**，agent 会先完成 Vite 迁移，再开始推进 React 升级。

### 三、Agent 也能创造新工作

在实现或 review 过程中，agent 可能发现**性能问题、重构机会、更好的架构方向**。以前这些可能只是工程师脑子里的一个念头，现在 agent 可以**直接创建 follow-up issue**，交给团队后续评估和排期。

> 团队启动探索性任务的心理成本会大幅下降。你可以很便宜地让 agent 去试一个想法、验证一个假设、跑一个原型，不满意就丢掉。

## 产出与组织变化

### 500% PR 增长（前三周）

OpenAI 提到在一些团队里，**采用 Symphony 后的前三周，最终合入的 PR 数量提升了 500%**。但更值得关注的是**背后的工作方式变化**——**工程师不再把精力花在监督 Codex session 上**，每一次代码变更的感知成本都会下降。

### PM / 设计师直接参与

OpenAI 的产品经理和设计师**可以直接在 Symphony 中提交功能请求**——**不需要 checkout 仓库，也不需要管理 Codex session**，只要描述想要的功能，最后拿到一个 **review packet**（里面甚至包含**功能在真实产品中运行的视频演示**）。

### PR 护送到 Merging 状态

在大型 monorepo 里，Symphony 处理 **PR 合入前最后那段很烦的路**——持续盯 CI、必要时 rebase、解决冲突、重试 flaky checks，**把变更一路护送到 Merging 状态**。等 ticket 进入 Merging，团队对它最终进入主干已经有较高信心。

## 边界与设计教训

### 不适合所有任务

**高度模糊、需要强判断力和专家经验的问题**，仍然更适合**工程师直接和 Codex 交互**。Symphony 更适合处理**大量常规实现、迁移、修复、验证和探索工作**，让工程师把注意力留给**真正困难的问题**。

### 不要把 agent 当成状态机里的死板节点

OpenAI 早期只是让 Codex 实现任务，但很快发现**这太限制模型能力了**：

- Codex 可以**创建多个 PR**
- Codex 可以**阅读 review feedback 并继续修改**
- Codex 可以**借助 `gh` CLI、CI 日志读取技能等工具**，完成远超「写代码」的工作

> 所以 Symphony 后来更接近一种管理方式：**给 agent 目标、工具和上下文，让它自己推理和推进**。

## 技术底座

### 极简仓库结构

Symphony 仓库本质上**只有一个 `SPEC.md` 文件**（一份对问题和预期方案的定义）+ 一个 `WORKFLOW.md`（开发流程规范）。OpenAI 用来反向验证 spec：

- 参考实现用 Elixir（**适合并发编排和进程监督**）
- 核心思想**与 Elixir 无关**
- 让 Codex 用 **TypeScript / Go / Rust / Java / Python** 重写 Symphony
- 通过这些实现**反向找出 spec 里的歧义**，再继续简化系统

`WORKFLOW.md` 把很多过去靠经验和口口相传的步骤**显式写下来**：如何领取 issue、如何 checkout repo、如何移动状态、如何创建 PR、如何进入 Review、如何附加视频证明。

### Codex App Server（headless + JSON-RPC）

技术底座上的关键是 **Codex App Server**——让 Codex 可以在 **headless 模式下运行**，并通过 **JSON-RPC API** 被程序化调用：

- 启动 thread
- 响应 turn
- 接入外部系统

OpenAI 还使用 **dynamic tool calls** 暴露 `linear_graphql` 这类能力，让子 agent 可以执行必要的 Linear 请求，**同时避免直接暴露访问 token**。

## 普通团队的落地建议

> 对普通团队而言，与其照搬 Symphony，不如**先把自己的工作流文档化**：任务如何进入开发、PR 如何评审、CI 如何处理、验收结果如何证明、失败后如何重试。

> 当这些流程能被写成清晰的规范，agent 才有机会真正接入团队日常工作，而不是停留在一个个临时打开的聊天窗口里。

**下一阶段的关键能力**已经从**提升单个 Agent 的代码编写水平**，升级为**构建一组 Agent 围绕真实工程流程的稳定协作**。

## 与本 Wiki 其他编排方案的关系

| 维度 | Symphony | Coze 3 多 Agent 编排 | Hermes Kanban Worker | Oz Multi-Harness |
|------|----------|---------------------|---------------------|------------------|
| 控制平面 | **Linear（任务系统）** | 对话流编排图 | Kanban 看板 + worker 队列 | 云端多 harness 调度 |
| Agent 单位 | **每个 issue ↔ 一个独立 agent workspace** | 节点 / 边 / 循环 | 单 worker 子任务 | 独立 harness 池 |
| 适合规模 | **大规模 monorepo + 持续 PR 流水线** | 中小团队业务自动化 | 中等批量任务 | 大规模多角色云端 |
| 核心抽象 | **任务状态机 + 流程文档化** | DAG 可视化 | 任务分配与心跳 | 隔离的运行时沙箱 |
| 工程流程 | **显式 WORKFLOW.md 文档驱动** | 内置节点模板 | 内置 worker 模板 | harness 模板 |

- 对话流主导（Coze 3）→ 任务系统主导（Symphony）→ Kanban 调度（Hermes）→ 云端沙箱（Oz）的演进，是「**从编排对话到编排工作流**」的范式递进
- Symphony 强调的「**任务系统驱动 agent 干活**」与 [agent orchestration](../ch04/472-agent-orchestration.html) 的核心一致，但**控制平面从代码 session 切到了任务管理系统**

## 深度分析

1. **控制平面从"对话驱动"到"状态驱动"的范式跃迁**
   Symphony 的本质变革不是让 Codex 写更多代码，而是将控制权从人类的交互式 session 转移到任务管理系统的状态机。Linear 从项目看板升级为 agent 工作流的状态机——每个状态（open / in progress / review / merging）都对应明确的下一步动作，人类角色从「监督者」退化为「审核者」。这与传统的 agent session 管理有本质区别，代表了 AI 编程组织模式的结构性转变。

2. **Ticket 抽象层解锁了更大的工作单元**
   当 issue 不再绑定单一 PR，而是承载跨多个仓库的多个 PR，或纯粹做调研/分析时，ticket 成为真正的工作单元而非代码提交。这种抽象让 DAG 并行执行自然出现——被依赖的任务阻塞时 agent 不会提前启动，前置完成后续自动展开。OpenAI 的 React 升级依赖 Vite 迁移的例子说明，任务依赖关系可以被 agent 正确理解和执行。

3. **探索性任务成本的结构性降低**
   agent 在实现或 review 过程中可以直接创建 follow-up issue，使团队启动探索性任务的心理成本大幅下降。这改变了创新的经济学——让 agent 以极低成本试一个想法、验证一个假设、跑一个原型，不满意就丢掉。人类只需在最后判断是否值得保留，而非全程参与每一个探索方向。

4. **多语言反向验证：规范即产品**
   OpenAI 用 TypeScript / Go / Rust / Java / Python 重写 Symphony 的做法，本质上是一种通过实现压力测试来精化规范的方法。spec 不是代码的说明书，而是通过多语言实现反向找出歧义再简化系统的工具。最终沉淀的核心极度朴素（"For every open task, guarantee that an agent is running in its own workspace"），但这个朴素的背后经过了大量实现验证。这是一种「规范优先」而非「实现优先」的工程哲学。

5. **Headless Codex + JSON-RPC + Dynamic Tool Calls 的架构三角**
   Codex App Server 的 headless 模式通过 JSON-RPC 被程序化调用，配合 dynamic tool calls 暴露 `linear_graphql` 等能力，既实现了与外部任务系统的集成，又通过动态工具避免了直接暴露访问 token。这套三角揭示了规模化 agent 集成的关键技术路径：让 agent 在隔离环境中运行，通过结构化接口与外部系统通信。

## 实践启示

1. **从工作流文档化开始，而非直接套用 Symphony**
   在接入 agent 之前，先将团队的工作流显式写下来：任务如何进入开发、PR 如何评审、CI 如何处理、验收结果如何证明、失败后如何重试。当这些流程能被写成清晰的规范，agent 才有机会真正接入团队日常工作，而不是停留在临时聊天窗口里。

2. **设计 ticket 时考虑更大工作单元，而非绑定单一 PR**
   Issue 设计应避免过度拆分，让 ticket 能够承载跨仓库的多个 PR，或纯粹做调研/分析的工作。这样 Symphony 的 agent 才能真正发挥 DAG 并行执行的优势，而不是陷入大量细碎任务的上下文切换。

3. **将任务看板重新设计为状态机**
   每个状态转换应有明确的下一步动作和进入条件，而非仅仅作为进度标识。例如当 ticket 从 review 进入 merging 时，应自动触发 CI 重试、冲突解决、rebase 等一系列保护动作，让 ticket 真正成为工作流的驱动核心。

4. **拥抱 agent 的主动性，预留 follow-up issue 空间**
   允许 agent 在发现性能问题、重构机会或更好架构方向时直接创建 follow-up issue。这需要团队在文化上接受「agent 也是工程队友」的定位，并在任务管理系统的容量规划中预留探索性任务的空间。

5. **用 SPEC.md + WORKFLOW.md 将隐性流程显式化**
   将过去靠经验和口口相传的步骤写成显式规范，让 agent 有可执行的流程可循。这是 Symphony 最重要的方法论输出：对普通团队而言，写清楚规范比选哪个工具更重要。

## 关键参考资源

- 原始 OpenAI 发布：[An open-source spec for Codex orchestration: Symphony](https://openai.com/index/open-source-codex-orchestration-symphony/)
- GitHub 仓库：[openai/symphony](https://github.com/openai/symphony)
- 配套技术底座：Codex App Server（headless + JSON-RPC）

## 相关实体
- [Figma Make Local Code](../ch03/047-figma-make.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openai-symphony-codex-orchestration-linear-control-plane-tutuai.md)

---

