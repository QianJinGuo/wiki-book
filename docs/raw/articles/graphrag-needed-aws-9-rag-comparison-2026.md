sha256: 9204e1bc2b9f2e5cf2c8f91eb07ede6f9656e02324e4b255a99c7047883ad6be
---
title: "GraphRAG 是不是智商税？AWS 实测 9 种 RAG 方案"
source_url: "https://mp.weixin.qq.com/s/dN2qDn-CFvaXYrz-qyWOiA"
author: "ChallengeHub / AWS 生成式 AI 创新中心 & Cisco"
published: 2026-06-29
ingested: 2026-06-29
type: raw-article
language: zh
tags: [rag, graphrag, agentic-rag, context-engineering, retrieval-generation-gap, benchmark]
---

# GraphRAG 是不是智商税？AWS 实测 9 种 RAG 方案

**论文**: Is GraphRAG Needed? From Basic RAG to Graph-/Agentic Solutions with Context Optimization
**机构**: AWS 生成式 AI 创新中心 & Cisco
**链接**: https://arxiv.org/pdf/2606.25656
**数据集**: STaRK-Prime（12.9 万实体、810 万图谱关系，PrimeKG）
**LLM**: Claude 3.7 Sonnet

## 9 种方案（三大类）

### Regular RAG
- **场景 1**：纯文档向量检索（最朴素基线）
- **场景 2**：文档 + 1-hop 邻居关系按类型分组附上（偷懒办法）

### GraphRAG
- **场景 3**：纯图谱搜索，不带语义
- **场景 4**：NER + 关系抽取自动建图 + 向量检索
- **场景 5**：文档向量检索 + 预定义图谱 h-hop 遍历（混合派）

### Modular & Agentic RAG
- **场景 6**：固定流水线（改写→检索→重排→生成）
- **场景 7**：智能体 + 多模块工具（自主规划调用）
- **场景 8**：智能体 + 仅一个检索工具（最少工具）
- **场景 9**：场景 8 + 图谱检索工具

## 反直觉结果

### 1. 简单 1-hop 关系干翻复杂 GraphRAG
场景 2（文档+1-hop）Hit@1=0.6972, MRR=0.7531 > 场景 5（混合 GraphRAG）Hit@1≈0.6514。原因：场景 2 按类型分组，场景 5 用冗长三元组导致 "lost in the middle"。

### 2. 纯图谱搜索几乎废了
场景 3 仅靠图谱，Hit@1=0.1376。光有结构没有语义不行。场景 4（自动建图）质量不稳定，劣质图谱拖累效果。

### 3. 工具最少的智能体最强
场景 8（仅一个检索工具）Hit@1=0.6881, MRR=0.7549，全场最高。加思考模式或图谱工具（场景 9）反而变差。

## 上下文工程（三招+批量检索）

1. **关系分组的图表示**：entity1-(rel1 rel2 rel3)-entity2，token 从 O(n) 压到 O(1)
2. **图检索去重**：整个会话维护统一子图，实体级+关系级去重
3. **文档去重**：内容哈希识别重复
4. **Hybrid ReAct-ReWOO**：批量子问题打包一次检索，减少 LLM 轮次

效果：场景 5 省 53% token；场景 9 省 24% token + Hit@5/R@20 还涨了。

## 最值钱洞察：检索-生成鸿沟

场景 5-Opt（500 路径、20 子图）：检索覆盖率 83.5%，但模型实际利用率仅 47.9%。

三个原因：
1. **位置注意力衰减**：前 10% 命中率 85.5%，30-40% 暴跌到 26.3%，70%+ 基本归零
2. **模型偏爱标准答案**：21 个正确答案只检索到 18 个，模型只挑 4 个
3. **问题措辞暗示答案数量**：单数问法让模型只吐一个答案

## 实用 Takeaway

1. 别一上来堆复杂架构，先把简单方案调好
2. 分开评测检索和生成，别被检索指标骗了
