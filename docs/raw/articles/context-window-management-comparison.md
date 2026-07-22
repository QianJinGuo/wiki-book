---
title: "context window management comparison"
type: raw
source_url: https://mp.weixin.qq.com/s/ajurJ3Vayd9qLIwh9M3Fnw
ingested: 2026-04-27
sha256: d6eacd5d03398cce4dd3066f89ecc5dd01a97343d9de0b901595695d1c169c7f
review_value: 9
review_confidence: 9
review_stars: 5
review_recommendation: STRONG
source: 高可用架构
author: Aparna Dhinakaran (Arize AI)
published: 2026-04-26
tags: [agent, harness, context-management, context-window, compaction, subagent-isolation, pi-mono, openclaw, claude-code, memory]
  - agent
  - harness
  - context-management
  - context-window
  - compaction
  - subagent-isolation
  - pi-mono
  - openclaw
  - claude-code
  - letta
created: 2026-05-10
updated: 2026-05-10
---
# 别再把上下文当聊天记录
**作者：** Aparna Dhinakaran（Arize AI 联合创始人兼 CPO）
**来源：** 高可用架构
**发布时间：** 2026年4月27日 07:55 广东
## 导读
本文详细比较了 Pi、OpenClaw、Claude Code 和 Letta 等 AI agent 框架如何应对上下文窗口限制，包括文件读取截断、分页、工具结果预算和会话压缩策略。
这些框架在文件硬上限、偏移量/限制分页、sub-agent 隔离和 LLM 驱动的会话修剪上表现出明显趋同，表明主动管理上下文已成为工程共识。
作者认为最佳设计应让模型自主管理上下文预算，类似于传统计算的内存管理系统，Arize 的 Alyx agent 也独立采用了类似模式。
## 大文件上下文管理
文件读取让这个问题变得很具体。当模型需要读取一个大到放不进上下文的文件时，必须有人决定保留什么。四个 harness 都支持用于分页的 offset 和 limit 参数。
### Pi (pi-mono)
Pi 读取文件时有硬上限：最多 2,000 行或 50KB，哪个先到就停，即使模型没有主动请求切片也一样。内容会从头部开始保留并截断，工具输出还会附加一个明确的继续提示：`[Showing lines 1-2000 of 50000. Use offset=2001 to continue.]`
**Pi 的做法：harness 优先**——harness 先保护你，再教模型分页。
### OpenClaw
OpenClaw 继承了 Pi 的 read 工具，以及它的 2K 行 / 50KB 截断。在此基础上，它还给 bootstrap 文件叠加了额外上限：每个文件最多 12,000 个字符，总计最多 60,000 个字符。当 bootstrap 文件超过预算时，它使用 75% 头部 / 25% 尾部的切分。
工具结果有单独预算：16,000 个字符，或上下文窗口的 30%，取较小值。当尾部看起来"重要"（错误、JSON 右括号、summary 关键词）时，它会切换到头部加尾部模式。
**OpenClaw 的做法：纵深防御**——Pi 的截断作为第一层，然后对 bootstrap 注入加额外上限，再在上面叠加工具结果预算。
### Claude Code
Claude Code 对文件读取使用双层防线。第一道门是在文件打开之前，通过 stat 调用检查 256KB 字节上限。如果文件超过这个限制，读取会立刻被拒绝，并返回错误，提示模型改用 offset/limit 或 grep。第二道门在读取之后运行：输出会按 token 计数，并受 25,000 token 预算约束。
即使文件没有超过上限，工具默认也只返回开头的 2,000 行，任何超过 2,000 个字符的单行都会被截断。
**文件去重系统：** 如果模型在同一范围重复读取同一个文件，并且文件修改时间没有变化，Claude Code 会返回一个 stub，而不是完整内容，从而避免上下文中出现重复 token。
**Claude Code 的做法：harness 优先，并且支持远程调参**——读取前的字节门禁、读取后的 token 门禁、行数和行长默认值、可执行的错误消息、丰富的工具 prompt、读取去重，以及让 Anthropic 能在服务端调整所有这些行为的 feature flag。
### Letta
Letta 采用了根本不同的做法：每个上传文件都会被解析、分块，并嵌入到向量库中。当一个文件在 agent 的上下文中处于"打开"状态时，它可见的内容会被截断到一个按文件计算的字符上限，这个上限会随模型上下文窗口分为五档：8K 上下文对应 5,000 个字符，32K 对应 15,000，128K 对应 25,000，200K+ 对应 40,000。可同时打开的文件数量也会扩展，小模型为 3 个，超大模型最高 15 个。超过限制时，LRU 策略会驱逐最近最少访问的文件。
**Letta 的做法：memory 优先**——文件同时存在于原始文本和向量库中，上下文窗口只显示一个受管理的视图，模型通过工具访问更多内容。
## 会话剪枝
随着对话增长，每个 harness 都必须决定保留什么、丢弃什么。这里的设计差异最有意义，因为压缩策略决定了长时间运行的 agent 是保持连贯，还是慢慢退化。
### Pi
Pi 使用 compaction：由 token 阈值触发、LLM 驱动的总结。
- **触发条件：** 估算上下文 token 超过 contextWindow - reserveTokens（默认 reserve：16,384 tokens）
- **保留内容：** 从对话末尾向前遍历，保留最近约 20,000 tokens 的消息
- **总结内容：** 更早的所有内容都会交给 LLM 总结，变成一条合成的 user message，前置到被保留的尾部之前
- **工具调用安全性：** 永远不会切出孤立的工具结果，会沿边界移动，保持 tool-call/tool-result 成对完整
### OpenClaw
OpenClaw 在 Pi 的 compaction 之上运行两套不同的上下文管理机制：
- **触发条件：** 历史超过上下文窗口的 50%（maxHistoryShare，默认 0.5）
- **保留内容：** 历史会被切成 token 质量相等的块；最老的块被丢弃，其余保留，并修复 tool-call/result 配对
- **总结内容：** 被丢弃内容会经过分阶段的多轮 LLM 总结，并带有 merge 步骤
- **压缩前 flush：** 静默的 agentic turn 让 agent 在历史消失前把状态持久化到 memory 文件
- **第二层：** 对工具结果做非破坏性的内存内剪枝（先 soft-trim，再 hard-clear），使用 5 分钟缓存 TTL
### Claude Code
Claude Code 通过查询前优化和 LLM 驱动的 compaction 管理上下文。
- **触发条件：** 估算 token 超过有效上下文窗口减去 13,000-token buffer（对 200K 上下文模型，compaction 大约在 167K tokens 时触发）
- **总结内容：** 完整对话会被发给模型，并附带结构化的九段 prompt
- **压缩后恢复：** 最近读取过的最多 5 个文件会在 compaction 后重新附加到上下文中
- **查询前优化：** 每次模型调用之前，超大的工具结果会被持久化到磁盘，并替换成 2KB preview。每个工具有 50,000 字符上限，每条消息聚合后有 200,000 字符上限
- **prompt-too-long 兜底：** 如果 compaction 调用本身触发上下文限制，一个确定性的 head-drop 会移除最旧的 API-round groups
### Letta
Letta 通过多种 compaction 策略管理上下文：
- **触发条件：** 估算上下文使用量超过上下文窗口的 90% 时触发 compaction
- **滑动窗口驱逐：** 从 30% 的消息开始，然后每轮增加 10%，直到 token 使用量低于目标
- **Self-compact 模式：** 使用 agent 自己的模型来总结，不需要单独的 summarizer 成本
- **两阶段兜底：** 首先把工具返回钳制到 5,000 个字符并重试。如果仍然溢出，就对 transcript 做中间截断，保留 30% 头部和 30% 尾部
## 子智能体上下文管理
| Harness | 子 agent 隔离策略 |
|---------|-----------------|
| Pi | 每个任务启动新进程，只收到任务字符串作为唯一 user message，无父对话历史 |
| OpenClaw | 默认 fresh isolated sessions，有一个 fork 模式复制父 transcript，只适用于 same-agent spawns。Workspace context 过滤到最小 allowlist |
| Claude Code | 默认 typed-agent 路径创建空白对话；fork 路径传递完整父消息历史用于 prompt cache sharing。Worker 工具按自己权限模式重建 |
| Letta | 普通工具执行时完全不 fork，工具运行在主 agent loop 中，历史通过 conversation search 和 archival memory search 访问 |
## 设计在哪里收敛
比较这四个代码库后，最突出的发现并非差异有多大，而是共识有多强。
**四个 harness 的共同模式：**
1. 对文件读取设置硬上限
2. 支持 offset/limit 分页
3. 限制工具结果大小
4. 隔离子智能体会话
5. 由 token 阈值触发、LLM 驱动的 compaction
6. 估算上下文使用量并检测压力
**具体设计押韵：**
- Pi 和 OpenClaw 都对文件读取做头部截断，并附加继续提示
- Claude Code 和 OpenClaw 都把超大的工具结果持久化到磁盘
- Pi、OpenClaw 和 Claude Code 都在 compaction 期间强制保持 tool-call/result 边界安全
- 三个支持把父 transcript fork 到子智能体
**Arize Alyx 的独立收敛：** Arize 自己的 Alyx assistant 是为数据探索构建的（非代码编辑），也独立走到了同样的设计——工具结果 10,000-token 预算、二分搜索找最大数据集切片、长 cell value 头尾截断+back-reference、50,000 tokens 强制 checkpoint、压缩前状态 flush。
## 核心洞察
> 50 年计算机发展教会我们，最好的内存管理，是程序根本不用思考的那种。寄存器、缓存行、页表、交换空间。每一层都由系统管理，对上一层不可见。程序只管运行。
>
> Agent harness 正在朝同一个方向移动。目标不是向模型展示一切。目标是在正确的时间给它正确的工作集，并允许它动态决策，管理自己的上下文。