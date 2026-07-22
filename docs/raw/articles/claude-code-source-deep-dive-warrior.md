---
title: "claude code source deep dive warrior"
source: wechat
source_url: https://mp.weixin.qq.com/s/bMjXlD-OcnFW-wuN1yW8FA
tags: [wechat, article, claude, openai]
feed_name: 炼钢AI
author: 战士金 (炼钢AI)
original_source: 知乎
ingested: 2026-05-09
source_published: 2026-04-01
review_value: 9
review_confidence: 8
review_recommendation: strong
review_stars: 5
type: raw
created: 2026-05-10
updated: 2026-05-10
sha256: 04dd2e3b78b56adc4076fecee16635488f453ab99d12d0ba44f40cd2d471f99b
---
     1|---
     2|source: wechat
     3|source_url: https://mp.weixin.qq.com/s/bMjXlD-OcnFW-wuN1yW8FA
     4|ingested: 2026-05-09
     5|feed_name: 炼钢AI
     6|wechat_mp_fakeid: MP_WXS_3942529661
     7|source_published: 2026-04-01
     8|---
     9|
    10|# 两万字详解Claude Code源码核心机制
    11|
    12|本文对Claude Code的核心机制实现上进行详解，包括system prompt、tool、context管理、sub agent、MCP等。除此之外，在一些模块，会将Claude Code和OpenCode、Gemini-CLI、Codex等其他开源agent脚手架进行横向对比。总体来讲，Claude Code各种机制处理的细致程度还是要比其他开源框架强不少的。
    13|
    14|#  1.System Prompt
    15|
    16|大多数 AI 编程工具的 system prompt 是一段写死的文本，启动时原样注入，整个会话中保持不变。Claude Code 的做法不同——它的 system prompt 是  ** 运行时动态组装  ** 的，每次会话启动时由  ` buildEffectiveSystemPrompt  ` 函数现场构建，最终内容取决于当前环境、工具集、MCP 连接状态，以及用户的配置覆盖。
    17|
    18|##  默认 Prompt 写了什么
    19|
    20|默认 system prompt（来自  ` constants/prompts.ts  ` ）可以理解为一份"行为契约"，规定了模型的操作准则：
    21|
    22|* •  ** 工具优先  ** ：明确要求优先使用专用工具（Read/Grep/Glob）而不是 bash 等效命令，因为专用工具有更好的权限管控和结果格式
    23|* •  ** 输出风格  ** ：要求简洁直接，禁用 emoji、填充词、不必要的确认语，不重复用户说过的话——目的是减少噪音 token，让模型输出更凝练
    24|* •  ** Memory 机制  ** ：告知 CLAUDE.md 的自动发现路径（  ` ~/.claude/CLAUDE.md  ` → 项目根目录 → 子目录）以及写入规范
    25|* •  ** Git 安全协议  ** ：对 force push、  ` reset --hard  ` 等危险操作明确要求用户显式授权才能执行
    26|* •  ** Skill 调用说明  ** ：描述 slash command（  ` /<skill-name> ` ）的使用方式
    27|
    28|##  运行时动态注入
    29|
    30|在基础 prompt 之外，还有一批内容在每次会话启动时现场注入，而非硬编码在 prompt 文本中：
    31|
    32|* •  ** 工具描述  ** ：遍历所有当前启用工具的  ` prompt()  ` 方法，将每个工具的说明动态拼入。这意味着禁用某个工具后，它的描述也会同步从 prompt 中消失
    33|* •  ** MCP 服务器指令  ** ：如果当前连接了 MCP 服务器，服务器的使用说明会通过  ` getMcpInstructionsDeltaAttachment()  ` 注入，Compact 压缩后也会重新注入
    34|* •  ** Skill 索引  ** ：已安装的 skill 的 name/description/whenToUse 字段会汇总注入，让模型知道当前会话可以调用哪些 slash command
    35|* •  ** 环境信息  ** ：当前平台、日期、工作目录等通过  ` enhanceSystemPromptWithEnvDetails()  ` 注入，让模型有基本的运行时感知
    36|* •  ** ToolSearch 提示  ** ：当延迟加载工具功能开启时，prompt 中会追加说明，告知模型如何通过  ` ToolSearch  ` 工具发现尚未加载的工具
    37|
    38|##  与其他框架对比
    39|
    40|特性  |  Claude Code  |  Codex  |  OpenCode  |  Gemini-CLI
    41|---|---|---|---|---
    42|System Prompt 类型  |  动态组装（6层优先级）  |  静态模板  |  按模型选择静态文件  |  静态模板
    43|工具描述注入方式  |  每个工具自带  ` prompt()  ` 方法，运行时汇总  |  静态描述  |  静态描述  |  静态描述
    44|多模型适配  |  通过  ` --agent  ` 定制 prompt  |  不区分  |  6种模型对应不同文件  |  不区分
    45|
    46|#  2.工具
    47|
    48|Claude Code 共约 45 个工具，分布在  ` src/tools/  ` 下的 40+ 个子目录。每个工具是一个独立模块，除了实现核心逻辑外，还要声明自己的并发安全性、最大结果大小、权限检查逻辑，以及是否延迟加载。这套统一接口让工具调度层能在不了解工具内部实现的情况下，统一管理并发、权限和 token 预算。
    49|
    50|##  并发调度：isConcurrencySafe
    51|
    52|每个工具通过  ` isConcurrencySafe(input)  ` 方法向调度层声明自己是否可以与其他工具并发执行。只读操作（Glob、Grep、Read、WebSearch 等）返回  ` true  ` ，任何写操作返回  ` false  ` 。
    53|
    54|调度层拿到模型一次输出的多个工具调用后，先用  ` partitionToolCalls()  ` 按照并发安全性连续分批：只读工具连续出现时合并成一批用  ` Promise.all  ` 并发执行，写操作单独串行执行。批次之间严格顺序，不跨批并发。
    55|
    56|举例：模型一次输出  ` [Glob, Grep, Read, FileEdit, Glob, Read]  ` 六个工具调用，实际执行顺序是：
    57|
    58|* • 批次 1：  ` [Glob, Grep, Read]  ` — 并发执行
    59|* • 批次 2：  ` [FileEdit]  ` — 串行执行
    60|* • 批次 3：  ` [Glob, Read]  ` — 并发执行
    61|
    62|最大并发数默认 10，可通过  ` CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY  ` 环境变量覆盖。
    63|
    64|这个设计对模型的工具调用策略有隐式影响：  ** 模型需要在单次回复中同时发出多个只读工具调用  ** ，才能充分利用并发能力。如果模型习惯每次只发出一个工具调用，并发机制就等于没有。
    65|
    66|##  延迟加载：shouldDefer + ToolSearch
    67|
    68|设置了  ` shouldDefer: true  ` 的工具（如  ` EnterPlanMode  ` ）和所有 MCP 工具，在初始请求中  ** 完全不携带 schema  ** ——API 的  ` tools  ` 数组里这些工具只有一个带  ` defer_loading: true  ` 标记的空壳，参数描述一概不发。模型调用  ` ToolSearch  ` 工具搜索关键词后，框架才把对应工具的完整 schema 加入后续请求。
    69|
    70|这是一个 token 优化手段：工具越多，schema 越占 context。MCP 工具尤其如此，用户可能接入十几个 MCP 服务器，但每次任务只用到其中几个，全量发送浪费严重。
    71|
    72|** ToolSearch 的搜索逻辑  **
    73|
    74|每个延迟工具可以声明一个  ` searchHint  ` 字段——一句 3~10 词的能力描述，作为关键词匹配的高权重来源。匹配时，  ` searchHint  ` 命中得 4 分，工具名命中得 2 分，完整 prompt 描述命中得 1 分。搜索结果按得分排序返回工具名列表。
    75|
    76|` ToolSearch  ` 的返回格式比较特殊——它的  ` tool_result  ` 里不是普通文本，而是若干个  ` tool_reference  ` 内容块，每块只携带一个工具名。API 收到这种响应后，会在下一个请求中自动将这些工具的完整 schema 注入进来。框架通过扫描消息历史里所有  ` tool_reference  ` 块来追踪"已发现工具集合"，每次构建 API 请求时，只有在这个集合里的延迟工具才会携带完整 schema。
    77|
    78|** 如何避免破坏 prefix cache  **
    79|
    80|这里有个棘手的问题：延迟工具的发现状态会随会话推进而变化（越来越多的工具被发现），如果把"当前已发现的工具列表"动态插入到消息流中，消息序列每次都不同，prefix cache 就失效了。
    81|
    82|早期方案确实这样做：把已发现工具名列表拼成  ` <available-deferred-tools> ` 块插入到第一条用户消息前面，结果工具池每变一次 cache 就全废一次。
    83|
    84|现在的方案（  ` deferred_tools_delta  ` ）绕开了这个问题：工具发现信息通过一个独立的  ** attachment  ** 发送，而不是修改消息流。系统提示和消息历史都保持稳定，attachment 作为增量附加在固定位置。即使已发现工具集合在变，消息序列的 prefix 始终不变，cache 持续命中。框架还会在 compact boundary 的元数据中快照当前已发现的工具集合，确保压缩后 resume 时不会丢失发现状态。
    85|
    86|##  工具结果大小控制
    87|
    88|每个工具声明  ` maxResultSizeChars  ` （字符数上限）。工具执行后，调度层检查结果大小：超出上限时，结果自动持久化到磁盘，模型收到的是一段文件路径引用而非完整内容。  ` Read  ` 工具设为  ` Infinity  ` （不持久化），原因是如果读文件结果也被替换成路径引用，模型要读它就会进入"读文件→结果是路径→再读"的死循环。
    89|
    90|被替换的内容通过  ` contentReplacementState  ` 跨轮次追踪，在 Compact 压缩后可以按需恢复。
    91|
    92|##  权限检查
    93|
    94|每个工具有独立的  ` checkPermissions()  ` 方法。在执行前，调度层调用  ` canUseTool  ` 函数，结合当前权限模式、alwaysAllow/alwaysDeny 规则、Hooks 系统共同决策，最终产生三种结果：自动放行、询问用户、直接拦截。
    95|
    96|##  工具总览
    97|
    98|** 文件操作  **
    99|Claude Code将一些常用的shell命令抽象成独立的工具，和直接使用shell工具做操作相比，能降低难度，OpenCode、Gemini-CLI等开源脚手架框架都遵循类似的方法，与之相反的是Codex，除了apply patch接口外，其他文件操作都是走一个shell工具。
   100|
   101|工具名  |  说明
   102|---|---
   103|` Read  ` |  读取文件内容，支持行偏移、图片、PDF，并发安全
   104|` Edit  ` |  精确字符串替换（old_string → new_string），写操作串行
   105|` Write  ` |  写入/覆盖整个文件，写操作串行
   106|` Glob  ` |  glob 模式匹配文件路径，结果按修改时间排序，并发安全
   107|` Grep  ` |  ripgrep 正则搜索，支持内容/文件列表/计数三种输出模式，并发安全
   108|` NotebookEdit  ` |  Jupyter notebook cell 级别编辑（replace/insert/delete）
   109|
   110|** Shell 执行  **
   111|
   112|工具名  |  说明
   113|---|---
   114|` Bash  ` |  持久化 shell 会话，跨调用保留工作目录和环境变量，支持后台运行
   115|
   116|** Multi-Agent  **
   117|
   118|工具名  |  说明
   119|---|---
   120|` Agent  ` |  启动子 Agent 的统一入口，支持同步/异步/后台/worktree隔离/远端多种执行模式
   121|` SendMessage  ` |  向已命名的 teammate Agent 发送消息（Agent swarms 模式）
   122|` TeamCreate  ` /  ` TeamDelete  ` |  创建/删除 Agent 团队，用于 swarms 多 Agent 协作
   123|
   124|** 规划  **
   125|
   126|工具名  |  说明
   127|---|---
   128|` EnterPlanMode  ` |  进入规划模式，触发权限层只读约束；  ` shouldDefer: true  ` ，需通过 ToolSearch 发现
   129|` ExitPlanMode  ` |  提交规划方案，触发 UI 审批对话框，用户批准后才进入执行模式
   130|
   131|** 任务追踪  **
   132|
   133|工具名  |  说明
   134|---|---
   135|` TaskCreate  ` |  创建任务，支持 subject/description/activeForm 字段
   136|` TaskUpdate  ` |  更新任务状态（pending / in_progress / completed / deleted）
   137|` TaskGet  ` |  获取单个任务的完整详情（含 blockedBy 依赖关系）
   138|` TaskList  ` |  列出所有任务及当前状态
   139|` TaskOutput  ` |  获取后台 Agent 任务的输出
   140|` TaskStop  ` |  终止正在运行的后台任务
   141|` TodoWrite  ` |  轻量 todo 列表管理（简化版任务追踪）
   142|
   143|** 用户交互  **
   144|
   145|工具名  |  说明
   146|---|---
   147|` AskUserQuestion  ` |  向用户提问，支持单选/多选/选项预览，最多同时问 4 个问题
   148|
   149|** 搜索 & 网络  **
   150|
   151|工具名  |  说明
   152|---|---
   153|` WebSearch  ` |  网络搜索，返回结构化搜索结果
   154|` WebFetch  ` |  抓取指定 URL 内容，转换为 markdown 后返回
   155|` ToolSearch  ` |  搜索延迟加载工具（  ` shouldDefer: true  ` 的工具的唯一发现入口）
   156|
   157|** MCP  **
   158|
   159|工具名  |  说明
   160|---|---
   161|` MCPTool  ` |  调用 MCP 服务器注册的外部工具（格式：  ` mcp__<server>__<tool> ` ）
   162|` ListMcpResources  ` |  列出 MCP 服务器提供的资源（文件、数据库记录、API 响应等）
   163|` ReadMcpResource  ` |  读取指定 MCP 资源内容
   164|` McpAuth  ` |  处理需要 OAuth 等认证的 MCP 服务器
   165|
   166|** Skill  **
   167|
   168|工具名  |  说明
   169|---|---
   170|` Skill  ` |  执行 skill（slash command  ` /xxx  ` 的底层实现）
   171|
   172|** 高级功能  **
   173|
   174|工具名  |  说明
   175|---|---
   176|` LSP  ` |  语言服务器协议工具，支持跳转定义、查找引用等代码导航操作
   177|` EnterWorktree  ` /  ` ExitWorktree  ` |  创建/退出 git worktree 隔离环境，为当前会话提供独立沙箱
   178|` CronCreate  ` /  ` CronDelete  ` /  ` CronList  ` |  定时任务调度，支持 cron 表达式（feature-gated）
   179|` RemoteTrigger  ` |  远端触发器，调用 claude.ai 远程 API（feature-gated）
   180|` Sleep  ` |  等待指定时长，用于轮询场景（feature-gated）
   181|` REPL  ` |  交互式代码解释器
   182|
   183|##  与其他框架对比
   184|
   185|特性  |  Claude Code  |  Codex  |  OpenCode  |  Gemini-CLI
   186|---|---|---|---|---
   187|工具并发  |  自动（isConcurrencySafe 分批）  |  不支持  |  batch 工具（手动，1-25个）  |  自动
   188|工具延迟加载  |  有（shouldDefer + ToolSearch）  |  无  |  无  |  无
   189|工具结果大小限制  |  有（超限存磁盘，替换为路径引用）  |  截断（首尾保留）  |  无  |  截断
   190|LSP 工具  |  有  |  无  |  有  |  无
   191|语义代码搜索  |  无  |  无  |  有（Exa Code）  |  无
   192|
   193|#  3.仓库目录树感知
   194|
   195|Codex 会在每次会话启动时自动生成并注入两层深度的目录树，OpenCode 在代码里用  ` && false  ` 硬编码禁用了这个功能，Claude Code 则走了另一条路——  ** 不注入目录树，但注入 git 状态  ** 。
   196|
   197|每轮用户消息发出前，  ` getUserContext  ` 函数都会把当前的 git 上下文作为前缀附加到消息上：当前分支名、最近几条 commit 记录、  ` git status  ` 工作区变更（最多 2000 字符）。这些信息随每轮对话持续更新，而非只在会话启动时注入一次。
   198|
   199|这背后有一个设计判断：  ** 目录树是静态快照，git 状态是动态的执行背景  ** 。对于编程任务来说，"当前改了哪些文件"比"目录里有哪些文件"更有决策价值。而目录结构本身，由模型在需要时通过 Glob/Grep/Read 主动探索，按需获取，不占用固定 token 预算。
   200|
   201|代价是：对于不熟悉主动探索范式的模型，第一轮可能需要额外的工具调用来建立代码库的基本认知。
   202|
   203|框架  |  目录树注入方式  |  注入位置  |  说明
   204|---|---|---|---
   205|Claude Code  |  不注入目录树，注入 git 状态  |  user context 前缀（每轮更新）  |  按需探索
   206|Codex  |  自动生成目录树  |  user prompt  |  2 层，每目录 ≤20 条目
   207|OpenCode  |  硬编码禁用  |  —  |  代码中  ` && false  ` 强制跳过
   208|Gemini-CLI  |  不注入目录树，注入 git 工作流指引  |  system prompt  |  静态注入
   209|
   210|#  4.Plan 模式
   211|
   212|大多数框架的 Plan 模式本质是 prompt 层面的约束——在系统提示里加一句"只读探索，不要写文件"，靠模型自觉遵守。Claude Code 的约束  ** 落在权限系统层面  ** ：进入 Plan 模式时，  ` toolPermissionContext.mode  ` 被置为  ` 'plan'  ` ，写操作在权限检查阶段就被拦截，不依赖模型是否"听话"。
   213|
   214|##  进入方式
   215|
   216|Plan 模式有三个触发入口：模型主动调用  ` EnterPlanMode  ` 工具、启动时通过  ` --mode plan  ` 参数指定、用户在 UI 中手动切换。
   217|
   218|其中模型主动调用这条路径有个细节：  ` EnterPlanMode  ` 工具设置了  ` shouldDefer: true  ` ，默认不出现在初始工具列表中，模型需要先通过  ` ToolSearch  ` 发现它才能调用。这意味着模型需要具备一定的"元认知"——主动意识到当前任务复杂度足以进入规划阶段，然后去搜索对应工具。
   219|
   220|` EnterPlanMode  ` 工具被调用后，系统修改权限上下文，同时向模型返回一段明确的指令：在规划阶段应该做什么（探索代码库、理解现有模式、考虑多种方案、有疑问时用  ` AskUserQuestion  ` 澄清），以及明确禁止写文件。
   221|
   222|Plan 模式还有一个硬性限制：  ** 禁止在子 Agent 中使用  ** 。子 Agent 调用  ` EnterPlanMode  ` 会直接抛出异常。理由很直接——子 Agent 无法弹出 UI 审批对话框，进入 plan 模式后将永远无法退出。
   223|
   224|##  退出与审批
   225|
   226|模型完成规划后调用  ` ExitPlanMode  ` ，系统会将规划内容写入  ` .claude/plans/  ` 下的 Markdown 文件，并在 UI 层面弹出审批对话框。  ** 用户必须在 UI 中显式点击批准  ** ，才能将权限模式从  ` 'plan'  ` 恢复为原始模式并进入执行阶段。
   227|
   228|这是整个 Claude Code 流程中唯一强制要求用户手动介入的环节，其他权限判断都可以通过规则或分类器自动化。审批通过后，计划文件路径会存入 session 状态，模型在执行阶段可以引用这份已批准的计划。
   229|
   230|##  与其他框架对比
   231|
   232|特性  |  Claude Code  |  Codex  |  OpenCode  |  Gemini-CLI
   233|---|---|---|---|---
   234|只读约束实现  |  权限系统层面（mode='plan'）  |  推理预算切换  |  prompt 指令  |  策略引擎（工具白名单）
   235|工具发现方式  |  需先通过 ToolSearch 发现  |  直接可用  |  直接可用  |  直接可用
   236|子 Agent 中可用  |  否（直接异常）  |  不适用  |  不适用  |  不适用
   237|退出需用户批准  |  是（UI 审批）  |  否  |  是  |  是
   238|计划持久化  |  ` .claude/plans/  ` Markdown 文件  |  无  |  session Markdown  |  session Markdown
   239|进度追踪工具  |  TaskCreate / TaskUpdate  |  update_plan  |  TodoWrite  |  write_todos
   240|
   241|#  5.Context 压缩管理
   242|
   243|Claude Code 的 context 压缩机制是四个框架里  ** 层次最多、设计最细  ** 的。在每轮 LLM 调用前，系统会按顺序经过多道压缩检查，从轻量的工具结果裁剪到完整的摘要重写，逐层递进。
   244|
   245|##  动态触发阈值
   246|
   247|与其他框架用固定阈值不同，Claude Code 的压缩触发阈值  ** 与当前模型的 context window 动态绑定  ** 。触发公式大致是：  ` context window - 输出保留空间(20K) - buffer(13K)  ` 。
   248|
   249|以 claude-sonnet（200K context window）为例，自动压缩约在 167K token 时触发，160K 时开始提示警告，177K 时硬性拦截（阻止发出请求）。如果换用 context window 更大的模型，这些阈值都会等比例上移。这意味着接入长上下文模型时，压缩触发时机自然延后，模型有更多空间完整保留推理历史。
   250|
   251|##  五层压缩机制
   252|
   253|每轮 LLM 调用前，  ` query.ts  ` 主循环按顺序执行五道压缩处理，从轻量到昂贵依次兜底：
   254|
   255|** 第一层：工具结果预算（applyToolResultBudget）  **
   256|
   257|最轻量的一层，每轮都会执行。当某个工具调用的返回结果超过该工具声明的  ` maxResultSizeChars  ` 上限时，结果被写入磁盘并替换为文件路径引用，不缩减历史消息，只控制单次工具输出的大小。
   258|
   259|** 第二层：历史片段截断（snipCompact，feature-gated）  **
   260|
   261|不调用 LLM，通过规则对历史消息打分，将评分低的消息标记为"可删除"。不重要的消息主要是中间的工具执行序列——大量的工具调用 input/output 往往在任务完成后对模型没有持续参考价值，去掉它们对后续推理影响较小。用户提问和 assistant 的关键推理内容评分较高，会被保留。
   262|
   263|执行后返回  ` tokensFreed  ` 值，这个数字会被传给后续 autoCompact 的阈值计算，使其基于删除后的实际 token 量决定是否需要进一步压缩。
   264|
   265|** 第三层：微压缩（microCompact，feature-gated）  **
   266|
   267|这一层的核心思路是：  ** 不修改本地消息，而是利用 Anthropic API 的  ` cache_edits  ` 参数在服务端删除旧工具结果  ** 。
   268|
   269|理解这一层需要先知道 prompt cache 的工作方式：Claude API 会缓存 prompt 的前缀部分，下次发相同前缀时直接命中缓存，无需重新计算，大幅节省费用和延迟。如果修改了本地历史消息，前缀就变了，缓存失效。
   270|
   271|microCompact 绕开了这个矛盾——通过  ` cache_edits  ` 参数（类型  ` clear_tool_uses_20250919  ` ）告诉 API：对这次请求，在服务端删除指定的旧工具结果，但本地消息保持不变。API 侧应用这些编辑后，有效 token 减少了，prompt cache 也不会失效。
   272|
   273|微压缩有两种触发模式：
   274|
   275|* •  ** 时间触发（Time-based）  ** ：距离上次 assistant 消息超过 60 分钟，服务端 cache 已过期（TTL 约 1 小时），既然 cache 已经失效，就直接修改本地消息，将旧工具结果内容替换为  ` [Old tool result content cleared]  ` ，保留最近 5 条
   276|* •  ** 热缓存模式（Cached）  ** ：cache 仍然有效时，通过  ` cache_edits  ` 在服务端对旧工具结果做  ** 注意力屏蔽（attention mask = 0，之所以work的原因是如果attenton mask不是0的token数过多，算softmax时候分到每个token的注意力数值就会越小，精度误差会被放大）  ** ，本地消息不动，cache 继续命中。理解这里有个反直觉的地方：  ` cache_edits  ` 并不是真正删除那些 token，而是让它们在本次 forward pass 中"透明"——序列物理上还是  ` [A][B][tool_result_1000tokens][C]  ` ，每个 token 的位置编码都没变，服务端已缓存的 KV 矩阵全部还有效，只是被屏蔽的 token 对其他 token 的 attention 贡献为零。如果真的从序列中删掉那段内容，C 的 position 从 1003 变成 3，后续所有 token 的 KV 缓存全部失效，反而得不偿失。本地消息保持不动，也是出于同样的原因：本地消息是下次请求 token 序列的来源，改了本地消息就改变了序列，缓存同样失效
   277|
   278|可被清理的工具类型包括：Read、Bash、Grep、Glob、WebSearch、WebFetch、FileEdit、FileWrite。不能清理的包括代码解释器（REPL）和 MCP 工具等输出难以复现的工具。
   279|
   280|** 第四层：上下文折叠（contextCollapse，feature-gated）  **
   281|
   282|contextCollapse 是一个比 autoCompact 精细得多的压缩策略。它的核心思路是：  ** 将旧的对话内容折叠成摘要，但保留最近轮次的原始粒度  ** ，而不是把整个历史都摘要成一段文字。
   283|
   284|具体来说，系统会把历史消息分组，把"旧的"分组归档（替换为摘要），"近期的"保持原样。模型看到的是：一段段摘要 + 最近的完整细节。这比 autoCompact 的"全部压成一段摘要"保留了更多近期上下文的精度。
   285|
   286|触发时机：context 用量达到约 90% 时开始准备，95% 时阻塞触发。
   287|
   288|** contextCollapse 与 autoCompact 是互斥的  ** ：当 contextCollapse 启用时，  ` shouldAutoCompact()  ` 直接返回 false，autoCompact 不再触发。原因是两者的触发阈值相近，如果同时运行会竞争，autoCompact 会把 contextCollapse 精心保留的粒度化近期内容一并摘要掉，等于白做。
   289|
   290|** 第五层：完整摘要压缩（autoCompact）  **
   291|
   292|最重的一层，在前四层都无法将 token 降到阈值下时触发，通过 fork 一个子 Agent 调用 LLM 生成完整对话摘要（详见下节）。
   293|
   294|##  完整摘要压缩的执行过程
   295|
   296|autoCompact 触发时，系统先执行  ` PreCompact  ` hooks（用户可以在此拦截或记录），然后对历史消息做预处理：移除图片和文档块（避免摘要请求本身超长），移除压缩后会重新注入的内容（如 skill 列表）。
   297|
   298|处理完后，启动一个 fork 子 Agent 专门负责生成摘要。摘要完成后，旧的对话历史被一个结构取代：compact boundary 标记 + 摘要内容 + 保留的尾部消息 + 重新注入的 attachments（CLAUDE.md 内容、MCP 指令、skill 列表、hook 结果等）。最后执行  ` PostCompact  ` hooks。
   299|
   300|这种"压缩后重新注入 attachments"的设计保证了即使经历多次压缩，CLAUDE.md 记忆、MCP 服务器说明等关键背景信息也不会丢失。
   301|
   302|##  与其他框架对比
   303|
   304|框架  |  触发方式  |  阈值  |  是否调用 LLM  |  特点
   305|---|---|---|---|---
   306|Claude Code  |  响应式，每轮检查  |  与 context window 动态绑定  |  是（fork 子 Agent）  |  多层递进，attachments 压缩后自动恢复
   307|Codex  |  预防性 + 响应式双触发  |  配置项  ` auto_compact_token_limit  ` |  是  |  保留最近用户消息
   308|Gemini-CLI  |  主动式  |  context window 的 50%  |  是  |  保留最新 30% 历史
   309|OpenCode  |  响应式，溢出后触发  |  context_limit - 20K  |  是  |  全量替换
   310|
   311|#  6.Sub-Agent
   312|
   313|Claude Code 的 sub-agent 系统用单一入口  ` AgentTool  ` 统一管理所有子 Agent 的启动，通过参数组合路由到不同执行模式，是四个框架中  ** 功能最完整、执行模式最丰富  ** 的。
   314|
   315|##  七种执行模式
   316|
   317|` AgentTool  ` 支持七种执行路径，通过参数控制：
   318|
   319|执行模式  |  触发条件  |  特点
   320|---|---|---
   321|同步前台  |  默认（  ` run_in_background: false  ` ）  |  阻塞等待结果，结果直接返回给父 Agent
   322|异步后台  |  ` run_in_background: true  ` |  立即返回 agent ID，父 Agent 通过  ` TaskOutput  ` 轮询结果
   323|自动转后台  |  运行超过 120 秒  |  自动切换为后台，通知用户，避免长时间阻塞
   324|Worktree 隔离  |  ` isolation: 'worktree'  ` |  创建临时 git worktree，Agent 在独立副本上操作，不影响主工作区
   325|远端执行  |  ` isolation: 'remote'  ` |  在云端远程环境运行，始终后台（内部功能）
   326|Fork 模式  |  subagent_type 省略（实验性）  |  继承父 Agent 的完整对话历史和 system prompt
   327|Teammate 模式  |  agent swarms 功能开启，指定  ` name  ` |  在独立 tmux session 中运行，可通过  ` SendMessage  ` 双向通信
   328|
   329|##  内置 Agent 类型
   330|
   331|类型  |  工具集范围  |  适用场景
   332|---|---|---
   333|general-purpose（默认）  |  所有工具（除 AgentTool 本身，防止递归）  |  通用复杂任务
   334|Explore  |  只读工具（Read / Grep / Glob / WebSearch 等）  |  代码库探索与搜索，不允许写操作
   335|Plan  |  只读工具 + ExitPlanMode  |  规划阶段
   336|claude-code-guide  |  Read / Grep / WebSearch  |  回答 Claude Code 使用相关问题
   337|用户自定义  |  YAML 文件定义  |  项目特定场景
   338|
   339|用户只需在  ` ~/.claude/agents/  ` （全局）或  ` .claude/agents/  ` （项目级）目录下放置 YAML 定义文件，框架启动时自动发现并注册。
   340|
   341|##  父子 Context 共享
   342|
   343|普通子 Agent 启动时，  ` createSubagentContext()  ` 会从父 Agent 克隆四类信息传入：文件读取缓存（避免重复读取相同文件）、工具结果预算状态、权限上下文（子 Agent 可以覆盖），以及 MCP 连接信息。
   344|
   345|Fork 模式在此基础上更进一步——子 Agent 额外继承父 Agent 的  ** 完整对话历史  ** 和已渲染的  ** system prompt 字节级副本  ** 。字节级相同的 system prompt 保证 prompt cache 命中，这在长会话场景下能显著降低 token 成本。
   346|
   347|##  与其他框架对比
   348|
   349|框架  |  调用方式  |  内置类型数  |  嵌套深度  |  父子 context 共享
   350|---|---|---|---|---
   351|Claude Code  |  AgentTool（统一入口）  |  4 内置 + 自定义  |  不限  |  Fork 模式完整共享；普通模式共享文件缓存
   352|Codex  |  spawn_agent 工具  |  3 角色 + 自定义  |  可配置上限  |  Fork 模式复制完整历史
   353|OpenCode  |  Task 工具  |  2 + 自定义  |  固定两层  |  主 Agent 历史完整传入
   354|Gemini-CLI  |  Agent 即工具  |  3 类型  |  强制一层（禁递归）  |  不传递历史
   355|
   356|#  7.失败处理机制
   357|
   358|Claude Code 的失败处理策略整体偏宽松：工具执行失败不中断流程，错误信息直接反馈给模型，由模型自行决策下一步。没有工具失败计数预算，不会因为失败次数过多主动终止。但在 API 层面和权限拒绝场景下，分别有专门的恢复机制。
   359|
   360|##  工具执行错误
   361|
   362|工具执行失败时，错误信息以标准  ` tool_result  ` 消息形式（  ` is_error: true  ` ）返回给模型。单个工具失败不影响同批次其他工具的执行——批次内的工具都会完成，各自的结果独立返回，失败与成功并列传给模型。这意味着模型需要识别哪个工具失败并决定是否重试。
   363|
   364|##  API 错误恢复
   365|
   366|** 输出 token 超限（max_output_tokens）  ** ：自动重试，最多 3 次，错误消息在此期间不向外暴露，避免调用方误判为终态。
   367|
   368|** 请求过长（prompt_too_long）  ** ：先触发 autoCompact 压缩历史再重试；如果压缩请求本身也超长，则从历史头部逐条删除最旧的消息，最多执行 3 轮这样的截断重试。
   369|
   370|** 网络或 API 请求失败  ** ：通过  ` withRetry()  ` 包装，指数退避重试。
   371|
   372|##  权限拒绝的渐进式升级
   373|
   374|这是 Claude Code 特有的机制。在 auto 模式下，AI 分类器会自动判断是否放行工具调用。但如果分类器持续拒绝，系统不会一直静默拒绝——当  ** 连续拒绝达到 3 次  ** 或  ** 累计拒绝达到 20 次  ** 时，  ` shouldFallbackToPrompting()  ` 返回 true，系统从"自动拒绝"切换到"询问用户"模式，把决策权还给人。
   375|
   376|这个设计处理了一类边界情况：分类器判断有误或任务本身需要人工确认，自动拒绝会让 Agent 陷入无法推进的死循环，渐进升级到询问用户是退出死循环的安全阀。
   377|
   378|异步子 Agent 无法弹出 UI，因此它的拒绝状态单独维护（  ` localDenialTracking  ` ），触发阈值后只能持续失败，无法自行升级到询问用户。
   379|
   380|##  循环检测
   381|
   382|Claude Code  ** 没有内置死循环检测  ** ，这是它与 OpenCode（相同工具+参数连续调用 3 次后询问用户）和 Gemini-CLI（注入恢复 prompt → 60 秒后强制终止）的主要区别。唯一的兜底保护是：context 接近上限时 autoCompact 会压缩历史，以及用户手动按 ESC 中断。
   383|
   384|##  与其他框架对比
   385|
   386|特性  |  Claude Code  |  Codex  |  OpenCode  |  Gemini-CLI
   387|---|---|---|---|---
   388|工具失败后行为  |  错误反馈给模型，继续执行  |  同左  |  同左  |  同左
   389|批次内失败是否中断  |  不中断  |  不中断  |  不中断  |  不中断
   390|循环检测  |  无  |  无  |  有（3次→询问用户）  |  有（注入 prompt → 60s → 终止）
   391|权限持续拒绝的处理  |  渐进升级（3次连续/20次总计→弹 UI）  |  无专门机制  |  权限拒绝可中断循环  |  无专门机制
   392|
   393|#  8.Hooks 系统（Claude Code 独有）
   394|
   395|Hooks 是 Claude Code 区别于其他三个框架最显著的能力之一，也是其定位为"可扩展平台"而非单纯命令行工具的关键设计。其他框架的工具调用流程对用户完全是黑盒，Claude Code 通过 Hooks 在整个生命周期的关键节点开放了外部介入的接口。
   396|
   397|##  功能
   398|
   399|Hooks 本质是注册在特定事件上的 Shell 脚本或回调函数。被触发时，Hook 接收当前事件的上下文（工具名、参数、执行结果等），通过标准输出返回 JSON 决策，框架据此执行后续逻辑。一个 Hook 可以做到：
   400|
   401|* •  ** 拦截工具调用  ** ：  ` PreToolUse  ` hook 返回  ` decision: 'block'  ` ，阻止工具执行
   402|* •  ** 修改工具输入  ** ：  ` PreToolUse  ` hook 返回  ` updatedInput  ` ，替换模型传入的参数
   403|* •  ** 注入上下文  ** ：返回  ` additionalContext  ` ，这段文字会作为额外信息传给模型，影响后续决策
   404|* •  ** 修改工具输出  ** ：  ` PostToolUse  ` hook 返回  ` updatedMCPToolOutput  ` ，可以改写 MCP 工具的返回结果
   405|* •  ** 替换初始消息  ** ：  ` SessionStart  ` hook 返回  ` initialUserMessage  ` ，可以在会话启动时替换用户的初始输入
   406|* •  ** 终止会话  ** ：任意 hook 返回  ` continue: false  ` 即可停止整个 Agent 循环
   407|* •  ** 自动化权限决策  ** ：  ` PermissionRequest  ` hook 直接返回 allow/deny，实现无人值守的自定义权限策略
   408|
   409|支持同步和异步两种响应模式。异步模式下 Hook 立即返回  ` { async: true }  ` ，框架继续等待直到超时或异步结果到达。
   410|
   411|##  24 种 Hook 事件
   412|
   413|类别  |  事件
   414|---|---
   415|生命周期  |  SessionStart / SessionEnd / Setup / Stop / StopFailure
   416|工具  |  PreToolUse / PostToolUse / PostToolUseFailure
   417|权限  |  PermissionRequest / PermissionDenied
   418|Sub-Agent  |  SubagentStart / SubagentStop / TeammateIdle
   419|用户交互  |  UserPromptSubmit / Notification
   420|压缩  |  PreCompact / PostCompact
   421|任务  |  TaskCreated / TaskCompleted
   422|系统  |  ConfigChange / CwdChanged / FileChanged / InstructionsLoaded
   423|MCP  |  Elicitation / ElicitationResult
   424|
   425|##  配置与优先级
   426|
   427|Hooks 在  ` settings.json  ` 中配置，支持三个层级，高层级覆盖低层级：企业管理策略（Managed）> 用户级（  ` ~/.claude/settings.json  ` ）> 项目级（  ` .claude/settings.json  ` ）。  ` --no-hooks  ` 参数可一键禁用所有 hooks。
   428|
   429|##  对评测的影响
   430|
   431|Hooks 是评测公平性的潜在干扰源：  ` PreToolUse  ` 可修改工具输入使模型看到的参数与实际不符，  ` PostToolUse  ` 可修改 MCP 工具输出影响模型决策，  ` UserPromptSubmit  ` 可在用户消息中静默注入额外上下文。在对 Claude Code 做基准测试时，应使用  ` --no-hooks  ` 模式运行，或在报告中显式说明 Hooks 配置。
   432|
   433|#  9.CLAUDE.md 记忆系统
   434|
   435|##  机制说明
   436|
   437|CLAUDE.md 是 Claude Code 的持久化记忆载体。会话启动时，系统自动按固定路径顺序扫描并加载所有找到的 CLAUDE.md 文件，将内容合并注入到 context 中。扫描路径按优先级从低到高依次为：
   438|
   439|1. 1\.  ` ~/.claude/CLAUDE.md  ` — 全局用户级，跨所有项目生效
   440|2. 2\. 项目根目录的  ` CLAUDE.md  ` — 项目级
   441|3. 3\. 当前工作目录的  ` CLAUDE.md  ` — 目录级
   442|4. 4\. 当前目录到项目根之间所有父目录的  ` CLAUDE.md  ` — 递归向上查找
   443|
   444|所有找到的文件都会被合并注入，且  ** 越深层的目录越晚注入  ** ，在内容冲突时相当于覆盖上层规则。这使得子目录可以针对自己的场景补充或覆盖上层的约束，而不影响其他目录。
   445|
   446|除会话启动时自动加载外，  ` InstructionsLoaded  ` hook 事件会在每次 CLAUDE.md 被加载时触发，允许外部逻辑感知记忆内容的变化。经历 autoCompact 压缩后，CLAUDE.md 内容也会作为 attachment 重新注入，保证记忆不因压缩丢失。
   447|
   448|##  CLAUDE.md 的典型用途
   449|
   450|CLAUDE.md 可以包含任意 Markdown 内容，常见写法：
   451|
   452|* •  ** 项目约束  ** ：代码风格规范、禁止修改的文件目录、命名规则——把项目规范写进去，避免模型每次都需要被纠正
   453|* •  ** 常用命令  ** ：build / test / lint 命令——省去模型每次探索  ` package.json  ` 或  ` Makefile  ` 的步骤
   454|* •  ** 架构说明  ** ：关键模块的职责、模块间依赖关系——帮助模型快速建立代码库的心智模型
   455|* •  ** 团队规范  ** ：commit message 格式、PR 流程、分支命名规则
   456|* •  ** 跨会话记忆  ** ：模型可以主动写入 CLAUDE.md 来记录重要发现（如某个函数的副作用、某个 bug 的根因），供下次会话复用
   457|
   458|最后一点尤为关键——模型不只是被动读取 CLAUDE.md，它可以在任务执行中主动往里写内容，实现真正意义上的跨会话学习。
   459|
   460|##  与其他框架对比
   461|
   462|框架  |  记忆机制  |  作用范围
   463|---|---|---
   464|Claude Code  |  CLAUDE.md（多层目录，递归发现，合并注入）  |  全局 / 项目 / 目录三级
   465|Codex  |  AGENTS.md（有详细优先级规则，深层目录覆盖浅层）  |  项目级
   466|Gemini-CLI  |  GEMINI.md（项目级，优先级高于 system prompt 默认行为）  |  项目级
   467|OpenCode  |  无专用机制  |  —
   468|
   469|#  10.权限与治理系统
   470|
   471|##  四种权限模式
   472|
   473|Claude Code 的权限系统以  ` toolPermissionContext.mode  ` 字段为核心，支持四种模式，覆盖从严格交互到完全自动化的全谱场景：
   474|
   475|模式  |  行为  |  适用场景
   476|---|---|---
   477|` default  ` |  每次工具调用前弹出确认对话框  |  交互式 IDE 使用，需要人工把关
   478|` auto  ` |  AI 分类器自动判断是否放行，不弹框  |  自动化/CI 场景
   479|` plan  ` |  只读操作自动放行，写操作拦截  |  规划阶段，防止意外修改文件
   480|` bypassPermissions  ` |  跳过所有权限检查  |  明确授权的完全自动化场景
   481|
   482|##  静态规则：Allow / Deny / Ask
   483|
   484|除了模式级别的控制，用户还可以配置细粒度的静态规则，规则支持  ** 工具名 + 参数 glob 模式  ** 的组合：
   485|
   486|* •  ` alwaysAllow  ` ：匹配的工具调用直接放行，无需分类器或弹框
   487|* •  ` alwaysDeny  ` ：匹配的调用直接拒绝
   488|* •  ` alwaysAsk  ` ：匹配的调用始终询问用户，即使在 auto 模式下
   489|
   490|例如可以配置  ` Bash(git *)  ` 始终允许（git 操作放行），同时  ` Bash(rm -rf *)  ` 始终拒绝。规则来源有三个层级：企业管理策略（Managed）> 用户级设置 > 项目级设置，高层级规则优先。
   491|
   492|##  AI 安全分类器（Auto Mode）
   493|
   494|` auto  ` 模式下的分类器  ** 是一次真正的 AI 模型调用  ** ，不是规则匹配。每次工具调用执行前，系统向 Claude（Opus）发起一次分类请求，由模型判断这次操作是否需要阻止。
   495|
   496|** 分类器的输入  **
   497|
   498|不同工具通过各自的  ` toAutoClassifierInput()  ` 方法生成紧凑的描述字符串传给分类器：
   499|
   500|* • Bash 工具：只传命令字符串，如  ` ls -la  ` 或  ` rm -rf /tmp/x  `
   501|* • FileWrite：传路径和内容，如  ` /tmp/x: new content  `
   502|* • FileEdit：传路径和新内容片段
   503|* • 只读工具（Read/Glob/Grep 等）：直接走白名单，跳过分类器
   504|
   505|除了当前工具调用，分类器还会接收  ** 对话历史的紧凑编码  ** 作为上下文。历史中每条消息被压缩成  ` {"Bash":"ls -la"}  ` 或  ` {"user":"..."}  ` 这样的格式，让分类器能感知本次操作前后的操作序列，而不仅仅看当前这一条。
   506|
   507|** 两阶段分类设计  **
   508|
   509|分类器采用两阶段设计，在速度和准确性之间取得平衡：
   510|
   511|* •  ** Stage 1（快速阶段）  ** ：max_tokens=64，只要求模型输出  ` <block>yes/no</block> ` 。如果判定为"不阻止"，立即返回，省去 Stage 2 的延迟。如果判定"阻止"或结果无法解析，进入 Stage 2
   512|* •  ** Stage 2（思考阶段）  ** ：max_tokens=4096，模型在  ` <thinking> ` 标签中进行链式推理，再输出最终决定。这一阶段主要用于降低 Stage 1 的误报率——Stage 1 判"yes"的操作，会让模型再仔细想一遍
   513|
   514|两个阶段都利用 prompt cache，系统提示和对话历史前缀被缓存复用，避免每次都重新计算。
   515|
   516|** 输出格式  **
   517|
   518|分类器只输出  ** 二元决定  ** ：  ` shouldBlock: true/false  ` ，附带文字说明（  ` reason  ` ）和推理过程（  ` thinking  ` ）。没有置信度分数。
   519|
   520|** 白名单工具直接跳过  **
   521|
   522|35+ 个明确安全的工具（Read、Glob、Grep、WebSearch、TaskCreate 等所有只读和任务管理工具）被加入白名单，调用前不走分类器，直接放行，减少不必要的延迟和 API 成本。
   523|
   524|** 分类器不可用时的行为  **
   525|
   526|默认 Fail-closed：分类器因 API 错误不可用时，操作被阻止并报错，而非降级放行。可通过配置切换为 Fail-open（降级到弹出确认框）。
   527|
   528|##  Worktree 隔离（沙箱机制）
   529|
   530|Claude Code 通过 git worktree 为 Agent 提供  ** 文件系统级别的隔离沙箱  ** 。  ` AgentTool  ` 设置  ` isolation: 'worktree'  ` 时，系统为子 Agent 自动创建一个临时 git worktree 副本，子 Agent 的所有文件操作都发生在这个隔离副本上，主工作区完全不受影响。
   531|
   532|worktree 的生命周期自动管理：如果子 Agent 执行完毕后没有产生任何变更，worktree 自动清理；如果有变更，worktree 保留并返回路径和分支名，开发者可以按需 review 和合并。用户也可以通过  ` EnterWorktree  ` /  ` ExitWorktree  ` 工具手动管理 worktree 的进出。
   533|
   534|#  11.状态持久化与会话恢复
   535|
   536|##  Session 存储
   537|
   538|Claude Code 将每次会话的完整 transcript 以 JSONL 格式持久化到  ` ~/.claude/projects/<project_hash>/  ` 目录，每行一条 JSON 记录。记录类型远不止消息本身，还包括：
   539|
   540|记录类型  |  内容
   541|---|---
   542|` user  ` /  ` assistant  ` |  对话消息，含 thinking blocks 和工具调用的 input/output
   543|` system  ` (subtype:  ` compact_boundary  ` )  |  压缩边界标记，含压缩前 token 数、触发方式、被压缩消息数
   544|` system  ` (subtype:  ` microcompact_boundary  ` )  |  微压缩边界，含节省的 token 数和被清理的工具 ID
   545|` summary  ` |  autoCompact 生成的摘要内容
   546|` content-replacement  ` |  工具结果超限后的磁盘替换记录
   547|` marble-origami-commit  ` |  contextCollapse 的归档提交记录
   548|` file-history-snapshot  ` |  文件修改历史快照
   549|` worktree-state  ` |  Worktree 状态记录
   550|` custom-title  ` /  ` tag  ` /  ` mode  ` 等  |  会话元数据
   551|
   552|** System prompt 不存储在 transcript 中。  ** 动态组装的部分（工具描述、MCP 指令、CLAUDE.md 内容、环境信息等）在每次恢复时重新生成。只有会话元数据（标题、标签、Agent 配置、模式等）会持久化到 JSONL 尾部，且始终保持在文件末尾 64KB 的读取窗口内，方便快速扫描。
   553|
   554|##  Compact 发生时的存储结构
   555|
   556|autoCompact 触发后，JSONL 不会删除历史消息，而是  ** 追加  ** 一条  ` compact_boundary  ` 记录，后接摘要消息。文件结构变成：
   557|
   558|    [旧历史消息...] [compact_boundary] [摘要] [新消息...]  
   559|                          ↑  
   560|                  logicalParentUuid 指向压缩前最后一条消息  
   561|                  parentUuid = null（断开链，标记边界）
   562|
   563|当 transcript 文件超过 50MB 时，恢复时会跳过 compact boundary 之前的内容，只流式读取边界之后的部分，大幅减少内存占用。边界之前的元数据（标题、标签等）通过字节级扫描单独恢复。
   564|
   565|##  子 Agent 的 Sidechain 存储
   566|
   567|子 Agent 的 transcript 存储在独立子目录，与主线程完全隔离：
   568|
   569|    ~/.claude/projects/<project_hash>/  
   570|    ├── <sessionId>.jsonl              # 主线程 transcript  
   571|    └── <sessionId>/  
   572|        └── subagents/  
   573|            ├── agent-<agentId>.jsonl  # 子 Agent transcript  
   574|            └── agent-<agentId>.meta.json  # Agent 类型、worktree 路径等元数据
   575|
   576|Sidechain 消息有一个特殊的去重规则：主线程消息按 UUID 去重，但 sidechain 消息  ** 不去重  ** 。原因是 Fork 模式启动的子 Agent 会继承父 Agent 的完整对话历史，继承的消息与父线程共享 UUID，如果去重则会丢失这部分上下文。
   577|
   578|##  跨会话恢复（/resume）
   579|
   580|用户执行  ` /resume <session_id> ` 后，系统按以下顺序重建会话状态：
   581|
   582|** 第一步：确定读取范围。  ** 找到 JSONL 中最后一个  ` compact_boundary  ` 记录的位置，只加载该边界之后的消息。如果文件超过 50MB，边界之前的内容直接跳过，通过字节扫描单独恢复元数据。没有 compact boundary 时从文件头开始全量读取。
   583|
   584|** 第二步：重建对话链。  ** 按  ` parentUuid  ` 字段构建消息的有向无环图，过滤掉 fork 产生的孤立分支，输出线性的消息序列。  ` logicalParentUuid  ` 字段在此阶段用于在压缩边界处恢复逻辑顺序。
   585|
   586|** 第三步：恢复应用状态。  ** 从 transcript 中的各类记录恢复运行时状态：
   587|
   588|* •  ` content-replacement  ` 记录 → 恢复工具结果预算状态（被替换为路径引用的大型工具结果）
   589|* •  ` marble-origami-commit  ` 记录 → 恢复 contextCollapse 的归档状态
   590|* •  ` file-history-snapshot  ` 记录 → 恢复文件修改历史
   591|* • 最后一条  ` TodoWrite  ` 工具调用结果 → 恢复任务列表
   592|* •  ` worktree-state  ` 记录 → 如果目录仍存在则恢复 worktree
   593|
   594|** 第四步：重新注入动态内容。  ** System prompt 重新动态组装（工具描述、环境信息），CLAUDE.md、MCP 服务器指令、skill 列表等 attachments 重新注入。
   595|
   596|恢复后的会话对模型来说与未中断的会话基本一致：摘要覆盖了压缩前的历史，近期消息完整保留，所有运行时状态同步恢复，可以继续执行之前未完成的任务。
   597|
   598|#  12.MCP 协议集成（Model Context Protocol）
   599|
   600|MCP（Model Context Protocol）是 Anthropic 提出的开放协议，定义了 Agent 与外部工具/资源服务器之间的标准通信接口。Claude Code 是四个被分析框架中  ** 唯一对 MCP 有完整原生实现  ** 的，其他三个框架（Codex、OpenCode、Gemini-CLI）均未支持。
   601|
   602|##  动态工具扩展
   603|
   604|MCP 最核心的能力是让第三方工具服务器向 Claude Code  ** 动态注册新工具  ** 。连接 MCP 服务器后，服务器提供的工具以  ` mcp__<serverName>__<toolName> ` 格式出现，与内置工具共享完全相同的调用机制——包括并发调度、权限检查、结果大小限制等。
   605|
   606|MCP 工具默认也支持延迟加载，但可以为特定工具标记  ` alwaysLoad = true  ` ，使其始终出现在初始 system prompt 的工具列表中，不需要通过 ToolSearch 发现。
   607|
   608|##  资源访问
   609|
   610|除工具外，MCP 服务器还可以提供  ** 资源  ** （文件、数据库记录、API 响应等结构化数据）。  ` ListMcpResources  ` 工具列出当前可用资源列表，  ` ReadMcpResource  ` 读取指定资源内容。MCP 服务器的使用说明在 session 启动时注入 system prompt，并在 Compact 压缩后自动重新注入，确保模型始终知道当前连接了哪些服务器。
   611|
   612|##  认证与交互
   613|
   614|` McpAuth  ` 工具处理需要 OAuth 等认证流程的 MCP 服务器。MCP Elicitation 协议允许服务器在执行过程中请求用户输入（比如填写表单或确认操作），框架通过  ` Elicitation  ` /  ` ElicitationResult  ` hooks 路由这些交互请求。
   615|
   616|##  MCP 服务器配置
   617|
   618|MCP 服务器在  ` settings.json  ` 中声明，支持用户级和项目级两个层级：
   619|
   620|    {  
   621|      "mcpServers": {  
   622|        "filesystem": {  
   623|          "command": "npx",  
   624|          "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]  
   625|        },  
   626|        "github": {  
   627|          "command": "npx",  
   628|          "args": ["-y", "@modelcontextprotocol/server-github"],  
   629|          "env": { "GITHUB_TOKEN": "..." }  
   630|        }  
   631|      }  
   632|    }
   633|
   634|这使得 Claude Code 可以在不修改框架代码的情况下，通过配置接入数据库访问、代码分析、设计工具等任意第三方能力——扩展边界由 MCP 生态而非 Claude Code 本身决定。
   635|
   636|#  13.预算管理
   637|
   638|大多数框架的预算控制只有一个维度：轮次上限（max_turns）。Claude Code 把预算管理拆成了  ** 四个独立的控制维度  ** ，可以独立配置，也可以组合使用。
   639|
   640|##  Token 预算
   641|
   642|通过 Anthropic API 的  ` output_config.task_budget  ` 参数设置整个 agentic turn 的 token 总用量上限。每轮迭代前，系统从累计 API 用量中扣除已消耗的 token，计算剩余额度，接近上限时 API 侧主动截断。Token 预算跨 Compact 边界持续追踪——Compact 压缩本身消耗的 token 也计入总量，不存在"压缩后重置"的漏洞。
   643|
   644|##  成本预算
   645|
   646|` maxBudgetUsd  ` 参数设置单次会话的最大美元成本上限。  ` CostTracker  ` 实时根据已消耗的 token 数量和当前模型的计费单价计算累计成本，超出上限后阻止新的 API 调用。对于需要精确控制 AI 成本的场景（如 CI 流水线、按用量计费的产品），这个维度直接控制了最坏情况下的支出。
   647|
   648|##  工具结果预算
   649|
   650|每个工具通过  ` maxResultSizeChars  ` 声明单次结果的字符数上限。超出时，结果存磁盘并替换为文件路径引用，避免单个工具调用结果吞噬大量 context。  ` contentReplacementState  ` 跨轮次追踪所有被替换的内容，Compact 压缩后可以按需恢复。
   651|
   652|##  轮次预算（Max Turns）
   653|
   654|` maxTurns  ` 参数限制 Agent 循环的最大迭代次数，主要在 SDK 调用和子 Agent 中使用，防止失控的模型无限循环。
   655|
   656|##  与其他框架对比
   657|
   658|框架  |  Token 预算  |  成本预算  |  工具结果大小限制  |  轮次预算
   659|---|---|---|---|---
   660|Claude Code  |  有  |  有（maxBudgetUsd）  |  有（存磁盘）  |  有（maxTurns）
   661|Codex  |  无  |  无  |  截断（首尾保留）  |  有（max_turns）
   662|OpenCode  |  无  |  无  |  无  |  无
   663|Gemini-CLI  |  无  |  无  |  截断  |  有（max_turns）
   664|