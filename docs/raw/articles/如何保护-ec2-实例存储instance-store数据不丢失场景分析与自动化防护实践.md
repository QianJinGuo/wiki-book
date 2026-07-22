---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/how-to-ec2-instance-storage-instance-store
ingested: 2026-07-06
feed_name: AWS China Blog
source_published: 2026-07-06
sha256: "626dd8668352f837ec27a805b4c7be2b61e9b9c699a8259e4d17a46469be9776"
---

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
        --tags Key=StopForbidden,Value=true
    

**注意：**

Stop Protection 不能阻止以下操作导致的停机：OS 内部发起的 shutdown、AWS 计划维护事件、Auto Scaling 终止操作。同样，Termination Protection 不能阻止：AWS 计划维护事件、Auto Scaling 缩容、OS 内部 shutdown（当 `InstanceInitiatedShutdownBehavior` 设为 `terminate` 时）。

此外，如果在一个 API 调用中对多个可用区的实例执行终止操作，受保护实例不会被终止，但同一请求中位于其他可用区的未受保护实例仍会被终止。建议按可用区分批操作。

**3.1.2 第二层：组织级保护 — SCP 策略**

在 AWS Organizations 中创建 Service Control Policy（SCP），从组织层面阻止对受保护实例的停止/终止操作：
    
    
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "DenyStopAndTerminateProtectedInstances",
                "Effect": "Deny",
                "Action": [
                    "ec2:StopInstances",
                    "ec2:TerminateInstances"
                ],
                "Resource": "arn:aws:ec2:*:*:instance/*",
                "Condition": {
                    "StringEquals": {
                        "ec2:ResourceTag/StopForbidden": "true"
                    }
                }
            }
        ]
    }
    

说明：SCP 对组织中所有成员账户的所有 IAM 主体生效（包括 Admin 角色），但不影响组织管理账户。如需豁免特定角色（如紧急运维角色），可在 Condition 中添加 `ArnNotLike` 排除。

**3.1.3 第三层：关闭 Auto Recovery**

EC2 的简化自动恢复（Simplified Auto Recovery）默认开启。当底层硬件异常时，AWS 会自动将实例迁移到健康主机。

重要说明：根据 AWS 官方文档，纯 Instance Store 实例（如 i3、i3en、d2、d3 等没有 EBS root volume 的实例）本身就不支持 Simplified Auto Recovery，因此不会被自动迁移。但对于混合实例（既有 EBS root 又有 Instance Store data volume 的实例，如 c5d、m5d、r5d、g4dn 等），Auto Recovery 可能会触发实例迁移，此时 Instance Store 数据会丢失。CloudWatch action based recovery 则明确会导致 Instance Store 数据丢失。 

因此，对于混合实例（EBS root + Instance Store data），建议关闭 Auto Recovery：
    
    
    # 已有实例
    aws ec2 modify-instance-maintenance-options \ 
        --instance-id i-xxx \
        --auto-recovery disabled
    
    # 新建实例（在 run-instances 中指定）
    aws ec2 run-instances \
        --instance-type i3.8xlarge \
        --maintenance-options AutoRecovery=Disabled \
        ...
    

权衡：关闭 Auto Recovery 后，当底层硬件故障时实例不会自动恢复。您需要自行通过监控（如 EC2 `StatusCheckFailed_System` 指标）发现问题并手动执行 stop/start。这是”保护数据”与”自动恢复可用性”之间的 trade-off，对于数据不可丢失的场景，建议选择保护数据。

**3.1.4 第四层：Launch Template 统一配置**

建议在 Launch Template 中统一设置以下安全属性，确保新建实例自动获得保护：

  * DisableApiStop: true
  * DisableApiTermination: true
  * MaintenanceOptions.AutoRecovery: disabled
  * HibernationOptions.Configured: false
  * （可选）指定 Placement Group（Partition）分散部署



### 3.2 方案 B：集群扩缩容保护

适用场景：#10-#12

Auto Scaling Group：禁用缩容策略
    
    
    # 将 Min/Max/Desired 设为相同值，或禁用 scaling policy
    aws autoscaling update-auto-scaling-group \
        --auto-scaling-group-name my-instance-store-asg \
        --min-size 3 --max-size 3 --desired-capacity 3
    

Karpenter（EKS 场景）：使用 do-not-disrupt annotation
    
    
    apiVersion: v1
    kind: Pod
    metadata:
      annotations:
        karpenter.sh/do-not-disrupt: "true"
    

或在 NodePool 中设置 disruption.consolidationPolicy: WhenEmpty 避免主动合并节点。

### 3.3 方案 C：EventBridge + Lambda 自动化巡检

以上手动配置在小规模环境中可行，但面对数十到数百台 Instance Store 实例时，遗漏和配置漂移是必然的。我们开发了基于 EventBridge + Lambda 的自动化方案来解决这个问题。

**3.3.1 设计目标**

能力 | 实现方式  
---|---  
新实例自动保护 | EventBridge 监听 EC2 State Change → Lambda 自动开启保护  
配置漂移检测 | EventBridge Schedule 定时触发 → Lambda 扫描并修复  
异常告警 | SNS 通知运维团队  
判断是否需要保护 | 调用 describe_instance_types API 检查 instanceStorageSupported  
  
**3.3.2 架构图**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/03/how-to-ec2-instance-storage-instance-store-1.png>) [图1 Figure: EC2 Auto-Protection Architecture]  
---  
  
**3.3.3 核心代码**
    
    
    import boto3
    import os
    from functools import lru_cache
    
    ec2 = boto3.client('ec2')
    sns = boto3.client('sns')
    SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')
    PROTECTION_TAG = {'Key': 'StopForbidden', 'Value': 'true'}
    
    
    @lru_cache(maxsize=256)
    def has_instance_store(instance_type: str) -> bool:
        """
        通过 describe_instance_types API 准确判断实例是否支持 Instance Store。
        比硬编码 family 列表更健壮，能自动适配新实例类型。
        """
        try:
            resp = ec2.describe_instance_types(InstanceTypes=[instance_type])
            info = resp['InstanceTypes'][0]
            return info.get('InstanceStorageSupported', False)
        except Exception:
            return False
    
    
    def enable_protection(instance_id: str) -> dict:
        """为实例启用全套保护"""
        results = {}
        try:
            ec2.modify_instance_attribute(
                InstanceId=instance_id,
                DisableApiStop={'Value': True}
            )
            results['stop_protection'] = 'enabled'
        except Exception as e:
            results['stop_protection'] = f'FAILED: {e}'
    
        try:
            ec2.modify_instance_attribute(
                InstanceId=instance_id,
                DisableApiTermination={'Value': True}
            )
            results['termination_protection'] = 'enabled'
        except Exception as e:
            results['termination_protection'] = f'FAILED: {e}'
    
        try:
            ec2.create_tags(
                Resources=[instance_id],
                Tags=[PROTECTION_TAG]
            )
            results['tag'] = 'applied'
        except Exception as e:
            results['tag'] = f'FAILED: {e}'
    
        try:
            ec2.modify_instance_maintenance_options(
                InstanceId=instance_id,
                AutoRecovery='disabled'
            )
            results['auto_recovery'] = 'disabled'
        except Exception as e:
            results['auto_recovery'] = f'FAILED: {e}'
    
        return results
    
    
    def audit_all_instances() -> list:
        """巡检所有运行中的 Instance Store 实例，检测并修复配置漂移"""
        paginator = ec2.get_paginator('describe_instances')
        issues = []
    
        for page in paginator.paginate(
            Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
        ):
            for res in page['Reservations']:
                for inst in res['Instances']:
                    iid = inst['InstanceId']
                    itype = inst['InstanceType']
    
                    if not has_instance_store(itype):
                        continue
    
                    # 检查 Stop Protection
                    attr = ec2.describe_instance_attribute(
                        InstanceId=iid, Attribute='disableApiStop'
                    )
                    if not attr['DisableApiStop']['Value']:
                        issues.append(f"{iid} ({itype}): Stop Protection OFF")
                        enable_protection(iid)
    
                    # 检查 Termination Protection
                    attr = ec2.describe_instance_attribute(
                        InstanceId=iid, Attribute='disableApiTermination'
                    )
                    if not attr['DisableApiTermination']['Value']:
                        issues.append(f"{iid} ({itype}): Termination Protection OFF")
                        enable_protection(iid)
    
        return issues
    
    
    def handler(event, context):
        """Lambda Handler — 支持实时事件和定时巡检两种触发"""
    
        # 实时保护：新实例启动
        if event.get('source') == 'aws.ec2':
            detail = event['detail']
            instance_id = detail['instance-id']
    
            if detail['state'] == 'running':
                resp = ec2.describe_instances(InstanceIds=[instance_id])
                instance = resp['Reservations'][0]['Instances'][0]
                itype = instance['InstanceType']
    
                if has_instance_store(itype):
                    result = enable_protection(instance_id)
                    print(f"[AUTO-PROTECT] {instance_id} ({itype}): {result}")
    
                    if SNS_TOPIC_ARN:
                        sns.publish(
                            TopicArn=SNS_TOPIC_ARN,
                            Subject=f'[EC2 Auto-Protect] Protected {instance_id}',
                            Message=f'Instance {instance_id} ({itype}) auto-protected.\n{result}'
                        )
    
        # 定时巡检
        else:
            issues = audit_all_instances()
            if issues:
                msg = "Instance Store Protection Audit - Issues Found:\n\n" + "\n".join(issues)
                print(f"[AUDIT] {len(issues)} issues found and auto-fixed")
                if SNS_TOPIC_ARN:
                    sns.publish(
                        TopicArn=SNS_TOPIC_ARN,
                        Subject=f'[EC2 Auto-Protect Audit] {len(issues)} issues fixed',
                        Message=msg
                    )
            else:
                print("[AUDIT] All Instance Store instances properly protected")
    
        return {'statusCode': 200}
    

**3.3.4 EventBridge 配置**

规则 1 — 实时保护（实例启动时）：
    
    
    {
        "source": ["aws.ec2"],
        "detail-type": ["EC2 Instance State-change Notification"],
        "detail": {
            "state": ["running"]
        }
    }
    

规则 2 — 定时巡检：
    
    
    cron(0 2 * * ? *)    # 每天 UTC 02:00 执行
    

**3.3.5 部署**

完整的 Infrastructure as Code 已开源，支持一键部署：

GitHub: [github.com/hellokelson/ec2-auto-protect-stop](<https://github.com/hellokelson/ec2-auto-protect-stop>) *(即将发布)*

计划包含：

  * Lambda 函数代码（Python）
  * EventBridge Rules & Schedule
  * IAM Role & Policy（最小权限）
  * SNS Topic 告警配置
  * CloudFormation 模板



## **四、运维巡检清单**

巡检项 | 频率 | 方式 | 说明  
---|---|---|---  
Stop/Terminate Protection 状态 | 每日 | 自动（Lambda） | 漂移自动修复  
Auto Recovery 状态 | 每日 | 自动（Lambda） | 防止被重新开启  
SCP 策略完整性 | 每周 | 人工 | 防止策略被修改/删除  
Hibernate 设置 | 部署时 | Launch Template | 创建后不可修改  
多副本数据一致性 | 每月 | 人工/监控 | 确保灾备有效  
Placement Group 分散部署 | 部署时 | Launch Template | 减少关联故障  
  
## **五、最佳实践总结**

层级 | 措施 | 保护范围  
---|---|---  
架构设计 | 多副本 + 多 AZ 部署 | 所有不可控场景 (#16-#21)  
实例级 | Stop/Terminate Protection | 人为误操作 (#3-#8)  
组织级 | SCP Deny Policy | 所有 IAM 主体 (#3-#8)  
平台配置 | 关闭 Auto Recovery | 自动恢复触发 (#8-#9)  
集群管理 | 禁用/限制缩容 | ASG/Karpenter (#10-#12)  
自动化 | EventBridge + Lambda | 配置漂移检测与修复  
运维规范 | Launch Template 统一配置 | 新实例默认安全  
  
核心原则：对于使用 Instance Store 且不可接受数据丢失的工作负载——

  * 优先考虑是否真的需要 Instance Store，还是可以使用 io2 Block Express 等持久化高性能存储替代
  * 如果必须使用，确保数据层有多副本 + 多 AZ 的冗余架构
  * 在此基础上，通过本文的纵深防御方案最小化实例意外中断的概率



**下一步行动：**

**相关产品：**

  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=1>) — 安全且可调整大小的计算容量
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=2>) — 无需服务器即可运行代码
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=3>) — 大规模构建事件驱动应用程序
  * [Amazon SNS](<https://aws.amazon.com/cn/sns/?p=bl_pr_sns_l=4>) — 发布/订阅和推送通知
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=5>) — 身份管理和访问权限



**相关文章：**

  * [由定制英特尔至强 6 处理器提供支持的 Amazon EC2 X8i 实例正式发布，适用于内存密集型工作负载](<https://aws.amazon.com/cn/blogs/china/amazon-ec2-x8i-instances-powered-by-custom-intel-xeon-6-processors-are-generally-available-for-memory-intensive-workloads/?p=bl_ar_l=1>)
  * [向量存储成本降低 85%：用 Amazon S3 Vectors 构建企业级多平台统一知识库](<https://aws.amazon.com/cn/blogs/china/build-enterprise-grade-multi-platform-unified-knowledge-base-with-amazon-s3-vectors/?p=bl_ar_l=2>)
  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=3>)
  * [本地 NVMe 存储高达 22.8TB 的 Amazon EC2 C8id、M8id 和 R8id 实例正式发布](<https://aws.amazon.com/cn/blogs/china/amazon-ec2-c8id-m8id-and-r8id-instances-with-up-to-22-8-tb-local-nvme-storage-are-generally-available/?p=bl_ar_l=4>)
  * [宣布推出面向 Amazon ECS 托管实例的托管进程守护程序支持功能](<https://aws.amazon.com/cn/blogs/china/announcing-managed-daemon-support-for-amazon-ecs-managed-instances/?p=bl_ar_l=5>)



## **六、总结**

EC2 Instance Store 以其卓越的本地 I/O 性能在 HBase、Kafka、Redis、临时计算等场景中不可替代，但”实例即数据”的生命周期绑定特性要求我们在运维层面建立系统化的保护机制。

本文提供的纵深防御体系——从 SCP 策略到 EventBridge 自动巡检——形成了”防误操作 → 防自动触发 → 防配置漂移 → 兜底灾备”的完整防护链路。通过部署本文提供的自动化方案，即使在数百台 Instance Store 实例的大规模环境中，也能确保每一台实例都处于持续保护之下。

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张凯

亚马逊云科技解决方案架构师，主要负责基于亚马逊云科技的解决方案架构设计和的方案咨询；具有多年的架构设计、项目管理经验。

### 林海

亚马逊云科技技术客户经理，专注于为企业客户提供云计算技术方案咨询和最佳实践指导。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
