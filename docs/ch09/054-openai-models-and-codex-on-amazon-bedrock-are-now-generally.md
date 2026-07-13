# OpenAI models and Codex on Amazon Bedrock are now generally available

## Ch09.054 OpenAI models and Codex on Amazon Bedrock are now generally available

> 📊 Level ⭐⭐ | 11.6KB | `entities/openai-models-codex-amazon-bedrock-ga.md`

# OpenAI models and Codex on Amazon Bedrock are now generally available

## Key takeaways

  * GPT-5.5, the most advanced frontier model from OpenAI, is generally available on Amazon Bedrock. Pricing matches OpenAI first-party rates.

  * Codex on Amazon Bedrock is generally available with pay-per-token pricing. Inference runs through Bedrock, and usage counts toward your existing AWS commitments.

One month after our [expanded partnership announcement](https://www.aboutamazon.com/news/aws/bedrock-openai-models), GPT-5.5, GPT-5.4, and Codex are now generally available on [Amazon Bedrock](https://aws.amazon.com/bedrock/), giving you access to frontier models and the OpenAI coding agent for software development.

Amazon Bedrock is the platform for building and running AI applications and agents at production scale. [OpenAI models on Bedrock](https://aws.amazon.com/bedrock/openai/) run on Amazon Bedrock's next-generation inference engine, built for high performance, reliability, and security.

**The most capable  OpenAI model on Amazon Bedrock**

GPT-5.5 grasps your intent faster and handles multi-step tasks autonomously, excelling at writing and debugging code across large code bases, analyzing data, generating documents and spreadsheets, and operating software across multiple tools until a task is complete. The improvements are most significant in agentic coding and knowledge work, where real progress depends on sustaining context and taking action over time.

Both GPT-5.5 and GPT-5.4 are built for complex, multi-step tasks and are available in the Amazon Bedrock model catalog today. You can call them through the Responses API on Amazon Bedrock and pay the same per-token rate as direct from OpenAI with no additional fees.

[Bedrock's inference engine](https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/) gives you your own isolated queue with automated capacity management, so your performance stays predictable, even under heavy load. As each request runs, its full state is captured durably and continuously, so if hardware fails or a node restarts mid-call, your request picks back up where it left off instead of starting over. Every call inherits the governance controls you already use across AWS: IAM permissions, VPC and PrivateLink isolation, KMS encryption, and AWS CloudTrail audit logging. Your prompts and responses are not used to train models and are not shared with model providers. These protections extend to GPT-5.5 and GPT-5.4 on Amazon Bedrock.

> _"At Amgen,  we're focused on applying advanced AI in ways that may help accelerate the delivery of potential new therapies while equipping our teams with advanced tools. OpenAI's GPT-5.5 and frontier models offer compelling advances in capability, quality, and consistency that matter in a field where the questions are complex and the standards for scientific accuracy and decision quality are exceptionally high. Making these models available on AWS gives us an important new path to explore and scale those capabilities within the responsible AI framework, including, security, governance, and operational frameworks across the enterprise."_
> 
> _–  Sean Bruich, Senior Vice President, Chief Technology Officer at Amgen_

**Accelerate software development with Codex on Amazon Bedrock**

Codex is the OpenAI coding agent for AI-powered software development. More than 5 million people use Codex every week to write, refactor, debug, test, and validate code across large codebases. Codex holds context across entire repositories, reasons through ambiguous failures, checks assumptions using tools, and carries changes through surrounding code with awareness of how systems connect. With GPT-5.5 powering inference, Codex completes the same work more efficiently and with higher quality compared to prior model versions.

[Codex on Amazon Bedrock](https://developers.openai.com/api/docs/guides/amazon-bedrock) is available through the Codex App, the Codex CLI, and IDE integrations with Visual Studio Code, JetBrains, and Xcode, with all model inference routed through Amazon Bedrock. Inference stays within your selected Region to meet data residency requirements. You pay per token with no seat licenses and no per-developer commitments, so you can get started fast and scale access as you go.

> _"Autodesk is  the technology platform for the people who design and make the world around us. Workflows like building design are highly iterative, requiring precision, coordination, and continuous refinement across teams. With OpenAI models and Codex now generally available on Amazon Bedrock, our teams are evaluating how frontier AI capabilities and AI-powered development tools on scalable, secure AWS infrastructure can help accelerate development workflows and support more informed decision-making for our customers."_
> 
> _– Ritesh Bansal, VP of Analytics Data, Agentic  AI and AI/ML Platform at Autodesk._

## **What's  next**

During our expanded partnership announcement, we introduced Amazon Bedrock Managed Agents, powered by OpenAI. Coming soon, it will let you deploy production-ready agents built on the OpenAI agent harness, delivering faster execution, sharper reasoning, and reliable steering of long-running tasks. Every agent will operate with its own identity, log every action for auditability, and run with all model inference on Amazon Bedrock. To stay up to date, sign up through the [interest form](https://pages.awscloud.com/GLOBAL-ln-GC-openai-bedrock-interest.html).

We will continue expanding the OpenAI capabilities available on Amazon Bedrock as new advances arrive. That includes Daybreak, the OpenAI vision for changing how software is built and defended. Daybreak, which includes cyber models and Codex Security, is designed to help cyber defenders identify vulnerabilities, review code for risk, and guide remediation across the development lifecycle. When Daybreak becomes available on Bedrock, security teams will be able to adopt it through the governance and operational frameworks they already use on AWS.

## **Get started**

GPT-5.5 and GPT-5.4 are available today in the Amazon Bedrock model catalog. Check the [AWS Regions page](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html) for availability. For documentation and a step-by-step walkthrough, see the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html) and the [getting started blog](https://aws.amazon.com/blogs/aws/get-started-with-openai-gpt-5-5-gpt-5-4-models-and-codex-on-amazon-bedrock).

* * *

## About the author

### Bharat Sandhu

Bharat Sandhu leads AI/ML marketing for Amazon Web Services, covering silicon, models, training, inference, and agents. His team's mission is to help customers build, deploy, and scale AI applications and agents faster, more securely, and at lower cost.

---

## 深度分析

### 1. 多云 AI 战略格局的重塑

OpenAI 模型在 Amazon Bedrock 上 GA，标志着主流 IaaS 厂商与顶级模型供应商的深度整合进入新阶段 ^。此前企业若想在 AWS 上调用 GPT-5.5，必须通过 OpenAI 官方 API 或 Azure OpenAI Service（微软中间层）。此次 GA 意味着 OpenAI 绕过微软直接在 AWS Bedrock 提供推理服务，AWS-OpenAI 关系从"渠道分销"升级为"原生集成"。这使得"多云多模型"路径更简单——企业可在 Bedrock 上同时调用 Claude、Llama 和 GPT-5.5，通过统一的 AgentCore 框架编排，无需维护多供应商 API 集成，且数据不出 AWS 区域即可完成端到端推理 ^。

### 2. Durable State：生产级推理的核心保障

Bedrock 推理引擎为 OpenAI 模型提供了与原生 API 不同的基础设施保证 ^。关键创新是"durable state capture"——每个请求运行时持续捕获完整状态，硬件故障或节点重启时请求从中断处恢复而非从头开始。这解决了长时运行 agentic 任务的核心痛点：中途重启导致上下文丢失、重复 token 消耗和不可预测的用户体验 ^。结合 isolated queue，企业获得可预测的性能基准，不再受邻居噪音干扰。这对生产级 AI 应用至关重要，也是 Amgen 等生命科学企业选择此路径的关键原因。

### 3. 定价策略与 Daybreak 安全蓝图

GPT-5.5/5.4 在 Bedrock 上与 OpenAI 直连价格一致、不收额外费用 ^，消除了企业选择 Bedrock 的价格摩擦。Codex 的"无座机、无按开发者收费"模式 ^ 直接挑战传统软件授权，AWS 承诺用量可覆盖 OpenAI 模型费用 ^。文章预告的 Daybreak（含 Codex Security）代表 AI 安全工具从"扫描发现"向"实时防御"的范式转变 ^，通过 Bedrock 交付时可直接复用企业已有 AWS 治理框架，无需额外安全基础设施投入。

---

## 实践启示

### 1. 生产级 Agentic 任务优先选 Bedrock 而非直连 OpenAI API

对于需要多步骤推理和跨工具调用的复杂任务（代码生成流水线、自动化数据分析），Bedrock 的 Durable state capture 保证硬件故障不导致请求中断 ^。结合 Isolated Queue 可向业务方提供可量化的性能 SLA。建议将 [Agentcore Harness](../ch04/637-agentcore-harness.html) 和 [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) 纳入应用层架构设计参考。

### 2. 利用现有 AWS 合约覆盖 OpenAI 模型费用

Codex on Bedrock 推理费用可计入企业现有 AWS 承诺用量 ^。建议财务和采购团队梳理现有 AWS Spend Contract，将 OpenAI 模型推理纳入已有承诺范围，利用 Bedrock 统一账单简化多供应商管理。具体可参考 [Aws Budget Bedrock Cost Governance](../ch11/273-bedrock.html) 的 FinOps 流程扩展方案。

### 3. 平行评估 Codex 与 Claude Code 在 Bedrock 上的企业适用性

Codex 无座机、无按开发者收费的模式打破了 AI 编程工具的企业采购门槛 ^。建议在 [Claude Code Aws Bedrock Guide](ch09/083-claude-code-aws.html) 之外并行评估 Codex on Bedrock——在企业已有 AWS 治理框架（IAM 权限、VPC 隔离、CloudTrail 审计）内即可启用。Codex 的跨仓库上下文能力特别适合大型 monorepo 开发团队。选型框架参见 [Ai Coding Agent From Helloworld To Production](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-coding-agent-from-helloworld-to-production.md)。

### 4. 关注 Bedrock Managed Agents (Powered by OpenAI) 发布节奏

即将推出的 Bedrock Managed Agents 基于 OpenAI agent harness 构建，提供更快执行和长任务可靠引导 ^。建议通过 [interest form](https://pages.awscloud.com/GLOBAL-ln-GC-openai-bedrock-interest.html) 提前登记，结合 [Agentcore Managed Harness](../ch04/222-agentcore-managed-harness.html) 和 [Agentic Workflow Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-workflow-patterns.md) 评估与现有 AgentCore 工作流的集成方案。

### 5. 追踪 Daybreak GA 并评估安全工程扩展路径

Daybreak 和 Codex Security 在 Bedrock GA 后，企业安全团队可通过已有 AWS 治理框架（IAM 角色边界、VPC PrivateLink、KMS 加密、CloudTrail 审计链）满足合规要求，无需额外基础设施投入 ^。建议提前梳理 agent security system 和 [Agent Security Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md) 框架，建立内部预警机制，在 Daybreak GA 后快速完成 POC。

---

## 相关实体

- [试用 amazon bedrock 中的新控制台体验：该体验针对兼容 anthropic 和 openai 的 api](../ch11/157-amazon-bedrock.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openai-models-and-codex-on-amazon-bedrock-are-now-generally-.md)

---

