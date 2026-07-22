---
title: "skill-mcp：把 AI 技能当软件包管理 — 版本化、MCP 权限网关、只调度不执行的 Pipeline"
source_url: "https://mp.weixin.qq.com/s/a1Ss_jUxlLpCFduQF35vuA"
ingested: 2026-06-30
sha256: cb145383d51274bb7e3e4a8bcdfe767a3c26ad57ac48997ef97246abfac007f0
type: raw
tags: [skill-mcp, mcp, skill-management, versioning, dag-pipeline, security, prompt-injection, permission-gateway, ai-agent, shugex]
author: 术哥无界 | ShugeX
---

skill-mcp 是一个开源项目（GitHub: BeCrafter/skill-mcp），把 AI 技能当成有版本、有元数据、可权限控制的软件包来管理，再通过标准 MCP 协议暴露给任意 AI 客户端。

## 核心理念：技能即软件包

一个技能就是一个标准目录：

```
my-skill/
├── manifest.json     # 包元数据（name、version、entry）
├── SKILL.md          # 主入口内容
├── references/       # 支撑参考文件
└── templates/        # 模板文件
```

manifest.json：
```json
{
  "name": "my-skill",
  "version": "0.0.1",
  "entry": "SKILL.md",
  "files": ["references/examples.md"]
}
```

背后的 skills 表维护 slug、version、category、tags、status、visibility、contentHash，带完整版本历史。版本管理 CLI：

```
skill-mcp versions <slug>            # 查看版本历史
skill-mcp rollback <slug> --to 0.0.1 # 回滚到指定版本
```

## 三种部署场景

同一套代码，靠环境变量切换：

| 场景 | 通信方式 | 存储 | 适合谁 |
|------|---------|------|--------|
| A 本地独立 | stdio | 本地 | 个人开发、单用户 |
| B 混合 | stdio（本地 MCP） | 远程共享存储 | 多个本地客户端共享技能库 |
| C 分布式 | HTTP/SSE | 本地或远程 | 生产、多并发、容器化 |

默认数据目录：`~/.skill-mcp/`（data/skills/、skill-mcp.db、cache/）

## 五个 MCP 工具

通过 MCP 协议暴露给 AI 客户端：

| 工具 | 作用 |
|------|------|
| skill_list | 列出所有已发布技能，支持按 tag 过滤 |
| skill_view | 看某个技能的完整入口内容（SKILL.md） |
| skill_file | 批量读取技能包里任意文件 |
| skill_pipeline | 执行 DAG 流程编排 |
| skill_feedback | 提交技能使用效果反馈 |

启动时注入"必检"系统提示词，告诉 AI 在回答前先扫技能列表。

## Pipeline：只调度、不执行

这是最核心的设计决策。传统 Workflow 引擎（LangGraph、CrewAI、Airflow、Temporal）既调度又执行；skill-mcp 的 Pipeline **只负责调度**，执行交给 AI Agent 自己。

DAGScheduler 用 Kahn 算法做拓扑排序，切成并行批次，自动检测循环依赖，快速失败：

```
Batch 1: [read-pr]                    → 串行
Batch 2: [security-scan, style-check] → 并行
Batch 3: [generate-report]            → 等 Batch 2
```

YAML 定义，表达式借鉴 GitHub Actions：
```yaml
stages:
  security-scan:
    skill: security-scanner
    depends_on: [read-pr]
    inputs:
      code: ${{ stages.read-pr.outputs.diff }}
```

核心代码约 300 行。

## 安全设计

导入环节三道关：
1. **Prompt Injection 扫描** — 正则匹配常见注入模式（ignore previous instructions 等）
2. **路径遍历防护** — 拒绝含 `..` 和绝对路径的文件路径
3. **文件类型白名单** — 只放行文本类格式（md、txt、json、yaml、ts、py 等）

权限用标签交集判断：技能 tags 为空则公开；技能和用户 tags 有交集则受保护；交集为空则受限。

## 工程质量

- 文档体系完整：README 中英双语、ARCHITECTURE、QUICK_START、三个 SCENARIO、API_REFERENCE、ADVANCED、TESTING_GUIDE、PUBLISHING、DEVELOPMENT、ORGANIZATION
- CI：lint + tsc + test + coverage
- 测试覆盖 unit + integration + e2e 三层
- 技术栈：@modelcontextprotocol/sdk ^1.12.1、better-sqlite3 + drizzle-orm、commander ^13、zod ^3.24、pino、prom-client、vitest
- Node.js >= 22.0.0

## 诚实细节

文档主动列出未实现的功能：condition（条件执行）和 retry 字段已预留但未实现；执行状态只在内存里没持久化；CLI 只有 ASCII 图，没有 Web UI。

当前版本 0.1.0，首次正式发布 [1.0.0] - 2026-05-06，非常年轻。

## 核心判断

> 它不是要替代 LangGraph、CrewAI 那些重量级编排框架，定位更偏技能管理 + 轻量调度。

几个有意思的设计取舍：
1. 技能应该像软件包一样有版本、有权限、能回滚
2. 编排引擎只做调度，执行交给 Agent
3. 安全要在导入环节就把关
4. 同一套代码要能从本地长到生产
