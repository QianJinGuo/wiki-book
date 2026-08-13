# Agentic RL 后训练资源怎么分？港中文、恒生大学提出 Libra，吞吐最高提升 3 倍

## Ch04.821 Agentic RL 后训练资源怎么分？港中文、恒生大学提出 Libra，吞吐最高提升 3 倍

> 📊 Level ⭐⭐⭐ | 2.7KB | `entities/agentic-rl-后训练资源怎么分港中文恒生大学提出-libra吞吐最高提升-3-倍.md`

# Agentic RL 后训练资源怎么分？港中文、恒生大学提出 Libra，吞吐最高提升 3 倍

> WeChat-机器之心 | 发布于 2026-08-12 | 评分入库 v×c≥49

## 核心内容

机器之心 2026-08-12 12:14 北京 一个面向 Agentic RL Post-Training 的资源管理系统。 大语言模型正在从 “回答问题” 走向 “完成任务”。在 Agentic RL 后训练中，模型不仅生成文本，还会调用搜索、代码执行等外部工具，根据环境返回继续推理。这样的交互让模型拥有更强的行动能力，也让训练系统面对一种比普通 RLHF 更不稳定的工作负载：同一批请求可能产生长度相差数十倍的轨迹，少量超长轨迹拖慢整个 rollout；与此同时，训练和 rollout 对 GPU 的需求还会随着策略演化不断变化。 针对上述问题，来自香港中文大学和香港恒生大学的研究团队提出了Libra，一个面向 Agentic RL Post-Training 的资源管理系统。Libra 不再把 rollout 视作固定瓶颈，而是将训练与 rollout 作为一个耦合系统统一优化，并通过异构推理集群、因果感知调度和弹性资源切换，让有限 GPU 资源随着实时工作负载动态流动。 在 48 张 NVIDIA A800 GPU 上，Libra 在 Search-R1、DAPO-Math-17K 和 R2E-Gym 三类任务中均取得最高吞吐，最高达到基线的 3.0 倍；在相近最终奖励下，达到目标奖励所需时间最多缩短至基线的 1/2.5。目前论文与代码均已公开。 论文标题：Libra: Efficient Resource Management for Agentic RL Post-Training 论文链接：<https://arxiv.org/abs/2606.03077 开源代。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agentic-rl-后训练资源怎么分港中文恒生大学提出-libra吞吐最高提升-3-倍.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)、[Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

---

