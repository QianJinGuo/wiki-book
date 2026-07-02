# Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架

## Ch09.116 Claude Code 为什么会忽略指令：四类失效原因 + 五层规则框架

> 📊 Level ⭐⭐ | 4.7KB | `entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md`

## 核心概述

当 `CLAUDE.md` 越写越长后，Claude Code 会开始忽略某些指令。根本原因不是模型不行，而是我们把太多不同性质的规则塞进了同一个入口文件。本文提出四类失效原因和五层规则框架，将模糊的"没听话"问题拆解为可诊断、可工程化的系统设计问题。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-why-instructions-ignored-jia-gou-x-2026.md)

## 指令失效的四类原因

1. **规则没加载到上下文**：子目录 `CLAUDE.md` 或 `.claude/rules/` 只有在读到对应目录时才进上下文。任务刚开始、新建文件、压缩后继续写都可能出现"规则还没进来"的情况。诊断方法：`/memory`、`/context` 查加载状态。

2. **规则太空**："注意安全""保持简洁""写高质量代码"像会议提醒，不像 Agent 的执行规则。Agent 需要可执行的边界：什么输入必须校验、哪些调用不能放在事务里、哪类文件不能改。

3. **被当前任务上下文盖住**：长任务里 Claude Code 不断读文件、跑命令、看报错，上下文越来越厚，最近的信息更容易影响下一步动作。体感："刚开会话时很听规则，跑久了就开始飘"。

4. **不该交给模型记**：`Never modify .env`、`Never deploy without approval` 这类高风险规则漏掉后代价不是"再提醒一次"能解决的。应交给权限、Hook、CI、脚本或仓库保护——**软提醒和硬边界要分开**。

## 五层规则框架

| 层级 | 性质 | 位置 | 举例 |
|------|------|------|------|
| **入口卡** | 给模型看 | `CLAUDE.md` | 项目定位、技术栈、目录边界、完成证据、高频错误假设 |
| **执行规则** | 给模型看 | 子目录 `CLAUDE.md` / `.claude/rules/` | API 校验规则、特定目录测试命令 |
| **工作流脚本** | 给流程调用 | Skills | 发布流程、review checklist、迁移步骤 |
| **系统边界** | 给系统执行 | Hooks / permissions | 禁止修改 `.env`、危险命令拦截 |
| **CI/基建** | 给基础设施 | CI / 脚本 / 仓库保护 | 测试门禁、部署审批、格式化检查 |

**核心分流**：先看规则的性质（给谁看？），再决定机制（放哪里？）。放错层 = Claude Code 忽略指令。

## CLAUDE.md 的定位：入口卡而非总控台

`CLAUDE.md` 像一张"进仓库前的工作卡"——只放最容易误判、最常影响结果的东西。Anthropic 官方建议控制在 200 行以内。不建议写成项目知识库（知识库放 docs 里，让 Claude Code 需要时自己读）。

## 实操：变胖的 CLAUDE.md 怎么收

| 规则性质 | 去向 |
|----------|------|
| 每次会话都该知道 | 留在 `CLAUDE.md` |
| 只对某些目录/文件类型生效 | 子目录 `CLAUDE.md` 或 `.claude/rules/`（路径触发） |
| 超过 5 步的流程 | Skill |
| 产生大量中间材料的工作 | Subagent |
| `always/never/must/forbidden/production/secret/deploy` | Hooks / permissions / CI |

## Subagent 作为上下文卫生工具

Subagent 的核心价值不是"多一个助手"，而是**上下文隔离**。全仓搜索、日志分析、依赖对比等探索性工作交给 Subagent，主会话只拿摘要、证据和结论，保持决策线清晰。

## 关联

- [CLAUDE.md 12 条规则](ch01/380-claude.md) — 本文解决"写什么规则"，本文解决"规则放哪里"
- [Claude Code 大型代码库 Harness 配置](ch03/074-claude-code.md) — CLAUDE.md 作为 Harness 五扩展点之一
- [Claude Code 七种自定义方法](ch03/074-claude-code.md) — Anthropic 官方全景指南
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 规则分层是 Harness 工程的核心设计决策

---

