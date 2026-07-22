---
title: DeepSeek MoE 并行策略与通信优化
source_url: https://mp.weixin.qq.com/s/zg0wHd170GPtpfiBjBZgTg
author: 机器学习算法与自然语言处理
published: 2026-05-17
created: 2026-05-17
updated: 2026-05-17
type: article
tags: [deepseek, moe, expert-parallel, gpu-parallel, distributed-training, dualpipe, waved-ep]
sha256: 334ed04ac662874b95c5b808db17d05eb7af65ba9c2239c84d14226b1ac4c095
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
---
# DeepSeek MoE 并行策略与通信优化
## 核心观点
从Dense切到MoE后MFU暴跌的原因不在于Expert切分维度小（实际至少1024），而在于通信bound。解决方法是设计合理的GPU并行策略，做好计算和通信的overlap。
## DeepSeek V3 并行策略
**硬件配置**:
- 2048张 H800
- 8卡节点内 NVLink 互联（900GB/s）
- 跨节点 IB（InfiniBand）50GB/s
**并行策略**: `16-way PP × 64-way EP × ZeRO-1 DP`
EP跨节点占用IB带宽，这是主要的通信bound。
## GPU并行策略详解
| 策略 | 切分内容 | 通信量 | 适用场景 |
|------|----------|--------|----------|
| DP | 无（参数全量） | 高（梯度all-reduce） | 小模型 |
| ZeRO-1 | 优化器状态 | 同DP（免费） | 中模型 |
| ZeRO-2 | 优化器+梯度 | 高（GB级别） | 大模型 |
| ZeRO-3/FSDP | 参数+优化器+梯度 | 极高 | 超大模型 |
| TP | Tensor计算 | 高，适合nvlink | 节点内 |
| PP | Layers | 小，适合跨节点 | 跨节点 |
| EP | Expert | 极高，IB带宽 | MoE专用 |
| CP | seq激活 | 中 | Long context |
**关键区别**: FSDP只切分存储不切分计算，TP同时切分计算。
## EP与DP的特殊关系
EP是唯一一个"在forward pass内部把token重新换主"的并行维度——通过all-to-all让token临时离开自己的DP rank、被另一组卡处理、再送回来。
**DeepSeek例子**: 2048 GPU，PP=16，EP=64，DP_total=128，DP_replica=2
## DP ZeRO-1 选择逻辑
| 方案 | 问题 |
|------|------|
| ZeRO-3/FSDP | 每次前向all-gather通信量=参数量，抢EP的IB带宽 |
| ZeRO-2 | reduce-scatter通信量也是GB级别，抢EP backward带宽 |
| ZeRO-1 | 非优化器step无通信，通信量同普通DP，省12倍显存 |
**结论**: 把宝贵的IB带宽留给EP通信。
## PP气泡挤压演进
1. **GPipe**: 朴素方案，气泡大
2. **1F1B**: 激活更早丢弃，显存小，可增大M挤压气泡
3. **ZB1P**: 拆解反向计算，先算dx再算dw，用显存换计算
4. **DualPipe**: 双向micro-batch，Forward和Backward把计算和通信错开
**DualPipe实现**: H800的132SM中划出20个SM跑PTX级通信kernel（非NCCL）
## V4 Waved-EP
**问题**: DualPipe依赖大Batch（稳态长度依赖M），RL/推理无Backward无法遮掩
**对比Comet**: RL 1.96x加速，通用 1.50~1.73x加速
**原理**: 把Expert分成wave组，wave间dispatch/计算/Combine并行
**TileLang**: 写得出Triton写不出的mega-kernel（dispatch+GEMM+combine融合）
## 参考文献
1. [DeepSeek V4论文](https://arxiv.org/pdf/2512.24880)
2. [DeepSeek V4 Pro HuggingFace](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
3. [DeepSeek V3论文](https://arxiv.org/pdf/2412.1943)