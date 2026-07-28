# NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

## Ch07.067 NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

> 📊 Level ⭐⭐ | 6.1KB | `entities/neurips-2026-rebuttal-skill.md`

# NeurIPS 2026 Rebuttal Skill — 开源论文回复 Skill 工作流

## 摘要

港大 NLP 组博士生李磊开源了 Rebuttal Skill，可直接加载到 OpenCode、Claude Code、Gemini CLI 等支持 skill 的工具中使用。该 skill 将论文 rebuttal 经验整理为两阶段工作流：第一阶段分析 review 的核心问题与深层次质疑，第二阶段生成结构化的 rebuttal 回复。李磊曾在 EMNLP 2023 获最佳长论文奖，2025 年获评 EMNLP 杰出 AC，其将多年审稿经验沉淀为可复用的 agent skill，帮助作者在 rebuttal 阶段做出更有效的决策。

## 核心要点

- **两阶段工作流**：Stage 1 分析 review 拆解为独立问题并判断真实疑虑与严重程度；Stage 2 在作者提供真实结果后核实对应关系并组织回复
- **优先级排序机制**：Stage 0 先评估本轮 rebuttal 的可操作空间，将实验按 P0-P3 分级排序，无法回应核心疑虑的实验标记为 `DO NOT RUN`
- **多视角理解审稿意见**：rebuttal 应从审稿人和 AC 两个视角理解意见，而非逐条回复——多位审稿人共同关心的问题合并回答，核心问题放在前面
- **五种输出模式**：分别对应 review 分析与实验规划、结果整合、完整 rebuttal、重投计划和已有回复质量检查
- **禁止编造数据**：skill 禁止编造实验数字，不能把计划中的实验写成已完成，也不能隐藏负面结果；信息不足时保留明确占位符

## 深度分析

### 从审稿经验到可复用 Skill 的知识工程

李磊将六年的审稿经验（包括 EMNLP 2023 最佳长论文奖、2025 杰出 AC）转化为 agent skill，这本身是一次成功的**知识工程实践**。不同于传统的"rebuttal 攻略"文档，skill 将决策流程形式化为可执行的 agent 工作流，降低了经验传递的衰减率。核心创新不在于"回答什么"，而在于**决定不回答什么**——优先级排序机制将稀缺的 rebuttal 资源集中在真正影响决定的少数问题上，这是资深 AC 与新手作者之间的关键认知差。

### P0-P3 优先级框架的决策逻辑

skill 的优先级排序依据不仅是实验难度，还包括三个维度：
- **问题权重**：该问题是否被多位审稿人共同提出（共识越强，优先级越高）
- **影响力度**：对最终决定的影响程度
- **复用价值**：一项实验能否同时回应多个问题

例如，一组计算量对齐的 baseline 比较可以同时回应公平性、效率和对照不足三个质疑，这种"一石多鸟"的实验会被置于最高优先级。这一框架本质上是一个**基于有限资源的决策优化问题**，与软件工程中的 MoSCoW（Must have / Should have / Could have / Won't have）优先级方法有异曲同工之妙。

### "先判断，再行事"的原则

Rebuttal Skill 与普通 rebuttal 写作工具最本质的区别在于：**先决定哪些问题值得投入、哪些实验应该优先、哪些任务可以放弃，再开始组织回复**。Stage 0 的 PROMISING / BORDERLINE / LOW EXPECTED RETURN 三级分类对应不同的投入策略：
- PROMISING：以少量关键实验巩固正面信号
- BORDERLINE：用关键实验或更准确的解释争取翻转
- LOW EXPECTED RETURN：转向事实澄清、论文修改和重投准备

这避免了作者陷入"每条审稿意见都同等重要"的常见误区，防止 rebuttal 篇幅越写越长而核心问题被淹没。

### Agent Skill 作为学术工作流的新范式

Rebuttal Skill 代表了一类新兴的工具范式：**将专家经验编码为 agent skill，而非传统的文档或模板**。skill 可以直接集成到编码 agent 的工作流中（OpenCode、Claude Code、Gemini CLI），使其成为学术写作工具链的一个可组合组件。未来可能会有更多同类 skill 出现——实验设计、论文结构优化、参考文献管理等——形成学术 AI agent 的 skill 生态。

## 实践启示

1. **在 rebuttal 前先运行 Stage 0**：不要拿到审稿意见就开始逐条回复。先判断本轮 rebuttal 的可操作空间，确认哪些问题值得深入、哪些实验可以放弃，可以提高有限时间内的投入产出比。

2. **合并多位审稿人的共同关切**：不要按照审稿人编号顺序展开回复。将多位审稿人共同关心的问题合并回答，核心问题和新增实验结果放在前面，方便 AC 快速抓住重点。

3. **语气克制、专业**：可以纠正误解，也可以指出评价与事实不符，但不要攻击审稿人，更不要直接要求改分。审稿人和 AC 都是同行学者，专业态度本身就构成一个正向信号。

4. **能补的实验补数据，不能补的写清计划**：有数据就用量化结果直接回应；暂时做不完的，要写清实验设计、验证目标和后续修改计划——这比空泛承诺更可信。

5. **将 skill 思维引入学术工作流**：将可重复的经验性决策（rebuttal、实验规划等）形式化为 agent skill，不仅能提高个人效率，还能在团队内标准化传播最佳实践。

## 相关实体

- [Skill 编排与依赖管理](../ch04/273-skill.html)
- [Agent Skill 系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [开源模型与学术生态](../ch09/071-kimi-k3.html)
- [Hermes Agent Skill 设计分析](../ch01/334-hermes-agent-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/neurips-2026-rebuttal-skill开源-ac开源.md)

---

