# Extending MCP support for Amazon Bedrock AgentCore Gateway

## Ch11.153 Extending MCP support for Amazon Bedrock AgentCore Gateway

> 📊 Level ⭐⭐ | 7.4KB | `entities/extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md`

# Extending MCP support for Amazon Bedrock AgentCore Gateway

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md)

## 摘要

Amazon Bedrock AgentCore Gateway 是 MCP 服务器与客户端之间的集中网关，统一管理凭证、可观测性和安全连接。本文覆盖其新扩展能力：MCP tool schema 扩展支持、MCP prompts 和 resources 作为一等原语、动态列表运行时发现、Streamable HTTP 流式传输、会话管理、elicitation 中途输入请求、以及 OAuth 2.0 on-behalf-of token exchange 委托认证。

## 核心要点

### 为什么需要 AgentCore Gateway

没有集中网关时，每个 MCP 服务器都必须独立处理凭证、策略执行、私有连接和日志。法务团队的合同审查 MCP 服务器、财务团队的数据检索 MCP 服务器、运维团队的事件响应 MCP 服务器各自承担相同的基础设施负担。安全团队逐个审查，开发者等待审批，没有人有统一的 MCP 基础设施使用视图。

AgentCore Gateway 通过建立单一入口点解决这个问题，聚合多种目标类型：MCP 服务器、REST API、AWS Lambda 函数等。资源策略（RBP）控制谁能调用 Gateway，服务控制策略（SCP）治理 Gateway 在 AWS 组织内的维护方式。

### 三大 MCP 原语统一

AgentCore Gateway 成为单一 MCP 端点，聚合组织内所有 MCP 服务器的能力。客户端看到统一的工具目录、提示词库和资源命名空间，而非 20 个独立连接。

支持的 MCP 方法：
- `tools/list`、`tools/call` — 工具发现与调用
- `prompts/list`、`prompts/get` — 提示词发现与获取
- `resources/list`、`resources/read`、`resources/templates/list` — 资源发现与读取

工具定义支持 `outputSchema`（输出结构）和 `annotations`（行为属性，如只读或破坏性）。工具和提示词以 `targetName___` 前缀返回，资源 URI 则透传原始值。当多个目标暴露相同资源 URI 时，通过 `resourcePriority`（1-1000）解决冲突。

### 动态列表（Dynamic Listing）

两种列表模式适应不同场景：

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| **Default** | Gateway 在 Create/Update 时发现并缓存，list 调用从缓存返回 | 标准部署，工具集稳定 |
| **Dynamic** | list 调用实时转发到 MCP 服务器，用调用者身份执行 | 权限感知服务器、多租户 |

Dynamic listing 保留服务端访问控制：权限感知服务器可以只为经理暴露 `approve_expense`，多租户服务器只为医疗客户展示 HIPAA 合规工具。两种模式都支持通过 AgentCore Policy 或 Lambda 响应拦截器集中执行策略。

## 深度分析

### 流式传输、会话管理与 Elicitation

这三个能力共同支撑有状态、实时、人在回路的交互：

**Streamable HTTP**：客户端发送 `Accept: application/json, text/event-stream` 时，Gateway 打开 SSE 流实时转发进度通知、日志消息和最终工具结果。仅发送 `Accept: application/json` 的客户端继续收到单一 JSON 响应，完全向后兼容。中间流错误以 JSON-RPC 错误对象在 SSE 帧内传递，而非 HTTP 状态码。

**Session Management**：Gateway 在首次 initialize 请求时生成 `Mcp-Session-Id`，后续请求携带此 header。会话范围限定于已认证用户（从 OAuth JWT 或 IAM 凭证派生），防止会话劫持。Gateway 在持久化存储中持久化会话 ID，首次工具调用时初始化到目标的连接并复用，避免重复初始化开销。会话超时可配置 15 分钟到 8 小时（默认 1 小时）。

**Elicitation**：MCP 服务器可以暂停执行并向终端用户请求输入。三种模式：
- **Form mode**：服务器发送 JSON Schema，客户端渲染表单
- **URL mode**：服务器发送 URL（如 OAuth 同意屏幕），客户端打开供用户操作
- **URL exception mode**：服务器返回 `URLElicitationRequiredError` 包含 URL，提示客户端重定向用户后重试

Elicitation 需要同时启用流式传输和会话管理。Gateway 尊重能力协商——只在连接客户端声明支持 elicitation 时才向下游 MCP 服务器声明支持。

### OAuth 2.0 On-Behalf-Of Token Exchange

当 Agent 需要代表已认证用户访问下游资源时，Gateway 通过 AgentCore Identity 支持 OAuth 2.0 OBO token exchange：

1. MCP 客户端用 JWT A（`aud: gw`）认证到 Gateway
2. Gateway 调用下游 MCP 服务器时，通过 AgentCore Identity 将 JWT A 换为 JWT B（`aud: mcp`）
3. MCP 服务器调用更下游 API 时，用 `GetResourceOAuth2Token` 获取 JWT C（`aud: api`）

每一跳都保留原始用户身份（`sub: X`），下游服务可以执行细粒度的每用户授权，无需触发额外的同意流程。AgentCore Identity 作为中央 token broker，提供安全的 token vault 和工作负载身份（AWS workload identity），支持 RFC 8693 标准 token exchange 或 RFC 7523 JWT 授权授权。

### 安全架构

多层安全保障：
- **网络隔离**：支持 AWS PrivateLink（控制面和数据面），流量保持在 VPC 边界内
- **拦截器（Interceptor）**：Lambda 函数可自定义请求/响应，实现细粒度访问控制、数据清洗、自定义授权逻辑
- **AgentCore Policy（Preview）**：围绕工具定义的 agentic guardrails，在集中平面提供确定性策略执行
- **集中日志**：应用日志和身份日志帮助管理审计和合规要求

## 实践启示

1. **集中网关是企业 MCP 部署的基础设施**：避免每个 MCP 服务器独立处理凭证、策略、日志的 N² 复杂度
2. **Dynamic listing 保留服务端权限控制**：多租户场景下，工具可见性应由服务端身份决定，而非网关缓存
3. **Elicitation 是人在回路的关键能力**：高风险操作需要暂停-确认-继续的工作流，Gateway 原生支持避免自建
4. **OBO token exchange 实现零信任**：每一跳都保留原始用户身份，避免共享服务账户凭证
5. **增量采用无需改造**：现有 AgentCore Gateway 和目标配置无需更改即可启用新能力

## 相关实体

- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/150-ai.md)
- [Bedrock Agentcore Secrets Manager Identity](ch03/044-agent.md)
- [Shared Infrastructure Isolated Tenants Pool Model Multi Tenancy With Amazon Bedrock Agentcore](ch03/044-agent.md)
- [Secure Ai Agents With Policy And Lambda Interceptors In Amaz](ch11/243-secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.md)
- [New In Amazon Bedrock Agentcore Build Agents With Broader Kn](ch03/044-agent.md)
- [Extending Mcp Support For Amazon Bedrock Agentcore Gateway](ch11/014-extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md)

---

