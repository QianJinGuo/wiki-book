# Amazon Bedrock AgentCore Web Search: 托管式网页搜索能力 GA

## Ch04.432 Amazon Bedrock AgentCore Web Search: 托管式网页搜索能力 GA

> 📊 Level ⭐⭐ | 6.8KB | `entities/amazon-bedrock-agentcore-web-search-ga.md`

# Amazon Bedrock AgentCore Web Search: 托管式网页搜索能力 GA

> **来源**: AWS Machine Learning Blog · Veda Raman, Kalyan Garimella · 2026-06-19

## 摘要

Amazon Bedrock AgentCore Web Search 以全托管 MCP 兼容方式为 AI Agent 提供实时网页搜索能力。底层是 Amazon 自建的数百亿文档索引，持续分钟级刷新，查询流量不离开 AWS。定价 $7/1,000 次查询。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-web-search-on-amazon-bedrock-agentcore.md)

## 核心要点

1. **解决 Agent 知识冻结问题**：Agent 的知识停留在训练时间，无法获取实时信息（股价、比分、刚发布的版本）。Web Search on AgentCore 直接解决这一结构性限制
2. **零基础设施开销**：作为 AgentCore Gateway 的 managed target/connector，Agent 通过标准 `tools/list` 发现，像其他 [MCP](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md) 工具一样调用
3. **Amazon 自建搜索索引**：非第三方搜索 API wrapper，覆盖数百亿文档，持续分钟级刷新
4. **隐私保证**：查询流量不离开 AWS 基础设施，满足数据驻留和第三方出口合规要求
5. **知识图谱 + 语义片段提取**：内置知识图谱提供高置信度事实答案；语义片段提取针对 LLM context window 优化

## 深度分析

### 技术架构

Web Search on AgentCore 的架构分三层：

**接入层**：Agent → AgentCore Gateway（IAM 或 JWT 入站认证）→ Web Search connector（AWS 服务账户）→ 查询流量保持在 AWS 内部。

**索引层**：Amazon 自建并维护的 purpose-built web index，覆盖数百亿文档。关键特性：
- **持续刷新**：新内容在分钟内被索引，确保「今天发生了什么」的回答基于今天的真实数据
- **知识图谱**：对实体查询（如「谁担任某职位」「某公司何时成立」）提供结构化高置信度回答，减少模型从片段文本推断导致的细微事实漂移
- **语义片段提取**：不返回原始 HTML 或全文，而是提取与查询语义相关的片段，针对 model context window 优化，减少 boilerplate 和导航噪声的 token 消耗

**安全层**：
- 查询不离开 AWS（数据路径端到端在 AWS 内部）
- 出站认证通过 Gateway 的 IAM service role（`bedrock-agentcore:InvokeWebSearch` on `arn:aws:bedrock-agentcore:us-east-1:aws:tool/web-search.v1`）
- 入站认证与出站认证分离（通常用 OAuth/JWT 如 Cognito）
- Gateway role 不包含 `bedrock:InvokeModel`——模型访问属于运行 Agent 的身份

### 接入方式

```python
import boto3

gateway_client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")

gateway_client.create_gateway_target(
    gatewayIdentifier=gateway_id,
    name="web-search-tool",
    targetConfiguration={
        "mcp": {
            "connector": {
                "source": {"connectorId": "web-search"},
                "configurations": [{"name": "WebSearch", "parameterValues": {}}],
            }
        }
    },
    credentialProviderConfigurations=[
        {"credentialProviderType": "GATEWAY_IAM_ROLE"}
    ],
)
```

MCP 兼容框架（Strands、LangChain、LangGraph、CrewAI）可直接发现和调用：

```python
from strands import Agent
from strands.tools.mcp import MCPClient

with mcp_client:
    tools = mcp_client.list_tools_sync()  # WebSearch 工具自动发现
    agent = Agent(model=model, tools=tools, system_prompt=system_prompt)
    result = agent("What are the latest AI breakthroughs this week?")
```

Agent 自行判断何时需要实时信息，调用 `WebSearchTool`，返回带源引用的 grounded response。无需编写工具特定代码。

### 响应格式

返回标准 MCP `tools/call` 信封，内含 JSON 文档：

```json
{
  "results": [
    {
      "title": "2026 NBA Finals",
      "url": "https://en.wikipedia.org/wiki/2026_NBA_Finals",
      "publishedDate": "04:43AM, Wednesday, June 17 2026, PDT",
      "text": "The 2026 NBA Finals was the championship..."
    }
  ]
}
```

知识图谱观测（实体查询时可选返回）的 `title` 和 `url` 为 null，`text` 字段包含结构化键值事实。

### 与自建方案和第三方工具的对比

| 维度 | 自建 | Exa/Tavily/SerpAPI | AgentCore Web Search |
|------|------|--------------------|--------------------|
| 基础设施 | 需自建 | 需管理 API key、配额、速率限制 | 全托管，零运维 |
| 索引质量 | 取决于投入 | 第三方索引 | Amazon 自建数百亿文档 |
| 隐私 | 取决于实现 | 查询发送至第三方 | 查询不离 AWS |
| 集成 | 自行 glue | 自行解析结果格式 | MCP 原生集成 |
| 定价 | 高固定成本 | 按 API 计费 | $7/1,000 queries |

### 与 Knowledge Bases 的互补关系

AgentCore Knowledge Bases 处理企业私有数据（文档、知识库），Web Search 处理公共互联网实时信息。生产级 Agent 通常两者兼用：KB 回答「我们的文档怎么说」，Web Search 回答「世界上现在的真实情况」。

## 实践启示

1. **Agent 架构设计**：将 Web Search 作为 Agent 的「外部记忆」层，与内部 [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/retrieval-augmented-generation-rag.md) 知识库配合，形成完整的知识获取架构
2. **成本优化**：$7/1,000 queries 意味着每个问题不到 1 美分——对于需要实时信息的 Agent 场景（金融分析、新闻摘要、竞品监控），成本可控
3. **合规考量**：对数据驻留有严格要求的企业（金融、医疗、政府），AWS 内部查询路径消除了第三方数据出口的合规障碍
5. **MCP 生态价值**：作为 MCP 工具暴露意味着任何兼容 MCP 的 Agent 框架均可零代码接入——这是 MCP 协议生态的实际价值体现
5. **当前限制**：仅在 `us-east-1` 可用，多区域支持待扩展

## 相关实体

- [RAG (检索增强生成)](https://github.com/QianJinGuo/wiki/blob/main/concepts/retrieval-augmented-generation-rag.md)

---

