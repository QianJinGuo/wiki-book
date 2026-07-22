---
title: "claude-code-hidden-settings-18"
created: 2026-06-10
type: raw
sha256: 86a3d94ced2c03052915da7fc4b92f0593d5d868d5b3b2d2ef7f6f14062c4eea
provenance_state: archived
---
# 用了半年才发现：Claude默认配置一直在悄悄掏空我的钱包，分享18个Claude设置！

source_url: https://mp.weixin.qq.com/s/VQmT6cwd2XByNgNKj55eJw
source: ChallengeHub
author: Mnimiy (@Mnilax)
published: 2026-05-24
score: 7×7=49

## 摘要

Claude Code settings.json 有 125+ 配置项，官方文档只覆盖 40 个。本文列出 18 个真正影响效果的设置：8 个在 Claude.ai，7 个在 Claude Code settings.json，3 个在 API/Console。

## Claude Code 核心

- enabledPlugins：只把活跃的设为 true，其余 false 保持安装
- permissions.deny：deny 规则有已知 bug，需配合 chmod 600 OS 层备份
- hooks.SessionStart：按分支加载 context 文件，防止 CLAUDE.md 滚雪球
- mcpServers：用 enabled 标志而非直接删除，每个 server 吃 800-6000 token schema
- cleanupPeriodDays：改为 180 天（默认 30 天）
- model per-project 覆盖：docs→haiku，infra→sonnet，core→opus

## API 高杠杆

- cache_control 断点：放在稳定系统提示词后而非用户消息后，可降 30-90% 账单
- inference_geo：不设可省 10% Opus 溢价
- Workspace 速率限制：per-feature 上限防止批处理任务饿死交互式接口
