---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-lendingtree-built-a-multi-agent-mortgage-assistant-on-amazon-bedrock
ingested: 2026-08-06
feed_name: AWS China ML
source_published: 2026-08-05
sha256: e8f487b7c7b9fe076302a69cb6179527bbc1af35b13202999081a47b20b76fa5
---


# How LendingTree built a multi-agent mortgage assistant on Amazon Bedrock

Buying a home is one of the biggest financial decisions most people face, and [LendingTree](<https://www.lendingtree.com/>) built a multi-agent mortgage assistant on [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) to make the process more straightforward. The assistant educates borrowers, understands their situation, and provides tailored options in a natural conversation. Borrowers must weigh purchase or refinance, conventional or government-backed, 15-year or 30-year terms, and fixed or adjustable rates. On top of that, there’s jargon like “discount points,” “origination fees,” and “debt-to-income ratio.” It’s no wonder many people feel lost before they even start.  
  
LendingTree has been helping consumers sort through these choices for over 25 years, connecting millions of people with lenders to find competitive mortgage offers. The company was built on a belief that everyone deserves the tools and knowledge to make confident financial decisions. The [AI-powered mortgage assistant](<https://agent.lendingtree.com/chat>) is that next step.

The solution had to meet the same standards that have guided LendingTree from day one: accurate information, transparent guidance, and rigorous protection of user data. Operating within the regulatory requirements of the mortgage industry means content filtering, personally identifiable information (PII) protection, and compliance oversight aren’t optional features. They’re non-negotiable. That made Amazon Bedrock and its built-in guardrails the right foundation.

> _“Our goal was to be a trusted partner in the home-buying journey, a guide that educates consumers, understands their situation, and matches them with the right offer. The foundation models and built-in guardrails in Amazon Bedrock let us deliver that with security and compliance from the start.”_

— Srinivas Madabushi, SVP Technology, LendingTree

Many companies in the industry have added chatbots for basic questions. LendingTree wanted to go further, answering the hard questions and matching borrowers with competitive offers. That took more than one agent.

## Solution overview

To address these challenges, LendingTree deployed three independent AI agents: a supervisor and two specialized workers (education and matching), coordinated using [LangGraph](<https://www.langchain.com/langgraph>), the [Model Context Protocol (MCP)](<https://modelcontextprotocol.io/>), and foundation models powered by Amazon Bedrock. All agents run containerized services on [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>) with [AWS Fargate](<https://aws.amazon.com/fargate/>).

LendingTree chose Amazon Bedrock for its multi-model flexibility and inherited AWS governance controls, which their compliance team required. The solution was deployed on Amazon ECS instead of [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) because it was already in production when AgentCore reached general availability. AgentCore is a platform to build, connect, and optimize agents at scale, with any framework or model.

The following figure shows the high-level architecture.

  
LendingTree multi-agent architecture for mortgage guidance

**(1)** The consumer-facing chat interface is a React application running as a containerized service on Amazon ECS with Fargate, serving consumers on web and mobile browsers through a public endpoint.

**(2)** User inputs and model outputs pass through [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) for content filtering (such as hate and profanity detection) and PII redaction. Incoming messages are also screened for prompt threats.

In parallel with Guardrails, a safety classifier based on a large language model (LLM) enforces LendingTree’s conversational policy. The two safety checks run concurrently, so this added assurance doesn’t add latency.

A business-logic layer handles LendingTree’s operational rules: routing complex issues to human support and redirecting off-topic conversations.

**(3)** The Supervisor agent is the orchestrator, built on LangGraph as a state machine that follows a plan-and-execute pattern. It works like a well-organized team: the Supervisor understands the big picture and decides what needs to happen, while the workers handle what they’re each best at.

The Supervisor is a graph of nodes and edges. Nodes do the work (intent analysis, execution planning, response composition), and edges decide what happens next based on the result (route to Education, route to Matching, or answer directly). This makes the flow explicit: every path through the system is defined, auditable, and traceable.

The Supervisor analyzes user intent with [Amazon Nova Pro](<https://aws.amazon.com/ai/generative-ai/nova/>) and produces an execution plan. It then routes to the appropriate worker over MCP using connection pooling for low-latency calls. For model availability by Region, see [Supported models by AWS Region in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html>).

Not every task needs the most powerful model. The Supervisor implements multi-model architecture, automatically selecting between Amazon Nova Pro (for complex reasoning and critical classification) and Amazon Nova Lite (for conversational responses and lightweight classification) depending on what the task demands. This balances reliability with cost.

Planning and execution are separated by design. When a conversation goes wrong, the team can trace exactly which node made which decision.

**(4)** The Education worker is the patient educator. It helps users understand mortgage concepts, explains product differences, and provides guidance through interactive conversation. It runs its own LangGraph workflow and maintains specialized [Amazon Bedrock Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>), the fully managed retrieval augmented generation (RAG) capability, tailored to its domain, backed by [Amazon OpenSearch Service](<https://aws.amazon.com/opensearch-service/>) as the vector store. Every response is grounded in real documents rather than relying on model knowledge alone.

**(5)** The Matching worker is the connector. It gathers user preferences and calls LendingTree’s internal offer, eligibility, and rate APIs. From there, it delivers personalized lending options based on the user’s actual situation. It interprets qualification criteria and helps users compare options side by side.

**(6)** Shared services handle conversation memory and session state through the LangGraph PostgreSQL checkpointer on [Amazon Relational Database Service (Amazon RDS)](<https://aws.amazon.com/rds/>). This lets conversations persist across turns, agent handoffs, and service restarts. Users can pause, come back later, or ask follow-ups without losing context.

**(7)** Amazon Bedrock provides a broad set of foundation models suited to a wide range of use cases. These range from complex reasoning and critical classification (Amazon Nova Pro) to cost-efficient conversational responses and lightweight classification (Amazon Nova Lite), all accessible through a single API. Built-in [Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) deliver configurable safety controls, while Amazon Bedrock Knowledge Bases connect agents to authoritative content through vector stores such as Amazon OpenSearch Service for hybrid retrieval.

**(8)** Internal LendingTree services and APIs provide lender search, rate and product data, eligibility and prequalification checks, offer comparison, and user profile information.

**(9)** All services run on Amazon ECS with AWS Fargate, where each agent scales independently on its own demand signals. Infrastructure is managed through Terraform and deployed through GitLab continuous integration and continuous delivery (CI/CD) pipelines with automated testing and health checks.

### Following a conversation end to end

Suppose a user asks, _“What’s the difference between FHA and conventional, and which one fits me?”_

The message flows through Amazon Bedrock Guardrails (2) for safety screening. The Supervisor agent (3) then loads conversation history from conversation memory (6) and analyzes intent, recognizing two needs: an explanation and a personalized comparison. It routes the educational question to the Education worker (4) over MCP, and the matching question to the Matching worker (5). Each worker operates independently and returns its result. The Supervisor aggregates both into one coherent reply, running the output back through Guardrails before delivering it. The full exchange is checkpointed to PostgreSQL (6), so the next turn picks up with complete context.

To the user, it’s one continuous conversation. Behind the scenes, it’s a coordinated workflow where every decision point is traceable.

## Deployment and operations

Because the agents communicate through MCP, each can be updated, scaled, and rolled back independently. The Education worker can ship a new knowledge base without touching the Supervisor or the Matching worker. Operationally, the challenge unique to multi-agent systems is tracing a single conversation that spans multiple services. [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) logs and [AWS X-Ray](<https://aws.amazon.com/xray/>) distributed tracing allow the team to follow a single conversation’s journey across all three agents, with per-agent metrics and detailed timing.

## Results

The assistant has been handling real mortgage conversations in production since late 2025. The metrics in this section are based on LendingTree’s internal production analytics from launch through Q1 2026, as reported by the LendingTree engineering team. Across that period, it served roughly 1,960 conversations and 12,100 messages, averaging 6.2 messages per exchange. These aren’t one-shot lookups: engaged users sustain multi-turn sessions averaging 10+ messages over 9 minutes, asking follow-up questions, refining their situation, and exploring options conversationally.

**From education to action.** The conversation data reveals how consumers actually use an AI mortgage assistant. Early in the rollout, 75% of conversations were educational. Users asked questions like “What is an FHA loan?”, “How does a HELOC work?”, or “What credit score do I need for a conventional loan?” As the system matured and word spread, transactional intent grew: over 50% of recent conversations now involve rate comparisons, lender matching, or prequalification, actions tied directly to conversion.

**Conversation depth signals trust.** The average session length of 6.2 messages tells one story. The engaged-user average of 10+ messages over 9 minutes tells a different one. Users don’t sustain that kind of engagement with a system they don’t find useful. The Education worker builds understanding, and users naturally progress to the Matching worker when they’re ready to act. No forced handoff, no “start over” moment.

**The questions reveal real complexity.** The most common topics include loan type comparisons (FHA, conventional, and VA), qualification criteria for specific credit profiles, rate negotiation strategies, closing timelines, and down payment trade-offs. These are exactly the situation-dependent questions that static FAQ pages can’t answer well. They require context: what the user said three turns ago, what they qualify for, what they’re optimizing for. This is where conversation memory and the Supervisor’s intent analysis earn their complexity, and the system maintains the thread so each answer builds on the last.

**Containment.** Over 97% of conversations were handled end-to-end without human escalation, and only about 3% of users explicitly requested a live agent. For a regulated financial product where the questions are genuinely hard and getting it wrong has real consequences, that containment rate is significant. It demonstrates the system’s ability to operate as a self-contained advisory service rather than a triage layer in front of a call center.

**What the data confirms.** The engagement depth is the signal that matters most. Better-informed users make better decisions. A conversational interface surfaces preferences and constraints that a static form never captures in combination. Details like “I’m a veteran with a 650 credit score looking to buy in Colorado Springs in the next 30 days” make downstream lender matches more relevant. That’s ultimately what serves the consumer.

## What LendingTree learned, and what’s next

Getting a multi-agent system to production taught the team as much about architecture as about any single feature.

After shipping the mortgage assistant, LendingTree realized that building one agent is straightforward, but scaling to many agents requires shared foundations. Rather than building every new feature as a one-off, LendingTree is investing in reusable pieces. These include shared context layers for data access, MCP contracts for tool integration, and standardized deployment processes. A registry lets teams discover existing capabilities instead of reinventing them. This lets teams build smaller, domain-focused capabilities that can be composed into broader consumer experiences. Consistent standards for safety, observability, evaluation, and reuse tie it all together.

**Agent design learnings:**

  * **Semantic chunking for Knowledge Bases.** Breaking documents into semantically coherent chunks rather than fixed-size chunks improved retrieval quality significantly, because chunk boundaries align with natural topic breaks.
  * **Knowledge Base conflict resolution.** With multiple KBs, contradictory information sometimes surfaced. Domain-based filtering and source prioritization solved this: internal LendingTree content takes precedence for product-specific questions, while external resources serve general mortgage education.
  * **Inter-agent context passing.** Worker agents initially lacked awareness of the broader conversation. Passing full conversation history and intent summaries in each MCP request gave workers the context they need to provide relevant responses.
  * **Query rewriting.** Short user responses like “not sure” or “yes” get rewritten into meaningful, searchable queries using conversation history before retrieval. This significantly improved retrieval quality.
  * **Guardrail tuning is ongoing work.** Early configurations blocked legitimate questions because mortgage terminology tripped content filters. Tuning against realistic conversation data resolved this.
  * **Task-based model routing** kept costs in check: Nova Pro only where reasoning demanded it, Nova Lite everywhere else.



These are agent design problems, not infrastructure problems. They remain important regardless of runtime choice, and represent the lasting knowledge from this implementation.

**Infrastructure learnings:**

  * **Conversation state management.** Early versions lost context during agent handoffs. A unified PostgreSQL-backed checkpointer with explicit state serialization solved this, allowing conversations to persist across agent transitions and system restarts.
  * **Running safety checks in parallel** preserved latency without weakening protection.
  * **Independent agent scaling** required hand-wiring ECS containers, health checks, and deployment pipelines per agent.



The team is now evaluating re-architecting onto AgentCore to offload undifferentiated infrastructure work. That would avoid hand-wiring PostgreSQL checkpointers, ECS containers, and agent scaling, letting engineering effort shift from “keep the runtime alive” to “keep optimizing the agent logic and domain knowledge.”

## Conclusion

LendingTree’s production multi-agent system demonstrates that AI agents can serve consumers in heavily regulated industries, not only as prototypes, but as production systems running 24/7. Amazon Bedrock (Nova Pro and Nova Lite, Knowledge Bases, and Guardrails) provided the model and safety foundation. LangGraph handled agent orchestration, and MCP handled agent-to-agent communication. Together, they deliver personalized mortgage guidance at scale while maintaining strict compliance standards.

For organizations building multi-agent systems: separate planning from execution so the system is debuggable. Make safety a structural pillar rather than a skippable step. Design from day one for the reusable capabilities that will let you scale the pattern across your organization.

To get started with multi-agent systems on AWS, explore the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>) and [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) for managed runtime capabilities.

## Related resources

  * [Build highly scalable serverless LangGraph multi-agent systems on AWS with Amazon Bedrock AgentCore](<https://aws.amazon.com/blogs/machine-learning/build-highly-scalable-serverless-langgraph-multi-agent-systems-in-aws-with-amazon-bedrock-agentcore/>) — Learn how to build and deploy LangGraph-based multi-agent workflows using Amazon Bedrock AgentCore.
  * [AgentCore samples on GitHub](<https://github.com/awslabs/agentcore-samples>) — Explore sample multi-agent architectures and patterns.



* * *

## About the authors

### Eric Hanson

Eric is an AI Architect at LendingTree, where he leads the AI engineering team responsible for the multi-agent mortgage guidance system.

### Ramesh Eega

Ramesh is a Global Accounts Solutions Architect at Amazon based out of Atlanta, GA. He is passionate about helping customers throughout their cloud journey. Outside of work, Ramesh enjoys traveling and hiking.

### Bhanusree Vadlamudi

Bhanusree is a Technical Account Manager (TAM) at Amazon who is passionate about building trust-based relationships with customers, understanding their technical needs, and ensuring they realize the full value of AWS. Bhanu partners closely with FSI customers to provide technical guidance, architectural recommendations, and best practices that enable them to achieve their goals through AWS services. Bhanu enjoys spending time with family, going on hikes, and traveling.
