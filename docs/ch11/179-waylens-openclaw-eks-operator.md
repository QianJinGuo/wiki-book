# Waylens OpenClaw 多智能体平台 EKS+Operator 改造案例

## Ch11.179 Waylens OpenClaw 多智能体平台 EKS+Operator 改造案例

> 📊 Level ⭐⭐ | 6.7KB | `entities/waylens-openclaw-multi-agent-eks-operator-case.md`

## 深度分析
> AWS China Blog 2026-06-12 案例研究：车载视频 AI 厂商 Waylens 把分散在 N 台 EC2 上的 OpenClaw 多智能体平台迁移到 Amazon EKS + CRD + Operator 三层架构。核心创新是 **把平台自身运维交给 agent 自管理**——Admin agent 负责跨 agent 升级编排，Rex（Backup EKS Operator）在 Admin 故障时接管，巡检/升级/故障恢复全 agent 化。配套 aws-samples/sample-your-opc-eks-agents 一键部署仓库。
> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/从-n-台-ec2-到-amazon-eks-amazon-s3-fileswaylens-的-openclaw-多智能.md)

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

- [多智能体编排](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)（概念层）
- [AWS Bedrock AgentCore OS-level 浏览器工具](ch11/246-aws-bedrock-agentcore.html)
- [Aliyun AgentRun 5min 快速上手](../ch04/463-agentrun.html)

---

