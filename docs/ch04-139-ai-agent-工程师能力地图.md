# AI Agent 工程师能力地图

## Ch04.139 AI Agent 工程师能力地图

> 📊 Level ⭐⭐ | 13.2KB | `entities/ai-agent-engineer-capability-map.md`

## 核心判断
- **Workflow-first，Agent-second** 是最务实范式
- **Context Engineering** 比 Prompt Engineering 更关键
- Memory 是架构问题，不是聊天记录回填
- 生产失败七大原因：工具随意、上下文无序、状态管理缺失、失败恢复缺失、评估集缺失、trace缺失、过度自治

## 三种系统形态
| 类型 | 特点 | 适用场景 |
|------|------|---------|
| Tool-Using Assistant | 工具调用+短链路 | 查数据/SQL助手 |
| Workflow-Driven Agent | 流程确定+模型节点 | **主流** |
| Autonomous/Multi-Agent | 高自主+长链路 | 进阶方向 |

## 六层能力体系
1. **模型能力层**：任务分层+模型路由，而非一味换更强模型
2. **上下文与知识层**：RAG = Agent外部知识供给，不只是问答
3. **记忆层**：Working/Session/Long-Term三层架构
4. **工具与协议层**：能力治理 > 工具接入
5. **编排层**：代码稳定+模型弹性+工作流边界+人工兜底
6. **生产工程层**：可观测性+评估+安全+成本

## 后端工程师机会
- 数据分析Agent（天然优势：Hive/Spark/Flink/OLAP/指标平台）
- DevOps/运维Agent（工具接入+权限控制+风险治理）
- 企业内部工具平台（Tool Gateway+MCP Server+Agent可观测性）
- 大数据+Agent交叉（实时数据流+历史案例库+数据仓库+元数据系统）

## 深度分析
### 范式转变的本质：从"调模型"到"建系统"
AI Agent不是"更高级的Prompt工程"，而是一套新的应用工程体系。对于后端/大数据工程师而言，这不是需要学习的全新领域，而是已有技能的延伸。
后端工程师每天都在处理的这些问题——请求上下文治理、中间态编排、数据契约设计、输入输出边界控制——本质上就是Agent开发中的核心问题。这个认知框架的转换至关重要。

### 六层能力体系的内在逻辑
六层能力体系不是知识点的罗列，而是有严格的依赖关系：

- **模型能力层**是基础：理解模型的能力边界决定了你如何设计任务
- **上下文与知识层**决定效果上限：RAG不是问答系统，而是Agent的外部知识供给机制
- **记忆层**是架构问题：三层架构（Working/Session/Long-Term）对应着不同的工程实现
- **工具与协议层**是治理问题：能力治理大于工具接入
- **编排层**是工程核心：Workflow-first不是保守策略，而是最务实的范式
- **生产工程层**是交付保障：可观测性、评估、安全、成本缺一不可

### 生产失败的根因分析
七大生产失败原因可以归为三类：
1. **设计层面的失败**（工具接口、上下文注入）—— 源于对模型能力边界的误解
2. **架构层面的失败**（状态管理、失败恢复）—— 源于用聊天思维做Agent开发
3. **工程层面的失败**（评估集、trace、过度自治）—— 源于缺乏工程化经验
后端工程师的天然优势在于对第二类和第三类问题有直觉性的认知，而第一类问题正是通过学习可以快速补足的。

## 实践启示
### 对资深后端/大数据工程师的建议
1. **不要从LangChain入门**：框架会变，抽象不会。先理解Agent的核心概念和工程挑战，再用框架验证。
2. **从工作流开始做Agent**：不要一开始就追求"自主智能"。先把确定流程用工作流实现，模型判断节点自然浮出水面。
3. **Context Engineering是首要技能**：把你在后端积累的请求上下文治理经验迁移过来，这比学新框架更有价值。
4. **工具抽象是核心竞争力**：把企业内部系统模型化、可观测化、可审计化，这是后端工程师的独特优势。
5. **从小场景切入**：数据分析Agent、DevOps助手比通用助手更容易验证价值、更容易迭代改进。

### 企业落地的关键路径
1. **先建可观测性**：Agent系统的调试本质上是理解模型决策过程，没有trace寸步难行
2. **先做评估体系**：没有评估集就无法迭代，prompt调优不是靠"感觉"
3. **先治理后扩展**：先建立工具权限分级、敏感操作审批，再考虑Multi-Agent扩展
4. **人工兜底是标配**：不是所有问题都要让模型自主决策，高风险操作必须有审批节点

### 技术选型的明确建议
- **框架选择**：不要把LangChain当主线。以核心抽象（LCEL）理解流程，但不要被框架绑定。
- **模型路由**：任务分层是必须的。小模型做分类/路由，中模型做常规执行，大模型做复杂推理。
- **RAG深化**：不只是检索，是外部知识供给。query rewrite、rerank、hybrid retrieval是关键技术。
- **MCP态度**：保持关注，但不要all-in。未来很长时间是混合生态。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-agent-engineer-learning-roadmap-backend-2026.md)

## ## 相关实体
- 上下文工程：三种 Agent Memory 方案对比实验

- MOC
## Related
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)

- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](/ch04-025-harness不是目的-知识才是护城河-一个ai工程交付团队的知识沉淀实践/)
- [你不知道的 Agent：原理、架构与工程实践](/ch01-505-你不知道的-agent-原理-架构与工程实践/)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](/ch01-407-告别-氛围编程-基于-harness-治理和-sdd-的团队级-ai-研发范式演进与实践/)
- [别再把上下文当聊天记录](/ch01-456-别再把上下文当聊天记录/)
- [四种 Sub Agent 模式](/ch04-302-四种-sub-agent-模式/)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](/ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布/)
- [SkillClaw](/ch04-312-阿里skillclaw-让-agent-技能在真实使用中集体进化/)
- [Agent 自我改进的六条路](/ch04-047-agent-自我改进的六条路/)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](/ch04-135-skill-系统-agent-如何把经验沉淀成可复用能力/)
- [GBrain](/ch01-220-gbrain-yc-ceo-garry-tan-的-postgres-native-ai-第二大脑-5-大设计决策/)
- [Demis Hassabis YC 专访：AGI / 记忆 / Agent / 创造性观点集](/ch04-427-demis-hassabis-yc-专访-agent-才刚刚开始-ai-下一步是创造虚拟细胞/)
- [OpenHuman: AI Agent 持久记忆框架](/ch04-284-1-6万-star-ai-agent-赛道又杀出一匹黑马/)
- Agent Memory System 设计指南
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](/ch01-677-anthropic/)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](/ch07-006-claude-code-skills-mcp-rules-source-analysis/)
- [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](/ch04-258-aws-devops-agent-实战-云网络故障自主调查与修复建议/)
- [AI tool poisoning exposes a major flaw in enterprise agent security](/ch04-277-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s/)
- [Claude Code MCP Server](/ch07-024-claude-code-mcp-server/)
- Skills赏析：使用skills-refiner提升skill质量
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](/ch04-133-skillos-learning-skill-curation-for-self-evolving-agents/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](/ch04-116-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)
- [AI Skill 测评指标体系](/ch01-383-ai-skill-测评指标体系/)
- Agent Memory 系统性框架
- 200人销售团队企业级 Agent 知识库问答系统架构设计
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](/ch03-049-harness-engineering-详解-如何将-ai-coding-率提升至-90/)
- [Claude Code Agent 工程设计](/ch04-015-claude-code-的-agent-工程/)
- [你不知道的 Agent 原理架构与工程实践](/ch04-300-agent-principle-architecture-engineering-practice/)
- Coding Harness 工程本质
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](/ch07-029-qoder-skills-完全指南/)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](/ch01-218-我们刚过了人类最后一个劳动节-ai新职业的八个变化/)
- [Agent Skill 设计模式](/ch01-677-anthropic/)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](/ch01-548-cdp-bridge-mcp-让-llm-操作真实浏览器/)
- [AI Coding Agent 记忆系统](/ch04-288-ai-coding-agent-记忆系统/)
- [Self-Evolving Agents 系统性综述](/ch04-203-self-evolving-agents-系统性综述/)
- [Hermes Agent 记忆系统深度拆解](/ch04-418-hermes-agent/)
- Agent Memory System Design
- KAIROS — Claude Code 常驻协作范式
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](/ch04-202-doris-mcp-on-agentcore-runtime-vpc原生mcp部署模式/)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](/ch04-285-自己的工具自己控-mcp-server-amazon-bedrock-agentcore-quick-suite集成指南/)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](/ch04-191-tencent-vibe-coding-to-agentic-engineering-backend/)
- [Design Patterns for AI Agents 2026](/ch04-083-design-patterns-for-ai-agents-2026-4-大执行模式-5-步选型决策树-refl/)
- [Agent 时代架构师技能指南](/ch04-346-agent-时代-我们架构师应该学什么/)
- [Harness Engineering 框架](/ch05-041-harness-engineering-概念框架/)
- [RAG 深度解析：分块向量化召回重排才是蒸馏同事 Skill 的关键](/ch01-327-rag-深度解析-分块向量化召回重排才是蒸馏同事-skill-的关键/)
- MemOS Hermes 记忆插件
- [17种Agent架构演进：控制流设计的完整演化史](/ch04-507-17种agent架构演进-控制流设计的完整演化史/)
- Claude Code Prompt 提示词体系源码解析
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](/ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件/)
- [AgentCore Managed Harness](/ch04-408-amazon-bedrock-agentcore-harness-ga-两-api-调用生产级-agent-基础设施/)
- [From Agent Protocol to Harness Skill](/ch04-351-from-agent-protocol-to-harness-skill/)
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](/ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端/)
- RAG 全链路技术详解：从文档加载到 Ragas 评估
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](/ch04-422-harness-engineering-让-coding-agent-可靠完成长程任务/)
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践
- [Claude Code 源码核心机制详解](/ch01-162-claude-code-源码核心机制详解/)
- [Code as Agent Harness 综述](/ch09-046-code-as-agent-harness-综述/)
- [harness-engineering-systematic-explainer](/ch05-036-harness-engineering-systematic-explainer/)

---

