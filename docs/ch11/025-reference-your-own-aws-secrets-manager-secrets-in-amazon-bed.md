# Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity

> 📊 Level ⭐ | 2.3KB | `entities/bedrock-agentcore-secrets-manager-identity.md`

# Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/reference-your-own-aws-secrets-manager-secrets-in-amazon-bedrock-agentcore-identity/)

## 深度分析

Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity
### 核心观点
1. sha256: 59ab9fcf9525ccb30d11b2162928a4cc0e1955d3db620fb2db6f9f07bc28ed70
# Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity
AI agents are only as powerful as the tools they can access.
2. Whether retrieving customer data from a CRM, posting updates to Slack, or querying a GitHub repository, agents need to call external APIs, and that means securely passing credentials at runtime.
3. Getting that right, without hardcoding secrets in code or exposing them in agent prompts, is one of the defining challenges of building production-ready agentic systems.
4. Amazon Bedrock AgentCore Identity meets this challenge through credential providers and a token vault that automatically create and manage a secret in AWS Secrets Manager in your account for each Outbound credential provider resource.
5. This secret contains either the API key or client secret along with the other metadata for the external identity provider.

### 关联实体

- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)

---

