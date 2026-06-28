# Ch15 训练与微调

> 打造专属模型：PPO → DPO → GRPO，合成数据，课程学习

> 本章收录 **34 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 10 |
| ⭐⭐⭐ 专家 | 需ML基础 | 20 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 4 |

---

## 导读

通用模型很强，但你的场景需要专属模型。

本章从 RLHF 的经典 PPO 开始，经过 DPO（直接偏好优化）、GRPO（群组相对策略优化），到 Self-Taught RLVR（自我教学的强化学习与验证奖励）。你会看到在线蒸馏 vs 离线蒸馏的数学原理与实战对比，以及 PRISM（ICML 2026 的并行残差迭代序列模型）如何用线性注意力突破 Transformer 瓶颈。

不是每个场景都需要微调——但理解微调能让你选对策略。有时候，一个好的提示词比一个微调模型更有效。

---

## Ch15.001 What I’ve been building: ATOM Report, post-training course, finishing my book, and ongoing research

→ [独立页面](ch15-001-what-i-ve-been-building-atom-report-post-training-course-finishing-my-book-and-o.html)

## Ch15.002 NVIDIA Blackwell MLPerf Training 6.0 基准测试结果（2026-06）

→ [独立页面](ch15-002-nvidia-blackwell-mlperf-training-6-0-基准测试结果-2026-06.html)

## Ch15.003 ICML 2026 | PRISM: Parallel Residual Iterative Sequence Model

→ [独立页面](ch15-003-icml-2026-prism-parallel-residual-iterative-sequence-model.html)

## Ch15.004 SFT+DPO 双阶段微调：Qwen3-1.7B Tool Calling 精度提升方案

→ [独立页面](ch15-004-sft-dpo-双阶段微调-qwen3-1-7b-tool-calling-精度提升方案.html)

## Ch15.005 xai解散但grok还没死马斯克声称新模型正在训练

→ [独立页面](ch15-005-xai解散但grok还没死马斯克声称新模型正在训练.html)

## Ch15.006 Notes on pretraining parallelisms and failed training runs.

→ [独立页面](ch15-006-notes-on-pretraining-parallelisms-and-failed-training-runs.html)

## Ch15.007 不用人类手写训练框架了！AI自己写代码，训出1B端侧「小钢炮」

→ [独立页面](ch15-007-不用人类手写训练框架了-ai自己写代码-训出1b端侧-小钢炮.html)

## Ch15.008 untitled v2

→ [独立页面](ch15-008-untitled-v2.html)

## Ch15.009 PhoneWorld (arxiv 2605.29486)：腾讯混元+港中深+人大+武大 规模化可训练 mock Android 环境基础设施（机器之心解读）

→ [独立页面](ch15-009-phoneworld-arxiv-2605-29486-腾讯混元-港中深-人大-武大-规模化可训练-mock-android-环境基础设施-机器之心解读.html)

## Ch15.010 面壁让AI写了训练框架ForgeTrain，然后它自己训出了最强1B模型

→ [独立页面](ch15-010-面壁让ai写了训练框架forgetrain-然后它自己训出了最强1b模型.html)

## Ch15.011 Mind Lab LoRA 持续学习体系：δ-mem + MinT + LoRA Scaling Law + Macaron-A2UI

→ [独立页面](ch15-011-mind-lab-lora-持续学习体系-δ-mem-mint-lora-scaling-law-macaron-a2ui.html)

## Ch15.012 Fine-Tuning Cosmos

→ [独立页面](ch15-012-fine-tuning-cosmos.html)

## Ch15.013 SFT, RL, and On-Policy Distillation Through a Distributional Lens

→ [独立页面](ch15-013-sft-rl-and-on-policy-distillation-through-a-distributional-lens.html)

## Ch15.014 在线蒸馏OPD vs 离线蒸馏SFT：数学原理与实战优势

→ [独立页面](ch15-014-在线蒸馏opd-vs-离线蒸馏sft-数学原理与实战优势.html)

## Ch15.015 DeepSeek V4 训练方法论深度解读

→ [独立页面](ch15-015-deepseek-v4-训练方法论深度解读.html)

## Ch15.016 Fine-Tuning NVIDIA Cosmos Predict 2.5 with LoRA/DoRA for Robot Video Generation

→ [独立页面](ch15-016-fine-tuning-nvidia-cosmos-predict-2-5-with-lora-dora-for-robot-video-generation.html)

## Ch15.017 Yann Dubois（OpenAI Post-Training）× Matt Turck 深度访谈：GPT-5.5、RL 突破、后训练流水线

→ [独立页面](ch15-017-yann-dubois-openai-post-training-matt-turck-深度访谈-gpt-5-5-rl-突破-后训练流水线.html)

## Ch15.018 Fine-Tuning NVIDIA Cosmos Predict 2.5 with LoRA/DoRA for Robot Video Generation

→ [独立页面](ch15-018-fine-tuning-nvidia-cosmos-predict-2-5-with-lora-dora-for-robot-video-generation.html)

## Ch15.019 无惧Off-Policy偏移！Bengio团队解绑后训练，大模型RL提速50倍

→ [独立页面](ch15-019-无惧off-policy偏移-bengio团队解绑后训练-大模型rl提速50倍.html)

## Ch15.020 xOPD 全景梳理：16 篇论文拆解 On-Policy Distillation 的六个维度与教师角色演化主线

→ [独立页面](ch15-020-xopd-全景梳理-16-篇论文拆解-on-policy-distillation-的六个维度与教师角色演化主线.html)

## Ch15.021 LLM Post-Training全景指南：从RLHF到GRPO再到AgenticRL

→ [独立页面](ch15-021-llm-post-training全景指南-从rlhf到grpo再到agenticrl.html)

## Ch15.022 百度文心大模型后训练进化（ERNIE 3.0→5.0）

→ [独立页面](ch15-022-百度文心大模型后训练进化-ernie-3-0-5-0.html)

## Ch15.023 Reinforcing Recursive Language Models | alphaXiv

→ [独立页面](ch15-023-reinforcing-recursive-language-models-alphaxiv.html)

## Ch15.024 时间序列预测增强方法总结：频域、分解、patch

→ [独立页面](ch15-024-时间序列预测增强方法总结-频域-分解-patch.html)

## Ch15.025 NVIDIA-ZPPO: Zone of Proximal Policy Optimization

→ [独立页面](ch15-025-nvidia-zppo-zone-of-proximal-policy-optimization.html)

## Ch15.026 AlphaEvolve交出一周年炸裂成绩单！AI自我改进不再科幻

→ [独立页面](ch15-026-alphaevolve交出一周年炸裂成绩单-ai自我改进不再科幻.html)

## Ch15.027 Overcoming Reward Signal Challenges: Verifiable Rewards-based RL with GRPO on SageMaker AI

→ [独立页面](ch15-027-overcoming-reward-signal-challenges-verifiable-rewards-based-rl-with-grpo-on-sag.html)

## Ch15.028 Heidi Health 临床 AI 微调：小模型通过偏好信号达前沿水平

→ [独立页面](ch15-028-heidi-health-临床-ai-微调-小模型通过偏好信号达前沿水平.html)

## Ch15.029 EMO: Pretraining mixture of experts for emergent modularity | Ai2

→ [独立页面](ch15-029-emo-pretraining-mixture-of-experts-for-emergent-modularity-ai2.html)

## Ch15.030 SkillOS

→ [独立页面](ch15-030-skillos.html)

## Ch15.031 Generalization Dynamics of LM Pre-training — Jiaxin Wen

→ [独立页面](ch15-031-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)

## Ch15.032 Generalization Dynamics of LM Pre-training — Jiaxin Wen

→ [独立页面](ch15-032-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)

## Ch15.033 What I've been building: ATOM Report, post-training course, finishing my book, and ongoing research

→ [独立页面](ch15-033-what-i-ve-been-building-atom-report-post-training-course-finishing-my-book-and-o.html)

## Ch15.034 Generalization Dynamics of LM Pre-training — Jiaxin Wen

→ [独立页面](ch15-034-generalization-dynamics-of-lm-pre-training-jiaxin-wen.html)

