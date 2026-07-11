# Self-Evolving Agents 系统性综述

## Ch04.218 Self-Evolving Agents 系统性综述

> 📊 Level ⭐⭐ | 10.9KB | `entities/self-evolving-agents-survey.md`

## 核心贡献
**统一 taxonomy**：将 Self-Evolving Agents 划分为三大范式——
1. **Model-Centric Self-Evolution**：推理时（Inference-Based）或训练时（Training-Based）自进化
2. **Environment-Centric Self-Evolution**：静态知识演化、动态经验演化、模块架构演化、Agent 拓扑演化
3. **Model-Environment Co-Evolution**：模型与环境共同进化，是未来关键方向
两个核心特征：

- **Strong autonomy**：尽量减少对外部人工监督的依赖
- **Active exploration**：通过内部推理或外部环境交互主动探索和改进

## 技术框架
| 范式 | 进化来源 | 代表方向 |
|------|---------|---------|
| Model-Centric | 模型内部（推理/训练） | Parallel Sampling, Self-Correction, Synthesis-Driven, Exploration-Driven |
| Environment-Centric | 外部（知识/经验/模块/拓扑） | Agentic RAG, Memory, Tool, Topology Evolution |
| Model-Environment Co-Evolution | 模型+环境双向 | Multi-Agent Co-Evolution, Environment Training |

## 关键判断
> 未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是设计能够和 Agent 一起成长的环境。

## 论文信息
- **arXiv**：https://www.techrxiv.org/doi/full/10.36227/techrxiv.177203250.05832634/v2
- **GitHub**：https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents
- **发布**：2026-05-04 | 来源：PaperAgent 公众号

## 与 Wiki 现有页面的关系
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) — Hermes 的自进化机制，侧重 Skill 生成 + RL 训练双路径
- [Memento Skills Agent Self Evolving](ch04/389-memento-skills-agent.html) — 技能外部记忆维度，与 Environment-Centric Static Knowledge Evolution 相关
- [Agent Self Improvement Six Mechanisms](../ch03/045-agent.html) — Agent 自我改进六条路，与本文 taxonomy 有重叠但视角不同
- [Agent Memory Modular Framework](ch04/121-agent-memory.html) — Memory 模块化框架，与 Environment-Centric Modular Architecture Evolution 相关
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/self-evolving-agents-survey-papersagent.md)

## 深度分析
### 三条进化路线的内在逻辑与局限性
论文提出的三条 Self-Evolving Agents 路线，不是并列的三个方向，而是一个**从内到外的能力扩展层次**：
**Model-Centric（模型内部）**：假设模型潜力没有被充分激发，通过推理时计算（Inference-Based）或训练时更新（Training-Based）来激活潜力。局限性在于：推理时计算不改变模型参数、能力不会真正内化；训练时进化依赖高质量合成数据或在线反馈信号，在真实环境中获取成本高。
**Environment-Centric（环境驱动）**：不改变模型，改变模型所处的环境——知识、经验、工具、记忆、多 Agent 结构。四个方向中，Topology Evolution 是最激进的——它把"多 Agent 之间的组织关系"本身当作可优化的对象，而不是固定的结构设计。
**Model-Environment Co-Evolution（共同进化）**：前两者的局限都在于"单边优化"——Model-Centric 忽略了环境验证，Environment-Centric 忽略了模型能力的主动提升。Co-Evolution 的核心洞察是：环境本身也可以是训练对象，而不只是固定的外部条件。

### 为什么 Co-Evolution 是未来关键方向
论文的核心判断是："未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是**设计能够和 Agent 一起成长的环境**。"
这个判断的深层含义是：当前 Agent 的瓶颈不在模型能力，而在**环境的质量**。具体问题：环境能否提供可验证的反馈？能否按 Agent 能力调整难度？能否生成多样化任务？能否支持长期开放式探索？当前大多数环境在这些维度上都是静态的、单任务的、有限反馈的。
Model-Environment Co-Evolution 的两个方向：

- **Multi-Agent Policy Co-Evolution**：其他 Agent 构成的环境，Agent 间协作/竞争/评价形成动态学习场。关键是"非零和"特性——多个 Agent 可以同时变强，不需要牺牲彼此。
- **Environment Training**：训练/生成环境。能提供可验证反馈、能按 Agent 能力调整难度、能生成多样化任务、能支持长期开放式探索。这是比"训练更强的 Agent"更难的问题。 

### Static vs Dynamic Experience Evolution 的区分意义
论文将 Environment-Centric 中的 Experience Evolution 分为静态和动态两类，这个区分有重要的工程意义：
**Static Experience Evolution**：从历史轨迹中提炼经验，用于指导未来决策。典型实现是基于成功/失败案例的检索增强。优势是实现简单，局限是经验不会随新任务实时更新。
**Dynamic Experience Evolution**：经验本身是实时更新的，且更新过程会影响 Agent 的决策策略。这意味着 Agent 不仅从经验中学习，还学习**如何从经验中学习**（meta-learning over experience）。
两者的工程复杂度差距很大：静态版本只需要一个向量数据库 + 检索；动态版本需要一个能够持续写入、合并、遗忘和检索的记忆系统，且记忆写入策略本身也需要学习。

## 实践启示
### 对 Agent 系统设计者的建议
1. **优先实现 Static Experience Evolution，再逐步引入 Dynamic**：大多数团队还不具备实现动态经验演化的工程基础（持续写入+策略更新的记忆系统）。建议先用 RAG + 案例库的方式实现静态版本，积累足够的经验数据后再考虑动态演化。
2. **Modular Architecture Evolution 的工程优先级最高**：在 Environment-Centric 四个方向中，Memory/Tool/Skill Library 的模块化是最容易落地的。这些模块的边界清晰，接口稳定，演化策略（增删改）也相对容易定义。相比之下，Topology Evolution 涉及多 Agent 协作的整体设计，复杂度高得多。
3. **Agentic RAG 是 Static Knowledge Evolution 的工程形态**：Agent 主动判断知识缺口、生成查询、收集证据、整合推理——这个循环实际上是 Agentic RAG 的标准实现。在构建 RAG 系统时，不要把它当作"检索增强"，而是当作 Agent 的**主动认知行为**来设计接口和反馈机制。

### 对 Agent 训练实践者的建议
1. **推理时计算的性价比判断**：Inference-Based Evolution（如 Parallel Sampling、Self-Correction）用更多 test-time compute 换取更可靠的输出。这对推理成本已经显著下降的场景（如 Claude Code 的工具调用）是有意义的优化，但对推理成本仍然较高的场景可能是浪费。
2. **Training-Based Evolution 需要数据飞轮**：Synthesis-Driven 和 Exploration-Driven 都依赖高质量的训练数据。区别在于：Synthesis-Driven 是"模型给自己出教材"，数据质量取决于模型的自我纠错能力；Exploration-Driven 是"在真实环境中试错"，数据质量取决于环境能否提供有效的 reward signal。两者都需要先建立数据飞轮的工程基础设施。

### 对 Agent 平台/基础设施建设的建议
1. **环境即产品**：论文的核心洞察"设计能够和 Agent 一起成长的环境"对平台建设者的启示是：平台的价值不只是提供算力或模型，而是提供**能够伴随 Agent 能力提升而进化的环境**。这意味着平台也需要持续迭代，而不是一次建好永久使用。
2. **评估框架必须覆盖进化能力**：当前的 Agent 评估 benchmark（如 SWE-Bench）主要评估任务完成率，但没有评估** Agent 的进化能力**——它能否从失败中学习？能否积累经验避免重复错误？能否在任务之间迁移成功策略？这是未来 benchmark 需要补充的维度。
3. **Co-Evolution 环境的技术要求**：如果目标是构建支持 Model-Environment Co-Evolution 的平台，需要满足：a）环境能生成多样化的任务（task generation）；b）环境能提供可验证的 reward signal；c）环境能按 Agent 能力调整难度（curriculum）。这是比简单模拟器复杂得多的工程系统。

## 相关实体
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04/143-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04/218-self-evolving-agents.html)

- [Hermes Agent 自进化机制源码解析](../ch03/090-hermes-agent.html)
- [基于AgentCore构建自学习、可进化的文旅行业近似信息抽取Agents | 亚马逊AWS官方博客](../ch03/045-agent.html)
- [GBrain](../ch01/322-gbrain-yc-ceo-garry-tan-postgres-native-ai-5-llm.html)
- [Karpathy LLM Wiki V2](https://github.com/QianJinGuo/wiki/blob/main/concepts/karpathy-llm-wiki-v2.md)
- [深度解析LLM Wiki / Obsidian-Wiki / GBrain：Agent时代知识的"自组织"与"自进化"](../ch01/650-llm-wiki-obsidian-wiki-gbrain.html)
- [17种Agent架构演进：控制流设计的完整演化史](ch04/642-17-agent.html)
- [hermes-agent-self-evolving-source-analysis](../ch03/090-hermes-agent.html)
- [Multi-Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md)
- [AI Agent 工程师能力地图](ch04/030-ai-agent.html)

---

