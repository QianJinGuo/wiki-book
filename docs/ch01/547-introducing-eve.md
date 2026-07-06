# Introducing eve

## Ch01.547 Introducing eve

> 📊 Level ⭐⭐ | 7.9KB | `entities/introducing-eve.md`

# Introducing eve

## Overview

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

## [Link to heading](http://vercel.com/blog/intro

## 深度分析

**"Agents have a shape"是框架设计的核心哲学**：Vercel 的关键洞察在于，所有 agent 无论任务差异，都共享相同的结构需求——持久执行、沙箱计算、人工审批、子 agent、eval。eve 将这些共性抽象为框架原语，而不是让每个团队重复造轮子。这与 Next.js 对 Web 开发的抽象逻辑完全一致：识别出足够多人用同一种困难方式构建相同东西的模式，然后将其标准化。

**"Agent is a directory"的文件即架构设计**：eve 的 agent 目录结构（agent.ts + instructions.md + tools/ + skills/ + subagents/ + channels/ + schedules/）将 agent 的所有维度映射为文件系统结构。这种设计的深层价值在于**可读性**——任何工程师看到目录树就能理解 agent 的能力边界，无需阅读代码。这是"约定优于配置"原则在 agent 框架中的最佳实践。

**"Production already built in"的工程护城河**：eve 的差异化不在于更好的 prompt 模板或更灵活的 tool 注册，而在于将生产级能力（持久执行、沙箱、审批流）作为框架原语内置。这意味着开发者不需要在 agent 原型验证后再花数周时间添加生产化能力——它们从第一天就在那里。这是 Vercel 对"agent 原型到生产"鸿沟的直接回应。

**与 Claude Code 的对比启示**：eve 的 "directory-as-agent" 范式与 Claude Code 的 "CLAUDE.md + tools" 范式代表了两种不同的 agent 架构哲学——eve 强调结构化目录约定，Claude Code 强调单文件入口 + 工具发现。前者更适合多 agent 编排场景，后者更适合单 agent 深度任务。

## 实践启示

1. **用目录结构定义 agent 能力边界**：不要把 agent 的所有配置塞进一个文件——用 eve 的目录范式将 instructions、tools、skills、subagents 分离到独立文件中。这提高了可读性、可测试性和团队协作效率。

2. **评估 agent 框架时，优先检查"生产原语"内置程度**：持久执行（durable execution）、沙箱计算（sandboxed compute）、人工审批（human-in-the-loop）这三个能力是否框架原语，决定了 agent 从原型到生产需要多少额外工程投入。

3. **用 instructions.md 定义 agent 的"人格"**：eve 的 instructions.md 模式（系统提示词作为独立文件）比在代码中硬编码 system prompt 更灵活。建议为每个 agent 维护一个 instructions.md，定义其角色、规则和行为边界。

4. **子 agent 作为目录而非配置**：eve 将 subagents 作为目录（每个子 agent 是一个完整的 agent 目录）的设计，使得子 agent 可以独立开发、测试和版本控制。这比在父 agent 配置中内联子 agent 定义更可维护。

5. **关注 Vercel 的 agent 生态演进**：eve 作为 Vercel 的 agent 框架，与 Next.js、AI Gateway、v0 形成完整的 agent 开发-部署-运行生态。如果你在 Vercel 生态内构建 agent，eve 应该是首选框架。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-eve.md)

---

