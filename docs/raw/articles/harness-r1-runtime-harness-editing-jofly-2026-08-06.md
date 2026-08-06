---
source_url: https://www.xiaohongshu.com/explore/6a73f66c00000000210222ea
ingested: 2026-08-06
sha256: 947a64bdd46b0479ce335f60abfed08d34f36e9e4d09080393066b291433573c
title: "让AI学会修改自己的Runtime Harness——Harness-R1"
author: Jofly
source: 小红书 (XHS)
type: raw
tags: [harness-engineering, self-improving-agent, runtime-harness, grpo, harness-editing]
---

# 让AI学会修改自己的Runtime Harness——Harness-R1

> 原始来源：https://www.xiaohongshu.com/explore/6a73f66c00000000210222ea
> 作者：Jofly（小红书，2026-08-06 发布，第一方研究团队分享）

## 一句话定位

Harness-R1 是首个将「基于失败轨迹、覆盖 Agent 全生命周期的 Runtime Harness 编辑」作为一种**可学习能力**的方法。核心主张：除了持续优化模型参数之外，Runtime Harness 同样可以成为一种能够学习、持续演化、并与 Agent 共同进化的能力。

## 研究背景

团队持续关注 Harness Engineering 和 Self-Improving Agents 相关研究，认为 **Harness Editing 应该成为 Foundation Models 本身具备的一种能力**。

Agent 在部署后会不断积累交互轨迹，但它们的行为通常仍然是固定的。传统方法更多是利用这些轨迹继续优化模型参数（RLHF/DPO/GRPO 训练路线），而 Harness-R1 选择另一条路径：**利用失败轨迹，持续优化 Agent 的 Runtime Harness**。

## Runtime Harness 的定义

Runtime Harness 负责 **Context 构建、Tool 调用、Action 校验、Recovery** 等运行时逻辑，对 Agent 的最终能力有着重要影响。

## 核心思路（三步）

1. **训练一个专门的 Harness Engineer**，负责编辑 Runtime Harness
2. **将目标 Agent 的失败轨迹转换为可执行的 Runtime Patch**，并重新运行相同任务，以**真实任务成功率作为奖励信号**
3. 通过 **Cold-start SFT + Online GRPO**，让 Harness Engineer 学会生成真正能够提升 Agent 表现的 Runtime 编辑——而不是仅仅生成看起来合理的修改

关键设计：奖励信号不是"修改是否合理"（看起来合理），而是"重新运行任务后的真实成功率"（实际有效）。

## 实验结果

在 WebShop、ALFWorld、DBBench 三个经典 Agent Benchmark 上：

- **Vanilla Qwen3.5-9B**：平均成功率从 **44.3% 提升到 53.6%**
- **已 SFT 的目标 Agent**：Harness-R1 仍可进一步将平均成功率从 **59.2% 提升到 64.2%**

两个实验组共同说明：即使目标 Agent 已经过 SFT 优化，Runtime Harness 编辑仍能带来额外增益——Harness 编辑与模型参数优化是互补的两条改进路径。

## 与已有工作的范式差异

| 范式 | 谁改进 Harness | 改进对象 | 训练 |
|------|---------------|---------|------|
| Self-Harness（上海 AI Lab） | 固定权重模型自己 | 声明式 Harness 状态（inference-time 提案+验证） | 无 |
| Meta-Harness（Stanford） | 更强外部 Agent | Harness 代码空间 | 无 |
| **Harness-R1（本文）** | **专门的 Harness Engineer 模型** | **Runtime Harness（Runtime Patch）** | **Cold-start SFT + Online GRPO** |

Harness-R1 与 Self-Harness 表面同属"harness 自我改进"方向，但机制根本不同：Self-Harness 是固定权重模型在 inference 时自己提案修改并用 held-in/held-out 双门控验证（不训练）；Harness-R1 是训练一个专用 Harness Engineer 模型（参数更新），用失败轨迹→Runtime Patch→重跑任务真实成功率的闭环奖励来学习编辑 Runtime Harness。Harness-R1 把"改 harness"本身变成了可学习的生成任务。

（End）
