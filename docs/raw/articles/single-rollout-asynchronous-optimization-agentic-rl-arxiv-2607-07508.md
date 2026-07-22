---
source: newsletter
source_url: https://arxiv.org/abs/2607.07508
ingested: 2026-07-10
sha256: 75ca913daab0701acc9558eabcc023b45f09f35086c90aa7eee04804e2db1c27
title: "Single-Rollout Asynchronous Optimization for Agentic Reinforcement Learning"
vxc_score: 49 (heuristic - LLM API unavailable)
---

# [2607.07508] Single-Rollout Asynchronous Optimization for Agentic Reinforcement Learning

Authors: Zhenyu Hou, Yujiang Li, Jie Tang, Yuxiao Dong

Submitted on 8 Jul 2026

**Abstract:** Reinforcement learning (RL) is becoming increasingly important for post-training large language models (LLMs). Previous RL pipelines for LLMs were mostly synchronous and batch-interleaved, which is inefficient for long-horizon agentic tasks. Recently, asynchronous RL has emerged as a more efficient alternative by updating the model as rollouts arrive. However, existing asynchronous RL systems often emphasize throughput, while leaving training stability and task effectiveness largely underexplored. For example, a key challenge is that group-wise sampling in the widely-used GRPO framework does not naturally fit asynchronous agentic training. In this paper, we present Single-rollout Asynchronous Optimization (SAO) to address the stability and off-policy challenges in asynchronous agentic RL. SAO adopts a single-rollout sampling strategy to ensure stable and unbiased policy gradient estimation, an unbiased adjustment for off-policy corrections, and also incorporates a lightweight critic for variance reduction. On standard RL benchmarks, SAO achieves 2.5x training throughput compared to synchronous baselines while maintaining comparable or superior performance. In agentic tasks, SAO improves the pass rate by 8.8% over the synchronous counterpart and achieves 1.6x MFU, demonstrating significant potential for RL-based LLM post-training in agentic scenarios.
