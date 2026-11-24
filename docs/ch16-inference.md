# Ch16 推理优化与架构

> 让模型跑得更快：投机解码、MoE、PD 分离、量化

> 本章收录 **17 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 1 |
| ⭐⭐⭐ 专家 | 需ML基础 | 8 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 5 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 3 |

---

## 导读

模型训练好了，怎么高效地跑起来？

本章覆盖推理优化的核心技术：投机解码（DFlash 4.3× 吞吐提升）、MoE 架构（DeepSeek V4 万亿参数只激活一小部分）、PD 分离（Prefill 与 Decode 分开部署）、量化（从 FP16 到 INT4 的精度-速度权衡）。

你还会看到 Ben Thompson 的关键区分：Answer Inference（给人类答案）vs Agentic Inference（Agent 自主任务），以及为什么推理芯片的架构可能与训练芯片有本质不同。

推理成本是 AI 系统的"电费"——优化它就是优化商业模式。

---



---

## 本章内容

### ⭐⭐ 工程师（1 篇）

- [001. Pytorch in Kernel Recsys Optimization](ch16/001-pytorch-in-kernel-recsys-optimization)

### ⭐⭐⭐ 专家（8 篇）

- [002. 淘小蜜分流模型：把四分类做成候选 logits 选择（Jev 与 System One 的生产对照）](ch16/002-logits-jev-system-one)
- [003. GLM-5 Scaling 痛点与推理优化](ch16/003-glm-5-scaling)
- [004. 线性注意力到 KDA：固定状态如何演进，以及它在 vLLM 里怎么跑](ch16/004-kda-vllm)
- [005. Profiling in PyTorch (Part 2): From nn.Linear to a Fused MLP](ch16/005-profiling-in-pytorch-part-2-from-nn-linear-to-a-fused-mlp)
- [006. vLLM V0→V1 迁移中的 logprob 差异修复](ch16/006-vllm-v0-v1-logprob)
- [007. SGLang](ch16/007-sglang)
- [008. 从 Chroma 换成 Qdrant，我踩了 100 万向量的坑](ch16/008-chroma-qdrant-100)
- [009. How to Calculate the Inference Efficiency Ratio](ch16/009-how-to-calculate-the-inference-efficiency-ratio)

### ⭐⭐⭐⭐ 科学家（5 篇）

- [010. Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护](ch16/010-apple-siri-private-inference)
- [011. EAGLE-3 投机解码与 USP 长序列训练优化](ch16/011-eagle-3-usp)
- [012. LLM 推理流水线完整解析：Prefill-Decode 双阶段模型](ch16/012-llm-prefill-decode)
- [013. PithTrain：陈天奇 + CMU Flame Center 推出的 agent-native MoE 训练框架（11K Python / 双重效率）](ch16/013-pithtrain-cmu-flame-center-agent-native-moe-11k-pyth)
- [014. 具身智能 Sim-to-Real 迁移：主动推理、行为树与内在动机引擎的工程化方案](ch16/014-sim-to-real)

### ⭐⭐⭐⭐⭐ 大师（3 篇）

- [015. 手机应用原生大模型：先定预算，再定架构](ch16/015-page-015)
- [016. Build real-time voice applications with Amazon SageMaker AI and vLLM](ch16/016-build-real-time-voice-applications-with-amazon-sagemaker-ai)
- [017. The next generation of speculative decoding: DFlash and Spec V2 - LMSYS Blog](ch16/017-the-next-generation-of-speculative-decoding-dflash-and-spec)


---

## 本章收束

推理成本是 AI 系统的"电费"——优化它就是优化商业模式。这一章的技术谱系（投机解码、量化、PD 分离、MoE）看似离散，实际都在做一个权衡：用多少工程复杂度，换多少每 token 成本与延迟。Ben Thompson 的区分值得记住：给人答案的推理和给 Agent 用的推理，正在变成两种不同的基础设施。

---
