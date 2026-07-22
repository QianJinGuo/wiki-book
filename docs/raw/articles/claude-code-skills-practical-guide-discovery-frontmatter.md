---
title: "Claude Code Skills 实战指南：发现机制、SKILL.md 编写与安全限制"
source_url: "https://mp.weixin.qq.com/s/EChuGeLSUlZdPI0GrapqVg"
author: "小 G (JavaGuide)"
feed_name: "微信公众号"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [claude-code, skills, skilmd, frontmatter, agent-framework, prompt-engineering, context-engineering]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: ad2d3e844316b7a0988df470ddb608bccadf7f793fa9897c537d332bc0f035d0
---

# Claude Code Skills 实战指南：发现机制、SKILL.md 编写与安全限制

小 G (JavaGuide) 对 Claude Code Skills 的深度技术解析。涵盖 Skills 与 CLAUDE.md、Subagent、Plugin 的分工、SKILL.md 编写、发现机制、执行流程和安全限制。

## Skills 解决的问题

| 机制 | 主要解决的问题 |
|---|---|
| CLAUDE.md | 常驻项目规则和长期约定 |
| Skill | 只有特定任务才会用到的流程和清单 |
| Subagent | 把长任务或支线任务委派给另一个 Agent |
| Plugin | 分发 Skills、Agents、Hooks、MCP 等扩展能力 |

CLAUDE.md 适合每轮都要用的项目事实；Skill 适合有明确触发场景的流程。Subagent 解决"谁来做"，Skill 解决"怎么做"。

## SKILL.md 结构

目录格式：.claude/skills/skill-name/SKILL.md

### 常见 frontmatter 字段

| 字段 | 作用 |
|---|---|
| name | 展示名；目录名通常决定命令名 |
| description | 给模型判断何时使用 |
| when_to_use | 更细的触发说明 |
| allowed-tools | 预批准该 Skill 可用的工具 |
| model | 指定模型别名 |
| effort | 指定推理/努力等级 |
| user-invocable | 是否允许用户通过 /skill-name 直接调用 |
| disable-model-invocation | 禁止模型自动调用 |
| paths | 条件触发路径 |
| context | 支持 fork，让 Skill 在子代理上下文中运行 |
| agent | 绑定指定 Agent |

## Claude Code 如何发现 Skills

| 类型 | 来源 | 说明 |
|---|---|---|
| 用户级 Skills | ~/.claude/skills/ | 个人长期复用 |
| 项目级 Skills | .claude/skills/ | 项目或团队共享 |
| Managed Skills | 管理策略目录 | 组织统一下发 |
| Bundled Skills | Claude Code 内置 | /code-review, /debug, /loop 等 |
| Plugin Skills | 插件提供 | 跟随 plugin 安装和启用 |
| MCP Skills | MCP Server 映射能力 | 来自 MCP Server |

嵌套 .claude/skills 目录：名称冲突时以 <dir>:<name> 形式出现。

旧版 .claude/commands/ 仍兼容。新写能力建议直接用 .claude/skills/<name>/SKILL.md。

## Skill 执行流程

Skill 被调用后的处理链：
1. 展开参数（$ARGUMENTS, $0, $1...）
2. 替换 ${CLAUDE_SKILL_DIR}
3. 替换 ${CLAUDE_SESSION_ID}
4. 非 MCP 来源时执行内嵌 shell 命令（动态上下文）
5. 返回最终 prompt 给模型

Skill 平时只暴露 name/description/when_to_use 的 token 估算值，完整内容只在调用时加载。

### 动态上下文

支持语法：`!`git status --short`` 或 ```! git log --oneline -5 ```。命令在预处理阶段执行，输出替换占位符后再给模型。

**MCP 来源的 Skill 不执行内嵌 shell** — 防止远程代码执行风险。

## 安全限制

- allowed-tools 收窄当前 Skill 的工具范围
- MCP Skill 跳过内嵌 shell 执行
- strictPluginOnlyCustomization 可锁定来源（仅加载 plugin & managed settings）

## Skills 与 Agent 配合

context: fork 适合三类场景：
1. Skill 过程很长
2. Skill 需要读很多文件或外部信息
3. 主会话只关心结果

Agent Teams 中每个 teammate 自动加载 CLAUDE.md、MCP servers 和 Skills — 有额外启动开销。
