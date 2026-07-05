# AgentTeams 和 Claude Tag 都进入群聊模式，是新范式还是新叙事？

## Ch01.212 AgentTeams 和 Claude Tag 都进入群聊模式，是新范式还是新叙事？

> 📊 Level ⭐ | 2.4KB | `entities/agentteams-和-claude-tag-都进入群聊模式是新范式还是新叙事.md`

# AgentTeams 和 Claude Tag 都进入群聊模式，是新范式还是新叙事？

**来源**: 阿里云云原生

**发布日期**: 2026-06-30

**原文链接**: https://mp.weixin.qq.com/s/-e8hfQoCvyxkjHR-9pROVQ

---

我们在今年的 520 阿里云云峰会上发布了 AgentTeams，定位的是企业级多智能体治理与协作平台，支持企业统一创建、调度 Agent，每个 Agent 可以自定义模型，在钉钉、企微、飞书等 IM 平台创建群聊，进行团队协作。

Anthropic 近日发布了 Claude Tag，把 Claude 直接作为团队成员嵌入 Slack 频道。在 ambient 模式下，Claude 不需要被显式 @ 也会主动监听上下文、跟进任务、提醒进展，依托 Opus 4.8 实现跨小时级的异步协作。

企业办公场景，从一对一私聊到多对多群聊，大家不禁要问，这会是使用 Agent 的新范式么？我们不着急给出判断，读者们更多的还是想了解下单聊和群聊，有哪些不同？

01

什么是群聊模式？

Cloud Native

Anthropic 在 Claude Tag 的博客里定义了 Agent 群聊的四个特征：

- @Claude is multiplayer：
  在一个 Slack 频道里，Claude 是同一个实例，与所有人协同工作，而不是每个人各自开一个独立会话。

- @Claude learns over time：
  它持续跟随频道活动，积累上下文，不需要每次重新解释项目背景。

- @Claude takes initiative：
  开启 ambient 模式后，它无须被 @ 也会主动监听、标注相关信息、跟进沉默的任务。

- @Claude
  works asynchronously：
  它可以接收一个跨小时甚至跨天的任务，自主规划执行节奏，类似一个远程同事。

因此， 群聊 ≠ 多人各自和 Bot 聊天的并集 。 如果群内，每个人开自己的会话，就只是并行的单聊了。

阿里云 AgentTeams 给出的，则是一个更工程化的定义。把群聊抽象为一组声明式 CRD，每个 Agent、每个真人都会赋予一层身份：

成员
身份

Manager
人类成员，平台级管理

---

