---
title: Claude Code 源码拆解：从启动到多 Agent 扩展层
source_url: https://mp.weixin.qq.com/s/VHVZV0rrCxYkbrxjuQzIAQ
publish_date: 2026-04-24
tags: [wechat, article, claude, agent, multi-agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 113f081dcafc9ed65aeb80ac09fe42a6476888653ad370b98f220a8627f47d2b
---
# Claude Code 源码拆解：从启动到多 Agent 扩展层
## 文章概要
**核心论点**：Demo 阶段 Agent 看起来很强，但一旦工具变多、模式变复杂，系统就开始"变形"。真正决定 Agent 能不能长期活下去的，不是模型，而是围着模型搭起来的运行时。Claude Code 值得拆，是因为它是一套真正在承接复杂度的 Agent 系统。
## 六大核心模块
1. **入口与启动链路**：三段式启动（入口分流→进程初始化→会话准备），进程状态与交互状态分离
2. **REPL / UI Orchestration**：REPL 是 runtime 操作台，不是消息展示壳
3. **Query Loop**：连续运行是状态机，不是函数调用；含 Compact 压缩与恢复机制
4. **Tool Runtime**：工具从"野生函数"变成"带完整运行时语义的受控对象"
5. **Permission System**：权限是完整决策链（规则→自动判定→交互→沙箱），不只是弹框
6. **Task / 多 Agent**：先有统一任务抽象，再映射各种执行体；不是 prompt 分工问题
7. **Extensibility（MCP/Skills/Plugins）**：外部可以动态多变，内部必须尽量收敛
## 核心观点摘录
> "真正决定一个 Agent 能不能长期活下去的，往往不是模型，而是围着模型搭起来的运行时。"
> "多 Agent 真正从 demo 走向系统，靠的从来不是 prompt 分工有多聪明，而是任务系统能不能把分出去的执行重新收回来。"
> "外部再动态，内部都尽量稳定。"