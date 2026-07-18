# 用 Amazon Quick + Bedrock AgentCore 打造对话式 FinOps 助手

## Ch11.127 用 Amazon Quick + Bedrock AgentCore 打造对话式 FinOps 助手

> 📊 Level ⭐⭐ | 8.4KB | `entities/amazon-quick-bedrock-agentcore-finops-chat.md`

# 用 Amazon Quick + Bedrock AgentCore 打造对话式 FinOps 助手

> **Background**: AWS China 团队将开源的 Billing and Cost Management MCP Server 改造适配后，部署到 Amazon Bedrock AgentCore Runtime，通过 Cognito OAuth 2.0 保护，最终接入 Amazon Quick Chat Agent 让业务用户用中文对话式查询多账号 AWS 成本。

## 整体链路

```
业务用户在 Amazon Quick 中提问
    ↓
Quick Chat Agent 判断需要哪个 MCP 工具
    ↓
Quick 用 2LO OAuth client_credentials flow 向 Cognito 换 JWT
    ↓
携带 JWT 调 AgentCore Runtime 的 MCP 端点 (Streamable HTTP)
    ↓
AgentCore Runtime 用 Cognito Authorizer 校验 JWT
    ↓
容器内 Billing/Cost Management MCP Server 用 IAM Role 调
  - AWS Cost Explorer
  - AWS Budgets
  - AWS Compute Optimizer
  - AWS Cost Optimization Hub
    ↓
结果沿原路返回 Quick，由 Chat Agent 用中文呈现
```

## 三大组件

### 1. Amazon Quick Chat Agent（MCP 客户端）

- 服务认证 (2LO) 换 JWT
- 业务用户代理身份
- 自然语言 → MCP 工具调用

### 2. Amazon Bedrock AgentCore Runtime

- Serverless 容器托管 MCP Server
- 内置 OAuth 授权方 (Authorizer)
- ARM64 (Graviton) 运行
- 集成 AgentCore Memory / Observability

### 3. Amazon Cognito

- 颁发 JWT 给 Quick
- 验证 JWT 给 AgentCore
- 允许列表控制哪些 client_id 可以调用

## 跨账号模式

支持单 Chat Agent 查询多个 AWS 账号的账单数据，通过 AssumeRole 跨账户委托访问。

## 适用场景

- 业务用户自然语言查账单
- 跨账号成本归因
- 异常花费自动告警
- FinOps 团队减负（不再做 BI 报表）

## 待关注

- Bedrock AgentCore GA 后的 API 稳定性
- 多区域部署（北京/宁夏）账号体系协调
- Quick Chat Agent 上下文管理

## 相关实体
- [Mcp Serveramazon Bedrock Agentcorequick Suite](../ch04/531-amazon-bedrock-agentcore.html)
- [Amazon Bedrock Agentcore Gateway Mcp Extension](../ch04/531-amazon-bedrock-agentcore.html)
- [Bedrock Agentcore Coding Agent Hosting](ch11/050-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/531-amazon-bedrock-agentcore.html)
- [Aws 一周综述Amazon Bedrock Agentcore 付款适用于 Aws 的 Agent 工具套件等2026 年 5 月 11 日](../ch04/531-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-quick-bedrock-agentcore-finops-chat.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)
## 深度分析

### MCP协议架构：解耦与组合的灵活性

MCP协议的核心价值在于将工具定义与调用方分离。传统BI集成需要在QuickSight或Tableau中为每个数据源单独构建连接器，而MCP允许将任何支持Streamable HTTP的服务封装为可发现工具。 这种架构使得FinOps团队可以自主维护MCP Server，而无需依赖Quick的控制台更新周期。然而解耦也带来了版本同步问题——文章提到的"工具列表在首次注册后是静态的，更新MCP Server后需要重新创建集成"正是这一权衡的具体表现。 建议在MCP Server迭代时同步更新文档，记录每个版本暴露的25个Action及其变更内容。

### OAuth 2LO在M2M场景的安全边界

客户端凭证流（Client Credentials Flow）适用于机器到机器通信，但本文方案将其置于业务用户代理场景存在 Delegation 缺失。 Quick Chat Agent代表用户查询成本数据时，JWT中仅携带M2M客户端身份，无法携带业务用户的权限上下文。这意味着所有通过该M2M客户端的请求都拥有相同的账单数据访问权限，无法实现行级安全（Row-Level Security）。对于多部门共用同一MCP Server的场景，这意味着每个业务用户能看到所有账号的全量数据。在设计阶段应评估是否需要在MCP Server层面增加自定义权限过滤逻辑。

### 跨账号委托的最小权限设计

跨账号查询依赖AssumeRole机制，但文章中的策略设计值得商榷。 源账号执行角色持有 `sts:AssumeRole` 权限到目标账号的 `BillingMCPCrossAccountRole`，而目标角色附加的是与源账号相同的 `billing-mcp-policy.json`，这意味着目标账号授予的是对 Cost Explorer 等API的完全只读权限。在实际部署中，建议根据业务需求限制目标角色能查询的账号范围，例如使用条件键 `aws:SourceAccount` 限制只能从特定账号发起AssumeRole请求。 此外，管理账号（Management/Payer Account）不在 `LINKED_ACCOUNT` 维度中这一特性要求在LLM Prompt层面做特殊处理，文章通过Prompt引导和递归清理双重防御解决，但这种设计隐含了LLM理解跨账号架构的假设。

### Serverless容器化MCP的运维边界

AgentCore Runtime以ARM64（Graviton）方式运行容器，这一选择对MCP Server的兼容性提出要求。 上游MCP Server默认以root用户运行并创建本地文件（SQLite session、日志），适配版本需要添加 `/tmp` fallback逻辑。 在生产环境中，这意味着需要监控容器的存储使用情况，尤其是 session-sql 工具可能产生的临时数据库文件。容器冷启动时间（通常30-60秒）与MCP调用的超时限制（60秒）之间的关系也值得在压测阶段验证。

### 对话式FinOps的局限性边界

自然语言查询在FinOps场景有明确的适用范围。Cost Explorer的metrics参数需要从JSON字符串改为原生列表类型这一适配工作，揭示了LLM调用结构化API时的类型一致性挑战。 对于需要精确时间范围、维度过滤的查询，用户需要学会"提问语法"——例如明确指定"按服务分组"而非让LLM自行推断。此外，60秒的单次操作超时限制了复杂分析查询的执行，对于需要关联多个AWS服务数据的综合报告，建议预计算并存储结果供查询。

## 实践启示

### 1. 建立MCP Server版本管理与工具清单同步机制

由于Quick中工具列表注册后需要手动重建才能感知更新，建议在CI/CD流程中记录每次部署的工具变更内容，并自动触发Quick Connectors的重建流程。 可以通过调用 `listTools` API对比版本间的差异，生成变更报告后触发告警。

### 2. 设计Cognito M2M客户端密钥的轮换策略

M2M客户端密钥在创建时仅返回一次明文，后续无法恢复。 建议在初始部署时即将密钥存入 AWS Secrets Manager，并设置例行轮换计划。轮换时需要同步更新Quick Connector配置，并建议在低峰期操作以避免令牌失效影响业务用户。

### 3. 为跨账号场景制定标准化角色命名与信任策略

跨账号模式要求所有目标账号使用同名角色 `BillingMCPCrossAccountRole`。 在大规模多账号环境中，建议通过 AWS Organizations 的 SCP（Service Control Policy）强制执行角色命名规范，并限制 `sts:AssumeRole` 的目标账号范围。

### 4. 在Prompt层面加固跨账号查询的防御性编程

文章通过Prompt引导LLM不要在已指定 `target_account_id` 时额外添加 `LINKED_ACCOUNT` 过滤条件。 生产环境中建议增加代码层面的主动检查——当参数同时包含 `target_account_id` 和 `LINKED_ACCOUNT` 时，优先使用前者并在日志中记录异常模式，以便持续优化Prompt。

### 5. 规划对话式查询与预计算报表的混合架构

对于需要多维度关联分析的复杂场景，对话式查询受限于60秒超时和单次API调用。 建议将高频查询模式（月度汇总、成本趋势、异常告警）预计算为 Athena CUR 表或 QuickSight数据集，对话式接口仅用于探索性分析和即席问题，而周期性报告仍通过传统BI渠道分发。

---

