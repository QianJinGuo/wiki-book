---
title: "AI Infra入门干货总结：大模型是如何高效推理的"
author: "binnnliu"
source: "腾讯技术工程"
source_url: "https://mp.weixin.qq.com/s/gCRMjGry2EmBmv1CFfCzVQ"
created: 2026-05-25
type: raw
tags: [article]
sha256: ab052a82d2eba312f55fcd6ebdcd776cf014762b334fa4dd1a5f1631f47ee943
---

# AI Infra入门干货总结：大模型是如何高效推理的

## 核心概念：Continuous Batching + Paged Attention

**批处理本质**：提升计算强度，通过复用权重数据均摊内存访问开销。

**LLM 生成式任务的核心矛盾**：每个请求的输出序列长度不可预测且差异巨大。

**发明 Continuous Batching**：将调度从 request level 下沉到 token level，让 num_computed_tokens 追上 num_tokens。

**发明 Paged Attention**：KV Cache 显存申请 token level 化，通过 block_table 地址数组维护每个请求的 KV Cache 地址。

## 连续批处理 (Continuous Batching)

vLLM 调度器视角中，不存在 Prefill 和 Decode 阶段的区分。每个请求关注：
- `num_computed_tokens`：已计算的 token 数（含 Prefix Cache 命中部分）
- `num_tokens`：当前拥有的 token 数（prompt + 已生成的 output）

**调度目标**：让 num_computed_tokens 追上 num_tokens，差多少调度多少。

**4个硬性约束**：
1. 最大并发请求数：`max_num_seqs`
2. Token budget：单步最多计算 token 数（所有请求之和）
3. 模型最大序列长度：`max_model_len`
4. 是否有空闲 KV Cache blocks

## Paged Attention

**KV Cache 显存布局**：`[num_layers, 2, num_blocks, block_size, num_kv_heads, head_dim]`

**block_table**：`[max_num_reqs, max_num_blocks_per_req]`，记录每个请求分配的物理块 ID。

**slot_mapping**：告诉 kernel 把新产生的 KV 写到哪个 slot。

**地址计算**：
```
slot_idx = block_idx * block_size + block_offset
block_idx = slot_idx / block_size
block_offset = slot_idx % block_size
```

**Trade-off**：block_table 间接寻址打破物理连续性，跨 block 读取触发离散访存。但 block_size=16 保证 block 内部连续。相比显存碎片导致 OOM，牺牲少量带宽换取吞吐量大幅提升是划算的。

## LLM 推理全流程

### 1. Tokenize
将提示词分词并转为数字表示，主流 LLM 使用 BPE（Byte Pair Encoding）。

### 2. Embedding Lookup
Token ID → `[num_sched_tokens, hidden_size]` 特征矩阵。

### 3. Transformer Block

**RMSNorm**：沿特征维度做尺度缩放，防止前向传播方差膨胀和反向传播梯度异常。

**QKV Linear Proj (Fused QKV)**：`[num_sched_tokens, hidden_size]` → `[num_sched_tokens, qkv_proj_size]`

**RoPE**：用旋转角度代表 Token 位置。预计算 cos_sin_cache（空间换时间），shape `[max_position_embeddings, rotary_dim]`。

**Attention (FlashAttention)**：
- K/V Shape：`[seq_lens, num_kv_heads, head_dim]`，从 Paged KV Cache 离散读取
- Q Shape：`[query_lens, num_heads, head_dim]`
- GQA：1 KV Head 映射给 4 Q Head，通过索引映射避免显存复制

**FlashAttention 核心**：Kernel Fusion + 分块计算 + Online Softmax。分块计算避免在 HBM 存储庞大的中间矩阵 S 和 P，打破内存墙。

**Prefill vs Decode**：
- Prefill：稠密 GEMM，计算密集型（Compute-bound）
- Decode：每次只处理 1 个 Token，退化为 GEMV + 读取 KV Cache，访存密集型（Memory-bound）

### 4. FFN

**Fused Gate/Up Proj**：将 Gate 和 Up 按列拼接为 `[hidden_size, 2*intermediate_size]`，一次宽矩阵 GEMM 替代两次中等规模矩阵乘法。

**Activation**：SiLU(Gate) * Up，vLLM 使用 `silu_and_mul` kernel 在 SRAM 直接输出点乘结果。

### 5. LM Head

将隐藏层特征映射到词表空间：`[num_reqs, hidden_size]` → `[num_reqs, vocab_size]`。

**关键优化**：Prefill 阶段只需每个序列最后一个 Token 的特征用于预测下一个词（因为后续没有更多 layer 需要完整 hidden_states）。

### 6. Sampling

**Logits Process**：
- Repetition Penalty：对已生成词汇扣除分数，防止复读
- Temperature Scaling：T>0 拉大/缩小分数差距，T≈0 跳过
- min_p：自适应截断，概率不到最高概率 × min_p 的 token 淘汰
- Top-K/P：截断保留最高 K 个 / 累积概率超 P 的 token

**采样**：Greedy（temperature < 1e-5）vs Random，需 Greedy 先行再 temperature scaling。

## 核心总结

1. **Continuous Batching** 让多个请求 token-level 复用权重，将 GEMV 重新变回 GEMM
2. **Paged Attention** 通过虚拟页表机制解决显存碎片，是高性能推理的基础
3. **FlashAttention** 用分块计算 + Online Softmax 打破内存墙
4. **Prefill 是 Compute-bound**，**Decode 是 Memory-bound**
5. **Attention 始终无法跨请求均摊**：每个请求必须读取自己独占的 KV Cache，且计算量随上下文长度呈平方增长

→ [[raw/articles/ai-infra-llm-efficient-inference-vllm|原文存档]]
