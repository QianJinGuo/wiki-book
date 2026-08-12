---
title: "天猫AI助手：调度框架重构与AI Coding工程化实践"
created: 2026-08-12
updated: 2026-08-12
type: raw
tags: [scheduler, reducer, event, state-management, ai-coding, skill, hook, observability, tmall, first-party]
source_url: "https://mp.weixin.qq.com/s/fhcbG2_IyDq-QuH_dBHT-g"
sha256: "b611d621439724825be7bb31385e97daef3438b588ba5570962dae53a7f557f8"
source_author: "天猫技术团队（淘天集团—天猫APP技术团队，作者依凡）"
ingested: 2026-08-12
vxc: 72
score_note: "v=8 c=9 (第一方深度工程实践+真实量化数据，同 tdsql-harness 减法工程档) — Reducer/Event 写收敛 + AI Coding 观测闭环两维度全库零覆盖 → NEW Entity"
---

# 天猫AI助手：调度框架重构与AI Coding工程化实践

> 淘天集团天猫APP技术团队（作者依凡）一手复盘：双轮驱动——调度框架从硬编码节点链重构为三层调度 + Reducer/Event 写收敛；AI Coding 从"个人用 Agent 写代码"升级为"组织化工程能力"。两周内完成，量化数据：单业务接入 3.5–4.5 人天 → ~0.7 人天。

## 核心量化结果

- **业务承载**：单一讲价流程 → 5+ ScheduleBizType / 5+ ProcessTemplate 共存，新增业务接入 < 1 天
- **状态写复杂度**：21 处散点 query+CAS+retry → 2 个 Reducer + 25 个 Event，单 process 终态写库 4 次 → 2 次
- **可观测性**：一份 assistShared.log → monitor/bizStat/error 三通道独立采样、独立降级
- **AI Coding 工程化**：4 份范式 + 13 个 Skill + 8 个 Hook + 月度观测报告闭环，单业务接入 3.5–4.5 人天 → ~0.7 人天

## 系统线：三层调度 + Reducer/Event 写收敛

### 非破坏性演进（关键决策）

不是推倒重来，而是三代并存：v1（历史，硬编码节点链仅讲价场景）→ pro（过渡期，抽象 ProcessNode/Executor/Builder/Syncer 按业务分包）→ framework（本次：DAG 层 + State 层 + Log 层 + Skill 体系）。新业务一律走 framework，老 v1 留作"考古证据"——不为架构干净强写老代码，老代码风险大收益低。

### 三层调度模型

Schedule 层（dispatch/cancel/终态聚合）→ DAG 层（初始化、后继推进、失败级联、取消广播）→ Process 层（ReAct 循环、Node 调度、Syncer 钩子）→ Node 层（原子动作，返回 NodeResult(CONTINUE/SUSPEND)）。每层有独立状态机：ScheduleBizStatus → ProcessBizStatus → ProcessNodeStatus，粒度由外到内递减。业务侧只关心 Node 层——原子动作，永远不需操心 schedule 终结/DAG 取消传播/状态入库。

### 写收敛（压舱石）

老问题：21 处散点写入，每处把三件本应分开的事糅在一起——前置条件校验（precondition）/ 字段变更（mutation）/ 并发冲突处理（retry）。业务每次写新组件重复实现模板，冲突场景复杂时 CAS retry 易踩坑。

新设计（借鉴 Redux，落到 Java+数据库）：`scheduleReducer.dispatch(scheduleId, newMaybeAdvanceToTerminalEvent(...))` — 业务侧只表达"我希望发生 X"，条件校验/数据库对账/CAS 重试全由 Reducer 内部处理。

收益非线性且 N 倍放大：单 process 终态写库 4→2 次，含 10 子任务的主任务终态聚合从 40 次写 → 20 次。

### 25 个 Event 不是过度设计

Event 数不是越少越好，而是"覆盖所有有意义的状态跃迁"。分四类：生命周期类（Initial/Terminal）、业务驱动类（NodeFinish/ProcessSuspend/ProcessResume）、DAG 协同类（DagAdvance/DagCancelBroadcast/ContextReconcile）、聚合类（MaybeAdvanceToTerminal/SummarizeAndAdvance）。写收敛本质 = 把"如何写"与"为什么写"分离——Reducer 管如何写（precondition/mutation/retry），Event 描述为什么写。这层分离后 schedule/process 两块状态再没出过 P0 问题。

### 四个关键技术取舍

1. **DAG 调度内置 framework，不用外部调度引擎**：业务节点深度依赖 inline ReAct（节点内多轮调 AI），外部引擎任务粒度太粗 + 额外中间件依赖；代价是自维护调度逻辑，收益是灵活可控链路短
2. **取消是同步闭环而非异步广播**：端侧 cancel 用户立即点必须秒回，复用 dispatch 锁做同步 CANCELLING→CANCELLED 闭环；代价是锁竞争，但节点都是短任务，竞争窗口可控
3. **日志三通道独立 logger 而非 MDC**：Async appender 下 MDC 跨线程传递不可靠且无法通道级降级；拆 3 个独立 logger + 8 个 SwitchCenter 开关（通道总开/eventType/bizType/采样率四维度）
4. **横切关注点用 Observer 而非装饰器嵌套**：Reducer 写入路径上的指标埋点/审计/灰度判断，装饰器嵌套层数爆炸；Observer 让 Spring 自动收集，新增观察者零侵入；代价是 Observer 抛异常需隔离不污染主流程

### 可观测性：从 grep 到 SLO

三通道日志规约：schedule_monitor.log（高频行为）、schedule_biz_stat.log（业务结果）、schedule_error.log（ERROR+堆栈，7 类）。字段白名单 + eventType 字典约束 → SLS 直接 group by，不再依赖 grep。关键指标：schedule 终态时延 P50/P95/P99（按 bizType）、reducer CAS 重试率/exhausted 计数、单 process 写库次数（迁移前后对比）、process.suspend 比例 + payload 类型分布。oncall 从"凭经验 grep"升级到"看大盘做决策"，是稳定性从 P0/P1 到 SLO 治理的前提。

## AI 线：AI Coding 工程化（L1→L5 水位）

### 五水位判断

大部分团队卡在 L1/L2（每个人在用 Agent，但团队没有沉淀：资深员工 prompt 不传新人、反模式踩过就忘）。本文目标：推到 L3（组织化工程能力），稳定后向 L4 过渡。

### 工程化飞轮

design/（设计文档，长期决策知识资产）→ paradigm/（研发范式：步骤清单+反模式列表+标准锚点路径，给人看的）→ .agent/skills/（范式编码成 agent Skill，13 个）→ agent 执行 → .agent/hooks/（8 个 Hook）→ logs/ → analyze-skill-usage（月度分析）→ docs/local/skill-usage-report.md（反馈）→ 调优回到 design/paradigm/skill。

### Hook 数据采集（telemetry 基础设施）

8 个 Hook 覆盖：SessionStart/UserPromptSubmit（记录所有 prompt）、PreToolUse/PostToolUse（记录 Skill 调用、工具调用）、Stop（session 结束、commit 快照）、PreCompact（上下文压缩）。落 .agent/logs/ 四类日志：skill-usage/prompts/commit-snapshot/edits。**Hook 这层是数据基础设施，没它就没有后面所有度量。**

### 月度观测 6 类报告

§0 数据来源（按 hostname 聚合）｜§1 使用频率（哪些 skill 真在用）｜§2 意图触发（哪些 prompt 没触发到 skill）｜§3 落地率（skill 启动后 6h 内是否产生 commit）｜§4 绕过率（commit 改了 skill 锚定路径但没启动 skill）｜§5 GAP（模型输出的 Edit/Write 是否落到 commit）。

### 落地数据（好的/不好的/灰色的摊开）

- **好的**：add-schedule-biz-type / add-process-template 是高频高落地率"健康 skill"；aiAddOn 接入 11 个骨架文件 5 分钟生成（人工抄至少半天），12 个反模式 checklist 提前拦住 3 个潜在问题；check-docs-sync 发版前发现设计文档 §6 锚点路径变更，避免文档漂移
- **不好的**：绕过率 8 条记录集中在 findDiscount/node/ 系列——description 不够"主动"（agent 没意识到触发）+ 小改（改常量加日志）开发者主观觉得没必要走 skill。策略是"宁可漏触发也不过度触发"（过度触发让开发者烦，长期降低主动使用率）
- **灰色的**：GAP 指标最近报告 10 个文件 agent Edit 过但 0 落 commit；commit 中 8 个文件 0 来自 agent。原因：agent 改对但开发者本地手工重写 / agent 改 90% 最后 10% 手写 / agent 完全错放弃。**模型输出 ≠ 实际落地，团队真正受益代码量要从 commit 角度反推**

### ROI 与边界

Fermi 估算（aiAddOn 接入 case）：年度节省 40–80 人天 vs 维护成本月度 1–2 人天，ROI 正；但数字代表上限非默认值（前提：范式被遵守、skill 被触发、报告被复盘）。与上游能力边界：上游（Anthropic/agent Code）给模型/tool use/prompt cache/Skill/Hook 原语/IDE 集成，不维护；团队维护业务范式/Skill 内容/Hook 业务规则/观测分析/组织约定。"上游给乐高零件，我们组装乐高城堡"——模型升级时范式+skill 是顺风车。

## 踩过的坑

1. **幽灵 CANCELLING（双兜底竞争）**：第一版写收敛留 DagTerminationChecker 兜底，上线后偶发"主任务永久卡 CANCELLING"——checker 和 reducer 某些时序互相覆盖 mutation，双兜底都觉得自己是终态聚合最终决策者。下线 checker 统一走 MaybeAdvanceToTerminalEvent + SummarizeAndAdvanceEvent，问题消失。教训：**收敛要彻底，不要"先收敛+再加兜底"——兜底存在会让收敛失效**
2. **Skill description 太宽 vs 太窄**：analyze-grayconfig 初版偏窄"仅在用户提到 GrayConfig 时触发"，PR 改配置触发不到；改宽又过度触发。定规：description 写"什么场景该触发"+"什么场景不该触发"两段，明确边界比堆关键词有效（沉淀成 skill-creator 内置约束）
3. **Hook 数据隐私**：Hook 记录所有 prompt，最早直接写文件没脱敏，可能记录 cookie/token。加脱敏规则 + 日志路径权限控制。教训：采集即责任，动 telemetry 第一天就得想数据治理
4. **范式过严反而降使用率**：第一版 add-schedule-biz-type 列 16 个反模式每条强校验，开发者觉得"用 skill 比手写还累"。改反模式分级：P0 必须拦截（如 Node 直推 GUI）/ P1 提醒不强拦 / P2 仅 review 建议。落地率回升。教训：范式是给人用的不是给人受罪的，"严"和"好用"冲突需持续微调

## 可复用方法论

- 系统重构：非破坏性演进 > 推倒重来；写收敛是高 ROI 重构方向（Reducer+Event 不需要新中间件）；分层不是越多越好而是"每层职责清晰可独立讲清楚"；可观测性投入要前置（重构同期做最划算）
- AI Coding：范式先于 Skill（先写"对人说什么"的 paradigm，再编码成"对模型说什么"的 skill）；Hook 越早越好（最便宜实现 = prompt + tool 调用 + commit 三类日志月度跑一次）；description 是 70% 的工作（边界声明非关键词堆叠）；观测报告敢摊开数据（月度复盘 90% 价值在"不健康"指标）；维护成本真实，Skill/Hook/报告需要 owner，没有 owner 飞轮必停
- 双轮驱动本质：重构把老员工隐性知识变成可执行范式；AI 工程化把范式编码成 Skill；Skill 加速业务接入验证范式；接入数据反向调优。只做重构 → 范式停留文档；只做 AI 工程化 → Skill 编码老代码写法沉淀反模式。两条线必须一起推

## 已知边界与下一步

- WAITING 子任务无超时机制（长链阻塞需主任务级 deadline 兜底，未补）
- summarize 失败重试无上限（准备加 retryCount 上限）
- completedProcessIds 集合规模上限（单主任务 >100 子任务需评估 JSON 体积）
- Skill 触发率和开发者主观感受耦合（需定期 1:1 收集主观反馈）
- 跨仓库 telemetry 聚合（当前 hook 数据落本地，跨组复制需平台化）
- 短期（3 个月）：稳住 L3、月度报告固化、补 WAITING 超时和 summarize 上限；中期（半年）：推 L4——落地率/绕过率 SLO 化反向自动调优 description、跨组复制 POC；长期：评估"自动 Skill 生成/自动 PR 评审"L5 能力
