---
title: "TaoLive Digital Avatar Agent Technical Report: Training Agents to Evolve with Their Harness"
source_url: "https://arxiv.org/abs/2608.15763"
ingested: 2026-08-22
score: 56
stars: 4
value: 8
confidence: 7
source: arxiv
tags: [agent, harness, post-training, skill, arxiv, digital-avatar, agentic-rl]
sha256: 3b530384c157c34e913918ebb4b7592c778696506f6e16b162ac3ad010421c73
---

# TaoLive Digital Avatar Agent Technical Report: Training Agents to Evolve with Their Harness

- **arXiv**: 2608.15763 (cs.CL), submitted 2026-08-16
- **作者**: TaoLive AIGC LLM Team — Yuhan Sun, Wenhao Lin, Yongdong Luo, Yibo Hu, Meiguang Jin, Junfeng Ma, Weihang Pan, Jiaxin Zhao, Zulong Chen

## Abstract

AI-powered digital-avatar streamers in live e-commerce must answer product questions, engage viewers, and execute changing business strategies in real time. This requires low latency, factual and effective replies, and rapid adaptation to updated campaign, compliance, and style requirements.

The authors develop an **evolvable Harness** that decouples Skills, Hooks, system prompts, and tools from model weights, allowing runtime behavior to change without retraining. However, Harness evolution creates a moving execution environment: compact models fine-tuned on one configuration may memorize names, schemas, and prompt templates rather than follow the Harness currently provided, while stronger zero-shot models are too slow for real-time use.

To address this tension, the paper proposes **Harness-Aware Training (HAT)**, which makes Harness states part of the training distribution. HAT applies task-preserving **Harness-State Augmentation (HSA)** to Skills, tool schemas, prompt structures, and interaction constraints, and comprises three stages:
1. HSA-based supervised fine-tuning
2. general on-policy distillation to recover general capabilities
3. HSA-based agentic reinforcement learning in a production-informed live-room simulator

Across four evaluation sets with more than 4,500 cases, the compact 35B model scores **94.8 on real-world Live-Stream QA** (vs 80.3 base model and 93.0 for the strongest evaluated general LLM), **94.6 on Harness-Variant QA**, and retains **83.5 on IFEval**. By contrast, fixed-Harness SFT reduces IFEval by 7.7 points. In a controlled complete-agent replay on one NVIDIA H20 GPU with MTP enabled, the system achieves 3.407 s P50 and 8.114 s P95 latency.

These results show that HAT produces a latency-feasible compact agent that remains effective under evaluated Harness changes without sacrificing general instruction following.

→ 原文：[[raw/articles/taolive-digital-avatar-agent-harness-aware-training-arxiv-2608-15763|arXiv 存档]]
