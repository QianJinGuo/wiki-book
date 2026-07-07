# HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时

## Ch11.086 HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时

> 📊 Level ⭐⭐ | 10.3KB | `entities/hiclaw-v110-k8s-hermes-worker.md`

## 核心变化
### Kubernetes 原生架构（重大重构）
HiClaw v1.1.0 从单容器模式重构为标准的 **Controller-Reconciler 架构**：

- `hiclaw-controller` 内嵌轻量级 kube-apiserver + kine 存储 CRD 数据，在 Embedded 模式下无需外部 K8s 集群
- 同一 Controller 可通过 Helm Chart（`helm/hiclaw/`）部署在真实 K8s 集群，支持 Leader Election 高可用、RBAC、PVC、Pod 模板叠加
- CRD 化资源管理：Worker、Team、Human、Manager 均为标准 CRD，支持 `kubectl get workers` 等操作
→ [Hermes Agent 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md)

### Hermes Worker 运行时
Hermes Agent 成为 HiClaw Worker 的**一等公民运行时**：

- 完整的自主编程 Agent 能力：终端沙箱、多文件代码生成、调试、视觉分析、原生 Matrix 集成
- 安装器支持交互式运行时选择，Worker 可原地切换：`hiclaw update worker --runtime hermes`
- 支持多 Agent 协作：Hermes Worker 可与 agent 和 QwenPaw Worker 参与团队项目，跨运行时 `m.mentions` 消息投递
→ [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
→

### 企业级 Helm Chart 部署
生产级 Helm Chart 将 Tuwunel（Matrix）、MinIO（对象存储）、Element Web（IM 客户端）和 hiclaw-controller 部署为独立 Deployment/StatefulSet：

- **Leader Election**: 基于 Lease 的多副本高可用
- **Agent Pod 模板**: 通过 ConfigMap 注入 nodeSelector、tolerations、imagePullSecrets 等
- **多租户隔离**: 可插拔凭证提供者 Sidecar + per-worker accessEntries

### 可插拔 Provider 架构
Controller 通过 Provider 接口委托网关（Higress）和存储（MinIO/OSS）操作，新增 `hiclaw-credential-provider` Sidecar 负责 STS Token 签发、密钥轮转和 per-worker 访问策略执行。
→ [Agent Harness 上下文管理：工作集视角](../ch05/038-agent-harness.html)

## 架构改进
| 特性 | v1.0.9 | v1.1.0 |
|------|--------|--------|
| 架构模式 | 单容器 | Controller-Reconciler（K8s 原生） |
| 集群部署 | 不支持 | Helm Chart + Leader Election |
| 资源管理 | JSON 文件 | CRD（kubectl 原生） |
| Worker 运行时 | 仅 openclaw | openclaw / agent / qwenpaw / hermes |
| 网关/存储 | 硬编码 | Provider 接口 + Sidecar |
| Manager 镜像 | ~1.79 GB | ~103 MB（基于 ubuntu:24.04） |

## 关键技术细节
- **CRD 短名称**: wk（Worker）、tm（Team）、hm（Human）、mgr（Manager）
- **Worker 生命周期**: `spec.state: running | stopped` 优雅启停
- **Controller 内置 CLI**: 容器内预装 `hiclaw` CLI，支持 `hiclaw get workers` 等直接管理
- **迁移支持**: 从 v1.0.9 自动迁移 `workers-registry.json` → CRD，保留运行时、模型、技能、MCP Server
- **YOLO 模式修复**: 跨 Controller→Manager 边界的 YOLO 模式传播

## 修复亮点
18 个 Bug 修复覆盖：令牌轮转导致消息丢失、YOLO 模式传播中断、默认模型/运行时配置不生效、Hermes Worker 未加入 Matrix 房间、CR 迁移丢失运行时、镜像瘦身 1.7 GB 等关键问题。

## 深度分析
### 1. Controller-Reconciler 架构：从单容器到 K8s 原生的范式转移
HiClaw v1.1.0 最大的架构变化是放弃单容器模式，采用标准的 Controller-Reconciler 模式 ^。在 Embedded 模式下，Controller 内嵌轻量级 kube-apiserver + kine 存储 CRD 数据，无需外部 Kubernetes 集群即可运行。这意味着 HiClaw 在架构上已经与 Kubernetes 深度耦合——即使没有真实集群，Controller 本身就是一个"模拟 K8s 控制平面"的单节点集群 ^。通过 Helm Chart 部署到真实集群时，Controller 可以利用 Leader Election 实现多副本高可用，当故障发生时自动完成 Leader 切换 ^。这种设计让 HiClaw 从一个"可在 K8s 上运行的应用"变成了一个"本身就是 K8s 扩展机制的应用"——它的 Controller 是 Kubernetes API 的扩展，它的资源是 Kubernetes CRD。

### 2. Hermes Worker 定位：自主编程 Agent 与协作运行时的关系
Hermes Worker 被定位为"一等公民运行时"，这意味着它与其他 Worker 运行时（openclaw、agent、qwenpaw）并非简单并列关系 ^。关键区别在于：openclaw（Node.js）和 QwenPaw（Python）运行时处理对话和工具调用，而 Hermes 是一个**自主编程 Agent**，可以独立规划、执行和迭代复杂的软件任务 ^。这种定位与 HiClaw 的多 Agent 协作设计形成有趣的张力：Hermes Worker 可以与 agent 和 QwenPaw Worker 共同参与团队项目，跨运行时通过 `m.mentions` 消息投递进行通信 ^。这意味着 Hermes 不是替代其他运行时，而是补充了"需要自主代码生成和执行能力"这一垂直场景。

### 3. CRD 化资源管理：kubectl 原生操作的价值
将 Worker、Team、Human、Manager 全部 CRD 化，并支持短名称（`wk`、`tm`、`hm`、`mgr`），是 HiClaw 对 Kubernetes 生态的深度整合 ^。CRD 化的直接价值在于：运维人员可以使用标准的 `kubectl get workers` 查询资源状态，Controller 内置 CLI 也通过免认证直连机制（`docker exec -it hiclaw-controller hiclaw get workers`）提供同等能力 ^。更重要的是，CRD 的 `spec.state: running | stopped` 生命周期管理让 Worker 的启停变得原子化——设置 `state: stopped` 优雅停止容器并保留所有状态 ^。这使得 Manager 可以基于空闲检测实现"自动休眠+按需唤醒"，而不需要引入外部的 Kubernetes HPA 或自定义脚本。

### 4. Provider 接口与 Sidecar 模式：存储/网关解耦的实现路径
Controller 通过 Provider 接口委托网关（Higress）和存储（MinIO/OSS）操作，新增 `hiclaw-credential-provider` Sidecar 负责 STS Token 签发、密钥轮转和 per-worker 访问策略执行 ^。这种 Provider + Sidecar 模式在 Kubernetes 生态中有成熟的参考（如 CSI Provider、CNM Provider），HiClaw 将其应用于多租户隔离场景：CRD 中的 per-worker `accessEntries` 限定对象存储路径，配合可插拔凭证提供者实现租户隔离 ^。这个设计的关键价值在于：添加新的存储后端（如 Azure Blob、Cloudflare R2）只需实现新的 Provider，无需修改 Controller 核心代码。

### 5. 18 个 Bug 修复的结构性启示
v1.1.0 一口气修复了 18 个 Bug，其中令牌轮转导致消息丢失、YOLO 模式传播中断、默认模型/运行时配置不生效等问题，反映出 v1.0.9 在分布式状态一致性上的技术债务 ^。令牌轮转问题的根因是"每 5 分钟协调周期轮转 Matrix 访问令牌"，而修复方案是"令牌跨协调周期持久化复用"——这是一个典型的"用状态掩盖设计缺陷 vs. 用正确设计消除状态"的选择 ^。YOLO 模式传播中断则揭示了 Embedded 模式下 Controller→Manager 边界的特殊挑战 ^。这些修复为理解 HiClaw 的分布式一致性模型提供了有价值的反面教材。

## 实践启示
1. **Embedded 模式适合快速验证，Helm Chart 才是生产部署目标**：虽然 Embedded 模式无需外部 K8s 集群，但其 Controller 内嵌 kube-apiserver 的架构在多副本场景下无法实现真正的高可用。生产环境应使用 Helm Chart 部署，利用 Leader Election 确保 Controller 的 HA ^。
2. **Hermes Worker 的适用场景需要明确边界**：Hermes 擅长自主代码生成和复杂软件任务执行，但不适合需要高频对话交互的场景。选择 Hermes 运行时前应评估任务类型——纯对话/工具调用场景用 agent 或 QwenPaw，复杂代码开发/调试场景才考虑 Hermes ^。
3. **利用 `spec.state` 生命周期管理实现成本优化**：通过设置 Worker 的 `spec.state: stopped` 实现优雅休眠，配合 Manager 的空闲检测机制，可以在保持状态的同时释放计算资源。这是 Kubernetes 环境下成本控制的有效手段 ^。
4. **多租户场景优先使用 CRD + accessEntries 隔离**：在共享 K8s 集群的多租户部署中，通过 per-worker `accessEntries` 限定对象存储路径，配合 `hiclaw-credential-provider` Sidecar 实现凭证管理和密钥轮转，比在应用层实现隔离更安全可靠 ^。
5. **迁移前务必备份 `workers-registry.json`**：从 v1.0.9 升级时自动迁移 `workers-registry.json` → CRD 的机制虽然方便，但迁移过程存在 bug（如团队 Worker 丢失运行时信息）^。建议在执行升级前手动备份原始文件，以便在迁移异常时进行人工修复。

## 关联概念
-
-
-
-

-
## 相关实体

- [企业级多-agent-规模化落地怎么做群虾智能-ai-沙龙-ppt-限时领取](../ch03/045-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hiclaw-v110-k8s-hermes-worker.md)

---

