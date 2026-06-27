# Claude Code 源码核心机制详解

## Ch01.177 Claude Code 源码核心机制详解

> 📊 Level ⭐⭐ | 31.5KB | `entities/claude-code-core-internals.md`

## 核心设计亮点
1. **动态 System Prompt** — 运行时由 `buildEffectiveSystemPrompt` 函数动态组装，包含6层优先级：基础行为契约 → 工具描述（每个工具独立 prompt() 方法） → MCP 指令 → Skill 索引 → 环境信息 → ToolSearch 提示。禁用某个工具后其描述自动从 prompt 消失。动态 System Prompt 组装
2. **多维度工具调度** — 每个工具声明 `isConcurrencySafe()` 决定是否能并发执行。调度层用 `partitionToolCalls()` 按并发安全性分批，只读工具合并为 `Promise.all` 并发，写操作单独串行。支持延迟加载（`shouldDefer` + `ToolSearch`），通过 `searchHint` 评分匹配。
3. **五层递进式 Context 压缩** — 从最轻量的工具结果预算到最重的 autoCompact（fork 子 Agent 生成摘要），逐层兜底。阈值与模型 context window 动态绑定。特别值得关注的是 microCompact 利用 Anthropic API 的 `cache_edits` 参数在服务端屏蔽旧工具结果而不修改本地消息，保持 prompt cache 命中。五层 Context 压缩机制
4. **Sub-Agent 单一入口 + 7 种模式** — `AgentTool` 统一入口，通过参数组合路由到不同模式。同步前台/异步后台（120s 自动转后台）/Worktree 隔离/远端执行/Fork 模式（继承完整对话历史+字节级 system prompt，保证 prompt cache 命中）/Teammate 模式（独立 tmux session + 双向通信）。
5. **权限系统四模式 + 渐进式升级** — default/auto/plan/bypassPermissions。权限拒绝在连续 3 次或累计 20 次后自动升级到询问用户，防止死循环。
6. **24 种 Hook 事件** — 唯一具备完整 Hooks 系统的框架。PreToolUse 可拦截/修改工具调用，PostToolUse 可改写结果。三级配置层级（Managed > User > Project），`--no-hooks` 一键禁用。
7. **CLAUDE.md 四级记忆** — 递归向上发现，深层目录覆盖浅层。支持跨会话学习——模型可主动写入。CLAUDE.md 记忆系统
8. **MCP 完整原生实现** — 唯一完整实现 MCP 的框架。工具以 `mcp__server__tool` 格式注册，共享所有内置工具机制（并发/权限/预算）。支持资源访问和 OAuth。MCP 集成模式

## 跨框架对比总结
| 维度 | Claude Code | Codex | OpenCode | Gemini-CLI |
|------|------------|-------|----------|------------|
| System Prompt | 动态组装(6层) | 静态模板 | 静态文件 | 静态模板 |
| 工具并发 | 自动(isConcurrencySafe) | 不支持 | batch工具(手动) | 自动 |
| 延迟加载 | ✅ shouldDefer+ToolSearch | ❌ | ❌ | ❌ |
| Context压缩 | 5层递进 | 2层 | 1层 | 3层 |
| Sub-Agent模式 | 7种 | 3种 | 2种 | 3种 |
| Hooks | 24种事件 | ❌ | ❌ | ❌ |
| MCP | 完整原生 | ❌ | ❌ | ❌ |
| 预算维度 | 4维(Token/成本/结果/轮次) | 1维(轮次) | 0 | 1维(轮次) |
| 记忆系统 | CLAUDE.md(4级递归) | AGENTS.md(项目级) | ❌ | GEMINI.md(项目级) |

## 1. System Prompt 动态组装
大多数 AI 编程工具的 system prompt 是一段写死的文本，启动时原样注入，整个会话中保持不变。Claude Code 的做法不同——它的 system prompt 是**运行时动态组装**的，每次会话启动时由 `buildEffectiveSystemPrompt` 函数现场构建，最终内容取决于当前环境、工具集、MCP 连接状态，以及用户的配置覆盖。

### 默认 Prompt 写了什么
默认 system prompt（来自 `constants/prompts.ts`）可以理解为一份"行为契约"，规定了模型的操作准则：

- **工具优先**：明确要求优先使用专用工具（Read/Grep/Glob）而不是 bash 等效命令，因为专用工具有更好的权限管控和结果格式
- **输出风格**：要求简洁直接，禁用 emoji、填充词、不必要的确认语，不重复用户说过的话——目的是减少噪音 token，让模型输出更凝练
- **Memory 机制**：告知 CLAUDE.md 的自动发现路径（`~/.claude/CLAUDE.md` → 项目根目录 → 子目录）以及写入规范
- **Git 安全协议**：对 force push、`reset --hard` 等危险操作明确要求用户显式授权才能执行
- **Skill 调用说明**：描述 slash command（`/<skill-name>`）的使用方式

### 运行时动态注入
在基础 prompt 之外，还有一批内容在每次会话启动时现场注入，而非硬编码在 prompt 文本中：

- **工具描述**：遍历所有当前启用工具的 `prompt()` 方法，将每个工具的说明动态拼入。这意味着禁用某个工具后，它的描述也会同步从 prompt 中消失
- **MCP 服务器指令**：如果当前连接了 MCP 服务器，服务器的使用说明会通过 `getMcpInstructionsDeltaAttachment()` 注入，Compact 压缩后也会重新注入
- **Skill 索引**：已安装的 skill 的 name/description/whenToUse 字段会汇总注入，让模型知道当前会话可以调用哪些 slash command
- **环境信息**：当前平台、日期、工作目录等通过 `enhanceSystemPromptWithEnvDetails()` 注入，让模型有基本的运行时感知
- **ToolSearch 提示**：当延迟加载工具功能开启时，prompt 中会追加说明，告知模型如何通过 `ToolSearch` 工具发现尚未加载的工具

## 2. 工具系统
Claude Code 共约 45 个工具，分布在 `src/tools/` 下的 40+ 个子目录。每个工具是一个独立模块，除了实现核心逻辑外，还要声明自己的并发安全性、最大结果大小、权限检查逻辑，以及是否延迟加载。

### 并发调度：isConcurrencySafe
每个工具通过 `isConcurrencySafe(input)` 方法向调度层声明自己是否可以与其他工具并发执行。只读操作（Glob、Grep、Read、WebSearch 等）返回 `true`，任何写操作返回 `false`。
调度层拿到模型一次输出的多个工具调用后，先用 `partitionToolCalls()` 按照并发安全性连续分批：只读工具连续出现时合并成一批用 `Promise.all` 并发执行，写操作单独串行执行。批次之间严格顺序，不跨批并发。
最大并发数默认 10，可通过 `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` 环境变量覆盖。

### 延迟加载：shouldDefer + ToolSearch
设置了 `shouldDefer: true` 的工具（如 `EnterPlanMode`）和所有 MCP 工具，在初始请求中**完全不携带 schema**——API 的 `tools` 数组里这些工具只有一个带 `defer_loading: true` 标记的空壳，参数描述一概不发。模型调用 `ToolSearch` 工具搜索关键词后，框架才把对应工具的完整 schema 加入后续请求。
ToolSearch 的搜索逻辑：每个延迟工具可以声明一个 `searchHint` 字段——一句 3~10 词的能力描述，作为关键词匹配的高权重来源。匹配时，`searchHint` 命中得 4 分，工具名命中得 2 分，完整 prompt 描述命中得 1 分。

### 工具结果大小控制
每个工具声明 `maxResultSizeChars`（字符数上限）。工具执行后，调度层检查结果大小：超出上限时，结果自动持久化到磁盘，模型收到的是一段文件路径引用而非完整内容。`Read` 工具设为 `Infinity`（不持久化），原因是如果读文件结果也被替换成路径引用，模型要读它就会进入"读文件→结果是路径→再读"的死循环。

## 3. 仓库目录树感知
Codex 会在每次会话启动时自动生成并注入两层深度的目录树，OpenCode 在代码里用 `&& false` 硬编码禁用了这个功能，Claude Code 则走了另一条路——**不注入目录树，但注入 git 状态**。
每轮用户消息发出前，`getUserContext` 函数都会把当前的 git 上下文作为前缀附加到消息上：当前分支名、最近几条 commit 记录、`git status` 工作区变更（最多 2000 字符）。这些信息随每轮对话持续更新，而非只在会话启动时注入一次。
设计判断：**目录树是静态快照，git 状态是动态的执行背景**。对于编程任务来说，"当前改了哪些文件"比"目录里有哪些文件"更有决策价值。

## 4. Plan 模式
大多数框架的 Plan 模式本质是 prompt 层面的约束——在系统提示里加一句"只读探索，不要写文件"，靠模型自觉遵守。Claude Code 的约束**落在权限系统层面**：进入 Plan 模式时，`toolPermissionContext.mode` 被置为 `'plan'`，写操作在权限检查阶段就被拦截，不依赖模型是否"听话"。
Plan 模式有三个触发入口：模型主动调用 `EnterPlanMode` 工具（需先通过 ToolSearch 发现）、启动时通过 `--mode plan` 参数指定、用户在 UI 中手动切换。
退出与审批：模型完成规划后调用 `ExitPlanMode`，系统会将规划内容写入 `.claude/plans/` 下的 Markdown 文件，并在 UI 层面弹出审批对话框。**用户必须在 UI 中显式点击批准**，才能将权限模式从 `'plan'` 恢复为原始模式并进入执行阶段。

## 5. Context 压缩管理
Claude Code 的 context 压缩机制是四个框架里**层次最多、设计最细**的。

### 动态触发阈值
Claude Code 的压缩触发阈值**与当前模型的 context window 动态绑定**。触发公式大致是：`context window - 输出保留空间(20K) - buffer(13K)`。以 claude-sonnet（200K context window）为例，自动压缩约在 167K token 时触发。

### 五层压缩机制
每轮 LLM 调用前，`query.ts` 主循环按顺序执行五道压缩处理：
1. **工具结果预算（applyToolResultBudget）**：最轻量，当工具返回结果超过 `maxResultSizeChars` 上限时，结果写入磁盘并替换为文件路径引用
2. **历史片段截断（snipCompact，feature-gated）**：不调用 LLM，通过规则对历史消息打分，将评分低的消息标记为"可删除"
3. **微压缩（microCompact，feature-gated）**：核心思路是**不修改本地消息，而是利用 Anthropic API 的 `cache_edits` 参数在服务端删除旧工具结果**。有两种触发模式：

   - **时间触发（Time-based）**：距离上次 assistant 消息超过 60 分钟，直接修改本地消息
   - **热缓存模式（Cached）**：通过 `cache_edits` 在服务端对旧工具结果做注意力屏蔽（attention mask = 0），本地消息不动，cache 继续命中
4. **上下文折叠（contextCollapse，feature-gated）**：将旧的对话内容折叠成摘要，但保留最近轮次的原始粒度，比 autoCompact 保留更多近期上下文精度
5. **完整摘要压缩（autoCompact）**：最重的一层，通过 fork 一个子 Agent 调用 LLM 生成完整对话摘要

## 6. Sub-Agent 系统
Claude Code 的 sub-agent 系统用单一入口 `AgentTool` 统一管理所有子 Agent 的启动。

### 七种执行模式
| 执行模式 | 触发条件 | 特点 |
|---|---|---|
| 同步前台 | 默认（`run_in_background: false`） | 阻塞等待结果，结果直接返回给父 Agent |
| 异步后台 | `run_in_background: true` | 立即返回 agent ID，父 Agent 通过 `TaskOutput` 轮询结果 |
| 自动转后台 | 运行超过 120 秒 | 自动切换为后台，通知用户 |
| Worktree 隔离 | `isolation: 'worktree'` | 创建临时 git worktree，Agent 在独立副本上操作 |
| 远端执行 | `isolation: 'remote'` | 在云端远程环境运行 |
| Fork 模式 | subagent_type 省略（实验性） | 继承父 Agent 的完整对话历史和 system prompt 字节级副本 |
| Teammate 模式 | agent swarms 功能开启，指定 `name` | 在独立 tmux session 中运行，可通过 `SendMessage` 双向通信 |

### 内置 Agent 类型
| 类型 | 工具集范围 | 适用场景 |
|---|---|---|
| general-purpose（默认） | 所有工具（除 AgentTool 本身） | 通用复杂任务 |
| Explore | 只读工具 | 代码库探索与搜索 |
| Plan | 只读工具 + ExitPlanMode | 规划阶段 |
| claude-code-guide | Read / Grep / WebSearch | 回答 Claude Code 使用问题 |

## 7. 权限与治理系统
Claude Code 的权限系统以 `toolPermissionContext.mode` 字段为核心，支持四种模式：
| 模式 | 行为 | 适用场景 |
|---|---|---|
| `default` | 每次工具调用前弹出确认对话框 | 交互式 IDE 使用 |
| `auto` | AI 分类器自动判断是否放行，不弹框 | 自动化/CI 场景 |
| `plan` | 只读操作自动放行，写操作拦截 | 规划阶段 |
| `bypassPermissions` | 跳过所有权限检查 | 明确授权的完全自动化场景 |

### 静态规则：Allow / Deny / Ask
用户可以配置细粒度的静态规则，支持**工具名 + 参数 glob 模式**的组合：

- `alwaysAllow`：匹配的工具调用直接放行
- `alwaysDeny`：匹配的调用直接拒绝
- `alwaysAsk`：匹配的调用始终询问用户

### AI 安全分类器（Auto Mode）
`auto` 模式下的分类器**是一次真正的 AI 模型调用**，不是规则匹配。系统向 Claude（Opus）发起分类请求，由模型判断操作是否需要阻止。
**两阶段分类设计**：

- **Stage 1（快速阶段）**：max_tokens=64，只要求模型输出 `<block>yes/no</block>`。如果判定为"不阻止"，立即返回
- **Stage 2（思考阶段）**：max_tokens=4096，模型在 `<thinking>` 标签中进行链式推理，再输出最终决定
35+ 个明确安全的工具（Read、Glob、Grep、WebSearch、TaskCreate 等）被加入白名单，调用前不走分类器，直接放行。

### Worktree 隔离（沙箱机制）
Claude Code 通过 git worktree 为 Agent 提供**文件系统级别的隔离沙箱**。子 Agent 的所有文件操作都发生在隔离副本上，主工作区完全不受影响。

## 8. Hooks 系统
Hooks 是 Claude Code 区别于其他框架最显著的能力之一，在整个生命周期的关键节点开放了外部介入的接口。

### 功能
- **拦截工具调用**：`PreToolUse` hook 返回 `decision: 'block'`，阻止工具执行
- **修改工具输入**：`PreToolUse` hook 返回 `updatedInput`，替换模型传入的参数
- **注入上下文**：返回 `additionalContext`，这段文字会作为额外信息传给模型
- **修改工具输出**：`PostToolUse` hook 返回 `updatedMCPToolOutput`，可以改写 MCP 工具的返回结果
- **替换初始消息**：`SessionStart` hook 返回 `initialUserMessage`
- **终止会话**：任意 hook 返回 `continue: false` 即可停止整个 Agent 循环

### 24 种 Hook 事件
| 类别 | 事件 |
|---|---|
| 生命周期 | SessionStart / SessionEnd / Setup / Stop / StopFailure |
| 工具 | PreToolUse / PostToolUse / PostToolUseFailure |
| 权限 | PermissionRequest / PermissionDenied |
| Sub-Agent | SubagentStart / SubagentStop / TeammateIdle |
| 用户交互 | UserPromptSubmit / Notification |
| 压缩 | PreCompact / PostCompact |
| 任务 | TaskCreated / TaskCompleted |
| 系统 | ConfigChange / CwdChanged / FileChanged / InstructionsLoaded |
| MCP | Elicitation / ElicitationResult |

## 9. CLAUDE.md 记忆系统
CLAUDE.md 是 Claude Code 的持久化记忆载体。会话启动时，系统自动按固定路径顺序扫描并加载所有找到的 CLAUDE.md 文件：
1. `~/.claude/CLAUDE.md` — 全局用户级，跨所有项目生效
2. 项目根目录的 `CLAUDE.md` — 项目级
3. 当前工作目录的 `CLAUDE.md` — 目录级
4. 当前目录到项目根之间所有父目录的 `CLAUDE.md` — 递归向上查找
**越深层的目录越晚注入**，在内容冲突时相当于覆盖上层规则。
模型可以在任务执行中主动往 CLAUDE.md 里写内容，实现真正意义上的跨会话学习。

## 10. 状态持久化与会话恢复
Claude Code 将每次会话的完整 transcript 以 JSONL 格式持久化到 `~/.claude/projects/<project_hash>/` 目录，每行一条 JSON 记录。

### Session 存储内容
| 记录类型 | 内容 |
|---|---|
| `user` / `assistant` | 对话消息，含 thinking blocks 和工具调用的 input/output |
| `system` (subtype: `compact_boundary`) | 压缩边界标记，含压缩前 token 数、触发方式 |
| `system` (subtype: `microcompact_boundary`) | 微压缩边界，含节省的 token 数 |
| `summary` | autoCompact 生成的摘要内容 |
| `content-replacement` | 工具结果超限后的磁盘替换记录 |
| `worktree-state` | Worktree 状态记录 |
**System prompt 不存储在 transcript 中**。动态组装的部分在每次恢复时重新生成。

### 跨会话恢复（/resume）
用户执行 `/resume <session_id>` 后，系统按以下顺序重建会话状态：
1. **确定读取范围**：找到 JSONL 中最后一个 `compact_boundary` 记录的位置，只加载该边界之后的消息
2. **重建对话链**：按 `parentUuid` 字段构建消息的有向无环图
3. **恢复应用状态**：从 transcript 中的各类记录恢复运行时状态
4. **重新注入动态内容**：System prompt 重新动态组装，attachments 重新注入

## 11. MCP 协议集成
MCP（Model Context Protocol）是 Anthropic 提出的开放协议。Claude Code 是四个框架中**唯一对 MCP 有完整原生实现**的。

### 动态工具扩展
MCP 最核心的能力是让第三方工具服务器向 Claude Code **动态注册新工具**。连接 MCP 服务器后，工具以 `mcp__<serverName>__<toolName>` 格式出现，与内置工具共享完全相同的调用机制——包括并发调度、权限检查、结果大小限制等。
MCP 工具默认支持延迟加载，可为特定工具标记 `alwaysLoad = true` 使其始终出现在初始 system prompt 中。

### 资源访问
除工具外，MCP 服务器还可以提供**资源**（文件、数据库记录、API 响应等结构化数据）。`ListMcpResources` 工具列出当前可用资源列表，`ReadMcpResource` 读取指定资源内容。

### 认证与交互
`McpAuth` 工具处理需要 OAuth 等认证流程的 MCP 服务器。MCP Elicitation 协议允许服务器在执行过程中请求用户输入，框架通过 `Elicitation` / `ElicitationResult` hooks 路由这些交互请求。

## 12. 预算管理
Claude Code 把预算管理拆成了**四个独立的控制维度**：
| 维度 | 说明 |
|---|---|
| Token 预算 | 通过 `output_config.task_budget` 参数设置整个 agentic turn 的 token 总用量上限 |
| 成本预算 | `maxBudgetUsd` 参数设置单次会话的最大美元成本上限 |
| 工具结果预算 | 每个工具通过 `maxResultSizeChars` 声明单次结果的字符数上限 |
| 轮次预算 | `maxTurns` 参数限制 Agent 循环的最大迭代次数 |
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-source-deep-dive-warrior.md)

## 深度分析
### 设计哲学：动态大于静态
Claude Code 的核心设计哲学可以归结为一句话：**运行时决策优于编译时决策**。大多数框架选择静态配置是因为简单——写死一段 prompt，启动时注入，整个会话不变——但这意味着框架无法感知环境变化。Claude Code 的动态 System Prompt 实际上是让框架具备了"环境感知"能力：工具集变了，prompt 就变；MCP 连接状态变了，prompt 就变；用户配置变了，prompt 就变。这种实时感知让 Claude Code 可以在不重启的情况下适应上下文变化，而静态框架必须重启。

### 微压缩（microCompact）的核心洞察：缓存失效才是真正的敌人
microCompact 是整个设计中最反直觉的一层。它的核心洞察不是"如何删除更多 token"，而是"如何删除 token 但不破坏 prompt cache"。很多人第一反应是：删除旧内容后直接修改本地消息序列不就完了？但这样做的代价是 cache 全部失效，下次请求要从头计算。Claude Code 发现了一个关键平衡点：服务端通过 `cache_edits` 做 attention mask = 0 的屏蔽，本地消息不动，cache 的 KV 矩阵保持不变，物理 token 序列不变但有效上下文减少。这背后的数学原理是：如果被屏蔽的 token 过多，softmax 分到的注意力太小，精度误差会被放大——所以 microCompact 不能清理所有内容，只能选择性地清理部分工具结果。

### 子 Agent 设计：隔离与复用的平衡
Claude Code 的 Sub-Agent 系统展示了隔离与复用之间的精细平衡。普通子 Agent 共享父 Agent 的文件读取缓存（MCP 连接信息等），但 Fork 模式更进一步——继承完整的对话历史和字节级 system prompt 副本。后者保证了 prompt cache 命中，但代价是两者深度耦合，任何一方的 context 变化都会影响另一方。这种设计暗示了一个隐式原则：**当子 Agent 需要与父 Agent 保持高度一致时用 Fork；当子 Agent 需要独立探索时用普通模式**。

### 权限系统的渐进升级：防止死循环的安全阀
权限拒绝的渐进式升级机制（连续3次/累计20次触发询问用户）是 Claude Code 设计中最实用的细节之一。这不是预防 AI 分类器判断错误的问题，而是解决了一个根本矛盾：AI 分类器无法理解任务的全貌，对需要人工确认的操作反复拒绝会导致 Agent 永远无法推进。这个设计把"决策"这件事从模型手里还给了人，同时又保留了自动化的效率——只有死循环发生时才升级，其他时候安静放行。

### Hooks 系统的双面性：可扩展性 vs 评测公平性
Hooks 系统是 Claude Code 区别于其他框架最显著的能力，但它同时也是评测公平性的最大威胁。`PreToolUse` 可修改工具输入使模型看到的参数与实际不符，`PostToolUse` 可修改 MCP 工具输出影响模型决策。这个设计本质上是把框架变成了一个**可插拔的平台**——任何人都可以通过 Hooks 改变 Agent 行为，但这种灵活性在基准测试中会成为干扰变量。对于希望对标评测的团队，使用 `--no-hooks` 模式是基本要求。

## 实践启示
### 对于 Agent 开发者
1. **优先实现动态 System Prompt**：工具描述应该从静态文本改为运行时汇总。这不只关乎灵活性——当工具集随 MCP 扩展到数十个时，静态 prompt 的 token 浪费会变得无法接受。
2. **为并发调度设计工具接口**：每个工具都应该声明自己的并发安全性（`isConcurrencySafe`）。这个设计让并发优化变成框架层的事，而不是工具层的事，大幅降低了工具开发者的心智负担。
3. **延迟加载是必须的**：随着工具数量增长，初始 schema 的 token 消耗会超过模型的处理能力。`defer_loading` + `ToolSearch` 的组合是一个经过验证的解决方案，关键是确保工具发现状态不污染 prompt cache（前缀必须稳定）。
4. **分层压缩而非单一压缩**：Claude Code 的五层压缩设计说明了一个道理——没有一种压缩策略适合所有场景。时间触发适合长间隔操作，热缓存模式适合短间隔高频调用，contextCollapse 适合需要保留近期精度的场景。设计压缩系统时，应该让不同层级的策略互相兜底而非互相竞争。

### 对于框架架构师
5. **Plan 模式的权限约束优于 Prompt 约束**：靠模型"自觉"遵守只读约束是不可靠的——Claude Code 把权限检查落到 `toolPermissionContext.mode` 层面，在检查阶段拦截写操作，而非依赖模型遵循指令。这应该成为 Plan 模式的标配实现。
6. **子 Agent 的 context 共享需要明确策略**：不是所有子 Agent 都应该继承父 Agent 的完整历史。Fork 模式适合需要保持上下文一致性的场景（复杂任务的拆解），普通模式适合需要独立探索的场景（代码库调研）。设计 Sub-Agent 系统时，需要让调用者明确选择共享策略。
7. **Session 持久化应该只存消息，动态内容重新生成**：Claude Code 的 transcript 只存消息序列，System prompt 不存，重新恢复时动态组装。这个设计避免了版本不一致的问题，也减少了存储的复杂度。
8. **AI 分类器需要两阶段设计**：快速阶段（max_tokens=64）+ 详细阶段（max_tokens=4096）的组合在安全性和延迟之间取得了平衡。单一阶段的分类器要么太慢（总是跑完整推理），要么太快（无法处理复杂判断）。

### 对于使用 Claude Code 的团队
9. **充分利用 CLAUDE.md 的多层继承**：在项目根目录写通用约束，在子目录写具体场景约束。越深的目录越晚注入，等于覆盖上层。这种设计让单个项目可以同时管理全局规范和局部特殊需求。
10. **Hooks 是定制化能力的核心**：如果需要在 Claude Code 上构建企业级治理（审计、合规）、安全过滤、或领域特定的干预逻辑，Hooks 是唯一的入口。设计好 `PreToolUse` / `PostToolUse` 的响应格式，可以实现完全无感的运行时干预。
11. **预算管理要组合使用多个维度**：Token 预算、成本预算、工具结果预算、轮次预算四个维度各有用途。Token 预算适合控制单次响应长度；成本预算适合 CI 场景的支出上限；工具结果预算防止单个工具结果吞噬 context；轮次预算防止失控循环。四维组合才能覆盖真实的边界情况。

## 相关实体
- [Lessons from Building Claude Code: Seeing like an Agent](/ch01-396-claude-code-core-developer-lessons-action-space-design/)
- Claude Code vs OpenClaw Agent 记忆系统对比
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](/ch09-039-claude-md-12-条规则-karpathy-扩展模板/)
- Claude Code Subagent 上下文卫生
- [深度拆解 Claude Code 12 个可复用的 Agentic Harness 设计模式](/ch04-090-深度拆解-claude-code-12-个可复用的-agentic-harness-设计模式/)
- [Claude Code 架构深度解析](/ch01-846-claude-code-架构深度解析/)
- [From Agent Protocol to Harness Skill](/ch04-351-from-agent-protocol-to-harness-skill/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-367-claude-code-harness-deep-understanding/)
- [两万字详解Claude Code源码核心机制](/ch09-056-两万字详解claude-code源码核心机制/)
- [Agent Harness 架构](/ch04-207-agent-harness-架构/)
- [Claude Code 设计原则与对照分析](/ch01-403-claude-code-设计原则与对照分析/)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](/ch07-006-claude-code-skills-mcp-rules-source-analysis/)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](/ch01-240-claude-code-源码拆解-从启动到多-agent-扩展层/)
- [Claude Code MCP Server](/ch07-024-claude-code-mcp-server/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-126-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Harness如何支撑Agent在生产环境稳定运行？](/ch04-127-harness如何支撑agent在生产环境稳定运行/)
- [Agent架构关键变化：Harness正在成为新后端](/ch04-027-agent架构关键变化-harness正在成为新后端/)
- [claude-code-7-layer-memory-architecture](/ch01-857-claude-code-7-layer-memory-architecture/)
- [17种Agent架构演进：控制流设计的完整演化史](/ch04-507-17种agent架构演进-控制流设计的完整演化史/)
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](/ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端/)
- [gsd-get-shit-done-context-management-tool](/ch01-184-gsd-get-shit-done-context-management-tool/)
- [AgentMemory](/ch09-034-agentmemory/)
- [AI Agent 工程师能力地图](/ch04-139-ai-agent-工程师能力地图/)
- [钉钉 stream + cli 代理双引擎 ai 助手架构](/ch04-076-钉钉-stream-cli-代理双引擎-ai-助手架构/)
- MOC

---

