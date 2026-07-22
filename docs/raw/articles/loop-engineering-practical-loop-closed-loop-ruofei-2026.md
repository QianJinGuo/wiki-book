---
title: "Loop 工程实战：从任务循环到可维护闭环"
source: wechat
source_url: https://mp.weixin.qq.com/s/zOWRaGZUMWee2dRixmL-sA
author: 若飞
feed_name: 架构师
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
review_stars: 4
date: 2026-06-27
created: 2026-06-29
updated: 2026-06-29
tags: [loop-engineering, agent, state-machine, ci-pipeline, harness, engineering]
type: article
provenance_state: extracted
sha256: 303e4e25e6323606754ae8ed4835cfd7accab30b2d81e8e788ad1b0743084238
---

# Loop 工程实战：从任务循环到可维护闭环

## 核心命题

Loop Engineering 要处理的是怎样把 Agent 的多轮执行写成一个可维护、可观察、可回放的工程闭环。Loop 更接近任务运行时，不只是一条更长的 prompt。

## 先把 Loop 从 prompt 里拿出来

很多人第一次做 Agent Loop 会写成"请你完成这个任务，如果失败请分析原因并继续修复"。能跑 demo，但进真实项目会遇到：模型说"完成了"但外部系统没有证据；中间失败几次没人说得清；Agent 读旧上下文做了过期判断；工具调用有回滚困难；成本/权限/责任边界变模糊。

问题不在模型聪不聪明——**我们把一个工程系统塞进了一段自然语言指令里**。

## Loop 六个部件

| 部件 | 作用 | 常见错误 |
|------|------|----------|
| State | 保存当前任务事实 | 只靠聊天上下文记忆 |
| Intent | 决定下一步做什么 | 让模型直接边想边改 |
| Action | 访问外部系统 | 工具权限过大、缺少白名单 |
| Verify | 检查结果是否可信 | 执行者自己给自己盖章 |
| Commit | 把结果写入真实系统 | 候选结果和正式结果混在一起 |
| Trace | 记录每轮发生了什么 | 只留下最后一句总结 |

这六个部件以前散在不同系统里：任务队列（status/worker/retry/dead letter）、工作流引擎（node/edge/condition）、CI（step/job/artifact/report）、前端（state/event/side effect/submit）。

## 传统开发经验迁移

1. **Job Runner**：每个任务要有状态（pending→running→retrying→succeeded/failed_permanently/needs_human）
2. **CI Pipeline**：每一步要有产物（commit、失败 job、日志、artifact、report）
3. **前端状态流**：先推导再提交——模型先生成候选结果（计划/diff/建议），写入外部系统要走受控提交点

## CI 失败分流 Loop demo

完整 TypeScript 状态机实现：
- Phase 类型：collecting → classifying → drafting → verifying → ready_to_commit → done / needs_human
- 事件驱动：EVIDENCE_COLLECTED → CLASSIFIED → PROPOSAL_DRAFTED → VERIFIED/VERIFICATION_FAILED → COMMITTED/HANDOFF
- 关键规则：权限问题不继续修、验证失败超次数不继续修、没有证据不进入提交
- 核心循环：`state -> intent -> effect -> event -> state`

## 控制面与执行面分开

- **控制面**：稳定、可预测、容易审计（停止条件、权限边界、提交策略）
- **执行面**：灵活，接不同工具（模型理解、生成、调用工具）
- Agent 适合放在执行面发挥能力，全局边界由控制面兜住

## 副作用收口

| 动作类型 | 建议边界 |
|----------|----------|
| 读文件/日志/issue | 默认允许，记录来源 |
| 生成计划/diff/草稿 | 候选结果，不直接提交 |
| 写文档/开候选 PR | 低风险写入，要求 diff 可审 |
| 改权限/部署/删数据 | 默认人工确认 |
| 重试外部 API | 有限流、退避、次数上限 |

## 第一版选什么场景

适合：CI 失败分流、文档命令校验、PR 风险预检、依赖升级影响面扫描、changelog 候选生成——共同点：读多改少、证据清楚、失败可接手。

## 四个坑

1. 把聊天记录当状态库 → 状态要写到结构化记录
2. 让 Agent 自己决定所有权限 → 权限边界写在系统里
3. 没有独立验证 → "说得像完成了"≠"真的完成了"
4. 只看结果不看过程 → trace 是后续优化 Skills/Memory/工具的依据
