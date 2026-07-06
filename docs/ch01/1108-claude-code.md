# Claude Code 架构深度解析

## Ch01.1108 Claude Code 架构深度解析

> 📊 Level ⭐⭐⭐ | 33.2KB | `entities/claude-code-deep-architecture-analysis.md`

# Claude Code 架构深度解析
> **来源**: (技术分析)
> **URL**: https://mp.weixin.qq.com/s/bMjXlD-OcnFW-wuN1yW8FA
> **SHA256**: eabd5a01b9faaffa55299117dd40fbe5104969a63f1ecb277138fe1a4e3d76b5
> **参考**: 源码分析级深度
---

## 文章核心
Claude Code 源码级架构深度解析——工具并发机制、延迟加载与 prefix cache 优化、权限系统、Plan 模式实现、Context 压缩多层机制、git 状态注入 vs 目录树注入策略、四大框架横向对比。
---

## 一、工具并发机制
### 批次执行策略
严格顺序，不跨批并发。模型一次输出 `[Glob, Grep, Read, FileEdit, Glob, Read]` 六个工具调用，实际执行顺序：

- **批次 1**：[Glob, Grep, Read] — 并发执行
- **批次 2**：[FileEdit] — 串行执行（写操作）
- **批次 3**：[Glob, Read] — 并发执行

### 最大并发数
默认 **10**，可通过 `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` 环境变量覆盖。

### 设计影响
模型需要在单次回复中同时发出多个只读工具调用，才能充分利用并发能力。如果模型习惯每次只发出一个工具调用，并发机制等于没有。
---

## 二、延迟加载：shouldDefer + ToolSearch
### 机制
设置了 `shouldDefer: true` 的工具（如 `EnterPlanMode`）和所有 MCP 工具，在初始请求中**完全不携带 schema**——API 的 `tools` 数组里只有一个带 `defer_loading: true` 标记的空壳，参数描述一概不发。

### ToolSearch 搜索逻辑
每个延迟工具可声明 `searchHint` 字段（3~10 词能力描述），匹配得分：

- `searchHint` 命中 → **4 分**
- 工具名命中 → **2 分**
- 完整 prompt 描述命中 → **1 分**
搜索结果按得分排序返回工具名列表。

### 返回格式
`ToolSearch` 的 `tool_result` 里不是普通文本，而是若干个 `tool_reference` 内容块，每块只携带一个工具名。框架通过扫描消息历史里的 `tool_reference` 块来追踪"已发现工具集合"。
---

## 三、Prefix Cache 优化：deferred_tools_delta
### 问题
延迟工具的发现状态随会话推进变化（越来越多工具被发现）。如果把"当前已发现工具列表"动态插入消息流，消息序列每次都不同，prefix cache 就失效了。

### 早期方案（失效）
把已发现工具名列表拼成 `<available-deferred-tools>` 块插入第一条用户消息前面 → 工具池每变一次 cache 就全废一次。

### 现在的方案：deferred_tools_delta
工具发现信息通过一个**独立的 attachment** 发送，不修改消息流。系统提示和消息历史都保持稳定，attachment 作为增量附加在固定位置。prefix 始终不变，cache 持续命中。

### Compact 边界处理
框架会在 compact boundary 的元数据中快照当前已发现的工具集合，确保压缩后 resume 时不会丢失发现状态。
---

## 四、工具结果大小控制
每个工具声明 `maxResultSizeChars`（字符数上限）。调度层检查结果大小：

- 超出上限 → 结果**自动持久化到磁盘**，模型收到的是文件路径引用而非完整内容
- `Read` 工具设为 `Infinity`（不持久化）——否则会陷入"读文件→结果是路径→再读"死循环
被替换内容通过 `contentReplacementState` 跨轮次追踪，Compact 压缩后可按需恢复。
---

## 五、权限检查
每个工具有独立的 `checkPermissions()` 方法。调度层调用 `canUseTool` 函数，结合：

- 当前权限模式
- alwaysAllow/alwaysDeny 规则
- Hooks 系统
最终产生三种结果：**自动放行 / 询问用户 / 直接拦截**。
---

## 六、仓库目录树感知
### 三种框架策略对比
| 框架 | 注入方式 | 说明 |
|------|---------|------|
| **Claude Code** | 不注入目录树，注入 git 状态 | user context 前缀每轮更新；按需探索 |
| **Codex** | 自动生成 2 层目录树 | user prompt，每目录 ≤20 条目 |
| **OpenCode** | 硬编码禁用 | `&& false` 强制跳过 |
| **Gemini-CLI** | 不注入目录树，注入 git 工作流指引 | system prompt 静态注入 |

### Claude Code 的设计判断
> "目录树是静态快照，git 状态是动态的执行背景。对于编程任务来说，'当前改了哪些文件'比'目录里有哪些文件'更有决策价值。" 
目录结构由模型在需要时通过 Glob/Grep/Read 主动探索，按需获取，不占用固定 token 预算。
**代价**：对于不熟悉主动探索范式的模型，第一轮可能需要额外工具调用来建立代码库基本认知。
---

## 七、Plan 模式
### Claude Code 的权限层约束
其他框架的 Plan 模式 = prompt 层面约束（系统提示加"只读"指令，靠模型自觉遵守）。
Claude Code 的 Plan 模式 = **权限系统层面约束**：

- 进入 Plan 模式时，`toolPermissionContext.mode` 被置为 `'plan'`
- 写操作在权限检查阶段就被**拦截**，不依赖模型是否"听话"

### 进入方式
1. 模型主动调用 `EnterPlanMode` 工具（`shouldDefer: true`，需先通过 ToolSearch 发现）
2. 启动时通过 `--mode plan` 参数指定
3. 用户在 UI 中手动切换

### 子 Agent 限制
**禁止在子 Agent 中使用 Plan 模式**——子 Agent 无法弹出 UI 审批对话框，进入后将永远无法退出。

### 退出与审批
`ExitPlanMode` → 规划内容写入 `.claude/plans/` Markdown 文件 → UI 弹出审批对话框 → 用户显式批准 → 权限模式恢复为原始模式并进入执行阶段。
**这是 Claude Code 中唯一强制要求用户手动介入的环节。**

### 四大框架对比
| 特性 | Claude Code | Codex | OpenCode | Gemini-CLI |
|------|------------|-------|----------|-----------|
| 只读约束实现 | 权限系统层面 | prompt 指令 | 推理预算切换 | 工具白名单 |
| 工具发现方式 | 需 ToolSearch 发现 | 直接可用 | 直接可用 | 直接可用 |
| 子 Agent 中可用 | 否（直接异常） | 不适用 | 不适用 | 不适用 |
| 退出需用户批准 | 是（UI 审批） | 否 | 是 | 是 |
---

## 八、工具总览
### 文件操作
- `Read` — 读取文件内容，支持行偏移、图片、PDF，并发安全
- `Edit` — 精确字符串替换（old_string → new_string），写操作串行
- `Write` — 写入/覆盖整个文件，写操作串行
- `Glob` — glob 模式匹配，结果按修改时间排序，并发安全
- `Grep` — ripgrep 正则搜索，支持内容/文件列表/计数三种输出模式
- `NotebookEdit` — Jupyter notebook cell 级别编辑

### Shell
- `Bash` — 持久化 shell 会话，跨调用保留工作目录和环境变量，支持后台运行

### Multi-Agent
- `Agent` — 启动子 Agent，支持同步/异步/后台/worktree隔离/远端多种执行模式
- `SendMessage` — 向已命名的 teammate Agent 发送消息（Agent swarms 模式）
- `TeamCreate` / `TeamDelete` — 创建/删除 Agent 团队

### 规划
- `EnterPlanMode` — 进入规划模式，`shouldDefer: true`，需 ToolSearch 发现
- `ExitPlanMode` — 提交规划方案，触发 UI 审批

### 任务追踪
- `TaskCreate` / `TaskUpdate` / `TaskGet` / `TaskList` / `TaskOutput` / `TaskStop`
- `TodoWrite` — 轻量 todo 列表管理

### 搜索 & 网络
- `WebSearch` — 网络搜索，返回结构化结果
- `WebFetch` — 抓取 URL 内容转换为 markdown
- `ToolSearch` — 搜索延迟加载工具

### MCP
- `MCPTool` — 调用 MCP 服务器注册的外部工具
- `ListMcpResources` / `ReadMcpResource` / `McpAuth`

### 高级功能
- `LSP` — 语言服务器协议工具（跳转定义、查找引用）
- `EnterWorktree` / `ExitWorktree` — git worktree 隔离
- `CronCreate` / `CronDelete` / `CronList` — 定时任务
- `RemoteTrigger` — 远端触发器
- `Sleep` — 等待指定时长
---

## 九、深度分析
### 架构哲学：最小化了什么，强化了什么
Claude Code 的架构选择了一条与主流不同的路：不注入目录树，不做全局代码索引，放弃工具的预发现（延迟加载）。这些"减法"背后是对 agent 行为模式的深层假设——模型应该**按需探索**，而不是被给予全景图。
这种设计的优势在于降低了上下文门槛：无论代码库多大，首轮 prompt 的系统开销都是稳定的。但代价同样明显：如果模型缺乏主动探索的本能，它会在前几轮陷入"盲目调用"的困境。

### 工具系统的并发模型：批次 vs 乱序
当前实现中，写操作（Edit/Write）会阻断同批次内的后续工具执行。这实际上是一个保守设计——它假设模型可能在一次回复中混排读写操作，而乱序执行写操作可能导致状态不可预测。
但这个设计引出了一个深层问题：如果模型习惯每次只发一个工具调用，批次并发就形同虚设。这意味着工具系统的效率上限，取决于模型的工具使用模式，而不只取决于框架设计。

### 延迟加载的安全边界
`shouldDefer` 机制初看是性能优化，但它的另一个价值是**安全边界**：不在第一轮暴露所有工具，等于给权限系统留出了介入空间。模型必须通过 ToolSearch 主动"发现"敏感工具，这本身就是一种行为约束。
然而这个机制对模型的搜索能力提出了额外要求——如果模型不理解 ToolSearch 的语义，或者搜索关键词不够精准，延迟工具实际上就变成了不可用工具。

### Plan 模式的权限层实现：最干净的约束机制
在四大框架中，Claude Code 的 Plan 模式是唯一一个在**权限层**实现只读约束的。其他框架依赖模型自觉遵守 prompt 指令，Claude Code 依赖系统拦截。
这个设计的好处是：不怕模型"越界"，因为越界在权限检查阶段就被拦截了。坏处是：Plan 模式无法在子 Agent 中使用，因为子 Agent 无法弹出 UI 审批——这限制了它在多 Agent 场景中的适用性。

### Compact 与状态管理：被忽视的复杂度
工具结果持久化到磁盘、`contentReplacementState` 跨轮追踪、Compact 边界快照——这些设计的存在说明 Claude Code 在认真处理**状态爆炸**问题。但这些机制对使用者完全透明，透明意味着难以调试。
当模型收到一个文件路径而非文件内容时，它是否能正确理解这个引用？当 Compact 压缩后 resume 时，快照恢复的准确性谁来保证？这些问题的答案取决于模型对引用语义的理解程度，而不是框架本身的实现质量。
---

## 十、实践启示
### 对 Agent 开发者的建议
1. **充分利用并发**：如果要发挥 Claude Code 的并发优势，模型需要在单次回复中发出多个只读工具调用。设计 prompt 时可以鼓励"批量探索"而非"逐步发掘"。
2. **主动管理工具发现**：对于延迟加载的工具，提供精准的 `searchHint`（3~10 词）。这是让模型快速发现所需工具的关键。
3. **避免在子 Agent 中使用 Plan 模式**：这是一个硬性限制。如果需要在子任务中做规划，考虑让父 Agent 做规划然后分发任务。
4. **区分 git 状态注入 vs 目录树注入的适用场景**：Claude Code 的设计适合"修改导向"的开发流程；如果你的场景是"全面理解代码结构"，可能需要补充额外的探索逻辑。

### 对工具设计者的建议
1. **写操作串行化**：保守但安全，跨批次的乱序写操作可能导致状态不一致。
2. **延迟加载工具的安全价值**：不只是性能优化，它也是一种访问控制机制。
3. **状态持久化的边界**：把大结果写磁盘而不是塞 context，是一种必要的取舍，但模型需要理解文件路径引用的语义。

### 对评估框架设计者的建议
1. **并发效率的评估**：不能只测单工具调用延迟，需要测多工具并发场景下的吞吐量。
2. **探索能力的评估**：模型是否主动使用 Glob/Grep 建立代码库认知，是一个重要的能力指标。
3. **Plan 模式约束的评估**：验证写操作是否真的在权限层被拦截，而不是依赖模型自觉。
---

## 十一、Context 压缩管理（5层机制）
Claude Code 的 context 压缩机制是四个框架中**层次最多、设计最细**的。每轮 LLM 调用前，系统按顺序经过多道压缩检查，从轻量的工具结果裁剪到完整的摘要重写，逐层递进。

### 动态触发阈值
压缩触发阈值**与当前模型的 context window 动态绑定**：`context window - 输出保留空间(20K) - buffer(13K)`。以 claude-sonnet（200K context）为例，自动压缩约在 167K token 时触发。

### 五层压缩机制
1. **工具结果预算（applyToolResultBudget）**：最轻量，每轮执行。超限结果写入磁盘并替换为文件路径引用，不缩减历史消息。
2. **历史片段截断（snipCompact）**：不调用 LLM，通过规则对历史消息打分，低分消息标记为"可删除"。返回 `tokensFreed` 值传给后续 autoCompact 阈值计算。
3. **微压缩（microCompact）**：利用 Anthropic API 的 `cache_edits` 参数在**服务端**删除旧工具结果，本地消息保持不变。两种模式：时间触发（60分钟后失效）和热缓存模式（attention mask 屏蔽）。
4. **上下文折叠（contextCollapse）**：将旧对话折叠成摘要但**保留近期原始粒度**，不是全部压成一段文字。触发时机：context 用量约 90% 时准备，95% 时阻塞触发。与 autoCompact 互斥。
5. **完整摘要压缩（autoCompact）**：最重一层，通过 fork 子 Agent 调用 LLM 生成完整对话摘要。执行 PreCompact hooks → 预处理消息 → fork 子 Agent 生成摘要 → 替换为 compact boundary + 摘要 + 保留尾部 + 重新注入 attachments → PostCompact hooks。

### Compact 后 attachments 恢复
CLAUDE.md 记忆、MCP 服务器说明等关键背景信息在压缩后作为 attachment 自动重新注入，确保经历多次压缩后不丢失。
---

## 十二、Sub-Agent 系统
Claude Code 的 sub-agent 系统用单一入口 `AgentTool` 统一管理所有子 Agent 启动，是四个框架中**功能最完整、执行模式最丰富**的。

### 七种执行模式
| 模式 | 触发条件 | 特点 |
|------|---------|------|
| 同步前台 | `run_in_background: false`（默认） | 阻塞等待结果 |
| 异步后台 | `run_in_background: true` | 立即返回 agent ID，父 Agent 通过 `TaskOutput` 轮询 |
| 自动转后台 | 运行超过 120 秒 | 自动切换，通知用户 |
| Worktree 隔离 | `isolation: 'worktree'` | 创建临时 git worktree，Agent 在独立副本上操作 |
| 远端执行 | `isolation: 'remote'` | 云端远程环境运行，始终后台 |
| Fork 模式 | `subagent_type` 省略（实验性） | 继承父 Agent 完整对话历史和 system prompt |
| Teammate 模式 | `agent swarms` 功能开启 | 独立 tmux session，可通过 `SendMessage` 双向通信 |

### 内置 Agent 类型
| 类型 | 工具集范围 | 适用场景 |
|------|-----------|---------|
| general-purpose（默认） | 所有工具（除 AgentTool 本身） | 通用复杂任务 |
| Explore | 只读工具（Read/Grep/Glob/WebSearch） | 代码库探索 |
| Plan | 只读工具 + ExitPlanMode | 规划阶段 |
| claude-code-guide | Read/Grep/WebSearch | 回答 Claude Code 使用问题 |
| 用户自定义 | YAML 文件定义 | 项目特定场景 |

### 父子 Context 共享
普通子 Agent 启动时从父 Agent 克隆：文件读取缓存、工具结果预算状态、权限上下文、MCP 连接信息。Fork 模式额外继承**完整对话历史**和**system prompt 字节级副本**（确保 prompt cache 命中）。
---

## 十三、失败处理机制
Claude Code 的失败处理策略整体偏宽松：工具执行失败不中断流程，错误信息直接反馈给模型，由模型自行决策下一步。

### 工具执行错误
单个工具失败不影响同批次其他工具的执行——失败与成功并列传给模型，模型识别失败并决定是否重试。

### API 错误恢复
- **输出 token 超限**：自动重试最多 3 次 
- **请求过长（prompt_too_long）**：先触发 autoCompact 压缩历史再重试；若压缩请求本身也超长，则从历史头部逐条删除最旧消息，最多执行 3 轮截断重试 
- **网络/API 失败**：通过 `withRetry()` 指数退避重试 

### 权限拒绝的渐进式升级
Claude Code 独有机制：当**连续拒绝达 3 次**或**累计拒绝达 20 次**时，`shouldFallbackToPrompting()` 返回 true，系统从"自动拒绝"切换到"询问用户"模式。异步子 Agent 无法弹 UI，拒绝状态单独维护（`localDenialTracking`），触发阈值后只能持续失败。

### 循环检测
Claude Code **没有内置死循环检测**。与 OpenCode（相同工具+参数连续调用 3 次后询问用户）和 Gemini-CLI（注入恢复 prompt → 60 秒后强制终止）不同。唯一兜底：context 接近上限时 autoCompact 压缩历史 + 用户手动 ESC 中断。
---

## 十四、Hooks 系统（Claude Code 独有）
Hooks 是 Claude Code 区别于其他框架最显著的能力之一，是其定位为"可扩展平台"而非单纯命令行工具的关键设计。整个生命周期关键节点开放外部介入接口。

### 功能
Hook 本质是注册在特定事件上的 Shell 脚本或回调函数，通过标准输出返回 JSON 决策：

- **拦截工具调用**：`PreToolUse` hook 返回 `decision: 'block'`
- **修改工具输入**：`PreToolUse` hook 返回 `updatedInput`
- **注入上下文**：返回 `additionalContext` 传给模型
- **修改工具输出**：`PostToolUse` hook 返回 `updatedMCPToolOutput`
- **替换初始消息**：`SessionStart` hook 返回 `initialUserMessage`
- **终止会话**：任意 hook 返回 `continue: false`
- **自动化权限决策**：`PermissionRequest` hook 直接返回 allow/deny

### 24 种 Hook 事件
| 类别 | 事件 |
|------|------|
| Session | SessionStart / SessionEnd / Setup / Stop / StopFailure |
| 工具 | PreToolUse / PostToolUse / PostToolUseFailure |
| 权限 | PermissionRequest / PermissionDenied |
| Sub-Agent | SubagentStart / SubagentStop / TeammateIdle |
| 用户交互 | UserPromptSubmit / Notification |
| 压缩 | PreCompact / PostCompact |
| 任务 | TaskCreated / TaskCompleted |
| 系统 | ConfigChange / CwdChanged / FileChanged / InstructionsLoaded |
| MCP | Elicitation / ElicitationResult |

### 配置与优先级
三个层级：企业管理策略（Managed）> 用户级（`~/.claude/settings.json`）> 项目级（`.claude/settings.json`）。`--no-hooks` 参数可一键禁用所有 hooks。

### 对评测的影响
Hooks 是评测公平性的潜在干扰源：PreToolUse 可修改工具输入，PostToolUse 可修改 MCP 工具输出，UserPromptSubmit 可静默注入额外上下文。对 Claude Code 做基准测试时应使用 `--no-hooks` 模式。
---

## 十五、CLAUDE.md 记忆系统
### 机制说明
CLAUDE.md 是 Claude Code 的持久化记忆载体。会话启动时自动按固定路径顺序扫描并加载：
1. `~/.claude/CLAUDE.md` — 全局用户级，跨所有项目生效
2. 项目根目录的 `CLAUDE.md` — 项目级
3. 当前工作目录的 `CLAUDE.md` — 目录级
4. 当前目录到项目根之间所有父目录的 `CLAUDE.md` — 递归向上查找

越深层目录越晚注入，内容冲突时覆盖上层规则。`InstructionsLoaded` hook 在每次 CLAUDE.md 加载时触发。经历 autoCompact 压缩后，CLAUDE.md 内容作为 attachment 重新注入，保证记忆不丢失。

### 典型用途
- **项目约束**：代码风格规范、禁止修改的目录
- **常用命令**：build / test / lint 命令
- **架构说明**：关键模块职责、模块间依赖关系
- **团队规范**：commit message 格式、PR 流程
- **跨会话记忆**：模型主动写入 CLAUDE.md 记录重要发现，供下次会话复用 

### 与其他框架对比
| 框架 | 记忆机制 | 作用范围 |
|------|---------|---------|
| Claude Code | CLAUDE.md（多层目录，递归发现） | 全局/项目/目录三级 |
| Codex | AGENTS.md | 项目级 |
| Gemini-CLI | GEMINI.md | 项目级 |
| OpenCode | 无专用机制 | — |
---

## 十六、状态持久化与会话恢复
### Session 存储
Claude Code 将每次会话完整 transcript 以 JSONL 格式持久化到 `~/.claude/projects/<project_hash>/` 目录。记录类型包括：

- `user/assistant` 对话消息（含 thinking blocks 和工具调用）
- `system`（subtype: `compact_boundary`）压缩边界标记
- `system`（subtype: `microcompact_boundary`）微压缩边界
- `summary` autoCompact 生成的摘要内容
- `content-replacement` 工具结果超限后的磁盘替换记录
- `file-history-snapshot` 文件修改历史快照
- `worktree-state` Worktree 状态记录

**System prompt 不存储在 transcript 中**，动态组装部分在每次恢复时重新生成。

### Compact 发生时的存储结构
JSONL 不删除历史消息，追加 `compact_boundary` 记录 + 摘要。文件超过 50MB 时，恢复时跳过 compact boundary 之前内容。

### 跨会话恢复（/resume）
1. 确定读取范围：找到最后一个 `compact_boundary` 位置，只加载边界之后消息
2. 重建对话链：按 `parentUuid` 构建消息有向无环图
3. 恢复应用状态：content-replacement、contextCollapse 归档、file-history-snapshot、TodoWrite、worktree-state
4. 重新注入动态内容：system prompt 重新组装，attachments 重新注入
---

## 十七、MCP 协议集成
MCP（Model Context Protocol）是 Anthropic 提出的开放协议。Claude Code 是四个框架中**唯一对 MCP 有完整原生实现**的。

### 动态工具扩展
MCP 服务器提供的工具以 `mcp__<serverName>__<toolName>` 格式出现，与内置工具共享完全相同机制：并发调度、权限检查、结果大小限制。MCP 工具默认支持延迟加载，可标记 `alwaysLoad = true` 使其始终出现在初始工具列表。

### 资源访问
除工具外，MCP 服务器还提供**资源**（文件、数据库记录、API 响应）。`ListMcpResources` 列出可用资源，`ReadMcpResource` 读取内容。

### 认证与交互
`McpAuth` 处理 OAuth 等认证流程。MCP Elicitation 协议允许服务器在执行中请求用户输入，框架通过 `Elicitation`/`ElicitationResult` hooks 路由。

### 服务器配置
在 `settings.json` 中声明 MCP 服务器，支持用户级和项目级两个层级。
---

## 十八、预算管理
Claude Code 把预算管理拆成**四个独立控制维度**，可独立配置或组合使用。
| 维度 | 说明 |
|------|------|
| Token 预算 | 通过 `output_config.task_budget` 设置整个 agentic turn 的 token 总用量上限 |
| 成本预算 | `maxBudgetUsd` 设置单次会话最大美元成本上限 |
| 工具结果预算 | 每个工具通过 `maxResultSizeChars` 声明上限，超限存磁盘并替换为路径引用 |
| 轮次预算（Max Turns） | `maxTurns` 限制 Agent 循环最大迭代次数 |

### 与其他框架对比
| 框架 | Token 预算 | 成本预算 | 工具结果大小限制 | 轮次预算 |
|------|-----------|---------|----------------|---------|
| Claude Code | ✅ | ✅（maxBudgetUsd） | ✅（存磁盘） | ✅ |
| Codex | ❌ | ❌ | 截断（首尾保留） | ✅ |
| OpenCode | ❌ | ❌ | ❌ | ❌ |
| Gemini-CLI | ❌ | ❌ | 截断 | ✅ |
---

## 深度分析

Claude Code 的架构设计折射出一个核心洞察：**Agent 编程工具的本质是一个精密的 Harness 系统，而非简单的模型调用包装器**。其十八个架构模块之间存在清晰的依赖层次和反馈回路，共同支撑"让模型像专业开发者一样工作"这一目标。

**1. 动态 System Prompt 组装 vs 静态模板的根本差异。** Claude Code 的 `buildEffectiveSystemPrompt` 在每次会话启动时动态组装六层内容（默认契约 → 工具描述 → MCP 指令 → Skill 索引 → 环境信息 → ToolSearch 提示），而 Codex/OpenCode 采用静态模板。这一差异在长会话中产生显著的 token 效率分化：Claude Code 的 prompt 内容随会话演进而精准化，静态模板则持续携带冗余的初始化内容。关键在于"工具描述动态注入"——禁用某工具后其描述立即从 prompt 中消失，Codex 则无法做到这一点。

**2. 工具并发调度的批次模型揭示了 LLM 输出模式的硬约束。** 严格顺序执行、批次内部并发的设计并非性能优化的权宜之计，而是对 LLM"先读后写"认知模式的直接映射：读操作（Glob/Grep/Read）可在批次内安全并发，写操作（FileEdit/Write）必须串行以避免状态冲突。这一模型要求模型在单次回复中同时发出多个工具调用才能充分利用并发能力——如果模型习惯单步工具调用，批次调度优势归零。这意味着 Harness 设计必须同时考虑"如何让模型发出批量调用"这一 prompt 工程问题。

**3. 延迟加载 + ToolSearch 机制是解决"工具爆炸"问题的最优工程路径。** 当工具集扩展到数百个时，完整 schema 注入导致上下文膨胀，同时大量工具对当前任务毫无价值。Claude Code 的解决方案——仅发送 `defer_loading: true` 空壳 + 按需 ToolSearch 发现——比 OpenCode 的"全部加载但提示少用"策略更彻底。searchHint 评分机制（4分/2分/1分）是一个精巧的设计：用自然语言描述而非精确名称来发现工具，降低了模型使用门槛，同时通过得分排序控制了 ToolSearch 的结果噪音。

**4. Prefix Cache 优化揭示了 MCP 工具场景下的缓存失效规律。** 延迟工具的逐步发现导致每次消息序列不同，prefix cache 失效——这是 Anthropic 工程师在实现中发现的核心矛盾。通过 `deferred_tools_delta` 差异注入而非完整重注，他们成功将 prefix cache 命中率维持在高位，同时支持工具发现状态的动态演进。这一设计对所有基于 MCP 的 Agent 框架都有参考价值：任何导致消息序列变化的动态内容注入，都需要差异化的缓存策略而非全量刷新。

**5. 预算管理的四维独立控制是生产级 Agent 的必备能力。** Claude Code 的 Token 预算、成本预算、工具结果大小限制、轮次预算四个维度独立配置，与 Codex（仅轮次预算）、OpenCode（无预算控制）、Gemini-CLI（轮次+截断）形成鲜明对比。工具结果超限时存磁盘并替换为路径引用这一设计尤其值得注意：它用文件系统作为溢出存储，将 Agent 的有效上下文从固定内存约束扩展到磁盘容量，是"Memory beyond RAM"思路的工程实践。

## 相关概念
- [Claude Code Source Leak Lifecycle](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-source-leak-lifecycle.md) — Claude Code 源码级生命周期解析（8步 queryLoop / CLAUDE.md 四级加载）
- [Claude Code Tool Design Evolution](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md) — Claude Code 工具设计演进（AskUserQuestion / TodoWrite→Task）
- [Claude Code 源码核心机制详解](ch03/075-claude-code.md)
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](ch03/075-claude-code.md)
- [Claude Code 架构解析](ch03/075-claude-code.md)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md)
- [KAIROS — Claude Code 常驻协作范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/kairos-claude-code-paradigm.md)
- [Anthropic Prompt Caching 深度解析](ch03/075-claude-code.md) — Anthropic 官方博客关于 Prompt Caching 架构经验的深度分析
- [Cat Wu PM 访谈](ch01/855-anthropic.md) — Claude Code/Cowork 产品负责人关于产品节奏、100%自动化原则、模型进化对 Harness 影响的一手访谈
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-deep-architecture-analysis.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](ch03/075-claude-code.md)

## Related
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch05/085-harness.md)

- [Code as Agent Harness 综述](ch09/051-code-as-agent-harness.md)
- [harness-engineering-systematic-explainer](ch04/069-ai.md)
- [Agent 原理、架构与工程实践](ch03/045-agent.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

