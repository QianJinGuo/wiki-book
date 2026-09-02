---
title: "新加坡国立：实时Harness编排及演化 — JIT-Agent"
source_url: "https://xhslink.cn/o/4Byg0s62bkO"
note_id: "6a9740a70000000004033f2e"
ingested: "2026-09-02"
sha256: "fe5226e045e916c08cf27c848416d7bb393f00226a67ecb2500f6107437a78c7"
author: "智研Lab"
account: "智研Lab"
platform: "xiaohongshu"
arxiv: "2608.25593"
github: "https://github.com/bingreeky/JIT"
tags: [jit-agent, harness, agent-orchestration, nus, runtime-scaffolding, dynamic-harness]
---

# 新加坡国立：实时Harness编排及演化 — JIT-Agent

> **来源**：小红书 智研Lab（论文解读号）
> **论文**：arXiv:2608.25593，JIT-Agent，NUS
> **代码**：https://github.com/bingreeky/JIT

## 核心观点

Agent 能力不只由模型参数决定，记忆、规划、行动协议和工具编排组成的 Harness 同样关键。JIT-Agent 让模型看到任务后，生成适配的执行脚手架，而不是把固定流程用到底。

## 论文动机

以往 Harness 优化多是提前为一类任务做好的持久化方案，但深度搜索、终端操作和文件交付需要不同的记忆与控制方式。作者追问：能否让一个元模型根据任务和底层模型，现场定制、修复并持续进化 Harness？

## 方法创新

### 四模块协议
JIT-Agent 把 Harness 拆成记忆、规划、行动、能力编排四个可组合模块，在统一接口下生成可执行代码。针对任务重排上下文、子目标、工具和控制循环，而不只是改一段提示词。

### 三阶段训练与进化
1. 从教师示例学习任务适配
2. 从编译错误、接口不匹配和运行失败中学习修复
3. 用 Evo-GDPO 分别优化任务得分、延迟和成本

部署后，Streaming JIT 还会把有效 Harness 写回档案供后续任务检索。

## 重点结论

**同一模型换 Harness 就能提升**：
- GLM-5.2 接入 JIT-Agent：74.1 → 81.8
- DeepSeek-V4-Flash：66.7 → 75.5
- DeepSeek 在 DeepPlanning-Shopping：59.1 → 83.9（+24.8）

**更强不一定更贵**：
- JIT-Agent 在 6 个设置中都使用最少 Token 和最低 API 成本
- 成本平均降低 36.0%
- DeepSeek-V4-Flash xBench-DS：78.0 → 82.0，成本 $0.075 → $0.039

**24 个同模型对比中，JIT 生成 Harness 全部超过 ReAct，平均提升 7.6 分。**

## 一句话 Takeaway

Agent 的下一种扩展不只是堆更多参数，也可能是让它学会为每个任务搭出更合适的工作方式。
