# Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue

> 📊 Level ⭐⭐⭐ | 13.6KB

> **来源**: [Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue](https://blog.cloudflare.com/agents-platform-flue-sdk/)

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

## 深度分析

### 三层栈的分工边界：框架、harness 与平台各管什么

文章给出生产级 AI 的三层栈：框架（Flue）负责项目结构、约定、集成、CLI 与开发者体验；harness（Pi、Project Think）负责 agentic loop——调工具、读结果、管理上下文、持续推进直到任务完成；runtime/平台（Cloudflare Agents SDK）提供 compute、state、storage 原语。 关键论断是：中断恢复、不可信代码执行、工具使用这三类问题 harness 无法独立解决，因为它们绑定在 state、storage 和 compute 上，取决于 agent 所运行的平台。 这解释了 Cloudflare 为何把 Project Think 的生产加固经验下沉到 Agents SDK 作为底座，供任意 harness 与框架复用——Flue（Astro 团队的开源框架，构建于 Pi 之上）是第一个吃螃蟹者。 这一分工与 wiki 的 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 视角一致：循环工程在中间层，平台原语是它的承重墙。

### 声明式上下文定义替代编排脚本

Flue 的方法论差异在于：不脚本化 agent 做什么，而是描述 agent 知道什么——定义模型、skills、沙箱与指令，由 agent 自主解决任务，无需手写编排循环。 量化样例是：一个拦截 bug 报告、在沙箱中复现并诊断问题的 triage agent 在 25 行以内完成。 开发体验上它把 agent 放进用户已在的地方：Slack/GitHub/Linear/Discord 的预配置 Channels 免掉事件验证与分发样板，`@flue/react` 提供把 agent 状态、工具执行与消息流式接入前端的 hooks，`flue add channel slack` 则生成可供编码 agent 消化的 Markdown 蓝图。

### Durable Streams 与 Fiber 检查点：把 agent turn 当分布式事务

agent turn 不是单次请求——模型流式输出、调工具、等结果、可能等人工审批或委派 subagent，过程随时可被打断，内存态（流连接、pending 工具调用、turn 进度）随之丢失，对话历史虽在磁盘，用户却只看到永不停止的 spinner。 Flue 在应用层的答案是 Durable Streams：把每个 prompt、工具响应、模型选择写入 append-only 不可变日志，agent 状态永不 volatile，进程死亡后另一个进程从精确步骤继续。 平台层对应 Agents SDK 的 fiber 原语：`runFiber()` 在 turn 开始前把进度记入 Durable Object 的 SQLite，`stash()` 随推进做检查点，`onFiberRecovered()` 在新实例启动时交付最后检查点，由 harness 决定全量重建（Project Think 修复 turn 状态的模式）还是部分重放。 这正是长时任务"优雅恢复、不丢上下文、不浪费 token"的平台解法，与 [Long Running Agent Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/long-running-agent-architecture.md) 相互印证。

### 平台原语替代工具堆栈：Code Mode、虚拟文件系统与动态工作流

工具表面增长会劣化模型选择——列表越长、上下文越满，模型越难选对工具；更好的模式是给模型一个"执行代码"的工具，让模型写 TypeScript 调用所需 API。 落地成本靠轻量隔离解决：Code Mode 为每段代码创建一次性 Dynamic Worker，isolate 启动 <10ms、$0.002/次，远低于每次冷启动容器。 文件系统同理：agent turn 中多数文件操作是文本（读文件、grep、写补丁），不需要完整 Linux 启动，`@cloudflare/shell` 在 Durable Object 内用 SQLite 提供持久虚拟文件系统与类型化文件操作（read/write/edit/search/grep/diff），仅当需要 npm install、git、编译器时才升级到容器。 多步编排交给 Dynamic Workflows：agent 运行时生成工作流脚本，引擎逐步持久化、重试失败、可休眠数小时或等待人工审批，`runWorkflow()` 触发后 agent 睡眠、经 RPC 回调汇报进度。 凭据问题用 bindings 收口：AI Gateway、Browser Run、Email Service、Agent Memory、AI Search 等能力经绑定注入，密钥永不进入 agent 生成代码——沙箱与凭据治理在平台层一次解决，呼应 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 的隔离原语。

## 实践启示

1. 选型顺序应是"平台原语 → harness → 框架"：中断恢复、沙箱、持久文件系统绑定在 state/storage/compute 上，harness 独立解决不了；先确认底座有 durable execution，再谈上层框架。

2. 用声明式上下文定义（模型/skills/沙箱/指令）替代手写编排循环：Flue 的 25 行 triage agent 说明样板代码可以被方法论吃掉，工程精力应转向上下文质量而非循环逻辑。

3. 把执行历史当 append-only 账本：每个 prompt、工具响应、模型选择都进不可变日志，这是进程崩溃后"从精确步骤继续"的前提；volatile 内存态在任何生产环境都应视为随时丢失。

4. 工具列表过长会劣化模型选择，优先给模型一个执行代码的工具而非堆砌细粒度工具；成本靠轻量 isolate（<10ms、$0.002/次）兜底，而非容器冷启动。

5. agent 的文件操作大多是文本操作，不需要完整容器：用 SQLite 支撑的虚拟文件系统承担读/grep/补丁，只在需要 npm install、git、编译器时升级到真容器，可显著压低沙箱成本。

6. 外部能力集成走平台 bindings 而非让 agent 自管 API keys：凭据永不进入 agent 生成代码，把"凭据泄漏"从应用层风险降维成平台层已解问题；需要一致重复的多步管线时，同样交给运行时生成 + 引擎持久化的动态工作流，而非写死在 harness 里。

→ [原文存档](https://blog.cloudflare.com/agents-platform-flue-sdk/)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

