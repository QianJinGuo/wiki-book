# Explicit vs. Implicit in the Age of Intelligences — Le secrétaire de Fernand

## Ch01.407 Explicit vs. Implicit in the Age of Intelligences — Le secrétaire de Fernand

> 📊 Level ⭐⭐ | 9.0KB | `entities/lesecretairedefernand-co-en-tech-explicit-vs-implicit-in-the-age-of-intelligence.md`

# Explicit vs. Implicit in the Age of Intelligences — Le secretary de Fernand
Explicit vs. Implicit in the Age of Intelligences — Le secrétaire de Fernand Le secrétaire de Fernand FR Switch to dark theme about Tech Entrepreneurship Body Menu Explicit vs. Implicit in the Age of Intelligences Explicit vs. Implicit in the Age of Intelligences Why the implicit becomes fragile when humans and agents co-produce code. May 5, 2026 Architecture Software Design Robustness AI In the previous article, I defended a simple idea: code is not elegant prose. It is a system, to be judged by its robustness. But that idea calls for another one. If code is a system, then it is not enough for it to be pleasant to write, locally fluid to read, or elegant in appearance. Its structures must remain visible. Its boundaries, states, contracts, responsibilities, and effects must be understandable, revisitable, criticizable, and transformable. In other words: the system must be explicit. This is where a very contemporary tension appears. For a long time, part of software tooling has valued the implicit: conventions, framework magic, inferred behaviors, invisible structures, shortcuts that let us move faster. This has often been useful. It has sometimes even been very productive. But in the age of intelligences — human and artificial — the implicit changes in nature. The problem with the implicit is not only that it is hidden. It is that it is no longer guaranteed to be shared. The implicit has long been an accelerator # We should not caricature the implicit. The implicit is not bad by nature. It has made it possible to build more fluid tools, frameworks that are faster to adopt, and more productive conventions. It has made it possible to write less, repeat less, and move part of the work into the framework, the language, or the environment. This is often what makes a technology pleasant. A file placed in the right location automatically becomes a route. A function named in a certain way is recognized by a tool. A discreet directive changes the execution location of a piec... [内容已截断，原文完整]

## 相关实体
- [Claude Code Search Architecture Tencent 2026](/ch01-537-原始文章存档/)
- [Agent Harness Architecture Design Production Guide](/ch04-021-agent-harness-架构设计与实现-生产级-agent-系统落地指南/)
- [Three Rag Architectures Classic Graph Agentic](/ch04-318-一文看懂三种-rag-架构-classic-rag-graph-rag-与-agentic-rag/)
- [Protocol H Hierarchical Agentic Rag Enterprise](/ch04-079-protocol-h-hierarchical-agentic-rag-enterprise/)
- [How Ai Agent Memory Works](/ch04-145-how-ai-agent-memory-works/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/lesecretairedefernand-co-en-tech-explicit-vs-implicit-in-the-age-of-intelligence.md)

## 深度分析

**隐式范式的根本性失效**——在人类与 AI Agent 共编程代码的时代，隐式约定正在经历一次根本性的性质转变。文章的核心论点在于：隐式从来不仅仅是"隐藏"那么简单，它的本质是依赖共享的前提假设。框架魔法、惯例推断、文件名路由——这些东西之所以在传统软件开发中有效，是因为参与协作的人类群体始终共享着相同的上下文：他们都在同一套 IDE 中工作、遵循相同的代码审查流程、阅读同样的内部文档。当 AI Agent 加入协作链之后，这种共享的前提假设被打破了。Agent 不会"继承"开发者的默契，它没有经历过同一段技术债务的积累过程，也没有参与过那些没有写成文档的决策讨论。因此，隐式结构对 Agent 来说不是"约定俗成"，而是不透明的障碍 。

**多智能体协作对显式性的结构性需求**——文章揭示了一个深刻的技术趋势：代码系统的"可理解性"标准正在被重新定义。在单人开发时代，"局部可读"是足够的——只要我在 IDE 里能看懂这段代码在做什么，它就是好代码。但在多 Agent 协作（Agentic Coding）时代，代码需要被"可穿越"：Agent A 生成的代码可能需要被 Agent B 在三个月后修改，Agent B 并没有和 Agent A 对话过，也不了解最初做这个决定的上下文。这意味着代码的边界、契约、状态和副作用必须从代码本身就能看得出来，而不能依赖任何"读代码的人自然会懂"的隐式知识。从工程角度看，这意味着文档、类型标注、显式的错误处理和接口契约的价值被提升到了前所未有的高度 。

**框架隐式与 Agent 能力的张力**——文章对"框架隐式"（framework magic）的批判具有重要的工程实践含义。Ruby on Rails 的 `fileplaced in the right location automatically becomes a route` 是一个经典的隐式设计范式，它对人类开发者的认知效率有显著提升。但对于 AI Agent，这种隐式路由实际上创造了一个不可见的映射层——Agent 必须在执行时"知道"这个转换规则，而这种知识既没有在代码中体现，也没有在 CLAUDE.md 等配置文件中声明。在企业级代码库中，这意味着大量这类框架隐式会形成一种"AI 盲区"：Agent 可以执行命令，但它无法真正理解这些命令的副作用和作用范围。大型代码库显式化的投入，在 Agent 部署场景下的 ROI 要比纯人类开发时代高得多 。

**显式化的工程成本与边界**——文章并非在呼吁彻底消灭隐式设计，而是建立一种更精细的判断框架。作者承认隐式是"accelerator"，它在历史上推动了工具和框架的生产力提升。关键问题不是"要不要用隐式"，而是"谁需要理解这个隐式"。在纯人类团队中，隐式可以只被同一团队的人共享，不需要全局可见。但在 Agent 参与协作时，所有参与协作的 Agent 都必须能够"理解"这些隐式——而这在当前的技术条件下要求它们是显式的。这意味着组织在引入 AI Coding 工具时，需要对现有的框架隐式做一个系统性的"可 Agent 理解性"审查 。

**知识管理的范式转移**——这篇文章的深层含义是：软件开发中的知识管理范式正在发生根本性转移。从"文档化关键决策"到"让所有决策对 Agent 可访问"。后者要求更激进的显式化：不仅是架构决策要文档化，连代码组织的原则、模块职责的边界、错误处理的约定都需要成为第一等公民。在实践中，这意味着 CLAUDE.md 这类上下文配置文件的价值被重新定义——它不仅仅是一个"给 Claude 的提示文件"，而是整个代码库在 Agent 时代的"宪法"：定义什么是允许的、什么是被禁止的、什么是不言自明的 。

## 实践启示

- **为每个代码库建立分层 CLAUDE.md 体系**：根目录 CLAUDE.md 定义全局架构原则和关键陷阱，子目录 CLAUDE.md 定义局部约定。避免所有内容堆在根目录文件，这样既保证了全局可理解性，也让局部团队能够维护自己的上下文 。

- **在框架隐式密集的地方补充显式注释**：特别是路由规则、自动加载约定、隐式依赖注入等位置。如果你的团队使用 Ruby on Rails、Next.js App Router 或其他隐式路由框架，在 CLAUDE.md 中显式说明这些规则，不要假设 Agent 会"自然理解" 。

- **将架构决策写成"可执行的文档"**：不仅是 ADR（Architecture Decision Records），还包括有明确路径绑定的 Skills 和 Hooks。当一个决策被写入 CLAUDE.md 并通过 Hook 自动在特定目录下加载时，这个决策就变成了对 Agent 可执行的指令，而不仅仅是静态文档 。

- **建立"隐式知识清单"并在引入 Agent 工具时做专项审查**：识别团队中哪些知识是隐式的（只有团队成员知道而没有显式记录），哪些隐式是代码库规模下仍然可以接受的，哪些必须在 Agent 化之前显式化。优先处理"跨越团队边界的隐式知识" 。

- **用 Hook 机制建立持续的知识同步**：结束钩子（end hooks）在每次会话结束后自动回顾并建议 CLAUDE.md 更新，将团队成员头脑中的隐式知识以最小摩擦的方式持续沉淀为显式配置。这比定期做知识审计的效率高得多，而且能够捕捉到那些"只有在这个模块工作的人才知道"的局部知识 。

---

