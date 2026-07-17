# Airbyte Agents: A New Era for Airbyte

## Ch04.277 Airbyte Agents: A New Era for Airbyte

> 📊 Level ⭐⭐ | 9.5KB | `entities/airbyte-agents-a-new-era-for-airbyte-airbyte.md`

## 核心定位

Airbyte Agents 是 Airbyte 推出的 AI Agent 上下文层（Context Layer），被誉为公司自六年前开源首个连接器以来「最大的一步」。

## 为什么 Agents 会失败

传统观点认为 AI Agent 的瓶颈在模型本身，但作者 Michel Tricot（Airbyte CEO & Co-Founder）指出：**Frontier models 已大幅改进，真正的问题在于喂给模型的数据**。

当前数据架构的三大问题：

| 问题 | 描述 |
|------|------|
| **Data pipelines** | 为 Dashboard 和人类设计的，而非面向实时查询的自主 Agent |
| **APIs** | 一次返回单个系统的数据，Agent 在运行时拼凑上下文 |
| **MCPs** | 解决了 LLM 与 API 之间的通信问题，但继承了碎片化问题（大多只是已有 API 的薄包装） |

更根本的矛盾：传统数据接口假设调用者已经知道它想要什么。生产级 Agent 通常从更早一步开始——需要先发现哪些业务实体是相关的，才能获取最新状态或执行操作。

## 核心产品：Context Store

Airbyte Agents 的核心是 **Context Store**：一个专为 Agent 搜索优化的数据索引。它让 Agent 在发起实时调用之前，就能结构化地发现正确的客户、工单、发票、消息和记录。

**工作原理**：Agent 先在 Context Store 中跨统一业务上下文搜索，定位到相关实体后，再在需要 Acting 时从源系统获取最新状态。

## 性能收益

- **Tool calls 减少 40%**
- **Tokens 减少高达 80%**

### 与各 MCP Vendor 对比的 Token 节省

| 连接器 | Token 节省 |
|--------|-----------|
| Gong | up to 80% |
| Zendesk | up to 90% |
| Linear | up to 75% |
| Salesforce | up to 16% |

*测试场景：retrieve、list、search across Gong, Linear, Salesforce, Slack, Zendesk*

## 三种接入方式

1. **Airbyte Agent MCP** — 零代码，连接一次数据源，即可在 Claude、ChatGPT、Cursor 或任何 MCP 兼容客户端中构建和运行 Agent
2. **Agent SDK** — 为工程团队提供对 Context Store 的完整程序化控制（检索、权限、状态）
3. **Automations** — 可视化界面，在 Airbyte 内部直接构建和运行 Agent（Research Preview）

三者共享同一基础：Context Store +新一代 Airbyte 连接器（内置认证和写能力）。

## 上市状态

- **50+ 生产就绪连接器**：Salesforce、HubSpot、Zendesk、Linear、Slack 等
- **新增写能力**：Agent 可更新记录、创建工单、在系统中发消息
- 正在以每周为单位持续增加新连接器

> [!quote] 早期用户反馈
> "Airbyte Agents has massively accelerated our roadmap. What we thought would take 6+ months, we were testing in the first week of the beta program." — Nate Chambers, CPO at ORCA Analytics

## Airbyte 的战略定位

**Data Replication 是基础，Airbyte Agents 是进化**。Airbyte 明确表示不会放弃 Data Replication Engine（ETL/ELT、数据移动的开源产品），所有在数据移动上的积累（可靠扩缩容、认证处理、Schema 演化、数百种 API quirks）是 Context Store 的底层支撑。

## 与 Airbyte Data Replication 的关系

Airbyte Agents 与 Airbyte Data Replication **共用同一账号体系**，但目前两个产品有独立 Dashboard。

## 深度分析

### 1. Agent 瓶颈的范式转移：从模型到数据

Airbyte Agents 背后的核心论点是：Agent 失败的原因已经从"模型不够强"转移到了"数据架构不支持"。这个判断有深刻的实践基础——Frontier models 已经足够好，但传统数据管道（ETL dashboards 导向、API 碎片化、MCP 薄包装）是为人类设计的，不是为自主 Agent 设计的。Context Store 的出现，是在承认模型瓶颈已缓解之后，对数据基础设施发出的根本性质疑。

### 2. Token 节省数据的结构性意义

Token 节省 40-90% 不是边际优化。对于一个大型企业部署的 Agent 系统，这个差异意味着：同样的模型提供商配额可以支持 2-10 倍的实际查询量；同样的预算可以跑更多实验；更重要的是，Token 数量直接影响推理延迟和幻觉率——Token 越少，Agent 的上下文窗口越干净，推理越可靠。这是一个在数据层解决模型层问题的新思路。

### 3. 写能力是关键缺口

大多数 MCP 实现和 Agent 数据方案都只解决"读"的问题。Airbyte Agents 明确把写能力（更新记录、创建工单、发消息）作为核心功能，这彻底改变了 Agent 的行动半径——读-only Agent 只能描述工作，写-capable Agent 才能真正完成工作。这不是功能扩展，是 Agent 从"顾问"到"执行者"的本质跃迁。

### 4. Airbyte 的护城河来自六年积累

Airbyte 明确表示不放弃 Data Replication Engine，且强调"六年数据移动积累"是 Context Store 的基础。这个说法有其合理性：Context Store 的核心竞争力不在算法，而在谁能最可靠地复制和索引企业各种 SaaS 系统的数据。这需要：认证处理（数百种 API 的 OAuth、API Key 管理）、Schema 演化（业务对象结构变化时的适配）、可靠扩缩容。这些都是数据基础设施的硬功夫，不是算法团队短时间能复制的东西。

### 5. MCP 生态的结构性弱点被放大

MCP（Model Context Protocol）解决了 LLM 与 API 的通信协议问题，但没有解决数据碎片化问题——大多数 MCP 实现只是把已有 API 包装了一层协议壳。Airbyte 的思路是：与其在协议层打补丁，不如在数据层做预聚合，让 Agent 在发起 API 调用前就已经知道目标实体在哪里。这是对 MCP 架构缺陷的直接回应，也代表了 Agent 数据架构的新兴路线之争。

## 实践启示

### AI Infra 工程师：评估 Agent 数据架构时的核心问题

在选择 Agent 数据基础设施时，核心评估维度不是"连接了多少系统"，而是"Agent 发现正确实体的误触率有多低"。Context Store 解决的是 Discovery 问题，而非传输问题。如果一个数据方案不能先让 Agent 准确找到要操作的实体，任何写能力都是空的。

### 数据平台团队：复用现有 Airbyte 部署的窗口期

对于已经部署了 Airbyte Data Replication 的团队，过渡到 Airbyte Agents 的成本极低——账号体系共享、连接器可复用。这个窗口期是独特的竞争优势：竞争对手还在从零搭建数据管道，你已经开始在已有资产上跑 Agent 工作流。

### Agent 开发者：优先优化 Agent 的"发现"阶段

Airbyte 的数据表明，当 Agent 能先在 Context Store 中完成实体发现，5-6 次探索性 API 调用可以压缩到 1-2 次有针对性的操作。这意味着 Agent 开发的第一优先级应该是优化"发现"逻辑，而非花时间在调用策略上。发现做好了，工具调用的数量和质量同步提升。

### 企业架构师：Agent 数据治理必须进入议事日程

当 Agent 能读写 CRM、ERP、工单系统的数据时，数据治理问题会成倍放大：Agent 在什么权限范围内操作？谁对 Agent 的写操作负责？跨系统的数据一致性如何保证？在部署 Agent 写能力之前，这些治理问题必须先有明确答案，否则 Agent 只会加速数据损坏的速度。

### 产品经理：重新定义"AI 功能"的价值衡量标准

传统 AI 功能用"准确率"衡量，Agent 功能的衡量维度应该是：Tool calls 数量（越少越说明上下文质量高）、Token 消耗（越低越说明数据管道效率高）、任务完成率（而非模型回答质量）。Airbyte 的 40% Tool calls 减少和 80% Token 降低，是比"准确率提升 5%"更有商业价值的指标。

## 相关实体
- [Airbyte Agents](ch04/544-airbyte-agents-a-new-era-for-airbyte-airbyte.html)
- [Skillos Learning Skill Curation For Self Evolving Agents](ch04/143-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Building Ai Agents For Business Support Using Amazon Bedrock](ch04/074-building-ai-agents-for-business-support-using-amazon-bedrock.html)
- [Oz Multi Harness Cloud Agent Orchestration](ch04/491-agent-orchestration.html)
- [Skill Os Learning Skill Curation Self Evolving Agents](ch04/218-self-evolving-agents.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/airbyte-agents-a-new-era-for-airbyte-airbyte.md)

---

