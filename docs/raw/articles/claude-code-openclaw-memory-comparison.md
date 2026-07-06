---
title: "claude code openclaw memory comparison"
type: raw
source: wechat
source_url: https://mp.weixin.qq.com/s/m4wzwXCJoW5Tu4GA5ROodw
tags: [wechat, article, claude, openai]
ingested: 2026-05-09
feed_name: 科技充电站
wechat_mp_fakeid: MP_WXS_3237134318
source_published: 2026-04-01
sha256: 3eecc32d249ecb48
review_value: 9
review_confidence: 10
review_stars: 5
review_product: 87
review_recommendation: STRONG
created: 2026-05-10
updated: 2026-05-10
---
# 读完 Claude Code 和 OpenClaw 的 memory 源码，我对"Agent记忆需要向量数据库"这件事产生了怀疑……
大家好，我是行小招。 
这两天在研究 agent 的记忆系统，读完 Claude Code 和 OpenClaw 的记忆系统源码，我发现一个有意思的分歧：同样是"让 Agent 记住东西"，一个选择信 LLM 的理解力，另一个选择老老实实建向量索引。 
这俩都是当下最有代表性的 Agent 框架。Claude Code 是 Anthropic 官方的开发者 CLI，按需启动，面向团队协作，OpenClaw 是 local-first 的个人 Agent 运行时，7×24 小时在线，能接 WhatsApp、Slack、Discord，定位不同，但"记忆"这件事两边都得解决，解法却截然不同。 
先说 Claude Code，它的记忆是我见过最卷的分层设计，6 层 markdown 文件，每层有独立的读写权限和生命周期： 
  * • **Managed** ： ` /etc/claude-code/CLAUDE.md ` ，系统管理员写的全局策略，所有用户都得遵守，企业场景下用来统一规范 
  * • **User** ： ` ~/.claude/CLAUDE.md ` ，用户私有的全局指令，比如"我喜欢简洁回答"、"用 bun 不用 npm"，不入库，只自己可见 
  * • **Project** ：项目根目录的 ` CLAUDE.md ` \+ ` .claude/rules/*.md ` ，团队共享的项目规则，入 git，比如"API 路由用 kebab-case" 
  * • **Local** ： ` CLAUDE.local.md ` ，个人的项目级配置，不入 git，比如"我本地的 staging 环境地址是 xxx" 
  * • **Auto Memory** ： ` ~/.claude/projects/<path>/memory/ ` 目录下的一组主题文件，由后台 Agent 自动提取，这是整个系统最有意思的部分，后面细说 
  * • **Team Memory** ：Auto Memory 目录下的 ` team/ ` 子目录，组织级别的共享知识，可以跨仓库同步 
这 6 层的加载顺序是从 Managed 到 Team，后加载的优先级更高，而且 Project Memory 的发现是从文件系统根目录一路遍历到当前工作目录的，离 CWD 越近的优先级越高。 
还有个细节：这些 markdown 文件支持 ` @path ` 指令引用其他文件，最多 5 层递归，可以构建树状的规则结构， ` .claude/rules/ ` 下的文件还支持 frontmatter 里写 glob pattern，只在操作匹配路径的文件时才生效，比如你写一条规则说"src/api 下的文件必须用 zod 校验输入"，Claude 只有在碰 API 文件的时候才会看到这条规则。 
OpenClaw 简单得多，核心就两层： 
  * • **MEMORY.md** ：Agent 工作区根目录，存长期事实、用户偏好、行为规则，每次会话启动时全量加载，永远不会被压缩丢弃 
  * • **Daily Logs** ： ` memory/YYYY-MM-DD.md ` ，append-only 的日志文件，按日期一天一个，记录每天的活动、观察、决策过程 
除此之外 OpenClaw 还有一套身份注入文件： ` SOUL.md ` 定义 Agent 人格和语气风格， ` AGENTS.md ` 定义行为边界， ` USER.md ` 存用户画像， ` IDENTITY.md ` 是快速参考信息。这些在 Claude Code 里都是写死在 system prompt 里的，OpenClaw 把它们拆成了可编辑的独立文件。 
**Claude Code 在用企业级权限模型管记忆，OpenClaw 在用个人笔记本的逻辑。不是谁更好，是服务的场景不同**
##  什么时候存：三种截然不同的写入机制 
Claude Code 的记忆写入有三条路径，互相配合。 
**第一条：后台自动提取（extractMemories）。** 这是个 forked subagent，和主 Agent 共享 prompt cache 但独立运行，你和主 Agent 聊天的时候，这个后台进程在默默分析最近几轮对话，判断有没有值得长期记住的信息，有的话就写入 Auto Memory 目录下的主题文件，同时更新 MEMORY.md 索引。 
这个 subagent 权限被严格限制：只能读任意文件，只能写 Auto Memory 目录内的文件，Bash 只能跑只读命令，防止后台进程搞出意外。 
它提取的记忆分四类：user（用户偏好和角色）、feedback（用户对 Claude 行为的纠正）、project（不可从代码推导的项目知识）、reference（外部工具的使用参考），明确排除当前代码结构、文件路径列表这些可以从代码直接推导的信息。 
还有个精巧的设计：如果主 Agent 在当前对话中已经响应用户指令写了记忆（比如用户说"记住这个"），后台 subagent 会跳过这些消息，避免重复。 
**第二条：Auto Dream（梦境整理）。** 这是我觉得整个系统最浪漫的设计，每 24 小时，如果期间有 5 个以上的会话，系统会触发一次"做梦"，一个 forked subagent 扫描最近的会话 transcript 日志，结合已有记忆做一次整合：去重、合并、更新过时信息、蒸馏新洞察。 
三重门控确保不会乱触发：时间门控（距上次 ≥ 24h）、会话门控（期间 ≥ 5 个会话）、锁门控（没有其他进程在整理），这不就是人类睡觉时的记忆整合吗，白天经历各种事，晚上大脑自动整理归档。 
**第三条：Session Memory（会话级摘要）。** 这不是长期记忆，而是当前会话的滚动摘要，当对话 token 数超过阈值，系统会让一个 forked subagent 把当前对话压缩成摘要，存到 ` .claude/sessions/<id>/SESSION_MEMORY.md ` 。这个摘要在 auto-compact（上下文压缩）时作为输入，帮助保留关键信息。 
再看 OpenClaw 这边，写入方式更直接。 
**Agent 自主决定写入。** OpenClaw 的 Agent 自己判断什么时候该往 MEMORY.md 或 Daily Log 写东西，没有后台 subagent，没有定时任务，就是 Agent 在对话过程中觉得"这个信息以后会用到"就写。 
**Pre-compaction Flush（防丢机制）。** 这是 OpenClaw 最有特色的设计，当 context window 快满了需要压缩时，系统不是直接压缩，而是先插入一个"silent turn"，这是一个用户看不到的隐藏对话轮次，强制让 Agent 审视当前对话，把重要信息写入 MEMORY.md 或日志，然后才执行压缩。 
这个设计解决了一个很现实的问题：压缩会丢信息，Claude Code 靠 Session Memory 摘要来缓解，但摘要本身就是有损的。OpenClaw 的做法更粗暴但更可靠：压缩前强制存盘，你丢你的，我已经把重要的存好了。 
**一个靠"梦境"定期整理，一个靠"临终遗言"防丢失。都不优雅，但都管用**
##  怎么找回来：信模型 vs 信向量 
这是两者最根本的分歧。 
###  Claude Code：LLM 语义路由 
Claude Code 的召回分两路，一路"硬"一路"软"。 
硬的部分：CLAUDE.md 系列规则文件，每次全量塞进 system prompt，不管你这次聊的是什么，所有规则都在，保证行为一致性，代价是占 context。 
软的部分：Auto Memory 的召回。MEMORY.md 索引文件（限 200 行 / 25KB）全量加载到 system prompt，但索引里链接的那些主题文件（ ` user_preferences.md ` 、 ` feedback_styling.md ` 之类）不会全加载，系统用 Sonnet 做一次 sideQuery：把所有记忆文件的 frontmatter（name、description、type）发给 Sonnet，加上当前用户的查询，让它挑最多 5 个"确定会有帮助的"记忆文件，选中的文件内容作为 attachment 注入当前对话。 
这里有个细节：sideQuery 还会传入 ` recentTools ` （最近使用的工具列表），告诉 Sonnet "这些工具的文档不用选了，主 Agent 已经在用了"，防止把正在用的工具 API 文档误选为"相关记忆"。 
整个过程没有 embedding，没有向量数据库，纯靠另一个 LLM 的理解力来做检索。 
###  OpenClaw：SQLite 混合搜索 
OpenClaw 也有全量加载的部分：MEMORY.md 加上 today 和 yesterday 两天的日志，每次会话启动时直接塞进 context，保证最近的上下文不丢。 
但历史记忆的检索走的是完全不同的路线，所有 markdown 文件会被索引到一个 SQLite 数据库（ ` ~/.openclaw/memory/agentId.sqlite ` ）： 
  1. 1\. 文本分块（Chunking） 
  2. 2\. 每个 chunk 生成 embedding 向量，存进 ` chunks_vec ` 虚拟表（用 sqlite-vec 扩展） 
  3. 3\. 同时建 FTS5 全文索引（ ` chunks_fts ` 表），支持 BM25 排名 
搜索时双路并行：一路 embedding 余弦相似度，一路 BM25 关键词匹配，最后用 Reciprocal Rank Fusion 加权合并两路结果，如果 sqlite-vec 扩展不可用还有降级方案，回退到 JavaScript 内存中计算余弦相似度。 
Agent 拿到搜索结果后，用 ` memory_search ` 得到的是 snippets（文件路径 + 行号范围 + 片段 + 分数），不是完整文件，如果需要更多上下文再用 ` memory_get ` 按行号范围精确读取，这比 Claude Code 的"选中就全量注入文件"更节省 context。 
索引还有增量同步机制：File Watcher 监听文件变更，通过 content hash 跳过未变更文件，需要全量重建时（比如换了 embedding 模型）先在临时 DB 构建，然后原子 swap，不影响正在运行的查询。 
**Claude Code 赌 LLM 理解力够用，OpenClaw 赌 embedding 质量够好。前者省维护，后者更可控**
##  一个分歧，两种信仰 
体感上这不只是技术选型的区别。 
Claude Code 的潜台词是"LLM 已经够聪明了，不需要额外的检索基础设施"，它信任模型的理解力，愿意用一次 Sonnet 调用替代整套 RAG 管道，这个选择让系统架构极度简洁：全是 markdown 文件，没有数据库，没有 embedding 模型， ` git ` 就能管理一切。代价是当记忆文件数量多了以后，让 LLM 从几百个 frontmatter 里选 5 个，准确率是个问号。 
OpenClaw 的潜台词是"LLM 会犯错，确定性任务还是交给传统工程方案"，所以它建了 SQLite 索引层，搜索质量由 embedding 模型和 BM25 算法保证，不依赖 LLM 的"心情"，代价是多了一层基础设施要维护：embedding 模型更新、索引重建、sqlite-vec 扩展兼容性。 
但两者在一件事上高度一致： **源文件都是 Markdown** 。Claude Code 的 CLAUDE.md 是 markdown，Auto Memory 是 markdown，OpenClaw 的 MEMORY.md 是 markdown，Daily Logs 是 markdown，索引层（无论是 LLM sideQuery 还是 SQLite）都是派生物，随时可以从 markdown 重建。 
这意味着人可以随时用文本编辑器直接改记忆， ` git diff ` 能看到记忆变化，版本控制天然支持，这比把记忆锁在向量数据库里优雅太多了。 
现在没有标准答案，但我越来越觉得最终方案大概率是两者混合：向量粗筛加 LLM 精选。搜索引擎干了二十年的事，Agent 记忆系统迟早走到同一条路上。 
ps：Claude Code 的 Auto Dream "梦境整理"这个隐喻是真优雅。Agent 白天干活，晚上做梦整理记忆，这哪是在写代码，这是在造数字生命的雏形啊。 
* * *
我是行小招，持续探索 AI 在个人和企业中的落地场景，交给 AI 的是任务，留给自己的是思考。欢迎转发给你身边做技术和产品的同学，一起追逐这个时代！