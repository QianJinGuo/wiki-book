---
title: "Milvus 3.0 聚合下推：3 层隔离、2 条路径，4 倍安全因子兜底"
type: raw
source_url: "https://mp.weixin.qq.com/s/uChhmuXrbbD01O2ELt4HOQ"
source_author: "术哥无界 | ShugeX | 运维有术"
source_date: 2026-07-31
ingested: 2026-08-02
sha256: bbc3e3251c5e24a9f721f682d93421444c034c374ae7a7da8086fe5c950e05b2
rating: 48
tags: [milvus, vector-database, search-aggregation, group-by, order-by, segcore, proxy, ann-search, source-code-analysis, shugex, database-internals, vector-db-3-0]
---

# Milvus 3.0 聚合下推：3 层隔离、2 条路径，4 倍安全因子兜底

> 来源：术哥无界 | ShugeX | 运维有术（Milvus 最佳实战 2026 系列第 24 篇 / 原创计划第 183 篇）

## 核心主张

Milvus 3.0 的 Search Aggregation 和 Order By 把分组、聚合、排序从应用层搬进数据库内部——在 ANN 搜索的近似性之上，用一层隔离架构补上分析层。核心矛盾：向量检索本身就是近似的，建立在它之上的聚合能做到多精确？答案：承认近似，用工程手段在精度和延迟之间权衡。

## 三层隔离架构（核心设计）

设计文档 20260413-search_embedded_agg.md 画了一条清晰边界：**Segcore 只做最笨的事，Proxy 包揽所有聪明的事**。

| 层 | 职责 | 聚合感知 | 嵌套感知 | 排序感知 |
|---|---|---|---|---|
| Segcore | 多字段 flat composite-key group-by | 否 | 否 | 否 |
| QueryNode / Delegator | 合并多 segment 结果，按 composite key 去重 | 否 | 否 | 否 |
| Proxy | 解析 GroupBy 树 → 构建 context → 接收 flat 结果 → 重建层级 + 指标 + 排序 | 是 | 是 | 是 |

流程：Proxy 拿到用户定义的 GroupBy 树（如第一层按 category、第二层按 brand），递归展开 flatten 成一组 composite key 请求。发给 Segcore 的 top-K 是**所有层级 size 的乘积再乘以安全因子**：`segcore_topk = Π(level.size) × group_count_safe_factor`，上限 65535。例：用户要 10 个 category × 每个 5 个 brand → segcore_topk = 10 × 5 × 4 = 200（多拉 4 倍降漏桶概率）。

Segcore 永远看到扁平 group-by 请求；Proxy 的 SearchAggregationComputer 一次扫描完成自顶向下递归重建（提取 group key → 标准化 → bucket map → Count 递增 → 指标更新 → Top-K 堆 → 子行收集），嵌套层级通过 sub_group 递归表达，最大深度 4 层。

**设计动机**：Segcore 是 C++ 跑在查询引擎热路径上，复杂聚合/嵌套重建严重影响延迟；重逻辑放 Go 写的 Proxy 层，改聚合逻辑不需要动 Segcore 二进制。

## 两条路径：Legacy GroupBy vs Search Aggregation

- **SearchGroupBy（legacy）**：触发条件 `group_by_field_id > 0`，走 SearchResultData.group_by_field_value（field 8）线载体，只能单字段去重。3.0 之前就有。
- **SearchAggregation（新）**：触发条件 `agg_info != nil`，走 SearchResultData.fields_data，用多字段 composite key 去重。支持多字段分组、分组内指标、bucket 排序、嵌套子分组。

用户文档严重落后于实现：v3.0.x 官方 grouping-search 页面只覆盖基础 Grouping Search（单字段 group_by_field、group_size、strict_group_size），新聚合 API 只字未提——与功能默认关闭有关。

## 近似不是 Bug，是设计选择

官方博客：Search aggregation 操作在 ANN 检索结果集上进行，而非全量数据，因此分面计数是近似值；需要精确计数用 query-side aggregation（全量扫描）。

近似三层面：
1. **Bucket 存在性不保证**——ANN 检索池外的 key 不可见
2. **count 只统计检索池中的行**——实际 20 个相关片段只召回 5 个，count 就是 5
3. **嵌套指标偏差随层级传播放大**——第一层不准，第二层更不准

缓解：group_count_safe_factor（默认 4），类似 Elasticsearch 的 shard_size 思路。判断标准：实时推荐场景可接受近似聚合；BI 报表要精确计数用 query-side。

## Search Order By vs Query Order By（两条不同的路）

**Search Order By**：完全在 Proxy 层执行，在向量搜索的 requery 之后。管道：`reduce → merge_ids → requery → gen_ids → organize → pick → order_by`（internal/proxy/search_pipeline.go:1808 orderByOperator）。两个关键限制：必须 requery 获取字段值（多一次网络往返）；排序完全在 Proxy 单节点，没有下推。支持多字段排序（优先级递减）、动态字段 JSON 子路径（如 metadata["price"]）。用 sort.SliceStable，等值行保持原始顺序，O(n log n × f)。微妙之处：按每组 top entity 的标量字段值排序组（取每组第一行 price，而非平均值/中位数）。

**Query Order By**：下推到 Segcore 执行，每段本地排序返回 Top-K，QueryNode 合并，Proxy 全局 merge-sort。Segcore 的 SortBuffer 组件（internal/core/src/exec/SortBuffer.h），Velox 风格，只排序指针（8 字节）不移动行数据；多字段可独立指定 ASC/DESC 和 NULLS FIRST/LAST；limit < n/2 时用 partial_sort 做 O(n log k)。已知限制：SortBuffer 目前没有 max_sort_rows 守卫，超大结果集排序有内存风险。

分化原因：Query 全量扫描数据在 Segcore 本地，排序跟着数据走可下推；Search 是 ANN 检索结果分散多 segment，必须 Proxy 合并后排序。

## 共享聚合框架 internal/agg/

AggregateBase 接口定义 Update / NewState / UpdateState / Terminate / ToPB 五方法。SumAggregate 数值累加，CountAggregate 计数（跳过 null），Min/MaxAggregate 有序比较，AvgAggregate 拆 sum+count 两 slot 在 Terminate 除法。FieldValue 封装值+null 标记，Row/Bucket 负责 key 匹配和聚合累积。Search 和 Query 两条路径复用同一套指标计算。

设计时间线：20260130-embeded-group-by.md（1/30）三层架构 → 20260203-query-orderby.md（2/3）Query 排序 → 20260413-search_embedded_agg.md（4/13，修订到 4/22）Search 聚合完整 MEP。

## 落地状态：默认关闭的审慎

`proxy.search.embeddedAggregation.enabled` feature flag 在 3.0 GA 默认 **off**。Phase 1 能力边界：指标只支持 count/sum/avg/max/min；bucket 排序支持 _count/_key/任意指标别名；TopHits.sort 只影响展示不影响指标计算。不支持 hybrid search + group_by、highlight、JSON 字段、limit 与 group_by 同用。metric_safe_factor 在 Phase 1 只是 proto 保留字段（no-op）。

## 行业位置

Milvus 3.0 不是变成 Elasticsearch：ES 聚合基于全量倒排索引（count/sum/avg 精确），Milvus 基于 ANN 检索结果集（全是近似）。两种设计哲学：ES 追求精确，Milvus 追求低延迟。Airbyte 对比测试 Milvus 纯向量搜索快约 15%、p95 延迟好约 20%；混合负载仍是 ES 强项。行业方向一致：SingleStore 实时聚合+向量、pgvector 混合负载、MariaDB 2026 加向量搜索——向量数据库定位从"存向量搜向量"挪向分析型数据库。
