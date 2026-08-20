# Tiered KV Cache for Large LLMs on SageMaker HyperPod with Curvine

## Ch01.1563 Tiered KV Cache for Large LLMs on SageMaker HyperPod with Curvine

> 📊 Level ⭐⭐⭐ | 3.6KB | `entities/tiered-kv-cache-large-llms-sagemaker-hyperpod-curvine.md`

# Tiered KV Cache for Large LLMs on SageMaker HyperPod with Curvine

## 核心洞察：把 KV cache 从单 Pod 隔离扩展到共享三级层级

大规模 LLM 推理的 KV cache 本质上是一个内存权衡问题：要么为增长的 KV cache 购买超规格 GPU 实例，要么接受相同 prompt 反复重算导致的慢 TTFT。vLLM 的 prefix caching 只能在同一副本内复用 cache，水平扩展的 vLLM 副本各自维护隔离的 cache，路由到不同副本等于冷启动。

本文的核心方案是把 cache 层级从 GPU/CPU 内存扩展到共享分布式 NVMe 池，构建三级层级（L0 GPU HBM → L1 CPU/主机内存 → L2 Curvine 共享跨节点 cache），并叠加 cache-aware 请求路由。

## 三级 cache 层级架构

- **L0 – GPU prefix cache**：vLLM 原生 paged-attention 层，持有最热的 KV block。48GB GPU 上 7B bf16 模型权重约 14GB，剩余 30GB+ 给 KV；32B 模型权重 64GB 单卡放不下，分片后 KV 余量极小，并发下快速填满并驱逐。
- **L1 – CPU 内存 offload**：GPU block 被驱逐时由 LMCache 在 host DRAM 接住，运行在每个推理 Pod 内，由 SageMaker HyperPod Inference Operator 的 `enableL1Cache` 配置自动管理。
- **L2 – Curvine 共享跨节点 cache**：轻量级分布式 cache 文件系统（curvineio.github.io），作为共享 L2 层（GPU→CPU→共享 NVMe），让 KV cache 能以接近本地磁盘的速度跨副本复用。

## 实测效果

测试部署达到：最高 100% 跨 Pod cache 命中率、最高 2.7x TTFT 改善、跨节点 L2 读延迟约 56ms（约 1,900-token prompt）。此前需要 P5 实例的工作负载可运行在更低成本的 G6e 实例上，降低每端点成本。

## 架构决策要点

- 三层 cache 层级（L0/L1/L2）叠加 cache-aware 请求路由是核心思想：拒绝"每个 vLLM 副本各自隔离、无共享"的默认状态。
- 实现路径：启用 HyperPod Tiered Storage → 在节点本地 NVMe 部署 Curvine workers → patch Inference Operator 支持 filesystem-backed L2。

## 相关实体

- [vLLM](ch01/883-vllm.html)
- [DeepSeek 系统层 KV cache 成本迁移](ch01/587-deepseek.html)
- [Curvine 存储选型（EKS 万级 Agent）](../ch04/588-ai-agent.html)
- [SageMaker 推理可观测性](https://github.com/QianJinGuo/wiki/blob/main/entities/sagemaker-inference-observability-cloudwatch-insights.md)
- [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)
- [GPU 优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/gpu-optimization.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tiered-kv-cache-for-large-llms-on-amazon-sagemaker-hyperpod-with-curvine.md)

---

