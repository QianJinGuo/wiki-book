# 基于Strands框架和Bedrock AgentCore的SAP智能采购助手方案 | 亚马逊AWS官方博客

## Ch11.132 基于Strands框架和Bedrock AgentCore的SAP智能采购助手方案 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 8.0KB | `entities/sap-intelligent-procurement-assistant-solution.md`

## 深度分析

**企业级 Agent 应用的核心架构范式：从 GUI 自动化到自然语言交互**。本文揭示了传统企业软件的深层次体验问题——采购人员需要在 SAP GUI 中手动切换多个事务码（ME41 查询询价单、ME47 查看报价、XK03 查询供应商、ME21N 创建订单），这种基于事务码的操作模式在 ERP 系统中极为普遍，代表了过去三十年企业软件的典型交互范式。SAP 智能采购助手通过引入自然语言对话层，将用户从"记住操作步骤"转变为"描述业务目标"，这是企业软件交互范式的一次根本性转变。

**数据层-智能层-交互层的三层架构是云原生 Agent 系统的标准设计**。本文的架构设计遵循了清晰的关注点分离原则：数据层（AWS Glue + OData + S3 + Athena）负责 SAP 数据的抽取、转换和存储；智能层（Strands Agent + Bedrock AgentCore + Lambda）负责人意图识别、工具调度和业务逻辑执行；交互层（自然语言对话）负责用户请求的接收和结果的呈现。这种分层架构使得每一层都可以独立演进——例如数据层可以从 Glue 切换到 AppFlow 而不影响上层 Agent 逻辑，符合微服务架构的可组合性原则。

**OData 协议是连接企业遗留系统与现代化 AI 架构的关键桥梁**。SAP 系统作为典型的企业级遗留系统，其数据和业务流程的暴露一直是技术挑战。OData 作为一种基于 HTTP 的标准化 Web 协议，相比传统的 RFC/BAPI 调用方式，更适合现代 API 驱动的架构。AWS Glue 通过 OData 连接器实现了 SAP 数据的批量抽取，这一技术选型值得参考——它避免了直接对接 SAP 复杂接口的高成本，同时利用了 Glue 的 ETL 能力实现数据的规范化，为后续 AI 推理提供了干净的可用数据。

**Strands Agent 的 Orchestrator Tool Use 模式简化了 Agent 开发复杂度**。传统 Agent 框架往往需要复杂的编排逻辑（Orchestration Layer）来管理多步骤的工具调用，而 Strands Agents SDK 充分利用了大语言模型原生的推理和工具调用能力，使得开发者可以用"寥寥数行代码"构建功能强大的 Agent 应用。这种设计理念与最近的"Model is the Controller"趋势一致——让 LLM 本身担任控制器角色，而非在 LLM 之上叠加复杂的有限状态机。这降低了 Agent 的开发门槛，但也意味着 Agent 的可靠性高度依赖于底层模型的工具调用能力。

**自定义 Tools 通过 AWS Lambda 实现，实现了工具调用的可扩展性与成本效率**。本文将采购查询、采购订单创建等操作封装为自定义 Lambda Tools，这一设计有多重优势：Lambda 的事件驱动模型与 Agent 的按需调用模式天然契合；Lambda 的自动扩缩容能力避免了预置服务器的资源浪费；Lambda 独立部署的特性使得工具的添加、修改和版本管理都可以独立进行，不影响 Agent 核心逻辑。此外，将 Tool 的功能描述（功能说明）写得足够准确，是确保 Agent 能正确调用对应工具的关键工程实践。

## 实践启示

**在企业环境中引入 Agent 时，应优先选择高频、低风险的操作场景进行试点**。本文选择的采购场景——RFQ 查询、供应商信息核对、PO 创建——都是采购人员每天都会执行的高频操作，且单个操作的风险相对可控（查询操作无副作用，创建订单虽有风险但可配合审批流程）。这种场景选择策略降低了 Agent 上线的组织阻力：用户能够快速看到效率提升的价值，同时通过限制 Agent 的操作权限（如只读查询先行，订单创建后置审批）来控制风险。企业在推广 Agent 应用时，应先识别组织内类似的高频低风险场景进行验证，再逐步扩展到复杂决策场景。

**数据集成是企业级 Agent 落地的关键技术瓶颈，应优先投入资源解决**。本文用了大量篇幅描述 SAP 数据的 OData + Glue ETL 集成方案，这一比例反映了企业 Agent 落地的真实挑战——企业数据通常分散在多个遗留系统中，数据质量参差不齐，且出于安全合规考虑不能直接暴露给 AI 服务。建立健壮的数据管道（本文中的 Glue → S3 → Athena）并确保数据的及时性和准确性，是 Agent 能够输出可靠建议的前提条件。技术团队在评估 Agent 项目时，应将数据集成工作量作为关键路径来规划，而非作为附属工作。

**选择支持 LLM 原生工具调用能力的框架（如 Strands）可以显著降低开发复杂度**。Strands Agents SDK 的核心价值在于充分利用最新大语言模型的原生推理能力，而非在框架层面构建复杂的编排逻辑。这代表了 Agent 开发框架的趋势——从"框架定义工作流"转向"模型定义工作流，框架提供工具"。技术选型时应优先考虑这类与模型能力深度耦合的框架，而非过度依赖自定义的编排层。当然，这也意味着 Agent 的质量上限受制于所选模型的工具调用能力——当模型能力提升时，Agent 质量会自然提升，反之亦然。

**Tool 的功能描述是 Agent 调用准确性的关键工程点**。本文强调在每个自定义 Tool 中提供准确的功能描述，以实现 Agent 能准确调用有效的 Tool。这揭示了一个重要的 Agent 工程实践：Tool 的描述（Description）而非 Tool 的实现逻辑，决定了 Agent 是否会选择正确的工具。在实践中，应像编写 API 文档一样对待 Tool 描述，包括：功能的精确边界、输入参数说明、输出格式约定、以及与其他相似 Tool 的区分点。对于复杂的 Tool，可以参考 LangChain 的 Tool 文档模式，提供 Usage Guidelines 来指导模型的调用策略。

**会话上下文管理（Memory）是多轮交互场景的核心基础设施**。本文提到 Bedrock AgentCore Memory 负责记录对话上下文，支持多轮连续交互。对于企业采购场景，多轮交互的典型模式是：用户先询问某供应商的历史报价（第一轮）→ Agent 返回数据 → 用户进一步要求对比多个供应商（第二轮）→ Agent 跨请求保持上下文。这种跨请求的上下文保持能力，使得用户无需在单一请求中提供所有背景信息，大幅提升了交互的自然性和效率。在构建类似的企业 Agent 系统时，应将 Memory 的设计视为核心架构决策，而非事后补充功能。

## 相关实体
- [Using Amazon Bedrock Agentcore Openclaw Multi 5](ch03/045-agent.md)
- [Aws Bedrock Agentcore Quality Optimization Flywheel](ch11/118-aws-bedrock-agentcore-quality-optimization-flywheel.md)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](ch03/045-agent.md)
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](ch04/277-ai.md)
- [Aws Bedrock Multi Agent Collaboration Guide](ch03/045-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/sap-intelligent-procurement-assistant-solution.md)
- [淘宝动效解决方案分享](https://github.com/QianJinGuo/wiki/blob/main/entities/淘宝动效解决方案分享.md)

---

