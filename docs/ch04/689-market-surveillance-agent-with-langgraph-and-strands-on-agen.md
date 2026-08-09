# Market surveillance agent with LangGraph and Strands on AgentCore

## Ch04.689 Market surveillance agent with LangGraph and Strands on AgentCore

> 📊 Level ⭐⭐ | 4.0KB | `entities/market-surveillance-agent-langgraph-strands-agentcore.md`

# Market surveillance agent with LangGraph and Strands on AgentCore

AWS 官方博客发布的一篇深度技术文章，演示如何将 LangGraph（宏观工作流编排）与 Strands（智能 Agent 推理引擎）结合在 Amazon Bedrock AgentCore 上构建生产级市场监控多 Agent 系统。

## 架构设计

文章提出三层架构：LangGraph 负责宏观编排（状态管理 + 有向图 + checkpoint 恢复），Strands Agent 在单个工作流节点内充当推理引擎，AgentCore 提供生产级部署基础设施。

核心构件包括：
- **市场监控 Agent**（Strands Agent with AgentCore）：分析交易模式、识别可疑活动
- **监管报告 Agent**（Strands Agent with AgentCore）：生成合规报告
- **多 Agent 协调**：LangGraph 管理 Agent 之间的工作流和数据流
- **AgentCore Memory**：通过 `langgraph-checkpoint-aws` 包实现持久化和长短期记忆检索

## 关键技术点

### AgentCore Memory 集成

LangGraph 通过 `AgentCoreMemorySaver` 和 `AgentCoreMemoryStore` 类与 AgentCore 记忆集成，自动保存 checkpoint 到 AgentCore 记忆，实现有状态会话和工作流恢复——无需管理 DynamoDB 表或实现自定义序列化逻辑。

### 可观测性

AgentCore 内置 CloudWatch 和 AWS X-Ray 集成，捕获 Agent 执行轨迹、工具调用和性能指标，结合 LangGraph 的 OpenTelemetry events 提供端到端可见性。

### LangGraph 有向图状态管理

LangGraph 管理所有 Agent 之间的状态共享，通过 checkpoint 系统提供人机协同交互和故障恢复能力。文章演示了如何定义 Agent 节点之间的有向图数据流。

## 互补角度

本文在现有 [LangGraph 状态机](ch04/266-langgraph.html) 和 [Strands Agents](ch04/765-strands-agents.html) 知识基础上贡献了以下独特角度：

1. **LangGraph + Strands + AgentCore 三件套组合**：现有实体分别覆盖 LangGraph 和 Strands，但本文演示了两者结合部署在 AgentCore 上的完整方案
2. **金融领域应用**：市场监控/合规场景的多 Agent 系统设计
3. **AgentCore Memory 深度集成**：通过 `langgraph-checkpoint-aws` 包将 LangGraph checkpoint 持久化到 AgentCore
4. **记忆存储（MemoryStore）**：AgentCore 自动从对话中提取洞察、摘要和用户偏好，支持跨会话检索
5. **可观测性体系**：CloudWatch + X-Ray + OpenTelemetry 三合一

## 相关实体

- [LangGraph 底层原理](ch04/266-langgraph.html)
- [Strands Agents](ch04/765-strands-agents.html)
- [AgentCore Harness](ch04/759-agentcore-harness.html)
- [Building web search agents with Strands and Exa](ch04/557-building-web-search-enabled-agents-with-strands-and-exa.html)
- [Deep Agents 子 Agent 编排](ch04/604-agent-orchestration.html)
- [Evaluating AI agents production blueprint](ch04/430-ai-agent.html)
- [AgentCore Gateway MCP](ch04/643-amazon-bedrock-agentcore.html)
- [Multi-Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)
- [Multi-Agent Collaboration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/market-surveillance-agent-with-langgraph-and-strands-on-agen.md)

---

