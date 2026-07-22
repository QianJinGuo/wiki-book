---
title: Claude Code Harness 深度分析
source_url: https://mp.weixin.qq.com/s/2NUlZtRMbNHpBvgAe3__Qg
publish_date: 2026-05-12
tags: [wechat, article, claude, agent, harness, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: e1bbcc37e9fa4a14b96587a9266c4bc21ad5d809763bc332167854b3f126c577
---
# Claude Code Harness 深度分析
> Founder Park 2026-04-01
## Harness：模型之外的真正难点
- 1,900 文件 / 512,000 行 TypeScript / Bun + React + Ink
- 比喻：软件工作的操作系统
- 第三代 Autonomous Agent：模型控制循环，运行时只是执行器
## TAOR Loop：Orchestrator 越笨越稳定
- Think-Act-Observe-Repeat
- Orchestrator ~50 行核心
- 4 种工具原语：Read/Write/Execute/Connect
- Bash 是通用适配器
- **脚手架应随模型变强而变薄**
## Context 管理
- Auto-compaction @ 50% → LLM 摘要替代原始对话
- Sub-Agent 隔离：独立 Context 预算
- Prompt Cache 经济学：14 种 cache-break 向量
- Session Continuity：checkpoint/rollback/fork 像 git branch
## 六层记忆系统
1. Managed Policy（组织策略）
2. Project CLAUDE.md（项目配置）
3. User Preferences（用户偏好）
4. Auto-Memory（自动学习用户模式）
5. Session（会话上下文）
6. Sub-Agent Memory（子 Agent 专项记忆）
- 记忆是索引不是存储，可自我编辑/去重
## 五档权限光谱
plan → default → acceptEdits → dontAsk → bypassPermissions
- bashSecurity.ts 23 项安全检查
- Unicode 零宽字符注入、IFS null-byte、Zsh equals expansion 防御
## 多 Agent 编排
- Sub-Agent：独立进程/TAOR/Context，3 种预设（Explore/Haiku/Plan/General-purpose）
- Agent Teams：独立实例通过共享文件系统协调（实验性）
- KAIROS（未发布）：Always-On Agent / nightly memory distillation / GitHub webhook / Cron 5min
## Anti-Distillation & Undercover
- fake_tool_injection：污染训练数据
- connector-text 摘要：API 推理链摘要+加密签名
- Undercover Mode：单向门，不提及内部代号
→ 参见 [[entities/agent-harness-12-components-7-decisions|Agent Harness 架构]]