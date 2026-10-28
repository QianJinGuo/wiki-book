# SkillComposer: 生成式技能组合

> 📊 Level ⭐⭐⭐ | 10.9KB

## 摘要

SkillComposer 将 Agent 技能选择建模为闭集技能序列生成任务，用 3.9M 参数的轻量解码器联合预测技能子集、数量和顺序。在 SkillsBench 上让 GPT-5.2-Codex 通过率从 22.2% 提升至 45.3%（+23.1 pp），prompt token 比全库加载少 24 万。核心反直觉发现：TF-IDF 稀疏检索比 Dense Embedding 在短技能名闭集上表现更好，小专用模型（3.9M）在真实任务 holdout 上比 600M 全参 SFT 高 19.3 pp Set F1。

## 核心要点

1. **问题形式化**：将技能选择建模为「任务条件变长技能索引序列预测」，一次输出子集、基数、顺序三个耦合决策
2. **架构**：冻结 Qwen3-Embedding 编码器 + 3 层 256 维 AR 解码器 + 基数头/集合头辅助 + TF-IDF 检索增强 logit 融合，共 3.9M 可训练参数
3. **数据**：9,872 条训练数据（65 真人 + 9,807 合成），覆盖 196 个技能，依赖边+工作流边保证顺序合理性
4. **结果**：Codex +23.1 pp，Gemini +18.2 pp 通过率提升，接近金标上界（51.1%/48.4%）
5. **关键 insight**：Sparse (TF-IDF) + Dense (Embedding) 融合在短名称高辨析度技能库上优于纯 dense；小专用模型优于大模型全参 SFT

## 深度分析

### 技能组合的「推荐系统时刻」

SkillComposer 把技能选择类比为推荐系统的演进史：早期做法是 flat 相似度召回；后来业界才意识到「看几部」和「按什么顺序看」本身就是一个需要联合建模的决策。论文的关键动作是把生成式检索（Generative Retrieval）的思路从文档 ID 搬到技能 ID：解码器的输出空间就是技能库里的闭集索引，而不是自然语言。这一点让「生成式」在这里变成可验证的——每个 token 都对应一个具体、可执行、可检查、可复现的技能，模型没法靠语言流畅性糊弄过去，对错在 Set F1 上一目了然：闭集约束把生成改写成了可打分的判别问题，代价是输出空间被锁死在库内。而「全库灌 prompt」之所以从一开始就方向错了——196 个技能全量注入约 1.27M token，Agent 还没开始推理，上下文预算就被清单吃光——正是 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 所指的结构性浪费：花在「可能的答案」上的 token 挤掉了「当前的推理」。

### 为什么子集、数量、顺序必须联合决策

把三者拆开做——先检索无序子集、再另开模型排序、最后猜数量——误差会逐级累积，每一步还拿不到另外两步的约束信息。SkillComposer 强调的是三者天然耦合：数量决定子集该取多稀疏，顺序又反过来影响哪些技能值得入选（后一个技能可以条件于前一个的输出语义）。这在多步流程里尤其致命——数据分析、CI 修复、科学计算这类任务的技能计划本身就是一条有依赖关系的工作流，属于 [Agentic 工作流模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-workflow-patterns.md) 里的典型形态，「选哪些」和「按什么顺序跑」不是两个问题，而是同一个计划的两个投影。论文因此把它形式化为「给定任务加固定技能库，预测一条可执行的技能计划」，并要求解码器每步条件于已选前缀，使技能间的语义依赖在生成过程中可被利用。

### 辅助头的梯度价值

纯自回归头有一个结构性弱点：监督信号极稀疏。一个技能只在它被生成的那个位置收到正梯度，其他位置全是「不该生成它」的负信号，模型要排到第几位才知道自己该不该被选。这正是基数头（Cardinality Head）和集合头（Set Head）存在的理由——前者直接从任务向量预测「需要几个技能」，后者对每个技能独立打分判断是否该出现，两者提供的都是 order-agnostic 的梯度，把训练信号从「位置相关」变成「成员相关」。消融实验量化了这份先验的价值：去掉 set-fusion 掉 7.1 Set F1，去掉检索 prior 掉 4.6。换句话说，解码器本身只贡献了能力的一部分，真正让闭集组合稳定收敛的，是这些「提前把答案的形状告诉模型」的辅助监督。

### Sparse 与 Dense 的分工

论文最反直觉的一条结论是：在 196 个短技能名构成的闭集上，TF-IDF 稀疏检索比 dense embedding 高 2.5 个点 Set F1。原因不难解释——技能名短、辨析度高，dense 的优势（语义泛化、跨表述匹配）反而把区分度压平了。于是 SkillComposer 的做法是分工而不是二选一：任务编码走 dense（冻结的 Qwen3-Embedding-0.6B 把 prompt 映射成任务向量），解码时的先验走 sparse（TF-IDF 余弦相似度），每步 logit 是三路信号融合——AR 头 + TF-IDF 相似度 + 集合头成员先验。工程意义超过论文本身：稀疏与稠密不是新旧替代关系，而是分别负责「快速判别」与「语义理解」的两把工具；候选集是高辨析度的符号化条目（技能名、工具名、API 名）时，别默认 dense 更强，先做一次 A/B 比凭直觉选型便宜得多。这与 [Agentic Retrieval](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-retrieval-for-amazon-bedrock-managed-knowledge-base.md) 一类检索式 Agent 的经验一致——检索层该由候选集性质决定，而非流行度。

### 3.9M 击败 600M：规模 vs 专用性

分布内技能预测上，SkillComposer 拿到 73.9 Set F1 / 86.5 R@5 / 75.0 MRR，全面超过 600M 全参 SFT 的 71.1 / 79.2 / 74.1，而可训练参数少了约 154 倍。真实任务 holdout 上差距更大：SkillComposer 62.9 Set F1，SFT 只有 43.6，即 19.3 pp 的领先。更值得看的是跌幅而非绝对值——SFT 从合成到真实跌 27.5 pp，SkillComposer 只跌 11.0 pp，说明小专用模型的优势不只是拟合更准，架构上的归纳偏置（闭集输出、检索先验、辅助头）也起到了正则化作用，对分布漂移更鲁棒。

但适用边界要说清楚：这条结论的前提是任务被收窄成一个闭集组合问题。一旦输出空间开放、需要通用语言能力兜底，600M 级通用底座仍不可替代——它替代的不是基座模型，而是「用基座模型做组合决策」这条路径。评估这类主张要先固定 holdout 与上界，参见 [Agent 评测基准框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)。

### 局限与展望

第一个边界是数据构成：9,872 条训练数据里只有 65 条真人锚点（SkillBench 软件工程任务），其余 9,807 条由 Gemini 2.5 Flash / Pro 合成，覆盖 196 个技能。依赖边与工作流边被写入合成数据以保证顺序合理，但模型学到的其实是「合成者认为合理的顺序」——顺序监督的质量上限由合成模型而非真实执行反馈决定。

第二个边界是泛化面：技能库固定 196 个、任务以软件工程为主，依赖图靠元数据 I/O 与轨迹共现挖掘，新领域与新技能库上的迁移未经验证；闭集假设一旦松动（库持续增长、技能改名或废弃），检索先验与输出空间都需重新校准。

第三个边界是问题范围：技能创建（skill creation）与技能组合（skill composition）是正交的两个问题，SkillComposer 只解后者——它能决定「用哪几个、用几个、怎么排」，但不产生新技能，也不判断技能本身写得好不好，后者属于 [技能写作与评估](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md)。因此它最现实的定位是 Harness 里一个可插拔的组合器组件，而非技能体系的全栈方案。

## 实践启示

1. **别整库灌 skill 进 prompt**：196 个 skill 已 1.27M token；全库加载也只把 Codex 通过率从 22.2% 抬到 29.3%，库再涨 Agent 直接窒息。
2. **top-k 检索只是下限**：检索 top-3 到 44.0% 已经接近 SkillComposer 的 45.3%，但它给不出数量、也给不出顺序——多步流程（数据分析、CI 修复、科学计算）必须显式建模这两件事。
3. **小专用模型 > 大模型硬 SFT**：3.9M 可训练参数在真实任务 holdout 上比 600M 高 19.3 pp Set F1，且合成到真实的跌幅只有后者的一半——闭集组合不需要堆通用语言能力。
4. **Sparse + Dense 混搭**：任务编码用 dense embedding，解码先验用 TF-IDF；短名称、高辨析度的闭集上，稀疏检索不是遗留技术而是更优解。
5. **用辅助监督喂「答案的形状」**：基数头 + 集合头提供 order-agnostic 梯度，比只靠 AR 头硬监督更稳（去掉 set-fusion 掉 7.1 Set F1）；任何序列生成式的选择任务都值得考虑加这类辅助头。
6. **先量化上界再挑方案**：金标技能的通过率上界是 51.1%（Codex）/ 48.4%（Gemini），SkillComposer 已到 45.3% / 44.0%——选型时先算清「理想组合器最多能到多少」，再判断剩余 gap 值不值得继续投入。

## 相关实体

- [Agent Skills 完整指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-complete-guide-alibaba.md)
- [Agent 协议到 Harness Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Claude Code Skills/MCP/Rules 分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)

→ [原文存档](https://mp.weixin.qq.com/s/h4TDzw-6YSc93DSi4hxzDg)

---

