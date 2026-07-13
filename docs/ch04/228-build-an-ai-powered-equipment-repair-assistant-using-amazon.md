# Build an AI-Powered Equipment Repair Assistant Using Amazon Bedrock AgentCore

## Ch04.228 Build an AI-Powered Equipment Repair Assistant Using Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 10.7KB | `entities/build-an-ai-powered-equipment-repair-assistant-using-amazon-.md`

# Build an AI-Powered Equipment Repair Assistant Using Amazon Bedrock AgentCore

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-an-ai-powered-equipment-repair-assistant-using-amazon-.md)

## 摘要

AWS 发布的官方教程，演示如何使用 Amazon Bedrock AgentCore 构建面向农业重型机械维修的 AI 助手。该方案将 Strands Agents SDK、Amazon Nova 2 Lite 基础模型、Bedrock Knowledge Base（RAG）和 AgentCore Memory 组合为端到端的维修诊断系统，使现场技术人员能通过自然语言获取基于制造商文档的精准诊断建议、零件识别和维修流程指导。

## 核心要点

### 架构设计

该方案采用四层架构：

- **认证与前端层（Section A）**：Amazon Cognito 管理用户认证，AWS Amplify 托管 React Web 应用。用户通过 Cognito 认证后，前端直接与 AgentCore Runtime 端点通信
- **AgentCore Runtime 层（Section B）**：托管基于 Strands 的 Agent，暴露 `/invocations` 端点。前端使用 Cognito Bearer Token 直接调用，Agent 内部根据 payload 中的 path 字段路由请求（`/chat` 用于 AI 查询，`/issues` 用于 CRUD 操作），实现单入口点后端操作
- **AI 处理层（Section C）**：Strands Agent 使用自定义 `search_equipment_knowledge` 工具，通过 Bedrock Knowledge Base 的 `retrieve_and_generate` API 检索制造商文档。Knowledge Base 使用 Amazon OpenSearch Serverless 进行向量搜索，Amazon Titan Embeddings 进行语义匹配
- **数据与记忆层（Section D）**：DynamoDB 存储设备服务工单，AgentCore Memory 提供会话内短期记忆和跨会话长期事实持久化，CloudWatch 和 X-Ray 提供自动可观测性

### 关键技术实现

```python
@tool
def search_equipment_knowledge(query: str) -> str:
    """Search equipment manuals, parts catalogs, and repair docs."""
    response = bedrock_agent_runtime.retrieve_and_generate(
        input={"text": query},
        retrieveAndGenerateConfiguration={
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                "modelArn": f"arn:aws:bedrock:{REGION}::foundation-model/{MODEL_ID}",
            },
        },
    )
    return response.get("output", {}).get("text", "No results found.")
```

这是 Strands Agent 的核心工具定义——通过 `@tool` 装饰器声明自定义工具，封装 Bedrock Knowledge Base 的 RAG 检索能力。`retrieve_and_generate` API 同时完成检索和生成，返回带源引用的诊断响应。

### 请求流程

1. 技术人员通过 Cognito 认证登录 Web 应用
2. 提交问题到 AgentCore Runtime `/invocations` 端点
3. AgentCore 验证 Token，路由请求，检索历史上下文
4. Strands Agent 将查询发送到 Amazon Nova 2 Lite
5. 模型调用 `search_equipment_knowledge` 工具查询 Knowledge Base
6. Knowledge Base 搜索索引的设备手册，返回相关文档和源引用
7. 模型综合诊断响应，包含维修流程和零件建议
8. 响应返回给技术人员，附带源归属信息以供验证

## 深度分析

### AgentCore Runtime 的单端点架构价值

传统的 Agent 部署通常需要 API Gateway + Lambda + Bedrock Agent 等多个服务的组合，而 AgentCore Runtime 将这些能力收敛为单一端点。这不仅简化了部署流程，还降低了运维复杂度——一个 Runtime 端点同时处理 AI 查询和 CRUD 操作，内置会话管理和健康检查。对于像设备维修这类需要同时操作知识检索和工单管理的场景，这种统一入口设计显著减少了服务间的协调开销。

### RAG 在垂直领域的知识工程实践

该方案展示了一个成熟的 RAG 实施范式：将制造商手册、零件目录、维修文档等非结构化资料通过 Bedrock Knowledge Base 索引化，使用 Titan Embeddings 进行语义编码，OpenSearch Serverless 提供向量检索。关键在于文档预处理的质量——需要确保文档可搜索（非扫描图片）、使用一致的命名规范、移除不应被所有用户访问的专有信息。这揭示了 RAG 系统的核心瓶颈往往不在检索算法本身，而在上游知识工程的质量。

### 记忆分层的工程意义

AgentCore Memory 的短期/长期记忆分层设计值得深入关注。短期记忆维护诊断会话内的上下文连续性，使技术人员能追问而不必重复背景；长期记忆则持久化技术员专业领域、农户设备群信息和反复出现的故障模式。这种分层使得 Agent 能积累组织知识——某个设备型号的常见故障模式、特定技术员擅长的维修类型——从而在后续交互中提供越来越精准的建议。这是从"每次对话从零开始"到"组织记忆持续积累"的关键跨越。

### 扩展性设计的 @tool 模式

Strands Agent 的 `@tool` 装饰器模式使得能力扩展无需基础设施变更。添加新能力（库存查询、零件订购、经销商通信）只需添加新的 `@tool` 函数。这种 code-first 的开发方式降低了 Agent 迭代的门槛——开发者可以本地测试后直接部署，无需理解复杂的 Agent 编排配置。但这种便利性也带来了治理挑战：如何确保新增工具的安全边界？如何防止工具间的冲突？这需要在 `@tool` 层面引入更细粒度的权限控制。

### 企业级扩展的防护层

原文指出了从原型到生产需要补充的关键防护：Bedrock Guardrails 防止恶意输入和越域指导、CloudFront + WAF 保护 API 端点、Cognito MFA 强化认证、CloudWatch 生成式 AI 可观测性仪表盘监控错误率和延迟。这些防护层的叠加，揭示了 Agentic 系统从 demo 到生产的核心挑战不在智能本身，而在可观测性、安全性和可靠性的工程化保障。

## 实践启示

1. **知识工程先行**：RAG 系统的效果取决于文档质量，在搭建技术架构之前，先投入精力做好文档清理、命名规范和访问控制
2. **记忆架构需前瞻设计**：短期记忆解决会话连续性，长期记忆积累组织知识，二者都需要在系统上线之初就规划好存储策略和遗忘机制
3. **单端点模式降低部署复杂度**：AgentCore Runtime 的统一入口简化了前后端交互，但需注意路由逻辑的可维护性——随着工具数量增长，内部路由的清晰性至关重要
4. **可观测性从第一天嵌入**：CloudWatch + X-Ray 的自动集成意味着每次 Agent 调用都有完整追踪，这是建立信任的基础——不是事后补加，而是架构内建
5. **安全边界随能力扩展而收紧**：每添加一个 `@tool` 就意味着新的攻击面，Guardrails 和 WAF 等防护层需要同步更新

## 相关实体

- [Building Web Search Enabled Agents With Strands And Exa](ch04/431-building-web-search-enabled-agents-with-strands-and-exa.html) — Strands SDK 构建搜索 Agent 的实践
- [Enterprise Intelligent Data Query Solution Practice Based On Strands Sdk](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md) — Strands SDK 企业级数据查询方案
- [Agentcore Harness](ch04/637-agentcore-harness.html) — AgentCore 工程化实践
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](ch04/275-building-a-secure-auth-code-flow-setup-using-agentcore-gatew.html) — AgentCore 安全认证流程
- [Aws Bedrock Agentcore Doris Mcp Server](../ch11/245-aws-bedrock-agentcore.html) — AgentCore + MCP Server 集成
- [Retrieval Augmented Generation Advanced](https://github.com/QianJinGuo/wiki/blob/main/concepts/retrieval-augmented-generation-advanced.md) — RAG 高级模式
- [Agent Deployment Strategy](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md) — Agent 部署策略
- [Aws Ai Services](https://github.com/QianJinGuo/wiki/blob/main/concepts/aws-ai-services.md) — AWS AI 服务全景
- [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) — 生产级 Agent 工程

---

