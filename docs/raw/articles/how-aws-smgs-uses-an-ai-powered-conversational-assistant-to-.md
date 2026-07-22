---
title: "Business intelligence at scale: Key obstacles"
source_url: 
ingested: 
sha256: 526b71bfb89c9658ea79b92a897c46afbbbb1d47bf6ffdd1668433164e0edc85
tags: [rss, article]
---

# How AWS SMGS uses an AI-powered conversational assistant to transform business management with Amazon Bedrock AgentCore

 

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

### Conversational AI interface layer (real-time)

Leaders interact with their narratives through natural language conversation powered by Amazon Bedrock AgentCore. When a question arrives, AgentCore orchestrates specialized AI agents to retrieve the relevant persona-based narrative from Amazon S3 and use it as the knowledge source. The agents reason over its contents to generate contextually grounded responses with Anthropic’s Claude Sonnet 4. AgentCore’s native multi-agent coordination framework lets the system handle simple queries instantly. For complex questions, it automatically breaks them into parallel sub-tasks for comprehensive answers.

## Key capabilities

This architectural foundation supports three core capabilities that change how leaders interact with business data.

### Natural language business queries with pre-generated knowledge

Leaders ask complex business questions in plain English and receive immediate responses from structured knowledge stored in Amazon S3. The system understands business terminology and navigates multi-dimensional analysis across regions, products, customer segments, and time periods with contextual understanding.

### Inherent row-level security through user-specific narratives

NarrateAI applies row-level security during narrative generation, making sure each user’s knowledge engine contains only authorized data. User permissions are applied during data processing, and each user’s narrative file in Amazon S3 is fully isolated, helping prevent cross-user data leakage across the organization.

### Role-tailored experience through persona-based filtering

NarrateAI adapts responses based on user roles and organizational levels. A CEO receives high-level strategic insights across the organization, while a regional manager receives detailed operational metrics for their specific region.

These capabilities are supported by a modular architecture that combines specialized AI agents with AWS services for scalable, intelligent business intelligence delivery.

## Architecture components

Our architecture combines multiple AWS services and specialized AI agents to deliver intelligent, context-aware business insights through a modular, scalable design. The following diagram illustrates the end-to-end architecture.

Users interact with NarrateAI through two entry points, Amazon Quick (a conversational interface) and a Web UI, both connecting to **Amazon Bedrock AgentCore Runtime** for request processing. The architecture has two main flows: a real-time query path (left side) and a batch data processing path (right side).

![NarrateAI architecture diagram showing real-time query path on the left and batch data processing path on the right, connected through Amazon Bedrock AgentCore Runtime](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/26/ML-20454-1.png)

### NarrateAI agent (Strands agent): Query processing flow

At the center of the architecture sits the NarrateAI Agent, built on Amazon Bedrock AgentCore for multi-agent orchestration. A Supervisor Agent coordinates the end-to-end query workflow through six specialized tools:

1.  **Question classification** — When a question arrives, this tool analyzes the user’s intent and determines query complexity. Simple queries (for example, “What is my team’s revenue this quarter?”) take a fast path for immediate resolution. Complex, multi-part questions (for example, “Compare my top 5 accounts’ growth rates across all product lines”) are automatically broken into parallel sub-tasks.
2.  **Persona knowledge identifier** — Identifies the user’s role, organizational level, and data permissions to determine which narrative file to retrieve from Amazon S3.
3.  **Knowledge extractor** — Uses a table-of-contents (TOC) based retrieval approach to pull only the relevant sections from the user’s narrative, rather than scanning the entire file. This keeps retrieval fast even as narratives grow.
4.  **Relevancy evaluator** — Assesses the extracted content against the user’s question to determine which sections are most pertinent, filtering out tangential information.
5.  **Answer generator** — Synthesizes a coherent, natural language response from the relevant data, powered by Anthropic’s Claude Sonnet 4 through Amazon Bedrock.
6.  **Online evaluator** — Validates every response before delivery by cross-referencing generated numbers against source data, checking logical coherence, and confirming that claims are grounded in the user’s narrative.

Response times vary based on query complexity and the underlying data sources.

### Knowledge engine: Data processing flow

The right side of the architecture diagram shows how business data is prepared for the conversational layer:

1.  **Data ingestion** — Raw business data flows from Amazon Redshift and other enterprise data sources into the Knowledge Engine Service.
2.  **Data transformation** — AWS Lambda functions process and transform the data with configuration-driven templates, applying user-specific permissions and organizational hierarchies.
3.  **Knowledge artifact storage** — The processed data is stored as structured, persona-specific narrative files in Amazon S3, with full data isolation between users for row-level security.
4.  **Data refresh** — A Data Refresh Scheduler automates periodic updates, so narratives reflect the latest business data.

This separation between batch data processing and real-time query handling lets NarrateAI deliver instant responses while keeping the underlying data current and accurate.

## Infrastructure and AI foundation

NarrateAI is built on a tightly integrated set of AWS services designed for reliability, accuracy, and scale.

**Data storage and processing** — The system processes and stores business data as structured knowledge artifacts in Amazon S3. AWS Lambda handles serverless data transformation, while Amazon Redshift serves as the underlying data warehouse. A custom retrieval system uses a table-of-contents (TOC) approach to locate relevant document sections quickly, without scanning entire files. This keeps responses fast even as the knowledge engine grows.

**Foundation models** — Amazon Bedrock provides access to leading foundation models, including Anthropic’s Claude Sonnet 4, which powers NarrateAI’s natural language understanding, complex business reasoning, and response generation. The service’s model flexibility lets us test and upgrade to newer model versions without architectural changes, improving query understanding and reducing response times as more capable models emerge.

**Safety and guardrails** — Amazon Bedrock Guardrails enforce safety through three custom-configured filters tailored to NarrateAI’s use case:

*   **Content filtering** — Blocks inappropriate or harmful language.
*   **PII redaction** — Helps prevent accidental exposure of sensitive personally identifiable information (PII).
*   **Tone guardrails** — Makes sure every response maintains a professional voice appropriate for AWS leadership.

**Agent deployment infrastructure** — We use Amazon Bedrock AgentCore as our foundational orchestration layer. AgentCore provides comprehensive agentic capabilities, including advanced observability, authentication provider integration, and serverless memory management.

**Observability** — AgentCore Observability delivers detailed insights into end-to-end agent session execution, supporting full operational visibility through integration with Amazon CloudWatch for monitoring and alerting. The traceability capabilities through OpenTelemetry built into AgentCore have improved our debugging efficiency. Troubleshooting time dropped from tens of minutes or hours down to single-digit minutes.

**Memory management** — We migrated our conversation history (short-term memory) from a custom Amazon DynamoDB-based solution to AgentCore’s native memory capabilities. This migration:

*   Removed the need to maintain custom session management code.
*   Simplified our architecture by consolidating memory management within AgentCore’s serverless infrastructure.
*   Enabled faster feature development with built-in session handling.

## Engineering for production

With the foundational infrastructure in place, deploying NarrateAI at scale required solving four critical engineering challenges that every production AI system must address.

The first challenge was accuracy and trust. AI models can generate answers that sound correct but contain errors, which is a serious risk for business decision-making. To address this, every response is validated before delivery, checking that numbers are accurate, metrics are consistent, and the answer is logically sound. The architecture limits large language model (LLM) involvement in numeric calculations to reduce hallucination risk, and automated checks flag inappropriate language before responses reach users.

The second challenge was context awareness across organizational hierarchies. Different leaders need to see different data. A regional manager should see only their region’s numbers, while an executive needs a company-wide view. The system automatically identifies who is asking and what data they are permitted to see. It then scopes every response to their role and reporting structure without requiring manual filters.

Response latency at scale presented the third challenge. Early versions experienced significant response delays on complex questions, leading to user frustration and lower adoption. The system now routes questions based on complexity. Straightforward queries are answered quickly and complex multi-part questions are handled through parallel processing. Response times vary based on the use case, the nature of the query, and underlying data sources. Pre-analyzing document structure during data ingestion further reduces information retrieval latency per query.

Finally, scope and topic coverage required careful attention. Business intelligence spans multiple domains (sales, finance, marketing, and so on), each with its own terminology and logic. The team collaborated with domain experts to encode institutional knowledge through a standardized template approach, reducing what once took months of custom development to a matter of weeks.

The key lesson from this work is that production readiness requires balancing AI flexibility with rule-based accuracy, enforcing data access at the source, and optimizing for the most common use cases while reliably handling complex ones.

## Results and impact

Since deployment, NarrateAI has delivered measurable improvements in business intelligence accessibility and decision-making speed:

*   **More than 4,000 active users** across AWS leadership, from CEO to regional managers.
*   **Hours reduced to minutes** in business review preparation time.
*   **Comprehensive data accuracy validation** through deterministic calculations and Online Evaluator Tool checks.

Leaders report increased confidence in data-driven decisions and improved ability to explore business performance through natural conversation rather than dashboard navigation. With **Amazon Bedrock AgentCore**, we shifted our engineering operations from manual business intelligence processes to an AI-powered self-service hub. This approach improved efficiency, reduced review preparation time from hours to minutes, and strengthened security and compliance controls through built-in guardrails and row-level access enforcement.

## Future vision: From reactive to proactive

NarrateAI will evolve from a conversational assistant into an autonomous agent that proactively delivers insights, surfaces anomalies, and suggests actions before leaders ask. It will be triggered by business calendars, real-time data changes, and organizational context. Powered by enhanced Amazon Bedrock AgentCore orchestration, event-driven architecture, and advanced multi-agent systems (Knowledge, Forecast, and Policy Agents), the system will deliver predictive analytics with safe, explainable autonomous actions governed by a full policy and audit layer. This evolution positions NarrateAI as an intelligent business partner that anticipates needs and drives proactive decision-making across the organization.

## Conclusion

In this post, we showed how we built NarrateAI on Amazon Bedrock AgentCore to deliver conversational business intelligence at scale across AWS SMGS. We covered the two-layer architecture that separates batch narrative generation from real-time interaction, the specialized agents that route and validate every response, and the engineering patterns that make the solution production-ready.

You can use the same AWS services that power our solution to build your own conversational business intelligence solutions. [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) offers modular services for building, deploying, and operating AI agents at scale, with native support for multi-agent orchestration, memory management, and observability. [Amazon Redshift](https://aws.amazon.com/redshift/) serves as a robust data warehouse for analytical workloads.

The architecture patterns demonstrated are applicable across industries. These include customized knowledge retrieval that combines retrieval accuracy with generative flexibility, hierarchical document processing that supports intelligent navigation of complex knowledge bases, role-based access control that supports secure data access in multi-tenant environments, and parallel agent processing that delivers responsive performance at scale.

Ready to transform your operations? To get started, explore the [Amazon Bedrock AgentCore detail page](https://aws.amazon.com/bedrock/agentcore/), review the [AgentCore documentation](https://docs.aws.amazon.com/bedrock-agentcore/), and try the [notebook-based tutorials](https://github.com/awslabs/amazon-bedrock-agentcore-samples) for additional use cases. Let us know your thoughts in the comments section.

## Acknowledgements

We extend our sincere gratitude to our executive sponsors and mentors whose vision and guidance made this initiative possible: [Aizaz Manzar](https://www.linkedin.com/in/aizazmanzar/), Director of AWS Global Sales; [Sujit Narapareddy,](https://www.linkedin.com/in/sujit-narapareddy/) Director of AWS Insights; [Damien Forthomme](https://www.linkedin.com/in/dforthomme/), Senior Applied Scientist; and [Akhand Singh](https://www.linkedin.com/in/akhand17/), Head of Data Engineering.

We also thank the dedicated team members whose technical expertise and contributions were instrumental in bringing this product to life: [Aswin Palliyali Venugopalan](https://www.linkedin.com/in/aswinpvenugopalan/), Software Dev Manager; [Sai Meka](https://www.linkedin.com/in/ravichandra-meka/), Machine Learning Engineer; [Mihir Gadgil](https://www.linkedin.com/in/mihirgadgil/), Senior Data Engineer; [Shalabh Mittal](https://www.linkedin.com/in/shalabh-mittal/), Data Engineer; [Akshay Kasar](https://www.linkedin.com/in/akshaykasar/), Machine Learning Engineer; [Jayson Carter](https://www.linkedin.com/in/jaysoncarter/), Senior Machine Learning Engineer; [Srijan Tiwari](https://www.linkedin.com/in/srijan-tiwari-06169125/), Senior Applied Scientist; [Bill Tran](https://www.linkedin.com/in/billtran236/), Data Engineer; [Inigo Dalmau](https://www.linkedin.com/in/inigodalmau/), Data Engineer; [Tyler Durand](https://www.linkedin.com/in/tyler-durand-tech/), Senior Technical Product Manager; [Kaylin Tay](https://www.linkedin.com/in/kaylin-tay/), Business Insights Analyst; [Anusha Sakhamuri](https://www.linkedin.com/in/anusha-sakhamuri-0a28a146/), Data Engineer.

* * *

## About the authors
