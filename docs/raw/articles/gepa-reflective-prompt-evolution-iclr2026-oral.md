---
source_url: "https://mp.weixin.qq.com/s/dxXAMzZDQtmlYjXHvGseGQ"
title: "GEPA：让 LLM 用反思进化提示词，样本效率甚至超过强化学习"
source: "爱折腾研究组"
author: "爱折腾的小七"
ingested: 2026-07-22
sha256: 02b1d40809a72ca2fa6911b564fdd7c986de4026f56c07ff8652b927385b1994
type: raw-article
tags: [gepa, prompt-evolution, reflection, iclr2026, llm-workflow, compound-ai-system, prompt-optimization]
---

# GEPA：让 LLM 用反思进化提示词，样本效率甚至超过强化学习

> 论文: GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning
> ICLR 2026 Oral | UC Berkeley, Stanford, Databricks, MIT
> https://arxiv.org/abs/2507.19457 | https://github.com/gepa-ai/gepa

## 一句话概述

GEPA 提出了一种面向 LLM workflow 和 agent 的提示词优化方法：它不更新模型权重，而是让模型阅读自己的执行轨迹、错误反馈和评分结果，用自然语言反思出新的 prompt，并通过 Pareto frontier 保留多条有潜力的进化路线。

在 6 个任务上，GEPA 在 Qwen3-8B 上平均比 GRPO 高 6%（最多高 20%），同时 rollout 数量最少少 35 倍。

## 核心方法

### 问题形式

Compound AI system 记作 Φ = (M, C, X, Y)，其中 M 是多语言模块，C 是控制流，X/Y 是输入输出 schema。GEPA 固定模型权重，只优化 prompt 集合 Π。

### 五步主循环

1. **初始化候选池**：从人工/默认 prompt 开始
2. **选择候选和模块**：从候选池中挑一个候选 + round-robin 选模块
3. **执行 minibatch rollouts**：不只记录分数，还记录轨迹、工具结果和评价器反馈
4. **反思并改写 prompt**：reflection LM 根据轨迹和反馈生成新 prompt
5. **只保留有效改动**：新 prompt 在 minibatch 上超过父候选才加入候选池

### 反思变异（Reflective Prompt Mutation）

把 rollout 中的语言证据作为诊断材料（编译错误、运行错误、性能 profiling、rubric 分数等），提炼成高层规则写回 prompt。学到的不是样本答案，而是"遇到这类输入时应该采用什么策略"。

### Pareto 选择

维护 instance-wise Pareto frontier：对每个训练样本，记录哪些候选拿到最高分。候选在多少样本上领先就按比例加权抽样。避免贪心搜索过早陷入局部最优。

### System-aware Merge

对于多模块工作流，比较两个候选在不同模块上的演化历史，从各自更有贡献的分支中选择模块 prompt，合成新候选。

## 实验结果

### Qwen3-8B

| 方法 | HotpotQA | IFBench | HoVer | PUPA | AIME-2025 | LiveBench-Math | Aggregate Improvement |
|------|----------|---------|-------|------|-----------|----------------|---------------------|
| Baseline | 42.33 | 36.90 | 35.33 | 80.82 | 27.33 | 48.70 | — |
| GRPO | 43.33 | 35.88 | 38.67 | 86.66 | 38.00 | 51.26 | +3.68 |
| MIPROv2 | 55.33 | 36.22 | 47.33 | 81.55 | 20.00 | 46.60 | +2.61 |
| **GEPA** | **62.33** | **38.61** | **52.33** | **91.85** | 32.00 | 51.95 | **+9.62** |
| GEPA+Merge | 64.33 | 28.23 | 51.67 | 86.26 | 32.00 | 51.95 | +7.17 |

样本效率：GRPO 每个任务使用 24,000 rollouts；GEPA 平均约 3,936 rollouts，到达最优测试表现只需 79 到 737 次 train rollouts。

### GPT-4.1 Mini

| 方法 | HotpotQA | IFBench | HoVer | PUPA | AIME-2025 | LiveBench-Math | Aggregate Improvement |
|------|----------|---------|-------|------|-----------|----------------|---------------------|
| Baseline | 38.00 | 47.79 | 46.33 | 78.57 | 49.33 | 58.20 | — |
| GEPA | 69.00 | 52.72 | 51.67 | 94.47 | 59.33 | 64.13 | **+12.19** |
| GEPA+Merge | 65.67 | 55.95 | 56.67 | 96.46 | 59.33 | 64.13 | **+13.33** |
| **GEPA-Qwen-Opt**（跨模型迁移） | 65.67 | 49.83 | 54.67 | 90.05 | 52.67 | 59.31 | **+9.00** |

GEPA 在 Qwen3-8B 上优化出的 prompt 迁移到 GPT-4.1 Mini 上仍有 +9.00 的提升，说明学到的规则具有跨模型迁移性。

### 消融：候选选择策略

| 策略 | Aggregate Improvement |
|------|---------------------|
| SelectBestCandidate | +6.05 |
| BeamSearch | +5.11 |
| **GEPA Pareto** | **+12.44** |

## 与现有实体的关系

已有 [[entities/gepa-optimize-anything]]（聚焦 optimize_anything API 产品层）。本文补充论文级别的核心技术方法细节、完整 Benchmark 数据和跨模型迁移验证。

## 链接

- 论文: https://arxiv.org/abs/2507.19457
- 代码: https://github.com/gepa-ai/gepa
- 项目主页: https://gepa-ai.github.io/gepa/
