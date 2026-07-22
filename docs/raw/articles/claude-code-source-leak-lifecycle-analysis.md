---
title: CLAUDE.md
source_url: https://mp.weixin.qq.com/s/uHbvBbANCU7fHwvGhsr9sw
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: ac1e3b0ab01cb775241e8f5dedbf5189421135904936bae0a5ee5237e058cef7
---
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
# CLAUDE.md
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
| 用户交互 | AskUserQuestionTool |
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
## 关键要点
1. **LLM 调用只是一行代码**——真正让 Agent 可用的是围绕它的 Agent Harness
2. **上下文不只是"你的消息"**——是消息+项目规则+个人偏好+Agent记忆+对话历史
3. **系统提示词分两类**：缓存（跨用户共享）和非缓存（会话特定），用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 分隔
4. **CLAUDE.md 四级加载**：系统→用户→项目→本地，优先级从低到高
5. **技能预算控制**：描述占上下文 ≤1%，每个 ≤250 字符
6. **State 对象串联每轮循环**：每轮决策影响下一轮
7. **权限四层设计**：拒绝→允许→分类器→询问，分类器最多等2秒
8. **isConcurrencySafe 决定并发策略**：只读并行，写操作串行
## 关联
- [[concepts/managed-agents-architecture]] — Anthropic Managed Agents 架构
- [[concepts/harness-engineering-framework]] — Harness Engineering 框架