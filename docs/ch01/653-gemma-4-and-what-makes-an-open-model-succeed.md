# Gemma 4 and what makes an open model succeed

## Ch01.653 Gemma 4 and what makes an open model succeed

> 📊 Level ⭐⭐ | 6.6KB | `entities/gemma-4-and-what-makes-an-open-model-succeed.md`

# Gemma 4 and what makes an open model succeed

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gemma-4-and-what-makes-an-open-model-succeed.md)

## 摘要

Sebastian Raschka（Interconnects AI）在这篇文章中分析了 Google Gemma 4 开放模型的发布，并提出了一个更宏大的问题：**在 2026 年开放模型竞争已经白热化的环境下，一个开放模型成功的决定因素到底是什么？** 文章提出了评估开放模型的五维框架（性能、来源国、许可证、工具链、可微调性），指出 benchmark 分数在发布时只是故事的极小一部分，真正的成败取决于生态系统成熟度和易用性。文章认为 Gemma 4 采用 Apache 2.0 许可证是重大利好，但也指出 Gemma 系列历史上工具链问题和微调后性能下降的隐忧。

## 核心要点

### 1. 开放模型的竞争格局已经质变

2024 年开放模型发布时，竞争对手寥寥无几。2026 年，Gemma 4 面对的是：Qwen 3.5、Kimi K2.5、GLM 5、MiniMax M2.5、GPT-OSS、Arcee Large、Nemotron 3、Olmo 3 等等。开放模型的空间已经"被填充"，但仍然充满隐藏机会——开放模型的潜力像暗物质，我们知道它巨大，但解锁它的清晰配方和案例还很少。

### 2. 评估开放模型的五维框架

Raschka 提出了评估一个开放权重模型是否值得投入的五个维度：

| 维度 | 描述 | 可用时间 |
|------|------|----------|
| **模型性能**（及大小）| 在相关 benchmark 上的表现 | 发布时即可知 |
| **来源国** | 某些企业非常在意模型来源 | 发布时即可知 |
| **许可证** | 是否需要法律审批才能使用 | 发布时即可知 |
| **工具链** | vLLM、Transformers、SGLang 等的实现质量 | 需要数天到数周稳定 |
| **可微调性** | 适配特定用例的难易程度 | 开放研究问题，无人系统监控 |

核心问题：**benchmark 在发布时只是故事的极小一部分，工具链需要时间稳定，可微调性是开放研究问题。**

### 3. 混合架构带来的工具链噩梦

Qwen 3.5 和 Nemotron 3 采用混合架构（gated delta net 或 mamba 层），导致工具链在发布时非常粗糙。作者以 Olmo Hybrid 的经验为例：Qwen 3.5 在发布 1.5 个月后才在各种开源工具中基本可用。**完全开放的分布式生态系统适应新模型需要很长时间。**

### 4. Gemma 4 的关键变化

- **四个尺寸**：~5B dense、8B dense、26B total 4B active MoE、31B dense
- **Apache 2.0 许可证**：终于采用标准开源许可证，将大幅提升采用率
- **~30B 是关键尺寸**：对研究者和企业都有价值——足够智能、价格可控、适合下游训练
- **评分强劲**：31B 模型与 Qwen 3.5 27B 相当，小模型在 LMArena 等通用 benchmark 上表现优异

### 5. 成功的决定因素：易用性，而非 benchmark

Raschka 的核心判断：**Gemma 4 的成功将完全由易用性决定，benchmark 上 5-10% 的波动根本不重要。** 它足够强、足够小、许可证正确、来自美国——很多企业会直接采用。

## 深度分析

### 开放模型的"暗物质"比喻

Raschka 用"暗物质"比喻开放模型的潜力：我们知道潜力巨大，但解锁它的清晰配方和案例还很少。这个比喻精确地描述了当前状态——开放模型的数量已经足够多，但围绕开放模型的价值创造方法论还极度匮乏。

Agentic AI、OpenClaw 等领域的兴起将激发大规模实验：开放模型不是要替代 Claude 和 Codex，而是要**补充**它们。

### "可微调性"是被忽视的关键维度

在五个维度中，"可微调性"是最被低估的。它没有系统性的监控和评测，但它决定了一个模型能否在特定场景中创造价值。

两种用例模式：
- **大 MoE 模型**（如 Cursor 使用 Kimi K2.5 训练 Composer 2）：需要复杂能力，用于特定领域
- **小模型**（如 Chroma 的 Context-1 基于 GPT-OSS 20B）：用于特定功能，如 agentic search

Qwen 的成功很大程度上源于：技术团队已经习惯了 Qwen 模型，无数研究方法和数据集已经适配了 Qwen。**其他模型家族要达到这个水平需要耐心——而很多开放模型构建者可能没有这种耐心。**

### 美国开放模型的"转向时刻"

文章指出了一个重要趋势：美国 AI 场景在 2025 年夏天经历了一次危机时刻——意识到不能等到 AGI 建成后再考虑开放模型。两个市场（闭源和开源）将并行发展，捕获不同领域。

GPT-OSS 从发布时的混乱到最终的巨大成功，加上 Reflection、Arcee、Nemotron、Gemma、Olmo 等的集体能量，表明围绕开放模型构建新堆栈有实质性需求。那些想要更多所有权（包括模型所有权）的企业有资本可以投入。

### Gemma 系列的历史包袱

前几代 Gemma 模型受困于：工具链问题、微调后性能下降。Gemma 4 是否能摆脱这些问题还有待观察，但 Apache 2.0 许可证和更强的基准分数给了更多信心。

## 实践启示

- **评估开放模型时，不要只看 benchmark**——工具链成熟度和可微调性同样重要
- **~30B 参数是"甜蜜点"**：足够智能、价格可控、适合下游训练和实际部署
- **许可证选择对采用率有决定性影响**：Apache 2.0 远优于自定义限制性许可证
- **给工具链时间稳定**：新模型发布后 1-2 个月再做大规模投入评估
- **可微调性需要实际测试**：不能仅凭架构判断，需要在真实数据集上验证
- **生态系统惯性是真实壁垒**：Qwen 的优势不仅在模型本身，更在于整个生态已经适配

## 相关实体

- [DeepSeek Code Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-code-harness-competitor-tina.md)
- [OpenClaw 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [From AGI to ASI](https://github.com/QianJinGuo/wiki/blob/main/entities/arxiv-2606-12683-from-agi-to-asi.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

