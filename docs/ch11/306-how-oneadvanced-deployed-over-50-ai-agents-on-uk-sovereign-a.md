# How OneAdvanced deployed over 50 AI agents on UK-sovereign AWS

## Ch11.306 How OneAdvanced deployed over 50 AI agents on UK-sovereign AWS

> 📊 Level ⭐⭐ | 2.8KB | `entities/how-oneadvanced-deployed-over-50-ai-agents-on-uk-sovereign-aws.md`

# How OneAdvanced deployed over 50 AI agents on UK-sovereign AWS

## 核心洞察：数据主权约束下的自托管开放权重模型

OneAdvanced（英国企业软件供应商，服务 10,000+ 客户）需要在数据不离开英国的前提下交付 AI 能力。当时目标模型 Llama 4 Maverick 和 Llama Guard 4 尚未在 UK region 的托管服务中可用，因此选择在完全自控的 AWS 基础设施上自托管开放权重 LLM。

这个决策的本质是主权约束驱动的模型托管选择：当托管服务缺 region 时，自托管 vLLM 是唯一能满足数据驻留、安全与隐私标准（ISO 42001 AI 治理认证）的路径。

## 架构组成

- **模型服务**：vLLM 在 SageMaker AI 上服务 Llama 4 Maverick (FP8) 和 Llama Guard 4，运行在 London (eu-west-2) 区域的 p5.48xlarge 实例。
- **Agent 编排**：50+ Strands agents 运行在 Amazon ECS，每个 agent 有自己的 system prompt、工具配置、可选输入表单，agent 配置存储在 DynamoDB。
- **RAG 管道**：S3 上传文档 → markdown 转换 → chunking → embedding 入 pgvector（Aurora PostgreSQL）→ 检索。
- **内容审核**：Llama Guard 4 在请求到达主模型前检查用户输入的有害内容。

## 请求流与治理

典型请求流：用户发送请求 → Llama Guard 4 审核 → 主模型（Llama 4 Maverick）处理 → 工具层/检索。整个方案支持 ISO 42001 AI 治理认证，保持对模型服务基础设施的完全控制。

## 相关实体

- [Strands Agents](../ch04/779-strands-agents.html)
- [Strands Agents 成本优化](../ch04/779-strands-agents.html)
- [Strands Agents 高性能 GenAI 系统](../ch04/779-strands-agents.html)
- [Bedrock AgentCore Coding Agent 托管](ch11/059-bedrock-agentcore.html)
- [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/retrieval-augmented-generation-rag.md)
- [vLLM](../ch01/880-vllm.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-oneadvanced-deployed-over-50-ai-agents-on-uk-sovereign-aws.md)

---

