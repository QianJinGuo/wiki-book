# wiki-book RAG 方案设计

## 背景

wiki-book 现有 9,547 篇 Markdown 文档（96MB），搜索索引 37,204 条（13MB），使用 lunr.js 客户端关键词搜索。AI Chat 功能已上线，但 LLM 回答时**没有 wiki-book 内容作为上下文**，只能依赖模型自身知识。

## 目标

让 AI Chat 能基于 wiki-book 的实际内容回答用户问题，并附上来源链接。

## 当前状态（2026-07-01）

**线上稳定运行 Phase 1+2，Phase 3 待 Workers Paid 升级后启用。**

| Phase | 状态 | 稳定性 |
|-------|------|--------|
| Phase 1: 关键词搜索 | ✅ 线上运行 | 10/10 200 |
| Phase 2: Reranker 重排序 | ✅ 线上运行 | 10/10 200 |
| Phase 3: 语义搜索 | ❌ 间歇 503 | 受 Free 计划限制 |

## 可用基础设施

| 资源 | 用途 |
|------|------|
| R2 bucket `ai-engineering-search` | 存储 search_index.json |
| Pages Function | 服务端逻辑，可调 Workers AI |
| `@cf/baai/bge-reranker-base` | 重排序模型（query + doc → 相关性分数） |
| `@cf/baai/bge-m3` | 多语言 Embedding 模型（1024维），Phase 3 使用 |
| Vectorize `wiki-book-embeddings` | 托管向量索引（已创建，37,204 条向量已写入） |

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
    │      ├─ [Phase 3: 语义搜索 — 待 Workers Paid 升级]
    │      │     Workers AI bge-m3 → Vectorize 查询
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
输入: 用户问题 Q, 搜索索引 docs[37,204]
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

## Phase 3：语义搜索（待 Workers Paid 升级）

### 当前限制

Cloudflare Pages Functions **Free 计划**限制：
- **128MB 内存** — 37K 篇 × 1024 维向量全量加载约 152MB，超限
- **10ms CPU 时间** — 流式加载 4 个 chunk + 余弦相似度扫描超限
- **实例回收** — 全局缓存不持久，冷启动必超时

尝试过的方案及失败原因：

| 方案 | 失败原因 |
|------|---------|
| R2 二进制 chunk + 全量加载 | 内存超限（152MB > 128MB） |
| R2 二进制 chunk + 流式搜索 | CPU 超限（4 次 R2 读取 + 4 次余弦扫描 > 10ms） |
| 全量加载 + 全局缓存 | 冷启动超时，实例回收后间歇 503 |
| Vectorize 托管搜索 | loadIndex + embedding + query 超 CPU 限制 |

### 解决方案

升级 Workers Paid 计划（$5/月）：
- CPU 时间从 **10ms → 30s**
- 内存限制大幅放宽
- 超出 10K neurons/天的 embedding 调用自动扣费

### 已就绪的基础设施

升级 Workers Paid 后，只需部署 `functions/rag-query.js` 即可启用 Phase 3：

```
查询时:
  1. env.AI.run("@cf/baai/bge-m3", query) → query embedding
  2. env.VECTORIZE.query(embedding) → top 15 语义结果
  3. 与关键词结果融合 → reranker → 返回
```

Vectorize 索引 `wiki-book-embeddings` 已创建并写入 37,204 条向量（1024 维，cosine 距离），直接可用。

### 构建脚本

```bash
cd ~/wiki-book
python3 scripts/build-vectorize.py
```

从 search_index.json 读取文档，调用 Workers AI bge-m3 生成向量，批量插入 Vectorize 索引。

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
| `wrangler.toml` 加 Vectorize binding | 已配置 |
| `ai-chat.js` 修改 | 随 mkdocs build 部署 |
| search_index.json | 存在 R2 |
| Vectorize `wiki-book-embeddings` | 已创建，37,204 条向量已写入 |

### 部署 Pages Function
```bash
cd ~/wiki-book
rm -f site/search/search_index.json  # 超 25MB，从 R2 读取
npx wrangler pages deploy site --project-name=ai-engineering --branch=main
```

### 验证
```bash
curl "https://jinguo.tech/rag-query?q=Agent记忆"
# 返回 source: reranker（Phase 1+2）
# 升级 Workers Paid 后返回 source: hybrid（Phase 1+2+3）
```

## 页面 404 修复

Cloudflare Pages 使用扁平文件名（`ch04-001-agent.html`），但章节索引页链接使用子目录格式（`ch04/001-agent.html`）。

修复方案：
1. `site/_redirects` — Cloudflare Pages 重写规则，`ch04/* → ch04-:splat 200`
2. `fix_filenames.py` — 按序号前缀创建短 slug 文件副本

三套部署环境独立：
- **Docker**（localhost:8002）— nginx `try_files` 兜底
- **GitHub Pages**（wiki.jinguo.tech）— 自有构建流程
- **Cloudflare Pages**（jinguo.tech）— `_redirects` + 短 slug 副本
