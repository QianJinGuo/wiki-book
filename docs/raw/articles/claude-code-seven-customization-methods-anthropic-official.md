---
title: "Claude Code 七种自定义方法：CLAUDE.md / Rules / Skills / Subagents / Hooks / Output Styles / System Prompt"
source_url: "https://mp.weixin.qq.com/s/uOCq__-ksvmwf6tCRg3brw"
original_url: "https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more"
ingested: 2026-06-26
sha256: ""
type: raw
---

All API handlers must validate input with Zod before processing.
```

**提示：** 像"migrations 只能追加"这类文件级约束，最适合做成带 paths frontmatter 的规则。

## 技能

技能以文件夹形式放在 .claude/skills/ 中，包含指令、脚本和资源。每个技能都有一个 SKILL.md 文件。

会话开始时只加载名称和描述；完整正文只在 Claude 调用该技能时加载。调用方式可以是 slash command，也可以是任务自动匹配。

压缩时，Claude Code 会在所有已调用技能的总预算内重新注入这些技能。如果一个会话里调用了太多技能，最早调用的会先被丢弃。

**提示：** 部署流程、发布检查清单、审查流程这类流程型指令，应该放进技能，而不是 CLAUDE.md。

## 子智能体

子智能体是 .claude/agents/ 中的 Markdown 文件，用来为特定侧任务定义隔离的助手。每个文件使用 YAML frontmatter，包含名称、描述，以及可选的模型和工具访问字段。

子智能体会在自己的全新上下文窗口里运行。返回主会话的只有子智能体的最终消息。

子智能体最多可以嵌套五层，动态工作流可以编排数十到数百个后台 agent。

**提示：** 隔离性是选择子智能体而不是技能的主要原因之一。深度搜索、日志分析、依赖审计这类侧任务，如果中间结果会污染主对话，就适合用子智能体。

## 钩子

钩子是用户定义的命令、HTTP endpoint 或 LLM prompt，在 Claude 生命周期中的特定事件触发。

hook 有几种类型：command、HTTP、mcp_tool、prompt 和 agent。所有 hook 都会被确定性触发。前三类确定性执行；后两类使用 Claude 的判断。

上下文成本很低，因为配置或指令位于主上下文窗口之外。

**提示：** 任何应该确定性发生的事情都适合用 hook：编辑后运行 linter、完成后发 Slack、在命令执行前阻止特定命令。PreToolUse hook 可以检查任意工具调用，并用退出码 2 拒绝它。

## 输出风格

输出风格是 .claude/output-styles/ 中的文件，会把指令注入系统提示词。它们永不压缩，在每个会话开始时加载。

因为输出风格位于系统提示词中，指令遵循权重最高，应该谨慎使用。

修改输出风格会替换默认输出风格。自定义输出风格会丢弃所有默认指令（如何界定变更范围、何时添加或省略代码注释、如何处理安全问题等），让 Claude Code 更像通用助手。

**提示：** 编写自定义输出风格前，先检查内置风格。Proactive、Explanatory 和 Learning 覆盖了最常见的需求。

## 追加系统提示词

使用 append-system-prompt flag，在原始系统提示词上追加内容。不会改变 Claude 的角色，只是在默认角色基础上增加指令。

它在调用时传入，只作用于本次调用，不会作为文件跨会话持久化。

**提示：** 追加系统提示词最适合补充具体编码标准、输出格式或领域知识。追加的指令越多，遵循度通常越低，特别是指令之间存在冲突时。

## 快速建议

**在 CLAUDE.md 中写"每次 X，都要 Y"** → 换成 hook。让模型选择运行 formatter，和让 formatter 自动运行，是两回事。

**在 CLAUDE.md 中写"绝不要做这件事"** → 换成 hooks 和权限。护栏需要确定性执行。PreToolUse hook 可以用退出码 2 阻止调用。托管设置由管理员部署，不能被用户本地配置覆盖。

**在 CLAUDE.md 中写 30 行流程** → 换成技能。CLAUDE.md 适合保存 Claude 应该始终持有的事实。部署 runbook 应该放在 .claude/skills/ 中。

**API 专属规则没有路径** → 用 paths: 限定作用域。未限定作用域的规则在机制上等同于 CLAUDE.md。

**把个人偏好写进项目级 CLAUDE.md** → 用本地文件。所有基于文件的方法都有用户级对应项。项目级文件应保存团队范围内、只和特定代码库相关的偏好。
