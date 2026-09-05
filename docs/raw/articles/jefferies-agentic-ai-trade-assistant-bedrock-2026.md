---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-trade-assistant-how-jefferies-optimized-front-office-trading-operations-with-ai
ingested: 2026-07-24
feed_name: AWS China ML
source_published: 2026-07-23
sha256: 9b5e6d8ec117fae8cac095fc7f0f2d11dd0a586d6204f6cfa0d28877abc4e1fa
---

# Building trade assistant: How Jefferies optimized front office trading operations with AI

If you manage a front office trading desk at investment banks, you know the challenge: traders need real-time insights into client behavior, trade patterns, and market trends from vast amounts of data to make split-second decisions. However, they rarely have the time during the day, nor the coding ability, to build and maintain systems capable of delivering those insights. With millions of rows of data spread across multiple visualization tools, achieving end-to-end visibility is difficult. Traditional approaches force traders to rely on subject matter experts for analysis and collaborate with IT teams to build custom dashboards. The process can take days or weeks. The result is a widening gap between the data available and the decisions it should be informing.

[Jefferies](<https://www.jefferies.com/>), a global full-service investment banking firm, recognized this challenge as an opportunity to apply agentic AI to optimize how its equities trading desks operate. By building an agentic AI trade assistant on AWS, Jefferies set out to put the power of real-time data analysis directly in traders’ hands without the requirement of coding, waiting in IT queues, and with no compromise on accuracy.

In this post, we explore how Jefferies overcame these challenges with a solution built on [Strands Agents](<https://strandsagents.com/>), an agent harness SDK for building AI agents that can reason, plan, and act by orchestrating calls to foundation models (FMs) and external tools. The solution uses [large language models (LLMs)](<https://aws.amazon.com/what-is/large-language-model/>), [Amazon Bedrock](<https://aws.amazon.com/bedrock>), and [Amazon Bedrock Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>). It also uses [Model Context Protocol (MCP)](<https://aws.amazon.com/blogs/machine-learning/unlocking-the-power-of-model-context-protocol-mcp-on-aws/>), an open standard that helps AI agents securely connect to diverse data sources and tools through a unified interface. We cover the solution overview, the rationale for selecting the underlying technology stack, lessons learned, and the business impact the solution created at Jefferies.

## Solution overview

The Front Office trade assistant represents a shift in how Capital Markets’ Front Office Equity traders interact with data. At the core of the solution is a domain-specific agent that drives conversation with traders through natural language text. A set of MCP tools lets the agent connect with data sources, including trade data repositories, Financial Information Exchange (FIX) message files, and in-memory databases. When a trader submits a query to the trade assistant, Amazon Bedrock invokes an LLM (Anthropic Claude) to interpret the natural language intent, generate the corresponding SQL, and run it against underlying data sources to surface the response. The solution has a conversational interface, which allows traders to drill down on topics and explore data insights conversationally. The solution maintains conversation context to provide relevant insights and suggestions for deeper analysis over the entire lifetime of the session.

## How the solution works

The solution integrates with Jefferies’ existing trading infrastructure through an eight-step process depicted in the following architecture diagram. From a security perspective, the solution uses [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) to provide content moderation, personally identifiable information (PII) filtering to align the solution with Jefferies policies, and row-level data entitlements to help prevent accidental access to customer-sensitive data through intelligent access controls. It also uses conversation logging for audit trails to meet compliance requirements.

The user interaction begins with the Jefferies front-end trading interface, which now includes an embedded AI assistant widget. When a trader poses a question, the request flows through a carefully orchestrated workflow.

  1. **UI Widget:** First, the trader logs in using their credentials on Jefferies’ on-premises Business Intelligence system: Global Flow Monitor (GFM). Once a trader logs into GFM, they have a UI widget to interact with the Trade Assistant Agent.
  2. **The Authentication Service** uses [Amazon Elastic Kubernetes Service (Amazon EKS)](<https://aws.amazon.com/eks/>). The service verifies that only allowed traders can access sensitive trading data.
  3. **Bot Service** builds and manages the user session, maintaining context across multiple queries.
  4. **The Query Agent (Strands)** serves as the intelligent orchestration layer of the solution. When a trader poses a natural language question, the agent first queries the Amazon Bedrock Knowledge Bases, which uses Amazon Titan Embeddings for semantic retrieval to surface relevant database schemas, table relationships, and query patterns. With this context, Claude Sonnet reasons over the trader’s intent and generates a syntactically correct SQL query. The agent then evaluates its available Model Context Protocol (MCP) tools to determine the right data source for execution, whether that’s the in-memory grid for real-time positions or a historical data store for time-series analysis.
  5. **Amazon Bedrock** provides the Query Agent with access to an LLM for planning and executing the agent’s steps. The LLM’s advanced reasoning capabilities enable natural language understanding, SQL generation, and multi-step tool orchestration. The team also chose Amazon Bedrock for its flexibility to choose different LLMs as the trade assistant evolves.
  6. **Amazon Bedrock Knowledge Bases** provides a managed Retrieval Augmented Generation (RAG) pipeline that stores embedded representations of the underlying data model metadata (table schemas, column definitions, and query patterns). When the Query Agent receives a trader’s question, it retrieves relevant schema context from the Knowledge Base to inform accurate SQL construction.
  7. **Query Executor** queries the underlying data once the Query Agent identifies the right data source and creates the SQL query. The query executor intercepts user requests and injects SQL filters to provide row-level security for data access. The LLM chooses the visualization to display, and we used a markdown UI library to render the visualizations.
  8. **Data Stores:** The actual data sources queried by the Query Executor, including in-memory, SQL databases, and FIX messages that contain the underlying trade and execution data.



Let’s explore the rationale behind our selection of Strands Agents and MCP tools-based architecture.

### Strands Agents

[Strands Agents](<https://strandsagents.com/latest/documentation/docs/user-guide/concepts/model-providers/amazon-bedrock/>) is an open source agent harness SDK that takes a model-driven approach to building and running AI agents in a few lines of code. Strands scales from straightforward to complex agent use cases, and from local development to deployment in production. It simplifies agent development by embracing the capabilities of LLMs to plan, chain thoughts, call tools, and reflect. With Strands, developers can define a prompt and a list of tools in code to build an agent, then test it locally and deploy it to the cloud. Strands plans the agent’s next steps and executes tools using the advanced reasoning capabilities of models. For more complex agent use cases, developers can customize their agent’s behavior in Strands. For example, you can specify how tools are selected, customize how context is managed, choose where session state and memory are stored, and build multi-agent applications.

### Model Context Protocol (MCP) tools

The solution implements a Model-Context-Protocol (MCP) tool-based architecture where each data source is exposed as a distinct tool that Strands Agents can invoke. This approach delivers three advantages that position the system for long-term success. First, the approach provides extensibility by enabling new data sources to be added as additional tools, requiring no restructuring of the core architecture, a design choice the team made deliberately to accommodate future functional expansion. Second, it provides separation of concerns by encapsulating the logic for interacting with each specific system within its own tool, which makes the overall architecture more maintainable and testable. Third, the design offers flexibility by allowing the Strands Agent to dynamically select which tools to use based on each query, enabling workflows that span multiple data sources.

### Multi-source data processing

The solution provides an intuitive user experience. A trader can type a question like the one on the screen: “Give me the sector breakdown for trading in the U.S.” Behind the scenes, the assistant uses an LLM to generate the appropriate SQL query, runs it against the relevant data sources hosted in our in-memory data grid, and retrieves the results instantly.

The trade assistant goes beyond simple data retrieval. It can generate dynamic visualizations, converting text queries into SQL that produces visual stories with charts and graphs. When traders need to compare today’s sector trading with yesterday’s activity, the assistant automatically generates pie charts with color-coded legends, making it straightforward to spot trends and anomalies quickly.

## Lessons learned

Throughout the journey to deliver the Front Office trade assistant agent, the Jefferies team uncovered several key lessons that shaped its enterprise AI strategy and implementation roadmap. These insights serve as valuable guidance for capital markets organizations building agentic AI applications at scale.

First, the team mitigated the risk of hallucinations by deliberately not relying on LLMs to generate visualizations. Instead, they implemented a hybrid approach in which the LLM handles natural language understanding and query generation while dedicated visualization engines render the actual charts and graphs. This separation of concerns preserves data accuracy while maintaining the conversational interface traders expect.

Second, the team used in-memory databases to maximize response times. Traders require split-second insights into client behavior, trade patterns, and market trends. Without this architectural choice, queries against the underlying dataset would have introduced unacceptable latency for real-time trading decisions.

Third, the team learned to expect user behavior to evolve. Real-world usage proved dynamic. Traders interacted with the system in unexpected ways, and their patterns shifted over time. Investing in observability and user feedback loops proved essential for adapting quickly to these changing behaviors. Finally, the team adopted a deliberate language strategy. They relied on Python for LLM interactions and rapid experimentation, given its rich artificial intelligence and machine learning (AI/ML) landscape. They implemented complex business processing in Java to capitalize on its performance characteristics for high-throughput data processing and integration with existing trading systems.

## Business impact

Since launch, the trade assistant solution has delivered measurable efficiency gains across global sales and trading operations, allowing traders to redirect time toward client relationships and strategic decision-making rather than manual data wrangling. These efficiency gains translate directly into a competitive advantage, as trading desks can now dedicate more capacity to onboarding clients and deepening existing relationships. The solution delivers a personalized experience by adapting to each client’s query using MCP tools to access structured, unstructured, and in-memory data sources and dynamically generating graphs and charts in response. Beyond the trading desk, the solution has materially reduced the IT time and effort previously consumed by repetitive dashboard creation, freeing technology teams to focus on higher-value strategic initiatives. Perhaps most notably, the ability to securely query millions of rows of equities trading data using natural language has democratized data access. This fosters a data-driven culture where decisions are informed by real-time analytics rather than intuition or delayed reports.

## Looking ahead

Jefferies’ roadmap signals the scalability and ambition of this agentic AI approach. The team plans to roll out the Trade Assistant globally for multiple product types and desks, enhance audit capabilities with code generation tools that use natural language processing (NLP), and add [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) features to their enterprise AI system. These investments show a commitment to expanding AI-powered capabilities across the organization. The integration with existing Equities business intelligence (BI) applications and the ability to query multiple structured, unstructured, and in-memory data sources positions Jefferies at the forefront of AI-driven trading innovation.

## Conclusion

In this post, we walked through how Jefferies and AWS collaborated to build an agentic AI trade assistant that transforms how traders interact with equities data across global sales and trading operations. The Jefferies Equities Trade Assistant exemplifies how agentic AI is reshaping capital markets by turning every trader into a data scientist capable of extracting sophisticated insights through simple conversation. These agentic AI systems act as intelligent collaborators that understand context, learn from interactions, and proactively guide users toward better outcomes. The shift from reactive data retrieval to proactive intelligence marks a new era in trading operations. As this technology scales globally and across asset classes, it promises to redefine competitive advantage in front office operations for years to come.

To get started building your own agentic AI applications, explore Strands Agents, learn more about the MCP integration patterns used in this solution, or contact your AWS account team to discuss engagement tailored to your use case.

* * *

## About the authors

### Sanjay Nagraj

Sanjay is a technology leader leading the delivery of solutions in Equities Front Office. Key initiatives include leveraging the services available on the cloud to deliver hybrid solutions.

### Vipul Parekh

[Vipul](<https://www.linkedin.com/in/vipulparekh74/>) is a Senior Customer Solutions Manager at AWS, guiding FinTech and capital markets customers in accelerating their business transformation journey on the cloud. He is a generative AI ambassador and a member of the AWS AI/ML technical field community. Prior to joining AWS, Vipul played various roles in top financial services organizations, leading transformations.

### Saby Sahoo

Saby is a senior solutions architect at AWS. Saby has 20+ years of experience in the design and implementation of IT solutions, data analytics, and AI/ML/GenAI.
