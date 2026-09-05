---
source_url: https://www.xiaohongshu.com/explore/6a7410a9000000002500e5e4
ingested: 2026-08-06
sha256: 86c4399de64e2acbc14a2951d94cd1542afce3268a1ba954a4fafcafa9432597
title: "AgentEvolver：自我提问+自我导航+自我归因——阿里通义实验室"
author: 晓辉算法笔记
source: 小红书 (XHS)
type: raw
tags: [agent, self-evolution, tongyi-lab, alibaba, reinforcement-learning, credit-assignment]
---

# AgentEvolver：自我提问+自我导航+自我归因——阿里通义实验室

> 原始来源：https://www.xiaohongshu.com/explore/6a7410a9000000002500e5e4
> 作者：晓辉算法笔记（小红书论文解读号，2026-08）
> 论文：AgentEvolver: Towards Efficient Self-Evolving Agent System
> 团队：阿里巴巴通义实验室（Tongyi Lab, Alibaba Group）
> 开源：github.com/modelscope/AgentEvolver

## 问题：训练 agent 的三件苦力活全靠人

训练一个会用工具、能做多步任务的 AI 智能体代价高昂：**人来出题（造训练任务）、人来设计奖励、人来标注过程**。在一个全新环境里，光是造出足够多样的任务就得耗费大量人力；强化学习又需要海量采样，接近"暴力穷举"，样本利用率极低。

AgentEvolver 的核心思路：既然大模型推理能力越来越强，为什么不让它自己驱动自己的学习？

## 三个协同机制（对应训练流程三环节）

### 1️⃣ 自我提问（Self-Questioning）

让模型带着"好奇心"去探索陌生环境，**自动生成训练任务**。巧妙设计：**先探索再出题**——答案天然藏在探索轨迹里，省去了人工标注。

### 2️⃣ 自我导航（Self-Navigation）

把过去成功和失败的经验提炼成自然语言"**经验条**"（experience entries），检索复用——让探索从"瞎试"变成"有经验地探"，还能把经验真正内化进模型。

### 3️⃣ 自我归因（Self-Attribution）

不再像 GRPO 那样对所有步骤一视同仁，而是让 LLM **回溯判断每一步是 GOOD 还是 BAD**，做细粒度的信用分配（对应 ADCA-GRPO：轨迹级因果信用分配）。

## 实验结果

- **AppWorld 和 BFCL v3** 两个基准：7B 模型整体 avg@8 提升 **29.4%**，14B 提升 **27.8%**
- **AgentEvolver-14B** 用远小的参数量，追平甚至超过 **Qwen3-235B**
- 只用 **100 个自己合成的任务**就能达到 40.3% 的高分
- **样本效率大涨**：达到基线最终性能 90% 所需的训练步数减少 **55%~67%**

## 意义

AgentEvolver 把"人来出题、人来给奖励、人来判卷"这三件苦力活一一交还给了大模型自己，让智能体从"被训练的对象"变成"**训练过程的设计者**"——从"数据驱动"走向"好奇心与反思驱动"的一个重要信号。

（End）
