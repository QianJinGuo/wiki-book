# SkillOS: Learning Skill Curation for Self-Evolving Agents

## Ch01.336 SkillOS: Learning Skill Curation for Self-Evolving Agents

> 📊 Level ⭐⭐ | 14.0KB | `entities/skillos-learning-skill-curation-for-self-evolving-agents.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillos-learning-skill-curation-for-self-evolving-agents.md)
来自 newsletter 文章 [SkillOS: Learning Skill Curation for Self-Evolving Agents](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillos-learning-skill-curation-for-self-evolving-agents.md) 提取。

## 核心内容
SkillOS 来自 Google Cloud AI Research 与 UIUC 的联合研究，提出了一个**经验驱动的强化学习训练方案**，用于让 self-evolving agents 学习技能策展（skill curation）能力。核心设计：将 agent executor（负责执行）冻结，仅训练 skill curator（负责更新 SkillRepo），形成 executor 与 curator 的模块化分离。训练时，将相关任务打包成组，早期任务更新 SkillRepo，后期任务评估更新质量，用 GRPO 算法优化 curator。实验覆盖 ALFWorld、WebShop 和数学推理任务，RL 训练的 8B curator 超越直接使用 Gemini-2.5-Pro 作为 curator 的版本

### 主要章节
- ## Past Relevant Skills
- ## Problem
- ## Requirements
- ## Past Relevant Skills
- ## Current Progress
- ## Rules
- ## Protocol
- ## Problem \n {problem}
- ## Solution with reasoning process\n {solution}
- ## How to score
- ## Strictness
- ## User instruction {instruction}
- ## Trajectory

## 深度分析
**1. Executor 与 Curator 模块解耦是核心工程决策，直接影响系统可演进性**
SkillOS 将 agent executor π_L 始终保持冻结状态，仅训练 skill curator π_S 这一设计具有深刻的工程含义。冻结 executor 意味着 curator 的所有学习信号必须通过写入 SkillRepo 来间接影响 executor 行为，这种约束强迫 curator 学会"以 executor 为中心的策展"——写出的 skill 必须是 executor 能理解并复用的，而非自己觉得有用的。这种模块化还带来了一个关键优势：**executor 可以独立演进**。当有新更强的基础模型可用时，只需更换冻结的 executor，训练好的 curator 及其 SkillRepo 可以直接迁移复用，无需重新训练 curator。实验验证了这一点：Qwen3-8B 作为 curator 配合 Gemini-2.5-Pro 作为 executor 仍然取得了优异成绩，说明 curator 学到的是可迁移的策展策略而非针对特定 executor 的 hack
**2. 任务分组（Grouping）机制将延迟反馈转化为可学习的监督信号**
SkillOS 训练的核心创新在于构建训练实例的方式：将技能相关联的任务打包成一组（Group），组内第一个任务用空的 SkillRepo 求解，从第二个任务开始 curator 的每次策展操作都会被组内后续任务验证。如果早期任务中学到的 skill 帮助了后续任务，则给予正向奖励；反之则负向奖励。这直接解决了 self-evolving agent 领域的核心难题——策展决策的效果是延迟且间接的：你在任务 t 做的决策效果要到任务 t+k 才能观察到。在此之前，没有任何工作能够有效解决这个问题。SkillOS 通过分组机制将延迟反馈变成了即时可用的梯度信号，这是方法论层面最重要的贡献
**3. 复合奖励设计将策展质量分解为多个可验证维度**
r = r_task + λ_f·r_fc + λ_u·r_cnt + λ_c·r_comp 这四个奖励项各有其存在理由：r_task 是真正的下游目标，但它是延迟的且只反映最终任务结果，无法指导具体的策展操作；r_fc 直接验证 curator 输出的函数调用是否合法（insert/update/delete 是否语法正确且成功执行），保证了策展动作的有效性；r_cnt 用外部 judge（Qwen3-32B）评估生成 skill 的内容质量（抽象性、可复用性、可操作性、忠实度），防止 curator 生成过于具体或包含幻觉的 skill；r_comp 则显式惩罚原始轨迹复制，强制 skill 必须是高度抽象的 reusable knowledge 而非 hard-coded 解决方案。这种四维分解使 curator 的每个决策维度都有直接的学习信号，而非只能依赖端到端的 task reward
**4. 小模型 + RL 训练的 curator 超越 prompt-based frontier 模型，证明了"学会策展"比"用强模型策展"更有效**
一个最惊人的实验结果是：SkillOS 使用 Qwen3-8B 作为 curator，经过 RL 训练后，在 ALFWorld 上超越了直接使用 Gemini-2.5-Pro 作为 curator 的 SkillOS-gemini 配置。这强烈暗示：**策展是一项需要专门学习的技能，而非仅靠模型规模就能解决的任务**。prompt-based 的 curator（如 SkillOS-gemini）即使拥有强大的 world knowledge 和 reasoning 能力，也缺乏"什么样的 skill 格式对 executor 最有用"以及"何时应该更新而非新建 skill"的直觉。而 RL 训练的 curator 通过与 executor 的持续交互学会了这些细粒度的策展策略。这一发现对工程实践有直接指导：当你在设计一个 self-evolving agent 系统时，优先投资训练 curator，而非直接调用最强模型做策展
**5. 跨 executor 的泛化能力表明策展策略具有跨架构可迁移性**
实验测试了 4 种不同的 executor（Qwen3-8B、Qwen3-32B、Gemini-2.5-Pro、Gemini-3.1-Flash-Lite），所有配置中 SkillOS 都一致性地超越了 memory-free 和 memory-based 基线，且提升幅度与 executor 能力正相关（executor 越强，curator 贡献越大）。更重要的是，Qwen3-8B curator 在配合不同 executor 时都能稳定提升性能。这说明 SkillOS 学到的策展策略并非针对特定 executor 行为的过拟合，而是捕捉到了某种通用的、关于"什么样的 skill 格式和内容对下游任务最有帮助"的规律。唯一的例外是 MemP（rule-based memory management）在 Gemini-3.1-Flash-Lite 上甚至低于 No Memory，印证了 hand-designed heuristics 在 executor 能力较弱时的脆弱性

## 实践启示
**1. 构建 self-evolving agent 系统时，默认采用 executor 与 curator 分离的模块化架构**
不要让同一个模型同时负责执行和记忆更新。冻结 executor、单独训练 curator 的设计有两个实际好处：其一，隔离了问题空间——你不需要同时优化"如何执行任务"和"如何管理记忆"两个目标；其二，支持渐进式演进——生产环境中可以先部署一个基础 executor，后续随着基础模型进步直接升级 executor 而保留 curator 的训练成果。建议将 executor 和 curator 视为独立服务，curator 的 SkillRepo 通过标准化的 insert/update/delete API 与 executor 解耦
**2. 设计 curator 的动作空间（action space）时，优先实现 insert/update/delete 三种操作而非仅做 append**
很多 self-evolving agent 的记忆系统只实现了"追加"操作，但 SkillOS 的实验表明 update 和 delete 同样关键。update 让 curator 能够修正不再准确的 skill（当环境规则变化或 executor 学会更好的策略时），delete 则防止低质量或冗余 skill 污染检索结果。实现时，建议每个操作都设计为幂等的 function call，curator 的输出必须经过 schema 验证才可执行，避免无效操作污染 SkillRepo。在训练数据构建阶段，确保分组内的任务存在技能重叠且有难度递进，这样 curator 才能学会"何时 update 而非 insert 新 skill"这一关键判断
**3. 设计复合奖励时，为策展动作的"格式正确性"和"内容质量"分别设置独立的奖励通道**
不要仅用下游任务成功率作为 curator 的唯一奖励。参考 SkillOS 的 λ_f=1.0（function call reward 权重），在训练中优先确保 curator 输出的策展操作本身是有效的（语法正确、target skill 存在、不会导致 SkillRepo 状态崩溃）。r_cnt 用外部 LLM judge 评估 skill 内容质量的做法值得借鉴：定义你的 skill 质量评价维度（抽象程度、可复用性、可操作性、忠实度），用 32B 级别的 judge 模型评分，作为训练中的中间奖励。r_comp 则强制防止 curator 进入"复制轨迹"的捷径，确保最终 SkillRepo 中的 skill 是可泛化的抽象知识而非 hard-coded 解决方案
**4. 构建训练数据的任务分组策略时，以"技能依赖"而非"任务类型相似性"为核心分组依据**
如果你的应用场景是特定领域的 agentic 任务，直接利用领域内已有的任务类型标注（如 ALFWorld 的 6 种任务类型）作为分组依据是最简单有效的策略。但如果你的场景没有预设的任务类型分类，SkillOS 的两阶段 pipeline（先用 LLM 为每个任务标注 latent attributes，再基于 phrase-level similarity 构建分组）提供了可复用的方案。关键洞察是分组质量决定 curator 学到的策展策略质量——太相似的任务无法教会 curator 处理 skill 冲突和更新，太无关的任务则使早期策展决策无法被后续任务验证。建议保留 fallback 机制：当 inverted index 检索不到满足依赖门的候选任务时，切换到 uniform random 检索并标记为 fallback sample，降低训练崩溃风险
**5. 优先对 8B 量级的 curator 模型进行 RL 训练，而非直接使用前沿大模型做 prompt-based 策展**
根据 SkillOS 的实验结论，训练一个 8B curator 的成本（16 H100 GPU × 3 天 for ALFWorld）远低于持续调用 Gemini-2.5-Pro 做 prompt-based 策展的推理成本，且效果更好。如果你的团队要构建生产级 self-evolving agent，建议：先用 8B 模型加 GRPO 训练 curator，保存训练好的 checkpoint；后续 curator 升级时直接在该 checkpoint 上继续训练（warm-start），而非从头训练；executor 升级时直接换 frozen executor，无需重新训练 curator。建议使用 Qwen3-8B 或同等量级的开源模型作为 curator 基础模型，配合 GRPO 或 PPO 算法，learning rate 设置为 1×10⁻⁶，batch size 32，group size 8 作为初始超参

## 相关实体
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](../ch04/218-self-evolving-agents.html)
- [基于AgentCore构建自学习、可进化的文旅行业近似信息抽取Agents | 亚马逊AWS官方博客](../ch03/046-agent.html)
- [Self-Evolving Agents 系统性综述](../ch04/218-self-evolving-agents.html)
- [Memento-Skills — 技能外部记忆让 Agent 自进化（arXiv 2603.18743）](../ch04/398-memento-skills-agent.html)
- [Hermes Agent 自进化机制源码解析](../ch03/092-hermes-agent.html)
- [LLM-as-a-Verifier: A General-Purpose Verification Framework](ch01/1089-rag.html)
- [民生银行基于规格驱动开发（SDD）的 CodeAgent 私域研发探索与实践](../ch03/046-agent.html)
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](../ch03/092-hermes-agent.html)
- [AI Skill 测评指标体系](ch01/483-ai-skill.html)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](../ch05/018-harness.html)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/046-agent.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](../ch04/003-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05/052-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)
- [AI Agent 工程师能力地图](../ch04/030-ai-agent.html)
- [self-evolving agents 系统性综述（厦门大学等多机构联合）](../ch04/218-self-evolving-agents.html)
- [万级实时推理的商品领域agent实践思考和总结](../ch03/046-agent.html)
- [工作流的 skill 怎么写？从 7 个顶级 skill 中提炼的模式与最佳实践](../ch04/267-skill.html)

---

