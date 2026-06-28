## Ch13.002 阿里巴巴&蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地

> 📊 Level ⭐⭐ | 20.0KB | `entities/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地.md`

## 核心要点
- OTel SemConv 是可观测数据的"道"，采集工具是"术"——语义规范才是 OTel 社区的核心价值
- LoongSuite GenAI SemConv 在 OTel GenAI SemConv 基础上新增 Entry/Step Span、Skill 语义、Token 级推理观测三大核心增强
- GenAI Utils 作为工程化能力层，将语义规范的复杂性封装为统一 API，实现插桩库与规范升级的解耦
- Token 级推理可观测首次将 vLLM / SGLang / TensorRT-LLM 引擎内部的黑盒过程拆解到 Token 粒度
> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地.md)

## 背景：为什么需要 GenAI 可观测语义规范
随着 GenAI 的快速发展，AI Agent 系统中涌现出大量新核心概念——Model、Prompt、Token、Tool Calling、Agent、Memory、Session——它们已成为算法工程师、运维人员和可观测平台用户最密切关注的观测对象 。这些对象需要像传统系统中 HTTP 请求或数据库调用一样被标准化采集、展示和消费，使系统维护者能够清晰了解调用过程并高效排查问题 。
在此背景下，OpenTelemetry（OTel）早在 2024 年初就启动了 GenAI 语义规范建设，希望通过 Semantic Conventions（SemConv）为这些新对象建立统一的数据采集规范 。

### SemConv 的定位与价值
对于刚接触 OTel 的人，自动插桩（Auto Instrumentation）或 SDK 等采集工具常被视为社区的核心价值所在 。然而，深入了解社区后会发现，相比于 SemConv，这些采集能力更多扮演的是"术"的角色，真正服务的是 OTel 的"道"——通过 SemConv 建立统一的可观测数据语言 。OTel SemConv 是汇聚全球数十家头部可观测厂商、数百名领域专家共同设计并持续演进的数据采集标准 。
统一 SemConv 的核心价值体现在三个层面：
**统一数据语言，解决口径不一致**：GenAI 应用天然跨模型、跨框架、跨平台 。没有统一语义规范时，不同团队各自记录"模型名"、"输入长度"、"Token 数"等，字段命名和统计口径无法对齐 。OTel GenAI SemConv 以 `gen_ai.system`、`gen_ai.request.model`、`gen_ai.usage.input_tokens` 等标准字段实现"同一类问题用同一套数据解释" 。
**支撑性能、成本、质量与安全的统一治理**：统一语义规范使团队能够追踪性能、成本和安全问题，为大型企业提供技术排查、经营分析、评测和合规四大实际价值 。
**降低接入成本，推动基础设施复用**：一旦字段、Span 结构、事件模型和上下文传递方式定义清楚，无侵入埋点、SDK 封装、平台分析、看板和告警策略均可复用，业务无需每次从"我要采什么字段"重新思考 。

## LoongSuite GenAI SemConv 详解
### 演进历程
2025 年，阿里云、阿里控股与蚂蚁集团的可观测团队联合启动，在 OTel GenAI 语义基础上对内部场景中尚未覆盖的内容进行语义建模，并推进内部采集工具的实现与落地 。2026 年，在与 OTel 社区 GenAI 主要 Maintainer 沟通后，考虑到相关内容较多且迭代较快，在社区建议下先将成果开源至阿里巴巴 LoongSuite 可观测品牌下，作为 OTel GenAI SemConv 的厂商增强标准，后续择机逐步贡献至上游 。

### 新增 Entry/Step Span
#### 问题背景
在 AI Agent 执行长程任务时，执行逻辑会包含多轮工具调用和模型调用，单个 Trace 中可包含成百上千个 Span，导致同一链路中 Span 展示极其冗长，调用链轨迹难以清晰观测 。

#### 语义建模
**Entry Span**：在 Agent 调用入口处创建 Span，用于还原模型和用户的原始输入和输出，形成对话历史，确保下游任务处理的数据不受 System Prompt 或框架 Prompt 干扰，能够获取最原始的客户请求 。
**Step Span**：Step 代表 Agent 在每次 ReAct 过程中的层次化表达 。每次 ReAct 过程都包含"反思 → 工具调用 → 模型调用"的循环，排查问题时采用 Top-down 方式：先定位问题出现在哪一轮 ReAct，再深入分析该轮中具体哪一步出错 。通过逐层 Span 结构，可以清晰展示 Agent 的多轮行动、反思及对应执行结果，使每轮循环轨迹一目了然 。
目前该语义规范已在 OpenClaw、QwenPaw、HERMES Agent 等多个场景中落地 。

### 新增 Skill 语义
#### 问题背景
在电商购物助手等 Agent 场景中，用户的每条指令由 AI Agent 理解意图后路由到对应的 Skill（技能）完成执行，Skill 是业务功能的最小可复用单元 。现有 OTel GenAI 语义约定已覆盖 Agent、LLM、Tool 等 Span 类型，但缺少对 Skill 这一介于两者之间的编排单元的业务功能聚合层的抽象 。
缺少 Skill 维度可观测性带来三个核心痛点：无法归因到功能域（性能抖动时只能看到一堆 `execute_tool` 和 `inference` Span）、无法统计 Skill 健康指标（缺少 P99 延迟、成功率、调用频率等）、多 Skill 并发时链路混淆（不同 Skill 的 LLM/Tool Span 在 Trace 树中无法区分归属） 。

#### 语义建模
LoongSuite GenAI SemConv 新增 `gen_ai.skill.*` 属性组，用于标识 Skill 的身份与版本信息，当前阶段附着在已有的 `execute_tool` Span 上，无需引入新 Span 类型即可快速落地 。同时，基于集团业务，落地了独立 `invoke_skill` Span 方案，并向 OTel 社区提交了提案，以覆盖 Skill 从加载到执行完成的完整生命周期 。

### 新增 Token 级推理观测
#### 问题背景
2025 年上半年，蚂蚁可观测团队围绕蚂蚁推理云服务建设了全链路可观测体系，覆盖推理云服务核心组件，构建了从客户端到引擎端的多语言、多协议分布式追踪 Trace 能力，蚂蚁与阿里云团队协作向 vLLM、SGLang、TensorRT-LLM 三大推理引擎贡献了基础的可观测 Trace，形成蚂蚁和阿里集团的事实标准 。
然而，随着推理云服务承压加剧，请求级别的引擎 Trace 已无法有效定位更深层次的问题 。研究生产案例后发现：性能异常往往源于某些 Token 生成慢（大概率是其他请求并发干扰导致），而精度异常（复读、答非所问、乱码）则从某个异常 Token 开始持续出错 。因此，推理请求问题定位定界必须以 Token 级别可观测数据作为支撑 。

#### 语义建模
推理引擎本质是一个无限循环执行迭代（Iteration）的系统，每个迭代根据资源情况和调度策略选取一批请求组成 Batch 进行批量处理，每个请求通常生成一个 Token 。
在 Token 性能数据采集方面，每个请求的每个 Token 粒度采集进入迭代和退出迭代的时间戳，从而推演出每个 Token 的调度时间、实际执行时间及用户感知的总耗时 。同时，Batch 的总请求数（特别是总 Token 数）刻画了批处理负载，进一步决定 Token 生成耗时 。
在 Token 精度数据采集方面，每个 Token 粒度采集其对应候选 Top-K Token 的概率分布，通过该分布可判断模型输出质量：质量差的模型 Top 候选 Token 越不符合预期；若模型输出符合预期但选中 Token 不在 Top-K 中，则问题指向采样参数（如温度）设置不合理 。

#### 实现效果：引擎显微镜
基于上述规范，在三大引擎上采集并输出标准数据，依托统一标准数据为用户呈现一致功能界面，最终打造了"引擎显微镜"产品，提供引擎并发与 Token 级别的推理引擎深度观测能力 。

- **引擎 Token 分析**（高倍镜）：对准单个请求，观察其内部 Token 生成的每一个步骤耗时，以及 Top 候选 Token 概率分布，精准定位延迟根源与精度异常问题 
- **引擎并发剖析**（广角镜头）：清晰呈现引擎所有请求的并发、竞争和协作关系，快速识别资源冲突与瓶颈 
典型案例 1：某请求 TPOT 破线，Token 分析显示第 125 个 Token 耗时 6.8 秒，通过引擎并发剖析定位到是另一租户请求的 prefill 阶段中断了当前请求的 decode 过程，根因为 PD 分离不彻底 。
典型案例 2：答非所问问题，Token 分析发现首 Token 为 "begin_of_sentence"（BOS）特殊 Token，说明回答与 prompt 毫无关联——BOS 不应出现在任何正常回答中，定界后确认为大模型 badcase，需调整模型或等待后续版本优化 。
产品上线后历经大促，在稳定性场景中成功帮助引擎/SRE/业务同学定位多起问题，将问题定界效率提升 10 倍，真正做到了又快又准并给出优化建议 。

## GenAI Utils 工程化实践
### 背景与问题
LoongSuite GenAI SemConv 覆盖了 Agent、Skill、Token Level Inference 等多个维度的语义建模，但各类插桩库（Instrumentation）开发者面临一个共同的工程挑战：每个 GenAI 框架插桩库都需要实现完整的遥测采集逻辑——创建 Span、挂载语义属性、记录 Metrics、发送 Events、管理 Context 传递——这些逻辑在不同框架插桩间高度重复，更关键的是当语义规范迭代升级时每个插桩库各自维护一套实现，升级成本成倍增长 。

### 架构设计
GenAI Utils 整体架构遵循"分层解耦、统一收口"的设计原则 ：

- **插桩层只做数据提取**：各框架插桩库通过 Hook/Monkey-Patch 拦截框架调用，将数据填充到对应的 Invocation 数据对象中，不直接操作 OTel API 
- **GenAI Utils 统一收口遥测输出**：所有 Span 创建、属性挂载、Metrics 记录、Event 发送、Context 管理均由 ExtendedTelemetryHandler 内部完成 
- **规范升级只改一处**：当 LoongSuite GenAI SemConv 新增字段或调整结构时，只需修改 GenAI Utils 中的 Span Utils 和 Metrics 模块，所有下游插桩库自动生效 
ExtendedTelemetryHandler 继承自 OTel 上游的 TelemetryHandler，并在此基础上扩展了 Agent、Tool、Embedding、Retrieve、Rerank、Memory 等 LoongSuite 新增操作类型，同时集成了多模态异步处理能力，确保与上游社区代码同步时不产生冲突 。

### 统一编程模型
GenAI Utils 为 LoongSuite GenAI SemConv 覆盖的每种 GenAI 操作提供了对应的 Invocation 数据类和 Context Manager 方法，形成了统一的"填数据 + 交给 Handler"编程模型 。开发者不需要手动创建 Span、设置 SpanKind、挂载 `gen_ai.agent.name` 属性、记录 Duration Metrics——这些全部由 ExtendedTelemetryHandler 在 Context Manager 的 `__enter__` 和 `__exit__` 中自动完成 。若调用过程中抛出异常，Handler 自动捕获并在 Span 上设置 `error.type` 属性和错误状态 。
基于 GenAI Utils，LoongSuite Python Agent 已实现对国内外主流 GenAI 生态框架和模型服务的插桩覆盖，所有插桩库核心遥测逻辑复用 GenAI Utils 实现，当 LoongSuite GenAI SemConv 新增语义或调整规范时，只需升级 `opentelemetry-util-genai` 包，所有下游插桩库即可统一生效 。

## 深度分析
### SemConv 的厂商增强路径
LoongSuite GenAI SemConv 的演进路径体现了大型云厂商参与开源社区标准的务实策略 ：先在内部场景验证（2025 年），再开源发布厂商增强标准（2026 年），最后择机贡献至 OTel 上游 。这一路径的好处在于：内部场景足够丰富时可以快速迭代验证规范的实用性，同时避免在社区标准尚未成熟时过早引入碎片化 。

### Entry/Step Span 的 ReAct 观测价值
Entry/Step Span 的设计直接对应了 ReAct（Reasoning + Acting）范式中多轮循环难以观测的痛点 。传统 Span 树在长程 Agent 任务中容易出现 Span 爆炸，导致调用链无法有效阅读 。Entry/Step Span 通过"入口统一 + 步骤分层"的抽象，将几百个底层 Span 组织为可读的层次结构，为 Top-down 排查提供了天然路径 。

### Token 级可观测的白盒化意义
Token 级推理可观测最深刻的价值在于将推理引擎从"黑盒"变为"白盒" 。过去工程师定位推理引擎问题只能通过请求级 Trace 结合日志猜测定界，而 Token 级数据让每一个 Token 的生成调度过程完全透明 。慢 Token 定位（调度干扰还是执行慢）、精度异常（模型问题还是采样参数问题）、BOS Token 异常（模型 badcase）等过去难以定界的问题，现在均有直接的观测数据支撑 。

### GenAI Utils 的工程化范式价值
GenAI Utils 体现了一种典型的"平台工程"思路：将复杂规范封装为简洁 API，让业务开发者聚焦业务逻辑而非遥测实现细节 。这种"填数据 + 交给 Handler"模式，本质上是将 OTel 的复杂性内置于平台层，对上提供零成本接入体验 。这一设计对于有多框架接入需求的大型组织尤为重要——它将规范升级的成本从 O(N) 降低到 O(1) 。

### 对 OTel 生态的补充意义
LoongSuite GenAI SemConv 的三大新增能力——Entry/Step Span、Skill 语义、Token 级推理——恰好填补了 OTel GenAI SemConv 在复杂 Agent 场景和底层引擎场景的两处空白 。前者解决了 Agent 编排层"看不清"的问题，后者解决了推理引擎层"看不透"的问题，共同构成了从业务 Agent 到基础设施的全栈可观测覆盖 。

## 实践启示
### 对于可观测平台建设者
GenAI 场景的可观测建设应从一开始就以统一语义规范为目标，而非在各个模型和框架上单独建设 。OTel SemConv 提供了稳定的基础，LoongSuite GenAI SemConv 在此之上补充了 Entry/Step/Skill/Token 四层语义，覆盖了从 Agent 编排到引擎内核的全栈观测需求 。

### 对于 AI 平台工程师
在 Agent 框架选型和自研时，应从一开始就规划好 Entry/Step/Skill 三层 Span 的接入，这直接决定了生产环境出问题时的排查效率 。没有结构化的 Span 层次，长程 Agent 的 trace 将难以阅读 。

### 对于推理引擎团队
Token 级可观测数据对于定位 vLLM/SGLang/TensorRT-LLM 等引擎的并发干扰、调度异常、精度退化等问题具有不可替代的价值 。建议在推理引擎内核层面埋点接入 LoongSuite GenAI SemConv 的 Token 级语义，输出标准 Trace 数据，统一接入可观测平台 。

### 对于插桩库开发者
优先使用 GenAI Utils 而非直接操作 OTel API 。GenAI Utils 封装的 ExtendedTelemetryHandler 统一处理了所有 Telemetry 输出的复杂性，插桩库开发者只需关注"从框架中提取什么数据"，这一分工使插桩库代码更简洁，且在语义规范升级时拥有最低的维护成本 。

### 对于推动 OTel 标准的社区贡献者
LoongSuite 的演进路径——内部验证后贡献社区——是大型企业参与开源标准的最佳实践 。在 OTel 社区提案 Skill 语义的经历表明，社区对有充分生产验证的提案接受度更高，建议其他厂商在类似领域也采用这一路径 。
## 相关实体
- [Loongsuite Genai Semconv](ch04-376-loongsuite-genai-可观测语义规范.html)
- [Alibaba Agent Observability Audit Loongsuite Pilot Coding Agent Blackbox To Transparent](ch09-005-coding-agent-agent-loongsuite-pilot-3-agent.html)
- [Deeppotential Alibabacloud Agentrun Scientific Ai](ch04-358-深势科技携手阿里云agentrun.html)
- [从多智能体编排到Ai自主决策资损防控体系的架构演进](ch01-305-we-ve-been-here-before-decompilers-fuzzers-and-now-ai.html)
- [给氛围编程系上安全带阿里集团 Ai 代码评审实践与 Benchmark 开源](ch01-310-google-agentic-rag-sufficient-context-agent-framesqa-90.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地.md)

---
