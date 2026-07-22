# Codex /goal 实现拆解：长任务 Agent 不只是多跑几轮

## Ch04.190 Codex /goal 实现拆解：长任务 Agent 不只是多跑几轮

> 📊 Level ⭐⭐ | 11.8KB | `entities/codex-goal-implementation-breakdown.md`

## 文章背景
书接上文《长周期 Agent 详解：从 Ralph Loop 到可接管 Harness》，这次从里面看 Codex `/goal` 的源码实现。
核心论点：`/goal` 补的那块东西更靠底层——把一个长期目标放进了 Codex 的运行时里。目标有状态，过程有记账，完成要审计，预算到了要收束。

## 任务变大以后，问题会换一批
Karpathy 在 Sequoia AI Ascent 2026 提到，2025年12月前后 agentic coding 出现明显变化：模型输出的代码块更大、更连贯、更可靠，任务单位从"局部补全"变成"一段流程"。
**局部任务 vs 流程任务：**
| 局部任务 | 流程任务 |
|---------|---------|
| 写一个函数 | 读仓库 |
| 补一个测试 | 理解目标 |
| 解释一段报错 | 改多个文件 |
| 改一个页面细节 | 跑测试 |
| 生成一段脚本 | 根据失败继续修 |
流程任务里，Agent 已经进了工作现场。它读什么、改什么、什么时候停、怎么证明做完，都会影响最终质量。
**核心问题**：Agent 在什么样的环境里写代码？——目标、上下文、工具、权限、预算、验证、审计、回滚。

## /goal 的三层设计
### 第一层：目标持久化
目标不再只是聊天上下文里的一段文字。它进入了 **state-db**，有自己的状态、预算、token记账、wall clock记账，也能被外部mutation修改。
目标一旦变成 thread 上的状态，运行时可以处理：

- 当前目标是不是 active
- 是否被 paused
- 消耗了多少 token 和时间
- 是否到了 budget limit
- 完成时是否要发出 goal update
- thread resume 后怎么恢复
- 空闲时要不要继续推进

### 第二层：运行时生命周期
`goals.rs` 里的 `GoalRuntimeEvent`：`TurnStarted` → `ToolCompleted` → `TurnFinished` → `MaybeContinueIfIdle` → `TaskAborted` → `ExternalSet` → `ExternalClear` → `ThreadResumed`
`/goal` 在每个运行边界上问：

- turn 开始时，当前有没有 active goal
- 工具执行后，token 和预算怎么记
- turn 结束后，是否需要自动续跑
- 用户中断时，要不要暂停目标
- 外部改了 goal，运行时状态怎么同步
- thread 恢复后，目标还在不在
- 空闲时，是否应该启动一个 continuation turn

### 第三层：完成审计和预算收束
**完成判断**：续跑 prompt 里反复提醒模型：

- 不要把完整目标缩小成当前容易完成的小目标
- 要基于当前 worktree 和外部状态
- 聊天历史可以帮忙定位，但不能替代当前状态
- 每个要求都要找到证据
- 文件、命令输出、测试结果、PR状态、运行行为，都要按要求检查
- 证据弱、不完整、间接、只是看起来一致，都不能算完成
- 只有每项要求都有证据证明，才可以把 goal 标成 complete
**预算收束（budget_limit.md）**：到点了，别开新工作，把进展、剩下的事、阻塞、下一步整理出来。

## Goal 和 Loop 的核心差别
| 维度 | 普通 loop | Codex /goal |
|------|----------|-------------|
| 目标位置 | prompt、脚本或文件里 | thread goal 和 state-db |
| 续跑方式 | 结束后再喂同一目标 | 空闲时触发 continuation turn |
| 状态边界 | 通常靠脚本约定 | active、paused、complete、budget_limited |
| 完成判断 | 模型自报或脚本约定 | completion audit 后 update_goal complete |
| 预算控制 | 外部粗略限制 | token 和 wall clock accounting |
| 中断恢复 | 依赖脚本和临时文件 | runtime event 同步状态 |
**核心差别**：loop 主要是在外部把 Agent 拉回来；goal 是把目标放进系统内部，让运行时知道它的状态。
**关键细节**：源码里给模型暴露的 `update_goal` 工具，状态参数只接受一个值：`complete`。模型可以宣布"我做完了"，但没法自己宣布"我超预算了"，也没法把状态改成"差不多"。退路是被运行时收掉的。

## 工作现场六组件
1. **目标**：不是一句愿望，要说清范围、约束、验收方式、停止条件。`/goal` 把它从 prompt 提到了 thread 上。
2. **上下文**：是当前推理的工作集，不是聊天记录，也不是资料柜。Agent 用什么就放什么，按需读取比一股脑塞进来更稳。
3. **工具**：是 Agent 接触真实系统的接口。名字要清楚，参数要有边界，错误消息要能指导下一步，危险动作要有权限。`/goal` 示范了：连模型自己改写状态的工具，参数都被收紧到只能传 `complete`。
4. **状态**：计划、进度、预算、完成标记、失败记录、恢复点，得落在模型外面。`/goal` 落在 state-db 里。
5. **验证**：测试、构建、lint、日志、PR状态，比"模型说完成了"靠谱。`/goal` 的 continuation 模板在这一层做了协议化的约束。
6. **收束**：暂停、预算耗尽、中断、失败、交接，都得有可读的输出。`/goal` 用 budget_limit 模板处理这件事。

## 从 /goal 源码可以搬回去什么
### 第一个：把目标做成 thread 上的对象
让"目标"在系统里有名字、有状态机，不只是 prompt 拼接的副产品。即使不用 Codex，自己写编排时也值得照搬。

### 第二个：把"完成"做成审计，不要做成开关
只暴露一个 `complete` 开关，说明系统不打算让模型轻易关掉自己；同时拉高门槛，逼它把"差不多"翻译成"哪些要求、哪些证据"。

### 第三个：专门给"停"留一份模板
budget_limit 那份很短：到点了，别开新工作，把进展、剩余工作或阻塞、下一步整理出来。把停下来本身当成一种状态，要有自己的协议。

## 工程师的新杠杆
Karpathy 说 10x 工程师可能已经不够看了。
两种工程师用的是同一类工具，但手里的杠杆不一样：

- **前者**：把需求一股脑丢给 Agent，然后等它吐代码
- **后者**：把同一个需求改写成一份清楚的 spec，知道哪些上下文要给、哪些工具和权限要收紧，让 Agent 先做小切片，再用测试和日志做反馈，能看懂 diff，也能在预算耗尽时把现场整理回来
两个人用的是同一类工具，但手里的杠杆不一样。前者是在使用 Agent。后者是在为 Agent 搭工作系统。
**Karpathy 那句话**：可以外包思考，但不能外包理解。
**补充**：可以把很多执行交给 Agent，但别把工作现场交给运气。

## 深度分析
### 从"工具调用"到"系统设计"的范式转移
Codex `/goal` 的实现揭示了一个深刻转变：Agent 系统设计正在从"如何让模型更好地调用工具"演进到"如何在运行时层面管理长期任务状态"。传统 Agent 框架关注的是"模型输出什么 action"，而 `/goal` 关注的是"整个任务在系统生命周期中如何被管理"。
这意味着架构重心从 **推理层**（模型在想什么）转向 **运行时层**（系统在管什么）。目标状态化、预算显式化、完成审计化——这些都不是模型能自己想到的，必须在系统层面显式建模。

### "完成"作为状态而非信号的深层含义
大多数 Agent 系统让模型自己判断"做完了"，这是一个信号式设计。Codex 强制 completion audit，本质上是把"完成"从**信号**变成**状态**。信号可以被模型随意发出，状态必须被证据链支撑才能到达。
这个设计的精髓在于：模型无法单方面宣称完成——它只能向审计系统提交证据，由审计系统决定是否可以关闭目标。这避免了"模型自认为做完但实际没做"的置信度错配问题。

### 预算收束作为一等公民
大多数 Agent 系统把"超时"当作错误处理。Codex 的 budget_limit 是一个专门的输出模板，包含：进展、剩余工作、阻塞、下一步。这把"停"本身当成一个有意义的状态输出，而不是失败。
这对长期任务至关重要：Agent 可能因为合理原因没做完（外部依赖、数据问题、需求变更），这时候最重要的输出不是"失败了"，而是"做到了哪、卡在哪、下一步是什么"。

## 相关链接
- [Codex Goal Agent Runtime](ch04/106-codex-goal-agent.html)

## 实践启示
### 1. 给每个长期任务配备"状态记录"机制
不要让目标停留在 prompt 里。建立显式的任务状态记录，至少包含：目标描述、当前进度、消耗资源（token/时间）、完成条件、阻塞项。即使不自己写 state-db，也可以用文件或数据库记录状态。

### 2. 把"完成"设计为可审计的状态转换
实现一个 completion audit 流程，要求模型在宣称完成前必须提供：每项要求的验收证据、当前状态快照、任何无法完成项的说明。禁止模型直接单方面关闭任务。

### 3. 为"合理的停"设计标准输出格式
当任务因为资源限制或外部原因需要停止时，输出应该包含：已完成部分、剩余部分、阻塞原因、建议下一步。不要让停止等同于失败。

### 4. 用"工作现场六组件"审视现有系统
检查你的 Agent 系统是否对以下每个组件都有显式建模：目标（是否结构化？）、上下文（是按需还是全量？）、工具（权限是否收紧？）、状态（是否在模型外部？）、验证（是否有自动化验证？）、收束（停止协议是什么？）。

### 5. 优先"为 Agent 搭工作系统"而非"让 Agent 自驱"
工程师的价值不在于使用 Agent，而在于设计 Agent 的工作系统：一个有边界的环境，有明确的目标结构，有可验证的完成标准，有预算意识，有收束协议。这是 10x 工程师到 Agentic Engineer 的进化路径。

## 相关资源
- [Karpathy: Sequoia Ascent 2026 summary](https://karpathy.bearblog.dev/sequoia-ascent-2026/)
- [OpenAI Codex /goal 官方用例](https://developers.openai.com/codex/use-cases/follow-goals)
- [OpenAI Codex goals.rs 源码](https://github.com/openai/codex/blob/main/codex-rs/core/src/goals.rs)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/2026.md)

- [Martin Fowler: Harness engineering for coding agent users](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
---
*本文为若飞 @ 架构师（JiaGouX）原创，发表于 2026-05-14*

---

