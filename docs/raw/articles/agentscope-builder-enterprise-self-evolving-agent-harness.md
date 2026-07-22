---
title: "AgentScope Builder 快速体验：用 Harness 框架快速构建企业自进化智能体"
source: wechat
source_url: https://mp.weixin.qq.com/s/iaNkbO9BfCqxaBk5b1kF-w
author: 刘军（陆龟）
feed_name: 阿里云云原生
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [agent, harness, agentscope, java, enterprise, multi-tenant, workspace, builder, composite-filesystem]
type: article
provenance_state: synthesized
sha256: 2d1481a8a5107ca10540d5b8ad2c37155a9346c018263fb29d53674d342c57af
---

# AgentScope Builder 快速体验：用 Harness 框架快速构建企业自进化智能体

> **来源**：阿里云云原生（刘军/陆龟），2026年5月27日
> **背景**：本文介绍 AgentScope Builder 产品——基于 Harness 框架的企业级自进化 Agent 平台，解决从「单人单机」到「团队分布式」的扩展问题。

## 背景：Claw 的边界

AgentScope Claw（MinQwenPaw）是 Harness 框架在「单人本机」场景的完整落地。但把它放到团队场景时，会同时遇到五个问题：

1. **多用户视图**：多人共用一个进程，按 token 鉴权、按用户分会话
2. **工作区隔离**：每个用户的工作区必须互不污染，Alice 调教的 agent 不能让 Bob 看到
3. **多副本一致性**：同一个用户的请求落到不同副本上，必须看到一致的 workspace
4. **OS 级隔离**：服务端跑用户输入的代码必须有沙箱，不能直接用本机 Shell
5. **Agent 分享**：做出来的好 Agent 要能被分享但不能被改坏，需要细粒度授权

这五个问题归结到一件事：「一个用户、一台机器、一个工作区」要被换成「多个用户、多台机器、多组被命名空间隔离的工作区」。

## AgentScope Builder 是什么

Builder 是 OpenClaw 的分布式版本 —— 同样的自我进化、同样的工作区驱动、同样的 Harness 运行时；只是从「一个人」变成「一个组织」，从「一台笔记本」变成「一组横向扩容的服务」。

**核心能力**：
1. QwenPaw 的多租户、可分布式版本，支持多人共用一个平台，每个人的 Agent 互不干扰，支持多副本部署，用户工作区跨节点一致
2. 零代码智能体开发平台，用户不需要写一行代码，就能在 Web UI 上创建、调教、分享自己的 Agent

## 核心设计：workspace 是 Agent 的资产

Builder 的产品设计围绕一个核心原则：**workspace 是 Agent 的资产**。

**隔离**：每一对 (用户, Agent) 都有自己独立的 workspace 命名空间。Alice 的 agent-A 和 Bob 的 agent-A 即使起点配置完全相同，他们各自的微调、记忆、技能演化都互不渗透。

**共享/授权策略**：
- 可运行（run）：别人能调它，但看不到工作区内部，也不能改技能或 prompt
- 可编辑（edit）：别人可以改它的配置和工作区文件，等于多人共用一个 Agent
- 可 fork：别人复制出一份属于自己的 workspace，之后两份独立演化

授权对象可以是某个具体同事、某个用户组、也可以是整个组织。

## 零代码 + 自我进化

大多数零代码平台产出的是一个**静态的 Agent**——你配好它能做什么，它就永远做那些事。

Builder 不一样。每个 Agent 背后都有一个**持续生长的 workspace**：

- **自动沉淀记忆**：每次对话结束后，Agent 会自己提炼新事实写入记忆，下次对话时它比上次「更了解」你和你的业务
- **自动习得技能**：Agent 在完成任务的过程中，如果发现某个操作流程可复用，可以把它结构化成一个新 skill 写入 skills/ 目录
- **自动孵化子 Agent**：当某类子任务反复出现，Agent 可以把它拆出来定义为一个专属的子 Agent

这三件事不需要用户回到管理后台操作 —— Agent 自己在工作区里写文件，工作区在对话中持续演化。

## 核心机制：CompositeFilesystem

Builder 把每一个 Agent 都跑在 **HarnessAgent + CompositeFilesystem** 之上：

- **HarnessAgent**：负责 Agent 的运行时编排
- **CompositeFilesystem**：把工作区做成一个可命名空间隔离、可分布式落点、可投射到沙箱的资产

CompositeFilesystem 两层架构：
1. **Layer 1：命名空间分发** —— 把所有路径透明重写到 users/{userId}/agents/{agentId}/...
2. **Layer 2：存储后端** —— 本机磁盘 / Docker 容器 / 远端 KV 三选一

关键点：**Agent 代码完全不知道这两层的存在**。它使用的还是 Harness 那套统一的 read/write/ls/grep API，和在 claw 里一模一样。隔离是在 CompositeFilesystem 这一层实现的，不是靠业务代码「小心避开别人的目录」实现的。

## Channel 路由

Builder 中有一个路由组件，把来自 Channel 的请求根据 (userId, agentId) 路由到一个独立的 HarnessAgent 实例。

Alice 调用 agent-A → 落到 Agent(alice, agent-A)
Bob 调用同名的 agent-A → 落到 Agent(bob, agent-A) —— 与 Alice 的完全独立

---

*本文为阿里云云原生原创文章*
