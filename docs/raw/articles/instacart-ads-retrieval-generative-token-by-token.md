---
source: newsletter
source_url: https://tech.instacart.com/from-scoring-to-spelling-rebuilding-ads-retrieval-at-instacart-cf36b4e8d1bb
ingested: 2026-06-18
sha256: b314bf039a4d66c0c640243087e3a0500c526cb0ff689e7cf8b6107bb45258c1
---


# From Scoring to Spelling: Rebuilding Ads Retrieval at Instacart

Title: From Scoring to Spelling: Rebuilding Ads Retrieval at Instacart

URL Source: http://tech.instacart.com/from-scoring-to-spelling-rebuilding-ads-retrieval-at-instacart-cf36b4e8d1bb

Published Time: 2026-06-02T18:50:18Z

Markdown Content:
## **From Scoring to Spelling: Rebuilding Ads Retrieval at Instacart**

[![Image 1: Karuna Ahuja](https://miro.medium.com/v2/resize:fill:64:64/1*skJf3G8xjMuB55Rklo5qyA.jpeg)](https://medium.com/@karuna.ahuja1?source=post_page---byline--cf36b4e8d1bb---------------------------------------)

12 min read

Jun 2, 2026

Press enter or click to view image in full size

![Image 2](https://miro.medium.com/v2/resize:fit:700/1*HDuaesdX---nf7HiTMxXng.jpeg)

**Key Contributors: Karuna Ahuja, Marko Avdalovic, Soroush Sobhkhiz, Shrikar Archak, Xiyu Wang, Ji Chao Zhang, Hao Yan**

## Introduction

Every time a user opens Instacart, they see product recommendations: on the retailer home page, in search results, and alongside their cart. Many of these recommendations are sponsored products surfaced by a retrieval model that decides which products to show from a vast ads product catalog. A relevant ad helps users discover products they didn’t know they needed; a less relevant one generates friction.

Two years ago, we[introduced Contextual Recommendations (CR)](https://tech.instacart.com/sequence-models-for-contextual-recommendations-at-instacart-93414a28e70c), a BERT-based sequence model powering retrieval for both ads and organic recommendations across all major browse surfaces. In this post, we’ll focus on our ads retrieval. We will detail how we rebuilt the system, by moving from an encoder that scores products to a generative model that spells them out, token by token. By doing so, we unlocked a new level of contextual matching — ensuring brands appear exactly when users want them, while simultaneously opening up discovery of thousands of relevant products the previous system couldn’t retrieve.

## **Contextual Recommendations: A recap**

At its core, CR treats grocery shopping as a language modeling task, where atomic product IDs function as tokens and, the finite subset of the catalog it is trained on, acts as its ‘vocabulary’.

The model leverages the user’s real-time session, which includes product views, item page visits, and cart additions, as a sequence of these product tokens. A BERT-like transformer is then trained on millions of authentic shopping sessions to predict the next token (i.e. singular product) in the sequence. This process allows the model to learn and capture complex purchasing patterns, such as the tendency for users who add pasta and olive oil to frequently add garlic next.

This single retrieval layer replaced multiple ad-hoc systems and powers recommendation carousels across all major browse surfaces, serving both ads and organic content. At inference time, it scores every product ID in its vocabulary against the current session and returns the top K products.

For the full technical details, see our[previous blog post](https://tech.instacart.com/sequence-models-for-contextual-recommendations-at-instacart-93414a28e70c).

## When Scoring Stops Scaling

Since launching CR, we iterated on two fronts to improve the underlying model; improving the coverage of our catalog and adding more context.

First, we expanded the product vocabulary the model trains on. This helped us expand the retrieval coverage. Second, we added richer context through retailer awareness and long-term user personalization. Both the upgrades led to meaningful gains in add-to-carts and ads coverage, particularly for specialty retailers and short shopping sessions.

Each of the above improvements operated within the same fundamental architecture: score every product in a candidate set, return the top K products. However, as the catalog grew and user shopping journeys became more diverse, this architecture presented three constraints that placed a ceiling on our discovery potential, especially for our ad recommendations:

**The vocabulary bottleneck:**The CR model relies on atomic product IDs as distinct tokens, which establishes the boundaries of what the model can interpret and predict. While expanding this vocabulary enhances the model’s ability to understand the detailed context of a user’s session, it simultaneously increases model size and latency while creating data sparsity for less common items. Additionally this catalog is non-stationary. As new products are added to the catalog, the coverage gap keeps expanding. Consequently, relying solely on vocabulary expansion proved insufficient for representing the full breadth of the catalog, as specialized products often remained outside the model’s recognizable token set.

![Image 3](https://miro.medium.com/v2/resize:fit:680/1*gnKJuInuiUs0dzAoGx-xMQ.png)

**The ‘cold start’ hurdle:**To train this model, the historical shopping sessions were designed as sequences of atomic product IDs. This occasionally caused it to memorize co-occurrences instead of learning generalized associations based on the user’s intent. This resulted in the model favoring high-frequency items over newer products which are more aligned with the user’s context. For instance, while a user is building a cart toward a summer barbecue [eg: ground beef, hamburger buns, lettuce], the previous system had a tendency to default to a generic grocery staple [eg: milk] rather than surfacing an emerging brand’s condiment [eg: mustard] that fits the intent better. This collaborative filtering approach, while effective at a baseline, often lacked the responsiveness of the model to recommend products based on what the user is _actually doing right now_.

**The structural drift:** The final candidate set from the model is generated by predicting a probability distribution across the entire vocabulary of product IDs. Without a built-in hierarchy to keep the recommendations focused, the model occasionally retrieves a disjointed mix of items. For example, a breakfast-themed cart [e.g., milk, eggs, cereal] may lead to laundry detergent being retrieved along with other valid recommendations [e.g., bread, muffins]. If the subsequent ranking model was miscalibrated on these outlier products, these incoherent recommendations from the candidate set would eventually get bubbled up to the user next to a perfectly good set of recommendations.

These technical constraints ultimately limited how well we could connect users with the full breadth of our ads catalog, resulting in missing tail categories, narrower brand representation, and the occasional misaligned recommendation. We needed to rethink the product representation, the architecture, and the retrieval mechanism, not just add more features to the same model.

## Teaching the Model to Spell

Our new approach is inspired by [TIGER](https://papers.neurips.cc/paper_files/paper/2023/file/20dcab0f14046a5c6b02b61da9f13229-Paper-Conference.pdf) (Google DeepMind), a method that demonstrates a model’s ability to _generate_ the semantic tokens of the next relevant item, rather than merely scoring a predetermined set of candidates. This generative paradigm has been adopted in production by companies such as Spotify ([GLIDE](https://arxiv.org/abs/2603.17540),[NEO](https://arxiv.org/abs/2603.17533)) and YouTube ([PLUM](https://arxiv.org/abs/2510.07784)).

However, Instacart’s ad retrieval presents distinct challenges rooted in the unique nature of grocery shopping. Unlike platforms where the user’s intent is narrow, Instacart users often manage a highly diverse shopping list including items from fresh food to cleaning supplies and pet care — sometimes all within a single session. The user’s intent shifts mid-cart. Users shop across various retailers on our marketplace, each with a unique product catalog.

To address this, our model must look beyond historical purchases; it must also account for the real-time dynamics of the active shopping session. This is also where we have an opportunity to u