---
title: "工具型 Agent 的分层评测方法与机制验证 — AliExpress技术"
source_url: "https://mp.weixin.qq.com/s/XpfBMzzuWP4WcQDIzTbyhw"
ingested: "2026-09-04"
sha256: 771214a2f0ef7ec16a7915b7f27acbe1196ebe37f971fe1609fa24076f1aec9e
type: raw
---

# 工具型 Agent 的分层评测方法与机制验证

> 来源：AliExpress技术（布雷扬）。面向包含多步决策和工具调用的 Agent，把评测对象从 Final Answer 扩展到可观察执行轨迹，再走向失败归因。提出 Outcome/Decision/Action/Reliability 四层评测 + Case Contract + 证据采集 + Validator/Judge 分工 + Hard Gate 发布门禁 + 根因→修复对象映射，并用 3 个 Case、5 条 Run 做机制验证。

## 一、为什么 Agent 评测需要关注执行过程

Agent 的最终答案来自一条执行链：识别任务、选择 Skill、调用工具、处理工具结果、生成产物。最终文本只保留链路的一部分信息。要判断结果是否可信并把失败定位到具体环节，评测需要同时读取结果和过程证据。

一次运行可能同时出现：Agent 正常结束且 Runtime 返回 completed；最终文本结构完整语言流畅；工具调用成功但参数或数据口径有误；Agent 选对工具但环境没有执行权限；结果看似合理却没满足业务断言或输出契约。这些问题可能产生相似的最终答案，却对应完全不同的修复对象。只看最终文本可判断"回答像不像正确答案"，加入结构化断言、工具状态和环境错误后，才能判断"结果是否可信、失败发生在哪里"。

**Completed ≠ Correct ≠ Ready for Release**。Runtime 的 completed 只能说明系统认为执行结束，不能自动证明数据正确、业务口径正确、结果完整，更不证明满足发布条件。

## 二、从结果评分到过程归因

### 第一阶段：只检查最终结果

传统 LLM 评测把一次运行抽象成"输入—输出"，通过参考答案、规则或 LLM-as-a-Judge 判断最终回答是否正确。这种方式适合短问答，却压掉 Agent 调用外部工具时的重要证据：是否选对 Skill、是否调用必需工具、工具参数和调用顺序是否正确、外部环境是否返回权限错误、最终答案引用哪份中间结果。最终答案是整条执行链的压缩结果，只看它很难区分"模型不会""工具不可用""SQL 写错"和"输出格式不稳定"。

### 第二阶段：把执行轨迹纳入评测

TRAJECT-Bench 不再只报最终准确率，还检查工具选择、参数正确性以及调用依赖和顺序；EnConda-Bench 把环境配置任务拆成规划、错误诊断、反馈修复和最终执行，用过程指标说明 Agent 卡在哪一步。共同变化是：评测对象从 Final Answer 扩展为 Final Answer + Observable Trajectory。这里的 Trajectory 不等于模型私有思维链，真正适合保存和审计的是可观察证据——Skill 路由、工具名、参数摘要、状态码、产物引用和外部错误。

### 第三阶段：从"判错"走向"归因"

Agent-as-a-Judge 让评测 Agent 主动检查产物和过程证据；AgentRx 尝试从失败轨迹中定位关键失败步骤和根因；SWE-Together 把用户纠正次数也纳入多轮 Agent 效果判断。一个有用的评测结果不应只有"73 分"这一数字，而应至少回答：结果是否可交付？不可交付时失败发生在哪一层？证据是什么？应该修改模型、Skill、Tool、数据逻辑还是运行环境？

## 三、Agent 应该评什么：四层框架

把过程拆成可判断、可归因的层级，评测拆成 Outcome、Decision、Action、Reliability 四层，不是为了增加指标数量，而是为了对应不同问题类型和修复对象。

| 层级 | 回答的问题 | 典型检查 | 失败后优先修改 |
|------|-----------|---------|--------------|
| Outcome | 最终做成了吗？ | 结果、数值、格式、业务护栏 | 数据逻辑、产物生成 |
| Decision | 选对了吗？ | Skill、工具、执行路线 | 路由、指令、Skill 描述 |
| Action | 做对了吗？ | 参数、顺序、状态处理、副作用 | Tool Schema、执行器 |
| Reliability | 多跑几次还可靠吗？ | 成功率、P90、成本、人工纠正 | 模型配置、重试、预算 |

同一份 Case Contract 约束结果、决策和执行；多次运行再形成 Reliability。

**Outcome**（是否可以交付）不只检查"有没有答案"，还检查：输出是否满足 JSON Schema 或报告模板、必需字段是否存在、关键数值是否落在允许误差内、样本量统计口径和业务护栏是否满足、最终产物是否真实存在。关键数值超业务容差、报告缺必需字段都属于 Outcome 失败。

**Decision**（是否选对路线）：即使结果碰巧正确，Agent 也可能选高风险或不可复现的路线（如本应调用权威数据源却用模型记忆直接回答）。检查任务识别是否正确、选的 Skill 是否适配、必需工具是否进入计划、是否违反"必须查询/禁止写入"等约束。

**Action**（是否正确执行）：Decision 正确不代表执行正确。检查参数是否完整类型正确、调用顺序是否满足依赖、工具失败是否被当成成功、写库/通知/投放等副作用是否具备幂等保护、Agent 是否反复执行同一动作。

**Reliability**（是否稳定复现）：Agent 有随机性，单次通过不能证明稳定。应在多次真实运行上统计通过率和连续通过率、P50/P90 延迟、Token 与工具调用成本、用户纠正次数、超时限流和工具错误率。

## 四、分层评测如何实现

流程从运行前冻结 Case Contract 开始，经证据采集、确定性校验与语义判断，形成发布结论和根因定位。

**运行前定义 Case Contract**：评测标准应在 Agent 运行前确定。一个 Eval Case 至少写清：case_id、脱敏任务输入 input、required_skills、required_tools、output_contract、assertions（含 field/expected/tolerance）、risk 等级。最关键的并非 JSON 写法，而是四类约束须在运行前确定：输入、必需能力、结果断言和风险等级。

**采集可观察证据**：一次 Run 可保留最终输出、所选 Skill、Tool Call 与参数摘要、工具状态和错误码、中间/最终产物引用、模型与版本、时延/Token/成本。这组证据足以定位大量工程失败，无需读取或保存模型私有思维链。

**确定性规则优先**：按顺序执行——确定性 Validator（Schema、字段、数值、必需工具、参数范围、状态码）→ Agent/LLM Judge（解释完整性、证据是否支持结论、开放式业务判断）→ 人工复核（高风险发布、Judge 分歧、新型失败、抽样校准）。能由程序精确判断的事实不应交给概率裁判；Judge 处理规则难覆盖的语义维度，且必须看到证据而不是只看最终答案。

**Hard Gate 独立判断发布条件**：关键数值错误、权限越界、输出 Contract 失败和高风险副作用，不能因为"文案很好"而被平均成一个及格总分。发布条件：所有 Hard Gate 通过，且 Outcome、Decision、Action 均达最低阈值，才允许发布。数值字段用相对误差 = |实际值−参考值| / max(|参考值|, ε)，若该字段是 Hard Gate 且误差超容差，直接 BLOCK。

**将失败映射到修复对象**：

| 根因（可观察证据） | 优先修复对象 |
|------------------|------------|
| 数据或指标逻辑（查询成功但关键数值断言失败） | SQL、数据路由、统计口径 |
| Skill 或策略（选错 Skill / 违反任务约束） | 路由、系统指令、Skill 描述 |
| Tool 参数或顺序（漏调用、参数错、依赖序错） | Tool Schema、计划、执行器 |
| 输出契约（内容可读但 Schema/字段不满足） | 接口 Contract、确定性序列化 |
| 环境或权限（必需工具不存在 / permission denied） | Runtime、白名单、部署配置 |
| 模型语义（证据完整但解释归纳仍错） | 模型、Prompt、上下文 |

评测不再只"判卷"，还把问题送到正确的修改层。

## 五、三类问题的机制验证

用 3 个 Case、5 条 Run 验证：**数值与口径错误**（工具成功但关键值实际 100/参考 250，相对误差 60% 超 1% 容差 → Outcome 失败，修复数据逻辑而非模型）；**输出契约错误**（程序调用要求 JSON 但 Agent 返回 Markdown，人可读但下游无法解析 → Schema Validator 失败，修复 Contract/确定性序列化而非堆 Prompt）；**环境与权限错误**（Skill 路由正确、发起调用但返回 web-search unavailable / permission_denied → 归因 environment_or_permission，修复工具安装/白名单/部署环境）。

验证结果：5 条 Run 的 Runtime 都是 completed，但业务结果、工具执行和发布条件各不相同，只有两条修复后记录满足发布条件。评分器对三个已知问题按预期工作，但不能证明未知失败上的准确率；Decision 在这组示例无区分度，Reliability 尚未被实验覆盖。

## 六、从机制验证走向真实评测

**历史回填**：先冻结 Validator，再对一批历史真实产物回填运行并与人工核验结论比较，报告 True/False Positive/Negative 命中数、误报、漏报，回答门禁在真实分布上是否有用。

**重复运行**：对同一 Case 至少运行 3 次统计连续通过率与 P90，加入相似 Skill 的路由任务检查 Decision 能否区分错路由，保留模型/Skill/Tool/环境版本避免把环境变化误判为模型波动。这是尚待补的实证。

## 七、工程实施参考

**最小评测闭环**五环节：从业务 Golden、历史失败、人工纠正、风险清单沉淀 Case → 版本化 Case Contract 固定输入/预期/断言/风险 → Trace Adapter 将不同 Agent 输出与轨迹转统一证据 → Validator/Judge/Hard Gate 分层判定 → 输出含发布结论/证据/根因/修复对象的 Scorecard，修复结果回归到同一 Case。

**记录完整版上下文**：Case（case_id/版本/输入摘要/风险等级）、Agent 配置（模型/Prompt/Skill/Tool 版本）、运行环境（权限/依赖/数据快照/时间窗口）、Evaluator（Validator/Judge/Gate 版本）、Run（轨迹/产物/时延/成本/最终状态）。

**常见运行模式**：Offline Replay（回放历史产物验证规则覆盖率）、PR Regression（检查变更回归差异与阻断项）、Scheduled Evaluation（定期重复运行看通过率/P90/成本趋势）、Online Shadow（真实流量旁路观察新型失败）、Release Gate（对稳定高风险规则执行发布控制）。

**渐进式发布门禁**：Shadow（只记录命中、统计误报漏报）→ Warning（向研发展示证据和根因、允许人工确认后发布）→ Blocking（只把稳定可解释高风险的规则升级为 Hard Gate）→ 持续维护（规则/Golden/容差版本化、例外放行记录原因）。

**不同 Agent 评测重点**：数据分析 Agent（数值/口径/样本量/结果引用）、检索与研究 Agent（必需来源/证据覆盖/引用一致性）、工具执行 Agent（参数/顺序/状态处理/幂等）、多 Skill Agent（路由准确率/相似 Skill 混淆）、高风险写操作 Agent（权限/审批/审计/副作用 Hard Gate）。

## 八、结论

从评测对象、判定机制、工程闭环三层给出方法：一次 Run 作为基本分析单元，Completed/Correct/Ready for Release 分别判定；确定性校验与语义判断分工，Hard Gate 独立于综合得分防止关键错误被高分抵消；可执行 Scorecard 至少含发布结论、失败层级、证据引用、根因和修复对象，形成 Case → Run → Evaluation → Fix → Regression 持续闭环。验证边界：本文完成 3 Case/5 Run 机制验证，未覆盖未知失败识别准确率，未完成 Decision 与 Reliability 真实效果验证。

参考资料：TRAJECT-Bench（He et al. 2025）、Process-Level Trajectory Evaluation for Environment Configuration（Kuang et al. 2025）、Agent-as-a-Judge（Zhuge et al. 2024）、AgentRx（Barke et al. 2026）、SWE-Together（Wu et al. 2026）、Judging LLM-as-a-Judge with MT-Bench（Zheng et al. 2023）、DeepEval 等。