---
created: '2026-06-07'
feed_name: Interconnects
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: strong
review_value: 9
sha256: 8673e69027c15f9ac7f29250dec784b7ac5a0e1a6a516bf49a27f8cfdf91cee7
source: rss
source_url: https://www.interconnects.ai/p/what-ive-been-building-atom-report
tags:
- article
title: 'What I’ve been building: ATOM Report, post-training course, finishing my book,
  and ongoing research'
type: source
updated: '2026-06-07'
---

# What I’ve been building: ATOM Report, post-training course, finishing my book, and ongoing research

This post is a roundup of my recent efforts that did not warrant a standalone Interconnects post, why I’m spending time on them, and what they accomplished.

  1. [The ATOM Report: Measuring the Open Language Model Ecosystem](<https://www.interconnects.ai/i/194224428/1-the-atom-report-measuring-the-open-language-model-ecosystem>)

  2. [RLHF Book is done & ready for pre-order!](<https://www.interconnects.ai/i/194224428/2-rlhf-book-is-done-and-ready-for-pre-order>)

  3. [A post-training course I’m making](<https://www.interconnects.ai/i/194224428/3-a-post-training-course-im-making>)

  4. [Recent technical research](<https://www.interconnects.ai/i/194224428/4-recent-technical-research>)




[Share](<https://www.interconnects.ai/p/what-ive-been-building-atom-report?utm_source=substack&utm_medium=email&utm_content=share&action=share>)

## 1\. The ATOM Report: Measuring the Open Language Model Ecosystem

<https://arxiv.org/abs/2604.07190>

To accompany The ATOM Project [memo](<https://atomproject.ai/>), arguably a manifesto, making the case for investment in open models in the U.S. – originally launched in August 2025 – we’ve released an updated technical report with our latest data, analysis, and storytelling within the open language model ecosystem. The ATOM Report is dense with the methods Florian and I use to keep track of the open ecosystem. It covers GPT-OSS’s rise, inference market share, the influence of China’s mid-tier players like Moonshot, Z.ai, & MiniMax, signs of the U.S.’s progress on open models, and much more.

[](<https://substackcdn.com/image/fetch/$s_!JZNn!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89b0ff17-1243-46dd-a81e-96c975f20a7b_2582x1992.png>)

In particular, the paper details our updates to the [Relative Adoption Metric (RAM)](<https://atomproject.ai/relative-adoption-metric>), which we use to evaluate the adoption of recent models in a time-varying and size-normalized manner. Here’s a sampling of recent, primarily Chinese, models on the RAM score. The RAM score is designed so that a score >1 indicates a model is, at that point in time, on track to be a top 10 most downloaded model of its size category, ever. It reduces a messy landscape to one, easily interpretable number!

[](<https://substackcdn.com/image/fetch/$s_!TeBR!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6ef64b7a-04f2-4ed8-9cc4-966b775e9f59_1918x1336.png>)

We used the data to also analyze the recent [Gemma 4](<https://www.interconnects.ai/p/gemma-4-and-what-makes-an-open-model>) release, which is showing incredible early adoption numbers. We’ll stay tuned on it!

[](<https://substackcdn.com/image/fetch/$s_!u86h!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb9e2abfe-443e-48e8-bfda-bb5855dee388_1936x1056.jpeg>)

Subscribe to the (infrequent) [ATOM Project Substack](<https://atomproject.substack.com/>) for more updates like this!

## 2\. RLHF Book is done & ready for pre-order!

<http://rlhfbook.com/>

The goal of this book was to write the book I wished I had when I was getting started in post-training language models. This project has been on my mind for a long time. I bought the domain rlhfbook.com and started to take it more seriously on May 20th, 2024. Here we are!

Last week, it was sent to production with the Manning team. This means content edits are done, and it’ll be sent to print in ~2 months. In the meantime, I’m spending my time developing the accompanying code and course (more on that below).

You can preorder on [Amazon](<https://amzn.to/4cwCDJQ>) or [Manning](<https://www.manning.com/books/the-rlhf-book>) (currently cheaper).

[](<https://substackcdn.com/image/fetch/$s_!Bv0Q!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2d8ba64-922d-4000-9d57-12cb5524a238_1200x675.jpeg>)

## 3\. A post-training course I’m making

<https://rlhfbook.com/course>

The goal of my book is for it to be the central resource for people looking to transition from beginner to expert in post-training. It’s not necessarily an entry-level book, but as AI models become stronger, it needs to be a _community_ -building effort as well. The first step I’ve made to expand the scope from just a book to a complete learning experience is building a lecture series. The lectures will be freely available on YouTube and incorporate community questions & answers (as standalone videos in between lectures).

You can watch the first batch of videos below, and subscribe on YouTube for future ones. I’m going to build on the book platform more this summer, as I develop the book [codebases](<https://rlhfbook.com/code>) and host in-person events.

  * [Welcome video & YouTube playlist](<https://www.youtube.com/watch?v=jQPiH-KB4B0&list=PLL1tdVxB1CpVpEtMHxwuR4uI4Lxjw00_y&index=3>)

  * [RLHF and Post-training Overview | RLHF Book Course, Lecture 1](<https://youtu.be/o6l6tJQgUg4>)

  * [RLHF Foundations, IFT, Reward Modeling, Rejection Sampling | RLHF Course Lecture 2](<https://youtu.be/4gIwiSPmQkU>)

  * [Understanding Policy Gradient Algorithms for RL on LLMs | RLHF Course Lecture 3](<https://youtu.be/K_Sj_-1BUMM>)

  * [Implementing RL Algorithms for LLMs | RLHF Course Lecture 4](<https://youtu.be/i-AIMpZHgeg>)




[](<https://substackcdn.com/image/fetch/$s_!VS0r!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb238c68c-d7f4-4b2b-97fa-9a3cf773e72b_1280x720.png>)

## 4\. Recent technical research

Long-time followers of Interconnects know that this blog has its roots in explaining fundamental research in the field. This has immense value in two ways. First, as AI moves incredibly fast, far more people need to be able to parse research to make the right bets on the technology. Research is the only early warning of some big changes coming. Second, it helps uplift the careers of my collaborators – the people I spend my life with! On that note, check out two papers I had the privilege of being part of below.

<https://arxiv.org/abs/2603.16759> -_TurnWise: The Gap between Single- and Multi-turn Language Model Capabilities_ ,__ Graf et al. 2026

This work explores the strengths of various models in multi-turn dialogue settings, how to create training data to improve it, and other quirks in post-training. My interests here have fully shifted to agents, where I see multi-turn interactions as a very important user interface problem — what information do I show to the user to solve the task as soon as possible without cutting corners?

<https://arxiv.org/abs/2603.11327> \- _Meta-Reinforcement Learning with Self-Reflection for Agentic Search_ , Xiao et al. 2026

This paper frames solving hard problems with RLVR as a meta-learning problem, where context from previous attempts should be used to inform future rollouts. It’s a very obvious idea in some ways, where most of RL for LLMs is still very on-policy, but naive. The models learn from recent trials in parameters, but not in context. This research feeds into a ton of other recent work on ways that RL can be formulated to solve different forms of continual learning. Another great related paper is _[Learning to Discover at Test Time](<https://arxiv.org/abs/2601.16175>)._

* * *

[Leave a comment](<https://www.interconnects.ai/p/what-ive-been-building-atom-report/comments>)

I’m off to China (and then hopefully DC) in the next couple of months to learn even more about how the world sees progress in AI. I’m excited to talk to a broader range of people than I tend to in my focused technical job. Thanks for reading, as always!
