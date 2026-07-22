---
title: building-multi-tenant-agents-with-amazon-bedrock-agentcore
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-multi-tenant-agents-with-amazon-bedrock-agentcore/
tags: [aws-china-blog, agentic-ai, context-engineering]
author: 
publish_time: 
sha256: 167e70c0390f
created: 2026-05-22
updated: 2026-05-22
---


# Building multi-tenant agents with Amazon Bedrock AgentCore

 

Software as a service (SaaS) providers building multi-tenant agentic applications must address architectural challenges beyond the typical concerns of security, governance, and response accuracy. These include tenant isolation, tenant identity, tenant observability, data isolation, cost attribution, and noisy neighbor mitigation. Closing the gap between a working demo and a production deployment requires infrastructure built for multi-tenant environments.Amazon Bedrock AgentCore is a managed, serverless service for building, deploying and securely operating agentic applications on AWS. It provides constructs for deploying agents and hosting MCP servers, with built-in support for identity management, memory, observability, and evaluations, all designed to make multi-tenant agent architectures straightforward to build.

This post, part 1 of the blog series, explores design considerations for architecting multi-tenant agentic applications and the framework needed to address SaaS architecture challenges with [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/).

## Design considerations for building a multi-tenant agent

Building secure multi-tenant agentic applications with strong isolation requires careful architectural decisions across certain key components, as shown in Figure 1. Each component must balance tenant isolation, operational efficiency, and cost optimization while maintaining security and compliance standards. These design considerations revolve around three tenant isolation patterns: [Silo, Pool, and Bridge](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/silo-pool-and-bridge-models.html), with tiering strategy as a key consideration when choosing among them.

![Multi-tenant agent components](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/14/Ml-20532-image-1.png)

_Figure 1: Design considerations for a multi-tenant agent_

In the following section, we elaborate how multi-tenancy impacts each of these components.

### 1\. Agent Runtime Deployment: Dedicated compared to Shared

A key decision in a multi-tenant agentic architecture is how the agent runtime is provisioned relative to tenants. A _dedicated_ runtime per tenant instantiates a separate execution environment for each tenant, with its own container image, process space, and lifecycle. This silo approach offers the strongest noisy-neighbor protection and streamlines compliance audits. A _shared_ runtime hosts agents for all tenants within the same container image and process pool, lowering infrastructure costs and operational overhead but requiring strict in-process tenant context propagation.

Amazon Bedrock AgentCore Runtime resolves this tension through session-isolated microVM-based compute. AgentCore Runtime launches lightweight microVMs on a per-session basis, without the cost or latency of spinning up a full virtual machine for every tenant. Each session carries its own persistent file system, so agents can read and write session-scoped files, maintain intermediate computation artifacts, and preserve state across multi-step interactions, reducing the risk of cross-session data leakage. The architecture is a good fit for hosting multi-tenant MCP servers, agents, and AG-UI servers.Tenant context flows into the isolated execution environment through custom HTTP headers. When the SaaS platform forwards a request to an AgentCore Runtime session, it attaches headers carrying tenant-specific metadata such as tenant identifier, tier, regional preferences, feature flags, or entitlements, alongside standard authorization tokens. The agent reads these headers at invocation time to establish full tenant awareness, so it can run workflows tuned to that tenant’s business logic, invoke only licensed tools, and call tenant-specific API endpoints without hardcoded routing logic.

### 2\. Shared compared to Tier-Specific compared to. Fine-Tuned Models

Shared foundation models (FMs) serve as the recommended starting point for most multi-tenant deployments, offering streamlined operations with single model maintenance. Tenants typically benefit from automatic model updates without per-tenant customizations. The option to select the model based on tenant tier (Tier-specific model) allows flexibility and balances cost, performance, and accuracy across tenant tiers. Tenant-specific fine-tuned models become necessary for specialized use cases requiring tenant-specific terminology, regulatory compliance, or performance SLAs, though they introduce higher operational complexity and per-tenant pipelines. A hybrid approach, using less capable models for standard tiers and fine-tuned or more capable models for premium enterprise customers, balances cost efficiency with customization needs.Amazon Bedrock provides a choice of large language models (LLMs) from leading providers, allowing SaaS providers to pick a model suitable for tenant and tier-specific needs. Amazon Bedrock fine-tuning supports the customization of FMs using your own labeled datasets to improve performance for domain-specific tasks. With Amazon Bedrock Custom Model Import, you can bring your own fine-tuned models and deploy them using the Amazon Bedrock managed infrastructure.

### 3\. Workflows: Silo, Pool, and Bridge patterns

Multi-tenant agentic applications require flexible workflow management where each agent executes different sequences of steps based on tenant requirements and business logic. Workflows can be implemented through multiple mechanisms: as MCP tools that encapsulate step-by-step processes, as API endpoints that define business logic flows, or as agent skills that embed domain-specific workflow patterns.

Three primary patterns manage tenant-specific workflows. The silo pattern uses dedicated tenant-specific skills where each tenant’s complete workflow, including all business logic, validation rules, and integration steps, is embedded in isolated agent skills. This gives maximum customization and complete independence but requires separate skill maintenance per tenant. The pool pattern uses shared agent skills. The bridge pattern embeds common workflow steps such as authentication, logging, and error handling in shared agent skills that invoke tenant-specific skills at runtime for business-critical logic. The result is reusable infrastructure that coexists with tenant-specific customization.

### 4\. Multi-tenant RAG

Retrieval Augmented Generation (RAG) systems require data isolation decisions. The silo pattern uses dedicated vector databases per tenant, providing maximum security and complete data separation. This is recommended for regulated industries and enterprise customers requiring dedicated infrastructure. The pool pattern uses shared vector databases with metadata-based tenant filtering and namespace-based access control, which supports cost-efficient operations for SaaS platforms serving many small-to-medium tenants. Retrieval operations should include automatic tenant filter injection and result sanitization to help prevent cross-tenant data leakage.

Amazon Bedrock Knowledge Bases provides fully managed RAG capabilities that connect FMs to your data sources, automatically handling data ingestion, chunking, embedding generation, and vector storage. It supports multiple vector databases and provides the ability to create siloed or shared vector database (using meta-data filtering).

For detailed guidance on implementing multi-tenant RAG architectures with Amazon Bedrock Knowledge Bases, see [Multi-tenant RAG with Amazon Bedrock Knowledge Bases](https://aws.amazon.com/blogs/machine-learning/multi-tenant-rag-with-amazon-bedrock-knowledge-bases/) for silo, pool, and bridge deployment patterns, and [Multi-tenancy in RAG applications in a single Amazon Bedrock knowledge base with metadata filtering](https://aws.amazon.com/blogs/machine-learning/multi-tenancy-in-rag-applications-in-a-single-amazon-bedrock-knowledge-base-with-metadata-filtering/) for metadata-based tenant isolation within a shared knowledge base.

### 5\. Tenant context, act-on-behalf patterns, and token propagation

Multi-tenant identity management requires careful handling of tenant context throughout the service chain. Tenant context, representing the complete identity, and request-specific state must flow through every architectural layer using reliable and secure mechanisms. Unlike deterministic software APIs with predictable execution paths, AI agents are non-deterministic and can be potentially autonomous, making security considerations different in important ways. Rogue or compromised agents could potentially make unauthorized calls to downstream services, leading to stolen credentials, privilege escalation, and the Confused Deputy problem. When agents operate with full user credentials (impersonation), a single compromised agent gains complete access to all user permissions across all downstream systems. This risk grows as agents become more autonomous and make independent decisions about which tools to invoke, when to invoke them, and with what parameters. The act-on-behalf pattern matters because it establishes a clear distinction between the user and the agent, with agents making calls on behalf of the user with explicitly limited, scoped permissions for each specific operation.

Encode tenant context within JSON Web Tokens (JWT) capturing three dimensions: Security Context (standard claims: iss, sub, exp, aud), Tenant Context (tenant\_id and tenant-specific scopes), and Request Context (domain-specific attributes for business logic). Encoding tenant context this way provides a strong and flexible foundation for multi-tenant operations.

Choose between two patterns with distinct security implications: Impersonation allows agents to operate with complete user identity and permissions, offering straightforward implementation but violating the least privilege principles and creating security risks. Act-on-Behalf (Delegation), the recommended approach, implements true delegation where tokens are transformed at each service boundary with scope-limited credentials and an act claim (per OAuth 2.0 RFC 8693) identifying the agent. Use the On-behalf-of token exchange in AgentCore Identity, enabling agents and other workloads, such as MCP servers, to exchange an inbound user access token for a new, scoped access token that targets a downstream resource server. As the exchange converts a token issued for one audience directly into a token for a different downstream audience, your agents can access protected resources on behalf of authenticated users without triggering additional consent flows. The exchanged token carries both the agent’s own identity and the original caller’s identity, giving resource servers the signals they need to enforce fine-grained, zero-trust authorization at every hop.

### 6\. Fine-grained access control for MCP tools and APIs

Multi-tenant agentic applications require restricting MCP server access using policies, fine-grained access control at the tool invocation layer, and tenant isolation at the data access layers. At the authorization layer, policies evaluate tenant context at runtime to make allow/deny authorization decisions, and to assess tenant quotas, tier-based permissions, and usage limits before allowing tool invocations based on current tenant state rather than relying solely on static permissions embedded in tokens. Decoupled and centralized policy stores allow dynamic updates without redeployment, with policy versioning supporting audit trails and rollback capabilities. AgentCore Policy intercepts and evaluates all agent requests against defined policies before allowing tool access, providing fine-grained control based on user identity and tool input parameters, with policies authored using natural language or directly in Cedar.

At the invocation layer, MCP servers enforce fine-grained access control by filtering available tools based on tenant tier, feature flags, and quota limits before agents can invoke them. Tool interceptors validate JWT claims to confirm that the requesting principal has appropriate permissions for the specific operation. Schema translation capabilities adapt tool interfaces based on tenant configurations and entitlements. AgentCore Gateway enables agents to securely access tools by transforming APIs and AWS Lambda functions into agent-compatible tools and connecting to existing MCP servers, with support for Amazon API Gateway, OpenAPI schemas, Smithy models, Lambda functions, and MCP servers. You can implement access control through gateway interceptors for custom logic or use resource-based policies for standard AWS-style access control.At the data access layer, Attribute-Based Access Control (ABAC) policies enforce tenant isolation for data access, with tenant identification occurring through JWT claims. ABAC policies use AWS Identity and Access Management (IAM) conditions to restrict data access based on principal tags and attributes, so agents can only query resources matching their tenant context through row-level security or storage policies.

### 7\. Memory: Hierarchical namespace isolation

Multi-tenant memory management requires careful architectural design so that agents can maintain context and learned information while preventing cross-tenant data leakage. Memory systems should implement five logical levels:

*   Global (cross-tenant shared knowledge)
*   Strategy (agent-type-specific patterns and behaviors)
*   Tenant (tenant-scoped conversational history and preferences)
*   User (individual user context within a tenant)
*   Session (ephemeral short-term memory for active conversations)

Access control enforces isolation through attribute-based policies that validate principal identities against requested namespace paths, so agents can only read and write memory within their allowed scope. The pool pattern uses shared infrastructure with hierarchical namespace-based logical isolation for operational and cost efficiency, storing all tenant data in a common data store with strict filtering based on namespace prefixes. The silo pattern deploys dedicated memory stores per tenant for maximum isolation, reducing cross-tenant access risk at a higher operational cost. Implementation involves constructing composite identifiers from tenant and user information (for example, tenant\_123:user\_456), authenticating with scoped credentials that carry tenant context as claims or tags, and prefixing all memory operations with the appropriate namespace path.

AgentCore Memory provides hierarchical namespace isolation across global, strategy, tenant, user, and session levels, supporting context-aware agent experiences with both short-term memory for multi-turn conversations and long-term memory that persists across sessions. It supports [resource based policies](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-based-policies.html) and [attribute-based access control](https://builder.aws.com/content/3C1SCSoe15VaBnmsiMIfGcZfhxM/secure-shared-multi-tenant-agent-memory-namespaces-using-agentcore-memory) for fine-grained access.

### 8\. Agent identity, trust, and discovery

As agentic applications interact with external agents across organizational boundaries, three foundational concerns emerge: agent identity, agent trust, and agent discovery. While related, each addresses a distinct problem.

**Agent Identity** answers _“Who is this agent, and can it prove it?”_ – establishing a verifiable, unique identity tied to an organization.

**Agent Trust** answers _“Should I trust this agent?”_ – evaluating trustworthiness based on a combination of signals, not a single credential.

**Agent Discovery** answers _“How do I find the right agent?”_ – locating agents by capability or affiliation without prior knowledge of endpoints.

#### **Agent identity with AgentCore Identity**

Amazon Bedrock AgentCore Identity implements agent identities as workload identities, a pattern well-established in cloud-native security. Each agent receives a cryptographically verifiable identity anchored to the organization’s AWS account and IAM infrastructure. Agents can securely access AWS resources and third-party tools on behalf of users using OAuth 2.0 flows, and AgentCore Identity integrates with existing corporate identity providers such as Okta, Microsoft Entra ID, and Amazon Cognito without requiring user migration.

#### **Agent trust**

Identity alone doesn’t answer whether an agent should be trusted. The industry is actively working on this problem. The [Agent Naming Service (ANS) v2](https://datatracker.ietf.org/doc/html/draft-narajala-courtney-ansv2), currently an IETF Internet-Draft (work in progress), which anchors every agent identity to a DNS domain name. Clients can choose assurance levels that are appropriate to their transaction risk with three verification tiers, Bronze (PKI), Silver (PKI + DANE), and Gold (PKI + DANE + Transparency Log).

#### **Agent discovery with AWS Agent Registry**

AWS Agent Registry, available through Amazon Bedrock AgentCore, provides a centralized catalog for discovering agents, skills, MCP servers, and custom resources across an organization. Teams can publish, version, and share reusable agent capabilities. Consumers discover agents through natural language or structured search without needing prior knowledge of identifiers or endpoints. Built-in governance controls determine how consumers access the registry and whether records require approval before becoming discoverable.In summary, AgentCore Identity provides the foundational proof of identity, Agent Registry solves discovery, and emerging trust frameworks like ANS aim to close the gap on multi-signal trust evaluation.

### 9\. Cost tracking per tenant and observability

Accurate multi-tenant cost attribution requires application-level instrumentation that emits tenant-tagged metrics to a logging solution for every agent invocation, capturing I/O tokens, tool invocations, and execution duration. Structured logging with tenant context allows detailed analysis of usage patterns, performance bottlenecks, and capacity planning. AgentCore Observability provides real-time visibility into agent workflows with OpenTelemetry-compatible integration powered by Amazon CloudWatch, offering detailed visualizations of each step of agent execution.

### 10\. Guardrails: Content safety

Multi-tenant guardrails enforce safety and compliance at three enforcement points. Pre-processing input guardrails validate user input before agent processing, blocking malicious prompts, prompt injections, and sanitizing PII based on tenant-specific compliance requirements such as HIPAA for healthcare and PCI-DSS for finance. Post-processing output guardrails validate agent responses for factual accuracy, detect hallucinations, confirm format compliance, and scan for sensitive data leakage across tenant boundaries. You can apply guardrails by tenant or tier, providing configurations for toxicity detection, content filtering, and custom blocked terms, with observability metrics tracking trigger rates, blocked requests by category, and false positive rates for continuous improvement. Amazon Bedrock Guardrails provides content filtering and safety controls with configurable policies for denied topics, content filters, word filters, and sensitive information redaction, supporting responsible AI deployment across all model interactions.

These ten components provide a comprehensive framework for designing multi-tenant agents. In the following sections, we explore the implementation of the silo, pool, and bridge models within AgentCore, keeping these core components in mind.

## Implementing Silo model with AgentCore

As described in the following Figure, the _silo model_ enables each tenant to operate within a fully isolated stack with its own dedicated Bedrock AgentCore Runtime, Bedrock AgentCore Gateway, and Bedrock AgentCore Memory, all scoped behind separate AWS IAM boundaries. There are several classifications of memory supported such as long-term, short-term, and episodic, which need to be configured as per the tenant requirement.

### **Key architectural components**

*   **Siloed Agent Layer** – Dedicated AgentCore Runtime each deployed with separate IAM execution roles for tenant specific permissions.
*   **Siloed Gateway** – Dedicated AgentCore Gateway for tool orchestration using MCP, scoped access to data layer based on execution roles.
*   **Siloed Agent Memory –** Dedicated AgentCore Memory with hierarchical namespace isolation, removing the need to include tenant IDs in every namespace path. Agents access tenant-specific memory through IAM roles.
*   **Siloed Data Layer** – Dedicated tools, knowledge bases, databases, and backend resources for maximum data isolation.

### **Request flow**

1.  **Authentication** – Users authenticate using the Identity Provider, receiving JWT tokens containing tenant context (tenant ID and subscription tier).
2.  **SaaS application proxy routing** – The SaaS application proxy decides which agent to invoke based on the tenant context. This requires a mapping configuration to be established between tenant and agent deployment, a function typically part of the SaaS control plane. The proxy transforms application-level requests into AgentCore Runtime API calls (InvokeAgent), attaching the tenant JWT token.
3.  **Agent execution** – The AgentCore Runtime validates the JWT using AgentCore Identity, creates an isolated microVM session, and begins agent reasoning. Additionally, it validates if the tenant id is authorized to invoke this agent (for example, “allow only if tenant\_id = Tenant A”) by configuring custom claims in the JWT Authorizer of AgentCore Identity. The agent accesses tenant-specific AgentCore Memory using runtime IAM execution roles.
4.  **Tool access using AgentCore Gateway** – When the agent must invoke tools, it calls the _dedicated AgentCore Gateway_, which is specifically scoped to access MCP tools for a specific tenant. The Gateway:
    1.  Validates the JWT using AgentCore Identity.
    2.  Extracts tenant context from the validated token and verifies the Gateway is mapped to the tenant in context using custom interceptors.
    3.  Integrates with siloed tenant-specific backend resources (APIs, databases, knowledge bases).
5.  **Response flow** – Tool responses flow back through the Gateway to the agent, which completes its reasoning. The siloed agent applies tenant-specific formatting before returning to the SaaS application proxy. The proxy returns the response to the user.

The Silo pattern is designed so that each customer’s agent sessions, tool access, and memory are fully contained, and costs are attributed directly to the customer whose alert triggered the work.The trade-off is higher operational overhead, since each customer runs dedicated resources rather than sharing them. But for security-critical and compliance-sensitive workflows, the limited scope of potential impact makes it the right choice.

![Architecture diagram illustrating the silo model implementation with Amazon Bedrock AgentCore, showing dedicated agent runtime, gateway, memory, and data layer for each tenant with separate IAM boundaries.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/Ml-20532-image-2-1.png)

_Figure 2: Silo Model with AgentCore_

## Implementing pool model with AgentCore

As described in the following Figure, the _pool model_ enables resource sharing across multiple tenants, so you can design architectures that maximize resource utilization and deliver operational efficiency.

### **Key architectural components**

*   **Pooled Agent Layer** – Shared AgentCore Runtime and agent logic across multiple tenants.
*   **Pooled Gateway** – Centralized AgentCore Gateway for tool orchestration using MCP.
*   **Pooled Agent Memory –** Shared AgentCore Memory partitioned based on tenant context.
*   **Pooled Data Layer** – Shared tools, knowledge bases, databases, and backend resources.
*   **Pooled Identity Management** – Pooled Identity Provider with JWT-based tenant context propagation.

### **Request flow**

1.  **Authentication**– Users authenticate using the Identity Provider, receiving JWT tokens containing tenant context (tenant ID and subscription tier).
2.  **SaaS application proxy routing** – The SaaS application acts as pass through where it routes input request with tenant context to agents running in pooled AgentCore Runtime. The SaaS application proxy transforms application-level requests into AgentCore Runtime API calls (InvokeAgent), attaching the tenant JWT token.
3.  **Agent execution** – The AgentCore Runtime validates the JWT using AgentCore Identity, creates an isolated microVM session, extracts the tenant context from the JWT and begins agent reasoning. The agent accesses tenant-scoped AgentCore Memory using namespace-based partitioning (for example, actor\_id: “tenant-a:user-123”).
4.  **Tool access using AgentCore Gateway** – When the agent must invoke tools, it calls the _pooled AgentCore Gateway_, which is specifically designed for MCP tool orchestration, not generic routing. The Gateway:
    1.  Validates the JWT using AgentCore Identity.
    2.  Extracts tenant context from the validated token.
    3.  Routes tool calls to pooled backend resources (APIs, databases, knowledge bases).
    4.  Enforces tool-level isolation through tenant-scoped credentials and configuration.
    5.  Applies policy enforcement and interceptors for cross-cutting concerns.
5.  **Response flow** – Tool responses flow back through the Gateway to the agent, which completes its reasoning. The agent response returns through the Runtime to the Seller proxy, which applies tenant-specific formatting before returning to the user.

The pool model is highly efficient and might be the only option when you have large number of small tenants.The trade-off is more rigor around testing fine-grained access control, and more instrumentation is needed to attribute cost to tenants.

![Architecture diagram illustrating the pooled model implementation with Amazon Bedrock AgentCore, showing shared agent runtime, gateway, memory, and data layer across multiple tenants with JWT-based tenant context propagation.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/Ml-20532-image-3-1.png)

_Figure 3: Pooled Model with AgentCore_

## Implementing bridge model with AgentCore

The _bridge model_ (the hybrid model) represents a strategic middle ground between the silo and pool deployment patterns. This approach combines the cost efficiency of shared infrastructure with the security benefits of isolated data resources.

Depending on your needs, you can choose to implement the bridge pattern in various ways:

1.  Siloed AgentCore Runtime/gateway/tool/memory for premium tier tenant and pooled shared AgentCore Runtime/gateway/tool/memory for standard tier
2.  Siloed Runtime with pooled gateway/tools and memory
3.  Others

The idea is to be able to choose the tenancy at each layer and component, rather than tied to a specific tenant isolation pattern.This approach combines the benefits of both approaches, depending on your implementation. For example, in the SOC analyst use case, the gateway could be siloed to handle email API interactions and other downstream tenant resources, while the pooled agent runtime hosts the agent and performs reasoning, since each investigation runs in its own isolated microVM.

![Architecture diagram showing the bridge model variation 1 with Amazon Bedrock AgentCore, combining siloed components for premium tenants with pooled components for standard tier tenants.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/Ml-20532-image-4-1.png)

_Figure 4: Bridge Model with AgentCore (variation 1)_

![Architecture diagram showing the bridge model variation 2 with Amazon Bedrock AgentCore, demonstrating an alternative hybrid approach with different combinations of siloed and pooled components.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/18/Ml-20532-image-5-1.png)

_Figure 5: Bridge Model with AgentCore (variation 2)_

## What’s next

In this post, we covered the foundational concepts for building multi-tenant agents. In the upcoming posts, we will take a deeper look into the implementation aspects of these concepts. Specifically, we will walk through an end-to-end working implementation of both the pool and silo deployment models, incorporating the components outlined in the design considerations section.

## Conclusion

Building production-ready multi-tenant agentic applications requires more than just functional AI agents. It demands a comprehensive architectural approach that addresses tenant isolation, identity management, cost attribution, and security at every layer. Amazon Bedrock AgentCore provides the foundational primitives needed to tackle these challenges, offering flexible deployment patterns through silo, pool, and bridge models that can be tailored to your specific tiering strategy and compliance requirements. Whether you’re serving enterprise customers requiring dedicated infrastructure or optimizing costs across hundreds of smaller tenants, you can use the integrated Runtime, Gateway, Memory, Identity, and Observability components of AgentCore to build secure, scalable multi-tenant agentic workflows without reinventing the wheel. These primitives work together to help maintain tenant data isolation, scoped tool access, accurate cost attribution, and security boundaries, transforming the complexity of multi-tenant agent architecture into a manageable, production-ready solution that scales with your SaaS business.

We encourage readers to explore the [multi-tenant agents workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/749d2432-98e2-4af5-b8d8-7242395c1925/en-US) for hands-on experience building these multi-tenant agents with Amazon Bedrock AgentCore.

* * *

## About the authors
