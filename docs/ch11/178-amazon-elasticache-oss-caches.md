# 构建 Amazon ElastiCache OSS Caches 慢查询监控方案

## Ch11.178 构建 Amazon ElastiCache OSS Caches 慢查询监控方案

> 📊 Level ⭐⭐ | 6.8KB | `entities/构建-amazon-elasticache-oss-caches-慢查询监控方案.md`

# 构建 Amazon ElastiCache OSS Caches 慢查询监控方案

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/构建-amazon-elasticache-oss-caches-慢查询监控方案.md)

# 构建 Amazon ElastiCache OSS Caches 慢查询监控方案

摘要：Redis 慢查询会阻塞单线程引擎引发故障，而 CloudWatch 缺少现成的慢查询计数指标。本方案借助 ElastiCache 慢日志的 JSON 结构化能力，用 CloudWatch Logs Metric Filter 直接生成自定义指标 RedisSlowQueryCount，零代码、纯托管、可批量部署，并经告警与 SNS 实现主动监控。  
  
**目录**

01 引言

02 背景与方案价值

03 方案架构与实现思路

04 实现步骤详解

05 详细配置说明

06 部署验证与故障排除

07 最佳实践

08 总结

09 附录：相关代码文件

* * *

## **1\. 引言**

说明：Redis 凭借其极致的内存访问性能，成为缓存、会话、排行榜、消息队列等高并发场景的首选。然而 KEYS、大 Key 上的 HGETALL、复杂 Lua 脚本、批量 MGET 等命令一旦阻塞单线程的 Redis，就可能引发整条调用链路的雪崩。本文介绍一套无需运行任何常驻代码、纯托管服务、可批量自动化部署的 ElastiCache for Redis 慢查询监控方案，帮助您在毫秒级问题积累成线上故障之前主动发现并告警。

## **2\. 背景与方案价值**

### 2.1 为什么需要监控 Redis 慢查询

Redis 在主线程中以单线程模型串行执行命令。这意味着任何一条耗时较长的命令都会阻塞其后所有命令的执行，直接推高整个实例的延迟。常见的慢查询来源包括：

  * 高时间复杂度命令：KEYS *、SMEMBERS、HGETALL、SORT 等 O(N) / O(N log N) 命令在大集合上执行。
  * 大 Key 操作：对存有数十万元素的 Hash、Set、ZSet 进行整体读写。
  * 复杂 Lua 脚本：脚本中包含循环或对大量 Key 的访问，在 EVAL 期间独占主线程。
  * 批量命令：超大 MGET/MSET、Pipeline 中堆积过多命令。

这些命令单次执行可能只有几十毫秒，但在高 QPS 下会快速累积，表现为 EngineCPUUtilization 飙升、客户端超时、连接堆积，最终演变为缓存层不可用并击穿到后端数据库。慢查询往往是线上故障最早、也最容易被忽视的前兆信号。

### 2.2 Redis SLOWLOG 机制

Redis 内置 SLOWLOG 机制，由两个参数控制：

  * `slowlog-log-slower-than`：慢查询阈值，单位为微秒。执行耗时超过该值的命令会被记入慢日志；设为 0 表示记录所有命令，设为负数表示关闭。
  * `slowlog-max-len`：慢日志在内存中保留的最大条目数，超出后最旧的记录会被淘汰。

原生 SLOWLOG 仅将记录保存在 Redis 节点内存中，存在三个固有缺陷：容量有限会被滚动覆盖、需要主动登录每个节点用 SLOWLOG GET 拉取、且无法形成可告警的时间序列指标。在拥有几十上百个集群的生产环境中，靠人工巡检几乎不可行。

### 2.3 AWS 原生监控的局限性

ElastiCache 在 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 中提供了 EngineCPUUtilization、CurrConnections、CacheHits 等丰富指标，但并不存在一个开箱即用的“慢查询次数”指标。运维团队通常只能在 CPU 或延迟告警触发后，再反向排查是哪些命令导致——这是一种滞后的、被动的响应模式。我们需要的是一个能够直接量化“过去一分钟内发生了多少次慢查询”的指标，并据此提前告警。

### 2.4 本方案的核心价值

维度 | 原生 SLOWLOG / CloudWatch | 本方案  
---|---|---  
慢查询计数指标 | 无 | 自定义指标 `RedisSlowQueryCount`，分钟级时间序列  
持久化 | 仅内存，滚动覆盖 | CloudWatch Logs 持久化（保留期可配）  
多集群管理 | 逐节点手动拉取 | 正则批量匹配，一条命令配置所有集群  
告警 | 需自行搭建 | 自动创建 CloudWatch 告警 + SNS 多渠道通知  
运维成本 | 需常驻采集进程 | 纯托管服务，零代码常驻、无 Lambda  
  
说明：与 Aurora 慢查询方案的关键差异：Aurora 慢日志是纯文本格式，需要部署 Lambda 函数用正则解析 Query_time、Rows_examined/Rows_sent 等字段后再发布指标。而 ElastiCache for Redis 的慢日志可以直接以 JSON 结构化格式投递到 CloudWatch Logs，因此本方案改用 CloudWatch Logs Metric Filter 直接按 JSON 路径提取字段生成指标——全程无需编写和维护任何 Lambda 代码，更轻量、更省成本、更易运维。

## **3\. 方案架构与实现思路**

### 3.1 整体架构

方案完全基于 AWS 托管服务构建，数据自左向右流动，最终在阈值被突破时通过 SNS 分发告警：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/build-amazon-elasticache-oss-caches-query-monitoring-solution-1.png>) [图1：ElastiCache for Redis 慢查询监控整体架构]  
---  
  
核心组件说明：

  * ElastiCache for Redis 集群：数据源。通过参数组启用 slowlog-log-slower-than，并配置慢日志以 JSON 格式投递到 CloudWatch Logs。
  * CloudWatch Logs：接收并持久化结构化慢日志，日志组示例为 /aws/elasticache/redis/slowlog，保留期默认 7 天。
  * Metric Filter（指标筛选器）：方案的核心。使用 JSON 筛选模式 { $.CacheClusterId=”*” } 匹配每一条慢日志记录，每命中一条即向自定义指标贡献计数 1。
  * CloudWatch Metrics：存储自定义指标 RedisSlowQueryCount（命名空间 ElastiCache/RedisSlowLog）。
  * CloudWatch Alarms：基于该指标按复制组聚合评估，超过阈值时进入 ALARM 状态。
  * SNS Topic：将告警分发到 Email、SMS、Webhook、Lambda、飞书 / 钉钉等多种渠道。

### 3.2 数据流与指标计算逻辑

理解数据如何从

---

