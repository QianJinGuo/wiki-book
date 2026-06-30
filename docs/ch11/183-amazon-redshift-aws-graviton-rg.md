# Amazon Redshift 推出带有集成数据湖查询引擎的基于 AWS Graviton 的 RG 实例

## Ch11.183 Amazon Redshift 推出带有集成数据湖查询引擎的基于 AWS Graviton 的 RG 实例

> 📊 Level ⭐⭐ | 6.1KB | `entities/amazon-redshift-推出带有集成数据湖查询引擎的基于-aws-graviton-的-rg-实例.md`

## 核心要点
- AWS 技术实践
- Amazon Redshift 推出带有集成数据湖查询引擎的
## 相关实体
- [Build Multi Tenant Ai Agent On Eks Graviton Openclaw K8S Practice](ch04/310-ai.md)
- [How Amazon Finance Streamlines Regulatory Inquiries By Using](ch11/010-how-amazon-finance-streamlines-regulatory-inquiries-by-using.md)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](ch04/503-agent.md)
- [Introducing Claude Platform On Aws](ch01/404-introducing-claude-platform-on-aws-anthropic-s-native-platf.md)
- [Aws 一周综述Amazon Bedrock Agentcore 付款适用于 Aws 的 Agent 工具套件等2026 年 5 月 11 日](ch04/503-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/amazon-redshift-推出带有集成数据湖查询引擎的基于-aws-graviton-的-rg-实例.md)
- [aws graviton5 m9g/m9gd 实例 ga 公告](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-graviton5-m9g-m9gd-launch-2026.md)

## 深度分析
### 架构定位：Graviton 驱动的性价比跃升
RG 实例是 Amazon Redshift 首次在数据仓库产品线中大规模采用 AWS Graviton 定制处理器。这一选择的底层逻辑与 AWS 近年来推动 Graviton 替代 Intel/AMD 实例的战略一脉相承——Graviton 基于 ARM 指令集，在并行批处理和内存密集型负载上实现了显著能耗比优势。官方标称数据仓库工作负载速度最高可达 RA3 实例的 2.2 倍，同时每个 vCPU 价格降低 30%，这一数字在性价比敏感的 analytical 场景中具有实际采购意义。

### 集成数据湖查询引擎：Spectrum 的终点
此次发布的另一个核心亮点是集成的数据湖查询引擎。在 RG 之前，Redshift 查询 S3 数据湖需要通过 Amazon Redshift Spectrum——一个独立的外部查询层，存在每 TB 扫描 5 美元的成本且查询延迟较高。现在 Redshift 在集群节点上直接执行数据湖查询，与数据仓库工作负载共用同一计算层。这一架构整合带来几个直接效果：无需重建外部表或修改应用代码，查询语法完全兼容现有 Spectrum 语法，且每 TB 扫描费用归零。对于同时运行数据仓库表和 Iceberg/Parquet 数据湖资产的混合工作负载，这是一个从"双引擎"到"单引擎"的架构简化。性能层面，对 Iceberg 格式可达 RA3 的 2.4 倍，对 Parquet 格式可达 1.5 倍。

### 实例映射与迁移路径
官方提供了从 RA3 到 RG 的明确映射关系：
| 当前 RA3 实例 | 推荐的 RG 实例 | vCPU 变化 | 内存变化 |
|---|---|---|---|
| `ra3.xlplus` | `rg.xlarge` | — | — |
| `ra3.4xlarge` | `rg.4xlarge` | 12 → 16（1.33:1） | 96 GB → 128 GB（1.33:1） |
迁移路径支持两种模式：弹性调整大小（原地迁移，10-15 分钟停机）和快照恢复（从 RA3 快照创建 RG 集群）。这种设计降低了从既有 RA3 集群迁移的机会成本。

### 代理式 AI 工作负载的针对性优化
文章特别提及人工智能代理驱动的查询规模将远超人类典型用量，导致运营成本螺旋上升。RG 实例在 2026 年 3 月已将新查询速度提升最多 7 倍，结合本次发布的 Graviton 性价比优势，直接回应了这一痛点。近实时分析应用、BI 控制面板、ETL 管线、自主 AI 代理都被明确列为目标场景。

## 实践启示
### 对于已有 RA3 部署的用户
如果当前运行的是 `ra3.4xlarge` 及以上规格，迁移到同等映射的 RG 实例在性价比上有明确收益。建议使用 AWS 定价计算器估算具体节省金额，并验证查询性能基准。迁移过程中的兼容性风险较低，因为外部表和查询语法无需变更。

### 对于混合仓库+数据湖架构
原来依赖 Spectrum 进行 S3 数据湖查询的场景，应优先考虑迁移到 RG 以消除每 TB 5 美元的 Spectrum 扫描费用并降低延迟。Iceberg 格式支持是这个集成引擎的差异化优势，对已有 Iceberg 数据湖资产的团队尤其值得关注。

### 对于 AI 代理驱动的工作负载
在评估 AI 代理对 Redshift 的查询频率和成本影响时，RG 实例的性价比改善提供了一个更具成本效益的基础设施选项。结合 2026 年 3 月的 7 倍查询加速，整体代理式 AI 工作负载的持有成本有望显著下降。

### 区域就绪性
RG 实例已在全球广泛区域推出，涵盖亚太、北美、欧洲、中东和南美主要区域。中国区（北京和宁夏）尚未出现在首发列表中，有国内 AWS 需求的团队需关注后续区域扩展。

---

