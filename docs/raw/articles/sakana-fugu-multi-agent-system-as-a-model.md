---
source_url: https://sakana.ai/fugu/
sha256: c99be4a6abb58d57b92a3f678d0cb10bec4d3211541051e9cdbfb0ebaa0776e8
ingested: 2026-07-09
review:
  value: 8
  confidence: 7
  stars: 4
  reason: Provides a detailed technical overview of a novel multi-agent system with dynamic orchestration, backed by ICLR papers and comprehensive benchmarks, though it reads as a product announcement rather than a critical analysis.
---

# Sakana Fugu — Multi-Agent System as a Model

Sakana Fugu — "One Model to Command Them All".
Frontier-level performance without single-vendor dependency. Fugu dynamically orchestrates the world's best models to tackle complex, multi-step tasks.

Architecture: Instead of using domain knowledge to prescribe team organization, roles, or workflows, Fugu learns to dynamically assemble agents from a pool and coordinate them through non-obvious but highly efficient collaboration patterns.

Technical Foundations (two ICLR 2026 papers):
1. TRINITY: An Evolved LLM Coordinator — lightweight evolved coordinator to orchestrate multiple LLMs, assigning Thinker, Worker, or Verifier roles
2. The Conductor: Learning to Orchestrate Agents in Natural Language — trained with RL to discover natural-language coordination strategies

Two tiers:
- Fugu: balanced performance and latency
- Fugu Ultra: optimized for performance (deeper pool of expert agents)

Available on: OpenRouter, Vercel, opencode, Creao, Merge

Benchmark results:
Benchmark | Fugu | Fugu Ultra | Opus 4.8 | Gemini 3.1 Pro | GPT 5.5
SWE Bench Pro | 59.0 | 73.7 | 69.2 | 54.2 | 58.6
TerminalBench 2.1 | 80.2 | 82.1 | 74.6 | 70.3 | 78.2
LiveCodeBench | 92.9 | 93.2 | 87.8 | 88.5 | 85.3
LiveCodeBench Pro | 87.8 | 90.8 | 84.8 | 82.9 | 88.4
Humanity's Last Exam | 47.2 | 50.0 | 49.8 | 44.4 | 41.4
CharXiv Reasoning | 85.1 | 86.6 | 84.2 | 83.3 | 84.1
GPQA-D | 95.5 | 95.5 | 92.0 | 94.3 | 93.6
SciCode | 60.1 | 58.7 | 53.5 | 58.9 | 56.1
Long Context Reasoning | 74.7 | 73.3 | 67.7 | 72.7 | 74.3
MRCRv2 | 86.6 | 93.6 | 87.9 | 84.9 | 94.8

Pricing (Fugu Ultra): $5/M input, $30/M output, $0.50/M cached input (higher rates above 272K context)
