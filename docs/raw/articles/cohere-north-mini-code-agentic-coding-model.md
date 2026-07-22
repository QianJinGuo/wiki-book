---
title: "Introducing North Mini Code: Cohere's first model for developers"
source_url: "https://cohere.com/blog/north-mini-code"
source: "cohere"
author: "Cohere Team"
publish_date: "2026-06-09"
ingested: "2026-06-11"
type: article
sha256: "6ad1a033693f4b46608ca31e90fe904524eee2d2d1f528da417f5535b768dd5a"
tags: [cohere, north-mini-code, agentic-coding, open-source, moe, sovereign-ai, apache-2.0, code-model]
source_type: rss
---

# Introducing North Mini Code: Cohere's first model for developers

Small, efficient, and open-source — our first agentic coding model, built for the sovereign developer ecosystem.

**By Cohere Team — Jun09,2026 —3 minute read**

Tags: Product Launch · Company News

Today we're launching North Mini Code open-source. A mixture-of-experts (MoE) model, North Mini Code is Cohere's first agentic coding model, and the inaugural member of our next generation of powerful models.

At30B total parameters with just3B active, North Mini Code delivers strong software development performance without demanding extensive hardware to match. Efficient by design, it's built to run where you need it.

Freely available under an Apache2.0 license, North Mini Code advances Cohere's mission to make sovereign AI a practical reality, giving developers direct access to agentic coding capabilities. We're building in the open, because the future of AI should be shaped by the people running, testing, and improving it.

Download the weights on Hugging Face, or deploy in a dedicated, managed inference environment on Model Vault. Alternatively, try it for free in your harness of choice on OpenCode or with a Cohere API key.

## Snapshot

| Field | Value |
|-------|-------|
| Model | North-Mini-Code-1.0 |
| License | Apache2.0 |
| Model size |30B total;3B active |
| Context length |256K total context;64K max generation |
| Optimized for | Code generation, agentic software engineering, and terminal tasks |
| Availability | Hugging Face (Weights), Cohere API, Cohere Model Vault, OpenRouter |
| Hardware (minimum) |1× H100 @ FP8 |

## Agentic coding capabilities

North Mini Code achieves competitive scores across benchmarks against models of this size class, demonstrating strong performance in real-world software engineering tasks.

North Mini Code's benchmark scores translate to a33.4 on the Artificial Analysis Coding Index, a competitive position among similarly sized models.

## The speed advantage for developer tasks

North Mini Code is designed for speed and efficiency, with a strong focus on minimizing total cost of ownership as we continue to refine and scale the model.

In Cohere's testing, North Mini Code achieved up to **2.8x higher output throughput** than Devstral Small2 under identical concurrency levels and hardware configurations. In practical terms, that translates to nearly three times the work rate, enabling faster iteration while reducing computational overhead.

North Mini Code also demonstrated a **30% advantage in inter-token latency**, a metric that reflects the consistency and pacing of token generation. Time-to-first-token (TTFT) performance was more closely matched between the two models, with Devstral Small2 maintaining a slight edge across the tested conditions.

## Sovereign open models for developers

North Mini Code is Cohere's first open-source model for developers. As coding agents transform software engineering, developers need control and flexibility over their agentic coding infrastructure.

North Mini Code is built for agentic workflows, including:
- Understanding and orchestrating sub-agents
- Mapping systems architecture
- Running code reviews

Deploy on-prem or locally, on your own terms. Community feedback will directly shape the roadmap as Cohere expands the ecosystem toward more open and sovereign developer models.

## Evaluation methodology

Cohere evaluated North Mini Code using:
- **SWE-agent** harness for SWE-Bench Verified and SWE-Bench Pro
- **Simple ReAct harness** with a single terminal-use tool for Terminal Bench v2
- **Terminus-2 harness** for both North Mini Code and competitor models on Terminal Bench Hard

Competitor scores were sourced from publicly reported numbers or the Artificial Analysis Intelligence Index. Where public reports were missing, Cohere ran internally with recommended model configurations.

## Getting started

North Mini Code is available for free on Hugging Face and Model Vault — Cohere's fully managed inference platform. Cohere specifically trained it for compatibility with OpenCode, but it works with most coding agents.
