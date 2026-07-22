---
source: newsletter
source_url: https://blog.kilo.ai/p/you-cant-afford-to-lead-agentic-engineering
tags: [llm, evaluation]
ingested: 2026-05-22
sha256: 82c132a20ab2
review_value: 7
review_confidence: 6
review_stars: 4
review_recommendation: strong
---

# You can’t afford to lead agentic engineering from the sidelines


Published Time: 2026-05-21T08:02:07+00:00

Markdown Content:
[![Image 1](https://substackcdn.com/image/fetch/$s_!oMdn!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F28efc932-9e46-4fd2-a86b-55827be3610d_1672x941.jpeg)](https://substackcdn.com/image/fetch/$s_!oMdn!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F28efc932-9e46-4fd2-a86b-55827be3610d_1672x941.jpeg)

Late in 2025, leadership had made the call: the company was going all in on AI.

The CTO’s vision was straightforward. Engineers would define the work in tickets. Agents would implement it overnight. Engineers would return in the morning to review the output and get the code over the finish line. This was the reality facing an engineering manager I was mentoring at another company. That conversation stuck with me.

It sounded clean in the way plans sound clean before they touch a real codebase, but I felt an immediate resistance to the idea. Not because it was uniquely absurd. By then, this kind of thinking was becoming increasingly common. As the AI hype intensified, many executives felt pressure to show a return, cut costs, or simply prove they were not falling behind.

What unsettled me was that my own experience told me this wouldn’t work.

I had spent much of 2025 in my previous role as Director of Engineering leading the effort to experiment with and adopt AI-assisted engineering. I had seen where these tools helped, where they failed, and how much extra judgment they demanded from team members.

From that vantage point, the CTO’s plan did not just seem technically naive. It seemed like a good way to turn engineers into ticket writers and cleanup crew. That kind of rollout can demoralize a team before they have a chance to learn.

To be clear, the CTO was right to take AI seriously. The shift to agentic engineering is more than another tooling update. The mistake was assuming you can design the operating model before you understand what the work feels like from the engineer’s side.

That is the gap I keep coming back to: **leaders are asking engineers to change how they build software before they have felt the change themselves.**

As an engineering leader I am supposed to get out of the weeds. That is part of the job. You lead through systems, managers, planning, metrics, and organizational design. But when the weeds themselves start changing, distance becomes a liability.

For me the answer was to get my hands back on the work. Not to take over delivery. Not to relive my IC days. But to understand what this change actually demands from the people living through it. A secondhand understanding was not going to be enough.

Many organizations are moving quickly from “AI matters” to “we need an AI operating model.” The urgency is understandable. The mistake is pretending the model is already obvious.

The conversation has moved fast: from broad AI skepticism, to one-prompt vibe coding demos, to coding agents, new harnesses, Ralph-loops, spec-heavy workflows, test-first agent patterns, and whatever practice gets treated as the answer next week. Some of these ideas help. Some help a lot in the right context. But none of them have come close to removing the need for human judgment in software engineering.

That is what I mean by agentic engineering: not handing the work to a model and hoping it figures things out, but [using agents as part of the engineering process](https://blog.kilo.ai/p/inside-kilo-speed-the-engineer-who) while the engineer still owns the outcome. The engineer defines the problem, sets the constraints, steers the work, reviews the result, and decides whether it is actually good enough to ship.

That shift is real. It is also not settled.

A workflow that works for a greenfield internal tool may fall apart in a mature distributed system. A team with clear ownership, trusted tests, and fast feedback can move faster with agents. A team with ambiguous product direction and brittle verification loops may only create confusion faster. That is why you cannot import an “agentic engineering” playbook and expect it to survive contact with your organization.

This is where secondhand understanding becomes dangerous. From a distance, it is easy to build overconfident plans around demos, vendor claims, and isolated success stories. Up close, the work is messier. Agents can move quickly and still miss the point. They can produce plausible code that [shifts the hardest judgment back onto the engineer](https://blog.kilo.ai/p/cowboy-coder-is-back-this-time-they), and they can make a weak idea look more real than it deserves to be.

Software engineering was never only about writing code. Half the work is figuring out what should exist in the first place. Agents do not make that disappear. If anything, they make bad judgment cheaper to execute.

You start seeing half-baked prototypes and vibe-coded solutions move through the organization faster than the organization can decide whether they are valuable. The burden then lands on engineering to sort out what is useful, what is salvageable, and what should never have been built. Just because something can now be produced quickly does not mean the team has gained leverage. Sometimes it has only gained churn.

AI exposes the bottlenecks your team was already working around. If [code review](https://blog.kilo.ai/p/introducing-code-reviews) was barely holding together before, generating more code makes that pain harder to ignore. If CI/CD was slow or unreliable, faster implementation just means more waiting for confidence. If product direction is vague, agents help you create expensive noise faster. And if decisions are gatekept by a few people, the compression AI offers stays out of reach.

This is also where the old handoffs between Product, Design, and Engineering start to creak. If engineers are going to direct agents, they cannot behave like ticket-takers. They need [enough product context](https://blog.kilo.ai/p/our-engineers-own-a-number) to challenge weak assumptions and notice when an implementation is technically plausible but strategically wrong. That means pulling engineers earlier into the problem framing, not just the solution review. They need to understand the goal, the non-goals, the constraints, the tradeoffs, and what would make the work wrong even if the code functions.

At the same time, leaders have to understand the emotional reality of the team. Many engineers are curious and even excited by these tools. But skepticism is not always obstruction. Sometimes it is a rational response to the way AI adoption gets sold: too glibly, too confidently, and often by people who have not had to land the output in a real production codebase.

Some of the most honest conversations I had with engineers over the last year were not about prompts or workflows. They were about fear. Fear of becoming irrelevant. Fear of watching a hard-earned craft get devalued. Fear of being told to produce dramatically more while the standards they care about become harder to defend.

**Leaders cannot give engineers certainty the industry itself does not have yet.** But they can decide whether people get to work through that uncertainty honestly. If people cannot talk openly about what is not working, they will still notice it. They will just stop telling you.

That is why leadership credibility matters so much right now. Teams do not need leaders who have memorized the latest AI talking points. They need leaders close enough to the work to know where the leverage is real, where the workflow gets awkward, where the fear is coming from, and where the organization is not ready yet.

This is the part you cannot pick up from a deck. You need enough hands-on time to feel where the workflow gets awkward, where the agent becomes slippery, and where the review burden quietly shifts back onto the engineer. You cannot rely only on past experience when the way engineers plan, implement, and review code is changing.

You have to roll up your sleeves and get sucked in. Give an agent a real piece of work, not a toy demo. Watch it move fast, miss context, invent confidence, and leave you with the uncomfortable job of deciding whether the output is good or merely plausible. There is a specific kind of humility that comes from watching a tool produce 800 lines of code while quietly misunderstanding the problem.

Spend enough time with these tools and you will eventually find yourself swearing at an LLM in all caps. That frustration is not incidental. It is part of the experience leaders need to understand.

The point is not to take delivery back. It is to stop leading from theory.

For engineers to trust you through this change, they need to believe that you understand more than the executive summary. They need to hear you speak authentically about the scars: the false starts, the cognitive load, the workflows that seemed elegant until they met a real codebase, and the moments where the tools genuinely changed what felt possible.

Articles, conference talks, podcasts, and vendor demos can inform you. They cannot substitute for time with the tools, or for the trust you need when asking a team to change how it works.

That proximity also matters upward. If someone above you expects overnight productivity miracles, firsthand experience gives you something sturdier than vibes to push back with. You can explain what is real, what is hype, where to invest, and where the organization is not ready yet.

Teams do not need leaders with certainty right now. They need leaders with context. They need leaders whose optimism has been tested by contact with the work.

With this much uncertainty, the worst move is pretending you have already found the process. The better move is to build an organization that can learn faster than the tools change.

That does not mean letting everyone wander off in private. One of the easiest ways to waste this moment is to have ten engineers independently discover the same lesson, struggle with the same broken workflow, or find the same useful pattern without anyone else benefiting from it.

**The goal is not early standardization. It is shared learning.**

Create deliberate places for engineers to compare notes: what worked, what failed, what looked promising until it touched the codebase, what saved time, what created more review burden than it was worth. Make the practical details visible. Which model worked for which kind of task? Which harness fits which workflow? Which agent-generated code looked plausible but was painful to land?

This matters more with AI because the feedback loops are compressed. A bad assumption can turn into a prototype in an afternoon. A vague ticket can become hundreds of lines of code. A weak product idea can look more convincing simply because someone generated a working demo.

**Without fast, shared learning, the organization does not just duplicate effort. It duplicates mistakes.**

So give people low-risk places to experiment, but make the learning part of the work. Use smaller projects, internal tools, or bounded product areas where the blast radius is manageable. Then [bring the lessons back into the team](https://blog.kilo.ai/p/one-companys-blueprint-for-taking) through demos, write-ups, office hours, shared channels, or lightweight internal playbooks. Not as commandments. As evidence.

Share what works, but do not turn it into policy too quickly. The weird differences matter right now. One model may fit one kind of work better. One coding harness may suit one engineer better. One workflow may work beautifully in a clean service and fall apart in a legacy system with weak tests. Treat that variation as signal before you standardize it away.

Right now, I would rather be in an organization that learns quickly than one that standardizes too soon. Premature optimization gives the comforting appearance of control. But you will not design the right process in a strategy session. You and your teams will discover much of it by trying, failing, comparing notes, and slowly turning repeated lessons into practice.

If you lead engineers, stop outsourcing your understanding of this shift.

Read the articles. Listen to the talks. Stay close to what practitioners are discovering. Then ship something.

The best thing I did as a leader was spend enough time with the tools to become harder to fool. Not cynical. Just less impressed by the demo version of the story. I could see where the leverage was real, where the workflow got awkward, and where the review burden quietly returned to the engineer. It gave me better questions for the team, better language for pushing back on unrealistic expectations, and more empathy for the frustration engineers were feeling. I became less certain in the abstract, but more useful in practice.

So let the work correct your assumptions, because you cannot afford to lead agentic engineering from the sidelines.

