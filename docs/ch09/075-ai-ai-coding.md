# 天猫AI助手调度框架重构与AI Coding工程化

## Ch09.075 天猫AI助手调度框架重构与AI Coding工程化

> 📊 Level ⭐⭐ | 10.2KB | `entities/tmall-ai-assistant-scheduler-refactor-ai-coding-engineering-2026.md`

# 天猫AI助手调度框架重构与AI Coding工程化

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tmall-ai-assistant-scheduler-refactor-ai-coding-engineering-2026-08-12.md)

## 摘要

淘天集团天猫APP技术团队两周内的双轮驱动改造复盘：**系统线**把 AI 助手调度框架从硬编码节点链重构为 Schedule/DAG/Process/Node 三层调度 + Reducer/Event 写收敛（21 处散点 CAS → 2 Reducer + 25 Event，单 process 终态写库 4→2 次）；**AI 线**把团队 AI Coding 从"个人用 Agent 写代码"升级为"组织化工程能力"（4 范式 + 13 Skill + 8 Hook + 月度观测报告闭环），单业务接入成本 3.5–4.5 人天 → ~0.7 人天。核心主张：**把隐性知识显式化为组织工程能力，是穿越模型代际更迭的核心壁垒**。

## 核心要点

- **写收敛（Reducer/Event）**：把散点写入中糅合的三件事——precondition 校验 / mutation 变更 / CAS retry——分离，业务只表达"我希望发生 X"，Reducer 统一处理条件校验、数据库对账、并发重试。本质是把"如何写"与"为什么写"分离。收益非线性：单 process 写库 4→2 次，在 N 子任务并发下 N 倍放大（10 子任务 40→20 次）
- **Event 数量原则**：不是越少越好，而是"覆盖所有有意义的状态跃迁"——生命周期/业务驱动/DAG 协同/聚合四类 25 Event，每个对应明确语义；硬合并会让业务侧在 Event 里塞 if-else 反向污染 Reducer
- **AI Coding 五水位**：L1/L2（人人用 Agent 无沉淀）→ L3（组织化工程能力：范式 + Skill + Hook + 观测闭环）→ L4（SLO 化反向调优）→ L5（自动 Skill 生成/自动 PR 评审）
- **工程化飞轮**：design/（设计文档）→ paradigm/（范式：步骤清单+反模式+锚点路径）→ .agent/skills/（13 Skill）→ Hook 采集（SessionStart/UserPromptSubmit/Pre/PostToolUse/Stop/PreCompact 8 个）→ analyze-skill-usage 月度 6 类报告（使用频率/意图触发/落地率/绕过率/GAP）→ 反馈调优
- **诚实度量**：落地率（skill 启动 6h 内是否 commit）、绕过率（改了锚定路径但没启动 skill）、GAP（Edit/Write 是否落到 commit）——"模型输出 ≠ 实际落地，团队真正受益的代码量要从 commit 反推"；绕过率 8 条集中在 findDiscount/node/ 系列，GAP 显示 10 文件 agent 改过但 0 落 commit
- **上游边界**：上游给"乐高零件"（模型/tool use/prompt cache/Skill/Hook 原语/IDE 集成，不维护）；团队组装"乐高城堡"（业务范式/Skill 内容/Hook 业务规则/观测分析/组织约定，必须自维护）——模型升级时范式+skill 是顺风车

## 深度分析

### 1. Reducer/Event 写收敛：状态管理的可迁移范式

老代码的问题不是"写得不好"，而是把三件本应分开的事糅在一起：前置条件校验、字段变更、并发冲突处理。业务侧每次写新组件都要重复实现 query→mutate→CAS→retry 模板且写法略有不同，并发冲突复杂时（多组件并发改同一行）CAS 失败 retry 策略易踩坑。

新设计借鉴 Redux 但落到 Java+数据库语境：业务只发 `dispatch(scheduleId, newMaybeAdvanceToTerminalEvent(...))` 表达意图，Reducer 内部统一处理条件校验/对账/重试。这一层分离让 schedule/process 两块状态从此没再出过 P0 级问题。

**关键教训（幽灵 CANCELLING）**：第一版留下 DagTerminationChecker 兜底，结果 checker 与 reducer 在特定时序互相覆盖 mutation，主任务偶发永久卡 CANCELLING——双兜底都觉得自己是终态聚合最终决策者。下线 checker 统一走 MaybeAdvanceToTerminalEvent 后问题消失。**收敛要彻底，不要"先收敛+再加兜底"——兜底的存在会让收敛失效**，因为业务侧总会绕到兜底路径。

### 2. 三层调度模型

Schedule（dispatch/cancel/终态聚合）→ DAG（初始化/后继推进/失败级联/取消广播）→ Process（ReAct 循环/Node 调度/Syncer 钩子）→ Node（原子动作返回 NodeResult(CONTINUE/SUSPEND)）。每层独立状态机（ScheduleBizStatus→ProcessBizStatus→ProcessNodeStatus），粒度由外到内递减。业务侧只关心 Node 层——上层框架统一处理终结/取消传播/状态入库。

四个关键技术取舍：①DAG 调度内置不用外部引擎（业务节点深度依赖 inline ReAct，外部引擎粒度太粗+中间件依赖）；②取消做同步闭环而非异步广播（端侧 cancel 必须秒回，复用 dispatch 锁，短任务竞争窗口可控）；③日志三通道独立 logger 而非 MDC（Async appender 下 MDC 跨线程不可靠且无法通道级降级）；④横切关注点用 Observer 而非装饰器嵌套（装饰器层数爆炸，Observer 让 Spring 自动收集、新增零侵入，代价是异常需隔离）。

### 3. AI Coding 工程化闭环：从个人到组织

与同库天猫胶水编程实体（业务出码 97.9% 采纳率）互补：本文是**组织化工程能力的完整闭环**——不是让 Agent 写得更好，而是让"AI Coding 的收益可度量、可复制、可传承"。

Hook 是 telemetry 基础设施：8 个 Hook 覆盖 SessionStart/UserPromptSubmit/PreToolUse/PostToolUse/Stop/PreCompact，落四类日志（skill-usage/prompts/commit-snapshot/edits）。**"没它就没有后面所有的度量"**——这是与同库 agentloop skill 质量基线、meituan-turing 评测方法论不同的切入点：不是测 Agent 输出质量，而是测团队工程化体系本身的使用与落地。

Skill description 被定义为"70% 的工作"：不是关键词堆叠，而是边界声明——"什么场景该触发 + 什么场景不该触发"两段式。第一版 analyze-grayconfig 太窄触发不到、改宽又过度触发，边界声明比堆关键词有效（沉淀成 skill-creator 内置约束）。

### 4. 诚实的落地数据与度量哲学

好的：aiAddOn 接入 11 骨架文件 5 分钟生成、12 反模式 checklist 拦 3 个潜在问题；check-docs-sync 发版前发现设计文档锚点路径变更。不好的：绕过率 8 条，策略"宁可漏触发也不过度触发"（过度触发让开发者烦，长期降低主动使用率）。灰色的：GAP 10 文件 agent Edit 过 0 落 commit、8 文件 commit 0 来自 agent——原因杂（agent 改对但本地重写/改 90% 剩 10% 手写/完全错放弃），数据噪声大但逼人正视"模型输出 ≠ 实际落地"。

ROI：Fermi 估算年度节省 40–80 人天 vs 维护月度 1–2 人天，但数字代表上限非默认值（前提：范式被遵守、skill 被触发、报告被复盘）。与 [tdsql-harness 减法工程](../ch05/077-harness.html) 的"L0-L3 归属 + 意图债"互补：那边回答"什么该留"，本文回答"留的东西怎么落地为组织能力并度量"。

## 相关实体

- → [高德 Harness/SDD 团队 AI 研发范式](../ch05/126-ai-coding.html)：同为团队级 AI Coding 组织化实践（高德走 harness 治理 + SDD/ATDD 流程；天猫走范式 + Skill + Hook 观测闭环），不同执行路径
- → [天猫 AI Coding 胶水编程](../ch05/126-ai-coding.html)：同团队同系列（业务出码采纳率 97.9%），本文是其工程化体系侧
- → [阿里云 AgentLoop 自进化飞轮](../ch04/362-agentloop.html)：同为"飞轮"式工程化体系（AgentLoop 是平台级 skill 治理飞轮，天猫是团队级范式+观测闭环）
- → [美团图灵评测方法论](../ch03/019-agent.html)：同为评测/度量方法（美团评 Agent 输出，天猫测体系落地）
- → [腾讯 tdsql-harness 减法工程](../ch05/077-harness.html)：同为第一方团队工程实践（腾讯答"什么该留"，天猫答"怎么落地为组织能力"）

---

