# OpenAI GPT-5.6 Sol/Terra/Luna on Amazon Bedrock 部署指南

## Ch11.065 OpenAI GPT-5.6 Sol/Terra/Luna on Amazon Bedrock 部署指南

> 📊 Level ⭐⭐ | 11.8KB | `entities/get-started-with-openai-gpt-56-sol-terra-and-luna-on-amazon-bedrock.md`

# OpenAI GPT-5.6 Sol/Terra/Luna on Amazon Bedrock 部署指南

> **vxc score**: 72 | AWS 官方 GPT-5.6 部署指南，涵盖 Sol/Terra/Luna 三款模型的选型、推理配置、Prompt Caching、Codex 集成、配额管理

## 摘要

本文是 AWS 官方博客，于 2026 年 7 月发布，详细介绍 OpenAI GPT-5.6 家族（Sol/Terra/Luna）在 Amazon Bedrock 上的部署与使用指南。GPT-5.6 系列模型通过 Bedrock 的 `bedrock-mantle` 端点统一接入，支持文本和图像输入、文本输出、272K token 上下文窗口，以及从 `none` 到 `max` 六个等级的推理努力度调节。博客覆盖模型选型建议、Responses API 调用方法、Prompt Caching 降低成本的策略（显式和隐式两种模式）、Codex 编码 Agent 的集成方式，以及配额管理与扩缩容规划。所有推理运行在用户的 AWS 账户内，受 IAM 策略和 VPC 控制，并记录到 CloudTrail。

## 核心要点

- **模型定位差异**：Sol 是旗舰推理模型（适合自主编码 Agent、安全研究和深度多步推理），Terra 是通用生产负载（平衡推理、性能和成本），Luna 是高吞吐低延迟优化（适合分类、摘要和路由）。
- **统一接入端点**：通过 bedrock-mantle 端点（`https://bedrock-mantle.{region}.api.aws`）统一访问，使用 OpenAI Responses API（`/openai/v1/responses` 路径），兼容 OpenAI Python/TypeScript SDK。
- **认证方式**：支持自动刷新的短期密钥（BedrockOpenAI client + token provider）和环境变量（`AWS_BEARER_TOKEN_BEDROCK`，最长 12 小时有效期）。
- **Prompt Caching 降本**：支持显式缓存（cache breakpoint 精准控制）和隐式缓存（自动缓存，零代码变更）。缓存读取享 90% 折扣，写入按 1.25 倍计费。缓存有效期至少 30 分钟，最多 4 个 breakpoint 每请求。
- **Codex 集成**：支持通过 Codex CLI、IDE 插件和 ChatGPT 桌面应用连接到 Bedrock，在 `~/.codex/config.toml` 设置模型和 provider 即可。
- **安全与合规**：每个模型调用运行在用户 IAM 策略和 VPC 内，记录到 CloudTrail。Region 内推理满足数据驻留要求。分类器标记的流量保留最多 30 天用于滥用检测。
- **配额管理**：每个模型/Region 有输入和输出 token 每分钟配额（无请求数配额）。缓存读取不计入输入配额。超限返回 429，建议指数退避重试。

## 深度分析

### 三模型分层策略：从"一个模型干所有事"到"按需选择"

GPT-5.6 家族的 Sol/Terra/Luna 分层是 OpenAI 对生产工作负载多样化的直接回应。其核心洞察是：不同任务的推理需求在**智能水平**和**延迟敏感度**两个维度上存在巨大差异，用一个模型覆盖所有场景既是过度设计也是成本浪费。

**Sol** 定位为"能力上限不设限"——它配备最高级别的推理努力度（`max`），适合自主编码、科学研究、深度推理等需要最高智能的任务。但这也意味着它是最慢、最贵的选项。关键洞察：Sol 的价值在于它为 Codex 这样的 Agent 系统提供了"遇到困难问题时的升级通道"，而不是作为默认推理后端。

**Terra** 是"日常主力"——在推理能力上比 Sol 弱但延迟更低、成本更可控。它支持 `high` 乃至 `xhigh` 的推理努力度，覆盖大多数生产场景。Terra 实际上是大多数生产系统应该默认选择的模型，只有在 Sol 才能解决的"硬问题"上才应切换。

**Luna** 是"规模性能"——针对高吞吐、低延迟做了极致优化。Luna 的价值不在于单次推理的质量，而在于在相同成本下可以处理 5-10 倍的请求量。对于分类、摘要、路由这类不需要深度推理的场景，Luna 是经济最优解。

这种三层结构的核心设计原则是：**API 接口完全一致**（Responses API + 相同参数结构），切换模型只需改 model ID，不需要改代码。这使得团队可以在开发阶段使用 Sol 进行调试，然后在生产环境中降级到 Terra 或 Luna，或者在单一请求中根据任务复杂度动态切换。

### Prompt Caching 的工程经济学

Prompt Caching 是 GPT-5.6 在 Bedrock 上最有实用价值的功能之一。其核心机制并不复杂——缓存重复的 prompt 前缀，但在工程经济学层面有深远影响：

**Agent 工作负载的结构性特征**：Agent 循环（尤其是 Codex 风格的编码 Agent）具有天然的 prompt 复用模式——系统指令、工具定义、上下文文件往往在多次调用中保持不变，只有最新的用户输入发生变化。这意味着 Agent 工作负载的缓存命中率天然就高，Prompt Caching 对 Agent 场景的降本效果远超对单次问答的降本。

**显式 vs 隐式缓存的战术选择**：显式缓存让开发者精确控制缓存边界——在系统指令后插入 `prompt_cache_breakpoint`，用户输入放在 breakpoint 之后。这种模式适合 Agent 循环，因为开发者确切知道哪些内容是复用的。隐式缓存则自动推断缓存边界——适合聊天和 RAG 场景，零代码变更即可受益。

**缓存的经济学计算**：缓存读取享受 90% 折扣，意味着如果缓存命中率能达到 50%，整体推理成本可降低约 45%。在 Agent 循环中，如果系统指令和工具定义占了 prompt 的 70-80%，缓存命中率可以超过 80%，成本可降低 70% 以上。但需要注意每次写入缓存有 1.25 倍的额外开销，所以短的 Agent 循环（仅 1-2 次调用）可能不适合显式缓存。

**Cache 计量的工程细节**：AWS 提供了 response 级别的缓存指标（`input_tokens_details.cached_tokens` 和 `cache_write_tokens`），但没有 CloudWatch 缓存专用指标。这意味着团队需要在应用层面向文档日志中聚合缓存命中率，才能优化缓存策略。

### Bedrock 战略层分析：AWS 的模型中间层策略

Amazon Bedrock 的 bedrock-mantle 端点是 AWS 在多模型时代战略布局的核心。它不仅仅是"模型托管服务"——它通过统一的 API 层将 AWS 定位为**模型中间层**，让 AWS 在模型供应商和最终用户之间建立不可绕过的纽带。

关键战略优势包括：

1. **数据主权锁定**：所有推理在用户的 AWS 账户内运行，数据不共享给模型提供商（除非用户 opt-in）。这使 AWS 成为企业对数据主权有严格要求时的唯一合规选择。

2. **承诺消费绑定**：Bedrock 推理费用计入 AWS 承诺消费（commit spend），这对已有 AWS 大额合同的企业客户是巨大的迁移阻力。

3. **与云基础设施的集成**：IAM、VPC、CloudTrail、CloudWatch——所有这些 AWS 的原生能力直接扩展到模型推理层面，而模型提供商本身无法提供这种深度的基础设施集成。

4. **多模型切换零成本**：GPT-5.6 的模型切换（Sol/Terra/Luna 之间）通过同一个端点实现，未来切换到 Claude 或其他模型也只需改 model ID。这降低了企业对单一模型供应商的依赖风险。

对于企业客户，Bedrock + GPT-5.6 的组合策略建议是：利用 Luna 处理大规模低复杂度任务，Terra 处理日常生产负载，Sol 作为编码 Agent 的"升级通道"，通过统一的 bedrock-mantle 端点进行管理。同时利用 Prompt Caching 降低 Agent 工作负载的推理成本，并通过 CloudTrail 和 IAM 保持对模型使用的全面可见性和控制力。

## 实践启示

1. **按任务复杂度动态选择模型**：不要将单一模型用于所有任务。建立推理需求分类体系——简单任务（分类、摘要）→ Luna，中等任务（常规编码、对话）→ Terra，复杂任务（深度调试、安全分析）→ Sol。在 API 层面上，因为三模型接口完全一致，切换成本几乎为零。

2. **Agent 工作负载必须启用 Prompt Caching**：如果你的 Agent 循环中系统指令和工具定义不变，应使用显式缓存 + `prompt_cache_key`。实测应至少准备 1024 token 的缓存前缀，否则缓存不会生效。建议在 Agent 启动时记录第一请求的 `cache_write_tokens` 和后续请求的 `cached_tokens` 来验证缓存命中。

3. **利用推理努力度调节延迟**：在开发阶段使用 `max` reasoning 保证质量；在生产环境中降级到 `high` 或 `medium`。对于交互式用户体验敏感的场景，Luna + `low` reasoning 可以显著降低响应延迟。

4. **Codex + Bedrock 的企业级配置**：配置 `~/.codex/config.toml` 连接 Bedrock，使用 auto-refreshing token provider（不推荐环境变量模式，因为 token 12 小时过期需要手动刷新）。将敏感变量放在 `~/.codex/.env` 中而不是 shell 环境中，确保 IDE 插件和桌面应用能正确读取。

5. **建立缓存命中率监控**：由于 Bedrock 不提供 CloudWatch 缓存指标，应在应用层记录每次响应的 `cached_tokens / input_tokens` 比率，聚合到日志系统中。低于 30% 的命中率说明 prompt 结构需要优化——尝试将更多静态内容（工具定义、参考文档）移到 prompt 前缀。

6. **应对 429 限流的架构设计**：即使是企业级账号也会在突发请求时遇到 429。配置 OpenAI SDK 的 `max_retries`（建议 6 次），同时在应用层实现指数退避。对于持续高流量的场景，将工作负载分散到多个时间窗口，避免在相同分钟级窗口内爆发式请求。

## 相关实体

- [GPT-5.6 定价层次与 Codex 合并](../ch01/737-codex.html)
- [OpenAI Models + Codex on Bedrock GA](ch11/310-amazon-bedrock.html)
- **Amazon Bedrock Guardrails**
- **Codex CLI 编码 Agent**
- **AI 模型成本优化策略**
- **企业级 LLM 评估方法**

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/get-started-with-openai-gpt-56-sol-terra-and-luna-on-amazon-bedrock.md)

---

