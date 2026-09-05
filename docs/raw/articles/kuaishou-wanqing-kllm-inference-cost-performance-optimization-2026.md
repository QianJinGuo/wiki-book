---
title: "快手万擎大模型推理成本和性能优化实践"
type: raw-article
source_url: "https://mp.weixin.qq.com/s/RgMdohRwMS5qA6aHuolfZw"
source_author: "快手技术"
source_date: 2026-07-31
ingested: 2026-07-31
sha256: 31ede722b6a3cd9a7085943c6d19d043c4d748befb536f72b6abf2351083b97e
rating: 48
tags: [llm, inference, kllm, kv-cache, pd-disaggregation, ring-attention, speculative-decoding, moe, deepseek-v4, glm-5.2, serving]
---

# 快手万擎大模型推理成本和性能优化实践

## 摘要

快手系统软件团队围绕 GLM-5.2、DeepSeek-V4 等新一代大模型（巨量参数+稀疏激活、稀疏/压缩注意力、百万级上下文三方向演进），构建自研推理引擎 **kLLM** 的全栈优化体系，覆盖并行执行、算子与通信、KV Cache、调度系统。核心原则：**不以模型能力损失为代价做优化**——关注在模型能力基本保持的前提下降低单位 Token 成本，而非绝对低价。

kLLM 作为快手技术商业化品牌 StreamLake（快手万擎大模型平台对外推理服务的官方 Provider）的引擎。OpenRouter 监测显示 StreamLake 的 GLM-5.2 服务近 30 天 Provider Uptime 99%+，GPQA Diamond / TAU-Bench Airline 表现与模型官方及其他头部 Provider 相近，计入 Prompt Cache 后实际 Token 价格具竞争力。

## 五大关键技术

### 1. MLA + DP Attention：Attention DP 与 MoE EP 的混合并行

- **问题**：GLM-5.2 的 DSA（稀疏注意力）与 MLA 主要优化计算量与单 Token KV 大小，未解决多卡部署中的状态分布问题；MLA 的 cKV 是跨 Head 共享的压缩状态，无法沿 Head 维度 TP 切分，TP=8 时同一批请求的 KV Cache 在节点内复制 8 份，KV 空间成为长上下文高并发瓶颈。
- **方案**：不将整个模型简单切换为 DP，而是**重新划分并行边界**——Attention 采用 Request DP（不同 Rank 处理不同请求，仅保存所属请求的 cKV/Token 历史/索引状态，不再跨 DP Rank 同步结果）；MoE 采用 EP（All-to-All Dispatch/Combine 路由 Token 到专家）；Dense/Shared FFN 按需保留 TP（只在子路径 Gather/Reduce-Scatter，不与 EP 通信混用）。
- **收益**：8 卡配置下节点有效 KV 容量由纯 TP 的 2.9M Tokens 提升至 21.2M Tokens（**约 7.3 倍**），平均 TTFT 下降 **25%**。新瓶颈转向 Request DP 负载均衡与 EP 专家负载/All-to-All 通信；更适合长上下文、大 Batch、KV 容量受限的高吞吐场景。

### 2. Ring Attention：同步聚合改造为分块流水

- **问题**：200K→1M 上下文时 KV cache 随序列长度线性增长，All-Gather CP 每层 Attention 前先将各 Rank KV 分片全量汇总到每张 GPU，显存与通信开销大。
- **方案**：CP 执行路径实现分块式 Ring Attention——本地 Query 保持不动，本地 KV 分片沿 Ring 拓扑逐跳传递，每轮只保留本地 KV 分片及单块通信缓冲；用 **Online Softmax** 跨轮维护最大值/归一化分母/输出累积状态，保证分块计算与完整 Attention 数值一致。
- **收益**：相同模型/Batch/CP Degree/KV 精度/硬件下，ISL 512K 时吞吐相比 All-Gather CP 提升 **16.9%**。

### 3. DSpark：半自回归投机解码

- **背景**：投机解码从单一草稿模型竞争走向草稿生成+目标验证+硬件调度系统协同。Eagle3（自回归草稿，草稿成本随推测长度增加）与 DFlash（并行草稿，延迟更低但后缀质量易衰减）分列两端。
- **方案**：DSpark 以**半自回归结构**建立平衡——并行网络一次产生多个位置 logits，轻量序列模块逐位置采样，每位置采样前根据前一 token 计算 Bias 修正 logits；串行部分只执行 Bias 修正与采样，不重复完整模型。
- **收益**：DeepSeek V4 Flash 线上典型场景（ISL 3K–6K、OSL ~0.5K），平均 TPOT 降低 **15%**。

### 4. 分级 KV Cache：L1/L2/L3 容量扩展 + 高效复用

- **架构**：L1·GPU HBM（最热 KV，命中直接计算）；L2·CPU DRAM（承接 L1 下沉数据，实例内低延迟回填）；L3·SSD/分布式存储（跨实例共享 Prefix KV，按容量与系统压力持久化全部或高复用前缀）。首轮 Prefill 的 Prefix KV 由 L1 下沉至 L2/L3，经 Cache Event 同步位置；网关结合匹配长度/缓存位置/负载做 **Cache-Aware 路由**，命中后回填 L1。
- **收益**：相同模型/流量/SLO 下，相比仅 L1 基线，缓存命中率提升 **20pp**，SLO 约束下吞吐提升 **30%**；生产窗口总命中率约 **87.6%**。
- **前缀树优化**：基于中间状态缓存的增量前缀匹配/插入算法消除全量 token 序列重复匹配/插入的冗余计算，GPU Bubble 从平均 **400ms 锐减至 30ms**，长请求端到端 Prefill 性能提升约 **40%**。

### 5. PD 分离：SLO 驱动弹性 + 大 PD 全局资源池

- **SLO Load**：Prefill/Decode 分别主要决定 TTFT/TPOT，以其相对 SLO 的背离程度统一度量两侧压力；取预测值（队列积压+实际服务率，早发现但有估计误差）与真实值（观测滞后）的**上界**，兼顾及时性与可靠性；Load=1 表示达到目标边界。
- **10 秒级启动**：RDMA 从运行中实例加载权重（避免远端存储重复读取）+ 共享 JIT Cache（复用算子编译结果）+ CUDA VMM 显存布局复用（unmap/remap 减少重新分配），实例启动由约 **10 分钟降至 10 秒以内**。社区类似方向：Dynamo ModelExpress 支持从现有权重分发。
- **大 PD**：固定 xPyD 服务组升级为 P/D 全局资源池——P、D 实例分别组成全局 Prefill Pool / Decode Pool，独立加入退出；Global Router 按 KV cache-aware + 负载均衡选 P 实例，Prefill 完成后结合 D 侧负载/KV 位置/传输成本选 D 实例；P/D 独立扩缩。
- **收益**：容量生效速度提升约 **60 倍**（10 秒 vs 10 分钟）；OpenRouter 显示 StreamLake GLM-5.2 近 30 天 Uptime **99%+**。

### 6. 长请求稳定性：Chunk Prefill 公平调度 + Decode KV 高水位保护

- **长输入**：长请求拆 Chunk 后若连续执行会阻塞短请求（TTFT 拉高）；以 Chunk 为调度粒度 + KV 预算分配执行配额——单个 Chunk 内可完成的短请求优先，长请求配额耗尽后在 Chunk 边界让出（保留已算前缀 KV），恢复配额随让出次数逐步增加（防饿死）。混合流量下平均 TTFT 下降 **17.8%**，P50 下降 **26.0%**，P95 下降 **12.1%**，P99 上升 2.7%（"短请求提前、长请求小幅延后"权衡）。
- **长输出**：Decode KV 高水位保护两路——调度侧持续感知负载停止加压；引擎侧 KV 达高水位暂停新请求准入，必要时释放循环输出等异常长请求 KV 并重调度到资源更充足实例。

## 未来演进

1. **异构 PD 架构**：Prefill 密集计算（国产卡）与 Decode 高访存迭代差异化，同构 PD 有算力浪费。
2. **Program-Aware 全生命周期调度**：调度单元从"单请求"提升到 Program（一次 agent 会话/工作流），暂停/恢复调度 + 工具调用空窗资源回收，容量紧张时"最短程优先"。
3. **SLO 感知调度**：多租户混跑时紧急度优先级调度，预测 prefill 完成时间动态选请求最大化 SLO 达成，延迟敏感请求 QoS 保护与限流。
4. **全栈智能化自适应调优**：强化学习实时感知业务流量/序列特征/硬件负载，自适应优化 PD 配比、弹性阈值、长短流量调度、CP 分片粒度；时序预测预热热 Kernel。

## 要点提炼

- 新一代模型（GLM-5.2 DSA/MLA、DeepSeek-V4）的推理挑战：**模型侧降本 ≠ 系统侧同比提效**——瓶颈从单一算力问题转化为计算/通信/显存/调度相互耦合的系统问题。
- 并行边界重构原则：**让不同状态遵循各自最合适的分布方式**——MLA cKV 沿 Request 维 DP、MoE 沿专家维 EP、Dense FFN 按需 TP，而非单一并行策略覆盖全模型。
- 优化原则：不以模型能力损失为代价（避免过度量化/精度裁剪/推理参数调整损害复杂推理、工具调用与长上下文能力）。
- Agent 场景延伸：Program-Aware 调度将 agent 会话视为调度单元，与工具调用空窗回收结合，指向推理系统向 agent 工作负载演进。
