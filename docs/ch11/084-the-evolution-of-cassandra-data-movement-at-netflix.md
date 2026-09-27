# The Evolution of Cassandra Data Movement at Netflix

> 📊 Level ⭐⭐⭐ | 9.1KB

→ [原文存档](https://netflixtechblog.com/the-evolution-of-cassandra-data-movement-at-netflix-6e13329c80a1?source=rss----2615bd06b42e---4)

## The Evolution of Cassandra Data Movement at Netflix

By Guil Pires, Jennifer Prince, Jose Camacho, Ken Kurzweil, Phanindra Chunduru

### Background

In a previous post, we introduced Data Bridge, a unified management plane for batch Data Movement at Netflix. Historically, several bespoke Data Movement connectors were developed across different engineering organizations to fulfill their specific requirements. Over the last few years, the Data Movement team has started centralizing these offerings through an abstraction that provides a catalog of connectors, along with simple UI and APIs to initiate Data Movement jobs.

One such case is the Cassandra to Iceberg connector. Apache Cassandra powers mission critical applications at Netflix, including Member, Billing, Recommendations, Subscriptions and many more. These use cases heavily leverage Data Movement to Apache Iceberg for many analytics and operational tasks, and central to this movement was a connector for Cassandra to Iceberg built in-house named Casspactor. As many Cassandra based Data Abstractions emerged, such as Key Value, Time Series and Graph — the need for larger and more complex Data Movement with transformations became more critical to the business.

Data movements are fundamentally fulfilled by leveraging the existing Cassandra backup infrastructure. Regularly scheduled backups are performed directly on the Apache Cassandra nodes, via a sidecar process managing the upload of all necessary SSTables and associated Metadata files directly into Amazon S3. When a Data Movement job is initiated, the job constructs the specific backup structure it needs by referencing the S3 based metadata, allowing it to precisely locate the SSTable files. The engine then downloads these files, performs the required mutation compaction and processing, and finally writes the fully transformed, compacted data directly into the target Apache Iceberg tables.

Image 1: Cassandra Cluster Backups to S3

### Casspactor: The Engine We Outgrew

Casspactor processed roughly 1,200 data movements per day, transferring approximately 3 PB of data from Apache Cassandra into Apache Iceberg tables. It served some of the most critical workloads at Netflix. For years, it worked. Then, two compounding challenges made it clear we needed a fundamentally different architecture.

### Fragile Met

---
## 深度分析

### 单一事实来源：让存储层自己回答元数据问题

Casspactor 最深的病灶不是性能，而是它对"备份是否存在、是否完整"这个问题的回答方式：拼装多个独立系统的状态。每个系统有自己的失败模式、更新节奏与准确性保证，复合视图必然与现实漂移——元数据不同步导致静默读到过期数据，区域级快照时钟对齐要求让单节点更换就能瘫痪整个 region 的数据搬迁。解法藏在原地：备份文件本身就存在于 S3，直接从备份元数据读取，把整条脆弱依赖链替换为一个权威事实来源。这类"答案早已在数据所在之处"的修复模式，比引入新的协调服务更值得复用。

### 从单体 connector 到分层 engine 的架构分水岭

Casspactor 的另一个结构性限制是它被建成"一个 connector"而非"一个 engine"：Key Value、Time Series、[Graph 抽象](https://github.com/QianJinGuo/wiki-public/blob/main/entities/high-throughput-graph-abstraction-at-netflix.md)全都汇入同一条管道，被迫继承它的全部约束——大分区 OOM、无数据模型感知、中间 Iceberg 表层层叠加、无法 time travel。新栈的分层设计（S3 读取层 → 标准 Spark DataFrames → Connector Factory）把"读"与"变换"解耦：核心引擎的每次改进自动惠及所有 connector，而各数据抽象只需在自己的数据模型上专注变换。这印证了一个通用规律：当 N 个上游共享同一管道时，单体设计会使每个上游的最坏情况变成所有人的常态。

### Like-for-Like：把跨团队迁移折叠成平台内部细节

迁移策略的核心不是技术，而是契约管理。通过保持用户侧接口（Data Bridge 参数）、输出契约（schema/元数据）与最终数据产物三者完全不变，迁移从"协调数十个下游团队的分布式高风险工程"退化为"平台团队的内部实现细节"——下游零代码变更、零验证负担。这个思路的隐含代价是平台侧必须独自承担全部验证成本，但它换来的是迁移速度与组织政治成本的同步下降，是 Platform Engineering "在平台层抽象复杂性"哲学的具体兑现。

### 影子验证：把信任变成可度量的差集

新旧系统并行的 shadow 模式本质上把"新系统是否可信"转化为一个集合论问题：证明 C = M，即持续检测 C−M（漏数据）与 M−C（幻影数据）两个差集，目标基数恒为零。更有价值的是它暴露的"unknown unknowns"——TTL 参考时间戳、Consistency Level、备份选择逻辑等新旧系统行为差异并非新系统的 bug，而是语义契约中从未被显式写下的部分。配合调查日志（investigation log）对问题分类归档，使一次修复能批量推广到其他 shadow 管道，并与利益相关方用数据沟通"信心水平"以决定迁移节奏。这与 [The Data Canary](https://github.com/QianJinGuo/wiki-public/blob/main/entities/the-data-canary-how-netflix-validates-catalog-metadata.md) 的元数据校验思路同属"以持续验证累积信任"的范式。

### Decider Pattern：用控制平面为迁移买保险

Maestro 工作流中的 Decider 步骤 + Connector Controller 注册表，把"用哪个 connector"变成一个可即时翻转的配置项：升级、回滚、按迁移批次（cohort）灰度，全部零下游改动。关键的安全网是条件回退——Move Data 失败立即执行 Casspactor 步骤，用户的代价最多是稍长的运行时间，而永远不会看到迁移失败或陈旧数据。这实际上是把分布式系统的 fallback 思想应用到组织级迁移：新系统的早期缺陷被架构吸收，而不是转嫁给用户。该模式随后被推广到 fleetwide connector rollout 的 canary 机制，说明它是可复用的发布基础设施而非一次性技巧。

## 实践启示

- **优先消除复合真相**：当系统需要从多个服务拼装"世界状态"才能工作时，先检查答案是否已存在于数据本身的存储层——直接读取 source of truth 通常比新建协调服务更便宜、更可靠。
- **engine 与 connector 分层再扩展**：为多种数据模型构建导出能力时，先把读取层标准化为通用接口（如 Spark DataFrames），再让每种模型写自己的变换 connector；避免让第一个 connector 的限制成为所有人的天花板。
- **用 Like-for-Like 契约冻结降低迁移风险**：迁移关键管道时保持用户接口、输出 schema、数据产物逐字节一致，把多团队协调问题降维成平台内部实现细节。
- **shadow 差集验证是迁移的信任货币**：新旧系统并行运行，持续对比行级差集并追求 100% 相似度；把发现的语义差异记入调查日志并分类复用修复，用它度量"何时可以切流"。
- **给迁移装上可翻转的开关与回退路径**：通过 Decider/控制平面模式让新旧实现可按批次即时切换，并保证新实现失败时自动回退旧实现，使下游用户在任何失败场景下都无感。
- **中间表是隐性成本放大器**：多级中间 Iceberg 表会随抽象层叠加而复合膨胀；让引擎直接产出标准 DataFrame 可同时消灭存储成本与后处理故障面——Netflix 因此节省了百万美元量级。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

