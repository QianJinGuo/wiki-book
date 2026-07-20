# AWS Network Firewall 审查 IDC-VPC 流量：VGW 架构 + BGP 路由传播实验

## Ch11.033 AWS Network Firewall 审查 IDC-VPC 流量：VGW 架构 + BGP 路由传播实验

> 📊 Level ⭐⭐ | 14.8KB | `entities/aws-network-firewall-vgw-bgp-traffic-inspection.md`

> [!abstract]
> AWS China Blog 2026-06-12 实验笔记：用 CloudFormation 搭建 VPC + 模拟 IDC 环境，开启 BGP 路由传播 + 手工配置高优先级路由条目，验证 IDC ↔ 云之间流量经 AWS Network Firewall 审查的完整方案。
> 来源：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/使用-aws-network-firewall-服务审查-idc-和云上-vpc-间的流量-vgw-架构的设计和实验.md)

## 场景与挑战

**场景**：企业使用 DX（Direct Connect）专线连接 IDC 与 AWS，IDC 内业务系统需访问云上 VPC 中的资源。

**挑战**：默认情况下，DX 流量通过 VGW（Virtual Private Gateway）**直接**进入 VPC 路由表，绕过任何中间防火墙。**这意味着 NFW（Network Firewall）默认不会审查 DX 流量**。

**目标**：让 DX ↔ VPC 流量**强制**经过 NFW 审查（合规需求：所有跨境流量必须经过 IDS/IPS）。

## 核心架构

```
        ┌──── IDC (模拟) ─────┐
        │  10.0.0.0/16        │
        │  Customer Router    │
        │  BGP ASN 65000      │
        └─────────┬────────────┘
                  │ DX 专线
        ┌─────────▼────────────┐
        │  VGW (Virtual        │
        │  Private Gateway)    │
        │  BGP ASN 7224        │
        └─────────┬────────────┘
                  │ (默认: 流量直接进 VPC 路由表)
                  │
        ┌─────────▼────────────┐
        │  VPC Route Table     │
        │  10.0.0.0/16 → local │
        │  ❌ 默认无 NFW 入口  │
        └──────────────────────┘
```

**修复后**：
```
        ┌──── IDC (模拟) ─────┐
        │  Customer Router    │
        │  10.0.0.0/16        │
        └─────────┬────────────┘
                  │ DX
        ┌─────────▼────────────┐
        │  VGW                 │
        └─────────┬────────────┘
                  │ (1) 路由传播：BGP 学习 10.0.0.0/16
        ┌─────────▼────────────┐
        │  VPC Route Table     │
        │  10.0.0.0/16 → local (BGP 传播) │
        │  10.0.0.0/16 → NFW ENI (手工高优先级) │  ← 关键!
        └─────────┬────────────┘
                  │ (2) 流量实际走向
        ┌─────────▼────────────┐
        │  NFW (Network        │
        │  Firewall)           │
        │  Suricata rules      │
        └─────────┬────────────┘
                  │ (3) 审查后
        ┌─────────▼────────────┐
        │  VPC 内 EC2          │
        └──────────────────────┘
```

## 关键技术点

### 1. BGP 路由传播

在 VGW 上启用 **Route Propagation**，VPC 路由表自动学习 IDC 子网（10.0.0.0/16）作为 VGW 传播路由。

### 2. 手工高优先级路由

- 在 VPC 路由表中**手工添加** `10.0.0.0/16 → NFW ENI` 的路由条目
- 关键：手工路由的优先级**高于** VGW 传播路由（VPC 路由表：最具体前缀优先 + 静态优先于传播）
- 这强制 DX 流量**先**进入 NFW 审查，**再**转发到 EC2

### 3. NFW 路由配置

NFW 本身需要：
- **Firewall Subnet** — 在 VPC 内建一个专用子网放 NFW ENI
- **Routing** — NFW 默认有"pass through"规则，需要自定义 Suricata 规则做 IDS

### 4. 验证实验

CloudFormation 一键部署 → IDC 模拟器发 HTTP 请求 → VPC 内 EC2 收到请求并响应 → 中间 NFW 日志可查 → 验证流量确实经过 NFW。

## VGW vs TGW 场景选择

| 场景 | 推荐 |
|------|------|
| 单 VPC + DX | **VGW**（简单、便宜） |
| 多 VPC + DX（VPC Peering 不足） | **TGW**（中心辐射、统一路由） |
| 多账号 + 多 VPC + 多 IDC | **TGW + TGW Peering + Resource Access Manager** |

## 深度分析

### 1. VGW + NFW 架构：静态路由劫持流量的实现原理

本方案的核心创新在于**不关闭 BGP 路由传播**，而是利用 VPC 路由表的优先级机制实现流量劫持。具体逻辑：

1. VGW 向 VPC 路由表传播 IDC 路由（`10.0.0.0/16 → VGW`），作为动态 propagated route
2. 管理员在同一路由表手工添加 `10.0.0.0/16 → NFW ENI` 的静态路由
3. VPC 路由表决策时：**更长前缀优先**（两者相同）+ **静态路由优先于 propagated route**，使得静态路由优先生效
4. 流量从 IDC 进入 VGW 后，被强制牵引至 NFW 审查，再转发至 VPC 内 EC2

这一设计避免了"关闭 BGP 传播→手工填写所有 IDC 子网路由"的运维负担，同时保持了 BGP 动态收敛的能力。

### 2. BGP 路由传播是 AWS 跨网络互联的统一基础

无论是 DX 专线 + VGW、Site-to-Site VPN + VGW，还是 TGW + TGW Peering，BGP AS-Path 宣告与路由传播机制都是 AWS 实现云上云下互通的统一底层协议。实验中采用 VPN + VGW 模拟 DX，就是因为两者的 BGP 行为完全一致——都支持在 VGW 层面开启 Route Propagation，使 VPC 自动学习对端网络前缀。

理解 BGP 路由优先级（最长匹配 + 静态优于传播）是掌握 AWS 网络流量工程的关键，也是本方案区别于"简单防火墙规则"的核心技术壁垒。

### 3. 主动拦截 vs 被动监听：NFW 的架构定位

AWS Network Firewall 是一个**内联（inline）状态检测设备**，而非被动监听 tap。这意味着：

- NFW 必须位于流量必经路径上（通过路由表主动插入）
- 它对双向流量（IDC→VPC 和 VPC→IDC）均需独立配置路由指向
- Suricata 规则引擎工作在第七层，支持状态ful 检测；但默认 pass-through 规则不会主动拦截，需要显式配置拦截策略（如 `STRICT_ORDER` 下序号更小的规则优先拦截 HTTP）

这一特性与 AWS Gateway Load Balancer（GWLB）的被动分发模式形成对比：NFW 依赖路由表主动引流，而 GWLB 可通过 GRE 封装实现透明分发。

### 4. 双 AZ NFW 高可用：生产部署的必要条件

实验模板在 AZ1 和 AZ2 各部署了一个 NFW Endpoint，分别关联对应子网的路由表。生产环境中，单 NFW 部署是单点故障——AZ 级别的硬件故障会导致全部流量无法审查。正确做法：

- NFW Policy 开启**跨 AZ 自动故障转移**（Suricata 有状态会话可跨 AZ 保持）
- 路由表同时指向两个 AZ 的 NFW ENI（等成本多路径 ECMP）
- 配合 CloudWatch Alarm 监控 NFW 可用性，实现自动告警

### 5. VGW 与 TGW 的选型判断框架

| 判断维度 | VGW 适用场景 | TGW 适用场景 |
|----------|-------------|-------------|
| VPC 数量 | 单 VPC | 多 VPC（中心辐射拓扑） |
| 成本模型 | 无流量处理费（仅 DX 连接费） | 按 attachment 时长 + 数据处理量计费 |
| 路由复杂度 | 需要手工点对点配置多 VPC 互联 | TGW 路由表统一管理，VPC  间自动转发 |
| 多账号支持 | 不支持 | 支持 Resource Access Manager（RAM）跨账号共享 |
| DX 场景 | **最佳选择**（简单、低成本） | 可用但不经济 |

当 IDC 需要同时连接多个 VPC 时，TGW 的中心辐射架构可显著降低路由管理复杂度；当仅有一个业务 VPC 时，VGW 是成本与功能的最优解。

## 实践启示

1. **NFW 默认不审查 DX 流量是常见误区** — VGW 是 L3 直通路由，NFW 必须通过**手工路由条目**插入到流量路径中。
2. **路由优先级是这种"流量劫持"架构的核心** — BGP 传播的动态路由 + 手工静态路由冲突时，VPC 路由表按"最具体前缀优先 + 静态优先"决策。
3. **BGP 路由传播是 AWS 跨网络互联的关键技术** — 不只是 DX，还包括 TGW Peering、VPN，都依赖 BGP。
4. **实验环境（CFN 一键部署）降低了 NFW 验证门槛** — 生产部署 NFW 之前，先用 CFN 实验模板验证路由逻辑。
5. **生产中需配合"NFW 双活/HA"** — 单 NFW 是单点故障，应跨 AZ 部署 + 自动故障转移。
6. **双向流量均需独立路由配置**：不仅要在 `prv-rt-az1/az2`（VPC→IDC 方向）指向 NFW，还必须在 `vgw-ingress-rt`（IDC→VPC 方向）配置指向 NFW，否则只能单向审查。
7. **NFW Suricata 规则顺序决定拦截行为** — `STRICT_ORDER` 模式下，序号更小的规则优先执行；实验模板配置为：拦截 HTTP 请求，其余流量放行，这与 IDC→VPC 方向 curl 被拦截的现象完全对应。
8. **Site-to-Site VPN + VGW 可替代 DX 做技术验证** — 两者 BGP 路由行为完全一致，且可随时销毁重建，适合在无法申请 DX 物理电路时进行 PoC 验证。
9. **NFW 日志需开启 Flow + Alert 双通道** — Flow 日志记录所有流量会话，Alert 日志记录触发拦截/告警的规则匹配事件；两者结合才能完整还原一次攻击链。参见 [AWS NFW 规则冲突 AI 检测](ch11/125-aws-network-firewall-ai.html)。
10. **合规审查场景中"流量可见性"是前提** — NFW 不仅拦截流量，更是合规审计的数据源；所有 IDC↔VPC 双向流量均需经过 NFW 并留存日志，以满足等保/GDPR 等监管要求。

## 关键引用清单

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/使用-aws-network-firewall-服务审查-idc-和云上-vpc-间的流量-vgw-架构的设计和实验.md)
- [AWS NFW 规则冲突 AI 检测](ch11/125-aws-network-firewall-ai.html) — 姐妹篇（AI 集成）
- [LiteLLM ECS/EKS 部署](../ch01/1237-llm.html) — 同样部署在 VPC 中，受 NFW 保护
- [QuickSight Dataset Q&A](ch11/173-aws-quicksight-dataset-qa-natural-language.html)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

