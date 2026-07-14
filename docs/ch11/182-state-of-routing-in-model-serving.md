# State of Routing in Model Serving

## Ch11.182 State of Routing in Model Serving

> 📊 Level ⭐⭐ | 6.6KB | `entities/state-of-routing-in-model-serving.md`

# State of Routing in Model Serving

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/state-of-routing-in-model-serving.md)

## 摘要

Netflix 技术博客系列文章，详细介绍了其 ML 模型服务基础设施中的流量路由架构演进。核心挑战是：如何在保持客户端简单抽象的同时，将请求路由到正确的模型实例、正确的集群分片、为正确的用户和用例服务。文章介绍了从自研路由服务 Switchboard 到轻量级架构 Lightbulb 的演进过程，以及引入 Envoy 作为数据面路由层的决策。截至 2025 年，该平台服务数百种模型类型和版本，处理每秒 100 万次请求。

## 核心要点

### 1. 模型 Serving vs 模型 Inference 的区分

Netflix 对"模型"的定义有别于传统理解。模型 inference 通常只关注 `infer(features) -> score` 能力，而 Netflix 的模型是一个**自包含工作流**（self-contained workflow），封装了预处理、后处理、特征计算逻辑和可选的 ML 训练组件。这种端到端执行被称为 model serving。路由和 API 抽象在工作流层面运作，而非仅在评分函数层面。

### 2. 三大平台设计原则

- **模型创新独立于客户端应用**：调用方只需与 ML serving 平台做一次集成，之后几乎所有模型迭代（包括 A/B 实验）对客户端透明
- **解耦客户端与模型分片**：模型分布在多个集群分片上，每个分片有独立 VIP 地址，客户端无需感知频繁的 VIP 变更
- **灵活的流量路由规则**：支持基于 A/B 实验的路由、渐进式流量切换、客户端覆盖等机制

### 3. Switchboard 架构

标准 API Gateway 方案（如 AWS API Gateway、Service Mesh proxy）无法满足需求，Netflix 自研了 Switchboard：
- **作为所有流量的强制入口**，处理每秒 100 万+请求
- **Objective 抽象**：每个请求必须提供一个 Objective（枚举值，如 `ContinueWatchingRanking`），解耦客户端与具体模型
- **Switchboard Rules**：用 JavaScript 配置定义 A/B 实验规则、默认模型、流量分割策略
- **关键能力**：通用客户端抽象、上下文感知路由、动态流量分割、模型版本和生命周期管理（Shadow Mode、Canary、Instant Rollback）

### 4. Switchboard 的演进挑战

随着规模增长，Switchboard 暴露出三个核心问题：
- **单点故障风险**：Switchboard 在请求关键路径上，故障会波及所有 ML 驱动的体验
- **额外延迟**：序列化/反序列化带来 10-20ms 延迟，对延迟敏感客户端不可接受
- **客户端灵活性降低**：Switchboard 遮蔽了请求来源信息，难以区分真实流量与测试流量

### 5. Lightbulb 架构

Lightbulb 的核心思路是**将路由服务从直接请求路径中移除**：
- 将 Switchboard Rules 拆分为两部分：**Model Serving Configuration**（模型选择）和 **Routing Rules**（VIP 路由）
- Lightbulb 负责将请求上下文解析为 routingKey + ObjectiveConfig
- routingKey 放入 header 供 **Envoy** 消费，ObjectiveConfig 放入请求体
- Envoy 已用于 Netflix 所有应用间出站通信，天然具备集群路由能力
- 保留了 Switchboard 的核心优势（单一集成点、模型 ID 抽象、上下文路由），同时解决了延迟和单点故障问题

## 深度分析

### Objective 模式的设计智慧

Objective 抽象是整个架构的核心设计决策。它将业务用例（如"继续观看排序"）与具体模型实现解耦，使得：
- 研究人员可以自由替换模型而无需通知客户端
- A/B 测试配置独立于服务代码发布周期
- 多个模型版本可以并行服务不同用户群体

这种模式本质上是一种**服务网格中的虚拟服务抽象**，但专门为 ML serving 场景定制。

### 从 Switchboard 到 Lightbulb 的架构演进启示

这一演进体现了经典的**中心化 vs 去中心化**架构权衡：

| 维度 | Switchboard（中心化） | Lightbulb（去中心化） |
|------|---------------------|---------------------|
| 请求路径 | 经过中心路由服务 | 直接到达目标集群 |
| 延迟 | +10-20ms | 接近零额外延迟 |
| 故障影响 | 单点故障影响全部 | 局部故障隔离 |
| 复杂度 | 集中管理简单 | 需要多组件协调 |
| 配置传播 | 实时生效 | 通过 Envoy 配置分发 |

Netflix 的选择表明：在 ML serving 规模增长后，将路由逻辑下沉到 sidecar（Envoy）是更可持续的架构方向。

### 与 Envoy 生态的整合

Netflix 利用 Envoy 已有的集群路由能力，仅需补充 Lightbulb 来处理 Envoy 原生不支持的上下文感知路由。这体现了**最大化复用基础设施**的工程原则，避免重新发明轮子。

## 实践启示

1. **ML Serving 不等于模型推理**：将预处理、后处理、特征计算统一封装为"serving workflow"，可以大幅简化客户端集成
2. **Objective 模式可借鉴**：任何需要解耦业务用例与技术实现的场景，都可以考虑类似的枚举抽象
3. **中心化路由的演进路径**：先用中心化方案快速验证，再在规模压力下向去中心化演进，是成熟的架构策略
4. **A/B 测试配置与代码解耦**：将实验配置独立于服务代码发布周期，可以大幅提升 ML 研究迭代速度
5. **Envoy 在 ML 基础设施中的潜力**：Envoy 不仅是通用 Service Mesh，也可以成为 ML serving 的路由基础设施

## 相关实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01/1123-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- [Karpathy Vibe Coding Agentic Engineering](../ch04/126-karpathy-vibe-coding-agentic-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/state-of-routing-in-model-serving.md)

---

