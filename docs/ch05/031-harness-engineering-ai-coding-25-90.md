# Harness Engineering 实战：AI Coding 率从 25% 提升至 90%

## Ch05.031 Harness Engineering 实战：AI Coding 率从 25% 提升至 90%

> 📊 Level ⭐⭐ | 15.9KB | `entities/harness-engineering-90-percent-ai-coding-rate.md`

## 核心结论
在企业级 Java 应用（10 万+行代码，技术栈：Java 1.8 / Spring Boot / LiteFlow / HSF / Diamond / Tair）中，通过构建完整 Harness 体系，AI 代码率从 **24.86% 提升至 90.54%**，个人维度从 14.24% 跃升至 87.85%。构建耗时约一周。
> **高 AI 代码率本身不是目标，在质量可控前提下的高 AI 代码率才有意义。** 这 90% 的 AI 代码经过完整的需求分析、编码评审、单元测试和 CI 验证流程，每一行都通过了 Harness 体系的质量门禁。

## 背景：为什么需要 Harness Engineering
### AI Coding 的现状与挑战
- Anthropic《2026 Agentic Coding Trends Report》：开发者约 60% 时间使用 AI 辅助，但能"完全委托"给 Agent 的任务仅 0-20%
- **核心矛盾**：模型原始能力足够强，但从"能力"到"可信赖的工程产出"之间存在系统性鸿沟

### 企业级 Java 项目的特殊性
企业级 Java 应用通常具备：代码量十万行以上、涉及 RPC 框架（HSF/Dubbo/gRPC）、流程编排引擎（LiteFlow/Temporal）、配置中心（Diamond/Apollo/Nacos）、分布式缓存（Tair/Redis）、数据库中间件等。关键问题：

- **隐性知识**：价格字段必须用 `long` 类型（单位为分）、某配置项有 85 处引用、某链路是高频变更区——这些知识从未被系统化记录
- **质量瓶颈**：Agent 产出速度远超人工审查速度，质量瓶颈从"写代码"转移到"看代码"
- **熵的累积**：Agent 会模仿代码库中 Suboptimal Pattern，单次无害，累积导致代码库腐化（Code Rot）

### Agent 的四种典型失败模式（Anthropic）
| 失败模式 | 描述 | 根因 |
|---------|------|------|
| One-shot Syndrome | 试图在单个上下文窗口内完成全部工作 | 上下文窗口填充率超过 40% 后质量快速衰退 |
| Premature Victory Declaration | 完成部分工作就宣布任务结束 | 无法准确评估自身产出质量 |
| Premature Feature Completion | 以为功能已实现但未做端到端验证 | 缺乏外部化验证机制 |
| Cold Start Problem | 多次会话间缺乏持久化记忆 | 真正用于编码的 Token Budget 被挤压 |
> Anthropic 核心发现：**"Agents are incapable of accurately evaluating their own work"** —— Agent 无法准确评估自身产出质量，因此外部化的约束和反馈不是可选增强，而是 Agent 可靠运行的必要条件。

## 三次范式跃迁
| 阶段 | 核心问题 | 隐喻 | 关注点 |
|------|---------|------|--------|
| Prompt Engineering（2022-2024） | 怎么说 | 写好一封邮件 | Few-shot / Chain-of-Thought / 角色设定 |
| Context Engineering（2025） | 给什么 | 给邮件附上正确的附件 | RAG / 动态上下文窗口 / 信息选择 |
| Harness Engineering（2026） | 别跑偏 | 设计 Agent 的缰绳 | 约束/纠偏/验收/反馈/持续改进 |
> Mitchell Hashimoto（HashiCorp 创始人）定义：每发现一个 Agent 犯的错误，就花时间工程化地消除它再次发生的可能性。

## 四根支柱（OpenAI + Anthropic 经验总结）
### 支柱一：上下文架构（Context Architecture）
- Agent 应当恰好获得当前任务所需的上下文——不多不少
- OpenAI 经验：将 AGENTS.md 控制在 ~100 行，作为 **Index & Map**，指向更深层的 Design Docs
- 原则：上下文分层加载、按需获取

### 支柱二：Agent 专业化（Agent Specialization）
- 拥有受限工具集的**专业 Agent**优于拥有全部权限的通用 Agent
- Anthropic 明确分离三种角色：**Planner**（规划）、**Generator**（实现）、**Evaluator**（验证）
- 核心发现：**"将做事的 Agent 和评判的 Agent 分开，是一个强有力的杠杆"**

### 支柱三：持久化记忆（Persistent Memory）
- 进度持久化在文件系统上，而非上下文窗口中
- Anthropic 标准化启动序列：检查当前工作目录 → 读取 Git Log 和 `progress.md` → 定位优先级最高的未完成任务

### 支柱四：结构化执行（Structured Execution）
- 永远不让 Agent 在未经审查和批准书面计划之前写代码
- 理想执行流：理解 → 规划 → 执行 → 验证，每个阶段之间有明确的质量门禁
- 原则：**"Waiting is expensive, fixing is cheap"** —— 宁可让 Agent 多跑一轮验证

## 子页面
- [四根支柱与四要素架构](ch05/092-harness-engineering.md) — 四根支柱详解、四要素架构、关键经验、效果对比

## 参考资料
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic: 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [OpenAI: Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)

## 相关页面
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 六层结构与核心方程
- [Cursor Harness 复盘](../ch01/332-cursor-harness-model-production-floor.md) — 模型决定上限，Harness 决定生产下限
- [字节跳动 TRAE Harness Engineering 指南](../ch01/646-trae-harness-engineering.md) — R.E.S.T 框架/PPAF 循环/上下文 Token 流水线

## 相关实体

- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch05/092-harness-engineering.md)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/092-harness-engineering.md)
- [Harness Engineering实践，做了一个平台让AI一晚上自动评测和优化你的系统](ch05/092-harness-engineering.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/009-harness.md)
- [AI 领域专家学习路径](https://github.com/QianJinGuo/wiki/blob/main/queries/ai-expert-learning-path.md)
- [Agent 可靠性的工程解法：从 Skillify 看持续改进机制](../ch04/262-skill.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)
## 深度分析
### 从「能力」到「可信赖产出」的系统性鸿沟
文章揭示了 AI Coding 领域一个核心矛盾：模型原始能力已足够强，但从「能力」到「可信赖的工程产出」之间横亘着系统性鸿沟。企业级 Java 场景的特殊性加剧了这一鸿沟——隐性知识散落（价格字段用 `long` 分而非 `double`、某配置 85 处引用、高频变更链路），这些从未被系统化记录，Agent 的知识边界等于代码库的文件边界。
裸用 Agent 时质量瓶颈从「写代码」转移到「看代码」——Agent 产出速度远超人工审查速度，且生成代码「语法正确、风格统一，但业务语义存在微妙错误」。Anthropic 进一步指出根因缺陷：**Agent 无法准确评估自身产出质量**，因此外部化的约束和反馈不是可选增强，而是必要条件。

### 四种典型失败模式的系统性根因
Anthropic 总结的四种失败模式揭示了 Agent 可靠运行的系统性需求：
| 失败模式 | 表征 | 根因 |
|---------|------|------|
| One-shot Syndrome | 单窗口内试图完成全部工作 | 上下文窗口填充率超过 40% 后质量快速衰退 |
| Premature Victory Declaration | 完成部分就宣布任务结束 | 无法准确评估自身产出质量 |
| Premature Feature Completion | 以为功能已实现但未端到端验证 | 缺乏外部化验证机制 |
| Cold Start Problem | 多次会话间缺乏持久化记忆 | Token Budget 被重新理解项目挤压 |
这四种失败模式的共同根源是：**Agent 缺乏外部的结构化约束和反馈机制**。

### 三次范式跃迁的核心驱动力
AI 工程实践经历三次演化：Prompt Engineering（怎么说，2022-2024）→ Context Engineering（给什么，2025）→ Harness Engineering（别跑偏，2026）。第三次的本质跃迁在于：不再只关注单次对话或单次上下文窗口，而是设计跨越多个会话、多个 Agent 角色、多个执行阶段的完整系统架构。Mitchell Hashimoto 的操作性定义精准捕捉了这一范式：**每发现一个 Agent 犯的错误，就花时间工程化地消除它再次发生的可能性**——这不是一次性优化，而是持续演进的系统工程闭环。

### 十阶段 Pipeline 与四要素架构的协同机制
文章实战部分最核心的设计是 **10-Stage Pipeline**（需求分析→需求评审→编码实现→编码评审→单元测试编写→单元测试评审→代码推送→CI 验证→部署验证→用户确认）与 **四要素架构**（Rules/Skills/Wiki/Changes）的协同：

- **Rules** 定义「标准是什么」——不随需求变化的 Invariant Constraints（如价格字段必须用 `long` 类型）
- **Skills** 定义「应该怎么做」——可复用的标准化 SOP（如 `coding-skill` 含 8 份分层编码 Spec）
- **Wiki** 定义「系统是什么样的」——Agent 理解业务上下文的素材
- **Changes** 定义「做了什么」——完整的 Audit Trail
四要素以 `.harness/` 目录为物理载体，由 **Application Owner Agent**（约 420 行，承担 Index & Map 职责）作为编排中枢串联一切。

### 质量门禁的可程序化验证原则
OpenAI 百万行代码实践的核心经验：**「If it can't be mechanically enforced, the agent will drift」**。文章实践验证了这一原则——将「检查 CI 是否通过」改为三个可程序化验证条件（`status == SUCCESS && total_tests > 0 && passed == total`）后问题彻底消除。「一切不可被机器验证的约束，在 Agent 执行中都是无效约束」。

### 高 AI 代码率的前提约束
90.54% 的 AI 代码率背后有一个关键前提声明：**「高 AI 代码率本身不是目标，在质量可控前提下的高 AI 代码率才有意义」**。这 90% 的 AI 代码经过完整的需求分析、编码评审、单元测试和 CI 验证流程，每一行都通过了 Harness 体系的质量门禁。

## 实践启示
### 1. 先 Dry Run，再上真实需求
Harness 本身需要 Dry Run——用虚拟需求完整走一遍全流程，发现四个关键缺陷：CI 门禁只检查状态码忽略测试用例数为 0、评审报告在简单需求下不生成文件、摘要文件因 Agent「追加」倾向出现重复行、部署参数被 Agent 错误推测。这些问题如果在真实需求中才暴露，每一个都可能导致严重返工。

### 2. 分离执行与评判是关键杠杆
Anthropic 的核心发现「将做事的 Agent 和评判的 Agent 分开，是一个强有力的杠杆」在实战中得到验证：评审 Agent 发现了编码 Agent 遗漏的渠道判断逻辑（潜在线上故障），还检测到 Agent 试图跳过评审阶段并强制回退。评审 Agent 不需要「更聪明」，只需要用不同的检查视角审视产出物——本质上是将传统 Code Review 自动化，将质量发现前移到 Human Review 之前。

### 3. 流程一致性优先于流程效率
在仅涉及 2 个文件、6 行代码的小需求中，依然走完完整 10 阶段流程，1 轮评审即通过。这验证了：**好的流程不应该给简单任务增加显著负担**——当需求足够简单时每个阶段执行时间自然缩短，但流程一致性保证了不会因为「这次改动很小」就跳过关键环节。企业级系统中「小改动大事故」案例不胜枚举，保持流程一致性是一种廉价的保险。

### 4. 上下文分层加载，按需获取
上下文管理是体系地基。按加载时机分为三层：L1 会话常驻层（Agent 定义文件 + 三份 Rules 文件，严格控制总量避免窗口填充率超 40%）；L2 阶段触发层（进入需求分析加载 `request-analysis`，编码阶段加载 `coding-skill` 等）；L3 按需查询层（Wiki 知识库根据任务需要自主查阅）。核心原则：**让 Agent 在任何时刻都拥有「刚好够用」的上下文**。

### 5. 规范是活文档，每行都对应历史失败案例
Harness 体系的规范经历了多次版本更新——**规范的每一行都对应一个历史失败案例**。当觉得某条规则「多余」时，往往是因为它背后有一个真实踩过的坑。这与 Mitchell Hashimoto 的 Harness Engineering 定义完全一致：每发现一个错误，就工程化地消除它再次发生的可能性。

### 6. 变更管理构建完整 Audit Trail
每个需求在 `.harness/changes/` 下创建标准化变更目录（`summary.md` 作为 Single Source of Truth、版本递增的评审文件、完整执行状态记录），确保任何人可随时回溯全流程。这种知识沉淀副产品：`.harness/` 目录实际构成了一份活的「项目开发手册」，新人和 Agent 都可通过相同阅读路径快速理解项目全貌。

### 7. 投入产出比：一次性投入与复利效应
构建 Harness 体系前期投入约一周（Rules 定义、Skill 编写、评审规范、模板设计），但这是一次性投入——一旦建立每个后续需求都能在框架内高效运转。更重要的是文档资产具有 **复利效应**：编码规范从「大家心里都知道」的潜规则变为 Agent 可执行的 Spec；架构约束从「口头传承」变为被机械化执行的 Quality Gate。

### 8. 开发者角色范式转移
传统模式：写代码、调 Bug、做 Code Review。Agent-First 模式：设计 Agent 的工作环境、编写规范文档、管理任务拆分与验收。文档从「给人看的参考资料」变成「Agent 认识世界的唯一窗口」；发现 Bug 不再只是修代码，而是修 Harness——从根源上防止同类问题再次出现。

---

