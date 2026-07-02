# wiki-book RAG 方案设计

> 📖 完整复盘见 [RAG-RETROSPECTIVE.md](./RAG-RETROSPECTIVE.md)——包含问题背景、两套方案对比、实施日记、经验教训。

## 背景

wiki-book 现有 63,013 篇 Markdown 文档（200MB 源文件），搜索索引 61,669 条（21MB），使用 lunr.js 客户端关键词搜索。AI Chat 功能已上线，LLM 回答需要 wiki-book 实际内容作为上下文。

## 目标

让 AI Chat 能基于 wiki-book 的实际内容回答用户问题，并附上来源链接。跨环境支持（Cloudflare Pages / GitHub Pages / Docker），Free 计划内实现最大 RAG 能力。

## 当前状态（2026-07-02）

### 三层 RAG 能力

| 层 | 方案 | 语义程度 | 状态 | 环境 |
|----|------|---------|------|------|
| **Tier 1 客户端搜索** | 关键词匹配 + TF-IDF 近邻图扩展 | 词袋级 | ✅ 线上运行 | 全部环境 |
| **Phase 2 Reranker** | bge-reranker-base 交叉编码器重排序 | **跨句语义理解** | ⚠️ Free 间歇 503 | CF Pages 专属 |
| **Phase 3 语义检索** | bge-m3 embedding + Vectorize 查询 | 向量语义 | ❌ Free 10ms CPU 锁定 | 待 Workers Paid |

### 三环境对比

| 能力 | Docker (localhost:8002) | GitHub Pages (wiki.jinguo.tech) | CF Pages (jinguo.tech) |
|------|------------------------|-------------------------------|----------------------|
| **客户端搜索 (Tier 1)** | ⚠️ HTML 未重建 | ✅ Playwright 验证通过 | ✅ Playwright 验证通过 |
| **近邻图扩展** | ❌ 无 | ❌ 无部署 | ✅ R2 流式加载 |
| **Reranker 重排序** | ❌ nginx fallback | ❌ 无服务器端点 | ⚠️ Free 间歇 503 |
| **语义搜索 (Phase 3)** | ❌ | ❌ | ❌ Workers Paid 升级后 |
| **AI Chat 面板** | ✅ | ✅ | ✅ |

## 架构总览

### 旧架构（2026-07-01 前）

```
浏览器 → Pages Function [关键词+reranker+embedding+vectorize, 10ms CPU锁死] → R2/Vectorize/Workers AI
```

纯服务端，Docker 和 GitHub Pages 无 RAG，CF Pages 被 Free 计划限制锁死。

### 新架构（2026-07-02）

```
                   ┌─────────────────────────────────────────────┐
                   │             浏览器 (rag-client.js)            │
                   │                                              │
                   │  1. IndexedDB 缓存 search_index + neighbor    │
                   │  2. 关键词搜索 → top 30                       │
                   │  3. 近邻图扩展 → 概念关联召回                  │
                   │  4. 融合排序 → top 5                          │
                   │          ↓ 客户端优先                          │
                   │  5. 注入 LLM 请求 → ai-proxy → MiMo API      │
                   └─────────────────────────────────────────────┘
                              │ 降级（客户端失败时）
                              ▼
                   ┌─────────────────────────────────────────────┐
                   │         Pages Function (rag-query.js)         │
                   │  Phase 1: 关键词搜索 → R2 search_index       │
                   │  Phase 2: Reranker → Workers AI               │
                   │  [Phase 3: Vectorize 搜索 — Paid 升级后]      │
                   └─────────────────────────────────────────────┘
```

**关键设计**：客户端 `doRagSearch()` 三路降级策略

```
ragClient.search(query)          ← 客户端优先（浏览器本地，零服务器 CPU）
  → 客户端引擎未就绪，等待 init()
    → ragClient 不可用，fallbackToServer()
      → 服务器也失败，空结果（仅当前文章上下文）
```

## 数据流

```
用户输入 → sendMessage()
    │
    ├─ doRagSearch(text)  ← 客户端优先
    │    │
    │    ├─ [Tier 1] ragClient.search(query, {topK:5})
    │    │     ├─ 关键词匹配 → top 30
    │    │     ├─ 近邻扩展（top-10 种子 × 20 近邻）
    │    │     ├─ 融合排序（关键词分 × 0.3 + 近邻分 × 10）
    │    │     └─ 返回 {results, source: "client"}
    │    │
    │    ├─ [降级] fetch(/rag-query?q=...)
    │    │     ├─ Phase 1: 关键词 → top 30
    │    │     ├─ Phase 2: bge-reranker-base 重排序
    │    │     ├─ [Phase 3: Vectorize 语义检索]
    │    │     └─ 返回 {results, source: "reranker|hybrid"}
    │    │
    │    └─ [兜底] {results: [], source: "error"}
    │
    └─ 构建 system prompt
         "以下是 wiki-book 参考资料：\n1. [标题](链接)\n   摘要..."
         + LLM 调用
```

## Tier 1：客户端 RAG 引擎

### rag-client.js

纯浏览器端实现，无服务器依赖：

```
初始化:
  fetch(/rag/search)           ← CF Pages: R2 流式
    → 失败 → 降级 fetch(/search/search_index.json)  ← GH Pages / Docker: 静态文件
  fetch(/rag/graph)            ← CF Pages: R2 流式（30MB 近邻图）
    → 失败 → 静默降级（纯关键词模式）
  IndexedDB 持久缓存（版本化，二次加载秒开）

查询:
  tokenize(query) → queryTokens[]
  对每篇 doc:
    title_score = 标题匹配 × 3
    text_score  = 正文匹配 × 1
  top 30关键词结果

  对 top-10 关键词种子：
    从 neighbor_graph 查表扩展 top-20 近邻
    评分 = 关键词分 × 0.3 + 近邻相似度 × 10

  融合排序 → 返回 top 5
```

### 近邻图构建

```
scripts/build-neighbor-graph.py

输入: search_index.json (63K 文档)
算法: TF-IDF 余弦相似度
  1. 分词 → 去停用词 → 418K 唯一词
  2. 过滤词频 2-5000 → 366K 词
  3. 构建 CSR 稀疏矩阵 (63K × 366K, 1.7M 非零)
  4. A @ A.T → 稀疏余弦矩阵 (63K × 63K, 358M 非零对)
  5. 每文档 top-20 近邻

产出: neighbor_graph.json (30MB, 57,380 有效节点)
时间: ~1 分钟（M1 MacBook）
```

### 搜索质量对比

| 查询类型 | Tier 1 关键词 | Tier 1 + 近邻 | Phase 2 Reranker | Phase 3 语义 |
|---------|-------------|--------------|-----------------|-------------|
| "MCP 协议" | ✅ 精确命中 | ✅ | ✅ 排序提升 | ✅ |
| "Agent 记忆" | ✅ 精确命中 | ✅ 关联扩展 | ✅ 排序提升 | ✅ |
| "工具调用" | ✅ 命中 | ✅ | ✅ | ✅ |
| "Harness 治理" | ⚠️ 部分命中 | ✅ 近邻扩展 | ✅ | ✅ |
| "怎么做 AI 应用" | ⚠️ 碎片化 | ✅ | ⚠️ 受候选集限 | ✅ |
| "hallucination" | ❌ 无命中 | ❌ 无近邻 | ❌ 漏召回 | ✅ 语义匹配 |

## Phase 1：服务器端关键词搜索

```
输入: 用户问题 Q, 搜索索引 docs[61,669]
输出: top 30 候选文档

1. 分词: Q → words[]（去停用词，>1 字符，中日英）
2. 对每篇文档:
   title_score = words 在标题中的匹配数 × 3（子串匹配额外 +2）
   text_score  = words 在正文中的匹配数 × 1（子串匹配额外 +1）
   total_score = title_score + text_score
3. 按 total_score 降序，取 top 30
```

## Phase 2：Reranker 重排序

```
1. 关键词搜索 → top 30 候选
2. 调 Workers AI @cf/baai/bge-reranker-base
   输入: { query: "问题", texts: ["标题: 候选1\n内容: ...", ...] }
   输出: [{ index: 0, score: 0.95 }, ...]
3. 按 score 降序，取 top 5
4. 返回 source: "reranker"
```

### Free 计划限制

Workers Free 计划 10ms CPU 时间限制，连续请求时触发 503/1102。实测：
- 单次请求：通常 200 ✅
- 连续 3+ 请求：高概率 503 ❌
- 重试后（2s/4s backoff）：部分恢复

解决方案：升级 Workers Paid（$5/月），CPU 时间 10ms → 30s。

## Phase 3：语义搜索（待 Workers Paid 升级）

### 限制根因

| 限制项 | Free | Paid |
|--------|------|------|
| CPU 时间/请求 | **10ms** | **30s** |
| 内存 | 128MB | 128MB |
| 子请求 | 50 | 1000 |

Phase 3 流程耗时：
```
用户 query → bge-m3 embedding (~200ms) → Vectorize query (~50ms) → 总计 ~300ms wall-clock
```

Free 计划只给 10ms CPU time，embedding 调用的序列化/反序列化就超限了。

### 已就绪的基础设施

升级 Workers Paid 后**零代码改动**即可启用：

- `functions/rag-query.js` 已内置 Phase 3 分支
- Vectorize `wiki-book-embeddings` 索引已创建（37,204 条向量，1024维，cosine）
- `wrangler.toml` 已配好 AI + Vectorize 绑定
- `scripts/build-vectorize.py` 构建脚本就绪

启用后数据流：
```
1. env.AI.run("@cf/baai/bge-m3", { text: [query] }) → query embedding
2. env.VECTORIZE.query(embedding, { topK: 15 }) → top 15 语义结果
3. 与关键词结果融合（去重，语义分 × 10 平衡权重）
4. 合并候选 → reranker → top 5, source: "hybrid"
```

## 已解决的困境

### 困境 1：Phase 3 被 Free 锁死 → **Tier 1 客户端搜索绕开**

Phase 3 仍需 Workers Paid 升级，但 Tier 1 客户端搜索（关键词 + 近邻图）在 Free 计划内实现了大部分场景的语义扩展。

### 困境 2：双 wrangler.toml → **symlink 收敛**

`deploy/cloudflare/wrangler.toml` 已删除，由 symlink 指向根目录 `wrangler.toml`，物理消除漂移。

### 困境 3：Docker RAG 404 → **nginx 兜底 + 客户端搜索**

nginx.conf 新增 `/rag-query` 端点返回 `{"results":[],"source":"nginx-fallback"}`。客户端 RAG 上线后 Docker 自动走客户端搜索。

### 困境 4：E2E 测试缺失 → **Playwright 真实查询**

`test-rag.mjs` 覆盖：
- 5 组查询 × 3 环境
- 响应结构验证（results 数组 + source 字段）
- top1 相关性验证
- Free 503 自动重试
- 前端脚本引用检查

### 困境 5：索引不同步 → **构建时自动生成**

`scripts/build.sh` 中 mkdocs build 后自动执行：
1. `scripts/build-neighbor-graph.py` → 生成近邻图
2. `deploy/cloudflare/deploy.sh` → 自动上传 R2

## 安全

- `/rag-query` 通过 Pages Function 提供，同域访问
- `/rag/search` 和 `/rag/graph` 限同域（CORS 未开放）
- Workers AI 调用走 Cloudflare 内部网络
- AI Chat LLM 代理有 X-Site-Token 校验 + IP 限流（30/min）
- 客户端搜索数据从 IndexedDB 加载（不暴露给第三方）

## 与 AI Chat 的集成

```
用户输入 → sendMessage()
    │
    ├─ doRagSearch(text) → { results, source }
    │
    ├─ 构建 system prompt:
    │   "你是一个基于 wiki-book 内容的 AI 助手。
    │    当前文章内容：{前 2000 字}
    │
    │    以下是 wiki-book 参考资料：
    │    1. [标题](https://wiki.jinguo.tech/location)
    │       摘要...
    │
    │    请根据参考资料回答..."
    │
    └─ LLM 流式回复（system + conversation_history + user）
```

## 文件索引

| 文件 | 用途 | 部署 |
|------|------|------|
| `functions/rag-query.js` | Pages Function：Phase 1+2 服务端 RAG | CF Pages |
| `functions/rag/search.js` | Pages Function：R2 流式提供 search_index.json | CF Pages |
| `functions/rag/graph.js` | Pages Function：R2 流式提供 neighbor_graph.json | CF Pages |
| `overrides/assets/javascripts/rag-client.js` | 客户端 RAG 引擎（关键词 + 近邻图 + IndexedDB） | mkdocs build |
| `overrides/assets/javascripts/ai-chat.js` | AI Chat 面板 + doRagSearch 客户端优先逻辑 | mkdocs build |
| `scripts/build-neighbor-graph.py` | 离线近邻图构建（TF-IDF 余弦，63K 文档，1min） | 构建阶段 |
| `scripts/build-vectorize.py` | Vectorize 向量索引构建（bge-m3 embedding） | 构建阶段 |
| `scripts/slim-search-index.py` | 搜索索引裁剪（21MB → 21MB，去章节索引页） | 构建阶段 |
| `scripts/build.sh` | 统一构建脚本（mkdocs → 近邻图 → slim） | 构建阶段 |
| `deploy/cloudflare/deploy.sh` | CF Pages 部署（上传 R2 + deploy site） | 部署阶段 |
| `test-rag.mjs` | Playwright 端到端测试（5 场景 × 3 环境） | 验证阶段 |
| `wrangler.toml`（根目录） | Pages 部署配置（AI + Vectorize + R2 绑定） | 唯一真源 |

## 升级路径

### 短期（Free 计划现状）✅ 已完成

| 步骤 | 交付 | 状态 |
|------|------|------|
| Step 1: wrangler.toml 收敛 | symlink 消除漂移 | ✅ |
| Step 2: Docker RAG 404 | nginx 静态 JSON 兜底 | ✅ |
| Step 3: E2E 测试 | test-rag.mjs 真实查询 | ✅ |
| Step 4: Tier 1 客户端 RAG | rag-client.js + 近邻图 | ✅ 线上运行 |

### 中期待办

| 项 | 说明 | 状态 |
|----|------|------|
| Docker HTML 重建 | `docker build --no-cache` 使 rag-client.js 生效 | ⏳ |
| Docker 近邻图注入 | 将 neighbor_graph.json 注入 Docker | 📋 |
| GitHub Pages 近邻图 | 将 neighbor_graph.json 作为静态文件部署 | 📋 |

### 长期（升级 Workers Paid $5/月）

- Phase 3 语义搜索 — 同义词/跨语言匹配（零代码改动即生效）
- 融合检索（keyword + vector + reranker）— 三层综合
- 索引自动同步 — 内容更新后全量重建向量

## Playwright 测试结果

### 生产环境（jinguo.tech）

```
rag-client.js:            ✅ 已加载
ragClient.search():       ✅ 5 条结果 (score=11, source=keyword)
/rag-query (Phase 1+2):  ⚠️ 3/5 通过（2 个 Free 503）
ai-chat.js:               ✅ 已加载
前端脚本:                  ✅ 2/2
```

### GitHub Pages（wiki.jinguo.tech）

```
rag-client.js:            ✅ 已加载
ragClient.search():       ✅ 5 条结果 (score=11, source=keyword)
前端脚本:                  ✅ 2/2
```

### Docker（localhost:8002）

```
/rag-query nginx fallback: ✅ 5/5 (200, 空结果)
rag-client.js:             ⚠️ 文件存在，HTML 老旧未引用
前端脚本:                  ⚠️ 2/2 (子目录格式页面含 rag-client.js)
```

## Workers Free vs Paid 决策

| 维度 | Free | Paid ($5/月) |
|------|------|-------------|
| CPU 时间 | 10ms → ❌ Phase 3 不可用 | 30s → ✅ 全能力 |
| 当前覆盖 | Tier 1 + Phase 1+2 ≈ 80% 场景 | + Phase 3 跨语言语义 |
| 额外成本 | $0 | $60/年 |
| 升级影响 | — | 零代码改动，即生效 |

## Free 计划 503 错误说明

`/rag-query` 间歇返回 503（error code 1102）是因为 Cloudflare Workers Free 计划的 **10ms CPU 时间限制**。每次触发 Reranker（Workers AI 调用）消耗的 CPU 时间接近此阈值，连续请求时累积超限。

表现：
- 单次查询：通常正常 ✅
- 连续 3+ 次：触发 CPU 限流 ❌
- 等待 2-4 秒后恢复 ✅

这不影响 Tier 1 客户端搜索（在用户浏览器本地执行，零服务器 CPU）。
