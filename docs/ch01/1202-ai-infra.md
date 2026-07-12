# AI Infra 入门干货总结：大模型是如何高效推理的

## Ch01.1202 AI Infra 入门干货总结：大模型是如何高效推理的

> 📊 Level ⭐⭐⭐ | 12.9KB | `entities/ai-infra-llm-efficient-inference-vllm.md`

# AI Infra 入门干货总结：大模型是如何高效推理的

## 摘要

腾讯工程师 binnnliu 深入阅读 vLLM 源码后的总结文章，以 Llama 3 为例追踪推理过程中每步 Tensor 维度变化。文章拆解了 LLM 推理的 6 个阶段（Tokenize → Embedding → Transformer Block → FFN → LM Head → Sampling）和两大高性能推理支柱（Continuous Batching + Paged Attention），并解释了 FlashAttention / RoPE / GQA 等关键优化的物理实现。

## 深度分析

### 1. 批处理本质与 LLM 的核心矛盾

**批处理本质**：提升计算强度，通过复用权重数据均摊内存访问开销。

**LLM 生成式任务的核心矛盾**：每个请求的输出序列长度不可预测且差异巨大。传统静态批处理必须等最长那个请求生成完才能换下一批，导致 GPU 算力大量浪费在"padding"上。

**两大发明**：
- **Continuous Batching**：将调度从 request level 下沉到 token level，让 `num_computed_tokens` 追上 `num_tokens`
- **Paged Attention**：KV Cache 显存申请 token level 化，通过 `block_table` 地址数组维护每个请求的 KV Cache 地址

### 2. 连续批处理 (Continuous Batching) 的 4 个硬性约束

vLLM 调度器视角中，**不存在 Prefill 和 Decode 阶段的区分**。每个请求只关注：

- `num_computed_tokens`：已计算的 token 数（含 Prefix Cache 命中部分）
- `num_tokens`：当前拥有的 token 数（prompt + 已生成的 output）

**调度目标**：让 `num_computed_tokens` 追上 `num_tokens`，差多少调度多少。

**4 个硬性约束**：

| 约束 | 含义 |
|------|------|
| `max_num_seqs` | 最大并发请求数 |
| Token budget | 单步最多计算 token 数（所有请求之和） |
| `max_model_len` | 模型最大序列长度 |
| KV Cache blocks | 是否有空闲块 |

只要任意一项不满足，调度器就让该请求等待。这是 vLLM 把"调度"工程化为可计算约束的关键。

### 3. Paged Attention 的物理布局与 Trade-off

**KV Cache 显存布局**：`[num_layers, 2, num_blocks, block_size, num_kv_heads, head_dim]`

**block_table**：`[max_num_reqs, max_num_blocks_per_req]`，记录每个请求分配的物理块 ID。

**slot_mapping**：告诉 kernel 把新产生的 KV 写到哪个 slot。

**地址计算**：
```
slot_idx = block_idx * block_size + block_offset
block_idx = slot_idx / block_size
block_offset = slot_idx % block_size
```

**Trade-off 的本质**：block_table 间接寻址打破物理连续性，跨 block 读取触发离散访存（Uncoalesced Access），L2 Cache 命中率下降。但 `block_size=16` 保证 block 内部连续。相比显存碎片导致 OOM，牺牲少量带宽换取吞吐量大幅提升是划算的。

### 4. Transformer Block 内部 6 步走

每一步都有明确的 Tensor shape 变化和优化点：

**Step 1: Tokenize** — 提示词分词并转为数字表示，主流 LLM 使用 BPE（Byte Pair Encoding）。

**Step 2: Embedding Lookup** — Token ID → `[num_sched_tokens, hidden_size]` 特征矩阵。

**Step 3: RMSNorm** — 沿特征维度做尺度缩放，防止前向传播方差膨胀和反向传播梯度异常。

**Step 4: QKV Linear Proj (Fused QKV)** — `[num_sched_tokens, hidden_size]` → `[num_sched_tokens, qkv_proj_size]`，把 Q/K/V 三个投影融合成一次 GEMM。

**Step 5: RoPE（旋转位置编码）** — 用旋转角度代表 Token 位置。预计算 `cos_sin_cache`（空间换时间），shape `[max_position_embeddings, rotary_dim]`。避免每次 forward 几百万次 sin/cos 调用。

**Step 6: Attention (FlashAttention)** — K/V Shape：`[seq_lens, num_kv_heads, head_dim]`，从 Paged KV Cache 离散读取；Q Shape：`[query_lens, num_heads, head_dim]`。GQA（Grouped Query Attention）：1 KV Head 映射给 4 Q Head，通过索引映射 `kv_head_idx = q_head_idx // (num_heads // num_kv_heads)` 避免显存复制。

### 5. FlashAttention 的本质：分块 + Online Softmax

FlashAttention 的核心机制是 **Kernel Fusion + 分块计算 + Online Softmax**。分块计算避免在 HBM 存储庞大的中间矩阵 S 和 P，打破内存墙。

具体做法：
- 把 Q 分块，每块只与对应的 K/V 块计算
- 用 online softmax 增量更新归一化分母，无需存储完整 S 矩阵
- 跨块的中间结果不写回 HBM，直接在 SRAM/registers 里流转

这就是"打破内存墙"的物理含义——把 HBM 读写量从 O(N²) 降到 O(N)。

### 6. Prefill vs Decode 的本质差异

| 阶段 | 计算模式 | 瓶颈类型 |
|------|----------|----------|
| Prefill | 稠密 GEMM | 计算密集型 (Compute-bound) |
| Decode | 每次只处理 1 个 Token，退化为 GEMV + 读取 KV Cache | 访存密集型 (Memory-bound) |

这是为什么 vLLM/SGLang 等推理引擎要把 Prefill 和 Decode 调度策略分开处理——它们的硬件瓶颈完全不同。

### 7. FFN 的优化：Fused Gate/Up + silu_and_mul

**Fused Gate/Up Proj**：将 Gate 和 Up 按列拼接为 `[hidden_size, 2*intermediate_size]`，一次宽矩阵 GEMM 替代两次中等规模矩阵乘法。

**Activation**：SiLU(Gate) * Up，vLLM 使用 `silu_and_mul` kernel 在 SRAM 直接输出点乘结果——避免先写回 HBM 再读出的访存开销。

### 8. LM Head 的关键优化

将隐藏层特征映射到词表空间：`[num_reqs, hidden_size]` → `[num_reqs, vocab_size]`。

**关键优化**：Prefill 阶段**只需每个序列最后一个 Token 的特征**用于预测下一个词（因为后续没有更多 layer 需要完整 hidden_states）。这条优化可以避免在长 prompt Prefill 时做大量浪费的 LM Head 计算。

### 9. Attention 始终无法跨请求均摊

这是 LLM 推理的硬性物理约束：

- 每个请求必须读取自己独占的 KV Cache
- 计算量随上下文长度呈**平方**增长（O(N²)）

这意味着即便有 Continuous Batching 复用权重数据，Attention 计算本身依然按 O(N²) 增长。这是为什么超长上下文（如 128K、1M token）的推理效率远低于短上下文。

### 10. Sampling 阶段的 4 个关键参数

**Logits Process**：
- **Repetition Penalty**：对已生成词汇扣除分数，防止复读
- **Temperature Scaling**：T>0 拉大/缩小分数差距，T≈0 跳过
- **min_p**：自适应截断，概率不到最高概率 × min_p 的 token 淘汰
- **Top-K/P**：截断保留最高 K 个 / 累积概率超 P 的 token

**采样顺序**：Greedy（temperature < 1e-5）vs Random，需 Greedy 先行再 temperature scaling。

## 实践启示

1. **理解 shape 变化是理解 LLM 推理的关键**：追踪每步 Tensor 维度变化比看论文更直观。`(num_sched_tokens, hidden_size)` → `(num_sched_tokens, qkv_proj_size)` → `(seq_lens, num_kv_heads, head_dim)` 这种 shape 流是调试性能瓶颈的底层语言。

2. **RoPE 空间换时间**：预计算 cos_sin_cache 避免每次 forward 几百万次 sin/cos 调用。同样的思路可用于其他周期性函数（activation checkpointing、sinusoidal embeddings）。

3. **FlashAttention 的本质**：分块计算 + Online Softmax 避免 HBM 存储庞大中间矩阵，打破内存墙。这种"分块 + 在线算法"的范式可以推广到任何"中间结果太大放不进 SRAM"的场景。

4. **GQA 的物理实现**：通过索引映射 `kv_head_idx = q_head_idx // (num_heads // num_kv_heads)` 而非显存复制。这种"算索引不搬数据"的思路在所有显存受限场景都适用。

5. **LM Head 优化**：Prefill 阶段只需最后一个 token 的特征预测下一个词。这条边界告诉我们可以"砍掉" LM Head 在长 prompt Prefill 时的冗余计算。

6. **Continuous Batching 让 GEMV 重新变回 GEMM**：通过 token-level 调度复用权重数据，Decode 阶段不再退化到 GEMV 而是接近 GEMM 的高算力利用率。这条原理是 vLLM/TGI/SGLang 高吞吐的根因。

7. **五件事的工程取舍**：block_size=16 是 Paged Attention 的甜点——太小 block table 开销大，太大内部访存不连续。理解每个 magic number 的来由是优化推理性能的前提。

## 相关实体

- [Tokenspeed Agentic Inference Engine](../ch04/651-tokenspeed-agentic-inference-engine.html)
- [Google Io 2026 Agentic Gemini Era](../ch04/235-agentic.html)
- [Ai Infra Auto Driven Skills V0 Bbuf Giantpanda](ch01/1202-ai-infra.html)
- [Gemma 4 Multi Token Prediction Drafters](ch01/316-gemma-4-multi-token-prediction-drafters.html)
- [Continuous Async](https://github.com/QianJinGuo/wiki/blob/main/entities/continuous-async.md)
- [Anthropic 95Pct Data Analysis Jiagoux Data Level Harness 20260606](../ch05/087-harness-2026.html)
- [Codex Goal Source Code Deep Dive](../ch09/047-codex-goal.html)
- [Impeccable Frontend Design Skill Harness Vibecoder](../ch05/001-impeccable.html)
- [Opencli Browser Automation Jingxing](../ch03/084-opencli.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/llm-core-technology.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-infra-llm-efficient-inference-vllm.md)

### 补充：HuggingFace Jobs 一键部署 vLLM

HF Jobs 提供了一键部署 vLLM 推理服务的能力，无需手动配置 GPU 集群。通过 `hf-jobs` CLI 或 Python SDK 可直接将 vLLM 模型部署为可调用的 API 端点，支持自动扩缩容和模型缓存。 → [HF Jobs 部署指南](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vllm-server-hf-jobs-one-command.md)

---

