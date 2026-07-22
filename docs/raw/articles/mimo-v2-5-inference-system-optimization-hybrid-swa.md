---
source: https://mp.weixin.qq.com/s/W01MI8fX5_ILD9BI16QdZw
title: "MiMo-V2.5 推理系统全链路优化方案：Hybrid SWA + MoE + 多模态工程落地"
author: MiMo Team
source_account: MiMo
created: 2026-07-02
fetched: 2026-07-02
sha256: 287e075efa4ecf725dc5db6b30b5745606a767fbd43a4cb2e2aa8e865631c941
---

MiMo-V2.5 系列通过系统性重构推理栈，实现最高 99% 的 API 降价。本文是业内首篇全面覆盖 Hybrid SWA + MoE + 多模态组合架构的大规模工程落地方案。

## 为什么选择 Hybrid SWA 架构

70 层 Transformer 中，仅 10 层使用 Full Attention，其余 60 层使用 Sliding Window Attention（窗口 128 token）。整体 KVCache 存储降至全 Full Attention 的约 1/7，Prefill 计算量同步降至约 1/7。短文场景性价比接近，序列越长优势越大。

## 工程化实践

### KVCache 系统重构

**双池分治**：拆分 Full KV Pool（按需增长、长期保存）与 SWA KV Pool（环形缓冲区，O(W) 规模）。容量效率提升约 7 倍。

**前缀缓存树重构**：SWA 模式下传统"token 序列相等 → KV 也相等"假设被打破。升级匹配规则为"窗口安全长度"，将淘汰路径与请求生命周期绑定。线上命中率平均 93%，高频用户 >95%。

**GCache 三级缓存**：GPU 显存 → CPU 内存 → NVMe SSD 三级自动流转。RDMA 通信实现单进程 170 GB/s 读吞吐、280μs 延迟。额外存储成本为零（混部在 GPU 机器上）。

### 调度与 Prefill 优化

**KVCache 亲和调度**：优先调度已缓存当前请求前缀的节点，L2 缓存命中率提升约 25%。

**计算量感知优先调度**：优先处理真实计算 token 更少的请求，辅以等待时间惩罚避免饥饿。TTFT P90 降低 30%。

**EP 缩减与分桶**：SWA 释放显存后 Expert Parallelism 缩减至 1/2，Prefill 性能提升约 40%。三级长度分桶（0-64K / 64K-256K / 256K-1M）聚合负载特征相近的请求。

### Decode 加速

**显存扩容**：SWA KVCache 支持后有效容量提升近 5 倍。

**MTP 投机解码**：原生 3 层 MTP，前 128 token 加速比 2.3×，128-256 token 加速比 1.5×。

### 多模态链路并行化

Encoder 支持跨请求组 Batch，图片预处理迁移至 GPU。视频解码多 chunk 多线程并行，1 小时视频端到端延时从 156 秒降至 23 秒。一致性哈希和机内共享内存实现 Embedding 缓存共享，Encoder 吞吐提升至 2 倍。

## 开源贡献

部分优化已以 PR 形式回馈 SGLang 开源社区。

技术博客：https://mimo.xiaomi.com/zh/blog/mimo-v2-5-inference
