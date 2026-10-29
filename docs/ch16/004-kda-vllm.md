# 线性注意力到 KDA：固定状态如何演进，以及它在 vLLM 里怎么跑

> 📊 Level ⭐⭐⭐ | 14.2KB

## 起点：Decode 的三个线性增长

大模型推理分 Prefill 与 Decode：Prefill 是计算密集型、硬件利用率高，本质是"多个 token 打包成 GEMM 分摊权重的读取"——但这句话不完整，**Prefill 的高利用率还来自同一请求多个 Q 复用同一批 K/V tile**。Decode 则每算一个 token 就要把权重从显存读一遍，还要把累积的全部历史 KV Cache 读一遍，计算单元大量时间在等访存。

vLLM 的 Continuous Batching 把批处理从 request 维度改成 token 维度，PagedAttention 让显存按 token 维度分配（否则每请求按 max_length 申请会产生大量碎片）；但**除共享前缀外不同请求上下文彼此隔离**，Continuous Batching 只能帮 Linear/FFN 层分摊权重读取，帮不了 Attention 层分摊历史 KV 的读取；推测解码把 Decode 变成微型 Prefill，缓解单请求的访存开销。到了百万上下文时代仍剩三个问题：KV Cache 显存随上下文线性增长、每次 Decode 全量加载历史 KV、计算量随上下文线性增长。业界三条对策是稀疏注意力（DSA/SWA）、压缩注意力（MLA/Latent Compression）、线性注意力；**国内一线开源模型除 DeepSeek 与腾讯 Hy 外，基本都是 Linear + Full/Sparse 的 Hybrid 架构**。

## 主线：所有线性注意力都是"怎么更新那个固定状态"

线性注意力的共同本质：把历史压缩进固定大小的状态矩阵 `S ∈ R^{d_v×d_k}`，Decode 时用 `o = S q` 读出，从而对序列长度 O(1)。**容量固定就意味着新知识会冲刷旧知识——整条演进史就是"状态更新机制"的演进史。**

**普通线性注意力**（Transformers are RNNs, ICML 2020）：用可分离的特征映射 φ 替代 softmax，利用矩阵乘法结合律先累加 `v_j φ(k_j)^T`，得到 `S_i = Σ v_j φ(k_j)^T` 与归一化项 `Z_i = Σ φ(k_j)`，尺寸固定、每步只做一次加法。

**去掉分母、引入短卷积**：The Devil in Linear Transformer 发现分母 `φ(q_t)^T Z_t` 可能很小、梯度不稳，于是去掉分母改在输出端做归一化；代价是 φ 不再要求恒正。由于固定状态会丢局部细节，DeltaNet/GDN/KDA 都在投影后的 q/k/v 上加**一维因果短卷积**（逐通道固定权重滑动窗口 + SiLU）补充局部信息，并用 L2 norm 取代 φ——这套组合成为现代线性注意力的标配。此时更新退化成纯累加 `S ← S + v k^T`，**但没有任何遗忘，写错的、过期的信息被无条件塞进固定容量，很快饱和甚至数值爆炸**。

**DeltaNet：写门 + 残差写入**（Schlag 2021 提出 delta rule，Yang 2024 用 WY 表示把它压缩成低秩形式、设计 chunk 并行算法）。写入前先用当前 key 查旧状态里已有什么，只写差值：`S_t = S̄_t + β_t(v_t − S̄_t k_t)k_t^T`，写门 β 每 head 一个标量。转移矩阵 `I − β_t k_t k_t^T` 在 k 做了 L2 norm 后保证旧状态只缩不涨（沿 k 方向按 1−β 收缩、其余正交方向原样保留），避免状态爆炸。局限：与 k 正交的方向不对应单个特征通道，长期缺更新的过期关联会持续保留，**缺少独立于当前 key 覆写的主动遗忘**。

**GDN：加遗忘门**（Gated Delta Networks, 2024）。遗忘门不是它首创（RetNet 每 head 固定衰减、Mamba2 每 head 输入相关标量、GLA 每 key 通道输入相关衰减），GDN 的贡献是把 **Mamba2 式标量门与 delta rule 结合且 chunk 并行仍成立**：写入前整张状态乘 α_t（每 head 一个标量）。问题是同 head 所有通道共享一个遗忘速度，**表达能力弱**。

**KDA：按通道遗忘**（Kimi Linear, 2025；GLM-5.3-Flash 也用）。保留残差覆写，把遗忘门从标量升成 d_k 维向量：`S̄_t = S_{t−1} Diag(α_t)`，门从 `num_heads` 扩到 `num_heads × head_dim`。为什么不再进一步做到 S 的逐元素遗忘？作者的答法是**表达力与并行效率的取舍**：逐元素门会让每 head 每 token 的门值从 head_dim 涨到 head_dim_v × head_dim_k，更关键的是**按 key 通道遗忘时所有 value 行共享同一个右乘转移，更新保持"对角矩阵 + 秩一修正"的结构，才能设计高效分块并行算法**。

| 机制 | 衰减 | 写入 | 遗忘粒度 | 门 shape |
|---|---|---|---|---|
| 线性注意力 | 无 | S + v k^T | 无 | 无 |
| DeltaNet | 无 | + β(v − S k)k^T | 无 | β[num_heads] |
| GLA | S·Diag(α) | 同线性 | 每 head 每 key 通道 | α[num_heads, head_dim] |
| GDN | α·S | 同 DeltaNet | 每 head 一个 | β、α 各[num_heads] |
| KDA | S·Diag(α) | 同 DeltaNet | 每 head 每 key 通道 | β[num_heads]；α[num_heads, head_dim] |

（旁注：RWKV-6 已按通道衰减但仍累加写入；GDN 相反；KDA 把两者叠起来。RWKV-7 用对角加秩一转移，但抹除 key 可与写入 key 不同，是另一条线。）

## KDA 的一次前向：三件事同时发生

每层每 head 维护固定矩阵 S。由 hidden state 与权重投影出 q（提取）、k（寻址）、v（内容），以及遗忘门 α、写门 β、输出门 γ，然后一步里做三件事：`S_{t−1}Diag(α_t)` 决定保留/遗忘什么；`β_t v_t k_t^T` 写入新知识；`−β_t S_{t−1}(α_t ⊙ k_t)k_t^T` 是 **delta rule 修正**——把衰减后状态里与当前 k 匹配的那部分旧内容减掉，防止同一特征在长上下文里被重复累加而爆炸。

## RNN 范式的两条硬约束

**容量**：固定状态必然有损，长文本 needle-in-a-haystack 与精准召回会退化——门控与 delta rule 改善选择与写入，但不给状态增加容量。折中是 Hybrid：线性层承担低成本历史聚合，Full/Sparse Attention 层保留直接访问通道（代价是这些层的 KV Cache 仍随长度线性增长；稀疏注意力减少的是访存量，KV 仍全部保存）。

**并行**：时间维递归无法并行，于是有 Chunk-Wise 算法（把序列切块、块内并行、块间走状态传递）与"训练角度"的理解——Memory As a Model、重建损失、从重建误差到正则化。这是全文的方法论转折：**把"记忆"当成被训练的对象，用重建质量来解释门控与写入门为什么长成这样。**

## 工程实现（vLLM）：把一份 state 塞进 Block 机制

**KVCache Group 与 UniformTypeKVCacheSpecs。** vLLM 用 `KVCacheSpec` 描述每层缓存；若每层独立维护 block table，调度元数据开销大，于是把相同 spec 的层放进一个 Group 共用一张 block table。但 MLA 与 Indexer 生命周期一致、head_size 不同（bf16/block=64 时 MLA 每 token 1152B、一页 72 KiB；Indexer 每 token 132B、一页 8.25 KiB），分成两个 Group 又要求单层 page 相等。解法是 `UniformTypeKVCacheSpecs`：block_size 相同且同属一个 uniform 基类即可合并，Group 的 `page_size_bytes` 是组内各层 page 之和（实测 61×2=122 层合并后一个 block ≈ 4.78 MiB）。

**线性注意力的 Prefix Cache 怎么接进来。** KDA/Mamba 每层每请求只有一份固定 state，要进 Block 机制就得让"一份 state 的字节数 = attention 一个 block 的单层 page size"——做法是放大 attention 的 block_size，同时把 state padding 到相同字节数。GLM-5.3-Flash 的分组是活样本：Group 0 是 11 层 MLA + 11 层 Indexer 的 Uniform 组合（640 KiB + 20.625 KiB），Group 1 是 Indexer 的 kpool tail 环形缓冲（每请求固定 1 block、不参与 prefix caching），Group 2+ 是 34 层 KDA——一个 block 能装 `⌊7266.875/640⌋ = 11` 份 state，于是切成 `cdiv(34,11)=4` 组、按层轮流得到 `[9,9,8,8]`。文中还回答了"S 到底存几份"、"共享前缀分叉点（Marconi-style APC）"与"block_size 变大后怎么办"。

**Decode 的融合核**：融合 GEMM Proj、遗忘门与输出门升到 per-channel、短卷积、门控变成 α/β 在 kernel 内计算、每个 head 独立的递推核、输出门后投回 hidden。**推测解码**要解决"验证后如何恢复状态"——线性层没有 KV 可以重放，必须显式保存/回滚 S。**Prefill** 则是 chunk 内的微观并行：先算 Δchunk、再算 Transition chunk，把块间递归换成矩阵运算。

## 深度分析

### 四次演进其实是三个正交问题的叠加

把 DeltaNet/GDN/KDA 摊开看，它们分别在修不同的问题：DeltaNet 修"重复写入导致爆炸"（残差覆写），GDN 修"没有主动遗忘"（整张状态衰减），KDA 修"遗忘粒度太粗"（按通道）。三者叠加才得到 KDA 的更新式，而每一步都受同一个约束——**新机制不能破坏 chunk 并行的代数结构**。这条约束解释了为什么"逐元素遗忘"这个显然更强的表达没有被采用：它会让转移矩阵失去"对角 + 秩一"的共享结构，并行算法的优势随之消失。**表达力不是免费的，它的价格是并行度。**

### 固定状态是"带宽换容量"的交易，不是免费的午餐

线性注意力用 O(1) 的状态读写换掉了 O(N) 的 KV 读取，代价是容量有损。理解这一点才能正确看待 Hybrid：它不是"折中方案的妥协"，而是**在两类访问模式之间分配预算**——让多数层走便宜的聚合，少数层保留精确召回。这也解释了为什么长上下文能力仍要看 Full Attention 层的比例与位置，而不是只看"用了线性注意力"这个标签。

### Prefix Cache 的真正难点是"对齐"而不是"存储"

线性层的 state 是定长的，存起来比 KV 简单；难点在于它必须和 attention 的 block 体系**共享同一套 page 语义**，否则调度器要维护两套分配逻辑。作者的解法（放大 attention block_size + padding state）本质是用空间换统一：把两种不同形状的缓存对齐到同一 page size，从而复用同一张 block table、同一套 prefix caching 与 APC 逻辑。这是典型的"在系统层解决模型层异构"的做法。

### 推测解码与线性注意力天然冲突

推测解码的前提是"接受后能回滚、拒绝后能重放"，KV Cache 天然支持这一点（按位置截断即可）；线性层的状态是累积量，**必须显式保存检查点才能回滚**。这类"语义差异导致工程代价"的例子说明：混合架构的推理栈不能简单复用纯 Transformer 的优化，每一处都要重新推导不变量。

## 实践启示

1. **先分清优化对象**：显存容量、显存带宽、计算量是三个问题，线性注意力同时缓解三者但有容量代价。

2. **看架构先看门**：β（写入门）与 α（遗忘门）的 shape 决定表达力与并行度——`num_heads` → `num_heads×head_dim` 是 KDA 的关键一步。

3. **短卷积不是装饰**：它是固定状态丢失局部信息后的必要补偿，且只保留 `conv_kernel−1` 个卷积前 qkv。

4. **Hybrid 是预算分配**：线性层买带宽，Full/Sparse 层买精确召回；长上下文能力取决于比例与位置。

5. **接 vLLM 要先对齐 page 语义**：让一份 state 的字节数等于一层 attention block 的 page size，才能复用 block table 与 prefix caching。

6. **推测解码要单独设计回滚**：线性层没有 KV 可截断，必须保存/恢复状态。

7. **警惕"表达力拉满"的诱惑**：逐元素门在代数上破坏并行结构，工程代价远大于收益。

## 与相关实体的关系

- 与 [LLM 架构演进（BERT→GPT→Jev）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-architecture-evolution-bert-gpt-jev-tencent-2026.md) 同属腾讯技术工程的架构长文，但那篇讲范式演进，本篇是**单一机制（线性注意力）从数学到 kernel 的全链路拆解**。
- 与 [Kimi K3 与 KDA](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-k3这是-deepseek-20-时刻.md)、[MemT 记忆原生 Transformer](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memt-1-0-memory-native-transformer-memtensor-2026.md) 互补：那两篇从模型发布角度提到 KDA/线性层，本篇给出状态更新式与工程实现的完整推导。
- 与 [vLLM 原生加速](https://github.com/QianJinGuo/wiki-public/blob/main/entities/native-speed-vllm-transformers-modeling-backend.md) 呼应：那篇讲 vLLM 的建模后端，本篇讲线性注意力如何挤进 vLLM 的 KV Cache 分页体系。
- 与 [Transformer 状态追踪的理论局限](https://github.com/QianJinGuo/wiki-public/blob/main/entities/topological-trouble-transformers-state-tracking-deepmind-2026-06-17.md) 构成"理论 ↔ 工程"两端：那篇讨论固定状态/有限精度对状态追踪的限制，本篇展示工业界如何用门控与 delta rule 逼近这个上限。

→ [原文存档](https://mp.weixin.qq.com/s/O0_v8wz4iHxbkDLENy7EPg)

---

