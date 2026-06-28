## Ch17.024 Introducing 1-bit and Ternary Bonsai Image Models

> 📊 Level ⭐⭐⭐ | 6.2KB | `entities/bonsai-image-4b-1-bit-ternary.md`

# Introducing 1-bit and Ternary Bonsai Image Models

## 深度分析

Published Time: 2026-05-26

Markdown Content:
![Image 1](https://cdn.prod.website-files.com/699604cc2b9dd89bdbda0608/6a15cec375689f915406cc3c_grid.png)

Images generated from Ternary Bonsai Image 4B

Today we’re releasing **Bonsai Image 4B**, a family of compact image-generation models designed to run high-quality diffusion inference on local hardware: from laptops to phones.

Bonsai Image 4B comes in two variants:

*   **1-bit Bonsai Image 4B** uses binary {−1, +1} transformer weights with an FP16 group-wise scaling factor, giving 1.125 effective bits per weight. It targets maximum compression and is the right fit when memory pressure, bandwidth, and the deployment footprint are the primary constraints.
*   **Ternary Bonsai Image 4B** uses {−1, 0, +1} transformer weights with an FP16 group-wise scaling factor, giving 1.71 effective bits per weight. The additional zero state gives the model more representational flexibility, improving visual quality and prompt fidelity while remaining extremely compact.

The result is a new deployment regime for image generation: capable outputs, open weights, and practical local inference on devices that were previously out of reach for this class of model. To our knowledge, **Bonsai Image 4B is the first image model in its parameter class to run directly on an iPhone**.

## Built for local generation

![Image 2](https://cdn.prod.website-files.com/699604cc2b9dd89bdbda0608/6a15cd893a2c1d8354bece23_ef1081ac.png)

Images generated from 1-bit Bonsai Image 4B

Local image generation starts with a hard constraint: the model has to fit within the device’s memory budget.

For a 4B-class image model, the diffusion transformer is the largest part of the model and the part that runs repeatedly during generation. Each denoising step invokes the transformer again, so transformer size directly shapes memory pressure, bandwidth demand, and local inference speed.

Bonsai Image 4B is built from the FLUX.2 Klein 4B. It keeps the architecture intact but changes how the transformer weights are represented. By moving those weights into binary and ternary form, Bonsai reduces the part of the image pipeline that matters most for local deployment.

| Model | Diffusion Transformer | Reduction vs FP16 |
| --- | --- | --- |
| FLUX.2 Klein 4B | 7.75 GB | 1.0x |
| 1-bit Bonsai Image 4B | 0.93 GB | 8.3x |
| Ternary Bonsai Image 4B | 1.21 GB | 6.4x |

> **Table I:**Diffusion transformer footprint for models.

The binary layers provide roughly a 14x reduction relative to full-precision transformer weights. A small set of precision-sensitive supporting tensors (~5%), called the projection layers, remains in FP16 so the final 1-bit Bonsai Image 4B transformer is **0.93 GB**: an 8.3x reduction from the 7.75 GB full-precision FLUX.2 Klein 4B.

The ternary variant follows the same structure. Its ternary layers provide roughly a 10x reduction and the final Ternary Bonsai Image 4B transformer is **1.21 GB**, a 6.4x reduction from the full-precision transformer. It is slightly larger than the 1-bit model, but the additional zero state improves visual quality and prompt fidelity.

Including the compressed text encoder and FP16 VAE, the Apple Silicon deployment payload is 3.42 GB for 1-bit Bonsai Image 4B and 3.88 GB for Ternary Bonsai Image 4B. For comparison, the full precision FLUX.2 Klein 4B requires a deployment payload of 15.97 GB. Since, at runtime, the text encoder is offloaded after prompt encoding, the mean memory usage is smaller than the total payload. When generating a 512x512 image, the mean-active memory is 1.5 GB and 1.96 GB, for the binary and ternary models, compared to 11.74 GB for the original FLUX.2 Klein 4B (a reduction of 7.8x and 6.0x, respectively). For a 1024x1024 image, the mean-active memory is 1.95 GB and 2.38 GB, for the binary and ternary models, compared to 14.39 GB for the original FLUX.2 Klein 4B (a reduction of 7.4x and 6.0x, respectively).

This reduction in memory footprint changes where the model can run. Our deployment stack supports Apple Silicon iPhones, iPads and Macs and CUDA GPUs, using MLX low-bit paths on Apple hardware and Gemlite low-bit GEMM kernels on CUDA. On iPhone 17 Pro Max, the full-precision FLUX.2 Klein 4B pipeline does not fit within the device memory budget, while both Bonsai Image variants run on-device.

[Video 3](https://vimeo.com/1195512651)

> Video I: Image generation on Bonsai Studio

In practice, Bonsai Image 4B generates a 512x512 image in 9.4 seconds on an iPhone 17 Pro Max and about 6 seconds on Mac M4 Pro. On Mac M4 Pro, Bonsai Image 4B is up to 5.6x faster than the stock full-precision MFLUX pipeline.

## Benchmarking performance

Compression only matters if the model remains useful. We evaluated Bonsai Image 4B across three complementary benchmarks: **GenEval** for object composition and attribute binding; **HPSv3** human preference and aesthetic quality; **DPG-Bench** dense prompt following and semantic faithfulness.

![Image 3](https://cdn

## 相关实体
- [Bonsai Image 4B Quantization](ch01-819-introducing-1-bit-and-ternary-bonsai-image-4b-image-generat.html)
- [Gemma 4 Qat Models Optimizing Compression](ch01-401-icml-2026-apo.html)
- [Stochastic Parrot Language Models And Meaning](ch01-373-language-models-and-meaning.html)
- [Openai Models Codex Amazon Bedrock Ga](ch09-048-openai-models-and-codex-on-amazon-bedrock-are-now-generally.html)
- [Stochastic Parrot Language Models And Meaning](ch01-373-language-models-and-meaning.html)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/bonsai-image-4b-1-bit-ternary.md)

---
