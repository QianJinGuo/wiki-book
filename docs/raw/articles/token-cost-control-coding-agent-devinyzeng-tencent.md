---
source_url: "https://mp.weixin.qq.com/s/x8ssQ-trmIqHMPlvQSE9SA"
title: "一篇搞懂 AI Coding Agent 的 Token 成本控制"
source: "腾讯技术工程 / devinyzeng"
ingested: 2026-06-15
sha256: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5"
type: raw
tags: [token-cost, coding-agent, prompt-cache, context-compression, model-routing, code-graph, multi-agent, orchestrator-worker, rtk, caveman, headroom, graphify, codegraph, context-mode, codebuddy]
---

一篇搞懂 AI Coding Agent 的 Token 成本控制

作者：devinyzeng

适用：CodeBuddy、Cursor、Codex、Gemini CLI 等这类 AI Coding Agent。

核心公式：总成本 ≈ 固定前缀 + 会话历史 + 运行时检索 + 工具往返 + 模型输出

第一章 账单都花在哪了

1.1 典型请求结构：System Prompt 5K + 项目说明 10K + Skill 定义 20K + Tool/MCP 定义 30K + 历史会话 100K + 代码文件 50K + 用户问题 0.1K → 贵的是系统塞进去的东西，不是你写的那句话

1.2 "它明明记得"只是一种幻觉——大模型本身通常无状态，所谓记忆只是"再次传入"。三个推论：会话越长后续每轮越贵 / 工具越多常驻定义越重 / 工具调用形成回路

1.3 五种成本：输入 Token（最大头） / 输出 Token / 推理 Token(thinking budget) / 工具往返成本 / 重试成本（最隐蔽）

1.4 Prompt Cache：缓存的是稳定前缀的处理结果，不是"答案"。三个推论：省的是重复成本不是首次 / 缓存是"写稳"不是"写短" / 缓存优化和上下文治理是一回事

1.5 五层模型：使用习惯 → 模型路由 → Context 工程 → 代码图谱 → Agent 架构

第二章 使用习惯（9 条）

1. 一个 Session 一件事
2. 长会话不压缩就是负债
3. 聊天记录不是数据库——长期信息外置
4. 少说废话（同时省输出 + 减少重试）
5. Skill ≠ 免费能力——常驻 vs 按需加载
6. MCP 越多不一定越强——选择空间大→决策慢→错误调用高
7. CLI 优先于 MCP
8. 引用文件时带完整路径（@路径 节省搜索链路）
9. 把意图一次说完，别聊天式拆碎

第三章 模型路由

匹配优先不是便宜优先：复杂→强模型 / 简单→便宜模型 / 重复→稳定模型
升级链路：便宜模型先跑 → 判断复杂度 → 需要才升级
调预算旋钮：reasoning effort / thinking budget / verbosity / max output tokens
Skill/Agent/Command 都应绑定模型（如 SKILL.md 头部 model: deepseek-v4-pro）

第四章 上下文压缩（4 个工具）

RTK：终端输出压缩，30 分钟会话 118K→23.9K（-80%）。cargo test -90%, vitest run -99.6%, grep -80%, git diff -75%
Caveman：AI 回复输出压缩，平均 65-75%。四种模式：lite/full/ultra/wenyan
headroom：所有进上下文的内容压缩，代码搜索 -92%, SRE 故障排查 -92%, GitHub Issue -73%。可逆压缩+按类型路由+按需还原
context-mode：MCP 工具输出沙箱化 315KB→5.4KB（-98%）+ 跨 compact 会话连续性 + ctx_execute 用代码代替读文件

第五章 代码图谱

Graphify：Tree-sitter 构建知识图谱，比直接读文件减少 71.5 倍 Token。22k GitHub stars。30+ 语言
CodeGraph：MCP Server + 持久化图数据库，7 个真实仓库 benchmark：平均 -16% 成本 / -47% Token / -58% Tool Call / -22% 速度。VS Code -64% Token/-81% Tool Call

第六章 多 Agent 协作

subagent 任务隔离：主 session 规划决策 + subagent 执行
Orchestrator-Worker 模式：协调器规划（强模型）+ 子 Agent 执行（便宜模型），每轮成本压缩 5-10 倍
数据流转四原则：(1) 输出格式结构化 JSON (2) 进度文件追踪状态 (3) Worker context 精心裁剪 (4) 临时文件及时清理
并行执行：2 Worker 1.5-1.8x 加速 / 4 Worker 2.8-3.4x 加速
端到端示例：Go 项目 API 重构，单 Agent 800K-1.2M tokens → Orchestrator-Worker 100K-150K tokens（-70~85%）

第七章 六大误区

上下文越多越好 ✗ / MCP 越多越强 ✗ / 所有 Agent 上最强模型 ✗ / 聊天记录当长期记忆 ✗ / 只看单价不看总成本 ✗ / Prompt 越短越好 ✗

第八章 核心公式

更低成本 = 更少重复上下文 + 更合理模型路由 + 更精准代码检索 + 更清晰 Agent 分工
