# Back up and restore your Amazon EKS cluster resources using Velero | Amazon Web Services

## Ch01.054 Back up and restore your Amazon EKS cluster resources using Velero | Amazon Web Services

> 📊 Level ⭐ | 7.4KB | `entities/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero-amazon-web-se.md`

## 核心要点
- ...
## 相关实体
- [Back Up And Restore Your Amazon Eks Cluster Resources Using ](../ch11-011-back-up-and-restore-your-amazon-eks-cluster-resources-using/)
- [Announcing Aws Cdk Mixins Composable Abstractions For Aws Resources Amazon Web S](../ch01-116-announcing-aws-cdk-mixins-composable-abstractions-for-aws-r/)
- [Introducing Claude Platform On Aws](../ch01-126-introducing-claude-platform-on-aws-anthropic-s-native-platf/)
- [Restrict Access To Sensitive Documents In Your Amazon Quick Knowledge Bases For  2](../ch11-197-restrict-access-to-sensitive-documents-in-your-amazon-quick/)
- [Announcing Genkit Middleware Intercept Extend And Harden Your Agentic Apps](../ch04-007-announcing-genkit-middleware-intercept-extend-and-harden/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero-amazon-web-se.md)

## 深度分析
**1. Kubernetes-native 备份架构的优势**
Velero 通过 Kubernetes API 发现和备份资源，而非直接访问存储系统。这种 API 驱动的设计使其能够理解 Kubernetes 资源之间的关联关系，支持灵活的过滤（按命名空间、资源类型或标签），并实现跨 Kubernetes 发行版的可移植性。传统备份方案需要直接访问存储系统，而 Velero 只需 API 权限即可完成备份，这一设计选择大幅简化了部署复杂度 ^。
**2. EKS Pod Identity 实现的零凭证管理**
文章演示了使用 EKS Pod Identity 替代传统静态凭证或 ServiceAccount Key 的 IAM 角色 Assume 方案。通过 `aws eks create-pod-identity-association` 将 Velero ServiceAccount 与 IAM Role 绑定，Pod 内的 Velero 进程可直接通过 OIDC 获取临时凭证，无需管理静态 Access Key。Trust Policy 中通过 `StringEquals` 条件限制只有带有特定 `kubernetes-namespace` 和 `kubernetes-service-account` 标签的 Pod 才能 Assume Role，实现了精细化的权限边界 ^。
**3. Least-privilege ClusterRole 的安全实践**
默认 Velero 安装使用 cluster-admin 角色（相当于 Kubernetes 中的 root），文章明确指出这对生产环境不安全。教程自定义了 `velero-restricted` ClusterRole，将权限严格限定到 Velero 实际需要的资源类型：核心资源（namespaces、pods、persistentvolumes 等）、apps 组（deployments、replicasets）、storage.k8s.io 组（storageclasses）以及 velero.io 自定义资源。对 rbac.authorization.k8s.io 仅授予 `get` 和 `list` 权限。这种最小权限原则应作为所有生产环境 Velero 部署的标准实践 ^。
**4. CSI VolumeSnapshotClass 与 EBS 快照的集成机制**
文章详细展示了通过 VolumeSnapshotClass 实现 EBS 卷的 CSI 快照备份。配置中指定 `driver: ebs.csi.eks.amazonaws.com` 并设置 `deletionPolicy: Delete`。Velero 的 `snapshotVolumes: true` 选项触发 EBS CSI Driver 调用 `ec2:CreateSnapshot` API，而非使用传统的 restic 或 kopia 文件级备份。这一方案的优势是快照为崩溃一致性（crash-consistent）快照，保留了 EBS 卷在某一时刻的完整状态，适合有状态应用的恢复需求 ^。
**5. 跨命名空间恢复与灾难恢复场景**
Velero 的 `namespaceMapping` 功能演示了从 `myprimary` 命名空间恢复到 `myrestore` 命名空间的能力，这是跨集群或跨环境恢复的基础。Restore CR 的 `restorePVs: true` 参数确保持久化卷数据（EBS 快照）被重新关联到新命名的 PVC。`preserveNodePorts` 参数保留了原始 Service 的 NodePort，这对于需要固定端口的服务尤为重要。该功能使得 Velero 不仅支持单集群内的命名空间迁移，还可实现跨 EKS 集群的完整应用迁移 ^。

## 实践启示
**1. 生产环境部署 Velero 应使用 Helm 而非默认 CLI 安装**
文章使用 Helm 安装 Velero 并通过 `velero-values.yaml` 配置存储位置、快照位置和 CSI 功能支持。Helm 方式便于版本管理和配置版本化，建议在生产环境中采用此方式而非直接使用 `velero install` CLI 命令 ^。
**2. 部署前必须创建 VolumeSnapshotClass**
在安装 Velero 之前应完成 VolumeSnapshotClass 的创建和验证。EBS CSI Driver 的快照功能依赖正确的 SnapshotClass 配置，且应标记 `velero.io/csi-volumesnapshot-class: "true"` 注解以供 Velero 识别使用 ^。
**3. 使用 Velero Schedule 资源实现自动化定期备份**
文章结语建议通过 Velero Schedule CR 实现每日自动备份。Schedule 支持 cron 风格的定时表达式，可按命名空间、资源类型和标签进行细粒度配置。建议对生产工作负载设置合理的 `ttl`（如 720h，即 30 天）以控制备份存储成本 ^。
**4. 清理步骤必须完整执行以避免资源残留**
文章提供的清理命令涵盖了 Helm Release、Namespace、ClusterRoleBinding、ClusterRole、EKS Addon、S3 Bucket 和 IAM 资源。EBS 快照和卷需手动通过 AWS Console 检查并删除，否则可能产生持续费用。建议将清理步骤脚本化并纳入基础设施即代码流程 ^。
**5. 评估 AWS Backup for EKS 作为替代方案**
文章指出对于需要集中式、完全托管备份调度的场景，AWS Backup for Amazon EKS 是更合适的选择。AWS Backup 提供统一的备份策略管理、控制平面审计和跨服务恢复能力，适合企业级备份合规要求。如果只需要命名空间级粒度和跨集群可移植性，开源的 Velero 仍然是更灵活的选择 ^。

---

