---
title: "Chapter 9 State and Memory: Building a System That Does Not Forget"
---

# Chapter 9 State and Memory: Building a System That Does Not Forget

!!! abstract "Learning objectives"
    - Internalize memory's first principle: models are stateless, so memory lives on disk, not in context;
    - Master Anthropic's classic long-horizon pattern: feature list + progress file + startup sequence + checkpoints;
    - Govern memory: what to write, how much, when to decay — memory is a governance problem, not a capacity problem;
    - Know the two technical routes: harness-layer external artifacts vs model-layer state persistence.

## 9.1 First principle: the repository does not forget; the model does

LLMs are stateless: every session starts from zero, and everything outside the window does not exist. Hence memory design's single load-bearing rule (`topics/agent-harness-deep-dive-qa`):

> **Memory must live on disk, not in the context window.**

Samuel McDonnell's version is sharper: "The repository does not forget, but the model does." (`entities/loop-engineering-feedback-control-system`). Chat logs are low-quality memory — they record "what was said" while losing "why it was done" and "what happened next." What teams should invest in are **process assets**: stable troubleshooting paths, release checklists, PR review norms, migration runbooks, security red lines — engineering experience made executable for agents.

**Industry consensus**: memory is not a capacity problem but a **governance** problem — deciding which information is allowed to keep influencing future decisions, not storing more context (`topics/agent-memory-systems`).

## 9.2 Layers: the working set and long-term memory

Four memory types, as collected in `topics/agent-memory-systems`:

| Type | Carrier | Character |
|------|---------|-----------|
| Working memory | Context window | Short-term, real-time interaction |
| Procedural memory | Skills | Reusable operating patterns |
| Persistent memory | Vector/graph stores, files | Accumulated across sessions |
| Implicit memory | Model weights | Formed by training (not in our hands) |

The middle two are what we control. And "what to store" means modeling four objects at once (`concepts/agent-memory-system-design`, via the topic page): the **user model** (preferences, decision patterns), the **task model** (rejected options, confirmed conclusions, unfulfilled commitments), the **world model** (environment constraints, system boundaries, data freshness), and the **self model** (what was tried, which paths failed, which tools misbehave where). Intent, in this framing, is an emergent of long coupling across the four — not a field you store.

## 9.3 The classic pattern: Anthropic's long-horizon recipe

The pattern from *Effective Harnesses for Long-Running Agents* is this chapter's core artifact (`topics/agent-harness-deep-dive-qa`, `queries/harness-minimum-checklist`):

1. An **initializer agent** generates a JSON list of 200+ features — all `passes: false`;
2. The **coding agent** does one thing per session: read progress → run tests → implement one feature → update the list;
3. A **standard startup sequence**: `pwd` → read Git log and progress → pick the top unfinished feature → start the server → run end-to-end tests → only then start new work;
4. **JSON over Markdown**: agents are far less likely to accidentally mangle structured data;
5. **Incremental Git commits as checkpoints**: failures roll back; any moment is recoverable.

```json
{
  "id": "F042",
  "name": "Report export supports time ranges",
  "status": "in_progress",
  "passes": false,
  "notes": "Depends on F031's date utils; last failed at the timezone boundary"
}
```

Anti-pattern: making the agent do everything in one go — the context exhausts, and the next session sees partial progress and declares completion without verifying (the session-shaped One-shot Syndrome).

**Two routes diverge** (`topics/agent-harness-deep-dive-qa`): harness-layer external artifacts (Anthropic: progress files, Git history) vs model-layer state persistence (Google's Salt Signatures: the model emits an encrypted reasoning state before tool calls and restores its exact reasoning chain from it). The forecast is convergence — model-native state continuity plus harness-layer auditable memory. Until then, external artifacts are the only controllable, auditable choice.

## 9.4 Retrieval: three-way fusion and retrieval-inference coupling

Two validated designs on the read side:

- **Three-way retrieval fusion**: BM25 + vectors + graph, fused with RRF. In code contexts, file paths, function names, error codes, and commit SHAs are exact keywords that pure vector search dilutes; BM25 covers exactly that gap (the AgentMemory implementation recorded in `topics/agent-memory-systems`).
- **Retrieval-inference coupling**: upgrade `retrieve(query)` to `read(task_context, belief_graph)` — the retrieval strategy adjusts to the current task context. The most relevant memories are often semantically distant; pure similarity recall misses them (same source).

## 9.5 Memory governance: lifecycle philosophy

"Writing it down" is the beginning; "staying healthy" is governance (`concepts/agent-memory-lifecycle-philosophies`, via the topic page):

- **Write budgets**: not everything worth remembering should be remembered — memory has maintenance costs; admissions need quotas;
- **Consolidation and conflict handling**: when new memory contradicts old, rules decide who wins (timestamp? source trust? verification status?);
- **Decay**: same logic as "claim half-life" (Ch 2) — stale conclusions auto-downgrade or archive;
- **Provenance and permissions**: every memory traceable to its source; who may write and read is governed.

Tencent's AI team contributed the engineering version (`queries/why-agent-poc-fails-production`): five storage tiers (personal preferences → team conventions → technical knowledge → business knowledge → project knowledge), five knowledge types as tags (model/decision/guideline/pitfall/process), and a three-level maturity (draft → verified → proven) with automatic decay — **so the knowledge base does not rot over time**. The workflow is just the pipeline; knowledge is the living water flowing through it.

Two philosophies of memory worth knowing (`topics/agent-memory-systems`): OpenClaw gives sub-agents *no* persistent memory ("explicit over implicit" — safe, but nothing accumulates); Claude Code maintains a seven-layer context-compression system (keeps decision-relevant information, but is complex). No standard answer — only fit with your threat model.

## 9.6 Anti-patterns

- **Stateless design**: every conversation starts over; last quarter's pothole, this quarter's broken axle — one of the seven anti-patterns.
- **Context as storage**: progress, decisions, and lessons "remembered" only in session history; one full window and they are gone.
- **Write-only memory**: without decay and conflict handling, a memory library rots into a garbage heap — and garbage memories are worse than none, wearing the trusted costume of "experience."
- **Markdown lists as the single source of truth**: models accidentally edit natural-language lists far more easily than JSON; structure the list and guard it with wording.

## 9.7 Summary

- Memory on disk, not in the window; chat logs lose the "why" — process assets are the compounding asset.
- Of four memory types, procedural and persistent are ours to design; store against user/task/world/self objects.
- Anthropic's long-horizon recipe = feature list (JSON) + one-feature sessions + startup sequence + Git checkpoints.
- Read side: three-way fusion (BM25+vector+graph) and retrieval-inference coupling.
- Memory is governance: write budgets, conflict rules, decay, provenance, permissions.

## 9.8 Exercises

**Hands-on**

1. Implement the minimal memory kit for your project: `feature_list.json` + `progress.md` + a startup-sequence script. Advance one task across five fresh sessions and verify the fifth picks up seamlessly.
2. Add decay to your memory store: tag each memory with "last verified"; past a threshold, auto-downgrade to "needs re-check." In a month, the downgraded share measures your knowledge base's rot rate.

**Reflective**

1. OpenClaw's "zero implicit memory" vs Claude Code's "seven-layer compression" is safety vs accumulation. In your business, which failure costs more — remembering what should be forgotten, or forgetting what should be kept?
2. If "intent emerges from coupled memory layers" holds, is "modeling the user" better served by storing preference fields first, or by accumulating task/world/self models first?

## 9.9 References

- In-vault: `topics/agent-harness-deep-dive-qa` (Anthropic recipe, JSON>Markdown, startup sequence, Salt Signatures); `topics/agent-memory-systems` (memory types, four objects, three-way retrieval, OpenClaw vs Claude Code, lifecycle); `queries/why-agent-poc-fails-production` (five storage tiers, five types, three maturity levels, "pipeline and water"); `queries/harness-minimum-checklist` (feature_list.json template); `entities/loop-engineering-feedback-control-system` (outer loop, "the repository does not forget"); `concepts/agent-memory-system-design`, `concepts/context-management-agent-systems`, `concepts/agent-memory-lifecycle-philosophies` (via topic page).
- Public: Anthropic, *Effective Harnesses for Long-Running Agents* (2025-11); Google Salt Signatures technical report (via in-vault notes).
