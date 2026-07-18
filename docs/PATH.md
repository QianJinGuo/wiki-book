# Agent 领域从入门到大师学习路径

> 目标：从 Agent 初学者成长为能做工程落地、能过高质量面试、能设计生产系统、能读前沿论文、能形成个人方法论的 Agent 领域高手。
> 方法：以本仓库 `docs/` 中的章节、实体（entity）和原文（raw）为主线，采用"读实体 → 查 raw → 复述 → 实作 → 评估 → 作品集"的闭环。

> **环境选择**：raw 文章链接采用 `{{BASE_URL}}` 占位符，构建/发布时自动替换为对应域名。
> - Docker 构建: `http://localhost:8002`
> - GitHub Pages: `https://wiki.jinguo.tech`  
> - Cloudflare Pages: `https://jinguo.tech`

---

## 0. 先定方向：你要成为哪一类 Agent 人才

Agent 方向不是单一岗位。学习前先明确你要同时构建四种能力：

| 能力层 | 对应岗位 | 你最终要能做什么 |
|---|---|---|
| Agent 应用工程 | AI Application Engineer / Agent Engineer | 用 LLM、工具、RAG、工作流做可用产品 |
| Agent 平台工程 | Agent Infra / AI Platform Engineer | 做运行时、沙箱、多租户、观测、成本治理 |
| Data Agent / Talk to Data | Data AI Engineer / Analytics Agent Engineer | 做 NL2SQL、指标语义层、业务问数、数据闭环 |
| Agent 研究与优化 | Applied Scientist / Research Engineer | 做评测、记忆、工具学习、自进化、RL/后训练 |

本路径默认你要成为“T 型人才”：  
**横向懂完整 Agent 系统，纵向重点深挖 Agent Runtime + RAG/Talk-to-data + Harness/Eval。**

---

## 1. 总体路线图

| 阶段 | 时间建议 | 身份目标 | 核心问题 | 产出物 |
|---|---:|---|---|---|
| Level 0 准备期 | 1 周 | 学习者 | 如何用 wiki-book 高效学习？ | 学习表、术语卡、每周复盘模板 |
| Level 1 入门 | 4-6 周 | Agent 初学者 | Agent 到底是什么，不是什么？ | 术语图谱、最小 CLI Agent |
| Level 2 工程师 | 8-12 周 | Agent 工程师 | 怎样让 Agent 稳定执行任务？ | 工具调用 Agent、RAG Agent、Talk-to-data Agent |
| Level 3 专家 | 12-20 周 | 生产级工程师 | 怎样上生产、可观测、可评估、可治理？ | 生产级 Harness、Eval、Sandbox、成本面板 |
| Level 4 科学家 | 20-32 周 | 研究型工程师 | 怎样让 Agent 学会改进自己？ | 自进化实验、论文复现、benchmark 报告 |
| Level 5 大师 | 长期 | 领域大师 | 怎样形成思想、影响社区、拿到顶级 offer？ | 开源项目、技术博客、系统设计作品集 |

---

## 2. wiki-book 的正确使用方式

### 2.1 三遍阅读法

1. **第一遍读章节导读和实体摘要**：建立概念边界，不追求细节。
2. **第二遍读关键 entity**：写出“问题、方案、架构、风险、指标”五段笔记。
3. **第三遍读 raw 原文**：只读最核心的 raw，验证 entity 是否准确，补充一手语境。

### 2.2 每个实体都要做 5 张卡

| 卡片 | 你要写什么 |
|---|---|
| 概念卡 | 这个实体解决什么问题？一句话定义是什么？ |
| 架构卡 | 输入、处理、状态、工具、输出、评估分别是什么？ |
| 失败卡 | 它会在哪些场景失败？失败信号是什么？ |
| 面试卡 | 面试官会怎么问？你的 2 分钟答案是什么？ |
| 实作卡 | 如何把它变成一个小 demo 或模块？ |

### 2.3 用 RAG 和 Talk-to-data 辅助学习

如果你的 wiki-book RAG / Talk-to-data 功能可用，每周固定做三件事：

1. **RAG 问答**：问“某概念在 Ch04/Ch05/Ch10 中有什么共同点和差异？”要求回答带引用。
2. **Talk-to-data 建表**：把本路径中的实体做成表，字段包括 `阶段、章节、entity、raw、掌握状态、复述得分、项目关联`。
3. **自动出题**：让系统基于实体生成 10 道系统设计题、10 道行为题、10 道实现题。

---

## 3. Level 1：入门期，先把概念边界打牢

### 3.1 目标

你要能清楚回答：

- Model、Agent、Scaffolding、Harness、Tool、Skill、Memory、Policy、Sub-agent 有什么区别？
- Agent 为什么不是“会调用工具的聊天机器人”？
- ReAct / Plan-and-Execute / Reflection / Workflow / Agent Team 分别适合什么任务？
- Prompt Engineering 和 Context Engineering 的区别是什么？

### 3.2 必读章节

| 顺序 | 章节 | 你要掌握 |
|---:|---|---|
| 1 | `docs/ch01-ai-basics.md` | Token、Embedding、Attention、推理成本、模型能力边界 |
| 2 | `docs/ch02-prompt.md` | Prompt、Few-shot、CoT、Context Engineering |
| 3 | `docs/ch03-ai-tools.md` | AI 工具生态、Claude Code、Cursor、OpenClaw、Agent 平台 |
| 4 | `docs/ch04-agent-core.md` | Agent 核心架构、Runtime、循环、工具、任务执行 |

### 3.3 必读 entity / raw

| 主题 | entity | raw |
|---|---|---|
| Agent 术语表 | [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/030-ai-agent.html) | [{{BASE_URL}}/raw/articles/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent]({{BASE_URL}}/raw/articles/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent)|
| 从 Vibe Coding 到 Agentic Engineering | [Karpathy Vibe Coding Agentic Engineering V4](ch04/125-karpathy-vibe-coding-agentic-engineering.html) | [{{BASE_URL}}/raw/articles/karpathy-vibe-coding-agentic-engineering-v4]({{BASE_URL}}/raw/articles/karpathy-vibe-coding-agentic-engineering-v4)|
| AI Agent 工程师能力地图 | [Ai Agent Engineer Capability Map](ch04/149-ai-agent.html) | [{{BASE_URL}}/raw/articles/ai-agent-engineer-learning-roadmap-backend-2026]({{BASE_URL}}/raw/articles/ai-agent-engineer-learning-roadmap-backend-2026)|
| 250 行 CLI Agent | [Minimal Cli Agent 250 Line Python Ollama 7 Stages](ch04/086-ai-agent-250-while-python-ollama-cli-agent-7.html) | [{{BASE_URL}}/raw/articles/minimal-cli-agent-250-line-python-ollama-7-stages]({{BASE_URL}}/raw/articles/minimal-cli-agent-250-line-python-ollama-7-stages)|
| Agent Runtime 7 大职责 | [Agent Runtime 7 Responsibilities Secondcurve 2026](ch04/104-agent-agent-runtime-7-3-langgraph-openai-agents-s.html) | [{{BASE_URL}}/raw/articles/agent-runtime-7-responsibilities-secondcurve-2026]({{BASE_URL}}/raw/articles/agent-runtime-7-responsibilities-secondcurve-2026)|
| Design Patterns for AI Agents | [Design Patterns For Ai Agents 2026](ch04/093-design-patterns-for-ai-agents-2026-4-5-reflection.html) | 先读实体页：`docs/ch04/083-design-patterns-for-ai-agents-2026-4-5-reflection.md` |
| 从零设计准生产级 LLM Agent | [Thinkingagent From Scratch Reliability Context Recovery 2026 06 02](ch04/099-llm-agent-thinkingagent.html) | [{{BASE_URL}}/raw/articles/thinkingagent-from-scratch-reliability-context-recovery-2026-06-02]({{BASE_URL}}/raw/articles/thinkingagent-from-scratch-reliability-context-recovery-2026-06-02)|

### 3.4 入门期作业

#### 作业 A：画一张 Agent 总架构图

必须包含：

- 用户输入
- Planner / Controller
- LLM
- Tool Registry
- Memory
- Policy / Permission
- Evaluator
- Observability
- Human-in-the-loop

#### 作业 B：实现最小 Agent

实现一个 250 行以内的 CLI Agent：

- 支持 `read_file`
- 支持 `write_file`
- 支持 `run_command`
- 支持工具调用日志
- 支持最大循环次数
- 支持用户确认危险操作

#### 作业 C：写 10 个术语解释

每个术语用 100 字解释，并写一个反例：

- Agent
- Harness
- Scaffolding
- Runtime
- Tool
- Skill
- MCP
- Memory
- Context
- Policy

### 3.5 入门期验收

你通过本阶段的标准：

- 能用 5 分钟讲清楚 Agent 与普通 Chatbot 的区别。
- 能从零写出一个最小工具调用循环。
- 能指出一个 demo Agent 为什么不能上生产。
- 能解释“模型决定能力上限，Harness 决定生产下限”这句话。

---

## 4. Level 2：工程师期，开始构建能工作的 Agent 系统

### 4.1 目标

你要从“懂概念”进入“会做系统”：

- 会设计 Tool / Skill / MCP 选型。
- 会做 RAG，不只是向量库拼接。
- 会做 Talk-to-data，不只是让模型生成 SQL。
- 会做长期任务循环、状态管理、失败恢复。
- 会用 Claude Code / OpenClaw / Codex 类工具提升真实开发效率。

### 4.2 工程师期主线模块

| 模块 | 必读章节 | 核心掌握 |
|---|---|---|
| Agent Core | `docs/ch04-agent-core.md` | Runtime、Loop、Planner、Reflection、控制流 |
| Harness | `docs/ch05-harness.md` | Loop、Workflow、状态、刹车、验证、交接 |
| Memory | `docs/ch06-memory.md` | 短期/长期/工作记忆、写入纪律、读取策略 |
| Skill / Tool / MCP | `docs/ch07-skill-tool.md` | Tool 设计、Skill 资产化、MCP 边界 |
| Multi-Agent | `docs/ch08-multi-agent.md` | Sub-agent、Agent Team、通信、上下文隔离 |
| AI Coding | `docs/ch09-ai-coding.md` | 编程 Agent、代码库理解、质量门禁 |
| RAG | `docs/ch10-rag.md` | Chunk、Embedding、Hybrid Search、Rerank、KG、Ontology |
| Data | `docs/ch14-data.md` | 数据管道、指标、语义层、数据质量 |

### 4.3 Harness 精读清单

| 主题 | entity | raw |
|---|---|---|
| Loop Engineering 总论 | [Loop Engineering Addy Osmani Challengehub](ch05/003-loop-engineering-19-addy-osmani-boris-cherny-pete.html) | [{{BASE_URL}}/raw/articles/loop-engineering-addy-osmani-challengehub]({{BASE_URL}}/raw/articles/loop-engineering-addy-osmani-challengehub)|
| Harness Engineering 综合论述 | [Harness Engineering Paradigm Comprehensive 2026](ch05/005-harness-engineering-2026-ecc.html) | [{{BASE_URL}}/raw/articles/harness-engineering-2026-rahul-rauhul]({{BASE_URL}}/raw/articles/harness-engineering-2026-rahul-rauhul)|
| 长周期 Agent / Ralph Loop | [Long Running Agent Ralph Loop Handover Harness Ruofei](ch05/013-agent-ralph-loop-harness.html) | [{{BASE_URL}}/raw/articles/long-running-agent-ralph-loop-handover-harness-ruofei]({{BASE_URL}}/raw/articles/long-running-agent-ralph-loop-handover-harness-ruofei)|
| Agent Harness 生产指南 | [Agent Production Harness Engineering](ch05/039-agent-harness.html) | [{{BASE_URL}}/raw/articles/harness-production-agent-engineering-deficit]({{BASE_URL}}/raw/articles/harness-production-agent-engineering-deficit)|
| 生产级 Harness 12 组件 | [Production Harness 12 Components Framework Comparison](ch05/035-harness-12.html) | [{{BASE_URL}}/raw/articles/production-harness-12-components-framework-comparison]({{BASE_URL}}/raw/articles/production-harness-12-components-framework-comparison)|
| 10 步路线图 + 8 失败模式 | [Harness Engineering 10 Step Practical Guide 2026](ch05/065-harness-engineering-10-8-checklist-15.html) | [{{BASE_URL}}/raw/articles/harness-engineering-10-step-practical-guide-2026]({{BASE_URL}}/raw/articles/harness-engineering-10-step-practical-guide-2026)|
| 100% Cache 命中的 Agent 设计 | [Openclacky Harness Engineering 100 Percent Cache Hit](ch05/111-harness-100-cache-agent.html) | [{{BASE_URL}}/raw/articles/openclacky-harness-engineering-100-percent-cache-hit]({{BASE_URL}}/raw/articles/openclacky-harness-engineering-100-percent-cache-hit)|
| Better-Harness | [Better Harness Eval Trace Methodology](ch05/122-better-harness-agent-harness.html) | 先读实体页：`docs/ch05/085-better-harness-agent-harness.md` |

### 4.4 Memory 精读清单

| 主题 | entity | raw |
|---|---|---|
| Agent Memory 架构 | [Agent Memory Architecture Past Influence Future Ruofei](ch04/121-agent-memory.html) | 先读 `docs/ch06-memory.md` |
| Hermes Agent 记忆系统 | [Hermes Agent Memory System Openclaw Comparison](ch04/114-hermes-agent.html) | [{{BASE_URL}}/raw/articles/hermes-agent-memory-system-openclaw-comparison]({{BASE_URL}}/raw/articles/hermes-agent-memory-system-openclaw-comparison)|
| AgentMemory 源码分析 | [Agentmemory Source Analysis Coding Agent Local Memory](ch09/047-coding-agent.html) | [{{BASE_URL}}/raw/articles/agentmemory-source-analysis-coding-agent-local-memory]({{BASE_URL}}/raw/articles/agentmemory-source-analysis-coding-agent-local-memory)|
| Claude Code vs OpenClaw Memory | [Claude Code Openclaw Memory Comparison](ch09/085-claude-code.html) | [{{BASE_URL}}/raw/articles/claude-code-openclaw-memory-comparison]({{BASE_URL}}/raw/articles/claude-code-openclaw-memory-comparison)|
| Memory 评测全景 | [Agent Memory Evaluation Landscape Taobao Survey](ch04/121-agent-memory.html) | [{{BASE_URL}}/raw/articles/agent-memory-evaluation-landscape-taobao-survey]({{BASE_URL}}/raw/articles/agent-memory-evaluation-landscape-taobao-survey)|
| State of Memory in Agent Harness | [State Of Memory In Agent Harness Mem0 2026](ch04/140-state-of-memory-in-agent-harness-mem0-harness.html) | [{{BASE_URL}}/raw/articles/state-of-memory-in-agent-harness-mem0-2026]({{BASE_URL}}/raw/articles/state-of-memory-in-agent-harness-mem0-2026)|

### 4.5 Skill / Tool / MCP 精读清单

| 主题 | entity | raw |
|---|---|---|
| Skill Hub 组织资产化 | [Skill Hub Organization Asset Winty](ch07/001-skill-hub-ai-winty-q-3-4-6.html) | [{{BASE_URL}}/raw/articles/skill-hub-organization-asset-winty]({{BASE_URL}}/raw/articles/skill-hub-organization-asset-winty)|
| Skill 设计模式 | [Skill Design Patterns](ch07/002-skill.html) | [{{BASE_URL}}/raw/articles/anthropic-14-skill-patterns-best-practices]({{BASE_URL}}/raw/articles/anthropic-14-skill-patterns-best-practices)|
| Workflow Skill 写法 | [Skill Writing Patterns Best Practices](ch07/003-skill-7-skill.html) | [{{BASE_URL}}/raw/articles/skill-writing-patterns-best-practices]({{BASE_URL}}/raw/articles/skill-writing-patterns-best-practices)|
| 企业级 Skill 8 块骨架 | [Skill Design Spec 8 Block Checklist Winty](ch07/004-skill-8-8-checklist.html) | [{{BASE_URL}}/raw/articles/skill-design-spec-8-block-checklist-winty]({{BASE_URL}}/raw/articles/skill-design-spec-8-block-checklist-winty)|
| Claude Code Skills / MCP / Rules 源码 | [Claude Code Skills Mcp Rules Source Analysis](ch07/006-claude-code-skills-mcp-rules.html) | [{{BASE_URL}}/raw/articles/claude-code-skills-mcp-rules-source-analysis]({{BASE_URL}}/raw/articles/claude-code-skills-mcp-rules-source-analysis)|
| 三层 Agent 架构 | [Baidu Netdisk Three Layer Agent Architecture](ch07/026-agent-skill-subagent-agent-team.html) | [{{BASE_URL}}/raw/articles/baidu-netdisk-kmp-migration-three-layer-agent-architecture]({{BASE_URL}}/raw/articles/baidu-netdisk-kmp-migration-three-layer-agent-architecture)|
| CLI / MCP / CLI+Skill 选型 | [Cli Mcp Skill Architecture Decision Vibecoder](ch07/037-cli-mcp-cli-skill.html) | [{{BASE_URL}}/raw/articles/cli-mcp-skill-architecture-decision-vibecoder]({{BASE_URL}}/raw/articles/cli-mcp-skill-architecture-decision-vibecoder)|
| Skill 版本管理 | [Skill Version Management Semantic Versioning Practices Winty](ch07/048-skill.html) | [{{BASE_URL}}/raw/articles/skill-version-management-semantic-versioning-practices-winty]({{BASE_URL}}/raw/articles/skill-version-management-semantic-versioning-practices-winty)|
| Anthropic 12 个 MCP 模式 | [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](ch07/059-anthropic-agent-12-mcp.html) | [{{BASE_URL}}/raw/articles/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2]({{BASE_URL}}/raw/articles/anthropic-官方生产级-agent-最佳实践12-个可复用的-mcp-设计模式-v2)|
| Microsoft Agent Framework Tools | [Microsoft Agent Framework Tools Overview Provider Matrix](ch07/081-microsoft-agent-framework-tools-4-provider-tool-ap.html) | [{{BASE_URL}}/raw/articles/microsoft-agent-framework-tools-overview-provider-matrix]({{BASE_URL}}/raw/articles/microsoft-agent-framework-tools-overview-provider-matrix)|

### 4.6 RAG 精读清单

| 主题 | entity | raw |
|---|---|---|
| RAG 到知识图谱到本体论 | [向量库是Rag的前菜知识图谱是答案本体论是灵魂](ch01/1089-rag.html) | [{{BASE_URL}}/raw/articles/向量库是rag的前菜知识图谱是答案本体论是灵魂]({{BASE_URL}}/raw/articles/向量库是rag的前菜知识图谱是答案本体论是灵魂)|
| Google Agentic RAG 5 阶段 | [Ai Cambrian Google Agentic Rag Sufficient Context Cross Corpus 20260606](ch04/117-google-agentic-rag-5.html) | [{{BASE_URL}}/raw/articles/ai-cambrian-google-agentic-rag-sufficient-context-cross-corpus-20260606]({{BASE_URL}}/raw/articles/ai-cambrian-google-agentic-rag-sufficient-context-cross-corpus-20260606)|
| Protocol H 分层 Agentic RAG | [Protocol H Hierarchical Agentic Rag Enterprise](ch04/090-protocol-h-agentic-rag.html) | [{{BASE_URL}}/raw/articles/protocol-h-hierarchical-agentic-rag-enterprise]({{BASE_URL}}/raw/articles/protocol-h-hierarchical-agentic-rag-enterprise)|
| Chroma 到 Qdrant 迁移 | [Chroma To Qdrant 1M Vector Migration](https://github.com/QianJinGuo/wiki/blob/main/entities/chroma-to-qdrant-1m-vector-migration.md) | [{{BASE_URL}}/raw/articles/chroma-to-qdrant-1m-vector-migration]({{BASE_URL}}/raw/articles/chroma-to-qdrant-1m-vector-migration)|
| RAG vs LLM Wiki | `docs/ch01/037-rag-vs-llm-wiki.md` | 先读实体页 |

### 4.7 Talk-to-data / Data Agent 精读清单

| 主题 | entity | raw |
|---|---|---|
| Anthropic 95% 数据分析自动化 | [Anthropic 95Pct Data Analysis Skill Stack Architecture](ch09/008-anthropic-95-agent-skill-21-95.html) | [{{BASE_URL}}/raw/articles/anthropic-95pct-data-analysis-skill-stack-architecture]({{BASE_URL}}/raw/articles/anthropic-95pct-data-analysis-skill-stack-architecture)|
| Data Agent 产品设计 | [Data Agent Product Design](ch04/625-data-agent.html) | [{{BASE_URL}}/raw/articles/volcengine-data-agent-product-overview]({{BASE_URL}}/raw/articles/volcengine-data-agent-product-overview)|
| 智能问数 Agent | [Data Agent Product Design](ch04/625-data-agent.html) | [{{BASE_URL}}/raw/articles/volcengine-data-agent-intelligent-query-agent]({{BASE_URL}}/raw/articles/volcengine-data-agent-intelligent-query-agent)|
| 营销策略 Agent | [Data Agent Product Design](ch04/625-data-agent.html) | [{{BASE_URL}}/raw/articles/volcengine-data-agent-marketing-strategy-agent]({{BASE_URL}}/raw/articles/volcengine-data-agent-marketing-strategy-agent)|
| TiDB Cloud Agent-native Database | [Tidb Cloud Agent Database](ch11/077-tidb-cloud-agent-native-kimi-k2-6.html) | [{{BASE_URL}}/raw/articles/kimi-k2-tidb-agent-database-huangdongxu-20260513]({{BASE_URL}}/raw/articles/kimi-k2-tidb-agent-database-huangdongxu-20260513)|
| ClickHouse 大规模摄取 | [Clickhouse Ingestion At Scale An Open Source Zepto Engineering Story](https://github.com/QianJinGuo/wiki/blob/main/entities/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story.md) | [{{BASE_URL}}/raw/articles/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story]({{BASE_URL}}/raw/articles/clickhouse-ingestion-at-scale-an-open-source-zepto-engineering-story)|
| Kafka × Iceberg 零 ETL | [Aliyun Kafka Iceberg Zero Etl Architecture Subtraction 2026 06 18](ch01/966-20.html) | [{{BASE_URL}}/raw/articles/aliyun-kafka-iceberg-zero-etl-architecture-subtraction-2026-06-18]({{BASE_URL}}/raw/articles/aliyun-kafka-iceberg-zero-etl-architecture-subtraction-2026-06-18)|

### 4.8 工程师期必须完成的 4 个项目

#### 项目 1：Personal RAG Agent

功能：

- 读取 `docs/` 中指定章节。
- 支持 chunk、embedding、hybrid search、rerank。
- 回答必须带引用。
- 支持“找不到就拒答”。

验收：

- 20 个固定问题，准确率 >= 85%。
- 所有回答至少引用 2 个来源。
- 随机加入无关问题时能拒答。

#### 项目 2：Talk-to-data Agent

功能：

- 输入自然语言问题。
- 识别指标、维度、过滤条件、时间范围。
- 生成 SQL。
- 执行前解释 SQL。
- 加入 SQL 安全校验。
- 输出表格、解释、下一步建议。

必须实现：

- 语义层：指标字典、维度字典、同义词。
- Schema linker：业务词到表字段映射。
- SQL verifier：禁止写操作、禁止全表大扫、限制行数。
- Result interpreter：解释结果，不夸大结论。
- Eval set：至少 50 条自然语言问题 + 标准 SQL 或标准结果。

验收：

- 简单查询准确率 >= 90%。
- 多表 join 准确率 >= 75%。
- 危险 SQL 拦截率 100%。
- 不确定问题能主动澄清。

#### 项目 3：Tool / Skill Agent

功能：

- 设计 3 个工具：搜索、文件、命令。
- 设计 3 个 Skill：代码审查、文档总结、数据分析。
- 每个 Skill 包含说明、输入输出、边界、测试用例。

验收：

- 每个 Skill 有 10 条测试。
- Skill 版本号、变更记录、回滚策略齐全。
- 工具调用日志可追踪。

#### 项目 4：Long-running Agent Harness

功能：

- 任务拆解。
- 进度持久化。
- 错误恢复。
- 人类接管。
- 预算控制。
- 评估报告。

验收：

- 能连续跑 1 小时任务不中断。
- 中途 kill 后可恢复。
- 每一步都有日志、成本、输入输出。
- 能给出最终 evidence report。

---

## 5. Level 3：专家期，做生产级 Agent

### 5.1 目标

你要能把 Agent 从 demo 变成系统：

- 会做多租户部署。
- 会做沙箱和凭据隔离。
- 会做安全与审计。
- 会做 eval、trace、成本、质量闭环。
- 会设计企业级 RAG / Data Agent 架构。

### 5.2 生产部署与 Infra 精读清单

| 主题 | entity | raw |
|---|---|---|
| Firecracker + Bedrock AgentCore 多租户 | [Firecracker Bedrock Agentcore Multi Tenant](ch11/008-firecracker-microvm-bedrock-agentcore-ai-agent.html) | [{{BASE_URL}}/raw/articles/firecracker-bedrock-agentcore-multi-tenant]({{BASE_URL}}/raw/articles/firecracker-bedrock-agentcore-multi-tenant)|
| OpenClaw 迁移 AgentCore Serverless | [Using Amazon Bedrock Agentcore Openclaw Multi 2](ch11/013-aws-openclaw-amazon-bedrock-agentcore-serverless.html) | [{{BASE_URL}}/raw/articles/using-amazon-bedrock-agentcore-openclaw-multi-2]({{BASE_URL}}/raw/articles/using-amazon-bedrock-agentcore-openclaw-multi-2)|
| OpenClaw on Kubernetes | [Build Multi Tenant Ai Agent On Eks Graviton Openclaw K8S Practice](ch11/052-amazon-eks-graviton-ai-agent-openclaw-on-kubernetes.html) | 先读实体页：`docs/ch11/049-amazon-eks-graviton-ai-agent-openclaw-on-kubernetes.md` |
| LiteLLM 成本治理 | [Litellm Amazon Bedrock Cost Control Four Layer](ch11/042-litellm-amazon-bedrock.html) | [{{BASE_URL}}/raw/articles/通过-litellm-实现-amazon-bedrock-成本管控实时限额多维监控与平台级兜底]({{BASE_URL}}/raw/articles/通过-litellm-实现-amazon-bedrock-成本管控实时限额多维监控与平台级兜底)|
| AgentCore 质量优化飞轮 | [Aws Bedrock Agentcore Quality Optimization Flywheel](ch11/120-aws-bedrock-agentcore-quality-optimization-flywheel.html) | [{{BASE_URL}}/raw/articles/aws-bedrock-agentcore-quality-optimization-flywheel]({{BASE_URL}}/raw/articles/aws-bedrock-agentcore-quality-optimization-flywheel)|
| 企业级 OpenClaw 安全部署 | [Enterprise Openclaw Security Deploy Architecture Guide](ch11/086-openclaw-aws.html) | 先读实体页：`docs/ch11/085-openclaw-aws.md` |

### 5.3 安全治理精读清单

| 主题 | entity | raw |
|---|---|---|
| OpenClaw 安全增强 | [Openclaw Security And Feature Enhancement Practices](ch12/027-openclaw.html) | [{{BASE_URL}}/raw/articles/openclaw-security-and-feature-enhancement-practices]({{BASE_URL}}/raw/articles/openclaw-security-and-feature-enhancement-practices)|
| OpenClaw Security Roadmap | [Where Openclaw Security Is Heading Openclaw Blog](ch12/032-where-openclaw-security-is-heading-openclaw-blog.html) | [{{BASE_URL}}/raw/articles/where-openclaw-security-is-heading-openclaw-blog]({{BASE_URL}}/raw/articles/where-openclaw-security-is-heading-openclaw-blog)|
| AI Agent 机器身份安全 | [1Password Securing Ai Agents Machine Identities](ch12/045-securing-ai-agents-and-machine-identities.html) | [{{BASE_URL}}/raw/articles/1password-securing-ai-agents-machine-identities]({{BASE_URL}}/raw/articles/1password-securing-ai-agents-machine-identities)|
| Autonomous Vulnerability Hunting with MCP | [Bullyingllms](ch12/056-autonomous-vulnerability-hunting-with-mcp.html) | [{{BASE_URL}}/raw/articles/bullyingllms]({{BASE_URL}}/raw/articles/bullyingllms)|
| AI Detection and Response | [Ai Detection And Response Aidr A Zero Impact Operating Model](ch12/077-ai-detection-and-response-aidr-a-zero-impact-operating-model.html) | [{{BASE_URL}}/raw/articles/ai-detection-and-response-aidr-a-zero-impact-operating-model]({{BASE_URL}}/raw/articles/ai-detection-and-response-aidr-a-zero-impact-operating-model)|
| LLMReaper 对话窃取攻击 | [Llmreaper Dom Conversation Exfiltration](ch12/091-llmreaper.html) | [{{BASE_URL}}/raw/articles/llmreaper-dom-based-ai-conversation-exfiltration-via-browser-5ee512]({{BASE_URL}}/raw/articles/llmreaper-dom-based-ai-conversation-exfiltration-via-browser-5ee512)|
| OpenSandbox 安全沙箱 | [Opensandbox Aliyun Cloud Agent Sandbox Vibecoder](ch12/107-opensandbox-agent-vault-egress-sidecar.html) | 先读实体页：`docs/ch12/119-opensandbox-agent-vault-egress-sidecar.md` |

### 5.4 评估与 MLOps 精读清单

| 主题 | entity | raw |
|---|---|---|
| AI Skill 测评报告 | [Ai Skill 测评报告解读](ch07/070-ai-skill.html) | [{{BASE_URL}}/raw/articles/ai-skill-测评报告解读]({{BASE_URL}}/raw/articles/ai-skill-测评报告解读)|
| LoongSuite GenAI 可观测语义规范 | [阿里巴巴蚂蚁 Loongsuite Genai 可观测语义规范从统一数据语言到规模化落地](ch04/441-loongsuite-genai.html) | [{{BASE_URL}}/raw/articles/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地]({{BASE_URL}}/raw/articles/阿里巴巴蚂蚁-loongsuite-genai-可观测语义规范从统一数据语言到规模化落地)|
| Agent-EvalKit | [Agent Evalkit Aws Opensource Cli Agent Eval Toolkit](ch11/025-agent-evalkit-aws-cli-agent.html) | [{{BASE_URL}}/raw/articles/evaluate-ai-agents-systematically-with-agent-evalkit]({{BASE_URL}}/raw/articles/evaluate-ai-agents-systematically-with-agent-evalkit)|
| AgentEval YAML | [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](ch04/152-agenteval-yaml-agent.html) | 先读实体页：`docs/ch04/141-agenteval-yaml-agent.md` |
| Claw-SWE-Bench | [Claw Swe Bench Harness Evaluation Benchmark Tokenrhythm](ch09/054-claw-swe-bench-harness-agent.html) | [{{BASE_URL}}/raw/articles/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm]({{BASE_URL}}/raw/articles/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm)|

### 5.5 专家期系统设计题库

你必须能白板讲清楚以下系统：

1. 设计一个企业级 RAG 系统，支持权限、更新、引用、拒答。
2. 设计一个 Talk-to-data Agent，支持多数据源、多指标、SQL 校验、澄清对话。
3. 设计一个 Coding Agent Harness，支持长任务、恢复、测试、代码审查。
4. 设计一个多租户 Agent 平台，支持沙箱、凭据隔离、成本限额。
5. 设计一个 Agent 评估平台，支持 dataset、trace、judge、regression gate。
6. 设计一个 Skill Marketplace，支持版本、灰度、质量门禁、安全审核。
7. 设计一个 Agent 安全审计系统，记录 prompt、tool call、data touched、identity。

### 5.6 专家期项目：生产级 Agent Platform

你要把 Level 2 的项目合成一个平台：

- 前端：任务提交、会话、结果、评估报告。
- Backend：Agent Runtime、Tool Registry、Skill Loader。
- Memory：短期状态、长期偏好、项目知识。
- RAG：文档检索、引用、拒答。
- Talk-to-data：语义层、NL2SQL、SQL verifier。
- Security：权限、密钥、沙箱、审计。
- Eval：离线测试、线上 trace、回归门禁。
- Observability：token、latency、cost、tool call、failure type。

验收指标：

- 100 条任务评测集。
- 5 类失败归因。
- P95 响应延迟记录。
- 单任务 token 预算。
- 关键操作可审计。
- 生产事故复盘模板。

---

## 6. Level 4：科学家期，理解模型、训练、推理和自进化

### 6.1 目标

你要从“会用 Agent”进入“理解 Agent 能力如何形成和改进”：

- 理解后训练：SFT、RLHF、DPO、GRPO、RLVR。
- 理解推理优化：KV Cache、投机解码、MoE、Prefill/Decode 分离、量化。
- 理解自进化：trace → dataset → skill → eval → selection gate。
- 能读论文并把论文变成工程实验。

### 6.2 训练与微调精读清单

| 主题 | entity | raw |
|---|---|---|
| RLHF / Post-training / ATOM | [Interconnects What Ive Been Building Atom Report Post Training Course Finishing My Book And On](ch09/034-ai.html) | [{{BASE_URL}}/raw/articles/what-ive-been-building-atom-report-post-training-course-fini]({{BASE_URL}}/raw/articles/what-ive-been-building-atom-report-post-training-course-fini)|
| NVIDIA Blackwell MLPerf Training | [Nvidia Blackwell Mlperf Training 6 0 Benchmark Results 2026 06](ch09/034-ai.html) | [{{BASE_URL}}/raw/articles/nvidia-blackwell-mlperf-training-6-0-benchmark-results-2026-06]({{BASE_URL}}/raw/articles/nvidia-blackwell-mlperf-training-6-0-benchmark-results-2026-06)|
| PRISM 并行残差迭代序列模型 | [Icml 2026 Prism Parallel Residual Iterative Sequence Model](ch01/1254-icml-2026.html) | [{{BASE_URL}}/raw/articles/icml-2026-prism-parallel-residual-iterative-sequence-model]({{BASE_URL}}/raw/articles/icml-2026-prism-parallel-residual-iterative-sequence-model)|

### 6.3 推理优化精读清单

| 主题 | entity | raw |
|---|---|---|
| Chroma → Qdrant | [Chroma To Qdrant 1M Vector Migration](https://github.com/QianJinGuo/wiki/blob/main/entities/chroma-to-qdrant-1m-vector-migration.md) | [{{BASE_URL}}/raw/articles/chroma-to-qdrant-1m-vector-migration]({{BASE_URL}}/raw/articles/chroma-to-qdrant-1m-vector-migration)|
| 实时语音推理 vLLM + SageMaker | [Build Real Time Voice Applications With Amazon Sagemaker Ai](ch09/034-ai.html) | [{{BASE_URL}}/raw/articles/build-real-time-voice-applications-with-amazon-sagemaker-ai]({{BASE_URL}}/raw/articles/build-real-time-voice-applications-with-amazon-sagemaker-ai)|
| Apple Private Inference | [Apple Siri Private Inference Cryptography Green](https://github.com/QianJinGuo/wiki/blob/main/entities/apple-siri-private-inference-cryptography-green.md) | [{{BASE_URL}}/raw/articles/apple-siri-private-inference-cryptography-green]({{BASE_URL}}/raw/articles/apple-siri-private-inference-cryptography-green)|
| Didi EAGLE-3 投机解码 | [Didi Eagle 3 Speculative Decoding Agents](ch04/123-agent-eagle-3.html) | [{{BASE_URL}}/raw/articles/didi-eagle-3-speculative-decoding-agents]({{BASE_URL}}/raw/articles/didi-eagle-3-speculative-decoding-agents)|

### 6.4 前沿研究精读清单

| 主题 | entity | raw |
|---|---|---|
| Recursive 自动化 AI 研究 | [Recursive Automated Ai Research First Steps 2026](ch09/034-ai.html) | [{{BASE_URL}}/raw/articles/recursive-automated-ai-research-first-steps-2026]({{BASE_URL}}/raw/articles/recursive-automated-ai-research-first-steps-2026)|
| NeurIPS Pangram 事件 | [Neurips 2026 Pangram Controversy](ch01/966-20.html) | [{{BASE_URL}}/raw/articles/neurips-2026-pangram-desk-reject-controversy]({{BASE_URL}}/raw/articles/neurips-2026-pangram-desk-reject-controversy)|
| Agent 自我改进六条路 | `docs/ch04/047-agent.md` | 先读实体页 |
| Hermes Agent Eval Harness | `docs/ch04/035-hermes-agent-eval-harness-skill-7-taskset-harnessadapt.md` | 先读实体页 |
| MUSE-Autoskill | `docs/ch04/046-muse-autoskill-bytebrain-agent-arxiv-2605-27366.md` | 先读实体页 |
| SkillOS | `docs/ch04/133-skillos-learning-skill-curation-for-self-evolving-agents.md` | 先读实体页 |

### 6.5 科学家期作业

#### 作业 A：复现一个评测 benchmark

选择：

- Claw-SWE-Bench
- AgentEval YAML
- Agent-EvalKit
- 自建 Talk-to-data eval set

产出：

- 数据集说明
- 指标定义
- baseline
- 改进方案
- 误差分析

#### 作业 B：做一个自进化 Skill 实验

流程：

1. 采集 50 条失败 trace。
2. 分类失败原因。
3. 抽取可复用经验。
4. 写成 Skill。
5. 对比前后通过率。
6. 做 regression gate。

#### 作业 C：写一篇论文解读

必须包含：

- 论文解决什么问题。
- 关键假设是什么。
- 实验设置是否可信。
- 能否工程落地。
- 你会如何复现。

---

## 7. Level 5：大师期，形成自己的理论和影响力

### 7.1 目标

大师不是“读得多”，而是能提出框架、发现矛盾、指导别人。

你要能做到：

- 把 Agent 系统拆成可复用范式。
- 评价一个 Agent 产品的架构优劣。
- 判断一个论文是否会变成工程趋势。
- 形成自己的开源项目和技术品牌。
- 在面试中不只是答题，而是引导讨论。

### 7.2 哲学、组织与未来精读清单

| 主题 | entity | raw |
|---|---|---|
| Vibe Design ≠ Vibe Coding | [Impeccable Vibe Design Philosophy Anomaly](ch05/001-impeccable.html) | [{{BASE_URL}}/raw/articles/impeccable-anomaly-vibe-design-vs-vibe-coding]({{BASE_URL}}/raw/articles/impeccable-anomaly-vibe-design-vs-vibe-coding)|
| Data Agent 产品设计 | [Data Agent Product Design](ch04/625-data-agent.html) | [{{BASE_URL}}/raw/articles/volcengine-data-agent-product-overview]({{BASE_URL}}/raw/articles/volcengine-data-agent-product-overview)|
| 下一代企业架构：系统 CLI 化、流程 Skill 化、员工 Agent 化 | [Enterprise Next Gen Architecture System Cli Process Skill Employee Agent Zhan](ch04/646-cli-skill-agent.html) | [{{BASE_URL}}/raw/articles/enterprise-next-gen-architecture-system-cli-process-skill-employee-agent-zhan]({{BASE_URL}}/raw/articles/enterprise-next-gen-architecture-system-cli-process-skill-employee-agent-zhan)|
| James Cowling AI 时代工程哲学 | [James Cowling Engineering Philosophy Ai Era](ch09/034-ai.html) | [{{BASE_URL}}/raw/articles/james-cowling-engineering-philosophy-ai-era]({{BASE_URL}}/raw/articles/james-cowling-engineering-philosophy-ai-era)|
| Token 经济学与 AI 效率 | [Tencent Token Economics Ai Productivity](ch12/003-token.html) | [{{BASE_URL}}/raw/articles/tencent-token-economics-ai-productivity]({{BASE_URL}}/raw/articles/tencent-token-economics-ai-productivity)|
| AI 普惠与 Token 效率门槛 | `docs/ch20-ai-philosophy.md` | 读 Ch20.009 / Ch20.011 |
| Dario Amodei AI 指数发展与政策 | `docs/ch20-ai-philosophy.md` | 读 Ch20.015 / Ch20.016 |

### 7.3 大师期三条主线

#### 主线 A：开源项目

做一个完整开源项目，建议方向：

- `agent-harness-template`：生产级 Agent Harness 模板。
- `talk-to-data-agent`：可评估的 NL2SQL Agent。
- `skill-eval-kit`：Skill 测试、版本、回归门禁工具。
- `agent-memory-workbench`：Memory 写入、读取、遗忘、审计实验台。

要求：

- README 清楚。
- 架构图清楚。
- 有 20+ 测试。
- 有 benchmark。
- 有失败案例。
- 有安全说明。

#### 主线 B：公开写作

至少写 12 篇文章：

1. Agent 不是模型，而是系统。
2. Harness 为什么比 Prompt 更重要。
3. Memory 为什么不是 RAG。
4. RAG 为什么不只是向量库。
5. Talk-to-data 的真正难点是语义层和验证。
6. Skill 是组织经验资产。
7. MCP 不是万能胶水。
8. Agent 安全从身份和权限开始。
9. Agent Eval 为什么不能只靠 LLM judge。
10. Coding Agent 的质量门禁。
11. 自进化 Agent 的评估陷阱。
12. AI 工程师如何在 Agent 时代拿 offer。

#### 主线 C：面试反向塑造能力

每月做一次模拟面试：

- 30 分钟：项目深挖。
- 30 分钟：系统设计。
- 30 分钟：代码实现。
- 30 分钟：ML / RAG / Eval。
- 30 分钟：安全与治理。

---

## 8. 面试准备宝典

### 8.1 简历必须有的 5 个作品

| 作品 | 面试官看到什么 |
|---|---|
| 最小 Agent Runtime | 你理解 Agent 的执行循环 |
| RAG 系统 | 你理解检索、引用、拒答、评估 |
| Talk-to-data Agent | 你理解数据、SQL、安全、语义层 |
| Production Harness | 你理解状态、恢复、观测、成本 |
| Eval / Benchmark | 你理解如何证明系统变好了 |

### 8.2 Agent 面试高频问题

#### 概念类

1. Agent 和 workflow 的区别是什么？
2. Agent Runtime 应该承担哪些职责？
3. Harness 和 framework 的区别是什么？
4. Tool 和 Skill 有什么区别？
5. MCP 适合什么，不适合什么？
6. Memory 和 RAG 的区别是什么？
7. 为什么长上下文不能替代 Memory？
8. Multi-agent 为什么经常失败？

#### 系统设计类

1. 设计一个客服 RAG Agent。
2. 设计一个企业知识库问答系统。
3. 设计一个 NL2SQL / Talk-to-data Agent。
4. 设计一个 Coding Agent。
5. 设计一个 Agent 沙箱。
6. 设计一个 Skill Marketplace。
7. 设计一个 Agent 评估平台。

#### 工程落地类

1. 如何处理 tool call hallucination？
2. 如何做 prompt injection 防御？
3. 如何做权限和凭据隔离？
4. 如何限制 token 成本？
5. 如何做日志和 trace？
6. 如何做失败恢复？
7. 如何判断一次 Agent 回答是否可信？

#### RAG / Data 类

1. Chunking 怎么设计？
2. Embedding 模型如何选？
3. Hybrid search 为什么重要？
4. Rerank 放在哪一层？
5. RAG 如何处理权限？
6. NL2SQL 如何防止危险 SQL？
7. Talk-to-data 如何处理业务指标歧义？
8. 如何评估 Data Agent？

### 8.3 面试回答框架

任何系统设计题都用这个结构：

1. **需求澄清**：用户、数据、权限、延迟、成本、风险。
2. **核心链路**：输入 → 理解 → 检索/工具 → 推理 → 验证 → 输出。
3. **状态设计**：session、memory、trace、artifact。
4. **安全设计**：身份、权限、沙箱、审计、注入防御。
5. **评估设计**：离线集、线上 trace、回归门禁、人工复核。
6. **扩展设计**：多租户、成本、缓存、灰度、可观测。
7. **失败模式**：列 5 个最可能失败点和补救策略。

---

## 9. 每周学习节奏

### 周计划模板

| 时间 | 任务 |
|---|---|
| 周一 | 读 2 个 entity，写概念卡 |
| 周二 | 读 1 个 raw，补充原文语境 |
| 周三 | 实现一个小功能 |
| 周四 | 写测试或 eval case |
| 周五 | 写复盘：学到了什么、哪里还不懂 |
| 周六 | 做项目集成 |
| 周日 | 模拟面试 + 下周计划 |

### 每周产出要求

- 3 张概念卡。
- 1 篇 800 字技术笔记。
- 1 个可运行 demo 或测试。
- 5 道自测题。
- 1 次复述录音或文字版。

---

## 10. 12 个月里程碑

| 月份 | 目标 | 交付物 |
|---:|---|---|
| 1 | 完成 Agent 概念入门 | 术语图谱 + 250 行 CLI Agent |
| 2 | 完成 Tool / Skill / MCP | 3 个 Skill + 工具注册中心 |
| 3 | 完成 RAG | 带引用和拒答的 RAG Agent |
| 4 | 完成 Talk-to-data | NL2SQL + SQL verifier + 50 条 eval |
| 5 | 完成 Memory | Memory store + 写入/读取/遗忘规则 |
| 6 | 完成 Harness | 长任务、恢复、观测、成本 |
| 7 | 完成 Multi-agent | Sub-agent / Agent Team 对比实验 |
| 8 | 完成安全治理 | 沙箱、凭据、审计、注入防御 |
| 9 | 完成 Eval 平台 | dataset、trace、judge、regression |
| 10 | 完成生产级平台 | 多租户 Agent Platform |
| 11 | 完成研究复现 | 自进化 Skill 或 Agent benchmark |
| 12 | 求职冲刺 | 作品集、博客、模拟面试、投递 |

---

## 11. 最终 Offer 准备清单

### 11.1 简历关键词

你的简历中应该自然出现：

- Agent Runtime
- Tool Calling
- Skill System
- MCP
- RAG
- Hybrid Search
- Reranking
- Knowledge Graph
- NL2SQL
- Semantic Layer
- Agent Memory
- Long-running Agent
- Harness Engineering
- Agent Evaluation
- LLM-as-a-Judge
- Trace / Observability
- Prompt Injection Defense
- Sandbox
- Multi-tenant Agent Platform
- Cost Governance

### 11.2 作品集结构

每个项目都按这个模板写：

1. 背景：为什么做。
2. 架构：图 + 关键模块。
3. 技术难点：至少 3 个。
4. 失败模式：至少 5 个。
5. 评估指标：准确率、延迟、成本、安全。
6. 结果：前后对比。
7. 复盘：如果重做会改什么。

### 11.3 投递岗位优先级

| 优先级 | 岗位 | 为什么适合你 |
|---:|---|---|
| 1 | Agent Engineer | 路径最匹配，作品集直接证明能力 |
| 2 | AI Application Engineer | RAG / Tool / Workflow 能力可迁移 |
| 3 | AI Platform Engineer | Harness / Eval / Observability 可加分 |
| 4 | Data AI Engineer | Talk-to-data 项目是核心竞争力 |
| 5 | Research Engineer | 需要 Level 4 之后再重点冲刺 |

---

## 12. 最重要的 20 条心法

1. Agent 不是模型，是系统。
2. Prompt 是入口，Context 才是环境。
3. Tool 越多不等于 Agent 越强。
4. Skill 是经验资产，不是提示词片段。
5. Memory 不是 RAG，Memory 是治理。
6. RAG 不是向量库，RAG 是知识管理。
7. Talk-to-data 的核心不是 SQL，而是业务语义。
8. 没有 eval 的 Agent 都是 demo。
9. 没有 trace 的 Agent 不可调试。
10. 没有权限边界的 Agent 不可上线。
11. 没有成本治理的 Agent 不可规模化。
12. Long-running Agent 的关键是可接管。
13. Multi-agent 的难点是通信和状态，不是“多开几个 Agent”。
14. Harness 的第一原则是先写刹车，再写循环。
15. 生产系统里，失败恢复比成功路径更重要。
16. LLM judge 只能辅助，不能无校准地裁决。
17. 自进化必须有 regression gate，否则会越改越差。
18. 面试时不要只讲模型，要讲系统约束。
19. Offer 来自作品集、复盘能力和系统判断力。
20. 大师不是知道更多名词，而是能把混乱变成框架。

---

## 13. 从今天开始的 7 天行动

### Day 1

- 读 `docs/ch02-prompt.md` 的 Agent 术语表实体。
- 写 10 个核心术语卡。

### Day 2

- 读 `docs/ch04/075-ai-agent-250-while-python-ollama-cli-agent-7.md`。
- 搭一个最小 CLI Agent。

### Day 3

- 读 Agent Runtime 7 大职责。
- 给你的 CLI Agent 加上日志和最大循环次数。

### Day 4

- 读 Harness 12 组件。
- 给 CLI Agent 加状态文件和失败恢复。

### Day 5

- 读 RAG 到知识图谱到本体论。
- 为 20 篇 wiki-book 文档做最小检索。

### Day 6

- 读 Data Agent 产品设计。
- 设计 Talk-to-data Agent 的语义层表。

### Day 7

- 写一篇复盘：《我理解的 Agent：模型、循环、工具、记忆、评估》。
- 做一次 30 分钟模拟面试。

---

## 14. 你作为学生，我作为老师，对你的要求

你每学一个模块，都必须交付三件东西：

1. **能讲清楚**：不用术语堆砌，用自己的话讲给非专业人士听。
2. **能做出来**：哪怕是简化版，也要可运行、可测试、可复现。
3. **能被追问**：别人问失败场景、成本、安全、评估，你不能只会说“加个模型”。

如果你坚持 12 个月，按这份路径完成项目和复盘，你不会只是“会用 Agent 工具的人”，而会成为能设计 Agent 系统的人。  
这才是拿到好 offer、长期不被工具替代、走向专家和大师的真正护城河。
