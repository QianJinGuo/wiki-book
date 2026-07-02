# wiki-book RAG 方案设计

## 背景

wiki-book 现有 9,547 篇 Markdown 文档（96MB），搜索索引 37,204 条（13MB），使用 lunr.js 客户端关键词搜索。AI Chat 功能已上线，但 LLM 回答时**没有 wiki-book 内容作为上下文**，只能依赖模型自身知识。

## 目标

让 AI Chat 能基于 wiki-book 的实际内容回答用户问题，并附上来源链接。

## 当前状态（2026-07-02）

| Phase | 状态 | 稳定性 | 备注 |
|-------|------|--------|------|
| Phase 1: 关键词搜索 | ✅ 线上运行 | 10/10 200 | Pages Function + R2 |
| Phase 2: Reranker 重排序 | ✅ 线上运行 | 10/10 200 | Workers AI bge-reranker-base |
| Phase 3: 语义搜索 | ❌ 间歇 503 | 受 Free 计划限制 | 基础设施已就绪，待 Workers Paid 升级 |

**线上稳定运行 Phase 1+2，Phase 3 待 Workers Paid 升级后启用。**

## 可用基础设施

| 资源 | 用途 | 状态 |
|------|------|------|
| R2 bucket `ai-engineering-search` | 存储 search_index.json | ✅ |
| Pages Function `functions/rag-query.js` | 服务端 RAG 逻辑 | ✅ 线上运行 |
| `@cf/baai/bge-reranker-base` | 重排序模型（query + doc → 相关性分数） | ✅ Workers AI Free 可用 |
| `@cf/baai/bge-m3` | 多语言 Embedding 模型（1024维），Phase 3 使用 | ✅ Workers AI Free 可用 |
| Vectorize `wiki-book-embeddings` | 托管向量索引（37,204 条向量，1024维，cosine） | ✅ 已创建并写入 |
| `wrangler.toml` (根目录) | Pages 部署配置，含 AI + Vectorize + R2 绑定 | ✅ 完整 |
| `deploy/cloudflare/wrangler.toml` | 部署脚本使用的配置 | ⚠️ 仅含 R2 绑定，缺少 AI + Vectorize |

## 架构总览

```
用户提问
    │
    ▼
AI Chat (ai-chat.js)
    │
    ├─ GET /rag-query?q=... (Pages Function)
    │      │
    │      ├─ 加载 search_index.json（R2 边缘缓存，5min TTL）
    │      │
    │      ├─ Phase 1: 关键词匹配 → top 30 候选
    │      │     （词频匹配，标题权重 3x，正文权重 1x）
    │      │
    │      ├─ Phase 2: Workers AI reranker 重排序
    │      │     @cf/baai/bge-reranker-base
    │      │     输入: 问题 + 候选文档（标题+正文前500字）
    │      │     输出: 每篇相关性分数
    │      │
    │      ├─ [Phase 3: 语义搜索 — 被 Free 计划 CPU/内存限制阻塞]
    │      │     Workers AI bge-m3 → Vectorize 查询
    │      │     → 与关键词结果融合 → reranker → top 5
    │      │
    │      └─ 返回 top 5 片段 + 章节链接
    │             source: "reranker" (Phase 1+2) 或 "hybrid" (Phase 3 启用后)
    │
    └─ 将上下文注入 LLM 请求（通过 /ai-proxy → MiMo API）
          system: "基于以下 wiki-book 内容回答:\n{context}"
          user:   "{question}"
```

## Phase 1：关键词搜索（已有数据，零成本）

### 算法

```
输入: 用户问题 Q, 搜索索引 docs[37,204]
输出: top 30 候选文档

1. 分词: Q → words[]（去停用词，>1 字符，中日英）
2. 对每篇文档:
   title_score = words 在标题中的匹配数 × 3（子串匹配额外 +2）
   text_score  = words 在正文中的匹配数 × 1（子串匹配额外 +1）
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
   输入: { query: "问题", texts: ["标题: 候选1\n内容: ...", ...] }
   输出: [{ index: 0, score: 0.95 }, { index: 1, score: 0.12 }, ...]
3. 按 score 降序，取 top 5
4. 返回 { results: [{ title, location, text, score }], source: "reranker" }
```

### 费用
- Workers Free 计划：每天 10,000 次神经元调用免费
- 每次查询 = 1 次 reranker 调用
- 个人网站用量远低于免费额度 → **零成本**

## Phase 3：语义搜索（待 Workers Paid 升级）

### 当前限制

Cloudflare Pages Functions **Free 计划**限制：

| 限制项 | 数值 | 影响 |
|--------|------|------|
| 内存上限 | 128MB | 37K × 1024 维向量全量加载约 152MB，超限 |
| CPU 时间 | 10ms | 任何 Embedding + Vectorize 调用都超限 |
| 实例回收 | 频繁 | 全局缓存不持久，冷启动必超时 503 |

### 已尝试过的方案及失败原因

| 方案 | 失败原因 |
|------|---------|
| R2 二进制 chunk + 全量加载 | 内存超限（152MB > 128MB） |
| R2 二进制 chunk + 流式搜索 | CPU 超限（4 次 R2 读取 + 4 次余弦扫描 > 10ms） |
| 全量加载 + 全局缓存 | 冷启动超时，实例回收后间歇 503 |
| Vectorize 托管搜索 | loadIndex + embedding + query 超 CPU 限制 |
| Workers AI embedding + Vectorize query | embedding 调用本身就 >10ms CPU 时间 |

### 根本原因

Pages Function 的 Free 计划 CPU 时间限制 **10ms** 是核心瓶颈。即使只做一次 Workers AI embedding 调用（非流式），也需要 200-500ms 的等待时间，远超 10ms 限制。Vectorize 查询本身也需要网络往返。

Workers Paid 计划（$5/月）将 CPU 时间从 **10ms → 30s**，内存限制也大幅放宽，可彻底解决此问题。

### 已就绪的基础设施

升级 Workers Paid 后，**无需任何代码修改**即可启用 Phase 3：

```
查询时:
  1. env.AI.run("@cf/baai/bge-m3", { text: [query] }) → query embedding
  2. env.VECTORIZE.query(embedding, { topK: 15 }) → top 15 语义结果
  3. 与关键词结果融合（去重，语义结果 score × 10 平衡权重）
  4. 合并候选 → reranker → 返回 top 5, source: "hybrid"
```

Vectorize 索引 `wiki-book-embeddings` 已创建并写入 37,204 条向量（1024 维，cosine 距离），直接可用。代码 `functions/rag-query.js` 已内置 Phase 3 逻辑，部署即生效。

### 构建脚本

```bash
cd ~/wiki-book
python3 scripts/build-vectorize.py
```

从 search_index.json 读取文档，调用 Workers AI bge-m3 生成向量，批量插入 Vectorize 索引。

## 当前困境

### 困境 1：Phase 3 被 Free 计划 CPU/内存锁死

所有基础设施已就绪（Vectorize 索引、代码、绑定配置），但 Pages Function Free 计划的 10ms CPU 时间限制使任何 AI/Vectorize 调用都不可行。这是 Cloudflare 的硬性限制，无法通过优化绕过。**唯一解决方案是升级 Workers Paid（$5/月）。**

### 困境 2：双 wrangler.toml 配置漂移

**严重问题：** 仓库中存在两个 wrangler.toml：

| 文件 | AI 绑定 | Vectorize 绑定 | R2 绑定 | 谁在用 |
|------|---------|---------------|---------|--------|
| `wrangler.toml`（根目录） | ✅ | ✅ | ✅ | 手动 `npx wrangler pages deploy` |
| `deploy/cloudflare/wrangler.toml` | ❌ | ❌ | ✅ | `deploy.sh cloudflare` 部署脚本 |

如果使用 `deploy.sh cloudflare` 部署，部署后的 Pages Function **没有 AI 和 Vectorize 绑定**，Phase 2（reranker）和 Phase 3 都会失败，静默降级到关键词搜索（Phase 1 不走 Workers AI 所以仍可用）。

**根因：** `deploy/cloudflare/wrangler.toml` 是 AGENTS.md 中描述的部署入口，但未随功能升级同步更新。

### 困境 3：Docker 本地环境无 RAG

- **Docker**（localhost:8002）：`ai-chat.js` 的 `RAG_URL = "/rag-query"` 指向 `http://localhost:8002/rag-query`
- 但 MkDocs 容器不提供 `/rag-query` 端点（那是 Pages Function）
- 导致本地 Docker 环境的 AI Chat **RAG 请求 404**

### 困境 4：RAG 端到端测试缺失

`test-rag.mjs` 仅验证前端 JS 中 `RAG_URL` 变量存在，**没有实际发送任何查询到 `/rag-query` 端点**，更没有验证：
- 关键词搜索返回结果格式
- Reranker 是否正常工作
- 搜索结果的相关性质量

### 困境 5：搜索索引与站点不同步

`search_index.json` 存储在 R2 `ai-engineering-search` bucket，但：
- 站点内容更新后，需要手动重新部署到 Cloudflare Pages
- R2 中的搜索索引可能落后于最新站点版本
- 没有自动化流程保证搜索索引与文档版本一致

具体困境：MkDocs 构建时生成的 `site/search/search_index.json` 包含 9,547 篇文档的所有文本。但部署到 CF Pages 时该文件被删除（超过 25MB Pages 限制），改为从 R2 读取。R2 中的版本何时更新、谁来更新的问题没有解决。

## 安全

- `/rag-query` 通过 Pages Function 提供，同域访问（无 CORS 问题）
- 不暴露 search_index.json 给客户端
- Workers AI 调用走 Cloudflare 内部网络，不经过公网
- AI Chat 的 LLM 代理 `/ai-proxy` 有 X-Site-Token 校验 + IP 频率限制（30/min）

## 与现有 AI Chat 的集成

```
用户输入 → sendMessage()
    │
    ├─ fetch /rag-query?q=用户问题&top_k=5
    │    返回 { results: [{ title, location, text, score }], source }
    │
    ├─ 构建 system prompt:
    │   "你是一个基于 wiki-book 内容的 AI 助手。
    │    当前文章内容：
    │    {当前文章前 2000 字}
    │
    │    以下是 wiki-book 中与用户问题相关的参考资料：
    │    1. [标题](https://wiki.jinguo.tech/location)
    │       内容摘要...
    │
    │    请根据以上参考资料回答用户问题..."
    │
    └─ 正常调用 LLM（system + conversation_history + user）
```

## 部署

### 配置绑定

| 组件 | 方式 | 文件 |
|------|------|------|
| `functions/rag-query.js` | 随 Cloudflare Pages 部署（`functions/` 目录自动识别） | 无需额外配置 |
| R2 `SEARCH_INDEX` 绑定 | `wrangler.toml` | 两个 wrangler.toml 都已配置 |
| AI 绑定 | `wrangler.toml` | ✅ 根目录有，⚠️ `deploy/cloudflare/` 缺失 |
| Vectorize `VECTORIZE` 绑定 | `wrangler.toml` | ✅ 根目录有，⚠️ `deploy/cloudflare/` 缺失 |
| `ai-chat.js` 前端 | 随 mkdocs build 部署 | `overrides/assets/javascripts/` |
| search_index.json | R2 bucket `ai-engineering-search` | 需独立更新 |
| Vectorize `wiki-book-embeddings` | 独立 Python 脚本构建 | `scripts/build-vectorize.py` |

### 部署 Pages Function

方法一（推荐——同步两个 wrangler.toml 后使用部署脚本）：
```bash
cd ~/wiki-book
./scripts/deploy.sh cloudflare --build
```

方法二（手动部署）：
```bash
cd ~/wiki-book
rm -f site/search/search_index.json  # 超 25MB，从 R2 读取
npx wrangler pages deploy site --project-name=ai-engineering --branch=main
```

### 验证

```bash
# Phase 1+2（当前）
curl "https://jinguo.tech/rag-query?q=Agent记忆"
# 返回: { results: [...], source: "reranker" }

# Phase 1+2+3（升级 Workers Paid 后）
curl "https://jinguo.tech/rag-query?q=Agent记忆"
# 返回: { results: [...], source: "hybrid" }
```

## 当前可用的 RAG 数据缺口

使用 `source: "reranker"` 生产环境验证，Phase 1+2 的实际召回情况：

| 查询类型 | 关键词匹配 | Reranker 提升 |
|---------|-----------|---------------|
| 专有名词（"MCP", "Agent", "Harness"） | ✅ 高 | 边际提升 |
| 短概念（"记忆", "工具调用"） | ✅ 中 | 明显提升 |
| 口语化/模糊（"怎么做 AI 应用"） | ⚠️ 低 | 受限于候选集 |
| 跨语言（"hallucination" → "幻觉"） | ❌ 无匹配 | 需要 Phase 3 语义搜索 |

**关键发现：** Reranker 能重排序但**不能找回关键词未匹配的文档**。如果关键词搜索阶段漏掉了相关文档（例如用户用英文问中文文章的内容），reranker 也无能为力。这正是 Phase 3 语义搜索的核心价值——通过语义匹配发现关键词命中不了的相关文档。

## 页面 404 修复

Cloudflare Pages 使用扁平文件名（`ch04-001-agent.html`），但章节索引页链接使用子目录格式（`ch04/001-agent.html`）。

修复方案：
1. `site/_redirects` — Cloudflare Pages 重写规则，`ch04/* → ch04-:splat 200`
2. `fix_filenames.py` — 按序号前缀创建短 slug 文件副本

三套部署环境独立：
- **Docker**（localhost:8002）— nginx `try_files` 兜底
- **GitHub Pages**（wiki.jinguo.tech）— 自有构建流程
- **Cloudflare Pages**（jinguo.tech）— `_redirects` + 短 slug 副本

## 升级路径

### 短期（Free 计划现状）
- Phase 1 关键词搜索 — 基础可用
- Phase 2 Reranker 重排序 — 显著提升排序质量
- ✅ 修复 `deploy/cloudflare/wrangler.toml` 缺少 AI + Vectorize 绑定的问题
- ✅ 修复 Docker 本地环境的 RAG 404 问题
- ✅ 补全端到端测试

### 长期（升级 Workers Paid $5/月）
- Phase 3 语义搜索 — 同义词/跨语言匹配
- 融合检索（keyword + vector hybrid）— 综合精确匹配与语义理解
- 自动同步搜索索引 — 内容更新后自动重建向量

## 文件索引

| 文件 | 用途 |
|------|------|
| `functions/rag-query.js` | Pages Function：RAG 查询入口 |
| `overrides/assets/javascripts/ai-chat.js` | 前端：AI Chat 面板 + RAG 集成 |
| `scripts/build-vectorize.py` | 构建 Vectorize 向量索引 |
| `wrangler.toml` | Pages 部署配置（含 AI + Vectorize + R2 绑定） |
| `deploy/cloudflare/wrangler.toml` | 部署脚本使用的配置（⚠️ 缺少 AI + Vectorize 绑定） |
| `deploy/cloudflare/ai-proxy/worker.js` | Cloudflare Worker：AI Chat CORS 代理 |
| `test-rag.mjs` | Playwright 端到端测试（仅验证 UI，未测试 /rag-query） |
| `RAG-DESIGN.md` | 本设计文档 |
