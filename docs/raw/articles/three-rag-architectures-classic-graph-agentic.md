---
title: "一文看懂三种 RAG 架构：Classic RAG、Graph RAG 与 Agentic RAG"
author: 兔兔AGI（技术极简主义）
source_url: https://mp.weixin.qq.com/s/UNAD6ZS5p0eofHdSwaZvvg
publish_date: 2026-05-16
sha256: 438469305d332c6e113f87f81428184eae85bd2f879601025c52891dcf3e545c
tags: [wechat, article, rag, rag, graph-rag, rag, knowledge-graph, enterprise-knowledge-base]
---
# 一文看懂三种 RAG 架构：Classic RAG、Graph RAG 与 Agentic RAG
> 来源：兔兔AGI（技术极简主义），2026-05-16
## 核心框架
三种 RAG 架构对应三个动词：
| 架构 | 核心动作 | 解决的问题类型 |
|------|---------|-------------|
| Classic RAG | retrieves（检索） | 一跳问答、FAQ、文档查询 |
| Graph RAG | connects（连接） | 依赖分析、影响分析、组织关系、供应链 |
| Agentic RAG | reasons（推理） | 多步骤调查、复杂归因、跨系统分析 |
## Classic RAG
**流程：**
1. 文档切块（chunk）
2. 每个 chunk 转成 embedding
3. 存入向量数据库
4. 用户提问时，问题也转成 embedding
5. 检索 top K 相似片段
6. 拼上下文交给 LLM 生成
**适用场景：** FAQ 问答、政策查询、产品手册、客服知识库、员工制度查询。
**局限：** 擅长"找到相关内容"，但不擅长"沿着关系继续往下找"。
## Graph RAG
在文本检索之外增加**知识图谱**层，把知识拆成**实体**和**关系**：
**实体：** 人、产品、零件、团队、部门、供应商、客户、系统模块
**关系：** 员工 A 汇报给经理 B；产品 X 使用零件 Y；零件 Y 来自供应商 Z……
**适用场景：** 影响分析、依赖分析、组织关系查询、审批链查询、供应链分析。
**局限：** 建图和维护成本高；只能遍历已建模的节点和边。
## Agentic RAG
让 Agent 根据问题目标**自己判断下一步该查什么、用什么工具、证据够不够、要不要重新规划**。
典型流程（销量下降分析）：
1. 拆解问题：哪个产品、地区、时间段？
2. 查销售数据，看下降趋势是否真实
3. 查价格历史，看是否有调价
4. 查营销活动记录
5. 查客服工单
6. 查库存系统
7. 证据不足则继续选新工具
8. 综合多个来源给出原因假设和证据链
**适用场景：** 复杂问题分析、业务异常归因、跨系统调查、多数据源综合判断、技术排障、竞品分析。
**局限：** LLM 调用次数多、延迟高、调试复杂。
## 选型决策
| 问题形状 | 推荐架构 |
|---------|---------|
| 答案从单文档片段即可回答 | Classic RAG |
| 答案依赖跨实体、跨文档关系链 | Graph RAG |
| 查询路径无法提前定义，需边查边判断 | Agentic RAG |
**混合路径：** 先用 Classic RAG 解决高频明确问题；遇关系链问题引入 Graph RAG；遇开放式多步骤调查交给 Agentic RAG。
## 一句话总结
- Classic RAG 解决「资料在哪里」
- Graph RAG 解决「资料之间怎么连」
- Agentic RAG 解决「下一步该查什么」