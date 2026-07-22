---
title: "claude-research-agent-auto-newsletter-cyrilxbt"
created: 2026-06-10
type: raw
sha256: 01425779160057cfc4275882a2da52fffd46758f5b7dc868c20ed4f369101548
---
source_url: https://mp.weixin.qq.com/s/KoNcaOlzzPtSU6PMetmb0A
source_title: 我用Claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用
author: CyrilXBT（@cyrilXBT，18万粉丝AI创作者）
feed_name: 高可用架构
published: 2026-05-26
scored: v=7, c=8, v×c=56

# 我用Claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用

## 核心结论

- 研究Agent四任务：信息源监控→信号过滤→综合→交付（45分钟→5分钟）
- 五组件架构：Claude（智能层）+ Filesystem MCP + Brave Search MCP + N8N（调度）+ CLAUDE.md（上下文）
- 复利效应：30天简报校准→60天周度综合揭示模式→90天专职分析师级理解

## 研究Agent四任务

1. **信息源监控**：行业新闻/竞品网站/学术论文/newsletter/YouTube频道/播客文字稿/GitHub仓库/Reddit社区
2. **信号过滤**：不是读到什么都总结，基于标准识别重要内容，竞品发新产品重要，重复包装不重要
3. **综合**：结构化叙事——发生了什么/为什么重要/和你已知信息的关联/你可能该做什么
4. **交付**：每天早上自动放到Obsidian vault指定位置，不需要手动触发

## 技术架构五组件

| 组件 | 职责 |
|------|------|
| Claude | 智能层：读原始内容/过滤/综合成结构化简报 |
| Filesystem MCP | 把Claude连到Obsidian vault，读CLAUDE.md，写简报到BRIEFINGS |
| Brave Search MCP | 实时网络搜索（免费层每月2000次查询） |
| N8N | 工作流调度，DigitalOcean $5/月自托管 |
| CLAUDE.md | 上下文层：告诉Claude你做什么/关心什么/什么可执行 |

## N8N五节点工作流

1. **Schedule Trigger**：cron expression如 `0 6 * * 1-5`（周一至周五早上6点）
2. **Read CLAUDE.md**：从vault读取研究上下文
3. **Prepare API Request**：把prompt模板和CLAUDE.md内容拼在一起
4. **Claude API Call**：HTTP Request调Anthropic API
5. **Save to Vault**：Write File到BRIEFINGS/[date]-morning-brief.md

可选Node 6：Telegram通知，简报好了推送手机

## CLAUDE.md研究上下文结构

```
# Research Agent Context

## Who I Am
[你的角色]

## My Primary Focus Areas
[具体领域，不是"AI news"而是"Claude Code updates/MCP servers/multi-agent frameworks"]

## What Constitutes Significant News for Me
[具体定义重要信息]

## My Competitive Landscape
[具体监控的公司/人/产品]

## What I Already Know Well
[已有深厚专业知识的主题，只需要重大新进展]

## What I Am Currently Working On
[当前项目]

## What I Specifically Do NOT Want ← 最重要
[写这段让Claude更激进过滤，只留真正可行动的内容]
```

## 反馈循环

- 每份简报底部加 `## My Notes on This Brief` 区域
- 每周日Claude读七份每日简报，根据反馈优化
- 复利：第三个月的简报比第一周精准得多

## 扩展方向

1. **Deep-DIVE队列**：简报里重要进展→QUEUE→深入研究会话
2. **竞品4小时扫**：不止一天一次，重要内容立刻Telegram通知
3. **周度综合**：周日Claude读一周简报，揭示单份简报里看不出的模式
4. **按需研究**：往QUEUE丢 `RESEARCH-[topic].md`，队列处理器执行

## 复利时间线

- **Day 30**：简报根据标注完成校准，持续噪音主题移除，持续产出信号的信息源优先
- **Day 60**：周度综合揭示单份简报里看不出的模式
- **Day 90**：研究运作系统达到专职分析师级别理解

原文：https://mp.weixin.qq.com/s/KoNcaOlzzPtSU6PMetmb0A
