---
source_url: https://www.xiaohongshu.com/explore/6a73f90e000000002202e1c1
ingested: 2026-08-06
sha256: 1be8b25582591cd9cc834f9f963f0f579e029ce44b778853aad0561528550911
title: "上海AI Lab：Agent的大规模skill-use训练——SKT 流水线与 SkillEval 基准"
author: 大模型知识分享 (AIChannel)
source: 小红书 (XHS)
type: raw
tags: [agent-skills, skill-use, shanghai-ai-lab, data-synthesis, sft, skill-evaluation]
---

# 上海AI Lab：Agent的大规模skill-use训练——SKT 流水线与 SkillEval 基准

> 原始来源：https://www.xiaohongshu.com/explore/6a73f90e000000002202e1c1
> 作者：大模型知识分享（AIChannel，小红书论文解读号，2026-08-06）

## 问题背景

Agent skills 已经成为让语言模型 agent 具备可复用程序性知识的重要机制。然而，**仅仅提供 skills 并不能保证当前模型能够有效地识别、应用和协调它们**——skill-use（技能使用）本身是需要训练的能力。

## 核心方法：SKT 数据合成流水线

上海 AI Lab 团队提出一个**可验证的数据合成流水线 SKT**（Skill Training），从大规模的 agent skills 集合中构建以 skills 为基础的任务和可执行轨迹：

1. **选择合适的单 skill 和多 skill 配置**——覆盖单技能使用与多技能协调场景
2. **通过基于规则和基于 agent 的验证结合反馈引导的修复来合成任务**
3. **只保留那些充分使用了每一个所需 skill 的成功轨迹**——数据质量门控

数据规模：基于 **2000 个公开 skills**，SKT 生成了 **4000 个任务包** 和 **27164 条经过验证的轨迹**。

## 配套基准：SkillEval

基于同一套流水线和一个独立的测试池，进一步构建了用于评估 skill-use 能力的**留出可执行基准 SkillEval**（held-out executable benchmark）。

## 实验结果

在不同模型、不同基准和不同 agent harness 上的实验表明，**在 SKT 生成的轨迹上进行监督微调（SFT）能持续提升 skill-use 性能**。

验证消融实验、跨执行环境评估和扩展实验进一步表明，这些提升：
- **依赖于高质量的监督**（验证消融：去掉验证环节提升消失）
- **能够扩展到单一 agent 接口之外**（跨执行环境评估）
- **会随着 skill 覆盖范围的扩大而增加**（扩展实验）

## 意义

SKT 把"skill-use 训练数据"从人工构造/不可验证的状态推向**可验证的大规模自动合成**，与 SkillEval 基准配套形成"训练数据 + 评测基准"闭环——是 skill 工程从"怎么写 skill"走向"怎么训练模型用 skill"的关键一步。

（End）
