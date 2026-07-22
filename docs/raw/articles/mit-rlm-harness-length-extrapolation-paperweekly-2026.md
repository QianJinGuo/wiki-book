---
source_url: "https://mp.weixin.qq.com/s/GwwveRqcxk6ZEXVGqavUqw"
title: "MIT团队把泛化写进Harness：短任务训练，解锁32倍长度外推"
source: "PaperWeekly"
author: "PaperWeekly"
ingested: 2026-07-22
sha256: 5c921dc8f145a32982c0c02e598014f91b6b4bb7b7d380f23bb84e74c73dac1c
type: raw-article
tags: [harness, rlm, length-extrapolation, lid, compositional-generalization, mit]
---

# MIT团队把泛化写进Harness：短任务训练，解锁32倍长度外推

> 论文: Language model harnesses are compositional generalizers (Alex Zhang, Omar Khattab, MIT CSAIL, 2026)
> 只在 64K 任务上训练，RLM 策略延伸到约 200 万 token 评测

## 核心发现

从同一 30B 底座（Qwen3-30B-A3B-Instruct-2507）出发，分别训练 RLM 与 transformer 基线。模型只接触较短任务，评测长度达到训练时的 8-32 倍。RLM 在长任务上的评测增幅约为 transformer 基线的 10 倍。

## Harness 作为泛化变量

Harness 连接模型与外部环境，可以承载高层归纳偏置，让分解结构相近的任务呈现相近的模型轨迹（任务等价类）。根模型学到可跨任务复用的组织策略。

### LID（Locally In-Distribution）

常见 agent 将任务提示、工具输出和推理过程持续写入主上下文，输入形态逐渐偏离训练分布。LID 设计让 harness 尽量使每次模型调用接近训练阶段的输入分布。

### 两项核心机制

1. **上下文卸载（Context Offloading）**：任务数据以变量形式保存在外部程序环境中，根模型只接触任务结构
2. **程序化子 Agent 调用（Programmatic Sub-Agent Calls）**：子 agent 作为代码环境中的函数调用，结果保存在变量中

## 实验结果

| 任务 | 训练长度 | 评测长度 | 外推倍数 |
|------|---------|---------|---------|
| MRCRv2 | 64K | ~200万 | ~32x |
| GraphWalks | <128K | >100万 | ~8x+ |

同一 RLM Harness 下，训练后的 Qwen3-30B 在四项长任务中接近或超过 GPT-5.5 参考结果。

### 跨域迁移

训练任务（TREC 问题聚合、写作风格检索、twitter 立场检索）→ 评测换成（SPAM/HAM、数学推理、WildChat 错误对话）。RLM 在训练任务上提高时新领域评测也持续改善。

### 训练成本

RLM 耗时约为 transformer 基线的 1.5-3 倍，但任务继续变长后直接训练 transformer 成本增长更快。

## 链接

- 论文: https://arxiv.org/abs/2507.19457 (same paper as GEPA? No - different paper)
- 博客: https://alexzhang13.github.io/blog/2026/harness/
- 已有实体: [[entities/language-model-harnesses-compositional-generalizers-alex-zhang-2026]]
