# Netflix Metadata Service and Model Lifecycle Graph

## Ch11.034 Netflix Metadata Service and Model Lifecycle Graph

> 📊 Level ⭐⭐ | 14.5KB | `entities/netflix-metadata-service-model-lifecycle-graph.md`

# Netflix Metadata Service and Model Lifecycle Graph

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/democratizing-machine-learning-at-netflix-building-the-model.md)

> **Core insight**: Netflix 的 Metadata Service (MDS) 通过 AIP URI 统一寻址、Kafka 事件摄取、enrichment workers 和 Datomic+Elasticsearch 双存储，构建跨域 Model Lifecycle Graph，使"该模型被哪些 A/B 测试使用"这类跨系统查询从不可能变为单次 GraphQL 查询。

## 问题：碎片化的 ML 景观

随着 Netflix ML 从单一 personalization 扩展到 Studio、Ads、Payments 等多个业务域，各域使用不同 tech stack、metrics 和组织结构。ML 工具存在于 silos 中：model registry 不知道哪些 A/B 测试在使用它，pipeline orchestrator 不知道下游模型依赖，practitioners 必须跨多个系统才能回答基本问题。

在没有 discovery infrastructure 的情况下，ML 从业者无法跨业务垂直领域协作或共享工作。内容 embedding 就是一个典型例子：Studio 团队构建的 embedding 本可同时服务于 Ads 的上下文匹配和 Personalization 的节目推荐，但跨域复用极其困难。

MDS 试图回答三个核心问题：**Discovery**（存在哪些特征和数据源？）、**Lineage**（哪个 pipeline 在为特定模型生成数据？）、**Impact**（哪个 A/B 测试在跑这个模型？如果我改这个特征哪些模型会坏？）。

## 核心抽象：AIP URI 词汇体系

MDS 使用统一资源标识符格式 `aip://<componentType>/<platformId>/<resourceId>` 确保全局唯一，例如 `aip://model/registry/ranking-v5`。这种 URI 方案允许任何服务用单一字符串引用任何 ML 资产，MDS 可将其解析回丰富的关联元数据。

系统核心抽象包括：**Component**（可唯一寻址的对象）、**Entity**（具有额外属性的 Component，如 name、description、creation date、owners）、**Entity Type**（共享数据形状的实体组）、**Domain**（相关 entity types 的功能分组，定义抽象接口）、**Provider**（Domain 的具体实现，绑定到特定源系统）。

这种设计的关键价值在于 Provider 与 Domain 的分离：如果引入新的 model registry，只需添加新的 provider，无需改变 domain 接口。MDS 目前支持多个 Provider 同时接入。

## 技术架构：从事件到图谱

**事件摄取**：MDS 通过 Kafka 和 AWS SNS/SQS 与各源系统集成，摄取 thin events（只包含 identifier 和 event type）。源系统只需宣布"发生了变更"，无需构建完整 payload 或理解下游需求。

**实体富化 (Entity Enrichment)**：当事件到达时，MDS 调用源系统 API 获取完整当前状态，然后转换为标准化 entity。这个设计的关键属性是**事件顺序无关**——MDS 始终从 source of truth 获取最新事实，即使事件总线丢弃或乱序投递，下一个事件都会纠正状态。

**数据转换与规范化**：原始事件异构且每个源系统有自己的 schema。MDS 将其转换为统一 entity model，平台特定 ID 变为全局 AIP URI，owner emails 变为带 resolved user URI 的 owners，labels 变为 tags。Foreign keys 如 pipeline_run_id 被转换为 entity references。

**存储：Datomic + Elasticsearch 双存储**：规范化 entity 首先写入 Datomic（作为系统 of record 和图数据库），然后立即索引到 Elasticsearch（支持快速全文本搜索）。Datomic 的不可变事实模型使持续添加关系而不丢失原始 entity state 成为可能。

Elasticsearch 索引所有 entity types 到统一索引（通过 entityType 字段区分），包含精确名称匹配加权提升、模糊匹配处理拼写错误等功能，支持多字段文本搜索和复杂过滤。

## 图谱构建示例：连接模型到 A/B 测试

当 MDS 处理新的 model instance 时，background enrichment jobs 通过多跳推理发现关系。例如从模型实例出发，通过 pipeline_run_id 发现关联的 A/B test cell，再查询实验平台获取完整测试上下文，最后将推导出的关系写回 Datomic 并触发重索引。

Enrichment job 推导出完整链条：Model Instance 由 Pipeline Run 产生 → Pipeline Run 为 A/B Test Cell #2 执行 → A/B Test Cell #2 属于 A/B Test "Ranking Model v5 vs v4" → Model Instance 现在与该 A/B Test 关联。MDS 不仅存储被告知的内容，还通过**后台图遍历**推导新知识。

在没有 MDS 的情况下，回答"哪个 A/B 测试在使用此模型？"需要：1) 在 Model Registry 查找模型 → 2) 找到产生它的 pipeline → 3) 在 Pipeline Orchestrator 检查 A/B test tags → 4) 查询实验平台。有了 Model Lifecycle Graph，这变成单次 GraphQL 查询。

## AIP Portal：探索而非仅搜索

Model Lifecycle Graph 通过 AIP Portal 向 practitioners 展示，这是一个统一界面，提供全文本搜索（由 Elasticsearch 支持）、详细 entity 页面（显示关键元数据和关系面板）以及关系导航（点击跳转至相关 entity，无需离开 portal）。

典型交互流程：用户输入模型/特征/数据集/团队名称到单一搜索框 → 到达显示关键元数据和关系面板的 entity 页面 → 通过点击相关 entity（上游数据集、下游实验、兄弟模型版本）导航图谱。

这种图探索能回答此前不可能的问题：Lineage 查询（从训练数据到生产实验的完整谱系）、Impact 分析（修改此特征会影响哪些模型）、使用发现（哪些 A/B 测试在使用此模型）、依赖映射（我的 pipeline 传递依赖哪些数据源）。

## 关键数据/实践启示

- **AIP URI 统一寻址**是跨系统元数据连接的基础——任何服务可用单一字符串引用任何 ML 资产
- **Notification of change pattern**（变更通知模式）比传递完整状态更灵活——源系统只需发出 thin event，MDS 负责从 source of truth 获取完整状态，保证最终一致性
- **Datomic + Elasticsearch 双存储**分别解决图遍历查询和全文本发现两类需求，不可变 fact model 支持渐进式 enrichment
- **异步 enrichment** 使 MDS 能处理图谱构建的计算成本，而不阻塞实时事件摄取
- **多跳推理**可将隐式关系转化为显式边——这是从"被动目录"向"主动推荐引擎"演进的关键

## 深度分析

1. **图谱是碎片化 ML 工具链的必然解**
   随着 Netflix ML 从单一 personalization 扩展到 Studio、Ads、Payments 等多域，各域 tech stack、metrics 和组织结构各异。ML 工具存在于 silos 中：model registry 不知道哪些 A/B 测试在使用它，pipeline orchestrator 不知道下游模型依赖，practitioners 必须跨多个系统才能回答基本问题。Model Lifecycle Graph 通过统一元数据层将孤岛连成可探索图谱，本质上是**反碎片化（anti-silo）基础设施**。

2. **AIP URI 是跨系统寻址的抽象基座**
   `aip://<componentType>/<platformId>/<resourceId>` 格式将异构平台 ID 统一为全局唯一字符串。任何服务可用单一 URI 引用任何 ML 资产，MDS 可将其解析回丰富元数据。这层抽象使 Datomic 能以统一方式存储和关联不同源系统的实体，是图谱查询的技术前提。

3. **Thin event + enrichment 模式将状态同步责任反转**
   传统方案要求源系统构建完整 payload 并理解下游需求；MDS 的 notification of change pattern 让源系统只需宣布"发生了变更"，由 MDS 从 source of truth 获取最新状态。关键属性是**事件顺序无关**——即使事件乱序或丢失，下一事件都会纠正状态。Trade-off 是 enrichment 时对源系统的读负载。

4. **Datomic + Elasticsearch 双存储分离两类查询模式**
   图遍历查询（从模型→特征→数据源的复杂多跳）和全文本发现（跨所有 entity type 的自由搜索）需要不同的存储引擎。Datomic 不可变 fact model 支持渐进式添加关系不丢原始状态；Elasticsearch 统一索引所有 entity type 提供模糊匹配和相关性提升。两者同步写入保证数据一致性。

5. **异步多跳推理将隐式关系转化为显式图边**
   源系统是 purpose-built，不知道其他域的实体。Enrichment jobs 通过多跳推理发现跨系统关系（如模型实例→pipeline_run→A/B test cell→A/B test 的完整链条），并将推导出的边写回 Datomic。这是 MDS 从"被动目录"向"主动推荐引擎"演进的关键机制 。

## 实践启示

1. **用 thin event 模式降低源系统集成复杂度**
   源系统只需发出 `{event_type, instance_id}` 的极简事件，无需构建完整 payload 或理解下游需求。MDS 通过 enrichment contract 从 source of truth 获取完整状态，保证最终一致性。新增源系统时 producer 端实现极简，是系统可扩展的关键。

2. **AIP URI 抽象使平台迁移和双写成为可能**
   当需要从旧 model registry 迁移到新平台时，只需添加新的 Provider 而非修改 Domain 接口。URI 层将平台特定细节屏蔽，consumer 无需感知底层源系统变化。这是 MDS 支持多 Provider 同时接入的技术基础。

3. **Provider-Domain 分离设计支撑工具扩展**
   随着新 ML 工具不断涌现 ，只需按 Domain 接口实现新 Provider 即可接入图谱，无需改变现有 domain 定义。这种插件架构防止系统随工具增殖而碎片化。

4. **Datomic 不可变 fact model 支持关系渐进式富化**
   Enrichment jobs 发现新关系时直接添加 fact，无需更新原始 entity state。这使图谱可以随时间积累更多边而不丢失上下文，对调试和 impact 分析至关重要。跟踪 entity 的最后 enrichment 时间戳让用户判断数据 staleness。

5. **Elasticsearch 统一索引分离发现与图遍历计算**
   索引是同步、轻量的（写完即索引），而图遍历是异步、计算密集的。将发现入口与图引擎分离，使两者可独立扩缩容。Elasticsearch 单索引多 entity type 设计 + entityType 字段区分 + 相关性提升，是高可用发现体验的技术保障。

## 相关实体
- [Netflix Live Operations Human Infrastructure](/ch11-104-netflix-live-运营体系-toc-fleet-model-与-lcc-分层指挥架构//)
- [High Throughput Graph Abstraction At Netflix](/ch11-101-high-throughput-graph-abstraction-at-netflix-part-i//)
- [Netflix Switchboard Lightbulb Model Routing](/ch11-074-netflix-switchboard-lightbulb-百万请求-秒-ml-模型路由架构演进//)
- [High Throughput Graph Abstraction At Netflix Part I](/ch11-135-netflix-高吞吐图抽象层-pb-级图数据的统一-api-与实时遍历//)
- [Building Blocks For Foundation Model Training And Inference On Aws](/ch11-117-building-blocks-for-foundation-model-training-and-inference//)

- [Netflix Scaling Camera File Processing At Netflix](/ch11-018-scaling-camera-file-processing-at-netflix//)
- [Netflix Cassandra Wide Partition Dynamic Splitting](/ch11-025-dynamically-splitting-wide-partitions-in-cassandra-for-time//)
## 相关引用

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/democratizing-machine-learning-at-netflix-building-the-model.md)

---

