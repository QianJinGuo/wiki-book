# Claude Code 七种自定义方法：官方全景指南

## Ch09.060 Claude Code 七种自定义方法：官方全景指南

> 📊 Level ⭐⭐ | 10.2KB | `entities/claude-code-seven-customization-methods-anthropic-official.md`

# Claude Code 七种自定义方法：官方全景指南

Anthropic 官方博客，系统阐述 Claude Code 的七种自定义方法及其对比。每种方法影响三件事：指令何时加载进上下文、压缩后是否持续生效、指令权重有多高。

与 [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch04/256-skill.md) 互补——源码分析侧重底层 API 注入位置，本文侧重官方使用指南和决策框架。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-seven-customization-methods-anthropic-official.md)

## 七种方法对比

| 方法 | 何时加载 | 压缩行为 | 上下文成本 | 适用场景 |
|------|----------|----------|------------|----------|
| CLAUDE.md（根目录） | 会话开始时，整个会话保留 | 记忆化；压缩后重新读取 | 高（每行都消耗 token） | 构建命令、目录布局、编码约定 |
| CLAUDE.md（子目录） | 按需加载（读取该子目录文件时） | 丢失，直到再次触碰 | 低 | 子目录专属约定 |
| 规则 | 用户级：会话开始时；路径作用域：匹配文件被触碰时 | 压缩后重新注入 | 中（除非限定路径） | 具体约束（如 API handler 用 Zod 校验） |
| 技能 | 会话开始时加载名称/描述；调用时加载全文 | 共享预算内重新注入；最早调用的先丢弃 | 低（调用时才加载） | 流程型工作（部署、发布检查清单） |
| 子智能体 | 名称/描述/工具列表加载；正文 Agent 调用时才加载 | 只有最终摘要返回主会话 | 低（隔离上下文窗口） | 并行工作、侧任务（深度搜索、日志分析） |
| 钩子 | 生命周期事件触发 | 完全绕过压缩 | 低（配置在主上下文外） | 确定性自动化（linter、Slack、阻止命令） |
| 输出风格 | 会话开始时注入系统提示词 | 永不压缩 | 高（覆盖默认系统提示词） | 显著改变角色 |
| 追加系统提示词 | 会话开始时，CLI flag 传入 | 永不压缩；只作用于本次调用 | 中（首次请求后缓存） | 语气、回复长度、格式偏好 |

## CLAUDE.md：控制在 200 行以内

- **根目录 CLAUDE.md**：始终加载，压缩后重新读取。适合构建命令、monorepo 结构、团队规范
- **子目录 CLAUDE.md**：按需加载（读取该子目录文件时）。适合子目录专属约定
- monorepo 中给每个团队目录放自己的子目录 CLAUDE.md，用 `claudeMdExcludes` 跳过不相关团队文件
- 组织级标准（安全策略、合规）通过 MDM 部署，不允许个人排除

→ [CLAUDE.md 12 条规则：Karpathy 扩展模板](ch03/075-claude-code.md)

## 规则：路径作用域是关键

```yaml
---
paths:
  - "src/api/**"
  - "**/*.handler.ts"
---
All API handlers must validate input with Zod before processing.
```

未限定作用域的规则 = CLAUDE.md（始终加载，始终消耗 token）。

## 技能：流程型指令的归宿

会话开始时只加载名称和描述；完整正文调用时才加载。压缩时在已调用技能的共享预算内重新注入，最早调用的先丢弃。

部署流程、发布检查清单、审查流程 → 技能，不是 CLAUDE.md。

→ [Claude Code 源码解析](ch04/256-skill.md)

## 子智能体：隔离是核心价值

在自己的全新上下文窗口里运行，返回主会话的只有最终摘要。最多嵌套五层，动态工作流可编排数十到数百个后台 agent。

深度搜索、日志分析、依赖审计 → 子智能体。流程在主线程展开方便调整 → 技能。

→ [Claude Code 子智能体上下文卫生](ch03/075-claude-code.md)

## 钩子：确定性执行

类型：command、HTTP、mcp_tool、prompt、agent。所有 hook 确定性触发；前三类确定性执行，后两类用 Claude 判断。

上下文成本低——配置位于主上下文之外。PreToolUse hook 可以用退出码 2 拒绝工具调用。

→ [Claude Code Hooks 完整指南](ch04/277-ai.md)

## 输出风格：权重最高，谨慎使用

位于系统提示词中，指令遵循权重最高。自定义输出风格会替换默认输出风格，丢弃所有默认指令（变更范围界定、代码注释规范、安全问题处理、验证习惯等）。

内置风格 Proactive、Explanatory、Learning 覆盖了最常见的需求。

## 快速建议

| 你在做的事 | 应该换成 |
|-----------|----------|
| CLAUDE.md 写"每次 X，都要 Y" | hook（确定性执行） |
| CLAUDE.md 写"绝不要做这件事" | hooks + 权限（护栏） |
| CLAUDE.md 写 30 行流程 | 技能（按需加载） |
| API 规则没有路径限定 | paths 作用域规则 |
| 个人偏好写进项目级 CLAUDE.md | 用户级本地文件 |

核心原则：**CLAUDE.md 保存事实（构建命令、布局、约定），不保存流程和护栏。**

## 深度分析

### 上下文成本是自定义方法选择的核心约束

Claude Code 七种自定义方法的本质区别在于**上下文成本模型**：CLAUDE.md 根目录每行都消耗 token，技能按需加载，钩子完全绕过压缩，输出风格永不压缩。这意味着选择自定义方法不仅是"功能匹配"问题，更是"token 预算分配"问题。在长会话中，根目录 CLAUDE.md 过长会挤占实际编码所需的上下文空间。

### "事实 vs 流程 vs 护栏"的三层分类法

官方给出的核心原则——"CLAUDE.md 保存事实，不保存流程和护栏"——实际上定义了自定义方法的三层分类法：事实（构建命令、目录布局）放 CLAUDE.md，流程（部署、发布检查清单）放技能，护栏（绝不要做的事）放钩子+权限。这个分类法解决了开发者最常见的困惑："这段指令应该放在哪里？"。

### 子智能体的隔离价值不仅是上下文卫生

子智能体在独立上下文窗口中运行，只返回最终摘要。这不仅是上下文卫生（避免污染主会话），更是**认知隔离**——子智能体可以大胆探索、试错、回滚，不影响主会话的决策状态。深度搜索、日志分析、依赖审计等"侧任务"天然适合子智能体，因为它们的中间过程对主任务没有价值。

### 钩子是"确定性自动化"的唯一可靠路径

Claude Code 中，钩子是唯一能保证"确定性触发、确定性执行"的自定义方法。CLAUDE.md 中的"每次 X，都要 Y"依赖 LLM 的指令遵循能力，而钩子通过退出码 2 拒绝工具调用是硬性的。对于安全护栏（阻止危险命令）和质量门控（lint 检查），钩子比 CLAUDE.md 中的软规则可靠得多。

### 输出风格的"权重最高"是双刃剑

输出风格位于系统提示词中，指令遵循权重最高——但自定义输出风格会替换默认输出风格，丢弃所有默认指令。这意味着开发者在自定义输出风格时，必须手动重新包含变更范围界定、代码注释规范、安全问题处理等默认行为，否则会意外丢失这些保护。

## 实践启示

1. **CLAUDE.md 控制在 200 行以内**：每行都消耗 token，过长会挤占编码上下文。monorepo 中用子目录 CLAUDE.md 分散负载
2. **用"事实-流程-护栏"三分法选择自定义方法**：事实放 CLAUDE.md，流程放技能，护栏放钩子。避免把所有东西堆进 CLAUDE.md
3. **路径作用域规则是中等规模项目的最优解**：未限定作用域的规则 = CLAUDE.md（始终加载），路径限定后按需加载，兼顾精确性和上下文效率
4. **安全护栏必须用钩子而非 CLAUDE.md**：阻止危险命令、强制 lint 检查等场景，钩子的确定性执行远比 LLM 指令遵循可靠
5. **谨慎自定义输出风格**：除非明确需要改变 Claude 的角色定位，否则使用内置风格（Proactive、Explanatory、Learning）更安全

## 相关链接

- 原文：https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more
- → [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch04/256-skill.md)
- → [Claude Code 治理：软规则与硬约束](ch03/075-claude-code.md)
- → [Claude Code 子智能体上下文卫生](ch03/075-claude-code.md)
- → [Claude Code Hooks 完整指南](ch04/277-ai.md)
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-seven-customization-methods-anthropic-official.md)

---

