## Ch15.001 What I’ve been building: ATOM Report, post-training course, finishing my book, and ongoing research

> 📊 Level ⭐⭐ | 15.2KB | `entities/interconnects-what-ive-been-building-atom-report-post-training-course-finishing-my-book-and-on.md`

type: entity
- raw/articles/what-ive-been-building-atom-report-post-training-course-fini
tags: [interconnects]
- article
title: 'What I’ve been building: ATOM Report, post-training course, finishing my book,
  and ongoing research'
type: entity
updated: '2026-06-08'
---
type: entity
# What I’ve been building: ATOM Report, post-training course, finishing my book, and ongoing research

## 相关实体
- [Building Blocks For Foundation Model Training And Inference On Aws](ch11-117-building-blocks-for-foundation-model-training-and-inference.html)
- [Llm Post Training Full Guide](ch01-232-three-years-from-gpt-3-to-gemini-3.html)
- [Yann Dubois Openai Post Training Interview](ch01-374-introducing-the-ettin-reranker-family.html)
- [How Harnesses And Post Training Close The Open Weight Bug Finding Gap 20260606](ch01-232-three-years-from-gpt-3-to-gemini-3.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/what-ive-been-building-atom-report-post-training-course-fini.md)

## What I’ve been building: ATOM Report, post-training course, finishing my book, and ongoing research

This post is a roundup of my recent efforts that did not warrant a standalone Interconnects post, why I’m spending time on them, and what they accomplished.

  1. [The ATOM Report: Measuring the Open Language Model Ecosystem](<https://www.interconnects.ai/i/194224428/1-the-atom-report-measuring-the-open-language-model-ecosystem>)

  2. [RLHF Book is done & ready for pre-order!](<https://www.interconnects.ai/i/194224428/2-rlhf-book-is-done-and-ready-for-pre-order>)

  3. [A post-training course I’m making](<https://www.interconnects.ai/i/194224428/3-a-post-training-course-im-making>)

  4. [Recent technical research](<https://www.interconnects.ai/i/194224428/4-recent-technical-research>)

[Share](<https://www.interconnects.ai/p/what-ive-been-building-atom-report?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## 1\. The ATOM Report: Measuring the Open Language Model Ecosystem

<https://arxiv.org/abs/2604.07190>

To accompany The ATOM Project [memo](<https://atomproject.ai/>), arguably a manifesto, making the case for investment in open models in the U.S. – originally launched in August 2025 – we’ve released an updated technical report with our latest data, analysis, and storytelling within the open language model ecosystem. The ATOM Report is dense with the methods Florian and I use to keep track of the open ecosystem. It covers GPT-OSS’s rise, inference market share, the influence of China’s mid-tier players like Moonshot, Z.ai, & MiniMax, signs of the U.S.’s progress on open models, and much more.

[](<https://substackcdn.com/image/fetch/$s_!JZNn!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89b0ff17-1243-46dd-a81e-96c975f20a7b_2582x1992.png>)

In particular, the paper details our updates to the [Relative Adoption Metric (RAM)](<https://atomproject.ai/relative-adoption-metric>), which we use to evaluate the adoption of recent models in a time-varying and size-normalized manner. Here’s a sampling of recent, primarily Chinese, models on the RAM score. The RAM score is designed so that a score >1 indicates a model is, at that point in time, on track to be a top 10 most downloaded model of its size category, ever. It reduces a messy landscape to one, easily interpretable number!

[](<https://substackcdn.com/image/fetch/$s_!TeBR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef64b7a-04f2-4ed8-9cc4-966b775e9f59_1918x1336.png>)

We used the data to also analyze the recent [Gemma 4](<https://www.interconnects.ai/p/gemma-4-and-what-makes-an-open-model>) release, which is showing incredible early adoption numbers. We’ll stay tuned on it!

[](<https://substackcdn.com/image/fetch/$s_!u86h!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb9e2abfe-443e-48e8-bfda-bb5855dee388_1936x1056.jpeg>)

Subscribe to the (infrequent) [ATOM Project Substack](<https://atomproject.substack.com/>) for more updates like this!

## 2\. RLHF Book is done & ready for pre-order!

<http://rlhfbook.com/>

The goal of this book was to write the book I wished I had when I was getting started in post-training language models. This project has been on my mind for a long time. I bought the domain rlhfbook.com and started to take it more seriously on May 20th, 2024. Here we are!

Last week, it was sent to production with the Manning team. This means content edits are done, and it’ll be sent to print in ~2 months. In the meantime, I’m spending my time developing the accompanying code and course (more on that below).

You can preorder on [Amazon](<https://amzn.to/4cwCDJQ>) or [Manning](<https://www.manning.com/books/the-rlhf-book>) (currently cheaper).

[](<https://substackcdn.com/image/fetch/$s_!Bv0Q!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2d8ba64-922d-4000-9d57-12cb5524a238_1200x675.jpeg>)

## 3\. A post-training course I’m making

<https://rlhfbook.com/course>

The goal of my book is for it to be the central resource for people looking to transition from beginner to expert in post-training. It’s not necessarily an entry-level book, but as AI models become stronger, it needs to be a _community_ -building effort as well. The first step I’ve made to expand the scope from just a book to a complete learning experience is building a lecture series. The lectures will be freely available on YouTube and incorporate community questions & answers (as standalone videos in between lectures).

You can watch the first batch of videos below, and subscribe on YouTube for future ones. I’m going to build on the book platform more this summer, as I develop the book [codebases](<https://rlhfbook.com/code>) and host in-person events.

  * [Welcome video & YouTube playlist](<https://www.youtube.com/watch?v=jQPiH-KB4B0&list=PLL1tdVxB1CpVpEtMHxwuR4uI4Lxjw00_y&index=3>)

  * [RLHF and Post-training Overview | RLHF Book Course, Lecture 1](<https://youtu.be/o6l6tJQgUg4>)

  * [RLHF Foundations, IFT, Reward Modeling, Rejection Sampling | RLHF Course Lecture 2](<https://youtu.be/4gIwiSPmQkU>)

  * [Understanding Policy Gradient Algorithms for RL on LLMs | RLHF Course Lecture 3](<https://youtu.be/K_Sj_-1BUMM>)

  * [Implementing RL Algorithms for LLMs | RLHF Course Lecture 4](<https://youtu.be/i-AIMpZHgeg>)

[](<https://substackcdn.com/image/fetch/$s_!VS0r!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb238c68c-d7f4-4b2b-97fa-9a3cf773e72b_1280x720.png>)

## 4\. Recent technical research

Long-time followers of Interconnects know that this blog has its roots in explaining fundamental research in the field. This has immense value in two ways. First, as AI moves incredibly fast, far more people need to be able to parse research to make the right bets on the technology. Research is the only early warning of some big changes coming. Second, it helps uplift the careers of my collaborators – the people I spend my life with! On that note, check out two papers I had the privilege of being part of below.

<https://arxiv.org/abs/2603.16759> -_TurnWise: The Gap between Single- and Multi-turn Language Model Capabilities_ ,__ Graf et al. 2026

This work explores the strengths of various models in multi-turn dialogue settings, how to create training data to improve it, and other quirks in post-training. My interests here have fully shifted to agents, where I see multi-turn interactions as a very important user interface problem — what information do I show to the user to solve the task as soon as possible without cutting corners?

<https://arxiv.org/abs/2603.11327> \- _Meta-Reinforcement Learning with Self-Reflection for Agentic Search_ , Xiao et al. 2026

This paper frames solving hard problems with RLVR as a meta-learning problem, where context from previous attempts should be used to inform future rollouts. It’s a very obvious idea in some ways, where most of RL for LLMs is still very on-policy, but naive. The models learn from recent trials in parameters, but not in context. This research feeds into a ton of other recent work on ways that RL can be formulated to solve different forms of continual learning. Another great related paper is _[Learning to Discover at Test Time](<https://arxiv.org/abs/2601.16175>)._

* * *

[Leave a comment](<https://www.interconnects.ai/p/what-ive-been-building-atom-report/comments>)

I'm off to China (and then hopefully DC) in the next couple of months to learn even more about how the world sees progress in AI. I'm excited to talk to a broader range of people than I tend to in my focused technical job. Thanks for reading, as always!

## 深度分析

### 开放模型生态的度量框架：RAM 的设计哲学

ATOM Report 中提出的 Relative Adoption Metric（RAM）代表了一种关键的方法论转向——将复杂的开源模型生态压缩为单一可解读的数字。Nathan Lambert 在此处透露的设计意图尤为值得关注：RAM > 1 意味着该模型在特定时间点有望成为其尺寸类别中下载量前十的模型。这种设计哲学体现了"时间归一化 + 尺寸归一化"的双重Normalization思路 。

RAM 的核心价值在于它解决了开放模型评测中的一个根本性问题：传统的基准测试分数无法反映模型在真实生态系统中的采用程度，而简单的下载量又会被新模型的时间优势所扭曲。RAM 通过 score > 1 这个单一阈值，将模型的早期采用信号转化为对长期影响力的预测，这对于政策制定者和投资者而言是关键的决策支持工具 。

### RLHF 图书作为社区基础设施的战略定位

Lambert 将这本书定位为"我刚开始接触 post-training 语言模型时希望能有的书"，这一表述揭示了当前 post-training 知识传播的结构性缺口。与传统学术教材不同，这本书从一开始就被设计为社区建设的核心——而非仅仅是一本技术手册 。

这个战略选择反映了更广泛的趋势：当 AI 模型能力足够强时，单个技术的学习曲线开始变得平缓，而围绕技术的社区网络成为新的差异化因素。Manning 的出版模式（纸质书 + 电子书 + 视频课程 + 代码仓库）本质上是在构建一个多模态的学习生态，而非单纯的内容产品。rlhfbook.com 这个域名本身就是一个战略资产——它将品牌与领域核心概念直接绑定，形成了搜索可见性的垄断 。

### Post-training 课程的开源与商业混合模式

从免费 YouTube 讲座到付费代码库和线下活动，Lambert 的课程设计呈现了一种精心策划的漏斗结构。前端 YouTube 内容承担的是认知触达和社区招募功能，而真正的商业价值在后端的代码库、活动和书籍配套服务中实现。这种模式与 Andrej Karpathy 的 full-stack course 分享了相似的分发逻辑，但更早地嵌入了商业闭环 。

值得关注的是，Lectures 1-4 的内容覆盖了从 RLHF Overview 到 Policy Gradient 实现的全链路，这在免费内容中构成了一套完整的 Mini 课程体系。这种策略的精明之处在于：它将 post-training 的复杂技术栈切割为可独立消费的模块，降低了入门门槛，同时通过社区 Q&A 视频建立了与付费用户的情感连接 。

### Agentic AI 研究的 Meta-Learning 转向

TurnWise 和 Meta-RL with Self-Reflection 这两篇论文的并列出现，揭示了 2026 年 post-training 研究的一个核心主题：从单轮优化到多轮/持续学习的范式转移。TurnWise 将多轮对话视为一个用户界面问题——如何在保持任务一致性的同时最大化信息效率——这与传统的单轮基准测试形成了鲜明对比 。

Meta-Reflection 论文的核心洞察更具根本性：当前大多数 RL for LLMs 仍然是 on-policy 的，但模型只能从参数层面的最近试验中学习，而无法从上下文层面的历史经验中获益。这篇论文将 RLVR 框架重构为 meta-learning 问题，使得模型能够在推理时利用先前尝试的上下文信息，这对 agentic search 等hard problem 具有特殊的意义 。

### 中国开源模型的地缘政治维度

ATOM Report 对中国中间层玩家（Moonshot、Z.ai、MiniMax）的关注，以及 Lambert 即将访问中国了解 AI 进展的计划，揭示了当前开放模型生态的地缘政治复杂性。开放权重模型的跨境流动正在重塑 AI 供应链，而 ATOM Project 本身（作为支持美国对开放模型投资的备忘录）在这个背景下具有政策倡导的意义 。

## 实践启示

### 1. 为开放模型项目设计度量标准时，优先考虑时间归一化和尺寸归一化

RAM 的设计提供了一个关键参考：不要用原始下载量或原始基准分数来比较跨时间发布的模型。如果你要为自己的模型或项目建立跟踪机制，应该设计一个能在时间维度和尺寸维度上进行标准化比较的指标。score > 1 这个阈值的设计使得跨类别比较成为可能，值得在企业内部评测体系中借鉴 。

### 2. 将技术图书项目作为社区建设的前期投资

Lambert 对 rlhfbook.com 的战略使用——将其作为社区连接的中心节点——表明，一本技术书的商业价值不仅来自内容销售，更来自它所创建的认知入口和信任通道。如果你在考虑撰写一本专业技术图书，应该从第一天就将其视为一个社区基础设施项目，而不仅仅是内容产品。购买域名和建立邮件列表应该在开始写作之前完成 。

### 3. 用免费内容建立漏斗，用付费服务实现商业闭环

Lambert 的课程策略提供了一个可复制的模式：YouTube 讲座承担认知触达，代码仓库和线下活动实现商业价值。对于任何希望建立技术课程的人而言，前 1-2 个 lecture 应该设计为完全独立可消费的内容，作为进入更深层服务的入口。社区 Q&A 视频在 lecture 之间插入，是一个低成本的社区参与机制，值得在在线课程中广泛采用 。

### 4. 在 Agentic AI 项目中，关注上下文级记忆而非仅参数级学习

Meta-RL with Self-Reflection 的核心洞察对 agent 系统设计具有直接指导意义：你的 agent 系统应该能够在上下文中利用历史任务经验，而不仅仅是依赖模型参数中的最新训练信号。在实现 agentic search 或自主研究系统时，考虑在 context window 中引入"失败历史摘要"机制，使模型能够在当前任务中借鉴先前尝试的上下文信息 。

### 5. 建立开放模型跟踪系统，关注早期采用信号

Gemma 4 显示出的"令人难以置信的早期采用数字"提醒我们，对于开放模型而言，发布后头几周的采用数据往往比基准测试更能预测长期影响。如果你负责评估或选择开放模型，应该建立一个系统来跟踪发布后 2-4 周内的下载量、社区讨论度和集成项目数量，而非仅依赖静态基准分数 。

---
