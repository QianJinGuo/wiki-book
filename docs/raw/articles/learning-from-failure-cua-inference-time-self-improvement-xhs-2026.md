---
title: "斯坦福：失败轨迹是天然、高价值的监督信号"
source_url: "https://www.xiaohongshu.com/discovery/item/6a4799a600000000160269d4"
source_site: "xiaohongshu.com"
source_account: "WebAgentLab"
author: "WebAgentLab"
ingested: 2026-07-31
sha256: "04763e9a9cb51131c8e9c88567326fc4f79b537b78fed128c867623a46a104a0"
type: raw-article
tags: [computer-use, cua, self-improvement, failure-trajectory, inference-time, os-world]
---

# 斯坦福：失败轨迹是天然、高价值的监督信号

那些失败的轨迹去哪了？绝大多数工作都会直接丢弃。6月30日，斯坦福发表《Learning from Failure: Inference-Time Self-Improvement for Computer-Use Agents》新研究，提出失败并不是噪声，而是 Agent 最有价值的学习资源。

## 论文背景

目前，CUA 主要依赖成功轨迹进行自我进化。但现实中，一个 Agent 往往失败远多于成功，而这些失败其实暴露了模型最真实的能力边界，例如：

- ❌ 找不到正确的 UI 元素
- ❌ 不会调用更高效的系统接口
- ❌ 缺乏任务相关知识
- ❌ 一直重复点击、进入死循环

传统方法却直接把这些失败样本全部丢掉。论文认为：失败轨迹其实是一种天然、高价值的监督信号。

## 核心思路

作者没有重新训练模型，而是设计了一套失败驱动自我改进流程。整个流程可以理解成：

1. 📉 Agent 执行失败
2. 🧠 LLM 自动分析失败原因
3. 🔧 生成可执行的代码 Patch
4. 👨‍💻 人工轻量验证
5. 🚀 推理阶段直接加载 Patch，让 Agent"现场升级"

整个过程几乎不需要重新训练模型，只增加了一点推理成本。

## LLM 都修复了哪些问题？

论文总结了几类最常见的失败模式：

- **视觉定位错误**：Agent 找不到按钮、菜单或输入框。→ 增强 UI 搜索策略，提高元素定位能力。
- **能力缺失**：很多任务其实可以直接调用 Terminal 或系统命令，但 Agent 只会一直点鼠标。→ 自动增加终端执行能力。
- **知识不足**：例如不会使用某个软件功能。→ 推理过程中允许访问文档、搜索引擎等外部知识。
- **重复循环**：不停点击同一个按钮，却始终无法完成任务。→ 自动检测重复行为，并提醒 Agent 更换策略。

可以理解为：不是训练一个更聪明的 Agent，而是在推理时给 Agent 一个"动态外挂"。

## 实验效果

作者基于 OpenCUA-72B 在 OSWorld 上进行了验证。

- 成功率：
  - Baseline：42.3%
  - Failure-driven Self-Improvement：48.9%
  - 绝对提升 +6.6%，相对提升约 15.6%

- 更重要的是：没有额外训练成本。
- 此外，在多个 GUI 基准上也都有提升

## 总结

对于未来的 CUA，或许不仅需要会完成任务，更需要理解自己为什么失败，并在推理过程中即时修正自己。
