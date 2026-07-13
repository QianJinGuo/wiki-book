# AI Agent 存储选型：Curvine 如何在 EKS 上支撑万级Agent运行

## Ch04.535 AI Agent 存储选型：Curvine 如何在 EKS 上支撑万级Agent运行

> 📊 Level ⭐⭐ | 4.5KB | `entities/ai-agent-storage-curvine-eks-2026.md`

# AI Agent 存储选型：Curvine 如何在 EKS 上支撑万级Agent运行

AI Agent 大规模部署面临一个独特的存储挑战：每个 Agent 实例是一个有状态进程，需要独立的 POSIX 文件系统工作空间（含项目代码、依赖、记忆文件等），而 Kubernetes 原生的块存储（EBS）和文件存储（EFS）在万级实例规模下存在不同的瓶颈。

## 传统方案的局限

### EBS：隔离性好，但挂载数是硬上限
每个 Agent 一个独立 EBS volume 在隔离性上是最干净的方案，但单个 EC2 实例能挂载的 EBS volume 数量有硬性上限（r6g 系列约 28 个）。在测试场景中，每台 r6g.4xlarge 节点跑约 100 个 Agent Pod，如果用 EBS 给每个 Pod 分配独立 volume，需要近 4 倍的节点数才能承载相同 Pod 密度。此外 EBS volume 绑定单个 AZ，无法跨 AZ 使用，限制了调度灵活性。

### EFS：隔离机制成熟，但大规模 provision 是瓶颈
EFS 配合 Access Point 可做到文件系统级别的租户隔离，且支持 ReadWriteMany。但实际大规模部署中，EFS API 对 Access Point 的创建有速率限制，CSI controller 需要串行或小批量地调用 API，导致大规模 PVC provision 速度受限。

### S3：容量无限，但不是文件系统
S3 作为最终归档层没有问题，但 Agent 运行时需要 POSIX 文件语义（open、read、write、seek、rename、list directory），S3 不支持原地修改、rename 原子性、目录列举的一致性语义。

## Curvine：为 Agent 规模化设计的分布式缓存文件系统

OpenClaw 等 Agent 平台的文件系统需求（SOUL.md、AGENTS.md、MEMORY.md 等 Markdown 文件的密集随机读写）催生了 Curvine——一个用 Rust 编写的分布式缓存文件系统，核心思路是在云对象存储（S3）之上建立一层分布式缓存，向上提供完整 POSIX 语义，向下以对象存储作为持久化层。

### 核心架构
- **Master 节点**：元数据管理，Raft 共识算法保证高可用
- **Worker 节点**：多层缓存（内存→SSD→HDD），热数据自动提升
- **客户端访问**：FUSE 挂载提供 POSIX 接口，兼容 S3/HDFS 协议
- **Kubernetes 集成**：原生 CSI Driver，PVC provision 仅需 mkdir 一个目录（毫秒级），不依赖云厂商 API

### 与 JuiceFS 的核心差异
1. **性能**：Rust 实现核心读写路径，零拷贝技术，官方标称 100μs 级延迟和 100K+ 稳定 QPS
2. **元数据容量**：单集群支持 50 亿小文件
3. **元数据独立**：Curvine 文件元数据与底层 S3 对象路径一一对应，即使服务故障 S3 文件仍可独立访问
4. **缓存架构**：内存→SSD→HDD 多层自动分级，调度策略更细粒度
5. **定位：** AI 训练加速和 Agent 云原生存储作为一级用例

## 万级 Pod 基准测试

在 Amazon EKS 上进行了规模验证：10,000 个独立 Pod 全部 Running，零失败。测试环境：99 × r6g.4xlarge 节点（Karpenter 自动扩缩）、10,000 个 PVC 全部 Bound、存储集群本身仅 1 Master + 3 Worker = 4 个核心 Pod。每节点承载 ~100 个 Agent Pod，节点资源利用率 CPU 88% / Memory 98%。

关键结论：
1. **Provision 不依赖云厂商控制平面 API**：Curvine 创建 PVC 本质是分布式文件系统内 mkdir 一个目录，不受云 API 限流约束
2. **存储集群资源开销极小**：4 个核心 Pod 服务万级 PVC
3. **单节点 Pod 密度不再受存储限制**：100 个 Pod 共享同一 FUSE 挂载点不同路径
4. **横向扩展清晰**：增加 Worker 节点即可

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-agent-存储选型curvine-如何在-eks-上支撑万级agent运行.md)

---

