---
source_url: "https://mp.weixin.qq.com/s/J1PU1yegNM32PjUp7JQ7iQ"
source: wechat
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

# 不用你按回车，Claude Code 会主动替你开 PR 了

**来源：** 深思圈 | 深思SenseAI | 2026年5月23日
**事件：** Code with Claude 大会 | Maya（Anthropic 应用 AI 团队）| 2026-05-20

## 核心功能
Claude Code Routines——用 `/schedule` 命令创建，让 Claude Code 从"等你按回车的工具"变成"看到问题就自己动手的队友"。

## 三个能力
1. **始终在线**：session 跑在 Claude Code 云端基础设施，关机不影响
2. **灵活触发**：定时（每周一10点）+ 事件触发（PR合并/issue创建/webhook），可组合
3. **非黑盒**：随时在 claude.ai 查看 session，中途可插话/调整/继续聊

## 设计三要素
- **Trigger**：定时 vs 事件 vs 组合
- **Context**：Claude 能访问哪些仓库/工具/数据——上下文天花板决定能力天花板
- **Steerability**：agent-on-agent review 或人工介入

## 场景
- 部署验证器（Datadog/Grafana → 异常报警 → 回滚建议）
- 值班事件处理器（PagerDuty/GitHub issues → 初步分析 → go/no-go）
- 积压工单清理（GitHub issues/Slack → 优先级排序 → 开PR）
- 文档同步（每周对比主分支和文档仓库 → 有差异开PR）

## 演示亮点
实时介入：issue 创建 → session 立刻跑 → 发现重复 → Maya 直接说停 → Claude 停了

## 参考
- https://www.youtube.com/watch?v=eSP7PLTXNy8
