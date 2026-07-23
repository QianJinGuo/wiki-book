# 腾讯 K8s + Ray 超大规模 AI Workload 调度实践

## Ch11.276 腾讯 K8s + Ray 超大规模 AI Workload 调度实践

> 📊 Level ⭐⭐ | 2.7KB | `entities/tencent-k8s-ray-ai-workload-scheduling.md`

# 腾讯 K8s + Ray 超大规模 AI Workload 调度实践

> 腾讯 TEG Ray 团队实践：K8s + Ray 协同调度范式在超大规模 AI Workload 中的落地，涵盖多模态数据处理、RLHF 训推分离、KubeRay 联邦架构、跨层弹性调度与自动化容灾。

## AI Infra 黄金组合

**K8s + Ray + PyTorch + vLLM** 贯穿大模型全生命周期。

国内头部厂商在多模态数据处理几乎全面采用 Ray；90% 以上 RL 训练框架基于 Ray 构建；阿里等企业探索基于 Ray 构建 Agent Sandbox。

## 调度范式革新

RLHF 从预训练的 **Multi-Controller/SPMD** 范式演进为 **Single-Controller/MPMD**（如 veRL、SkyRL）：中心 Driver 统一编排异构角色，角色内部保留 SPMD 高性能。

### Ray 核心优势 vs 其他引擎

Ray 无范式约束——基于进程级计算单元，用户可自由构建任意计算范式，而 Spark/Flink/PyTorch 均与固定范式深度耦合。

## K8s + Ray 协同调度

| 层 | 角色 | API |
|---|------|-----|
| K8s | 物理资源调度（Pod→节点） | YAML 声明式 |
| Ray | 应用层调度（Worker→Pod） | Python 编程式 |

通过 **KubeRay Operator** + K8s → KubeRay → Ray Scheduler 链路实现自底向上由粗到细的协同调度。

## 腾讯落地实践

### KubeRay 联邦架构
腾讯 TEG 内部上百个 K8s 物理集群，CPU/GPU 算力分离。从 **Virtual Kubelet 架构**（节点超 100 性能瓶颈）演进为 **KubeRay 联邦架构**（多集群并发部署，单集群万卡以上）。

### 跨层弹性调度
业务提交"算子"+"预期产能"，系统三级自动调优：**动态扩缩容** → **Pod 重调度**（隐患节点） → **任务重调度**。

### 跨层自动化容灾
- **全方位故障感知**：Dashboard Agent + Train Monitor + K8s 巡检
- **统一故障标记** → 故障节点替换与任务续训自动完成

## 未来方向

更原生的 Ray 联邦架构、更通用的分布式底座、更统一的 **Agentic RL Infra**——覆盖 Agent 与 Sandbox 运行环境的统一编排。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tencent-ray-k8s-ai-workload-scheduling.md)

---

