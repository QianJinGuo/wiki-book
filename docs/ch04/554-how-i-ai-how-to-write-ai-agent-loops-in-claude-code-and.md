# 🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead

## Ch04.554 🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead

> 📊 Level ⭐⭐ | 4.2KB | `entities/ai-agent-loops-claude-code-codex.md`

# 🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead

> **来源**: [🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead](https://www.lennysnewsletter.com/p/how-i-ai-how-to-write-ai-agent-loops)

## 概述

Published Time: 2026-06-22T15:02:37+00:00

Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!gWeJ!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F361d81ef-7faf-4d8e-8028-5d5e03432a9a_2329x551.png)](https://substackcdn.com/image/fetch/$s_!gWeJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F361d81ef-7faf-4d8e-8028-5d5e03432a9a_2329x551.png)

[Video 5](https://www.youtube.com/watch?v=JoXbk2fm7jM)

[![Image 2](https://substackcdn.com/image/fetch/$s_!hnh5!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa30d9a22-40aa-4d45-a24b-526a1d2989cc_1600x114.png)](https://substackcdn.com/image/fetch/$s_!hnh5!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa30d9a22-40aa-4d45-a24b-526a1d2989cc_1600x114.png)

> **Brought to you by:**
> 
> 
> *   **[WorkOS](https://workos.com/?utm_source=lennys_howiai&utm_medium=podcast&utm_campaign=q22025)**—Make your app enterprise-ready today
> 
> *   **[Runway](https://runwayml.com/howIAI)**—The creative AI platform for images, video and more

In this hands-on tutorial, Claire explains the difference between heartbeats, crons, hooks, and goal-based loops, then builds real automations in Claude Code and Codex, including a daily PR-review loop and a weekly skills loop that spawns its own subagents. If you’ve heard “loop engineering” and wondered what it actually means, this is the beginner-friendly breakdown.

1.   **A loop is just a prompt that fires itself, nothing more exotic than that.** The reason “loops” sound intimidating is that the hype cycle turned a basic automation concept into something mystical. Heartbeats, crons, and webhooks have been around forever. What’s new is pointing them at an AI agent instead of a batch job.

2.   **Goals are the most powerful loop type, and the one most people get wrong.** A goal loop sets an outcome and runs an agent against it until the outcome is validated or the agent gets stuck. It doesn’t stop on a timer; it stops when the work is actually done. Fuzzy success criteria means the agent loops forever, burning tokens, so my advice is to let Codex write its own goals, using OpenAI’s goal-writing guide as a starting point.

3.   **Think about loops the way you think about onboarding an employee.** Define the job: what they check, how often, what output you want, and who to contact when something’s wrong. “Every Friday at 10 a.m., review all merged PRs and identify skills our agents are missing” is a job description. It’s also a loop prompt.

4.   **Your agent can have its own agents. This is where loops get truly powerful.** The PR-review loop Claire built in Claude Code doesn’t just check PR status; it spins off dedicated subagents to babysit individual PRs until all merge checks are gr

## 原文存档

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-agent-loops-claude-code-codex.md)

---

