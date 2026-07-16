# 翁荔再写万字长文：AI自我改进，先从Harness开始

## Ch05.059 翁荔再写万字长文：AI自我改进，先从Harness开始

> 📊 Level ⭐⭐ | 8.7KB | `entities/翁荔再写万字长文ai自我改进先从harness开始.md`

# 翁荔再写万字长文：AI自我改进，先从Harness开始

> AI 自我改进短期内最先被改写的，可能不是模型权重，而是模型外层的 Harness。从 ACE 到 DGM，Agent 不只是在 Harness 里完成任务，也开始修改 Harness 本身。

## 摘要

2026 年 7 月 4 日，翁荔在 Lil'Log 发布《Harness Engineering for Self-Improvement》，系统性地梳理了 AI 自我改进的技术路径。文章的核心论点是：**短期内，AI 自我改进的现实起点不会是模型直接重写自身权重，而是先让外层运行系统（Harness）变得更稳定、更可验证。** 自动科研、自我改进 Agent、进化式程序搜索被放进同一条线索中重新审视，揭示出一条清晰的递进线：提示词 → 结构化上下文 → 工作流 → Harness 代码 → 优化器代码。

## 核心要点

- **Harness 即操作系统**：Harness 是围绕基础模型运行的一整套系统，负责任务编排、工具调用、上下文管理、产物存储和结果评估——类比操作系统的内核，复杂逻辑被封装在底层
- **递进优化线**：提示词工程 → 结构化上下文（ACE） → 工作流自动化（AFlow） → Harness 代码修改（Self-Harness） → 优化器代码（AlphaEvolve、DGM）
- **评估是第一性原理**：无论是 Harness 演化还是模型权重更新，评估始终是最大的瓶颈——开放研究任务缺少快速、精确的验证器，容易导致 reward hacking 和多样性坍缩
- **模型能力决定上限，Harness 决定下限**：基础模型越强，Harness 的优化空间越大；但弱模型上 Harness 改进可能出现退化（如 Zelikman 实验）
- **可编辑区域的边界**：Harness 可以改操作系统级的逻辑，但权限控制和安全层应位于这个循环之外

## 深度分析

### 从上下文工程到 Harness 演化的递进逻辑

翁荔将 AI 自我改进的路径概括为一条清晰的递进线。第一步是**上下文工程**：简单地将所有工具返回和模型输出追加进上下文很快会失控。ACE 系统将上下文视为持续演化的 playbook——Generator 产生任务轨迹，Reflector 从成功和失败中提炼经验，Curator 将经验整理成结构化条目更新到上下文。MCE 进一步把上下文管理机制也纳入优化循环。

这一步之后是**工作流自动化**。AI Scientist 展示了专家设计的 Harness 如何串起选题、代码、实验、写作和评审；ScientistOne 则将可验证性放在核心位置。AFlow 将工作流表示为一个可搜索的图，用 MCTS 在不同工作流之间搜索最优结构。这与 `Harness Engineering 框架` 中的工作流设计原则相互呼应。

### Self-Harness：让 Harness 本身成为优化对象

Self-Harness 是这篇文章中最具突破性的概念。当提示词、工具调用、子 Agent、控制流、记忆和评估逻辑都写进代码，Harness 就不再只是运行环境，也变成了一段**可修改的系统代码**。核心流程是：系统先用当前 Harness 运行任务 → 收集执行轨迹并聚类失败模式 → 让同一模型查看失败案例并提出范围受控的修改方案 → 在已用任务上检查弱点是否修复 → 用留出任务检查是否引入新问题。

**只有不带来退化的候选改动才会合并进下一版 Harness。** 在 Terminal-Bench-2 上，Self-Harness 还能为不同基础模型学到模型特定的 Harness 指令。这与 Self-Harness Agent 改进循环的具体实现一致。

### DGM 与进化搜索的可规模化路径

DGM（Darwinian Agent Improvement）直接将进化搜索应用于 Agent Harness 代码库。系统从一个代码 Agent 池开始，每轮根据性能和已有子代数量选择父代；被选中的 Agent 查看自身评测日志，修改 Harness 代码库生成新版本；新 Agent 经过评估后，表现足够好才加入池中。在 Claude 3.5 Sonnet 作为基础模型的实验中，DGM 发现的 Agent 在 SWE-bench Verified 上从 20% 提升到 50%，在 Polyglot 上从 14.2% 提升到 30.7%。

然而这类方法适合候选方案容易自动评估的场景（矩阵乘法、GPU kernel 优化、算法竞赛）。进入评估慢、标准模糊、依赖启发式判断的领域，计算效率和有效性都会成为问题。

### 评估：始终是绕不开的瓶颈

文章反复回到同一个主题——评估。AI Scientist 可以写出看似可信的论文，但同时存在伪造引用、实现漂移、实验结果薄弱等问题。Trehan 和 Chopra 的研究显示，大模型生成的研究想法中只有 4 个被人类专家选中进入完整流程，最终只有 1 个完整执行成论文。失败模式包括方法漂移、长程记忆退化、过度乐观、领域判断不足。

评估器和权限控制很可能**不能**放进 Harness 自我进化循环内部。更稳妥的设计是用留出测试、轨迹审计以及关键节点的人类审查来约束系统。这也是 `Harness Engineering 的持久化与侵蚀` 中强调的安全边界问题。

### 从研究到工程的桥梁

这篇文章的价值不只是概念梳理——它将 ACE、MCE、AFlow、Self-Harness、AlphaEvolve、DGM 等分散的研究工作放进同一框架，揭示了一条从"人工设计 Harness"到"让 Agent 参与修改 Harness"再到"Harness 自动进化"的演进路径。这与 [Agentic Harness Engineering 概念体系](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md) 中提出的"Agent 不只是运行在 Harness 之上，也在重塑 Harness"的论断完全吻合。

## 实践启示

1. **Harness 设计应从可观察性出发**：在构建 Harness 时，优先确保执行轨迹可记录、失败模式可聚类、改动效果可评估。没有可观察性的 Harness，自我改进无从谈起。

2. **渐进式自动化而非全盘替换**：从提示词工程开始，逐步过渡到结构化上下文管理（ACE 风格），再到工作流自动化（AFlow 风格），最后才是 Harness 代码的自动修改。每个阶段都需要前一阶段的验证能力作为基础。

3. **留出测试是自我改进的安全网**：当 Harness 开始自我修改时，必须保留一组留出任务用于检测退化。只有通过留出验证的改动才能进入生产环境。

4. **幂等执行是恢复的基础**：Agent 执行过程中任何失败都可能触发重试，所有有副作用的 Harness 操作（发消息、写文件、调付费 API）必须支持幂等检查，否则自动恢复会导致级联副作用。

5. **人类审查节点不可省略**：在自动评估尚不可靠的领域（科研、产品设计、安全审查），应在 Harness 工作流中嵌入人工审批节点。自动化的目标是减少人工负担，不是消除人类判断。

## 相关实体

- `Harness Engineering`
- `Harness Engineering 框架`
- `Agent Harness 工程综述`
- [Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md)
- `Agent Harness 生产实践`
- `翁荔 Harness Engineering 自我改进`

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/翁荔再写万字长文ai自我改进先从harness开始.md)

## 第 2 Source — PaperWeekly

> From WeChat MP PaperWeekly, supplemental coverage of the same topic.

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/翁荔再写万字长文ai自我改进先从harness开始-2026-07-08.md)

---

