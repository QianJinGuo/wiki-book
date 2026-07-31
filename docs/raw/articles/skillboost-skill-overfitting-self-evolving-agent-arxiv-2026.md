---
title: "Self-Evolving Agent：自进化的隐藏陷阱"
source_url: "https://www.xiaohongshu.com/discovery/item/6a6b00e6000000000e03572b"
source_site: "xiaohongshu.com"
source_account: "西湖醋鱼"
author: "西湖醋鱼"
ingested: 2026-07-31
sha256: "bc25c3a1cbe93b4e47823946c48b227afcfa869ef66c5a1db4eb8eff221896ae"
type: raw-article
tags: [agent, skill, self-evolution, skill-overfitting, skillboost, arxiv, regression-test]
---

# Self-Evolving Agent：自进化的隐藏陷阱

大家都在教 AI Agent 从错误中学习。但我们发现了一个很反直觉的现象：它可能越来越会做"见过的题"，却越来越不会做"没见过的新题"。这就像把每道错题的答案都背进错题本——分数看起来提高了，但真正的能力没有提升。

我们把这个问题叫作：**Skill Overfitting（技能过拟合）**。

## 问题背景

现在很多 Agent 会把历史经验写成外部 Skill，再根据失败案例不断修改它。这样不需要重新训练大模型，就能快速更新能力。

问题是：如果每次都围绕眼前的几个错误修改，Skill 很容易记住具体案例；如果修改得太大胆，又可能把原来能做对的任务改坏。

## SkillBoost：把 Skill 自进化理解为"有约束的探索过程"

主要做三件事：

1. **先定位真正的错误**：不是看到结果错了就重写整个 Skill，而是沿着执行轨迹回溯，判断问题究竟出在工作流、约束条件，还是参考知识。
2. **一次生成多个修复方案**：既有只修当前错误的保守方案，也有借助大模型先验、覆盖相似问题的扩展方案。
3. **修改前先做"回归考试"**：一个新 Skill 不仅要修好更多错误，还不能破坏太多原本正确的案例。修得没有破坏得多，就不允许上线。

## 实验效果

实验覆盖了 Claude、Qwen、DeepSeek、Kimi 等模型，以及工具调用、数学推理、表格操作、具身任务和文档问答等场景。

- 在 23 个模型—任务配置中，SkillBoost 整体优于人工编写和大模型生成的 Skill，并把训练集与测试集之间的过拟合差距控制在接近零的水平。
- 其中一个配置中，相比不使用 Skill，准确率提升了 47.4 个百分点。
- 优化出来的 Skill 还可以迁移给其他模型和相近任务使用。

## 核心启示

真正的自进化，不是把每次失败都记下来，而是知道该改哪里、探索几种改法，并确认这次修改没有让过去的能力退化。

AI Agent 下一阶段的竞争，可能不仅是谁拥有更多 Skill，而是谁能让 Skill 持续进化，同时不过拟合。

原文：https://arxiv.org/pdf/2607.26643
