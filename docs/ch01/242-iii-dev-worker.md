# III Dev Worker 触发函数架构

## Ch01.242 III Dev Worker 触发函数架构

> 📊 Level ⭐⭐ | 30.0KB | `entities/iii-dev-worker-trigger-function.md`

当下 AI 基础设施里最重要的架构问题，重点不在该用哪个模型，而在需要多少基础设施，才能用它构建出真正有用的东西。
Anthropic、OpenAI、CrewAI、LangChain 都把包裹 agent 的那一层称为 harness。Harness 包括编排循环、工具（MCP、A2A）、记忆、上下文管理和错误处理，这些东西让模型变得有用。它们都同意，模型本身不是产品，基础设施才是。但它们对这层基础设施到底该有多重，分歧很深。
Anthropic 的 harness 很薄。它是一个优雅的循环：组装 prompt，调用模型，执行工具调用，然后重复。所有事情都由模型决定。OpenAI 加入了更多结构：指令栈、编排模式和显式的交接模式。CrewAI 采用多路并行的做法：用确定性的 Flows 处理路由和校验，其余部分交给自主 agent。LangGraph 的 harness 最重，每个决策都是一个节点，每次转移都是一条定义好的边，整个工作流都编码在 harness 里。
这个光谱的一端，是强烈信任模型、弱编码逻辑；另一端，是弱信任模型、强编码逻辑。每个用 agent 构建系统的团队，都必须选择自己需要多大的 harness。
但这场争论里埋着一个没人质疑的假设：harness 位于传统后端之外。
Agent 的循环、工具和记忆存在于一层，也就是 harness。队列、状态、HTTP 路由、服务端渲染、可观测性以及其他所有后端组件这些执行基础设施，则存在于另一层，也就是"后端"。
我相信这只是暂时状态，它只是 agentic 基础设施真正被采用并被接纳进"后端"的路上，一个很小的阶段。
今天的 Agent 如何工作
大多数 agentic 架构今天都是这样工作的。Harness 是一个 Python 进程，也可能是 TypeScript 进程，或者某个托管框架，用来包裹模型。当 agent 决定采取行动时，harness 会把工具调用翻译成 HTTP 请求，再触发后端发生某件事，比如发布一条队列消息，或者写入数据库。后端是它自己的世界，并且和 agent 保持分离。
Harness 按自己的节奏重试，队列按自己的条件重试，HTTP 层管理自己的超时。没有一条 trace 能直接连接这些彼此分散的系统。当某个地方出问题时，调试意味着跨系统关联日志，并重建观察到的行为。这在后端工程里很常见，但过去的系统大体上是确定性的，而 agent 至多只是随机性可控。
每增加一个 agent，概率空间都会扩大。最基本的规模是 agents² × services。换句话说，1 个 agent 加 5 个后端系统，就是 5 条需要调试的随机路径。4 个 agent 加 5 个后端系统，就是 80 条需要调试的随机路径。
没有什么好办法能让 agent 更确定。它们很多基础能力的目标，本来就是对相似甚至完全相同的输入给出不同答案。这种随机性并非偶然，而是有意设计出来的，因为这让计算机以一种全新的方式变得有用。价值十亿美元的问题是，如何在正确的上下文里创建正确的 harness，从而正确处理 agent。
退后一步看
今天 harness 的根本承诺，是试图把一种新范式，也就是随机性的 LLM，运行在一种旧范式，也就是确定性的后端之中。问题不在于构造 agent harness 天生错误，而在于有效方案必须从拆解"后端到底是什么"开始。
直到不久前，我们大多数人都把后端以及它的工作方式视为理所当然，我也一样。如果没有 agent，以及驱动 agent 的 LLM，我可能永远不会思考这个问题。于是我开始寻找后端的基本构建块。
一开始我以为，后端是一组服务的集合，这些服务存在于不同产品类别里，并通过库、集成、架构图、编排代码组装起来，而这个列表还在不断变长。后来我意识到，我是在自上而下地逼近这个答案，而不是自下而上。意识到这一点后，后端突然变得很简单：
后端由三个基本元素组成：编排工作的 worker，调用这些服务的 trigger，以及服务内部真正执行工作的 function。
抽象后端
一旦我意识到这一点，我和我非常出色的团队就清楚了：我们可以用这个抽象来构建一个后端。这远不只是学术练习。我们发现，这个抽象在 agentic 世界以及更广泛的场景里都有非常实际的价值，因为它完整封装了"后端"的执行上下文。于是我们构建了 iii，让每个人都能使用这个抽象。
iii 的工作方式正如上面所说：
它把 Function 定义为一个带稳定标识符的工作单元，例如 orders::validate。Function 接收输入，并且可以选择返回输出。它可以存在于任何进程里，也可以用任何语言编写。
Trigger 是让 function 运行的东西。它可以是对 function 的直接调用，可以是一个 HTTP endpoint，可以是 cron 调度、队列订阅、状态变化、流事件，或者任何其他东西。Trigger 是声明式的：worker 说"当这件事发生时运行这个 function"，iii 负责路由、序列化和投递。
Worker 是任何连接到 engine 并注册 functions 和 triggers 的进程。
一个 TypeScript API 服务是 worker。一个 Python ML pipeline 是 worker。一个 Rust microservice 是 worker。一个 agent 也是 worker。
这就是改变一切的想法。Agent 连接到 engine，注册 functions 和 triggers，通过 state::set 持久化上下文，通过基于队列的 triggers 交接工作，并通过 pub/sub 广播结果。它不会通过单独的集成层去调用"后端"。它和其他一切一样，使用同一组 primitives，参与同一个系统。
const iii = registerWorker('ws://localhost:49134', { workerName: 'agentic-backend' })
iii.registerFunction('agents::researcher', async (data) => {
  // the unit of work
  // Python Worker: requests + duckduckgo-search
  const sources = await iii.trigger({
    function_id: 'web::search',
    payload: { query: data.topic, limit: 10 }
  })
  // Rust Worker: scraper + tokio, fetched in parallel
  const pages = await iii.trigger({
    function_id: 'web::scrape',
    payload: { urls: sources.map(s => s.url) }
  })
  // TypeScript Worker: wraps the OpenAI SDK
  const findings = await iii.trigger({
    function_id: 'llm::summarize',
    payload: { topic: data.topic, documents: pages }
  })
  await iii.trigger({
    function_id: 'state::set',
    payload: { scope: 'research-tasks', key: data.task_id, value: findings }
  })
  iii.trigger({
    function_id: 'agents::critic',
    payload: { task_id: data.task_id },
    action: TriggerAction.Enqueue({ queue: 'agent-tasks' })
  })
  return findings
})
iii.registerTrigger({
  type: 'http',
  function_id: 'agents::researcher',
  config: { api_path: '/agents/research', http_method: 'POST' }
})
iii.registerTrigger({
  type: 'state',
  function_id: 'agents::researcher',
  config: { scope: 'research-tasks', condition: 'status == "pending"' }
})
三个调用。registerFunction 定义工作。registerTrigger 把它绑定到外部世界。在这个例子里，同一个 function 同时绑定到一个 HTTP endpoint 和一个状态变化反应。现在，researcher 可以通过 POST 请求调用，并且每当某个研究任务进入 pending 状态时会自动触发。再加一个 trigger，它也可以按 cron 调度运行。Function 不需要变化，triggers 可以组合。
Agent 用同一个 trigger() 调用来存储状态，和支付服务会用的调用完全一样。它用订单流水线会使用的同一种队列机制，把工作交接给 critic。Agent 的"工具"就是 functions。它的"记忆"就是 state。它的"编排"就是 triggers 和组合。这里没有特殊的 agent 基础设施，因为并不需要。
Harness 就是后端。
一切向下都是 Worker
这件事比 agent 适配进后端更深。它关乎 iii 把什么看作 primitive，也关乎当一个 primitive 只用几行代码就能回答每个问题时会发生什么。
在大多数平台里，每一种新能力都是一个新类别。需要队列？去评估队列产品。需要 streaming？那是另一个产品。需要 sandboxing？又是一个产品。每个类别都有自己的内部机制、生命周期和集成故事。平台是一份目录，你的工作是从中采购并组装。
在 iii 里，几乎任何问题的答案都是同一个：添加一个 worker，然后它注册 triggers 和 functions。
我想要 sandboxing。添加一个 worker。我想要一个研究主题的 agent。添加一个 worker。我想要实时 streaming。添加一个 worker。我想要 go-to-market 能力，比如线索评分、邮件序列、CRM 同步。添加一个 worker。我想要 cron 调度。它已经是一个 worker。我想要可观测性。也已经是一个 worker。
Worker 连接进来，注册自己能做什么，系统就吸收它：实时、可发现、可观测。答案不会因为你添加的是哪种能力而改变。也不会因为语言不同、因为它是基础设施还是业务逻辑、因为创建者是人还是 agent 而改变。添加一个 worker。
这不只是架构上的统一性。它是类别的坍缩。在传统系统里，每种能力都活在自己的本体里。队列有 broker 语义，HTTP 有路由语义，cron 有调度语义，agent 有编排语义。在 iii 里，它们都是同一种东西：一个注册 functions 和 triggers 的进程。语义存在于 functions 里，而不是基础设施里。
软件里的范式转移，关键不在添加功能，而在坍缩类别。"Everything is a file" 让 Unix 变得可组合。把 components 视为 functions，让 React 的心智模型站住了。在 iii 里，答案总是"添加一个 worker"。这就是 primitives。这就是整个模型。
一个活系统
因为一切都是 worker，三个传统架构无法产生的性质会自然出现：
实时发现。 当一个 worker 连接时，它会收到所有其他 worker 注册的每个 function 的完整目录。当新 functions 出现时，每个 worker 都会收到通知。当一个 worker 断开连接时，每个 worker 也会收到通知。Engine 是唯一事实来源。
对 agent 来说，这也是认知基础设施。Agent 能准确看到整个系统此刻能做什么。Agent 不会收到过期上下文。
实时扩展。 给正在运行的 iii 系统添加新的 workers 和能力，不需要重新部署，也不需要重新设计架构。没有配置变更，也没有重启，因为系统在运行时扩展。
这才是 agentic 系统真正想要的运行方式。你永远不需要为了添加新能力而中断生产。你连接一个新 worker，它的 functions 分发到整个系统中，任何能使用它们的 agent 都可以随时使用，甚至可以用自己的 workers 扩展系统。
实时可观测性。 iii 的可观测性建立在 OpenTelemetry 之上。每一次 function 调用都携带 trace ID。每一次 trigger() 调用都会跨 workers、跨语言、跨队列交接传播它。每一条通过 iii Logger 发出的日志，都会自动关联到当前 active trace 和 span，以结构化 OpenTelemetry LogRecords 的形式发出，并路由到你使用的任何后端：iii Console、Grafana、Jaeger、Datadog。这不是一个需要安装和集成的单独组件，它只是另一个 worker。Traces、metrics 和结构化日志由 engine 本身产生，而不是由应用层 middleware 产生。
当一个 agent 调用一个工具，这个工具入队一条消息，消息触发下游 function，下游 function 写入 state，整条链路是一条 trace。它不是三个通过时间戳关联或手动追踪 trace id 连接起来的独立系统。它是一条 trace，跨语言、跨 workers、跨 agent 与后端边界。你可以从一个缓慢的 waterfall span 直接跳到关联日志，看到到底发生了什么。
会创建 Worker 的 Agent
到这里，这个模型开始真正递归。
iii 支持具备硬件隔离的 microVM workers。Sandbox 功能本身就是一个 worker，拥有自己的文件系统、网络栈和进程树。你可以用一个命令创建 worker：iii worker add ./my-worker。Sandbox worker 连接到 engine，注册 functions 和 triggers，并像所有其他 worker 一样参与系统。
现在想象 agent 能做这件事时会发生什么。
一个 agent worker 也可以在运行时启动一个新的 sandbox worker。这个 sandbox 会得到自己的隔离环境。它注册自己的 functions 和 triggers。这些 functions 会立刻出现在实时目录里。其他 agents 和 services 可以调用它们。当这个 sandbox 不再需要时，它断开连接，functions 也随之注销。
Sandbox 不是一个单独的"sandbox 产品"。它是一个 worker，使用和其他一切相同的 primitives，只是碰巧提供了硬件隔离。一个 agent 创建 sandbox worker，只是一个 worker 创建另一个 worker。
当基础设施从产品类别变成设计模式时，样子就是这样。需要为不可信代码提供隔离执行？那是一个 sandbox worker。需要一个临时的专家 agent？启动一个 worker，注册 functions，完成后关闭。需要一组并行任务执行器？让一个 worker 启动其他 workers。Primitive 相同，模式不同。
区别消失
回到 harness 争论。Anthropic 说要薄。LangGraph 说要厚。它们在争论应该围绕模型编码多少认知结构。薄与厚的争论很重要，但它是设计空间内部的问题，不是关于设计空间本身的问题。
当 agent 是 workers 时，薄还是厚，只是你注册多少 functions，以及如何组合它们的问题。薄 harness 是一个带少量 functions 的 agent worker，让模型决定下一步 trigger() 什么。厚 harness 是一个带更多 functions、显式审批关卡，以及在入队下一步之前带条件逻辑的 agent worker。它们使用同一组 primitives 和同一个系统，只是模式不同。
脚手架这个比喻也会改变。行业里谈 harness scaffolding 时，常把它看成临时结构。随着模型改进，你会把它移除。Manus 曾描述过四次重建 Claude 的 agent framework，每次重写都是因为发现了更好的上下文塑形方式。随着新模型吸收某些能力，Claude Code 会去掉 planning steps。
如果 harness 是用和后端其余部分相同的 primitives 构建的，那么移除 scaffolding 只意味着简化一个 function。你不需要重新架构一个集成层。你不需要重建两个系统之间的接口。你只需要注册更少的 functions，或者用不同方式组合它们。
任何东西都是 Worker
Worker 是任何能打开 WebSocket、注册 function、并使用 primitives interface 通信的东西。它是什么、用什么语言写，没有限制。
iii 提供 TypeScript、Python 和 Rust SDK。但这些不是系统的边界。它们只是开放 wire protocol 的三种实现：WebSocket 上的 JSON。Engine 不知道连接另一端是什么语言。它看到的是 functions、triggers 和一条连接。如果你的团队写 Go、Java、Swift 或 Zig，你只需要写一个小 SDK，让它说这个协议，就能成为一等参与者。Primitives interface 是契约，其他一切都是设计模式。
这意味着，什么能成为 worker，集合是真正无边界的。一个 Node.js 服务。一个 Python ML pipeline。一个 agent。一个队列。一个运行在 microVM 里的 sandbox。一个浏览器。iii 提供浏览器 SDK，所以某个人笔记本上的一个 tab 可以注册 functions，参与实时发现，调用后端 functions，也可以被后端 functions 调用。浏览器在系统里的地位，和 Kubernetes pod 一样。
一块 Raspberry Pi 是 worker。边缘侧的 IoT sensor 是 worker。运行 thin client 的手机是 worker。一个 CI runner 启动、注册一个 function、完成工作、然后断开连接，也是 worker。Engine 不区分这些东西。每一种实现 primitives interface 的新语言、新设备、新 runtime，都会免费获得完整系统：实时发现、实时扩展、实时可观测、durable triggers、跨一切调用。原因在于这个 primitive 允许这样的组合，而不是我们为每一种东西都做了专门集成。
这个赌注
行业正在争论，应该在模型外面包裹多少 scaffolding。这场争论很重要，但它默认 harness 是自己的世界，和后端分离，也和工具触发时真正运行的基础设施分离。
iii 下的是另一个赌注：正确的 primitives，也就是 worker、trigger、function，足够小，也足够通用，所以"什么能参与这个系统？"这个问题的答案是：任何东西。一个云服务。一个 agent。一个浏览器。一个 microcontroller。一个 agent 刚刚启动的 sandbox。它们都以同样方式组合。它们都能发现彼此。它们都共享同一套 trace。
当你不再把"agent 基础设施"和"后端基础设施"分开看，当你不再把任何参与者类别视为架构上不同于其他类别，系统会以添加功能永远无法做到的方式变简单。Harness 和后端之间、云和边缘之间、基础设施和应用之间、人写的服务和 agent 创建的 workers 之间的边界，都会消解为同三个 primitives。
Harness 不在后端之上。Harness 是后端的一部分。而后端，就是任何连接到 iii 的东西。
当 primitives 设计正确，类别会坍缩，复杂度会被大幅简化。
iii 是开源项目。可以通过我们的 quickstart 开始使用。
参考阅读：明星开源项目，为什么开始离开 GitHub？ / 300万人在存的Claude提示词 / 别再把上下文当聊天记录 / Claude 发布官方报告，承认存在 3 处质量退化问题
References：Manus 原话: https://vrungta.substack.com/p/claude-code-architecture-reverse / iii 官网: https://iii.dev/ / quickstart: https://iii.dev/docs/quickstart

## 深度分析
**1. "Primitives 决定系统边界"的核心洞见**
这篇文章最深刻的思想不是 iii 这个产品本身，而是对"什么决定系统边界"这个问题的重新回答。大多数开发者默认系统边界由技术实现决定：队列是一个边界，HTTP 服务是另一个边界，微服务又是另一个。iii 的赌注是：真正的边界应该由"语义所有权"决定——一个 function 的内部逻辑决定它做什么，而 triggers 决定它何时被调用。这与 Unix 的"一切皆文件"哲学一脉相承：不是文件本身特殊，而是"文件作为 interface"这个抽象足够通用，能够承载任意语义。在 agentic 时代，这个思路的价值在于：它让"随机性的 AI"与"确定性的后端"不再是两种不同的系统，而只是两种不同的 workers。
**2. 薄 harness vs 厚 harness 争论的架构陷阱**
Anthropic（薄）与 LangGraph（厚）的争论本质上是"在 harness 层编码多少认知结构"的争论。但 iii 揭示了这个争论忽略的一个前提：两种方案都假设 harness 与后端是两个独立的系统。当 agent 是 workers 时，harness 的厚薄只是一个 function 注册数量的问题，而非两个系统之间的接口问题。这是一个更高层次的抽象——它把"应该在 harness 里编码什么"与"系统边界在哪里"这两个正交的问题区分开了。
**3. "类别坍缩"作为范式转移的标志**
文章提出"软件里的范式转移，关键不在添加功能，而在坍缩类别"。这个论断值得深究。Unix 通过"一切皆文件"坍缩了设备、管道、进程间通信的类别。React 通过"组件作为 function"坍缩了 UI 状态管理的类别。iii 通过"Worker/Trigger/Function"坍缩了队列、HTTP、cron、agent、sandbox 的类别。每一次类别坍缩都伴随一次可组合性的爆发——不是因为添加了新功能，而是因为原本不同的东西现在可以用相同的原语操作。
**4. "Agent 创建 Worker"揭示的递归架构**
文章最超前的部分是 agent 可以创建 sandbox worker，而这个 sandbox 也是一个 worker。这创造了一个有趣的递归：agent（一个 worker）可以动态创建新的 workers（sandbox），新 workers 注册自己的 functions，其他 workers 立即可以发现并调用它们。这带来的结果不是"agent 有了更多能力"，而是"系统的能力边界可以在运行时扩展"。这比"agent 调用 API"强大得多——后者受限于预先定义的 API 集合，而前者可以动态创造全新的 function 集合。

## 实践启示
**1. 在设计 Agent 工具时，先问"这个工具是否应该是 function"**
传统 Agent 开发中，"工具"是一个模糊的概念——它可能是一个 API、一个代码执行环境、一个文件读取操作。iii 的框架提供了一个清晰的判断标准：如果一个工具可以被多个不同的 trigger（HTTP、状态变化、队列、cron）触发，它就应该是一个 function 而非硬编码的 API。这个判断帮助避免"工具"概念的膨胀——很多所谓的"工具"其实只是 trigger 类型的不同，本质上是同一个 work unit。
**2. 用"注册"而非"配置"来扩展系统**
iii 的核心交互模式是"注册"：注册一个 function，注册一个 trigger。大多数传统系统的扩展方式是"配置"：在配置文件中添加一个新的服务地址、一个新的端点。 iii 的做法将"扩展"从配置管理转变为运行时注册。这意味着：添加新能力不需要重启系统，不需要更新配置，不需要服务发现机制。实时发现（new functions 立即对所有 workers 可见）是这个模式最重要的副产品。
**3. 将"上下文持久化"与"function 调用"解耦**
传统 Agent 的"记忆"是一个内部概念——它是 harness 的一部分。iii 将 state::set 变成一个与其他 function 调用完全相同的 trigger() 调用。这带来的设计启示是：不要把"上下文管理"设计为 Agent 的内部状态，而是应该将其设计为系统级别的持久化 function。这样做的好处是：任何 worker（不只是 agent）都可以读写上下文，上下文变化可以被 trigger 监听，上下文操作可以与业务 function 调用使用同一套可观测性基础设施。
**4. 在评估 Agent 基础设施时，关注"与其他系统边界的清晰度"**
iii 的核心价值主张不是"它是一个更好的 harness"，而是"它消除了 harness 与后端之间的边界"。在评估任何 Agent 基础设施方案时，应该问：这个方案如何处理 Agent 与现有后端系统的边界问题？如果答案涉及"通过 API 网关连接"、"通过队列交接"、"通过单独的 trace ID 关联"，那么这个方案仍然假设 Agent 是独立于后端的系统。真正统一的方案应该能让 Agent 与后端服务使用相同的原语注册 functions 和 triggers。
**5. Primitives 设计比功能列表更重要**
iii 最值得学习的不是它的具体功能，而是它的设计哲学：找到一个足够小、足够通用的 primitive 集合，让"添加功能"的答案变成"添加一个 Worker"。在设计任何复杂系统时，先问：能否用一个 primitive 回答"我想要 X"这个问题？如果不能，为什么？如果能，这个 primitive 是什么？"添加一个 worker"这个答案的优雅之处在于它是自描述的——它告诉你具体做什么（添加 worker）以及这会带来的效果（系统获得新能力并立即可发现、可观测）。
## 相关实体
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](ch01/1291-anthropic.html)
- [Anthropic 12 Mcp Production Patterns](ch01/1291-anthropic.html)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](ch01/1291-anthropic.html)
- [Tencent Skill Writing Complete Playbook Jackjchou](../ch04/267-skill.html)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch01/331-anthropic-claude-code.html)

- [Anthropic Long Running Agent Architecture 6H Retroforge](ch01/1291-anthropic.html)

---

