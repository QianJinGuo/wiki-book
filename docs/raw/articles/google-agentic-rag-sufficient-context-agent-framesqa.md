---
title: "Unlocking dependable responses with Gemini Enterprise Agent Platform's Agentic RAG"
source: "[[raw/articles/google-agentic-rag-sufficient-context-agent-framesqa]]"
source_url: "https://research.google/blog/unlocking-dependable-responses-with-gemini-enterprise-agent-platforms-agentic-rag/"
author: "Google Research / Cloud"
publish_date: 2026-04-27
ingested: 2026-06-08
tags: [article, rss, google-research, agentic-rag, multi-agent, sufficient-context, framesqa, evaluation]
sha256: 84065c77b7f57158172cb8772c28a9ea12cfe78dfc62e622156f26fd4d6ef308
---

# Unlocking dependable responses with Gemini Enterprise Agent Platform's Agentic RAG

> 原文存档：[[raw/articles/google-agentic-rag-sufficient-context-agent-framesqa|原文存档]]

> **Source attribution**: This is a vendor-published technical blog from Google Research announcing a new feature in Google Cloud's Gemini Enterprise Agent Platform. The content includes real engineering (5-agent architecture, Sufficient Context Agent innovation) and benchmark results (FramesQA, 34% accuracy improvement, 90.1% cross-corpus), but readers should note it is promotional framing for a Google Cloud product.

## Single-step RAG 限制

Current single-step [retrieval-augmented generation](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) (RAG) systems weren't designed for multi-source, multi-hop queries. If the query is "What are the specs of the server used in Project X?", the system might find documents about Project X, but those documents might only mention a server ID. It won't know to take that ID and perform a second search in another database to find the specs. The result is a partial answer because information is spread across different "islands" of data.

## Agentic RAG 介绍

**Agentic RAG** plans, reasons, and iteratively interacts with data sources, enabling the handling of complex queries to increase dependability and accuracy.

Google's Gemini Enterprise Agent Platform-hosted version of [Cross-Corpus Retrieval powered by Agentic RAG](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval) employs various agents that work together to reliably answer complex queries. It incorporates [sufficient context](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/) to confirm if there is enough information for an accurate answer. Compared to standard RAG, the framework increases accuracy on factuality datasets by up to 34%.

## Multi-Agent 架构（5 角色）

A "monolithic" RAG system just retrieves matching documents before an LLM generates a response. In a multi-agent framework, the system breaks the job down into specialized roles:

1. **Orchestrator** evaluates the complex request and decides "this isn't a one-step job" and delegates to sub-agents.
2. **Planner Agent** maps out the information pathways. For a project's budget + timeline, the Planner decides: "First check the finance database, then check the project management logs."
3. **Query Rewriter** translates the request into multiple search queries. It turns "What's up with Project X?" into "Status report for Project X Q3" and "Key blockers for Project X team."
4. **Search Fanout Agent** takes refined queries and sends them to various retrieval sources to collect snippets.
5. **LLM Aggregator** combines all the context to deliver a final response.

## 核心创新：Sufficient Context Agent

The key differentiator is **persistence** — the framework knows when it is missing information and continues searching until the context is complete. This prevents the AI from "guessing" when the first search comes up empty.

The **Sufficient Context Agent** acts as a quality-control inspector at the end of the assembly line. It examines three specific findings before allowing a response:

### 1. Retrieved snippets

Evaluates the actual text chunks pulled from the database. In a medical example, these could be the specific paragraphs found in the "Discharge Summary" and "Nutrition Notes."

### 2. Intermediate draft

The system creates a "rough draft" response. The Sufficient Context Agent reviews the prompt, draft, and retrieved snippets to evaluate whether the model has everything needed. If the prompt asks for three things (meds, diet, allergies) but the snippets only contain information about two, it flags "insufficient context."

### 3. Missing pieces analysis

Identifies exactly what is not there. It generates a specific "Reason" and "Feedback" log:
- **Finding**: "We have the medication list and the low-sodium diet instructions."
- **Gap**: "We are missing information about allergic reactions or adverse events during the stay."

It compares what was found against the original request. If it didn't answer the allergy question, it issues "Insufficient Context" and provides specific feedback: "You found meds and diet, but you missed allergies. Go back and search specifically for 'rashes' or 'adverse events'."

## 5-Phase 完整流程

1. **Orchestration** — Root Agent parses request, delegates to sub-agents; Planner Agent identifies distinct areas to check.
2. **Search (standard step)** — RAG Agent searches for all query fanouts at once.
3. **Sufficient Context check (new)** — Quality-control gate before allowing response.
4. **Iteration** — Based on feedback, Query Rewriter creates new searches; RAG Agent dives deeper.
5. **Synthesis** — Sufficient Context Agent confirms data is complete; Synthesis Agent writes clean summary.

## 实验和结果

Evaluation on [FramesQA](https://huggingface.co/datasets/google/frames-benchmark) (based on the [FRAMES](https://arxiv.org/abs/2409.12941) paper) with 824 queries and 2,676 PDF documents.

**Example multi-hop question**: "Of the top two most watched television season finales (as of June 2024), which finale ran the longest in length and by how much?"

Vanilla RAG failure mode: "Despite multiple scans, I found no explicit runtimes for M*A*S*H or Cheers. The documents provide viewership data, but not the duration in minutes or hours."

Agentic RAG success: "The M*A*S*H finale ran for 150 minutes, making it the longest of the top two. It was 52 minutes longer than the Cheers finale, which ran for approximately 98 minutes."

**Setup**:
- Vanilla RAG: Google's [RAG Engine](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview) with advanced retrieval, LLM parser, re-ranker
- Agentic RAG single-corpus: retrieve from FramesQA documents
- Agentic RAG cross-corpus: 3 distracting datasets, Planner Agent determines where to retrieve
- LLM-as-a-judge to compare system responses to ground truth

**Results**:
- Cross-corpus setting: 90.1% accuracy even when Planner Agent must select correct corpus out of 4 possibilities
- Latency: single-corpus and cross-corpus within 3% on average
- Compared to standard RAG: up to 34% accuracy improvement on factuality datasets

## 三个独立贡献

1. **5-Phase Orchestration with Persistence** — Beyond 5-agent role assignment, the key innovation is the Sufficient Context Agent that loops back to the Query Rewriter when context is missing.
2. **3-Check Quality Gate** — The Sufficient Context Agent examines retrieved snippets + intermediate draft + missing pieces analysis before allowing synthesis.
3. **Cross-Corpus Routing at Scale** — 90.1% accuracy when Planner Agent must select from 4 corpuses, with only 3% latency overhead vs single-corpus.

## 局限和注意事项

- **Vendor framing**: Article is promotional for Google Cloud's Gemini Enterprise Agent Platform
- **Specific benchmark**: 34% is on Google's factuality datasets, not standardized benchmarks like BEIR
- **Unverified accuracy claims**: "Up to 34%" leaves ambiguity about the specific dataset
- **Article truncated mid-sentence** at the end of conclusion section
- **Limited to Google Cloud stack** — architecture details specific to Vertex AI / Gemini Enterprise

## 相关资源

- [FramesQA Dataset](https://huggingface.co/datasets/google/frames-benchmark)
- [FRAMES paper](https://arxiv.org/abs/2409.12941)
- [Sufficient Context in RAG](https://research.google/blog/deeper-insights-into-retrieval-augmented-generation-the-role-of-sufficient-context/)
- [Gemini Enterprise Agent Platform](https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform)
- [Cross-Corpus Retrieval docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval)

## 致谢

Joint work with Bo Li, Zhongjie Mao, Tiger Jin, Yuhong Kan, Mohd Abdullah (Obito), Chun-Sung Ferng, Pooneh Mortazavi, Roger (Peng) Yu, Eran Lewis, and Ivan Kuznetsov.
