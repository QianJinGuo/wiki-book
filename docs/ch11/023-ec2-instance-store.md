# 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

> 📊 Level ⭐⭐⭐ | 14.3KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/how-to-ec2-instance-storage-instance-store)

## 如何保护 EC2 实例存储（Instance Store）数据不丢失：场景分析与自动化防护实践

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

## 深度分析

1. **“实例即数据”是架构取舍，不是可靠性疏漏。** Instance Store 直接暴露宿主机本地 NVMe，绕过 EBS 的网络虚拟化存储栈，才换来极致 IOPS 与低延迟；代价是数据生命周期与实例/物理机强绑定。任何让实例“换一台主机”的事件——停止、终止、Auto Recovery 迁移、平台维护——都会让本地数据不可逆消失。高性能与持久性天然互斥，因此防护思路只能是“降低生命周期被意外触发的概率 + 应用层自冗余”。

2. **风险主体是系统自动化，而非人的误操作。** 21 个场景中真正来自人为操作的只占一部分，更多触发器藏在默认开启的系统行为里：Simplified Auto Recovery 默认开启、ASG 缩容、Karpenter 节点整合、Spot 两分钟回收、计划维护事件。每个自动化组件各持默认值，任何一处默认都可能是数据丢失的扳机，且这类“自动触发破坏”没有确认弹窗、难以追责，比误操作更隐蔽。

3. **三层防御呈“覆盖面与精确度成反比”的结构。** API 层（DisableApiStop/DisableApiTermination + SCP）精确但覆盖窄：只拦截控制面请求，对 OS 内 shutdown、平台维护、ASG/Karpenter 缩容全部无效；自动化层（EventBridge + Lambda）解决的是元问题——保护配置本身会漂移、被遗忘、被新建实例绕过，所以防护机制需要自我巡检；架构层（多副本 + 多 AZ）是唯一覆盖不可控场景的兜底，但成本最高。正确用法是三层叠加，而非任选其一。

4. **关闭 Auto Recovery 是 durability 与 availability 的显式对赌。** 混合实例（EBS root + 本地数据盘）被自动恢复迁移到新主机时本地数据即失；纯 Instance Store 实例反而不受简化自动恢复影响。关闭它意味着硬件故障时依赖监控告警 + 人工 stop/start，牺牲恢复速度换取数据存续——有状态本地存储场景的优先级排序由此明确：数据不可丢失 > 自动恢复可用性。

5. **这是 ephemeral storage 工程的通用范式。** 本地 SSD、tmpfs、Kubernetes emptyDir/hostPath、Spark shuffle 目录都遵循同一模式：用持久性换性能，把可靠性上移到应用层副本。凡依赖本地临时盘的有状态服务都可套用同一张三层防护清单，该方案因此是跨平台的通用检查表。

## 实践启示

1. 用 `describe_instance_types` 的 `InstanceStorageSupported` 字段动态判断实例是否带本地盘，不要硬编码实例族列表——新类型一发布，硬编码就会漏防护。
2. 在 Launch Template 里固化 DisableApiStop、DisableApiTermination、AutoRecovery=Disabled、关闭 Hibernation，让新实例“创建即受保护”；再配 SCP 按 `StopForbidden` 标签做组织级兜底（对所有 IAM 主体生效，跨 AZ 批量操作需分批）。
3. 混合实例必须显式关闭 Auto Recovery，并接受“硬件故障需人工介入”的代价；同时保留 `StatusCheckFailed_System` 告警作为人工恢复的触发器。
4. 集群场景把管控上移一层：ASG 固定 Min=Max=Desired 或禁用缩容策略，EKS 用 Karpenter `do-not-disrupt` annotation 与 WhenEmpty 合并策略，防止调度器缩容删数据。
5. 手动配置必然漂移：EventBridge 监听 `running` 状态事件做实时保护，定时 cron 巡检检测并自动修复漂移，SNS 推送结果，让防护本身成为有人看护的闭环而非一次性配置。
6. 防护只降概率、不消除风险：先质问是否真需要本地盘（io2 Block Express 等持久化存储可能已够用）；必须用时，多副本 + 多 AZ 是一切控制面措施的前提兜底。
---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

