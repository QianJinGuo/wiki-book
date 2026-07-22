---
source: rss
source_url: https://www.interconnects.ai/p/frontier-post-training-recipe-review
ingested: 2026-06-17
type: article
sha256: c8e20c6a56d7bfef1ec837f4120f8bc2c81b56ad4eeff4c61959cad136ac933c
feed_name: Interconnects
source_published: 2026-06-17
---

# Frontier post-training recipe review with Finbarr Timbers

As I’ve been recapping fundamentals of post-training to wrap up my [RLHF / Post-training book](<https://rlhfbook.com/>) I knew I needed to get [Finbarr Timbers](<https://finbarr.ca/>) back on the podcast to talk about the state of play. Over the last few months we’ve had many discussions on what we’d need to do to take an Olmo-style recipe to the frontier, supported by Finbarr’s extensive reading of recent model technical reports.

To prepare for this, I put together a summary [slide deck](<https://rlhfbook.com/teach/course/conversation-01/#1>) on the key post-training recipes historically — the path from InstructGPT to today — and today — the key open frontier models. This deck is summarized below as the technical summary, but we do spend 20-35 minutes on it in the podcast, so watching on [YouTube](<https://www.youtube.com/watch?v=sbXEPxIazqY&list=PLL1tdVxB1CpVpEtMHxwuR4uI4Lxjw00_y&index=10>) is likely the best experience for this one.

I previously [interviewed](<https://www.interconnects.ai/p/finbarr-timbers>) Finbarr in December of 2024, shortly after the release of o1 and Tülu 3 (and before he joined Ai2) on the “We are so back” era of RL.

Chapters:

  * 00:00 Introduction & Olmo reflections

  * 06:28 Post-train recipes review (history)

  * 23:00 2026’s model recipes (MiMo Flash, DeepSeek V4, GLM 5, Kimi K2.6, etc.)

  * 39:05 Open-ended post-training discussions

  * 48:22 Career advice in the LLM race




[Share](<https://www.interconnects.ai/p/frontier-post-training-recipe-review?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

Listen on [Apple Podcasts](<https://podcasts.apple.com/us/podcast/interconnects-audio/id1719552353>), [Spotify](<https://open.spotify.com/show/6XNzfJULeVxR7SneeesDUs>), and [where ever you get your podcasts](<https://www.interconnects.ai/podcast>). For other Interconnects interviews, [go here](<https://www.interconnects.ai/t/interviews>).

For more educational post-training videos, see the [course](<https://rlhfbook.com/course>) I’m putting together.

## Technical Summary

 _These are notes cleaned up from a slide-deck created with AI assistance — mostly useful as a discussion topic and reference._

The shape of a post-training recipe has changed more in the last year than in the prior three.

  * 2022–2023 (InstructGPT): one pipeline — SFT → reward model → RL.

  * 2024 (Llama 3, Tülu 3, etc.): open recipes formalize SFT → DPO → RL with verifiable rewards. Closed recipes use many stages of RLHF.

  * 2025 (DeepSeek R1): reasoning RL (R1) makes large-scale RL the centerpiece.

  * 2026 (MiMo Flash V2): recipes fragment into _many specialist models_ that are merged back into one.




**The new thing: MOPD**

Multi-teacher On-Policy Distillation (MOPD) is the pattern showing up across the 2026 frontier.

  1. Train N domain-specialist teachers (each: SFT, then RL on the relevant domains).

  2. Train one general student by sampling _its own_ trajectories (this is the final post-trained model).

  3. On each rollout, minimize reverse-KL to the _relevant_ teacher’s output distribution, token by token.




Lineage: MiMo Flash v2 introduced it → DeepSeek V4 & Nemotron 3 Ultra scale it to >10 teachers.

**Why did MOPD emerge?**

  * RL got expensive and conflict-prone. Mixing math, code, and agentic RL in one run eventually trades capabilities off against each other.

  * Specialists are cheap to make / organizationally scalable. SFT-then-RL on a single domain is well understood and parallelizable. As post-training becomes more complex, scaling it across organizations is a big win.

  * On-policy distillation matured. Literature and know-how continued to emerge through the RLVR renaissance.




_Sources:[DeepSeek V4 §5.1](<https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf>), [MiMo-V2-Flash](<https://arxiv.org/abs/2601.02780>)_

* * *

### Key historical recipes

**InstructGPT (Mar. 2022) — the canonical 3 steps** · [paper](<https://arxiv.org/abs/2203.02155>)

[](<https://substackcdn.com/image/fetch/$s_!RXNT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe0683459-e10e-4c6a-8192-71df98e12836_4400x2748.png>)

  * SFT on human demonstrations

  * Reward model trained on human comparisons

  * PPO against the reward model




* * *

**Llama 2 (Jul. 2023) — multi-stage RLHF** · [paper](<https://arxiv.org/abs/2307.09288>) · [interconnects recap](<https://www.interconnects.ai/p/llama-2-from-meta>)

[](<https://substackcdn.com/image/fetch/$s_!IYPf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5e89fca4-38bf-4dd9-9bfb-f9dc9bfcedbc_5215x2605.png>)

  * SFT, then iterative RLHF over multiple rounds

  * Each round: rejection sampling → PPO

  * Two reward models — separate helpfulness and safety




* * *

**Llama 3 (Jul. 2024) — a complex multi-stage recipe with simpler optimizers** · [paper](<https://arxiv.org/abs/2407.21783>) · [interconnects recap](<https://www.interconnects.ai/p/llama-405b-open-frontier-model>)

[](<https://substackcdn.com/image/fetch/$s_!PjC2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F284b45b2-9450-40c8-90aa-c72f252a61f9_9429x3473.png>)

  * Per round: reward model → sample K per prompt → rejection sampling → SFT → DPO

  * No online RL — the RM only filters; run over 6 rounds, best models seed the next




* * *

**T ülu 3 (Nov. 2024) — simple three-stage post-training** · [paper](<https://arxiv.org/abs/2411.15124>) · [interconnects recap](<https://www.interconnects.ai/p/tulu-3>)

[](<https://substackcdn.com/image/fetch/$s_!0oG2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fedc6b8f1-494b-418e-ae46-afcd4c650a6a_13827x4822.png>)

Curated prompts → SFT → DPO → RLVR (RL with verifiable rewards — the acronym was coined in this paper).

* * *

**OLMo 3 (Dec. 2025) — a reasoning update to the Tülu 3 recipe** · [paper](<https://arxiv.org/abs/2512.13961>) · [interconnects recap](<https://www.interconnects.ai/p/olmo-3-americas-truly-open-reasoning>)

[](<https://substackcdn.com/image/fetch/$s_!Nqpl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa7da11f8-95c0-4d19-8481-81311d025715_9718x2468.png>)

* * *

**DeepSeek R1 (Jan. 2025) — RL as the centerpiece** · [paper](<https://arxiv.org/abs/2501.12948>) · [interconnects recap](<https://www.interconnects.ai/p/deepseek-r1-recipe-for-o1>)

[](<https://substackcdn.com/image/fetch/$s_!BDov!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F97083bed-0200-4ef7-88ef-15e4742c7efe_4870x2218.png>)

The recipe:

  * R1-Zero — pure RL (GRPO) on the base, _no SFT_ ; used to seed reasoning behaviors for the full run, not a separate product

  * R1 — cold-start SFT → reasoning RL → rejection-sampling SFT → final RL → distill to dense

  * A big change in recipes: Large-scale RLVR as the primary driver, SFT to distill and refine RL behaviors




* * *

**DeepSeek evolution after V3**

  * **[V3](<https://arxiv.org/abs/2412.19437>)** · Dec ‘24 — SFT + GRPO RL.

  * **[R1](<https://arxiv.org/abs/2501.12948>)** · Jan ‘25 — multi-stage RL; reasoning _emerges_.

  * **[V3.1](<https://huggingface.co/deepseek-ai/DeepSeek-V3.1>)** · Aug ‘25 — hybrid think / non-think in one model.

  * **[V3.2](<https://arxiv.org/abs/2512.02556>)** · Dec ‘25 — 6 specialists via RL → SFT distillation → one mixed GRPO.

  * **[V4](<https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf>)** · Apr ‘26 — 10+ domain experts → MOPD.




* * *

### 2026 style recipes!

**MiMo Flash v2 (Jan. 2026) — where MOPD started** · [paper](<https://arxiv.org/abs/2601.02780>)

[](<https://substackcdn.com/image/fetch/$s_!YlO_!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb95013bf-1d1c-4d4b-9a5f-0c9f67c32d48_3709x1469.png>)

Stages: Stage 1 SFT → Stage 2 train ~6 domain-specialist teachers (with older style post-training recipes) → Stage 3 MOPD into a single student.

First clean articulation of multi-teacher on-policy distillation as the consolidation step — replaces a single monolithic RL stage with distill-from-specialists.

* * *

**Nemotron 3 Ultra (Jun. 2026) — two rounds, many teachers** · [paper](<https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf>)

[](<https://substackcdn.com/image/fetch/$s_!iU6A!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa9fd0c70-d28a-4591-a6b3-e372df128185_2443x1247.png>)

Stages: SFT → multi-teacher on-policy distillation, run over two iterations, with >10 teachers spanning reasoning, code, math, and agentic domains.

Novel: multi-round MOPD across different domains — distill, then re-distill from refreshed teachers.

* * *

**MAI-Thinking-1 (Jun. 2026) — closer to R1 than V4** · [announcement](<https://microsoft.ai/news/introducing-mai-thinking-1/>)

[](<https://substackcdn.com/image/fetch/$s_!X8PS!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6a41a711-5a0a-449e-8a0f-375b48021692_1790x344.png>)

Stages: mid-trained base → 3 specialist RL “climbs” (e.g. STEM) → trace-distillation SFT to consolidate the climbs → a final RL climb → MAI-Thinking-1.

Closer to DeepSeek R1 than to V4 — multi-stage RL with trace-distillation SFT to consolidate, _not_ on-policy MOPD. Not the only lab without MOPD!

* * *

**Kimi K2.5 (Jan. 2026) — agentic, multimodal** · [paper](<https://github.com/MoonshotAI/Kimi-K2.5/blob/master/tech_report.pdf>) · [blog](<https://www.kimi.com/blog/kimi-k2-5.html>)

[](<https://substackcdn.com/image/fetch/$s_!1VDp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80512ce8-98d2-47b3-b2cc-b5b264e36416_1926x1031.png>)

Stages: text-only SFT → joint text–vision RL across coding, vision, reasoning, agentic tasks. (No mention of MOPD.)

* * *

**GLM-5 (Feb. 2026) — staged RL by capability** · [paper](<https://arxiv.org/abs/2602.15763>)

[](<https://substackcdn.com/image/fetch/$s_!3dzI!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2d574f54-c68b-4c76-8720-92c80bb8b96d_5129x2933.png>)

Stages: Base → SFT → Reasoning RL → Agentic RL → General RL.

* * *

## Transcript

00:00:00 Nathan Lambert: Hello, we are back on a Interconnects conversation. I don’t really say I do interviews. People criticize me ‘cause I interrupt the guests too much. ‘Cause I’m not a good interviewer, but I’m here to entertain people. Um, this is also fun for me because I’m trying to make, like, a post-training course, and it kind of fits as, uh, in the advanced end of this.

So it’s kind of a crossover between Interconnects content and other stuff that I’ve been spending my time on this summer. So I’m happy to welcome Finbarr back. I think... Are you the first return guest? I haven’t checked.

00:00:37 Finbarr Timbers: Oh, wow.

00:00:37 Nathan Lambert: Um, Finbarr and I worked on this sort of post-training recipe stuff for a while at AI2. Um, I left recently. This is one of Finbarr’s last days at AI2. It’s already been announced. It’s not a spoiler here. So we’re gonna kind of reflect on some things on building post-training recipes for OLMO. Um, then we have a little, like, review slide deck and notes on the kind of state and evolution of frontier post-training recipes over time, which is pretty interesting because there’s, what is it, like two to four kind of canonical recipes that there has been.

So it’s kind of interesting when you see the field converge on something new, which it’s doing right now with multi-teacher on policy distillation. For some reason, that’s a bit of a mouthful. It is a long acronym. And then we’ll just kind of end with various discussion points on post-training and what we’re up to. So, happy to give you the floor if you have any hot takes you wanna start with to get people to, draw people in. Otherwise, I think, uh, I’m excited to kind of reflect on this, ‘cause I know you’ve been reading a ton of papers recently and kind of prep, laying some of this groundwork.

00:01:43 Finbarr Timbers: Well, yeah. I mean, today is my last day at AI2, so it- it’s ki- it feels very appropriate to be, to be talking to you as you’re the one who recruited me to AI2. So, uh, yeah, that’s pretty special, and it’s great to be, uh, yeah, the, the first repeat guest. I feel honored, uh, to be back on. So yeah, thanks, uh, for having me.

00:02:03 Nathan Lambert: Yeah. Do we wanna start with OLMO? I think that-

00:02:05 Finbarr Timbers: Sure

00:02:06 Nathan Lambert: ... people... I think I, uh, need to do this carefully, but I’ve talked about OLMO-3’s post-training many times to people. I haven’t done this in a very direct way on the podcast, but I would say that post-training OLMO-3 to make this reasoning model was a major accomplishment for many individuals to do this. But also, the complexity of what we were doing was pushing against the limits of AI2’s organizational capacity, and a lot of modern post-training is, like, your ability to wrangle compute data into a work stream.

And in order to do that in a complicated way, you really are wrangling an org chart. And that’s like part of why it’s like OLMO-3 was, by its nature, pretty late as a reasoning model. It was, like, a pretty rigid reasoning model, and that’s, like, partially reflected in the recipe being pretty simple. But then when you, like, compare it to all these new recipes with tool use and multi-teacher distillation and all of this, it’s just like a, a, a fork in the road where it’s like you could do this very simple thing and make a strong recipe, but it is not representative of what all the frontier labs are doing.

And I think that that kind of fork in being able to say that things are similar happened kind of after Tulou-3, where Tulou-3, I think, was also much simpler with this three-stage SFT-DPO RL recipe. But that simpler recipe was probably closer in outcome to what the labs are doing, but now doing that sort of three-stage recipe for a reasoning model, and especially a tool use, like, agent model, just doesn’t really apply. And that’s the point. That’s why I think the point of this podcast is to be like, what are the, what are the way, what are they doing to make these, like, true frontier models, and then shed some light on how it contrasts to the more a- like, open academic ones.

00:03:56 Finbarr Timbers: Well, actually, I think that’s interesting. What was the proce- so, you know, I, I only, um, came around for OLMO-3. I wasn’t around for the earlier, um, versions. What was the process like to go from Tulou-3 to OLMO-2? Because, like, y- just looking on, on Archive, um, I think Tulou-3 came out in November of ‘24, and then OLMO-2 came out in December of, of ‘24.

00:04:22 Nathan Lambert: We just applied the recipe.

00:04:24 Finbarr Timbers: Yeah. I, I mean, so, so I think that actually, like, yeah, and then, you know, um, DeepSeeker-1 came out in January, end of January ‘25, and, you know, OLMO-3 was then released in October. Was it October or November of ‘25? Like, I think-

00:04:39 Nathan Lambert: I think November.

00:04:41 Finbarr Timbers: Yeah, November. Yeah, right. It was November. So it’s-

00:04:43 Nathan Lambert: It was like do or die with Thanksgiving.

00:04:45 Finbarr Timbers: I remember that. Uh, yeah, ‘cause Canadian Thanksgiving had, had already happened-

00:04:50 Nathan Lambert: Yeah

00:04:50 Finbarr Timbers: ... which, yeah, I was happy. Um, but, uh, like, like I think it was, sure, maybe it was late, but I think it was only late by a few months. Like, it’s, it’s actually, like, you know, if I think of my past experience with model turnaround times, like a nine-month model turnaround, you know, from R1 coming out, like that’s actually, that’s not bad. I think, you know, something like six months would’ve been nicer, but-

00:05:12 Nathan Lambert: I, I think it’s slow ‘cause we didn’t re- it would be fast if we had rebuilt the R1 recipe. But what we did was we, like, ported reasoning into our existing recipe-

00:05:21 Finbarr Timbers: Yeah. Okay

00:05:22 Nathan Lambert: ... which is a simpler task, but has, like, a lower ceiling, in my opinion. Where it’s like the DeepSeek and the newer style recipes, which we’ll talk about, I think they just have a much higher ceiling in how much you can keep hill climbing them. Or they’re just, like, more prescri- more pedagogical of what the frontier is doing. Like, for the size models that OLMO was, which was like 7 to 30B, I’m not sure that doing this DeepSeek style RL first recipe is actually useful.

00:05:52 Finbarr Timbers: Uh, well, I, yeah, I think that’s a good point. And I mean, I think that’s really reflected in what we see in the research where you s- you know, you obviously you see the big, uh, the step change and you know how quickly things are improving When, you know, R1 comes out. So, like, I think that a great point, and it really does seem to saturate, or to, to not saturate, sorry, with, with compute. Um-

00:06:11 Nathan Lambert: Yeah. Um, shall we just do the slide deck? We’re throwing around, like, recipe-

00:06:15 Finbarr Timbers: Sure. Yeah, let’s do it

00:06:16 Nathan Lambert: ... names. Like, I feel like it might be useful to just do it because a lot of people probably want to follow but don’t exactly know. I’m, I’m gonna share, I’m gonna share a screen. So people listening, it might be useful to either, you can pull this slide deck up on your phone and click through it. It’s not super information dense, but you can also just watch it on YouTube. All of this will be linked.

Generally, this is just like a quick survey on how frontier recipes have evolved. We’ll go through the history quickly and then talk about what is currently happening and kind of probably interleave the old mode discussion we were having. Uh, okay. There’s a bunch of canonical recipes we’ll talk about. This is where I got the two to four number. I think the recipes are like InstructGPT, which is what coined the initial RLHF with this like three-stage idea, which took a while to get people to move on from, which was like SFT reward model and RL.

And I see as like Llama 3 and 2.3 as kind of practical implementations of that with, with other tricks of the trade. So those two could potentially be merged together. It’s just like kind of pre- and post-ChatGPT moment. And then the two most recent canonical recipes that we’ll cover in this I would say are like DeepSeek-R1, which is the shift to doing like reasoning focused and bigger RL stages than this kind of SFT focus from before, and then NeMo Flash and some of the new models from 2026 which add this distillation element.

00:07:42 Finbarr Timbers: Well, and, and I think it’s worth pointing out too that it’s not just NeMo Flash, like it was kind of a consistent theme. Like you saw this with DeepSeek, th-they referenced it in, uh, the V3 paper and then it’s, you know, it’s Qemi K 2.5, it’s GLM 5. Like it’s all of these papers, you know, start talking about this specialist, um, RL stage.

00:08:03 Nathan Lambert: Yeah. I think there’s a debate on how we draw it and whether or not distillation is... If you’re, if you have distillation as a technique, as a key milestone, then they were, the Xiaomi was the first and, but it’s kind of a march over time where you kind of see them change, and we’ll, we’ll go through this. I don’t, I don’t need to interrupt.

00:08:23 Finbarr Timbers: When you say distillation, I do think it’s important to distinguish between the straight up like, you know, distillation of the leading closed models and, you know, distillation of these domain specific models where, you know, I, I, I suspect that the, you know, the, the Chinese labs are doing both.

00:08:41 Nathan Lambert: Yeah.

00:08:41 Finbarr Timbers: But, you know, a lot of what they’re do, you know, but a, a lot of what they’re doing is this, um, training these domain specific models like, you know, a math model, a coding model, uh, you know, logic model, whatever, and then distilling those models back in and not just distilling from... So when we’re talking about distillation, it’s not just distilling from the leading closed models.

00:09:01 Nathan Lambert: Yeah. It’s a pain. I agree. The distillation term is horribly overloaded. Um, there’s a review slide. Do we need to review multi-teacher on policy distillation? It might be too complicated to need to do it. We could come back to it. I think I kind of want to just go through the actual models, and then we could use the supporting slides as needed. Um, this famous InstructGPT three-step thing, I think many people have heard of it, but this is what constituted post-training at the time of ChatGPT coming out, so it’s kind of important grounding of this human supervised SFT data, mostly human supervised preference rankings to make a reward model and then do RL on that, and the model gets better.

And it’s pretty interesting how all of these have been kind of phased out, at least in terms of what we know openly, where they’re, we don’t use that much human demonstration data for SFT. There’s likely some human preference data still in the loop, but I would guess that synthetic has a much bigger role, and there are reward models, but they’re like not the cl- key RL target anymore. So in four years, most, almost all the canonical pieces have been moved on. And like this evolution is kind of within there. I think the early models after InstructGPT, like Llama 2, um, even Llama 3, these are pretty similar, which is like you’re starting to break down this recipe with different tools like projection sampling, DPO, some increased iterations. I think increased iterations is just that there was more incentive to squeeze more out of the models, and they just like broke things down more, where InstructGPT seemed like a bit more open-ended research where this kind of cleanness was fine. So-

00:10:48 Finbarr Timbers: Well, I think that’s interesting, uh, with respect to how much everything has scaled, uh, right? Because, you know, InstructGPT was before ChatGPT was, was released, and so, you know, it’s something, like just the complexity of what was done is that which a small team or even a single team could do. But then when you start looking at, you know, Llama 3, like it just starts to be a more complicated process and, you know, where you start to have a lot more, you know, specialized data and there’s, you know, a lot more, you know, room for scale and for kind of money and complexity be poured in.

00:11:25 Nathan Lambert: Yeah. It’s like, uh, both for-profit and nonprofit efforts to do post-training want me to advise them, and I’m like, “I don’t really know how I’m gonna give you advice unless I’m spending twenty hours a week look, understanding the details of your recipe,” ‘cause it’s like, well, I can’t really give you a one sentence thing of do X without understanding all the complexities of the model and the post-training process that go into it. Which makes it, like makes it hard from kind of like a transparency point of view. Even if it’s fully detailed, it’s definitely still hard to modify and study.

00:12:00 Finbarr Timbers: Absolutely.

00:12:02 Nathan Lambert: So then like two through three in AI2, a lot of this was we’re trying to beat the results of this Llama 3 post-training, which is pretty complicated, but we don’t have the ability to scale the organization as far. So I, I, I think that’s a big reason why the actual workflow is a lot simpler, where we have three clear stages that are doing slightly different things, and they build on each other. And that’s like... It’s never stated very explicitly in these papers on like how the org chart impacts the recipe, but I would, I, I think it’s a very strong signal within the, at least the delta between the fully open work and the kind of partially open work that you get from industry.

00:12:43 Finbarr Timbers: Yeah, absolutely. And, and I think especially as we’ll see with the domain-specific models, like that’s like really clear, like something where you could really easily scale up your org chart to-

00:12:54 Nathan Lambert: Yeah

00:12:54 Finbarr Timbers: ... build that up.

00:12:56 Nathan Lambert: Yeah. And I threw Olmo 3 in after this, after the two through three slide, mostly just to show that the recipe was so similar to two through three, and the org chart hadn’t really changed. Like we didn’t have more ability to scale, and like there was a, a little bit of separation between the model types, between like the think and the instruct models. But like without a major reinvent- like a major org change, it was just kind of stuck in this and do the best you can with it.

00:13:22 Finbarr Timbers: Yeah. Absolutely.

00:13:23 Nathan Lambert: Be- because like the real big change was this with DeepSeeker-one. They, I had never seen this plot before, but they had this plot, maybe they added it for the nature version of the paper, where they kind of show their recipe, where they like take the base model, they do RL zero, and then they sample from the RL zero to like filter prompts, and then they use that as SFT. This is like going through this. They use that as SFT for the next version of the model to create like a development internal RL DeepSeek-R1, and then they do this like repeated sampling to train multiple RL versions and kind of distill, distill in the sense of, of clarify and refine the reasoning behavior of the model before going through the final pipeline, which again is a mix of, um, reasoning and non-reasoning SFT into a bigger RL run. And-

00:14:11 Finbarr Timbers: Well, and I think this is really interesting because it starts to show, I mean, first of all, the, the complexity here. We’re starting to use, um, yeah, like synthetic data as this primary input here, but it’s not just like, you know, it’s trying to elicit, you know, specific behaviors, and it’s this kind of like industrial process, um, instead of like this, you know, it’s not as much of an elegant research recipe. It’s more like, you know, we train a model, and then we use it as best we can, and we keep iterating. Um, but I think the other thing that’s interesting is, is we’re starting to see here the SFT serving as the cold start. First of all, where, where that’s, you know, I think before SFT was more of like a generally useful stage, whereas here its, its primary purpose is this, this cold start for RL.

And then the other interesting bit is, you know, DPO, uh, starts to disappear at this point from the leading recipes. I mean, Olmo 3 still does it, but you know, basically everyone else does away with it and just, you know, has the preferences included, um, as in, as a reward model or, you know, at so- at some way, um, in the reward bit of the RL stage. And so that’s a really interesting change, where the, the supervised part of post-training is just, you know, massively deprioritized.

00:15:27 Nathan Lambert: Yeah. So my hypothesis for the dropping of DPO on these models is that, uh, as, as you’re doing like a cleaner recipe, essentially the need falls away. Versus if you look at Olmo, which is taking tons of potential gains by refining your model on outputs of strong open weight models, like largely Qwen and DeepSeek is the training data for the SFT of Olmo 3. Uh, and like the delta between that SFT data and the base model is still pretty big in the probability distributions. So DPO kind of helps further refine and clean up that distribution in a way that kind of has very rough edges. And but when you have a more refined, like industrial process on post-training, th-that will, that potential benefit will be harder to gain. Something interesting that I didn’t fully con-confirm before this is, for example, NVIDIA used to also be on this DPO train with their smaller Nemotron models.

And, and I would guess that potentially like D- Nemotron Ultra would not. But it’s, and, and that’s because they’re at much further down this development tree and using on pol- like these more on policy methods for creating the SFT data. And their model, I would guess, will become kind of more robust out of distribution and like have weird, less weird rough edges before because of it. So that’s kind of my hypothesis on DPO, and people that use DPO will be looked down upon. But it’s like if you’re trying to bootstrap a recipe off the ground and just take gains where you can, I still think it’ll work for a lot of people in a kind of compute efficiency standpoint.

00:17:05 Finbarr Timbers: Yeah. I mean, I think generally, uh, there’s something interesting with the, the preference tuning that, yeah, like maybe, um, it isn’t being given the proper, um, respect that it deserves. ‘Cause o-one of the interesting bits about the Nemotron 3 super paper was that they saw pr- they, they do a, a traditional RLHF stage in their RL, which has also, you know, fallen with fashion and development, and they see pretty massive gains with it. So I think some of these changes are more, you know, driven by what’s in fashion rather than perhaps like a fully rigorous, you know, set of ablations.

00:17:41 Nathan Lambert: It’s very remarkable to me that the preferences loss function can do so much for these models. Like the models have so much potential there, and it’s just, it’s really a contrastive loss on pretty granular feedback. And they learn all sorts of things. Like they’ll, they’ll get better at math and code, or their reasoning strategies will be refined. And so I, I... That’s remarkable to me. I think there will still be funny research on like using preference- Base losses with verifiable outputs. Like, I, I think all this would work. Like DPO on verifiable rewards and stuff like this, it’s just kind of intellectually less appealing.

00:18:19 Finbarr Timbers: Yeah. Well, I think that’s, uh, you know, that’s where I thought that the, uh, delta learning, um, hypothesis style, uh, DPO, like what Olmo-3 did, where you, um, where the, the preference, you create these synthetic preferences by having like strong, by like bigger and smaller models of the same family, like is where you get your preferences from. I thought that was a really interesting signal because it, it seems really analogous to some of the work, some of the guidance stuff that we see in diffusion models, like how you have the classifier-free guidance, which has something similar, and there, there were very similar results there, which showed that you could have the--

But like one signal they used was further along in training versus earlier in training models as like, uh, a source of, of signal that you could guide along. And, and that worked quite well. And so I suspect that these signals, um, for, for preferences in that way, like that they could actually be more robust, but because, you know, some of the largest labs don’t have to do that, perhaps we’re not citing them as much.

00:19:18 Nathan Lambert: Yeah. Or they don’t tell us. Like, to continue this, it’s kind of cool to look at-- So the DeepSeek models have kind of gone through this, what I would call like l- closer to Llama recipes to DeepSeek-R1, which is d- like most definitively the canonical recipe for reasoning models, and then continue to change closer to this multi-teacher format. So if you look at the VC-3.3 paper, um, before R1, they do something remarkably similar to two to three type thing, where they have a mix of SFT and then they use it ver-- like this RL on verifiable rewards. They didn’t call it that, or their paper wasn’t out at the time. And so they did this before R1 came out, which was just kind of a less reasoning-focused models and used the same tools but with a different ratio of implementation weight.

00:20:07 Finbarr Timbers: And, and what’s interesting is that this comes out basically at the same time as two to three, and it’s a very similar two to three and Olmo-2. It’s a very similar recipe, just done with more complete.

00:20:16 Nathan Lambert: Yeah. Yeah. And then we have this R1, which we’ve just talked about at length in January, which is a month later. They have a few more releases through this. They have some updates to their V3 and R1 models, which have dates, which are largely the same recipe. And then the next documented change in their recipe was V3.1, which is when they merged this thinking and non-thinking into one model, which everybody that does this says, has said that it has been hell to train in. But you kind of need it from a serving perspective, and it’s obvious that long term, at least obvi- it’s obvious to me that long term all the models will be reasoning models, and you’ll just have reasoning models that are very efficient based on the gains that are there.

So this is kind of a needed change that they made. And then in December of 2025, they released V3.2, which is when there’s kind of meaningful changes to their recipe, and they’re talking about this expert creation with separate mini recipes, and then using that within their kind of R1 data process to do SFT data and then like a big RL run at the end with GRPO. So it took about a year for this, uh, like kind of evolution of the R1 style recipe to land in their models. And I think this, this is like a very big complexity step that isn’t represented in something like Olmo-3, and it’s kind of where you can see a fork in the recipes over time as like they, it, they become way more industrial and scaled at these frontier labs.

00:21:46 Finbarr Timbers: Yeah. And I think, you know, another one good thing here, just from a historical note, is that I think it was with the O3-24 release where they updated the original V3 paper. So, you know, V3 comes out before R1, then R1 comes out, and then after R1 comes out, they actually go back and update the V3 paper, maybe getting ready for the nature submission or, or, or something.

00:22:07 Nathan Lambert: Yeah.

00:22:07 Finbarr Timbers: Um, and they make a reference there to say like, “Oh, you know, something you could do is you could train these domain specialist models and then combine them.” Uh, and then, you know, that later becomes kind of what, you know, the more of a priority as they talk about in V3.2.

00:22:21 Nathan Lambert: That’s a fun note. Yeah. And then most recently in April 26th is this V4 model, which has even more experts. They add this new loss function for multi-teacher on policy distillation, which I said follow Jiaoli. And this is kind of a microcosm of the arc that the whole industry went through, at least the people who share what their post-training details are, of realizing how core RL is, changing the recipe around scaled RL, and then figuring out how to kind of scale to more domains in the scaled RL format without just like grinding to a halt in operational complexity.

00:22:58 Finbarr Timbers: Yeah.

00:23:00 Nathan Lambert: So then kind of the next stage of this is these, what I call twenty twenty-six style recipes, which are all these models that are doing this multi-teacher, um, infusion of knowledge. And then some of them are using on-policy distillation and some are not. It’ll be one of the key things to see is like how crucial is this on-policy distillation to really keeping up at the frontier. So the paper that kind of, that named this term was the MimoFlash V2 paper. I think the model was released in December and the paper in January, which a lot of things will look similar to this, um, kind of RL, large RL style recipe. But with this large RL run is more, is where the on-policy distillation comes in. So for, I c- this is probably a better time to explain. I have this great, great little feature.

So this is like the summary of what multi-teacher on policy distillation is. Generally, it fits within an RL framework where you have the model you are training, the, like the general model, sample its own trajectories, and then you route the trajectories to various expert models you have trained. And each kind of sample is trained with this distillation KL loss to match the tokens of that expert. And People have, multiple models have shown that this type of supervision is really useful for the models. You could combine it with other RL losses, such as verifiable rewards, which for example, Sasha Rush gave a good mini spiel on that and how they use that with Composer, which is a, a video that I really recommend people watching as well. But the, the key of it is that it is a different loss function, but it plays very nicely in the RL frameworks that people are already using. So they use these teachers-

00:24:45 Finbarr Timbers: Just RL, like it’s, it’s, like if you-

00:24:47 Nathan Lambert: Yeah

00:24:47 Finbarr Timbers: ... actually implement it, you know, I’m talking with some of the people at AI2 about implementing it now. And it’s like you take your RL setup, and then you just, you know, you, you have some very, your, uh, set of tweaks on the, the learner to actually implement this. So it’s quite straightforward.

00:25:02 Nathan Lambert: Yeah, so this is a fancy diagram that makes it more complicated than it needs to be, but it also a very nice diagram, which shows the various, um, domain teachers that they have, search agent, code agent, math, reasoning, safety, and how they put these together. And the, the experts are used both for SFT data and then this final supervision. And the recipe for the experts would look something like this DeepSeek recipe, which is complicated on its own, which is like make a very good reasoning model that is good at one thing.

00:25:29 Finbarr Timbers: Well, and I think it is complicated, but it’s also like if you, if you think about being the actual researcher like working on it, it’s like, you know, you have a base model, and then you have an RL set up, and you know, you’re just constantly updating both and then rerunning RL. So, you know, the, the most complicated like, uh, part of it is just, you know, writing down the history and tracing everything. But it’s kind of like a very natural, organic way, uh, for the r- the RL to evolve through, you know, iterative experimentation.

00:25:57 Nathan Lambert: Yeah. So like once you have a recipe, you’re progressively tinkering with each part, and it’s, it’s fairly stable, but it’s hard to rebuild from scratch. So like we’ll see how, see how long the recipe shape lasts, but it’ll probably be order of years. Um, another big one in this like also shared a lot of details on this on policy distillation approach was Nemotron-3 Ultra, which is obviously exciting to me to have a, like a US-made model that is very strong performance, and NVIDIA released a lot of datasets with it.

But they, they also talked about a lot of their very n- n- like implementation details of what was hard with on policy distillation. I, like I have notes somewhere on this. They do this thing where they have two rounds of on policy distillation, as they found it to be better to integrate some teachers one after another. And the paper has a lot more details. I’ve, I, I don’t wanna go scroll through the paper, but we could also do this. Did you have any o- other impressions? Like I have the, we have this other doc we can pull up that-

00:27:01 Finbarr Timbers: Oh

00:27:01 Nathan Lambert: ... also you might have had other details on it.

00:27:03 Finbarr Timbers: Yeah. Well, I think something else, um, that, that is worth, um, you know, contrasting the, the paper to is the Nemotron-3 super paper. ‘Cause in the Nemotron-3 super paper, they had a similar complicated recipe, but they did multiple rounds of RL. Like there they had three rounds of RLVR, followed by a round of, um, software engineering RL, and then followed by an RLHF stage. So it was, it, it was really interesting to see them go from doing that, like, you know, one of the most complicated, um, RL setups or in terms of, you know, successive stages, uh, that I’ve seen. To then, you know, you know this setup where it’s still complicated, but it’s a lot, um, you know, it’s a lot con- conceptually a lot simpler.

00:27:54 Nathan Lambert: Yeah. I, I pocket the paper up. It’s gonna be hard for me to... I, like I had highlighted a few details. The, the interesting parts are kind of around the, um, various NVIDIA details on all the teachers. There’s just so many details in their paper on training-

00:28:10 Finbarr Timbers: Yeah

00:28:10 Nathan Lambert: ... all the teachers. I think, okay, so I have some of it. I have some of this up. It’s like I have an interesting quote that’s like, “One key finding from our trials of doing on policy, multi-teacher on policy distillation is that teacher models trained with substantially different training pipelines cannot be effectively combined through a straightforward on policy distillation merge, resulting in suboptimal performance.” So it’s like they’d have to do some cross teacher alignment, um, to make sure that they’re actually similar, which I feel like could become a whole, uh, organizational nightmare. It’s like they say, “We hypothesize that when the teacher and student are trained on different SFT data, they acquire different reasoning behaviors and induce different output distributions. This distribution mismatch can cause student-generated trajectories to be out of distribution for the teacher, result- reducing the quality and reliability of the supervision- supervision signals provided by the teacher.”

00:29:00 Finbarr Timbers: Yeah, that’s interesting actually because there was a paper, uh, I, I can’t remember the name of it, but there was a paper that I read, um, recently which claimed that what you need to do is constantly... So, so you know, you know, one thing you could do, which was kind of the, the obvious thing to do, is you, you take your base model, right? You do, um, whatever general SFT that you’re doing, and then you take, you do, you know, a bunch of RL, you train domain-specific agents, you train them, you know, all the way until they’ve converged or until you’ve run out of money.

Uh, and then you take these final experts, and then you do some sort of, you know, on policy distillation to combine them into your, your final model. Um, but with the paper, and I’ll, I’ll try to find it and then give it to you, um, see if we can share it. What they claimed was that you need to, um, instead of using the converged model, you need to do it in like successive stages with like the in-progress model. So if, you know, you train your RL for like a thousand steps, you need to, you can’t use the, you know, the thousand step checkpoint to, for the on policy distillation. You have to do it in stages, and first use the, you know, two hundred and fifty step checkpoint and the five hundred checkpoint and, you know, gradually bring that base model like up to speed or else there’s gonna be too much divergence, and the, the KL divergence will just be like too, um, too distinct-

00:30:17 Nathan Lambert: Yeah

00:30:18 Finbarr Timbers: ... to learn from.

00:30:19 Nathan Lambert: Yeah. So essentially the last state-- sentence in this paragraph I had read most of is literally like, “We encountered this issue in practice because the teacher and student models were developed in parallel.”

00:30:29 Finbarr Timbers: Yeah.

00:30:29 Nathan Lambert: It’s like they’re like, “This is a problem because of it’s, like, hard to do everything at once.” Which is w- this is the type of thing where having research in it would be so great, and I think NVIDIA could release some of the teachers so that people could just like-

00:30:45 Finbarr Timbers: Yeah. That’d be great

00:30:45 Nathan Lambert: ... if you have the teachers and you have the intermediate model stage, you could do the problem of, like, just studying multi-teacher on policy distillation from the starting point and understanding the training dynamics.

00:30:57 Finbarr Timbers: Yeah.

00:30:57 Nathan Lambert: Which is the type of thing we would want to do at Oldo. We just haven’t scaled our recipe to this point yet.

00:31:03 Finbarr Timbers: Yeah, absolutely.

00:31:04 Nathan Lambert: So I will keep encouraging NVIDIA to do this.

00:31:07 Finbarr Timbers: That’d be great. NVIDIA-

00:31:08 Nathan Lambert: I think, uh-

00:31:08 Finbarr Timbers: ... listen.

00:31:10 Nathan Lambert: They, they listen. The other side of things is a bunch of models released in 2026 that do not do this multi-teacher on policy distillation, and they also don’t do nearly as many teachers. So I would say that this, like, Microsoft model, which I don’t say this as a diss, it’s, like, hard to get a new team off the ground, is they went for a simpler approach to try to get a solid model, and it has three more general experts combined w- via SFT and then, like, a longer RL run. So it looks a lot more like DeepSeeker one, but I suspect that what they will do next is make finer grain teachers and see if they need to switch to on policy distillation.

00:31:48 Finbarr Timbers: Yeah. And I think, you know, in one of our, um, group chats, you described the MAI thinking model as a conservative recipe. A-and I think that’s a really good description of it. Like they, you know, the, the team came up with this conservative recipe, and then I think that they did a really great job of actually executing on it. ‘Cause I think, you know, if you try to make too many changes at once, it’s really easy for the recipe to collapse under its own complexity, and I’ve seen that a bunch of times, you know, across my career.

Try to make too many changes and, you know, it all goes poorly. So I thought that was, um, a really good choice on their part. I, I also think that, uh, it’s not super clear to me, may-maybe you’ve seen some papers on this that I haven’t seen, but it’s not super clear to me how well the trace distillation SFT does or, you know, h- how much better on pols- online policy distillation is versus the trace distillation SFT.

00:32:41 Nathan Lambert: Yeah. It’s like what’s, what is the relative magnitude in the final performance?

00:32:45 Finbarr Timbers: Yeah.

00:32:45 Nathan Lambert: So the Nemotron Ultra paper has a table on how far the on policy distillation goes relative to the teacher, and they also have the starting point. So I guess that’s a potential way to do this. Here, I could, I could just pull this up. Let me switch.

00:33:00 Finbarr Timbers: Oh, sure.

00:33:04 Nathan Lambert: So I, I had this open, but in a different tab. Okay. Here’s, here’s this paper. This is page twenty-seven is which the paragraph I just read, and then it also has this kind of-

00:33:17 Finbarr Timbers: Oh, fascinating

00:33:18 Nathan Lambert: ... is it a great table. I spent a while looking at this earlier. So essentially, it’s like where they get after SFT-

00:33:24 Finbarr Timbers: Wow

00:33:24 Nathan Lambert: ... on each of the benchmarks on the general model. And then I think... Okay, so the sort of gains over the RLVR student recovery of the specialty student. So I need to make sure... Okay, so it denotes the initial student checkpoint, where RLVR denotes the s- initial student checkpoint, and then the multi-teacher on policy distillation. So I’m not sure what this SFT column can figure out, but you could see the kind of like where the teacher is relative to on policy distillation. I think this is like the closest information we have on the relative performance gains.

00:33:59 Finbarr Timbers: Yeah. That’s fascinating because the DeepSeek, I forget which one, maybe it was V3.2 paper claims or, or maybe it was, um, R1 actually claims that you can domain-specific... That, that, you know, doing the general stage, uh, captures the performance, uh, of it. But, you know, that, that doesn’t really seem to be... A-a-and yeah, a-a-and then so, you know, doing the domain-specific distilling in, and then doing a general stage on top of that captures the original performance. But that doesn’t seem to be the case here. Like, you know, the, the gap maybe isn’t huge, but there is still, most of the time, there’s a pretty big... There, there’s like, you know, a significant gap, even if it’s not huge. So that’s really interesting.

00:34:42 Nathan Lambert: Yeah. I wish this table and text was clearer. It’s like I literally can’t fully parse it. It’s like RLVR denotes the initial student checkpoint, and then OPD denotes the checkpoint after first and second iterations. It’s like, what is the checkpoint that was used at the start of on policy distillation?

00:35:01 Finbarr Timbers: I think it was the RLVR one, so that they do a general SFT stage, and then they do an RLVR stage that covers the non-teacher, the, the areas that where they don’t have specialized models. Then they do MOPD.

00:35:15 Nathan Lambert: Yeah. And then that makes sense with this recovery rate, which is like final model minus RLVR, which would be like the gains for the OPD relative to the teacher minus RLVR, which would be like what gains you needed to still cover.

00:35:31 Finbarr Timbers: Yeah.

00:35:32 Nathan Lambert: And like what, what gains the teacher could potentially give you. So more research like this. Happy to see some of it a- out there. I’m gonna switch back.

00:35:43 Finbarr Timbers: Yeah. Something I found interesting about the, um, the, uh, both the Nemotron papers and then the MAI thinking paper is that they don’t talk as much about some of the more detailed, um, post-training decisions that have shown some pretty strong gains in, um, some of the other papers. Like I, I believe it was GLM five where they talk about doing a difficulty curriculum and a difficulty filtering stage.

00:36:11 Nathan Lambert: Yeah.

00:36:12 Finbarr Timbers: And that’s just not something that’s really talked about in these other papers. They’re saying they, they don’t, you know, uh, I think it was QEM 2.5 used a temperature. It’s kind of funny. So QEM K 2.5 and GLM five both have temperature schedules, uh, and they both claim the exact opposite thing. So one of them says you have to start with a high temperature and go low. The other one says you have to have a low temperature and go high. And, uh, y- I don’t know. And then so, you know, you don’t see that discussion, uh, I, I don’t think in Some of the other papers, which is kind of interesting

00:36:40 Nathan Lambert: Yeah. I, I still think the Chinese labs are much more willing to share, like really, really nitty-gritty tech details. The NVIDIA paper is like mostly a list of like methods to create a teacher or like-

00:36:51 Finbarr Timbers: Yeah

00:36:51 Nathan Lambert: ... domain-specific teachers, which is useful, but I think like I was less... It’s like less of a fun read. They’re like, there’s 15 pages of different domains, so I’m like, “Okay, I don’t, like I don’t need this.” Yeah, like KBK 2.5 and, uh, GLM 5 actually have like more similar recipes, which are also on the simpler side, which is like you create this SFT stage, and then you do RL. The RL might be staged. Um, there’s not this on-policy distillation. There’s a bit less talk on how many experts they have and what their domains of expert-s are. I think it, it’s obvious, like you have to take all this with a grain of salt, and it’s like what, how they decided to present the information is like a big factor in this. And then like they might actually be closer in reality and then it just wasn’t described in a certain way.

00:37:44 Finbarr Timbers: I, I think another interesting bit is that you see the Chinese labs, uh, all seem to be converging towards sparse attention, whereas, uh, we don’t see the, you know, where was the American labs, at least NVIDIA and, you know, AI2 seem to be more converging towards hybrid attention. Uh, like N- uh, the NVIDIA Ne- Nemotron Ultra used the Mamba, um, attention, whereas, you know, we see, you know, DeepSeek sparse attention and then the Mimo, eh, MSA, whatever that stands for, Mimo Sparse Attention. So I, I think that’s, uh, an interesting divergence.

00:38:20 Nathan Lambert: Yeah. I am not the person to ask, but I agree.

00:38:23 Finbarr Timbers: [laughs]

00:38:23 Nathan Lambert: It’s like I... Like I, I often get asked of like, this is to, to... Don’t, we’ll avoid the full rabbit hole, but I often get asked like, “Are the Chinese labs more efficient?” And I’m like, “I don’t really know how I’m gonna give you advice unless I’m spending twenty hours a week look, understanding the details of your recipe,” ‘cause it’s like, well, I can’t really give you a one sentence thing of do X without understanding all the complexities of the model and the post-training process that go into it. Which makes it, like makes it hard from kind of like a transparency point of view. Even if it’s fully detailed, it’s definitely still hard to modify and study.

00:38:42 Finbarr Timbers: Yeah

00:38:42 Nathan Lambert: ... like if you make a GPT model 1% more efficient, you’re making like fat stacks of profit. Like, I think that’s like a more effective market mechanism, but-

00:38:53 Finbarr Timbers: And then-

00:38:53 Nathan Lambert: The Chinese lab-

00:38:54 Finbarr Timbers: You know-

00:38:54 Nathan Lambert: Yeah

00:38:55 Finbarr Timbers: ... if you make, you know, serving ChatGPT more efficient, Sam Altman can say, “Hey, here’s a bunch of stock.” Like, so yeah.

00:39:02 Nathan Lambert: Yeah. But, uh-

00:39:03 Finbarr Timbers: Um

00:39:03 Nathan Lambert: ... they do great, like the Chinese labs do great research.

00:39:05 Finbarr Timbers: Absolutely.

00:39:05 Nathan Lambert: I just think it’s kind of a bit different. Okay, we can move into more open-ended stuff here.

00:39:12 Finbarr Timbers: Sure.

00:39:12 Nathan Lambert: I think that we have like a bunch of docu... We have th- a bunch of things in a document here. I’m sure more will come up. How do you think about open models and kind ‘cause i- it just doesn’t strike me that there’s this, like, you know, I think that there’s a large business to providing... Well, actually that’s not even super clear. There’s, you know, we’ve seen a number of companies providing, you know, RL fine-tuning services, you know, RL as a service. We’ve seen a lot of companies try to provide fine-tuning as a service, and, you know, none of them have really taken off. Like, I think OpenAI has started to shut down, I think they shut down their RL fine-tuning. I think they might be shutting down their fine-tuning. May be wrong about that.

00:45:51 Nathan Lambert: Well, it’s like Cursor used Fireworks for their actual training run, and I’m like, I don’t really know all the details of this, but Cursor does something for fat- I think like fast weight tran- or Fireworks does-

00:46:01 Finbarr Timbers: Yeah

00:46:01 Nathan Lambert: ... a fast weight transfer and other things to make it so that they can scale their RL inference compute very nicely. So that’s one type of it. I don’t know how big of a long tail that business is, but also I think Tinker is a better business than most people expected. It makes some real amount of money. It’s like in the hierarchy, I think selling compute, not the best business.

00:46:23 Finbarr Timbers: Yeah.

00:46:23 Nathan Lambert: Selling inference, great business. And Tinker-like APIs, if you can’t transition it into selling tokens, is somewhere in between the two, where they could take some amount of margin that’ll be slightly higher than just selling the compute. And they obviously get a margin by having, like, they get compute at a cheaper rate than their customers-

00:46:43 Finbarr Timbers: Yeah

00:46:43 Nathan Lambert: ... and that’s like part of the margin they’re taking. But I don’t see it being as nice as inference, so it’s kind of existential for them to make it so that these fine-tuning APIs feed into a inference business pretty nicely.

00:46:56 Finbarr Timbers: Yeah.

00:46:56 Nathan Lambert: Because then you can be somewhat locked in on you train the model on our infrastructure. You actually can own the model weights, but the training dynamics to inference mismatch is perfect because you trained exactly on our inference engine, and are gonna get what you want out of it.

00:47:11 Finbarr Timbers: Yeah. And it also helps a lot with utilization because you can then, you know, utilize it. You, you can share that utilization across a lot of clients. So I think it makes a lot of sense. I think it’s probably a better model for a lot of, um, users. Like, I think of academic users, like it probably makes way more sense to do this. Or, you know, for that matter, if you’re, you know, as, uh, uh, starting a new, um, ar- you know, post-training lab now, as you know, I, I know a few people, um, who are. Like, I think that’s where it, it probably makes a lot of sense to start with something like the Tinker API, and then, you know, at some point if you wanna try and capture that margin, maybe then you try to do something more custom. But if you, if you can use something like that, like that’s great, and the economics are just, you know, fundamentally more sustainable. I or, you know, they’re better for you rather than trying to, you know, g- go to CoreWeave or whoever and say, or Serv scale and say, “Hey, I need, you know, 10,000 networked, uh, DB200s,” you know? That’s just a very expensive, um, thing to do, especially if you can’t keep it running all the time.

00:48:14 Nathan Lambert: Yeah. Do you have a, do you have any more hot takes on post-training before I ask you some more general things?

00:48:22 Finbarr Timbers: Uh, well, something I’m, I’m generally interested in and, you know, I, I’m the wrong person to, to speak to about it. I’d love to talk to someone who’s maybe a, a, a capital allocator, like who’s, you know, deciding or a compute allocator who’s deciding where to put, uh, compute or, you know, where to hire team members. Um, because I’m kind of curious how Uh, the high level decisions are made allocating resources between pre-training and post-training. Uh, ‘cause, you know, what I kind of have seen as, as a general trend is, is that you see a lot of papers where there’s, you know, more focus put on one or the other. Uh, like I think... So, so yeah, so that’s something kind of interesting to me is how people who are, you know, making this decision, how, how they’re making that decision and how they’re thinking about it.

00:49:10 Nathan Lambert: Yeah. It’s like the hardest decision to get out of labs. I’ve like, I used to spend time trying to get them to share more, but I, I think it’s like such a sensitive decision to where they see progress coming. Like they’re making that decision ba- allocating compute based on where they think the most progress is and what the like return on investment is. So if you go to Anthropic and they’re like, “Here’s where our percent, here’s our distributions,” it’s like, okay, that’s where labs see their bets and/or where they see they are weak.

And it’s like you invest more compute in the pro- to make progress in the area that you are interested in, which I always think makes a lot of the open research kind of boring right now, is like the people that get compute are just way more likely to succeed as academics and researchers, which is a horrible equilibrium for the world, but kind of realistically true. I, I, I don’t know how to make a lot of that. I wanted to ask you how you feel about the craze that people have to cash in on making money and join a lab before the ladder gets pulled up, and what people should be optimizing for in their careers in face of meaningful opportunity costs.

00:50:18 Finbarr Timbers: Yeah. I think it’s, well, that’s actually very, very timely. Uh, but yeah, no, I, I think that that’s, um, really important to, to talk about. I mean, I think it’s always worth focusing on whether what you’re doing and spending time on is gonna be generally valuable or if it, if it’s like a really short-term exploitation type thing in, in the, you know, RL like explore versus exploit setup. I, I mean, something that I’ve seen throughout my career has been often the places that pay the most, um, are also the places where you’re doing the most interesting work, right? Like, you know, if, if you’re gonna go work at OpenAI, OpenAI or, you know, Anthropic or the Frontier Lab, like they pay a lot of money. They also have a lot of resources, so you’re gonna make a lot of money and learn a lot.

Um, uh, so I think it’s worth trying to decide i- is that the, is the opportunity that you’re doing that or is the, is the opportunity like, you know, in 2021 or 2022 or whatever, where you might say, you know, I was at DeepMind at the time and it’s like, okay, do I work at DeepMind, which paid a lot less than like crypto? Should I go just, you know, work in crypto and try to, you know, mint NFTs or whatever? I think that would’ve been a mistake, but, you know, trying to figure out, um, if you’re gonna be able to do interesting work is really important and also, you know, try to figure out if you’re going to be able to, you know, push forward science. You know, if, if what you’re doing is more just saying, going to, you know, data vendors and saying, you know, “Okay, you know, we, I need a bunch of data to do whatever.” And then, you know, they, they give you a bunch of data, you train a model, you say it’s good or bad or whatever.

You know, I don’t think that’s as interesting and, and I don’t think you’re gonna learn a lot even though that’s, you know, work that would probably drive model progress for it. I think if you’re able to, you know, make, focus more on the science and make more scientific conclusions, I think that can be, you know, a lot better for your long-term career. And I think that’s where places like AI2 and the other, um, academic research labs, you know, Marin is doing a really great job of this. Um, I think that’s where you can have a lot of impact in that they don’t have the budget to go and buy a lot of data, and so that leverage just really isn’t, um, open to them to pull. And so they have to focus on science and driving innovation, and that’s where you can see things like the Almix, uh, paper, which I thought was a really excellent, uh, sc- you know, scientific paper, but also, you know, meaningfully, I think, advanced, uh, the state of the art.

00:52:32 Nathan Lambert: Yeah. No, mostly this is grounded in visiting the Bay Area, and every time I go I’m like, “Holy shit, what is going on here?” Like all these very junior people are like have way too much dread about their, uh, opportunity cost and both of us aren’t based in the Bay Area, so I feel-

00:52:46 Finbarr Timbers: No

00:52:46 Nathan Lambert: ... somewhat removed from it, which gives me a little bit more time to pause and be like, what exactly is the right thing to optimize for? I per- I-- it’s easy for me to say as somebody that’s established, but I think there’s opportunity for a lot of people to just, if they have conviction on something, to try to go and do it and not just follow everybody that goes down the funnel of joining one of the established labs or the Neo labs where I don’t hear from many people that join as a junior person at these places and end up with very high responsibility. Like they’re contributing to something that matters or they’re around a cool group of people, but I don’t hear from that many people that are like, “Wow, I am doing the highest leverage stuff and the most interesting things.”

00:53:30 Finbarr Timbers: Well, I think that, you know, it’s kind of funny for, for me to say this as I, my career has been more on, on the opportunistic, uh, side of things. Um, but you know, twice now, uh, I’ve been at organizations where, um, I, I’ve been working... So, you know, at, at DeepMind, uh, I, I was part of the Alberta office where DeepMind had, you know, aqua hired the, uh, computer poker research group from the University of Alberta. And so, you know, this was a group of people who were really invested in, uh, computational game theory and g- you know, poker playing, um, algorithms. And they were all in on that and, you know, they, they were all in on that to the point that, you know, they were one of the two leading, uh, labs in the field and, um, were, you know, b-because they were so strong at this, they were then, you know,

DeepMind came and, you know, acquihired them and, and they all joined and they, you know, did quite well from that, um, acquisition there. And then, you know, you know, I joined later because I was, uh, you know, interested in, in working with them and doing game theory and stuff. But you know, it was this group of people who had this conviction that what they were doing was really important and, you know, it worked out quite well for them. And then, you know, the same thing at AI2, where at AI2, you know, there was all of these people who were really interested in, uh, NLP research, you know, even before language models. Like we see people like, you know, like Kyle a-and Dirk I think were both at AI2 for like almost a, a decade.

Like they had these really long tenures, um, and then they did really well and then, you know, they’ve, they’ve since had some, you know, strong, um, opportunities, uh, coming out of that with, with, um, yeah, some of the opportunities that have been available to them. And I, and I think that the consistent theme there has been that, you know, if you have high conviction that what you’re doing is important and interesting, then like it, it’s not a mistake to follow that and to, you know, try to become really strong, um, in that area.

00:55:15 Nathan Lambert: Yeah. I mostly think it’s good for the world to have a di- more diverse set of approaches.

00:55:19 Finbarr Timbers: Yeah.

00:55:19 Nathan Lambert: It’ll be interesting to see what the deal labs actually produce if, if they can manage to do things that are diverse. My personal idea is that they’re so big now that most of them need to end up doing something that is somewhat similar, which is-

00:55:33 Finbarr Timbers: Yeah

00:55:34 Nathan Lambert: ... hard, but like they need to keep risking the comp- they effectively need to risk their $20 billion valuations to do something interesting that’s not just gonna be like squashed by an OpenAI or Anthropic side project.

00:55:48 Finbarr Timbers: Yeah, absolutely. And I think it’s tough because when you’re raising, when you’re, you know, you have these huge seed rounds and you’re raising, you know, 200 million or, you know, a billion dollars or whatever, then it’s like you have to pretty quickly show results to be able to-

00:56:01 Nathan Lambert: Yeah

00:56:01 Finbarr Timbers: ... you know, grow off of that.

00:56:04 Nathan Lambert: Yeah. So a to-be continued conversation.

00:56:11 Nathan Lambert: Any last words? I don’t, I don’t need to stretch it on if we don’t have anything to add to our conversation.

00:56:16 Finbarr Timbers: No, I, I think this was pretty good. I think it was really great, uh, getting a chance to catch up and talk about some of this stuff. You know, I, I’ve been reading all of these papers and thinking about all the different recipes, so it’s great to get to, um, to chat about it and put it out into the ether. So yeah, thanks for having me on.

00:56:31 Nathan Lambert: Yeah, thanks for coming back. We’ll talk soon.

00:56:33 Finbarr Timbers: Sounds good.
