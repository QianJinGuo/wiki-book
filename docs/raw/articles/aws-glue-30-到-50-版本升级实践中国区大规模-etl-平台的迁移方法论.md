---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-glue-3-0-version-practice-etl-platform-migration
ingested: 2026-07-09
feed_name: AWS China Blog
source_published: 2026-07-07
sha256: "febc6c18f1ea4d7435c6ed5de4bcaeeaf51e96cf015dbe4a6fd965e9c66558cc"
---

# AWS Glue 3.0 到 5.0 版本升级实践：中国区大规模 ETL 平台的迁移方法论

摘要：本文分享了在 AWS 中国区将近70个 AWS Glue ETL 作业从 3.0 版本升级至 5.0 版本的完整实践经验。文章涵盖升级范围评估、中国区特有的依赖管理策略、分批部署方法论、真实性能对比数据以及典型问题的排查与解决。升级后整体 DPU 消耗降低约30%，部分作业性能提升超过60%。  
  
**目录**

01 一、引言

02 二、升级范围评估

03 三、中国区环境适配

04 四、分批部署

05 五、性能对比

06 六、问题与解决方案

07 七、架构优化

08 八、总结

* * *

## **一、引言**

某大型零售企业在 AWS 中国区运行着一套基于 [AWS Glue](<https://aws.amazon.com/cn/glue/>) 构建的数据处理平台，承载了会员分析、渠道销售、门店运营及商品绩效等多个业务域的 ETL 工作负载。该平台日常运行约70个 Glue 作业，月度 DPU 消耗近4000 DPU-Hours，涵盖从轻量级数据同步到重型多表关联聚合等多种处理场景。

推动本次升级的核心动因有三个方面。其一，AWS Glue 5.0 提供了更新的 Spark 运行时和更多新特性，部分新能力仅在 Glue 5.0 上提供，因此客户开始评估升级至更新版本。其二，AWS Glue 5.0 基于 Apache Spark 3.5 构建，引入了自适应查询执行的深度优化、Shuffle 机制的改进以及 Catalyst 优化器的增强，根据 AWS 在 Spark 3.5 和 Glue 5.0 发布时披露的基准测试，部分分析型工作负载可获得性能提升。其三，客户提出了年度云资源成本优化目标，ETL 平台作为计算资源消耗的主要来源之一，降本增效成为技术团队的优先事项。

综合以上因素，我们制定了分阶段、低风险的升级方案，并在为期三周的实施窗口内完成了全量作业的版本迁移。

## **二、升级范围评估**

在正式实施前，我们对全部作业进行了系统化的分类评估，依据输出格式、依赖复杂度和业务重要性三个维度建立了升级决策矩阵。

直接升级： 约60至70个作业，输出格式为 Parquet 或 CSV，不依赖第三方 Connector，Spark SQL 语法与 Glue 5.0 具备较高兼容。此类作业构成平台的绝大多数工作负载，是本次升级的主体。

暂缓升级： 约8个作业，输出格式为 Apache Hudi，使用 Hudi 0.12.x 版本。Hudi 0.12.x 尚未官方支持 Spark 3.5，直接升级存在兼容性风险，因此相关作业继续保留在 Glue 3.0 环境中运行

架构重构： 1组高 DPU 消耗的作业群，因其存在全量扫描的设计缺陷，无论在哪个 Glue 版本上运行均面临资源效率问题。我们决定将其从版本升级范围中分离，通过架构层面的重新设计（从全量处理迁移至增量处理）从根本上解决性能瓶颈。

我们遵循的核心原则是风险隔离：将确定性高、影响面可控的变更批量实施，同时将不确定性高的变更隔离处理，避免一次性升级带来的系统性风险。

## **三、中国区环境适配**

### 2.1 Python 依赖离线化

AWS Glue 作业在执行时需要加载 Python 第三方库。在全球区，Glue Worker 可通过 –additional-python-modules 参数直接从 PyPI 安装依赖。然而在中国区，由于 Glue Worker 的网络环境限制，直接访问 PyPI 或海外镜像源存在连通性不稳定的问题。

我们采用的方案是将所有 Python 依赖预编译为 .whl 格式文件，上传至 S3 存储桶，通过 –additional-python-modules 参数引用这些离线依赖，避免运行时访问外部 PyPI。对于编译环境，我们使用与 Glue 5.0 运行环境一致的基础镜像进行一致性构建，确保二进制兼容性。此外，在本地开发与 CI/CD 构建环节，我们配置了国内镜像源作为 pip 的备选下载通道。

### 2.2 JAR 依赖隔离

Glue 5.0 内置的 Spark 3.5 运行时包含了大量更新的依赖库（如 Jackson、Guava、Netty 等），与用户自定义 JAR 包中的同名库可能产生版本冲突。我们通过设置 –user-jars-first 参数调整类加载优先级，并逐个验证第三方 Connector 的兼容性，避免因依赖版本差异导致运行时异常。

### 2.3 VPC 端点验证

所有 Glue 作业均运行在客户 VPC 内的私有子网中，通过 VPC Endpoint 访问 AWS 服务。升级前我们逐一验证了以下端点的连通性与策略配置：

  * S3 Gateway Endpoint： 确认路由表关联正确，Bucket Policy 允许从 VPC Endpoint 发起的请求
  * Glue Interface VPC Endpoint： 确认安全组入站规则允许 HTTPS 443 端口访问
  * CloudWatch Logs Interface Endpoint： 确认日志组的 Resource Policy 配置正确



以上工作虽然不直接涉及代码变更，但对于中国区环境而言属于必要的前置条件。

## **四、分批部署**

我们从简单到复杂、从低风险到高风险渐进推进。首批选择逻辑最简单、数据量最小的作业，验证基础兼容性，中间批次覆盖中等复杂度的多表 JOIN 作业，后续批次处理高 DPU 消耗的重型作业，最后一批为低频执行的长尾作业。

批次 | 作业数 | 类型特征 | 关键事项  
---|---|---|---  
第一批 | 约10个 | 轻量级 ETL，单表转换 | 基础兼容性验证，确认运行时环境正常  
第二批 | 约12个 | 中等复杂度，多表 JOIN | 验证 AQE 对 JOIN 策略的影响  
第三批 | 约15个 | 高 DPU 日报作业 | 发现磁盘空间不足问题，引入 S3 Shuffle  
第四批 | 约14个 | 会员积分类作业 | 个别轻量作业出现性能回退，评估后接受  
第五批 | 约12个 | 商品与门店类作业 | 运行稳定，未发现新问题  
第六批 | 约6个 | 低频执行的月度/季度作业 | 收尾确认，全量回归验证  
  
升级前将所有 Glue 3.0 作业的完整配置（包括 Job Parameters、Connection、Security Configuration 等）导出为 JSON 格式并存储至版本控制系统。回滚操作可通过一条命令在数分钟内完成。

## **五、性能对比**

作业类型 | 升级前 DPU | 升级后 DPU | 耗时变化 | 优化幅度  
---|---|---|---|---  
渠道销售报表 | ~4 | ~1.3 | 14分→5分 | 超过60%  
门店销售月报 | ~8.5 | ~4 | 11分→6分 | 约52%  
渠道销售周报 | ~1.1 | ~0.7 | 8分→6分 | 约35%  
会员权益日增量 | ~0.6 | ~0.4 | 5.5分→3.5分 | 约33%  
会员销售分析 | ~15 | ~10 | 19分→14分 | 约32%  
全渠道业绩日报 | ~31 | ~23 | 63分→48分 | 约26%  
渠道综合日报 | ~8 | ~6 | 25分→20分 | 约23%  
重点门店日报 | ~5.2 | ~4.4 | 16分→14分 | 约15%  
积分流水日报 | ~5 | ~5.5 | 16分→18分 | 回退约10%  
商品主数据同步 | <0.1 | <0.1 | 1.5分→1.8分 | 回退约10%  
  
*以上对比在相同 Worker 配置下完成，未通过增加计算资源获得加速。

JOIN 密集型作业获益最大（50%-70%提升）： 这类作业涉及大量多表关联操作，Spark 3.5 的 AQE 能够在运行时根据实际数据统计信息动态调整 JOIN 策略，显著减少 Shuffle 数据量和计算开销。

中等复杂度作业稳定提升（25%-40%）： 涉及中等规模数据聚合和过滤操作的作业，主要受益于 Spark 3.5 谓词下推增强和分区裁剪改进，DPU 消耗降幅在四分之一到三分之一之间。

轻量级作业存在小幅回退（5%-10%）： 运行时间低于2分钟、处理数据量极小的作业出现了轻微的性能下降。这主要是因为 Spark 3.5 运行时的初始化开销（包括 AQE 的统计信息收集、更复杂的执行计划生成等）在短作业中占比相对较高。由于这类作业的绝对 DPU 消耗极低（单次运行不足0.5 DPU-Hours），我们评估后决定接受此回退，不做额外优化处理。

整体统计： 约85%的作业在升级后获得了不同程度的性能提升，加权平均 DPU 节省约30%，每月可节省超过千余 DPU-Hours。

## **六、问题与解决方案**

### 5.1 磁盘空间不足（DISK_NO_SPACE_ERROR）

问题描述：第三批次中一个重型聚合作业在升级至 Glue 5.0 后运行失败，错误日志显示 DISK_NO_SPACE_ERROR，失败发生在 Shuffle Write 阶段。该作业在 Glue 3.0 环境下正常运行，执行时间约70分钟。

根因分析： Spark 3.5 的 AQE 在运行时重新评估了 JOIN 策略。在 Spark 3.1中，该作业的特定 JOIN 操作被优化器选择为 Broadcast Hash Join（将小表广播至各 Executor），中间数据量可控。升级至 Spark 3.5 后，由于 AQE 和 Cost-Based Optimization 的改进，运行时重新选择了 Join Strategy，由 Broadcast Hash Join 调整为Sort-Merge Join，导致 Shuffle 数据量显著增加。

解决方案： 我们采取了两项并行措施：

  1. 降低并发磁盘写入压力： 将 spark.executor.cores 从默认值4降低至2，减少每个 Executor 同时执行的 Shuffle Write 任务数，避免瞬时磁盘写入峰值过高。
  2. 启用 S3 Shuffle： 配置 spark.shuffle.glue.s3ShuffleBucket 参数指向预置的 S3 存储桶，将 Shuffle 中间数据存储从本地存储扩展至[Amazon S3](<https://aws.amazon.com/cn/s3/>)。Amazon S3 提供高扩展性的对象存储能力，能够有效缓解本地磁盘容量限制



### 5.2 Stage 执行失败

问题描述： 部分中高复杂度作业在升级后出现 “Job aborted due to stage failure” 错误，伴随 “Task failed, maximum number of retry reached” 的日志信息。

根因分析： 该现象非必现，具有一定的随机性。部分作业本身存在数据倾斜问题，Spark 3.5 中 AQE 对 Partition 的重新规划，使热点 Partition 的资源消耗进一步放大，最终触发 Executor OOM。当 Task 因 OOM 失败且重试次数耗尽后，整个 Stage 被标记为失败。

解决方案： 针对此类作业，我们同时启用了 S3 Shuffle ，缓解了本地磁盘压力，同时通过增加 Worker 数量，降低单个 Executor 的数据处理负载，两项调整后相关作业运行恢复稳定。S3 Shuffle 主要用于缓解本地磁盘瓶颈，对于 Shuffle 数据量较小的作业，未必能够带来性能收益。

### 5.3 性能回退场景

问题描述： 约15%的作业在升级后出现了5%至10%的 DPU 小幅增加，主要体现为执行时间延长20至30秒。

特征分析： 出现回退的作业呈现出共同特征——运行时间短、处理数据量小、逻辑简。

原因解释： Spark 3.5 运行时在作业启动阶段的初始化工作相较 Spark 3.1 有所增加，包括 AQE 相关的统计信息采集框架初始化、更复杂的执行计划编译过程等。对于长时间运行的作业而言，这些固定开销在总耗时中占比可忽略不计；但对于原本只需1-2分钟即可完成的轻量作业，额外的20-30秒初始化时间便体现为可观测的性能下降。

处理决策： 经过成本影响评估，这类作业单次运行的 DPU 增量不足0.05，月度累计影响不超过10 DPU-Hours（约占总消耗的0.25%）。相对于升级带来的整体约30%收益，此回退在可接受范围内，我们决定不做针对性优化。

## **七、架构优化**

在本次升级中，除版本迁移外，我们还对平台中 DPU 消耗最高的一组作业实施了架构层面的重构。该作业群在本次 Glue 版本升级中不在升级范围（因 Hudi 兼容性问题保持 Glue 3.0），但我们对其实施了独立的架构重构——将底层存储从 Parquet 全量覆盖模式迁移为 Apache Hudi UPSERT 增量模式，通过改变写入语义降低了资源消耗。

某个核心作业负责其中某个业务域的数据去重与合并处理。原始设计采用“全量扫描 + NOT EXISTS”的去重逻辑：每日执行时需扫描最近6个月的全部历史数据，通过 SQL NOT EXISTS 子查询判断当日增量数据中是否存在重复记录。此外，每周还需执行一次全量重建以修正可能的数据不一致。

此设计在数据量较小的早期阶段可运行，但随着业务增长，6个月的历史数据量持续膨胀，导致每日作业的 DPU 消耗持续攀升。在升级前，此作业群的周度 DPU 消耗约为300至350 DPU-Hours，占平台总消耗的相当比例。

我们将该作业群迁移至基于 Apache Hudi 的增量处理架构。核心变更如下：

  * 去重机制变更： 从 SQL NOT EXISTS 全表扫描改为基于 Hudi Record Key 的 UPSERT 操作。在当前使用的 Hudi 索引配置下，写入时能够完成 Record Key 的去重判断。
  * 处理范围缩减： 每日作业仅处理当日增量数据（T-1），不再扫描6个月历史。
  * 全量重建取消： Hudi 的 UPSERT和事务机制降低了全量重建的必要性，在客户当前业务场景下能够满足数据一致性要求。



重构完成后，该作业群的月度 DPU 消耗下降约40%。每日作业的执行时间从原先的超过60分钟缩短至15分钟以内，客户当前已不再需要定期执行周度全量重建。

## **八、总结**

本次升级在为期三周的实施窗口内完成了约70个 AWS Glue 作业从 3.0 到 5.0 版本的迁移，加权平均 DPU 节省约30%，作业回滚率低于3%。在版本升级的基础上，针对最高消耗的作业家族实施的架构重构（Hudi 增量处理迁移）额外贡献了约40%的 DPU 节省。两项措施叠加后，平台整体月度 DPU 消耗下降约35%至40%。

此次升级让我们发现了一个重要的优化优先级原则：架构层面的设计优化在绝对收益上可能超过运行时版本升级。在制定优化策略时，应优先识别并重构存在设计缺陷的高消耗工作负载，再通过版本升级获取面上的普惠收益。实践表明，运行时升级能够带来普适性的性能收益，而架构层面的优化往往决定成本优化的上限。二者结合，可以在控制迁移风险的同时，最大化释放数据平台的性能与成本价值。

后续规划， Apache Iceberg 作为新一代开放表格式，在 Glue 5.0 环境下的集成方案也在我们的技术评估计划中。对于在本次没有做版本升级的某个核心作业群， 未来计划结合 [AWS S3](<https://aws.amazon.com/cn/s3/>) Tables 的引入，统一完成表格式升级与 Glue 运行时升级，进一步降低运维复杂度并提升开放表格式能力。

**下一步行动：**

**相关产品：**

  * [Amazon Glue](<https://aws.amazon.com/cn/glue/?p=bl_pr_glue_l=1>) — 简单、可扩展的无服务器数据集成
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=3>) — 隔离云网络
  * [Amazon Connect](<https://aws.amazon.com/cn/connect/?p=bl_pr_connect_l=4>) — AI 客户体验解决方案
  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5>) — 可观测性工具



**相关文章：**

  * [AWS Direct Connect 故障演练实战指南](<https://aws.amazon.com/cn/blogs/china/aws-direct-connect-fault-guide/?p=bl_ar_l=1>)
  * [基于Amazon中国区EKS使用Code家族和 Argo CD 构建GitOps CICD流程](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-eks-using-code-argo-cd-build-gitops-cicd/?p=bl_ar_l=2>)
  * [利用AWS Firewall Manager统一部署Network Firewall (二) 集中式架构](<https://aws.amazon.com/cn/blogs/china/leveraging-aws-firewall-manager-deploy-network-firewall-architecture/?p=bl_ar_l=3>)
  * [跨架构EC2实例升级指南：基于ENI迁移的Xen到Nitro升级方案](<https://aws.amazon.com/cn/blogs/china/ec2-cross-architecture-upgrade-guide-xen-to-nitro-migration-based-on-eni/?p=bl_ar_l=4>)
  * [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-network-fault/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 谢燕敏

亚马逊云科技解决方案架构师，负责零售客户架构咨询和设计，同时致力于亚马逊云科技在国内和全球企业客户的应用和推广。拥有多年分布式应用开发和云平台运维开发经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
