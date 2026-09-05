---
title: "Kimi K3: The Open-Weights Escalation"
source: rss
source_url: https://www.interconnects.ai/p/kimi-k3-the-open-weights-escalation
ingested: 2026-07-24
feed_name: Interconnects
source_published: 2026-07-20
sha256: 6fd06038bc80ef6957d489c39e98e8e3f86935801a656b794223e24878d08e8c
---

# Kimi K3: The open-weights escalation

On Thursday July 16th, Moonshot AI released their latest flagship model [Kimi K3](<https://www.kimi.com/blog/kimi-k3>). K3 is a 2.8T parameter MoE model which will have its weights released on July 27th. Much of this article follows as a reflection on the state of the ecosystem, under the assumption that Moonshot keeps their promise of the weights release date. This is a more extreme view of the equilibrium, and many of the results end up in a middle ground if the state of affairs is that China has similarly powerful, but closed models (i.e. K3 is never released). 

The key fact is that either the open-to-closed or American-to-Chinese model performance gap has been reduced from the debated 6-9 months to something shorter, say 3-5 months.

From the release materials, it is clear that K3 is a true frontier model. It will be the closest open models have been to the frontier since [DeepSeek R1](<https://www.interconnects.ai/p/deepseek-r1-recipe-for-o1>). DeepSeek R1 was a different story. This was a Chinese lab being extremely quick to pivot to reasoning models and release one faster than many American companies. Kimi K3 an example of a Chinese lab executing on scaling the known areas: data, algorithms, architecture, tools, environments, etc. 

Kimi K3 comes in at [#2 overall on the Vals AI index](<https://x.com/ValsAI/status/2077834614668988586>), [#3 overall on Artificial Analysis’s Intelligence Index](<https://x.com/ArtificialAnlys/status/2077832874183860404>) (only beaten by Claude Fable and GPT-5.6 Sol Max while being [cheaper](<https://x.com/ArtificialAnlys/status/2077832885021835289?s=20>)), [#1 overall in Frontend Code Arena](<https://x.com/arena/status/2077824029126504525>), and [more impressive results](<https://x.com/cramforce/status/2078574147333152957?s=46>). Moonshot AI is going toe to toe with Anthropic and OpenAI with far, far fewer resources.

It is clearly the strongest open model ever released. It should be clear looking at this model that if adversarial distillation from the closed frontier models in the U.S. contributed, it is at most to a relatively small degree. AI observers who followed the [distillation panic](<https://www.interconnects.ai/p/the-distillation-panic>) and came away with the wrong conclusion that Chinese AI labs are only producing good models due to IP theft are in for an awakening – that Chinese companies are extremely good at building models in the same way the leading American companies are. Moonshot AI is solving many of the same problems that folks at OpenAI or Anthropic are solving. I’m confident there will be more distillation discussion, and [pressure](<https://www.interconnects.ai/p/the-distillation-panic>), but the evidence is now out that Chinese companies can do [more than just fast following](<https://www.interconnects.ai/p/how-much-does-distillation-really>).

Meeting some of the core Kimi team on [my trip to China](<https://www.interconnects.ai/p/notes-from-inside-chinas-ai-labs>), it was clear to me that they had incredible culture, some would say aura, and a freedom to express it – within the constraints of a GPU-limited environment. Where building models is so much of a scaling game, much of the ability to build a good model still comes down individual execution, motivation, and expression. Having visited them, this result is less surprising. Having visited many AI companies, very few have a culture that you can immediately pick up like this.

At the same time, China’s AI adoption trends started later than those in the U.S. So, while all the Chinese labs have way less compute than their counterparts in the U.S., more of it can certainly go to training. When I joked around about how much compute an average researcher at OpenAI could have – say a few thousand H100 equivalent machines – the researchers at Kimi were shocked. The org chart and approach to building the Kimi models surely reflect this, but it is difficult to tease out what this looks like without substantial proprietary information.

The state of affairs on peak model performance is roughly as [follows](<https://x.com/finbarrtimbers/status/2077816750574539161>):

  1. Anthropic – Claude Fable 5

  2. OpenAI – GPT 5.6 Sol

  3. Moonshot AI – Kimi K3 (open weights*)

  4. SpaceXAI – Grok 4.5

  5. Zhipu (Z.ai) – GLM 5.2 (open weights)

  6. Meta – Muse Spark 1.1

  7. DeepMind – Gemini Flash 3.5

  8. Alibaba – Qwen 3.7 Max (3.8 announced, also to be open-weights, when writing)




It is astonishing to see DeepMind, and some of the other American giants this low. In many ways, the X AI team deserves more credit. A visual summary from Artificial Analysis is below:

[](<https://substackcdn.com/image/fetch/$s_!NQJl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd8ac8b4-470f-453a-bf13-56bd05bd27ef_4096x1723.jpeg>)

This release and other recent events have caused a major change in direction for the most likely outcomes in the balance between open and closed models. I’ll unpack them individually.

In many ways, it feels like the start of a new era. An era with much more competition, but also a much higher need for coordination, as we rollout incredibly powerful technologies around the world.

[Share](<https://www.interconnects.ai/p/kimi-k3-the-open-weights-escalation?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## 1\. China’s recommits to open-source AI – showing a different read on near-term risks

Many people started following China’s AI scene relatively recently, so they can reach the conclusion that releasing models openly is their core strategy. In fact, I think most labs have a core strategy far closer to Anthropic or OpenAI – build the best intelligence possible. Having followed and engaged with the Chinese labs for years now, the best explanation for their original turn to releasing their models openly is practicality. They needed to release the models openly to get adoption, attention, and feedback (especially in the high-value, Bay Area market).

For a long time, there had been [very limited policy in China](<https://www.chinatalk.media/p/chinas-new-ai-plan>) explaining the role of open-source AI, and what could be the “country-level strategy.” To my knowledge, no senior leaders had commented on open-source AI publicly. This changed this week too, as Xi Jinping gave a keynote address at the World AI Conference (WAIC), and very directly [committed the future of China’s AI ecosystem to open-source and global diffusion](<https://mattsheehan.substack.com/p/xi-jinpings-big-ai-speech-annotated>). This commitment to the status quo, the same week as the announcement of the strongest open-weight model to date, is a clear mark in the early history of modern AI.

This comes during a time period where many potential paths forward have been discussed for the Chinese AI industry – Will they stay open? Can they keep up with the American labs in scaling? Is there a growing revenue market in China? With these, the focus has been on China’s risk tolerance, the companies’ ability to monetize, and any closely related reason for a company to stop releasing their _best_ models openly.

In tying Xi’s commitment in time to a very strong model, China has implicitly commented on its risk tolerance with respect to releasing open-weight models. For the time being, it is a read into the perceived risks of topics like strong cybersecurity capabilities (or bio-dangers) within the Chinese system.

The simplest explanation is that China’s government is definitely following potential risks from the models closely – likely with more technical scope than the US government’s vibe regulation – and would take action if it measured risk. The simple explanation is that they do not find current frontier models to have meaningful risk.

At the same time, China’s economic decision makers think having AI adoption is good, so they can make profits on the industry later – after growing distribution (as China has done for cars, solar, advanced manufacturing, and many areas in recent history).

These can seem somewhat shocking, in an American AI media landscape that has gone through months of hype and fearmongering over the Claude Mythos model. This surprise should be excellent grounding – the world does not have a unanimous agreement with the narratives about AI that we hear most in the U.S.

## 2\. Open models as the economic Achilles heel of frontier labs

Many of the narrators guiding the discussion on AI have clear incentives to depress the perceived capabilities of the best, open AI models. Dean Ball – who is personally supportive of open models, but now works at OpenAI – had a widely commented on [post](<https://x.com/deanwball/status/2078133895766114412>) with some reflections on Kimi, where he said the following on open models. It is important to understand the statement, as it focuses the role of open models in the economic side of the AI buildout. Dean says:1

>   3. Open-weight models are inherently decelerationist, and I’m continually surprised to see the so-called “accelerationists” so excited about open-weight models.
> 
> 


Explaining why open-weight models are _a form of decelerationism_ is important to understanding the coming world order. He is right.

Open models are decelerationist economically for the frontier labs, which will slow the net investment and capex rollout for AI. This is due to the fact that strong open-weight AI models massively reduce the margin potential for the closed labs. This has two effects. First, the AI labs have fewer profits to re-invest into future models. Second, the market sees the terminal value of these companies as being lower, so they will kneecap future fundraising rounds. These together will slow timelines to the most transformative AI models, but I do not see them as strong enough effects to stop OpenAI and Anthropic from being a few of the top valued companies in the world.

These, to me, are a net good for society. As open-weight models are [accelerationist](<https://x.com/natolambert/status/2078164535262040448>) for _AI diffusion across the economy_ by having the entry price for intelligence at a certain level of performance be lower. Open models also encourage customization. The thing is that this type of diffusion is by its nature far slower than the frontier AI labs products, who sell tools used directly by developers. The potential for open models is for nearly every business to use them to craft domain-specific agents. This economic diffusion takes an extremely long time! I’ve described this as [open-weight models being on a much slower starting, but potentially bigger exponential](<https://www.interconnects.ai/p/open-and-closed-models-are-on-different>). The problem is, if closed models get too far ahead in raw capabilities, this ability to customize can be moot.

The combination of increased diffusion and decreased concentration of power in the AI labs I see to be very positive for the AI transition. It gives us more time to figure out the hard problems of new capabilities and lets more stakeholders impact the story – any one company is very likely to have issues with controlling the world’s most important technology safely. 

It is, of course, important to me in this world for the best models to still be made by the U.S. companies, which will allow the US to control the trajectory of the technology and its values. I also expect this to be the case, as the U.S. has larger capital markets that are willing to invest in AI (and a growing share of profits), but it is not a given.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

## 3\. China’s efficiency advantage

Kimi’s launch blog has some technical details that confirm the sort of improvements that are supplying the consistent model improvements we feel. To select one:

> Kimi K3 is built on Kimi Delta Attention (KDA) and Attention Residuals (AttnRes), two architectural updates designed to improve how information flows across sequence length and model depth. We have also scaled up Mixture of Experts (MoE) sparsity, effectively activating 16 out of 896 experts when paired with a Stable LatentMoE framework. **Together with refined training and data recipes, these structural changes yield an approximate 2.5 × improvement in overall scaling efficiency compared to Kimi K2**, allowing the model to convert compute into intelligence more effectively.

Training efficiency really adds up. They will result in continued, incredible steps for the models.

As an aside, tracing the path of this particular innovation through the ecosystem is an interesting example. Kimi Delta Attention (KDA) was introduced in the Kimi Linear [paper](<https://arxiv.org/abs/2510.26692>), which is similar to the Gated DeltaNet used for [Olmo Hybrid](<https://arxiv.org/abs/2604.03444>) (my last Olmo model while at Ai2). Qwen’s latest models switched to a related architecture and the recent Nemotron models also are hybrid (but still closer to Mamba than Gated DeltaNet). It’s awesome to see new architecture ideas like these, which were heavily progressed by academia, get so quickly translated into frontier-scale models. [Gated Delta Networks](<https://arxiv.org/abs/2412.06464>) were introduced in late 2024, building on ideas from Mamba. By mid 2026, they’re in frontier models.

I chose to focus on this example, partially because the Kimi team put a cool number to innovations between models, but primarily to give space to a broader discussion of China’s resource efficiency.

It is becoming clear that the Chinese labs are far more capital efficient. In a world where scaling laws dictate that intelligence is proportional to effective capital – which buys compute, data, & talent – that may be the greatest strength your AI industry could ever have. There are many possible explanations for why this is the case, such as Chinese researchers being paid less while being more effective at LLM research puzzles, but we will probably never get such specific reasons.

Since writing my [notes](<https://www.interconnects.ai/p/notes-from-inside-chinas-ai-labs>) on China, I’m hearing more about an emerging data industry in China (far behind the billion dollar budgets of Anthropic for data) and that Chinese labs have access to meaningful training compute (by skirting export controls). Chinese companies _do not_ have the same inference demand (until recently, as Moonshot AI had to [pause new subscriptions](<https://x.com/Kimi_Moonshot/status/2078855608565207130>) for access to their K3 model - while the API is still live), so much more of their compute could go to training. These areas impinge heavily on the truth of the ability of the labs, but we have very limited measurement into them.

The facts on the ground are that these Chinese labs have raised orders of magnitude less capital than any slice of the American AI ecosystem. The most direct comparisons are to OpenAI and Anthropic, who have slightly better public models. Others, such as Google and Meta have the largest cash flows in the history of business, and are behind on building models. As for American neolabs, the picture is even more competitive – Thinking Machines released their first model recently, [Inkling](<https://thinkingmachines.ai/news/introducing-inkling/>), which is strong but not in the same class as Kimi K3.

These American companies with more resources could still catch up, but you need to strongly weigh the public measurements we have of model quality and not resort to hope – which often reflects a bias. If the Chinese labs do have a latent advantage, they could continue to utilize that to build even stronger models than _all_ the competitors! Many outcomes are plausible and K3 should increase most people’s probability that China can outright lead in AI capabilities in the near future on the back of more efficient training efforts – even if it’s not your most likely predicted outcome. 

A big contributor to the capital efficiency is likely in the approach, where American labs are spending meaningful energy in pushing the frontier in dramatic, big steps, and the Chinese labs are more focused on catching up — this catch-up is cheaper. Just as the student model can outperform the teacher in distillation generally (not limited to the _adversarial_ distillation of the Chinese labs), an approach of “trying to catch up” rather than “invent the next paradigm” could lead to stronger models.

## 4\. A growing ecosystem of frontier, open models

The weekend after the Kimi K3 release, while writing this and discussing the events broadly, Alibaba [announced](<https://x.com/Alibaba_Qwen/status/2078759124914098291>) that a 2.4 trillion parameter Qwen 3.8 model is coming soon with open-weights. Historically, Alibaba has kept their largest models as API-only offerings via their cloud business, so this is another big vibe shift opening the doors to the next chapter of the open model economy. Even if the model is behind Kimi K3 on benchmarks, it signifies that Chinese companies may not only be maintaining the status quo for their open model strategy, but leaning further into it.

If this Qwen 3.8 model releases soon, i.e. before the next Gemini model, it could push Google to the 8th position on the leaderboard of labs with the smartest models – a list that China has been climbing. There are other rumors of more strong Chinese models soon, with DeepSeek V4 expected to graduate out of it’s “preview” version.

[Leave a comment](<https://www.interconnects.ai/p/kimi-k3-the-open-weights-escalation/comments>)

## 5\. The very beginning of a long story of frontier open-weight policy

I think that if Claude Mythos was released as an open-weight model today, the negative outcomes would be relatively minor. This is a somewhat challenging opinion to hold, as we have very limited public cybersecurity evaluations and it is a complicated ecosystem (and because I trust many people at Anthropic). I still stand by it. The risks have been over-hyped.

The problem is that this will not always be the case for the strongest AI models. Far stronger models are coming — and with them increased risks — so it is an incredibly safe equilibrium for the best models to be accessed in a controlled, closed manner several months ahead of similar open-weight models. 

Open-weight models which are very controllable by the user will always be coming — you cannot effectively ban digital products, especially from bad actors — as AI training has proven globally accessible longer than many analysts expected.

Still, as I write this, the government [continues to flirt with more measures aimed at restricting open-weight models](<https://www.interconnects.ai/p/6-months-to-live-for-open-models>) in the U.S. The latest is from [Axios](<https://www.axios.com/2026/07/20/ai-us-china-open-source-kimi>):

> Behind the scenes: The Commerce Department last year considered adding multiple Chinese AI labs to its “Entity List,” which would effectively cut off U.S. access without a license, a source close to the administration told Axios.
> 
>   * The National Security Agency and White House Office of the National Cyber Director also considered putting out an advisory on Chinese AI lab threats last year, practically discouraging U.S. companies from using their tech, the source said.
> 
>   * The White House considered implementing an executive order saying U.S. companies could only host Chinese models if they could guarantee security and take liability if it were breached, the source added.
> 
>   * Commerce last summer also circulated draft rules within the administration leveraging its authorities to secure domestic supply chains to target Chinese open-source models, another source close to the administration said.
> 
> 


This would leave the U.S. in a very asymmetric state where the best models in the U.S. have guardrails on cybersecurity tasks, but global actors have access to great Chinese open-weight models to probe our defenses. This is one of many examples where banning open-weight models is not only harms the free markets of AI but also makes the ecosystem less safe in the short-term. There are other very bad outcomes, such as slowing the diffusion of AI applications and AI research, as I discussed above. 

These equilibriums are very hard to maintain, especially as AI tools accelerate progress in the models, but it is important to maintain this status quo between open and closed. Having a model that is truly alone at the frontier in capabilities — something like Mythos when it was announced — also be open-weight poses serious risks as we go into the unknown of capabilities. Models are going to progress very fast and it is increasingly hard to measure their total capabilities. 

We are then stuck in a world where we are trying to thread the needle on open models. It’s reasonable to not want something so powerful to be diffused globally in an instant, but meanwhile the makers of the models are incentivized to hype their capabilities, and their competitors are incentivized to hype their risks. It all comes down to careful measurement and proactive hardening of society to risk vectors.

This careening train of policy debates, model releases, and raucous reactions is only going to continue from today. We’ve been on a train of rapid progress, where all the key ideas of how AI should play out are tested, since the release of Claude Opus 4.5 last December, which sent us down the agentic pathway. The key to making good decisions here is evaluation capabilities, independent of the companies with the largest financial stakes. One of many actions needed then, as we enter the [AGI era of AI governance](<https://www.interconnects.ai/p/welcome-to-the-agi-era-of-ai-governance>), is an Operation Warp Speed style approach of bootstrapping state capacity (and other independent actors) that can evaluate models accurately, and study emerging risks.

## Conclusion: The wake-up call

Open-weight models, by accelerating the diffusion of capabilities, are a massive escalation in the good and the potential bad of AI. For now, the bad side of frontier language models has been largely hypothetical, but that will not always remain the case. 

Having open weight models be slightly behind the closed frontier is our natural buffer to mitigate the risks. The key point is that we must collectively act to mitigate potential harms as they appear, and whether open-weight models are 3 or 6 or 9 months behind, that is still a very short timeline. If we regulate open-weight models heavy-handedly, I suspect much of the world will be lulled into thinking we no longer need to act. All we would’ve done is slightly delayed the inevitable — open models will continue to cross all the key capability thresholds eventually and regardless of legality.

Understanding and benefiting from this open-closed dance must be a collective action from the AI community across all sectors of power and influence over the coming years.

Kimi K3 is a watershed moment because frontier open-weight models are now real. Many hypotheses will be tested on where risks of open-weight models truly land — I suspect it’ll be narrower than many expect, and many risks of AI will still be proliferated by closed and “safer” APIs. The evaluation of these risks will evolve in time with an acceleration of AI’s integration in our economy. We cannot get one without the other, and we will continue to get both.

With this, 2025 was when open models started to be taken more seriously — especially when [China leaped ahead with such a clear lead](<https://atomproject.ai/>) — as people realized that it would not be a unipolar world, with only American, closed AI labs determining the trajectory. 2026 is when those previously discussed, potential risks and accelerations due to truly frontier, open-weight models landed. 

1

A large portion of the response was for the fourth bullet, which compared the inevitable outcome of open models to AI communism, which I think missed the mark. Specifically, the use of the word communism without explanation caused much of the blowback.
