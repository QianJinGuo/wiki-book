# Claude Code 上下文工程 —— Anthropic 团队的工程实践

## Ch01.783 Claude Code 上下文工程 —— Anthropic 团队的工程实践

> 📊 Level ⭐⭐ | 8.1KB | `entities/claude-code-context-engineering-anthropic-thariq.md`

# Claude Code 上下文工程 —— Anthropic 团队的工程实践

## 相关实体

- [anthropic 最新播客：如何打造下一代 claude](ch01/1603-anthropic.html)
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-context-engineering-anthropic-thariq.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)
## 深度分析

Claude Code 上下文工程 —— Anthropic 团队的工程实践 涉及agent领域的核心技术议题。
### 核心观点
1. # Claude Code 上下文工程 —— Anthropic 团队的工程实践
> 整理：Hermes Agent
> 原文：https://mp.
2. com/s/MGvMU0NENSV3cp4crUZnfA
> 官方原文：https://www.
3. com/engineering/claude-code-context-engineering（Anthropic 工程博客）
## 一句话定位
**Thariq Shihipar（Anthropic Claude Code 团队）** 公开撰文把"上下文管理"升格为"**上下文工程 (Context Engineering)**"——一个比 prompt engineering 范围更大的工程学科。
4. 本文是 Anthropic 官方对"为什么需要做上下文工程 + 怎么做"的**第一次系统化表述**。
5. **Quarantined subagent（隔离区 subagent）** —— subagent 的本质 = 上下文隔离机制，把探索性读取丢进子 agent，主对话只看到摘要
2.

### 内容结构
- Claude Code 上下文工程 —— Anthropic 团队的工程实践
- 一句话定位
- 核心论点
- 1. 命名：Prompt Engineering → Context Engineering
- 2. 5 大实战工程模式
- 3. Subagent 的本质 = 上下文隔离
- 4. PE vs CE 的明确分工
- 5. 与已有知识的关系

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **anthropic趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [两万字详解Claude Code源码核心机制](../ch03/085-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/043-agent-harness.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/006-agent.html)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](../ch11/255-openclaw.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/757-agentic.html)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/006-agent.html)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

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

→ [第 2 来源原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-code-80-prompt-trim-thariq-context-engineering-2026.md)

## 第 3 来源 — AI寒武纪：爆删 80% 系统提示词（Claude 5 上下文工程中文传播版）

同一篇 Thariq《The new rules of context engineering for Claude 5 generation models》的跨号中文传播（AI寒武纪，2026-07-25），与第 2 来源同源不同文，补充了第 2 来源未展开的落地细节。

**互补角度：**

- **claude doctor 命令**：Anthropic 将"化繁为简"经验直接工具化——`/doctor` 自动给技能文件与 CLAUDE.md 瘦身，是第 2 来源未提及的新落地载体
- **四块内容的写作指南**：系统提示词（与产品场景强绑定，自建 agent 框架时最该打磨）、CLAUDE.md（轻量，只写代码库坑点）、技能（轻量查阅指南，长技能拆多文件配合渐进披露）、引用（优先代码形式文件，HTML 原型 > 文字描述 > 截图）
- **冲突指令动机细节**：同一次请求中系统提示词/技能/用户要求三方指令互相打架是删减的原始动机——新模型能理解意图自行裁决，前提是先想明白矛盾再决定
- **评分标准（rubrics）作为引用形式**：动态工作流派出带评分标准的验证 agent 打分，用于传达审美判断（什么样的 API 设计算好）
- **渐进披露延伸到工具与文件树**：Task 类工具延迟加载（ToolSearch 搜出完整定义才用），CLAUDE.md/Skill.md 应做成文件树而非总仓库

→ [第 3 来源原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-5-context-engineering-80pct-trim-aihanwuji-2026.md)

---

