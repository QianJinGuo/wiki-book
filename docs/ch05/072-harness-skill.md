# Harness 工程之道：Skill 原理与最佳实践

## Ch05.072 Harness 工程之道：Skill 原理与最佳实践

> 📊 Level ⭐⭐ | 4.8KB | `entities/harness-skill-engineering-alibaba-practice.md`

# Harness 工程之道：Skill 原理与最佳实践

> **Background**<br>
> 本文来自阿里云开发者公众号，作者结合真实工程化项目 trade-ab-skill，系统性讲解了 Agent Skill 的结构规范、触发机制、作用域优先级以及最佳实践。Skill 格式已被 Claude Code、Cursor、GitHub Copilot、Gemini CLI 等 40+ 主流 Agent 产品采纳。

## Skill 的定义

> "Agent Skills are a lightweight, open format for extending AI agent capabilities with specialized knowledge and workflows."
> 
> Agent Skills 是一种轻量、开放的格式，用于通过专业知识和工作流扩展 AI Agent 的能力。

## 核心理念：渐进性披露（Progressive Disclosure）

Skill 体系最核心的设计理念是渐进性披露，即只在需要时才加载需要的知识，而非一次性加载全部。

### 三阶段模型

| 阶段 | 加载内容 | 成本特征 |
|------|---------|---------|
| **Discovery（发现）** | 仅加载 name 和 description | 常驻上下文，持续占用 |
| **Activation（激活）** | 读取完整 SKILL.md，加载路由表和全局规则 | 任务匹配时一次性加载 |
| **Execution（执行）** | 按路由表加载对应模块，按需读取参考文档 | 仅加载当前任务真正需要的知识 |

该模型用最小的上下文成本，换取了最大的知识覆盖范围，确保上下文窗口留给真正重要的信息。

## System Prompt 与 Skill 的区别

| 维度 | System Prompt | Skill |
|------|---------------|-------|
| **定位** | 项目级全局规则、编码规范 | 特定领域能力封装 |
| **加载策略** | 会话启动时全量加载 | 渐进式按需加载 |
| **生效范围** | 当前项目 | 可跨项目、跨会话 |
| **上下文成本** | 恒定占用，与任务无关也消耗 | 仅在命中时加载，未命中零成本 |
| **结构化** | 单文件，扁平组织 | 多文件模块化，支持脚本和资源 |
| **适用场景** | 编码风格、项目约定、通用约束 | 完整工作流、多步骤流程、领域专家知识 |

**简单记法：** System Prompt 是"这个项目的规矩"，Skill 是"一种可复用的能力"。

## 目录结构规范

```
my-skill/                      # 必需：skill名称，短横线分隔
├── SKILL.md              # 必需：主文件，包括元信息 + 指令
├── scripts/              # 可选：可执行脚本
├── references/           # 可选：参考文档
└── assets/               # 可选：模板、资源
```

**核心思想：主文件做路由，模块文件做执行。**

## SKILL.md 文件结构

### frontmatter 元信息

最核心的两个字段是 `name` 和 `description`：

```yaml
---
name: trade-ab-skill
description: 为用户提供 AB 实验的创建与修改能力，支持实验创建、调流量、加桶删桶、实验下线等操作。当用户提到创建实验、修改实验、调流量、加桶删桶、实验下线等场景时触发。
---
```

### 其他关键字段

| 字段 | 类型 | 用途 |
|------|------|------|
| `argument-hint` | 可选 | 参数提示格式，如 `[source directory] [output format]` |
| `disable-model-invocation` | 布尔 | 禁止模型自动调用该 Skill |
| `user-invocable` | 布尔 | 用户是否可以直接调用 |
| `allowed-tools` | 列表 | 工具白名单，如 `Read, Grep, Glob, Write, Bash(python:*)` |
| `model` | 字符串 | 指定使用的模型（如 `haiku`、`sonnet`） |
| `context` | 字符串 | 执行上下文，设为 `fork` 时在隔离子智能体中执行 |
| `hooks` | 对象 | 生命周期事件钩子（`PreToolUse`, `PostToolUse` 等） |

## 与现有实体的关系

- 补充 [50 Ai Agent Skills For Designers And Pms](https://github.com/QianJinGuo/wiki/blob/main/entities/50-ai-agent-skills-for-designers-and-pms.md) 的工程实践角度

---

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-skill-engineering-alibaba-practice.md)

---

