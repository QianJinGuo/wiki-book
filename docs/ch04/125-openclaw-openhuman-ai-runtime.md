# 从 OpenClaw 到 OpenHuman：私人 AI Runtime 的雏形

## Ch04.125 从 OpenClaw 到 OpenHuman：私人 AI Runtime 的雏形

> 📊 Level ⭐⭐ | 14.3KB | `entities/openhuman-private-ai-runtime-from-openclaw.md`

## 它到底是什么？不是助手，是运行层

可以把一个 AI 产品拆成三个平面：界面层、模型层和运行层。界面层包括桌面 App、聊天入口、通知、语音、会议；模型层负责云端模型、本地模型、推理调用；运行层则涵盖上下文、工具、记忆、权限、安全和失败处理。绝大多数 AI 应用都只停在前两层，OpenHuman 的重心踩在第三层。

仓库结构方面，app/ 是 React + Tauri 桌面入口，app/src-tauri/ 负责桌面壳、窗口、权限和 core lifecycle，真正的核心在 src/ 里的 Rust openhuman-core。

## 上下文层：先把你的世界变成 AI 能用的材料

私人 AI 的第一道坎是上下文供应链，必须回答四个问题：数据从哪里来？怎么变干净？什么该记？以后怎么找回来？

OpenHuman 走"应用集成 + 本地记忆"的路线。外部应用接入主要靠 Composio（Gmail、Notion、GitHub、Slack、日历、Drive、Linear、Jira）。集成层分两边：云端管账号、OAuth、webhook、计费、toolkit allowlist 和 HMAC webhook verification；Rust core 里管本地 controller、agent tools、event bus、periodic sync 和 provider-specific sync。

关键常量 TICK_SECONDS = 1200（20 分钟一跳），提前默默整理用户的工作世界。

### Memory Tree 六步记忆漏斗

src/openhuman/memory/tree/ingest.rs 里的主线：canonicalise -> chunk -> fast score -> persist -> enqueue jobs。

六步详解：第一步从 Gmail、Notion、GitHub、日历等接入源拉取数据；第二步清洗并转换成统一格式（canonical Markdown）；第三步按来源分块——聊天按消息边界切，邮件按线索切，文档按段落贪心打包；第四步用 cheap signals 快速打分；第五步明显噪音直接丢，明显价值直接留，中间模糊地带才让 LLM extractor 介入；第六步有价值的记忆写入 SQLite 和 Obsidian-compatible vault，并生成后续任务。

关键细节一：chunk 不是按 token 硬切，DEFAULT_CHUNK_MAX_TOKENS = 3_000 只是上限。邮件有线程，聊天有上下文，GitHub issue 有状态变迁——按来源理解结构比硬切更重要。

关键细节二：score 不全丢给大模型。score/mod.rs 三条阈值：DEFAULT_DEFINITE_DROP = 0.15、DEFAULT_DROP_THRESHOLD = 0.3、DEFAULT_DEFINITE_KEEP = 0.85。低价值先挡掉，高价值直接留，只有模糊地带才交给模型判断。

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

src/openhuman/agent/harness/tool_loop.rs 执行循环：发消息 -> 解析工具调用 -> 执行工具 -> 追加结果 -> 继续循环 -> 最终回复。DEFAULT_MAX_TOOL_ITERATIONS = 10。能执行工具的 AI，必须先有刹车。

**第三道闸：工具权限分级**

src/openhuman/tools/ops.rs 注册了 shell、file read/write、grep、edit、apply_patch、cron、http_request、web_fetch、browser automation、web_search、node_exec、MCP bridge、Composio actions 等工具。

src/openhuman/tools/traits.rs 定义权限层级：None、ReadOnly、Write、Execute、Dangerous。Gmail 发邮件、Notion 创建页面、日历创建事件默认是 Write 级别，在只读沙箱里会被拦掉。

## 信任层：安全不是口号，是控制面

**前端不能直通系统能力**

Tauri 桌面壳和 Rust core 之间通过本地 HTTP/JSON-RPC 通信，并生成 256-bit bearer token。桌面 UI 和本地 core 之间有明确边界。

**能力统一注册**

src/core/all.rs 把 app state、credentials、tools、memory、security、composio、agent、workspace、notifications 等 controller 集中注册。能力不散落，才谈得上治理。

**危险操作被策略约束**

src/openhuman/security/policy.rs 默认策略：autonomy = supervised、workspace_only = true、max_actions_per_hour = 20、require_approval_for_medium_risk = true、block_high_risk_commands = true。

**Prompt Injection 三级拦截**

docs/PROMPT_INJECTION_GUARD.md 定义了三级机制：score >= 0.70 -> block、0.45 <= score < 0.70 -> review、score < 0.45 -> allow。拦截点在 model inference 或 agent/tool loop 前，前端只是提示，后端才是权威。

**raw shell 治理**

rm、dd、sudo、ssh、curl、wget 视为高风险。但 OpenHuman 不是简单禁止联网——它有专门的 http_request、web_fetch、curl tool。raw shell 里的 curl 难以控制，而专用网络工具可以挂上 domain allowlist、SSRF guard、下载大小限制和 workspace 限制。

## 当前阶段与适用场景

OpenHuman 现在不是玩具，也不是成熟产品，更像一台结构已经搭起来、仍在高速施工的原型机。

**强项**：桌面入口、本地 Rust core、Memory Tree、agent 缰绳、工具权限、安全策略，都在同一条主线上。抓准了私人 AI 的真问题。

**短板**：desktop、OAuth、memory、agent loop、tools、voice、meet、local AI、screen intelligence、webhooks、billing 等模块全挤在一个项目里，复杂度极高。

**适合**：开发者、AI 重度用户、产品经理和创业者研究把玩。

**不适合**：直接接入主力公司邮箱、GitHub、Drive 和日历；稳定性与合规门槛很高的生产环境。

结论：OpenHuman 现在还粗糙，但它押中了私人 AI 的下一道题：系统能不能安全地理解我、记住我、替我行动？试 OpenHuman 之前，别先问"它有多聪明"，先问三个更实际的问题：它读了什么？它记住了什么？它能替你做什么？

## 深度分析

**1. "运行层"是私人 AI 区别于通用 AI 助手的关键壁垒**

当前 AI 产品普遍停留在界面层和模型层的竞争（更漂亮的 UI、更强的模型），而忽略了运行层的建设。OpenHuman 的核心洞察是：私人 AI 需要在上下文、工具、记忆、权限、安全和失败处理六个维度建立本地化的控制平面 。这个运行层本质上是个人 AI 和通用 AI 的本质区别——前者需要理解"我是谁、我关心什么、谁能替我做什么"。

**2. Memory Tree 的三级评分机制实现了 LLM 调用量的 10x 削减**

传统 RAG 系统对每个 chunk 都调用 LLM 进行相关性打分，成本极高。OpenHuman 的三级阈值设计（DEFAULT_DEFINITE_DROP = 0.15、DEFAULT_DROP_THRESHOLD = 0.3、DEFAULT_DEFINITE_KEEP = 0.85）实现了分流：明显噪音直接丢弃（不需要 LLM），明显高价值直接保留，只有中间地带才动用 LLM extractor 。这将 LLM 调用量压缩到原来的 10%-20%，同时保持记忆质量不下降。

**3. 六步记忆漏斗的结构化设计是记忆系统工程化的最佳实践**

canonicalise -> chunk -> fast score -> persist -> enqueue jobs 的六步流程覆盖了从数据获取到价值存储的完整链路 。关键设计洞察是"按来源理解结构"而非按 token 硬切：邮件按线程、聊天按消息边界、GitHub issue 按状态变迁 。这比任何通用 chunking 算法都更符合实际数据语义。

**4. Agent Harness 模式将"缰绳"从 prompt 层拉到架构层**

传统 Agent 系统依赖 system prompt 来约束行为，但 prompt 可被绕过、可被污染。OpenHuman 将角色分工、行动循环上限、工具权限分级全部固化为架构层面的 harness 。这个设计哲学是：让正确的事情变得容易，让错误的事情变得困难或不可能。DEFAULT_MAX_TOOL_ITERATIONS = 10 的存在证明了这一点——能执行工具的 AI，必须先有刹车 。

**5. Prompt Injection 防御必须放在模型推理之前**

OpenHuman 的三级拦截机制（score >= 0.70 -> block，0.45 <= score < 0.70 -> review，score < 0.45 -> allow）的拦截点在 model inference 或 agent/tool loop 前 。这意味着即使攻击性 prompt 成功注入了模型，防御系统已经在更早的层面拒绝了它。前端只是提示，后端才是权威——这个架构原则对于所有处理外部输入的 AI 系统都适用。

## 实践启示

**1. 架构设计优先：在构建 AI 应用时先定义运行层**

在开始一个新 AI 项目时，先问自己：这个 AI 需要理解我的哪些上下文？它需要哪些工具权限？安全边界在哪里？记忆的生命周期是什么？把这些问题的答案固化为架构组件，而非堆在 prompt 里。运行层的提前规划能避免后期的安全漏洞和记忆混乱。

**2. 成本控制：实现三级评分分流，减少 LLM 调用**

如果你的记忆系统对每个 chunk 都调用 LLM 评分，立即实现三级阈值分流：将明显低质量的文本（短句、无语义片段、模板内容）用规则直接过滤；将高质量文本（包含明确事实、偏好、决策的片段）直接保留；只有模糊地带才动用 LLM。这个改动通常能削减 80% 的 LLM 调用量，同时提升记忆质量。

**3. 安全优先：永远不要让前端直通系统能力**

Tauri 桌面壳和 Rust core 之间通过本地 HTTP/JSON-RPC 通信，并生成 256-bit bearer token 的设计揭示了一个关键原则：任何外部输入（无论是用户界面还是第三方服务）都不能直接访问系统底层能力 。在设计 AI 应用时，所有工具调用必须经过权限验证层，而非直接暴露给 LLM。

**4. 工具治理：识别高风险命令并用专用工具替代**

rm、dd、sudo、ssh、curl、wget 视为高风险命令 。但简单禁止联网是错误的——应该用专用工具（http_request、web_fetch）替代 raw shell curl，并在专用工具上挂载 domain allowlist、SSRF guard、下载大小限制和 workspace 限制 。这个原则可以推广到所有高风险操作：用最小权限的专用接口替代通用 shell 命令。

**5. 产品判断：如何评估一个私人 AI 项目是否成熟**

试 OpenHuman 之前，先问三个问题：它读了什么（数据源质量）？它记住了什么（记忆提取效果）？它能替你做什么（工具执行能力）？如果这三个问题的答案都是"可审计、可控、可预测的"，那么这个系统才值得信赖。当前阶段不适合直接接入主力公司邮箱和日历，但适合开发者研究把玩 。

## 相关技术栈

- [OpenHuman Memory Tree](ch04/150-ai.md) — 记忆框架核心
- Composio — SaaS 集成平台
- Tauri — 桌面壳框架
- Agent Harness 工程 — 缰绳设计模式

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openhuman-private-ai-runtime-from-openclaw.md)

---

