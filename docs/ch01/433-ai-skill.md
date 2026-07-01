# AI Skill 测评指标体系

## Ch01.433 AI Skill 测评指标体系

> 📊 Level ⭐⭐ | 9.4KB | `entities/ai-skill-metrics-system.md`

## 八个核心指标
| 指标 | 公式/定义 | 核心阈值（S级） |
|------|----------|----------------|
| **通过率** | 断言通过数/总断言数×100% | ≥ 95% |
| **触发率** | 正确触发次数/总测试次数×100% | ≥ 95%（精确）/ TP≥80%（AI估算） |
| **增益 Δ** | with_skill通过率 − without_skill通过率 | **> 0（硬红线，Δ<0禁止发布）** |
| **IFR** | 正确遵循硬性规则次数/触发硬性规则总次数×100% | = 100% |
| **一致性** | 关键字段完全一致对比组数/总组数×100% | full模式才系统计算 |
| **稳定性** | 样本标准差（n-1公式） | σ < 0.05 |
| **幻觉检测** | 无法追溯来源的声明数量 | 0次 |
| **覆盖率** | 功能×0.5+路径×0.3+断言×0.2 | ≥ 95% |

## Δ < 0：最危险的指标组合
| 通过率 | Δ | 诊断 | 行动 |
|--------|---|------|------|
| 高 | 高 | Skill 质量好 | ✅ 正常发布 |
| 高 | ≈0 | Skill 无增量价值 | 评估是否需要存在 |
| 低 | >0 | 方向对但执行有问题 | 继续优化 |
| **低** | **<0** | **Skill帮倒忙** | **🔴 停止发布** |
| 高 | — | 覆盖率<50% | 补充用例 |
SkillsBench研究：84个任务中19%出现负向增益。

## 权威来源 vs 经验值
**有学术/工业来源：** 通过率（OpenAI Evals/HELM）、Δ（SkillsBench论文arxiv.org/abs/2602.12670）、触发率（Recall/Precision）、幻觉检测（TruthfulQA/FactScore）、稳定性（统计学标准差）
**内部经验值（无直接学术背书）：** S级通过率≥95%、IFR=100%、σ<0.05
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-skill-测评指标体系.md)
→ [AI Skill 测评体系：从零到一](ch04/245-skill.md)（系列主框架）

## 相关实体
- [Agentic AI 系统架构与分层模型](ch04/245-skill.md)
- [Hermes Agent Skill 系统深度解析](ch04/245-skill.md)

- [Skill工程化设计：把Agent当算法用](ch04/245-skill.md)
- [使用 Kiro AI IDE 开发 基于Amazon EMR 的Flink 智能监控系统实践 | 亚马逊AWS官方博客](ch04/150-ai.md)
- [LLM-as-a-Verifier: A General-Purpose Verification Framework](ch01/890-llm.md)
- [AgentEval：YAML驱动的Agent评测框架](ch03/044-agent.md)
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](ch04/252-lbs-intentbench.md)
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](ch03/044-agent.md)
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](ch04/133-skillos-learning-skill-curation-for-self-evolving-agents.md)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch04/245-skill.md)
- [Skills赏析：使用skills-refiner提升skill质量](ch04/245-skill.md)
- [harness-engineering-systematic-explainer](ch05/036-harness-engineering-systematic-explainer.md)
- [Agent 原理、架构与工程实践](ch04/441-agent-engineering-principles-architecture-practice.md)
- [AI Agent 工程师能力地图](ch04/150-ai.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 深度分析
### 九层洋葱结构的本质含义
AI Skill 测评指标体系的九层结构（触发→输出→规则→对话→容错→效率→设计→覆盖→维护）并非随意排列，而是一条**从用户感知到工程内核的洋葱剖面**。每一层对应不同的质量维度，层级越高意味着该维度的验证成本越大，但对发布决策的影响力也越直接。
三层测评模式（quick/standard/full）的递增覆盖逻辑揭示了一个关键规律：**外层指标（触发、输出）出问题，用户立刻能感知；内层指标（设计、覆盖、维护）出问题，则需要累积才能暴露**。这意味着 quick 模式通过不等于发布安全——它只是拿到了"用户体验层"的及格证。

### 增益 Δ 为什么是最危险的指标
SkillsBench 论文（arxiv.org/abs/2602.12670）对 84 个任务的研究揭示了一个被严重低估的事实：**19% 的任务出现了负向增益**。这意味着每约 5 个上线的 Skill 中，就有 1 个在帮倒忙。
Δ 的危险性在于它的隐蔽性。一个 Skill 的通过率可能是 92%（接近 S 级），但 Δ 为负值——模型在没有 Skill 辅助时反而表现更好。这种情况通常出现在 Skill 过度约束了模型的自由度的场景：规则写得太死，模型无法发挥本身能力。单纯盯通过率的团队会认为"92% 很不错"，但忽略了"这个 Skill 让模型变笨了"这个核心问题。
三条件对比范式（A/B/C）提供了一种更精细的判断框架：**人工精心设计的 Skill 未必优于模型自生成的 Skill**。B > C 说明人工约束有价值；B ≈ C 说明人工 Skill 边际收益低；B < C 说明人工 Skill 过度约束。

### IFR 与通过率的解耦发现
传统认知中，通过率是综合指标，IFR 是其子集。但实际情况恰恰相反：**IFR 揭示了通过率可能掩盖的问题**。一个 Skill 可以通过率 92% 但 IFR 只有 80%——意味着有 20% 的情况下违反了关键硬性规则（如必须、禁止、固定为这类强制指令）。
这说明通过率是"总分"，IFR 是"关键科目的单科成绩"。通过率达标不能掩盖 IFR 不合格。S 级要求 IFR = 100% 是有道理的：涉及资金、审批、报销等场景下，20% 的规则违反概率可能导致严重的业务风险。

### 一致性评分与触发率的深层矛盾
一致性（Consistency Score）和触发率（Trigger Rate）之间存在一个深层张力：**触发率衡量的是"该出手时是否出手"，一致性衡量的是"出手后输出是否稳定"**。前者是召回问题，后者是精度问题。
Claude 的 undertrigger 倾向揭示了一个工程实现上的陷阱：Description 写得过于中性，模型会选择保守策略不触发 Skill，导致触发率偏低。解决方案是让 Description 稍微"pushy"——明确写出"即使用户没有明确说，遇到 X 情况也要使用"。

## 实践启示
### 诊断优先级：Δ → 通过率 → 覆盖率
看到测评结果时，第一眼应该看 Δ，而不是通过率。Δ < 0 是硬红线，无论通过率多高都要停止发布。通过率 < 95% 但 Δ > 0 说明方向对了，只是执行有问题，应该继续优化而非停止。
覆盖率是第三个参考维度：高通过率 + 正 Δ + 低覆盖率（<50%）意味着测评不充分，需要补充用例。完整模式下的覆盖率计算（功能×0.5+路径×0.3+断言×0.2）是目前最合理的综合评分方式。

### INCONCLUSIVE 的处理原则
INCONCLUSIVE（无法验证）不等于失败，但必须单独处理。原则是：**INCONCLUSIVE 用例不计入通过率，但必须配套补充计划**。常见根因有三类：测试资产不匹配（如测发票检测但只有汽油发票）、账号权限受限、数据过期。补充对应资产后重新跑用例，不能直接跳过。

### Claude undertrigger 的应对策略
如果 AI 估算的触发率 TP 值偏低（70-80%），首要排查的是 Description 是否足够"pushy"。具体做法：在 Description 中明确列出触发场景，尤其是"即使用户没有明确说，遇到以下情况也要使用"这类表述。不要假设模型会主动推断——明确写出来。

### 稳定性监控的行动阈值
标准差 σ 是最直接的稳定性预警信号：< 0.05 正常；0.05-0.10 观察；0.10-0.30 检查 prompt 歧义；> 0.30 立即排查 Skill 规则冲突。不要等到上线后才发现稳定性问题——测评阶段 σ > 0.30 应该立即停止发布流程。

### 纯文本 Skill 的特殊考量
纯文本 Skill（text_generation 类型，如写作、分析、问答）无法通过工具调用验证执行记录，幻觉检测难度更大。这类 Skill 的幻觉检测依赖评审 Agent 提取输出中的"隐含声明"并逐一核查。对于 S 级纯文本 Skill，0 次幻觉的要求意味着每一句涉及执行状态的描述都需要有对应证据。

---

