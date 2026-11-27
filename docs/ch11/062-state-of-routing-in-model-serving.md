# State of Routing in Model Serving

> 📊 Level ⭐⭐⭐ | 10.3KB

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

### Objective：平台与客户端之间的路由契约

Objective 不是一枚普通的枚举标签，而是一份双向契约。客户端只需声明业务用例（例如"继续观看行的排序"），就把"用哪个模型、落在哪个集群分片、归入哪些实验组"的整串决策让渡给平台。原文将其概括为三重目的，实质可以归结为一笔交换：客户端放弃对模型选择的控制权，换来一次集成、长期免维护的稳定性——此后模型换代、影子发布、实验扩量，都不再需要客户端改一行代码。

这份契约能够成立，前提是 Netflix 对"模型"的定义被放大为端到端工作流：预处理、特征计算、推理、后处理全部封装进 serving 层，路由因此发生在工作流粒度上——选中一个 Objective 等于选中一整套执行计划，而非一个孤立的评分函数。这也解释了为什么 AWS API Gateway 或独立的 service mesh 代理无法胜任：通用网关擅长按路径和 header 转发流量，却无法理解"这个请求属于哪个实验分组、需要补齐哪些特征事实、处于 shadow 还是 canary 生命周期"这类 ML 语境。抽象层级的选择决定了基础设施的选型边界。

### 规则即配置：把实验逻辑从发布周期中剥离

Switchboard Rules 的实质是"配置即发布"思路在 ML 领域的完整落地。研究员用 JavaScript 配置产出规则文件，Switchboard 与 serving 集群同时订阅消费同一份配置；A/B 分流、默认模型、渐进切流都改在配置通道里完成，独立于任何服务的代码发版节奏。ML 迭代中频率最高的部分——实验假设的验证——被放进了迭代成本最低的通道，配置系统天然提供的版本化、动态加载与快速回滚，正好覆盖了实验"试错—止损"的闭环需求。

控制面与数据面的分工同样值得拆解。控制面串起"模型到分片的分配 → 依赖加载与验证 → VIP 映射下发"三步；数据面则按"查询用户实验分组 → 选定模型 → 路由到分片 → 执行工作流"处理每个请求。两条链路靠同一份规则对齐，平台还需额外机制防止规则同步的竞态。这种为一致性付出的复杂度并没有在后来的重构中消失，而是被部分继承——它说明中心化方案的隐性成本往往藏在配置一致性上，而非请求转发本身。

### 规模的三重反噬：可用性、延迟与数据纯度

Switchboard 在规模压力下暴露的不是单一故障，而是三种性质迥异的代价同时显形。可用性维度：它是全部 ML 驱动体验的共享依赖，一个坏版本或一群 noisy neighbor 就足以瘫痪所有下游调用方。延迟维度：额外的序列化/反序列化引入 10-20ms 开销并叠加尾部放大，对延迟敏感的客户端意味着直接超时。第三个代价最容易被低估：中心路由遮蔽了请求来源，真实流量与测试流量在日志里难以区分，而训练数据一旦混入测试流量就会失真，租户隔离只能靠持续的定制化来勉强维持。

第三点揭示了 ML 路由与通用流量路由的本质差异：通用系统的路由缺陷损耗的是可用性与延迟这类传统 SLO；而 ML 系统的路由不透明还会向上游污染训练数据、向下游抬升 MLOps 运维成本。评估一个 serving 路由层的维度清单里，"数据面可观测性"必须与传统 SLO 并列——这是 Netflix 用真实代价换来的判断。

### Lightbulb：把在线路由决策降维成元数据查找

Lightbulb 的重构没有推翻 Switchboard 的抽象，而是改变了"路由"发生的位置：从一个逐请求的在线决策，降维成一次可缓存的元数据查找。规则被拆成两半——Model Serving Configuration 回答"该用哪个模型"，Routing Rules 回答"该去哪个 VIP"；Lightbulb 只负责把请求上下文解析为 routingKey 与 ObjectiveConfig，前者放入 header 供 Envoy 以最小开销完成转发，后者随请求体传递、刻意不进 header 以免膨胀。载荷与元数据就此各走各的通道，序列化大 payload 的延迟税被整体免除。

这一拆分的巧妙在于复用与隔离的平衡。Envoy 本就承载 Netflix 全部应用间出站流量，让它顺带承接集群路由几乎零边际成本，Lightbulb 只补齐它天然缺失的上下文感知与实验参数注入；路由层按租户隔离后，单一用例的错误激增不再向其他用例级联，不同用例悬殊的延迟要求也各自得到满足。代价是中心化的"简单"被换成多组件协调的"复杂"，而 Netflix 判断这笔交换在百万 QPS 规模下是划算的——先集中验证抽象，再把实现下沉到 sidecar，构成一条可复用的演进路径。相关演进细节另见 [Netflix Switchboard Lightbulb Model Routing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/netflix-switchboard-lightbulb-model-routing.md)；这套路由抽象与 Netflix 后来自建的 LLM serving 平台 [In House Llm Serving At Netflix](https://github.com/QianJinGuo/wiki-public/blob/main/entities/in-house-llm-serving-at-netflix.md) 形成上下游衔接，说明 Objective 级抽象具备跨模型形态的延续性。

## 实践启示

1. **ML Serving 不等于模型推理**：将预处理、后处理、特征计算统一封装为"serving workflow"，可以大幅简化客户端集成
2. **Objective 模式可借鉴**：任何需要解耦业务用例与技术实现的场景，都可以考虑类似的枚举抽象
3. **中心化路由的演进路径**：先用中心化方案快速验证，再在规模压力下向去中心化演进，是成熟的架构策略
4. **A/B 测试配置与代码解耦**：将实验配置独立于服务代码发布周期，可以大幅提升 ML 研究迭代速度
5. **Envoy 在 ML 基础设施中的潜力**：Envoy 不仅是通用 Service Mesh，也可以成为 ML serving 的路由基础设施

## 相关实体

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- Karpathy Vibe Coding Agentic Engineering

→ [原文存档](https://netflixtechblog.com/state-of-routing-in-model-serving-16e22fe18741?source=rss----2615bd06b42e---4)

---

