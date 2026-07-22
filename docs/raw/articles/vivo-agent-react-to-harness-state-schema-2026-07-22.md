---
source_url: "https://mp.weixin.qq.com/s/8Xsk2M-2Z3xg8vZdZWaitg"
title: "Agent 工程思考：从 ReAct 到 Agent Harness"
author: "vivo 互联网项目团队 - Ding Junjie"
ingested: 2026-07-22
sha256: "c4d6bbf24648c9d8f4ecea5841236cf1a08e3987095f8e6b16a3fec080f132f4"
source_platform: weixin
tags: [agent-harness, state-schema, react, runtime-fact, ui-boundary, agent-product, vivo]
---

# Agent 工程思考：从 ReAct 到 Agent Harness

> 作者：vivo 互联网项目团队 - Ding Junjie
> 公众号：vivo互联网技术
> 日期：2026-07-22

从 ReAct 出发，文章讨论 Agent 工程如何从"模型循环"走向 Harness：通过前后端共享的 State Schema、运行事实和 UI 边界，让模型行为变成可交互、可恢复、可控制、可追溯的产品能力。

## 01. Agent 不止是 model+loop

早期理解的 Agent 工程可以用伪代码表达：

```
while not done:
  reason
  act
  observe
```

这是 ReAct 的基本形态：Thought → Action → Observation 交替出现。但深入产品化后发现远远不够，真正产品会遇到一组运行时问题：

- 用户刷新后，工具审批还在吗？
- 工具执行到一半后端进程重启，从哪恢复？
- 子 Agent 在后台跑，主线程显示什么？
- 生成了 artifact，引用、状态、归属在哪？
- 用户点 stop，哪些取消哪些保留？

ReAct 不回答这些问题。Agent 产品需要一层工程系统：**把模型做过的事，落成可恢复、可控制、可展示、可验证的软件事实**。这层系统叫 **Agent Harness**。

## 02. ReAct 的解释边界

ReAct 最小单元：Thought → Action → Observation。这是模型行为抽象。

工程系统里单位换成：**event、state、checkpoint、control**。

一次工具调用在工程中拆成的事件序列：
```
run.started
message.created
assistant.text.delta
tool.call.created
tool.approval_required
tool.call.running
tool.call.completed
artifact.created
run.finished
```

关键区分：**ReAct 的 Observation 是给模型看的**（文本塞回上下文让模型继续想）；**产品系统需要给各消费方（用户、前端、存储、artifact 面板）一组可被系统引用的事实**。

如果 Observation 只剩文本，事实就没有权威来源：前端要从文本猜状态，后端要靠临时字段补状态，adapter 要把旧数据翻译成新 UI。

> ReAct 解释执行微循环；Harness 定义产品系统里的事实边界。

## 03. 事实从哪里来

「Agent = Harness + model」中的 Harness 最核心问题不是 skill 怎么装、MCP 怎么加载、记忆怎么设计，而是**事实应该在哪里产生**。

Harness 必须在运行路径上：tool call 开始、等待审批、执行完成、生成 artifact、写入 checkpoint — 这些节点都应该由 runtime 产生 event 和 state。用户的 approve/stop/resume 也应进入 runtime 的 control。

Agent Harness 至少要回答：
- 现在谁在运行？
- 运行卡在哪里？
- 哪个状态可以恢复？
- 哪个动作需要用户审批？
- 哪个结果可以被检查？
- 哪个 artifact 属于哪次运行？
- 哪个子 Agent 是谁派出去的？
- 用户可以发送哪些命令？
- 刷新、重连、进程重启后，系统如何回到同一现场？

**判断标准：同一运行事实，不应该从多个来源拼出来。** pendingApproval、artifactRef、canStop 应有明确归属 — 要么是 runtime state，要么是从 runtime state 派生的 view。

## 04. 从 Loop 到协议

产品化的 Agent 系统数据流：

```
runtime event → agent.state → agent.view → UI
user action → agent.control → runtime event
```

**三词定义：**

- **state = 事实**：由 runtime 和明确业务边界生产。例如：messages、activeRun、checkpoint、pendingApproval、todos、subagents、artifactRefs、workspaceContext。这些影响任务能不能继续、能不能恢复、用户能不能检查。
- **view = 派生**：从 state 算出来。例如：isBusy、canStop、approvalBanner、toolBadges。activeRun 存在 → 显示 busy；pendingApproval 存在 → 显示审批条。
- **control = 命令**：例如 invoke(input, stateSnapshot)、resume(approvalDecision)、stop(runId)、updateState(patch)、reload(threadId)。只负责发命令，不顺手改展示状态。

**边界：runtime 负责写事实，UI 负责读事实。Agent Harness 把这条边界固定成协议。**

## 05. State Schema 定义事实边界

开发 Agent 应先设计 **state schema**，而不是先设计 prompt、tool、模型选择。提前问：

- 哪些事实必须恢复？
- 哪些事实必须跨端一致？
- 哪些事实只是 view？
- 哪些事实是用户现场？
- 哪些事实可以从 messages 推导？
- 哪些事实必须成为一等状态？

**审批示例：** UI 上是按钮，runtime 里是可恢复暂停点。不应只在前端弹 modal（刷新会丢）。写成 state：

```
agent.state.pendingApproval = {
  id, runId, turnId, toolCallId,
  toolName, arguments, policy
}
```

用户点击批准 → `agent.control.resume({ approvalId, decision: "allow" })` → runtime 从 checkpoint 继续 → 写回新 state。

**artifact 示例：** 内容本体不进 state（属于文件系统/对象存储），但引用、状态、归属进 state：

```
artifactRef: { id, type, title, status, ownerRunId, createdByToolCallId, contentRef }
```

**子 Agent 示例：** 不只出现在文本里，应进 state：

```
subagent: { id, parentRunId, parentTurnId, title, status, startedAt, completedAt, resultRef, error }
```

**判断标准：影响恢复、审批、继续执行、跨端一致、审计和可检查结果的东西应进入 state。只改变展示方式的留在 view。**

## 06. UI 只能消费事实，不能补写事实

UI 负责渲染、交互、布局、流式展示和 view state。runtime fact 不属于 UI。

错误模式：runtime 没有写入 pendingApproval → UI 从 message 文本创建这个事实 → 刷新后丢 → 后端不知停在哪个 tool call。

**边界规则：runtime 写入 fact，UI 消费 fact。**

## 07. 系统要记得发生过什么

Harness 的含义：把 Agent 运行中的关键事实放进系统协议。

可检查的行为清单：
- 刷新后 pendingApproval 仍然存在且指向同一 toolCall
- 进程重启后能从 checkpoint resume 到同一 run/turn
- 用户 stop 后 activeRun 终止且后端不会继续执行
- artifactRef 存在时内容可定位、可追溯到 ownerRunId/toolCallId
- 子 Agent 完成后 parent turn 能拿到 resultRef

**ReAct vs Harness 分工：ReAct 解释模型怎样一步步决定下一步；Harness 保证这些步骤在软件系统里发生过、能恢复、可控制、可审计。**

## 08. 最后

Agent 产品的难点不止是写出一个会调用工具的循环。那个循环让模型"能动"，但用户真正依赖的是系统层面的确定性：刷新不丢现场、重启能恢复、该停就停、结果可定位、责任可追溯。

> ReAct 让模型动起来；Harness 让这件事在产品里可被信任。
