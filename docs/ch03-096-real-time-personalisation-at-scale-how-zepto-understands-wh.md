# Real-Time Personalisation at Scale: How Zepto Understands What You Want, Right Now

## Ch03.096 Real-Time Personalisation at Scale: How Zepto Understands What You Want, Right Now

> 📊 Level ⭐⭐ | 6.7KB | `entities/zepto-real-time-personalisation-dual-sequence-ranker.md`

## Real-Time Personalisation at Scale: How Zepto Understands What You Want, Right Now

Zepto 的实时个性化系统：双序列排序器（Dual Sequence Ranker）在高并发场景下的工程实践，涵盖特征工程、模型服务和实时推理链路。

## 核心内容

[![Image 1: Zepto Tech](https://miro.medium.com/v2/da:true/resize:fill:64:64/0*Zdo4al9KE5LuqNxm)](https://medium.com/@tech.culture?source=post_page---byline--d743b13367c8---------------------------------------)

9 min read

2 days ago

Press enter or click to view image in full size

![Image 2](https://miro.medium.com/v2/resize:fit:700/1*qxtdmR1I8cptGyc-nkzm9Q.jpeg)

Zepto started as a quick-commerce platform for groceries. Today it’s where people shop for electronics, home essentials, gifts and festive needs. The catalogue has grown dramatically, but the app is still the same screen. That same real estate now needs to serve a far wider range of intents, in real-time, to millions of users a day.

This is what makes in-session personalisation critical. A user browsing at 8 AM on a Tuesday (rushing to add staples before leaving for work) is operating very differently from the same user at 11:30 PM on a Friday, exploring snacks and beverages after a long week. While the historical user profile is identical, the immediate intent has completely shifted. To keep the shopping experience seamless, our ranking systems must instantly adapt to these context switches.

In this post, we describe the system we built to do exactly that: a real-time dual sequence ranker that combines what a user is doing right now with what they have done before and serves scores within strict milliseconds latency budgets.

## The Problem: One Screen, Many Intents

Personalisation at Zepto is never a one-size-fits-all _“Recommended for You”_ widget. Our app must seamlessly adapt to a wide spectrum of user intents in real-time from habit driven repurchases to deeply contextual cross sells.

Press enter or click to view image in full size

![Image 3](https://miro.medium.com/v2/resize:fit:700/0*-mfaXffJbzpLGxWB.png)

> **_The core issue:_**_User behaviour varies significantly across assets. A model that treats every surface the same, or compresses all interactions into a single static user vector, will overlook these differences — and those mistakes directly translate into lost conversions._

## What Came Before: And Why It Was Not Enough

Before this system, recommendation surfaces at Zepto relied on a combination of Collaborative Filtering (CF), popularity weighted ranking and cohort level models. These approaches had real strengths: they were fast to train, highly interpretable and worked well for head items and well understood user segments.

But as our catalogue expanded and user journeys became increasingly complex, three structural limitations became glaringly visible:

*   **No session awareness:** Prior systems had no visibility into what a user was doing _in the current visit_. A user who opened the app specifically to restock party supplies got the exact same ranking as a user doing a routine weekly shop.
*   **Time blindness:** CF treats interactions from three months ago the same as interactions from three days ago. For fast moving categories such as snacks, beverages and seasonal items, recency matters.
*   **Static user representation:** Compressing a user’s entire history into a single vector is a heavily lossy operation. It works for stable preferences, but completely misses the contextual signals that drive in-session decisions.

> **_The Goal:_**_Build a model that understands both who you are (long term habits) and what you are doing right now (short term session intent) — producing a deeply personalised score for every candidate Stock Keeping Unit (SKU) at inference time._

## System Overview: Architecting the Dual Sequence ReRanker

To address these historical gaps, we built a custom **Dual Sequence ReRanker** — inspired by Alibaba’s [_Deep Interest Network (DIN)_](https://arxiv.org/abs/1706.06978) and [_Behaviour Sequence Transformer (BST)_](https://arxiv.org/abs/1905.12249). Instead of relying on a static snapshot, the new architecture dynamically balances what a user _usually_ does with what they are doing _right now_.

Press enter or click to view image in full size

![Image 4](https://miro.medium.com/v2/resize:fit:700/0*vGgi1GzZnGjweRnY.png)

> **_The Architectural Edge_**_Separate encoders ensure neither time horizon drowns the other out. The model leans on history for new sessions, but instantly adapts when in-session intent is strong. Coupled with_**_target aware pooling_**_— which rebuilds the user profile per candidate item — and a_**_hybrid loss function_**_, the model captures a highly precise, context aware signal._

In production, this architecture delivered measurable bottom line improvements across our recommendation surfaces: **Conversion Lift, Tail Item Discovery and Lightning Fast Serving (P99 in low single digit ms).**

## Building Intuition: The Full Architecture

Press enter or click to view image in full size

![Image 5](https://miro.medium.com/v2/resize:fit:700/0*0htSkTuAbbgUJl25.png)

Ranker end-to-end architecture: Token enrichment (item + action + temporal), dual encoders, target aware pooling, fusion gate and ranking head.

Ranker end-to-end architecture: Token enrichment (item + action + temporal), dual encoders, target aware pooling, fusion gate and ranking head.

> **_End-to-End Execution_**_At inference, the model ingests a user’s history alongside their live in-session interactions to score a set of candidate SKUs. It encodes both timelines through separate transformer stacks, computes a candidate specific user representation via target aware pooling, dynamically blends these signals through a learned gate and outputs a final conversion probability — enriched by real-time popularity trends and calendar context._

## 1. Token Enrichment: Richer Than a Product ID

A sequence item isn’t just an ID; it’s a structured token combining three core signals:

*   **Item Embedding (128 d):** A dense SKU vector, initialised from pre-trained embeddings and fine tuned during training.
*   **Action Embedding:** Differentiates interaction types. An _Add-to-Cart (ATC)_ carries heavier 

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zepto-real-time-personalisation-dual-sequence-ranker.md)

---

