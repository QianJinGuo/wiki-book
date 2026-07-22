---
title: "cursor harness model production floor"
source: wechat
source_url: https://mp.weixin.qq.com/s/jHW0mBxbCC7czYy1fHrr4A
ingested: 2026-05-10
sha256: 5897c3130efaaebb5d98e8fc907da0113aacbcc3bab219415a2f9cc2feb6b46d
feed_name: 独家
wechat_mp_fakeid: MP_WXS_3006407565
source_published: 2026-05-03
review_value: 8
review_confidence: 7
review_recommendation: strong
review_stars: 4
tags:
  - cursor
  - agent-harness
  - model-harness-co-evolution
  - agent-evaluation
  - context-management
  - tool-reliability
  - multi-agent
  - sre
type: raw
created: 2026-05-10
updated: 2026-05-10
---

## 核心洞察
### 模型决定能力上限，Harness 决定生产下限
模型决定系统能理解多复杂的任务，能不能在陌生问题里做像样的推理。
但"生产下限"讲的是另一件事：上下文不完整、工具超时、日志很脏、用户需求含糊、模型中途切换、缓存突然失效时，系统还能不能把任务稳稳带下去。
### 把 Harness 当线上系统看
Harness 不是传统 API 服务，但它面对的问题和后端一样：团队要知道它什么时候慢、为什么慢、影响谁、能不能回滚。
Cursor 把这种手感做成了可重复的工程动作：发布习惯 = 说清假设 → 跑离线评测 → 看线上反馈和错误切片 → 决定回滚/调优/清旧补丁。
目标三角：**更快、更聪明、更省 token**。这三件事天然在打架。Harness 的日常工作，就是在这个三角里找平衡。
### 上下文少塞一点，现场多取一点
2024 年末 Cursor 做编程 Agent 时靠大量静态上下文兜底（lint回灌、改写读取请求、限制调用次数、塞目录结构）。现在更多转向动态上下文——大块信息不必提前塞进窗口，可以在模型需要时通过引用拉取 MCP 工具、活跃终端、历史对话等外部信息。
**关键转变**：上下文不是越多越好，而是越会取越好。窗口只承载当前推理，不负责保存全部历史。
模型变强以后，Harness 不只要会加护栏，也要会拆护栏。每年主力模型升级后要做一次 dead weight 清理。
### 评估不能只停在跑分
Cursor 的三层评估体系：
  1. **离线评测**：CursorBench 基于真实 Cursor 会话，覆盖正确性、代码质量、效率、交互行为
  2. **线上 A/B**：延迟、token 效率、工具调用次数、缓存命中率
  3. **代理指标**：
     * **Keep Rate**：Agent 生成的代码改动，过一段固定时间后还有多少留在用户代码库里
     * **后续反应判读**：用模型读取用户下一句话，从语义上判断是否满意
迁移思路：客服 Agent 看"回答后用户是否继续追问同一问题"；写作 Agent 看"生成段落最终保留比例"；数据分析 Agent 看"生成 SQL 有没有被执行"。
### 工具报错会把上下文弄脏
工具调用失败的影响往往不止当下那一轮——失败信息会留在上下文里，消耗 token，也可能污染后续判断。
Cursor 的 SRE 风格错误分类（按每个工具、每个模型分别计算基线）：
  * `InvalidArguments`：模型传参错
  * `UnexpectedEnvironment`：上下文环境假设和真实环境矛盾
  * `ProviderError`：工具提供方异常
  * `UserAborted`：用户主动中止
  * `Timeout`：超时
  * 未知错误：默认按 Harness 的 bug 处理，任何工具的未知错误率超过阈值就告警
**关键判断**：Agent 的错误不是均匀分布的。某个模型更容易把 patch 格式写错；另一个更容易过度调用搜索；某个工具在大仓库里更容易超时。只看总量，很容易被平均数骗过去。
### 换模型不只是改一个 model id
Harness 抽象可以模型无关，但每个模型都需要深度定制：
  * OpenAI 模型训练时更习惯基于 patch 的方式编辑文件；Anthropic 模型更习惯字符串替换
  * OpenAI 偏字面理解、强指令遵循；Claude 对模糊指令更宽容
  * 新模型进来要反复迭代，直到"模型-Harness 组合"可发布
发布单元不是单独的模型，是**模型-Harness 组合**。
中途切模型的挑战：
  1. 新模型要接手旧模型生成的对话历史（工具调用形态、提示风格、上下文分布可能不匹配）
  2. 缓存是提供商和模型特定的，中途切模型会让缓存未命中
建议：没有明确理由，复杂会话最好保持在同一个模型里。另一种绕过的办法是用 Subagent 从 fresh context 开新任务。
### 多智能体的难点在调度和隔离
AI 辅助软件工程会走向多智能体，但重点在后半句：系统要知道调度哪个 Agent、怎么按它的优势描述任务、怎么把结果整合回一个连贯工作流。
Claude Code Subagents 边界：
  * **适合隔离**：高输出任务（测试、日志、文档查找）、并行研究独立模块、需要专门工具权限/模型/Prompt 的子任务
  * **不适合**：需要频繁来回讨论、多阶段共享大量上下文、很小的目标修改
### 补一套朴素的运行纪律
1. 先分任务类型，晚一点再分角色
2. 每类任务都要看结果有没有留下（Keep Rate 思维）
3. 离线回归和线上反馈一起看
4. 工具错误要分类，别只记一句失败
5. 把上下文预算摆到台面上
6. 模型适配要有版本（Prompt 版本、工具 schema 版本、上下文策略、错误基线）
7. 中途切模型按状态迁移处理
8. Subagent 描述要像路由规则（负责什么/什么时候调用/不负责什么）
9. 模型升级后顺手清旧补丁
10. 失败要沉淀进 Harness（每次 Agent 犯错都反向沉淀成一条 Harness 设计）
---
## 相关文章
  * [[entities/agent-harness-context-management-working-set]] — 上下文≠聊天记录而是工作集 + 四框架对比 + compaction光谱 + 九字自查表
  * [[raw/articles/claude-code-harness-deep-understanding]] — Agent Harness 核心循环/上下文组装/并发调度/权限管理/压缩策略
  * [[raw/articles/agent-principle-architecture-engineering-practice]] — Harness 比模型关键/Context Rot 分层防化/ACI 工具原则
  * [[raw/articles/sub-agent-vs-agent-team-selection-guide]] — Sub-Agent VS Agent Team 选择指南