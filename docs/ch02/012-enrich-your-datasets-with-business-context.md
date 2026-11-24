# Enrich your datasets with business context

> 📊 Level ⭐⭐⭐ | 9.4KB

## Enrich your datasets with business context: Migrating from legacy Topics to semantic datasets in Amazon Quick

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/enrich-your-datasets-with-business-context-migrating-from-legacy-topics-to-semantic-datasets-in-amazon-quick)

## Enrich your datasets with business context: Migrating from legacy Topics to semantic datasets in Amazon Quick

If you’ve been managing Amazon Quick legacy Topics alongside your datasets, you know the challenge: two assets that must stay perfectly synchronized, each with its own permissions, lineage, and versioning. Column synonyms drift. Calculated fields diverge. A rename in the dataset breaks the Legacy Topic silently. You can now use Amazon Quick to embed that business context directly into the dataset itself through **Dataset Enrichment** in the new data prep experience. Column descriptions, synonyms, calculated fields, custom instructions, and business rules all live alongside the data. Dataset Enrichment bakes business context directly into the dataset. Everything (permissions, semantics, AI context) travels with the data and is automatically inherited by anything built on top of it. One asset, one source of truth, one place to govern.

In this post, we walk through what Dataset Enrichment is, how it differs from legacy Topics, and provide three migration scenarios with step-by-step guidance so you can move your business context into the dataset layer with confidence.

**Topic** is now the multi-dataset semantic and reasoning layer, the construct where multiple datasets are composed, relationships are defined, business metrics are authored, and business terminology is mapped. Rather than introducing a net-new construct, we are re-purposing Topic to fulfill this role more completely. Moving dataset-intrinsic semantics down to where they belong, and elevating Topic to own the cross-dataset relationships, metrics, and business terminology that it was always meant to carry. This isn’t a cosmetic change. It establishes a clean, forward-looking architecture that supports both deterministic BI workflows and flexible AI-driven analytics from a shared semantic foundation. It also sets up the framework for catalog integration.

### What is Topics (legacy)

Legacy Topics provided the initial approach to adding business context to datasets in Amazon Quick Sight. It stored column synonyms, calculated fields, named entities, filters, and custom instructions in a separate object that sat on top of the dataset, linked but independently managed. Going forward, we classify existing Topics as legacy. The new version of Topics is being elevated to a _multi-dataset semantic layer_**.** A single-entry point for cross-dataset Q&A that lets business users and AI workflows query across multiple enriched datasets in one conversation. Dataset Enrichment is the foundation that makes this possible: each dataset must carry its own semantic context before Topics can unify them at a higher level.

### Key differences: Topics (legacy) vs. Dataset Enrichment (new data prep)

| **Legacy Topics** |

## 深度分析

### Side-car semantics are structurally fragile

The legacy Topic arrangement is not merely inconvenient; it is structurally fragile because the semantic layer and the data layer carry independent lifecycle state. The raw article's diagnosis is precise: two assets that must stay perfectly synchronized, each with its own permissions, lineage, and versioning, and failure modes that are silent — column synonyms drift, calculated fields diverge, and a dataset-side rename breaks the Legacy Topic without any error being raised. A side-car that fails quietly is worse than no side-car, because every consumer (dashboards, analyses, Q&A chat, downstream agents) keeps trusting context that may no longer match the schema it claims to describe. This is a classic split-brain problem in metadata management, and the migration described here is essentially its resolution.

### The re-architecture: two layers with different ownership

Dataset Enrichment is best understood as a layering decision, not a UI refresh. Dataset-intrinsic semantics — column descriptions, synonyms, row-level calculated columns, custom instructions, business rules — move down into the dataset itself via `semantic_model_configuration`, while Topic is re-purposed upward as the multi-dataset semantic and reasoning layer that owns cross-dataset relationships, business metrics, and shared business terminology. The dividing line is "true of exactly one dataset" versus "true of how several datasets compose." This separation is what makes the end state coherent: each enriched dataset is self-describing, and anything built on top inherits the context automatically instead of re-declaring it. The same two-layer logic reappears in the unified semantic layer built across datasets with multi-dataset Topics Build A Unified Semantic Layer Across Datasets With Multi Da, which this article explicitly frames as the destination construct.

### Migration is scenario-gated, not uniform

The three migration scenarios encode a hard constraint: Dataset Enrichment requires the new data prep experience (`DataPrepConfiguration` rather than `LogicalTableMap`), and legacy datasets cannot be upgraded in place — there is no conversion API. Scenario 1 (no Topics, legacy dataset) and Scenario 2 (Topic on a legacy dataset) therefore both route through re-creating the dataset in the new experience; only Scenario 3 (Topic on a new-prep dataset) supports a direct in-place migration by passing `SemanticModelConfiguration` to `update-data-set`. The practical consequence is that migration planning must start with an inventory of dataset formats, not with the Topic metadata itself. A team that discovers mid-project that its highest-value dataset is legacy-built faces a rebuild-and-cut-over project, not a script run. The alternative of querying legacy datasets with raw column names through the Dataset Q&A feature exists, but it forfeits the semantic layer entirely.

### The API contract shapes what automation can do

Several constraints in the raw article determine how far automation can go. Named entities and filters have no dedicated fields in `SemanticModelConfiguration` — they degrade into structured text inside `CustomInstructions`, which preserves meaning but loses schema-level structure. Calculated fields become row-level `CreateColumnsStep` entries, so aggregation-level expressions may need restructuring. And `update-data-set` requires full replacement of all configuration on every call, which is why the migration script reads the topic, rebuilds the complete payload, and applies it through a raw SigV4-signed API call in one pass. The article's own validation protocol — a 10–20 question regression suite, side-by-side comparisons against the legacy Topic, edge cases, and real-user testing before retirement — exists precisely because these transformations are lossy enough to demand behavioral verification, not just schema diffing. The sibling best-practices piece for multi-dataset Quick chat [Multi Dataset Topic Best Practices For Amazon Quick Chat](https://github.com/QianJinGuo/wiki-public/blob/main/entities/multi-dataset-topic-best-practices-for-amazon-quick-chat.md) extends the same enrichment discipline to the conversational layer.

## 实践启示

1. Treat business context as a property of the data layer, not of tooling configuration: when semantics live beside the data, every consumer inherits them by default and drift becomes structurally impossible rather than a synchronization discipline.
2. Audit dataset format before committing to a migration plan — whether a dataset uses `DataPrepConfiguration` or `LogicalTableMap` determines whether the path is a one-script migration or a rebuild-and-cut-over project.
3. Build the validation question set before migrating: ten to twenty natural-language questions that work correctly against the legacy Topic become the regression suite that proves the enriched dataset is behaviorally equivalent.
4. Expect fidelity loss at the entity and filter boundary: structured objects become text instructions, so plan how business users will reference rules by name or intent once the legacy Topic is gone.
5. Keep both semantic assets alive during cutover — the article explicitly supports temporary coexistence so enriched-dataset Q&A behavior can be validated against the legacy Topic before retirement.
6. Treat "no manual UI work" as the success criterion: the read-topic, transform, apply-via-API, verify pattern generalizes to any semantic-layer migration, and manual console edits are where transcription errors enter.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

