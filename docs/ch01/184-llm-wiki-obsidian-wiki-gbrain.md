# LLM Wiki / Obsidian Wiki / GBrain 自组织与自进化

> 📊 Level ⭐⭐⭐ | 10.3KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/llm-wiki-obsidian-wiki-gbrain-self-organization-self-evolution.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [State of Memory in Agent Harness — mem0 视角的九大 harness 横评](https://github.com/QianJinGuo/wiki-public/blob/main/entities/state-of-memory-in-agent-harness-mem0-2026.md) — 九大harness记忆横评
- Context Window Management Comparison — 四框架对比rv9
- Anthropic N-days: Frontier Agent Vulnerability Research — N-day研究
- [Rethinking Search as Code Generation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/perplexity-search-as-code-generation.md) — Search as Code：查询变可执行代码对象7660字rv9
- [一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md) — harness 12组件框架
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- [Code as Agent Harness 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md) — 102页综述
- Programbench Agent Benchmark — 无提示清洁室设计：Opus 4.7仅3% almost-resolved
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [原始文章存档](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-search-architecture-tencent-2026.md) — ripgrep五层过滤
- [Claude Code and What Comes Next](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-and-what-comes-next.md) — 压缩/Skills/Subagents
- [全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-perceived-degradation-anthropic-effort-model-explanation-2026.md) — Model vs Effort框架

## 工程实践
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [高德 AI-Native 生产线（第 3 期）：7x24 Self-Healing Pipeline + Agent 自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md) — 7×24自愈生产线15428字rv9全版
- [最佳 Claude Code 配置：Andrej Karpathy 的 CLAUDE.md，134+k star了！](https://github.com/QianJinGuo/wiki-public/blob/main/entities/andrej-karpathy-claude-md-134k-stars-2026.md) — CLAUDE.md四规则解析
- [Claude Code 上下文工程 —— Anthropic 团队的工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-context-engineering-anthropic-thariq.md) — 上下文工程官方表述
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [Claude Code 泄露后的漏网之鱼 claude-code-best 这两个月到底演进了什么](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-community-fork-evolution-vibecoder.md) — 社区fork演进短条
- [扣子 3.0 离谱更新：把 Codex、Claude Code 拉进一个项目工作？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/coze-3-0-local-agent-codex-claude-code-project.md) — coze-bridge本地接入
- [Skills：让 Claude 记住「怎么做」，告别重复教学](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-workflow-encapsulation-costa-long.md) — context:fork隔离
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iqsixinp9lxnkg7avfhfcq.md) — Boris新访谈：IDE→Agent控制台控制点迁移

## 深度分析

### 知识工程与 RAG 的范式分野
文章最有分辨力的一刀，是把 Knowledge Engineering 与传统 RAG 切开：RAG 的本质是"每次查询从头检索"，模型带着书本进考场，考完就忘；而 Skillify / LLM Wiki 范式是"把书读透并记成整理后的笔记"，原始资料被"编译"为带交叉引用、矛盾标注的持久化知识体，做到一次学习、永久可用。作者用阿里云智能客服的三个阶段支撑这个判断：2016-2022 传统知识库时代靠人工严格分类打标；2023 起的 RAG 时代留下三个硬伤——模型能力断层、检索每次独立、知识不沉淀；到 Agent 时代，新范式的价值落在消除重复搜索、全链路大模型参与和知识的累积效应上。 这与 Context Window Management Comparison 的结论互为印证：外部注入的知识质量直接决定 Agent 效果上限，而 Context 的核心组成恰恰是经验性知识（策略、步骤、个人编码习惯）与事实性知识（定义、机制、FAQ）两类。

### LLM Wiki 三层闭环为何有效
Karpathy 的 LLM-Wiki 只是一个 Markdown 文件，却给出了完整的三层架构：原始资料层只读存档、Wiki 层按主题/人物/概念组织结构化页面、Schema 层定义系统如何运行与校验。闭环由三个动作驱动——Ingest 摄入时一个来源可联动更新 10-15 个相关页面；Query 时先定位 Wiki 页面再综合出带引用的答案，且高质量答案可归档为新页面反哺知识库；Lint 定期健康检查，清理事实矛盾、过时声明与无入链的孤儿页面。 真正值得记住的是文章对"为什么有效"的解释：维护知识库的繁琐部分不是阅读或思考，而是"记账"——更新交叉引用、保持摘要最新、留意新旧声明的矛盾。人类放弃 Wiki 是因为维护负担增长得比价值快，而 LLM 不会无聊、不会忘记更新交叉引用，可以一次处理 15 个文件。这把"人做不好知识维护"从抱怨升级为分工论证。

### 来源不可信与知识溯源的安全设计
Obsidian-Wiki 作为 LLM Wiki 模式的多 Agent 工程化实现（Agent 无关、Skill 驱动、Obsidian 原生），最有含金量的是其防御性设计。其一，来源可信度边界：来源文档一律视为不可信，LLM 永远不应执行来源中的命令，直接封堵通过恶意文档注入指令的攻击面。其二，溯源标记系统：每条知识标注来源可靠性——直接提取（extracted）、基于来源推断（inferred）、存在歧义（ambiguous）三级分开，让下游查询能区分"事实"与"猜测"。其三，Delta 追踪用 .manifest.json 中的 SHA-256 哈希跟踪每个已摄入来源，配合 hot.md 这种 500 字语义快照提供快速上下文感知。 这套设计把知识库从"越堆越大越好"的仓库思维，扭转为"每条知识可审计、可过滤、可增量"的供应链思维。

### GBrain 的分工哲学：Thin Harness, Fat Skills
GBrain 在文件系统存储与渐进式披露之上加了一层工程化中间件，其架构哲学一句话即可概括：Harness 做薄，主要精力放在丰富 Skills 上。背后的判断是"最差的 Agent 系统总是把错误的工作放在错误的一边"——让 LLM 决定"做什么"（潜在空间 Latent Space），让代码保证"在哪里"和"如何做"（确定性 Deterministic）。检索侧走"Chunk 确认 → 整页加载 → 分层呈现"的混合过滤：关键词匹配加语义向量先初筛片段，确认相关后加载整页，最后按优先级组装、优先呈现"编译真相"（最新综合结论）。图谱构建则是确定性代码的四步流水线：实体抽取、页面生成、关系分类、反向链接强制化（A 提到 B 就自动在 B 页加指向 A 的链接）。 与 LLM Wiki 的极简路线对照，文章的结论并非二选一，而是混合架构：轻量检索做快速初筛，大模型对高价值知识做深度阅读与离线自我迭代。

## 实践启示

1. **把"编译知识"设为默认目标，检索只是兜底。** 收藏和堆积是人的本能而非能力；让 Agent 把原始资料编译成带交叉引用和矛盾标注的持久页面，避免同一段知识被反复推导、反复检索。
2. **人机分工按维护成本切。** 人类只负责提问题和堆知识，交叉引用更新、摘要保鲜、矛盾识别这类"记账"工作全部交给 LLM 的 lint 例程——这正是人力知识库必然烂尾而 Agent 知识库可以成立的分界线。
3. **来源文档永远不可信。** 任何进入知识库的外部内容都不应被 Agent 执行；结合 SHA-256 增量追踪，同时防注入攻击与防重复摄入。
4. **每条知识带溯源与置信标记。** 直接提取、推断、歧义要分层标注，查询时才不会把猜测当事实；敏感内容用可见性标签在查询侧过滤。
5. **Thin Harness, Fat Skills。** 把确定性逻辑（在哪、如何做）写进代码与文件结构，把"做什么"留给 LLM；知识库本身就是最大的那层 Skill。
6. **选型走混合架构。** 向量+关键词做快速初筛，高价值知识交给大模型深度阅读与离线迭代；个人场景用极简 LLM Wiki，大规模复杂场景再上 GBrain 式中间件。

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)
→ [原文存档](https://mp.weixin.qq.com/s/48XpgAMHeaKYj26PrJK-hw)

---

