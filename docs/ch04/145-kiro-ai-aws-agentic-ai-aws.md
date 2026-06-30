# 用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客

## Ch04.145 用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 13.0KB | `entities/building-enterprise-agentic-ai-with-kiro-on-aws.md`

## 概述
用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 by awschina on 04 3月 2026 in Artificial Intelligence Permalink Share 摘要：我们如何用 Kiro（AI IDE）完成全流程开发，基于 Strands Agents 框架、Amazon Bedrock AgentCore 和 AWS 基础设施，在一周内构建了一个能交付实际产出的 AI Agent 平台——全程零人工编码。 目录 01 一、为什么需要 "能交付" 的 AI Agent？ 02 二、开发层：用 Kiro 完成全流程开发 03 三、整体架构 04 四、运行层一：Strands Agents —— Agent 框架 05 五、运行层二：Amazon Bedrock AgentCore —— 运行时、记忆与沙箱 06 六、运行层三：AWS 基础设施 —— AWS CDK 一把梭 07 七、平台能力展示 08 八、实践经验 09 九、快速上手 10 十、总结 11 十一、项目源码 12 十二、参考文档 一、为什么需要 "能交付" 的 AI Agent？ 大多数 AI 聊天产品止步于对话——你问一个问题，得到一段文字，然后就没有然后了。但企业场景需要的不是聊天，而是产出：一份架构图、一个部署好的网页、一份账单分析报告、一段可执行的代码。 这正是我们构建这个 AI Agent 平台的出发点。我们希望用户用自然语言描述需求， Agent 直接产出可交付的成果——图片、视频、文档、数据分析、部署好的静态网站，甚至 AWS 架构图。 [图：平台主界面——左侧为会话列表和功能导航，右侧为 Agent 对话区域，实时展示工具调用进度和交付物产出。] 挑战不在于 "做一个 Agent" ，而在于让它在生产环境中可靠运行：自动扩缩容、安全的代码执行沙箱、跨会话的记忆持久化、多工具的编排协调。如果从零搭建这些能力，至少需要数月。 我们的答案是三层运行时架构： Strands Agents （ Agent 框架） + Amazon Bedrock AgentCore （运行时 + 记忆 + 沙箱） + AWS Cloud Development Kit (AWS CDK) （基础设施即代码）。 而更关键的是——整个平台从需求到上线，全程由 AI 完成开发。 二、开发层：用 Kiro 完成全流程开发 这个项目最值得分享的一点是：从需求整理、架构设计、任务拆分、代码开发、测试到部署，全部由 Kiro （ AWS 推出的 AI IDE ）完成，全程不需要人工编写代码。 这不是 "AI 辅助开发"，而是真正的 AI 驱动开发——人类负责描述意图和验收结果， Kiro 负责从意图到代码的全链路执行。 2.1 Spec-Driven Development：从模糊想法到可执行任务 Kiro 的核心工作流是 Spec-Driven Development （规格驱动开发）。我们只需要用自然语言描述想要什么， Kiro 会自动生成三层规格文档： 第一步：需求文档 (Requirements) 我们告诉 Kiro ："构建一个 delivery-focused 的 AI Agent 平台，用户通过对话让 Agent 产出图片、视频、文档、网页等交付物。后端用 FastAPI + Strands Agents ，其中 Strands Agents 部署在 AgentCore Runtime 上。" Kiro 自动生成了结构化的需求文档，包含用户故事、验收标准和技术约束： ### Requirement 1: User Authentication **User Story:** As a user, I want to sign in with my Google account, so that I can securely access my personal workspace and deliverables. ### Requirement 3: Agent Tool Integration **User Story:** As a user, I want the Agent to execute code, browse web, generate images/videos, and deploy web pages... [图：Kiro Spec-Driven Development 自动生成的需求文档，包含结构化的用户故事、验收标准和技术约束。] 第二步：技术设计 (Design) 需求确认后， Kiro 自动生成技术设计文档——数据库 schema 、 API 接口定义、组件架构、时序图：... [truncated] 2.2 Vibe Coding：对话式迭代开发 除了 Spec-Driven 的结构化开发，日常的功能迭代和 bug 修复通过 Vibe Coding 完成——直接在 Kiro 中用自然语言描述需求， Kiro 即时修改代码。 2.3 Steering Files：让 AI 理解项目全貌 Kiro 之所以能准确地编写代码，关键在于 Steering Files ——放在 .kiro/steering/ 目录下的项目上下文文档。 2.4 Hooks：自动化质量保障 Kiro 的 Hooks 机制实现了自动化的质量保障。 2.5 MCP Server 集成：实时参考最新文档 通过配置 Model Context Protocol (MCP) Server 让 Kiro 能实时参考最新的官方文档。 2.6 开发效率：数天完成数月的工作量 整个项目一个人在一周内完成了从零到生产部署的全流程。

## 核心技术
Kiro CLI、Kiro IDE、Kiro MCP Skills、Amazon Bedrock

## 深度分析
### 1. Spec-Driven Development 的工程化价值
本文最核心的方法论创新在于将 Spec-Driven Development（规格驱动开发）引入 AI 原生开发流程。传统开发中，规格文档往往由人类编写后交给 AI 辅助审查；而在本文的实践中，**规格文档本身由 Kiro 自动生成**，人类仅负责审核和验收。这意味着开发起点从"写代码"前移到了"描述意图"，极大压缩了需求到实现的转换链路。
三层规格文档体系（Requirements → Design → Tasks）是这一方法论的关键：需求文档定义用户故事和验收标准，技术设计文档生成数据库 schema、API 接口和组件架构，任务拆分文档将设计转化为可执行的增量任务列表。这三层文档既是开发的输入，也是验收的依据，实现了开发过程的可追溯性。

### 2. 三层运行时架构的职责边界
文章提出的三层运行时架构（Strands Agents + Bedrock AgentCore + AWS CDK）体现了清晰的职责分层：

- **Strands Agents** 作为应用层框架，负责 Agent Loop、对话管理和工具抽象，其核心价值在于"工具即代码"的设计——通过 `@tool` 装饰器将任意 Python 方法转化为 LLM 可调用的工具，降低了工具开发门槛
- **AgentCore** 作为运行时层，提供 Serverless 容器编排、跨会话记忆持久化和代码执行沙箱三项基础设施能力，解决了生产级 Agent 部署的核心挑战
- **AWS CDK** 作为基础设施层，实现了基础设施即代码，确保整套架构可复现、可版本控制
这种分层设计使得每一层都可以独立演进或替换，避免了厂商锁定。

### 3. 双执行模式消除开发生产差异
文章提出的双执行模式（Direct Mode vs. AgentCore Mode）是其最具工程价值的设计之一。通过在 WebSocket Handler 中设置条件判断：
```python
if settings.agentcore_runtime_enabled:

    # 生产：通过 AgentCore Runtime 流式传输 (HTTP SSE)
    async for event in agentcore_service.invoke_stream(payload):
        await websocket.send_json(event)
else:

    # 开发：Agent 直接在进程内运行
    async for event in agent.process_message(message):
        await websocket.send_json(event)
```
同一份 Agent 代码在本地和生产环境无缝切换，消除了"在我机器上能跑"的经典问题。本地开发使用 `agentcore launch --local`，体验与生产完全一致。这种抽象成本极低，但带来的开发效率提升是显著的。

### 4. 动态工具加载的工程优化
文章详细描述了从"全量工具加载"到"Skills 驱动动态加载"的优化过程。初始版本为每个对话加载全部 15+ 工具，导致 LLM 在工具选择上出现决策失误。基于 Skills 的动态加载解决了这个问题——用户启用需要的 Skills，只有对应的领域工具被加载。
这一经验揭示了 LLM Agent 设计中的一个重要工程原则：**工具数量与决策准确率之间存在负相关**。在企业场景中，面向特定领域的工具集远比通用工具集更能发挥 LLM 的决策能力。动态加载机制是实现这一原则的技术手段。

### 5. AI 驱动开发的组织变革意涵
文章声称"全程零人工编码"，这一声明的真实性值得深入分析。从实践描述看，人类的工作集中在：用自然语言描述需求、审核 Kiro 生成的规格文档、验收最终成果。代码编写、测试、部署确实由 Kiro 完成。
这标志着开发范式的根本转变：**人类从代码执行者转变为意图表达者和结果验收者**。这对软件开发组织的技能结构提出了新的要求——未来最重要的技能可能是准确描述需求和定义验收标准，而非编写代码本身。Steering Files（四份核心文档：product.md、structure.md、tech.md、ui-ux-pro-max.md）作为项目上下文的载体，替代了传统开发中通过代码审查传递的隐性知识。

## 实践启示
### 1. 优先构建动态工具加载机制
在设计企业 Agent 平台时，不应一次性加载所有可用工具，而应实现基于用户意图或角色配置的动态工具加载。可参考本文的 Skills 系统设计——核心工具始终加载，领域工具按需加载。工具数量控制在 5-10 个以内可显著提升 LLM 的决策准确率。

### 2. 善用 MCP Server 保持文档实时性
当 Agent 依赖快速迭代的服务（如 Strands Agents、AgentCore）时，通过 MCP Server 接入实时官方文档而非依赖训练数据，可避免因文档过时导致的开发错误。这是保证 AI 驱动开发质量的关键基础设施。

### 3. 设计双执行模式实现开发生产一致性
在同一代码库中设计 `agentcore_runtime_enabled` 这样的环境开关，使 Agent 代码可以在 Direct Mode（开发）和 AgentCore Mode（生产）之间无缝切换。本地开发完成后，无需修改代码即可部署到生产环境，大幅缩短迭代周期。

### 4. 通过 Steering Files 建立项目知识库
在 AI 驱动开发中，项目上下文（架构决策、技术约束、设计规范）需要显式文档化。建议创建至少四类 Steering Files：产品定位文档、结构文档、技术栈文档和 UI/UX 设计规范文档。这些文档是 AI 准确执行代码任务的基础设施。

### 5. 优先采用 Agentic Memory 而非对话窗口
跨会话记忆是区分"工具调用"和"智能助手"的关键能力。在构建生产级 Agent 时，应优先接入 AgentCore Memory 或类似的持久化记忆系统，使 Agent 能够记住用户偏好、历史产出和进行中的项目，将用户体验从"使用工具"提升到"与助手协作"。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/building-enterprise-agentic-ai-with-kiro-on-aws/)

## 相关实体
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-network-claude-code-kiro-cli-implement-aws-ipsec-vpn.md)
- [让 AI 理解你的组件库：新一代智能 D2C架构 — 基于 AWS Kiro MCP Skills 的智能转换实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-understanding-component-library-intelligent-d2c-architecture-aws-kiro-mcp-skills.md)
- [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/enable-kiro-and-claude-code-for-im-with-acp-bridge-async-ai-workflow.md)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/using-kiro-cli-agent-client-protocol-build-ai-chat.md)
- [使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/blog-03-kiro-ai-cdk-development.md)
- [AI 驱动的 Graviton 迁移评估：Kiro Power 实战指南 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-graviton-migration-kiro-power-guide.md)

---

