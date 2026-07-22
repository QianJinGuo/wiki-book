# How to build Agents Where Data Already Lives

## Ch04.500 How to build Agents Where Data Already Lives

> 📊 Level ⭐⭐ | 5.5KB | `entities/how-to-build-agents-where-data-already-lives.md`

# How to build Agents Where Data Already Lives

## 摘要

传统 Agent 架构倾向于将数据集中到一个中心化的位置再进行处理，但这种方式在实际企业场景中面临数据搬运成本高、延迟大、合规风险突出等问题。"Where Data Already Lives" 理念主张将 Agent 部署到数据所在的位置——无论是数据库、数据湖、SaaS 平台还是边缘设备——而非反向拉取数据到 Agent 运行时。这一范式正在成为企业级 Agent 架构的主流方向。^[inferred]

## 核心要点

### 1. 数据驻留优先（Data-Locality-First）原则

数据驻留优先是该架构的核心设计原则：

- **减少数据搬运**：Agent 直接在数据源附近运行，避免 ETL 管道的额外开销和数据副本管理
- **降低延迟**：本地数据访问的延迟通常比跨网络传输低 1-2 个数量级
- **合规友好**：数据不出域天然满足 GDPR、数据主权法规等合规要求
- **成本优化**：减少数据传输带宽和存储冗余，显著降低云服务账单

### 2. 典型部署模式

Agent 可以部署在数据所在的多种位置：

| 部署位置 | 适用场景 | 代表技术 |
|----------|----------|----------|
| 数据库旁边 | 结构化查询、事务处理 | PostgreSQL + pgvector、PlanetScale |
| 数据湖/仓库 | 大规模分析、特征工程 | Databricks、Snowflake、BigQuery |
| SaaS 平台内部 | CRM/ERP 等业务系统 | Salesforce Agent、ServiceNow |
| 边缘设备 | IoT、实时推理 | NVIDIA Jetson、ONNX Runtime |
| 用户终端 | 隐私敏感、低延迟 | 本地 LLM、Browser Agent |

### 3. 技术架构要点

**连接层**：Agent 需要能够直接连接各类数据源。MCP（Model Context Protocol）和 A2A（Agent-to-Agent）协议提供了标准化的连接能力。Agent 通过 MCP Server 暴露的数据工具与数据源交互，而非直接访问原始数据。^[inferred]

**权限控制**：Agent 在数据源旁边运行时，必须继承或映射数据源原有的权限模型。粗粒度的 API Key 认证远远不够——需要行级、列级的访问控制。^[inferred]

**推理与数据分离**：虽然数据不移动，但推理可以灵活调度。Agent 的推理引擎（LLM）可以远程调用，只有数据访问层贴近数据源。这种分离模式兼顾了性能和成本。^[inferred]

### 4. 与 RAG 模式的关系

RAG（Retrieval-Augmented Generation）是数据驻留优先理念的一个特例：

- **传统 RAG**：将文档索引到向量数据库，Agent 查询向量库
- **数据驻留 RAG**：Agent 直接在原始文档存储位置进行检索，向量索引作为缓存层存在

区别在于：传统 RAG 创建了数据的副本（向量化），而数据驻留模式尽量避免副本，直接操作原始数据。^[inferred]

## 深度分析

### 企业级挑战

**数据源异构性**：企业内部数据分散在数十个系统中——关系型数据库、NoSQL、对象存储、SaaS API、消息队列。Agent 需要统一的数据访问抽象层来屏蔽这些差异。MCP 协议正在成为这个抽象层的事实标准。^[inferred]

**一致性与事务**：当 Agent 需要跨多个数据源执行操作时（例如同时更新 CRM 和 ERP），分布式事务的复杂性急剧上升。Saga 模式和事件溯源是常见的解决方案，但会增加系统复杂度。^[inferred]

**可观测性**：分布式部署的 Agent 需要端到端的可观测性。每个 Agent 实例的日志、指标和链路追踪需要汇聚到统一的监控平台。这与传统中心化架构的可观测性方案有本质区别。^[inferred]

### 与 [Claude Code Large Codebase Harness Configuration](../ch03/076-claude-code.html) 的关联

大型代码库的 Harness 配置本质上也是"让 Agent 在数据所在位置工作"的一种体现——Claude Code 直接在代码仓库中运行，而非将代码上传到远程服务。本地文件系统就是"数据所在的位置"。^[inferred]

### 与 [Building Web Search Enabled Agents With Strands And Exa](ch04/442-building-web-search-enabled-agents-with-strands-and-exa.html) 的对比

Web Search Agent 代表了另一种模式——数据不在本地，需要通过搜索 API 实时获取。这种场景下数据驻留原则不适用，但可以通过缓存和索引部分缓解延迟问题。两种模式并非对立，而是互补。^[inferred]

## 实践启示

1. **从数据目录开始**：梳理企业数据资产目录，识别高价值数据源，优先在这些位置部署 Agent
2. **MCP 优先**：优先采用 MCP 协议标准化数据访问层，避免为每个数据源编写定制连接器
3. **权限继承**：Agent 的权限模型应映射到数据源现有权限，而非重新设计一套
4. **渐进式迁移**：不必一步到位，可以先从"Agent 在数据库旁边"的简单模式开始，逐步扩展到多源场景
5. **监控前置**：从第一天起就部署可观测性基础设施，分布式 Agent 的调试远比中心化困难

## 相关实体

- [Claude Code Large Codebase Harness Configuration](../ch03/076-claude-code.html)
- [Building Web Search Enabled Agents With Strands And Exa](ch04/442-building-web-search-enabled-agents-with-strands-and-exa.html)
- [2026 Llm Rl Algorithms Deeplog Imba Ppo Dpo Grpo Marl](../ch01/880-llm.html)
- [Accelerate Llm Model Loading And Increase Context Windows Wi](../ch01/1131-accelerate-llm-model-loading-and-increase-context-windows-wi.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- 相关领域: agent, data-infrastructure, architecture

---

