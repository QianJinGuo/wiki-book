# nOps FinOps Agent 架构：语义层驱动的数据分析 Agent 设计

> 📊 Level ⭐ | 6.0KB

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

