# Everything a Senior Engineer Needs to Know About What's Inside an LLM

> 📊 Level ⭐⭐⭐ | 9.2KB

> **来源**: [Everything a Senior Engineer Needs to Know About What's Inside an LLM](https://www.pathtostaff.com/p/everything-a-senior-engineer-needs)

## 摘要

Part Two of a five-part series that walks an experienced engineer through the LLM stack; this instalment covers model architecture — why recurrent networks lost, and how "Attention Is All You Need" became the paper that started it all. The author's angle is an engineer doing deep research rather than a researcher deriving math, so the value is the causal story of *why* each step displaced the last. The series structure is itself the argument: architecture is one layer of five, between hardware and training on one side and post-training and serving on the other.

## 核心要点

- RNNs lost for two engineering reasons: the **sequential bottleneck** (N sequential steps for a length-N sequence, however much hardware you add) and **long-range decay** (the same weights multiplied at every step make gradients vanish or explode, so an early token cannot shape a late one).
- LSTMs and GRUs mitigated what was remembered but left both flaws intact — they changed memory's content, not the computation's schedule.
- Bahdanau et al. (2014) added **attention** as a bolt-on: rather than squeezing the input through one fixed summary vector, let the model weight whichever tokens matter for the current step. Still inside a recurrence: the bottleneck survived.
- Vaswani et al. (2017) changed one thing: keep attention, **delete recurrence**. Self-attention makes all token pairs one parallel matrix multiply, and with no chain left, nothing decays.
- A transformer is a sequence processor: input → N identical blocks → prediction head → **logits**, raw per-vocabulary scores that become words.
- The canonical walkthrough is encoder–decoder translation ("The cat sat on the mat" → "猫坐在垫子上") — the task the paper was written for, though it already argued the same blocks generalise.
- The five-part split is itself the insight: hardware, architecture, training, post-training/alignment and inference/serving/agents are separate disciplines with separate failure modes and cost centres.
- After 2017 the frontier branched into encoder–decoder (translation), encoder-only (understanding), decoder-only (generation) and diffusion as a non-left-to-right regime.

## 深度分析

### "Attention Is All You Need" 真正取代了什么

The famous framing says the paper introduced attention, but attention already existed — Bahdanau bolted it onto a recurrent network three years earlier. What 2017 actually displaced was **recurrence as the mechanism for carrying information across positions**. Narrower, and more consequential: information need not travel down a chain, and once you stop chaining, the computation becomes a dense batched matrix multiply that accelerators love.

Read this way, the transformer is as much a hardware-shaped result as a modelling one. The RNN's limit was stated in systems terms — "training time was bound by the length of the chain, not the size of the chain" — and self-attention wins because the whole sequence is processed at once, so adding hardware buys throughput. That is why a translation paper became the substrate for everything downstream.

### Encoder-Decoder、Decoder-Only 与 Diffusion 的位置

The translation example is encoder–decoder, with a clean division of labour: the encoder reads the input, the decoder generates the output. That split answers a question most people never ask out loud — who may look at what, and when. An encoder reads bidirectionally with the whole input in hand; a decoder writes causally, never seeing tokens it has not produced.

Decoder-only models (the shape that won for general-purpose LLMs) collapse that distinction: every token may only look backwards, so one stack serves reading and writing, and "understanding" becomes a special case of generation with the input as a prefix. Diffusion models sit on another axis, generating a whole candidate answer and iteratively denoising it instead of emitting tokens in causal order. As engineering contracts these are three different things — read-then-write, prefix-in/token-out, parallel-refine — not a ladder of capability.

### 架构与训练：能力究竟从哪来

Architecture fixes what is *representable* and at what cost per token; training — data, objective, scale — decides what actually gets *learned* inside that capacity. The transformer shows why both matter: the architecture made scaling affordable by turning sequence processing into parallel work, and scale is what turned capacity into capability. Neither half alone explains GPT-class behaviour.

This is the boundary the article's arc runs into. It explains mechanism thoroughly — flow, blocks, heads, logits — but never capability, because capability is not in the block diagram. The consequence is a ranking rule: when a benchmark number moves, "they changed the architecture" is weak unless the token or compute budget moved with it, while "they changed the data or the post-training recipe" is usually stronger.

### 为什么生产环境的账单由 Serving 和 Agent 决定

The series' ordering is telling: hardware, architecture, training, post-training/alignment, then inference, serving and agents — the last flagged as "closest to you as an AI user", covering streaming, latency, MCP, RAG and agents. That is where the money goes. Per-token architecture sets serving behaviour (how context is stored, how costly a long prompt is to re-read), but the dominant term in a real bill is how many tokens a loop carries per step and how many model calls a task takes.

An agent re-sending a 20k-token context on each of fifteen turns is not expensive because the model is smart; it is expensive because the architecture's memory behaviour is multiplied by loop structure. Architectural choices about attention and context therefore surface as finance and latency questions rather than leaderboard questions — which is why an engineer can be right about the architecture and still wrong about the system.

### 架构给不了你这个工程师什么

Nothing in the block diagram tells you whether a model will refuse a request, hallucinate a citation, call a tool correctly, or express honest uncertainty. Those behaviours come from the data it saw and from post-training and alignment, and are invisible to anyone reading the architecture. Two models can share a near-identical architecture and parameter count and behave completely differently, which makes "same architecture" comparisons weak evidence.

Architecture constrains the ceiling and the cost curve; alignment and prompting set the behaviour. A senior engineer reading a model announcement should separate three claims that usually arrive fused: what the architecture can represent, what the training budget bought, and what post-training optimised for.

## 实践启示

1. **Diagnose long-context failures by mechanism.** Attention-pattern limit (architecture), distribution shift (training), or instruction-following gap (post-training)? Remedy, owner and cost differ completely for each.
2. **Interrogate "new architecture beats transformers" claims.** Which moved: parallelisability, memory per token at long context, or raw quality? Only the first two are architecture stories.
3. **Budget context as a first-class engineering cost.** Price a feature in tokens-per-turn × turns, not in "how smart the model is" — that is how an agent loop becomes the largest line item.
4. **Refuse to attribute benchmark deltas to architecture** when data, compute or token budgets also changed. Hold the variables apart before concluding anything from a leaderboard.
5. **Use the five-layer stack as a debugging checklist** — hardware, architecture, training, post-training, serving/agents — and assume production incidents live in the last layer until proven otherwise.
6. **Read "Attention Is All You Need" as a cost-model paper too.** Deleting recurrence unlocked parallelism, and parallelism made scale affordable; that is the transferable lesson, not the softmax.

## 相关实体

- [Attention Mechanism](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/attention-mechanism.md)
- [Transformer Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/transformer-architecture.md)
- [LLM Tokenizer](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-tokenizer.md)
- [Scaling Laws](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/scaling-laws.md)
- [LLM 推理流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-inference-pipeline-internals.md)
- [LLM Post-Training 全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-post-training-full-guide.md)

---

→ [原文存档](https://www.pathtostaff.com/p/everything-a-senior-engineer-needs)

---

