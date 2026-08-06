# 百度百舸 Cosmos3-Super 512 卡 Scaling：无 NVLink 通用 GPU 集群的 AI Infra 工程优化

## Ch11.321 百度百舸 Cosmos3-Super 512 卡 Scaling：无 NVLink 通用 GPU 集群的 AI Infra 工程优化

> 📊 Level ⭐⭐⭐⭐ | 4.9KB | `entities/baidu-baige-cosmos3-super-512gpu-scaling-2026.md`

# 百度百舸 Cosmos3-Super 512 卡 Scaling：无 NVLink 通用 GPU 集群的 AI Infra 工程优化

**来源**: 百度Geek说（百度百舸团队）

**发布日期**: 2026-08-03

**原文链接**: https://mp.weixin.qq.com/s/QWeRXKI5egui2FOUi09CqA

## 摘要

百度百舸在**无 HPN、无 NVLink 的通用 GPU 集群**（hpas.lgn7ib 实例）上完成 64B Cosmos3-Super 世界模型从 4 节点 32 卡到 64 节点 512 卡的 Weak Scaling 验证：扩展效率 97.48%，吞吐从 33.997 提升至 530.227 samples/s，近线性扩展成立，Loss 曲线与 4 节点完全对齐。证明世界模型大规模高效训练不仅依赖硬件互联，更依赖训练框架、通信网络与基础设施的系统协同。

## 核心背景

- **承接前作**：16B Cosmos3-Nano-Policy-DROID 已调优（任务启动 89x、单机吞吐 +99.3%、MFU 0.42 超官方 0.23-0.3、12 节点 98.3% 扩展效率），本篇升级至 64B Super + 64 节点
- **无 NVLink 论点**：挑战"只有专用高性能互联才能训练世界模型"的普遍印象，跨节点通信完全依托百度智能云 ERI（弹性 RDMA 互联）网络
- **Weak Scaling 定义**：每卡 batch size 固定，总吞吐应随节点数线性增长——衡量集群通信/调度开销是否随规模失控的核心指标

## 训练配置

- **MoT 双模块架构**：Reasoner（知识表达与推理）+ Generator（生成）。SFT 只更新 Generator 相关模块（moe_gen/time_embedder/vae2llm/llm2vae/action2llm/llm2action/action_modality_embed），冻结主体网络——对具身智能行业的意义：公司可只用自家场景数据 SFT Generator 模块提升机器人任务表现
- **参数更新范围**：64B 全部参与前向，仅 718 个 Tensor / 约 31.26B 参数有梯度与 Optimizer State
- **并行策略**：PyTorch FSDP2 全量分片（data_parallel_shard_degree 从 16 扩到 512）+ Torch Compile 编译优化
- **扩展方式**：2/4/8/16/32/64 节点逐级扩展，每卡固定 batch size = 32

## Scaling 实测数据

| 节点数 | GPU 数 | median step time | samples/s | 相对 4n | Scaling 效率 |
|---|---|---|---|---|---|
| 4 | 32 | 30.12s | 33.997 | 1.00x | 100.00% |
| 8 | 64 | 30.15s | 67.927 | 2.00x | 99.90% |
| 16 | 128 | 30.36s | 134.914 | 3.97x | 99.21% |
| 32 | 256 | 30.72s | 266.667 | 7.84x | 98.05% |
| 64 | 512 | 30.90s | 530.227 | 15.60x | 97.48% |

节点规模扩大 16 倍，median step time 仅从 30.12s → 30.90s，扩展效率 97.48%（mean 口径 97.43% 一致），无性能拐点。

## 关键技术细节

- **2 节点最小集群**：Language Compile 编译期额外占显存导致 OOM，只能关 Language Compile 留 VAE Compile Only（14.76 samples/s）；4 节点后可双 Compile 全开（33.997 samples/s）。4n 跃升 2.3x 超理论 2x，方向性印证编译优化释放 GPU 算力（非严格 A/B，因同时包含节点翻倍因素）
- **Empty Local Shard 修复**：FSDP2 对小参数切分产生合法空分片，NormMonitor 和 FusedAdam 支持不足。修复：NormMonitor 空分片范数贡献按 0 处理；FusedAdam 执行 fused kernel 前跳过 numel()==0 分片、更新后恢复梯度引用——不改变参数更新数学语义
- **Loss 对齐**：4n 与 64n Loss 走势一致（26 起步 → 50 step 收敛至 1.7-2.1 区间），验证工程优化不影响收敛

## AI Infra 工程优化体系（可复用能力）

基于国内主流 GPU 集群（hpas.lgn7ib 代表）的全链路优化：

- 单机：数据加载优化、I/O 流水线重构、Compile 适配、显存调优
- 大规模集群：FSDP2 全量分片、ERI 网络协同

未来方向：为 WM、VLM、VLA 等新一代基础模型提供高效、稳定、可扩展训练平台。

## 相关链接

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/baidu-baige-cosmos3-super-512gpu-scaling-2026-08-03.md)
- 百度同源姊妹篇：[百度 AI Coding 质量关卡实践](../ch05/121-ai-coding.html)、[全链路研发智能体（百度Geek说）](../ch03/036-agent.html)
- 相关主题：[TMAP 图生视频推理加速实践（大淘宝）](../ch01/1115-20.html)、[高德 AI-Native 端云一体基建](../ch05/022-ai-native.html)

---
