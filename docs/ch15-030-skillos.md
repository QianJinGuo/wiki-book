## Ch15.030 SkillOS

> 📊 Level ⭐⭐⭐ | 4.3KB | `entities/skillOS.md`

## Architecture
- **Skill Curator (πS)**: Trainable component that updates SkillRepo via insert/update/delete operations
- **Agent Executor (πL)**: Frozen LLM that retrieves relevant skills from SkillRepo to solve tasks
- **SkillRepo**: External repository of reusable skills (Markdown files with YAML frontmatter)

## Training Method
1. **Grouped task streams**: Training instances are groups of related tasks where earlier experiences update SkillRepo and later tasks evaluate those updates
2. **Composite rewards**: Combines task outcome + function call validity + skill quality + repository compactness
3. **GRPO optimization**: Grouped Reward Policy Optimization for training stability

## Results
- **+9.8%** relative performance improvement vs strongest baseline
- **−6.0%** fewer interaction steps
- Generalizes across executor backbones including Gemini-2.5-Pro
- 8B curator outperforms Gemini-2.5-Pro when used directly as curator

## 深度分析
**SkillOS 的核心创新在于将"技能管理"本身作为一个可学习的问题**：传统 Agent 系统的 Skills 是静态的、由人工设计的。而 SkillOS 证明，通过强化学习让一个 Curator 模型学会何时 insert/update/delete Skills，可以让 SkillRepo 自主进化。这一思路类似于"学会学习"（Learning to Learn）——不是直接编码解决方案，而是学习如何组织解决方案。
**Grouped Reward 设计揭示了技能管理的长程依赖性**：单一任务的奖励信号无法指导跨时间窗口的技能管理决策。SkillOS 通过"组内相关任务"构造训练样本——用早期任务诱导的 Skills 来解决后期任务，从而为技能管理提供长程反馈信号。这解决了"即时奖励无法评估技能长期价值"的难题。
**Composite Reward 的四维设计反映了对 SkillRepo 质量的全面理解**：$r_{task}$（任务成功）+ $r_{fc}$（调用合法性）+ $r_{cnt}$（内容质量）+ $r_{comp}$（压缩率）构成了一个平衡的目标函数——既追求任务能力，又防止 SkillRepo 膨胀和无序。
**8B Curator 超越 Gemini-2.5-Pro 的发现具有重要的工程意义**：这表明"学习技能管理"这一任务相对简单，不需要超大模型；而任务执行（Agent Executor）才需要强大模型。这为边缘设备上的技能管理系统提供了可行性依据。

## 实践启示
**技能管理系统设计**：

- 技能管理决策（如何时创建/更新/删除技能）本身可以作为 RL 问题学习，不应仅依赖人工规则
- 建立技能的"生命周期"视角：创建→评估→更新→淘汰，而非静态累积
- 关注 SkillRepo 的"密度"而非"数量"——高质量小技能库优于低质量大技能库
**训练系统设计**：

- Grouped task stream 是学习长程技能管理的关键——确保组内任务有技能共享空间
- Composite Reward 中的压缩率信号很重要，可以防止 SkillRepo 无限膨胀
- 技能内容质量评估可借助外部 Judge 模型（如 Qwen3-32B），而非依赖端到端学习
**工程落地路径**：

- 轻量 Curator（8B 以下）+ 强大 Executor 的组合是实用的生产部署方案
- SkillRepo 应采用标准格式（Markdown + YAML frontmatter）以便于跨系统复用
- 先在特定领域验证 Curator 能力，再扩展到跨领域场景

## Related Concepts
## 相关实体
- [On Policy Distillation Vs Offline Distillation Loster](ch04-181-co-existence-vs-co-intelligence-mollick-s-paradigm-shift-on.html)
- Overcoming Reward Signal Challenges Verifiable Rewards Based Reinforcement Learn
- [Reinforcing Recursive Language Models Alphaxiv](ch01-636-reinforcing-recursive-language-models-alphaxiv.html)
- [Yann Dubois Openai Post Training Interview](ch01-374-introducing-the-ettin-reranker-family.html)
- [Baixing Ontoz Enterprise Ontology Multi Agent](ch04-131-state-of-memory-in-agent-harness-mem0-harness.html)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillOS.md)

---
