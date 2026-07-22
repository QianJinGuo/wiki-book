---
source_url: https://arxiv.org/abs/2605.31268
source: arxiv
arxiv_id: "2605.31268"
title: "Mellum2 Technical Report"
authors: ["Nikiita Pavlichenko et al. (JetBrains)"]
published: 2026-05-29
ingested: 2026-06-03
sha256: pending
---

# Mellum2 Technical Report

**Source**: https://arxiv.org/abs/2605.31268 (arXiv:2605.31268 [cs.CL])
**Authors**: Nikiita Pavlichenko et al. (JetBrains)
**Published**: 2026-05-29

## Abstract

> We present Mellum 2, an open-weight 12B-parameter Mixture-of-Experts (MoE) language model with 2.5B active parameters per token. Mellum 2 is a general-purpose language model specialized in software engineering, spanning code generation and editing, debugging, multi-step reasoning, tool use and function calling, agentic coding, and conversational programming assistance, and it is the successor to the completion-focused 4B dense Mellum model.

## Architecture Details

- **MoE configuration**: 64 experts, 8 active per token
- **Grouped-Query Attention**: 4 KV heads
- **Sliding Window Attention**: applied to three of every four layers
- **Multi-Token Prediction head**: doubles as both auxiliary pre-training objective AND built-in draft model for speculative decoding
- **Design constraint**: inference efficiency on commodity GPUs validated each architectural choice via ablation

## Pre-training

- **Token count**: ~10.6 trillion tokens
- **Curriculum**: 3-phase progressive shift from diverse web -> curated code + math
- **Optimizer**: Muon
- **Precision**: FP8 hybrid
- **Schedule**: Warmup-Hold-Decay with linear decay to zero
- **Context extension**: 128K via layer-selective YaRN

## Post-training

Two stages:
1. **Supervised fine-tuning (SFT)**
2. **RLVR** (Reinforcement Learning with Verifiable Rewards)

Two released variants:
- **Instruct**: direct answer
- **Thinking**: emits explicit reasoning trace before final answer

## Benchmark Performance

Competitive with open-weight baselines in the 4B-14B range while running at per-token compute of a 2.5B dense model. Coverage: code generation, math/reasoning, tool use, knowledge, safety.

## License

Apache 2.0 — base, instruct, thinking checkpoints all released.

## Submission History

v1: 2026-05-29 13:01:11 UTC (1,508 KB)
