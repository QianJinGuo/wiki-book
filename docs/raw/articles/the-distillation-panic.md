---
created: '2026-06-07'
feed_name: Interconnects
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: strong
review_value: 8
sha256: f58d0d679760a7afb5bdd1d6528d4e96eb8ea3f7537bdfefa89e5f4fda0db1aa
source: rss
source_url: https://www.interconnects.ai/p/the-distillation-panic
tags:
- article
title: The distillation panic
type: source
updated: '2026-06-07'
---

# The distillation panic

‘Distillation attacks’ is a horrible term for what is happening right now. Yes, some Chinese labs are hacking or jailbreaking APIs to attempt to extract more signal from model APIs — stopping this is important to maintain the U.S.’s lead in AI capabilities. Referring to this as distillation attack is going to irrevocably associate all distillation with this behavior, and distillation generally is a core technique needed to diffuse AI capabilities broadly through academic and economic activities.

We went through this sort of language transition with the open source vs open weight debate. All the terms just reduced to open models – very few people in the large AI community know exactly how open-source differs from open-weights. And terminology matters, as the less informed people who still care about — and influence — the technology are bound by different terms they use. If we’re not careful with the discourse around distillation, many people could associate this broad technique used for research and development of new models as an act at the boundary of corporate manipulation and crime.

[Share](<https://www.interconnects.ai/p/the-distillation-panic?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

I’ve recently written a more [technical piece](<https://www.interconnects.ai/p/how-much-does-distillation-really>) on estimating how impactful state-of-the-art distillation methods are on leading Chinese models, and this piece follows to push for caution in any hasty actions to target the methods with policy. To set the stage, recall Anthropic’s recent blog post where they [detailed “distillation attacks” made by 3 Chinese labs](<https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks>).

> These labs used a technique called “distillation,” which involves training a less capable model on the outputs of a stronger one. Distillation is a widely used and legitimate training method. For example, frontier AI labs routinely distill their own models to create smaller, cheaper versions for their customers. But distillation can also be used for illicit purposes: competitors can use it to acquire powerful capabilities from other labs in a fraction of the time, and at a fraction of the cost, that it would take to develop them independently.

This is a clever paragraph, where they normalize distillation generally and explain how a few people can use it illicitly, without detailing how illicit use often involves other more explicit behavior like jailbreaking, hacking, or identity spoofing of the API.

Distillation itself is an industry standard. It’s used extensively, primarily in post-training, by smaller players to create specialized or smaller models. In my [book](<https://rlhfbook.com/c/12-synthetic-data>) coming this summer, I describe it as follows:

> The term distillation has been the most powerful form of discussion around the role of synthetic data in language models. Distillation as a term comes from a technical definition of teacher-student knowledge distillation from the deep learning literature.
> 
> Distillation colloquially refers to using the outputs from a stronger model to train a smaller model.
> 
> In post-training, this general notion of distillation takes two common forms:
> 
>   1. As a data engine to use across wide swaths of the post-training process: Completions for instructions, preference data (or Constitutional AI), or verification for RL.
> 
>   2. To transfer specific skills from a stronger model to a weaker model, which is often done for specific skills such as mathematical reasoning or coding.
> 
> 


With this definition, it’s easy to see how distillation takes many forms. Of course, if you just take the outputs from GPT-5.5 and train a recent open-weight base model with them to host a competitive product, that’s one thing. But, a lot of the things that fall under the bucket of distillation are complex, multi-stage processes that muddle the exact impact of the model you distilled from.

Modern LLM processes could look like using a GPT API to build an initial batch of synthetic data to build a specialized small data-processing model. A good example is a model like olmOCR (or many other models in this category) that are trained to convert PDFs to clean text. This specialized model would be used to create large amounts of data. Finally, you train another model (often from scratch) with the new data you created. Is this final model distilled from GPT?

When done via a closed, API-based model, distillation sits in the grey area of the terms of service that you agree to when signing up to the Claude or GPT platform. They generally forbid the use of the API to create competing language model products, but this term has largely gone unenforced. The open-source community used to worry deeply at being cut off from these cutting-edge APIs for doing research or creating public datasets, but to date only [one prominent case of corporate accounts being restricted exists](<https://www.theverge.com/2023/12/15/24003151/bytedance-china-openai-microsoft-competitor-llm>) (at least until the recent Chinese companies).

This is all to say that distillation is an industry standard technique, and the use of closed APIs to perform distillation has always been a grey area. Nvidia’s latest Nemotron models, as one of the only models with open post-training datasets, are technically in large part distilled from Chinese, open-weight models. The Olmo models we’ve built at Ai2 are distilled from a mix of open and closed models. This grey area was brought to the forefront again when it turned out that xAI has been distilling from OpenAI. Quoting from the recent trial [proceedings](<https://x.com/MTSlive/status/2049886679876632724>) between Elon and OpenAI:

> OpenAI’s counsel asked Musk whether xAI has ever “distilled” technology from OpenAI.
> 
> Musk: “Generally AI companies distill other AI companies.”
> 
> “Is that a yes?” Savitt asked.
> 
> Musk: “Partly.”

xAI is likely the largest, and most successful AI company willing to thread the grey area that is distillation from their competitors. On the other side, the majority of startups and research groups with fewer resources than them have very likely engaged in distillation of some capacity from Claude, GPT, or Gemini models.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

In the above Anthropic blog post, the problem with the distillation attacks by a few Chinese labs is less the distillation and more the means of attack. It is documented that Chinese labs are actively working to get around the intended use of the API, e.g. to provide additional reasoning data that is very useful for training.

Of course no one should be able to access information from a model that a developer didn’t intend to reveal in their APIs (e.g., reasoning traces which would be helpful for training). Associating all of distillation with these attacks, which is to date an industry standard for post-training, from open and closed models alike will be a massive own goal.

What these few labs are doing should be referred to as jailbreaking or abuse, rather than distillation.

The discourse around these actions is creating a troubling discussion that’s marching towards a mix of regulatory capture or regulatory exuberance that’s most likely to harm the U.S.’s ecosystem more than China’s. Even if we ban, most likely through potential legal action and other penalties, this type of API abuse, the Chinese companies will likely still do it. We’ve seen this playbook with Chinese multimedia models taking a flexible view of copyrighted content that no U.S. player is willing to take the risk on.

This distillation discussion has quickly snowballed, with a [bill moving out of a committee in Congress](<https://www.congress.gov/bill/119th-congress/house-bill/8283/text>), an [executive order](<https://whitehouse.gov/wp-content/uploads/2026/04/NSTM-4.pdf>) pushing for action, and [congressional oversight](<https://www.semafor.com/article/04/29/2026/house-committee-probes-cursor-parent-airbnb-over-chinese-ai>) targeting U.S. companies building on Chinese models (which are downstream of distillation). This multi-pronged regulatory environment could yield truly horrible outcomes – such as figuring out a way to effectively ban open-weight models in the U.S. that are built in China by groups abusing closed LLM APIs.

It is obvious that no bill will literally ban open models, but they can create grey area that exposes entities to unwanted risk or require certain provisions that are bureaucratically very challenging to fulfill, squashing small open source contributors.

In that scenario, the groups who lose are Western academics and smaller companies building models for the long-tail of AI uses. The ecosystem here could be made permanently irrelevant with the removal of nearly all Chinese open-weight models. There is no immediate substitute and building new models with meaningful community adoption has a lead time measured in 6+ months. In the time it takes to build a new domestic open-source ecosystem, countless researchers would’ve moved onto closed training platforms or into new areas.

Altogether, I’m hoping this flurry of discussion around distillation becomes a nothing-burger and not a hasty, multi-pronged policy push. We need to avoid two things:

  1. A wholesale negative connotation of the word distillation, which is used extensively across the AI ecosystem.

  2. A domestic ban of the open-weight models built by organizations engaged in some portion of distillation.




In addition to this, I want the leading U.S. AI companies to be able to provide their APIs without having their IP leak. They should share more information on why it is hard for them to secure their APIs, but that’s an issue out of scope for my expertise.

I’ll conclude with a proposal from my friend Kevin Xu at [Interconnected Capital](<https://www.interconnectedcapital.com/>) (and great [Substack](<https://interconnect.substack.com/>)) on why this current distillation dynamic may actually be good for the leading labs.

If all the Chinese companies are addicted to distillation as a way of getting close to the frontier, then they’ll never actually learn the techniques needed to take an outright lead. If we cut off the Chinese’s obvious crutch in model building, we’ll gain a short-term lead in AI, but in the long-term that may be what they needed to get on a more competitive long-term trajectory. 

This is the same debate we’re having with other technologies where the U.S. currently has a lead, e.g. with advanced semiconductor technologies. So I understand the trade-offs, but we not should crack down on all of distillation.
