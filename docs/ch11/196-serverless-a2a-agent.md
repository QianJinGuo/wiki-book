# 构建 Serverless A2A 网关：Agent 发现、路由与访问控制

## Ch11.196 构建 Serverless A2A 网关：Agent 发现、路由与访问控制

> 📊 Level ⭐⭐ | 5.9KB | `entities/building-serverless-a2a-gateway-agent-discovery-routing-access-control.md`

# 构建 Serverless A2A 网关：Agent 发现、路由与访问控制

> 本文基于 AWS Machine Learning Blog 的技术文章整理。原文介绍了如何在 AWS 上构建一个 serverless 的 Agent-to-Agent (A2A) 网关，实现 agent 的注册、发现、路由和访问控制，支持异构环境（AWS、非 AWS 云、混合环境）下的 agent 互联。

## 背景与问题

企业在多个团队、供应商和基础设施上部署 AI agent 后，agent 间的通信管理成为越来越大的运维负担。如果没有中心化的通信层，每个新 agent 的集成都需要：

- **点对点连接**：20 个 agent 最多需 190 个点对点连接（20×19/2）
- **独立凭据**：每个 agent 需要独立的认证配置
- **自定义路由逻辑**：每次集成都要写特殊的转发逻辑
- **分散的访问控制**：没有统一的地方来控制哪个 client 可以访问哪个 agent

结果是：新 agent 工作流上线慢、安全风险高、运维开销随 agent 数量平方增长。

网关模式通过在 agent 前面放置单一入口点来解决这个问题，无论 agent 运行在 [ECS](../ch04/236-agentic.html)、[Lambda](../ch04/403-agentrun.html)、Bedrock AgentCore Runtime、非 AWS 云还是混合环境。

## 三层架构

网关设计分为三个逻辑层：

### 管理层（Management Layer）

中心化的 agent 注册中心，支持发现和语义搜索：

- **Agent Registry**：DynamoDB 表存储 agent ID → 后端 URL、认证配置、缓存的 agent card
- **语义搜索**：用 Amazon Titan Text Embeddings 对 agent 描述做 embedding，存入 S3 Vectors，支持自然语言查找
- **Agent Card 缓存**：URL 重写为指向网关，client 不用知道后端 URL

### 控制层（Control Layer）

基于 JWT scope 的细粒度访问控制：

- **Lambda Authorizer**：验证 JWT，查 Permissions 表确定 scope→agent 映射，生成 IAM policy
- **速率限制**：DynamoDB 原子计数器，per-user per-agent，TTL 自动过期。超限返回 429 + Retry-After header
- **权限集中管理**：修改 Permissions 表即可，无需改每个 agent

### 执行层（Execution Layer）

单一域名的请求路由：

- **API Gateway (REST API)**：单一入口，支持 SSE streaming
- **Proxy Lambda**：OAuth 后端认证，从 Secrets Manager 获取凭据，透明转发
- **路径路由**：`/agents/{agentId}` 格式，A2A 协议原生兼容

## A2A 协议端点

网关支持 A2A 协议规范中的两种 binding：

**A2A Native 端点**（JSON-RPC）：
- `GET /agents/{agentId}/.well-known/agent-card.json` — 获取 agent 能力
- `POST /agents/{agentId}` — 发送消息（buffered response）
- `POST /agents/{agentId}` with `SendStreamingMessage` — SSE 流式响应

**网关管理端点**：
- `GET /agents` — 列出可访问的 agent
- `POST /search` — 语义搜索 agent
- `POST /admin/agents/register` — 注册新 agent
- `POST /admin/agents/{agentId}/sync` — 刷新 agent card 缓存
- `POST /admin/agents/{agentId}/status` — 激活/停用 agent

## 安全考量

### 后端信任模型

网关采用"认证后信任"模型。agent 注册并验证 OAuth 凭据后，网关直接将响应代理给 client，不做内容审查。后端 agent 负责自身的 prompt injection 防护和输入验证。生产环境中需要实现 agent 注册审批工作流。

### Amazon Bedrock AgentCore 认证细节

配置 `customJWTAuthorizer` 时使用 `allowedClients`（验证 `client_id` claim）而非 `allowedAudience`（验证 `aud` claim）。Cognito M2M token 包含 `client_id` 但不包含 `aud`。

### 私有部署

支持 VPC 私有部署模式，Lambda 在私有子网中运行，API Gateway 使用私有端点。通过 AWS Direct Connect 或 Interconnect (preview) 可达，使网关可以管理跨环境的 agent。

## 部署

使用 Terraform 部署，代码在 `aws-samples/sample-a2a-gateway` GitHub 仓库。包含示例 agent（Weather Agent + Calculator Agent）用于测试。

```bash
git clone https://github.com/aws-samples/sample-a2a-gateway
cd sample-a2a-gateway
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
./scripts/build_lambda_package.sh
cd terraform && terraform apply
```

## 相关实体

- [Agentic Overlays：从 REST 到 A2A 的企业转型](../ch04/236-agentic.html) — REST → A2A 过渡的互补方案
- [Alibaba Cloud AgentRun 多 Agent A2A](../ch04/403-agentrun.html) — 不同云上的 A2A 实现
- [AWS/Cisco A2A 安全方案](../ch04/291-ai-agent.html) — A2A 安全治理生态
- [LangGraph A2A 对抗 Agent 团队](../ch04/199-langgraph.html) — A2A 协议的应用示例

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-serverless-a2a-gateway-agent-discovery-routing-access-control.md)

---

