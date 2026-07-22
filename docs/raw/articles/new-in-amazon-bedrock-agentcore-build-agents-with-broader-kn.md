---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/new-in-amazon-bedrock-agentcore-build-agents-with-broader-knowledge-and-continuous-learning/
ingested: 2026-06-18
sha256: a1498fb062e4bf27c49167a0364f89b7d170e042e29ee586ed08b51840ce2c9f
feed_name: AWS China ML
source_published: 2026-06-17T15:29:36Z
---


# New in Amazon Bedrock AgentCore: Build agents with broader knowledge and continuous learning

The models powering today’s agents are remarkably capable. They can reason across complex problems, plan multi-step workflows, and generate nuanced responses. But most agents are operating well below that potential. The gap isn’t intelligence. It’s access to the right context and feedback.

A customer service agent tasked with answering a question about your company’s refund policy can’t help if it can’t reach the document in SharePoint where that policy lives. A research agent building a market brief delivers an incomplete picture if it can’t access current information beyond its training data. A financial advisor agent returns a second-best recommendation if the real-time market data it needs sits behind a paywall it can’t get through. And across all of these, most teams have no systematic way to know whether their agents are getting better or worse once deployed.

A capable model is only the starting point. What makes an agent perform in production is access to everything it needs to do the full job: the right knowledge, the resources to act, and the feedback loops to keep improving.

Today we’re introducing new capabilities on [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>), the platform to build, connect, and optimize agents. In this post, we cover how these capabilities close each gap: connecting agents to organizational, web, and paid knowledge; helping teams find and fix what’s going wrong in production; and enforcing controls that scale as agents grow more capable. Together, they help you build more capable agents faster, govern them with controls that scale, and improve them continuously.

# Agents that know more and reach more

We’re giving agents on AgentCore native access to three layers of knowledge, each broadening what your agents can reach and accomplish.

**Organizational knowledge layer: Amazon Bedrock Managed Knowledge Base**

Your most valuable information is scattered across SharePoint, Google Drive, Confluence, S3, and internal wikis. Making it available to agents has traditionally required building custom ingestion pipelines, tuning retrieval, and maintaining data freshness over time. That’s months of engineering before your agent can answer a basic question about your own business.

[Bedrock Managed Knowledge Base](<https://aws.amazon.com/blogs/aws/introducing-amazon-bedrock-managed-knowledge-base-for-faster-more-accurate-enterprise-ai-applications/>), now available on AgentCore, replaces that work. You connect your unstructured data sources, and AgentCore handles the rest. We manage the vector store, the embeddings and re-ranking models used during retrieval, and the scalability concerns like rate limits, so your team can focus on building agents rather than operating pipelines. At its core is an agentic retriever that goes well beyond traditional RAG. Instead of matching a query to the closest chunks, it plans queries across your knowledge bases, connects related concepts across documents, evaluates intermediate results, and re-ranks before answering. For complex, multi-part queries that span several topics at once, agentic retrieval surfaced noticeably broader and more complete coverage than basic retrieval. Your agent goes from “I don’t have access to that” to a synthesized answer drawn from your actual business knowledge, with no pipeline to build and no retrieval to tune.

**World knowledge layer: Web Search on AgentCore**

Internal knowledge has gaps. Regulations change, markets shift, competitors launch new products constantly. To do their best work, your agents need to understand what’s happening in the world outside your organization, for research, fact-checking, customer service, and market intelligence.

Today we are introducing [Web Search](<https://aws.amazon.com/blogs/aws/announcing-web-search-on-amazon-bedrock-agentcore-ground-your-ai-agents-in-current-accurate-web-knowledge/>), a new tool for developers building AI agents. It provides information from the web while keeping data within the customer’s secured AWS environment. Built on the same search infrastructure from Amazon that powers Alexa+, Amazon Quick Suite, and Kiro, Web Search is optimized for agentic retrieval, returning high-value excerpts that deliver high intelligence per token. It also takes a multi-source grounding approach, combining public web information with Amazon’s proprietary knowledge graph. That graph adds structured entity data, verified facts, and real-time information like stock prices and sports scores. Web Search on AgentCore keeps your queries within your AWS security and compliance boundary, with no extra vendor to onboard and none of the orchestration, authentication, and billing workflows that come with one. Whether you’re building research agents that cross-reference public sources, compliance agents that monitor regulatory and policy updates, or grounding model responses in current information, your agent can now reason over the live web the same way it queries your internal knowledge.

> _“At Sony, we’re building an enterprise AI agent platform on AgentCore where teams across business units can develop, share, and reuse AI agents – from knowledge assistants to workflow automation agents – each tailored to their needs. Our enterprise knowledge is distributed across repositories such as SharePoint, Confluence, and Amazon S3, and includes complex documents such as PDFs, presentations, and spreadsheets with charts and tables. Now that Bedrock Managed Knowledge Base and Web Search are available in AgentCore, we can equip agents with advanced retrieval and live web grounding with a consistent governance model, without building these capabilities from scratch. This accelerates our vision of transforming how people work, with AI as a catalyst, at scale.”_
> 
> _Masahiro Oba, Senior General Manager, Sony Group Corporation_

**Paid knowledge layer: AgentCore payments and AWS WAF AI traffic monetization**

The best information isn’t always free. Financial market feeds, licensed research, proprietary datasets, premium APIs. If your agent can’t access paid resources, it returns a suboptimal answer and the user never knows what was missed.

Accessing paid content takes two parts: agents need a way to pay, and providers need a way to get paid. AgentCore payments, announced in preview last month, handles the agent side, letting agents discover paid services and content, access them, and pay within their execution loop. [WAF AI traffic monetization](<https://aws.amazon.com/blogs/aws/aws-waf-adds-ai-traffic-monetization-capability-to-help-content-owners-charge-ai-bots-for-content-access/>), now generally available, handles the provider side, giving content owners the ability to control agent access: block it, allow it, or get paid. Because both capabilities run on the same platform, providers using WAF automatically recognize agents verified on AgentCore. The result is a trusted channel: lower friction for verified agents, and compensation for providers. Together, these capabilities build the infrastructure for both sides of the agent economy, so agents can reach everything, not just what happens to be free.

# Agents that learn from every interaction

Giving agents better access to knowledge is only part of the equation. You also need to know whether your agent is actually meeting its goal, and catch it when it isn’t.

This is harder than it sounds. The most dangerous agent failures aren’t the ones that throw errors. They’re the ones that look fine on dashboards: an agent that confirms an order modification it never executed, one that fabricates product availability when an API times out, another that skips an approval step while dashboards show a 99% success rate. These failures produce no error signals. They surface through customer complaints weeks later, often after thousands of sessions have been affected. And even when teams know something is off, fixing it is mostly guesswork. You tweak a prompt, change a tool description, adjust orchestration logic, and hope it helps, with no structured way to know whether the change actually improved things or quietly broke something else.

Today we’re announcing new optimization capabilities in AgentCore that turn production traces into continuous improvement. Together, they form a loop: understand what your agents are actually doing, generate fixes grounded in data, validate them before they ship, and prove they work.

**Understand what your agents are doing:** Available in preview today, AgentCore provides rich failure, intent, and trajectory insights across hundreds of sessions, surfacing patterns no dashboard or one-at-a-time trace review would reveal. Failure insights discover recurring failure patterns, including the silent behavioral failures that produce no error signal, explain the root cause of each in detail, and rank them by how widespread they are, so you can tell at a glance which problems are hurting the most users and fix those first. Intent insights cluster requests by what users were actually trying to do, so you can see the real shape of how your agent is used. Trajectory insights group the paths your agents take through a task, so you can spot common patterns and outliers. You can enable continuous monitoring with daily or weekly reports, or run a targeted investigation after a deployment or a spike in complaints, with results in minutes.

**Fix it with confidence:** Once you know what to change, recommendations and A/B testing, generally available today, help you act. Recommendations analyze your traces and evaluation outputs to suggest specific improvements to your system prompts and tool descriptions, grounded in how your agent actually behaves. Batch evaluation tests those recommendations against your defined test dataset and reports aggregate scores, so you catch regressions before changes reach production. A/B testing runs a controlled comparison between agent versions by splitting live production traffic, giving you real evidence that a change works under production conditions before you commit to it. All of this works regardless of where your agents run: on AgentCore’s runtime, AWS Lambda, Amazon EKS, or non-AWS environments.

This is what continuous improvement looks like when it’s built into the platform rather than stitched together after the fact.

> _“At FUJISOFT, we’re building AI agents to accelerate software development and operations. Our framework, Character Capsule, packages agent roles, skills, and procedures as reusable capsules that run on local coding tools like Copilot and Kiro, or scale to multi-agent orchestration on AgentCore. As we deployed more agents, our biggest challenge was the silent failures that looked fine but surfaced later, and fixing them was guesswork. The optimization capabilities in AgentCore changed this. They analyze our production traces to surface failure patterns, explain why they happen, and rank them by impact. We then get recommendations to improve our prompts and tool descriptions, and A/B test them on live traffic before committing. Agent improvement is now a continuous loop grounded in data, not trial and error.”_
> 
> _Kazumi Matsuda, Senior Manager, AI Promotion Department, FUJISOFT_

# Stronger control as agents grow more capable: New policy enhancements

More capable agents mean more surface area. And agents introduce a security challenge that traditional software never had: they’re probabilistic. Agents make judgements, and judgements can be influenced by context. The new point of exposure isn’t your network; it’s the agent’s context, where prompt injection and memory poisoning don’t require breaking in but simply convincing the agent to make a bad judgment.

The way you secure something probabilistic is with something deterministic: not as the brain, but as guardrails around it. The policy capabilities in AgentCore already provide real-time, deterministic controls that define what an agent can and cannot do with your tools and data at the gateway. Today we’re extending them with Bedrock Guardrails integration, generally available, which evaluates every agent action for prompt injection attempts, harmful content, and sensitive data exposure. These checks run at the gateway layer, outside the agent’s code, where the agent can’t see them in its context, can’t reason around them, and can’t convince itself they don’t apply.

Guardrails is the first of many detection signals the policy engine can act on, and it won’t only be our own. Coming soon, AgentCore will let you feed detection signals from leading security providers, including Check Point, Zscaler, Rubrik, Netskope, and SentinelOne, into the same policies. The principle stays the same no matter where a signal comes from: detection can be probabilistic, but the policy enforcement is always deterministic, making the final allow-or-deny decision based on established thresholds.

Because every tool and context source on AgentCore routes through the gateway, the new capabilities your agent gains are automatically governed by the same security layer. More capable agents, stronger controls, scaling together.

# From idea to working agents in minutes: AgentCore harness is generally available

An agent is more than a model. If the model is the brain, the harness is the body: everything the brain needs to get work done. It runs the orchestration loop, executes tools, manages the context window, persists state across turns, recovers from failures, and isolates each session. The harness shapes how well an agent performs as much as the model does. Building a durable one is where most teams spend their time today.

AgentCore harness, generally available today, gives you that layer as a managed capability. Instead of coding the loop, you define your agent in configuration: the model it uses, the tools it calls, the skills it has access to, the instructions it follows. AgentCore assembles and runs that loop for you. From that single definition, you get a working agent in minutes, running in its own isolated environment. It comes with a filesystem and shell, memory across sessions, skills (including the AWS-curated catalog), and web browsing. This isn’t a starter tool you outgrow: the configuration you start with is what you operate at scale, and when you need custom orchestration, you can export your harness to code, and stay on the same platform without rebuilding anything.

Besides speed, what this unlocks is a real choice the market doesn’t offer yet. The harness options available today each leave you tied to something. Open-source options make you host and operate the harness yourself; managed services lock you to their environment; harnesses from model labs are optimized for their models only. We decoupled the harness from the model, so you can choose any model and switch between them mid-session without touching your agent logic. As the frontier moves and the best model for a task changes, your agent’s foundation stays put.

Choice is only part of it. Because the harness is one piece of a single platform rather than a hosting layer wrapped around a framework, it reaches your tools through the same gateway that enforces your security policies and connects your agent to organizational knowledge, web search, and paid services. Identity, memory, and observability come from that same platform, so every action your agent takes is governed and traced from the first call without additional wiring. The agent you declare on day one is the agent you run at your thousandth, on the same foundation throughout.

> _“Twilio’s customers are building AI agents that work across voice, messaging, and digital channels, with real-time intelligence and persistent memory that make every interaction feel like a conversation. By combining AgentCore harness with Twilio Conversations, developers can go from idea to live agent without rewiring infrastructure. The best customer experiences happen when great AI and great communications infrastructure are built together.”_
> 
> _Omar Paul, VP of Product, Twilio_

**Get started**

These capabilities are generally available today on AgentCore: managed harness, Bedrock Managed Knowledge Base, Web Search, Guardrail Integration, recommendations and A/B testing. Insights and payments are available in preview.

Get started in the [console](<https://us-west-2.console.aws.amazon.com/bedrock-agentcore/home?region=us-west-2>) or with the [AgentCore CLI](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html>). Visit the [documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>) to learn more.

* * *

### About the authors

**Madhu Parthasarathy**

Madhu Parthasarathy is the GM of Amazon Bedrock AgentCore, where he leads the team building the platform that companies use to build, connect, and optimize production AI agents. He brings more than 20 years of experience building large-scale distributed infrastructure, including over 16 years at Amazon, where he has led major initiatives across Amazon Retail, Elastic Block Store (EBS), and now AgentCore. Before returning to Amazon, Madhu held senior leadership roles at LinkedIn, where he led the enterprise platform powering all of LinkedIn’s enterprise lines of business, and at a neo-cloud startup, where he led AI infrastructure and set the vision for security and developer experience. He is based in Santa Clara, California.
