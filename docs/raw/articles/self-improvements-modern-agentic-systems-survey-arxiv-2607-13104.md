---
title: "Self-Improvements in Modern Agentic Systems: A Survey"
sha256: skip
type: source
source_url: "https://arxiv.org/abs/2607.13104"
tags: [article, survey, self-improvement, agent, harness]
review_value: 9
review_confidence: 9
review_recommendation: strong
ingested: 2026-07-27
review_stars: 5
created: 2026-07-27
updated: 2026-07-27
---

# Self-Improvements in Modern Agentic Systems: A Survey

**Authors**: Zhe Ren, Yimeng Chen, Dandan Guo, Guowei Rong, Tonghui Li, R.B. Xiong, Qingfeng Lan, Wenyi Wang, Li Nanbo, Yibo Yang, Mingchen Zhuge, Jürgen Schmidhuber

**Affiliations**: Jilin University, KAUST, University of Alberta, IDSIA/USI/SUPSI

**arXiv**: 2607.13104, July 14, 2026

**Project Page**: [Self-Improving-Agents](https://github.com/Self-Improving-Agents)

## Abstract

Self-improving autonomous agents are moving from research prototypes to deployed systems. The primary goal is controllable evolution, or adaptation, from experience with minimal or even no human input. This survey frames modern self-improving agents as adaptive systems that convert experience into accumulated capability gains.

## Core Framework

A modern agent is formalized as a configuration coupling a foundation model with an operational scaffold:

**At = (θt, Σt), where Σt := (pt, mt, Tt, gt)**

- **pt**: Structured prompts / system instructions
- **mt**: Memory (storage, retrieval, update strategies)
- **Tt**: External tools and invocation interfaces
- **gt**: Control logic (routing, scheduling, safety constraints)

Self-improvement is formalized as a **self-induced update operator U** that obtains and commits updates to model parameters (θ) or scaffold components (Σ).

## Two-Pathway Taxonomy

### Pathway 1: Foundation Model Improvement (θ update, Σ frozen)

1. **Intrinsic Generative Demonstrations** (§5.1) — Agent self-synthesizes training data for SFT. Key challenge: model collapse, knowledge bubbles. Mitigations: retain base data, external verifiers, diversity-aware pool expansion.
2. **Intrinsic Evaluative Feedback** (§5.2) — Self-judged scores/preferences/critique for RL/DPO training. Three sub-types: rubric feedback, consistency feedback, corrective feedback. Key risk: evaluator-policy coupling amplifies blind spots.
3. **Extrinsic Exploratory Experience** (§5.3) — Trajectories from environment interaction drive RL training. Two modes: grounded (real task environments) and simulated (world model proxies). Key challenges: reward sparsity, reward hacking, capability regression.

### Pathway 2: Scaffolding Improvement (Σ update, θ frozen)

1. **Prompt** (§6.1) — Four paradigms: scalar-feedback optimization (APE, OPRO), qualitative-feedback refinement (Reflexion, Self-Refine), population-based evolution (Promptbreeder, GPTSwarm), textual gradient optimization (TextGrad, MetaTextGrad).
2. **Memory** (§6.2) — Three dimensions: memory object (explicit vs implicit), memory structure (flat/hierarchical/graph/vector), memory processing (CRUD + selection/governance). Representative: Generative Agents, Mem0, MemoryBank, A-MEM.
3. **Tool** (§6.3) — Three sub-mechanisms: dynamic tool routing (ToolNet, MCP-Flow, MCP-Zero), iterative tool refinement (VOYAGER, DRAFT), autonomous tool creation (Alita/Code2MCP, TOOLMAKER).
4. **Full Scaffolding** (§6.4) — Self-referential code modification. The updater and the system being updated co-evolve. Key methods: Gödel Machine series (Gödel Agent, Darwin Gödel Machine), evolutionary frameworks (AlphaEvolve, ShinkaEvolve, ADAS, STOP), symbolic learning (Agent Symbolic Learning).

## Application Domains (§7)

- Software Engineering (DGM/HGM, Live-SWE-Agent)
- Web Navigation and Automation (WebRL, WebEvolver, SkillWeaver)
- Gaming and Strategic Reasoning (Voyager, SPAG, MARSHAL)
- Scientific Discovery (AI Scientist, ChemCrow, SciAgents)
- Embodied AI and Robotics (RoboCat, AutoRT)
- General Computer Control (UI-Genie, OS-Copilot, SEAgent)

## Evaluation (§8)

- Must report full learning curves, not peak scores
- Fixed-budget performance trajectories
- Transfer testing (generalization to unseen distribution)
- Track regression rates and safety violations
- Judge-based measurement needs protection against over-optimization to judge biases

## Key Design Insights (§9)

- **Fast-Slow Dual Loop**: Σ improvement (fast adaptation) vs θ improvement (slow consolidation) — structurally asymmetric. When feedback is noisy, validate within scaffold first, distill into parameters only after stabilization.
- **Judge as Governance Infrastructure**: The evaluator is not a passive benchmark but an attack surface — must be decoupled from the generator.
- **Layered Gated Safety**: Self-improvement should be treated as untrusted code executing in a protected runtime; every structural update must pass validator gates.

## Six Future Directions

1. Test-time continuous adaptation
2. Active exploration and curiosity-driven learning
3. Parameter distillation and joint optimization (System 2 → System 1)
4. Resource-constrained improvement dynamics
5. Multi-agent collaborative co-evolution
6. Robustness under open-world distribution shift
