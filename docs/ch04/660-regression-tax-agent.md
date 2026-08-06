# Regression Tax: 技能包导致 Agent 性能退化的系统性分析

## Ch04.660 Regression Tax: 技能包导致 Agent 性能退化的系统性分析

> 📊 Level ⭐⭐ | 4.5KB | `entities/regression-tax-skills-hurt-llm-agents.md`

# Regression Tax: 技能包导致 Agent 性能退化的系统性分析

## 核心概念

**Regression Tax（回归税）** 是指为 LLM Agent 添加技能包（Skills）后，其在部分任务上获得增益的同时，在另一些原本能独立完成的任务上出现性能退化的现象。该概念由 Sentient Labs 在 arXiv:2607.22520 中系统提出，基于 **5,832 次配对对照实验**。

**关键数据**：553 次增益（Gain）伴随 324 次回归（Regression），**回归抵消 59% 的毛增益**。表现最优的技能库拉开差距的核心不是解锁更多新任务，而是搞砸的旧任务更少。

## 三种回归机制

### 1. Skill-Description Osmosis（技能描述渗透）
技能的描述文本常驻在系统提示词中，即使技能本身从未被调用，其描述内容持续参与模型的上下文推理，影响模型行为。

**案例 (UID0096)**：计算"关税率的中心移动平均值"。无 Skill 输出正确 37.708%。引入任意技能库后（技能全程未被调用），仅因描述中含"修订后数据"（revised figure）等词汇，模型输出 38.757% 被判错误。

Osmosis 具有双向性：在低调用率的栈上，未调用的技能带来更多增益而非损害。评估方法仅在技能被检索/调用时起作用，会完全漏掉这一通道。

### 2. Grounding Displacement（输入锚定偏移）
技能被调用时最主要的退化原因，占 OfficeQA-Pro 所有退化的 **72.8%**。技能自带的标准化流程强制覆盖模型原生的信息读取逻辑——模型不再根据题目匹配对应文档/表格/年份数据，而是机械套用技能步骤，读错原始素材。

### 3. Verification Displacement（输出校验失效）
技能抑制或取代 Agent 原本会执行的自我验证与输出检查环节。案例：计算绝对百分比变化，无 Skill 输出 +4.815（正确），加载 Skill 后输出 -4.816（符号错误），因技能流程中未包含符号验证步骤。

## 结构性问题

现有技能体系过度聚焦于 **Method（执行过程）**，对 **Grounding（输入理解）** 与 **Verification（输出校验）** 投入严重不足。

- OfficeQA-Pro：持续失败的任务根源集中于输入环节（读了错误数据源）
- SpreadsheetBench：34% 失败任务的公式逻辑正确，失败原因在于验证环节存在问题

## 实践建议

**评估层面**：
- 报告效果须从净通过率升级为增益 vs 回归的综合评估
- 分别测试三种条件：无 Skill、仅保留 Skill 描述（隔离渗透效应）、完整 Skill 包

**设计层面**：
- 技能重心从 Method 转向 Grounding + Verification
- 好的技能应包含：从哪里开始的定位信息（哪个表、哪一列、什么格式）+ 确认正确性的检查机制（结果条件、符号判断）

## 与现有工作的关系

不同于 ASSAY/GRASP/RSEA 等通过选择性丢弃/掩码来规避有害技能的方法，Regression Tax 研究聚焦于理解技能为何会导致退化——包括那些即使不被调用也会产生影响的描述渗透效应，这是基于选择/检索的方法无法覆盖的。

## 关联

- [AI Skill 测评底层逻辑](../ch07/010-ai-skill-evolution.html) — 技能测评的核心关注
- [Hermes Agent Skill 互优化实验](../ch01/521-hermes-agent-skill.html) — 技能自动化优化实践

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/regression-tax-skills-hurt-llm-agents-sentient-arxiv-2026.md)

---

