# Announcing OpenAI-compatible API support for Amazon SageMaker AI Endpoints

## Ch01.674 Announcing OpenAI-compatible API support for Amazon SageMaker AI Endpoints

> 📊 Level ⭐⭐ | 6.6KB | `entities/announcing-openai-compatible-api-support-for-amazon-sagemaker.md`

## 核心要点

- AWS SageMaker AI Endpoints 新增 OpenAI 兼容 API，支持直接迁移现有 LLM 应用
- 涉及 endpoint 配置、模型部署、token 计费等关键技术细节
- 开发者可零成本迁移至 SageMaker，降低 AI 应用部署成本

## 相关实体
- [Amazon Bedrock Api Security Guide](../ch12/033-amazon-bedrock-api.md)
- [Build Real Time Voice Applications With Amazon Sagemaker Ai](../ch04/070-ai.md)
- [Amazon Bedrock Agentcore Gateway Mcp Extension](../ch04/500-amazon-bedrock-agentcore.md)
- [Build Ai Agents For Business Intelligence With Amazon Bedrock Agentcore](../ch04/500-amazon-bedrock-agentcore.md)
- [Fine Tune Llm With Databricks Unity Catalog And Amazon Sagemaker](ch01/619-fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/announcing-openai-compatible-api-support-for-amazon-sagemaker.md)

- [Openai Models And Codex On Amazon Bedrock Are Now Generally ](../ch11/240-openai-models-and-codex-on-amazon-bedrock-are-now-generally.md)
- [开始在 Amazon Bedrock 上使用 Openai Gpt 55Gpt 54 模型和 Codex](../ch11/152-amazon-bedrock.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)
## 深度分析

### 技术架构层面

SageMaker AI 的 OpenAI 兼容 API 本质上是在现有实时推理端点之前增加了一层协议适配层。通过在 URL 路径中暴露 `/openai/v1/chat/completions` 端点，将 OpenAI 的 Chat Completions 请求格式转换为 SageMaker 内部的标准推理调用格式，而响应则保持原生格式返回（包括 streaming）。这种设计使得端点无需修改即可同时服务标准 SageMaker SDK 调用和 OpenAI 兼容调用，实现了向后兼容。

### Bearer Token 认证机制

该功能的核心创新在于 bearer token 认证机制。传统 SageMaker 推理需要使用 SigV4 签名，这对于标准 OpenAI 客户端（如 LangChain、Vercel AI SDK）是不可接受的。SageMaker Python SDK 提供的 `generate_token` 函数在客户端侧完成 SigV4 签名的生成——它构建一个 `CallWithBearerToken` 操作的预签名 URL，并将其编码为 base64 字符串作为 bearer token。整个过程无网络调用，token 生成后包含原始 AWS 凭证的授权范围，有效期上限为 12 小时。这一机制使得 OpenAI 兼容客户端可以通过标准 `Authorization: Bearer <token>` 头部直接调用 SageMaker 端点。

### 多模型托管的 Inference Components 架构

文章详细展示了如何使用 Inference Components 在单个端点上托管多个模型。每个推理组件独立关联到端点的某个 Production Variant，拥有独立的计算资源分配（CPU cores、GPU devices、memory），并通过 URL 路径中的 `/inference-components/<IC_NAME>/` 进行寻址。这种架构允许：1）多个模型共享同一底层实例以提高 GPU 利用率；2）各模型独立扩缩容；3）通过共享 `httpx.Client` 实现连接池复用，降低 TLS 握手开销。对于运行多个 LLM（如 Llama 用于通用任务 + Mistral 微调版用于垂直领域 + 小模型用于分类）的场景，此架构提供了统一的 OpenAI SDK 接口。

### 与现有生态的集成路径

该功能桥接了两类主流开发者生态：一是使用 LangChain、Strands Agents、OpenAI SDK 构建 AI 应用的开发者，他们无需代码重写即可将推理后端切换到自有 SageMaker 基础设施；二是通过 LLM Gateway（如 Bifrost）管理多提供商的企业，SageMaker 可作为原生 OpenAI 兼容端点无缝接入。vLLM Deep Learning Container 的工具调用支持（`hermes` parser）进一步保障了 agentic workflow 的可靠性。

## 实践启示

### 迁移策略建议

对于已有 OpenAI API 集成的应用，迁移到 SageMaker 的路径极为简洁：仅需更改 base_url 和 api_key 两处配置。但实践中应注意：1）确认目标模型已部署于 SageMaker 或准备部署；2）验证模型容器版本与 SDK 版本兼容；3）由于 SageMaker 按端点运行时间计费而非按 token 计费，需重新评估成本模型——高频小请求场景下 SageMaker 可能显著更贵，而高吞吐长会话场景则可能节省成本。

### 安全实施要点

Bearer token 携带与生成所用 AWS 凭证同等的权限，这要求：1）token 生成应使用最小权限 IAM role，仅授予特定端点的 `InvokeEndpoint` 和 `CallWithBearerToken` 权限；2）禁止使用 `AdministratorAccess` 或 `SageMakerFullAccess` 生成 token；3）token 应在请求时即时生成，避免存储和传输；4）生产环境必须使用 HTTPS；5）设置尽可能短的 token 有效期以限制泄露后的影响窗口。对于长驻应用，推荐使用 `httpx.Auth` 自动刷新模式实现每次请求使用新 token。

### 成本优化考量

SageMaker 端点按实例小时数计费，无论实际是否有流量。这意味着：1）开发测试环境应使用可中断的部署策略或及时清理；2）多模型场景应优先考虑 Inference Components 而非独立端点以共享底层资源；3）选择实例类型时需权衡 GPU 显存需求与成本——文章使用 `ml.g6.2xlarge`（单卡 L4）部署 Qwen3-4B，对于更大模型可能需要 `ml.g6.12xlarge` 或 `ml.p4d` 等更高配置；4）需考虑 Data Residency 要求带来的溢价——当数据不能离开特定区域时，SageMaker 的成本优势可能被合规溢价抵消。

### 适用场景判断

该功能最适用于以下场景：1）已有 AI agent 应用（LangChain/Strands）需要私有化部署且要求数据不出域；2）需要细粒度控制模型版本和容器版本的监管行业；3）多模型组合调用且希望统一 API 接口的复杂应用。相反，对于原型验证、快速迭代或流量波动大的场景，直接使用 OpenAI API 仍是更灵活且成本可预测的选择——SageMaker 的 5-10 分钟冷启动时间使其不适合需要快速扩缩容的场景。

---

