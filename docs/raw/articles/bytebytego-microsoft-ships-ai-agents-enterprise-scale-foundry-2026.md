---
source: newsletter
source_url: https://blog.bytebytego.com/p/how-microsoft-ships-ai-agents-at
ingested: 2026-07-15
sha256: acfa3d32c73ab0fa4134cce6e80605d3aeae6e79e5b28b69153078188040bfc7
tags: [microsoft, foundry, ai-agent, production, harness, enterprise]
title: "How Microsoft Ships AI Agents at Enterprise Scale"
publish_date: 2026-07-13
---

# How Microsoft Ships AI Agents at Enterprise Scale

Microsoft operates at an enormous scale. More than 80,000 enterprises now build on Microsoft Foundry, the company's platform for building, deploying, and running AI agents and applications. Microsoft's own copilots run on the same platform, including Microsoft 365 Copilot, which alone serves over 20 million users and has a monthly active usage of first-party agents growing 6x year-to-date.

To understand what it actually takes to ship agents at that scale, the article interviewed Marco Casalaina, VP of Products for Microsoft Core AI. He walked through what his team has learned from running these systems in production.

## From Chatbot to Agent

The shift from chatbot to agent changes the engineering problem fundamentally. A chatbot returning a wrong answer is a bad experience. An agent taking the wrong action is a business incident. The bar for what's good enough to ship has moved.

Production agents fail for reasons that aren't visible in a prototype. The model is rarely the problem. What breaks is everything around the model: the data the agent retrieves, the tools it calls, the way it handles real users, and the way quality drifts as the world around it changes.

## The Harness Matters as Much as the Model

When asked for the single biggest lesson from running these systems at scale, Casalaina's answer was "the harness matters as much as the model."

The harness is everything around the model: the runtime, the tools, the context retrieval, the identity layer, the guardrails, the evaluators, the deployment pipeline. Models change constantly, and you cannot treat them like database versions. Each model has different properties that the harness has to adjust to.

When Anthropic released Claude Opus 4.8, Microsoft's GitHub Copilot CLI team had to re-tune their harness and re-run their evaluations before they could ship it.

## Key Engineering Ideas

**Retrieval-as-a-subagent**: Rather than treating retrieval as a static RAG pipeline, Foundry treats it as a living subagent that can iterate, re-query, and refine its search based on what it finds.

**Agents with their own identity**: Agents get their own identity and a place to act, providing audit trails and access controls per-agent rather than as a shared system principal.

**Rubric-based evals**: Microsoft evaluates production agents with rubric-based evaluations and an auto-improvement loop. Quality is continuously measured and the agent is automatically re-tuned.

**Voice as frontend**: Foundry's Voice Live lets teams turn an existing text agent into a voice agent without rebuilding it, reflecting the shift beyond the chatbot era.

## Enterprise Agent Engineering Challenges

The article identifies several structural challenges:
- Documents the agent depends on go stale
- Model updates change the agent's behavior subtly
- Without identity controls, there's no audit trail
- Without guardrails, the agent confidently produces wrong outputs
- Without observability, quality degradation is invisible

→ [[raw/articles/bytebytego-microsoft-ships-ai-agents-enterprise-scale-foundry-2026|原文存档]]
