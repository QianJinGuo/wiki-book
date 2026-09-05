---
title: "Appendix A Glossary"
---

# Appendix A Glossary

Alphabetical order.

**AGENTS.md / CLAUDE.md** — a coding agent's project-level instruction file; "architecture documentation written for the agent." In practice it plays the immune system: one rule added per incident. ~100 lines as a table of contents is best practice.

**Blackboard** — a multi-agent pattern where all sub-agents write intermediate products to a shared workspace and a controller decides at runtime who acts; for tasks whose complexity grows over time with unclear role boundaries.

**Build to Delete** — design every harness component to be removable, with the system still working after removal; run scheduled deletion drills. Without a deletion mechanism, do not start building.

**Closed loop** — a loop with a verifier gate, stop conditions, rollback, and human intervention; opposite of an open loop (scheduled re-runs without feedback).

**Compaction vs Reset** — shorten history within one session (compaction) versus starting a fresh context in a new agent with a file-based handoff (reset). Some models only truly recover with reset.

**Conditional edge** — a graph edge whose target is decided at runtime by a (pure) routing function reading the state; the essence of ReAct.

**Context Rot** — systematic decision-quality decline once irrelevant content dominates the window; rule-of-thumb threshold ~40% fill.

**CP checkpoint** — compress a finished stage into a fixed-format summary (conclusions + key facts + open items) before handing to the next stage; never pass whole conversation histories downstream.

**Ensemble** — run redundant parallel copies of the same task and fuse by vote; trading redundancy for reliability.

**Fail-closed** — when the guardrail rule engine errors, deny by default rather than allow.

**Fan-out / Fan-in** — one node triggers several parallel nodes (fan-out); a merge node waits for all predecessors (fan-in).

**feature_list.json** — the core artifact of Anthropic's long-horizon pattern: a feature list with `passes: false/true` states. JSON over Markdown.

**First Plausible Solution Bias** — the model's attachment to its first passable plan; "looks OK" self-review as a stopping rule. Countermeasure: pre-completion checklists.

**Factory Model** — multiple loops cooperating to produce software: requirements/implementation/review/deployment loops, with deterministic gates passing artifacts between them.

**Generator-Evaluator separation** — the maker and the checker must be different instances; self-evaluation is systematically optimistic. Three evaluator forms: environment verification, deterministic tools, independent model.

**Git checkpoint** — incremental commits as state snapshots; the default rollback mechanism.

**Hook** — an automatic interception on agent lifecycle events (e.g., PostToolUse checks). "Hook > documentation": prose asks; hooks prevent.

**Harness** — the complete control infrastructure around a model: context supply, tools and permissions, state and memory, observability, human governance. Central formula: `Agent = Model + Harness`.

**Harness decay** — after model upgrades, old harness components turn from assets to friction (e.g., removing sprint decomposition after Opus 4.5→4.6 saved 38%).

**JSONL inbox** — a sub-agent communication protocol: one append-only JSONL inbox file per sub-agent; the orchestrator writes tasks; sub-agents poll.

**LLM-as-a-Verifier** — engineering the model-as-judge: finer score granularity, expectation over K repeated verifications, spec/output/error decomposition. Terminal-Bench 2.0: tie rate 27%→0%, accuracy 86.4%.

**Loop Engineering** — building systems that drive agents in autonomous loops rather than writing single prompts. Loop = trigger + decision + verification + budget + state. Hierarchy: Loop > Harness > Context > Prompt.

**L1–L6 task ladder** — autonomy levels by verifiability. L1/L2 fully automatic; L3 sampled; L4 plan approval; L5 per-action human confirmation (money/identity); L6 human-led.

**Markov blanket injection** — inject only context causally relevant to the current decision (contrast: injecting all 143 graph relations doubled false positives).

**MCP (Model Context Protocol)** — Anthropic's model↔tools/data connection protocol (late 2024). Representation cost ~32× a CLI; do the token math before wiring.

**MVH (Minimum Viable Harness)** — five starters: AGENTS.md, verification commands, feature_list.json, progress file, completion gate.

**One-shot Syndrome** — in long tasks, the agent sees partial progress after context exhaustion and declares completion without verifying.

**Open loop** — a feedback-free loop (e.g., pure cron re-runs). The agent repeats and self-confirms its errors until the budget dies; guaranteed failure.

**Orchestration tax** — parallel agent output outpacing human review bandwidth. Review bandwidth is the real cap on parallelism.

**Outer loop** — cross-session persistence of lessons: the right lessons, at the right granularity, written to the right place (AGENTS.md, progress files, rule libraries).

**Pass@k / Pass^k** — at least one of k succeeds (exploration ceiling) / all k succeed (release-grade consistency). Production decisions read the latter.

**Blueprint** — Stripe's pattern: deterministic nodes sandwiching probabilistic LLM work; at most N rounds (e.g., 2 CI attempts), then a human.

**Progressive disclosure** — inject names and descriptions by default; load full content on demand. Context engineering's first lever.

**Ralph Loop** — a 2025 structured loop-verification practice; precursor of the 2026 productized `/goal` and `/loop`.

**Reducer** — the per-field merge function in graph orchestration: nodes return deltas; reducers merge them into a new immutable snapshot.

**Salt Signatures** — Google's model-layer state route: encrypted reasoning state emitted before tool calls and restored later; parallel to harness-layer external artifacts.

**Sandwich reasoning** — high reasoning for planning + medium for implementation + high for verification (66.5%) beats uniformly high (53.9%).

**Shadow validation** — old and new systems in parallel with full comparison (one production system: 22,792 calls, 99.49% agreement). A transition instrument, not a permanent architecture.

**Skills** — artifacts that solidify project knowledge and operating patterns (SKILL.md); the carrier of procedural memory. The authoring format, versus Plugin (distribution) and Bundle (deployment).

**Sovereignty** — the five workstreams that do not vanish with model progress: will injection, permission granting, environment supply, boundary drawing, governance and audit. Sovereignty cannot self-generate.

**Spec-file-driven** — a multi-agent coordination mode: agents exchange structured files instead of talking; traceable, auditable, recoverable, decoupled, isolatable.

**Sprint contract** — a negotiated "what does done mean" between generator and evaluator before implementation starts.

**State machine triad** — State (data snapshot) / Node (acts and updates state) / Edge (decides the next node). The ontology of graph orchestration.

**Three-way retrieval fusion** — BM25 + vectors + graph fused with RRF; recovers exact keywords (paths, error codes, SHAs) that vector search dilutes.

**Token paralysis** — too many tools, wasted attention on choosing. Fix: deterministic per-task filtering (Stripe 500→15).

**Working set** — the minimal context actually needed for the current decision; the core of "total context → filter → working set → decision."

**WIP=1** — one feature, one PR at a time; the safest default concurrency.

**doom loop** — the agent fine-tunes the same bad approach without converging. Four tourniquets: count-hint → rollback → budget breaker → error write-back.
