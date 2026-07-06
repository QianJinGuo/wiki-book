# AWS Bedrock Serverless 异步推理：SQS + Lambda

## Ch11.084 AWS Bedrock Serverless 异步推理：SQS + Lambda

> 📊 Level ⭐⭐ | 10.3KB | `entities/aws-bedrock-serverless-async-inference-sqs-lambda.md`

# SQS+Lambda异步管道：2000并发0%限流的工程细节
## 三个关键洞察
### 1. max_concurrency计算公式
mc = min(mc_rpm, mc_tpm)，其中 mc_rpm = RPM额度 × avg_time / 60，mc_tpm = TPM额度 × avg_time / (token_per_request × 60)。这个公式是控制限流的核心工程工具。
### 2. 三层timeout链路
visibility_timeout > Lambda timeout > read_timeout 必须层层递增，否则消息会被重复处理或请求被中断。图片场景（1-6s）可紧凑配置，PDF场景（20-70s）必须留足余量。
### 3. Partial Batch Failure
SQS ESM的reportBatchItemFailures开启后，单条消息失败只重试该条，不影响同批其他消息，配合DLQ实现"不丢数据也不阻塞"。
## 与知识库的连接
- → [SunFinance ID提取](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-sun-finance-ai-id-extraction-fraud-detection.md)：同样使用Bedrock作为推理后端，可复用此异步架构
- → [OS-level Actions](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-agentcore-os-level-actions-browser.md)：AgentCore的Action执行可借助此管道实现高并发
---
## 深度分析
### 异步架构的本质：解耦与控速
这套SQS+Lambda异步管道的核心价值并非"异步"本身，而是在于**两层解耦**：
1. **时间解耦**：客户端提交任务后立即拿到任务ID，不需要同步等待模型推理完成（1-70秒不等）。这意味着用户的请求不会因为模型处理时间长而被阻塞，网络断连也不会丢请求——任务已经持久化在SQS队列里。
2. **并发解耦**：应用层多个服务实例同时调用Bedrock API时，没有任何全局并发控制，突发流量直接触发限流。通过ESM的MaximumConcurrency参数，可以在队列层强制实施精确的并发数量控制，从根本上避免RPM/TPM限制。
### max_concurrency公式的物理意义
公式 mc = min(RPM额度 × avg_time / 60, TPM额度 × avg_time / (token_per_request × 60)) 本质上是在问：**在给定模型配额和单次处理时间的情况下，每分钟最多能完成多少个请求而不触发限流**。
- mc_rpm 反映的是"请求频率"维度：RPM是每分钟请求数上限，如果每个请求平均需要10秒处理，那么1分钟内一个Lambda实例只能处理6个请求，因此mc_rpm = RPM / 6
- mc_tpm 反映的是" token吞吐量"维度：TPM是每分钟token数上限，如果每个请求消耗1600 tokens，每分钟能处理的请求数 = TPM / 1600
取两者的较小值，是因为两条限制同时生效，超过任何一个都会触发限流。
### 三层timeout的层级陷阱
这是一个容易被忽视的工程细节。三层timeout必须严格递增：
```
visibility_timeout > Lambda timeout > read_timeout > 实际处理时间
```
如果Lambda timeout ≤ read_timeout，可能出现Bedrock已经完成推理但Lambda来不及写结果就被终止的情况——请求白做了，消息会被重新处理。如果visibility_timeout ≤ Lambda timeout，消息会在Lambda处理完成前重新可见，被重复消费。
### Partial Batch Failure的实际价值
SQS ESM的ReportBatchItemFailures机制在生产环境中的价值在于：**它把"批处理"和"失败隔离"解耦了**。
传统模式下一批消息要么全成功、要么全失败重来（batch size内任何一条失败，整批都被退回）。开启ReportBatchItemFailures后，Lambda handler可以通过返回batchItemFailures数组精确指出哪些消息失败了，ESM只把那几条放回队列重试。配合DLQ机制，重试超过maxReceiveCount仍失败的消息进入死信队列，既不阻塞后续消息处理，也不丢数据。
## 实践启示
### 1. 按输入类型配置Timeout，不要用一套参数跑所有场景
图片场景（1-6秒处理时间）和大文件PDF场景（20-70秒处理时间）的timeout配置差异巨大：
- 图片场景：read_timeout=30s, Lambda timeout=60s, visibility_timeout=120s
- 大文件PDF场景：read_timeout=120s, Lambda timeout=180s, visibility_timeout=300s
如果业务同时包含两种输入类型，按最慢场景配置——timeout偏大的代价只是失败重试稍慢，而timeout偏小会导致请求被中断或消息重复处理。
### 2. max_concurrency的初始值用公式计算，不要靠经验拍脑袋
先根据模型配额和处理时间计算出理论值，再在生产环境中逐步调优：
```python
mc_rpm = RPM额度 * avg_time / 60
mc_tpm = TPM额度 * avg_time / (token_per_request * 60)
max_concurrency = min(mc_rpm, mc_tpm)
```
注意：RPM是硬限制，mc_rpm绝对不能超；TPM有一定弹性，mc_tpm在实际测试中可能可以适当上调。
### 3. Bedrock SDK配置的关键点
生产环境中建议配置：
```python
bedrock = boto3.client("bedrock-runtime",
    config=Config(read_timeout=120, retries={"max_attempts": 1}))
```
- `read_timeout` 必须覆盖最慢的请求（大文件PDF可能60秒以上）
- `max_attempts=1` 让失败快速返回给SQS重试，而不是SDK内部重试占用Lambda执行时间。SQS重试之间有visibility timeout冷却期，比SDK立即重试更安全。
### 4. SQS是at-least-once投递，必须做幂等检查
代码中必须包含幂等逻辑，防止消息被重复消费：
```python
existing = table.get_item(Key={"requestId": request_id})
if existing.get("Item", {}).get("status") == "COMPLETED":
    return  # 跳过已完成的请求
```
### 5. 选择合适的模型降成本
对于图片和文档审核等多模态批量任务，Amazon Nova 2 Lite是高性价比之选——对所有图片和文档页面统一按约230 tokens计费，不论分辨率和页面复杂度，而Claude系列每张图片约1,600 tokens。2000并发20万张图片的压测使用Nova 2 Lite正是基于此考量。
*Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-serverless-async-inference-sqs-lambda.md)*
## 相关实体
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/152-amazon-bedrock.md)
- [AgentCore质量优化飞轮：推荐-验证-部署闭环](ch11/118-aws-bedrock-agentcore-quality-optimization-flywheel.md)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch11/229-aws-bedrock-agentcore.md)
- [Building Blocks for Foundation Model Training and Inference on AWS](ch11/117-building-blocks-for-foundation-model-training-and-inference.md)
- [Hapag-Lloyd：1.5万反馈/月95%情感准确率](ch11/169-aws-hapag-lloyd-bedrock-customer-feedback.md)
- [Halliburton Seismic Workflow with Amazon Bedrock and Generative AI](ch11/007-aws-bedrock.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](../ch04/057-real-time-voice-agents-with-stream-vision-agents-and-amazon.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch11/128-control-where-your-ai-agents-can-browse-with-chrome-enterpri.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](../ch01/630-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/257-amazon-nova.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](../ch01/675-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch11/251-bedrock.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](../ch04/499-amazon-bedrock-agentcore.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04/361-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch11/052-prowler-genai.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch11/057-amazon-bedrock-claude-prompt-cache.md)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/152-amazon-bedrock.md)
- [55+ models, every modality. one api key, one bill.](ch11/003-serverless-inference.md)
- [aws bedrock dynamic document extraction pipeline](https://github.com/QianJinGuo/wiki/blob/main/entities/extract-data-with-on-demand-and-batch-pipelines-dynamically.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mcp-server-patterns.md)

---

