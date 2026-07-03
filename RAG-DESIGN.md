# wiki-book RAG 方案设计

> 📖 完整复盘见 [RAG-RETROSPECTIVE.md](./RAG-RETROSPECTIVE.md)——包含问题背景、两套方案对比、实施日记、经验教训。

## 背景

wiki-book 现有 63,013 篇 Markdown 文档（200MB 源文件），搜索索引 61,669 条（21MB），使用 lunr.js 客户端关键词搜索。AI Chat 功能已上线，LLM 回答需要 wiki-book 实际内容作为上下文。

## 目标

让 AI Chat 能基于 wiki-book 的实际内容回答用户问题，并附上来源链接。跨环境支持（Cloudflare Pages / GitHub Pages / Docker），Free 计划内实现最大 RAG 能力。

## 当前状态（2026-07-03 v1.3.3）

### 三层 RAG 能力

| 层 | 方案 | 语义程度 | 状态 | 环境 |
|----|------|---------|------|------|
| **Layer 1 客户端搜索** | 关键词匹配 + TF-IDF 近邻图扩展 | 词袋级 | ✅ 线上运行 | 全部环境 |
| **Layer 2 QMD BM25** | SQLite FTS5 BM25 + TF-IDF 排序 | 词袋级 | ✅ HP Docker | 需 HP 在线 |
| **Layer 3 语义搜索** | 讯飞 xop3qwen8bembedding API + Vectorize | **向量语义** | ✅ 线上运行 | CF Pages + 讯飞 API |
| **服务器兜底** | Phase 1 关键词 + Phase 2 Reranker | 跨句语义 | ⚠️ Free 间歇 503 | CF Pages 专属 |

### 三环境最终状态

| 能力 | Docker (localhost:8002) | GitHub Pages (wiki.jinguo.tech) | CF Pages (jinguo.tech) |
|------|------------------------|-------------------------------|----------------------|
| **客户端搜索 (Tier 1)** | ✅ Playwright 验证通过 | ✅ Playwright 验证通过 | ✅ Playwright 验证通过 |
| **近邻图扩展** | ✅ 本地文件注入 (57K 节点) | ✅ GitHub Actions 自动构建 | ✅ R2 流式加载 |
| **Reranker 重排序** | ❌ nginx fallback | ❌ 无服务器端点 | ⚠️ Free 间歇 503 |
| **语义搜索 (Layer 3)** | ❌ 无讯飞 API 调用 | ❌ | ✅ 讯飞 + Vectorize |
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
                   │     Layer 1: 浏览器 (rag-client.js)          │
                   │  IndexedDB 关键词 + 近邻图, 0ms, 离线可用    │
                   └──────────────────┬──────────────────────────┘
                                      │ 质量不足时
                                      ▼
                   ┌─────────────────────────────────────────────┐
                   │     Layer 2: QMD BM25 (HP)                   │
                   │  SQLite FTS5 BM25, TF-IDF, ~50ms             │
                   └──────────────────┬──────────────────────────┘
                                      │ 跨语言/语义时
                                      ▼
                   ┌─────────────────────────────────────────────┐
                   │     Layer 3: 讯飞 + Vectorize                │
                   │  讯飞 API embedding → Vectorize 语义搜索     │
                   └──────────────────┬──────────────────────────┘
                                      │ 兜底
                                      ▼
                   ┌─────────────────────────────────────────────┐
                   │     服务器兜底: Pages Function (rag-query.js) │
                   │  Phase 1 关键词 + Phase 2 Reranker            │
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
    ├─ doRagSearch(text)  ← 三层递增
    │    │
    │    ├─ [Layer 1] ragClient.search() — 客户端本地
    │    │     关键词 + 近邻图, IndexedDB, 0ms
    │    │     全部环境可用, 离线可用
    │    │
    │    ├─ [Layer 2] QMD BM25 (HP) — 更准的关键词
    │    │     SQLite FTS5 BM25, TF-IDF 排序
    │    │     需 HP 在线, ~50ms
    │    │
    │    ├─ [Layer 3] 讯飞 + Vectorize — 语义搜索
    │    │     讯飞 embedding → Vectorize 查询
    │    │     跨语言/同义词, ~300ms
    │    │
    │    └─ [服务器兜底] fetch(/rag-query)
    │          Phase 1: 关键词 + Phase 2: Reranker
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

### Layer 2：QMD BM25 (HP 备选)

| 维度 | 客户端 rag-client.js | QMD BM25 |
|------|-------------------|---------|
| **搜索算法** | 简单词频打分（tokenize + 计数） | **SQLite FTS5 BM25**（工业级全文检索） |
| **排序质量** | 词频分，标题 3x 正文 1x | TF-IDF 加权，BM25 算法 |
| **召回率** | 关键词精确匹配 | 同根词、词形变化（stemming） |
| **延迟** | **0ms**（本地 IndexedDB） | ~50ms（HTTP 到 HP） |
| **离线可用** | ✅ 首次加载后可离线 | ❌ 需连 HP |
| **维护** | 零运维 | HP Docker 需维护 |

两者不冲突，客户端搜索（Layer 1）覆盖 80% 场景，QMD BM25（Layer 2）在需要更高质量时使用。

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

## Phase 3：语义搜索（讯飞 API + Vectorize）

### 架构

```
查询时:
  1. fetch(讯飞 API, query text)          ← HTTP 请求，不计 CPU ✅
  2. env.VECTORIZE.query(embedding)       ← Vectorize 搜索，不计 CPU ✅
  3. 与关键词结果融合 → reranker → top 5
  总计 CPU: ~1ms (仅解析响应) ✅
```

### Vectorize vs R2

| | Vectorize | R2 |
|---|-----------|-----|
| **本质** | **向量数据库** | **对象存储**（类似 S3） |
| **存什么** | 向量（[0.1, 0.2, ...]） | 文件（JSON/图片/视频） |
| **怎么用** | `env.VECTORIZE.query(向量, topK)` → 返回最近邻 | `env.R2.get(key)` → 返回文件 |
| **能搜索吗** | ✅ 余弦相似度 / 欧氏距离 | ❌ 只能按文件名读 |
| **修改** | ❌ 不能修改已有向量，只能插入/删除 | ✅ 可覆盖 |

**R2** 存 search_index.json（全量文本）和 neighbor_graph.json（近邻图），按 key 读取。
**Vectorize** 存向量索引，按余弦距离查询最近邻，两者互补不冲突。

如果向量存 R2，查询时需下载全部 30K 向量（~120MB）→ 本地 cosine 搜索 → 超 10ms CPU 限制。
Vectorize 把这步计算放在 Cloudflare 内部，不计 CPU。

### 模型配置

| 项 | 值 |
|----|-----|
| API | `https://maas-api.cn-huabei-1.xf-yun.com/v2/embeddings` |
| 模型 | `xop3qwen8bembedding`（8B 参数） |
| 维度 | 1024（Vectorize 上限 1536，模型支持 32/64/128/256/512/768/1024/2048/4096） |
| 认证 | Bearer token（`key:secret` 格式） |
| 向量库 | `wiki-book-embeddings-v2`（1024 dim, cosine） |

### 为什么之前的 Workers AI 行不通

```
旧流程（Pages Function 内）:
  env.AI.run("@cf/baai/bge-m3", query)     ← 计 CPU 时间 ❌ → 超 10ms → 503
  env.VECTORIZE.query(embedding)            ← 不计 CPU ✅

新流程（Pages Function 内）:
  fetch(讯飞 API, query)                    ← HTTP I/O，不计 CPU ✅
  env.VECTORIZE.query(embedding)            ← 不计 CPU ✅
```

Workers AI 调用在 GPU 推理，但请求的序列化/反序列化消耗 CPU 时间。讯飞 API 通过 HTTP 调用，网络等待不计 CPU。Vectorize 始终是纯 I/O，两者互不冲突。

### 批量构建脚本

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
| `scripts/build-vectorize.py` | Vectorize 索引构建（旧版，Workers AI bge-m3） | 构建阶段 |
| `scripts/build-vectorize-xunfei.py` | Vectorize 索引构建（讯飞 xop3qwen8bembedding，并发版） | 构建阶段 |
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
| QMD + Docker 部署 | HP 上 Docker 化 QMD（已完成） | ✅ |
| Vectorize 并发优化 | 10 并发 × 20 doc/批，36 docs/s | ✅ |
| CF Zero Trust SSH | 公网 SSH 隧道（已完成） | ✅ |
| Docker 容器内 rag-client.js 权限 | chmod 644 修复（已完成） | ✅ |

### 已完成

- **Layer 1** 客户端 RAG → 三环境全部验证通过
- **Layer 2** QMD BM25 → HP Docker + CF Tunnel
- **Layer 3** 讯飞 + Vectorize → 63,012 文档，29 分钟全量重建
- **自动运维** → 每日 cron 自动同步（03:00 wiki / 03:05 HP / 03:30 Vectorize）

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

## 日常维护

### 每日自动流程

```
03:00  wiki-book-sync（cron）— 同步 wiki → mkdocs build → 近邻图 → 上传 R2
03:05  sync-docs-to-hp（cron）— rsync docs/ → HP，QMD 自动增量索引（~10s）
03:30  sync-vectorize（cron）— 全量重建 Vectorize 向量索引（~29 min，37 docs/s 并发）
```

| 维护项 | 成本 | 自动化 |
|--------|------|--------|
| Layer 1 客户端 RAG | $0 | ✅ build.sh 自动 |
| Layer 2 QMD BM25 (HP) | $0 | ✅ cron 自动 rsync + QMD 增量索引 |
| Layer 3 讯飞 + Vectorize | $0（API 免费） | ✅ cron 每天 03:30 全量重建 |
| 服务器兜底 Phase 2 | $0（Free 额度内） | ✅ 部署时自动 |

### HP 上的 QMD 增量更新

QMD 的索引是增量式的——检测到 docs/ 文件变更后，只 re-index 变动的部分，不需要全量重建。所以 rsync 后 QMD 自动处理，几秒内完成。

