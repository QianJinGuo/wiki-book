# 深入理解 Claude Code 源码中的 Agent Harness 构建之道

## Ch01.260 深入理解 Claude Code 源码中的 Agent Harness 构建之道

> 📊 Level ⭐⭐ | 27.6KB | `entities/深入理解-claude-code-源码中的-agent-harness-构建之道-v2.md`

# 深入理解 Claude Code 源码中的 Agent Harness 构建之道

> 来源：技术极简主义，2026-04-08，基于 Claude Code 源码泄露事件（npm 打包未排除 .map 文件 → 1900+ TS 文件、51 万行核心代码意外曝光 → GitHub 数小时 1100+ star）
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/深入理解-claude-code-源码中的-agent-harness-构建之道-v2.md)

## 摘要

借助 Anthropic Claude Code 源码泄露事件，文章沿着一个请求的完整生命周期（用户输入消息 → Agent 交付可工作代码）拆解每个环节。**核心断言**："LLM 调用本身只是一行代码，真正让 Agent 可用的是围绕这行代码精心设计的 Agent Harness。" 整个系统由 `query()` 异步生成器函数驱动，循环 8 个步骤直到任务完成。

## 核心要点

- **Harness 的核心循环**：`query()` 异步生成器函数 + 8 个步骤（上下文组装 → API 调用 → 解析响应 → 检查权限 → 执行工具 → 反馈结果 → 上下文检查 → 终止）
- **上下文组装 = 多层叠加**：系统提示词（11 个分段 + 缓存边界 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`）+ CLAUDE.md 4 级加载（系统 → 用户 → 项目 → 本地）+ 记忆 + 任务 + MCP 指令 + 技能发现 + 对话历史
- **CLAUDE.md 4 级优先级 + @include 5 层深度**：从根目录向下遍历，最近文件最高优先级；`@include` 语法让一个 CLAUDE.md 拉入另一个文件
- **完整上下文 token 预算实测**：系统提示词 ~15K + CLAUDE.md ~2K + 记忆 ~500 + MCP ~300 + 历史 ~5K + 用户消息 ~10
- **Skill 预算控制**：所有技能描述加起来最多占上下文的 1%（200K 模型约 2000 tokens），每个技能描述 ≤ 250 字符
- **工具执行策略**：只读操作并行执行，写操作串行执行（避免冲突）
- **权限分级**：拒绝规则 → 允许规则 → 分类器 → 询问用户
- **三层上下文压缩策略**：微压缩（每轮，处理解释性内容）+ 会话记忆压缩（替换最早对话历史为 `CompactBoundaryMessage`）+ 反应式压缩（`prompt_too_long` 错误触发）
- **断路器防护**：`MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3` —— 注释记录曾有 1,279 个会话连续失败 3,000+ 次，每天浪费 ~25 万次 API 调用
- **8 种终止原因 + 4 类错误恢复**：max_turns / aborted_streaming / aborted_tools / prompt_too_long / model_error / blocking_limit / hook_stopped / completed
- **Plan Mode 设计哲学**：**不是靠"限制工具"而是靠"提示词引导行为"**——有节制地出现完整/简化/跳过
- **Tasks 系统**：JSON 文件持久化 + blocks/blockedBy 依赖图 + 跨 Agent 共享任务列表（按团队）+ 定期 reminder 把 Agent 拉回正轨
- **子智能体三种隔离模式**：同 CWD / Worktree（独立 git worktree，可合并）/ 后台（异步）
- **递归复杂度可控**：子智能体是缩小版 query() 循环，使用相同工具/权限/压缩逻辑，无独立 Agent runner

## 深度分析

### 一、源码泄露事件背景

2026 年初，Anthropic 旗下闭源 AI 编程工具 Claude Code 因 npm 打包**未排除 .map 映射文件**，导致 **1900+ TypeScript 文件、超 51 万行核心代码意外曝光**。这是迄今为止生产级 AI Agent 系统最完整的一次公开审视，也让外界验证此前对 Claude Code 架构的推断，同时窥见诸多未发布的核心功能与底层设计逻辑。

### 二、8 步核心循环详解

整个 Agent 由 `query.ts` 中的 `query()` 异步生成器函数驱动，**代码库中的其他所有内容都为这个函数服务**。这是核心架构决策——将 Agent 执行逻辑从传统"调用-返回"模式转为"生成-迭代"模式，更适合处理长时运行的复杂任务。

**步骤 1：上下文组装（最复杂的一步）**

系统提示词通过 `buildEffectiveSystemPrompt()` 函数拼接，**不是简单字符串而是 11 个分段**（介绍 / 系统 / 执行任务 / 操作 / 使用工具 / 语调风格 / 会话指导 / 记忆 CLAUDE.md / 环境 / MCP 指令 / 总结结果）。

**核心工程考量：缓存优化**——所有分段按"是否缓存"分类：

| 缓存 | 分段 | 说明 |
|---|---|---|
| ✅ 缓存 | 介绍 / 系统 / 执行任务 / 操作 / 使用工具 / 语调和风格 / 会话指导 / 记忆 / 环境 / 总结结果 | 只算一次，每轮直接复用；`/clear` 或 `/compact` 才重新生成 |
| ❌ 不缓存 | MCP 指令 | 每一轮重新计算（连接状态可能变化）|

边界用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 标记——边界前可用 API 全局缓存（跨用户共享），边界后是会话特定的。这是避免每轮重算整个 prompt 的巧妙方式。

**CLAUDE.md 4 级加载顺序**：

`getMemoryFiles()` 从当前工作目录**向上遍历到文件系统根目录**，在每个级别收集指令文件。加载顺序（**最近文件最高优先级**）：
1. **系统级**：`/etc/claude-code/CLAUDE.md` + `/etc/claude-code/.claude/rules/*.md`（企业托管）
2. **用户级**：`~/.claude/CLAUDE.md` + `~/.claude/rules/*.md`（个人偏好）
3. **项目级**：根目录到当前工作目录的每个目录加载 `CLAUDE.md` / `.claude/CLAUDE.md` / `.claude/rules/*.md`
4. **本地级**：每层 `CLAUDE.local.md`（`.gitignore`，不提交）

每个文件解析时剥离 HTML 注释 + 解析 `@include` 指令（最多 5 层深度）。`@include` 让一个 CLAUDE.md 拉入另一个文件：

```
# CLAUDE.md
See our API conventions:
@./docs/api-conventions.md
And our testing standards:
@./docs/testing.md
```

整个函数带缓存（会话里只跑一次），对 `git worktree` 做了处理避免重复加载。

**完整上下文包**：

`getAttachmentMessages()` 拉取其他所有内容：记忆文件（`~/.claude/projects/<slug>/memory/MEMORY.md`）+ 任务/待办列表 + MCP 服务器指令 + 技能发现结果 + 对话历史。

**实际 token 预算示例**（用户输入"修复登录 bug"）：
- 系统提示词：~15,000 tokens（角色、规则、工具、环境）
- CLAUDE.md 文件：~2,000 tokens（项目指令）
- 记忆：~500 tokens（过往会话相关记忆）
- MCP 指令：~300 tokens（已连接服务器文档）
- 对话历史：~5,000 tokens（当前会话前几轮）
- 用户消息：~10 tokens

**核心断言**："上下文不只是'你的消息'。它是你的消息 + 项目规则 + 个人偏好 + Agent 记忆 + 对话历史。" 这是**上下文工程的实践，也是 Agent 成败的关键因素**。

**Skill 预算控制**：

所有技能描述加起来最多占上下文的 **1%**（200K 模型约 2000 tokens），每个技能描述不能超过 **250 个字符**。避免技能列表把上下文撑满。

### 三、工具执行与权限

**步骤 2-3：API 调用 + 解析响应**

流式传输通过异步生成器，响应解析为文本块 + `tool_use` 块。

**步骤 4：权限检查（4 级流水线）**

拒绝规则 → 允许规则 → 分类器 → 询问用户。读操作默认放行，写操作需要确认或额外判断。

**步骤 5：工具执行（并行/串行策略）**

**只读操作并行执行，写操作串行执行**——避免冲突。Claude Code 偏好自己的 `FileReadTool` 而非 bash 中 `cat` 的原因不是模型偏好，而是**系统提示词中的明确指令**：

```
Do NOT use the Bash tool to run commands when a relevant dedicated tool is provided:
  - To read files use Read instead of cat, head, tail, or sed
  - To edit files use Edit instead of sed or awk
  - To create files use Write instead of cat with heredoc
  - To search for files use Glob instead of find or ls
  - To search file contents use Grep instead of grep or rg
```

**步骤 6：结果反馈**

每个工具结果变成一条 `user` 消息，里面带 `tool_result` 内容块 + `toolUseID`（对应之前那次工具调用）。Claude 拿到结果后决定下一步：读具体文件、直接修改还是继续补充更多上下文。

**每轮之间系统还会悄悄做"补充上下文"工作**：
- 重新跑 `getAttachmentMessages()` 看有无新记忆文件或任务更新
- 如果后台记忆预取完成，把结果加进来
- 如果技能发现找到更相关工具或技能，补进上下文

上下文**不是一成不变的，而是在每一轮之间不断增长**。

### 四、上下文管理的三层压缩策略

每跑完一轮检查"现在的上下文有多大了"——当距离上限还剩约 **13,000 tokens**（默认值）时触发压缩。

**微压缩（每轮发生）**：处理工具调用之间的"解释性内容"——工具的输入/输出保留，中间冗长解释被压缩成更短总结。

**会话记忆压缩（主要策略）**：直接对"更早的对话历史"下手——把整段对话总结成一条精简信息，用单个 `CompactBoundaryMessage` 替换原始消息。一条摘要消息可直接替代掉几十条历史消息：

```
[CompactBoundaryMessage]
"用户要求修复登录 bug。我查看了 src/auth/ 相关代码，
包括 login.ts、middleware.ts 和 types.ts。
问题出在 login.ts 第 58 行缺少空检查，用户查询可能返回 undefined。
用户已确认这个判断是正确的。"
```

**反应式压缩（兜底策略）**：API 因 `prompt_too_long` 拒绝请求时立刻捕获，当场做一次压缩，重建请求再试一遍。

**工具调用也会被总结**：Claude 连续跑很多工具（一堆 grep + 一批文件读取）时，系统在后台生成精简版本（"在整个代码库中搜索 X，在 A、B、C 文件中找到相关实现"）。上下文紧张时摘要直接替换冗长工具输出。

**断路器（防失控）**：

```js
// Stop trying autocompact after this many consecutive failures.
// BQ 2026-03-10: 1,279 sessions had 50+ consecutive failures
// (up to 3,272) in a single session, wasting ~250K API calls/day globally.
const MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3
```

注释记录的真实教训：**1,279 个会话**在压缩失败后还在不断重试，有的甚至一个会话里连续失败 **3,000+ 次**，每天白白浪费约 **25 万次 API 调用**。解决办法是连续失败 3 次后不再尝试自动压缩，防止无限循环或大量浪费 API 调用。

### 五、终止与错误恢复

**8 种终止原因**：`completed`（正常）/ `max_turns`（强制收住）/ `aborted_streaming`（用户 Ctrl+C）/ `aborted_tools`（工具被中断）/ `prompt_too_long`（压缩策略失败）/ `model_error`（模型报错）/ `blocking_limit`（禁用自动压缩时硬限制）/ `hook_stopped`（外部钩子要求停止）

**4 类错误恢复**：

| 错误类型 | 恢复策略 |
|---|---|
| 提示太长 | 先"轻量清理"删细节保留结构；还不行就整段摘要压缩；再不行才报错退出 |
| 输出 token 超限 | 提高输出上限重试；从中断处继续生成，最多 3 次；写不完返回当前已有内容 |
| 服务器过载（529） | 前台指数退避重试；后台任务（摘要/分类/记忆）不重试避免放大压力 |
| 模型回退 | 主模型一直 529 → 切换备用模型；切换时清理当前状态、标记未完成、用新模型重跑 |

### 六、高级特性：先思考后行动

真实任务不是线性的——"重构认证系统"涉及几十个文件、多轮分析和修改。Claude Code 为此提供两个关键能力：

**Plan Mode：规划模式**

本质是权限系统里的"状态切换"——`toolPermissionContext.mode` 切到 `'plan'`，原模式存 `prePlanMode` 方便恢复。**但真正的变化不在权限而在行为引导**：技术上什么都没被关掉（Claude 仍能用所有工具、还能改文件），但系统在上下文里加一段明确提示：

```
在计划模式下，你应该按照以下步骤操作：
1. 仔细浏览代码库，了解已有的模式和结构
2. 找出类似功能或架构方案
3. 思考多种实现方式及其利弊
4. 如有需要，使用 AskUserQuestion 澄清方法
5. 制定具体的实施策略
6. 准备好后，用 ExitPlanMode 提交你的计划以供批准
注意：在这个阶段不要编写或修改任何文件，这是一个纯粹的只读探索和规划阶段。
```

**核心设计哲学**：不是靠"限制工具"，而是靠"提示词引导行为"。

**计划批准流程**：Claude 把计划保存成文件并在调用 `ExitPlanMode` 时展示给用户确认。用户明确同意后，系统恢复到进入计划模式之前的权限状态，同时把"已批准的计划"重新塞回上下文。

**有节制地出现**：计划模式提示不是每轮都重塞——有时候给完整提醒、有时候给简化版本、最近刚提醒过就这一轮跳过。**目的：避免规划提示反复出现把上下文撑爆**。

**Tasks：任务系统**

一组围绕"任务状态"的工具：`TaskCreateTool` / `TaskGetTool` / `TaskUpdateTool` / `TaskListTool`。所有任务存成 JSON 文件落磁盘（轻量"外部记忆"）：

```
{
  id: string,
  subject: string,
  description: string,
  status: 'pending' | 'in_progress' | 'completed',
  blocks: string[],      // 此任务阻止的任务 ID
  blockedBy: string[],   // 阻止此任务的任务 ID
  owner: string,         // 哪个 agent 拥有此任务
}
```

任务间可建立依赖关系（`blocks` / `blockedBy` 形成依赖图），避免顺序错乱。

**定期 reminder**：`getTaskReminderAttachments()` 检查 Agent 已经多久没碰任务系统了——时间久了就往上下文塞提醒"你现在有 3 个待处理任务，1 个进行中"，把 Agent 拉回正轨。

**多 Agent 协作**：任务系统不只是单人用——多 Agent 共享同一份任务列表（按团队，而不是按会话）；谁接手任务就被标记为 owner；任务重新分配时新负责人收到内部通知。**这套机制同时解决"我做到哪了"和"我们团队各自在做什么"**。

**Plan Mode + Tasks 融入循环**：不改变循环结构，只是在循环内部工作——`EnterPlanMode` / `TaskCreate` / 任务更新 / 退出计划模式**全是工具调用**。在步骤 1 上下文组装时把当前 Plan Mode 状态 + 任务进度一起带上。

**核心设计模式**："**Agent 用自己的工具，来管理自己的工作**"——不是在外部系统里被调度，而是在对话里一边思考、一边行动、一边更新自己的状态。

### 七、子智能体的递归与隔离

`AgentTool` 接收提示词、可选 agent 类型和隔离设置：

```js
const baseInputSchema = z.object({
  description: z.string().describe('A short (3-5 word) description'),
  prompt: z.string().describe('The task for the agent to perform'),
  subagent_type: z.string().optional(),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional(),
  run_in_background: z.boolean().optional(),
})
```

调用 `AgentTool` 启动**全新的循环**：
- 子智能体有自己独立的 `query()` 循环
- 它有自己的消息历史，不直接干扰主智能体
- 它有自己的工具上下文，只允许访问一部分工具
- 子智能体不能无限制地产生更多子智能体，也不能调用某些敏感或受限工具

**三种隔离模式**：

| 模式 | 用途 | 工作机制 |
|---|---|---|
| **同 CWD** | 访问父级文件的研究或分析任务 | 子智能体和父智能体使用相同工作目录 |
| **Worktree** | 实验性修改可合并可清理 | 子智能体在仓库中有自己的 `git worktree` 副本，自由修改不影响父智能体；有用就合并主分支，不需要就自动清理 |
| **后台** | 异步研究不阻塞主任务 | 子智能体在后台异步运行，父智能体继续自己的任务并在子智能体完成时收到通知 |

**递归复杂度可控的 3 个保证**：

1. 没有单独的"Agent 运行器"或"任务执行器"需要管理——子智能体是缩小版 `query()` 循环，使用相同工具/权限/上下文压缩逻辑
2. 顶层循环的压缩和错误恢复策略同样适用于子智能体
3. 每个子智能体都是父循环的一部分，不引入不可控的复杂性

**核心结论**：递归的边界很清楚——子智能体的行为完全在父循环管理之下。

### 八、Harness 的工程价值

从用户发送消息到整个 Agent 循环完成，Claude Code 展示了完整 Agent 执行框架的设计：
- **上下文组装**：系统提示词 + CLAUDE.md + 持久记忆 + 技能
- **异步循环**：流式返回 + 工具调用/状态更新在后台并行
- **工具体系**：内置工具 + MCP 工具统一走同一套权限机制
- **权限控制**：读操作默认放行，写操作需确认或额外判断
- **执行策略**：读操作并发，写操作串行
- **反馈循环**：工具结果回到上下文影响后续决策
- **长会话处理**：多种压缩策略控制上下文长度
- **错误恢复**：不同问题类型都有兜底机制
- **递归子智能体**：支持递归但范围/权限受控

**结语断言**："Claude Code 更像一个完整的 Agent 执行框架，而不是简单的对话工具。它把规划、执行、反馈这些环节串成一个闭环，让复杂任务可以自动推进，同时又不至于失控。" **做 AI Agent 的精力会花在 Harness 上——这才是最有价值的地方**。

## 实践启示

- **缓存边界是关键优化**：用 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 之类的标记把不变/变化部分分开，最大化 prompt cache 复用
- **CLAUDE.md 4 级优先级**：系统 → 用户 → 项目 → 本地，最近文件覆盖更远；用 `@include` 5 层深度组装大文档
- **Skill 预算硬控制**：所有技能描述加起来 ≤ 上下文 1%，每个技能描述 ≤ 250 字符
- **工具偏好靠提示词而非模型训练**：用 `FileReadTool` 而非 `cat` 是在系统提示词里写明的规则
- **执行策略区分读/写**：只读操作并行执行，写操作串行执行（避免冲突）
- **上下文压缩分三层**：微压缩（每轮）+ 会话记忆压缩（替换最早历史）+ 反应式压缩（兜底）
- **必须设断路器**：防止 `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES` 类无限循环（曾浪费 25 万 API 调用/天）
- **Plan Mode 用提示词引导而非限制工具**：技术上限权开放，但通过明确指令"现在先探索不要修改"实现行为约束
- **Tasks 系统做轻量外部记忆**：JSON 文件落磁盘 + blocks/blockedBy 依赖图 + 定期 reminder
- **子智能体三种隔离模式**：同 CWD（研究分析）/ Worktree（实验修改）/ 后台（异步不阻塞）
- **递归必须可控**：子智能体用相同工具/权限/压缩逻辑，无独立 runner，复杂度上限与父循环相同

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 本文是 Harness Engineering 的具体源码实现验证
- [Claude Code 深度解析](../ch05/060-claude-code-harness.md) — Claude Code 架构的另一次深度解读
- [Claude Code Dynamic Workflows](../ch09/078-claude-code-dynamic-workflows.md) — AgentTool 子智能体 + Dynamic Workflow 范式
- [Claude Code 架构](../ch03/075-claude-code.md) — Claude Code 整体架构概览
- [Agent Evolution 四阶段六维](../ch03/045-agent.md) — 阶段三/阶段四对应 Claude Code 的生产实践
- [OpenClaw 完整指南](../ch11/213-openclaw.md) — 开源对应物（Worktree 隔离模式实现）
- [Harness Engineering 一文](../ch05/092-harness-engineering.md) — Harness 概念的系统阐释
- [四种 Sub Agent 模式](../ch03/045-agent.md) — AgentTool 子智能体的几种编排模式
- [Agent YAML 评测](../ch03/045-agent.md) — Harness 第五层评估与观测的工程实现

---

