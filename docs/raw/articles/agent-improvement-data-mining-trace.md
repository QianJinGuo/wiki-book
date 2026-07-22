---
title: "改进 Agent，本质上是一个数据挖掘问题"
source_url: "https://mp.weixin.qq.com/s/ArXh7ppY_RffVqP23y6VvQ"
source_site: "无糖AI"
author: "无糖ai（整理自 LangChain Labs Viv 演讲）"
ingested: "2026-07-08"
sha256: "220f188fd62c537d3c16e8fd7c2c5602042b7cf43f5c48285682ccead1b6b343"
type: raw
tags:
  - agent-improvement
  - trace
  - continual-learning
  - observability
  - langchain
  - harness-engineering
  - evaluation
  - data-mining
---

> 持续学习（Continual Learning）、Harness 工程、后训练（Post-Training），本质上都归结于同一件事——大规模地整理数据，用于运行实验、改进 Agent。

## 核心观点

### Trace 是长周期 Agent 改进的「货币」
Agent 的行为比传统代码更不透明，我们用确定性换取了自主性，然后用 Trace 填补理解鸿沟。Trace 是 Agent 在环境中经验的投影，转化为可挖掘、可理解的数据格式。

### 每一家做持续学习的公司，都是一家可观测性公司
持续学习的本质：Agent 在环境中采取行动，将经验信息重新整合回系统。

### 三种信息整合方式
1. 收集训练数据 → SFT/RL 整合回模型权重
2. Harness 工程 → 增加指令、工具、技能、编排策略
3. 信息整合进记忆库 → 用于上下文检索

### Trace 挖掘 + 改进配方
启动数据收集飞轮 → 挖掘数据发现改进点 → 整理评测集 → 运行实验

## LangChain 实践

- **Trace Judge Model**：微调的开源小模型，在窄任务上表现优于闭源前沿模型，成本低数个数量级
- **LangSmith Engine**：一组专用 Agent 阅读每条 Trace，发现问题、生成代码修复、生成评测集
- **Terminal Bench 2.0**：仅通过 Harness 调优就取得 13.7% 提升

## Harness 工程 vs 微调

三明治结构：**Harness 工程 → 微调 → Harness 工程**
- Harness 工程足够大部分团队使用，获得即时反馈
- 遇到智能天花板后再做微调
- 微调后再进一步 Harness 工程探索新能力边界

### 核心公式
评测集 = Agent 的训练数据。找到好数据 + 找到好的拟合函数 = 改进 Agent。

## Scaling Dreaming（规模化造梦）
在大规模数据、长时间跨度上，将 Agent 数据整合回 Agent 本身的过程。
