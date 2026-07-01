# Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

## Ch11.180 Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

> 📊 Level ⭐⭐ | 6.3KB | `entities/netflix-kueue-batch-compute-migration.md`

# Netflix Kueue 迁移：百万级 Batch Job 从 CMB 到 Kubernetes 原生调度

## 摘要

Netflix 将自研的 Compute Managed Batch (CMB) 系统迁移到 Kubernetes 原生的 [Kueue](https://kueue.sigs.k8s.io/)，实现了百万级 batch job 的调度队列替换。CMB 创建于 2018 年，随着 Kubernetes 生态的成熟，其自研的 fair sharing、容量管理等功能已被开源方案覆盖。Kueue 的引入不仅替代了 CMB 的队列和调度逻辑，还带来了 preemption、全生命周期 fair sharing、多维度资源管理等 CMB 无法实现的能力。整个迁移对终端用户完全透明，零改动完成，生产迁移仅耗时 4 周。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-netflix-simplified-batch-compute-with-kueue.md)

## 核心要点

### CMB 架构与局限

CMB 是 Netflix 的托管批处理解决方案，允许用户和应用执行运行到完成的工作负载。其核心是 **Tenant 层级模型**：

- **Internal Tenant**：树形结构的内部节点，不直接接受 job，其容量在子树间 fair-share 分配
- **Leaf Tenant**：叶节点，接受 job 提交，关联独立 queue
- **Reserved Capacity**：租户独占容量，不与其他租户共享，确保吞吐量
- **Shared Capacity**：全局共享池，所有租户可 burst into，通过 weight 进行 fair-share

CMB 的关键局限在于：fair sharing 仅在 admission 阶段生效，一旦 job 被 admitted 就运行到底（无 preemption）；资源管理维度单一；与底层 Kubernetes 集群的距离使得新功能开发（如 preemption）极其困难。

### 为什么选择 Kueue

Netflix 评估了多个方案后选择 Kueue，关键决策因素：

1. **不替换 kube-scheduler**：不同于 YuniKorn 或 Volcano，Kueue 不替换 pod 调度，保留了 Titus 的调度配置，避免 job placement 碎片化影响效率
2. **采用势头和创新速度**：Kueue 作为 CNCF 项目，社区活跃度高
3. **多租户配额管理**：支持异构硬件上的多租户配额
4. **原语兼容性**：支持 `v1.Pod`、`batch/v1.Job` 等原语，也支持 RayJob/RayCluster 等高级抽象
5. **内建高级特性**：preemption、all-or-nothing scheduling、topology aware scheduling

### CMB → Kueue 语义变化

| 维度 | CMB（旧） | Kueue（新） |
|------|-----------|------------|
| Fair sharing | 仅 admission 阶段 | 全生命周期动态调整 |
| Preemption | 无（admitted 后运行到底） | 支持（低优先级可被抢占） |
| 资源维度 | 单维度 | 多维度（CPU/Memory/GPU/自定义） |
| 生态 | 自研封闭 | Kubernetes 原生，CNCF |
| 容量借用 | 不支持 | 未使用 reserved capacity 可借给其他租户 |

## 深度分析

### 迁移架构设计

迁移的核心原则是 **API 不变 + 底层替换**。用户提交 job 的接口完全不变，变化发生在 Titus 内部：

```
旧流程：User → CMB API → CMB Queue/Scheduler → Titus Cells
新流程：User → CMB API → Kueue Router → Kueue-enabled Titus Cells
```

关键组件映射：
- Internal Tenant → Kueue Cohort
- Leaf Tenant → ClusterQueue + LocalQueue
- 容量配置 → ResourceFlavor + NominalQuota

Titus 的 federation 层负责将 job 路由到启用了 Kueue 的 cell，用户无需感知底层 cell/cluster 拓扑。

### Fair Sharing 与 Preemption 的实际效果

Kueue 的 [Preemption-based Fair Sharing](https://kueue.sigs.k8s.io/docs/concepts/fair_sharing/#preemption-based-fair-sharing) 带来两个关键改进：

1. **容量借用**：当某租户的 reserved capacity 未使用时，其他租户可以借用这些资源，显著提高整体利用率
2. **优先级抢占**：高优先级 job 可以抢占低优先级 job 的资源，确保业务关键工作负载的快速周转

Preemption 配置示例：
```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: "team-a-cq"
spec:
  preemption:
    reclaimWithinCohort: Any
    withinClusterQueue: LowerPriority
```

部署这些特性后，Compute 团队观察到平均资源利用率显著提升。

### 迁移中的工程挑战

**高吞吐量调优**：Netflix 的 batch 规模远超 Kueue 的默认配置。团队需要将 Kueue 的 QPS、Burst 和 groupKindConcurrency 调高到远超默认值的水平。通过在模拟 Titus 的开发环境上提前运行负载测试来验证。

**迁移策略**：团队做出了一个违反直觉的决策——先迁移最大最复杂的客户。这建立了后续迁移的信心，最终生产迁移仅耗时 4 周。

## 实践启示

1. **API 兼容性优先**：保持对外 API 不变，仅替换底层实现，是大规模基础设施迁移的黄金法则。这降低了迁移风险，将技术风险与用户体验风险解耦
2. **先啃硬骨头**：先迁移最复杂的用例，而非从简单的开始。简单的成功不能证明复杂的也能成功，反之则可以
3. **提前压测**：在类生产环境提前发现性能瓶颈，避免生产事故
4. **CNCF 生态复用**：Kueue 替代了 CMB 的大量自研代码，维护成本大幅降低，同时获得了社区的持续创新
5. **渐进式迁移**：通过 UI 上的按钮一键 enroll/rollback，降低了操作风险

## 相关实体

- [Netflix 分层通知系统](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-notification-slow-fast-hierarchical-rl.md) — 同属 Netflix 工程实践，关注 RL 驱动的个性化
- [VMAF v1](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-vmaf-v1-video-quality-metric-upgrade.md) — Netflix 视频质量度量升级
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 平台工程约束与验证框架

---

