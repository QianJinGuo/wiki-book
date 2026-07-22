---
title: "我终于搞明白了：Claude Code 为什么会忽略指令了"
source: wechat
source_url: https://mp.weixin.qq.com/s/BdgTk8MfucPNRjlr0y_mVQ
author: 架构师
feed_name: 架构师（JiaGouX）
review_value: 8
review_confidence: 7
review_recommendation: worth-reading
review_stars: 4
date: 2026-06-28
created: 2026-06-29
updated: 2026-06-29
tags: [claude-code, claude-md, agent-harness, context-engineering, prompt-engineering, instruction-following]
type: article
provenance_state: extracted
sha256: 5d6e651debf02674b472eda23894512796090b9a8c87e20fe8a7a3a5a00d70ff
---

# 我终于搞明白了：Claude Code 为什么会忽略指令了

## 核心问题

用 Claude Code 久了，很容易养成一个习惯：它哪里做错了，就往 `CLAUDE.md` 里补一句。刚开始很灵，但文件越写越长以后，有些指令明明还在，Claude Code 还是会忽略。很多指令失效，是因为我们把太多不同性质的东西，都塞进了同一个入口文件。

## CLAUDE.md 只适合做入口

`CLAUDE.md` 像一张"进仓库前的工作卡"。它应该告诉 Claude Code：项目做什么不做什么、最容易猜错的技术栈和目录边界、常用命令、什么证据才算完成、哪些地方过去反复出过问题。

**具体规则（有效）**：
- API handlers validate input and shape responses only.
- Services own business orchestration and transactions.
- External HTTP and LLM calls must stay outside DB transactions.

**太空的规则（无效）**：
- Write clean code / Follow best practices / Be careful with security

Anthropic 官方建议 `CLAUDE.md` 控制在 200 行以内。不要把它写成项目知识库——知识库放 docs 里，入口文件只放最容易误判的东西。

## 指令被忽略的四个原因

1. **规则没加载**：子目录 `CLAUDE.md` 或带路径的 rules 只有读到对应目录时才进上下文。用 `/memory`、`/context` 查加载状态。
2. **规则太太空**："注意安全""保持简洁"像会议提醒，不是执行规则。Agent 需要可执行的边界。
3. **被当前任务盖住**：长任务里上下文越来越厚，最近的信息更容易影响下一步——"刚开会话很听规则，跑久了就飘"。
4. **不该交给模型记**：`Never modify .env`、`Never deploy without approval` 这类高风险规则应交给权限、Hook、CI，不能只靠自然语言。

## 规则五层框架

| 层级 | 性质 | 位置 | 举例 |
|------|------|------|------|
| 入口卡 | 给模型看 | `CLAUDE.md` | 项目定位、技术栈、目录边界 |
| 执行规则 | 给模型看 | 子目录 `CLAUDE.md` / `.claude/rules/` | API 校验规则、测试命令 |
| 工作流脚本 | 给流程调用 | Skills | 发布流程、review checklist |
| 系统边界 | 给系统执行 | Hooks / permissions | 禁止修改 .env、危险命令拦截 |
| CI/基建 | 给基础设施 | CI / 脚本 / 仓库保护 | 测试门禁、部署审批 |

**核心分流**：先看规则的性质，再决定机制。放错层 = Claude Code 忽略指令。

## 局部规则别放全局

`CLAUDE.md` 变胖往往从局部规则开始。API handler 必须做输入校验、migration 文件必须写回滚说明——这些不该让每个任务加载。更合适的位置是子目录 `CLAUDE.md` 或 `.claude/rules/`，用路径触发。

## 流程应该离开入口文件

发布流程（检查分支→跑测试→打包→部署→smoke→记录证据→写 changelog）不是一条规则，是一套过程。放在入口文件的问题：不发布时也加载、步骤越补越长、没人知道哪步还有效。更适合做成 Skill，`CLAUDE.md` 里只留路由：`For release work, use the release-check skill.`

## Subagent 是上下文卫生工具

Subagent 不只是"多找一个助手"，更像一块临时白板。全仓搜索、日志分析、依赖对比等产生大量中间材料的工作，交给 Subagent 做完后只把结论带回来。主会话保留决策线，不被探索过程拖住。

## 高风险规则要有硬边界

看到 `always`、`never`、`must`、`forbidden`、`production`、`secret`、`deploy`、`payment`、`delete` 这些词要多停一下。如果关系到事故成本，不要只留在自然语言里：
- 密钥和生产配置 → 权限规则或仓库保护
- 危险命令 → PreToolUse Hook 或 deny rule
- 格式化/测试/发布前 smoke → Hook、CI、脚本

**一句话：能让系统兜住的，就不要只写成自然语言。**

## 参考资料
- Anthropic：Steering Claude Code: CLAUDE.md files, skills, hooks, rules, subagents and more
- Claude Code Docs：How Claude remembers your project / Extend Claude with skills / Create custom subagents / Hooks reference / Configure permissions
