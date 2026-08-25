# Govern AI Agent Tool Access: 四阶段治理成熟度框架

## Ch04.789 Govern AI Agent Tool Access: 四阶段治理成熟度框架

> 📊 Level ⭐⭐ | 2.7KB | `entities/govern-ai-agent-tool-access-four-scope-maturity.md`

# Govern AI Agent Tool Access: 四阶段治理成熟度框架

## 核心问题：谁有权访问客户数据

文章以一个反复出现的客户问题开场："**哪些 AI Agent 能访问客户数据？谁授予的？如果凭证今天泄露，暴露面是什么？**"如果组织无法在一分钟内回答，就需要治理。该框架源自 MCP 部署在企业系统中暴露的结构性失效模式。

## 五个结构性失效模式

企业 MCP 部署存在五种结构性问题：**凭证蔓延**（secrets 散落在每个本地 config）、**策略漂移**（N×M 配置静默发散）、**审计缺口**（无法回答"谁在何时调用了什么"）、**成本不透明**（支出无法归因到团队）、**影子 IT**（审查之外部署的集成）。以策略漂移为例：10 个助手连接 5 个内部 API，维护 50 套独立凭证集，每套手工配置，一处策略变更要在 50 处更新。

## 四阶段成熟度旅程

| Scope | 治理问题 | 关键技术 |
|-------|---------|---------|
| **Connect** | 一个受治理的门让 Agent 触达组织资源 | SSO 认证、集中凭证、CloudTrail 审计 |
| **Control** | 知道谁做了什么、路上清洗敏感数据 | Cedar RBAC/ABAC、PII 脱敏、3LO consent、DCR |
| **Catalog** | 团队自己发布/发现工具（含本地工具） | Registry、Resources MCP、OPA、per-tool 成本归因 |
| **Harden** | 锁死边缘、全量监控、规划失败 | 私有连接、治理仪表板、废弃流程、多区域故障转移 |

每个 Scope 独立交付价值，**只在下个痛点出现时才推进**（"matching controls to actual needs"），避免一次性构建完整网关数月才上线错误的东西。

## 与既有治理体系的关系

该框架与 [CrewAI 凭证治理](../ch03/006-agent.html) 和 [AI 网关 vs MCP 网关](../ch11/090-ai-gateways-vs-mcp-gateways-what-security-teams-need-to-kno.html) 互补，但提供了更完整的**组织级成熟度路径**（Connect→Control→Catalog→Harden）。它也呼应 [Agent 安全架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md) 中对"工具访问作为攻击面"的关注。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/govern-ai-agent-tool-access-with-amazon-bedrock-agentcore-ga.md)

---

