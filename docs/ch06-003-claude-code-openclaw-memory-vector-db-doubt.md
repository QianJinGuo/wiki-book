## Ch06.003 claude code openclaw memory vector db doubt

> 📊 Level ⭐⭐ | 20.2KB | `entities/claude-code-openclaw-memory-vector-db-doubt.md`

## 概述

本文源自行小招对 `Claude Code` 和 OpenClaw 两套主流 自主Agent 框架记忆系统的源码分析。作者核心论点是：**在读完两者的记忆实现后，对"Agent 记忆必须用向量数据库"这一主流假设产生了严重怀疑**。

两个框架代表了截然不同的记忆架构哲学：Claude Code 信任 LLM 的语义理解能力，采用纯 Markdown + LLM 路由；OpenClaw 采用传统工程路线，以 SQLite 向量索引为核心。两者定位不同——Claude Code 面向团队协作和企业环境，OpenClaw 是 local-first 的个人 Agent 运行时——但都解决了"记忆"这个核心问题，且解法迥异。

## Claude Code 六层记忆架构

Claude Code 采用了六层 Markdown 文件的分层记忆设计，每层有独立的读写权限和生命周期：

| 层级 | 文件位置 | 用途 | 可见性 |
|------|----------|------|--------|
| Managed | `/etc/claude-code/CLAUDE.md` | 系统级全局策略 | 所有用户 |
| User | `~/.claude/CLAUDE.md` | 用户私有全局指令 | 仅用户本人 |
| Project | `CLAUDE.md` + `.claude/rules/*.md` | 团队共享项目规则 | 入 Git |
| Local | `CLAUDE.local.md` | 个人项目配置 | 不入 Git |
| Auto Memory | `~/.claude/projects/<path>/memory/` | 后台自动提取的主题文件 | 自动整理 |
| Team Memory | `memory/team/` 子目录 | 组织级共享知识 | 跨仓库同步 |

加载顺序从 Managed 到 Team，后加载的优先级更高。Project Memory 的发现从文件系统根目录遍历到当前工作目录（CWD），**离 CWD 越近的文件优先级越高**。

### @path 指令与条件规则

Markdown 记忆文件支持 `@path` 指令引用其他文件，最多 5 层递归，可构建树状规则结构。`.claude/rules/` 下的文件还支持 frontmatter 中写 glob pattern，**只在操作匹配路径的文件时才激活对应规则**。例如，一条规则可以写为"src/api 下的文件必须用 zod 校验输入"，Claude Code 只有在操作 API 文件时才会触发这条规则。

## OpenClaw 记忆系统

OpenClaw 的记忆架构相对简洁，核心只有两层：

- **MEMORY.md**：Agent 工作区根目录，存储长期事实、用户偏好、行为规则。每次会话启动时全量加载，永不被压缩丢弃。
- **Daily Logs**：`memory/YYYY-MM-DD.md`，append-only 的日志文件，按日期记录每天的活动、观察和决策过程。

### 身份注入文件体系

OpenClaw 将 Claude Code 写死在 system prompt 中的内容拆分为独立可编辑文件：

| 文件 | 用途 |
|------|------|
| `SOUL.md` | Agent 人格和语气风格 |
| `AGENTS.md` | 行为边界定义 |
| `USER.md` | 用户画像 |
| `IDENTITY.md` | 快速参考信息 |

这种拆分设计允许非技术用户直接编辑 Agent 的身份和行为配置，无需修改代码或 system prompt。

## 写入机制对比

### Claude Code 的三条写入路径

Claude Code 的记忆写入有三条相互配合的路径：

**1. 后台自动提取（extractMemories）**

这是一个 forked subagent，与主 Agent 共享 prompt cache 但独立运行。在用户与主 Agent 对话时，后台进程默默分析最近几轮对话，判断是否有值得长期记住的信息，如有则写入 Auto Memory 目录下的主题文件，同时更新 MEMORY.md 索引。

subagent 的权限被严格限制：只能读任意文件，只能写 Auto Memory 目录内的文件，Bash 只能执行只读命令。

提取的记忆分为四类：

- **user**：用户偏好和角色
- **feedback**：用户对 Claude 行为的纠正
- **project**：不可从代码推导的项目知识
- **reference**：外部工具的使用参考

系统明确排除当前代码结构、文件路径列表等可直接推导的信息。

**2. Auto Dream（梦境整理）**

这是 Claude Code 最具浪漫色彩的设计：每 24 小时，如果期间有 5 个以上的会话，系统会触发一次"做梦"——一个 forked subagent 扫描最近会话 transcript，结合已有记忆做整合：去重、合并、更新过时信息、蒸馏新洞察。

三重门控确保不会乱触发：

- **时间门控**：距上次 ≥ 24h
- **会话门控**：期间 ≥ 5 个会话
- **锁门控**：没有其他进程在整理

这个设计模拟了人类睡眠时的记忆整合机制——白天经历各种事，晚上大脑自动整理归档。

**3. Session Memory（会话级摘要）**

当对话 token 数超过阈值，系统让 forked subagent 将当前对话压缩成摘要，存到 `.claude/sessions/<id>/SESSION_MEMORY.md`。这个摘要在 auto-compact（上下文压缩）时作为输入，帮助保留关键信息。

### OpenClaw 的写入机制

OpenClaw 的写入方式更为直接：

- **Agent 自主决定写入**：没有后台 subagent，没有定时任务，Agent 在对话过程中自行判断"这个信息以后会用到"然后写入。
- **Pre-compaction Flush（防丢机制）**：当 context window 快满需要压缩时，系统先插入一个"silent turn"（用户看不到的隐藏对话轮次），强制让 Agent 审视当前对话，把重要信息写入 MEMORY.md 或日志，然后才执行压缩。

OpenClaw 的 Pre-compaction Flush 设计解决了一个现实问题：压缩会丢信息。Claude Code 靠 Session Memory 摘要缓解，但摘要本身是有损的；OpenClaw 的做法更粗暴但更可靠——**压缩前强制存盘，你丢你的，我已经把重要的存好了**。

> **一个靠"梦境"定期整理，一个靠"临终遗言"防丢失。都不优雅，但都管用。**

## 检索机制对比：核心分歧

这是两者最根本的设计分歧。

### Claude Code：LLM 语义路由

Claude Code 的召回分"硬"、"软"两路：

- **硬召回**：CLAUDE.md 系列规则文件每次全量塞进 system prompt，保证行为一致性，代价是占用 context。
- **软召回**：MEMORY.md 索引文件（限 200 行 / 25KB）全量加载到 system prompt，但索引中链接的主题文件（`user_preferences.md`、`feedback_styling.md` 等）不会全量加载。系统使用 Sonnet 做 sideQuery：把所有记忆文件的 frontmatter（name、description、type）发给 Sonnet，加上当前用户查询，让它选择最多 5 个"确定会有帮助的"记忆文件。

sideQuery 还会传入 `recentTools`（最近使用的工具列表），告诉 Sonnet"这些工具的文档不用选了，主 Agent 已经在用了"，防止把正在用的工具 API 文档误选为"相关记忆"。

**整个过程没有 embedding，没有向量数据库，纯靠另一个 LLM 的理解力做检索。**

### OpenClaw：SQLite 混合搜索

OpenClaw 所有 markdown 文件被索引到 SQLite 数据库（`~/.openclaw/memory/agentId.sqlite`），采用双路并行搜索：

1. **文本分块（Chunking）**
2. **生成 embedding 向量**，存入 `chunks_vec` 虚拟表（使用 sqlite-vec 扩展）
3. **建立 FTS5 全文索引**（`chunks_fts` 表），支持 BM25 排名

搜索时双路并行：

- **向量检索**：embedding 余弦相似度
- **关键词检索**：BM25 匹配
- **融合**：Reciprocal Rank Fusion 加权合并

如果 sqlite-vec 扩展不可用，还有降级方案——回退到 JavaScript 内存中计算余弦相似度。

OpenClaw 的 `memory_search` 返回的是 snippets（文件路径 + 行号范围 + 片段 + 分数），Agent 如需更多上下文再用 `memory_get` 按行号范围精确读取。这比 Claude Code 的"选中就全量注入文件"**更节省 context**。

### 索引同步机制

OpenClaw 的索引有增量同步机制：File Watcher 监听文件变更，通过 content hash 跳过未变更文件。需要全量重建时（比如换了 embedding 模型），先在临时 DB 构建，然后原子 swap，不影响正在运行的查询。

## 哲学分歧：信模型 vs 信向量

| 维度 | Claude Code | OpenClaw |
|------|-------------|----------|
| 核心理念 | LLM 已经够聪明，不需要额外检索基础设施 | LLM 会犯错，确定性任务交给传统工程 |
| 检索方式 | 一次 Sonnet 调用替代整套 RAG 管道 | embedding + BM25 保证搜索质量 |
| 架构复杂度 | 极简：全是 markdown，无数据库 | 多一层基础设施维护 |
| 记忆规模 | 文件数量多了后 LLM 挑选准确性存疑 | 更可控但需要维护 embedding 模型 |

Claude Code 的潜台词是"**信任模型的理解力**"，愿意用一次 LLM 调用替代整套 RAG 管道。这个选择让系统架构极度简洁：全是 Markdown 文件，没有数据库，没有 embedding 模型，git 就能管理一切。

OpenClaw 的潜台词是"**确定性任务交给传统工程方案**"，搜索质量由 embedding 模型和 BM25 算法保证，不依赖 LLM 的"心情"。代价是多了一层基础设施要维护。

## 共同点：Markdown 作为真相源

两者在一件事上高度一致：**源文件都是 Markdown**。

- Claude Code 的 CLAUDE.md、Auto Memory、Team Memory 都是 Markdown
- OpenClaw 的 MEMORY.md、Daily Logs 都是 Markdown
- 索引层（无论是 LLM sideQuery 还是 SQLite）都是派生物，**随时可以从 Markdown 重建**

这意味着人可以随时用文本编辑器直接改记忆，`git diff` 能看到记忆变化，版本控制天然支持。这比把记忆锁在向量数据库里**优雅太多**。

## 作者结论

作者认为当前没有标准答案，但最终方案大概率是**两者混合：向量粗筛 + LLM 精选**。

搜索引擎干了二十年的事——从目录索引到 Google 的 PageRank + TF-IDF，Agent 记忆系统迟早走到同一条路上。向量检索负责快速海选，LLM 负责精确精选，两者各展所长。

Claude Code 的 Auto Dream"梦境整理"隐喻尤为优雅：Agent 白天干活，晚上做梦整理记忆——这哪是在写代码，这是在**造数字生命的雏形**。

## 深度分析

### 1. 两种记忆哲学的本质是工程确定性与模型灵活性的权衡

Claude Code 与 OpenClaw 的根本分歧，本质上是软件工程中"确定性"与"灵活性"之间永恒张力的体现。Claude Code 选择信任 LLM 的理解力，用一次 Sonnet 调用替代整套 RAG 管道，这意味着当记忆文件数量膨胀时，LLM 的选择准确性会面临挑战。OpenClaw 则将确定性任务交给 embedding + BM25 算法，不依赖 LLM 的"心情"。这一分歧揭示了一个深层问题：Agent 记忆系统究竟是信息检索问题，还是语义理解问题？前者适合向量索引，后者适合 LLM 路由。简单的记忆召回（"我上次用什么参数跑的这个脚本？"）向量检索足够；复杂的上下文推理（"这段代码的风格跟我之前的项目偏好是否一致？"）需要 LLM 的语义理解。

### 2. Auto Dream 设计揭示了 Agent 记忆整合的周期性规律

Claude Code 的 Auto Dream 机制通过三重门控（时间 ≥24h、会话 ≥5 次、无锁）模拟了人类睡眠时的记忆整合过程。这一设计的深层意义在于：Agent 记忆系统需要区分"即时反应"与"长期整合"两种不同处理模式。即时反应依赖当前上下文，长期知识则需要周期性的离线整理。这种周期性整合机制避免了记忆的无限膨胀，同时通过去重、合并、更新等操作保持记忆的时效性和准确性。这一设计理念对构建长期运行的 Agent 系统具有重要参考价值。

### 3. 两者以 Markdown 为真相源的设计具有深远的工程意义

无论是 Claude Code 还是 OpenClaw，都将 Markdown 文件作为记忆的原始存储介质。这意味着索引层（无论是 LLM sideQuery 还是 SQLite）都是随时可重建的派生物。这一设计带来三个关键优势：人可以直接用文本编辑器修改记忆、`git diff` 提供了原生的版本控制能力、记忆变化历史可追溯可回滚。相比之下，将记忆锁在向量数据库里会丧失这些能力。从工程实践看，任何记忆系统的最终目标都应该是：人类可以无障碍地理解和修改 AI 的记忆内容。

### 4. OpenClaw 的 Pre-compaction Flush 解决了上下文压缩中的有损问题

OpenClaw 在压缩前强制让 Agent 执行一次"silent turn"，将重要信息写入 MEMORY.md 或日志，再执行压缩。这比 Claude Code 的 Session Memory 摘要方案更直接可靠——因为摘要本身就是有损的。这一设计体现了工程实践中"防御性编程"的思路：在不可逆事件（压缩）发生前，强制执行数据保全。对于构建生产级 Agent 系统而言，上下文压缩是不可避免的，但压缩前的主动存盘机制决定了重要信息能否被保留。

### 5. 两者分歧的收敛方向是"向量粗筛 + LLM 精选"混合架构

作者在文末判断，最终方案大概率是向量检索与 LLM 精选的结合。这一判断与搜索引挚二十年发展史高度吻合：从目录索引到 Google 的 PageRank + TF-IDF，Web 搜索经历了从词匹配到语义理解的演进。Agent 记忆系统正在重走这条路。向量检索负责在海量记忆中快速海选候选集（高效但机械），LLM 负责从候选集中精确精选真正相关的记忆（精准但昂贵）。两阶段架构在成本与效果之间取得平衡，是当前技术条件下的最优解。

## 实践启示

### 1. 构建 Agent 记忆系统时，优先考虑 Markdown 原生架构而非直接上向量数据库

向量数据库在 Agent 记忆场景中存在三个固有缺陷：向量更新成本高且实时性差、召回率对 Agent 场景不够用（Agent 判断需要 ≥97% 准确率）、增加了一个新的故障点和延迟源。对于大多数 Agent 应用场景，更实用的方案是：记忆以 Markdown 文件存储，用 LLM 做路由召回，仅在记忆规模超过 LLM 处理能力时引入向量索引做粗筛。这意味着初期可以用极简架构快速验证场景，之后按需升级到混合架构。

### 2. 记忆写入应区分"即时写入"与"定期整合"两种机制

Claude Code 的 extractMemories（后台自动提取）和 Auto Dream（梦境整理）构成了一套互补的记忆写入体系。即时写入负责捕获新产生的关键信息，定期整合负责去重、合并和更新过时记忆。构建 Agent 系统时，应该同时实现这两种机制：主 Agent 在对话过程中判断并写入重要信息，同时设置一个低频的周期性整合任务（如每天或每 N 个会话）对积累的记忆做一次全面整理。缺乏定期整合的记忆系统会随时间积累大量冗余和过时信息。

### 3. 在上下文压缩前必须实现主动存盘机制

OpenClaw 的 Pre-compaction Flush 设计解决了压缩导致信息丢失的根本问题。任何 Agent 系统在实现上下文压缩功能时，都应该在压缩执行前强制让 Agent 将当前对话中的重要信息写入长期记忆。具体实现可以是：在压缩触发时插入一个"silent turn"，让 Agent 自主判断并写入关键信息到 MEMORY.md 或类似的长期存储，然后再执行实际的压缩操作。这比事后补救（依赖摘要）更可靠。

### 4. 记忆文件的可见性层级设计应与代码库权限模型对齐

Claude Code 的六层记忆架构与软件工程中的权限模型高度对齐：Managed 层对应系统级策略（/etc），User 层对应用户私有配置（~/.），Project 层对应团队共享（入 Git），Local 层对应个人配置（不入 Git）。在企业场景中，这种分层设计使得不同粒度的记忆可以被恰当地管理和同步。如果需要构建支持团队协作的 Agent 系统，记忆的可见性层级应该与团队代码库权限模型保持一致，避免私有配置被意外共享或团队知识无法同步的问题。

### 5. 评估记忆系统设计时，应关注"索引是否可重建"这一关键属性

无论是 LLM sideQuery 还是 SQLite 索引，都是从 Markdown 源文件派生的派生物。这意味着任何时候都可以通过重新索引原始 Markdown 文件来重建完整的记忆检索能力。在评估或设计 Agent 记忆系统时，应该将"索引可重建性"作为核心要求：向量数据库迁移、embedding 模型升级、LLM 路由策略调整等情况发生时，只要源文件完好，记忆就能完整恢复。这一属性也使得记忆系统的版本控制和审计成为可能。

## 相关实体
- [Claude Code Openclaw Memory Comparison](ch01-681-claude-code-memory-setup-obsidian-graphify.html)
- [Claude Code Openclaw Usage Ettin](ch09-028-claude-code-openclaw-usage-ettin.html)
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](ch05-014-harness-到底是什么-看看-openclaw-hermes-claude-code-的演绎吧.html)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch01-255-anthropic-博客-claude-code-大型代码库最佳实践.html)
- [读完 Claude Code 和 Openclaw 的 Memory 源码我对Agent记忆需要向量数据库这件事产生了怀疑](ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-openclaw-memory-comparison.md)

- [从 openclaw 到 openhuman：私人 ai runtime 的雏形](ch04-123-karpathy-vibe-coding-agentic-engineering.html)

## 相关实体

- [`Agent Memory 架构本质`](ch04-088-agent-memory.html)
- [`AI Agent 记忆系统`](ch11-193-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单.html)
- [`AgentMemory 本地记忆`](ch09-034-agentmemory.html)
- MOC

---
