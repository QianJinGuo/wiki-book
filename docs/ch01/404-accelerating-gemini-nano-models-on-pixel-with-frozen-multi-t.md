# Accelerating Gemini Nano models on Pixel with frozen Multi-Token Prediction

> 📊 Level ⭐⭐⭐⭐ | 11.5KB

> **Source**: [research.google](https://research.google/blog/accelerating-gemini-nano-models-on-pixel-with-frozen-multi-token-prediction/)

## 摘要

Google Research has retrofitted Multi-Token Prediction (MTP) onto an already-trained, fully **frozen** Gemini Nano v3 backbone: a lightweight dense Transformer head is appended to the last layers, drafts several future tokens from the backbone's own hidden states, and has those drafts verified by the unchanged base model. Because only the head is trained and every rejected draft is rolled back, output stays bit-for-bit identical to the base model — the speedup ships as a pure efficiency update with no capability or safety-alignment regression. Shipped on Pixel 9 and 10, it gives 50%+ faster generation than comparable standalone drafters while cutting roughly 130MB of runtime memory per instance.

## 核心要点

- **Frozen-backbone retrofit.** MTP is bolted onto an already-deployed Gemini Nano v3 with frozen weights; only the appended head is trained, making it strictly an efficiency optimization.
- **Deep-exit drafting.** The head consumes the backbone's *final high-dimensional activations* and predicts a span of future tokens — not a separate model reasoning from text history alone.
- **Zero-copy KV reuse.** The head cross-attends directly to the main model's frozen KV cache instead of keeping its own, eliminating drafter prefill latency and saving ~130MB per instance.
- **Measured gains.** 50%+ speedup on Pixel 9 depending on task; up to 55% better token acceptance on structurally predictable text (smart replies); nearly two extra correct tokens per pass in production.
- **Lineage.** Extends speculative decoding, EAGLE, and Confident Adaptive Language Modeling (CALM); unlike the tandem-trained Gemma 4 heads, this head is frozen.

## 深度分析

### 1. On-device decoding is memory-bandwidth bound, not compute bound

Server serving hides the cost of autoregressive decoding behind batch parallelism: one weight read feeds many requests, so arithmetic units stay busy. A phone has the opposite economics — it serves a single request under a hard RAM ceiling and a strict energy budget, and it decodes strictly autoregressively, one token per forward pass. Each pass must stream the model's weights and the growing KV cache through memory to produce a single token, so the binding constraint is bytes moved per token, not FLOPs per token. The processor sits underutilized while the memory bus saturates, which is exactly the observed symptom: sluggish-feeling generation and battery drain rather than compute-limited throughput. The corollary: throughput rises only by accepting more than one token per pass, and any second model or KV cache makes the bandwidth problem worse, not better.

### 2. Frozen MTP heads decouple drafting from the base model

Classical speculative decoding splits generation into two roles: a small, fast *drafter* proposes a short candidate sequence, and a large *verifier* scores those candidates in parallel, accepting the matching prefix and rolling back to the first divergence. The standalone version has two structural flaws on a phone. A separate drafter is a second set of weights competing for scarce RAM (128M parameters is not free beside a Nano-class model), and it is *blind* — predicting next tokens from text history only, with no access to the semantic state the main model has already computed.

MTP swaps the standalone model for an integrated one. Rather than training a small model to imitate the big one, Google appends a lightweight Transformer head to the main model's final layers and lets it draft from the backbone's final hidden states — the "deep exit" layer. The drafting signal is conditioned on the same rich internal state the verifier will later use to check the draft, which is why MTP drafters out-predict standalone drafters of comparable parameter count. Contrast this with the tandem-trained MTP used for the Gemma 4 MTP drafters, where head and backbone are trained together.

### 3. The late-exit speculative-drafting loop, end to end

The mechanism is a two-phase loop over shared state. In the **draft** phase the MTP head reads the backbone's final activations and emits a short candidate sequence. In the **verify** phase the frozen backbone processes all candidates in one parallel pass; the longest prefix matching what the backbone itself would have produced is accepted, and everything from the first divergence onward is discarded and regenerated. Because verification evaluates several positions at once, the memory traffic that produced one token now validates several — the gain is better amortization of the same read, not a shortcut in the math.

Deploying it required redesigning the on-device inference stack around the *dependency* between the phases: drafting needs the backbone's activations and cache to already exist, and verification needs the draft to be complete. That is control-flow engineering as much as modeling, echoing [EAGLE-3](https://github.com/QianJinGuo/wiki-public/blob/main/entities/eagle-3-speculative-decoding-optimization.md)-style kernel work; the zero-copy design keeps the dependency tractable.

### 4. Zero-copy memory and why "frozen" is the shipping argument

Standard MTP implementations optimize for training efficiency by sharing *static* parameters (embedding weights) between main model and drafter. On-device inference faces a different constraint: *dynamic* memory. When a drafter processes context independently it pays a "double tax," maintaining its own KV cache on top of the backbone's. Google's zero-copy architecture instead has the MTP head cross-attend directly to the main model's frozen KV cache, querying context the backbone already computed. The payoff is two-fold: no drafter prefill latency (the head needs no extra prompt-processing time) and 130MB per instance saved by dropping drafter embedding tables, prefill attention variants, and app-specific tuning parameters.

The deeper reason to freeze is operational: once the backbone is deployed in the field, re-running pre-training or fine-tuning pipeline changes for every efficiency idea is prohibitive, so retrofitting an additive head is the only affordable path. With the backbone frozen and only the head trained on future-token prediction error, MTP becomes strictly additive — it cannot change what the model knows or how it is aligned. That lets speed improvements ship OTA on a cadence decoupled from model-quality releases, with both sides of the update producing identical text.

### 5. Acceptance rate, quality tradeoffs, and the Pixel 9/10 rollout

Everything funnels into one number: the **acceptance rate** of drafted tokens. Speedup approximates the expected number of accepted tokens per verification pass, so freezing the backbone puts a ceiling on what the head can learn — it can only model the backbone's continuation distribution from final activations, never co-adapt with it. That ceiling varies sharply by task, hence per-workload results rather than one multiplier. On instruction-following work such as summarization or constrained rewriting, MTP clearly beat fine-tuned standalone drafters; on highly predictable text (smart replies) the head effectively learned the main model's syntactic patterns and lifted token acceptance by up to 55%.

That task-dependence is the practical caveat: a frozen head helps most where continuations are stereotyped and least where they are open-ended and high-entropy. On Pixel 9 and 10 in production (AI Notification Summaries, Proofread) MTP predicted on average nearly two extra tokens correctly per pass, and fewer verification steps meant less time waking the heavier processors — the source of the battery win. The roadmap targets the remaining losses: parallel decoding and auxiliary-head-free drafting to cut draft latency, plus *branching* exploration and relaxed non-exact verification to accept longer sequences when context is ambiguous. That last idea is the most delicate — the same relaxation that buys throughput is what a stricter variant, such as [ASD's relaxed validation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/approximate-speculative-decoding-asd-relaxed-validation-2026.md), has to bound carefully.

## 实践启示

1. **Profile bytes per token, not FLOPs.** Decode latency tracks memory traffic per emitted token; only an architecture emitting more tokens per read will help.
2. **Prefer integrated drafters when RAM is scarce.** A standalone drafter costs an extra parameter set *and* a duplicate KV cache; a head on the backbone's final activations buys better drafts at a fraction of the footprint.
3. **Reuse the backbone's cache rather than only sharing static tables.** Cross-attention into the frozen KV cache removed both prefill latency and ~130MB per instance; static weight sharing would have addressed neither.
4. **Treat frozen-backbone adapters as the deployment unit.** Freeze the shipped base model, train only the additive module, and verify identical output so efficiency updates ship independently of quality and safety review.
5. **Report acceptance rate per task class.** A single average hides the story: structural tasks accept far more drafted tokens than open-ended generation, and the same head can be a large win on one and marginal on the other.

## 相关实体

- [Speculative Decoding](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/speculative-decoding.md) — the draft-then-verify foundation MTP builds on
- Gemma 4 Multi-Token Prediction Drafters — the tandem-trained MTP variant contrasted here
- [EAGLE-3 Speculative Decoding Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/entities/eagle-3-speculative-decoding-optimization.md) — the lineage of drafting-head efficiency work
- [ASD: Relaxed Validation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/approximate-speculative-decoding-asd-relaxed-validation-2026.md) — the flip side of exact-match verification
- [Gemma 4 on the Edge (NVIDIA)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/nvidia-gemma-4-edge-ai.md) — on-device constraints for a sibling model family

→ [原文存档](https://research.google/blog/accelerating-gemini-nano-models-on-pixel-with-frozen-multi-token-prediction/)

---

