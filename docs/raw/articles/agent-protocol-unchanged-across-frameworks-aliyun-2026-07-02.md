---
title: "相比层出不穷的 Agent 框架，不变的 Agent Protocol 是什么"
source: wechat
source_url: https://mp.weixin.qq.com/s/0N-RnpGVy_PLSDHMwAIFNg
ingested: 2026-07-02
feed_name: 阿里云开发者
source_published: 2026-07-02
type: raw
sha256: 92e7a3463b98956d7775af5d23f88a5a2add488184d043fd4d5c8f86a713fb99
---

# 相比层出不穷的 Agent 框架，不变的 Agent Protocol 是什么

阿里妹导读

文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。

Agent 框架层出不穷，到底哪个值得长期投入？

LangGraph 讲  ` Checkpoint  ` ，OpenAI 讲  ` Thread  ` 和  ` Run  ` ，A2A讲  ` Task  ` ，AG-UI 讲  ` Event  ` ，  Deep Agents  又引入  ` Todo  ` 、  ` Subagent  ` 和  ` Virtual Filesystem  ` 。名字越来越多，API 越来越像一套套独立世界观。

_ 框架名词在变，但底层问题始终围绕任务、上下文、步骤、事件、状态和产物展开。  _ 如果把这些名词往下拆，会发现它们其实都在回答同一个底层问题：

** 一个 Agent 任务，如何被启动、携带上下文、持续观测、中断恢复，以足够低的使用成本完成执行，并最终产生产物？  **

换成协议视角，这个问题可以说得更直接：

** 一个生产级 Agent Protocol 应该包括什么？为什么这些协议对象会比具体框架 API 更稳定？  **

我不想每换一个 Agent 框架，就重新学习一套对象体系。我更关心的是，那些跨框架反复出现的稳定边界是什么。

框架会更迭，协议对象会换名字，但生产级 Agent 系统要解决的问题不会消失：

本文的目标不是介绍某一个框架怎么用，而是以  ** Agent Protocol  ** 为主线，把 Agent Runtime 拆成一组可协议化的对象、操作和状态机。

这里先把边界说清楚：本文所说的 Agent Protocol 不是某一个具体标准，不等于 A2A、AG-UI、LangChain Agent Protocol 或任意单一规范；它指的是 Agent Runtime 对外暴露的一组稳定对象、生命周期操作和状态迁移。具体协议标准和框架 API 是证据，不是本文主线。

我前面几篇 Agent 实践文章中，OneAgent 范式[1]讨论的是如何把 Manus / Claude Code 式 Loop Agent 带进企业业务场景；如何做好上下文工程[2]讨论的是长任务 Agent 如何通过 Plan / Offload / Isolate / Retrieve / Reduce / Cache 管理上下文。本文再往下抽一层：  ** 这些实践背后，哪些对象和边界会沉淀为 Agent Runtime 的稳定协议语言？  **

协议告诉我们外部世界需要什么契约，Runtime 告诉我们内部如何实现这些契约。Harness 则保证这些 Runtime 能力已经被打包成足够易用的默认体验。理解这层关系后，再看新框架时，就能快速判断：

* 它只是换了一套 API 名字，还是解决了一个真实的 Runtime 问题？
* 它强化的是执行模型、状态管理、工具协议，还是流式事件？
* 它是暴露底层能力，还是把一整套长任务 Agent 能力封装成开箱即用的 harness？
* 它的设计是长期趋势，还是阶段性流行？

我认为：

1. ** Agent Runtime 的核心不是模型调用，而是任务生命周期管理  **
2. ** Thread / Run / Step / Event / Artifact / Checkpoint 会成为跨框架的稳定对象  **
3. ** 执行模型不会统一：Runtime Loop 承载方式和编排协议会长期分层演进  **
4. ** 真正区分玩具 Agent 和生产 Agent 的，是状态持久化、中断恢复、可观测性和可评测性  **
5. ** 值得看的不是某个框架 API，而是协议边界和 Runtime 抽象  **

** 读这篇文章前，请先理解 6 个对象  **

对象  |  人话解释  |  它回答的问题
---|---|---
** Thread / Session  ** |  一段长期上下文  |  这是谁的哪段任务？
** Run / Task  ** |  一次具体执行  |  这次具体跑了什么？
** Step  ** |  执行中的一个可观测步骤  |  哪一步调用了模型、工具或子 Agent？
** Event  ** |  执行过程中的进展变化  |  现在发生了什么？
** Artifact  ** |  Agent 产出的正式结果  |  结果在哪里，由哪次执行产生？
** Checkpoint  ** |  可以恢复的执行快照  |  失败或中断后从哪里继续？

这 6 个对象，是理解 Agent Runtime Protocol 的入口。

围绕这 6 个对象，生产级 Agent Protocol 至少还要表达  ` stream / interrupt / resume / cancel / retry  ` 这些生命周期操作。后文所有框架对比、Runtime 分析和 Harness 讨论，都应回扣到这组对象与操作：它们分别解决任务创建、上下文携带、步骤执行、事件观察、中断恢复、产物沉淀和评测审计的问题。

1\. 先定义 Agent Protocol 的边界

** 1.1 三层概念：标准、对象、Runtime 能力  **

讨论 Agent Protocol 时，最容易把三层东西混在一起：

层级  |  例子  |  解决的问题
---|---|---
** 具体协议标准  ** |  A2A、AG-UI、LangChain Agent Protocol、AITP、ACP  |  不同系统如何通信，如何描述任务、消息、事件和产物
** 通用协议对象  ** |  Thread、Run、Step、Event、Artifact、Checkpoint  |  外部世界如何稳定理解一次 Agent 任务
** Runtime 实现能力  ** |  状态持久化、中断恢复、可恢复流、权限控制、可观测性  |  Runtime 内部如何兑现这些对象和状态机

本文重点讨论第二层：通用协议对象。具体协议标准和框架实现只作为证据，用来说明这些对象正在跨系统收敛。

** 1.2 Runtime Protocol：外部世界如何理解一个 Agent  **

Agent Runtime Protocol 是 Agent Runtime 暴露给外部世界的契约。它回答的不是"模型如何思考"，而是：

* ** 如何启动一次任务  ：创建 Thread、Task、Run，或发送一条 Message  **
* ** 如何携带上下文  ：历史消息、文件、结构化数据、参与者、能力声明  **
* ** 如何观察进展  ：状态变更、流式事件、Artifact 增量、Trace  **
* ** 如何中断和恢复  ：需要输入、需要授权、取消、重试、继续执行  **
* ** 如何拿到结果  ：最终消息、Artifact、结构化输出、错误信息  **

一句话：  ** Protocol 是 Runtime 的外部边界，Runtime 是 Protocol 的内部实现  ** 。

因此讨论 Agent Runtime 时不应该只讨论内部编排，也要讨论它被什么协议对象驱动，以及它向外承诺什么状态机。换句话说：  ** Runtime 是内部能力，Protocol 是外部可依赖的边界  ** 。

** 1.3 Runtime：模型调用之外的执行系统  **

Agent Runtime 是 Agent 的执行环境，负责：接收输入 → 调用 LLM → 执行工具 → 管理状态 → 产出结果。

不同框架对 Runtime 的定义边界不同：LangGraph 包含了从编排到持久化的完整栈；OpenAI Assistants 把整个 Runtime 藏在服务端；AutoGen 更强调多 Agent 对话组织。但它们都必须回答同一组问题。

更精确地说，Agent Runtime 不是"一次模型调用"，而是模型调用之外的那层执行系统。它至少要管理五类事情：

* ** 生命周期  ：一次任务如何开始、运行、暂停、恢复、结束  **
* ** 上下文  ：哪些消息、文件、状态、外部资源对当前执行可见  **
* ** 调度  ：下一步调用模型、工具、子 Agent，还是等待人类  **
* ** 控制面  ：权限、Guardrail、取消、超时、预算、并发限制  **
* ** 数据面  ：状态快照、事件流、Trace、Artifact、成本数据如何流动  **

这也是为什么 Responses API 不是 Runtime，而 OpenAI Agents SDK 是更高层 Runtime：前者主要给你模型和工具调用能力，后者开始接管循环、工具执行、Handoff、Session、Guardrail、Tracing 等运行时职责。

** 1.4 最小生命周期：  **

** 一个 Agent 任务到底经历了什么  **

不管采用哪种框架，生产级 Agent Runtime 都绕不开同一个生命周期：

这里最关键的概念是  ** Run  ** 。Thread/Session 描述长期上下文，Run 描述一次具体执行。没有 Run 这个边界，就很难定义超时、取消、Trace、成本、权限审批和最终结果。

从协议角度看，这条生命周期可以被映射成一组稳定对象：

Protocol 对象  |  Runtime 含义  |  典型来源
---|---|---
** Agent / Assistant  ** |  可被调用的能力提供者  |  A2A Agent Card、OpenAI Assistant、LangGraph assistant
** Thread / Context  ** |  多轮上下文边界  |  OpenAI Thread、AITP Thread、A2A Context
** Task / Run  ** |  一次执行边界  |  A2A Task、OpenAI Run、LangGraph Run
** Message / Part  ** |  输入输出内容单元  |  A2A Message/Part、AITP Message
** Artifact  ** |  任务产物  |  A2A Artifact、文件、报告、代码 diff
** Event  ** |  进展增量  |  SSE event、status update、artifact update
** Checkpoint / State  ** |  可恢复状态  |  LangGraph Checkpoint、State Snapshot

后文的八个维度，本质上就是解释这些对象如何被 Runtime 实现。

为了避免后文变成框架名词堆叠，全文可以按这条任务生命周期阅读：

生命周期阶段  |  主要协议对象  |  后文对应部分
---|---|---
** 创建任务  ** |  Agent / Thread / Run  |  执行模型、Runtime Loop
** 携带上下文  ** |  Thread / Message / Workspace  |  状态管理、Workspace / Sandbox
** 执行步骤  ** |  Step / Tool Call / Subagent task  |  执行模型、工具协议、多 Agent 协作
** 观察事件  ** |  Event / Trace / State Snapshot  |  流式输出、可观测性
** 中断恢复  ** |  Checkpoint / Interrupt / Resume  |  状态管理、中断恢复、错误恢复
** 产生产物  ** |  Artifact / Workspace file  |  状态管理、流式输出、Harness
** 评测审计  ** |  Step / Event / Artifact / Trace  |  可观测性与可评测性

** 1.5 现有协议已经在向同一组对象收敛  **

不同标准和框架正在围绕 Thread、Run、Step、Event、Artifact、Checkpoint 这些对象收敛。

协议/规范  |  核心对象  |  主要关注点  |  对 Runtime 的启发
---|---|---|---
** LangChain Agent Protocol  ** |  Thread、Run、Store、Command、OpenAPI spec  |  用框架无关 API 服务化生产 Agent  |  Runtime 要暴露可创建、搜索、更新、流式运行和发送命令的标准资源
** A2A  ** |  Agent Card、Task、Message、Part、Artifact、Streaming Event  |  独立 Agent 系统之间互操作  |  Task 状态机和 Artifact 是跨 Agent 协作的核心
** AITP  ** |  Thread、Actor、Capability、Transport  |  跨信任边界的 Agent 交互和交易  |  Thread 是最低公共接口，Capability 承载结构化能力
** ACP  ** |  Agent metadata、REST endpoint、Message、SSE  |  跨框架、跨组织 Agent 通信  |  协议要简单到能用 HTTP 直接接入，同时支持异步长任务
** AG-UI  ** |  Run event、Message event、Tool event、State delta  |  Agent 与前端 UI 的事件协议  |  前端需要的不只是最终答案，而是标准化事件流
** OpenAI Assistants  ** |  Assistant、Thread、Message、Run、Run Step  |  托管式 Agent 执行  |  Thread/Run/Step 是生产 Runtime 的基础资源模型
** LangGraph Server API  ** |  Thread、Run、Stream Mode、State Update  |  可恢复流和状态观测  |  Runtime 协议需要同时支持 run stream 和 thread stream
** Deep Agents  ** |  Todo、Subagent task、Virtual filesystem、Backend、Skill  |  复杂任务 Agent Harness  |  Runtime 之上还需要面向长任务的 planning、delegation、workspace 和 skill 协议对象
** OpenTelemetry GenAI  ** |  Trace、Span、Event、Attributes  |  跨框架可观测性语义  |  Protocol 不只面向业务调用，也面向观测系统

这些标准并没有完全收敛，但它们已经共同指向一个事实：Agent Protocol 的中心不再是单次 chat completion，而是  ** 长生命周期、可观测、可评测、可恢复、可协作的任务对象  ** 。

** 1.6 本文使用哪些框架作为证据  **

后文会多次出现框架对比表，用来观察不同实现如何落到同一组协议对象上。

框架  |  全称  |  核心定位  |  版本基准
---|---|---|---
** LangGraph  ** |  LangGraph + LangGraph Platform  |  图执行引擎 + Agent Server  |  0.3.x
** Deep Agents  ** |  Deep Agents SDK（built on LangGraph）  |  面向复杂任务的 Agent Harness  |  2026.06
** OpenAI  ** |  Assistants API + Responses API + Agents SDK  |  托管式 Agent Runtime  |  2025.04
** AutoGen  ** |  AutoGen 0.4（Core + AgentChat）  |  多 Agent 对话框架  |  0.4.x
** Claude SDK  ** |  Claude Agent SDK（Anthropic）  |  代码执行 Agent  |  0.1.x

##  Part 1：创建任务与执行步骤：Agent 如何跑起来

这一部分对应任务生命周期里的“创建任务”和“执行步骤”：一个外部请求如何变成 Run，Run 又如何被拆成 Step、Tool Call、Subagent task 和状态事件。先看 Runtime Loop 被谁承载，再看 loop 内部哪些动作会被提升为协议状态。

2\. 执行模型 (Execution Model)

** 2.1 通用概念  **

执行模型定义了 Agent 计算如何被编排：什么是执行的基本单元、单元之间如何调度、控制流由谁决定。放到协议视角，它还定义了一个外部请求如何变成内部执行：一条  ` Message  ` 如何创建  ` Task/Run  ` ，一次  ` Run  ` 如何拆成多个  ` Step  ` ，每个  ` Step  ` 如何产生状态、事件和产物。

** 子概念  ** ：

* 执行单元 (Execution Unit)：一次不可分割的计算步骤——一个 LLM 调用、一次工具执行、一个决策节点
* 调度模型 (Scheduling)：执行单元的排列方式——顺序、并行、条件分支
* 控制流 (Control Flow)：谁决定下一步做什么——显式的图边、LLM 的推理、代码逻辑

** 2.2 两层模型：Loop 承载方式与编排协议  **

讨论 Agent 执行模型时，最容易混淆的是把不同层级的东西放在一起比较。更清晰的做法是拆成两层：

* ** Runtime Loop 承载方式  ：谁拥有主循环，控制流被放在哪种运行时容器里  **
* ** 编排协议模式  ：主循环内部哪些语义对象被显式化，哪些 Action 副作用会进入 Runtime 状态机  **

Graph、Code、Managed 属于第一层，回答 loop 的承载容器；ReAct、Plan-and-Execute、Conversation-style coordination 属于第二层，回答 loop 内部的主导语义对象。Conversation 和 Graph / Code / Managed 放在同一层会制造误判，它更适合作为广义 Agent loop 上的一种消息协作契约。

执行模型应拆成两层看：Loop 承载方式决定循环在哪里，编排协议决定循环内部哪些语义被显式建模。

Loop 层：
** 图式 Runtime  ** 区别于 Code Runtime 在于它使用构建二叉树的方式来构建条件和边，不过以图式 Runtime 为代表的 LangGraph 的节点函数、条件边和工具调用仍然由代码实现，这些代码被放进图运行时里，控制流被结构化为节点、边、状态和 checkpoint。它的价值在于给复杂分支、并行、恢复和观测提供稳定运行时边界，是一种基于 Code 的 DSL（Domain Specific Language）。
Managed 则代表着用户将 runtime 托管给平台。

编排协议层：
** ReAct  ** 可以看成最小 Agent loop：  ` Observation  ` 进入上下文，模型完成  ` Reasoning  ` ，再选择  ` Action  ` ，最后把  ` Result  ` 写回上下文继续推进。这里的  ` Action  ` 可以是普通业务工具，也可以是带 Runtime 语义的工具，例如更新计划、发送消息、路由、handoff、请求人类确认。

** Plan-and-Execute  ** 的关键是把  ` Plan / Todo / Step / Progress  ` 提升为显式状态。计划依然可以由 ReAct 的  ` update_plan()  ` 或  ` update_todo()  ` 触发，但 Runtime 会把这些副作用纳入进度展示、checkpoint、恢复、审计和评测。

** Conversation-style coordination  ** 的关键是把  ` Participant / Message / Route / Handoff / Speaker  ` 提升为显式状态。  ` transfer_to_agent()  ` 可以表现为一次工具调用，同时触发 active agent、权限边界、上下文可见性和 trace 归属的状态迁移。它的核心语义来自持续参与者之间的消息协议，而非一次性调用对象。

这也解释了为什么 Agent 可以作为工具存在。子 Agent 被一次性调用并返回结果时，更接近 capability invocation；多个 Agent 以持续身份参与同一段消息协议，订阅、响应、修正彼此的消息时，更接近 conversation-style coordination。差异来自运行时角色：一次性能力调用，或持续参与者交互。

这里还有 Runtime 和 Framework 之间的层：  ** Agent Harness  ** 。它不是主线之外的新概念，而是 Protocol/Runtime 能力产品化后的应用层。LangChain 官方把 Deep Agents SDK 归为 harness：它基于 LangGraph runtime 封装高层电池包，把 planning、todo、subagents、filesystem、context management、HITL、streaming、memory、permissions 组合成一个开箱即用的复杂任务 Agent。

Harness 的价值是  ** 易用性  ** ：它把原本需要开发者自己组装的 Runtime 能力，预先打包成一套默认可用的工作方式。Deep Agents 的优势就在这里——你不需要从零设计 todo list、subagent task、virtual filesystem、backend 和 permission model，就能获得一个接近 Claude Code 使用体验的长任务 Agent。

Claude Agent SDK 走的是另一种路线：它直接复用 Claude Code 二进制能力，因此可以获得成熟的代码 Agent 体验、文件操作、权限模型和工具链集成；对应的限制是，它的执行环境、工具边界、可移植性和可观测性会更强地绑定到 Claude Code 的产品形态。

我在 从Claude Code到 OneAgent：如何做好上下文工程[2] 里把规划工具、子智能体、虚拟文件系统和长 Prompt 放在同一组能力中，因为它们不是零散技巧，而是 Harness 把 Runtime 能力产品化后的默认工作方式。在协议视角，这些能力会进一步被拆成 Todo / Subagent task / Workspace / Skill / Event 等可观察对象。

换成本文的六对象主线，可以这样对应：

Harness体验对象  |  回扣到的协议对象  |  说明
---|---|---
** Todo / Plan  ** |  Step / Event  |  把长任务进度变成可观察、可恢复的步骤
** Subagent task  ** |  Run / Step / Artifact  |  把委派任务变成可追踪的子执行和结果
** Virtual filesystem / Workspace  ** |  Artifact / Checkpoint  |  把中间结果、文件和最终产物沉淀到可恢复状态
** Skill  ** |  Tool / Artifact / Metadata  |  把可复用能力包变成 Runtime 可发现的能力
** Permission / HITL  ** |  Interrupt / Resume / Event  |  把高风险动作放入中断恢复状态机

易用性也会带来约束。封装越强，默认路径越清晰，框架替你做的决策也越多。  ** 因此使用这些成熟框架的时候，手里有源码能够覆写乃至重写很有必要，不然复杂的业务场景很难被都满足。相比强绑定二进制产品形态的路线，生产环境我更推荐使用 Deep Agents，原因也在于此。  **

所以评价一个 Agent 框架，既要看底层 Runtime 能力，也要看这些能力是否容易被正确使用。Runtime 解决能不能做，Harness 解决开发者能不能低成本做好；二进制复用型 SDK 进一步解决成熟体验复用问题，同时也带来更强的平台约束。

Harness 把 Runtime 能力打包成默认可用的长任务 Agent 体验，解决“能不能做”之外的“能不能低成本做好”。

** 2.3 跨框架映射  **

概念  |  LangGraph  |  OpenAI Assistants  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---|---
** 执行单元  ** |  Node（函数/Runnable）  |  Run Step  |  Agent turn  |  Agent message handler  |  Agent turn
** 调度模型  ** |  Graph（DAG + 循环）  |  服务端托管循环  |  Python 控制流  |  对话协议（轮转/选择）  |  代码驱动循环
** 控制流  ** |  条件边 /  ` Command  ` |  服务端决定（不透明）  |  Handoff / 代码分支  |  Selector / RoundRobin  |  工具结果驱动 LLM
** 并行执行  ** |  ` Send  API（fan-out/fan-in）  ` |  不支持  |  不支持  |  GroupChat 内并行  |  不支持
** 执行容器  ** |  Thread + Run  |  Thread + Run  |  Runner 上下文  |  Runtime + Team  |  Session

** 2.4 Runtime Loop：Agent 的隐藏主循环  **

很多 Agent 框架表面 API 差异很大，但内部都存在一个主循环：

    while not done:    messages =load_context()    model_output =call_llm(messages, tools)    if model_output.tool_calls:        tool_results =execute_tools(model_output.tool_calls)        append_results(tool_results)        continue    if model_output.handoff:        transfer_to_next_agent()        continue    if model_output.needs_human:        interrupt()        break    return final_output

_ Runtime Loop 在内部决定下一步调用模型、执行工具、切换 Agent、等待人类还是返回结果；协议外部则需要把这些分支稳定表达成 Task / Run 状态。  _

框架差异主要在于这个循环由谁拥有：

拥有者  |  代表  |  特点
---|---|---
** 开发者拥有循环  ** |  Responses API、Claude Client SDK  |  灵活，但状态、重试、工具执行都要自己写
** SDK 拥有循环  ** |  OpenAI Agents SDK、Claude Agent SDK  |  上手快，工具执行和事件流由 SDK 托管
** 图引擎拥有循环  ** |  LangGraph  |  循环被拆成节点、边、Checkpoint 和 Pregel-style SuperStep
** 服务端拥有循环  ** |  OpenAI Assistants  |  最省心，但控制权和可观测性最少

判断一个框架是不是 Runtime，不要看它是否能调模型，而要看它是否拥有这个循环。

Deep Agents 不重新发明 Runtime Loop，而是把 LangGraph 的 durable execution、streaming、checkpointing、人机协作能力包装成一个默认可用的 harness。对协议设计来说，这意味着外部对象仍然是 Thread/Run/Event/Artifact，但内部多了 todo list、virtual filesystem、subagent task、skill、backend 这些更贴近复杂任务的中间对象。

从协议角度看，这个循环就是  ` Task/Run  ` 状态机的内部实现：

    SUBMITTED ──► WORKING ──► INPUT_REQUIRED ──► WORKING ──► COMPLETED                  │              │                  │              └── 等待 Message / Resume / Authorization                  │                  ├──► FAILED                  └──► CANCELED

A2A 把这类状态显式放进 Task；OpenAI 把它放进 Run；LangGraph Server 则通过 Thread/Run stream 暴露生命周期事件。对象名不同，但协议都需要向客户端回答同一个问题：  ** 这次执行现在处于什么状态，客户端下一步能做什么？  **

** 2.5 事件驱动 Runtime  **

AutoGen Core 把 Agent 执行看成事件驱动系统。Agent 不再只是"被调用的函数"，而是订阅 Topic、接收 Message、发布 Message 的 Actor。

这种模型的价值在于：

* ** 解耦  ：发送方不需要知道谁会处理消息  **
* ** 并发  ：多个 Agent 可以订阅同一个 Topic 并行响应  **
* ** 分布式  ：Runtime 可以演进成跨进程、跨机器的消息总线  **
* ** 弹性  ：失败的 Agent 可以独立重启，不必拖垮整个工作流  **

但代价也明显：调试困难、消息顺序复杂、状态一致性变差。适用于大规模（超过 10个 Agent 协作）多 Agent 系统。

** 2.6 Workspace / Sandbox：  **

** 执行环境也是状态  **

新一代 Agent Runtime 开始把"工作区"作为一等概念。OpenAI Agents SDK 的 Sandbox agents、Claude Agent SDK 的文件工具和权限模式，本质上都在回答同一个问题：Agent 执行时能读写哪些外部资源？

Deep Agents 把这一点推得更彻底：它默认提供 virtual filesystem，并支持 StateBackend、FilesystemBackend、StoreBackend、CompositeBackend 等可插拔 backend。也就是说，文件不只是工具调用的副作用，而是 Agent 管理上下文、沉淀中间结果、组织长任务产物的核心状态层。

Workspace 和普通上下文不同：

类型  |  例子  |  生命周期  |  风险
---|---|---|---
** Prompt Context  ** |  消息、系统提示词  |  单次模型调用  |  泄漏、污染
** Runtime State  ** |  Checkpoint、Session 变量  |  跨步骤/跨请求  |  版本不一致
** Workspace State  ** |  文件、代码仓库、浏览器页面  |  跨工具调用  |  破坏性副作用
** External State  ** |  数据库、工单、支付系统  |  Runtime 外部  |  真实业务影响

因此，生产 Runtime 不能只管理"对话历史"，还要管理工作区隔离、文件变更审计、权限审批和副作用回滚。

** 2.7 设计决策分析  **

执行模型的设计决策要分两层看。第一层是  ** Runtime Loop 承载方式  ** ，它决定控制权、状态、恢复和观测主要由谁负责：

Loop 承载方式  |  容易做到  |  困难做到  |  典型场景
---|---|---|---
** 图式 Runtime  ** |  分支、并行、可视化、断点调试  |  简单的线性对话（过度建模）  |  复杂工作流、审批流、研报生成
** 代码式 Runtime  ** |  灵活、学习曲线低、调试直观  |  持久化、断线恢复、可视化  |  简单 Agent、脚本任务
** 托管式 Runtime  ** |  零运维、开箱即用  |  自定义执行逻辑、成本控制  |  快速原型、客服 Bot

第二层是  ** 编排协议模式  ** ，它决定 loop 内部哪些语义被 Runtime 正式承认：

编排契约  |  显式建模对象  |  典型触发形式  |  Runtime 需要管理什么
---|---|---|---
** ReAct Tool Loop  ** |  Tool Call / Observation / Result  |  LLM 选择工具  |  工具执行、结果回写、错误作为数据
** Plan-and-Execute  ** |  Plan / Todo / Step / Progress  |  工具调用或调度器触发  |  计划持久化、进度更新、计划修正、阶段恢复
** Conversation-style coordination  ** |  Participant / Message / Route / Handoff / Speaker  |  工具调用或消息路由触发  |  发言顺序、路由、权限切换、上下文可见性、trace 归属
** Manager-Worker  ** |  Task / Subtask / Assignment / Result  |  工具调用或调度器触发  |  子任务分派、上下文隔离、结果汇总、失败重试

** 2.8 本章结论  **

执行模型回答“一个 Run 如何被调度”。后面的状态、工具、流式、中断和观测能力，都是围绕这条 Runtime Loop 展开的。

执行模型不会统一。Loop 承载方式回答主循环放在哪里，编排协议模式回答哪些 Action 副作用会被 Runtime 提升为状态对象。复杂工作流适合图式 Runtime，简单任务适合代码式 Runtime，快速原型适合托管式 Runtime；ReAct、Plan-and-Execute、Conversation-style coordination 可以运行在不同 Runtime 之上，也可以在同一个 Runtime 内叠加。

作为开发者，关键不是押注某一种 loop，而是让状态管理、工具调用、流式输出独立于具体执行模型。这样从代码式 Runtime 切到图式 Runtime，或从 ReAct 切到 Plan-and-Execute 时，其他能力仍然可以复用。-- 虽然对于 LangGraph来说都可以做。

##  Part 2：保存状态、中断恢复与重试：Agent 如何活得久

这一部分对应任务生命周期里的“携带上下文”“中断恢复”和“失败重试”：Run 执行到一半时哪些状态必须保存，暂停后如何继续，失败后如何保留已有进度。状态管理是基础，中断恢复和错误恢复都是它向外延伸出来的生产能力。

3\. 状态管理：生产级 Agent 的分水岭

** 3.1 通用概念  **

状态管理定义了 Agent 执行过程中的可变数据如何表示、持久化、版本化和恢复。协议视角下，状态管理还要决定哪些状态可以被外部看见：Thread history、Task status、Artifact、State Snapshot、Trace metadata，分别暴露给不同类型的客户端。

** 子概念  ** ：

* ** 状态表示 (State Schema)  ：数据的形状——类型化的结构（TypedDict）、消息列表、JSON blob  **
* ** 状态持久化 (Persistence)  ：数据存到哪——内存、数据库、服务端托管  **
* ** 状态版本化 (Versioning)  ：能否查看/回滚历史——快照链、消息追加、无版本  **
* ** 状态作用域 (Scope)  ：数据对谁可见——全局、Agent 级、Channel 级  **
* ** 增量更新 (Update Mechanism)  ：如何修改状态——Reducer 函数、直接覆盖、追加消息  **

** 3.2 持久化光谱  **

各框架在状态持久化上的立场差异巨大，形成了一个光谱：

_ 状态持久化从“进程内临时状态”到“服务端托管状态”形成一条光谱，生产 Agent 必须明确自己站在哪一段。  _

** 3.3 跨框架映射  **

概念  |  LangGraph  |  OpenAI Assistants  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---|---
** 状态表示  ** |  ` TypedDict  +Channel级Reducer  ` |  Thread（消息列表 + 元数据）  |  ` RunContext  （Python 对象）  ` |  ` ChatCompletionContext  ` \+ 共享状态  |  对话历史（隐式）
** 持久化  ** |  Checkpointer（PG/Redis/SQLite）  |  服务端托管（不透明）  |  无（手动  ` save_state  ` /  ` load_state  ` ）  |  无内置  |  无内置
** 版本控制  ** |  Checkpoint链（  ` parent_id  ，类 Git）  ` |  Thread 消息历史（追加制）  |  无  |  无  |  无
** 状态作用域  ** |  Channel 级（每个字段独立 Reducer）  |  Thread 级  |  Agent 级  |  Agent/Team 级  |  Session 级
** 增量更新  ** |  ` Annotated[list, add_messages]  等Reducer  ` |  追加消息  |  直接修改  |  追加消息  |  直接修改

** 3.4 状态分层：不要把所有东西都叫 Memory  **

Agent 领域最容易混淆的词是 Memory。更清晰的做法是把状态拆成五层：

层级  |  典型名称  |  内容  |  主要问题
---|---|---|---
** Conversation  ** |  Messages / Thread  |  用户、模型、工具消息  |  上下文窗口、裁剪、摘要
** Run State  ** |  State / Context  |  当前执行的结构化变量  |  类型、Reducer、并发更新
** Checkpoint  ** |  Snapshot / Savepoint  |  某一步之后的完整可恢复状态  |  存储、版本、回滚
** Artifact  ** |  File / Report / Code diff  |  Agent 产出的外部结果  |  生命周期、权限、可追溯
** Semantic Memory  ** |  Long-term Memory  |  跨会话沉淀的用户偏好或知识  |  检索、污染、遗忘

很多框架说自己支持 Memory，实际只支持其中一层。生产设计必须先问清楚：要保存的是对话、运行状态、可恢复快照、文件产物，还是长期记忆？

这和前文讨论的上下文工程是同一个问题的两个视角。从Claude Code到 OneAgent：如何做好上下文工程[2] 里我从模型可用性的角度拆成 Plan、Offload、Isolate、Retrieve、Reduce、Cache；这里则从 Runtime Protocol 的角度拆成 Conversation、Run State、Checkpoint、Artifact、Semantic Memory。前者回答“怎样让模型在长任务中不迷失”，后者回答“哪些状态必须被 Runtime 稳定保存、恢复和暴露”。

** 3.5 Session、Thread、Run 的关系  **

* ** Session/Thread  ：长期上下文边界，回答"这是谁的哪段任务"  **
* ** Run  ：一次执行边界，回答"这次具体跑了什么"  **
* ** Step  ：最小可观测执行单元，回答"哪一步调用了模型或工具"  **
* ** Checkpoint  ：恢复边界，回答"失败后从哪里继续"  **
* ** Artifact  ：产物边界，回答"结果在哪里、由哪次执行产生"  **

OpenAI Assistants 把 Thread 和 Run 显式暴露出来；LangGraph 把 Thread 作为  ` configurable.thread_id  ` ，把 Run 隐含在一次  ` invoke/stream  ` 中；Agents SDK 更强调 Runner 和 Session。名字不同，但边界是相同的。

如果所有 Runtime 都能基于统一 Agent Protocol 表达  ` Thread -> Run -> Step -> Artifact  ` 这条链路，那么控制台、前端、评测系统、审计系统就不需要理解每个框架的内部状态结构。

** 3.6 并发会话与并发 Run：  **

** Thread 不是锁，Run 才是执行边界  **

并发会话处理的关键，是不要把 Thread / Session 和 Run 混成一个概念。Thread / Session 是长期上下文边界，Run 是一次执行边界；同一个用户可以有多个 Thread，同一个 Thread 也可能在短时间内收到多个 Run 请求。

生产 Runtime 必须明确一个问题：  ** 同一个 Thread 上是否允许多个 Run 同时执行？  ** 不同选择会导向不同的状态一致性策略：

策略  |  行为  |  优势  |  代价  |  典型场景
---|---|---|---|---
** 串行队列  ** |  同一 Thread 的 Run 按顺序排队执行  |  语义最稳定，消息顺序清晰  |  延迟增加，长任务会阻塞后续输入  |  多轮对话、客服、需要强上下文连续性的任务
** 拒绝新 Run  ** |  Thread 已有运行中 Run 时直接返回 conflict / busy  |  实现简单，避免状态冲突  |  用户体验生硬，需要前端解释和重试  |  后台任务、审批流、一次只允许一个执行的场景
** 取消并覆盖  ** |  新 Run 到来时取消旧 Run，用最新输入重新执行  |  交互体验直接，适合“以最后一次为准”  |  旧 Run 的部分进度和副作用需要可追溯或可回滚  |  搜索、草稿生成、用户频繁改需求的交互
** 分叉新 Run  ** |  从同一个 Checkpoint 分叉出多个 Run 并行执行  |  适合 A/B 测试、方案比较、探索式任务  |  需要清晰标记分支、Artifact 归属和最终采纳关系  |  Prompt 对比、策略实验、研究任务
** 乐观并发  ** |  Run 开始时记录 state version，提交时检查是否冲突  |  并发度高，适合低冲突写入  |  冲突检测和合并逻辑复杂  |  多 Agent 并行写不同 state channel

这些策略没有绝对优劣，关键是把语义放进协议和 Runtime 状态机里。客户端需要知道新 Run 是被排队、拒绝、取消旧任务、创建分支，还是等待冲突解决；观测系统也要能把每个事件、Artifact 和错误归属到具体 Run。

并发写状态时，Runtime 至少要处理五类冲突：

* ** 消息顺序冲突  ：两个 Run 同时向同一个 Thread 追加消息，最终历史如何排序  **
* ** 状态版本冲突  ：两个 Run 基于同一份 State Snapshot 修改同一个字段，谁覆盖谁  **
* ** Artifact 归属冲突  ：多个 Run 生成同名文件或报告，哪个是正式产物  **
* ** Workspace 副作用冲突  ：多个 Run 同时改同一份代码、浏览器页面或外部系统资源  **
* ** 事件流归属冲突  ：前端同时订阅多个 Run 时，如何用 run_id、step_id、event_id 恢复和去重  **

因此，Thread 不应该被简单当成一把全局锁。更稳的设计是：Thread 承载上下文，Run 承载执行，Checkpoint 承载版本，Event 承载进展，Artifact 承载产物；并发控制策略则明确写进 Run 创建语义和状态迁移规则。

** 3.7 状态迁移与 Schema 演进  **

持久化一旦进入生产，就会遇到 Schema 演进问题：今天保存的 Checkpoint，三个月后代码升级还能不能恢复？或者说历史执行记录还能不能打开继续了？

生产 Runtime 需要考虑：

* ** 状态版本号  ：每个快照记录 schema version  **
* ** 迁移函数  ：加载旧快照时转换到新结构  **
* ** 兼容窗口  ：保留多久的旧状态可恢复  **
* ** 失败策略  ：迁移失败时是终止、降级，还是创建新 Run  **

这也是服务端托管状态和自建 Checkpoint 的核心差异：托管方案隐藏迁移复杂度，但也隐藏了控制权；自建方案控制力强，但必须承担 schema 演进成本。

** 3.8 设计决策分析  **

** LangGraph 的 Checkpoint 模型  ** 是目前最完整的状态管理方案：

* 每个节点执行后自动快照（不需要手动调用 save）
* 快照具备链式结构，支持"时间旅行"(即任意节点回滚、重放)
* Content-addressed blob 存储，类似 git 的存储方式，大状态只存一次
* ** 允许运行时修改 Agent 的上下文信息，这个相当牛意味着可以运行时让 Agent 自进化  **

代价是：学习曲线陡峭，Reducer 函数的语义需要理解，Checkpoint 存储占空间。

** OpenAI Assistants 的 Thread 模型  ** 走了另一个极端：

* 你不需要（也无法）管理状态——服务端全包
* 状态只能通过追加消息来修改，不能直接改内部状态
* 没有回滚——你只能创建新 Thread

代价是：零控制权。调试困难，无法做"如果当时走了另一条路"的分析。

** AutoGen / Claude SDK / Agents SDK  ** 基本没有内置持久化，把这个问题留给开发者。对于短生命周期的 Agent 这没问题，但一旦需要跨请求保持状态（如人机协作工作流、事后评测、版本管理等），就必须自己搭建。

** 3.9 本章结论  **

状态管理回答“Run 执行到一半时，哪些东西必须被保存，以及多个 Run 同时发生时如何保持一致”。它承接上一章的 Runtime Loop，也直接支撑后面的中断恢复、错误回滚、并发会话和执行回放。

状态持久化是区分“玩具”和“生产”的分水岭。没有持久化的 Agent 无法在进程崩溃后恢复，无法支持真正的 Human-in-the-Loop，无法调试“为什么 Agent 走了这条路”，也无法从同一个状态分叉执行不同策略。并发 Run 进一步要求 Runtime 明确队列、拒绝、取消覆盖、分叉和乐观并发等策略。

真正难的不是保存，而是恢复。恢复要求状态 schema、工具副作用、外部资源、权限上下文都能重新对齐；只把 messages 存进数据库，并不等于具备生产级状态管理。

4\. 中断与恢复：

Human-in-the-Loop 的真正基础设施

** 4.1 通用概念  **

中断与恢复定义了 Agent 执行如何暂停（通常等待人类输入）以及如何从暂停点继续。这是 Human-in-the-Loop 的基础设施。

** 子概念  ** ：

* 中断触发 (Interrupt Trigger)：什么条件下暂停——到达特定节点、需要工具审批、主动请求人类输入
* 中断状态 (Interrupt State)：暂停时保存了什么——完整状态快照、对话历史、什么都没保存
* 中断载荷 (Interrupt Payload)：暴露给人类的信息——"Agent 想调用这个工具，你同意吗？"
* 恢复机制 (Resume Mechanism)：人类如何提供输入并让 Agent 继续——提交数据、选择选项、直接回复

** 4.2 跨框架映射  **

概念  |  LangGraph  |  OpenAI Assistants  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---|---
** 中断触发  ** |  ` interrupt()  /  ` interrupt_before  /  ` ` interrupt_after  ` ` |  ` requires_action  ` （仅工具审批）  |  Guardrail 拦截  |  ` HandoffTermination  ` |  ` client.interrupt()  `
** 中断状态  ** |  Checkpoint（完整快照 + pending_writes）  |  服务端 Thread（不透明）  |  无持久化  |  对话历史（手动 save）  |  无持久化
** 中断载荷  ** |  任意 JSON（  ` interrupt(payload)  ` ）  |  ` tool_calls  ` 列表  |  Guardrail 错误信息  |  ` HandoffMessage  ` |  无
** 恢复机制  ** |  ` Command(resume=value)  ` |  ` submit_tool_outputs()  ` |  代码手动恢复  |  重新  ` run_stream(task=input)  ` |  新  ` query()  `
** 多点中断  ** |  支持（多节点设置  ` interrupt_before  ` ）  |  不支持  |  不支持  |  不支持  |  不支持

** 4.3 中断/恢复通用流程  **

不管框架如何实现，中断/恢复的通用流程是一样的：

    Agent 执行 ──► 到达中断点 ──► 保存执行状态 ──► 向前端暴露中断载荷                                                     │                                                     ▼                                               人类查看/决策                                                     │                                                     ▼Agent 恢复 ◄── 从快照加载状态 ◄── 接收人类输入 ◄── 前端提交

** 关键约束  ** ：真正的中断/恢复  ** 需要状态持久化  ** 。如果框架没有持久化能力（Claude SDK、Agents SDK），就只能做同步的"ask and wait"——进程不能退出，用户必须立即回复。

LangGraph 的方案是最完整的：

    # 节点内主动中断，传递任意载荷defreview_node(state):    decision = interrupt({        "question":"要发布这篇文章吗？",        "draft": state["draft"],        "options":["发布","修改","丢弃"]    })    # decision 是人类通过 Command(resume=...) 传入的值    if decision =="发布":        return{"status":"published"}

*   *

    # 人类回复graph.invoke(Command(resume="发布"), config)

** 4.4 设计决策分析  **

方案  |  优势  |  劣势
---|---|---
** LangGraph：通用 interrupt + Command  ** |  任意节点、任意载荷、完整状态保存  |  需要 Checkpointer，学习成本高
** OpenAI：requires_action  ** |  简单，服务端托管状态  |  只能审批工具调用，不能主动问用户问题
** AutoGen：HandoffTermination  ** |  用 Handoff 统一了人机和 Agent 间交互  |  状态需手动保存，恢复不是从断点继续
** Claude SDK：interrupt()  ** |  极简——发信号停止  |  没有恢复，只能重新开始

** 4.5 本章结论  **

中断/恢复回答“任务暂停后能否从原位置继续”。它不是独立能力，而是状态管理的直接延伸：只有 Runtime 能保存精确状态，才可能几小时后从同一个断点继续。

中断/恢复是各框架实现差距最大的维度。LangGraph 的方案领先，是因为它把 Checkpoint 和 Interrupt 深度整合；其他框架要么只支持工具审批，要么只能做同步等待或重新开始。

因此 Human-in-the-Loop 的基础设施不是一个 ask-user API，而是“状态快照 + 中断载荷 + 恢复指令 + 权限上下文”的组合能力。

5\. 错误恢复：

Agent 应该先把错误当数据看

** 5.1 通用概念  **

错误恢复定义了 Agent 执行过程中发生故障时，Runtime 如何检测、表示和处理错误。

** 子概念  ** ：

* ** 错误检测 (Detection)  ：在哪一层发现错误——工具执行、LLM 调用、状态更新  **
* ** 错误表示 (Representation)  ：错误以什么形式存在——Exception、错误数据、状态标记  **
* ** 恢复策略 (Recovery Strategy)  ：如何处理错误——重试、回滚、跳过、交给 LLM  **
* ** 部分进度保留 (Partial Progress)  ：失败时已完成的步骤是否保留  **

** 5.2 跨框架映射  **

概念  |  LangGraph  |  OpenAI Assistants  |  Agents SDK  |  AutoGen
---|---|---|---|---
** 错误表示  ** |  Exception → pending_writes  |  Run status =  ` failed  ` |  Python Exception  |  Exception in message
** 重试  ** |  ` RetryPolicy  （per-node 配置）  ` |  自动（不透明）  |  手动  |  手动
** 回滚  ** |  ** Checkpoint 回滚  ** |  N/A（服务端托管）  |  N/A  |  N/A
** 部分进度  ** |  ** Checkpoint 保留  ** |  Thread 消息保留  |  丢失  |  对话保留
** 错误传播  ** |  可配置（error-as-data 或 raise）  |  事件通知  |  抛给调用者  |  消息传给 GroupChat

** 5.3 两种错误哲学  **

    Error-as-Exception (传统)                Error-as-Data (Agent 原生)工具调用 ──► 失败 ──► 抛异常             工具调用 ──► 失败 ──► 返回错误信息                      │                                       │                      ▼                                       ▼              框架/开发者 try/catch                      LLM 看到错误信息              决定重试/放弃                              LLM 自主决定下一步                                                       (重试/换工具/告知用户)

_ Agent Runtime 更适合把可理解的工具错误作为数据返回给模型，而不是默认打断执行。  _ 即 Error-as-Data，因为  ** LLM 有足够的推理能力来处理工具错误  ** 。这个假设在旗舰级别的模型上是成立的——它们能理解"API 返回 429 限频"并决定等待后重试。

** 5.4 LangGraph 的 Checkpoint 回滚  **

LangGraph 是唯一支持  ** Checkpoint 回滚  ** 的框架：

* 节点 A 执行成功 → 自动保存 Checkpoint A
* 节点 B 执行失败 → 异常被记录到  ` pending_writes  `
* 重新 invoke 时 → 从 Checkpoint A 恢复，只重试节点 B
* 已完成的节点 A  ** 不会重新执行  **

这对长时间运行的工作流至关重要。一个 10 步的 Agent 在第 8 步失败了，你不需要重跑前 7 步。

** 5.5 本章结论  **

错误恢复回答“失败是否会抹掉已有进度”。它同样依赖状态管理：没有 Checkpoint，失败只能重跑；有 Checkpoint，Runtime 才能保留已完成步骤并只重试失败部分。

Agent Runtime 应默认采用 Error-as-Data。Agent 的核心价值是自主决策，工具错误也应该优先作为可理解的数据交给模型处理；只有模型无法处理的系统级故障，才应该作为 Exception 向上抛。

Checkpoint 回滚是生产环境的明确缺口。长任务执行到后半段失败时，是否能从最近稳定状态恢复，直接决定这个 Runtime 能否承载真实业务流程。

##  Part 3：连接工具与观察事件：Agent 如何连接外部世界

这一部分对应任务生命周期里的“执行外部动作”和“观察事件”：Runtime 如何调用外部能力，并把执行进展暴露给外部系统。工具协议处理输入侧能力接入，流式事件处理输出侧进展同步。

6\. 工具协议：最可能先标准化的一层

** 6.1 通用概念  **

工具协议定义了 Agent 如何发现、调用和处理外部能力。

** 子概念  ** ：

* 工具定义 (Tool Definition)：描述工具的名称、参数、返回值——通常用 JSON Schema
* 工具调用 (Tool Invocation)：调用的请求/响应格式和传输方式
* 工具结果 (Tool Result)：返回给 Agent 的数据格式
* 工具发现 (Tool Discovery)：Agent 如何知道有哪些工具可用
* 错误处理 (Error Handling)：工具调用失败时的行为

** 6.2 跨框架映射  **

概念  |  LangGraph  |  OpenAI  |  AutoGen  |  Claude SDK
---|---|---|---|---
** 定义格式  ** |  ` @tool  +JSON Schema  ` |  Function Calling JSON Schema  |  ` FunctionTool  + JSON Schema  ` |  ` Tool  （JSON Schema）  `
** 调用约定  ** |  ` ToolNode  自动执行  ` |  ` requires_action  → 客户端执行  ` |  Agent 内部直接调用  |  Agent 内部直接调用
** 结果格式  ** |  ` ToolMessage  ` |  Function output（字符串）  |  ` FunctionExecutionResult  ` |  ` ToolResult  `
** 发现机制  ** |  构建时  ` bind_tools()  ` |  创建 Assistant/Response 时指定  |  创建 Agent 时注册  |  创建时  ` allowed_tools  `
** 错误处理  ** |  可配置：  handle_tool_errors=True  |  错误作为 output 返回 LLM  |  异常转为错误消息  |  错误在结果中

** 6.3 工具协议独立分层  **

工具协议的关键问题在于工具能力能否从执行模型里解耦出来。

紧耦合的做法是：

* 用 LangGraph 时，工具必须适配 LangChain  ` Tool  `
* 用 OpenAI 时，工具必须适配 Function Calling 格式
* 用 Claude SDK 时，工具必须适配它自己的工具定义
* 切换框架时，工具层跟着重写

更合理的做法是：

* 工具定义统一使用结构化 schema
* 工具调用统一表达为请求和响应
* 工具结果统一转成 Agent 可理解的消息
* 执行框架只负责编排，不直接拥有工具实现

** 6.4 MCP：工具层标准化的典型形态  **

从 Runtime Protocol 的视角看，MCP （Model Context Protocol）把工具发现、工具定义、工具调用、资源读取、Prompt 模板等能力抽象成一组客户端和服务端之间的协议对象。Host / Client / Server 的分层，让 Agent Runtime 可以通过统一连接方式接入外部能力，而不必为每个工具单独写框架绑定。

MCP 对象  |  对应工具协议能力  |  Runtime 意义
---|---|---
** Tool  ** |  工具定义、参数 schema、调用结果  |  让外部能力以统一 schema 暴露给 Agent
** Resource  ** |  可读取的上下文资源  |  把文件、文档、数据库记录等变成可发现上下文
** Prompt  ** |  可复用提示模板  |  把任务模板和工具使用方式沉淀为可调用能力
** Client / Server  ** |  传输与能力发现边界  |  解耦 Runtime 和具体工具实现

MCP 标准化的是“Agent 能调用什么、如何发现和调用”；Runtime Protocol 还要继续表达  ` Thread / Run / Step / Event / Artifact / Checkpoint / Interrupt  ` 这些任务生命周期对象。MCP 可以成为 Runtime 的工具层和上下文接入层，但完整 Runtime 仍然需要自己管理执行循环、状态持久化、流式事件、中断恢复和观测语义。

MCP 的长期价值在于把工具生态从框架内部抽出来。一个 MCP Server 可以同时服务 Claude、IDE、桌面应用、后台 Agent 或自建 Runtime；Runtime 只需要实现 MCP Client/Host 侧适配，就能复用同一组工具、资源和 Prompt。这正是工具协议最可能先标准化的原因：工具层边界清晰，输入输出结构化，和底层 loop 承载方式解耦。

这也是 如何快速创建领域Agent - OneAgent + MCPs 范式[1] 的核心判断：企业里不会存在全知全能的 God Agent，但可以用一个强基础 Agent 连接 MCP0与各种提供上下文的 MCP，把领域知识、存量服务和工具发现变成可组合的工具生态。本文把这个判断放进 Runtime Protocol 里看，就是“工具发现、工具定义、工具调用、资源读取”会先于完整 Agent Runtime 形成标准化边界。

** 6.5 Error-as-Data vs Error-as-Exception  **

工具调用失败时，有两种根本不同的处理策略：

策略  |  行为  |  代表
---|---|---
** Error-as-Data  ** |  错误信息作为工具结果返回给 LLM，由 LLM 决定如何处理  |  OpenAI（错误在 output 中）、LangGraph  (  ` handle_tool_errors=True  ` )
** Error-as-Exception  ** |  错误作为异常抛出，执行中断，由框架/开发者处理  |  传统编程模式

** Error-as-Data 是更好的默认策略  ** 。原因：

* LLM 能看到错误信息，可以自主决定重试、换工具、或告知用户
* 不需要开发者为每种错误写 try/catch
* 更接近人类使用工具的方式——工具出错了，你会看看错误信息然后决定下一步

这类设计的核心是：错误仍然是一个合法的工具结果，不是直接打断 Runtime 的异常。

** 6.6 Runtime 控制面：权限、Guardrail、预算  **

工具一旦能产生真实副作用，Runtime 就必须有控制面。控制面负责约束 Agent 能做什么、何时必须停下来、谁可以批准继续。

生产 Runtime 至少需要这些控制点：

控制点  |  作用  |  典型触发时机
---|---|---
** Permission  ** |  限制工具、文件、网络、外部系统访问  |  工具调用前
** Guardrail  ** |  检查输入/输出是否违反安全或业务规则  |  模型调用前后
** Human Review  ** |  让人类审批高风险动作  |  写文件、发请求、提交订单前
** Budget  ** |  限制 token、成本、步骤数、执行时间  |  Run 开始和每个 Step 后
** Cancellation  ** |  允许用户或系统终止执行  |  长任务、误操作、超时

OpenAI Agents SDK 把 Guardrails、Human-in-the-loop、Tracing 做成 Runtime 能力；Claude Agent SDK 暴露 permissions 和 hooks；LangGraph 通过 interrupt/checkpoint 组合实现审批和恢复。它们指向同一个趋势：Agent Runtime 不只是执行器，还是一个安全边界。

** 6.7 本章结论  **

工具协议回答“Runtime 如何连接外部能力”。它与执行模型解耦：同一个 Tool API 应该能被图式、代码式、托管式 Runtime 复用，而不是绑定在某个框架的 wrapper 里。

工具层是最可能先标准化的部分。JSON Schema 已经成为事实标准，MCP 进一步把工具发现、资源读取和 Prompt 模板从框架内部抽出来，让外部能力能被不同 Runtime 复用。

一旦工具能产生真实副作用，控制面就必须进入 Runtime。权限、Guardrail、人类审批、预算和取消不是外围功能，而是 Agent Runtime 面向真实系统时的安全边界。

7\. 流式输出：

不是 token 打字机，而是任务事件流

** 7.1 通用概念  **

流式输出定义了 Agent 执行的增量结果如何传递给消费者。协议视角下，流式输出不是"边生成边打印 token"，而是 Runtime 把一次  ` Task/Run  ` 的状态变化、消息增量、工具进展、Artifact 增量和自定义事件统一编码成事件流。

** 子概念  ** ：

* ** 传输协议 (Transport)  ：SSE、WebSocket、异步生成器、轮询  **
* ** 粒度控制 (Granularity)  ：Token 级、节点/步骤级、消息级  **
* ** 可恢复性 (Resumability)  ：断连后能否从断点继续接收  **
* ** 多通道 (Multi-channel)  ：能否同时传递不同类型的事件  **

_ 生产级流式输出不是 token 打字机，而是状态、消息、工具、产物、错误和 Trace 组成的任务事件流。  _

** 7.2 跨框架映射  **

概念  |  LangGraph Platform  |  OpenAI Assistants  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---|---
** 传输  ** |  SSE  |  SSE / 轮询  |  Python AsyncGen  |  Python AsyncGen  |  Python AsyncGen
** 粒度  ** |  9 种 StreamMode 可组合  |  固定事件类型  |  StreamEvent  |  消息级  |  事件级
** 可恢复  ** |  ** 支持  ** （Last-Event-ID + Redis Stream）  |  不支持  |  不支持  |  不支持  |  不支持
** 自定义事件  ** |  ` get_stream_writer()  ` |  不支持  |  不支持  |  不支持  |  不支持
** 子图/子 Agent  ** |  ` stream_subgraphs=True  ` |  N/A  |  不支持  |  Topic 订阅  |  N/A

** 7.3 Server vs Library：流式能力的分水岭  **

流式输出的复杂程度与 Runtime 的部署形态直接相关：

形态  |  传输  |  可恢复  |  典型
---|---|---|---
** Library（进程内）  ** |  Python AsyncGenerator  |  不需要（进程内不会断连）  |  Agents SDK、Claude SDK、AutoGen
** Server（跨网络）  ** |  SSE/WebSocket  |  ** 必须考虑  （网络会断）  ** |  LangGraph Platform、OpenAI Assistants

LangGraph Platform 的可恢复流是目前唯一完整的实现：

* Producer：将事件持久化到 Redis Stream（  ` XADD  ` ）
* Consumer：先 Catch-up 回放历史事件（  ` XREAD  ` ），再 Live Tail 实时事件
* 客户端通过  ` Last-Event-ID  ` 标识断点位置
* 服务端配置  ` stream_resumable: true  ` \+  ` on_disconnect: "continue"  `

_ 可恢复 SSE 的关键是先基于 Last-Event-ID 回放历史事件，再切换到实时 Live Tail。  _

** 7.4 本章结论  **

流式输出回答“外部系统如何实时看见 Run 的进展”。它把状态、消息、工具调用、Artifact 增量和错误统一成事件流，是 Runtime 面向前端、控制台和审计系统的主要出口。

流式能力与部署形态高度相关。进程内 Agent 可以用 AsyncGenerator；一旦跨网络部署，SSE + 可恢复流就成为刚需，因为客户端断线、服务端继续执行、之后补收事件是生产系统的常态。

因此不要把 streaming 理解成 token 打字机。生产级流式输出应该是任务事件流，并能通过 Last-Event-ID、事件持久化和多通道事件支持恢复、追踪和审计。

##  Part 4：协作、审计与评测：Agent 如何被理解

这一部分对应任务生命周期里的“跨 Agent 分工”和“评测审计”：多个 Agent 如何围绕同一任务协同，外部系统又如何理解一次执行的质量。多 Agent 关注分工边界，可观测性和可评测性关注反馈闭环。

8\. 多 Agent 协作：

最碎片化，也最不该过早押注

** 8.1 通用概念  **

多 Agent 协作定义了多个 Agent 如何共同完成一个任务。协议视角下，多 Agent 的本质不是"多个 prompt 互相聊天"，而是多个 Runtime 或多个 Agent 能否基于共同对象交换任务、消息、能力和产物。

** 子概念  ** ：

* ** 通信模式 (Communication)  ：Agent 间如何传递信息——直接发送、发布/订阅、共享状态  **
* ** 委派模型 (Delegation)  ：任务如何分配——Handoff 接力、层级分工、投票决策  **
* ** 状态共享 (State Sharing)  ：Agent 间能否看到彼此的状态——共享 / 隔离  **
* ** 拓扑结构 (Topology)  ：Agent 的组织形式——线性、星型、网状、层级  **

** 8.2 四种多 Agent 编排模式  **

下面四种是  ** 协作模式  ** ，不是框架能力边界。LangGraph 作为图式 Runtime，可以通过节点、边、状态和  ` Send  ` 等机制承载子图嵌套、Handoff 接力、群聊选择和发布-订阅等控制流；OpenAI Agents SDK、AutoGen Core 等框架只是把其中某些模式做成了更原生的使用表面。

_ 多 Agent 协作没有统一模型。子图、Handoff、群聊选择和发布订阅是四类编排语义；具体框架的差异在于哪种语义被做成一等 API，哪种需要用更底层的图、消息或工具机制表达。  _

** 8.3 跨框架映射  **

概念  |  LangGraph  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---
** 通信模式  ** |  Sub-graph / Send API / Deep Agents  ` task  ` |  Handoff（  ` transfer_to_agent  ` ）  |  GroupChat + pub/sub  |  N/A
** 委派模型  ** |  嵌套图 / 条件路由 / Subagent task  |  Handoff tool  |  Selector / RoundRobin / Swarm  |  N/A
** 状态共享  ** |  Channel 级（可配置映射）  |  共享上下文  |  共享对话  |  N/A
** 拓扑  ** |  任意（图可表达任何拓扑）  |  线性 Handoff 链  |  星型Selector）/ 顺序  |  N/A
** 并行执行  ** |  ` Send  ` API（map-reduce）  |  不支持  |  支持  |  不支持
** 分布式  ** |  LangGraph Platform 管理  |  不支持  |  ` GrpcWorkerAgentRuntime  ` |  不支持

** 8.4 设计决策分析  **

模式  |  优势  |  劣势  |  适用场景
---|---|---|---
** 子图嵌套  ** |  类型安全、状态隔离可控、可复用  |  需要提前定义图结构  |  固定工作流中的子任务分工
** Subagent task  ** |  任务委派自然、上下文隔离、可复用专长  |  需要设计子 Agent 能力边界  |  研究、代码、复杂任务分解
** Handoff 接力  ** |  简单直观，LLM 决定何时交棒  |  无并行，线性执行  |  客服转接、分工明确的流水线
** 群聊选择  ** |  最灵活，适合开放式协作  |  难以调试，选择器可能震荡  |  头脑风暴、多角色讨论
** 发布-订阅  ** |  解耦、可扩展、支持分布式  |  复杂度高，调试困难  |  大规模 Agent 集群

** 8.5 本章结论  **

多 Agent 协作回答“多个 Agent 或 Runtime 如何围绕同一个任务分工”。它建立在执行模型、工具协议和状态隔离之上，但目前也是最不该过早押注的维度。

多 Agent 是最碎片化的方向。更准确地说，图式 Runtime 能用图结构承载多种协作模式，对话框架会把群聊选择做成原生表面，代码式 SDK 会把 Handoff 做成原生表面；这些模式服务于不同执行假设，不会很快统一。

对大多数业务来说，先把单 Agent 的 Thread、Run、State、Tool、Event 和 Artifact 边界做好，再引入必要的 Handoff 或 Subagent task，比一开始设计复杂群聊拓扑更稳。

9\. 可观测性与可评测性：

看见问题与评价质量

** 9.1 通用概念  **

可观测性定义了 Agent 执行过程如何被追踪、记录和调试；可评测性定义了如何基于这些观测数据对 Agent 质量进行评价、归因和持续优化。

** 二者的关系  ** ：

* ** 可观测性偏  运行时：Trace、Event、State Snapshot 帮助开发者在运行时定位问题、理解因果、回放状态。  **
* ** 可评测性  偏事后：基于可观测数据形成质量指标、Badcase 分析、对比实验、反馈闭环，进而驱动 Prompt、工具、编排策略的自优化。  **

没有可观测性，评测就缺乏数据基础；没有可评测性，可观测数据只能用于调试，无法形成质量改进闭环。生产级 Agent Runtime 需要同时提供两者：既能看见“它怎么跑的”，也能评价“它跑得好不好”。

** 子概念  ** ：

* ** Tracing  ：分布式追踪——每个步骤的输入/输出、耗时、因果关系  **
* ** Logging  ：事件日志——Agent 运行过程中的关键事件记录  **
* ** Metrics  ：量化指标——延迟、Token 消耗、成本、成功率  **
* ** Debugging  ：调试能力——步进执行、状态回放、条件断点  **

** 9.2 跨框架映射  **

概念  |  LangGraph  |  OpenAI  |  AutoGen  |  Claude SDK
---|---|---|---|---
** Tracing  ** |  LangSmith（付费产品）  |  内置 Traces（不透明）  |  无内置  |  无内置
** 事件日志  ** |  ` stream_mode="events"/"debug"  ` |  Run Steps API  |  ` Console  ` \+ stdlib logging  |  Event stream
** Token 统计  ** |  Callback 回调  |  ` Usage  ` 对象  |  Usage tracking  |  Response 中的 usage
** 执行回放  ** |  ** Checkpoint history  ** |  Thread 消息历史  |  不支持  |  不支持
** 成本追踪  ** |  LangSmith  |  OpenAI Dashboard  |  手动  |  手动

** 9.3 Trace 的最小语义模型  **

OpenAI Agents SDK 的 Tracing 设计给了一个很好的参照：Trace 表示一次端到端工作流，Span 表示其中一个有开始和结束时间的操作。一个 Agent Runtime 的 Trace 至少应该表达：

Span类型  |  对应Runtime动作  |  关键字段
---|---|---
** Run Span  ** |  一次完整执行  |  run_id、session_id、status、cost
** Agent Span  ** |  某个 Agent 被激活  |  agent_id、instructions_version、tools
** Generation Span  ** |  一次 LLM 调用  |  model、prompt_tokens、completion_tokens
** Tool Span  ** |  一次工具调用  |  tool_name、arguments、result、is_error
** Handoff Span  ** |  Agent 间交接  |  source_agent、target_agent、reason
** Guardrail Span  ** |  安全/业务规则检查  |  rule_name、pass/fail、action
** Interrupt Span  ** |  人类介入点  |  payload、resume_value、latency

这比普通日志强很多，因为它保留了父子关系和因果链。你不只是知道"调用了工具"，而是知道它属于哪次 Run、由哪个 Agent 触发、消耗多少、失败后是否重试、最终是否影响输出。

** 9.4 三类观测数据  **

Agent Runtime 的可观测性不能只看 Trace，还要同时看事件和状态：

类型  |  解决的问题  |  示例
---|---|---
** Trace  ** |  为什么这次执行走到这里  |  LLM 调用、工具调用、Handoff、Guardrail
** Event Stream  ** |  现在正在发生什么  |  token、progress、custom event、interrupt
** State Snapshot  ** |  当时系统处于什么状态  |  checkpoint、messages、pending writes

Trace 更适合事后分析，Event Stream 更适合前端实时展示，State Snapshot 更适合恢复和调试。生产 Runtime 应该三者打通：事件能定位到 Span，Span 能定位到 Checkpoint，Checkpoint 能恢复出当时状态。

_ Trace 解释因果，Event Stream 展示实时进展，State Snapshot 支持恢复和调试；三者打通后才能支撑评测闭环。  _

** 9.5 设计决策分析  **

可观测性是  ** 所有框架中最薄弱的维度  ** 。具体问题：

1. ** 没有标准的 Trace 格式  ** ：LangSmith 有自己的 Trace 格式，OpenAI 有自己的 RunStep 格式，两者不互通。Agent 执行的 Trace 需要一个类似 OpenTelemetry 的开放标准。

2. ** Tracing 和框架绑定太深  ** ：LangSmith 只能追踪 LangChain/LangGraph 的执行。如果你的工作流混用了多个框架，没有统一视图。

3. ** 调试能力严重不足  ** ：只有 LangGraph 的 Checkpoint History 能做真正的"时间旅行调试"（回到任意一步查看当时的状态）。其他框架只能看日志。

** 9.6 可评测性：从可观测到质量闭环  **

可评测性是可观测性的下游。一个具备可评测性的 Runtime 应该能回答：

* ** 质量指标  ：准确率、召回率、Pass Rate、Token 成本、延迟、用户满意度  **
* ** 归因分析  ：某次失败是 Prompt 问题、工具问题、状态管理问题，还是编排策略问题  **
* ** 对比实验  ：同一任务在不同策略下的表现差异（A/B 测试、Prompt 变体、工具链变体）  **
* ** 反馈闭环  ：评测结果如何驱动 Prompt 更新、工具优化、编排策略调整  **
* ** Badcase 管理  ：失败案例的结构化记录、分类、复现和追踪  **

当前框架的可评测能力普遍较弱。多数框架只提供 Trace 和 Event，但不提供：

* 标准化的质量指标定义
* 自动化的 Badcase 归因
* 对比实验的协议支持
* 评测结果到配置的自动反馈

这导致可观测数据主要停留在“调试用”，难以形成“质量改进闭环”。无论是自己建还是框架提供能力，都需要下面的：

* ** 评测协议  ：定义质量指标、评测数据集、对比实验的标准接口  **
* ** 归因工具  ：从 Trace 自动推断失败根因  **
* ** 反馈机制  ：评测结果能自动驱动 Prompt/工具/策略的调整  **
* ** Badcase 库  ：结构化失败案例，支持复现和追踪  **

** 9.7 本章结论  **

可观测性与可评测性回答“如何看见并评价一次 Run”。它收束前面的 Step、Event、State Snapshot、Artifact 和 Error，把 Runtime 执行过程变成可调试、可审计、可优化的数据。

Agent 需要同时具备可观测性和可评测性。可观测性需要 OpenTelemetry-like 的 Span、Trace、Event、State Snapshot、Artifact Link 和 Cost Attribution；可评测性需要 Metric Schema、Evaluation Dataset、Badcase Schema、Experiment Protocol 和 Feedback Loop。

生产级 Runtime 必须把两者打通：可观测数据应该能直接用于评测，评测结果应该能驱动 Prompt、工具和编排策略更新，形成“看见问题 → 评价质量 → 归因分析 → 优化策略”的闭环。

10\. Agent Protocol

对象如何落到 Runtime 能力

如果用协议主线串起来，前面的生命周期和八个维度可以归结为一张映射表：

Protocol 对象/操作  |  外部契约  |  Runtime 需要实现的能力  |  对应章节
---|---|---|---
** Agent Card / Metadata  ** |  告诉别人我是谁、会什么、怎么调用  |  Agent 注册、能力描述、权限声明、版本管理  |  2、6、8
** Thread / Context  ** |  承载多轮上下文和参与者  |  会话管理、历史保存、上下文裁剪、参与者隔离  |  3
** Message / Part  ** |  表达用户、Agent、工具的通信内容  |  多模态输入、结构化数据、文件引用、消息追加  |  3、6
** Task / Run  ** |  表达一次可管理的执行  |  调度、状态机、取消、超时、预算、重试  |  2、4、5
** Step / Run Step  ** |  表达执行内部的可观测步骤  |  LLM 调用、工具调用、Handoff、Guardrail 记录  |  2、9
** Event Stream  ** |  表达进展增量  |  SSE、Last-Event-ID、事件持久化、多通道流  |  7
** Interrupt / Input Required  ** |  表达需要人类或外部系统继续  |  Checkpoint、resume、审批、授权、表单输入  |  4
** Artifact  ** |  表达任务产物  |  文件管理、产物版本、增量产出、可追溯链接  |  3、7、9
** Todo / Plan  ** |  表达长任务的显式计划  |  任务分解、进度跟踪、计划更新、上下文压缩  |  2、8
** Workspace / Backend  ** |  表达 Agent 可读写的工作区  |  virtual filesystem、shell、store、权限、隔离  |  2、3、6
** Skill  ** |  表达可复用能力包  |  动态加载、权限控制、子 Agent 复用、脚本/参考资料  |  6、8
** Trace / Span  ** |  表达执行因果链  |  观测埋点、成本归因、状态关联、审计  |  9
** Error  ** |  表达失败和下一步可能动作  |  Error-as-Data、异常边界、回滚、重试策略  |  5

Agent Protocol 不是 Runtime 之外的"接口文档"，而是 Runtime 架构的反向约束。一个 Runtime 如果无法稳定表达这些对象，就很难被前端、控制台、评测系统、审计系统和其他 Agent 复用。

** 10.1 一个好的 Agent Runtime Protocol  **

** 应该满足什么  **

综合 A2A、AITP、ACP、LangGraph Server API、OpenAI Assistants 和 AG-UI 的设计，可以抽象出 9 条协议设计原则：

1. ** 任务对象一等化  ：不能只有 request/response，必须有可查询、可取消、可恢复的 Task/Run  **
2. ** 上下文对象一等化  ：Thread/Context 不能只是 messages 数组，还要承载参与者、能力和元数据  **
3. ** 步骤对象一等化  ：Run 内部的 LLM 调用、工具调用、Handoff、Guardrail、Subagent task 都应该能被表达为 Step/Run Step  **
4. ** 事件流标准化  ：token、状态、工具、Artifact、错误都应该是同一条事件流上的不同事件  **
5. ** 产物对象一等化  ：长任务的结果不应只塞进最终文本，而要成为可引用的 Artifact  **
6. ** 中断是状态，不是异常  ：  INPUT_REQUIRED  、  AUTH_REQUIRED  这类状态应该进入协议状态机  **
7. ** 发现与能力声明分离  ：Agent metadata 负责发现，Capability 负责表达可选增强能力  **
8. ** 协议绑定可替换  ：同一语义对象可以绑定到 REST、SSE、JSON-RPC、gRPC 或消息队列  **
9. ** 观测语义内建  ：Trace/Span/Event ID 应该从协议层贯穿到 Runtime 内部  **

** 10.2 Protocol 与 Runtime 的边界  **

Protocol 不应该规定模型怎么思考，也不应该规定内部必须用 Graph、Actor 还是 Code Loop。它应该规定：

* 哪些资源可以被创建、查询、更新、取消
* 每个资源有哪些稳定状态
* 客户端如何订阅变化
* 人类或其他 Agent 如何补充输入
* 产物和错误如何被表达
* 观测系统如何关联一次执行

Runtime 则负责：

* 如何选择模型和工具
* 如何调度步骤
* 如何保存和迁移状态
* 如何隔离工作区
* 如何处理副作用
* 如何把内部细节映射回协议对象

** 最好的协议是低约束的  ，  最好的 Runtime 是高内聚的  ** ：协议只定义外部可依赖的语义边界，Runtime 在边界内保持实现自由。

11\. 跨维度分析：

设计决策的持久性判断

以下是我个人的一些判断。

** 11.1 哪些设计决策会持久？  **

设计决策  |  持久性  |  理由
---|---|---
Graph 是唯一最优 Runtime 形态  |  ** 流行  ** |  代码式 Runtime、图式 Runtime、托管式 Runtime 会按场景并存；混合模式正在出现
Handoff 是多 Agent 标准  |  ** 流行  ** |  太简单，无法处理并行和复杂拓扑
Conversation 是独立底层执行模型  |  ** 流行  ** |  它更像运行在不同 Runtime 之上的编排协议，不应和 Graph / Code / Managed 平级
Checkpoint 链式版本控制  |  ** 可能持久  ** |  概念有价值（类 Git），但实现可能简化
状态持久化是核心能力  |  ** 持久  ** |  没有持久化的 Agent 无法用于生产
Error-as-Data 优于 Error-as-Exception  |  ** 持久  ** |  Agent 需要自主推理错误，不是抛异常然后崩溃
SSE 是流式标准  |  ** 持久  ** |  HTTP 原生、浏览器原生、自带重连机制
Server-managed Runtime 是生产必需  |  ** 持久  ** |  但形态未定——可以是 Platform 也可以是自建

** 11.2 行业收敛趋势  **

** 正在收敛的  ** ：

* Agent 任务对象（Task / Run）
* Agent 上下文对象（Thread / Context）
* Agent 步骤对象（Step / Run Step / Tool Call）
* Agent 事件流（SSE + 标准事件类型）
* Agent 产物对象（Artifact / File / Structured Output）
* 工具定义格式（JSON Schema）
* 工具调用协议
* 流式传输协议（SSE）
* 错误处理哲学（Error-as-Data）

** 没有收敛的  ** ：

* Runtime Loop 承载方式（图式 Runtime / 代码式 Runtime / 托管式 Runtime 并存）
* 编排协议模式（ReAct / Plan-and-Execute / Conversation-style coordination / Manager-Worker 并存）
* 状态管理（Checkpoint / Thread / 手动管理并存）
* 多 Agent 协作（各框架完全不兼容）
* 可观测性标准（各自为战）

2 年内，Agent Protocol 会先在  ` Thread / Task / Run / Step / Message / Artifact / Event / Checkpoint  ` 这些外部对象上收敛，工具层会继续标准化，流式层会统一到 SSE + 可恢复流，但 Runtime Loop 承载方式、编排协议和多 Agent 协作  ** 不会统一  ** ——因为它们解决的问题空间太大，不存在一个"最优解"。相对来说，Graph 可以认为是编排协议的一个超集。

** 11.3 作为开发者，重点关注什么？  **

方向  |  建议  |  理由
---|---|---
Agent Protocol 对象模型  |  ** 重点投入  ** |  Thread、Run、Step、Artifact、Event、Checkpoint 会成为跨框架通用语言
工具协议抽象  |  ** 重点投入  ** |  工具定义、调用、结果处理的设计模式跨框架可迁移
状态管理抽象  |  ** 重点投入  ** |  无论哪个框架，状态持久化的设计模式是通用的
Harness 易用性判断  |  ** 重点投入  ** |  开箱即用程度决定团队能否低成本把 Runtime 能力真正用起来
Error-as-Data 模式  |  ** 理解并应用  ** |  改变你写 Agent 的方式，不依赖框架
特定框架的执行模型  |  ** 谨慎投入  ** |  深入 1-2 个即可，重点理解 why，不是记 API
多 Agent 模式  |  ** 观望  ** |  太碎片化，等标准出现再深入不迟
可观测性  |  ** 关注 OpenTelemetry 方向  ** |  Agent Tracing 标准化是迟早的事

** 11.4 如果我从零设计 Agent Runtime Protocol  **

_ 从零设计 Agent Runtime Protocol 时，外部协议对象应该保持稳定，内部 Runtime 能力则围绕调度、状态、流式、中断、工具、控制面和观测面高内聚实现。  _

对图中每个维度，我觉得如果按下面选择从头来最好：

维度  |  我的选择  |  理由
---|---|---
** 协议对象  ** |  Agent / Thread / Run / Step / Message / Event / Artifact / Checkpoint  |  这些是外部系统真正依赖的稳定边界
** 执行模型  ** |  混合：图式 Runtime 做复杂工作流，代码式 Runtime 做简单任务，编排协议按场景选择  |  LangGraph 的  ` @entrypoint  ` /  ` @task  ` 方向正确——图式能力为底，代码式表面为简
** 状态管理  ** |  Checkpoint-based，自动 per-step 快照  |  这是中断恢复、错误回滚、调试回放的前提
** 工具协议  ** |  统一 Tool API + Adapter  |  不再写框架特定的 Tool wrapper
** 流式输出  ** |  SSE + 可恢复流（Redis Stream）  |  生产环境断线恢复是刚需
** 中断/恢复  ** |  通用  ` interrupt(payload)  ` \+  ` resume(value)  ` |  参考 LangGraph 但简化  ` Command  ` 的复杂度
** 错误恢复  ** |  Error-as-Data 默认，系统错误才 raise  |  让 LLM 自主处理工具错误
** 多 Agent  ** |  Sub-graph 做紧耦合，消息协议做松耦合  |  避免把所有 Agent 都塞进同一种编排模型
** 可观测性  ** |  OpenTelemetry Span 作为一等原语  |  每个节点执行自动生成 Span，不依赖特定平台
** 控制面  ** |  权限、Guardrail、预算、取消内建  |  Agent 能产生真实副作用时，控制面就是安全边界
** 工作区  ** |  Workspace/Sandbox 一等化  |  文件、浏览器、代码仓库都属于 Runtime 状态

** 11.5 “用哪个框架”不重要，  **

** 重点是“我需要什么 Runtime 能力”  **

Agent 框架还会继续变化。今天是 LangGraph、OpenAI Agents SDK、AutoGen、Claude Agent SDK，明天可能会出现新的图式 Runtime、新的编排协议、新的多 Agent 协作框架和新的托管式 Runtime。每个框架都会带来新的对象名、新的 API 形状和新的最佳实践。

但生产级 Agent 系统真正绕不开的问题一直稳定：一次执行如何创建、取消、重试和结束；哪些历史、文件、状态和权限对当前执行可见；失败、中断、升级后系统还能不能恢复；前端、评测和审计系统如何知道 Agent 正在做什么；最终产物如何被保存、引用、追溯和复用；Agent 什么时候可以真的改文件、发请求或下订单。

如果只盯着框架 API，很容易被短期流行牵着走；如果先建立 Runtime Protocol 的概念模型，就能反过来审视框架：它是否稳定表达  ` Thread / Run / Step / Event / Artifact / Checkpoint  ` ，是否具备真正的状态持久化和可恢复事件流，是否把工具层从框架绑定中抽出来，是否能支撑调试、审计、成本归因和质量评估。

对我来说，理解 Runtime Protocol 的价值，是把知识从“框架熟练度”提升到“系统设计判断力”。框架值得学，但不要只学框架；框架终究只是对现实问题的抽象。

##  附录 A：术语对照表

通用概念  |  英文  |  LangGraph  |  OpenAI Assistants  |  Agents SDK  |  AutoGen  |  Claude SDK
---|---|---|---|---|---|---
执行上下文  |  Execution Context  |  Thread + Run  |  Thread + Run  |  Runner  |  Runtime + Team  |  Session
执行单元  |  Execution Unit  |  Node  |  Run Step  |  Agent turn  |  Message handler  |  Agent turn
状态快照  |  State Snapshot  |  Checkpoint  |  Thread state  |  N/A  |  ` save_state()  ` |  N/A
状态持久化器  |  State Persister  |  Checkpointer  |  服务端托管  |  N/A  |  手动  |  N/A
工具定义  |  Tool Definition  |  ` @tool  ` /  ` BaseTool  ` |  Function  |  ` @function_tool  ` |  ` FunctionTool  ` |  ` Tool  `
工具调用结果  |  Tool Result  |  ` ToolMessage  ` |  Function output  |  Tool output  |  ` FunctionExecutionResult  ` |  ` ToolResult  `
中断点  |  Interrupt Point  |  ` interrupt()  ` |  ` requires_action  ` |  Guardrail  |  ` HandoffTermination  ` |  ` interrupt()  `
恢复指令  |  Resume Command  |  ` Command(resume=)  ` |  ` submit_tool_outputs  ` |  手动代码  |  ` run_stream(task=)  ` |  新  ` query()  `
流式事件  |  Stream Event  |  ` StreamPart  ` |  SSE Event  |  ` StreamEvent  ` |  Message  |  Event
子 Agent  |  Sub-Agent  |  Subgraph  |  N/A  |  Handoff  |  Nested Team  |  Task tool
执行追踪  |  Execution Trace  |  LangSmith Trace  |  Run Steps  |  SDK Traces  |  Console log  |  N/A
错误结果  |  Error Result  |  error-as-data / raise  |  ` last_error  ` |  Exception  |  错误消息  |  Hook 通知

##  附录 B：各框架参考链接

###  LangGraph

* 官方文档：  https://langchain-ai.github.io/langgraph/
* GitHub（开源）：  https://github.com/langchain-ai/langgraph
* LangGraph Platform 文档：  https://langchain-ai.github.io/langgraph/cloud/
* Python SDK：  https://github.com/langchain-ai/langgraph-sdk
* Interrupts 文档：  https://docs.langchain.com/oss/python/langgraph/interrupts

###  Deep Agents

* Deep Agents overview：  https://docs.langchain.com/oss/python/deepagents/overview
* Deep Agents customization：  https://docs.langchain.com/oss/python/deepagents/customization
* Deep Agents middleware：  https://docs.langchain.com/oss/python/deepagents/middleware
* Deep Agents skills：  https://docs.langchain.com/oss/python/deepagents/skills
* Frameworks, runtimes, and harnesses：  https://docs.langchain.com/oss/python/concepts/products

###  OpenAI

* Assistants API：  https://platform.openai.com/docs/assistants
* Responses API：  https://platform.openai.com/docs/api-reference/responses
* Agents SDK：  https://github.com/openai/openai-agents-python
* Agents SDK 文档：  https://openai.github.io/openai-agents-python/
* Agents SDK Tracing：  https://openai.github.io/openai-agents-python/tracing/
* Function Calling：  https://platform.openai.com/docs/guides/function-calling

###  AutoGen

* 官方文档：  https://microsoft.github.io/autogen/
* GitHub（开源）：  https://github.com/microsoft/autogen
* AgentChat 快速入门：  https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/quickstart.html

###  Claude Agent SDK

* Anthropic API 文档：  https://docs.anthropic.com/
* Claude Code 文档：  https://docs.anthropic.com/en/docs/claude-code
* Agent SDK（开源）：  https://github.com/anthropics/claude-code/tree/main/packages/claude-agent
* Agent SDK 概览：  https://code.claude.com/docs/en/agent-sdk/overview

###  相关标准与协议

* LangChain Agent Protocol：  https://langchain-ai.github.io/agent-protocol/
* LangChain Agent Protocol API：  https://langchain-ai.github.io/agent-protocol/api.html
* LangChain Agent Protocol GitHub：  https://github.com/langchain-ai/agent-protocol
* A2A Protocol Specification：  https://a2a-protocol.org/latest/specification/
* AITP：  https://aitp.dev/
* AITP Threads：  https://aitp.dev/threads
* IBM Agent Communication Protocol：  https://research.ibm.com/projects/agent-communication-protocol
* AG-UI Protocol：  https://docs.ag-ui.com/introduction
* SSE 规范（WHATWG）：  https://html.spec.whatwg.org/multipage/server-sent-events.html
* JSON-RPC 2.0：  https://www.jsonrpc.org/specification
* JSON Schema：  https://json-schema.org/
* OpenTelemetry：  https://opentelemetry.io/
* OpenTelemetry AI Agent Observability：  https://opentelemetry.io/blog/2025/ai-agent-observability/
* Google A2A Protocol：  https://github.com/google/A2A

其它参考链接：  [1]https://mp.weixin.qq.com/s/1klXy2fr1pspqRshUjg2dQ  [2]https://mp.weixin.qq.com/s/4LvnghM71g0udkHYVvkhwA

千问云  \-  为  Agent  而生，驱动  AI  生产力
扫描下方二维码，直达千问云体验

点击
