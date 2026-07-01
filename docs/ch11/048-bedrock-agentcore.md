# Bedrock AgentCore 自定义代码评估器

## Ch11.048 Bedrock AgentCore 自定义代码评估器

> 📊 Level ⭐⭐ | 12.9KB | `entities/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md`

## 摘要
Amazon Bedrock AgentCore 支持自定义代码评估器（Custom Code-Based Evaluators），通过将 AWS Lambda 函数作为评估引擎，对 Agent 应用进行确定性质量检查。适用于金融、医疗等强合规领域，弥补 LLM-as-a-Judge 在结构化约束（JSON Schema、数值精度、工作流顺序、PII 合规）上的不足。评估可在 On-Demand（开发迭代、CI/CD 回归测试）和 Online（生产流量持续监控）两种模式下运行。

## 核心概念
- **代码评估器**：以 AWS Lambda 函数为评估逻辑载体，接收 Agent 的 OpenTelemetry (OTel) spans 数据，返回 PASS/FAIL 标签、可选分数（0.0–1.0）和解释字符串。
- **评估级别**：TRACE（单次用户交互）、TOOL_CALL（单个工具调用）、SESSION（整轮对话）——同一 Lambda 函数可按不同级别分别注册。
- **On-Demand 模式**：同步调用，返回即时结果，适用于开发迭代、回归测试和 CI/CD 部署门禁，单次调用最多混合 10 个评估器（代码型+内置型）。
- **Online 模式**：持续采样生产流量，按配置周期调度评估，结果写入 CloudWatch 日志并以 Embedded Metric Format 吐出 CloudWatch Metrics，支持仪表盘和告警。
- **OTel Spans**：Lambda 接收的输入为 Agent 运行时吐出的 OpenTelemetry spans，包含工具调用、响应内容等结构化追踪数据，是评估的数据基础。

## 关键质量维度与评估器实现
### 1. ToolResponseSchemaValidator（TRACE 级）
验证 Agent 工具响应的 JSON Schema 符合性。Lambda 过滤目标 trace span，提取工具调用 spans，按预期模式（ticker+price for 股票数据；length+formatting for 新闻摘要）校验响应结构。
> **设计要点**：结构性问题在工具边界处被捕获，LLM-as-a-Judge 补充评估有用性和清晰度——两者组合实现"结构正确 + 语义合理"。

### 2. StockPriceDriftChecker（TRACE 级）
校验 Agent 回答中的股票价格与外部权威来源的偏差是否在配置阈值（默认 2%）内。Lambda 从响应文本提取 ticker+price 对，调用市场数据端点获取参考价，计算每对的百分比偏差。
> **设计要点**：金融场景中 0.1% 的偏差即可改变交易决策——这类精确数值问题 LLM 容易产生算术错误，必须用确定性代码对照真实来源验证。

### 3. WorkflowContractGSR（SESSION 级）
强制执行三步工作流合同：①识别 broker → ②操作 broker profile → ③调用市场数据和新闻工具。Lambda 从会话 spans 重构有序工具调用列表，验证每一步是否按序发生。
> **设计要点**：合规场景下工具调用顺序是强制性约束，而非建议——代码级验证比 LLM 判断更可靠，且可检出顺序颠倒、步骤缺失等边界问题。

### 4. BrokerPIILeakChecker（SESSION 级）
扫描会话中所有 Agent 响应是否泄露 PII。使用 Amazon Comprehend DetectPiiEntities API，高风险实体（SSN、银行卡、政府ID、凭证）直接 FAIL，低风险实体（姓名、邮箱、电话、地址）按阈值返回部分分数。
> **备选方案**：对于无法依赖 Comprehend 的环境，提供了基于正则表达式的变体。

## 深度分析
### 代码评估器的本质定位
这篇文章揭示了 LLM-as-a-Judge 与代码评估器的根本分工：前者评估"听起来对不对"（helpfulness、correctness、tone），后者验证"是不是真的符合约束"（schema、数值精度、工作流顺序、PII 安全）。在金融、医疗、法律等强监管领域，"听起来对"是不够的——审计员和监管机构要求可证明的合规证据。代码评估器提供了这种确定性：同样的输入永远产生同样的结果，且结果可被完整重放和调试。

### OTel Spans 作为统一评估契约
文章一个关键但容易被忽视的设计是 OTel spans 作为 Lambda 的输入格式。AgentCore Runtime 通过 AgentCore Observability 将 OTel spans 同时写入 Runtime 日志组和共享的 `aws/spans` 日志组，Online 评估配置通过指定 CloudWatch 日志组和 OTel 服务名来定位并拉取 spans。这意味着：评估器与 Agent 运行时完全解耦——无论底层是 LangGraph、LlamaIndex 还是自研框架，只要 OTel instrumented，评估器就能工作。这一设计使得代码评估器具有框架无关性，是比直接内嵌评估逻辑更优雅的架构。

### Online 评估的采样经济性
文章指出了采样百分比的实践意义：高流量 Agent 通常设为 10–20%，低流量 Agent 可设为 100%。这背后是一个成本-覆盖率的权衡：Lambda 调用按执行时间计费，CloudWatch Logs 写入量随流量增长，Comprehend API 按处理文本量计费。代码评估器的成本结构是**固定成本**（Lambda 执行时长 + CloudWatch 日志量），而非 LLM-as-a-Judge 的**按 token 线性计费**，这在高频评估场景下有显著成本优势。

### CI/CD 集成：门禁而非建议
On-Demand 评估在 CI/CD 中的角色是**门禁（gate）而非建议**——失败直接阻断部署。这是将代码评估与 LLM 评估区分开的关键：LLM 评估结果通常是分数和解释，允许人类判断是否接受；而代码评估的 PASS/FAIL 是二元判定，适合自动化流程。这一设计体现了"确定性规则必须强制执行"的思想——合规边界不能让步于"总体看起来不错"。

### IAM 隔离的安全模型
评估 Lambda 使用独立的 IAM 角色（evaluation execution IAM role），而非复用 Agent Runtime 的角色。这一设计确保：即使评估器调用的外部服务（市场数据 API、Comprehend）被攻破，攻击者也无法利用 Agent Runtime 的权限。这一安全隔离原则在多租户或高风险环境中尤为重要。

### 局限性
1. **Lambda 冷启动延迟**：On-Demand 评估中 Lambda 冷启动会增加首次评估延迟，对延迟敏感的 CI/CD 场景需要注意。
2. **OTel instrumentation 必须开启**：AgentCore Evaluations 无法采样未开启 OTel 的 Agent，Transaction Search 是账户级别一次性配置，但容易被新用户忽略（文章在 prerequisites 中专门强调）。
3. **采样上限 10 个评估器**：单次评估调用最多混合 10 个评估器，复杂评估场景需要分批。
4. **Online 模式无原生告警阻断**：CloudWatch Alarms 需要手动配置，不会自动阻止问题 Agent 继续服务——告警只是通知机制。

## 实践启示
### 何时选代码评估器而非 LLM-as-a-Judge
当质量维度满足以下任一条件时应选择代码评估器：①有明确对错标准（数值必须在阈值内、格式必须符合 Schema）；②合规硬约束（工作流顺序、PII 不得出现）；③需要可重放、可调试的确定性结果；④高频评估场景（成本结构更优）。当质量维度是主观判断（回答是否有帮助、语气是否得体）时继续使用 LLM-as-a-Judge。

### 评估级别选择决策树
- **TRACE**：需要逐个响应验证时选（如每条消息的 Schema 检查、数值精度、PII 扫描）
- **TOOL_CALL**：需要针对特定工具调用验证参数或返回值新鲜度时选
- **SESSION**：需要跨越多个交互步骤验证整体顺序或累计效果时选（如工作流合规、会话级 PII 扫描）
同一业务规则可能需要在多个级别验证，例如 PII 检查在 TRACE 级验证单条响应 PII，在 SESSION 级验证整轮对话是否在最后统一输出时泄露。

### 生产落地推荐路径
1. **先用 On-Demand 验证**：在新评估器上线前，先用已知失败案例的测试集验证 Lambda 逻辑，确认能可靠检出问题且无误报
2. **CI/CD 门禁优先于 Online告警**：先把代码评估器接入 CI/CD，拦住有问题的部署；再配置 Online 评估监控生产 drift
3. **采样从高开始逐步降低**：新上线的 Agent 建议 100% 采样以建立质量基线，稳定后根据流量和成本降低到 10–20%
4. **结果进 CloudWatch Metrics 而非仅日志**：评估结果应同时写入 CloudWatch Metrics，才能对接仪表盘和告警，实现可观测性闭环

### 团队职责分离
代码评估器的 Lambda 逻辑应由**平台/基础设施团队**开发和维护，而提示词和 LLM-as-a-Judge 评估器由**AI/数据科学团队**负责。这一分离使得合规规则（代码评估器）的变更不需要重新调用 LLM，降低变更风险和成本。

### 清理顺序
删除资源时必须**先删评估器**（Lambda 函数、IAM roles、Online 评估配置），再删 Agent Runtime、Memory、ECR 等基础设施。否则 AgentCore 控制平面可能残留指向已删除 Lambda 的配置导致错误。

## 相关实体
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/250-amazon-nova.md)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch04/150-ai.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch03/044-agent.md)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/084-aws-bedrock-serverless-async-inference-sqs-lambda.md)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch01/380-claude.md)

- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](ch03/044-agent.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](ch01/572-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](ch03/044-agent.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch04/150-ai.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](ch01/571-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch04/150-ai.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)

---

