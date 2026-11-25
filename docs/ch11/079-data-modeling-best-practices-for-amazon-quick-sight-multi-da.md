# Data modeling best practices for Amazon Quick Sight multi-dataset relationships

> 📊 Level ⭐⭐⭐ | 9.2KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/data-modeling-best-practices-for-amazon-quick-sight-multi-dataset-relationships)

## Data modeling best practices for Amazon Quick Sight multi-dataset relationships

Business intelligence analysts routinely face the same challenge at the start of every analytics project: the data needed to answer a single business question lives across multiple tables. Sales transactions sit in one place, customer demographics and product attributes in another, while returns, forecasts, and operational metrics occupy still others.

Until now, combining these tables in Amazon Quick Sight required pre-joining everything into wide, denormalized datasets before any analysis could begin. That approach works. But it forces data-modeling decisions up front, duplicates measures across different grains, introduces maintenance overhead, and typically produces a different dataset for almost every reporting scenario.

**Today, we are excited to announceMulti-Dataset Relationships in Amazon Quick Sight**. This new capability lets you define logical relationships between Quick Sight datasets and perform runtime joins at query time. Instead of flattening tables ahead of time, you keep each table as its own Quick Sight dataset and declare how those datasets relate to one another inside a Quick Sight Topic. Quick Sight then assembles precisely the join it needs for visuals, calculated fields, filters, or natural-language Q&A.

This paradigm shift brings several key advantages:

  * **Less upfront data preparation —** Define relationships once. Quick Sight joins only the relevant tables at analysis time.
  * **Preserved native granularity —** Each dataset maintains its own level of detail, avoiding measure duplication across grains.
  * **Reuse across analyses —** A single Topic with defined relationships serves multiple analytical use cases without rebuilding datasets.
  * **Simplified governance —** Manage permissions, transformations, and business logic at the individual dataset level.
  * **Independent refresh schedules —** Ingest data per table at different cadences (hourly, daily, monthly) based on data volatility.
  * **Row-level security at runtime —** Row-level security (RLS) rules are enforced during runtime joins, so data-access policies apply consistently across datasets.

In this post, we cover data modeling concepts, supported patterns, and best practices for designing your multi-dataset data model in Quick Sight. For a deep dive into each schema pattern with SQL examples and advanced workarounds, see the second post in this series: Data Modeling Patterns for Amazon Quick Sight Multi-Dataset Relationships [link].

## Why a runtime, relationship-based model

The traditional single-dataset model has three recurring costs:

  * **Upfront preparation:** You must decide the join shape before you know every question, often pushing logic into custom SQL or database views.
  * **Measure duplication:** When you join

## 深度分析

### Pre-joining is a bet placed before the questions are known

The raw article frames the traditional single-dataset model through three recurring costs. Upfront preparation forces join-shape decisions before every question is known, often pushing logic into custom SQL or database views. Measure duplication arises when a fact table joins to a higher-grain dimension and "one"-side measures replicate across the "many" side, inflating sums unless carefully de-duplicated. Dataset sprawl follows because each analytical scenario tends to spawn its own purpose-built flat dataset, multiplying maintenance. The deeper point is an information problem: pre-joining encodes assumptions about query patterns into physical artifacts, and wrong assumptions are expensive to reverse. Runtime relationships invert the flow — the join shape is decided at query time by the actual visual, calculation, filter, or chat question, so the model absorbs new questions instead of being rebuilt for them.

### Two layers, two kinds of merging

The architecture draws a clean line between the physical layer inside a dataset — where tables are genuinely merged by joins, unions, SQL, and transforms into one flattened result, appropriate when they share a grain and always belong together — and the logical layer across datasets in a Topic, where each dataset behaves as one logical table that keeps its own grain and is combined only when a visual or question spans datasets. The Topic is the data-model container. This mirrors the layering of the unified multi-dataset semantic layer Build A Unified Semantic Layer Across Datasets With Multi Da and complements the dataset-intrinsic enrichment model: composition stays local, cross-dataset semantics live at the Topic level. A notable current-release constraint is that relationships use inner join semantics only — rows must match keys on both sides to appear — so outer-join needs still route to pre-joined datasets for now.

### Measure duplication is the cost teams rediscover the hard way

Among the three costs, measure duplication deserves special attention because it silently corrupts numbers rather than merely inconveniencing modelers. Joining a fact table to a coarser-grain dimension replicates dimension-side measures across every fact row, and SUM aggregates double-count unless the modeler de-duplicates deliberately. The article's rules are explicit: keep each dataset at its native level of detail; if a dimension is coarser, aggregate the fact to match rather than denormalizing downward; and in multi-fact models, confirm shared dimensions carry a single conformed grain across all facts, then test cross-fact calculations explicitly. Granularity discipline, not join syntax, is what keeps runtime assembly numerically correct.

### Metadata enrichment and the decision framework prevent over-adoption

Two further moves make the article unusually practical. First, metadata enrichment is framed as a first-class modeling practice — field descriptions, business synonyms, semantic types, and custom instructions — because the Topic powers natural-language Q&A, so retrieval accuracy is now a data-modeling outcome rather than an application concern. Second, the closing decision framework is honest about scope limits: simple analyses with fewer than five tables and a single fact table are better served by one pre-joined dataset; outer-join behavior is not yet supported; and runtime relationships earn their complexity in multi-analyst, multi-fact, natural-language-exploration, many-to-many, and role-playing-dimension scenarios. This turns the capability into a portfolio decision rather than a default migration. The conversational side of that trade-off is developed further in the multi-dataset Topic best practices for Quick chat [Multi Dataset Topic Best Practices For Amazon Quick Chat](https://github.com/QianJinGuo/wiki-public/blob/main/entities/multi-dataset-topic-best-practices-for-amazon-quick-chat.md).

## 实践启示

1. Default to star schema: a central fact dataset with dimension datasets radiating outward minimizes join complexity, maximizes performance, and composes cleanly with runtime relationships.
2. Keep one dataset equal to one business concept at its native grain — resisting the temptation to pull one more column from an unrelated table is what prevents measure duplication from creeping back in.
3. Treat clean join keys as a prerequisite, not an optimization: integer surrogate keys where possible, matching data types on both sides, no nulls in key columns (nulls never match in inner joins), and validated referential integrity.
4. Write metadata for the AI reader too — field descriptions, business synonyms like Revenue for Sales, and semantic types such as City or Currency directly determine natural-language Q&A accuracy.
5. Consult the decision table before adopting runtime relationships: pre-joined remains correct for simple single-fact analyses and outer-join needs; reach for multi-dataset models when analysts, fact tables, or chat questions multiply.
6. Plan for growth deliberately: start with one fact plus key dimensions, add datasets gradually, keep a diagram of datasets and relationships, and adopt naming conventions such as FACT_, DIM_, and BRIDGE_ prefixes.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

