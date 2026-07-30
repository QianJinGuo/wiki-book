---
title: "Matt Pocock wayfinder + handoff：AI Agent 跨 5 次会话接力赛不掉链"
source_url: "https://mp.weixin.qq.com/s/H1httNlFmRqN9jyOAO380A"
ingested: 2026-07-30
authors:
  - 术哥
source: "运维有术"
sha256: f23da64428142cee3d2373770d37f38cf54801aaf84eb5dafc69fc9694f06c34
---

本文基于 Matt Pocock Skills 仓库源码（wayfinder/SKILL.md + handoff/SKILL.md + ask-matt/SKILL.md + dictionary-of-ai-coding）及社区 GitHub Issues（#667, #670, #683）整理。

## wayfinder vs handoff 三选一

| 场景 | 信号 | 选谁 |
|------|------|------|
| 目的地清晰，一两会话能搞定 | 路上没雾 | main flow (/grill-with-docs → /to-spec → /to-tickets → /implement) |
| 当前会话快到 smart zone，但任务规模不大 | 换窗口不换任务 | /handoff |
| 任务太大、雾太大还说不清目的地 | 先把目的地钉死 | /wayfinder |

## wayfinder：跨会话共享地图

6 步 chart 模式：Name the destination → Map the frontier → Create the map → Create tickets → Fire research subagents → Stop

Map 的 5 段结构：Destination / Notes / Decisions so far / Not yet specified / Out of scope

关键纪律：Plan, don't do - chart 只产 map 不解决任何 ticket。map 是索引不是仓库（决策只活在 ticket 里，map 只挂链接）。

4 种 ticket 类型：
- Research (AFK)：查文档/API 并行跑
- Prototype (HITL)：原型提升讨论保真度
- Grilling (HITL)：一问一答对话，Agent 不能自己答
- Task (HITL 或 AFK)：阻塞决策的手工操作

## handoff：跨会话上下文搬运

5 条硬约束：
1. 保存到 OS 临时目录，不是当前 workspace
2. 必须包含 suggested skills section
3. 不重复其他产物（只引用 path/URL）
4. 脱敏：API key、密码、PII
5. 用户参数作为下次 focus 调整文档

/handoff forks（开新会话+引用文件），/compact continues（同一会话压摘要）。

## 关键结论

- wayfinder 解决工作本身横跨多会话；handoff 解决会话快到边界
- smart zone 阈值（100K/120K/125K-150K）有争议，别当硬阈值
- map 清空后必须回到 main flow（/to-spec → /to-tickets → /implement）
- setup-matt-pocock-skills 是地基，无 issue tracker 则协议被削弱
