# ICML 2026 | 会查表却不会预测未来：南大TopBench测出大模型数据盲区

## Ch01.1444 ICML 2026 | 会查表却不会预测未来：南大TopBench测出大模型数据盲区

> 📊 Level ⭐⭐ | 2.5KB | `entities/icml-2026-会查表却不会预测未来南大topbench测出大模型数据盲区.md`

# ICML 2026 | 会查表却不会预测未来：南大TopBench测出大模型数据盲区

> WeChat-PaperWeekly | 发布于 2026-08-07 | 评分入库 v×c≥49

## 核心内容

原创 让你更懂AI的 2026-08-07 23:46 江苏 当问题没有明确建模指令时，大模型能否主动完成意图对齐、任务抽象与表格预测？ 论文题目： TopBench: A Benchmark for Implicit Predictive Reasoning in Tabular Question Answering 收录会议： ICML 2026 论文链接： <https://arxiv.org/abs/2604.28076 代码链接： <https://github.com/LAMDA-Tabular/TopBench 数据集： <https://huggingface.co/datasets/LAMDA-Tabular/TopBench 近年来，大语言模型在表格问答（Table Question Answering，TQA）中表现得越来越像一个“数据助理”：它可以读 CSV、理解列名、写 SQL 或 Python 做筛选聚合，也能把结果组织成自然语言。 对于“查某一行”“统计某个均值”“筛选符合条件的记录”这类问题，模型已经具备相当强的可用性。 但真实的用户请求里，经常有另一类更微妙的问题。 用户并不会说“请以 charges 为目标列训练一个回归模型”，也不会把任务描述成标准机器学习接口，而是会说：“我儿子刚上大学，不抽烟，BMI 是 30.14，我们大概该给他的医保账单准备多少钱？” 这里的关键不是表里有没有一行完全匹配的记录，而是答案本来就不在表里。模型必须先听懂用户真正想问的是一个预测问题，再把自然语言中的人物描述、业务目标、候选集合、约束条件等内容抽象成结构化。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/icml-2026-会查表却不会预测未来南大topbench测出大模型数据盲区.md)
- 关联主题：[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)、[Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)、[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

## 相关实体

[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) [Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

