---
source: rss
source_url: https://www.interconnects.ai/p/claude-mythos-and-misguided-open
ingested: 2026-06-07
feed_name: Interconnects
source_published: 2026-04-09
sha256: 9b2008570eac748c906dd84a6f63428c31ee9da6ef5787949541c2729ae89ef8
---

# Claude Mythos and misguided open-weight fearmongering

With the announcement of the Claude Mythos model this week and the admittedly very strong stated abilities, especially in cybersecurity, a [new](<https://x.com/tenobrus/status/2041636593040236745>) [wave](<https://x.com/stalkermustang/status/2041689727540023524>) of [anti](<https://x.com/mckaywrigley/status/2041651309758275609>) open-weight AI model narratives surged. The TL;DR of the argument is that our digital infrastructure will not be ready in time for an open-weight version of this model, which will allow attacks to be conducted by numerous parties.

The backlash against open models in the wake of the Mythos news conflates too many general unknowns into a simple, broad policy recommendation that could actually further weaken cybersecurity readiness.

We’ve been here before – open-weight models were discussed as being extremely dangerous when OpenAI withheld GPT-2 weights in 2019, and when OpenAI released GPT-4 in 2023. Both of these waves came and went. The core mistake that is being made is the composition of two issues: 1) the acceptance of the open-closed model gap being static in time and 2) linking open-weight viability generally to specific issues.

I’ve written at length recently on how I think that the best, frontier-level open weight models [are going to fall behind the best closed models in ](<https://www.interconnects.ai/p/open-models-in-perpetual-catch-up>)_[overall](<https://www.interconnects.ai/p/open-models-in-perpetual-catch-up>)_[ capabilities](<https://www.interconnects.ai/p/open-models-in-perpetual-catch-up>) in the near future. I’ve also written about [how the open-weight ecosystem needs to adapt](<https://www.interconnects.ai/p/the-next-phase-of-open-models>) to accept this reality. This is one of the times for the AI industry where I will repeat that it’s a total blessing to have the 6-18 month delay from when a certain capability is available within a closed lab to it being reproduced in the open. It’s a good balance of safety and monitoring the frontier of AI systems while allowing a useful open-source ecosystem to exist and thrive.

The core argument I’ve focused on in the open-closed model time gap has been in _general_ capabilities – i.e. for general purpose, frontier models such as Claude Opus 4.X or GPT Thinking 5.X. The abilities of these closed models to robustly solve and work in diverse situations as agents remains out of scope of the best open-weight models. What the open-weight models have tended to be better at is quickly keeping pace on key benchmarks (which admittedly is helped to some extent, but [not necessarily substantially by distillation](<https://www.interconnects.ai/p/how-much-does-distillation-really>)). This discussion is entirely different, it has to do with if open weight models can keep pace on the specific skills related to cybersecurity, and when we could expect an open version of this model to be available to the world.

The case of a Claude Mythos level open weight model is admittedly more nuanced to me than the previous few anti-open weight narratives the community has experienced. Where GPT-4 was about a more hypothetical risk, especially in areas like bio-risk, the clear and present reality of cyber infrastructure being prone to attack is far more tangible. Still, much of this nuance in the moment comes down to not knowing the full details of what the system can actually do (i.e. Mythos), and the state of the environment it would act in (i.e. our digital infrastructure).

To properly assess this risk, we need to know what it takes to build and deploy a Claude Mythos scale model. This entails three pieces: 1) training and releasing the weights, 2) the harness that gives the model effective tools it knows how to use, and 3) the inference compute and software.

[Share](<https://www.interconnects.ai/p/claude-mythos-and-misguided-open?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

(_Below I make some model size & price estimates to show my thinking, these should not be taken as ground truth.)_

Current estimates put the size ranges of leading models like Claude Opus 4.6 or GPT 5.4 as being around 3-5T parameters. Currently, the [largest open-source models](<https://huggingface.co/inclusionAI/Ling-2.5-1T>), which have been coming from Chinese labs, are around 1T parameters. Claude Mythos’s preview pricing is 5X Opus, which could come from a simple multiplicative increase in active parameters (with the same serving system design), far higher inference-time scaling, more complex harnesses that make inference less efficient, lower utilization expectations, and so on. The simplest guess is that it’s a mix of all of the above, something like 2X bigger in parameters and much less efficient to serve. That’s a huge model, likely something similar to [GPT 4.5,](<https://www.interconnects.ai/p/gpt-45-not-a-frontier-model>) but actually post-trained well (GPT 4.5 was ahead of its time, infra-wise).

With size comes the challenge actually training the model, as bigger models always come with new technical problems that must be solved to unlock the capabilities. For the case of cybersecurity, my guess is that most of the capabilities can be learned by training a model to be superhuman on coding. Unlike some capabilities such as knowledge work, medicine, law, etc., coding can be studied and improved substantially with public data like GitHub. I’m far more optimistic in open-weight models staying fairly close to the frontier in narrow domains of code execution and processing, but I don’t understand the full scope of skills needed to be superhuman in cybersecurity understanding. How much expert knowledge and special sauce went into training Claude Mythos? That’s a substantial source of my error bars on the impact.

Second, we know nothing about how the model works under the hood. Today, models are complex systems that entail far more than just weights. They require complex tools and infrastructure to run them, of which Claude Code is the one we are most used to. Mythos very likely has its own innovations here.

My estimate for how many GPUs you’d need to serve an 8T parameter, modern MoE is something like O(100) H100 GPUs, which costs something like $10K a day (and this may be very slow in terms of tok/s). Heck, the [official marketing copy](<https://www.nvidia.com/en-us/data-center/gb200-nvl72/>) of the Nvidia GB200 VL72 system is “Unlocking Real-Time Trillion-Parameter Models” on the rack. Does Mythos fit on one rack? The point isn’t to rely on my specific estimate as a policy reference, but to repeat that running leading AI systems is very expensive and not something you can just do on a laptop or self-service cloud portals.

There are far fewer actors who can get their hands on these resources, relative to those who can download the model. Of course, there are still many, but it’s important to flesh out all the details of what it would take to proliferate the capabilities of a Mythos-like model. In summary, tools like Mythos will make the best attackers have more powerful tools of the trade, but it won’t be handing a nuke to every teenager connected to the internet.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

Personally, I do acknowledge there’s a chance that cybersecurity abuse is a red line that makes releasing open-weight text models above a certain capability threshold morally grey. Many people thought this red line would come far earlier, somewhere in between GPT-2 and GPT-4, through the harm axis of mis/disinformation, but that had different bottlenecks. For image generation models, we’re well past the first red line which is enabling non-consensual AI deepfakes with readily available open-weight models. We’re balancing the reality of these fears having come and gone before with a technology that’s becoming increasingly capable.

So, my second large source of error bars is “how bad is it actually” with respect to the state of cybersecurity. How much can humans clean up in the most important software with months of private access to a model like Claude Mythos? What will never get fixed?

For example, if we get open-weight models that are close to the capabilities of Claude Mythos, could those be fine-tuned by organizations to _harden_ the security of their tools?

Currently, it’s too soon to call it as a general reason to stop progress in open models. When Claude Mythos is closed to so few partners, in some ways having strong open models _close_ to the threshold makes assessing the danger easier. Having to rely fully on a single private company to determine the security of essential, international infrastructure is not a tenable equilibrium.

So, in conclusion, I urge people to further study three things:

  1. How do we measure cybersecurity related capabilities across open and closed models. With this, are open models truly keeping up at a 6-9month lag, or are they only maintaining performance relevance in other areas of coding?

  2. How do we independently measure the true impact of Claude Mythos and Project Glasswing on existing cybersecurity concerns?

  3. If it is the case that the models are keeping up and the defensive capabilities of Claude Mythos are weak, how do we better monitor (and if needed, try to regulate) the targeted capabilities of open-weight models in narrow domains?




The goal is to encourage fears about open models remaining very specific. Any general ban on open models in a nation will immediately and likely irrevocably remove that entity’s ability to influence a crucial, and amorphous technology. If we stop building the best open models in the U.S., then another country will do this and become the center of the technology. There’s no way to fully kill open models, only influencing, understanding, and steering.
