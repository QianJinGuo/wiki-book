# 用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客

## Ch11.208 用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 5.7KB | `entities/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice.md`

## 概述
用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 by awschina on 16 4月 2026 in Artificial Intelligence Permalink Share 摘要：企业数据分析中，LLM 直接生成 SQL 面临不可复现、不可审计、不可收敛三大挑战。本文提出基于 Strands Agents SDK 和 Amazon Bedrock 的三层确定性架构：语义层将业务术语映射为标准 SQL 片段（毫秒），VQR 知识库通过反馈飞轮缓存验证查询（零 LLM 调用），Agent 层处理长尾问题。明显降低高频查询响应。 目录 01 引言 02 问题与挑战：NL2SQL 的三个核心问题 03 方案概览 04 Strands Agents SDK——为什么选它 05 语义层深入——DynamoDB 存

## 核心技术
Strands Agent SDK、Amazon Bedrock、AgentCore

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice/)

## 深度分析
**NL2SQL 的三大生产环境挑战**是这篇实践的核心洞察：
1. **概率性输出**：即使 temperature=0，LLM 的输出也是"大概率相同"而非"确定相同"。在需要审计的财务报表场景，这不可接受。
2. **业务语义缺失**：LLM 无法理解"良品率"的业务定义。不同公司、不同团队对同一指标可能有不同计算口径，Prompt 无法穷举所有规则。
3. **无积累能力**：每次查询都从零推理，无法复用之前的正确结果。
**三层确定性架构的核心思想：**

- **语义层**：将业务术语（如"北区销售额"）映射为标准 SQL 片段。这个映射是确定性的，不是概率推断。
- **VQR（验证查询库）**：高频查询被验证后缓存。再次查询时直接返回缓存结果，零 LLM 调用。
- **Agent 层**：处理 VQR 未命中的长尾问题。
**"能不用 LLM 就不用，必须用时尽量少用"**——这是成本控制和稳定性之间的平衡艺术。

## 实践启示
1. **语义层建模是关键工程**：DynamoDB 存储业务术语到 SQL 片段的映射，本质上是一个 K-V 查表。需要投入时间梳理业务术语、数据字典、指标口径。
2. **VQR 反馈飞轮**：用户对查询结果的反馈（ thumbs up/down ）驱动 VQR 持续优化。系统运行越久，命中率越高，成本越低。
3. **多数据源路由**：一个查询可能涉及多个数据库（MySQL、PostgreSQL、OpenSearch）。语义层需要知道每个业务术语对应哪个数据源。
4. **规模化路线**：从 10 张表到 1000 张表，语义层的建模成本指数增长。需要考虑半自动化建模、术语聚类等工程优化。
5. **复合指标的验证**：NPS 等复合指标需要额外的公式验证层，不能仅依赖 LLM 生成 SQL。

## 相关实体
- [基于Strands Agents SDK和Amazon Bedrock AgentCore构建商品详情图广告词审查Agent | 亚马逊AWS官方博客](ch11/276-bedrock.html)
- [基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md)
- [Build financial document processing with Pulse AI and Amazon Bedrock](ch11/133-build-financial-document-processing-with-pulse-ai-and-amazon.html)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch04/530-amazon-bedrock-agentcore.html)
- [Amazon Bedrock AgentCore 为部署可信人工智能代理增加了质量评估和策略控制 | 亚马逊AWS官方博客](../ch04/530-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-financial-document-processing-with-pulse-ai-and-amazon-bedrock.md)

- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](ch11/050-bedrock-agentcore.html)

---

