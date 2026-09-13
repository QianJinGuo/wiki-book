# Introducing 1-bit and Ternary Bonsai Image 4B: Image Generation for Local Devices

> 📊 Level ⭐⭐⭐ | 8.0KB

→ [原文存档](https://prismml.com/news/bonsai-image-4b)

## 摘要

PrismML released Bonsai Image 4B, a 4B-class image-generation family whose FLUX.2 Klein 4B diffusion transformer weights are re-represented as 1-bit binary `{−1, +1}` or ternary `{−1, 0, +1}` values under FP16 group-wise scaling — shrinking that transformer from 7.75 GB to 0.93 GB (8.3x) and 1.21 GB (6.4x). Only the numerics change: ternary keeps 95% and binary 88% of full-precision accuracy, and both variants run on-device on an iPhone.

## 核心要点

- **Two variants, one architecture.** Binary `{−1, +1}` vs ternary `{−1, 0, +1}` weights under FP16 group-wise scaling; both derived from FLUX.2 Klein 4B with no structural change.
- **Effective bits per weight: 1.125 vs 1.71.** The zero state's extra ~0.6 bit/weight accounts for the entire quality gap between variants.
- **Transformer footprint 0.93 / 1.21 GB vs 7.75 GB.** 8.3x / 6.4x end-to-end, damped from ~14x / ~10x because ~5% precision-sensitive projection tensors stay in FP16.
- **Mean-active memory collapses.** 512×512: 1.5 / 1.96 GB vs 11.74 GB; 1024×1024: 1.95 / 2.38 GB vs 14.39 GB, with the text encoder offloaded after prompt encoding.
- **Quality retention: 88% and 95%** across GenEval (composition), HPSv3 (preference), and DPG-Bench (dense prompt following).
- **A Pareto shift, not just a smaller model.** In the ~1 GB band BK-SDM-Small reaches 42% and PixArt-Σ XL 2 83% relative performance; Bonsai reaches 88% / 95%.
- **First of its class on iPhone; Apache 2.0 open weights.** 512×512 generation takes 9.4 s on iPhone 17 Pro Max and ~6 s on Mac M4 Pro.

## 深度分析

### 量化数学：1.125 和 1.71 是怎么来的

A binary weight carries `log2(2) = 1` bit; a ternary weight carries `log2(3) ≈ 1.585` bits. Both variants amortize one FP16 scale per group, and the published effective-bit values imply a group size of 128: `16/128 = 0.125` extra bits per weight, giving `1.125` for binary and `1.585 + 0.125 ≈ 1.71` for ternary. The third state is paid for at the theoretical information rate — the cheapest way to buy representational flexibility.

The same arithmetic reproduces the layer-level ratios the release quotes: `16/1.125 ≈ 14x` and `16/1.71 ≈ 9.4x`. The gap down to the end-to-end 8.3x / 6.4x is the FP16 projection layers, a ~5% minority of tensors exempted from quantization. In extreme quantization the residual full-precision components, not the quantized ones, set the compression floor.

### 内存与带宽 vs 质量的权衡曲线

The three benchmarks diverge, and reading them separately beats averaging them into "88% / 95%". Ternary nearly matches full precision on DPG-Bench dense prompt following (0.851 vs 0.853) and is close on HPSv3 (12.22 vs 12.84), but loses visible ground on GenEval composition and attribute binding (0.723 vs 0.819); binary degrades on every axis, most sharply on GenEval (0.671). The zero state appears to stabilize semantic commitment better than combinatorial binding, so the binary failure mode is looser prompt adherence — invisible in aesthetic ratings, obvious in multi-object prompts. At ~1 GB footprint the alternatives reach 42% and 83% while Bonsai reaches 88% / 95% — quantizing a large model retains capacity that training a small one cannot buy.

### 端侧约束：为什么 diffusion transformer 是唯一值得压缩的部分

The transformer is both the largest component and the one invoked once per denoising step, so its size sets peak memory, per-step weight bandwidth, and wall-clock speed at once — the one component whose compression improves all three. The Apple Silicon payload drops to 3.42 / 3.88 GB from 15.97 GB, yet mean-active memory at 512×512 is only 1.5 / 1.96 GB because the text encoder is offloaded after prompt encoding: payload is a distribution constraint, mean-active memory the runtime constraint that decides fit.

On iPhone 17 Pro Max the full-precision pipeline exceeds the budget while both variants run, and compression buys speed as well as size — 512×512 in 9.4 s on the phone, up to 5.6x faster than the stock MFLUX pipeline on Mac M4 Pro. The stack uses MLX low-bit paths on Apple Silicon and Gemlite low-bit GEMM on CUDA.

### 对本地部署扩散 / Transformer 图像模型的意义

Cloud-only generation imposes three product costs: every prompt is a remote request, every iteration carries marginal serving cost, and every interaction pays round-trip latency — costs that bite hardest for image generation because the workload is naturally iterative (revise, compare, vary, discard, retry). Local inference makes it cheaper to run, faster to iterate on, and private by construction.

The broader significance is that the lever is weight representation, not architecture: Bonsai reuses a modern model unchanged and only rewrites the numerics, making extreme quantization a drop-in upgrade rather than a model-design program. The remaining frontier is the last 5–12%, recoverable by spending the next 0.28 GB on the zero state or by quantizing the FP16 projection layers.

## 实践启示

1. **Choose the variant by prompt complexity, not size.** The 0.28 GB gap buys a located gain in composition and attribute binding (GenEval 0.671 → 0.723). Take ternary for attribute-dense prompts; take binary only when memory is the binding constraint.
2. **Budget on mean-active memory, not deployment payload.** Payloads of 3.42/3.88 GB are dominated by components offloaded at runtime; the real fit test on a phone is 1.5–2.38 GB of steady-state working set.
3. **Quantize the repeated component first.** Quantize the diffusion transformer aggressively, keep text encoder, VAE, and projection layers in FP16, and offload the encoder after prompt encoding.
4. **Validate with a composition benchmark before shipping.** HPSv3 (12.22) and DPG-Bench (0.851) look acceptable for ternary while GenEval exposes an 11.7% relative composition loss; the other two will not surface it.

### 关联实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- Karpathy Vibe Coding Agentic Engineering
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Quantization Techniques](https://github.com/QianJinGuo/wiki-public/blob/main/entities/quantization-techniques.md)
- [Nunchaku: 4-bit Diffusion Inference in Diffusers](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nunchaku-4bit-diffusion-inference-diffusers.md)
- [Inference Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md)
- [Model Distillation and Compression](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/data-infrastructure.md)

---

