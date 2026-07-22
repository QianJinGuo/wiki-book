---
source_url: https://mp.weixin.qq.com/s/371nRdmUs_myjdsyoFJCew
ingested: 2026-07-08
sha256: 46decc8d3cb6fedffdfb66f3ffdb5b33d7bbb0fca7fed0e42eaf6a6450333d9a
source_published: 2026-07-08
title: "Claude Code 官方 Loop 分层：从自检到无人值守的四档控制权"
author: 架构师
feed_name: 架构师
---

# Claude Code 官方 Loop 分层：从自检到无人值守的四档控制权

> 最近 Loop Engineering 很热。Claude Code 团队在《Getting started with loops》里讲了四类 Loop。但只看命令用法，容易把它读成一份功能说明。我更关注另一层：这四类 Loop，其实是四档控制权。

## 四类 Loop = 四档控制权

| Loop 类型 | 交出去的控制权 | 人还要握住什么 |
|-----------|--------------|--------------|
| **Turn-based** | 检查权 | 下一轮是否继续 |
| **Goal-based** | 继续/停止权 | 目标定义和预算边界 |
| **Time-based** | 触发权 | 节奏、范围和生命周期 |
| **Proactive** | 工作域处置权 | 权限、审计、升级和降级 |

## 检查权（Turn-based）

把人平时手动检查的步骤写进 SKILL.md。比如一个前端改动，合理的检查包括：启动页面、操作关键控件、看控制台，必要时截图或跑性能追踪。

关键信号：它能不能区分"已修改"和"已验证"。自检不稳，自动继续只会让错误走得更远。

## 继续权（Goal-based）

`/goal` 交出去的是"下一轮是否继续"的判断。人写一个完成条件，Claude 每一轮结束后由额外的评估模型检查条件是否满足。

**两个关键细节**：
- 评估器只能看已经进入 transcript 的证据
- 目标带上轮次或时间边界会稳很多（"最多尝试 5 次""超过 20 轮就停下来汇报"）

**关键区分**：愿望句 vs 条件句。愿望句把判断留给模型，条件句把判断落到证据上。

## 触发权（Time-based）

`/loop` 和 `/schedule` 解决的是"事情会在你不发 prompt 的时候发生"。关键边界：
- `/loop` 适合当前 session 内按间隔重复
- recurring task 有 7 天过期边界
- 更持久的调度看 Routines、Desktop scheduled task 或 GitHub Actions

**核心设计问题**：节奏。外部信号多久变化一次？空跑成本能不能接受？发现问题后最多处理到哪一步？

## 工作域（Proactive）

用 `/schedule` 定时检查反馈，`/goal` 定义完成标准，Skills 记录验证方式，dynamic workflows 编排多个 Agent 分类、修复和审查，auto mode 减少人工确认。

**关键问题**：输入是否稳定？身份和权限能否单独收敛？每次运行的决策和成本能否审计？

## 渐进路线

**第一周**：只做 turn-based，让 Agent 按 Skill 自己检查
**第二周**：加 `/goal`，目标写窄一点，逼团队把"完成"写清楚
**第三周**：考虑 time-based（如每 20 分钟检查一次 PR 状态）
**第四周**以后：沉淀成 routine 或 workflow

## 核心工程原则

- Loop 设计里最容易被忽略的能力，是**及时降级**
- 跑不稳，就从 proactive 降到 time-based；目标写不清，就从 goal-based 降到 turn-based
- 能降级，才敢升级
- 证据越密，团队越敢让它多跑一层
- Loop Engineering 更像 Agent 进入真实工作现场以后，自然长出来的一层**接口工程**
