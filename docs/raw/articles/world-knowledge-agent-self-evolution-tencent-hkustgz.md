---
title: "让 Agent 在没有任务、没有奖励时先学会"认识世界""
type: raw
tags: [agent, self-improvement, world-knowledge, reinforcement-learning, web-agent, tencent]
source_url: "https://mp.weixin.qq.com/s/LjhOh9-15SwyZ8bXt1URVQ"
ingested: 2026-05-28
paper: "arXiv:2604.18131v1"
sha256: 23fd2ac96b5257fa8aa99cfffcc4259a92eb11e8060cbedac7957e83000288b4
---

# 让 Agent 在没有任务、没有奖励时先学会"认识世界"

**来源**：爱折腾的小七 / 爱折腾研究组（2026-05-13）
**论文**：Training LLM Agents for Spontaneous, Reward-Free Self-Evolution via World Knowledge Exploration
**机构**：Tencent; HKUST(GZ)
**arXiv**：2604.18131v1（2026-04-20）

## 核心结论

论文提出让 Agent 在无任务、无奖励情况下，通过"原生进化"（Native Evolution）主动探索环境并生成 World Knowledge（世界知识）——一份结构化 Markdown 环境认知文档，使 Agent 从"现找答案"变为"先有地图再找答案"。

训练时用 outcome-based reward 评估知识质量，推理时完全不需要奖励。

## 核心概念

### World Knowledge

针对具体环境的可复用环境认知，以 Markdown 形式存储。包含：页面结构、跳转关系、核心组织逻辑等。

特点：易加载到上下文、可插拔、显式可迁移。

### 三代自进化 Agent

1. **Experience-Driven Evolution**：基于经验+外部奖励更新，本质仍是"在教材里学习"
2. **Adversarial Evolution**：challenger-solver 对抗生成任务，仍依赖重工程化流程
3. **Meta-Learning-Driven Evolution（本文）**：先探索环境，再压缩成世界知识，再执行任务

## 两阶段方法

### 第一阶段：Native Evolution Phase（原生进化阶段）

无任务、无奖励、无人工验证，Agent 主动执行：
1. **Planning**：规划探索路线
2. **Exploring**：进入环境交互观察
3. **Summarizing**：整理观察摘要
4. **Refining**：压缩提炼成高质量 World Knowledge K

### 第二阶段：Knowledge-Enhanced Execution Phase（知识增强执行阶段）

下游任务到来时，将 K 一起带入上下文完成任务。

行为模式从"看见网页→现找答案"变为"先有环境地图→再带地图找答案"。

## 训练流程

### SFT（监督微调）

使用 Gemini-2.5-Pro 作为 teacher model，生成高质量探索轨迹：
- 每环境生成 3 份候选 world knowledge
- 用 outcome-based reward 选出表现最好的 K* 及其轨迹
- 最终保留 expert trajectory 平均 374.8 步，每步平均 3322.4 tokens

### RFT（基于强化学习的拒绝采样）

- 让模型自己探索，生成多份候选 K
- 用下游任务收益排序，只保留高分轨迹
- 共两轮 RFT

### Outcome-Based Reward

R(K) = Success(T_E | K) - Success(T_E | ∅)

衡量 world knowledge 最终有没有帮到后续任务表现，而非探索过程每步打分。

## 核心实验结论

- Qwen3-30B-A3B：WebWalker 22.04→40.91（+18.87），WebVoyager 41.08→57.44（+16.36）
- Seed-OSS-36B：WebWalker 16.26→37.50（+21.24），WebVoyager 39.93→56.79（+16.86）
- 无训练 base model 即使被要求总结环境，世界知识反而可能拖累任务（越帮越忙）
- 训练后 world knowledge 带来约 20% 绝对提升
- 模型可超过 teacher prompt 表现
- World Knowledge 跨模型迁移有效：Qwen3-14B+K 超过未辅助的 Gemini-2.5-Flash

## 效率改善

Qwen3-30B 加入 world knowledge 后，执行步数平均下降约 17%：
- Conference：25.65→20.64
- Game：23.26→20.31
- Organization：17.96→13.92
- Education：30.25→25.34

## 知识长度分析

- 0→8k-16k：性能提升明显
- 8k-16k 最优区间（Game 域：39.71）
- 16k-32k 边际收益（Game 域：41.56）
- 32k-64k 开始下降（Game 域：40.72）

关键在于压缩质量，而非越长越好。

## 跨模型迁移

测试 Qwen3-14B、GPT-oss-120B、Kimi-K2-Turbo、Gemini-2.5-Flash，均获显著增益：
- Conference 域：Qwen3-14B+K 达到 35.6%，未辅助 Gemini-2.5-Flash 仅 31.3%
- Game 域：Qwen3-14B+K 达到 30.5%，未辅助 Gemini-2.5-Flash 仅 25.7%

## 论文不足

1. 训练阶段仍需标注任务，未完全脱离监督
2. 验证场景主要在网页，多模态 GUI/具身环境未充分验证
3. 探索成本高（374.8 步/expert trajectory）
4. World Knowledge 静态 Markdown，缺显式校验与持续更新机制
5. 跨环境泛化能力待验证

## 未来方向

1. 静态 Markdown → 可执行结构化世界模型（图结构知识库）
2. 加入不确定性感知和 value of information 驱动的主动探索
3. world knowledge 版本化与持续维护
4. 扩展到代码、GUI、具身环境
5. 可证据化知识压缩（带来源链接、支持回跳验证）
