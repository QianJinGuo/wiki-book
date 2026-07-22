# 在 Amazon Bedrock 上运行 MiniMax 模型

## Ch11.143 在 Amazon Bedrock 上运行 MiniMax 模型

> 📊 Level ⭐⭐ | 7.8KB | `entities/minimax-models-on-amazon-bedrock-deployment-guide.md`

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

## 深度分析

### MiniMax M2.5 的 Agent-Native 训练范式

MiniMax M2.5 是 M2 系列中在 Agent 场景下最具差异化的模型。它不仅采用标准的指令微调，而是通过强化学习（RL）在 Agentic Scaffolds 上进行专门训练。这意味着模型在训练阶段就学习了工具调用的完整流程——解析用户意图 → 选择工具 → 构造参数 → 解析返回 → 整合结果。这与传统模型在推理阶段"事后"附加工具调用能力的设计有本质区别：Agent-native 训练使工具调用成为模型的"本能"而非"外挂"。

从 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 视角看，M2.5 的 Agent-native 训练是对"能力-执行"分离模式的挑战：当模型本身就能理解 Agent 工作流时，外部的 Harness 层可以显著简化，仅仅负责资源调度和安全隔离，而非模型能力补全。这与 [Agent Harness 层级设计](../ch05/039-agent-harness.html) 中「智能体应具备自主工具选择能力」的理念一致。

### MoE 架构的推理成本经济学

MiniMax M2.5 采用 MoE 架构，总计 230B 参数但每次推理仅激活约 10B 参数。从推理成本角度看，MoE 的路由机制是最关键的工程决策——它决定了模型的"有效计算量"。经典密集模型（Dense Model）的推理成本与总参数成正比，而 MoE 模型的推理成本与活跃参数成正比。M2.5 的 230B/10B 比例意味着其推理成本约为同等能力密集模型的 1/23，但受益于专家模块的专业化分工，知识容量并未等比缩小。

这一设计体现了当前大模型部署的核心矛盾：模型能力需要大容量（更多参数），但生产部署需要低成本（更少计算）。MoE 通过"能力容量×计算稀疏性"的乘积优化来逼近 Pareto 最优前沿。

### Bedrock 的双端点设计：开发者体验的工程取舍

Amazon Bedrock 为 MiniMax 模型提供了两个推理端点：`bedrock-mantle`（Chat Completions API，兼容 OpenAI SDK）和 `bedrock-runtime`（Converse + InvokeModel API，原生 AWS SDK）。双端点设计的工程哲学在于：`bedrock-mantle` 降低了迁移成本——已有 OpenAI SDK 的团队只需修改 base URL 和 model ID 即可切换；`bedrock-runtime` 则保留了 AWS 的高级功能，如 Guardrails、Agents、Flows 和模型评估。

这种设计模式在云服务中越来越多见：通过提供"兼容触点"降低用户迁移门槛，同时保留"原生接口"释放平台差异化能力。对于大多数工作负载，官方推荐使用`bedrock-mantle`端点。

### 伸缩与稳速：on-demand 推理的实践模式

AWS 针对 MiniMax 模型的 on-demand 推理提供了详细的伸缩实践指南。关键模式包括：指数退避与抖动处理 503 瞬时错误、15 分钟阶梯式冷启动、Priority/Standard/Flex 三层服务分级。其中「15 分钟稳态保持」是最容易被忽视但最重要的实践——每次负载增加后需要保持 15 分钟让系统完成容量调度，否则每次阶梯上升都相当于一次全新的负载测试。

从工程实践角度看，这套指南实际上构成了一个通用的 LLM API 生产部署规范。核心洞见是：「模型吞吐不是可以线性扩展的资源——它是一个有状态、需热身的容量管道」。任何大规模 LLM 部署都应设计阶梯式流量引入策略，而非突发式流量灌入。

### 隐式 Prompt 缓存的架构影响

MiniMax 模型在 Bedrock 上支持隐式 prompt 缓存（Implicit Prompt Caching）。当连续请求共享公共提示前缀时，系统自动复用缓存的内部状态，无需代码改动和缓存标记。这对 Agent 工作负载尤其重要：多轮对话、RAG 工作流和长上下文分析中系统提示和工具定义往往是固定的。架构建议是将静态内容（系统提示、工具定义、参考文档）放在 prompt 开头，动态内容（用户消息）放在末尾。

## 实践启示

1. **Agent-native 训练是未来方向**：M2.5 的 RL-on-scaffolds 训练范式预示了模型能力发展的新方向——模型应原生理解 Agent 工作流而非事后补丁式地添加工具调用能力。选型时优先考虑原生支持 Agent 模式的模型。

2. **MoE 选型要关注活跃/总参数比**：在选择 MoE 模型时，不仅要看总参数，更要看活跃参数占总参数的比例以及路由机制的质量。M2.5 的 230B/10B（4.3% 活跃率）是高效 MoE 的参考基准。

3. **API 兼容性是生态粘性的关键**：Bedrock 的双端点设计证明，兼容主流 SDK（如 OpenAI SDK）是降低用户迁移成本的最有效方式。部署平台应优先实现对已存在的生态接口的兼容。

4. **阶梯式流量增长而非突发式**：LLM 生产部署中，15 分钟稳态保持是成本最低的伸缩策略。建立自动化的阶梯式流量拉升流程比处理 503 错误后再扩容更可靠。

5. **Prompt 结构影响推理性能**：隐式缓存机制使 prompt 结构设计成为一种性能优化手段——将静态内容前置、动态内容后置，在不改代码的前提下获得延迟收益。

## 相关实体

- [LingBot-VA 具身原生模型](https://github.com/QianJinGuo/wiki/blob/main/entities/全球首个具身原生世界动作模型来了.md)
- [MCP 协议设计](../ch07/016-anthropic-mcp.html)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [MoE 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/moe-mixture-of-experts-2025.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/run-minimax-models-on-amazon-bedrock.md)

---

