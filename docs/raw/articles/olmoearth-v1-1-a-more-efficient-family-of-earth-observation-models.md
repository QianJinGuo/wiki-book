---
title: OlmoEarth v1.1: A more efficient family of Earth observation models
type: raw
source: rss
source_url: https://huggingface.co/blog/allenai/olmoearth-v1-1
fetcher: jina
ingested: 2026-05-21
sha256: cb1323ba54f8
review_value: 9
review_confidence: 8
---

# OlmoEarth v1.1: A more efficient family of Earth observation models


Published Time: 2026-05-19T18:38:09.563Z

Markdown Content:
[Back to Articles](https://huggingface.co/blog)

[![Image 1: Kyle Wiggers's avatar](https://huggingface.co/avatars/fee5cceec7536851d7c6712760716a71.svg)](https://huggingface.co/Ai2Comms)

*   [Increasing efficiency by decreasing sequence lengths](https://huggingface.co/blog/allenai/olmoearth-v1-1#increasing-efficiency-by-decreasing-sequence-lengths "Increasing efficiency by decreasing sequence lengths")

*   [Designing the token](https://huggingface.co/blog/allenai/olmoearth-v1-1#designing-the-token "Designing the token")

*   [For developers](https://huggingface.co/blog/allenai/olmoearth-v1-1#for-developers "For developers")

*   [For researchers](https://huggingface.co/blog/allenai/olmoearth-v1-1#for-researchers "For researchers")

*   [Get started](https://huggingface.co/blog/allenai/olmoearth-v1-1#get-started "Get started")

🧠 Models: [https://huggingface.co/collections/allenai/olmoearth](https://huggingface.co/collections/allenai/olmoearth) | 📄 Tech Report: [https://allenai.org/papers/olmoearth_v1_1](https://allenai.org/papers/olmoearth_v1_1) | 💻 Code: [https://github.com/allenai/olmoearth_pretrain](https://github.com/allenai/olmoearth_pretrain)

[![Image 2: OlmoEarth v11 blog and social copy - Google Docs-image-1](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/4Nsn7CxsnxPkVfK5BsCHN.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/4Nsn7CxsnxPkVfK5BsCHN.png)

We released OlmoEarth (v1) in November 2025. Since then, partners have applied it across a wide range of tasks, from tracking mangrove change to classifying drivers of forest loss to producing country-scale crop-type maps in days, scaling deployments to national, continental, and global areas. Every release moves us closer to our mission: bringing state-of-the-art AI to organizations and communities working to protect people and our planet.

When [OlmoEarth](https://olmoearth.allenai.org/) processes satellite imagery to make predictions across tens to hundreds of thousands of square kilometers, efficiency shapes what’s possible. Over the full lifecycle of running OlmoEarth – data export, preprocessing, inference, and post-processing – compute is by far the highest cost. A more efficient model means we can support more partners on the OlmoEarth Platform, and that anyone running OlmoEarth on their own can leverage this technology faster and at lower expense.

That’s why we built **[OlmoEarth v1.1](https://huggingface.co/collections/allenai/olmoearth)**: a new family of models that cuts compute costs by up to **3x** while maintaining OlmoEarth v1's performance on a mix of research benchmarks and tasks we’ve constructed with partners.

### [](https://huggingface.co/blog/allenai/olmoearth-v1-1#increasing-efficiency-by-decreasing-sequence-lengths) Increasing efficiency by decreasing sequence lengths

The OlmoEarth models are transformer-based models, one of the dominant architectures in machine learning today. To process remote sensing data, we first convert it into a sequence of _tokens_ the model can ingest.

Two important levers control efficiency in transformer-based models: **model size** (this is why we release a family of models, so users can pick the size that fits their compute budget) and **token sequence length**. Compute costs scale quadratically with the token sequence length, so even small reductions can meaningfully cut the cost of running the model.

[![Image 3: bench-capture-2026-05-18T14-40-39](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/E_EJ2q5ZLbGn2dZ4j92r_.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/E_EJ2q5ZLbGn2dZ4j92r_.png)

_MACs, or multiply-accumulate operations, estimate the computation needed for one model forward pass; lower MACs generally mean cheaper, faster inference. The y-axis is inverted because lower average rank is better. Labels show model family and size. All plotted points use the pasted MAC/rank values._

### [](https://huggingface.co/blog/allenai/olmoearth-v1-1#designing-the-token) Designing the token

This raises an important question for transformer-based remote sensing models: **what should a token represent?**

Take Sentinel-2 imagery, a common modality we process. A Sentinel-2 input will be some tensor with a height and width (H, W representing the latitudinal and longitudinal pixels), a temporal dimension T, and 12 Sentinel-2 channels ([H, W, T, D=12]).

[![Image 4: OlmoEarth v11 blog copy - Google Docs-image-3](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/mPjOTX0JVZij1-6q2DFLY.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/mPjOTX0JVZij1-6q2DFLY.png)

Currently, we split the data into _resolution-based patches._ Concretely, this means that we will pick some spatial patch size p, and split our overall Sentinel-2 image into patches of size p x p:

[![Image 5: OlmoEarth v11 blog and social copy - Google Docs-image-4](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/-OzFWBJPTKBDXOJR2Iguw.png)](https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/-OzFWBJPTKBDXOJR2Iguw.png)

For each patch, we create a token per timestep per resolution. So a Sentinel-2 input with 2 timesteps yields 6 tokens per patch (2 timesteps x 3 resolutions, 10m, 20m, and 60m).

In total, a[H, W, T, D=12] Sentinel-2 input will yield H/p x W/p x T x 3 tokens.

Using a unique token per resolution is a common technique when processing Sentinel-2 data—[Galileo](https://arxiv.org/abs/2502.09356) and [SatMAE](https://arxiv.org/abs/2207.08051) both take this approach, and SatMAE shows significantly better results when doing it. However, it is not universal: [CROMA](https://arxiv.org/abs/2311.00566) is a model that only uses a single token for all bands, regardless of resolution. Because token counts compound multiplicatively, collapsing resolutions into a single token produces **three times fewer tokens** and material savings across pretraining, fine-tuning, and inference.

Naively combining the tokens in this way leads to significant performance drops, including a 10 ppt drop on m-eurosat kNN (a common benchmark task for remote sensing models). We hypothesize that separating Sentinel-2 bands into different tokens makes it easier for OlmoEarth to model important cross-band relationships.

Merging tokens **without** impacting performance required us to modify our pre-training regimen. We describe those changes in detail in our paper.

### [](https://huggingface.co/blog/allenai/olmoearth-v1-1#for-developers) For developers

The result is a model family that does more with less. At every size, OlmoEarth v1.1 runs up to three times cheaper than OlmoEarth v1, making frequent, planet-scale map refreshes more affordable for every team running OlmoEarth. If you're using a model from the original OlmoEarth family, try OlmoEarth v1.1. It provides similar performance to OlmoEarth v1 while requiring one third of the compute, though we have seen some regressions (see our technical report for more details). If it works for your task, you should see a significant speedup during fine-tuning and inference.

### [](https://huggingface.co/blog/allenai/olmoearth-v1-1#for-researchers) For researchers

Pretrained remote sensing models have many degrees of freedom, which makes them hard to study. When performance shifts, is it the architecture, the dataset, or the pre-training algorithm?

We train OlmoEarth v1.1 on the same dataset as OlmoEarth v1, so any differences between the two isolate the effect of methodological changes. We hope this advances understanding of scientific principles when pretraining models for remote sensing.

### [](https://huggingface.co/blog/allenai/olmoearth-v1-1#get-started) Get started

Check out the OlmoEarth v1.1 [weights](https://huggingface.co/collections/allenai/olmoearth) and [training code](https://github.com/allenai/olmoearth_pretrain), including the weights for our Base, Tiny, and Nano models.

