---
title: "别再手写 Skill 了！微软最新研究：像神经网络一样训练 Skill"
description: "SkillOpt：将 Skill 文档当作神经网络权重，用 rollout→reflection→edit 循环自动优化，52/52 最优，平均 +23.5 分"
source_url: "https://mp.weixin.qq.com/s/sqHF3d3l5PX3VOs0Mtwk3A"
feed_name: "AGI Hunt"
author: "尹John"
published: 2026-05-26
created: 2026-05-27
type: raw
tags: [skill, agent-training, microsoft-research, skillopt, llm-optimization]
sha256: "52eee22f72fbc1bd05456f8e08beea3b1c70c24056d18d623e3ec3676db6552f"
---

# 别再手写 Skill 了！微软最新研究：像神经网络一样训练 Skill

SkillOpt · 52/52 最优 · 平均 +23.5 分

这篇微软最新的研究论文，可能会改变你写 Skill 文档的方式。

## 关于 Skill

Claude Code、Codex、Cursor 这些工具都已经支持用户写一份「指令文档」来指导 Agent 的行为。不论是 Claude Code 的 CLAUDE.md 或是 Codex 里的 Agents.md 或是 Skill 的各种文档，它们的共性是：

一段纯文本指令，告诉 Agent 遇到什么情况该怎么做。

但问题在于，你怎么知道自己写的那几条规则就是最好的呢？

你凭经验写了 5 条规则，可能漏了 3 条关键的，还有 2 条写得不够精准。更麻烦的是……你根本不知道自己漏了什么，因为你没法穷举所有可能的写法。

## SkillOpt 核心思路

把 Skill 文档当成神经网络的「权重」，用类似训练神经网络的方式去自动优化它。

Agent 的模型参数是冻结的，不能动，但 Skill 文档是纯文本，可以随便改。既然如此，为什么不能像训练神经网络一样，用一套完整的优化流程来迭代优化这份文档呢？

## 训练循环

深度学习概念到文本空间的映射：

| 深度学习 | SkillOpt |
|---------|----------|
| forward pass | **rollout**：让 Agent 带着当前的 Skill 文档去做一批任务，收集完成情况 |
| gradient | **reflection**：用优化器模型分析哪些任务失败了、为什么失败，并提炼出改进方向 |
| weight update | **edit**：对 Skill 文档做 add、delete、replace 三种结构化编辑 |
| learning rate | **textual learning rate**：每轮最多只允许改 L_t 条规则（默认 4 条），cosine decay 衰减 |
| validation checkpoint | **validation gating**：改完之后在验证集上跑一遍，如果分数没涨，那就不能接受这次修改 |

## 两个模型分工

- **target model**（目标模型）：平时用的 Agent，模型本身冻结不动
- **optimizer model**（优化器模型）：更强的前沿模型，负责分析 target model 的表现，然后提出修改建议

同级别优化器也能工作，大约能恢复强优化器 56%-74% 的增益。但用更强的优化器效果显然更好。

## 克制的学问

每轮最多只改 4 条规则。无限制重写（unbounded）的效果比 L_t=4 低了 2-3 分。

**rejected-edit buffer**：被验证集否掉的修改会存进缓冲区，后续的 reflection 阶段会看到这些「前车之鉴」。

**slow/meta update**：类似于深度学习中的 momentum。每个 epoch 结束时跨 epoch 纵向更新，这种慢更新的内容受到保护。去掉 slow/meta update 会导致 SpreadsheetBench 从 77.5 暴跌到 55.0（-22.5 分）。

## 实验结果

相比直怼 GPT-5.5 对话的结果：

| Benchmark | 直怼 GPT-5.5 | SkillOpt | 提升 |
|-----------|-------------|----------|------|
| SearchQA | 77.7 | 87.3 | +9.6 |
| SpreadsheetBench | 41.8 | 80.7 | +39.0 |
| OfficeQA | 33.1 | 72.1 | +39.0 |
| DocVQA | 78.8 | 91.2 | +12.4 |
| LiveMath | 37.6 | 66.9 | +29.3 |
| ALFWorld | 83.6 | 95.5 | +11.9 |
| **平均** | — | — | **+23.5** |

52 个测试格，全部最优或并列最优。在 Codex 执行环境中平均 +24.8 分，在 Claude Code 执行环境中平均 +19.1 分。

## 学到的规则示例

**SearchQA**：根据线索的措辞推断预期答案的类型，然后从共现的独特证据中选择最短的规范实体。

**SpreadsheetBench**：先检查工作簿结构和公式，然后在整个请求的目标范围内写入已计算的静态值，而非依赖 Excel 自动重算。

**ALFWorld**：维护一个包含地平线感知的已访问/前沿位置清单，在连续相同类型的失败后切换搜索方向，并在拿到目标物品之前避免重新访问目的地。

特点：极度具体、反直觉、紧凑（379-1995 tokens，中位数约 920）。

## 跨模型跨环境迁移

- GPT-5.4 → GPT-5.4-mini（SpreadsheetBench）：+9.4
- Codex → Claude Code（SpreadsheetBench）：+59.7
- OlympiadBench → Omni-MATH（GPT-5.4）：+3.7

训练成本：流程类 benchmark 每提升 1 分需要 0.6-3.6M 训练 token；复杂轨迹类需要 37.9-46.4M token。

## 开源地址

- 论文：https://arxiv.org/abs/2605.23904
- GitHub：https://github.com/microsoft/SkillOpt
- 项目主页：https://microsoft.github.io/SkillOpt/