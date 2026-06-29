# Building a secure auth code flow setup using AgentCore Gateway with MCP clients

## Ch04.255 Building a secure auth code flow setup using AgentCore Gateway with MCP clients

> 📊 Level ⭐⭐ | 9.5KB | `entities/building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md`

## Building a secure auth code flow setup using AgentCore Gateway with MCP clients

> **Background**: 本文基于 AWS Machine Learning Blog 官方教程，详细介绍 OAuth 2.0 Authorization Code Flow 在 Bedrock AgentCore Gateway 与 MCP 客户端集成中的实施配置。内容涵盖架构概述、组件说明、IdP 配置步骤、以及 Kiro IDE 集成。

## 核心内容

文章系统讲解了如何使用 OAuth 2.0 授权码流程为托管在 Amazon Bedrock AgentCore Gateway 上的 MCP 服务器实现入站认证。主要包括：

- **认证流程原理**：AgentCore Gateway 作为 MCP 资源服务器，在允许 AI 客户端访问工具前验证身份令牌
- **关键组件**：身份提供商 (IdP)、用户、Amazon Bedrock AgentCore Gateway、AI 编程助手 (Kiro IDE)、MCP 服务器、选项 MCP OAuth 代理
- **实施步骤**：IdP 配置、Gateway 入站认证设置、Kiro IDE 客户端集成
- **最佳实践**：生产环境中每个 AI 助手请求都经过用户身份令牌验证

## 技术要点

1. **OAuth Code Flow**：标准的 OAuth 2.0 授权码流程，用于安全的用户身份验证
2. **AgentCore Gateway**：Bedrock AgentCore 的集中入口点，负责路由和保护 Agent 到工具的通信
3. **MCP (Model Context Protocol)**：AI 助手与远程工具/服务交互的协议
4. **身份提供商**：支持 Okta、Microsoft Entra ID、Amazon Cognito 等主流 IdP

## 深度分析

### 1. AgentCore Gateway 的双角色：OAuth 资源服务器与 MCP 代理

AgentCore Gateway 在整个认证架构中扮演着两个关键角色，这是理解整个安全模型的基础。从 OAuth 2.0 视角看，Gateway 是一个「受保护资源服务器」（Protected Resource Server），它不发放令牌，只验证令牌；当 MCP 客户端的请求缺少有效令牌时，Gateway 通过 HTTP 401 响应中的 `www-authenticate` 头指向 `.well-known/oauth-protected-resource` 端点，触发 MCP 规范中的 Protected Resource Metadata (PRM) 模式。从 MCP 协议视角看，Gateway 又是所有 MCP 请求的统一入口，所有通往 MCP 服务器的流量都必须经过 Gateway 的路由和验证层。这意味着 Gateway 实际上是整个安全防线的守门人——无论 AI 客户端通过何种 OAuth 流程获取令牌，最终都必须在 Gateway 层接受标准化验证。

### 2. PKCE 与无密钥客户端设计的安全意义

文章特别强调此流程**不需要客户端密钥**（No client secret required），这并非安全妥协，而是 OAuth 2.0 针对公共客户端（Public Client）的标准最佳实践。Kiro IDE 作为桌面应用，运行在用户终端，其代码和配置无法保密，任何嵌入的客户端密钥都会被逆向工程提取。PKCE（Proof Key for Code Exchange）通过动态生成的 `code_verifier` 和 `code_challenge` 替代静态密钥，有效防止授权码拦截攻击（Authorization Code Interception Attack）。即使攻击者截获了授权码，由于不知道 PKCE verifier，也无法完成令牌交换。这一设计使得整个认证链路即使在不可信的终端环境中也能保持安全，体现了「将密钥逐出客户端」的核心安全原则。

### 3. 令牌验证的灵活性与 Gateway 的 IdP 中立性

Gateway 的令牌验证设计具有显著的架构灵活性。文档明确指出 Gateway 对令牌的获取方式是「中立」的——无论是授权码流程、客户端凭证流还是其他 OAuth 授权类型，只要令牌能通过配置时设定的验证规则，Gateway 就予以放行。验证规则包括：签名验证（通过 IdP 的公钥）、过期时间检查、签发者（iss）匹配、以及可选的自定义声明验证（custom claim validation）。这种设计允许企业在不修改 Gateway 配置的情况下更换 IdP——只需在 IdP 端重新配置应用，Gateway 的 discovery URL 指向新的 IdP 即可。此外，自定义 claim 验证机制（如 `cid EQUALS 0oaz7147z771FZmdQ697`）允许 Gateway 兼容使用不同声明名称的 IdP（如 Okta 使用 `cid`，而标准 OAuth 使用 `client_id`），大大增强了跨 IdP 的互操作性。

### 4. 刷新令牌的生命周期管理

文章详细规定了令牌生命周期：访问令牌 1 小时、刷新令牌 90 天、ID 令牌 1 小时。这一配置体现了安全与可用性的平衡。短生命周期的访问令牌限制了被盗后的窗口期；90 天的刷新令牌则避免了用户频繁重新认证的体验问题。但 90 天也带来了 Token 轮换管理的复杂性——文章在清理步骤中特别提到了令牌撤销（Token Revocation）流程，说明在实际生产中必须建立刷新令牌的撤销机制，以支持用户主动注销、员工离职等场景。值得注意的是，不同 IdP 的令牌撤销行为存在差异（级联效应、接受的令牌类型等），文章对此也进行了提示。

### 5. MCP OAuth Proxy 的桥接作用与实验性质

文章引入 `mcp-remote` 作为 MCP OAuth Proxy 来桥接 Kiro IDE 客户端与 Gateway 的 OAuth 保护端点。这个代理层的存在揭示了当前 MCP 生态的一个现实：MCP 规范本身仍在演进，客户端/IdP/服务器之间的 OAuth 集成尚未完全标准化。MCP OAuth Proxy 提供了临时性的标准化层，使得不符合原生 OAuth 的 MCP 客户端也能完成授权码流程。文章明确指出 `mcp-remote` 是一个「工作概念验证」（working proof-of-concept），应被视为实验性的。这意味着在生产部署时需要评估这一依赖项的风险——它是否受信任、维护状态如何、是否有替代方案。随着 MCP 规范的成熟，这一桥接层的角色可能会被规范本身吸收或标准化。

## 实践启示

1. **优先使用授权码 + PKCE 而非客户端密钥**：在为 AI 助手类客户端设计 OAuth 集成时，应避免在客户端嵌入任何形式的密钥。授权码 + PKCE 流程是桌面/移动等不可信环境的标准最佳实践，即使攻击者能够截获授权码，没有 PKCE verifier 也无法完成令牌窃取。

2. **配置 IdP 时同时启用授权码和刷新令牌授予**：刷新令牌是维持长时间会话的关键——访问令牌生命周期短（1小时），若没有刷新令牌，用户需要每小时重新认证一次。刷新令牌生命周期可根据安全需求调整（建议 7-30 天，企业高安全场景可缩短），但不宜过长以避免令牌长期泄露的风险。

3. **通过 discovery URL 实现 IdP 的可替换性**：在 Gateway 配置中使用 IdP 的 OIDC discovery endpoint（如 `/.well-known/openid-configuration`）而非硬编码具体 API 端点，可为未来的 IdP 切换提供灵活性。当企业需要更换 IdP 时，只需更新 discovery URL，其余 Gateway 配置保持不变。

4. **建立令牌撤销（Token Revocation）流程**：在生产环境中，必须实现刷新令牌的主动撤销能力，以支持用户主动注销、管理员远程注销、设备丢失等场景。清理步骤中 `curl -X POST "<idp-revocation-endpoint>"` 的模式应被纳入标准化运维流程，而不仅仅作为测试后的清理操作。

5. **验证 Gateway 认证配置后立即测试端到端流程**：文章提供的 `curl` 测试命令（POST 无令牌到 `/mcp` 端点，期望 401）是验证 Gateway 认证是否正确生效的关键一步。这个测试应在配置 IdP 和 Gateway 后、生产部署前执行，以确保认证防线在请求到达 MCP 服务器之前就已生效，避免未授权请求穿透到后端工具层。

## 相关实体
- [Amazon Bedrock Agentcore Gateway Mcp Extension](/ch11-014-extending-mcp-support-for-amazon-bedrock-agentcore-gateway/)
- [Spec Review Agent Baz Bedrock Agentcore Multi Agent](/ch04-217-spec-review-agent-multi-agent-code-to-product-validation-wi/)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](/ch04-285-自己的工具自己控-mcp-server-amazon-bedrock-agentcore-quick-suite集成指南/)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](/ch03-066-building-multi-tenant-agents-with-amazon-bedrock-agentcore/)
- [Amazon Bedrock Agentic Payments Guardrails](/ch04-059-enable-safe-agentic-payments-with-built-in-guardrails-using/)

- MOC
## 相关主题

- Amazon Bedrock AgentCore
- Model Context Protocol (MCP)
- OAuth 2.0 授权码流程
- AWS 安全最佳实践

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)

---

