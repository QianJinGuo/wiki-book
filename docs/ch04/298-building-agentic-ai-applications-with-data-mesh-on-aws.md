# Building Agentic AI Applications with Data Mesh on AWS

## Ch04.298 Building Agentic AI Applications with Data Mesh on AWS

> 📊 Level ⭐⭐ | 8.3KB | `entities/agentic-ai-data-mesh-aws-s3-vectors-mcp.md`

# Building Agentic AI Applications with Data Mesh on AWS

## 摘要

AWS 官方博客展示了如何在现代 data mesh 架构上构建受治理的 agentic AI 应用。核心创新有三点：用 Amazon S3 Vectors 替代 OpenSearch Serverless 作为知识库（成本降低 90%）；用 S3 Tables（内置 Apache Iceberg）替代通用 S3 作为结构化数据存储（TPS 提升 10 倍）；通过 AgentCore Gateway 将 data mesh 暴露为 MCP 工具，实现确定性的 agent-to-data 访问控制。文章以客服场景为例，展示了从工具发现到查询执行到响应合成的全链路治理。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/building-agentic-ai-applications-with-a-modern-data-mesh-str.md)

## 核心要点

### Agentic AI 为何需要新的治理模型

RAG 架构在单一检查点执行治理：metadata-filtered vector retrieval。但 Agentic AI 引入了五步链路：

1. 发现哪些表存在（schema discovery）
2. 理解表结构（schema understanding）
3. 构造 SQL 查询（query construction）
4. 从向量库检索（vector retrieval）
5. 合成结果（response synthesis）

每一步都需要独立的授权决策。单点 metadata filter 无法治理这条链路。向量数据库的权限同步是周期性的，撤销不会立即生效——当 agent 自主操作数据时，这是不可接受的差距。

### 四层架构

```
┌─────────────────────────────────────────────┐
│  Agent Layer (AgentCore Runtime + LangGraph) │
│  - 隔离 microVM 环境，会话隔离              │
├─────────────────────────────────────────────┤
│  Gateway Layer (AgentCore Gateway)           │
│  - Request Interceptor: JWT 验证 + scope    │
│  - Response Interceptor: 工具过滤 + 数据脱敏 │
│  - AgentCore Policy: Bedrock Guardrails      │
├─────────────────────────────────────────────┤
│  Tools Layer (4 Lambda MCP Tools)            │
│  - get_user_tables / get_schema              │
│  - run_query / kb_search                     │
├─────────────────────────────────────────────┤
│  Governed Data Mesh                          │
│  - S3 Tables (Iceberg) + Athena              │
│  - Lake Formation (row/column/cell security) │
│  - S3 Vectors (知识库)                       │
└─────────────────────────────────────────────┘
```

## 深度分析

### S3 Vectors：成本优化的向量存储

Amazon S3 Vectors 是完全无服务器的原生向量存储，关键特性：

- **容量**：每个索引支持最多 20 亿向量
- **强写一致性**：新添加的向量立即可查询
- **元数据过滤**：支持 string/number/boolean/list 类型，操作符包括 `$eq`、`$ne`、`$gt`、`$in`、`$and`、`$or`
- **成本**：在中等查询频率工作负载下，比专用向量数据库方案降低高达 90%

对于高 QPS（需要个位数毫秒延迟）的工作负载，Amazon OpenSearch Serverless 仍是更好的选择。AWS 提供从 S3 Vectors 到 OpenSearch Serverless 的单步导出。

在客服场景中，文档存储带有 `product_category` 和 `document_type` 等可过滤元数据，支持定向语义搜索。

### S3 Tables + Apache Iceberg

S3 Tables 是首个内置 Apache Iceberg 支持的云对象存储：

- **TPS 提升**：比自管理 Iceberg 表高 10 倍
- **自动管理**：compaction、snapshot 管理、未引用文件清理
- **集成**：通过 SageMaker Lakehouse 填充 AWS Glue Data Catalog
- **安全**：Lake Formation 行级、列级、单元格级安全

三个数据产品（`customer_orders`、`customer_profiles`、`interaction_history`）通过 Athena 可查询，由 Lake Formation 权限治理。

### Lake Formation 细粒度安全

五级安全粒度：

| 级别 | 机制 | 示例 |
|------|------|------|
| Database | 数据库级权限 | 只能访问客服数据库 |
| Table | 表级权限 | 只能查询 orders 表 |
| Column | 列级安全 | 隐藏 `payment_method`、`billing_address` |
| Row | 行级过滤 | `customer_id = :customer_id` 限制为当前客户 |
| Cell | 单元格级 | LF-TBAC 标签控制 |

行级安全通过 data filter 实现：无论 agent 如何构造 SQL，`run_query` Lambda 注入认证客户的身份作为 session parameter，Lake Formation 行过滤器自动限制结果。

### AgentCore Gateway 拦截器模式

Gateway 拦截器是自定义 Lambda 函数，在请求-响应生命周期的两个阶段执行：

| 模式 | 解决的问题 | 实现方式 |
|------|-----------|---------|
| JWT scope 工具调用控制 | 未授权工具访问 | Request interceptor 解码 JWT scope 并阻止 |
| 动态工具过滤 | 工具发现泄露 | Response interceptor 按 scope 过滤工具列表 |
| Act-on-behalf 身份传播 | 权限提升/混淆代理 | 每个 hop 接收独立的 scope-down token |

关键设计：授权检查是确定性的（在 tool invocation boundary 执行），不依赖模型行为。这与 agent 的 SQL 构造（依赖模型行为）形成互补——Athena byte-scan 限制、只读 IAM 策略、Lake Formation 行过滤器作为补偿控制。

### 五层查询治理

1. **Athena 工作组成本控制**：`BytesScannedCutoffPerQuery` 限制，超限自动取消
2. **DDL 防护**：只读 IAM 策略显式拒绝 mutating Glue 操作
3. **Lake Formation 细粒度访问**：五级粒度，跨 Athena/Redshift/Glue/EMR 生效
4. **Gateway 拦截器**：JWT scope 授权 + 工具过滤 + 数据脱敏
5. **Bedrock Guardrails**：通过 AgentCore Policy 在 Gateway 层实时评估 prompt injection、有害内容、敏感信息暴露

### Gateway 层 Guardrails vs 模型推理层 Guardrails

在 RAG 架构中，仅在模型推理边界应用 Guardrails 是足够的——数据交互遵循单一的 retrieve-then-generate 模式。但在 agentic 架构中，agent 自主调用多个工具、构造查询、跨多个 hop 合成结果。仅评估最终模型输出无法防止恶意输入到达工具调用——tool response 中的 prompt injection 可能在模型产生最终答案之前就影响后续工具调用。

Gateway 层 Guardrails 在每个 agent-to-tool 交互处实时评估，提供 action point 的防御而非仅 output point。

## 实践启示

1. **Data Mesh + Agentic AI 是天然组合**：data mesh 的域所有权 + 集中治理模型，恰好匹配 agentic AI 的多源数据访问需求
2. **确定性治理优先**：在 tool invocation boundary 执行确定性授权，不依赖模型的"合作"
3. **S3 Vectors 的成本优势**：对于中等 QPS 的知识库场景，S3 Vectors 是 OpenSearch Serverless 的有力替代
4. **防御纵深**：五层治理（Athena + DDL + LF + Gateway + Guardrails）确保单点失败不会暴露未授权数据
5. **MCP 作为数据网格暴露层**：AgentCore Gateway 将 data mesh 标准化为 MCP 工具，agent 通过统一协议访问受治理数据

## 相关实体

- [Agentic Overlays](ch04/503-agent.md) — 另一种 agent 化路径：REST 服务的 A2A overlay
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent 约束与验证框架
- [Agent Harnesses Are Dead](ch04/513-agent-harnesses-are-dead-long-live-agent-harnesses.md) — Agent Harness 架构演进

---

