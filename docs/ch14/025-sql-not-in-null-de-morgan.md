# SQL NOT IN 与 NULL 的经典陷阱：De Morgan 定律到解析器行为

> 📊 Level ⭐⭐⭐⭐ | 8.7KB

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

### 三值逻辑的形式化：UNKNOWN 如何污染整条 AND 链

SQL 谓词的求值结果有三种：TRUE、FALSE、UNKNOWN。三条关键规则决定了 `NOT IN` 的命运：与 NULL 的任何比较（`=` 或 `<>` 都一样）返回 UNKNOWN；`TRUE AND UNKNOWN` 的结果是 UNKNOWN 而非 TRUE；`NOT UNKNOWN` 仍是 UNKNOWN。而 `WHERE` 只保留谓词求值为 TRUE 的行，FALSE 与 UNKNOWN 一视同仁地被丢弃。

由此可以给出一个简洁的失效判据：把 `NOT IN` 展开为 `x <> a AND x <> b AND ...` 后，只要右侧集合里存在一个 NULL，AND 链上就多出一个恒为 UNKNOWN 的项，整个表达式从此不可能等于 TRUE——无论表里有多少行、其余比较是否匹配，结果集必然为空。这是一条纯逻辑推论，与数据量、索引和执行计划完全无关，也解释了为什么该陷阱表现为"静默返回空集"而不是报错。

### NULL 感知的查询改写模式

三种改写的 NULL 鲁棒性并不相同。`NOT EXISTS` 是关联子查询，只要找到一条匹配即返回 TRUE，右侧出现的 NULL 只是"永远匹配不上"，不会产生毒化整个表达式的 UNKNOWN，因此天然免疫这一陷阱。`EXCEPT` 基于集合差语义，在集合运算中 NULL 被视为彼此相等，左右两侧的 NULL 都能被正确处理，代价是它隐含去重、只返回单列差集。`IS NOT NULL` 过滤是最小改动方案，但它依赖人的纪律：后续任何人往子查询里加列、改写或移除过滤，陷阱就会复发。

还有一个容易被忽略的盲区：不仅右侧子查询的 NULL 致命，左侧表达式的 NULL 同样产生 UNKNOWN——即使子查询完全干净，左值为 NULL 的行也照样被过滤。这意味着 `IN` 与 `NOT IN` 并不互补，存在一个两侧测试都失败的"NULL 间隙"，这也是 `NOT EXISTS` 更安全的根本原因。

### 解析器与优化器：useOr 标志与跨引擎一致性

解析器层面，`IN` 与 `NOT IN` 的分叉只有一个布尔标志：`transformAExprIn` 检测到 `<>` 操作符就把 `useOr` 置为 false，最终分别组装出 `OR_EXPR`（`= ANY`）与 `AND_EXPR`（`<> ALL`）的布尔树；字面量列表编译为单个 `ScalarArrayOpExpr`，子查询形式则是 `SubLink` 节点。整个函数中没有任何针对 NULL 的特判——三值行为是选择 AND 而非 OR 之后自然涌现的性质，这正是它能通过 EXPLAIN 直接验证的原因。

优化器层面，正因为该行为是 SQL 标准强制规定的语义而非实现缺陷，任何引擎都不能"好心"地把含子查询的 `NOT IN` 自动改写成反连接——除非它能证明子查询列不存在 NULL。这使得陷阱具有跨引擎可移植性：遵循同一标准的数据库行为一致，换一个引擎并不能豁免。工程上的正面进展是，现代 PostgreSQL 对 `NOT EXISTS` 反连接的计划质量已大幅改善，历史上"NOT IN 更快"的性能理由如今已基本不成立，正确性权重应当绝对优先。

### 针对 NULL 语义的测试策略

针对这类静默失败，测试必须构造"含毒"的最小数据集：右侧子查询带一个 NULL、左侧存在一条 NULL 行、以及左右同时为 NULL 的组合，各自断言精确的行集合，而不是"查询跑通了"。行集断言能同时暴露空结果与多结果两类错误。更进一步，可以把改写等价性做成属性测试——对随机生成的含 NULL 数据断言"过滤后的 `NOT IN`"与"`NOT EXISTS`"结果一致，这个思路与用属性测试重写 SQL 解析器的实践一脉相承（参见 [PostHog SQL 解析器属性测试](https://github.com/QianJinGuo/wiki-public/blob/main/entities/posthog-claude-rewrite-sql-parser-pbt.md)）。由于这类缺陷没有报错和日志，静态防线同样重要：将裸 `NOT IN` 列入 linter 规则与审查清单，并要求每个子查询附带 NULL 处理说明。

## 实践启示

1. **优先使用 NOT EXISTS 替代 NOT IN**：`NOT EXISTS` 对 NULL 具有天然的鲁棒性，语义更清晰，且现代 PostgreSQL 的性能已经优化到与 `NOT IN` 相当。
2. **子查询必须过滤 NULL**：如果必须使用 `NOT IN`，务必在子查询中添加 `WHERE id IS NOT NULL`，这是防御性编程的基本要求。
3. **代码审查时重点关注 NOT IN**：将 `NOT IN` 模式加入代码审查 checklist，确保审查者检查子查询是否可能返回 NULL。
4. **理解 EXPLAIN 输出**：学会阅读 PostgreSQL EXPLAIN 中的 `= ANY` 和 `<> ALL` 节点，这有助于理解查询的实际执行逻辑。
5. **三值逻辑的系统性影响**：NULL 的三值行为不仅影响 `NOT IN`，还影响 `NOT EXISTS`、`EXCEPT`、`GROUP BY`、`DISTINCT` 等多个 SQL 操作。理解这一底层逻辑是成为高级 SQL 用户的必经之路。
6. **单条 NULL 即可清空整个结果集**：失效条件不是"很多 NULL"而是"至少一个 NULL"——AND 链追加的 `AND UNKNOWN` 项使谓词永远无法为 TRUE。任何涉及 `NOT IN` 的变更，都应先确认子查询列的 NULL 可能性。
7. **测试必须断言精确行集，而非"能跑通"**：静默失败类缺陷（无报错、无日志）只能靠结果集断言发现；seed 数据必须显式覆盖左右两侧的 NULL。查询引擎同类静默 bug 的案例见 [Karpathy 发现的查询引擎 bug](https://github.com/QianJinGuo/wiki-public/blob/main/entities/https-posthog-com-blog-karpathy-autoresearch-query-engine-bug.md)。
8. **把"列可能为 NULL"当作默认假设**：可空是多数列的默认状态，NULL 迟早进入任何子查询；基于"数据现在很干净"的 `NOT IN` 迟早失效，防御要写在查询里而不是赌数据质量。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

