# Anthropic Multi Agent Research System

> 📊 Level ⭐⭐⭐ | 5.8KB

## Anthropic Multi-Agent Research System

## Evaluation-relevant takeaways

多 agent 系统不应只检查"有没有走预定义路径"。很多任务存在多条有效路径，因此评估应更关注 outcome 是否正确、过程是否合理。早期小样本测试就很有价值，不必等到几百条样本。多 agent / orchestration 系统应优先围绕真实使用模式设计 eval suite 。

## Why it matters for this vault

`wiki-evolver` 虽然不是纯多 agent 系统，但它也是 orchestration system。它的评估要避免把"固定步骤完全一致"当成唯一正确性标准，而应允许不同路径得到同样有效的 durable outcome 。

## 深度分析

raw 文章的三条主张——outcome 优先、早期小样本、围绕真实使用模式设计 eval——指向同一个评估观：多 agent 系统要评估的是"问题是否被解决"，而非"步骤是否被复现"。以下四节沿这条主线展开。

### 1. 为什么"路径一致性"是脆弱的正确性标准

多 agent 系统执行的是探索性任务：同一目标天然存在多条等效路径，预定义路径只是其中之一。把"是否走预设路径"当作正确性标准，等于把实现细节误认为任务目标——它只能证明系统"没有偏离预设"，无法证明"是否解决了真正的问题"。更合理的结构是把评估拆成两层：outcome 层检查结果正确性与 durable 价值；过程层只检查推理与资源消耗是否合理，而不是与模板逐字对齐 。

### 2. 小样本早期测试的信号经济学

"不必等到几百条样本"背后是成本结构判断：多 agent 系统的主要行为缺陷（路径死循环、工具误用、评估盲区）在小样本上就会高频复现，样本量增加只是稀释而非揭示这些信号。因此早期小样本测试的价值不在统计显著性，而在快速证伪——缩短"发现缺陷→修正系统"的回路，而非积累报告篇幅；实践启示部分的 10-20 条量级正是这一思路的操作化。这与 [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thin-harness-fat-skills.md) 中"固化高质量反馈流程、尽早获取有效信号"的方法论相通 。

### 3. 真实使用模式是 eval suite 的设计原点

围绕真实使用模式设计评估，意味着评估集的质量取决于对实际用户行为的理解深度，而非合成任务的规模。可操作的路径是：记录真实使用日志 → 提取典型任务模式 → 转化为评估用例，让 eval suite 随产品形态共同演化。合成任务在其中的位置是补充回归覆盖，而非评估主体——它无法保证与真实失败模式同分布 。

### 4. 对 orchestration 系统（如 wiki-evolver）的评估迁移

wiki-evolver 不是纯多 agent 系统，但 orchestration 的评估逻辑可迁移：正确性标准应允许"不同路径得到同样有效的 durable outcome"，而非固定步骤完全一致。这与 [Claude Code Harness Deep Dive Founder Park](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-harness-deep-dive-founder-park.md) 的 checkpoint/rollback/fork 机制形成呼应——两者都在处理"不确定性执行"的评估问题：先允许偏离，再用结果质量回收判断权。放入本 vault 的概念坐标系：这条主线一端连着 [Agent Evaluation Benchmark Frameworks](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)（评估框架层），另一端连着 [Agentic Workflow Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-workflow-patterns.md)（执行模式层）——执行层越灵活，评估层就越必须以结果与过程合理性为中心 。

## 实践启示

1. **为多 agent 系统设计双轨评估指标**：除了传统的路径合规性指标，必须加入 outcome 质量指标（如任务完成率、结果有效性）和过程合理性指标（如资源消耗、步骤效率）。三条轨道并行评估才能全面反映系统能力 。

2. **在 10-20 条样本时进行早期评估验证**：在投入大规模评测资源前，先用小样本快速暴露主要行为问题。这种方法对  中 Sub-Agent 隔离测试同样适用——独立 Context 预算的 Sub-Agent 可以用小样本快速验证其行为模式 。

3. **围绕真实使用场景构建 eval suite，而非合成任务**：评估集的生命力来自对实际用户行为的理解。建议在系统设计初期就记录真实使用日志，从中提取典型任务模式，再将其转化为评估用例 。

4. **允许等效路径得到等效评分**：评估系统应能识别"不同路径到达相同正确答案"的情况，而非机械地要求步骤完全一致。这要求评估系统本身具备路径等价性的判断能力 。

5. **在 wiki-evolver 等 orchestration 系统中引入 durable outcome 概念**：将"任务是否产生了持久价值"作为评估维度之一，而非仅关注即时结果。这与  中 Skill 文件"随使用自动复合进化"的理念相通——好的系统其价值应该是累积和持久的 。

→ [原文存档](https://www.anthropic.com/engineering/multi-agent-research-system)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/workflow-orchestration.md)

---

