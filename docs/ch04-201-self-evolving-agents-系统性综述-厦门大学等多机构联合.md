# Self-Evolving Agents 系统性综述（厦门大学等多机构联合）

## Ch04.201 Self-Evolving Agents 系统性综述（厦门大学等多机构联合）

> 📊 Level ⭐⭐ | 10.9KB | `entities/self-evolving-agents-survey-papersagent.md`

[Self Evolving Agents Survey Papersagent](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/self-evolving-agents-survey-papersagent.md)

## 摘要
厦门大学、香港理工大学、马里兰大学、华盛顿大学圣路易斯分校、UIUC、新加坡管理大学等多机构联合发布系统性综述，系统回答：当 LLM Agent 能够主动探索、获得反馈、更新策略、积累经验时，如何理解其"自进化"？

## 核心概念：Self-Evolving Agents 两个核心特征
1. **Strong autonomy with minimal human supervision**：尽量减少对外部人工监督的依赖
2. **Active exploration through interaction**：通过内部推理或外部环境交互主动探索和改进

## 为什么需要 Self-Evolving Agents？
传统 Agent 依赖"两阶段范式"：

- **Pre-Training**：大规模语料学习通用世界知识
- **Post-Training**：SFT、RLHF、RLAIF 或任务数据
瓶颈：Agent 越复杂，对高质量监督信号依赖越强；而高质量人类标注、人工奖励和专家反馈很难无限扩展。复杂 Agent 任务，人类不仅要判断最终答案，还要理解多步规划、工具调用、环境反馈、错误恢复和长期状态变化。监督成本急剧上升。

## 统一分类：三条自进化路线
### 路线一：Model-Centric Self-Evolution（模型先自己变强）
假设：模型内部已包含大量潜在能力，只是没有被充分激发。
**3.1 Inference-Based Evolution（推理时自进化）**

- Parallel Sampling：并行采样多条推理路径
- Sequential Self-Correction：生成→反思→修正
- Structured Reasoning：树、图等结构化推理
本质：用更多 test-time compute 换取更可靠的单次输出。问题：推理结束后模型参数没变化，能力不会真正内化。
**3.2 Training-Based Evolution（训练时自进化）**

- Synthesis-Driven Offline：离线生成合成数据，再用于训练（"模型给自己出教材"）
- Exploration-Driven Online：在线探索、实时反馈、持续更新策略（"模型不断在探索中试错"）
代表工作：R-Zero、Absolute Zero、Agent0。

### 路线二：Environment-Centric Self-Evolution（环境成为能力来源）
Agent 的进化不只来自参数更新，也来自它如何利用外部知识、经验、工具、记忆和多 Agent 结构。
**四个方向：**
1. **Static Knowledge Evolution**：Agent 会判断自己缺什么知识，主动生成查询、收集证据、整合推理。检索从"前置模块"变为"主动认知行为"。
2. **Dynamic Experience Evolution**：从历史轨迹、成功案例、失败反馈中提炼可复用经验。

   - 知识解决 "what is"，经验解决 "how to do"
   - 哪种工具调用顺序更稳定？哪类错误如何恢复？
3. **Modular Architecture Evolution**：Memory/Tool/Interface/Protocol/Skill Library 这些模块本身也可以演化。Memory 不只是向量数据库，而是能主动决定保留/遗忘/合并/重写/路由的系统。
4. **Agentic Topology Evolution**：让多 Agent 的通信结构、角色分配、团队规模和协作拓扑自动搜索或动态调整。核心问题：多 Agent 系统的组织形式能不能也成为一个可学习、可优化、可进化的对象？

### 路线三：Model-Environment Co-Evolution（未来关键方向）
前两类局限：

- Model-Centric：缺乏外部验证，可能错误累积、自我强化幻觉
- Environment-Centric：很多环境仍是静态的、单任务的、不可扩展的
核心洞察：未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是**设计能够和 Agent 一起成长的环境**。
两个方向：

- **Multi-Agent Policy Co-Evolution**：环境由其他 Agent 构成，Agent 之间协作、竞争、评价形成动态学习场
- **Environment Training**：训练/生成环境——能提供可验证反馈、能按 Agent 能力调整难度、能生成多样化任务、能支持长期开放式探索
代表工作：Reasoning Gym、AgentGym、Agent-World。

## 关键判断（论文核心观点）
> 未来 Self-Evolving Agents 的核心挑战，不只是训练更强的 Agent，而是设计能够和 Agent 一起成长的环境。

## 技术谱系图
- 图1：Self-Evolving Agents 代表性工作发展趋势（2022→2026）
- 图2：统一分类框架（三大范式）
- 图3：技术谱系总览（完整技术地图）
- 图4：离线合成 vs 在线探索进化对比
- 图5：静态知识演化 vs 动态经验演化对比
- 图6：Model-Environment Co-Evolution 优势

## 论文信息
- **标题**：A Systematic Survey of Self-Evolving Agents: From Model-Centric to Environment-Driven Co-Evolution
- **arXiv**：https://www.techrxiv.org/doi/full/10.36227/techrxiv.177203250.05832634/v2
- **GitHub**：https://github.com/XMUDeepLIT/Awesome-Self-Evolving-Agents
- **发布机构**：厦门大学、香港理工大学、马里兰大学、华盛顿大学圣路易斯分校、UIUC、新加坡管理大学

## 深度分析
这篇综述的核心贡献在于提出了一个统一的三分法框架，将散落在推理时扩展、训练时扩展、环境交互、多智能体协作等多个方向的研究整合为一条清晰的演进脉络。其学术价值主要体现在以下几点：
**理论整合层面**，综述将 Self-Evolving Agents 的本质归纳为"最小人工监督下的强自主性 + 主动探索式交互"，这一定义抓住了该领域的共同特征，为后续研究提供了概念锚点。特别是将 Model-Centric 和 Environment-Centric 两条路线并置对比，揭示了各自的优势与局限。
**分类体系层面**，Model-Centric 路线中的 Inference-Based vs Training-Based 区分尤为关键：前者本质是用计算换可靠性（test-time compute），不改变模型参数；后者才是真正通过数据合成或在线探索实现能力内化。这一区分对工程实践有重要指导意义——如果你在设计一个生产系统，需要明确你选择的"自进化"路径是哪种，否则可能出现"系统看起来在思考但能力没有真正提升"的伪进化现象。
**Environment-Centric 路线的四个方向**（知识、经验、模块化、拓扑）代表了从"模型能力"到"系统能力"的认知升级：知识解决是什么，经验解决如何做，模块化解决谁来做什么，拓扑解决如何协作。这一层层递进的框架暗示，Self-Evolving Agents 的终极形态不只是更聪明的模型，而是一个能够共同成长的智能组织。
**Model-Environment Co-Evolution** 是这篇综述最具前瞻性的判断。它指出当前研究的一个隐性假设——环境是固定的、给定的——需要被打破。未来真正的挑战是设计能够和 Agent 共同进化的环境，而非仅仅是训练更强的 Agent。这一判断呼应了 reinforcement learning 中"环境设计即奖励设计"的深刻洞见，对构建下一代 Agent 基础设施具有重要参考价值。
从研究趋势来看，2022-2026 年间该领域经历了从单模型推理扩展到多智能体协同、从静态环境到动态可进化环境的范式转变。这一趋势与 LLM 在推理能力上的突破高度相关，也预示着未来 Self-Evolving Agents 将更多地扮演"环境构建者"而非单纯的任务执行者角色。

## 实践启示
对于当前从事 Agent 系统开发的工程师和研究者，这篇综述提供了以下几个层面的可操作启示：
**架构设计层面**：如果你的系统需要真正的自进化能力，应优先考虑 Training-Based Evolution（合成数据 + 在线探索）而非 Inference-Based Evolution。后者实现简单但在长期能力提升上没有实质价值。同时，应尽早将 Memory 视为主动认知系统而非被动向量存储——记忆的路由、遗忘和整合策略直接影响 Agent 在长周期任务中的表现。
**系统组织层面**：多智能体拓扑的动态调整是一个被低估的方向。固定的 Prompt 角色分配（如"一个 Agent 负责规划，一个负责执行"）在复杂任务中容易成为瓶颈。未来的 Agent 系统应具备根据任务难度和团队表现自动调整通信结构和角色分工的能力。
**环境构建层面**：对于需要高可靠性 Agent 的场景（如代码生成、科学推理），应重视环境提供可验证反馈的能力。论文中提到的 Reasoning Gym、AgentGym 等工作代表了这一方向——构建能够按 Agent 能力动态调整难度的环境，是解决 Agent 评估和训练双重挑战的有效路径。
**评估与迭代层面**：这篇综述也提示我们，当前的 Agent 评估体系存在根本性不足——静态基准无法衡量 Agent 的进化潜力。需要建立能够评估"学习效率"、"探索多样性"和"知识迁移能力"的动态评估框架，而非仅仅关注最终任务准确率。

## 相关实体
- [Skillos Learning Skill Curation For Self Evolving Agents](/ch04-133-skillos-learning-skill-curation-for-self-evolving-agents/)
- [Self Evolving Agents Survey](/ch04-203-self-evolving-agents-系统性综述/)
- [Skill Os Learning Skill Curation Self Evolving Agents](/ch04-133-skillos-learning-skill-curation-for-self-evolving-agents/)
- [Hermes Agent Self Evolving Source Analysis](/ch04-039-hermes-agent-self-evolving-source-analysis/)
- [Claude Code Search Architecture Tencent 2026](/ch01-537-原始文章存档/)

---

