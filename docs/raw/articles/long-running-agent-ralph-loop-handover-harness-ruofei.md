---
title: '长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'
source_url: 'https://mp.weixin.qq.com/s/ML5aD3f2ilHWjSB-wpBukw'
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
feed_name: '架构师'
date: 2026-05-10
author: '若飞'
sha256: 7526e3e81d9764440be3a4a93d1ad2d3716839b4aab9e15b384cf2a02c4c1bb5
review_value: 9
review_confidence: 8
review_recommendation: strong
ingested: 2026-05-16
review_stars: 5
---
# 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness
## 太长不看
- Codex /goal 解决的是"能不能一直干下去"，不等于解决长任务的正确性
- Ralph Loop 的问题在每轮积累目标漂移、上下文漂移、质量漂移
- 长周期 Agent 比起"半途而废"，更怕"勤奋地跑偏"
- 前置 Spec 的价值：把错误决策分叉提前剪掉
- 外部状态文件（GOAL.md/PLAN.md/PROGRESS.md）比聊天记录靠谱
- Subagent 第一层价值是独立上下文做实现、探索和审查
- 多 Agent 偏贵，适合当质量治理手段
- 长周期 Agent 的分水岭：从"能自己继续"到"能被接管、回滚、复盘"
## 三类漂移
| 漂移 | 典型表现 | 后果 |
|------|----------|------|
| 目标漂移 | Agent 忘了最初要解决的问题，追求局部完整 | 和真实需求对不齐 |
| 上下文漂移 | 压缩/截断/摘要使关键信息丢失 | 后续判断基于残缺事实 |
| 质量漂移 | Agent 越做越相信自己已做完 | 测试缺失、边界错误、架构变形 |
## 长周期 Agent 的证据链
| 层级 | 核心问题 | 工程抓手 |
|------|----------|----------|
| 目标层 | 到底要做什么 | Goal/Non-goal/Acceptance Criteria/前置澄清 |
| 状态层 | 现在做到哪儿 | Progress/Decision Log/Git History/Milestone State |
| 治理层 | 做得对不对 | Tests/Review Agent/Lint/Typecheck/Human Checkpoint |
## 核心洞见
**/goal 的定位**：它没有让模型突然多出工程判断力，但把"围绕目标持续推进"做成了一块可管理的控制面。
**"能继续"只解决一半问题**：长任务更难的部分是 Agent 不停之后还能不能朝着对的方向走。
**模糊性复利**：Jarrod Watts 的概念。短任务里是小偏差，放到长周期 Agent 里变成路径依赖。
**Ralph Loop 的边界在循环外面**：真正起作用的是目标锚点、状态证据、验证制度。Anthropic 的做法是把任务从"聊天继续"改成"工程继续"。聊天继续靠上下文，工程继续靠证据。
**Subagent 的独立上下文价值**：Boris Cherny "一个 Agent 引入的 bug，常常要靠另一个 Agent 来挑出来"。多 Agent 不是默认架构，是偏贵的质量治理手段。
**文件化的记忆也会污染**：Jarrod 的案例：某次 Agent 把错误的悲观判断写进 progress log，后续 Agent 都读了这个判断然后集体放弃尝试。记忆文件需要分层：事实、观察、假设、决策。最危险的是把"假设"悄悄写成"事实"。
## 可接管的标准
不是"能恢复会话"，而是下一个执行者能回答：
- 当前目标是什么？
- 已成事实的有哪些？
- 哪些只是猜测？
- 哪些决策不能随便动？
- 哪些测试能证明当前状态？
- 真要回滚，最近的安全点在哪里？