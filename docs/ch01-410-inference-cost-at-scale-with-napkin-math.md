# Inference cost at scale with napkin math

## Ch01.410 Inference cost at scale with napkin math

> 📊 Level ⭐⭐ | 8.7KB | `entities/napkin-inference-cost-injuly-2026.md`

# Inference cost at scale with napkin math

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/napkin-inference-cost-injuly-2026.md)

## Summary

This article provides a first-principles analysis of LLM inference costs, starting from GPU hardware specs and working through to dollar-per-user pricing. The key insight: on modern GPUs like the NVIDIA B200, memory bandwidth — not compute — is the binding constraint for inference. With a 32B parameter model on a single B200, you can serve ~40-60 concurrent users at 40 tokens/second each, translating to roughly $4.32/user/month in hardware rental costs.

## Key Points

### 1. Two Numbers Define GPU Inference Capacity

Every GPU has two critical specs that determine inference performance:
- **Peak throughput**: Floating-point operations per second (TFLOP/s)
- **Memory bandwidth**: Data transfer rate from VRAM to registers (TB/s)

For the NVIDIA B200: 4,500 TFLOP/s compute and 8 TB/s memory bandwidth. The ratio is 562:1 — the chip can compute 562 bytes for every byte loaded from memory. This asymmetry is the fundamental constraint of LLM inference.

### 2. KV-Cache Transforms the Compute-to-Memory Ratio

Without KV-cache, a single forward pass at 200K context requires ~26 trillion FLOPs and ~1.7 billion memory accesses — a ratio of ~10,000:1 (massively compute-bound). With KV-cache (processing only the most recent token), this drops to ~52.4 million ops and ~26.2 million memory accesses — a ratio of just 2:1 per user (massively memory-bound).

This transformation is why inference engines invest so heavily in KV-cache management. The cache converts LLM inference from a compute-bound problem to a memory-bandwidth-bound problem.

### 3. Optimal Batch Size: 331 Users (Theoretical)

To fully saturate a B200's compute and bandwidth, you need to serve enough concurrent users so that the 2:1 per-user ratio can be amortized across the batch. The calculation: 562 / 2 ≈ 331 concurrent users. This is the theoretical ceiling where both compute and memory are fully utilized.

### 4. Real-World Constraints: VRAM Budget

Reality is more constrained. For a 32B dense model at FP8 (32GB weights) with 200K context per user:
- KV-cache per user (with GQA 8x reduction): ~26GB
- Available VRAM after weights: 160GB
- Max concurrent users: 160 / 26 ≈ **6 users**

This is the hard limit for 100% duty cycle at maximum context length.

### 5. Practical Optimization: PagedAttention and Duty Cycle

vLLM's PagedAttention splits KV-cache into chunks allocated dynamically as context grows, and flushes cold conversations. Combined with realistic user behavior (median 4-40K context, 80% idle time):
- **40-60 users per GPU** with typical conversation lengths
- **300-800 users per GPU** accounting for idle time
- ~40 tokens/second per user (well above reading speed)

### 6. Dollar Cost Per User

| Scenario | Users/GPU | Cost/User |
|----------|-----------|-----------|
| Own hardware (100% duty) | 6 | $6,667 lifetime |
| Own hardware (realistic) | 500 | $133 lifetime |
| Rent at $3/hr (realistic) | 500 | **$4.32/month** |

The $4.32/month figure is the breakeven price for a subscription AI product using rented B200 GPUs.

## Deep Analysis

### Memory-Bandwidth: The Universal Bottleneck

The article's central insight — that inference is memory-bandwidth-bound, not compute-bound — has profound implications for the entire inference stack. It explains why:
- **Quantization works**: Reducing precision from FP16 to FP8/INT4 halves memory bandwidth requirements, directly doubling throughput
- **Speculative decoding helps**: Small draft models can predict multiple tokens cheaply, reducing the number of memory-bound forward passes
- **Long context is expensive**: Each additional context token adds to the KV-cache that must be loaded every forward pass
- **MoE models are efficient for inference**: Despite having more total parameters, only a subset is activated per token, reducing effective memory bandwidth requirements

### The Batch Size vs. Context Length Tradeoff

The article reveals a fundamental tradeoff: at fixed VRAM, batch size and context length are inversely related. This has direct product implications:
- **Chat products** (short context, many users): Favor large batches, optimize for throughput
- **Code agents** (long context, few users): Favor per-user context, optimize for latency
- **Document processing** (very long context, 1 user): Need aggressive KV-cache compression or streaming approaches

This tradeoff explains why different AI products have wildly different economics despite using similar models.

### Implications for Product Pricing

The napkin math provides a useful framework for pricing AI products:
- At $4.32/user/month for hardware alone, a $20/month subscription leaves ~$15.68 for margin, R&D, support, and other costs
- Products offering unlimited long-context access (200K tokens) need much higher per-user VRAM budgets, pushing costs up significantly
- The 80% idle time assumption means products with high engagement (coding agents, continuous workflows) cost 4-5x more per user than chat products

### Connection to Local Inference Economics

This analysis complements the [Apple Silicon cost analysis](/ch01-081-apple-silicon-costs-more-than-openrouter/). While local inference on Apple Silicon costs ~$1.50/M tokens due to lower memory bandwidth (~200-400 GB/s vs. B200's 8 TB/s), cloud inference on B200-class GPUs achieves much better per-token economics through batched serving. The fundamental advantage of cloud GPUs is not just raw bandwidth, but the ability to **batch hundreds of users** to amortize the memory-bandwidth bottleneck.

### Scaling to Multi-GPU

The article stops at single-GPU analysis, but real deployments use clusters with load balancing. Multi-GPU introduces additional considerations:
- **Tensor parallelism**: Splits a single model across GPUs, reducing per-GPU memory but adding inter-GPU communication latency
- **Pipeline parallelism**: Splits model layers across GPUs, better for throughput but worse for latency
- **Data parallelism**: Replicates the model across GPUs, simple but requires more VRAM total

For serving at scale, data parallelism (multiple independent model replicas) is usually simplest and most cost-effective for moderate-scale deployments.

## Practical Implications

1. **Price your product using first principles**: Don't guess — use the GPU spec sheet + model size + context length to compute per-user costs. The formula: cost = GPU_rental / (VRAM_available / KV_cache_per_user × duty_cycle).
2. **Optimize for memory bandwidth, not compute**: Invest in quantization (FP8/INT4), KV-cache compression (GQA, MQA), and efficient attention implementations. These directly reduce the binding constraint.
3. **Manage context aggressively**: Don't allocate 200K context to every user by default. Use sliding windows, context summarization, and on-demand cache allocation (PagedAttention) to serve more users per GPU.
4. **Duty cycle is your friend**: Products with natural idle time (chat, not agents) have much better economics. Design products that encourage natural breaks in usage.
5. **Own vs. rent depends on scale**: Below ~100 GPUs, renting is usually more cost-effective (flexibility, no capex). Above that, owned hardware with long-term amortization wins.
6. **Monitor the memory-bandwidth frontier**: GPU vendors are increasing memory bandwidth faster than compute (H100 → B200: ~2.4x bandwidth vs. ~2.5x compute). The bottleneck may shift over time.

## Related Entities

- [Apple Silicon costs more than OpenRouter](/ch01-081-apple-silicon-costs-more-than-openrouter/)
- [Microsoft Is Quietly Shopping For An Openai Replac](/ch01-036-microsoft-is-quietly-shopping-for-an-openai-replacement/)
- [Vietnamtodevelopdomesticcloud](/ch01-143-vietnam-to-develop-domestic-cloud/)

---

