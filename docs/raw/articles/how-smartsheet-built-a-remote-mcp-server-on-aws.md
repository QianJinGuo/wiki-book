---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-smartsheet-built-a-remote-mcp-server-on-aws
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-17
sha256: 8a18f3d0d088202a37fc2e7605f0a9dfcc431cdac61203bc9df13cb40347a9f1
---

# How Smartsheet built a remote MCP server on AWS

[Smartsheet](<https://www.smartsheet.com/>) is an enterprise work management platform that hundreds of thousands of organizations rely on. As enterprise teams adopt AI agents, those agents need structured access to the data inside systems like Smartsheet, but most systems aren’t built for that. To bridge this gap, Smartsheet built [a remote Model Context Protocol (MCP) server](<https://developers.smartsheet.com/ai-mcp/smartsheet/mcp-server>) on AWS that gives AI clients direct access to its data and capabilities. AI assistants like [Amazon Quick](<https://aws.amazon.com/quick/>) and Claude Desktop help users interact with Smartsheet’s capabilities through natural language, analyzing project data, updating tasks, creating sheets, managing workspaces, and more.

Enterprises are also building custom AI agents for workloads that run without human prompting. These AI agents can work autonomously in their roles, coordinating through Smartsheet using MCP. A few examples are capturing requirements, picking up tasks, attaching test results, drafting documentation. These happen in the same sheets their human counterparts use, compressing workflows that took weeks into days or hours.

The MCP server connects to Smartsheet’s existing APIs and central intelligence layer. It also adds an AI-optimized interface on top, designed to minimize token cost, help prevent hallucination, and help large language models (LLMs) work reliably with enterprise data. Since launch, Smartsheet saved over 3 billion tokens, based on internal telemetry, through these optimizations.

In this post, we cover a high-level view of the Smartsheet remote MCP architecture, with a focus on the AWS infrastructure behind it. This includes security, governance, scaling and deployment, and the AI-specific optimizations Smartsheet built on AWS.

## Architecture

One MCP layer serves both internal and external agents. Smartsheet’s own Smart Assist (the in-product AI experience) and externally connected AI clients like Amazon Quick run on the same infrastructure, with the same tools, optimizations, and intelligence stack. This parity is a deliberate architectural choice: Smartsheet builds once and every agentic client benefits immediately.

The architecturally critical AWS services in the data path are:

  * **[AWS Fargate](<https://aws.amazon.com/fargate/>) for [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>)** for stateless server containers.
  * [**Amazon Kinesis Data Streams**](<https://aws.amazon.com/kinesis/data-streams/>) and [**Amazon Managed Service for Apache Flink**](<https://aws.amazon.com/managed-service-apache-flink/>) for change-event ingestion into [**Amazon Simple Storage Service (Amazon S3)**](<https://aws.amazon.com/s3/?nc=sn&loc=1>).
  * [**Amazon Bedrock**](<https://aws.amazon.com/bedrock/>) and [**Amazon Neptune**](<https://aws.amazon.com/neptune/>) for LLM inference and knowledge graph powering cross-project insights.



The detailed architecture flow is as follows:

  1. **AI clients to API gateway layer to MCP Server** : Requests pass through an API gateway layer ([AWS WAF](<https://aws.amazon.com/waf/>), [AWS Shield](<https://aws.amazon.com/shield/>), AWS Application Load Balancer, and OAuth validation) before reaching the MCP server on AWS Fargate.
  2. **MCP Server to Domain Services** : The MCP server calls Smartsheet’s domain services through their APIs for transactional operations.
  3. **MCP Server to Intelligence Layer** : The MCP server queries the Intelligence Layer built on Amazon Neptune and Databricks for cross-project agentic insights.
  4. **Domain Services to Intelligence Layer** : Change events stream through [Amazon Kinesis](<https://aws.amazon.com/kinesis/>) and Apache Flink into the Amazon S3-backed intelligence layer. The Intelligence Layer follows the medallion architecture.



_Figure 1: Smartsheet MCP Server architecture on AWS._

Supporting services such as edge protection, container registry, observability, secrets appear in the relevant sections in the following sections.

## Deployment and scaling

On the scaling side, AI traffic differs from conventional request patterns. Agents autonomously orchestrate sequences of tool calls, firing several requests in a second as they work through a task, then going quiet while the model reasons. This bursty pattern demands a scaling strategy that responds to both sudden spikes and sustained throughput.

To handle and validate this pattern, Smartsheet built the MCP server to run on AWS Fargate for Amazon ECS. ECS Auto Scaling uses target-tracking policies, combining traffic volume with compute utilization. Compute-aware scaling matters here because each request involves server-side processing like LLM-optimized serialization, not only proxying. Extensive load testing under production-like traffic patterns validated that the infrastructure absorbs agent bursts without degradation.

On the deployment side, shipping updates without disrupting active agent sessions is equally critical. Container images are stored in [Amazon Elastic Container Registry](<https://aws.amazon.com/ecr/>) (Amazon ECR) and rolled out by the continuous integration and continuous delivery (CI/CD) pipeline through a layered safety net. ECS deployment circuit breakers detect failing containers during rollout and automatically revert to the last stable version. Manual intervention is not needed, and customer impact is avoided.

Deployments roll out to the smallest region first, following the [AWS Well-Architected](<https://docs.aws.amazon.com/wellarchitected/latest/framework/oe-design-principles.html>) principle of reducing impact radius. After each region, automated end-to-end tests validate tool behavior against the live environment. Canary tests run every 15 minutes, executing a multi-step MCP workflow through the full authentication and gateway path. Results feed into the monitoring stack so degradation surfaces before customer reports. The ECS Fargate with ALB pattern is documented in the [AWS Guidance for Deploying MCP Servers](<https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/>).

## Governance and observability

For enterprise customers, governance is the gating factor for AI adoption. Smartsheet built it into the tool framework itself: access control, error handling, and audit trails ship with every tool by default.

Access is tiered per organization: administrators can turn on AI access globally, restrict to non-destructive operations only, or open up full write and destructive capabilities, giving each organization control over their adoption curve. Tools carry MCP protocol annotations like `readOnlyHint` and `destructiveHint` so AI clients apply appropriate confirmation flows automatically.

The server emits OpenTelemetry signals (logs, traces, and metrics) across the full request lifecycle. Every tool invocation captures the maximum context possible within privacy constraints: user, organization, tool name, outcome, and more. This provides the foundation for usage insights and compliance auditing.

Agent traffic is harder to observe than traditional API traffic. A single user request can produce a chain of tool calls, and failures often trace back several steps. Smartsheet is extending its observability with agent-first identity and tracing, correlating context across tool chains. Logs stream through Amazon Kinesis into Amazon OpenSearch Service following the [AWS Observability Best Practices](<https://aws-observability.github.io/observability-best-practices/guides/containers/aws-native/eks/log-aggregation/>) pattern, with infrastructure metrics surfaced through Amazon CloudWatch. [Datadog](<https://www.datadoghq.com/>) provides per-tool application performance monitoring (APM) visibility, and [PagerDuty](<https://www.pagerduty.com/>) handles incident routing.

Every invocation also emits a structured analytics event through [Amazon Simple Queue Service](<https://aws.amazon.com/sqs/>) (Amazon SQS) into the Intelligence Layer. This closes the feedback loop: production usage data informs which tools to prioritize and how optimization strategies perform across real workloads.

## Securing AI agent traffic

The MCP server runs behind the same security infrastructure as Smartsheet’s production APIs. AWS WAF and AWS Shield are at the edge, with private subnets in a virtual private cloud (VPC), mutual TLS (mTLS) for service-to-service calls, and an OAuth2 proxy that rejects unauthenticated requests before they reach compute. The MCP server follows the defense-in-depth model in the [AWS Guidance for Deploying MCP Servers](<https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/>). The API gateway layer handles authentication and scope validation. Domain services handle fine-grained permissions. If a user can’t access a sheet through the UI, they can’t access it through MCP either.

AI traffic adds a distinctive rate-limiting challenge. A single user question can trigger several tool calls in seconds. Many enterprise users sit behind shared corporate proxies making IP-based rate limiting unreliable.

To address this, Smartsheet implemented layered rate limiting through AWS WAF. Three layers work together: blanket protection at the outer edge, per-user metering using custom aggregation keys on an identity header, and path-specific controls for expensive operations. Per-user metering means sessions are metered individually rather than pooled by IP. The layered rate limiting follows the [three most important AWS WAF rate-based rules](<https://aws.amazon.com/blogs/security/three-most-important-aws-waf-rate-based-rules/>) pattern.

## Testing non-deterministic AI workflows

Smartsheet maintains the standard testing layers: unit tests, integration tests, tool-level validation. The MCP server, however, introduces a testing challenge that traditional API services don’t face. A conventional API response gets rendered deterministically by the UI. An MCP tool response passes through an LLM first. The model interprets it, reasons over it, and generates what the user actually sees. That layer of non-determinism changes what “correct” means for testing.

Smartsheet invests heavily in end-to-end workflow tests that include the LLM in the loop. These tests simulate realistic business scenarios: creating workspaces, writing data, querying results, and verifying that the model’s interpretation makes sense to the end user. These tests run in the CI/CD pipeline (GitLab CI with runners hosted on AWS) and continuously as canary tests against each production AWS Region.

## Optimizing for AI consumption

As enterprises scale AI agent deployments, token consumption becomes a real cost driver. Every tool response costs money at the LLM and competes for context window capacity. Most MCP tool calls today run without sub-agent orchestration. The agent calls tools directly, one at a time, reasoning between each step. Without intelligent tool design, this gets slow, expensive, and error-prone fast. Each tool call must be self-contained and efficient on its own, which is why Smartsheet optimizes at three levels:

  1. [Progressive disclosure](<https://en.wikipedia.org/wiki/Progressive_disclosure>) that caps token consumption per response.
  2. Strongly typed tool schemas that help prevent hallucinated parameters and wasted calls.
  3. A proprietary serialization format that reduces token count by 35–47 percent on data-heavy responses.



### Progressive disclosure

Each tool response targets a token budget. The server dynamically calculates how many rows fit based on column count and data density. For example, a sheet with five columns can return more rows than one with 15 columns, but the total stays within budget. Whether a sheet has 50 rows or 50,000, the response size stays bounded. The model sees enough to orient, then narrows with filters based on what the user is actually asking about.

Metadata fields tell the model exactly what happened: `is_sampled` indicates whether data was truncated, `rows_in_sheet` gives the full count, `rows_actual` shows how many were returned, and `filters_applied` describes active filters. The model uses this to decide whether it has the full picture or needs to narrow its query with filters. Progressive disclosure is a server-side decision. The MCP server handles budgeting and sampling, while the metadata it returns gives the AI client the signals to orchestrate follow-up queries on its own.

_Figure 2: Progressive disclosure in action: the AI client receives sampled data with metadata, then makes targeted follow-up requests._

### Keeping LLMs grounded: Schema-driven tool contracts

Grounding the LLM is critical. Without constraints, models hallucinate parameter names, invent operators, and waste tokens on failed calls. Each tool publishes a strict JSON Schema through MCP’s tool discovery, generated from [Pydantic](<https://docs.pydantic.dev/>) models. Parameters are constrained to valid enums, column names are validated against the actual sheet before execution, and mismatches return structured errors with valid options instead of failing silently. Schema validation catches hallucinations at the boundary and means agents navigate the tool catalog reliably without trial and error.

### Token-efficient serialization

JSON’s structural overhead (braces, quotes, repeated keys) typically consumes 15–25 percent of a response’s token count. For a server returning spreadsheet data with thousands of rows, the overhead adds up fast.

Smartsheet built a proprietary serialization format that alleviates this overhead. Key names appear once instead of repeating per row, and structural syntax is replaced by delimiters that tokenize more efficiently. On a representative 33-item filtered query, the optimized response is approximately 3,900 tokens versus approximately over 6,000 tokens for the equivalent JSON, roughly 35 percent fewer tokens carrying the same information. At 1,000 rows the gap widens further, because JSON repeats key names on every object while the optimized format declares them once.

## What’s next for Smartsheet

AI agents integrate with Smartsheet through MCP today. In the first four weeks after general availability (GA), Smartsheet saw over 87 percent week-over-week user growth.

MCP is the distribution layer. What comes next is intelligence at the connection point itself. One example is resources that shape themselves to the person, team, and organizations using them. Another is agents that run autonomously on workflows, and a routing layer that lets specialists hand off reasoning to each other rather than starting cold on every step. Same MCP connection, different intelligence per customer, with no deployment required.

AWS is evolving its infrastructure to meet these emerging agentic requirements. [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) provides runtime execution, discovery, personalization, and governance by default. Smartsheet continues to adopt and shape these capabilities with AWS.

The MCP protocol itself continues to evolve. [Elicitations](<https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation>) allow human-in-the-loop confirmation before destructive actions. [MCP Apps](<https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/>) bring interactive UI directly into AI conversations. [Tasks](<https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks>) support asynchronous, long-running operations. Smartsheet is evaluating these as they mature.

AI moves fast. Building on AWS gives us the infrastructure to keep pace whether that means new protocols, new models, or entirely new agent architectures.

To connect to Smartsheet’s MCP server, visit the AWS Marketplace listing, or see the [Smartsheet MCP documentation](<https://developers.smartsheet.com/ai-mcp/smartsheet/install-the-smartsheet-mcp-server/connect-amazon-quick>).

* * *

## About the authors

### Vasil Kosturski

Vasil is a Principal Engineer at Smartsheet, where he leads the squad that built Smartsheet’s remote MCP server from concept through GA. He drove the system design, AWS architecture, and the AI-specific optimizations covered in this post. More broadly, he works across Smartsheet’s developer ecosystem and shapes its public API platform. Before Smartsheet he spent over a decade in distributed systems and real-time data, most recently as Lead Developer at Sportradar building large-volume Kafka-based event-processing pipelines. He is based in Plovdiv, Bulgaria.

### Galina Jordanowa

[Galina](<https://bg.linkedin.com/in/galina-jordanowa-12a72347>) translates complex AI and product capabilities into clear, strategic market narratives and GTM motions. With 26+ years in B2B SaaS marketing and a dev background that means she actually gets how builders think, she’s spent her career connecting technical depth with business impact and stays genuinely energized by what’s next in AI and the new ways it’s reshaping how teams build and work.

### Pyone Thant Win

Pyone is a Partner Solutions Architect at AWS, where she supports strategic ISV partners to bring AI-powered solutions to customers. She works at the intersection of cloud infrastructure and partner networks, helping partners leverage AWS services from AI/ML capabilities to data integration patterns to build deeper, more intelligent product experiences. Her work bridges hands-on technical partnership and go-to-market strategy, delivering joint solutions and industry offerings that reach shared customers.

### Rony Blum

Rony is a Senior Solutions Architect at AWS based in Seattle, working with ISV customers to design and implement advanced cloud architectures, specializing in SaaS solutions, multi-tenant systems, and Generative AI applications. Outside of work, Rony enjoys exploring the Pacific Northwest trails on foot and hitting the slopes during ski season.
