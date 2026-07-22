---
title: "Introducing eve"
source_url: "https://vercel.com/blog/introducing-eve"
ingested: "2026-06-19"
sha256: "36ba7ba3700b50c1"
type: article
tags: [article]
---

# Introducing eve


Markdown Content:
Today, we are proud to introduce [eve](https://vercel.com/eve), an open-source agent framework for building, running, and scaling agents. eve is designed around the idea that building an agent should mean defining what it does without assembling all of the pieces that it needs to run in production. Instead, eve comes with production already built in:

*   Durable execution

*   Sandboxed compute

*   Human-in-the-loop approvals

*   Subagents

*   Evals

*   And more

eve is the framework that we build and run our own agents on.

Agents today are where the web was before frameworks, with everyone hand-rolling the same plumbing and nothing carrying over to the next one. [Next.js](https://nextjs.org/) ended this for the web, and eve is doing the same for agents.

## [Link to heading](http://vercel.com/blog/introducing-eve#an-agent-is-a-directory)An agent is a directory

This is an eve agent.

`agent/  agent.ts                   # the model it runs on  instructions.md            # who it is  tools/    run_sql.ts               # what it can do    post_chart.ts  skills/    revenue-definitions.md   # what it knows  subagents/    investigator/            # who it delegates to  channels/    slack.ts                 # where it lives  schedules/    monday-summary.ts        # when it acts on its own`

A data analyst agent, readable at a glance

Each file describes one component of the agent, so at a glance, the tree tells you what an agent is, what it does, where it lives, and when it acts on its own.

### [Link to heading](http://vercel.com/blog/introducing-eve#create-an-eve-agent-in-minutes)Create an eve agent in minutes

Every agent starts with its definition.

agent/agent.ts

`import { defineAgent } from "eve";export default defineAgent({  model: "anthropic/claude-opus-4.8",});`

Configuring the agent and its model in one file

The `agent.ts` file is where you configure the agent itself. You can define the model with one line, with provider fallbacks supported through [AI Gateway](https://vercel.com/docs/ai-gateway), and compaction, model options, and [other optional fields](https://beta.eve.dev/docs/agent-config#other-defineagent-fields) are there when you need them.

Giving your agent a job and personality is as simple as creating an `instructions.md` file, which serves as the system prompt that eve puts in front of every model call.

agent/instructions.md

`You are a senior data analyst. You answer questions about the team's data.- Prefer exact numbers to hand-waving. If you can compute it, compute it.- State the assumptions behind any number you report (date range, filters, grain).- Use the tools available to you rather than guessing. If you cannot answer from  the data, say so plainly.`

The agent's identity and standing rules, prepended to every model call

You create files for what your agent does, like `post_chart.ts` and `revenue-definitions.md` for tools and skills, and eve wires them into a working agent without any boilerplate or plumbing to manage. You can just focus on what your agent does instead of how it does it.

## [Link to heading](http://vercel.com/blog/introducing-eve#why-we-built-eve)Why we built eve

We had built agents for years at Vercel, [v0](https://v0.app/) among them. But once coding agents made building one something anyone could do, everyone did. We shipped hundreds of agents and internal apps, and it looked like a productivity revolution.

But underneath it, every team was building and rebuilding the same plumbing before their agent could do anything, and none of it carried over from one use case to the next. Each agent was designed for a different task, but they all had the same needs, and the same structure kept emerging to meet them. Agents have a shape.

eve is that shape made into a framework. Every generation of software earns its abstractions once enough people have built the same thing the hard way, and agents are there now.

## [Link to heading](http://vercel.com/blog/introducing-eve#batteries-included)Batteries included

Everything an agent needs in production ships with the framework.

### [Link to heading](http://vercel.com/blog/introducing-eve#a-durable-session-for-every-conversation)A durable session for every conversation

Agents wait on people, call slow systems, and run for hours, days, or weeks. In eve, every conversation is a durable workflow with each step checkpointed, so a session can pause, survive a crash or a deploy, and resume exactly where it stopped. This durability is built on the open-source [Workflow SDK](https://workflow-sdk.dev/).

### [Link to heading](http://vercel.com/blog/introducing-eve#a-sandbox-for-every-agent)A sandbox for every agent

The code your agents write should be treated as untrusted, so eve keeps agent-generated code out of your application runtime entirely. Every agent gets its own sandbox, an isolated environment for shell commands, scripts, and file reads and writes, running in a separate security context from the harness that controls the agent. The backend behind this sandbox is an adapter. When deployed, it runs on [Vercel Sandbox](https://vercel.com/docs/sandbox). Locally, it runs on Docker, microsandbox, or [just-bash](https://justbash.dev/), and you can write an adapter for any other provider.

### [Link to heading](http://vercel.com/blog/introducing-eve#human-in-the-loop-approvals)Human-in-the-loop approvals

Agents act on real systems, and some of those actions should require a person to approve them. Any action in eve can be configured to require approval, and the agent will pause there and wait, indefinitely if it has to, without consuming any compute. Once approved, eve continues the task right from where it left off.

### [Link to heading](http://vercel.com/blog/introducing-eve#secure-connections-to-tools,-data,-and-services)Secure connections to tools, data, and services

Agents need to connect to your backends, data, and other third-party services. In eve, a connection is a file that points at an MCP server or any API with a compatible OpenAPI document.

agent/connections/linear.ts

`import { defineMcpClientConnection } from "eve/connections";export default defineMcpClientConnection({  url: "https://mcp.linear.app/sse",  description: "Linear workspace: issues, projects, cycles, and comments.",  auth: {    getToken: async () => ({ token: process.env.LINEAR_API_TOKEN! }),  },});`

A connection to an MCP server, in one file

eve discovers the remote tools, hands them to the model, and brokers the auth, and the model never sees the connection's URL or credentials. [Vercel Connect](https://vercel.com/connect) handles interactive OAuth with consent and token refresh built in. At launch, eve agents can connect to Slack, GitHub, Snowflake, Salesforce, Notion, and Linear, plus anything else you can reach over OAuth, an API key, or an MCP server.

### [Link to heading](http://vercel.com/blog/introducing-eve#the-same-agent-on-every-channel)**The same agent on every channel**

Most agents live in exactly one place because every new surface is its own integration to build. In eve, the same agent serves every surface, and each channel is just a small adapter file. The HTTP API is on by default, with Slack, Discord, Teams, Telegram, Twilio, GitHub, and Linear included, and `defineChannel` covers custom channels. One channel can also hand off to another, so an incident webhook can open an investigation thread in Slack.

### [Link to heading](http://vercel.com/blog/introducing-eve#tracing-and-evals-built-in)Tracing and evals built in

When an agent gets something wrong, the first question is what the agent actually did. In eve, every run produces a trace. Each model call and tool call appears in order with its inputs and outputs, down to the commands the agent ran in its sandbox, so you can replay the run instead of piecing it together from logs.

`ai.eve.turn                      # one span per turn├── ai.streamText                # the model call│   └─
