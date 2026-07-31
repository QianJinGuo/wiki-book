---
title: "AgentOmnia：探索Agent大模型全场景Scaling"
source_url: "https://www.xiaohongshu.com/discovery/item/6a698279000000000c014a3e"
source_site: "xiaohongshu.com"
source_account: "花落、花满天"
author: "Huawei Cloud Post-Training Team"
ingested: 2026-07-31
sha256: "44e13eebb9e600cb7a57b82addeeb0305df774977f2bd2a1890f374cf07cb384"
type: raw-article
tags: [agentic-rl, agent-omnium, post-training, data-synthesis, evaluation, huawei-cloud, scaling]
---

# AgentOmnia：探索Agent大模型全场景Scaling

> 技术报告：AgentOmnia: Scaling Agentic Models for Full-Scenario Applications
> 团队：Huawei Cloud Post-Training Team
> AgentOmnia 论文：https://arxiv.org/abs/2607.23124
> OmniaBench 论文：https://arxiv.org/abs/2607.14989
> OmniaBench 评测代码与评测集：https://github.com/scuuy/OmniaBench

最近，我们把团队在 Full-Scenario Agentic Scaling 上的技术探索整理成了技术报告 AgentOmnia，初步分享如何通过统一的任务空间，衔接数据构造、模型后训练、评测诊断与持续迭代，进而系统性扩展 Agent 大模型的全场景能力。

## 关注的问题

模型在少数工具调用 benchmark 上取得高分后，如何进一步扩展到不同应用、能力和任务难度？

## 主要做了三件事

1. 用 **Domain × Capability × Atomic Difficulty** 定义全场景任务空间；
2. 通过 **DAG、Program 和 Solver 三类管线**，构建难而可验证的环境与任务；
3. 结合**特权指导、SFT、Agentic RL 和 RCRL**，将困难任务（teacher 模型也只能做对一半的难任务，简单蒸馏是不行的）转化为有效训练信号，并尝试用 **PRD** 承接评测诊断、指导后续数据合成。

## 规模与效果

基于以上，构建 **5,018 个可执行有状态环境、255,375 个工具和 52,361 个任务**，基于 Qwen3-30B-A3B-Thinking-2507 进行了 Agentic SFT/RL，全场景技术收益：

1. **OmniaBench 挑战集：9.16% → 37.11%**
2. **四项 benchmark 宏平均：22.86% → 41.69%**
3. **76/90 个一级领域获得提升**
4. **全部 10 类能力和 8 类原子难度因素获得提升**

差不多在各类 Agent 任务中，都把 Qwen3 的指标拔到了 Qwen3.5 往上一点。

## 后续方向

正在将技术进展迁移应用到更强基座、更大规模和复杂生产环境中，同时也在探索一些前沿技术专项。
