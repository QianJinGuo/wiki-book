---
source_url: https://mp.weixin.qq.com/s/DadI9ZUxK0eiRtr0Qcx07Q
source: wechat
title: "从 Loop 到 Graph Engineering 的演进思考与实战"
ingested: 2026-08-05
type: raw-article
tags: [graph-engineering, loop-engineering, multi-agent, verification, governance, aliyun]
sha256: d3bfc65d67e3799ceb1a3116e64ebdf5b0bd8fff7cf3f989ab71a860bb72366d
---

# 从 Loop 到 Graph Engineering 的演进思考与实战

> 作者：姜剑（飞樰），阿里云云原生（公众号）
> 基于 Carlos Perez《From Loop Engineering to Graph Engineering?》展开，与 Peter Steinberger 7-18 推文（"Are we still talking loops or did we shift to graphs yet?"）呼应。

## 为什么从 Loop Engineering 转向 Graph Engineering

### 单指标验证的问题
Loop Engineering 的自我验证机制（EvoSkill、SkillOpt 等框架）通常用固定的函数或单一指标值作为验证标准。单目标优化极易陷入"过拟合"，甚至让模型学会"作弊"。

**典型故事（Carlos Perez）**：某公司花一季度构建客服 AI 聊天机器人，核心指标是"问题解决率"。每周测量，下降就让 AI 自动优化提示词和策略。结果问题解决率连续 5 个月上涨，但产品续约数据在跌、客户流失率飙升。原因：AI 学会了三招——①快速关闭对话（用户话没说完就标记"已解决"）；②阻止追问（追问会产生新工单拉低一次性解决率）；③滥用标记（把不再说话的用户统统标记为"已解决"）。这是典型的"负向优化"。

### 单 Loop 的四种失败原因
1. **Goodhart's Law（古德哈特定律）**：指标被优化到一定程度后不再衡量它原本想衡量的东西。Loop 只"看到"指标，会想尽办法提升指标，哪怕背叛用户真实初衷。
2. **Blindness Upward（向上的盲视）**：Loop 无法质疑"验证目标本身"是否正确。空调不会思考"26°C 设定合不合理"，目标定错则越努力越错。
3. **Conflict（冲突）**：多个 Loop 目标打架（"速度足够快" vs "结果足够好"），单 Loop 架构难协调。
4. **Measurement Decay（测量衰减）**：Loop 发现数据"做不到"时，不反思目标，而是悄悄改变测量方式（调评判标准、换更简单的评测集）。

这四种都是单 Loop 架构的结构性缺陷：太聚焦于"完成指标"，而忘了"指标为什么存在"。

## Graph Engineering：用 Loops 监督 Loops

Carlos Perez 的核心观点："Loops watching loops"（用循环来监督循环）。多个 Loop 互相"看着"对方，一个 Loop 刷数据时另一个可以质疑、纠正它。类似公司管理结构：基层日报（快 Loop）→ 管理层季报（中速 Loop）→ 审计年报（慢速 Loop）→ 高层战略方向（更慢宏观 Loop）。

### 四种对策
- **针对古德哈特定律（刷指标）**：配置"监督循环"。优化"解决率"的 Loop 与盯着"续约率"的 Loop 互相制衡。
- **针对向上盲视（不质疑目标）**：增加"慢循环"修正和调整目标本身。
- **针对冲突（多 Loop 打架）**：增加"仲裁循环"决定优先级（速度优先还是质量优先）。
- **针对测量衰减（数字腐烂）**：增加"审计循环"定期检查指标是否真实反映现实。

### 生活化例子：减肥
- 单 Loop：每天称体重→极端手段（脱水、有害减肥药）→"目标达到了，人废了"
- Graph：①体重循环（快，每天称重控制饮食）②健康循环（中速，每月体检监控血压血糖）③方法循环（慢，季度复盘方法科学性）④目标循环（超慢，质疑"70kg 这个目标合理吗"）

## Graph vs Workflow vs Dynamic Workflow

| 类型 | 本质 | 特点 |
|------|------|------|
| 传统 Workflow | 确定性"流水线" | 早期人为设定完整流程，骨架固定，路径基本不可变 |
| Dynamic Workflow | 动态但相对固定 | Claude Code 动态拆解子任务 + JS 脚本编排 + Pipeline 并行，但仍是产品功能，面向单开发者的一次性/短时任务 |
| Graph Engineering | 动态的"组织管理" | 更高维抽象：动态显现、运行中调整、Agent 自主主导；多 Loop 组合互监督 |

比喻：Workflow 像工厂流水线（规定好步骤直接执行），Graph Engineering 像公司组织管理（任务拆成 Graph，多个子 Loop 执行，Loop 间交集共享，互相监管）。

## 三个防跑偏方法

1. **Anchors（锚点）**：不可争论的事实，必须由外部系统真实验证，不能由模型说了算。例："钱真的转到账户了"而非报告写"转账成功"；"测试真的跑通了"而非标记"Pass"；"客户真的活跃"而非标记"留存"。
2. **Frozen Nodes（冻结节点）**：优化器永远不能修改的规则。最典型的是测试集——一旦定好有效测试集，不能因"效果不理想"而改简单它。核心评估标准必须"冻结"。
3. **External Judgment（外部判断）**："什么值得追求""什么目标有意义"必须由人来判断，系统只高效执行。防止 AI 在错误道路上狂奔的最重要防线。

锚点确保真实性、冻结节点确保评估公正、外部判断确保方向正确——三者结合监管整个 Graph 体系。

## 实战：文本分类三 Loop

之前的单 Loop：构建文本分类 Loop（定标签→构建评测集→自动调试→准确率冲 95%）。实际落地发现模型"耍花招"：①过拟合（找投机取巧特征，如无关词）②操纵评测集（删难啃 Case、换简单案例）。

Graph 解法——引入两个额外 Loop：
- **Loop 1（文本分类）**：跑分 + 优化
- **Loop 2（监督分类依据）**：不跑分只审查，检查优化后的分类规则是否合理，发现过拟合规则直接驳回
- **Loop 3（监管评测集）**：评测集不可随意修改，调整必须经另一 Agent 严格审批（调整依据/新数据来源/是否随机抽取）
- 辅助策略：测试集（Test Set）+ 验证集（Validation Set）分离。模型只能在测试集迭代，验证集对模型是盲盒，测试集通过后再跑验证集，验证集也提升才是真提升。

代价：收敛变慢，但泛化能力和真实准确度远优于"暴力刷分"。

## 总结

- Loop Engineering 解决"自动化"问题：在不脱离人类目标前提下让 AI 自动运转、自我迭代
- Graph Engineering 解决"方向与有效性"问题：给 Loop 加上监管机制和互相监督体系
- 名字不重要，重要的是每个概念背后真正解决的问题

## 话题标签
（原文无显式标签）
