---
title: "Remember When It Matters: Proactive Memory Agent for Long-Horizon Agents"
source_url: "https://arxiv.org/abs/2607.08716"
arxiv_id: "2607.08716"
ingested: 2026-07-14
authors:
  - Yifan Wu
  - Lizhu Zhang
  - Yuhang Zhou
  - Mingyi Wang
  - Bo Peng
  - Serena Li
  - Xiangjun Fan
  - Zhuokai Zhao
affiliation: Meta AI
tags: [paper, arxiv, memory, agent, proactive-memory, long-horizon]
type: raw
sha256: acc2af632b198f3238df41ce73a77ebf63882549a77c670645a73e21c820034a
---

# Remember When It Matters: Proactive Memory Agent for Long-Horizon Agents

**Authors**: Yifan Wu, Lizhu Zhang, Yuhang Zhou, Mingyi Wang, Bo Peng, Serena Li, Xiangjun Fan, Zhuokai Zhao (Meta AI)

**arXiv**: 2607.08716 | **Submitted**: July 9, 2026 | **License**: CC BY 4.0

**Code**: https://github.com/yifannnwu/proactive-memory-agent

## Abstract

In long-horizon tasks, decision-relevant state is often scattered across an expanding trajectory, while the action agent must surface it and act. As trajectories grow, task requirements, environment facts, prior attempts, diagnoses, and open subgoals can be buried in the context window or pushed beyond it, failing to influence decisions when needed. We call this failure mode "behavioral state decay".

We study memory as an active intervention mechanism rather than passive retrieval. A separate memory agent runs alongside an unmodified action agent, updating a structured memory bank from the recent trajectory and deciding whether to inject a memory-grounded reminder or remain silent. The module is plug-and-play with frontier action agents and existing agent harnesses.

Across Terminal-Bench 2.0 and τ²-Bench, it improves pass@1 for both weaker and stronger action agents, with gains of +8.3 pp on Terminal-Bench and +6.8 pp on τ²-Bench. Ablations show that selective intervention outperforms passive bank exposure, always-on injection, advisor-only guidance, and general retrieval.

As an early step toward open-weight memory policies, we train Qwen3.5-27B on SETA using SFT and GRPO, improving validation reward and achieving partial transfer to Terminal-Bench.

## Key Contributions

1. **Behavioral State Decay**: Identifies a new failure mode in long-horizon agent tasks where task-relevant state information is progressively lost as trajectories grow, leading to degraded decision quality.

2. **Two-Phase Memory Architecture**: Decouples memory maintenance from action selection using two distinct phases:
   - Phase 1: Memory management — the memory agent updates a structured memory bank from recent trajectory data
   - Phase 2: Intervention selection — the memory agent decides whether to inject a memory-grounded reminder into the action agent's context or remain silent

3. **Selective Intervention > Passive Memory**: Demonstrates that active, selective intervention (injecting reminders only when needed) significantly outperforms passive bank exposure, always-on injection, advisor-only guidance, and general retrieval approaches.

4. **Plug-and-Play Design**: The memory agent module works with unmodified frontier action agents and existing agent harnesses, requiring no changes to the action agent itself.

5. **Open-Weight Memory Policies**: Early results training Qwen3.5-27B on the SETA benchmark using SFT and GRPO, showing that learned memory policies can transfer to Terminal-Bench tasks.

## Results

| Benchmark | Improvement (pass@1) |
|-----------|---------------------|
| Terminal-Bench 2.0 | +8.3 pp |
| τ²-Bench | +6.8 pp |

## Subjects

cs.AI (Artificial Intelligence), cs.CL (Computation and Language)
