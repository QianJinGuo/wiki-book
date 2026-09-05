---
source_url: https://www.xiaohongshu.com/explore/6a7ec6b400000000060050f4
ingested: 2026-08-21
sha256: e365fdbbb3e8d9720b45cc3849f31a092bcae7110e4d27be9e83e862b4a2441c
title: "SkillEvo：智能客服场景的 Skill 进化&治理（Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback）"
author: 腾讯系（第一方作者）
source: 小红书 (XHS)
type: raw
tags: [skill-evolution, skill-governance, multi-turn, evolution-gradient, RSI, customer-service, tencent, iclr, skill-self-evolution, production]
---

# SkillEvo：智能客服场景的 Skill 进化&治理

> 原始来源：https://www.xiaohongshu.com/explore/6a7ec6b400000000060050f4
> 作者：腾讯系第一方作者（小红书发布自家论文，标签 #腾讯/#Agent/#RSI/#Skill自进化，2026-08-21）
> 论文：SkillEvo: Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback，投稿 ICLR，已落地生产环境持续运行一个月，arXiv 2608.13120

## 任务背景：Skill 自进化的进化梯度衰减过快

智能客服依赖一套 Skill（技能包）知识文档来应答用户，但有两个长期痛点：
1. **知识靠人工维护**：成本高，产品迭代快
2. **转人工经验不回流**：客服答不好 → 转人工 → 但解决经验无法沉淀

现有 Skill 自进化方法用**单轮问答做评测驱动进化**，但有致命问题：**第一轮把用户开场就暴露的缺口补上后，进化梯度就立刻衰减了**——那些只在多轮追问里才浮出来的深层缺陷，永远测不到。治理也是一刀切：用一个标量分数做门控，最多只能「拒收」一个坏候选，既定位不了问题在哪、也修不了。

## 创新点

**核心论点**：Skill 自进化的瓶颈，不在于编辑能力或迭代次数，而在于**评测反馈能否持续供给「可信的进化梯度」**。据此首次提出打造**可信的多轮交互范式 Skill 进化治理方法**：
- **可信反馈**提供进化梯度
- **可控治理**规定进化梯度方向

论文标题：SkillEvo: Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback

## 实验效果

在 **9 个生产级 skill、98 个 skill-ref 文档、近百万字符级**的生产 skill 中实测，SkillEvo 框架：
- Round0 解决率 30% → 经过 **4 轮进化解决率达 81.8%**
- 相比常见的**单轮交互范式**自进化方法，解决率提高 **15.4 个百分点**
- 相比**自我反思进化**，提升 **23.0 个百分点**
- 通过 Skill 治理方法，**Skill 膨胀率从 16% 降低到 2.8%**

## 论文信息
- 论文：SkillEvo: Self-Renewing Evolution Gradients from Multi-Turn Interaction Feedback
- arXiv: https://arxiv.org/abs/2608.13120
- HuggingFace Papers: https://huggingface.co/papers/2608.13120

（End）
