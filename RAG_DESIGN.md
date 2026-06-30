# wiki-book RAG 方案设计

## 背景

wiki-book 现有 9,547 篇 Markdown 文档（96MB），搜索索引 47,522 条（16.9MB），使用 lunr.js 客户端关键词搜索。AI Chat 功能已上线，但 LLM 回答时**没有 wiki-book 内容作为上下文**，只能依赖模型自身知识。

## 目标

让 AI Chat 能基于 wiki-book 的实际内容回答用户问题，并附上来源链接。

## 可用基础设施

| 资源 | 用途 |
|------|------|
| R2 bucket `ai-engineering-search` | 存储 search_index.json（16.9MB） |
| Pages Function | 服务端逻辑，可调 Workers AI + 讯飞 API |
| `@cf/baai/bge-reranker-base` | 重排序模型（query + doc → 相关性分数） |
| 讯飞 `xop3qwen8bembedding` | 8B 中文 Embedding 模型（1024维，通过 HTTP API 调用） |

## 架构总览

```
用户提问
    │
    ▼
AI Chat (ai-chat.js)
    │
    ├─ POST /rag-query (Pages Function)
    │      │
    │      ├─ 加载 search_index.json（R2 边缘缓存）
    │      │
    │      ├─ Phase 1: 关键词匹配 → top 30 候选
    │      │     （词频匹配，标题权重 3x，正文权重 1x）
    │      │
    │      ├─ Phase 2: Workers AI reranker 重排序
    │      │     @cf/baai/bge-reranker-base
    │      │     输入: 问题 + 30 篇候选文档
    │      │     输出: 每篇相关性分数
    │      │
    │      ├─ Phase 3: 语义 embedding 补充（讯飞 8B）
    │      │     问题 embedding → 余弦相似度 → 与关键词结果融合
    │      │
    │      └─ 返回 top 5 片段 + 章节链接
    │
    └─ 将上下文注入 LLM 请求
          system: "基于以下 wiki-book 内容回答:\n{context}"
          user:   "{question}"
```

## Phase 1：关键词搜索（已有数据，零成本）

### 算法
```
输入: 用户问题 Q, 搜索索引 docs[47,522]
输出: top 30 候选文档

1. 分词: Q → words[]（去停用词，>1 字符）
2. 对每篇文档:
   title_score = words 在标题中的匹配数 × 3
   text_score  = words 在正文中的匹配数 × 1
   total_score = title_score + text_score
3. 按 total_score 降序，取 top 30
```

### 优点
- 无需预处理，search_index.json 已就绪
- 精确匹配能力强（标题、专有名词）
- 零 AI 模型调用成本

### 局限
- 同义词/近义词不识别（"部署" ≠ "发布"）
- 概念关联不识别（"幻觉" ≠ "hallucination"）
- 口语化表达不识别（"胡说八道" ≠ "事实性"）

## Phase 2：Reranker 重排序（每次查询 1 次 AI 调用）

### 流程
```
1. 关键词搜索 → top 30 候选
2. 调 Workers AI @cf/baai/bge-reranker-base
   输入: { query: "问题", texts: ["候选1", "候选2", ...] }
   输出: [{ index: 0, score: 0.95 }, { index: 1, score: 0.12 }, ...]
3. 按 score 降序，取 top 5
4. 返回 { results: [{ title, location, text, score }] }
```

### 费用
- Workers Free 计划：每天 10,000 次神经元调用免费
- 每次查询 = 1 次 reranker 调用
- 个人网站用量远低于免费额度 → **零成本**

### 为什么不用 Workers AI embedding 做语义搜索
- Workers AI 的 embedding 模型太小（0.6B），中文效果不够好
- 改用讯飞 `xop3qwen8bembedding`（8B），MTEB 多语言 70.58，排行榜第 1
- 通过 HTTP API 调用，不依赖 Workers AI 的 embedding 模型

## Phase 3：语义 Embedding 补充（可选）

### 何时需要
- Phase 1+2 上线后发现关键词搜索遗漏了明显相关的内容
- 用户问题经常是概念性、口语化表达
- 需要跨语言匹配

### 实现方案
```
构建时:
  for each doc in search_index.docs:
    embedding = 讯飞 xop3qwen8bembedding(doc.title + doc.text)
    存储: { doc_id, embedding: float[1024], metadata }

查询时:
  query_embedding = 讯飞 xop3qwen8bembedding(question)
  for each stored embedding:
    similarity = cosine(query_embedding, doc_embedding)
  top N 语义结果 → 与关键词结果融合 → reranker
```

### 存储方案
- 向量存入 R2（二进制 chunk 格式，~192MB）
- 5 个 chunk，每个 ~38MB

### 额外成本
- 构建时：47K 次 embedding 调用（一次性，免费额度内）
- 每次查询：多 1 次 embedding 调用（零成本）

## 安全

- `/rag-query` 通过 Pages Function 提供，同域访问
- 不暴露 search_index.json 给客户端
- Workers AI 调用走 Cloudflare 内部网络，不经过公网

## 与现有 AI Chat 的集成

```
用户输入 → sendMessage()
    │
    ├─ 调 /rag-query?q=用户问题
    │    返回 [{ title, location, text, score }]
    │
    ├─ 构建 system prompt:
    │   "你是一个基于 wiki-book 内容的 AI 助手。
    │    请根据以下参考资料回答用户问题。
    │    如果参考资料不足以回答，请如实说明。
    │
    │    参考资料：
    │    1. [Ch06 记忆与上下文管理](https://wiki.jinguo.tech/ch06-memory.html)
    │       Agent 记忆分为短期、长期和工作记忆三层...
    │    2. ...
    │   "
    │
    └─ 正常调用 LLM（system + conversation_history + user）
```

## 部署

| 组件 | 方式 |
|------|------|
| `functions/rag-query.js` | 随 Cloudflare Pages 部署 |
| `wrangler.toml` 加 AI binding | 已配置 |
| `XUNFEI_API_KEY` | `wrangler pages secret put` 已设置 |
| `ai-chat.js` 修改 | 随 mkdocs build 部署 |
| search_index.json | 已有，存在 R2 |
| embeddings 二进制文件 | 构建后上传到 R2 |
