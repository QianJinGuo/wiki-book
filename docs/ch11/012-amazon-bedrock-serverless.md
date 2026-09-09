# Amazon Bedrock 模型推理 Serverless 架构案例

> 📊 Level ⭐ | 5.0KB | `entities/amazon-bedrock-model-inference-serverless-architecture-case-study.md`

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
- [AWS Bedrock Agentcore Quality Optimization Flywheel](099-aws-bedrock-agentcore-quality-optimization-flywheel.html) — 质量飞轮
- [AWS Sagemaker Capacity Aware Inference Fallback](../ch01/235-aws-sagemaker-capacity-aware-inference-fallback.html) — 容量仲裁
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-5.md) — 消息渠道验证篇
- [Extending MCP support for Amazon Bedrock AgentCore Gateway](108-extending-mcp-support-for-amazon-bedrock-agentcore-gateway.html) — MCP三原语统一+OAuth委托网关机制
- [让 Amazon Quick 操作飞书：构建远程 MCP 服务的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/让-amazon-quick-操作飞书构建远程-mcp-服务的设计实践.md) — MetaTool分层注册设计
- [构建无服务器Kiro调度平台：用Kiro CLI + EventBridge + ECS Fargate实现定时AI任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建无服务器kiro调度平台用kiro-cli-eventbridge-ecs-fargate实现定时ai任务.md) — 定时AI任务7x24
- [Secure AI agents with Policy and Lambda interceptors in Amazon Bedrock AgentCore gateway](https://github.com/QianJinGuo/wiki-public/blob/main/entities/secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.md) — Cedar策略+Lambda拦截器双模式
- [Amazon Quick integration with time-series databases for market intelligence using MCP](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-mcp-kdbx-time-series.md) — 集成短条
- [构建基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md) — 对抗辩论TypedDict状态
- [AWS SageMaker AI Agent 引导式工作流微调](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md) — 引导式微调
- [构建 Serverless A2A 网关：Agent 发现、路由与访问控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-serverless-a2a-gateway-agent-discovery-routing-access-control.md) — A2A网关三层
- [Couchbase Capella iQ — 多模型 AI 推理架构的 Bedrock 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/couchbase-capella-iq-multi-model-ai-architecture-bedrock-case-study.md) — 多模型架构案例
- [为游戏业务团队构建只读代码问答 Agent：架构、性能与安全实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/readonly-code-qa-agent-game-business-team-aws-2026.md) — 只读代码QA：执行环境与数据面分离

## 延伸导航
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)
- [LLM 研究前沿](https://github.com/QianJinGuo/wiki-public/blob/main/moc/llm-research-frontiers.md)
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

