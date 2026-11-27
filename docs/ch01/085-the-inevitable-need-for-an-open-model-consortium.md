# The inevitable need for an open model consortium

> 📊 Level ⭐⭐⭐ | 16.0KB

## 深度分析

### 1. 经济压力正在挤压开放前沿：谁还养得起开放模型？
开放模型实验室近期的人事动荡不是偶然，而是结构性的：Qwen 负责人离职、Ai2 CEO 卸任、Meta 把重心从 Llama 移走，共同背景是"追赶前沿的成本只增不减"。 训练有竞争力模型的成本正从百万美元级滑向十亿美元级；Moonshot AI、MiniMax、Z.ai 等中国创业公司被点名最脆弱——它们既要为持续上涨的训练与研发成本融资，模型在通用性上还落后于最优开放模型，而资本环境会最先惩罚"把自家竞争优势送出去"这种低效支出。 与此同时，"发一些（甚至很多）小模型"会成为可行的商业模式（Arcee AI、Thinking Machines、Google Gemma 这一类），但愿意完全开放近前沿模型的公司只减不增——开放生态将繁荣于长尾、萎缩于前沿。 生态的后续演化路径见 [Interconnects What Comes Next With Open Models](https://github.com/QianJinGuo/wiki-public/blob/main/entities/interconnects-what-comes-next-with-open-models.md) 与 How Open Model Ecosystems Compound。

### 2. 联盟式治理：Linux Foundation 类比与"开放 ≠ 开源"
作者与 Percy Liang（Marin 项目）讨论后的结论：长期稳定的、资金充足的近前沿开放模型只有一条路——由多家公司共同出资的联盟。Nvidia 的 Nemotron Coalition 是试图用一家富公司的钱"预演"这条路，但单点赞助在结构上不稳定。 联盟的经济账很有说服力：当训练成本达到十亿美元级，愿意付 1/10 成本的公司不少，若联盟运作良好甚至可压到 1/50；出资方的回报不是慈善，而是影响开发方向（例如模型尺寸的取舍），以及提前拿到模型去构建内部与开源工具链。 这正是 Linux 历史给出的治理答案：Linux 的成功不只靠开源许可，更靠 Linux Foundation 提供治理、标准与生态协调；当前开放模型生态碎片化（Meta Llama、Mistral、Qwen、DeepSeek 各自为政），缺乏统一标准、兼容性测试与长期维护承诺，联盟要补的正是这一层。 还有一个必须先解决的定义问题："开放权重"（open weights）不等于"开源"（open source）——许多"开放"模型限制商业使用、蒸馏和派生；联盟若不定义"开放"的统一标准，联合出资可能只是给受限制的权重买单。 这与 [Open Source Ai Ecosystem](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/open-source-ai-ecosystem.md) 中"许可条款与治理结构决定生态健康"的判断一致。

### 3. 单点赞助的脆弱性：Nemotron 的三种失败模式
文章对 Nvidia 这一"最有条件资助开放生态"的玩家给出了明确的风险清单：其一，Nemotron 若太成功，会与 Nvidia 最大的客户（前沿实验室）正面竞争；其二，若核心 GPU 业务陷入竞争，失去资助开放模型所需的自由现金流缓冲（设想 2031 年前沿实验室富到自研芯片）；其三，若成功超出预期，Nvidia 可能干脆把算力留给自己做闭源权重的 ASI。 换言之，"富有的单家公司资助开放模型"天然不稳定：资助意愿随其核心业务的竞争格局波动，开放模型只是核心业务的附属品。文章进一步指出，前沿能力持续进步（自改进、全流程 scaling）只会提高"卖模型、做产品"相对于"送出模型"的利润，投资规模已经把非营利组织挤出前沿级模型竞赛；资本主义机制驱使公司追逐利润而非捐献技术。 作者甚至估计 Anthropic、OpenAI、Google 可能因"拥有前沿智能"而在 2030 年代成为全球最有价值的公司——这只会加深开放前沿的资金缺口。

### 4. 需求侧信号与 x 因子：联盟为何"必然"
供给侧收缩的同时，需求侧在扩张：越来越多公司的工作流已建立在开放权重模型之上，当经济环境让最强的模型不再开放，这些公司会寻找"锁定未来模型访问权"的出口——联盟正是这种需求的制度化表达。 文章还列出可能成倍放大需求的 x 因子，例如最强前沿模型根本不提供 API（如 Claude Mythos 若永不开放通用访问）。 作者对自己的提议保持诚实的怀疑：训练模型本质上是高度聚焦、需要整合全栈的工程，试图服务所有用户的联盟确实容易失败；但他的结论是，对开放智能的需求加上经济压力，终将使模型联盟成为必然。 完全开放的模型还有正交的公共品价值：安全研究、长期创新与机制可解释性（Olmo 系列是最重度用户之一），这些收益无法被商业定价捕获，也解释了为何需要联盟这类非市场机制。 关于 Claude Mythos 引发的"开放 vs 闭源"阵营分歧，另见 [Nathan Lambert Claude Mythos Open Weights](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nathan-lambert-claude-mythos-open-weights.md)。

## 实践启示

### 1. 评估"开放"模型的实际许可条款
不要被"open"标签误导——仔细审查许可条款的商业使用限制、蒸馏限制和派生限制。

### 2. 关注开放模型联盟的治理进展
如果开放模型联盟成立，关注其标准定义和兼容性测试——这将影响模型选型。

### 3. 多模型策略减少单一供应商风险
无论开放还是闭源，多模型策略减少单一供应商风险——与 `Netflix Switchboard Lightbulb Model Routing` 的路由策略对齐。

## 相关实体
- [A 0 Click Exploit Chain For The Pixel 10 When A Door Closes A Window Opens](https://github.com/QianJinGuo/wiki-public/blob/main/entities/a-0-click-exploit-chain-for-the-pixel-10-when-a-door-closes-a-window-opens.md)
- [Fedora Hummingbird Container Security](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fedora-hummingbird-container-security.md)
- [Pixel 10 Zero Click Exploit Chain](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pixel-10-zero-click-exploit-chain.md)
- [Anthropic_Cache_Tokenomics](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic_cache_tokenomics.md)
- [Novee Security How To Get A 100 Conference Acceptance Rate The No](https://github.com/QianJinGuo/wiki-public/blob/main/entities/novee-security-how-to-get-a-100-conference-acceptance-rate-the-no.md)

→ [原文存档](https://www.interconnects.ai/p/the-inevitable-need-for-an-open-model)

## The inevitable need for an open model consortium

Recently, I was talking with Percy Liang, Stanford professor and lead of the Marin project (another fully-open model lab), and it set in on me that there will eventually be a consortium of companies funding a foundational set of open models used across industry. It’s not clear when this’ll emerge, and Nemotron (Coalition) is Nvidia’s attempt to bankroll and bootstrap this approach within a single wealthy company, but a consortium is the only long-term stable path to well-funded, near-frontier open models.

In recent months, we’ve seen a lot of turnover in open model labs, with high-profile departures at Qwen and Ai2 (my comment). This shouldn’t be super surprising to followers of the ecosystem — it’s happened before with Meta shifting its focus away from Llama, and it’ll only happen more as the cost of trying to keep pace at the frontier of AI only increases. The other leading labs with models available today include Chinese startups such as Moonshot AI, MiniMax, and Z.ai — all of which look precarious on their ability to fund continued growth in the cost of training or R&D. Releasing one’s strongest models openly today is in active tension with the option of spending focus and resources on AI products that can currently generate meaningful revenue (and profits).

Share

We’re going to see business models emerge around releasing _some_ , or even many, models openly, but these will largely be smaller models that enable a long-tail of functionality, rather than models at the absolute frontier. This class of companies that’ll release many, strong fine-tunable models will include the likes of Arcee AI, Thinking Machines, OpenAI, Google with Gemma, and more in that class. The cost and relative advantage of keeping the best models closed in a business environment with many opportunities for revenue are too high. To summarize — there will be an ever increasing number of companies releasing models that are good for creating a lively niche of smaller, custom models, but an ever decreasing number of companies willing to release fully open, near-frontier models.

This is the core thesis of why I’m pushing hard for more people to do more research on how these smaller models can complement the best closed agents, the science of finetunability, etc. See my post below — it’s about creating a sustainable open model ecosystem, whether or not the frontier of open keeps paced with closed:

It’ll take years for this equilibrium to become more obvious, seen through the lens of more open model families coming and going. This year, it seems likely we’ll see Nvidia’s Nemotron reach new heights, Reflection AI challenge some of the Chinese models with a strong, large MoE, maybe Meta releases a new open-weight model, and so on. True pressure to change strategy will only come when the capital environment punishes the less efficient spend on resources (e.g. giving away your competitive advantage, in having an in-house model). This pressure will likely hit Chinese startups training these models first.

All of Moonshot AI, MiniMax, and Zhipu AI will show signs of financial challenge in the coming years if they retain their strategy, on top of their models falling further behind the best open models in terms of generality. This is inevitable pressure to evolve open models to areas that are profitable and complementary of the frontier of AI.

Nvidia, which is best positioned to support the open ecosystem in the near term to support its core GPU business, could face many pressures to pull back its open model efforts. It could:

  * Realize it’s too competitive to their biggest customers as they succeed too much with Nemotron, 

  * Fall to competition on their core business and lose the free cash flow buffer needed to fund this (e.g. it’s 2031 and OpenAI, Anthropic, Google, and the other frontier labs are worth so much they build their own chips).1

  * Start succeeding beyond their initial goals and keep the chips for them to build ASI themselves, as a closed-weight model. 

The pressures for new funding mechanisms for open models are based on the assumptions of continued, substantive progress on the capabilities of frontier models. Mechanisms such as self-improvement and scaling all stages of the training pipeline are underway. This progress of capabilities will only increase the potential profit in selling models as and in products, not giving them away. The scale of investment required has already begun to push away non-profits from the game of making truly frontier-scale models.2 Capitalism is designed to make companies ruthless and chase down leads on profitability, not donate technology as charity.

As the economic environment shifts companies away from releasing the strongest models openly, more companies that rely on these models will look for an outlet of securing model access into the future. This is going to be compounded by a growing group of companies who come to rely on open-weight models for their workflows.

These points loop back into how model training is getting more expensive, so where desire to have the models will go up, ability to procure them will go down for many players. There are x-factors that could multiply the demand for institutions to ensure the existence of open models, such as the best frontier models not even being available via API (such as if Claude Mythos never goes general access).

Subscribe now

As training relevant models is shifting to cost billions of dollars, rather than millions, few companies well be able to afford it. many companies will bite at the cost of paying 1/10th of the cost to train a frontier model, or if the consortium works, 1/50th. The upside for companies will be some mechanism to steer development (e.g. model sizes) or getting early access to develop internal and open-source tooling for the model.

It is in my nature to, by default, say this idea will fail, as training models is inherently a complex and high-focus endeavor, one that requires integration of every part of the stack and focusing specifically on your own vision and needs, rather than trying to serve every possible user. Eventually the need for open intelligence — and economic pressure to build it — will make a model consortium inevitable.

1

There’s a meaningful chance in my estimates that Anthropic, OpenAI, and Google are the most valuable companies in the world in the 2030s by owning frontier intelligence.

2

Truly open is a prospect for safety research and long-term innovation, which suits both the narratives of AI risk and AI optimism. We need it for both. Mech interp is one of the heaviest users of Olmo models. ~~If we don ’t find what’s after the transformer, there may not be enough benefit to AI models. ~~ (edit, I had published that as a half baked thought, it’s about how fully-open models operate in the ecosystem differently) All of these are largely orthogonal to the point of the post.

---

