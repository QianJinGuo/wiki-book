# How LendingTree built a multi-agent mortgage assistant on Amazon Bedrock

## Ch04.779 How LendingTree built a multi-agent mortgage assistant on Amazon Bedrock

> 📊 Level ⭐⭐ | 2.8KB | `entities/how-lendingtree-built-a-multi-agent-mortgage-assistant-on-amazon-bedrock.md`

# How LendingTree built a multi-agent mortgage assistant on Amazon Bedrock

## 核心架构：Supervisor + 双 Worker

LendingTree 在生产环境部署了一个**三 Agent 多智能体系统**：一个 Supervisor 编排者 + 两个专业化 Worker（education 教育 worker、matching 匹配 worker），用 LangGraph 状态机、Model Context Protocol（MCP）和 Amazon Bedrock 上的基础模型协调。全部 Agent 以容器化服务运行在 Amazon ECS + Fargate 上；选择 ECS 而非 Bedrock AgentCore 是因为系统在 AgentCore GA 前已上线。

## 安全与合规双保险

系统在用户输入和模型输出路径上部署了**双层安全机制**：(1) Amazon Bedrock Guardrails 做内容过滤（仇恨/脏话检测）+ PII 脱敏 + prompt 威胁筛查；(2) 一个基于 LLM 的安全分类器并行执行，强制 LendingTree 的对话策略，两个安全检查并发运行不增加延迟。业务逻辑层处理运营规则：复杂问题转人工、离题对话重定向。抵押贷款行业的合规要求（内容过滤、PII 保护、合规监督）是"非协商选项"，这直接决定了架构选择。

## Supervisor 的 Plan-and-Execute 模式

Supervisor Agent 基于 LangGraph 构建为状态机，采用 **plan-and-execute 模式**——先理解全局意图、决定需要做什么，再由 Worker 各自执行最擅长的部分。Supervisor 是节点和边的图结构：节点执行工作（意图分析、执行规划、响应生成），边定义流程。这体现了多智能体编排的典型分层：编排层（Supervisor）与执行层（Worker）解耦。

## 与 Wiki 现有知识的关联

- 与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的编排层设计一致——Supervisor 承担 orchestration loop，Worker 承担工具调用
- [LangGraph 状态机](ch04/269-langgraph.html) 是多智能体编排的具体实现载体
- 与 [Smartsheet 远程 MCP Server](../ch07/001-mcp.html) 同属"生产级 MCP + Agent 架构"家族
- MCP 协议生态背景见 [MCP 协议生态](https://github.com/QianJinGuo/wiki/blob/main/concepts/mcp-protocol-ecosystem.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-lendingtree-built-a-multi-agent-mortgage-assistant-on-amazon-bedrock.md)

---

