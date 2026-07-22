---
source_url: "https://mp.weixin.qq.com/s/qn4zcUg_Qd5Hy370NlHu1g"
title: "从 OpenClaw 到 OpenHuman：私人 AI Runtime 的雏形"
author: "子非AI"
published: 2026-05-19
created: 2026-05-19
type: article
platform: wechat
tags: [OpenHuman, AI-Runtime, agent, Memory-Tree, Composio, Local-First, Private-AI, Tool-Governance, Security, Rust]
  - OpenHuman
  - AI-Runtime
  - Agent
  - Memory-Tree
  - Composio
  - Local-First
  - Private-AI
  - Tool-Governance
  - Security
  - Rust
sha256: "a7b7d93b76c3987bac5d963903b2756794f0bbb03445158ae279cbeb62e8e22f"
rating: 8.5/9.0
review_value: 8.5
review_confidence: 9.0
review_result: strong
---
# 从 OpenClaw 到 OpenHuman：私人 AI Runtime 的雏形
每次打开 AI 助手，你都在做一件很荒唐的事：给一个超级聪明的陌生人，重新介绍你自己。
客户催到哪一步了，GitHub issue 卡在什么地方，Notion 里方案改过几版，下次评审会是什么时候。这些它全都不知道。
OpenHuman 想解决的，正是这个问题。它的野心不是做一个更漂亮的聊天框，而是给私人 AI 补上缺失的那层底座：把个人上下文、工具执行、应用集成和安全边界，全部放进一个 local-first 的 agent 运行时里。
## 它到底是什么？不是助手，是运行层
可以把一个 AI 产品拆成三个平面：
- 界面层：桌面 App、聊天入口、通知、语音、会议
- 模型层：云端模型、本地模型、推理调用
- 运行层：上下文、工具、记忆、权限、安全、失败处理
绝大多数 AI 应用都只停在前两层。OpenHuman 的重心踩在第三层。
仓库结构：app/ 是 React + Tauri 桌面入口，app/src-tauri/ 负责桌面壳、窗口、权限和 core lifecycle，真正的核心在 src/ 里的 Rust openhuman-core。
## 上下文层：先把你的世界变成 AI 能用的材料
私人 AI 的第一道坎是上下文供应链，必须回答四个问题：数据从哪里来？怎么变干净？什么该记？以后怎么找回来？
OpenHuman 走"应用集成 + 本地记忆"的路线。外部应用接入主要靠 Composio（Gmail、Notion、GitHub、Slack、日历、Drive、Linear、Jira）。
集成层分两边：云端管账号、OAuth、webhook、计费、toolkit allowlist 和 HMAC webhook verification；Rust core 里管本地 controller、agent tools、event bus、periodic sync 和 provider-specific sync。
关键常量：TICK_SECONDS = 1200（20 分钟一跳），提前默默整理用户的工作世界。
### Memory Tree 六步记忆漏斗
src/openhuman/memory/tree/ingest.rs 里的主线：canonicalise -> chunk -> fast score -> persist -> enqueue jobs
六步详解：
1. 从 Gmail、Notion、GitHub、日历等接入源拉取数据
2. 清洗并转换成统一格式（canonical Markdown）
3. 按来源分块：聊天按消息边界切，邮件按线索切，文档按段落贪心打包
4. 用 cheap signals 快速打分
5. 明显噪音直接丢，明显价值直接留，中间模糊地带才让 LLM extractor 介入
6. 有价值的记忆写入 SQLite 和 Obsidian-compatible vault，并生成后续任务
关键细节一：chunk 不是按 token 硬切，DEFAULT_CHUNK_MAX_TOKENS = 3_000 只是上限。邮件有线程，聊天有上下文，GitHub issue 有状态变迁——按来源理解结构比硬切更重要。
关键细节二：score 不全丢给大模型。score/mod.rs 三条阈值：
- DEFAULT_DEFINITE_DROP = 0.15
- DEFAULT_DROP_THRESHOLD = 0.3
- DEFAULT_DEFINITE_KEEP = 0.85
低价值先挡掉，高价值直接留，只有模糊地带才交给模型判断。
## 行动层：不是 prompt，而是缰绳
行动层给 agent 套缰绳，把角色、循环、工具和权限都收进 harness。
**第一道闸：角色分工**
- orchestrator：调度
- researcher：研究
- planner：计划
- code_executor：执行代码
- integrations_agent：调用 SaaS 工具
- archivist：管理长期记忆
这不是多 agent 炫技，是工具面的收缩。一个 agent 看到的工具越多，选错工具的概率就越高。
**第二道闸：行动循环上限**
src/openhuman/agent/harness/tool_loop.rs 执行循环：发消息 -> 解析工具调用 -> 执行工具 -> 追加结果 -> 继续循环 -> 最终回复
DEFAULT_MAX_TOOL_ITERATIONS = 10。能执行工具的 AI，必须先有刹车。
**第三道闸：工具权限分级**
src/openhuman/tools/ops.rs 注册了 shell、file read/write、grep、edit、apply_patch、cron、http_request、web_fetch、browser automation、web_search、node_exec、MCP bridge、Composio actions 等工具。
src/openhuman/tools/traits.rs 定义权限层级：
- None
- ReadOnly
- Write
- Execute
- Dangerous
Gmail 发邮件、Notion 创建页面、日历创建事件默认是 Write 级别，在只读沙箱里会被拦掉。
## 信任层：安全不是口号，是控制面
**前端不能直通系统能力**
Tauri 桌面壳和 Rust core 之间通过本地 HTTP/JSON-RPC 通信，并生成 256-bit bearer token。桌面 UI 和本地 core 之间有明确边界。
**能力统一注册**
src/core/all.rs 把 app state、credentials、tools、memory、security、composio、agent、workspace、notifications 等 controller 集中注册。能力不散落，才谈得上治理。
**危险操作被策略约束**
src/openhuman/security/policy.rs 默认策略：
- autonomy = supervised
- workspace_only = true
- max_actions_per_hour = 20
- require_approval_for_medium_risk = true
- block_high_risk_commands = true
**Prompt Injection 三级拦截**
docs/PROMPT_INJECTION_GUARD.md：
- score >= 0.70 -> block
- 0.45 <= score < 0.70 -> review
- score < 0.45 -> allow
拦截点在 model inference 或 agent/tool loop 前，前端只是提示，后端才是权威。
**raw shell 治理**
rm、dd、sudo、ssh、curl、wget 视为高风险。但 OpenHuman 不是简单禁止联网——它有专门的 http_request、web_fetch、curl tool。raw shell 里的 curl 难以控制，而专用网络工具可以挂上 domain allowlist、SSRF guard、下载大小限制和 workspace 限制。
## 它现在处在什么阶段？
OpenHuman 现在不是玩具，也不是成熟产品，更像一台结构已经搭起来、仍在高速施工的原型机。
**强项**：桌面入口、本地 Rust core、Memory Tree、agent 缰绳、工具权限、安全策略，都在同一条主线上。抓准了私人 AI 的真问题。
**短板**：desktop、OAuth、memory、agent loop、tools、voice、meet、local AI、screen intelligence、webhooks、billing 等模块全挤在一个项目里，复杂度极高。
**适合**：开发者、AI 重度用户、产品经理和创业者研究把玩。
**不适合**：直接接入主力公司邮箱、GitHub、Drive 和日历；稳定性与合规门槛很高的生产环境。
结论：OpenHuman 现在还粗糙，但它押中了私人 AI 的下一道题：系统能不能安全地理解我、记住我、替我行动？
试 OpenHuman 之前，别先问"它有多聪明"，先问三个更实际的问题：它读了什么？它记住了什么？它能替你做什么？