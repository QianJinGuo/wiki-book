---
title: "The Red Queen Gödel Machine: Co-Evolving Agents and Their Evaluators"
source_url: "https://arxiv.org/abs/2606.26294"
authors: ["Alex Iacob", "Andrej Jovanović", "William F. Shen", "Daniel Burkhardt", "Meghdad Kurmanji", "Nurbek Tastan", "Lorenzo Sani", "Niccolò Alberto Elia Venanzi", "Ambroise Odonnat", "Zeyu Cao", "Bill Marino", "Xinchi Qiu", "Nicholas D. Lane"]
institution: "Cambridge + NVIDIA"
published: 2026-06-24
ingested: 2026-06-28
language: en
type: raw
sha256: "be930c4a8c636477172d691a87b56e0e9e52816a591654e8ef4f107e142445c1"
---

# The Red Queen Gödel Machine: Co-Evolving Agents and Their Evaluators

**arxiv**: 2606.26294
**机构**: Cambridge + NVIDIA
**日期**: 2026-06-24

## Abstract

Self-improving agents are state-of-the-art (SOTA) on agentic coding benchmarks and have recently been extended to general domains. However, their search methods generally assume a stationary evaluation criterion: a fixed verifier, benchmark, or labeled dataset that remains valid as the agent improves. This ignores a central feature of evolution: species adapt as their environments change with them.

We aim to bring the same principle to recursive self-improvement, making evaluation part of the improvement loop and opening search to evolving evaluators, adversarial objectives, and dynamic utilities that may surpass static benchmarks.

We introduce the Red Queen Godel Machine (RQGM), an evolutionary framework for recursive self-improvement under non-stationary utilities. The RQGM makes this possible through controlled utility evolution: search is organized into epochs with a fixed within-epoch evaluation criterion, while the utility can be updated at epoch boundaries, so self-improvement guarantees hold per epoch as the objective evolves across them.

## Key Results

**Code writing (Polyglot)**:
- Test pass rate: 69.9% → 71.7% (+1.8% over prior SOTA)
- Token efficiency: 1.35x-1.72x fewer tokens
- Mechanism: agent-as-a-judge code-review signal (cheaper than multi-round testing)

**Scientific paper writing**:
- Acceptance rate: 21.8% → 40.5% (1.78x-1.86x higher)
- Co-evolved writers + diverse agent-as-a-judge panel

**Olympiad-level math proofs**:
- Grader accuracy: 9% higher than static baseline
- Search cost: 3x lower

**Paper reviewing (bias correction)**:
- Problem: strongest baseline reviewer over-accepts AI papers at 1.91x human rate
- Solution: adversarial objective discovers reviewers equally stringent on AI and human
- Result: equal treatment while maintaining 80% ground-truth accuracy

## Core Mechanism: Controlled Utility Evolution

The RQGM organizes search into epochs:
1. Within each epoch, evaluator is frozen → stable signal
2. At epoch boundaries, utility can be updated
3. New evaluator must statistically beat old evaluator on held-out anchor data
4. Selective erasure: only discard scores from replaced evaluator, preserve other evidence

This ensures self-improvement guarantees hold per epoch while objectives evolve across epochs.

## Historical Context

**Gödel Machine (2003, Schmidhuber)**: Machine that proves self-modification is beneficial before executing. Practically impossible due to computational requirements.

**Darwin Gödel Machine (DGM) / Huxley Gödel Machine (HGM)**: Replace proof with evolution (mutation → test → survival). But evaluators remain static.

**RQGM**: Makes evaluation part of the improvement loop. Co-evolving evaluators and agents, inspired by Red Queen hypothesis (Van Valen 1973).

## Significance

1. **Novel framework**: First to make evaluation part of recursive self-improvement loop
2. **Practical results**: Strong improvements across code, papers, math
3. **Bias correction**: Fixes LLM tendency to over-accept AI-generated content
4. **Efficiency**: Significant token savings through smarter evaluation
5. **Theoretical foundation**: Extends Gödel Machine concept with evolutionary principles
