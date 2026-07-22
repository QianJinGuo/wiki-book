---
created: '2026-06-07'
feed_name: Interconnects
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: worth-reading
review_value: 7
sha256: 5c44020b573ab77f722d28c8d9bbe8532fa987614bda318a886f8663e733cbfa
source: rss
source_url: https://www.interconnects.ai/p/the-inevitable-need-for-an-open-model
tags:
- article
title: The inevitable need for an open model consortium
type: source
updated: '2026-06-07'
---

# The inevitable need for an open model consortium

Recently, I was talking with [Percy Liang](<https://cs.stanford.edu/~pliang/>), Stanford professor and lead of the [Marin](<https://marin.community/>) project (another fully-open model lab), and it set in on me that there will eventually be a consortium of companies funding a foundational set of open models used across industry. It’s not clear when this’ll emerge, and Nemotron ([Coalition](<https://nvidianews.nvidia.com/news/nvidia-launches-nemotron-coalition-of-leading-global-ai-labs-to-advance-open-frontier-models>)) is Nvidia’s attempt to bankroll and bootstrap this approach within a single wealthy company, but a consortium is the only long-term stable path to well-funded, near-frontier open models.

In recent months, we’ve seen a lot of turnover in [open](<https://www.reuters.com/world/asia-pacific/head-alibabas-qwen-ai-division-resigns-2026-03-04/>) [model](<https://www.geekwire.com/2026/allen-institute-for-ai-ceo-ali-farhadi-steps-down-as-nonprofit-navigates-shifting-ai-landscape/>) labs, with high-profile departures at Qwen and Ai2 ([my comment](<https://x.com/natolambert/status/2037911242820796883>)). This shouldn’t be super surprising to followers of the ecosystem — it’s happened before with Meta [shifting its focus away from Llama](<https://www.meta.com/superintelligence/?srsltid=AfmBOopu-zIovrbgd9Q-G1StOW3gC8s0mf_iNDqD_2oa3l6qldcNHLXl>), and it’ll only happen more as the cost of trying to keep pace at the frontier of AI only increases. The other leading labs with models available today include Chinese startups such as Moonshot AI, MiniMax, and Z.ai — all of which look precarious on their ability to fund continued growth in the cost of training or R&D. Releasing one’s strongest models openly today is in active tension with the option of spending focus and resources on AI products that can currently generate meaningful revenue (and profits).

[Share](<https://www.interconnects.ai/p/the-inevitable-need-for-an-open-model?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

We’re going to see business models emerge around releasing _some_ , or even many, models openly, but these will largely be smaller models that enable a long-tail of functionality, rather than models at the absolute frontier. This class of companies that’ll release many, strong fine-tunable models will include the likes of [Arcee AI](<https://www.interconnects.ai/p/arcee-ai-goes-all-in-on-open-models>), Thinking Machines, OpenAI, Google with Gemma, and more in that class. The cost and relative advantage of keeping the best models closed in a business environment with many opportunities for revenue are too high. To summarize — there will be an ever increasing number of companies releasing models that are good for creating a lively niche of smaller, custom models, but an ever decreasing number of companies willing to release fully open, near-frontier models. 

This is the core thesis of why I’m pushing hard for more people to do more research on how these smaller models can complement the best closed agents, the science of finetunability, etc. See my post below — it’s about creating a sustainable open model ecosystem, whether or not the frontier of open keeps paced with closed:

It’ll take years for this equilibrium to become more obvious, seen through the lens of more open model families coming and going. This year, it seems likely we’ll see Nvidia’s Nemotron reach new heights, Reflection AI challenge some of the Chinese models with a strong, large MoE, maybe Meta releases a new open-weight model, and so on. True pressure to change strategy will only come when the capital environment punishes the less efficient spend on resources (e.g. giving away your competitive advantage, in having an in-house model). This pressure will likely hit Chinese startups training these models first. 

All of Moonshot AI, MiniMax, and Zhipu AI will show signs of financial challenge in the coming years if they retain their strategy, on top of their models falling further behind the best open models in terms of generality. This is inevitable pressure to evolve open models to areas that are profitable and complementary of the frontier of AI.

Nvidia, which is best positioned to support the open ecosystem in the near term to support its core GPU business, could face many pressures to pull back its open model efforts. It could:

  * Realize it’s too competitive to their biggest customers as they succeed too much with Nemotron, 

  * Fall to competition on their core business and lose the free cash flow buffer needed to fund this (e.g. it’s 2031 and OpenAI, Anthropic, Google, and the other frontier labs are worth so much they build their own chips).1

  * Start succeeding beyond their initial goals and keep the chips for them to build ASI themselves, as a closed-weight model. 




The pressures for new funding mechanisms for open models are based on the assumptions of continued, substantive progress on the capabilities of frontier models. Mechanisms such as [self-improvement](<https://www.interconnects.ai/p/lossy-self-improvement>) and scaling all stages of the training pipeline are underway. This progress of capabilities will only increase the potential profit in selling models as and in products, not giving them away. The scale of investment required has already begun to push away non-profits from the game of making truly frontier-scale models.2 Capitalism is designed to make companies ruthless and chase down leads on profitability, not donate technology as charity.

As the economic environment shifts companies away from releasing the strongest models openly, more companies that rely on these models will look for an outlet of securing model access into the future. This is going to be compounded by a growing group of companies who come to rely on open-weight models for their workflows. 

These points loop back into how model training is getting more expensive, so where desire to have the models will go up, ability to procure them will go down for many players. There are x-factors that could multiply the demand for institutions to ensure the existence of open models, such as the best frontier models not even being available via API (such as if [Claude Mythos](<https://www.interconnects.ai/p/claude-mythos-and-misguided-open>) never goes general access).

[Subscribe now](<https://www.interconnects.ai/subscribe?>)

As training relevant models is shifting to cost billions of dollars, rather than millions, few companies well be able to afford it. many companies will bite at the cost of paying 1/10th of the cost to train a frontier model, or if the consortium works, 1/50th. The upside for companies will be some mechanism to steer development (e.g. model sizes) or getting early access to develop internal and open-source tooling for the model. 

It is in my nature to, by default, say this idea will fail, as training models is inherently a complex and high-focus endeavor, one that requires integration of every part of the stack and focusing specifically on your own vision and needs, rather than trying to serve every possible user. Eventually the need for open intelligence — and economic pressure to build it — will make a model consortium inevitable.

1

There’s a meaningful chance in my estimates that Anthropic, OpenAI, and Google are the most valuable companies in the world in the 2030s by owning frontier intelligence.

2

Truly open is a prospect for safety research and long-term innovation, which suits both the narratives of AI risk and AI optimism. We need it for both. Mech interp is one of the heaviest users of Olmo models. ~~If we don ’t find what’s after the transformer, there may not be enough benefit to AI models. ~~ (edit, I had published that as a half baked thought, it’s about how fully-open models operate in the ecosystem differently) All of these are largely orthogonal to the point of the post.
