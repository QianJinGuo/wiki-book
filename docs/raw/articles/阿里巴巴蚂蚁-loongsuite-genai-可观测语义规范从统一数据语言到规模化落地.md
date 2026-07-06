---

title: 阿里巴巴&蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地
source: wechat
source_url: https://mp.weixin.qq.com/s/X6lh1LuOJgbkJQ8t0Zky1g
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-16
sha256: 997bdaa67ca2002ca4c11db23cf44bd58db95942f4515b406a6502c0a1fff048
sha256: 95a9ca7c3d317632e0b1731d2e436bc28a4404a0a87f971bac139967b4273169

---
# 阿里巴巴&蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地
#  背景
随着 AI，尤其是 Generative AI（后文简称 GenAI）的快速发展，AI Agent 系统中涌现出大量新的核心概念，例如 Model、Prompt、Token、Tool Calling、Agent、Memory、Session 等。这些概念已成为算法工程师、运维人员和可观测平台用户最关心的观测对象。它们需要像传统系统中的 HTTP 请求、数据库调用一样，被标准化地采集、展示和消费，以便系统维护者清晰了解调用过程、高效排查问题。
基于此，OpenTelemetry（后文简称 OTel）早在 2024 年初就开始推动 Gen AI 语义规范建设，希望为这些新对象建立统一的数据采集规范——Semantic Conventions（后文简称 SemConv），以解决相关领域可观测数据采集标准缺失、口径不统一等问题。
** SemConv 定位与价值  **
Java、Go 和 Python 等各语言的  自动插桩（Auto Instrumentation）  或 SDK 等可观测采集工具，在许多对 OTel 刚接触的人眼里，可能会认为它们是 OTel 社区的核心价值所在。
然而，深入了解社区后会发现，相比于 SemConv，这些采集能力更多扮演的是“术”的角色，服务于 OTel 真正的“道”——通过 SemConv 建立统一的可观测数据语言。  OTel SemConv 是一套汇聚全球几十家头部可观测厂商、数百名领域专家共同设计并持续演进的可观测数据采集标准。  过去几年，在多次 KubeCon 会议上与社区核心 Maintainer 和 Co-founder 交流后，我们了解到，在他们眼中，SemConv 是 OTel 的灵魂，推动其逐步完善并走向 Stable 是社区最重要的工作。
一个统一的可观测 SemConv 可以实现如下效果：
统一数据语言，解决口径不一致
以 GenAI 语义为例，其应用场景天然跨模型、跨框架、跨平台。没有统一语义规范时，不同团队往往会各自记录“模型名”、“输入长度”、“Token 数”、“响应内容”等信息，字段命名和统计口径无法对齐。OTel GenAI SemConv 的核心价值在于为这些通用概念提供标准化字段，例如  gen_ai.system  、  gen_ai.request.model  、  gen_ai.usage.input_tokens  ` ` 等。
一旦这些关键字段被标准化，不同业务、不同基础设施、不同观测后端就能共享同一套分析方法，真正做到“同一类问题用同一套数据解释”。这也是语义规范最基础、最重要的价值。
支撑性能、成本、质量与安全的统一治理
可观测建设的目标不仅仅是排障，还包括性能、效率、安全与输出行为的持续治理。比如在 GenAI SemConv 场景中，统一的 SemConv 在把模型参数、响应元数据、Token 用量等关键信息标准化后，团队才能更容易追踪性能、成本和安全相关问题。
对大型企业来说，这意味着可以在  统一标准上解决如下几个实际诉求：
* 技术排查：  通过 Trace ID 查看跨 Agent 完整链路，分钟级定位各类问题，如：某业务模型调用时延异常。
* 经营分析：  效果数据跨业务可比，直接用于产品决策，极大提升 BI、产品、数科等角色做跨业务分析时的效率。
* 评测：  真实用户轨迹持续积累，自动构建评测数据集，特别是多 Agent 协同场景的端到端评测。
* 合规：  统一的审计链路，满足安全备案刚性要求。
如果没有统一语义，这些问题就只能停留在单系统内局部分析，无法形成集团级治理能力。
降低接入成本，推动基础设施复用
OTel 的设计目标之一，是通过标准协议、语义规范、SDK、自动插桩和 Collector 等组件，让遥测数据可以复用同一条采集与治理链路。在 GenAI 场景中，统一语义规范的价值也在这里体现得尤其明显：一旦字段、Span 结构、事件模型和上下文传递方式定义清楚，无侵入埋点、SDK 封装、平台分析、看板和告警策略都能复用。
这意味着业务不需要每次都从“我要采什么字段”开始思考，而可以直接站在已有规范之上接入能力，降低整体建设成本。
_** LoongSuite  GenAI SemConv 介绍  ** _
** 背景  **
作为当前可观测业界的事实标准，OTel 虽早在 2024 年初就开始了 GenAI 语义规范的讨论和设计，但由于早期的人力投入有限，再加上社区标准更强调广泛适用与长期稳定，更新节奏整体较慢。相比之下，阿里巴巴集团内部有大量的大模型应用落地场景，遇到了大量真实场景中的案例问题，因此有将相关问题抽象成为统一标准的诉求。
2025 年：阿里云、阿里控股与蚂蚁集团的可观测团队联合启动，在 OTel GenAI 语义基础上对内部场景中 OTel 尚未覆盖的内容进行语义建模，并基于此推进内部可观测采集工具的实现与落地。
2026 年：与 OTel 社区 GenAI 主要 Maintainer 沟通后，考虑到相关内容较多且迭代较快，在社区 Maintainer 的建议下，先将成果开源至阿里巴巴 LoongSuite 可观测品牌下，作为 OTel GenAI SemConv 的厂商增强标准，后续择机逐步贡献至 OTel 上游。
** 内容与落地  **
目前，该规范已在集团内多个核心场景完成落地，形成了从 Agent 层到基建层的全栈可观测能力。例如以下是部分相关  Loongsuite GenAI SemConv  ** [  ** ** 1]  ** 相比于  OTel GenAI SemConv  ** [  ** ** 2]  ** 的增强内容：
###  新增 Entry/Step Span
####  问题背景
我们在 AI Agent 的实践过程中发现，当 Agent 执行长程任务时，其执行逻辑会变得越来越复杂。它会包含多轮工具调用和模型调用，导致单个 Trace 中包含成百上千个 Span。这些 Span 在同一链路中展示时显得非常冗长，导致调用链轨迹难以清晰观测。为了解决这个问题，我们引入了以下两个关键设计：
1\. Entry Span：  在 Agent 调用的入口处创建 Span，用于还原模型和用户的原始输入、输出，形成对话历史。这样可以确保在执行下游任务时，处理的数据不受 System Prompt 或框架 Prompt 的干扰，能够获取最原始的客户请求。
2\. Step Span：  Step 代表 Agent 在每次 ReAct 过程中的层次化表达。在每次 ReAct 过程中，Agent 都需要完成“反思 → 工具调用 → 模型调用”的循环。在排查问题时，通常采用 Top-down 的方式来定位 Agent 的执行情况。具体流程是：首先观察整体情况，例如当 Agent 执行包含 10 轮 ReAct 过程时，先定位是哪一轮出现问题，然后再深入分析该轮中具体是哪一步出错。通过这种逐轮的 Span 结构，可以清晰展示 Agent 的多轮行动、反思以及对应的执行结果，使每轮循环的轨迹一目了然。
####  语义建模
新增的 Entry 和 Step Span 类型定义如下：
####  实现效果
目前该语义规范已经在多个 Agent 场景中落地，包括 OpenClaw，QwenPaw，Hermes Agent，以下是在 OpenClaw 场景下实现语义规范，接入后的效果：
###  新增 Skill 语义
####  问题背景
在电商购物助手等 Agent 场景中，用户的每条指令由 AI Agent 理解意图后，路由到对应的  Skill（技能）  完成执行。Skill 是业务功能的最小可复用单元，内部编排了一组 LLM 调用和工具调用，用于完成特定任务，例如搜索商品、加购物车、申请退款等。
现有 OTel GenAI 语义约定已覆盖 Agent、LLM、Tool 等 Span 类型，但缺少对 Skill 这一业务功能聚合层的抽象。Skill 既不是单一的 Tool 调用，也不是完整的 Agent，而是介于两者之间的编排单元。缺少 Skill 维度的可观测性，意味着当性能抖动时，我们只能看到一堆  execute_tool  和  inference  Span，缺少 Skill 可观测性导致三个核心痛点：
* 无法归因到功能域  ：  性能抖动时只能看到一堆  execute_tool  和  inference  Span，无法快速判断是哪个功能域出了问题。
* 无法统计 Skill 健康指标  ：  缺少 Skill 粒度的 P99 延迟、成功率、调用频率等度量。
* 多 Skill 并发时链路混淆  ：  不同 Skill 的 LLM/Tool Span 在 Trace 树中无法区分归属。
####  语义建模
为了实现对 Skill 信息的采集，我们在 LoongSuite GenAI SemConv 中新增了一组  gen_ai.skill.*  属性，用于标识 Skill 的身份与版本信息：
当前阶段，这些属性附着在已有的  execute_tool  Span 上，无需引入新 Span 类型即可快速落地。
同时，基于集团业务，我们落地了独立  invoke_skill  Span 的方案，并向 OTel 社区提交了提案  （  https://github.com/open-telemetry/semantic-conventions-genai/issues/86  ）  ，以覆盖 Skill 从加载到执行完成的完整生命周期，支撑按功能域的端到端分析。
####  实现效果
通过 Skill 语义属性，可观测平台可以按功能域聚合分析：快速定位“哪个 Skill 错误率最高”、对比“新版本 Skill 上线后延迟是否劣化”、度量“LLM 调用占 Skill 总耗时的比例”等。
此外，同一套  gen_ai.skill  语义约定也可覆盖各类框架，如 OpenClaw、Langchain、Spring AI 等，以下是 OpenClaw 场景下的埋点效果：
###  新增 Token 级推理观测
####  问题背景
2025 年上半年，蚂蚁可观测团队围绕蚂蚁推理云服务建设了全链路可观测体系，覆盖推理云服务核心组件，构建了从客户端到引擎端的多语言、多协议分布式追踪 Trace 能力。其中，蚂蚁与阿里云团队协作，向社区三大推理引擎 vLLM、SGLang、TensorRT-LLM 贡献了基础的引擎可观测 Trace，形成了蚂蚁和阿里集团层面事实上的可观测 Trace 标准。整个可观测体系是蚂蚁推理云服务重要的稳定性底盘。
然而，随着业务蓬勃发展，推理云服务承压加剧，推理引擎相关的疑难问题大量涌现，请求级别的引擎 Trace 已无法有效定位更深层次的问题。我们深入研究推理引擎底层原理，结合生产实际案例，整理了如下问题：
1\. 性能异常  ：  单个请求响应慢往往是因为某些 Token 生成慢，而 Token 生成慢大概率是其他请求并发干扰导致的。
2\. 精度异常  ：  出现复读、答非所问、乱码等精度问题，往往从某个 Token 开始异常，后续 Token 受此影响持续出错。
因此，问题本质出在 Token 生成过程中。由此自然推演出，  推理请求问题定位定界必须以 Token 级别可观测数据作为支撑  。
因此，2025 年下半年，蚂蚁可观测团队率先构建了业界首个覆盖多推理引擎、支持 Token 级深度 Trace 的可观测产品，把可观测性从宏观请求下沉到了微观 Token 维度。它不仅关注单个请求是否成功，更深入观察：
1\. 每个 Token 的生成耗时及子阶段过程；
2\. 慢 Token 生成时，同一推理实例内多请求并发的相互影响；
3\. 每个 Token 生成背后的 Top-K 候选分布，帮助精度问题定位。
这一工作的核心价值在于：首次将推理引擎内部许多原本“黑盒”的过程拆解到 Token 粒度，打造了一个可透视、可解释、可归因的白盒系统。
####  语义建模
推理引擎工作原理简介：  推理引擎本质上是一个无限循环执行迭代（Iteration）的系统。每个迭代根据资源情况和调度策略选取一批请求组成 Batch，作为当前迭代的执行目标进行批量处理。迭代完成后，被选中的每个请求通常会生成一个 Token。接着进入下一个迭代，同样经历选取请求组成批->批量执行的过程。如此循环下去。
Token 性能数据采集：  在每个请求的每个 Token 粒度，我们采集进入迭代和退出迭代的时间戳。通过这两个时间戳可以推演出每个 Token 的调度时间、实际执行时间以及用户感知的总耗时。此外，每个 Token 对应的请求都在一个 Batch 中，Batch 的总请求数（特别是总 Token 数）刻画了批处理的负载，该负载进一步决定了 Token 生成的耗时。因此，我们定义了以下刻画 Token 粒度性能数据的相关属性：
Token 精度数据采集：  在每个请求的每个 Token 粒度，我们采集每个 Token 对应的候选 Top-K Token 的概率分布。通过该分布可以判断模型输出质量：质量差的模型其 Top 候选 Token 越不符合预期。如果模型输出符合预期，但选中的 Token 不在 Top-K 中，则问题指向用户指定的采样参数（如温度等）。所以我们定义了下面候选 Token 概率相关的属性：
####  实现效果
基于上述设计的 GenAI 规范，我们在三大引擎上进行采集并输出标准数据；依托这份标准数据，向用户展现出一致的功能界面。最终我们打造了引擎显微镜产品，提供引擎并发与 Token 级别的推理引擎深度观测能力。
* 引擎 Token 分析：  切换到  高倍镜  ，对准单个请求，观察其内部 Token 生成的每一个步骤耗时，以及 top 候选 Token 概率分布，精准定位延迟根源与精度异常问题。
* 引擎并发剖析：  使用  广角镜头  ，清晰呈现引擎所有请求的并发、竞争和协作关系，快速识别资源冲突与瓶颈。
引擎 Token 分析的 Token 粒度性能数据可以揭示有哪些慢 Token？引擎并发分析进一步解答这些 Token 为什么慢？另外 Token 粒度的概率分布数据可以揭示异常 Token 的大模型输出是否有正常还是采样参数设置不合理。产品上线后，历经年底大促，在稳定性战场成功帮助引擎/SRE/业务同学定位多起稳定性  问题，10 倍提速  问题定界效率，真正做到了又快又准，并且进一步给出了优化建议。下面选择了一些比较典型的案例来阐述产品功能与业务价值。
#####  案例 1：慢 Token 定位，快速识别跨请求的资源干扰
线上经常会碰到某个特定请求破线了，比如指征 Token 输出速度的 TPOT（Token 平均输出时间）破线，对用户来说会感受到输出的卡顿。下面这个案例讲述了这个场景下，Token 分析与引擎并发剖析如何帮助定界定位。
当我们拿到异常请求 TraceId 之后，我们打开如下图所示的 Token 分析页面，可以看到第 125 个 Token 花了 6.8 秒，远超预期，最终导致 TPOT 高达 54.77ms。
点击 Token 分析右上角的“引擎并发分析”，我们跳转到对应引擎实例并发剖析页面。根据时间或者 TraceId 搜索定位到异常请求。这个请求就是下图中的请求 2。我们看到请求 1 生成首 Token（prefill 阶段）-亮绿色块花了 6s+，中断了请求 2 去 decode 生成第 125 个 Token 黄色块，跟 Token 分析吻合。总结下根因是其他租户的请求 prefill 中断了当前请求的 decode 过程，那么可能的一个解决方案是去做 PD 分离，避免不同请求的 prefill 和 decode 相互影响。
#####  案例 2：Token 级观测，精准定位答非所问的根因
下面这个案例属于典型的“答非所问”案例，比如用户问的是医疗问题，但大模型回复了 LeetCode 解题答案。
打开如下图异常 Trace 的 Token 分析页面，我们一眼能看到首 Token 是“begin_of_sentence”。这个 Token 是一个特殊的 Token，简称 BOS，它被用来分割毫无关联的两个语料。也就是说，一旦出现了 BOS，那么接下来的回答就跟之前的 prompt 毫无关联，自然而然就答非所问了。所以很明显，在任何情况下，回答里面都不应该出现 BOS，那么问题定界到为何会出现这个 BOS。对于这个案例，无论在用户的回复里面，或者是引擎日志/网关日志里面，都不会显示 “begin_of_sentence”，而只会显示成空串，所以没有 Token 分析，定位过程会变得复杂。后续我们进一步挖掘发现产出 BOS 属于大模型的 badcase，解决方案是调整模型或者等后续模型版本优化更新。
#
_** 使用 GenAI Utils  ** _
_** 快速实现 LoongSuite GenAI SemConv  ** _
** 背景  **
在前文中，我们详细介绍了 LoongSuite GenAI SemConv 在 Agent、Skill、Token Level Inference 等多个维度的语义建模。然而，对于实现 LoongSuite GenAI SemConv 的各类插桩库（Instrumentation）开发者而言，他们面临一个共同的工程挑战：
每个 GenAI 框架插桩库都需要实现一套完整的遥测采集逻辑——创建 Span、挂载语义属性、记录 Metrics、发送 Events、管理 Context 传递——而这些逻辑在不同框架插桩间高度重复。更关键的是，当语义规范迭代升级时（例如新增字段、调整 Span 结构），若每个插桩库各自维护一套实现，升级成本将成倍增长。
以一个 Agent 框架插桩为例，如果不使用公共工具层，开发者需要手动完成：创建 invoke_agent Span 并设置 SpanKind、逐一挂载 gen_ai.agent.name、gen_ai.agent.id、gen_ai.usage.input_tokens 等数十个属性、根据配置决定是否采集消息内容、处理异常并设置 Error 状态、记录 Duration 和 Token Usage Metrics——这些样板代码在每个插桩库中都大同小异。
为了解决这一问题，我们在探针中实现了 GenAI Utils，它作为 LoongSuite GenAI SemConv 的工程化能力层，将语义规范的复杂性封装成简洁的 API，让插桩库开发者只需关注“从框架中提取什么数据”，无需关心“如何按规范输出遥测数据”。以下是一些我们支持的 GenAI Utils 实现：
1\. LoongSuite Python 对应实现  LoongSuite-utils-genai  ** [  ** ** 3]  ** 。
2\. LoongSuite JS 对应实现  LoongSuite-utils-genai  ** [  ** ** 4]  ** 。
** 架构设计  **
GenAI Utils 的整体架构遵循“分层解耦、统一收口”的设计原则：
核心设计理念：
插桩层只做数据提取：各框架插桩库通过 Hook/Monkey-Patch 拦截框架调用，将数据填充到对应的 Invocation 数据对象中，不直接操作 OTel API。
GenAI Utils 统一收口遥测输出：所有 Span 创建、属性挂载、Metrics 记录、Event 发送、Context 管理均由 ExtendedTelemetryHandler 内部完成。
规范升级只改一处：当 LoongSuite GenAI SemConv 新增字段或调整结构时，只需修改 GenAI Utils 中的 Span Utils 和 Metrics 模块，所有下游插桩库自动生效。
** API 使用  **
GenAI Utils 为 LoongSuite GenAI SemConv 覆盖的每种 GenAI 操作都提供了对应的 Invocation 数据类和 Context Manager 方法，形成了统一的“填数据 + 交给 Handler”编程模型。接下来，以 Python 语言 GenAI Utils 工具库为例，介绍如何使用：
###  第一步：获取 Handler 单例
    from opentelemetry.util.genai.extended_handler import get_extended_telemetry_handlerhandler = get_extended_telemetry_handler(    tracer_provider=tracer_provider,    logger_provider=logger_provider,)
ExtendedTelemetryHandler 继承自 OTel 上游的 TelemetryHandler（负责基础 LLM 操作），并在此基础上扩展了 Agent、Tool、Embedding、Retrieve、Rerank、Memory 等 LoongSuite 新增的操作类型，同时还集成了多模态异步处理能力。这种继承设计确保了与上游社区代码同步时不产生冲突。
###  第二步：选择对应的 Invocation 数据类，填充业务数据
GenAI Utils 为每种操作定义了对应的 Invocation 数据类，插桩库开发者只需将从框架中提取的数据填充其中：
###  第三步：使用 Context Manager 完成遥测输出
以典型的 Agent 框架插桩为例，展示如何使用 GenAI Utils 快速实现完整的可观测采集：
    from opentelemetry.util.genai.extended_handler import get_extended_telemetry_handlerfrom opentelemetry.util.genai.extended_types import (    InvokeAgentInvocation, ExecuteToolInvocation)from opentelemetry.util.genai.types import InputMessage, OutputMessage, Texthandler = get_extended_telemetry_handler()# ========== Agent 调用 ==========with handler.invoke_agent() as invocation:    invocation.provider = "dashscope"    invocation.request_model = "qwen-max"    invocation.agent_name = "ShoppingAssistant"    invocation.agent_id = "agent-001"    invocation.input_messages = [        InputMessage(role="user", parts=[Text(content="帮我推荐一款笔记本电脑")])    ]    # ... 实际调用 Agent 框架 ...    invocation.output_messages = [        OutputMessage(            role="assistant",            parts=[Text(content="我来帮您搜索，请稍等...")],            finish_reason="tool_calls"        )    ]    invocation.input_tokens = 42    invocation.output_tokens = 18# ========== 工具执行 ==========with handler.execute_tool() as invocation:    invocation.tool_name = "search_products"    invocation.tool_call_arguments = {"query": "笔记本电脑", "category": "electronics"}    # ... 实际执行工具 ...    invocation.tool_call_result = {"products": [{"name": "MacBook Pro", "price": 12999}]}
在上面这段代码中，开发者没有直接操作任何 OTel API——不需要手动创建 Span、设置 SpanKind、挂载 gen_ai.agent.name 属性、记录 Duration Metrics——这些全部由 ExtendedTelemetryHandler 在 Context Manager 的 __enter__ 和 __exit__ 中自动完成。若在调用过程中抛出异常，Handler 会自动捕获并在 Span 上设置 error.type 属性和错误状态。详细使用过程可以参考  文档  ** [  ** ** 5]  ** 。
###  当前已支持的插桩
基于 GenAI Utils，LoongSuite Python Agent 已实现以下 GenAI 框架和模型服务的插桩，覆盖国内外主流 GenAI 生态：
这些插桩库的核心遥测逻辑全部复用 GenAI Utils 实现，当 LoongSuite GenAI SemConv 新增语义或调整规范时，只需要升级 opentelemetry-util-genai 包，所有下游插桩库即可统一生效。
_** 结语：从统一字段走向统一基础设施  ** _
GenAI 时代的可观测建设，已经从“为模型调用加日志埋点”演进到“为 Prompt、推理、检索、工具和 Agent 全链路建立统一语义”。OTel 已经为此提供了标准化方向，并通过语义规范与插桩库推动 GenAI 观测能力的形成。
阿里巴巴与蚂蚁集团共建 GenAI 可观测语义规范的意义，正在于把这种标准化方向进一步工程化、平台化、规模化：一方面用统一语义降低业务接入成本，另一方面用统一数据驱动观测平台、分析服务和治理能力的复用。最终目标并不是“产出一份规范文档”，而是让所有使用该套规范的厂商和用户能够为快速增长的 GenAI 应用真正做到可看见、可分析、可治理、可演进。
相关链接：
[1]  Loongsuite GenAI SemConv
https://github.com/alibaba/loongsuite-semantic-conventions-genai
[2]  OTel GenAI SemConv
https://github.com/open-telemetry/semantic-conventions-genai
[3]  LoongSuite-utils-genai
https://pypi.org/project/loongsuite-util-genai/
[4]  LoongSuite-utils-genai
https://www.npmjs.com/package/@loongsuite/opentelemetry-util-genai
[5] 文档
https://github.com/alibaba/loongsuite-python-agent/blob/main/util/opentelemetry-util-genai/README-loongsuite.rst
欢迎留言一起参与讨论~