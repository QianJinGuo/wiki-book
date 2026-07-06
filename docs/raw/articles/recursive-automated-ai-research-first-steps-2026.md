---
source: rss
source_url: https://www.recursive.com/articles/first-steps-toward-automated-ai-research
ingested: 2026-06-13
feed_name: Recursive Blog
source_published: 2026-06-11
sha256: d1b05643f40043654e54f65a2bb1c2303262a9fc52d946ef924ade3b5f728cf7
---

# First Steps Toward Automated AI Research - Recursive


Published Time: Thu, 11 Jun 2026 08:50:53 GMT

Markdown Content:
Today we are releasing early results from Recursive’s automated AI research system. Across three benchmarks, the system achieves state-of-the-art results: in fixed-budget language model training, small-model training speed, and GPU kernel optimization.

The system automates the research loop for a target objective: it proposes an idea, implements it, runs an experiment, validates the result, and uses what it learns to choose the next experiment. It runs many research threads over long horizons, keeps useful context from prior experiments, combines promising branches, and puts results through validation for reward hacks and variance before treating improved performance as real progress. It is designed to scale and harnesses principles of open-ended algorithms, building on ideas from previous work by our team and others into recursively self-improving AI.

We tested the system on benchmarks chosen for both practical importance and tight feedback loops. They stress three core levers of AI progress: better training algorithms, faster training, and more efficient use of hardware. They are also well suited to automated research because they have clear metrics, relatively low variance, and evaluators that can be hardened against reward hacks.

We are [open-sourcing artifacts](https://github.com/recursive-org/first-steps-toward-automated-ai-research) from these runs so others can inspect and build on the system’s outputs.

| Benchmark | Task Type | Metric | Previous State of the Art | Recursive | Improvement |
| --- | --- | --- | --- | --- | --- |
| NanoChat Autoresearch | Train a small language model to highest performance given a small compute budget | Validation BPB | 0.9372 | 0.9109 | 0.0263 lower Validation BPB, or a 1.3x speedup to reach the same loss |
| NanoGPT Speedrun | Train a small language model to a certain performance as fast as possible | Training time required to reach a 3.28 validation loss | 79.7 s | 77.5 s | 2.2s faster training |
| SOL-ExecBench | Optimize GPU kernels toward hardware limits | Mean SOL score across 235 kernels | 0.699 | 0.754 | 18% reduction in gap to the optimal performance estimate of 1.0 |

## Case study 1: NanoChat Autoresearch

Andrej Karpathy’s NanoChat [autoresearch repo](https://github.com/karpathy/autoresearch) is a popular starting point for automated research systems. The task is to train a small language model to the lowest validation loss, measured in bits per byte (BPB), within a fixed five-minute budget on a single GPU. It is a natural test of our system because experiments are fast, variance is low, and reward hacks are relatively easy to detect.

Perhaps for those reasons, a public collaborative effort has already formed around this setup. [autoresearch@home](https://www.ensue-network.ai/lab/autoresearch) extends the original setup into a collaborative setting where several dozens of humans and hundreds of their agents collectively improve performance. That gives us a stronger comparison point than Karpathy’s single overnight run. We wanted to test if our system could improve on solutions produced by an entire community of humans and agents.

Our system starts from the same initial seed solution the Autoresearch code starts from. We initially searched on NVIDIA H100 GPUs, then transferred the discovered solution to run on an NVIDIA B200 GPU for a fair comparison to public results. After removing minor reward hacks from the previous best autoresearch@home solution and evaluating it on 10 random seeds, its mean performance is 0.9372 BPB. Our system found a solution that reached 0.9109 BPB, a 0.0263 BPB improvement. Measured another way, our solution reaches the quality of Karpathy’s original overnight autoresearch BPB in roughly 1.3x less training time than the best autoresearch@home solution.

![Image 1: NanoChat Autoresearch: best validation BPB over wall-clock time](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a5c2a900a3c312cdd1277_progress_best.svg)

FIGURE 1

Autoresearch starts from an already optimized model with some non-trivial design decisions baked in. To this end, we tested whether our system could also make improvements from a much weaker starting point, a naive initial implementation (a vanilla Transformer with AdamW). Our system improved the model from 1.059 BPB to 0.9344 BPB (evaluated on an NVIDIA B200 GPU), again outperforming the best solution produced by the autoresearch@home community. This does not necessarily prove independent rediscovery, since the underlying models may know many public techniques including those used by or created by the autoresearch@home community, but it does show that the search process can assemble a competitive training stack from a much weaker starting point. The resulting solution also differed in several ways from the public best solution.

![Image 2: NanoChat Autoresearch: final validation BPB by solution](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a619f6d291d39440cfd9c_val_bpb_karpathy_best.svg)

FIGURE 2

![Image 3: NanoChat Autoresearch: training loss over wall-clock time](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a5c2a424c74435b0c9828_speedup_all.svg)

Figure 3

What modifications did our system come up with? The best solutions were not driven by one trick. They combined changes to architecture, short-context memory, auxiliary losses, attention, optimizer behavior, weight decay schedules, compiler settings, and more.

One of the biggest gains came from a richer short-context memory mechanism. The baseline already uses value embeddings; our system extended this idea with hashed bigram and trigram embedding tables, mixed into the attention value path through learned gates. This gave the model a cheap way to use local n-gram information without paying the time cost of slower convolutional or attention-heavy alternatives.

This connects to recent work such as [DeepSeek Engram](https://arxiv.org/abs/2601.07372), which explores hash tables as a sparsity axis. In our setting, hash tables can add 1-2 billion sparse parameters to a roughly 50M parameter model: most entries are inactive on any given batch, and lookup is cheap. Similar hash-table and n-gram ideas also appear in top NanoGPT Speedrun submissions. The system adapted this family of ideas to the fixed-budget setting by injecting hashed bigram and trigram embeddings into attention value vectors across multiple layers, with different hashes per layer to reduce repeated collisions. We are not aware of prior work using this exact variant.

The expandable boxes below include selected technical details from the system’s solutions. We manually inspected these outputs and used AI-assisted analysis to understand the techniques and screen for reward hacks. We may still have missed errors in kernel optimization where we are not specialists, but that is also part of the point: the ideas presented here came from the system, not from our prior expertise.

### [Hash tables](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

On top of the standard unigram value embedding in the starting solution, in our best solution the model hashes each bigram and trigram into fixed-size tables and mixes the looked-up vectors into the attention value path through learned, input-dependent per-head gates — effectively folding a classic n-gram model into the transformer's value stream.

```
for j, layer_i in enumerate(ve_layers):
           self.bigram_ves[str(layer_i)] = nn.ModuleList([
               nn.Embedding(self.bigram_table_size, half_kv_dim),
               nn.Embedding(self.bigram_table_size, half_kv_dim),
           ])
           self.bigram_hash_primes_per_layer[layer_i] = _decorr_bigram_primes[j]

for j, layer_i in enumerate(sorted(self.trigram_ve_layers)):
           self.trigram_ves[str(layer_i)] = nn.ModuleList([
               nn.Embedding(self.trigram_table_size, half_kv_dim),
               nn.Embedding(self.trigram_table_size, half_kv_dim),
           ])
           self.trigram_hash_primes_per_layer[layer_i] = _decorr_trigram_primes[j]
```

```
v = v + gate.unsqueeze(-1) * ve ## standard value embedding 
v = v + bg_gate.unsqueeze(-1) * bigram_ve ## additional bigram embedding from lookup table
v = v + tg_gate.unsqueeze(-1) * trigram_ve ## additional trigram embedding from lookup table
```

The solution also gives different transformer layers different hash functions (with disjoint hash prime pairs).

```
self.bigram_hash_primes_per_layer[layer_i] = _decorr_bigram_primes[j]
self.trigram_hash_primes_per_layer[layer_i] = _decorr_trigram_primes[j]
```

That means collisions still happen, but they are less likely to happen in the same way across layers.

The run optimizing the vanilla Transformer used some of the same techniques as our best solution, including hash tables and squared-ReLU MLPs. But it also converged on a different (yet equally competitive) final stack, including token-shifting, weight averaging before eval, and byte-level feature embeddings. This suggests the system was not merely repeating the same discoveries it found in the other run. The expandable box below shows a few modifications unique to the vanilla Transformer run.

### [Optimizing a vanilla Transformer](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

Many of the changes in the vanilla Transformer solution also appear in our best solution (which came from starting our system with the Autoresearch initial seed code), such as replacing AdamW with Muon and adding hash tables. A few other improvements did not emerge in our main run that produced the best solution, yet stood out to us. The first is causal token shifting, which blends the previous token's attention projections Q and K into the current token's, with a learned coefficient per dimension.

```
B, T, C = x.size()
x_prev = F.pad(x[:, :-1, :], (0, 0, 1, 0))
q = self.c_q(x + self.q_shift_beta * x_prev).view(B, T, self.n_head, self.head_dim)
k = self.c_k(x + self.k_shift_beta * x_prev).view(B, T, self.n_head, self.head_dim)
v = self.c_v(x).view(B, T, self.n_head, self.head_dim)
```

The second is a set of byte-level features injected right after the token embedding. The byte-level features represent information about what bytes (e.g., individual characters) tokens are composed of. Tokens consisting of similar bytes will get similar byte-level embeddings. The byte feature embedding matrix is built as follows:

```
combined = torch.zeros(vocab_size, 769)
for token_id in range(vocab_size):
    raw_bytes = tokenizer_enc.decode_single_token_bytes(token_id)   # variable length
    if len(raw_bytes) > 0:
        for b in raw_bytes[:max_bytes]:              # max_bytes=16
            combined[token_id, b] += 1.0 / len(raw_bytes)   # [0:256] byte-frequency histogram
        combined[token_id, 256 + raw_bytes[0]] = 1.0          # first byte one-hot
        combined[token_id, 512 + raw_bytes[-1]] = 1.0         # last byte one-hot
        combined[token_id, 768] = len(raw_bytes) / max_bytes  # length feature
torch.manual_seed(1337)
proj = torch.randn(769, embed_dim) * 0.01
init_emb = combined @ proj                # [vocab, embed_dim]
self.embed = nn.Embedding(vocab_size, embed_dim)
self.embed.weight.data.copy_(init_emb)    # used only as the INIT
```

These embeddings are then updated by gradient descent during training, and added after the token embedding alongside the bigram and trigram embeddings:

```
x_base = self.wte(idx)                 # token embedding
gates  = self.embed_mixer(x_base)      # per-token gates over 4 sources [B,T,4]
x = x_base
x = x + gates[:,:,0:1] * bi_raw                       # bigram hash
x = x + gates[:,:,1:2] * tri_raw                      # trigram hash
x = x + gates[:,:,2:3] * self.byte_embed.get_raw(idx)      # byte-content
x = x + gates[:,:,3:4] * self.byte_boundary.get_raw(idx)   # byte-boundary
x = x + self.ssm_light(x)
x = self.embed_ctx_norm(x)
```

These are just a few of the changes our system made in this run.

NanoChat shows how asking our system to improve fixed-budget training led to the discovery of many compounding, budget-aware improvements. The next test was whether the same process could still find gains after years of public human optimization on a benchmark. We tested that on NanoGPT Speedrun, whose best public solution has been highly optimized by the community over two years.

## Case study 2: NanoGPT Speedrun

[NanoGPT Speedrun](https://github.com/KellerJordan/modded-nanogpt) is a similar task, yet it's much harder to beat the state of the art because a large community has been optimizing solutions for it for over two years. Instead of asking how low of a validation loss can be achieved in a fixed time budget, the benchmark asks how quickly a small GPT-style model can be trained to a fixed validation loss of 3.28 on the FineWeb text dataset, using a single HGX H100 8-GPU node.

This is a mature community effort, with 83 human record-setting contributions to the leaderboard so far and hundreds of proposed PRs. Since mid-2024, the training time has been pushed from roughly 45 minutes down to 79.7 seconds through a long sequence of primarily hand-engineered submissions. Given that the current solution is so well optimized, there are few obvious improvements left.

Starting from the current leading solution, our system found a set of additional optimizations that reduced training time from 79.7 seconds to 77.5 seconds while still meeting the leaderboard’s validation-loss significance requirement (mean validation loss ≤ 3.28 at p < 0.01).[1](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#footnote-1)This is a similar or larger improvement than recent human contributions.

### [The 77.5 s solution: FP8 attention, exploration noise, and cautious embeddings](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

The changes below are examples of innovations it created and combined to reach 77.5 s (in ~ 200 changed lines across the training script and kernel file).

**FP8 attention projections.**The human record runs the attention QKV (query, key, and value) and output projection layers in bf16 (bfloat16, a 16-bit floating-point format), and only uses FP8 (8-bit floating-point) in the LM head (the final layer that predicts the next token).The system pushed FP8 into the attention path (the computations inside the attention layers) — a custom operation that performs the forward matrix multiplication in float8_e4m3 (an FP8 format with 4 exponent bits and 3 mantissa bits) for 2× tensor-core throughput, while keeping the backward pass in bf16 for stability, and only during training (bf16 is restored for the validation forward pass):

```
class FP8LinearFunction(torch.autograd.Function):
    @staticmethod
    def forward(ctx, x, w):
        x_f8, w_f8 = x.to(torch.float8_e4m3fn), w.to(torch.float8_e4m3fn)
        y = torch._scaled_mm(x_f8, w_f8.T, out_dtype=torch.bfloat16,
                             scale_a=ones, scale_b=ones, use_fast_accum=True)
        ctx.save_for_backward(x, w)
        return y
    @staticmethod
    def backward(ctx, grad_output):       # backward stays in bf16 for precision
        x, w = ctx.saved_tensors
        return grad_output @ w, grad_output.T @ x

# applied to the attention projections, training only:
if self.training:
    qkv = fp8_linear_fn(x.view(-1, self.dim), qkv_w)
else:
    q, k, v = F.linear(x, ...)            # bf16 at eval
```

**Annealed exploration noise in the optimizer**[(Langevin/SGLD)](https://www.semanticscholar.org/paper/aeed631d6a84100b5e9a021ec1914095c66de415). The system modified the [NorMuon](https://arxiv.org/abs/2510.05491) update to inject zero-mean Gaussian noise onto the orthogonalized, variance-reduced update, with the noise standard deviation scaled per-row to the update's own root-mean-square (so it is scale-invariant across parameters). The noise is warmed up over the first 50 steps and then linearly annealed to zero about a quarter of the way through training, so the final solution tends to settle cleanly in a (hopefully flatter) basin:

```
def _add_exploration_noise(v_chunk, noise_t, red_dim):
    sigma   = noise_t.to(v_chunk.dtype)                       # annealed scale (0-D CPU tensor)
    row_rms = v_chunk.float().square().mean(red_dim, keepdim=True).sqrt_()
    return v_chunk.add_(torch.randn_like(v_chunk) * (sigma * row_rms))
```

**Cautious (sign-agreement)**Adam on the embedding tables. The human record’s solution already uses cautious weight decay. The system extended the "cautious" idea to the Adam update step itself, for the bigram and value-embedding banks specifically — masking out parameter updates where the adaptive step points in the opposite direction from the raw gradient, renormalizing the remaining update, and mixing that cautious update with the standard Adam update at strength 0.5:

```
agree         = (update * g_slice) > 0
keep          = agree.to(update.dtype)
masked_update = update * (keep / keep.float().mean().clamp_min_(1e-3))
update.lerp_(masked_update, strength)        # adam_coptim=0.5, only on bigram_embed + value_embeds
```

**A leaner fused MLP kernel.**The system also rewrote the fused linear-ReLU²-linear Triton kernel so the forward pass stores only the squared ReLU activations, while the backward pass reconstructs the unsquared activations on the fly inside the kernel, eliminating a full activation tensor round-trip to the high-bandwidth GPU memory.

Alongside these improvements, our system made several smaller systems and schedule-level choices: it used a sparse final-step language-model-head gradient update, where only the vocabulary rows that actually appear in the batch are written back via index_add_ instead of a dense transpose-add; keeping the embedding tied to the language-model head for the entire run, rather than splitting them at the two-thirds point as the human solutions do; retuning the stage schedule and step count to 1,387 scheduled steps plus 11 extension steps; and using fewer paired-head attention layers.

![Image 4: NanoGPT Speedrun: training time to a 3.28 validation loss](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a5c2a943a4c54caff1b0b_timeline.svg)

FIGURE 4

We also tested whether the system could make progress from a much weaker starting point. Starting from an earlier roughly 15-minute solution (we chose the first working Python solution in the lineage of champions (entry #5), as earlier versions were in C), our system reached approximately 185 seconds in a few days, close to the human leaderboard’s May 2025 roughly 180-second level. This should not be read as independent or unique discovery, since the underlying models may have seen the repository, but the system found a different final solution and added the overlapping contributions in a different order.

### [Analysis of the 185 s from-scratch solution: a different route to 3 minutes](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

This solution was close to the May-2025 ~3-minute (180s) record (#22, 179.4 s). Both share standard, modern ideas. Our solution does not use the human record's merged-QKV or long-short attention. Further divergences include:

**Stitched-stream attention.** The training data arrives as many short sequences. The system packs eight of them into a single ~16k-token stream so the model's local attention window can carry context across the boundaries between them, while a mask still prevents any token from attending across a document boundary or to future tokens:

```
STITCH_GROUP = 8                      # fold 8 rows -> one (B//8, 8*T) = (·, 16384) sequence
mask = causal & same_doc & (q_idx - kv_idx < window)   # no cross-doc / future leakage
```

**A per-layer window pyramid.**Most layers attend only to the nearby 384 tokens, while three layers look out to 2,048 tokens, giving a cheap mix of local and longer-range views instead of one uniform window.

**Narrowed attention.**Four attention heads (total width 512, below the model's full width of 768), which cuts the compute per step in place of the humans' wider, fused-projection setup.

**Cross-layer-diff (cldiff).**A later layer mixes in a small, learnable fraction of an earlier layer's attention output, a cheap way to reuse information the model has already computed:

```
# later layer blends a detached earlier-layer attention output, per-head learnable λ:
y = y - lam * rms_norm(cldiff_src)    # cldiff_src = earlier-layer attn output (detached)
```

**Hashed bigram embeddings.**A small lookup table keyed on adjacent token pairs, mixed into the input through a gate that starts at zero so it only contributes if it helps. The human leaderboard adopted a similar "Bigram Hash Embedding," but added it in a different order in the technological development of the stack.

**FP8 plus custom fused Triton kernels.**The system runs the feed-forward and output layers in 8-bit floating point during training (full precision is restored for evaluation), and merges several GPU operations into single custom kernels to cut memory traffic. For comparison, at the May-2025 point the human records used 8-bit only in the final layer, and adopted fused kernels like these only months later (records #27 in July 2025 and #59–60 in January 2026).

**Optimizer & systems tricks.**A handful of smaller changes to how the optimizer accumulates its updates and how the large lookup table's gradients are shared across the eight GPUs (using compressed, less-frequent communication), each saving a little time.

The 77.5s solution was not a single optimization. It combined changes to attention precision, optimizer behavior, embedding updates, schedule choices, and fused GPU kernels. Each change had to save time without destabilizing training.

Despite an entire community of humans (sometimes with AI assistance) spending years working on this problem, Recursive’s automated AI research system still discovered additional improvements. The next case study moves one level lower, from small-model training recipes to GPU kernels. Unlike the first two benchmarks, kernel optimization is closer to production systems work: it often determines the cost of real training and inference workloads.

## Case study 3: SOL-ExecBench

The first two benchmarks optimize small language model training runs. [SOL-ExecBench](https://research.nvidia.com/benchmarks/sol-execbench) instead focuses on writing fast, correct GPU kernels: the small accelerator programs behind operations such as matrix multiplications, reductions, normalization layers, attention components, quantization routines, and fused blocks.

The benchmark contains 235 kernel-writing tasks derived from real workloads. Each task provides a simple reference PyTorch implementation that defines the signature, tensor shapes, data types, and numerical contract (what output the kernel must produce, and how close it must be to the reference implementation). The goal is to produce the same result within tolerance while running as fast as possible on NVIDIA Blackwell B200 GPUs.

The benchmark reports a Speed-of-Light (SOL) SOL-ExecBench score: 0.5 corresponds to the benchmark’s optimized PyTorch baseline, and a score of 1.0 corresponds to the benchmark’s analytical optimal performance estimate.

We ran our system across all 235 kernels jointly, so it could reuse its discoveries for better ways to do things across related tasks (e.g. patterns for memory movement, tiling, reductions, vectorization, and fusion). We provided standard profiling tools but did not specifically tune the system for kernel engineering. Aside from adding profiling tools, we use the same system to optimize kernels as in the other two benchmarks.

Our system achieved a mean NVIDIA SOL-ExecBench score of 0.754, an 18% reduction in the gap to the hardware limit from the previous leaderboard best of 0.699.

![Image 5: SOL-ExecBench SOL score per kernel](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a5c2a19f9f42de5e9ea69_recursive_vs_sota_pretty_zoom.svg)

FIGURE 5

![Image 6: SOL-ExecBench: mean SOL score by kernel category](https://cdn.prod.website-files.com/69c2d7e2ad6312d0a414043e/6a2a5c29690b5e223da54949_recursive_vs_sota_pretty_means_by_category_zoom.svg)

FIGURE 6

We checked a few high-performing kernels and found that the solutions include a range of good kernel engineering practices and creative solutions. The expandable boxes provide a few examples for those interested in the details.

### [Example L1 kernel **045_fused_linear_gelu_grn_linear (L1)**](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

### What the kernel does

The op is Linear → GELU → GRN → Linear. GRN (ConvNeXt-V2's Global Response Normalisation) takes the activation after GELU and applies a per-channel affine whose scale depends on the per-channel L2 norms of the activation:

`out[i] = x[i] * (1 + gamma[i] * n[i] / mean(n)) + beta[i]`
Here i indexes channels, n[i] is the L2 norm of channel i (reduced across the spatial-token axis), and gamma, beta are learned per-channel parameters. The cross-channel reduction mean(n) makes GRN awkward to fuse with either neighbouring linear in a single GEMM epilogue.

### The solution

Rather than execute GRN between the two linears, the kernel rewrites the second weight matrix on every forward pass to absorb the affine. Let s_inv = 1 / (mean(n) + eps), and use j for the output row index of W2 and i for the channel/input index. Then:

```
W2_prime[j, i] = (1 + gamma[i] * n[i] * s_inv) * W2[j, i]
b_eff[j]       = sum_i ( beta[i] * W2[j, i] ) + b2[j]
out[j]         = sum_i ( x[i] * W2_prime[j, i] ) + b_eff[j]
```

The first equation is computed in a small Triton kernel; the last is a strided-batched fp16 GEMM against the per-batch prescaled W2_prime, with b_eff consumed by the GEMM's bias-add epilogue via CUBLASLT_EPILOGUE_BIAS.

The per-channel scale and the absorbed-bias accumulator run in one loop (gw is gamma, gb is beta, wf is the fp32 row of W2, oh is the fp16 cell of W2_prime, bc2 accumulates the absorbed-bias term):

```
for (int i = 0; i < VEC; ++i) {
    float sc = gw[i] * (n[i] * s_inv) + 1.0f;
    oh[i]    = __float2half(sc * wf[i]);
    if (wb) bc2 += gb[i] * wf[i];
}
```

W2_prime is materialised as a {B, DIM, HIDDEN} fp16 tensor; each batch element gets its own prescaled W2_prime.

### [Example L2 kernel 049_group_limited_topk_routing (L2)](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

### What the kernel does

DeepSeek-V3-style group-limited expert top-K. 256 experts are partitioned into 8 groups of 32. Each group is scored by the sum of its top 2 expert scores; the top 4 groups are kept; a per-token top-K = 8 is then selected over the kept groups, and the K winning weights are renormalised to sum to 1.

### The solution

Bit-packed (score, expert_index) key. Each candidate is packed into one orderable uint32, so each top-K iteration uses a single __reduce_max_sync whose winner decodes to both score and expert index without a separate index broadcast. Upper 24 bits hold the score's IEEE-754 bit pattern; the low byte holds 255 - expert_idx for tie-breaking by lower index:

```
constexpr uint32_t TOP8_VALUE_MASK = 0xffffff00u;
CUTLASS_DEVICE uint32_t make_top8_key(uint32_t shifted_route_bits, int expert_idx) {
  return (shifted_route_bits & TOP8_VALUE_MASK) | (uint32_t)(255 - expert_idx);
}
```

The route value is sigmoid(logit) + bias + 16.0 so the bit-pattern is non-negative and directly orderable as an unsigned integer.

**Fused routing tail in one CUTLASS device functor.**The whole tail — sigmoid, add bias, per-group top-2 sum, top-4-group prune, per-lane top-K, bitonic-sort the 8 winners, renormalise — runs as one warp-per-row functor.

**PDL with the preceding GEMM.**The functor is launched with cudaLaunchAttributeProgrammaticStreamSerialization so its grid setup overlaps the preceding bf16 logits GEMM's tail.

### [Example Quant kernel 032_nvfp4_moe_expert_linear_with_gating (Quant)](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

### What the kernel does

Fused NVFP4 SwiGLU MoE expert:

```
gate = W_g @ x
up   = W_u @ x
out  = W_d @ ( silu(gate) * up )      # * is elementwise
```

All three weights (W_g, W_u, W_d) are stored in NVFP4 — NVIDIA's 4-bit microscaling format. Values are E2M1; each 16-element block carries an FP8 (E4M3) scale; the whole tensor carries one additional FP32 scale. Dequantisation composes the block and tensor scales.

### The solution

**FP4 packing via native PTX.**The conversion uses the cvt.rn.satfinite.e2m1x2.f32 instruction to pack two FP4 values per byte directly, rather than soft-emulated quantisation:

```
packed_byte = tl.inline_asm_elementwise(
    "{ .reg .b8 b; cvt.rn.satfinite.e2m1x2.f32 b, $2, $1; cvt.u32.u8 $0, b; }",
    "=r,f,f", [v0, v1], dtype=tl.uint32, is_pure=True, pack=1,
)
```

**Weight staging and scale reblocking outside the captured CUDA graph.** A single Triton kernel partitions its grid by CTA region: the first n_scale_tiles CTAs do the scale reblock; the remaining CTAs copy the gate / up / down weights. This staging kernel runs _before_ the captured CUDA graph replays — the graph itself contains only the quantize → GEMM → SwiGLU → re-quantize → GEMM compute path.

**FP32 SwiGLU between the FP4 layers.**Between the gate/up FP4 GEMM output and the down-projection FP4 re-quantisation, the SwiGLU activation runs in FP32, avoiding cascading FP4 rounding through the activation.

### [Example FlashInfer-Bench kernel 012_gqa_paged_decode_h32_kv4_d128_ps1 (FlashInfer-Bench)](http://www.recursive.com/articles/first-steps-toward-automated-ai-research#)

### What the kernel does

Single-query GQA paged-attention decode: 32 query heads sharing 4 KV heads, head_dim = 128, page_size = 1. One query token per request, paged KV cache with one slot per page. The reference is FlashInfer.

### The solution

Fused last-block reduction in the compute kernel. Each split program writes a partial (m, l, acc) to scratch; an atomic done counter elects the last-arriving split to merge all partials and reset the counter for the next call (abridged):

```
prev = tl.atomic_add(done_ptr + b * stride_db + kvh * stride_dh, 1,
                     sem="acq_rel", scope="gpu")
if prev == (NUM_SPLITS - 1):
    m_part   = tl.load(m_ptr   + ...)
    l_part   = tl.load(l_ptr   + ...)
    acc_part = tl.load(acc_ptr + ...).to(tl.float32)
    valid    = l_part > 0.0
    m_part   = tl.where(valid, m_part, -float("inf"))
    m_final  = tl.max(m_part, axis=1)
    alpha    = tl.exp2(m_part - m_final[:, None])
    # rescale, finalise, then store 0 to done_ptr
```

The acq_rel / gpu-scope semantics on the atomic provide the ordering the elected block needs to safely read the partials. The reduction is fused into the compute kernel rather than running as a separate launch.

**Log-base-2 online softmax.**The query is pre-scaled by sm_scale * log2(e) at entry; the inner loop uses tl.exp2; the final LSE is m + log2(l). Maps directly onto the hardware ex2.approx.f32 instruction.

**Two-stage shape-aware dispatch.**A Python cascade picks (NUM_SPLITS, split_block_n) from batch and the average sequence length, then a second cascade picks the kernel variant and its tile sizes (BLOCK_N, num_warps, num_stages).

While reward hacking was an issue we contended with for all three benchmarks, it was particularly challenging on SOL-ExecBench. Some candidates exploited the evaluation setup instead of implementing genuinely faster kernels: caching outputs, relying on persistent state, or taking advantage of timing-harness details.

For that reason, we treated a correctness audit as part of the research system on all of the benchmarks. Promising improvements were passed through increasingly strict automated checks designed to distinguish genuine kernel improvements from benchmark-specific exploits. This substantially reduced reward hacks and became an important part of the loop itself: as the search became stronger, the evaluator had to become stronger too.

SOL-ExecBench demonstrates the ability of our system to improve an entirely different part of the AI stack. It had to reason about low-level implementation choices, generate candidate kernels, run correctness and performance checks, and transfer useful patterns across related tasks.

## What’s Next

These results are an early sign that our system can push the frontier on AI training and infrastructure tasks, especially when the goal is well-defined, measurable, and quick enough to evaluate many times. The system made progress by compounding many discoveries: inventing new optimizations, recasting known ideas under tighter constraints, tuning implementation details that mattered, and composing improvements across modeling, optimization, and systems layers.

Throughout this work, and especially as our search becomes more powerful, a key challenge is reward hacking (i.e. making sure the system solves the intended task instead of exploiting loopholes that meet the letter of the task and score highly, but subvert the intention of the task). We implemented many techniques to avoid and detect such reward hacking, including iteratively improving a reward hacking detector with AI-assisted and/or human feedback. We expect this will remain necessary as we tackle ever more challenging real-world applications and create more powerful automated AI research algorithms. Aligning such systems to solve the spirit of the task, and not its letter, will be a grand challenge of creating systems that automate knowledge discovery and recursively self-improve in a way that is safe and helpful. We are excited to continue to work on that essential problem.

Many of the gains here improve efficiency. That matters because AI progress does not come only from larger models and more compute; it also comes from making existing systems train faster, run cheaper, and use hardware more effectively. We expect systems like this to reduce the cost of intelligence: first by finding better engineering tradeoffs in today’s systems, and over time by automating larger parts of the frontier research process itself.

We are [open-sourcing artifacts](https://github.com/recursive-org/first-steps-toward-automated-ai-research) from these runs so others can inspect and build on the system’s outputs. If you’re interested in building systems that make automated research more capable and beneficial for humanity, [please apply to join us](mailto:talent@recursive.com).

Footnotes

1.   We obtained our results on Modal HGX H100 8-GPU nodes and independently re-confirmed the numbers on Andromeda HGX H100 8-GPU nodes within noise. We are awaiting access to PrimeIntellect HGX H100 8-GPU nodes (the official hardware) to submit to the leaderboard.
