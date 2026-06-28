## Ch06.005 claude code openclaw memory comparison

> 📊 Level ⭐⭐ | 19.1KB | `entities/claude-code-openclaw-memory-comparison.md`

## 概述

本文深入对比了 `Claude Code` 和 OpenClaw 两类主流 自主Agent 框架的记忆系统设计。两者代表了截然不同的记忆架构哲学：**Claude Code 信任 LLM 的语义理解能力，采用纯 Markdown + LLM 路由的方案**；**OpenClaw 则采用传统工程路线，以 SQLite 向量索引为核心**。

两个框架的定位差异决定了记忆系统的设计方向：Claude Code 作为 `Anthropic` 官方的开发者 CLI，按需启动，面向团队协作和企业环境；OpenClaw 作为 local-first 的个人 Agent 运行时，7×24 小时在线，可接入 WhatsApp、Slack、Discord 等平台。

## Claude Code 六层记忆架构

Claude Code 采用了目前最为复杂的分层记忆设计，六层 Markdown 文件各有独立的读写权限和生命周期：

| 层级 | 文件位置 | 用途 | 可见性 |
|------|----------|------|--------|
| Managed | `/etc/claude-code/CLAUDE.md` | 系统级全局策略 | 所有用户 |
| User | `~/.claude/CLAUDE.md` | 用户私有全局指令 | 仅用户本人 |
| Project | `CLAUDE.md` + `.claude/rules/*.md` | 团队共享项目规则 | 入 Git |
| Local | `CLAUDE.local.md` | 个人项目配置 | 不入 Git |
| Auto Memory | `~/.claude/projects/<path>/memory/` | 后台自动提取的主题文件 | 自动整理 |
| Team Memory | `memory/team/` 子目录 | 组织级共享知识 | 跨仓库同步 |

记忆文件的加载顺序从 Managed 到 Team，后加载的优先级更高。Project Memory 的发现机制从文件系统根目录一路遍历到当前工作目录（CWD），**离 CWD 越近的文件优先级越高**。

### @path 指令与条件规则

Claude Code 的 Markdown 记忆文件支持 `@path` 指令引用其他文件，最多 5 层递归，可构建树状规则结构。`.claude/rules/` 下的文件还支持在 frontmatter 中写 glob pattern，**只在操作匹配路径的文件时才激活对应规则**。

例如，一条规则可以写为"src/api 下的文件必须用 zod 校验输入"，Claude Code 只有在操作 API 文件时才会触发这条规则，避免无关上下文的干扰。

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

## 检索机制对比：核心分歧

这是两者最根本的设计分歧。

### Claude Code：LLM 语义路由

Claude Code 的召回分"硬"、"软"两路：

- **硬召回**：CLAUDE.md 系列规则文件每次全量塞进 system prompt，保证行为一致性，代价是占用 context。
- **软召回**：MEMORY.md 索引文件（限 200 行 / 25KB）全量加载到 system prompt，但索引中链接的主题文件（`user_preferences.md`、`feedback_styling.md` 等）不会全量加载。系统使用 Sonnet 做 sideQuery：把所有记忆文件的 frontmatter（name、description、type）发给 Sonnet，加上当前用户查询，让它选择最多 5 个"确定会有帮助的"记忆文件。

sideQuery 还会传入 `recentTools`（最近使用的工具列表），告诉 Sonnet"这些工具的文档不用选了，主 Agent 已经在用了"，防止把正在用的工具 API 文档误选为"相关记忆"。

**整个过程没有 embedding，没有向量数据库，纯靠另一个 LLM 的理解力做检索**。

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

## 哲学分歧

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

## 未来展望

当前没有标准答案，但作者认为最终方案大概率是**两者混合：向量粗筛 + LLM 精选**。

搜索引擎干了二十年的事——从目录索引到 Google 的 PageRank + TF-IDF，Agent 记忆系统迟早走到同一条路上。向量检索负责快速海选，LLM 负责精确精选，两者各展所长。

Claude Code 的 Auto Dream"梦境整理"隐喻尤为优雅：Agent 白天干活，晚上做梦整理记忆——这哪是在写代码，这是在**造数字生命的雏形**。

> [!contradiction] 参见 Agent 记忆生命周期哲学 — 持相反观点认为"向量数据库是必要的"

## 相关实体
- [Claude Code Openclaw Memory Vector Db Doubt](ch01-681-claude-code-memory-setup-obsidian-graphify.html)
- [Claude Code Openclaw Usage Ettin](ch09-028-claude-code-openclaw-usage-ettin.html)
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](ch05-014-harness-到底是什么-看看-openclaw-hermes-claude-code-的演绎吧.html)
- [读完 Claude Code 和 Openclaw 的 Memory 源码我对Agent记忆需要向量数据库这件事产生了怀疑](ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件.html)
- [Skill System Design Three Way Comparison](ch01-215-openclaw-hermes.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-openclaw-memory-comparison.md)

- [Local Vs Cloud Agent Deployment Strategy](ch04-345-cloud-agent-development-environments-cursor-agent.html)
- [agent资本市场：自主agent融资框架与批判](ch04-213-ahe-agentic-harness-engineering.html)
- [claude code 从 demo 到产线 · 企业 harness 工程化的 8 道关卡（黄佳/咖哥 csdn）](ch09-014-claude-code-从-demo-到产线-企业-harness-工程化的-8-道关卡-黄佳-咖哥-csdn.html)
- [从 openclaw 到 openhuman：私人 ai runtime 的雏形](ch04-123-karpathy-vibe-coding-agentic-engineering.html)

- [claude code 1.0.24 工具调用安全事故：静默删 .gitignore 与 redis flush 复盘](ch01-223-personal-ai-claude-18.html)

- MOC
## 深度分析

1. **LLM 路由 vs 向量索引代表两种工程哲学的根本分歧**。Claude Code 用 Sonnet 做 sideQuery 选择记忆文件，本质上是"信任模型理解力"的延续——同样的模型已经能写出好代码，理解一段文字描述是否"相关"不过是另一个文本推理任务。而 OpenClaw 用 sqlite-vec + BM25，是将记忆检索当作一个信息检索问题，用 decades 验证过的算法而非模型"心情"来保证质量下限。两者分歧的根源不在技术能力，而在**愿意为确定性付出多少工程复杂度代价**。

2. **Auto Dream 的"梦境整合"机制是 Agent 系统里最接近长期记忆巩固的设计**。人类睡眠时的记忆 consolidation（海马体→皮层的记忆迁移）一直没有好的数字对应物，Claude Code 的三重门控（时间≥24h + 会话≥5 + 锁）把这个模拟得相当接近。区别在于：人类做梦时会有情绪参与（杏仁核相关），而 Claude Code 的 subagent 只是在做去重合并。但即使是这个简陋版本，也让系统有了"不丢重要信息"之外的另一个价值——**记忆之间的关联发现**，这正是 OpenClaw 的 append-only 日志所缺乏的。

3. **Pre-compaction Flush 解决的是 context compression 的有损性问题**，这个问题在 OpenClaw 7×24 小时在线的运行模式下比 Claude Code 的按需启动模式严重得多。Claude Code 每次启动都有完整上下文加载机会，OpenClaw 的长会话一旦压缩，丢失的信息可能是跨天的长期偏好。但 OpenClaw 的"临终遗言"方案是主动写入而非被动摘要，Agent 自己判断什么是重要的，比让 subagent 猜更准确——**代价是 Agent 的指令开销和 token 消耗**。

4. **两种系统最终收敛于"向量粗筛 + LLM 精选"的混合路线**。这不是预测，已经是事实：OpenClaw 的向量检索需要 LLM 做最后的上下文理解（`memory_get` 按行号读），Claude Code 的 LLM 语义路由在记忆量大时也面临穷尽式遍历问题。两者的短板都在对方的长板上：Claude Code 需要向量检索做 scale-out，OpenClaw 需要 LLM 做 semantic 理解。这条路二十年前搜索引擎走过——早期的 Google 是 PageRank + 人工目录，后来演变成 TF-IDF + 机器学习排名。

5. **Markdown 作为 source of truth 是两者最重要的设计共识**，比任何技术选择都更有深远影响。把记忆存在文本文件里，意味着人可以随时编辑、git 能追踪变化、diff 能看到演变历史。这比任何向量数据库都更符合"记忆是知识"而非"记忆是 embedding"的本质。Agent 记忆系统的终极形态大概率不是向量数据库，而是一个**人类和 Agent 都能读写的结构化文本层**。

## 实践启示

1. **优先建立 MEMORY.md + 日期日志的基础架构**，再考虑向量索引。对于个人 Agent 或小团队，先用 OpenClaw 的双层架构验证"哪些信息真的需要长期记住"，而不是一开始就上整套 RAG 管道。记忆系统的价值在于减少重复沟通，不在于技术复杂度。

2. **Pre-compaction Flush 值得在任何长上下文 Agent 系统中实现**。无论用 Claude Code 还是其他框架，在 context window 触发压缩前强制 Agent 审视并显式写入重要信息，是防止有损压缩丢失关键记忆的最简单方案。这个设计不依赖任何框架特性，任何支持 tool-use 的 Agent 都能实现。

3. **用 git 管理记忆文件是零成本的审计和回滚能力**。Claude Code 的 Project Memory 入 Git 意味着每次 commit 都在做记忆快照。但这个能力目前被严重低估——当 Agent 记住了一个错误偏好或过时规则，git revert 就是最优雅的回滚，比任何"遗忘机制"都简单。

4. **为 Agent 建立身份注入文件（SOUL.md / IDENTITY.md / USER.md）**，把人格、边界、用户画像从 system prompt 中拆出来。这不只是一个工程最佳实践，更是一种**对 Agent 行为的版本控制**——改了 USER.md 的用户画像，不需要改代码，只需要改文件。

5. **sideQuery 传入 recentTools 是防止工具文档被误选为"相关记忆"的关键细节**。在实现自己的 Agent 记忆系统时，这个细节不能遗漏——否则 Agent 会倾向于把工具 API 文档当成记忆来用，既浪费 context 又容易产生幻觉。OpenClaw 的 sqlite-vec 方案天然没有这个问题，因为它是按 chunk 内容相关性而非"是否用过"来排序的。

## 相关概念

- Agent 记忆系统设计
-

- 上下文管理：Agent 系统
-
-

---
