# 使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客

## Ch09.028 使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 16.1KB | `entities/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide.md`

## 概述
使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 by awschina on 17 12月 2025 in AWS Big Data Permalink Share 概述 本文介绍如何使用 Kiro AI IDE 开发 Amazon EMR Flink 智能监控系统，重点分享基于 Strands Agents MCP 和 AWS Data Processing MCP 的开发实践，以及 Spec 驱动开发 的完整流程。 项目地址 ： https://github.com/yangguangfu007/emr-flink-monitoring-agent Kiro AI IDE 核心能力 1. Spec 驱动开发 Kiro 引入了 Spec 的概念，这是一种结构化的需求描述方式： 开发流程: 用自然语言描述需求 → 生成 requirements.md AI 理解需求并生成设计方案 → 生成 design.md 将设计方案分解为具体任务 → 生成 tasks.md 逐个实现任务，生成代码 2. Steering (引导规则) Steering 是 Kiro 的知识管理系统，用于定义项目规范： Steering 文件会自动注入到 AI 的上下文中，确保生成的代码符合项目规范。 3. MCP (Model Context Protocol) 集成 Kiro 支持 MCP 服务器 ，可以扩展 AI 的能力： Strands Agents MCP ：提供 Strands Agents文档和示例 AWS Data Processing MCP ：提供 AWS Glue、Amazon EMR、Amazon Athena 等服务的操作能力 自定义工具和命令 技术选型与架构 技术栈 后端 : – Python 3.10+ – FastAPI (异步 Web 框架) – Strands Agents(多 Agent 框架) – boto3 (AWS SDK) 前端 : – React 18 + TypeScript – Ant Design (UI 组件库) – Vite (构建工具) AI : – Amazon Bedrock 项目架构 基于 MCP 的开发实践 1. 配置 Strands Agents MCP 在 .kiro/settings/mcp.json 中配置： { "mcpServers": { "strands-agents": { "command": "uvx", "args": ["strands-mcp-server@latest"], "env": { "FASTMCP_LOG_LEVEL": "ERROR" }, "disabled": false, "autoApprove": ["search_docs", "fetch_doc"] } } } 使用 MCP 工具查询 Strands Agents文档： 我：如何使用 Strands Agents实现 Agents as Tools 模式？ Kiro：让我查询 Strands Agents文档… [调用 strands-agents MCP: search_docs("agents as tools")] 根据文档,实现步骤如下： 1. 创建子 Agent 类 2. 实现 as_tool() 方法 3. 在主 Agent 中注册为工具 [生成示例代码] 2. 配置 AWS Data Processing MCP { "mcpServers": { "aws-dp": { "command": "uvx", "args": ["awslabs.aws-data-processing-mcp-server@latest"], "env": { "AWS_REGION": "us-east-1" }, "disabled": false, "autoApprove": [] } } } 使用 MCP 工具操作 AWS 服务： 我：帮我查询 Amazon EMR 集群 j-xxx 的信息 Kiro：[调用 aws-dp MCP: describe_emr_cluster("j-xxx")] 集群信息： – 状态：RUNNING – Master 节点：m5.xlarge – Core 节点：3 × m5.xlarge – VPC：vpc-xxx Spec 驱动开发实践 第 1 步：创建 Requirements 与 Kiro 对话描述需求： 我：我想开发一个基于 Amazon EMR 集群的智能监控 agent系统，该系统第一期功能：监控 Flink 任务、分析任务状态并提供优化建议。 Kiro：我理解了您的需求。让我为您创建项目 Spec… [truncated] 生成的 requirements.md 包含：- 用户故事 (User Stories) – 验收标准 (Acceptance Criteria) – 非功能性需求 (Performance, Security) 第 2 步：生成 Design Kiro 基于需求自动生成设计方案： [生成 .kiro/specs/emr-flink-monitoring-agent/design.md] 第 3 步：任务分解 Kiro 将设计方案分解为具体任务： [生成 .kiro/specs/emr-flink-monitoring-agent/tasks.md] 第 4 步：执行任务 逐个执行任务，Kiro 自动生成代码。 核心功能开发 1. 多 Agent 系统 基于 Strands Agents的"Agents as Tools"模式实现： # Orchestrator 将子 Agent 注册为工具 self.tools = [ self.flink_agent.as_tool(), self.general_agent.as_tool() ] # LLM 自主选择合适的 Agent async for event in bedrock_stream( model="us.anthropic.claude-haiku-4-5-20251001-v1:0", messages=[{"role": "user", "content": message}], tools=self.tools ): yield event 2. AI 分析器 (智能降级) async def analyze_job(self, job_data: dict) - AnalysisResult: try: # 优先使用 AI 分析 return await self.ai_analyzer.analyze(job_data) except Exception as e: # 降级到规则分析 return self.rule_analyzer.analyze(job_data) 3. 流式输出 后端使用 Strands Agents的 stream_async(): async for event in agent.stream_async(user_message): yield f"data: {json.dumps(event)}\n\n" 前端使用 EventSource 接收: const eventSource = new EventSource('/api/chat'); eventSource.onmessage = (event) = { const data = JSON.parse(event.data); // 实时更新 UI }; Kiro 最佳实践 1. 充分利用 Steering 规则 在项目开始时定义好规范： # .kiro/steering/language.md – 代码注释使用中文 – 日志使用英文 – 专有名词保持英文 # .kiro/steering/work-style.md – 修改优先于创建 – 避免创建临时文件 – 保持项目整洁 2. 使用 Spec 驱动开发 不要直接让 Kiro 生成代码,而是先创建 Spec： md → 功能需求、性能需求、安全需求 md → 架构设计、模块划分、接口设计 md → 任务分解 然后让 Kiro 逐个实现任务。 3. 善用 MCP 工具 使用 Strands Agents MCP 查询文档 使用 AWS Data Processing MCP 操作 AWS 服务 自定义 MCP 服务器扩展能力 4. 迭代优化 不要期望 Kiro 一次生成完美的代码： 第 1 轮：生成基础功能 第 2 轮：添加错误处理 第 3 轮：优化性能 第 4 轮：添加测试 第 5 轮：完善文档 实际案例：从需求到上线 Day 1：需求分析和架构设计 (2 小时) 与 Kiro 对话描述需求 生成md、design.md、tasks.md Day 2-3：核心功能开发 (5 小时) 任务 1：指标收集器 (30 分钟) 任务 2：AI 分析器 (45 分钟) 任务 3：多 Agent 系统 (1 小时) 任务 4：FastAPI 接口 (20 分钟) 任务 5：React 前端 (2 小时) Day 4：测试和优化 (3 小时) 单元测试 (40 分钟) 端到端测试 (2 小时) 代码审查 (20 分钟) 总耗时 ：10 小时 (需求到上线) 传统方式预估 ：60-80 小时 效率提升 ： 6-8 倍 总结 通过使用 Kiro AI IDE 开发 Amazon EMR Flink 监控系统，我们深刻体会到 AI 辅助开发的价值： 效率提升 ：开发效率提升 6-8 倍 质量提升 ：代码规范性 100%，测试覆盖率 85% 学习加速 ：通过 AI 生成的代码学习新技术 决策辅助 ：AI 帮助做出正确的技术选型 核心亮点 : Spec 驱动开发 ：结构化需求描述,逐步实现 MCP 集成 ：扩展 AI 能力,查询文档和操作 AWS 服务 Steering 规则 ：确保代码符合项目规范 迭代优化 ：逐步完善，而非一次完美 参考资源 项目地址 Kiro 官网 Strands Agents SDK Amazon Bedrock *前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。 本篇作者 杨光富 亚马逊云科技解决方案架构师，专注于帮助客户构建和优化云端架构解决方案。曾任职知名互联网大厂，拥有多年大数据平台研发和架构设计经验。目前专注于AI+Data原生解决方案的架构设计与实施。

## 深度分析
### Spec 驱动开发的核心价值
Kiro AI IDE 引入的 Spec 驱动开发模式，本质上是将自然语言需求转化为结构化文档，再由 AI 逐步执行实现。这一流程包含三个关键阶段：
1. **requirements.md 生成**：通过自然语言对话，AI 自动提取用户故事（User Stories）、验收标准（Acceptance Criteria）和非功能性需求（Performance、Security）。这种结构化方式避免了传统需求文档的模糊性。 ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]
2. **design.md 生成**：AI 基于需求文档自动生成架构设计方案，包括模块划分、接口设计和数据流图。这降低了架构设计的认知门槛，让开发者能快速获得可行的方案参考。 ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]
3. **tasks.md 分解**：将设计方案拆解为可执行的具体任务，每个任务都有明确的输入输出和验收条件。这种分解方式使 AI 能有序地生成代码，而非一次性产出难以掌控的庞大代码块。 ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]

### MCP 集成策略分析
文章展示了两个 MCP 服务器的集成实践： ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]
**Strands Agents MCP** 提供了文档查询和示例获取能力，使 AI 在生成代码时能参考最新官方文档而非依赖记忆中的过时信息。这种"工具辅助知识获取"的模式解决了大模型知识陈旧的问题。
**AWS Data Processing MCP** 则提供了直接操作 AWS 服务的能力，AI 可以通过 `describe_emr_cluster` 等工具实时获取集群状态，而非依赖静态配置或猜测。这一能力对于自动化运维场景尤为重要。
两者的组合形成了"知识查询+操作执行"的闭环，显著扩展了 AI 在云原生场景下的实用性。 ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]

### 多 Agent 系统的"Agents as Tools"模式
文章中基于 Strands Agents 实现的多 Agent 系统采用了"子 Agent 注册为工具"的架构模式。Orchestrator 将 Flink Agent 和 General Agent 通过 `as_tool()` 方法注册为可调用工具，LLM 根据用户消息内容自主选择合适的 Agent 处理。
这种模式的优势在于： ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]

- **职责分离**：每个 Agent 专注单一领域，降低了单 Agent 的复杂度
- **动态路由**：LLM 根据上下文选择 Agent，提高了系统的灵活性
- **可扩展性**：新增 Agent 只需实现 `as_tool()` 接口即可无缝接入

### 智能降级设计
AI 分析器采用了"优先 AI，降级规则"的策略。当 AI 分析失败时，系统自动回退到规则引擎，确保分析功能始终可用。这种设计在生产环境中至关重要，避免了 AI 服务不可用时整个监控系统瘫痪的问题。

### 流式输出的工程实现
文章详细展示了前后端的流式输出实现：后端使用 `stream_async()` 生成 Server-Sent Events，前端使用 EventSource API 接收并实时更新 UI。这种架构特别适合 AI 助手类应用，提供了更好的交互体验。

## 核心技术
Kiro CLI、Kiro IDE、Kiro MCP Skills、Amazon Bedrock、Apache Flink、Amazon EMR

## 实践启示
### 1. Spec 驱动开发是 AI 辅助编程的有效范式
传统 AI 编程往往是"需求→代码"的一次性生成，这种方式难以保证输出的可控性和质量。Spec 驱动开发通过 requirements→design→tasks 的三级分解，将 AI 的能力引导到可控的逐步生成中。建议在实际项目中：

- 先定义清晰的 Steering 规则（包括代码风格、日志规范、技术术语使用）
- 通过自然语言与 AI 交互生成 requirements.md，不要急于让 AI 直接写代码
- 利用 design.md 评审架构方案的合理性，再让 AI 分解任务
- 逐任务执行并验收，而非一次性生成全部代码

### 2. MCP 集成是扩展 AI 能力的核心技术路径
MCP（Model Context Protocol）解决了 AI 无法实时获取外部信息和执行操作的问题。在云原生开发场景中，建议优先集成：

- **文档查询 MCP**：确保 AI 生成的代码符合最新官方最佳实践
- **云服务操作 MCP**：使 AI 能直接查询和操作 AWS/GCP/Azure 资源，实现真正的自动化
对于自建 MCP 服务器，需要关注 `autoApprove` 配置，平衡安全性和效率。 ^[https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/]

### 3. "Agents as Tools"模式适合复杂任务分解
当系统功能复杂时，单一 Agent 难以同时处理所有任务。采用"子 Agent 作为工具"的架构可以让 LLM 根据任务类型动态路由，提高系统整体的处理能力和准确性。实现要点：

- 每个子 Agent 实现 `as_tool()` 方法返回标准工具定义
- 父 Agent 维护工具列表并控制调用权限
- 设计清晰的 Agent 职责边界，避免功能重叠

### 4. AI 辅助开发需要迭代优化心态
文章案例显示，从需求到上线仅耗时 10 小时，而传统方式预估 60-80 小时，效率提升 6-8 倍。但这种效率提升建立在"迭代优化"的心态上：

- 第 1 轮生成基础功能
- 第 2 轮添加错误处理
- 第 3 轮优化性能
- 第 4 轮添加测试
- 第 5 轮完善文档
不要期望 AI 一次生成完美的代码，而是通过多轮迭代逐步完善。这是 AI 辅助编程与传统开发的本质区别。

### 5. 流式输出是改善 AI 交互体验的关键技术
对于 AI 助手类应用，同步返回完整答案的体验远不如流式输出。使用 EventSource/SSE 架构可以实现实时反馈，让用户看到 AI 思考和生成的过程，这不仅改善了体验，也降低了等待的焦虑感。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide/)

## 相关实体
- [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客](../ch03/076-claude-code.html)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](../ch03/046-agent.html)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](../ch04/568-agentic-ai.html)
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](../ch03/076-claude-code.html)
- [使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](../ch05/086-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/developing-flink-monitoring-system-on-amazon-emr-with-kiro-ai-ide.md)

- [AI 驱动的 Graviton 迁移评估：Kiro Power 实战指南 | 亚马逊AWS官方博客](../ch05/086-ai.html)

---

