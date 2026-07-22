---
source_url: "https://www.morphllm.com/blog/codegen-inference-research""
ingested: 2026-06-26
sha256: ad5f932259a2e885
---

# Optimizing Models to Be Fast at Codegen


Published Time: 2026-06-19

Markdown Content:
An edit is mostly a copy of the file it edits. The agent rereads the same repo every turn. Its context this turn is mostly its context from last turn. A general inference stack throws all of that away and decodes every token like it has never seen anything before.

That waste is the opportunity. The weights are a free download. The speed is the product.

We serve open models, Qwen, GLM, DeepSeek, MiniMax, for one workload: the coding agent. Making them fast comes down to three things the open stack won't do for you.

*   **Train the speculator.** A draft trained on the model's own coding output, not the internet. Generic draft: 1.93x. Trained on the target: 3.07x.
*   **Autoresearch the kernels.** A kernel is correct or it isn't, so we search them automatically, on the cheap GPUs nobody else tunes for. 97 to 162 tok/s on a $7K card.
*   **Write the interconnect.** All-reduce over PCIe, and a prefix cache that crosses NVLink-denied boxes over plain TCP.

Each is a place the general stack stopped and we kept going.

## 1. We train the speculator. The open stack ships you an empty socket.

Speculative decoding: a small draft model guesses the next few tokens, the target checks them in one pass, you keep the run until the first miss. One number decides everything. Acceptance rate, how often the target keeps the guess.

A generic draft is a bad guesser. On Vicuna-13B an off-the-shelf 68M draft gets [1.93x; a draft trained on the target's own output gets 3.07x](https://arxiv.org/html/2503.01840v1), same target, same setup. That gap is the section.

The architectures are public and good. [EAGLE-3](https://arxiv.org/html/2503.01840v1) lets the draft train on raw data instead of copying the target's features, and acceptance length climbs from 3.96 to 6.62. [DFlash](https://www.lmsys.org/blog/2026-06-15-next-generation-speculative-decoding-dflash-v2/), SGLang's Spec V2 since June 2026, drafts a whole block in one pass: over 6x lossless, 3.2x on HumanEval where EAGLE-3 gets 2.2x.

But an architecture is an empty socket. Nobody hands you a drafter trained on your target, for your workload. You train it, or you run the generic one and eat the 1.93x.

Training a good drafter is small-model training, and that is the part we are good at. Fast Apply and Compact made us one of the best teams in the world at it. The thing you learn under 30B: the frontier scaling laws stop applying. Chinchilla says ~20 tokens per parameter is compute-optimal, but that assumes training is the cost. For a model you train once and serve billions of times, it isn't, and the optimum slides hard toward small and overtrained.

*   **Llama 3:** still improving at [15T tokens](https://ai.meta.com/blog/meta-llama-3/), two orders of magnitude past its Chinchilla point.
*   **SmolLM2:** a [1.7B model trained to 11T](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B), near 6,500 tokens per parameter.
*   **Sardana et al.:**[47 models trained to 10,000 tokens per parameter](https://arxiv.org/abs/2401.00448), quality still climbing.

A speculator lives exactly there. Small, overtrained, shaped to one distribution.

So we train one per open model, on coding output instead of web text. Generated code reuses templates and the symbols already on screen, and an edit is mostly a copy of the file it edits. A draft that has read a million diffs predicts those tokens. One that read the internet doesn't, which is why [code is the highest-speedup task for every speculation method](https://arxiv.org/html/2406.16858v1). For Fast Apply we draft 64 tokens a step straight off input-output similarity: apply runs at 10,500 tok/s, compaction at 33,000. Same Qwen weights you can download. Ours is faster because the speculator riding it was trained, by us, on the work.

## 2. We autoresearch the kernels. Everyone else hand-tunes for H100s.

The agent's prompt barely changes between turns. Same system prompt, same tools, same repo, the same files read again. Across real workloads, programming traffic [shares 97% of its prefix tokens, with prompts 37x to 2,494x longer than the outputs](https://arxiv.org/html/2407.00023v2). Cache the prefix and the next request pays only for the new tokens. Hit rate is the cost.

The cache abstraction is open and we use it: [RadixAttention](https://www.lmsys.org/blog/2024-01-17-sglang/) holds prefixes in a tree, a [cache-aware router](https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/) takes hit rate from 20% to 75%, [HiCache](https://www.lmsys.org/blog/2025-09-10-sglang-hicache/) spills the tree to host RAM and remote storage and, on Qwen3-Coder-480B, moves hit rate from 40% to 80% and doubles throughput.

None of that is the hard part. The hard part is kernels. A cache only pays if the lookup, the eviction, the copy, and the attention over the tree are all fast on the GPU you actually run, and default kernels are tuned for the cards frontier labs buy. Port one across architectures without retuning and it runs at [7% of optimal](https://arxiv.org/pdf/2505.03780). Reaching state of the art on AMD's MI250 took rewriting 40% of a flash-attention kernel by hand.

So we don't hand-write them. A kernel is verifiable: correct against a reference output, or not. That makes it a search, and search is something you automate.

Our harness runs that loop on the low-demand NVIDIA and AMD setups nobody else touches. Propose a kernel, verify it against production traces, benchmark it, ship the winners. [KernelBench](https://arxiv.org/abs/2502.10517) shows why you automate it: scored on correct-and-faster, frontier models clear under 20% of tasks cold. Volume and a tight verify loop are the only way through.

One output: our [warp-decode kernels](https://github.com/morphllm/fp4-warp-decode) hit 162 tok/s on an 80B MoE on a $7K RTX PRO 6000, up from 97, past a $25K H100's 120. No accuracy loss, code open. This only pays because [compute is scarce](https://www.morphllm.com/blog/compute-scarcity-kernels), which put a price on the cracks the general stack stepped over.

## 3. We wrote the interconnect. The open numbers assume a fabric we didn't buy.

Cheap GPUs come with a catch. No NVLink.

NVLink moves [900 GB/s between GPUs](https://www.nvidia.com/en-us/data-center/h100/). PCIe Gen5, the bus on the affordable boxes, moves 64 GB/s per direction. 14x less. Invisible until you split a model across GPUs, then it is everything: tensor parallelism fires an all-reduce on every layer, and that all-reduce costs [8-11% of the step on NVLink and 40-75% on PCIe](https://arxiv.org/abs/2406.06858). No fast interconnect, and communication eats most of the forward pass.

The standard fix is to buy NVLink. We wrote the other one.

We write bare-metal kernels for these boxes. All-reduce over PCIe that [overlaps with compute](https://arxiv.org/abs/2406.06858) to hide most of the 14x gap. And a prefix cache that crosses machines over plain TCP.

HiCache already defines a remote L3 tier behind a backend that is [three functions: get, exist, set](https://docs.sglang.io/advanced_features/hicache_design.html). That runs over any transport. The catch is that its published wins are over RDMA, where a transfer is sub-millisecond and costs [under 0.1% of request latency](https://arxiv.org/html/2401.09670v3). Plain TCP is an order of magnitude slower. On a PCIe-only box the open stack quietly falls over, because the number it quoted you assumed hardware you don't have.

So the TCP win can't come from the transport. It comes from the hit rate. The trained speculator and the autoresearched kernels drive the rate high enough that a prefix which misses on the GPU and in host RAM gets pulled from a neighbor over TCP instead of recomputed, and skipping a prefill beats the slow fetch. Against full recompute that fetch cuts time-to-first-token [84%](https://www.lmsys.org/blog/2025-09-10-sglang-hicache/).

The fast fabric everyone buys to avoid this, we replaced with kernels. We run the GPUs the market wrote off, at hit rates that are supposed to require the hardware we didn't buy.

## One workload

Three things, one loop:

*   The speculator drafts the model's own coding output.
*   The kernels keep the cache hot on hardware nobody else supports.
*   The network shares that cache across boxes never wired to share anything.

None of it is general. All of it points at the coding agent, the highest-volume workload in AI. Same open weights everyone has. The speed is ours.

If you're shipping a coding agent, [the stack is one import away](https://docs.morphllm.com/).

