# Write-Ahead Intent Log: a Foundation for Efficient CDC at Scale

> 📊 Level ⭐⭐⭐ | 8.7KB

→ [原文存档](https://www.infoq.com/presentations/write-ahead-intent-log/)

## 摘要

DoorDash 的 Storage & Streaming Infrastructure 团队长期用传统 CDC（以 Debezium 为代表）在异构数据库之间同步变更，但在高峰期订单流量下这套模式触到了扩展上限，dual write 与轮询数据库之类的替代方案同样脆弱。他们最终自建了 Write-Ahead Intent Log（WAIL），用 "dumb producer proxy + smart consumer" 把 intent（应用原本想做什么）与 state payload（变更后的行状态）干净地拆开，使消费者能高效重建并应用变更。本页整理该演讲的问题背景、架构取舍与落地关注点。

## 核心要点

- **CDC 对 DoorDash 是地基而非加分项**：下单、改单、取消、送达都要在瞬间通知几十个下游系统；搜索、缓存等派生存储必须与 source-of-truth 数据库保持一致，数据一陈旧业务就开始失真。
- **传统 CDC 是成熟但强耦合的模式**：application → 数据库 → connector → Kafka → consumer 这条链路被验证过，但它把业务系统紧绑到数据库内部实现上，schema 变更打断 connector、下游同步变慢，整条管道一起缠死。
- **dual write 的诱惑与代价**：写库的同时再发一条事件，看起来简单，但任一边失败就会出现两个"真相"；轮询数据库也不是答案——它给数据库加负载、天然滞后，等你发现时已经很晚。
- **Debezium 在高负载下的失效是转向自研的直接动因**：演讲明确说明传统 CDC 方案在峰值流量下触到极限，团队于是决定不再倚靠现成 CDC。
- **核心架构取舍是 dumb producer proxy + smart consumer**：写入侧保持"笨"（代理不做业务逻辑），把理解与重组变更的智能全部推到消费侧。
- **intent 与 state payload 分离**：消费者拿到的是"应用意图"，而不是需要反向推断业务含义的数据库行镜像，因此能更高效地重建并应用变更。
- **结论是 "it's not about the state, it's about the intent"**：保证意图按顺序流过整条链路才是关键，其余都只是 plumbing。
- **难点的根在异构环境**：每个数据库有各自的 CDC dialect（如 Postgres 的 logical replication 与 Cassandra 类系统各不相同），叠加自研搜索 / 缓存系统、connector 断裂、sink 宕机以及各团队重复自建 outbox pattern，才让规模化同步难以运营。

## 深度分析

### 为什么不是"加机器"就能解决的 CDC 问题

演讲描述的失败场景不是吞吐不够，而是拓扑脆弱。真实订单流高度编排：订单落到订单库、餐厅被通知、骑手被派单、App 立即刷新；任何一个信号丢掉，整串步骤就可能失去同步——订单还在库里，餐厅却从没收到通知，配送也没派出去，用户只能盯着 processing spinner。

"加机器"无解的地方在于，传统 CDC 的故障点分布在 connector、sink、schema 变更与下游同步速度上，不随算力线性放大：schema 变更会打断 connector，下游变慢会让管道打结。团队于是被迫在两种坏方案之间选——dual write 分叉出两个真相，轮询给数据库加压且总是滞后。问题的本质是耦合与语义，不是容量。

### intent 与 state 分离：WAIL 的核心抽象

传统 CDC 表达的是 **state**：某一行变成了什么样，消费者再去猜这变化对应业务上的哪件事。WAIL 表达的是 **intent**：应用这次原本想做什么。差别不是格式而是责任归属——把"业务含义"留在产生处，而不是让每个下游各自反解。

这与 outbox pattern 有亲缘关系：演讲提到团队经常自建 transactional table + outbox table 来通知下游发生了哪些变更，若平台已有 CDC 能力本可少写这套样板。WAIL 把"显式记录意图"提升为一等基础设施，而不是每个业务团队各自的补丁。

### dumb producer proxy + smart consumer 的职责划分与代价

WAIL 把复杂度集中到一侧：producer 侧是一个"笨"代理，只把 intent 可靠地写进日志，不做业务判断；consumer 侧"聪明"，负责理解 intent 并重建 / 应用状态变更。这样高峰期最不能出事的写入路径逻辑最薄、故障面最小、行为最可预测，而所有可以离线推理、可以重放、可以慢慢修的逻辑都留在消费侧。

代价同样清楚：复杂度不会消失，只会转移。消费者必须自己处理重放、幂等与顺序；intent 需要被上游当成正式事件模型来设计，而不是顺手的副产品；消费侧逻辑写错，影响面是整条下游。演讲把 WAIL 描述为让系统更 durable、更 visible、更 recoverable 也更少痛苦的方向，而这一收益的前提正是消费侧把重放与恢复能力做实。

### 从 CDC 到意图流的语义升级与实际约束

"从 state 到 intent"是一次语义升级：正确性判据从"行镜像是否一致"变成"意图是否按序流过全部系统"。这也解释了下游为何能更实时、更不易失真——下游不必再理解数据库方言与表结构细节，只需理解意图。

约束也在同一处：意图流要求一个统一的写入抽象层。演讲中 Akshat Goel 所在的 Storage Access Platform 就是这样的统一抽象层，覆盖所有 online data store；没有这层，各数据库运行机制的差异（Postgres 的 logical replication 等各自的 CDC dialect）会重新泄漏到每个消费者身上。相关印证可参见 [Fintech Engineering Handbook](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fintech-engineering-handbook.md)（CDC 直读日志、不丢变更，却让事件形状贴着数据库内部、带来耦合与运维重量）、[Kafka 原生入湖（CDC/Upsert）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-kafka-iceberg-zero-etl-architecture-subtraction-2026-06-18.md) 与 [Zepto 的 Debezium at Scale](https://github.com/QianJinGuo/wiki-public/blob/main/entities/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story.md)——两者都显示 Debezium 事件还需 Flatten / Upsert 之类转换才能被下游消费。

## 实践启示

1. **先量化 CDC 瓶颈再动架构**：区分是 connector 断裂、下游变慢还是 schema 变更引发的耦合故障，只有确认结构性问题，自研意图日志才划算。
2. **把"意图"作为一等事件建模**：不要只导出行镜像让每个下游反解业务含义；在使用点记录意图，比在消费点猜意图更便宜、更不易分叉。
3. **写入端保持无逻辑以降低故障面**：dumb producer proxy 的价值是在高峰流量下保持可预测、小故障面，让不可靠逻辑远离最关键的写入路径。
4. **消费者侧显式设计幂等与重放**：smart consumer 承接全部复杂度，必须能重放、能恢复、能容忍重复与乱序，否则意图流只是把事故从入口搬到出口。
5. **先投统一数据访问抽象层**：每个数据库一套 CDC dialect 是硬约束，统一抽象层把这部分差异一次性收敛，是前置投入而非可后补的优化。
6. **用用户可见后果倒推一致性 SLA**：一条丢失的更新会变成退款、客服升级与不满意的客户，时延与可靠性指标应由业务后果定义，而非基础设施指标。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

