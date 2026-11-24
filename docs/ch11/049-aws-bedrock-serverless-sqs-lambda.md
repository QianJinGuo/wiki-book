# AWS Bedrock Serverless 异步推理：SQS + Lambda

> 📊 Level ⭐⭐⭐ | 11.4KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/aws-bedrock-serverless-async-inference-sqs-lambda.md`，一手来源仍见下方 sources。

## 工程实践
- [Bedrock AgentCore 多租户 Agent 构建实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md) — 十组件多租户
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-2.md) — 环境准备步骤篇
- [Bedrock AgentCore 构建 BI 智能体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-ai-agents-for-business-intelligence-with-amazon-bedrock-agentcore.md) — BI三agent案例
- [AWS API MCP Server + Quick Suite + Bedrock AgentCore 集成](https://github.com/QianJinGuo/wiki-public/blob/main/entities/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agen.md) — NL→AWS API范式+AgentCore认证模型
- [Bedrock AgentCore RLM：突破上下文窗口限制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/break-the-context-window-barrier-with-amazon-bedrock-agentcore.md) — RLM程序化环境
- [Amazon Bedrock模型推理的Serverless异步架构 – 处理在线多模态高负载案例](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-serverless-async-inference-multimodal.md) — 异步推理rv9主版
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kiro-job-scheduler-eventbridge-ecs-fargate.md) — 无服务器Kiro调度平台三层架构
- Amazon Bedrock AgentCore Web Search: 托管式网页搜索能力 GA — 托管搜索GA
- [Bedrock AgentCore NLP 仪表盘自动化 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-ai-powered-dashboard-automation-agents-with-nlp-on-amazon-bedrock-agentcor.md) — 仪表盘三代理
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](https://github.com/QianJinGuo/wiki-public/blob/main/entities/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md) — OS层动作补全浏览器自动化盲区
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-一周综述amazon-bedrock-agentcore-付款适用于-aws-的-agent-工具套件等2026-年-5-月-11-日.md) — 周综述有功能详析
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/real-time-voice-agents-with-stream-vision-agents-and-amazon-nova-2-sonic.md) — S2S单次往返+25插件+多端SDK16815字
- [Bedrock AgentCore 自定义代码评估器](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md) — 代码评估器
- [AWS Network Firewall 规则冲突 AI 实时检测方案（部署小指南六）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-network-firewall-ai-conflict-detection-bedrock.md) — 规则冲突检测分工
- [What You Need to Know About Lambda MicroVMs](https://github.com/QianJinGuo/wiki-public/blob/main/entities/theburningmonk-com-2026-06-what-you-need-to-know-about-lambda-microvms.md) — MicroVM沙箱原语对比
- [异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/asynchronous-agent-invocation-patterns-serverless-pipelines.md) — 异步调用三模式
- [Amazon Bedrock + LLM Gateway 实现生产级推理弹性模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/implementing-resilience-patterns-with-amazon-bedrock-and-llm.md) — 五种渐进弹性模式+LLM Gateway
- [AWS Bedrock Dynamic Document Extraction Pipeline](https://github.com/QianJinGuo/wiki-public/blob/main/entities/extract-data-with-on-demand-and-batch-pipelines-dynamically.md) — Bedrock IDP混合路由+prompt版本registry
- ['Lambda MicroVMs vs Lambda Functions：全方位深度对比'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/lambda-microvms-vs-lambda-functions全方位深度对比.md) — VM级隔离+挂起恢复经济学
- [AI Teammates: How monday.com Runs Production AI Agents on Amazon Bedrock](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-teammates-mondaycom-production-ai-agents-bedrock.md) — 生产agent架构
- [Mattel163 MARP：多智能体报告自动生成平台（异步长任务 × 证据链 × Agent-as-Code × 项目级凭证）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mattel163-marp-multi-agent-report-platform-aws-2026-08-17.md) — 异步长任务+证据链+Agent-as-Code四模式
- [TReNDS 自动化根因分析（Strands Agents + Bedrock）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-trends-automates-root-cause-analysis-with-amazon-bedrock.md) — docstring驱动工具+事件驱动RCA
- [Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/couchbase-capella-iq-multi-model-ai-architecture-bedrock-case-study.md) — 多模型架构案例
- [使用 Amazon Bedrock AgentCore 构建企业级 MCP 服务器：四种架构模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/使用-amazon-bedrock-agentcore-构建企业级-mcp-服务器四种架构模式.md) — 四种MCP架构渐进迁移

## 深度分析

### API 矩阵的空档：四种原生推理入口为何都不够用
Bedrock 提供四类推理入口：Converse/InvokeModel 面向同步短推理、ConverseStream 面向流式对话、StartAsyncInvoke 面向视频生成等单任务异步、CreateModelInvocationJob 面向离线批量。"高并发且持续上传文件、要尽快拿到结果"的场景恰好落在四者的共同空档上：同步接口在突发下直接撞 RPM/TPM 配额；StartAsyncInvoke 没有队列缓冲与并发控制、结果只落 S3 需自行处理通知；Batch 延迟在分钟到小时级。因此结论不是换 API，而是在 Converse 之上自建一层异步管道，把缓冲、控速、重试、结果入库串成完整链路。 这一空档判断是全文立论起点：缺的不是模型能力，而是"在线持续流入"这一调度象限的原生支持。与 [异步调用三模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/asynchronous-agent-invocation-patterns-serverless-pipelines.md) 对照阅读，SQS 管道正是其中"队列缓冲"一型的完整工程落地。

### 调速的本质：削峰靠队列，控速靠 ESM
SQS 本身只是被动存储，真正驱动管道的是 Lambda 事件源映射（ESM）——内置轮询器持续拉取消息、攒批调用、按返回值决定删除或重试；削峰靠 SQS 排队，控速靠 ESM 的 MaximumConcurrency 限制同时调用 Bedrock 的 Lambda 实例数，两者配合才构成完整的调速机制。 压测给出了量化对照：200 RPM 配额的 Claude Sonnet 4 面对突发 300 个图片请求，直连不做流量控制时 75% 失败；同样负载走管道（mc=5）零限流、100% 完成，总耗时 221 秒还优于客户端六轮重试的 353 秒——客户端重试虽然最终也能全部成功，但六轮限流浪费了大量 API 调用。 规模再上一个量级，Nova Pro 600 并发直连有三分之一请求不可恢复地丢失，管道版 600/600 全部成功；Nova 2 Lite 2000 并发共 20 万张图片同样 100% 完成。 这种把瞬时高峰均摊到时间窗口的削峰填谷思路，与 [Bedrock 五种渐进弹性模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/implementing-resilience-patterns-with-amazon-bedrock-and-llm.md) 的重试/回退策略互为补充：前者从源头避免限流，后者在限流发生后兜底。

### Partial Batch Failure 的两个隐含前提
"单条失败只重试那条"的机制有两个容易忽略的前提。其一，ReportBatchItemFailures 必须显式开启，否则 handler 返回的 batchItemFailures 会被忽略，一条失败拖累整批重试；配上 DLQ 后，SQS 为每条消息维护接收计数，超过 maxReceiveCount 的毒消息自动隔离，既不阻塞流水线也不丢数据。 其二，SQS 是 at-least-once 投递，重复消费不可避免，处理 Lambda 必须以幂等检查开头跳过已完成请求；SDK 端配 max_attempts=1 让失败快速交还 SQS，借 visibility timeout 的冷却期重试，比 SDK 内部立即重试更安全。 CDK 侧 batch_size=1、max_concurrency=5、report_batch_item_failures=True 的组合正是这两点在基础设施层的配置闭环。

### mc 公式与 timeout 秩序：参数调优的两条硬约束
并发上限不是拍出来的：max_concurrency = min(mc_rpm, mc_tpm)，两个分量分别由 RPM/TPM 配额乘以单次平均处理时间推得；RPM 是硬限制不可突破，TPM 有弹性、可实测上调。且并发并非越大越快——限流过多引发消息反复重试、队列膨胀，反而拖慢整体完成时间。 timeout 侧则必须满足 visibility_timeout > Lambda timeout > read_timeout > 实际处理时间的层层递增，任一层倒置都会造成请求被中断或消息被重复处理；混合输入按最慢场景配置，偏大的代价只是失败重试稍慢，偏小的代价是请求白做。 成本侧，Nova 2 Lite 对所有图片和文档页面统一按 ~230 tokens 计费、不论分辨率与复杂度，Claude 系列每张图片优化到约 ~1,600 tokens，这解释了大规模测试选 Nova 的原因。

## 实践启示

1. 选型按场景对号入座：实时短推理与对话用 Converse/ConverseStream，单长任务用 StartAsyncInvoke，离线批量用 Batch Job；只有"在线持续流入"才值得自建 SQS+Lambda 管道。
2. 并发上限先算后调：按 mc_rpm/mc_tpm 公式取 min 作起点再压测微调；RPM 侧永不超过配额，TPM 余量靠实测确认，切忌盲目调大引发队列膨胀。
3. timeout 三层按链路递增落地：大文件 PDF 场景可直接参考 read_timeout 120s / Lambda 180s / visibility_timeout 300s 的实测配置；混合负载按最慢场景取值。
4. ESM 三件套缺一不可：显式开启 ReportBatchItemFailures、配置 DLQ 与 maxReceiveCount、handler 逐条返回 batchItemFailures；并对 DLQ 做告警与人工复查。
5. 处理 Lambda 首行做幂等检查，SDK 设 max_attempts=1，把重试节奏交给 SQS 的 visibility timeout 冷却期而非 SDK 内部重试。
6. 多 Agent 场景把提交+轮询封装为同步函数：子任务独立入队、由并发控制逐步消化，多个 Agent 并发调用互不触发限流，调用方对异步管道无感知。

## 延伸导航
- [AWS 云 AI 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

