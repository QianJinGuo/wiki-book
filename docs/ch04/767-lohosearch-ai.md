# 下一代搜索智能体评测基准！美团开源LoHoSearch，用知识图谱校准AI能力认知

## Ch04.767 下一代搜索智能体评测基准！美团开源LoHoSearch，用知识图谱校准AI能力认知

> 📊 Level ⭐⭐ | 2.9KB | `entities/下一代搜索智能体评测基准美团开源lohosearch用知识图谱校准ai能力认知.md`

# 下一代搜索智能体评测基准！美团开源LoHoSearch，用知识图谱校准AI能力认知

> WeChat-美团技术团队 | 发布于 2026-07-23 | 评分入库 v×c≥49

## 核心内容

美团 LongCat 2026-07-23 19:58 北京 从人工出题到知识图谱自动构造，LoHoSearch 给 GPT-5.5 上了一课。 过去一年，我们见证了 Search Agent 能力的显著演进。 在 BrowseComp 等评测上，顶尖模型准确率从最初的30%区间迅速攀升至90%以上。然而，当基准迅速饱和，其区分模型能力的价值也随之递减。 △图1：BrowseComp 准确率进展曲线 BrowseComp 的题目由人工设计，局限在于只能基于标注者已知的实体和关系构思，无法站在全局知识网络视角判断：哪些条件真的难检索？哪些约束的候选空间足够大？ 正是这种局限，让我们开始思考另一种可能性：能不能让机器自己来出题？ 美团 LongCat 团队在最新论文中提出的 LoHoSearch 基准，就是把这种可能性变成了现实。 🚀 LoHoSearch 的核心"硬核"看点： 知识图谱自动化构造。 以覆盖762万维基百科实体的知识图谱为基础自动生成题目，替代人工出题。基准含544道经人工核验的题目，覆盖11个领域。 双维度难度控制。 在生成中系统控制搜索空间与结构复杂度。构建出难度显著高于现有基准的挑战性问题。 当前模型性能表现。 已评测模型中，GPT-5.5准确率为34.74%；现有上下文管理策略在LoHoSearch上提升幅度为6.8%，低于在BrowseComp上的14.03%。 01 设计原理：让机器出题，需要几部？ 机器出题的前提，是让机器拥有全局视野。整个构建流程可以分为四个环节：建图 → 控制难度 → 质量把关 → 数据概览 。下面逐一展开。 1.1 建图：搭建知识。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/下一代搜索智能体评测基准美团开源lohosearch用知识图谱校准ai能力认知.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) [Agentic Rag Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-rag-patterns.md)

---

