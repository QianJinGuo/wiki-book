# LLM 推理流水线完整解析：Prefill-Decode 双阶段模型

> 📊 Level ⭐⭐ | 8.7KB

> -> [原文存档](https://mp.weixin.qq.com/s/1zZ0UXCNUA1UJ39gJNDQjg)

## LLM 推理流水线完整解析

## 一句话

系统讲解 LLM 推理的完整流水线——从 tokenization 到流式输出，核心框架是 **prefill（计算受限）vs decode（内存受限）双阶段模型**，所有推理优化都针对其中一个阶段。

## 核心框架：Prefill vs Decode

LLM 的 `generate()` 调用在同一块 GPU 上经历两个截然不同的计算阶段：

| 阶段 | 工作方式 | 瓶颈 | 关键指标 |
|------|---------|------|---------|
| **Prefill** | 所有输入 token 并行处理，矩阵乘矩阵 | GPU 算术吞吐（compute-bound） | TTFT（Time to First Token） |
| **Decode** | 逐个 token 生成，query 向量 × 缓存矩阵 | 内存带宽（memory-bound） | ITL（Inter-Token Latency） |

**诊断原则**：当有人说模型慢，先判断是启动慢（prefill-bound → 优化 TTFT）还是流式输出慢（decode-bound → 优化 ITL）。二者消耗不同的硬件资源。

## 完整推理路径

### 1. Tokenization & Embedding

BPE tokenizer 将文本转为词表整数 ID（词表规模约 50K），映射到 `[vocab_size, hidden_dim]` embedding 矩阵。位置编码使用 **RoPE**（Rotary Position Embeddings）——通过旋转向量而非额外位置向量来编码位置。

### 2. Transformer 层

每层依次执行：
- **Self-attention**：为每个 token 计算 Q/K/V 投影，query 与所有 key 打分 → softmax → 加权混合 value
- **FFN**：两层 MLP 独立处理每个 token 向量（attention 跨位置传递信息，FFN 变换位置表示）

### 3. Prefill 阶段

所有输入 token 并行经过每一层，attention 以大型矩阵乘矩阵运行，GPU 利用率高。此阶段同时填充 **KV cache**（每层的 K/V 张量存入 GPU 内存供 decode 复用）。输出第一个 token。

### 4. Decode 阶段

每步只为新 token 计算 Q，与缓存中的 K/V 做 attention。算术量小但需从内存加载全部权重 + 完整 KV 缓存，瓶颈切换为内存带宽。

## KV Cache：推理的核心约束

无缓存时生成 1K token 回答需每步重算完整 attention（平方级复杂度）。KV cache 将 K/V 存一次、增量追加，提速约 5 倍以上。

**代价**：
- 13B 模型：每个 token 约消耗 1 MB KV cache
- 4K 上下文：仅 KV cache 占 4 GB 显存
- 直接与 batch size 争夺 GPU 内存 → 并发能力下降

**四种缓解方法**：

| 方法 | 原理 |
|------|------|
| KV cache 量化（INT8/INT4） | 降低缓存精度 |
| Sliding window attention | 丢弃固定窗口外的 token |
| GQA（Grouped-Query Attention） | 多个 head 共享 K/V，减少缓存张量 |
| PagedAttention（vLLM） | 像 OS 虚拟内存一样分页管理缓存，消除碎片 |

## DeepSeek V4：从结构上压缩 KV Cache

DeepSeek V4 Preview（2026-04-24）没有把 KV cache 当固定成本管理，而是重新设计 attention 让缓存结构性更小：

- **CSA**（Compressed Sparse Attention）：softmax-gated pooling 压缩 KV 4 倍 → sparse attention
- **HCA**（Heavily Compressed Attention）：128 个 token 的 KV 合并为 1 个压缩条目 → dense attention

效果（1M-token 上下文 vs V3.2）：
- 单 token 推理 FLOPs：**27%**
- KV cache：**10%**（bf16 下 9.62 GiB vs 83.9 GiB）
- 叠加 fp4/fp8 量化可再缩小 2 倍

→ 相关实体：[DeepSeek V4 本地推理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md)

## 量化：收益最高的优化手段

内存节省与 bit width 线性相关：

| 精度 | 7B 模型显存 |
|------|-----------|
| FP32 | 28 GB |
| FP16/BF16 | 14 GB |
| INT8 | 7 GB |
| INT4 | 3.5 GB |

- INT4 是 7B 模型在笔记本 GPU（4-6 GB）上运行的关键
- GPTQ / AWQ 使用 per-channel scaling 降低质量损失
- INT4 通常只比全精度低 1-2 个百分点
- FP16→INT8 推理延迟通常减半，质量损失可忽略

## 推理服务基础设施

现代推理服务器的三种核心优化：

| 技术 | 作用 |
|------|------|
| **Continuous batching** | 同一 GPU step 交错处理多请求的 token，decode 阶段也能保持高利用率 |
| **Speculative decoding** | 小 draft model 先提多个 token → 大模型一次 forward pass 验证，串行→并行 |
| **PagedAttention**（vLLM） | 固定大小 block 管理 KV cache，消除碎片，提升并发 |

框架组合：vLLM、TensorRT-LLM、TGI。一块 GPU 可服务几十并发用户——decode 阶段大量闲置算力被 continuous batching 填满。

## 实践结论

1. **长 prompt 成本在 TTFT**（prefill），**长输出成本在 ITL**（decode）——消耗不同硬件资源
2. **上下文长度不免费**——膨胀 KV cache，直接降低 batch capacity
3. **decode 阶段 GPU 利用率可能仅 30%**——瓶颈在内存带宽不在算术计算
4. **解决方向**：更快的内存 + 更小的缓存 + 更好的 batching，而非更多算力

## 与现有知识的关联

- → [DeepSeek V4 本地推理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-ds4c-antirez-local-inference-qbitai.md)：V4 的 CSA/HCA 架构创新（本文第 6 节）与 antirez 的 ds4.c 本地推理引擎互补
- → [GLM-5 Scaling Pain](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm5-scaling-pain-inference.md)：高并发推理下的竞态 Bug，是本文第 8 节"推理服务基础设施"的反面案例
- → [vLLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm.md)：PagedAttention 的具体实现

## 工业实践：快手 kLLM 全栈优化（2026-07）

快手系统软件团队围绕 GLM-5.2（DSA/MLA）与 DeepSeek-V4 构建自研推理引擎 kLLM，将本文上述概念落地为可量化的生产优化，原则是**不以模型能力损失为代价做优化**。

| 本文概念 | kLLM 工业实践 | 量化收益 |
|---------|--------------|---------|
| PagedAttention / KV cache | **分级 KV Cache**（L1 GPU HBM / L2 CPU DRAM / L3 SSD+分布式）+ Cache-Aware 路由 | 命中率 +20pp、SLO 下吞吐 +30%、总命中率 ~87.6%；前缀树增量匹配使 GPU Bubble 400ms→30ms、Prefill +40% |
| Prefill vs Decode（TTFT vs ITL） | **PD 分离 + SLO Load 驱动弹性**：以相对 TTFT/TPOT SLO 的背离度统一度量 P/D 压力，取预测/真实值上界 | 容量生效速度 10min→10s（约 60×），OpenRouter Uptime 99%+ |
| Speculative decoding | **DSpark 半自回归投机解码**（并行 logits + 轻量序列模块 Bias 修正） | DeepSeek V4 Flash 线上 TPOT -15% |
| 长上下文 / KV 膨胀 | **MLA 下 Attention Request DP + MoE EP 混合并行**（cKV 跨 Head 共享无法 TP 切分 → 按请求维分） | 8 卡 KV 容量 2.9M→21.2M Tokens（7.3×）、TTFT -25% |
| Continuous batching 边界 | **Chunk Prefill 公平调度 + Decode KV 高水位保护**（短请求优先、长请求 Chunk 边界让出） | 平均 TTFT -17.8%、P50 -26.0%、P95 -12.1%（P99 +2.7%） |

**核心洞见**：①模型侧降本 ≠ 系统侧同比提效——新一代模型（稀疏激活/稀疏注意力/百万上下文）把瓶颈从单一算力问题转化为计算/通信/显存/调度耦合的系统问题；②并行边界应按状态分布方式重构（MLA cKV 沿 Request DP、MoE 沿专家 EP、Dense FFN 按需 TP），而非单一并行策略覆盖全模型。

**Agent 场景延伸**：kLLM 规划 Program-Aware 全生命周期调度——调度单元从"单请求"提升为一次 agent 会话/工作流，做暂停/恢复调度 + 工具调用空窗资源回收，指向推理系统向 agent 工作负载演进。

---

