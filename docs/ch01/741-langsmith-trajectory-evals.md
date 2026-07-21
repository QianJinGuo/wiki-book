# Langsmith Trajectory Evals

## Ch01.741 Langsmith Trajectory Evals

> 📊 Level ⭐⭐ | 6.3KB | `entities/langsmith-trajectory-evals.md`

# LangSmith Trajectory Evaluations

LangSmith Trajectory Evaluations 是一种评估 AI Agent 行为的方法，特别适合具有明确步骤流程和决策路径的复杂工作流 。

## 核心要点

- agent 的很多行为只会在真实 LLM 运行里暴露
- trajectory eval 可以评估消息、工具调用和决策路径
- trajectory match 适合步骤明确的工作流
- LLM-as-judge trajectory eval 适合更灵活、更关注"过程是否合理"的场景
- reference trajectory 可以有，也可以没有

## 评估模式

| 模式 | 说明 |
|------|------|
| strict | 严格匹配，要求每一步完全一致 |
| unordered | 无序匹配，只要求包含相同的关键步骤 |
| subset | 子集匹配，允许缺少某些步骤 |
| superset | 超集匹配，允许添加额外步骤 |

## 为什么适合 wiki-evolver

`wiki-evolver` 既有一些强约束步骤，比如 orient / choose leverage track / govern / close out，也有一些开放式判断。因此它最适合：

- outcome rubric
- 配合轻量 trajectory checklist
- 而不是只看最终文字质量 

## 深度分析

**1. Trajectory Eval 填补了传统评估的盲区**

传统的 LLM 评估往往只看最终输出质量，而忽略中间过程。Agent 的很多有意义的行为——工具调用的选择、决策路径的合理性、错误处理的方式——只在真实运行中才会暴露 。这意味着如果你只评估输出结果，会错过大量关于 Agent 能力的重要信息。Trajectory eval 通过记录完整的消息序列、工具调用和决策点，使得评估者能够回溯和审查整个执行过程，而不仅仅是最终答案。

**2. 模式选择取决于工作流特性**

四种匹配模式（strict/unordered/subset/superset）反映了不同场景对"正确性"的不同定义 。strict 模式适合有明确标准操作流程的合规场景；unordered 适合步骤顺序无关紧要的情况；subset 允许灵活省略可选步骤；superset 则允许额外的防御性行为。理解这个权衡很重要：过于严格会因无关紧要的差异而拒绝正确的执行，过于宽松则可能放过真正的错误。

**3. Reference Trajectory 的有无是设计选择**

可以为 trajectory eval 提供参考轨迹，也可以不提供 。有参考轨迹时，评估更加定向和可解释；没有时，评估更加灵活，允许多种正确的实现路径。这种灵活性对于 AI Coding 场景特别重要，因为不同的工程师可能写出功能等价但风格不同的代码。

**4. LLM-as-Judge 扩展了评估的适用范围**

对于更灵活的、"过程是否合理"的评估场景，LLM-as-judge trajectory eval 比严格的字符串匹配更合适 。这种方法的优点是可以处理开放式的判断（如"这个决策是否合理"），缺点是引入了 judge 模型本身的偏见。在 [Agent Harness Engineering Survey 2026](../ch05/115-harness-engineering.html) 实践中，这种混合方法特别有价值，因为既需要确保关键步骤不遗漏，又需要允许合理的工程自由度。

**5. 与 [Multi Agent Architecture Retail Practice](../ch03/046-agent.html) 的关联**

在多 Agent 系统中，单个 Agent 的 trajectory eval 可以组合成整个系统的行为评估。每个 Agent 的工具调用和决策路径被记录，然后通过 LLM-as-judge 进行综合判断 。这对于管理复杂的虚拟工程团队（如 gstack 模式）至关重要，因为需要确保每个专家角色的行为符合其职责定义。

## 实践启示

**1. 为你的 Agent 工作流选择正确的匹配模式**

在设计 trajectory eval 之前，先分析你的工作流：步骤顺序是否重要？是否允许变体？是否有可选的防御性步骤？对于  中的 orient/choose/govern/close 流程，大多数步骤有相对固定的顺序（strict 或 superset），但某些开放式判断步骤可以接受 unordered 或 subset 匹配。错误的模式选择会导致大量误报或漏报。

**2. 用轻量 checklist 补充 outcome rubric**

不要只依赖最终输出评估。为每个关键决策点创建轻量级的 checklist，例如"是否调用了正确的工具"、"是否在合理的尝试次数内完成"。这种组合比单独使用任一方法都更稳健 。

**3. 记录足够的上下文以支持事后分析**

Trajectory eval 的价值不仅在于自动化评分，还在于支持人工复盘。确保记录足够的信息：每个工具调用的输入输出、LLM 的推理过程、关键决策点的上下文。这些数据对于迭代 Agent 设计至关重要。

**4. 从 reference trajectory 开始，逐步放开约束**

如果有已知的良好执行路径，从 reference trajectory 开始可以帮助建立评估基线。随着对 Agent 能力的信心增长，可以逐渐放宽约束，允许更多的实现变体。这种渐进式的方法比一开始就追求完美评估更加务实。

**5. 将 trajectory eval 集成到 CI/CD**

在代码变更时自动运行 trajectory eval，可以及早发现回归。关键是选择合适的触发条件（不一定要每次提交都运行完整的 trajectory eval），并确保评估时间在可接受的范围内。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/langsmith-trajectory-evals.md)

---

