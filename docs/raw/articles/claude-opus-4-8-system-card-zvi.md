---
title: "Claude Opus 4.8: The System Card"
source_url: https://thezvi.wordpress.com/2026/05/29/claude-opus-4-8-the-system-card/
ingested: 2026-06-02
tags: [claude, anthropic, system-card, evaluation]
sha256: 984649432da685c863d52b34eab658494970e821c2be8cff4acde24ed4f734f0
---

# Claude Opus 4.8: The System Card


Published Time: 2026-05-29T20:50:28+00:00

Markdown Content:
Only six weeks after Opus 4.7, we have Opus 4.8.

For everyone, that means another incremental upgrade to Claude. It is once again smarter, and can do tasks for longer, and comes with a number of hot new features.

For me, that also means reading another 244 page system card.

It was only April 20 when I did [a full review of the Opus 4.7 system card](https://thezvi.substack.com/p/opus-47-part-1-the-model-card), plus an additional post focusing on related issues of model welfare.

These updates are incremental and coming more rapidly, and this still is below the capability level of Claude Mythos, so the focus will be on the delta. What is different about Opus 4.8 versus what we already know about Opus 4.7 and Mythos?

It turns out there’s still a lot to talk about.

![Image 1](https://substackcdn.com/image/fetch/$s_!tQ35!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe3c074ff-0931-4719-9477-66ff00b4d977_2752x1536.jpeg)

Image created as self-portrait for this post by Claude Opus 4.8

#### Table of Contents

1.   [Here We Go Again: Executive Summary.](https://thezvi.substack.com/i/199668071/here-we-go-again-executive-summary)
2.   [Introduction (1).](https://thezvi.substack.com/i/199668071/introduction-1)
3.   [RSP Evaluations (2).](https://thezvi.substack.com/i/199668071/rsp-evaluations-2)
4.   [Move That Goalpost.](https://thezvi.substack.com/i/199668071/move-that-goalpost)
5.   [The Failures Are News.](https://thezvi.substack.com/i/199668071/the-failures-are-news)
6.   [Alignment Risk Slowly Rises.](https://thezvi.substack.com/i/199668071/alignment-risk-slowly-rises)
7.   [New Risk Pathways Just Dropped.](https://thezvi.substack.com/i/199668071/new-risk-pathways-just-dropped)
8.   [Cyber (3).](https://thezvi.substack.com/i/199668071/cyber-3)
9.   [Harmful Requests (4.1).](https://thezvi.substack.com/i/199668071/harmful-requests-4-1)
10.   [We Need To Talk (4.2 and 4.3).](https://thezvi.substack.com/i/199668071/we-need-to-talk-4-2-and-4-3)
11.   [Overcoming Bias (4.4).](https://thezvi.substack.com/i/199668071/overcoming-bias-4-4)
12.   [Agentic Safety (5).](https://thezvi.substack.com/i/199668071/agentic-safety-5)
13.   [Prompt Injection (5.2).](https://thezvi.substack.com/i/199668071/prompt-injection-5-2)
14.   [Alignment (6).](https://thezvi.substack.com/i/199668071/alignment-6)
15.   [Looking For Problems.](https://thezvi.substack.com/i/199668071/looking-for-problems)
16.   [Who Watches The Training (6.2.2).](https://thezvi.substack.com/i/199668071/who-watches-the-training-6-2-2)
17.   [Automated Behavioral Audit.](https://thezvi.substack.com/i/199668071/automated-behavioral-audit)
18.   [The Model Is Smarter Than The Eval (6.2.3.2).](https://thezvi.substack.com/i/199668071/the-model-is-smarter-than-the-eval-6-2-3-2)
19.   [You Should See The Other Guy.](https://thezvi.substack.com/i/199668071/you-should-see-the-other-guy)
20.   [UK AISI Testing (6.2.4).](https://thezvi.substack.com/i/199668071/uk-aisi-testing-6-2-4)
21.   [In Vendbench (6.2.5).](https://thezvi.substack.com/i/199668071/in-vendbench-6-2-5)
22.   [Honesty (6.3.3 to 6.3.6).](https://thezvi.substack.com/i/199668071/honesty-6-3-3-to-6-3-6)
23.   [Chain of Thought (CoT) Monitorability (6.5).](https://thezvi.substack.com/i/199668071/chain-of-thought-cot-monitorability-6-5)
24.   [What’s In The Box? (6.6).](https://thezvi.substack.com/i/199668071/what-s-in-the-box-6-6)
25.   [That’s All For Now.](https://thezvi.substack.com/i/199668071/that-s-all-for-now)

#### Here We Go Again: Executive Summary

Again, this is my summary of their summary, plus additional key points.

1.   Mythos still exists, so it is unsurprising this did not set off the RSP triggers.
2.   Cyber capabilities are better than 4.7 but still well behind Mythos. Mythos seems to be an outlier in its cyber capabilities, relative to its other capabilities.
3.   Other capabilities are also better than 4.7 but still behind Mythos.
4.   Honesty is improved quite a bit across the board, especially agentic honesty.
5.   Mundane safety is, in all key aspects, as good or better for 4.8 than for 4.7.
6.   Mundane alignment is also robustly as good or better for 4.8 than for 4.7.
7.   There was some backsliding on prompt injections, computer use and adversarial situations, likely due to taking out training on this to avoid dishonesty.
8.   The ‘can you pull off various underhanded tasks’ tests still failed, although if it was properly underhanded you would see that, wouldn’t you?
9.   Anthropic evaluates the model welfare situation as good.

#### Introduction (1)

Standard training disclosures. No changes.

#### RSP Evaluations (2)

Because Mythos exists there is no new Risk Report for Claude Opus 4.8. Fair.

They go over the evals and keep saying ‘Mythos is better.’ Again, reasonably fair.

I don’t love that they used this as a reason to skip a bunch of the manual testing, as I think it is important to have good habits and get the reps in, but I get it. We have enough evidence that Opus 4.8 is not substantially adding to CBRN risks in a world that will soon also have Mythos.

I continue to worry that a lot of these evals look like the models have a lot of capability, or have been saturated, or both, as discussed for previous model cards.

We also have to worry about potential double counting, where the more advanced model, here Mythos, was too dangerous to release and thus wasn’t released, but then this justifies not needing marginal precautions for a different model, here Opus 4.8. I don’t think that is the case here, and that Mythos was judged to be fine except for cyber, but it is a pattern to watch for.

#### Move That Goalpost

The RSP has been updated to v3.3, which I hadn’t otherwise notice, so thanks to them for pointing this out here and also I’m sad they didn’t do more to alert us elsewhere.

This changes the description of the novel biological/chemical threat model from ‘significantly help threat actors’ in general, to only ‘functionally substitute for scarce human expertise’ of world-leading specialists, in particular. Any other capability no longer counts, and it is presumed that (1) this is the only bottleneck that counts and (2) that this is indeed required for a novel pathogen.

This is a strictly harder threshold to pass, so this is another weakening of the RSP. The actual RSP v3.3 correctly calls this a revision. The system card calls it a clarification, which is not a good description.

I think, [and Claude Opus 4.8 thinks](https://claude.ai/share/49ae65ec-61e6-4cb9-a865-c8e0cbd73569), that Anthropic’s explanation and new threat model are more or less bullshit. Yes, the lack of a Nobel-caliber virologist is one potential barrier, but there are many other barriers that add up to form a de facto defense-in-depth, and also it is not obvious you need this caliber virologist. I certainly presume that, as a thought experiment, a well-funded nation state operation would have a chance of doing this with only a group of second-tier virologists. The new rule also says the team needs to be able to do the whole thing end-to-end, which also is not obviously required.

I do think Anthropic ‘knows what it is doing’ here. While I disagree with the decision, and think they are setting the new bar too high, I see why one might take the new position. I do take issue with their framing.

I would also hope that, if Opus 4.8 in particular crosses the old but not the new threshold, that they would say this explicitly, even if they decide that This Is Fine. My understanding is that this is not the case.

#### The Failures Are News

In 2.3.3, Anthropic shows examples of when Opus 4.8 falls short of a human researcher.

That’s a pretty crazy section to need to include.

It is even crazier that this mostly requires particular failure modes: Fabrication, instruction following failure, cheap verificati
