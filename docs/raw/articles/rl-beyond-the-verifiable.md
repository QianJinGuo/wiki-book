sha256: d5d4a8206b01aa0acd8f5b78d0cd698bfcdb6cdae83b8dde12593bd3bce7b183
---
source: newsletter
source_url: auto
ingested: 2026-06-30
---

Title: RL Beyond the Verifiable

URL Source: http://www.tanayj.com/p/rl-beyond-the-verifiable

Published Time: 2026-06-29T23:26:01+00:00

Markdown Content:
_I’m Tanay Jaipuria, a partner at [Wing](https://www.wing.vc/) and this is a weekly newsletter about the business of the technology industry. To receive Tanay’s Newsletter in your inbox, subscribe here for free:_

Hi friends,

On a podcast with [Dwarkesh](https://www.dwarkesh.com/p/dario-amodei-2), Dario Amodei, CEO of Anthropic, said he’s 90% sure we get a “country of geniuses in a data center” within ten years. And when he explains the missing 10%, his biggest uncertainty comes down to one thing, the tasks you can’t verify:

> _With coding, except for that irreducible uncertainty, I think we’ll be there in one or two years. There’s no way we will not be there in ten years in terms of being able to do end-to-end coding. **My one little bit of fundamental uncertainty, even on long timescales, is about tasks that aren’t verifiable: planning a mission to Mars; doing some fundamental scientific discovery like CRISPR; writing a novel. It’s hard to verify those tasks**._

That’s what we’ll discuss today. In this piece, I’ll cover:

*   Why verifiability is the constraint

*   The techniques that are working now

*   The companies attacking the problem

A big reason for the progress over the last year has been RL with verifiable rewards, or RLVR. The idea is simple. Give the model a problem where you can check or verify the answer, let it reason through to a solution, and reinforce the attempts that land on the right one.

Math and code are the perfect fit and we’ve seen the corresponding progress. The reward is clean, cheap, and you can run it millions of times. And the hill-climbing has been real as evidenced by the progress on SWE-bench. In 2025 both [OpenAI](https://arxiv.org/abs/2502.06807) and [Google DeepMind](https://deepmind.google/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/) hit gold-medal level at the International Math Olympiad, each scoring 35 out of 42 on problems most strong undergraduates can’t touch.

[Jason Wei](https://www.jasonwei.net/blog/asymmetry-of-verification-and-verifiers-law) (then at OpenAI) wrote this up as a “verifier’s law”: the ease of training AI to do a task is roughly proportional to how verifiable the task is. Anything you can check quickly and objectively, you can grind on with RL until it works.

The catch is that most valuable work isn’t necessarily easily verifiable. There’s no test suite for a good memo or a design, let alone for things like building a business, which requires long time horizons and feedback from the real world..

[![Image 1](https://substackcdn.com/image/fetch/$s_!SuK7!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b1b8486-d8e7-4887-ba23-a4a16cff8144_2400x940.png)](https://substackcdn.com/image/fetch/$s_!SuK7!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4b1b8486-d8e7-4887-ba23-a4a16cff8144_2400x940.png)

So the whole game in “unverifiable domains” comes down to one question: where does the reward come from when you can’t easily check the answer?

This problem isn’t new. RLHF and [Constitutional AI](https://arxiv.org/abs/2212.08073) are both, at heart, answers to “what do you do when there’s no checker.”

RLHF trains a separate reward model on human preferences (which of these two answers is better) and then optimizes the model to score well against it. Constitutional AI, which Anthropic uses on every Claude model, swaps much of the human feedback for AI feedback guided by a written set of principles.

These work as forms of alignment but they haven’t produced the capability jumps in subjective domains that RLVR produced in math and code and arguably have optimised for engagement rather than capability improvements. So what are the other ways we can get verifiers or reward signals for subjective domains?

There are a couple of different approaches being taken to try to verify things that aren’t necessarily easily verifiable:

[![Image 2](https://substackcdn.com/image/fetch/$s_!oEGC!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb2f9b455-102b-4440-b056-6ccc321118c7_2400x993.png)](https://substackcdn.com/image/fetch/$s_!oEGC!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb2f9b455-102b-4440-b056-6ccc321118c7_2400x993.png)

**Rubrics as rewards.** Scale AI published a paper about this in [mid-2025](https://arxiv.org/abs/2507.17746). For each prompt, you generate an instance-specific rubric, a checklist of what a good answer should do, usually anchored to human experts. An LLM judge scores each attempt against the checklist, and that score becomes the reward.

[![Image 3](https://substackcdn.com/image/fetch/$s_!gRyi!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89bb8e4d-6260-4929-a07f-b9029967f737_2400x980.png)](https://substackcdn.com/image/fetch/$s_!gRyi!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89bb8e4d-6260-4929-a07f-b9029967f737_2400x980.png)

It works because it breaks the question of validating a difficult to verify answer into many smaller yes/no or scoring based questions. Instead of asking a judge “is this good” and getting back a noisy 1-to-10, you ask “does it mention X, avoid Y, handle Z,” and each of those is close to checkable. Scale [reported](https://scale.com/blog/enterprise-rar) up to a 31% relative gain on HealthBench, a medical benchmark, over plain judge scoring. Follow-up work like [OpenRubrics](https://arxiv.org/abs/2510.07743) is now focused on generating these rubrics at scale. This is the approach commonly taken by many of the data providers in domains like legal, healthcare, finance, etc.

**Generative reward models.** This is similar to the LLM-as-judge approach. Instead of spitting out a black-box number, the reward model reasons first and then scores the answer.

**Process reward models.** This is an approach to grade each step of the reasoning rather than just the final answer, which can be more critical for longer horizon and harder to verify tasks.

The common thread is that when you can’t programmatically create a checker, you can approximate one checker by creating a bunch of rubrics to compare either the final output or intermediate stages, and use LLMs or similar models to grade against those.

There are a number of companies taking different approaches to try to enable RL in these harder to verify domains:

[![Image 4: Three approaches to RL beyond the verifiable](https://substackcdn.com/image/fetch/$s_!B73a!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F259f50f4-e296-4516-921e-a9ee54dae551_2400x1080.png)](https://substackcdn.com/image/fetch/$s_!B73a!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F259f50f4-e296-4516-921e-a9ee54dae551_2400x1080.png)

**1. Sell the verifier and the data to labs.** The first set of companies are building programmatic verifiers and RL environments in these domains and selling them to the labs. The usual recipe is expert humans writing rubrics for a task, where each rubric item is concrete enough to be checked programmatically, which turns a fuzzy judgment into something you can score at scale. [Mercor](https://mercor.com/), Surge, Micro1 and others are doing, this taking the rubics based approach in areas like healthcare, law and finance. [Taste Labs](https://tastelabs.com/) is another explicitly going for more subjective areas like design and “taste” that are hard to verify. They explicitly talk about how RLHF stalls because averaging everyone’s preferences leaves you with no taste at all.

**2. Formalize the domain.** Another approach is to take areas that are somewhat fuzzy and convert them into something a machine can check outright, then sell the end solution in that vertical. In math this already works: a proof written in a formal language like Lean checks itself, which is why systems like DeepMind’s AlphaProof get rewards with no human in the loop.

[Pramaana Labs](https://pramaanalabs.ai/) is pushing that idea into messier, higher-stakes work, using formal verification to make answers in regulated fields like tax, law, and healthcare provable. Every domain you manage to formalize leaves the “unverifiable” column.

**3. Own the whole loop.** Another set of companies focuses on domains where the answer is difficult to verify but can be, just not on a computer. You can’t check a new material or a drug with a rubric or a proof. You have to run the experiment. So these companies own the full loop themselves, AI proposes, a physical lab tests, and the result becomes the reward.

[Periodic Labs](https://periodic.com/), started by ex-OpenAI and DeepMind researchers, is running robotic labs to discover new materials. [Isomorphic Labs](https://www.isomorphiclabs.com/), the DeepMind drug-discovery spinout, grounds its predictions in wet-lab and ultimately clinical reality. [Lila Sciences](https://www.lila.ai/) is building autonomous labs across life and materials science. The idea here is that the verification for these systems takes place in the real world and so can be slow and expensive, but by owning the whole loop, you can ground the reward in physical reality.

RL in verifiable areas is clearly working, but the next big leap will come from approaches and companies that help bring the same advancements to the rest of the economy which is harder to verify. And just how far current RLVR approaches generalize, versus whether a new breakthrough is needed, is one of the big open questions. If you’re building in these areas, I’d love to chat!

[![Image 5: The economy by value and verifiability](https://substackcdn.com/image/fetch/$s_!1q-p!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf699086-aeca-490f-a27d-9c09bb29a8a6_2480x1456.png)](https://substackcdn.com/image/fetch/$s_!1q-p!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf699086-aeca-490f-a27d-9c09bb29a8a6_2480x1456.png)

