---
title: "Running an AI-native engineering org"
type: article
source_url: https://claude.com/blog/running-an-ai-native-engineering-org
ingested: 2026-06-05
sha256: pending
tags: [article, newsletter]
---

# Running an AI-native engineering org

URL: https://claude.com/blog/running-an-ai-native-engineering-org


Published Time: Jun 03, 2026

Markdown Content:
[Video 4](https://www.youtube.com/watch?v=igO8iyca2_g)

For years, engineering bandwidth was the expensive part of building applications. Every process we used to have around software planning and shipping, first waterfall and then agile, was built around that cost.

I started my career in the early 2000s working on Visual Studio. In those days we shipped software on CD-ROMs with hard manufacturing deadlines. Once we could distribute software online, we began increasing to shipping updates continuously. Now we’re changing the way we work again, this time around the time and people it takes to write software.

On the Claude Code team, writing code, writing tests, and refactoring rarely slows us down anymore. But the bottlenecks didn’t go away when agentic coding took away the actual need to type code. Verification, code review, and security took their place.

We can all generate a lot of code really fast now, but this also brings up new questions: Is this code correct? How is it maintained? And one of the top questions I get from fellow engineering leaders: “How are humans keeping up with how you’re doing code reviews?”

## The processes that quietly stopped working

We all put processes in place for a reason, to close a gap or make something work better. But when that gap no longer exists and those processes become obsolete, they rarely go away on their own. When the Claude Code team began using agentic coding as our default way of working, a lot of our existing processes stopped working. Here are the norms we rewrote, and why.

### Planning: shift roadmaps to just in time

The old norm was to spend a lot more time pre-planning because coding time was expensive. When I first joined the Claude Code team, we wrote a pretty good six month roadmap, and then _because_ of Claude Code, so many things changed that it was out of date by month three.

Engineering speed and throughput is different now, so the way we plan sprints has changed. I call it just-in-time (JIT) planning, almost like JIT compiling: how do you do just the right amount at the right time? Our planning ritual shifted away from design docs toward discussions in PRs or prototypes. The space moves fast so we don’t do a lot of product reviews. Our process now is let's prototype, get a lot of internal users on it, and start acting on their feedback.

### Context gathering: ask Claude, not the author

When engineers wrote code, the first step to getting an answer to most questions was to find the person who wrote the code. Now, since all our PRs are assisted by Claude, "Who made this change?" is no longer sufficient. Our new norm is to go a level deeper: what do you actually need to know? For instance: Are you looking for who caused a regression? An expert to answer a customer question? Or context on a decision? You ask Claude that question, and consider whether Claude can answer it directly, also with more data and context.

On the Claude Code team, no matter what that question is, our process is to also ask “Is there a way to automate it?” For example, having Claude summarize customer feedback channels every morning went from a ritual I did manually with my coffee to something I just have running automatically in the background.

### Code review: trust but verify

We use [Code Review](https://code.claude.com/docs/en/code-review) heavily. Claude handles all the style and linting, PR feedback requests, catching bugs and fixing them before a full commit, and adding tests. Where we still definitely want a human is expertise.

The new norm is human review where it matters: for legal review, I always want my legal partner involved in risk tolerance. For trust boundaries and security-sensitive code, I want the domain experts. Product managers and designers also need to be involved with product sense and taste.

It’s important to continually evaluate, though, because the right balance of trust vs. verify will keep changing as the models improve. What you need humans for today might look different with the next model.

### Team makeup: blurring roles

Claude and AI have reshaped roles across the team. Our PMs code a lot now, which is fun to see. With Claude, you have nontraditional coders now being able to do more engineering, and you have engineers who take on things like content and design, work that were traditionally not on the technical side.

On the Claude Code engineering team, I’ve indexed heavily on two profiles. One is creative builders with product sense: the dreamers who are deeply curious and passionate about shipping products that solve problems. The other one is engineers with deep systems expertise. For example, when I joined the team, I noticed we were missing experts with systems backgrounds and we needed that when building [Claude Code on the Web](https://www.anthropic.com/news/claude-code-on-the-web), to ensure we can run Claude everywhere.

What I index on less, on the other hand, is raw throughput; the models handle that. The more important question is where you still need human expertise, and that’s where I’d focus.

|  | Before | After |
| --- | --- | --- |
| Planning | Six-month product roadmaps. | Just-in-time (JIT) planning: prototype, put internal users on it, and act on their feedback. |
| Context gathering | Find the person who wrote the code and ask them. | Ask Claude first. Then ask whether what you are asking about can be automated. |
| Code review | Humans review everything. | Claude handles style, bugs, and tests. Humans review where domain expertise is important. |
| Team makeup | Fixed roles: engineers write code, PMs plan, designers design. | Roles blur: PMs prototype, engineers take on design and context. Hire for creative builders and deep systems expertise. |

## How we rolled out our new norms

As these norms changed, some aspects were mandated as team principles and others we let small sub-teams (pods) figure out on their own. There is a set of the Claude Code core team principles that are non-negotiable “must dos”:

*   **Relentlessly dogfood your product:** Every Claude Code team member, including cross-functional partners, uses Claude Code (and also Claude Cowork). We’re always thinking of ways to get Claude to help us do our work faster, and more efficiently.
*   **Keep the team flat as possible.** When I joined Claude Code I wanted every manager to start out as an IC first, learn how to be an effective engineer on the team by shipping, and really live through and understand what it’s like to be an engineer at Anthropic. We have one overall team mission on Claude Code and Claude Cowork. Managers support pods of work while keeping the team agile so people can move to where the work is.
*   **Don’t hesitate to kill processes that no longer work:** Finally, we relentlessly question why we do things the way we do. When something doesn’t make sense anymore, team members have explicit permission to question and kill old processes.

Within these few rules, though, each pod has a lot of agency. They have room to adapt how they use Claude to do triage, how they run any planning rituals or standups, and which workflows get “Claudified” first.

## How to know your new processes are sticking

Here are three numbers every engineering leader should start tracking now as they roll out changes.

*   **Onboarding ramp time goes down:** How soon can an engineer, a designer, or a PM start being effective? On our team this is much faster than a year ago, and engineers ship real code now within their first week.
*   **PR cycle time goes down:** This one's interesting to dig into because it might help you identify where your pipeline is struggling to scale. As we’re generating so much more code, sometimes build systems and continuous integration (CI) may struggle to keep up.
*   **Claude-assisted commits going up**: For us, by default, every commit is Claude-assisted. I don't think I've seen a non-Claude-assisted commit in the last four months.

On the third bullet, don't confuse throughput with success. Throughput is one metric, but the real metric is measuring the thing you're trying to solve. With the right alignment, throughput can help you solve problems faster.

## Getting started

If I were to leave you with one thing: **pick your noisiest workflow.** That could be your most expensive workflow, the one you might be dreading, or that your team doesn't look forward to. And ask: is it still serving its purpose? If so, can you automate it?

I was once on a team that had an expensive weekly review, with a large number of people in a meeting room. I noticed everybody was on their laptops except when it was their time to give a status report. They would pop their head up, say the status, and go back down to their laptops. I asked one simple question: “Why are we having this meeting again? It seems like an expensive use of our time.” And just that one question made everyone realize it wasn’t needed. So we canceled it.

So, ask yourself: what's one piece of your engineering workflow that you might consider automating or even dropping altogether?

‍

