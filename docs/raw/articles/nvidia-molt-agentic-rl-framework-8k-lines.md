---
source_url: https://mp.weixin.qq.com/s/H0Qxf_htRS6i3_zmPXF6jQ
ingested: 2026-07-15
sha256: 2237723be725f26018996186405fe4311f3f40128953ce3cf4706e07feb56a57
source_published: 2026-07-15
title: "NVIDIA 开源 Molt：8600 行 RL 代码训万亿 MoE 模型"
author: ChallengeHub
feed_name: ChallengeHub
---

NVIDIA 开源 Molt（github.com/NVIDIA-NeMo/labs-molt），OpenRLHF 作者 Jian Hu 新作。slogan：agentic-first、PyTorch 原生，约 8.6K 行 RL 代码训 700B+ 级别模型，不依赖 Megatron。

## 架构

三个大件 + 异步循环：
1. Ray：放置（placement）和异步队列
2. vLLM：rollout（采样生成）
3. NVIDIA AutoModel + FSDP2：训练

Agent 即 Python 程序，trainer 即一个 actor，reward 在 Env/ChatAgent 里随手写。Token 对齐是统一格式的关键——token id、logprob、action range、reward、多模态张量从 rollout 对齐到训练。

## 两种 Agent 模式

1. Env（StepEnvRunner）：Gymnasium 风格 step/reset，框架接管 LLM 循环
2. ChatAgent：直接使用 OpenAI/Anthropic SDK，框架提供 ctx.base_url（已带 session id）和 ctx.session_url（Anthropic 协议）

长程 agent 的上下文压缩（compact）会自动识别"改写前缀"而非"追加"，从压缩点起新段，不破坏 token 精度。

## 对比（RL 代码量严格口径）

Molt ~8.6K 行 vs OpenRLHF ~7.2K 行 vs verl ~62K 行 vs slime ~25K 行。

Molt 不跟 verl 拼生产级广度，也不跟 slime 拼 Megatron 吞吐，只优化 agentic 研究迭代速度。

## 关键技巧

- MoE 路由稳定性：fp32 门控 + Rollout Routing Replay（R3，arXiv:2510.11370）+ 可选的 freeze_moe_router
- IS 校正：逐 token 重要性比 pi_train/pi_rollout，is_correction_level（token/seq/geo）× is_correction_mode（mask/clip/trunc）构成正交参数矩阵
- MTP 投机解码：--vllm.mtp_num_speculative_tokens 1，无损
- On-policy 蒸馏：--algo.advantage.estimator on_policy_distill，用反向KL当唯一训练信号
- 估计器：reinforce、reinforce_baseline、rloo、grpo、dr_grpo、gae（PPO）、on_policy_distill

## 规模

单卡起步到 1T MoE。DeepSeek-V3 TP8+DP4→EP32。同期支持的模型包括 Qwen3.5-397B、GLM-5.2 753B。

底层 AutoModel + FSDP2 + TP/EP/CP，MoE 原生。

## 局限性

- 大规模并行需 AutoModel 格式权重
- CP 训练下 packing 关闭
- muon 优化器实验状态
- 无 LoRA 多租户
