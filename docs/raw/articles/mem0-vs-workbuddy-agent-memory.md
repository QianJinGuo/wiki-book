---
title: "Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？"
source_url: "https://mp.weixin.qq.com/s/CyZv5BQyW3SSVIJ1U8Ba9A"
source_site: "叶小钗"
author: "叶小钗"
ingested: "2026-07-08"
sha256: "6e5b180d58b20a60d64fc18a29394771e1a930c260b2a198cb67afcc7ad9b693"
type: raw
tags:
  - agent-memory
  - mem0
  - workbuddy
  - long-term-memory
  - short-term-memory
  - embedding
  - vector-store
---

> Agent 记忆层不是简单地记录聊天的历史信息，需要把历史交互压缩成可检索、可追溯、可演化的长期上下文。

## Mem0 记忆框架拆解

Mem0（59.9k GitHub stars）是开源的 Agent 记忆框架，提供三种使用方式：云端 API、自建部署服务、直接使用 SDK。

### 核心架构

初始化 Memory() 时创建：
- **llm**：负责从对话中抽取值得保存的事实
- **embedding_model**：负责把记忆文本和查询文本向量化
- **vector_store**：主记忆库（默认 Qdrant，可换 pgvector/Redis/Milvus/Pinecone）
- **SQLiteManager**：本地 SQLite，保存记忆变更历史和最近消息窗口
- **entity_store**：懒加载的实体索引库
- **reranker**：可选，负责对召回结果二次排序

### 写入流程

1. Agent 将新对话交给 add() 方法，需提供 user_id/agent_id/run_id 等归属字段
2. 先去 SQLite 拿到该用户最近的 10 条消息
3. 去 Vector Store 找 10 条相关旧记忆
4. 将"新对话 + 最近消息 + 相关旧记忆"交给 LLM
5. LLM 判断是否有需要长期保存的事实（偏好、计划、长期目标等）
6. 新记忆写入 Vector Store + SQLite 记录变更

### 检索流程

支持三种检索模式：
- **准确检索**：只返回与查询语义最相似的记忆
- **最近检索**：按时间排序返回最近记忆
- **用法检索（usage）**：结合频率和时效性的混合排序

### 记忆更新与冲突

- 旧记忆在内容不再准确时会被更新（通过 LLM 比对新旧冲突，使用 update() 方法实现覆盖）
- 提供明显的禁止列表（Avoid list）过滤不需要记住的内容

## WorkBuddy 的对比

| 维度 | Mem0 | WorkBuddy（专家团模式） |
|------|------|------------------------|
| 记忆来源 | 从单轮对话中抽取事实 | 通过专家团提示词定义记忆逻辑 |
| 存储方案 | 通用向量库 + SQLite | 独立嵌入服务 + 数据库 |
| 路由机制 | 无显式路由 | 记忆路由器按用户意图分发到对应专家 |
| 核心优势 | 开源、灵活、社区成熟 | 企业级定制、专家路由 |
| 冲突处理 | LLM 比对后覆盖 | 结构化字段直接覆盖 |
| 检索多样性 | 时间/语义/usage 三种 | 按意图路由 + 模拟检索 |

## 关键见解

- 记忆层本质上是**将历史交互压缩成可检索、可追溯、可演化的长期上下文**
- Mem0 的 add() 流程（检索旧记忆→LLM 提取→写入）是 Agent 长期记忆的标准范式
- 记忆写入时的去重和关联是最关键的工程挑战
- 结构化的记忆（字段化存储）优于纯文本存储，便于后续检索和冲突处理
- 记忆质量高度依赖 LLM 的抽取能力，提示词工程是关键
