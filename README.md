# AI 工程

> 全球第一部基于 2926 篇一手 AI 材料系统编撰的开源读物。
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
| **总计** | **8 个活跃章节** | | **2926 篇** |

> Ch02/06/08/10/13-20 尚在编撰中。

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
- **内容**: 2926 篇 AI 领域一手材料，覆盖 LLM、Agent、Harness、MCP、安全、训练、推理等 20 个主题

## License

- **代码**: [MIT License](LICENSE)
- **内容**: CC BY-SA 4.0
