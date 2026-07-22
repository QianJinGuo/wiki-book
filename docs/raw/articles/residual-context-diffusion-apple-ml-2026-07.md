---
title: "Residual Context Diffusion Language Models"
source: newsletter
source_url: https://machinelearning.apple.com/research/residual-context-diffusion
ingested: 2026-07-03
sha256: 2330d353ac3da898c8c370c62039ffebdb86426fd58226c431ba1a4f6655cd65
---

Authors Yuezhou Hu†*, Harman Singh†*, Monishwaran Maheswaran†*, Haocheng Xi†, Coleman Hooper†, Jintao Zhang†, Aditya Tomar†, Michael W. Mahoney†, Sewon Min†, Mehrdad Farajtabar, Kurt Keutzer†, Amir Gholami†‡, Chenfeng Xu†‡

Diffusion Large Language Models (dLLMs) have emerged as a promising alternative to purely autoregressive language models because they can decode multiple tokens in parallel. However, state-of-the-art block-wise dLLMs rely on a “remasking” mechanism that decodes only the most confident tokens and discards the rest, effectively wasting computation. We demonstrate that recycling computation from the discarded tokens is beneficial, as these tokens retain contextual information useful for subsequent decoding iterations. In light of this, we propose Residual Context Diffusion (RCD), a module that converts these discarded token representations into contextual residuals and injects them back for the next denoising step. RCD uses a decoupled two-stage training pipeline to bypass the memory bottlenecks associated with backpropagation. We validate our method on both long CoT reasoning (SDAR) and short CoT instruction following (LLaDA) models. We demonstrate that a standard dLLM can be efficiently converted to the RCD paradigm with merely ∼1 billion tokens. RCD consistently improves frontier dLLMs by 5–10 points in accuracy with minimal extra computation overhead across a wide range of benchmarks. Notably, on the most challenging AIME tasks, RCD nearly doubles baseline accuracy and attains up to 4–5x fewer denoising steps at equivalent accuracy levels.

*   † University of California, Berkeley
*   * Equal contribution
*   ‡ Equal advising

## Related readings and updates.

Diffusion (Large) Language Models (dLLMs) now match the downstream performance of their autoregressive counterparts on many tasks, while holding the promise of being more efficient during inference. One critical design aspect of dLLMs is the sampling procedure that selects which tokens to unmask at each diffusion step. Indeed, recent work has found that heuristic strategies such as confidence thresholding improve both sample quality and token…

[Read more](https://machinelearning.apple.com/research/unmasking)

Diffusion large language models (dLLMs) are compelling alternatives to autoregressive (AR) models because their denoising models operate over the entire sequence. The global planning and iterative refinement features of dLLMs are particularly useful for code generation. However, current training and inference mechanisms for dLLMs in coding are still under-explored. To demystify the decoding behavior of dLLMs and unlock their potential for coding,…

[Read more](https://machinelearning.apple.com/research/diffucoder)
