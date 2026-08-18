---
title: "开启 Benchmark 的 Harness 时代：15 家学术机构联合发布 HarnessEval"
source_url: https://mp.weixin.qq.com/s/T_fBh7p82OHaKw75oq-5cQ
source: wechat
author: 机器之心
publish_date: 2026-08-18
ingested: 2026-08-18
type: raw-article
tags: [evaluation, harness, benchmark, agent, evidence-tree]
sha256: 79cdbdce07ce1d08b293ca3777b7522fc2f83bfa65d8328f7734290161ee581d
review_value: 6
review_confidence: 7
---
# 开启 Benchmark 的 Harness 时代：15 家学术机构联合发布 HarnessEval

> 机器之心发布。MirroS 联合清北/Berkeley/MIT/xbench/英伟达等发布 HarnessEval，将 Harness 概念带入评测系统，为 Evaluation 建立自己的 Harness。

## 核心论点
- Agent 最终能力 ≠ 底层模型能力，还含上下文管理/工具调用/记忆/任务拆解/执行环境/权限管理/结果验证。Harness 描述这一层能力。Agent 如此，Evaluation 同样如此。
- 当被评测 AI 从模型变成复杂系统，什么样的 Evaluation 才足够有效？答案不是加指标或更大的 Judge，而是为 Evaluation 建立 Harness：从 Metric 到 Harness，从静态 benchmark 到可执行评测系统。

## Evaluation Harness 四阶段
- **Plan**：评测智能体读取初始状态/动作/任务类型/评测目标，生成评测计划（先理解案例再决定测什么）。
- **Route**：从 Skill Library 调用适合当前案例的 skill，记录为什么启用某项检查/跳过另一项（选择适用技能而非跑完所有指标）。
- **Decompose**：高层问题拆成目标定位/状态追踪/时序变化/因果顺序/结构保持等子问题，由专门 sub-agent/工具处理。
- **Verify**：主智能体验证各分支证据质量与逻辑关系，输出不只是一个标量分数，而是完整 evidence tree（记录了测了什么/为什么测/调什么工具/找到什么证据/如何支持结论）。

## 世界模型作为第一块试验场
- HarnessEval-w 落地交互式世界模型，从观测质量/状态转移正确性/世界持续性三维组织评测，按案例动态组合验证不同 Skill。
- 例：物体状态变化检查目标是否真实存在/变化是否在正确对象/预期状态是否成立/关键锚点保持/是否出现无关变化；物理碰撞调用目标追踪/时间交叠验证/速度估计/因果顺序检查。
- 目标：证据树 + test-time scaling 投入更多计算深入搜索验证；benchmark 核心资产从数据指标扩展到技能路由/工具调用/证据验证/持续生长的 Skill Library。

## 结语：通向 RSI
- 评测关注什么，模型就朝什么优化。可靠 Eval 是 RSI（Recursive Self-Improvement）闭环的关键反馈。世界模型是迈向 Physical RSI 的第一步。
