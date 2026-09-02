---
title: "LOPD: Latent On-Policy Self-Distillation — 让 Agent 真正\"吃掉\"自己的经验"
source_url: "https://mp.weixin.qq.com/s/dtHuM7tH0dKMdmOH5azmlA"
ingested: "2026-09-02"
sha256: "a36c81a1443efef6bba9c24d9080433eba7563991ed85efd4e820e453c0fe21c"
author: "爱折腾的小七"
account: "爱折腾研究组"
arxiv: "2608.13040v1"
tags: [on-policy-distillation, agent, latent-representation, privileged-context, self-distillation]
---

# LOPD: Latent On-Policy Self-Distillation — 让 Agent 真正"吃掉"自己的经验

> **来源**：爱折腾研究组（微信公众号）
> **论文**：arXiv:2608.13040v1（2026-08-13），Guibin Zhang et al.
> **机构**：NUS / BUPT / SJTU
> **代码**：https://github.com/bingreeky/LOPD
> **模型**：Qwen3-8B-LOPD, Olmo3-7B-LOPD

## 一句话概述

LOPD（Latent On-Policy Self-Distillation）让模型自己学习：应该从历史成功轨迹中保留什么，以及用什么形式把这些经验交给"自教师"。训练时教师额外看到由历史经验压缩而成的连续 latent tokens；训练完成后，检索器、经验库、composer 和教师全部丢掉，上线的只有学生模型。

## 核心方法

### 1. 经验库
离线保留成功 rollout（observation-lite 格式），用 Qwen3-Embedding-8B + FAISS 精确内积检索，默认取 top-3 相似经验。

### 2. Encoder → Latent Tokens
冻结主干 + rank-8 LoRA adapter 编码，QFormer-style compressor（8 层 cross-attention）把每条变长经验压成 32 个 latent tokens。3 条经验 = 96 个连续 token 位置。先用成功轨迹 cold-start。

### 3. On-Policy 蒸馏
学生按当前策略生成轨迹（不看 latent context）；冻结教师在相同前缀上重新计算 next-token 分布（额外读取 96 latent tokens）。保留 top-20 高概率 token + tail bucket，学生通过 reverse KL 拟合教师。

### 4. Privileged Margin
防止 composer 作弊（让教师分布靠近学生 = 什么也没学到）。定义 token-level 教师优势 = 教师对采样 token 的 log-prob - 学生自己的 log-prob，经 outcome weighting（A(τ)=2r-1），要求优势至少达到 margin m=0.05。

### 5. 部署
只保留学生策略。经验库、检索器、composer、latent context 和教师前向均不再需要。

## 实验结果

**工具调用**：
- Qwen3-4B：EnvScaler 63.7 / BFCL-v3 27.38 / ACEBench 60.6（最强基线 61.8/25.25/56.0）
- Qwen3-8B：EnvScaler 66.4 / BFCL-v3 29.88 / ACEBench 62.7（最强基线 60.2/29.00/58.0）

**代码生成**：
- Olmo3-7B：LiveCodeBench 50.98 / EvalPlus 78.41（跨模型家族有效）

**关键消融**：
- 无 margin（m=0）→ 0.551（坍缩），m=0.05 → 0.637（最优）
- 32 latent tokens 是最低容量门槛（8/16 太少，64/128 无额外收益）
- 行为变化：更多环境步骤但每步工具调用从 3.50 降到 1.11，更序列化

## 局限
- 训练计算成本未对齐（无 FLOPs/显存/墙钟时间对比）
- 依赖成功 rollout 经验库
- 评测限于 4B-8B 模型、工具调用 + Python 竞赛编程
- 可解释性证据初步（LM-head projection 不可读）
- arXiv v1 未经同行评审
