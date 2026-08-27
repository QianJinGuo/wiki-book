# 数据研发 Multi-Agent 架构的 Harness 工程实践

## Ch04.572 数据研发 Multi-Agent 架构的 Harness 工程实践

> 📊 Level ⭐⭐ | 6.6KB | `entities/数据研发-multi-agent-harness-工程实践.md`

# 数据研发 Multi-Agent 架构的 Harness 工程实践

阿里云开发者（曹亚龙）分享的数据研发 Multi-Agent Harness 工程实践。核心命题：「能写大致正确的 SQL」和「能交付一张生产级数仓表」之间差着一整个工程体系——前者是模型能力问题，后者是 Harness 问题。Agent 能跑不代表能用，能用不代表可信；从能跑到能用再到可信，中间隔的不是模型能力的差距，而是工程能力的差距。问题的本质是 LLM 的 context 压缩机制天然不擅长保持长程约束——一条「金额字段统一用 DECIMAL(22,6)」的规约可能要跨越 30 轮对话、5 个研发阶段都不能漂移。既然 LLM 自己抗不住，就用一套确定性的工程框架托住：LLM 负责理解和创意，Harness 负责约束和验证。

AI 工程范式经历三代演进：第一代 Prompt Engineering（怎么把话说清楚）→ 第二代 Context Engineering（喂对信息）→ 第三代 Harness Engineering（让 Agent 可控制、可预测、可信任）。核心公式是 Agent = Model + Harness：模型决定上限，Harness 决定下限；模型能力有「天花板效应」，长时任务更具备「裸模型陷阱」和「累积误差」。

## Harness 架构：三大分层与六大支柱

按照 Multi-Agent 执行生命周期，Harness 工程拆为三层：身份层（执行前的静态身份与约束定义）、执行层（执行时的路径、上下文、门禁、状态追踪、故障恢复）、进化层（执行后的经验沉淀），递进逻辑是「身份定形 → 可靠执行 → 进化增强 → 身份增强」的螺旋上升。依据 MECE 原则拆出六大支柱，每类支柱对应一类不可接受的系统性故障：Identity（角色与能力边界不清）、Orchestration（流程缺乏弹性）、Context（上下文污染）、Gate（缺乏强制性质量验证）、Recovery（无断点恢复）、Evolution（错误没有工程化为经验）。可控制 = 能力边界 + 门禁检查；可预测 = 确定路径 + 确定输入；可信任 = 质量兜底 + 持续改善。

## 核心支柱实践

**Identity**：采用 Orchestrator+Specialist 架构——协调者 Agent 不写代码、不出方案，只负责调度、把关、评审、汇报，叠了调度员、澄清员、审查员、门禁员、汇报员、重试员 6 个显式角色；子专家 Agent 各自只暴露领域能力。行为约束用三层金字塔：超级红线（违反即严重事故，如 HITL 阶段切换必须用户确认、禁止编造数据）、错误记录（历史教训）、操作规则（知识库检索流程等），并有升级机制——规则被违背记为错误，反复出现升级为红线。

**Orchestration**：前置依赖自动完成（机器干机器的事，Agent 干 Agent 的事，人干人的事——埋点、依赖检查、钉钉提醒、版本更新自动执行）；链路模式与单点模式双入口（全链路/快案/快码三档自定义路径），每个 Agent 输入输出自包含才能被独立调用；有依赖串行、无依赖并行（3 张 ADS 表由 3 个代码专家并行出码快 3 倍）；修改分三级匹配流程重量（轻量改主 Agent 直接动手、中等改调子专家、重大改重走全流程）。

**Context**：流程阶段切分（phase 文件按路径加载）、CP 检查点摘要（每阶段结束强制压缩成固定格式摘要追加到状态机文件）、渐进式加载（SQL 开发专家拆核心层+详情层，涉及哪类规范才读哪个文件）、Spec 文件驱动（Agent 之间不直接对话，通过预定义 Schema 的结构化文件交换信息，协调者只传递文件路径——可追溯、可审计、可恢复、可解耦、可隔离，与 Unix「一切皆文件」哲学一脉相承）。

**Gate**：协调者 Agent 每阶段结束后回顾确保达成通过标准（MCP 前置可用性检查、产出后 review、阶段切换前用户确认、SQL 语法校验等）；强制检查项取消 AI「我觉得不需要检查」的权力；生成评估分离——子 Agent 负责干活交付，协调者拿着 checklist 逐项验收，自己不能既当运动员又当裁判。

**Recovery**：定义 12 个状态枚举值（REQUIREMENT_RECEIVED → COMPLETED），每任务维护状态追踪文件 + CP 检查点摘要 + 核心文件路径，任意时刻终止都能几秒回到断点；故障分级三条路——可重试（自愈）、需回退（退到上一稳定存档点）、必须中止（坦诚告知用户）；协调者挂「重试员」角色专职异常恢复。**Evolution**：每个专家 Agent 有「踩坑记录本」（递增编号|日期|一句话错误描述|正确做法四列），实时触发落库、启动时自动加载、反复出现的错误升级为超级红线——让错误成为系统进化的燃料。

## Harness 的未来发展路径

Harness Engineering 尚未形成体系化标准，未来可能有两条路径：成为 AI 时代的 DevOps（沉淀方法论+标准+工具链三位一体，出现 Harness Engineer 岗位、ADLC 标准框架），或成为过渡性概念（被更强的模型能力内化吸收，像 jQuery/Flash 一样沦为技术史脚注）。作者判断两条路径不矛盾——短期坚定积累工程能力，长期保持模块化让每个支柱都可独立移除。

## 相关实体

- [Harness 工程框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [数据 Agent 平台架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/data-agent-platform-architecture.md)
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- [阿里数据研发 Harness 工程](../ch05/096-harness-engineering.html)
- [上下文工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/数据研发multi-agent架构的harness工程实践.md)

---

