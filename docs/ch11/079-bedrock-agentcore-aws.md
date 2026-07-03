# 基于Bedrock Agentcore 实现智能成本分析与告警系统 | 亚马逊AWS官方博客

## Ch11.079 基于Bedrock Agentcore 实现智能成本分析与告警系统 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 10.4KB | `entities/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore.md`

## 概述
基于Bedrock Agentcore 实现智能成本分析与告警系统 by awschina on 04 3月 2026 in Artificial Intelligence Permalink Share 摘要：在云原生时代，企业数字化转型的步伐不断加快，云基础设施已成为业务发展的核心支撑。云成本的有效监控与管理，已不再是可选项，而是企业数字化战略成功的关键要素。本文设计并实现了一套智能云成本监控与告警系统，使用者通过自然语言与智能体交互，获取与云成本相关的分析建议和优化方案，同时实现异常告警。 目录 01 1、引言 02 2、方案概述 03 3、核心功能实现 04 4、附录 05 5、结语 1、引言 在云原生时代，企业数字化转型的步伐不断加快，云基础设施已成为业务发展的核心支撑。然而，伴随着云服务使用规模的快速增长，云成本管理正成为企业面临的重大挑战。云成本的有效监控与管理，已不再是可选

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server

## 深度分析
### 架构创新：单Agent双模式设计
本文提出的智能成本监控与告警系统采用了**单Agent双模式**架构，这一设计选择具有重要的工程意义。传统方案通常需要多个Agent分别处理交互式咨询和自动化监控，这带来了Agent间协调的复杂性和延迟问题。本文通过让同一个Agent同时承担两种职责，简化了系统架构，同时利用Bedrock AgentCore Runtime的托管能力实现了定时触发和实时响应两种运行模式。
在**交互式咨询模式**下，Agent作为成本专家顾问，通过自然语言理解用户的查询意图，智能选择合适的分析工具，将复杂的成本数据转化为易懂的业务洞察。在**自动化监控模式**下，同一个Agent通过EventBridge定时触发，主动执行成本异常检测，发现问题时自动通过SNS发送结构化告警。这种设计实现了"一个Agent，多种职责"的高效模式。

### 技术栈选型分析
**Strands Agents**作为智能体框架的选择体现了几个关键考量：首先，Strands强调由LLM原生地进行规划、工具调用和自我反思，而非像LangGraph那样需要开发者手动定义复杂状态机。这种"少代码、高智能"的特性降低了开发门槛，同时保持了生产级的能力。
**Bedrock AgentCore Runtime**作为托管运行时的选择则解决了从原型到生产的关键挑战：

- **无服务器托管**：无需管理底层服务器、负载均衡或扩展策略
- **框架与模型无关**：支持多种开源框架和各种主流模型
- **长时运行支持**：单次执行时长最高可达8小时，适应复杂分析任务
- **会话级隔离**：利用microVM技术为每个用户会话提供完全隔离的计算环境

### 核心Tools设计
系统定义了六个核心Tools，覆盖了成本分析的主要场景： ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
1. **成本异常检测**（使用AWS Cost Anomaly Detection API）：基于机器学习算法识别异常成本模式，计算总影响金额并提供根因分析 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
2. **多账户成本聚合**：为Payer账户设计的跨账户成本管理，支持 Organizations API集成、权限处理、数据聚合与排序 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
3. **预算监控**（get_all_budgets）：获取所有AWS预算的状态和利用率，控制预算超支风险 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
4. **成本预测**（get_cost_forecast）：基于历史数据预测未来成本趋势 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
5. **服务成本分析**（get_service_costs）：按AWS服务维度分析成本分布 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
6. **账户成本比较**（compare_account_costs）：比较不同账户间的成本差异 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]
这些Tools的共同特点是将AWS原生API能力进行业务封装，提供结构化的输出，便于Agent理解和处理。

### 定时监控与告警机制
定时监控系统使用EventBridge触发Lambda，Lambda再调用AgentCore Runtime执行成本检查。关键设计包括：

- 查询输入固定为"检查过去7天的成本异常，如果发现异常请详细说明"
- 基于关键词匹配和上下文分析的异常检测逻辑
- 检测到异常时通过SNS发送告警通知
这种事件驱动的架构实现了无人值守的自动化成本监控。 ^[https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/]

## 实践启示
### 架构设计层面
**优先考虑单Agent多模式而非多Agent协作**：当系统需要同时处理交互式请求和自动化任务时，单Agent双模式设计可以显著降低系统复杂度。Bedrock AgentCore Runtime提供了足够的灵活性来支持这种设计模式。
**充分利用托管服务减少运维负担**：选择Bedrock AgentCore Runtime的无服务器托管模式，可以让团队专注于业务逻辑而非基础设施管理，同时获得自动扩展和按实际处理时间付费的成本优势。

### 开发实践层面
**Tools设计应注重输出结构化**：本文的Tools实现都返回结构化的文本报告，便于Agent解析和处理。在设计Tools时，应考虑Agent的消费场景，预处理原始API数据而非让Agent处理混乱的响应。
**System Prompt的精细设计至关重要**：本文的System Prompt详细定义了Agent的身份、可用工具、行为准则和最佳实践建议，包括何时调用外部工具、如何提供洞察、以及主动识别成本优化机会的策略。
**异常检测需要结合规则和ML**：系统使用Cost Anomaly Detection的ML能力识别异常模式，同时结合关键词匹配进行告警触发判断。这种混合方法可以减少误报。

### 运维实践层面
**多账户场景需要统一视图**：对于使用AWS Organizations的企业，Payer账户的统一视图能力是实现全局成本管理的关键。本系统的多账户成本聚合工具提供了账户级别的成本排名和趋势分析。
**定时监控应设置合理的告警阈值**：系统通过"过去7天"的查询周期设计，平衡了检测及时性和准确性。实际部署时需要根据业务特点调整时间窗口和告警阈值。
**CI/CD集成可进一步提升效率**：代码仓库提供了完整的部署脚本(deploy.py)，支持镜像打包和Agent推送，便于纳入现有的DevOps流程。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore.md)

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/intelligent-cost-analysis-and-alerting-system-powered-by-bedrock-agentcore/)

## 相关实体
- [Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客](ch03/045-agent.md)
- [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析 | 亚马逊AWS官方博客](ch03/045-agent.md)
- [CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](ch03/045-agent.md)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](ch04/150-ai.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

- [AgentCore质量优化飞轮：推荐-验证-部署闭环](ch11/118-aws-bedrock-agentcore-quality-optimization-flywheel.md)

---

