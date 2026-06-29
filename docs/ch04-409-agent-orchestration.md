# Agent orchestration

## Ch04.409 Agent orchestration

> 📊 Level ⭐⭐ | 5.6KB | `entities/aws-agent-orchestration-workshop.md`

## 核心要点
- AWS Marketplace 举办的 Agent Orchestration Workshop 技术研讨会
- 聚焦 Agent 编排（orchestration）实战
- 由 AWS 技术团队主持

## 摘要
Markdown Content:

## Agent Orchestration Workshop | AWS Marketplace
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

## 实践启示
1. **从工具选型开始构建控制平面**：如果团队已有 Step Functions 经验，先在其上实现 Agent 任务分派和状态跟踪；如果倾向推理驱动，优先集成 Bedrock Agents 的 tool use 和 memory 能力。
2. **在概念验证阶段就引入 Human-in-the-loop 流程**：不要等系统上线后才考虑审批节点。从第一个生产级 Agent 应用开始就设计人工确认步骤，形成可审计的操作记录。
3. **评估编排工具时考虑供应商锁定风险**：Marketplace 上的 Temporal Cloud、Orkes Cloud、Prefect Cloud 均为第三方托管服务，需评估迁移成本和数据主权。AWS 原生方案（Step Functions、Bedrock、MWAA）在集成和安全合规方面有优势。
4. **关注 2026-06-02 的 Workshop 直播**：AWS 技术团队（WW Tech Lead Dr. James Bland + Sr. SA Rahman Syed）主持的本次研讨会可作为实操入口，结合配套指南深化理解。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-agent-orchestration-workshop.md)

## 相关实体
- [9个Agent技能模块化SageMaker微调生命周期](/ch04-345-aws-sagemaker-ai-agent-guided-workflows-finetuning/)

- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](/ch04-329-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro/)
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](/ch04-258-aws-devops-agent-实战-云网络故障自主调查与修复建议/)
- MOC

---

