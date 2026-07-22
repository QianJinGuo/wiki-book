---
title: "Claude Code Subagents 深度指南：上下文卫生实战"
source_url: "https://mp.weixin.qq.com/s/qy_zaCZTCs1Ql3BIFmBMgg"
author: "JiaGouX（若飞转发）"
publisher: "微信公众号 - 架构师（JiaGouX）"
published_date: "2026-04-30"
ingested: "2026-04-30"
review_value: 8.5
review_confidence: 8
review_recommendation: "strong"
review_stars: 4
type: raw
tags:
  - "claude-code"
  - "subagent"
  - "context-management"
  - "agent-harness"
  - "contextual-boundaries"
  - "claude-code-hygiene"
sources: []
sha256: ""
created: 2026-05-10
updated: 2026-05-10
---

You analyze impact scope for backend changes.
Return:
1. Affected files and why they matter
2. Compatibility risks
3. Tests that should be added or updated
4. Unknowns that require human or main-agent confirmation
Do not edit files.
Do not propose broad refactors.
```
**关键细节**：
- `Do not modify files` 写进描述和正文，避免分析代理越权执行
- 工具集只给 Read, Grep, Glob，从权限层面堵住"顺手改一改"的可能
- description 是路由契约，越清楚路由越稳
## 最容易踩的四个坑
1. **任务写得太含糊**：「帮我看一下这个模块有没有问题」→ 子代理会发散。应该是：「只检查认证模块最近 diff 中的安全风险，重点看 token 校验、权限绕过和敏感日志，返回 P0/P1/P2 级别问题。」
2. **返回太多过程**：把搜索结果、完整日志、读过的文件都倒回主窗口，隔离价值归零
3. **硬切需要共享状态的任务**：前端、后端、测试、文档每步都互相影响时，强行拆成隔离 Subagents 会花更多成本做合并和纠偏
4. **fork 上瘾**：fork 解决的是"必要背景继承"，不是"上下文管理"。长期依赖 fork 说明任务委派还不够清楚
## context 还是工作集
- **聊天记录**：保存发生过什么
- **工作集**：关心下一轮推理到底需要什么
Subagent 正好挡住了其中一类污染：那些必须做、但做完之后不值得长期留在主窗口里的探索过程。
## Kaxil Naik 的判断
> Harness matters more than the model.
模型能力当然重要，但长任务能不能稳定跑下去，更多看外面那层 harness：规则怎么沉淀，工具怎么暴露，权限怎么限制，失败怎么被发现，探索过程怎么隔离。
## 实用起步建议
先放两三个高频、边界清楚、收益稳定的子代理：
1. 一个只做代码审查
2. 一个只做影响面搜索
3. 一个只做测试失败诊断
跑一段时间观察两件事：
- 主会话是不是少了大量无用搜索和日志
- 子代理返回的结论，主 Agent 能不能直接接着用
## 参考来源
- Daniel San，Keep your Claude Code context clean with Subagents，2026-04-27
- Claude Code Docs，Create custom subagents
- Kaxil Naik，I Haven't Written a Line of Code in 4 Months，2026-03-27
- Metabase，How we built ten custom subagents to tame a 500K-line Clojure codebase，2026-04-16