# Waylens OpenClaw 多智能体平台 EKS+Operator 改造案例

> 📊 Level ⭐⭐⭐ | 10.0KB

## 深度分析
> AWS China Blog 2026-06-12 案例研究：车载视频 AI 厂商 Waylens 把分散在 N 台 EC2 上的 OpenClaw 多智能体平台迁移到 Amazon EKS + CRD + Operator 三层架构。核心创新是 **把平台自身运维交给 agent 自管理**——Admin agent 负责跨 agent 升级编排，Rex（Backup EKS Operator）在 Admin 故障时接管，巡检/升级/故障恢复全 agent 化。配套 aws-samples/sample-your-opc-eks-agents 一键部署仓库。
> 来源：[原文存档](https://aws.amazon.com/cn/blogs/china/n-ec2-amazon-eks-amazon-s3-files-waylens-openclaw-intelligent-platform)

### 声明式收敛：agent 从"单进程"升格为"k8s 资源"

迁移的本质不是 EC2 换成 pod，而是把每个 agent 从用户态单进程重新声明为一份 `OpenClawInstance` CR，由 Operator 展开成 StatefulSet + Pod + Service，升级、换模型、改人设统一为改 YAML。EC2 时代的三类痛点（小版本升级即崩溃、SOUL 漏改导致"性格漂移"、N 台机器=N 套运维）在结构上被消灭：漂移会在下一个 reconcile 周期收敛回声明态，YAML 成为唯一事实来源。这与 [Orchestrator Worker Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/orchestrator-worker-architecture.md) 同构：控制面不执行业务，只保证实际状态向声明状态收敛。

### 双层自愈与 Rex 的单向冗余

自愈拆成两层：EKS 层（滚动升级、liveness 重建、漂移收敛）回答"Pod 挂了怎么办"；语义层（何时升、怎么灰度）交给 Admin——选 Josh 做 canary 观察 24 小时，回归则自动 patch 回上一个 digest，SOUL 写死"先读后写"与"破坏性操作 @ 工程师确认"。Admin 成为新单点后由 Rex（Backup EKS Operator）接管，但冗余是单向的：Admin 不持 AWS 运维权限，不能反向备份 Rex。不对称是刻意的：AWS 资源面破坏性远大于 EKS 面，高危权限收窄到单一角色比"互为备份"更可控；链路尽头（删 IAM、销毁集群级资源）仍留人工签字。

### 分层选模：多 agent 架构独有的成本自由度

CR 把模型选择下放到每个 agent 后，出现单 agent 没有的自由度：决策密度高的 Admin/Rex 用高性能模型，高频低风险的 Luna/Josh 用经济型模型，配合 Rex 复核链路，整体推理成本比全员旗舰低一个量级。"改一行 YAML 换模型"让选型实验变成 agent 任务：Josh 试新模型、回归落 `/shared/eval/`、Rex 评审、工程师只在"是否给 Admin/Rex 换"签字——模型选型从运维事项变成平台自助实验。这是 [Agent Role Specialization](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-role-specialization.md) 的基础设施化表达：角色分工写进 CR 后，获得独立调参、独立升权的运维语义。

### 共享文件系统作为协作原语，与可复制的迁移样本

跨 agent 协作靠 Discord @ 提及 + `/shared` POSIX 路径：S3 Files 把 S3 桶以 NFS 形态挂进 Pod，纪要、调研报告、运维变更日志统一落盘；Milo 主持的会议机制（其余 agent 点名才发言、超 3 轮强制收敛）靠人设规则而非代码实现，会议因读上次纪要而带记忆。对比 wiki 内其他 OpenClaw 平台路线——[Openclaw Multi 7 Ecs Fargate Graviton](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-7-ecs-fargate-graviton.md) 走 Fargate 多租户，[Mountpoint S3 Vs S3 Files Eks Storage Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mountpoint-s3-vs-s3-files-eks-storage-comparison.md) 聚焦存储选型——本案例的独特贡献是把升级/巡检/故障恢复的运维闭环整体交给 agent 自管理，是 [Multi Agent Collaboration Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md) 少见的可整体复用的生产样本。

## 痛点：agent 平台运维吃掉业务时间

Waylens 是车载视频 AI + 车队智能化厂商，其 OpenClaw 多智能体（multi-agent）平台早期部署在多台 Amazon EC2 上，规模扩大后出现典型"平台绑架业务"症状：

- **调试时间 > 业务时间**：工程师用于调试 agent 平台的时间已经超过实际使用 agent 完成业务的时间
- **升级割裂**：多 agent 各自独立升级，无法统一编排
- **故障恢复手工**：admin/worker agent 故障时需要人工介入
- **资源争抢**：EC2 静态分配，无法按 agent 负载弹性伸缩

## 方案：EKS + CRD + Operator 三层架构

迁移到由 **Amazon EKS + Custom Resource Definition (CRD) + Operator** 统一管理的形态：

```
┌────────────────────────────────────────────┐
│  Admin Agent (升级编排 + 日常运维)            │
├────────────────────────────────────────────┤
│  Worker Agents (业务执行)                    │
├────────────────────────────────────────────┤
│  OpenClaw Operator (EKS CRD controller)     │
│   ↕ liveness 自愈 + 滚动升级                  │
├────────────────────────────────────────────┤
│  Amazon EKS (k8s control plane)             │
├────────────────────────────────────────────┤
│  Amazon S3 Files (共享文件系统)              │
└────────────────────────────────────────────┘
```

**关键设计决策**（区别于普通 k8s 化）：

1. **EKS CRD 把 OpenClaw 抽象为一等公民**：每个 agent 类型是一个 CRD 资源，Operator 负责 reconcile
2. **Admin agent 是元智能体**：负责跨 worker agent 的升级编排和日常运维，本身也作为 CRD 部署
3. **Rex（Backup EKS Operator）做 meta-redundancy**：Admin 自身故障时由 Rex 接管，确保"管 agent 的 agent"不会成为单点
4. **S3 Files 替代 NFS**：避免 StatefulSet 跨 AZ 漂移时的存储重建问题
5. **Liveness 自愈 = operator-controller-pattern**：EKS 层滚动升级不依赖人工

## 改造成果

- 升级、巡检、故障恢复**全部由 agent 自己完成**
- 工程师从平台运维中解放，回归业务开发
- 巡检响应时间从天级降到分钟级
- Agent 平台可按负载弹性伸缩（EC2 静态资源 → EKS 弹性 pod）

## 一键部署

AWS Samples 提供 `sample-your-opc-eks-agents` 仓库，包含：
- EKS cluster 模板（VPC + subnets + IAM）
- OpenClaw CRD 定义
- Operator controller 镜像
- Admin agent + sample worker agent Helm chart
- Rex backup operator 配置示例

## 三个独有贡献

1. **平台 agent 自管理**（meta-agent pattern）—— 通常做法是平台运维靠 SRE，本文让 agent 管 agent
2. **EKS CRD + Operator 模式做多智能体编排** —— 把"agent 类型"作为 k8s 一等资源，operator reconcile 替代手工运维
3. **Rex 双重冗余（meta-redundancy）** —— "管 agent 的 agent"也是 agent 也有故障，所以引入第二层 EKS operator 备份

## 与现有实体的差异化

| 维度 | 本案例 (Waylens) | 通用 agent 编排理论 | 阿里/腾讯生产案例 |
|------|----------------|---------------------|------------------|
| 切入点 | 真实厂商生产迁移 | 概念框架 | 内部基础设施 |
| 平台层抽象 | EKS + CRD + Operator | 调度器/worker | 各自私有 runtime |
| 核心创新点 | agent 自管 + Rex 备份 | 多 agent 协议 | 单 agent harness |
| 可复用资产 | aws-samples 仓库 | 仅理论 | 不可下载 |
| 部署形态 | K8s Operator Helm | 论文/博客 | 内部闭源 |

## 相关主题

- 多智能体编排（概念层）
- [AWS Bedrock AgentCore OS-level 浏览器工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-agentcore-os-level-actions-browser.md)
- [Aliyun AgentRun 5min 快速上手](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-agentrun.md)

---

