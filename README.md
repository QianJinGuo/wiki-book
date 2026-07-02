# AI 工程

> 全球第一部基于 2496 篇一手 AI 材料系统编撰的开源读物。
> 从零基础到 AI 专家到 AI 科学家，博采众长，一路到底。

**作者：AI 社区众创 | 编撰：Hermes Agent | 开源协议：CC BY-SA 4.0**

## 全书结构

| 篇 | 章节 | 定位 | 文章数 |
|---|---|---|---|
| 第一篇 · 入门篇 | Ch01 AI 与 LLM 基础 | 任何人 | 1807 篇 |
| 第二篇 · 工程师篇 | Ch03 AI 工具与产品全景 | 有编程基础 | 192 篇 |
| | Ch04 Agent 核心架构 | | 1041 篇 |
| | Ch05 Harness 工程 | | 167 篇 |
| | Ch07 技能、工具与 MCP | | 114 篇 |
| | Ch09 AI 编程与代码生成 | | 229 篇 |
| 第三篇 · 专家篇 | Ch11 云基础设施与部署 | 有 ML 基础 | 425 篇 |
| | Ch12 安全与治理 | | 194 篇 |
| **总计** | **8 个活跃章节** | | **2496 篇** |

> Ch02/06/08/10/13-20 尚在编撰中。

## 三环境部署

| 环境 | URL | 用途 |
|------|-----|------|
| **Cloudflare Pages** | https://jinguo.tech | 生产域名，含 RAG Pages Function |
| **GitHub Pages** | https://wiki.jinguo.tech | 纯静态站点，客户端 RAG |
| **Docker** | http://localhost:8002 | 本地开发，客户端 RAG |

## RAG (AI Chat)

所有环境均有 AI Chat 浮窗（右下角 🤖）。提问时自动检索 wiki-book 63,000+ 篇文档作为 LLM 上下文：

| 能力 | 说明 | 生效环境 |
|------|------|---------|
| 客户端关键词搜索 | 浏览器本地 IndexedDB 检索，零服务器 | 全部 |
| 近邻图概念扩展 | "Agent 记忆" → 自动带出"上下文管理" | 全部 |
| Reranker 重排序 | 语义级精排 | CF Pages (间歇 503) |

详情见 [RAG-DESIGN.md](./RAG-DESIGN.md) 和 [RAG-RETROSPECTIVE.md](./RAG-RETROSPECTIVE.md)。

## 快速启动

### Docker（推荐）

```bash
docker compose up -d
```

访问 http://localhost:8002

### 本地开发

```bash
pip install -r requirements.txt
mkdocs serve -a 0.0.0.0:8000
```

访问 http://localhost:8000

## 更新内容

```bash
# 编辑 docs/ 下的 markdown 文件后：
docker compose up -d --build
```

## 项目结构

```
wiki-book/
├── docs/                    # 4000+ Markdown 源文件
├── overrides/               # MkDocs 主题覆盖
│   └── assets/javascripts/
│       ├── rag-client.js    # 客户端 RAG 引擎
│       └── ai-chat.js       # AI Chat 面板
├── functions/               # Cloudflare Pages Functions
│   ├── rag-query.js         # RAG 查询 (Phase 1+2)
│   └── rag/
│       ├── search.js        # 搜索索引端点
│       └── graph.js         # 近邻图端点
├── scripts/
│   ├── build.sh             # 统一构建脚本
│   ├── build-neighbor-graph.py  # 近邻图构建
│   └── slim-search-index.py     # 搜索索引裁剪
├── deploy/
│   ├── docker/              # Docker 部署
│   ├── cloudflare/          # CF Pages 部署
│   └── github/              # GitHub Actions
├── mkdocs.yml
├── wrangler.toml
├── AGENTS.md                # AI Agent 操作指南
├── RAG-DESIGN.md            # RAG 方案设计
└── RAG-RETROSPECTIVE.md     # RAG 复盘文档
```

## 技术栈

- **构建**: MkDocs + Material for MkDocs
- **容器**: Docker multi-stage (Python 3.12 → nginx alpine)
- **托管**: Cloudflare Pages + GitHub Pages + Docker
- **RAG**: 客户端 IndexedDB + TF-IDF 近邻图 + Workers AI (Phase 2)
- **AI Chat**: Cloudflare Worker Proxy → MiMo API
- **测试**: Playwright (5 场景 × 3 环境)

## License

- **代码**: [MIT License](LICENSE)
- **内容**: CC BY-SA 4.0
