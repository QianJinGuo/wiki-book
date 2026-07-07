# AWS Sagemaker Capacity Aware Inference Fallback

## Ch01.392 AWS Sagemaker Capacity Aware Inference Fallback

> 📊 Level ⭐⭐ | 12.2KB | `entities/aws-sagemaker-capacity-aware-inference-fallback.md`

# SageMaker容量感知推理：实例池+优先级Fallback
## 三个关键洞察
### 1. 实例池+优先级Fallback
当主实例不可用时，自动fallback到池中下一个可用实例，优先级队列确保关键任务优先调度。这是多模型/多客户共享GPU舰队时的必备容错机制。
### 2. 混合GPU舰队加权利用率
不同GPU类型（H100/A100/T4）的成本和性能不同，加权利用率指标让调度决策考虑性价比，而不只是原始利用率。
### 3. Multi-instance并发控制
单个推理请求可能需要多个实例（模型并行），capacity-aware机制需要跟踪全局实例占用状态，避免oversubscription。
## 与知识库的连接
- → [SQS异步管道](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-serverless-async-inference-sqs-lambda.md)：同样是高并发推理场景，但侧重点不同（管道式队列 vs 实例池调度）
---
## 深度分析
### 架构本质：从"绑定单一实例"到"容量抽象层"
SageMaker Instance Pools的核心创新在于它不是在API层面暴露容错逻辑，而是在控制平面层实现了一个**优先级驱动的容量仲裁器**（Priority-based Capacity Arbiter）。当Endpoint创建、扩容、缩容三个生命周期事件触发时，这个仲裁器自动在工作队列中按优先级尝试实例类型，无需客户手动重试。
这个设计的精妙之处在于它把"容量约束"和"调度决策"解耦了——客户声明优先级顺序，服务商负责在容量窗口内完成调配。这与Kubernetes的PriorityClass机制在逻辑上高度相似，只不过粒度从Pod级别提升到了整个实例类型族。
### 容量窗口机制：VariantInstanceProvisionTimeoutInSeconds
文章引入了一个容易被忽略但非常关键的字段——`VariantInstanceProvisionTimeoutInSeconds`（合法范围300–3600秒）。这个字段定义了"在超时前持续重试当前优先级实例"的时间窗口。
这意味着：
- 窗口太短（如300秒）：可能在GPU紧俏时段还没等到释放就被迫降级到fallback
- 窗口太长（如3600秒）：部署/扩容延迟明显，但容错韧性最强
实践中，文章建议1200秒作为大GPU实例类型的合理起点。这个时间窗口覆盖了从发起请求到收到Insufficient Capacity错误的典型RTT周期。
### 模型-硬件匹配策略的双轨制
Instance Pools支持两种模型优化路径，这是设计上的一个重要细节：
**自优化路径（Option 1）**：客户需要提前为每个实例类型准备量化/并行策略不同的模型制品。这要求客户对模型在各类硬件上的性能表现有充分了解，适合有成熟ML平台能力的团队。
**推荐路径（Option 2）**：SageMaker推理推荐自动生成硬件优化配置（AIRecommendationModelDetails），客户只需要按`ModelPackageArn + InferenceSpecificationName`组合创建模型对象。这个"一键优化"模式极大降低了使用门槛——从"我要懂硬件"变成"我要选目标硬件"。
### 加权利用率：为什么聚合指标会误导扩缩容决策
文章用了一个具体的数字例子说明为什么不能用简单平均：p5处理18并发、g6处理7，简单平均是12.5——但这个数字既不反映p5的实际压力（18/20=90%），也不反映g6的实际压力（7/8=87.5%）。
CloudWatch Metric Math的加权表达式`(p5_concurrency / 20 + g6_concurrency / 8) / 2`实际上是在计算**归一化容量的加权平均**。这比原始请求数平均更有业务意义，因为它直接映射到容量饱和度——触发扩缩容的决策变量是`TargetValue`，而`TargetValue`是一个0.0–1.0范围的饱和度指标。
表格中"At target"一行（14/6，加权0.73）说明了一个细节：**在合理混合负载下，不同实例类型的利用率会自然趋于接近**，这实际上是一个健康的调度信号，而不是负载不均衡。
### LOR路由的自然负载均衡效应
文章推荐的Least Outstanding Requests（LOR）路由策略值得注意。LOR的基本逻辑是：将请求发送到in-flight请求数最少的实例。
这在高容量实例处理更快的情况下会产生一个**自组织效应**：
1. 高容量实例（p5）处理每个请求更快 → 更快清空队列 → in-flight计数更低
2. 下一次路由时，LOR看到p5的队列更空 → 分配更多请求给它
3. 结果：高容量实例自然承担更高比例的负载，而无需手动权重配置
这个机制在异构GPU舰队中的效果类似于"水位平衡"——负载会自动流向处理能力更强、当前压力更小的实例。
### 滚动更新与蓝绿部署的容量需求差异
文章区分了两种部署策略的容量代价：
- **蓝绿部署**：需要预置完整新 fleets，容量需求翻倍，但切换时间最短
- **滚动部署**：每次只更新5–50%实例子集，额外容量需求低，但更新周期长
对于GPU资源紧张时期（如H100稀缺窗口），滚动部署可能是唯一可行选项——因为即便蓝绿策略会按优先级fallback，整个过程仍然需要一定的峰值空闲容量才能保证原始Endpoint在切换期间保持InService。
---
## 实践启示
### 1. 优先使用Instance Pools而不是手动多Endpoint方案
很多团队在Instance Pools之前会尝试维护多个Endpoint（每个实例类型一个），然后在应用层做路由fallback。这个方案的问题是：
- 应用层路由逻辑需要维护多套健康检查和重试策略
- 无法跨实例类型共享同一个模型版本的一致性
- 不同Endpoint的扩缩容是独立决策，容易产生碎片化的容量碎片
Instance Pools把这些复杂性下沉到SageMaker控制平面，应用层只需关心"请求是否成功"，无需关心"背后是哪类实例在服务"。
**建议**：立即将现有单实例类型Endpoint迁移到Instance Pools，迁移过程是蓝绿式的，不会产生服务中断（调用UpdateEndpoint，保留当前类型作为Priority 1）。
### 2. 实例池优先级设计：同族优先，跨族兜底
设计优先级时有两条经验原则：
- **同家族实例相邻放置**：如g6e → g6 → p4d，同家族实例通常有相似的驱动、CUDA兼容性和网络拓扑，降级到同家族风险最低
- **跨家族fallback要准备不同模型配置**：H100的模型不一定能塞进T4，反之亦然。跨族降级需要准备量化版或不同并行策略的模型
实践中，建议池的大小控制在3–4个实例类型——太少失去容错意义，太多则管理复杂度和模型配置数量会快速膨胀。
### 3. 加权利用率指标的即时可用性
对于已有SageMaker端点的团队，过渡到加权利用率Metric Math不需要改动Endpoint配置，只需要添加一条新的CloudWatch alarms。
**立即可以做的事**：
1. 拉取现有的`ConcurrentRequestsPerModel`按`InstanceType`维度分解
2. 用`MAX`而非`Average`估算各实例类型的理论最大并发数
3. 构建`(type1_concurrency / MAX1 + type2_concurrency / MAX2) / N`表达式
4. 用这个表达式替换或新增TargetTrackingScaling Policy
注意：对于单实例类型的现有Endpoint，这个优化不紧急。但一旦Pool有任何两种不同实例类型，这个改变就是必需的——否则加权指标会掩盖实际的容量压力。
### 4. 异步推理+Instance Pools的冷启动优化
这是文章中容易被低估的场景。传统异步推理在缩容到零后重新扩容时，需要手动确认哪个实例类型可用才能开始处理请求。
Instance Pools改变了这一点：冷启动时会自动按优先级尝试可用容量，第一个成功的类型立即开始处理队列请求。这意味着**异步端点可以实现真正的"零实例待机"而不用担心冷启动的人为延迟**。
**建议**：如果业务有明显的流量峰值/谷值周期，配置Instance Pools的异步推理可以将基础设施成本压到真正的零使用时段，同时保持峰值响应能力。
### 5. 监控维度升级：必须开启InstanceType维度
文章明确提到所有CloudWatch指标新增了`InstanceType`维度。对于已有监控仪表板的团队，这个变化意味着：
- **延迟异常排查**：以前只知道"Endpoint延迟上升"，现在可以快速定位是哪个实例类型的GPU正在过载
- **成本归因**：可以按实例类型统计实际使用的instance-hours，支持精细化的GPU成本分摊
- **容量规划**：通过InstanceCount per type的趋势，可以判断当前GPU可用性是否有结构性问题
建议在迁移完成后立即更新Dashboard和Alarm，添加InstanceType维度，而不是等到事故发生时才想起这个新维度。
---
*Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sagemaker-capacity-aware-inference-fallback.md)*
## 相关实体
- [EC2 Capacity Blocks：GPU短期容量决策指南](../ch11/201-aws-ec2-capacity-blocks-gpu-ml.html)
- [GRPO+RLVR: Qwen数学推理3.7x提升的工程细节](../ch11/098-aws-grpo-rlvr-sagemaker-math-reasoning.html)
- [Building Blocks for Foundation Model Training and Inference on AWS](../ch11/117-building-blocks-for-foundation-model-training-and-inference.html)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](../ch11/007-aws-bedrock.html)
- [9个Agent技能模块化SageMaker微调生命周期](../ch04/381-aws-sagemaker-ai-agent.html)
- [redis agentic ai flowers with iris](ch01/683-9.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

