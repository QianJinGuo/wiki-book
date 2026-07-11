# Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解

## Ch05.072 Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解

> 📊 Level ⭐⭐ | 6.1KB | `entities/agent-harness-skill-system-practical-guide.md`

# Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解

> 数字理想「Harness 工程」系列第 6 课。聚焦 **Anthropic Agent Harness** 的 Skill 系统（区别于 Claude Code Skills），从概念到实操的完整教程。

与 [Claude Code Skills 实战指南](../ch07/035-claude-code-skills.html) 互补——该实体聚焦 Claude Code 的 Skill 发现机制与安全限制，本实体聚焦 **Agent Harness** 框架的 Skill 系统（类型体系、frontmatter 字段、动态注入、Agent Teams、执行上下文控制）。

## Skill 的本质

Skill = **可复用指令单元**。不是"工具"，是"知识的打包"[^1]。

| 对比维度 | Skill | Subagent |
|----------|-------|----------|
| 执行位置 | 注入主 Agent 上下文 | 独立 context window |
| 核心目标 | 知识复用 | 任务隔离 |
| 副作用 | 与主对话共享 token 预算 | 中间过程不污染主对话 |

## 两种类型：Reference vs Action

| 类型 | 目的 | 加载时机 | 典型用途 |
|------|------|----------|----------|
| Reference Skill | 贯穿 session 的知识 | Session 开始就加载 description，body 按需 | API 风格指南、术语表、合规要求 |
| Action Skill | 一次性任务 | 触发时加载完整 body，执行完影响结束 | 部署、PR 总结、代码审查 |

判断标准：是"模型在任何时候都应记住 X"（→ Reference）还是"用户明确说 Y 时才执行"（→ Action）？[^1]

## 动态上下文注入：`!` 反引号语法

```
!shell-command
```

Harness 在**发给模型之前**执行 shell 命令、用输出替换该行。这是预处理阶段的"模板渲染"——模型看到的是已塞好实时数据的指令，不需再调工具取数。[^1]

### PR Summary Skill 示例

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---
## Pull request context
- PR diff: !gh pr diff
- PR comments: !gh pr view --comments
- Changed files: !gh pr diff --name-only
## Your task
Summarize this pull request...
```

执行流程：`!` 命令（预处理）→ 输出替换进 body → 拼好的内容发给模型。[^1]

## Frontmatter 字段参考

| 字段 | 作用 | 典型值 |
|------|------|--------|
| `description` | Skill 用途描述 | "Reviews code for SQL injection" |
| `name` | Skill 名字（缺省用目录名） | "code-reviewer" |
| `disable-model-invocation` | 禁用模型自动调用 | `true` / `false`（默认） |
| `user-invocable` | 禁用用户手动调用 | `true`（默认）/ `false` |
| `context: fork` | 在独立 subagent context 里跑 | `fork` / 不写（默认主 context） |
| `agent` | 配合 `context: fork` 指定 subagent 类型 | `Explore` / `Plan` / `general-purpose` |
| `allowed-tools` | Skill 执行时允许的工具 | `Bash(gh *)` |
| `argument-hint` | 斜杠命令的参数提示 | — |

### 三组关键开关

**① 调用控制**：

| 配置 | 用户能调 | 模型能调 | description 在 context |
|------|----------|----------|----------------------|
| 默认 | ✅ | ✅ | ✅ |
| `disable-model-invocation: true` | ✅ | ❌ | ❌ |
| `user-invocable: false` | ❌ | ✅ | ✅ |

⚠️ `disable-model-invocation: true` 的副作用是 description 不进 context——省 token 但模型不知道此 Skill 存在。适合"用户偶尔触发的危险操作"。[^1]

**② 执行上下文**：`context: fork` + `agent` 将 Skill 跑在 subagent 里。Skill 是"提示模板"，Subagent 是"执行单元"——可以组合。[^1]

**③ 工具白名单**：`allowed-tools` 限制 Skill 只能使用特定工具，防止越权。[^1]

## `$ARGUMENTS` 占位符

用户调用 `/deploy auth-service v2.3` 时，body 里的 `$ARGUMENTS` 被替换为 `auth-service v2.3`。[^1]

## Skill 目录结构

```
code-reviewer/
├── SKILL.md          # 主入口（必填）
├── reference.md      # 按需加载的详细文档
├── examples/
├── scripts/          # 不进 context，模型用 Bash 调用
└── templates/
```

设计原则：**渐进披露**（progressive disclosure）——SKILL.md 导航页 → reference.md 细节页 → scripts/ 工具页。[^1]

## Skill 加载时机

- **Reference Skill（默认）**：description 始终在主上下文，body 调用时加载
- **`disable-model-invocation: true`**：description **不进** context，只能用户 `/skill-name` 触发

> **description = "Skill 的菜单"，body = "Skill 的菜"。菜单常驻，菜按需上桌。**[^1]

## 与已有实体的关系

- [Claude Code Skills 实战指南](../ch07/035-claude-code-skills.html) — 互补：该实体聚焦 Claude Code 的发现机制（6 种来源）和安全限制，本实体聚焦 Agent Harness Skill 系统（类型、frontmatter 字段、动态注入、context fork）
- [Harness Engineering](ch05/066-harness-engineering.html) — 上位框架：Skill 是 Harness Engineering 六层架构中"工具与技能体系"层的具体实现
- [Claude Code Skill Writing 指南](../ch03/075-claude-code.html) — 互补：前者侧重编写方法，本实体侧重执行原理

## 参考

→ [raw/articles/gaLEAjOz8xLAi8ABnG855g|原文存档]

[^1]: raw/articles/gaLEAjOz8xLAi8ABnG855g

---

