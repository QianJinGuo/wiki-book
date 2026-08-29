---
title: "MAPS: Netflix's Multimodal Asset Personalization at Scale"
source_url: "https://netflixtechblog.com/maps-netflixs-multimodal-asset-personalization-at-scale-32f96320785e"
ingested: 2026-08-29
source_published: 2026-08-28
feed_name: Netflix Tech Blog
source: rss
sha256: 7ad83f9f2c0581a8
---

# MAPS: Netflix's Multimodal Asset Personalization at Scale

_By Emma Yanyang Kong, Aditya Deshpande, Asad Abbasi, Bowei Yan, David Fagnan, Ashish Rastogi, Dhaval Patel, Ray Zhang_

## Introduction

The Netflix experience is a journey of discovery. Every visual cue, from the artwork on a title to the video previews that autoplay while you browse, is there to connect you with a story you will love. We call these visual cues _assets_, and choosing the right one for each member is a personalization problem of its own. But which image or video preview of _Squid Game_ should we show you? And what do we do right after a title launches, when there's far too little interaction data to know which asset we should recommend to each member?

For years, our models answered the first question well and the second poorly. They learned which assets members interacted with, but treated every asset as an opaque ID, blind to what was actually _in_ the artwork or video preview. Right after a title launched, its assets had no history, so we dialed up exploration on its assets to gather interaction data, and otherwise fell back to popularity heuristics that ignore your taste. Only once enough interactions had piled up could personalization take over. This is the classic **cold-start** problem.

This post shares how **multimodal embeddings** let our models see and hear the assets they recommend, so personalization can kick in far sooner, close to a title's launch. Because a new asset arrives with its embedding the model already understands, that embedding carries member taste signals from related assets immediately. Consequently, the model needs far less interaction history before it can personalize. We cover three production systems, artwork personalization, query-aware artwork ranking, and video preview personalization, plus a cheap trick for choosing new embeddings before committing to full end-to-end integration and A/B testing.

## Artwork Personalization

### Making the Model See the Artwork

We encode each artwork with **CLIP** (https://arxiv.org/abs/2103.00020), a pretrained image-text embedding model, and fold the result into how the model represents that asset, concatenating the per-asset CLIP image embedding, a 768-dimensional vector, with the asset's learned ID embedding to give an asset representation.

_e_id(a) is the asset's learned ID embedding, and e_a is its CLIP image embedding. The two are concatenated and passed through an MLP layer to give h_a, the representation the model scores against a member._

This single change transforms how the model handles a brand-new artwork. Instead of treating it as an unseen ID, the model now receives a CLIP embedding the moment the asset is created. That allows a member's preferences over visual themes, talent, and color palettes to be applied immediately, long before the asset accumulates any interactions of its own. Because those preferences are expressed in image-embedding space rather than tied to specific asset IDs, they **transfer seamlessly across titles**. If you consistently engage with artwork featuring a particular comedian, the model can carry that signal to their new title and prioritize the asset that places them front and center, even if it has never seen that exact image before. In this way, cold-start shifts from being a blind spot to something the embedding space already has an informed opinion about.

### From Five Models to One

That shift, from scoring an asset by the ID it happens to carry to scoring it by what the image actually contains, powers a second big win, model consolidation. Each title's artwork spans multiple canvases with different croppings (billboard, vertical-box, horizontal-panel, short-panel, landscape-panel), and historically we trained a separate model per canvas, since an ID-based model has no way to know that the cropped and resized renderings of one scene are related, so signal could not flow between canvases and each faced its own cold-start.

CLIP embeddings break that barrier. Because they are largely invariant to crop, resize, and aspect ratio, those near-identical renderings map to nearly the same vector. A single unified model can therefore pool interaction signal across every canvas, so a member's affinity learned on a high-traffic canvas immediately informs the artwork we pick on a sparse one. The result is one model in place of five, with the largest gains on the canvases that have the least interaction data.

### Mixing Five Canvases of Training Data

Consolidation introduced a challenge that the per-canvas models never faced: _how to effectively mix data across disparate canvases?_ The canvases differ widely in impression volume, and the interactions they log are not all worth the same to a member's long-term experience. Training on pooled raw counts would let the highest-volume canvas and the most frequent interaction types dominate, so the low-data canvases we were trying to help would benefit least.

Instead we use **reward-based weighting**, building on Netflix's long-term reward modeling. Each training example is weighted by the long-term reward score attached to its interaction type:

_a_ti is a training example, a positive interaction on asset i of title t. Its weight is set by the interaction type e observed on it, scored by ρ, that type's long-term reward._

where _e_(·) is the type of the observed positive interaction and _ρ_ is that type's long-term reward score. Because interaction types are not distributed evenly across canvases, weighting by long-term value rebalances the canvas mixture on its own, with no weight set by hand.

### A Note on Offline Evaluation

We handle evaluation with **inverse propensity scoring** (IPS) computed on a dedicated slice of _exploration_ traffic. A small fraction of traffic is served by a randomized policy that samples among a title's candidate assets from a known distribution, so the propensity of showing a given asset in a given context is logged exactly at serving time rather than estimated after the fact.

Having propensities that are known by construction, rather than modeled after the fact, is in our experience the single biggest reason our offline numbers track online outcomes. We report IPS as a ratio against the production baseline, and a candidate has to win there before it gets any A/B traffic.

### Combining Both Ideas Works Better

Two ideas are bundled together here, so we ablated them separately against the old five-model production system:

- **V1, image embeddings only.** The five per-canvas models kept as they were, each one augmented with image embeddings.
- **V2, unified model only.** A single model trained over all five canvases, but with learned ID embeddings alone and no image content.
- **V3, both together.** One unified model over all five canvases, with image embeddings in its asset representation.

In the online A/B test across all device platforms, which ran for at least four weeks, the results drew a much clearer line: _Neither idea moved our online core member metrics on its own._ V1 and V2 were both flat and non-significant, and only V3 won a statistically significant lift. It is what runs in production today.

The two ingredients need each other. V1 tells a per-canvas model what an asset looks like, but one sparse canvas has too few examples to teach it how to _use_ that. V2 supplies plenty of data, but only ID-based data, which a new asset lacks. V3 has both, so mature canvases teach the shared model how CLIP embeddings map to member preference and that mapping transfers straight to the sparse ones. The effects compound rather than add, since the V3 short-panel lift (5.691%) exceeds V1 and V2 combined.

### Cold-Start Challenge from a New UI Launch

The real test came from the product change that motivated the work. Netflix was preparing its largest TV home-screen redesign in a decade, which would make short-panel the dominant artwork canvas effectively overnight. This was a cold-start problem in its sharpest form. The canvas about to receive the most impressions had the least historical data, and waiting for short-panel interactions to accumulate would have degraded the user experience. Consolidation lets short-panel selection draw on signal pooled from every canvas, and CLIP embeddings let the unified model personalize a short-panel asset that has gathered very few interactions of its own.

We shipped V3 ahead of the launch and measured it with a month-long holdback A/B test. V3 absorbed the shift immediately, with statistically significant gains on both our core discovery metric and streaming hours, and larger gains than in the steady-state ablation.

## Query-Aware Artwork Personalization

Your general taste is the right signal when browsing, but not when _searching_. For example, when searching for a specific actor, you want artwork that features them, even if your broader taste says otherwise.

The same CLIP embeddings we added for cold-start hand us this almost for free. Because CLIP projects text and images into one shared embedding space, we can measure how well a query matches a candidate artwork directly by the cosine similarity between the CLIP text embedding of the query and the CLIP image embedding of the asset. We blend that alignment term with the usual personalization score:

Here the personalization term is the score the artwork model already produces for a member and asset, the second term compares the text embedding of the query against the image embedding of the asset, and the mixing weight _α_ between 0 and 1 is tuned through online A/B testing.

Crucially, this took no extra modeling effort. The CLIP embeddings already sit in the asset representation from the artwork work above, so they carry the text-image alignment for free.

## Personalizing Video Previews via MediaFM

Video previews raise the bar over still artwork. A video preview unfolds over time, and its appeal comes as much from motion, pacing, dialogue, and soundtrack as from any single frame.

To capture the rest, we turned to **MediaFM**, Netflix's first in-house multimodal foundation model. Trained on 80 million shots, MediaFM fuses three signals per shot into a single embedding:

- **Visual:** SeqCLIP
- **Audio:** A pretrained speech and audio embedding model
- **Text:** Captions encoded via a large-scale text model

Adopting MediaFM required no new infrastructure, since we simply integrate its shot embeddings into the asset representation, exactly as we did with CLIP embeddings for artwork.

The added modalities paid off. Both signals gave the same ordering, MediaFM > SeqCLIP > ID-only, and each step of added content awareness helped, with the gains largest on TV. Online, MediaFM came out on top too, delivering a statistically significant lift in our core streaming metric over the ID-only baseline and outperforming SeqCLIP.

### Choosing Embeddings Cheaply with a Proxy Task

New embeddings arrive constantly, but end-to-end trials are expensive. We gated the funnel with a cheap question: _From the content embedding alone, can you predict which asset wins under a plain, unpersonalized policy?_

We first select a fixed set of titles. For each title we use exploration data to find its debiased popularity winner, the asset with the highest interaction rate after we adjust for how often it was shown using its propensity score. We mark this winner with a binary label. We then train a linear probe to recover that label from the asset embedding alone, with no title, cast, or metadata.

Keeping the probe linear and embedding-only is intentional, since it isolates how much of an asset's popularity is actually encoded in the embedding. If the embedding captures the semantic drivers of popularity, a simple linear classifier should be able to identify likely winners.

All three signals, the linear probe accuracies, the offline IPS lifts, and the online A/B results, ranked MediaFM ahead of SeqCLIP. That alignment is why the linear probe now gates every new MediaFM version before release.

## The Netflix Embedding Store

None of this would be practical without shared infrastructure. Every embedding in this post, CLIP for artwork, SeqCLIP and MediaFM for video previews, lives in the **Netflix Embedding Store**, a component of Netflix's AI Platform that hosts dense embeddings for titles, games, member profiles and multimedia assets. A foundation model encodes raw asset content into a dense vector once, and the Embedding Store serves that vector to every downstream system.

Its key property is that it _decouples foundation-model updates from personalization-model deployments_. A new embedding, or a new version of an existing one, can be registered, backfilled across the catalog, and validated entirely on its own, without touching the training or serving code of any model that consumes it.

## What We Learned, and What's Next

Three lessons stood out:

1. **Pretrained CLIP embeddings** let us consolidate five artwork models into one while boosting performance on data-starved canvases.
2. **For video, multimodality wins decisively.** The audio and text signals that a purely visual encoder cannot access pushed MediaFM past SeqCLIP.
3. **A cheap proxy task yields big savings**, efficiently pruning the candidate set before running full end-to-end experiments and online A/B tests.

→ [[raw/articles/maps-netflixs-multimodal-asset-personalization-at-scale|原文存档]]
