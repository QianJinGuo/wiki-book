## Ch06.009 Hermes Agent 爱马仕的三级 memory，到底在记什么？

> 📊 Level ⭐⭐ | 13.5KB | `entities/hermes-agent-three-layer-memory-architecture-one.md`

[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-three-layer-memory-architecture-one.md)

## 第一层：两份很小、但每轮都会带上的 Markdown memory

图里第一层写得很直接：

- Fast
- Two tiny Markdown files
- Frozen mid-session
- Always in system prompt

对应的是两份文件：**MEMORY.md**（约 2200 字符上限）和 **USER.md**（约 1375 字符上限）。

这一层不是拿来堆资料的。它只记最值得常驻的那一小部分东西：

- 项目约定
- 工具 quirks
- lessons learned
- 用户身份
- 沟通风格
- skill level
- 明确的偏好和禁忌

**关键设计：mid-session frozen。** 本轮中就算又写入了新的 memory，也不会立刻把 system prompt 前缀打乱，而是等到下一轮再注入。这是为了 preserve the LLM prefix cache。

另外，当 MEMORY.md 到 80% 左右时，会触发 consolidation：agent 会 merge 或 drop 一些内容，把它重新压回高密度状态。所以第一层不是一个会无限膨胀的记忆池。

### Layer 1 的工程意义

Layer 1 的设计本质上是在回答一个问题：**什么信息值得每次推理都带着走？** 答案是：高频、稳定、跨会话一致的事实——项目约定定义了 Agent 行为的边界，工具 quirks 规避常见陷阱，用户偏好决定交互风格。这些信息的共同特点是「变化频率低但影响面大」。

字符限制（2200 + 1375）而非 token 限制是一个刻意选择：容量上限与模型 tokenizer 解耦，换模型不会导致记忆容量漂移。这是一种**稳定性优先**的工程哲学——用可预测性换取精确性。

## 第二层：SQLite + FTS5 的历史检索层

第二层解决的是：过去聊过的大量历史，怎么在需要的时候再找回来。

- Unlimited capacity
- SQLite + FTS5
- Full-text search
- On-demand tool call

retrieval pipeline：

1. agent 调用 `session_search(query)`
2. FTS 对历史结果排序（10ms 检索 10,000+ docs）
3. Gemini Flash 总结 top hits
4. concise summary 返回当前上下文

这不是"永远带着什么"，而是"需要时低成本召回"。

### Layer 2 的技术选型考量

用 SQLite + FTS5 而不是向量检索做会话检索，这个选择值得琢磨。向量检索适合语义相似性搜索，但会话检索的核心需求是**精确召回**：用户说"上次那个关于 SSH 配置的问题"，需要的不是语义相近的片段，而是那次会话的完整上下文和父子关系。

FTS5 的关键词搜索 + SQLite 的 session 聚合 + parent_session_id 的关系追踪，构成了一个针对时序事件的检索管道。辅助模型做 focused summary 则把最终的信息压缩工作交给了便宜的小模型，主模型只消费处理好的结果。这种**分离职责**的做法在延迟和成本上都有收益。

这与 [Hermes Agent 记忆系统深度拆解](ch04-068-hermes-agent-记忆系统深度拆解.html) 中提到的"档案室不等于随身备忘录"是同一设计哲学的两面表达。

## 第三层：可插拔的 semantic memory provider

第三层不是简单的"历史记录"，而是外部语义 memory provider 层。

- Semantic
- External providers
- Pluggable
- Opt-in

支持多个 provider（示例：8 supported, 1 active），provider 生命周期：

- PREFETCH before turn
- SYNC after response
- EXTRACT at session end

就算切换 provider，Tier 1 和 Tier 2 也还在——语义层是可选项，不是替代品。

### Tier 3 的架构价值

第三层的可插拔设计确保每一层都可以独立演进和替换——当你需要升级 semantic memory 能力时，不需要重构整个 memory 系统。 这与 Agent Memory System Design 中强调的「分层解耦」原则一致。

值得注意是 Tier 3 是 Opt-in 的：**就算完全不启用 Tier 3，Layer 1 + Layer 2 已经构成一套完整的记忆系统**。这意味着 Hermes 的设计者没有把 semantic memory 当成必选项，而是当成锦上添花的可选项。

## Periodic Nudge

中间还有一个很值得看的机制：**periodic nudge**。

- every 300s
- configurable
- autonomous curation

逻辑是：系统会定期回看最近发生的事，然后问自己：

- 有没有新的偏好值得记？
- 有没有用户纠正值得记？
- 有没有项目约定值得记？

如果有，就调用 memory tool 去 add / replace / remove。如果没有，就安静返回。

这件事特别像真正有用的 Agent 系统会去补的一层：**不是等你手动喂记忆，而是系统自己周期性判断"什么值得留下"**。

### Autonomous Curation 的主动管理思路

传统 RAG 系统是被动等待检索，而 Periodic Nudge 每 300s 主动判断"什么值得写回 memory"。这相当于给 LLM 增加了一个定期反思机制——不是用户指挥 AI 记住什么，而是 AI 自己决定什么值得沉淀。

这个机制的意义在于：**它把记忆维护变成了一个后台任务，而不是依赖用户主动管理**。对于日常使用场景，这意味着即使你从不主动整理 MEMORY.md，系统也会帮你做定期筛选和更新。

## 三层架构全景对比

| 层次 | 角色 | 容量 | 访问方式 | 本质 |
|------|------|------|---------|------|
| 第一层 | 常驻小 memory | MEMORY.md ~2200字 + USER.md ~1375字 | 每轮 system prompt | 高频事实的常驻缓存 |
| 第二层 | 大量历史按需检索 | 无限 | session_search(query) | 低频事件的档案室 |
| 第三层 | 外部语义 provider | 可选 | PREFETCH/SYNC/EXTRACT | 跨平台长周期画像 |
| 额外机制 | Periodic Nudge | — | 每 300s 自主整理 | 主动式记忆整理 |

## 设计哲学总结

**Hermes 对记忆系统的重构，本质上回答了一个更底层的问题：当上下文窗口不再是无限资源时，Agent 应该把不同信息放在哪里？**

传统思路是"记忆越强大越好"——更多存入、更多召回、更多塞给模型。但 Hermes 的思路是**按成本分类**：

- 热记忆成本最高（直接影响每次 token 消耗）
- 档案层成本中等（召回时才有开销）
- Semantic provider 成本可控（按需加载，不占主上下文）

这个分层的背后是 token 经济的精确计算。

**未来 Agent 的差距，未必只在模型层。真正拉开差距的，很可能是它怎么处理连续性。** Hermes 这张图值得看，不是因为它把概念讲得花哨，而是把 memory 这件事拆得足够具体：什么该常驻，什么该检索，什么该交给外部 semantic layer，什么该周期性整理。

## 相关实体

- [Hermes Agent 三级 Memory 架构解析（One掌柜视角） — 同一作者的另一篇分析](ch04-418-hermes-agent.html)
- [AI Agent 记忆系统架构](ch04-145-how-ai-agent-memory-works.html) — Agent 记忆系统的通识性框架
- [17种Agent架构演进](ch04-507-skillclaw-nacos-agent-skill-registry.html) — 记忆设计在 Agent 演化中的位置

- [Hermes Agent Core Architecture Self Evolution](ch04-418-hermes-agent.html)
## 深度分析

**层级化记忆的成本经济学：** Hermes 的三层架构背后是对 token 经济的精确理解。第一层 MEMORY.md + USER.md 约 3575 字符每轮必带，直接影响每次推理的 token 消耗；第二层 SQLite + FTS5 按需查询，召回才有成本；第三层 semantic provider 可插拔设计让成本完全可控。这种分层不是技术炫技，而是**对不同信息访问频率和成本的精确匹配**——热数据用高成本方式存储，冷数据用低成本方式管理。这与计算机系统中的 cache hierarchy 思想一脉相承。

**SQLite + FTS5 选型的工程理性：** 为什么不用向量检索做会话记忆？答案在于会话检索的本质需求不是语义相似性，而是**精确上下文召回**。用户说"上次那个 SSH 问题"，需要的是那次会话的完整父子关系，而不是语义相近的片段。FTS5 的关键词搜索 + SQLite 的关系追踪 + 小模型 summarization，构成了一个低成本的时序事件检索管道。这提醒我们：**向量检索不是万能的，工具选择要回归问题本质**。

**Autonomous Curation 从根本上改变人机协作模式：** Periodic Nudge 每 300s 主动判断"什么值得写回 memory"，相当于给 Agent 增加了一个定期反思机制。传统 RAG 是被动等待检索，而这个机制让 Agent 自己决定什么值得沉淀。这将记忆维护从用户责任变成了系统责任，大幅降低了认知负荷。对于需要长期运行的 Agent 系统，这种**后台自主整理**的能力可能是实用性的关键分水岭。

**Mid-session Frozen 的性能考量：** Layer 1 有一个反直觉的设计：mid-session frozen——本轮写入的新 memory 不会立刻注入 system prompt，而是等到下一轮。表面上看这损失了即时性，但实际目的是**保护 LLM prefix cache**。每轮重新构建 system prompt 会破坏 prefix cache 的连续性，导致重复计算。这个设计体现了一个核心原则：**在 AI 系统里，即时性不一定总是优点，稳定性有时更有价值**。

**三层解耦是系统可演进性的基础：** Layer 1 和 Layer 2 构成完整记忆系统，Layer 3 是可插拔的可选项。这意味着 semantic memory 能力可以独立演进和替换，升级时不需重构整个 memory 系统。这种**非破坏性扩展**的设计哲学，对于需要长期维护的 Agent 系统至关重要——它允许系统逐步成长，而不需要一次性设计到位。

## 实践启示

- **设计 Agent 记忆系统时，先问访问频率**：不是所有信息都值得常驻 context。项目的工具 quirks、用户偏好等高频事实适合第一层；历史会话等低频信息适合第二层按需检索；跨平台长周期画像可以作为可选的第三层。

- **选型不要盲从向量数据库**：向量检索适合语义相似性搜索，但会话上下文召回往往需要精确的时序关系和父子 session 追踪。SQLite + FTS5 的组合在结构化查询和关系追踪上更有优势。

- **用字符限制而非 token 限制作为容量边界**：这样可以将容量上限与 tokenizer 解耦，换模型不会导致记忆容量漂移，保证系统的可预测性。

- **为 Agent 增加周期性自主整理机制**：不只是被动存储，Agent 应该能够主动判断"什么值得从当前上下文沉淀到长期记忆"，减轻用户的认知负担。

- **保护 prefix cache 的连续性**：避免每轮都重建 system prompt，可以考虑 mid-session frozen 策略——本轮写入的 memory 到下一轮再注入，以换取 cache 稳定性和整体性能。

---
