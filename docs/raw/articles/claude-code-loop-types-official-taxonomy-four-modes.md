---
title: "从提示词到循环：Claude Code 的四种循环模式与使用边界"
source_url: "https://mp.weixin.qq.com/s/4dJzfvY8EPEp4ZSUlpwQNw"
author: "Delba de Oliveira & Michael Segner (Claude Code Team)"
feed_name: "微信公众号 (翻译 Claude Code 官方博客)"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [claude-code, loop-engineering, agents, goal-loop, schedule, auto-mode, dynamic-workflows]
type: article
review_value: 7
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 7b28a3c2c642c03088092f603a81a78f35162b30622c3fc0cb0c5bbf9452a7bb
---

# 从提示词到循环：Claude Code 的四种循环模式与使用边界

Claude Code 团队（Delba de Oliveira & Michael Segner）官方定义的四种 Loop 类型，以及如何在实际工作中选择合适模式。

## 四种 Loop 类型

### 1. 轮次驱动的循环（Turn-driven Loop）
- **触发**：用户提示词
- **停止**：Claude 判断任务完成
- **适用**：短、一次性任务
- **优化**：通过 SKILL.md 改进验证步骤

### 2. 目标驱动的循环（Goal-driven Loop）— /goal
- **触发**：人工实时提示词
- **停止**：目标达成或达最大轮数
- **适用**：有明确可验证退出条件的任务
- **示例**：`/goal get the homepage Lighthouse score to 90 or above, stop after 5 tries.`

### 3. 时间驱动的循环（Time-driven Loop）— /loop 与 /schedule
- **触发**：指定时间间隔
- **停止**：取消或工作完成
- **适用**：周期性工作，或需与外部系统打交道
- **示例**：`/loop 5m check my PR, address review comments, and fix failing CI`

### 4. 主动循环（Proactive Loop）
- **触发**：事件或日程触发，无需人实时参与
- **停止**：任务完成退出；routine 持续运行
- **适用**：边界清晰、反复出现的工作流（bug 报告/issue 分流/迁移/依赖升级）
- **组合**：/schedule + /goal + skills + dynamic workflows + auto mode
- **示例**：`/schedule every hour: check [#project]-feedback for bug reports. /goal: don't stop until every report found this run is triaged, actioned, and responded to.`

## 维持代码质量
- 保持代码库本身干净
- 用 skills 编码"好结果"定义
- 用第二个智能体做代码评审（/code-review skill）
- 把经验沉淀进系统

## Token 管理
- 为任务选择合适原语和模型
- 定义明确成功/停止条件
- 大规模运行前先试点
- 把确定性工作交给脚本
- /usage 拆解用量，/goal 展示轮次和 token
