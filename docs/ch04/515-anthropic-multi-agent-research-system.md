# Anthropic Multi Agent Research System

## Ch04.515 Anthropic Multi Agent Research System

> 📊 Level ⭐⭐ | 4.7KB | `entities/anthropic-multi-agent-research-system.md`

# Anthropic Multi-Agent Research System

## Evaluation-relevant takeaways

多 agent 系统不应只检查"有没有走预定义路径"。很多任务存在多条有效路径，因此评估应更关注 outcome 是否正确、过程是否合理。早期小样本测试就很有价值，不必等到几百条样本。多 agent / orchestration 系统应优先围绕真实使用模式设计 eval suite 。

## Why it matters for this vault

`wiki-evolver` 虽然不是纯多 agent 系统，但它也是 orchestration system。它的评估要避免把"固定步骤完全一致"当成唯一正确性标准，而应允许不同路径得到同样有效的 durable outcome 。

## 深度分析

**1. 路径正确性 vs 结果正确性的评估范式转移**：传统软件测试关注"是否按预设步骤执行"，但多 agent 系统的本质是探索性任务执行——相同目标可能有多条等效路径。Anthropic 的研究明确指出，多 agent 评估应关注 outcome 正确性和过程合理性，而非路径一致性。这对整个 AI 评估领域都是范式层面的修正 。

**2. 小样本早期测试的工程价值**：不必等到几百条样本才做评估——多 agent 系统的行为模式往往在 10-20 条样本时就已经暴露主要问题。这种"快速原型验证"思路与 [Thin Harness Fat Skills](../ch05/072-thin-harness-fat-skills-ai.html) 中 Fat Skills"固化高质量反馈流程"的方法论相通，都是通过尽早获取有效信号来降低迭代成本 。

**3. Eval Suite 设计应以真实使用模式为中心**：文章强调"优先围绕真实使用模式设计 eval suite"，而非依赖理论推导的合成任务。这意味着评估集的质量取决于对实际用户行为的理解深度，而不是合成任务的规模。这对任何生产级 AI 系统的评估体系设计都有指导意义 。

**4. Orchestration 系统的评估特殊性**：wiki-evolver 等 orchestration 系统因为涉及多组件协调，评估难度更高。固定步骤完全一致作为正确性标准过于脆弱——它只能验证"没有偏离预设"，而无法验证"是否解决了真正的问题"。这与 [Claude Code Harness Deep Dive Founder Park](../ch05/062-claude-code-harness.html) 中 Claude Code 的 checkpoint/rollback/fork 机制形成有趣的呼应：两者都在解决"如何评估不确定性执行"的问题 。

## 实践启示

1. **为多 agent 系统设计双轨评估指标**：除了传统的路径合规性指标，必须加入 outcome 质量指标（如任务完成率、结果有效性）和过程合理性指标（如资源消耗、步骤效率）。三条轨道并行评估才能全面反映系统能力 。

2. **在 10-20 条样本时进行早期评估验证**：在投入大规模评测资源前，先用小样本快速暴露主要行为问题。这种方法对  中 Sub-Agent 隔离测试同样适用——独立 Context 预算的 Sub-Agent 可以用小样本快速验证其行为模式 。

3. **围绕真实使用场景构建 eval suite，而非合成任务**：评估集的生命力来自对实际用户行为的理解。建议在系统设计初期就记录真实使用日志，从中提取典型任务模式，再将其转化为评估用例 。

4. **允许等效路径得到等效评分**：评估系统应能识别"不同路径到达相同正确答案"的情况，而非机械地要求步骤完全一致。这要求评估系统本身具备路径等价性的判断能力 。

5. **在 wiki-evolver 等 orchestration 系统中引入 durable outcome 概念**：将"任务是否产生了持久价值"作为评估维度之一，而非仅关注即时结果。这与  中 Skill 文件"随使用自动复合进化"的理念相通——好的系统其价值应该是累积和持久的 。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-multi-agent-research-system.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

