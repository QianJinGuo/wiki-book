# UltraEP：300微秒实时 MoE 专家负载均衡

## Ch01.1547 UltraEP：300微秒实时 MoE 专家负载均衡

> 📊 Level ⭐⭐⭐ | 5.9KB | `entities/ultaep-moe-expert-load-balancing-300us.md`

# UltraEP：实时 MoE 专家负载均衡

小红书 Dots Infra 团队 + 北京大学提出的 UltraEP，首次将 MoE 专家负载均衡变为逐 microbatch、逐层实时执行的系统能力。

> → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ultaep-moe-expert-load-balancing-300us.md)

## 问题

MoE 热点专家导致负载倾斜，实际吞吐与理想状态可达 2 倍差距。热点难提前猜准——随输入/网络层/routing bias 快速变化。

## 核心设计

Gate 完成后获取当前层真实负载，在 token dispatch 前完成副本求解和分流。关键路径额外开销 ~300µs。

### GPU-native 在线求解器
- 引入 Quota（额度）联合求解专家复制+token分配
- 最低 quota 1024，避免低收益副本
- 优先本地实例，配额耗尽后按剩余额度发远程

### 通信 Kernel
- **Persistent Tile Streaming**：权重切 tile，持久化 Kernel 持续领取任务
- **Chunk Streaming Relay**：热点多播选中继 rank 分摊流量，chunk 边收边转发
- 双缓冲流水线掩盖控制开销

### 共享冗余 Slot
跨 MoE 层复用。Qwen3-235B 每 rank 仅 108MB（vs 每层独立 9.9GB）。

## 结果

| 指标 | 数值 |
|------|------|
| 理想性能达成率 | 94.3%（106B-671B MoE） |
| 相比 Megatron-LM/SGLang | 平均 1.49x |
| 最忙 rank 负载比 | 4.01x → 1.04x |
| 前向开销 | ~300µs |
| 反向开销 | 近零 |
| 均衡后不均衡度 | 1.01 |

## 深度分析

### 从"预测"到"实时求解"的范式转变

UltraEP 最关键的设计突破是将 MoE 专家负载均衡从"预测-分配"范式转变为"测量-求解"范式。传统方法（如 Megatron-LM、DeepSpeed）在训练前或训练间隔期估算专家负载并分配副本，但专家热点是高度动态的——随输入内容、网络层位置和路由策略快速变化。UltraEP 在 Gate 计算完成后**实时**获取当前层的真实负载，在 token dispatch 之前动态求解副本方案，将均衡粒度降低到逐 microbatch、逐层级别。

### Quota 机制的联合优化价值

引入 Quota（额度）概念将专家复制和 token 分配统一到同一优化框架中，是 UltraEP 控制面的核心贡献。最低 quota 1024 的设置是一个关键的工程权衡——它避免了收益有限的副本创建（小副本带来的加速不足以抵消其通信和管理开销）。这种"有下限的复制"策略在 SGLang 等现有系统（无复制）和"对所有热点专家无差别复制"之间找到了实际可行的中间点。

### 通信 Kernel 的双缓冲与中继架构

Persistent Tile Streaming 通过将权重/梯度切分为 tile，由持久化 Kernel 持续领取传输任务，配合双缓冲流水线掩盖控制开销——这一设计借鉴了 GPU 计算中经典的"计算-通信重叠"模式。Chunk Streaming Relay 的创新在于引入中继 rank 分摊多播流量，避免了全局 barrier——这对大规模 MoE 推理和训练场景至关重要，因为全局同步在大规模集群中是主要性能瓶颈之一。

### 跨层共享冗余 Slot 的空间效率

共享冗余 Slot 的设计是 UltraEP 在工程效率上的点睛之笔：跨 MoE 层复用冗余 slot，Qwen3-235B 场景下每 rank 仅需 108MB（vs 每层独立资源配置的 9.9GB——约 91 倍差异）。这一设计的前提假设是各层的热点专家模式虽然不同，但需要的冗余 slot 总数在一定范围内高度稳定——一个在多人多 MoE 训练环境中验证成立的统计特性。

## 实践启示

1. **动态负载均衡的成本可控性验证**：300µs 前向开销和近零反向开销表明，实时 MoE 负载均衡不仅是可行的，而且是高效的。这个延迟放大比（约前向时间的 0.01% 级别）为其他动态调度方案提供了参考基准。

2. **联合求解优于分步优化**：将专家复制和 token 分配放在同一优化过程中（通过 Quota 统一建模）比分步优化（先决定复制哪些专家，再分配 token）产生了更优的整体解。

3. **中继架构是大规模多播的关键**：Chunk Streaming Relay 的中继模式在 MoE 场景被证明有效，这一模式可推广到其他需要高效多播的分布式系统场景。

4. **跨层资源共享的价值被低估**：UltraEP 的跨层共享冗余 slot 设计说明，在 MoE 架构中，垂直（跨层）资源共享往往比水平（层内）扩展更具效率优势。

5. **开源验证加速系统采纳**：UltraEP 的完整开源为社区提供了可复现的基准，其 94.3% 的理想性能达成率为 MoE 推理和训练系统的负载均衡建立了一个新的参考标准。

## 相关实体

- [MoE 架构](ch01/1444-moe-architecture.html) — MoE 基础架构概念
- [LLM Inference Pipeline](ch01/867-llm.html) — LLM 推理流水线
- [MSA 稀疏注意力](https://github.com/QianJinGuo/wiki/blob/main/entities/msa-sparse-attention-three-kingdoms-huashu.md) — 稀疏注意力相关优化

## 开源

GitHub: https://github.com/Dots-Infra/UltraEP

技术报告: https://arxiv.org/pdf/2606.04101

---

