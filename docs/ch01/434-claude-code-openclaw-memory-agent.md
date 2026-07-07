# 读完 Claude Code 和 OpenClaw 的 memory 源码，我对 Agent 记忆需要向量数据库产生怀疑

## Ch01.434 读完 Claude Code 和 OpenClaw 的 memory 源码，我对 Agent 记忆需要向量数据库产生怀疑

> 📊 Level ⭐⭐ | 10.6KB | `entities/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md`

# 读完 Claude Code 和 OpenClaw 的 memory 源码，我对"Agent记忆需要向量数据库"这件事产生了怀疑……
这两天在研究 agent 的记忆系统，读完 Claude Code 和 OpenClaw 的记忆系统源码，我发现一个有意思的分歧：同样是"让 Agent 记住东西"，一个选择信 LLM 的理解力，另一个选择老老实实建向量索引。
这俩都是当下最有代表性的 Agent 框架。Claude Code 是 Anthropic 官方的开发者 CLI，按需启动，面向团队协作，OpenClaw 是 local-first 的个人 Agent 运行时，7×24 小时在线，能接 WhatsApp、Slack、Discord，定位不同，但"记忆"这件事两边都得解决，解法却截然不同。
先说 Claude Code，它的记忆是我见过最卷的分层设计，6 层 markdown 文件，每层有独立的读写权限和生命周期：

* • **Managed** ： ` /etc/claude-code/CLAUDE.md ` ，系统管理员写的全局策略，所有用户都得遵守，企业场景下用来统一规范

## 相关实体
- [Claude Code Harness Deep Understanding](ch01/460-claude-code-harness-deep-understanding.html)
- [Claude Code Openclaw Memory Vector Db Doubt](../ch03/075-claude-code.html)
- [Claude Code Openclaw Memory Comparison](../ch03/075-claude-code.html)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](ch01/344-anthropic-claude-code.html)
- [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](../ch05/092-harness-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md)

## 深度分析

Claude Code 与 OpenClaw 的记忆系统分歧，本质上是两种截然不同的 AI 哲学立场在工程层面的体现。Claude Code 押注 LLM 的语义理解能力足以从少量记忆中精确定位相关内容——通过 Sonnet 进行 sideQuery，从几百个 frontmatter 中挑选 5 个最相关的记忆文件，完全绕开了向量数据库的检索范式。这种选择背后的潜台词是"LLM 已经足够聪明，不需要额外的检索基础设施"，它信任模型在上下文充足时的理解力，愿意以简洁架构换取这种灵活性。相比之下，OpenClaw 选择了更重的工程方案：SQLite + sqlite-vec 扩展做 embedding 检索，双路并行（余弦相似度 + BM25）再通过 Reciprocal Rank Fusion 加权合并。这代表的是"LLM 会犯错，确定性任务还是交给传统工程方案"的保守立场。两者没有绝对优劣，但揭示了一个核心问题：当记忆规模从几十个文件扩展到成百上千个时，LLM sideQuery 的准确率还能维持吗？

Claude Code 的六层记忆架构（Managed → User → Project → Local → Auto Memory → Team Memory）实际上是一套精心设计的权限模型与优先级体系。每一层都有独立的生命周期和可见性边界：Managed 是系统级强制策略，User 是私有偏好，Project 是团队共享，Local 是个人项目级配置，Auto Memory 是 AI 自动提取的长期记忆，Team Memory 是跨仓库的组织级知识。这种分层设计在企业场景中尤为关键——系统管理员可以通过 Managed 层强制执行安全策略（如"禁止删除日志"），而团队成员各自维护自己的 Project 和 Local 层，互不干扰。值得注意的是，这套权限体系完全基于文件系统与 frontmatter，没有运行时权限检查机制，属于"约定大于配置"的软性治理。这与 OpenClaw 将身份拆分为 SOUL.md / AGENTS.md / USER.md / IDENTITY.md 等多个独立文件的做法形成了有趣的对比——两者都在试图解决同一个问题：如何在多用户、多项目、多会话的场景下，让 AI 始终知道"我是谁、我在哪里、我该遵守什么"。

OpenClaw 的 Pre-compaction Flush 机制是本文最具工程价值的创新之一。当 context window 接近满载时，系统不是直接执行有损压缩，而是先插入一个用户不可见的"silent turn"，强制 Agent 将关键信息写入 MEMORY.md 或 Daily Log，再执行压缩。这解决了一个被大多数 Agent 系统忽视的问题：上下文压缩本身是信息丢失的最大风险点。Claude Code 的 Session Memory 摘要方案虽然也有类似思路（将对话压缩存入 SESSION_MEMORY.md），但摘要本身已经是二次加工的有损信息，而 OpenClaw 的方案更直接——强制在压缩前做一次"临终存盘"，确保最重要的事实、偏好、规则被持久化。这个设计启发了一个更大的问题：Agent 系统的记忆稳定性到底应该依赖什么机制？定时提取（如 Auto Dream）vs. 事件触发（如 Pre-compaction Flush）vs. 手动触发，哪种方式更可靠？

两者在一个关键判断上高度一致且极具启发意义：源文件全部使用 Markdown 。无论是 Claude Code 的 CLAUDE.md 系列还是 OpenClaw 的 MEMORY.md + Daily Logs，索引层（无论是 LLM sideQuery 还是 SQLite）都是派生物，随时可以从 markdown 重建。这意味着记忆系统天然具备版本控制能力——git diff 可以看到记忆的变化历史，回滚记忆就像回滚代码一样自然。这比把记忆锁在向量数据库里形成了鲜明对比：向量数据库中的记忆是"语义孤岛"，人类无法直接阅读和编辑，而 markdown 让记忆系统对人类友好，AI 与人可以在同一套记忆介质上协作。这是 Agent 记忆系统设计中一个常被忽视但至关重要的设计决策。

Auto Dream（梦境整理）机制是整个系统设计中最具哲学意味的一笔。每 24 小时触发一次记忆整合，条件是期间至少 5 个会话且距上次整理超过 24 小时，由一个 forked subagent 扫描近期会话 transcript 与已有记忆，执行去重、合并、更新过时信息、蒸馏新洞察。这三重门控（时间门控 + 会话门控 + 锁门控）确保了整理过程不会过于频繁也不会互相干扰。这个机制的本质是在模拟人类睡眠时的记忆整理过程——白天经历各种事件，夜间大脑自动将短期记忆归档为长期记忆。更深一层看，这是 AI 系统第一次在工程层面完整复现了一个生物记忆机制。当行小招感叹"这哪是在写代码，这是在造数字生命的雏形"时，他触及的是一个真实的技术前沿：Agent 的记忆系统正在从"存储-检索"的工程问题，上升为"数字意识"的哲学问题。

## 实践启示

1. **在中小型 Agent 项目中，优先考虑 LLM 语义路由而非向量数据库**。Claude Code 的实践表明，当记忆文件数量有限（几十到上百个）时，让一个 LLM 做 sideQuery 选文件，完全可以替代完整的 RAG 管道。这意味着在项目早期或记忆规模较小时，无需引入向量数据库的基础设施复杂度，纯 markdown + LLM 的方案更轻量、更易调试、更容易版本控制。

2. **建立分层记忆架构，按生命周期和可见性分离记忆**。Claude Code 的六层设计为 Agent 项目提供了一个可借鉴的模板：系统级策略（Managed）→ 用户级偏好（User）→ 团队级项目规则（Project）→ 个人级配置（Local）→ AI 自动提取（Auto Memory）→ 组织级共享（Team Memory）。不同层次的记忆有不同的更新频率、权限边界和生命周期，分层管理能显著降低记忆系统的混乱程度。

3. **在 context 压缩前，必须设计强制持久化机制**。OpenClaw 的 Pre-compaction Flush 是一个值得直接借鉴的工程方案。任何 Agent 系统都面临 context window 耗尽的问题，有损压缩会丢失关键信息。解决方案不是在压缩后打补丁，而是在压缩前插入一个"强制存盘"的环节，确保 Agent 认为重要的信息被写入持久化存储。这比事后依赖摘要恢复要可靠得多。

4. **记忆的源文件务必使用人类可读的格式，markdown 是最优选择**。Claude Code 和 OpenClaw 在这一点上殊途同归，都选择了 markdown 作为记忆的原始存储格式。这保证了：人类可以直接用文本编辑器修改记忆，git 可以追踪记忆的变化历史，AI 可以在任何时候从 markdown 重建索引层。如果记忆一开始就存在向量数据库中，这一切都不可能实现。

5. **考虑引入定时"记忆整理"机制，而非仅依赖事件驱动**。Claude Code 的 Auto Dream 每 24 小时整理一次记忆，这是一个被大多数 Agent 系统忽视的机制。人类在睡眠时整理记忆，AI 也需要一个类似的周期性维护窗口——去重、合并过时信息、提炼新洞察。这比单纯依赖用户提问或 Agent 主动写入要更系统化，能显著提升记忆的长期质量。

---

