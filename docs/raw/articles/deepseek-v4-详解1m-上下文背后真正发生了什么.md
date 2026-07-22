---
title: "DeepSeek V4 详解：1M 上下文背后，真正发生了什么"
source: wechat
url: https://mp.weixin.qq.com/s/OkJjRqTwRV2z0Xw9T6Likg
ingest_date: 2026-07-04
vxc: 64
stars: 4
sha256: a4f61fa7ddcfd8d17fff98e4b9d798c76378cc3f5ea800b256f275a5625c9c72
---

# DeepSeek V4 详解：1M 上下文背后，真正发生了什么

**来源**: 架构师

**发布日期**: 2026-04-25

**原文链接**: https://mp.weixin.qq.com/s/OkJjRqTwRV2z0Xw9T6Likg

---

架构师（JiaGouX）

我们都是架构师！

架构未来，你来不来？

DeepSeek V4 昨天发了。准确说，是 preview 版本：  DeepSeek-V4-Pro  和  DeepSeek-V4-Flash  ，权重已经挂在 Hugging Face 上，技术报告同步公开。

我自己第一遍看的时候，注意力先被几行字抓住——1.6T 总参、49B 激活、1M 上下文、Pro/Flash 双线开源。再往下翻技术报告，感觉就不太一样了。

它更像 DeepSeek 在认真回答一个工程问题：

当上下文来到 1M token 这一档，模型、推理系统、缓存、搜索、Agent 工作流，要怎么一起变化，才不至于把成本和状态拖到失控。

官方帖子里有句话很扎眼——"Welcome to the era of cost-effective 1M context length"。这其实就是这次发布想立的旗。

今天反复翻 PDF，又顺手把 V3.2 的几条线、  Claude Code 的 Prompt Caching  那篇翻出来对了一遍，越看越觉得：

V4 这次最该细看的，不是窗口大小。是它把"百万上下文够不够便宜"这件事，拆成了一串互相咬合的工程问题。

我们挑几个看起来比较有信息量的事情看看。

## 太长不看版

- • V4 的 1M 不是单纯把窗口拉大。它把"FLOPs、KV cache、共享前缀复用、推理预算"这些原本散落在不同地方的成本，全收进一张工程图。

- • 在 1M 场景下，V4-Pro 相对 V3.2 的单 token FLOPs 降到 27%，KV cache 降到 10%；V4-Flash 更激进，分别是 10% 和 7%。这是这次发布最硬的一组底层数据。

- • 注意力换成 CSA + HCA 混合，残差换成 mHC，优化器换成 Muon，再叠 FP4/FP8 混合精度——单点都不算颠覆，串起来才是 V4。

- • KV cache 不再被当成"分页存张量"，而是被当成一个有生命周期、有压缩粒度、有命中策略的存储系统在管。on-disk KV cache 是为 Agent 这种"反复共享前缀"的场景留的口子。

- • 推理强度被显式拆成 Non-think / Think High / Think Max 三档，等于把推理成本做成了一个产品接口。

- • 后训练换路了：先养 4 个领域专家，再用 On-Policy Distillation 把它们合到一个模型里，替掉了 V3.2 那套 mixed RL。

- • 白领任务那段调侃 Claude "只会列 bullet points" 很容易被记住，但报告里也老老实实承认：复杂指令和多轮写作上，Claude Opus 4.5 还领先。

- • 真要落到自己做 Agent 的人身上，V4 给的三件事更实在：长上下文成本能压、推理预算可分档、搜索和工具被纳进了模型级工作流。

## 先别被"1M"这个数字带跑

这两年长上下文几乎成了发布会的固定节目。200K、1M、2M、4M，数字越写越大。

但只要真跑过长任务 Agent 的人都知道，窗口大只是第一步。

更难的，其实是这三件事：

- • 这么长的上下文，每轮 prefill 算得起吗？

- • KV cache 存得下、调得动、能不能复用？

- • 塞进窗口的东西，到底还在帮当前任务，还是已经在干扰它？

第一件是计算账。第二件是系统账。第三件是上下文治理账。

之前分析《  1M 上下文不是终点  》时就提过一句话：窗口变大之后，装得下只是开始，装进去之后还好不好使，才是长任务里更麻烦的部分。再回看《  Claude Code 为什么缓存命中率能做到 92%  》，长任务的成本大头很多时候不在输出，而在老前缀被每一轮重复 prefill。

DeepSeek V4 这次有意思的地方，就在这里。

它没停在"我支持 1M"这一句。报告从架构、训练、推理、后训练、搜索、白领任务，一整套都在围绕同一个问题展开：

怎样让超长上下文从"能跑"，变成"可以常态化使用"。

如果把它和最近几篇上下文、缓存、Harness 文章放在一起看，脉络会更清楚：

- • 《
  1M 上下文不是终点
  》讲的是容量变大之后，状态管理反而更难。

- • 《
  Claude Code 为什么缓存命中率能做到 92%
  》讲的是稳定前缀、动态尾部和缓存命中的经济账。

- • 《
  Agent Harness 综述
  》讲的是模型外面那套工具、权限、状态和验证系统。

V4 报告把这三件事的一部分往模型底座里收了：注意力成本它收了一刀，KV cache 系统化它收了一刀，搜索和工具调用也被纳进了同一套后训练和推理框架。

放在一起看，开源模型的竞争已经在往下一层走。参数和 benchmark 还重要，但更难的是把这套底层工程做顺手。

## 第一刀：让注意力别再按原价付费

Transformer 的老问题大家都熟——窗口越长，attention 和 KV cache 就越容易变成瓶颈。

V4 的做法是把注意力拆成两条压缩路线交错用：

- •
  CSA（Compressed Sparse Attention）
  ：先把每
  m
  个 token 压缩成一个 KV entry，再用稀疏选择让每个 query 只看 Top-k 的压缩 KV。

- •
  HCA（Heavily Compressed Attention）
  ：用更激进的压缩率
  m'
  ，但保持稠密注意力，不走稀疏。

直白点说，CSA 像"压完再挑重点看"，HCA 像"压得更狠，但仍然完整扫一遍压缩表示"。

两种机制交错，是为了同时回避两个极端：

- • 不能每个 token 都按原始粒度完整看，太贵。

- • 也不能只靠局部窗口或粗暴截断，信息会丢。

可以先看看这个图：

V4 没把 1M token 原封不动扔给传统 attention。它先把"看什么、怎么看、看多细"分了层。

效率数字也顺着这条路线展开。1M 场景下，V4-Pro 相对 V3.2 的单 token FLOPs 降到 27%，KV cache 降到 10%；V4-Flash 更激进，分别是 10% 和 7%。

还有一个容易被忽略的对比：以常见的 BF16 GQA8 作为基线，V4 系列在 1M 上下文下的 KV cache 可以降到大约 2%。

这说明 DeepSeek 的目标已经越过"窗口拉到 1M"这一层。它更想证明的是：百万窗口的边际成本得能压下去。

## mHC、Muon、FP4：这些不是论文装饰

光看 CSA 和 HCA，容易把 V4 误读成一篇"注意力优化"论文。

PDF 里实际写得更重。V4 保留了 DeepSeekMoE 和 MTP，但在 V3 基础上又补了三块：mHC、混合注意力、Muon。

mHC 全称 Manifold-Constrained Hyper-Connections，被报告单独拎出来讲。它处理的是深层堆叠时的信号传递稳定性，和长上下文成本是两条线。

标准 Hyper-Connections 会扩展 residual stream，堆多层之后容易出现数值不稳定。mHC 的做法，是把残差映射矩阵约束到双随机矩阵所在的流形（Birkhoff polytope），把映射矩阵的谱范数压在 1 以内，让残差变换不扩张。

公式不必背，记一句话就行：

CSA / HCA 让长上下文算得起，mHC 让更深、更复杂的模型训得稳。

Muon 是优化器层面的事。报告说 V4 对大多数模块用 Muon，只在 embedding、prediction head、mHC 的静态 bias / gating factor、RMSNorm 这些位置保留 AdamW。Muon 的正交化用了 hybrid Newton-Schulz iteration，配合 Nesterov trick 和 RMS rescaling。

我注意到一个工程细节：DeepSeek 没有只说"用了新优化器"。它把 ZeRO bucket 分配、mHC fused kernel、选择性 recomputation、DualPipe 1F1B 调整这些配套实现也都写了。mHC 本身会增加激活内存和 pipeline 通信量，报告给出的优化结果是把 mHC 的 wall-time overhead 控制在 1F1B pipeline stage 的 6.7%。

这是 DeepSeek 一贯的风格——不肯只让你看到结果，多少还要把代价告诉你。

往部署侧再走一步，V4 的 FP4 也不是孤立的量化卖点。报告里 FP4 主要用在两处：

- •
  MoE expert weights
  ，降低专家参数的显存和访存压力。

- •
  CSA indexer 的 QK path
  ，加速超长上下文里的 attention score 计算。

它还提到 top-k selector 因相关量化拿到 2 倍加速，同时保留 99.7% 的 KV entry recall。

合起来看 V4 的技术路线，会清楚很多：

层次
解决的问题
PDF 里的关键设计

注意力
1M 上下文太贵
CSA + HCA

残差连接
深层训练稳定性
mHC

优化器
收敛与训练稳定性
Muon + hybrid Newton-Schulz

精度
访存、显存、超长 attention 成本
FP4 / FP8 mixed

推理服务
异构 KV cache 和共享前缀复用
customized KV layout + on-disk KV cache

再补一组基座的数字。V4-Pro-Base 在预训练阶段消化了超过 32T token：

Benchmark
V3.2-Base（37B 激活）
V4-Flash-Base（13B 激活）
V4-Pro-Base（49B 激活）

MMLU
87.8
88.7
90.1

MMLU-Pro
65.5
68.3
73.5

C-Eval
90.4
92.1
93.1

SimpleQA-Verified
28.3
30.1
55.2

HumanEval
62.8
69.5
76.8

LongBench-V2
40.2
44.7
51.5

我看下来有几个点比较有意思：V4-Flash-Base 只用 13B 激活（仅 V3.2-Base 的 35%），多数知识任务已经追平甚至反超 V3.2-Base；V4-Pro-Base 在知识密集任务上跳升最猛，说明 32T 训练数据在事实知识上的回报很扎实；LongBench-V2 从 40.2 提到 51.5，则印证了混合注意力在长上下文理解上的实际收益。

所以"效率账"要放到前面讲。V4 的 1M 上下文靠的是一串互相咬合的系统优化，单点技巧撑不起来。

## 第二刀：KV cache 被当成系统在管

长上下文的成本，不只来自一轮模型计算。

更麻烦的，其实是 KV cache。

传统 PagedAttention 这类方案，默认你处理的是相对规整的 KV block。但 V4 的混合注意力会冒出多种 KV：CSA/HCA 的压缩 KV、Sliding Window 的最近窗口 KV、还没凑够压缩块的 tail state。

KV cache 管理因此从"分页存张量"，变成"管理一堆策略不同的状态"。

报告里专门写了 V4 的 KV cache layout：一部分是 classical KV cache，负责 CSA/HCA 的压缩条目；另一部分是 state cache，负责 SWA 和未压缩尾部状态。state cache 给每个请求分配固定大小的 cache block；classical KV cache 则按  lcm(m, m')  覆盖原始 token，兼容 CSA 和 HCA 的不同压缩率。

放到工程现场，可以这么理解：

V4 把长上下文推理里的 KV cache，当成了一个有生命周期、有压缩粒度、有命中策略的存储系统在设计。

这里和我们前面写 Claude Code Prompt Caching 那篇能对上。Claude Code 那边讲的是稳定前缀如何复用，V4 这里更底层——直接在模型服务侧处理混合注意力产生的异构 cache。

报告还专门提到 on-disk KV cache storage，用来消除 shared-prefix 请求中的重复 prefill。它把压缩 KV、SWA KV、尾部重算策略都分开做了存储设计。意思很明白：单次长上下文推理要省，多个共享前缀请求之间也要省。

这对 Agent 特别关键。

真实 Agent 任务里，请求之间往往有大量共享前缀：系统提示、工具定义、项目规则、已读文档、任务 brief。只要这些前缀稳定组织，命中就能把长任务成本一直摁在低位。

我的看法是：模型窗口变大之后，谁能把 KV cache 做成可复用资产，谁就能更便宜地跑长任务。这和 Prompt Caching 那篇是一条线——稳定前缀别乱动，动态尾部往后长，系统才有机会复用算过的状态。

## 第三刀：推理预算被分成三档

V4 的 Instruct 模型支持三种推理强度：

模式
特点
适合场景

Non-think
快速、直觉式回答
日常任务、低风险决策

Think High
有意识的逻辑分析
复杂问题、规划、分析

Think Max
最大化推理投入，推荐上下文 ≥ 384K
探索能力边界、困难题

看起来像产品功能，实际上是成本控制接口。

同一个模型，不同任务不该一律烧最高推理预算。写一封普通邮件、查一个事实、做一次复杂代码修复、跑一份长文档分析——成本结构完全不同。统一上 Max，看着"更强"，其实是在烧预算，也会拉高延迟。

报告的标准评测里，Max 模式确实把 V4-Pro 推到很高：SimpleQA-Verified 57.9、Chinese-SimpleQA 84.4、LiveCodeBench 93.5、Codeforces Rating 3206、Apex Shortlist 90.2、Terminal Bench 2.0 67.9、SWE Verified 80.6、Toolathlon 51.8。

但表格里也藏着另一面：很多任务上 High 和 Max 的差距并不大；Flash 给够 thinking budget 后，部分推理任务可以追近 Pro。报告对 Flash 的定位也克制——推理任务给够预算后接近 Pro，但知识类任务和高难 Agent workflow 仍会落后。

我的理解是：

模型能力要分层用，"最强模式"不应该是默认模式。

未来做 Agent，更稳的策略大概率是：

- • 默认 Non-think 处理低风险、可恢复的小任务。

- • 规划、代码审查、跨文档分析用 Think High。

- • 只有数学、复杂推理、关键设计评审这种场景，才升 Think Max。

这和传统系统里的资源分级是同一个逻辑——所有请求都走最高规格，成本和延迟很快会变得难看。

PDF 里还有一个细节我留意了一下：V4 在 tool-calling 场景里，会保留完整 reasoning content，跨多轮用户消息也保留。报告明确说这和 V3.2 不同，V3.2 会在每个新用户 turn 丢弃 thinking traces。

但它并不是所有场景都这么做。普通对话场景里，旧的 reasoning content 仍会在新用户消息后被丢掉。

这条边界很关键。

工具任务通常是长链路：查资料、执行工具、读取结果、修正路径、继续下一步。这里保留推理历史，可以让模型维持一条累积的任务线索。普通聊天如果也一直保留，反而会把历史想法越堆越重。

这和前面写 Claude Code 会话管理时讲的是同一件事：长上下文要按场景来管——什么留下、什么丢掉。

## 中文白领任务：别只看那句"调侃 Claude"

V4 报告里有一段话，最近应该会被很多人记住。

在白领任务评测里，DeepSeek 直接拉来 Claude Opus 4.6 Max 做对比，原文里有这么一句：

"It also excels in long-form generation, delivering in-depth, coherent narratives rather than relying on the overly simplistic bullet points frequently produced by Opus-4.6-Max ."

翻译过来大意是：V4-Pro-Max 长文生成更深入、更连贯，不像 Opus-4.6-Max 那样动不动就糊几个 bullet points 上来。

这句话挺少见。技术报告通常写得很克制，很少这么直接点名同行。

但我不太想把这段只看成"DeepSeek 嘲讽 Claude"。更有信息量的是：DeepSeek 为什么要单独构造一组中文白领任务。

DeepSeek 自建了 30 个高级中文职业任务，覆盖金融、教育、法律、科技等 13 个行业。评测环境是一个内部 agent harness，带 Bash 和 web search 等基础工具。人工评审从四个维度打分：

- •
  Task Completion
  ：核心问题是否解决。

- •
  Instruction Following
  ：是否遵守约束和指令。

- •
  Content Quality
  ：事实准确性、逻辑连贯性、专业口吻。

- •
  Formatting Aesthetics
  ：排版可读性和视觉呈现。

结果是：

任务类型
V4-Pro-Max 胜
平
Opus-4.6-Max 胜

analysis
55.0%
8.0%
37.0%

generation
52.0%
10.0%
38.0%

editing
47.0%
18.0%
35.0%

overall
53.0%
10.0%
37.0%

细分维度也挺有意思：

维度
V4-Pro-Max
Opus-4.6-Max

Task Completion
98.32
96.68

Instruction Following
87.76
88.88

Content Quality
83.32
78.00

Formatting Aesthetics
76.68
72.68

Overall
86.52
84.06

这组数据可以拆成两层看。

第一层是能力。DeepSeek 在中文白领场景里确实有强势的一面，尤其是长文生成、内容质量、中文专业文档结构。

第二层是边界。Claude 的复杂指令遵循仍然很硬。V4 在 Instruction Following 上反而略低。

所以这里不好简单写成 "Claude 不行了" 。我更倾向于这样看：

DeepSeek V4 在中文职业写作和成稿型任务上更主动、更完整；Claude 在复杂约束和多轮稳定性上仍然很硬。

报告后面 Table 14 也印证了这个边界。在复杂指令跟随和多轮写作上，DeepSeek-V4-Pro 对 Claude Opus 4.5 的总体胜率是 45.9% vs 52.0%。其中复杂指令跟随 46.9% vs 53.1%，多轮写作 45.6% vs 51.7%。

那句 bullet points 很醒目，但不能替代完整的能力边界。

## 中文写作：考的其实是交付能力

报告里还有一组对中文用户很重要的数据：DeepSeek-V4-Pro 对 Gemini-3.1-Pro 的中文功能写作评测。

总体胜率 62.7% vs 34.1%。

报告给出的解释挺直接：Gemini-3.1-Pro 有时会让自己的固有风格偏好，覆盖用户的明确要求。

写过中文长稿的人大概都见过这种情况——模型明明会写，却很容易"写成它自己喜欢的样子"。

这件事已经超出了文风问题。

对企业里的白领任务，写作能力经常不等于"文采"。它更像下面这些能力的组合：

- • 能不能听懂约束。

- • 能不能保住结构。

- • 能不能在长文本里维持同一套口径。

- • 能不能把材料组织成可交付文档。

- • 能不能在格式、标题、层级、编号上符合本地习惯。

DeepSeek 选择在中文职业写作上做这么细的评测，说明它很清楚自己的核心使用场景：数学榜和代码榜要跑，API 和 Chatbot 的真实用户场景也要做强。

这也是 V4 报告里比较务实的一面。它没有只用公开评测证明"我很强"，还把中文写作、搜索、白领任务、代码 Agent 这些真实任务单独拎出来评估。

至少它让我们知道：V4 的优化目标不是抽象的"通用智能"，它瞄准的是 API、Chatbot 和企业生产力场景里的具体任务。

## Search 和 Agent：模型开始有"工作流意识"

V4 报告里的 Search 部分，我也想专门拎出来说一下。

DeepSeek 把聊天产品里的搜索分成两种：

- •
  Non-think 模式
  ：用 Retrieval-Augmented Search，也就是更传统的 RAG。

- •
  Thinking 模式
  ：用 agentic search，让模型可以围绕一个问题多次调用 search 和 fetch。

内部评测里，Agentic Search 对 RAG 的总体胜率是 61.7% vs 18.3%，平 20.0%。平均工具调用次数 16.2 次，prefill token 也比 RAG 高一些，但报告认为成本只是边际增加。

这组数字放到一起看，重点不在"搜索更准了"这一层。

更有意思的是，DeepSeek 已经把搜索看成模型推理过程的一部分，而不是一个挂在外面的检索模块。

这和前面写 Harness 时讲的内容能接上：

Prompt 管怎么说，Context 管模型看到什么，Harness 管系统怎么跑。Agentic Search 其实就是把搜索工具、抓取工具、thinking budget 合在一起，组成了一个小型 harness。

如果再叠上 V4 的 Quick Instruction 设计，就更明显了。

报告说，聊天场景里很多辅助任务，比如是否触发网页搜索、意图识别，以前可能要再训一个小模型。V4 的做法是在输入序列里追加专门的 special tokens，让这些辅助任务直接复用已经算好的 KV cache，避免重复 prefill。

这个细节很 DeepSeek——能少一套外围系统，就少一套。

它说明 DeepSeek 想省的，除了主模型推理成本，还有"外部小模型 + 重复 prefill + 额外系统复杂度"这类隐性成本。

## Code Agent：报告给了能力，也给了边界

V4 报告还有一个容易被快讯略过的部分：Code Agent。

DeepSeek 没只拿公开代码榜说话。它从内部真实研发工作负载里收集任务——原始任务大约 200 个，来自 50 多位内部工程师，覆盖 feature development、bug fixing、refactoring、diagnostics，技术栈包括 PyTorch、CUDA、Rust、C++。经过质量过滤后，保留 30 个任务作评测集。

这点和我们在 Harness 系列里反复说的内容很接近：代码 Agent 的能力，不能只看"模型会不会写一段代码"。更要看它能不能在真实仓库、真实环境、真实评分规则里完成任务。

报告里的用户调查也可以一起看。DeepSeek 问了 85 位日常用 V4-Pro 做 agentic coding 的内部开发者和研究员：相比其他前沿模型，V4-Pro 能不能作为默认主力 coding model？

结果：

- • 52% 回答 yes。

- • 39% 倾向 yes。

- • 少于 9% 回答 no。

这是内部调查，要注意来源边界。但报告没只写好话，还列了问题：trivial mistakes、misinterpretation of vague prompts、occasional over-thinking。

翻成工程语言，就是三类老问题还在：

- •
  小错误
  ：局部实现、边界条件、格式或调用细节出错。

- •
  模糊需求误读
  ：prompt 不清楚时，模型会自作主张。

- •
  过度思考
  ：该直接做的任务，被拉成长推理链。

这也解释了为什么我不太愿意把 V4 这次写成"开源模型全面追平闭源"。

更稳的说法是：

V4-Pro 已经能在一批真实 coding agent 任务里承担主力模型角色，但它仍然需要清晰任务、可执行环境、测试闭环和 Harness 约束。

这和《  模型差距在缩小，Harness 差距在放大  》正好接上。模型越强，越容易让人忽略外层系统。但只要任务进入真实仓库，最后拼的仍然是上下文、工具、权限、状态、验证和回滚。

## 后训练：先养专家，再合成一个模型

V4 的后训练路线也很关键：先训练多个领域专家，再通过 OPD 合到一个统一模型里。

报告里说，DeepSeek 先用 SFT 和 GRPO 培养数学、代码、Agent、指令遵循等领域的专家，然后用 On-Policy Distillation 做多教师蒸馏，让统一模型学习这些专家在自己生成轨迹上的输出分布。按 PDF 的写法，V4 的最终后训练阶段把 V3.2 中的 mixed RL stage 替换成了 OPD。

可以翻译成一个更直观的工程流程：

基础模型

领域专家训练数学 / 代码 / Agent / 指令遵循

多个教师模型

On-Policy Distillation学生在自身轨迹上学习教师分布

统一模型DeepSeek-V4 Instruct

这个路线的好处，是可以把不同能力先分开打磨，再合并到一个用户可用的模型里。

代价也明显——OPD 基础设施很重。报告里提到 full-vocabulary OPD、超过十个教师模型、教师权重按需加载、长上下文 RL/OPD rollout、token 级 WAL、可抢占和容错的生成服务。

这里有一个很细的正确性问题：如果生成任务被抢占，不能简单从头重生成，否则会引入 length bias。DeepSeek 的做法是用 token 级 WAL 和保存的 KV cache 继续 decoding；遇到致命错误时，也可以用 WAL 里的 token 重新 prefill 来恢复 KV cache。

这些内容对普通用户不直接可见，但对模型公司很关键。模型竞争已经从"训一个大模型"，延伸到后训练、蒸馏、rollout、容错、量化、推理服务这些环节。

## Pro 和 Flash：怎么理解这条产品线

DeepSeek V4 的产品线分成 Pro 和 Flash。

官方 Hugging Face collection 目前有 4 个模型，发布一天累计了近 500 个 upvote，Pro 单卡下载量已超 7.8 万：

模型
总参数
激活参数
HF 仓库尺寸
上下文
精度

DeepSeek-V4-Flash-Base
284B
13B
292B
1M
FP8 Mixed

DeepSeek-V4-Flash
284B
13B
158B
1M
FP4 + FP8 Mixed

DeepSeek-V4-Pro-Base
1.6T
49B
1.6T
1M
FP8 Mixed

DeepSeek-V4-Pro
1.6T
49B
862B
1M
FP4 + FP8 Mixed

我留意到一个细节：Instruct 版本的仓库尺寸"腰斩"——FP4 QAT 把 Pro 从 1.6T 压到约 862B，Flash 从 292B 压到约 158B。这是 V4 把"百万上下文 + 万亿参数"做成"可被部署"的一个重要前提。

产品入口也同步上线。chat.deepseek.com 把两条线分别包装为 Expert Mode （对应 Pro，深度推理）和 Instant Mode （对应 Flash，低延迟），API 当日同步更新。

这里有个取舍。

Pro 更强，尤其是知识和复杂 Agent 任务。Flash 更便宜更快，给足 thinking budget 后，很多推理任务可以接近 Pro，但知识密度和高难 Agent 任务仍会落后。

放到生产系统里去用，分层会更清晰：

- • Flash 适合高频、低成本、可批量处理的任务。

- • Pro 适合高价值、强推理、强知识、强上下文的任务。

- • Base 更适合研究、微调、二次训练。

- • Instruct 更适合直接对话、工具调用、产品接入。

对企业接入来说，先做路由比"全量换 Pro"更稳。低风险任务走 Flash，复杂规划和关键交付走 Pro；普通模式先 Non-think，必要时升级 High 或 Max。把模型、模式、上下文长度和工具预算一起纳入路由策略，V4 双线产品才更好用。

## 接进真实系统时，先看什么

如果明天要把 DeepSeek V4 接进一个真实 Agent 系统，我不会第一步就问"它能不能替代谁"。

可以先按任务拆开：

场景
优先模型
推理模式
关键控制点

日常问答、普通文案
Flash
Non-think
成本、延迟、格式稳定

中文报告、材料整理
Pro 或 Flash
High
结构、引用、事实边界

长文档分析
Pro
High / Max
上下文分层、缓存、摘要验证

代码修复、工具调用
Pro
High
Harness、沙箱、测试闭环

搜索增强问答
Pro
High
Agentic Search、来源质量、引用

高风险设计评审
Pro
Max
人工确认、可回滚、审计记录

这张表里更该看的，是右边那列控制点。

V4 的能力当然要试，但生产系统里决定体验的，仍然是外面那套工程：任务路由、上下文分层、工具权限、缓存策略、验证闭环、失败恢复。

模型变强以后，Harness 的责任不会变小，反而更重。

## 写到这里，几个我自己想留下的观察

报告很长，我也写得不短了，这一段就当是和朋友闲聊几句，把我自己看完之后比较在意的几件事顺一下。

最先想留下的，还是那条线索： 1M 这个数字本身已经不稀奇了，关键是成本结构。 V4 把注意力 FLOPs、KV cache、shared-prefix prefill、on-disk cache 拉到一起做，就是想把"长上下文"从能力展示推到生产成本能接受的位置。如果自己在做长任务 Agent，先看几件具体的事：每段上下文是不是每轮都要重算？有没有稳定前缀？有没有可压缩的尾部？这些问题问下来，往往比"该不该换 V4"更花时间，也更接近真实成本。

顺着这条线往下， 上下文工程只会越来越重，不会越来越轻 。窗口大不等于自动能用。过去的上下文工程常常是"塞什么进去"，往后会变成"什么稳定、什么动态、什么可压缩、什么应该隔离、什么能缓存、什么该丢"。Non-think / High / Max 这套分档，慢慢也会从"模型功能"变成业务接口：让任务风险、可恢复性、用户等待意愿和业务价值一起决定推理预算，而不是一上来就开最高档。

Agentic Search 这块我自己挺看好。它确实会替代一部分静态 RAG，但代价也得看清——工具调用次数变多、链路变长、错误也会变多。Harness 仍然要管超时、重试、来源质量、引用边界和最终验证。

中文职业写作这条线，我觉得国产模型很快会卷到一个新阶段。漂亮句子只是表面，更值钱的是能按本地语境交付可用文档，这会直接影响企业知识工作流、报告生成、咨询分析、投研、法务、教育、运营这些场景。但同时也别太上头：复杂指令和多轮稳定性仍然是硬骨头，V4 自己都坦白 Claude Opus 4.5 在这几项上还领先。这其实是好事，它提醒我们模型选型按任务切，比按品牌切更稳。

最后一件事，更像一种感受： 训练和推理基础设施，正在变成模型能力的一部分 。TileLang、deterministic kernels、FP4 QAT、WAL、on-disk KV cache、teacher scheduling，这些东西看着不像"模型能力"，但最终都会反映到模型能不能稳定发布、便宜服务、跑长任务、从中断里恢复。以后再看模型报告，参数和榜单当然还会看，训练、后训练和服务框架也要一起看。

## 写在最后

DeepSeek V4 这次发布，表层看是一个强开源模型的更新。

再往里看，它其实在回答 2026 年大模型系统的一个核心问题：

当模型能力还在继续上涨，长上下文、推理预算、搜索工具和后训练专家，要怎么合成一套能稳定交付的系统。

调侃 Claude 那句话很容易被记住，但不是报告里最该停下来看的部分。

更该记住的是，DeepSeek 已经把长上下文的成本、KV cache 的系统化管理、推理强度分档、Agentic Search、中文职业任务评测，放进了同一张工程图里。

这意味着开源模型竞争正进入下一阶段。

接下来更该比的是：谁能把大窗口做便宜、把强推理做可控、把工具调用做稳定、把真实任务跑成闭环。

这对做 Agent 和 AI 工程化的人，会更有参考价值。

## 往期相关

相关延伸：

- • 《1
  M 上下文不是终点：Anthropic 正在把 Claude Code 变成"上下文操作系统"
  》

- • 《
  Claude Code 为什么缓存命中率能做到 92%？一篇讲清 Prompt Caching 的工程逻辑
  》

- • 《
  Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远
  》

- • 《
  30分钟手搓 Agent：LLM + Tools + Loop + Memory 跑通最小闭环
  》

## 参考资料

- • DeepSeek-V4 Hugging Face Collection：https://huggingface.co/collections/deepseek-ai/deepseek-v4

- • DeepSeek-V4-Pro Model Card：https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro

- • DeepSeek-V4 Technical Report：https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf

- • DeepSeek 官方 X 发布帖：https://x.com/deepseek_ai/status/2047516922263285776

如喜欢本文，请点击右上角，把文章分享到朋友圈

如有想了解学习的技术点，请留言给若飞安排分享

因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享

·END·

```python
相关阅读：

- 刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness
- 大家都在讲 Harness，但它到底该怎么理解
- 模型越来越强，为什么大家却开始重写 Harness

- 如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案
- Claude Code高手的 8 个 Claude Code 实战习惯
- 别从 README 开始：一个架构师会怎样翻 Codex 仓库
- Spec 不是代码的替代品，它是 AI Coding 的上下文管理层
- 如何让 Agents 自己设计、升级 Agents
- OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳
- Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”
- 一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks
- Claude Code 最佳实践：把上下文变成生产力（团队可落地版）
- 把 AI 当成新同事：Agent Coding 的上下文与验证体系
- 一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论
- 2026年生活重启指南
- 我真不敢相信，AI 先加速的是工程师。
- 扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事
- Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品
- Anthropic官方万字长文：AI Agent评估的系统化方法论
- 银弹还是枷锁？Claude Agent SDK 的架构真相
- Claude Code创始人亲授13条使用技巧
- Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案

```

版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!

架构师

我们都是架构师！
