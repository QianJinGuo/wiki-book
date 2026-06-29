# Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

## Ch11.231 Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

> 📊 Level ⭐⭐ | 2.3KB | `entities/netflix-kueue-batch-compute-migration.md`

## Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

Netflix 将其自研的 Compute Managed Batch (CMB) 系统迁移到 Kubernetes 原生的 [Kueue](https://kueue.sigs.k8s.io/)，实现了百万级 batch job 的调度队列替换。核心收益：fair sharing + preemption + 多维度资源管理。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-netflix-simplified-batch-compute-with-kueue.md)

## CMB → Kueue 迁移动机

| 维度 | CMB（旧） | Kueue（新） |
|------|-----------|------------|
| Fair sharing | 仅在 admission 阶段 | 全生命周期动态调整 |
| Preemption | 无（一旦 admitted 运行到底） | 支持（低优先级可被抢占） |
| 资源维度 | 单维度 | 多维度（CPU/Memory/GPU/自定义） |
| 生态 | 自研 | Kubernetes 原生，CNCF 项目 |

## CMB Tenant 层级模型

- **Internal Tenant**：树节点，不接受 job，容量在子树间 fair-share
- **Leaf Tenant**：叶节点，接受 job，有独立 queue
- **Reserved Capacity**：租户独占，不与其他租户共享
- **Shared Capacity**：全局共享池，所有租户可 burst into

## Kueue 引入的关键语义变化

1. **Fair sharing 全生命周期**：不再只是 admission 阶段，运行中也会根据 fair-share 需求调整
2. **Preemption 支持**：高优先级 job 可以抢占低优先级 job 的资源
3. **多维度资源管理**：CPU、Memory、GPU 等独立管理，不再是单一维度
4. **Federated workload**：通过 Titus 的多 cell 联邦能力，Kueue 可以跨集群调度

## 迁移规模

- 数百万 batch job 从 CMB 迁移到 Kueue
- 涉及 Netflix 内部所有使用 batch compute 的团队
- 渐进式迁移，非一次性切换

## 技术栈

- **Kueue**：Kubernetes 原生 job queueing system（CNCF）
- **Titus**：Netflix 开源的容器管理平台
- **Kubernetes**：底层编排

---

