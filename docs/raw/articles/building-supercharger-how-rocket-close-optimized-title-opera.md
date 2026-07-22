---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-supercharger-how-rocket-close-optimized-title-operations-with-agentic-ai
ingested: 2026-06-13
sha256: d2e7423d58b0f9e9d1a404fd9475114548bbe84a68e7338884eb901b377e6ae5
feed_name: AWS China ML
source_published: 2026-06-12
---

# Building Supercharger: How Rocket Close optimized title operations with agentic AI

[Rocket Close](<https://www.rocketclose.com/>) is a Detroit-based title agency and appraisal management company within [Rocket Companies](<https://www.rocket.com/>) that provides title insurance, property valuation, and settlement services. As demand for mortgages and loans grew, title operations became a bottleneck in the homebuying process. Time-intensive, state-specific title examinations, combined with manual research and fragmented systems, slowed throughput and made it difficult for teams to keep pace with an expanding client base.

Title examiners must verify data from disparate sources. This requires searching through multiple systems, state guides, and county requirements. Local rules around probate or tax IDs further complicate their work. For example, a title examiner seeking to understand a county-specific recording requirement might spend hours navigating multiple sources.

To address these challenges, Rocket Close created Supercharger in collaboration with AWS. Supercharger is an agentic AI solution designed to reduce friction in the lending and homebuying process and optimize title operations workflows. It combines title and closing knowledge to guide teams through the order processing workflow, dynamically interacting with internal operations teams in natural language. By centralizing knowledge and automating research-heavy tasks, the solution generates actionable insights about orders, improves efficiency, and reduces the time spent searching for information. Ultimately, it enhances both operational efficiency and client experience.

In this post, we explore how Rocket Close built a solution using [Strands Agents](<https://strandsagents.com/>), [large language models (LLMs)](<https://aws.amazon.com/what-is/large-language-model/>), [Amazon Bedrock](<https://aws.amazon.com/bedrock>), [Amazon Bedrock Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>), and [Model Context Protocol (MCP)](<https://aws.amazon.com/blogs/machine-learning/unlocking-the-power-of-model-context-protocol-mcp-on-aws/>) tools. We cover solution features, the rationale for the technology stack, lessons learned, and the business impact at Rocket Close.

## Solution overview

The Supercharger solution is powered by Strands Agents, an open source agent harness SDK by AWS for building agents using the Anthropic Claude Large Language Model (LLM) through Amazon Bedrock, giving it the flexibility to choose different LLMs as the title assistants evolve. From a security perspective, the solution combines [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) with row-level data entitlements to help prevent accidental access to customer-sensitive data through intelligent access controls. Conversations are logged with complete audit trails to meet compliance requirements. It integrates with Rocket Close operational databases containing order information, standard procedures, and policies for state-level title exams. The following diagram shows the six interconnected capabilities of Supercharger.

At the core of the Supercharger solution is a domain-specific agent driving conversation with Operations teams through six interconnected capabilities that work together to streamline the homeownership process. Conversation Analytics enables natural language processing that understands context and intent across multi-turn conversations, making interactions feel intuitive and human-like rather than rigid and transactional. Building on this conversational intelligence, state-level title examination assistance provides comprehensive checklists and guidance tailored to specific title examination requirements, providing teams with the right information at the right moment. The solution’s API-based integration connects with existing systems to maintain data consistency and avoid manual data entry, reducing errors and freeing teams to focus on high value work. Guardrails and Response Accuracy verify that every response meets quality standards and complies with regulatory requirements, protecting both the company and its clients. Comprehensive logging and monitoring provide complete visibility into system performance and user interactions, with full audit trails that meet compliance requirements. Finally, unified access to multiple data sources maintains complete context for decision-making, pulling together information that previously required checking multiple systems, creating unified experience for operations teams navigating complex title workflows.

When an operations team member poses a question, the request flows through the workflow shown in the following architecture diagram.

  1. **WebSocket handshake** – The user starts a connection through an HTTP request with a JWT token.
  2. **Token validation** – The identity provider validates the token through Istio and establishes a WebSocket connection.
  3. **Exam title agent invocation** – The Strands Agent is invoked, triggering the agentic workflow based on system prompts and user input.
  4. **Knowledge base query** – The agent searches the knowledge base for relevant policies and procedures.
  5. **Tool selection** – The agent determines which function to invoke and with which parameters.
  6. **MCP tool execution** – MCP tools process the request, retrieving order information from the Atlas Web API.
  7. **Context synthesis** – The system queries the knowledge base for order-specific context.
  8. **Response delivery** – The combined response streams back to the user through WebSocket.
  9. **Response Rendering** – The synthesized response is progressively streamed back to the Chatbot UI.



In the following sections, we explain why we chose Strands Agents and an MCP tool-based architecture.

### Strands Agents

Strands Agents is an open source agent harness SDK that takes a model-driven approach to building and running AI agents in a few lines of code. It scales from straightforward to complex use cases, and from local development to production. Strands Agents uses the planning, tool-calling, and reflection capabilities of LLMs to drive agent behavior.

With Strands Agents, developers define a prompt and a list of tools in code, then test the agent locally and deploy it to the cloud. The SDK plans the agent’s next steps and runs tools through the reasoning capabilities of the model. For more complex use cases, developers can customize agent behavior. For example, you can specify how tools are selected, customize how context is managed, choose where session state and memory are stored, and build multi-agent applications.

### Model Context Protocol (MCP) tools

The solution implements an MCP tool-based architecture where each data source is exposed as a distinct tool that Strands Agents can invoke. This approach delivers three advantages:

  * **Extensibility** – New data sources can be added as additional tools without restructuring the core architecture. The team made this design choice deliberately to accommodate future expansion.
  * **Separation of concerns** – The logic for interacting with each system is encapsulated in its own tool, which makes the overall architecture more maintainable and testable.
  * **Flexibility** – The Strands agent dynamically selects which tools to use based on each query, supporting workflows that span multiple data sources.



## Business impact

> “By harnessing Rocket Close’s proprietary knowledge bases and enhancing Supercharger with agentic AI capabilities, our team could transform how team members interact with complex order data and execute daily tasks. This not only enhances productivity but transforms how work gets done. By integrating Supercharger’s question-answering ability with our external chat interfaces, we have saved thousands of calls and emails per month to our contact center, giving us greater scale and a better client experience.”
> 
> _— Bryan Bedard, Vice President of Data Science, Rocket Close_

Supercharger’s ability to understand order-level context and deliver precise, role-specific guidance transformed Rocket Close’s end-to-end workflow in multiple ways. The solution delivered immediate operational efficiency gains for the operations and client relations teams, reducing the number of incoming calls and emails to the contact center by 30% through its question-answering capability. State exam accuracy improved through real-time insights about orders within existing workflows, which reduced cognitive load, minimized research time, and increased accuracy in decision-making. Client satisfaction was enhanced through the automation of routine tasks, the execution of order-level processes, and drafting communications on behalf of clients. Operational consistency improved with Supercharger’s AI-guided state-level exam assistance. Finally, performance was optimized through architectural refinement and better prompting techniques that reduced the number of calls the agent made to the LLM, achieving 3x latency improvements and reduced costs.

## Lessons learned

Throughout Rocket Close’s journey to deliver Supercharger, the team discovered several key lessons that shaped their AI strategy and implementation approach.

The experience revealed that efficient data retrieval stands as a cornerstone of performance, leading them to architect a streamlined solution where MCP tools retrieve the necessary order information in a single call before using LLM synthesis to extract relevant details, alleviating the need for multiple database queries. This architectural philosophy extended to maintaining a clear separation of concerns between Strands Agents and MCP tools, creating a flexible foundation capable of evolving alongside changing requirements. The team found that WebSocket-based streaming delivered immediate user feedback, improving perceived performance even when handling complex queries. The team learned that effective LLM prompting focuses on describing what the agent should accomplish rather than prescribing how, because removing deterministic steps allowed the agent to orchestrate dynamically using its inherent capabilities, proving more adaptable than custom approaches. Additional insights emerged around metadata filtering in knowledge bases to enhance retrieval precision, the critical importance of descriptive tool naming and coherent docstrings that serve as natural language interfaces for agent reasoning, and the value of offloading security enforcement to session attributes, rather than embedding it in business logic or step-by-step agent prompts, helps provide clean and consistent access control. The team also recognized that executive sponsorship and change management proved crucial for timely delivery, leading them to collaborate with AWS.

Collectively, these lessons converged on a unifying principle: designing solutions that take advantage of the agent’s inherent intelligence rather than constraining it made Supercharger both more powerful and maintainable in the long term.

## Conclusion

In this post, we provided insights into how agentic AI can transform complex, knowledge-intensive processes in the mortgage industry through Rocket Close Supercharger journey. Using Strands Agents and MCP tools helps build a flexible, high-performing solution that allows team members with instant access to order information and intelligent automation. The future phase of Supercharger will include expansion for bankers to address loan specific questions and the creation of fast start templates to guide multiple domain teams in building agentic solutions for their business problems.

The journey highlights several lessons. These include hands-on collaboration between business and technology teams, the value of iterative refinement, and the role of architectural decisions in achieving performance and maintainability.

For organizations considering similar AI implementations, the Rocket Close journey is a pragmatic guideline. Start with clear business requirements, partner with experts who understand the technology and your domain, invest in proper architecture, and iterate based on real-world usage. The result is a solution that doesn’t replace work. It augments human capabilities and transforms how work gets done.

To learn more, see the [Strands Agents documentation](<https://strandsagents.com/>) and the [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) marketing page. To start building your own agentic solution, open the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>) and explore [Amazon Bedrock Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>).

* * *

## About the authors

### Anton Selin

Anton is a Sr. Solution Architect at Rocket Close with a passion for building new products using his expertise in AWS and deep knowledge of AI-based application development. He has extensive experience in AWS, AI, cloud and on-premises infrastructure development, integration, microservices, messaging, and data streaming. Over the years, Anton has worked as both a developer and an architect in the finance and healthcare industries. Besides work, he enjoys spending time with the family, traveling, watching and playing sports.

### Manoj Ravi

Manoj is a Staff Machine Learning Architect at Rocket Companies, where he specializes in designing end-to-end Generative AI and ML solutions for the finance industry. He focuses on building scalable, distributed platforms using Kubernetes, ensuring experimental AI solutions move efficiently into production. When he isn’t architecting enterprise MLOps pipelines, Manoj enjoys playing cricket, traveling, and spending time with his family.

### Vipul Parekh

[Vipul](<https://www.linkedin.com/in/vipulparekh74/>) is a Senior Customer Solutions Manager at AWS, guiding FinTech and capital markets customers in accelerating their business transformation journey on cloud. He is a generative AI ambassador and a member of the AWS AI/ML technical field community. Prior to joining AWS, Vipul played various roles in top financial services organizations, leading transformations.

### Venkata Santosh Sajjan Alla

[Sajjan](<https://www.linkedin.com/in/sajjan-avs/>) is a Senior Solutions Architect at AWS Financial Services, driving AI-led transformation across North America’s FinTech sector. He partners with oganizations to design and execute cloud and AI strategies that speed up innovation and deliver measurable business impacts. His work has consistently translated into millions of value through enhanced efficiency and additional revenue streams. With deep expertise in AI/ML, Generative AI, and built for the cloud architectures, Sajjan enables financial institutions to achieve scalable, data-driven outcomes. When not architecting the future of finance, he enjoys traveling and spending time with family.

### Axel Larsson

Axel is a Principal Solutions Architect at AWS based in the greater New York City area. He supports FinTech customers and is passionate about helping them transform their business through cloud and AI technology. Outside of work, he is an avid tinkerer and enjoys experimenting with home automation.
