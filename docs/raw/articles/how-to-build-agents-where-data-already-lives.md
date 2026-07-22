sha256: b072b5b7e8984634137149aa649451b0deb754c267a7da71a2cd10116dffccba
---
source: rss
source_url: https://blog.crewai.com/how-to-build-agents-where-data-already-lives
ingested: 2026-06-30
feed_name: CrewAI Blog
source_published: 2026-06-08
---

# How to build Agents Where Data Already Lives

Agents are valuable for many reasons, but by now I think we can all agree on one thing: there is a growing disconnect between how easy it has become to build agents and how few high-ROI production agents enterprises are actually shipping. 

The tools keep getting better and we keep hearing about building getting commoditize, but the rate at which companies are getting durable business value from agents has not improved at nearly the same pace.

I said something related at Snowflake Dev Day last week, as we announced a deeper integration between CrewAI and Snowflake: 

> Autonomy requires trust,   
> Trust requires control,  
> Control kills autonomy.  
> That is, when it is applied in the wrong layer. 

It is the cleanest way I know to describe one of the hard parts about enterprise agents.

Companies need agent building throughput that does not break the rules the business runs on, and real work lives inside permissions, data boundaries, review paths, procurement rules, audit logs, and business systems that were never designed for agentic systems. The enterprise agent bottleneck has moved from use cases and models to building throughput under governance.

DocuSign is one of the strongest examples of what it looks like when a company gets this right, they built an operating loop across CrewAI, Snowflake, Salesforce, and internal systems, where the agent work sat inside the business process instead of pretending the process did not exist. Today we work with DocuSign on use cases across the world, supporting functions well beyond GTM, which is exactly the expansion pattern companies should want from agent infrastructure.

## **The problem every enterprise is hitting**

Companies have 20, 100, sometimes 800 agent use cases identified (I heard that 800 number last week from a potential customer who is now a paying customer). Their AI team can realistically deliver maybe 10 this year and only a handful of people can maintain these systems, everyone else in the company waits.

The bottleneck is not ideas, and it is not model intelligence either. The bottleneck is throughput: getting agents built, deployed, and scaled inside complex operations without making ten engineers the permanent owners of every workflow.

A big component of useful agents is actually data, and**data has a lot of gravity.** Enterprise data does not want to move. It sits in data lakes, SaaS applications, Snowflake, Salesforce, and internal systems with access policies that exist for good reasons. When agent workflows pull that context across too many boundaries, governance breaks, and when agents stay trapped inside one system, they usually cannot reach far enough to do useful work.

So teams get stuck between two bad options: stay somewhat governed and narrow, or go broad and create a governance mess. **Neither gets you high-impact production agents at scale.**

Companies need agents that can act across the business without escaping the boundaries the business already trusts, they also need more people building those agents and not just the AI team.

## **Governed orchestration**

I have been using the phrase governed orchestration to describe the pattern I see working in production. It means agents coordinate work across systems while the platform carries governance from the first design decision.

That, and a bunch more, has to move left.

Agent builders need to know which data they can touch, which models they can use, which tools they can call, what needs human review, and what happens when something fails. The builder experience needs to guide people toward governed choices, and the runtime needs to enforce those choices when nobody is watching. When both of those work together, you get a path where more of the enterprise can actually build agents without the platform losing control.

**Snowflake has become a great governed data foundation in this stack.** It is where a lot of enterprise context already lives, and it has the permission model those companies trust.

**CrewAI is the build and runtime layer.** It is where teams create the agent workflows, run them, observe them, and turn reusable patterns into something more people inside the company can use.

Together, the goal is not _" agents connected to a database"_ That framing is too small. The goal is multi-agent systems that can be built by many and act at scale without breaking governance.

## **Snowflake and a governed data layer**

Snowflake's Summit theme was "Making AI Real for Business." That is the same fight we are in at CrewAI.

AI becomes real for business when it can operate inside the constraints of the business: trusted data, enforced permissions, approved model access, and audit trails leaders can defend.

Snowflake matters here because it already owns the permissions, lineage, and access model around data many enterprises trust. Cortex Agents coordinate access to structured and unstructured data through Cortex Analyst and Cortex Search, and **CrewAI now integrates with both.**

The point is not to keep everything inside Snowflake, enterprises do not work that way, but we do all know that sensitive enterprise context should not be copied into unmanaged infrastructure just because an agent needs it, and model access should not turn into every team managing separate keys, separate vendors, and separate approval paths.

Governed data is load-bearing in production AI, but data and models do not produce business outcomes on their own. They have to enter a workflow that crosses systems, calls tools, handles failures, and knows when to stop.

**That is where CrewAI fits.**

## **CrewAI: The build and runtime layer**

CrewAI turns data and models into controlled agent workflows. CrewAI Open Source framework (Flows) and Harness (Crews) has been the go to for over 65% of Fortune 500 company and now many of them are joining CrewAI AMP as how enterprises federate agent building while keeping central runtime control.

We think about the build and runtime problem in layers because each layer fails differently in production.

The platform layer sets the controls: permissions, model access, data boundaries, secrets, telemetry, FinOps. Teams plug in Snowflake, connect MCP servers, and let engineering define the rules of the road. The runtime layer keeps workflows alive after the demo: scale, human review, execution limits, observability, retries, and the ugly edge cases that show up at 2 a.m. The build layer is where more people create agents. I care about this because every enterprise has more agent demand than its AI team can satisfy.

We have had over two billion agentic workflow executions run through CrewAI. One lesson from that volume is boring but important: the gap between a working demo and a production workflow is almost never the model. It is state management, recovery, validation, handoffs, and knowing which parts of the process should be deterministic.

This is why we built CrewAI as both a builder surface and a runtime control plane. Studio is the builder surface, a domain expert can start with agents, tasks, integrations, and reusable building blocks, while an engineer can go deep with Flows, Crews, tools, memory, and execution patterns in the same environment. AMP is the control plane: policy, deployment, observability, model access, permissions, and operational controls.

The mistake in a lot of agent architecture is treating agency as the center of the system. In production, agency is something you place carefully inside a deterministic process.

Flows matter here because they provide the deterministic backbone: sequencing, state, branching, retries, escalation, and the boundary between what the agent decides and what the process controls. Reusable agent repositories, tool repositories, and skills repositories keep teams from rebuilding the same thing in ten places. Engineering defines the controls, and domain experts build inside them.

This is the shift I keep coming back to: turn your builders into enablers. Instead of asking engineers to build every workflow, have them build the flywheels, things like integrations, platform controls, reusable components, guardrails, and then the people closest to the business process can build agents inside those boundaries.

That is how you go from 10 agent workflows a year to agents running across the company. Over time, the agents become entangled with the business. Each cycle of execution, measurement, and refinement makes the workflow more embedded in how the company operates. After a while, the agent is not a side project, it is part of the operating system.

## **Two integrations, one architecture**

We already have hundreds of thousands of agents running on CrewAI that use Snowflake. This deeper integration makes that path cleaner, and it touches tools, data, and models.

CrewAI agents can connect with Snowflake's managed MCP server and Cortex solutions. Snowflake-governed capabilities become tools inside a CrewAI workflow: Cortex Analyst for structured data, Cortex Search for unstructured data, Cortex Agents for Snowflake-native reasoning, SQL execution, and custom tools. Snowflake roles and policies stay intact, and the agent uses Snowflake context without pulling data into an unmanaged path.

CrewAI can also use Snowflake as a governed model access path. Customers bring their own Snowflake credentials and use Cortex model access to reach major model families and open models from the same governed environment where their data already lives.

Governed paths for tools and models. CrewAI composes those into workflows that run across the business

## **DocuSign: what production agents actually look like**

I promised a customer story. This is the one.

At a CrewAI event, DocuSign walked through the architecture behind their customer outreach system. Their teams needed to identify target accounts from usage data, contract context, and internal criteria; research across Snowflake, Salesforce, internal systems, PDFs, web sources, customer stories, industry material, and a vector database; personalize outreach for each account; validate it; route it through manual review and delivery; then measure and refine the next cycle.

CrewAI Flows coordinated the work. An Identifier Agent decided which customers fit the criteria. A Researcher Agent gathered web and internal context. A Composer Agent wrote the message using the research and business context together. A Validator Agent checked quality, hallucination risk, and personalization thresholds. If something fell below the bar, the workflow stopped it before it moved forward. If it passed, the workflow routed outputs to internal systems, mail delivery, observability, Slack, and human review.

Better email metrics mattered, but the architectural proof mattered more. The system moved from one-off rep prep to a repeatable operating loop that survived A/B testing, expanded beyond the first use case, and reused the same agent architecture instead of starting over. The direction was clear: faster turnaround, better personalization, higher engagement, and better conversion.

## **Making AI real for business**

The agentic enterprise will be composed. Models, data platforms, orchestration, human review, and business systems all have to work together without pretending the other layers do not exist.

This is why the Snowflake integration matters to me. CrewAI agents can connect directly with Snowflake's Cortex solutions and managed MCP server, and teams can route model access through Snowflake's governed perimeter. Studio, AMP, open source Flows, and Crews now meet a governed data layer many enterprises already trust.

I do not think enterprise agents are won by the team that ships the most demos. They are won by the teams that let more builders create useful agents while the platform enforces the rules when nobody is watching. The real answer is governed orchestration: more people building inside boundaries the business can trust.

That is the work now.
