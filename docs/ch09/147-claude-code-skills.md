# Claude Code Skills 实战指南 — 发现机制、编写与安全

## Ch09.147 Claude Code Skills 实战指南 — 发现机制、编写与安全

> 📊 Level ⭐⭐ | 2.7KB | `entities/claude-code-skills-practical-guide-discovery-frontmatter.md`

# Claude Code Skills 实战指南 — 发现机制、编写与安全

> 小 G (JavaGuide) 对 Claude Code Skills 的深度技术解析。与 [Claude Code Skills/MCP/Rules 源码分析](../ch07/006-claude-code-skills-mcp-rules.html) 互补——该实体聚焦源码层实现，本实体聚焦用户层的发现机制、SKILL.md 编写、执行流程与安全限制。

## Skills 的核心设计理念

**按需加载的操作手册**：
- CLAUDE.md = 常驻上下文（每轮都要的规则）
- Skill = 按需加载（只有特定任务才用到的流程）
- Subagent = 委派执行者（"谁来做"）
- Plugin = 分发机制（打包 Skills/Agents/Hooks/MCP）

**Skills vs CLAUDE.md 区别**：SKILL.md 平时只暴露 name/description/when_to_use（token 估算），完整内容只在调用时加载。

## 发现机制

Claude Code 从 6 种来源加载 Skills：

| 类型 | 路径/来源 | 范围 |
|---|---|---|
| 用户级 | ~/.claude/skills/ | 个人项目通用 |
| 项目级 | .claude/skills/ | 项目或团队共享 |
| Managed | 管理策略目录 | 组织统一下发 |
| Bundled | Claude Code 内置 | /code-review, /debug, /loop |
| Plugin | 插件提供 | 跟随 plugin 安装 |
| MCP | MCP Server 映射 | 来自远程 Server |

## 执行流程

1. 展开参数（$ARGUMENTS, $0, $1...）
2. 替换 ${CLAUDE_SKILL_DIR}、${CLAUDE_SESSION_ID}
3. 非 MCP 来源时执行内嵌 shell 命令（动态上下文：预处理，非工具调用）
4. 返回最终 prompt 给模型

## 安全限制

- **MCP 来源的 Skill 不执行内嵌 shell** — 防止 RCE
- strictPluginOnlyCustomization 可锁定 Skills/Hooks 来源
- context: fork 适合长流程、只读审查、文档汇总
- disalbe-model-invocation 限制仅手动调用

## 与已有实体的关系

- [Claude Code Skills/MCP/Rules 源码分析](../ch07/006-claude-code-skills-mcp-rules.html) — 互补：该实体源码层（Rewrites/Loader/评分），本实体用户层（frontmatter/发现/安全）
- [Claude Code Skill Writing 指南](../ch03/075-claude-code.html) — 互补：前者侧重编写方法，本实体侧重发现机制和执行原理

## 参考

→ [raw/articles/claude-code-skills-practical-guide-discovery-frontmatter|原文存档]

---

