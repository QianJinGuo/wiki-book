---
title: "DeepSeek Harness 和 Pi 的 Agent Loop 循环结束判断架构细节解析"
source_url: "https://mp.weixin.qq.com/s/1NWC0Qk-bDkvr8QIVPr1Zg"
source_name: "架构和远方"
author: "潘锦"
type: "raw"
created: 2026-08-30
ingested: 2026-09-06
tags: [deepseek-harness, pi, agent-loop, loop-termination, turn-state-machine, step-debt, tool-conclusion, cancellation, goal-driver, event-sourcing, architecture]
sha256: 60042fa3201c676dbdae4098eed985d65344a77b278c5dc1820f236143ee0398
---

# DeepSeek Harness 和 Pi 的 Agent Loop 循环结束判断架构细节解析

> 账号：架构和远方 | 作者：潘锦 | 源码级拆解 DSH 0.1.2-alpha.1 与 Pi (pi-agent-core) 的 Agent Loop 结束语义

## 开场：结束判断为什么难

本篇文章代码基线采用 DeepSeek Harness 版本 0.1.2-alpha.1，提交时间为 2026 年 8 月 28 日；Pi 采用 853a80d2。这里的 Pi 指 pi-agent-core 中的官方 Agent Loop。

就循环究竟在什么时刻结束这个问题，很多 Agent 框架把结束判断写成一个条件：`while(hasToolCalls) { // ... }`。在 Demo 中这种循环也够用。进入生产环境后，你会发现会很多问题：

- 模型没有调用工具，是否代表任务完成？
- 工具执行完了，模型是否还需要解释结果？
- 用户在工具执行期间发来 steering，应该进入当前轮还是下一轮？
- 输出触达 token 上限后，工具参数还能不能执行？
- 某个工具宣布任务完成，其他并行工具怎么办？
- Agent 进入 idle 后，Goal Driver 能不能再次唤醒它？
- Plan mode 退出，是结束当前循环，还是切换下一次请求的策略？
- 进程崩溃后，日志里尚未闭合的 turn 应当如何解释？

DeepSeek Harness 和 Pi 的工程路线不同，或者说 DeepSeek Harness 更复杂，也更能满足复杂场景的需求。DeepSeek Harness 将结束拆成多层状态，并把事件日志作为重建依据。Pi 保留了更扁平的循环结构，把 steering、follow-up 和 post-turn stop 暴露成回调。前者适合多插件、持久恢复和长期任务；后者适合轻量嵌入，控制路径也更容易读懂。两种实现都能工作。它们承担的系统复杂度不同，结束语义自然不会相同。

## 五层边界

讨论 Agent Loop 时，我们需要先定义好「结束」，否则代码里的 completed、turn_end、agent_end 很容易被混为一谈。DeepSeek Harness 实际存在五层边界。

**第一层是模型请求结束。** Provider 流式输出完成，可能给出正常停止、工具调用、最大 token、错误或取消。这里的判断逻辑是：当前 HTTP 请求或模型流结束了吗？

**第二层是 step 结束。** 一个 step 包含一次模型调用，以及该响应发起的一整批工具执行。工具执行结束后，step 才算关闭。模型若调用了普通工具，系统通常还欠一次模型回访，因此 step 结束不代表 turn 结束。

**第三层是 turn 结束。** DeepSeek Harness 中，一个 turn 可以包含多个 step：

```
用户输入 → 模型调用 → 工具批次 → 模型回访 → 工具批次 → 模型最终输出
```

以上为一个 turn。turn 结束需要同时满足两项条件：① 模型不再欠一次回复；② next-step inbox 没有待处理输入。

**第四层是 driver activity 结束。** 一个 driver 可以连续处理多个 turn。当前 turn 关闭后，如果 inbox 里还有普通 follow-up，driver 会直接打开下一 turn。只有队列耗尽，driver 才回到 idle。

**第五层是长期工作流结束。** Goal Driver 可以监听 idle，检查持久 Goal 状态，再调用 followup() 开启新 turn。Plan mode 也可能跨越多个 turn 持续生效。因此，idle 只描述当前 activity；它无法回答长期目标是否完成。

Pi 的层级少一些。一次 assistant 响应与随后执行的工具批次，会对应一个 turn_end。工具回访模型时，Pi 再开启下一次 turn。内部队列耗尽后发出 agent_end，当前 invocation 至此结束。

从语义上看：DeepSeek Harness 的 step 接近 Pi 的 turn；DeepSeek Harness 的一次 driver activity 接近 Pi 的一次 Agent Loop invocation；DeepSeek Harness 的 Goal Round 位于 driver activity 外层；Pi 的长期 Goal 通常由宿主或扩展继续调度。术语相似，粒度相差一层。如果日志消费端忽略这一点，统计出的 turn 数、工具往返次数和任务完成率都会失真。

## 驱动收敛

DeepSeek Harness 的入口：`while (await this.turn()) {}`。turn() 返回 true，driver 继续处理下一 turn；返回 false，driver 收敛；抛出异常时，异常会被 driver 边界容纳，随后进入 idle。

短代码背后有一套完整的 phase 状态机：idle / maintenance / running。

running 保存：当前 turn、当前 step、AbortController、wakeRequested。

maintenance 同样持有取消信号和唤醒锁存，只是对外状态仍显示为 idle。这种设计解决了一个经常被忽略的竞态：Agent 处于维护任务时收到新消息，新消息不能立即启动第二个 driver，也不能静默丢失。系统先将唤醒意图锁存，维护结束后检查 inbox，再决定是否重启。

取消路径也有类似处理。如果一个 waking input 到达时，现有 activity 已经被 abort，这条消息会被重分类到 next-turn。它不能加入一个正在收敛的旧 turn。send() 在插入 inbox 前读取 aborted 状态，避免 inbox observer 触发重入取消后改变分类结果。这段细节很像传统并发状态机，而不是常见的聊天循环。它处理的是输入归属问题：一条消息必须属于当前 step、下一 step 或下一 turn，重入事件不能改变已经作出的边界判断。

whenIdle() 也没有简单等待某个固定 Promise。它反复比较 activityDone：

```js
do {
  await (activity = this.activityDone)
} while (activity !== this.activityDone)
```

等待期间如果 activity 被新的 driver 替换，调用方会继续等待。否则 whenIdle() 可能在旧 driver 结束、新 driver 已经启动的窗口里提前返回。在多插件环境中，idle 是一个可观察状态，也是一种同步承诺。这个承诺需要覆盖重启竞态，不能只看某次异步任务是否 resolve。

## Turn 状态机

DeepSeek Harness 在领取输入之前写入 turn/start。pre-step 可能拒绝输入，系统提示组装可能抛错，首步消息也可能被插件改写为空。无论发生哪种情况，日志中都存在一个完整 turn，并由唯一的 turn/end 收口。

turn 内部维护两个变量：turnEnds（当前已知的结束原因）；target（本轮 pre-step 应领取 next-turn 还是 next-step）。

第一个 step 从 next-turn 开始。后续 step 转向 next-step。普通用户 prompt 因此拥有独立 turn，工具附加上下文、运行时 context 和 steering 则可以进入当前 turn 的下一 step。

一次循环大致经历以下过程：创建 step 编号 → 从 inbox 领取消息 → 组装系统提示和运行时 context → 执行 agent/pre-step → 记录 step/start → 写入 user/message → 调用模型并执行工具 → 记录 step/end → 判断是否继续。

如果 agent/pre-step 返回 reject，turn 以 blocked 结束，模型不会被调用。如果首个 step 的消息为空，turn 以 completed 结束，也不会消耗模型请求。这覆盖了一个边缘场景：wakeup 已经打开 turn，随后消息被移除，或者 pre-step 插件把消息改写为空。边界既然已经建立，日志仍需闭合。如果某个 step 已经产生结束结果，但下一次 pre-step 没有消息，循环退出。若仍有消息，就继续执行。

这里需要留意 turnEnds 与 stepEnd 的关系。step() 可以返回：completed、max-tokens、null。null 表示工具执行完毕，模型还欠一次回复。它是继续循环的协议状态，和错误、未知结果没有关系。

turn 的结束判断由「模型债务」与「消息债务」共同决定。模型债务来自 tool call，消息债务来自 inbox。只检查其中一项都会出错。

## 停止钩子

DeepSeek Harness 在 turn 准备收口时触发 agent/turn-stopping。这个扩展点没有返回 true 或 false。插件如果希望 turn 继续，需要向 next-step 写入消息。hook 执行完成后，核心循环重新检查 inbox：

```
turn 已经可以结束
→ next-step 为空
→ 触发 agent/turn-stopping
→ 再次检查 next-step
→ 为空则关闭
→ 非空则进入下一 step
```

这是数据驱动的方式。多个插件都能监听 stopping。如果采用 shouldContinue(): boolean，组合规则会立刻变得棘手：任意插件返回 true 就继续？所有插件都返回 true 才继续？后执行的插件能否覆盖先执行的结果？插件决定继续，却没有提供下一步输入，模型该看到什么？插件决定停止，但另一个插件已经排入 steering，谁的优先级更高？

DeepSeek Harness 用 inbox 消除了大部分布尔值合并问题（这个设计和 Golang 的竞态处理逻辑类似，使用类似消息队列来处理竞态）。继续执行必须产生一条可消费的数据。最终判定依赖队列状态，而非插件调用顺序。

当然，这也是需要代价的。插件作者需要理解 inbox target、turn 边界和 wakeup 语义。一个简单的「再跑一次」操作，需要构造 UserMessage 并写入正确队列。框架学习成本高于直接回调。这种成本在单体应用里可能显得繁琐。进入可恢复、多插件、可审计系统后，显式消息通常比隐式布尔控制更可靠。日志和调试工具能看到「为什么继续」，而不是只看到某个 hook 曾经返回 true。

## Step 债务

step() 最关键的职责，是判断模型是否还欠一次回复。

模型流结束后，BlockAssembler 给出 finish 状态。如果 finish 是 error 或 aborted，系统先触发 agent/request-error waterfall。插件可以选择 retry。没有 retry 动作时，代码抛出结构化 LlmError。

正常组装出 assistant message 后，判断顺序如下：

1. finish 为 max-tokens，返回 max-tokens；
2. 没有 tool call，返回 completed；
3. 存在 tool call，执行整批工具；
4. 工具批次声明 concluded，返回 completed；
5. 普通工具批次返回 null。

顺序不能随便改。最大 token 状态在工具解析之前返回，因此响应中即使出现 tool call，也不会被执行。截断输出可能包含不完整的 JSON 参数。某些流式解析器会尝试补全 JSON，补全后甚至能通过 schema 验证，但语义字段可能已经缺失。执行这类调用会产生真实副作用。

DeepSeek Harness 的选择偏保守：整轮以 max-tokens 收口，等待外部策略决定是否继续。

Pi 采用另一种处理。stopReason === "length" 且消息包含工具调用时，它会给所有工具生成错误结果，说明参数可能被截断，没有实际执行，然后把这些结果交回模型。模型有机会在下一 turn 重发完整调用。

两者的恢复能力不同。DeepSeek Harness 保留了清晰的 durable turn reason，运维侧能准确识别 token ceiling。自动继续需要 Goal Driver、用户输入或其他插件参与。Pi 更倾向在当前 invocation 内自我修复，模型可能马上重发工具调用。

作者判断：在具有写操作的 Agent 中会选择 DeepSeek Harness 的策略。达到输出上限本身意味着模型状态不完整，自动延续可能重复前一批操作。只读研究型 Agent 可以采用 Pi 的方式，失败工具结果能减少一次人工干预。

## 粘性结果

DeepSeek Harness 的 max-tokens 具有粘性。某个 step 达到上限后，插件仍可能在 turn-stopping 阶段补入 steering，让 turn 再执行几个 step。后续 step 即使正常完成，最终 turn/end 仍然保留 max-tokens。判断逻辑是：

```js
if (
  turnEnds === null ||
  turnEnds.kind !== 'max-tokens'
)
  turnEnds = stepEnd
```

这里记录的是整个 turn 的质量，而非最后一次 step 的结果。如果不做粘性处理，可能产生如下日志：step 1: max-tokens / step 2: 插件要求继续 / step 3: completed / turn/end: completed。消费端会丢失曾经发生的截断。监控系统无法统计 token ceiling，Goal Driver 也可能把这轮当成完整成功并继续自动调度。

把 turn reason 视为聚合结果后，合并规则就需要专门设计。DeepSeek Harness 当前只对 max-tokens 做了优先保留。错误和取消会直接离开主流程，不参与后续合并。如果未来加入诸如 partial、policy-warning、budget-exhausted 等状态，简单覆盖会越来越脆弱。更稳妥的方向是为 reason 建立显式优先级或累积 facts，再由投影层生成最终 reason。当前 union 规模尚小，现有实现足够清楚。

## 工具收口

DeepSeek Harness 允许工具通过结果上的 concludesTurn 宣布当前 turn 可以收口。

工具批次采用 OR 聚合：任意一个已提交结果 concludesTurn === true → 整批 concluded === true。它表达的是「模型默认不再欠一次工具结果回访」。

concludesTurn 没有直接打断同批工具，也没有清空 next-step：已启动的并行工具继续运行；结果按模型调用顺序提交；additionalContexts 写入 next-step；同期到达的 steering 也写入 next-step；只要 next-step 非空，turn 仍会进入下一 step。

因此，工具结束能力属于软收口。它取消了自动回访债务，无法压过已经存在的消息债务。这套语义适合权威型工具。例如某个交互工具已经取得用户最终决定，或者某个提交工具已经完成不可逆事务，模型没有必要再生成一段中间解释。工具可以建议收口，同时保留系统上下文和用户 steering 的优先级。

Pi 的工具终止采用 AND 聚合：

```js
return finalizedCalls.length > 0 &&
  finalizedCalls.every(
    finalized => finalized.result.terminate === true
  )
```

只有非空批次中的每个 finalized result 都带有 terminate: true，整批才终止。并行批次中，一个工具不应单方面吞掉其他工具结果。Pi 要求整批达成一致，语义更保守。DeepSeek Harness 允许一个权威工具宣布收口，扩展能力更强，也更依赖工具契约。

选择 OR 还是 AND，取决于 terminate 的业务含义。如果它代表「任一工具发现全局终止条件」，OR 合理，比如用户取消、权限拒绝、事务已完成。如果它代表「当前工具不需要模型处理自己的结果」，AND 更稳妥，因为其他工具可能仍需模型解释。

DeepSeek Harness 通过 next-step 上下文缓和了 OR 的侵略性，但无法覆盖所有情况。假设两个并行工具都成功，一个写数据库并 concludes，另一个返回一份需要模型分析的报告，又没有追加 context。模型回访会被跳过。工具注册规范需要限制哪些工具可以 conclude，不能把它当成普通便利字段。

## 顺序提交

DeepSeek Harness 的工具调度器还有一项容易被忽略的约束：执行可以并行，提交保持模型顺序。

调度器维护：nextToStart、started、committed、inFlight、按调用位置排列的 slots。并行工具完成时，只把结果放入对应 slot。commitReady() 从 committed 开始，连续提交已经就绪的结果。后面的工具先完成，也要等待前面的 slot。

这会增加尾部等待时间，但能保证：tool/result 顺序稳定、additional context 顺序稳定、replay 结果稳定、插件观察顺序稳定、同一模型响应在多次运行中的日志结构更一致。

模型生成了 A、B、C 三个调用。若 C 最先完成，直接提交 C 会让后续上下文受网络时序影响。对于事件溯源系统，这类非确定性会扩大恢复和测试成本。

Pi 的并行执行也使用 Promise.all 保留输入数组顺序，最终 tool result message 按原调用顺序发出。两套系统都接受并行执行带来的延迟收益，同时拒绝完成时序污染模型上下文。

DeepSeek Harness 额外支持动态重分类。并行池补充新任务前，会重新读取工具当前 execution mode。前一个工具可能修改注册表，使后续工具从 parallel 变成 exclusive。调度器会停止补充，等待当前池排空，再把 exclusive call 留给下一个 barrier。这种灵活性会增加 scheduler 状态数量。适合「工具本身能改变工具环境」的 Harness。工具目录完全静态时，预先分组会更简单。

## 取消语义

工具执行期间的取消，比模型流取消复杂得多。DeepSeek Harness 的原则可以概括成三条：停止补充尚未启动的调用；清空已经启动的调用；为因取消而跳过的工具写入合成错误结果。

已启动工具可能已经产生副作用，框架不能假装它没有运行。调度器等待这些调用 settle，并按模型顺序提交结果和 additional contexts。

未启动工具则写入一对完整事件：tool/call → tool/result(error: aborted before dispatch)。这样可以维持模型工具协议的配对关系。恢复和 replay 时，每个模型产生的 tool call 都有对应结果。

内部 scheduler failure 的处理更克制。它停止新 dispatch，等待已经启动的调用结束，然后抛出第一个失败。它不会为剩余调用伪造结果。因为 scheduler failure 与用户取消不同，系统无法确认未提交调用处于什么语义状态。伪造恢复结果可能掩盖调度器缺陷。这里体现出事件日志的核心要求：日志不只服务 UI，它还是恢复协议。任何 synthetic event 都需要有确定语义。为了让数组长度好看而补事件，会污染后续决策。

Pi 的实现更偏运行时事件流。工具执行异常会被转换成 error tool result，随后继续进入上下文。取消时顺序模式会在每次工具后检查 signal，平行模式也会停止准备后续调用。它的核心目标是把本次 invocation 的 message stream 完整交给调用方，持久日志的闭合约束没有 DeepSeek Harness 那么强。

## 原因体系

DeepSeek Harness 的 TurnEndReason 包含六种核心结果：completed、blocked、max-tokens、aborted、error、interrupted。这些状态回答的是整个 turn 如何结束。

- completed 覆盖正常文本停止、工具要求收口，以及首步为空。它不承诺长期 Goal 完成。
- blocked 来自 pre-step reject。输入可能已经被 inbox 领取，但策略层拒绝进入模型调用。driver 当前会停止，其他尚未领取的普通 prompt 可以继续留在队列。
- max-tokens 表示至少一个 step 达到输出上限。它保留为 turn 级质量信号。
- aborted 携带取消原因，包括 user、parent、hook 和 disposed。持久导入还可能出现 legacy cause。
- error 保存结构化 LlmFailure。LlmError 的信息原样保留，其他异常会被压平为 errorChain 文本，并使用 UNKNOWN code。
- interrupted 由持久化恢复层产生。进程崩溃后，后端发现一个开放 turn，会用该状态闭合。live loop 不会主动写入它。

把 crash repair 与 runtime abort 分开很有必要。abort 表示程序收到了取消请求，并有机会执行清理；interrupted 表示生命周期突然消失。两者对副作用审计、重试决策和用户提示都有不同含义。

Pi 主要保留 assistant message 的 stopReason：stop、length、toolUse、error、aborted。它更接近最后一次模型调用的结束事实。DeepSeek Harness 的 reason 聚合了多 step turn 的结果。一个字段偏 provider，一个字段偏业务生命周期。

从监控角度看，Pi 的 stopReason 更利于分析模型行为；DeepSeek Harness 的 turn reason 更利于分析任务执行。生产系统通常两类数据都需要。DeepSeek Harness 通过 assistant/message、request events 和 turn/end 同时保留两层事实，日志体积也会更大。

## Goal 外循环

长期 Goal 无法靠核心 turn 的 completed 判断。DeepSeek Harness 采用外围 Round Driver。它监听 Agent 进入 idle，然后检查：Agent 实例是否仍然有效；inbox 是否存在竞争中的普通 prompt；Goal 是否存在；Goal phase 是否为 active；当前 activation 是否 armed；已启动 round 数是否低于上限。

满足条件后，Driver 构造一条来源为 goal 的 user message，并调用 agent.followup()。新消息进入 next-turn，打开全新的 turn。时序如下：

```
turn/end(completed) → agent/status: idle → Goal Driver 读取持久状态 → flush → followup(goal round) → turn/start
```

这种结构给每个 Goal Round 一个完整、独立、可恢复的生命周期。进程在两个 Round 之间退出，恢复时可以从最后一个闭合 turn 继续判断。一个覆盖几十轮的巨大 while 会让持久化边界、用户抢占和异常恢复都更困难。

Goal 还维护 phase 与 activation 两组状态。持久 phase 描述业务状态：active、complete、blocked、paused。进程内 activation 描述自动续行授权：armed、disarmed。

把两者拆开可以处理 resume 和 fork。一个持久 Goal 仍然 active，不代表新进程应该自动继续消耗预算。恢复后的 active Goal 默认 disarmed，需要人类再次授权。否则某次服务重启可能让多个历史任务同时复活。

达到最大 Round 数时，Goal 会进入 blocked，并记录 round-limit。max-tokens、Agent error、flush failure、driver failure 会 disarm。取消路径也会 pause 或 disarm，防止 idle 后被 Goal Driver 再次拉起。这里采用了 fail-closed 策略。长期自治任务遇到状态不确定时停止续行。对成本敏感、有写权限的 Agent，这是合理默认值。自动重试可以放在更高层，由持久预算和幂等策略约束。

## Goal 收尾

Goal 状态改为 complete 或 blocked 后，当前 turn 通常还会再调用一次模型。update_goal 工具会修改持久状态，并通过 deferred context 注入收尾指令。工具结果与 <goal_complete> 或 <goal_blocked> context 进入下一 step，模型生成最终面向用户的说明。之后 turn 以 completed 结束。Agent 进入 idle，Goal Driver 读取到非 active phase，不再唤醒。

这解决了状态完成与用户可见输出之间的时间差。如果 update_goal(complete) 直接 conclude turn，持久状态已经完成，用户界面可能只看到工具卡片，没有自然语言总结。若让模型先写总结再更新状态，模型或进程可能在总结期间失败，Goal 又会保持 active。

DeepSeek Harness 先提交状态，再执行展示收尾。恢复时即便缺少最终文本，Goal 也不会重复工作。用户体验层可以根据 complete 状态补一条提示，或者提供重新生成总结的操作。代价是 complete 后多一次模型调用，也会增加少量 token 和延迟。作者认为这笔成本合理。长期任务的最终输出属于交付结果，不能依赖 UI 猜测工具状态。

## Pi 双循环

Pi 的 runLoop() 使用内外两层循环。内层条件为：`hasMoreToolCalls || pendingMessages.length > 0`。它处理工具回访和 steering。外层负责 Agent 本来要停止时的 follow-up。

一次内层迭代包括：prepareNextTurn → 处理 pending steering → 调用模型 → 执行工具 → 发出 turn_end → shouldStopAfterTurn → 拉取新的 steering。内层耗尽后，系统调用 getFollowUpMessages()。存在 follow-up 时，将它们设置为 pending，重新进入内层。没有 follow-up 时发出 agent_end。

Pi 提供三个高杠杆控制点：getSteeringMessages()、getFollowUpMessages()、shouldStopAfterTurn()。这套接口很适合嵌入应用。

steering 处理当前 activity 内的即时干预；follow-up 处理 Agent 自然收口后的补充工作；shouldStopAfterTurn 提供宿主级截停。扩展作者不需要理解持久 inbox，也不需要创建新的状态投影。

复杂度被交给宿主。多个扩展共同提供 follow-up 时，需要上层决定合并方式。进程恢复后，回调内部的临时状态如何重建，也由应用实现。若不同扩展分别定义 Goal、Plan 和审批流程，结束语义会逐渐碎片化。Pi core 的目标是提供一个小而可组合的运行时。它没有承诺统一的长期任务协议。这个边界和 DeepSeek Harness 的产品定位并不相同。

## 失败路径

Pi 遇到 assistant error 或 aborted 时，会发出 turn_end 和 agent_end，然后结束当前 invocation。

DeepSeek Harness 会先区分流 finish error、显式 abort 和普通异常。请求错误可以进入 agent/request-error waterfall。插件能够依据 provider、failure、retry policy 和 signal 决定 retry。重试发生在同一个 step 内，重新创建 assembler，再发一次请求。外部 turn 和 step 边界保持不变。

这种设计使日志更紧凑，但需要谨慎处理重复请求。前一次失败若已经在 provider 侧产生计费，session 中可能只有请求重试后的最终 assistant message。底层观测系统需要独立记录 attempt，不能只靠 conversation event log 统计模型调用次数。

Pi 通常由 stream implementation 或上层配置承担 retry。Agent Loop 接收到的 final message 已经带有 stopReason。职责划分更轻，调用方也更容易替换模型层。

DeepSeek Harness 将 request header、adapter defaults、request context 和 conversation surface 都纳入 session 语义，retry 与恢复自然更靠近 loop。架构更重，换来统一的请求重建能力。

## 请求序列

DeepSeek Harness 每次构建请求时都会比较当前 header 与 session 中的 baseline。header 包含：provider 和 model；reasoning effort、max tokens 等调用配置；adapter materialized defaults；system prompt；tool schemas。

首个 header 记录为 initial 或 resume。配置变化时记录 change。显式开始新消息序列或 surface replacement 后，会记录 series。结束判断和 request series 没有直接控制关系，但它影响「同一个上下文连续体」的解释。Goal 的自动 Round 可以标记 startsRequestSeries: true，让每轮长期任务拥有独立请求序列。缓存、展示和重放层因此能识别边界。

如果只依靠 turn start 判断新序列，会把工具回访、用户 follow-up、Goal Round 和 compaction 后续请求全部归入一种语义。DeepSeek Harness 单独记录 series，是在为后续缓存和重建保留信息。成本是日志事件更多，header equality 与 canonicalization 也必须稳定。工具 schema 排序、空字段处理或 adapter defaults 若不规范，可能制造大量无意义 change 事件。代码使用 canonical header 和 deep freeze，正是在控制这种漂移。

## 日志消费

消费 DeepSeek Harness 日志时，先问清业务方想判断哪一层结束。

- 判断一次模型调用完成，应读取 step 内的 assistant message、stream finish 和 usage。
- 判断 turn 是否闭合，应寻找配对的 turn/start 与 turn/end。只有 assistant message 不够。pre-step reject、空 turn、异常和 crash repair 都可能产生不同结构。
- 判断当前 Agent 是否暂无活动，应读取 status 或等待 whenIdle()。最后一条 turn/end 仍不足以证明 idle，因为 driver 可能已经打开下一 turn。
- 判断长期 Goal 是否结束，应读取 Goal phase。complete、blocked 和 paused 都会停止自动 Round，业务含义各不相同。
- 判断 Plan 是否退出，应读取最新 plan/mode.active。看到 exit_plan_mode 调用，只能说明模型提出了退出请求。审批可能被拒绝，pending intent 也可能尚未在 pre-step 提交。
- 判断会话以后是否还会运行，需要观察 Agent 是否 disposed、是否从 registry 移除，以及外围 scheduler 是否仍能发送消息。idle 和 completed 都没有永久性。

Pi 的消费方式更简单：assistant stopReason 描述模型调用；turn_end 描述一次模型与工具批次；agent_end 描述当前 invocation；Goal、Plan 和工作流完成度读取具体扩展状态。即使已经收到 agent_end，宿主仍然可以再次调用 Agent Loop。它同样不具备永久终止含义。

## 工程取舍

DeepSeek Harness 为结束判断支付了较高复杂度。它需要：phase 状态机；inbox 分类；wake latch；平衡的 turn 和 step 事件；surface projection；request header 重建；crash repair；Goal activation；Plan boundary intent；有序工具提交。这些机制会增加代码量、测试矩阵和插件开发门槛。一个简单聊天产品采用全套设计，投入可能超过收益。

它适合以下场景：会话需要跨进程恢复；Agent 拥有高风险工具；多个插件会同时 steering；需要长期 Goal 与预算控制；日志需要审计和 replay；Plan、审批和执行必须跨边界保持一致；子 Agent 和父 Agent 存在取消传播。

Pi 的循环更适合：单次 invocation 生命周期清晰；宿主已经拥有自己的持久化层；扩展数量有限；工作流由应用统一控制；希望快速接入多模型与工具；对 session event vocabulary 没有强约束。

Pi 的小核心减少了框架内部状态。业务一旦开始增加 Goal、审批、自动 follow-up、并发工具策略、恢复和预算，宿主会逐步补齐类似机制。复杂度没有消失，只是落在不同层。

团队选择框架时，不应只比较 Agent Loop 文件有多少行。要看系统准备把「继续运行的权力」放在哪里。DeepSeek Harness 把权力分散给模型 finish、工具结果、inbox、生命周期 hook 和外围持久状态机，并通过事件日志协调。Pi 把权力集中在当前循环和几个宿主回调中，扩展层可以自行定义更高层协议。

## 设计建议

作者给出的十条自实现 Agent Loop 原则：

1. 区分模型结束、工具批次结束、用户 turn 结束和长期任务结束。类型和事件名也要分开，避免一个 done 字段横跨所有层级。
2. 继续执行需要携带数据。插件要求再跑一轮时，应提交 steering 或 follow-up message。单独返回布尔值会让调试和组合越来越困难。
3. 工具调用后的模型回访应被建模为债务。普通工具结果产生一次回复债务，conclude 或 terminate 可以消除债务，steering 又会重新增加消息债务。用这套视角设计状态机，比堆叠 if (hasToolCalls) 更稳定。
4. 最大 token 需要独立结果，且不要执行疑似截断的工具参数。自动修复可以存在，但必须显式记录恢复过程。
5. 并行工具允许乱序完成，持久结果应按模型顺序提交。除非协议明确支持乱序 tool result，否则不要让网络时序改变上下文。
6. 取消必须区分已启动与未启动调用。已启动工具要排空或记录未知结果，未启动工具需要完整的 synthetic result，具体选择取决于日志协议。
7. idle 不能充当长期完成信号。Goal phase、workflow state 和 Agent lifecycle 应拥有独立状态。
8. 模式切换要提交在请求边界。Plan、权限、模型路由和工具目录的变化，都不应在一个已开始的请求批次中途生效。
9. 恢复后的自动续行默认关闭。长期 Agent 会消耗资金，也可能修改外部系统。新进程接管旧任务时，应重新取得授权或租约。
10. 结束原因需要兼顾机器消费。completed、blocked、max-tokens、aborted、error、interrupted 这类结构化 union，比一段自然语言错误更适合监控、重试和审计。

## 架构落点

DeepSeek Harness 把结束判断分布在四个控制面上：

- 模型输出控制 step：还有没有工具回访债务。
- inbox 控制 turn：还有没有当前轮待处理消息。
- driver 控制 activity：队列耗尽后是否进入 idle。
- Goal 与 Plan 控制工作流：idle 后是否开启新 Round，下一请求采用哪种策略。

Pi 将更多判断放在同一个运行循环里。工具调用和 pending steering 驱动内层循环，follow-up 驱动外层循环，shouldStopAfterTurn 提供宿主截停点，队列耗尽后发出 agent_end。

DeepSeek Harness 更接近一个事件溯源的 Agent Runtime。Pi 更接近一个可嵌入的 Agent 执行内核。评价两者没啥意义，我们需要关注的是其系统边界。如果产品只需要一次 prompt 驱动的工具循环，Pi 的结构更容易维护。若产品已经出现跨轮 Goal、审批、恢复、多插件 steering 和高风险工具，DeepSeek Harness 的分层会减少后期协议冲突。

Agent Loop 最难处理的部分，从来都不是让模型继续调用工具。真正消耗工程时间的是：它为什么继续、谁允许它继续、失败后还能不能继续、恢复后应不应该继续，以及日志能否解释它曾经做过的每一次选择。