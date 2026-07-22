sha256: 7baa2d080369f65e73b07d0ca3b443619aeaebe2714757a880b5be471d370599
---
title: "Bring it to our shop: Workday's pitch for keeping AI agents close to your most valuable data"
source_url: "https://thenewstack.io/workday-ai-inference-guardrails/"
ingested: 2026-06-30
type: article
created: 2026-06-30
---

# Workday: Guardrails belong in the inference engine

Workday, the payroll and HR data platform, has been pursuing AI and agents for a while, but while other businesses may allow a little room for error, getting a payroll run in Workday 99% right is not exactly good enough.

Gabe Monroy, Workday's chief technology officer, tells The New Stack that enterprise AI has to clear this bar before anyone will let it near their HR and finance data. "There aren't many systems that are more critical - or less forgiving - than ones that are dealing with people and money," he says. There's no tolerance for "well, it works most of the time."

At its DevCon developer conference in early June, Workday laid out its plans to clear this correctness bar. The company introduced Agent-Ready Tools, a set of connectors that let agents act across the platform over the Model Context Protocol (MCP), a Developer Agent that lets people build apps and agents on Workday in plain language, and Agent Passport, which tests and verifies agents before they go into production and keeps monitoring them after, with Cisco as the first attestation partner.

Guardrails belong in the inference engine: Monroy spent most of his career in infrastructure and the developer space: at Deis, Microsoft, DigitalOcean, and, most recently, Google. At Google, he focused on building infrastructure for large AI labs to run inference at scale. For someone so focused on infrastructure, coming to Workday might seem like an odd move, but Monroy argues that, at this point, LLM safety is - or at least should be - part of the core infrastructure for enterprises.

"The stakes are higher in the world of Workday and in the world of people and money, and that's something that I was really excited about tackling at Workday specifically - and I do look at it as a core infrastructure," he says. "A lot of what I've been doing in my recent past has been building infrastructure for large AI labs to do inferencing at scale, and what you pick up pretty quickly is that inferencing is probabilistic."

"Inferencing involves prefill and decode, and a whole bunch of really technical machinery in place to stream tokens out to end users, but what is nowhere in that stack today is the concept of native LLM-level enforced guardrails - guardrails that are part of the core inference."

Workday's approach: bring it to our shop - keep AI agents close to your most valuable data rather than letting them operate outside the security boundary.