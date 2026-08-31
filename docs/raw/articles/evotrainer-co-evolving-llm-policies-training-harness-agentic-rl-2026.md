---
title: "EvoTrainer：策略与Harness共进化，跑通自主闭环"
source_url: "https://mp.weixin.qq.com/s/9VteqjNLM5slD6qCLe7m-A"
author: "PaperWeekly"
ingested: "2026-08-31"
sha256: "b6c641fc9d8a2dec91f6aee33321a1126cd7cdc492b063b52d0e083b77c13146"
source_type: "wechat_mp"
---

# 不止AutoResearch！策略与Harness共进化，EvoTrainer跑通自主闭环

> 原文：https://mp.weixin.qq.com/s/9VteqjNLM5slD6qCLe7m-A

EvoTrainer 是一种让大语言模型训练策略与 Training Harness 协同进化的自主训练方法。它不只是在 Agentic RL 中自动跑实验、调参数，更关键的是让系统能随着模型变强，持续提升发现、诊断和解决训练问题的能力。

论文标题：EvoTrainer: Co-Evolving LLM Policies and Training Harnesses for Autonomous Agentic Reinforcement Learning
论文地址：https://arxiv.org/abs/2606.03108
代码地址：https://github.com/AlibabaResearch/DAMO-ConvAI/tree/main/EvoTrainer

## 核心观点

传统自主训练中，Training Harness 往往被视为固定基础设施：Reward 定义、样本过滤、回测逻辑、诊断方式一旦设定，后续训练只是在这套静态框架内搜索更优参数或配方。但在长程、多步、强交互的 Agentic RL 任务中，这种假设并不成立。随着策略不断变强，原有 Harness 的局限会逐步暴露：原先有效的 Reward 可能失去区分度；原先足够的评估方式可能无法识别投机行为；原先粗粒度的诊断逻辑难以解释新的失败模式。

因此，真正的自主训练不应只优化模型参数，而应让训练策略与 Training Harness 处于同一个协同进化闭环中：策略变强，暴露新的瓶颈；Harness 感知瓶颈，升级诊断与回测能力；新的 Harness 再反过来为策略提供更可靠的优化信号。

## 相关工作

### AutoResearch：自动化实验搜索

AutoResearch 通过"修改代码→启动训练→验证指标→决策保留/回滚"的闭环，实现了训练方案的自动探索。然而，这种范式的本质仍是"基于静态标尺的快速试错"——Harness 在整个过程中始终保持不变。

### 推理侧 Harness 演化：Meta-Harness 与 AHE

Meta-Harness 率先打破"Harness 即固定基础设施"的传统认知；AHE 进一步系统化了可观测性信号作为改动有效性的验证依据。但两者演化边界均严格限定在 Inference-Time，存在信号断层。

## 方案：训练策略与训练 Harness 的协同进化

EvoTrainer 将训练过程组织为一条可追踪的版本链，每一轮策略更新都会暴露新的行为模式、瓶颈和失效现象，训练侧的 Harness 会据此调整自己的诊断方式。

关键关注维度：
- **信号有效性**：当前 Reward 是否仍具备足够的区分度
- **行为稳定性**：Rollout 轨迹是否出现分布偏移、模式崩塌
- **版本可比性**：相邻版本间的性能差异是否能被现有诊断证据合理解释
- **评估鲁棒性**：高分结果是否可能源于数据泄露、评估漏洞或随机噪声

### Memory & Skill：让 EvoTrainer 具备持续进化能力

Memory + Skill 是 EvoTrainer 区别于"只会反复试配方"的关键能力。Skill 把有效方法沉淀成可跨任务复用的能力：分析器技能（analyzer skills）、修复策略（repair strategies）、训练流程模板（procedure templates）。

### SWE 场景案例：从最终正确性到行为奖励

1. **仅依赖最终正确性**：大量失败轨迹共享同一个低分，信号极其稀疏
2. **引入行为奖励**：把"健康过程"显式纳入训练信号——代码编辑轨迹完整性（ETT）和测试执行行为（SBE）
3. **增强 Reward 区分度**：调整行为信号相对权重（ETT 略高于 SBE）
4. **高质量比较信号过滤**：StdGroupFilter 过滤掉缺乏区分度的 Rollout Groups

## 实验

在 Math、Coding、SWE 三类任务上评估。整体结果表明 EvoTrainer 在三类任务上都稳定有效。不同任务最后需要的能力不同：Math 更需要计算能力增强；Coding 更需要 Reward Shaping 和 Filtering；SWE 更需要行为敏感的训练路径。

## 总结

EvoTrainer 在三个维度上实现升级：
1. 从"实验搜索"到"诊断决策"（对标 AutoResearch）
2. 从"静态基础设施"到"协同演化对象"（对标 Meta-Harness）
3. 从"一次性调试"到"可迁移的认知资产"（对标 AHE）
