---
title: "达尔文.skill 2.0正式开源发布！让你的所有skill左脚踩右脚实现自我进化"
source: wechat
source_url: https://mp.weixin.qq.com/s/54pkSBImnc9mhEdOPf7EZw
author: 花叔
feed_name: 花叔
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
date: 2026-05-28
created: 2026-05-28
updated: 2026-05-28
tags: [darwin-skill, skill-evolution, self-improvement, skillopt, skilllens, microsoft-research, rubric-driven, validation-gated, agent, huashu]
type: article
provenance_state: synthesized
sha256: f834e99eaae4416640d6e462695b92e69db8d1da97f70e093c8b8140e7ee92a1
---

# 达尔文.skill 2.0正式开源发布！让你的所有skill左脚踩右脚实现自我进化

> **来源**：花叔，2026年5月28日
> **仓库**：https://github.com/alchaincyf/darwin-skill（MIT）
> **参考论文**：arXiv 2605.23899 (SkillLens)、arXiv 2605.23904 (SkillOpt)

## 一句话

花叔发布达尔文.skill 2.0——基于微软 SkillOpt/SkillLens 论文升级的 self-evolving skill 优化器，9维评分 + 多评委独立审查 + validation-gated 回滚 + human-in-the-loop，近30个 skill 平均涨幅 +15 分。

## 背景：1.0 已验证价值

达尔文 1.0 核心机制：多维度评分标准 + 每轮只改最低维度 + 分数没涨自动回滚 + 写 skill 的 AI 和评分的 AI 分开。

运行一个月：平均涨 13.5 分，0 回滚。但 0 回滚不完全代表算法神准——松散评分标准下 AI 评委的判断可能只是随机骰子。

## 微软同一天挂的两篇论文

### SkillLens（arXiv 2605.23899）：AI 评委给 skill 打分准确率只有 46.4%

**问题**：单 AI 评委给两份 skill 打分选哪个更好，准确率 46.4%——比扔硬币还差 3.6 个百分点。

**药方**：评分标准加三个关键维度，准确率从 46.4% 升到 **73.8%**：
1. **失败模式编码（Failure Mechanism Encoding）**：必须写清楚「什么情况下会出错、出错了走哪条分支」
2. **可执行具体性（Actionable Specificity）**：「建议」「可以考虑」「灵活把握」全部禁止
3. **高风险行动黑名单（High-Risk Action Blacklist）**：必须有独立的「绝对不要做什么」章节

### SkillOpt（arXiv 2605.23904）：把 skill 当成神经网络的外部可训练参数

**核心思想**：skill 文档应被当成 frozen 模型的「外部可训练状态」，通过反向传播来优化——本质是让模型跑真实任务、看哪些版本更好、保留好的淘汰差的。

**四阶段优化循环**：
1. **Rollout**：目标模型用当前 skill 跑真实任务，生成带分数的轨迹
2. **Reflect**：独立优化器模型分析成功/失败批次，识别可复用规律
3. **Edit**：在「文本编辑预算」约束下，提议 skill 文档的增/删/改操作
4. **Validate**：留出的测试集分数**严格提升**才接受；否则拒绝

**关键原则**：验证不通过就拒绝——把神经网络「梯度方向必须降低 loss」的原则搬到文本空间。

**结果**：6 benchmark × 7 模型 × 3 执行环境 = 52 个组合，全部最强或并列最强。

## 达尔文 2.0 升级

### 评分标准从 8 维升级到 9 维（吸收 SkillLens）

| 维度 | 变化 |
|------|------|
| 错误处理 → **失败模式编码** | 要求写「如果 X 发生就做 Y；否则做 Z」明确分支 |
| 明确性 → **可执行具体性** | 明文禁止五个软化措辞，三处以上扣三分 |
| **新增第九维**：高风险行动黑名单 | 独立「不要做什么」章节 |

### 强化验证机制（对齐 SkillOpt + 多评委独立设计）

1. **多评委独立审查**：每轮启动两个独立评委，共识分数才算数
2. **评委不复用**：下一轮启动两个全新评委，避免锚定效应
3. **早停机制**：单轮涨幅 <1 分自动停手，避免为凑分堆冗余
4. **干跑模式控制**：干跑比例超过 30% 自动告警，强制实测验证

### 加入 Human in the Loop（区别于 SkillOpt 的核心）

SkillOpt 是全自动 benchmark-driven，达尔文 2.0 是 rubric-driven + human-in-the-loop 双引擎——每个 CHECKPOINT 等用户确认，关键决策不交给 AI。

## 实际效果

**对自己文档的递归优化**（花叔用达尔文 2.0 优化达尔文 2.0 的文档）：
- 版本管理疏漏：描述写「8维」正文已9维 → 修完
- 检查点未显性标记：全部只用粗体强调，没有 🔴/STOP → 加上
- 软化措辞超标：四处违规 → 硬化
- 结果：86.05 → 92.05

**跑整个 skill 生态**：近 30 个 skill，平均涨幅 **+15 分**
- steve-jobs-perspective：64 → 94（+30，单轮搞定）
- huashu-gpt-image：80.8 → 91.65
- darwin-skill：86.05 → 92.7

## 达尔文 vs SkillOpt：分工而非替代

| 维度 | SkillOpt | 达尔文 2.0 |
|------|----------|-------------|
| 定位 | 企业级、全自动 | 个人开发者、轻量 |
| 评估方式 | Benchmark-driven（有客观 metric） | Rubric-driven（无客观 metric 也可用） |
| Human in loop | 无，全自动 | 有，每个 CHECKPOINT 等确认 |
| 多评委 | 无 | 有，避免锚定 |
| 适用场景 | 能定义清晰评估函数 | 主观评估为主（写作/内容/风格） |

## 仓库

https://github.com/alchaincyf/darwin-skill（MIT）

## 一句话总结

达尔文 2.0 把 skill 优化从「人工调整」变成「可重复、有数学保障的工程流程」——多评委独立审查 + validation-gated 回滚 + human-in-the-loop = skill 的自我进化。

---

*花叔 | GitHub: alchaincyf/darwin-skill*
