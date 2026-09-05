---
sha256: 1eb4176636c0a436bc8d28a73571595b0385132fa1b56a92b2129929b5872535
source: newsletter
source_url: https://airbyte.com/blog/airbyte-agents
tags: [airbyte, data]
title: "Airbyte Agents: A New Era for Airbyte | Airbyte"
published: 2026-05-12
ingested: 2026-05-12
---
Today we're launching Airbyte Agents. It's the biggest step we've taken as a company since we open-sourced our first connector six years ago.
But before I get into what it is, let me first explain why we built it.
## **The Real Reason Agents Fail**
Until recently, the complaints about AI have always been about the models. That is no longer the case. Frontier models have improved dramatically, and keep getting better with each release. The real problem is the data feeding into these models.
Agents are powerful, but they are not wise. To operate at their best, they need fresh context delivered in the right format and at the right time. From our experience, current ways of moving data simply aren’t enough:
*   Data pipelines assemble data for dashboards and humans, not for autonomous agents asking questions in real-time
*   APIs return data one system at a time, with agents left stitching together context at runtime
*   MCPs solve the communication gap between LLMs and APIs, but they inherit the same fragmentation issues (as most are thin wrappers built on pre-existing APIs)
These problems are already bad enough taken in isolation, but they start compounding the moment agents need to reason across multiple data sources. And that’s when agents break in production.
The deeper issue is that traditional data interfaces assume the caller already knows what it wants. APIs assume you know the exact endpoint, object ID, fields, and operation. Production agents often start one step earlier: they need to discover which business entities matter before they can fetch fresh state or take action.
The solution isn’t better APIs or MCPs, it’s pre-assembled context. So we took everything we learned in over six years of building data pipelines, and turned it into a context layer designed for real, production grade agents.
## **What Airbyte Agents Actually Does**
Airbyte Agents gives every AI agent a unified view of your operational data, replicated and ready to query before the agent ever runs.
Agents get a context layer for discovery, backed by live connectors for fresh reads and writes when they’re ready to act.
It’s built around something we call the [Context Store](https://docs.airbyte.com/ai-agents/concepts/context-store): a data index optimized for agentic search. It gives agents a structured way to discover the right customers, tickets, invoices, messages, and records before they start making live calls.
Instead of stitching together fragments from a bunch of APIs at runtime, the agent can search across unified business context first, then fetch fresh state from the source system when it needs to act.
When an agent needs to understand which customers are at risk of churn, it can use the Context Store to discover the relevant accounts, support history, product signals, and billing context first. Then it can make API calls only where freshness matters. Five or six exploratory calls collapse to one or two targeted ones.
In early testing, agents using the Context Store consume 40% fewer tool calls and up to 80% fewer tokens. (If you’re not familiar with tokens and tool calls, this means you can get much more out of your AI tools before hitting your plan limits). And because the agent gets exactly what it needs, we see fewer hallucinations and more reliable reasoning. All while saving time and money.
Okay, but why does that matter? Let’s look at a practical example.
Say you ask an agent to find something in Slack. A common request, but more complicated than it sounds.
The problem is not just search. The agent first has to discover where the answer might be: which channels, which threads, which messages, and which permissions apply. Through the raw API, that can mean listing channels, paging through messages, and pulling individual threads before the agent finds the relevant context.
The agent has to list every channel, scroll through all the messages, and pull individual threads just to find what's relevant.
With Airbyte Agents, Slack data is already indexed in the Context Store. The agent can discover the relevant message or thread first, then use the live connector only when it needs fresh state or needs to act.
The results are very promising. We compared calling the Airbyte Agent MCP vs a few vendors MCPs across five connectors: Gong, Linear, Salesforce, Slack and Zendesk. We tested retrieving, listing and searching scenarios on each.
Here's the token savings our MCP delivered across the board:
*   Gong: up to 80% fewer tokens
*   Zendesk: up to 90%
*   Linear: up to 75%
*   Salesforce: up to 16%
We’re planning to release our benchmark harness very soon and make it publicly available so you can run the tests yourself (stay tuned!).
While it’s early, we’re very excited about the results. We feel this is a big unlock and we cannot wait for everyone to experience it.
## **Three Ways to Use It**
We designed Airbyte Agents to work the way you do, whether you’re using Claude, ChatGPT, or building custom agents.
[**Airbyte Agent MCP**](http://airbyte.com/blog/agent-mcp) lets you connect your data sources to Airbyte once, then build and run agents inside Claude, ChatGPT, Cursor, or any MCP-compatible client. No code required. You get the same governed access to the Context Store without writing a line of code.
[**The Agent SDK**](http://airbyte.com/blog/agent-sdk) is for engineering teams building custom agents and applications directly against the Context Store. Full programmatic control over retrieval, permissions, and state.
[**Automations**](https://docs.airbyte.com/ai-agents/interfaces/ui/automations) is a visual interface for building and running agents directly inside Airbyte. It's in research preview for those who don't want to wait for help to build agents.
All three share the same foundation, the Context Store and a new breed of Airbyte connectors, with authentication and write capabilities built in. We’re shipping more connectors weekly.
## **What We're Launching With**
I want to be upfront: what you see today is early. It works, and teams in our beta are already getting real results. But there is a lot more to build, and we have a lot more coming.
The Context Store is shipping as a unified business context layer, but there are still some elements in development. Keep an eye out for new features over the next few months.
We're launching with 50 production-ready connectors covering the systems most central to enterprise operations: Salesforce, HubSpot, Zendesk, Linear, Slack, and more. We're shipping new connectors every week.
A growing number of connectors also support write actions. Agents can update records, create tickets, and post messages in the systems of record. This was non-negotiable for us. Read-only agents can only describe work. Agents that can write can actually do work.
## **What We're Hearing from Early Users**
Nate Chambers, Chief Product Officer at ORCA Analytics, put it better than I could: "Airbyte Agents has massively accelerated our roadmap. What we thought would take 6+ months, we were testing in the first week of the beta program. They're shipping everything we need for agentic workflows, and launching new connections faster than we can build them into our product."
And Franziska Ibscher, Head of Product at Drivepoint adds, "Without Airbyte, we'd be stitching together bespoke connectors for every integration, which would slow us down dramatically. With Airbyte, our AI features have fresh, reliable data to work with. Whether we're running automated financial models or powering AI agents that answer questions about a brand's business, none of it works without trustworthy data flowing in, and that's what Airbyte gives us."
That kind of feedback tells us we're pointed in the right direction, even if we're still early.
## **Is Airbyte Still a Data Movement Company?**
Short answer, yes. Long answer, very much yes.
We are fully supporting our Data Replication Engine for ETL/ELT, ingestion, and data movement. That technology is not going anywhere, nor is our open-source offering.
In fact, all of the work we did on data movement is what made the Context Store possible. Moving data reliably between systems at scale, handling auth, schema evolution, and hundreds of API quirks… that’s the foundation the Context Store runs on.
Data Replication is the foundation, Airbyte Agents is the evolution.
## **What Comes Next**
This launch is a starting point. We're putting something real into the world because we believe the best way to build this is with the people who actually need it. The product will get better fast, and the teams building on it early will shape what it becomes. Future phases will expand the user interfaces, automation capabilities, and consumption models tied to agent activity.
Airbyte Agents offers a generous Free tier, with paid plans available for teams that need to scale their usage.
The bottleneck for AI agents was never the models.
It was always context. And context needs production-grade infrastructure. With real context infrastructure, agents can discover what matters, fetch what is relevant, and act responsibly.
This is the problem we've spent five years getting ready to solve.
We're just getting started. [Try it out.](http://app.airbyte.ai/sign-in)
P.S. If you already have an existing Airbyte data replication account, your credentials should work just fine to login. For now, the two products have separate dashboards.