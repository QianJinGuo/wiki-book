---
source_url: https://huggingface.co/blog/allenai/discoformer
source: newsletter
title: "DiScoFormer: One transformer for density and score, across distributions"
ingested: 2026-07-05
publish_date: 2026-07
authors: [Allen AI]
sha256: placeholder
---

# DiScoFormer: One Transformer for Density and Score, Across Distributions

Many problems in machine learning come down to the same task: given a collection of data points, recover the distribution they came from—which values are common and which are rare. This means estimating the distribution's density and its score (the gradient of the log-density).

DiScoFormer (Density and Score Transformer) introduces one model that, given a set of data points, estimates both the density and the score of the distribution in a single forward pass without retraining.

The model uses cross-attention with a shared backbone and two output heads (one for density, one for score). Score and density share a mathematical relationship: score is the gradient of the logarithm of density. This coupling provides a label-free consistency loss—at inference time, the model can adapt itself to out-of-distribution inputs by taking gradient steps on the consistency loss.

Key innovations:
- Single transformer maps an entire sample to density and score in one forward pass
- Cross-attention allows evaluation at any point, not just where data exists
- Consistency loss between density and score heads enables zero-shot out-of-distribution adaptation
- Addresses the trade-off between KDE (generalizable but poor in high dimensions) and neural score-matching (accurate but needs retraining)
