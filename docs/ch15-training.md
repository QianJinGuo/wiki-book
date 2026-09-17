# Ch15 训练与微调

> 打造专属模型：PPO → DPO → GRPO，合成数据，课程学习

> 本章收录 **27 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 3 |
| ⭐⭐ 工程师 | 需编程基础 | 2 |
| ⭐⭐⭐ 专家 | 需ML基础 | 14 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 4 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 4 |

---

## 导读

通用模型很强，但你的场景需要专属模型。

本章从 RLHF 的经典 PPO 开始，经过 DPO（直接偏好优化）、GRPO（群组相对策略优化），到 Self-Taught RLVR（自我教学的强化学习与验证奖励）。你会看到在线蒸馏 vs 离线蒸馏的数学原理与实战对比，以及 PRISM（ICML 2026 的并行残差迭代序列模型）如何用线性注意力突破 Transformer 瓶颈。

不是每个场景都需要微调——但理解微调能让你选对策略。有时候，一个好的提示词比一个微调模型更有效。

---



---

## 本章内容

### ⭐ 入门（3 篇）

- [001. 2026 年面向 LLM 的 RL 方法总结：从 PPO 到 DPO 到 GRPO，再到多智能体 RL](ch15/001-2026-llm-rl-ppo-dpo-grpo-rl)
- [002. Predicting Risk in Content Launches](ch15/002-predicting-risk-in-content-launches)
- [003. 多模态预训练物理：知识流、模态协同、早期统一与高效配方（arXiv 2608.05000）](ch15/003-arxiv-2608-05000)

### ⭐⭐ 工程师（2 篇）

- [004. 不用人类手写训练框架了！AI自己写代码，训出1B端侧「小钢炮」](ch15/004-ai-1b)
- [005. EMO: Pretraining mixture of experts for emergent modularity | Ai2](ch15/005-emo-pretraining-mixture-of-experts-for-emergent-modularity)

### ⭐⭐⭐ 专家（14 篇）

- [006. DeepSeek V4 训练方法论深度解读](ch15/006-deepseek-v4)
- [007. NVIDIA Blackwell MLPerf Training 6.0 基准测试结果（2026-06）](ch15/007-nvidia-blackwell-mlperf-training-6-0-2026-06)
- [008. Yann Dubois（OpenAI Post-Training）× Matt Turck 深度访谈：GPT-5.5、RL 突破、后训练流水线](ch15/008-yann-dubois-openai-post-training-matt-turck-gpt-5-5-rl)
- [009. SFT+DPO 双阶段微调：Qwen3-1.7B Tool Calling 精度提升方案](ch15/009-sft-dpo-qwen3-1-7b-tool-calling)
- [010. 无惧Off-Policy偏移！Bengio团队解绑后训练，大模型RL提速50倍](ch15/010-off-policy-bengio-rl-50)
- [011. Is One Layer Enough? 单层 RL 训练可超越全参数训练](ch15/011-is-one-layer-enough-rl)
- [012. PhoneWorld (arxiv 2605.29486)：腾讯混元+港中深+人大+武大 规模化可训练 mock Android 环境基础设施（机器之心解读）](ch15/012-phoneworld-arxiv-2605-29486-mock-android)
- [013. LLM Post-Training全景指南：从RLHF到GRPO再到AgenticRL](ch15/013-llm-post-training-rlhf-grpo-agenticrl)
- [014. What I've been building: ATOM Report, post-training course, finishing my book, and ongoing research](ch15/014-what-i-ve-been-building-atom-report-post-training-course)
- [015. Reinforcing Recursive Language Models | alphaXiv](ch15/015-reinforcing-recursive-language-models-alphaxiv)
- [016. 百度文心大模型后训练进化（ERNIE 3.0→5.0）](ch15/016-ernie-3-0-5-0)
- [017. Overcoming Reward Signal Challenges: Verifiable Rewards-based RL with GRPO on SageMaker AI](ch15/017-overcoming-reward-signal-challenges-verifiable-rewards-base)
- [018. Heidi Health 临床 AI 微调：小模型通过偏好信号达前沿水平](ch15/018-heidi-health-ai)
- [019. Notes on pretraining parallelisms and failed training runs.](ch15/019-notes-on-pretraining-parallelisms-and-failed-training-runs)

### ⭐⭐⭐⭐ 科学家（4 篇）

- [020. 在线蒸馏OPD vs 离线蒸馏SFT：数学原理与实战优势](ch15/020-opd-vs-sft)
- [021. RL Beyond the Verifiable: 当奖励信号无法自动验证时](ch15/021-rl-beyond-the-verifiable)
- [022. ICML 2026 | PRISM: Parallel Residual Iterative Sequence Model](ch15/022-icml-2026-prism-parallel-residual-iterative-sequence-mode)
- [023. NVIDIA-ZPPO: Zone of Proximal Policy Optimization](ch15/023-nvidia-zppo-zone-of-proximal-policy-optimization)

### ⭐⭐⭐⭐⭐ 大师（4 篇）

- [024. Generalization Dynamics of LM Pre-training — Jiaxin Wen](ch15/024-generalization-dynamics-of-lm-pre-training-jiaxin-wen)
- [025. Mind Lab LoRA 持续学习体系：δ-mem + MinT + LoRA Scaling Law + Macaron-A2UI](ch15/025-mind-lab-lora-mem-mint-lora-scaling-law-macaron-a2)
- [026. Fine-Tuning Cosmos](ch15/026-fine-tuning-cosmos)
- [027. SFT, RL, and On-Policy Distillation Through a Distributional Lens](ch15/027-sft-rl-and-on-policy-distillation-through-a-distributional)


---

## 本章收束

不是每个场景都需要微调——但理解微调才能选对策略。这一章的演进线（PPO→DPO→GRPO→RLVR）背后是同一个问题：奖励信号从哪里来、有多可靠。有时候一个好提示词胜过一个微调模型；但当你需要模型内化一种能力而非模仿一种格式时，这一章给了你完整的路线图。

---
