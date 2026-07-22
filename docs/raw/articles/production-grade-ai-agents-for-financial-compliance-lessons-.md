sha256: 848cfbda10d84adb7c22bb90e2b04cceb43a23725188d09d14fab54bd14dcbec
---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/production-grade-ai-agents-for-financial-compliance-lessons-from-stripe/
ingested: 2026-06-27
feed_name: AWS China ML
source_published: 2026-06-26T14:38:01Z
---

# Production-grade AI agents for financial compliance: Lessons from Stripe

_This post is co-written by Christopher Phillippi and Chrissie Cui from Stripe._

[Stripe](<https://stripe.com/>) processes $1.4 trillion in annual payment volume across 50 countries, requiring compliance teams to review thousands of transactions daily. This post explores how Stripe built a production-grade AI agent system on AWS using [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) that reduced review handling time by 26 percent while maintaining human oversight. The post covers the technical architecture, infrastructure decisions, and lessons learned from deploying agentic AI that achieved over 96 percent helpfulness ratings, with human experts firmly in control of final decisions.

In this post, you learn how Stripe built a production-grade AI agent system for financial compliance. We cover the technical architecture of Stripe’s ReAct agent framework and the infrastructure decisions behind a dedicated agent service. We also discuss the role of human oversight in maintaining accountability, and key lessons about task decomposition, orchestration patterns, and cost optimization through prompt caching. By the end, you will understand how to design agentic systems that scale compliance operations without compromising quality or auditability.

## Stripe’s scale and compliance challenge

The foundational mission of Stripe is to grow the gross domestic product (GDP) of the internet. That pursuit requires programmable financial infrastructure designed to support smooth transactions and operational management for businesses of all scales. As of early 2026, Stripe has grown beyond its origins as a developer-centric payment API to become a systemic pillar of the global economy. The company supports millions of companies across 50 countries, from early-stage startups to 62 percent of the Fortune 500, and processes approximately $1.4 trillion in annual payment volume. This scale represents approximately 1.3 percent of the total global GDP, positioning Stripe at the critical nexus of technological innovation and strong regulatory frameworks.

## The compliance scaling problem

As Stripe’s global footprint expanded across 50 countries, the organization faced a critical challenge: how to scale compliance operations without proportional headcount increases while maintaining regulatory quality standards. Every day, compliance teams conduct detailed reviews to identify and mitigate financial crime risks. However, skilled analysts were spending up to 80% of their time navigating fragmented systems to gather documentation rather than performing high-value risk assessments. Stripe’s solution integrates AI agents with automated orchestration, transforming compliance from a resource-intensive process into a scalable engine. This approach addresses the $206 billion global compliance burden by helping organizations identify 95% of card-testing attacks in real time and reduce unnecessary customer friction by 20%. The approach also maintains the auditability and precision required by regulators.

### Why agentic AI for compliance?

The limitations of traditional automation for complex, judgment-based compliance work mean AI agents are needed to handle assisted investigations with scale, consistent quality, and full auditability while keeping humans in control.

### Three pillars

  * **Oversight and accountability** – Human-centered validation with configurable approval workflows and multi-layered decision checkpoints. Humans stay in the driver’s seat, supported by agents.
  * **Transparency** – Full audit trail with immutable documentation of every action, decision, and rationale.
  * **Efficiency** – Pre-investigation and dynamic analysis allow deeper reviews at faster pace.



## Technical architecture

The technical implementation of Stripe’s agentic compliance system consists of three key components: task decomposition and orchestration, the ReAct agent framework, and supporting infrastructure services. Each component plays a critical role in achieving scalable, auditable compliance automation.

### Task decomposition and review orchestration

Assigning a single agent to handle this long, complicated review in one go wouldn’t have worked. A single, unconstrained agent would have focused too much on the wrong things and not enough on what was actually needed. Instead, Stripe made the solution tractable by breaking the complicated review into composable, bite-sized sub-tasks. Each sub-task could potentially depend on the results of other sub-tasks as a directed acyclic graph (DAG). These _rails_ help verify each agentic process is only run on vetted questions where quality has been measured through quality testing. They also help confirm the investigation covers the required bases, and provide the agent sufficient context and focus to deliver quality results.

Despite rigorous quality testing of the agent responses in each sub-task, Stripe’s implementation does not rely outright on the response of an agent. Instead, the responses are provided as supplementary information to the human reviewer, who must ultimately answer each sub-task of the review. This solves for oversight and accountability while still capturing the efficiency benefits. The high-level review flow is shown in the following diagram.

Reviewers interact with the review tooling, which is aware of the current question and which subsequent questions require that answer as context. The tooling functions as the orchestrator, piping human-reviewed answers as context for further questions.

### ReAct agent framework implementation

To fetch research for each sub-question, Stripe built a compliance agent using a form of the ReAct (reasoning and acting) agent framework. Beyond using a large language model (LLM), a type of foundation model (FM) on Amazon Bedrock for reasoning, the agentic aspect dynamically gathers relevant signals through tool calls. Stripe chose this agent framework to solve the problem of a near-infinite number of signals that may or may not be relevant for a given subject. Agents determine which signals are relevant and propose follow-ups until they are sufficiently confident to provide a final answer. The high-level agent logic is shown in the following diagram.

To walk through this flow, imagine being asked the query: “what is the answer to 10 divided by the number π?”

If you were a ReAct agent, your first thought would be to consider whether you already have the answer. You don’t, so you would propose an action of taking out a calculator and inputting `10/π`. The calculator would then return an observation. Your next thought would be to determine whether you have an answer, and you would provide that calculation as your final answer. You can imagine something harder, such as “produce an analysis forecasting next year’s company revenue”, taking many cycles of database querying (Tool) and interpretation (Thought) iterations.

In the ReAct cycle, whenever a tool is requested in the Thought block, the agent framework stops the LLM execution and instead programmatically runs that tool. It then forces that output as an observation back to the agent before allowing it to continue. This injection pattern implements a _closed-loop control mechanism_ that:

  * **Grounds agent reasoning in actual data** – By mandating that every tool output must be processed as an observation, this prevents the agent from hallucinating or fabricating tool results.
  * **Maintains context coherence** – Forces the agent to explicitly acknowledge and reason about each piece of retrieved information before proceeding.
  * **Prevents reasoning drift** – The observation step acts as a checkpoint, helping verify the agent’s thought process remains anchored to factual tool outputs rather than speculative reasoning.
  * **Supports auditability** – Creates an explicit trace of tool invocation → observation → reasoning that can be logged for compliance review.



This is analogous to a _feedback control system_ in engineering. The agent can’t proceed to the next action without first processing the feedback (observation) from its previous action, preventing open-loop behavior that could lead to hallucinations or off-track reasoning.

A challenge with this approach is that when a task is so complicated that it needs many turns and observations, the prompt can get very long in the later turns, particularly with verbose observations. The sub-task decomposition limits the scope of each question to keep the number of turns smaller. Prompt caching also helps with the cost of input tokens, which is the primary cost driver here. With prompt caching, you only pay for the new observations and thoughts that are appended to the previous messages at each turn. Amazon Bedrock provides this capability.

### Full agentic review architecture and infrastructure

Stripe relied on a significant amount of infrastructure to support the actual agentic execution. The following diagram shows the full architecture.

The full architecture consists of the review interface and orchestrator covered earlier and an _agent service_ that hosts the agent logic and facilitates execution. The agent service is supported by Stripe’s _LLM Proxy_ service and connected to internal signals through available agent tools.

### Building a dedicated agent service

Before this project, Stripe’s agent service didn’t exist, and this project resulted in Stripe requesting it. Initially, Stripe attempted to fit an agent into a traditional ML inference engine. This approach was rejected quickly for the following reasons:

  1. **Compute profiles –**  Traditional ML is compute bound, requiring expensive hardware such as GPUs, fast multi-threaded CPUs, or large memory allocations. In contrast, agentic applications are mostly network bound, waiting on foundation models to finish or tool calls to run.
  2. **Latency –**  Referencing the ReAct flow described previously, an agent can take an indeterminate amount of time to finish, depending on how many rounds of tool calls it needs. A long agent query or a database tool call could cause a thread to sit idle for minutes, compared to an XGBoost model that would finish in milliseconds.
  3. **Different API –**  In contrast to traditional ML that tends to output basic types (floats, Booleans, and others), agents need more flexibility in their schema to annotate their results. Some agents need to maintain stateful conversation states.



As a result, Stripe stood up its own agent service, initially resembling a stateless, synchronous inference endpoint. Today it also handles stateful, multi-turn conversational agents. It has grown from a few agents at launch to well over 100 agents in less than a year.

### LLM proxy architecture

Stripe’s ReAct agent doesn’t call Amazon Bedrock directly. Instead, Stripe uses an LLM Proxy microservice as its standard method for LLM access. The following diagram shows the LLM Proxy architecture.

Stripe uses an LLM Proxy service for the following reasons:

  * **Noisy neighbors –**  Stripe has many teams using LLMs for various applications. The LLM Proxy provides safeguards from other teams hogging the LLM bandwidth for a particular model, preventing resource contention.
  * **One API, many models –**  The single endpoint simplifies specifying capabilities such as prompt caching or tool calling across foundation models from Amazon and leading AI companies. Changing models requires only changing the model type as an argument, instead of each use case managing many different clients.
  * **Model fallbacks –**  This provides the ability to automatically specify default models in the case of resource constraints or outright failure.
  * **Monitoring –**  By requiring authentication, the service can track model usage to help forecast future resource demand and confirm the appropriate models are being used depending on the privacy of the application.



### How architectural components work together

Human reviewers drive the review, using agentic responses as pre-fetched research. As they answer, those responses can be used in the prompts for deeper questions during the same review, orchestrating review questions as a directed acyclic graph (DAG).

For a given question, the agent can call tools to dynamically access internal data or services as needed. This approach is used because the potential relevant signals that could be examined are typically much larger than what can be included in a prompt. The tool-calling aspect of the agent means the thought log includes only the relevant data to answer the current question, without additional irrelevant information, inducing focus.

The agent itself is driven by foundation models from Amazon and leading AI companies, which are responsible for thinking and determining which tool calls are needed. The agent application accesses the LLM through the LLM Client, which abstracts away features such as prompt caching and model fallbacks.

### Amazon Bedrock integration benefits

Stripe uses Amazon Bedrock within its LLM Proxy. Amazon Bedrock provides the following further benefits:

  1. **Standardized privacy and security –**  As a payment processor, Stripe must be extra careful around privacy and security. Amazon Bedrock helps verify that foundation models from Amazon and leading AI companies fit within existing security and privacy constraints, without additional review overhead for each model.
  2. **Feature rich –**  As described earlier, Amazon Bedrock allows for prompt caching on supported models. Additionally, Amazon Bedrock allows for fine-tuning and serving custom models, which Stripe expects to focus on in the coming year.
  3. **One API, many models –**  Integration is straightforward because models fall within the same API. Changing models requires using a different model name. Amazon Bedrock also supports many different foundation models from Amazon and leading AI companies, providing industry-standard performance for Stripe.



### Audit trail implementation for regulatory compliance

Even though Stripe ultimately uses human reviewers to make judgments and decisions, the system still must verify it stands up to regulatory scrutiny. As a result, Stripe implemented logging so the entire agent log is retrievable for each run historically. Every agent action, decision, and rationale is documented.

## Results and impact: 26 percent faster reviews with over 96 percent helpfulness

Stripe achieved a 26 percent reduction in median review handling time through agentic automation, with over 96 percent helpfulness ratings maintained from reviewers, and human reviewers in control of decisions. This was accomplished while providing full audit trails meeting examination standards.

As Stripe continues to grow, the organization will be able to keep up with proportional demand for risk management. Human reviewers can focus their time on tougher problems or new investigation opportunities, leading to an improved compliance program.

## Key lessons learned from production deployment

Through the process of building and deploying this production agentic AI system, Stripe distilled several insights that shaped the project’s success and can inform similar implementations.

**Bite-sized tasks –**  Keep agent tasks small enough for working memory. Test quality incrementally rather than diving straight into full automation.

**Orchestration –**  Async workflow architecture with DAG support is essential for complex agent interactions while maintaining auditability and human oversight at scale.

**Infrastructure –** Dedicated microservice architecture matters because agents have fundamentally different resource profiles than traditional ML models. Traditional inference systems are compute-bound and optimized for millisecond responses on expensive GPU hardware. Agents are network-bound, spending minutes waiting on LLM calls and tool executions with unpredictable latency patterns. A dedicated agent service handles these long-running, stateful interactions through async execution patterns. This allows threads to efficiently manage multiple concurrent agent sessions without blocking on external calls. Token caching reduces costs by 60% by reusing common prompt prefixes across agent turns rather than reprocessing the entire conversation history on each step. Cost instrumentation tracks token usage per agent invocation, helping teams forecast spend as workloads scale and identify optimization opportunities before they impact budgets. This infrastructure-first approach transformed agents from an experimental prototype into a production service supporting more than 100 agents across Stripe.

**Keep humans in control –**  Agents assist, but expert reviewers maintain final decision authority. Constrain agents with rails to bound context.

## What’s next

Initially, Stripe focused on questions that can be answered before the review even starts. Remaining questions likely require upstream context known and validated during the review. This will lead to more complex, multi-step investigations that orchestrate real-time answers as context during the review, supporting deeper efficiency improvements. The current 26 percent reduction represents early progress.

Because Stripe isn’t willing to accept an increase in risk tolerance by using this technology, the team tests the agentic investigation component against human quality standards. The team validates with actual humans before allowing the component to inform reviewers in production. The team is also exploring ways to use LLMs to quickly judge and eliminate subpar approaches.

Amazon Bedrock provides customization capabilities that Stripe is exploring to further enhance its compliance system. Currently, Stripe uses Retrieval Augmented Generation (RAG) for dynamic knowledge injection through tool calls, which gives its agents access to real-time compliance data. Looking ahead, Stripe is considering using the fine-tuning capabilities of Amazon Bedrock to adapt model behavior specifically for financial compliance tasks. This would help lock in model quality and reduce re-evaluation overhead as models evolve. Additionally, Amazon Bedrock provides continued pre-training options for incorporating domain-specific knowledge, which could help build more specialized compliance expertise into agent reasoning. The model versioning and 6-month deprecation notice window in Amazon Bedrock helps plan these customization efforts strategically, allowing model upgrades only when they meaningfully improve investigative capabilities. These complementary techniques work together to balance performance, stability, and adaptability as compliance operations scale.

## Conclusion

Stripe has demonstrated that agents can speed up manual review processes, achieving a 26 percent reduction in review handling time while maintaining over 96 percent helpfulness ratings, even with humans maintaining decision authority rather than full automation. Instead of relying on the power of agents alone, Stripe accomplished this by building rails to constrain agents to the bite-sized review areas where they can be successful. To achieve this, Stripe needed new agentic serving infrastructure, inspired by but distinct from the machine learning inference systems that have historically existed.

This became possible with Amazon Bedrock, which provided Stripe with the privacy protections and model selection that supported this jump in review efficiency, and these capabilities are expected to extend into many other domains.

To learn more about how to build similar agentic systems on Amazon Bedrock, see the [Amazon Bedrock User Guide](<https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html>) and the [Amazon Bedrock prompt caching documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html>). To get started, visit the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>).

* * *

## About the authors

### Christopher Phillippi

Christopher is a Staff Data Scientist at Stripe specializing in AI/ML systems for compliance and risk reviews, bootstrapping the technical design of compliance review automation end-to-end — from the ML systems that trigger reviews to the tool-calling agents that make human reviewers more effective while preserving their decision-making authority. With 12 years of experience building production ML systems across financial services, gaming, and social platforms, he previously served as a Machine Learning Engineer at Meta designing graph learning systems, built recommender systems at Electronic Arts, and began his career on the quant trading desk at Royal Bank of Canada as a Quant.

### Chrissie Cui

Chrissie is a Distinguished Manager of Managers and Platform Leader at Stripe with over 15 years of experience architecting, scaling, and ensuring the reliability of mission-critical AI/ML and Data infrastructure. At Stripe, she leads the AI Platform, owning the AI agentic stack end-to-end—from Kai, the internal productivity agent used by every Stripe employee daily, to the LLM gateway that serves as the access layer to LLM providers, spanning across agent experiences, agent framework, agent harness, AI quality, AI governance and compliance, LLM access and LLM cost management. Her teams also built Shepherd, Stripe’s adaptation of the ML feature platform Chronon, and co-open-sourced Chronon with Airbnb. Prior to Stripe, Chrissie has held technical leadership and senior engineering roles at Google, Bloomberg, and other leading technology companies.

### Mohan Musti

Mohan is a Principal Technical Account Manager at AWS based in Dallas. Mohan helps customers architect and optimize applications on AWS, specializing in managing complex AI/ML operations at scale. He frequently contributes to the AWS ML Customer community by developing practical reference applications that solve real-world machine learning challenges. In his spare time, he enjoys spending time with his family and camping.

### Hasan Tariq

Hasan is a Principal Solutions Architect at Amazon Web Services based in San Francisco. He works with Financial Services customers, helping them modernize their technology platforms and build innovative solutions on AWS. With more than 18 years of industry experience covering a wide range of technologies, Hasan brings deep expertise in designing scalable, production-grade architectures. His current areas of focus include coding agents and agentic commerce.
