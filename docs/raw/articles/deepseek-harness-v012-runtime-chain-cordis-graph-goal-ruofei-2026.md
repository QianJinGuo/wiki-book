---
title: "DeepSeek Harness 源码拆解 v0.1.2：运行链+两层装配+Cordis运行图+Goal"
source_url: "https://mp.weixin.qq.com/s/3vz6q_sVBylyZ_yRg6b7Ig"
author: "若飞（架构师）"
ingested: "2026-08-31"
sha256: "83c211cbffd038b9f50929d71729d470e65c2517edcd651ddc3bc0331f4b2735"
source_type: "wechat_mp"
---

# DeepSeek Harness：重新设计 Agent 运行时（v0.1.2-alpha.2）

> 原文：https://mp.weixin.qq.com/s/3vz6q_sVBylyZ_yRg6b7Ig
> 代码核对：dsh-v0.1.2-alpha.2，commit 0a53fb55be

## 核心判断

DSH 的主要变化不在 Agent Loop 本身，而在 Loop 周围的边界：运行图回答"现在能做什么"，事件流回答"刚才做过什么"。模型、工具、会话、权限、插件和宿主都被放进同一套运行时。

## 运行链

Bundle + Runtime Profile + Patch → Cordis 宿主运行图 → Agent Preset（会话能力组合）→ Agent Loop → 工具管线/PTC → Session 事件流 → 停止、恢复与 Goal。

## 两层装配

### Runtime Profile（进程级）
web/headless/sdk/sdk-minimal/acp 决定进程启动时装入什么。Bundle + 用户 Patch + 命令行 Patch 一起决定。`config` 整段替换不深合并。

### Agent Preset（会话级）
Standard/PTC/Minimal/Cordis 决定会话挂载时带上哪组插件、工具和提示词。一个 Web 进程可承载多 Session，每个 Session 自己选 Preset。切换 Preset = 换"这一轮带什么能力"，不是复制四份 Loop。

## Cordis 运行图

不是注册表，是一张活的运行图。回答两个问题：插件在哪个 Context/realm，能看到哪层 Service；依赖何时满足、插件何时启停、退出时收回哪些注册和资源。

关键名词：Context（作用域+Service 查找边界）→ Service（稳定接口）→ Fiber（一次插件运行）→ inject（声明依赖）→ effect（绑定监听器/注册项/定时器/清理函数）。依赖没满足则等待，依赖失效则旧 Fiber 退出+新依赖满足后启动。

**Event 扩展缝**：`fs/write-intent`、`agent/pre-step`、`agent/request`、`llm/stream`。Service 决定"调用谁"，Event 决定"在哪个时刻插入策略"。

## Agent Loop 多层结束边界

- **step**：一次模型请求+工具执行
- **turn**：从一条输入开始，可包含多个 step（steering/插件消息可追加）
- **driver activity**：包住一段连续运行，Loop 确认无下一条 turn 后回到 idle
- **Goal**：在 activity 外面，持久 Goal 仍可能 active，由 Goal Driver 发起新一轮

每个 turn 第一步经过 `agent/pre-step`，监听器可拒绝/改写/开启独立消息序列。

## Session 事件流

只追加的事件流，保存用户输入、模型请求、工具返回、turn 收口。回放和恢复的依据。进程中断后哪些事实可恢复、哪些标成未知。

## 权限与观测

Service 三层查找（agent/preset/global）。`inject` 约束运行时依赖非 OS 权限。`effect` 清理 Cordis 登记的监听器和定时器，但不回滚已写入数据库/文件/外部服务的副作用。
