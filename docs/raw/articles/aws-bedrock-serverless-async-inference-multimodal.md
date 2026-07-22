---
title: "Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例"
source: rss
url: "https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/"
feed_name: AWS China Blog
author: "Louisa Liu"
publication: "亚马逊AWS官方博客"
date: 2026-05-08
ingested: 2026-05-10
sha256: 33542558becda444f3869756e0fba39ee845e31e775614248c7666b0cc3e6363
review_value: 9
review_confidence: 8
review_recommendation: strong
review_stars: 5
tags: [aws, bedrock, serverless, async-inference, sqs, lambda, multimodal, agent]
---
# Amazon Bedrock模型推理的Serverless异步架构
> 来源：[亚马逊AWS官方博客](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/) | 作者：Louisa Liu | 2026-05-08
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
## 与 Agent 场景的关联
每个子任务独立入队，调用方随时查进度，不用同步等整个 Agent 链跑完。多个 Agent 同时调用也不会触发限流——请求都在队列里排队，由并发控制逐步消化。
这与 Harness Engineering 的上下文持久化思路一致：把状态从"聊天记录"迁移到"外部可验证的工作区"。
## 参考资料
- [Serverless generative AI architectural patterns — Part 2](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-ai-patterns/part2.html)
- [Amazon Bedrock Converse API 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/converse-api.html)
- [Using AWS Lambda with Amazon SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html)