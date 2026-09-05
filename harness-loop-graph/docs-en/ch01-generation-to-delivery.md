---
title: "Chapter 1 From Generation to Delivery: The Birth of Agent Engineering"
---

# Chapter 1 From Generation to Delivery: The Birth of Agent Engineering

!!! abstract "Learning objectives"
    - Trace the four stages of agent engineering, 2022–2026, and each stage's legacy and lesson;
    - Master the book's central formula `Agent = Model + Harness`, and why it holds;
    - Do the serial-reliability arithmetic: why 95% per-step success cannot sustain a 20-step task;
    - Understand the real relationship between vibe coding and agentic engineering — layering, not replacement.

## 1.1 Four stages: from "can talk" to "can deliver"

Compressing 2022–2026 into one table:

| Stage | Time | Core idea | Legacy | Exposed problem |
|-------|------|-----------|--------|-----------------|
| ReAct | 2022 | Alternate reasoning and acting: think a step, call a tool | "Models can use tools" became consensus | Single-step reasoning; no sustained loop |
| AutoGPT | 2023 | Fully autonomous agent: give a goal, it decomposes and executes | Fired up the "AI employee" imagination | No termination condition; famous runaway |
| Vibe coding | Early 2025 | Stay in the vibe, forget the code, judge only the result | Drove the cost of *generating* to everyone | No verification, no constraints; great demos, broken production |
| Harness / Loop / Agentic engineering | 2025–2026 | Build the runtime system around the model: environment, verification, loops | Agent engineering became a discipline | Orchestration tax, verification cost, harness decay (Ch 13) |

These four stages are not simple replacement but a **migration of the problem's center of gravity**: from "get the model to emit better tokens" to "get the model to deliver work inside a system."

**AutoGPT's failure deserves its own entry**, because it precisely defined the problem Loop engineering exists to solve: *an autonomous loop without a termination condition is a disaster.* AutoGPT would retry around the same goal, confirming its own errors, until the token budget died. Three years later, the fastest way to judge whether a team can build agents is still to ask: when does your loop stop?

**Vibe coding was coined by Karpathy in a February 2025 tweet**: "There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists… just see stuff, say stuff, run stuff, and copy paste stuff, and it mostly works." (Some in-vault notes date it to late 2024; the tweet itself is from early 2025.) Anthropic researcher Erik Schluntz later sharpened the definition: as long as you are still reviewing the AI's code line by line, you are not vibe coding — you have just bought a more expensive IDE. The point: **the engineer's agency migrates from writing code to verifying results.**

## 1.2 A crash site: the boundary of vibes

Vibe coding's limits are not theoretical; there is a full post-mortem. In 2025 a developer publicly dissected a failed 7-month project: 234 commits, a 1,690-line "god object" with a 500-line `Update()` method and 110 switch/case branches (in-vault note `entities/vibe-coding-god-object-7months-failure`; 500+ comments on Hacker News).

The most valuable finding: **AI is extremely efficient at reproducing existing patterns — and that "magic time" precisely masks the fact that it does not understand the design intent behind the structure.** When the project grew from "a tool that runs" into "a production system that must be maintained," intent-less rapid accretion inevitably lost entropy control. The author's key change on rewrite happened *before the first prompt*: interfaces, message types, and ownership rules were settled on paper first.

**Attribution**: AI is an execution accelerator, not a thinking substitute. Architecture must be set by humans — a lesson since confirmed repeatedly, and the first axiom of agentic engineering.

Tencent's backend team put it more bluntly (in-vault note `entities/tencent-vibe-coding-to-agentic-engineering-backend`): vibe coding is essentially "prompt-and-pray" — throw requirements at the AI and hope nothing breaks. Great for prototypes, falls over in production, because generated code quality is uncontrolled, there is no review process, and even commit messages are a mess. **This is not an AI capability shortage; it is a workflow with no structured constraints.**

## 1.3 The central formula: Agent = Model + Harness

Harness originally means horse tack — reins, saddle, bit: the whole kit for controlling a horse. The metaphor is deliberate. The horse is the model: powerful and fast, with no idea where to run. The rider is the human engineer: direction and judgment. The tack is the Harness: channeling raw capability into useful work (`topics/agent-harness-deep-dive-qa`).

> **Agent = Model + Harness. The Model decides how smart the AI is; the Harness decides how reliable.**
> Harness = the complete control infrastructure around an AI model: memory systems, tool interfaces, orchestration logic, safety guardrails, observability pipelines, evaluation loops. (`entities/harness-engineering`)

Why does the formula hold? Because models have three congenital engineering defects, none of which a "smarter model" makes vanish:

| Defect | Manifestation | Engineering consequence |
|--------|--------------|------------------------|
| Probabilistic output | Same input, uncertain output | Hard to test; no SLA guarantees |
| Short memory | Anything outside the context window is forgotten | Cross-task state loss |
| Hallucination | May fabricate data and citations | Cannot plug directly into production |

Martin Fowler's phrasing of the same judgment: nondeterminism has entered the development pipeline — that is where the harness starts bearing load (in-vault note on Fowler's AI R&D reminder). Two phrasings, one conclusion: **the center of engineering has moved from inside the model to around it.**

## 1.4 Serial reliability: the arithmetic

Why can't 95% per-step success sustain a real task? Because a task is a chain of steps, and success multiplies:

$$0.95^{20} \approx 0.36$$

Twenty steps at 95% each leaves about 36% end-to-end. This is the "serial reliability math" summarized in `topics/agent-harness-deep-dive-qa`, and it is the mathematical essence of why long tasks expose bare models: **even with excellent per-step performance, end-to-end success collapses over long chains.** Now raise each step to 99%:

$$0.99^{20} \approx 0.82$$

Four percentage points per step take end-to-end success from 36% to 82%. **Engineering means (verification, retries, gates) raise exactly that per-step number, and it compounds.** This arithmetic justifies every later chapter: each Harness layer pushes per-step reliability toward 100%.

## 1.5 Why now: four structural reasons

The Harness/Loop paradigm erupted in late 2025 not as a hype cycle but for four structural reasons (`topics/agent-harness-deep-dive-qa`):

1. **Once models got capable, system design became the main source of differentiation.** Strong models still need a good working environment to perform. Ben Thompson's Stratechery judgment: model capabilities converge; the harness differentiates.
2. **Long tasks expose bare models' systemic defects.** Even the strongest models cannot produce production-quality applications across multiple context windows — problems a stronger model does not auto-solve (long-horizon handling: Ch 9).
3. **Serial reliability math.** Above. This must be solved at the system layer, not by smarter models.
4. **Commoditization.** Frontier capability gaps narrow; system design around the model becomes the new moat.

Milestones: 2025-11, Anthropic publishes *Effective Harnesses for Long-Running Agents*; 2026-02, Mitchell Hashimoto blogs "every time the agent makes a mistake, engineer a solution so it never happens again," and OpenAI's blog publishes *Harness Engineering*; late 2026-03, ~500K lines of Claude Code TypeScript leak, and the industry sees for the first time what a leading agent product is made of — **the valuable part is not the model calls, it is the system around them**; 2026-06, Boris Cherny and Peter Steinberger champion Loop Engineering.

## 1.6 Industry echo: from rhetoric to roadmaps

The paradigm shift is already in vendors' roadmaps (`drafts/karpathy-2026-vibe-to-agentic-engineering`, which cross-cuts 184 in-vault notes citing Karpathy):

- **Cloud vendors**: AWS shipped AgentCore Managed Harness — microVM isolation, MCP tool gateway, on-demand skills, resumable sessions. Alibaba Cloud pushed harness concepts down to the OS layer. Cloud vendors collectively concede: "the moat is not the model; it is the harness."
- **Application teams**: Tencent's backend pipeline wires Claude Code + Skills/Commands/MCP into a flow where engineers shift from executing to reviewing; Fudan/Peking University formalized Agentic Harness Engineering (AHE) as a research direction.
- **Individual engineers**: Karpathy's "bits and programmer value" series argues that lines of code written by hand no longer correlate with value; value migrates to problem definition, system judgment, agent orchestration, evaluation and verification.

Karpathy himself framed the two terms in 2026: vibe coding is "the democratization of the generation paradigm," solving "make it faster"; agentic engineering is "the engineering of the delivery paradigm," solving "can it be delivered reliably." **Not replacement — layering: vibe coding lowers the floor of creation; agentic engineering raises the ceiling of delivery.** He declared vibe coding "dead" as a final paradigm while still demonstrating pure vibe coding in personal projects — because he never said it was useless, only that it is **not enough**.

!!! note "Fact / attribution / practice"
    In this chapter: the four-stage timeline, the crash numbers (234 commits, etc.), and the leak are **facts** (public record); "AI doesn't understand design intent" is **attribution** (an interpretation of one post-mortem); "architecture must be set by humans" is **converged practice**.

## 1.7 Anti-patterns

- **Treating paradigms as tribes.** "Vibe coding is dead" means *not sufficient*, not *useless*. Prototypes vibe; production engineers. Coexistence is normal.
- **Blaming AutoGPT on "dumb models."** The opposite: it failed for lack of termination conditions and verification — still the core of loop engineering (Ch 3–4).
- **Assuming stronger models cancel all of this.** Progress does erode some harness artifacts (Ch 13 handles the controversy head-on), but serial reliability math and the sovereignty question (who may authorize the agent) do not disappear.

## 1.8 Summary

- The field's center of gravity moved from generation to delivery; four stages each left a lesson.
- Central formula `Agent = Model + Harness`: the model's three congenital defects make reliability a property of systems, not models.
- Serial reliability (0.95²⁰≈36%) explains why per-step reliability must be engineered upward.
- Vibe coding and agentic engineering are layers, not rivals: creation's floor vs delivery's ceiling.

## 1.9 Exercises

**Hands-on**

1. Run a controlled experiment with your coding agent on a 10+ step task: once with a bare request, once with interfaces and acceptance criteria written first. Count rework rounds. This is a rehearsal for the book's experimental method.
2. Do the arithmetic for your core business flow: how many steps? Estimate end-to-end success at 95% and 99% per step, and identify the step most worth a verifier.

**Reflective**

1. "Given a strong-enough model, harnesses are temporary scaffolding" — list its strongest and weakest scenarios (Ch 2 and 13 give a verdict framework).
2. Of AutoGPT's three direct failure causes (no termination, no verification, no budget), which is still most common in today's products? Give an example you have seen.

## 1.10 References

- In-vault: `entities/harness-engineering` (central formula, defects, timeline); `topics/agent-harness-deep-dive-qa` (tack metaphor, four reasons, serial reliability math); `drafts/karpathy-2026-vibe-to-agentic-engineering` (paradigm arc, industry echo); `comparisons/vibe-coding-vs-agentic-engineering`; `entities/vibe-coding-god-object-7months-failure`; `entities/tencent-vibe-coding-to-agentic-engineering-backend`.
- Public: Anthropic, *Effective Harnesses for Long-Running Agents* (2025-11); OpenAI, *Harness engineering* (2026-02); Mitchell Hashimoto, *My AI Adoption Journey* (2026-02); Ben Thompson, Stratechery (2026-03); Yao et al., *ReAct* (arXiv:2210.03629, 2022); Karpathy's original vibe-coding tweet (2025-02).
