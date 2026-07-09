# SkillOS: Learning Skill Curation for Self-Evolving Agents

## Ch04.143 SkillOS: Learning Skill Curation for Self-Evolving Agents

> 📊 Level ⭐⭐ | 13.5KB | `entities/skill-os-learning-skill-curation-self-evolving-agents.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-os-learning-skill-curation-self-evolving-agents.md)

## 论文信息
- **作者**: Siru Ouyang, Jun Yan, Yanfei Chen 等
- **发布**: 2026-05-08
- **arXiv**: [2605.06614](https://arxiv.org/abs/2605.06614)
- **PDF**: [pdf](https://arxiv.org/pdf/2605.06614.pdf)

## 核心贡献
SkillOS 提出了一种**技能策展学习**框架，使 agent 能够自主地从经验中学习和优化技能库，实现自我进化。该框架将技能策展问题形式化为一个强化学习问题，通过经验驱动的方式让 agent学会如何从长期延迟反馈中学习技能管理。

## 系统架构
SkillOS 采用多智能体模块化设计，包含三个核心组件：
1. **SkillRepo（技能仓库）**：外部技能库，以 Markdown 文件形式存储技能，每个技能包含 YAML frontmatter（名称和使用场景描述）和 Markdown 指令（工作流、约束和可复用启发式知识）
2. **Agent Executor（执行器）**：冻结的agent执行器，给定任务时通过 BM25 检索相关技能，然后基于任务上下文和检索到的技能执行动作
3. **Skill Curator（策展人）**：可训练的技能策展模块，观察执行轨迹后决定对 SkillRepo 执行 insert_skill、update_skill 或 delete_skill 操作
执行器和策展人形成闭环：策展人根据经验更新技能库，更新后的技能库被用于后续任务的执行。

## 核心创新
### 1. 任务分组训练
SkillOS 将每个训练实例构造成一组相关任务的序列。在这种设置下，早期任务产生的技能会被后续相关任务验证，从而为策展决策提供下游学习信号。这解决了传统方法中反馈延迟和间接的问题。
论文使用 Gemini-2.5-Pro 为每个任务生成标签（topic、common pitfalls 等），基于标签相似性将任务分组。同一组内的任务在技能依赖上存在非平凡关系。

### 2. 复合奖励设计
奖励函数包含四个信号，权重可调：
| 奖励组分 | 含义 | 作用 |
|---|---|---|
| r_task | 任务结果奖励 | 后续任务的平均成功率，提供执行器层面的下游反馈 |
| r_fc | 函数调用奖励 | 策展操作的有效性（格式正确、成功执行） |
| r_cnt | 内容质量奖励 | 外部裁判（Qwen3-32B）评估技能的可复用性和语义质量 |
| r_comp | 压缩奖励 | 鼓励将轨迹蒸馏为简洁技能而非直接存储 |
这种复合奖励设计将延迟的间接反馈转化为策展决策的学习信号。

### 3. GRPO 优化
使用 Grouped Reward Policy Optimization (GRPO) 训练策展人策略，对同一任务组的多个 rollout 计算 advantage，优势信号均匀分配到所有 token。论文发现丢弃 KL 散度项反而有助于策略探索。

## 实验结果
### ALFWorld 多步交互任务
| 配置 | 方法 | 平均成功率 | 步数 |
|---|---|---|---|
| Qwen3-8B 执行器 | No Memory | 47.2% | 21.1 |
| Qwen3-8B 执行器 | ReasoningBank | 55.7% | 20.1 |
| Qwen3-8B 执行器 | **SkillOS** | **61.2%** | **18.9** |
| Gemini-2.5-Pro 执行器 | No Memory | 66.4% | 17.7 |
| Gemini-2.5-Pro 执行器 | **SkillOS** | **80.2%** | **14.8** |
SkillOS 在所有基准上持续超越无记忆和强记忆基线，且收益随执行器能力增长而放大（Gemini-2.5-Pro 执行器下提升 9.5 个百分点）。

### 关键发现
1. **RL训练的小型策展人超越 frontier 模型**：8B 策展人甚至超过使用 Gemini-2.5-Pro 直接策展的版本，说明针对性训练可以弥补原始模型规模差距
2. **效率提升与效果提升同时实现**：ALFWorld 上步数从基线 21.1 降至 18.9，不仅效果更好，交互成本也更低
3. **跨执行器泛化**：训练好的策展人迁移到不同规模的执行器（Qwen3-32B、Gemini-2.5-Pro）仍有提升

## 深度分析
### 技能策展为何是自我进化的关键瓶颈
当前 agent 研究中，记忆/技能管理存在三条路线：（1）人工策展（如 Anthropic Skills），需要大量人类专家参与，无法规模化；（2）启发式方法，依赖固定规则，缺乏下游性能反馈；（3）短程 RL 适应，只关注即时任务内的技能操作，无法处理技能更新和删除等复杂管理操作。SkillOS 填补的是第三条路线的空白——它通过任务分组和复合奖励，让策展人学会在长期时间跨度上做技能管理决策。

### 技能作为 Markdown 文件的工程哲学
论文选择将技能表示为单个 Markdown 文件而非文件夹结构，直接对应 Anthropic Skills 的 SKILL.md 格式。这不是简单的格式选择，而是体现了"技能即文档"的哲学：技能不是代码片段，而是可执行的知识条目，包含名称、描述、工作流、When NOT to Use 和 Prerequisite Constraints。这种格式让技能既可被 agent 读取理解，也可被人类审阅和维护。

### Insert/Update/Delete 三元组的重要性
大多数记忆管理工作只关注 insert 操作，但 SkillOS 特别强调 update 和 delete 的价值。delete 操作防止无效/冗余技能污染仓库；update 操作让旧技能适应新场景。论文中 RL 训练的策展人学会了识别何时该删除已有技能、何时该更新而非新增，这需要长期下游反馈信号才能学到。

### 与现有工作的本质区别
| 维度 | 之前方法 | SkillOS |
|---|---|---|
| 训练信号 | 局部任务结果 | 任务组内后续任务的延迟反馈 |
| 操作范围 | insert 为主 | insert + update + delete |
| 反馈类型 | 即时 | 延迟且间接 |
| 策展人规模 | 通常与执行器同规模 | 8B 策展人可超越 frontier 执行器本身 |

### GRPO 优化策略的深层含义
论文使用 GRPO（Grouped Reward Policy Optimization）训练策展人，并发现丢弃 KL 散度项反而有助于策略探索。这一发现具有重要的工程含义：KL 项的引入通常是为了限制策略更新幅度、防止灾难性遗忘，但在策展场景下，过度的保守反而会阻碍策展人学会大胆的删除和更新操作。策展人需要探索 insert/update/delete 的各种组合，甚至需要尝试"破坏性"操作来理解技能仓库的边界。这种探索自由对于学到有效的长期策展策略至关重要。实践中，如果团队需要更保守的策展行为，可以考虑在训练后期加入 KL 项做微调，而非全程约束。

### 技能内容质量的四维评估标准
论文附录中详细描述了外部裁判（Qwen3-32B）评估技能内容的四个维度：

- **ABSTRACTION（抽象性）**：技能捕捉的是可泛化的程序或洞察，而非轨迹的逐字复制。特定 ID、数字、对象名应被替换为变量或通用概念
- **REUSABILITY（可复用性）**：技能是原子化和模块化的，描述一个 coherent 能力，可被未来相关任务触发，而非捆绑无关步骤
- **ACTIONABILITY（可操作性）**：Markdown 正文提供具体指导（工作流、条件、When NOT to Use），执行器可直接行动，而非模糊建议
- **FAITHFULNESS（忠实性）**：技能中的所有声明都被轨迹支持，无编造的事实、工具或环境行为
这四个维度为团队提供了明确的技能质量评估框架。实践中可以用这四个维度建立技能准入标准，或作为策展人输出质量的自动评估规则。

### 效率提升与效果提升的共存机制
SkillOS 在 ALFWorld 上不仅成功率提升，步数也从基线 21.1 降至 18.9。这说明技能策展带来的不是"更长时间思考"，而是"更精准的行动"。其机制在于：策展人从早期任务中学到的技能让后续任务可以直接检索使用，而非每次从零开始探索。效率提升还意味着更低的 token 消耗和更低的交互成本，对于需要控制 API 成本的生产系统尤为重要。

### 多任务类型的泛化路径
论文在 ALFWorld（多步交互任务）、WebShop（在线购物）和单步推理任务（AIME、GPQA）上验证了 SkillOS。有趣的是，ALFWorld 上的提升幅度（+9.5% with Gemini-2.5-Pro）大于 WebShop 和推理任务。这可能反映了不同任务类型对技能依赖的差异：ALFWorld 这类交互式任务涉及更多可复用的子程序（如"检查台面上的物品"、"打开冰箱"），而推理任务更多依赖一次性问题理解。团队在应用 SkillOS 时，应根据任务特性调整期望——高度重复性的操作任务更适合技能策展。

## 实践启示
### 1. 构建自我进化系统的工程路线
对于希望构建自我进化 agent 系统的团队，SkillOS 验证了一条可行的工程路线：保持执行器冻结（避免训练不稳定），单独训练策展人模块。这降低了系统复杂度，同时让技能管理能力可以独立迭代。实践中建议从 SkillOS-base（初始策展人）开始，先验证技能格式和工作流设计，再引入 RL 训练提升策展质量。

### 2. 任务分组策略决定学习信号质量
技能策展的效果高度依赖任务分组的合理性。论文使用 Gemini-2.5-Pro 生成任务标签，但实践中可以结合：（1）任务类型元数据（如 ALFWorld 的任务类型）；（2）领域知识图谱；（3）embedding 相似性聚类。分组越精确，组内任务的技能依赖关系越清晰，策展人能学到的技能-任务映射就越准确。

### 3. 复合奖励的工程实现
复合奖励中各组分的权重（λ_f=1.0, λ_u=0.1, λ_c=0.05）反映了设计意图：函数调用格式正确性最重要（直接决定操作能否执行），内容质量次之（影响技能长期可用性），压缩率最轻（防止 verbatim 复制但不追求极致简洁）。实践中建议用网格搜索或贝叶斯优化对这几个超参数做调优，因为不同任务域对各奖励组分的敏感性可能不同。

### 4. 技能外部化的运维价值
SkillRepo 作为外部 Markdown 文件存在，带来了传统记忆系统不具备的运维能力：技能可版本控制、可 human-readable 审查、可在不同 agent 实例间共享。这对于需要满足审计、合规或协作需求的工程环境尤为重要。企业级 agent 系统应考虑将 SkillRepo 持久化到 Git 等版本控制系统，实现技能演化的完整可追溯性。

### 5. 策展人模型规模的选择
论文显示 8B 策展人超越 Gemini-2.5-Pro 直接策展，这说明在策展任务上（给定轨迹决定技能操作），专用的小模型可能优于通用的大模型。实践中可以选择比执行器更小的模型作为策展人，降低训练和推理成本。但需要注意策展人的语言理解能力需足够解码复杂轨迹并生成高质量技能内容。

### 6. 从 SkillOS-base 到 RL 训练的分阶段路径
论文的实验设计提供了一个可借鉴的渐进路径：先用 SkillOS-base（初始策展人，不做 RL 训练）建立 baseline，验证技能格式和工作流设计，再引入 GRPO 训练提升策展质量。训练配置建议从以下超参数开始：学习率 1×10⁻⁶，batch size 32，group size 8，在 16×H100 GPU 上训练约 3 天（ALFWorld）。实践中，团队应先用小规模数据验证训练流程，再扩展到完整数据集，同时监控 r_fc（函数调用奖励）确保策展操作格式正确，再关注 r_task（任务结果奖励）的提升。

## 相关实体
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04/143-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Self-Evolving Agents 系统性综述](ch04/218-self-evolving-agents.html)
- [Memento-Skills — 技能外部记忆让 Agent 自进化](ch04/386-memento-skills-agent.html)
- [Hermes Agent 自进化机制源码解析](../ch03/090-hermes-agent.html)
- [Native Parallel Reasoner: 原生并行推理](../ch01/939-20.html)
- [self-evolving agents 系统性综述（厦门大学等多机构联合）](ch04/218-self-evolving-agents.html)

---

