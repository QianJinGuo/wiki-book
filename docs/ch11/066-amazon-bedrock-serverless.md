# Amazon Bedrock 模型推理 Serverless 架构案例

## Ch11.066 Amazon Bedrock 模型推理 Serverless 架构案例

> 📊 Level ⭐⭐ | 11.2KB | `entities/amazon-bedrock-model-inference-serverless-architecture-case-study.md`

Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例 | 亚马逊AWS官方博客
Skip to Main Content
想了解专为中国区域提供的云产品？请访问
www.amazonaws.cn
。申请中国区域免费套餐请访问
www.amazonaws.cn/free
。
AWS Blog
首页
博客
版本
亚马逊AWS官方博客
Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例
摘要：当大模型应用从纯文本扩展到图片、PDF 等多模态输入时，推理耗时长且不可预测、RPM/TPM限流频发成为生产落地的两大瓶颈。本文分享一套基于 Amazon SQS 与 AWS Lambda Serverless 异步架构，在 Amazon Bedrock之上串起缓冲、控速、重试与结果入库的完整管道，经多模型压测验证可稳定支撑高并发多模态负载，适用于内容审核、文档处理、合规审查及多 Agent 协作等场景。
目录
01
一、引言
02
二、Amazon Bedrock 推理 API 概览
03
三、为什么需要异步
04
四、方案：Amazon SQS + AWS Lambda 异步管道
05
五、架构详解
06
六、压测验证
07
七、核心代码与部署配置
08
八、总结

## 相关实体
- [Using Amazon Bedrock Agentcore Openclaw Multi 5](../ch04/501-amazon-bedrock-agentcore.md)
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](../ch04/501-amazon-bedrock-agentcore.md)
- [Aws Bedrock Serverless Async Inference Multimodal](ch11/007-aws-bedrock.md)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/501-amazon-bedrock-agentcore.md)
- [Aws Bedrock Serverless Async Inference Sqs Lambda](ch11/007-aws-bedrock.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-bedrock-model-inference-serverless-architecture-case-study.md)

- [redis agentic ai flowers with iris](../ch01/682-9.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/amazon-aws-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mcp-server-patterns.md)
## 深度分析

**多模态推理从根本上改变了 API 调用特征，同步调用范式失效。** 纯文本推理的 token 消耗相对稳定，但多模态输入（图片、PDF）的 token 消耗随文件大小非线性增长——单张 114KB 图片约 1,600 tokens，而 20 页带图 PDF（4.5MB）达 33,000 tokens，100 张图片（11.1MB）更是 23,000 tokens。推理时间从图片的 1-5 秒飙升到 PDF 的 20-70 秒，这使得同步调用范式在服务端面临线程资源耗尽、网络中断丢请求等多重风险。更关键的是，多模态请求的 token 密度使得 RPM 和 TPM 两道配额限制更容易同时触发，200 并发图片请求（每请求 ~1,617 tokens）直接导致 75% 失败率。SQS 异步管道将"同步等结果"变为"提交即返回"，通过排队机制将突发流量削峰填谷，从根本上避免了同步调用在高并发场景下的系统性失效 。

**ESM MaximumConcurrency 是 Bedrock 的精准调速阀，而非简单的并发参数。** 很多人认为 SQS 队列天然能缓冲流量、Lambda 越多处理越快，但实际上真正的控速机制是 AWS Lambda 事件源映射（ESM）的 MaximumConcurrency 参数——它直接决定了同一时刻有多少个 Lambda 实例从队列拉取消息并调用 Bedrock。设 max_concurrency=5，则无论有多少请求堆积在 SQS 中，最多只有 5 个并发 Bedrock 调用，其余请求持续在队列中等待。这种"队列缓冲 + ESM 限流"的组合才是真正的流量整形机制，单纯依靠 SQS 队列而没有 ESM 并发控制，高并发突发仍会直接击穿 Bedrock 限流。该设计将应用层从"尽力而为"变为"保证不超限" 。

**Partial Batch Failure 是生产级管道的必备能力。** SQS 的 at-least-once 投递语义意味着消息可能被重复投递——Lambda 函数可能因超时等原因处理失败后，ESM 会重新将消息投入队列供下次消费。如果不启用 ReportBatchItemFailures，Lambda handler 返回的 batchItemFailures 字段会被忽略，任何一条消息失败都会导致整批消息重试，这在高并发管道中会造成灾难性的连锁重试。启用后，handler 可以精确告诉 ESM 哪些消息真正失败（通过返回 batchItemFailures 数组），ESM 只重试失败的那条，同批其他消息不受影响。配合死信队列（DLQ），重试超过 maxReceiveCount 次仍失败的消息进入 DLQ 供人工处理，既不阻塞流水线，也不丢数据 。

**Timeout 链路配置是管道稳定性的关键，三层 Timeout 必须严格嵌套。** 这个架构涉及三个 Timeout：Bedrock SDK 的 read_timeout（等待模型响应的上限）、Lambda function 的 timeout（函数执行时间上限）、SQS 队列的 visibility_timeout（消息"隐藏"时间）。三条规则必须严格满足：visibility_timeout > Lambda timeout > read_timeout > 实际处理时间。如果 read_timeout ≤ 实际处理时间，SDK 会在模型还未返回时就断开连接，该次请求白做且需要重试；如果 Lambda timeout ≤ read_timeout，可能 Bedrock 完成了但 Lambda 还来不及写 DynamoDB 就被强制终止；如果 visibility_timeout ≤ Lambda timeout，消息还没处理完就重新出现在队列被重复拉取。PDF 场景（20-70s 处理时间）和图片场景（1-6s）对 Timeout 的要求差异巨大，混用时必须按最坏情况配置 。

**Nova 2 Lite vs Claude Sonnet 的 token 效率差异对成本影响巨大。** 该案例揭示了一个关键成本洞察：Nova 2 Lite 对所有图片和文档页面统一按 ~230 tokens 计费，而 Claude 系列优化后每张图片约 ~1,600 tokens，相差约 7 倍。这意味着在 2000 并发 100 张图片的压测场景（20 万张图片），如果使用 Claude，每请求 ~23K tokens 的消耗会迅速打满 TPM 配额，而 Nova 2 Lite 的 ~230 tokens/page 允许在相同配额下支撑更大批量处理。对于图片和文档审核这类多模态批量任务，模型选型对吞吐量和成本的综合影响远超单纯的模型精度差异 。

## 实践启示

- **Timeout 配置应基于实测而非估算，需按输入类型分类设置。** 图片场景（1-6s 处理时间）和大文件 PDF 场景（20-70s）对 Timeout 的要求差异极大，建议分别建立 SQS 队列处理不同输入类型，或按 PDF 场景的最坏情况统一配置（read_timeout=120s, Lambda timeout=180s, visibility_timeout=300s）。Timeout 偏大的代价只是失败重试稍慢，而 Timeout 偏小会导致请求被中断或消息重复处理，后果更严重 。

- **max_concurrency 必须根据模型 RPM/TPM 配额和单次处理时间动态计算。** 公式为 mc_rpm = RPM额度 × avg_time / 60 和 mc_tpm = TPM额度 × avg_time / (单次Token量 × 60)，取两者较小值。RPM 是硬限制不能超；TPM 有一定弹性但需实测。建议先按计算值保守配置，上调前必须用实际负载压测验证，否则超限会触发大量重试、队列膨胀、整体完成时间反而更长 。

- **幂等性检查是多模态管道实现可靠性的基础。** SQS at-least-once 语义决定了消息可能被重复投递，Lambda 函数在处理前必须检查请求是否已处理（如查询 DynamoDB 中该 requestId 的 status 是否为 COMPLETED）。对于 AI 推理这类非幂等操作，幂等检查将"重复处理"从"副作用"变为"无操作"，是避免重复计费、重复入库的关键设计 。

- **多模型混用时需分别计算各模型的 max_concurrency。** 如果同一管道同时调用 Claude 和 Nova 模型，由于各模型的 RPM/TPM 配额和单次处理时间不同，各自的 mc 值也不同。建议不同模型使用独立的 SQS 队列和 Lambda 函数，分别配置对应的 max_concurrency，避免混用导致某一模型先触达限额而另一模型资源闲置 。

- **DLQ 告警和人工复查流程应作为管道部署的标配。** 死信队列保存了重试多次仍失败的消息，这些消息往往代表真正需要关注的异常情况（格式错误、模型 bug、恶意输入等）。建议为 DLQ 配置 CloudWatch 告警，触发时通知安全/运维团队人工审查，而不是简单丢弃。DLQ 消息的积累量也是判断模型是否持续出问题的领先指标 。

---

