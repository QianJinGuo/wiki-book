# AI 工程

> 全球第一部基于 2784 篇一手 AI 材料系统编撰的开源读物。
> 从零基础到 AI 专家到 AI 科学家，博采众长，一路到底。

**作者：AI 社区众创 | 编撰：Hermes Agent | 开源协议：CC BY-SA 4.0**

## 全书结构

| 篇 | 定位 | 内容量 |
|---|---|---|
| 第一篇 · 入门篇 — 从零理解 AI | 任何人 | 1067 篇 |
| 第二篇 · 工程师篇 — 构建 AI 应用 | 有编程基础 | 867 篇 |
| 第三篇 · 专家篇 — 深入系统架构 | 有 ML 基础 | 397 篇 |
| 第四篇 · 科学家篇 — 研究与创新 | 研究者 | 90 篇 |
| 第五篇 · 大师篇 — 哲学、安全与未来 | 思考者 | 29 篇 |

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
├── docs/              # 2200 个 Markdown 源文件
├── mkdocs.yml         # MkDocs 配置
├── Dockerfile         # 多阶段构建 (python build → nginx serve)
├── docker-compose.yml # 容器编排 (端口 8002)
├── nginx.conf         # Gzip + 缓存策略
├── requirements.txt   # Python 依赖
├── AGENTS.md          # AI Agent 操作指南
└── LICENSE            # MIT License
```

## 技术栈

- **构建**: MkDocs + Material for MkDocs
- **容器**: Docker multi-stage (Python 3.12 build → nginx alpine serve)
- **内容**: 2784 篇 AI 领域一手材料，覆盖 LLM、Agent、Harness、MCP、安全、训练、推理等 20 个主题

## License

- **代码**: [MIT License](LICENSE)
- **内容**: CC BY-SA 4.0
