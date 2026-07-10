# Netflix Druid 区间感知缓存：指数 TTL + 分桶查询去重

## Ch11.092 Netflix Druid 区间感知缓存：指数 TTL + 分桶查询去重

> 📊 Level ⭐⭐ | 10.2KB | `entities/netflix-druid-interval-aware-caching.md`

# Netflix Druid 区间感知缓存：指数 TTL + 分桶查询去重

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/netflix-druid-interval-aware-caching.md)

> **Core insight**: 滚动窗口仪表板的每次刷新只变化最后几分钟数据，其余"历史"数据已凝固。区间感知缓存将查询结果按时间粒度分桶存储，用指数递增 TTL（最近 2 分钟仅 5s，最远可达 1h）使 Druid 仅需扫描最fresh的未缓存数据，实验中 Druid 查询量降低 33%、P90 延迟改善 66%

## 问题背景：Druid 标准缓存在滚动窗口下的失效
Netflix Druid 集群每日处理 10T 行数据、15M events/sec 写入，26 个图表的热门仪表板每次加载产生 64 次查询，30 人同时查看、每 10 秒刷新，产生 192 qps。 Druid 内置的全结果缓存和段级缓存对滚动窗口失效：时间窗口轻微移动即构成不同的查询字符串导致缓存未命中；Druid 为保证查询正确性主动拒绝缓存含实时段的数据。这类近重复查询构成隐式 DDoS，在不扩容硬件的前提下无法简单解决。

## 核心设计：区间感知缓存拦截代理
系统以透明拦截代理形式集成于 Druid Router 前，对时间分组查询（timeseries、groupBy）进行三层处理：解析并用 SHA-256 计算缓存键（query hash 去除时间间隔和部分上下文，保留 datasource/filters/aggregations/granularity），用外层键 = query hash、内层键 = 时间戳分桶（对齐查询粒度或 1 分钟取较大者）的两级 map 结构存储在 Cassandra（通过 KVDAL）；查找时从请求起始时间向后连续获取桶，遇空洞（TTL 过期）即停止并仅向 Druid 请求空洞后的新鲜数据。

## 指数 TTL 设计逻辑
late-arriving data 问题导致越新鲜的数据越可能变化，越老的数据越确定。TTL 以指数方式随数据年龄递增：2 分钟以内数据 TTL=5s；2 分钟时 TTL=10s；3 分钟时 TTL=20s；4 分钟时 TTL=40s，以此类推，上限 1 小时。3 小时滚动窗口中 99% 的查询面积由 TTL 足够长的桶覆盖，Druid 仅需扫描最近 2-3 分钟的未缓存尾部。TTL 差异化策略使系统在高吞吐与最终一致性之间取得精确平衡。

## 负面缓存与空洞处理
稀疏指标某些时间桶天然为空，缓存若不特殊处理会将空桶当空洞重复查询 Druid。系统对 Druid 返回无数据的桶缓存空哨兵值，使空洞检测逻辑将其识别为有效缓存数据而非缺失。尾部空桶（查询返回到第 45 分钟但之后无数据）不进行负面缓存，避免将"数据未到达"错误缓存为"无数据"，否则会加剧 late arriving data 场景下的图表延迟。

## 实验结果与关键数据
典型工作日 82% 的真实用户查询获得至少部分缓存命中，84% 的结果数据来自缓存。实验中开启缓存后 Druid 查询量降低约 33%，整体 P90 查询延迟改善 66%，部分场景结果字节压缩超过 14 倍。缓存响应 P90 约 5.5ms，仪表板加载速度对所有用户均有提升。收益大小高度依赖查询工作负载的相似性和重复程度。

## 关键数据/实践启示
- Netflix Druid 规模：10T 行、15M events/sec、某仪表板 192 qps
- TTL 策略：<2min=5s，2min=10s，3min=20s，4min=40s... 上限 1h
- 两级 map 缓存键设计：外层 = query hash（不含时间），内层 = 粒度对齐时间戳
- 存储后端：Netflix KVDAL（Cassandra），支持独立 TTL 的内部键值对
- 实验结果：33% Druid 查询减少，66% P90 延迟改善，部分场景 14× 结果字节压缩
- 策略可泛化：时间序列数据库 + 频繁重叠窗口查询场景均可受益

## 深度分析

### 1. 滚动窗口查询的"隐式 DDoS"本质
Netflix 的场景揭示了一个在实时分析系统中普遍存在但很少被显式建模的问题：当多个用户查看同一滚动窗口仪表板时，查询的重复度极高但缓存命中率极低。这不是用户行为问题，而是查询语义与缓存键设计的不匹配——Druid 的全结果缓存将时间区间编码进缓存键，导致每次窗口移动（即使仅 1 秒）都产生全新键。解耦"查什么"与"查何时"是解决这一类问题的核心思路。

### 2. 指数 TTL 的信息论直觉
指数 TTL 策略背后有一个深刻的信息论直觉：数据点的"确定性"随时间单调递增。late-arriving data 的概率分布近似指数衰减——延迟 1 分钟的数据仍有可观概率被修正，延迟 30 分钟的数据几乎不可能再变。将 TTL 与这一概率分布对齐，使得缓存的"过期风险"在各时间桶间近似均匀，而非在最近桶处集中。这种设计比固定 TTL 更优：固定 TTL 要么太短（浪费历史数据的缓存价值），要么太长（新鲜数据过度 stale）。

### 3. 拦截代理 vs 原生集成的权衡
Netflix 选择拦截代理而非修改 Druid 源码，这是一个务实的工程决策：零客户端改动、可独立灰度、可快速回滚。但代价是额外的网络跳和序列化开销，且代理需要精确理解 Druid 查询协议的语义。Netflix 自身也承认这是临时方案，长期目标是原生集成。对其他组织而言，如果 Druid 查询协议稳定且团队有 Druid 源码修改能力，原生 Broker 集成可能是更优路径。

### 4. 负面缓存的三态逻辑
空桶处理展示了缓存设计中最易出错的边界条件：系统需要区分三种状态——(1) 有数据（正常缓存）、(2) 确实无数据（负面缓存哨兵值）、(3) 数据尚未到达（不缓存）。将 (2) 和 (3) 混淆会导致"数据未到达"被错误锁定为"无数据"，在 late-arriving data 场景下造成图表延迟。这与 `Netflix Cassandra Wide Partition Dynamic Splitting` 中 Netflix 对 Cassandra 边界条件的重视一脉相承。

### 5. 可泛化性：时间序列查询的共性
区间感知缓存的核心洞察——滚动窗口中历史数据已凝固、仅尾部活跃——适用于任何时间序列数据库 + 频繁重叠窗口查询场景：Prometheus 的 range query、InfluxDB 的连续查询、Elasticsearch 的滚动搜索。关键前提是：(a) 查询具有时间分组语义、(b) 存在后端支持独立 TTL 的 KV 存储、(c) 业务可接受秒级最终一致性。

## 实践启示

### 1. 实时分析平台：评估滚动窗口的隐式 DDoS 风险
如果你的 Druid/Prometheus/ClickHouse 仪表板有"自动刷新"功能，用 `query_count × refresh_rate × concurrent_users` 估算峰值 QPS。当峰值超过后端容量的 30% 时，应考虑区间感知缓存而非简单扩容。

### 2. 缓存架构师：采用两级 map 键设计解耦查询语义与时间
对于任何时间序列查询缓存，将缓存键分为"查询语义键"（datasource + filters + aggregations）和"时间桶键"（粒度对齐的时间戳），使同一逻辑查询的不同时间窗口共享语义键。存储后端需支持内部键的独立 TTL（Cassandra、Redis Hash + per-field TTL 均可）。

### 3. SRE 团队：用指数 TTL 平衡新鲜度与缓存效率
不要对实时仪表板使用固定 TTL。根据数据管道的 P90 延迟设定最短 TTL（Netflix 用 5s 对齐 5s 管道延迟），然后以 2 倍递增至业务可接受的最大 stale 时间。3 小时窗口下，指数 TTL 的有效缓存覆盖率可达 99%，而固定 5s TTL 的覆盖率接近 0%。

### 4. 数据工程师：实现负面缓存区分"无数据"与"数据未到达"
在稀疏指标场景中，缓存系统必须区分"Druid 返回空结果"（缓存哨兵值）和"查询范围超出已有数据"（不缓存）。前者避免重复查询已知空桶，后者避免将 late-arriving data 锁定为"无数据"。

### 5. 基础设施团队：优先考虑拦截代理而非源码修改
在验证缓存价值前，用拦截代理实现（如 Envoy filter 或独立服务），获得零客户端改动和快速回滚能力。仅在缓存被证明有持续价值且代理开销成为瓶颈后，再投入原生集成。

## 相关实体
- [High Throughput Graph Abstraction At Netflix](ch11/103-high-throughput-graph-abstraction-at-netflix-part-i.html)
- [High Throughput Graph Abstraction At Netflix Part I](ch11/103-high-throughput-graph-abstraction-at-netflix-part-i.html)
- [Netflix Live Operations Human Infrastructure](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-live-operations-human-infrastructure.md)
- [Netflix Metadata Service Model Lifecycle Graph](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-metadata-service-model-lifecycle-graph.md)
- [Netflix Nebula Archrules](ch11/090-netflix-nebula-archrules-java-archunit.html)

## 相关引用
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/netflix-druid-interval-aware-caching.md)

---

