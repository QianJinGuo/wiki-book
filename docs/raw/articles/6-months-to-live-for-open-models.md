---
title: "6 Months to Live for Open Models"
source: rss
source_url: https://www.interconnects.ai/p/6-months-to-live-for-open-models
ingested: 2026-07-24
feed_name: Interconnects
source_published: 2026-07-12
sha256: 0273950c7869299559940ebd282cca3c6348add2f5dde4c81baa7cf4b759a451
---

# 6 months to live for open models

The most serious test to date of open source AI’s viability is happening right now. I’ve seen [many waves](<https://www.interconnects.ai/p/sb-1047-and-open-weights?utm_source=publication-search>) of anti open-source AI rhetoric come and go since ChatGPT was launched, but none of them had obvious analogues in their potential enforcement to _real_ action already in place targeting the peer, closed models of the day. It is more real because new forms of regulation are being tested and implemented, with minimal oversight. I will be doing far more policy-facing writing than usual until this passes.

As of writing this, many sources are citing White House [discussions](<https://x.com/jacob_wendler/status/2075565694322651376>) on how to manage open models via a new executive order. There is no official information here, and it would likely impact a) Chinese-origin models and b) government uses only, but this is how the dominoes start to fall.

Open models lack the central economic champion to represent the potential downside of action against them. From [recent coverage](<https://www.theinformation.com/articles/trump-administration-asks-openai-stagger-release-new-model-security-concerns>) of the events surrounding model licensing agreements for Fable (and then GPT-5.6), more was said about what unfolded on June 9th:

> At the meeting, the topic of how the program will deal with open-source AI models came up, according to a person familiar with the session. A representative from Reflection AI, a U.S.-based open-source model provider, argued that open-source models should have exemptions from the framework based on their capabilities, the person said. Currently, Chinese open-source models such as DeepSeek have a substantial lead over other available open models, and Reflection has not yet launched a public model.

A ban of any form here would be a [big mistake](<https://www.interconnects.ai/p/banning-open-source-ai-would-be-a>) for the long-term trajectory of AI.

The most likely incoming action is to ban or indefinitely delay any open-weights model meaningfully above the capability level in the range of GPT 5.5, Claude Opus 4.8, or [GLM-5.2](<https://www.interconnects.ai/p/glm-52-is-the-step-change-for-open>). With the consistent [capability gap](<https://www.interconnects.ai/p/reading-todays-open-closed-performance?utm_source=publication-search>), this should be within the next 6 months.

As it stands, these would most likely be from a Chinese company, which is how this conversation of frontier open model capabilities inextricably becomes linked to other issues such as distillation. The capability threshold for a “right to review” from the government will shift over time, but once in place will likely progress far slower for open models rather than their closed counterparts. This is partially due to closed models being easier to secure but also due to the closed model companies having far more effective lobbying.

So, this leaves us in a place where there are two crucial policy discussions unfolding at once impacting open models – distillation & frontier capabilities. They’re very different in their nature, the necessity of response, and the potential response space. Still, together they represent the talking points of a surging platform of support for a potential ban of open models in the next 6 months.

The primary driver motivating regulation today is the inevitable truth that an open-weights model will soon reach the capabilities of Claude’s Mythos model. The actual performance of this openly released model will likely be more jagged, but all it takes is the model getting flagged in the nascent White House AI model checker. It’s hard to unwind new habits motivated by fear.

[Share](<https://www.interconnects.ai/p/6-months-to-live-for-open-models?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

### The current distillation debates are regulatory capture and doing nothing for now is fine

Distillation is largely a regulatory capture campaign at this point, as the only solutions on the table massively benefit the organizations pushing for it.

To elaborate, the anti-Chinese models political campaign is led by Anthropic, where they are sharing a mix of blog posts and [letters to representatives](<https://www.bbc.com/news/articles/cwyklykn5dwo>) detailing what the Chinese companies are doing. Anthropic has detected use from foreign companies, which is people coming and paying for its API, and eventually turned off usage and then written strongly worded recommendations of policy action and shared minimal technical evidence. This campaign may have started through a genuine business concern, but it has progressed to be the definition of regulatory capture, as Anthropic would gain substantial economic security in its products if the Chinese model makers they accused were banned.

If Anthropic was presenting information in a more neutral “you decide what to do” way, the community would have a lot more sympathy. It is more of a policy recommendation than an information sharing exercise at the frontier of a rapidly evolving technology. If Anthropic’s technology is as powerful as they say it is – so powerful that open models like it should likely be banned – then they should be able to secure their API. I continue to wait for them to explain why they cannot. One of their statements would need to be walked back.

Anthropic is also [pulling up the ladder for access to intelligence](<https://www.interconnects.ai/p/claude-fable-5-and-new-ai-safety>) in other ways — so the political recommendations they make in the vein of China competition are consistent with a much broader pattern of restriction of access to competitors of related technology in the vein of safety. It is easy to buy into company culture like an extra safety focus when many employees are on track for generational wealth. I do not blame the employees for this, but Anthropic’s corporate strategy should be understood in these broad, contextual lenses. Ben Thompson’s piece, _[Anthropic ’s Safety Superpower](<https://stratechery.com/2026/anthropics-safety-superpower/>)_, is the best writing on the subject.

The action that Anthropic is effectively asking for is the wholesale banning of pretty much all the Chinese open weight models in the U.S. — as any products built around open models are predicated on their continued improvement, increasing product market fit and compute efficiency as models get better. This would demolish the open model economy that is emerging in the US with inference companies, fine tuning companies, new products, and everything in between. We as a community desperately need to hold the line that conceding anything with respect to the distillation conversation is not acceptable.

Anthropic should try to protect their IP, but they shouldn’t ask the government to cement their position and in the process potentially isolate the US from the global open-source community. There are no good solutions to distillation with the information we have, other than letting the labs self-enforce it.

_I ’ve written at length on distillation in particular. I’ve written directly on its impact on [model capabilities](<https://www.interconnects.ai/p/how-much-does-distillation-really?utm_source=publication-search>) and the [regulatory environment](<https://www.interconnects.ai/p/the-distillation-panic?utm_source=publication-search>), and you can search for more in between the lines mentions on Interconnects._

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

### APIs aren’t magically secure

There’s a particular messiness to the distillation discussion, where there’s likely meaningful worry of Chinese labs distilling the narrow _cybersecurity_ capabilities of Mythos into an open model. This paints more on the insecurity of current model APIs more than it does on the distillation risk. Even when Claude Mythos was in its most-limited private beta, _[Discord Sleuths Gained Unauthorized Access to Anthropic’s Mythos](<https://www.wired.com/story/security-news-this-week-discord-sleuths-gained-unauthorized-access-to-anthropics-mythos/>)_. To date, model APIs continue to be jailbroken and accessed in unintended ways. 

This proliferates the risk of capabilities falling to bad actors far more rapidly than anything that involves complex fine-tuning of a 1T+ parameter model. I’m not a cybersecurity expert, but the dichotomy that only open-weight models are insecure and APIs are safe has been very overblown in recent years. APIs in concept _should_ be able to be more secure, but that is yet to be demonstrated. 

If Anthropic has a truly dangerous capability in their models, the only coherent action would be to not host it in a directly queryable API — before the discussion of it being distilled. 

### Ready or not, open models are coming

Where this becomes hard is that at the same time as these distillation questions, we’re staring down the barrel of “how do we handle frontier open weight models at the general capability level of Mythos?” This is a hard question, and it’s a natural human tendency to want to take a proposed solution to another problem (distillation) and apply it to the new, far more real problem (frontier capabilities).

We need to figure out the right policy for open frontier capabilities, but a flat out ban is likely not the answer. If the models are not banned in China as well, it is VERY easy for a bad actor to still use said banned open weight model, which negates the safety potential.

At the same time, if we alone ban the import of certain models, the global open-source community will continue. A world where the U.S. bans these models before China, or other more risk-sensitive cultures, would likely indicate that a form of AI fearmongering (or other social, political momentum) pushed the U.S. government to act early. It feels like speedrunning dystopia in the U.S., as our tech industry – the crown jewels of the economy – [looks far more like a Chinese system](<https://interconnect.substack.com/p/the-great-american-tech-crackdown>) with control and government investments. These are very bad outcomes!

The only way to add a ceiling on open-source progress is a global agreement on the management of risks of AI models, which we aren’t close to. Other delays make the AI rollout less predictable in the US and increasingly messy. It’ll feel a lot like the GPT-5.6 rollout, but instead of just limiting the upsides of open, cheaper intelligence to a few companies all the bad actors will immediately have access, too. Open models increase safety by broad access and understanding, not kneecapping the positive actors only.

In reality, there is no stopping the open-source ecosystem. The people building the best models are assessing risk as well, as China is very risk-sensitive and for example Z ai is already a public company exposed to a comprehensive set of pressures – keeping their rocketing stock up, for one. There will only continue to be more models that cross worrying levels of capabilities. Training AI models is not magic, and we haven’t seen access to building them drop off as the required investment has increased (yet).

One of the short-term off-ramps for this policy death spiral for open-source, a double-helix of related and complementary, scary issues, is for a company in the U.S. to release a similarly capable open model. This will shift the focus away from “only China is building the open models via distillation” to “we’re all in this together, and we should focus on the complex, moving frontier issues within our ecosystem.” This is an existential priority for open-source, and the companies who have the business reasons to release open-weight models like Microsoft and Meta (commoditizing their complements) should do it ASAP. I have less faith in Meta, with the new leadership, but they benefit from mass access to AI and should not get in their own way. If Reflection is sitting on an okay, but not frontier, model, they may need to release it to save their proposed business direction.

The shorter term solution than training a new model is to build the coalition. Open-source is a diffuse technology, without clear ownership, but the benefits will be shared by so many. This “everyone else” outside the frontier labs needs to start working today, on how to continue the safe rollout of open-weight models (and lobby for their principles and values) to the powers that be.

### Rising temperatures in the AI discourse

[ Read more ](<https://www.interconnects.ai/p/6-months-to-live-for-open-models>)
