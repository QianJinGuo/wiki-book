# Extending MCP support for Amazon Bedrock AgentCore Gateway

## Ch11.013 Extending MCP support for Amazon Bedrock AgentCore Gateway

> 📊 Level ⭐⭐ | 25.3KB | `entities/amazon-bedrock-agentcore-gateway-mcp-extension.md`

# Extending MCP support for Amazon Bedrock AgentCore Gateway

## Unite MCP servers for enterprise through AgentCore Gateway

Without a centralized gateway, every MCP server that your organization builds must independently handle credentials, policy enforcement, private connectivity, and logging. This means that your legal team’s contract review MCP server, your finance team’s data retrieval MCP server, and your operations team’s incident response MCP server each carry the same infrastructure burden. Security teams review each server individually, developers wait for approvals, and nobody has a unified view of how MCP infrastructure is being used across the organization.

[AgentCore Gateway](<https://aws.amazon.com/blogs/machine-learning/transform-your-mcp-architecture-unite-mcp-servers-through-agentcore-gateway/>) helps avoid this duplication by establishing a single-entry point that MCP traffic flows through. The following diagram shows the main features for AgentCore Gateway that allow central governance and control.

Each team builds only the business logic for their MCP server. AgentCore Gateway handles everything else. It aggregates capabilities across different target types, including [MCP servers](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-target-MCPservers.html>), [REST APIs](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-schema-openapi.html>), [AWS Lambda](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-add-target-lambda.html>) functions, and [more](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-supported-targets.html>). [Resource-based policies (RBP)](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-based-policies.html>) control who can invoke AgentCore Gateway, for example, restricting invocation to an [Amazon Virtual Private Cloud (Amazon VPC)](<https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html>). [Service control policies (SCPs)](<https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>) govern how AgentCore Gateway is maintained within your AWS organization.

For network isolation, [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html>) supports [AWS PrivateLink](<https://aws.amazon.com/privatelink/>) for both control plane and data plane operations so that traffic stays within your Amazon VPC boundaries. You can also connect to private API endpoints or MCP servers through [managed VPC resource mode](<https://aws.amazon.com/blogs/machine-learning/configuring-amazon-bedrock-agentcore-gateway-for-secure-access-to-private-resources/>). Centralized [application](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-gateway-metrics.html>) and [identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability-identity-metrics.html>) logs help you manage audit and compliance requirements.

With [interceptor](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-interceptors.html>) capability, AWS Lambda functions can customize requests and responses, enabling fine-grained access control, sanitization, custom authorization logic, and [more](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-interceptors-examples.html>). Integration with [AgentCore Policy (Preview)](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>) provides agentic guardrails defined around your tools for deterministic policy enforcement at a centralized plane. AgentCore Gateway also helps facilitate the [OAuth 2.0 authorization code flow](<https://aws.amazon.com/blogs/machine-learning/connecting-mcp-servers-to-amazon-bedrock-agentcore-gateway-using-authorization-code-flow/>), where the agent authenticates on behalf of a user before invoking tools.

Now, you will walk through the new capabilities that we’re adding to AgentCore Gateway to further strengthen enterprise MCP support.

## Surface your MCP server primitives through a single gateway

AgentCore Gateway becomes a single MCP endpoint that aggregates capabilities from every MCP server in your organization. Clients see one unified tool catalog, one prompt library, and one resource namespace, not 20 separate connections to manage. Under the hood, AgentCore Gateway supports all three MCP primitives: tools, prompts, and resources. Tool definitions in MCP include an optional `outputSchema` for defining expected output structure and `annotations` describing behavioral properties such as whether a tool is read-only or destructive, alongside the standard `name`, `icons`, `description`, and `inputSchema`. The gateway also supports prompts, resources, and resource templates through their full set of MCP methods: `tools/list`, `tools/call`, `prompts/list`, `prompts/get`, `resources/list`, `resources/read`, and `resources/templates/list`. The following architecture diagram shows how AgentCore Gateway facilitates list and invoke calls.

In the default listing mode, AgentCore Gateway discovers and caches tools, prompts, and resources from connected MCP server targets. This cache is implicitly refreshed whenever you call [CreateGatewayTarget](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateGatewayTarget.html>) or [UpdateGatewayTarget](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_UpdateGatewayTarget.html>), and can be explicitly refreshed using the [SynchronizeGatewayTargets](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_SynchronizeGatewayTargets.html>) API. When clients make list calls such as `tools/list`, `prompts/list`, or `resources/list`, AgentCore Gateway returns the response directly from this cache without invoking the MCP server target. The actual interaction with the MCP server target only happens during invoke operations: `tools/call`, `prompts/get`, and `resources/read`. At that point AgentCore Gateway routes the request to the correct target.

Tools and prompts returned by AgentCore Gateway are prefixed with the target name using the format `targetName___`. Unlike tools and prompts, resource URIs are returned without a target name prefix; the original URI from the downstream MCP server is passed through. When creating an MCP server target that exposes resources, you can optionally specify a `resourcePriority` value (1–1000) to control how AgentCore Gateway resolves conflicts when multiple targets expose the same resource URI. If no priority is defined, a default value of 1000 is applied. When a conflict occurs, AgentCore Gateway returns the resource from the target with the lowest `resourcePriority` value. If two conflicting resources share the same priority, the resource from the target that was synchronized first is returned.

Because resource URIs are provided by the downstream MCP server target and aren’t validated or sanitized by AgentCore Gateway, take care with untrusted targets. A malicious or compromised MCP server could return URIs pointing to internal endpoints or local file system paths. Validate and sanitize resource URIs before following them, and don’t automatically fetch or render URIs from untrusted MCP server targets.

## Dynamic listing for runtime flexibility

Some MCP servers personalize their capabilities per user. A permissions-aware server might expose `approve_expense` only to managers, or a multi-tenant server might surface HIPAA-compliant tools only for healthcare customers. Dynamic listing lets you preserve that server-side access control while still routing through AgentCore Gateway.

When creating a target, you choose between two listing modes: _default_ and _dynamic_. In default listing mode, AgentCore Gateway invokes the MCP server during `CreateGatewayTarget` or `UpdateGatewayTarget` operations to discover and cache tools, prompts, and resources. This cache can be explicitly refreshed using the `SynchronizeGatewayTargets` API. When clients make list calls, AgentCore Gateway serves the response directly from this cache without contacting the backend server. In dynamic listing mode, AgentCore Gateway doesn’t invoke the MCP server during `CreateGatewayTarget` or `UpdateGatewayTarget` operations. Instead, list calls are forwarded live to the MCP server at request time, using the identity of the calling user. In both modes, invoke operations such as `tools/call`, `prompts/get`, and `resources/read` route directly to the MCP server target. The following architecture diagram illustrates how both modes work together.

MCP Server 1 is configured with dynamic listing mode, while MCP Server 2 and 3 use default listing mode. The AgentCore Gateway cache contains only the capabilities from the default mode servers. During list calls, the response is paginated; the cached and MCP Server 1 primitives are returned on different pages. Because the primitives aren’t indexed at AgentCore Gateway for dynamic listing targets, the [semantic tool search](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-using-mcp-semantic-search.html>) capability can’t be used.

This dual-mode architecture also gives you flexibility for multi-tenancy and fine-grained access control (FGAC). For both listing modes, you can enforce policies centrally using AgentCore Policy or AWS Lambda response interceptors to filter capabilities based on tenant identity. For example, you can restrict a tenant to only see read-only tools. For dynamic listing mode, you can manage access control directly at the MCP server itself, since list operations execute under the end user’s identity, and the MCP server target returns only the capabilities that user is authorized to access.

## Streaming, session management, and elicitation

Many enterprise MCP workflows go beyond straightforward request-response tool calls. An MCP server might need to stream progress updates while generating a report, pause mid-execution to ask a user for approval before performing a sensitive action, or maintain context across a multi-step conversation that spans several tool invocations. AgentCore Gateway supports Streamable HTTP transport, MCP session management, and elicitation, which enable stateful, real-time, human-in-the-loop interactions.

### Streamable HTTP

Without streaming, a tool call that takes 45 seconds returns nothing until completion, and the user stares at a spinner. With streaming, they see progress events in real time. When a client sends a `tools/call` request with `Accept: application/json, text/event-stream`, AgentCore Gateway opens an SSE stream and forwards events from the MCP server target in real time, including progress notifications, logging messages, and the final tool result. Clients that send only `Accept: application/json` continue to receive a single JSON response, preserving full backward compatibility.

When response streaming is enabled on AgentCore Gateway, the response interceptor behavior changes and must check the `isStreamingResponse` field in `gatewayResponse` to distinguish between streaming and non-streaming responses. The response interceptor is invoked for events that contain a JSON-RPC `id` field. The response interceptor isn’t invoked for `notifications/progress`, `notifications/message`, and `pings`. To enable streaming, set the `enableResponseStreaming` block during the `CreateGateway` or `UpdateGateway` API call.

    "protocolConfiguration": {
      "mcp": {
        "streamingConfiguration": {
          "enableResponseStreaming": true
        }
      }
    }

When thinking about streaming use cases with AgentCore Gateway, keep the following in mind. AgentCore Gateway determines the HTTP status code from the first event in the stream. If an error occurs mid-stream, it’s delivered as a JSON-RPC error object within an SSE frame rather than as an HTTP status code, since the status has already been sent. Pre-stream errors such as authentication failures, throttling, or validation errors are returned as standard JSON-RPC error responses with no SSE framing.

### Session management

Session management introduces stateful multi-turn workflows to AgentCore Gateway. When you enable sessions, AgentCore Gateway generates a `Mcp-Session-Id` on the first initialize request and returns it as a response header. The client includes this header on subsequent requests, allowing AgentCore Gateway to track client interactions, maintain mappings to downstream MCP server sessions, and correlate elicitation requests across tool calls.

To enable sessions, add a `sessionConfiguration` block during the `CreateGateway` or `UpdateGateway` API call. You can configure the session timeout from a minimum of 15 minutes to a maximum of 8 hours. The default is 1 hour.

    "protocolConfiguration": {
      "mcp": {
        "sessionConfiguration": {
          "sessionTimeoutInSeconds": 3600
        }
      }
    }

Sessions are scoped to the authenticated user. AgentCore Gateway derives the user identity from the authorization context, the JWT bearer token for OAuth ingress or the IAM credentials for AWS_IAM ingress, and validates that every request within a session originates from the same user. This helps prevent session hijacking, where one client attempts to use another client’s session identifier. AgentCore Gateway returns HTTP 400 if a session-enabled gateway receives a request without an `Mcp-Session-Id` header, and HTTP 404 for expired or non-existent sessions.

Behind the scenes, AgentCore Gateway persists the session ID in a fully managed durable store to manage sessions across requests. When AgentCore Gateway receives the first tool call for a given MCP server target within a session, it initializes a connection to that target, negotiates capabilities on behalf of the client, and stores the target session identifier. Subsequent tool calls to the same target within the session reuse this mapping, avoiding repeated initialization overhead. Because of this behavior, AgentCore Runtime doesn’t need to cold-start a new micro-VM on each request, resulting in faster response times.

When thinking about sessions for your AgentCore Gateway, keep the following in mind. Enabling sessions is a prerequisite for elicitation. If you’re using header propagation to forward `Mcp-Session-Id` to targets today, you can’t simultaneously enable session management because the gateway needs to own the session lifecycle. If a downstream MCP server session expires before the gateway session timeout, the gateway re-initializes the target transparently and continues serving the client.

### Elicitation

Elicitation enables MCP servers behind AgentCore Gateway to pause execution and request input from the end user. This is particularly valuable for high-risk operations where the server needs explicit user confirmation, structured data collection, or out-of-band authentication before proceeding.

AgentCore Gateway supports the following elicitation modes. In _form mode_ , the MCP server sends a flat JSON Schema describing the fields that it needs, and the client renders a form for the user to complete. In _URL mode_ , the server sends a URL that the client opens for the user, typically an OAuth consent screen or an external approval workflow. In _URL exception mode_ , the server returns `URLElicitationRequiredError` containing a URL, prompting the client to redirect the user and retry the tool call after the user completes the external flow.

Here’s how form mode elicitation works through AgentCore Gateway. Steps 1–6 cover session initialization and tool discovery. After that, the client sends a `tools/call` request with the `Mcp-Session-Id` header. AgentCore Gateway forwards the tool call to the MCP server target. The target opens an SSE stream and sends an `elicitation/create` request. AgentCore Gateway forwards the `elicitation/create` request to the client on the SSE stream. The client presents the form to the user and collects the response. The client then sends the elicitation response (action: accept or decline) using the same `Mcp-Session-Id`. AgentCore Gateway forwards the response to the MCP server target, which acknowledges HTTP 202 Accepted. The target continues to process the request with the new information.

Elicitation requires both streaming and sessions to be enabled on your gateway. AgentCore Gateway respects capability negotiation; it only declares elicitation support to a downstream MCP server when the connecting client has declared support for it during initialization. This means if a client doesn’t support elicitation, the MCP server won’t attempt to send elicitation requests, avoiding unexpected behavior. AgentCore Gateway also supports multiple active elicitations per session, so a client can have concurrent tool calls each with their own pending elicitation.

When thinking about elicitation for your AgentCore Gateway, keep the following in mind. Elicitation timeout is governed by the AgentCore Gateway connection timeout. If a user takes longer than the connection timeout to respond to a form or complete a URL flow, the request times out. Plan your connection timeout accordingly for workflows that involve human interaction. If the connection between the client and AgentCore Gateway breaks during an elicitation, AgentCore Gateway does not support resuming that specific tool call. The client should retry the original `tools/call` request. The gateway supports elicitation pass-through for MCP server targets only. For non-MCP target types such as REST APIs or AWS Lambda functions, elicitation is not applicable since those targets do not initiate elicitation requests.

## OAuth 2.0 on-behalf-of token exchange

When your agents need to access downstream resources on behalf of authenticated users, AgentCore Gateway supports OAuth 2.0 on-behalf-of (OBO) token exchange through AgentCore Identity. This enables a zero-trust authentication model where the original user’s identity is preserved and propagated through every hop in the request chain, while each layer receives a token scoped precisely to its intended audience.

The MCP client authenticates to AgentCore Gateway with JWT A, scoped to the gateway audience (`aud: gw`), over the `/mcp` streamable HTTP connection. When AgentCore Gateway needs to call a downstream MCP server target, it calls AgentCore Identity to exchange JWT A for JWT B, now scoped to the MCP server audience (`aud: mcp`). If the MCP server in turn needs to call a further downstream API, it can use `GetResourceOAuth2Token` to obtain JWT C scoped to the downstream API audience (`aud: api`). At every hop, the original user identity (`sub: X`) is carried forward, so downstream services can enforce fine-grained, per-user authorization without triggering additional consent flows. The claims used in this flow are strictly for example purposes, and should only be used to understand this diagram.

AgentCore Identity acts as the central token broker for this entire flow. It provides a secure token vault for storing OAuth credentials and client secrets so that neither AgentCore Gateway nor MCP servers need to manage credentials directly, and workload identity for service-to-service authentication using AWS workload identity rather than long-lived secrets. It supports standard token exchange ([RFC 8693](<https://www.rfc-editor.org/rfc/rfc8693.html>)) or JWT authorization grant ([RFC 7523](<https://www.rfc-editor.org/rfc/rfc7523.html>)), depending on the identity provider.

## Conclusion

With this release, you can build stateful multi-turn agent workflows with real-time progress streaming, human approval gates that pause and resume execution, and zero-trust identity propagation, through a single managed endpoint. No custom session stores, no hand-rolled streaming infrastructure, no shared service account credentials. Your MCP servers stay focused on business logic. AgentCore Gateway handles the rest: discovery, streaming, state, identity, and policy, centrally governed and incrementally adoptable.

To get started, review the [Amazon Bedrock AgentCore Gateway documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) for configuration details on each feature covered in this post. For hands-on examples, visit the [GitHub samples repository](<https://github.com/awslabs/agentcore-samples/tree/main/01-tutorials>). If you’re already running MCP servers behind AgentCore Gateway, you can adopt these capabilities incrementally without changes to your existing AgentCore Gateway or target configurations.

* * *

## About the authors

### Anagh Agrawal

[Anagh](<https://www.linkedin.com/in/anaghagrawal96/>) is a Software Engineer with Amazon Bedrock AgentCore, where he builds core Gateway infrastructure powering agentic AI experiences. He has previously worked on Amazon Bedrock Agents and brings distributed systems and cryptographic services experience from his time at AWS Key Management Service. He holds an MS in Computer Science from Stony Brook University. Outside of work, Anagh is a musician who plays piano and ukulele, and an avid hiker with a love for anything outdoors.

### Eashan Kaushik

[Eashan](<https://www.linkedin.com/in/eashan-kaushik/>) is a Specialist Solutions Architect AI/ML at Amazon Web Services. He focuses on building generative AI solutions while prioritizing a customer-centric approach to his work. Before this role, he obtained an MS in Computer Science from NYU Tandon School of Engineering. Outside of work, he enjoys sports, lifting, and running marathons.

### Ke Ma

Ke is a Software Engineer with Amazon Bedrock AgentCore Gateway, a platform designed to provide a straightforward and secure way for developers to build, deploy, discover, and connect to multiple agentic AI capabilities at scale. Before this role, she obtained an MS in Computer Engineering from the University of California, Irvine.

### Kyungna Kim

Kyungna is a Software Engineer on Amazon Bedrock AgentCore Gateway, where she builds infrastructure for developers to turn APIs and services into secure, discoverable tools for AI agents at scale. Before this role, she worked on Amazon Bedrock Agents, helping developers build autonomous agents to orchestrate foundation models.

### Tejas Dastane

[Tejas](<https://www.linkedin.com/in/tejas-dastane>) is an experienced Software Engineer with Amazon Bedrock AgentCore Gateway, where he builds core infrastructure for creating MCP server gateways used by AI agents. Previously, he worked on the agentic infrastructure for Amazon Bedrock Agents, and also has experience working with robotics applications in the cloud and compute services such as AWS Batch.

## 深度分析

### 1. AgentCore Gateway：AWS 的 Agent 通信基础设施
Amazon Bedrock AgentCore Gateway 是 AWS 为 AI agent 提供的统一通信层——解决的核心问题是"agent 如何安全、可靠地调用外部工具和数据源"。MCP（Model Context Protocol）扩展使 Gateway 成为 agent 的标准工具总线。

### 2. MCP 作为 Agent 工具标准的价值
MCP 正在成为 AI agent 工具调用的事实标准——Anthropic 提出、OpenAI 采纳、AWS 集成。AgentCore Gateway 的 MCP 扩展意味着 AWS 生态的 agent 可以通过统一协议访问任何 MCP 兼容工具。

### 3. Gateway 模式的安全优势
Gateway 模式（所有工具调用通过统一网关）比直连模式（agent 直接调用工具）有显著安全优势：集中式认证、审计、限流、策略执行。与 `Agent Security Three Step Sequence Harness Governance Identity Crewai` 的治理层对齐。

### 4. 多 agent 系统的工具共享
Gateway 使多个 agent 可以安全共享工具集——不同 agent 有不同权限，但工具注册和发现通过统一网关。这解决了多 agent 系统中"工具发现和权限管理"的规模化问题。

### 5. 厂商锁定风险
AgentCore Gateway 深度绑定 AWS 生态（IAM 认证、Lambda 执行、S3 存储）——迁移成本高。组织需要评估"统一管理的便利性"vs"多云/本地部署的灵活性"。

## 实践启示

### 1. Agent >5 个时：引入工具网关
当 agent 数量超过 5 个时，直接管理工具调用变得混乱——引入 AgentCore Gateway 或类似工具网关统一管理。

### 2. 用 MCP 协议降低工具集成成本
MCP 使工具一次集成、多 agent 复用——不要为每个 agent 单独集成工具，而是通过 MCP 标准化接口。

### 3. Gateway 层实施安全策略
在 Gateway 层集中实施认证、授权、审计——比在每个工具端点分别实施更可靠、更易维护。

### 4. 评估 AWS 锁定风险
如果未来可能多云部署，评估 Gateway 的可替换性——或使用开源 MCP gateway（如 mcp-proxy）作为中间层。

### 5. 监控 Gateway 的延迟和可用性
Gateway 是 agent 工具调用的单点——监控其延迟、错误率和可用性，确保不影响 agent 性能。

## 相关实体
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](https://github.com/QianJinGuo/wiki/blob/main/entities/building-a-secure-auth-code-flow-setup-using-agentcore-gatew.md)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](https://github.com/QianJinGuo/wiki/blob/main/entities/mcp-serveramazon-bedrock-agentcorequick-suite.md)
- [Building Ai Agents For Business Support Using Amazon Bedrock](https://github.com/QianJinGuo/wiki/blob/main/entities/building-ai-agents-for-business-support-using-amazon-bedrock.md)
- [Amazon Quick Bedrock Agentcore Finops Chat](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-quick-bedrock-agentcore-finops-chat.md)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md)

---

