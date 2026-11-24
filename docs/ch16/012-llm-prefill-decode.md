# LLM 推理流水线完整解析：Prefill-Decode 双阶段模型

> 📊 Level ⭐⭐⭐⭐ | 12.9KB

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

## 深度分析

### TTFT 与 ITL：两条斜率不同的曲线

Prefill 随 prompt 线性增长、可完全并行；decode 单步恒定、必须串行。混在一张卡上，长 prompt 抬高全批 TTFT，为压 ITL 收紧 batch 又浪费 prefill 算力，两者资源配比还不兼得（FLOPS vs 带宽）。PD 分离的价值是让两类负载按各自瓶颈独立扩缩，代价是 KV 跨节点搬运——只有迁移成本低于调度损耗时才划算，KV 更小的架构因此让 PD 更便宜。

### KV Cache 才是真正的容量约束

decode 每步搬全部权重加整条 KV，算术强度极低，token/s ≈ 每步字节 ÷ 带宽——加算力无用。字节里权重恒定、KV 随上下文线性涨，延迟与容量在长上下文下合成一个问题：装得下多少序列就有多少并发。分页治碎片（浪费从"预留到最大长度"降为尾块残余），前缀复用治计算侧（公共前缀 KV 从私有开销变成共享资产，故缓存须先分层再路由）。

### 量化收益为何非线性

位宽与显存线性，延迟不是。权重降位宽直接减少搬运字节，带宽受限的 decode 近等比例受益；权重一旦能留在片上或改由低精度张量核心执行，收益即被别的瓶颈吃掉。激活的离群通道让 per-tensor scale 失效、误差沿层累积，最先伤工具调用与复杂推理。KV 量化只压随序列增长的那项，收益随上下文放大。故"INT8 延迟减半"只在权重量化 + 带宽受限 + 长 decode 时成立。

### 投机解码的接受率经济学

收益 ≈ 期望接受数 ÷（草稿成本 + 验证成本）。草稿越强，接受率 α 越高但单步越贵，最优推测长度在两条曲线交点而非越大越好。难点是分布匹配：草稿偏移让 α 在代码、结构化输出、罕见语言上骤降；验证仍要为目标模型预留整批显存——省时间不省显存，KV 紧张时先撞容量墙。

### 公平性代价与 kLLM 数字的边界

continuous batching 把延迟问题变成排队问题：长 prefill 阻塞同批 ITL，只能靠调度显式纠正（chunk 切分、短请求优先、让出补偿防饿死），收益因此是分布性的——均值改善常伴随尾部恶化。kLLM 的 7.3× KV 容量、-25% TTFT、启动 10min→10s 同样绑定在 MLA cKV 跨 head 共享、8 卡节点、稀疏+压缩注意力与快手自身流量形状上；换 MHA 小模型或短对话流量多半不成立，可迁移的只是方法论。

## 实践启示

1. **先分诊再优化。** 启动慢查 prefill（prompt 长度、前缀命中、chunk 策略），流式慢查 decode（带宽、KV 读放大、batch 效率）；混看平均延迟必然误判。
2. **先算容量上限再谈吞吐。** 用"每 token KV 字节 × 上下文 × 并发"估显存墙；容量不足时 KV 量化、GQA/MLA、前缀复用优先级高于加卡。
3. **把前缀命中率当一级 SLO。** 命中一档即省一次 prefill；再配 cache-aware 路由送到已持有该前缀的实例。
4. **量化分部件决策。** 权重先量化（收益稳定），激活谨慎（离群值 + 累积误差），KV 长上下文优先；用真实长尾流量验收而非只看 benchmark。
5. **投机解码只在"接受率高 + 显存有余"时上。** 先在自己流量上实测 α，偏低时草稿成本吃掉全部收益。
6. **用 P99 与 SLO 达成率验收。** chunk prefill、公平调度、PD 分离都是均值与尾部的交换，收益须放回自己的流量分布重算。

**延伸**：[分级 KV Cache](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tiered-kv-cache-large-llms-sagemaker-hyperpod-curvine.md)、[PD 分离](https://github.com/QianJinGuo/wiki-public/blob/main/entities/disaggregated-prefill-decode-llm-inference-sagemaker.md)、[投机解码](https://github.com/QianJinGuo/wiki-public/blob/main/entities/speculative-decoding.md)。

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

