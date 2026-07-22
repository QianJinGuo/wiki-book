---
source: rss
source_url: https://www.interconnects.ai/p/gpt-54-is-a-big-step-for-codex
ingested: 2026-06-07
feed_name: Interconnects
source_published: 2026-03-18
sha256: 09957c907183bf75d2f930040158a2bfecec4c481bbc51bbbe741a2f87fcd2cf
---

# GPT 5.4 is a big step for Codex

I’m a little late to this model review, but that has given me more time to think about the axes that matter for agents. Traditional benchmarks reduce model performance to a single score of correctness – they always have because that was simple, easy to quickly use to gauge performance, and so on. This is also advice that I give to people trying to build great benchmarks – it needs to reduce to one number that is interpretable. This is likely still going to be true in a year or two, and benchmarks for agents will be better, but for the time being it doesn’t really map to what we feel because agentic tasks are all about a mix of correctness, ease of use, speed, and cost. Eventually benchmarks will individually address these.

Where GPT 5.4 feels like another incremental model on some on-paper benchmarks, in practice it feels like a meaningful step in all four of those traits. GPT 5.4 in Codex, always on fast mode and high or extra-high effort, is the first OpenAI agent that feels like it can do a lot of random things you can throw at it.

Interconnects AI is a reader-supported publication. Consider becoming a subscriber.

I haven’t been particularly deep in software engineering over the last few months, so most of my working with agents has been smaller projects (not totally one-off, but small enough where I’ve built the entire thing and manage the design over weeks), data analysis, and research tasks. When you embrace being agent-native, this style of work entails a lot of regular APIs, background packages (like installing and managing LateX binaries, ffmpeg, multimedia conversion tools, etc), git operations, file management, search etc. Prior to GPT 5.4, I always churned off of OpenAI’s agents due to a death by a thousand cuts. It felt like rage quits. I’d feel like I was getting into GPT 5.2 Codex, but it would fail on a git operation and have me (or Claude) need to reset it. Those hard edges are no longer there.

The other subtle change in GPT 5.4’s approachability – the biggest reason I think OpenAI is much more back in the agent wars – is that it just feels a bit more “right.” I classify this differently to the routine tasks I discussed above, and it has to do with how the product (i.e. the model harness) presents the model outputs, requests, and all that to you the user. It has to do with how easy it is to dive in. This has always been Claude’s biggest strength in its astronomical growth. Not only has Claude been immensely useful, but it has a charm and entertainment value to it that’ll make new people stick around. GPT 5.4 has a bit of that, but the underlying model strengths of Claude still leave it feeling warmer.

Where Claude is a super smart model, with character, a turn of phrase in a debate, and sometimes forgetting something, OpenAI’s models in Codex feel meticulous, slightly cold, but deeply mechanical. I’d use Claude for things I need more of an opinion on and GPT 5.4 to churn through an overwhelmingly specific TODO list. The instruction following of GPT 5.4 is so precise that I need to learn to interact with the models differently after spending so much time with Claude. Claude, in some domains, you come to see has an excellent model for your intent. GPT 5.4 just does what you say to do. These are very different philosophies of “what will make the best model for an agent”, Claude will likely appeal to the newcomers, but GPT 5.4 will likely appeal to the master agent coordinator that wants to unleash their AI army on distributed tasks.

[Share](<https://www.interconnects.ai/p/gpt-54-is-a-big-step-for-codex?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

Outside of charm, and dare I say taste, a lot of the usability factors are actually better on OpenAI’s half of the world. The Codex app is compelling – I don’t always use it, but sometimes I totally love it. I suspect substantial innovation is coming in what these apps look like. Personally, I expect them to eventually look like Slack (when multiple agents need to talk to eachother, under my watch).

OpenAI also natively offers fast mode for their models with a subscription and very large rate limits. I’ve been on the $100/month Claude plan and $200/month ChatGPT plan for quite some time. I’ve never been remotely close to my Codex limits with fast mode and xhigh reasoning effort, where I hit my Claude limits from time to time. There’s definitely a modeling reason to this – most of OpenAI’s release blogs showcase each iterative model being substantially more concise in the number of tokens it takes to get peak benchmark performance. This is a measure of reasoning efficiency. This 2D (or more) benchmark picture is exactly where the world is going.

Here’s a [plot from Cursor](<https://cursor.com/blog/cursorbench>), which sadly doesn’t have all the GPT 5.4 reasoning efforts, but it confirms this point in a third party evaluation. What is missing across model families is the _speed_ and price (a proxy for total compute used) to get there.

[](<https://substackcdn.com/image/fetch/$s_!49G2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce867601-79e5-4519-9e6d-8ae221c08f0b_2400x1800.webp>)

The final benefit of GPT 5.4, and OpenAI’s agentic models in general for that matter, is much better context management. In using them regularly now I feel like I’ve never hit the context wall or context anxiety point. The reasoning efficiency I suspect is the case above just lets the model do way more with its initially empty context window. Then, when GPT 5.4 does compact, it’s been less noticeable.

The one problem I’ve been having with both Claude Opus 4.6 and GPT 5.4 is a light forgetfulness. If you give the models multiple TODOs in a single message outside of planning mode, I find them often dropping them. Sometimes it feels like the models glitch and try to solve a previous problem rather than the recent ones. I’m not sure what in the model or the harness is the exact cause, but sometimes I like to queue up a few messages as I see the model working on something, to refine the task, but currently this tends to be a pretty risky outcome except in the simplest use-cases.

These days I’ve been using both GPT and Claude extensively, mostly based on my mood, and have been getting more done than ever. Having a GPT 5.4 Pro integration directly with Codex, e.g. like \ultrathink, would be a big differentiator for OpenAI. Those models have been incredible.

All in, I see GPT 5.4 as an agentic model that brings a ton more simple usability and “agentness” to the very strong software foundation of GPT 5.3 Codex. It’s a big step, and I’m unbelievably excited for which of these two companies releases an update next. On paper, listing the strengths of GPT 5.4 across better top end coding performance, better speed, better context management, better rate limits, it’s a testament to how nuanced choosing a model is. I genuinely still _enjoy_ Claude a bit more for ways that’ll never show up on benchmarks. This makes me type `claude` into my terminal at the start of my day, rather than `codex`.
