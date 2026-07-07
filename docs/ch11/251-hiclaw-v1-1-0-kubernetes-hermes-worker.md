# HiClaw 发布 v1.1.0，提供 Kubernetes 集群部署实现，支持 Hermes Worker 运行时

## Ch11.251 HiClaw 发布 v1.1.0，提供 Kubernetes 集群部署实现，支持 Hermes Worker 运行时

> 📊 Level ⭐⭐⭐ | 11.3KB | `entities/hiclaw-发布-v110提供-kubernetes-集群部署实现支持-hermes-worker-运行时.md`

[Hiclaw 发布 V110提供 Kubernetes 集群部署实现支持 Hermes Worker 运行时](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hiclaw-发布-v110提供-kubernetes-集群部署实现支持-hermes-worker-运行时.md)

在小说阅读器读本章
去阅读
在小说阅读器中沉浸阅读
HiClaw v1.1.0 新增了 11 项功能，修复了 18 个 Bug，特别感谢 xcaspar, johnlanni, vincent067,cr72589,max-wc,Jingze,YuFeng,luoxiner,googs1025 等 9 位贡献者。
** 01  **
_ ** 新增功能  ** _
_ Cloud Native  _

####  Kubernetes 原生架构
HiClaw 可运行在 Kubernetes 原生控制平面之上。  hiclaw-controller  取代了旧版单容器模式，采用标准的 Controller-Reconciler 架构：内嵌轻量级 kube-apiserver + kine 存储 CRD 数据，Controller 将 Worker/Team/Manager/Human CR 协调为容器、Matrix 房间和网关路由。在 Embedded 模式下（  hiclaw-controller  容器 + 独立  hiclaw-manager  容器），无需外部 Kubernetes 集群。对于企业级部署，同一 Controller 可通过官方 Helm Chart（  helm/hiclaw/  ）运行在真正的 Kubernetes 集群中，支持 Leader Election 高可用、RBAC、PVC 持久化存储以及 Pod 模板叠加。

####  Hermes Worker 运行时
HiClaw 支持将  hermes-agent  作为一等公民的 Worker 运行时，用于自主编程任务。Hermes Worker 具备完整的自主编程 Agent 能力：终端沙箱执行、多文件代码生成、调试、视觉分析以及原生  mautrix  Matrix 集成 — 全部运行在隔离容器中。与处理对话和工具调用的 agent（Node.js）和 QwenPaw（Python）运行时不同，Hermes 是一个自主编程 Agent，可以独立规划、执行和迭代复杂的软件任务。安装器提供三种运行时的交互式选择，Worker 可原地切换运行时：  hiclaw update worker --runtime hermes  （容器重建，Matrix 账号、房间、凭据和 MinIO 数据保留）。同时支持多 Agent 协作 — Hermes Worker 可以与 agent 和 QwenPaw Worker 一起参与团队项目，支持跨运行时  m.mentions  消息投递和无人值守的 YOLO 模式自主执行。

####  企业级 Kubernetes 部署（Helm Chart）
HiClaw 提供生产级 Helm Chart，用于在 Kubernetes 集群上部署 HiClaw。Chart 将 Tuwunel（Matrix 服务器）、MinIO（对象存储）、Element Web（IM 客户端）和 hiclaw-controller 部署为独立的 Deployment/StatefulSet，配备完整的 Service、RBAC 和 Secret 资源。关键企业特性：

* Leader Election（高可用）：Controller 支持多副本部署，基于 Lease 的 Leader Election 确保同一时间只有一个实例执行协调，故障时自动切换。
* Agent Pod 模板：通过 ConfigMap 叠加向 Agent Pod 注入集群特定配置（nodeSelector、tolerations、imagePullSecrets、annotations、sysctls），无需修改 Controller 代码。
* 多租户支持：可插拔凭证提供者 Sidecar（  hiclaw-credential-provider  ）对接网关和存储后端。CRD 中的 per-worker  accessEntries  限定对象存储路径，支持租户隔离。
* CRD 化资源管理：  kubectl  /  hiclaw  CLI 可互换操作 — Worker、Team、Human、Manager 均为标准 CRD，支持短名称（  wk  、  tm  、  hm  、  mgr  ），  kubectl get workers  可直接使用。

####  可插拔网关与存储 Provider
Controller 现在通过 Provider 接口委托网关（Higress）和存储（MinIO/OSS）操作，新增  hiclaw-credential-provider  Sidecar 负责 STS Token 签发、密钥轮转和 per-worker 访问策略执行。可对接阿里云 OSS、AWS S3 或任意 S3 兼容后端，无需修改 Controller 代码。

####  多容器架构
Manager 镜像不再打包 Higress、Tuwunel、MinIO 和 Element Web。基础设施服务专属于  hiclaw-embedded  镜像（Controller 容器），Manager 是轻量级的纯 Agent 容器（减小约 1.7 GB）。这实现了独立扩缩容、重启隔离和清晰的职责分离。

####  OpenClaw 2026.4.x 升级 & 镜像瘦身 1.7 GB
内置 OpenClaw 引擎升级至  hiclaw-2026.4.14  ，带来 Matrix 私有网络安全修复、结构化 Matrix 调试日志（  HICLAW_MATRIX_DEBUG=1  ）以及网关 Control UI 端口统一。  openclaw-base  基础镜像从  higress/all-in-one  （~1.79 GB）重置为  higress/ubuntu:24.04  （~103 MB），所有下游镜像（manager、worker、copaw-worker、hermes-worker）缩减约 1.7 GB。关键兼容性修复包括：设置  gateway.bind = "lan"  以支持跨容器访问、  autoJoin = "always"  确保 Matrix 房间可靠加入、  dangerouslyAllowPrivateNetwork = true  适配内嵌 homeserver 的 FQDN-over-loopback 方案。

####  省时迁移
从 v1.0.9 升级时，会自动将  workers-registry.json  数据迁移为 CRD 资源。Worker 的运行时、模型、技能、MCP Server 和团队成员关系全部

## 深度分析
HiClaw v1.1.0 是该项目从"单容器玩具"向"企业级 Cloud Native 产品"演进的关键里程碑。透过功能列表，可以识别出三个相互关联的架构决策：
**CRD 化是 Kubernetes 原生的核心**：将 Worker/Team/Manager/Human 全部抽象为 CRD（Custom Resource Definition），配合内嵌 kube-apiserver + kine，使得 HiClaw 在无需真实 Kubernetes 集群的情况下（Embedded 模式）也能模拟完整的控制平面体验。这意味着开发测试阶段的体验与生产部署高度一致，降低了"在我机器上能跑"和"在集群上能跑"之间的摩擦。同时，在真实集群中运行时，运维人员可以用熟悉的 `kubectl` 管理所有资源，与现有 GitOps 流程无缝衔接。
**Hermes Worker 的定位跃升**：Hermes Worker 的引入不只是增加了"又一个运行时"，而是代表了 HiClaw 对 Agent 能力的重新分类。原有的 agent（Node.js）和 QwenPaw（Python）运行时处理的是"对话+工具调用"型任务，而 Hermes 是"自主编程 Agent"，具备独立规划→执行→迭代的闭环能力。这两者并非替代关系，而是互补关系——在团队项目中，Hermes 负责代码生成和修改，agent 负责对话式交互，QwenPaw 负责特定领域任务，多运行时协作代表了 Multi-Agent 系统的一种实践路径。
**镜像瘦身的工程价值**：1.7 GB 的镜像缩减（从 ~1.79 GB 的 `higress/all-in-one` 重置为 ~103 MB 的 `higress/ubuntu:24.04`）看起来是运维优化，实际上对启动速度和扩缩容体验有显著影响。在 Serverless 容器场景（如 AWS Fargate 或 Kubernetes HPA 快速扩容）下，大镜像意味着更长的冷启动时间；瘦身后的镜像将直接提升用户感知的响应速度，也降低了 CI/CD 流水线中镜像拉取的耗时。

## 实践启示
1. **Embedded 模式适合团队内部试用，Helm Chart 才是生产部署目标**：如果团队想在不搭建 Kubernetes 集群的情况下验证 HiClaw，Embedded 模式（`hiclaw-controller` + 独立 `hiclaw-manager`）是低门槛入口；但对于需要多副本高可用、RBAC 细粒度权限控制的生产环境，Helm Chart 部署是唯一合规选择。
2. **Hermes Worker 是自主编程场景的首选**：当用户需求是"帮我写一个 Web 服务"或"重构这个模块"这类需要多文件操作的复杂任务时，优先选择 Hermes Worker；而"帮我查一下今天的会议安排"或"总结这个文档"这类单轮对话需求，agent 或 QwenPaw Worker 更轻量。
3. **多运行时协作时关注 Matrix 消息路由**：Hermes Worker 与 agent/QwenPaw 通过 Matrix 协议进行 `m.mentions` 消息投递实现跨运行时通信。在配置团队项目时，需要确保各 Worker 的 Matrix 房间（Room）拓扑正确，否则消息可能无法到达预期的 Worker。
4. **Credential Provider Sidecar 是多租户安全的关键**：在共享集群环境中，per-worker `accessEntries` 限定对象存储路径 + `hiclaw-credential-provider` Sidecar 负责签发限时 STS Token，这套组合是防止租户间数据串访的技术保障。部署多租户实例时，必须正确配置 Sidecar 而非将存储凭据直接放入 Worker 环境变量。
5. **升级前备份 workers-registry.json**：虽然 v1.1.0 提供了从 `workers-registry.json` 到 CRD 的自动迁移，但建议在执行升级前对原文件进行备份，以防迁移过程中出现意外中断导致数据丢失。
## 相关实体
- [Hiclaw V110 K8S Hermes Worker](../ch01/205-0.md)
- [Hermes Agent Goal Runtime Architecture State Persistence Judge Closed Loop](../ch04/351-hermes-agent-goal.md)
- [Hermes 9 Module Architecture Winty](../ch01/682-9.md)
- [Ai 驱动的大数据工程 从平台驱动到 Aidlc 的范式迁移](../ch04/070-ai.md)
- [Pi Agent Framework](../ch04/331-pi-agent.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hiclaw-发布-v110提供-kubernetes-集群部署实现支持-hermes-worker-运行时.md)

---

