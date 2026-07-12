# DeepSeek MoE 并行策略与GPU通信优化

## Ch01.882 DeepSeek MoE 并行策略与GPU通信优化

> 📊 Level ⭐⭐ | 4.6KB | `entities/deepseek-moe-parallel-strategy.md`

## 核心观点
从Dense切到MoE后MFU暴跌的原因不在于Expert切分维度小（实际≥1024），而在于**通信bound**。解决方法是设计合理的GPU并行策略，做好计算和通信的overlap。

## DeepSeek V3 并行策略
- **硬件**: 2048 H800，8卡节点NVLink(900GB/s)，跨节点IB(50GB/s)
- **策略**: `16-way PP × 64-way EP × ZeRO-1 DP`

## 并行策略对比
| 策略 | 切分内容 | 通信特点 |
|------|----------|----------|
| ZeRO-1 | 优化器状态 | 通信量同DP，省12倍显存 |
| TP | Tensor计算 | 通信量大，适合nvlink |
| PP | Layers | 通信量小，适合跨节点 |
| EP | Expert | 通信量极高，IB带宽瓶颈 |
| CP | seq激活 | Long context场景 |
**关键**: ZeRO-1是"近乎免费"的，把宝贵IB带宽留给EP。

## EP与DP的特殊关系
EP是唯一一个"在forward pass内部把token重新换主"的并行维度——all-to-all让token临时换GPU处理后再回来。

## PP气泡挤压演进
1. **GPipe**: 朴素方案，气泡大
2. **1F1B**: 增大M挤压气泡
3. **ZB1P**: 先算dx再算dw
4. **DualPipe**: 双向micro-batch，EP通信→计算遮掩
**实现**: H800 132SM中20SM跑PTX通信kernel（非NCCL）

## V4 Waved-EP
**问题**: DualPipe依赖大Batch，RL/推理场景无效
**方案**: 把Expert分wave组，wave间并行dispatch/计算/Combine
**TileLang**: 写得出Triton写不出的mega-kernel（dispatch+GEMM+combine融合）

## 深度分析
**通信Bound的根源**: MoE架构中All-to-All通信占比极高，EP跨节点的IB带宽成为瓶颈。Dense模型不存在这个问题，所以切到MoE后MFU（Model FLOPs Utilization）暴跌。
**DualPipe的SM划分策略**: 132SM中划出20个SM跑PTX级通信kernel，绕过了NCCL的通用优化，直接针对特定通信pattern做极致优化。这说明DeepSeek在通信层面做了非常深入的定制。
**ZeRO-1的"免费午餐"逻辑**: ZeRO-1在非优化器step无通信，通信量同普通DP，但省12倍显存。把节省下来的IB带宽全部让给EP，是非常明智的策略选择。
**EP与DP的正交性**: EP是唯一一个在forward内部让token换主的并行维度，其他并行维度（TP/PP/CP）都是静态切分。这使得EP和DP可以独立叠加，形成 `PP×EP×ZeRO-DP` 的混合策略。

## 实践启示
**1. MoE训练先看通信再调计算**: 不要只盯着MFU指标，先用NCCL通信分析确认瓶颈在All-to-All，再针对性做overlap设计。
**2. EP+ZeRO-1是标准组合**: 跨节点EP通信使用IB带宽，用ZeRO-1避免额外梯度通信，让IB带宽专注服务于EP的All-to-All。
**3. DualPipe需要大Batch**: 适用预训练场景。RL/推理场景Batch小，气泡无法被Overlap掩盖，需要切到Waved-EP。
**4. Waved-EP的wave粒度选择**: wave间并行度决定通信和计算的重叠效率。需要根据GPU数量和Expert总数做实验调优。
**5. TileLang做融合kernel**: 当Triton语法无法描述复杂的dispatch+GEMM+Combine融合时，TileLang可以写出极致性能的mega-kernel。

## 与现有知识的链接
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepseek-moe-parallel-strategy.md)
- → [DeepSeek V4论文解读](ch01/318-deepseek-v4.html) — 训练流程
- → [DeepSeek V4 Pro评测](ch01/318-deepseek-v4.html) — 模型能力

---

