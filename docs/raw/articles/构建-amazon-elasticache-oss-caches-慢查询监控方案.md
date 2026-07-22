---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/build-amazon-elasticache-oss-caches-query-monitoring-solution
ingested: 2026-07-09
feed_name: AWS China Blog
source_published: 2026-07-07
sha256: "ba0b281841d3ace61c7ab214c9cc0ad738009a04f0967f3d637ea83303107b6c"
---

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

理解数据如何从一条 Redis 命令最终变成一次告警，是掌握本方案的关键。下图展示了完整的数据流：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/build-amazon-elasticache-oss-caches-query-monitoring-solution-2.png>) [图2：从 SLOWLOG 到告警通知的完整数据流]  
---  
  
当慢日志以 JSON 格式投递后，每条记录形如：
    
    
    {
      "CacheClusterId": "my-redis-0001-001",
      "CacheNodeId": "0001",
      "Id": 12,
      "Timestamp": 1718000000,
      "DurationInMicroseconds": 153000,
      "Command": "KEYS user:*",
      "ClientAddress": "10.0.1.23:51234",
      "ClientName": "app-worker-3"
    }
    

Metric Filter 的筛选模式 { $.CacheClusterId=”*” } 会匹配所有包含 CacheClusterId 字段的记录（即每一条有效慢日志），指标转换规则为：

  * 指标值：每命中一条记录计 1，因此在统计窗口内做 Sum 聚合即为“慢查询发生次数”。
  * 维度映射：CacheClusterId ← $.CacheClusterId，CacheNodeId ← $.CacheNodeId，从而可按节点粒度区分。

指标名称 | 命名空间 | 维度 | 说明  
---|---|---|---  
`RedisSlowQueryCount` | `ElastiCache/RedisSlowLog` | `CacheClusterId`、`CacheNodeId` | 单位统计周期内匹配到的慢查询条数，以 Sum 聚合  
  
在告警侧，由于一个复制组（Replication Group）可能包含多个节点，方案使用 CloudWatch Metric Math 表达式 SUM(METRICS()) 将该复制组下所有成员节点的慢查询计数相加，得到集群整体的慢查询总量后再与阈值比较（单条告警最多聚合 10 个成员指标，符合 CloudWatch 的限制）。

## **4\. 实现步骤详解**

本方案通过项目中的两个脚本完成全部部署：redis_check_and_open_slowlog.py 负责开启慢日志并搭建指标管道，redis_SlowQueries.py 负责创建告警。两个脚本都支持正则批量匹配，可一次性作用于大量集群。

### 4.1 步骤一：启用慢日志并构建指标管道

该步骤由 job/check/redis_check_and_open_slowlog.py 完成，它封装了 RedisSlowLogManager，对每个匹配到的集群依次完成“检查参数组 → 创建日志组 → 配置日志导出 → 创建指标筛选器”四件事。其内部执行流程如下：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/build-amazon-elasticache-oss-caches-query-monitoring-solution-3.png>) [图3：redis_check_and_open_slowlog.py 内部执行流程]  
---  
  
命令格式：
    
    
    # config_path：配置路径，形如 project_name/cloud_name/env_name
    # pattern：Redis 集群 ID（复制组 ID）的正则表达式
    python blue_script/job/check/redis_check_and_open_slowlog.py <config_path> <pattern>
    
    # 示例：为所有以 redis-cluster- 开头的复制组开启慢日志监控
    python blue_script/job/check/redis_check_and_open_slowlog.py project/cloud/env "redis-cluster-.*"
    

说明：脚本设计要点：脚本只会对参数组中已配置慢查询参数（slowlog-log-slower-than 与 slowlog-max-len）的集群继续配置导出与指标筛选器；对未启用慢查询的集群则仅记录日志并跳过。这是一种安全的幂等设计——日志组与指标筛选器在已存在时会自动跳过创建，可放心重复执行。

### 4.2 步骤二：准备配置文件

在 config/<project>/<cloud>/<env>/ 目录下的 alarm.yaml 中提供日志组名称与 SNS 主题：
    
    
    # alarm.yaml
    sns_topic_arn: "arn:aws:sns:<region>:<account-id>:<topic-name>"
    redis_slowlog_loggroup: "/aws/elasticache/redis/slowlog"
    

脚本启动时会读取 alarm.redis_slowlog_loggroup；若该配置缺失，脚本会直接报错退出，以避免向错误的日志组写入数据。

### 4.3 步骤三：在参数组中启用慢查询（如尚未启用）

若目标集群的参数组尚未启用慢查询，需要先在自定义参数组中开启。注意 ElastiCache 默认参数组不可修改，需创建自定义参数组并应用到集群：
    
    
    # 1) 基于对应引擎版本族创建自定义参数组
    aws elasticache create-cache-parameter-group \
      --cache-parameter-group-name redis7-slowlog \
      --cache-parameter-group-family redis7 \
      --description "Enable slowlog for monitoring"
    
    # 2) 设置慢查询阈值（示例：10000 微秒 = 10 毫秒）与最大条目数
    aws elasticache modify-cache-parameter-group \
      --cache-parameter-group-name redis7-slowlog \
      --parameter-name-values \
        "ParameterName=slowlog-log-slower-than,ParameterValue=10000" \
        "ParameterName=slowlog-max-len,ParameterValue=128"
    
    # 3) 将参数组应用到复制组
    aws elasticache modify-replication-group \
      --replication-group-id <your-replication-group> \
      --cache-parameter-group-name redis7-slowlog \
      --apply-immediately
    

### 4.4 步骤四：配置慢查询告警

日志管道就绪后，使用 job/monitor/redis/redis_SlowQueries.py 为匹配的集群批量创建告警。该脚本封装 RedisAlarmManager.set_slow_queries_alarm_by_pattern：
    
    
    # 参数：config_path  pattern  threshold  [--alarm_topic ARN]
    # threshold 为每个评估周期内的慢查询次数阈值
    python blue_script/job/monitor/redis/redis_SlowQueries.py \
      project/cloud/env "redis-cluster-.*" 100
    
    # 也可显式指定 SNS 主题（否则从 alarm.sns_topic_arn 读取）
    python blue_script/job/monitor/redis/redis_SlowQueries.py \
      project/cloud/env "redis-cluster-.*" 100 \
      --alarm_topic arn:aws:sns:us-east-1:111122223333:redis-alerts
    

脚本为每个复制组创建一个名为 {ReplicationGroupId}_Redis-SlowQueries 的告警，关键配置见第 4 节。

### 4.5 步骤五：验证与测试

触发一次慢查询以验证整条链路（请在测试集群上操作）：
    
    
    # 连接到测试集群后，执行一条必然超过阈值的命令
    redis-cli -h <endpoint> -p 6379 DEBUG SLEEP 0.2
    
    # 约 1-2 分钟后，查询自定义指标应能看到计数
    aws cloudwatch get-metric-statistics \
      --namespace "ElastiCache/RedisSlowLog" \
      --metric-name "RedisSlowQueryCount" \
      --dimensions Name=CacheClusterId,Value=<cluster-id> \
      --start-time "$(date -u -v-1H +%Y-%m-%dT%H:%M:%S)" \
      --end-time   "$(date -u +%Y-%m-%dT%H:%M:%S)" \
      --period 60 --statistics Sum
    

**注意：**

注意：DEBUG SLEEP 会真实阻塞该节点，请勿在生产集群执行。生产环境验证可改用对大 Key 的只读命令（如对测试用大 Hash 执行 HGETALL）。

## **5\. 详细配置说明**

### 5.1 参数组配置

参数名 | 推荐值 | 说明  
---|---|---  
`slowlog-log-slower-than` | 10000（微秒，即 10ms） | 慢查询阈值；0 记录所有命令，负数关闭。生产建议 10000，敏感场景可调至 5000。  
`slowlog-max-len` | 128 | 内存中保留的慢日志条目上限；过大占用内存，过小则在导出前可能被覆盖。  
  
### 5.2 日志导出配置

配置项 | 值 | 说明  
---|---|---  
LogType | `slow-log` | 导出慢日志  
DestinationType | `cloudwatch-logs` | 目标为 CloudWatch Logs  
LogFormat | `json` | 必须为 JSON，否则 Metric Filter 无法按字段解析  
ApplyImmediately | `true` | 立即应用  
  
### 5.3 指标筛选器配置

配置项 | 值  
---|---  
filterName | `SlowLogMetric`  
filterPattern | `{ $.CacheClusterId="*" }`  
metricNamespace | `ElastiCache/RedisSlowLog`  
metricName | `RedisSlowQueryCount`  
metricValue | `1`  
dimensions | `CacheClusterId=$.CacheClusterId`，`CacheNodeId=$.CacheNodeId`  
  
### 5.4 告警配置

配置项 | 值 | 说明  
---|---|---  
告警名称 | `{ReplicationGroupId}_Redis-SlowQueries` | 每个复制组一个独立告警  
指标表达式 | `SUM(METRICS())` | 聚合复制组下所有成员节点（最多 10 个）  
统计方式 / 周期 | Sum / 60 秒 | 每分钟统计一次  
评估周期 / 数据点 | 3 / 3 | 连续 3 个周期均越界才告警，抑制毛刺误报  
比较运算符 | `GreaterThanThreshold` | 超过阈值即触发  
缺失数据处理 | `ignore` | 无数据时保持上一状态，避免无慢查询时误报  
告警 / 恢复动作 | SNS Topic | ALARM 与 OK 状态均通知  
  
## **6\. 部署验证与故障排除**

### 6.1 部署后验证清单
    
    
    # 1) 日志组是否创建
    aws logs describe-log-groups \
      --log-group-name-prefix "/aws/elasticache/redis/slowlog"
    
    # 2) 指标筛选器是否存在
    aws logs describe-metric-filters \
      --log-group-name "/aws/elasticache/redis/slowlog"
    
    # 3) 集群日志导出配置是否生效
    aws elasticache describe-replication-groups \
      --replication-group-id <cluster-id> \
      --query 'ReplicationGroups[0].LogDeliveryConfigurations'
    
    # 4) 自定义指标是否已出现
    aws cloudwatch list-metrics --namespace "ElastiCache/RedisSlowLog"
    
    # 5) 告警是否创建
    aws cloudwatch describe-alarms \
      --alarm-name-prefix "<cluster-id>_Redis-SlowQueries"
    

### 6.2 常见问题

现象 | 可能原因与排查方向  
---|---  
日志组无数据 | 参数组未启用慢查询（阈值为负）；或当前确实没有超过阈值的命令；确认 LogDeliveryConfigurations 状态为 active。  
指标筛选器无数据 | 日志格式不是 JSON（LogFormat 必须为 json，text 格式无法按 $.CacheClusterId 解析）。  
告警不触发 | 阈值过高；或评估周期/数据点设置导致需要持续 3 分钟越界；检查指标是否有数据点。  
权限报错 | 执行角色需具备 elasticache:ModifyReplicationGroup、logs:CreateLogGroup、logs:PutMetricFilter、cloudwatch:PutMetricAlarm 等权限。  
  
## **7\. 最佳实践**

  * 分级告警：对同一指标设置 Warning（如 50 次/分钟）与 Critical（如 200 次/分钟）两级告警，分别路由到不同的 SNS 主题/值班渠道。
  * 阈值因业务而定：高 QPS 业务可适当放宽 slowlog-log-slower-than，避免日志量过大；对延迟敏感的业务则收紧到 5ms。
  * 控制成本：合理设置日志组保留期（默认 7 天），并通过 slowlog-log-slower-than 在源头限制日志量，从而控制 CloudWatch Logs 摄入与存储费用。
  * 结合命令分析：收到告警后，结合 CloudWatch Logs Insights 对日志组按 Command 字段聚合，快速定位最频繁的慢命令并推动业务侧优化（如用 SCAN 替代 KEYS、拆分大 Key）。
  * 纳入统一巡检：将批量脚本接入定时任务，对新建集群自动开启慢查询监控，实现“零遗漏”覆盖。



## **8\. 总结**

本方案以纯托管服务搭建了一套面向 ElastiCache for Redis 的慢查询监控体系，相比原生方式具备以下优势：

  * 更精准：填补了 CloudWatch 缺少“慢查询次数”指标的空白，将隐藏在节点内存中的 SLOWLOG 转化为可观测、可告警的时间序列。
  * 更轻量：得益于 Redis 慢日志的 JSON 结构化能力，仅用 Metric Filter 即可完成指标提取，无需任何 Lambda 或常驻进程，无代码维护负担。
  * 更灵活：正则批量匹配 + 配置驱动，一条命令即可覆盖成百上千个集群，并支持分级告警与多渠道通知。
  * 更经济：按量计费的托管服务组合，配合保留期与阈值控制，成本可控且无固定开销。
  * 更易用：幂等脚本可安全重复执行，部署、验证、排障全流程标准化。



**下一步行动：**

**相关产品：**

  * [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=1>) — 可观测性工具
  * [Amazon ElastiCache](<https://aws.amazon.com/cn/elasticache/?p=bl_pr_elasticache_l=2>) — 无服务器缓存
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=3>) — 发布/订阅和推送通知
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=4>) — 无需服务器即可运行代码
  * [Amazon Aurora](<https://aws.amazon.com/cn/rds/aurora/?p=bl_pr_aurora_l=5>) — 适用于 PostgreSQL、MySQL 和 DSQL 的无服务器关系数据库服务



**相关文章：**

  * [37GAMES 在 Aurora Serverless v2 高可用及成本优化上的实践](<https://aws.amazon.com/cn/blogs/china/37-games-aurora-serverless-v2-high-availability-cost-optimize-practice/?p=bl_ar_l=1>)
  * [基于Strands和AgentCore 实现Agentic Scheduler 在多Region自动编排推理GPU算力](<https://aws.amazon.com/cn/blogs/china/agentic-scheduler-with-strands-agentcore-for-multi-region-gpu-inference/?p=bl_ar_l=2>)
  * [使用 Amazon GameLift Servers为游戏构建 DDoS 防护与延迟优化](<https://aws.amazon.com/cn/blogs/china/using-amazon-gamelift-servers-gaming-build-ddos-optimize/?p=bl_ar_l=3>)
  * [给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回](<https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/?p=bl_ar_l=4>)
  * [简化故障注入，读懂应用影响：用 AI Agent 做混沌工程](<https://aws.amazon.com/cn/blogs/china/simplify-fault-injection-understand-application-impact-chaos-engineering-ai-agent/?p=bl_ar_l=5>)



## **9\. 附录：[相关代码文件](<https://github.com/aws-samples/sample-redis-slowquery-monitoring>)**

文件 | 作用  
---|---  
`job/check/redis_check_and_open_slowlog.py` | 入口脚本：开启慢日志、创建日志组与指标筛选器  
`lib/aws/alarm/redis_slowlog.py` | RedisSlowLogManager：日志导出与 Metric Filter 核心实现  
`job/monitor/redis/redis_SlowQueries.py` | 入口脚本：创建慢查询告警  
`lib/aws/alarm/redis_alarm.py` | RedisAlarmManager：告警创建与 Metric Math 聚合实现  
`config/<project>/<cloud>/<env>/alarm.yaml` | 配置文件：日志组名称与 SNS 主题  
  
### 参考资料

  * [ElastiCache 日志投递（Log Delivery）官方文档](<https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Log_Delivery.html>)
  * [CloudWatch Logs Metric Filter 官方文档](<https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 刘硕

亚马逊云科技客户解决方案经理，在亚马逊云科技主要支持游戏和零售等行业的用户。专注于促进亚马逊云科技用户解决方案落地，提升上云体验，帮助用户实现自身的业务价值。

### 任耀洲

亚马逊云科技解决方案架构师，负责企业客户应用在亚马逊云科技的架构咨询和设计。在微服务架构设计、数据库等领域有丰富的经验。

### 胡亚光

AWS 资深技术客户经理，主要负责游戏客户的架构优化、成本管理、技术咨询等工作。拥有超过 10 年项目实施和客户支持经验。在加入 AWS 前曾就职于 Citrix，主要服务于大型金融类客户。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
