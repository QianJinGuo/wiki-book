---
title: Building for the Rising Complexity of Agentic Systems with Extreme Co-Design
created: 2026-05-08
updated: 2026-05-08
source_url: https://developer.nvidia.com/blog/building-for-the-rising-complexity-of-agentic-systems-with-extreme-co-design/
ingested: 2026-05-08
sha256: bfdfd585317771bd1ed3228a95512315ea272736c53d6b4e59683151f52f004f
type: raw
tags: [nvidia, agent-architecture, inference, harness-engineering, token-economics]
review_value: 8
review_confidence: 7
---
# Building for the Rising Complexity of Agentic Systems with Extreme Co-Design
> NVIDIA Technical Blog | May 05, 2026 | Eduardo Alvarez, Benjamin Klieger, Graham Steele
Generative AI first chapter was defined by humans sending requests and models responding. The agentic chapter is different. Agents call tools, spawn sub-agents, retain information in memory, manage their own context window, and decide when they are finished. This pushes token consumption, context length, and latency into extremely demanding regions.
## Transition from Chatbots to Agents
### Three AI Interaction Patterns (Ranked by Complexity)
1. **Standard Chatbot** — Linear: one user message, one model response, repeat.
2. **Chat with Tools** — Bounded, variable: tool outputs add unpredictability to input sequence.
3. **Agentic (Chained, High Entropy)** — Structurally probabilistic: models decide tool count, order, and when to stop.
**Key insight:** Tool calling shifts workload from "linearly predictable with probabilistic spikes" to "structurally probabilistic."
## Agentic Architecture Characteristics
### Standard Agent/Sub-Agent Architecture
- **Primary Agent:** Responsible for entire task end-to-end, orchestrates sub-agents, smartest model.
- **Sub-Agents:** Handle narrower tasks, self-manage context windows, can run on smaller models.
- **File System Statefulness:** Agents write memory/tool output to files, later search or re-read.
- **Summarization/Compaction:** Context window compressed to make space and reduce costs.
### Real Trace: Claude Code Coding Session (33 minutes)
- 58 main-agent turns coordinating 225 sub-agent invocations across 283 requests
- Context window: 15K tokens → peak 156K → compaction → ~20K
- Primary agent averages ~85K tokens across first 40 turns
- Accumulates ~3.5M processed input tokens before adding another million post-compaction
### Prompt Caching Impact
- At 95% cache hit rate: input processing cost drops by ~85%
- Coding agents: 95-98% cache hit rates
- Without prompt caching: ~6x higher cost
- Prompt caching = systems problem, not just API feature
### Core Performance Challenge
Agentic workloads need high interactivity (low latency) — but this fundamentally kills throughput. No single processor can solve all demands simultaneously. Solution: a platform where each bottleneck maps to specialized hardware, orchestrated as a unified system.
## Key Cross-Links
- → [[concepts/harness-engineering-framework|Harness Engineering 框架]] — context management layer hardware support
- → [[entities/claude-code-source-deep-dive-warrior|Claude Code 源码核心机制]] — real trace data alignment
- → [[concepts/managed-agents-architecture|Managed Agents 脑手分离架构]] — primary/sub-agent context independence