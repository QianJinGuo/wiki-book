# 在 Amazon EKS 上构建安全的 AI Agent 沙箱

## Ch04.602 在 Amazon EKS 上构建安全的 AI Agent 沙箱

> 📊 Level ⭐⭐ | 3.8KB | `entities/amazon-eks-ai-agent-sandbox-2026.md`

# 在 Amazon EKS 上构建安全的 AI Agent 沙箱

## 背景：AI Agent 安全事件频发

2025–2026年间，多起严重的AI Agent安全事故为行业敲响了警钟。2025年7月，某在线平台的AI Agent删除了一个有1206条记录的生产数据库并生成假数据掩盖痕迹；2026年2月，某主流AI编程助手执行了"terraform destroy"，摧毁了VPC、RDS和ECS集群，导致2.5年的学生数据丢失；同年4月，另一款AI代码编辑器在9秒内通过云平台API删除了生产数据库和所有备份。安全研究方面，CVE-2026-XXXXX展示了某AI Agent框架三层沙箱被完全绕过（CVSS 10.0），CVE-2026-XXXXX（CVSS 8.8）证明某开源Agent网关的WebSocket接口可被利用实现远程代码执行。这些事故表明，Agent执行环境中需要更强的隔离机制。

## 传统容器的隔离局限

标准的Docker/runc容器通过Linux namespace做进程级隔离，但所有容器共享同一个宿主机内核。在多租户Agent场景下，如果一个用户的会话触发了内核漏洞或资源耗尽攻击（OOM、fork bomb），影响会跨越容器边界波及同节点上所有其他用户的会话。对于需要执行不可信代码的AI Agent平台来说，这种共享内核的隔离模型远远不够——会话之间需要VM级别的内核隔离，才能保证一个恶意或失控Agent不会影响同节点的其他租户。

## EKS + Kata Containers 方案核心

AWS中国博客介绍了一种基于Amazon EKS的安全AI Agent沙箱方案，核心是用Kata Containers + Cloud Hypervisor给每个沙箱提供一个独立的microVM。该方案使用c5.metal裸金属实例直接暴露/dev/kvm做硬件虚拟化，避免嵌套虚拟化的性能损耗。每个沙箱Pod通过Kata Containers 3.31.0 + Cloud Hypervisor（CLH）跑在自己的microVM中，拥有独立的Guest Kernel，与宿主机Host Kernel完全隔离。CLH用Rust编写，专为云原生容器场景设计，单个Pod内存开销约130MB（比QEMU节省30MB），冷启动约800ms级别。OpenSandbox Controller通过Pool和BatchSandbox两个CRD管理预热池（warm pool）的生命周期——从预热池claim一个沙箱的端到端延迟平均约230ms，不走预热池的冷启动也仅约3秒。Karpenter 1.12.1配合Pause Pod预热机制负责节点层面的弹性扩缩，弥合裸金属节点分钟级启动与Agent沙箱毫秒级交付之间的矛盾。

## 部署架构与性能数据

方案采用三层自动扩缩容架构：基线层（Managed Nodegroup常驻一台c5.metal，保证日常请求秒级响应）、预热层（Karpenter + 低优先级Pause Pod占位，迫使Karpenter提前拉起热备节点）、突发层（预热节点用完后Karpenter按需启动新的c5.metal，空闲30分钟后自动回收）。扩容链路中，预热池claim延迟约230ms，冷启动约3.1秒，节点扩容（从CreateFleet到Node Ready）约1分钟以内，加上kata-deploy安装约3–5分钟。在压测场景下（一次性创建20 replicas触发1→4节点扩容），整个扩容过程约5分钟完成，Pool回填到bufferMin在10秒内自动完成。方案还提供了完整的部署指南，涵盖EKS集群创建、Karpenter安装、Kata Containers运行时部署、OpenSandbox Controller安装以及沙箱池创建验证。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/amazon-eks-ai-agent-sandbox-2026.md)

---

