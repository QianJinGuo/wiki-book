# 六套 Harness 的 Agent Loop 实现对照：薄循环、重状态机与插件化

> 📊 Level ⭐⭐⭐⭐ | 18.8KB

## 核心命题：基本流程相同，差异都在循环之外

Agent Loop 的基本流程并不复杂——模型发起工具调用，Harness 执行后把结果返回，模型再决定下一步。但真实产品还要处理：工具如何并行执行、用户能否中途追加指令、权限检查放在哪个环节、上下文接近上限如何压缩、循环什么时候结束。**六套系统（Claude Code、Codex、OpenCode、Pi、Oh My Pi、DeepSeek Harness）遵循相似的基本流程，差别集中在循环的组织方式、状态管理与扩展机制上。**

## 一图流：六套骨架的差异

| | 循环骨架 | 工具并发语义 | 插话通道 | 压缩时机 | 事实来源 |
|---|---|---|---|---|---|
| **Claude Code** | 单线程 while：有 `tool_use` 就继续 | 只读并发 / 写串行（框架判定） | 运行中排队，并入后续调用；maxTurns 后另起 turn | 前置自动压缩（清旧输出→摘要） | 内存 messages |
| **Codex** | turn 内多次采样（`needs_follow_up`） | `FuturesOrdered` + 读写锁（工具自报） | `turn/steer` 进 input_queue | 采样前 + 采样中两时机 | Thread + 会话状态 |
| **OpenCode** | step 机（`SessionRunner.drain`） | 流内 tool-call 立即执行（fiber） | inbox 带 `delivery: queue/steer` | 每 step 前 `compact(auto)` | **SQLite** |
| **Pi** | 极简双层（内层工具+steering，外层 follow-up） | 默认 parallel，遇 `sequential` 整批转串行 | steering / follow-up 两队列 | 轮间准备 + 溢出后重试 | 会话树投影 |
| **Oh My Pi** | 继承 Pi 双层 | `shared` 并发 / `exclusive` 屏障 | steering + asides + follow-up | AgentSession 层 | 会话树投影 |
| **DeepSeek Harness** | turn→step→attempt 三层状态机 | 屏障 + 有界滚动池，按模型顺序提交 | next-turn / next-step 两条持久队列 | 插件挂 `agent/pre-step` | **日志（Surface 投影）** |

（上表为本文对原文六节的归纳，逐项细节见下。）

## Claude Code：薄循环 + 厚外壳

循环本身是一个 while：模型输出里有 `tool_use` 就继续，没有就结束；一次"模型输出 + 执行工具 + 回填结果"称为一个 turn，Agent SDK 暴露的就是同一个循环，CLI/桌面/IDE 共用。每次请求都带系统提示、CLAUDE.md、工具定义与完整历史，不变前缀走 prompt caching；`effort` 控制推理深度，thinking 块单独输出，响应后累计 cost 用于预算检查。

并发策略是**框架判定**：同一轮的多个调用里，只读工具（Read/Glob/Grep、标注只读的 MCP）并发，改状态的工具（Edit/Write/Bash）串行；执行前过权限链 PreToolUse hook → deny/allow 规则 → 权限模式 → 询问用户，auto 模式再用分类器模型审查命令与网络请求。插话可随时中断/换方向/补信息；流式输入下运行中消息先排队、并入后续模型调用，**到了 maxTurns 仍在排队的消息不并入，而是另起一个 turn**。压缩是"先清旧工具输出，再摘要对话"，流里发 `compact_boundary`，PreCompact hook 可先归档全文；单个超大输出导致反复压缩时几次后停止报错，**不会死循环**；可在 CLAUDE.md 写明"压缩时要保留什么"。停止条件是模型回复无 `tool_use`（返回含 cost/usage 的 ResultMessage），或 maxTurns/maxBudgetUsd 封顶；Stop hook 可以 block 停止让它接着干；子 agent 用全新上下文、只把最终回复交回父循环，预算含子 agent。扩展点最密：UserPromptSubmit / PreToolUse / PermissionRequest / PostToolUse / PostToolBatch / PreCompact·PostCompact / Stop / SubagentStart·Stop。作者的评价是"薄循环 + 厚外壳"：循环只管调模型和执行工具，安全与控制交给权限系统与 hooks；代价是源码不开源、子 agent 只看最终回复、压缩是有损摘要。

## Codex：围绕"采样"组织，边流边执行

codex-rs 里一次用户输入启动一个 turn，turn 内循环多次采样：每次采样是一次 Responses API 请求加执行这次响应里的全部工具调用；循环条件是 `needs_follow_up`（模型还要继续，或还有用户插话没并入）。客户端与内核通过 SQ/EQ 通信（提交 Op、内核推回 EventMsg），`run_turn()` 里是"并入插话 → 采样 → 执行工具 → 判断是否继续"，**一个 Thread 同一时间只有一个活跃 turn**。

工具执行的关键差异是**边流边执行**：`OutputItemDone` 一到就启动工具 future，不等整段响应结束；`FuturesOrdered` 保证结果按调用顺序回填；并行闸门是读写锁——**支持并行的工具拿读锁并发，其余拿写锁独占**，即"能否并行靠工具自报，默认保守"。ToolOrchestrator 把审批 → 选沙箱 → 执行 → 被沙箱拦截则升级重试（不重复审批）串成一条。插话走 `turn/steer` 进 input_queue、不断开 turn，每次采样前取出 pending input 并入（先过 UserPromptSubmit hook）；`turn/interrupt` 中断并记录 `turn_aborted`。压缩有采样前（超 `model_auto_compact_token_limit`）与采样中（还要继续且已到上限，原地压缩后接着跑）两个时机，换小窗口模型前会先用旧模型压一遍，结果写成 Compacted 记录替换历史。停止时 `needs_follow_up` 为假 → 跑 Stop hooks（可 block 并把续写提示作为新输入注入）→ 推送 TurnComplete。

## OpenCode：数据库驱动的 step 机

`SessionRunner.drain` 从 SQLite 的 inbox 取输入，按 step 循环，每个 step 一次模型请求，`needsContinuation`（有工具调用）就 step++ 再来；`runStep` 内部还有一层循环专门处理压缩、重试与续写。每个 step 重新加载上下文（instructions/agent/模型/工具/历史），超 `agent.steps` 时追加 MAX_STEPS 提示并设 `toolChoice: none`；请求发出的同时并行抓 step-start 快照，不拖慢首字；**最后一步也保留工具定义，以命中 provider 的前缀缓存**。

工具在流里一出现 tool-call 事件就执行（fiber 并发），provider 自己执行的工具跳过本地；参数没写完的调用不执行、回给模型"请重新发起"。inbox 每条带 `delivery`：`queue` 等空闲、`steer` 运行中插入——**运行中只取 steer，到空闲边界才取一条 queue**；inbox 还能装控制项（手动压缩、迁移会话位置），进程重启后先清理残留的压缩与工具调用再继续。压缩在每个 step 前跑，上下文溢出则以 overflow 为原因压缩后重来；可重试错误按策略等待，断流时合成一句"请从中断处继续"；attempt 结果为 Completed/Retry/Continue/Compacted/RecoverFull。**每个 step 前后各抓一次 Git 快照，可精确回退到 step**，代价是依赖 SQLite + 事件总线、比纯日志实现更重。

## Pi：最小双层循环 + 全回调

Pi 的循环是一个极简双层结构：内层在"还有工具调用或 steering 插话"时继续调模型，外层在要停时检查 follow-up；循环只认几个回调（prepareNextTurn / prepareRequest / beforeToolCall / afterToolCall / finishTurn），压缩、重试、扩展全由外面的 AgentSession 挂上去。全程用 AgentMessage，只在调模型那一刻 `convertToLlm`；对外是事件流（agent_start / turn_* / message_* / tool_execution_* / agent_end）。

工具默认 parallel：先逐个 prepare（校验 + beforeToolCall），再 Promise.all 并发；**批次里只要有一个 `executionMode: sequential` 的工具，整批改串行**；afterToolCall 可改写结果，结果按模型给出的顺序回填；所有结果都带 `terminate` 时可提前结束内层。插话分两类：steering 在每轮之间注入（含压缩等长准备之后再取一次），follow-up 在"本来要停"时才取；两个队列都可 one-at-a-time 或 all；`finishTurn` 返回 continue 可不加新消息再跑一轮。失败恢复放在 run 结束后：error/aborted 直接结束本次 run（不在循环里重试），AgentSession 再做退避重试；上下文溢出压缩后重试、超阈值只压缩不重试；**输出被 length 截断则整批工具调用不执行，回错误让模型重发**。核心刻意不带子 agent 与 plan mode——"循环不到一千行，其余能力都通过回调和扩展挂上去"，代价是没有内置权限审批、复杂编排自己搭。

## Oh My Pi：Pi 骨架 + 三处纠偏

Oh My Pi 继承 Pi 的双层循环，在"流中、工具批次边界、turn 结束"三处加入纠偏能力：`TTSR`（流里命中规则就中止本次输出、注入规则后重来）、`LoopGuards`（同一工具调用反复出现时注入纠偏提示）、`advisor` 旁路审查（asides 不打断、随下一轮带上）。工具并发用 `shared` 并发 / `exclusive` 屏障——**exclusive 要等前面全部完成后独占**；可中断工具（wait 等）会被 steering 立刻打断，而 bash 等只收软信号、不会被杀。失败时给未完成的 toolCall 补占位结果，turn-recovery 做瞬时错误重试、额度受限时等待或切备用模型链。代价是 agent-loop.ts 约 4000 行、AgentSession 约 1.3 万行，循环与会话耦合较深，TTSR 中止重来会多花 token。

## DeepSeek Harness：写日志的状态机

`ReactLoopAgent` 是可观察状态机：turn（一次任务）→ step（一次请求 + 本次工具）→ attempt（失败重试）三层，**每个边界都写进 Session 日志**（turn/start、step/start…step/end、turn/end）；每次请求都从日志投影（Surface）构造，**不在内存另存历史**。driver 的 `kick()` 里 `while (await turn())`，有积压输入就连续开 turn。

请求走 `agent/request` waterfall 由插件决定 provider/model/effort；失败落 `assistant/attempt` 由 `agent/request-error` 决定是否重试。工具执行里**独占调用是屏障、并行调用进有界滚动池**，执行可交叠，但结果与附加上下文按模型顺序提交；调度分 prepare → dispatch → finalize，审批与钩子都落成事件；中止时未启动的调用补合成错误结果，保证回放合法。插话走两条持久队列：followup → next-turn 并唤醒、steer → next-step 并唤醒、inject → next-step 不唤醒；每个 step 前 preStep 领取，取消默认清空队列（keepInbox 可保留）。压缩是插件挂在 `agent/pre-step`，溢出时挂 `agent/request-error` 压缩后重试；中断时保存已输出前缀（`interrupted: true`），失败尝试不进模型可见历史。停止：无 tool-call → completed、到上限 → max-tokens（粘性）、工具结果带 `concludesTurn` 也结束、pre-step 拒绝 → blocked；将停且 next-step 为空时触发 `agent/turn-stopping` 让插件再塞输入；外层编排（Goal 同会话续跑 / Ralph 每轮新开子 agent）也是插件。代价是概念多（turn/step/attempt/Surface/inbox）、行为取决于插件 waterfall 顺序、接口仍在快速演进。

## 深度分析

### 两种成本结构：薄循环厚外壳 vs 重状态机

Claude Code 把复杂度推到权限系统与 hooks，循环本身几行就够；DeepSeek Harness 把复杂度收进状态机与日志，换来崩溃、回放、fork 都能对齐到 step。**这不是"先进 vs 落后"，而是把成本记在哪一栏**：薄外壳要维护大量扩展点与权限语义，重状态机要维护日志投影与插件顺序。选型判据因此很具体——需要审计/回放/断点续跑就付状态机的钱，需要快速迭代产品体验就付 hooks 的钱。

### 工具并发语义：谁来决定"能不能并行"

六套系统分化成两派：Claude Code 由框架按"只读/写"判定；Codex 让工具自报（读锁/写锁，默认独占）；Pi/Oh My Pi 由工具声明 `sequential`/`shared`/`exclusive`，且**一个声明就降级整批**；OpenCode/DeepSeek 用 fiber/滚动池并发、按模型顺序提交。共同点是**最终回填顺序必须与调用顺序一致**——并行是性能手段，有序是正确性要求。风险也一致：工具自报错了（一对读写冲突的操作都声明 shared）框架不会兜底。

### 插话的三种语义，决定交互手感

同样是"用户插一句"，六套的价值取向不同：Claude Code 是"排队并入下一次调用"，maxTurns 后另起 turn；Codex 的 steer 进 input_queue、**不断开当前 turn**；OpenCode 用 `delivery` 显式区分 queue/steer；Pi 分 steering（轮间注入）与 follow-up（要停时才取）；DeepSeek 分 next-turn/next-step 且区分"唤醒"与"不唤醒"。这套区分的实质是回答"**这句话是改变当前任务，还是发起新任务**"——不做区分的系统，用户要么被打断、要么被忽略。

### 压缩时机比压缩算法更影响稳定性

六套系统都在"阈值前置压缩"之外各留了一手：Codex 有采样中压缩与换小窗口前的预压；OpenCode 有 overflow 触发的压缩重来；Pi 区分"溢出后压缩重试"与"超阈值只压缩不重试"；Claude Code 在重复压缩时主动报错退出。这些细节处理的是同一个故障模式——**压缩本身可能再次溢出**，没有退出条件就会死循环。另一条共识是压缩要有"边界事件"（compact_boundary、Compacted 记录、PreCompact hook），否则外部编排无法知道上下文被换过。

### 停止条件正在从"模型说完了"变成"外部可编排"

六套都保留了"模型无工具调用即结束"的默认，但都在外面加了一层控制权：Claude Code 的 Stop hook / maxTurns / maxBudgetUsd、Codex 的 Stop hooks 与 TurnComplete、Pi 的 finishTurn 返回 continue、DeepSeek 的 agent/turn-stopping 与 Goal/Ralph 插件。这说明**Agent Loop 的终止权已经部分外包**——谁掌握"继续/停止"的判断，谁就能把循环嵌进更大的工作流（评审、重试、多轮任务）。代价是行为更难预测：同一个 stop 信号在不同 hook 组合下可能意味着不同结果。

### 事实来源决定可恢复性

Pi/Oh My Pi 把上下文当"会话树的投影"，OpenCode 把状态放 SQLite 且每 step 抓 Git 快照，DeepSeek 从日志投影请求——三者都能在崩溃后恢复到某个边界；Claude Code 与 Codex 更依赖会话内存与 Thread 状态（Codex 有 turn/steer 与 resume 但无 step 级快照）。**恢复到哪一层，决定了"重试"是重跑一句还是一整轮**：step 级快照能只重放失败步骤，内存态只能重跑整轮。

## 实践启示

1. **先定事实来源**：日志/DB 投影（可回放、可 fork）还是内存 + Thread（轻量、快），这是最早要做的架构决定。

2. **并发语义要么框架判定，要么工具自报——但回填必须有序**；自报方案要给"声明错了"留兜底。

3. **插话至少分两类**：改变当前任务的（steer/inject）与发起新任务的（follow-up/queue），否则交互手感必然拧巴。

4. **压缩要有退出条件与边界事件**：重复压缩检测、overflow 触发、compact_boundary 通知，缺一就会死循环或外部编排失明。

5. **终止权外包要配可观测**：Stop hook / turn-stopping 能改变结果，就必须有结构化结束原因（completed/max-tokens/blocked）。

6. **扩展点越多越好用，也越难推理**：hooks 型（Claude Code）适合产品快速迭代，插件型（DeepSeek）适合需要审计与复放的平台。

7. **薄循环是可复用的形态**：Pi 不到一千行、策略全在回调，适合作为自建 Harness 的起点；缺的权限、子 agent、plan mode 按需补。

## 与相关实体的关系

- 与 [生产级 Harness 的 12 个组件对照](https://github.com/QianJinGuo/wiki-public/blob/main/entities/production-harness-12-components-framework-comparison.md) 是同一主题的两个切面：那篇按**组件**横向切（提示、工具、上下文、权限…），本篇按**循环实现**纵向切六套系统的骨架与扩展点，互为索引。
- 与 [Agent Harness 对比 A3：SubAgent 七框架 Prompt 双语对照](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-comparison-a3-subagent-2026-06-10.md) 互补：那篇对比子 Agent 的提示词实现，本篇对比主循环与插话/压缩/停止语义。
- 与 [Codex 全链路架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/万字详解-codex-全链路架构codex-不是一个-app而是一套-agent-harness-runtime.md)、DeepSeek Code Harness 单系统深挖不同：本篇的价值在**横向可比**——同一组问题在六套系统里的不同答案。
- 与 [Claude Code Loop 类型官方四模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-loop-types-official-taxonomy-four-modes.md) 呼应：那篇讲 Loop 的形态分类，本篇讲这些形态在代码里如何落地（while 条件、hook 位置、压缩时机）。
- 与 [Loop Engineering 方法论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md) 构成方法与实践的对照：方法论回答"循环该怎么设计"，本篇给出六个已上线系统的实际取舍。

→ [原文存档](https://mp.weixin.qq.com/s/GryGhL7SLCPwDQF0VjsPeg)

---

