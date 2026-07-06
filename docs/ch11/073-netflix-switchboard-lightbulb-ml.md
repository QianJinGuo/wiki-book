# Netflix Switchboard → Lightbulb: 百万请求/秒 ML 模型路由架构演进

## Ch11.073 Netflix Switchboard → Lightbulb: 百万请求/秒 ML 模型路由架构演进

> 📊 Level ⭐⭐ | 10.9KB | `entities/netflix-switchboard-lightbulb-model-routing.md`

# Netflix Switchboard → Lightbulb: 百万请求/秒 ML 模型路由架构演进

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/state-of-routing-in-model-serving.md)

> **Core insight**: Netflix ML serving 的核心挑战是区分 model serving（端到端工作流执行）和 model inference（单一 scoring 函数），Switchboard 作为强制入口点处理 1M req/s 的上下文感知路由，但引入单点和延迟问题，最终演化为 Lightbulb（将路由元数据与实际请求路径解耦）+ Envoy 代理。

## 背景：Netflix 的模型定义

在 Netflix，ML model 的定义与 typical inference 不同。Model inference 通常只关注 `infer(features) -> score` 能力，而 Netflix 的"model"是封装了 pre-processing、post-processing、feature computation logic 和 optional ML-trained component 的 self-contained workflow。端到端执行这个工作流被称为 model serving。

这种更高层次的抽象意味着：调用服务只需提供标准请求上下文（如 userId、country、device）和相关领域上下文（如要排名的 titles 或 fraud detection 的支付交易），model 自己计算 features 并在执行流中执行 inference。客户端被屏蔽于 model selection 和 execution 之外，允许 model architecture 和 data inputs 演进而无需客户端协调。

## Switchboard：集中式路由抽象

标准 out-of-the-box API Gateway 解决方案（如 AWS API Gateway 或 standalone Service Mesh proxy）无法满足 Netflix 的需求——需要与 Netflix experimentation platform 一级集成、暴露 gRPC endpoints 到客户端、使用丰富的领域特定上下文进行路由定制。Switchboard 作为 mandatory interface 成为所有客户端访问模型的单一入口点，执行上下文感知路由并对模型输入应用配置的上下文富化。

Switchboard 提供的关键能力：1) **Common Client Abstraction**——单一联系点处理所有客户端 model needs，新 ML 应用无需新的服务依赖或客户端；2) **Context-Aware Routing**——基于用户当前 device、locale、ranking surface type 或当前 A/B test 进行路由；3) **Dynamic Traffic Splitting**——支持 canary deployment 和 experimentation 的实时流量分割；4) **Model Versioning and Lifecycle Management**——通过 shadow mode testing 和 instant rollback 管理并发 model versions。

Switchboard Rules 是 model researchers 定义与 objective 关联的模型的 主要 UX——用 JavaScript configuration 表达，通常产生 JSON 文件，主要指定：default model for a given Objective、A/B experiments 配置及其对应模型、逐步将流量转移到新模型的定制。

## Switchboard 的挑战

随着系统规模增长，Switchboard 设计暴露出三个问题。首先是**单点故障**——Switchboard 处于关键请求路径上，其故障会降级或禁用多个 ML-powered experiences，成为共享依赖。其次是**额外延迟**——Switchboard 在请求路径中添加 10-20ms 延迟（来自 serialization-deserialization 操作），这对延迟敏感客户端造成用户体验影响。第三是**客户端灵活性降低**——Switchboard 模糊了客户端请求来源的可见性，使真实流量与 artificial traffic 的日志区分困难，tenant 隔离和测试流量隔离变得复杂。

## Lightbulb：解耦式路由

Lightbulb 的核心设计原则是**将 Switchboard 的职责拆分**：把与路由相关的配置从直接请求路径中移除，同时保留 Switchboard 的关键特性。

关键设计变化：1) **从请求路径移除路由服务**——虽然路由规则变更不频繁，但保持一致性需要成本并增加可用性风险；2) **分离模型输入和请求元数据**——当请求 payload 很大时，在 Switchboard 中 deserialize 再 re-serialize 以做出路由决策是延迟和服务成本的重要来源；3) **更好的路由层隔离**——多 tenants 合并到单一路由集群存在错误传播风险和不同延迟要求的挑战。

Lightbulb 将 Switchboard Rules 针对 Objective 的配置拆分为两个不同的集合：**Model Serving Configuration**（确定请求时应使用哪个模型及其所需元数据）和 **Routing Rules**（给定要服务的模型，告诉请求应该路由到哪个 VIP）。

## Lightbulb + Envoy 数据平面

Netflix 所有 egress 通信都使用 Envoy，已经可以根据配置将请求路由到不同集群（VIP）。但 Envoy 缺少做出路由决策所需的信息，也无法在请求 body 中富化 A/B testing 模型变体所需的额外服务参数。Lightbulb 填补了这个空白。

Data plane 流程：1) Lightbulb 消费包含 use-case 信息的最小请求上下文，提供路由所需的元数据映射到 Envoy 层；2) Lightbulb 将请求上下文解析为 routingKey 配置和 ObjectiveConfig（包含 model id 和其他请求特定配置）；3) routingKey 被添加到 headers 供 Envoy proxy 消费，ObjectiveConfig 参数由客户端添加到请求本身（避免请求 headers 膨胀）；4) 实际请求路由由 Envoy proxy 执行，它有将 routingKey 映射到运行模型的集群 VIP 的元数据。

因为 routingKey 在 header 中，这个决策可以以最小开销做出。这些变化保留了 Switchboard 的优势（单一集成点、从 use case 抽象 model id、上下文感知路由），同时解决了随着时间推移观察到的挑战。

## 关键数据/实践启示

- **Model serving ≠ Model inference**：Netflix "model" 是封装了 pre/post-processing 和 feature computation 的端到端工作流，这决定了 routing 抽象层的设计
- **Objective 作为解耦原语**：Objective 是 serving platform 对特定业务 use case 的枚举名称（如 ContinueWatchingRanking），解耦了客户端与具体模型
- **Switchboard Rules 的实验配置与 serving platform 代码解耦**：独立发布周期、Gutenberg 系统提供灵活 pub-sub 架构支持版本化、动态加载和轻松回滚
- **Lightbulb 将路由元数据从请求路径移除**：routingKey 进 header（轻量）、ObjectiveConfig 进请求 body（避免序列化开销），实际路由由 Envoy 执行
- **1M req/s 规模**：Netflix ML serving 平台服务数百模型类型和版本，netting 1M 请求/秒

## 深度分析

### 1. Switchboard：Netflix 的 LLM 路由层
Netflix Switchboard 将"选择哪个模型回答这个请求"从人工决策转变为自动化路由——基于请求特征（复杂度、延迟要求、成本预算）动态选择最优模型。

### 2. Lightbulb 模型：请求复杂度的实时评估
Lightbulb 模型是 Switchboard 的核心创新——在请求执行前评估其复杂度，决定路由到"强模型+高延迟+高成本"还是"弱模型+低延迟+低成本"。这与 `Guide Ai Agents Models Apps Harnesses Mollick` 中"选对模型比选对公司更重要"的论点直接对应。

### 3. 路由准确性的业务影响
路由错误（简单请求送到强模型=浪费成本，复杂请求送到弱模型=质量下降）的业务影响需要量化——Netflix 的规模下，1% 的路由优化可能节省数百万美元。

### 4. 与 OpenAI auto 模式的对比
OpenAI 的 auto 模式也做模型路由，但规则不透明且偏向成本优化（倾向于选弱模型）。Switchboard 的优势是路由逻辑可定制——你可以根据自己的业务优先级（质量>成本 或 成本>质量）调整路由策略。

### 5. 模型路由作为 AI 基础设施的新层
模型路由正在成为 AI 基础设施的标配层——OpenAI 的 Intelligent Prompt Routing、Anthropic 的模型选择建议、自建路由层——核心问题相同：如何在多模型环境中优化成本/质量/延迟。

## 实践启示

### 1. 多模型环境：引入路由层而非手动选择
如果你的组织使用 2+ 个 LLM，引入路由层自动化模型选择——手动选择不可扩展且容易出错。

### 2. 路由策略应反映业务优先级
成本敏感场景：默认路由到弱模型，仅对高复杂度请求升级；质量敏感场景：默认路由到强模型，仅对简单请求降级。

### 3. 用 A/B 测试验证路由策略
对比不同路由策略的成本/质量/延迟，用数据驱动调优——不要凭直觉设置路由规则。

### 4. 监控路由准确率
追踪"被路由到弱模型的复杂请求"和"被路由到强模型的简单请求"的比例——这两个指标衡量路由质量。

### 5. 模型路由是降本增效的快速胜利
在多模型环境中，路由优化通常比模型微调更快见效——先优化路由，再考虑精调。

## 相关实体
- [Netflix Metadata Service Model Lifecycle Graph](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-metadata-service-model-lifecycle-graph.md)
- [Netflix Live Operations Human Infrastructure](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-live-operations-human-infrastructure.md)
- [Netflix Nebula Archrules](ch11/088-netflix-nebula-archrules-java-archunit.md)
- [Netflix Druid Interval Aware Caching](https://github.com/QianJinGuo/wiki/blob/main/entities/netflix-druid-interval-aware-caching.md)
- [High Throughput Graph Abstraction At Netflix](ch11/101-high-throughput-graph-abstraction-at-netflix-part-i.md)

## 相关引用

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/state-of-routing-in-model-serving.md)

---

