# 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

## Ch11.181 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

> 📊 Level ⭐⭐ | 6.8KB | `entities/如何保护-ec2-实例存储instance-store数据不丢失场景分析与自动化防护实践.md`

# 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/如何保护-ec2-实例存储instance-store数据不丢失场景分析与自动化防护实践.md)

# 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

摘要：Amazon EC2 实例存储（Instance Store）以其极致 I/O 性能被广泛用于分布式存储和缓存场景，但其”实例中断即数据丢失”的特性常被低估。本文系统梳理了 21 种导致 Instance Store 数据丢失的场景，并提供了一套从 Stop/Terminate Protection、SCP 策略到 EventBridge + Lambda 自动化巡检的纵深防御方案（Defense in Depth），附带可直接部署的开源代码。

**目录**

01 一、为什么需要关注 Instance Store 数据保护？

02 二、Instance Store 数据丢失的完整场景梳理

03 三、纵深防御方案

04 四、运维巡检清单

05 五、最佳实践总结

06 六、总结

* * *

## **一、为什么需要关注 Instance Store 数据保护？**

许多高性能工作负载选择 EC2 Instance Store（Local NVMe SSD）作为本地数据存储，以获取极致的 IOPS 和低延迟。典型场景包括：

  * 基于 RocksDB 的分布式存储：如 Apache Kvrocks（Redis 兼容的磁盘 KV 存储）、TiKV 等，RocksDB 本身是磁盘密集型引擎，对 IOPS 和延迟有极高要求，是 Instance Store 的典型用户
  * 消息队列的日志存储：如 Apache Kafka Broker 的 Log Segments，写入吞吐量极大
  * 大数据 Shuffle 和临时计算：如 Apache Spark 的 Shuffle 数据、Presto Worker 本地缓存

这些场景的共同特点是：对磁盘 IOPS/延迟极度敏感，且通过应用层多副本（如 Kafka 的 Replication Factor、Kvrocks 的主从复制）来保障数据可靠性，因此可以接受单节点 Instance Store 的临时性。然而在单可用区部署或多副本尚未完全就绪的阶段，一旦实例生命周期被意外中断（停止、终止、迁移），Instance Store 上的数据将立即且不可逆地丢失。在现代云运维中，中断实例生命周期的方式远超我们的直觉 — 不仅包括人为误操作，还包括 Auto Recovery、ASG 缩容、Karpenter 节点整合等系统自动触发的行为。

## **二、Instance Store 数据丢失的完整场景梳理**

根据 AWS 官方文档和实际运维经验，我们梳理了可能导致 Instance Store 数据丢失的场景，共计 6 大类、21 个子场景：

序号 | 触发来源 | 操作类型 | 数据丢失? | 推荐防护 | 备注  
---|---|---|---|---|---  
1 | 控制台/API/CLI/SDK | 重启（Reboot） | ✕ | — | 唯一安全的中断操作  
2 | OS 内部 | 重启 | ✕ | — | 等同于 API 重启  
3 | 用户触发：控制台/API/CLI/SDK | 停止（Stop） | ✓ | 方案 A | 最常见误操作  
4 | 用户触发：控制台/API/CLI/SDK | 休眠（Hibernate） | ✓ | 方案 A | 容易被忽视  
5 | 用户触发：控制台/API/CLI/SDK | 终止（Terminate） | ✓ | 方案 A | 不可逆  
6 | 服务角色（IAM Role）触发 | 停止 | ✓ | 方案 A | 如 SSM Automation  
7 | 服务角色（IAM Role）触发 | 终止 | ✓ | 方案 A | 如 Cost Explorer 自动操作  
8 | EC2 简化自动恢复 | 实例迁移到新主机 | ✓ | 关闭 Auto Recovery | 默认开启!  
9 | CloudWatch 操作型恢复 | 实例恢复 | ✓ | 关闭 CW Alarm Action | 需手动排查  
10 | Auto Scaling Group | 缩容终止实例 | ✓ | 方案 B | 集群场景  
11 | Karpenter | 节点整合/缩容 | ✓ | do-not-disrupt | K8s 场景  
12 | 自定义缩容逻辑 | 缩容 | ✓ | 需自行管控 | 如自研调度器  
13 | OS 内部 | shutdown/halt 命令 | ✓ | 需自行管控 | 误操作或脚本触发  
14 | OS 内部 | 休眠 | ✓ | 需自行管控 | 罕见但可能  
15 | OS 内部 | 内核崩溃（无法重启） | ✓ | 需自行管控 | 系统级故障  
16 | AWS 平台 | 底层硬件故障 | ✓ | 多副本多 AZ | 不可控  
17 | AWS 平台 | 实例维护事件 | ✓ | 多副本多 AZ | 提前通知  
18 | AWS 平台 | Spot 实例回收 | ✓ | 多副本多 AZ | 2分钟警告  
19 | AWS 平台 | 账户欠费停机 | ✓ | 需自行管控 | 账单管理  
20 | AWS 平台 | 重启失败导致状态异常 | ✓ | 需自行管控 | 极端场景  
21 | 其他未穷举 | — | ✓ | 需自行管控 | 无法完全列举
  
### 2.1 关键发现

  * 重启（Reboot）是唯一安全的操作 — 无论通过 API 还是 OS 内部执行
  * 19 种有风险的场景中，约 10 种可以通过 API 层面的保护机制防御（方案 A/B）
  * AWS 平台触发的场景（硬件故障、维护、Spot 回收）无法通过保护 API 阻止，只能依赖多副本 + 多可用区架构
  * 很多团队只关注了”人为误操作”，却忽略了 Auto Recovery、ASG 缩容等系统自动触发的风险

## **三、纵深防御方案**

### 3.1 方案 A：API 层保护（防人为误操作 + 服务角色操作）

适用场景：#3-#9

**3.1.1 第一层：实例级保护**

启用停止保护（Stop Protection）：
    
    
    aws ec2 modify-instance-attribute \
        --instance-id i-xxx \
        --disable-api-stop

启用终止保护（Termination Protection）：
    
    
    aws ec2 modify-instance-attribute \
        --instance-id i-xxx \
        --disable-api-termination

标记需要保护的实例：
    
    
    aws ec2 create-tags \
        --resources i-xxx \

---

