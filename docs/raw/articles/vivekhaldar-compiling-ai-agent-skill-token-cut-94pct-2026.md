---
source_url: https://vivekhaldar.com/articles/compiling-an-ai-agent-skill/
ingested: 2026-07-16
sha256: 9329ee055a7d5c4d26c07c36bbcc30967d819d700e91468a41df9e6d82941615
source: newsletter
---

# How I Cut an AI Agent's Token Use by 94%

How I Cut an AI Agent's Token Use by 94%

 Vivek Haldar 
 
 Archive 
 Ideaverse 
 YouTube 
 Enchiridion Labs 
 RSS 

 AI & LLMs 
 6 minute read 

 How I Cut an AI Agent's Token Use by 94%

 By Vivek Haldar · July 13, 2026 

 (This blog post is derived from this video on my YouTube channel , along with a short follow-up about the incentives involved .)

 I've been writing about specialized agent harnesses and compiling them from task specifications for a while, and I realize the idea can sound abstract. So here's a concrete example from a workflow I run every day.

 I have a skill that looks through my back catalog of blog posts, finds something worth resurfacing, checks whether I've mentioned it recently, and drafts a short LinkedIn post linking back to it. The draft never gets posted automatically. Often I don't post it at all. Sometimes I use it as a nudge and rewrite the whole thing in my own voice. But the workflow is useful: it nudges me to repost existing writing.

 The original version was written entirely as natural-language instructions in an Agent Skill . It described the sources to search, the recent-history checks, the selection criteria, and the shape of the final draft. On every run, my agent (currently Codex) had to interpret those instructions, make a plan, call tools, and keep track of the state of the workflow.

 That was a great way to build the first version. Natural language made the workflow easy to articulate and change. I've written before about these files as natlang code : executable SOPs that let an agent automate work without first turning every judgment into a conventional program.

 But after a skill has run many times, and trodden the same ground repeatedly, often most of its behavior is no longer exploratory.

 The workflow had crystallized

 This skill always looks in the same places. It builds the same content inventory. It applies the same recent-post filters. It saves the same intermediate state. None of that needs to be reasoned through from scratch each morning. A lot of it doesn't even need an LLM!

 There are really only two steps where LLMs are needed:

 Choosing a good candidate from the filtered inventory.

 Writing the LinkedIn draft.

 Everything else can be ordinary deterministic code.

 So I "compiled" the skill into a specialized harness. The new skill is barely a skill at all—it has become a thin bootloader that invokes a Python program. That program fetches the known sources, constructs the inventory, checks recent posts, applies filters, and manages the workflow. It calls an LLM only for selection and generation.

 Not surprisingly, this resulted in massive token usage and latency improvements:

 94% fewer tokens 

 87% lower latency 

 essentially the same output quality in my runs

 I didn't get those gains by swapping in a smaller or cheaper model. The selection and generation steps still use the same model. The savings come from removing all the model calls that were doing work regular code could do more directly.

 A general-purpose coding agent is an extraordinarily capable reasoning and workflow engine. It's also an expensive way to execute a procedure whose shape becomes known after introspecting on a few historical invocations.

 What “compiling” means here

 I had historical traces from running the skill previously (it was running daily as an automation in Codex). Those traces showed what the agent actually did, including the planning, tool calls, branching, and state it needed along the way. I gave those traces, the original skill, and my writing about specialized harnesses to a powerful model. I asked it to identify which steps genuinely required an LLM and which had become stable enough to express as code, then build the specialized harness.

 In other words, the natural-language skill served as a high-level specification, while the traces supplied the operational detail that was the result of reasoning by the model.

 This is why I think the compiler analogy is useful. We begin with a flexible, high-level representation of intent. After the workflow has been exercised enough to reveal its real shape, we lower the stable parts into a more efficient representation.

 The model is still used where necessary. The goal of this whole exercise is differentiating between the workflow parts that can be deterministic code and those that need language understanding, generation or reasoning. We haven't tried to turn language understanding into a pile of brittle rules. Candidate selection depends on what the source says and whether it would make an interesting post. Drafting obviously benefits from language generation. Those remain model calls because they are model-shaped problems.

 Start fluid, then optimize

 Writing the specialized harness from day one would have been premature. I didn't yet know the exact workflow, which rules would matter, or where judgment would be required. The natural-language skill version let me discover those things by running the process repeatedly.

 But keeping the entire workflow in natural language forever would mean paying the model to rediscover the same plan on every run.

 The useful pattern is:

 Express the workflow as a natural-language skill.

 Run it enough times to gather traces and refine the behavior.

 Find the parts that have become stable and deterministic.

 Compile those parts into code.

 Keep LLM calls at the few points where semantic judgment matters.

 There is a one-time cost to this compilation pass. I used a powerful model and a fair amount of context to inspect the traces and produce the new harness. But that cost is paid once. The compiled workflow can then run hundreds or thousands of times, saving tokens and time on every execution. This is standard optimization economics: spend once, amortize over repeated use.

 I've grown to prefer local agents partly because they accumulate exactly this kind of history: skills, traces, state, and the artifacts of prior runs. That history doesn't just help the agent remember. It gives us the raw material for making the harness itself better.

 The long-term economics of agents will depend on this. If every recurring workflow keeps using a frontier model as its planner, state machine, and glue code forever, the cost and latency never really settle down. A specialized harness lets the model concentrate on the small fraction of the workflow that benefits from intelligence.

 Follow the incentives

 There's another reason I don't expect these techniques to come primarily from the big model vendors: their business is selling tokens . Preferably lots of tokens from their most powerful and expensive models.

 There's an old line: it's very hard to convince someone of something when their salary depends on not understanding it. Incentives explain behavior and outcomes. A technique that preserves output quality while cutting token consumption by 94% goes straight against the current economics of a company whose revenue rises with token usage.

 I'm not claiming that nobody inside those companies cares about efficiency. Obviously they do. Better inference, caching, and cheaper models make their products more useful. But there's a difference between making each token cheaper and helping a customer discover that most of their workflow doesn't need tokens at all.

 At least right now, I don't see much incentive for the major vendors to push that second idea hard. So it's up to users and independent builders to find these optimization opportunities ourselves.

 And that's also the opportunity. There's a large open space for founders building specialized harnesses, compilers, and tools that examine recurring agent workflows and move the deterministic parts into code. The value proposition is unusually concrete: keep the output quality, while cutting the cost and latency of producing it.

 The model vendors will keep building more powerful engines. Someone still has to make sure we aren't revving those engines to do simple, deterministic work.

 Use natural language to discover the workflow. Use traces to understand it. Then compile what has crystallized. 

 Want to try it yourself? Grab the full Token Shrinker prompt and drop it into your agent.

 ❦

 ← Older

 Cognitive Debt and the Future of Programming 

 Thanks for reading. — Vivek 
 Set in Fraunces & Newsreader
