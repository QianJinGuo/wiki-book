# AGENTS.md — Wiki-Book 运维手册

## 项目概览

**Wiki-Book** 是基于 wiki 知识库编撰的《AI 工程》电子书，使用 MkDocs Material 构建。

```
站点名称: AI 工程
源文件:   docs/ (4,024 篇 raw 原文)
章节:     20 章 5 篇 (Ch01-Ch20)
编撰实体: 4,087 (与首页/章节目录口径一致)
拆分页面: 6,509 (ch*/ 目录，含部分章节未精选实体)
域名:     jinguo.tech (CF Pages) / wiki.jinguo.tech (GH Pages)
仓库:     github.com/QianJinGuo/wiki-book
版本:     v1.3.8
```

## 链接规则

| 链接类型 | 目标 | 示例 |
|---------|------|------|
| `[[entities/xxx]]` | 站内章节目录 | `ch01/045-agent.md` → MkDocs 转 `.html` |
| `[[raw/articles/xxx]]` | GitHub blob（`github.com/.../blob/main/raw/articles/...`） | 带 GitHub UI |
| `[[concepts/xxx]]` / `[[moc/xxx]]` | GitHub blob | 同上 |

### 常见问题

- 实体站内链只在 `split-chapters.py` 运行后生效（`fix-docs-links.py` 后处理）
- 流水线顺序：`book_compiler → mkdocs_prepare → split-chapters → fix-docs-links`
- `mkdocs_prepare` 自身构建的 entity_page_index 为空（ch*/ 目录尚未存在），所以 `fix-docs-links.py` 是必须的后处理步骤

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
    └── deploy.yml         # GitHub Actions 副本 — ⚠️ 真正生效的是
                           # .github/workflows/deploy.yml，改工作流请改那份，
                           # 两份文件必须保持一致 (2026-08-29 曾因改错副本漏掉建图)

scripts/
├── build.sh               # 共享构建脚本 (去重标题 → mkdocs → slim → 近邻图, 顺序不可换)
├── deploy.sh              # 主部署脚本 (docker|cloudflare|github|all)
├── dedupe-entity-titles.py  # 删除实体页重复 H2 标题 (每日 sync 会重新引入, build.sh 已内置)
├── build-neighbor-graph.py  # TF-IDF 近邻图构建 (输入必须为 slim 后索引)
├── build-vectorize.py       # Vectorize 索引构建 (Phase 3)
└── slim-search-index.py     # 搜索索引裁剪 (支持 --input, 默认 site/search/)

functions/                  # Cloudflare Pages Functions
├── rag-query.js            # RAG 查询 (Phase 1+2)
└── rag/
    ├── search.js           # 搜索索引端点 (R2 流式)
    └── graph.js            # 近邻图端点 (R2 流式)

overrides/assets/javascripts/
├── rag-client.js           # 客户端 RAG 引擎 (关键词+近邻图, 缓存前缀 rag-v2)
└── ai-chat.js              # AI Chat 面板 (doRagSearch + 三路降级 + 429/503 自动重试)
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

### 三环境 RAG 最终状态 (v1.3.8)

| 能力 | Docker | GitHub Pages | Cloudflare Pages |
|------|--------|-------------|-----------------|
| 客户端搜索 | ✅ | ✅ | ✅ |
| 近邻图扩展 | ✅ (site/assets 静态) | ✅ (GHA slim+建图) | ✅ (R2 /rag/graph，静态兜底) |
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

- 浏览器 IndexedDB 缓存 search_index.json (31,883 篇 slim 文档, ~11MB)
- 缓存前缀 `rag-v2`：索引结构变更时必须递增，否则老访客命中失效缓存
- 关键词搜索 (tokenize + 词频打分, 标题分词 init 时预计算)
- 近邻图扩展 (top-10 种子 × 20 近邻, TF-IDF 余弦)
- 融合排序 (关键词分 × 0.3 + 近邻分 × 10)
- 三路降级: 客户端 → 服务器 → 空结果
- 多环境 URL 降级: CF Pages → GitHub Pages / Docker 静态文件

### 近邻图构建

```bash
# 必须在 slim-search-index.py 之后运行（下标对齐，见 build.sh 顺序说明）
python3 scripts/build-neighbor-graph.py \
  --input site/search/search_index.json \
  --output site/assets/neighbor_graph.json \
  --top-k 20
# 输入: 31,883 篇 slim 文档, TF-IDF → CSR 稀疏矩阵 → A@A.T
# 输出: 15MB, 30,339 节点, 每节点 top-20 近邻 (v2 修复后)
# 耗时: ~1 分钟 (M1 MacBook)
```

> ⚠️ 历史教训 (v1): 图曾基于全量索引 (92,915 条) 构建，而浏览器检索的是
> slim 数组 (31,883 条)，下标空间错位导致近邻扩展返回错误文档且无报错。
> 任何一端 (slim 逻辑 / 建图输入) 变更都必须重新走完整 build.sh 并做
> 「max(graph keys) < len(slim docs)」对齐校验。

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

1. `mkdocs build` — 生成 site/ (含 HTML/JS/全量搜索索引)
2. `slim-search-index.py` — 裁剪搜索索引 (92,915 → 31,883 条, 82MB → 11MB)
3. `build-neighbor-graph.py` — 基于 **slim 后**索引生成近邻图
   (30,339 节点, 15MB)，写入 `site/assets/` (静态环境自愈) + `/tmp/` (供 R2 上传)

> 顺序不可换：rag-client.js 按 slim 数组下标查图，图必须与最终下发的
> 索引同源。本地跑 build.sh 需 numpy/scipy：`PYTHON=.venv/bin/python bash scripts/build.sh`
> (一次性: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`)

### Cloudflare 部署 (deploy/cloudflare/deploy.sh)

1. 上传 search_index.json → R2 `ai-engineering-search`
2. 上传 neighbor_graph.json → R2 `ai-engineering-search`
3. 删除 site/search/search_index.json (>25MB CF 限制)
4. `wrangler pages deploy site` — 部署 HTML + JS + Pages Functions

---

## 质量闭环 (2026-08-29 上线)

知识库现在是**代谢闭环**: 入库(上游评分门禁) → 每日 check & eval → 出口精选门禁 → 指标回流 → 次日优先级。

```
~/wiki/scripts/vault-metrics.py    指标采集 → metrics/history.jsonl (每日一行, 孤儿率/精炼率/stub/重复)
~/wiki/scripts/daily-checkup.py    每日评审: --plan / --execute (确定性归档 stub/副本/0分, 留 redirect stub)
                                   --archive-file F (执行 LLM 评审后的归档清单)
~/wiki/book/compile-report.json    book_compiler 出口门禁拒绝名单 → 自动回流 checkup 复审队列
~/wiki/reports/checkup-<date>.md   每日日报 (指标环比 + 动作 + 复审队列 + LLM 评审结论)
```

- 调度: ZCode 定时自动化每天 04:30 (daily-vault-checkup)；上游入口 cron 见 ~/wiki/CRON.md
- 出口门禁 (book_compiler.py, 2026-08-29): review_value≥7 + 溯源完整 + blacklist + fallback 封顶 200 → 成书 2,201 篇精选 (此前 4,069 全量)。环境变量 `BOOK_QUALITY_GATE=0` 关闭, `BOOK_FALLBACK_CAP` 调整封顶
- 站内链接 9,277 条实测 0 死链 (fix-docs-links 同章链接 bug 已修); 僵尸子页 2,898 → 0 (sync 改 `rm -rf docs/ch*/`)
- 蓝图与度量北极星: meta/VAULT-BLUEPRINT.md

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
# [RagClient] 搜索索引加载完成: 31883 篇
# [RagClient] 近邻图加载完成: 30339 个节点
# [RagClient] 就绪 (31883 篇文档)
```

---

## 已知问题

### 1. Free 计划 503 / 上游 429

```
单次查询:         ✅ 200
连续 3+ 次:       ❌ 503 1102
等待 2-4s 后重试: ✅ 恢复
```

2026-08-29 线上实测：ai-proxy 上游免费额度耗尽时返回 429 `FreeUsageLimitError`。
前端 (ai-chat.js) 已内置: 429/503 自动等待 3s 重试一次 + 友好错误文案
(提示用户在设置中填自己的 Key)。根治: 升级 Workers Paid ($5/月)、更换
provider 或引导用户 BYO Key。

### 2. Docker 文件权限

`docker cp` 注入文件后权限为 600，需手动 `chmod 644`。当前容器内已修复。

### 3. 搜索索引太大 (200MB) — 已结构性修复 (2026-08-29)

根因是绕过 build.sh 直接 mkdocs build 后 compose。现在 build.sh 固定产出
slim 索引 (11MB) + 对齐近邻图 (site/assets/, 15MB)，Dockerfile 直接 COPY
site/，`bash scripts/build.sh && docker compose up -d --build` 即自愈，
无需 docker cp。

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
| `meta/` | 内部文档 (设计/复盘/蓝图/报告, 不进站点) — 索引见 meta/README.md |
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

*更新时间: 2026-08-30 (根目录整理: 内部文档移至 meta/, 清除遗留副本)*
*维护者: Hermes Agent*
*RAG 复盘: meta/RAG-RETROSPECTIVE.md*
