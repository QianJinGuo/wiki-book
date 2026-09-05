---
title: Amazon Redshift 推出带有集成数据湖查询引擎的基于 AWS Graviton 的 RG 实例
sha256: c07ce7b8f3935027cf9dae4be4425e5385c4dcfc3bc390d9c4362f5941410257
type: raw-article
tags: [aws,redshift,graviton,data-lake,analytics]
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-redshift-introduces-aws-graviton-based-rg-instances-with-an-integrated-data-lake-query-engine/
url: https://aws.amazon.com/cn/blogs/china/amazon-redshift-introduces-aws-graviton-based-rg-instances-with-an-integrated-data-lake-query-engine/
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-16
---
# Amazon Redshift 推出带有集成数据湖查询引擎的基于 AWS Graviton 的 RG 实例
自 2013 年以来，[Amazon Redshift](<https://aws.amazon.com/redshift/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 以本地成本的一小部分提供云端数据仓库的全部功能。每一代架构，从密集计算到 [Amazon RA3 实例](<https://aws.amazon.com/blogs/aws/amazon-redshift-update-next-generation-compute-instances-and-managed-analytics-optimized-storage/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，从预置到 [Amazon Redshift Serverless](<https://aws.amazon.com/blogs/aws/amazon-redshift-serverless-now-generally-available-with-new-capabilities/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，都使每一次查询比上一代更便宜、更快、更高效。  
十多年来，随着数据量的增长和分析要求的变化，组织越来越多地利用数据仓库表来存储结构化、经常访问的数据，并利用数据湖来经济高效地存储各种数据集。将人工智能代理加入其中，代理查询数据仓库的规模将远远超过人类的典型用量，从而导致运营成本螺旋式上升。
Amazon Redshift 进一步强化了其核心优势，能够满足任何工作负载的需求，无论工作负载是由人类还是人工智能代理驱动的。例如，2026 年 3 月，Amazon Redshift 将[新查询速度提高了多达 7 倍](<https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-redshift-increases-performance-for-new-queries/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，从而提高了商业智能（BI）控制面板和 ETL 工作负载的性能。这显著缩短了低延迟 SQL 查询的响应时间，例如，用于近实时分析应用程序、BI 控制面板、ETL 管线和以目标为导向的自主人工智能代理的响应时间。
今天，我们宣布推出 [Amazon Redshift RG 实例](<https://aws.amazon.com/redshift/features/rg/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，这是一个由 [AWS Graviton](<https://aws.amazon.com/ec2/graviton/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) 提供支持的新实例系列。RG 实例提供更好的性能，运行数据仓库工作负载的速度最高可达 RA3 实例的 2.2 倍，而每个 vCPU 的价格则低 30%。借助这些实例的集成数据湖查询引擎，您可以通过单个引擎在数据仓库和数据湖中运行 SQL 分析，其性能最高可达适用于 [Apache Iceberg](<https://iceberg.apache.org/>) 的 RA3 的 2.4 倍，速度最高可达适用于 [Apache Parquet](<https://parquet.apache.org/>) 的 RA3 的 1.5 倍。 Redshift RG 实例集速度、成本效率和集成数据湖查询引擎于一身，非常适合处理当今分析和代理式人工智能工作负载的高查询量和低延迟要求。
您可以比较新的 RG 实例和当前 RA3 实例：
**当前 RA3 实例** | **推荐的 RG 实例** | **vCPU** | **内存（GB）** | **主要使用案例**  
---|---|---|---|---  
`ra3.xlplus` | `rg.xlarge` | 4 | 32 | 小型集群部门分析  
`ra3.4xlarge` | `rg.4xlarge` | 12 → 16（1.33:1） | 96 GB → 128 GB（1.33:1） | 标准生产工作负载，中等数据量  
这种方法降低了运行数据仓库和数据湖组合工作负载的客户的总分析成本，同时通过查询仓库表和 [Amazon Simple Storage Service（Amazon S3）](<https://aws.amazon.com/s3/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)数据湖的单一系统简化了操作。我们建议使用适用于您的特定工作负载模式的 [AWS 定价计算器](<https://calculator.aws/#/>)来估算节省的费用。
**_Amazon Redshift RG 实例入门_**  
您可以通过 [AWS 管理控制台](<https://console.aws.amazon.com/redshift/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)、[AWS 命令行界面（AWS CLI）](<https://aws.amazon.com/cli/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)或 AWS API 启动新集群或迁移现有集群。默认情况下，集成的数据湖查询引擎处于启用状态。
在 Amazon Redshift 控制台中，您可以在创建集群时选择新的 RG 实例。
您可以根据集群配置将上一代实例迁移到具有最佳路径的 RG 实例，进而估算成本、验证兼容性并自动执行。
  * **弹性调整大小** – 就地迁移，兼容配置的停机时间为 10-15 分钟
  * **快照和恢复** – 从 RA3 快照创建 RG 集群。这最适合想要在迁移期间更改配置的客户
您的外部表、架构和查询语法（包括现有的 Spectrum 查询）保持不变。无需重新创建外部表或修改应用程序代码。 要了解更多信息，请访问 [Redshift 管理指南](<https://docs.aws.amazon.com/redshift/latest/mgmt/managing-cluster-considerations.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。
Amazon Redshift 现在在集群节点上执行数据湖查询，与处理数据仓库工作负载的计算方式相同。因此，不再需要 [Amazon Redshift Spectrum](<https://docs.aws.amazon.com/redshift/latest/dg/c-using-spectrum.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。数据湖查询保留在您的 VPC 边界内，使用现有的 IAM 角色，每 TB 数据的扫描费用为零。这消除了之前在 Redshift 总成本中增加的 5 美元/TB Spectrum 扫描费用。
**_现已推出_**  
Amazon Redshift RG 实例现已在以下 AWS 区域推出：美国东部（弗吉尼亚州北部、俄亥俄州）、美国西部（北加利福尼亚、俄勒冈州）、亚太地区（香港、海得拉巴、雅加达、马来西亚、墨尔本、孟买、大阪、首尔、新加坡、悉尼、台湾、东京）、加拿大（中部）、欧洲地区（法兰克福、爱尔兰、米兰、伦敦、巴黎、西班牙、斯德哥尔摩）、中东（阿联酋）和南美洲（圣保罗）。有关区域可用性和未来路线图，请访问[按区域列出的 AWS 功能](<https://builder.aws.com/build/capabilities/explore?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。 对于 Redshift Provisioned，您可以选择按小时计费且无需承诺的按需型实例，也可以选择预留实例以节省成本。 要了解更多信息，请访问 [Amazon Redshift 定价页面](<https://aws.amazon.com/redshift/pricing/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)。
在 [Redshift 控制台](<https://console.aws.amazon.com/redshift/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)中试用 RG 实例，并将反馈发送至 [AWS re:POST for Amazon Redshift](<https://repost.aws/tags/TAByF7MpfSQUCX_lAeDTvODw/amazon-redshift?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>)，或者通过常用的 AWS Support 联系方式发送反馈。
— [Channy](<https://linkedin.com/in/channy>)