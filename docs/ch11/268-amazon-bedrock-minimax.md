# 在 Amazon Bedrock 上运行 MiniMax 模型

## Ch11.268 在 Amazon Bedrock 上运行 MiniMax 模型

> 📊 Level ⭐⭐ | 1.9KB | `entities/minimax-models-on-amazon-bedrock-deployment-guide.md`

# 在 Amazon Bedrock 上运行 MiniMax 模型

Amazon Bedrock 现支持 MiniMax M2 系列三款开源权重模型（M2、M2.1、M2.5），推理完全运行在 AWS 托管基础设施上，用户的提示和完成数据不用于训练任何模型，也不与模型提供商共享。

## MiniMax M2 系列

MiniMax 是一家全球性 AI 技术公司，专注于多模态基础模型的高效架构研究。其 M2 系列采用 Mixture-of-Experts（MoE）架构，每个 token 仅激活一小部分参数，以较低推理成本提供大容量密集模型的知识能力。

- **MiniMax M2**：首个推出的模型，具备强大多语言文本生成、扎实的推理编码能力，以及 100 万 token 上下文窗口。
- **MiniMax M2.1**：在推理深度、编码准确性和指令遵循方面进行了针对性改进。
- **MiniMax M2.5**：最新模型，针对 Agent 原生执行进行了专门训练，强调工具调用、多步骤任务分解和长周期编码任务。

## 部署选项

Amazon Bedrock 提供三种服务层级：
- **On-Demand（按需）**：适合弹性工作负载，按调用量计费
- **Provisioned Throughput（预留吞吐量）**：适合稳定高负载场景
- **Batch Inference（批量推理）**：适合异步大规模处理任务

用户可通过 Bedrock API、AWS SDK 或 Converse API 访问这些模型。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/run-minimax-models-on-amazon-bedrock.md)

---

