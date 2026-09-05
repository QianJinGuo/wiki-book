---
title: "300 微秒调平 MoE 专家负载！小红书 UltraEP 逼近 94.3% 理想训推吞吐"
source_url: "https://mp.weixin.qq.com/s/nwaOjBKVEDtH_cBlcym2KA"
author: 关注AI Infra的 / 杜伟（编辑）
platform: WeChat
ingested: 2026-07-29
slug: ultaep-moe-expert-load-balancing-300us
sha256: 72198697b64789e325f61e8c3a70b1e8c12b38b9ca46cb175f1537c9676fbe18
---

小红书 Dots Infra 团队 + 北京大学提出的 UltraEP，首次将 MoE 专家负载均衡变成逐 microbatch、逐层实时执行的系统能力。

## 问题

MoE 热点专家导致负载倾斜，在真实训推中可能导致实际吞吐与理想状态拉开 2 倍差距。热点很难提前猜准——专家负载随输入、网络层和路由 bias 快速变化。

## 核心设计

UltraEP 在 Gate 完成后获取当前层真实负载，在 token dispatch 之前完成副本求解和分流。关键路径额外开销约 300 微秒。

### 控制面：GPU-native 在线求解器
- 根据当前层真实负载联合求解专家复制和 token 重路由
- 引入 Quota（额度）将专家复制和 token 分配放进同一优化过程
- 设置最低 quota 1024，避免收益有限的副本创建
- 优先本地实例，配额用完后按剩余额度发到远程

### 数据面：通信 Kernel

**Persistent Tile Streaming**：将权重/梯度切分 tile，持久化 Kernel 持续领取传输任务，双缓冲流水线掩盖控制开销。

**Chunk Streaming Relay**：热点专家多播时选择中继 rank 分摊流量，chunk 边收边转发，无需全局 barrier。

### 共享冗余 Slot
每 EP Rank 预留固定冗余 slot，跨层复用。Qwen3-235B 场景下每 rank 仅需 108MB（vs 每层独立 9.9GB）。

## 结果
- 106B-671B MoE，真实负载下达 force-balanced 理想性能的 94.3%
- 比 Megatron-LM / SGLang 平均提升 1.49x
- 最忙 rank 负载从平均的 4.01 倍降至最高 1.04 倍
- 前向开销 ~300µs，反向开销近零
- 不均衡度降至 1.01

## 开源
GitHub: https://github.com/Dots-Infra/UltraEP
技术报告: https://arxiv.org/pdf/2606.04101
