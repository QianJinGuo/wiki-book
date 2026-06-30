# Better Experiments with LLM Evals — A funnel, not a fork | Spotify Engineering

## Ch01.641 Better Experiments with LLM Evals — A funnel, not a fork | Spotify Engineering

> 📊 Level ⭐⭐ | 5.3KB | `entities/spotify-llm-evals-funnel-not-fork.md`

## 核心要点

- LLM Evaluation: A Funnel Not a Fork

## 相关实体
- [Fine Tune Llm With Databricks Unity Catalog And Amazon Sagemaker](https://github.com/QianJinGuo/wiki/blob/main/entities/fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagemaker.md)
- [Taobao Smart Shopping Guide Agent Evaluation Pzmx](https://github.com/QianJinGuo/wiki/blob/main/entities/taobao-smart-shopping-guide-agent-evaluation-pzmx.md)
- [Multimodal Evaluators Mllm As Judge Image To Text](https://github.com/QianJinGuo/wiki/blob/main/entities/multimodal-evaluators-mllm-as-judge-image-to-text.md)
- [Ai Skill Metrics System](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-metrics-system.md)
- [Harness Engineering Systematic Explainer](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-systematic-explainer.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/spotify-llm-evals-funnel-not-fork.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)
## 深度分析

Spotify 的实验文化由来已久，其 A/B 测试体系是公司产品迭代的核心驱动力。然而，文章揭示了一个关键洞察：只有约 12% 的 A/B 测试最终产生正向的、上线的结果，而约 64% 的测试产生了有效学习——无论是发现了回归问题、排除了某个想法，还是细化了某个假设 。这一数据表明，实验的 win rate 实际上低估了实验本身的价值。更重要的是，LLM Evals 的引入为这个体系增加了一个上游过滤器，通过在实验前筛选掉前景不佳的候选方案，间接提升了实验的 hit rate 。

文章最核心的概念是 Schultzberg 和 Ottens (2024) 提出的 evaluation funnel：evals 属于实验之前（before），而不是代替实验（instead of）。Evals 验证（verify）的是输出是否符合质量标准，而实验验证（validate）的是真实用户是否如预测般响应 。这个区分至关重要：evals Discard the non-promising candidates before they consume experiment bandwidth，在实验前就过滤掉不值得消耗实验带宽的候选方案 。

Evals 不仅仅是质量把关工具，还能生成假设。文章举例：团队构建了一个 LLM judge 来标记"破坏信任的内容"（比如不适合用户的推荐），这个 judge 意外地暴露了团队之前没有意识到要关注的模式，这些模式随后成为产品修复的方向 。修复上线后，同一个 judge 可以验证修复是否有效——被标记的违规应该减少。这展示了 evals 的双重价值：发现需要改进的地方，以及确认改进是否已经实现 。

然而，Evals 也有其盲点。Spotify 团队透露，他们约 42% 上线的实验因为次级指标回归而需要回滚：会话时长下降、崩溃率上升、留存侵蚀。这些问题没有任何 evals 或离线评估提前标记出来 。这说明 evals 测量的是实现质量的一个维度，而实验量化的是生产系统中对最终用户的影响 。那些没有被测量的维度，恰恰可能是决定成败的关键。

LLM judges 还引入了双层校准挑战。传统定量指标（排名分数、精确率、召回率）已经是代理指标，而 LLM judges 在此基础上又增加了一层代理 。两层都需要针对在线结果进行验证，两层都可能漂移。文章以 Anthropic 发布 Opus 4.5 时的情况为例：Qodo 的编码 evals 显示没有改进，但模型在更 长任务上实际上已有实质提升——这是典型的 miscalibration 。没有离线-在线信号校准，evals 就只是 opinion，不是 evidence 。

## 实践启示

1. **建立 funnel 思维而非 fork 思维**：将 LLM evals 定位为实验流水线的上游过滤器，用于在实验前Discard the non-promising candidates，而不是替代实验本身。每个团队应该明确 evals 和实验各自的职责边界 。

2. **建立离线-在线校准循环**：在每次 A/B 测试后，将 LLM evals 运行在 A/B 测试数据上，检查 judge 偏好的版本是否在用户端实际表现更好。这个 gap 是诊断信号：当 eval 分数与实验结果差距大时，意味着 judge 可能在捕获某种模式而非真正驱动价值的因素 。

3. **用 evals 生成假设而非仅做质量把关**：像构建一个 flagging system 一样使用 LLM judge，主动寻找团队没有意识到要关注的问题模式。这些意外发现往往成为产品改进的重要方向 。

4. **警惕 guardrail metrics 的盲点**：Spotify 42% 的实验因次级指标回归被回滚，而这些回归没有被任何 evals 提前标记。这意味着除了核心指标外，必须主动建立 guardrail metrics 来监控那些重要但不在优化目标中的维度 。

5. **区分验证与验证**：Evals 验证的是实现质量（输出是否符合标准），实验验证的是业务影响（用户是否真正受益）。系统越复杂，就越需要 bound the risk，不能仅依赖 evals 就做上线决定 。

---

