---
title: "Introducing @huggingface/kernels: 200+ WebGPU Kernels for Local AI"
source_url: "https://huggingface.co/blog/webgpu-kernels"
ingested: 2026-09-02
feed_name: Hugging Face Blog
source_published: 2026-09-01
source: rss
content_source: github-raw
sha256: c6395e2e6727b10f
---

# Introducing @huggingface/kernels: 200+ WebGPU Kernels for Local AI

Hugging Face WebAI 团队发布 @huggingface/kernels — 一个用于从 Hub 加载和运行优化 WebGPU kernel 的最小化库，包含初始 207 个 kernel。

## TL;DR

- **207 WebGPU kernels**，发布在 webgpu-kernels 组织中，Apache-2.0 许可
- **JavaScript 加载器** `@huggingface/kernels`，直接从 Hub 下载、准备和运行 kernel
- **显式合约和可复现证据**：每个 kernel 包含 manifest、正确性测试、基准测试和 WGSL shader 模板
- **Fleet**，浏览器端基准测试工具，众包跨设备正确性和性能证据

## Why start with kernels?

浏览器中运行的模型最终变成一系列 GPU 操作。WebGPU 通过可移植 API 提供这些操作，WGSL 提供执行着色器的通用语言。但可移植不等于高性能 — 两个着色器可以实现相同操作但性能完全不同。Workgroup size、内存访问模式、向量化、数据类型和融合策略都影响性能。

Kernel 是快速浏览器推理的基础层。高级运行时只能和它们调度的操作一样高效。

## A kernel repository, not just a shader

每个 kernel 有独立仓库和 kernel card，包含：
- `manifest.json` — 操作合约
- `metadata.json` — 标识和出处
- `test.json` — 正确性用例
- `bench.json` — 基准用例
- `*.wgsl.jinja` — 参数化 WGSL 实现

## Performance

与 ORT WebGPU 对比（Apple M4，809 个用例）：几何平均 **2.57x**，中位数 **1.90x**。629 胜 / 176 负 / 4 平。

| 操作 | 用例数 | HF Kernel | ORT WebGPU | 加速 |
|------|:------:|:---------:|:----------:|:----:|
| Add | 5 | 0.064ms | 0.227ms | 3.52x |
| MatMul | 29 | 0.115ms | 0.131ms | 1.14x |
| Softmax | 12 | 0.114ms | 0.240ms | 2.11x |
| LayerNorm | 6 | 0.061ms | 0.135ms | 2.22x |

极端案例：Bilinear Einsum 比 ORT 快 10,000x，CumSum 快 301x。

## Fleet

浏览器端众包测试：每次运行贡献私有证据，帮助发现设备故障、比较变体、改进选择规则。

## Building a shared foundation

207 kernel 是起点。与 ONNX Runtime 团队合作上游化改进，支撑更广泛的 WebAI 生态。
