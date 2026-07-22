---
source: rss
source_url: https://www.interconnects.ai/p/glm-52-is-the-step-change-for-open
ingested: 2026-07-05
feed_name: Interconnects
source_published: 2026-06-22
sha256: "4739672c460c60fa82485b9f6f8b45d2e20b1ac50e0576bb9bd191cf7e10a413"
---

# GLM-5.2 is the step change for open agents

##### Housekeeping: Following my “[State of the blog](<https://www.interconnects.ai/p/state-of-the-blog-mid-2026>)” post last week, noting a slight increase in paid features, it’s a good time to remind folks that I offer [group subscriptions](<https://www.interconnects.ai/about#§group-paid-subscriptions>) with larger discounts proportional to the number of seats.   
I also released a new paper today on open RL recipes for terminal agents, read more [here](<https://natolambert.substack.com/p/tmax-an-open-rl-recipe-for-terminal>).

A bit over a week ago, when the AI world was still reeling from the shocking [export restriction, and effective banning](<https://www.interconnects.ai/p/welcome-to-the-agi-era-of-ai-governance>), of [Claude Fable 5](<https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety>), Z.ai released their latest model, GLM-5.2. This model was [rolled out](<https://x.com/Zai_org/status/2065704919299235870>) unusually on a Saturday, June 13th, to GLM Coding Plan members. This is an unusual release practice, normally when an AI model is released on a weekend it’s for a weird reason (most famously, [Llama 4](<https://www.interconnects.ai/p/llama-4>)).1 In this case, it seemed like Z.ai was excited to capitalize on the zeitgeist of “Anthropic being anti open-science” with their silent safeguards on AI researchers. For the past year or two, the Chinese open-weight labs have taken every opportunity they have for easy marketing wins like this.

[Share](<https://www.interconnects.ai/p/glm-52-is-the-step-change-for-open?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

GLM-5.2, in a common naming convention across the industry, looked potentially like an incremental update following the popular GLM-5.1 model. At this point, Moonshot AI, makers of the Kimi models, and Z.ai, makers of the GLM models, have consolidated the top of the reputational market with the most beloved open-weight models among AI researchers. What unfolded is a common lesson in tracking AI models that often minor version numbers can have AI models crossing meaningful user experience thresholds. A small change in benchmarks and training can open a wide range of new use-cases.

What has followed is a slow, groundswell of hype for GLM-5.2. The official, MIT-licensed [model weights](<https://huggingface.co/zai-org/GLM-5.2>) and [release blog](<https://z.ai/blog/glm-5.2>) dropped three days after the initial rollout, on June 16th. One could ramble many technical details, such as the strong benchmark scores, the very popular RL framework that Z.ai uses ([SLIME](<https://github.com/THUDM/slime>)), the recommendation of always using the model on Max thinking effort, and so on, but the initial release blogs usually aren’t the thing to focus on. You can wait and read the ecosystem reaction to know if it’s the real deal. [Benchmarks are half dead these days](<https://www.interconnects.ai/p/opus-46-vs-codex-53>), anyways.

[](<https://substackcdn.com/image/fetch/$s_!xhhJ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7074458b-82aa-4658-95bb-9315549abb7f_4239x2799.png>)

What followed on the 16th was a slew of community benchmarks showing better-than-expected results for GLM-5.2. [Arena’s agent leaderboard](<https://x.com/arena/status/2066943450914943025>) had it as the only open model mixing it up with OpenAI and Anthropic’s latest models (notably matching Opus 4.8’s no-thinking effort to GLM-5.2’s max mode). This is one of many evals GLM-5.2 is crushing Gemini on, but that’s a topic for another time. A benchmark that has mixed perception in the community (particularly among actual designers), [Design Arena](<https://x.com/Designarena/status/2066940737011560652>) even had GLM-5.2 besting Claude Fable itself — the recently banned hype machine!

Pretty much everyone I respect among the AI commentariat and researcher class has praised the model after using it personally. Such a focal point of discussion among the community has only been so clear with an open model release once before — [DeepSeek R1](<https://www.interconnects.ai/p/deepseek-r1-recipe-for-o1>). This is not a comparison I make lightly, and when I compared [Kimi K2’s release to a “DeepSeek Moment,”](<https://www.interconnects.ai/p/kimi-k2-and-when-deepseek-moments>) GLM-5.2 has well exceeded that. What made Kimi K2 impressive was that big steps in open model performance could seemingly come from _anywhere_ in China. The step that GLM-5.2 has taken is more of a one way door for AI progress.

Anthropic’s record revenue growth rate on the back of Claude Code is heavily driven by being the best model, and the only model that can really do this. GLM-5.2 is the first of many (coming soon) open weight models to offer credible alternatives. The parallel is very clear, to when DeepSeek R1 showed that open-weight labs, with far fewer resources, could also replicate the chain-of-thought reasoning models that OpenAI championed with o1. As AI systems get more complex and far more expensive to build, with tools, integrated harnesses, and scaled model weights, it was not a given that this GLM-5.2 moment would happen at all.

The key point is that **GLM-5.2 is the open weight model that[feels right](<https://www.interconnects.ai/p/claude-code-hits-different?utm_source=publication-search>) in coding harnesses as a general agent**. **It ’s the first one.** I was personally overdue in trying some of the recent peer models, such as Kimi K2.7 or GLM-5.1, but the hype was too much for me to ignore. I put it to work helping make content for my [post-training course](<https://github.com/natolambert/rlhf-book/pull/457>) with Fireworks’ API in Claude Code ([setting this up](<https://docs.fireworks.ai/ecosystem/fireconnect/claude-code>) was _very_ easy). There were some minor knife cuts, such as the Claude Code harness / my repo documentation trying to send images to the model, which would brick Fireworks API for the session — forcing a manual context clear. Overall, the model capabilities immediately felt right, and I still have some tinkering to do in which harness and inference provider to use. 

For more hype, you can sample the Z.ai founder telling Elon that “[open-weight Fable capabilities will be here sooner than Q1 2027](<https://x.com/pmarca/status/2067640859957539104>),” the CEO of Vercel [saying](<https://x.com/rauchg/status/2068517095818809770>) “Genuinely impressed, almost shocked, at how good GLM-5.2 by @zai_org is at coding. This changes things,” and much [more](<https://x.com/ArtificialAnlys/status/2067135640249209175>) from a mix of people whose opinions I [deeply](<https://x.com/gneubig/status/2067936197888930263?s=20>) [respect](<https://x.com/_xjdr/status/2068422921249529916>) and others I’m [new to](<https://x.com/matvelloso/status/2067791546335019439?s=20>).

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

So, this is a good model, where does this leave us?

There are many trends at play. To start, let’s ground things in the open-closed capabilities gap. I’ve written how I expect an “[explosion in usage](<https://www.interconnects.ai/p/some-ideas-for-what-comes-next-may>)” if open models crossed the Opus 4.5 in Claude Code threshold from around the start of 2026. Here we are. With Claude Opus 4.5’s release on November 24th, 2025, the gap in time to GLM-5.2’s release on June 16th, 2026 is 204 days — or about 6.8 months. This puts us square in the 6-9 month time gap that many people claim as the performance lag between the U.S.’s closed labs and China’s open counterparts.

Upon writing this, I’m surprised. As the U.S. labs have so rapidly ramped compute in the last ~year, I’ve expected the gap in performance to grow in time. A very meaningful step in this trajectory will also be Claude Fable 5’s release — which was more reliant on scale, and therefore the most advanced GPUs, relative to the Claude Opus models. Still, that’s not a satisfactory answer. Continuing to unpack the trajectory here involves more nuance than I can afford to fit in a signposting article.

The most immediate meaning of this is far more serious pricing pressure within the organizations tokenmaxxing, sending Anthropic’s revenue to the moon. Some would predict Anthropic doesn’t realize its forecasted ARR numbers, but I don’t think that prices in the true demand for these models and the inevitable growth. This model existing is a huge boon for the open model _economy_. All the likes of Fireworks, Together, Thinky (via Tinker), Prime Intellect, and whoever else sells open model inference or finetuning just hit another inflection point. 

It’ll take a long time for the effects here to diffuse into the broader economy (and use-cases). Workflows are becoming more complex, with people using different models for planning, primary coding, and subagent dispatch. I expect the hype to continue to grow, and heck, as I’m writing this on a Sunday evening, I could see the media and market reaction on the Monday being a thing just like the DeepSeek R1 release. This diffusion happening while Anthropic’s, and by extension the U.S.’s flagship model, is still banned is a severe economic dagger. GLM-5.2 is being given time to carve out the economic underbelly of the frontier labs when they want to be pushing forward into higher margin, higher revenue domains enabled only by the absolute frontier models.

The economic concern mirrors a story that has been told many times in AI, so it’s unclear when it’ll stick.

The conversation that feels more core to the trajectory of AI is that of regulation and control of open models. I think it is an economic good for cheap intelligence to diffuse widely, and our default position should be to cheer for open models, but this model’s release date will have it be permanently associated with Claude Fable — and therefore Claude Mythos — in the mental map of AI power structures. We are at a point where Mythos-class model capabilities are deemed not safe for release by the U.S. Government and the Chinese model makers are charging forward in capabilities available to all. 

These trend lines aren’t necessarily causally linked, as we don’t know the cyber performance of GLM-5.2 versus its predecessors, but the capabilities are definitely correlated. Without anything changing, this points to a potentiality where the U.S. Government decides a certain open-weights Chinese model is not safe for the public. There are many other potential scenarios here too, but what is clear is that we have a lot of work to do in mapping them out, preparing our infrastructure, and messaging to society. 

It’ll take a lot more people than just me to imagine and communicate a world to decision makers for how to manage evermore capable open models.2 We have years more of AI progress to come, with Nvidia’s next generation chips already in production and a constant stream of algorithmic advancements. It feels like a narrow path for open model advocates to take, but we need to figure out how to make them viable so the massive leaps in performance don’t only go to closed models. 

I totally see why it is scary to imagine an openly accessible Mythos class model, but if open models get banned now and only closed models get 10 or 100X better in 2 years in the hands of one or two companies, I think we will have bigger problems on our hands.

1

Something that has always stood out to me is how fast the Chinese labs release their models. I’ve heard from multiple labs that the time to upload the weights publicly to HuggingFace after the model finishes training could be measured in hours rather than days. This has at least slowed a bit, now that they need to prepare to serve the model to a wider inference market. 

2

Something that will need to be discussed more is how even closed models, e.g. Mythos preview, are regularly in the hands of unauthorized users or jailbroken. So, the open vs. closed dichotomy on access isn’t totally black and white.
