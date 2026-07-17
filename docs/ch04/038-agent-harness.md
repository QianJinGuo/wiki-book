# Agent架构关键变化：Harness正在成为新后端

## Ch04.038 Agent架构关键变化：Harness正在成为新后端

> 📊 Level ⭐⭐ | 32.1KB | `entities/agent-architecture-harness-new-backend.md`

本文讨论 AI 基础设施的核心问题：智能体 harness 与传统后端分离导致的复杂性，强调当前架构难以处理随机性强的 agent 系统。
作者提出用"worker、trigger、function"三个原语重新定义后端，让 agent 成为与服务、队列等同等的 worker，实现实时发现、可扩展性和统一可观测性，消除 harness 与后端的界限。
通过开源项目 iii.dev，该方法使任何能连接的组件（如浏览器、沙箱、不同语言服务）均可统一参与，简化架构并支持 agent 动态创建 worker，推动基础设施向设计模式转变。
> **Mike Piccolo** 是 AI 基础设施创业公司 iii.dev 的创始人，同时担任另一家公司的联合创始人兼董事会成员。他专注于探索 Agent 与传统后端的融合架构，倡导用 Worker、Trigger、Function 三大原语重构后端系统，推动基础设施向设计模式演进。
---
当下 AI 基础设施里最重要的架构问题，重点不在该用哪个模型，而在需要多少基础设施，才能用它构建出真正有用的东西。
Anthropic、OpenAI、CrewAI、LangChain 都把包裹 agent 的那一层称为 harness。Harness 包括编排循环、工具（MCP、A2A）、记忆、上下文管理和错误处理，这些东西让模型变得有用。它们都同意，模型本身不是产品，基础设施才是。但它们对这层基础设施到底该有多重，分歧很深。
Anthropic 的 harness 很薄。它是一个优雅的循环：组装 prompt，调用模型，执行工具调用，然后重复。所有事情都由模型决定。OpenAI 加入了更多结构：指令栈、编排模式和显式的交接模式。CrewAI 采用多路并行的做法：用确定性的 Flows 处理路由和校验，其余部分交给自主 agent。LangGraph 的 harness 最重，每个决策都是一个节点，每次转移都是一条定义好的边，整个工作流都编码在 harness 里。
这个光谱的一端，是强烈信任模型、弱编码逻辑；另一端，是弱信任模型、强编码逻辑。每个用 agent 构建系统的团队，都必须选择自己需要多大的 harness。
但这场争论里埋着一个没人质疑的假设：harness 位于传统后端之外。
Agent 的循环、工具和记忆存在于一层，也就是 harness。队列、状态、HTTP 路由、服务端渲染、可观测性以及其他所有后端组件这些执行基础设施，则存在于另一层，也就是"后端"。我相信这只是暂时状态，它只是 agentic 基础设施真正被采用并被接纳进"后端"的路上，一个很小的阶段。

### 今天的 Agent 如何工作
大多数 agentic 架构今天都是这样工作的。Harness 是一个 Python 进程，也可能是 TypeScript 进程，或者某个托管框架，用来包裹模型。当 agent 决定采取行动时，harness 会把工具调用翻译成 HTTP 请求，再触发后端发生某件事，比如发布一条队列消息，或者写入数据库。后端是它自己的世界，并且和 agent 保持分离。
Harness 按自己的节奏重试，队列按自己的条件重试，HTTP 层管理自己的超时。没有一条 trace 能直接连接这些彼此分散的系统。当某个地方出问题时，调试意味着跨系统关联日志，并重建观察到的行为。这在后端工程里很常见，但过去的系统大体上是确定性的，而 agent 至多只是随机性可控。
每增加一个 agent，概率空间都会扩大。最基本的规模是 agents² × services。换句话说，1 个 agent 加 5 个后端系统，就是 5 条需要调试的随机路径。4 个 agent 加 5 个后端系统，就是 80 条需要调试的随机路径。
没有什么好办法能让 agent 更确定。它们很多基础能力的目标，本来就是对相似甚至完全相同的输入给出不同答案。这种随机性并非偶然，而是有意设计出来的，因为这让计算机以一种全新的方式变得有用。价值十亿美元的问题是，如何在正确的上下文里创建正确的 harness，从而正确处理 agent。

### 退后一步看
今天 harness 的根本承诺，是试图把一种新范式，也就是随机性的 LLM，运行在一种旧范式，也就是确定性的后端之中。问题不在于构造 agent harness 天生错误，而在于有效方案必须从拆解"后端到底是什么"开始。
直到不久前，我们大多数人都把后端以及它的工作方式视为理所当然，我也一样。如果没有 agent，以及驱动 agent 的 LLM，我可能永远不会思考这个问题。于是我开始寻找后端的基本构建块。
一开始我以为，后端是一组服务的集合，这些服务存在于不同产品类别里，并通过库、集成、架构图、编排代码组装起来，而这个列表还在不断变长。后来我意识到，我是在自上而下地逼近这个答案，而不是自下而上。意识到这一点后，后端突然变得很简单：
**后端由三个基本元素组成：编排工作的 worker，调用这些服务的 trigger，以及服务内部真正执行工作的 function。**

### 抽象后端
一旦我意识到这一点，我和我非常出色的团队就清楚了：我们可以用这个抽象来构建一个后端。这远不只是学术练习。我们发现，这个抽象在 agentic 世界以及更广泛的场景里都有非常实际的价值，因为它完整封装了"后端"的执行上下文。于是我们构建了 iii，让每个人都能使用这个抽象。
iii 的工作方式正如上面所说：
它把 **Function** 定义为一个带稳定标识符的工作单元，例如 orders::validate。Function 接收输入，并且可以选择返回输出。它可以存在于任何进程里，也可以用任何语言编写。
**Trigger** 是让 function 运行的东西。它可以是对 function 的直接调用，可以是一个 HTTP endpoint，可以是 cron 调度、队列订阅、状态变化、流事件，或者任何其他东西。Trigger 是声明式的：worker 说"当这件事发生时运行这个 function"，iii 负责路由、序列化和投递。
**Worker** 是任何连接到 engine 并注册 functions 和 triggers 的进程。
一个 TypeScript API 服务是 worker。一个 Python ML pipeline 是 worker。一个 Rust microservice 是 worker。**一个 agent 也是 worker。**
这就是改变一切的想法。Agent 连接到 engine，注册 functions 和 triggers，通过 state::set 持久化上下文，通过基于队列的 triggers 交接工作，并通过 pub/sub 广播结果。它不会通过单独的集成层去调用"后端"。它和其他一切一样，使用同一组 primitives，参与同一个系统。
三个调用。registerFunction 定义工作。registerTrigger 把它绑定到外部世界。在这个例子里，同一个 function 同时绑定到一个 HTTP endpoint 和一个状态变化反应。现在，researcher 可以通过 POST 请求调用，并且每当某个研究任务进入 pending 状态时会自动触发。再加一个 trigger，它也可以按 cron 调度运行。Function 不需要变化，triggers 可以组合。
Agent 用同一个 trigger() 调用来存储状态，和支付服务会用的调用完全一样。它用订单流水线会使用的同一种队列机制，把工作交接给 critic。Agent 的"工具"就是 functions。它的"记忆"就是 state。它的"编排"就是 triggers 和组合。这里没有特殊的 agent 基础设施，因为并不需要。
**Harness 就是后端。**

### 一切向下都是 Worker
这件事比 agent 适配进后端更深。它关乎 iii 把什么看作 primitive，也关乎当一个 primitive 只用几行代码就能回答每个问题时会发生什么。
在大多数平台里，每一种新能力都是一个新类别。需要队列？去评估队列产品。需要 streaming？那是另一个产品。需要 sandboxing？又是一个产品。每个类别都有自己的内部机制、生命周期和集成故事。平台是一份目录，你的工作是从中采购并组装。
在 iii 里，几乎任何问题的答案都是同一个：**添加一个 worker，然后它注册 triggers 和 functions。**
我想要 sandboxing。添加一个 worker。我想要一个研究主题的 agent。添加一个 worker。我想要实时 streaming。添加一个 worker。我想要 go-to-market 能力，比如线索评分、邮件序列、CRM 同步。添加一个 worker。我想要 cron 调度。它已经是一个 worker。我想要可观测性。也已经是一个 worker。
Worker 连接进来，注册自己能做什么，系统就吸收它：实时、可发现、可观测。答案不会因为你添加的是哪种能力而改变。也不会因为语言不同、因为它是基础设施还是业务逻辑、因为创建者是人还是 agent 而改变。添加一个 worker。
这不只是架构上的统一性。它是类别的坍缩。在传统系统里，每种能力都活在自己的本体里。队列有 broker 语义，HTTP 有路由语义，cron 有调度语义，agent 有编排语义。在 iii 里，它们都是同一种东西：一个注册 functions 和 triggers 的进程。语义存在于 functions 里，而不是基础设施里。
软件里的范式转移，关键不在添加功能，而在坍缩类别。"Everything is a file" 让 Unix 变得可组合。把 components 视为 functions，让 React 的心智模型站住了。在 iii 里，答案总是"添加一个 worker"。这就是 primitives。这就是整个模型。

### 一个活系统
因为一切都是 worker，三个传统架构无法产生的性质会自然出现：
**实时发现。** 当一个 worker 连接时，它会收到所有其他 worker 注册的每个 function 的完整目录。当新 functions 出现时，每个 worker 都会收到通知。当一个 worker 断开连接时，每个 worker 也会收到通知。Engine 是唯一事实来源。
对 agent 来说，这也是认知基础设施。Agent 能准确看到整个系统此刻能做什么。Agent 不会收到过期上下文。
**实时扩展。** 给正在运行的 iii 系统添加新的 workers 和能力，不需要重新部署，也不需要重新设计架构。没有配置变更，也没有重启，因为系统在运行时扩展。
这才是 agentic 系统真正想要的运行方式。你永远不需要为了添加新能力而中断生产。你连接一个新 worker，它的 functions 分发到整个系统中，任何能使用它们的 agent 都可以随时使用，甚至可以用自己的 workers 扩展系统。
**实时可观测性。** iii 的可观测性建立在 OpenTelemetry 之上。每一次 function 调用都携带 trace ID。每一次 trigger() 调用都会跨 workers、跨语言、跨队列交接传播它。每一条通过 iii Logger 发出的日志，都会自动关联到当前 active trace 和 span，以结构化 OpenTelemetry LogRecords 的形式发出，并路由到你使用的任何后端：iii Console、Grafana、Jaeger、Datadog。这不是一个需要安装和集成的单独组件，它只是另一个 worker。Traces、metrics 和结构化日志由 engine 本身产生，而不是由应用层 middleware 产生。
当一个 agent 调用一个工具，这个工具入队一条消息，消息触发下游 function，下游 function 写入 state，整条链路是一条 trace。它不是三个通过时间戳关联或手动追踪 trace id 连接起来的独立系统。它是一条 trace，跨语言、跨 workers、跨 agent 与后端边界。你可以从一个缓慢的 waterfall span 直接跳到关联日志，看到到底发生了什么。

### 会创建 Worker 的 Agent
到这里，这个模型开始真正递归。
iii 支持具备硬件隔离的 microVM workers。Sandbox 功能本身就是一个 worker，拥有自己的文件系统、网络栈和进程树。你可以用一个命令创建 worker：iii worker add ./my-worker。Sandbox worker 连接到 engine，注册 functions 和 triggers，并像所有其他 worker 一样参与系统。
现在想象 agent 能做这件事时会发生什么。
一个 agent worker 也可以在运行时启动一个新的 sandbox worker。这个 sandbox 会得到自己的隔离环境。它注册自己的 functions 和 triggers。这些 functions 会立刻出现在实时目录里。其他 agents 和 services 可以调用它们。当这个 sandbox 不再需要时，它断开连接，functions 也随之注销。
Sandbox 不是一个单独的"sandbox 产品"。它是一个 worker，使用和其他一切相同的 primitives，只是碰巧提供了硬件隔离。一个 agent 创建 sandbox worker，只是一个 worker 创建另一个 worker。
当基础设施从产品类别变成设计模式时，样子就是这样。需要为不可信代码提供隔离执行？那是一个 sandbox worker。需要一个临时的专家 agent？启动一个 worker，注册 functions，完成后关闭。需要一组并行任务执行器？让一个 worker 启动其他 workers。Primitive 相同，模式不同。

### 区别消失
回到 harness 争论。Anthropic 说要薄。LangGraph 说要厚。它们在争论应该围绕模型编码多少认知结构。薄与厚的争论很重要，但它是设计空间内部的问题，不是关于设计空间本身的问题。
当 agent 是 workers 时，薄还是厚，只是你注册多少 functions，以及如何组合它们的问题。薄 harness 是一个带少量 functions 的 agent worker，让模型决定下一步 trigger() 什么。厚 harness 是一个带更多 functions、显式审批关卡，以及在入队下一步之前带条件逻辑的 agent worker。它们使用同一组 primitives 和同一个系统，只是模式不同。
脚手架这个比喻也会改变。行业里谈 harness scaffolding 时，常把它看成临时结构。随着模型改进，你会把它移除。Manus 曾描述过 [1] 四次重建 Claude 的 agent framework，每次重写都是因为发现了更好的上下文塑形方式。随着新模型吸收某些能力，Claude Code 会去掉 planning steps。
如果 harness 是用和后端其余部分相同的 primitives 构建的，那么移除 scaffolding 只意味着简化一个 function。你不需要重新架构一个集成层。你不需要重建两个系统之间的接口。你只需要注册更少的 functions，或者用不同方式组合它们。

### 任何东西都是 Worker
Worker 是任何能打开 WebSocket、注册 function、并使用 primitives interface 通信的东西。它是什么、用什么语言写，没有限制。
iii 提供 TypeScript、Python 和 Rust SDK。但这些不是系统的边界。它们只是开放 wire protocol 的三种实现：WebSocket 上的 JSON。Engine 不知道连接另一端是什么语言。它看到的是 functions、triggers 和一条连接。如果你的团队写 Go、Java、Swift 或 Zig，你只需要写一个小 SDK，让它说这个协议，就能成为一等参与者。Primitives interface 是契约，其他一切都是设计模式。
这意味着，什么能成为 worker，集合是真正无边界的。一个 Node.js 服务。一个 Python ML pipeline。一个 agent。一个队列。一个运行在 microVM 里的 sandbox。一个浏览器。iii 提供浏览器 SDK，所以某个人笔记本上的一个 tab 可以注册 functions，参与实时发现，调用后端 functions，也可以被后端 functions 调用。浏览器在系统里的地位，和 Kubernetes pod 一样。
一块 Raspberry Pi 是 worker。边缘侧的 IoT sensor 是 worker。运行 thin client 的手机是 worker。一个 CI runner 启动、注册一个 function、完成工作、然后断开连接，也是 worker。Engine 不区分这些东西。每一种实现 primitives interface 的新语言、新设备、新 runtime，都会免费获得完整系统：实时发现、实时扩展、实时可观测、durable triggers、跨一切调用。原因在于这个 primitive 允许这样的组合，而不是我们为每一种东西都做了专门集成。

### 这个赌注
行业正在争论，应该在模型外面包裹多少 scaffolding。这场争论很重要，但它默认 harness 是自己的世界，和后端分离，也和工具触发时真正运行的基础设施分离。
iii 下的是另一个赌注：正确的 primitives，也就是 worker、trigger、function，足够小，也足够通用，所以"什么能参与这个系统？"这个问题的答案是：任何东西。一个云服务。一个 agent。一个浏览器。一个 microcontroller。一个 agent 刚刚启动的 sandbox。它们都以同样方式组合。它们都能发现彼此。它们都共享同一套 trace。
当你不再把"agent 基础设施"和"后端基础设施"分开看，当你不再把任何参与者类别视为架构上不同于其他类别，系统会以添加功能永远无法做到的方式变简单。Harness 和后端之间、云和边缘之间、基础设施和应用之间、人写的服务和 agent 创建的 workers 之间的边界，都会消解为同三个 primitives。
Harness 不在后端之上。Harness 是后端的一部分。而后端，就是任何连接到 iii 的东西。
当 primitives 设计正确，类别会坍缩，复杂度会被大幅简化。
iii [2] 是开源项目。可以通过我们的 quickstart [3] 开始使用。

### 参考阅读
- [明星开源项目，为什么开始离开 GitHub？](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565111&idx=1&sn=0b3a58feae246791f2fead8d1b969b13&scene=21#wechat_redirect)
- [300万人在存的Claude提示词](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565104&idx=1&sn=7699e8f06a56d11d91eb161c4ac93aaf&scene=21#wechat_redirect)
- [别再把上下文当聊天记录](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565098&idx=1&sn=81a14c9465234c254aab9631032ff4ee&scene=21#wechat_redirect)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](https://mp.weixin.qq.com/s?__biz=MzAwMDU1MTE1OQ==&mid=2653565076&idx=1&sn=f81a143e0d172a92d62cdb060ee1dc3c&scene=21#wechat_redirect)

#### References
1. 曾描述过: https://vrungta.substack.com/p/claude-code-architecture-reverse
2. iii: https://iii.dev/
3. quickstart: https://iii.dev/docs/quickstart
---

## 深度分析
### 1. 核心论点：Harness 与后端的二元分离是暂时状态
本文最核心的洞察是：行业普遍接受了一个未被审视的假设——harness（智能体编排层）和后端（执行基础设施）是两个独立的层。这个假设导致agent系统面临调试复杂性的根本挑战：harness重试逻辑、队列重试机制、HTTP层超时控制各自为政，trace无法跨越这些边界串联。当系统从1个agent扩展到4个agent，调试路径从5条激增至80条，概率空间的膨胀使得传统确定性调试方法完全失效。
作者认为这不是设计缺陷而是阶段性的——随着agent技术主流化，harness终将被接纳为"后端"的一部分。就像早期Web服务需要独立的应用服务器而现在已是基础设施标配，agent harness也将经历同样的整合过程。

### 2. 三原语抽象：Worker、Trigger、Function
作者提出的解决方案是对后端进行逆向抽象——不是从现有技术栈自上而下归纳，而是从"后端做什么"这个本质问题出发，得出三个基本元素：

- **Function**：带稳定标识符的工作单元（如 orders::validate），可存在于任何进程、任何语言，是真正执行工作的原子
- **Trigger**：让function运行的触发机制，包括HTTP、cron、队列订阅、状态变化等，是声明式的绑定
- **Worker**：连接到engine并注册functions和triggers的任意进程
这个抽象的关键在于它具有universal性——一个TypeScript API服务是worker，一个Python ML pipeline是worker，一个Rust微服务是worker，**一个agent也是worker**。当所有参与者共享同一套primitives，异构系统的集成复杂度从O(n²)降为O(n)。

### 3. 范式转移的本质：类别坍缩
文章的核心论点不仅是架构统一，而是范式转移意义上的类别坍缩。传统平台中每个新能力都是新类别（队列产品、流式处理产品、沙箱产品），每个类别有自己的机制、生命周期和集成故事。iii的答案是统一的：添加一个worker。
作者引用Unix的"一切皆文件"和React的"组件即函数"来说明这个模式：当primitive足够通用且一致，系统复杂度不是因为添加功能而增长，而是因为类别本身被坍缩了。这是软件工程中范式转移的典型特征——不是增加能力，而是简化心智模型。

### 4. 实时特性：发现、扩展、可观测性
由于一切都是worker，三个传统架构无法同时实现的能力自然涌现：
**实时发现**使得agent能准确看到整个系统此刻能做什么，不会收到过期上下文——这对agent的认知基础设施至关重要。
**实时扩展**允许在生产系统运行时添加新workers和能力，无需重新部署或重启架构，这正是agentic系统梦寐以求的运行方式。
**实时可观测性**基于OpenTelemetry，每条trace跨语言、跨workers、跨agent与后端边界，从span可直接跳转关联日志，解决了agent系统调试的核心痛点。

### 5. 递归性质：会创建Worker的Agent
最有远见的观点是模型的递归应用：iii支持具备硬件隔离的microVM workers作为worker，而agent也可以在运行时启动新的sandbox worker。这意味着agent不是终点，而是起点——agent可以创建worker，worker可以创建worker，形成递归的能力扩展。
当基础设施从产品类别变成设计模式，sandbox不再是专门的"沙箱产品"，而是一个碰巧提供硬件隔离的worker。一个agent创建sandbox worker，只是一个worker创建另一个worker。

### 6. Harness薄厚之争的重新定位
文章重新定位了Anthropic（薄harness）vs LangGraph（厚harness）的争论：这是设计空间内部的问题，不是关于设计空间本身的问题。当agent是workers，薄还是厚只是注册多少functions、如何组合的问题。使用同一组primitives和同一个系统，区别只是模式不同。
更重要的是，当harness用和后端其余部分相同的primitives构建，移除scaffolding不再是痛苦的架构重构，而只是简化一个function。这降低了迭代成本，让团队能更快地实验和优化。
---

## 实践启示
### 1. 重新思考Agent系统的集成边界
传统观点将agent视为后端的客户端——agent通过工具调用触发后端服务，后者返回结果。这种模型导致双重重试逻辑、trace断裂和调试困难。实践者应该考虑：与其在agent harness和后端之间建立清晰的边界，不如让agent直接参与后端原语系统。iii的模型显示，当agent通过trigger()调用直接与后端原语交互，统一的可观测性和trace成为可能。

### 2. 采用Worker-first架构思维
面对新需求时，iii的回答总是"添加一个worker"。这对架构决策的启发是：不再为每个新能力评估专门的产品或服务，而是考虑如何用worker+functions+triggers的组合来满足。当需要sandboxing，启动一个sandbox worker；当需要研究agent，启动一个agent worker；当需要可观测性，它已经是一个worker。这意味着架构决策从"选择和集成产品"转变为"组合primitives"。

### 3. 优先投资实时发现和可观测性基础设施
文章揭示的一个关键点是：实时发现对agent有特殊意义——它解决了agent上下文的过期问题。当agent能准确看到整个系统此刻能做什么，它不会因为使用了已被移除的能力而失败。对于构建复杂agent系统的团队，投资实时服务发现和动态能力注册机制，比增加harness的逻辑厚度更有长期价值。

### 4. 重新审视Harness的迭代成本
Manus四次重建Claude agent framework的故事值得注意。每次重建都是因为发现了更好的上下文塑形方式。这表明当前agent框架的高迭代成本是行业痛点。iii模型给出的启发是：如果harness用后端相同的primitives构建，移除scaffolding就只是简化function，不需要重建两个系统之间的接口。这大幅降低了实验成本。

### 5. 设计时考虑Agent动态创建Worker的能力
iii模型中agent可以运行时启动新的sandbox worker，这意味着架构需要考虑agent动态扩展系统的场景。当设计一个agent系统时，不只要考虑agent能调用什么，还要考虑agent能否创建新的能力单元。如果可能，架构应该支持这种动态性——连接时注册，断开时注销，能力按需创建和销毁。

### 6. 统一可观测性比分别优化各层更重要
在传统架构中，harness、队列、HTTP层各自有独立的可观测性工具，关联日志需要手动拼接trace ID。iii模型显示，当所有交互都通过trigger()发生，trace自动端到端连接。对于正在构建agent系统的团队，优先建立统一的trace上下文传递机制，比分别优化每个层的可观测性更有投资回报。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-architecture-harness-new-backend.md)

## 相关实体
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/456-claude-code-harness-deep-understanding.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Agent 自我改进的六条路](../ch03/046-agent.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)
- [Claude Code 设计原则与对照分析](../ch03/076-claude-code.html)
- [Harness如何支撑Agent在生产环境稳定运行？](../ch05/018-harness.html)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](../ch11/224-openclaw.html)
- [Code as Agent Harness 综述](../ch09/051-code-as-agent-harness.html)
- [Claude Code 源码核心机制详解](../ch03/076-claude-code.html)
- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/076-claude-code.html)
- [Agent Memory 系统性框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-systematic-framework.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki/blob/main/queries/agent-memory-system-design.md)
- [200人销售团队企业级 Agent 知识库问答系统架构设计](https://github.com/QianJinGuo/wiki/blob/main/queries/sales-team-agent-knowledge-base-architecture.md)

- [Martin Fowler AI 研发 Harness：非确定性承重层](../ch05/018-harness.html)
- [AI Native 时代 —— 研发组织何去何从](../ch05/019-ai-native.html)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](../ch05/018-harness.html)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](../ch03/046-agent.html)
- [从多智能体编排到AI自主决策：资损防控体系的架构演进](../ch05/086-ai.html)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)
- [Agent 与后端统一架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-backend-unification.md)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [Agent Harness 解析：智能体架构深度拆解](../ch05/039-agent-harness.html)
- [From Agent Protocol to Harness Skill](ch04/404-from-agent-protocol-to-harness-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/1-million-exposed-ai-services-hackernews.md)

- [Agent Memory 架构解析](ch04/121-agent-memory.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

