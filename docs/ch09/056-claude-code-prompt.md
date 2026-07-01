# 【图解】Claude Code 源码解析 ｜Prompt 提示词模块

## Ch09.056 【图解】Claude Code 源码解析 ｜Prompt 提示词模块

> 📊 Level ⭐⭐ | 10.4KB | `entities/claude-code-prompt-source-analysis-fanone.md`

[Claude Code Prompt Source Analysis Fanone](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-prompt-source-analysis-fanone.md)

## 六大 Prompt 模块概览
Claude Code 的提示词体系分为六大模块：
| 模块 | 职责 |
|------|------|
| Core System Prompt | 明确角色、任务边界、输出风格、风险动作原则、工具总原则 |
| Tool Prompts | 每个工具的用途、输入约束、使用边界 |
| Skill Prompts | 专项知识包、触发条件、限定工具集、渐进式展开 |
| Agent Prompts | coordinator/worker/verifier/planner 四种角色的职责定义 |
| Context Management Prompts | 压缩、会话总结、记忆提取、恢复 |
| Memory Prompts | 存储内容、存储方式 |

## Core System Prompt：静态/动态分离
整个系统提示词由**静态规则**和**动态 dynamicSections** 组成：

- **静态规则**：做缓存（不变的部分反复使用）
- **动态规则**：每次会话更新
- 两者之间有明确的 **boundary** 划分
```javascript
// 静态规则示例
if (isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE)) {
    return [`You are Claude Code, Anthropic's official CLI for Claude.\n\nCWD: ${getCwd()}\nDate: ${getSessionStartDate()}`]
}
// 动态 sections
const dynamicSections = [
    systemPromptSection('session_guidance', () => getSessionSpecificGuidanceSection(...)),
    systemPromptSection('memory', () => loadMemoryPrompt()),
    systemPromptSection('language', () => getLanguageSection(settings.language)),
    systemPromptSection('output_style', () => getOutputStyleSection(outputStyleConfig)),
    DANGEROUS_uncachedSystemPromptSection('mcp_instructions', () => getMcpInstructionsSection(mcpClients)),
    systemPromptSection('summarize_tool_results', () => SUMMARIZE_TOOL_RESULTS_SECTION)
]
```

### 优先级策略树：`buildEffectiveSystemPrompt`
在多模式、多角色、多来源 prompt 共存时，通过优先级策略树保证覆盖关系清晰：
| 优先级 | 类型 | 规则 |
|--------|------|------|
| **P0** | Override SystemPrompt | 硬覆盖，设置后替换其他所有 prompt |
| **P1** | Coordinator Prompt | 开启 coordinator mode 时，主线程变为调度者 |
| **P2** | Agent Prompt | 设置 mainThreadAgentDefinition 时；proactive mode 下追加而非替换 |
| **P3** | Custom System Prompt | 用户传入 `--system-prompt` |
| **P4** | Default System Prompt | 最终兜底的系统默认 |

## Tool Prompts：自然语言行为协议
CC 里 Skill 和 SubAgent 都是以 **Tool 形式**调用的（ToolSkill、ToolAgent）。
每个 Tool 自带的 prompt/description 定义：

- 这个工具是什么
- 什么时候该用 / 什么时候不该用
- 参数/调用约束是什么
**关键设计理念**：CC 把规则以**自然语言**放在 Prompt 里，而不是用代码对大模型输出做规则补丁。充分相信大模型的理解能力。
**BashTool 的 prompt 特殊之处**：已经复杂到像一份高风险工具专用操作 SOP。定义了 git 提交/PR 的详细流程、禁止事项、用 Skill 替代部分 git 流程。看起来像是 Skill 的前身。

## Skill Prompts：渐进式加载
如果所有工具定义都塞进上下文，token 浪费严重。**渐进式 Skill** 解决了这个问题。
**核心机制**：

- Skill 作为 Prompt 资产**先注册**
- SkillTool 在**运行时**把 Skill 展开成新的上下文消息
- 而不是像普通 Tool 那样直接执行外部动作

### Skill 的结构（以 `claude-api` skill 为例）
```markdown
name: Claude API
description: 这个技能用于帮助你使用 Claude API、Anthropic SDK 或 Agent SDK...
allowedTools: [Read, WebFetch, ...]
model: ...
hooks: ...
paths: ...

# Reading Guide（文档索引）

- 单轮文本分类/摘要/问答 → {lang}/claude-api/README.md
- 聊天 UI/流式响应 → README.md + streaming.md
- 长对话（可能超窗口） → README.md 中的 Compaction 部分
```

### Token 优化策略
**Reading Guide + 语言检测**：

- `detectLanguage` 判断项目语言（Python → pyproject.toml/requirements.txt，Go → go.mod，Java → pom.xml）
- 只发**当前项目最相关的那一套文档**，不发全部语言文档
- doc 标签区分文档来源，防止重复找相同文件：
```xml
<doc path="typescript/claude-api/README.md">...内容...</doc>
<doc path="shared/tool-use-concepts.md">...内容...</doc>
```

### Skill Prompt 标准格式
```markdow
***
name: Claude API
description: 使用场景，触发条件...
allowed-tools: [Read, WebFetch, ...]
***

# Claude API / Anthropic SDK 专项技能
## Reference Documentation
...Reading Guide...

## Included Documentation
<doc path="go/claude-api/README.md">...</doc>
<doc path="shared/tool-use-concepts.md">...</doc>

## When to Use WebFetch
...

## Common Pitfalls
避免：模型名错误、流式写法错误、tool use 方式错误、缓存误解等
```

## 深度分析
### 架构哲学："自然语言即协议"
Claude Code 的 Prompt 设计背后有一个核心哲学：把规则以**自然语言**写入 Prompt，而不是用代码对大模型输出做规则补丁。这是一个本质性的设计选择——充分相信大模型的理解能力，把行为边界用人类可读的方式表达。

### 静态/动态分离：缓存与灵活性的平衡
Core System Prompt 的静态/动态分离是一个经典的性能优化模式。静态规则做缓存避免重复传输，动态 sections 每次会话更新保证实时性。两者之间的 **boundary** 划分使得系统既高效又灵活。

### 渐进式 Skill：解决 Token 瓶颈的工程实践
渐进式 Skill 机制是解决上下文 token 瓶颈的工程典范：Skill 作为 Prompt 资产先注册，运行时按需展开成上下文消息，而不是把所有工具定义都塞进上下文。这套机制 + Reading Guide + 语言检测，实现了对特定项目、特定语言、特定场景的精准内容分发。

### 多 Agent 协作：角色 SOP 的模块化
coordinator/worker/verifier/planner 四种 Agent 角色通过强角色边界 SOP 实现复杂工作流的分解。抽象成可复用模块：职责定义 → 强制边界 → 信息输入 → 执行过程 → 错误处理 → 工具指南 → 输出规范。这套结构对任何多 Agent 系统都有参考价值。

### Memory 分级存储：持久化的认知架构
四类 Memory（user/feedback/project/reference）对应不同的认知层级，存储策略也有本质区别：user 记偏好，feedback 记规则→原因→应用方式，project 记事实→决策→原因，reference 记外部系统入口。Memory 不存代码结构/git 历史/修 bug recipe，这些另有专门的存储方式。

### 优先级策略树：覆盖关系清晰化
`buildEffectiveSystemPrompt` 的优先级树（P0-P4）解决了多模式、多角色、多来源 prompt 共存时的覆盖冲突问题。任何新 prompt 来源都能在这个树中找到自己的位置，不会出现意外覆盖或被吞掉的情况。

## 实践启示
### 工具设计
**用自然语言描述行为约束，而不是用代码做规则补丁**。充分信任大模型的理解能力，把边界写在 prompt 里而不是硬编码。高风险工具（如 BashTool）需要像 SOP 一样详细的 prompt，定义好每一步流程、禁止事项、fallback 方式。
**渐进式内容分发**：不要一次性把所有上下文塞给模型。先发概览/索引，按需展开详细文档。Reading Guide + 语言检测 + doc 标签是一套可复用的工程方案。

### Agent 工作流
**强角色边界 + 结构化输出**是复杂任务分解的关键。coordinator/worker 的分离模式对任何多 Agent 系统都有参考价值。每个 Agent 的 prompt 都应包含：职责定义、强制边界、可获取信息、执行过程、错误处理、工具指南、输出规范。
**错误处理前置**：在 Agent prompt 里明确"最常见的错误行为是什么 + 如何纠正"，比事后补救更有效。

### Memory 系统
**区分存储内容**：用户偏好和项目背景需要持久化，代码结构/架构/临时状态不需要（另有专门存储）。
**分级存储**：四类 Memory（user/feedback/project/reference）比单一 memory 空间更清晰，每类有明确的记什么、怎么写。
**文件形式的优势**：memory 以文件形式存储，带 frontmatter 和标题，便于索引、搜索和人工验证。

### 系统 Prompt 优先级
**硬覆盖 > 协调者 > Agent > Custom > Default**：当多个 prompt 来源共存时，这个优先级顺序确保行为可预测。在设计自定义 prompt 机制时，需要明确它处于哪个优先级层级。

## 相关实体
- [Anthropic Prompt Caching Claude Code Agihunt](ch03/074-claude-code.md)
- [Anthropic Prompt Caching Claude Code](ch01/198-anthropic-prompt-caching-claude-code.md)
- [Claude Code Prompt Source Analysis](ch03/074-claude-code.md)
- [Claude Code Self Repair Hooks Memory Config](ch04/150-ai.md)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践](ch03/074-claude-code.md)

---

