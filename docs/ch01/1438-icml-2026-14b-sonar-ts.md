# ICML 2026 | 免训练跑赢14B模型，Sonar-TS补上时序问答规模空白

## Ch01.1438 ICML 2026 | 免训练跑赢14B模型，Sonar-TS补上时序问答规模空白

> 📊 Level ⭐⭐ | 2.5KB | `entities/icml-2026-免训练跑赢14b模型sonar-ts补上时序问答规模空白.md`

# ICML 2026 | 免训练跑赢14B模型，Sonar-TS补上时序问答规模空白

> WeChat-PaperWeekly | 发布于 2026-07-30 | 评分入库 v×c≥49

## 核心内容

原创 让你更懂AI的 2026-07-30 12:47 北京 一句话搜遍百万点时序 过去，大模型能读懂一小段曲线，却塞不下一整座时序数据库。Sonar-TS 无需训练，只用一句话，就能从百万点历史中找出所有目标形态。 近年来，随着大模型与时序基础模型的快速发展，让人用自然语言向时间序列提问（时序问答）已经取得长足进步。 但有一类听起来很朴素的问题，至今几乎无人能解：在一个数据库规模的时间序列里，用一句话找出“某种形态”出现的所有片段，比如“过去一年里，先快速上升、随后进入平台期的日子有哪些”。 本文深入解析 Griffith 大学金明课题组的 ICML 2026 工作 Sonar-TS。 该工作把这一被长期忽视的空白正式定义为新问题 NLQ4TSDB，配套提出第一个基准 NLQTSBench，并以“先搜索、再验证”的神经符号框架给出第一个可行解，重点探讨其将“形态”转化为可检索符号、以及用可执行程序做精确验证的两步设计。 本文依次讲清三件事：为什么这是个真问题、如何度量它，以及 Sonar-TS 如何在数据库规模上既读懂形态、又不失精度。 论文标题： Sonar-TS: Search-Then-Verify Natural Language Querying for Time Series Databases 论文地址： <https://arxiv.org/abs/2602.17001 代码地址： <https://github.com/Atlamtiz/Sonar-TS 数据集地址： <https://huggingface.co/datasets/mrtan/NLQTSB。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/icml-2026-免训练跑赢14b模型sonar-ts补上时序问答规模空白.md)
- 关联主题：[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)、[Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)、[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

## 相关实体

[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md) [Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)

---

