---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-frontier-teams-are-reinventing-ai-native-development
ingested: 2026-06-11
sha256: d71d5bcb4b756f41f60a56f56aa584ef1e2211545d4a3c8b98efe93c955d3731
feed_name: AWS China ML
source_published: 2026-06-11
---

# How frontier teams are reinventing AI-native development

_Frontier teams are not just using AI to code faster. They’re redesigning how software gets built. The result is 4.5x productivity gains, in some cases more than 10x._

Six engineers. Seventy-six days. A project scoped for 30 developers over 12 to 18 months, delivered within a quarter. That is not hypothetical. It’s what happened when an Amazon Bedrock team stopped treating AI as a coding shortcut and started treating it as the foundation of how they work. The team shipped more production code in five months than in the previous ten years.

The gap between teams like this and everyone else is widening fast. AI coding agents have fundamentally changed the rate at which software gets written, but not the rate at which it reaches customers. Commits are surging, and CI/CD pipelines are busier than ever. Yet, features shipped to production have not kept the same pace. The bottleneck is not the agent’s ability to generate output. It is the agent’s access to the knowledge it needs to make good decisions, and the team’s willingness to restructure work around that reality.

We call the teams that have figured this out “frontier teams.” They are not confined to elite labs. They exist across industries and company sizes, and they share a common discipline: they treat AI adoption as an engineering investment, not a tool rollout. Any engineering team can become a frontier team; we can show you how to get there.

## **Three paths to AI-native development at Amazon**

AI-native software development treats AI as the foundation of how software is built, with increasingly capable agents directed by human experts. How teams direct those agents determines outcomes. At Amazon, the primary drivers for AI in development were to reduce the time developers spent on non-coding tasks such as documentation, coordination, and operations, retire technical debt, and minimize coding inconsistencies across thousands of small “two-pizza” teams of developers. We have been experimenting across hundreds of engineering teams and have identified at least three paths: a pathfinder initiative with experts tackling a challenge, a structured sprint to execute on a well-defined plan, and an in-situ experiment splitting teams in half between existing approaches and AI-adapted workflows. The paths differ in structure but converge on the same insight.

The **pathfinder initiative** was a controlled experiment. Six senior engineers received a single mandate: rebuild the Amazon Bedrock inference engine, a project originally estimated at 30 developers working 12 to 18 months. Rather than adding headcount, the team spent its first weeks redesigning workflows around AI, shifting from discrete tasks to goal-driven outcomes, running multiple agents in parallel, and setting up systems for AI to work independently during off-hours. The project was delivered in 76 days. Individual developer productivity increased approximately 20x as measured by normalized commit velocity (the number of commits per developer per week, adjusted for repository complexity and team size). Commits went from 2 per week to 40. The team shipped more high-quality code in five months than it did on projects over the previous ten years, as measured by lines deployed to production.

The **structured sprint** took a different approach. The Prime Video Financial Systems team ran a 10-day experiment inspired by the pathfinder model. Six engineers, one room, zero context switching, no on-call duties, no other projects, limited meetings. A senior engineer spent three weeks beforehand breaking complexity into well-scoped tasks with detailed requirements. The team used spec-driven development for complex feature work and direct agent-assisted development for tasks where requirements were already clear. Over 10 days, they produced 556 commits against a baseline of 96 and reduced a 90-week project estimate to 24 weeks. That translates to nearly 6x throughput and 4x acceleration. They attributed the AI-enabled gain to three factors multiplying together: acceleration of low-judgment work (1.5x), higher focus on high-judgment work with no context-switching (1.5x), and instant access to agent-captured domain expertise (1.5x). Remove any one factor and the gains collapse. The team is now looking to optimize these three factors in normal operations using detailed product specs that encapsulate domain knowledge and autonomous agents that free up focus time.

In the **in-situ experiment** , of the 50-plus teams studied, the 25 teams that implemented both new tools and new practices outperformed those that simply added AI to existing workflows. Amazon Stores ran structured pilots with typical development teams working against their regular backlogs, using [Kiro](<https://kiro.dev>) and purpose-built AI tools with no special conditions and no handpicked engineers. The median productivity gain was 4.5x, with some teams reaching more than 10x improvement in normalized deployment velocity (features deployed per sprint, normalized against historical baselines). Perfect Order Experience now ships features in an afternoon instead of two weeks. WW Grocery cut design document creation from five days to a few hours.

Different paths, same lesson. The workflow matters, not just the tool.

## **Five steps to becoming a frontier team**

Across all three paths, the highest-performing teams share five practices with a common logic. Reduce the barriers to context for the agent and increase the surface area of work it can do independently.

This is where frontier teams diverge from prior habits. The historical approach optimized for the speed of individual code generation. Frontier teams optimize for something different: the rate at which correct, production-ready software reaches customers. That distinction drives every practice below.

  1. **Invest in agent context.** The most advanced teams invest heavily in making projects and knowledge easier for agents to consume through agent steering files and guidance on team conventions, coding standards, testing, and codebase navigation. The Bedrock infrastructure team placed all code and documentation into a monorepo and kept the inline commentary that AI agents generated, treating it as persistent memory. Teams that skip this step wonder why their agents keep making the same mistakes.** **
  2. **Slow down to speed up.** The above-mentioned practice takes time and requires teams to be patient. Every high-performing team reported that things initially slowed down as they learned the models. They encoded cross-functional expertise into reusable steering docs for agents, restructured repositories so LLMs could reason over them, and added comments and re-architected code splits for AI consumption. The teams that pushed through that learning curve and defined the expected outcomes first experienced compounding acceleration. The teams that expected immediate gains without changing their workflows were disappointed. Expect the first two weeks to feel slower. Expect the weeks after to feel dramatically faster. The teams that quit in week two never see the compounding.
  3. **Feed agents instead of babysitting them.** Frontier teams maintain a steady backlog of well-scoped tasks with clear outcomes, running multiple agents in parallel and reviewing output asynchronously. Builders report finishing major features in short bursts, with work advancing even when they are not actively waiting for the agent to complete a task. One principal engineer shipped a complete change with only ‘a couple of hours of contiguous time’ because the agent worked while the engineer moved between code reviews, operational support, and meetings.
  4. **Make intent explicit before code gets written.** Whether through structured specifications, detailed requirements documents, or well-scoped task decomposition, frontier teams ensure agents have clear context about what ‘done’ looks like before they start generating code. Some teams using this approach report handwriting only 1–2% of their code while pushing significantly more commits per person per week than before.
  5. **“Shift testing left.”**  Frontier teams build tooling so agents can run all integration tests locally and self-correct before code ever reaches the pipeline. The Prime Video team invested in automated guardrails, component tests, performance tests, and formatters that caught issues early. Code reviews shifted focus to interface definitions and architectural decisions rather than code style and naming conventions.



## **What technology leaders can do today**

Not every team achieves these results. Teams that skip the context-building phase, treat AI as a drop-in replacement, or expect immediate gains without restructuring how they work consistently underperform. Developers across the industry have adopted AI coding tools. Not all of them are seeing production gains. They are not using the wrong tools. They’re using the right tools inside the wrong workflows.

The key takeaways are:

  1. Change how you work to make AI work at its best.
  2. Three factors multiply to deliver outcomes: AI handling low-judgment work x uninterrupted focus on high-judgment work x instant access to domain expertise.
  3. Pilot first, then scale.



The practical starting point is not a broad rollout. It is a deliberate pilot. Start with a small team willing to spend the first weeks building agent context (steering files, spec templates, monorepos) before writing production code. Give the team a mandate to restructure workflows. Measure commit velocity, deployment frequency, and time-to-resolution, along with developer satisfaction scores. Then use what they learn to build the playbook for the rest of the organization.

The teams achieving 4.5x to more than 10x productivity gains have not just adopted better technology. They’ve figured out how to work differently with it. That decision is available to every engineering organization today. Of course, code commit velocity is only part of the story. We want to help with all aspects of the software development lifecycle, whether that is streamlining release management, operations, and security operations, or tackling EOL upgrades and the countless undifferentiated tasks that come with software engineering. Stay tuned for the next blog, where I will walk through how we are approaching these.

[**Learn more about frontier teams >**](<https://kiro.dev/topics/frontier-teams/>)

Tune in to [AWS Summit New York City](<https://aws.amazon.com/events/summits/new-york/>) for more on AI-native development.  
 

* * *

### About the author

**Swami Sivasubramanian**  is Vice President for Agentic AI at Amazon Web Services (AWS). At AWS, Swami has led the development and growth of leading AI services like Amazon DynamoDB, Amazon SageMaker, Amazon Bedrock, and Amazon Q. His team’s mission is to provide the scale, flexibility, and value that customers and partners require to innovate using agentic AI with confidence and build agents that are not only powerful and efficient, but also trustworthy and responsible. Swami also served from May 2022 through May 2025 as a member of the National Artificial Intelligence Advisory Committee, which was tasked with advising the President of the United States and the National AI Initiative Office on topics related to the National AI Initiative.
