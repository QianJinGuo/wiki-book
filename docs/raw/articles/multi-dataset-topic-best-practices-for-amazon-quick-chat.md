---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/multi-dataset-topic-best-practices-for-amazon-quick-chat
ingested: 2026-07-08
feed_name: AWS China ML
source_published: 2026-07-07
sha256: 997a7d8a18a4d6662639de3dfbe5138471d9a495fe62cbfe2296a895ecd9ff48
---

# Multi-dataset Topic best practices for Amazon Quick Chat

**Note** : The topics referenced throughout this document refer to the new Topics experience (not legacy Topics). For details on the differences, see [Build a unified semantic layer across datasets with multi-dataset Topics in Amazon Quick](<https://aws.amazon.com/blogs/machine-learning/build-a-unified-semantic-layer-across-datasets-with-multi-dataset-topics-in-amazon-quick/>).

Most real-world business questions span multiple tables. A retailer who wants to understand net revenue by product category must draw from a sales fact table, a returns fact table, and a product dimension. Each of these lives in a separate dataset. Until recently, bridging those datasets required a data engineer to pre-join them and deliver a single dataset to Amazon Quick Sight before any analyst could ask a question.

Amazon Quick Sight’s Multi-Dataset Topics change that equation by letting analytics teams bring multiple datasets into a single Topic in one of two ways. You can define explicit relationship keys (covered in the companion post, [Data modeling best practices for Amazon Quick Sight multi-dataset relationships](<https://aws.amazon.com/blogs/machine-learning/data-modeling-best-practices-for-amazon-quick-sight-multi-dataset-relationships/>) , or you can equip the generative AI engine with enough semantic context to write SQL itself. This post focuses on the second path: Chat-powered, AI-generated SQL.

When you configure a Topic for Chat, you do not need to define relationships in advance. Instead, you author a semantic layer that includes dataset-level custom instructions, topic-level instructions, field synonyms, and field descriptions. The AI uses that context to generate context-aware SQL at query time. This puts outer joins, unions, subqueries, self-joins, cross-grain comparisons, and conditional join logic all within reach, with no structural constraint on the relationship graph.

This post is for data architects, business intelligence (BI) engineers, and analytics engineers building or optimizing Quick Sight Topics for natural-language Chat-based exploration. You will come away with:

  * A clear understanding of how Chat-driven SQL generation differs from defined-relationship Topics.
  * A layered framework, the Semantic Guidance Stack, for structuring all the metadata that guides the AI.
  * Eight concrete best practices, each with examples, anti-patterns, and sample instructions.
  * Techniques for handling complex patterns: outer joins, many-to-many, recursive hierarchies, role-playing dimensions, and cross-grain comparisons.
  * A decision framework for choosing between defined relationships, semantic-only guidance, and hybrid approaches.
  * A complete end-to-end walkthrough using a retail analytics Topic with five datasets.



## How Chat differs from defined relationships

Before diving into best practices, it helps to understand the fundamental architectural distinction between Quick Sight’s two multi-dataset modes.

When you define explicit relationships in a Topic, Quick Sight builds a logical join graph and executes inner joins at query time. The graph must be a directed acyclic graph (DAG), supports up to 12 datasets, and produces deterministic results because every join path is pre-specified. This suits governed reporting scenarios where you need to enforce exactly how tables combine.

When a user asks a question through Chat, Quick Sight’s generative AI reads either the defined relationships or your Topic’s semantic layer (instructions, descriptions, and synonyms) and generates SQL to answer that question. The AI determines which datasets to query, which columns to use, what join type is appropriate, and how to aggregate the result. There is no pre-wired join graph. The AI operates on intent, not structure.

**Dimension** | **Defined Relationships** | **AI-Generated SQL**  
---|---|---  
**Join definition** | Explicit, pre-defined in Topic | Inferred by generative AI at query time  
**Join types supported** | Inner join only for dashboards | Inner, left, right, full outer, union, subquery  
**Relationship graph constraint** | Must be directed acyclic graph (DAG): no circular relationship | No structural constraint  
**Multi-fact handling** | Requires conformed dimension keys | AI bridges via instructions  
**Guidance mechanism** | Relationship keys + dataset metadata | Custom instructions + synonyms + descriptions  
**Flexibility** | Schema-bound | Intent-bound  
**Best for** | Governed dashboards, regulated environments | Exploratory analytics, ad-hoc questions, power users  
  
Defined relationships are guardrails: they prevent incorrect joins from ever being attempted. Semantic metadata is guidance: it steers the AI toward correct, contextually appropriate SQL. Both have value. The right choice depends on your scenario. See the Decision framework section later in this post.

Defined relationships and semantic guidance are not mutually exclusive. A hybrid Topic can define relationships for the core fact-to-dimension joins while relying on custom instruction for exploratory patterns that fall outside the pre-defined graph. The Decision framework section explores this further.

For the best practices of defined relationship, please refer to [Data modeling best practices for Amazon Quick Sight multi-dataset relationships](<https://aws.amazon.com/blogs/machine-learning/data-modeling-best-practices-for-amazon-quick-sight-multi-dataset-relationships/>) and [Data modeling patterns for Amazon Quick Sight multi-dataset relationships](<https://aws.amazon.com/blogs/machine-learning/data-modeling-patterns-for-amazon-quick-sight-multi-dataset-relationships/>)

## The semantic guidance stack

The AI engine that powers Quick Chat draws on seven layers of metadata when generating SQL, collectively forming the semantic guidance stack. Understanding each layer is the foundation for writing effective metadata.

**Layer** | **Source** | **Definition** | **Purpose** | **Example**  
---|---|---|---|---  
**1** | Dataset Output; Dataset | Dataset-Level Instructions | Define the grain, purpose, keys, and business rules of each individual dataset | “Each row in SALES_FACT represents one line item on one order.”  
**2** | Topic | Topic-Level Instructions | Define cross-dataset logic, disambiguation rules, and default join behaviors | “When the user says ‘sales’, use SALES_FACT, not RETURNS_FACT.”  
**3** | Dataset Output; Field | Synonyms | Map business vocabulary to technical field names | “Revenue”, “Top line”, “Income” → total_amount  
**4** | Dataset Output; Field | Field Descriptions | Explain column semantics, units, nullability, and valid ranges | “order_date: UTC date customer placed order, never null, format YYYY-MM-DD”  
**6** | Dataset Transform | Column Exclusions | Remove noise such as internal keys, ETL timestamps, and deprecated fields | Hide etl_load_timestamp, surrogate_key, is_deleted_flag  
**7** | Dataset Transform | Calculated Fields & Named Filters | Pre-build common business metrics and segment definitions the AI can reference directly | Field: “Net Revenue” = sales.amount – returns.refund_amount  
  
Each layer reduces the AI’s uncertainty about your data. The more precisely you populate each layer, the narrower the space of plausible SQL interpretations, and the more accurate the generated results. A sparsely described Topic with many datasets will produce unreliable results. This is not because the AI is incapable, but because the information it needs to make correct choices is absent.

## Best practice 1: Write dataset-level instructions as a data dictionary

Dataset-level custom instructions are the AI’s first point of contact with each table and set the context for every question that touches that dataset.

### What to include

  * **Table purpose and grain:** State plainly what the table represents and what one row means. This prevents the AI from double-counting or aggregating at the wrong level.
  * **Primary key:** Identify the column(s) that uniquely identify each row.
  * **Foreign key hints:** Tell the AI which column in this dataset matches which column in related datasets. Use natural-language phrasing: “This dataset joins to PRODUCT_DIM on product_id.”
  * **Business rules:** Express derived calculations in plain English. “Revenue equals quantity multiplied by unit_price minus discount_amount.” This reduces the chance the AI invents an incorrect formula.
  * **Known edge cases:** Flag nullable columns, sentinel values, or special codes. “order_status = ‘VOID’ records should be excluded from revenue calculations.”
  * **Aggregation rules:** Specify the correct aggregation function for each measure. “Always SUM revenue. Do not use AVERAGE or COUNT.”



### Good vs. bad instructions: examples

Consider the following contrast for a SALES_FACT dataset:

**Bad Instruction (too generic):**
    
    
    "This is the sales data table. It contains sales information."

**Good Instruction (precise and complete):**
    
    
    "SALES_FACT contains one row per order line item.
    Primary key: order_line_id (integer, never null).
    Grain: one line item = one product on one order.
    Key columns:
    - order_id: links to ORDER_HEADER_DIM.order_id
    - product_id: links to PRODUCT_DIM.product_id
    - customer_id: links to CUSTOMER_DIM.customer_id
    - order_date_key: links to DATE_DIM.date_key (integer, YYYYMMDD format)
    Revenue = quantity * unit_price - discount_amount. Always SUM revenue.
    Exclude rows where order_status = 'VOID' from all revenue calculations.
    The table is refreshed nightly at 02:00 UTC."

### Anti-patterns to avoid

  * **Overly generic instructions:** “This table has sales data.” gives the AI no actionable context.
  * **Overly prescriptive SQL fragments:** Embedding raw SQL snippets in instructions (for example, “always add WHERE is_deleted = 0”) can conflict with the AI’s query construction. Use business-language rules instead, and apply permanent filters at the dataset level in Quick Sight’s dataset transform editor.
  * **Contradictory rules:** If you state that revenue should be SUM at the dataset level and then define an AVERAGE aggregation at the field level, the AI will receive conflicting signals. Be consistent across all layers.



## Best practice 2: Write topic-level instructions for cross-dataset logic

Dataset-level instructions describe individual tables. Topic-level instructions tell the AI how tables relate to each other, which dataset takes precedence when terms are ambiguous, and how to handle cross-dataset computations. Together they give the AI a complete picture of your domain.

### What to include in topic-level instructions

  * **Conceptual relationships:** Describe how datasets connect even when you have not defined formal relationship keys. “SALES_FACT and RETURNS_FACT both link to CUSTOMER_DIM on customer_id and to PRODUCT_DIM on product_id.”
  * **Disambiguation rules:** When the same business term could map to multiple datasets or fields, tell the AI which one to prefer. “When the user asks about ‘sales’, use SALES_FACT. When the user asks about ‘returns’ or ‘refunds’, use RETURNS_FACT. For ‘net sales’, join both.”
  * **Default join behavior:** Specify the join direction that preserves intended semantics. “Prefer LEFT JOIN from fact tables to dimension tables so that facts without matching dimension records are not silently dropped.”
  * **Multi-fact resolution:** Explain how to combine multiple fact tables. “To compare actuals versus forecast, join DAILY_SALES to MONTHLY_FORECAST by rolling up DAILY_SALES to the month level first, then join on month_key and store_id.”
  * **Spanning business definitions:** “Net revenue = SALES_FACT.total_amount minus RETURNS_FACT.refund_amount. Always join on order_id to avoid double-counting.”
  * **Hierarchy navigation:** “Product hierarchy: PRODUCT_DIM.product_id → PRODUCT_DIM.subcategory_id → PRODUCT_DIM.category_id. Roll up in this order for drill-down analysis.”



### Example: Full topic-level instruction block (retail analytics)

The following example shows a production-ready topic-level instruction block for a retail analytics Topic containing five datasets:
    
    
    Topic: Retail Analytics
    Datasets in this Topic:
    - SALES_FACT: daily order line items (grain: one line item per order)
    - RETURNS_FACT: returned order line items (grain: one return per order line)
    - CUSTOMER_DIM: customer master (grain: one row per customer)
    - PRODUCT_DIM: product catalog (grain: one row per product SKU)
    - DATE_DIM: date attributes (grain: one row per calendar day)
    Disambiguation rules:
    - "sales", "revenue", "orders" -> SALES_FACT
    - "returns", "refunds", "credits" -> RETURNS_FACT
    - "net sales", "net revenue" -> join SALES_FACT LEFT JOIN RETURNS_FACT on order_line_id
    - "customer", "buyer", "shopper" -> CUSTOMER_DIM
    - "product", "item", "SKU", "category" -> PRODUCT_DIM
    Default join directions:
    - SALES_FACT LEFT JOIN CUSTOMER_DIM on customer_id
    - SALES_FACT LEFT JOIN PRODUCT_DIM on product_id
    - SALES_FACT LEFT JOIN DATE_DIM on order_date_key = date_key
    Cross-dataset definitions:
    - Net Revenue = SUM(SALES_FACT.total_amount) - SUM(RETURNS_FACT.refund_amount)
    - Return Rate = COUNT(RETURNS_FACT.order_line_id) / COUNT(SALES_FACT.order_line_id)
    Grain alignment note:
    - SALES_FACT and RETURNS_FACT are daily grain.
    - For monthly aggregations, GROUP BY DATE_DIM.year_month_key.
    Row-Level Security note:
    - Each dataset enforces its own RLS. Do not attempt to circumvent RLS filters.

### Anti-pattern: Contradicting dataset-level instructions

If your SALES_FACT dataset-level instruction says “revenue = quantity * unit_price – discount_amount” and your topic-level instruction says “net revenue = total_amount”, the AI will receive contradictory definitions. Always make sure dataset-level and topic-level instructions are consistent. Topic-level instructions should ADD cross-dataset context, not redefine single-dataset semantics.

## Best practice 3: Design synonyms for how users actually talk

Synonyms bridge the gap between how your users express questions and what your technical schema calls things. A business analyst says “revenue”, but your database column is `total_amount`. A marketing manager says “churn”, but your schema flags it as `customer_status = 'churned'`. Without synonyms, the AI must guess the mapping, and guesses produce inconsistent results.

### Synonym coverage strategy

Organize your synonyms into four vocabulary tiers:

  * **Executive language (KPI names):** The terms leadership uses in board decks. “Revenue”, “EBITDA”, “Market Share”, “NPS”.
  * **Analyst language (metric definitions):** The terms your BI team uses. “Gross Margin”, “AOV” (average order value), “CAC” (customer acquisition cost).
  * **Domain jargon:** Industry-specific terminology. For retail: “SKU”, “planogram”, “shrinkage”. For SaaS: “MRR”, “ARR”, “seats”.
  * **Abbreviations and acronyms:** “YTD”, “QTD”, “MTD”, “LTM”, “TTM”.



### Sample synonym mapping table

**User Expression** | **Technical Field / Filter** | **Notes**  
---|---|---  
Revenue, Sales, Income, Top Line | SALES_FACT.total_amount | Map all four terms to same column  
Churn, Attrition, Lost Customers | CUSTOMER_DIM.status = ‘churned’ | Synonym maps to filtered condition, not just column  
AOV, Average Order Value, Avg Basket | SUM(total_amount)/COUNT(DISTINCT order_id) | Document the formula in field description too  
Category, Department, Aisle | PRODUCT_DIM.category_name | Retail domain jargon mapping  
Store, Location, Branch, Shop | STORE_DIM.store_name | Multiple business terms for same concept  
YTD, Year to Date | DATE_DIM filter: year = current year AND date <= today | Time-intelligence synonym  
  
### Guidelines for synonym quantity

Aim for 3 to 7 synonyms per commonly queried column. Fewer than 3 leaves common vocabulary gaps. More than 10 risks introducing ambiguous terms that match too many fields. For internal or rarely queried technical fields, 0–1 synonyms is appropriate, or exclude the field entirely.

## Best practice 4: Enrich field descriptions and semantic types

Field descriptions give the AI a precise understanding of each column’s meaning, unit, constraints, and intended use. While synonyms handle vocabulary and instructions handle logic, descriptions handle data semantics: what the value actually represents.

### Writing effective field descriptions

Write descriptions for an AI consumer, not a human reader. The AI benefits from structured, unambiguous information rather than relying on context. Each description should include:

  * **Definition:** One precise sentence stating what the column contains.
  * **Unit or format:** USD, percentage (0–1 scale), YYYY-MM-DD, or integer.
  * **Nullability:** “Never null” vs. “Nullable; null indicates the customer has not placed an order.”
  * **Valid range or enumerated values:** “Values: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, VOID.”
  * **Aggregation behavior:** “SUM for totals; do not AVERAGE this field.”



### Field description examples

**Field** | **Effective Description**  
---|---  
**order_date** | The calendar date on which the customer placed the order. UTC timezone. Format: YYYY-MM-DD. Never null. Use this field for all time-series analysis. Link to DATE_DIM.date_value for calendar attributes.  
**unit_price** | The per-unit selling price of the product at time of order, in USD. Nullable before 2020 (legacy data). For revenue, multiply by quantity and subtract discount_amount. Do not SUM unit_price directly.  
**customer_segment** | Customer classification. Enumerated values: ‘ENTERPRISE’, ‘MID_MARKET’, ‘SMB’, ‘CONSUMER’. Never null. Use for segmentation filters. ‘ENTERPRISE’ represents accounts with > $1M annual spend.  
**return_reason_code** | Coded reason for product return from RETURNS_FACT. Values: ‘DEFECTIVE’, ‘WRONG_ITEM’, ‘CHANGED_MIND’, ‘LATE_DELIVERY’, ‘OTHER’. Nullable when return was processed before reason codes were introduced (pre-2019).  
  
## Best practice 5: Guide join behavior without defining relationships

Chat-driven Topics let you specify join semantics entirely through natural-language instructions. You need no formal relationship keys and no constraint on join types. Five techniques are available:

### Technique 1: Implicit join hints

State the join condition and join type as a plain-English rule in your dataset or topic-level instructions. The AI will follow this rule when generating SQL.
    
    
    -- Dataset instruction for ORDERS:
    "To answer questions about customer lifetime value,
    join ORDERS to CUSTOMERS on customer_id using a LEFT JOIN,
    so customers with zero orders still appear in the result."
    -- Generated SQL (approximate):
    SELECT c.customer_id, c.customer_name,
    COALESCE(SUM(o.total_amount), 0) AS lifetime_value
    FROM CUSTOMERS c
    LEFT JOIN ORDERS o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.customer_name

### Technique 2: Grain alignment instructions

When two fact tables operate at different granularities, instruct the AI to roll up before joining. This is the most common source of inflated measures in multi-dataset analytics.
    
    
    -- Topic instruction:
    "SALES_FACT is at daily grain (order_date). MONTHLY_FORECAST is at monthly grain
    (year_month). When comparing actuals to forecast, first aggregate SALES_FACT
    by year_month, then join to MONTHLY_FORECAST on year_month and store_id."
    -- Generated SQL (approximate):
    SELECT f.year_month, f.store_id,
    f.forecast_amount,
    COALESCE(a.actual_amount, 0) AS actual_amount,
    f.forecast_amount - COALESCE(a.actual_amount, 0) AS variance
    FROM MONTHLY_FORECAST f
    LEFT JOIN (
    SELECT DATE_TRUNC('month', order_date) AS year_month,
    store_id,
    SUM(total_amount) AS actual_amount
    FROM SALES_FACT
    GROUP BY 1, 2
    ) a ON f.year_month = a.year_month AND f.store_id = a.store_id

### Technique 3: Union instructions

When two tables share the same schema and represent the same entity type from different sources, instruct the AI to union them.
    
    
    -- Dataset instruction shared between ONLINE_ORDERS and IN_STORE_ORDERS:
    "ONLINE_ORDERS and IN_STORE_ORDERS have identical schemas.
    When the user asks about 'all orders', 'total orders', or 'combined sales',
    use UNION ALL of both tables before applying any filters or aggregations.
    Always include a channel_type column: 'ONLINE' for ONLINE_ORDERS,
    'IN_STORE' for IN_STORE_ORDERS."
    -- Generated SQL (approximate):
    SELECT channel_type, SUM(total_amount) AS revenue
    FROM (
    SELECT 'ONLINE' AS channel_type, total_amount FROM ONLINE_ORDERS
    UNION ALL
    SELECT 'IN_STORE' AS channel_type, total_amount FROM IN_STORE_ORDERS
    ) combined
    GROUP BY channel_type

### Technique 4: Subquery instructions

For negation-pattern questions, such as “show me customers who have never ordered” or “products with no sales this quarter,” instruct the AI to use NOT EXISTS or LEFT JOIN / IS NULL patterns.
    
    
    -- Topic instruction:
    "To find customers who have not placed an order, use a NOT EXISTS subquery
    against ORDERS, or equivalently a LEFT JOIN from CUSTOMERS to ORDERS
    filtered on ORDERS.order_id IS NULL."
    -- Generated SQL (approximate):
    SELECT c.customer_id, c.customer_name, c.customer_segment
    FROM CUSTOMERS c
    WHERE NOT EXISTS (
    SELECT 1 FROM ORDERS o WHERE o.customer_id = c.customer_id
    )

### Technique 5: Conditional join instructions

Some datasets are only relevant when the user asks about specific topics. Instruct the AI to include them conditionally.
    
    
    -- Topic instruction:
    "Include the PROMOTIONS dataset only when the user's question
    involves discounts, campaigns, promo codes, or promotional pricing.
    Join on order_id when PROMOTIONS is needed."

## Best practice 6: Handle complex patterns via semantic instructions

Chat-driven Topics unlock several analytical patterns that are unsupported or require complex workarounds with defined relationships. The following subsections show how to handle each pattern through semantic instructions alone.

### Outer joins: preserving unmatched records

Outer joins are the most commonly needed feature that defined-relationship Topics lack.
    
    
    -- Dataset instruction for PRODUCTS:
    "Always LEFT JOIN from PRODUCTS to SALES_FACT on product_id,
    so that products with zero sales still appear in the result set.
    Use COALESCE(SUM(total_amount), 0) to show 0 revenue for unsold products."
    -- Sample question: "Show me all products including those with no sales this month"
    -- Generated SQL:
    SELECT p.product_name, p.category_name,
    COALESCE(SUM(s.total_amount), 0) AS monthly_revenue
    FROM PRODUCT_DIM p
    LEFT JOIN SALES_FACT s
    ON p.product_id = s.product_id
    AND s.order_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND s.order_date < DATE_ADD('month', 1, DATE_TRUNC('month', CURRENT_DATE))
    GROUP BY p.product_name, p.category_name
    ORDER BY monthly_revenue DESC

### Many-to-many relationships: bridge tables

Classic many-to-many relationships (students︎courses, orders︎promotions, employees︎projects) require a bridge table, which the AI can navigate when instructed.
    
    
    -- Topic instruction:
    "STUDENTS and COURSES have a many-to-many relationship through the ENROLLMENTS
    bridge table. To answer questions about course enrollment:
    1. Start from ENROLLMENTS
    2. JOIN to STUDENTS on student_id
    3. JOIN to COURSES on course_id
    Never join STUDENTS directly to COURSES."
    -- Sample question: "How many students are enrolled in each course department?"
    -- Generated SQL:
    SELECT c.department_name, COUNT(DISTINCT e.student_id) AS enrolled_students
    FROM ENROLLMENTS e
    JOIN COURSES c ON e.course_id = c.course_id
    GROUP BY c.department_name
    ORDER BY enrolled_students DESC

### Recursive and self-referencing hierarchies

Defined-relationship Topics cannot represent self-joins. Chat Topics have no such constraint. You instruct the AI to self-join.
    
    
    -- Dataset instruction for EMPLOYEES:
    "EMPLOYEES.manager_id references EMPLOYEES.employee_id.
    To find a manager's name for each employee, self-join EMPLOYEES:
    JOIN EMPLOYEES manager ON emp.manager_id = manager.employee_id
    Use LEFT JOIN so that the CEO (manager_id IS NULL) is included.
    Alias the employee row as 'emp' and the manager row as 'mgr'."
    -- Sample question: "Show me each employee and their manager's name"
    -- Generated SQL:
    SELECT emp.employee_id, emp.first_name || ' ' || emp.last_name AS employee_name,
    mgr.first_name || ' ' || mgr.last_name AS manager_name,
    emp.department
    FROM EMPLOYEES emp
    LEFT JOIN EMPLOYEES mgr ON emp.manager_id = mgr.employee_id
    ORDER BY emp.department, emp.last_name

### Role-playing dimensions

A role-playing dimension is a single dimension table that serves multiple contextual roles in a fact table (for example, a DATE_DIM used for order date, ship date, and delivery date simultaneously). In defined-relationship Topics, each role requires a separate join definition. In Chat Topics, the AI handles this via instructions.
    
    
    -- Dataset instruction for ORDERS:
    "DATE_DIM is used in three distinct roles for the ORDERS table:
    - Order Date: join on order_date_key = DATE_DIM.date_key
    - Ship Date: join on ship_date_key = DATE_DIM.date_key (alias: SHIP_DATE)
    - Delivery Date: join on delivery_date_key = DATE_DIM.date_key (alias: DELIVERY_DATE)
    When the user mentions 'order date', 'placed', 'purchased': use the order_date_key join.
    When the user mentions 'shipped', 'dispatched': use the ship_date_key join.
    When the user mentions 'delivered', 'received': use the delivery_date_key join."
    -- Sample question: "What is the average delivery lag by region this quarter?"
    -- Generated SQL:
    SELECT s.region_name,
    AVG(DATEDIFF('day', o.order_date, o.delivery_date)) AS avg_delivery_days
    FROM ORDERS o
    JOIN STORE_DIM s ON o.store_id = s.store_id
    WHERE o.order_date >= DATE_TRUNC('quarter', CURRENT_DATE)
    AND o.delivery_date IS NOT NULL
    GROUP BY s.region_name
    ORDER BY avg_delivery_days DESC

### Cross-grain comparisons

Cross-grain comparisons arise when two fact tables measure the same concept at different granularities (daily actuals vs. monthly targets, weekly shipments vs. quarterly commitments). The AI needs explicit instruction on the rollup direction.
    
    
    -- Topic instruction:
    "DAILY_SALES is at daily grain; STORE_TARGETS is at monthly grain.
    To compute attainment (actuals / target), always aggregate DAILY_SALES
    up to the month before dividing. Use DATE_TRUNC('month', sale_date)
    as the grouping key, and join to STORE_TARGETS on month_start and store_id.",
    -- Sample question: "Which stores are below 80% of their monthly target?"
    -- Generated SQL:
    WITH monthly_actuals AS (
    SELECT store_id,
    DATE_TRUNC('month', sale_date) AS month_start,
    SUM(revenue) AS actual_revenue
    FROM DAILY_SALES
    GROUP BY store_id, DATE_TRUNC('month', sale_date)
    )
    SELECT st.store_name, ma.month_start,
    ma.actual_revenue, tg.target_revenue,
    ROUND(ma.actual_revenue / tg.target_revenue * 100, 1) AS attainment_pct
    FROM monthly_actuals ma
    JOIN STORE_TARGETS tg ON ma.store_id = tg.store_id
    AND ma.month_start = tg.month_start
    JOIN STORE_DIM st ON ma.store_id = st.store_id
    WHERE ma.actual_revenue / tg.target_revenue < 0.80
    ORDER BY attainment_pct ASC

### Circular relationships

Defined-relationship Topics reject circular (non-DAG) relationship graphs. Chat Topics have no such constraint. The AI navigates cyclic patterns when the question and instructions are clear about which path to traverse. If ORDERS references CUSTOMERS, CUSTOMERS references ACCOUNTS, and ACCOUNTS references ORDERS, the AI can follow whichever path is most appropriate for the question at hand.

## Best practice 7: Reduce noise and improve answer precision

A counterintuitive finding when tuning Chat-driven Topics: fewer visible fields produce more accurate answers. The AI processes every column in scope when formulating SQL. Technical columns, surrogate keys, ETL timestamps, and deprecated fields add noise, increasing the chance of irrelevant column selection or incorrect inference.

### Column exclusion strategy

  * **Exclude surrogate keys:** Integer surrogate keys (for example, customer_sk, product_sk) are used for joins but are meaningless as analytical values. Exclude them unless users would realistically filter on them.
  * **Exclude ETL metadata:** etl_load_timestamp, is_deleted, batch_id, source_system_code. These fields exist to support data engineering, not analytics.
  * **Exclude deprecated fields:** If you have both legacy_region_code and region_name, hide the deprecated one. Offering both invites the AI to pick the wrong one.
  * **Exclude highly cardinal low-value fields:** Free-text comments, internal notes, and UUID strings rarely contribute to meaningful analytics. Exclude them.



## Best practice 8: Test, validate, and iterate your semantic model

A semantic model is never finished on the first draft. Iterative test-refine cycles move you from “mostly correct” to “reliably accurate.” In traditional BI development, you test SQL queries directly. Here, you test the AI’s ability to translate business intent into correct SQL, which requires a structured approach.

### Building a question bank

Before publishing a Topic, create a question bank of 15–25 questions per major dataset, organized from basic to complex:

  * **Tier 1 – Single dataset, single metric:** “What was total revenue last month?” Tests basic SUM aggregation and date filtering.
  * **Tier 2 – Single dataset, multi-dimension:** “Show me revenue by product category and region for Q3.” Tests GROUP BY with multiple dimensions.
  * **Tier 3 – Cross-dataset, matching grain:** “What is the return rate by product category?” Tests cross-dataset join and division calculation.
  * **Tier 4 – Cross-dataset, mismatched grain:** “Which stores are above their monthly sales target?” Tests grain alignment, rollup, and join logic.
  * **Tier 5 – Complex patterns:** “Show me all customers, including those with no orders, and their lifetime spend.” Tests LEFT JOIN and NULL-safe aggregation.



### What to validate

  * **Join correctness:** Did the AI choose the right join type (LEFT vs. INNER)? Did it join on the correct key?
  * **Aggregation correctness:** Did the AI aggregate at the correct grain? Are measures summed rather than averaged where specified?
  * **Dataset selection:** When terms are ambiguous, did the AI pick the intended dataset?
  * **Filter logic:** Are filters applying correctly? Is the date range what the user intended?
  * **NULL handling:** Are NULL values handled appropriately (COALESCE, IS NULL checks)?



### Common failure modes and fixes

**Failure Mode** | **Symptom** | **Fix**  
---|---|---  
Wrong join key | Results are inflated or missing rows | Add explicit join hint in dataset instruction: “join on customer_id, not customer_name”  
Wrong aggregation | Revenue shows average unit price instead of sum | Add aggregation rule in field description: “Always SUM total_amount; never AVERAGE”  
Wrong dataset chosen | “sales” query hits RETURNS_FACT instead of SALES_FACT | Add disambiguation rule in topic instruction  
Unknown user term | AI cannot interpret “shrinkage” | Add “shrinkage” as a synonym for the relevant column  
Grain inflation | Joining daily to monthly fact doubles metric values | Add grain alignment instruction to topic instructions  
Missing NULL rows | Products with no sales are absent from results | Add outer join instruction: “LEFT JOIN from PRODUCTS to SALES_FACT”  
  
## Decision framework: Choosing your approach

Amazon Quick Sight offers three approaches to multi-dataset Topics: defined relationships, semantic-only Chat guidance, and a hybrid of both. The right choice depends on your use case, user profile, and governance requirements.

**Scenario** | **Recommended Approach** | **Rationale**  
---|---|---  
Stable star schema, regulated environment | Defined Relationships | Inner-join semantics enforced; deterministic; auditable join paths  
Exploratory analytics, ad-hoc questions | Semantic-Only (Chat) | Maximum flexibility; AI adapts to diverse question types without schema changes  
Outer joins, unions, or subqueries required | Semantic-Only (Chat) | Defined Relationships only supports inner joins; Chat has no join-type constraint  
Recursive hierarchies or self-joins | Semantic-Only (Chat) | Defined Relationships cannot self-reference; Chat handles self-joins via instructions  
Non-technical users needing guardrails | Defined Relationships + metadata | Explicit join graph prevents incorrect cross-dataset combinations; metadata improves NLQ  
Power users, maximum flexibility | Semantic-Only (Chat) | Rich instructions + synonyms give power users full SQL expressiveness through natural language  
  
## Putting it all together: End-to-end walkthrough

This section walks through configuring a Chat-ready Topic for a retail analytics scenario with five datasets.

### Scenario: Retail analytics Topic

**Dataset** | **Grain** | **Key Columns**  
---|---|---  
**SALES_FACT** | One row per order line item | order_line_id (PK), order_id, product_id, customer_id, store_id, order_date_key, quantity, unit_price, discount_amount, total_amount, order_status  
**RETURNS_FACT** | One row per returned item | return_id (PK), order_line_id (FK), customer_id, product_id, return_date, refund_amount, return_reason_code  
**CUSTOMER_DIM** | One row per customer | customer_id (PK), customer_name, customer_segment, city, state, country, first_order_date, lifetime_value  
**PRODUCT_DIM** | One row per product SKU | product_id (PK), product_name, subcategory, category, brand, unit_cost, is_active  
**DATE_DIM** | One row per calendar day | date_key (PK, YYYYMMDD int), date_value, day_of_week, month_name, quarter, year, is_holiday  
  
### Step 1: Dataset-level instructions (SALES_FACT)
    
    
    "SALES_FACT contains one row per order line item. Primary key: order_line_id.
    Grain: one line item = one product on one order.
    Revenue = quantity * unit_price - discount_amount. Always SUM revenue.
    Exclude rows where order_status = VOID.
    Joins: product_id -> PRODUCT_DIM, customer_id -> CUSTOMER_DIM,
    store_id -> STORE_DIM, order_date_key -> DATE_DIM.date_key."

### Step 2: Dataset-level instructions (RETURNS_FACT)
    
    
    "RETURNS_FACT: one row per returned order line. Primary key: return_id.
    order_line_id is a foreign key back to SALES_FACT.
    Use this dataset when the user asks about returns, refunds, or credits.
    refund_amount is always a negative number (credit to customer).
    LEFT JOIN from SALES_FACT to RETURNS_FACT to preserve unmatched sales."

### Step 3: Topic-level instructions
    
    
    Topic: Retail Analytics - Disambiguation and Cross-Dataset Rules
    Disambiguation:
    "sales", "revenue", "orders" -> use SALES_FACT
    "returns", "refunds" -> use RETURNS_FACT
    "net sales", "net revenue" -> join SALES_FACT LEFT JOIN RETURNS_FACT
    on order_line_id
    Cross-dataset metrics:
    Net Revenue = SUM(SALES_FACT.total_amount) + SUM(RETURNS_FACT.refund_amount)
    Return Rate = COUNT(RETURNS_FACT.return_id)
    / COUNT(SALES_FACT.order_line_id)
    Default joins:
    SALES_FACT LEFT JOIN CUSTOMER_DIM on customer_id
    SALES_FACT LEFT JOIN PRODUCT_DIM on product_id
    SALES_FACT LEFT JOIN DATE_DIM on order_date_key = date_key
    Date handling:
    YTD: current year up to and including today
    This quarter: DATE_TRUNC('quarter', today()) to today

### Step 4: Key synonyms

**Technical Field** | **Synonyms to Add**  
---|---  
SALES_FACT.total_amount | Revenue, Sales, Income, Top Line, Gross Sales, Total Sales  
RETURNS_FACT.refund_amount | Refund, Credit, Return Amount, Chargeback  
CUSTOMER_DIM.customer_segment | Segment, Tier, Customer Type, Account Type  
PRODUCT_DIM.category | Category, Department, Product Group, Aisle  
DATE_DIM.quarter | Quarter, Q1, Q2, Q3, Q4, Fiscal Quarter  
  
### Steps 5-7: Enrichment, exclusions, and validation

  1. **Enrich field descriptions:** Add descriptions to the 15-20 most queried columns across all five datasets using the format: definition + unit + nullability + aggregation rule.
  2. **Tag semantic types:** Tag all date fields as Date, monetary fields as Currency, percentage fields as Percent, and geographic fields with their respective geo types.
  3. **Exclude noise:** Hide etl_load_ts, batch_id, is_deleted, source_system, and surrogate key columns not used in user-facing questions.



### Step 8: Sample questions and expected SQL

**Q1: “What was total net revenue by product category last quarter?”**
    
    
    SELECT p.category,
    SUM(s.total_amount) + COALESCE(SUM(r.refund_amount), 0) AS net_revenue
    FROM SALES_FACT s
    LEFT JOIN RETURNS_FACT r ON s.order_line_id = r.order_line_id
    JOIN PRODUCT_DIM p ON s.product_id = p.product_id
    JOIN DATE_DIM d ON s.order_date_key = d.date_key
    WHERE d.quarter = 'Q2' AND d.year = 2024
    AND s.order_status != 'VOID'
    GROUP BY p.category
    ORDER BY net_revenue DESC

**Q2: “Show me all products including those with zero sales this month”**
    
    
    SELECT p.product_name, p.category,
    COALESCE(SUM(s.total_amount), 0) AS monthly_revenue
    FROM PRODUCT_DIM p
    LEFT JOIN SALES_FACT s
    ON p.product_id = s.product_id
    AND s.order_date_key BETWEEN 20240601 AND 20240630
    AND s.order_status != 'VOID'
    GROUP BY p.product_name, p.category
    ORDER BY monthly_revenue DESC

**Q3: “Which customer segments have the highest return rates?”**
    
    
    SELECT c.customer_segment,
    COUNT(DISTINCT s.order_line_id) AS total_orders,
    COUNT(DISTINCT r.return_id) AS total_returns,
    ROUND(COUNT(DISTINCT r.return_id) * 100.0
    / NULLIF(COUNT(DISTINCT s.order_line_id), 0), 2) AS return_rate_pct
    FROM SALES_FACT s
    LEFT JOIN RETURNS_FACT r ON s.order_line_id = r.order_line_id
    JOIN CUSTOMER_DIM c ON s.customer_id = c.customer_id
    WHERE s.order_status != 'VOID'
    GROUP BY c.customer_segment
    ORDER BY return_rate_pct DESC

**Q4: “Which stores are below 80% of their monthly target?”**
    
    
    WITH monthly_actuals AS (
    SELECT store_id, DATE_TRUNC('month', order_date) AS month_start,
    SUM(revenue) AS actual_revenue
    FROM SALES_FACT
    GROUP BY store_id, DATE_TRUNC('month', order_date)
    )
    SELECT st.store_name, ma.month_start,
    ma.actual_revenue, tg.target_revenue,
    ROUND(ma.actual_revenue / tg.target_revenue * 100, 1) AS attainment_pct
    FROM monthly_actuals ma
    JOIN STORE_TARGETS tg ON ma.store_id = tg.store_id
    AND ma.month_start = tg.month_start
    JOIN STORE_DIM st ON ma.store_id = st.store_id
    WHERE ma.actual_revenue / tg.target_revenue < 0.80
    ORDER BY attainment_pct ASC

## Current considerations and practical tips

### Instruction length and conciseness

Quick Sight custom instructions have character limits, but conciseness is a virtue regardless. Prefer bullet-point rule lists over prose paragraphs. Each rule should be a single, independently parseable statement. For example, “join orders to customers on customer_id using LEFT JOIN to preserve customers with no orders” is more effective than a two-paragraph essay covering the same point.

### Order of precedence

When topic-level and dataset-level instructions conflict, topic-level takes precedence. Use this predictably: dataset-level instructions should define single-dataset facts (grain, keys, aggregation rules), while topic-level instructions should define multi-dataset logic. Never use topic-level instructions to redefine single-dataset semantics already specified at the dataset level.

### Performance considerations

More datasets in a Topic means more context for the AI to process at query time. To keep response latency acceptable:

  * **Keep Topics focused on a domain:** retail analytics, HR analytics, financial reporting. Avoid creating one Topic for an entire enterprise data warehouse.
  * **Split topics when datasets serve different user communities.** A single all-data Topic is harder to tune and harder to govern than three focused Topics.
  * **SPICE-backed datasets** generally produce faster query responses than Direct Query sources for Chat workloads.



### Row-level security

Row-level security (RLS) is enforced at the dataset level, regardless of how the AI joins or unions datasets. Even if the AI generates SQL combining five datasets, each dataset’s RLS filters apply before data enters the join. A regional manager restricted to their region’s data in SALES_FACT will never see other regions’ data, regardless of the Chat question asked.

### When to split into multiple Topics

**Split into Multiple Topics When…** | **Combine into One Topic When…**  
---|---  
Different user communities with different vocabularies | Same user community with overlapping questions across datasets  
Datasets serve different business domains (HR + Finance) | All datasets serve a single analytical domain  
Governance requires different access controls per Topic | RLS handles access control uniformly at dataset level  
Topic instruction complexity is growing (>30 rules) | Topic instructions remain manageable (<20 rules)  
  
## Conclusion

Moving from explicit relationship graphs to semantic guidance is a fundamentally different approach to multi-dataset analytics: instead of defining every join path up front, you describe your data’s grain, vocabulary, business rules, and edge cases, and the AI translates user intent into correct SQL at query time.

This unlocks capabilities that pre-defined relationships cannot support: outer joins that preserve unmatched records, unions that combine parallel tables, self-joins that traverse recursive hierarchies, and cross-grain comparisons that require runtime rollups. The constraint is semantic, not structural: the more precisely you describe your data, the more reliably the AI delivers correct results.

* * *

## About the authors

### Ying Wang

Ying is a senior worldwide specialist solutions architect in the Generative AI organization at AWS. She brings 17 years of experience in data analytics and data science, with a strong background as a data architect and software development engineering manager.

### Emily Zhu

Emily is a Senior Product Manager at Amazon Quick, responsible for the full structured data stack — spanning governed and enterprise-scale data architecture, high-performance analytical and conversational query engines, and the semantic and ontology layer that gives data real meaning at scale. She’s passionate about how a strong data strategy unlocks AI strategy, and is on a mission to make the structured data stack the foundation for conversational and analytical experiences across Quick Suite.

### Amy Marvin

[Amy](<https://www.linkedin.com/in/amymarvin/>) is a Sr. Technical Product Manager for Amazon Quick, focused on AI-powered chat analytics capabilities. She is passionate about removing barriers between people and their data, making it possible for anyone to ask a question and get a trusted answer in seconds. Outside work, she enjoys exploring the DC restaurant scene and biking on nature trails.
