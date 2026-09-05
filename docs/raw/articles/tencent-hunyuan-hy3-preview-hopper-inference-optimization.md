---
title: "腾讯混元 Hy3 preview 在 Hopper 卡上的推理优化实践"
source_url: "https://mp.weixin.qq.com/s/miAOHTBZLyuDfNle1jrO0w"
author: "混元 AI Infra 推理团队"
published: 2026-06-30
ingested: 2026-06-30
type: raw-article
language: zh
tags: [hunyuan, hy3, inference-optimization, hopper, moe, attention, quantization, sparse-attention, mtp, tpsp]
sha256: a67253df162d971465419bd56260991efedef63294a2041a434b68baee0f7f6b
---

# 腾讯混元 Hy3 preview 在 Hopper 卡上的推理优化实践

**作者**: 混元 AI Infra 推理团队
**模型**: Hy3 preview（GQA + MoE 混合架构，295B 总参/21B 激活，256K 上下文）
**部署卡**: NVIDIA Hopper（96G）
**精度**: W8A8C8
**测试数据**: 5000 条真实数据（最大输入 192k，平均 68k；最大输出 64k，平均 0.9k；缓存理论命中 80%）
**约束**: 50ms TPOP，4s TTFT

## 五大维度优化

### 1. 算子优化

#### Attention：动态调度负载均衡
- 所有请求按统一 Tile 粒度拆分，贪心装桶算法实现 Tile 极致均分
- Task Assign 模块每次推理前生成专属任务映射表
- 单 batch 长文本加速 **2.95x**，混合长度 batch 加速 **1.59x~1.76x**

#### Router GEMM：双 BF16 重构 FP32 计算
- FP32 权重拆分为高位 BF16 + 低位残差 BF16，推理时两次 BF16 GEMM 线性组合
- 双路计算融合至单一 Kernel，全程无 HBM 往返
- N=192、K=4096 规格下相比 FP32(cuBLAS) **2.86x~3.22x** 加速

#### FusedMoE：全算子流水线重构
- 路由与索引预处理、Gate-Up GEMM、激活量化+Down GEMM、Top-K 加权聚合、PDL 无气泡串联
- TP=8/EP=1：相比 vLLM CUTLASS/Triton、SGLang **1.5x~1.6x** 加速
- TP=1/EP=8：**1.2x~1.5x** 加速

### 2. 算子融合

#### Fused Rope+Norm+Hadamard+Quant+Store KV
- 5 个算子重构为单一微型流水线 Kernel，寄存器级数据流转
- 在线量化直接以低比特写入 KV Cache
- 融合算子加速约 **5x**

#### Fused AllReduce+Norm+Add
- 通信、残差计算、归一化全链路融合
- 高吞吐版（NVSwitch 多播）+ 低延迟版（Lamport P2P）
- 覆盖 8~32k tokens，最高加速 **1.68x**

#### 采样融合算子
- 10 余个零碎 Kernel 融合为 2 个核心 CUDA Kernel
- 全词表单次加载，GPU 闭环惩罚计算
- 相比 vLLM/FlashInfer 提升约 **5.5x/2.5x**

#### GEMM+Comm 细粒度通算融合
- SM 显式划分为计算 SM（矩阵乘）与通信 SM（RS 搬运）
- Load → MMA → Epilogue 三级流水
- Tile 级计算与通信重叠，加速比 **1.68x~1.81x**

### 3. 并行策略优化

#### Prefill：TPSP
- SP 拆分 + 通算融合 + 通信量化 + 并行模式调整
- Prefill 16k TTFT 从 764ms→536ms（**−29.9%**）
- Prefill 32k TTFT 从 1885ms→1424ms（**−24.5%**）

#### Decode：DP+EP
- Attention DP + MoE EP 跨节点混合并行
- 自研 HPC Kernel（gate/route/group gemm/count and gather/combine）
- 长序列 Attn DPTP 混合策略
- 异步专家负载均衡（Async EPLB），权重重排与 Decode 完全重叠
- 端到端吞吐提升 **15.7~44.7%**

### 4. 多级缓存

- GPU → CPU → KVStore 三级缓存体系
- 请求按 L1→L2→L3 顺序查询可复用前缀
- 新 Block 异步下沉至 L2/L3

### 5. MTP 和异步调度优化

- 解除 CPU 对真实接收长度的同步依赖：按最大接收长度准备，上轮结果修正关键值
- CPU 提前一轮完成准备与 Launch
- 减少 decode 间 5~10ms CPU 气泡，端到端提升 **10%~20%**

### 6. 量化压缩

#### 量化（AngelSlim 框架）
- GPTQ 权重重建 + 激活平滑与旋转变换 + QAT 轻量化微调
- Attn FP8 + W4A8 配置下精度无损（多领域评测与 BF16 基线差距 < 1%）
- 端到端吞吐提升 **28%+**

#### 稀疏注意力（Stem + HPC-BSA）
- Token Position-Decay：头部 k_start 线性衰减到尾部 k_end = μ·k_start
- Output-Aware Metric (OAM)：M(i,j) = QK^T + β·max(0, log(||V_j||₂))
- 25% 计算预算实现接近稠密注意力精度
- 128K 上下文 Prefill 延迟降低 **3.6x**

## 后续工作
- C4 与 W4 相关优化
- 全新并行投机解码方案
- 调度和并行策略、PD 高效传输、多级缓存中心、跨机通信与流量控制
- 其他硬件平台适配
