# 京东搜推数据生产 Agentic 重塑：Forge Agent + Sindri + ADF 受控数据研发链路

> 📊 Level ⭐ | 5.8KB

→ [原文存档](https://mp.weixin.qq.com/s/hI5nHc3XBBhf57lOTVorqA)

京东技术（京东零售搜推数据方向，第一方）数据研发平台架构文。核心命题：大模型已能理解需求/生成代码/解释错误，但数据生产的难点不是"写出一段 SQL"，而是数据源确认、口径澄清、加工编排、资源规划、任务提交、调度运行、结果交付、故障处置的全链路——任何一步缺失都可能让"看起来正确"的任务变成生产事故。目标是建立受控链路而非让模型绕过平台直接操作生产。

## 四层职责架构

- **Forge Agent（研发入口）**：需求澄清、任务拆解、Skill 路由、工具选择、结果解释与人工交接；模型只负责需求理解和流程组织，生产操作由平台接口/权限规则/执行结果约束。配套机制：Skill（场景操作流程+领域知识）、Plugin/MCP（编译/校验/生成/提交/查询标准操作）、Hook（提交等关键节点的权限校验/审计/人工确认）、Trace/Trajectory（调用过程记录复盘）、Golden Case/Eval（固定案例验证版本变更不回归）。
- **Sindri Plugin/MCP（工具接口）**：将上下文查询、DSL 构造、校验、规划、提交、状态查询封装为参数明确、返回结果稳定的确定性工具。
- **Sindri 后端（领域后端）**：解析领域语义、绑定平台对象、生成执行计划（含 DSL 解析/执行计划生成/优化）、构建请求并提交——面向平台解释"这项数据加工究竟要如何执行"，不让模型直接拼装底层请求。
- **ADF（执行底座）**：承载 DAG、节点依赖、调度运行、任务/实例状态与生命周期；支持 Spark/Flink/Shell/JDOS 多任务形态，引擎多样性由适配层隔离。

典型链路：需求澄清 → 上下文获取 → DSL 构造 → 结构校验 → Sindri 权威规划 → 提交预览 → 显式确认 → Sindri 提交 → ADF 生命周期 → 状态反馈。

## 领域 DSL 与准确性工程

领域 DSL 用稳定语义描述数据对象、转换算子、过滤、关联、聚合、UDF/UDTF 与输出目标，不绑定具体引擎。文中给出超星索引 Pipeline 完整实例：一个 `SemanticContext` 内表达多源输入（两路实时变更+一路离线全量）、`union`、状态 `merge`（HBase 宽表）、跨域 `left_join`、双分支输出（实时消息+离线索引）；实时/离线分支落到哪类 Flink 任务、需要哪些算子和资源，由 Sindri 后端结合表类型与运行配置生成计划。

DSL 生成准确性的三类失效：需求信息不完整时自行补全业务参数；多个 Skill 职责重叠导致答非所问甚至开发阶段提前提交；依赖已有记忆生成，SDK/表类型/规划规则变化后语法正确但拓扑已不符。Sindri Plugin 的解法是把开发流程拆成「单场景路由—需求契约—标准示例—SDK 事实—本地校验—后端规划—人工确认」，将准确性从一次生成问题转化为可检查、可回退的工程流程。提交采用两阶段门禁：先生成预览，用户明确确认后才真实提交。

## 质量贯穿与「先证据、后自动化」的自愈观

数据质量系统纵向贯穿全链路四类能力：数据核对（全量/抽样校验+差异归因）、数据质量（规则校验/完整性/阈值告警）、血缘追踪（字段级血缘+影响分析）、监控大盘（SLA/时效/异常）。自愈闭环规划判断：不应以"全自动"为目标起步，而应先打通规划证据（目标环境/语义结构/确认结果）、提交证据（预览/权限判断/对象标识）、运行证据（DAG/实例/日志/结构化错误），再让自动化在有证据支撑的范围内逐步扩大——证据链越完整，可安全交给自动化的动作就越多；真正的自愈还需要稳定状态机、幂等机制、风险分级、重试上限、结果复核与人工接管。

## 与现有知识的关联

- [京东海博 AI-Native 研发工程体系（运行时侧）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/jd-haibo-ai-native-harness-dual-loop-knowledge.md)：同平台姊妹能力层，海博覆盖 Agent 运行时/Harness/知识库，本篇覆盖搜推数据生产链路
- [京东海博 AI 知识库能力建设（知识供给侧）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/jd-haibo-ai-knowledge-base-construction-jdtech-2026-09-24.md)：同号姊妹篇先例（Sister-Capability 模式）
- [数据研发 Multi-Agent Harness 工程实践（阿里云）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/数据研发-multi-agent-harness-工程实践.md)：跨厂数据研发 Agent 可信工程同题参照
- [数据智能体平台架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/data-agent-platform-architecture.md)：数据 Agent 平台通用架构概念层

---

