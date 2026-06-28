# Ch16 推理优化与架构

> 让模型跑得更快：投机解码、MoE、PD 分离、量化

> 本章收录 **21 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 11 |
| ⭐⭐⭐ 专家 | 需ML基础 | 9 |

---

## 导读

模型训练好了，怎么高效地跑起来？

本章覆盖推理优化的核心技术：投机解码（DFlash 4.3× 吞吐提升）、MoE 架构（DeepSeek V4 万亿参数只激活一小部分）、PD 分离（Prefill 与 Decode 分开部署）、量化（从 FP16 到 INT4 的精度-速度权衡）。

你还会看到 Ben Thompson 的关键区分：Answer Inference（给人类答案）vs Agentic Inference（Agent 自主任务），以及为什么推理芯片的架构可能与训练芯片有本质不同。

推理成本是 AI 系统的"电费"——优化它就是优化商业模式。

---

## Ch16.001 从 Chroma 换成 Qdrant，我踩了 100 万向量的坑

→ [独立页面](ch16-001-从-chroma-换成-qdrant-我踩了-100-万向量的坑.html)

## Ch16.002 Build real-time voice applications with Amazon SageMaker AI and vLLM

→ [独立页面](ch16-002-build-real-time-voice-applications-with-amazon-sagemaker-ai-and-vllm.html)

## Ch16.003 Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护

→ [独立页面](ch16-003-apple-siri-私有推理-private-inference-不私有-三个对抗者都不受加密学保护.html)

## Ch16.004 glm5-scaling-pain-inference

→ [独立页面](ch16-004-glm5-scaling-pain-inference.html)

## Ch16.005 EAGLE-3 投机解码与 USP 长序列训练优化

→ [独立页面](ch16-005-eagle-3-投机解码与-usp-长序列训练优化.html)

## Ch16.006 PithTrain：陈天奇 + CMU Flame Center 推出的 agent-native MoE 训练框架（11K Python / 双重效率）

→ [独立页面](ch16-006-pithtrain-陈天奇-cmu-flame-center-推出的-agent-native-moe-训练框架-11k-python-双重效率.html)

## Ch16.007 具身智能 Sim-to-Real 迁移：主动推理、行为树与内在动机引擎的工程化方案

→ [独立页面](ch16-007-具身智能-sim-to-real-迁移-主动推理-行为树与内在动机引擎的工程化方案.html)

## Ch16.008 How to Calculate the Inference Efficiency Ratio

→ [独立页面](ch16-008-how-to-calculate-the-inference-efficiency-ratio.html)

## Ch16.009 Unlocking asynchronicity in continuous batching

→ [独立页面](ch16-009-unlocking-asynchronicity-in-continuous-batching.html)

## Ch16.010 SGLang

→ [独立页面](ch16-010-sglang.html)

## Ch16.011 End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

→ [独立页面](ch16-011-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe.html)

## Ch16.012 lightseek token speed inference

→ [独立页面](ch16-012-lightseek-token-speed-inference.html)

## Ch16.013 The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog

→ [独立页面](ch16-013-the-next-generation-of-speculative-decoding-dflash-and-spec-v2-lmsys-blog.html)

## Ch16.014 TLiveOmni vLLM 适配与量化方案

→ [独立页面](ch16-014-tliveomni-vllm-适配与量化方案.html)

## Ch16.015 vLLM V0→V1 迁移中的 logprob 差异修复

→ [独立页面](ch16-015-vllm-v0-v1-迁移中的-logprob-差异修复.html)

## Ch16.016 ServiceNow vLLM V0→V1 正确性修复

→ [独立页面](ch16-016-servicenow-vllm-v0-v1-正确性修复.html)

## Ch16.017 Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP

→ [独立页面](ch16-017-profiling-in-pytorch-part-2-from-nn-linear-to-a-fused-mlp.html)

## Ch16.018 elasticpp重塑elasticsearch查询性能的c内核引擎

→ [独立页面](ch16-018-elasticpp重塑elasticsearch查询性能的c内核引擎.html)

## Ch16.019 vLLM V0 to V1: Correctness Before Corrections in RL

→ [独立页面](ch16-019-vllm-v0-to-v1-correctness-before-corrections-in-rl.html)

## Ch16.020 Bonsai Image 4B: 1-bit 和 Ternary 量化

→ [独立页面](ch16-020-bonsai-image-4b-1-bit-和-ternary-量化.html)

## Ch16.021 pytorch in kernel recsys optimization

→ [独立页面](ch16-021-pytorch-in-kernel-recsys-optimization.html)

