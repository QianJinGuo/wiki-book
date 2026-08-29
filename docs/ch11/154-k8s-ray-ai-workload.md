# 腾讯 K8s + Ray 超大规模 AI Workload 调度实践

> 📊 Level ⭐⭐ | 8.1KB | `entities/tencent-k8s-ray-ai-workload-scheduling.md`

# 腾讯 K8s + Ray 超大规模 AI Workload 调度实践

## 摘要

腾讯 TEG Ray 团队基于 QCon 分享，深度解析了 **K8s + Ray + PyTorch + vLLM** 黄金组合在超大规模 AI Workload 中的落地实践。核心贡献包括：从 Virtual Kubelet 到 KubeRay 联邦架构的演进路径、跨层弹性调度三级自调优体系、以及全方位的跨层自动化容灾机制。该方案支撑腾讯内部上百个 K8s 物理集群、单集群万卡以上的 AI 训练与推理任务。

## 核心要点

1. **黄金组合贯穿全生命周期**：K8s + Ray + PyTorch + vLLM 覆盖大模型的数据处理、预训练、后训练（RLHF）、在线推理和 Agent 场景。vLLM 过去一年 8000+ Commit，Ray 活跃度已超越 Spark、Flink。

2. **RLHF 训推分离范式革新**：业界 90% 以上 RL 框架采用 K8s + Ray + PyTorch + vLLM。调度范式从预训练的 **Multi-Controller/SPMD** 演进为 **Single-Controller/MPMD**（如 veRL、SkyRL）——中心 Driver 统一编排异构角色，角色内保留 SPMD 高性能。

3. **Ray 的核心调度优势**：支持细粒度进程级异构资源分配、动态增减 Worker、自动重启和状态恢复，无固定计算范式约束——相比 Spark（BSP）、Flink（流式 Dataflow）、PyTorch（SPMD）更具灵活性。

4. **K8s + Ray 分层职责划分**：K8s 负责物理资源调度（Pod→节点，YAML 声明式），Ray 负责应用层调度（Worker→Pod，Python 编程式），通过 KubeRay Operator 管理 RayCluster CR 实现自动扩缩容。

5. **KubeRay 联邦架构**：腾讯从 Virtual Kubelet 架构（节点超 100 性能瓶颈）演进至 KubeRay 联邦架构——多 K8s 集群并发部署 KubeRay Workload，仅一个启动 GCS。支持联邦 Autoscaling，单集群万卡以上，CPU/GPU 统一调度。

6. **三级自动调优体系**：业务只需提交"算子"与"预期产能"，系统自动完成资源匹配：动态扩缩容 → Pod 重调度（隐患节点） → 任务重调度（前两级不达标时），实现真正的跨层弹性调度。

7. **全方位自动化容灾**：Dashboard Agent + Train Monitor + K8s 巡检实现全面故障感知，通过 Ray Dashboard 开放接口统一标记故障，自动完成故障节点替换与续训。

## 深度分析

### K8s + Ray 协同调度的设计哲学

K8s 和 Ray 的分层设计并非简单的功能叠加，而是一种深思熟虑的"关注点分离"：K8s 负责物理资源的生命周期管理和故障恢复（YAML 声明式，面向运维），Ray 负责应用级计算编排和动态调度（Python 编程式，面向开发者）。这种分层使得 AI 团队可以专注于计算逻辑，而无需关心底层资源管理；运维团队可以统一管理基础设施，而无需理解每个训练任务的调度细节。

KubeRay Operator 作为桥梁，将 K8s 的控制面能力（自动扩缩容、节点健康检查、网络策略）与 Ray 的应用级调度能力（进程级资源分配、动态拓扑感知、容错恢复）无缝衔接。这种架构已被业界广泛接受——国内头部厂商如 DeepSeek、月之暗面等在多模态数据处理中全面采用 Ray。

### 从 Virtual Kubelet 到联邦架构的演进逻辑

腾讯的架构演进体现了大规模基础设施部署中一个经典的技术取舍：**抽象 vs. 性能**。Virtual Kubelet 架构的优势是"干净"——通过虚拟化层屏蔽底层 GPU 集群差异，K8s 控制面可以统一管理 CPU 和 GPU 资源。但当节点数超过 100 时，虚拟化层成为瓶颈。

KubeRay 联邦架构的本质是**用复杂性换取可扩展性**：允许多个物理集群并行工作，减少单点瓶颈。多集群并发部署 KubeRay Workload、仅一个 GCS 的设计，在保持控制面统一的同时实现了单集群万卡以上的扩容能力。这一演进路径对于正在建设大规模 AI 基础设施的团队具有直接参考价值——不应急于追求"完美抽象"，而应在抽象和性能之间找到适合自身规模的平衡点。

### RLHF 调度范式迁移的驱动因素

从 Multi-Controller/SPMD 到 Single-Controller/MPMD 的范式迁移，反映了 RLHF 工作负载的特殊调度需求：RLHF 的 PPO 训练涉及多个异构角色（策略模型、奖励模型、参考模型、价值模型），它们之间的关系不是"相同的并行副本"而是"不同的协同组件"。Single-Controller 架构让中心 Driver 统一编排这些异构角色，可以更精准地控制数据流、同步点和容错策略。veRL 和 SkyRL 等框架的实践表明，这一范式在大规模 RLHF 中的效率优势是显著的。

### 跨层弹性调度与容灾的未来方向

腾讯实践中的一个重要洞察是：**弹性调度和容灾本质是同一枚硬币的两面**。三级自调优体系中，从动态扩缩容到 Pod 重调度到任务重调度，每一级都在处理不同粒度的异常——资源波动、节点故障、任务级失败。而全方位的故障感知体系（Dashboard Agent + Train Monitor + K8s 巡检）和统一故障标记机制，使这些不同层级的容错能力可以协同工作而不是各管各的。

未来方向中提到的 **Agentic RL Infra** 值得特别关注——将 Agent 和 Sandbox 运行环境的编排纳入统一底座，反映了 RL 训练从"模型训练"向"Agent 训练"的演进趋势，这与 **RLHF Scaling** 和 **Agent Training Infrastructure** 的发展方向一致。

## 实践启示

1. **选择正确的分层边界**：K8s + Ray 的成功在于选择了"物理 vs. 应用"作为分层边界，而非"训练 vs. 推理"或"CPU vs. GPU"。AI 基础设施团队在设计调度系统时，应优先考虑"什么层提供通用能力，什么层提供 AI 专用能力"。

2. **抽象程度随规模演进**：不要一开始就追求完美的虚拟化抽象。从 Virtual Kubelet（简单抽象）到联邦架构（复杂但可扩展），腾讯的演进路径说明——基础设施方案需要随着集群规模的增长而迭代，一次性设计"通用架构"往往不现实。

3. **容错能力的协同设计**：三层容错（资源级→Pod 级→任务级）和全方位故障感知需要统一设计，而非各自独立建设。统一故障标记是协同的关键接口。

4. **RLHF 的调度需求不同于预训练**：预训练追求 SPMD 高效并行，RLHF 需要 MPMD 异构编排。AI 基础设施团队应为不同训练范式提供差异化的调度原语，而非"一刀切"。

5. **关注 Agentic RL Infra**：随着 Agent 训练（RLHF for Agents、tool-use fine-tuning 等）成为主流，将 Agent 运行环境（Sandbox、工具调用、安全隔离）纳入统一编排将是下一波基础设施竞争的热点。

## 相关实体

- **Kubeflow**
- **RLHF Scaling**
- **vLLM Serving**
- **Agent Training Infrastructure**
- **Ray Distributed Computing**
- **Kubernetes AI Scheduling**

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/tencent-ray-k8s-ai-workload-scheduling.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

