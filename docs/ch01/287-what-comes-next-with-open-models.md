# What comes next with open models

## Ch01.287 What comes next with open models

> 📊 Level ⭐⭐ | 28.0KB | `entities/interconnects-what-comes-next-with-open-models.md`

type: entity
- raw/articles/what-comes-next-with-open-models
tags: [interconnects]
- article
- open-models
title: What comes next with open models
type: entity
updated: '2026-06-08'
---
type: entity
# What comes next with open models

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/what-comes-next-with-open-models.md)

# What comes next with open models

2025 was the year where a lot of companies started to take open models seriously as a path to influence in the extremely valuable AI ecosystem — the adoption of a strategy that was massively accelerated downstream of [DeepSeek R1’s](<https://www.interconnects.ai/p/deepseek-r1-recipe-for-o1>) breakout success. Most of this is being done as a mission of hope, principle, or generosity. 

Very few businesses have a real monetary reason to build open models. Well-cited reasons, such as [commoditizing one's complements](<https://gwern.net/complement>) for Meta's Llama, are hard to follow up on when the cost of participating well is billions of dollars. Still, AI is in such an early phase of technological development, mostly defined by large-scale industrialization and massive scale-out of infrastructure, that having any sort of influence at the cutting edge of AI is seen as a path to immense potential value. 

Open models are a very fast way to achieve this, you can obtain substantial usage and mindshare with no enterprise agreements or marketing campaigns — just releasing one good model. Many companies in AI have raised a ton of money built on less. 

The hype of open models is simultaneously amplified by the mix of cope, disruptive anticipation, and science fiction that hopes for the world where open models do truly surpass the closed labs. This goal could be an economically catastrophic success for the AI ecosystem, where profits and revenue plummet but the broader balance of [power and control of AI models](<https://www.interconnects.ai/p/how-anthropic-vs-dow-impacts-open>) is long-term more stable.

There's a small chance open models win in absolute performance, but it would only be on the back of either a true scientific breakthrough that is somehow kept hidden from the leading labs or the models truly hitting a wall in performance. Both of them are definitely possible, but very unlikely. 

It is important to remind yourself that there have been no walls in progress to date and all the top AI researchers we discuss this with constantly explain the low-hanging fruit they see on progress. It may not be recursive self-improvement to the singularity (more on that in a separate post), but large technology companies are on a direct path to building definitionally transformative tools. They are coming.

[Share](<https://www.interconnects.ai/p/the-next-phase-of-open-models?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## The balance of power in open vs. closed models

The fair assessment of the open-closed gap is that [open models have always been 6-18 months behind the best closed models](<https://www.interconnects.ai/p/open-models-in-perpetual-catch-up>). It is a remarkable testament to the open labs, operating on far smaller budgets, that this has stayed so stable. Many top analysts like myself are bewildered by the way the gap isn't bigger. Distillation helps a bit in quality, benchmaxing more than closed labs helps perceptions, but the progress of the leading open models is flat out remarkable. 

The reality is that the open-closed model gap is more likely to grow than shrink. The top few labs are improving as fast as ever, [releasing many great new models](<https://www.interconnects.ai/p/opus-46-vs-codex-53>), with more on the docket. Many of the most impressive frontier model improvements relative to their open counterparts feel totally unmeasured on public benchmarks. 

In a new era of coding agents, the popular method to "copy" performance from closed models, [distillation](<https://www.interconnects.ai/p/how-much-does-distillation-really>), requires more creativity to extract performance — previously, you could use the entire completion from the model to train your student, but now the most important part is the complex RL environments and the prompts to place your agents in them. These are much easier to hide and all the while the Chinese labs leading in open models are always complaining about computational restrictions. 

As the leading AI models move into longer-horizon and more specialized tasks, mediated by complex and expensive gate-keepers in the U.S. economy (e.g. legal or healthcare systems), I expect large gaps in performance to appear. Coding can largely be mostly "solved" with careful data processes, scraping GitHub, and clever environments. The economies of scale and foci of training are moving into domains that are not on the public web, so they are far harder to replicate than early language models. 

Developing frontier AI models today is more defined by stacking medium to small wins, unlocked by infrastructure, across time. This rewards organizations that can expand scope while maintaining quality, which is extremely expensive.

All of these dynamics together create a business landscape for open models that is hard to parse. Through 2026, closed models are going to take leaps and bounds in performance in directions that it is unlikely for open models to follow. This sets us up for a world where we need to consider, fund, use, and discuss open models differently. This piece lays out how open models are changing. It is a future that'll be clearly defined by three classes of models.

  1. **True (closed) frontier models.** These will drive the strongest knowledge work and coding agents. They will be truly remarkable tools that force us to reconsider our relationship to work.

  2. **Open frontier models.** These will be the best open-weight, large models that are attempting to compete on the same directions as above. There will be plenty of use-cases that they don't work for relative to the best models, but countless use-cases where they work remarkably well. For many use-cases, even ones as valuable as some subsets of coding, these will work great.

The AI ecosystem will still take years to understand what it means to have intelligence of this magnitude served in private, at the marginal cost of electricity for individuals, as assistants, coaches, companions, and more. OpenClaw provided a glimpse behind the mirror that will expand and grow. The class of models around GPT-OSS 120B, [Nvidia Nemotron 3 Super](<https://developer.nvidia.com/blog/introducing-nemotron-3-super-an-open-hybrid-mamba-transformer-moe-for-agentic-reasoning/>), or [MiniMax M2.5](<https://huggingface.co/MiniMaxAI/MiniMax-M2.5>) are the balance of performance to price that can work as local models.

  3. **Open, small models as distributed intelligence**. The _most successful_ open models will be complementary tools to closed agents. This is a path for open models to complement and accelerate the frontier of progress.

AI is slotting in to automate many repetitive, niche tasks across the technology economy. There's a huge pressure to shift these tasks off of the best closed models — which frankly are still better at most of the things, across my conversations with businesses trying to build with open models — to small, open models that can be 10X faster and 100X cheaper. There aren't really people building data and fine-tuning engines for economically viable tasks on the smallest models possible.

These models need to be almost brain-numbingly boring and specific. In a world dominated by coding agents, I want to build open models that Claude Code is _desperate_ to use as a tool, letting its sub agents unlock entirely new areas of work. This is possible, but remarkably under-explored. Small models from the likes of Qwen and co. are still marketed on general-task benchmarks. The hype of "open models catching the frontier" distracts the world from this very large area of demand.

This is the sort of model that moves open models from just a few, crucial static weights to more of an ecosystem. It requires creativity and a new approach. The goal of this piece is to illustrate why and how to build these, with added context on where open models stand today.

All three of these model classes hint at different ways to use agents. It is absolutely definitional to how AI is going to be built going forward that they're not just model weights, but rather systems that [think, search, and act](<https://www.interconnects.ai/p/thinking-searching-and-acting>). The weights only define one portion of those abilities.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

## Open weights as part of an AI system

To start, consider what are the most impactful and impressive things that language models can do _without_ a suite of tools at their side. When was the last time that you were blown away by something that was _just_ autoregressive token outputs? Unless you're doing a substantial amount of work on mathematical proofs or competition code, it seems like that situation has changed little since GPT-4's release in 2023. The AI systems we use today are about far, far more than weights.

In this world, closed models have a clear advantage. Closed models get to vertically integrate everything from the chips they run on, the inference software, the weights, the tools, and the user interface. Open models on the other hand need to work on every inference setup, with many tools, and in many use-cases. This vertical integration is best expressed today in the joy of using Claude Code with Opus 4.6 or OpenAI's Codex with GPT 5.4. Open models haven't passed this point. Some are starting to focus on specific interfaces, e.g. OpenCode, but there's an inherent tension in making an open model work only in your blessed product roadmap.

At the same time, this change could point to more about the latest AI systems being open! If you can do less with the weights alone, maybe more labs will release them.

The way to think about AI systems today is as a mix of weights, tools, and harnesses. The weights portion is familiar. The tools are the deeply integrated environments the models act in _at deployment time_ — best typified by search and code sandboxes — and the harness is how these two fit together with a product that the user sees.

In this world, there are two things to consider: 1) Is there an equivalent, open system to the closed products that people are using today — I mean truly equivalent, where every level of the stack can be modified and controlled (more on this later), and 2) How does this system's view impact different future decisions in the open ecosystem?

## Still looking for open model business strategies

To understand how the business and practicality of open models will evolve, let me take a tour back in time to foundational writing on the role of open-source in modern technology companies. The first is a Google blog post, [The Meaning of Open](<https://googleblog.blogspot.com/2009/12/meaning-of-open.html>), which originally was an internal memo by Jonathan Rosenberg, which sparked an intense internal debate that later resulted in it becoming public. To start, here's a basic assessment of how open systems can work:

> Open systems have the potential to spawn industries. They harness the intellect of the general population and spur businesses to compete, innovate, and win based on the merits of their products and not just the brilliance of their business tactics.

I've long believed that the company who will benefit most from the ecosystem of open models is the one who understands it best. This entails being deeply involved with open research and experimentation in how to use the models. So far, most of the open model company business models are not this. Rosenberg expands on this in his 2009 post, comparing the dynamics of open systems to closed products:

> [Open systems] are competitive and far more dynamic. In an open system, a competitive advantage doesn't derive from locking in customers, but rather from understanding the fast-moving system better than anyone else and using that knowledge to generate better, more innovative products. The successful company in an open system is both a fast innovator and a thought leader; the brand value of thought leadership attracts customers and then fast innovation keeps them. This isn't easy — far from it — but fast companies have nothing to fear, and when they are successful they can generate great shareholder value.

We've known for some time that open weight models are not actually enough to constitute a product — models are a product in the sense that they have tools and harnesses, so we don't actually have fully open systems, we have systems that are partially open partially closed, making moats messy. VLLM and a model like GLM 5 are pieces of a system, but it still takes more to deploy them — expensive private GPUs and some tools with local business data.

It may turn out to be that AI is too complex and expensive to have any analogous open system to previous generations of technology. If there was a fully open system, it would win by default, as many historical generations of technology have shown us. This fully open analog does not yet exist, so we have constant debates on the role of open-source AI.

Bill Gurley recounts how Google's free products have exemplified the open or free strategies across technology. Gurley [wrote](<https://abovethecrowd.com/2011/03/24/freight-train-that-is-android/>) on the open-source operating system, Android, and the free browser, Chrome, in 2011:

> So here is the kicker. Android, as well as Chrome and Chrome OS for that matter, are not "products" in the classic business sense. They have no plan to become their own "economic castles." Rather they are very expensive and very aggressive "moats," funded by the height and magnitude of Google's castle. Google's aim is defensive not offensive. They are not trying to make a profit on Android or Chrome. They want to take any layer that lives between themselves and the consumer and make it free (or even [less than free](<https://abovethecrowd.com/2009/10/29/google-redefines-disruption-the-%E2%80%9Cless-than-free%E2%80%9D-business-model/>)). 
 
> Because these layers are basically software products with no variable costs, this is a very viable defensive strategy. In essence, they are not just building a moat; Google is also scorching the earth for 250 miles around the outside of the castle to ensure no one can approach it.

In the same post, Gurley reflects on the limits of Google's openness:

> In this open manifesto, Jonathan opines over and over again that open systems unquestionably result in the very best solutions for end customers. That is with one exception. "In many cases, most notably our search and ads products, opening up the code would not contribute to these goals and would actually hurt users." As Rodney Dangerfield said in Caddyshack, "It looks good on you, though."

Essentially, Google open-sourced so much, in fact _paid_ people to use its products (e.g. paying phone makers to use android) to keep the funnel leading to the search profit center. This is the virtuous loop that the search business still funds to this day.

AI is still nothing like this, but signs of change are emerging. The default belief on the value of models to these companies is that _the model is the product_. This is obvious with products like hosted APIs, where releasing the model weights would be business suicide, but this is softening as interfaces like Claude Code, Codex, Cursor, etc. get vastly popular. It could be a path to more openness, at least in parts of the stack. We can see this with the coding plans offered by Moonshot and Z.ai — where the demand is very high for the businesses, even though the model is open. Most people will just use the cheap interface with inference, instead of figuring out how to use the model themselves (as long as the business is mostly consumer or per-head services).

All of this doesn't leave me optimistic on the direction of companies becoming more open in the coming years. I'd expect the opposite still. [Nvidia has the one great reason to be open](<https://www.interconnects.ai/p/why-nvidia-builds-open-models-with>) — to sell more GPUs to people building on open models and understand what they need to build next, but there's no one else obvious on this list. Until there are more specific economic reasons to build open models, the companies building these at the frontier will have fewer resources to spend on the models and face a consolidation to the best few.

In the face of consolidation at the open frontier, the investment in the models _should_ shift to areas where the models can have more differentiated upside relative to the best closed frontier models.

[Leave a comment](<https://www.interconnects.ai/p/the-next-phase-of-open-models/comments>)

## Open models that are specific, cheap, fast, and ubiquitous

There's too much obsession with the best companies building open models to try and compete at the frontier. There's a vastly underserved market of enterprises that want cheap, reliable models for repetitive use-cases in their systems. Picture this, one small model with a series of LoRA adapters that specialize the model to internal skills. This can be deployed very cheaply as tools and a complement to the frontier closed models that are orchestrating agents. 

Every task that a frontier agentic model does tens to hundreds of times can potentially be outsourced to a small model. There are ancillary benefits to this, e.g. privacy of a local model reading your files and summarizing to Claude, but almost no one is pushing hard in this direction. The leading model family of capable, customizable small models to date is Qwen, but that's now [shrouded in uncertainty with the departures of key personnel](<https://interconnect.substack.com/p/alibabas-ai-drama>). Gemma, Phi, Olmo, etc. are all major steps down in quality, and therefore potential for modification.

There are a few obvious examples why this can be scaled up. There was a recent [thread](<https://x.com/awnihannun/status/2030024849570288080>) and [discussion](<https://x.com/N8Programs/status/2030386417566613707>) on how the new Qwen 3.5 4B model arguably bests the original ChatGPT model. On the research side, there are already [recipes](<https://arxiv.org/abs/2601.20789>) for finetuning open models on specific code-bases to match performance of much bigger models. [Moondream.ai](<https://moondream.ai/) is a startup made by a friend of mine Vik, who builds some of the best, small multimodal models on a tiny budget — they compete with Qwen and Llama on real world tasks. This is the tip of an iceberg. 

Intelligence compression hasn't been explored with nearly as much depth (or resources) because it is less exciting than keeping track of the progress of the best few models. Investigating these areas is the standard technological diffusion process that is slow and why we're still early in understanding how people will build with AI. My contention is that too many people building open models are slightly deluded in their perception of their competitiveness. The best few models will win on general capabilities and there are still plenty of underserved niches elsewhere.

Taking this to the next level involves releasing open models that are scoped to be truly excellent at 1-3 tasks, as I hinted at the beginning of this piece. Too many people try to compete with Qwen and show that their small model does great on frontier AI benchmarks. The right benchmark here is savings in compute and time.

It'll take years for this transition to slowly become reality. Part of why I am so excited about it is that it is driving innovation on open models being more about diversity, specialization, and curiosity, rather than the standard "one model to rule them all" that the frontier models presume.

[Share](<https://www.interconnects.ai/p/the-next-phase-of-open-models?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## Models vs. ecosystems.
Consolidation vs. creativity.

So long as the open source ecosystem for AI is defined by a bunch of model providers trying to chase after the closed labs, it will largely lose. It will face pain on funding and substantive adoption. The same consolidation that will come for closed AI companies will come for open model builders — likely even sooner. 

Open systems at their best allow many people to participate and many approaches to flourish.

The world of open models needs to be more of an ecosystem. I've discussed in the past how [China is ](<https://www.interconnects.ai/p/on-chinas-open-source-ai-trajectory>)_[closer](<https://www.interconnects.ai/p/on-chinas-open-source-ai-trajectory>)_[ to this type of environment](<https://www.interconnects.ai/p/on-chinas-open-source-ai-trajectory>) by having a variety of companies, but the variety in approaches is still too low.

Ecosystems are self-reinforcing, whereas individual models are static artifacts in time. Ecosystems showcase clear, constant opportunities for what's next that have growing value propositions. 

The path forward for open models is to solve different problems than the frontier labs, to find places where open models are effectively free alternatives, to show ways of using specialized models that the closed labs cannot offer. The world of open models needs to embrace creativity, before building powerful AI systems grows too expensive and prices out many of the prized open labs of today.

## 深度分析

### 三层模型架构的战略意涵

文章提出的三层分类框架——真正的闭源前沿模型、开源前沿模型、小型专用开源模型——揭示了 AI 产业正在从"通用智能竞争"向"层级化智能分工"演进。这是一个根本性的范式转变：开源模型的角色不再是追赶闭源前沿，而是在整个 AI 系统栈中找到不可替代的生态位。

从投资视角看，这个三层架构意味着资源分配应该高度分化：绝大多数计算资源和人才应流向第一层（闭源前沿），因为那里产生最高的单位资本回报；第三层模型则提供补充性机会——投资门槛低、退出路径清晰，且能与整个生态系统形成正向循环。中间层面临最尴尬的位置：既无法在成本上与第三层竞争，又无法在性能上接近第一层，面临双重挤压 。

### 蒸馏困境与护城河重塑

文章深入分析了蒸馏在编码 Agent 时代面临的结构性挑战：随着闭源模型的能力提升越来越依赖于复杂的 RL 环境和精细的提示工程，而非可轻易复现的完整输出，蒸馏的难度显著增加，壁垒也在上升。这与传统的蒸馏认知形成鲜明对比——过去认为只要能访问闭源模型的 API 就能有效蒸馏，如今这一假设正在失效 。

这一趋势的战略含义在于：闭源实验室正在通过隐藏训练过程中的关键中间产物（RL 环境、prompt 策略）来重建护城河，而非单纯依靠模型权重。这意味着未来真正的竞争优势可能不在于模型本身，而在于**训练环境和数据飞轮**的完整性。对开源社区而言，这既是挑战也是机遇——填补蒸馏方法和训练基础设施的空白，可能比单纯追赶模型性能更具长期价值。

### 垂直整合与开放系统的张力

文章揭示了 AI 系统设计中一个核心矛盾：闭源模型能够实现从芯片到用户界面的全栈垂直整合，而开源模型必须适配多样化的推理环境、工具链和使用场景。这种结构性劣势在 Agent 时代被进一步放大——当模型的能力越来越依赖于与外部工具和环境的深度集成时，开放权重本身的战略价值相对下降 。

然而，这个分析也指向了一个反向可能性：如果 AI 系统的能力越来越分布在权重、工具和 Harness 三个层面，而权重只占其中一部分，那么"开放"的概念本身可能需要重新定义。真正有价值的开放可能不是权重开放，而是**工具和 Harness 层的开源**——这与 [Interconnects 对开放生态系统的观察](ch01/214-latest-open-artifacts-20-new-orgs-new-types-of-models.md) 高度一致。

### 生态构建 vs. 单点突破

文章的核心论点之一是开源模型社区需要从"单点突破"思维转向"生态系统构建"思维。历史上，安卓和 Chrome 的成功案例表明，开放系统能够通过**自我强化的网络效应**产生巨大价值——参与者越多，整个生态系统的创新速度越快，每个参与者的平均成本越低 。

AI 领域的类比是：真正有价值的开放生态系统应该围绕**特定任务的工具链**（代码执行环境、检索系统、专用推理引擎）构建，而非单纯追求模型权重的开放。当前的开源社区在这方面严重不足——大多数努力仍集中在追赶通用基准测试，而非构建差异化的工具和中间件基础设施。这与 [对开源模型差距的分析](ch01/206-0.md) 中指出的问题相呼应：开源社区需要重新定位其在 AI 价值链中的位置。

### 小模型专业化：被低估的赛道

文章最具前瞻性的观点之一是小型专用开源模型的价值尚未被充分认识。当前的社区共识是小模型应该"在通用基准测试上表现良好"，但这恰恰是错误的目标函数——真正的价值在于用极低成本完成高频率重复任务，实现 10 倍速和 100 倍成本降低 。

这一观点与 [Qwen 和 MiniMax 等模型系列的发展方向](https://github.com/QianJinGuo/wiki/blob/main/entities/latest-open-artifacts-19-qwen-glm-minimax-interconnects.md) 形成有趣的对照：即便是这些相对领先的开放模型家族，其产品策略仍以通用任务基准为主，而非特定领域的专业化。这一错位意味着市场存在显著的未满足需求——对于能够将小模型与精细化微调和专用工具链结合的团队而言，存在巨大的机会窗口。

## 实践启示

1. **重新设计蒸馏管线以适应 Agent 时代**：传统蒸馏方法（直接用闭源模型输出作为训练信号）在编码 Agent 场景下已接近失效。正确的方法是将 RL 环境、prompt 策略和工具调用模式纳入蒸馏的各个环节，而非仅仅复制最终输出。具体而言，应该投资建设可模拟闭源模型训练环境的合成数据管线，这比单纯增加模型参数更有可能产生突破 。

2. **采用双层模型策略部署 Agent 系统**：在生产环境中使用闭源前沿模型作为 orchestrator（编排器）处理复杂推理和长周期任务，同时部署小型开源模型处理高频率、低复杂度的子任务（如日志解析、格式转换、简单分类）。这种架构能显著降低推理成本，同时保持整体系统能力上限。关键是建立可靠的路由机制来判断何时切换模型 。

3. **专注填补开源生态系统的空白**：真正的机会不在于发布又一个通用模型，而在于构建开放生态系统中缺失的中间件层——专用推理引擎、工具集成框架、Harness 中间件。这些组件的护城河在于网络效应和用户习惯，而非参数规模。参考 [对蒸馏困境的深入分析](ch01/276-the-distillation-panic.md)，基础设施层的创新可能比模型层的追赶更具战略价值 。

4. **用成本-效益指标替代基准测试指标**：在评估小型开源模型时，应优先衡量"单位成本的 task 吞吐量"和"相对于大模型的性能衰减比"，而非绝对基准分数。正确的基准是**计算和时间节省**，这与企业实际采购决策的驱动因素高度一致 。

5. **建立 LoRA 适配器资产库**：对于需要处理多种业务场景的企业，最实际的策略是为通用基础模型（如 Qwen 系列）开发一系列场景专用 LoRA 适配器，而非从头训练专用模型。这种方法兼顾了模型质量和部署灵活性——每个适配器可以独立更新和版本控制，基础模型保持不变。这是将 AI 系统从"几个静态权重"转变为"可组合工具生态系统"的具体路径 。

---

