# 拆解 Milvus Segment 生命周期：L0/L1/L2 三级分层与删除机制源码分析

## Ch01.1006 拆解 Milvus Segment 生命周期：L0/L1/L2 三级分层与删除机制源码分析

> 📊 Level ⭐⭐ | 4.0KB | `entities/milvus-segment-lifecycle-delete-4-states-shuge-2026.md`

## 核心概述

Milvus 向量数据库的 Segment 是数据的物理组织单位，也是 compaction 的操作对象。本文基于 Milvus 源码（`internal/datacoord/`）和官方 design docs，深入拆解 Segment 的 L0/L1/L2 三级分层体系、Growing→Sealed→Flushed→Dropped 四状态生命周期，以及专为删除数据设计的阻塞机制。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/milvus-segment-lifecycle-delete-4-states-shuge-2026.md)

## 三级分层演进

Segment 层级定义在 `pkg/proto/data_coord.proto`，包含 `Legacy=0`、`L0=1`、`L1=2`、`L2=3` 四个枚举值。`Legacy` 是 proto zero value，代表分层引入前的老 segment，按 L1 处理。

| Level | 职责 | 初始状态 |
|-------|------|----------|
| L0 | delta data（删除/更新增量），channel 级别 | 直接 Flushed |
| L1 | 正常写入数据（insert binlogs），partition 级别 | Growing |
| L2 | 带额外数据分布信息 | Flushed + IsInvisible |

## L1 状态机

L1 Segment 经历四个核心状态：

1. **Growing** — 新建，接收写入
2. **Sealed** — 触发 seal（6 种策略：容量/生命周期/binlog 文件数/空闲超时/L0 阻塞/总体积超限）
3. **Flushed** — DataNode 写完 binlog 上报
4. **Dropped** — 被 compaction 消费后标记，GC 确认后物理删除

`SaveBinlogPaths` 是状态转换的核心入口（`services.go:627-669`），同时处理 Flushed 和 Dropped 两种转换。

## L0 删除机制

L0 是设计最精妙的层级：

- **删除不进 segment 路由**：删除消息不直接写到对应 partition 的 segment，而是攒到 channel 级别的 L0（中转站）
- **一出生就是 Flushed**：DataNode flush delete buffer 后直接注册为 Flushed
- **`sealByBlockingL0` 阻塞策略**：L0 积压到阈值时，强制 seal 时间范围重叠的 growing segment，保证删除可收敛（用写入吞吐换删除一致性）
- **L0 compaction**：删除标记合并进早于触发位置的 L1/L2 segment 的 deltalogs 中

删除在 Milvus 中的完整旅程：用户 delete → DML channel → DataNode 内存 → L0 deltalogs → compaction 合并进 L1/L2 → 查询时过滤。

## L2 的尴尬定位

L2 是正在被淡化的层级：

- v2.4：Clustering Compaction 过程中临时标记 L2，完成后清回 L1（中间态标记）
- v2.5.0+：过程中不再标记 L2，失败的结果直接标 Dropped
- 当前：L2 从中间态退化成了 Clustering 产物的身份标签

## 设计取舍

| 选择 | 优点 | 代价 |
|------|------|------|
| L0 单独存 delta | 删除无需在 segment 间路由 | 查询需额外加载 L0 deltalogs，删除多了变慢 |
| sealByBlockingL0 | 保证删除收敛 | 牺牲 growing segment 写入吞吐 |
| GC 安全距离 | 防止删除过早导致查询失败 | 老 binlog 多占存储 |

## 相关实体

- [MFS：Zilliztech 的 Agent 统一上下文 harness](ch01/430-claude.html) — 同作者（术哥）关于 Zilliztech/Milvus 相关项目
- [Hermes Agent v0.14 架构源码分析](../ch03/092-hermes-agent.html) — 同作者源码分析系列
- [RAG 检索增强生成](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-retrieval-augmented-generation.md) — Milvus 作为向量数据库的核心应用场景

---

