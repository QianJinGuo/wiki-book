# Rethinking Search as Code Generation

## Ch01.374 Rethinking Search as Code Generation

> 📊 Level ⭐⭐ | 13.4KB | `entities/perplexity-search-as-code-generation.md`

# Rethinking Search as Code Generation

> Perplexity 2026 研究文章，提出将 search 系统从 "agent 调用检索 tool" 重新建模为 "agent 生成可执行代码"：搜索查询被 LLM 编译为 TypeScript/Python 代码，代码作为中间表示，调用真实 search APIs 并合成答案。

## 核心范式转换

传统 RAG/agentic search 范式：
```
User query → LLM agent → 决定调用哪些 retrieval tools → 工具返回结果 → LLM 综合答案
```

Perplexity 的 "Search as Code" 范式：
```
User query → LLM agent → 生成 TypeScript/Python code (用 SDK primitives) → 代码执行 → 真实搜索 + 综合 → 返回答案
```

**关键差异**：把 search 从"调用函数"变成"生成程序"。每个 search query 是一个**可执行的、可调试的、可缓存的代码对象**，不是一次性的 prompt-engineering 决策。

## SDK 基础原语 (Primitives)

Perplexity 暴露给 LLM agent 的核心 primitives：

| Primitive | 用途 | 类比传统 |
|-----------|------|----------|
| `webSearch(query, options)` | 网页搜索 | search API wrapper |
| `scholarSearch(query)` | 学术搜索 | Google Scholar API |
| `socialSearch(query, platform)` | 社交搜索 | Twitter/Reddit API |
| `codeInterpreter(code)` | 代码执行 | sandboxed Python |
| `chunkFilter(chunks, criteria)` | 段落过滤 | reranker |
| `synthesize(chunks, prompt)` | 综合多个 chunk | LLM 二次生成 |

这些 primitives 是 LLM 友好的设计 — 每个都有清晰的输入输出 schema，可被 agent 灵活组合。

## 三个独有贡献（不应合并到现有 entity）

1. **Code as Intermediate Representation** — 把 search 重新定义为 code generation，让 query 变成可调试、可版本控制、可 trace 的 artifact。这是从"prompt engineering search queries"到"generating executable search programs"的范式跳跃。
2. **Per-Primitive Iterative Refinement** — 每次 primitive 调用后，LLM 评估结果质量并决定是否需要补充调用、refine query、组合不同 sources — 这种迭代循环在传统 agentic search 中要么缺失要么 hard-coded。
3. **Production Telemetry 集成** — SDK 在每次执行时记录 token cost、latency、tool call sequence、错误率，agent 可以基于 telemetry 调整后续 strategy。从"黑盒 agent"到"自观察 self-refining agent"。

## 与现有 agentic-search 实体的差异化

| 维度 | softwaredoug agentic-search (2026-05-13) | perplexity search-as-code (本文) |
|------|----------------------------------------|----------------------------------|
| 层级 | 概念层 — 为什么 agentic search 优于 RAG | 架构层 — 怎么实现 agentic search |
| 来源 | 评论分析 (single author) | 厂商生产实践 (Perplexity Research) |
| 焦点 | "Agent 中枢 vs 模块化管道" 哲学差异 | "Code generation as search engine" 实现路径 |
| 适用读者 | AI 系统设计师 (做决策) | 搜索/Agent 工程师 (做实现) |

**核心差异**：softwaredoug 文章讨论"为什么要做 agentic search" (philosophy + market positioning)；本文讨论"怎么做 agentic search 的生产实现" (SDK design + execution model + telemetry)。两者互补，不重复。

## 技术细节深度分析

### Code-as-IR 的工程优势

1. **可调试性 (Debuggability)** — 每个 search query 生成的代码可以独立执行、step-through、加 breakpoint。这对 production debugging 至关重要。
2. **可缓存性 (Caching)** — 相同 query 生成的代码可以 hash 后复用执行结果。LLM 生成代码是一次性成本，多次执行摊销。
3. **可版本控制 (Versioning)** — 代码可以 commit 到 git，团队可以 review search behavior 的变更。这解决了"prompt engineering 不可审计"的根本问题。
4. **可 trace (Tracing)** — 每次执行的 tool call sequence 完整记录，可以回放整个 search session。

### 与传统 RAG 检索的对比

| 维度 | 传统 RAG | Search as Code |
|------|----------|----------------|
| Query 表示 | Embedding vector | Executable code |
| 检索粒度 | Fixed chunk size | Dynamic per primitive |
| Agent 决策空间 | Limited tool palette | Full programming language |
| 可解释性 | Low (embedding similarity) | High (readable code) |
| 可缓存性 | Per-query embedding | Per-code-hash |
| 失败模式 | Silent semantic drift | Compile/runtime errors |

### Production 部署的考量

Perplexity 提到几个 production 关键点：

- **Sandbox 隔离**：生成的代码必须在 sandboxed environment 执行，避免恶意或 buggy code 危害系统
- **Resource limits**：每次执行有 time/cost/token 上限，防止 runaway 循环
- **Human-in-the-loop fallback**：高 risk 场景下要求 human approval
- **Telemetry-driven improvement**：通过 SDK 自带的 metrics 持续优化 code generation 质量

## 深度分析

### 1. 传统搜索刚性的根本原因 

Perplexity 指出传统搜索系统僵硬性的根源在于其设计目标——"世界上第一个搜索引擎是为人类用户构建的" 。这意味着系统假设调用者是人类，因此只需暴露简单的查询接口，而无需提供对检索内部流程的细粒度控制。这种设计在 AI agent 场景下暴露出的根本缺陷是：agent 无法指导"如何"检索、处理、聚合和渲染上下文 。

### 2. controllability 瓶颈的技术本质 

文章明确指出核心瓶颈在于 _control_ 维度：前沿模型已经非常擅长在固定上下文上进行推理，但最强大的 AI 系统需要能够 steering how that context is retrieved, processed, aggregated, and rendered 。传统搜索系统没有为此级别的可控性而设计，而现代前沿模型通过 code-capable agent harnesses 已经能够通过计算机代码对任何计算原语行使细粒度控制 — 关键任务是提供正确的 primitives 。

### 3. Search as Code 的架构创新 

SaC 的核心创新在于：不是简单地将传统搜索 API 放入 shell 或语言运行时中，而是精心设计了 Agentic Search SDK，在最原子化的级别上暴露搜索的各个构建块 。这使得模型可以直接控制每个单独的搜索步骤：检索、排名、过滤、扇出、渲染等，同时让模型高效访问中间状态（如候选列表和排名信号） 。

### 4. 与 function calling / MCP 的本质区别 

传统 function calling 和 MCP 的局限在于它们只提供线性调用轨迹 — agent 决定调用哪些工具，然后获取结果 。SaC 突破这一限制的核心原因是：它给予 agent full programming language 的表达力，而不仅仅是有限的 tool palette 。这意味着 agent 可以动态组合 primitive、执行条件分支、访问中间状态，而这些在 function calling 范式中是不可表达的 。

### 5. Agentic Search SDK 的原子化设计原则 

Perplexity 强调"精心工程化"（carefully engineered）而非简单包装现有 API 。这意味着 primitives 的设计遵循两个原则：(1) 在最原子化级别暴露搜索构建块，使模型拥有最大控制粒度；(2) 每个 primitive 有清晰输入输出 schema，可被 LLM 灵活组合 。这种设计使 agent 能够设计跨越数千次检索操作的定制搜索管道，在飞行中优化这些管道，并仅将最有用的信息作为模型上下文消耗 。

## 实践启示

### 1. 重新设计 Agent Harness 的 Tool 接口 

从 JSON schema function calling 升级到编程语言 primitives。当前的 MCP/function calling 接口限制了 agent 的表达能力 — 只能做线性调用轨迹，无法访问中间状态。参考 Perplexity SDK 的原子化设计：将搜索分解为 `webSearch`、`scholarSearch`、`chunkFilter`、`synthesize` 等可组合 primitives，每个都有清晰 schema。这使 agent 能够在飞行中动态组合、调整搜索策略，而不是被固定 tool palette 束缚。

### 2. 引入 Code-as-IR 的可观测性层 

将搜索查询编译为代码对象后，获得可调试、可缓存、可版本控制的性质。在生产环境中，这意味着：(1) 每次执行的 tool call sequence 可完整 trace；(2) 相同 query 生成的代码可 hash 后复用结果；(3) 代码可 commit 到 git，团队可 review search behavior 变更。结合 SDK 自带的 token cost、latency、错误率 metrics，可以实现从"黑盒 agent"到"自观察 self-refining agent"的跨越。

### 3. 构建 Sandboxed Code Execution 环境 

SaC 范式要求生成的代码在 sandboxed environment 中执行，这是生产部署的必要条件。具体实现需要考虑：资源限制（time/cost/token 上限防止 runaway 循环）、权限隔离（恶意或 buggy code 不能危害系统）、Human-in-the-loop fallback（高风险场景需人工审批）。这对基础设施提出了新要求：不是简单调用 API，而是需要管理代码执行的生命周期。

### 4. 设计 Per-Primitive 迭代细化循环 

每次 primitive 调用后，LLM 应评估结果质量并决定是否需要补充调用、refine query 或组合不同 sources 。这打破了传统 agentic search 中"调用 tool → 获取结果 → 结束"的线性流程。实现这一模式需要：每个 primitive 调用返回可结构化评估的输出、LLM 有能力基于中间状态做出迭代决策、系统支持动态扩展调用序列（如单任务触发数百甚至数千次检索操作） 。

### 5. 评估从 RAG 到 Search-as-Code 的迁移成本 

传统 RAG 系统将 query 表示为 embedding vector，检索粒度固定，失败模式为 silent semantic drift 。SaC 的优势在于动态检索粒度、高可解释性（可读代码 vs embedding similarity）、per-code-hash 缓存 。但迁移成本也不可忽视：需要重写 query interface、引入代码执行基础设施、处理 compile/runtime 错误而非 silent 失败。建议从非关键场景开始试点，验证 telemetry-driven improvement 循环的有效性。

## 与现有实体/概念的链接

→ [Agentic search models](ch03/044-agent.md) — 同主题概念层 vs 架构层互补
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/perplexity-search-as-code-generation.md)

## 关键洞察总结

- **范式跳跃**：Search 从 "调用函数" → "生成程序"，让 LLM 拥有 full programming language 的表达力
- **工程友好**：可调试、可缓存、可版本控制、可 trace — 解决 prompt engineering 的根本性 observability 问题
- **生产就绪**：Perplexity 的 SDK 设计考虑了 sandbox、resource limits、telemetry，是可直接借鉴的 production 模式
- **互补关系**：与 softwaredoug 的 agentic-search 概念文章形成 "为什么做 → 怎么做" 的完整论述

## 适用场景

1. **构建 AI 搜索引擎**：直接参考 Perplexity 的 SDK 设计
2. **改进现有 RAG 系统**：评估是否值得从 "embed + retrieve" 转向 "code generation + execute"
3. **设计 agent harness**：把 agent 的 tool 抽象从 JSON schema 升级到 programming language primitives
4. **企业知识管理**：用 search-as-code 模式构建内部知识库，让 LLM agent 生成查询代码而非固定 query templates

---

