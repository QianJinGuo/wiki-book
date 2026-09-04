# 向量数据库已死，Claude Code、Cursor 为什么集体抛弃 RAG？

> 📊 Level ⭐⭐ | 11.7KB | `entities/rag-vs-agentic-retrieval-deep-dive-yunduojun-datastudio-2026-09-01.md`

# 向量数据库已死，Claude Code、Cursor 为什么集体抛弃 RAG？

2025 年 5 月，Anthropic 把向量搜索从 Claude Code 里整条拿掉，改用一个 grep 命令，结果全面胜出、优势大到连作者本人都意外。一年后，Cursor、Windsurf、Cline、Devin、Sourcegraph Amp 相继弃用向量、改走工具驱动检索，向量数据库从「默认选项」降级成了「备选项」。本文系统梳理了 RAG 与 agentic 检索在架构上的根本差异、各自何时胜出、五种实现变体，以及 2026 年生产团队的默认决策表。

→ [原文存档](https://mp.weixin.qq.com/s/kFtO6xsG09FX0-4pcm8XKg)

## 摘要

这是一篇以「向量数据库已死」为标题论证 agent-as-retriever（agent 即检索器）范式崛起的深度长文。它从 Claude Code 移除向量搜索这一标志性事件切入，用 SWE-bench、Amazon AAAI 2026 论文、Anthropic 多 agent 研究系统三份证据，说明「预建向量索引 + top-k」的经典 RAG 在代码与事实检索上系统性劣于「让 agent 用 shell 工具即时取用」的即时上下文加载（JIT context loading）。文章接着给出五种 agentic 检索变体和一份按负载类型选型的决策表，最终结论是：向量搜索没死，但不再是默认。

## 核心要点

- **向量检索在代码上系统性翻车**：SWE-bench 自带的 RAG baseline 只拿 1.96%，而第一个把检索换成工具（open_file、scroll_down、edit_lines）的 SWE-agent 跳到 12.47%；2026 年 SWE-bench Verified 榜首 80% 以上是 agentic 系统，没有一个靠向量检索。
- **五大失败机制**：语义相似度 ≠ 相关性、embedding 把显式结构关系压平、标识符本质是精确匹配、索引永远追不上代码漂移、顶层 top-k 单次检索脆弱。
- **Anthropic 的四个理由**：更准确（LLM 能迭代 refine 查询、看相邻文件、自我纠正）、更新鲜（读文件系统无索引滞后）、更安全（CPU 索引是私有代码的独立副本负债）、更可靠（组件更少故障更少）。
- **范式颠倒**:经典 RAG 是 pre-inference retrieval（推理前把 top-k 塞进 prompt），JIT 加载则是「什么都不预载，agent 需要时才用工具动态加载」，让 token 只花在 agent 判定相关的信息上。
- **证据三连**：Amazon 论文在同一 LLM 下 agentic 关键词检索忠实度达向量 RAG 的 94.5%；Anthropic 多 agent 研究系统内部评测比单个 Claude Opus 4 高 90.2%（代价约 15 倍 token）；Search-R1 用 RL 把检索策略训练出来，平均 EM 反超 RAG 基线 24%。
- **五种架构变体**：纯 agentic（Claude Code/Devin）、混合 lexical+semantic（Cursor/Amp）、结构/AST 感知（Cline/Probe）、专用检索模型（Windsurf SWE-grep/Chroma Context-1）、RL 训练的检索策略（Search-R1）。

## 深度分析

### RAG 与 agentic 检索的架构鸿沟

经典 RAG 把检索当作 LLM 上游的一个独立系统：分块、embedding、存向量、查询 top-k、塞进 prompt——模型可能需要的所有东西都必须提前预测并建好索引。这是一种 pre-inference retrieval，其致命假设是「最相似的 chunk 就是最相关的 chunk」，而 Embedding 在代码上这个假设几乎总是错的：平铺的向量把 import、类型定义、调用图这些显式结构全压平了，`processPayment` 的定义会被 `handlePayment` 顶掉，真正的定义却被一条长得像的注释淹没。

agentic 检索把范式完全颠倒过来：检索是 LLM 的行为，通过工具调用表达，而非模型上游的系统。在 Claude Code 里，检索被暴露成一撮刻意无聊的工具——Glob、Grep（ripgrep 正则）、Read、Bash（兜底 shell）、Explore 只读子代理，每个工具只做一件事，控制循环是 plan → glob/grep → read → refine query → repeat（或 spawn subagent）→ compact → answer。决定性区别在于：agent 与字节之间没有预建索引，检索器就是 agent 选择调用的那个 shell 工具。

JIT 加载还改变了上下文窗口的形态。传统 RAG 把 token 花在猜相关的 chunk 上，JIT 加载则把 token 只花在 agent 判定相关的 chunk 上，其余全部跳过。它不仅能顶住「agentic 循环更烧 token」的批评，配合子代理的上下文隔离反而能省 token——Claude Code 的工具懒加载把上下文占用降了约 95%。但 JIT 加载最终仍会填满窗口，所以必须配一条五层压缩管道（Budget reduction → Snip → Microcompact → Context collapse → Auto-compact）：既要只加载需要的，也要优雅地忘掉不需要的。

### 何时 agentic、何时向量：三份 benchmark 的边界

Amazon 的《Keyword Search Is All You Need》（AAAI 2026）给出了最严谨的公开对比：同一个 LLM（Claude 3 Sonnet）、同样六个数据集，唯一区别是检索器——一边是 Bedrock Knowledge Base + Titan Embeddings V2，一边是调用 pdfmetadata、rga、pdfgrep 的 ReAct agent。结果是 agentic 关键词检索达到 RAG 忠实度的 94.5%、上下文召回 88.0%、答案正确性 91.5%，全程零向量库；在 FinanceBench 上 agentic 反而高出 6 个百分点。这证明分块加嵌入的失败模式是通用的，不只是代码专属。

Search-R1 则把 agentic 检索推到了下一层：既然检索是工具调用，它就成为一个可学习策略。给 R1 风格推理模型加上「推理中途发出 search 调用」的能力，用基于结果的 RL（veRL + RAGEN）让模型学会何时搜、搜什么、何时够。在七个 QA 数据集上用 Qwen2.5-7B 平均 EM 达到 0.431，对 RAG 基线 0.304 提升 24%。架构层面的意义比分数更大——你没法对冻结的嵌入模型做这件事，但你可以对检索 agent 做。

Anthropic 自己的 Research 功能提供了非编码场景的最强证据：orchestrator-worker 架构，lead（Claude Opus 4）分解查询派 3–5 个子代理，每个子代理跑自己的 agentic 检索循环，只回传浓缩结论。这套多 agent 系统在内部研究评测上比单个 Claude Opus 4 高 90.2%，token 用量本身解释了约 80% 的性能方差——当任务价值撑得起这笔花费，往检索里砸更多 token，答案质量几乎线性提升。但这是一个重要保留的来源：divergence 是广度优先（研究、跨来源找全部 X）有效，对编码这种强串行依赖的任务效果要差。

### 工具设计、MCP 与选型决策

agent-as-retriever 的成败全在工具设计。Anthropic 的上下文工程原则只有一条核心判据：如果一个人类工程师都无法说清某个场景该用哪个工具，就别指望 agent 做得更好。所以工具必须自包含、抗错、用途极其清晰、每个只做一件事。Model Context Protocol（MCP）则把这个模式从 Claude Code 特性变成生态默认——每个数据源（文件系统、数据库、可观测性、工单、SaaS）都成为 agent 可调用的统一工具与资源集合；一旦检索是工具调用，每个数据源都成了候选检索器，无需人为建向量索引。

这套模式不是免费午餐，有几条值得认真对待的批评：token 成本（单次查询 $0.02–$0.10，普通 RAG 只要几分钱）、延迟（每次 5–10 次工具调用是秒级不是毫秒级）、超大语料（PB 级 monorepo 上预计算索引仍赢）、真正的语义查询（「重试策略都说了什么」对 grep 困难）、紧耦合串行任务、以及确定性与缓存（向量查找确定性、可缓存，agent 循环不是，评测与 SLA 更难）。

因此 2026 年的默认决策是分负载选型的：私有仓库代码走纯或混合 agent-as-retriever；大型企业 monorepo 走混合或结构（AST）；持续变化语料（日志、CRM、工单）经 MCP 走 agent-as-retriever；稳定知识库（FAQ、产品文档）才用带 reranker 的向量 RAG；长 PDF 用 ColPali 视觉检索或 pdfgrep；全局主题类问题用 LazyGraphRAG；多跳推理用 Search-R1 风格 RL 检索；延迟敏感对话用专用检索模型；广度优先研究用多 agent；严格数据驻留/合规环境 agent-as-retriever 结构上更容易获批（没有离开 host 的 embedding）。

## 实践启示

1. **先给工具、再谈索引**：默认把检索交给 agent 的工具（grep、glob、read、AST 查询、MCP server）即时取用，评估它们是否够用；只有语义泛化、超大稳定语料、亚秒级对话这些明确需要嵌入的工作负载，才把向量索引加回来。
2. **刻意做小工具面**：不要给 agent 一堆重叠的检索工具（find_file_by_name / search_file_by_path / locate_file），每种问题形状只保留一个工具；每加一个工具，都要让人类工程师能说清何时该用它——说不清就别让模型猜。
3. **把关键缺陷转成决策输入**：先问「这是强串行任务还是广度优先任务」。广度优先（研究、跨源收集）该上多 agent + agentic 检索，敢于为 token 成本买单；强串行（端到端做功能）用单 agent + 强上下文工程，别付多 agent 的 15 倍 token 开销。
4. **正视 token 与延迟预算**：agentic 循环单查询成本与 5–30 倍 token 是真实成本，用提示缓存、工具懒加载、子代理上下文隔离补回一部分；延迟敏感的对话场景直接选专用检索模型或保留向量回退。
5. **评估指标换成回归视角**：agentic 检索比静态检索器更难做评测与 SLA，接入 RAGAS / SWE-bench / QED 类基准做回归测试，别只凭单次上下文的「感觉」判断检索质量。
6. **用 MCP 把每个数据源变成候选检索器**：把文件系统、数据库、Sentry、工单等暴露为统一工具面，让 agent 对它们一视同仁地发现、搜索、读、refine，避免为每个源各建一套索引副本带来的隐私与维护负债。

## 相关实体

- `RAG（检索增强生成）`
- `Agentic Retrieval for Amazon Bedrock`
- `Model Context Protocol (MCP)`
- `上下文工程`
- `多智能体系统`
- `Claude Code 深度架构分析`

---

