---
title: "拆解OpenClaw架构（八）：多Agent编排与自主运行"
source: wechat
url: https://mp.weixin.qq.com/s/yLrwrkhhhSnHy0z6jWIPuQ
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: 2b68a33e27a4417350b5d47a1f4f6c953de4e0fd0d10595b83f9c31321cca184
---

# 拆解OpenClaw架构（八）：多Agent编排与自主运行

**来源**: 科技充电站

**发布日期**: 2026-03-05

**原文链接**: https://mp.weixin.qq.com/s/yLrwrkhhhSnHy0z6jWIPuQ

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第八篇，也是最后一篇。前七篇我们从消息流水线拆到人格系统，从 Agent Runner 聊到记忆系统，再到工具链、Skills 生态、安全机制，基本上把一个 AI Agent 从"接收消息"到"安全执行"的完整链路走了一遍。

上篇结尾我说，下一站是多 Agent 编排。安全机制解决的是"一个 Agent 能不能被信任"的问题，而多 Agent 编排要回答的是一个更大的问题： 当你有多个 Agent 的时候，它们怎么协作、怎么通信、谁来调度？

一个 Agent 是聊天机器人，一群 Agent 是什么？OpenClaw 给出的答案是：一个自主运行的 AI 系统。

先看最基本的操作，一个 Agent 怎么"生"出另一个 Agent。

OpenClaw 用  sessions_spawn  工具实现子 Agent 生成。调用这个工具，父 Agent 不会阻塞等待，而是 立即返回 一个结构：

{ "status": "accepted", "runId": "xxx", "childSessionKey": "agent:main:subagent:a1b2c3" }

三个关键设计值得拆开看。

第一，非阻塞， 父 Agent 发出 spawn 请求后继续干自己的事，子 Agent 在后台独立运行。这跟操作系统的  fork()  思路类似，生完就放手，不搞同步等待。

第二，隔离的 session key， 子 Agent 的 session key 格式是  agent:{agentId}:subagent:{uuid}  ，跟父 Agent 的 session 完全隔离。为什么要这么做？因为 session 是 OpenClaw 里的资源边界，隔离 session 就意味着隔离上下文、隔离状态、隔离工具权限，子 Agent 默认拿到所有工具，但 session 工具和系统工具被禁止使用，更细粒度的限制还包括  gateway  、  cron  等管理类工具，以及  memory_search  、  memory_get  等记忆工具。

第三，完成后主动汇报， 子 Agent 跑完任务后会执行一个 announce 步骤，把结果（状态 + 转录路径）投递到请求者的 channel。投递策略也很讲究：先尝试直接投递，失败了走队列回退，再失败就重试，不是简单的 fire-and-forget，而是有韧性的结果交付。

但这里面有一个非常重要的 硬限制 ：子 Agent 不能再生成子 Agent。

代码里的实现简单粗暴：

if (isSubagentSessionKey(requesterSessionKey)) {  
  return jsonResult({ status: "forbidden" });  
}

就一个 if 判断，连参数都不用看，session key 格式一匹配就直接拒绝。

社区对这个限制有不少讨论，GitHub 上 #6832、#11741、#17511 三个 issue 都在请求支持嵌套生成，但官方一直没有放开。我觉得这个决定非常务实：递归 Agent 生成听起来很酷，但实际上是失控的开始，想象一下，一个 Agent 生成 3 个子 Agent，每个子 Agent 再生成 3 个，三层下来就是 27 个并发 Agent，每个都在消耗 API 调用和 token，没有清晰的终止条件，这就是一颗定时炸弹。

所有子 Agent 共享一个全局队列通道，并发数由  agents.defaults.subagents.maxConcurrent  控制。这个设计把资源上限锁死在配置层面，不管你生成多少子 Agent，同时跑的就那么多，排队等。

## 心跳机制：Agent 学会了主动巡检

子 Agent 解决的是"一变多"的问题，心跳机制解决的是一个更根本的问题： Agent 能不能在没人找它的时候，自己动起来？

传统的聊天机器人是被动的，你问它答，你不问它就待着。OpenClaw 的 Heartbeat 机制把这个模式翻了过来。

每隔 30 分钟（默认值，可以通过  agents.defaults.heartbeat.every  配置），Gateway 会触发一次"心跳轮次"：Agent 在主 session 里醒来，没有用户消息，没有外部触发，它就是自己醒了。醒来后做什么？读  HEARTBEAT.md  。

这个文件刻意设计得非常简短，就是一个 5 到 10 条的 Markdown 清单：

# Heartbeat checklist  
- Quick scan: anything urgent in inboxes?  
- If daytime, do a lightweight check-in if nothing else pending  
- If a task is blocked, write down what is missing

Agent 读完清单，自主判断需不需要采取行动。响应的约定也很有意思：

- • 返回
  HEARTBEAT_OK
  表示一切正常，这条消息
  被静默吞掉
  ，不投递给任何人

- • 返回任何其他文本，就被当作告警，投递到配置的目标 channel

你可能会想，每 30 分钟跑一次，晚上也跑吗？不会半夜三点给你发通知吧？

不会，OpenClaw 支持活跃时间限制和时区配置，心跳只在你设定的时间窗口内触发，而且同一条告警在 24 小时内不会重复投递，做了去重处理。

但真正让我觉得精妙的是它的 双模型策略 。

心跳本质上是一个低价值密度的操作：大部分时候什么事都没有，Agent 扫一眼清单说"OK"就完了。如果每次心跳都用 Claude Opus 或 GPT-4 这种贵模型，按 30 分钟一次算，一天 48 次，成本不低。

OpenClaw 的做法是：心跳轮次默认用便宜模型（比如 Gemini Flash），成本大约 $0.005/天。只有当便宜模型判断"这里有情况，需要深入处理"的时候，才切换到贵模型。

这个思路其实跟人类组织里的值班制度很像，值夜班的不需要是最资深的工程师，只需要能判断"这事儿需不需要叫人"就行，真正需要处理问题的时候再叫专家上场。

还有一个细节：如果  HEARTBEAT.md  文件内容为空（只有空行和标题），OpenClaw 会直接跳过心跳运行，连便宜模型都不调用。这种对边界条件的关注，是工程成熟度的体现。

## Agent 间通信：从各干各的到协同作战

子 Agent 生成和心跳解决的都是单个 Agent 维度的问题。当多个独立 Agent 需要互相协作时，就需要 Agent 间通信了。

OpenClaw 提供了  agentToAgent  工具来实现这一点，但有一个前提： 这个功能默认是关闭的，

要启用 Agent 间通信，需要同时满足两个条件：

- 

- 启用
   agentToAgent
   工具

- 

- 设置
   sessions.visibility: "all"
   ，让 Agent 能发现其他 Agent 的 session

为什么默认关闭？因为一旦 Agent 能互相发消息，系统的复杂度会指数级上升，你需要考虑消息路由、死锁、无限循环等一系列分布式系统的经典问题，默认关闭是一个非常审慎的选择。

通信的具体实现用的是  sessions_send  工具，一个 Agent 可以向另一个 Agent 的 session 发送消息，还支持可选的超时参数来做同步等待。

为了防止两个 Agent 之间无限互发消息，OpenClaw 设计了一个 ping-pong 协议 ：请求方和目标方交替对话，最多进行  maxPingPongTurns  轮（默认 5 轮），然后强制结束进入 announce 步骤。

5 轮对话够不够？大多数场景下足够了，两个 Agent 之间的协作通常是"我需要你做这个""好的做完了""结果是这样"这种模式，5 轮绰绰有余，如果还说不清楚，大概率是任务拆分有问题，不应该靠增加对话轮次来解决。

## 多 Agent 路由：每个 Agent 都是独立的"大脑"

前面说的子 Agent 生成和 Agent 间通信，都是在运行时的动态行为。多 Agent 路由解决的是另一个问题： 在配置层面，怎么把不同的请求分发到不同的 Agent？

OpenClaw 里，"一个 Agent"是一个完整的、自包含的实体。每个 Agent 拥有：

- • 独立的 workspace（含 SOUL.md）

- • 独立的 agentDir，用于存储认证、注册表和配置

- • 独立的 session store，路径在
  ~/.openclaw/agents/<agentId>/sessions

- • 独立的 auth profiles

这种隔离意味着不同 Agent 之间不会互相污染配置和状态。

路由的配置通过 Bindings 实现，规则是 最精确匹配优先 。举个例子：

- • WhatsApp 个人账号的消息 → 路由到 "home" Agent

- • WhatsApp 企业账号的消息 → 路由到 "work" Agent

- • 某个特定群组的消息 → 路由到第三个专用 Agent

同一个 OpenClaw 实例可以同时服务多个完全不同的 Agent，每个 Agent 有自己的人格（SOUL.md）、自己的记忆、自己的工具权限、自己的 Skills 配置。这不是简单的"多租户"，而是真正的"多大脑"。

这里面有一个之前系列文章没提到但很重要的工程细节：有些 bug 线索显示，早期版本在某些执行路径上 per-agent 的配置覆盖（比如 agentDir、exec config）没有正确传递到  runEmbeddedPiAgent()  里，导致"全局默认值泄漏到隔离的 Agent 运行"。这类问题在单 Agent 场景下不会暴露，只有在多 Agent 路由时才会触发，也正好说明了为什么多 Agent 编排的工程难度远超看上去的样子，每多一个维度的隔离就多一类潜在的泄漏路径。

## Lobster 工作流引擎：LLM 做创意，编排引擎做流程

到目前为止，我们看到的多 Agent 协作都是动态的：Agent 自己决定什么时候 spawn 子 Agent，自己决定跟谁通信，自己决定心跳时做什么。这种灵活性很强大，但也意味着不可预测。

有些场景需要的恰恰是可预测的、确定性的执行流程。代码审查就是一个典型例子：先让 programmer Agent 写代码，再让 reviewer Agent 审代码，最后让 tester Agent 跑测试，顺序不能乱，步骤不能跳。

这就是 Lobster 工作流引擎要解决的问题。

Lobster 用 YAML 文件定义工作流管线，编排多个 Agent（programmer、reviewer、tester）按照确定的顺序执行任务。管线是类型化的、可组合的，带有状态管理和学习能力。

这个设计思路让我想到一个挺有意思的分工模型： LLM 负责创意性的工作，传统编排引擎负责流程性的工作，

你不会希望让 LLM 来决定"代码审查应该先写代码还是先跑测试"，这种确定性的流程用 YAML 定义就行了。但你也不会用 YAML 来定义"审代码的时候应该关注哪些问题"，这种需要理解和判断的工作交给 LLM。

Lobster 本质上是在 LLM 的创造力和传统工作流的可靠性之间找到了一个平衡点。它没有试图让 LLM 做所有事情，也没有试图用确定性逻辑替代 LLM，而是让两者各做各自擅长的部分。

## 一些个人观察

拆完 OpenClaw 的多 Agent 编排之后，有几个点我反复在想。

心跳是一个质变，不是量变， 从"用户提问，Agent 回答"到"Agent 自己醒来，自己巡检，自己决定要不要行动"，这中间跨过的不是一个功能特性，而是一个范式边界。聊天机器人是被动的工具，能自己醒来的 Agent 是主动的协作者，双模型策略让这个能力在经济上可行（$0.005/天），而不只是技术上可行。

禁止嵌套生成是一个被低估的好决定， 社区一直在请求放开嵌套，但我认为 OpenClaw 团队拒绝得对。递归 Agent 生成会导致资源消耗不可预测、调试极其困难、因果链条无法追溯，一个简单的 if 判断避免了一整类的失控场景，有时候最好的架构决策不是加功能，而是明确拒绝某个功能。

Agent 间通信默认关闭，这个选择也很聪明， 分布式系统里节点间通信是复杂度的最大来源，OpenClaw 没有因为"多 Agent"这个卖点就默认打开所有通信能力，而是让用户按需开启，ping-pong 协议的 5 轮限制也是同样的思路：给协作一个上限，而不是无限制地对话下去。

Lobster 代表了一种务实的 Agent 编排哲学， 现在很多 AI 产品喜欢宣传"全自主"，好像 LLM 什么都能搞定，但实际上确定性的流程就该用确定性的工具来编排，LLM 的价值在于处理流程中那些需要理解、判断、创造的节点，Lobster 这种"YAML 做骨架，LLM 做血肉"的设计比"全部交给 LLM 自己搞定"要靠谱得多。

## 写在最后

八篇文章写下来，我最大的感受是： Agent 的核心难题不在 Agent 本身，

调用 LLM、解析回复、执行工具，这些是 Agent 的核心循环，但它们已经不是技术瓶颈，真正的难题在 Agent 循环之外的一切：持久化的记忆怎么做、多 channel 的消息怎么路由、安全边界怎么划、session 怎么管理、7x24 小时自主运行的基础设施怎么搭。OpenClaw 430,000+ 行代码里，Agent 循环本身只是很小的一部分，绝大部分代码在处理这些"周边"问题。

这也是为什么我觉得"AI Agent"这个领域才刚刚开始。模型能力会继续提升，但围绕 Agent 的工程基础设施，我们可能还在非常早期的阶段。

如果你也在做 Agent 相关的产品或研究，我很好奇一个问题： 你觉得 Agent 系统中，最难做对的那一层是什么？ 是记忆？是安全？是多 Agent 协作？还是某个我们还没意识到的维度？欢迎在评论区聊聊。

我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊，也欢迎你把这篇文章分享给身边做技术、做产品的朋友。

当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。 

 交给 AI 的是任务，留给自己的是思考。 

 脑子不停转，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。
