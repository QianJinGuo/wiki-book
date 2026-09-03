# AGENTS.md — Wiki-Book 运维手册

## 项目概览

**Wiki-Book** 是基于 wiki 知识库编撰的《AI 工程》电子书，使用 MkDocs Material 构建。

```
站点名称: AI 工程
源文件:   docs/ (章节源文件 + raw 原始资料, 每日 sync 更新；raw 不进入站点)
章节:     20 章 5 篇 (Ch01-Ch20)
编撰条目: 2,201 篇 (站点首页指标；不要与页面文件数相加)
可发布页面: 1,944 个 docs/chXX/*.md (dashboard/course 最近一次生成时扫描，随每日 sync 变化)
原始资料: docs/raw/articles/ (当前约 4,000+ 个 Markdown 文件；公开仓库可读，但 MkDocs 排除)
域名:     jinguo.tech (CF Pages) / wiki.jinguo.tech (GH Pages)
仓库:     github.com/QianJinGuo/wiki-book
版本:     v1.3.8
```

公开边界：`docs/raw/` 虽由 `mkdocs.yml` 的 `exclude_docs` 排除、不生成站点页面，仍然是公开 GitHub 仓库的一部分；当前 raw 目录只保留来源索引，不保留私有 wiki 的原文正文。`meta/` 是不进站点的公开内部过程文档。两者都不得提交密钥、个人凭据或不适合公开的内容。`docs/AGENTS.md`、`docs/sprint.html` 和 `tests/archive/` 已清理，不应重新加入。

## 链接规则

| 链接类型 | 目标 | 示例 |
|---------|------|------|
| `[[entities/xxx]]` | 站内章节目录 | `ch01/045-agent.md` → MkDocs 转 `.html` |
| `[[raw/articles/xxx]]` | 本仓库 GitHub blob（`github.com/QianJinGuo/wiki-book/blob/main/docs/raw/articles/...`） | 带 GitHub UI |
| `[[concepts/xxx]]` / `[[moc/xxx]]` | 公开 wiki 镜像 GitHub blob（`github.com/QianJinGuo/wiki-public/blob/main/...`） | 带 GitHub UI |

`docs/raw/` 的链接有意指向 wiki-book 自己的 GitHub 永久地址；实体、概念和导航页链接指向 `wiki-public`。URL 由仓库根目录的 `site-links.json` 统一配置，修改链接规则时必须同时运行 `scripts/fix-github-links.mjs --apply`、检查 `docs/PATH.md`，并通过 `scripts/check-wiki-links.mjs`。

### 常见问题

- 实体站内链只在章节拆分完成后生效；每日同步或重编号后必须重新生成 dashboard/course 索引。
- 当前仓库的构建入口是 `scripts/build.sh`；不要绕过它直接把未裁剪的 MkDocs 搜索索引部署出去。
- 旧的 `split-chapters.py` / `fix-docs-links.py` 流程属于上游编译背景；若修改上游流程，必须确认最终生成的 `docs/chXX/*.md` 与索引链接一致。

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
│ GitHub Pages             │ .github/workflows/deploy.yml │
└─────────────────────────────────────────────────┘
```

### 环境目录结构

```
deploy/
├── docker/
│   ├── Dockerfile         # nginx 静态服务 (复制已生成的 site/)
│   ├── nginx.conf         # 缓存 + RAG fallback + 清洁 URL
│   └── docker-compose.yml
├── cloudflare/
│   ├── wrangler.toml → ../../wrangler.toml  # symlink
│   ├── deploy.sh          # 上传 R2 + 部署 Pages
│   └── ai-proxy/          # Cloudflare Worker: AI Chat CORS 代理
└── github/
    └── deploy.sh          # GitHub Pages 部署辅助脚本

.github/workflows/deploy.yml  # GitHub Actions 唯一工作流来源

scripts/
├── build.sh               # 共享构建脚本 (课程/仪表盘 → 去重 → mkdocs → slim → 近邻图)
├── deploy.sh              # 主部署脚本 (docker|cloudflare|github|all)
├── dedupe-entity-titles.py  # 删除实体页重复 H2 标题 (每日 sync 会重新引入, build.sh 已内置)
├── build-neighbor-graph.py  # TF-IDF 近邻图构建 (输入必须为 slim 后索引)
├── build-vectorize.py       # Vectorize 索引构建 (Phase 3)
└── slim-search-index.py     # 搜索索引裁剪 (支持 --input, 默认 site/search/)

functions/                  # Cloudflare Pages Functions
├── rag-query.js            # RAG 查询 (关键词、Reranker、语义搜索)
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

### 三环境 RAG 支持矩阵 (v1.3.8)

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
    │    ├─ fetch(/rag-query) → Phase 1–3 服务器兜底
    │    └─ 空结果静默降级
    │
    └─ 注入 LLM → ai-proxy → MiMo API
```

### 客户端 RAG 引擎 (rag-client.js)

- 浏览器 IndexedDB 缓存由构建生成的 slim `search_index.json`；条目数和体积随每日同步变化，不在代码中写死
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
# 输入: slim 后的 search_index.json, TF-IDF → CSR 稀疏矩阵 → A@A.T
# 输出: 每节点 top-20 近邻；数量和体积以本次构建输出为准
# 耗时: ~1 分钟 (M1 MacBook)
```

> ⚠️ 历史教训 (v1): 图曾基于全量索引构建，而浏览器检索的是 slim 数组，
> 下标空间错位导致近邻扩展返回错误文档且无报错。
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

# 仅部署 Cloudflare (需先 build；脚本会上传 RAG 资源并清理超大文件)
./deploy/cloudflare/deploy.sh

# 仅 GitHub Pages (自动触发 Actions)
git push origin main
```

> 发布前必须先检查 `git status` 和 `git diff`。`deploy/github/deploy.sh` 会执行 `git add -A` 并提交当前工作树，不能在未审阅本地生成物或封面中间文件时直接运行。

### 构建流程 (build.sh)

1. `build-course.py` — 从当前 `docs/chXX/*.md` 生成学习课程索引
2. `rank-articles.py` — 生成 dashboard 文章目录
3. `dedupe-entity-titles.py --apply` — 清理每日 sync 可能重新引入的重复标题
4. `mkdocs build` — 生成 site/ 和全量搜索索引
5. `slim-search-index.py` — 裁剪搜索索引
6. `build-neighbor-graph.py` — 基于 **slim 后**索引生成近邻图，写入 `site/assets/` (静态环境) 和 `/tmp/` (供 R2 上传)

> 顺序不可换：rag-client.js 按 slim 数组下标查图，图必须与最终下发的
> 索引同源。本地跑 build.sh 需 numpy/scipy：`PYTHON=.venv/bin/python bash scripts/build.sh`
> (一次性: `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`)

### Cloudflare 部署 (deploy/cloudflare/deploy.sh)

1. 上传 search_index.json → R2 `ai-engineering-search`
2. 上传 neighbor_graph.json → R2 `ai-engineering-search`
3. 删除 `site/` 中超过 25MB 的文件 (Cloudflare Pages 限制)
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
- 出口门禁 (book_compiler.py): review_value≥7 + 溯源完整 + blacklist + fallback 封顶 200 → 站点首页展示 2,201 篇精选；该指标与 1,944 个可发布页面不是同一层级。环境变量 `BOOK_QUALITY_GATE=0` 关闭, `BOOK_FALLBACK_CAP` 调整封顶
- 站内链接、孤儿率和僵尸页数量以每日检查报告为准，不要把历史快照当作当前值。
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
# [RagClient] 搜索索引加载完成: <本次构建生成的数量> 篇
# [RagClient] 近邻图加载完成: <本次构建生成的节点数> 个节点
# [RagClient] 就绪 (<本次构建生成的文档数> 篇文档)
```

最近一次 `node test-rag.mjs`（2026-09-03）为 24/26：生产和 GitHub Pages 检查通过；当前 Docker 容器的 `/rag/search`、`/rag/graph` 返回 HTML/404，Docker 前端检查也失败。这个结果是运行环境基线，不应被描述为全绿。

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

### 2. Docker 本地 RAG 端点

截至 2026-09-03，`node test-rag.mjs` 在本地 Docker 环境对 `/rag/search`、`/rag/graph` 的检查仍未通过，返回内容为 HTML/404；这与 Cloudflare Pages 的 R2 端点设计不同。修改 Docker 或 nginx 配置后，应先单独验证这两个端点，再运行完整 E2E。

### 3. 搜索索引太大 — 已结构性修复 (2026-08-29)

根因是绕过 build.sh 直接 mkdocs build 后 compose。现在 build.sh 固定先产出
slim 索引和对齐近邻图，Dockerfile 直接 COPY `site/`；应使用
`PYTHON=.venv/bin/python bash scripts/build.sh` 后再启动 Docker，避免手工
`docker cp` 注入生成物。

---

## 文件索引

| 文件 | 用途 |
|------|------|
| `functions/rag-query.js` | Pages Function: Phase 1–3 服务端 RAG |
| `functions/rag/search.js` | 搜索索引端点 (R2 流式) |
| `functions/rag/graph.js` | 近邻图端点 (R2 流式) |
| `overrides/assets/javascripts/rag-client.js` | 客户端 RAG 引擎 |
| `overrides/assets/javascripts/ai-chat.js` | AI Chat + doRagSearch |
| `overrides/main.html` | 加载 rag-client.js |
| `scripts/build.sh` | 共享构建入口和固定执行顺序 |
| `scripts/build-course.py` | 从可发布章节页生成课程索引 |
| `scripts/rank-articles.py` | 生成 dashboard 文章目录 |
| `scripts/build-neighbor-graph.py` | 近邻图构建 |
| `scripts/build-vectorize.py` | Vectorize 索引构建 |
| `scripts/slim-search-index.py` | 搜索索引裁剪 |
| `test-rag.mjs` | Playwright E2E 测试 |
| `.github/workflows/deploy.yml` | GitHub Pages Actions 唯一工作流 |
| `deploy/README.md` | 三环境部署边界和入口说明 |
| `meta/` | 内部文档 (设计/复盘/蓝图/报告, 不进站点) — 索引见 meta/README.md |
| `wrangler.toml` | Pages 配置 (单一真相源) |

---

## 快速参考

```bash
# 本地开发 (先构建，再启动 Docker)
cd ~/wiki-book && PYTHON=.venv/bin/python bash scripts/build.sh
cd ~/wiki-book && docker compose up -d --build

# 部署到 CF Pages
cd ~/wiki-book && ./deploy/cloudflare/deploy.sh

# RAG 端点验证
curl https://jinguo.tech/rag/search | head -c 100
curl https://jinguo.tech/rag/graph | head -c 100
curl "https://jinguo.tech/rag-query?q=Agent记忆" | python3 -m json.tool | head -10

# Playwright 测试
node test-rag.mjs
```

---

*更新时间: 2026-09-03 (同步公开范围、构建口径和部署入口)*
*维护者: Hermes Agent*
*RAG 复盘: meta/RAG-RETROSPECTIVE.md*
