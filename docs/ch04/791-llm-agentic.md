# 让生成式模型「画」出空间智能，而非强迫LLM输出「坐标」! 浙大提出Agentic空间认知评估框架

## Ch04.791 让生成式模型「画」出空间智能，而非强迫LLM输出「坐标」! 浙大提出Agentic空间认知评估框架

> 📊 Level ⭐⭐ | 2.7KB | `entities/让生成式模型画出空间智能而非强迫llm输出坐标-浙大提出agentic空间认知评估框架.md`

# 让生成式模型「画」出空间智能，而非强迫LLM输出「坐标」! 浙大提出Agentic空间认知评估框架

> WeChat-机器之心 | 发布于 2026-08-09 | 评分入库 v×c≥49

## 核心内容

机器之心 2026-08-09 18:04 新加坡 Show, Don't tell. 如果你问一个人 “杯子在哪？”，他通常会直接用手指给你看，而不是面无表情地回答：“目标位于屏幕横坐标 345 至 412、纵坐标 512 至 600 的边界框内”。然而，在现有空间认知评测中，我们却一直在强迫 AI 用这种 “反直觉” 的坐标方式来证明自己的空间认知能力。 空间判断本来就活在连续的视觉场景里，但现有 benchmark 几乎都要求模型用坐标、选项或文字作答。这对文本 VLM 已不够自然，天然工作在像素空间、本可直接 “画” 出答案的图像生成模型更是被挡在门外。 生成式模型会不会是承载空间认知更自然的载体？ 如果让模型直接把答案 “画” 出来，怎样让它把空间判断表达清楚？在不依赖人工的情况下，如何准确判断它画得对不对？进一步看，生成式模型与文本输出 VLM 在不同空间任务上的能力差异究竟在哪里？ 近日，浙江大学 OmniAI 团队在 《Show, Don’t Tell: Evaluating Spatial Cognition in Generative Pixels Rather Than LLM Text》 中提出 ProVisE，让图像生成模型直接在图中回答空间问题，并将视觉答案还原为原 benchmark 可以评分的结构化预测。 论文链接：<https://arxiv.org/abs/2607.21072 项目地址：<https://zju-omniai.github.io/ProVisE/ Github 链接：<https://github.com/ZJU-OmniA。

## 关键要点

- 原文完整记录：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/让生成式模型画出空间智能而非强迫llm输出坐标-浙大提出agentic空间认知评估框架.md)
- 关联主题：[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md)、[Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)、[Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

## 相关实体

[Agent Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-architecture.md) [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) [Agent Evaluation Benchmarks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)

---

