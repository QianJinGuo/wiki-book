---
title: "Chapter 7 Context Engineering: Designing the Supply Chain"
---

# Chapter 7 Context Engineering: Designing the Supply Chain

!!! abstract "Learning objectives"
    - Adopt the supply-chain model of context: five information layers, each with its own admission policy;
    - Apply progressive disclosure — on-demand loading is the first lever against Context Rot;
    - Write a good AGENTS.md (and recognize what makes a bad one);
    - Choose between compaction and reset, and re-audit context responsibilities when models change.

## 7.1 From "fill the window" to "run a supply chain"

Chapter 2 established two facts: the context window is not a database, and quality degrades past roughly 40% fill. Context engineering's first principle follows: **more context is not better; context is a supply chain — which information, at what moment, in what form, admitted by whose decision.**

The working-set model from practice (`concepts/context-management-agent-systems`, via `topics/agent-memory-systems`): total context → filter → working set → agent decision. The filter stage fights four enemies: window limits, cost, interference (irrelevant context corrupting decisions), and decay (early context "forgotten").

**Layering is the answer.** Sort information by lifetime and stability into five layers (`concepts/harness-engineering-framework`):

| Layer | Contents | Policy |
|-------|----------|--------|
| Resident | Identity, core constraints, project conventions | Short and always present; too heavy and rot begins in turn one |
| On-demand | Skills, domain documents | Only names and descriptions injected; full text read when needed |
| Runtime | Current goal, user feedback, tool results | Released when the task ends |
| Memory | Cross-session experience, rejected options, confirmed conclusions | Retrieval-based: pulled in when used, returned to storage |
| System | Compiler/type-check/lint output | Produced by deterministic systems; the external baseline for verification |

Ruo Fei's 2026 framework says the same in three tiers: **resident → on-demand → enforced** (permissions, validation, audit take effect at the execution layer, not via prompt piety) (`entities/harness-engineering`, source 8).

## 7.2 Progressive disclosure: the first lever

**Progressive disclosure** is context engineering's highest-ROI practice: inject only a name and one-line description by default; load the full content when the model decides it needs it. OpenClaw shows sub-agents a skill catalog, never full texts; OpenAI recommends AGENTS.md as a ~100-line table of contents with the detailed documents referenced on demand (`topics/agent-harness-deep-dive-qa`).

A quantified case (`queries/harness-minimum-checklist`): Cloudflare compressed 2,500 API endpoints into 2 tools for the model, dropping tokens from 150K to 2K (−98.7%) — not by cutting capability, but by separating "catalog" from "detail."

**Why not inject everything?** A production system ran the experiment for you: injecting all 143 relations of a knowledge graph doubled the false-positive rate; the fix was Markov-blanket-style selection — only what is causally relevant to the current decision (`topics/agent-harness-deep-dive-qa`). Full injection is not generosity; it is dilution.

## 7.3 AGENTS.md: how to write it, and how it gets written badly

AGENTS.md/CLAUDE.md is the resident layer's main carrier. GitHub's analysis of 2,500+ repos and OpenAI's own 88 AGENTS.md files converge on "how to write" (`topics/agent-harness-deep-dive-qa`):

- **A table of contents, not an encyclopedia**: ~100 lines, pointing to deeper documents;
- **Commands over descriptions; code samples over prose**;
- **Cover six areas**: commands, tests, project structure, style, git conventions, boundaries (what not to do);
- **Maintain it as an immune system**: every agent mistake adds one rule (echoing Ch 6's error-fed rule library).

**How it goes bad** — two real lessons:

- **Giant files self-harm**: a 16,000-character AGENTS.md was truncated by 11%, cutting exactly the safety-rules addendum — a real production incident (`topics/agent-harness-deep-dive-qa` anti-patterns).
- **Documentation ≠ control**: ETH Zurich's 138-task measurement — human-written docs gained ~4% success; AI-auto-generated docs lost 3% and cost 20% more. HumanLayer's practice: **keep CLAUDE.md under 60 lines; cut the sermons, add hard blocks.** Writing "no rm -rf" a thousand times in CLAUDE.md is worth less than one hook — prose asks; hooks prevent (`entities/harness-engineering`, source 5).

Combined, the coding-agent components sort by function (same source):

| Component | Role | Leans |
|-----------|------|-------|
| CLAUDE.md / AGENTS.md | Project rules | Context |
| Skills | Task methods on demand | Context |
| MCP servers | External tools and data | Context |
| Commands | Repeatable workflows | Harness |
| Hooks | Auto-checks on lifecycle events | Harness |
| Permissions | What may auto-execute | Harness |

## 7.4 Compaction and reset: when the window fills

Long tasks exhaust windows. Two strategies (`concepts/harness-engineering-framework`):

- **Compaction**: same session, shorter history — summary-rewriting that keeps decision-relevant information;
- **Reset**: a fresh context in a new agent; the handoff is written to files and the new session restores from them.

Anthropic's finding is worth remembering: for some models (the Claude Sonnet 4.5 generation), **only reset truly "empties the baggage"** — the old context's anxieties and narratives contaminate new decisions; a stronger model later eliminated the behavior itself, and the reset machinery became unnecessary. Again Chapter 2's verdict: mechanisms must match the model's current boundary.

The companion discipline is the **startup sequence**: at session start — `pwd`, read Git log and progress files, confirm the top-priority task, then begin (`topics/agent-harness-deep-dive-qa`). State is restored from files, not from "memory" — that is Chapter 9's subject, but it is fundamentally a supply-side act of context engineering.

## 7.5 Model upgrades: re-auditing context responsibilities

In 2026 Anthropic disclosed deleting over 80% of Claude Code's system prompt for stronger new models. Ruo Fei's framework ("the new rules of context engineering," `entities/harness-engineering` source 8) draws the moral: **when model capability changes, every responsibility living in the old context must be re-assigned.** Six typical migrations: hard prompt rules → model judgment; examples → interface design; resident injection → on-demand loading; duplication → single source of truth; merged information → separation; prose conventions → executable specs.

Five rules follow (same source):

1. Context configuration varies by model — **model and context configuration are one release unit**;
2. One piece of information, one responsibility;
3. On-demand loading needs explicit trigger conditions;
4. Interface problems are fixed at the interface, not patched in context;
5. After pruning, keep evidence (measured comparisons, not vibes).

Evaluation method: 20–50 real tasks, crossed on model axis × task axis, one variable at a time; watch four signals — is the task done right, did the process get worse, did old failures return, were high-risk boundaries touched.

## 7.6 Anti-patterns

- **A giant resident layer.** A 16,000-character AGENTS.md is not a moat; it is a truncation incident in waiting. The shorter the resident layer, the richer the on-demand layer.
- **Believing rules in documents are constraints.** Documentation's marginal utility is near zero (ETH's 4%); safety and boundaries belong to hooks/permissions (Ch 8).
- **Compaction instead of governance.** Repeatedly compacting rotted history recycles noise. Reset when reset is due; externalize when externalization is due.
- **Upgrading the model ID alone.** Without a context-configuration audit, you walk the new road in old shoes — last quarter's truncation failure recurs somewhere new.

## 7.7 Summary

- Context is a supply chain: five layers with distinct admission policies; the working set is "total → filter → working set → decision."
- Progressive disclosure is the first lever: catalog and detail supplied separately (Cloudflare 150K→2K).
- AGENTS.md as a ~100-line table of contents, maintained as an immune system — but documentation ≠ control; hard edges need hooks/permissions.
- Compaction vs reset by model boundary; startup sequences restore state from files.
- A model upgrade is a context re-audit: re-assign every responsibility, evaluate with crossed axes, keep evidence.

## 7.8 Exercises

**Hands-on**

1. Audit your project's context: print one real request's full prompt, sort every part into the five layers, and compute the resident share. Past ~10% of the window, slim it down.
2. Compress your AGENTS.md to ≤100 lines: keep commands and test entry points; turn descriptive prose into links to repo docs. Compare task success before/after.

**Reflective**

1. Is "documentation's marginal utility is near zero" in conflict with "AGENTS.md is an immune system"? (Hint: the first is about controlling behavior with documents; the second about sedimenting lessons with them. Control by mechanism; sediment by document.)
2. Who owns your team's model-upgrade audit, and on what cadence? Draft a one-page process from 7.5's five rules and four signals.

## 7.9 References

- In-vault: `topics/agent-harness-deep-dive-qa` (progressive disclosure, AGENTS.md practice, giant-file incident, ETH 4%, startup sequence, Markov blanket); `concepts/harness-engineering-framework` (five context layers, Context Rot, compaction vs reset); `entities/harness-engineering` (source 5 hook>docs and HumanLayer 60 lines, source 6 component table, source 8 new rules and responsibility migration); `queries/harness-minimum-checklist` (Cloudflare data); `topics/agent-memory-systems` (working-set model).
- Public: GitHub Blog, *How to write a great AGENTS.md*; Liu et al., *Lost in the Middle* (2023); Anthropic context-management engineering posts (via in-vault notes).
