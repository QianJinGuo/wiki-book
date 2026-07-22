---
title: "vllm v0 to v1 correctness before corrections"
source_url: https://huggingface.co/blog/ServiceNow-AI/correctness-before-corrections
ingested: 2026-05-08
sha256: PLACEHOLDER
review_value: 9
review_confidence: 9
review_recommendation: strong
review_stars: 5
source_feed: TLDR AI (newsletter)
source_published: 2026-05-06
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [newsletter, security]
---
# vLLM V0 to V1: Correctness Before Corrections in RL
ServiceNow-AI 团队在从 vLLM V0 到 V1 的迁移中遇到的 train-inference mismatch 问题及其修复经验。核心发现：vLLM V1 返回的 logprobs 默认是 raw model outputs（未经 temperature/penalty/filter 后处理），而 PipelineRL 期望的是 processed distribution 的 logprobs。
## 修复的四个问题
1. **Logprob Semantics**: V1 默认返回 raw logprobs → 需设置 logprobs-mode=processed_logprobs
2. **Runtime Defaults**: V1 的 prefix caching / async scheduling 导致与 V0 不同的执行路径 → 显式关闭
3. **Inflight Weight Updates**: weight-update 路径在 V1 中行为不同
4. **fp32 lm_head**: 确保 final projection 的精度对齐
## 关键配置
```
vllm_config:
  use_v1: true
  vllm_kwargs:
    logprobs-mode: processed_logprobs
    enable-prefix-caching: false
    async-scheduling: false
```
## 教训
- 先修复 backend behavior 差异，再调整 RL objective
- Clip rate 是最容易读到的 mismatch 信号
- 问题不仅限于 GSPO，PPO/GRPO 等所有使用 rollout-side logprobs 的 online RL 都会受影响