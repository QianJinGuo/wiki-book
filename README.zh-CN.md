# 《AI 工程》 · AI Engineering

<p align="center">
  <a href="README.md">English</a> · 简体中文
</p>

<p align="center">
  <a href="https://jinguo.tech">
    <img src="docs/assets/images/ai-engineering-cover.png" alt="《AI 工程》：从 LLM 原理到生产级 Agent" width="820">
  </a>
</p>

<p align="center">
  <strong>从 LLM 原理到生产级 Agent</strong><br>
  An open-source guide to building reliable AI systems — curated from thousands of first-hand sources and updated daily.
</p>

<p align="center">
  <a href="https://jinguo.tech">在线阅读</a> ·
  <a href="docs/assets/images/ai-engineering-cover-1600x2400.png">竖版出版稿</a> ·
  <a href="docs/PATH.md">学习路径</a> ·
  <a href="CONTRIBUTING.md">参与贡献</a>
</p>

<p align="center">
  <a href="https://jinguo.tech"><img src="https://img.shields.io/badge/在线阅读-jinguo.tech-2563eb" alt="在线阅读"></a>
  <a href="https://github.com/QianJinGuo/wiki-book/stargazers"><img src="https://img.shields.io/github/stars/QianJinGuo/wiki-book?style=social" alt="GitHub stars"></a>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh"><img src="https://img.shields.io/badge/内容协议-CC_BY--SA_4.0-lightgrey" alt="内容协议 CC BY-SA 4.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/代码协议-MIT-16a34a" alt="代码协议 MIT"></a>
  <a href="https://squidfunk.github.io/mkdocs-material/"><img src="https://img.shields.io/badge/MkDocs-Material-526cfe" alt="MkDocs Material"></a>
</p>

> 这不是一份 API 速查表，而是一条从模型心智模型、Agent 控制循环到生产交付的 AI 工程学习路径。

## 项目概览

《AI 工程》是一部持续演进的开源电子书，面向希望真正理解、构建和交付 AI 系统的工程师与研究者：从 LLM 心智模型到 Agent 控制循环，再到 Harness、Tool、Skill、MCP、Memory 与 Multi-Agent，直至 RAG、评估、Tracing、安全治理和生产部署。内容由 AI 社区众创与 Hermes Agent 协作编撰，每个条目尽量保留一手来源、上下文和学习难度。

| 1,898 | 20 章 · 5 篇 | 3,991 | v1.3.8 |
|:---:|:---:|:---:|:---:|
| 精选编撰条目 | 全书结构 | 公开来源卡片 | 当前版本 |

## 你将学到什么

- 建立 LLM、Transformer、训练与推理的可操作心智模型。
- 从最小 Agent Loop 逐步扩展到 Harness、Tool、Skill、MCP、Memory 与 Multi-Agent。
- 设计 RAG、评估、Tracing、安全治理和部署体系，让 AI 应用能够稳定进入生产环境。
- 沿着从入门到大师的五篇路径学习，也可以按章节或主题独立阅读。

## 全书路径

| 篇 | 核心问题 | 章节范围 | 适合读者 |
|:---|:---|:---|:---|
| **01 · 入门篇** | 从零理解 AI | Ch01 AI 与 LLM 基础 · Ch02 提示词与上下文工程 · Ch03 AI 工具与产品全景 | 所有人 |
| **02 · 工程师篇** | 构建 AI 应用 | Ch04 Agent · Ch05 Harness · Ch06 Memory · Ch07 Tool / Skill / MCP · Ch08 Multi-Agent · Ch09 AI Coding · Ch10 RAG | 有编程基础 |
| **03 · 专家篇** | 深入系统架构 | Ch11 云基础设施与部署 · Ch12 安全与治理 · Ch13 MLOps 与评估 · Ch14 数据工程 | 有 ML 基础 |
| **04 · 科学家篇** | 研究与创新 | Ch15 训练与微调 · Ch16 推理优化与架构 · Ch17 多模态与生成 · Ch18 机器人与具身智能 | 研究者 |
| **05 · 大师篇** | 哲学、安全与未来 | Ch19 前沿研究与理论 · Ch20 AI 哲学、安全与未来 | 思考者 |

## 核心能力

| 能力 | 说明 |
|:---|:---|
| **可追溯内容** | 条目保留一手原文线索，并标注难度和学习位置，方便从概念回到证据。 |
| **多层检索** | 浏览器本地索引优先，结合 BM25、语义搜索、近邻图和 Pages Function 兜底。 |
| **AI Chat** | 先检索再对话，把站内知识作为上下文，并在 Cloudflare 环境提供 RAG 能力。 |
| **质量闭环** | 每日同步、评分门禁、出口精选、索引重建和回归验证形成持续维护链路。 |

## 出版封面

封面以“可被工程化的知识系统”为视觉主线：右侧的模块、连接与锚点组成一条向上的知识路径，象征从 LLM 原理到生产级 Agent 的逐层深入。

点击顶部封面可查看 **1600×2400 竖版出版稿**。横版稿用于网站首页、社交媒体和分享卡片；正式印刷前仍需由出版社确认作者署名、ISBN、条码、版权页、出血线和 CMYK 文件等出版规范。

![《AI 工程》网站首页](docs/assets/images/screenshot-home.png)

## 快速开始

### 直接阅读

打开 [jinguo.tech](https://jinguo.tech) 即可在线阅读，也可以访问 [GitHub Pages 镜像](https://wiki.jinguo.tech) 浏览纯静态版本。

### 本地构建与 Docker

```bash
git clone https://github.com/QianJinGuo/wiki-book.git
cd wiki-book

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 课程 / 仪表盘 → MkDocs → slim 搜索索引 → 对齐近邻图
PYTHON=.venv/bin/python bash scripts/build.sh
docker compose up -d --build

# http://localhost:8002
```

`scripts/build.sh` 是唯一推荐的构建入口。不要绕过它直接部署未裁剪的搜索索引：搜索索引裁剪和近邻图生成必须保持同一顺序与数据源。

### RAG 回归

```bash
node test-rag.mjs
```

该命令默认只检查本地 Docker；生产和 GitHub Pages 需要显式指定目标，避免把回归测试误当成线上压力测试：

```bash
node test-rag.mjs                                      # 本地 Docker
RAG_TEST_TARGET=production ALLOW_PRODUCTION_TEST=1 node test-rag.mjs
RAG_TEST_TARGET=github node test-rag.mjs
```

`npm test` 运行本地鉴权回归测试。

## 三环境部署

| 环境 | 地址 | 定位 |
|:---|:---|:---|
| **Cloudflare Pages** | [jinguo.tech](https://jinguo.tech) | 生产环境：Pages Functions + R2 + Vectorize |
| **GitHub Pages** | [wiki.jinguo.tech](https://wiki.jinguo.tech) | 纯静态镜像：GitHub Actions |
| **Docker** | `http://localhost:8002` | 本地开发与预览 |

```bash
# 构建完成后发布 Cloudflare Pages
./deploy/cloudflare/deploy.sh

# 本地启动 Docker
docker compose up -d --build
```

### Cloudflare 密钥

`wrangler.toml` 只保存 Pages、R2、Vectorize 和 D1 的资源标识，不应放入 API key、token 或私钥。生产密钥通过 Cloudflare Pages Secrets 配置（例如 `SITE_TOKEN`、`XUNFEI_API_KEY` 和 `USER_DATA_SECRET`）；本地构建 Vectorize 时用环境变量提供最小权限的 `CLOUDFLARE_API_TOKEN` 和 `XUNFEI_API_KEY`，不要写入仓库文件：

```bash
npx wrangler pages secret put SITE_TOKEN --project-name ai-engineering
npx wrangler pages secret put XUNFEI_API_KEY --project-name ai-engineering
npx wrangler pages secret put USER_DATA_SECRET --project-name ai-engineering
```

`USER_DATA_SECRET` 用于签发学习进度同步身份；丢失同步密钥会导致客户端无法恢复该身份，轮换该服务端密钥会使已有同步密钥失效。详见 [Cloudflare Secrets 文档](https://developers.cloudflare.com/workers/configuration/secrets/)。

## 项目结构

```text
docs/ch01–ch20/                 书籍章节与可发布条目
docs/raw/articles/              第三方来源卡片（不保存原文正文）
scripts/build.sh                课程、索引、MkDocs 和近邻图的统一构建入口
functions/                      Cloudflare Pages Functions 与 RAG 端点
overrides/                      MkDocs 主题覆盖、AI Chat 与封面集成
cover/                          封面 SVG、渲染脚本和可编辑素材
```

## 公开范围与维护边界

- `docs/raw/` 会被 MkDocs 排除，不生成站点页面；公开仓库只保留第三方来源卡片，不保存全文。完整原文若有本地使用需求，必须放在仓库外的私有源中。
- `meta/` 和根目录 `AGENTS.md` 是维护者本地资料，不属于公开仓库；公开的设计说明和贡献流程应放在经过脱敏的文档中。
- `site/` 与 `cover/exports/` 属于生成物；封面 SVG、渲染脚本、主题覆盖和源素材才是主要编辑入口。

## 参与贡献

欢迎通过以下方式参与：

- 提交高质量 AI 工程文章，参阅 [贡献指南](CONTRIBUTING.md)。
- 报告内容、链接、索引或部署问题。
- 改进 RAG 检索、评估体系和构建流程。
- 分享项目，帮助更多人建立 AI 工程能力。

## 许可

| 内容 | 协议 |
|:---|:---|
| 构建脚本、RAG 前后端与工程代码 | [MIT](LICENSE) |
| 书籍原创章节与项目文档（不含 `docs/raw/`） | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) |
| `docs/raw/articles/` 来源卡片 | 不对第三方正文提供再发布许可；卡片中的来源 URL、作者和许可证字段以原始来源为准 |

---

<p align="center">
  <sub>持续更新 · 开源协作 · AI 工程实践</sub><br>
  <sub>v1.3.8 · 2026-09-05 · 维护者：Hermes Agent</sub>
</p>
