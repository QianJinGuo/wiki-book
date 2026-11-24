# Claude Code 上下文工程 —— Anthropic 团队的工程实践

> 📊 Level ⭐⭐ | 9.5KB

## 相关实体

- [anthropic 最新播客：如何打造下一代 claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-building-next-claude.md)
→ [原文存档](https://mp.weixin.qq.com/s/MGvMU0NENSV3cp4crUZnfA)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/memory-context-systems.md)
## 深度分析
### 命名升格：Prompt Engineering → Context Engineering

Thariq 把 Anthropic Claude Code 团队的内部术语从"prompt engineering"正式替换为"context engineering"，并划出清晰分工：PE 只关心"这一轮提示词怎么写"，CE 关注"过去几轮模型看到了什么、接下来要让它看到什么"。CE 是 PE 的超集——除提示词本身外，还涵盖工具输出预算、状态分舱、subagent 隔离与自动摘要。 值得注意的是，这些实践（compaction、pre-query 优化、subagent 隔离）早已分散存在于 Claude Code、OpenClaw、Pi、Letta Code 等系统中，本文的价值更多是官方命名与标准化，而非发明新模式。 概念沉淀见 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)。

### 五大工程模式：把窗口当作被管理的资源

文章将 Claude Code 的上下文实践归纳为五个可复用模式：隔离区 subagent（探索性读取下沉到子 agent，主对话只收摘要）；阈值触发的自动摘要（按比例丢弃最早消息段、摘要前置）；工具输出预算（每类工具给字符/token 上限，超限只留开头结尾与预览、完整内容落盘）；状态分舱（原始文档、工具输出、中间结论、决策日志分别保留）；narrow read 子代理（只读相关文件范围，压缩后回传主 agent）。 五个模式共享同一前提：主对话的上下文窗口是稀缺资源，必须像内存一样被主动分页与预算化管理，这与 [Context Management Agent Systems](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-management-agent-systems.md) 的工作集理念一致。

### Subagent 的本质是隔离，不是并行

全文最反直觉的判断是 Anthropic 明确指出 subagent 存在的主要目的不是并行而是隔离——让子 agent 跑探索性 read，回来时只带回"读了什么 + 发现了什么"，避免原始工具输出污染主对话稀缺的窗口。 这把 subagent 从"并发加速器"重新定义为"上下文防火墙"：隔离的价值在压缩比而不在速度，子代理返回摘要而非完整过程正是为此设计。多 agent 协作模式的总览见 [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-orchestration-patterns.md)。

### 优化对象从文本质量转向 Harness 系统

PE 与 CE 的对照表把执行者也分开了：PE 由人 + 模型执行，优化对象是文本质量；CE 的执行者是 Harness 系统，做 pre-query optimization，优化对象是系统性的窗口管理。 这意味着上下文工程的重心从"写好提示词"转移到 harness 架构设计——预算、分舱、隔离、摘要是 harness 的子系统而非提示词技巧，与 [Agent Harness Context Management Working Set](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) 的分析相互印证。文章还预判 CE 将取代 PE 成为讨论 LLM 工程的主流框架，并强调 CE 不是 PE 的对立面而是其超集：工程团队应把上下文管理当作独立子系统来建设。

## 一句话定位
**Thariq Shihipar（Anthropic Claude Code 团队）** 公开撰文把"上下文管理"升格为"**上下文工程 (Context Engineering)**"——一个比 prompt engineering 范围更大的工程学科。
4. 本文是 Anthropic 官方对"为什么需要做上下文工程 + 怎么做"的**第一次系统化表述**。
5. **Quarantined subagent（隔离区 subagent）** —— subagent 的本质 = 上下文隔离机制，把探索性读取丢进子 agent，主对话只看到摘要
2.

### 关联实体

- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)

## 第 2 来源 — Claude Code 系统提示词 80% 删减实践

Thariq（Anthropic Claude Code 团队）2026 年 7 月发表新文章《The new rules of context engineering for Claude 5 generation models》，记录了一次系统提示词删减 80%+ 且编码评测未下降的工程实验，标志着 Claude Code 上下文工程从"长提示词"阶段重回"短+精"模式。

**六条策略演变：**

1. Rules → Judgement：从给规则（"默认不写注释"）到给判断依据（"匹配周围代码风格"），信任模型判断力
2. Examples → Interfaces：少示例/零示例，用工具参数命名和枚举值自身语义替代示例说明，few-shot 在新一代模型中逐渐成为反模式
3. Front-load → Progressive Disclosure：所有信息一次性塞入上下文改用按需加载：长 skill 拆多文件、工具按需搜索（ToolSearch）、CLAUDE.md 引 skill 而非全文嵌入
4. Repeat → Single Source：避免同一定位在系统提示词/skill/CLAUDE.md 三处出现，防止互相打架的指令集
5. Manual Memory → Auto-memory：用户手动用 `#` 存 memory 改为自动保存按需加载，避免全量加载成本
6. Simple Specs → Rich References：用 HTML 工件/测试套件/函数签名作为规格说明，比文字描述更精确

**关键方法论启发**：每条 prompt 问"善意的人会怎么误解这句话"；删除不等于扔掉，是挪到用时才读的位置（渐进披露的核心）；模型能力决定领导风格——情境领导框架可用于理解不同代模型所需的提示词密度差异。

→ [第 2 来源原文存档](https://mp.weixin.qq.com/s/DnbnMaG2MfVMLcm7zymEmQ)

## 第 3 来源 — AI寒武纪：爆删 80% 系统提示词（Claude 5 上下文工程中文传播版）

同一篇 Thariq《The new rules of context engineering for Claude 5 generation models》的跨号中文传播（AI寒武纪，2026-07-25），与第 2 来源同源不同文，补充了第 2 来源未展开的落地细节。

**互补角度：**

- **claude doctor 命令**：Anthropic 将"化繁为简"经验直接工具化——`/doctor` 自动给技能文件与 CLAUDE.md 瘦身，是第 2 来源未提及的新落地载体
- **四块内容的写作指南**：系统提示词（与产品场景强绑定，自建 agent 框架时最该打磨）、CLAUDE.md（轻量，只写代码库坑点）、技能（轻量查阅指南，长技能拆多文件配合渐进披露）、引用（优先代码形式文件，HTML 原型 > 文字描述 > 截图）
- **冲突指令动机细节**：同一次请求中系统提示词/技能/用户要求三方指令互相打架是删减的原始动机——新模型能理解意图自行裁决，前提是先想明白矛盾再决定
- **评分标准（rubrics）作为引用形式**：动态工作流派出带评分标准的验证 agent 打分，用于传达审美判断（什么样的 API 设计算好）
- **渐进披露延伸到工具与文件树**：Task 类工具延迟加载（ToolSearch 搜出完整定义才用），CLAUDE.md/Skill.md 应做成文件树而非总仓库

→ [第 3 来源原文存档](https://mp.weixin.qq.com/s/R1bbNTfL9gcz_fE3nPG-iA)

---

