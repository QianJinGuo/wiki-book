---
title: "Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据"
source: wechat
source_url: https://mp.weixin.qq.com/s/9bDg-2Bq8sXuG-E-5FwmUQ
author: 若飞
feed_name: 架构师
review_value: 9
review_confidence: 9
review_recommendation: strong
review_stars: 5
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [claude, claude-code, agent, multi-agent, agent-teams, task-decomposition, permissions, workflow, architecture]
type: article
provenance_state: synthesized
sha256: ab8eeaeed73e7f47e6c2ad849781b978fecf3c26b16fb05e90e2467920c0ec64
---

# Claude Code Agent Teams 实战：怎么拆任务、控权限、收证据

> **来源**：架构师（JiaGouX/若飞），2026年5月27日
> **背景**：若飞系统梳理 Claude Code Agent Teams 的实战方法论——任务怎么拆、权限怎么控、证据怎么收，并接续了今年从 Harness、上下文边界到工作现场的分析主线。

## 核心问题

多开几个 Agent 并不会自动变成团队协作。它更可能变成五段上下文、五份半成品、五处文件冲突，以及一个人类最后回来收拾现场。

**关键判断**：一段工程工作，能不能被拆成几个边界清楚、互相不踩、最后能合回来的工作面。

## 三种协作结构：不是升级路线

Subagents、Agent View、Agent Teams 不按 Level 1/2/3 排队，它们解决的是不同问题：

| 能力 | 价值 | 适合场景 |
|------|------|----------|
| **Subagent** | 把主会话不需要长期保留的噪声隔离掉 | 只读调研、审查、找调用链；主会话只拿回结论和证据 |
| **Agent View** | 让几个独立 session 在后台跑 | 彼此不需要交流的任务；查 flaky test、看 PR 评论、补文档 |
| **Agent Teams** | 共享任务和成员之间的直接通信 | 跨层、跨文件、有依赖的工作；接口变了前端测试要知道 |

## 什么时候该用 Agent Teams

判断顺序：
1. **只读调研/审查**：先用 Subagent——把噪声隔离出去，主会话只拿回结论
2. **互不依赖的小任务**：先用 Agent View——一个查 flaky test，一个补文档，一个看 PR 评论
3. **多个 session 都要改代码**：先考虑 Worktrees——文件隔离比角色名更重要
4. **跨前端/后端/测试/审查，有依赖要共享**：这时才考虑 Agent Teams

**一句话判断**：能隔离的先隔离；需要共享状态、依赖协调和成员通信时，再用 Agent Teams。

## Agent Teams 多出来的是「协作状态」

Agent Teams 由多个 Claude Code session 组成一个 team：
- **lead**：拆解、分配、汇总
- **teammates**：各自执行、互相通信
- **task list**：记录任务、依赖、状态
- **permissions**：限制可做什么
- **work surface**：约束每个成员负责哪些文件或模块
- **review gates**：最后用什么证据判断完成

**核心洞察**：没有这层状态，多 Agent 会变成"岗位扮演"。团队感不来自名字，而来自信息能不能正确流动，任务能不能被阻塞和解锁，结果能不能被统一验收。

## 并行之前，先问四个工程问题

**1. 文件边界能不能切开？**

两个 teammate 同时改同一个文件，最容易互相覆盖。如果文件边界切不开，硬上 team 还会增加合并成本。

**2. 信息依赖是单向的，还是来回的？**

- 单向依赖（"帮我看安全问题"）→ Subagent 足够
- 双向依赖（"后端接口变了，前端表单要跟着调整，测试用例要同步修改，审查发现风险还要反向影响实现"）→ 这才接近 Agent Teams 的工作

**3. 验收证据是什么？**

每个成员都说自己完成了，但完成的依据是什么？diff、测试、类型检查、截图、日志、PR 评论、风险清单，最后要归到同一处。

**4. 权限和预算怎么收住？**

并行会多花 token，也会多触发工具调用。先把允许和禁止写进设置或命令参数。

## 团队 Prompt 模板

```
GOAL
实现一个最小可用的用户登录流程，只覆盖邮箱密码登录，不加入社交登录。

SCOPE
- backend: src/auth/routes.ts, src/auth/service.ts
- frontend: src/pages/login.tsx, src/components/LoginForm.tsx
- tests: tests/auth/login.test.ts, tests/e2e/login.spec.ts

WORKSTREAMS
1. backend-teammate: 只负责接口、校验和错误码，不改前端文件。
2. frontend-teammate: 只负责登录表单和错误展示，不改后端文件。
3. test-teammate: 先读 backend/frontend 计划，等接口契约稳定后补测试。
4. review-teammate: 只读审查，重点看凭证处理、输入校验和测试缺口。

DEPENDENCIES
- frontend 依赖 backend 输出的接口契约。
- tests 依赖 backend 和 frontend 的最终接口。
- review 可以先并行读现状，最终需要在实现后再跑一次。

PERMISSIONS
- 允许读仓库、改 scope 内文件、跑局部测试。
- 不允许读 .env、改数据库迁移、git push、发布包。

REVIEW GATES
- 给出最终 diff 摘要。
- 给出已运行测试和结果。
- 列出未覆盖风险。
- lead 在所有 teammate 完成后再汇总，不提前宣布完成。

STOP
如果发现 scope 外文件需要修改，先停下来说明原因，不要自行扩大范围。
```

## 落地前检查清单

- **目标**：本轮只交付什么？一句话说不清，就先别拆
- **文件边界**：每个 teammate 能改哪些文件？哪些文件不能碰？
- **依赖顺序**：谁要等谁的接口、类型、测试夹具或审查结论？
- **权限边界**：能不能读 .env？能不能改迁移？能不能 git push？
- **预算边界**：团队规模、模型选择、任务轮次有没有上限？
- **验收证据**：diff、测试结果、日志、风险清单，至少要有一组能复核的证据
- **停止条件**：发现 scope 外修改、权限不足、测试环境缺失时，是继续猜，还是先停下来说明原因？

## 重要配置澄清

- 环境变量不能写成 `VAR = 1`，正确 shell 写法：`export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- `--max-budget-usd` 是 CLI 在 print mode 下的预算上限，不是 Agent Teams 专用参数
- Agent View 的后台 session 是本机 supervisor 托管，不是关机以后还能继续跑
- `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING` 控制模型 reasoning 行为，不是 Agent Teams 开关

## 若飞今年的主线

本文接续了若飞今年的分析主线：
- 2 月：Agent Teams，"默认串行，显式协作"
- 4 月：多 Agent 五种模式，上下文边界和信息流
- 5 月：Karpathy / Claude Code 大代码库 / Skills / Codex 工作现场 / Claude 工作流
- 现在：Agent Teams 把问题从"一个 Agent 怎么干活"推进到"多个工作面怎么同时推进"

**核心变化**：Coding Agent 的工作单位在变。过去把任务交给一个会话；现在这段工程链路开始可以拆成几个工作面。

---

*本文为架构师（JiaGouX）原创文章*
