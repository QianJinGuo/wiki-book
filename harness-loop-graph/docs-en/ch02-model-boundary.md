---
title: "Chapter 2 The Model's Boundary: Why Engineering Is Not Optional"
---

# Chapter 2 The Model's Boundary: Why Engineering Is Not Optional

!!! abstract "Learning objectives"
    - Know the model's four systemic weaknesses and their engineering consequences: context rot, positional forgetting, optimistic self-evaluation, and the illusion of competence;
    - Use the L1–L6 task ladder to decide what can be delegated;
    - Face the opposing evidence honestly: model progress does erode some harness artifacts — and adopt the "layered temporality" verdict framework.

Engineering is not optional — but it must be scoped with evidence. This chapter clears the ground from both sides: first the model's systemic weaknesses (the demand side for harness), then the erosion caused by model progress (the boundary conditions for harness engineering). All evidence is from front-line practice and public research, not polemic.

## 2.1 Defect one: context rot

**Fact**: Production logs show agent decision quality degrading sharply once context-window fill passes roughly 40% — the so-called One-shot Syndrome (`queries/why-agent-poc-fails-production`, citing Anthropic's analysis of long-horizon agent failure modes). When irrelevant content dominates the window, decision quality drops systematically regardless of model strength: the signal is diluted. Not a capability problem — a signal-to-noise problem (`concepts/harness-engineering-framework` calls it Context Rot).

The classic earlier evidence is Liu et al. 2023, *Lost in the Middle*: models perform best when key information sits at the beginning or end of a long context, and significantly worse in the middle. A bigger window does not make "the right things are in the window" equal to "the model will use the right things."

**Engineering consequence**: context is not a database; it is an expensive stage — only the roles needed for the current decision belong on it. That leads directly to Chapter 7's layered supply and on-demand loading. The corresponding production practice: cap the resident layer, persist progress to the filesystem rather than the context (Ch 9).

## 2.2 Defect two: statelessness and forgetting

**Fact**: LLMs are stateless; every session starts from zero. Everything outside the context window is gone (one of the three defects in `entities/harness-engineering`).

**Engineering consequence**: memory must live on disk, not in the context. The model forgets; the repository does not — Git history, progress files, and structured lists are the legitimate carriers of cross-session state (Ch 9). Chapter 4 shows the other face of this defect: an agent rereading its own code, concluding it "looks OK," and stopping (first plausible solution bias), because in-session self-confirmation is not verification.

## 2.3 Defect three: systematically optimistic self-evaluation

**Fact**: Anthropic's conclusion — "Agents are incapable of accurately evaluating their own work." Multiple in-vault notes (`entities/harness-engineering`, `concepts/harness-engineering-framework`) record the same judgment: models show a systematic positive bias in self-evaluation, defending their output, amplifying successes, minimizing failures. This is an inherent tendency of LLMs, not a quirk of one model.

**Engineering consequence**: generation and evaluation must be separated (Generator-Evaluator) — the core of Chapter 4. The old software engineering rule applies verbatim: whoever wrote the code should not be the one who tests it.

## 2.4 Defect four: the illusion of competence — on the user's side

Model defects infect their users. Two findings worth memorizing:

- **METR's 2025 randomized controlled experiment**: experienced open-source developers were ~19% *slower* with AI tools, while believing they were ~20% *faster* — a perception-reality gap of ~39 percentage points (`topics/agent-harness-deep-dive-qa`, citing METR).
- **"Muscle atrophy for programming"**: Anthropic's RCT found learners using AI assistance understood a new library ~17% worse than the hand-written group, worst among the most AI-dependent (`drafts/karpathy-2026-vibe-to-agentic-engineering`). Offloading understanding and debugging means giving up the cognition built through friction.

**Attribution**: Karpathy distinguishes human intelligence from LLMs as *animals versus ghosts* — animal intelligence comes from continuous interaction with an environment and its consequences; "ghosts" are shaped by human documents, statistical patterns, and reward functions. The engineering value of the metaphor is calibrating collaboration: treat the agent as a motivated colleague and you will reach for the wrong management tools — you cannot urge, incentivize, or shame a ghost. What works is Chapters 6–9: design its environment, constraints, and verification.

## 2.5 L1–L6: what can be delegated

Karpathy's task ladder (`drafts/karpathy-2026-vibe-to-agentic-engineering`), ordered by **verifiability**:

| Level | Task profile | Autonomy |
|-------|-------------|----------|
| L1 | Output statically checkable (format, constants, pure functions) | Fully autonomous |
| L2 | Compiles, has a real test suite | Fully autonomous |
| L3 | Verifiable but incompletely (needs spot checks) | High autonomy + sampling |
| L4 | Verification is expensive (cross-system, performance, security) | Approval gates required |
| L5 | Money and identity (payments, auth, deletion) | Human-led, agent-assisted |
| L6 | Legal and ethical accountability | Human-led and accountable |

The criterion is not "does it look hard" but **can errors be discovered quickly and cheaply**. Well-tested code is L2; "changed payment logic, but the regression suite doesn't cover the FX boundary" is really L5. Chapter 8's permission design and Chapter 12's evaluation design both rest on this table.

## 2.6 The opposing evidence: progress erodes the harness

If this chapter only listed defects, the book would be a harness advertisement. The vault's September 2026 adversarial analysis (`comparisons/model-capability-vs-harness-engineering`, `concepts/when-not-to-harness-engineering`) records the strongest counter-evidence:

- **Generational erosion**: the Opus 4.5→4.6 update made the previous generation's sprint-decomposition machinery a 38% cost *saving* when removed — scaffolding the last model needed became friction (`entities/harness-engineering`).
- **Negative returns on strong models**: in the Gene-GEP experiment, a stronger model with longer Skill interventions scored 60.1 → 50.7 (−9.4).
- **Cheaper deterministic alternatives**: where the task fits, structured APIs are ~45× cheaper than computer-use-style agent stacks — bypass the entire agent layer when you can.
- **Artifact half-life**: the vault tracks a "claim half-life"; model generations arrive roughly every ~59 days, so a defense built against today's weakness may be obsolete in two months.

**The pro side is equally hard**: the MirrorCode long-horizon benchmark shows a 14-hour agent run completing work that takes humans 2–17 weeks — but that is the compound of "model capability × execution scaffolding"; strip the scaffolding and current models' independent completion rates on long-horizon tasks collapse.

## 2.7 The verdict: layered temporality

Put together, the evidence does not yield either-or. It yields **layered temporality** (the conclusion of `comparisons/model-capability-vs-harness-engineering`, adopted here in falsifiable form):

> **Model capability determines the necessary total amount of harness (shrinking per generation); harness engineering determines the usable floor for the current generation (rising per generation).**

Two wrong postures: constraining this generation's model with last generation's harness (overfitting — the Gene-GEP case); and canceling this generation's harness in anticipation of next generation's model (free-soloing — the long-horizon collapse case). The vault registered three testable predictions; track them yourself:

| Test | Supports "harness bears load long-term" | Supports "models take over fast" |
|------|----------------------------------------|----------------------------------|
| Gap between bare model and harness-agent on long-horizon tasks | Persists ≥2 model generations | Closes ≥50% within one generation |
| Average lifespan of harness artifacts | Lengthens with model upgrades | Shortens |
| Harness overhead share on a fixed task | Share falls while absolute benefit rises | Absolute benefit falls in step |

**Practice**: before building, ask the four questions (Ch 13 and Appendix B) — Does this weakness still exist in the *current* model? Is there a cheaper deterministic alternative? Does task frequency pay for the maintenance? Is the deletion condition written down?

!!! note "Fact / attribution / practice"
    The 40% fill rate, METR's 19%/20%, Anthropic's 17%, Gene-GEP's −9.4, the 38% cost, and the 45× cost gap are **facts** as recorded by the cited notes (consult the original studies for final numbers); Context Rot and "muscle atrophy" explanations are **attribution**; L1–L6 is a **practice framework** (Karpathy's decision tool, not natural law).

## 2.8 Anti-patterns

- **Arguing today's architecture from yesterday's defects.** Before citing "models hallucinate" to justify triple-redundant checks, reproduce that hallucination on the current model — defect lists have half-lives too.
- **Planning today's launch around tomorrow's model.** "Next generation will fix it" is not an engineering decision; the reliability floor can only be built on shipped models.
- **Packaging L5/L6 as L2.** "The payment logic has tests" does not make payments autonomous — tests cover the boundaries you imagined; L5 is defined by consequences beyond your verification.

## 2.9 Summary

- Four systemic weaknesses: context rot (degradation past ~40% fill), stateless forgetting, optimistic self-evaluation, and the user-side illusion of competence. They define the demand for every harness layer.
- L1–L6 ranks autonomy by **verifiability**, and is the foundation for permission and evaluation design.
- Progress does erode harness artifacts (38%, −9.4, 45×): the right conclusion is layered temporality — the necessary total shrinks per generation; the current floor rises per generation.
- Engineering posture: four questions before building; a deletion condition for every artifact.

## 2.10 Exercises

**Hands-on**

1. Label one agent task in your project L1–L6, then compare with the permissions and verification you actually give it. Most teams discover they run an L4 task as if it were L2.
2. Reproduce *Lost in the Middle*: take an 8K-token document, place the key constraint at the beginning, middle, and end, ask the same question three times, and grade the answers.

**Reflective**

1. Which column of the 2.7 table do you bet on? Write down your reasons and a check date (say, two model generations out) — the "prediction ledger" habit this book wants you to build.
2. What measurement reform does METR's "feels 20% faster, is 19% slower" demand in your team? (Ch 12 gives the answer: count review overhead into ROI.)

## 2.11 References

- In-vault: `queries/why-agent-poc-fails-production` (One-shot Syndrome, 40%); `concepts/harness-engineering-framework` (Context Rot, Generator-Evaluator, self-eval bias); `entities/harness-engineering` (three defects, 38%); `comparisons/model-capability-vs-harness-engineering` (adversarial page, layered temporality); `concepts/when-not-to-harness-engineering` (four boundary conditions, four questions, Gene-GEP, 45×); `drafts/karpathy-2026-vibe-to-agentic-engineering` (L1–L6, animals vs ghosts, METR/Anthropic citations); `topics/agent-harness-deep-dive-qa` (METR numbers).
- Public: Liu et al., *Lost in the Middle* (TACL 2024, arXiv:2307.03172); METR, *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity* (2025); Karpathy interviews on task levels and animals/ghosts (2026, via in-vault notes).
