# Valkey 为什么这么快？盘点 Valkey 中提升性能的黑科技

> 📊 Level ⭐⭐⭐⭐ | 10.5KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/valkey-why-valkey-performance/)

## 摘要

Valkey 是 Redis 的开源 fork，作为 Amazon ElastiCache 的核心引擎，单节点吞吐量可达 119 万 RPS，集群规模可扩展至 2000 节点实现 10 亿级 RPS。Valkey 9.0 发布后 Pipeline 吞吐量再提升 40%。其性能突破源于五层架构的系统性优化：从网络 I/O 层的异步并发多线程、CPU 层的单线程命令执行 + 流水线批处理、数据结构层的缓存行优化哈希表和 Fenwick 树、到集群层的 Gossip 协议和自动故障转移。

## 核心要点

### 五层系统架构

```
┌─────────────────────────────────────────┐
│  GLIDE 客户端（Rust Core + 多语言绑定）   │
├─────────────────────────────────────────┤
│  网络连接层（epoll/kqueue + 多线程 I/O）  │
├─────────────────────────────────────────┤
│  命令处理层（单线程顺序执行 + Pipeline）   │
├─────────────────────────────────────────┤
│  数据结构与存储层（缓存行优化哈希表）      │
├─────────────────────────────────────────┤
│  持久化与复制层（RDB + AOF + 双通道复制） │
├─────────────────────────────────────────┤
│  集群协调层（16384 哈希槽 + Gossip）     │
└─────────────────────────────────────────┘
```

### 设计哲学：单线程执行 + 多线程 I/O

Valkey 的核心设计哲学是**单线程执行命令 + 多线程处理 I/O**。主线程保证原子性和 API 简洁性，I/O 线程负责榨取硬件性能。这种分层解耦让每一层都能独立优化。

### 网络与 I/O 层优化

**异步并发多线程 I/O（Valkey 8.0+）**

- **旧架构**：同步模式，主线程和 I/O 线程交替工作，无法并发；`epoll_wait` 系统调用和数据读写占用主线程 20%+ 时间
- **新架构**：AWS 团队贡献的异步并发架构——主线程和 I/O 线程真正并发运行
- **关键能力**：epoll 卸载、动态线程伸缩、命令批处理
- **场景价值**：电商大促、秒杀、游戏开服等瞬间数百万请求的场景

**传输协议优化**

- TCP/IP + Unix Socket + RDMA 三种连接方式
- epoll/kqueue 多路复用处理高并发连接

### CPU 与命令执行优化

- 单线程顺序执行保证原子性，避免锁竞争开销
- 流水线批处理（Pipeline）减少网络往返，9.0 版本 Pipeline 吞吐量提升 40%
- 键空间变更的 Pub/Sub 事件通知

### 数据结构与内存优化

- **缓存行优化哈希表**：针对 CPU 缓存行对齐优化，减少缓存未命中
- **集群模式 per-slot 字典**：每槽独立字典组织数据，减少锁粒度
- **Fenwick 树**：用于高效槽操作，支持快速区间查询和更新

### 集群与分布式优化

- 16,384 个哈希槽分布数据（兼容 Redis 集群协议）
- Gossip 协议传播集群状态
- 自动故障转移机制
- 支持扩展至 2000 节点

### Valkey-Search 搜索引擎加速

Valkey 内置向量搜索引擎（Valkey-Search），这是 Valkey 相对 Redis 的独有功能之一，支持向量相似度搜索等 AI/ML 场景。

### Valkey vs Redis 的差异化功能

| 特性 | Valkey | Redis OSS |
|------|--------|-----------|
| 向量搜索 | ✅ Valkey-Search | ❌ 需第三方 |
| 多数据库集群 | ✅ Numbered Databases | ❌ 仅单库集群 |
| Hash 字段级过期 | ✅ Hash Field Expiration | ❌ |
| 异步并发 I/O | ✅ 8.0+ | 有限 |
| 开源协议 | BSD-3 | SSPL/RSALv2 |

## 深度分析

### 从 Redis fork 到独立生态

Valkey 的诞生源于 Redis 许可证变更（从 BSD 转向 SSPL/RSALv2），AWS、Google 联合社区 fork 出 Valkey 维护 BSD-3 开源。但 Valkey 不仅仅是"免费版 Redis"——它在性能优化上走出了独立路线，特别是异步并发 I/O 架构和 Valkey-Search 引擎。

### 性能优化的工程哲学

Valkey 的优化策略遵循"分层解耦，逐层突破"的原则：
- **网络层**：将 I/O 操作从主线程剥离，避免阻塞命令执行
- **命令层**：保持单线程的简洁性，通过 Pipeline 批处理提升吞吐
- **存储层**：从 CPU 微架构层面优化（缓存行对齐），这是极致性能工程的体现
- **集群层**：Gossip + 哈希槽的成熟分布式方案，平衡一致性与可用性

### GLIDE 客户端的战略意义

GLIDE（General Language Independent Driver for the Enterprise）由 AWS、Google 和 Valkey 社区联合开发，Rust Core 底层 + 多语言上层。内置连接管理、重试、故障转移、集群拓扑感知、AZ 亲和路由等生产级特性。这标志着 Valkey 生态从服务端扩展到客户端标准化，类似 JDBC/ODBC 在数据库领域的角色。

### 异步 I/O 线程：从同步交替到真正并发

Valkey 8.0 之前的多线程 I/O 是同步模式：主线程与 I/O 线程交替工作，高并发下 epoll_wait 和数据读写占用主线程 20% 以上时间。8.0 引入 AWS 贡献的异步并发架构——把读取请求、解析协议、发送响应、轮询事件等纯 I/O 操作卸载到 Worker 线程池，主线程专心执行命令；配合线程亲和性、动态伸缩、零竞争（事件通知、无锁）。实测 8 个 I/O 线程吞吐从 360K 提到 1.19M RPS，平均延迟从 1.792ms 降到 0.542ms（-69.8%）。

配套的 9.0 零拷贝响应进一步消除大对象阻塞：主线程不再 memcpy 大对象，只写入 16 字节指针引用，I/O 线程经 writev()/iovec 直接从原始内存位置发送；1KB 请求 + 10MB 大对象混合负载下，p99 延迟从 8.1 的 26.2ms 降到 9.0 的 8ms。这类劣化可用 [ElastiCache 慢查询监控](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建-amazon-elasticache-oss-caches-慢查询监控方案.md) 捕获。

### CPU 微架构层：内存访问摊销与 SIMD

Profiling 显示主线程 40% 以上时间花在 lookupKey 上：指针 chase 串行依赖，key 集合一大便大量 cache miss，CPU 表面满载、实际在等内存。内存访问摊销即"交错执行 + 预取"：同时发起 N 个内存请求，把 N × 100ns 的等待摊销成接近 1 × 100ns。9.0 的管道内存预取在解析阶段就对所有 key 计算 hash、定位 bucket 并发出 prefetch，执行时数据已在 L1/L2 缓存；批量读负载下相对 8.2 吞吐提升约 50–56%。SIMD 用于 BITCOUNT 和 HyperLogLog（PFCOUNT/PFMERGE），吞吐最高 +200%，自动选 AVX2/NEON 路径。

### 数据结构重写：64 字节缓存行哈希表与 Fenwick 树

8.1 完全重写哈希表：每桶精确 64 字节匹配一个缓存行，把查找从"追指针链"变成"扫描本地缓存"，内存访问从 4+ 次降到 2 次，每 key 省约 20 字节。按 1 亿用户 Session 估算，纯结构开销从约 5.2GB 降到约 1.8GB，可降一级实例规格。

集群模式下，8.0 改为每槽独立字典，消除旧方案每 key 额外 16 字节的双向链表指针；代价是要在 16384 个字典上快速做全局操作（遍历、加权随机淘汰、迁移规划）。Valkey 维护一棵大小 16384 的 Fenwick 树，BIT[slot] = 该槽 key 数，单点更新与前缀和查询均 O(log 16384) ≈ 14 次加法、纳秒级，总开销仅 128K。

### 集群与网络的极限优化：RDMA、MPTCP 与原子 Slot 迁移

网络传输层还有两条差异化路线：RDMA 经 valkey-rdma.so 支持，零拷贝 + 内核旁路 + CPU 卸载，约 2 倍 QPS，但仍是实验性技术，ElastiCache 未启用；MPTCP 把一个 TCP 连接分散到多条子流，自动负载均衡与故障切换、对应用透明，约 -25% 延迟，ElastiCache 9.0 已支持，适合不能中断的跨 AZ 场景。

集群扩缩容方面，9.0 的原子 Slot 迁移"像复制一样迁移，最后原子切换所有权"：快照（子进程异步把迁移槽数据快照化为命令流发往目标）→ 流传输（持续跟踪增量变更）→ 最终化（目标完全处理完才接管所有权并广播）；100 万 key 迁移 4096 槽约 4GB 的测试提速 7 倍以上，客户端无感知。

## 实践启示

1. **评估 Valkey 替代 Redis**：对于新项目，Valkey 的 BSD-3 许可和额外功能（向量搜索、多库集群）值得优先评估
2. **利用 ElastiCache 托管**：Amazon ElastiCache 开箱即用支持 Valkey，降低运维成本
3. **关注 I/O 线程配置**：高并发场景下合理配置 I/O 线程数，利用异步并发架构优势
4. **Pipeline 批处理优化**：对批量操作使用 Pipeline，9.0 版本可获 40% 吞吐提升
5. **探索 Valkey-Search**：向量搜索场景可直接使用 Valkey 内置的搜索引擎，避免额外组件

## 相关实体

- 缓存策略
- Amazon ElastiCache
- 分布式系统

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

