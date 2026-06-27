# Extending MCP support for Amazon Bedrock AgentCore Gateway

## Ch11.227 Extending MCP support for Amazon Bedrock AgentCore Gateway

> 📊 Level ⭐⭐ | 3.0KB | `entities/extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md`

# Extending MCP support for Amazon Bedrock AgentCore Gateway

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/extending-mcp-support-for-amazon-bedrock-agentcore-gateway.md)

## 深度分析

Extending MCP support for Amazon Bedrock AgentCore Gateway 涉及agent领域的核心技术议题。
### 核心观点
1. Amazon Bedrock AgentCore Gateway sits between MCP servers and the clients that consume them, centralizing credential management, observability, and secure connectivity into a single trusted entry point.
2. Today, we’re extending AgentCore Gateway with new capabilities that further strengthen support for enterprise MCP deployments.
3. 0 on-behalf-of token exchange for delegated authentication.
4. For hands-on examples, visit the GitHub samples repository.
5. ## Unite MCP servers for enterprise through AgentCore Gateway
Without a centralized gateway, every MCP server that your organization builds must independently handle credentials, policy enforcement, private connectivity, and logging.

### 内容结构
- Extending MCP support for Amazon Bedrock AgentCore Gateway
- Unite MCP servers for enterprise through AgentCore Gateway
- Surface your MCP server primitives through a single gateway
- Dynamic listing for runtime flexibility
- Streaming, session management, and elicitation
- Streamable HTTP
- Session management
- Elicitation

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-268-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed/)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](/ch04-199-openclaw-完全指南/)
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/)
- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

## 相关实体

- MOC

---

