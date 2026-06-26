# 基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客

## Ch11.158 基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 7.1KB | `entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md`

## 概述
基于Strands SDK 构建的企业智能问数解决方案实践 by awschina on 21 11月 2025 in Artificial Intelligence Permalink Share 引言 作为长期深耕数据智能的 AWS Partner，聚云立方在与众多客户共创数据问答场景时发现：传统 BI 的模板化与线性分析流程已难以支撑业务节奏。DecisionAI 基于最新的 Strands Agent 框架和 Amazon Bedrock 生态，面向 AWS 企业客户推出全新的问数 2.0 方案，希望把“问、思、判、行”全链路沉淀为可复制、可运营的智能资产。 企业问数痛点 配置穷尽困境 ：传统平台需要预设大量指标与看板，但对于“连续 3个月复购用户占比”“跨站点退货率”一类动态问题仍无法覆盖，陷入永远扩表的工程泥沼。 复杂查询失控 ：面对“旺季空调退货率为何上涨”这样的多维问题，人

## 核心技术
Strands Agent SDK、Amazon Bedrock、AgentCore

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk/)

## 相关实体
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch11-056-ci-amp-t基于-amazon-bedrock-agentcore-与-openclaw-的企业级智能运维最佳实践)
- [用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客](../ch11-188-用-strands-agents-sdk-构建确定性数据分析-语义层-vqr-在-amazon-bedrock-上的)
- [从0到1:联想基于Strands Agent SDK的资源智能巡检Agent创新 | 亚马逊AWS官方博客](../ch11-126-从0到1-联想基于strands-agent-sdk的资源智能巡检agent创新-亚马逊aws官方博客)
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](../ch09-069-claude-code-接入自建开源模型-企业私有化与降本实践-亚马逊aws官方博客)
- [Amazon Quick: Accelerating the path from enterprise data to AI-powered decisions](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-quick-accelerating-the-path-from-enterprise-data-to-ai-powered-decisions.md)
- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](../ch11-139-基于bedrock-agentcore-strands构建企业级智能搜索平台实践-亚马逊aws官方博客)

## 深度分析
1. **传统 BI 的"模板化陷阱"被 Agentic 问数范式绕过**：文章揭示传统 BI 陷入"配置穷尽困境"——永远无法穷举业务动态问题，导致工程团队疲于扩表。DecisionAI 通过 LLM 理解自然语言意图 + REACT 策略动态生成 SQL，从"预设指标"转向"即时生成"，是对 BI 范式的根本性颠覆。
2. **多 Agent 协作采用 Agent-as-Tool 而非直接对话模式**：DecisionAI 的 Master/Planner/Tool/Verifier/Narrator 五 Agent 体系中，子 Agent 被包装为工具注册给主 Agent，而非 Agent 间直接通信。这种模式简化了上下文复杂度，利用 Strands SDK 的工具注册与发现机制，实现零改造接入新工具。
3. **MCP Server 协议成为 Agent 工具输出的标准接口**：Tool Agent 通过 MCP 调用指标库、SQL 生成器、模型推理等工具，使 DecisionAI 可作为智能问数组件融入客户现有生成式 AI 应用，实现架构标准化和接入周期缩短。
4. **"问、思、判、行"全链路构成 Agentic 闭环**：从问题理解（Master Agent）到规划（Planner Agent with REACT + Tree/Graph of Thoughts）到执行（Tool Agent）到验证（Verifier Agent 自检反思）到输出（Narrator Agent 写入知识库），每步都有明确的 Agent 职责和反馈回路。
5. **Verifier Agent 实现自我纠错的反思闭环**：Verifier Agent 对执行结果进行自检，发现异常时反馈给 Planner Agent 重新规划，而非直接输出不可信结果。这是将 AI 输出可信度从"尽力而为"提升到"可验证可靠"的关键机制。

## 实践启示
1. **以 MCP Server 协议封装数据平台工具能力**：将 SQL 生成、指标计算、异常检测等能力以 MCP Server 形式输出，供 Agent 安全调用企业数据源，同时保持架构标准化，显著缩短接入周期。参考 DecisionAI 工具执行层设计，数据团队可快速构建可运营的 MCP 工具生态。
2. **构建"问数脚本"资产库实现知识沉淀**：将高频业务问题（如"跨站点退货率分析"）封装为可复用脚本，配合自动 SQL 生成与验证逻辑，使数据分析师从重复劳动中解放，专注于策略验证与实验设计。这是将个人经验转化为组织资产的直接路径。
3. **引入 Verifier Agent 建立结果自检机制**：在多 Agent 流水线中加入验证 Agent，对 SQL 正确性、指标合理性、异常检测结论进行自检，发现异常自动回退重新规划。在人工作业 SQL 错误率高达 40% 的场景下，机器验证是降低业务决策风险的有效手段。
4. **采用四层架构隔离关注点，降低系统耦合**：接入与会话层（多入口统一）、智能编排层（Agent 协作）、工具执行层（MCP 工具）、结果交付层（结构化输出）的分层设计，使技术选型变化时系统仍保持弹性。业务变化只需改对应层级，无需重构全链路。
5. **模型层保持可插拔架构以适配多样化部署需求**：通过 Amazon Bedrock（公有云）、硅基流动（本地化）、Amazon SageMaker AI（私有化）三种部署模式的灵活切换，满足企业公有云合规、私有化性能、本地化监管等差异化需求，避免模型锁定。

## 关联阅读

---

