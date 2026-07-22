---
title: "Count Anything"
source_url: "https://arxiv.org/abs/2605.30846"
ingested: 2026-06-16
sha256: "80a63b48d021f48a4c596ee19b8c5dcb5aca0894b6234503dc1b9b04ff1ee4bd"
tags: [arxiv, paper, vision, counting, object-detection]
confidence: 0.7
provenance_state: extracted
review_value: 7
review_confidence: 7
review_stars: 4
---

# Count Anything

> Source: https://arxiv.org/abs/2605.30846 - Ingested 2026-06-16
> Score: v=7, c=7, vxc=49, stars=4

## Abstract


Published Time: Mon, 01 Jun 2026 00:30:25 GMT

Markdown Content:
## Title:Count Anything

[View PDF](http://arxiv.org/pdf/2605.30846)

> Abstract:Object counting remains fragmented across domain-specific datasets and task formulations, despite rapid progress in generalist vision models. Existing counting models are often tailored to scenarios such as crowds, vehicles, cells, crops, or remote-sensing objects, and thus struggle to generalize across categories, visual domains, object scales, and density distributions. In this paper, we study text-guided object counting across domains, where a model takes an image and a natural-language query as input and returns an instance-grounded set of target points whose cardinality gives the count. This formulation unifies category-conditioned counting with interpretable spatial localization. To support this setting, we construct CLOC, a Cross-domain Large-scale Object Counting dataset that reorganizes diverse public data sources into a unified benchmark. CLOC covers six visual domains: General Scene, Remote Sensing, Histopathology, Cellular Microscopy, Agriculture, and Microbiology, with about 220K images, 619 categories, and 15M object instances. Based on CLOC, we propose Count Anything, a generalist model for text-guided object counting. Unlike density-map-based methods, which dominate counting models, Count Anything adopts discrete instance points and performs dual-granularity instance enumeration. A Region-level Sparse Counter provides object-level anchors for large and sparse targets, while a Pixel-level Dense Counter handles small, crowded, and weakly bounded targets via dense point prediction. A point-centric supervision strategy enables learning from heterogeneous annotations, and Complementary Count Fusion combines both counters in a parameter-free manner. Extensive experiments show that Count Anything achieves strong accuracy and multi-domain generalization, outperforming existing open-world counting methods. Code is available at: [this https URL](https://github.com/Mengqi-Lei/count-anything).

Subjects:Computer Vision and Pattern Recognition (cs.CV)
Cite as:[arXiv:2605.30846](https://arxiv.org/abs/2605.30846) [cs.CV]
(or [arXiv:2605.30846v1](https://arxiv.org/abs/2605.30846v1) [cs.CV] for this version)
[https://doi.org/10.48550/arXiv.2605.30846](https://doi.org/10.48550/arXiv.2605.30846)

arXiv-issued DOI via DataCite

## Submission history

From: Mengqi Lei [[view email](http://arxiv.org/show-email/167da367/2605.30846)] 

**[v1]** Fri, 29 May 2026 05:08:31 UTC (41,518 KB)


## Key Contributions

1. Text-guided counting formulation - unifies category-conditioned counting with spatial localization
2. CLOC framework - Compact Language-based Object Counters
3. Generalist counting - text-guided count of any object category without per-class training
4. Spatial reasoning - integrates counting with localization

## References

- arXiv:2605.30846 (https://arxiv.org/abs/2605.30846)
