# Business intelligence at scale: Key obstacles

> 📊 Level ⭐⭐⭐ | 12.0KB

## How AWS SMGS uses an AI-powered conversational assistant to transform business management with Amazon Bedrock AgentCore

 

AWS leaders manage complex data across multiple hierarchies while making time-sensitive decisions that impact global operations. Traditional business intelligence relies on static dashboards and manual reports, which creates delays and limits organizational agility.

NarrateAI, our intelligent conversational solution, addresses this through conversational agentic AI powered by our data lake and [**Amazon Bedrock AgentCore**](https://aws.amazon.com/bedrock/agentcore/). Accessible through the **[Amazon Quick](https://aws.amazon.com/quick/)** conversational interface, NarrateAI delivers on-demand, context-rich business intelligence to leaders across AWS, from the Chief Executive Officer (CEO) to the field. By answering natural language questions about business performance, NarrateAI provides immediate, accurate, and actionable insights that remove barriers between leaders and their data.

In this post, we share how we built NarrateAI using **Amazon Bedrock AgentCore** to deliver business intelligence at scale for the AWS SMGS (Sales, Marketing and Global Services) organization. You will learn about:

*   The two-layer architecture that separates batch processing from real-time interaction.
*   The specialized AI agents that power intelligent routing and validation.
*   Key engineering patterns for production deployment.
*   How to build similar solutions with AWS services.

## Business intelligence at scale: Key obstacles

AWS faced challenges that limited the effectiveness of traditional business intelligence approaches:

**Time-intensive preparation**: AWS leaders traditionally lost hours gathering data manually before business reviews. The preparation process involved navigating multiple dashboards, reconciling data across disparate sources, and manually synthesizing insights, leaving little time for strategic reasoning and decision-making.

**Data fragmentation**: Business insights were scattered across multiple systems and dashboards, requiring leaders to piece together a coherent narrative from fragmented data sources. This fragmentation created inconsistencies in metrics and made it difficult to maintain a unified view of business performance across hierarchies and datasets.

**Limited accessibility**: Complex dashboards required specialized knowledge to navigate effectively, creating dependencies on intermediary reporting teams. Leaders could not access insights on-demand and instead had to wait for curated reports, which delayed critical business decisions and limited organizational agility.

## Solution overview

NarrateAI addresses the challenge of making complex business data conversational through a two-layer architecture: batch narrative generation and real-time interaction. This separation supports comprehensive data processing upfront while delivering instant, contextually accurate responses through natural conversation.

Amazon Bedrock AgentCore removed the need to build custom orchestration infrastructure, providing serverless architecture, built-in authentication, memory management, and integration with foundation models. This accelerated our deployment from months to weeks while maintaining production-quality observability and security through native [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) integration and automated session management.

### Automated narrative generation layer (batch processing)

NarrateAI batch-generates comprehensive persona-based narratives for each user through a three-stage pipeline:

1.  **Data extraction** — Configuration-driven Structured Query Language (SQL) templates (parameterized queries that adapt to each user’s role and permissions) extract structured data from [Amazon Redshift](https://aws.amazon.com/redshift/). These templates support multi-level breakdowns and time series analysis while enforcing user-specific access controls.
2.  **Data transformation** — [AWS Lambda](https://aws.amazon.com/lambda/) transforms the extracted data into structured JavaScript Object Notation (JSON) using section-type logic (objects, arrays, breakdowns, and containers) with field mappings and hierarchical organization.
3.  **Narrative rendering** — Jinja templates (a widely used Python templating engine) render human-readable narratives from the structured data. A hierarchical, business domain-aware chunking strategy handles large datasets efficiently. The system stores each user’s narrative as a text file in [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/), supporting row-level security through full data isolation.

### Conversational AI

## 深度分析

### The two-layer split is a latency/freshness tradeoff

NarrateAI's batch/real-time separation is pre-computation applied to BI: the expensive work (Redshift SQL extraction, Lambda transformation, Jinja rendering) runs offline in a three-stage pipeline, so the interactive layer only retrieves from pre-generated persona narrative files in S3. This mirrors the pre-generated knowledge pattern in [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) — retrieval works over curated, structured knowledge, which is why a table-of-contents (TOC) extractor pulls only relevant narrative sections without scanning whole files. The cost is freshness: answers are only as current as the Data Refresh Scheduler's cadence.

### Row-level security enforced at generation time, not query time

Permissions are applied during transformation, and each user's narrative file in S3 is fully isolated — access control is baked into data processing rather than guarded at query time. This "enforce access at the source" philosophy eliminates a class of RAG failure modes (retrieval-layer leaks, prompt-injection exfiltration, filter-bypass bugs) because unauthorized data never enters the artifact. The trade-off is refresh fan-out: 4,000+ users means one isolated narrative per user, regenerated across the permission matrix on each refresh. Context-awareness falls out of the same mechanism — the Persona Knowledge Identifier maps who is asking to which file.

### Hallucination defense is layered and deterministic-first

Because output drives executive decisions, model output is treated as untrusted: LLM involvement in numeric calculation is deliberately limited — numbers come from deterministic SQL and templates — and every response passes an Online Evaluator that cross-references figures against source data before delivery. Bedrock Guardrails add content filtering, PII redaction, and tone controls. The stated lesson: the LLM handles language and synthesis; computation and validation stay deterministic.

### Managed agent infrastructure compressed the build from months to weeks

Amazon Bedrock AgentCore replaced custom orchestration with serverless runtime, built-in auth, and native memory — the team migrated conversation history off a hand-rolled DynamoDB session store, deleting custom session code. OpenTelemetry-based observability cut troubleshooting from hours to minutes, and model flexibility (upgrading Claude versions without architectural change) pays dividends past initial deployment. What was NOT outsourced: domain logic — institutional knowledge encoded with domain experts through standardized templates.

## 实践启示

1. **Precompute what is asked often.** If most queries hit a known, role-shaped slice of data, batch-generating narrative artifacts offline beats answering live against the warehouse — latency collapses and answers become consistent. Manage the freshness lag with scheduled refresh.
2. **Enforce permissions during data preparation, not at query time.** Baking row-level access into per-user artifacts is structurally safer than filtering retrieved results, and persona-based personalization falls out of the same mechanism.
3. **Keep the LLM away from arithmetic.** Deterministic pipelines compute the numbers; the model only synthesizes language — then every response is validated before it reaches a decision-maker.
4. **Route by complexity.** Simple questions take a fast path; only multi-part questions get decomposed into parallel sub-tasks. This routing plus pre-analyzing document structure at ingestion fixed early latency problems and low adoption.
5. **Buy orchestration, build domain logic.** Managed agent infrastructure moved this project from months to weeks, but encoding institutional knowledge with domain experts remains the differentiating, manual work.
6. **Watch the pre-computation tax.** Per-user artifact generation scales storage and refresh cost linearly with user count; confirm your permission matrix and refresh cadence don't make regeneration the new bottleneck. The roadmap points the other way — event-driven, proactive delivery triggered by data changes.

## 相关实体
- [滴滴国际化客服质检智能化之路基于 Amazon Bedrock 的多语种多业务线质检实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/滴滴国际化客服质检智能化之路基于-amazon-bedrock-的多语种多业务线质检实践.md)
- [Comprehensive Observability For Amazon Sagemaker Ai Llm Infe](https://github.com/QianJinGuo/wiki-public/blob/main/entities/comprehensive-observability-for-amazon-sagemaker-ai-llm-infe.md)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](https://github.com/QianJinGuo/wiki-public/blob/main/entities/automate-aml-alert-triage-with-amazon-quick-and-snowflake-co.md)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/对抗-agent-遗忘kollab-基于amazon-bedrock-agentcore-的团队ai工作空间实践.md)
- [Process Financial Documents Using Amazon Bedrock Data Automa](https://github.com/QianJinGuo/wiki-public/blob/main/entities/process-financial-documents-using-amazon-bedrock-data-automa.md)

---

