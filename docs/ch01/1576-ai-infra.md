# AI Infra进阶：如何让大模型输出确定的结果

## Ch01.1576 AI Infra进阶：如何让大模型输出确定的结果

> 📊 Level ⭐⭐⭐ | 2.5KB | `entities/ai-infra进阶如何让大模型输出确定的结果.md`

# AI Infra进阶：如何让大模型输出确定的结果

> WeChat-腾讯技术工程 | 发布于 2026-08-05 | 评分入库 v×c≥49

## 核心内容

原创 腾讯程序员 2026-08-05 17:25 广东 一文进阶AI Infra 作者：binnnliu 你有没有发现跟大模型对话，同样的提示词每次结果都不一样。 这符合我们对于“大模型的本质就是个猜词器”的一贯认知。 然而，可重复性是科学进步的基石。因此让大模型输出完全确定的结果是一个非常值得研究的问题，特别是强化学习需要确定性的 Rollout，来保证实验的可复现性和训练过程的稳定性。 Reproducibility is a bedrock of scientific progress. 其实很多同学第一时间会想到： 同样的硬件，同样的提示词： 1. 是不是把 Temperature 设置为 0，关掉随机采样就好了？ 2. 如果业务需要 Temperature 0，那把随机数种子（Seed）锁死，是不是也能保证每次输出一样？ 我已经测试过了，环境：vllm serve Qwen/Qwen3-8B 答案： 是也不是。 是（Run-to-run 确定性）： 同一时间，没有其他请求时，多次同样的提示词请求，回答是一样的； 不是（Batch Invariance / 批次不变性）： 同一时间，有其他请求时，多次同样的提示词请求，回答是不一样的； 什么！难道不同的请求间会相互影响？不可能，不同请求间的注意力机制是严格物理隔离，不存在上下文污染的问题。 其实这一切的根源是推理引擎底层的动态组批与算子调度策略引发了浮点加法的顺序变化，而浮点加法不满足结合律：(a + b) + c ≠ a + (b + c)。 从系统设计的角度来看，导致结果波动的根本原因，不在于信息干扰，而在于系统为。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-infra进阶如何让大模型输出确定的结果.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

---

