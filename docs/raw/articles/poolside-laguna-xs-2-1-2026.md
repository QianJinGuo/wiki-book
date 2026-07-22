---
source_url: https://poolside.ai/blog/introducing-laguna-xs-2-1
source_type: newsletter
ingested: 2026-07-04
sha256: 1a6ff5bb63a7bfedaf358180cf81287288463f127f200fe97754cd52ba4a8107
---

# Introducing Laguna XS 2.1

Today we're releasing Laguna XS 2.1, an upgraded version of our Laguna XS.2 model.

Laguna XS 2.1 is a 33B total parameter Mixture-of-Experts model with 3B activated parameters per token, designed for agentic coding and long-horizon work on a local machine. It's the same architecture as XS.2, with a notable improvement on SWE-bench Multilingual and stronger performance on terminal-style tasks.

XS 2.1 improves upon XS.2 across a key field of agentic coding benchmarks. The largest move is on SWE-bench Multilingual, up 5.4 points to 63.1%.

Benchmarks:
- SWE-bench Verified: significant improvement
- SWE-bench Multilingual: 63.1% (+5.4pts)
- SWE-Bench Pro: improvement
- Terminal-Bench 2.0: improvement

A better local experience:
- Supported in vLLM, SGLang, NVIDIA TensorRT-LLM, HF transformers and Ollama
- Three quantized checkpoints: FP8, INT4 & NVFP4
- Open-weight DFlash speculator models double tok/s for local inference
- 256K context length on API
- OpenMDW-1.1 license (fully permissive)
- Pricing: $0.10 / $0.20 / $0.05 per 1M input / output / cache-read tokens

Available on OpenRouter, poolside API, and local deployment.
