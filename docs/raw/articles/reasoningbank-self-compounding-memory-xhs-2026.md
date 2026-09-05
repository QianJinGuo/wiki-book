---
source_url: https://www.xiaohongshu.com/explore/6a86b73800000000350178df?xsec_source=app_share&xsec_token=CBtBWq2Djc4mXJIrkMeRVi2Ic7Sq6QGbo4ZKJauYtXeGU=
source: xiaohongshu
title: "Google：让Agent经验开始自我复利"
ingested: 2026-08-25
type: raw-article
tags: [reasoningbank, agent-memory, self-evolving-agent, rsi, matts, test-time-scaling, google-cloud, uiuc, yale, iclr-2026, strategy-memory]
sha256: 042e5451377492791d64d04ce1e790886f0780af43754bd7514dc9065462762a
---

# Google：让Agent经验开始自我复利

> 小红书论文解读号（登录墙未捕获作者名，与 Agent Gym 解读号为同一账号，appuid 一致）
> 解读 ReasoningBank（ICLR 2026，Google Cloud AI Research + UIUC + Yale + Google Cloud AI 合作，arXiv 2509.25140）：把 Agent 记忆从"存档"推向"自进化"。

## 核心问题

长时间运行 Agent 最现实的问题：任务做得越多，为什么还是不断重犯旧错？

传统轨迹记忆像录像——内容完整却很长；工作流记忆常常只收藏成功套路。ReasoningBank 的新意是把成功与失败都交给 Agent 自评，再提炼成"标题—描述—内容"三段式策略。新任务先检索可迁移的推理经验，结束后再抽取并合并新经验，记忆库因此不是静态仓库，而是一条持续更新的闭环。

## 关键结果（WebArena）

以 Gemini-2.5-flash 为底座，无记忆整体成功率 40.5，ReasoningBank 达 48.8；Gemini-2.5-pro 从 46.7 升到 53.9；Claude-3.7-sonnet 从 41.7 升到 46.3。三个模型都涨，说明收益并非绑定某个底座。步骤数同时下降（flash 从 9.7 降到 8.3）：不只是做成更多任务，也更少走弯路。

## MaTTS：把 test-time scaling 和记忆连在一起

普通扩展只是同题多采样，MaTTS 利用多条成功、失败轨迹之间的对比来提炼更好的记忆，再让这批记忆指导下一轮探索。flash 整体成功率由 ReasoningBank 的 48.8 继续升到 51.8，pro 从 53.9 升到 56.3。计算量没有只换来更多答案，而是沉淀成下一次还能复用的策略。

## 个人观点

创新点不是"再做一个向量库"，而是把经验压缩、失败反思、检索和推理时扩展串成正反馈。对 RSI 来说，真正有价值的长期记忆应满足两件事：能跨任务迁移，也能让新增算力转化为未来能力，而不是上下文越积越长。

论文地址：https://arxiv.org/abs/2509.25140
代码地址：https://github.com/google-research/reasoning-bank
