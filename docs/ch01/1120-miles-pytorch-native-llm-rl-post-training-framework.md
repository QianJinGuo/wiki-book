# Miles: PyTorch-Native LLM RL Post-Training Framework

## Ch01.1120 Miles: PyTorch-Native LLM RL Post-Training Framework

> 📊 Level ⭐⭐ | 2.3KB | `entities/pytorch-miles-llm-rl-post-training.md`

# Miles: PyTorch-Native LLM RL Post-Training Framework

Miles 是 RadixArk 推出的开源 LLM RL 后训练框架，以 PyTorch 为核心，组合 SGLang（rollout）、NVIDIA Megatron-LM（训练）和 Ray（编排）构建可组合的大规模 RL 训练流水线。

## 架构亮点

Miles 的核心设计是将 RL 训练分解为四个可组合层：Ray 负责分布式编排与容错、SGLang 负责高吞吐 rollout 推理、Megatron-LM 负责可扩展训练、PyTorch 作为统一的数值与模型定义层。这种分层设计使得研究人员可以只关注 trainer 层的定制，而不需要处理分布式基础设施的复杂性。

## 关键技术特性

- **统一的低精度方案**：FP8/BF16/INT4 在 rollout 和训练间保持一致性，消除精度不匹配问题
- **MoE-aware 对齐**：rollout 和训练阶段的路由 logits 同步，防止 MoE 路由漂移导致的策略偏差
- **NVIDIA NCCL/RDMA 快速权重同步**：rollout 和训练 worker 间通过 RDMA 高速同步权重，最小化同步开销
- **内置可观测性**：rollout 吞吐量、训练吞吐量、策略分歧度、reward 趋势等指标通过标准监控接口暴露
- **Ray-based 容错**：支持长时间运行的 checkpoint 自动恢复

## 相关实体

- [SGLang](../ch04/544-agent-assisted-sglang-ai-llm.md) — Miles 使用 SGLang 作为 rollout 引擎
- [LLM RL 算法概览](ch01/586-llm.md)
- [DeepSeek V4 训练方法论](ch01/1048-deepseek-v4.md)
- [前沿后训练配方回顾](../ch04/070-ai.md)
- [百度文心后训练演进](../ch04/070-ai.md)
- [PyTorch 训练循环实践](../ch04/070-ai.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/pytorch-miles-llm-rl-post-training-2026.md)

---

