# AI Agent 落地：如何攻克稳定性、成本与评估难题？ — Trace即Evals

## Ch04.384 AI Agent 落地：如何攻克稳定性、成本与评估难题？ — Trace即Evals

> 📊 Level ⭐⭐ | 7.6KB | `entities/ai-agent-trace-evals-stability-cost-evaluation-zhangyanfei.md`

# AI Agent 落地：如何攻克稳定性、成本与评估难题？ — Trace即Evals

## 摘要

张雁飞在 Databend Meetup 2026 北京站的演讲，提出"Trace 即 Evals"的核心主张 — AI Agent 的稳定性、成本归因和效果评估，必须建立在完整执行轨迹之上。文章用 Claude Code、Evot、Pi 等 Agent 对比案例，梳理了从 Prompt Engineering、Context Engineering 到 Harness Engineering 的演进。

## 核心要点

1. AI Agent 落地的三大难题：稳定性（相同输入不同输出）、成本归因（无法追踪 Token 去向）、效果评估（缺乏可复现的基准）
2. "Trace 即 Evals" — Agent 的每次执行都应产生完整执行轨迹，轨迹本身就是评估数据
3. Prompt Engineering → Context Engineering → Harness Engineering 的演进路径
4. 用 Claude Code、Evot、Pi 等案例对比论证了 Trace 在稳定性保障和成本归因中的核心地位

## 深度分析

### "Trace 即 Evals"的方法论基础

张雁飞提出的"Trace 即 Evals"，本质上是对 Agent 可观测性与评估体系的重构。传统评估思路是"先执行、后评估"——Agent 跑完任务后，用独立的 Eval 数据集判断结果好坏。但 Agent 是一个不确定性系统：大模型有幻觉，同样任务、同样输入、不同时间执行，结果可能完全不同。这意味着"只看最终结果"的评估方式无法定位问题根因——你不知道是 Prompt 出了问题、Tool 选择错了、还是上下文被裁剪掉了关键信息。

"Trace 即 Evals"的突破在于：将评估内建于执行过程本身。每次 Agent 执行产生的完整轨迹——包括每一步的 System Prompt、工具描述、Tool Call 序列、执行结果、Token 消耗、时间开销——本身就是最真实的评估数据。评估不再是"事后对照检查"，而是"对执行过程的全面审计"。这种范式转变使得从"结果对错判断"升级为"过程质量分析"成为可能。

### Agent Engineering 的三阶段演进与 Harness 下沉趋势

演讲梳理的"Prompt Engineering → Context Engineering → Harness Engineering"三阶段演进，勾勒了 AI Agent 工程化的清晰脉络。第一阶段（2023-2024）优化的是单次模型调用的输入文本；第二阶段（2024-2025）管理的是多轮交互中的信息流（RAG、记忆、窗口调度）；第三阶段（2025-至今）要解决的是 Agent 的自主任务执行和多 Agent 协作。

Harness Engineering 的核心主张是：Agent 的可靠性不会只来自更大的模型，也不会只来自更复杂的 Prompt，而是来自精心设计的"脚手架"——约束 Agent 行为的方式、可观测的 Trace 系统、以及基于 Trace 的持续改进循环。演讲中 Claude Code vs Evot vs Pi 的对比实验极具说服力：当 Claude Code 调用自己的 Opus 模型时，30 步/3 分钟完成；调用 DeepSeek V4 Pro 时，60 步/15 分钟完成。不是模型差，而是 Harness 与模型的匹配度差——Harness 能力正在"下沉"到模型里，模型通过学习 Harness 中的工具偏好来提升执行效率。

### Agent Trace 的技术挑战与存储架构创新

Agent Trace 与传统 Trace 有本质区别。传统 Trace（如 OpenTelemetry）记录的是服务调用链，一次请求秒级到分钟级，Schema 稳定，分析重点是 Latency、Status、Error。而 Agent Trace 的特点是：长跨度（任务持续几十分钟到几小时）、大 JSON（单条 Trace 从 500KB 到 500MB）、脏数据（大模型返回的结果经常不是合法 JSON）。一个 Agent Swarm 单次任务可能产生 500MB 数据、10 万+ Span。

Databend 对此的应对方案具有很强的工程参考价值：基于对象存储 + VARIANT 类型 + 加速列 + 全文检索 + Stream/Task 构建极简 Trace 底座。核心思路是"先把数据沉下来"——原始 Trace 长期保留，不要只看最终 Pass/Fail。然后利用数据库的 JSON 加速列、全文索引和增量聚合能力，在同一份数据上构建 Eval、Replay、RL 等多种上层能力。这种"一份数据服务多种场景"的架构思路，比各场景独立建存储的方案更简洁、更经济。

### 路径依赖与分叉点的诊断价值

演讲中的一个关键洞察是：Agent 的差异性来自路径依赖。一次工具调用选择、一次上下文裁剪、一次错误恢复，都会改变后续所有步骤。实验中 Claude Code 第 4 步选择 Edit（精准修改）vs 选择 Bash（输出过多）——前者流畅完成，后者绕了 17 步、耗费更多 Token 和时间。

这个发现对 Agent 工程有深远影响。它意味着 Agent 的优化不能只看"最终成功与否"，而应该关注"每一步的选择质量"。通过在关键分叉点埋入诊断逻辑，系统可以自动识别"模型在第几步开始走偏"、"哪一类工具选择更容易导致绕路"。这些分叉点数据不仅是调试工具，更是模型训练的核心燃料——它们揭示了模型在当前 Harness 中的行为弱点，为针对性强化学习提供了精准的目标信号。

## 实践启示

1. **将 Trace 系统作为 Agent 基础设施的第一优先级。** 演讲证明，没有完整 Trace 的 Agent 系统无法进行有效的稳定性保障和成本归因。任何面向生产的 Agent 产品，都应该在开发初期就建立 Trace 存储和查询能力。Trace 基础设施的投资回报率极高——它同时服务于调试、评估、训练三个环节。

2. **注意 Harness 与模型的匹配度。** Claude Code 的对比实验表明，同一个 Agent 框架在不同模型上的表现差异巨大（3 分钟 vs 15 分钟）。如果你的 Agent 产品依赖第三方模型，务必对模型与 Harness 的配合度做充分的 Benchmark，不要假设"强大的模型=好用的 Agent"。

3. **工具名称、大小写和描述的一致性会显著影响效果。** 演讲中明确指出工具名称的大小写偏差会在大模型中产生"下一个 Token 预测偏差"，并在多步 Agent 执行中被放大。这意味着 Agent 工程团队需要像管理 API 契约一样管理工具接口的精确性。

4. **不要只存最终结果，原始 Trace 是长期资产。** Databend 的经验表明，原始 Trace 数据——包括每个步骤的 System Prompt、Message、Tool Call 和 Tool Result——应该长期保留。这些数据不仅是调试的凭证，也是后续模型训练（RL from Trace Data）和效果回归测试的基础素材。

5. **Agent Trace 存储需要有 JSON 原生处理能力。** 传统的关系型数据库或简单的日志系统无法高效处理 Agent Trace 的脏 JSON、大嵌套和长跨度特性。选择支持 JSON Path 索引、全文检索、低成本对象存储的数据库（如 Databend）是构建 Agent Trace 底座的关键决策。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-agent-trace-evals-stability-cost-evaluation-zhangyanfei.md)

---

