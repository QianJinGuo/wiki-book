---
title: "Memory in the LLM Era: Modular Architectures and Strategies in a Unified Framework"
source_url: "https://mp.weixin.qq.com/s/KZJbjozIest4pe5oftACcg"
ingested: 2026-04-30
type: raw
tags: [agent-memory, architecture, retrieval-augmented-generation, memory-management, llm-agent, iclr2026, long-context]
review_value: 8
review_confidence: 7
review_recommendation: worth-reading
review_stars: 4
sha256: "{pending}"
created: 2026-05-10
updated: 2026-05-10
---
# 原文存档：Memory in the LLM Era（ICLR 2026 投稿）
## 文章信息
- **来源**：微信公众号" NewGridAI"（微橙酒）
- **论文**：*Memory in the LLM Era: Modular Architectures and Strategies in a Unified Framework*，arXiv:2604.01707
- **代码**：https://github.com/Yanchen398/Memory-in-the-LLM-Era
## 核心内容
### 背景问题
LLM Agent 在多轮对话、长期任务中需要持续积累过去的交互、偏好、事实变化和任务状态。Naive long-context prompting（将历史全部放入 prompt）的问题：上下文窗口溢出、token 成本高、推理延迟增加、模型难以找到真正相关证据。
### 统一框架：四组件
论文将 Agent Memory 拆解为四个核心组件：
1. **Information Extraction**（记什么）
   - 直接归档、总结式提取、基于图的提取
2. **Memory Management**（怎么维护）
   - 连接相关经验、整合碎片记忆、层级迁移、更新已有记忆、过滤无用信息（五类操作）
3. **Memory Storage**（存在哪）
   - 组织结构：扁平式（JSON/队列） vs 层级式（长短期/树结构）
   - 表示方式：基于向量 vs 基于图
4. **Information Retrieval**（如何取回）
   - 词汇匹配检索（BM25、Jaccard）
   - 向量检索（余弦相似度、ANN）
   - 结构检索（图/树遍历）
   - LLM 辅助检索（LLM 参与判断相关性）
### 实验设置
- **数据集**：LOCOMO（人类长期对话）、LONGMEMEVAL（用户与 AI 长期交互）
- **覆盖任务**：单跳/多跳/时间推理/开放域知识/信息提取/多会话推理/知识更新
- **方法对比**：10 种代表性 Agent Memory 方法
### 主要发现
1. **层次化方法领先**：MemTree、MemoryOS、MemOS 等树状层次方法表现突出——多层结构同时保留高层摘要和底层证据
2. **粗粒度处理降低 token 消耗**：将多轮对话作为整体处理，适当的粗粒度处理反而可能提升记忆效果
3. **上下文扩展脆弱**：上下文规模扩展到 200% 时，几乎所有方法都会出现性能下降；层次管理更稳定
4. **证据位置敏感性**：多数方法在关键证据位于更早会话时，更容易被后续信息干扰而检索失败
5. **底层 LLM 决定上限**：从 Qwen2.5-7B 扩展到 72B 后，多数方法都有明显提升
### 新 SOTA 算法
组合 MemTree/MemOS 的树状组织能力与 MemoryOS 的分层存储架构，设计出低 token 开销新框架（lme-sota）。
## 元数据
- **论文链接**：https://arxiv.org/abs/2604.01707
- **代码仓库**：https://github.com/Yanchen398/Memory-in-the-LLM-Era
- **数据集**：LOCOMO、LONGMEMEVAL
- **对比方法数**：10 种代表性方法