# skill-mcp — 把 AI 技能当软件包管理（MCP 权限网关 + 只调度不执行的 Pipeline）

## Ch07.064 skill-mcp — 把 AI 技能当软件包管理（MCP 权限网关 + 只调度不执行的 Pipeline）

> 📊 Level ⭐⭐ | 4.2KB | `entities/skill-mcp-software-package-management.md`

# skill-mcp — 把 AI 技能当软件包管理（MCP 权限网关 + 只调度不执行的 Pipeline）

> skill-mcp（GitHub: BeCrafter/skill-mcp）是一个开源项目，把 AI 技能当成有版本、有元数据、可权限控制的软件包来管理，再通过标准 MCP 协议暴露给任意 AI 客户端。定位：Cloud Skill File System & MCP Permission Gateway。

## 核心理念：技能即软件包

每个技能是一个标准目录，含 manifest.json（name/version/entry/files）、SKILL.md、references/、templates/。skills 表维护 slug、version、category、tags、status、visibility、contentHash，带完整版本历史。

## 三种部署场景

同一套代码，靠环境变量切换三种场景:

| 场景 | 通信方式 | 存储 | 适合谁 |
|------|---------|------|--------|
| A 本地独立 | stdio | 本地 | 个人开发 |
| B 混合 | stdio（本地 MCP） | 远程共享存储 | 多客户端共享 |
| C 分布式 | HTTP/SSE | 本地或远程 | 生产、多并发 |

## 五个 MCP 工具

通过 MCP 协议暴露 5 个工具：skill_list、skill_view、skill_file、skill_pipeline、skill_feedback。启动时注入"必检"系统提示词，让 AI 在回答前先扫技能列表。

## Pipeline：只调度、不执行（核心设计决策）

与传统 Workflow 引擎（LangGraph、CrewAI、Airflow、Temporal）不同，skill-mcp 的 Pipeline **只负责调度**，执行交给 AI Agent 自己。

- DAGScheduler 用 Kahn 算法做拓扑排序，切成并行批次
- 自动检测循环依赖，快速失败
- 核心代码约 300 行
- YAML 定义，表达式借鉴 GitHub Actions

## 安全设计

导入环节三道关:
1. **Prompt Injection 扫描** — 正则匹配常见注入模式
2. **路径遍历防护** — 拒绝 `..` 和绝对路径
3. **文件类型白名单** — 只放行文本格式

权限用标签交集判断：空 tags = 公开；有交集 = 受保护；无交集 = 受限。

## 与同类项目对比

| 特性 | Skill Pipeline | GitHub Actions | Airflow | Temporal |
|------|:-------------:|:--------------:|:-------:|:--------:|
| 目标用户 | AI Agent | CI/CD | 数据工程 | 分布式系统 |
| 执行者 | Agent 自己 | Runner | Worker | Worker |
| 复杂度 | 低 | 中 | 高 | 高 |

与 [Hermes Skill 系统](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system.md) 的差异：
- Hermes 的技能是文件系统级的（SKILL.md + 目录），skill-mcp 是 MCP 协议级的（通过 MCP 暴露）
- Hermes 无版本管理，skill-mcp 有完整的版本历史 + rollback
- Hermes 无内置权限控制，skill-mcp 有标签交集权限
- skill-mcp 的 Pipeline 是"只调度不执行"，Hermes 无此概念

## 技术栈

@modelcontextprotocol/sdk ^1.12.1、better-sqlite3 + drizzle-orm、commander ^13、zod ^3.24、pino、prom-client、vitest。Node.js >= 22.0.0。

## 当前状态

- 版本 0.1.0，首次正式发布 [1.0.0] - 2026-05-06
- 文档体系完整（中英双语 README、ARCHITECTURE、QUICK_START、三个 SCENARIO 等）
- CI：lint + tsc + test + coverage
- 测试覆盖 unit + integration + e2e 三层
- 主动列出未实现功能：condition、retry、执行状态持久化、Web UI

## 资源

- GitHub：https://github.com/BeCrafter/skill-mcp

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-mcp-software-package-management-mcp-pipeline.md)
→ [Hermes Skill 系统](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system.md)

---

