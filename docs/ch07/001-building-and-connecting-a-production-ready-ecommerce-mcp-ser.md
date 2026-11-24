# Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio

> 📊 Level ⭐⭐ | 10.3KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/building-and-connecting-a-production-ready-ecommerce-mcp-server-using-amazon-bedrock-agentcore-and-mistral-ai-studio)

## Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio

When ecommerce teams need faster time-to-market for AI-powered customer experiences, they face weeks of custom integration work that delays launches and increases security risks. Building and connecting a production-ready AI assistant typically requires custom API code for each client, container infrastructure management, and complex authentication. Amazon Bedrock AgentCore and Mistral AI Studio streamline this process. A production-ready ecommerce Model Context Protocol (MCP) server on Amazon Bedrock AgentCore, connected to Mistral AI Studio, streamlines development. The MCP provides standardized integration protocols, AgentCore Runtime manages containers and validates tokens, and Amazon Cognito handles identity.

In this post, you build and connect that server end to end. You will implement MCP tools, set up two-layer JSON Web Token (JWT) authentication, deploy with AWS Cloud Development Kit (AWS CDK), and connect the result to Mistral AI’s Vibe. The post also covers prerequisites, solution architecture, best practices for MCP servers and Vibe connectors, and resource cleanup. The ecommerce server that you build supports product search, order placement, review submission, and returns processing using Amazon DynamoDB for data and Amazon Cognito for identity management.

Amazon Bedrock AgentCore is a platform to build, connect, and optimize AI agents at scale. Within it, AgentCore Runtime is the fully managed serverless component for hosting agent and MCP workloads, with session isolation, long-running request support, built-in JWT validation, and observability, so you don’t manage containers, load balancers, or auth middleware. In this post, you build the MCP server with Python and FastMCP, then deploy it to Runtime for managed hosting. Amazon Cognito manages user identity through OAuth 2.1, keeping each customer’s data isolated. With MCP, you write one server that multiple AI clients connect to, rather than building a separate integration for each client. Mistral AI’s Vibe gives users a conversational interface to the server on web, iOS, and Android.

By the end, you will have a working ecommerce MCP server that authenticates users through Amazon Cognito, scopes data access per customer, and responds to natural language queries from Vibe. Because the server uses the MCP standard, other MCP-compatible clients can also connect to it.

To see the solution in action, watch the following demo. Then, explore the full post for a detailed guide on implementing your own production-ready MCP server and querying it from Vibe.

## Prerequisites

You need an AWS account with permissions to create Amazon DynamoDB tables (NoSQL database), Amazon Cognito user pools (user identity, OAuth 2.1), A

## 深度分析

### Three layers, one contract: the production decomposition

The architecture separates concerns along three planes: an application layer (a FastMCP Python server exposing six tools over an `/mcp` endpoint plus `/health`), a data layer (five DynamoDB tables with on-demand capacity and Global Secondary Indexes), and a security layer deliberately split across infrastructure and application code. The deployment side mirrors this discipline with four CDK stacks — DynamoDBStack, CognitoStack, DataLoaderStack, AgentCoreRuntimeStack — each owning one slice, with the DataLoaderStack seeding realistic test data (50 products, 10 customers, 50 orders) via a Lambda custom resource so the server is testable immediately after deploy. The generalizable point: production MCP servers fail less on protocol plumbing than on ownership boundaries, and giving each stack, tool, and table exactly one concern is what keeps the system auditable. [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)

### Two-layer authentication, and why the app re-checks anyway

Security is split by responsibility: AgentCore Runtime owns cryptographic validation (signature against Cognito public keys, issuer, expiry, allowed client IDs) and rejects invalid tokens before application code runs, while the application only resolves the validated token into a `custom:customer_id` via Cognito. The notable detail is that tools still check identity at their start and return an explicit error for anonymous callers — defense in depth even though the edge has already validated the JWT. The best-practice list extends the same pattern: verify data ownership before mutations, least-privilege IAM with no wildcards, AgentCore Policy to enforce tool-call boundaries, Gateway for rate limiting, and token descoping so a forwarded JWT carries only the claims a tool needs. The framing — infrastructure guarantees authentication, application guarantees authorization — is a reusable template for any agent platform that terminates tokens at a managed edge. [agent security architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)

### Tool schema design is prompt engineering in disguise

Because FastMCP turns a function's parameters, type hints, and docstring directly into the tool schema the model reads to decide when and how to call, documentation quality becomes a runtime behavior determinant rather than a courtesy. The order-history example makes the docstring state "REQUIRES AUTHENTICATION" and returns both machine-readable IDs and human-friendly labels so the model can answer without follow-up calls; the guidance caps servers at 5–8 well-defined tools with per-domain splitting, explicit parameter examples, and common-mistake call-outs. This treats tool descriptions as interface design: the schema is the model's only view of a capability, and ambiguity there converts directly into wrong tool calls at runtime. [tool design evolution](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-tool-design-evolution.md)

### The client side is the weaker perimeter

The sharpest part of the post is its client-side risk catalog: prompt injection hidden in tool descriptions or metadata, tool shadowing and typo-squatting that silently override legitimate tools, over-exposure of unneeded access, and privilege escalation through forwarding a user's full JWT to a tool. The operational guidance is correspondingly conservative: connect only trusted servers, keep active connectors to 5–6 because ten connectors can surface 150+ functions the model must choose among, and restrict custom-connector addition to enterprise administrators. This inverts the usual framing: a well-built server can still be chained into harm by a promiscuous client, so connector trust management is a supply-chain concern for the MCP ecosystem rather than a per-deployment one.

Transferable takeaways:

1. Managed runtimes shift the hard problems from infrastructure (containers, load balancers, auth middleware) to interface design and data scoping — AgentCore even builds container images in the cloud, removing the local Docker requirement.
2. Authentication and authorization must be reasoned about separately even when one component enforces both at the edge; app-level customer-ID resolution is what turns a valid token into scoped data access.
3. Cross-cutting identity plumbing is where deployments actually break — e.g. the request-header allowlist, without which forwarded Authorization headers are dropped and every request looks anonymous.
4. Seeding realistic test data through infrastructure as code makes post-deploy validation immediate and reproducible instead of a manual chore.
5. The same decomposition — tools over one protocol, managed runtime, identity provider, IaC — ports to other domains such as support-ticket or financial-record servers, per the authors' own extension guidance.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

