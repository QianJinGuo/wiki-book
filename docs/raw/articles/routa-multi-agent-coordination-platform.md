---
title: 开源的多Agent协同交付平台Routa
source_url: https://mp.weixin.qq.com/s/xN6JBQ2PQxSEjtOkIJG3yQ
author: 丛林
published: 2026-05-17
created: 2026-05-17
updated: 2026-05-17
type: article
tags: [routa, multi-agent, agent-coordination, software-delivery, kanban]
sha256: 7bac88057abec99c0492ec553bf24ebfb4ceb75bbda1464a7d8a8520af6cfe1e
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
---
# 开源的多Agent协同交付平台Routa
**作者**: 丛林  
**来源**: 极客之家，2026年5月17日  
**项目地址**: https://github.com/phodal/routa
我最近一直在用 Claude Code 和 Codex 做项目，聊天框里塞了几百条 prompt，代码倒是跑起来了，但整个过程乱得像一个没人维护的 issue 列表。任务做了一半，Agent 开始漂移，最后交出来的东西跟最初说好的差了半个身位。
## 痛点
现在大多数 Coding Agent 产品都在解决同一个问题的前半段——把需求翻译成代码。翻译这件事确实做得越来越好了，Claude Code 写出来的东西质量已经很能打。但**软件交付不只是翻译**。
一个真实的需求进来，它要先被拆解、确认边界、明确验收标准，然后有人实现，有人复核，有人确认上线。这条链路，单个 Agent 在一条聊天线程里扛，基本扛不住。等到任务稍微复杂一点，上下文就开始混乱，角色和职责完全搅在一起，Agent 既当策划又当程序员还当 QA，结果三个角色都做得稀烂。
phodal 在 Routa 的 README 里说：
> 单一 Agent 聊天适合处理孤立任务，但一旦同一条线程同时承担拆解、实现、评审、证据收集和发布决策，语义边界就会迅速混乱。
这就是 Routa 想解决的事：**让这条链路显式化，每个角色干自己的活，不互相串戏。**
## Routa 是什么
> Workspace-first multi-agent coordination platform for software delivery
以工作区为核心、面向软件交付的多智能体协同平台。
Routa 把目标、任务、会话、执行轨迹、证据和评审状态都放到看板上，而不是让这些信息沉在对话记录里再也找不到。
整体上分三层跑：
1. **Planning**（规划层）
2. **Execution**（执行层）
3. **Verification**（验证层）
三个角色各司其职，不在同一个 prompt 里打架。
## 看板怎么跑
Routa 的核心运转方式是 **Kanban**，六列：Backlog、Todo、Dev、Review、Done、Blocked。
需求流转：
| 阶段 | Agent | 职责 |
|------|-------|------|
| Backlog | Backlog Refiner | 把粗糙需求改写成结构化YAML story，包含acceptance criteria、constraints、依赖关系和INVEST检查。不达标不能往下走 |
| Todo | Todo Orchestrator | 重新解析YAML，不信任上游。卡写得不清不楚就直接退回。只有"几分钟内能开工"才算合格 |
| Dev | Dev Crafter | 实现、验证、提交，写下Dev Evidence，说清楚改了什么、跑了什么测试、每条验收标准怎么对应 |
| Review | Review Guard | 关键节点。不信任Dev的自评，独立验证每条acceptance criteria，要求干净的git状态，lint和类型检查都要过。只有APPROVED才能进Done |
| Done | Done Reporter | 留下completion summary，说清楚交付了什么、依靠什么证据判定完成 |
| Blocked | Blocked Resolver | 专门处理卡壳情况。如果工作被依赖、环境或需求歧义阻塞，负责写清楚原因并路由到正确泳道 |
**最聪明的地方**：卡片本身会随着流转变严格。Backlog产出的是YAML story，到了Todo补上execution brief，Dev追加Evidence，Review加上Findings，Done写summary。同一张卡，越往后信息量越密。
## Review Gate
Routa 的 Review Gate 是**分层决策**的，不是一个单一的 reviewer 角色。
**三层验证**：
1. **Code Analysis**（代码分析）
2. **Test Verification**（测试验证）
3. **Specification Compliance**（规格合规）
### Entrix 验证引擎
Entrix 是 Routa 内置的验证引擎，用 **Rust** 写的（放在 `crates/harness-monitor/` 下），可以定义 fitness rules：
```bash
cargo build -p entrix
entrix run --dry-run
entrix run --tier fast
entrix run --tier normal
```
可以定义的规则示例：
- 某类文件不能超出多少行
- 某个测试必须存在
- 某段代码不能出现
**关键区别**：Review 不是靠 AI 喊"LGTM"，是靠明确的规则和证据链来判定的。
## 技术栈
Routa 目前跑在两个端上：
- **Web 端**：Next.js 16.2，页面和路由处理器放在 `src/` 下
- **桌面端**：Tauri shell + Rust Axum 后端，代码在 `apps/desktop/` 和 `crates/routa-server/`
两端核心语义一致——workspace、session、task、trace、codebase、worktree、review 这些概念的边界都由 `api-contract.yaml` 统一定义。
### Rust Crates
| 路径 | 作用 |
|------|------|
| crates/routa-core/ | 共享 Rust 运行时基础层 |
| crates/routa-server/ | Axum 后端（desktop 和 local server 用） |
| crates/routa-cli/ | CLI 入口和 ACP 服务命令 |
| crates/harness-monitor/ | 运行观测与 Entrix 评估引擎 |
## 上手路径
1. 直接试用 Web 版
2. 下载桌面端（Tauri）
3. 跑 CLI
**地址**：https://github.com/phodal/routa