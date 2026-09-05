---
title: "Appendix C References"
---

# Appendix C References

Citations in this book come in two kinds: **in-vault notes** (entity/concept/comparison/query pages of the Hermes Wiki knowledge base at ~/wiki, which themselves cite original external sources) and **public sources** (papers, official blogs, public reports). Convention: for data marked "via in-vault notes," the original source cited by the note is the final authority. In-vault paths are searchable in Hermes Wiki.

## C1 Core in-vault notes, by theme

**Harness engineering**

- `entities/harness-engineering` — the paradigm's main entity: Agent = Model + Harness; three generations; six-layer; seven anti-patterns; 5 artifacts/3 camps/5 consensus principles; decay and Build to Delete; the sovereignty line; Can.ac and $9/$200 data; eight source threads including Alibaba Cloud's multi-agent practice and Ruo Fei's new context rules
- `concepts/harness-engineering-framework` — the framework page: six-layer structure, five context tiers, Generator-Evaluator, compaction vs reset
- `topics/agent-harness-deep-dive-qa` — the L1–L5 architecture, tool-layer mapping matrix, loop six primitives, the production system, open problems
- `queries/harness-minimum-checklist` — MVH sides A/B, tool token accounts, bottleneck trio, shelf-life table, migration checklist
- `concepts/when-not-to-harness-engineering` — the opposing four boundary conditions, four questions, the NomShub escape chain
- `comparisons/model-capability-vs-harness-engineering` — the adversarial page, layered temporality verdict, three testable predictions
- Context-vs-Harness diagnostic table (in `entities/harness-engineering`, source 6)

**Loop engineering**

- `moc/loop-engineering` — the topic map: ten core theses, the five-stage cycle, Loop≠Cron, cost structure
- `entities/loop-engineering-feedback-control-system` — the main entity: closed-loop four, six components, single vs fleet, Samuel McDonnell's critique, the Bun case, control-theory mapping
- `comparisons/prompt-engineering-vs-context-engineering`, `comparisons/vibe-coding-vs-agentic-engineering` — paradigm contrasts

**Graph engineering**

- `entities/langgraph-state-machine-under-the-hood` — the triad, reducers, compile, fan-out/fan-in, stream
- `comparisons/orchestrator-worker-vs-dag-agent`, `comparisons/single-agent-vs-multi-agent` — topologies and migration criteria
- `topics/multi-agent-systems` — collaboration pattern spectrum, JSONL inboxes, summary return, Pass@k/Pass^k

**Memory and context**

- `topics/agent-memory-systems` — memory types, four modeled objects, three-way retrieval, lifecycle governance
- `queries/why-agent-poc-fails-production` — six failure categories, ten-item list, the 81% review-overhead data, Tencent's knowledge tiers

**Paradigm and history**

- `drafts/karpathy-2026-vibe-to-agentic-engineering` — a cross-cut of 184 notes: vibe→agentic evolution, L1–L6, animals vs ghosts, industry echo
- `entities/vibe-coding-god-object-7months-failure`, `entities/tencent-vibe-coding-to-agentic-engineering-backend` — the crash post-mortem and the team's retrospective

## C2 Public sources

**Papers**

- Vaswani et al., *Attention Is All You Need*. NeurIPS 2017. arXiv:1706.03762
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*. ICLR 2023. arXiv:2210.03629
- Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. NeurIPS 2022. arXiv:2201.11903
- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning*. 2023. arXiv:2303.11366
- Liu et al., *Lost in the Middle: How Language Models Use Long Contexts*. TACL 2024. arXiv:2307.03172
- Stanford / UC Berkeley / NVIDIA, *LLM-as-a-Verifier*. 2026 (Terminal-Bench 2.0 data; via `drafts/karpathy-2026-vibe-to-agentic-engineering`)
- METR, *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity*. 2025

**Engineering blogs and official documents**

- Anthropic, *Effective Harnesses for Long-Running Agents*. 2025-11
- Anthropic, *When AI builds itself*. 2026-06
- Anthropic, MCP (Model Context Protocol) announcement and documentation. From 2024-11
- OpenAI (Ryan Lopopolo), *Harness engineering: leveraging Codex in an agent-first world*. 2026-02
- Mitchell Hashimoto, *My AI Adoption Journey*. 2026-02
- Ben Thompson, *Agents Over Bubbles*. Stratechery. 2026-03
- Stripe Engineering (Alistair Gray), *Minions: Stripe's one-shot, end-to-end coding agents*. 2026-02
- LangChain (Vivek Trivedy), *Improving Deep Agents with harness engineering*. 2026-02
- Birgitta Böckeler (martinfowler.com), *Harness Engineering*. 2026-02
- Can.ac, *I Improved 15 LLMs at Coding in One Afternoon. Only the Harness Changed.* 2026-02
- GitHub Blog, *How to write a great AGENTS.md: lessons from over 2,500 repositories*
- Addy Osmani, *Loop Engineering* (the six-primitive framework). 2026
- Google, A2A (Agent2Agent Protocol). 2025-04 (later donated to the Linux Foundation)
- LangGraph official documentation (StateGraph / Reducer / Checkpointer)
- LinearB annual engineering-efficiency report (AI PR rejection rates). 2025

## C3 Citation and currency statement

1. Every quantitative claim in this book is sourced at its point of use. Different sources may report different numbers for the same phenomenon (measurement differences); where they do, this book prefers the value explicitly recorded in the cited in-vault note and says so.
2. Harness/Loop/Graph evolve quickly: tool capabilities and data are current as of mid-2026. The book is revised continuously alongside the knowledge base's daily check & eval process.
3. On contested questions (model capability vs harness engineering), both sides' evidence and the verdict framework are presented (Ch 2, Ch 13); the book does not conclude by allegiance.
4. Found an error? Open an issue in this repository; corrections ship in the next edition and are annotated in the affected chapters.
