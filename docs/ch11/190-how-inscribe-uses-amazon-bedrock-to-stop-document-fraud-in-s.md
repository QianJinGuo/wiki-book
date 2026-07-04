# How Inscribe uses Amazon Bedrock to stop document fraud in seconds

## Ch11.190 How Inscribe uses Amazon Bedrock to stop document fraud in seconds

> 📊 Level ⭐⭐ | 6.0KB | `entities/how-inscribe-uses-amazon-bedrock-to-stop-document-fraud.md`

# How Inscribe uses Amazon Bedrock to stop document fraud in seconds

## 摘要

Inscribe 使用 Amazon Bedrock 构建 Agentic AI 系统，在 90 秒内检测篡改、伪造和 AI 生成的金融文档。传统人工审核需要 30 分钟/份，而 agentic 系统通过多 Agent 协作实现了 20 倍效率提升。系统采用多模型架构——Claude Haiku 负责快速解析与分类，Meta Llama 处理交易数据，Claude Sonnet 承担跨文档分析与协调——配合 Amazon SageMaker 上运行的自有专利检测模型，实现了深度防御式的欺诈检测体系。

## 核心要点

- **20x 效率提升**：Agentic AI 将单份文档审核时间从 30 分钟压缩至 90 秒，同时保持金融机构所需的准确性与可解释性
- **多模型分工架构**：不同 Foundation Model 各司其职——Haiku 处理高吞吐例行任务（成本降低 40%），Llama 处理交易实体提取，Sonnet 执行跨文档推理与报告生成
- **三层检测体系**：FM 级语义分析 + SageMaker 专有模型（像素级取证、网络模式检测） + 人工复核兜底，形成纵深防御
- **可量化的客户成果**：BHG Financial 减少 90%+ 人工审核时间，Logix Federal Credit Union 8 个月内防止 $3M+ 欺诈损失，BCU 防止 $5.6M 损失
- **架构可复制性**：多模型编排模式可作为其他企业构建 Agentic AI 工作流的参考模板

## 深度分析

### Agentic AI 为何更适合文档欺诈检测

传统规则系统依赖静态签名库和模式匹配，面对 AI 生成的伪造文档和深度伪造时几乎无效。Agentic AI 的核心优势在于其推理能力——它不像规则引擎那样机械地匹配特征，而是像人类分析师一样理解文档上下文：检查逻辑一致性、跨文档交叉验证、主动搜索外部信息来验证雇主和地址。

Inscribe 的 CTO Conor Burke 指出，2025 年 4 月到 12 月间 AI 生成的伪造文档增长了 5 倍，每 16 份文档中就有 1 份存在欺诈。在这种攻击面快速演化的环境下，静态规则的生命周期以月计，而 Agentic AI 可以实时适应新威胁模式。

### 多模型编排的经济学

Inscribe 架构中最具工程价值的设计决策是**不为所有任务使用同一个模型**。这解决了 Agentic AI 落地的核心矛盾：顶尖模型（如 Sonnet）在复杂推理上表现出色，但成本高昂；轻量模型（如 Haiku）成本低但推理能力有限。通过将任务分解为"解析→分类→实体提取→交叉验证→报告生成"的流水线，每个环节使用最合适的模型，Inscribe 在不牺牲质量的前提下显著降低了推理成本。

Ivo（Inscribe 的工程经理）在评估 Meta Llama 时的决策标准值得借鉴：当 Llama 在特定任务上的质量与更昂贵的模型相当时，选择 Llama 允许团队在不影响结果的情况下大幅削减成本。这种务实的模型选择哲学对于任何构建生产级 Agentic AI 的团队都有参考意义。

### 基础设施架构的工程启示

Inscribe 的 AWS 基础设施设计体现了生产级 Agentic AI 的几个关键工程模式：

1. **异步处理队列**：使用 Amazon SQS + Celery Worker 的队列架构解耦了文档上传与处理，自动应对流量波峰波谷
2. **并行检测管线**：FM 语义分析 与 SageMaker 专有模型并行运行，而非串行等待——这种"多路径并行"模式是 Agentic AI 系统的核心性能优化手段
3. **缓存与向量检索**：使用 ElastiCache 缓存短期数据（如 webhook token），MemoryDB 作为向量数据库存储交易嵌入，支持 KNN 近邻搜索
4. **可观测性闭环**：CloudWatch 追踪推理延迟、错误率、Token 用量和每次请求的成本，支持模型漂移检测与早期预警

这些模式共同构成了一个不仅"能跑"而且在生产环境"能持续跑好"的 Agentic AI 系统。

## 实践启示

1. **选择模型组合而非单一模型**：为每个子任务选择最合适的模型，而非追求一个"全能模型"。关键在于建立评估矩阵（质量×延迟×成本），对每个任务维度进行独立评测。
2. **构建深度防御而非单点检测**：将 FM 级语义分析、专有 ML 模型（像素分析、网络模式检测）和人工复核结合起来。欺诈者会针对一种检测手段进行调整，但难以同时绕过所有检测层。
3. **异步队列架构是 Agentic 系统的基石**：SQS/Celery 模式解耦了请求的接收与处理，是应对不可预测流量和长时间推理任务的核心基础设施模式。
4. **将可观测性作为第一优先级**：在生产环境中运行 Agentic AI 系统时，追踪每次推理的成本、延迟和质量指标不是可选项，而是保障系统长期健康运行的必需品。
5. **人机协作优于全自动**：Inscribe 的设计哲学是"自动化例行分析，标记复杂案例供人工审查"——在可预见的时间内，Agentic AI 的最佳形态是增强人类分析师，而非完全替代他们。

## 相关实体

- [Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-bedrock-agentcore-harness-ga.md)
- [Bedrock Claude Prompt Cache](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-bedrock-claude-prompt-cache-strategy.md)
- [Bedrock Cross-Region Inference](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-bedrock-cross-region-inference-cris-eu-gdpr.md)
- [Agentic AI 系统架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agentic-ai-system-architecture-harness-skill-mcp.md)
- [Bedrock Serverless Inference](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-bedrock-model-inference-serverless-architecture-case-study.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-inscribe-uses-amazon-bedrock-to-stop-document-fraud.md)

---

