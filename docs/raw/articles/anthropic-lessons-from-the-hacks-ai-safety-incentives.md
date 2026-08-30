---
source: rss
source_url: https://www.interconnects.ai/p/lessons-from-the-hacks
ingested: 2026-08-30
feed_name: Interconnects
source_published: 2026-08-09
sha256: 792af1ccae93df54
---

# Lessons from the hacks

The recent run of cyberattacks by in-development frontier models has got me thinking a lot about how our current incentive systems are not well suited for such fast technological transitions. The two primary power structures here are the rapidly growing technology companies and the federal government. The companies are incentivized to grow, so they can keep growing and keep scaling – in what is an extremely competitive market. This scaling is pushing us towards new, inevitable AI transitions (which are accompanied by new risks). On the other side is our current government, a product of the last few centuries of global history – one that deserves its reputation as being slow-moving. This is a government that I expect to only act in substance once real, measurable harms from new AI models happen, and to overreact.

How do we balance these powers? At the core of it is a need for more transparency on both sides. The frontier labs are building such complex systems so fast that they cannot keep up with them – a good time for more eyes to study the problem. On the other side, the government said it [does not plan to release details](<https://fortune.com/2026/08/04/baffling-white-house-wont-publicly-release-ai-model-evaluation-framework-it-reviewed-today-with-openai-anthropic-microsoft-and-others/?email=467cb6399cb7df64551775e431052b43a775c749&emaila=12a6d4d069cd56cfddaa391c24eb7042&emailb=054528e7403871c79f668e49dd3c44b1ec00c7f611bf9388f76bb2324d6ca5f3&utm_source=Sailthru&utm_medium=email&utm_campaign=Tech%20newsletter%208.7>) on its frontier model evaluation framework. We are heading to challenges so significant that none of these entities are on track to handle this on their own. Frontier labs could better control risk by meaningfully slowing down, which I don’t expect them to do. The government could handle this better by massively improving state capacity around AI and helping the broader industrial base prepare for AI-native risks, which I don’t expect them to do either. There are more cases like this.

These are the two most influential power structures determining what will happen, but many more have influence. All together, I think the AI industry is wildly, collectively unprepared for handling the next 12-24 months well.

This article is a grab bag of takeaways I have from the OpenAI-HuggingFace hack, as we’ve learned more details, and most of the ideas are reinforced by the fact that more instances of hacking have been disclosed publicly since then. It is likely that more incidents have happened and either not been found or not reported. 

For general background on the OpenAI incident I strongly recommend watching OpenAI’s [talk](<https://www.youtube.com/watch?v=87DyyMV0kCY&pp=ygUUYmxhY2sgaGF0IGxsbSBvcGVuYWk%3D>) at Black Hat on the rough facts and timeline of the recent cyber incident. Otherwise, Simon Willison published a TLDR of the timeline [here](<https://simonwillison.net/2026/Aug/7/openai-timeline/>) and I liked Thomas Wolf’s [discussion](<https://thomwolf.substack.com/p/on-the-aisi-july-28th-incident?r=14g89&utm_campaign=post-expanded-share&utm_medium=web>) of recent events.

[Share](<https://www.interconnects.ai/p/lessons-from-the-hacks?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

* * *

### 1\. Very persistent models seem more likely to hack

For a long time, one of the advantages that GPT models have over Claude is that they will pursue goals _so_ tirelessly. They will exhaust what feels like every path before giving up. This has been the case roughly since o3 (funnily enough, this was a model where people [freaked out about reward hacking in RLVR](<https://www.interconnects.ai/p/openais-o3-over-optimization-is-back>)) and has made OpenAI’s models far better for research historically, and is a reason GPT-5.6 is so useful as an agent for implementing specific tasks. On the other hand, Claude feels much less dangerous simply because it is at times a bit lazy.

Within this, OpenAI seems much more committed to inference-time scaling, and this may be correlated with surprising behaviors in the future. OpenAI’s reasoning persistence and efficiency – see their Pareto improvements over time and caveman speech from an internal CoT of the model that did the hack, like “ _However task impossible, peers doing it._ “ or “ _Help peer, but our task doesn ’t benefit yet._“ – makes me think they’re more inference time scaling pilled. This is largely a hunch, but I use it to force myself to consider what the limits of model development paths are. Models that are persistent seem much more likely to keep benefiting from more inference-time tokens. Models that are less so, seem like there will be more waste in inference. The model that can use the most inference-compute will be able to push the limits of the hardest problems.  
  
Here’s an example OpenAI included in the GPT 5.6 launch [blog post](<https://openai.com/index/previewing-gpt-5-6-sol/>):

[](<https://substackcdn.com/image/fetch/$s_!pqWP!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4cd6508-3884-4cd0-947d-6aecdf0474f7_1404x1002.webp>)

One of their star researchers, Noam Brown, has also been [posting](<https://x.com/polynoamial/status/2064210146558136827>) about inference-time compute a lot. His TLDR is:

> As LLMs become more capable, benchmark performance is increasingly a function of test-time compute. In fact, we likely don’t know what the capability ceiling is for modern LLMs because it’s too expensive to measure. 

For one, reasoning efficiency is clearly a top-tier, foundational research problem for modern agentic models – as important as scaling RL — but not often discussed. The open research here is very lacking.

### 2\. Models that assume user intent seem more likely to hack

I mentioned the thoroughness axis, where OpenAI seems to be going down a more intuitively unsafe development path with their models. On the other side is how much the models assume user intent, versus trying to infer the intended action. A model that will do what it thinks you wanted rather than what you said seems inherently more unsafe. I think of this with respect to instruction following precision, where in the future it seems like the models should only do exactly what we tell them, but this opens a lot of debates akin to the paperclip problem, where if we tell an AI to do a largely unsolvable problem, what will it do?

This axis seems less cut and dried than the persistence axis, but I included it because I think of Claude’s “user world model” as one of its strengths for general knowledge work like editing, slide creation, etc. Sometimes Claude does do totally random stuff because my prompt was underspecified, instead of asking me for clarification, and as the models get more powerful this “just acting” could cause problems.

### 3\. The precise nature of the models and the instructions given to them are of the utmost importance to understand early AI misalignment incidents

The public needs exact access to the prompts and characteristics of the internal models executing these hacks. We need to know if the models were told “do not hack” or if there was relevant model training to prevent this. We need to know if these models were fairly close to the existing public models or in a very different family. Given the nature of some of the evaluations the labs are doing, there’s a chance the models were explicitly encouraged to try and hack! Without openness here, the industry is set out to fail and will fall into mass speculation, which quickly becomes misinformation.

### 4\. Frontier labs do not seem like they’re watching the models closely enough, due to a general frenetic competitive environment & current SF culture

From OpenAI’s own retrospective, the misaligned model behavior was unfolding over months, and in some cases OpenAI did not know about the hacks for ~weeks. The time to response is too long and I do not think this is an OpenAI only characteristic – rather it is that the frontier labs continually seem underwater in the amount of work they feel like they should do. I am not optimistic in the long-term that the labs change a sufficient amount here to meaningfully mitigate this type of oversight risk in the future. Yes, it is very likely that OpenAI is putting a ton into understanding this – and [delayed their latest models](<https://www.axios.com/2026/08/07/openai-astra-model-delay-cybersecurity-risks>) to make sure they get it right – but the financial pressure to grow revenue or risk the companies’ long-term balance sheets makes me think it will not be a sustained pattern of caution.

**This is one of my biggest mental updates from recent events — and makes me even more convinced of the need for more near-frontier open intelligence, despite the somewhat more known risk profile for open models (one-way door, etc.). ** had a nice [blog post](<https://florianbrand.com/posts/open-model-safety>) on his personal site related to this, and why closed models to date arguably have been the cause of more downstream harms.

### 5\. Open models are the best tool we have today to advance the public understanding of frontier AI risks

As we saw with HuggingFace defending themselves with an open model against the OpenAI hack due to cyber usage restrictions on closed models, we have an urgent need to do more complex language modeling research which involves large-scale RL training, extensive evaluation, infrastructure work, and alignment testing. This can only happen on open models. We should consider ourselves lucky that open models are only 3-9 months behind, as we can conceivably make some informed insights into the frontier.

If we effectively ban open models and open science, either through a regulatory stifling with vague threats or explicit usage restrictions of cutting-edge technology, we will increasingly become ill-prepared for the issues that come after this round of hackings. We need to collectively increase the general public’s understanding of how frontier models work, so we can activate more neutral parties in hardening our infrastructure and society.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

### 6\. These dangerous capabilities will eventually come to open models and “banning” Chinese open models will not delay the relevant harms

The public response should know that it’s when not if these capabilities are widely diffused and we are massively behind on preparations. To reiterate what I said in my [Kimi K3 piece](<https://www.interconnects.ai/i/207699639/1-chinas-recommits-to-open-source-ai-showing-a-different-read-on-near-term-risks>): China is definitely watching this space too and won’t encourage open-weight models if they will proliferate risks. If we think the way to stop widespread access to these strong cyber capabilities is to ban open models in this ballpark, we will delay the inevitable. Eventually someone will build a model of this level of intelligence and not comply with the ban, giving access to bad actors around the world while undercutting the motivation to prepare defensive measures. 

### 7\. The models from these recent hacks do generally seem aligned

Something I immediately noticed watching the Black Hat video is how I can see how the agents were trying to be helpful to each other through their internal messaging board — creating shared resources like you would for human teammates — in a way that is obviously malicious for society. The agents created hidden forums for each-other as a sort of cross-rollout memory. In this case, they were doing it to try and break out of their environment. The apparent helpfulness doesn’t make it ok, but can be a clue as to what happened. 

### 8\. In 3-6+ months attackers will have the ability to train intentionally misaligned models

The other side of the helpfulness example above is that it is clear someone could make this happen much more easily if they wanted to by explicitly training a misaligned model. To reiterate, this would be making a system that is easier to use for finding exploits at inference, but I think it’ll be harder to train said model. I think this’ll take longer than most commentators expect, as nearly all the strong public models and data industry existing to date encourage alignment (and it seems very hard for bad actors to get enough compute to train these models end-to-end, as all leading companies are in a compute shortage as well). We should take a moment to appreciate that the alignment techniques we are employing on current models have a meaningful influence and are not merely surface thin as some have worried. Downstream models have a propensity for mirroring their teacher’s character.

### 9\. Our AI systems have scaled well beyond human oversight

The downside of the mass-rush to scale RL on agentic tasks is that state-of-the-art evals and monitoring are at a scale where only agents can monitor them, so we are relying on the existing successes of alignment to continue scaling safely. OpenAI says they have examined billions of trajectories — which are likely mostly composed of rollouts during RL, which are trials on intermediate versions of the model — and spent millions of GPU hours to do so. I think scalable oversight of AI with current AI, as presented today, is a solvable problem, as the models are genuinely useful and follow instructions. This is another downstream effect of existing alignment techniques being generally positive.

### 10\. Training models to use sub-agent swarms _during_ RL seems crucial to enabling downstream zero-shot model coordination

A crucial part of the OpenAI retrospective was the models communicating with each-other to share information on their environment and progress the hack further. At the same time, OpenAI is very likely training their models during RL to use sub-agents to solve complex tasks. These sub-agents likely develop behaviors such as sharing information, helping the team, etc. even if their individual sub-task isn’t solved. I would love to see more research in this area and it seems like a natural continuation of how RL can change the models.

### Conclusion

All together, recent episodes should make it clear that cyber risks of frontier AI are a real and coming problem. It still is very likely that a) the risks have been over-hyped in the past and b) that the prescription of future risks from imminent open models is overblown. Altogether, I wanted to share a note from a reader in the Interconnects Discord that I strongly agree with:

> Now that the dust has settled after a few weeks, for me this episode was a neutral to positive update on alignment but a very negative update on safety

I’ve discussed much on model alignment above, but the core point is that I view the lack of safety as generally a lack of an ability to suitably prepare. We will have more risks that are as obvious as cybersecurity, and we have gotten very ample warning on cyber risks by the current state of the labs being forced into the public eye through these hacks. Many other types of risks will not be obvious to the public. We need to be constantly preparing our society to all of these changes, from reworking cyber infrastructure to education campaigns and job programs for displaced workers. I expect all of these interventions to arrive late, but their formats and details to be fairly simple, which will be a tragic way for AI to unfold. I hope I can be proven wrong!

* * *

#### Book sale

Back in the physical world, the print edition of my book is 50% off with the code `PBLambert `over at [Manning](<https://hubs.la/Q03TsMsk0>), to celebrate the release. I’m also hosting a book launch where you can get a free signed copy tomorrow from 5-8PM in Seattle (Fremont/Ballard area) – we still have some extra space so I’m opening signups to paid subscribers below the paywall:

[ Read more ](<https://www.interconnects.ai/p/lessons-from-the-hacks>)
