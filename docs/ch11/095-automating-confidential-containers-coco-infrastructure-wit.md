# Automating Confidential Containers (CoCo) Infrastructure with Kyverno

## Ch11.095 Automating Confidential Containers (CoCo) Infrastructure with Kyverno

> 📊 Level ⭐⭐ | 9.9KB | `entities/automating-confidential-containers-coco-infrastructure-with-kyverno.md`

## CoCo 工作负载的必备配置
在 CoCo 环境中运行的 Pod 通常需要在清单中注入以下元素：
| 组件 | 必要性 | 作用 |
|------|--------|------|
| `runtimeClass` | 通常必须 | 指定可信运行时环境（如 Kata CC） |
| `initdata` | 通常必须 | 提供引导配置：远程证明服务器地址、镜像策略、kata-agent 策略 |
| `sealed secrets` | 可选 | 远程证明成功后才会解密的应用密钥 |
| `attestation initcar` | 可选 | 辅助证明流程的初始容器 |
| `mTLS sidecar` | 可选 | 安全通信 sidecar |

## 实际部署挑战
CoCo 的安全要求在落地时给应用团队带来了显著摩擦：
1. **基础设施细节被推给应用团队**：开发者需要管理复杂的 CoCo 相关配置，增加了部署门槛
2. **Pod 准入和启动失败**：格式错误或不全的 initdata、错误的注解、缺失的策略字段都可能导致工作负载创建或执行失败

## Kyverno 解决方案
Kyverno 是 Kubernetes 原生的策略引擎，在准入阶段对资源进行**变更（mutate）和验证（validate）**，从而实现 CoCo 配置的自动注入与前置校验。

### 信任悖论：Kyverno 处于不可信控制平面
Kyverno 本身运行在 CoCo 信任模型中标记为不可信的 Kubernetes 控制平面内——这是否构成矛盾？答案在于：**Kyverno 负责的是操作自动化，而非信任建立**。应用所有者仍需自行通过远程证明验证一切，包括容器镜像签名和 Pod 规格的 kata-agent 策略。Kyverno 提升的是部署 ergonomics，真正的安全决策仍由 CoCo 证明和运行时策略完成。

## 团队职责划分
该方案涉及三个团队的清晰分工：

- **平台/基础设施团队**：负责管理底层 Kubernetes 集群，向集群注入 initdata 配置，分配专用命名空间并映射开发者
- **应用安全团队**：提供包含远程证明服务器信息、镜像策略和密钥链接的 initdata 配置，负责实际的远程证明服务器和凭证管理系统
- **应用开发团队**：仅需部署应用清单，CoCo 相关配置由 Kyverno 自动注入

## 部署与证明流程
1. **配置阶段**：App Security 团队提供必要的 `initdata` 配置
2. **策略执行**：App Dev 团队部署应用清单，Kyverno 策略自动为 Pod 注入 `initdata` 和 `runtimeClass`
3. **运行时证明**：Pod 运行时环境触发远程证明，验证 `initdata` 是否被控制平面篡改
4. **条件密钥分发**：凭证或密钥仅在证明成功后才会送达，确保敏感数据仅在已验证的可信运行环境中可用

## 相关实体
- [Eks Gpu Operator Custom Driver Cuda Workload](https://github.com/QianJinGuo/wiki/blob/main/entities/eks-gpu-operator-custom-driver-cuda-workload.md)
- [From Kubernetes Dev Setup To Production What Actually Change](ch11/083-from-kubernetes-dev-setup-to-production-what-actually-chang.html)
- [Back Up And Restore Your Amazon Eks Cluster Resources Using ](ch11/012-back-up-and-restore-your-amazon-eks-cluster-resources-using.html)
- [Hiclaw V110 K8S Hermes Worker](../ch01/1211-0.html)
- [Build Multi Tenant Ai Agent On Eks Graviton Openclaw K8S Practice](ch11/227-openclaw.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/automating-confidential-containers-coco-infrastructure-with-kyverno.md)（CNCF Blog, 2026-05-19）

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)
## 深度分析
### 1. 零信任安全模型的工程化代价
CoCo 将"控制平面不可信"作为核心安全公理，这从设计上是对的——但这把安全验证的复杂度从基础设施层推到了应用层。Kyverno 的价值在于将这部分复杂度重新封装回平台层，让应用开发者无需理解 TEE、RTMR、initdata 等底层概念即可部署可信工作负载。这是一种典型的**平台工程（Platform Engineering）** 思路：通过 API 抽象掉安全复杂性。

### 2. Policy as Code 的双重角色
Kyverno 在此方案中扮演了两个不同性质的角色：**mutate**（自动化注入）和 **validate**（拒绝不合规配置）。前者是纯操作性的，后者才涉及安全决策的强制执行。但关键在于，这两种角色都不负责"建立信任"——信任由远程证明在运行时单独建立。这意味着 Kyverno 策略的失效（如 bug 或配置错误）不会直接导致安全漏洞，因为运行时证明层仍会捕获异常。

### 3. 三团队分工模型的现实意义
文章提出的 Platform Team / App Security Team / App Dev Team 三角模型值得注意。通常企业在引入 CoCo 时容易陷入"安全团队包揽一切"或"应用团队自行处理"两个极端。这个三角模型的核心洞察是：**initdata 的提供者是 App Security Team，而非 Platform Team**，因为 initdata 包含敏感的安全策略（远程证明服务器地址、镜像签名密钥），这些应由安全团队而非基础设施团队持有。

### 4. 条件密钥分发（Conditional Secret Delivery）的安全价值
"密钥仅在远程证明成功后分发"这一设计是关键安全特性。它意味着即使攻击者通过某种方式获取了被篡改的 Pod 清单，敏感的镜像签名验证密钥或应用密钥也不会被释放——因为证明在运行时失败，密钥分发被阻断。这是一个**深度防御（Defense in Depth）** 实践，即使控制平面被攻破，攻击者也无法获取密钥。

### 5. Kyverno 与 CoCo 集成的局限性
文章坦诚指出了关键局限：Kyverno 本身处于不可信控制平面内，这意味着 Kyverno 的策略定义文件本身也需要被信任——这通常通过管理面访问控制和 GitOps 流程来保障，而非 Kyverno 自身。换言之，策略即代码（Policy as Code）的安全性取决于 CI/CD 流水线的安全性，而非策略引擎本身。这不是 Kyverno 的缺陷，而是分布式安全的本质约束。

## 实践启示
### 1. 优先建立策略库，再推广到应用团队
在全面采用前，应先在 Kyverno 策略库中积累经过验证的 CoCo 策略模板，并通过 ` ClusterPolicy` 固化到集群层面。应用团队只需通过命名空间标签声明"我需要 CoCo"，其余自动完成。这是**门控（Gate）模式**的典型应用。

### 2. 将 initdata 配置的所有权明确归于 App Security Team
initdata 包含敏感的安全材料（远程证明服务器地址、镜像策略），Platform Team 不应拥有或管理这些信息。建议通过 Kubernetes Secret 或外部的秘密管理服务（如 Vault）由 App Security Team 单独管理，Platform Team 仅负责引用。

### 3. 利用 validate 策略做 admission 前置检查
Kyverno 的验证策略应在 Pod 创建时即拒绝不合规的 CoCo 配置（如缺失 runtimeClass、initdata 格式错误），而不是等到运行时才失败。这能大幅缩短故障发现周期，减少调试成本。

### 4. 为应用团队提供 CoCo 声明式接口
建议在 Kyverno 之上封装一层更简单的接口，例如在 Namespace 上添加注解 `coco/enabled: "true"` 或标签 `coco-profile: trusted`，让应用开发者无需编写完整的 CoCo Pod 清单即可启用机密计算能力。

### 5. 建立 CoCo 策略的 GitOps 审查流程
由于 Kyverno 策略本身也是 Kubernetes 资源，应将其纳入 GitOps 流程（ArgoCD 或 Flux），并要求所有策略变更经过安全团队的 Code Review。策略文件的版本控制历史本身就是安全审计的重要依据。

## 关联阅读
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/automating-confidential-containers-coco-infrastructure-with-kyverno.md)
- [Kyverno Policy Library - Confidential Computing](https://main.kyverno.io/policies/)（官方策略库，可按 Confidential Computing 标签筛选）
- [Kata Containers Agent Policy](https://github.com/kata-containers/kata-containers/blob/main/docs/how-to/how-to-use-the-kata-agent-policy.md)
- [Confidential Containers initdata 文档](https://confidentialcontainers.org/docs/features/initdata/)

---

