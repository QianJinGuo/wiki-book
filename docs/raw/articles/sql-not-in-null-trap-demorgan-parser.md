---
source: newsletter
source_url: https://boringsql.com/posts/not-in-null/
ingested: 2026-06-18
sha256: f6c35c7d0a88fa1d9e216337b9835c64c1e4062c7cf67a312064f7fefe0dcec6
---


# The NULL in your NOT IN

Title: The NULL in your NOT IN

URL Source: http://boringsql.com/posts/not-in-null/

Published Time: 2026-06-14

Markdown Content:
A `NOT IN` query can return the wrong answer without telling you. It is valid SQL, it runs without an error, and it hands back a perfectly well-formed result set that happens to be empty when it should not be. No warning, no hint, nothing in the logs: just zero rows where you expected hundreds, and a database that considers it correct.

Almost always the cause is a single `NULL` sitting somewhere you forgot to look, combined with two keywords you have typed a thousand times: `NOT IN`. None of it is a Postgres bug. This is exactly what the SQL standard mandates, implemented faithfully. That is precisely what makes it so easy to walk into, and why the planner could not safely optimize around it for the better part of Postgres's history. It comes down to one `if` statement in the parser.

## Sample schema[](http://boringsql.com/posts/not-in-null/#sample-schema)

Nothing elaborate. A table of products, one of which has no category assigned yet, and a table of archived categories that happens to contain a `NULL`:

```
CREATE TABLE products (id int, category_id int);
INSERT INTO products VALUES (1, 10), (2, 20), (3, NULL), (4, 10);

CREATE TABLE archived (category_id int);
INSERT INTO archived VALUES (20), (NULL);
```

The `NULL` in `archived` is not contrived. The moment a column is nullable (and most are, by default), a `NULL` can find its way into any subquery you point a `NOT IN` at. That is the whole point: this is not an exotic data condition, it is the ordinary one.

## The query that returns nothing[](http://boringsql.com/posts/not-in-null/#the-query-that-returns-nothing)

Here is the request you have written a hundred times: give me the products whose category is _not_ archived.

```
SELECT id, category_id FROM products
WHERE category_id NOT IN (SELECT category_id FROM archived);
```

You expect products 1 and 4 (category 10, which is not in the archived set). What comes back is:

```
id | category_id
----+-------------
(0 rows)
```

Every row gone. Not a subset, not an off-by-one: all of them. Drop the `NULL` from `archived` and the same query behaves:

```
SELECT id, category_id FROM products
WHERE category_id NOT IN (SELECT category_id FROM archived
                          WHERE category_id IS NOT NULL);
```

```
id | category_id
----+-------------
  1 |          10
  4 |          10
(2 rows)
```

To understand why a single `NULL` empties the entire result, we have to stop thinking of `NOT IN` as a single thing and watch the parser take it apart.

## IN is an OR, NOT IN is an AND[](http://boringsql.com/posts/not-in-null/#in-is-an-or-not-in-is-an-and)

`IN` is not a primitive operator. It is shorthand that the parser rewrites into a chain of equality comparisons joined by `OR`:

```
x IN (a, b, c)
-- becomes
x = a OR x = b OR x = c
```

`NOT IN` is the logical negation of that, and by De Morgan's law negating an `OR` of equalities gives you an `AND` of inequalities:

```
x NOT IN (a, b, c)
-- becomes
x <> a AND x <> b AND x <> c
```

This is not an analogy. It is literally the expression Postgres builds, and you can read it straight off an `EXPLAIN`. The literal-list forms collapse into array operators whose names give the whole game away:

```
EXPLAIN (COSTS OFF) SELECT * FROM products WHERE category_id IN (1, 2, 3);
--  Filter: (category_id = ANY ('{1,2,3}'::integer[]))

EXPLAIN (COSTS OFF) SELECT * FROM products WHERE category_id NOT IN (1, 2, 3);
--  Filter: (category_id <> ALL ('{1,2,3}'::integer[]))
```

`IN` is `= ANY`: equal to _any_ element, an `OR`. `NOT IN` is `<> ALL`: different from _all_ elements, an `AND`.

The actual node types matter here, because they are what you end up staring at when you dump a parse tree or read a normalized [`pg_stat_statements`](https://boringsql.com/posts/pg-stat-statements/) entry. A literal list compiles to a single `ScalarArrayOpExpr`: the scalar on the left, the array on the right, and a `useOr` flag that is the entire difference between `= ANY` and `<> ALL`. The subquery forms are a different node altogether, a `SubLink`. Recognising those two names on sight tells you immediately which path the planner is on.

If "`IN` and `= ANY` are the same operator" is news: they compile to the same parse node and the same plan, with the spellings diverging only in plan-cache churn and selectivity estimates. The `NOT IN` case in front of you here is the one corner where the choice is not cosmetic but a matter of correctness.

## Three-valued logic does the rest[](http://boringsql.com/posts/not-in-null/#three-valued-logic-does-the-rest)

SQL does not have two truth values, it has three: **true**, **false**, and **unknown**. Any comparison against `NULL` yields `unknown`, because `NULL` means "no value here" and you cannot ask whether an absent value is different from 20:

```
-- not false. unknown (displayed as a blank)
SELECT 10 <> NULL;
```

Now walk the `NOT IN` expansion for product 1 (category 10) against the archived set of 20 and `NULL`:

[![Image 1: Evaluation tree for 10 NOT IN (20, NULL): it expands to 10 <> 20 AND 10 <> NULL, which evaluate to true and unknown; the NULL poisons its branch, and AND carries the unknown to the root, so the row is dropped](https://boringsql.com/images/posts/not-in-light.svg)](https://boringsql.com/images/posts/not-in-light.svg)[![Image 2: Evaluation tree for 10 NOT IN (20, NULL): it expands to 10 <> 20 AND 10 <> NULL, which evaluate to true and unknown; the NULL poisons its branch, and AND carries the unknown to the root, so the row is dropped](https://boringsql.com/images/posts/not-in-dark.svg)](https://boringsql.com/images/posts/not-in-dark.svg)

`true AND unknown` is `unknown`, not `true`. A `WHERE` clause keeps a row only when its predicate evaluates to **true**. Both `false` and `unknown` cause the row to be discarded. So product 1 is dropped. Run the same arithmetic for product 4 and you land on `unknown` again.

**The mechanism in one sentence:** the instant a single `NULL` enters the right-hand side, the trailing `AND unknown` term can never be `true`, so the whole `NOT IN` can never be `true`, so **every** row is discarded, regardless of how many million rows you have or what they contain.

## NULLs on the left side too[](http://boringsql.com/posts/not-in-null/#nulls-on-the-left-side-too)

Keeping `NULL`s out of the subquery is not enough. The same `unknown` arises from `NULL`s on the _left_: product 3 (whose `category_id` is `NULL`) evaluates to `unknown AND unknown`, so it is dropped even against a spotless right-hand set. `IN` and `NOT IN` are not complements: a row can fail both tests simultaneously. There is a `NULL`-shaped gap between them that belongs to neither.

## The seam, in the source[](http://boringsql.com/posts/not-in-null/#the-seam-in-the-source)

All of this reduces to one branch in one function. Open `src/backend/parser/parse_expr.c` and find `transformAExprIn`, the routine that turns both `IN` and `NOT IN` list expressions into something the planner can chew on. The very first thing it decides is whether it is building an `OR` or an `AND`:

```
/*
 * If the operator is <>, combine with AND not OR.
 */
if (strcmp(strVal(linitial(a->name)), "<>") == 0)
    useOr = false;
else
    useOr = true;
```

That is the entire fork. `IN` arrives carrying the operator `=` and gets `useOr = true`; `NOT IN` arrives carrying `<>` and gets `useOr = false`. The flag rides all the way down to where the boolean tree is finally assembled, several hundred lines later:

```
result = (Node *) makeBoolExpr(useOr ? OR_EXPR : AND_EXPR,
                               list_make2(result, cmp),
                               a->location);
```

`OR_EXPR` for `IN`, `AND_EXPR` for `NOT IN`. There is no special-casing of `NULL` anywhere in this function, and there does not need to be: the three-valued behavior is an emergent property of having cho