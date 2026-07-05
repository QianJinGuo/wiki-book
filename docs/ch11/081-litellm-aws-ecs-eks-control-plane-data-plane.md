# LiteLLM 生产级部署：AWS ECS/EKS 双方案 + Control Plane / Data Plane 分离多区域

## Ch11.081 LiteLLM 生产级部署：AWS ECS/EKS 双方案 + Control Plane / Data Plane 分离多区域

> 📊 Level ⭐⭐ | 10.4KB | `entities/litellm-aws-ecs-eks-ai-gateway-architecture.md`

> [!abstract]
> AWS China Blog 2026-06-12 架构指南：在 AWS 上以生产级标准部署 LiteLLM AI Gateway。两条路径：ECS Fargate（零运维、Serverless）与 EKS（K8s 原生、灵活），并结合 Control Plane / Data Plane 分离实现多区域高可用。
> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/litellm-生产级部署基于-aws-ecseks-的-ai-gateway-架构.md)

## 选型决策矩阵

| 维度 | ECS Fargate | EKS |
|------|-------------|-----|
| 运维负担 | 零（AWS 托管 K8s 兼容层） | 中（需懂 K8s 概念） |
| 启动速度 | 1-2 min | 5-10 min（节点组/HPA） |
| 成本 | 按任务计费，闲时 0 | 节点常驻，最低 1 节点 |
| 灵活度 | 中（Task Definition） | 高（Helm/Operator/Custom Resource） |
| 多区域 | Fargate 多 Region 一致体验 | EKS Anywhere / ROSA 复杂 |
| 适用规模 | 中小（<100 RPS） | 中大（>100 RPS，需 K8s 生态） |

## 方案一：ECS Fargate 部署

```yaml
# Task Definition 核心
- image: ghcr.io/berriai/litellm:main-latest
- portMappings: 4000
- environment:
  - DATABASE_URL: postgresql://...  # 共享状态
  - REDIS_URL: redis://...  # 速率限制
- cpu: 1024
- memory: 2048
- desiredCount: 3  # 多副本 + ALB
```

**关键点**：
- ALB 前置 → 多 Fargate Task → Aurora 后端
- Auto Scaling：CPU > 70% 持续 5min → +1 Task
- Secrets Manager 注入 DATABASE_URL/REDIS_URL

## 方案二：EKS 部署

```yaml
# Helm values.yaml 核心
deployment:
  replicas: 3
  resources:
    requests: { cpu: "1", memory: "2Gi" }
service:
  type: ClusterIP  # 配合 ALB Ingress
ingress:
  enabled: true
  className: alb
  hosts: [{ host: litellg.[example.com](), paths: [/] }]
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

**关键点**：
- IRSA（IAM Roles for Service Accounts）注入 S3/Secrets Manager 权限
- ExternalDNS 自动管理 Route53
- HPA + Cluster Autoscaler 联动

## Control Plane / Data Plane 分离（多区域高可用）

```
                  ┌─────────── Control Plane (主区域) ───────────┐
                  │  LiteLLM Admin UI + Config DB (RDS Multi-AZ)  │
                  └─────────────┬───────────────────────────────┘
                                │ (Config Sync)
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼─────┐            ┌────▼─────┐            ┌────▼─────┐
   │ Data Plane│            │ Data Plane│            │ Data Plane│
   │ US-EAST-1 │            │ EU-WEST-1 │            │ AP-NE-1  │
   │ LiteLLM   │            │ LiteLLM   │            │ LiteLLM   │
   │ Proxy     │            │ Proxy     │            │ Proxy     │
   └──────────┘            └──────────┘            └──────────┘
        │                       │                       │
   ┌────▼─────┐            ┌────▼─────┐            ┌────▼─────┐
   │ Bedrock  │            │ Bedrock  │            │ Bedrock  │
   │ (区域)   │            │ (区域)   │            │ (区域)   │
   └──────────┘            └──────────┘            └──────────┘
```

**关键架构原则**：
- **Control Plane 集中**：配置 / 路由规则 / 用户 RBAC 集中管理
- **Data Plane 区域化**：每个区域独立 LiteLLM Proxy，调用本区域 Bedrock（低延迟）
- **Config 同步**：通过 RDS Multi-AZ 跨区域只读副本实现
- **故障隔离**：任一区域 Data Plane 崩溃不影响其他区域

## 安全最佳实践

- **WAF + Shield Advanced** — ALB 前置，挡 DDoS
- **VPC Endpoint** — Bedrock/Polly 等用 PrivateLink，不走公网
- **Secrets Manager 轮换** — 90 天自动轮换 API Key
- **CloudTrail Lake** — 所有 API 调用入审计仓
- **IAM SCP** — 限制 Bedrock 模型白名单

## 深度分析

1. **LiteLLM AI Gateway 的本质是"统一接口层"而非简单代理** — 它不只是把请求转发给 Bedrock，而是承担了 [成本治理](ch01/1171-llm.md)（预算控制、速率限制）、Key 管理（Master Key + 用户级 Key）、响应缓存（Redis）和负载均衡多副本等企业级职责。内部开发者只需要对接一个 OpenAI 兼容 API，底层切换模型或 Provider 对上游完全透明。

2. **ECS Fargate vs EKS 的选择本质是"运维模式 vs 灵活控制"** — Fargate 零节点管理、按容器运行时间计费，适合 <100 RPS中小规模；EKS 引入 Karpenter + Spot + Graviton 可节省 60%+ 成本，但要求团队熟悉 K8s 概念（HPA、IRSA、NetworkPolicy）。选 EKS 而非 Fargate 的理由永远是"团队已有 K8s 技术栈"，而非"LiteLLM 需要 K8s"。

3. **Control Plane / Data Plane 分离是 CAP 权衡在 AI Gateway 上的具体体现** — 每个区域 Data Plane 独立运行本区域 Bedrock（低延迟 + 故障隔离），但配置一致性依赖共享 Aurora Global Database（集中控制）。这是典型的"故障隔离优先"设计：任一区域崩溃不影响其他区域，但增加了全局配置同步的复杂度。

4. **多区域部署的关键变量是"模型所在位置"而非"用户所在位置"** — 调用全球统一模型（如 Claude Opus 4.5）时，单区域 + CloudFront 全球加速足够满足大多数需求；只有调用区域专有模型（如日本 Sovereign Bedrock）时，多区域 Data Plane 才真正必要。这个判断标准能避免大量不必要的架构复杂度。

5. **Serverless 按需付费使成本与业务量严格线性相关** — Aurora Serverless v2 空闲时自动缩至 0.5 ACU、ElastiCache Serverless 零流量时接近零成本、Fargate 按容器运行时计费无请求时无费用。这种成本模型意味着：业务低谷期费用趋近于零，高峰期自动扩容，天然适配 LLM 流量的突发性特征。

## 实践启示

1. **ECS Fargate 是 LiteLLM 起步的最优路径** — 零运维、AWS 托管、5 分钟可上线，足够支撑 0-100 RPS 中小规模。
2. **EKS 适合"已有 K8s 技术栈"团队** — 不要为 LiteLLM 单点引入 K8s 复杂度。
3. **Control/Data Plane 分离是"100+ RPS 跨区域"才需要的架构** — 单区域部署不必过早设计。
4. **多区域调用的关键不是"调用哪个 region 的 Bedrock"而是"模型在哪"** — 全球统一调用 Claude Opus 4.5 不需要多区域，调用区域专有模型（如日本 Sovereign）才需要多区域。
5. **生产级 ≠ 高可用 ≠ 多区域** — 三者常被混为一谈。生产级 = 可观测 + 可回滚 + 限额兜底；高可用 = 多 AZ + 自动恢复；多区域 = 异地容灾 + 延迟优化。

## 关键引用清单

- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/litellm-生产级部署基于-aws-ecseks-的-ai-gateway-架构.md)
- [LiteLLM Bedrock 成本治理](ch01/1171-llm.md) — 姐妹篇（运行时限额 + 审计）
- [LiteLLM + QuickSight 可视化](ch01/1171-llm.md) — 姐妹篇（运维监控）
- [AWS NFW AI 冲突检测](ch04/277-ai.md) — NFW 与 ECS/EKS 部署组合使用

## 架构图
→ [C4 架构图](assets/c4/litellm-aws-ecs-eks-ai-gateway-architecture-c4.html)

---

