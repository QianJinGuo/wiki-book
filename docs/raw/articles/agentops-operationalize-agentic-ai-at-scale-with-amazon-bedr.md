---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedrock-agentcore/
ingested: 2026-06-02
feed_name: AWS China ML
source_published: 2026-06-01T16:12:18Z
sha256: 69e75f12a5a730d1a3ea07fbba55159db222ce4299f1bfa33225e0896a6724a7
---

# AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore

When you build [agentic AI](<https://aws.amazon.com/what-is/agentic-ai/>) solutions, you face unique operational challenges. Agents make unpredictable decisions, costs spiral unexpectedly, and debugging non-deterministic failures seems impossible. Agentic AI applications don’t just execute predetermined workflows. They reason, adapt, and make autonomous decisions, and DevOps practices need to be adapted. That’s where AgentOps comes in, the operational discipline for deploying, managing, and continuously improving AI agents in production.

The [first part](<https://aws.amazon.com/blogs/machine-learning/operationalize-generative-ai-workloads-and-scale-to-hundreds-of-use-cases-with-amazon-bedrock-part-1-genaiops/>) of our blog series introduced how to operationalize generative AI workloads. In this post, we show how to accelerate the path to production for agentic AI workloads, check the quality of your agents and tools, and drive agentic AI adoption in your organization by implementing AgentOps with [Amazon Bedrock AgentCore.](<https://aws.amazon.com/bedrock/agentcore/>) We discuss best practices from real world implementations across four pillars: governance and security, build and operations, evaluation, and observability. We also show how AWS services, people, and processes come together into a reference architecture that you can adapt for your organization.

Note that this post focuses on operations and not agent design. The implementation examples use Amazon Bedrock AgentCore and supporting AWS services, but the principles discussed apply broadly. The reference architecture is a starting point: your organization’s requirements will determine how you adapt it.

### AgentOps: The four pillars

This post covers best practices and real-world learnings for each of the AgentOps pillars:

  1. **Governance & Security: **use multi-account strategy, deterministic controls, reasoning controls and human-in-the-loop, to verify agents operate within authorised boundaries and every action is traceable.
  2. **Build & Operations: **treat every agent, tool, and memory configuration as a versioned, deployable artifact with its own CI/CD pipeline.
  3. **Evaluation:** evaluate at four levels, tool, conversation turn, session outcome, and system in development and production.
  4. **Observability and monitoring:** instrument across four telemetry layers so you can trace every agent decision, monitor quality drops, and track cost per interaction.



[Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) offers components that you can use independently or together to implement these pillars. It is AWS’s Agentic AI platform for building, deploying, and operating effective agents securely at scale. AgentCore works with any open source framework and any large language model (LLM) and you can transition from local development to production without managing infrastructure.

### The AgentOps Lifecycle on AWS

Like other software solutions, agents follow a development lifecycle from idea to production, and that progression never truly ends. Agents require continuous operational attention and improvements across every stage. Below, we’ve mapped out how agentic AI impacts each stage of your DevOps pipeline: Plan, Develop, Build, Test, Deploy & Release, Maintain and Monitor.

**DevOps Stage** | **AgentOps Considerations**  
---|---  
**Plan** | Assess AI fit, risks, ethics. Secure legal/compliance approvals, establish performance metrics, prepare data. Define human oversight point, tool permissions, agent trust model, cross-agent authentication, initial agent design  
**Develop** | Experimentation and model selection, evaluations, Retrieval Augmented Generation (RAG)/prompts, chunking strategies, guardrails. Orchestration, memory, state, tool registry/discovery, Model Context Protocol (MCP) tools, Agent-to-Agent (A2A), agent identity, agent evaluations, auth patterns  
**Build** | Unit/integration/security/agent tests, deploy to pre-production. Workflow tests, tool chain validation. Role-Based Access Control (RBAC) validation  
**Test & release** | Run quality, performance, end-to-end, security tests. Update release notes with AI considerations. Execution path evaluation end-to-end goals, loop limits, human-in-the-loop (HITL) tests, unauthorized agent actions.  
**Deploy** | Deploy solution to production.Deploy MCP servers, tools. Concurrency, least privilege, networking for agent endpoints. Configure rollback strategies, canary deployments, or traffic management  
**Maintain and monitor** | Track quality, guardrails, latency, throughput, responsible AI, errors, track usage and cost. User feedback. Traces/spans monitoring, drift, alerts, action audit trails, anomaly detection, guardrails for agent end-to-end calls  
  
The pillars apply irrespective of where you are in the lifecycle. From a responsible AI perspective, you need systematic risk management throughout. “[The Agentic AI Security Scoping Matrix: A framework for securing autonomous AI systems](<https://aws.amazon.com/blogs/security/the-agentic-ai-security-scoping-matrix-a-framework-for-securing-autonomous-ai-systems/>)” can help identify and manage risks.

### Solution Overview

The following reference architecture shows how the pillars, lifecycle, people, processes, and AWS services connect. Let’s go through it step-by-step.

**Planning and setup**

  1. The **product owner** registers the use case in a centralized catalog. Legal and compliance teams assess risks and provide guidance.
  2. Once the use case is approved, the **product owner works with domain experts** and technical teams to establish scope, success metrics, and source-of-truth test prompts for evaluation.
  3. **Platform engineers** deploy environments using IaC with access controls agreed with security teams and tagging for governance and cost tracking.



**Development**

  4. **Developers and data scientists** create agent, application, and tool repositories with seed code and begin building. They may use approved tools behind the shared AgentCore Gateway and agents behind the AWS Registry. New tool or MCP server requests go through the product owner, platform team, and legal for approval.
  5. **Data engineers** create datasets and evaluation sets for development and testing.
  6. **Developers** run manual and automated evaluations including tool selection accuracy, multi-step reasoning validation, conversation coherence, and memory persistence. Domain experts review results and provide feedback.
  7. Experiment results are tracked locally during development, then synchronized to the shared account for centralized tracking and cross-team comparison.
  8. **Developers** merge to main, triggering the deployment pipeline.



**Build and deployment pipeline**

  9. The CI/CD pipeline creates a release branch, deploys resources to pre-production including agent deployment to AgentCore Runtime via ECR, and triggers the evaluation pipeline. For RAG implementations, the ingestion pipeline deploys to the data governance account.
  10. In pre-production, integration, performance, UAT, regression, and generative AI evaluation tests run, including authentication flows, user context propagation, and authorization validation for tool access.
  11. **QA engineers** and **domain experts** validate against established metrics and approve promotion to production.



**Production deployment and operations**

  12. The solution is deployed to production. Production telemetry, user feedback, and performance metrics flow back to planning for continuous improvement.
  13. Agents are registered in the Agent Discovery API, making them discoverable for reuse and agent-to-agent collaboration.
  14. **End users** interact with the application and provide feedback. AgentCore Observability dashboards track decision traces, tool invocation patterns, latency, errors, memory usage, and cost per interaction.



Now let’s go through each pillar in more detail.

### Pillar 1: Governance & Security

In agentic systems, a single user request can spread across hierarchical chains or trigger collaborative swarms where multiple agents act on the user’s behalf. Each interaction between user and agent needs to be tightly controlled. When Agent A calls Agent B, there can be ambiguity of what agent is authorized to perform which actions. If a user with limited permissions triggers an agent, the agent must inherit those restrictions. This ambiguity only compounds in deeper chain of calls. You need strict governance around who can access the agents, what data and tools and APIs the agents can access, who can authorize these permissions, and what occurs when issues arise.

The following diagram shows the security decisions to be made at each step when an agent handles a request. A user’s input flows through an environment, into the agent, which uses tools and memory to generate outputs. The application verifies the user’s identity, whether they are allowed to invoke the agent, and whether the agent can access the requested context, memory, and tools with the specific parameters. It also validates that inputs are safe and that the agent is authorised to return the specific outputs.

To achieve a layered security approach that helps agents operate within well-defined boundaries while maintaining auditability you should consider the following dimensions.

**Multi-account architecture**

AgentOps is an extension of GenAIOps, the same way MLOps is an extension of DevOps. If you followed [Part 1: GenAIOps](<https://aws.amazon.com/blogs/machine-learning/operationalize-generative-ai-workloads-and-scale-to-hundreds-of-use-cases-with-amazon-bedrock-part-1-genaiops/>), the same design principles apply to AgentOps. You should follow a [multi-account strategy](<https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html>) for organizational isolation and [Service Control Policies](<https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>) (SCPs) to set security guardrails across accounts.

The following reference diagram shows the multi-account AWS architecture:

  1. A shared services account with [Amazon Elastic Container Registry (ECR)](<https://aws.amazon.com/ecr/>) container images, pipeline artifacts, AWS Secrets Manager, and centralised monitoring and authentication services.
  2. Data accounts to separate producer accounts from data governance accounts, supporting isolation and secure access to knowledge bases aligned with compliance requirements.
  3. Application accounts. a. Dedicated development (dev), b. pre-production (pre-prod), and c. production (prod) accounts per line of business or application team and tagged for governance and cost tracking.



Accounts and resources are deployed and managed using Infrastructure as Code (IaC).

**Controlled Model access**

When using Amazon Bedrock, you control which models the applications have access to using SCPs and [IAM identity-based policies.](<https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html#security_iam_id-based-policy-examples-deny-inference>) Your agents can use these models directly or via a generative AI gateway such as [LiteLLM.](<https://www.litellm.ai/>) With a gateway, you centralize access control and simplify governance implementation across multiple model providers while providing a unified API interface for rate limiting per user or agent, token budgeting, cost tracking and budget enforcement, model routing based on security policies, and centralized audit trails for compliance. AWS has published guidance on how to deploy a generative AI gateway. We initially placed the gateway in shared services for simplicity, but found it harder to attribute costs to individual agents and moved it to application accounts.

**Identity and Access Control**

You can use [AWS Identity and Access Management (IAM)](<https://aws.amazon.com/iam/>) for fine-grained access control. Additionally, with AgentCore Identity you manage authentication and authorization across your agents, with fine-grained access controls and cross-agent authentication protocols that maintain security boundaries as requests propagate through your system. For more information refer to [Amazon Bedrock AgentCore Identity: Securing agentic AI at scale](<https://aws.amazon.com/blogs/machine-learning/introducing-amazon-bedrock-agentcore-identity-securing-agentic-ai-at-scale/>). [AWS CloudTrail](<https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html>) can be used for comprehensive audit logging and forensic analysis.

**Data governance**

Data flows through multiple touchpoints: user inputs (text, attachments), agent instructions, outputs, accessed data sources, and memory operations, each presenting potential security risks. Configure [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) to evaluate user prompts and model responses against your safety policies and to protect against threats like inadvertent PII disclosure. For detailed set-up instructions to implement guardrails and integrate them with a generative AI gateway refer to [Safeguard generative AI applications with Amazon Bedrock Guardrails.](<https://aws.amazon.com/blogs/machine-learning/safeguard-generative-ai-applications-with-amazon-bedrock-guardrails/>)

In addition to the above, use version control of evaluation datasets (with a few hundred examples) and systematically track changes to documents and generated embeddings within RAG knowledge bases to support evaluation and auditing requirements.

**Memory**

In agentic applications, data represents underlying facts, documents, and structured information agents query (knowledge bases, databases, APIs) accessed through retrieval mechanisms like RAG, governed through traditional access controls. On the other hand, memory is the agent’s working context (what it retains about conversations, user preferences, and interaction patterns). It is dynamic and conversational, evolving with each interaction.

With [AgentCore Memory](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html>) you get short-term memory and long-term memory with built-in and custom strategies for memory extraction. You can also override extraction logic or implement self-managed strategies for specialised requirements. Namespaces, which are defined at creation time as part of the strategy configuration in long-term memory, organise memory by actor, session, or strategy. They provide the structure that helps personalisation and shared learning across users. AgentCore Memory scopes data to individual aggregates at actor level. When agents need to learn cross-user patterns, memory can aggregate at higher application-wide levels. In a multi-account deployment pattern, each account (dev, pre-prod, prod) has its own AgentCore Memory resources that teams deploy and manage alongside their applications. This deployment pattern helps with security isolation, independent scaling, alignment with data residency requirements, and cost allocation per application.

Applications can access multiple memory resources. The following diagram illustrates this approach, showing how two applications, a fraud and a claims application, access risk signals and policy details from their dedicated resources, and user details from a shared memory resource. You can [control which memory resources and information they have access to with IAM policies](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory-organization.html>).

**Tool governance**

Agents call tools on behalf of users but not every user should trigger every tool with every parameter. You can use [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) to govern tools and transform APIs, Lambda functions, and services into MCP-compatible tools accessible through a single, secure endpoint. It works with AgentCore Identity to manage both inbound authentication (verifying agent identity) and outbound authentication (connecting to tools via OAuth, token refresh, credential storage) so that agents do not handle credentials directly. You define which runtimes, tools, and backends the agent can reach, enforced by IAM/resource policies and workload identities. Identity establishes the perimeter and answers “who you are” and “what infrastructure you can access”.

Policy in AgentCore intercepts tool requests routed via Gateway, evaluating requests against deterministic policies expressed in [Cedar,](<https://www.cedarpolicy.com/en>) AWS’s open-sourced policy language, before allowing tool access. It answers, “are you allowed to do this right now” (e.g. can you open a claim exceeding 1 million?). You get auditable enforcement across agent interactions, reducing the risk of policy bypass through agent manipulation.

The following diagram shows how the above services work together. The same pattern applies to each one of the dev, pre-prod and prod accounts.

To see how these governance and identity patterns work at enterprise scale, [see how Swisscom builds agentic AI for customer support and sales with Amazon Bedrock AgentCore](<https://aws.amazon.com/blogs/machine-learning/how-swisscom-builds-enterprise-agentic-ai-for-customer-support-and-sales-using-amazon-bedrock-agentcore/>).

With governance boundaries in place, you need consistent mechanisms to build, version, and deploy agents, tools, and memory configurations across environments.

### Pillar 2: Build & Operations

Agents depend on infrastructure, resources, tools, and models that can change independently. You need operational discipline to avoid an update of a tool owned by another team, impacting your agent, or a memory misconfiguration inadvertently disclosing user context. Treat every component as a versioned, deployable artifact with its own repository:

  * **Infrastructure repository:** account setup, agent registry, resources (vector stores, agent and tool registries etc.) and seed code for reusable components.
  * **Agent repository:** agentic solution code with shared modules for tools, guardrails, policies, prompts, and evaluation frameworks (depending on the size of your business and your requirements, shared modules can be also in a separate repository).
  * **Tool repository:** tool code for tools with their own CI/CD, often deployed behind an MCP server.
  * **Application repository:** the business application that uses the agent; multiple applications can share the same agent.



With this separation, you have independent versioning, testing, and deployment while maintaining clear ownership and change tracking. The following diagram illustrates this approach:

**Environments and CI/CD Pipelines for agentic applications**

Developers working in the dev account clone the repositories with the seed code. As they develop their application and agents, they modify: 1. the agent code, including the shared modules, and the IaC templates to provision AgentCore resources for agents, 2. vector stores using services such as [Amazon OpenSearch Serverless](<https://aws.amazon.com/opensearch-service/features/serverless/>), [Amazon S3 Vectors](<https://aws.amazon.com/s3/features/vectors/>) for embeddings or [Amazon Aurora with pgvector](<https://aws.amazon.com/about-aws/whats-new/2023/07/amazon-aurora-postgresql-pgvector-vector-storage-similarity-search/>), 3. data ingestion pipelines 4. application code that connects to the agent 5. changes to automated evaluation pipelines. Merging their changes triggers a CI/CD pipeline. This deploys IaC templates to the pre-prod account and packages application and agent code as container images pushed to [Amazon Elastic Container Registry (ECR)](<https://aws.amazon.com/ecr/>) in the shared services or pipeline account.

In pre-prod, automated tests run across seven dimensions: integration, performance, UAT, regression, security, agentic AI, and responsible AI. Agentic AI evaluation includes authentication flows, user context propagation, authorization validation for tool access, and agent-specific quality metrics. Agentic AI evaluation is the most complex, spanning multiple dimensions. For example, validating that a user’s identity and permissions propagate correctly across a multi-agent chain may require building custom test setups that simulate requests flowing across multiple agents to verify identity and permissions propagate correctly at each step.

**Agent lifecycle**

You create agents in your agent repository. You containerize your agent implementation, store the container image in ECR, and deploy it to AgentCore Runtime connecting to AgentCore Identity, AgentCore Memory resources, and account-level and shared AgentCore Gateway. When you are ready to merge the changes, the CI/CD pipeline packages the agent as a container image, pushes it to ECR, and deploys to AgentCore Runtime in pre-prod.

The pipeline also registers or updates the agent’s metadata as a structured record in [AWS Agent Registry in ](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/registry.html>)AgentCore. With AWS Agent Registry, you have a centralized place to discover, share, and reuse agents, MCP servers, tools, and agent skills across your organization. It supports automatic metadata ingestion from MCP and A2A endpoints and tracks records through an approval workflow (draft → pending → approved) before they become discoverable organization-wide. You invoke agents directly or via A2A or as targets behind an MCP server. In pre-prod, it runs automated tests before promotion to production. The IaC templates in the infrastructure repository define the Runtime, Memory resources, and IAM roles for consistent infrastructure across environments.

Each AgentCore Runtime [maintains immutable versions automaticall](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agent-runtime-versioning.html>)y. You can create endpoint aliases (like DEV, PREPROD, and PROD) that point to specific versions, to implement independent promotion, instant rollback, and version management within your deployment workflow.

Tag every agent with owner, cost center, and use-case ID, and use AWS CloudTrail for audit trails.

**Tool lifecycle**

Agents invoke tools directly (for built-in capabilities), via an AgentCore Gateway endpoints in the same account, or via shared AgentCore Gateway endpoint(s) in the shared services account which points to approved org-wide tools. Each tool exposed via the AgentCore Gateway has its own lifecycle and CI/CD pipeline to get deployed to pre-prod.

To register your tool to the AgentCore Gateway, define a manifest in your tool repository specifying the Gateway the tool belongs to (shared or application specific), auth method, requested prefix and compliance metadata. On merge, the CI/CD pipeline injects the endpoint from environment-specific config, validates the manifest, the tool’s prefix, and registers the tool as target. For that, it calls [CreateGatewayTarget](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_CreateGatewayTarget.html>) and [SynchronizeGatewayTargets](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_SynchronizeGatewayTargets.html>), using templates from the infrastructure repository. This way, you can implement consistent tool names and use IAM policies to restrict direct Gateway access to the Gateway only. Application teams control what gets registered and the platform team where and how.

**Memory**

Treat memory configuration like other deployable artifacts that are versioned, tested, and promoted through your CI/CD pipeline. Version control memory resources, TTL configurations, extraction strategies, and namespace structures and deploy them through your CI/CD pipeline for identical behaviour across environments with no manual configuration or drift. Apply automated testing to validate memory persistence, LTM extraction quality, namespace isolation, and cross-session retrieval before promotion to production.

To see how these build and operational patterns work at enterprise scale, see [how Allianz designed AIOps at enterprise scale with Amazon Bedrock AgentCore.](<https://www.youtube.com/watch?v=GYNeA7NZE3w>)

Reliable pipelines get your agents to production. Structured, multi-level evaluation catches any issues.

### Pillar 3: Evaluation

Agents can fail in ways that are not immediately obvious. A wrong tool selection, a missed context, or a hallucinated response can be hard to detect. Structured evaluation across multiple levels (tool, conversation turn, session outcome, and system) helps prevent these failures from reaching production. The evaluation lifecycle steps are:

  1. Build the agent,
  2. Find, create, update datasets, usually by capturing traces from Agent execution or using inputs from domain experts
  3. Select evaluators and metrics to track
  4. Select the model to judge the outputs of the agents
  5. Build/configure infrastructure to serve these evaluations
  6. Record results, save in Amazon S3, synthesize insights, and adjust
  7. Monitor in production, set-up Amazon CloudWatch alarms to capture drift and human reviews



If you followed[ Part 1: GenAIOps](<https://aws.amazon.com/blogs/machine-learning/operationalize-generative-ai-workloads-and-scale-to-hundreds-of-use-cases-with-amazon-bedrock-part-1-genaiops/>), your evaluation foundation remains relevant, but agentic applications introduce additional requirements: you still need to evaluate LLMs but now also a chain of decisions, tool invocations, and memory retrievals that compound across a conversation.

In Agentic workflows, evaluation occurs at four distinct levels per agent:

#### 1\. Tool Level (Span-Level)

First, evaluate the tool itself. For **deterministic tools** like APIs, this can include unit tests to verify expected behavior, and performance metrics such as latency and timeouts. For **LLM-backed tools** like RAG, evaluate model performance metrics using human-in-the-loop or LLM-as-a-Judge. Example metrics include correctness, helpfulness, relevance, harmfulness, and style/tone. For **data retrieved from knowledge bases,** evaluate retrieval quality, chunk relevance, and freshness. Check how to build [strong data foundations](<https://d1.awsstatic.com/psc-digital/2024/gc-600/10-tips-genai/10-tips-for-building-a-data-foundation-for-genai.pdf>) to be successful. **For multimodal tools** (audio-to-audio, image generation, video creation), evaluate modality-specific quality metrics (image fidelity, audio clarity, video coherence), cross-modal consistency (does generated content align with text instructions?), safety and content policy compliance, and generation latency.

Second, evaluate the agent’s use of the tool. Verify that the agent reasons and plans correctly, selects the appropriate tool for a task and extracts the relevant parameters accurately from user queries. Key metrics include tool selection accuracy, parameter extraction accuracy, and tool response latency and error rates.

#### 2\. Conversation Turn Level (Trace-Level)

At this level, you evaluate a single turn of conversation (one input-output pair) to identify specific problematic responses and quality issues. Some example metrics are: Correctness (is the information factually accurate), Helpfulness (How useful is this specific response?) Faithfulness (Is the response grounded in provided context?), Response Relevance (Does it address the user’s query?), Conciseness, Coherence, Instruction Following, Refusal, Harmfulness, Stereotyping. There are additional metrics to evaluate in multi-agent systems, some examples are: agent orchestration accuracy (can the orchestrator correctly route requests to the appropriate agents and coordinate handoffs between them?), quality of information exchange between agents, agent collaboration on shared tasks.

#### 3\. Session Outcomes Level

This level examines whether the agent achieved the user’s goal across the full conversation. A correct individual response does not guarantee a successful outcome. Key metrics include task completion rate, goal accuracy, conversation efficiency, and memory consistency.

#### 4\. System-Level Metrics

At this level, you evaluate production-readiness and operational performance factors. Some example metrics are end-to-end latency, time-to-first-token, throughput, tool call error rates, loop detection, and cost per completed task. You may also have custom success metrics that reflect your use-case or business requirements. For example, domain specific requirements, compliance with regulatory rules or with branding guidelines.

### On-demand and online evaluations

In addition to the 4 levels, agentic evaluation runs in two modes that serve different needs:

**On-demand evaluation** runs against specific spans, traces, or sessions during development and as a quality gate before every release. You provide reference inputs alongside session spans as the gold standard to compare results against. Targeted testing includes turn-by-turn debugging, component validation, and CI/CD integration. Pre-deployment testing includes stability validation, turn-level metrics, and component monitoring. This immediate feedback drives an iterative loop to refine models, prompts, tools, and logic.

**Online evaluation** continuously monitors live production traffic with configurable sampling rates, from low-volume sampling to full traffic coverage. It samples conversation quality, turn-level metrics, and component monitoring in production sessions, during A/B testing, and during full rollout. Continuous outputs feed into Amazon CloudWatch dashboards for ongoing monitoring.

The following image shows this workflow:

In local development and the development account you run on-demand evaluation for rapid iteration. In pre-production, on-demand evaluation becomes a pipeline gate. The build does not promote to production until evaluation passes. In production, online evaluation takes over, continuously sampling live traffic and alerting you when quality drops. You should detect quality issues before your users do. When evaluation detects a quality drop, results feed directly into your human review queue or trigger an automated rollback through your CI/CD pipeline.

**Environment** | **Trigger** | **Coverage** | **Gate**  
---|---|---|---  
Development | On-demand, manual and automated | Tools, traces, spans, and sessions. Ground truth evaluations. | Must pass before pre-production  
Pre-production | CI/CD pipeline | Regression, integration, performance, and UAT | Must pass before production promotion  
Production | Continuous, sampled live traffic | Online evaluation | Automated alerts on quality degradation  
  
In AWS, with [Amazon Bedrock Evaluations ](<https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html>)you get LLM-as-a-judge capabilities and access to a team of human workers for evaluating model performance and effectiveness of Amazon Bedrock models and knowledge bases. With [AgentCore Evaluations](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/evaluations.html>) you have online and on-demand evaluation for your agents, while [Strands Evaluation](<https://strandsagents.com/latest/documentation/docs/user-guide/evals-sdk/quickstart/>) gives you a framework for evaluating tools and [Amazon Augmented AI](<https://docs.aws.amazon.com/augmented-ai/>) (A2I) brings human review into the loop. Check [Generative AI Atlas: Evaluating Agentic Framework Use Cases](<https://awslabs.github.io/generative-ai-atlas/topics/2_0_technical_foundations_and_patterns/2_6_model_evaluation_and_selection_criteria/2_6_4_domain_specific_evaluations/2_6_4_5_evaluating_agentic_workflow/2_6_4_5_evaluating_agentic_workflow.html>) for additional information on how to evaluate agents.

For performance metrics, you can use [Amazon CloudWatch](<https://docs.aws.amazon.com/cloudwatch/>) to extract logs and metrics and developer tools such [pytest](<https://docs.pytest.org/en/stable/>) and [JUnit](<https://docs.junit.org/>) to run unit tests on APIs.

Evaluation tells you whether your agent works at release time; observability tells you whether it keeps working, and why it stops.

### Pillar 4: Observability and monitoring

Observability is where the AgentOps cycle completes. The telemetry it produces feeds back into governance decisions, informs the next evaluation cycle, and shapes how you build and deploy in the next iteration. You need visibility across four distinct layers for your production agents:

  1. **Agent & framework telemetry** to audit what your agent decided and did, the reasoning steps, model calls, tool invocations, and responses generated by your agent framework such as the Strands SDK.
  2. **Service telemetry** to understand what happened inside the AgentCore services your agent depends on such as memory reads and writes, gateway authentication and routing operations, identity and policy evaluations, and built-in tool calls. These operations happen outside the framework and are invisible to framework-level instrumentation.
  3. **Infrastructure telemetry** to monitor the environment hosting your agent and tools, for example runtime container metrics, and Lambda execution data.
  4. **Application telemetry** to capture the metrics your business needs that are distributed operations across multiple agents and applications



These are the types of data you should be capturing:

**Execution tracing:** every step, tool call, and LLM interaction

  * **Structured logging:** correlate logs across agents and runtimes
  * **Metrics and alerting:** latency, input and output token usage, Time To First Token (TTFT), and error rates, tool invocation count and model invocation count. Set alarms before users are affected.
  * **Memory:** what agents remember and why; catch misconfiguration before it inadvertently discloses user context.
  * **Responsible AI:** toxicity, bias and similar metrics, hallucination rates, and PII leakage.
  * **Cost tracking:** token spend per session, agent, and task; know whether your agent is economically sustainable at scale
  * **Human-centric metrics:** satisfaction, trust, and re-engagement; every other metric tells you how your agent performed, this one tells you whether it mattered.



Check that your support teams, stakeholders, and domain experts have access to the relevant dashboards to be able to act on these metrics, for instance using [IAM identity-based policies.](<https://docs.aws.amazon.com/bedrock/latest/userguide/security_iam_id-based-policy-examples.html>)

There are three layers for observability and monitoring: instrumentation ([OpenTelemetry SDK](<https://opentelemetry.io/docs/languages/php/sdk/>), either embedded directly or via framework-native support), a collection and processing layer ([AWS Distro for OpenTelemetry Collector or ADOT ](<https://github.com/aws-observability/aws-otel-collector>)), and an analysis backend (for example Amazon CloudWatch) .Agent frameworks like the Strands SDK include built-in OpenTelemetry (OTEL) instrumentation. For Python-based agents, you can bootstrap auto-instrumentation using the opentelemetry-instrument command. Telemetry is exported via [OpenTelemetry Protocol](<https://opentelemetry.io/docs/specs/otel/protocol/>) (OTLP), to an ADOT collector, which handles sampling, filtering, batching, and routing. In development you can export directly to a backend, but in production we recommend using the Collector as an intermediate layer.

When your architecture spans multiple agents on different frameworks, OpenTelemetry’s W3C Trace Context propagation passes a shared trace ID across every agent and service, giving you the complete execution path in one view. For requests that share a logical session but span separate traces, you can use OpenTelemetry Baggage to propagate session IDs across service boundaries. For the backend, we’ve seen two approaches, using AgentCore Observability and its dashboards powered by Amazon CloudWatch or third-party tools via OpenTelemetry.

**Approach 1: Using AgentCore Observability in Amazon CloudWatch**

With Amazon CloudWatch, you get two dashboards for agentic workloads.

The [CloudWatch model invocation dashboard](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/model-invocations.html>) covers Bedrock model metrics including latency, token counts, throttles, and error counts, with additional filters for timing patterns, tool usage, and knowledge lookups.

The [Bedrock AgentCore Observability](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html>) dashboard gives you a comprehensive view of agent workflows (traces, cost, latency, tokens, and custom metadata) with IAM access controls, PII redaction, and trace summaries for troubleshooting. It is powered by CloudWatch Transaction Search which converts spans to semantic convention format and stores them as structured logs in the aws/spans log group, making every span searchable and analysable. CloudWatch Application Signals correlates generative AI application telemetry with underlying infrastructure metrics for unified end-to-end troubleshooting.

AgentCore Runtime automatically configures required log groups, IAM permissions, and OTEL environment variables and applications only need to add the OpenTelemetry SDK as a dependency. AgentCore also emits service metrics to CloudWatch for its managed resources, including Memory, Gateway, built-in tools, Identity, and Policy. For example, you get real-time visibility into memory operations, including invocations, latency, system errors, user errors, throttles, and record numbers for events and memory. In multi-account deployments you build and manage centralized dashboards in the monitoring account, reconstructing the views that exist natively in individual accounts.

#### **Approach 2: third-party Observability via OpenTelemetry (OTEL)**

Because AgentCore Runtime exports telemetry via standard OpenTelemetry protocols, it integrates with third-party observability solutions, such as [LangFuse](<https://langfuse.com/>), that specialize in agent-centric telemetry.You can use such tools in two ways:

**Self-managed third-party deployment:** Deploy the observability tool in a shared AWS account or VPC, exposed via a secure TLS endpoint. Agents on AgentCore Runtime in other accounts export OTEL traces and metrics directly using OTLP over HTTPS. Connect accounts via Transit Gateway and secure traffic with credential rotation, API keys, and network access policies. Data governance, retention, and privacy controls remain under your direct management.

**Third-party SaaS:** Agents send OTEL data to a managed cloud endpoint (e.g., LangFuse Cloud, Arize Cloud). Authorisation uses vendor API keys, and traffic flows over the public internet or via VPC endpoints depending on the tool. This enables fast onboarding and operational scaling, but telemetry data leaves your AWS environment.

The telemetry from observability feeds back into agent design, operational improvement decisions, and evaluation refinements, closing the AgentOps loop.

## Conclusion

Building production-grade agentic AI is hard. Agents make autonomous decisions, call external tools, and collaborate in ways that are difficult to anticipate and harder to debug. In this post, we have shared the practices we have seen work in production across the four pillars: governance and security, build and operations, evaluation, and observability.

We encourage you to start applying these practices in your projects and share your experiences. Start by implementing Pillar 1 (Governance & Security), multi-account isolation, then progress to CI/CD for agents, add evaluation gates, and observability. Check out the [AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/>) to get started.

* * *

## About the authors

### Anastasia Tzeveleka

Anastasia Tzeveleka is a Principal Generative AI/ML Specialist Solutions Architect at AWS. Her experience spans the entire AI lifecycle, from collaborating with organizations training cutting-edge Large Language Models (LLMs) to guiding enterprises in deploying and scaling agentic AI applications powered by these models.

### Anna Grüebler Clark

Anna Grüebler Clark is a Senior Specialist Solutions Architect at AWS focusing on Artificial Intelligence and generative and agentic AI. She has more than 16 years experience helping customers develop and deploy machine learning applications. Her passion is taking new technologies and putting them in the hands of everyone, and solving diﬃcult problems leveraging the advantages of using traditional, generative and agentic AI in the cloud.

### Antonio Rodriguez

Antonio Rodriguez is a Principal Generative AI Specialist Solutions Architect at Amazon Web Services. He helps companies of all sizes solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. Apart from work, he loves to spend time with his family and play sports with his friends.

### Sergio Garces Vitale

Sergio Garces Vitale is a Senior Solutions Architect at AWS, specialized in generative AI. With over 10 years of experience in the telecommunications industry, where he helped build data and observability platforms. Over the past 5 years, Sergio has been focused on guiding customers in their cloud adoption and designing AI solutions, from traditional ML to generative and agentic AI, that deliver real business impact.

### Aris Tsakpinis

Aris Tsakpinis is a Senior Specialist Solutions Architect for Generative AI focusing on open source models on Amazon Bedrock and the broader generative AI open source ecosystem. Alongside his professional role, he is pursuing a PhD in Machine Learning Engineering at the University of Regensburg, where his research focuses on applied natural language processing in scientific domains.
