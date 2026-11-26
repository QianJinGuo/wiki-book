# 从零设计准生产级 LLM Agent：ThinkingAgent 完整架构与可靠性体系

> 📊 Level ⭐⭐⭐⭐ | 22.4KB

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/UTEdhrkV3G3Ycfrg0Jng_A)

## 概述

**工程师与艺术家（Thinking）** 2026-06 发布的 **ThinkingAgent** 是从零独立构建的准生产级 LLM Agent 框架，**不依赖任何已有代码或架构**。本文是中文圈公开材料中**最完整、最底层、最有工程取舍判断**的 Agent 框架设计文档——覆盖从 Pipeline 架构到上下文压缩到 Benchmark 的完整链路。

**核心哲学**："**LLM Agent 工程最核心的是如何产生高质量的推理轨迹——如何有目的地控制那台高维度贝叶斯概率机器**"。

**Benchmark 数据**：5 任务 × 40 次 = 200 次独立运行。推理轨迹正确率 99%、工具选择正确率 98%、JSON 解析成功率 100%、任务完成率 94%。

## 1. 架构总览：五层垂直分离 + Pipeline 星形拓扑

### 1.1 五层架构

从下到上：**基础能力层 → 可靠性层 → 安全性层 → 飞轮层**。每一层面向不同领域问题，可独立深入和演进。

### 1.2 核心设计方法

采用 **DDD 领域建模 + 数据流系统建模** 双轨设计：基于数据流动提出业务事实 → 编排时间顺序 → 推导 Command/Policy → 抽聚合 → 提取根对象。

### 1.3 Pipeline 是唯一的"上帝视角"

三个关键动机：串联协调各聚合根动作顺序 / 制造干净的星形拓扑依赖 / 未来多 session 并发时成为数据隔离单元。

### 1.4 ComponentAssembler：依赖注入统一入口

测试替换（注入 mock 不改业务代码）、配置集中（一个收口管理所有配置）、依赖可见（一目了然）、生命周期管理（控制创建顺序，如 LLMGateway 必须在 ReasoningManager 之前）。

### 1.5 EventBus：15+ 领域事件

覆盖从 TaskAnalysisStarted 到 TaskExecutionSucceed 的完整生命周期。通过订阅所有事件可重建任务执行的完整时间线。

## 2. 推理框架：Plan-and-Execute + ReAct + Self-Reflection

**以 Plan-and-Execute 为骨架，以 ReAct 为血肉，以 Reflection 为进化驱动力**的混合式智能体。

### 2.1 三段式循环（核心控制流）

| 循环层级 | 关注点 | 关键操作 |
|---------|--------|---------|
| **Task 级** | 任务分析/计划制定/交付评审 | 重写用户问题、制定评审计划、知识/偏好提取 |
| **Stage 级** | 步骤执行/结果评审/恢复 | 模型路由、Checkpoint 保存、恢复流程 |
| **推理级** | 单次 LLM 交互 | 非阻塞轮询用户指令、构建上下文、工具调用分支 |

设计目的：解耦控制流、降低决策树深度、减少异常恢复逻辑复杂度。

## 3. 任务分析：让 Agent 真正理解任务

把一个模糊的自然语言请求转化为结构化的、机器可处理的任务描述。产出四方面信息：

| 层面 | 关键字段 | 用途 |
|------|---------|------|
| **任务语义** | task_type、intent、task_goal、entities | 模型路由、全程方向保持、实体规范化 |
| **执行约束** | action_constraints、output_constraints、risks | 行为边界、评估标准、风险预警 |
| **工具匹配** | 每个工具语义相关性评分 | 工具过滤（两遍打分） |
| **模型路由提示** | capability_tags、context_tokens、latency_sensitive | 智能模型路由输入 |

**知识注入时机**：在任务分析**结束后**进行（而非基于原始描述），避免语义模糊导致噪音。

## 4. 提示词工程：四个关键实践

### 4.1 从模型行为规律反推 Prompt 布局

**头部放稳定的全局控制信息**（系统角色/任务目标/执行约束），**中部放可压缩的过程信息**，**尾部放当前决策所需的高优先级信息**。

> 头部负责"定方向"，尾部负责"控动作"，中部负责"保连续性"

### 4.2 工具选择的优先级提示（first match wins）

简单数学→calculator / 多步数据处理→run_python / Excel→excel / Shell→shell / SQL→SQL 工具 / 网络事实→search。解决 LLM 倾向选择"万能"工具而非最合适专用工具的问题。

### 4.3 为副作用设计提示词

Self-Reflection 的输入应定义为从副作用中**抽取的特征**（如 checklist summary），而非副作用内容本身。

### 4.4 为 LLM 推理输出加装消息信封

Agent 控制流用标准化 JSON 格式（`{"final_answer":"..."}`），质检时提取原始消息。**Agent 执行需要的信息格式和用户任务需要的信息格式解耦区分**。

## 5. 检查点机制：长任务的生命线

### 5.1 保存时机：评估通过后

四种方案对比：

| 方案 | 粒度 | 问题 |
|------|------|------|
| 每次工具调用后 | 最细 | 大量磁盘 I/O，中间状态无独立恢复价值 |
| 每次 LLM 推理后 | 较细 | 中间状态无独立恢复价值 |
| 每阶段完成后 | 适中 | 可能保存错误结果，后续基于错误继续 |
| **每阶段评估通过后** ✅ | 最优 | 保存的是"已验证的进度"，每个检查点都是"已知良好"状态 |

### 5.2 检查点内容

任务信息、执行计划、已完成阶段结果、当前上下文窗口、**模型路由状态（含熔断器状态）**、用户偏好快照。

## 6. 上下文管理：推理轨迹的托举

### 6.1 双缓冲设计

**_ctx_window**（当前活跃上下文，可增删）+ **_history**（完整追加历史，只增不删）。阶段回滚时从 _ctx_window 删除，但 _history 保持完整用于知识提取和审计。

### 6.2 五步自动修复法

1. 删除孤立 tool_result → 2. 确保第一条是 user 消息 → 3. 修复 tool_use/tool_result 配对 → 4. 删除末尾孤立 tool_use → 5. 合并相邻同角色消息。

### 6.3 Token 预算管理：角色分配制

| 区域 | 用途 | 压缩优先级 |
|------|------|-----------|
| 预留区 | LLM 响应输出 | 不可压缩 |
| system 消息 | 关键指令 | 最低 |
| user 消息 | 任务描述 | 低 |
| assistant 消息 | 推理过程 | 中（保留最近，删除较早） |
| tool 消息 | 工具结果 | **最高**（往往很长，可大幅压缩） |

### 6.4 上下文压缩：混合策略 + 渐进式处理

**5 种压缩策略**（按侵入程度递增）：消除重复工具调用 → 简化失败消息 → 缺省过长参数 → 缺省过长字段 → GROUP 替换为摘要。

**核心原则**：从侵入最少的策略开始，满足预算就早停。**不引入直接裁剪**（实践中发现可能引发推理轨迹断裂）。

### 6.5 Prompt Caching

两个 cache_control 标记：Task Plan 所在 tool role + 最新一条消息。

## 7. 可靠性体系：Pillar-Layer 异常处理

**核心哲学**：失败是常态，不是异常。可靠性设计的重心不是如何避免失败，而是失败后如何以最小代价恢复。

### 7.1 六层异常矩阵

| Level | 发现机制 | 恢复手段 |
|-------|---------|---------|
| **Task** | Evaluator 评估 + 下层异常 | Retry 原计划 / 重新制定计划 |
| **Stage** | Evaluator 评估 + 下层异常 | 重试 / 重新规划 / 全计划重来 |
| **Reasoning** | 下层异常 | 模型切换 |
| **LLM Gateway** | 本地检查 + 错误码 | Backoff 重试 / 模型降级 / 厂商切换 / 报文修复 |
| **Tool Registry** | 调用前检查 + 重复调用纠偏 | Backoff / 纠偏 Prompt / 工具降级 / LLM-Driven 修复 |
| **Context** | 上下文检查 | 上下文修复/压缩 |

### 7.2 带行为的标准化异常

在错误码基础信息之上增加 **caller action** 和 **action data**，直接驱动调用端的恢复行为。错误码展示逻辑与恢复逻辑分离。

### 7.3 基于代价设计恢复策略

从最低代价开始尝试恢复，恢复策略自动升级。如 SQL 写错→重试当前步骤；计划描述不清→微调本步骤；数据清洗有问题→从上游重新规划。

### 7.4 LLM 网关：标准化协议 + 四类恢复

**UnifiedLLMRequest / UnifiedLLMResponse** 统一所有提供商。恢复策略：带 Jitter 的 Backoff 重试 / 模型降级 / 厂商切换 / 报文内容修复（JSON fence 修复）。

### 7.5 ToolRegistry：软干预代替硬终止

**连续同质化调用限制**：超过 10 次注入引导消息（"你已经连续调用工具 10 次，请停下来思考"），而非直接终止。这种"软干预"比"硬终止"更优雅——给 LLM 自我反思的机会。

## 8. 质量评估：三层体系

| 层次 | 时机 | 代价 | 核心策略 |
|------|------|------|---------|
| **计划评估** | 执行前 | 最低（~500-1000 token） | 全局匹配 + 双向因果论证（从因看果 + 由果观因），提升成功率 ~15pp |
| **阶段评估** | 每阶段后 | 中等 | 显式要求（key results 是否包含）+ 隐式要求（是否推动 task_goal） |
| **任务评估** | 全部完成后 | 最高但必要 | 6 维度（目标达成/意图对齐/输出约束/风险规避/信息完整/副作用产物） |

**评估话术三要素**：原则描述（尽量具体，提供 Good/Bad Example）+ 流程描述（把思路具体化到执行细节）+ 标准描述（必须明确量化，不能笼统）。

## 9. 智能模型路由 + 安全性

### 9.1 CapabilityMatchStrategy：多信号加权评分

正向信号（任务类型匹配 / 能力标签命中 / 认知复杂度覆盖 / 场景相似度 / 工具调用支持 / API 稳定性）+ 负向惩罚（上下文溢出 / 延迟敏感 / 成本敏感）。

**认知复杂度 L1-L4**：L1 单步模板化 → L4 深度推理/长链思维。高层级覆盖低层级。

### 9.2 熔断器：三态状态机

CLOSED → OPEN（连续失败超阈值）→ HALF_OPEN（冷却到期，允许探测）→ CLOSED（探测成功）。**优先恢复高优先级提供商**。熔断器状态保存到检查点。

### 9.3 安全性：Safeguard 代理模式

为每个 Tool 套一层 Safeguard。通用检查（白名单/频率限制/会话独立目录）+ 个性化处理（Run Python 三层沙箱：AST 静态导入检查 + 受限内置函数 + 子进程隔离资源限制；SQL 参数化查询 + 只读 + 行数限制 + 脱敏 + 库表限制）。

## 10. 飞轮 + Benchmark + 工程总结

### 10.1 两种记忆

**知识库**（事实性信息：DB Schema / 数据质量问题 / 业务规则 / 问题定位套路）+ **偏好库**（行为偏好：输出格式 / 语言 / 详细程度 / 工具使用）。异步学习，用学习延迟换取执行延迟降低。

### 10.2 Benchmark：5 任务 × 40 次 = 200 次独立运行

| 指标 | 结果 |
|------|------|
| 推理轨迹正确率 | **99%** |
| 工具选择正确率 | **98%** |
| JSON 解析成功率 | **100%** |
| 样本任务完成率 | **94%** |
| 工具参数填充正确率 | **98.75%** |
| 轨迹效率 | Avg **0.75** |

**任务设计**：尼泊尔旅行规划 / SVM 教学课程 / 工程造价预估 / PJM 需求排期 / 外排序（1G 数据内存限制）。

### 10.3 工程实践总结

- **可靠性设计和基础能力搭建要同时进行**，避免后期架构剧烈冲击
- **LLM Agent 工程最核心的是如何产生高质量的推理轨迹**——如何有目的地控制那台高维度贝叶斯概率机器
- 提前做好系统可观测性和辅助分析工具
- 实践过程是真金白银花钱的——平均跑一个测试任务 4 块多人民币

## 深度分析

### 可靠性是架构决策，不是事后补丁

原文把"基础能力与可靠性同时设计"列为第一原则，可靠性层的重心不是避免失败，而是失败后以最小代价恢复。两个结构性做法尤其值得注意：异常对象自带 caller action 与 action data，相当于把恢复行为编译进错误类型本身；六层 Pillar-Layer 矩阵为每个层级预配"发现机制 + 恢复手段"。最具判断力的是代价意识：SQL 写错只重试当前步骤，数据清洗有问题才升级到上游重新规划——恢复策略按代价自动升级，把"重试"从祈祷式操作变成显式的代价阶梯。这与 [Harness Loop Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-loop-architecture.md) 的"异常处理内建于循环"互为印证。

### 上下文作为只增账本：双缓冲与渐进压缩

双缓冲把 _ctx_window（可变工作区）与 _history（只增不删）分开：阶段回滚只影响工作区，审计与知识提取走完整账本——这是事件溯源思想在 token 层的落地。压缩侧五种策略按侵入度递增、满足预算即早停，并明确拒绝直接裁剪（实践中会打断推理轨迹）。这条负结果与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) "上下文是推理载具而非存储"的立场一致：删错的不是字节，是因果链。角色分配制 Token 预算里 tool 消息压缩优先级最高，则承认了"工具回包最冗长也最可牺牲"的经验事实。

### 检查点保存"已验证的进度"：评估是恢复的前置条件

四种保存时机对比后选定"每阶段评估通过后"——检查点的不变式是"每个落盘点都是已知良好状态"，而非"已完成的工作"。它以三层质量评估为前置：计划评估用双向因果论证（从因看果 + 由果观因），以 ~500-1000 token 的最低成本换取约 15 个百分点的成功率提升；检查点内容还包含模型路由状态（含熔断器三态），使故障恢复能全状态还原而非仅还原对话。质量评估因此不是验收环节，而是恢复机制的前置条件，[Evaluation Harness Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 所述"评估面即控制面"在此得到工程实证。

### 安全与飞轮：默认不信任，行为可回溯

Safeguard 代理模式给每个 Tool 套通用检查（白名单/频率限制/独立工作目录），再按工具风险叠加个性化沙箱——Python 三层隔离、SQL 参数化 + 只读 + 脱敏，高危操作强制用户二次确认，与 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 的分层沙箱框架同构。飞轮侧知识提取要求可复用性、稳定性、准确性三条件并由用户审查，偏好库用 64KB 淘汰做"最近优先"衰减。两者共享同一姿态：默认不信任，行为可回溯。作者同时坦承 Benchmark 无 baseline 对照、无消融实验——99% 轨迹正确率应读作单系统自证而非普适结论，这正是评估结果外推时的边界。

## 实践启示

1. **把恢复策略写进架构而非 on-call 手册**：每类失败预配恢复手段并标注代价，从最低代价起步自动升级。
2. **上下文分"可变工作区 + 只增账本"双份维护**：回滚与审计走不同路径；压缩从侵入最小的策略开始、按预算早停，永不直接裁剪。
3. **只在质量评估通过后落检查点**，让每个恢复点都是"已知良好"状态；评估前移到计划阶段（双向因果论证）是性价比最高的一道闸。
4. **提示词按"头定方向、中控连续、尾控动作"布局**，并给 LLM 输出加装标准化 JSON 信封，把控制流信息与用户交付信息解耦。
5. **每个工具过一层 Safeguard 代理**：通用白名单与频率限制之上按风险加个性化沙箱，高危操作强制二次确认。
6. **知识沉淀异步化**：任务完成后提取、三条件把关、LLM 初筛加人工复核，用学习延迟换执行延迟。

## 11. 与库内相关实体的交叉

- [Harness Engineering Core Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-core-patterns.md)：Harness Engineering 核心模式（持久化指令/分层记忆/Session-Harness-Sandbox/凭证安全）— ThinkingAgent 的 Pipeline 架构是 Harness 模式的完整实现
- [Harness Engineering Paradigm Comprehensive 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md)：Harness Engineering 综合论述（2026 年真正重要的是 Harness）— ThinkingAgent 验证了"可靠性设计前置"的核心论点
- [Loop Engineering Feedback Control System](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md)：Loop Engineering 4 来源合并 — ThinkingAgent 的三段式循环是 Loop Engineering 的工程实现
- [Claude Code Tool Call Security Incident Gitignore Redis Anthropic Apology 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-tool-call-security-incident-gitignore-redis-anthropic-apology-2026-06-17.md)：Claude Code 安全事故 — ThinkingAgent 的 Safeguard 代理模式是直接应对方案
- [Skills Driven Programming Taobao Enterprise 5 Phase Evolution 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skills-driven-programming-taobao-enterprise-5-phase-evolution-2026-06-17.md)：大淘宝 Skills 编程 — ThinkingAgent 的 Anti-Skills 立场与之形成互补视角
- [Agent Loop Engineering Handbook 8 Questions Chen Jin Tencent Self 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md)：Agent Loop 8 个未解问题 — ThinkingAgent 对其中多个问题给出了工程答案

---

