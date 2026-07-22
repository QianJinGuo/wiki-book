---
title: "Claude Code Dynamic Workflows：把复杂长时任务交给一群 agent"
description: "Claude Code v2.1.154 Dynamic Workflows功能详解：workflow脚本作为调度器+subagent作为worker，支持fan-out/复核/聚合/恢复/复用，并发16 agents/单次最多1000"
source_url: "https://mp.weixin.qq.com/s/YzpjNY5ch3sTlOhL9jypFw"
feed_name: "Vibe编码"
author: "VibeCoder"
ingested: "2026-05-29"
type: article
tags: [claude-code, dynamic-workflows, multi-agent, orchestration, subagent, workflow-runtime]
sha256: "bcff5a177e27dc69353d817f88dff9a2e5ec2c450fb874cc69764b768fedb878"
---

# Claude Code Dynamic Workflows：把复杂长时任务交给一群 agent

> 来源：Vibe编码 | 作者：VibeCoder | 2026-05-29 | 基于 Claude Code v2.1.154

## 核心概念

Dynamic Workflows 是 Claude Code 的多 agent 编排能力。用户描述任务 → Claude 生成 workflow 脚本 → 脚本在后台调度 subagents 分阶段工作、互相复查、汇总结果。

**关键边界**：workflow 脚本本身不直接访问文件系统、不直接跑 shell。脚本是调度器，agent 才是 worker。真实读文件/改文件/执行命令/MCP 调用都由 subagents 执行。

这解释了为什么它比普通 subagents 更适合大任务：普通 subagent 结果回到主对话，主会话要继续判断下一步；workflow 把循环/分支/复查逻辑留在脚本变量里，主会话只拿最终报告，上下文压力小，执行更稳定。

## Dynamic Workflows vs 其他能力的区别

| 能力 | 适用场景 | 特点 |
|------|---------|------|
| **Subagents** | 旁路任务（查日志、读文件、局部review） | 省主会话上下文，结果返回主对话 |
| **Skills** | 固定流程和能力注入（写文章、发小红书、生成图表） | 操作手册，流程固化 |
| **Agent teams** | 多个Claude Code session协作，带共享任务列表，队友互发消息 | 小团队，跨层功能开发 |
| **Dynamic Workflows** | 任务图固化，fan-out/复核/聚合/恢复/复用 | 代码库级审计、几百文件迁移、多来源研究 |

## 触发方式

1. **在 prompt 里写 `@workflow`**：Claude 高亮这个词，生成 workflow 脚本。按 `Ctrl+G` 可以忽略。
2. **开 ultracode**：`/ultracode` 是 xhigh reasoning effort + 自动 workflow 编排。Claude 自己判断哪些任务值得跑 workflow，可能拆成多个连续 workflow（先理解→实施→验证）。

内置 workflow：`@workflow:research` 从多个角度搜索资料、交叉验证 claim、生成带引用报告。

## 运行时管理

**审批阶段**：CLI 显示 planned phases，可选择运行/以后同项目不再询问/查看 raw script/取消。Desktop app 显示 approval card（workflow名/阶段列表/token使用提醒），可选 Once/Always/Deny。

**运行中监控**：`/workflow status` 查看每个 phase 的 agent 数/token总量/耗时。常用按键：`Enter` 详情/`Space` 暂停恢复/`X` 停止/`R` 重启选中agent/`S` 保存成可复用命令。

**保存位置**：项目级（进仓库，团队共用）或个人级。保存后变成 slash command。项目级优先于个人级。

## 权限与限制

- **workflow 中途不能等人工输入业务决策**：只有 agent 权限提示能暂停。必须人工 sign-off 的场景要拆成多个 workflow。
- **脚本不直接读写文件或跑 shell**：只协调 agents，真实操作由 agents 执行。
- **并发上限**：最多 16 个 agents（低 CPU 机器可能更少），单次 run 最多 1000 个 agents。
- **subagent 权限**：派出的 subagents 总在 `@claude` 模式下运行，继承用户的 tool allowlist。文件编辑自动批准；shell/web fetch/MCP 不在 allowlist 里可能中途要权限。

**建议**：第一次跑先用只读审计，等确认结果质量再跑修复型 workflow。

## 示例 Prompt（审计类）

```
Phase 1: map all relevant files and entry points.
Phase 2: assign independent agents by module; each agent must cite exact files and lines.
Phase 3: run verifier agents that try to disprove each finding.
```

---

→ [[raw/articles/claude-code-dynamic-workflows-multi-agent-orchestration|原文存档]]
