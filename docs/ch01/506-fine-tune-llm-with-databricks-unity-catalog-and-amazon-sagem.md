# Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI

## Ch01.506 Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI

> 📊 Level ⭐⭐ | 7.1KB | `entities/fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagemaker.md`

## 核心要点
- Databricks Unity Catalog + Amazon SageMaker AI 微调方案
- 使用 Nova Micro 微调
- Source: https://aws.amazon.com/blogs/machine-learning/fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagemaker-ai/

## 相关实体
- [基于 MIG 技术在 Amazon SageMaker HyperPod 上实现 GPU 虚拟化的最佳实践 | 亚马逊AWS官方博客](../ch11-047-基于-mig-技术在-amazon-sagemaker-hyperpod-上实现-gpu-虚拟化的最佳实践-亚马逊a/)
- [LLM-as-Judge: RFT的6步法官设计方法论](../ch01-437-aws-reinforcement-fine-tuning-llm-as-judge/)
- [Amazon Nova Lite Fine-Tuning: 高性价比的视觉检测模型微调案例与实践 | 亚马逊AWS官方博客](../ch11-054-amazon-nova-lite-fine-tuning-高性价比的视觉检测模型微调案例与实践-亚马逊aws官方博/)
- [Build real-time voice streaming applications with Amazon Nova Sonic and WebRTC](../ch01-450-build-real-time-voice-streaming-applications-with-amazon-nov/)
- [Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments](../ch07-027-securing-ai-agents-aws-cisco-ai-defense-给-mcp-a2a-加上企业级/)
- [Build financial document processing with Pulse AI and Amazon Bedrock](../ch11-130-build-financial-document-processing-with-pulse-ai-and-amazon/)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](../ch12-032-别让你的-amazon-bedrock-模型为他人打工-api-调用安全防护指南/)

- MOC
## 深度分析
1. **跨服务治理的复杂性来源**：本文展示的架构涉及三个核心服务的深度集成——Databricks Unity Catalog 负责元数据治理与权限控制、Amazon EMR Serverless 承担 Spark 预处理、最后由 SageMaker AI 执行模型微调。三个服务各自有独立的认证体系和数据访问模型，要让它们在统一的安全边界内协作，必须解决 OAuth 凭证的跨服务传递、IAM 角色的精细权限配置，以及数据访问策略的一致性同步问题。任何一处配置偏差都会导致治理链条断裂，这在生产环境中尤其危险。
2. **数据血缘作为一等公民的设计哲学**：方案从 SEC EDGAR 公开数据源开始，经过 Unity Catalog 托管表的治理、EMR Serverless 的预处理加工，最终到 SageMaker 微调后的模型注册回到 Unity Catalog，全链路血缘被显式追踪。这意味着监管审计不再依赖事后推断，而是可以直接查询"哪个源数据训练了哪个模型"的精确链路，对于金融、医疗等受监管行业是刚性需求而非锦上添花。
3. **OAuth 凭证桥接是治理闭环的关键**：SageMaker Training Job 能够读取 Unity Catalog 托管数据的关键在于通过 AWS Secrets Manager 存储并调用 Databricks OAuth 凭证，而非使用静态 API Key 或直接 IAM 角色穿越。这种设计保证了凭证的短时效性和可撤销性，任何 SageMaker 任务都必须在运行时动态换取访问令牌，无法绕过 Unity Catalog 的授权模型。如果直接用 IAM Role 访问 S3，数据访问行为将脱离 Unity Catalog 的审计范围。
4. **外部数据 lineage 注册将治理边界扩展到 ML 制品**：微调完成后，模型 artifacts 被写回 Unity Catalog 托管的 S3 桶，同时以"外部数据"形式注册 lineage。这个步骤的意义在于：即便模型 artifact 物理上存储在 S3，其元数据（在 Unity Catalog 中）仍然包含血缘关系，监管或合规团队可以追溯数据来源，而无需访问实际的 S3 对象权限。这是一种将治理能力"提升一层"的设计模式。
5. **Ministral-3B-Instruct 的模型选择策略**：方案选用 3B 参数量的 Ministral-3B-Instruct 而非主流的 7B/13B 模型，暗示了一种面向受监管行业的成本优化逻辑——3B 模型在 SageMaker 训练成本显著低于更大参数模型，同时在特定领域（如金融文档处理）的微调效果足以满足业务需求。这种"够用就好"的模型选择哲学，在合规驱动的场景下比"越大越好"的消费级 AI 思路更务实。

## 实践启示
1. **在 Databricks 侧先完成 External Access 配置，再动任何跨服务数据访问**：Unity Catalog 的外部数据访问权限必须显式开启，否则 EMR Serverless 或 SageMaker 即使持有有效 OAuth Token 也会在元数据层被拒绝。这是整个治理链条的前置条件，未配置就尝试访问会导致静默失败，排查难度极高。
2. **OAuth 凭证必须存储在 AWS Secrets Manager 中，而非代码或环境变量**：SageMaker Studio JupyterLab Space 中如果硬编码 Databricks Client ID 和 Secret，等同于将治理权杖暴露在明文里。Secrets Manager 支持细粒度 IAM 策略控制，可以限制只有特定 SageMaker Execution Role 能读取对应 Secret，这才是生产级安全实践。
3. **用 Unity Catalog Open REST API 而非直接 S3 路径访问数据**：当 EMR Serverless Job 调用 `spark.read.format("delta").table("catalog.schema.table")` 时，请求经由 Unity Catalog REST API 鉴权，数据访问行为被完整记录；若改为直接读取 `s3://bucket/path` 的路径式访问，Unity Catalog 的治理和血缘追踪能力将完全失效，所有合规努力付之东流。
4. **模型 artifacts 必须写回 Unity Catalog 托管的 S3，而非独立 S3 路径**：注册模型时选择 Unity Catalog 托管的存储位置，可以确保模型元数据与数据血缘在同一个治理平面内。若将 artifacts 存入一个完全独立、不受 Unity Catalog 管理的 S3 路径，虽然训练流程同样可以完成，但事后的合规审计将无法自动关联"模型←训练数据"的链路。
5. **血缘追踪的审计价值在事故调查时才能真正体现**：建议在日常建立数据血缘的可查询机制（例如通过 Unity Catalog 的 lineage API），而不是等到监管审查时才去回溯。当出现模型输出异常或合规质疑时，能够在分钟级回答"这个模型的第 X 版是用哪些源数据训练的"，比任何事后日志重建都更高效且可信。

## 关联阅读

---

