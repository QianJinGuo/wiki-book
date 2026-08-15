---
source: rss
source_url: https://www.interconnects.ai/p/glm-53-how-chinese-labs-keep-stride
ingested: 2026-08-15
feed_name: Interconnects
source_published: 2026-08-14
sha256: 8607abbbdfe73ee7d7ef8d720fdce6cdec03c61115b5d6e8c56f5dfb958d46a0
---

# GLM-5.3: How Chinese labs keep stride with the frontier

##### Housekeeping: I’m traveling so cannot make a voiceover for this post. EDIT — I added a bullet point 5 on the Chinese data industry after sending the email out.

Today, Z.ai [announced](<https://z.ai/blog/glm-5.3>) their GLM-5.3 model, currently only available in the coding plan, coming soon to their API and in two weeks’ time to Hugging Face (open weights). This model looks exceptional, with a somewhat astounding increase in scores. On many benchmarks the model has surpassed Moonshot AI’s Kimi K3 and on some it’s surpassed Claude Fable 5 or GPT-5.6-Sol.

[](<https://substackcdn.com/image/fetch/$s_!_6Y2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49ade27f-0d84-40f3-840a-3c919e0bb8af_4239x2504.webp>)

Here’s a more complete comparison:

[](<https://substackcdn.com/image/fetch/$s_!UnJZ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8cf91f6a-1a91-49b9-b220-f3324f2d90b4_1782x1558.png>)

This puts the model more or less at the frontier of agentic coding benchmarks, with only ~750B parameters – a third of Kimi K3! The Z.ai blog post is rather straightforward, and starts with a bold sentence:

> Scaling post-training is all we did for GLM-5.3.

GLM-5.3 is the same base model as GLM-5.2 with substantially extended post-training. To risk a broad oversimplification, Z.ai seems to have a strength in post-training when compared to Kimi, which is more of a pretraining masterpiece. Following this release there have been a lot of discussions wondering how China can keep up so well? How can such a small model be matching the leading public American models? Are these results real?

[Subscribe now](<https://www.interconnects.ai/subscribe?>)

The simplest explanation is that Z.ai is very good at what they do – it’s worth recalling that they’ve been working on this line of models longer than almost anyone in the industry. Here’s a brief history of the GLM models.

  * **Zhipu AI Founded** – 2019



  * **GLM** (General Language Model) — [March 2021](<https://arxiv.org/abs/2103.10360>) — released by **THUDM** , Tsinghua University’s Data Mining / Knowledge Engineering group. [Weights](<https://huggingface.co/zai-org/glm-10b>)

  * **GLM-130B** — [August 2022](<https://arxiv.org/abs/2210.02414>) — Scaled version. [Technical report for GLM-130B through GLM-4](<https://arxiv.org/abs/2406.12793>) — [Weights](<https://huggingface.co/THUDM/glm-130b>)

  * **ChatGLM** — [March 14, 2023](<https://university.chatglm.cn/blog>) — first chat version. [Weights](<https://huggingface.co/zai-org/chatglm-6b>)

  * **ChatGLM2** — [June 25, 2023](<https://university.chatglm.cn/blog>) — [Weights](<https://huggingface.co/zai-org/chatglm2-6b>)

  * **ChatGLM3** — [October 27, 2023](<https://arxiv.org/abs/2406.12793>) — [Weights](<https://huggingface.co/zai-org/chatglm3-6b>)

  * **GLM-4** — [January 16, 2024](<https://www.zhipuai.cn/zh/news/8>) — rebranded as just GLM; open-weight GLM-4-9B followed in June. [Weights](<https://huggingface.co/zai-org/glm-4-9b>)

  * **GLM-5** — [February 11, 2026](<https://www.zhipuai.cn/zh/research/154>) — latest major generation. [Weights](<https://huggingface.co/zai-org/GLM-5>)




[GLM 5.2, released on June 22 of this year, was a big deal](<https://www.interconnects.ai/p/glm-52-is-the-step-change-for-open>) – weeks after the release, I regularly heard from AI researchers I know who still used the model due to its speed (some deploy the model on internal clusters for faster speeds than public offerings) and simplicity (as a model with no rollbacks, etc., when working on frontier AI systems). GLM-5.2 altogether stood up to the hype.

I’ve been going through some of the same denial myself, thinking “how do they keep doing this? _Surely_ the models aren’t as good as they look.” There’s something a bit off-putting with how the American companies have such a commanding resource lead, but can’t seem to pull away in capabilities. The common answer is distillation, which I’ve [written](<https://www.interconnects.ai/p/the-distillation-panic>) [at length](<https://www.interconnects.ai/p/how-much-does-distillation-really>) about, but I deem not to be the major factor. On that note, there was a [recent paper](<https://arxiv.org/abs/2608.09867>) that showed simple methods for extracting the reasoning traces from frontier models – this is the sort of thing that Chinese labs could definitely use at scale. I’m confused why the labs in the U.S. haven’t patched this behavior faster; instead they’re running to the government asking for policy help. It doesn’t add up for me.

Z.ai’s blog is direct and matches with an RL-dominated training regime. They say they used “more environments, more diverse tasks, and more compute spent training on them.” One does not simply “distill” RL environments, infrastructure to run them at scale, or algorithms to mix them together effectively.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

So, how do the Chinese labs do it if not distillation? Are they benchmaxxing? An accepted definition of benchmaxxing is focusing the model on the test sets, such that the real-world performance meaningfully differs from the on-paper scores. The determining factors are much more big picture than technical (yes, the technical details definitely matter, but are harder to differentiate from lab to lab):

  1. **The time to release for Z.ai is likely days, not months as with OpenAI or Anthropic.** It is very, very likely that OpenAI and Anthropic have far better internal models than Z.ai and Moonshot AI. Still, these American companies [tend to take months to release their models to the public](<https://www.theguardian.com/technology/2026/aug/08/openai-astra-security-concerns>), which massively flatters the Chinese labs in adoption decisions at the frontier. To put it simply – the Chinese labs use all the time that American labs do pre-release testing to keep hillclimbing on benchmarks (SpaceXAI is likely far closer to the Chinese labs here). With the pace of progress being so fast, this is likely the largest determining factor of why Chinese labs stay at the frontier. This, so far, has been economically acceptable for the American labs, as they’ve still had massive demand for their models.

  
As model self-improvement loops ramp up within the labs building LLMs, if any of these feedback loops require user data, this faster release cycle could massively favor the Chinese labs, giving their offerings longer lifespans before the next vastly superior model comes out, undercutting demand for their models.

  
These are very clearly the race dynamics that many in the industry worry about. With so many labs building frontier models in the envelope of leading capabilities, it is hard to see this abating in the near future.

  2. **Yes, Z.ai probably cares slightly more about public benchmarks than OpenAI or Anthropic.** These benchmarks, e.g. scoring highly on the Artificial Analysis Intelligence Index, or similar aggregators, have a very direct impact on their stock price. They in many ways need to do this to keep raising capital and maintain team morale, as being the scrappy underdog matching American giants is a wonderful story.   
  
Subtle benchmaxxing does not need to come out of desperation or any similar pressures. It’s the industry standard across a remarkable number of labs. Many companies’ data acquisition strategy is to buy data on the benchmarks they’re behind on.

  3. **Z.ai is not benchmaxxing to the point where GLM-5.3 is fried** (at least not intentionally, and they’ll check for it). Every lab is dealing with the rough edges of scaling RL right now. Anthropic’s Opus 5 and Sonnet 5 models have very mixed reputations, despite the incredible benchmark scores. Everyone in the industry is in the same boat, so some model weights end up being easier to use than others, but the benchmark scores in their release blogs are the real deal.

  4. **GLM-5.3 is likely a narrower model than Claude Fable or GPT Sol.** When GPT-5.2 was released, it had mixed reviews outside of agentic coding. At the same time, OpenAI and Anthropic support very large businesses with countless use-cases for their models. This is a benefit of being a company earlier in their adoption curve – you can target the most valuable use-cases. Within post-training, caring about a bit less will make assembling the final model _far_ easier.  
  
I’m overstating this a bit, as Z.ai [reportedly reached $1B of ARR](<https://www.bloomberg.com/news/articles/2026-07-17/z-ai-set-to-be-first-china-ai-firm-with-1-billion-annual-sales>) on the back of a strong on-premises deployment business.

**  
**Similarly, the flagship GLM models have not had visual capabilities. Being text-only definitely helps Z.ai get more competitive scores, but it is a more competitive space. On the other side of things are models like[ Inkling-Small](<https://thinkingmachines.ai/news/inkling-small/>), which is designed to be omnimodal.

  5. (ADDED) **The RL data industry is taking off in China**. Many [sources](<https://seanzcai.substack.com/p/state-of-data-july-2026>) and rumor-mills we’re following have been mentioning how the data industry is taking off in China — very much driven by American data companies selling to Chinese model labs. This could look like Chinese labs buying many of the same RL environments that are used by American frontier labs, and releasing the downstream RL’d model sooner. We still have large error bars on the scale and impact of this market, but it is certainly becoming important.

  6. **Z.ai is an extremely skilled LLM organization – one that is likely far more compute efficient than OpenAI / Anthropic.** This needs repeating. These folks are very good at what they do. The company has very close ties to Tsinghua University, which is home to many of the best Chinese computer scientists. This abundant, eager talent pool is as central to their success as it is for any Western counterpart.




Altogether, it seems like a perfectly good strategy they’re executing with the GLM line of models. Congrats on the release! I’m excited for the weights to be out so I can do more extended testing (I tend to use American open-weight inference services like Fireworks or Baseten).

[Leave a comment](<https://www.interconnects.ai/p/glm-53-how-chinese-labs-keep-stride/comments>)

This is another step towards the inevitable proliferation of very strong cyber capabilities across the economy. Z.ai has acknowledged this, [saying](<https://x.com/Zai_org/status/2088280509474320693>):

> GLM-5.3 is our most capable model to date for cybersecurity tasks. It delivers substantial improvements in vulnerability discovery, exploit analysis, and complex multistep security tasks. These capabilities can help defenders identify weaknesses earlier, validate risks, and accelerate remediation.
> 
> They also create clear dual-use risks. We are therefore taking a staged approach to release. Selected security partners will first evaluate GLM-5.3 in controlled settings. Broader access and API availability will follow. Once the necessary safety evaluations and release preparations are complete, we will publish GLM-5.3’s complete model weights.

They go on to acknowledge how they’re monitoring inference on their platforms via a request classifier and chain of thought monitoring (on top of model alignment). The devil is in the details here, and it is unclear the level of execution every AI lab will have here. The capability diffusion is determined by the lowest common denominator.

At the end of the day, this type of safety barely matters when true open-weights are coming. If not GLM-5.3, then another model. The size of the models with these capabilities is reducing over time, becoming easier to modify and deploy (potentially without safeguards). Z.ai does some of the right things, including pushing for more vulnerability discovery and proactive management, but any single company is far from being able to handle this on their own.

We need industrial-scale guidance led by the government or industry coalitions to immediately prepare for this transition across all software.
