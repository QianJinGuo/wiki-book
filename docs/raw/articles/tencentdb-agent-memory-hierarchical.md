---
title: "腾讯开源 TencentDB Agent Memory：符号化短期记忆+分层式长期记忆"
source_url: "https://www.xiaohongshu.com/explore/6a058276000000003503b5b8"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, tencent, agent, memory, short-term, long-term, hierarchical, persona]
ingested: 2026-07-02
sha256: f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7
---

# 腾讯开源 TencentDB Agent Memory

腾讯开源了 TencentDB Agent Memory，解决长程 Agent 的记忆管理问题。

## 现有方案的痛点

很多 Agent Memory 项目把历史对话切片丢进向量库，靠相似度召回。能跑 Demo，但任务一长就出问题：
- 工具调用日志越来越长
- 搜索结果越来越多
- 上下文窗口塞满过程垃圾
- 模型在信息泥潭里翻滚

## 核心设计：符号化短期记忆 + 分层式长期记忆

### 短期记忆 — 解决单次长任务上下文爆炸

- 厚重工具日志卸载到外部文件
- 中间层保留步骤摘要（JSONL）
- 最高层只给 Agent 一张轻量任务图
- Agent 平时只看任务结构，需要时再钻回原始文件

**关键**：不是简单摘要（省 Token 丢证据），而是**压缩索引**。高层保留结构，底层保留证据，中间靠 ID 打通。

### 长期记忆 — 解决跨会话用户理解

记忆分层 L0-L3 语义金字塔：

| 层级 | 内容 |
|------|------|
| L3 Persona | 用户画像：长期偏好和工作方式 |
| L2 Scenario | 场景块 |
| L1 Atom | 结构化事实 |
| L0 Conversation | 原始对话 |

平时用 L3 理解用户，需要具体事实时回到 L1 甚至 L0。比"召回几条最相似历史"更像真正可用的记忆系统。

### Benchmark

| Benchmark | 成功率提升 | Token 消耗下降 |
|-----------|-----------|---------------|
| WideSearch | 33% → **50%** | 221.31M → **85.64M** (-61%) |
| SWE-bench | 58.4% → **64.2%** | 3474.1M → **2375.4M** (-32%) |
| AA-LCR | 44.0% → **47.5%** | 112.0M → **77.3M** (-31%) |
| PersonaMem | 48% → **76%** | — |

## 类比

更像一套分层文件系统：上层是画像和任务图，中层是场景/步骤/索引，底层是原始证据。平时压缩，必要时展开；平时抽象，出问题时追证。
