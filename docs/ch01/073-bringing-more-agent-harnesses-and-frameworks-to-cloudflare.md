# Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue

## Ch01.073 Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue

> 📊 Level ⭐ | 7.2KB | `entities/agents-platform-flue-sdk.md`

# Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue

> **来源**: [Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue](https://blog.cloudflare.com/agents-platform-flue-sdk/)

Published Time: 2026-06-17T19:35+00:00

Markdown Content:
2026-06-17

8 min read

This post is also available in [日本語](https://blog.cloudflare.com/ja-jp/agents-platform-flue-sdk) and [한국어](https://blog.cloudflare.com/ko-kr/agents-platform-flue-sdk).

![Image 1](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/2Eij5hJzfa11JW9u0oYS9g/65fa2e51cdf045703fef1924d72569a5/BLOG-3336_1.png)

2026 is the year agent harnesses go to production. The software that controls the model’s access to the outside world — harnesses like Codex, Claude Code, OpenCode, Pi, and Project Think — has matured to the point where teams are deploying agents as real, load-bearing infrastructure, not just prototypes.

But building agents that survive production is hard.

We learned this firsthand building [Project Think](https://blog.cloudflare.com/project-think/) as our first-party agent harness. In working with our customers to run agents in production, we found a common set of distributed systems problems that every agent faces when running in the cloud. When an agent is interrupted, how can it automatically and gracefully resume from where it left off, without losing context or wasting tokens? How can agents run untrusted code securely? How can agents use the tools they were trained for?

A harness can’t solve these problems on its own. They’re tied to state, storage and compute — which means they’re dependent on the platform the agent runs on. That’s why we’re taking our learnings from hardening [Project Think](https://blog.cloudflare.com/project-think/) for production and bringing them to the [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/) as a base layer. Durable execution, dynamic code execution, a durable filesystem and dynamic workflows, now available to any harness building on Agents SDK.

At the same time, a new layer has emerged above the harness. Frameworks like [Flue](https://flueframework.com/) wrap a harness with the project structures, conventions, integrations and developer experience that make agents productive to build.

To solve these scaling challenges, there’s a new, three-layer stack that is emerging for building production-grade AI. Here is how the pieces fit together, moving from the user-facing developer experience down to the underlying platform primitives:

*   **The framework (Flue)** — the project structure, the conventions, the integrations, the CLI and the developer experience for building agents.

*   **The harness****(Pi, Project Think)** — the agentic loop that calls tools, reads results, manages context and keeps going until the task is done.

*   **The runtime/platform****(the Cloudflare Agents SDK)** — the compute, state, and storage primitives everything above depends on

The Agents SDK is that bottom layer: it makes primitives like durable execution available to any harness and any framework. Flue, our new open-source framework from the team behind [Astro](https://astro.build/), is the first to build on it. Here’s how.

## Flue

[Flue](https://flueframework.com/) shipped 1.0 Beta this week, built on the [Pi](https://pi.dev/) harness, the same harness that [OpenClaw](https://openclaw.ai/) is built on. What makes it different as an agent framework is the approach: you don’t script what your agent does, you describe what it knows. Define the context an agent needs — its model, skills, sandbox, and instructions — and it solves whatever task you give it, autonomously. There’s no orchestration loop to write.

This declarative model is what makes writing agents easy: here’s a triage agent that intercepts a bug report, reproduces it in a sandbox, and diagnoses the issue in under 25 lines.

![Image 2: BLOG-3336 2](https://cf-assets.www.cloudflare.com/zkvhlag99gkb/5U50mjNZpg7RD3fb0pOLLs/5e20ad63c1e6ab92cf5d334b79996c1a/image5.png)
### The Flue developer experience

Flue’s power comes from the fact that agents don’t live in isolation. They are built to exist where your users already work, and integrate with your preferred tooling:

*   **Anywhere agents**: Drop your agents into Slack, GitHub, Linear, or Discord with pre-configured Channels that handle event verification and dispatch boilerplate automatically.

*   **Headless, but UI-ready**: Agents shouldn’t live in a black box. Flue agents can run completely headlessly for background tasks, but [@flue/react](https://flueframework.com/blog/flue-1-0-beta/#introducing-fluereact) provides native frontend hooks that stream an agent’s state, tool execution, and live messages straight into your frontend application, without you having to build custom real-time plumbing from scratch.

*   **Ecosystem-ready**: Flue makes it easy to add and upgrade integrations with commands like `flue add channel slack`, generating a Markdown blueprint that your own coding agent can read, modify, and cleanly integrate straight into your codebase.

### Designed for production, not just prototypes

Moving an agent out of a local terminal and into a production ecosystem introduces traditional distributed systems failures. Host crashes, API timeouts from LLM providers, and unexpected restarts threaten to erase the short-term memory of a running agent turn.

Flue solves this via Durable Streams.Each event in the execution history is added to an append-only log. By processing every prompt, tool response and model choice as an unchangeable ledger, an agent’s state is never volatile.If a process dies, another simply picks up the log and continues from the exact step it left off.

### Deploy anywhere, including Cloudflare

Flue is a multi-cloud framework. On [Node.js](http://node.js/), each agent runs as a long-lived process. You can deploy it to any VM or container, run it in GitHub Actions, or embed it on an existing server. But when you target Cloudflare, each agent becomes a Durable Object.

By running each Flue agent inside its own Durable Object, Cloudflare can automatically scale to as many agents as you need, each with their own isolated storage a

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agents-platform-flue-sdk.md)

---

