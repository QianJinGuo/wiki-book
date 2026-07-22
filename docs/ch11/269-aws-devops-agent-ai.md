# AWS DevOps Agent 实战：如何使用生成式 AI 加速故障演练

## Ch11.269 AWS DevOps Agent 实战：如何使用生成式 AI 加速故障演练

> 📊 Level ⭐⭐ | 3.2KB | `entities/aws-devops-agent-实战如何使用生成式-ai-加速故障演练.md`

# AWS DevOps Agent 实战：如何使用生成式 AI 加速故障演练

> **Background**：本文基于 AWS China Blog 的技术教程，介绍如何借助 Kiro 与 AWS DevOps Agent，将高度依赖人力的故障演练转变为低成本、可复现、自动产出调查结论的流程。

## 故障演练的自动化转型

传统的故障演练高度依赖人工：SRE 需要准备演练手册、手动注入故障、观察系统反应、记录调查过程、输出报告。AWS DevOps Agent 与 Kiro 的配合，将这一流程简化为：用 Kiro 生成演练手册 → Agent 自动执行调查 → 输出结构化报告

## 核心流程

### 故障响应场景设计
需要为每一类故障切换信号设计可靠的检测机制。不同类型的故障（网络中断、服务降级、资源耗尽）需要不同的检测信号和告警阈值设计。

### 用 Kiro 生成演练手册
Kiro 是基于大模型的智能运维助手，能够根据故障场景自动生成演练手册。手册包含：故障注入步骤、预期检测信号、调查路径建议、验证方法。

### 运行演练与查看调查
DevOps Agent 接收演练触发后，自动执行故障检测链路，生成调查结论。运维人员可以实时查看 Agent 的调查进展、中间结论、以及最终报告。

### 调查结果形成演练报告
Kiro 可将 DevOps Agent 的调查结论自动汇总为结构化演练报告，包含：故障时间线、检测信号分析、根因推断、修复建议、改进项。

## 实践价值

将 DevOps Agent 集成到 on-call 流程中，使故障演练从季度级手动操作变为可随时触发的自动化流程。核心收益：演练成本从数人天降至分钟级、每次演练自动产生标准化的调查结论和经验沉淀、可复现演练确保团队持续保持故障响应能力。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/aws-devops-agent-实战如何使用生成式-ai-加速故障演练.md)

## 相关实体
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](ch11/267-aws-devops-agent.html)
- [Habby 游戏借助 AWS DevOps Agent 实现智能运维最佳实践](ch11/267-aws-devops-agent.html)
- [AgentCore Managed Harness](../ch04/657-agentcore-harness.html)

---

