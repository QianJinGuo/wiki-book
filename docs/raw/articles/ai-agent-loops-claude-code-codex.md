---
title: "🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead"
source_url: "https://www.lennysnewsletter.com/p/how-i-ai-how-to-write-ai-agent-loops"
ingested: "2026-06-23"
sha256: "06fef9a05fe98a76"
created: 2026-06-23
updated: 2026-06-23
type: article
tags: [agent, claude-code, codex, harness, loop]
---

# 🎙️ How I AI: How to write AI agent loops in Claude Code and Codex + How Claude Mythos found a 15-year-old bug in Mozilla Firefox | Brian Grinstead


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

4.   **Your agent can have its own agents. This is where loops get truly powerful.** The PR-review loop Claire built in Claude Code doesn’t just check PR status; it spins off dedicated subagents to babysit individual PRs until all merge checks are green. The skills loop in Codex identifies gaps and immediately spawns subagents to validate each new skill using a goal loop.

5.   **Loops get expensive if you don’t write them carefully.** If the success criteria is vague or the validation threshold is too thin, the agent will keep running and keep charging without meaningful progress. Monitor both cost and output quality from day one.

6.   **The morning briefing in Claude Cowork is a perfect loop starter.** A scheduled task that fires every morning, checks your calendar and email, and sends a summary to Slack is already a fully functional loop. No code required. From there, scaling up to PR reviews or skills identification in Claude Code or Codex is a natural next step.

7.   **The power move is loops that generate their own subagent loops.** In the Codex demo, Claire’s weekly automation spawned two named subagents that each ran their own goal loops to validate skills in real time. The ceiling on loop-based automation is basically “how well can you define the job?” not “how complex is the engineering?”

[Video 6](https://www.youtube.com/watch?v=Idjt53tTv2U)

[![Image 3](https://substackcdn.com/image/fetch/$s_!7lYV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ad75402-a7c6-49f9-a482-9333373fde5e_1600x114.png)](https://substackcdn.com/image/fetch/$s_!7lYV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ad75402-a7c6-49f9-a482-9333373fde5e_1600x114.png)

> **Brought to you by:**
> 
> 
> *   **[WorkOS](https://workos.com/?utm_source=lennys_howiai&utm_medium=podcast&utm_campaign=q22025)**—Make your app enterprise-ready today
> 
> *   **[Metaview](https://www.metaview.ai/home/how-i-ai)**—The agentic recruiting platform for winning teams

**Brian Grinstead**, distinguished engineer at Mozilla, breaks down how his team used AI agents to ship 423 Firefox security fixes in one month. He explains why the real unlock wasn’t just a better model, but the custom harness around it: scoring files, running goal loops, verifying bugs with subagents, and keeping humans in the review process. It’s a tactical look at how to point agents at a massive codebase and get fixes you can actually ship.

1.   **The Firefox security bug spike wasn’t just about the model; it was the harness too.**While everyone focused on Mythos, the real story is that Firefox built a custom harness that gives AI agents the right tools to find, verify, and fix bugs. Brian says this is simpler than it looks: “It’s actually a reasonably simple wrapper around it. You just need to give it access to the right tools for the job.”

2.   **Agents are relentless in a way humans can’t be.**Agents will try 14, 15, 20 different approaches to trigger a bug without getting tired or losing focus. Brian found bugs that required the agent to try 14 times before succeeding. As Brian notes, “Cognitive energy declines over time in a way that agents don’t.”

3.   **The verification loop is what eliminates false positives.**Firefox uses a two-stage verification process: first, the agent must trigger an actual crash in their fuzzing build (a crystal-clear signal), and second, a verifier subagent checks that the bug report makes sense and doesn’t involve test-only configurations. By the time a bug reaches human engineers, there are almost no false positives.

4.   **Agents get laser-focused on the specific task and miss the bigger pictu**re. When the patching agent fixed a bug, it would often patch just the one vulnerable location. Human engineers would then look at the fix and say, “This is right, but we should also check three other similar places in the codebase.”

5.   **Prioritization is essential when you have millions of lines of code.** Firefox built a simple LLM judge that scores each file on two dimensions: likelihood of a memory safety issue, and ease of access from a webpage. Brian says this is “very, very simple” and anyone can replicate it.

6.   **The harness can be built in an afternoon using vendor SDKs.**Firefox started with Claude’s agent SDK, which is essentially a wrapper around Claude Code CLI that streams JSON and provides programmatic hooks. Brian’s advice: use the vendor-provided harnesses (Claude agent SDK, OpenAI agent SDK) rather than third-party frameworks, because the models are likely post-trained to work best with their own infrastructure.

7.   **You should run multiple models and harnesses for security work.** Because attackers will use whatever model and technique finds bugs, defenders need to scan with multiple approaches. Different models and harnesses spike on different strengths and will identify different vulnerabilities.

8.   **This approach works for more than security—performance, tech debt, and UX are all viable targets.** The same pattern applies: score and prioritize areas of your codebase, give the agent a constrained goal with verifica
