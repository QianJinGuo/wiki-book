---
source: rss
source_url: https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety
ingested: 2026-06-10
feed_name: Interconnects
source_published: 2026-06-09
sha256: 7d8b74431c235eaa6e8cf9519ffae5253a66c81ed00299143514a056b4903f61
---

# Claude Fable 5 and new AI safety fables

Today, Anthropic [released](<https://www.anthropic.com/news/claude-fable-5-mythos-5>) their Claude Fable 5 model to consumer and enterprise audiences. This is the general-access variant of their Mythos-class models. With it, Anthropic rolled out a series of safety measures — some explicitly called out to users and some modifying the model without telling the user. It should be less surprising than it is that the next major step in AI capabilities came with heavier-handed safety measures indicating Anthropic’s intention to protect, or entrench, their current lead.

The unevenly applied safety policies that Anthropic have rolled out are on track to become a classic cautionary fable in how narrow and self-fulfilling notions of safety and control rarely work out.

[Share](<https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### The smartest model in the world

Before digging into the nuance of the safety facts, it is important to establish the quality of this model. The quality of the model paints the stakes of today — as these safety features are meaningfully changing the shape of access to frontier AI, something which has never happened with the modern LLMs we know. Second, the capabilities point to this story only accelerating. [Recursive self-improvement isn’t quite the right mental model](<https://www.interconnects.ai/p/lossy-self-improvement>) of progress from here, but Claude Fable 5 should make it very clear that there are no immediate walls in training LLMs.

To start — Claude Fable 5 is definitely the smartest model available to the general public — a remarkable leap on pretty much every relevant benchmark of the day — at only 2X the price of current Opus models1 (which is still less than GPT 5.5 Pro’s variant). This alone is a seminal moment for the field. To have a model iteration take such a substantial step in capabilities, a few years into the post-ChatGPT LLM race, is astounding. There’s no clear breakthrough associated with this model, such as inference-time scaling or RL, and public wisdom is that this is achieved by advances across the whole stack (of course, we can’t know for sure — it’s not documented). This is a major technical achievement and the employees who built the model should be very proud of their work.

This model was delayed 2+ months after it was done training before it was publicly available2. Given the competitive dynamics of the AI economy, the smarter version of this model is already well underway.

To continue, the benchmarks for the model are below.

[](<https://substackcdn.com/image/fetch/$s_!zKZX!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7caf7c30-6c3d-4735-b600-02d7c534525d_2600x2870.webp>)

An asterisk on these scores is that these aren’t necessarily the scores that the public will get, as some of the prompts will be downgraded to Opus 4.8 with the current safety filters on the model.

This is the type of jump in benchmark scores where I don’t even need to substantially test the model to know it’s an incredible tool. Remember that Anthropic is also the AI lab with the track record of caring _the least_ about benchmarks (in particular, when compared to OpenAI and Gemini). Recall a comment I made in [June of 2025](<https://www.interconnects.ai/p/summertime-outlook-o3s-novelty-coming>):

> This is a different path for the industry and will take a different form of messaging than we’re used to. More releases are going to look like [Anthropic’s Claude 4](<https://www.interconnects.ai/p/claude-4-and-anthropics-bet-on-code>), where the benchmark gains are minor and the real world gains are a big step. There are plenty of more implications for policy, evaluation, and transparency that come with this. It is going to take much more nuance to understand if the pace of progress is continuing, especially as critics of AI are going to seize the opportunity of evaluations flatlining to say that AI is no longer working.

Clearly, a few pieces of the progress dynamics have changed, but that’s a post for another day. I’ve written [multiple](<https://www.interconnects.ai/p/opus-46-vs-codex-53>) [posts](<https://www.interconnects.ai/p/get-good-at-agents>) about new models this year specifically in how it’s hard to trust benchmarks (and partially because the benchmarks don’t move that much). Altogether, this is a major validation for AI-savvy workers who realized they’re likely never going to write meaningful code again and need to develop new workflows around agents. 

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

### Smarter models spawn new safety games

There are multiple pieces of safety tooling associated with this release, including but not limited to required data-retention policies and added prompt filters. Through this analysis it is particularly important to be precise and clear as to which pieces of these are causing harm, and why single elements being out of place in an otherwise comprehensive policy are so damning for the overall safety process.

For their focus areas of cybersecurity, targeted model distillation, and research biology, Anthropic details new safety classifiers in their [blog post](<https://www.anthropic.com/news/claude-fable-5-mythos-5>):

> Fable 5 comes with a new set of _classifiers_ : separate AI systems that detect potential misuse, including jailbreak attempts, and prevent the main model (in this case Fable 5) from responding. We’ve been running classifiers on our models [for some time](<https://www.anthropic.com/research/next-generation-constitutional-classifiers>), and Fable 5’s classifiers are an extension of this previous work with extra coverage.
> 
> When Fable’s classifiers detect a request related to cybersecurity, biology and chemistry, or distillation, the response is automatically handled by Claude Opus 4.8 instead. Users will be informed whenever this occurs. Opus 4.8 is a highly capable model in its own right: a response that falls back to Opus is a far better experience than an outright refusal from Fable. Our early data shows that more than 95% of Fable sessions involve no fallback at all—for those sessions, Fable 5’s performance is effectively the same as that of Mythos 5.

Examples of the primary cybersecurity and biology safety filters — which tell the users explicitly when they’re triggered — are [already](<https://x.com/DimitrisPapail/status/2064415276968333548>) [proliferating](<https://x.com/DeryaTR_/status/2064414826122866707>) [online](<https://x.com/acerfur/status/2064400810054680634?s=46>) and appear quite sensitive. These can be a frustrating experience for users, but Anthropic is definitely within its power to do this and intellectually consistent for doing so. 

The damaging part of the safety story falls under the fold in the **Claude Fable 5 & Claude Mythos 5 [System Card](<https://www-cdn.anthropic.com/d00db56fa754a1b115b6dd7cb2e3c342ee809620.pdf>):**

> We have also added safeguards related to frontier LLM development. As discussed in Section 6.1 of our February 2026 Risk Report, we are concerned about the risks of accelerating the overall pace of AI development, though we remain uncertain about the severity of these risks. In particular, our concern is with—as we wrote then—“accelerating other AI developers in building powerful AI systems that pose similar risks to the ones ours pose - without necessarily having commensurate safeguards.”
> 
> In light of the ability of recent models to accelerate their own development, we’ve implemented new interventions that limit Claude’s effectiveness for requests targeting frontier LLM development (for example, on building pretraining pipelines, distributed training infrastructure, or ML accelerator design). Using Claude to develop competing models already violates our Terms of Service, but enforcing this restriction through our safeguards avoids accelerating the actors most willing to violate these terms. 
> 
> Unlike our interventions for cybersecurity, biology and chemistry, and distillation attempts, these safeguards will not be visible to the user. Fable 5 will not fall back to a different model. Instead, the safeguards will limit effectiveness through methods such as prompt modification, steering vectors, or parameter-efficient fine-tuning (PEFT). 

Anthropic documents on how this will impact a small percentage of users, which is true. I focus on the small amount of users supporting AI’s diffusion and understanding outside of the few frontier labs, as a crucial mechanism for the continued safety of the technology. 

Anthropic is documenting how the proliferation of AI capabilities is a concern to them, but they are solving it by misleading their users. An AI model that gets less intelligent automatically without notifying me is categorically misaligned AI. The next step on this line — not that Anthropic did it, but they could — is to have a model silently manipulate a workplace when it thinks it is an unsafe use for AI. Second, the implementation here is more complicated than was documented for cybersecurity or biology — modifying the model itself or the data presented to it, all without notifying the user.3

The duality of these policies is extremely confusing and paints a strong inconsistency that casts doubt over their safety policies. This “safety” measure is presented as being far more about maintaining their competitive position. Again, if all of the safety policies took one form, this would be far more cogent and easier to support intellectually.

Anthropic has been very vocal about their _concern_ over distillation attacks from particularly Chinese actors. Their claims are not transparent enough with the facts — or context as to why they can’t prevent the behavior — [to be fully believable](<https://www.interconnects.ai/p/how-much-does-distillation-really?utm_source=publication-search>). Despite the limited information, in the broader AI and DC communities, there have been [serious discussions about taking action against the Chinese model builders](<https://www.interconnects.ai/p/the-distillation-panic?utm_source=publication-search>) on the grounds of said distillation.

On the point of distillation, my hypothesis is that API builders don’t have an easy time preventing hacks or jailbreaking because it’s a deeply grounded property of reasoning models to want to output the reasoning traces, and it would make the model far less intelligent to fully patch the behavior. This is based on a few assumptions:

  1. Chinese labs are _not_ just showing up as customers to Anthropic’s API and paying for tokens in the intended input-output form. If the Chinese labs are paying for intended use behaviors, despite being banned by the terms and conditions, I don’t have a lot of sympathy for the frontier labs manifesting policy actions against this.

  2. Reasoning traces are disproportionately effective at seeding behavior in downstream models.

  3. Leading labs work very hard to patch the pipeline of these jailbreaks.




So, my logical conclusion is that the model companies would have to weaken their economic position to fully protect their IP. If this is the case, Anthropic would get a lot more sympathy from the AI research community by being transparent. It would also be far easier to have informed policy discussions, and not rely on me proposing Occam’s razor explanations for what the API jailbreaking looks like.

Building these safeguards is not something that Anthropic should do alone. Safety research should be built on common understanding and information sharing across both labs and public research efforts. 

If the exact safety procedures were actually the top line item to the company — a true non-negotiable for the leadership — they wouldn’t permit the model to be released with an unclearly implemented safety filter in one of their areas of focus (frontier AI training). I am asking — why isn’t there a classifier to downgrade AI research requests? This is a mix of transparent and reasonable safety policies with quietly rolled-out market entrenchment tactics.

I personally cannot trust the best AI model in the world to work in my professional domains building models, which I’ve constructed entirely out of a passion for making sure the transition to very powerful AI systems goes well for society. This inevitably will feel like a declaration of superiority by the Anthropic leadership. 

[Share](<https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### The control problem and open-source as the only answer

All of the actions Anthropic is taking, including calling out smaller Chinese companies for distillation, is well within their right. In fact, many people already expected the leading frontier models to be obviated from users so that labs can protect their IP. Today’s actions miss the big picture that AI will always be an ecosystem, and cultivating an us against them dynamic between the leading company and the other players is structurally unstable. 

Remember, this is at a time when the AI ecosystem is seeing the first stirrings [of violence against AI leaders](<https://jasmi.news/p/warning-shots>) — and I’ve heard from many people that they don’t expect it to abate. I wish I knew how to engage more to prevent this, and I see myself in the non-profit sector as someone who can hopefully independently represent AI to broader stakeholders.

I believe there was something misread, or at least misunderstood here, by the Anthropic leadership having a narrowly cultivated worldview around AI. An overwhelming sentiment I had today was one of obligation and confusion. I [shared](<https://x.com/natolambert/status/2064412173527556298>) how I don’t really want to have to go to bat against Anthropic, but they’ve just been unnecessarily antagonistic to China, then not so subtly to open weight models, and now more broadly to open AI research. 

I understand that Anthropic has a specific view of AI, but such a powerful technology will never have its final equilibrium be one of singular control by a private company. Anthropic showcased this earlier this year in the spat between the Department of Defense and themselves — which points to a long-term equilibrium where the government will either want AI to be controlled by them or to be open. This [made me believe](<https://www.interconnects.ai/p/how-anthropic-vs-dow-impacts-open>) that an open ecosystem is a far safer outcome.

Many of these events make me feel that Anthropic’s leadership has a culture by which they can’t help but speedrun through these issues — going head to head with existing power structures. This adds substantial uncertainty into an AI ecosystem at a time when it is very much not needed.

Collectively, the last week could be seen as a major rallying point for a new open-source ecosystem in the U.S. Nvidia released their first flagship model last week — [Nemotron 3 Ultra](<https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/>) — and these actions from Anthropic have galvanized a unanimous motivation and concern among my peers building open models. We need intelligence that we can trust, that we can modify, and that we can control. 

The American open-source ecosystem has its feet underneath it and keeps being given more reasons to fight for its leadership, right from the hands of the companies it directly undercuts. That’s the moral of this fable.

1

Fable is at $10 per million input and $50 per million output tokens.

2

based on the original Mythos roll-out, which is an imperfect metric.

3

Fable [confirmed](<https://claude.ai/share/78d57944-e7d3-4b2c-ba9f-8febd163fbb3>) for me that these are different mechanisms.
