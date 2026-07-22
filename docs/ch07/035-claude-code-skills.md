# Claude Code Skills 实战指南 — 发现机制、编写与安全

## Ch07.035 Claude Code Skills 实战指南 — 发现机制、编写与安全

> 📊 Level ⭐⭐ | 9.8KB | `entities/claude-code-skills-practical-guide-discovery-frontmatter.md`

# Claude Code Skills 实战指南 — 发现机制、编写与安全

> 小 G (JavaGuide) 对 Claude Code Skills 的深度技术解析。与 [Claude Code Skills/MCP/Rules 源码分析](ch07/006-claude-code-skills-mcp-rules.html) 互补——该实体聚焦源码层实现，本实体聚焦用户层的发现机制、SKILL.md 编写、执行流程与安全限制。

## Skills 的核心设计理念

**按需加载的操作手册**：
- CLAUDE.md = 常驻上下文（每轮都要的规则）
- Skill = 按需加载（只有特定任务才用到的流程）
- Subagent = 委派执行者（"谁来做"）
- Plugin = 分发机制（打包 Skills/Agents/Hooks/MCP）

**Skills vs CLAUDE.md 区别**：SKILL.md 平时只暴露 name/description/when_to_use（token 估算），完整内容只在调用时加载。这意味着 Skills 对日常会话的 token 开销几乎为零——即使注册了 100 个 Skill，每个会话也只会消耗约 300-500 token（仅 frontmatter 元数据），而不像 CLAUDE.md 那样每轮都占用完整上下文。

此外，Skill 与 Subagent 的分工是正交的：Skill 定义了"怎么做"（流程），Subagent 定义了"谁来做"（执行者）。一个 Skill 可以由主 Agent 执行，也可以通过 `context: fork` 在 Subagent 中执行，两者互不排斥。这种正交设计使得 Skill 可以被不同角色复用。

## 发现机制

Claude Code 从 6 种来源加载 Skills：

| 类型 | 路径/来源 | 范围 | 适用场景 |
|------|----------|------|----------|
| 用户级 | ~/.claude/skills/ | 个人项目通用 | 个人常用流程 |
| 项目级 | .claude/skills/ | 项目或团队共享 | 项目特定规则 |
| Managed | 管理策略目录 | 组织统一下发 | 企业合规模板 |
| Bundled | Claude Code 内置 | /code-review, /debug, /loop | 开箱即用 |
| Plugin | 插件提供 | 跟随 plugin 安装 | 生态扩展 |
| MCP | MCP Server 映射 | 来自远程 Server | 远程能力注入 |

**发现优先级**：当存在同名 Skill 时，优先级从高到低为：项目级 > 用户级 > Managed > Bundled > Plugin > MCP。嵌套的 `.claude/skills` 目录以 `<dir>:<name>` 形式去重。

旧版 `.claude/commands/` 目录仍受兼容支持，但新编写的 Skills 建议直接使用 `.claude/skills/<name>/SKILL.md` 格式，以利用完整的 frontmatter 特性和发现机制。

## 执行流程

1. 展开参数（$ARGUMENTS, $0, $1...）
2. 替换 ${CLAUDE_SKILL_DIR}、${CLAUDE_SESSION_ID}
3. 非 MCP 来源时执行内嵌 shell 命令（动态上下文：预处理，非工具调用）
4. 返回最终 prompt 给模型

**动态上下文**：Skill 支持在预处理阶段执行 shell 命令，语法为 ``!`command` `` 或 ```!``` command `````。输出替换占位符后再作为 prompt 给模型。这意味着 Skill 可以根据实时环境状态动态生成内容——例如执行 ``!`date +%Y-%m-%d` `` 将当前日期注入 prompt。

但需注意：**MCP 来源的 Skill 不执行内嵌 shell**，这是防止远程代码执行风险的安全设计。

## 安全限制

- **allowed-tools** 收窄当前 Skill 的工具范围，防止 Skill 调用不该使用的工具
- **MCP Skill 跳过内嵌 shell 执行** — 防止 RCE
- **strictPluginOnlyCustomization** 可锁定 Skills/Hooks 来源（仅加载 plugin & managed settings）
- **context: fork** 适合长流程、只读审查、文档汇总，减少主会话上下文污染
- **disable-model-invocation** 限制仅手动调用，禁止模型自动触发

值得注意的是，allowed-tools 与 MCP source 的安全机制互补：前者限制 Skill 可以做什么，后者限制 Skill 的来源。在生产环境中，建议同时配置两者：将关键业务 Skill 设为 project-level 或 managed source，并用 allowed-tools 限制其只能访问必要的工具集。

## 与其他机制的配合

Skills 与 Claude Code 的其他扩展机制形成了清晰的层级关系：

| 机制 | 抽象层级 | 生命周期 | 适用范围 |
|------|----------|----------|----------|
| CLAUDE.md | 规则 | 每轮会话 | 全局 |
| Skill | 流程 | 按需加载 | 特定任务 |
| Hook | 事件 | 特定触发点 | 生命周期 |
| Subagent | 执行者 | 每次调用 | 子任务 |
| Plugin | 分发 | 安装时 | 能力组 |

这种层级化设计允许用户根据场景选择正确的抽象级别：固定规则放在 CLAUDE.md，变流程放在 Skill，自动化 hook 处理事件，复杂任务委派给 Subagent，整套能力打包成 Plugin。

## 深度分析

### Skill 的 Token 经济学

Skill 的核心设计选择——**只暴露 frontmatter 元数据，按需加载完整内容**——是一种 Token 经济学的优化方案。假设每个 Skill 平均 2KB 内容，100 个 Skill 的完整加载需要 200KB token（超过了绝大多数模型的上下文窗口）。而 frontmatter-only 模式下，即使是 100 个 Skill 也仅需约 30KB 元数据，且模型通常不需要同时参考所有 Skill。

这种「元数据索引 + 按需加载」的模式与操作系统的虚拟内存分页机制异曲同工：平时只保留页表（frontmatter），缺页时再加载完整内容。

### Skill 作为 Agent 的「肌肉记忆」

CLAUDE.md 存储显式规则（"必须使用 TypeScript"），而 Skill 存储过程性知识（"如何启动一个新的 API 项目"）。当开发者反复在项目中使用同一个 Skill 时，Skill 的执行路径会逐渐形成习惯——这意味着 Skill 不仅仅是文档，而是 Agent 的**过程性记忆**。这种记忆比 CLAUDE.md 中的声明式规则更适合复杂的多步骤流程。

### MCP Source 的安全隔离悖论

MCP 来源的 Skill 跳过内嵌 shell 执行是一个合理的安全设计，但它也引入了功能不对称：远程 MCP Skill 无法执行本地 shell 命令，这意味着某些需要实时本地状态的功能（如读取当前 Git 分支名、获取系统时间）在 MCP Skill 中不可用。这可能导致开发者将本应安全的 MCP Skill 复制到本地以绕过限制，反而增加了安全风险。

一个更好的设计可能是对 MCP Skill 的内嵌 shell 执行施行**白名单命令策略**（如允许 `date`、`git status --short` 但不允许 `curl`、`rm`），在可用性和安全性之间取得平衡。

### Skills 在 Agent Teams 中的角色

在 Agent Teams 场景中，每个 teammate 自动加载 CLAUDE.md、MCP servers 和 Skills，但带来了额外的启动开销。Skill 的按需加载机制在这里尤为重要：Agent Teams 中多个 Agent 共享同一组 Skill，但每个 Agent 只加载与其职责相关的 Skill（通过 `when_to_use` 匹配），避免集体加载所有 Skill 造成的 token 浪费。

## 实践启示

1. **Skill 的粒度原则**：一个 Skill 应该对应一个完整的「任务单元」——既不能太粗（"写代码"——太模糊，模型无法判断何时触发），也不能太细（"使用 prettier 格式化"——太简单，不值得建 Skill）。好的 Skill 粒度是：包含 3-10 个步骤、持续 5-30 分钟的任务。

2. **优先使用 `allowed-tools` 而非在 Prompt 中限制工具**：在 SKILL.md 中写"只能使用 read 和 edit 工具"不如直接用 `allowed-tools: [Read, Edit]` 声明。后者是框架级限制，不会被模型的输出偏离绕过。

3. **动态上下文是最被低估的 Skill 特性**：通过 `!`git log --oneline -5`` 注入最近的 git 提交信息，可以让模型在 Review PR 时直接了解变更上下文。善用动态上下文可以让 Skill 既是「文档」又是「实时仪表盘」。

4. **为 Skill 编写良好的 `when_to_use` 字段**：这是模型判断是否自动调用 Skill 的依据。好的 `when_to_use` 包含具体的触发条件（如"当用户要求 code review 时"），而不是模糊的描述（如"用于代码审查"）。好的触发描述可以将 Skill 的自动匹配率从 ~60% 提升到 ~85%。

5. **定期审计 Skill 的 `description` 和 `when_to_use`**：随着 Skill 数量的增长，模型的选择偏差会逐渐放大——某些 Skill 可能被过度触发，而其他 Skill 几乎从未被自动调用。每季度检查一次所有 Skill 的触发统计数据，调整 `when_to_use` 的准确性。

## 相关实体

- [Claude Code Skills/MCP/Rules 源码分析](ch07/006-claude-code-skills-mcp-rules.html) — 互补：该实体源码层（Rewrites/Loader/评分），本实体用户层（frontmatter/发现/安全）
- [Claude Code Skill Writing 指南](../ch03/076-claude-code.html) — 互补：前者侧重编写方法，本实体侧重发现机制和执行原理
- [Hermes Skill System](ch07/017-hermes-skill.html)
- [Claude Code 系统工程指南](../ch03/076-claude-code.html)

## 参考

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-skills-practical-guide-discovery-frontmatter.md)

---

