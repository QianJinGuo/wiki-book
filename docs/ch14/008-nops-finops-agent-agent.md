# nOps FinOps Agent 架构：语义层驱动的数据分析 Agent 设计

> 📊 Level ⭐⭐⭐ | 11.2KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/how-nops-shipped-finops-agents-75-faster-with-amazon-bedrock-agentcore)

## 概览

nOps（AI 驱动的多云成本优化平台，管理 $4B+ 云支出）将其 FinOps 分析 Agent「Clara」从自建 Kubernetes + LangChain/LangGraph + Web API 工具包装架构迁移到 [Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md) 托管运行时 + Databricks Lakehouse Metric Views 语义层 + Databricks Lakebase 持久化。结果：上线时间从 10-12 个月压缩到 4 个月（-75%），正确率从 ~65% 升至 81.7%（+145%），工具失败率从 7.49% 降至 0.92%。

本文的核心价值不在 AWS 平台本身，而在三个可迁移的架构决策：**语义层作为 Agent 工具的数据访问契约**、**单 Agent 直连工具优于多 Agent 路由**、**流式响应合并层**。

## 语义层作为 Agent 工具的数据访问契约

Clara 的关键转变是放弃「API 形态数据 + 大上下文窗口」的旧路径，改为让 Agent 工具直接执行 SQL 查询 **Databricks Lakehouse Metric Views**（预建模的度量/维度语义层）。

文章用同一问题「Show my true AWS Cost for the last 30 days by account」对比两种工具实现：

- **Raw SQL MCP 方式**：工具每次都要重新计算业务逻辑——EDP 折扣、PPA 信用、RI 摊销、Savings Plan 摊销逐项叠加再 join 归一化，SQL 30+ 行且每处使用点都可能漂移。
- **Metric View MCP 方式**：工具查询预定义度量 `true_customer_cost` + 维度 `account_name` + 时间范围，SQL 缩短为 4 行；业务逻辑只在一处建模。

配套的元数据设计让 LLM 能正确消费语义层：每个度量带 **ID / Display Name / Comment（口径说明）/ Synonyms**。其中 Synonyms 被复用为 key:value 对，向 Agent 发送附加元数据。

这一模式与 [Amazon Quick + AgentCore FinOps 助手](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-bedrock-agentcore-finops-chat.md)（BI 平台内置语义层）同族，但 nOps 的贡献是把「度量口径预建模 + LLM 元数据契约」作为 Agent 工具层设计的通用原则——任何数据分析 Agent 都可以用「预建模度量 + 注释/Synonyms 元数据」替代「工具内嵌业务逻辑」。

## 单 Agent 直连工具优于多 Agent 路由

Clara 采用**单 Strands Agent + 直接工具访问**（canvas 操作、查询执行、数据源发现、工作流编排），明确拒绝多 Agent 路由器架构：

> 单 Agent 架构避免了 agent-to-agent 交接的延迟与错误传播开销，同时保持工具分发的确定性。

这与 [FinOps+DevOps 双 Agent 协作](https://github.com/QianJinGuo/wiki-public/blob/main/entities/finops-devops-dual-agent-cost-optimization.md)（结构化交接协议）形成对照：当任务边界清晰、工具集可枚举时，单 Agent 直连的工具分发确定性 > 多 Agent 分工的模块化收益。该 tradeoff 与 多 Agent 编排 的通用讨论互补。

## 流式响应合并层

Vercel/Next.js BFF 与 AgentCore 之间有一层自定义 merge layer，一次性处理三个关注点：

1. **Heartbeats**：长工具执行期间保持连接存活
2. **词边界感知的文本缓冲**：把小模型 delta 合并为可读块，防止 UI 闪烁
3. **Widget-poll worker**：把实时 canvas 更新事件交织进同一 SSE 流

这是流式 Agent UX 的工程细节集合，可迁移到任何 SSE/WebSocket 推送的 Agent 前端。

## 记忆与多租户隔离

- **记忆三策略**：语义事实（组织上下文：账户结构/成本分配约定）、用户偏好（布局/默认聚合/图表类型）、canvas 摘要（跨会话保留分析线索）。会话按 canvas 而非 HTTP session 划分，刷新/重连后上下文不丢。
- **隔离两层**：[AgentCore Gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-gateway-mcp-extension.md) 侧的 Guardrails 作为独立 pre-check（跨租户数据访问策略 + prompt 攻击检测），输出侧再有一层租户策略清洗（脱敏内部标识符）。

## 深度分析

### 语义层胜出的本质：把 Agent 正确性问题转化为数据治理问题

正确率从 ~65% 升至 81.7%、工具失败率从 7.49% 降至 0.92%，这两个数字的真实驱动力不是换模型，而是业务口径的建模位置变了。Raw SQL MCP 方式下，EDP 折扣、PPA 信用、RI/SP 摊销逻辑散落在每个工具实现里，任何使用点都可能漂移；Metric View 方式把 `true_customer_cost` 只建模一次，Agent 查询的是治理过的度量而非自行拼装的业务逻辑。 这本质上是把「LLM 是否算对了成本」这个不可控问题，替换成「数据团队是否建模对了成本」这个可用传统数据测试覆盖的问题。与 [Lyft 度量语义层治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md) 同源：语义层首先是治理工具，Agent 只是新增的一类消费者，且是受益最大的一类——因为对话式查询没有仪表盘那种「口径错了会被肉眼发现」的反馈回路。

一个容易被忽略的细节是 Synonyms 的复用：语义层标准尚无 LLM 原生元数据字段，nOps 把 synonyms 挪用为 key:value 对向前端发送附加元数据。 ID / Display Name / Comment / Synonyms 四件套实际上是度量层向 Agent 暴露的「工具描述」，地位与 MCP 的 tool description 等价——但靠借用既有字段实现，说明「面向 LLM 的 schema 设计」仍处于权宜阶段。

### 单 Agent 抉择的适用条件，而非普适结论

「单 Agent 直连优于多 Agent 路由」的论证前提值得拆开：Clara 的工具集可枚举（canvas 操作、查询执行、数据源发现、工作流编排四类），任务边界清晰且不需要领域分工，此时 agent-to-agent 交接只有延迟与错误传播成本而没有收益。 但这与 [FinOps+DevOps 双 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/finops-devops-dual-agent-cost-optimization.md) 并不矛盾——当两个角色各自沉淀了不同的上下文与工具生态时，交接协议才有价值。判断变量是「工具集是否可枚举 + 是否需要异构领域上下文」，而非 Agent 数量本身。此外，去掉 LangChain/LangGraph 编排层后由 AgentCore runtime 接管路由与可观测性，说明单 Agent 路线的隐性前提是有一个足够厚的托管运行时替你承担编排职责。

### 流式合并层：Agent UX 中无法外包给平台的部分

Heartbeat 保活、词边界感知缓冲、widget-poll 交织三类关注点被一个自定义 merge layer 一次性处理，这个设计的深层含义是：AgentCore 解决了运行时与编排，但没有解决「模型 token 流到产品 UI 流」之间的转换——这段胶水永远是应用方的责任。 三类关注点恰好对应流式 Agent UX 的三个不变量：连接生命周期（长工具执行不能断）、渲染节奏（小 delta 合块防闪烁）、多通道复用（文本流与画布事件共用一条 SSE）。可迁移的不是代码而是这个分类法：任何 SSE/WebSocket Agent 前端都会重新遇到这三类问题。

### 迁移收益的归因与「Agent 与人同构」原则

75% 提速（10-12 个月 → 4 个月）与正确率提升是三重变更同时发生的结果：自建 EKS 换托管运行时、API 包装换语义层、编排框架换 Strands 直连。 拆分归因看，提速主要来自删掉维护面（LangGraph/LangChain + 多层编排），正确率主要来自语义层，工具失败率下降则来自 AgentCore 的新工具调用方式——三者机制不同，笼统归功于「迁移到 AgentCore」会误导架构决策。真正具有架构含金量的是一条产品原则：**用户可手动调用 Clara 通过 Strands 工具调用的同一批工作流**——Agent 不是平行于产品的另一套逻辑，而是产品既有流程的自动化入口。 这个约束反过来保证了工具面与产品能力不漂移，也解释了为什么语义层（而非私有 API）是正确的数据契约：人和 Agent 消费同一套度量定义。

**关键要点**：

1. 语义层的本质收益是把 LLM 正确性问题还原为可测试的数据治理问题；Synonyms 挪用暴露了 LLM 原生 schema 元数据的缺位。
2. 单 Agent vs 多 Agent 的判断变量是工具集可枚举性与领域上下文异构性，且单 Agent 路线隐含依赖一个厚托管运行时。
3. 流式合并层对应三个 UX 不变量（连接保活 / 渲染合块 / 多通道复用），是平台不覆盖、应用方必然自建的部分。
4. 75% 提速与正确率提升各有独立机制（删维护面 / 语义层 / 新工具调用），不可笼统归因。
5. 「Agent 调用与人类相同的底层工作流」是防工具面漂移的架构约束，也是语义层优于私有 API 的根本理由。

## 与既有实体的关系

| 实体 | 角度 | 与本文差异 |
|------|------|-----------|
| [Amazon Quick FinOps 助手](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-bedrock-agentcore-finops-chat.md) | BI 平台对话 | 本文是语义层作为 Agent 工具契约，非平台功能 |
| [FinOps+DevOps 双 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/finops-devops-dual-agent-cost-optimization.md) | 多 Agent 交接协议 | 本文论证单 Agent 直连的确定性优势 |
| [AgentCore Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md) | 托管 Agent 运行时 | 本文提供 AgentCore 落地案例与架构决策 |

## 边界与局限

- 迁移前后非严格对照（EKS 自建 → 托管 + 语义层同时变更），75% 提速的归因不纯
- 度量指标为 nOps 自报，无独立 benchmark
- 平台绑定部分（AgentCore memory/Guardrails 具体配置）不可迁移，可迁移的是语义层契约、单 Agent tradeoff、流式合并层三个抽象

---

