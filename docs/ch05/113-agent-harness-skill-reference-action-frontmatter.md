# Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解

> 📊 Level ⭐⭐⭐⭐⭐ | 10.0KB

> 数字理想「Harness 工程」系列第 6 课。聚焦 **Anthropic Agent Harness** 的 Skill 系统（区别于 Claude Code Skills），从概念到实操的完整教程。

与 [Claude Code Skills 实战指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) 互补——该实体聚焦 Claude Code 的 Skill 发现机制与安全限制，本实体聚焦 **Agent Harness** 框架的 Skill 系统（类型体系、frontmatter 字段、动态注入、Agent Teams、执行上下文控制）。

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

- [Claude Code Skills 实战指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) — 互补：该实体聚焦 Claude Code 的发现机制（6 种来源）和安全限制，本实体聚焦 Agent Harness Skill 系统（类型、frontmatter 字段、动态注入、context fork）
- Harness Engineering — 上位框架：Skill 是 Harness Engineering 六层架构中"工具与技能体系"层的具体实现
- [Claude Code Skill Writing 指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skill-writing-guide.md) — 互补：前者侧重编写方法，本实体侧重执行原理

## 深度分析

### Skill 与 Subagent：同一份上下文预算的两种花法

Skill 注入主 Agent 上下文、与主对话共享 token 预算；Subagent 独立 context window、中间过程不污染主对话。两者不是竞争关系，而是同一预算的两种分配策略：Skill 把知识"摊平"进主上下文，换取模型随时可引用；Subagent 用隔离换取主对话洁净，代价是结果回传时的信息压缩。选择标准不是"哪个更强"，而是知识的消费频率（高频 → 摊平，低频重活 → 隔离）与副作用半径——这正是 [Multi Agent Context Isolation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md) 与 [Claude Code Subagent Context Hygiene](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-subagent-context-hygiene.md) 讨论的上下文卫生问题在 Skill 层的具体化。

### Reference/Action 二分背后的加载经济学

"菜单常驻、菜按需上桌"的隐喻背后是一笔明确的账：Reference Skill 的 description 是长期固定开销，body 按需加载；Action Skill 的完整 body 只在触发时一次性结账。`disable-model-invocation: true` 则是把菜单项从模型侧撤下——省下 description 的常驻 token，付出的代价是模型失去自主发现能力，只剩用户 `/skill-name` 手动触发，Skill 从"模型可调资源"降级为"用户专属快捷指令"。[Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) 的按需披露原则在这里落地为具体的加载时机开关：description 是否进 context，决定了这个 Skill 在模型的"世界"里是否存在。

### `!` 注入与 `$ARGUMENTS`：同一条模板渲染流水线的两个触发点

两者都发生在"发给模型之前"。`$ARGUMENTS` 在调用时替换用户参数（`/deploy auth-service v2.3` → `auth-service v2.3`），`!` 命令在预处理阶段执行 shell 并用输出替换整行。关键差异是数据来源：前者来自调用方，后者来自运行环境（`gh pr diff` 等）。效果则是同一个——把"取数"从模型的工具调用回合挪到 Harness 的预处理：模型收到的是已填好实时数据的指令，省掉至少一个工具调用往返，且输出确定性由 shell 保证而非依赖模型行为。这是 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)"能预计算的就别让模型算"主张的最小实现。

### frontmatter 三组开关：调用权、执行位置、工具面的正交设计

三组开关互相正交：调用控制（`disable-model-invocation` / `user-invocable`）决定谁能触发；`context: fork` + `agent` 决定在哪执行——Skill 是"提示模板"，Subagent 是"执行单元"，二者可组合；`allowed-tools` 决定能碰什么工具。目录结构是同一思想在文件粒度的延伸：SKILL.md 导航页 → reference.md 细节页 → scripts/ 工具页（不进 context，模型用 Bash 调用），渐进披露保证每个字节只在需要的层级出现。三组开关正交意味着可以独立调参而不互相牵连，这是 frontmatter 设计比"一个大配置项"更可维护的根本原因。

## 实践启示

1. 写 Skill 前先回答"模型是否任何时候都该记住它"：是 → Reference；只在用户明确指令时执行 → Action。类型选错直接决定 token 账单的形态。
2. 低频且危险的操作（部署、删除类）加 `disable-model-invocation: true`，用"模型不知道它存在"换取零误触。
3. 需要 PR diff、issue 评论等实时数据时用 `!` 反引号注入，别让模型自己调工具——预处理一次到位，省往返且输出确定。
4. 长任务、输出量大或会污染主对话的场景配 `context: fork` + `agent`，中间过程留在 subagent 独立窗口，主对话只收结论。
5. 执行型 Skill 默认写 `allowed-tools` 白名单（如 `Bash(gh *)`），把权限最小化做成习惯而非事后补丁。
6. 目录按渐进披露组织：SKILL.md 保持导航级，细节下沉 reference.md，可执行逻辑放 scripts/——上下文只为"决策知识"付费。

## 参考

→ 原文存档：`raw/articles/gaLEAjOz8xLAi8ABnG855g/article.md`

[^1]: raw/articles/gaLEAjOz8xLAi8ABnG855g

---

