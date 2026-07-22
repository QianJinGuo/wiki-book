---
title: "LLM 推理流水线完整解析：从 Token 到流式输出"
source_url: https://mp.weixin.qq.com/s/1zZ0UXCNUA1UJ39gJNDQjg
ingested: 2026-06-30
sha256: 48945c9bf7479fee8000cdc7f76222dcf90f3293925295d1a640c65143069b02
---

每次调用 LLM 的 generate()，都会在同一块 GPU 上经历两个不同的计算阶段：

prefill，处理 prompt，主要受计算能力限制；
decode，逐个生成 token，主要受内存带宽限制。

大多数推理优化主要针对其中一个阶段。想让部署变快，第一步就是判断瓶颈到底在哪个阶段。

这篇文章会从分词后的输入一直讲到流式输出，把完整流水线走一遍，并看清每个阶段的时间花在哪里。



目录
1. 分词与嵌入
2. Transformer 层
3. Prefill：计算受限阶段
4. Decode：内存受限阶段
5. KV 缓存
6. 围绕缓存重新设计注意力
7. 量化
8. 推理服务基础设施
9. 完整推理路径
10. 一些实践结论
1. 分词与嵌入

Byte Pair Encoding（BPE）这类 tokenizer 会把原始文本转换成词表里的整数 ID。词表规模通常在 50,000 个 token 左右。

prompt = "How does inference work?"
ids = tokenizer.encode(prompt)
# ids -> [2437, 1374, 32278, 670, 30]

每个 ID 会映射到 embedding table 中的一行。embedding table 是一个形状为 [vocab_size, hidden_dim] 的可学习矩阵。对于 hidden dimension 为 4,096 的模型，每个 token 会变成一个 4,096 维向量。

# embedding_table has shape [vocab_size, hidden_dim]
vectors = embedding_table[ids]   # shape: [num_tokens, 4096]

位置信息也会在这个阶段注入。

多数现代架构使用 Rotary Position Embeddings（RoPE）。RoPE 不是额外加一个位置向量，而是通过旋转 embedding 向量来编码位置。

2. Transformer 层

嵌入后的序列会经过一组 Transformer 层。层数通常在 32 到 80+ 之间，取决于模型规模。

每一层依次执行两个操作。

Self-attention 会通过可学习权重矩阵，为每个 token 计算三组投影：query Q、key K、value V。

每个 token 的 query 会和其他所有 token 的 key 做打分。分数经过 scaling 和 softmax 后，会决定每个 token 的 value 以多大权重混入当前表示。

# scores: how much each token attends to every other token
Q, K, V  = x @ Wq, x @ Wk, x @ Wv

scores = (Q @ K.T) / sqrt (d_k)

weights = softmax(scaled) # one row per token, sums to 1
attn_output  = weights @ V

Feed-forward network（FFN）会用两层 MLP 独立处理每个 token 的向量。Attention 负责在不同位置之间传递信息，FFN 负责变换每个位置上的表示。

最后一层结束后，模型会把最后一个 token 的 hidden state 投影回词表大小，也就是 [hidden_dim, vocab_size]，再做 softmax，并从得到的分布中采样出第一个输出 token。

3. Prefill：计算受限阶段

处理输入 prompt 是第一个阶段。所有 token 会并行处理：每个 token 的 Q、K、V 同时计算，attention 以大型矩阵乘矩阵的形式运行。

这是 compute-bound 的工作。瓶颈在 GPU 的算术吞吐，GPU 利用率通常很高。衡量这个阶段的指标是 Time to First Token（TTFT），也就是从请求开始到第一个输出 token 出现之间的延迟。

prefill 阶段还会填充 KV cache：每一层的 K 和 V 张量都会存入 GPU 内存，后续重复使用。

# Prefill: process the whole prompt in one shot
hidden = embed(prompt_tokens) + positions
for layer in model.layers:
    Q, K, V = project(hidden)             # for ALL tokens at once
    hidden  = attention(Q, K, V) + hidden
    hidden  = feedforward(hidden) + hidden
    cache_kv(layer, K, V)                 # save for later
first_token = sample(project_to_vocab(hidden[-1]))

4. Decode：内存受限阶段

第一个 token 生成后，模型会切换到逐个 token 生成。对每个新 token，模型只会为这个 token 计算 Q、K、V。之前所有 token 的 K 和 V 已经在缓存里。

# Decode: one token per iteration
token = first_token
steps = 0
while token != STOP and steps < MAX_STEPS:
    x = embed(token) + position(steps)
    for layer in model.layers:
        q, k, v = project(x)
        K_all, V_all = caches[layer].append(k, v) # cached history + new
        x = layer.forward(q, K_all, V_all, x)  # attention + FFN, residuals
    token = sample(project_to_vocab(x))
    steps += 1
    yield token

每一步的算术量都很小。它只需要用一个 query 向量和缓存中的 key 矩阵做计算，不再是完整的矩阵乘矩阵。但 GPU 仍然要为这次小计算从内存加载所有权重矩阵，以及完整的 K/V 缓存。瓶颈就从计算吞吐切换成了内存带宽。

衡量这个阶段的指标是 Inter-Token Latency（ITL），也就是连续两个输出 token 之间的时间。低 ITL 会让模型响应起来更流畅。

5. KV 缓存

如果没有缓存，生成一个 1,000-token 的回答，就需要在每一步都对不断增长的完整序列重新计算 attention，复杂度会变成平方级。

KV cache 会把每一层的 K 和 V 张量存一次，并在生成过程中增量追加新条目。

对于长输出，提速通常大约是 5 倍或更高。

代价是缓存会随着序列长度线性增长，而且每一层都有自己的缓存。对于一个 13B 参数模型，缓存大约每个 token 消耗 1 MB。4K-token 上下文仅 KV cache 就会吃掉 4 GB 显存。

这也是长上下文昂贵的原因。缓存会直接和 batch size 争夺 GPU 内存。单个请求占用的缓存越多，同一块 GPU 能承载的并发请求越少。

常见缓解方法包括：把缓存量化到 INT8 或 INT4；使用 sliding window attention，丢弃固定窗口外的 token；使用 grouped-query attention（GQA），在多个 attention head 之间共享 K/V，减少缓存张量数量；以及 PagedAttention，也就是 vLLM 背后的内存管理技巧，像操作系统分页虚拟内存一样分页管理缓存，从而消除碎片。

6. 围绕缓存重新设计注意力

量化和分页都把 KV cache 看成一个需要管理的固定成本。DeepSeek V4 Preview 在 2026 年 4 月 24 日发布，它采用了另一条路径：重新设计 attention，让缓存从结构上就更小。

V4 使用了两种压缩 attention 机制的混合方案。

Compressed Sparse Attention（CSA）先用 softmax-gated pooling 将 KV 条目压缩 4 倍，再对压缩后的 token 做 sparse attention。

Heavily Compressed Attention（HCA）更激进。它会把 128 个 token 的 KV 条目合并成一个压缩条目，并在这些表示上做 dense attention。

在 1M-token 上下文下，相比 DeepSeek-V3.2，V4-Pro 的单 token 推理 FLOPs 只需要 27%，KV cache 只需要 10%。

换成绝对值，bf16 下 1M 上下文的每个序列需要 9.62 GiB KV cache。作为对比，V3.2 风格架构估算需要 83.9 GiB。再叠加 fp4/fp8 量化，缓存还能再缩小 2 倍。

KV cache 已经成了约束条件，模型架构正在围绕它做优化。

7. 量化

训练为了保证梯度稳定性，会使用 FP32 或 BF16。推理不需要这样的精度。降低 bit width 带来的内存节省是线性的：

7B 参数，FP32：28 GB
7B 参数，FP16/BF16：14 GB
7B 参数，INT8：7 GB
7B 参数，INT4：3.5 GB

INT4 是 7B 模型能在 4 到 6 GB 显存的笔记本 GPU 上运行的原因。GPTQ 和 AWQ 这类方法会使用 per-channel scaling factors，尽量降低有损压缩带来的质量损失。

做得好的 INT4，在标准 benchmark 上通常只比全精度模型低 1 到 2 个百分点。

从 FP16 降到 INT8，推理延迟通常能减半，同时质量损失可以忽略。对多数部署来说，量化是收益最高的优化手段。

8. 推理服务基础设施

现代推理服务器会在 prefill-decode 循环外加入一组优化：

Continuous batching 会在同一个 GPU step 中交错处理多个请求的 token。即使处于 memory-bound 的 decode 阶段，也能保持较高利用率。
Speculative decoding 会用一个小型 draft model 先提出多个 token，再让大模型在一次 forward pass 中验证。只要 draft model 的接受率足够高，就等于把多个串行 decode step 转成一次并行验证。
PagedAttention（vLLM）用固定大小的 block 管理 KV cache 内存，消除碎片，并让单块 GPU 支持更多并发请求。

vLLM、TensorRT-LLM、Text Generation Inference（TGI）这类框架会组合这些技术。一块 GPU 可以服务几十个并发用户，因为 decode 阶段会留下大量闲置算力，continuous batching 可以用其他请求填满这些空闲容量。

9. 完整推理路径
Tokenize：文本通过 BPE 变成整数 ID。
Embed：ID 变成向量，RoPE 编码位置。
Prefill：所有输入 token 并行经过每一层。这个阶段 compute-bound，会填充 KV cache，并输出第一个 token。
Decode loop：每一步生成一个 token。为新 token 投影 Q，对缓存中的 K/V 做 attention，运行 FFN，采样，并把新的 K/V 追加到缓存。这个阶段 memory-bound。
Detokenize：token ID 映射回文本并流式输出。

10. 一些实践结论
长 prompt 的成本主要体现在 TTFT，也就是 prefill。
长输出的成本主要体现在 ITL，也就是 decode。
二者消耗的是不同的硬件资源。
上下文长度不是免费的。它会膨胀 KV cache，并直接降低 batch capacity。
decode 阶段即使服务器已经满载，GPU 利用率也可能掉到 30%，因为瓶颈在内存带宽，不在算术计算。
解决方法不是增加更多算力，而是使用更快的内存、更小的缓存，或者更好的 batching。

当有人说模型很慢，第一步诊断应该看它是启动慢，还是流式输出慢。启动慢通常是 prefill-bound，需要优化 TTFT；流式输出慢通常是 decode-bound，需要优化 ITL。
