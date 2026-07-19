# Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例

## Ch11.073 Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例

> 📊 Level ⭐⭐ | 10.9KB | `entities/aws-bedrock-serverless-async-inference-multimodal.md`

["Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例"](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-bedrock-serverless-async-inference-multimodal.md)

## 摘要
当大模型应用从纯文本扩展到图片、PDF等多模态输入时，推理耗时长且不可预测、RPM/TPM限流频发成为生产落地的两大瓶颈。本文分享一套基于 Amazon SQS 与 AWS Lambda 的 Serverless 异步架构，在 Amazon Bedrock之上串起缓冲、控速、重试与结果入库的完整管道。

## 核心挑战
| 挑战 | 表现 | 解决方案 |
|------|------|----------|
| **推理时间长** | 多图/PDF 单次推理 20-70秒 | 异步提交即返回，后台处理 |
| **RPM/TPM 限流** | 突发流量直接触发限流 | SQS 队列缓冲 + ESM 并发控制 |

## 推理时间实测数据
| 输入类型 | 文件大小 | Input Tokens | 推理时间 |
|---------|---------|-------------|---------|
| 单张图片 | 114 KB | ~1,600 | 1-5s |
| 20页带图PDF | 4.5 MB | ~33,000 | 20-26s |
| 100张图片 | 11.1 MB | ~23,000 | 50-70s |

## 架构核心
### SQS + Lambda 异步管道三原则
1. **提交即返回，处理在后台**：应用提交任务后立即拿到任务 ID，不阻塞用户
2. **队列缓冲 + 并发控制**：ESM MaximumConcurrency 限制同时调用 Bedrock 的并发数
3. **失败自动重试，不丢数据**：Partial Batch Failure + 死信队列（DLQ）

### 关键参数配置
**max_concurrency 计算**：
```
mc_rpm = RPM额度 × avg_time / 60秒
mc_tpm = TPM额度 × avg_time / (每请求Token量×60秒)
max_concurrency = min(mc_rpm, mc_tpm)
```
**Timeout 链路**（必须层层递增）：
```
visibility_timeout > Lambda timeout > read_timeout > 实际处理时间
```
| 场景 | 实测处理时间 | read_timeout | Lambda timeout | visibility_timeout |
|------|------------|-------------|----------------|-------------------|
| 图片(1-5张) | 1-6s | 30s | 60s | 120s |
| 大文件PDF(20+页) | 20-70s | 120s | 180s | 300s |

## 压测验证结果
### 300并发突发测试
| 方式 | 用户等待时间 | 全部完成耗时 | 成功率 |
|------|------------|-------------|--------|
| 同步直连调用 | 9秒（阻塞） | 9秒（234个丢失） | 22% |
| 同步直调+重试 | 353秒（6轮） | 353秒 | 100% |
| **SQS异步管道(mc=5)** | **<1秒（提交即返回）** | **221秒** | **100%** |

### 大规模测试
- **Nova Pro 600并发×5 PDF**：SQS管道 100% 完成，~30分钟
- **Nova 2 Lite 2000并发×100图**：SQS管道 100% 完成，~7.5分钟

## 深度分析
### 1. 异步架构的本质：解耦与缓冲
SQS 队列的核心价值不是"异步"，而是**流量整形**（Traffic Shaping）。在多模态推理场景中，输入大小差异可达两个数量级（单图114KB vs 100图11.1MB），对应的推理时间也从1秒跳升至70秒。这种巨大的方差使得同步调用几乎不可能稳定运行——一个70秒的长尾请求会死死占住连接，而后续请求全部排队等待。
SQS 的加入将"生产者-消费者"解耦：提交端只管发消息，不关心消费速度；消费端按自己的节奏从队列拉取，通过 ESM MaximumConcurrency 控制并发。这意味着无论上游流量多突发，Bedrock 侧看到的始终是一个平滑的、受控的请求流。

### 2. ESM 并发控制的精细价值
事件源映射（ESM）的 MaximumConcurrency 参数是整个限流策略的核心。相比传统的重试退避，ESM 并发控制的优势在于：

- **精确**：不像指数退避那样"赌"重试成功，ESM 直接限制活跃调用数，超出的请求自动在队列中等待
- **无损**：被控速的请求不会失败，只是延迟消费，不会触发 Bedrock 的限流错误
- **自适应**：在多租户场景下，可以为不同模型或不同租户设置不同的并发阈值
公式 `max_concurrency = min(mc_rpm, mc_tpm)` 意味着系统会同时考虑请求数和 Token 数两个维度的限制，取更严格的那个作为实际并发上限。这是一个值得注意的设计细节——它要求运维人员必须同时监控 RPM 和 TPM 两个配额。

### 3. Timeout 链路的级联设计
文中强调的 `visibility_timeout > Lambda timeout > read_timeout > 实际处理时间` 链路是 SQS+Lambda 集成中最容易出错的环节。当 Lambda 执行时间接近 timeout 时，SQS 的 visibility timeout 窗口如果不够长，会导致另一个 Lambda 实例重新拉取同一条消息并重复处理——这在有副作用的操作中可能是灾难性的。
正确的做法是：visibility_timeout 至少应该是 Lambda timeout 的 2-3 倍，以应对重试和轮转。

### 4. 多模态推理的 token 放大效应
从实测数据看，100张图片产生 ~23,000 tokens，但处理时间高达 50-70 秒。这意味着 **token/秒** 的比率在多图场景下急剧下降——单图约 320-1600 tokens/s，而 100 图只有 330-460 tokens/s。这种"放大效应"可能源于：多图需要分别编码、跨图注意力机制、以及 Bedrock 侧的图片预处理开销。架构设计时必须意识到：输入 token 数的增长并不线性等于推理时间增长。

### 5. 与 Agent 场景的天然契合
文中指出每个子任务独立入队、调用方查进度的模式与 Agent 场景高度匹配。这一洞察非常重要：当前 Agent 架构中，工具调用往往是同步阻塞的——主线程等待子任务完成才能继续。如果 Agent 的每步工具调用都通过 SQS 异步化，主线程只需要轮询任务状态，Agent 的控制流就可以真正与工具执行解耦。这对于需要同时调用多个工具的长链 Agent（如 ReAct 架构）尤为关键。

## 实践启示
### 容量规划：从实测数据推导
不能依赖 Bedrock 官方文档的"理论 RPM/TPM"，必须用实际输入类型做压测。上表的推理时间数据已经清楚地展示了不同输入类型的方差——在容量规划时，应该以最坏情况（100图，70秒）作为基准，而不是取平均值。
对于 max_concurrency 的计算：
```python

# 估算示例（Nova Pro, RPM=1000, TPM=100000, avg_time=20s, tokens_per_req=1000）
mc_rpm = 1000 * 20 / 60 = 333
mc_tpm = 100000 * 20 / (1000 * 60) = 33.3
max_concurrency = min(333, 33.3) = 33  # TPM 限制更严格
```

### Timeout 配置：宁可过量，不可短缺
实际配置中建议：

- **read_timeout**：设为实测最大处理时间的 1.5-2 倍
- **Lambda timeout**：设为 read_timeout 的 1.5 倍
- **visibility_timeout**：设为 Lambda timeout 的 2 倍以上
对于多模态大文件场景（PDF 20+页），Lambda timeout 180s 和 visibility_timeout 300s 是经过验证的安全值。

### DLQ 监控：不可忽视的告警盲区
死信队列（DLQ）是最后一道防线，但不能依赖它来做错误处理。建议：
1. **设置 DLQ 监控 CloudWatch 告警**：DLQ 有消息 = 系统有问题
2. **定期审计 DLQ 内容**：分析失败原因，归类并修复
3. **DLQ 消息保留期**：默认 14 天，足够排查但不占用过多存储

### 分层限流：多租户场景的扩展方向
当前架构的并发控制是全局的。在多租户场景下，可以考虑：

- **SQS 分队列**：按租户或模型创建独立队列
- **ESM 分组**：不同租户/模型配置不同的 MaximumConcurrency
- **DynamoDB 配额表**：动态追踪各租户已用配额，在 Lambda 侧做 pre-check

### 与 Agent 框架的集成路径
对于需要集成到 Agent 编排框架（如 LangChain、AutoGen）的场景：
1. 将工具调用的入口从"同步调用 Bedrock"改为"发送 SQS 消息 + 返回任务 ID"
2. Agent 主循环定期轮询 `get_task_status(task_id)`
3. 任务完成后，结果自动写入 Agent 的上下文状态（如 DynamoDB TTL 表）
4. 这样 Agent 的每个工具调用都变成非阻塞的，可以实现真正的并行工具调用

### 成本优化注意事项
SQS 和 Lambda 的成本结构：

- **SQS**：按请求数计费（$0.40/百万请求），与消息大小无关
- **Lambda**：按调用次数和执行时长计费
对于大量小请求（如单图场景），Lambda 冷启动开销可能高于实际执行时间。建议：

- 设置 reserved concurrency 保障核心场景
- 对于非关键的后台任务，使用 Lambda Provisioned Concurrency 消除冷启动
- 监控 `Duration` 和 `Billed Duration` 的比值，评估冷启动比例
---

## 与 Agent 场景的关联
每个子任务独立入队，调用方随时查进度，不用同步等整个 Agent 链跑完。多个 Agent 同时调用也不会触发限流——请求都在队列里排队，由并发控制逐步消化。
这与 Harness Engineering 的上下文持久化思路一致：把状态从"聊天记录"迁移到"外部可验证的工作区"。

## 参考资料
- [Serverless generative AI architectural patterns — Part 2](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-ai-patterns/part2.html)
- [Amazon Bedrock Converse API 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/converse-api.html)
- [Using AWS Lambda with Amazon SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html)
## 相关实体
- [Aws Bedrock Serverless Async Inference Sqs Lambda](ch11/009-aws-bedrock.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/532-amazon-bedrock-agentcore.html)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](../ch04/532-amazon-bedrock-agentcore.html)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](../ch04/532-amazon-bedrock-agentcore.html)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](../ch04/379-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)- [gemma 4 模型发布 — google deepmind 开源权重家族在 amazon bedrock 上线](ch11/157-amazon-bedrock.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

