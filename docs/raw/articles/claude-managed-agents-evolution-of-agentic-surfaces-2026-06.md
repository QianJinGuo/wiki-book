---
title: "The evolution of agentic surfaces: building with Claude Managed Agents"
source_url: "https://claude.com/blog/building-with-claude-managed-agents"
source: "blog|claude.com|brainoverflow"
author: ""
publish_date: "Jun 10, 2026"
ingested: "2026-06-11"
type: article
tags: []
source_type: rss
sha256: "b24046620e5da4ac20377d2e4a11ed8e61af6416aba0dc54bc05eab25b84cb93"
---
Getting an agent into production takes more than a good prompt. The agent needs somewhere to run the code it writes, credentials to reach your data, observable sessions, and infrastructure that scales with usage. On the Applied AI team, we work at the intersection of product, research, and the customers building on Claude—and we see the same pattern repeatedly: infrastructure is what separates a prototype from a production agent. All too often, teams burn development cycles on security, state management, permissioning, and harness tuning.

[Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview), our suite of composable APIs for building and deploying production-grade agents, pairs an agent harness tuned for performance with production infrastructure, allowing teams to go from prototype to launch in days rather than months. In this post, we'll cover the evolution of Anthropic’s agentic building blocks, why we built Claude Managed Agents, and how teams are using it in production today.

## **Evolving the agent architecture**

When we opened up Claude to developers in 2023, the API was deliberately simple: tokens in, tokens out. You sent a prompt, Claude returned a completion, and you built the harness and underlying infrastructure.

The API grew steadily richer over the years, but the contract underneath never changed: one request, one model turn, and your application decides what happens next. For a long time, that was enough. Summarizing a document, classifying a support ticket, rewriting a block of text—the kind of work that fits comfortably in a single turn.

Over time, however, the tasks people wanted to hand off stopped fitting. They wanted Claude to carry a task all the way through, look something up, act on it, see what changed, and decide what to do next. And they wanted it to operate _in_ the systems their work already ran on, like a codebase, internal wiki, or ticketing system.

With the API, turning Claude into an agent meant building your own loop: ask the model what to do, run the tool, feed the result back, and repeat. You were responsible for building and deploying the agent scaffolding, which may need tuning as models evolve. For agents that require full customization, this approach makes sense. For agentic workloads that are more predictable and less complex, optimizing harnesses as models and products evolved became tedious.

![Image 1](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298c28f950480f89a8dfcf_01%20_%20Messages%20API.png)

[Claude Code](https://code.claude.com/docs/en/overview), the agentic coding tool we launched in 2025 that lets Claude interact directly with your codebase, contained our own version of that harness: the loop, tool execution, subagents, context management, and rich capabilities that made it an effective agent. Developers naturally wanted similar harness machinery for their own agents across various domains.

To enable teams to build agents on top of the Claude Code harness, we released [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview). Claude Agent SDK gives developers tools to build their own agents on the same machinery that runs Claude Code instead of maintaining a homegrown loop. For a lot of teams, this is when agents became practical: the harness arrived already tuned for Claude with infrastructure primitives and it kept improving as Claude Code did.

Even with a harness, though, deploying agents in production environments can be challenging for several reasons:

*   **Hosting and scaling.** Where does the agent run, how long can a process stay alive for a multi-hour task, and what scales it when usage grows?
*   **Session management.** Where does an agent's history and progress live? Can a run survive an interruption and resume unencumbered? Can you go back and inspect what happened in previous sessions?
*   **Filesystem management.**Doing real work means producing artifacts: editing code, writing files, building outputs. Where does the agent get a workspace to act on, and what happens to that workspace between runs?
*   **Execution isolation.** The code Claude writes has to execute somewhere. What's the blast radius if it's wrong, and what boundary would you actually trust in production?
*   **Credentials.**The agent needs access to your systems. How does it get that access without exposing proprietary information to the code it generates?
*   **Observability.**When an agent works autonomously for an hour and does something surprising, can you reconstruct every step it took?

With the Agent SDK, many elements of the aforementioned production infrastructure are provided through Claude Code’s machinery. The agent gets a real filesystem to work in, session state is persisted locally or on external storage, and observability is exportable through OpenTelemetry into whatever monitoring stack you already run.

![Image 2](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298c53aaeeee508f2b3166_02%20_%20Claude%20Agent%20SDK.png)

However, as teams increasingly built agents that moved out of local development into production, they needed a way to deploy them at scale and with managed infrastructure. And as models and their surrounding harnesses become more advanced–running longer, executing more code, touching more systems, and taking more actions– scaling, security, and sandboxing became more challenging.

Several of these hurdles stem from a common architectural choice: agent harnesses often run _inside the same container_ as the filesystem it works on. A container has to spin up (paying a startup cost) before Claude can think, the agent along with code execution lives right next to your credentials, and when the container dies, the run dies with it.

Managed Agents solves these problems by [decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents). The harness that calls Claude runs separately from the sandbox where code executes, and the session–an append-only log of every model call, tool call, and result–connects the two. Claude can start reasoning before any container exists, the sandbox stays far away from your credentials, and a whole run can be reconstructed from its session at any point.

![Image 3](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298c97d4a887f2666a50b6_03%20_%20Claude%20Managed%20Agents.png)

## **When and why to use Claude Managed Agents**

When building with Managed Agents, users define the task, the tools, and the guardrails, and Anthropic runs the agent on our infrastructure and handles the agentic loop underneath: how to give an agent an execution environment to call tools, how to recover when something fails, multi-agent orchestration, and more.

When the harness doesn’t evolve alongside model intelligence, [the agent breaks down](https://www.anthropic.com/engineering/harness-design-long-running-apps). On Claude Sonnet 4.5, an agent would rush to finish as it neared the end of its context, cutting work short rather than using the room it had left—a pattern called "context anxiety." Our fix was to add context resets to the harness, baking in an assumption that Claude needed help staying coherent near the limit. That assumption didn't survive the next model. On Claude Opus 4.5, the behavior was gone, and the resets we'd added were just overhead.

For most organizations, maintaining a harness is overhead that doesn't differentiate their product. Harnesses have to be tuned for certain model behaviors; primitives like compaction, tool execution, and caching works differently on Claude than other models. With Claude Managed Agents, the harness evolves alongside the model, allowing teams to focus on what will differentiate their agents: **context management and domain expertise.**

To enable developers to configure the context and tools necessary to build effective agents, Managed Agents is built around three primary resources: agents, environments, and sessions. An _agent_ is a configuration: a model, a prompt, a set of tools, and the guardrails around them. An _environment_ is the execution context the agent runs in: the sandbox container, its networking rules, and the packages pre-installed in it, hosted on our cloud or on infrastructure you control. Each run is a _session_, which pairs an agent with an environment and gets its own isolated sandbox instance. Sessions persist their full event history, sandbox state, and outputs server-side, so long-running work can pause, resume cleanly, and be traced step by step after the fact. With Managed Agents, you can define an agent and an environment once, then run many sessions against the same configuration as your workload grows.

![Image 4](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a29a18bb07e245f8389acb9_04%20_%20Agents_%20environments_%20sessions%20(2).png)

## **Building for production and scale on Managed Agents**

Within Applied AI, we see agents go from prototype to production both inside Anthropic and across our customers’ systems, across coding, finance, support, legal, and a dozen other domains. This gives us a clear view of what separates a demo from a production-ready agent and where teams often get stuck.

Below, we share the most common reasons to build on a managed service like Claude Managed Agents:

**1. Credentials are kept out of the sandbox.** When everything runs in one container, the code Claude generates sits right next to your credentials, so prompt injections could lead the model to leak a token by convincing the model to read its own environment. We can protect against this by setting up robust guardrails within the same container, but decoupling the architecture enables a much more secure approach by keeping credentials out of the sandbox entirely. Tokens for tools like MCPs, CLIs, and GitHub repos live in a separate vault, and a proxy fetches them and decrypts them only on demand. Managed Agents provides [Vaults](https://platform.claude.com/docs/en/managed-agents/vaults) that handle credentials out-of-the-box, so you don’t need to run your own secret store, transmit tokens on every call, or lose track of which end user an agent acted on behalf of. Vault credentials are protected with envelope encryption before storage, and retrieval requires a signed request token for verification.

![Image 5](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a29a19cebb4eb7adac0a8ec_05%20_%20Managed%20Agents%20runtime%20(1).png)

**2. Lower latency from eliminated sandbox overhead.** Latency is a metric that is top-of-mind for many enterprise teams, since users acutely feel when they’re waiting for Claude to respond. Without the Managed Agents architecture, a container has to be spun up for every session, even the ones where the agent only needs to think and never runs a tool. That setup time is wasted, and the user feels it as a delay before the first response. With Managed Agents, Claude begins reasoning immediately while the environment spins up in parallel, and sessions that never run a tool skip the container entirely. This means the user sees the first token without waiting on container startup, and the environment is ready by the time the agent needs to run something. In our testing, that cut the time-to-first-token by roughly 60% in the median case (p50) and by over 90% in the slowest cases (p95).

**3. Reliable, persistent sessions that enable session management, observability, and memory.**Instead of request/response, Managed Agents thinks in terms of _events._ A session is an ongoing stream of events: every model call, tool call, and result, are appended to a log that lives outside the process running the agent. With this architecture, you get real-time updates as events stream in while the agent works, and you can resume any session later with no database or save-points to manage. History is preserved between interactions unless you delete the session, and when a session goes idle its container is checkpointed so you can pick up cleanly from where it paused. And because the whole run is already a record of events, observability and memory come with it: the Claude Developer Console offers a native visual timeline view of your agent sessions, and a debugging experience that allows you to examine any transcript in-depth. Managed Agents also comes with features like Memory and Dreaming that also use this session durability. [Dreaming](https://platform.claude.com/docs/en/managed-agents/dreams) is a scheduled process that reviews your agent sessions and memory stores, extracts patterns, and curates memories so your agents improve over time. Dreaming refines memory between sessions so that it can improve from recurring mistakes and user preferences by reading from the persistent session logs.

**4. Flexibility in Anthropic-managed or self-hosted cloud containers.** By default, with Managed Agents, you can delegate both orchestration and tool execution to Anthropic-managed cloud containers. This makes hosting and scaling simple and easy, delivering a faster path to production. Because the brain is decoupled from the hands in Managed Agents, the hands can live anywhere, including inside your Virtual Private Cloud (VPC). Thus, we also offer [self-hosted sandboxes](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes) for teams that want control over tool execution, so the agent’s code, filesystem, and network egress never leave their environment. We also provide [MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview), which let you connect Claude to Model Context Protocol (MCP) servers that run inside your private network. So self-hosted sandboxes control _where the agent’s code executes_, and MCP tunnels control _how Anthropic reaches MCP servers in your network_, giving you the ability to control exactly what stays inside your boundary.

![Image 6](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298e427c7a804ea4295163_image7.png)

_The built-in observability console for Claude Managed Agents records every event, so you can scrub the timeline, open any step, and read its raw payload._

Beyond these features, additional capabilities include outcomes that let an agent grade its own work against a rubric, multiagent orchestration, permission policies, and webhooks. Learn more [here](https://platform.claude.com/docs/en/managed-agents/overview).

### **How customers are building on Managed Agents today**

Across industries, customers are already shipping agents in production with Claude Managed Agents. Here are a few examples:

*   [Notion](https://claude.com/customers/notion) runs its Custom Agents on Managed Agents: teams assign work to Claude straight from a task board, Claude picks up the docs, meeting notes, and connected data around each task, and the finished code, decks, and sites land back in the workspace for review. Dozens of tasks run in parallel, and their team has described an early prototype turning roughly twelve hours of work into twenty minutes.
*   [Rakuten](https://claude.com/customers/rakuten) used Managed Agents to ship specialist agents across product, sales, marketing, and finance, each live within about a week.[](https://claude.com/customers/sentry)
*   [Sentry](https://claude.com/customers/sentry) paired its Seer debugging agent with a Claude agent that writes the patch and opens the PR, built in weeks instead of months by a single engineer.[](https://claude.com/blog/claude-managed-agents)
*   [Asana](https://claude.com/blog/claude-managed-agents) built AI Teammates that pick up tasks inside projects, and[Atlassian](https://claude.com/blog/claude-managed-agents) put developer agents into Jira workflows.

## **Getting started with Claude Managed Agents**

We built Managed Agents to make it as easy as possible to spin up agents through Claude Code and the Claude Developer Console at [platform.claude.com](http://platform.claude.com/). The Console’s quickstart, for example, lets you start from an agent template or describe an agent in plain language, then turn it into a production-ready agent you can secure and deploy in minutes.

![Image 7](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298e9b866a4402a3c9bb5d_image5.png)

_The agent quickstart at platform.claude.com: start from a template or describe what you want to build._

![Image 8](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298ebdff6d26839e052c63_image9.png)

_A few steps later: the agent is created, the environment is configured, and a session is live. The console streams the run as it happens._

In Claude Code, the [/claude-api skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill)is provided by default and provides Claude with detailed, up-to-date reference material for building applications on Claude Managed Agents. We highly recommend that you utilize it for the best practices on setting up your Managed Agents application. Get started by running /claude-api managed-agents-onboard for an interview-driven walkthrough for setting up a new Managed Agent from scratch.

![Image 9](https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a298ef3765ce453971174cd_image6.png)

## **The future of building managed agents**

As teams share what they’re building with Managed Agents, we see that the time they used to spend on production infrastructure now goes to what differentiates their agents: managing context and tailoring the experience to users. Now, when a new model comes out, you update your agent to use it, rerun your evals, and ship the improvement without touching the architecture underneath.

We’re excited to see what you build.

[**_Get started_**](https://platform.claude.com/docs/en/managed-agents/overview)**_with Claude Managed Agents._**

_This article was written by Gagan Bhat and Isabella He, Members of Technical Staff on Anthropic’s Applied AI team. They'd like to thank Hema Thanki, Jess Yan, and Molly Vorwerck for their contributions._