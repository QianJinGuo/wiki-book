---
title: "拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化"
source: wechat
url: https://mp.weixin.qq.com/s/MWB1iG1rZYpV5a4Ob1XWpg
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: a235af5461ed47e5f7e1c2b9d6dda0d0bc89dff7aa5ca33ff01a36efe9396dfc
---

# 拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化

**来源**: 科技充电站

**发布日期**: 2026-02-26

**原文链接**: https://mp.weixin.qq.com/s/MWB1iG1rZYpV5a4Ob1XWpg

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第一篇。

OpenClaw 是 GitHub 历史上增长最快的开源项目，200K+ stars，70 天不到。网上分析它的文章很多，但大多停留在"它能控制你的电脑"这个层面。我想做的不一样，我要扒开它的源码，一个模块一个模块地拆，拆到技术人看了觉得"有料"的程度。

第一篇，我们从最底层开始：Gateway 与 Channels。

先不聊架构，先看一个具体场景。

你在 Telegram 里给你的 OpenClaw Agent 发了一句话："帮我查一下明天北京的天气"。这条消息从你手指触屏的那一刻起，到你看到回复，中间经历了什么？

grammY 库接收到 Telegram 的 Update 事件，Channel Adapter 把它归一化成一个统一的  InboundContext  结构，Gateway Server 根据你的 chat_id 和 agent 配置路由到正确的会话，Lane Queue 把这条消息排进队列并串行执行，Agent Runner 组装好 system prompt 调用 LLM，Agentic Loop 开始"思考-工具调用-观察"的循环，最后 Response Path 把回复分块（Telegram 单条消息上限 4096 字符）流回你的聊天窗口，同时写入一份 JSONL 转录文件。

六个阶段，一条流水线，从头走到尾。

这就是 OpenClaw 的 6 阶段执行流水线。看起来不复杂对吧？但真正有意思的地方在细节里。比如，为什么同一个会话内的消息要强制串行执行？为什么选 JSONL 追加写而不是数据库？为什么一个 Node.js 进程能同时撑起 20 多个平台的消息收发？

这些问题背后，是一系列非常老练的工程决策。

## Gateway：一个 Node.js 进程统治一切

OpenClaw 的 Gateway 是一个用 TypeScript 写的长驻 Node.js 进程，要求 Node 22+，默认绑定  127.0.0.1:18789  。它是整个系统的神经中枢，采用经典的 Hub-and-Spoke 架构，所有的消息面、会话路由、Agent 编排、事件协调全归它管。

一个主机只能跑一个 Gateway，这不是建议，是硬性架构约束。

为什么？

因为 WhatsApp 的 Baileys 协议严格限制单设备会话，同一手机号不能同时在多个 Web 会话中活跃。这不是 OpenClaw 想不想多开的问题，是底层协议不让你多开。类似的约束在 iMessage 上也存在，必须跑在真实的 Mac 硬件上才能访问私有 API。

做过即时通讯系统的朋友应该能体会这种痛，你的架构设计很多时候不是被自己的需求决定的，而是被第三方平台的协议约束逼出来的。

OpenClaw 选择用一个单例进程收敛所有复杂性，把多平台接入的"脏活"封装在一层，让上面的 Agent 逻辑完全不用操心你的消息是从 Telegram 来的还是从 Slack 来的。

这个设计选择还有另一层含义：Gateway 是有状态的。它明确拒绝了云原生世界推崇的无状态假设。

为什么敢这么做？三个原因。

LLM 调用成本， 每次重建完整上下文要传输大量 token，这笔钱是实打实的； 用户体验连续性， 用户期望 Agent "记得"之前说过什么，不能每次从零开始； Agentic 循环的本质， 多轮工具调用和观察需要维护中间状态，你没法把一个正在执行的工具链拆成无状态片段。

代价嘛，水平扩展基本别想了。但 OpenClaw 的定位是个人 AI 助手，不是企业级客服系统，单机垂直扩展足够用。这是一个非常精准的产品判断反过来影响了架构决策的典型案例。

## 六阶段流水线：每一步都有讲究

让我把六个阶段拆开来看。

### Stage 1：Channel Adapter

每个平台有自己的适配器，Telegram 用 grammY，WhatsApp 用  @whiskeysockets/baileys  ，Discord 用  discord.js  （通过  @buape/carbon  封装），Slack 用  @slack/bolt  ，Signal 走  signal-cli  外部守护进程通过 SSE 连接。代码分散在  src/telegram/bot.ts  、  src/discord/monitor.ts  、  src/slack/monitor.ts  这些文件里。

适配器干四件事：authenticate、listen、normalize、deliver。

最核心的是 normalize。不管外面长什么样，进来之后都变成同一种  InboundContext  结构，包含 sessionKey、channel、sender、text、groupHistory、replyTarget 六个字段。这六个字段就是后续所有处理的"合同"，跟平台无关。

归一化过程中有个很容易被忽略的细节：去重。Telegram 通过  update_id  加消息哈希做去重，WhatsApp 通过消息键跟踪。为什么要去重？因为在不稳定网络环境下，平台 SDK 可能会重复推送同一条消息，如果不在入口处拦住，后面的 Agent 就会对同一条指令执行两次。

### Stage 2：Gateway Server

路由层。  src/routing/resolve-route.ts  里的  resolveAgentRoute()  函数负责确定一条消息属于哪个 Agent、哪个会话。

Session key 的设计非常有意思，它是一个层级化的字符串：

agent:{agentId}:{channel}:{scope}:{identifier}

比如  agent:main:telegram:dm:123456789  表示 Telegram 私聊会话，  agent:work:slack:group:guild_456:ch_devops_789  表示工作区 Slack 频道。这种设计天然支持多 Agent 隔离和跨通道会话管理。

路由算法是"最精确匹配优先"：peer 匹配（精确 DM/群组 ID）优先级最高，然后是 guild、team、account、channel，最后是 default 回退。六级优先级策略，确保消息总能找到最合适的归属。

### Stage 3：Lane Queue

这是整个流水线里我觉得最值得深聊的部分。

Lane Queue 的核心设计原则是四个字： 默认串行 。

同一个会话内的消息，严格按顺序一条一条处理。你连续发了三条消息，它会等第一条处理完再处理第二条，绝不并行。不同会话之间可以并发，但单个会话内，串行就是铁律。

你可能会问：这不是浪费吗？并行不是更快？

不是。在 Agentic 系统里，并行是危险的。

想象一个场景：你发了"帮我创建一个 config.json 文件"，紧接着又发了"在 config.json 里加一个 port 字段"。如果这两条消息并行处理，第二条可能在第一条还没创建完文件的时候就开始执行了，结果就是文件找不到，操作失败。更糟糕的是，如果两条消息都涉及文件修改，并行执行可能导致写冲突，最终产出一个损坏的文件。

这就是竞态条件，分布式系统的经典噩梦。OpenClaw 的选择很朴素，也很有效：在会话级别用串行执行彻底消灭竞态问题。

系统维护四类 Lane：

Lane 类型
绑定粒度
并发度
设计意图

Session Lane
session key
严格串行（1）
保证单会话因果一致性

Global Lane
全局单例
有限并行（默认 4）
控制系统整体并发

Cron Lane
定时任务
独立调度
心跳/定时任务不阻塞对话

Subagent Lane
子 Agent
并行（默认 8）
后台任务隔离

注意 Cron Lane 和 Subagent Lane 是独立的。心跳检查永远不会阻塞你的实时对话，子 Agent 的后台任务也不会抢占主会话的执行资源。这个分离设计很优雅。

串行执行的代价是潜在的队头阻塞（head-of-line blocking），如果某条消息触发了一个耗时很长的工具调用，后面的消息就得排队等着。OpenClaw 用几种消息处理模式来缓解这个问题：

- •
  steer 模式：
  用户发了新消息后，系统会在下一个工具调用边界取消当前正在等待执行的工具，把新消息注入当前运行。适合用户中途改主意的场景，"等等，别查天气了，帮我发封邮件"

- •
  collect 模式：
  把排队中的多条消息合并为一个 followup，减少模型调用次数。你连发三条消息补充需求，Agent 不会傻乎乎地分三次处理，而是合在一起理解

- •
  interrupt 模式：
  紧急中断当前执行

这套设计让我想到我们团队之前做消息队列的经历。当时也纠结过串行还是并行，最后选了分区有序（Kafka 的 partition 模型），跟 OpenClaw 的 Session Lane 思路异曲同工：在合理的粒度上保证顺序，在更大的粒度上允许并发。

### Stage 4 & 5：Agent Runner 和 Agentic Loop

这两个阶段是 Agent 的"大脑"，后续系列会详细拆解，这里先简单带过。

Agent Runner 在  src/agents/pi-embedded-runner/  目录下，负责组装 system prompt（从 SOUL.md、AGENTS.md、工具列表、技能、记忆等来源拼装），解析模型选择，处理 API key 冷却和 fallback。

有一个大多数分析文章都忽略的事实： OpenClaw 并不实现自己的 Agent 运行时 ，核心的 Agentic Loop（思考-行动-观察循环）由 Pi Agent 框架（  @mariozechner/pi-agent-core  ）处理。OpenClaw 构建的是 Gateway、编排、Channel 集成、Memory 和 Skill 这些"周边"层。

这揭示了一个深层判断： Agent 的真正难题不在 LLM 调用本身，而在调用周围的一切 。怎么管理上下文？怎么路由消息？怎么持久化会话？怎么保证安全？怎么接入 20 多个平台？这些"周边"问题才是 OpenClaw 430,000+ 行 TypeScript 真正在解决的东西。

### Stage 6：Response Path

回复路径的核心挑战是各平台的消息长度限制不同。

src/auto-reply/chunk.ts  里的  chunkTextWithMode()  函数支持两种分块模式：按长度切（  length  模式）和按换行切（  newline  模式）。各平台上限：Telegram 4096 字符、Discord 2000、WhatsApp 4096、Signal 4096。

这个看似简单的分块逻辑其实很容易出 bug。你不能在一个 Markdown 代码块中间切开，不能把一个链接拆成两半，不能在表格的某一行中间断开。处理这些边界情况比听起来要麻烦得多。

回复在流回用户的同时，还会写入 JSONL 转录文件。这就引出了下一个话题。

## JSONL：用最笨的办法解决最难的问题

会话数据持久化在  ~/.openclaw/agents/{agentId}/sessions/{sessionId}.jsonl  文件中。每行一个 JSON 对象，记录一个事件：用户消息、助手响应、tool_use、tool_result。

为什么选 JSONL 追加写（append-only）而不是 SQLite 或者 MongoDB？

追加写有一个杀手级优势： 崩溃安全 。进程在任何时刻崩溃，最多丢失正在写的那一行。文件系统保证追加操作的原子性（在大多数文件系统上，对一个 block 内的写入是原子的），你不需要 WAL（Write-Ahead Log），不需要事务回滚，不需要 checkpoint。整个恢复逻辑就是：读文件，跳过最后一行（如果它不完整），完事。

这种设计在数据库领域有个名字叫 append-only log，Kafka 和很多事件溯源系统用的也是这个思路。OpenClaw 把它用在了会话持久化上，简单到了极致。

除了会话 JSONL，还有  gateway.log  （投递日志）和  telemetry.jsonl  （结构化遥测）。遥测文件有个细节值得关注：它用 SHA-256 哈希链做防篡改检测，每条记录包含上一条的哈希值，形成一条不可篡改的链。这在安全审计场景下非常有用。

## Channels：20+ 平台背后的适配器艺术

再回过头来看 Channels 层。

OpenClaw 当前支持的核心 Channel 包括 WhatsApp、Telegram、Discord、Slack、Signal、iMessage、IRC、WebChat，加上通过插件扩展的 Google Chat、Microsoft Teams、Matrix、Mattermost、飞书/Lark、LINE、Twitch 等，总共 20+ 个平台。

插件 Channel 通过  package.json  的  openclaw.extensions  字段注册，配置存在时自动热加载。这意味着添加一个新平台不需要动 OpenClaw 核心代码，写个适配器插件就行。

但"归一化"三个字说起来轻巧，做起来全是坑。

### 线程模型：各家各玩各的

不同平台对"线程"的理解完全不同。Telegram 支持论坛群组里的话题（Topic），session key 会追加  :topic:{topicId}  做细粒度隔离；Discord 有原生的 Thread 概念；Slack 用  thread_ts  追踪回复线程。

而 WhatsApp 和 Signal 压根没有线程的概念，所有群组消息共享一个会话。这意味着在 WhatsApp 群里，不管多少人在聊多少个话题，Agent 看到的都是同一个扁平的消息流。如何在这种场景下保持对话连贯性，完全靠 Agent 自己的理解能力。

这个差异对架构的影响比想象中大。有线程支持的平台，session key 粒度可以很细，Agent 可以在不同线程里维护独立的上下文；没有线程支持的平台，session key 只能到群组级别，Agent 要自己判断当前消息是在跟谁聊什么话题。

### 访问控制：谁能跟你的 Agent 说话

OpenClaw 在 Channel 层就做了一道访问控制门槛。

DM（私信）策略有三种模式。  pairing  模式最有意思：陌生人给你的 Agent 发消息，Agent 会回复一个 6 位验证码，5 分钟内有效，你作为管理员在命令行里执行  openclaw pairing approve {channel} {code}  审批通过后才能聊。  allowlist  模式简单粗暴，只有白名单里的人能发消息。  open  模式则来者不拒，但需要显式配置  allowFrom: [""]  。

群组策略额外支持一个  requireMention  标志，开启后 Agent 只在被 @提及 时才响应。这个设计在实际使用中非常实用，你不会想让 Agent 对群里每一条闲聊都插嘴。

## WebSocket 协议：类型安全的实时通信

Gateway 和客户端之间通过 WebSocket 通信，使用 JSON 文本帧。协议设计得非常规整，三种消息类型覆盖所有场景：

Request： 客户端发给 Gateway，格式  {type:"req", id, method, params}  ，id 由客户端生成，用于关联响应。

Response： Gateway 回给客户端，格式  {type:"res", id, ok, payload|error}  ，携带对应请求的 id。

Event： Gateway 主动推送，格式  {type:"event", event, payload, seq?, stateVersion?}  ，没有 id，客户端通过 event 字段做分发。

消息 schema 用 TypeBox 定义，这是一个运行时类型验证库，允许用 TypeScript 类型定义直接生成 JSON Schema。  src/gateway/protocol/index.ts  里用 Ajv 编译这些 schema 做运行时校验。更酷的是，同一套 TypeBox 定义还能自动生成 Swift 模型，供 macOS 原生应用使用。

"单一真相源，多语言消费"，这个思路在大型项目中非常有效。我见过太多项目在客户端和服务端之间维护两套独立的类型定义，然后各种序列化 bug 层出不穷。

另一个值得注意的设计是幂等性键。所有有副作用的方法（比如  send  、  agent  ）都要求客户端提供一个唯一的 idempotency key。如果网络抖动导致请求重发，Gateway 用这个 key 做去重，返回缓存结果而不是重复执行。这个模式在支付系统里是标配，OpenClaw 把它搬到了 Agent 系统里，值得借鉴。

## 一些个人观察

拆完 Gateway 和 Channels 这层，我最大的感受是：OpenClaw 的工程决策非常"老练"。

它不追求技术上的"正确"，而是追求场景上的"合适"。有状态设计在云原生语境下是"反模式"，但对个人 AI 助手来说恰恰是最优解。串行执行在高并发场景下是"性能瓶颈"，但在 Agent 系统里是保证正确性的前提。JSONL 追加写在功能上远不如 SQLite 丰富，但在崩溃恢复场景下简单到不可能出错。

这些选择背后有一个统一的设计哲学： 用已有的基础设施（bash、Markdown、消息 API、文件系统）而非构建新抽象 。Gateway 就是一个 Node.js 进程，会话就是一个 JSONL 文件，配置就是一个 JSON，人格就是一个 Markdown。没有自定义数据库，没有自研协议，没有特殊运行时。

这让我想到 Unix 哲学的那句老话："一切皆文件。"OpenClaw 在 2026 年的 AI Agent 领域，用自己的方式重新演绎了这句话。

但 Hub-and-Spoke 架构的天花板也很明显。单 Gateway 进程意味着单点故障，意味着不能水平扩展，意味着当你的 Agent 需要服务几百上千人的时候，架构就得推倒重来。OpenClaw 很聪明地用产品定位（个人助手）规避了这个问题，但如果你想把类似的架构搬到企业场景，这个坎绕不过去。

下一篇，我们聊 SOUL.md 和人格系统。如何给一个 AI Agent 写一部"宪法"？OpenClaw 选择把人格外部化为可编辑文件，而且 Agent 自己可以修改自己的"灵魂"。这个设计的哲学意味很浓，也是整个项目被讨论最多的创新点。

你觉得 AI Agent 的人格，应该硬编码在代码里，还是外部化成一个文件？欢迎留言聊聊。

我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊，也欢迎你把这篇文章分享给身边做技术、做产品的朋友。

当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。 

 交给 AI 的是任务，留给自己的是思考。 

 脑子不停转，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。
