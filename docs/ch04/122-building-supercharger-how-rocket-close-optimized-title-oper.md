# Building Supercharger: How Rocket Close optimized title operations with agentic AI

> 📊 Level ⭐⭐⭐ | 11.0KB

## 摘要

Rocket Close 是 Rocket Companies 旗下、位于底特律的 title agency 与 appraisal management 公司。按揭需求上行后，逐州差异化的 title examination、散落在多套系统里的资料与必须人工完成的研究，让 title operations 成为 homebuying 流程的瓶颈。Supercharger 是它与 AWS 共建的 agentic AI 方案：Strands Agents 作 agent harness，Bedrock 承载 LLM 与 Knowledge Bases，MCP 工具层对接运营数据库，把分散的 title 与 closing 知识集中起来，用自然语言引导运营团队走完订单流程。上线后 contact center 来电与邮件量降 30%，端到端延迟改善到原来的三分之一。

## 核心要点

- **30% 的 contact center 来电量下降** —— 每月数千通电话与邮件被拦在人工前，多为订单状态、流程节点、各州 title 要求这类高频问询。
- **3x 延迟改善** —— 来自减少 agent 调用 LLM 的次数（架构精简 + 更好 prompt），而非换更强模型，且同时降本。
- **6 项互联能力** —— Conversation Analytics、州级 examination 辅助、API 集成、Guardrails 与回答准确性、日志监控、多数据源统一访问，围绕单一领域 agent 组装。
- **9 步请求链路** —— JWT 握手 → Istio 校验建 WebSocket → 唤起 Strands Agent → 知识库检索 → 工具选择 → MCP 执行（经 Atlas Web API 取订单）→ 上下文合成 → 流式返回 → 渐进渲染。
- **MCP 的 3 项结构性收益** —— 可扩展（新数据源即新工具）、关注点分离（每系统逻辑独立成工具）、灵活（按 query 动态选工具）；订单信息由工具一次取回再交 LLM 抽取，避免多次数据库往返累加延迟。
- **三层安全纵深** —— Guardrails 管内容边界，row-level entitlements 管越权，审计日志供取证。
- **人的位置没被移除** —— agent 产出上下文、checklist 与草稿，title 判定仍由持证人员落笔。

## 技术栈与架构

**Agent harness：Strands Agents。** AWS 开源的 agent harness SDK，走 model-driven 路线：写一个 prompt 加一组工具，由模型自身的 planning、tool-calling、reflection 驱动下一步，而非用流程图把每步写死。同一份代码既跑简单问答也撑复杂用例，从本地调试到云端部署不必重写；工具选择、上下文管理、session state、多 agent 编排均可单独定制。原文选它的明面理由是"保留后续换 LLM 的余地"——能力边界变了，换模型不必换骨架。

**工具层：MCP 作为系统边界。** 每个数据源封装成独立的 MCP 工具，agent 推理时决定调哪个、带什么参数；工具背后是运营数据库（订单、SOP、各州 title exam 政策）与对外供数的 Atlas Web API。关键不在"能调外部系统"，而在把集成逻辑挪出 prompt：agent 只见工具名与 docstring。原文强调"描述性命名 + 连贯 docstring"是选对工具的前提——工具接口本就是 prompt 的一部分，只是可版本化、可单测。

**知识与安全层。** Knowledge Bases 承载集中后的政策语料，检索时用元数据过滤收窄到当前订单相关的州与县。安全是三件独立的事：Guardrails 校验回答质量与合规，row-level entitlements 阻止误访问客户敏感数据，全量对话落审计日志；三者都不写进业务 prompt，而以 session 属性注入。

**数据流：六项能力如何咬合。** Conversation Analytics 先判断这是状态查询还是流程求助；意图明确后，知识库给政策依据、MCP 给订单事实，两者在 context synthesis 合并成订单级上下文；州级辅助把它翻译成该州该县的 checklist 与下一步指引；Guardrails 出站前校验；logging 与 monitoring 全链路留痕；统一数据源访问是前五者的合成结果。全程 WebSocket 流式回传。

## 深度分析

### 领域知识集中化，为什么胜过逐州硬编码

硬编码的失败不是"写不出来"，而是组合爆炸后的维护成本：每州一套 probate / tax ID / 县级录音规则，规则还会变，任何修订都是一次代码评审加发布。Supercharger 把政策文本挪进 Knowledge Bases，差异交给检索时的元数据过滤，规则更新的路径就从"工程发布"变成"语料更新"——由懂 title 的人而非懂部署的人维护。

代价是失败模式变了。硬编码的 bug 确定、可复现；检索失败是概率性的，可能召回相邻县的政策，也可能漏掉刚修订的条款。所以元数据过滤不是优化项而是补偿控制，压低的正是"语义相似但法域不同"这类最危险的召回错误——原文把 metadata filtering 单列一条 lesson，因为它承担一致性责任。集中化转移的不是工作量，而是质量责任的主体：从"分支写得对不对"变成"语料是不是最新"，后者是治理问题，比养一支懂几十个州规则的工程团队便宜。

### MCP 作为工具边界，如何改写 build-vs-integrate 的算式

不用 MCP 时，集成复杂度会渗进 prompt：每个数据源的调用约定、参数拼装、异常处理都以自然语言混在系统提示里，prompt 越写越长越难测，改一个数据源可能扰动另一个。MCP 把边界做硬——工具可独立版本化，输入输出有 schema，能脱离 LLM 单测，新数据源以"再加一个工具"接入而不碰 agent 主体。原文的三条理由（extensibility、separation of concerns、flexibility）是同一件事的三个侧面。

但边界不免费。它把集成复杂度换成了工具选择复杂度：工具一多，选错概率上升，命名歧义与过时 docstring 直接表现为"调错系统"。这就是原文抓住命名与文档不放的原因——在 MCP 架构里，工具描述不是注释，而是模型的推理输入。二阶收益是：集成逻辑收在工具侧，harness 与模型都能换。

### 受监管放贷流程里，human-in-the-loop 的边界画在哪

这条边界由问责结构决定，不由模型能力决定。title examination 的结论进入 title insurance 的承保判断，牵涉持牌与可追溯的责任主体：结论错了，要能指认谁签字、依据哪条政策、看了哪份原始记录。审计日志能证明"系统建议了什么"，证明不了"持牌人尽到了审查义务"——后者只能由人承担。模型再强，这一步也不会让出去。

工程含义是清楚的三条：agent 输出必须是**草稿**而非终态，可被无声改写；每条建议要能**回溯**到具体政策段落与订单字段，否则人无从审查；流程必须允许**拒绝**，建议不构成操作约束。Supercharger 正落在这三条上。原文对收益的措辞也克制：减少认知负荷、缩短研究时间、提高决策准确性，而非"自动完成 title exam"——这种自律本身就是产品边界。

### 哪些架构决策不可迁移

**州级规则语料不可迁移**，那是 Rocket Close 的专有资产；可迁移的是"集中化 + 元数据过滤"的方法。

**30% 的收益结构依赖问询密度**。前提是 title ops 有大量高频低复杂的人工问询堆在 contact center。换到问询稀薄、或每个请求都需深度定制的场景，架构仍改善体验，但拿不到同量级成本收益。立项前该先数工单。

**"一次取数"的延迟优势依赖 Atlas Web API 这类统一出口**。若订单数据散在五六个系统且无聚合 API，MCP 层会退化成 N 次工具调用 + N 次 LLM 往返，延迟优势反转——那时该先修数据层，而不是先上 agent。

**human-in-the-loop 的形状由监管决定，保守程度不能照抄**。低监管场景审阅可后移甚至抽样化；照搬"全量人工确认"会让 agent 的价值被流程成本吃掉。

**真正能带走的是三条纪律**：prompt 只描述目标不描述步骤；工具命名与 docstring 按接口标准打磨；安全策略以 session 属性注入。

## 实践启示

1. **先量化问询密度，再决定要不要建 agent。** 把工单按"高频 / 低复杂"切一刀，算出可被问答替代的比例；它决定收益上限，比选型讨论有信息量。
2. **把工具边界当产品接口设计。** 工具名用动词 + 名词，docstring 写清"何时调用、返回什么、失败怎么办"；命名歧义在 MCP 架构里等价于 bug。
3. **安全放 session 属性，不放 prompt。** Guardrails 与 entitlements 作为平台层能力注入会话，业务 prompt 无法覆盖或绕过，这也是防注入的结构性手段。
4. **调延迟先数 LLM 调用次数。** 先做"单次取数 + 一次合成"，再精简 prompt，最后才考虑换模型；流式返回（WebSocket/SSE）改善的是感知性能，与真实延迟是两笔账。
5. **领域知识的所有权交给业务方。** 语料更新不该排队等工程发布；配套要做元数据规范与过期巡检，否则检索会静默返回已改的政策。
6. **把 executive sponsorship 与变更管理当交付物。** PoC 到 production 的落差不在技术，而在流程改造与团队习惯。

## 相关实体

- [strands-agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/strands-agents.md) —— 本文所用 harness SDK 的拆解。
- [mcp-protocol](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-protocol.md) —— MCP 协议本体，解释工具边界为何可版本化。
- [mcp-tool-design-tradeoffs-anthropic-2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mcp-tool-design-tradeoffs-anthropic-2026.md) —— 工具命名取舍，与"docstring 即 prompt"互证。
- [secure-ai-agents-policy-lambda-interceptors-aws](https://github.com/QianJinGuo/wiki-public/blob/main/entities/secure-ai-agents-policy-lambda-interceptors-aws.md) —— Bedrock Agent 策略拦截，对应三层安全纵深。
- [agentops-operationalize-agentic-ai-amazon-bedrock](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-amazon-bedrock.md) —— Bedrock 上 agent 的 production 化路径。

[原文存档](https://aws.amazon.com/blogs/machine-learning/building-supercharger-how-rocket-close-optimized-title-operations-with-agentic-ai)

---

