---
title: Multica — 开源 Managed Agents 平台
source_url: https://mp.weixin.qq.com/s/P0O15RN5XLn1wTMnxDuJQw
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, rag, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: c41afee2c8e69da3b718f2ae7ae98fbdef3a6f67febb87d182ef41c930b6c097
---
# Multica — 开源 Managed Agents 平台
> 本文是对 https://mp.weixin.qq.com/s/P0O15RN5XLn1wTMnxDuJQw 的存档
> 项目: https://github.com/multica-ai/multica (Apache 2.0, 25.5K Stars)
## 项目定位
Multica — 开源的 Managed Agents 平台。解决 Agent 的管理层问题：调度、监控、状态追踪、经验沉淀。
不同于 CrewAI/AutoGen（Agent 编排框架），Multica 不帮你编排 prompt chain，而是把 Agent 从对话窗口拉到项目看板上，变成有名字、有任务、会汇报进度的团队成员。
名字来源：Multiplexed Information and Computing Agent，致敬 Multics 操作系统。
## 架构
| 层 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 16 App Router | 看板/Issue/实时进度 |
| 后端 | Go + Chi + sqlc + gorilla/websocket | 单二进制部署 |
| 数据库 | PostgreSQL 17 + pgvector | Skill 语义检索 |
| Agent Daemon | Go 守护进程 | 跑在开发者本地 |
## 核心概念
- **Runtime**：能跑 Agent 的机器（MacBook/云服务器），daemon 注册后变为 Runtime
- **Agent**：有身份的团队成员，非模型（可配 Provider: Claude Code/Codex/Gemini）
- **Issue**：任务，状态机 todo → in_progress → done/failed/blocked
- **Skill**：Agent 完成任务后沉淀的经验，向量化存储，语义检索复用
## 设计决策
- pgvector 用于 Skill 语义匹配（团队知识库而非 RAG）
- Go 后端：单 binary、小内存、WebSocket 好
- Daemon 四步：扫描 PATH CLI → 注册 Runtime → 每 3s 轮询 → spawn 隔离目录执行
- 默认 20 并发，2h 超时
## 部署
Cloud: brew install multica-ai/tap/multica && multica setup
自部署 Docker: make selfhost（前端 :3000, API :8080）
多 Daemon Profile：同一机器多环境
## 定位对比
| 维度 | Multica | CrewAI/AutoGen | Paperclip |
|------|---------|---------------|-----------|
| 核心隐喻 | Agent=团队成员 | Agent=函数节点 | Agent=员工 |
| Skill 积累 | ✅ 内置 | ❌ | ✅ |
| 管理深度 | 轻 | 无 | 重 |