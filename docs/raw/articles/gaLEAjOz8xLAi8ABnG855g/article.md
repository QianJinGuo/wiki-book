# Harness 工程：第 6 课：Skill 系统

> 原创 · 数字理想 · AI数字理想 · 2026年7月6日 16:58 · 内蒙古

> 把知识打包成可复用单元：让主 Agent 在对的时候自动加载对的指令

⏱ 13 分钟 · 📚 入门 · 🎯 概念 + 实操配置

---

## 第 5 课遗留的问题

上一课讲完 Subagent，我意识到一个明显的不对称：

> "我每次让 Claude Code 帮我写 PR summary，都要重新告诉它'读 git diff、列风险点、别超过 5 行'。如果有个机制能把这种重复指令存起来、需要时自动加载，就好了。"

这就是 **Skill** 解决的问题。Skill 不是"工具"，是"知识的打包"——Harness 给模型提供的**可复用指令单元**。

> 💡 提示 — 现在你就在用 Skill：你点 /teach 让我教你 Agent Harness Engineering 时，加载的就是一个 Skill（teach skill）。它定义了教学流程、文件组织、术语规范——让任何 Claude Code 实例都能用同一套方式教你。

## Skill 是什么？

Skill 是**一个目录 + 一个 `SKILL.md` 文件**，目录里可以放模板、示例、脚本。`SKILL.md` 由两部分组成：

- **YAML frontmatter**（`---` 包裹）：元数据，决定**谁、在什么时候、怎么调**
- **Markdown body**：实际给模型看的指令或知识

```
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
  └── helper.py (utility script - executed, not loaded)
```

### 最小 Skill 示例：diff 总结

```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---
```

```markdown
## Current changes

!git diff HEAD

## Instructions

Summarize the changes above in two or three bullet points, then list any risks you notice such as missing error handling, hardcoded values, or tests that need updating. If the diff is empty, say there are no uncommitted changes.
```

> **关键金句**：Skill 是"塞进主上下文的指令包"，Subagent 是"派出去干活的员工"。Skill 加在主 Agent 身上，Subagent 独立运行。前者解决"知识复用"，后者解决"上下文隔离"——两者维度不同。

---

## 主题 1：两种 Skill 类型 —— Reference vs Action

Anthropic 官方把 Skill 分为两类，用途完全不同：

| 类型 | 用途 | 典型例子 | 加载时机 |
|------|------|----------|----------|
| Reference Skill（参考型） | 提供贯穿整个 session 的知识 | API 风格指南、内部术语表、合规要求 | Session 开始就加载，主 Agent 随时可参考 |
| Action Skill（动作型） | 执行特定一次性任务 | 部署、PR 总结、代码审查 | 触发时加载，任务完成后影响结束 |

> **判断标准**：你的指令是"模型在做任何事时都应该记住 X"（reference）还是"用户明确说 Y 时才执行"（action）？前者写 description 让模型随时调用，后者用 `disable-model-invocation: true` 锁死只能用户主动触发。

---

## 主题 2：动态上下文注入 —— `!` 反引号语法

Skill 的 body 里支持一种特殊语法：

```
!shell-command
```

Harness 在把 Skill 内容发给模型**之前**，会执行这个 shell 命令、用输出替换这一行。这是让 Skill 拿到"实时数据"的关键机制。

### 实战：PR summary Skill

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---
```

```markdown
## Pull request context
- PR diff: !gh pr diff
- PR comments: !gh pr view --comments
- Changed files: !gh pr diff --name-only

## Your task
Summarize this pull request...
```

当用户调用 `/pr-summary` 时，Harness：
1. 执行 `gh pr diff`、`gh pr view --comments`、`gh pr diff --name-only`
2. 把三个命令的输出拼进 body 的对应位置
3. 然后才把整段内容（带输出）发给模型

> **关键金句**：`!` 反引号 = 预处理阶段的"模板渲染"。它跟普通 shell 调用不同——命令在发给模型前已经跑完，模型看到的是"已经塞好数据的指令"，不需要再调 Bash 自己取数据。这把"取数"和"思考"两步解耦。

---

## 主题 3：frontmatter 字段全解

| 字段 | 作用 | 典型值 |
|------|------|--------|
| description | Skill 用途描述 | "Reviews code for SQL injection and XSS" |
| name | Skill 名字（缺省用目录名） | "code-reviewer" |
| disable-model-invocation | 禁用模型自动调用 | true / false（默认） |
| user-invocable | 禁用用户手动调用 | true（默认）/ false |
| context: fork | 在独立 subagent context 里跑 | fork / 不写（默认主 context） |
| agent | 配合 context: fork 用，指定 subagent 类型 | Explore / Plan / general-purpose 或自定义 |
| allowed-tools | Skill 执行时允许的工具 | Bash(gh *) |
| argument-hint | 斜杠命令的参数提示 | — |

### 三组关键开关

**① 调用控制：谁可以触发这个 Skill**

| 配置 | 用户能调 | 模型能调 | description 是否在 context |
|------|----------|----------|---------------------------|
| 默认 | ✅ | ✅ | ✅ 始终在 |
| `disable-model-invocation: true` | ✅ | ❌ | ❌ 不在 |
| `user-invocable: false` | ❌ | ✅ | ✅ 始终在 |

> ⚠️ 重要设计权衡：`disable-model-invocation: true` 的副作用是 description 不进 context——这能省 token，但模型也不知道这个 Skill 存在。适合"用户偶尔触发的危险操作"（部署、删除）；不适合"模型该用却不知道"的实用工具。

**② 执行上下文：在主对话还是独立 subagent 里跑**

默认 Skill 的内容塞进主 Agent 上下文。但如果加 `context: fork`：
- Skill 的内容成为 subagent 的完整任务
- 整个 Skill 在独立 context window 里执行
- 主 Agent 上下文只多 1 条结果（跟 Subagent 一样）

```yaml
---
description: Research a topic thoroughly
context: fork
agent: Explore
---
Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

这个 deep-research Skill 实际上是**"包成 Skill 样子的 Subagent 调用"**。它会启动一个 Explore subagent，把 `$ARGUMENTS` 作为任务派出去。Skill 是"提示模板"，Subagent 是"执行单元"——可以组合。

**③ 工具白名单：Skill 执行时能用什么**

```yaml
---
allowed-tools: Bash(gh *)
---
```

限制 Skill 只能用特定工具——既安全（防止 Skill 越权调 Edit）又可控（PR summary skill 不需要 Write）。

---

## 主题 4：`$ARGUMENTS` 占位符

当用户调用 `/commit "fix login bug"` 时，"fix login bug" 就是 arguments。Skill body 里写 `$ARGUMENTS` 会被替换：

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---
Deploy $ARGUMENTS to production:
1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

用户执行 `/deploy auth-service v2.3` 后，Harness 把 body 里的 `$ARGUMENTS` 替换成 `auth-service v2.3`，再发给模型。

---

## 主题 5：Skill 的加载时机

关键问题：Skill 什么时候塞进模型上下文？

- **Reference Skill（默认）**：description 始终在主上下文（作为 metadata）。完整 body 在调用时才加载——但模型看到 description 后能"知道有这个东西"。
- **`disable-model-invocation: true`**：description **不进** context，模型不知道。只能用户用 `/skill-name` 触发。

Anthropic 官方原话：
> "Claude only sees skill descriptions at the start, with full content loading only when a skill is used. For manually invoked skills, setting 'disable-model-invocation: true' prevents descriptions from loading into context until needed."

这是个聪明的设计——用 description 的"轻量常驻"换主 Agent 知道有哪些 Skill 可用，用 body 的"按需加载"换 token 不浪费。

> **关键金句**：description 是"Skill 的菜单"，body 是"Skill 的菜"。菜单常驻让你知道能点什么；菜按需上桌避免一次吃撑。

---

## 主题 6：Skill 目录的常见结构

Skill 不只是 `SKILL.md` 一个文件。常见目录布局：

```
code-reviewer/
├── SKILL.md          # 主入口（必填）
├── reference.md      # 详细 API 文档（按需加载）
├── examples/
│   └── sample.md     # 示例输出格式
├── scripts/
│   └── validate.sh   # 可执行脚本（不加载到 context，模型用 Bash 调用）
└── templates/
    └── report.md     # 输出模板
```

设计原则：`SKILL.md` 是"导航页"——告诉模型"我有什么、什么时候用我、各部分在哪"。`reference.md` / `examples.md` 是"细节页"——`SKILL.md` 里写"参考 reference.md"，模型按需读。`scripts/` 是"工具页"——`validate.sh` 不进 context，但模型可以 `!scripts/validate.sh` 调它。

> **为什么不全塞 SKILL.md？** 因为 token 贵。SKILL.md 短 → 主 context 始终能容纳；reference 长 → 按需加载才不浪费。Harness 鼓励的"渐进披露"（progressive disclosure）模式。

---

## 动手：写你的第一个 Skill

实操：写一个"提交前自检" Skill——用户执行 `/precommit` 时，自动跑 `git diff --staged`、检查代码规范、输出检查报告。

**步骤 1：创建 Skill 目录**
```bash
mkdir -p ~/.claude/skills/precommit
```

**步骤 2：创建 SKILL.md**
```yaml
---
description: Pre-commit self-check. Reviews staged git changes for code quality, security, and test coverage. Use when the user is about to commit or asks for a pre-commit review.
allowed-tools: Bash(git *)
---
```

**步骤 3：实际调用** — 在任意 git 仓库里 stage 一些改动，然后输入 `/precommit`。Harness 执行 `!` 命令、把输出塞进 body 模板、发给模型。

**步骤 4（bonus）**：加 `disable-model-invocation: true` 防止模型自动调用。

---

## 小测：Skill 系统

**题 1（Skill 本质）**：Skill 和 Subagent 最本质的区别是什么？
- ✅ **Skill 加载到主上下文，Subagent 跑在独立 context** — 这是核心区别。Skill 的内容塞进主 Agent 上下文（和主对话共享 token 预算），Subagent 在独立 context window 里跑（中间过程不污染主对话）。

**题 2（动态注入）**：`!git diff HEAD` 这个命令什么时候执行？
- ✅ **Harness 在发给模型前执行，把输出替换进去** — Harness 在预处理阶段执行 `!` 反引号里的命令，用输出替换那一行，然后才把拼好的内容发给模型。

**题 3（Skill vs Subagent 选型）**：API 风格指南，Claude 写所有 Python 代码时都应遵守。
- ✅ **Reference Skill（description 始终在 context）** — Reference Skill 的 description 始终在主上下文，body 在调用时加载。

---

## 第 6 课总结

- **Skill**：目录 + SKILL.md（YAML frontmatter + markdown body），可附带 templates/examples/scripts
- **两种类型**：Reference（贯穿 session 的知识）vs Action（执行一次性任务）
- **动态注入**：`!shell-command` 在预处理阶段执行，输出替换进 body
- **调用控制**：`disable-model-invocation: true`（只能用户用）/ `user-invocable: false`（只能模型用）
- **执行上下文**：`context: fork` + `agent` 把 Skill 跑在 subagent 里
- **$ARGUMENTS 占位符**：用户调用时传的参数
- **加载时机**：description 始终在 context（除非 disable-model-invocation），body 按需加载
- **vs Subagent**：Skill 注入主上下文（知识复用），Subagent 独立 context（任务隔离）

> **元洞察**：前 5 课把 Harness 看成"模型 + 循环 + 工具 + 上下文 + Hook + 权限"——6 件事都是通用基础设施。第 6 课开始，Harness 有了"领域知识注入"的能力：Skill 让团队可以把专有规范、专有流程、专有工具链打包成可复用单元，跨项目、跨成员地扩展 Claude Code。这是 Harness 从"通用平台"走向"团队工具"的关键。

---

## 推荐阅读

- [Claude Code: Skills](https://docs.anthropic.com/en/docs/claude-code/skills) — SKILL.md 结构、frontmatter 字段、目录布局
- [Claude Code: Skill vs Subagent](https://docs.anthropic.com/en/docs/claude-code/skills#skill-vs-subagent) — 官方对比
- [Claude Code: Slash commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands) — Skills 跟 slash command 的关系
- [Claude Agent SDK: Creating Skills](https://docs.anthropic.com/en/docs/agent-sdk/creating-skills) — SDK 编程式 Skill 定义
- [Claude Code: Plugin directory structure](https://docs.anthropic.com/en/docs/claude-code/plugins/plugin-directory-structure) — 企业级 plugin

---

## Q&A

**Q: Skill 是怎么"自动加载"的？**
A: 两步机制：(1) Session 开始时，所有 Skill 的 description 拼成一个列表塞进主系统提示，模型看到"我能用这些 Skill"。(2) 模型判断当前任务匹配某个 description 时，调 `read_skill` 工具加载完整 body。

**Q: `!command` 执行的命令会触发权限检查吗？**
A: 会。Harness 跑 `!` 命令时跟模型自己调 Bash 一样要过权限——`permissions.allow` / `deny` 规则、`bypassPermissions` 模式、`PermissionRequest` hook 全部生效。

**Q: `context: fork` 跟派 Subagent 有什么区别？**
A: `context: fork` 就是派 Subagent。Skill 加 `context: fork` 后，Harness 把 Skill body 作为 subagent 的任务派出去，指定 `agent` 类型。这是 Skill 和 Subagent 组合的标准模式。

**Q: `disable-model-invocation: true` 和 `user-invocable: false` 能同时设吗？**
A: 能但没意义。两者都设意味着没人能调。实际场景：要么允许用户调（设 disable-model-invocation）、要么允许模型调（设 user-invocable: false），二选一。

**Q: Skill 能调 MCP 工具吗？**
A: 能。`allowed-tools` 字段可以包含 MCP 工具名（`mcp__server__tool` 格式）。但前提是 MCP 服务器已经配置好——Skill 不能"自带"MCP 服务器。

---

*原文来自微信公众号：AI数字理想 · 已按知识库入库标准存档*
