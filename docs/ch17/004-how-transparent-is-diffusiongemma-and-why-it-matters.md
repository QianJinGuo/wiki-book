# How transparent is DiffusionGemma (and why it matters)

> 📊 Level ⭐⭐⭐ | 13.0KB

> 原文存档：[原文存档](https://www.lesswrong.com/posts/zoYXpdaMgFT43Wc24/how-transparent-is-diffusiongemma-and-why-it-matters)

## 核心内容

Authors: Joshua Engels*, Callum McDougall*, Bilal Chughtai*, Janos Kramar, Senthoran Rajamanoharan, Cindy Wu, Arthur Conmy, Asic Q Chen, Jean Tarbouriech, Min Ma, Brendan O'Donoghue+, João Gabriel Lopes de Oliveira+, Rohin Shah+, Neel Nanda+

*Primary Contributor

+Advising

Paper here: [https://arxiv.org/abs/2606.20560](https://arxiv.org/abs/2606.20560)

## Overview

In a recent collaboration between the GDM interpretability team and the GDM text diffusion team, we performed a transparency audit of DiffusionGemma, GDM's new text diffusion model.

Overall, we find that DiffusionGemma is not significantly less transparent than Gemma.

*   Gemma and DiffusionGemma perform similarly on [monitorability evaluations](https://arxiv.org/abs/2512.18311).
*   Although naively DiffusionGemma has a much larger[opaque serial depth](https://arxiv.org/abs/2603.09786), we can apply the [logit lens](https://www.lesswrong.com/posts/AcKRB8wDpdaN6v6ru/interpreting-gpt-the-logit-lens) to intermediate vectors and ablate non-interpretable information without harming performance. This implies that these intermediate nodes are interpretable, which reduces the opaque serial depth to be similar to that of Gemma.

However, even though the _variables_ that the model uses at different steps are interpretable, this does not necessarily mean that we understand the _algorithm_ that the model uses to reach the final answer. We thus distinguish between _variable_ transparency, which we define as whether we can understand _snapshots_ of the model's computation, and _algorithmic_ transparency, which we define as whether we can use these snapshots to reconstruct the process by which the model arrived at its outputs.

By default, algorithmic transparency is much lower for a text diffusion model. In an autoregressive model, the model proceeds through its reasoning in order, token by token; when each token is generated, we know the exact state the model was in, and can make inferences about why it generated a certain token. On the other hand, in a single "canvas" a diffusion model generates all tokens at once, and the causal relationship between different tokens is unclear; a diffusion model can e.g. use tokens at the end of the canvas to help it figure out what tokens to generate earlier in the canvas. In a series of case studies, we study these and other phenomena that are unique to text diffusion models, including non-chronological reasoning, token and sequence smearing, and intermediate-context reasoning. We make progress on algorithmic transparency and believe we now understand some of the algorithmic "styles" that DiffusionGemma uses, but we still think that it is less algorithmically transparent than corresponding autoregressive LLMs.

We also include 24 open problems that we would be excited for the community to investigate.

## Why is this relevant for AI safety?

Currently, CoT monitoring is a load-bearing aspect of many safety cases, but future models may perform more of their reasoning in latent spaces. We think that developers should perform transparency audits of new model architectures that perform larger fractions of their computation in a latent space. Thus, even though DiffusionGemma is itself not concerning from a transparency perspective, we are excited about this work because of the precedent it sets for performing these sorts of evaluations. Many of our experiments, including the opaque serial depth and monitorability evaluations, should be able to be straightforwardly applied to future latent reasoning architectures.

If future latent reasoning models regress on these metrics, we will need new techniques that can translate from latent reasoning into natural language. Thus, we are particularly excited about techniques like [Natural Language Autoencoders](https://transformer-circuits.pub/2026/nla/) and [Activation Oracles](https://arxiv.org/abs/2512.15674) that can translate activations into natural text, and we hope that the interpretability community continues to prioritize their development.

## Short summary of main results:

We first present a diagram of the DiffusionGemma architecture:

![Image 1: CleanShot 2026-06-19 at 19.26.34@2x.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1781893604/lexical_client_uploads/xig4bpzhlwokgsuwjsrw.png)

As expected, the opaque serial depth for DiffusionGemma is much larger (28.6X) the corresponding Gemma model. But if we were able to show the intermediates were interpretable, this would drop to 1.1X.

![Image 2: CleanShot 2026-06-20 at 21.01.51@2x.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1781985729/lexical_client_uploads/teq5ujwefoavwmx9c5yr.png)

When we replace the intermediate self-conditioning vectors  with their top-k or top-p tokens, we maintain most performance on downstream benchmarks:

![Image 3: CleanShot 2026-06-20 at 14.54.28@2x.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1781963684/lexical_client_uploads/rmbvkn1kydq1yx8azjmn.png)

For the top-p interventions, these top tokens are mostly equal to or semantically similar to nearby tokens in the final canvas tokens. Thus, they are largely interpretable.Note that even the 10% of tokens in the first few canvases that do not fall into these categories may still be interpretable; they may be guesses for other meanings of the sentence, or may be interpretable intermediates that the model is using to reason. We are interested in further work that investigates intermediate tokens the model is confident in that are not similar to any final tokens.

![Image 4: CleanShot 2026-06-20 at 14.54.59@2x.png](https://res.cloudinary.com/lesswrong-2-0/image/upload/v1781963711/lexical_client_uploads/tatqh8rnbjrmmqb9kqyt.png)

Monitorability, a key downstream application of transparency, is similar between Gemma and DiffusionGemma:

![Image 5: CleanShot 2026-06-20 at 14.55.33@2x.png](https://res.cloudinary.com/lesswrong-

## 与现有 DiffusionGemma 实体的关系

本文从**透明度/可解释性**角度分析 DiffusionGemma，与现有 [DiffusionGemma 技术架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/diffusiongemma-4x-faster-text-generation-google-2026-06.md) 实体（侧重模型架构、MoE 设计、推理加速）形成互补。

---
## 深度分析

### 测量对象换了：从 token 序列到 latent 快照

自回归模型里 "reasoning trace" 与 token 序列是同一个东西——每生成一个 token，模型状态已知，因果链即阅读顺序。扩散模型一次性去噪整个 canvas，token 间的因果关系不再由位置决定：模型可以用尾部的 token 约束前部该写什么。所以论文的贡献不是"DiffusionGemma 也透明"，而是把 transparent 拆成 *variable transparency*（能否理解计算状态的快照）与 *algorithmic transparency*（能否用快照重建到达输出的过程）。拆分必要：扩散 LM 里"可读的推理文本"本身不成立，而安全论证正依赖它。

### 探针能证明什么，不能证明什么

结论链条是：logit lens 可作用于中间 self-conditioning vectors，把它们替换成 top-k/top-p token 后下游性能基本保持，于是中间节点"可解释"，opaque serial depth 从 28.6X 降到 1.1X。两处需警惕。其一，1.1X 是条件值，前提是"中间节点可解释"，当成独立测量引用会高估结论强度。其二，"ablation 后性能不掉"有竞争解释：信息确实冗余可读，或信息经其他通路冗余恢复——多路径性让 ablation 显得无害，却不证明该节点不在因果路径上。再者，logit lens 的可读性来自把 latent 投影到词表，等于假设中间变量在词表基下线性可读，对不落词表的中间量系统性欠拟合——论文自陈 top-p 干预中约 10% 的 token 不属"等于或语义相近于最终 canvas token"之列，这批最可能是真推理中间量。

### "内部看起来可读"不等于"陈述的理由是实际原因"

retroactive self-correction 是最有杀伤力的案例：要求点数 400–800 之间的完全平方数、先给答案再列清单，模型会先猜错、列出平方数、然后在后续去噪步回头改掉前面的答案。即 final canvas 文本顺序反因果：读者看到"答案在前、推导在后"，实际因果是"清单驱动答案"。token smearing 进一步说明 canvas 位置不是变量的稳定绑定坐标——模型确信某 token 该出现但不确定位置时，会把概率横向抹开到相邻位置。故把可见 canvas 文本当 stated rationale 的读法，缺少位置到变量的映射前提。

### 什么能证伪透明度主张

光"读得懂快照"不够，需 intervention 的可预测性：把某位置的可读中间 token patch 成另一值，若最终答案按预期方向改变，说明该位置在因果路径上；若 patch 无效而消融也无效，读到的很可能只是旁路。还需 negative controls：替换无关 canvas 文本应损害性能，改变排布顺序应改变中间量——否则"可读"可能只是投影器把任何向量映射成看似合理的词。opaque serial depth 的降幅也需跨规模与任务复现，单点数字撑不起架构级结论。

## 实践启示

1. **先冻结"透明的对象"，再设计指标。** variable 与 algorithmic transparency 分开评分，禁止合并成单一"透明度分数"；algorithmic 侧的最小日志单元是 `(canvas position, denoising step)` 双轴，而非最终文本。
2. **保留可复算的 artifacts。** 每步 top-k/top-p 投影、被消融节点 identity、ablation 前后原始分数（不只差值）、canvas 快照位置索引。只留图表的审计无法被复算。
3. **把 stated rationale 当待检验假设，不当证据。** 文本顺序 ≠ 计算顺序（retroactive self-correction 即反例），报告中应显式标注，避免下游把它当 CoT 使用。
4. **用因果 probe 补足 ablation。** logit lens + ablation 只给必要条件；要主张 algorithmic transparency，需加 activation patching 并检验改变是否按预期方向传导。
5. **报告不确定性而非点估计。** 引用 28.6X→1.1X 须同时给出前提与未解释中间 token 比例（约 10%），否则数字会被当成无条件事实传播。
6. **把 24 个 open problems 转成回归套件。** 新 latent 架构上线前跑同一组探针，退化即触发人工复核——这正是本文作为先例的价值，参见 [opaque serial depth 与 monitorability](https://github.com/QianJinGuo/wiki-public/blob/main/entities/redwood-opaque-serial-depth-monitorability.md) 与 [机制可解释性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/mechanistic-interpretability.md)；退化时需 [NLA](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-nla-natural-language-autoencoders-interpretability.md) 一类 latent→文本翻译兜底。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

