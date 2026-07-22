sha256: 4907bd08b017b2ad7b197ae918d2595d6c1f4d2e114aa44fa090494e0cb4b286
---
title: "We Ran 250 AI Agent Evals to Find Out if Skills Beat Docs. The Answer Is More Complicated Than We Expected"
source_url: "https://www.wix.engineering/post/we-ran-250-ai-agent-evals-to-find-out-if-skills-beat-docs-the-answer-is-more-complicated-than-we-ex"
ingested: "2026-06-29"
type: article
tags: [newsletter]
---

# We Ran 250 AI Agent Evals to Find Out if Skills Beat Docs. The Answer Is More Complicated Than We Expected


Published Time: 2026-05-06T11:16:26.529Z

Markdown Content:
![Image 1: AI Agent Evals](https://static.wixstatic.com/media/66bc35_7e7403c5811146e9b58b1a4688ed667b~mv2.jpg/v1/fill/w_740,h_493,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/66bc35_7e7403c5811146e9b58b1a4688ed667b~mv2.jpg)

The industry has a new obsession: AI skills.

The logic seems bulletproof: if you want an AI agent to use your platform, you shouldn’t just give it raw documentation. You should give it a "skill", a curated, condensed, and optimized guide. This will allow the agent to perform tasks on your platform better than if they have to trawl through your docs. Skills are intuitive and trendy, but do they really provide agents with an edge over just using the docs and, if so, in what cases?

At Wix, we decided to **question the hype and start measuring**. We ran 250 controlled evaluations comparing how AI agents perform tasks using standard docs, AI-optimized docs, and purpose-built skills. The results were surprising and they challenged our entire strategy for the AI-native developer experience.

As it turns out, a slightly stale skill isn’t just inefficient, it’s a liability. Here’s why your documentation might actually be a better "skill" than the ones you’re manually writing.

## The Problem We Were Trying to Solve

At Wix, the tech writers team writes and maintains developer documentation. This includes API references, guides, tutorials, and anything else an external developer needs to build apps on the Wix platform. Increasingly, the audience for our docs is shifting from human developers to AI agents. To handle this shift, our team took on responsibility for making sure our docs actually work for agents, not just humans.

Around the same time, we started seeing skills appear. Teams throughout the company began writing skills, teaching agents how to do specific developer tasks. These skills contained a mix of information extracted from docs, combined with curated instructions and information for guiding agents. All the skills were maintained independently, without coordination with the documentation they were derived from.

The concern was obvious to us: the moment the underlying product changes, a scaffold updates, an API gets a new required field, a method is deprecated, any skill derived from stale docs drifts.

But beyond the maintenance problem, there was a deeper question nobody was asking: are skills actually better? The assumption was that they are. They're purpose-built for the task, condensed, optimized. But the assumption was unexamined. And we were watching a parallel documentation layer grow outside our control, on the basis of that assumption.

We wanted **evidence**.

## Methodology

We designed a quantitative evaluation across two task families, 250 runs total:

*   **CLI extensions:**Building [Wix CLI](https://dev.wix.com/docs/wix-cli)app extensions: dashboard pages, backend APIs, site widgets, event handlers, embedded scripts, modals, and plugins. These tasks ran against the skills that come packaged with Wix CLI projects.

*   **REST APIs:**REST API scripting: querying products, creating content, managing contacts, multi-step workflows. These tasks ran against the skills that come packaged with the [Wix MCP](https://dev.wix.com/docs/sdk/articles/use-the-wix-mcp/about-the-wix-mcp).

For each task, we ran sandboxed AI agents with different access to the docs. Each condition ran 3 times per task to account for variance:

*   **Baseline:**The agent used our docs portal’s [llms.txt service](https://dev.wix.com/docs/llms.txt)via web-fetch.

*   **Optimized:**The agent used the docs, but with targeted improvements we made after analyzing agent failures. The improvements were surgical: adding a missing method call to an API code sample, fixing field name inconsistencies, adding a dependency install step that agents kept missing. We set up a system that allowed us to substitute the improved docs when the agent requested them via web-fetch.

*   **Curated content**: The agent only has access to either the skills or the Wix MCP + its packaged skills.

For each run, after the agent completed its development work, we asked it to change hats and evaluate its own work. Did it complete the task as described? If not, why? What issues with the product and docs caused problems along the way? We also collected deterministic data on token count, turn count, and wall-clock time for each run.

## What We Found

### 1 - Docs can and should be optimized for agent use

For CLI tasks, docs optimization alone improved completion from 67% to 87%, while cutting average token usage by 35% and wall-clock time by 9%.

This was a clear result. Agent-optimized docs with a navigable structure, consistent field names, and explicit dependency requirements, are a high ROI intervention available to a platform docs team. Before you write a single skill, get your docs right.

### 2 - Small mistakes in skills erode their advantage

For CLI tasks, docs-optimized runs achieved 85% completion vs 78% for skills-only runs, using 10% fewer tokens, running 8% faster, and requiring 14% fewer turns.

The reason comes down to a pattern we saw across multiple tasks: small mistakes in skills wipe out their speed advantage entirely. We saw a few different types of examples:

*   **Misaligned project scaffolding:**In one case, the skill instructed agents to build a certain widget using a popular React-based library. The CLI project scaffolding set up the project to use a proprietary Wix solution for the widget. The agent following the skill built the React version, hit the mismatch, and rebuilt from scratch. This burned 94% more tokens than the docs-optimized run.

*   **Errors in code snippets:**The code snippets in one skill were missing an export declaration. This small mistake meant the code wouldn’t build. The agent tried multiple export patterns until one worked, resulting in a 39% token increase over the docs runs.

*   **Best-practice bloat:**One skill included best practice guidelines that involved writing a significantly larger amount of code. Implementing the guidelines resulted in 52% more token usage. This likely made the resulting app better, but many users may not want the extra functionality.

There were also specific tasks where the skills-only runs were the clear winners. These were cases where the skills were properly aligned with both the underlying product and the CLI scaffolding. In these cases, we saw a 30-50% reduction in tokens and a 30% reduction in time compared to the docs runs.

The conclusion: well-defined and accurate skills provide agents with a clear benefit over searching the docs, but misalignments and mistakes in the skills can completely erode this benefit.

### 3 - Optimizing for token usage can increase wall-clock time

The API tasks told a different story. Docs-optimized and skill-based runs achieved identical 80% completion. Neither had a meaningful edge on task success. But the efficiency picture was split: docs-optimized ran 31% faster with 33% fewer turns, while skills used 29% fewer tokens.

The reason skills are slower despite using fewer tokens is MCP tool fragmentation. A single web-fetch call for an API returns a full markdown page including method description, request/response schema, parameters, and code examples in one round-trip. The MCP fragments the same information across multiple sequential calls. More calls, more LLM inference latency, more turns, even though each call returns a smaller payload.

For multi-step workflows, skills did save significant tokens by providing condensed guidance that avoided reading multiple large reference pages. But the tradeoff for saving on tokens was an increase in wall-clock time.

### 4 - Skills can make agents less curious

One of the more unexpected findings: when an agent is given official guidelines in a skill for how to do a task, it follows them closely. Because of this, the agent is less likely to improvise or look around for a simpler solution when it hits an edge case. Several docs-optimized agents found more straightforward routes to task completion precisely because they weren't anchored to a prescribed approach. The skill's authority became a constraint.

This impacts how to think about the utility of a skill. A skill optimizes for a specific use case. But it can narrow the solution space in ways that hurt performance on tasks that don't perfectly match the skill's assumptions.

## A Framework for Docs and Skills

Coming out of this study, we have a cleaner mental model for how skills and docs should relate.

**Agent-optimized docs are the backbone.**An agent should be able to use your docs to accomplish any conceivable task with your platform. The docs need to be structured for machine consumption: clear llms.txt entry points, consistent naming, explicit dependency and setup requirements. This is the foundation of an AI-optimized platform.

**Skills are a caching layer.**They exist to make common, well-defined tasks faster and cheaper. Think of them as distilled shortcuts for the cases you care about most, derived from the docs, not independent of them.

**Regular evaluations maintain skill freshness.**Evaluations should compare skill performance against docs-optimized performance for a range of tasks. Any time a skill underperforms the docs, it's a signal that something drifted or was wrong to begin with. Automated evaluations can catch discrepancies as they appear.

In the Wix tech writers team, we’re using this framework to guide us as we work to optimize our platform for agent use and incorporate skills into our offerings.

## Conclusion

AI agents are becoming the primary audience for developer documentation. Any platform that wants to remain competitive must ensure that agents can use it effectively.

At the same time, just because the industry hypes up a new format like skills, this doesn’t guarantee its effectiveness. It’s important to take a step back and take a data-driven approach. Our research project shows that old-fashioned docs are still a critical component of an agent-optimized platform.

![Image 2: Adam Friedmann](https://static.wixstatic.com/media/66bc35_9724217bbe84412682768f6903a28ecb~mv2.png/v1/fill/w_315,h_345,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/66bc35_9724217bbe84412682768f6903a28ecb~mv2.png)

This post was written by **Adam Friedmann**
