# Data modeling patterns for Amazon Quick Sight multi-dataset relationships

## Ch11.252 Data modeling patterns for Amazon Quick Sight multi-dataset relationships

> 📊 Level ⭐⭐ | 3.5KB | `entities/data-modeling-patterns-for-amazon-quick-sight-multi-dataset-.md`

# Data modeling patterns for Amazon Quick Sight multi-dataset relationships

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/data-modeling-patterns-for-amazon-quick-sight-multi-dataset-.md)

# Data modeling patterns for Amazon Quick Sight multi-dataset relationships

In Part 1 of this series, we introduced Amazon Quick Sight Multi-Dataset Relationships and covered the foundational concepts of dimensional modeling, best practices for designing clean data models, and a decision framework for when to use runtime joins versus pre-joined datasets. If you haven’t read [Part 1 yet, we recommend starting there](<https://aws.amazon.com/blogs/machine-learning/data-modeling-best-practices-for-amazon-quick-sight-multi-dataset-relationships/>).

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

