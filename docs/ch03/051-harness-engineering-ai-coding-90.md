# Harness Engineering 详解：如何将 AI Coding 率提升至 90%

## Ch03.051 Harness Engineering 详解：如何将 AI Coding 率提升至 90%

> 📊 Level ⭐⭐ | 31.3KB | `entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md`

> -> [harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)

## 摘要

阿里云开发者发布的一篇 Harness Engineering 实战复盘：在一个 10 万+行、技术栈为 Java 1.8 / Spring Boot / LiteFlow / HSF / Diamond / Tair 的企业级存量应用中，作者用一周时间从零构建 Harness 体系，将 AI 代码率从 **24.86%** 提升至 **90.54%**（个人维度 14.24% → 87.85%）。核心论点是：AI Coding 率提升的瓶颈不在模型，而在 **Harness Engineering**——围绕 AI Agent 设计的约束机制、反馈回路、工作流控制与持续改进循环的系统工程。

## 核心要点

- **范式跃迁**：从 Prompt Engineering（2022-2024）→ Context Engineering（2025）→ Harness Engineering（2026）的三阶段演化。
- **核心矛盾**：Anthropic 数据显示 60% 开发时间已用 AI 辅助，但"完全委托"任务仅 0-20%——能力与可信赖产出之间存在系统性鸿沟。
- **四根支柱**：上下文架构（Context Architecture）、Agent 专业化（Agent Specialization）、持久化记忆（Persistent Memory）、结构化执行（Structured Execution）。
- **Anthropic 的四种 Agent 失败模式**：One-shot Syndrome、Premature Victory Declaration、Premature Feature Completion、Cold Start Problem。
- **核心论断**：**Agents aren't hard; the Harness is hard**（OpenAI Ryan Lopopolo）。
- **可操作的定义**：Harness Engineering = 每发现 Agent 错误一次，工程化地消除它再次发生的可能性（Mitchell Hashimoto）。
- **工程挑战**：大型存量代码库的认知负担、质量控制缺失、熵累积、开发者角色范式转移。
- **实战成果**：项目维度 AI 代码率 24.86% → 90.54%，返工从 3-5 轮降至 1 轮。

## 深度分析

### 1. 范式跃迁：从 Prompt 到 Context 到 Harness

文章把 AI Coding 的演化划为三个清晰阶段：

**Prompt Engineering（2022-2024）**：关注单次交互的优化——通过 Few-shot、CoT、角色设定让模型在一次对话中给出更好回答。隐喻是"写好一封邮件"。

**Context Engineering（2025）**：关注"给 Agent 看什么"——动态构建的上下文窗口应该填充哪些文档、对话历史、工具定义、RAG 检索结果。Shopify CEO Tobi Lutke 把它类比为"给邮件附上所有正确的附件"。核心突破是：模型表现的上限取决于上下文质量，而非 prompt 措辞。

**Harness Engineering（2026）**：站在更高抽象层次——不再只关注"一次对话"或"一次上下文窗口"，而是设计 **跨越多个会话、多个 Agent 角色、多个执行阶段的完整系统架构**。

这个三段式划分的关键洞察是：**每一次跃迁都是"控制边界的外扩"**——从单次交互（prompt）→ 单次上下文（context）→ 跨会话跨角色（harness）。每一阶段都把模型从"被动应答者"变成"被约束的工作者"，约束的复杂度逐级上升。

### 2. 为什么不能只靠模型本身

Anthropic 系统总结了 Agent 在复杂项目中的四种典型失败模式：

- **One-shot Syndrome（试图一步到位）**：Agent 倾向在单个上下文窗口内完成全部工作。当实现过半，上下文被消耗大半，模型开始 Hallucination、循环输出、格式错误的 Tool Call。Anthropic 经验数据表明，**上下文窗口的 Sweet Spot 在 40% 以下填充率**。
- **Premature Victory Declaration（过早宣布胜利）**：Agent 完成部分工作就宣布任务结束，核心功能尚未实现或验证。
- **Premature Feature Completion（过早标记功能完成）**：Agent 认为功能已实现但未做端到端测试，部署后才发现关键路径不通。Anthropic 解决方案是 Browser Automation（Puppeteer MCP）做自动化截图验证。
- **Cold Start Problem（环境启动困难）**：多次会话间缺乏持久化记忆，每次新会话需花大量 Token 重新理解项目结构，挤压真正用于编码的 Token Budget。

**共同根源**：Agent 缺乏外部的结构化约束（Structured Constraints）和反馈机制（Feedback Mechanisms）。

更关键的是：**Agents are incapable of accurately evaluating their own work**（Anthropic）—— Agent 存在根本性的能力缺陷，无法准确评估自身产出质量。Harness 的作用就是通过外部化的控制系统弥补这一缺陷。

### 3. 四根支柱：Harness Engineering 的设计要素

综合 Anthropic 与 OpenAI 团队的实践，Harness Engineering 归纳为四根支柱：

**支柱一：上下文架构（Context Architecture）**
Agent 应当恰好获得当前任务所需的上下文——不多不少。OpenAI 早期教训：把 AGENTS.md 写成百科全书，结果"所有内容都重要 = 没有内容重要"。改为 ~100 行的索引（Index & Map），指向更深层的 Design Docs / Architecture Specs / Quality Criteria。**上下文分层加载、按需获取，是 Harness 性能的基石**。

**支柱二：Agent 专业化（Agent Specialization）**
拥有受限工具集（Constrained Toolset）的专业 Agent 优于拥有全部权限的通用 Agent。Anthropic 明确分离 Planner（规划）/ Generator（实现）/ Evaluator（验证）三种角色。核心发现：**将做事的 Agent 和评判的 Agent 分开，是一个强有力的杠杆（Powerful Lever）**。

**支柱三：持久化记忆（Persistent Memory）**
进度持久化在文件系统，而非上下文窗口。Anthropic 的标准化启动序列：检查当前工作目录 → 读取 Git Log 和进度文件（如 `progress.md`）→ 定位优先级最高的未完成任务 → 开始工作。这使得跨越数十个会话的长时间任务成为可能。

**支柱四：结构化执行（Structured Execution）**
永远不让 Agent 在未经审查和批准书面计划之前写代码。理想执行流：**理解 → 规划 → 执行 → 验证**，每个阶段之间有明确的质量门禁（Quality Gates）。OpenAI 团队用 Custom Linter + Structure Tests + Taste Invariants 构建机械化约束，原则是："Waiting is expensive, fixing is cheap"。

### 4. 企业级 AI Coding 的四大挑战

文章列举了把 Agent 引入存量代码库必然遇到的四个系统性挑战：

**4.1 大型存量代码库的认知负担（Cognitive Load）**
企业级 Java 应用通常 10 万+行代码，技术栈涉及 RPC（HSF/Dubbo/gRPC）、流程编排（LiteFlow/Temporal）、配置中心（Diamond/Apollo/Nacos）、缓存（Tair/Redis）、数据库中间件（TDDL/ShardingSphere）。Agent 不知道某条链路是高频变更区、不知道某个全局配置类在项目中有近百处引用、不知道某些字段有隐含的类型和单位约束——这些 **隐性知识（Tacit Knowledge）** 散落在团队成员的经验中。

关键论断：**Agent 的知识边界等于代码库的文件边界**（OpenAI）。如果某条架构约定不在代码库中以机器可读的形式存在，对 Agent 来说它就不存在。

**4.2 质量控制的系统性缺失（Systematic Quality Gap）**
裸用 Agent 写代码时，质量控制几乎完全依赖人工 Code Review。但 Agent 产出速度远超人工审查速度时，质量瓶颈从"写代码"转移到"看代码"。更麻烦的是，Agent 生成的代码通常语法正确、风格统一，但**业务语义层面可能存在微妙错误**——比如忘了在国际化链路上做同样修改，或没考虑配置中心动态参数的影响。

**4.3 熵的累积（Entropy Accumulation）**
Agent 写代码时会模仿代码库已有 Pattern，包括那些 Suboptimal 的 Pattern。每次生成都可能引入少量风格不一致、冗余逻辑、次优实现。单次看起来无关痛痒，累积起来却会让代码库逐渐腐化（Code Rot）。

OpenAI 早期每周五手动清理"AI 产物"，很快发现不可持续。最终方案是 **将"Golden Principles"编码化**——例如"优先使用共享工具包而非手写辅助函数"、"结构化日志格式统一"等——让后台 Agent 自动扫描违规并提交修复 PR，形成自动化的 **Entropy Garbage Collection**。

**4.4 开发者角色的范式转移（Paradigm Shift）**
引入 Agent 后，开发者的核心工作正在发生本质变化。传统模式下是写代码、调 Bug、做 Code Review。Agent-First 模式下变成：

- **设计 Agent 的工作环境**（Working Environment Design）
- **编写规范文档**（Specification Authoring）
- **管理任务拆分与验收**（Task Orchestration & Acceptance）

文档从"给人看的参考资料"变成"Agent 认识世界的唯一窗口"。架构约束不再是"大团队才需要"的奢侈品，而是 Agent 高效工作的前置条件。**发现 Bug 不再只是修代码，而是修 Harness**——从根源防止同类问题再次发生。

### 5. 实战架构：四要素 + Application Owner Agent

作者把 Harness 落地设计拆解为四个核心要素：

**规则体系（Rules）**：告诉 Agent"标准是什么"——工程结构约束、编码规范、分层架构约定（不随需求变化的稳定约束）。

**技能体系（Skills）**：告诉 Agent"应该怎么做"——需求分析 SOP、编码分层规范、评审检查清单、单元测试方法（可复用的标准化工作流）。

**知识库（Wiki）**：告诉 Agent"系统是什么样的"——链路梳理、数据模型、核心业务流程的文档化描述。

**变更管理（Changes）**：记录 Agent"做了什么"——每个需求从分析到部署的全过程文档，构成完整的追溯链（Audit Trail）。

这四个要素以 `.harness/` 目录作为物理载体，包含 `agents/`、`rules/`、`skills/`、`changes/`、`mcp/` 等子目录。

**核心大脑**：Application Owner Agent 是整个 Harness 的编排中枢，直接与开发者交互，负责从需求接收到交付验收的全流程调度。它的定义文件承担 Anthropic 所说的"Index & Map"职责——通常约 400 行，包含五个模块：

- **角色与项目背景（Role & Project Context）**：明确 Agent 身份 + 项目核心背景（20-30 行内）
- **配置中枢索引（Configuration Hub Index）**：结构化表格列出 Rules/Skills/Wiki/MCP 的路径、职责、触发场景
- **七项核心职责（Core Responsibilities）**：需求理解、任务拆解、任务分发与协调、任务验收、质量把关、文档管理、知识问答
- **工作流程调度指令（Workflow Orchestration Instructions）**：10 阶段流程中每个阶段的完整调度逻辑
- **沟通原则与硬性约束（Communication Principles & Constraints）**：用"必须做到"和"禁止做的"两张清单定义 Agent 行为边界

### 6. 上下文架构：L1 / L2 / L3 三层加载

文章把项目知识按加载时机分为三层：

**L1 — 会话常驻层（Always Loaded）**：Agent 定义文件（约 420 行，承担 Index & Map 职责）+ 三份 Rules 文件。提供全局视野和基本约束，总量严格控制（避免上下文窗口填充率超过 40%）。

**L2 — 阶段触发层（Phase-triggered）**：进入需求分析时加载 `request-analysis` Skill；编码阶段加载 `coding-skill` 和 8 份分层编码 Spec（覆盖 Controller → Service → Domain → DAO → Adapter 全链路）；评审阶段加载 `expert-reviewer`。**每个阶段只加载当前需要的知识**。

**L3 — 按需查询层（On-demand）**：Wiki 知识库中的业务文档不会主动加载，Agent 根据任务需要自主查阅。保证上下文的"新鲜度"和针对性。

**核心原则**：让 Agent 在任何时刻都拥有 **"刚好够用"的上下文（Just-enough Context）**。对于中间件繁多的企业级应用尤其关键——如果把 RPC 规范、流程引擎组件写法、配置中心规范全部一次性塞给 Agent，信息过载反而会导致注意力分散和幻觉。

### 7. 十阶段开发流程：结构化执行的核心

完整的开发需求从接收到交付划分为 **10 个严格有序的阶段（10-Stage Pipeline）**：

`需求分析 → 需求评审 → 编码实现 → 编码评审 → 单元测试编写 → 单元测试评审 → 代码推送 → CI 验证 → 部署验证 → 用户确认`

每个阶段都有三要素：**触发条件（Entry Criteria）**、**Skill 加载（Skill Injection）**、**质量门禁（Quality Gate）**。

阶段之间有精确的 **回退路径（Rollback Routes）**：CI 失败且测试为 0/0 回退到阶段 5；编译错误回退到阶段 3；需求不符回退到阶段 1。**避免"出了问题只能从头来"的低效**。

**评审环节设置循环上限（Iteration Cap）**：需求评审最多 3 轮、编码/测试评审最多 2 轮，超出后升级到人工决策。**防止 Agent 陷入无限的自我修改循环（Infinite Self-correction Loop）**。

**5 个 Human-in-the-Loop 确认点**：需求待决议确认、计划评审后确认、编码评审后确认、部署环境参数确认、最终交付确认。**人始终掌握关键决策权**。

### 8. Skill 体系：将隐性知识显性化

Skill 是 Harness 体系中最花精力打造的部分。每个 Skill 是一份结构化 SOP，把资深开发者脑中的隐性知识固化为 Agent 可执行的流程指令。

以 `coding-skill` 为例，含 8 份分层编码规范（Layered Coding Specs）：

| 层级 | 规范文件 | 核心内容 |
|---|---|---|
| 表现层 | Controller 实现 Spec | RPC Provider 实现模式、参数校验、异常处理 |
| 应用层 | 接口定义 / 接口实现 Spec | RPC 接口定义规范、DTO 设计原则 |
| 业务层 | 业务逻辑 Spec | 核心业务逻辑封装、流程编排组件写法 |
| 数据层 | 建表 / 持久化 Spec | DDL 设计规范、Mapper 编写方式 |
| 适配层 | 服务依赖 Spec | 外部 RPC 调用超时设置、降级方案 |
| 文档层 | 接口文档生成 Spec | 对外接口的协议文档模板 |

**编码规范中的硬性约束**：价格字段必须用 `long` 类型（单位为分），禁止 `double`/`float`；外部服务调用必须设置超时和降级；流程编排组件必须委托 Service 处理，组件内不写大段业务逻辑。

`expert-reviewer` 是质量保障的核心 Skill。定义两种评审循环：**计划评审（Plan Review）** 审查 spec.md + tasks.md 的合理性和完整性；**执行评审（Execution Review）** 审查编码实现是否满足计划和需求。每条评审意见必须包含问题描述、修改建议和优先级分级（MUST FIX / LOW / INFO）。

`unit-test-write` 体现 **"改动驱动测试（Change-driven Testing）"** 原则：改了哪个接口就测哪个接口，而非一刀切测最上层。还要求优先通过 MCP 工具查询被改动接口的线上真实请求出入参构造测试数据。

### 9. 关键经验五条

**9.1 Harness 本身需要 Dry Run**
拿真实需求使用 Harness 之前，应当用虚拟需求完整走一遍全流程。空跑发现的四个缺陷：CI 门禁只检查状态码忽略测试用例数为 0 的异常；评审报告在简单需求下不生成文件；摘要文件因 Agent "追加"倾向出现重复行；部署参数被 Agent 错误推测。**核心启示：不要期望第一版 Harness 就是完美的，用低成本快速验证、快速修复**。

**9.2 质量门禁必须可程序化验证**
"**If it can't be mechanically enforced, the agent will drift.**"（OpenAI 百万行代码项目核心经验）"检查 CI 是否通过"这种自然语言描述不够——Agent 可能认为 SUCCESS 即通过，却忽略测试用例数为 0 的异常。改为 `status == SUCCESS && total_tests > 0 && passed == total` 三个可程序化验证条件后，问题彻底消除。**一切不可被机器验证的约束，在 Agent 执行中都是无效约束**。

**9.3 分离执行与评判是关键杠杆**
Anthropic 反复强调："将做事的 Agent 和评判的 Agent 分开，是一个强有力的杠杆。"编码 Agent 和评审 Agent 的分离带来显著质量收益——评审 Agent 发现了编码 Agent 遗漏的渠道判断逻辑（潜在线上故障），还在另一个需求中检测到 Agent 试图跳过评审阶段并强制回退。**Agent-to-Agent Review** 本质上是将传统 Code Review 自动化，把质量发现前移到 Human Review 之前。

**9.4 流程一致性优先于流程效率**
在一个仅 2 个文件、6 行代码的小需求中，作者依然走完了完整 10 阶段流程——1 轮评审即通过。验证了一个重要假设：**好的流程不应该给简单任务增加显著负担**。需求足够简单时，每个阶段执行时间自然缩短。但流程一致性保证了不会因为"改动很小"就跳过关键环节。**保持流程一致性是廉价的保险**。

**9.5 规范是活文档，需要持续迭代**
开发流程规范经历多次版本更新，每次实战发现新问题都立即 Patch 到 Harness。**规范的每一行都对应一个历史失败案例**。当你觉得某条规则"多余"或"啰嗦"时，那往往是因为它背后有一个真实踩过的坑。

### 10. 效果数据：25% → 90% 的跃迁

**3 月基线（Harness 引入前）**：

| 维度 | AI 采纳行数 | 提交代码行数 | AI 行占比 |
|---|---|---|---|
| 项目维度（price-center） | 1,411 | 5,676 | **24.86%** |
| 个人维度 | 666 | 4,677 | **14.24%** |

**4 月实测（Harness 运转成熟后，4/6-4/12 周度）**：

| 维度 | AI 采纳行数 | 提交代码行数 | AI 行占比 |
|---|---|---|---|
| 项目维度（price-center） | 3,063 | 3,383 | **90.54%** |
| 个人维度 | 3,051 | 3,473 | **87.85%** |

项目维度 AI 代码率从 **24.86% 跃升至 90.54%**，个人维度从 **14.24% 跃升至 87.85%**。

**关键强调**：高 AI 代码率本身不是目标——**在质量可控前提下的高 AI 代码率才有意义**。这 90% 的 AI 代码经过了完整的需求分析、编码评审、单元测试和 CI 验证，每一行都通过了 Harness 体系的质量门禁。

### 11. 深层收益与未来方向

**更深层的收益**：
- **返工大幅减少**：以往 Agent 裸写代码后人工 Review 发现问题要求返工的循环可能迭代 3-5 轮；Harness 后 Agent-to-Agent 评审闭环在内部完成大部分质量纠偏，到人工确认时通常只需 1 轮。
- **交付质量可预期**：质量门禁的程序化验证让产出可预测。
- **知识沉淀副产品**：`.harness/` 目录下积累的规范文档、编码 Spec、评审记录、变更历史，构成活的"项目开发手册"。**新人加入团队不再需要靠口头传授理解项目编码习惯和业务逻辑**——Agent 和新人都可通过相同的阅读路径快速理解项目全貌。

**未来方向**：
- **Harness 的自我进化**（Self-evolving Harness）：让 Agent 自动分析历史失败案例并提出规范改进建议。
- **跨项目 Harness 模板化**（Cross-project Harness Templates）：将 10-Stage Pipeline、Review Loop、Change Management 抽象为可参数化的"模板"。
- **更精细的 Agent 角色矩阵**（Agent Role Matrix）：引入 Performance Auditor、Security Scanner、Documentation Sync Agent 等更多专业角色。
- **存量代码库的渐进式 Harness 引入**（Incremental Harness Adoption）：为有十年历史的遗留代码库引入 Harness 而不被海量技术债告警淹没。

### 12. 与本文库其他 Harness 实体的关联

- **横向对照**：`harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的` 与 `claude-code-harness-deep-dive`、`claude-code-harness-deep-understanding`、`两万字详解claude-code源码核心机制`、`深入理解-claude-code-源码中的-agent-harness-构建之道` 都是 Harness 主题的不同切面——本文更偏实战复盘、数据驱动、流程工程化。
- **方法论互补**：Mitchell Hashimoto 的定义（"每发现错误就工程化消除它"）与 Anthropic 的"四失败模式" + OpenAI 的"Agents aren't hard; the Harness is hard" 共同构成 Harness Engineering 的理论基石。
- **流程与规范沉淀**：本文的 `.harness/` 目录结构、10-Stage Pipeline、Skill 体系可作为团队落地 Harness 的参考模板。

## 实践启示

1. **Harness Engineering 是 AI Coding 的下一道分水岭**：从 Prompt → Context → Harness 的范式跃迁决定了团队能否把 AI Coding 率从 25% 推到 90%。
2. **核心论断要记牢**：Agents aren't hard; the Harness is hard。投资 Harness 工程比投资模型选型 ROI 更高。
3. **四根支柱缺一不可**：上下文架构、Agent 专业化、持久化记忆、结构化执行必须同时落地。
4. **质量门禁必须可程序化验证**：If it can't be mechanically enforced, the agent will drift。
5. **10-Stage Pipeline + Iteration Cap 是企业级落地的关键**：防止无限自我修改循环、保证流程一致性。
6. **Agent-to-Agent Review 是质量前移的核心杠杆**：把传统 Code Review 自动化，让人工 Review 只需最终确认。
7. **规范是活文档**：每条规则都对应一个历史失败案例，发现问题立即 Patch 到 Harness。
8. **Harness 本身需要 Dry Run**：不要期望第一版就是完美的，用低成本快速验证、快速修复。
9. **隐性知识显性化是 Skill 体系的核心**：分层编码规范把"老员工的隐性知识"固化为 Agent 可执行的 SOP。
10. **高 AI 代码率本身不是目标**：质量可控前提下的高 AI 代码率才有意义。Harness 的价值不在于让 Agent 更聪明，而在于让 Agent 错误变得可控、可发现、可修复。
11. **Harness 是复利资产**：一次性投入建立体系，每个后续需求都在框架内高效运转，且 `.harness/` 文档成为团队知识管理的结构化基础设施。
12. **未来的工程竞争力**：不再取决于谁的 Prompt 写得更好，而是取决于 **谁的 Harness 设计得更精密、更可靠、更具可演化性**。

## 相关实体

- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md) — Claude Code 源码级机制详解，与本文互补
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — Claude Code harness 设计的深度剖析
- [Claude Code Harness Deep Understanding](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-understanding.md) — Claude Code harness 另一深度解析
- [Claude Code Harness Deep Dive Founder Park](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-dive-founder-park.md) — 同主题的另一种解读视角
- [Claude Code Dynamic Workflows 8Th Translation Xingxiaozhao](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-8th-translation-xingxiaozhao.md) — Claude Code 动态工作流的翻译对照
- [Gsd Get Shit Done Context Management Tool](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md) — 上下文管理工具
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — Agent 记忆系统的工程实践，与"持久化在文件系统"理念呼应
- [Cline Agent Runtime Sdk](https://github.com/QianJinGuo/wiki/blob/main/entities/cline-agent-runtime-sdk.md) — Cline SDK 的分层可移植设计，与 Harness Engineering 形成"开源平台 vs 工程化体系"对照
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md) — Vibe Coding → Agentic Engineering 的范式跃迁
- [卡片式对话的协议方案探索和思考](https://github.com/QianJinGuo/wiki/blob/main/entities/卡片式对话的协议方案探索和思考.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

