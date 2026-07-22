---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/now-available-amazon-ec2-m9g-and-m9gd-instances-powered-by-new-aws-graviton5-processors
ingested: 2026-06-15
sha256: "8f2c1796ec8fd8c3b574371b304b35f9e97b760de85fed836990acc50b1df9ac"
feed_name: AWS China Blog
source_published: 2026-06-10
---

# 现已推出：由新的 AWS Graviton5 处理器提供支持的 Amazon EC2 M9g 和 M9gd 实例

AWS Graviton 处理器在各代产品中持续改进，每次迭代都会提高计算性能、性价比和能效。在 re:Invent 2025 上，我们[发布](<https://aws.amazon.com/about-aws/whats-new/2025/12/ec2-m9g-instances-graviton5-processors-preview/>)了首款支持 Graviton5 的实例 Amazon EC2 M9g 的预览版。从那时起，客户在各种工作负载上测试了 M9g 并分享了结果。与 M8g 相比，[ClickHouse](<https://clickhouse.com/>) 的性能提高了 36％，代码更改为零。在为期 6 个月的生产可观测性工作负载的 A/B 测试中，与 Graviton4 相比，[Honeycomb](<https://www.honeycomb.io/>) 的每核吞吐量提高了 36%。 [HubSpot](<https://www.hubspot.com/>) 为 MySQL 数据库部署了 M9g，查询持续时间缩短了多达 60％。如今，M9g 实例已正式推出，新的 M9gd 实例可供需要高速、低延迟本地 NVMe SSD 存储的客户使用。两者均由 [Graviton5](<https://aws.amazon.com/ec2/graviton/>) 提供支持，Graviton5 是 AWS 有史以来最强大、最节能的处理器。

[](<https://d2908q01vomqb2.cloudfront.net/da4b9237bacccdf19c0760cab7aec4a8359010b0/2026/06/10/1213311671976503-0-G5_Angled.jpg>)

尽管业内已经推出了许多基于 Arm 的实例，但没有一个能与 AWS Graviton 足迹的广度和深度相提并论。经过五代定制硅芯片和八年的持续投资，Graviton 为超过 350 种实例类型提供支持，为从初创企业到大型企业的超过 12 万名客户提供服务，拥有强大的独立软件供应商合作伙伴生态系统，覆盖广泛的托管服务。您可以将 Graviton 用于各种工作负载，包括 Web 应用程序、微服务、分析、数据库、机器学习（ML）推理、电子设计自动化（EDA）、游戏和视频编码。随着工作负载的计算密集程度越来越高，而且更加依赖数据驱动，许多用户要求更高的处理能力，以及更大的网络和存储带宽，进而移动更多数据并更快完成工作负载。我们还设计了这些实例，旨在高效地打包计算、内存和 I/O，进而最大限度地提高能源利用率。

随着人工智能从回答问题转向采取行动、运行代码、使用工具、评估结果和编排多步骤任务，对 CPU 计算的需求正在迅速增长。Graviton5 是为这种转变而构建的。Graviton5 拥有 192 个内核、大 5 倍的 L3 缓存、降低多达 33% 的内核间延迟以及 DDR5 内存提供高带宽，可帮助代理缩短等待 CPU 受限步骤、处理更多指令、处理大量并发环境以及保持加速器运行所需的时间。

[Meta](<https://www.aboutamazon.com/news/aws/meta-aws-graviton-ai-partnership>) 正在大规模部署 Graviton，最初有数千万个内核来支持其代理式人工智能工作，这使得 Meta 成为世界上最大的 Graviton 客户之一。代理式人工智能工作负载，包括实时推理、代码生成和多步骤任务编排，都是 CPU 密集型的，受益于 Graviton5 中更高的计算性能、更大的缓存、更高的内存带宽和内核密度。

**M9g 和 M9gd 的新增功能  
**M9g 实例在第六代 [AWS Nitro System](<https://aws.amazon.com/ec2/nitro/>) 的基础上构建，由 AWS Graviton5 处理器提供支持，与 Graviton4 处理器相比，该处理器可提供更高的计算性能、更大的缓存以及更高的内存和 I/O 可扩展性。与基于 Graviton4 的实例相比，Graviton5 的计算性能提高了 25％，Web 应用程序的性能提高了 35％，机器学习推理的性能提高了 35％，数据库的性能提高了 30％。作为 AWS 实例集中第一款支持最新一代 PCIe Gen6 和 DDR5-8800 内存的 CPU，AWS Graviton5 实例可提供云中所有处理器实例中最快的内存，L3 缓存是上一代的 5 倍。 这些改进还带来了更高的能源效率，可帮助您在不影响功能的情况下实现可持续发展目标。

联网和存储带宽已扩展，以便跟上计算增长的步伐。与不同实例大小的平均水平相比，M9g 和 M9gd 实例的网络带宽高出 15%，[Amazon Elastic Block Store（Amazon EBS）](<https://aws.amazon.com/ebs/?nc2=type_a>)带宽高出 20%，最大实例大小的网络带宽最高可达两倍。M9g 和 M9gd 实例还支持[实例带宽配置（IBC）](<https://docs.aws.amazon.com/ebs/latest/userguide/instance-bandwidth-configuration.html>)，该功能可帮助您将 Amazon EC2 实例的 Amazon EBS 和 [Amazon Virtual Private Cloud（Amazon VPC）](<https://aws.amazon.com/vpc/>)网络之间的带宽分配调整多达 25%。IBC 可以帮助优化具有特定带宽要求的工作负载的性能，例如数据库读写性能、查询处理和日志记录。这些增强功能支持更快的数据移动，提高依赖高 I/O 性能的工作负载的吞吐量。

安全和隔离是在云中运行工作负载的基本要求。在 Nitro System 中，AWS Nitro 虚拟机监控器旨在将实例彼此以及与 AWS 操作员隔离开来。借助 M9g 和 M9gd 实例，我们通过引入 Nitro Isolation Engine，进一步提高了安全标准。Nitro Isolation Engine 是对 Nitro System 的增强，强制隔离实例并利用形式验证来提供具有数学精度的隔离保证。Nitro Isolation Engine 是一个专门构建的组件，负责在虚拟机之间强制隔离，包括通过一组最少的 API，调解对虚拟机内存、CPU 寄存器状态和 I/O 设备的所有访问权限。Nitro Isolation Engine 利用形式验证，这种技术可以用数学方式证明硬件或软件的行为符合预期，而不仅仅是在特定的测试用例中。这种密集的验证技术使 Nitro 成为第一个经过正式验证的云虚拟机监控程序，开创了经数学验证的云安全性的新标准。

M9g 实例为每四 GiB 内存提供一个 vCPU，非常适合各种通用工作负载，包括应用程序服务器、微服务、中型数据存储、游戏服务器、缓存实例集、容器化应用程序、大规模 Java 应用程序、代码存储库、Web 应用程序和代理式人工智能。

对于需要高速、低延迟本地存储的工作负载，与基于 Graviton4 的 M8gd 实例相比，M9gd 实例提供高达 11.4 TB 的 NVMe SSD 存储，IOPS 和存储性能提高了 30%。M9gd 实例非常适合需要平衡计算和内存以及高速、低延迟本地存储的通用工作负载，包括应用程序服务器、微服务、游戏服务器、中型键值数据存储、缓存实例集、数据日志记录、媒体处理、批处理和日志处理，以及需要缓存和暂存文件等临时存储的应用程序。

以下是该系列的关键规格：

**M9g** | **vCPU** | **内存（GiB）** | **网络带宽（Gbps）** | **EBS 带宽（Gbps）**  
---|---|---|---|---  
**中型** | 1 | 4 | 高达 15 | 高达 12  
**large** | 2 | 8 | 高达 15 | 高达 12  
**xlarge** | 4 | 16 | 高达 15 | 高达 12  
**2xlarge** | 8 | 32 | 高达 17 | 高达 12  
**4xlarge** | 16 | 64 | 高达 17 | 高达 12  
**8xlarge** | 32 | 128 | 17 | 12  
**12xlarge** | 48 | 192 | 25 | 18  
**16xlarge** | 64 | 256 | 34 | 24  
**24xlarge** | 96 | 384 | 50 | 36  
**48xlarge** | 192 | 768 | 100 | 72  
**metal-48xl** | 192 | 768 | 100 | 72  
  
M9gd 实例包括本地 NVMe SSD 存储。下表显示了每种大小的实例存储。计算、内存、网络和 EBS 带宽规格与 M9g 相同。

**M9gd** | **vCPU** | **内存（GiB）** | **实例存储（GB）** | **网络带宽（Gbps）** | **EBS 带宽（Gbps）**  
---|---|---|---|---|---  
**中型** | 1 | 4 | 1 x 59 NVMe SSD | 高达 15 | 高达 12  
**large** | 2 | 8 | 1 x 118 NVMe SSD | 高达 15 | 高达 12  
**xlarge** | 4 | 16 | 1 x 237 NVMe SSD | 高达 15 | 高达 12  
**2xlarge** | 8 | 32 | 1 x 475 NVMe SSD | 高达 17 | 高达 12  
**4xlarge** | 16 | 64 | 1 x 950 NVMe SSD | 高达 17 | 高达 12  
**8xlarge** | 32 | 128 | 1 x 1900 NVMe SSD | 17 | 12  
**12xlarge** | 48 | 192 | 3 x 950 NVMe SSD | 25 | 18  
**16xlarge** | 64 | 256 | 1 x 3800 NVMe SSD | 34 | 24  
**24xlarge** | 96 | 384 | 3 x 1900 NVMe SSD | 50 | 36  
**48xlarge** | 192 | 768 | 3 x 3800 NVMe SSD | 100 | 72  
**metal-48xl** | 192 | 768 | 3 x 3800 NVMe SSD | 100 | 72  
  
**现已推出  
**M9g 和 M9gd 实例已在美国东部（弗吉尼亚州北部）、美国东部（俄亥俄州）、美国西部（俄勒冈州）和欧洲地区（法兰克福）这几个区域推出。M9g 和 M9gd 实例可通过[节省计划](<https://aws.amazon.com/savingsplans/>)、按需实例、竞价型实例、专用实例或专属主机购买。有关更多信息，请访问 [Amazon EC2 定价](<https://aws.amazon.com/ec2/pricing/>)。

要开始使用 M9g 和 M9gd 实例，有多种资源可用。[AWS Graviton 入门指南](<https://github.com/aws/aws-graviton-getting-started>)是一份技术指南，涵盖如何在基于 Graviton 的实例上构建、运行和优化工作负载。[Graviton 节省控制面板](<https://docs.aws.amazon.com/guidance/latest/cloud-intelligence-dashboards/graviton-savings-dashboard.html>)可帮助您跟踪和衡量在基于 Graviton 的实例上运行工作负载所节省的成本。而且，[AWS Transform](<https://aws.amazon.com/blogs/compute/migrating-your-java-applications-to-aws-graviton-using-aws-transform-custom/>) 是一项由人工智能驱动的服务，可自动进行代码转换，用于将 Java 应用程序从 x86 迁移到基于 Graviton 的 Amazon EC2 实例，处理兼容性分析、自动重新编译、依赖项更新和验证。

要了解有关基于 Graviton 的实例的更多信息，请访问 [AWS Graviton 处理器](<https://aws.amazon.com/ec2/graviton/>)或[使用 AWS Graviton 提升计算水平](<https://aws.amazon.com/ec2/graviton/level-up-with-graviton/>)。

[– Esra](<https://www.linkedin.com/in/esrakayabali/>)
