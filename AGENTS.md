# AGENTS.md — Wiki-Book 运维手册

## 项目概览

**Wiki-Book** 是基于 wiki 知识库编撰的《AI 工程》电子书，使用 MkDocs Material 构建。

```
站点名称: AI 工程
源文件:   docs/ (4,000+ 篇文章)
章节:     20 章 (Ch01-Ch20)
域名:     jinguo.tech
仓库:     github.com/QianJinGuo/wiki-book
```

---

## 三环境部署架构

```
docs/ (源文件，共享)
  ↓
MkDocs 构建 → site/ (构建产物)
  ↓
┌─────────────────────────────────────────────────┐
│ Docker (localhost:8002)  │ Dockerfile + nginx.conf │
│ Cloudflare Pages         │ wrangler.toml           │
│ GitHub Pages             │ .github/workflows/      │
└─────────────────────────────────────────────────┘
```

### 环境目录结构

```
deploy/
├── docker/
│   ├── Dockerfile         # 多阶段构建: python→nginx
│   ├── nginx.conf         # 缓存 + RAG fallback + 清洁 URL
│   └── docker-compose.yml
├── cloudflare/
│   ├── wrangler.toml → ../../wrangler.toml  # symlink
│   ├── deploy.sh          # 上传 R2 + 部署 Pages
│   └── ai-proxy/          # Cloudflare Worker: AI Chat CORS 代理
└── github/
    └── deploy.yml         # GitHub Actions (含近邻图构建)

scripts/
├── build.sh               # 共享构建脚本 (mkdocs + 近邻图 + slim)
├── deploy.sh              # 主部署脚本 (docker|cloudflare|github|all)
├── build-neighbor-graph.py  # TF-IDF 近邻图构建
├── build-vectorize.py       # Vectorize 索引构建 (Phase 3)
└── slim-search-index.py     # 搜索索引裁剪

functions/                  # Cloudflare Pages Functions
├── rag-query.js            # RAG 查询 (Phase 1+2)
└── rag/
    ├── search.js           # 搜索索引端点 (R2 流式)
    └── graph.js            # 近邻图端点 (R2 流式)

overrides/assets/javascripts/
├── rag-client.js           # 客户端 RAG 引擎 (关键词+近邻图)
└── ai-chat.js              # AI Chat 面板 (doRagSearch + 三路降级)
```

---

## RAG 系统

### 四层 RAG 架构

```
Layer 1: 浏览器 rag-client.js     — IndexedDB 关键词+近邻图, 0ms
Layer 2: QMD BM25 (HP Docker)    — SQLite FTS5 BM25, ~50ms
Layer 3: 讯飞 + Vectorize (CF)    — 语义搜索, ~300ms
兜底:    Pages Function           — Phase 1 关键词 + Phase 2 Reranker
```

### 三环境 RAG 最终状态 (v1.3.3)

| 能力 | Docker | GitHub Pages | Cloudflare Pages |
|------|--------|-------------|-----------------|
| 客户端搜索 | ✅ | ✅ | ✅ |
| 近邻图扩展 | ✅ (注入) | ✅ (GHA 构建) | ✅ (R2) |
| 语义搜索 (Layer 3) | ❌ | ❌ | ✅ 讯飞 + Vectorize |
| Reranker | ❌ nginx 兜底 | ❌ 无服务器 | ⚠️ Free 503 |

### 数据流

```
用户输入 → sendMessage()
    │
    ├─ doRagSearch(text) ← 客户端优先
    │    ├─ ragClient.search() → Tier 1 关键词+近邻图
    │    ├─ fetch(/rag-query) → Phase 1+2 服务器兜底
    │    └─ 空结果静默降级
    │
    └─ 注入 LLM → ai-proxy → MiMo API
```

### 客户端 RAG 引擎 (rag-client.js)

- 浏览器 IndexedDB 缓存 search_index.json (61K 文档)
- 关键词搜索 (tokenize + 词频打分)
- 近邻图扩展 (top-10 种子 × 20 近邻, TF-IDF 余弦)
- 融合排序 (关键词分 × 0.3 + 近邻分 × 10)
- 三路降级: 客户端 → 服务器 → 空结果
- 多环境 URL 降级: CF Pages → GitHub Pages / Docker 静态文件

### 近邻图构建

```bash
python3 scripts/build-neighbor-graph.py \
  --input site/search/search_index.json \
  --output site/assets/neighbor_graph.json \
  --top-k 20
# 输入: 63K 文档, TF-IDF → CSR 稀疏矩阵 → A@A.T
# 输出: 30MB, 57K 节点, 每节点 top-20 近邻
# 耗时: ~1 分钟 (M1 MacBook)
```

---

## 部署

### 部署命令

```bash
# 部署全部 (构建 + Docker + CF Pages + GitHub)
./scripts/deploy.sh all --build

# 仅部署 Docker
./scripts/deploy.sh docker --build

# 仅部署 Cloudflare (需先 build)
rm -f site/search/search_index.json  # >25MB, 从 R2 读取
npx wrangler pages deploy site --project-name=ai-engineering --branch=main

# 仅 GitHub Pages (自动触发 Actions)
git push origin main
```

### 构建流程 (build.sh)

1. `mkdocs build` — 生成 site/ (含 HTML/JS/搜索索引)
2. `build-neighbor-graph.py` — 从完整搜索索引生成近邻图
3. `slim-search-index.py` — 裁剪搜索索引 (68MB → 21MB)

### Cloudflare 部署 (deploy/cloudflare/deploy.sh)

1. 上传 search_index.json → R2 `ai-engineering-search`
2. 上传 neighbor_graph.json → R2 `ai-engineering-search`
3. 删除 site/search/search_index.json (>25MB CF 限制)
4. `wrangler pages deploy site` — 部署 HTML + JS + Pages Functions

---

## 验证

### Playwright 端到端测试

```bash
node test-rag.mjs
```

覆盖:
- 5 组查询 × 3 环境 (Docker / GH Pages / CF Pages)
- 响应结构验证 (results 数组 + source)
- top1 相关性验证
- Free 503 自动重试
- 前端脚本引用检查 (rag-client.js + ai-chat.js)
- 客户端 ragClient.search() 验证

### 手动验证

```bash
# RAG 端点存活
curl https://jinguo.tech/rag/search       # → 200
curl https://jinguo.tech/rag/graph        # → 200
curl https://jinguo.tech/rag-query?q=test # → 200 或 503

# RAG 客户端日志 (浏览器 Console)
# [RagClient] 搜索索引加载完成: 61669 篇
# [RagClient] 近邻图加载完成: 57380 个节点
# [RagClient] 就绪 (61669 篇文档)
```

---

## 已知问题

### 1. Free 计划 503

```
单次查询:         ✅ 200
连续 3+ 次:       ❌ 503 1102
等待 2-4s 后重试: ✅ 恢复
```

解决方案: 升级 Workers Paid ($5/月) 或部署 QMD 到 HP。

### 2. Docker 文件权限

`docker cp` 注入文件后权限为 600，需手动 `chmod 644`。当前容器内已修复。

### 3. 搜索索引太大 (200MB)

Docker 构建的搜索索引未 slim (200MB)，浏览器 fetch 会超时。通过 `docker cp` 注入 21MB 裁剪版解决。正式修复需修改 Dockerfile 添加 slim 步骤。

---

## 文件索引

| 文件 | 用途 |
|------|------|
| `functions/rag-query.js` | Pages Function: Phase 1+2 服务端 RAG |
| `functions/rag/search.js` | 搜索索引端点 (R2 流式) |
| `functions/rag/graph.js` | 近邻图端点 (R2 流式) |
| `overrides/assets/javascripts/rag-client.js` | 客户端 RAG 引擎 |
| `overrides/assets/javascripts/ai-chat.js` | AI Chat + doRagSearch |
| `overrides/main.html` | 加载 rag-client.js |
| `scripts/build-neighbor-graph.py` | 近邻图构建 |
| `scripts/build-vectorize.py` | Vectorize 索引构建 |
| `scripts/slim-search-index.py` | 搜索索引裁剪 |
| `test-rag.mjs` | Playwright E2E 测试 |
| `RAG-DESIGN.md` | RAG 方案设计 |
| `RAG-RETROSPECTIVE.md` | 全流程复盘 |
| `wrangler.toml` | Pages 配置 (单一真相源) |

---

## 快速参考

```bash
# 本地开发 (Docker)
cd ~/wiki-book && docker compose up -d --build

# 部署到 CF Pages
cd ~/wiki-book && rm -f site/search/search_index.json && npx wrangler pages deploy site --project-name=ai-engineering --branch=main

# RAG 端点验证
curl https://jinguo.tech/rag/search | head -c 100
curl https://jinguo.tech/rag/graph | head -c 100
curl "https://jinguo.tech/rag-query?q=Agent记忆" | python3 -m json.tool | head -10

# Playwright 测试
node test-rag.mjs
```

---

*更新时间: 2026-07-02 (v1.3.3)*
*维护者: Hermes Agent*
*RAG 复盘: RAG-RETROSPECTIVE.md*
