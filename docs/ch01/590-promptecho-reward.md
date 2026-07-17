# 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward

## Ch01.590 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward

> 📊 Level ⭐⭐ | 7.7KB | `entities/2026-05-06-阿里开源PromptEcho-用冻结多模态大模型为文生图训练提供高质量Rewar-机器之心.md`

# 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward

---
title: 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward
source: wechat
url: https://mp.weixin.qq.com/s/83eRAXNNKHdHS2BjY3iTuQ
mp_name: 机器之心
publish_date: 2026-05-06
---

# 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward

**来源**: 机器之心

**发布日期**: 2026-05-06

**原文链接**: https://mp.weixin.qq.com/s/83eRAXNNKHdHS2BjY3iTuQ

---

本文作者团队来自阿里巴巴集团，共同第一作者为深度学习研究员刘锦龙和何旺贵，通讯作者为姜浩。

用强化学习（RL）优化文生图模型的 prompt following 能力，是一条被广泛验证的路径 —— 让模型根据 prompt 用不同随机种子生成多张图片，通过 reward model 计算 reward，再利用相关 RL 算法优化模型。

这里面最核心的问题在于：r e

## 核心要点

> 本文为微信公众号文章，由 WeChat backfill 收录。

## 详细信息

---
title: 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward
source: wechat
url: https://mp.weixin.qq.com/s/83eRAXNNKHdHS2BjY3iTuQ
mp_name: 机器之心
publish_date: 2026-05-06
---

# 阿里开源PromptEcho：用冻结多模态大模型为文生图训练提供高质量Reward

**来源**: 机器之心

**发布日期**: 2026-05-06

**原文链接**: https://mp.weixin.qq.com/s/83eRAXNNKHdHS2BjY3iTuQ

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

一个自然的问题是：既然用的是冻结 VLM，为什么不直接输入 prompt 和图片让 VLM 推理图文一致性评分做 reward？为了回答这个问题，研究团队设计了一个对比方法「Inf

## 原文

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2026-05-06-阿里开源PromptEcho-用冻结多模态大模型为文生图训练提供高质量Rewar-机器之心.md)

---

