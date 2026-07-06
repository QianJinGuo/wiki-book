---
sha256: 04e2b7156ea99e5289ba8bc49fa0535c1467dcaa7d45f00d5c85fa12d342ac70
source: "https://mp.weixin.qq.com/s/7wg1gUZZg08OoozBMebcHg"
title: "AI 时代，实时入湖正在告别 ETL：从 Kafka 到 Iceberg 的架构减法"
author: 阿里云开发者
publisher: 阿里云开发者
date: 2026-06-18
type: article
ingested: 2026-06-18
review_value: 9
review_confidence: 9
review_recommendation: strong
review_stars: 4
---

# AI 时代，实时入湖正在告别 ETL：从 Kafka 到 Iceberg 的架构减法

> 作者：阿里云开发者 · 发布：2026-06-18 14:33

## 摘要

在 AI 驱动的数据应用场景中，企业越来越需要一套同时支撑实时消费、历史沉淀与多引擎复用的数据底座。Kafka、Iceberg 开放表格式与对象存储的组合，正成为流数据入湖的重要方向。

本文围绕"**零 ETL**"这一趋势，讨论流数据入湖为什么需要做架构减法，并结合 **Kafka × Table Bucket** 的实践，分析一种将通用入湖能力前移到消息与表存储链路中的方案，如何在降低复杂度的同时，兼顾实时性、一致性、Schema 演进、CDC 语义与开放生态兼容。

## 一、AI 时代为什么要做架构减法

### 实时与历史的双重诉求

- 实时需求（模型训练/特征工程/在线推理/经营分析/风控审计）→ 低延迟 + 持续处理
- 历史需求 → 低成本 + 可治理 + 多引擎复用
- **两类需求在同份数据上同时实现 → 数据必须在更短链路上完成接入、沉淀、复用**

### 演进路径

传统离线数仓 → 实时数仓 → 流批并立 → **统一数据湖 + 开放表格式**

### 实时入湖 4 大趋势

1. **开放格式优先**：Iceberg 凭借开放元数据标准 + 多引擎兼容 + Schema 演进能力，成为开放表格式核心选项
2. **零 ETL 诉求**：消息系统更直接将数据持久化为开放表格式
3. **存算分离深化**：Kafka 存储层 + 数据湖存储层都向存算分离演进
4. **Serverless 化**：流处理与消息服务按需计费，降低运维门槛

### Kafka 入湖三大阵营（核心对比表）

| 阵营 | 代表产品 | 核心思路 | 价值 | 限制 |
|---|---|---|---|---|
| **原生集成** | Confluent Tableflow、Redpanda Iceberg Topics | Broker 层直接将 Topic 数据物化为 Iceberg 表 | 架构简洁、零 ETL、延迟低 | Vendor lock-in 风险高，需额外存储/管理费用 |
| **Connector / ETL** | AWS MSK Connect + Iceberg Sink、开源 Kafka Connect Iceberg Sink | 通过 Connector 从 Kafka 消费并写入 Iceberg | 灵活可控、开源生态丰富 | 运维复杂、延迟高、exactly-once 难保证 |
| **生态平台** | Databricks、Snowflake | 平台自身集成能力将 Kafka 数据摄入 Lakehouse | 与分析引擎深度集成 | 锁定特定格式（Delta Lake）或平台，开放度不足 |

**架构理念**：原生集成阵营更贴近"零 ETL"——将通用入湖能力前移到更靠近消息主链路的位置。**但要求开放性与中立性**。

### 真正困难的，不是"能写"，而是"持续稳定地写"

- **小文件/分区失衡/元数据膨胀/写放大/Compaction 压力**
- **Schema 演进**：上游字段变化、类型变更、CDC 语义与表格式 Schema/一致性/事务的碰撞
- **Update/Delete 表达**、**写入失败后如何恢复**

## 二、从外部 ETL 到零 ETL：减掉了什么

### 传统链路

```
Kafka → Flink / Spark Streaming → 开放表 → 对象存储
```

### 减掉的三类系统复杂度

1. **系统边界增加**：数据从 Kafka 流出，再由外部任务消费/转换/写入/提交，跨越独立运行时和独立调度
2. **通用能力重复实现**：消息解码/Schema 映射/位点管理/事务提交/小文件控制/失败恢复，每条 ETL 都要实现
3. **平台成本持续上升**：流计算集群、监控、发布、排障

### 零 ETL 真正减掉什么

- 一层额外的数据搬运链路
- 一批重复实现的工程逻辑
- 一部分与业务价值无关的运维复杂度

**核心是"架构思路变化"**：把通用入湖能力尽量收敛为基础设施的内建能力 → "零代码、配置即生效"。

## 三、Kafka × Table Bucket 的零 ETL 入湖

### Table Bucket 定义

对象存储上的**表承载能力**——不是简单把文件写入对象存储，而是以**表的方式组织、管理与提供数据**。

### 3 层架构

| 层级 | 职责 |
|---|---|
| **协议接入层** | 兼容标准 Kafka Producer / Consumer 协议 |
| **转换处理层** | 格式转换、Schema 感知、CDC 解析、分区路由 |
| **表存储层** | 表写入、元数据管理、对象存储落盘、后台优化 |

**vs 传统三段式**：转换引擎与表写入**内嵌**到更靠近 Broker 的执行链路，**减少网络往返、独立调度、ETL 集群复杂度**。在部分实现中，数据从 Kafka 分区到 Iceberg 表的转换**在同一进程内完成**。

### 核心数据流：3 阶段端到端

**第一阶段：记录转换**（RecordProcessor）
- Key/Value 反序列化、Transform 链处理、记录组装
- 支持 String / Avro Registry / Protobuf
- 通过 Flatten / Debezium 转换链展开嵌套结构 / 解包 CDC 事件

**第二阶段：Schema 感知与演进**
- 比较当前 Schema vs 目标表 Schema
- 兼容性变更自动处理
- 写完再应用新 Schema

**第三阶段：Iceberg 写入与事务提交**
- **Append 模式**：PartitionedWriter/UnpartitionedWriter 直接追加
- **Upsert 模式**：生成 DataFile（数据）+ DeleteFile（删除标记），支持 Insert/Update/Delete
- 文件达到阈值（如 **64MB**）自动切换新文件
- **表级事务原子提交** → 新 Snapshot → 下游一致可见

### 关键能力

#### 兼顾低延迟与强一致

- **存算分离 × 轻量化 HA**：计算与持久化解耦，Follower Replica 仅作计算热备
- **双路同步缓解"延迟-吞吐"权衡**：
  - 增量预同步（提交间隙持续完成读取/转换/写入）
  - 强一致同步触发时只需提交少量增量
- **入湖进度内聚于 Leader 元数据**：去除外挂 KV 等外部系统依赖
- **嵌入式 vs 独立式双模式**：嵌入式低资源开销但 GC 压力；独立式进程隔离但资源成本高

#### Schema 自适应演进

| 演进类型 | 含义 | 处理策略 |
|---|---|---|
| **ADD_FIELD** | 新增可选字段 | 自动应用 |
| **MAKE_OPTIONAL** | 必填字段变为可选 | 自动应用 |
| **PROMOTE_TYPE** | 类型向上提升（int → long、float → double） | 自动应用 |
| **嵌套递归演进** | Struct 等嵌套结构中递归处理 | 自动应用 |
| **删除字段 / 复杂结构重组** | 不兼容变更 | **保守拒绝**，避免一次上游变化中断整条链路 |

#### 多层小文件治理

| 层级 | 阶段 | 典型粒度 | 作用 |
|---|---|---|---|
| L1 | 内存 Buffer 合并 | 行级 | 在内存中聚合小批次，避免立即落盘 |
| L2 | 微批处理 | **32MB** | 控制单次 flush 的批次规模 |
| L3 | 目标文件大小控制 | **64MB** | 写入引擎层面控制文件大小阈值 |
| L4 | 后台 Compaction | 文件级 | 异步合并小文件，不占用计算侧资源 |

通常 L1~L3 入湖引擎侧完成，L4 后台离线 Compaction 承担。

#### 智能分区策略（7 类）

```yaml
# 按地区 + 天双维分区
partition_by: "region, day(timestamp)"

# 高基数 ID 哈希分桶
partition_by: "bucket(user_id, 10)"

# 邮箱前缀归类
partition_by: "truncate(email, 5)"
```

支持：字段直接分区 / Year / Month / Day / Hour / Bucket / Truncate

#### 完整 CDC / Upsert 支持

```yaml
# CDC 入湖典型配置
transforms: debezium_unwrap
write_mode: upsert
table_format: iceberg-v2
```

- 原生集成 Debezium 解包
- 借助 Iceberg **Equality Delete** 机制生成数据文件 + 删除标记
- 读取阶段自动合并为最新视图

#### 多 Catalog API 兼容

- **Iceberg REST Catalog**（开放生态主流标准）
- **OSS Tables 兼容 Catalog**（面向 S3 Tables 迁移场景）
- 下游引擎：Spark / Trino / Flink / DuckDB 都能围绕同一份数据

## 四、AI 时代的数据基础设施价值

### 协议与格式的深度融合

3 大变化：
1. **流批自动转换**：数据写入即入湖，天然支持流读与批读，无需两套代码路径
2. **Schema 自适配**：自动感知 ADD_FIELD / MAKE_OPTIONAL / PROMOTE_TYPE + 嵌套结构递归演进
3. **进程内绑定调度**：转换引擎与 Broker 进程内联 → 数据可见性收敛到**分钟级**（条件合适时逼近秒级）

### 更低成本与更强稳定性

- 零 ETL 轻量化架构打通 Kafka 流式协议与 Iceberg 表格式，减少 Flink/Spark 中间任务
- 多层小文件治理：内存 Buffer 合并 → 32MB 微批 → 64MB 目标 → 后台 Compaction
- **更低 TCO**：成本结构更接近"Kafka + 对象存储"二元组合（vs 传统 "Kafka + ETL + 对象存储" 三重）
- 更稳定生产表现：进度内聚、轻量 HA、事务提交、托管化恢复

### 传统 vs 零 ETL 对比表

| 维度 | Kafka + Flink/Spark + Iceberg | Connector / ETL 方案 | Kafka × Table Bucket（零 ETL） |
|---|---|---|---|
| **架构复杂度** | 高（三段式 + 独立调度） | 中（Connector 集群） | **低（单链路内聚）** |
| **开发成本** | 高（Streaming SQL/Code） | 中（Sink 配置） | **低（声明式配置）** |
| **Schema 演进** | 依赖人工或外部框架 | 部分支持 | **平台内建自动演进** |
| **小文件治理** | 业务自行处理 | 部分支持 | **多层递进式内建治理** |
| **Exactly-Once** | 需要业务保证 | 配置复杂 | **进度内聚 + 事务提交** |
| **运维成本** | 三重成本 | 双重成本 + 集群运维 | **接近二元成本结构** |
| **复杂流计算** | ✅ 强项 | ❌ 不适合 | ❌ 不适合 |

**清醒判断**：零 ETL ≠ 取代复杂流计算引擎。窗口聚合/多流 Join/维表关联/复杂事件处理/大规模状态管理 → 仍需 Flink / Spark Streaming。**两者是分工，不是替代**。

## 五、4 类优先受益场景

### 1. 实时日志分析

```yaml
partition_by: "day(timestamp), service_name"
write_mode: append
target_file_size: 64MB
```

应用/访问/安全/系统日志 → Filebeat/FluentBit → Kafka → Trino/Spark 直接查询。**写入持续、查询维度稳定、保留周期长**。

### 2. 数据库变更实时入湖

```yaml
transforms: debezium_unwrap
write_mode: upsert
table_format: iceberg-v2
```

MySQL Binlog / PostgreSQL WAL → Debezium → Kafka → Iceberg Upsert/Delete → 接近实时呈现当前业务状态。**关键价值**：保留主键/删除语义/可查询的当前视图。

### 3. IoT 多源数据汇聚

```yaml
# 高吞吐、时序化场景的组合分区
partition_by: "bucket(device_id, 50), day(timestamp)"
```

4 个共同特征：吞吐高 / 来源多 / 字段变化频繁 / 历史保留需求强。下游：Spark 大规模分析 + DuckDB 轻量查询。

### 4. AI 多模态训练数据 Pipeline

**依托阿里云 OSS「对象 + 向量 + 表格」完整数据存储体系**：
- 路测原始数据 → **OSS 对象桶**
- Embedding + 召回索引 → **OSS 向量桶**
- Kafka 实时采集的车辆标注信息、传感器元数据 → **OSS Table Bucket**

三桶数据共享同一套账号、权限、审计体系，训练样本筛选与版本回溯可在单一平台完成，**数据准备效率提升数倍**。

## 六、结语：告别 ETL 本质是减少复杂性

> "零 ETL"真正要解决的问题更具体：不是让数据不经过处理，而是让那些**高频、通用、重复出现的入湖能力，不再依赖外部系统反复建设**。

**Kafka × Table Bucket 代表**：用一条更短路径，将消息接入/格式转换/Schema 适配/CDC 处理/事务提交/文件组织等通用能力尽量收敛在一起，让实时入湖更接近平台原生能力。

**AI 时代数据架构趋势**：
- 数据链路更短
- 数据资产更开放
- 表能力与存储能力更靠近
- 平台能力尽量内聚而不是持续外扩

**下一阶段演进方向**：
1. 更丰富的 Transform 与更智能的运维能力
2. 与查询/计算/治理体系进一步打通
3. 持续适配 Iceberg 等开放表格式演进，并兼容更多面向 AI 场景的新型格式

## 实现

本文讨论的 **Kafka × Table Bucket 零 ETL 入湖能力**，目前已在**阿里云 ApsaraMQ for Kafka × OSS Tables** 上具备相应实现，完成了初步实践验证，并已对外开启邀测。

- Kafka Table Topic 以 **Iceberg 开放表格式** 持久化到 OSS Table Bucket
- 通过 **Iceberg REST Catalog** 与 Spark / Trino / Flink / DuckDB 开放生态对接
- 多层小文件治理、Schema 自适应演进、CDC Upsert、多 Catalog 兼容等能力均已实现

## 资源

- **阿里云 ApsaraMQ for Kafka** + **OSS Tables**：邀测中
- 阿里云开发者公众号：本文作者
