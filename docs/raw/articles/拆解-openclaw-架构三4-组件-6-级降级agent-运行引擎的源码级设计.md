---
title: "拆解 OpenClaw 架构（三）：4 组件 + 6 级降级，Agent 运行引擎的源码级设计"
source: wechat
url: https://mp.weixin.qq.com/s/Q2WbVA4w-QsaIaueTvTeAQ
ingest_date: 2026-07-04
vxc: 49
stars: 4
sha256: df8b396f8e95b557c50ef98bae3056fae2073c8802a36722433801dfca9318d4
---

# 拆解 OpenClaw 架构（三）：4 组件 + 6 级降级，Agent 运行引擎的源码级设计

**来源**: 科技充电站

**发布日期**: 2026-02-28

**原文链接**: https://mp.weixin.qq.com/s/Q2WbVA4w-QsaIaueTvTeAQ

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第三篇。前两篇我们拆了消息流水线和人格系统，今天聊 Agent Runner，也就是 OpenClaw 最核心的运行引擎。

上篇结尾我留了个问题：430,000+ 行 TypeScript，到底在忙什么？

这个问题的答案，颠覆了我对"AI Agent 框架"的认知。

读 OpenClaw 源码之前，我以为它自己实现了完整的 Agent 运行时：接收用户输入、调用模型、解析输出、执行工具、循环往复。毕竟 430,000+ 行代码摆在那里，什么都能写。

但实际翻开代码，发现一个大多数分析文章都忽略的事实： OpenClaw 不实现自己的 Agentic Loop。

核心的"接收输入 → 调模型 → 解析输出 → 执行工具 → 再调模型"这个循环，由一个叫 Pi Agent 的外部框架处理。OpenClaw 的代码里写得很直白：运行时 "derived from pi-mono"。

那 430,000 行 TypeScript 在做什么？

答案是： 调用周围的一切。

模型解析与 fallback 链、API key 冷却轮转、system prompt 组装（上篇讲过）、上下文窗口监控、压缩失败级联、记忆冲刷、auth profile 切换、session 锁管理、工具策略过滤，这些全是 OpenClaw 自己的代码。Pi Agent 只负责最内层的 loop，外面那一圈又一圈的"基础设施"全是 OpenClaw 构建的。

这跟我做系统架构的经验完全一致。任何一个正经的生产系统，核心业务逻辑可能只有几百行，但错误处理、降级策略、重试机制、监控告警加起来，轻松是核心逻辑的 10 倍。Agent 系统也不例外，LLM 调用本身不难，难的是调用周围的一切。

## Pi Agent 嵌入式架构：不造轮子，但造车间

OpenClaw 嵌入 Pi Agent 的方式很有讲究。它不是把 Pi 当作一个子进程或远程服务来调用（那样会有进程间通信的开销和复杂度），而是直接嵌入 Pi SDK 的 session 对象到自己的进程中。

具体来说，  runEmbeddedPiAgent()  这个函数是整个 Agent 运行的入口。它做了几件事：

通过早期 hooks（  before_model_resolve  和 legacy  before_agent_start  ）解析要用哪个 provider 和 model，应用上下文窗口 guards，然后解析 auth profiles 并在失败时自动轮转候选，重试次数跟 profile 数量成正比。

Agent 循环的完整路径是：intake → context assembly → model inference → tool execution → streaming replies → persistence。每个 session 严格串行执行，同一时刻只有一个推理请求在跑，避免工具和 session 状态的竞争条件。每个 session 还有独立的 lane（队列），确保消息按序处理。

这种"嵌入式"架构的好处是，OpenClaw 可以在 Pi 的 loop 外层随意加自己的逻辑：自定义工具注入、system prompt 定制、持久化策略、多 profile 认证轮转，全部都能做。Pi 管核心 loop，OpenClaw 管其他所有事情。

这跟很多企业的技术选型思路很像：用 Kafka 做消息队列但自建消费者框架，用 Redis 做缓存但自建缓存策略层，用 Kubernetes 做编排但自建部署流水线。核心基础设施用成熟方案，上层的业务适配和运维体系全部自建。

## Agent Runner 四大组件

OpenClaw 在 Pi Agent 外围构建的基础设施，可以拆成四个核心组件。

Model Resolver， 负责模型解析和 provider 管理。代码在  src/agents/pi-embedded-runner/model.js  。OpenClaw 完全模型无关，支持 Anthropic（Claude Sonnet/Opus）、OpenAI（GPT-4o、GPT-5.2 Codex）、Google（Gemini 3 Pro）、DeepSeek、GLM-5、Kimi K2.5、MiniMax、Mistral，再加上本地模型通过 Ollama、LM Studio、node-llama-cpp、vLLM 或任何 OpenAI 兼容服务器接入，OpenRouter 作为统一代理。

当主模型失败或 API key 被限速，Model Resolver 自动冷却该 key 并轮转  agents.defaults.model.fallbacks  链。一个微妙的设计：provider auth failover 先在同一个 provider 内部发生（比如同一个 Anthropic 账号下的不同 key），只有所有 key 都冷却了才会换到下一个 provider。用  openclaw models status  可以看到当前解析后的主模型、fallback 链和 OAuth 过期时间。

官方 README 推荐 Anthropic + Opus 4.6，理由是长上下文能力和更好的 prompt injection 抵抗力。但这只是推荐，你完全可以用 DeepSeek 跑主力、Kimi 做 fallback，或者全用本地模型。

支持 per-agent 模型覆盖（  agents.list[].model  ），意味着你的"翻译助手"可以用便宜的模型跑，"代码审查助手"用 Opus 4.6 跑，成本和质量各取所需。

System Prompt Builder， 就是上一篇讲的 10 步组装流水线，这里不重复了。

Session History Loader， 从 JSONL 转录文件（第一篇讲过的持久化方案）加载历史交互记录，让 Agent 在新一轮对话中保持上下文连贯。

Context Window Guard， 代码在  src/agents/context-window-guard.ts  ，负责监控 token 消耗，接近模型的上下文窗口限制时触发压缩。这是整个 Agent Runner 中最精密也最容易出问题的部分。

## 6 级压缩失败级联：从优雅降级到壮士断腕

Context Window Guard 触发压缩后会发生什么？

这里有一套我见过的最精密的失败级联设计。代码在  src/agents/pi-embedded-runner/compact.ts  ，从温柔到暴力分 6 个等级：

L1：Pi SDK 自动压缩。 先让 Pi Agent 框架自己处理，用它内置的压缩策略对上下文做摘要。大部分情况下，这一步就够了。

L2：OpenClaw 重试压缩。 如果 Pi 的压缩失败（通过  attemptCompactionCount  追踪），OpenClaw 接管，最多重试  MAX_OVERFLOW_COMPACTION_ATTEMPTS = 3  次。每次重试用不同的压缩参数。

L3：工具结果截断。 如果压缩持续失败，说明上下文中有大量工具调用的返回结果占据了空间。  truncateOversizedToolResultsInSession()  开始裁剪那些特别长的工具输出，只保留摘要。

L4：Thinking 降级。 把 thinking 级别从 "on" 降到 "off"。关闭思维链可以显著减少 token 消耗，但代价是推理质量下降。

L5：切换 model/auth profile。 换一个模型或认证 profile 试试。也许当前模型的上下文窗口就是不够大，换一个上下文更长的模型可能就通了。

L6：会话重置。 最后一招，生成一个全新的 sessionId，从头开始。这意味着之前的对话上下文全部丢失，但至少 Agent 不会彻底卡死。

这套级联让我想到我们团队的服务降级策略：L1 熔断保护、L2 限流削峰、L3 功能降级、L4 兜底方案，每一层的设计理念都是"宁可体验下降，也不能整体崩溃"。OpenClaw 的 6 级级联也是同样的哲学：从最小代价的压缩重试，到最大代价的会话重置，每一步都在"保住多少上下文"和"能不能继续运行"之间做权衡。

不过这套系统也有一个已知的坑。GitHub #24800 记录了一个场景：在长时间的工具调用循环中（比如 Agent 连续执行几十个文件操作），上下文通过连续的工具调用不断增长，但因为没有用户消息穿插，自动压缩可能不会触发。session 就这么一直膨胀，直到爆掉。社区里有人反馈 session 看起来"卡住"了需要重启，很多时候就是这个原因。

串行化的 per-session lanes 加上多级重试，在工程上确实很难做完美。

## 压缩前的"临终遗言"：记忆冲刷机制

压缩级联中还藏着一个特别巧妙的设计，我把它叫做"临终遗言"机制。

当 session 接近上下文限制时（  softThresholdTokens: 4000  ），在真正触发压缩之前，OpenClaw 会偷偷插入一个"静默的 agentic turn"。

什么意思呢？系统会在用户看不到的情况下，给模型发一条隐藏指令："Write any lasting notes to memory/YYYY-MM-DD.md; reply with NO_REPLY if nothing to store." 翻译过来就是："把重要的事情赶紧写到日志文件里，压缩要来了。"流式传输被抑制，用户完全无感。

这个设计直接对应了上一篇讲的那个真实事件：Meta 超级智能实验室的 Summer Yue 让 Agent 整理邮箱，"删除前先确认"的安全约束在压缩时被摘要算法吃掉了，Agent 开始疯狂删邮件。

记忆冲刷就是为了防止这种情况。在上下文被压缩摘要之前，先把关键信息"固化"到磁盘上的 Markdown 文件里。即使压缩丢了一些上下文，下次 session 加载时还能从文件中恢复。

当然，这不是万无一失的方案。如果模型在那个静默 turn 里没有正确识别出哪些信息是"重要的"，或者 softThreshold 设得太低导致压缩来得太快，该丢的还是会丢。但比起完全没有这个机制，好了不止一个数量级。

## 模型无关设计：唯一正确的选择

回到模型层面，OpenClaw 的模型无关设计值得多说几句。

2024 年，GPT-4 是绝对主力，很多 Agent 框架直接硬编码 OpenAI 的 API。2025 年，Claude 崛起，Gemini 追上来，一堆框架开始痛苦地重构模型层。2026 年，DeepSeek、GLM-5、Kimi K2.5 你方唱罢我登场，LLM 市场的格局每三个月洗一次牌。

在这种背景下，把模型层做成可插拔的不是"好的工程实践"，是生存必需。

OpenClaw 的做法很彻底。自定义 provider 通过  models.providers  注册，你可以接入任何遵循 OpenAI 兼容协议的服务。per-agent 模型覆盖让你在同一个系统里混用不同厂商的模型。Auth profile 机制让你管理多套 API 密钥，自动冷却和轮转。

还有一个小细节：OpenClaw 的模型 provider 文档里提到了  openai-codex  provider（带 OAuth flow）和  OpenCode Zen  provider（比如  opencode/claude-opus-4-6  ），说明它在持续适配新出现的 AI 编码服务。

## 工具的成本不对称：bash 是最被低估的 AI 工具

Agent Runner 还有一个容易被忽略的设计选择：它的核心工具原语不是什么精心设计的 API 封装，而是最原始的 Read、Write、Edit 和 Bash（exec）。

这创造了一种强大的成本不对称。

用 LLM 推理链来处理数据，每次调用大约 $0.15 到 $0.50。但同样的工作如果用 shell 命令完成，  curl | jq | grep  一条管道链，CPU 成本约 $0.001，是 LLM 的百分之一到千分之一。

更关键的是，一旦某个工作流被 Agent 验证为有效并稳定为 shell 脚本，之后就不再需要 LLM 推理了，成本永久降为零。这跟传统软件工程的"手动 → 脚本 → 自动化"路径完全一致。

OpenClaw 利用整个 Unix 生态作为工具层，而不是重新发明一套工具协议，这跟它贯穿全架构的哲学一脉相承： 用已有的基础设施，不造新抽象。

## 架构裂缝：光看设计很美，看 bug 才知道真实

读源码不看 issues 等于只看了一半。OpenClaw 的 GitHub issues 里记录了一些有意思的架构裂缝，对我们理解这个系统的真实状态很有帮助。

某些运行路径历史上未能将 per-agent 覆盖（比如  agentDir  、  exec  config）正确传递给  runEmbeddedPiAgent()  ，导致"全局默认泄露到隔离 agent 运行"的问题。这在多 Agent 配置下尤其危险，Agent A 的配置可能莫名其妙地影响了 Agent B。

压缩重试和 lane 处理也有边界情况。社区反馈的 session "卡住"问题，很多跟串行化的 per-session lanes 加多级重试的交互有关。一个 session 如果在压缩重试阶段"卡住"了，整个 lane 都会阻塞，后续消息只能排队等着，直到手动重启。

这些 bug 不是小问题，它们揭示了一个更深层的架构张力： 串行化保证了正确性，但也让故障恢复变得困难。 当所有操作都在一个 lane 里排队时，任何一个环节卡住都会形成堵塞。这跟我们做微服务时遇到的问题如出一辙：同步调用链越长，故障传播的风险越大。

## 一些个人观察

拆完 Agent Runner，三个思考。

关于"不造轮子"这件事。 Pi Agent 框架处理核心 loop，OpenClaw 处理外围的一切。这个分工在当前阶段很合理，但也带来了一个隐忧：OpenClaw 对 Pi 的 loop 行为只有有限的控制力。压缩策略、tool call 解析、streaming 协议这些核心行为，OpenClaw 需要通过 hooks 和适配器来影响而不能直接修改。如果 Pi 的某个行为不符合 OpenClaw 的需求，只能绕着走。

关于模型层的务实。 支持十几个 provider 不是为了炫技，是因为 LLM 市场还远没有稳定下来。半年前的最佳模型可能半年后就不是了，保持模型层的灵活性是一种对不确定性的保险。OpenClaw 在这件事上的判断很清醒。

关于压缩级联的优雅与脆弱。 6 级降级的设计非常漂亮，每一层都在最小化损失的前提下保持系统运行。但它的脆弱性也是真实的：压缩本质上是有损操作，每一次压缩都会丢失一些上下文信息。当 Agent 处理的任务复杂度越来越高、上下文需求越来越大时，这种"压缩来续命"的策略能撑多久？也许未来的方向不是更好的压缩，而是根本不需要压缩的超长上下文模型。

下一篇，我们聊 Memory 记忆系统。OpenClaw 的记忆不是传统 RAG，而是一套完整的 IR 工程：70% 向量 + 30% 关键词的混合检索，30 天半衰期的时间衰减，压缩前的静默记忆冲刷。Milvus/Zilliz 团队甚至把这套架构提取成了独立库 memsearch，说明这个设计有相当的普适性。

你做的系统里，核心业务逻辑和"周边基础设施"的代码比例大概是多少？欢迎留言聊聊。

我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊，也欢迎你把这篇文章分享给身边做技术、做产品的朋友。

当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。 

 交给 AI 的是任务，留给自己的是思考。 

 脑子不停转，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。
