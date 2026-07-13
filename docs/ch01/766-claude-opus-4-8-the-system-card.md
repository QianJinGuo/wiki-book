# Claude Opus 4.8: The System Card

## Ch01.766 Claude Opus 4.8: The System Card

> 📊 Level ⭐⭐ | 6.1KB | `entities/claude-opus-4-8-system-card-zvi.md`

# Claude Opus 4.8: The System Card

## 深度分析

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

I don’t love that they used this as a reason to skip a bunch

## 相关实体
- [Claude Opus 47](ch01/1085-claude.html)
- [Claude 4 5 Sonnet Opus Release Notes](ch01/300-claude-4-5-sonnet-opus-release-notes.html)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践 V2](../ch03/075-claude-code.html)
- [Tokenomics The 625 Minute Rule For Claudes Cache](ch01/1085-claude.html)
- [Anthropic Long Running Agent Adversarial Architecture](ch01/893-anthropic.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-opus-4-8-system-card-zvi.md)

---

