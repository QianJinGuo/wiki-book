# Amazon Bedrock 模型推理 Serverless 架构案例

> 📊 Level ⭐⭐⭐ | 10.3KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/amazon-bedrock-model-inference-serverless-architecture-case-study.md`，一手来源仍见下方 sources。

## 机制与论文
- [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — harness工程survey
- [Protecting against token theft](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vercel-com-blog-protecting-against-token-theft.md) — 推理盗用经济学与防御
- [Amazon Bedrock Mantle 推理引擎 + LiteLLM 网关统一收敛](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-mantle-litellm-gateway-2026.md) — Mantle引擎收敛

## 工程实践
- [一点天下：Context Engineering 与 Agentic AI (QCon)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yidian-tianxia-context-engineering-agentic-ai-qcon.md) — 7114字最全六层上下文版
- [Hermes-Agent 官方 Kanban 深度实测：让商业 CLI 工具当 Orchestrator](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-kanban-deep-test-by-wjjagi-2026.md) — Kanban深度实测+七条bug 7101字rv9全版
- [Redis agentic AI flowers with Iris](https://github.com/QianJinGuo/wiki-public/blob/main/entities/www.blocksandfiles.com-5241795.md) — 上下文范式翻转四支柱
- [Bedrock AgentCore Pool Model Multi-Tenancy](https://github.com/QianJinGuo/wiki-public/blob/main/entities/shared-infrastructure-isolated-tenants-pool-model-multi-tenancy-with-amazon-bedrock-agentcore.md) — 池模型多租户三级隔离
- [How Loka Built a Natural, Low-Latency Voice Agent with Amazon Nova 2 Sonic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-loka-built-a-natural-low-latency-voice-agent-with-amazon.md) — S2S vs三步流水线+prompt迭代2.7→3.8
- [存之有序，治之有矩——Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md) — 写入纪律prompt cache冲突
- [AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — 四支柱解析版
- [AWS 强化微调：LLM-as-Judge 训练范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-reinforcement-fine-tuning-llm-as-judge.md) — RFT judge范式
- AWS Bedrock Agentcore Quality Optimization Flywheel — 质量飞轮
- AWS Sagemaker Capacity Aware Inference Fallback — 容量仲裁
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-5.md) — 消息渠道验证篇
- Extending MCP support for Amazon Bedrock AgentCore Gateway — MCP三原语统一+OAuth委托网关机制
- [让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md) — MetaTool分层注册设计
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md) — 定时AI任务7x24
- Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway — Cedar策略+Lambda拦截器双模式
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [构建基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md) — 对抗辩论TypedDict状态
- [AWS SageMaker AI Agent 引导式工作流微调](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md) — 引导式微调
- [构建 Serverless A2A 网关：Agent 发现、路由与访问控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-serverless-a2a-gateway-agent-discovery-routing-access-control.md) — A2A网关三层
- [Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/couchbase-capella-iq-multi-model-ai-architecture-bedrock-case-study.md) — 多模型架构案例
- [为游戏业务团队构建只读代码问答 Agent：架构、性能与安全实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/readonly-code-qa-agent-game-business-team-aws-2026.md) — 只读代码QA：执行环境与数据面分离

## 深度分析

### 异步管道的本质：把"限流协商"从客户端移到基础设施

Bedrock 的 RPM/TPM 配额本质上是一种服务端准入控制。直连模式下，协商失败的代价由客户端承担——请求被 429 拒绝、丢失或需自行重试。SQS + Lambda 管道的核心贡献不是"更快"，而是把限流协商下沉为基础设施职责：队列是协商缓冲区，ESM 的 MaximumConcurrency 是协商执行者。压测数据（300 并发直连 22% 成功率 vs 管道 100%）证明这不是工程美化，而是可用性等级的跃迁。这一模式可推广到任何有配额限制的下游 API，不只限于 Bedrock。

### max_concurrency 的数学：调参不是玄学而是约束求解

文章给出的 `max_concurrency = min(mc_rpm, mc_tpm)` 公式把调速阀参数化：mc_rpm 由 RPM 配额和单次平均耗时决定（硬上界），mc_tpm 由 TPM 配额和单请求 token 量决定（有弹性）。多模态场景的特殊性在于 token 量方差极大——单张图片约 1.6K tokens，多文件 PDF 可达约 70K tokens，意味着同一管道处理不同输入类型时最优并发可相差一个数量级（图片场景 mc=5 vs PDF 场景 mc=40）。实践上应按输入类型分队列或分 ESM 配置，而不是用单一并发值硬套所有流量。

### 三层 timeout 是防御性设计的教科书案例

`visibility_timeout > Lambda timeout > read_timeout` 的层层递增结构，每层对应一种特定的失败模式：read_timeout 过小则 SDK 提前断开白做请求；Lambda timeout 不大于 read_timeout 则推理完成但结果来不及落库；visibility_timeout 不大于 Lambda timeout 则消息重复投递。这个设计的深层原则是：**外层的超时必须为内层的全部工作（含非推理部分）留余量**。SQS 的 at-least-once 投递语义决定了幂等检查（先查 DynamoDB 状态再处理）不是可选项而是必需品——任何队列驱动的重试系统都遵循同样的纪律。

### Partial Batch Failure 的隐含前提与 SDK 重试的反直觉配置

`report_batch_item_failures` 必须显式开启，否则一条失败导致整批重试——这是 ESM 默认行为中最容易踩的坑。同样反直觉的是 `max_attempts=1`：通常我们会让 SDK 内部重试，但在这条管道里 SDK 内部重试会占用 Lambda 执行时间、放大超时风险，而 SQS 的 visibility timeout 冷却期提供了更安全的重试节奏。**把重试责任从 SDK 上移到队列层**，是 serverless 异步管道区别于传统微服务重试策略的关键判断。

### 成本维度：token 计费模型应进入架构选型

Nova 2 Lite 对所有图片和文档页面统一按约 230 tokens 计费（Claude 系列每张图片约 1,600 tokens），在 2000 请求 x 100 张图片的规模下，仅 token 计费差异就接近 7 倍。这说明多模态批量场景的模型选型不能只看单次推理质量和延迟，token 计价粒度（按图片统一计费 vs 按实际 token）对总成本的影响可能是决定性的。批量异步管道 + 高性价比模型（如 Nova 2 Lite）的组合，是成本敏感型审核/提取场景的默认起点。

## 实践启示

1. **同步直调 Bedrock 处理多模态高并发是架构性错误**：只要预期并发可能超过 RPM/TPM 配额（300 并发直连实测 75% 失败），就应直接采用队列缓冲 + 并发控制模式，不要依赖客户端重试补救——重试轮次（6 轮 353s）既慢又浪费 API 调用。参见 [Serverless A2A 网关](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-serverless-a2a-gateway-agent-discovery-routing-access-control.md) 中同类的异步入口设计。
2. **max_concurrency 用公式算、用实测校准**：按 `min(RPM x avg_time/60, TPM x avg_time/(tokens x 60))` 求初值，再针对实际输入类型压测微调；RPM 是硬上界，TPM 有上调弹性。混合输入类型时按最慢输入（大 PDF）配置或分队列隔离。
3. **三层 timeout 按 `visibility > Lambda > read > 实际耗时` 配置**：图片场景可用紧凑值（30s/60s/120s），大文件 PDF 必须留足余量（120s/180s/300s）；timeout 偏大的代价只是重试变慢，偏小会导致请求中断和消息重复处理。
4. **幂等检查 + Partial Batch Failure + DLQ 三件套缺一不可**：处理 Lambda 开头先查结果表跳过已完成请求；ESM 显式开启 `report_batch_item_failures` 且 SDK `max_attempts=1`；DLQ 配 maxReceiveCount 并接告警——这是队列驱动推理管道的生产底线。
5. **多模态批量的模型选型把 token 计费粒度当一等公民**：统一按页计费的 Nova 2 Lite 与按实际 token 计费的 Claude 在图片密集场景成本差数倍，先算账再选型；对延迟不敏感的纯离线任务可直接用 Batch Job 享受折扣。容量与配额的动态仲裁思路可参考 SageMaker Capacity Aware Inference Fallback。

## 延伸导航
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [LLM 研究前沿](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-research-frontiers.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

