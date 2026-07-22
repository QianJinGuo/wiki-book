---
title: "SkillOS"
created: "2026-05-12"
updated: "2026-05-12"
type: raw
tags: [reinforcement-learning, skill-curation, self-evolving-agents, llm-agent, skill-repo, grpo, composite-rewards]
source_url: "https://arxiv.org/pdf/2605.06614.pdf"
ingested: "2026-05-12"
sha256: " provisional "
---
# SkillOS: Learning Skill Curation for Self-Evolving Agents
Siru Ouyang, Jun Yan, Yanfei Chen, Rujun Han, Zifeng Wang, Bhavana Dalvi Mishra, Rui Meng, Chun-Liang Li, Yizhu Jiao, Kaiwen Zha, Maohao Shen, Vishy Tirumalashetty, George Lee, Jiawei Han, Tomas Pfister, Chen-Yu Lee
University of Illinois Urbana-Champaign · Google Cloud AI Research · MIT
## Overview
SkillOS is an experience-driven RL training recipe for learning skill curation in self-evolving LLM agents. It pairs a frozen agent executor that retrieves and applies skills with a trainable skill curator that updates an external SkillRepo from accumulated experience.
## Core Architecture
```
Agent Executor (frozen πL) ←→ SkillRepo ←→ Skill Curator (trainable πS)
                    ↑
            Task streams with grouped dependencies
```
- **Agent Executor**: Frozen LLM that retrieves relevant skills from SkillRepo and solves tasks
- **Skill Curator**: Trainable component that updates SkillRepo via insert/update/delete operations
- **SkillRepo**: External repository of reusable skills, formatted as Markdown files with YAML frontmatter
## Training Methodology
### Training Instance Construction
Each training instance is a **group of related tasks**. Skills induced from earlier experiences are evaluated by their ability to improve later related tasks. This provides learning signals for long-horizon skill curation.
### Composite Rewards
$$r = r_{task} + \lambda_f r_{fc} + \lambda_u r_{cnt} + \lambda_c r_{comp}$$
| Signal | Description |
| --- | --- |
| $r_{task}$ | Task outcome reward — average success over remaining tasks in group |
| $r_{fc}$ | Function call validity — fraction of valid/generated function calls |
| $r_{cnt}$ | Content quality — external judge (Qwen3-32B) evaluation of skill quality |
| $r_{comp}$ | Compression — ratio of skill repository size to curator input context |
### Optimization
Uses **Grouped Reward Policy Optimization (GRPO)** for training stability and sample efficiency. Each training step samples a task group and starts with an empty SkillRepo.
## Key Results
| Metric | SkillOS | Strongest Baseline | Δ |
| --- | --- | --- | --- |
| Relative Performance | — | — | **+9.8%** |
| Interaction Steps | — | — | **−6.0%** |
The learned skill curator generalizes across different executor backbones, including **Gemini-2.5-Pro**. Notably, an 8B curator trained with SkillOS outperforms Gemini-2.5-Pro when used directly as the curator.
## Skill Format
Skills follow the Anthropic SKILL.md format:
- **YAML frontmatter**: name and natural-language description of when to use
- **Markdown instructions**: executable knowledge, workflows, constraints, reusable heuristics
## Key Insights
1. **Grouped task streams** provide denser feedback for learning complex curation operations
2. **The recipe is executor-agnostic** — works with different backbone models
3. **SkillRepo evolves** with richer internal structure and higher-level meta-skills over time
4. **Learned curator produces more targeted skill use** vs heuristic approaches
→ [[raw/articles/skillOS|原文存档]]