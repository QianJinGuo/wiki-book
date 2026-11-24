# Build a unified semantic layer across datasets with multi-dataset Topics in Amazon Quick

> 📊 Level ⭐⭐⭐ | 9.3KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/build-a-unified-semantic-layer-across-datasets-with-multi-dataset-topics-in-amazon-quick)

## Build a unified semantic layer across datasets with multi-dataset Topics in Amazon Quick

Amazon Quick is an AI-powered unified intelligence service that connects structured data and unstructured enterprise content so teams can explore, analyze, and act from one place. Amazon Quick Sight, the business intelligence (BI) capability within Amazon Quick, delivers interactive dashboards, natural language querying, pixel-perfect reports, machine learning (ML)-driven insights, and embedded analytics. Topics in Quick function as the semantic layer that business users can use to ask questions in natural language and get answers directly from their data.

Until now, organizations modeled their semantic layers by creating enriched datasets and associating them one-to-one with topics. Also, when Quick Sight authors build analysis, one visual could be sourced from only one dataset. Quick Sight represents a dataset as a single flattened table. If a customer’s data source contains multiple tables, Quick Sight required customers to define the dataset by joining the source tables into a single table in Quick Sight data preparation. This one big denormalized table approach was initially designed to provide better performance by avoiding run-time joins. It worked well for straightforward datasets, which made up the majority of use cases during the early stages of Quick Sight. Today, we’re evolving this model. With **multi-dataset Topics (public preview)** , you can now add up to 12 datasets to a single topic and define relationships between them. The Quick chat agent automatically traverses those relationships when answering questions. The AI engine interprets user intent, identifies which datasets contain the relevant columns, constructs the appropriate SQL joins based on your defined relationships, and returns a unified answer. Your data stays normalized, your governance stays centralized, and your business users get richer answers without understanding the underlying schema. The same multi-dataset topic can be used for building the analysis or answering questions using the chat agent.

In this post, we walk through how multi-dataset Topics work, explain how the chat agent uses defined relationships to generate cross-dataset queries, and demonstrate an end-to-end implementation using a retail analytics scenario in Quick Sight.

## How multi-dataset Topics work

A Topic in Quick is the semantic layer between raw data and business users. It encapsulates the metadata, business rules, relationships, and context that the AI-powered natural language query (NLQ) engine uses to interpret natural language questions and translate them into precise analytical queries.

With multi-dataset Topics, this semantic layer now spans multiple datasets connected through explicitly defined relationships. The following diagram illustrates the end-to-end flow from data sources through to consumption.

_Figure 1: Multi-dataset Topics architecture flow

---
## 深度分析

### 从单一大宽表到关系图语义层：统一机制如何演进

传统模型下，语义层由「富化数据集」与 Topic 一对一构成：多表数据源必须在数据准备阶段预先联结成一张反范式大宽表，一个可视化也只能来自一个数据集。这一设计以避免运行时联结来换性能，适合早期简单场景，代价是数据冗余与口径分散。多数据集 Topics（公开预览）把模型反转：单个 Topic 最多挂载 12 个数据集，数据集之间用 JSON 声明联结键构成关系图，chat agent 回答问题时自动遍历——AI 引擎解析意图、定位相关列、按已定义关系构造 SQL 联结并返回统一答案，数据保持范式化、治理保持集中化，业务用户无需理解底层模式即可获得跨域答案。

本质上是把联结成本从入库时移回查询时，换取去重与治理单点化——与湖仓「存范式化、查时联结」的取舍同构。

### NLQ 落地管线：四步把自然语言变成跨数据集 SQL

跨数据集问题走一条确定性管线：意图解析（以列名、描述、同义词匹配用户词汇，定位度量与维度所在数据集）→ 关系遍历（沿联结键在关系图上找最短联结路径，把事实表接到所需维度表）→ SQL 生成（构造 JOIN、聚合与 GROUP BY）→ 结果呈现（返回可视化或表格，生成的 SQL 可被检查）。 落地要点：过程透明可验证；grounding 质量是元数据的函数——富化与指令越丰富，模糊问题的解释越准。

### 富化元数据即企业词汇表资产

富化的本质是把组织词汇教给引擎：`TXN_DT` 对问「购买日期」的分析师毫无意义，列描述、同义词、semantic types（City/Currency/Date）正是弥合鸿沟的机制，且投资在用户每个问题上复利回收——它让多数据集 Topics 准确而不只是能用。 富化还能不锁死在单一工具内：可从 AWS Glue Data Catalog 或 Databricks Unity Catalog 直接引入富化数据集，让语义元数据成为可迁移资产。这与 [Lyft 的指标语义层治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md) 是同一命题的两种实现：口径作为一等公民资产集中管理。

### Custom instructions：把口径写成机器可执行的治理规则

没有指令时引擎按字面解释：「今年」默认日历年，财年 4 月 1 日起的组织必须用指令覆盖默认。指令是持久化的业务规则——财年边界、「活跃客户」定义、退货率公式——写一次，对每个用户每个问题一致生效，指标口径从部落知识变成集中管理的治理资产。

### 数据建模约束：星型模式是 NLQ 时代的入场券

最佳实践仍是经典纪律：以一个或多个中心事实表联结共享维度表的星型模式，避免环形联结与多对多关系。 在 NLQ 场景下纪律有了新分量：引擎靠关系图遍历找联结路径，图越干净（hub-and-spoke 而非网状），路径越短越可预测，答案越可信——模式设计如今直接影响 NLQ 准确率而非仅查询性能。细节参见 多数据集建模最佳实践。

## 实践启示

1. **先富化词汇表，再上多数据集。** 把列描述、同义词、语义类型当产品级资产维护；富化质量直接决定 NLQ 准确率，跳过这一步的 Topic 只会「能用而不准」。
2. **建模沿用星型模式纪律。** 中心事实表 + 共享维度表，避免环形联结与多对多——引擎找的是图上最短联结路径，不是任意图路径。
3. **把口径写成 custom instructions，而非口头约定。** 财年起始、「活跃客户 = 90 天内有购买」、退货率公式写成持久规则，全组织每个问题被一致解释；参见 [多数据集 Topic 最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/multi-dataset-topic-best-practices-for-amazon-quick-chat.md)。
4. **治理在数据集层收敛，语义层不做第二套权限体系。** RLS/CLS 在数据集级强制执行并穿透 Topic 到达业务用户，发布只区分 Owner/Viewer——语义层是治理面的单点出口，而非新的权限孤岛。
5. **验收答案看生成的 SQL，不只看图表。** 用 Explanation 检查 JOIN 与 GROUP BY 是否用了正确数据集与关系，把可检验性纳入 BI 采纳流程——这是建立对 NLQ 信任、进而规模化 [企业 AI 采纳](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/enterprise-ai-adoption.md) 的关键一步。
6. **元数据做成可迁移资产。** 优先经 AWS Glue Data Catalog / Databricks Unity Catalog 引入富化数据集，避免语义投资锁死在单一 BI 供应商内。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

