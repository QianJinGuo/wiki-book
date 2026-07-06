# CLAUDE.md

## Ch01.295 CLAUDE.md

> 📊 Level ⭐⭐ | 17.4KB | `entities/claude-code-source-leak-lifecycle-analysis.md`

[Claude Code Source Leak Lifecycle Analysis](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-source-leak-lifecycle-analysis.md)

## 文章概要
Anthropic Claude Code 源码泄露事件（.map 文件未排除，1900+ TypeScript 文件，51万+ 行代码）让外界首次完整审视生产级 AI Agent 系统。本文顺着请求完整生命周期拆解每个环节——LLM 调用只是一行代码，真正让 Agent 可用的是围绕它精心设计的 Agent Harness。

## 核心循环：8步生命周期
```
用户输入消息
    ↓
步骤1：组装上下文（系统提示词 + CLAUDE.md + 记忆 + 对话历史）
    ↓
步骤2：调用 Claude API（异步生成器，流式传输）
    ↓
步骤3：解析响应（text 块 + tool_use 块）
    ↓
步骤4：权限检查（拒绝规则 → 允许规则 → 分类器 → 询问用户）
    ↓
步骤5：执行工具（只读并行，写操作串行）
    ↓
步骤6：反馈结果（工具结果变成对话消息）
    ↓
步骤7：上下文检查（太大则压缩，否则回到步骤2）
    ↓
步骤8：终止（无更多工具调用？完成。出错？恢复或退出）
```
**核心驱动**：`query.ts` 中的 `query()` 异步生成器函数，代码库里其他所有内容都为它服务。

## 步骤1：上下文组装
### buildEffectiveSystemPrompt()
系统提示词通过 `buildEffectiveSystemPrompt()` 拼装，分多部分：环境信息、工具使用说明、语气和风格等。
**两类内容：**
| 类型 | 说明 | 缓存策略 |
|------|------|----------|
| **缓存部分** | 大多数内容（OS、项目结构等，会话过程基本不变） | 只算一次，每轮复用 |
| **非缓存部分** | MCP 服务器相关指令（会话中可能动态变化） | 每轮重新计算 |
两组内容用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 标记分隔——边界前内容可跨用户共享 API 全局缓存范围。

### 系统提示词内容清单
| 部分 | 是否缓存 | 内容说明 |
|------|----------|----------|
| 介绍 | 是 | 角色定义、安全指令、URL 处理规则 |
| 系统 | 是 | 工具调用规则、权限行为、上下文压缩策略 |
| 执行任务 | 是 | 编码规范、验证方式、安全要求 |
| 操作 | 是 | 风险控制：可逆性检查、破坏性操作提示 |
| 使用工具 | 是 | 工具使用偏好（如用 Read 而不是 cat） |
| 语调和风格 | 是 | 输出风格、简洁性、代码引用格式 |
| 会话指导 | 是 | 当前可用能力、Agent 类型说明 |
| 记忆 | 是 | CLAUDE.md 中的项目约定和规则 |
| 环境 | 是 | 工作目录、git 状态、系统信息等 |
| MCP 指令 | 否 | 当前连接的 MCP 服务（动态变化） |
| 总结结果 | 是 | 上下文被清理前保留的关键信息 |

### CLAUDE.md 四级加载
`getMemoryFiles()` 从当前工作目录向上遍历到根目录，在每级收集指令文件：
**加载顺序（根→当前，越近优先级越高）：**
```
1. /etc/claude-code/CLAUDE.md          (系统级)
2. ~/.claude/CLAUDE.md                  (用户级)
3. ~/.claude/rules/*.md                 (用户级)
4. /Users/me/projects/CLAUDE.md         (项目级)
5. /Users/me/projects/myapp/CLAUDE.md   (项目级)
6. /Users/me/projects/myapp/.claude/CLAUDE.md  (项目级)
7. /Users/me/projects/myapp/.claude/rules/*.md  (项目级)
8. /Users/me/projects/myapp/CLAUDE.local.md     (本地级，gitignore)
```

### @include 指令
CLAUDE.md 支持 `@include` 语法（最多5层深度）：
```markdown
See our API conventions:
@./docs/api-conventions.md
And our testing standards:
@./docs/testing.md
```

### 完整上下文包
当用户输入"修复登录 bug"时，实际发送给 Claude 的内容：
| 内容 | 大小 |
|------|------|
| 系统提示词 | ~15,000 tokens |
| CLAUDE.md 文件 | ~2,000 tokens |
| 记忆 | ~500 tokens |
| MCP 指令 | ~300 tokens |
| 对话历史 | ~5,000 tokens |
| 用户消息 | ~10 tokens |

### 技能发现机制
`getSkillListingAttachments()` 收集所有可用技能，只保留名字和简单描述塞进系统提示词：
```xml
<system-reminder>
The following skills are available for use with the Skill tool:

- commit: Create a new git commit with a descriptive message.
- review-pr: Review a pull request for code quality and correctness.
- write-blog: Write blog posts for siddharthbharath.com.
</system-reminder>
```
**技能预算控制：**

- 所有技能描述加起来最多占上下文 1%（200K 模型约 2000 tokens）
- 每个技能描述 ≤ 250 字符
- 超出预算按需截断，详细定义按需通过 `ToolSearchTool` 拿取

## 步骤2：API调用与异步生成器
### queryLoop() 无限循环
核心是 `queryLoop()` 里跑 `while (true)`，每轮循环 = 一次完整 API 往返。
每轮开始时：
1. 发 `stream_request_start` 事件通知 UI
2. 控制工具返回体积（太大则裁掉）
3. 必要时对前一条回复做轻量压缩
4. 用 `appendSystemContext()` 拼出最终系统提示词
5. 发起请求，开始流式接收

### State 对象的状态传递
每轮循环都会读、改、传 `State` 对象：

- 压缩上下文后 → 更新 `state.messages`
- token 限制触发重试 → 增加 `state.maxOutputTokensRecoveryCount`
- 工具执行改变能力范围 → 更新 `state.toolUseContext`
**关键：每一轮的决策都会影响下一轮的行为。**

## 步骤3：响应解析
### text + tool_use 块
Claude 响应是流式生成的一块块内容：

- `text`：要对用户说的话
- `tool_use`：要调用的工具
典型响应示例：
```json
[
  {"type": "text", "text": "让我看一下登录代码..."},
  {"type": "tool_use", "id": "toolu_1", "name": "GrepTool", "input": {"pattern": "login", "glob": "**/*.ts"}},
  {"type": "tool_use", "id": "toolu_2", "name": "GrepTool", "input": {"pattern": "authenticate", "glob": "**/*.ts"}}
]
```
Claude 可以在同一轮响应中**一边说话，一边发起工具调用**。

### 43个内置工具
| 类别 | 工具 |
|------|------|
| 文件 I/O | FileReadTool, FileEditTool, FileWriteTool, NotebookEditTool |
| 搜索 | GlobTool, GrepTool |
| 执行 | BashTool |
| Web | WebFetchTool, WebSearchTool |
| Agents | AgentTool, SendMessageTool |
| 任务 | TaskCreateTool, TaskGetTool, TaskUpdateTool, TaskListTool |
| 规划 | EnterPlanModeTool, ExitPlanModeTool |
| 用户交互 | AskUserTool |
| 技能 | SkillTool |
| MCP | ListMcpResourcesTool, ReadMcpResourceTool |

## 步骤4：权限检查
### 四层判断机制
```
工具调用进来
    ↓
1. 命中拒绝规则 → 直接拦掉
    ↓
2. 命中允许规则 → 直接放行
    ↓
3. Bash 分类器 → 异步判断（最多等 2 秒）
    ↓
4. 交互提示 → 询问用户
```
配置示例：
```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "BashTool(grep:*)"],
    "deny": ["BashTool(rm -rf:*)"]
  }
}
```

### 分类器判断逻辑
| 判断结果 | 行为 |
|----------|------|
| 只读操作（如 `git status`、`ls`） | 直接放行 |
| 有风险操作（如 `rm`、`git push --force`） | 交给用户确认 |
| 2秒内无法判断 | 进入交互提示 |

### 不同工具的通过路径
| 工具调用 | 层1拒绝 | 层2允许 | 层3分类器 | 层4询问 | 结果 |
|----------|---------|---------|-----------|---------|------|
| GrepTool("login") | 通过 | 命中允许规则 | - | - | 自动通过 |
| BashTool("git status") | 通过 | 通过 | 判断为只读 | - | 自动通过 |
| BashTool("rm -rf /") | 命中拒绝规则 | - | - | - | 直接拦截 |
| FileEditTool("app.ts") | 通过 | 通过 | 通过 | 需要确认 | 弹出提示 |
| BashTool("npm install") | 通过 | 通过 | 不确定（超时） | 需要确认 | 弹出提示 |

## 步骤5：工具执行
### 工具统一接口
```typescript
type Tool = {
  name: string
  description(input, context): string
  inputSchema: ZodSchema
  execute(input, context): Promise<ToolUseResult>
  isConcurrencySafe(input): boolean  // 关键：标记能否并发执行
  isReadOnly(input): boolean
}
```

### 并发/串行执行策略
执行前先看 `isConcurrencySafe()` 标记：

- **只读操作**：并发执行（默认最多10个并行）
- **写操作**：串行执行，避免冲突

### 实际效果
- 一次要读多个文件 → 同时进行
- 一旦涉及改文件 → 串行执行

## 深度分析
### Agent Harness 是真正的工程壁垒
Claude Code 泄露事件最反直觉的发现：**LLM API 调用只是一行代码**——真正区分生产级 Agent 和概念验证的，是围绕它精心设计的 Harness 系统。Harness 负责：上下文组装、响应解析、权限检查、工具执行、状态管理、错误恢复。这套系统跨越 1900+ TypeScript 文件，51万+ 行代码，远超 LLM 本身。这说明 AI Agent 的核心竞争力不在模型，而在 **模型与工具/环境交互的工程实现**。

### 上下文缓存的分层策略
系统提示词按「跨用户共享」vs「会话私有」划分，核心动机是 **降低 API 成本**。缓存部分（环境信息、工具说明、编码规范）跨用户复用，只算一次；非缓存部分（MCP 指令）每轮重新计算。`SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 这个边界标记设计得很巧妙——它是 API 层面全局缓存和会话层面动态更新的交界线。这种分层思路适用于任何 Agent 系统：不变部分最大程度复用，变化部分精确控制。

### State 对象的时间维度
每轮循环中的 State 对象不是静态数据结构，而是 **携带时间维度的时间胶囊**：压缩上下文后的 messages、token 超限后的重试计数、工具执行后更新的能力范围。每一轮的决策都会影响下一轮——这是一个马尔可夫链式的逐步推理过程。理解 State 的传递机制，才能理解 Agent 为何能在多轮对话中保持连贯性并逐步完成复杂任务。

### 权限设计的纵深防御
四层权限检查（拒绝→允许→分类器→询问）体现了 **纵深防御** 思想：最外层用规则快速过滤明显危险操作（`rm -rf`），中间层用分类器判断意图（2秒超时内的启发式判断），最内层保留用户交互确认。这种设计不依赖单一信任边界，而是每一层都可能是最后一次拦截机会。分类器的 2 秒超时设计也很有意思——它本质上是 **在用户体验和安全之间取平衡**：给分类器一个合理的时间窗口，超时就交给用户，而不是让用户永远等待。

### 工具并发的读写分离
`isConcurrencySafe()` 标记决定工具是否可以并发执行，这是一个 **读写分离策略**：读操作（Glob、Grep、Read）天然幂等，可以并行；写操作（Edit、Write）必须串行以避免冲突。这个设计比简单的「所有操作串行」高效得多，因为它允许 Agent 在探索阶段（读大量文件）时充分并行，而在修改阶段才切换到串行。并发度上限（默认10）也是工程折中——太高可能触发 API 限流或文件锁竞争。

### 技能发现的预算约束
技能描述占上下文 ≤1%、每个 ≤250 字符的硬限制，体现了 **上下文窗口是稀缺资源** 的认知。Agent 不可能把所有技能定义都塞进提示词，必须在「发现能力」和「保留推理空间」之间取平衡。按需加载（`ToolSearchTool` 获取详细定义）是经典的空间换时间策略。这种约束设计值得所有 Agent 开发者借鉴：技能系统必须自带预算控制，否则上下文会在不知不觉中被技能描述填满。

## 实践启示
### 构建自己的 Agent Harness
从 Claude Code 的架构可以学到，Agent 开发应该先问「Harness 怎么设计」再问「模型用什么」。具体而言：
1. **明确工具接口**：定义 `Tool` 类型，包含 `execute` 和 `isConcurrencySafe`
2. **设计上下文组装流程**：哪些是缓存部分，哪些是动态部分
3. **实现 State 管理**：每轮循环如何读写 State，状态如何传递
4. **建立错误恢复机制**：API 超时、工具失败、上下文超载如何处理

### 设计权限系统的 Checklist
在实现任何涉及文件修改或命令执行的 Agent 时，参考四层权限模型：

- **拒绝规则**：先写黑名单（`rm -rf`、`git push --force` 等高危操作）
- **允许规则**：再写白名单（只读操作自动放行）
- **分类器**：对介于两者之间的操作实现启发式判断（读操作 vs 写操作）
- **用户交互**：分类器无法判断时保留确认环节，绝不静默执行

### 应用 CLAUDE.md 的四级加载逻辑
在自己的 Agent 项目中实现类似的层级加载机制：
1. 系统级配置放在 `/etc/your-agent/`（团队共享）
2. 用户级配置放在 `~/.your-agent/`（个人偏好）
3. 项目级配置放在项目根目录（团队项目规范）
4. 本地级配置用 `.gitignore` 排除（本地开发用，不提交）
`@include` 指令的设计也值得借鉴——可以把长配置拆分成多个文件，主配置文件通过 `@include` 引用，保持主文件简洁。

### 上下文缓存的工程实现
如果你的 Agent 系统有多个用户或多个会话，参考 Claude Code 的缓存策略：

- **可缓存内容**：操作系统信息、项目结构、工具说明文档——这些对所有用户都一样
- **不可缓存内容**：MCP 服务状态、会话历史、用户特定的记忆
- **边界标记**：`SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 这种显式边界比隐式约定更可靠

### 并发策略的实际应用
在实现工具执行层时，不要简单选择「全部串行」或「全部并行」：

- **读操作**：用 `Promise.all()` 并发执行，设置并发上限（如 10）
- **写操作**：用队列保证串行，避免文件冲突
- **混合场景**：先并行读获取信息，再串行写执行修改

### 技能系统的预算设计
如果要为自己的 Agent 实现技能/插件系统，提前设计预算约束：

- **总量上限**：所有技能描述之和不超过上下文的 X%（建议 1-5%）
- **单个上限**：每个技能描述不超过 Y 字符（建议 100-250）
- **按需加载**：详细定义不直接在提示词里，通过搜索工具获取

## 关联
- [Managed Agents Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/managed-agents-architecture.md) — Anthropic Managed Agents 架构
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness Engineering 框架
## 相关实体
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](ch03/045-agent.md)
- [Anthropic 12 Mcp Production Patterns](ch01/855-anthropic.md)
- [Anthropic Dreaming Claude Managed Agents Ovz5V7Jjkqdksu9Xmxwt8W](ch03/045-agent.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道 V2](ch03/075-claude-code.md)
- [Harness Design Long Running Apps](ch05/009-harness.md)

---

