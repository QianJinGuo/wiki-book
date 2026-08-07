---
source: newsletter
source_url: https://arxiv.org/abs/2608.05000
ingested: 2026-08-08
sha256: a1f3c9d2e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
---

# Towards Physics of Multimodal Pretraining: Knowledge Flow, Modality Synergy, Early Unification, and Recipes

**arXiv: 2608.05000 [cs.CV]** — Submitted 5 Aug 2026 (v1), revised 6 Aug 2026 (v2)
**Authors**: Junlin Han, Shengbang Tong, David Fan, Minghao Chen, Philip Torr, Filippos Kokkinos, Mike Lewis
**Subjects**: Computer Vision and Pattern Recognition (cs.CV); Machine Learning (cs.LG); Multimedia (cs.MM)

## Abstract

Vision offers a critical axis for advancing foundation models, driving a shift towards natively unified multimodal pretraining. Despite this momentum, the design space and the fundamental mechanisms of how modalities interact during unified training remain underexplored. We provide empirical clarity through a systematic exploration of multimodal pretraining. Our controlled experiments on both synthetic and large-scale real-world datasets yield four key insights into the physics of multimodal pretraining:

**(i) Knowledge Flow**: We disentangle how language, visual understanding, and visual generation transfer knowledge across modalities, revealing distinct patterns of influence and asymmetry;

**(ii) Synergy vs. Competition**: We show that data "complexity" largely determines whether modalities are synergistic, identify architectural choices that promote synergy — such as shared attention and normalization with modality-specific feed-forward layers — and find that these behaviors generalize across different visual tokenizer designs;

**(iii) Early Unification**: Unifying modalities from the very early stages and training them jointly is shown to be more effective than late alignment or sequential training. This process uncovers a *vision laziness* phenomenon, where delayed integration leads models to rely on language priors;

**(iv) Recipes**: We derive efficient pretraining recipes that achieve strong generative performance using only 5% of the compute budget.

These core findings are subsequently validated at scale by training multiple 13.5B MoE models on 2T tokens. We hope this study provides a principled foundation for understanding and scaling multimodal pretraining.
