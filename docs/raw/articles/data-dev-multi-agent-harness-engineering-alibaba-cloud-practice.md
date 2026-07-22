---
source_url: https://mp.weixin.qq.com/s/9ikvuGaAJSPyGYidbAdC7g
ingested: 2026-07-15
sha256: 9011fe1a5295e801cc3b21ae6ed6f17e9d7a6e186e492c616069cffa8485ac42
source_published: 2026-07-15
title: "数据研发Multi-Agent架构的Harness工程实践"
author: 曹亚龙
feed_name: 阿里云开发者
---

[图片:图片]阿里妹导读文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。

一、为什么需要Harness

一个让人尴尬的常见场景

不知道你有没有过这种体验：花了两周搭了一个数据研发Agentdemo，给老板演示的时候那叫一个丝滑，用户提个需求，Agent自己分析、写代码、跑测试，五分钟搞定。老板看完一拍大腿说"上！下个月就让团队用起来！"。

然后你信心满满地把这个东西交给团队，第一天就出事了。同事甲说："我让它做个简单需求，结果它跳过了关键确认步骤直接写代码，写出来的东西完全跑偏。"同事乙说："它把上一个需求的字段名带到这个需求里来了。"同事丙更绝："我让它修一个小bug，它把整个表重新设计了一遍。"还有同事追着说各种问题："产出表PK不唯一、表命名不符合规范、线上代码注释和参数被清空了、线上代码改出了bug、产出代码语法不通过"等。

你一查日志，发现Agent确实"理解"了需求，"完成"了任务，代码看起来"很美"，每一步看起来都"合理"，但合在一起就是不对。最要命的是，下次同样的场景，它可能又是另一种错法，你连复现都复现不了。

这种感受，我相信做过Agent的人都不陌生。

[图片:图片]

真正的核心问题

所以问题到底在哪？我们慢慢琢磨明白一件事：Agent能跑，不代表能用；能用，不代表可信。

"能跑"是说在理想路径上，输入A能给出输出B，demo阶段都能做到。"能用"是说面对各种乱七八糟的真实输入，Agent不会跑偏、不会偷懒。"可信"是说出了问题不会崩、你能查、能改、能避免下次再犯，团队敢把它放在关键流程里。

从能跑到能用，再到可信，中间隔的不是模型能力的差距，而是工程能力的差距。这就是数仓场景里AI提效最难的地方。「能写出大致正确的SQL」和「能交付一张生产级数仓表」之间，差着一整个工程体系。前者是模型能力问题，后者是Harness问题。

这个问题的本质，是LLM的context压缩机制天然不擅长保持长程约束。一条「金额字段统一用DECIMAL(22,6)」的规约，可能要在30轮对话之后还能被严格遵守；一个「ds分区必须按yyyyMMdd字符串」的约定，可能要跨越5个阶段都不能漂移。既然LLM自己抗不住，那就只能把「抗」这件事从模型里挪出来：用一套确定性的工程框架托住。

二、AI工程范式演进

第一代：Prompt Engineering——把话说清楚
解决的核心问题：怎么让模型理解我想要什么。
但有个天然的天花板：一旦任务复杂、需要多步、需要外部信息，光靠prompt就不够了。

第二代：Context Engineering——喂对信息
RAG、向量检索、工具调用、MCP协议。解决的核心问题：怎么让模型在做决策时，看到该看的、不被无关信息干扰。
但问题是：Agent依然会在某些路径上犯低级错误。同一个需求跑十次，可能有八次都对，剩下两次错得离谱。

第三代：Harness Engineering——让Agent可控制、可预测、可信任
核心公式：Agent = Model + Harness
Model决定上限，Harness决定下限。
Anthropic在实测中发现即使顶尖模型Opus系列在跨上下文任务中仍会出现看到部分进展就宣告完成不验证的情况。

三、Harness架构设计

核心三大分层：
1. 身份层（Identity）—— Agent执行前的静态身份与约束定义
2. 执行层（Orchestration, Context, Gate, Recovery）—— Agent执行时动态决策
3. 进化层（Evolution）—— Agent执行后的经验沉淀与进化

递进逻辑：身份定形 → 可靠执行 → 进化增强 → 身份增强（螺旋上升）

核心六大支柱：
- Identity：角色定义与约束体系
- Orchestration：流程编排与智能调度
- Context：上下文工程
- Gate：门禁检查与质量评估
- Recovery：状态追踪与故障恢复
- Evolution：经验沉淀与进化学习

四、Harness核心支柱详解

支柱一：Identity——角色定义与约束体系
采用Orchestrator+Specialist的Multi-Agent架构。协调者Agent：不写代码、不出方案，只负责调度、把关、评审、汇报。四个专家Agent各自只暴露自己领域的能力。
行为约束三层金字塔：
- 顶层：超级红线（数量少，违规就是事故）
- 中间层：错误记录（历史教训总结）
- 最底层：操作规则（流程、模板等）

支柱二：Orchestration——流程编排与智能调度
多执行路径分支（链路模式 vs 单点模式），多专家并行调度（无依赖并行，有依赖串行），修改流程自适应（轻量/中等/重大改三级匹配）。

支柱三：Context——上下文工程
流程阶段切分（只有跑到那一步，才读那一步），阶段内容摘要（CP检查点强制压缩），渐进式加载，Spec文件驱动（Agent之间靠文件不靠对话历史）。

支柱四：Gate——门禁检查与质量评估
强制检查项（取消AI"我觉得不需要检查"的权力），Generator+Evaluator分离。

支柱五：Recovery——状态追踪与故障恢复
12个明确的状态枚举值，故障分级（可重试/需回退/必须中止）。

支柱六：Evolution——经验沉淀与进化学习
执行流程违规记录（四列格式：编号/日期/一句话错误描述/正确做法），自学习三级驱动（实时记录→自动加载→行为约束迭代）。

五、Harness未来发展路径

路径1：成为AI时代的DevOps标准规范（持续积累的工程学科）
路径2：成为过渡性概念（模型变强后吸收消解）
作者判断：两条路径不矛盾——短期走路径1，长期准备路径2。

[1] Anthropic. "2026AgenticCodingTrendsReport." https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf
[2] Microsoft. "SemanticKernel:Multi-agentOrchestration." https://devblogs.microsoft.com/agent-framework/semantic-kernel-multi-agent-orchestration/
[3] BeamAI/FredrikFalk. "MultiAgentOrchestrationPatternsforProduction." https://beam.ai/agentic-insights/multi-agent-orchestration-patterns-production
[4] OpenAI(RyanLopopolo). "HarnessEngineering:LeveragingCodexinanAgent-First World." https://openai.com/index/harness-engineering/
[5] LangChain. "StateofAgentEngineering." https://www.langchain.com/state-of-agent-engineering
[6] Harness.io. "Q12026ProductUpdate:HarnessPipeline." https://www.harness.io/blog/q1-2026-product-update-harness-pipeline
[7] Codebridge. "MasteringMulti-AgentOrchestration." https://www.codebridge.tech/articles/mastering-multi-agent-orchestration-coordination-is-the-new-scale-frontier
[8] LangChain(HarrisonChase). "TheAgentDevelopmentLifecycle." https://www.langchain.com/blog/the-agent-development-lifecycle
[9] MartinFowler/BirgittaBöckeler(Thoughtworks). "HarnessEngineeringforCoding AgentUsers." https://martinfowler.com/articles/harness-engineering.html
[10] DongLiang. "Prompt,Context,Harness:TheThreePhasesofAIEngineering." https://www.dliangthinks.me/technology/harness/
[11] LangChain. "DeepAgentsOverview." https://docs.langchain.com/oss/python/deepagents/overview
[12] LangChain(SydneyRunkle,VivekTrivedy). "TheRuntimeBehindProductionDeep Agents." https://www.langchain.com/blog/runtime-behind-production-deep-agents
[13] LangChain(VictorMoreira). "AgentEvaluationReadinessChecklist." https://www.langchain.com/blog/agent-evaluation-readiness-checklist
[14] GTCode. "HarnessEngineering:FromAgentPromptstoEngineeringControlSystems." https://gtcode.com/articles/harness-engineering/
[15] LangChain(VivekTrivedy). "BetterHarness:ARecipeforHarnessHill-Climbingwith Evals." https://www.langchain.com/blog/better-harness-a-recipe-for-harness-hill-climbing-with-evals
