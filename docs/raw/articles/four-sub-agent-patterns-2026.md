---
title: "Agent 如何管理其他 Agent：四种Sub Agent 模式"
source_url: "https://mp.weixin.qq.com/s/OmdV7cucIVqwOVo7ZO_h1g"
author: "ChallengeHub"
published: "2026-05-07"
type: raw
tags: [agent, multi-agent, sub-agent, workflow, orchestration, pattern]
created: "2026-05-20"
sha256: a65a7342064f436c72db15ca43a07971fa02d27086c7c0d867df50836dad5209
---
---
# Agent 如何管理其他 Agent：四种Sub Agent 模式
## 概述
四种模式，按主 Agent 对子 Agent 生命周期的控制程度由低到高排列：
| 模式 | 工具 | 主 Agent 角色 | Agent 生命周期 |
|------|------|--------------|--------------|
| 内联工具 | call_agent | 调用方 | 单次任务 |
| Fan-Out | spawn_agent, wait_agent | 调度方 | 单次任务 |
| Agent Pool | spawn, send, wait, list, kill | 协调方 | 多轮持久 |
| Teams | 以上全部 + 跨Agent send_message | 监督方 | 持久化 |
## 1. 内联工具（Inline Tool）
子 Agent 就是一个函数调用。主 Agent 调用 call_agent 工具，工具内部启动子 Agent，结果作为工具返回值传回。
**同步模式**：工具调用阻塞，等子 Agent 跑完返回结果。
**异步模式**：工具立即返回 agent_id，子 Agent 跑完后结果以通知消息形式注入对话。
```
{"name": "call_agent", "arguments": {"task": "检查 PR#42 的安全问题", "agent": "security-reviewer", "background": true}}
```
**适用场景**：自包含独立任务（资料查询、代码审查、文件分析、测试生成）。大多数子 Agent 场景从这里出发就够了。
**局限**：无法中途发补充指令、查进度、取消。如果子 Agent 理解错了任务，只能等结果回来才知道。
## 2. Fan-Out：批量启动 Agent，等结果汇总
主 Agent 启动多个子 Agent，用 wait_agent 收集结果。启动和收集是两个独立步骤。
核心工具：
- spawn_agent：派发任务，立即返回 ID
- wait_agent：阻塞到一或多个 Agent 完成
模型控制时序：可以启动后马上等（退化同步），也可以先穿插做自己的工作再等。
```
{"name": "spawn_agent", "arguments": {"task": "将鉴权模块重构为 JWT Token 方式", "agent": "backend-engineer"}}
{"name": "spawn_agent", "arguments": {"task": "为新 JWT 流程更新所有鉴权相关测试", "agent": "test-writer"}}
{"name": "wait_agent", "arguments": {"timeout": 300}}
```
**适用场景**：多个相互独立的并行任务。
**局限**：仍无法给运行中子 Agent 发补充指令或中途纠偏。
## 3. Agent Pool：持久化 Agent + 消息通信
子 Agent 长期存活，跨多次交互保持状态。主 Agent 可发补充指令、查状态，在 Agent 之间协调工作。
核心工具：spawn_agent、send_message、wait_agent、list_agents、kill_agent
```
{"name": "send_message", "arguments": {"to": "agent-r", "message": "调研 WebAssembly 性能基准测试，找到 5 个有具体数据的来源。"}}
{"name": "send_message", "arguments": {"to": "agent-w", "message": "拟一个关于 WebAssembly 性能的博客结构大纲，分 4 个部分。"}}
```
**适用场景**：需要 Agent 跨多个步骤协作的工作流，主 Agent 在专家 Agent 之间充当信息路由。
**局限**：主 Agent 需要同时跟踪多个 Agent 状态、判断什么时候发追问还是等待、正确地在 Agent 之间传递信息。小模型很容易搞混。
## 4. Teams：Agent 之间直接互发消息
Agent 之间直接通信，不经过主 Agent 中转。主 Agent 负责组建团队、定义角色，然后退到幕后。各 Agent 通过直接消息或共享邮箱自行协调。
每个 Agent 的工具集里都有 send_message，可以按名字给其他 Agent 发消息。主 Agent 只有在 Agent 主动汇报时才能看到结果，其余 Agent 间交流对主 Agent 完全不透明。
**适用场景**：任务规模大到协调逻辑超出单个 Agent 管理能力上限的大型任务。
**局限**：
- 每个 Agent 都需要前沿级别模型能力
- 工程挑战：死锁检测（A 等 B、B 等 A）、冲突解决（两 Agent 同时改一个文件）、关闭协调
- Debug 困难，Agent 间消息链难以追踪，故障会级联扩散
## 选择指南
**从模式 1 出发**。很多感觉需要多 Agent 协作的任务，用精心设计的内联工具调用就能搞定。
每往上走一个台阶，对模型能力要求高一截：
- 模式 1：能调工具就行
- 模式 2：需模型推理"什么时候 wait"
- 模式 3：需跨轮次追踪多 Agent 状态
- 模式 4：每个 Agent 都需前沿级别
小模型/便宜模型 → 老实待在模式 1 或 2。
结果收集方式随模式升级而变化：
- 模式 1：结果内联在工具返回值里
- 模式 2：通过 wait_agent 批量收集
- 模式 3：逐消息增量到达
- 模式 4：只有 Agent 主动汇报的内容才能被主 Agent 看到