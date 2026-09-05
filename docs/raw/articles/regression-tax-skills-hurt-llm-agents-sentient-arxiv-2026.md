---
source_url: https://arxiv.org/abs/2607.22520
ingested: 2026-07-28
sha256: b74704c275a84a2ca1cb9fb6f2ab39735570e34668864e3c8b07845917a49330
source_published: 2026-07-24
title: "The Regression Tax: Decomposing Why Skills Help — and Hurt — LLM Agents"
authors: Darshan Tank, Baran Nama
feed_name: Sentient Labs / arXiv
---

# The Regression Tax: Decomposing Why Skills Help — and Hurt — LLM Agents

> Darshan Tank, Baran Nama | Sentient Labs | arXiv:2607.22520v1

## Abstract

Adding procedural skills to an LLM agent is typically evaluated by average improvement in task success. However, this metric hides an important cost: skills can also make agents worse. We measure both sides by comparing agents with and without skills across nearly 6,000 runs spanning two office-automation benchmarks and three model–harness stacks.

We find that regressions are substantial enough that the best-performing skills outperform others primarily by regressing less, not by gaining more. We identify three causes of regression: (i) **skill-description osmosis**, a skill changes an agent's behavior simply by being present in context, even when never invoked; (ii) **grounding displacement**, a skill's prescribed procedure overrides how the agent interprets its inputs; and (iii) **verification displacement**, where the procedure suppresses checks the agent would otherwise perform on its outputs.

## Contributions

1. Decompose pass-rate changes into gains and regressions — 324 observed regression transitions offset **59%** of 553 gross gain transitions
2. Define criteria for three candidate regression mechanisms, including description-only influence when no skill body is invoked
3. Locate persistent errors at grounding and verification stages

## Experimental Setup

- **5,832 task-condition runs** across 486 tasks × 4 conditions × 3 stacks
- **Benchmarks**: OfficeQA-Pro (financial documents QA) + SpreadsheetBench (Excel manipulation)
- **Stacks**: OpenCode·minimax-m2.7, Codex·gpt-5.4-mini, Claude Code·sonnet-4.6
- **Conditions**: none (no skills), +anthropic, +openai, +Ours libraries (same signals → different skill content)

## Key Results

### Gains vs Regressions
- 553 gain transitions, 324 regression transitions — **59% offset**
- OfficeQA-Pro: 122 gains, 81 regressions (66% cancelled)
- SpreadsheetBench: 431 gains, 243 regressions (56% cancelled)
- **Best libraries outperform not by gaining more but by regressing less**: on Claude Code·OfficeQA, anthropic gains 10 (fewest) but regresses 2 (least) → highest net +8

### Three Regression Mechanisms

**1. Skill-Description Osmosis** (17.3% of OfficeQA regressions)
Skill changes behavior without being invoked. Description text stays in system prompt on every step. Case: UID0096 — compute centered moving average of customs-duty rate. With no skills: 37.708% (pass). With any library present (never invoked): 38.757% (fail). The shift tracks words "revised" and "customs" in skill descriptions.

**2. Grounding Displacement** (72.8% of OfficeQA regressions)
Skill's prescribed procedure overrides agent's input-reading logic. Agent reads wrong table, wrong year, wrong entity. Most dominant cause.

**3. Verification Displacement** (3.7%)
Skill suppresses output checks the agent would otherwise run. Example: absolute percentage change — no skill outputs +4.815 (correct), with skill outputs -4.816 (wrong sign), because skill lacks sign verification step.

### Persistent Failure Analysis
Existing skills overemphasize **Method** (procedural guidance — least often responsible for failure) while under-supporting **Grounding** and **Verification** — dominant sources of remaining errors. 34% of SpreadsheetBench failures have correct logic but use modern Excel functions the grader cannot evaluate.

## Recommendations

**Evaluation**: Report gains AND regressions, not net improvement alone. Test three conditions: no skills, description-only, full skill library. Decompose to see hidden costs.

**Design**: Shift skill content from Method to Grounding + Verification. Good skills include: where to start (which table, column, format) + how to confirm correctness (conditions, sign checks).

## Links

- arXiv: https://arxiv.org/abs/2607.22520
- GitHub: https://github.com/sentient-agi/meta-skill-creator
