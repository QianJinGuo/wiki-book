# AWS Bedrock Serverless 异步推理：SQS + Lambda

> 📊 Level ⭐ | 5.3KB | `entities/aws-bedrock-serverless-async-inference-sqs-lambda.md`

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
- [Amazon Bedrock AgentCore Web Search: 托管式网页搜索能力 GA](../ch04/398-amazon-bedrock-agentcore-web-search-ga.html) — 托管搜索GA
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

## 延伸导航
- [AWS 云 AI 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

