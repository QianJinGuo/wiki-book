---
title: "一条 delete 走过 4 个状态：拆开 Milvus 的 Segment，我发现删除才是最复杂的操作"
source_url: "https://mp.weixin.qq.com/s/d9ESK0SZ9wVUOF7bdszRHA"
author: "术哥"
feed_name: "术哥无界 | ShugeX | 运维有术"
publish_date: 2026-07-05
created: 2026-07-05
ingested: 2026-07-05
tags: [milvus, vector-database, segment, compaction, deletion, delta-log, source-code-analysis, wechat]
type: article
review_value: 9
review_confidence: 9
review_recommendation: strong
review_stars: 5
sha256: 688d3d4a0ad3c49cf2f14af5c0f2b45e3ed02c6e3145c90f84aaf427790d1a30
---

# 一条 delete 走过 4 个状态：拆开 Milvus 的 Segment，我发现删除才是最复杂的操作

> 🚩 2026 年「术哥无界」系列实战文档 X 篇原创计划 第 157 篇，Milvus 最佳实战「2026」系列第 17 篇
>
> 大家好，欢迎来到 **术哥无界 | ShugeX ｜ 运维有术** 。
>
> 我是 **术哥** ，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的 **技术实践者与开源布道者** ！
>
> **Talk is cheap, let's explore。无界探索，有术而行。**

> **说明** ：本文内容基于 Milvus 源码（`milvus-io/milvus`）和官方 design docs 分析整理，所有技术结论均标注了源码文件路径和行号，可逐项验证。**文中引用的源码位置基于笔者本地仓库版本（2026-06-20 同步），随上游演进可能有变化。** 如果有实际使用经验或发现版本差异，欢迎在评论区交流。

你在 Milvus 里执行一句 `delete`，控制台秒级返回成功。看起来轻飘飘的一句话，底下其实牵动了一整套机制。

删掉的主键（PK）先被收进一个叫 L0 的 **中转站** segment，等系统攒够了一批再触发 compaction，把删除标记合并进真正的数据 segment 里。等查询节点把新数据加载完，老 segment 的物理文件才允许被回收。

整个过程绕不开一个核心概念 - **Segment** 。它是 Milvus 数据的物理组织单位，也是 compaction 的操作对象。

前面那篇讲 Compaction 的文章聚焦 **数据怎么合并** ，这篇就来补另一半： **合并的对象是谁，它从哪来，到哪去** 。

翻了一遍 Milvus 源码（`internal/datacoord/` 目录），我发现 Segment 远不止"一块数据"这么简单。

它有一套 L0/L1/L2 的三级分层，有 Growing→Sealed→Flushed→Dropped 的状态机，还有为删除数据专门设计的阻塞机制。

这些设计不是一开始就有的。源码里到处留着演进的痕迹：`Legacy` 这个枚举值、被标记 `deprecated` 的 `max_row_num` 字段、v2.4 和 v2.5 行为不一致的 L2 处理逻辑。

下面按"分层是怎么来的 → L1 怎么活一辈子 → L0 为什么特殊 → L2 的尴尬定位 → 设计取舍"这条线展开。

## 1. 三级分层不是一天建成的

### 1.1 四个枚举值，藏着一段演进史

Segment 的层级定义在 `pkg/proto/data_coord.proto:24-29`：

```
enum SegmentLevel {
    Legacy = 0; // zero value for legacy logic
    L0 = 1;     // L0 segment, contains delta data for current channel
    L1 = 2;     // L1 segment, normal segment, with no extra compaction attribute
    L2 = 3;     // L2 segment, segment with extra data distribution info
}
```

注意第一个值 `Legacy = 0`。它不是给人用的，是 proto 的 zero value。老版本 Milvus 创建的 segment 根本没有 Level 这个字段，反序列化出来默认就是 0。

proto 注释（`data_coord.proto:415-417`）把话说得很直白：

> For legacy level, it represent old segment before segment level introduced, so segments with Legacy level shall be treated as L1 segment.

意思就是：**分层是后加的，老 segment 一律按 L1 处理** 。这一个枚举值，就是三级分层演进过程的化石。

### 1.2 三层各自存什么

把源码里的创建路径、初始状态、注释汇总到一张表，三层的语义就清楚了：

| Level | 存什么 | 谁创建 | 初始状态 | 源码位置 |
|-------|--------|--------|----------|----------|
| **L0** | delta data（删除/更新的增量），channel 级别 | DataNode/StreamingNode flush deltalogs 时通过 `SaveBinlogPaths` 创建 | 直接 `Flushed` | `meta.go:979` `CreateL0Operator` |
| **L1** | 正常写入的数据（insert binlogs），partition 级别 | SegmentManager 分配新 segment | `Growing` | `segment_manager.go:440` |
| **L2** | 带"额外数据分布信息"的 segment | Clustering Compaction 产出 | `Flushed` + `IsInvisible` | `meta.go:2371` |

最反直觉的一点在 L0： **它一出生就是 Flushed，根本不走 Growing→Sealed 那一套** 。原因后面细说。

还有一个细节 - L0 注释里的 `for current channel`。L0 是 channel 级别的，而 L1 是 partition 级别。

这五个字的差别，决定了整个删除回收机制的设计形态。

## 2. L1 的一生：从 Growing 到被 GC

先看最主流的 L1 segment。它有完整的状态流转，是理解整个 Segment 生命周期的基础。

### 2.1 四个核心状态

SegmentState 的原始定义在 design doc `20211109-milvus_flush_collections.md:126-133`：

```
enum SegmentState {
    SegmentStateNone = 0;
    NotExist = 1;
    Growing = 2;
    Sealed = 3;
    Flushed = 4;
    Flushing = 5;
}
```

但源码里实际跑的状态不止这些。从 `internal/datacoord/*.go` 全局 grep，真正在用的是五个：`Growing`、`Sealed`、`Flushed`、`Dropped`，外加一个 `Importing`。

`Importing` 是 bulk import 专用，design doc 里没有，是后续新增的。

健康判定函数 `isSegmentHealthy`（`meta.go:2659-2664`）划了条线：

```
func isSegmentHealthy(segment *SegmentInfo) bool {
    return segment != nil &&
        segment.GetState() != commonpb.SegmentState_SegmentStateNone &&
        segment.GetState() != commonpb.SegmentState_NotExist &&
        segment.GetState() != commonpb.SegmentState_Dropped
}
```

也就是说，只有 `SegmentStateNone`、`NotExist`、`Dropped` 算不健康，Growing、Sealed、Flushed 都是活的。

### 2.2 完整状态流转图

把源码里的状态转换入口拼起来，L1 segment 的一生是这样的：

```
[新建] → Growing
         │
         │ 触发 seal（6 种策略，见下文）
         ▼
       Sealed
         │
         │ DataNode 写完 binlog 上报
         ▼
       Flushed
         │
         │ 被 compaction 消费，原 segment 标记 Dropped
         ▼
       Dropped
         │
         │ GC 确认目标 segment 已索引/已加载
         ▼
       [物理删除 binlog 文件]
```

每一步的入口都能在源码里找到：

- **Growing** ：`segment_manager.go:438` 的 `openNewSegmentWithGivenSegmentID`，直接 `State: Growing, Level: L1`
- **Sealed→Flushed** ：`services.go:669` 的 `SaveBinlogPaths`，收到 `req.GetFlushed()` 时调 `UpdateStatusOperator` 改成 `Flushed`
- **Dropped** ：`services.go:662`，同样在 `SaveBinlogPaths` 里，收到 `req.GetDropped()` 时改 `Dropped` 并 `DropSegment`
- **物理删除** ：`garbage_collector.go:767` 的 `recycleDroppedSegments`

注意 `SaveBinlogPaths` 这个函数 - 它是状态转换的 **核心入口** 。一个 RPC 同时处理 Flushed 和 Dropped 两种转换。`services.go:627-669` 这四十来行代码，是 L1 生命线的咽喉。

### 2.3 Seal 的六种姿势

Growing 到 Sealed 这一步最有意思。SegmentManager 注册了 **六种 seal 策略** ，都在 `segment_allocation_policy.go` 里：

- `sealL1SegmentByCapacity`：按二进制大小封口
- `sealL1SegmentByLifetime`：生命周期到期
- `sealL1SegmentByBinlogFileNumber`：binlog 文件数超限
- `sealL1SegmentByIdleTime`：空闲超时
- `sealByBlockingL0`： **L0 积压触发的强制 seal** （重点，下节展开）
- `sealByTotalGrowingSegmentsSize`：所有 growing 总体积超限，封最大的

前四种是常规的 **按尺寸/时间封口** ，第五种和 L0 删除机制强绑定，第六种是兜底。 **Segment 大小本身也经历过演进** - `data_coord.proto:390` 的 `max_row_num` 字段注释明说：

> deprecated, we use the binary size to control the segment size but not a estimate rows

早期是估算行数控制 segment 大小，后来改成实际二进制大小。

为什么改？因为不同向量维度、不同数据类型，同样的行数体积差太多，按行数控不准。

这种 deprecated 痕迹在源码里很常见。读源码时多留意注释，能看到设计是怎么一步步长出来的。

## 3. L0：删除数据的中转站

L0 是三级分层里设计最精巧、也最容易被忽略的一层。

### 3.1 为什么删除要单独搞一层

想明白这个问题，得先看普通数据库怎么做删除。

传统 B+ Tree 数据库，删一条数据就是打个 tombstone 标记，查询时跳过。但 Milvus 不一样 - 它的数据是 **按 segment 物理切分** 的。一个 PK 落在哪个 segment，删的时候得知道去哪打标记。

最朴素的做法是：删除消息进来，直接写到对应 segment 的 deltalogs 里。问题是 segment 是 partition 级别的，一个 collection 可能成百上千个 segment。删除消息要在它们之间路由，开销不小。

Milvus 的选择是 **把删除先攒到 channel 级别** 。proto 注释那句 `for current channel` 就是这个意思 - L0 不属于任何 partition，它挂在整个 DML channel 上，所有删除消息先进 L0 这个 **中转站** 。

这就是 L0 一出生就是 `Flushed` 的原因。它没有 Growing 阶段，因为它不接收实时写入 - DataNode 把内存里的 delete buffer flush 成 deltalogs 之后，通过 `SaveBinlogPaths(segLevel=L0)` 直接注册成 Flushed 状态（`services.go:629-630`、`meta.go:993`）。

### 3.2 阻塞机制：L0 攒多了会逼停 growing

L0 中转站的代价在哪？源码里有个挺巧的策略 - `sealByBlockingL0`（`segment_allocation_policy.go:225-320`）。

L0 积压到阈值（`BlockingL0SizeInMB` 或 `BlockingL0EntryNum`）时，系统会 **强制 seal 与 L0 时间范围重叠的 growing segment** 。源码注释直接画了张时间轴来解释：

```
G1  [0-----------------------------
G2           [7-------------------
G3      [4-------------------------
G4              [10--------
L0a [0-----5]
L0b          [6-------9]
L0c                     [10------20]

say L0a&L0b make total size/num exceed limit,
we shall seal G1,G2,G3 since they have overlap ts range blocking l0 compaction
```

意思是：假设 L0a 和 L0b 的总量超限，就要把 G1、G2、G3 全部 seal，因为它们的时间范围和 L0 重叠，会阻塞 L0 compaction。

为什么必须 seal 这些 growing？因为 L0 compaction 要把 delta 应用到该 channel 上 **所有早于 L0 dmlPos 的 sealed/flushed segment** 。

Growing segment 不参与 compaction。只要它还活着、还在接收写入，L0 的删除就没办法完整应用下去 - 万一应用完之后 growing 又写进来一条同 PK 的数据呢？

所以系统宁可把正在写入的 growing 强制封口，也要保证 L0 的删除能收敛。 **这是用写入吞吐换删除一致性的取舍** 。

### 3.3 L0 compaction 怎么挑目标

L0 自己攒够了之后，会被 L0DeleteCompaction 消费。目标 segment 的选择逻辑在 `compaction_task_l0.go:305-340`：

```
flushedSegments := t.meta.SelectSegments(..., SegmentFilterFunc(func(info *SegmentInfo) bool {
    return ... &&
        info.GetLevel() != datapb.SegmentLevel_L0 &&
        segmentEffectiveTs(info.SegmentInfo) < taskProto.GetPos().GetTimestamp()
}))
```

两个条件： **是 L1/L2（排除 L0 自己）** ，且 `effectiveTs < trigger pos`。也就是把 L0 攒的这批删除标记，合并进所有 **早于 L0 触发位置** 的 L1/L2 segment 的 deltalogs 里。

合并完，L0 segment 自己就走向 Dropped，等 GC 回收。删除数据在 Milvus 里的完整旅程是这样： **用户 delete → DML channel → DataNode 内存 → L0 deltalogs → compaction 合并进 L1/L2 → 查询时过滤** 。

## 4. L2 的尴尬：一个正在被淡化的层级

L2 是三级里最尴尬的存在。

### 4.1 它本来要干嘛

按 proto 注释，L2 是 `segment with extra data distribution info` - 带额外数据分布信息的 segment。

这个 **额外信息** 来自 **Clustering Compaction** ：把 L1 segment 按某个聚类键（比如某个标量字段的值范围）重新分布，产出的新 segment 就是 L2。

创建路径在 `meta.go:2358-2381`，新 segment 带 `IsInvisible: true`，要等 stats 和 index 建完才对查询可见。

### 4.2 v2.4 和 v2.5 行为不一致

L2 的尴尬，体现在源码里一段非常直白的注释（`compaction_task_clustering.go:121`）：

```
// don't mark segment level to L2 before clustering compaction after v2.5.0
```

再往下翻（`compaction_task_clustering.go:665-694`），注释把两个版本的行为差异写得很清楚：

```
// v2.4：L1 ->(process)-> L2 ->(clean)-> L1
//       L2 ->(process)-> L2 ->(clean)-> L2
// ...this task must be generated by v2.4, just for compatibility

// v2.5.0+：after v2.5.0, mark the results segment as dropped
```

**v2.4 时** ，Clustering Compaction 过程中会临时把 segment 标记成 L2，完成后清理回 L1（L1→L2→L1）。L2 在这里只是个 **中间态标记** 。

**v2.5.0 之后** ，过程中不再标记 L2，失败的中间结果 segment 直接标 Dropped。

但 L2 并没有被完全废弃。当前版本 Clustering 产出新 segment 时，仍然标记成 L2（`meta.go:2371`）。它从"中间态标记"退化成了"Clustering 产物的身份标签"。

### 4.3 LastLevel：为失败兜底的回滚字段

L2 还牵出一个有意思的设计 - **LastLevel 字段** 。`data_coord.proto:421-424`：

```
// use in major compaction, if compaction fail, should revert segment level to last value
SegmentLevel last_level = 23;
```

对应的实现在 `meta.go:1089-1138`，两个 Operator 配对使用：

- `UpdateSegmentLevelOperator`：改 level 之前，先把旧值存进 `LastLevel`
- `RevertSegmentLevelOperator`：compaction 失败时，把 `Level` 恢复成 `LastLevel`

这是一个典型的 **事务性回滚设计** - 分布式系统里 compaction 可能失败，level 改了一半得能回退。

源码里这种"为失败做准备"的细节，往往是读文档学不到的工程经验。

## 5. 这些设计解决了什么，又引入了什么代价

把前面几节接起来看，三级分层的设计逻辑就清楚了。

### 5.1 Segment 是 Compaction 的统一操作对象

四种 compaction，操作对象都落在 Segment 上：

| Compaction 类型 | 操作的 Segment |
|----------------|---------------|
| L0DeleteCompaction | L0（输入）+ L1/L2（被应用 delta） |
| MixCompaction | 多个 L1 segment 合并 |
| ClusteringCompaction | L1 → L2（按聚类键重分布） |
| SortCompaction | 单个 segment 内部按 PK 排序 |

通用 compaction 路径的 segment 过滤条件（`compaction_util.go:108-113`）能看出层级分工：

```
return isSegmentHealthy(segment) &&
    segment.GetState() == commonpb.SegmentState_Flushed &&
    segment.GetLevel() != datapb.SegmentLevel_L0 &&  // L0 有独立策略
    segment.GetLevel() != datapb.SegmentLevel_L2     // L2 有独立策略
```

通用路径只处理 **L1 Flushed segment** ，L0 和 L2 各有独立的 policy。分层的好处就在这里 - 不同生命周期的数据，走不同的合并策略，互不干扰。

### 5.2 L0 查询时的特殊处理

L0 的特殊性还体现在查询加载阶段。`handler.go:360-371` 里，segment view 的分类逻辑把 L0 单独拎出来：

```
switch {
case s.GetState() == commonpb.SegmentState_Dropped:
    droppedIDs.Insert(s.GetID())
case s.GetState() == commonpb.SegmentState_Importing:
    importingIDs.Insert(s.GetID())
case s.GetLevel() == datapb.SegmentLevel_L0:
    levelZeroIDs.Insert(s.GetID())   // L0 单独归类
case s.GetState() == commonpb.SegmentState_Growing:
    growingIDs.Insert(s.GetID())
default:
    flushedIDs.Insert(s.GetID())
}
```

L0 被归到 `L0SegmentIDs`，查询节点（QueryNode）需要 **额外加载 L0 的 deltalogs** ，用来在查询结果里过滤掉已删除的 PK。

这也回应了文章开头那个现象 - **删除多了查询会变慢** ：L0 积压越多，查询时要扫描的 deltalogs 越多，过滤开销越大。直到 L0 compaction 把 delta 合并进 L1/L2 的 deltalogs（这部分会被索引加速），开销才会降下来。

### 5.3 GC 的安全距离

再说一个容易漏掉的细节 - Dropped segment 不会立即物理删除。`garbage_collector.go:767-820` 的 `recycleDroppedSegments` 要确认两件事：

- 该 segment 被 compaction 出的目标 segment（`compactTo`） **已经建好索引**
- 目标 segment **未被任何 QueryNode 加载**

这个 **安全距离** 是为了防止一种事故：源 segment 的 binlog 删了，但目标 segment 还没建好索引或没加载完，查询直接失败。

**用空间换可靠性** - 老数据多留一会儿，等新数据完全顶上再删。

### 5.4 顺手纠正一个猜测

调研时我一度以为 `copy_segment` 系列（`copy_segment_meta.go` 等）和负载均衡或故障恢复有关。

翻开源码注释（`copy_segment_meta.go:34-51`）才发现猜错了：

```
// This file implements the metadata management layer for copy segment jobs and tasks
// during snapshot restore operations.
```

它是 **snapshot restore（快照恢复）** 场景，跟负载均衡没关系。读源码最大的好处就是能戳破这种想当然 - 文档不会专门告诉你某个模块"不是干什么的"，但源码注释会。

## 6. 几个值得记住的设计取舍

| 设计选择 | 解决的问题 | 引入的代价 |
|----------|------------|------------|
| L0 单独一层存 delta | 删除消息不用在成百上千个 segment 间路由 | 查询时要额外加载 L0 deltalogs 过滤，删除多了变慢 |
| L0 直接 Flushed | 中转站不需要 Growing 阶段 | 创建路径和 L1 完全不同，理解成本高 |
| sealByBlockingL0 强制封口 | 保证 L0 删除能收敛 | 牺牲正在写入的 growing segment 的吞吐 |
| LastLevel 回滚字段 | Clustering 失败时 level 能恢复 | 多一个字段，meta 复杂度上升 |
| GC 安全距离 | 防止删早了导致查询失败 | 老 binlog 多占存储空间 |

## 7. 演进还在继续

源码里有几个信号说明 Segment 的演进没停：

`data_coord.pb.go:1330` 里，`SegmentIDRequest.Level` 字段标记了 `deprecated`。对应的 `AssignSegmentID` RPC（`data_coord.proto:39-41`）也标了 `option deprecated = true`，被新的 `AllocSegment` 取代。

换句话说，Segment 分配的对外接口本身也在重构 - 旧的 **按 level 分配** 的 RPC 语义正在被新的接口替换。

结合 design docs 的时间线看（2021 年的 flush 机制、2026 年的 segment 加载管线和 PK 谓词裁剪），Segment 这个核心概念仍然在快速演进。

读 Milvus 源码最直接的感受是： **它没有一上来就把设计做"对"，而是边跑边改** 。

`max_row_num` 从估算行数改成二进制大小，L2 从中间态标记退化成产物标签，Level 字段标记 deprecated 引入新 RPC。每一处 deprecated、每一个 v2.4 vs v2.5 的注释，都是真实工程演进的脚印。这些脚印反过来也说明一件事 - 这套系统是真的被生产环境磨过的，不是 PPT 里画出来的架构。

下一篇准备聊聊 Segment 加载管线（load-segment-pipeline），也就是这些 segment 从对象存储跑到 QueryNode 内存里 querying 的那段路。

QueryCoord 的 Target vs Distribution 模型、2.5 和 2.6 加载流程的差异，都藏在那条 design doc 里。

**好啦，谢谢你观看我的文章，如果喜欢可以点赞转发给需要的朋友，我们下一期再见！敬请期待！**
