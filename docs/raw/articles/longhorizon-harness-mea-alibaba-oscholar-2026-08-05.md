---
source_url: https://www.xiaohongshu.com/explore/6a72b4dc0000000006005f4c
source: xiaohongshu
title: "阿里提出新框架：三段式管理重构长时程Agent — LongHorizon-Harness"
ingested: 2026-08-05
type: raw-article
tags: [agent, harness, long-horizon, state-management, alibaba, dreamx, mea]
sha256: 194ec18e562944b60dba3ee2f4f9d7d4ab4cfd7ffc130f1a56cdf3e4e946c311
---

# 阿里提出新框架：三段式管理重构长时程Agent — LongHorizon-Harness

> 作者：Oscholar（小红书研究组论文解读号）
> 发布于小红书，2026-08-05（上海）。

## 正文

大部分长时程 Agent 的问题不是不会调用工具，而是任务一长，状态就容易被做乱。任务推进到哪一步、哪些目标已完成、接下来该修什么，常常都被塞在一段不断膨胀的上下文里；一旦某一步自我判断出错，后面的规划和执行就会一路被带偏。

阿里 DreamX 团队提出 LongHorizon-Harness，把长时程执行重新定义成**任务状态管理**。Agent 不再是一边执行、一边在上下文里维护"我现在做到了哪一步"。这套框架把任务状态显式放到执行之外，只允许用环境里独立核实的事实更新状态，而不是继续依赖模型自己"回忆"和"判断"。

整套框架采用 **Manage-Execute-Audit 三段循环**：
- 🌟 **Manager** 维护任务状态，并决定下一步子任务
- 🌟 **Executor** 在 fresh context 里执行，不背着不断增长的历史上下文继续跑
- 🌟 **Auditor** 只读核对环境里到底发生了什么，再把核实后的结果写回状态

论文还加了一个轻量 **AgentAdapter**，可以在不改原有 agent 循环的前提下替换模型和 harness 后端，这让状态管理层和执行层能分开迭代。

结果显示：
- 🔷 在 **WeaveBench** 上，Qwen 3.7-Plus 从 51.8% 提升到 80.7%
- 🔷 在 **Terminal-Bench 2.1** 上，从 69.7% 提升到 77.2%
- 🔷 在 **OSWorld 2.0** 上，从 2.8% 提升到 8.3%
- 🔷 换到 **Claude Opus 4.7**，在 OSWorld 2.0 子集上也从 20.0% 提升到 34.3%

这篇工作更像一次长时程 Agent 工程范式的调整。它把"状态"从上下文里拆出来，把"完成判定"从模型自述改成环境核实，再把 harness 和模型解耦。MEA 分离配合 AgentAdapter 也意味着 harness 与模型可独立迭代。

适合做 Agent、Harness、LLM 和 benchmark 等方向的同学，论文 PDF 已上传到附件👇。

## 话题标签
#harness #agent #ai #科研 #学术 #大模型 #人工智能 #llm #论文 #博士

## 关联
- 与 [[raw/articles/lhtb-long-horizon-terminal-bench-musk-retweet-yucheng-shi-2026|LHTB]]（同日入库，长时程终端评测）互补：LHTB 提供评测基准，LongHorizon-Harness 提供状态管理解法
- 与 [[entities/harness-handbook-tencent-behavior-level-manual-2026|Harness Handbook]] 同属 harness 工程范式；Handbook 以行为导航，LongHorizon-Harness 以状态管理为轴
- 现有实体 `agent-harness-12-components-7-decisions`、`agent-context-management-architecture-patterns` 覆盖 harness 架构与上下文管理模式，MEA 为上下文外置化的新实例
