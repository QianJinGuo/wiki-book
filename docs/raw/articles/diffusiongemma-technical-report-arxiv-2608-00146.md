---
title: "DiffusionGemma Technical Report (arXiv 2608.00146)"
source_url: "https://arxiv.org/abs/2608.00146"
type: raw-article
created: 2026-08-05
updated: 2026-08-05
sha256: 7f7e1f3c9a0b5d2e8c4a6f0b1d3e5a7c9b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2
---

# DiffusionGemma Technical Report (arXiv 2608.00146)

**Authors**: DiffusionGemma Team — Adrien Ali Taïga, James Assiene, Daniele Calandriello, Rahma Chaabouni, João Gante, Tamara von Glehn, Nate Keating, Chris Knutsen, Martin Kukla, Tianlin Liu, Ivan Lobov, Ofir Nabati, João Gabriel Oliveira, Nicolas Perez-Nieves, Nastasia Prutianova, Bobak Shahriari, Jean Tarbouriech, Pavel Tyletski, Çağlar Ünlü, Cindy Wu, Glenn Cameron, Jerome Connor, Sertan Girgin, Maarten Grootendorst, Alon Levkovitch, Eliya Nachmani, Omar Sanseviero, Piotr Stanczyk, Quentin Berthet, Andrew Campbell, Clément Crepy, Valentin De Bortoli, Arnaud Doucet, Romuald Elie, Alexandre Galashov, Klaus Greff, Alexis Jacq, David Ruhe, Yu-Han Wu, Sebastian Flennerhag, Brendan O'Donoghue 等 43 人

**Submitted**: 31 Jul 2026 (v1) | **Subjects**: cs.CL, cs.AI | **DOI**: 10.48550/arXiv.2608.00146

## Abstract

We introduce DiffusionGemma, an experimental open-weight language model that uses discrete diffusion to generate text at exceptionally high speed. Rather than decoding one token at a time, DiffusionGemma iteratively refines blocks of 256 tokens in parallel, avoiding the sequential decoding bottleneck of conventional autoregressive (AR) large language models.

Instead of training from scratch, we obtain DiffusionGemma by fine-tuning the mixture-of-experts Gemma 4 model with 3.8B activated and 25.2B total parameters. Our compute-efficient two-stage training pipeline uses fewer than 10% of the starting AR model's total training token budget. The first stage uses supervised fine-tuning to teach bidirectional denoising, while the second stage combines reinforcement learning with sampler distillation to jointly improve generation quality and inference efficiency.

DiffusionGemma establishes a new Pareto frontier for the trade-off between generation speed and model capability. Averaged across our full evaluation suite, it generates around 20 tokens per forward pass and achieves roughly 1,500 output tokens per second on a single NVIDIA H100 GPU, which is substantially faster than AR models even with state-of-the-art speculative decoding.

DiffusionGemma also retains the starting model's support for thinking mode, multimodal inputs, and long contexts. Despite diffusion fine-tuning, it remains capable of AR generation with only minor performance degradation, suggesting a path toward hybrid diffusion-AR decoding.

**Key facts**:
- 256 tokens per parallel refinement block (not one token at a time)
- 3.8B activated / 25.2B total parameters (Gemma 4 MoE fine-tune)
- <10% of the AR model's original training token budget (two-stage: SFT bidirectional denoising → RL + sampler distillation)
- ~1,500 output tokens/s on single H100; ~20 tokens per forward pass
- New Pareto frontier for generation speed vs model capability
- Retains thinking mode, multimodal, long context; hybrid diffusion-AR decoding path
