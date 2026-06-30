# AWS Graviton5 M9g/M9gd 实例 GA 公告

## Ch11.087 AWS Graviton5 M9g/M9gd 实例 GA 公告

> 📊 Level ⭐⭐ | 10.2KB | `entities/aws-graviton5-m9g-m9gd-launch-2026.md`

# AWS Graviton5 M9g/M9gd 实例 GA 公告

> **TL;DR**：AWS 在 re:Invent 2025 预览后正式发布 M9g 实例 + 新增 M9gd（本地 NVMe SSD 版），均由 Graviton5 处理器驱动。192 核、DDR5-8800、PCIe Gen6，相比 Graviton4 计算性能 +25%、Web 应用 +35%、ML 推理 +35%、数据库 +30%。Meta 部署数千万核 Graviton 用于代理 AI 工作负载；ClickHouse / Honeycomb / HubSpot 公布对比 M8g 的实测收益。

## 三个独有贡献

- **完整硬件规格表** — 这是 wiki 中**唯一**一份 Graviton5 处理器及 M9g/M9gd 全部实例大小的完整规格（vCPU、内存、网络带宽、EBS 带宽、本地 NVMe 存储）。
- **官方客户验证数据** — ClickHouse（+36% vs M8g）、Honeycomb（+36% per-core throughput vs Graviton4）、HubSpot（MySQL 查询 -60% 时长）、Meta（千万级核部署代理 AI）。
- **Nitro Isolation Engine** — 首个经形式验证的云虚拟机监控器，数学保证隔离性。

## 关键架构升级（vs Graviton4）

- **计算性能**: +25%
- **Web 应用程序**: +35%
- **机器学习推理**: +35%
- **数据库**: +30%
- **L3 缓存**: 5x（上一代）
- **核心间延迟**: 降低最多 33%
- **内存**: DDR5-8800
- **PCIe**: Gen6
- **核心数**: 192

## 网络与存储带宽

- 网络带宽: 比同类实例平均高 15%（最大实例最高 2x）
- EBS 带宽: 比同类实例高 20%
- 实例带宽配置（IBC）: 可在 EBS 和 VPC 网络之间调节带宽分配最多 25%

## M9g 实例规格（部分）

| 大小 | vCPU | 内存 (GiB) | 网络 (Gbps) | EBS (Gbps) |
|------|------|-----------|-----------|-----------|
| 中型 | 1 | 4 | 高达 15 | 高达 12 |
| 8xlarge | 32 | 128 | 17 | 12 |
| 24xlarge | 96 | 384 | 50 | 36 |
| 48xlarge | 192 | 768 | 100 | 72 |
| metal-48xl | 192 | 768 | 100 | 72 |

## M9gd 实例（本地 NVMe SSD）

- 存储量: 高达 11.4 TB NVMe SSD
- 相比 M8gd: IOPS 和存储性能 +30%
- 最大实例: 3 x 3800 GB NVMe SSD（48xlarge）

## Nitro Isolation Engine（安全增强）

- 形式验证（formal verification）保证虚拟机监控器隔离性
- 首个经数学证明的云虚拟机监控器
- 强制隔离：通过最小化 API 集，调解所有 VM 内存、CPU 寄存器、I/O 设备访问

## 客户案例

- **ClickHouse**: 性能比 M8g +36%，代码更改为零
- **Honeycomb**: 6 个月 A/B 测试，每核吞吐量比 Graviton4 +36%
- **HubSpot**: MySQL 数据库查询时长 -60%
- **Meta**: 部署数千万 Graviton 内核支持代理 AI 工作负载（实时推理、代码生成、多步骤任务编排）

## 适用工作负载

- 通用: 应用服务器、微服务、中型数据存储、游戏服务器、缓存、容器化应用、大规模 Java 应用
- 代理 AI: 实时推理、代码生成、工具调用、评估循环、多步骤编排
- ML 推理、EDA、游戏、视频编码
- M9gd 适合需要本地高速存储的: 数据日志、媒体处理、批处理、日志处理

## 可用区域

- 美国东部（弗吉尼亚北部）
- 美国东部（俄亥俄）
- 美国西部（俄勒冈）
- 欧洲（法兰克福）

## 采购选项

节省计划、按需实例、竞价型实例、专用实例、专属主机

## 与现有 Graviton 实体的差异化

| 实体 | 焦点 | 与本文关系 |
|------|------|----------|
| `ai-graviton-migration-kiro-power-guide` | Kiro IDE 迁移到 Graviton 的开发者指南 | 互补：本文是硬件层，Kiro guide 是开发工具层 |
| `amazon-redshift-推出带有集成数据湖查询引擎的基于-aws-graviton-的-rg-实例` | Redshift RG 实例（数据仓库） | 平行：另一个基于 Graviton 的服务 |
| `openclaw-multi-7-ecs-fargate-graviton` | ECS Fargate + Graviton 部署 | 互补：本文是 EC2 实例，ECS Fargate 是编排层 |
| `build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice` | EKS + Graviton + OpenClaw 多租户 | 互补：本文是底层硬件规格 |
| **本文 `aws-graviton5-m9g-m9gd-launch-2026`** | **新硬件 GA 公告** | **唯一**完整规格表来源 |

## 深度分析

**1. Graviton5 vs Graviton4 架构演进：从单核优化到系统级协同**

Graviton5 相比 Graviton4 的改进不只是时钟频率的提升，而是围绕 AI/代理 AI 工作负载的系统级重新设计。L3 缓存扩大 5 倍是最直接的改变——这直接影响代码执行效率，而内核间延迟降低 33% 则解决了多线程协作的瓶颈。配合 DDR5-8800 内存提供的高带宽，数据搬运不再成为 CPU 等待的主因。

**2. 代理 AI 工作负载的 CPU 密集型特征**

从回答问题到采取行动、运行代码、调用工具、评估结果、编排多步骤任务，代理 AI 实际上对 CPU 的需求远高于传统推理加速器。推理阶段需要大量串行逻辑处理，工具调用依赖低延迟网络，评估循环需要快速反馈。GPU 资源受限时，CPU 的计算能力和内存带宽直接决定了系统的并发吞吐量。

**3. Arm 架构在云端渗透率：从边缘试探到核心锁定**

经过五代定制硅芯片和八年投资，Graviton 已支持超过 350 种实例类型、12 万客户、多个托管服务。Meta 部署数千万核是最有力的背书——这代表超大规模云厂商已将 Arm 架构作为 AI 基础设施的默认选择。AWS 的策略很清晰：通过软硬协同优化，让客户无需修改代码就能获得性能提升，从而降低迁移门槛，加速替换 x86 进程。

**4. 形式验证安全：Nitro Isolation Engine 的行业意义**

Nitro Isolation Engine 是第一个经数学证明的云虚拟机监控器。形式验证意味着隔离性不是通过测试用例验证的，而是在数学层面可证的。这对金融、医疗等强合规场景是新的安全基线，AWS 也在用它区隔与竞争对手的差距。

**5. 性价比压力与能效趋势**

随着计算需求增长，能源效率成为云厂商和客户的共同约束。Graviton5 每代都提升能效，这对大规模部署尤其重要。

## 实践启示

- **新代理 AI 部署的优先选择**: M9g 192 核 + DDR5-8800 + PCIe Gen6 是 2026 年代理 AI 推理的官方推荐目标硬件
- **M9gd 适合需要临时数据暂存的场景**: 媒体处理、数据日志、批处理 — 不需要外部 EBS 时延
- **Nitro Isolation Engine 提供数学保证的隔离**: 对金融、医疗等强合规场景是新的安全基线
- **Meta 千万级核部署证据**: 这是 2026 年最大规模的单一 CPU 供应商锁定案例，验证了 Arm 架构在 AI 工作负载上的成熟度
- **零代码迁移收益显著**: ClickHouse +36% vs M8g，证明从 M8g 迁移到 M9g 的性价比路径清晰
- **Honecomb 6 个月 A/B 测试数据**: 每核吞吐量 +36% vs Graviton4，可作为企业评估的参考基准
- **HubSpot MySQL 查询 -60% 时长**: 数据库类工作负载迁移优先收益明显，建议从数据库层切入迁移计划
- **DDR5-8800 + PCIe Gen6 组合**: 云中迄今最快的内存子系统，是内存带宽敏感型工作负载（ML 推理、实时分析）的关键升级

## 相关资源

- [AWS Graviton 入门指南](https://github.com/aws/aws-graviton-getting-started)
- [Graviton 节省控制面板](https://docs.aws.amazon.com/guidance/latest/cloud-intelligence-dashboards/graviton-savings-dashboard.html)
- [AWS Transform](https://aws.amazon.com/blogs/compute/migrating-your-java-applications-to-aws-graviton-using-aws-transform-custom/) — x86 → Graviton 自动化迁移

## 相关实体
- [amazon redshift 推出带有集成数据湖查询引擎的基于 aws graviton 的 rg 实例](../ch11-179-amazon-redshift-推出带有集成数据湖查询引擎的基于-aws-graviton-的-rg-实例)
- [aws 一周综述：amazon bedrock agentcore 付款、适用于 aws 的 agent 工具套件等（2](../ch11-045-aws-一周综述-amazon-bedrock-agentcore-付款-适用于-aws-的-agent-工具套件等-2)
- [building blocks for foundation model training and inference](../ch11-117-building-blocks-for-foundation-model-training-and-inference)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/现已推出由新的-aws-graviton5-处理器提供支持的-amazon-ec2-m9g-和-m9gd-实例.md)

---

