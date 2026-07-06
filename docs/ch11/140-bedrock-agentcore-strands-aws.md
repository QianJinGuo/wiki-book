# 基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客

## Ch11.140 基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 7.8KB | `entities/building-enterprise-level-with-bedrock-agentcore-and-strands.md`

## 概述
基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 by awschina on 20 11月 2025 in Application Integration Permalink Share 1. Agentic AI落地面临的问题 当前，生成式 AI 技术正以破壁之势迅猛发展，大模型的能力迭代更是日新月异。在此浪潮下，Agentic AI 的应用边界持续拓宽，已深度渗透至金融、医疗、制造、教育、娱乐等多个领域，以前所未有的速度重构商业竞争格局，颠覆各行业传统生产方式 —— 它不再是简单的技术工具，更成为驱动企业业务创新、提升核心效率的 “智能引擎”。正是看到这一机遇，越来越多的企业渴望搭乘 Agentic AI 的技术快车，加速推进行业智能体或通用智能体平台的落地。 作为 AWS 核心级合作伙伴，小宿科技始终聚焦企业 AI 转型需求，凭借安全可靠、高效敏捷的

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server、Strands Agent SDK、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/building-enterprise-level-with-bedrock-agentcore-and-strands/)

## 相关实体
- [CI&T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/ci-t-based-on-amazon-bedrock-agentcore-openclaw-enterprise-intelligent-operations-best-practices.md)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-agentcore-os-level-actions-browser.md)
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md)
- [基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/building-enterprise-agentic-ai-with-kiro-on-aws.md)
- [基于Strands Agents SDK和Amazon Bedrock AgentCore构建商品详情图广告词审查Agent | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/product-ad-review-agent-with-strands-sdk-bedrock.md)

## 深度分析
### 架构解耦：多层抽象的工程价值
本方案的核心架构遵循**前后端分离**原则，后端基于 Strands Agents 框架，部署在 AgentCore 中，通过 AgentCore Gateway 将小宿智能搜索 API 转为 MCP 工具，问答过程记录在 AgentCore Memory 中。这一设计将**业务逻辑层**（Strands Agent）、**基础设施层**（AgentCore Runtime/Memory/Gateway）、**数据层**（小宿搜索）三层解耦，每层均可独立演进。Strands Agent 只需关注提示词和工具列表定义，AgentCore 负责安全扩展和运行时管理，Gateway 负责协议转换，这种分工模式显著降低了企业级 AI 系统的维护复杂度。

### AgentCore Memory 的"千人千面"机制
从对比测试结果看，启用 AgentCore Memory 后，Agent 对用户问题的理解更准确、答复更合理。其短期记忆捕获原始交互事件维护即时上下文，长期记忆存储用户偏好（如编程风格偏好）、语义事实（库的定义）和内容摘要。这种**双层记忆架构**解决了传统 Agent 在长会话中丢失上下文的问题，实现了真正的个性化服务。长期记忆使 Agent 能够跨越会话记住用户习惯，无需用户重复提供信息。

### Gateway 的协议翻译与生态兼容
AgentCore Gateway 的核心价值在于**协议标准化**：将 REST API、Lambda 函数、第三方服务快速转化为符合 MCP 标准的工具，同时支持 OAuth、API Key 等多种认证方式。其兼容 CrewAI、LangGraph 等开源框架及任意 AI 模型，这一设计使企业在选择 Agent 开发框架时不受限于单一生态，可根据团队技能灵活切换。本方案中通过 Gateway 将小宿搜索的 SmartSearch 和 Full-Text Search 两个产品封装为 MCP 工具，Strands Agents 以 tool-use 方式调用，实现了异构系统的高效集成。

### 无服务器架构的运维简化
AgentCore Runtime 采用**无服务器（Serverless）运行时**，专为代理工作负载构建，具有业界领先的扩展运行时支持、快速冷启动、真正的会话隔离、内置身份以及对多模态负载的支持。开发者只需将打包好的容器镜像部署到 ECR，AgentCore 自动处理基础设施扩缩容、安全隔离和运维管理。这种模式将 AI Agent 的运维负担从数月级降低到小时级，企业可专注业务逻辑而非基础设施。

## 实践启示
### 框架选型：模型驱动 vs 流程驱动
Strands Agents 采用**模型驱动（Model-Driven）**设计，开发者只需定义提示词和工具列表，模型自主完成规划、思维链推理、工具调用和自我反思。相比 CrewAI、LangGraph 等流程驱动框架，Strands Agents 更适合快速原型开发，但复杂多步骤工作流场景可能需要 LangGraph 的链式编排能力。企业选型时应评估团队对"AI 自主决策"的信任程度——模型驱动对模型能力要求更高，流程驱动则提供更强的确定性控制。

### 企业级部署的关键检查点
生产部署 Agentic AI 项目需关注六个关键点：模型多样性（Bedrock 集成 100+ 模型）、实时信息获取（通过 MCP 工具集成搜索解决幻觉）、框架兼容性（AgentCore 兼容所有主流框架）、MCP 工具标准化（Gateway 解决非标准化接口问题）、安全隔离（AgentCore Runtime 的会话隔离）、自动扩展（Serverless 架构）。本方案通过 AgentCore Memory 解决个性化问题、通过 Gateway 解决工具集成问题、通过 Runtime 解决规模化部署问题，形成了完整的企业级 AI Agent 落地方案。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-custom-code-based-evaluators-in-amazon-bedrock-agentco.md)

### 快速集成路径
对于中国区用户，小宿科技提供了更便捷的模型接入路径（通过 SKyrouter 访问 DeepSeek 等模型），结合 Strands Agents 的多模型支持，企业可在不改变代码的情况下切换底层模型。实施路径建议：1）项目初始化使用 uv 管理依赖；2）本地使用 Strands Agent + Bedrock 模型快速验证；3）通过 AgentCore Runtime 部署到云端；4）通过 Gateway 集成第三方 MCP 工具；5）启用 Memory 实现个性化服务。这一路径可将企业级 Agent 项目从概念验证到生产部署的时间大幅缩短。

---

