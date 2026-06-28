## Ch14.018 基于 Amazon Kinesis Data Streams 实现 DynamoDB 历史数据清理与增量同步

> 📊 Level ⭐⭐ | 6.7KB | `entities/基于-amazon-kinesis-data-streams-实现-dynamodb-历史数据清理与增量同步.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/基于-amazon-kinesis-data-streams-实现-dynamodb-历史数据清理与增量同步.md)

## 标签
#aws #dynamodb #kinesis #data-engineering #incremental-sync
**原文**: 基于 Amazon Kinesis Data Streams 实现 Dynamodb 历史数据清理与增量同步(raw/articles/基于-amazon-kinesis-data-streams-实现-dynamodb-历史数据清理与增量同步.md)

## 深度分析
**DynamoDB Streams 24 小时窗口是数据迁移的核心瓶颈。** 文章指出了一个在 DynamoDB 数据迁移场景中被低估的限制：DynamoDB Streams 的数据保留期固定为 24 小时且不可修改。对于 TB 级大表的迁移，历史数据的导出、清洗、导入流程可能需要数天，远超 24 小时的窗口期。这意味着如果不做额外架构设计，增量数据（新写入的数据）在迁移期间会丢失。DynamoDB 本身的这个限制，使得传统的"导出全量数据 → 迁移 → 切换"三步走方案在大数据量场景下不可行。
**Kinesis Data Streams 将增量同步窗口从 24 小时扩展到最长 365 天。** 这是文章的核心创新点：引入 Kinesis Data Streams 作为 DynamoDB Streams 的缓冲层，将数据保留窗口从不可修改的 24 小时扩展到最长 365 天（Kinesis 的最大保留期）。工作流程变成：DynamoDB Streams → Kinesis Data Streams → Lambda 消费 → 写入新表或 S3 归档。Kinesis 作为缓冲层，解决了"迁移时间 > 24 小时"导致的增量数据丢失问题，使大数据量迁移真正可行。
**三层数据生命周期管理是方案的核心架构设计。** 文章描述的数据清理方案包含三个层次：① 近 30 天的活跃数据保留在 DynamoDB 在线表；② 超过 30 天的历史数据通过 Kinesis 实时同步到 S3 低成本归档存储；③ TTL 自动过期的机制在 DynamoDB 层持续清理过期数据。这个三层架构的关键洞察是：存储成本优化不能以牺牲合规数据保留为代价——TTL 自动删除不等于数据归档，S3 归档是合规数据的着陆点。
**Glue + S3 智能分层是成本优化的关键。** 文章方案使用 AWS Glue 配合 S3 智能分层存储归档数据。S3 智能分层能够自动将访问频率降低的数据从 Standard 层移至 Infrequent Access 层甚至 Glacier 层，而无需人工判断数据温度。这意味着归档数据不需要人工判断何时该迁移到冷存储，存储成本随访问模式自动优化，是 DynamoDB 历史数据归档的标准落地点。
**"迁移过程中不丢失任何增量写入"是方案的核心 SLA。** 字幕翻译业务的场景要求是：迁移期间新写入的数据必须完整同步到新表，不能有数据丢失。这个 SLA 驱动了整个架构选择：用 Kinesis 而非 DynamoDB Streams 直接消费，就是为了解决 24 小时窗口限制的问题。在任何涉及在线数据库的迁移项目中，"零数据丢失"应该是默认要求，而非可选项。

## 实践启示
1. **在大数据量 DynamoDB 迁移场景中，Kinesis 是 DynamoDB Streams 的必要缓冲层。** 如果你的表每天写入量很大、迁移窗口预计超过 24 小时，引入 Kinesis Data Streams 是必选项，而非可选项。DynamoDB Streams 本身的 24 小时不可修改限制，在 TB 级数据迁移场景下是致命的。提前规划 Kinesis 缓冲容量（Shard 数量决定吞吐量）是迁移方案设计的第一个技术决策点。
2. **TTL + Kinesis 同步 + S3 归档是 DynamoDB 历史数据清理的标准三件套。** TTL 负责 DynamoDB 层的自动过期（设置在 30 天前）；Kinesis 负责增量数据的实时同步（作为缓冲）；S3 智能分层负责归档存储（接收从 Kinesis 消费并写入的历史数据）。这三层缺一不可：没有 TTL，DynamoDB 存储成本持续增长；没有 Kinesis，增量数据在迁移窗口外会丢失；没有 S3 归档，过期数据被删除后无法合规追溯。
3. **数据迁移的 SLA 定义必须包含"迁移窗口增量数据不丢失"，而不是只关注迁移那一刻。** 大多数数据迁移失败不是因为"历史数据迁移不完整"，而是因为"迁移期间新写入的数据丢失或重复"。方案设计时，先定义清楚增量数据的处理策略，再考虑历史数据的导出方式。
4. **DynamoDB Streams 的 24 小时窗口是一个常被低估的架构约束。** 在设计基于 DynamoDB 的实时数据管道时，如果下游消费处理出现延迟（比如 Lambda 触发率下降、下游服务故障），超过 24 小时的延迟就会导致数据永久丢失。在构建高可用数据管道时，需要在架构层面引入缓冲机制（如 Kinesis），而不是依赖 DynamoDB Streams 的默认保留期。

## 相关实体
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01-555-1-sglang-radixark-ai.html)
- [Amazon Quick: Accelerating the path from enterprise data to AI-powered decisions](ch01-667-快来-和ai实战派一起ai-aigc峰会最新嘉宾阵容来了.html)

---
