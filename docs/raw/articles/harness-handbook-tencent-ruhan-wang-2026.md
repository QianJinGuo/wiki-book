---
source_url: https://ruhan-wang.github.io/Harness-Handbook/
source: web
title: "Harness Handbook — Making Agent Harnesses Understandable, Auditable & Editable"
ingested: 2026-07-18
type: raw
tags: [agent, harness, manual, behavior]
sha256: 0544c4534ab2ee3b66ce8a21d28241f224420eec80201e3f90c75d83d215b14c
---

# Harness Handbook — Making Agent Harnesses Understandable, Auditable & Editable

AGENT HARNESS · TENCENT HY LLM FRONTIER · JUNE 2026

**Authors**: Ruhan Wang (Indiana University / Tencent HY LLM Frontier), Yucheng Shi, Zongxia Li, Zhongzhi Li, Yue Yu, Junyao Yang, Kishan Panaganti, Haitao Mi, Dongruo Zhou, Leoweiliang

**Links**: [Paper] [GitHub] [Handbook Studio Demo]

Making agent harnesses understandable, auditable, and editable.

## Summary

Open an open-source coding-agent codebase and you may want to see how it actually runs, verify that it behaves as safely as the documentation claims, or adapt it into an agent of your own. These goals reduce to concrete questions about behavior. The problem is not missing code, but missing a path from behavior to implementation.

Harness Handbook organizes scattered implementation into a behavior-level manual: it structures execution around system behavior and links every step to verifiable code evidence.

## Four Use Cases

1. **Understanding**: See how the harness runs — follow one request through the full flow.
2. **Auditing**: Verify that behavior matches expectations — trace permissions, confirmation logic, sandboxing.
3. **Adapting**: Build your own agent on an existing harness.
4. **Modifying**: More reliable harness changes with coding agents.

## Three-Level Structure (L1-L3)

- **L1 · System Overview**: How does this harness run as a whole? Architecture, execution flow, main stages, state flow.
- **L2 · Behavior-Unit Overview**: Which behavior units exist, and how do they connect? Responsibilities, inputs/outputs, ordering, key state.
- **L3 · Behavior-Unit Detail**: How does this behavior unit execute? Triggers, state changes, exception paths, code evidence.

## Behavior-Guided Progressive Disclosure (BGPD)

BGPD turns a behavior question into a traceable evidence path:
1. Behavior question → L1 system overview → L2 behavior-unit overview → L3 behavior-unit detail → Code evidence

## Generation Process

The Handbook is generated via a facts-first approach:
1. Extract facts (static analysis: files, functions, calls, state, config) → program graph
2. Organize by behavior → behavior map (proposer-reviewer loop until convergence)
3. Synthesize handbook → render L1-L3 with evidence links

## Evaluation

Compared coding agent with vs. without the Handbook on Terminus-2 and Codex harnesses. Three independent judge models (GPT-5.5, Opus 4.8, DeepSeek-V4-Pro). Results:
- Higher preference rate (handbook-assisted planner wins more often)
- Lower token cost per case
- Higher recall, precision, and F1 at file and symbol level
- Wrong cases (planner lands in wrong subsystem) drop sharply
- Advantage persists across task difficulty levels

## Handbook Studio

Interactive workbench: connect a repository, generate the three-level Handbook, and read/verify/propose changes on the same behavior map. Changes start on the behavior map — the user states a behavior-level request, the system generates a reviewable edit plan and diff covering all affected implementation sites.

## Key Insight

"Prose explains; facts anchor." Every explanation is grounded in verifiable code evidence. The Handbook turns behavior chains hidden in the codebase into a map you can browse layer by layer and verify against source code.
