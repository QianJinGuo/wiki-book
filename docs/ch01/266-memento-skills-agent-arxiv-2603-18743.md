# Memento-Skills — 技能外部记忆让 Agent 自进化（arXiv 2603.18743）

## Ch01.266 Memento-Skills — 技能外部记忆让 Agent 自进化（arXiv 2603.18743）

> 📊 Level ⭐⭐ | 14.1KB | `entities/memento-skills-let-agents-design-agents.md`

## 背景问题：冻结大模型的成长困境

大模型部署后通常是"冻结"的——预训练代价高昂，微调难以稳定运维。Agent 的适应能力只能来自**上下文学习（in-context learning）**和**外部记忆（external memory）**。传统 memory 方案（记录历史轨迹、检索类似样本）本质上只是"查旧账"，而不是"长本事"。

**核心洞察**：Memento-Skills 把经验固化成 **skill（技能包）**，而非原始轨迹。Skill 是有 `SKILL.md`、可执行脚本、辅助 prompt、declarative spec 的真正可复用工件——这让经验从不可见的隐式行为变成可审计、可版本化、可测试的显式资产。

这与 [Context Engineering Three Memory Paradigms](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md) 中描述的 RAG/MSA 等记忆范式形成鲜明对比：RAG 擅长精确回溯，但 skill 不是检索出来的，是**生成出来并固化下来的**。

## Memento-Skills 五步闭环

Memento-Skills 的核心是一个 **Observe → Read → Act → Feedback → Write** 的持续进化循环：

```
Observe → Read → Act → Feedback → Write
    ↑                            ↓
    ←←←←←← loop ←←←←←←←←←←←←←
```

- **Observe**：接收新任务，带上当前 tip memory（提示性记忆）
- **Read**：技能路由器（Skill Router）从 skill library 检索最相关 skill
- **Act**：冻结 LLM 按 skill 流程执行
- **Feedback**：Judge 给出正确/错误反馈
- **Write**：更新 skill utility、做 failure 归因和 file-level rewrite、必要时进入 skill discovery

**三层写回策略**：局部修补优先，只在 utility 降至阈值时才生成新技能，避免破坏已有能力。这种策略在 [Agent Self Improvement Six Mechanisms](ch03/044-agent.md) 中被称为"输出自审"的工程化升级版——从单次执行的反射进化为跨 session 的持久化技能积累。

## 技能路由器：行为对齐而非语义相似

传统 BM25/embedding 只擅长找"语义像不像"，无法预测"行为上有没用"。Memento-Skills 的路由器用 **skill 行为**（而非文案）定义相关性：

- 用约 3k 种子 skills 自动生成合成路由查询
- positive query + hard negative query 训练
- InfoNCE 目标，近似 soft Q-function
- **结果：Recall@1 从 0.32 提升到 0.60，route hit rate 0.29→0.58，judge success rate 0.50→0.80**

这意味着路由器的本质不是"语义搜索引擎"，而是"行为预测器"——给定新任务，预测哪个 skill 在实际执行中最可能成功。这与  中"进化搜索"的思想相通：不是靠人工设计 prompt，而是靠数据驱动发现最优行为模式。

## 实验结果

### GAIA（高度异质任务）

| 数据集 | 训练集 | 测试集 |
|--------|--------|--------|
| 基线 | 65.1% | 52.3% |
| Memento-Skills | 91.6% | **66.0%**（+13.7pp）|

局限：任务差异太大，训练 skill 难以迁移到测试。

### HLE（同学科结构任务）

| 数据集 | 训练集 | 测试集 |
|--------|--------|--------|
| 基线 | 30.8% | 17.9% |
| Memento-Skills | 54.5% | **38.7%**（+20.8pp）|

Biology/Humanities 提升最明显（可抽象程度高）。

### 技能库增长

- GAIA：5 个 atomic skills → 41 个技能
- HLE：5 个 atomic skills → 235 个技能（形成主题簇）

技能库的增长模式很有意思：从少量通用 atomic skills 出发，通过 feedback 驱动分裂成专门化技能，最终形成有结构的主题簇。这与 [Memento Skills Agent Self Evolving](ch04/245-skill.md) 描述的"将状态从 s_t 扩展为 x_t = (s_t, M_t)"的马尔可夫性重建在精神上一致——但 Memento-Skills 更强调技能作为一等公民的可维护性。

## 论文真正有价值的地方

1. **持续学习从参数空间移到外部技能空间**：不需微调/重部署，skill memory 可写就能继续成长
2. **经验变成可维护工件**：skill 是文件夹、文档、脚本、可测试和版本化的对象
3. **明确 skill transfer 的边界条件**：任务结构离散时迁移受限，成域时迁移更强
4. **试图打通理论和工程**：SRDP、Reflected MDP、收敛性分析

第一点尤为关键——它回答了  中"六条路"的根本问题：这些机制不是孤立的技巧，而是可以通过统一的 skill memory 架构协同工作的。

## 不足与局限

1. 仍是 benchmark 研究，非生产级长期验证
2. 路由器收益明显但非压倒性优势
3. 单技能检索可能限制更长链任务（需多技能串联/并行/动态组合）
4. 安全性（Judge 误判、sandbox 风险）尚未系统性量化

第三点是当前最大工程障碍：当一个任务需要多个 skill 协同（先做数据清洗、再做分析、再做可视化）时，Memento-Skills 的单技能检索模型无法处理技能间的依赖图。这与 [Hermes Agent Self Evolving](ch03/044-agent.md) 中"定期回顾 nudging"的设计形成互补——Hermes 的方式更适合长链任务的状态管理。

## 未来改进方向

1. 从单技能检索走向**技能图谱组合**（哪个 skill 先执行/校验/fallback）
2. **Skill DevOps**：版本治理、diff 审核、自动回滚、provenance 追踪
3. 学习目标加入**成本、时延、安全**多维指标
4. 跨模型、跨领域、跨模态（图像/表格/GUI）的 skill 迁移验证

## 与同类工作的关联

| 相关实体 | 关联点 |
|---------|--------|
|  | 同论文解读，更偏理论（马尔可夫性、SRDP） |
|  | RAG/MSA 记忆范式对比；Memento-Skills 是技能化的显式记忆 |
|  | 六条自改进路；Memento-Skills 覆盖输出自审+持久记忆+进化搜索 |
|  | Hermes 的 skill 提炼 + nudging；与 Memento-Skills 五步闭环精神相通 |

## 核心价值总结

> Memento-Skills 展示了"权重冻结下 Agent 持续进化"的工程化路径：不是靠更大的模型，而是靠把每一次执行经验固化成可维护的技能工件。经验从隐式的历史轨迹变成显式的 skill library——这让 Agent 的成长从玄学变成工程。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/memento-skills-let-agents-design-agents.md)

---

## 深度分析

**从"查旧账"到"长本事"的范式转变**：Memento-Skills 解决了一个根本性的认知错位——传统 memory 方案本质上是在历史数据中做检索匹配，模型的能力边界由预训练时的数据分布决定，后续执行只是在"已有的能力集中选择最优"。Memento-Skills 则是通过 feedback + writeback 机制，主动生成超越历史经验的全新技能。这意味着 Agent 不再只是在既有可能集中做选择，而是在不断拓展自己的能力集。这个转变类似于从"查找已有答案"到"生成新解题方法"的跃迁，是持续学习领域的一个实质性突破。

**技能路由器作为行为预测器的深层意义**：传统 embedding/BM25 路由器的局限在于：它们优化的是"语义相似度"，但语义相似不等于"任务执行成功"。Memento-Skills 用行为数据（positive/negative query）训练路由器，本质上是在构建一个"任务-技能执行效果"的映射模型。这个思路对应强化学习中的 Q-function——给定任务状态，预测哪个动作（skill）能获得最大奖励（task success）。InfoNCE 目标函数近似 soft Q-function 的设计，让路由器学会了比语义匹配更本质的东西：什么样的任务应该调用什么样的技能才能成功。

**三层写回策略与能力破坏的博弈**：Memento-Skills 的写回策略体现了对"灾难性遗忘"问题的深刻认识——局部修补优先，只在 utility 降至阈值时才生成新技能。这个设计哲学与参数空间的持续学习方法（如 EWC、LwF）形成有趣对照：参数持续学习试图在固定容量下平衡新旧能力，技能空间持续学习则在无限扩展的记忆体上优先复用而非新建。两种路径各有适用场景：参数空间方法适合计算资源受限的生产部署，技能空间方法适合追求最大能力覆盖的研究原型。

**技能库结构演化的信息价值**：GAIA 任务集中技能库增长到 41 个，而 HLE 同学科结构任务集增长到 235 个并形成主题簇——这个对比揭示了一个深层规律：任务结构的同质性越高，技能的分叉和专门化程度就越深。这对于设计真实世界的 skill 管理系统有重要启示：在高度异构的客服场景中，过于细粒度的技能划分反而增加路由负担；而在垂直领域的专家系统中，深度专门化的技能簇能显著提升任务完成率。

**单技能检索的架构瓶颈与多技能协同的前瞻**：当前 Memento-Skills 的单技能检索模型无法处理需要多 skill 协同的复杂任务——这实际上是整个 skill-based agent 架构面临的共同挑战。如何在技能图谱上做动态路径规划（而非静态路由），如何处理技能间的依赖关系和冲突检测，如何在执行过程中根据中间结果动态调整技能组合，这些问题的解决需要借鉴图规划、反应式执行和层级任务网络的思想。这是下一代 Memento-Skills 演化的核心方向，也是将 skill memory 从"工具箱"升级为"工作流引擎"的关键。

## 实践启示

1. **在生产环境中优先构建技能抽象层而非记忆检索层**：如果团队正在构建企业级 Agent 系统，应该优先考虑将高频成功模式固化为技能包（而非仅仅积累历史对话日志）。技能作为一等公民的可测试性、可版本化和可维护性，远优于原始轨迹存储。一个技能应该包含：执行脚本、验收标准、使用约束和性能基准，而不仅仅是一段 prompt。

2. **路由器训练需要行为数据而非语义标注**：在实现技能路由器时，不要依赖语义相似度做匹配，而应该用真实的"任务-执行结果"对训练路由器。至少需要构建：positive pairs（任务成功调用的 skill）和 hard negative pairs（语义相似但实际执行失败的 skill）。路由器的优化目标应该是 task success rate 而非 retrieval recall。

3. **写回策略应该区分"能力扩展"和"能力修复"**：当某个 skill 执行失败时，不应该立即创建新 skill，而应该先分析 failure 归因——是 skill 本身的行为错误，还是当前任务的特殊性导致现有 skill 不适用。只有当同类任务持续失败且无法通过局部修补恢复时，才应该生成新技能。这个判断阈值应该作为配置项而非硬编码，以便在不同业务场景中灵活调整。

4. **技能迁移评估应作为部署前的必须环节**：Memento-Skills 的实验数据明确显示，任务结构离散时技能迁移效果差。这意味着在实际部署中，跨任务复用 skill 时必须做迁移评估：选择部分历史任务在新的 skill 配置下重新执行，测量成功率是否在可接受范围内。如果迁移成功率低于阈值，应该选择重新训练而非直接部署。

5. **多技能协同场景需要引入技能图谱而非单技能检索**：当 Agent 需要处理需要多种能力协同的复杂任务（如先数据清洗、再分析、再可视化）时，应该构建技能依赖图并引入图遍历算法做动态规划。单技能检索模型在此类场景下是根本性瓶颈，需要从架构层面升级为技能编排引擎，支持顺序执行、并行执行和条件分支等复杂工作流模式。

---

**补充阅读**：

-  — Agent 自改进六条路全景图
-  — 三种记忆范式量化对比
-  — Hermes Agent 的自进化机制

---

