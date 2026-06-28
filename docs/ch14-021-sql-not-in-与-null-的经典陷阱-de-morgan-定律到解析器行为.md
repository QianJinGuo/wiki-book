## Ch14.021 SQL NOT IN 与 NULL 的经典陷阱：De Morgan 定律到解析器行为

> 📊 Level ⭐⭐ | 5.9KB | `entities/sql-not-in-null-trap-demorgan-parser.md`

# SQL NOT IN 与 NULL 的经典陷阱：De Morgan 定律到解析器行为

深入剖析 SQL 中 `NOT IN` 子查询包含 NULL 值时返回空结果集的经典陷阱。从 SQL 标准的三值逻辑定义出发，经 De Morgan 定律推导，到 PostgreSQL 解析器的实际行为。

## 核心问题

```sql
SELECT * FROM A WHERE id NOT IN (SELECT id FROM B);
-- 当 B.id 包含 NULL 时，结果为空！
```

## 为什么？

SQL 的三值逻辑：任何与 NULL 的比较返回 UNKNOWN（不是 TRUE 也不是 FALSE）。

`NOT IN` 等价于 `id != b1 AND id != b2 AND ... AND id != bn`。当某个 `bn` 是 NULL 时，`id != NULL` 返回 UNKNOWN。整个 AND 链中只要有一个 UNKNOWN，结果就是 UNKNOWN → 行被过滤。

## De Morgan 视角

`NOT IN` = `NOT (id = b1 OR id = b2 OR ... OR id = bn)`

如果任何一个 `bn` 是 NULL，内层 OR 的结果可能是 TRUE 或 UNKNOWN（取决于是否有其他匹配）。NOT UNKNOWN = UNKNOWN → 行被排除。

## 正确写法

```sql
-- 方案1：排除 NULL
SELECT * FROM A WHERE id NOT IN (SELECT id FROM B WHERE id IS NOT NULL);

-- 方案2：用 NOT EXISTS
SELECT * FROM A a WHERE NOT EXISTS (SELECT 1 FROM B b WHERE b.id = a.id);

-- 方案3：用 EXCEPT
SELECT id FROM A EXCEPT SELECT id FROM B;
```

## 实践价值

这是每个 SQL 用户都会踩的坑，文章的解释从理论到实践层层递进，是该主题的最佳技术文档之一。

## 深度分析

**三值逻辑的隐蔽陷阱**：SQL 的三值逻辑（TRUE/FALSE/UNKNOWN）是 `NOT IN` 陷阱的根本原因。与其他编程语言不同，SQL 中 `NULL = NULL` 返回 UNKNOWN 而非 TRUE，这意味着 NULL 不等于任何值，包括它自身。当 `NOT IN` 的右侧子查询包含 NULL 时，整个表达式退化为 `x <> a AND x <> b AND ... AND UNKNOWN`，AND 链中只要有一个 UNKNOWN，结果就是 UNKNOWN，导致所有行被过滤。

**解析器层面的实现细节**：PostgreSQL 的 `transformAExprIn` 函数中，`IN` 和 `NOT IN` 的区别仅在于一个 `useOr` 标志——`IN` 生成 `OR_EXPR`（`= ANY`），`NOT IN` 生成 `AND_EXPR`（`<> ALL`）。这个设计使得 NULL 的三值行为成为"涌现属性"而非显式特殊处理。从 EXPLAIN 输出可以直接验证：`NOT (1,2,3)` 编译为 `<> ALL ('{1,2,3}'::integer[])`，子查询形式则使用 `SubLink` 节点。

**左右两侧 NULL 的对称问题**：不仅右侧子查询的 NULL 会导致问题，左侧表达式中的 NULL 同样会产生 UNKNOWN 结果。这意味着 `IN` 和 `NOT IN` 并非互补——一个行可以同时不满足 `IN` 和 `NOT IN` 条件。这是三值逻辑中"NULL 间隙"的体现，也是为什么 `NOT EXISTS` 通常更安全的原因。

**性能与正确性的权衡**：`NOT IN` 在历史上比 `NOT EXISTS` 有更好的查询计划优化，但 PostgreSQL 近年来已经改进了 `NOT EXISTS` 的优化。在现代 PostgreSQL 中，两者性能差异已经很小，正确性应该优先于微小的性能差异。

**防御性编程的工程实践**：在生产代码中，应该将 `NOT IN` 视为"需要审查"的模式。最佳实践是：(1) 永远使用 `WHERE id IS NOT NULL` 过滤子查询结果，或 (2) 直接使用 `NOT EXISTS`/`EXCEPT` 替代。这类陷阱在代码审查中容易被遗漏，建议通过 linter 规则自动检测。

## 实践启示

1. **优先使用 NOT EXISTS 替代 NOT IN**：`NOT EXISTS` 对 NULL 具有天然的鲁棒性，语义更清晰，且现代 PostgreSQL 的性能已经优化到与 `NOT IN` 相当。
2. **子查询必须过滤 NULL**：如果必须使用 `NOT IN`，务必在子查询中添加 `WHERE id IS NOT NULL`，这是防御性编程的基本要求。
3. **代码审查时重点关注 NOT IN**：将 `NOT IN` 模式加入代码审查 checklist，确保审查者检查子查询是否可能返回 NULL。
4. **理解 EXPLAIN 输出**：学会阅读 PostgreSQL EXPLAIN 中的 `= ANY` 和 `<> ALL` 节点，这有助于理解查询的实际执行逻辑。
5. **三值逻辑的系统性影响**：NULL 的三值行为不仅影响 `NOT IN`，还影响 `NOT EXISTS`、`EXCEPT`、`GROUP BY`、`DISTINCT` 等多个 SQL 操作。理解这一底层逻辑是成为高级 SQL 用户的必经之路。

---
