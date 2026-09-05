---
title: "阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward"
source_url: "https://mp.weixin.qq.com/s/83eRAXNNKHdHS2BjY3iTuQ"
ingested: 2026-07-01
sha256: 1438f4c13a64c37decbfa8413329b6ab8b924f64d20f28b95cc16174184555eb
---

本文作者团队来自阿里巴巴集团，共同第一作者为深度学习研究员刘锦龙和何旺贵，通讯作者为姜浩。

用强化学习（RL）优化文生图模型的 prompt following 能力，是一条被广泛验证的路径 —— 让模型根据 prompt 用不同随机种子生成多张图片，通过 reward model 计算 reward，再利用相关 RL 算法优化模型。

这里面最核心的问题在于：r eward 信号从哪来？

传统的对齐指标如 CLIP Score 粒度过粗，无法捕捉属性绑定、空间关系、计数等复杂语义。当前一些开源的 reward 模型（PickScore、ImageReward、HPS v2 等）受限于模型规模和有限的标注数据，难以为最前沿的工业级的文生图模型提供有效反馈信号。而训练一个高质量的 reward 模型往往代价不低 —— 需要耗费大量人力和成本进行标注和训练。

另一方面，开源社区的多模态大模型（VLM）持续发展，这些模型在预训练中见过海量图文数据，本身就具备丰富的图文对齐知识，是天然的图文一致性 reward 信号来源。问题在于： 如何把这些知识从 VLM 中高效地 提取出来作为 reward？

为此，来自阿里巴巴的研究团队提出了 PromptEcho —— 一种无需任何标注、无需训练 reward 模型，仅通过冻结 VLM 的一次前向推理就能获得高质量 reward 的方法。

- 论文：https://arxiv.org/abs/2604.12652

- 开源代码 & 模型权重：https://github.com/roooobotx/prompt_echo

核心方法：「PromptEcho」

一个直觉：如果图画对了，VLM 就能「复述」出 prompt

想象一下：你根据 prompt 画了一幅画，然后把画给一位朋友看，然后问他「请描述这幅画」。如果画面忠实地描绘了「一只红色的猫站在蓝色的桌子上」，他大概率能准确复述出这些内容。VLM 也是一样 —— 如果生成图像忠实遵循了 prompt，VLM 在看到图像后就能以很高的概率（似然）逐 token 复述出原始 prompt。 或者说把 prompt 的内容 「回响」 （Echo）了回来，而这个复述的对数似然就是我们要找的 reward。

反过来，如果画面中猫的颜色搞错了，或者桌子不见了，VLM 复述出原始 prompt 的概率就会显著下降，reward 随之降低。

图 1：PromptEcho 流程。给定生成图像和引导 query，冻结 VLM 在 teacher-forcing 模式下计算原始 prompt 的 token 级交叉熵损失，取负值作为 reward。

具体而言，PromptEcho 有三个输入：

- 

生成图像  ：T2I 模型根据 prompt 生成的图片

- 

引导 query  ：一个固定的指令，如「请详细描述这张图片（Describe this image in detail）」

- 

原始 prompt  ：作为「标准答案」

然后，将图像和 query 输入冻结的 VLM，在 teacher-forcing 模式下（即不让模型自由生成，而是强制输入 prompt 的每个 token），计算 VLM 对原始 prompt 中每个 token 的预测概率。最终的 reward 就是：

一句话总结：reward = VLM 看到图像后，能多大概率「复述」出原始 prompt。

这个 reward 与 VLM 预训练的损失函数完全一致，只是优化对象从 VLM 的模型权重变成了文生图模型生成的图片。这种一致性正是 PromptEcho 高效的原因，它复用了 VLM 在预训练中习得的图文对齐知识。

为什么不直接让 VLM 打分？

一个自然的问题是：既然用的是冻结 VLM，为什么不直接输入 prompt 和图片让 VLM 推理图文一致性评分做 reward？为了回答这个问题，研究团队设计了一个对比方法「InferScore」—— 使用同一个冻结 VLM，但让它以自回归方式生成对图文一致性的评分，作为 reward 信号。两者的区别在于：

- InferScore ：让 VLM 自回归生成离散评分 → 受幻觉和采样随机性影响，reward 信号不稳定；更关键的是，受限于离散打分机制，对于当前最先进的文生图模型，VLM 经常无法区分同一 prompt 下不同种子生成的多张图片在 prompt following 程度上的细微差异 —— 很多时候对所有图片都给出相同分数，导致 reward 信号几乎失效

- PromptEcho ：通过预训练损失函数计算连续的对数似然值 → 确定性、无采样噪声，天然具备细粒度区分能力

后续实验将直接验证这一点 —— 同样基于 Qwen3-VL-32B，PromptEcho 全面优于 InferScore。

实验

PromptEcho 在两个当前最前沿的开源文生图模型（Z-Image 和 QwenImage-2512）上进行了实验，使用 Qwen3-VL-32B 作为 reward VLM。

训练数据构建 。 研究团队收集了约 10 万张高质量图片，使用 Qwen3-VL-32B 配合指令 "Describe this image in detail" 为每张图片生成约 200–400 词的详细描述（dense caption），涵盖对象、属性、空间关系、颜色、纹理等多维信息。这些 caption 构成了 RL 训练的 prompt 集合。

DenseAlignBench ：密集描述场景下对前沿模型的大幅改进

研究团队从同源数据中划出 2000 条不在训练集中的 caption，构建了 DenseAlignBench 测试集。该测试集与训练数据同源同分布，用于直接验证 PromptEcho 的有效性。使用 Gemini-3-flash-preview 进行成对指令遵循维度的 GSB 评估：

在密集描述的场景下，PromptEcho 取得了对前沿模型的大幅改进。

公开 Benchmark：指令遵循能力提升的泛化测试

需要强调的是，以下公开 benchmark 的测试 prompt 与训练数据在分布上存在显著差异 PromptEcho 没有针对任何 benchmark 做针对性训练，以下结果完全反映指令遵循能力的泛化提升：

PromptEcho 在所有公开 benchmark 上均取得了一致的提升，体现了其 reward 信号源自 VLM 海量预训练数据中的图文对齐知识，具备跨分布、跨架构的泛化能力。

Reward VLM 越大越好：Scaling 有效

为了验证 VLM 模型本身的质量对 PromptEcho 效果的影响，研究团队在 Z-Image 上分别使用 Qwen3-VL-32B 和 Qwen3-VL-8B 作为 reward VLM 进行了对比实验：

32B 在所有关键指标上领先 8B，表明 reward 质量随 VLM 规模增长。这意味着随着开源 VLM 持续进化，PromptEcho 的效果上限也会不断提高。

PromptEcho vs InferScore

同样使用 Qwen3-VL-32B，PromptEcho 和 InferScore 的对比：

InferScore 在 DenseAlignBench 上甚至不如 baseline。这个验证了前面的结论：通过预训练损失函数计算连续对数似然值，远比让 VLM 自回归生成离散评分更可靠。

文字渲染：通用性验证

PromptEcho 作为通用 Reward 范式

PromptEcho 的核心机制（VLM 交叉熵 reward）并不局限于文生图模型的指令遵循优化。为了验证其通用性，研究团队将其迁移到了一个截然不同的任务：电商海报文字渲染。

迁移过程中，PromptEcho 的核心计算完全不变，仅需适配两个输入：

- 引导 query ：从通用描述（「Describe this image in detail」）改为结构化 OCR 识别 prompt—— 要求 VLM 识别图中所有设计 / 营销文字，并按语义角色分类为主标题、副标题、卖点文案、其他文字

- 标签 ：从自然语言 caption 改为 JSON 格式的结构化文字标签（直接从编辑指令中提取）

经过 PromptEcho 强化学习之后，在 5000 条测试样本上，海报生成模型全图文字正确率从 68% 提升到 75% （+7pp）。这说明 PromptEcho 是一种 通用的 reward 构建范式 —— 只需调整引导 query 和标签格式，同一套机制就能适配不同的图像生成模型和优化目标，无需为每个新任务重新训练专用 reward 模型。

Case 展示

下图展示了一些实际的 case： QwenImage-2512（Baseline）与经过 PromptEcho 训练后的模型在同一 prompt 下的生成对比。QwenImage-2512 作为当前最先进的开源文生图模型，整体指令遵循能力已经不错。可以看到，经过 PromptEcho 训练后，模型在画面细节、空间关系、对象计数等方面有了进一步的显著改进。

图 2：QwenImage-2512 Baseline vs PromptEcho 生成结果对比。

总结与展望

PromptEcho 揭示了一个简洁而深刻的洞察： VLM 的预训练损失函数本身就是一个高质量的文图对齐 reward 信号 。 不需要标注数据，不需要训练 reward 模型，直接利用开源 VLM 的一次前向推理，就能提供高质量的指令遵循 reward 信号。

这开辟了一条全新的 reward 构建路径 —— 未来随着开源社区 VLM 持续改进，PromptEcho 将获得更高质量的 reward 信号，带来更好的优化效果。

为了方便社区的进一步研究，研究团队已开源代码、模型权重和 DenseAlignBench 测试集，详见： https://github.com/roooobotx/prompt_echo。

© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com
