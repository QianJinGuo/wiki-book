---
title: "腾讯 Ray 团队实践：K8s + Ray 如何支撑超大规模 AI Workload"
source_url: "https://mp.weixin.qq.com/s/j1pq-Fus3Rr-9ATsIQYKwg"
source_site: "mp.weixin.qq.com"
source_author: "charliecli｜腾讯技术工程"
ingested: "2026-07-14"
sha256: "88a7353e83616a9d4d7811077fd01b4f10238cd07df87e3ea527d4a80138dddf"
type: "raw-article"
tags: [ray, k8s, kubernetes, ai-infra, rlhf, scheduling, tencent]
status: "ingested"
---

# 腾讯 Ray 团队实践：K8s + Ray 如何支撑超大规模 AI Workload

> 腾讯 TEG Ray 团队基于 QCon 分享，深度解析 K8s + Ray 协同调度范式及在腾讯内部超大规模集群的落地实践。

## 一、AI 基础设施技术栈演进

黄金组合：**K8s + Ray + PyTorch + vLLM**，贯穿大模型全生命周期（数据处理、预训练、后训练、在线推理、Agent）。

- vLLM 过去一年 8000+ Commit
- Ray 活跃度已超越 Spark、Flink
- 国内头部厂商（DeepSeek、月之暗面等）多模态数据处理几乎全面采用 Ray
- 90% 以上 RL 训练框架基于 Ray
- 阿里等企业探索基于 Ray 构建 Agent Sandbox

## 二、基于 Ray 的 AI Workload 调度

### 多模态数据处理三大挑战
1. **异构调度**：CPU 与 GPU 算子高效匹配
2. **动态分配**：根据负载动态调整资源与并发
3. **高容错**：容错粒度下探到 Stage/Pod/进程级

### RLHF 训推分离
业界 90% 以上 RL 框架采用 K8s + Ray + PyTorch + vLLM。RLHF PPO 中：

- 训练端：PyTorch 生态（Megatron、DeepSpeed）
- 推理端：vLLM 后端
- 编排调度：Ray 串联全局
- 底层基座：K8s

范式革新：**Multi-Controller/SPMD → Single-Controller/MPMD**。veRL、SkyRL 等框架纷纷转向中心 Driver 统一编排异构角色，角色内部保留 SPMD 高性能。

### 调度需求四点
1. 异构资源
2. 动态分配
3. 高容错
4. 原生 Single-Controller

### Ray vs 其他引擎

| | Spark | Flink | PyTorch | Ray |
|--|-------|-------|---------|-----|
| 计算范式 | BSP | 流式 Dataflow | SPMD | 无范式（通用） |
| 异构资源 | 粗粒度 | 粗粒度 | 不支持 | 细粒度（进程级） |
| 动态分配 | AQE | 支持 | 不支持 | 细粒度 |
| 容错 | RDD Lineage | Checkpoint | 整组重启 | 进程级 |
| Single-Controller | 支持 | 支持 | 不支持 | 支持 |

### Ray 核心 API 设计

`@ray.remote(num_cpus=2, num_gpus=1, max_restarts=-1)` 定义异构角色，通过 `remote()` 创建任意数量实例，支持动态增减、自动重启和状态恢复。

## 三、K8s + Ray 协同调度

**职责分工**：
- K8s：物理资源调度与管理（Pod → 物理节点，YAML 声明式）
- Ray：应用层调度与编排（Worker 进程 → Pod，Python 编程式）

通过 **KubeRay Operator** 管理 `RayCluster` CR，支持自动扩缩容。K8s → KubeRay → Ray Scheduler 自底向上由粗到细的协同调度链路。

## 四、腾讯内部落地实践

### 挑战：联邦 K8s 架构
腾讯 TEG 内部上百个 K8s 物理集群，CPU 与 GPU 算力维度分离，WeData 与太极 AI 维护两套独立 K8s 基础设施。

### 方案演进
1. **Virtual Kubelet 架构**：CPU 集群保留 KubeRay，VK 将 GPU 资源虚拟化。成功落地但节点超 100 时性能瓶颈。
2. **KubeRay 联邦架构**：多 K8s 集群并发部署 KubeRay Workload，仅一个启动 GCS。支持联邦 Autoscaling，单集群万卡以上，CPU/GPU 统一调度。

### 跨层弹性调度
业务只需提交"算子"与"预期产能"，系统自动完成资源匹配。三级自动调优：
1. **动态扩缩容**：实时调整异构 Ray 节点数量
2. **Pod 重调度**：隐患节点触发重调度
3. **任务重调度**：前两级仍不达标时重新调度

### 跨层自动化容灾
- **全方位故障感知**：Dashboard Agent + Train Monitor + K8s 巡检
- **统一故障标记**：通过 Ray Dashboard 开放接口
- **故障节点替换与续训**：自动替换 + K8s 屏蔽 + 新任务避开

## 五、未来方向
- 更原生的 Ray 联邦架构
- 更通用的分布式底座（多模态/预训练/RL/推理/Agent）
- 更统一的 **Agentic RL Infra**：覆盖 Agent 与 Sandbox 运行环境的统一编排
