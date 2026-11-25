# 用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐⭐ | 9.0KB

## 概述
用 Strands Agents SDK 构建确定性数据分析：语义层 + VQR 在 Amazon Bedrock 上的实践 by awschina on 16 4月 2026 in Artificial Intelligence Permalink Share 摘要：企业数据分析中，LLM 直接生成 SQL 面临不可复现、不可审计、不可收敛三大挑战。本文提出基于 Strands Agents SDK 和 Amazon Bedrock 的三层确定性架构：语义层将业务术语映射为标准 SQL 片段（毫秒），VQR 知识库通过反馈飞轮缓存验证查询（零 LLM 调用），Agent 层处理长尾问题。明显降低高频查询响应。 目录 01 引言 02 问题与挑战：NL2SQL 的三个核心问题 03 方案概览 04 Strands Agents SDK——为什么选它 05 语义层深入——DynamoDB 存

## 核心技术
Strands Agent SDK、Amazon Bedrock、AgentCore

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice/)

## 深度分析
### 1. NL2SQL 三大结构性矛盾：为什么"直接问数据库"在生产环境必然失败

原文把困境归因于结构性矛盾。其一是概率性输出与确定性需求的冲突：即使 temperature=0，输出也只是"大概率"相同——"本季度营收"今天 1.2 亿、明天 1.19 亿，仅因 WHERE 日期边界不同。其二是业务语义缺失："良品率"对应哪张表、什么公式只能靠推测，复合指标与隐含过滤无法从字面识别；规则塞进 System Prompt 又会在数百指标规模下膨胀失控。其三是无积累：第 1000 次查询仍从零推理，每次 2000-4000 tokens、P50 延迟 8-15 秒。结论：不能让 LLM 直接面对数据库。

### 2. 语义层：封闭域字符串匹配对向量检索的工程胜利

语义层最启发性的设计是抵抗"技术惯性"：企业核心指标仅 50-200 个、同义词集合明确，这是封闭域问题，向量检索属于过度设计——它 50-200ms 且阈值模糊，字符串匹配仅 2ms 且完全确定。实现上是 DynamoDB single-table design，关键设计 synonyms_flat 把同义词展平为字典做 O(1) 哈希查找；三步匹配（指标、维度、时间正则）全内存完成、不用 LLM，实测 97 指标 + 76 同义词单次 match() 仅 0.3-1.8ms，低两个数量级。这与 [Metric Semantic Layer How Lyft Governs And Scales Key Data Definitions](https://github.com/QianJinGuo/wiki-public/blob/main/entities/metric-semantic-layer-how-lyft-governs-and-scales-key-data-definitions.md) 的指标集中治理互为印证：准确率上限由语义层质量决定，而它可被人工审核。

### 3. VQR 飞轮：从"每次付费推理"到"知识资产沉淀"

VQR（Verified Query Repository）解决的是经济学问题：TOP 20% 的问题占 70%+ 查询量。它与问法稍变即失效的普通缓存不同：VQR 是反馈驱动、管理员审核、支持变体的知识库。飞轮五环节：LLM 生成执行（20-25 秒、5-7 次调用）→ 点赞入候选队列 → 审核写入 verified_queries → Orchestrator 先查 VQR，命中即执行 SQL、零 LLM 调用 → 报错自动 rejected 回退 Agent。三级匹配（精确哈希 → 变体 → 关键词交集，阈值 0.75）。成本是数量级差距：VQR 命中约 3 秒零成本，语义层 + Agent 约 $0.005，完整推理 $0.03-0.08；LLM 成本最终退化为长尾边际成本。原文对边界的界定同样关键：VQR 缓存的是 SQL 模板而非结果，且"匹配而非理解"——"良品率是多少"与"哪个最高"字面相近但意图不同；这是分工而非缺陷。

### 4. Strands Agents SDK 的选型逻辑：代码优先框架在确定性架构中的位置

选型标准清晰可复用：Bedrock Agents 托管方案适合标准化场景；需要精细工具编排时，代码优先的 Strands 更合适。对比 LangChain/LangGraph 的优势：原生 Bedrock 集成、轻量（核心依赖仅 boto3 + pydantic）、循环透明可断点调试、Hook 机制。Hook 解决了真实生产问题：Agent 陷入 SQL 报错循环时，BeforeToolCallEvent 强制 max_tool_calls=8 终止。@tool 让工具回归 Python 原生函数，进程内访问语义层缓存（<1ms）；SummarizingConversationManager（summary_ratio=0.4）浓缩多轮历史防止 context 溢出；模型分级（Sonnet 路由 + Haiku 执行）综合降本约 70%。多源查询时各数据源独立 Sub-agent 并行汇总，符合 [Multi Agent Systems](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md) 的分工。核心结论：[Strands Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/strands-agents.md) 是确定性架构的"胶水"而非不确定性来源——LLM 只在语义层与 VQR 均未命中的长尾被调用。

### 5. 规模化路线与"最小可行架构"哲学

规模化章节把"Demo 到生产"的失败拆成四个阶段：≤10 张表全量 Docstring 注入；10-50 张表场景分片（DynamoDB 存配置，关键词匹配避免额外调 LLM，general 兜底）；50-200 张表两阶段选表（BM25 粗选 5-10 张、零 LLM，再注入完整 Docstring）；1000+ 张表引入 Cube 等专业语义层外置。共同原则：规模化首先是架构决策问题。结论适用于 [Amap Nl2Sql Knowledge Engineering Production](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amap-nl2sql-knowledge-engineering-production.md) 等同类实践：全案没有向量数据库、没有 RAG pipeline，准确率从"依赖模型能力"变为"依赖语义层质量"——模型能力不可控，语义层质量可通过人工审核持续改进。"下一步演进"方向值得跟踪：VQR 从缓存层演进为"推理加速层"——把验证 SQL 注入 Agent Prompt 作参考样本，确定性经验与 LLM 协同而非替代，与 [Revsql Task Expertise Rl Text To Sql](https://github.com/QianJinGuo/wiki-public/blob/main/entities/revsql-task-expertise-rl-text-to-sql.md) 的任务专家化思路呼应。

## 实践启示
1. **语义层建模是关键工程**：DynamoDB 存储业务术语到 SQL 片段的映射，本质上是一个 K-V 查表。需要投入时间梳理业务术语、数据字典、指标口径。
2. **VQR 反馈飞轮**：用户对查询结果的反馈（ thumbs up/down ）驱动 VQR 持续优化。系统运行越久，命中率越高，成本越低。
3. **多数据源路由**：一个查询可能涉及多个数据库（MySQL、PostgreSQL、OpenSearch）。语义层需要知道每个业务术语对应哪个数据源。
4. **规模化路线**：从 10 张表到 1000 张表，语义层的建模成本指数增长。需要考虑半自动化建模、术语聚类等工程优化。
5. **复合指标的验证**：NPS 等复合指标需要额外的公式验证层，不能仅依赖 LLM 生成 SQL。

## 相关实体
- [基于Strands Agents SDK和Amazon Bedrock AgentCore构建商品详情图广告词审查Agent | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/product-ad-review-agent-with-strands-sdk-bedrock.md)
- [基于Strands SDK 构建的企业智能问数解决方案实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enterprise-intelligent-data-query-solution-practice-based-on-strands-sdk.md)
- [Build financial document processing with Pulse AI and Amazon Bedrock](https://github.com/QianJinGuo/wiki-public/blob/main/entities/build-financial-document-processing-with-pulse-ai-and-amazon-bedrock.md)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy.md)
- [Amazon Bedrock AgentCore 为部署可信人工智能代理增加了质量评估和策略控制 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents.md)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/strands-agents-sdk-build-analytics-layer-vqr-amazon-bedrock-practice/)

- [基于Bedrock AgentCore+Strands构建企业级智能搜索平台实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/building-enterprise-level-with-bedrock-agentcore-and-strands.md)

---

