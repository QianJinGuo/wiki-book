# Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads

## Ch11.024 Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads

> 📊 Level ⭐⭐ | 16.8KB | `entities/netflix-cassandra-wide-partition-dynamic-splitting.md`

# Dynamically Splitting Wide Partitions in Cassandra for Time Series Workloads

> Netflix Tech Blog 2026-06-03 工程实践：解决 Apache Cassandra 4.x 在 PB 级时序数据上 wide partition 问题的完整方案。从 `nodetool tablehistograms` 的 percentile 检测 → DynamicTimeSliceConfigWorker 自动调整 time_bucket → **async 动态分区管道（Detection / Planning & Splitting / Serving Reads）** 在 TimeSeries ID 粒度上做细粒度拆分，附 Decision Tree（Partial Return / Block ID / Dynamic Split）。

## 背景：Wide Partition 的代价

Netflix TimeSeries Abstraction 每天摄入 PB 级时序事件数据，依赖 Cassandra 4.x 作为底层存储。理想读延迟为**个位数 ms**，但当 partition 增长过宽时：

- 读延迟在 tail 处飙升至**秒级**
- 触发读超时
- 极端情况：GC pause、CPU 高占用、thread queueing

简单地扩容集群能解决但成本过高，需要更智能的策略。

## 基础策略：Time Slices × Time Buckets × Event Buckets 三层分片

TimeSeries Abstraction 把数据分成**离散 time chunks**：
- **Time Slice**：每个数据集按时间窗口切分（每个 Time Slice 一个独立 Cassandra table）
- **Time Bucket**：每个 Time Slice 内按时间桶切分（默认 60s）
- **Event Bucket**：每个 Time Bucket 内再切分（控制单个 partition 大小）

这种分层结构还支持基于时间的高效查询与数据 drop（避免 tombstone 累积）。

## 现有方法的局限

Netflix 的 capacity-modeling pipeline 会基于用户输入（工作负载特征）+ Monte Carlo 仿真生成最优分区配置。但**三种场景下失效**：

1. **工作负载未知或估计不准** — 项目早期缺乏可靠生产流量画像
2. **工作负载随时间演化** — Day 1 的好策略几个月后失效
3. **数据 outliers** — 少数 TimeSeries ID 接收的事件量远高于其他

幸运的是，discrete Time Slices 的设计提供了"逃生通道"——每个新 Time Slice 可以采用不同分区策略。但**手工调整数千个数据集不现实**，需要自动化。

## 解决方案 1：Time Slice Re-Partitioning（表级自动调整）

**检测**：使用 Cassandra 内置的 `nodetool tablehistograms` 暴露 partition size 的 percentile 分布。Netflix 在后台加了一个 worker，监控挂载到特定 application 的 Time Slices 的 partition histograms，通过 Cassandra virtual table 暴露。

**调整**：worker 计算 adjustment factor，当检测到 partition size 不在配置密度范围（通常 2-10 MiB）时触发：
```
DynamicTimeSliceConfigWorker:
  namespace: my_dataset_1
  Observed: TimeSlices have p99 partitions below configured target of 10MB.
  Proposed: time_bucket interval: 60s -> 604800s
```

**执行**：worker 更新**未来**的 Time Slices 使用新分区策略。

**收益**：显著降低 tail latency、减少由 thread queueing 引起的超时。

**局限**：仅当**整张表**的数据都表现出需要重新分区的特征时才有效。**只对部分 ID 宽的表无效**。

### 当 Partial ID 宽时，三个备选

| 方案 | 适用 | 副作用 |
|------|------|--------|
| **Do Nothing** | 对应用顶层指标无影响时 | — |
| **Partial Returns** | 客户端更关心延迟而非拿全数据时 | 在配置 SLO 内做"够用就好"的截断 |
| **Block IDs** | 测试/垃圾 ID 偶尔破坏系统稳定性时 | 极端方案 |

**Partial Return** 是 Netflix 实现的折中：若 in-flight 请求超过 SLO 就 abort，返回**截至当前已收集的数据**。在 SLO 截止线附近 tail latency 显著下降。

## 解决方案 2：Dynamic Partitioning per ID（核心创新）

针对"部分 ID 宽但数据有效且必须查询全部"这一最难场景，Netflix 设计了**异步管道**在 TimeSeries ID 粒度上做动态分区。

**3 个 stage**：

### Stage 1: Detection
- 每次 TimeSeries 读操作追踪 partition 读取字节数
- 超过阈值时向 Kafka 发 detection event：
  ```json
  {
    "time_slice": "data_20260328",
    "time_series_id": "profileId:123",
    "time_bucket": 7,
    "event_bucket": 2,
    "immutable": true,
    "version": "0"
  }
  ```
- **为什么在 read 而非 write 时检测**：观察发现大部分数据不需要此处理；在 read 时检测的轻微代价是这些宽 partition 的某些读可能"在数秒内"性能欠佳，直到 split 赶上

### Stage 2: Planning & Splitting
- **Immutability 优先**：splitting mutable partition 在本质上更复杂，Netflix 选择**先聚焦 immutable partition**（数据已停止写入），以最小化改动范围同时显著减少 caller 超时
- 检测可能基于 partial read，planner **必须完整读一次 partition** 才能算出准确 split plan
- **Checkpointing 关键**：planning read 失败时可以从最后一个 checkpoint 继续

### Stage 3: Serving Reads
- 透明地将读查询重路由到 split 后的 partition
- 对调用方完全无感

## 三个独有贡献

1. **Decision Tree 清晰化** — 不只描述"宽 partition 怎么办"，而是给出 3 级 fallback：①表级 Re-partitioning → ②Partial Returns 截断 → ③Block IDs 极端处理 → ④Dynamic Split per ID。每个层都有明确的适用边界
2. **基于 read 路径的 detection 设计哲学** — "为什么不在 write 时检测"被清楚解释（数据分布偏斜：多数 ID 不需要此处理），并明确说出代价（数秒内 sub-optimal read 性能）
3. **Immutability-first 渐进式方案** — 不试图一次性解决 mutable partition 的复杂性问题，而是**先在 immutable 子集上验证**整个管道，再扩展。这是大规模系统迁移的经典工程权衡

## 适用场景

- Cassandra 用户遭遇 wide partition 性能问题，需要自动化修复
- 时序数据存储的 partition strategy 动态调整
- 大规模分布式系统中"渐进式引入复杂特性"的工程模式参考

## 关键概念参考

| 概念 | 作用 |
|------|------|
| Time Slice | 每个数据集按时间窗口切分的独立 table |
| Time Bucket | Time Slice 内的时间桶（默认 60s） |
| Event Bucket | Time Bucket 内的二次切分 |
| Wide Partition | 单一 partition 内行数过多（数万+） |
| Tombstone | Cassandra 删除标记，累积影响读性能 |
| `nodetool tablehistograms` | Cassandra 内置 partition size percentile 工具 |
| Virtual Table | Cassandra 暴露内部状态的只读视图 |
| DynamicTimeSliceConfigWorker | Netflix 后台分区调整 worker |
| Partial Return | 超 SLO 时返回部分数据的降级策略 |

## 深度分析

### 1. 分层决策树的价值：从"一刀切"到精确匹配场景

Netflix 方案最核心的价值不是任何一个单点技术，而是**决策树的完整性**。在 wide partition 问题上有四种不同性质的工具——Do Nothing、Partial Returns、Block IDs、Dynamic Split——每种工具对应不同的触发条件和副作用。

这个决策树的设计哲学是：**用最便宜的手段解决问题，不到必要时候不用复杂方案**。Do Nothing 在应用指标不受影响时是完全合法的选择；Block IDs 是极端场景下的"保险丝"；只有当数据有效、必须全量读取、且 ID 级别宽时，才动用 Dynamic Partitioning per ID。这避免了用原子弹打蚊子的过度工程。

### 2. Read-Path Detection 的反直觉设计：为什么在读端检测而非写端

大多数工程师直觉上会认为"应该在写入时检测 partition 宽度"，这样可以尽早干预。但 Netflix 明确选择**在 read path 上检测**，理由是数据分布的偏斜性质：大多数 TimeSeries ID 不需要此处理，只有少数 outlier ID 会变宽。

这个决策有深层含义：
- **写入时检测的代价更高**：写路径引入额外开销会影响所有写入，而 wide partition 在写入时并不明显（写入总是成功的）
- **读取时检测的代价是局部的**：只有已经被检测为宽 partition 的读会短暂sub-optimal，直到 split 赶上
- **写入放大了问题**：如果每个写都做 partition 宽度检测，热点 ID 的写入延迟会系统性偏高

这是典型的**成本-效益分析驱动的架构决策**：不是"技术上能做什么"而是"做什么代价最小且足够有效"。

### 3. Immutability-First 的工程节奏：减少变更表面积

Mutable partition 的 split 在工程实现上远比 immutable partition 复杂，因为需要处理并发写入、 partial split 状态下的数据一致性、以及 split 失败后的回滚。Netflix 选择**先在 immutable 数据上验证整个管道**，再考虑扩展到 mutable 场景。

这种工程节奏的好处是：
- **单一问题域**：团队只需要调试 partition split 本身的逻辑，而不需要同时处理并发写入的边界情况
- **可验证性**：immutable 数据 split 后可以通过 checksum 和 Data Bridge 做离线验证，不需要担心新写入的数据是否受影响
- **渐进信心建立**：通过 phased rollout（Shadow Mode → Comparison → Full Rollout）逐步建立对系统的信心

### 4. Bloom Filter 的轻量化路由：microsecond 级无感知 Diversion

在 Serving Reads 阶段，Netflix 使用 Bloom Filter 判断一个读请求是否需要路由到 split partition。Bloom Filter 的查询延迟是"个位数 microseconds"级别，使得这个 diversion 过程**对调用方完全无感**。

这说明了一个重要的工程原则：**在 critical path 上的决策必须极快**。如果每次 diversion 检查需要毫秒级延迟，累积起来就会成为新的瓶颈。Bloom Filter 在这里扮演的角色是"零成本决策"——绝大多数读请求（Bloom Filter miss）完全不受影响，只有被检测为宽 partition 的读才会走额外的 metadata lookup，而 metadata lookup 本身也有 read-through cache 加速。

### 5. Checksum 校验 + Data Bridge 离线验证的双重保险

Split 有效性的验证用了两层机制：
- **Planner pre-split checksum vs Splitter post-split checksum**：split 标记为 COMPLETED 前必须两次 checksum 匹配 
- **Data Bridge Spark Job 离线全量比对**：确保 split 后的数据和原始数据完全一致

这种设计处理了 Cassandra eventual consistency 的边界情况：即使 split 过程本身是原子的，Cassandra 的副本同步机制也可能导致不同副本在不同时间看到不同的数据状态。两层校验确保了无论 Cassandra 内部如何同步，最终读到的数据都是正确的。

## 实践启示

### 1. 监控 partition size percentile 而非平均值：p99 是核心指标

Wide partition 问题的本质是**尾延迟**，平均值掩盖了真实问题。Netflix 使用 `nodetool tablehistograms` 的 percentile 分布来判断是否需要 re-partitioning——特别是 p99 而不是平均值。

对于运行 Cassandra 集群的团队，这意味着：
- 告警阈值应该基于 p99 partition size 而不是平均值
- 目标 partition density（2-10 MiB）是针对 p99 设立的，而非中位数
- 如果 p99 超出目标范围，即使平均值看起来健康，也应该考虑调整 time_bucket interval

### 2. 设计 SLO-aware 的降级策略：Partial Return 优先于全局超时

当 wide partition 导致 tail latency 飙升时，一种有效的折中方案是**在 SLO 边界主动降级**：当请求耗时超过配置 SLO 时 abort 并返回已收集的数据。这比让请求超时更优，因为：
- 客户端可以在配置 SLO 内收到"够用"的数据
- 减少了 Cassandra 侧的 thread queueing 和 GC pressure
- 实现上只需要在读路径上加一个超时 check，不需要复杂的 split 逻辑

### 3. Checkpointing 是长时间 Running 任务的命脉

Planning & Splitting 阶段需要完整读一次 partition 来计算 split plan。如果 partition 很大（GB 级），这个过程可能很慢且可能失败。Netflix 的解决方案是**定期保存 checkpoint**，失败后可以从最后一个 checkpoint 继续而不是从头开始**。

这个原则适用于所有长时间运行的异步任务：
- 任务必须能够从部分完成状态恢复
- Checkpoint 应该保存在可靠的外部存储（如 Cassandra metadata table），而不是内存
- 两次 checkpoint 之间的数据量要控制，确保失败后重做的代价可接受

### 4. 分阶段 Rollout + Shadow Mode 是高风险特性的必备工程实践

Netflix 在 Serving Reads 的新路径上采用了**四阶段 rollout**：Shadow Mode → Comparison → Partial Rollout → Full Rollout。每个阶段都有明确的通过条件。

Shadow Mode 下新旧路径**同时运行**，对比两者的 bytes served 是否一致。这比直接 full rollout 安全得多——如果新路径有 bug，Shadow Mode 下不会影响实际调用方。这套工程实践对于任何**涉及数据一致性的高风险变更**都适用，尤其是：
- 数据库 schema 变更
- 分布式系统中数据 partition/rebalance 逻辑
- 任何会改变数据读取路径的优化

### 5. 不要删除原始 partition：为 partial failure 留安全垫

Netflix 的 fallback 设计中有一条重要规则：**原始 wide partition 永远不删除**。这在 split 过程中出现 partial failure 或 eventual consistency 边界情况时，允许调用方回退到原始路径读取完整数据。代价是多占用一些存储空间，但换来了**运营上的安全保障**。

这个权衡值得记住：当需要同时保证**数据可用性和正确性**时，保留冗余路径是值得的。删除原始数据的"清理"诱惑可能在分布式系统的一致性边界上造成难以排查的问题。

## 来源

## 相关实体
- [Vietnam To Develop Domestic Cloud So It Can Ditch Risky Overseas Operators For G](ch11/184-vietnam-to-develop-domestic-cloud-so-it-can-ditch-risky-over.html)
- [Vietnam Domestic Cloud](https://github.com/QianJinGuo/wiki/blob/main/entities/vietnam-domestic-cloud.md)
- [Every Ai Subscription Is A Ticking Time Bomb For Enterprise](../ch01/1041-every-ai-subscription-is-a-ticking-time-bomb-for-enterprise.html)
- [Toto 2](ch11/154-toto-2-context-aware-log-analytics-for-complex-distributed.html)
- [Vietnam To Develop Domestic Cloud So It Can Ditch Risky Overseas Operators For Government Workloads](ch11/184-vietnam-to-develop-domestic-cloud-so-it-can-ditch-risky-over.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dynamically-splitting-wide-partitions-in-cassandra-for-time-.md)

---

