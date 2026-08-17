# 重新审视交叉熵：LM Loss还有哪些选择？

## Ch01.1575 重新审视交叉熵：LM Loss还有哪些选择？

> 📊 Level ⭐⭐⭐ | 2.7KB | `entities/重新审视交叉熵lm-loss还有哪些选择.md`

# 重新审视交叉熵：LM Loss还有哪些选择？

> WeChat-PaperWeekly | 发布于 2026-08-10 | 评分入库 v×c≥49

## 核心内容

原创 苏剑林 2026-08-10 18:09 北京 从 Loss 反推最优激活函数 Softmax 和交叉熵为何总是成对出现？答案不只是“大家都这么用”，而是藏在概率预测与 Loss 的数学结构里。 ©PaperWeekly 原创 · 作者 苏剑林 单位 科学空间 研究方向 NLP、神经网络 一直以来，交叉熵（Cross Entropy）都是 LLM 预训练和微调的标准损失函数。 那这个“标准”可以改吗？如果想改，那又有哪些选择呢？改完之后又会带来什么影响呢？ 可能很多读者从未认真推敲过这些问题。一方面，交叉熵简洁有效，又有信息论诠释作为背书，让我们觉得它非常“理所当然”，以至于欣然接受。 另一方面，换损失函数是“牵一发而动全身”的事情——换了之后意味着所有基于损失的比较都不再有效，我们只能去比下游任务效果了，工程量太大。 然而，“理所当然”不等于“别无选择”，将背后的原理思考清楚，不仅有助于我们更好地理解模型的优化过程，也可能为提升效果带来新的改进视角。 分析 更准确地说，交叉熵是分类问题的标准损失函数，而 LLM 的训练看上去像是逐 Token 的分类问题，所以沿用了交叉熵损失。 这样看来，只要我们换用别的分类损失函数就行了？ 很遗憾，并不对。跟常规分类问题不同，自然语言的规律是一对多的，比如“白切”后面不仅可以接“鸡”，还可接“鸭”、“狗”、“羊”等，所以我们要建模的是完整的分布，而不只是预测单个标签。 换句话说，我们需要把“白切”后面接“鸡”、“鸭”、“狗”、“羊”的概率都估计出来，而不单单给出一个正确答案——正确答案并不唯一。 而这里的核心难题在于，训练语料是“零散。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/重新审视交叉熵lm-loss还有哪些选择.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

---

