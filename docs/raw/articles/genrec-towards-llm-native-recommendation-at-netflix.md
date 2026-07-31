---
source: rss
source_url: https://netflixtechblog.com/genrec-towards-llm-native-recommendation-at-netflix-f20be6f643e3?source=rss----2615bd06b42e---4
ingested: 2026-07-31
feed_name: Netflix Tech Blog
source_published: 2026-07-30
sha256: 2d2a14e5b732de5950b2db02d5c347a21966f607ae9f6688b7b1831ddc8d5c76
---


# GenRec: Towards LLM-Native Recommendation at Netflix

Authors: [Ying Li](<https://www.linkedin.com/in/ying-li-94016850/>), [Arjun Rao](<https://www.linkedin.com/in/arjunra0/>), [Shradha Sehgal](<https://www.linkedin.com/in/shradha-sehgal/>)

### Introduction

Recommendations sit at the heart of the Netflix experience. Our current production models rely on thousands of hand‑crafted features over users, items, and interactions, along with specialized architectures for sequence modeling, feature interactions, and multi‑task objectives. This stack has evolved over many years to support diverse content types (movies, series, games, live, podcasts) and product surfaces, but its complexity makes it costly to onboard new use cases: adding a content type or surface can require significant feature engineering, architecture change, infrastructure work, and experimentation.

At the same time, large language models (LLMs) are changing how we think about recommendation, as shown by recent work such as [PLUM](<https://arxiv.org/abs/2510.07784>), [GLIDE](<https://arxiv.org/abs/2603.17540>), and [OneRec-Think](<https://arxiv.org/abs/2510.11639>). Their broad world knowledge and strong language understanding make it possible to represent user histories and item metadata directly as text, capture rich relationships in a shared semantic space, and steer recommendations via natural‑language prompts. However, off‑the‑shelf LLMs are still far from production‑ready recommenders: they often over‑recommend globally popular content, hallucinate out‑of‑catalog items, ignore business constraints, and provide only limited personalization.

To address this, we built **GenRec** , an LLM‑backed recommendation ranker that post‑trains an internal foundation LLM on Netflix‑specific data and objectives. GenRec shows that an LLM‑based ranker can match or exceed a mature production system while relying on far fewer labeled examples and input signals.

Figure 1: GenRec pipeline. Raw logs of user history, item metadata, and context are transformed via context engineering into natural-language prompts and fed into the GenRec, which runs on vLLM in prefill-only mode and outputs scores for each catalog item, yielding a recommendation ranking.

At a high level, GenRec:

  * Verbalizes user histories, item metadata, and context as text.
  * Post‑trains a Netflix‑adapted foundation LLM for ranking.
  * Adds a catalog‑aware scoring head over Netflix titles.
  * Uses reward signals to align with long‑term member value and business goals.
  * Runs in prefill‑only mode on Netflix’s LLM serving stack for cost efficiency.



In a large‑scale A/B test against a well‑tuned production ranker, GenRec achieves statistically significant improvements in both short‑term and long‑term online metrics, while using only a small fraction of the Phase‑2 labeled data and input signals. It reduces our reliance on hand‑engineered features and shifts the focus from **feature engineering** to **context engineering**. In this blog post, we will describe how GenRec works, how it performs, and why we believe it points toward a more LLM‑centric future for recommendation at Netflix.

### Problem Setting

We focus on a **full‑catalog ranking** **task** (or top‑ _K_ ranking when a candidate set is provided).

Given a user 𝑢, their interaction history 𝐻, and the current context 𝜏 (device, surface, locale, time, etc.), GenRec scores each item and produces a personalized ranking that can directly power recommendations or serve as input for downstream personalization systems.

Formally, we map a request (_u_ ,_τ_ ,_t_ ,_H_) — user, context, time, and history — to a ranking 𝜋 over the catalog _C_ , where _π(i)_ is the position assigned to item _i_. We optimize _π_ for **expected long‑term member utility** (a proxy for satisfaction and retention), not just short‑term engagements.

### From Foundation LLM to Recommendation Ranker

GenRec follows a **two‑phase training framework** (Figure 2):

Figure 2: Two Phase Framework. Phase 1 trains a foundational LLM on Netflix data for user and content understanding, and Phase 2 post-trains on ranking-specific data and objectives.

#### **Phase 1 — Netflix-Adapted** **Foundation LLM**.

We start from an open‑source LLM and adapt it on proprietary Netflix corpora, so it learns foundational capabilities such as

  * Netflix content understanding
  * Member behavior and preference patterns
  * General language understanding and generation.



Phase 1 is updated relatively infrequently and serves as a shared, Netflix‑aware backbone for many applications.

#### **Phase 2** — **GenRec**.

We then turn this foundation model into a high‑quality ranking model by post‑training on ranking‑specific data and objectives. Phase 2:

  * Focuses on ranking quality and steering
  * Incorporates multiple reward signals via reward‑weighted losses
  * Is refreshed more frequently to track new content and evolving tastes
  * Is explicitly optimized under serving cost constraints.



### Training Data as Conversations

Netflix members generate **hundreds of billions** of interaction events spanning many surfaces (views, plays, durations, thumbs up/down, add to list, abandons, etc.). We convert this log data into **single‑turn or multi‑turn “conversations”** between a user and a recommender. Each turn contains:

  * **User message** : verbalized context, profile, history, item metadata, and task (e.g., recommend what the user will watch or thumb next).
  * **Assistant message** : the member’s actual engagement (e.g., which titles were played, for how long, what feedback they provided).



During Phase‑2 training, the LLM learns how assistant messages depend on user messages. This allows us to express rich recommendation signals as text, jointly supporting both the language-modeling (LM) and ranking objectives.

At inference time, we feed in the verbalized context and apply a catalog‑aware scoring head to rank items; we do not decode assistant messages. The conversational format is primarily used during training to support the LM objective and preserve strong language understanding over the verbalized text.

### Verbalization and Context Engineering

Traditional recommenders operate on dense features and embeddings. GenRec takes a different approach: it **verbalizes** rich user histories and context as natural language, encoding raw interaction signals directly in the LLM’s semantic space. In doing so, it relies on the model to discover higher‑level patterns — such as item relationships and evolving user interests — rather than on manual feature engineering.

Naively verbalizing every interaction in a user’s history can quickly exceed the token budget and be too expensive at Netflix scale. The context window becomes our new “feature budget”, so we apply [**context** **engineering**](<https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>)**:**

  * **Retain in full:** high‑signal engagements (e.g., long plays, thumbs‑up) with richer details
  * **Omit:** low‑signal events (e.g., very short plays or quick hovers)
  * **Summarize or compress:** repetitive behaviors (e.g., binge‑watching )
  * **Elaborate selectively:** important or cold‑start items (e.g., new releases)



Within a fixed token budget, we prioritize recent, high‑signal history and compress or drop older history. We also structure the prompt to maximize shared prefixes for better prefix caching. The goal is a **compact, high‑information prompt** that preserves ranking quality without prohibitive costs.

### Objectives: Ranking, Language, and Rewards

The overall GenRec model is trained with a **multi‑objective loss** that combines a recommendation ranking objective, language modeling objectives, and alignment via reward‑weighted training.

#### 1\. Catalog‑Aware Ranking Objective

The primary task is a **ranking objective** that teaches the model to score items by engagement quality. We label positives using high‑value engagements (e.g., sufficiently long plays, strong explicit feedback), with thresholds and denoising logic, and train the model — via a cross‑entropy loss over the catalog or candidate set — to assign higher scores to these positives given a verbalized context.

#### 2\. Language Modeling Objective

We also retain a **language modeling (LM)** objective over the verbalized inputs and outputs. This helps preserve the model’s general language understanding, improves its ability to interpret rich natural‑language histories and item metadata, and keeps the door open for text‑generation use cases such as recommendation explanations.

#### 3\. Reward‑Weighted Loss for Alignment

Beyond raw ranking accuracy, GenRec must (1) respect business requirements — for example, balancing movies, series, games, live, and podcasts — and (2) optimize long‑term member satisfaction rather than just immediate clicks or plays.

Training only on raw interaction sequences can lead to undesirable behaviors, such as over‑favoring binge‑watching or over‑focusing on a single content type. To address this, we **weight the ranking loss** using**** signals**** from separate [reward models](<https://dl.acm.org/doi/abs/10.1145/3604915.3608873>). Each training example receives a scalar weight derived from two types of signals:

  * **Long‑term satisfaction proxies:** estimate how much a short‑term engagement contributes to long‑term outcomes, such as return behavior, catalog exploration, or sustained engagement.
  * **Behavior rebalancing:** adjust behaviors across content types and launch stages (for example, games vs. movies, new releases vs. evergreen titles) to better align with business goals.



The example’s ranking loss is then scaled by this weight: high‑value engagements receive larger weights, and low‑value ones are down‑weighted. This **reward‑weighted approach** is simpler and more cost-efficient than full reinforcement learning, yet provides effective alignment in practice. We have seen additional gains from RL‑style methods (e.g., GRPO), but leave them to future work due to their higher cost.

### Model Architecture and Serving

#### Backbone and Scoring Head

GenRec’s architecture closely follows our foundational LLM: a **decoder‑only Transformer** trained with next‑token‑prediction style objectives, augmented with a **catalog‑aware ranking head** that scores only Netflix in-catalog items. The scoring pipeline works as follows:

  1. **Verbalization:** A verbalizer _V_ serializes user history _H_ , context _𝜏_ , and relevant item metadata into a single text sequence  _x_.
  2. **Pooled representation:** The LLM processes _x,_ and we extract a pooled hidden state _h_ that summarizes the user’s current preferences and context.
  3. **Catalog‑aware scoring:** Each catalog item _i_ has a learned embedding _eᵢ_. A scoring head _ϕ_ combines _h_ and _eᵢ_(e.g., via dot product or small MLP) to produce a score s _ᵢ_. Applying a softmax over scores yields a probability distribution which we convert into a ranking _π_.



All parameters — the backbone, scoring head, and item embeddings — are trained jointly. For very large catalogs, we can use sampled softmax or candidate sets for efficient training and inference. This architecture constrains recommendations to the Netflix catalog while supporting efficient scoring over large candidate sets.

#### Serving and Cost Optimization

GenRec is served on [Netflix’s internal LLM stack](<https://netflixtechblog.com/in-house-llm-serving-at-netflix-a5a8e799ea2c>) using vLLM. At Netflix scale, serving cost is driven primarily by 1) Model size; 2) Context length; 3) Inference mode (prefill vs. autoregressive decoding). We control cost through three strategies:

  * **Smaller / distilled models:** We train GenRec on smaller or distilled foundation models, often with larger or more targeted datasets, to capture most of the quality of larger models at lower serving cost.
  * **Aggressive context compaction:** Using the context engineering described earlier, we minimize tokens while preserving ranking quality.
  * **Prefill‑only inference:** Autoregressive decoding over large candidate sets would be prohibitively expensive. Instead, we run in prefill‑only mode: the model consumes the prompt once and scores the entire candidate set in a single forward pass, with no token‑by‑token decoding.



Together, these choices make it feasible to serve GenRec on high‑volume workloads within compute budgets.

### Offline and Online Experiments

We evaluated GenRec against a **mature production ranker** that has been tuned over many years. The baseline model relies on thousands of engineered dense and embedding features, as well as custom architectures for modeling feature interactions and sequences. We assessed performance using both offline evaluation metrics and a large‑scale online A/B test.

#### GenRec vs Production Baseline

**Offline** , GenRec outperformed the production ranker on ranking metrics despite using far fewer input signals and labeled examples. With roughly **40× fewer Phase‑2 labeled training examples** , GenRec achieved about **+1.6%** **improvement** in Mean Reciprocal Rank (MRR). As we increased Phase‑2 training data and enriched the input signals, GenRec’s offline metrics continued to improve.

**Online** , we ran a large A/B test on batch‑compute recommendation surfaces, covering **~10% of Netflix traffic** over ~4 weeks. In this low‑data, low‑signal configuration, GenRec delivered **statistically significant gains** over the production baseline on both short‑term and long‑term online metrics (Figure 3).

These results indicate that a properly post‑trained and aligned LLM‑backed ranker can be a strong alternative to traditional recommendation models, with substantial headroom as we further scale data and input signals.

Figure 3: Online metrics of GenRec vs. production model. GenRec achieves statistically significant improvements on both short-term and long-term online metrics.

#### Data, Model, and Phase Contributions

We ran ablations to understand where GenRec’s gains come from.

**Data and Model Scaling**

  * **Data scaling:** For both ~1B and ~10B parameter backbones, offline MRR improves as we increase Phase‑2 post‑training data. Larger models reach higher absolute MRR but follow a similar scaling curve (see Figure 4).
  * **Model scaling:** Under a fixed training budget, we post‑trained GenRec variants from ~1B to ~10B parameters. Within this budget, larger backbones consistently achieved higher offline MRR than smaller ones.

Figure 4: GenRec Phase-2 data scaling for the∼10B model.

**Phase-1 vs. OSS, Phase-2 vs. Phase-1**

  * **Phase-1 vs. OSS:** Using the Phase‑1 Netflix‑adapted foundation LLM as the base model improves offline ranking metrics by roughly **10–20%** compared to starting directly from an off‑the‑shelf LLM.
  * **Phase-2 vs. Phase-1:** Phase‑2 post‑training adds another **35–50%** gain in offline ranking metrics when evaluated near the Phase‑1 training cutoff (i.e. when Phase‑1 model is the freshest). As time passes and Phase‑1 becomes stale with new content and shifting tastes, the relative benefit of Phase 2 grows to about 80% after 2 weeks.



**Data efficiency vs. production ranker**

  * Starting from a strong Phase‑1 model, GenRec matches or exceeds the production ranker using **10–40× fewer** **Phase‑2 labeled examples** , depending on configuration. This marginal data efficiency is especially valuable because Phase 2 is refreshed far more frequently than Phase 1.



#### Context Length Optimization

Context length drives both **quality** and **cost** : longer verbalizations expose more behavior and context but increase training and serving cost. To study this trade‑off, we varied context length and verbosity and optimized them in three steps:

  1. **Clean and compress events:** drop low‑signal engagements and compress repetitive behavior to form a cleaned sequence of events.
  2. **Find the “elbow point”:** vary how many historical events we include and plot MRR vs. number of events to identify an elbow beyond which additional context yields diminishing returns (see Figure 5).
  3. **Optimize verbosity:** for the retained events, test different levels of details and simplified wordings, measuring MRR each time.



In our experiments, we can reduce the context tokens to roughly **one-third** of the original budget with **negligible degradation** in offline ranking metrics. Since serving cost is approximately proportional to context length, we observed a similar reduction in serving cost.

Figure 5: Offline ranking metric (MRR) vs. number of user engagement events included in the prompt. The dashed line marks the elbow point: increasing the number of events beyond this yields diminishing returns.

### Towards LLM‑Native Recommendation

GenRec is more than “swapping in a Transformer” for an existing ranker. It hints at a broader shift toward **LLM‑native recommendation** at Netflix. A few notable changes:

#### From Feature Engineering to Context Engineering

Traditional RecSys stacks revolve around large feature sets and heavy feature infrastructure. LLM‑centric systems instead revolve around **constructing rich textual contexts** from raw logs, metadata, and tools. The “prompt” becomes the new feature vector.

Modeling effort shifts from designing features to deciding **which signals to include, how far back in time to go, how to compress or summarize history within a token budget**. Our experiments on verbalization compaction illustrate this shift: careful context design can preserve quality while dramatically reducing serving cost.

#### From Customized Architectures to Foundation Backbones

Historically, each recommendation task often had its own custom architecture (two‑tower models, DLRM‑style networks, bespoke attention blocks). In an LLM‑centric world, many tasks share a **common foundation backbone** , with differentiation coming from data and verbalization strategies, post‑training objectives and rewards, and inference optimization.

GenRec leverages the same backbone as our foundation LLM rather than introducing a new architecture built from scratch. This makes it easier to share learnings across applications, and opens the door to **natural‑language steering** for future experiences.

#### Scaling Laws as Design Guides

Traditional RecSys can hit diminishing returns due to sparse IDs, heavy engineering objectives, and task‑specific architectures. With an LLM‑backed backbone, recommendation inherits clearer **data and model scaling behavior** : within cost limits, more data and larger models consistently improve quality. This brings RecSys design closer to the broader LLM paradigm, where **scaling laws** help guide model and data investment.

#### From RecSys Infra to LLM Infra

LLM‑backed recommenders push us toward **LLM‑style infrastructure** : GPU‑accelerated, vLLM/Triton‑based, with careful batching and caching. Over time, recommendation serving infra starts to look more like general LLM infra than classic RecSys stacks built around MLPs or factorization models.

### Conclusions

We have presented **GenRec** , an LLM‑backed recommendation ranker at Netflix that adapts an internal foundation LLM for large‑scale personalization. By verbalizing user histories, context, and item metadata, adding a catalog‑aware ranking head, using reward‑weighted objectives aligned to long‑term satisfaction and business goals, and serving efficiently on our LLM infrastructure, we obtain a model that **improves on a strong production ranker while using far fewer Phase‑2 labels and input signals**.

GenRec is an early but promising step toward a more **LLM‑centric recommendation stack** at Netflix. Our results suggest that, with careful attention to cost, infrastructure, and alignment, LLM‑backed recommenders can play a central role in large‑scale personalization.

### Acknowledgments

GenRec is the result of close collaboration among multiple teams and organizations across Netflix. The contributors to this work (in alphabetical order):

**AI for members:** Arjun Rao, Ashish Rastogi, Baolin Li, Fernando Amat Gil, Grace Huang, Justin Basilico, Kamelia Aryafar, Linas Baltrunas, Moumita Bhattacharya, Ogheneovo Dibie, Rein Houthooft, Shradha Sehgal, Sejoon Oh, Sergi Perez, Sourabh Medapati, Thea Wang, Yaochen Zhu, Yesu Feng, Ying Li, Yun Li, Yucheng Shi, Yunan Hu

**AI platform and serving:** Abhishek Agrawal, Adam Singer, Binh Tang, Daneo Zhang, Derek Olejnik, Ed Maddox, Erik Osheim, Lingyi Liu, Liping Peng, Meghana Chilukuri, Nicolas Hortiguera, Shaojing Li, ZQ Zhang

**Product:** Ilke Kaya, Michelle Kislak, Scarlet Chen, Si Cheng

* * *

[GenRec: Towards LLM-Native Recommendation at Netflix](<https://netflixtechblog.com/genrec-towards-llm-native-recommendation-at-netflix-f20be6f643e3>) was originally published in [Netflix TechBlog](<https://netflixtechblog.com>) on Medium, where people are continuing the conversation by highlighting and responding to this story.
