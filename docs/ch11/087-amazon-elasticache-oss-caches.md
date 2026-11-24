# 构建 Amazon ElastiCache OSS Caches 慢查询监控方案

> 📊 Level ⭐⭐⭐ | 8.8KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/build-amazon-elasticache-oss-caches-query-monitoring-solution)

## 摘要

Redis 慢查询会阻塞单线程引擎，在高 QPS 下快速累积成缓存层不可用并击穿到后端数据库，而 CloudWatch 并不提供现成的"慢查询次数"指标。本方案利用 ElastiCache 慢日志可直接以 JSON 结构化投递到 CloudWatch Logs 的能力，通过 Metric Filter 生成自定义指标 `RedisSlowQueryCount`，配合 CloudWatch 告警与 SNS 实现主动监控，全程零代码、纯托管、可批量部署，在毫秒级问题积累成线上故障之前就发出信号。

## 核心要点

- **单线程模型是致命弱点**：KEYS *、大 Key 上的 HGETALL、复杂 Lua 脚本、超大 MGET/Pipeline 等 O(N) 命令一旦耗时几十毫秒，就会阻塞其后所有命令，表现为 EngineCPUUtilization 飙升、客户端超时、连接堆积——慢查询往往是线上故障最早、也最容易被忽视的前兆信号。
- **原生 SLOWLOG 有三个固有缺陷**：仅存于节点内存、容量有限被滚动覆盖、需逐节点手动 SLOWLOG GET 拉取，且无法形成可告警的时间序列；在几十上百个集群的生产环境中，人工巡检几乎不可行。
- **管道五段式**：参数组启用 slowlog-log-slower-than → 慢日志以 JSON 格式投递 CloudWatch Logs（日志组 `/aws/elasticache/redis/slowlog`）→ Metric Filter `{ $.CacheClusterId="*" }` 每命中一条计 1 → 自定义指标 `RedisSlowQueryCount`（命名空间 `ElastiCache/RedisSlowLog`）→ CloudWatch 告警 + SNS 多渠道通知。
- **零 Lambda 是与 Aurora 慢查询方案的关键差异**：Aurora 慢日志是纯文本，需部署 Lambda 用正则解析 Query_time、Rows_examined 等字段；Redis 慢日志原生 JSON，Metric Filter 直接按 JSON 路径提取字段生成指标，无任何代码维护负担。
- **告警按复制组聚合**：用 Metric Math 表达式 `SUM(METRICS())` 将复制组下所有成员节点（最多 10 个，符合 CloudWatch 限制）的慢查询计数相加，得到集群整体慢查询总量后再与阈值比较。
- **幂等与安全设计**：脚本只对参数组已配置慢查询参数的集群继续配置导出与筛选器，日志组与指标筛选器已存在时自动跳过创建，可放心重复执行。
- **正则批量匹配实现零遗漏**：一条命令即可覆盖成百上千个集群，配置驱动（alarm.yaml 提供日志组名称与 SNS 主题），可接入定时任务对新建集群自动开启监控。

## 深度分析

### 架构：纯托管管道，无任何常驻运行时

整条链路完全基于 AWS 托管服务，数据自左向右流动：ElastiCache 集群（参数组启用慢查询）→ CloudWatch Logs（持久化 JSON 慢日志）→ Metric Filter（方案核心，指标提取）→ CloudWatch 自定义指标 → CloudWatch 告警 → SNS（Email、SMS、Webhook、Lambda、飞书/钉钉）。与需要常驻采集进程或 Lambda 函数的自建方案相比，该架构没有任何需要持续运维的运行时组件，部署脚本只负责一次性创建资源而非持续采集。每条慢日志记录携带 CacheClusterId、CacheNodeId、Command、DurationInMicroseconds、ClientAddress、ClientName 等字段，既支撑计数指标，也为后续按命令聚合定位慢命令保留完整的排查线索。部署由两个脚本完成：redis_check_and_open_slowlog.py 依次完成"检查参数组 → 创建日志组 → 配置日志导出 → 创建指标筛选器"，redis_SlowQueries.py 负责批量创建告警。

### 指标选择：为什么是"每分钟计数"而非延迟分布

CloudWatch 已有 EngineCPUUtilization、CurrConnections、CacheHits 等指标，但缺少直接量化"过去一分钟发生了多少次慢查询"的信号。传统监控只能等 CPU 或延迟告警触发后再反向排查是哪些命令导致——这是滞后的被动响应。本方案把 SLOWLOG 从节点内存转化为分钟级时间序列：指标值恒为 1，统计窗口内 Sum 聚合即为慢查询发生次数；维度映射到 CacheClusterId 与 CacheNodeId，既能按复制组告警，也能按节点粒度定位问题源头。Metric Filter 的筛选模式 `{ $.CacheClusterId="*" }` 匹配所有含该字段的记录，即每一条有效慢日志——一个简单到近乎平凡的规则，却完整填补了可观测性空白。

### 告警阈值：抑制毛刺的三重设计

告警配置体现了明显的抗误报取向。统计方式 Sum、周期 60 秒；评估周期 3、数据点 3/3——连续 3 个周期越界才触发，抑制单次毛刺；缺失数据处理设为 ignore，无数据时保持上一状态，避免"没有慢查询"被误判为异常；ALARM 与 OK 状态均通知 SNS，保证恢复可见。阈值本身因业务而定：生产建议 slowlog-log-slower-than=10000 微秒（10ms），延迟敏感场景可收紧到 5000；告警阈值示例为每周期 100 次，最佳实践提出分级告警（如 Warning 50 次/分钟、Critical 200 次/分钟）分别路由到不同值班渠道。slowlog-max-len 推荐 128：过大占用节点内存，过小则日志在导出前可能被滚动覆盖。高 QPS 业务可适当放宽慢查询阈值以控制日志量，这本质上是在监控灵敏度与 CloudWatch Logs 摄入成本之间做权衡。

### 权衡：零代码换来的能力边界

以"零代码"换取架构简洁的同时，方案也放弃了部分灵活性。其一，Metric Filter 只能做计数与维度映射，无法像 Lambda 方案那样对日志做复杂变换或富化；其二，慢日志由 slowlog-log-slower-than 在源头过滤，阈值过低会推高 CloudWatch Logs 摄入与存储费用（保留期默认 7 天，需在排查窗口与成本之间权衡）；其三，单条告警的 SUM(METRICS()) 最多聚合 10 个成员指标，超大集群需拆分告警。验证环节也有约束：DEBUG SLEEP 会真实阻塞节点，只能在测试集群执行，生产验证应改用对大 Key 的只读命令（如对测试用大 Hash 执行 HGETALL）。另外 ElastiCache 默认参数组不可修改，必须先创建自定义参数组再应用到复制组。

## 实践启示

1. **告警只是入口，消除慢查询才是目标**：收到告警后用 CloudWatch Logs Insights 按 Command 字段聚合，找出最频繁的慢命令并推动业务侧改造——用 SCAN 替代 KEYS、拆分大 Key、简化 Lua 脚本。
2. **阈值必须结合业务 QPS 校准**：100 次/分钟对低 QPS 业务可能是灾难，对高 QPS 业务可能是常态噪声。上线后先观察一周基线再定分级阈值（Warning/Critical 双级），避免首轮误报消耗团队对告警的信任。
3. **利用幂等设计纳入巡检定时任务**：资源已存在时自动跳过，可安全重复执行；将批量脚本接入定时任务，对新建集群自动开启慢查询监控，实现零遗漏覆盖。
4. **验证链路时保护生产集群**：DEBUG SLEEP 会真实阻塞节点，仅用于测试集群；生产环境用大 Hash 的 HGETALL 等只读命令触发慢查询，约 1-2 分钟后用 get-metric-statistics 确认自定义指标出现。
5. **排查按管道方向自上而下**：日志组无数据查参数组（阈值是否为负）与 LogDeliveryConfigurations 是否 active；筛选器无数据查 LogFormat 是否为 json（text 格式无法按 $.CacheClusterId 解析）；告警不触发查阈值与 3 周期越界条件；权限报错确认 elasticache:ModifyReplicationGroup、logs:PutMetricFilter、cloudwatch:PutMetricAlarm 等授权。
6. **选型先看日志是否结构化**：为异构数据源选监控方案时，优先确认日志能否以 JSON 等结构化格式投递——它直接决定是否需要维护 Lambda 解析代码。Aurora（纯文本，需 Lambda）与 Redis（原生 JSON，仅需 Metric Filter）的对比即是最佳例证。

## 相关实体

- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关实体: [可观测性平台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/observability-platform.md)
- 相关实体: [SageMaker 推理可观测性](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sagemaker-inference-observability-cloudwatch-insights.md)

---

→ [原文存档](https://aws.amazon.com/cn/blogs/china/build-amazon-elasticache-oss-caches-query-monitoring-solution)

---

