# Agent训练最容易踩的坑：Credit Assignment Is All You Need

## Ch04.786 Agent训练最容易踩的坑：Credit Assignment Is All You Need

> 📊 Level ⭐⭐ | 2.6KB | `entities/agent训练最容易踩的坑credit-assignment-is-all-you-need.md`

# Agent训练最容易踩的坑：Credit Assignment Is All You Need

> WeChat-PaperWeekly | 发布于 2026-08-06 | 评分入库 v×c≥49

## 核心内容

原创 haotian 2026-08-06 23:40 江苏 长程强化学习最容易忽略的一步 一条成功轨迹里也可能夹着错误行为，整条奖励下去，模型连不该学的部分也会一并强化。 训 reasoning-model 的时候，即使输出很长，也不会 care credit-assignment，只要题目足够难、group-size 足够大，训练时间足够长，训推 diff低/entorpy 不炸，基本都能涨到还不错的效果。 但转到 agentic 任务，似乎故事的叙事方法就完全变了。 加入各种 TITO、seq/token-is（有偏/无偏）以及各种不同的算法变种，在笔者的实验中，总是涨点随缘，波动为主。很少能见到类似 reasoning-RL 那样非常明确的涨幅趋势。 从换 data、加 KL（防治分布漂移）、加 entropy（增加探索）等等，似乎都无法解决问题。当模型曲线健康的时候，eval 不涨点会比较难定位问题。 infra 错？但 single-turn 都正常且训推 diff、entropy、KL 都正常。 数据错？换 data 似乎也不解决问题（除非用测试集训练）。 recipe 错？都训不崩、指标健康，recipe 似乎没错。 分析 rollout 样本？不同的任务/task 分析难度不低，LLM-judge 能给出一些初步诊断，但一些问题的解决需要从 data 角度构造（且模型的输出行为需要能符合预期，这个周期也不短）。 加 reward-shape？底座/数据/任务之间，比较难迁移，且不解决长期问题。 思来想去，只能转向credit-assignment。对于 128。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent训练最容易踩的坑credit-assignment-is-all-you-need.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)

---

