# Olmo Hybrid and future LLM architectures

## Ch01.463 Olmo Hybrid and future LLM architectures

> 📊 Level ⭐⭐ | 9.7KB | `entities/olmo-hybrid-and-future-llm-architectures.md`

# Olmo Hybrid and future LLM architectures

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/olmo-hybrid-and-future-llm-architectures.md)

## Summary

Olmo Hybrid is a 7B hybrid architecture model from AI2 that mixes Gated DeltaNet (GDN) recurrent layers with standard attention layers, achieving roughly 2x training efficiency over the dense Olmo 3 baseline. The release accompanies substantial theoretical work showing that hybrid models are "more than the sum of their parts" — there are formal problems related to code evaluation that neither transformers nor GDN can solve alone, but which hybrid models can represent and learn. However, post-training and open-source tooling remain significant challenges.

## Key Points

### 1. Hybrid Architecture: The Convergence Trend

Hybrid architectures are no longer experimental — they're being adopted across the open-weight model ecosystem at an accelerating pace:
- **Qwen 3.5** (previewed by Qwen3-Next) — GDN-based hybrid
- **Kimi Linear** (Fall 2025) — smaller release alongside flagship Kimi K2
- **NVIDIA Nemotron 3 Nano** — Mamba-based hybrid, larger models forthcoming
- **IBM Granite 4** — Mamba-based hybrid
- **Olmo Hybrid** (this release) — GDN-based hybrid from AI2

This represents a rare moment where a research trend is being adopted nearly simultaneously across multiple major labs.

### 2. Why Hybrid? Complementary Expressivity

The theoretical foundation is that attention and recurrence have **complementary strengths**. Attention excels at precise retrieval over long contexts (e.g., "find the relevant passage in a 100K document"), while recurrent layers excel at efficient state compression for sequential processing. Mixing them creates a model that can do both.

The key theoretical result: hybrid models can learn functions that **neither pure attention nor pure recurrence can express alone**, particularly formal problems related to code evaluation. This isn't just incremental improvement — it's a qualitative capability expansion.

### 3. GDN vs. Mamba: The RNN Layer Choice Matters

Two families of RNN layers are competing in the hybrid architecture space:
- **Mamba / Mamba 2**: Selective state space models with hardware-efficient scan operations
- **Gated DeltaNet (GDN)**: Newer approach with theoretical advantages in feature learning

Scaling experiments showed: **hybrid GDN (3:1 ratio) > pure GDN > standard transformer > hybrid Mamba 2 > pure Mamba 2**. The gaps maintained when scaling to more parameters and compute, suggesting GDN is the stronger building block for hybrid architectures.

### 4. Pretraining Gains: ~2x Efficiency

Relative to Olmo 3 dense, Olmo Hybrid represents approximately **2x gain in training efficiency** during pretraining. This means the hybrid model achieves comparable performance with half the training compute, or significantly better performance at the same compute budget.

The efficiency gains were particularly pronounced after long-context extension, where recurrent layers' ability to maintain compressed state becomes increasingly valuable.

### 5. Post-Training Challenges: The Distillation Problem

Pretraining gains did not translate straightforwardly to post-training. The Olmo 3 recipe (built on Tulu 2/3 and OpenThoughts 3) yielded mixed results when applied to the hybrid architecture — substantial wins in knowledge tasks but substantial losses in extended reasoning.

The hypothesis: hybrid base models are "sufficiently different students" that require different teacher models for distillation. The best overall model is **not** necessarily the best teacher, and different base architectures likely need different teachers — an underexplored research direction.

### 6. Open-Source Tooling: The Critical Bottleneck

The most practical challenge is that open-source inference tools (especially vLLM) rely on far less developed kernels for hybrid architectures compared to standard transformers. Two key problems:

1. **Numerical instability**: Requires specific flags (`--disable-cascade-attn`, `--enforce-eager`, `--mamba_ssm_cache_dtype fp32`) to maintain output quality
2. **Throughput collapse**: These stability flags dramatically reduce inference throughput, erasing the theoretical compute efficiency gains

The result: today, the 7B hybrid model actually takes **more** compute for RL post-training than the 7B dense model. This is expected to improve over the next 3-6 months as the OSS community develops better kernels.

## Deep Analysis

### The Expressivity Argument

The theoretical argument for hybrid models rests on the **quantization model of neural scaling**. More expressive architectures can represent the same functions with fewer parameters, leading to better scaling laws. The key insight from the paper: hybrid models aren't just "attention + recurrence" — they enable qualitatively new computational patterns that neither component can achieve alone.

This is analogous to the Mixture-of-Experts (MoE) argument: by routing different inputs to different specialized sub-networks, you get better parameter efficiency. Hybrid architectures apply the same principle across computation types rather than input types.

### The KV-Cache Efficiency Win

The most immediate practical benefit of recurrent layers is reduced KV-cache memory. Standard transformers store K and V matrices for every token in the context, leading to O(n) memory growth per sequence. Recurrent layers compress past information into a fixed-size hidden state, enabling:
- Longer effective context windows within the same VRAM budget
- More concurrent users per GPU for serving
- Lower memory requirements for RL training with long rollouts

This connects directly to the [inference cost analysis](ch01/911-20.md) — memory bandwidth is the bottleneck for long-context inference, and hybrid architectures fundamentally reduce this pressure.

### Are Frontier Models Already Hybrid?

The article's author (Nathan Lambert) speculates with ~50% probability that at least one of the three frontier models (GPT, Claude, Gemini) is already using an RNN-hybrid architecture. The economic argument is compelling: if hybrid scaling advantages hold at frontier scale, the training compute savings would be too large to ignore. However, frontier labs may have discovered even more efficient architectures that aren't yet public.

### The Distillation Research Gap

The post-training difficulties point to a significant research gap: **architecture-aware distillation**. Current distillation practices assume a relatively uniform "student" model, but hybrid architectures have fundamentally different learning dynamics. Key open questions:
- What properties make a good teacher for a hybrid student?
- Should different layers of the hybrid model receive different teacher signals?
- Can synthetic data generation be tailored to exploit hybrid architectures' strengths?

## Practical Implications

1. **Architecture research matters again**: After years of "just scale the transformer," hybrid architectures represent genuine architectural innovation with measurable efficiency gains. Labs that invest in architecture research may gain lasting advantages.
2. **Tooling is the real bottleneck**: The gap between theoretical efficiency and practical deployment is primarily a software engineering problem. Contributing to vLLM and other inference engines for hybrid support is high-leverage work.
3. **Distillation needs rethinking**: Teams training hybrid models should invest in finding architecture-appropriate teacher models rather than defaulting to the strongest available model.
4. **Long-context applications benefit most**: Hybrid architectures' recurrent layers provide the most benefit for long-context tasks (agentic workflows, document processing, RL training), aligning well with current industry demand.
5. **Open science advantage**: Olmo Hybrid's value as a research artifact comes from its near-identical comparison to Olmo 3 dense — enabling controlled ablation studies that closed-source models cannot replicate.

## Related Entities

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch03/045-agent.md)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch03/045-agent.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.md)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.md)
- [Inference cost at scale with napkin math](ch01/911-20.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-research-frontiers.md)

---

