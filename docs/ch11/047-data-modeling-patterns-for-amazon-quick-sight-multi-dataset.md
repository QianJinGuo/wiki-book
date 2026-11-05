# Data modeling patterns for Amazon Quick Sight multi-dataset relationships

> 📊 Level ⭐⭐⭐ | 12.7KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/data-modeling-patterns-for-amazon-quick-sight-multi-dataset-relationships)

## Data modeling patterns for Amazon Quick Sight multi-dataset relationships

In Part 1 of this series, we introduced Amazon Quick Sight Multi-Dataset Relationships and covered the foundational concepts of dimensional modeling, best practices for designing clean data models, and a decision framework for when to use runtime joins versus pre-joined datasets. If you haven’t read Part 1 yet, we recommend starting there.

In this post, we shift from concepts to patterns. For each schema, you’ll find a table structure, use cases, implementation steps, and sample SQL queries. We also cover workarounds for advanced scenarios that require extra modeling steps, and close with a summary of current limitations.

Note: All Multi-Dataset relationships in the current release use inner join. Only rows with matching keys in both datasets appear in query results. Design your data model accordingly.

## Supported patterns

The following seven scenarios are natively supported by Quick Sight Multi-Dataset Relationships. Each scenario maps to a common data modeling pattern, with concrete implementation guidance and sample SQL.

### Scenario 1: Simple star schema

The most common and recommended pattern. A central fact dataset is related to multiple dimension datasets.

[](<https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/06/29/21287-1-1.png>)

**Table** | **Type** | **Cardinality** | **Key Columns** | **Attributes/Measures**
---|---|---|---|---  
**SALES_FACT** | Fact | High: Millions to billions of rows | sale_id (PK) customer_id (FK) product_id (FK) time_id (FK) store_id (FK) | quantity revenue cost
**CUSTOMER_DIM** | Dimension | Medium: Thousands to millions of rows | customer_id (PK) | name, email, city, state, country, segment
**PRODUCT_DIM** | Dimension | Low: Hundreds to thousands of rows | product_id (PK) | product_name, category, brand, unit_price
**TIME_DIM** | Dimension | Low | time_id (PK) | date, month, quarter, year, day_of_week
**STORE_DIM** | Dimension | Low to Medium | store_id (PK) | store_name, region, manager, sqft
  
#### Use cases

  * Total sales by customer segment and region.
  * Monthly revenue trend by product category.
  * Top 10 stores by average order value.

#### Implementation

  * Create separate datasets for each fact and dimension table.
  * Define relationships via matching keys:

    
    
    SALES_FACT.CUSTOMER_ID → CUSTOMER_DIM.CUSTOMER_ID

    SALES_FACT.PRODUCT_ID → PRODUCT_DIM.PRODUCT_ID

    SALES_FACT.TIME_ID → TIME_DIM.TIME_ID

    SALES_FACT.STORE_ID → STORE_DIM.STORE_ID

  * All joins are single-hop (fact to dimension), with no chaining required.
  * Denormalized dimensions support fast GROUP BY operations without extra joins.

#### Sample queries

Total sales by customer segment and region:

    
    
    SELECT c.segment, c.region,

        SUM

---

## 深度分析

### 关系的语义比 schema 的形状更决定正确性

这篇续作表面是七种 schema 的花名册，内核只说了一件事：在运行时连接的模型里，**关系定义本身就是查询语义的一部分**，画得像星型并不等于算得对。原文开篇那句"当前版本全部使用 inner join"是整个模型的地基——它把"关系"从可选的导航提示，变成了强制的行过滤器：任何一侧没有匹配键的记录在进入聚合前就已消失，且不会有任何报错。

由此看，七种场景可重新归类：星型、雪花、星系解决"表怎么摆"；角色扮演维度与多粒度事实解决"同一张表被引用多次时，每次代表哪个业务问题"；刷新节奏与行级安全已跳出建模，讲的是拆成多数据集换来的运维与权限收益。评审时若只对着图判断"这是星型，合格"，会漏掉真正出错处：多跳路径、维度多重角色、跨事实桥接是否同粒度。前篇 多维建模基础 是决策框架，本文则是它的模式目录。

雪花那段的取舍值得单独记住：原文不教条地推荐规范化，而是给出可执行阈值——除非维度超过百万行、存储收益足以抵消多一跳连接，否则把链压平成单一维度数据集。这是全文少见的、让"范式正确"服从"查询代价"的表态。

### 一对多扇出：聚合被静默放大的机制

分析型建模最常见的事故不是 join 写错，而是 join 写对了结果仍然错。当一条事实行在"多"侧匹配到多条记录，该行的度量值会在结果集里被复制多份，SUM 随之翻倍，而 COUNT DISTINCT 看起来正常——两个指标互相矛盾时，人往往先怀疑数据源，而不是怀疑基数。inner join 对此毫无防御能力：它只保证键匹配，不保证匹配唯一。

原文的两处结构性对策，本质都是在基数层面做手术。星系模型强调 conformed dimension 必须在两张事实表上保持完全相同的粒度与键——桥接维度一旦粒度不一致，跨事实比较就退化成隐式扇出。多粒度事实场景则让引擎先把细粒度事实聚合到粗粒度再连接（日销售汇总到月，再与月度预测对齐），把扇出风险从"建模者的自觉"转移给"引擎的语义"，这正是运行时连接相对手写 SQL 的真实价值。

务实地说，扇出只能被检测，不能被祈祷——下节"实践启示"第 2 条给出可直接落地的探针。

### 宽表与关系层：一次显式的成本转移

"要不要打平"反复出现却始终没有统一答案，因为它是成本在两类人之间的转移，而非绝对优劣。打平成宽表，把连接与聚合前移到 ETL：查询快、语义简单，但口径调整要重跑管道，同一指标在多张宽表里各写一遍。保留关系层，把代价后移到查询时：定义只写一次、维度可独立刷新，代价是运行时开销、12 个数据集上限、以及整个 Topic 必须统一查询模式的硬约束。

真正改变天平的是刷新节奏。事实表需小时级更新、维度按周变更时，宽表被迫以最快节奏整体重跑，而多数据集允许各自调度、分别监控 SPICE 容量。换言之，关系层买到的主要不是"少写 SQL"，而是**变更频率的解耦**；若所有表同频且模型数月不动，宽表的简单性仍是更便宜的选择。

值得留意的是，循环连接、递归层级、参差层级、并行层级四类都被归入"需要绕行"：断环并冗余一列、把层级压平成显式层列、给缺失层级补父值、把并行层级拆成独立维度。这些不是优雅手法，而是 DAG 与"无自连接"约束下的工程妥协；共同代价是模型里出现为工具而非为业务存在的列，必须在字段注释中标注，否则会被下一位维护者当成业务事实。

### 治理后果：权限先于连接，定义只写一次

行级安全是全文治理含义最重的一节。规则在各数据集上独立定义，并在连接**之前**生效，用户看到的是各表可见行的交集。原文称之为"更严格的模型"，这话没错，但同一机制也意味着：被 RLS 过滤掉的维度行，会让原本可匹配的事实行在 inner join 中一并消失，指标下降却无人报错。安全边界与分析完整性在这里是同一开关的两面。

另一层收益是口径收敛。conformed dimension 一旦成为跨事实的桥，就不再是某张报表的私有资产，而是组织级契约：改它的粒度会同时波及销售、退货、预测三条链路。这既是好处（只定义一次）也是风险（爆炸半径变大），维度 schema 变更应走与代码同级的评审。可对照 [Lyft 的指标语义层治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md) 与 跨数据集统一语义层。

最后，"当前限制"应被当作架构边界而非待办清单：inner join only、无外连接、无自连接、DAG 约束、12 数据集上限。凡需要"保留未匹配记录"的问题（全量客户含零购买、全量 SKU 含零销量），在这套模型里没有正确答案，只能回到数据集层预先构造驱动表；提前分流，比事后反复试错省得多。

## 实践启示

1. **先定粒度，再画关系。** 为每张数据集写明"一行代表什么"（一行一个订单行 / 一行一个 SKU / 一行一个门店月），并写入数据集描述。粒度说不清的表，无论图上位置多合理都不该进入 Topic。

2. **把基数验证做成发布门禁。** 每条关系跑一次连接前后行数比对（事实行数、连接后行数、主键去重数），任何不等都要有书面解释；每个度量同时暴露 SUM 与 COUNT DISTINCT 主键，让扇出在监控里可见。

3. **用变更频率决定宽表还是关系层。** 各表节奏差异大（事实小时级、维度周级）就走多数据集关系层换取解耦；全表同频且模型稳定就打平成宽表换取简单。不要在同一 Topic 里混用两种思路。

4. **把 conformed dimension 当公共 API 管理。** 共享维度的键与粒度变更等同破坏性变更：走评审、公告影响面（销售/退货/预测等全部下游），并保留可回滚的版本化路径。

5. **为"保留未匹配记录"的需求单独开路。** 由于只有 inner join，全量客户/全量 SKU 类分析无法在 Topic 内完成；在需求受理阶段就识别，改由数据集层构造驱动表或用宽表兜底。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

