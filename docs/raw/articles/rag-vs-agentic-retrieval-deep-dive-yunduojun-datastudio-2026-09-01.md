---
source_url: https://mp.weixin.qq.com/s/kFtO6xsG09FX0-4pcm8XKg
ingested: 2026-09-01
sha256: b93d199aa90471958180fbe44f25ea892d52d2b2ee921bc92ac54d65d2a2427e
source_published: 2026-09-01
title: "向量数据库已死，Claude Code、Cursor 为什么集体抛弃 RAG？"
author: 云朵君
feed_name: 数据STUDIO
---

2025 年 5 月，Anthropic 做了一件当时没有引起足够重视的事：他们把向量搜索从 Claude Code 里拿掉了。嵌入管线、本地向量数据库、分块启发式，全部删除，取而代之的是一个叫 grep 的命令。Claude Code 的作者 Boris Cherny 在 Latent Space 播客上说，结果是outperformed everything. By a lot, and this was surprising——全面胜出，而且优势很大，大到他们自己都意外。一年后，问题已经不再是 AI Agent 是否需要向量数据库，而是当初为什么会觉得需要。Cursor 挖走了做出这个决定的工程师；Windsurf、Cline、Devin、Sourcegraph Amp 相继弃用向量、改走工具驱动检索；Anthropic 自己的多 agent 研究系统，在内部评测上比单个 Claude Opus 4 高出 90.2%；亚马逊一篇 AAAI 2026 论文测得，只用关键词工具的 agent 达到了 RAG 94.5% 的忠实度，全程零向量库。标题说向量数据库已死，更准确的说法是：它没死，但它从默认选项降级成了备选。

## 01 向量检索在代码上是怎么翻车的

要理解这次转向，得先看原来的基线有多糟。SWE-bench 是真实 GitHub issue 的标准基准，2023 年 10 月发布时带了一个最简单的 RAG baseline：把代码库分块、做 embedding、取 top-k、生成补丁。它只拿到 1.96%。第一个 agent 系统 SWE-agent，把检索换成工具（open_file、scroll_down、edit_lines），直接跳到 12.47%。到 2026 年，SWE-bench Verified 榜首被 80% 以上的 agentic 系统占据，而排在前面的没有一个靠向量检索。

为什么向量检索在代码上这么失败？源文归纳了五条：语义相似度不等于相关性。最相似的 embedding 是个很差的代理，代替不了我改这行代码会弄坏哪个函数。代码有显式的结构关系——import、类型定义、调用图——平铺的 embedding 把这些全压平了。标识符本身就是搜索。当你问 processPayment 在哪定义，你要的是精确匹配。向量搜索会带来误报（handlePayment）和漏报（真正的定义被一条长得像的注释顶了下去）。索引永远是错的。代码在漂移，每次提交都让一部分索引失效。持续重建索引又贵又永远追不上——这和 GraphRAG 被 LazyGraphRAG 之前遇到的问题一模一样。索引是一笔负债。一份私有代码的向量索引，就是这份代码的一个副本，躺在别的设施上，访问控制往往比源仓库更弱。单次检索是脆弱的。top-k 只有一次机会，一旦第一次没命中对的文件，模型就会自信地生成错代码。

亚马逊这篇论文把这个结论从代码泛化到了更广的范围，测试了 FinanceBench、BlockchainSolana、Llama2Paper、HistoryOfAlexnet 等六个数据集。在 FinanceBench 上，agentic 关键词检索反而比传统 RAG 高出 6 个百分点（30.40% 对 24.24%）。分块加嵌入的失败模式是通用的，不是代码专属。

## 02 用 grep 换掉 RAG：Anthropic 的四个理由

Cherny 和 Cat Wu 对为什么把向量搜索从 Claude Code 里拿掉说得异常直白。从播客和后续访谈看，理由收敛成四点。准确，这是最让他们意外的一点。团队原本预期 agentic 检索会比 RAG 更差，并且准备好为运维简单性接受一点质量损失。结果它反而更强。机制在于：一个驱动 grep 迭代的 LLM 能不断 refine 自己的查询、看相邻文件、跟随 import、自我纠正——单次 embedding 查找做不到这些。新鲜。agent 读文件系统，反映的是仓库的当前状态，没有索引滞后。改一个文件，100 毫秒后问 Claude Code，它读的是新字节；向量索引要等下一轮重新嵌入才会更新。安全与隐私。Cherny 的原话是：RAG 有一整套索引步骤……索引得放在某个地方……这对公司来说是一大笔负债。企业客户尤其不想要一份私有代码的独立嵌入副本躺在别人的设施里。可靠。组件更少，故障更少。基于 grep 的检索没有会漂移的嵌入模型、没有会挂的向量库、没有会滞后的重建管线、没有要调的分块策略。ripgrep 能用，find 能用，cat 也能用。

Cat Wu 总结得最干净：Claude 非常擅长 agentic 检索，你能用 agentic 检索达到同样的准确度，而部署故事干净得多。

## 03 即时上下文加载：从预计算嵌入到按需取用

Anthropic 在 2025 年 9 月的工程博客《Effective context engineering for AI agents》里，给这个做法起了个名字：just-in-time context loading（即时上下文加载）。它和传统 RAG 划了一条很清晰的界线。传统 RAG 是 pre-inference retrieval（推理前检索）：把一切都预先嵌入、存向量、查询时取、把 top-k 塞进 prompt——模型可能需要的所有东西都得提前预测并建好索引。JIT 加载则是：agent 维护轻量标识符（文件路径、存储的查询、网页链接等），并在运行时用工具把这些引用动态加载进上下文。什么都不预载，agent 需要什么、什么时候需要，就取什么。

更深的一层，是它改变了上下文窗口的形状。在推理前 RAG 里，你的 token 花在那些你猜会相关的 chunk 上；在 JIT 加载里，token 只花在 agent 判断相关的 chunk 上，其余全部跳过。Anthropic 把这概括成找到最小的、高信号、能最大化期望结果的 token 集合。

这也是为什么这个模式不仅能顶住 token 成本的批评，还能把它反过来。朴素的 agent 循环确实比向量 RAG 用更多 token，但 JIT 加载配上子代理的上下文隔离，反而能用更少 token——因为彻底避开了低信号的 chunk。一个经常被引用的内部数字：Claude Code 的工具懒加载（需要时才加载工具定义）把上下文占用降低了约 95%。

## 04 Agent 作为检索器：一套刻意无聊的工具

这个模式长什么样？在 Claude Code 里，检索被暴露成一小撮刻意无聊的工具：Glob：文件路径模式匹配，token 成本近乎为零。Grep：基于 ripgrep 的正则内容搜索。Read：把完整或部分文件内容读进上下文。Bash：兜底的 shell，处理长尾（tail、head、jq、git log、带谓词的 find）。Explore 子代理：一个只读的独立 agent（默认 Haiku 4.5），有自己的上下文窗口，用于并行探索代码库。

一份对 Claude Code TypeScript 源码的逆向研究记录了更大的系统：54 个内置工具（19 个无条件、35 个特性门控），而其中只有 1.6% 是 AI 决策逻辑，其余 98.4% 是运维基础设施、上下文管理、权限、工具派发、压缩。决策层很小，检索与上下文管理层巨大。

控制循环的形状是：plan → glob/grep → read candidates → refine query → repeat（或 spawn subagent）→ compact → answer。这和 agentic RAG（Self-RAG、CRAG、A-RAG）是同一个形状，只有一个关键区别：agent 和字节之间没有预建索引。检索器就是 agent 选择调用的那个 shell 工具。

因为 JIT 加载最终还是会填满上下文窗口，Claude Code 在接近 20 万 token 上限时跑一条五层压缩管道：Budget reduction：先丢最不相关的内容。Snip：去掉冗余的工具调用输出。Microcompact：逐条总结过长的单条消息。Context collapse：把更早的轮次折叠成更短的回顾。Auto-compact：实在塞不下时的最终总结。这是 JIT 加载的必要补充：你既要只加载需要的，也要优雅地忘掉不再需要的。

## 05 三份 benchmark 的证明

关键词检索就够用最严谨的公开对比，来自 Subramanian 等人的《Keyword Search Is All You Need》，AAAI 2026。同一个 LLM（Claude 3 Sonnet，20 万上下文，temperature 0.001）、同样的六个数据集、同样的评测框架，唯一区别是检索器：一边是 Amazon Bedrock Knowledge Base 配 Titan Text Embeddings V2，另一边是一个调用 pdfmetadata、rga、pdfgrep 的 ReAct agent。

全数据集的核心数字：Faithfulness（忠实度）：agent 0.81 对 RAG 0.86 → 达到 94.5%。Context Recall（上下文召回）：agent 0.68 对 RAG 0.77 → 达到 88.0%。Answer Correctness（答案正确性）：agent 0.59 对 RAG 0.65 → 达到 91.5%。

论文的结论是：向量数据库对高质量检索性能不是必需的。用简单关键词搜索工具的 agentic 方法，对很多应用都是一个可行的替代。亚马逊的论文证明了提示出来的 agent 就能用关键词工具追平 RAG。Search-R1 再往前一步：把检索策略本身用强化学习训练出来，agent 不光追平，还反超。

做法是给一个 R1 风格的推理模型加上在推理中途发出 search 调用的能力，用基于结果的 RL（veRL + RAGEN）让它学会何时搜、搜什么、何时够。检索期间的 token 掩码保证训练稳定。七个 QA 数据集（NQ、TriviaQA、PopQA、HotpotQA、2WikiMultiHopQA、Musique、Bamboogle）上，用 Qwen2.5-7B：Search-R1 平均 EM：0.431，RAG 基线 0.304。相对提升 24%（3B 模型是 20%）。参考系：SFT 0.207、无检索的 R1 0.276、拒绝采样 0.348。

架构层面的意义比分数更大：一旦检索是工具调用，它就成了一个可学习策略。你能用造出推理模型的那套 RL 机器，把 agent 训练成更好的检索器——你没法对冻结的嵌入模型做这件事。

同一个模式在非编码场景的最强证据，来自 Anthropic 自己的工程团队。他们的 Research 功能用 orchestrator-worker 架构：一个 lead（Claude Opus 4）分解查询、生成计划、并行派出 3–5 个子代理；每个子代理（Claude Sonnet 4）跑自己的 agentic 检索循环，每轮调用 3 个以上工具；子代理只回传浓缩结论，完整的工具调用痕迹被隔离在子代理内部。结果：这套多 agent 系统在内部研究评测上比单个 Claude Opus 4 高出 90.2%，复杂查询的研究时间最多省 90%，代价是约 15 倍的 token。Anthropic 明确说，token 用量本身解释了约 80% 的性能方差——当任务价值撑得起这笔花费时，往 agentic 检索里砸更多 token，答案质量几乎线性提升。一个重要的保留：多 agent 对广度优先的任务（研究、跨多个来源找所有 X）有效，对编码这种强串行依赖的任务效果要差。

## 06 五种变体：agentic 检索的谱系

到 2026 年，这个模式至少分裂成五种架构变体，各有各的代表产品。

纯 agentic（Claude Code、Devin）：没有持久索引，只有 Glob、Grep、Read、Bash、Explore 子代理。赌的是：在每次提交都在变的代码库上，一个在循环里驱动 ripgrep 的 LLM 能胜过任何冻结的嵌入模型。

混合 lexical + semantic（Cursor、Sourcegraph Amp）：Cursor 的文档把两种模式并列：精确符号用 Instant Grep，概念查询用语义搜索，agent 按查询形态选。Cursor 引用的内部研究称语义加 grep 带来 +12.5% 的精度。Sourcegraph 的 Amp 是在其长期维护的代码图之上叠了一层同样的 agent。混合是大多数企业工具收敛的方向。

结构 / AST 感知（Cline、Probe、ast-grep）：纯 grep 是词法的，纯嵌入是语义的，还有第三条路：结构检索。ast-grep、Probe 这类工具用 tree-sitter 解析代码，让 agent 按语法模式而非字符串搜索。Cline 的开源实现是最干净的生产例子，一个三层检索栈：第一层 ripgrep 内容搜索（带输出上限），第二层 fzf 模糊文件/目录搜索（带自定义打分），第三层 tree-sitter AST 提取做多语言定义发现。agent 在 plan-and-act 循环里编排三层，给当前打开的文件更高权重。Cline 报告称这套系统在保持结构感知的同时，把每轮检索的 token 占用压到约 17.5%。

专用检索模型（Windsurf SWE-grep、Chroma Context-1）：训练一个专门做检索的小模型。Windsurf 在 2026 年初的 Wave 13 发布 SWE-grep 和 SWE-grep-mini，每轮并行 8 次工具调用、跑 4 轮，检索比通用 agentic 检索快 10 倍。Chroma 的 Context-1 是一个 20B 的 agentic 检索模型，在同样的多跳任务上推理快约 10 倍、成本低约 25 倍。

RL 训练的检索策略（Search-R1、CoSearch、Agentic-RAG-R1）：agent 通过强化学习学会何时检索、检索什么，比提示出来的 agent 高出两位数。这是 agent-as-retriever 长期胜出的最干净的理论依据：它是可学习的系统，不是固定管道。

五种变体共享一个架构前提：agent 拥有检索。区别只在于工具背后是什么、以及这些工具怎么被造出来。

## 07 工具设计原则与 MCP

agent-as-retriever 的成败全在工具设计上。Anthropic 的上下文工程博客把原则说得很直接：工具应当自包含、抗错、用途极其清晰。输入参数要描述性、无歧义、发挥模型固有优势。避免臃肿的重叠工具集，每个工具只做一件清晰的事。最终判据：如果一个人类工程师都无法明确说清某场景该用哪个工具，就别指望 AI agent 做得更好。这就是为什么 Claude Code 的工具面那么小。Glob 做一件事，Grep 做一件事，Read 做一件事，Bash 做其余所有（带显式权限门）。模型永远不需要在 find_file_by_name、search_file_by_path、locate_file 之间做选择——每种问题形状只有一个工具。

如果说 agent-as-retriever 是模式，那 Model Context Protocol（MCP）就是把它从 Claude Code 的特性变成生态默认的协议。MCP 的核心想法：把每个数据源——文件系统、数据库、可观测性、工单、SaaS 应用——变成 agent 可以调用的统一工具与资源集合。

MCP 由 Anthropic 在 2024 年 11 月引入，是一个 JSON-RPC 2.0 协议，让任何 LLM 驱动的 host（Claude Code、Cursor、VS Code、Claude Desktop）连接任意 MCP server——一个向 host 暴露工具、资源、提示的程序。官方的 MCP filesystem server 是最干净的生产例子：它暴露一个精心裁剪的工具面——read_file、write_file、list_directory、search_files、get_file_info——在一个显式允许的目录清单下。决定调用哪个的是 agent，不是协议。

含义是：任何 MCP 感知的 host，都变成了对任何有文件系统形状的东西的 agent-as-retriever 系统。Sentry 暴露 incident，Postgres 暴露表，filesystem server 暴露仓库，agent 对它们一视同仁：发现、搜索、读、refine。一旦检索是工具调用，每个数据源都成了候选检索器，无需任何人为它建向量索引。

## 08 什么时候别急着扔向量库?

这个模式不是免费的午餐。有几条值得认真对待的批评。

Token 成本：Anthropic 自己的数据很坦率：多 agent 研究系统比聊天多用 15 倍 token。Milvus 团队发了一篇标题就叫《Why I'm Against Claude Code's Grep-Only Retrieval》的批评，论证迭代 grep 循环的单次查询成本远高于预计算查找。行业估计：每个任务比聊天交互多 5–30 倍 token，复杂 agent 循环单次查询 $0.02–$0.10，而普通 RAG 只要几分钱。提示缓存和工具懒加载能补回很大一块，但补不回全部。

延迟：每次查询 5–10 次工具调用，是秒级不是毫秒级。交互式编码没问题，亚秒级用户对话不行。SWE-grep 和 Context-1 正是为了把延迟压下来而存在的。

超大语料：在 1000 万文件的 monorepo 上 grep 不是免费的。ripgrep 和并行遍历有帮助，Explore 子代理模式可以扇出，但在 PB 级规模上预计算索引仍然赢。混合答案是：在一个更小的、agent 自己选定的切片里做 agentic 检索。

真正的语义查询：这个代码库关于重试策略都说了什么？这类问题对 grep 比嵌入更难，答案可能散在从不用 retry 这个词的文件里（backoff、requeue、circuit_breaker）。agent-as-retriever 的答案是发多次查询再综合，Probe 和 AST 工具靠理解结构来回答，Cursor 的混合路线则保留一层轻语义处理同义词。

紧耦合任务：Anthropic 自己的保留：多 agent 研究帮得了广度优先的问题，却伤得了编码这类深度串行的任务。工作的形状很重要。

确定性与缓存：向量查找是确定性的、便宜的、可缓存的，agent 循环不是。生产团队正在往 RAGAS、BenchmarkQED、SWE-bench Verified 上收敛，但评测、回归测试和 SLA 执行比静态检索器更难。

## 09 2026 的默认：先给工具，再谈索引

把上面的架构排成一张属性表，2026 年生产团队真正在用的决策大致是这样的：私有仓库上的代码 → agent-as-retriever（纯的或混合的）。Claude Code、Devin、Cursor 都收敛到了这里。大型企业 monorepo + 跨服务查询 → 混合（Cursor、Sourcegraph Amp）或结构（Probe）。持续变化的语料（日志、仪表盘、CRM、工单） → 经 MCP server 走 agent-as-retriever，新鲜度优先于峰值召回。稳定的知识库（产品文档、FAQ、词表） → 带 reranker 的向量 RAG，别过度设计。长而版式重的 PDF（财报、论文、合同） → ColPali/ColQwen2 视觉检索，或带 pdfgrep 的 agent-as-retriever，两者都行。整个语料的主题类全局问题 → LazyGraphRAG。agent-as-retriever 在没有任何单一查询能命中答案时吃力。多跳推理 + 动态检索 → Search-R1 风格的 RL 检索策略，或 agentic RAG 框架。延迟敏感的对话 → 专用检索模型（SWE-grep、Context-1），或带向量回退的混合。广度优先的研究 → 多 agent + agentic 检索，90.2% 的提升、15 倍 token，当任务价值大于 token 成本时选它。强串行任务（端到端做一个功能） → 单 agent + 强上下文工程，别付多 agent 的开销。严格数据驻留 / 合规环境 → agent-as-retriever 结构上更容易获批，没有外部索引、没有离开 host 的 embedding。

三年来，RAG 的主流假设是：检索是 LLM 上游的系统——分块、嵌入、top-k、prompt。agent-as-retriever 及其形式化后的 JIT 加载，把它颠倒了过来：检索是 LLM 的行为，通过工具调用表达。agent 决定找什么、何时再找、何时停、怎么组合找到的东西。检索器就是那个最合适当时场景的 shell 命令、MCP server、AST 查询，或 RL 训练出来的检索策略。

证据不是推测。Claude Code 上线了它，看到它胜过 RAG；Anthropic 自己的多 agent 系统用同样的模式高出 90.2%；Cursor 的回应是挖走造它的人；亚马逊在零向量库的情况下，忠实度达到了向量 RAG 的 94.5%；Search-R1 用 RL 把检索策略训练出来，反超 RAG 24%。这个模式如今被复制、被 benchmark、被产品化、被 MCP 标准化、被端到端训练。这一切都不意味着向量搜索死了。它意味着向量搜索不再是默认。2026 年的默认是：把工具交给 agent，把工具设计好，让它即时检索；只有在语义泛化、超大稳定语料、亚秒级对话这些真正需要嵌入的工作负载上，才把向量加回来。
