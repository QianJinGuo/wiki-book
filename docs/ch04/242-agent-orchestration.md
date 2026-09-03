# Agent orchestration

> 📊 Level ⭐⭐ | 9.0KB | `entities/aws-agent-orchestration-workshop.md`

## 核心要点
- AWS Marketplace 举办的 Agent Orchestration Workshop 技术研讨会
- 聚焦 Agent 编排（orchestration）实战
- 由 AWS 技术团队主持

## 摘要
Markdown Content:

# Agent Orchestration Workshop | AWS Marketplace
## Select your cookie preferences
We use essential cookies and similar tools that are necessary to provide our site and services. We use performance cookies to collect anonymous statistics, so we can understand how customers use our site and make improvements. Essential cookies cannot be deactivated, but you can choose “Customize” or “Decline” to decline performance cookies.
 If you agree, AWS and approved third parties will also use cookies to provide useful site features, remember your preferences, and display relevant content, including relevant advertising. To accept or decline all non-essential cookies, choose “Accept” or “Decline.” To make more detailed choices, choose “Customize.”
Accept Decline Customize

## Customize cookie preferences
We use cookies and similar tools (collectively, "cookies") for the following purposes.

### Essential
Essential cookies are necessary to provide our site and services and cannot be deactivated. They are usually set in response to your actions on the site, such as setting your privacy preferences, signing in, or filling in forms.

- [x]
Allowed

### Performance
Performance cookies provide anonymous statistics about how customers navigate our site so we can improve site experience and performance. Approved third parties may perform analytics on our behalf, but they cannot use the data for their own purposes.

- [x]
Allowed

### Functional
Functional cookies help us provide useful site features, remember your preferences, and display relevant content. Approved third parties may set these cookies to provide certain site features. If you do not allow these cookies, then some or all of these services may not function properly.

- [x]
Allowed

### Advertising
Advertising cookies may be set through our site by us or our advertising partners and help us deliver relevant marketing content. If you do not allow these cookies, you will experience less r...

## 深度分析
- **编排层缺失是 Agent 系统失败的核心根因**：多 Agent 网络若无控制平面，会导致状态丢失、关键决策无人工审批机制、单点故障级联传播。编排层负责执行状态管理、审批门控和故障处理。
- **两种主流编排模式互补**：确定性工作流编排（AWS Step Functions）适合结构化、可预测的流程；推理驱动型 Agent 协调（Amazon Bedrock Agents）适合需要动态路由和工具调用的场景。前者保证精确性和可审计性，后者提供灵活性和自适应能力。
- **AWS Marketplace 形成完整的编排工具矩阵**：从 Temporal Cloud、Orkes Cloud（Conductor 商业版）到 Prefect Cloud，覆盖了从开源工作流引擎到托管服务的不同选择。Apache Airflow via Astronomer 和 Amazon MWAA 则面向已有 DAG 资产的团队。
- **Human-in-the-loop 是生产级 Agent 系统的必备能力**：在金融、医疗等合规要求严格的领域，关键决策必须有人工审批节点。AWS Step Functions 的 approval 步骤支持暂停执行等待人工确认，确保 Agent 输出可追溯。
- **MWAA 为复杂多步管道提供 DAG 保障**：相比 Step Functions 的状态机模型，Amazon MWAA（Managed Workflows for Apache Airflow）适合已有 Airflow 资产的组织，支持更丰富的依赖管理和监控生态。

编排层之所以成为多 Agent 系统的「缺失控制平面」，根本原因在于 Agent 之间的协作不是简单的请求-响应链，而是一个包含状态流转、异常传播和决策门控的复杂拓扑。正如 [A Missing Layer in Agentic Systems?](277-a-missing-layer-in-agentic-systems.html) 一文所指出的，Agent 系统的可靠性瓶颈往往不在单个 Agent 的推理能力，而在 Agent 之间的协调机制。当多个 Agent 共享上下文、竞争资源或依赖彼此的输出时，没有编排层就意味着没有全局状态视图——某个 Agent 的超时会导致下游 Agent 拿到过期数据，某个 Agent 的幻觉输出会在未经验证的情况下被下游当作事实使用。[Dynamic Subagents](../ch03/004-agent.html) 的代码驱动编排模型和 [LangGraph 1.0](165-langgraph.html) 的 Agent 操作系统理念，都在试图解决同一个核心问题：为 Agent 网络提供一个可靠的状态管理与决策协调层。

确定性编排与推理驱动编排的互补关系是本次 Workshop 传递的核心架构洞察。AWS Step Functions 代表的确定性编排，其优势在于每一步的状态转换都是显式定义的，支持重试策略、超时控制和条件分支，适合对可预测性和审计性要求高的流程——例如金融交易审批、合规检查等场景。而 Amazon Bedrock Agents 代表的推理驱动编排，则擅长处理需要动态路由的开放式任务：Agent 可以根据上下文自主决定调用哪些工具、何时终止推理链、如何组合多个工具的输出。这两种模式并非替代关系，而是在不同抽象层次上各司其职——确定性编排负责「骨架」——定义流程的边界和约束；推理驱动编排负责「肌肉」——在边界内执行灵活的智能决策。[Inngest](../ch01/553-inngest-ai-and-backend-workflows-orchestrated-at-any-scal.html) 的 workflow orchestration 和 [JiuwenSwarm](https://github.com/QianJinGuo/wiki/blob/main/entities/jiuwenswarm-coordination-engineering.md) 的 SwarmFlow 可控编排，分别从后端工作流引擎和多智能体协作框架的角度，验证了这种「确定性骨架 + 智能填充」的分层架构模式。

Human-in-the-loop 模式不是 Agent 系统的可选增强，而是生产部署的强制性门槛。Workshop 明确强调，关键决策必须有人工审批节点——这不仅是合规要求（金融、医疗等领域），更是系统鲁棒性的保障。当 Agent 的输出涉及不可逆操作（如资金转移、数据删除、外部 API 调用）时，human approval step 提供了一个「熔断机制」：暂停执行流程，等待人工确认后再继续。这种模式要求编排层具备「可暂停-可恢复」的能力，而这正是 Step Functions 的 approval 步骤和 [阿里云 AgentTeams](../ch03/004-agent.html) 企业级平台所强调的人机协同设计。从更宏观的视角看，[Agent Harness](../ch05/035-agent-harness.html) 所定义的第三代工程范式也将「人工监督」作为核心组件之一——不是因为 Agent 能力不够，而是因为生产级系统的责任归属要求人类始终保有最终控制权。

## 实践启示
1. **从工具选型开始构建控制平面**：如果团队已有 Step Functions 经验，先在其上实现 Agent 任务分派和状态跟踪；如果倾向推理驱动，优先集成 Bedrock Agents 的 tool use 和 memory 能力。
2. **在概念验证阶段就引入 Human-in-the-loop 流程**：不要等系统上线后才考虑审批节点。从第一个生产级 Agent 应用开始就设计人工确认步骤，形成可审计的操作记录。
3. **评估编排工具时考虑供应商锁定风险**：Marketplace 上的 Temporal Cloud、Orkes Cloud、Prefect Cloud 均为第三方托管服务，需评估迁移成本和数据主权。AWS 原生方案（Step Functions、Bedrock、MWAA）在集成和安全合规方面有优势。
4. **关注 2026-06-02 的 Workshop 直播**：AWS 技术团队（WW Tech Lead Dr. James Bland + Sr. SA Rahman Syed）主持的本次研讨会可作为实操入口，结合配套指南深化理解。
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/aws-agent-orchestration-workshop.md)

## 相关实体
- [9个Agent技能模块化SageMaker微调生命周期](312-ai-agent.html)

- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](310-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](214-aws-devops-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

