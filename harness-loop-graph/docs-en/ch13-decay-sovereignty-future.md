---
title: "Chapter 13 Decay, Sovereignty, and the Engineer's Next Seat"
---

# Chapter 13 Decay, Sovereignty, and the Engineer's Next Seat

!!! abstract "Learning objectives"
    - Face harness decay squarely: the evidence, the mechanism, and Build to Delete as a design principle;
    - Keep the when-NOT-to-harness four questions and component shelf-life checks at hand;
    - Understand the sovereignty line: five kinds of work that do not vanish with model progress;
    - Form your own position on the engineer's value coordinates in the agent era.

## 13.1 Decay: every harness component has a shelf life

This book argued for the harness all the way through; the last chapter owes you the other side. **A harness is not static configuration — after model upgrades, "old rules obstruct new capabilities."** The vault calls this harness decay (`entities/harness-engineering`):

- The Opus 4.5 → 4.6 update made the previous generation's sprint-decomposition machinery a drag; removing it **saved 38% in cost**;
- Anthropic built a context-reset mechanism for Sonnet 4.5's "context anxiety"; a stronger model eliminated the behavior itself, and the mechanism became unnecessary — later, over 80% of Claude Code's system prompt was deleted for new models;
- Manus rewrote its harness 5 times in 6 months — in the direction of *simplicity*; LangChain adjusted 3 times a year; Vercel cut 80% of its tools and got better.

Hence **Build to Delete** (Ruo Fei's principle, `entities/harness-engineering` source 4): do not build a harness and then optimize it — **build a harness you can delete.** Every component should be designed for removal from day one, with the system still working after removal. Forcibly removing one component at regular intervals and seeing whether quality holds is decay detection in its most direct form. The harness's true moat is not the complexity you accumulated but **the judgment of what to delete**.

Component shelf-life checks (run at every model upgrade, `queries/harness-minimum-checklist`):

| Component | The assumption it encodes | How to check |
|-----------|--------------------------|--------------|
| Context reset | The model suffers long-context anxiety | Run one round with it off vs on |
| Sprint contracts | The model cannot decompose tasks itself | Remove; does the generator lose the thread? |
| Aggressive compression | The model is distracted by redundant context | Loosen compression; does quality rise? |
| Tool formatting | The model cannot handle raw formats | Raw vs formatted comparison |

Method: **remove one component at a time** and observe. The companion model-migration checklist (tool schema compatibility, citation formats, prompt structure, OOD transcripts, cache clearing, tokenizer changes) is in Appendix B.

## 13.2 When NOT to harness: four questions

`concepts/when-not-to-harness-engineering` organizes the opposing case into four boundary conditions (two were cited in Ch 2; here is the full set):

1. **Generational updates actively erode harness value** — artifacts built against today's weaknesses are debt that becomes friction at the next upgrade; without a deletion mechanism, do not start building;
2. **Intervention can be negative on strong models** — Gene-GEP (−9.4); the decision order: deterministic API → single call → thin loop → heavy harness. The harness is the last gear, not the first;
3. **When the task isn't worth it, cost never pays back** — one-off scripts and prototype exploration lose their speed to engineering constraints;
4. **The safety boundary is not in the harness** — sandboxes can be escaped (the NomShub chain); "we run a harness" is not a security conclusion.

Distilled into the four questions before building (Appendix B):

> ① Does this weakness still exist in the **current** model? ② Is there a cheaper deterministic alternative? ③ Does task recurrence pay for maintenance? ④ Is the deletion condition written?

If you cannot answer any one of them, do not build yet.

## 13.3 The verdict, in full

Chapter 2's "layered temporality" gains its time axis here. Beyond the three testable predictions (`comparisons/model-capability-vs-harness-engineering`), the industry-consensus arc (`entities/harness-engineering`, three-stage evolution) reads:

- **Short term (1–2 years)**: hand-polished tool descriptions stop mattering; context management becomes declarative configuration — engineers move from implementation details to system design;
- **Medium term (3–5 years)**: models start assembling parts of the harness themselves (Anthropic's prompt deletion is the early sign) — engineers shift from "building the harness" to "**auditing and constraining auto-generated harnesses**";
- **Long term**: the non-dissolving core solidifies into an "agent constitution" — engineering becomes **governance engineering**.

The trend line in one sentence (`entities/harness-engineering`, source 3): **better models = simpler harnesses = cheaper runs = faster output** — the most optimistic, and currently best-supported, harness economics. Model progress does not abolish the job; it keeps raising the workbench.

## 13.4 The sovereignty line: five things that do not disappear

Model capability will take over more and more of the "how" — tool calls, format fitting, basic planning, basic self-verification, generic skill packaging. One class of work is exempt (`entities/harness-engineering`):

1. **Will injection**: whose goals does the agent serve? The objective function is defined by people;
2. **Permission granting**: permissions are conferred, not learned — GPT-10 will not issue itself write access;
3. **Environment supply**: the agent's ceiling is set by its toolset; no browser, no web;
4. **Boundary drawing**: the "meta-harness" — the rules that constrain evolution itself. An agent may self-improve, but where improvement must stop is drawn by people, the way constitutional amendment requires a higher consensus;
5. **Governance and audit**: evaluation frameworks evolve from "measuring capability" to "constraining behavior."

**Sovereignty cannot self-generate** — the source of power always lies outside the exerciser of power. Three analogies: employees do not set their own KPIs; autonomous driving needs a human ethical frame preset; a judge's legitimacy originates outside the judge.

For the individual engineer, Karpathy's mapping (`drafts/karpathy-2026-vibe-to-agentic-engineering`): hand-written bits decouple from value; value migrates to **problem definition, semantic modeling, boundary design, verification systems**. "You can outsource thinking; you cannot outsource understanding" — understanding tensors, defining what a user identity is, designing permission models, building verification systems: these rise in value precisely because agents' errors cost most there.

## 13.5 Open problems: the honest edge

A book about reliability ends by listing what remains unsolved (`topics/agent-harness-deep-dive-qa`):

| Problem | Status |
|---------|--------|
| **Behavioral verification** | Structural quality largely solved; behavioral correctness unsolved — AI PRs rejected at 67.3% vs 15.6% |
| **Confidence calibration** | Agents cannot say "I'm unsure"; correct and hallucinated output carry equal confidence |
| **Edit formats** | No standard reliable way to apply code changes; one format variable moves 15 models by 5–14 points |
| **Brownfield applicability** | Success stories are mostly greenfield; a 10-year-old codebase is the harder exam |
| **Perception gap** | METR: 19% slower in fact, 20% faster in feeling |

These open problems mark where the next decade's engineering value sits: whoever turns "behavioral correctness" into a decidable proposition takes the next baton.

## 13.6 Closing: design the verifier, not the prompt

The whole book, in one line:

> **Agent = Model + Harness; Loop ⊃ Harness ⊃ Context ⊃ Prompt. The model supplies possibility; you supply reliability.**

One sentence per primitive:

- **Harness**: don't teach the model how to behave — give it an environment where mistakes can't capsize the boat. Every rule is a healed scar; every component is deletable.
- **Loop**: a prompt gives the agent an instruction; a loop gives it a job. Build the verifier first, the loop second, and always fit the circuit breaker.
- **Graph**: control flow lives in deterministic code; the model produces actions; the graph decides when and what. Split by context boundary; agree on protocol before collaboration.

And Samuel McDonnell's line, the best closure this book could ask for (`entities/loop-engineering-feedback-control-system`):

> "Management in the agent era is not hiring capable workers — the workers are capable and cheap. It is designing the constraints they run inside. Stop designing prompts. Start designing verifiers."

And what you are doing right now — sedimenting engineering experience into executable knowledge, turning every failure into a rule, writing down every system's boundaries — *is* harness engineering. The next edition of this book should be continued by your team's incident reports.

## 13.7 Exercises

**Hands-on**

1. Run a "deletion drill" on your harness: work through the shelf-life table, actually remove one component, run a benchmark round, record the quality delta. For the component you cannot delete, write down why — that is where your system's real coupling lives.
2. Draft a one-page "agent constitution" for your team: will (whom it serves), permissions (default-deny list), boundaries (the L5/L6 list), governance (evaluation and escalation paths). Five lines per column, no more.

**Reflective**

1. Of the five open problems, which will the next model generation dissolve naturally? Which will get *worse*? (Hint: the stronger and more productive the model, the tighter behavioral verification and review bandwidth become.)
2. What does "sovereignty cannot self-generate" mean for your career plan? In five years, will your value be anchored in knowing *how*, or in deciding *whether*?

## 13.8 References

- In-vault: `entities/harness-engineering` (decay data, Build to Delete, the sovereignty five, three-stage evolution, trend line); `concepts/when-not-to-harness-engineering` (four boundary conditions, four questions, NomShub); `comparisons/model-capability-vs-harness-engineering` (adversary page, verdict, three predictions); `queries/harness-minimum-checklist` (shelf-life table, migration checklist); `topics/agent-harness-deep-dive-qa` (open problems, Factory/recursive self-improvement, risk-amplifier data); `drafts/karpathy-2026-vibe-to-agentic-engineering` (bits and value migration, "cannot outsource understanding"); `entities/loop-engineering-feedback-control-system` (Samuel's closing line).
- Public: Anthropic, *When AI builds itself* (2026-06); Mitchell Hashimoto, *My AI Adoption Journey* (2026-02) (both via in-vault notes).
