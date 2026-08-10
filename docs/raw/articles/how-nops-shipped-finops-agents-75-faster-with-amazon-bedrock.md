---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-nops-shipped-finops-agents-75-faster-with-amazon-bedrock-agentcore
ingested: 2026-08-11
feed_name: AWS China ML
source_published: 2026-08-10
sha256: 1faa72c1287896b47fa36dbcaeab64e5690b393ad07b31858a350a0e66bc253d
---

# How nOps shipped FinOps agents 75% faster with Amazon Bedrock AgentCore

[nOps](<https://nops.io/>), an AI-powered cloud optimization solution, recently reimagined its Financial Operations (FinOps) analytics capabilities by transitioning to [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>). Amazon Bedrock AgentCore is a service to build, connect, and optimize agents at scale, with any framework or model. The new foundation helps nOps better serve customers managing commitment optimization across Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. Through continual optimization of commitments such as Reserved Instances and AWS Savings Plans, nOps helps teams maximize savings, reduce risk, and automate away the operational burden of manual FinOps. Today, nOps supports customers representing more than USD $4 billion in cloud spend under management.

In this post, we explain how nOps transitioned our analytics and agent experience to accelerate product delivery, improve response quality, and reduce operational complexity using Amazon Bedrock AgentCore, Databricks Lakehouse Metric Views, Databricks Lakebase, Amazon DynamoDB, and Vercel.

## Scaling FinOps AI beyond the limits of API-centric infrastructure

As we expanded our product portfolio and customer base, the infrastructure, front-end, and back-end teams needed to support increasingly complex analytics workflows while maintaining high reliability and multi-tenant isolation. Existing infrastructure patterns introduced friction:

  * **Response latency and inconsistency:** Long context messages from API-based data access increased latency and reduced response consistency.
  * **System complexity:** Multiple orchestration and observability layers increased system complexity.
  * **Innovation drag:** Engineering time was increasingly consumed by infrastructure maintenance rather than product innovation.



> _“We were attempting to build advanced AI capabilities on top of infrastructure that wasn’t designed for analytics-driven agents, which made iteration slow, complex, and prone to inaccuracies.”_

— Jordan Stein

## Current state

Before transitioning, we introduced Clara, our FinOps AI agent, on top of existing infrastructure components including Kubernetes, Amazon Bedrock model invocation, LangChain/LangGraph orchestration, and tool wrappers around web APIs.

This allowed rapid initial delivery, but it also revealed structural limits:

  * **Slower time to insight** : API-shaped data and large context windows increased turn latency.
  * **Operational overhead** : Multiple non-purpose-built layers made iteration and debugging harder.
  * **Data path mismatch** : Agent answers were tied to API responses instead of a dedicated semantic analytics layer.



To address this, we shifted to a purpose-built architecture centered on Amazon Bedrock AgentCore for runtime/orchestration, Databricks Metric Views for governed analytics semantics, and Databricks Lakebase for durable application state. We chose Bedrock AgentCore for its managed agent runtime, built-in memory, and orchestration, along with the freedom to use any framework or model. With this freedom, we built on Strands and evolved our model choices without switching services, so the team could focus on domain logic rather than infrastructure.

## Solution overview

We designed the new architecture to scale with demand, produce accurate answers, and allow developers to ship faster.

The following diagram illustrates the end-to-end architecture of the nOps Clara solution built on Amazon Bedrock AgentCore:

  
Figure 1: End-to-end architecture of the nOps Clara solution on Amazon Bedrock AgentCore

The solution consists of:

  1. **Interaction layer:** A Vercel-hosted Next.js web application where customers interact with Clara through a conversational interface backed by streaming Server-Sent Events.
  2. **Agent runtime layer:** Amazon Bedrock AgentCore running a single Strands-based agent with direct tool access for canvas operations, query execution, datasource discovery, and workflow orchestration, which alleviates multi-agent routing overhead.
  3. **Data layer:** Databricks Lakehouse Metric Views providing a governed semantic analytics layer, with Databricks Lakebase (serverless PostgreSQL) storing durable application state such as sessions, canvases, and widget specifications.
  4. **Async workflow layer:** An event-driven execution path using Amazon DynamoDB job tracking, Amazon Simple Notification Service (Amazon SNS) and Amazon Simple Queue Service (Amazon SQS) notifications, and Amazon API Gateway WebSocket push for long-running analytics tasks that update the UI in real time.



### Web application

At the interaction layer, customers use Clara through a Vercel-hosted web application. Requests flow through a Next.js Backend for Frontend (BFF) that invokes Amazon Bedrock AgentCore. Clara runs as a Strands-based agent runtime that supports streaming responses and tool calling. **Users can invoke the same workflows manually that Clara calls through Strands tools.** This is an important requirement and building block for Clara because it requires the agent to perform tasks that follow the same procedures as a human would within the product requirements.

### Amazon Bedrock AgentCore backend

The runtime is deployed as a Docker container on Amazon Bedrock AgentCore, with the full infrastructure (runtime, memory, guardrails, queues, and worker functions) defined in a single AWS Cloud Development Kit (AWS CDK) stack. Clara uses a single-agent architecture rather than a multi-agent router: one Strands Agent with direct access to the following tools: canvas operations, query execution, datasource discovery, and workflow orchestration. This avoids the latency and error-propagation overhead of agent-to-agent handoffs while keeping tool dispatch deterministic.

Streaming is central to the experience. A custom merge layer sits between the Strands async stream and the Server-Sent Event output, handling three concerns in one pass:

  1. Heartbeats keep connections alive during long tool executions.
  2. A text buffer with word-boundary-aware flushing coalesces small model deltas into readable chunks to help prevent user interface (UI) flicker.
  3. A widget-poll worker interleaves real-time canvas update events into the same stream.



Clara uses [AgentCore memory](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html>) with three strategies (semantic facts, user preferences, and canvas summaries), so it learns how each user engages with their data over time. Preferences inform layout choices, default aggregations, and chart types. Facts capture organizational context such as account structures and cost allocation conventions. Canvas summaries preserve the analytical thread across sessions so users can pick up where they left off without re-explaining context. Sessions are scoped by canvas (not the ephemeral HTTP session), so conversation context persists across browser refreshes and reconnections.

For tenant isolation, [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) runs as a standalone pre-check on the raw user prompt before the agent is invoked, enforcing cross-tenant data access policies and prompt-attack detection. A tenant policy layer then sanitizes outbound stream chunks and widget events, redacting internal identifiers before they reach the front end.

### Data lakehouse

At the data layer, Clara no longer depends on generic product APIs for analytical context. Instead, it uses curated tools to execute Structured Query Language (SQL) against Databricks SQL Warehouse backed by [Databricks Lakehouse Metric Views](<https://docs.databricks.com/aws/en/business-semantics/metric-views>). This provides a governed semantic layer for measures and dimensions, improving consistency between conversational answers and dashboard outputs.

#### Example

Metric views compared to raw SQL (True Customer Cost)

User asks: “Show my true AWS Cost for the last 30 days by account.”

**Raw SQL Model Context Protocol (MCP) approach:** The tool must recalculate business logic every time across various AWS pricing programs and commitment-based discounts, then join and normalize those values before grouping by account.
    
    
    -- Raw SQL MCP approach
    -- User asks: "True Customer Cost for last 30 days by account"
    SELECT
        a.account_name,
        SUM(
            -- Base amortized cost
            COALESCE(c.amortized_cost, 0)
            -- Apply EDP discount
            - COALESCE(c.edp_discount_amount, 0)
            -- Apply PPA credits
            - COALESCE(c.ppa_credit_amount, 0)
            -- Add RI effective amortized component
            + COALESCE(c.ri_effective_cost, 0)
            -- Add Savings Plan effective amortized component
            + COALESCE(c.sp_effective_cost, 0)
        ) AS true_customer_cost
    FROM raw_cost_and_usage c
    JOIN account_dim a
        ON c.account_id = a.account_id
    LEFT JOIN pricing_adjustments p
        ON c.account_id = p.account_id
        AND c.usage_day = p.usage_day
    WHERE c.usage_day >= date_sub(current_date(), 30)
        AND c.usage_day < current_date()
        AND c.charge_type NOT IN ('Credit', 'Refund')
    GROUP BY a.account_name
    ORDER BY true_customer_cost DESC;

**Metric View MCP approach:** The tool queries a predefined measure, utilizing detailed comments and synonyms, (for example, `true_customer_cost`) with a dimension (`account_name`) and a time range (last 30 days).
    
    
    -- Metric View MCP approach
    -- Same user ask, but financial logic is pre-modeled in metric view measure
    SELECT
        account_name,
        SUM(true_customer_cost) AS true_customer_cost
    FROM mv_true_customer_cost
    WHERE usage_day >= date_sub(current_date(), 30)
        AND usage_day < current_date()
    GROUP BY account_name
    ORDER BY true_customer_cost DESC;

**Result:** One governed definition of True Customer Cost, simpler MCP logic, and consistent outputs across chat and dashboards.

**How a Metric View measure appears to a large language model (LLM)**

**ID:** `true_customer_cost`  
**Display Name:** True Customer Cost  
**Comment:** The true cost of a customer’s spend after taking credits, refunds, commitments, and discounts, such as Enterprise Discount Program (EDP) and Private Pricing Agreements (PPA).

**Synonyms:** Custom fields to be used for LLM analysis. We have co-opted Synonyms for use with key:value pairs to send additional metadata to the front end.

### State layer

At the state layer, Databricks Lakebase (serverless PostgreSQL) stores durable product objects, sessions, canvases, widgets, and query/chart specifications, so insights generated in chat can be promoted into persistent, shareable analytics artifacts.

### Analytics workflow

For long-running analytics workflows, we introduced an asynchronous execution path using workflow workers, Amazon DynamoDB job tracking, Amazon SNS and Amazon SQS notifications, and Amazon API Gateway WebSocket push. Clara can then provide responsive user interactions while heavy processing completes in the background and updates the UI in real time.

### Result

Together, these components form a single, managed architecture where:

  * Amazon Bedrock AgentCore runs agent runtime and orchestration.
  * Databricks Lakehouse Metric Views drive governed analytics queries.
  * Lakebase stores durable application and dashboard state.
  * Async workflows and WebSockets provide scalable real-time user experience (UX).



## Outcome

By restructuring Clara around Amazon Bedrock AgentCore and a Lakehouse-first analytics model, we established a more scalable foundation for AI-powered FinOps workflows.

### Development velocity

  * 75 percent reduction in time-to-production, from 10–12 months to 4 months after replacing a self-managed Amazon Elastic Kubernetes Service (Amazon EKS) stack with a single managed service.
  * 4–6 production-ready agents now serving analytics across a shared runtime.



### Response quality

  * 81.7 percent Correctness score (up 145 percent over the previous period), compared to approximately 65 percent in v1.
  * 79.4 percent Helpfulness score (up 138 percent over the previous period).
  * Tool failure rate reduced from 7.49 percent to 0.92 percent after adopting Amazon Bedrock AgentCore with a new tool-calling method.



### Operational efficiency

  * 75 percent time reduction for manual analysis, from an estimated 2 hours to 30 minutes for Customer Success Managers and Solutions Architects.
  * Reduced daily manual effort for customer success, solutions architecture, and account executive teams through streaming responses and push-based workflow completion.



### Infrastructure simplification

  * Removed the LangGraph/LangChain orchestration layer entirely, replaced by AgentCore runtime and AgentCore memory, along with built-in request routing and observability. This freed engineering teams to focus on product differentiation.



## Conclusion

We transformed Clara from a layered, API-centric AI assistant into a unified, agent-native analytics system. By combining Amazon Bedrock AgentCore with Databricks Lakehouse Metric Views and Lakebase, we created a repeatable pattern for building enterprise AI analytics experiences that stay accurate at scale without heavy operational overhead.

To learn more about building agent-native applications, visit [Amazon Bedrock AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/>). To see how we use these capabilities in production, visit [nops.io](<https://www.nops.io/finops-ai-agent/>).

* * *

## About the authors

### Jordan Stein

[Jordan](<https://www.linkedin.com/in/jphs/>) is Director of Product and Engineering at nOps, where he leads development of the company’s Platform and AI products. His work focuses on building multi-cloud capabilities that help organizations manage and optimize infrastructure across Amazon Web Services, Microsoft Azure, and Google Cloud Platform.

### Benjamin White

[Benjamin](<https://www.linkedin.com/in/benjamin-white-35201a14a>) is a Software Engineer at nOps, where he develops AI-driven features that help customers make sense of their cloud costs. His background spans data workflows, media post-production, and building solutions for complex production environments.

### Ren Liu

[Ren](<https://www.linkedin.com/in/renliu11/>) is an Associate Solutions Architect at AWS in Seattle, specializes in cloud governance and real-time streaming data architecture. He supports independent software vendors (ISVs) in FinOps, cybersecurity, and healthcare to architect secure, scalable solutions powered by generative AI.

### Aditi Gupta

[Aditi](<https://www.linkedin.com/in/aditisgupta/>) is a Senior GenAI Specialist Solutions Architect at Amazon Web Services. She has 18+ experience in designing and developing highly scalable and reliable systems for many government agencies and large-scale enterprises. Her interests include Big Data, Artificial Intelligence and Machine Learning.
