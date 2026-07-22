---
title: "长周期 Agent 详解：从 Ralph Loop 到可接管 Harness"
source: "wechat"
url: "https://mp.weixin.qq.com/s/ML5aD3f2ilHWjSB-wpBukw"
author: "若飞"
publication: "架构师（JiaGouX）"
date: 2026-05-10
ingested: 2026-05-10
sha256: eac2767ac10b199a6fc1fcbc3da1b11979c5b8e270eef30b2848c100f9f91ff4
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
tags: [agent, harness, context-engineering, long-running-agent, ralph-loop]
---
# 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness
> 来源：[架构师（JiaGouX）](https://mp.weixin.qq.com/s/ML5aD3f2ilHWjSB-wpBukw) | 作者：若飞 | 2026-05-10
## 太长不看
- Codex `/goal` 很重要，但它解决的主要是"能不能一直干下去"，不等于把长任务的正确性也一起解决了。
- 朴素 Ralph Loop 的问题不在循环次数，而在每一轮都在悄悄积累目标漂移、上下文漂移和质量漂移。
- 长周期 Agent 比起"半途而废"，更怕"勤奋地跑偏"。
- 前置 Spec 的价值，是把错误的决策分叉提前剪掉，避免后面的 token 在错路上越跑越远。
- 外部状态文件比聊天记录靠谱。`GOAL.md`、`PLAN.md`、`STANDARDS.md`、`PROGRESS.md` 这类文件，是留给"下一任"的接管证据。
- Subagent 的第一层价值不是角色扮演。独立上下文可以用来做实现、探索和审查，减少自我确认。
- 多 Agent 不便宜，更适合当成质量治理手段。任务能拆、收益够高、验证链路清楚的时候，它才划算。
- 长周期 Agent 的分水岭，是从"能自己继续"走到"能被接管、能被回滚、能被复盘"。
## 核心论点
长任务跑完之后，留下的现场够不够清楚。下一个 Agent、下一个模型，或者下一个人，能不能直接接着往下做。
接不住，跑得越久，风险积得越深。
## 关键框架
### Ralph Loop 的边界
Ralph Loop 的直觉：Agent 没干完，就把它拉回来接着干。
问题在于"多想一会儿"和"干一个长任务"不是一回事。后者更像一个工程现场。
Agent 长任务里有三类漂移：
| 漂移类型 | 典型表现 | 后果 |
|---------|---------|------|
| 目标漂移 | Agent 忘了最初要解决的问题，开始追求局部完整 | 做出来的东西和真实需求对不齐 |
| 上下文漂移 | 压缩、截断、摘要让关键信息丢失 | 后续判断基于残缺事实 |
| 质量漂移 | Agent 越做越相信自己已经做完 | 测试缺失、边界错误、架构变形 |
### 可接管的四类证据
1. **目标证据**：为什么做、做到什么算完成、哪些不做
2. **状态证据**：已经做到哪里、当前卡在哪儿、下一步是什么
3. **决策证据**：为什么选这条路、放弃了哪些方案
4. **验证证据**：跑了哪些测试、哪些失败过、凭什么相信当前状态是对的
### 外部状态文件分层
记忆文件需要分四层：
- 事实：改了哪些文件、哪些测试通过、哪个 commit 是安全点
- 观察：某次尝试看到什么现象、哪条路径看起来不太稳
- 假设：当前怀疑的原因，但还没验证
- 决策：已经定下的取舍，后续不能随便推翻
最危险的是把"假设"悄悄写成"事实"，让后面的 Agent 一代代继承下来。
## 参考来源
- OpenAI Codex `/goal` 官方用例：https://developers.openai.com/codex/use-cases/follow-goals
- Anthropic：Effective harnesses for long-running agents：https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Anthropic：Effective context engineering for AI agents：https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic：How we built our multi-agent research system：https://www.anthropic.com/engineering/multi-agent-research-system
- Block：Ralph Loop 实现文档：https://block.github.io/goose/docs/tutorials/ralph-loop/
- Jarrod Watts long-running-agent-skill：https://github.com/jarrodwatts/long-running-agent-skill
- Andrej Karpathy 关于 long-running orchestrator 与 agentic coding 的推文：https://x.com/karpathy/status/2026731645169185220