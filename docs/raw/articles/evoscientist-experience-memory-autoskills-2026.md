---
title: "EvoScientist：经验积累成图、聚类成 Skill 的自进化 AI 科学家（本地代码库快照）"
source_url: "file:///Users/jinguo/phd/EvoScientist"
source: "local|phd 合集（arXiv:2603.08127，Apache-2.0，基于 LangChain DeepAgents）"
author: "EvoScientist 团队"
ingested: "2026-08-29"
type: raw-article
tags: []
source_type: local
sha256: "7bdd319a7e00b7b28c325be4c5eb42f4cd27f5b33c7ea25af2be7c2061ab08c1"
---

自我进化的多 agent AI 科学家（"Vibe Research"，Human-on-the-Loop），主 agent 带 6 个子智能体（规划/调研/编码/调试/分析/写作）。核心机制（提炼自 /Users/jinguo/phd/EvoScientist 的 README 与 EvoScientist/memory/ 源码）：

- **EvoMemory**：后台 memory worker agent 在每轮/子任务结束后把观察提炼成 observation **Markdown 文件**（YAML frontmatter + 短正文），存 `~/.evoscientist/observations`。frontmatter schema：`id, created_at, summary, memory_type (semantic|procedural|episodic), scope (global|project), project_id, source {type: subagent|turn, agent, session_id}, related_observations[] {id, relation, reason, linked_at}`。
- **关系三分类**：`complements / contradicts / supersedes`——由独立 observation_linker agent 把观察连成**知识图谱**（v0.2.0）。记忆库是会被新观察修正的活图谱，不是 append-only 日志。
- **preflight 检索**：每个任务开始前先 `search_observations`（ranked 关键词 | regex）+ `read_memory`，把相关历史注入上下文（v0.1.7）。
- **AutoSkills 闭环**（v0.2.1）：对观察图做连通分量聚类 → `AutoskillCandidate {cluster_hash, observation_ids, observation_count, procedural/semantic/episodic counts}` → agent 从该簇观察起草 SKILL.md 提案（frontmatter 字段白名单、skill 名强制 kebab-case 正则）→ 写入 `autoskills/proposals/` → **用户经 `/autoskills` 审批** → 移入 processed，cluster_hash 去重防止重复提案。机器起草、人类批准。
- 安全：`execute` 工具默认人工审批（shell_allow_list 前缀放行、会话内回复 3 全批、--dangerous 解除）；多渠道（Telegram/Slack/飞书/微信等共享会话）+ cron + MCP 即插即用 + 200+ 预置技能。
