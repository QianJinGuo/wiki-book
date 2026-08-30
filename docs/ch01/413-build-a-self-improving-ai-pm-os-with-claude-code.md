# Build a self-improving AI PM OS with Claude Code

## Ch01.413 Build a self-improving AI PM OS with Claude Code

> 📊 Level ⭐⭐ | 8.0KB | `entities/p-ai-pms-guide-to-claude.md`

## 摘要

本实体源自 Aakash Gupta《Product Growth》播客对 Pawel Huryn（Product Compass 作者、11K+ star 的 PM Skills Marketplace 作者）的访谈，主题是用 Claude 全家桶搭建"自我改进的 AI PM 操作系统"。核心结论：Chat 已不适合严肃 PM 工作，真实配比是"5% Chat + 70% Dispatch + 25% Claude Code"；让系统持续变强的机制是 CLAUDE.md 路由 + Rules/Hypotheses/Rejected 三态知识循环。

## 核心要点

- **Chat 是死胡同**：无跨设备连续性、无真实文件访问、无可持久化学习系统，三大硬约束决定了它只配占 5% 的时间。
- **Claude 生态四层分工**：Chat（临时问答）→ Cowork（桌面文件工作）→ Claude Code（多文件系统构建）→ Dispatch（移动端并行任务中心），按场景而非按能力堆叠。
- **Self-improving 知识系统**：agent 分析数据后自动生成三类知识——Rules（跨足够数据确认、默认应用）、Hypotheses（带证据计数、达阈值升级为 Rule）、Rejected（被证伪但保留以避免重复测试）。
- **CLAUDE.md 只做路由不做存储**：项目描述、文件结构、知识系统说明与工作流指针留在 CLAUDE.md；写作风格、好坏例子、平台规则、历史数据分别放独立文件，按需加载对应 domain。
- **Personal vs Production automation**：Claude Code 是"agent 解读文本文件的建议"，n8n 是"代码逻辑的确定性执行"；重试、权限、数据隔离等硬保证只能靠后者。
- **"为 agent 建第二大脑"**：喂 10 篇高表现内容，agent 自动提取 hook 模式、金句结构、声音原型与互动指标，按平台分域沉淀，越写越好。
- **GitHub 即操作系统**：把 CLAUDE.md、Skills、知识文件放进 GitHub repo，Code web sessions 指向该 repo，任意设备可访问同一系统。
- **技能迭代是 ROI 核心**：marketplace 技能只是基线，"安装→实战→喂具体失败→重写→再测"迭代 5-6 轮即可覆盖 99% 场景。

## 深度分析

### Chat 的三大硬约束：为什么"不该再用了"

第一是无连续性——桌面开始的复杂任务无法在手机或浏览器接续，只能整段复制对话进新上下文，指望 agent 重建状态。第二是无文件访问——Chat 读不了真实桌面；而 Cowork 能接收一文件夹混杂的 PDF、图片与重复发票，agent 自行制定步骤、用 hash 去重、按月建文件夹并验证，几秒完成。第三是无持久化——跨会话几乎没有可控记忆，无法构建"从错误中学习、从数据中提取模式并自动应用于下一任务"的系统。三约束叠加，Chat 机会成本极高。

### Cowork 与 Claude Code：界面、控制与系统的规模

Cowork 是 Code 的用户友好外壳，适合 50 文件内的桌面知识工作：Skills 采用 progressive disclosure——agent 先读名称与描述，匹配任务才加载完整指令，避免无关指令占用 context；MCP connectors 让 Gmail、Google Drive、Slack、CRM 数据流入，配合 draft-only 模式形成"起草→审批→学习"闭环；用 slash command 触发产品策略技能，可产出带 north star 指标与 guardrails 的"McKinsey 级"策略画布 PPT。但系统长到 50+ 文件（知识库、技能文件、模板、合同、品牌指南）后，需要 Claude Code 的 explorer 面板、Hooks（工具调用前后注入质量检查）、Subagents（并行处理子任务）与按项目隔离凭据的 Local MCP servers——Cowork 的 MCP 连接全局共享，是安全硬伤。HTML infographics 与 component library 是另一复利场景：每个爆款信息图被拆解为布局、视觉组件与密度特征入库，新图从已验证组件组装，新产出再反哺库。

### Self-improving 知识系统：Rules / Hypotheses / Rejected

这是"用 Claude"与"用 Claude 构建"的分水岭。agent 分析数据（帖子表现、offer 转化、候选人录取）时，不只总结，而是生成三类知识：**Rules** 是跨足够多数据确认的模式，默认直接应用——例如"achievement-as-proof 钩子优于 achievement-as-point 钩子"，在 46+ 条帖子中得到确认，之后每个新 hook 都自动套用；**Hypotheses** 是观察到但未确认的模式，以证据计数跟踪，证据累积升级为 Rule、出现反证则降级为 Rejected；**Rejected** 是被数据证伪的想法，保留是为了避免将来重复测试死路。三行提示即可启动：任务前 review 该 domain 的 rules/hypotheses、工作中默认应用已确认规则、完成后根据反馈更新知识。知识按 domain 自动组织（定价规则留在定价、测试规则留在测试），agent 甚至能产出构建者从未见过的假设——这就是复利效应。

### 24/7 工作流与自动化边界

Anthropic 四个远程 surface 中，Dispatch 对 PM 最有用：手机上的单一聊天界面可同时启动多个后台任务线程，购物或陪孩子时 dispatch 任务、回来看结果、再派下一个——把 PM 工作与办公桌解耦。完整决策框架：Dispatch 用于移动端轻量并行任务与快速反馈；Code web sessions 用于需要完整文件树与终端的专注工作（笔记本可离线）；Cowork 是桌面日常主力；Claude Code 处理复杂多文件系统；Chat 只留 5% 给语法检查与一次性问答。最后回答"n8n 是否已死"：没有。Claude Code 属于 personal automation——agent 解读文本文件并给建议，你审批、你决策；生产自动化（客服响应、合规检查、数据管道）需要 n8n 这类确定性执行引擎，因为 markdown 文件无法保证"API 失败重试三次"或"发送前校验客户邮箱"，也无法阻止一个客户看到另一个客户的数据。

## 实践启示

1. 本周就把三行 self-improving prompt 加进 CLAUDE.md，喂 10 个领域优秀示例，跑一个真实任务观察它应用了哪些 rules——领先大多数每次从零 briefing 的 PM。
2. 把 Chat 使用压缩到 5%：迁移到 Cowork/Claude Code 以获得文件访问、工具连接与持久上下文；移动场景用 Dispatch 并行派发任务。
3. 对 marketplace 技能迭代而非照搬：给 agent 具体失败描述（如"acceptance criteria 缺 null 值边界、优先级标签与 P0-P3 不符"），让它读对话、定位根因、从第一性原理重写，5-6 轮后覆盖 99% 场景。
4. 用 draft-only 模式配置 Gmail/Slack connectors：agent 起草、你审批、它从你的修改中学习，审批通过率随时间上升。
5. 把整个操作系统放进 GitHub（CLAUDE.md、Skills、知识文件），用 Code web sessions 指向 repo——多数 PM 跳过的关键同步步骤。
6. 明确 personal 与 production 边界：涉及确定性保证（重试、权限、数据隔离）的场景交给 n8n 类工作流引擎，别指望 markdown 指令。

## 相关实体

- [Hermes Agent 深度解析（阿里云/飞樰）](../ch04/161-hermes-agent.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/035-agent-harness.html)
- [Claude Cowork 2026 大更新](340-claude.html)
- [Claude Dispatch 与接口的力量](371-claude-dispatch-and-the-power-of-interfaces.html)
- [基于 Git 仓库的 PM 自动化](https://github.com/QianJinGuo/wiki/blob/main/entities/git-repo-based-pm-automation.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Agent 自我改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)
- [Build Live Translation Apps with gpt-realtime-translate](081-build-live-translation-apps-with-gpt-realtime-translate.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/p-ai-pms-guide-to-claude.md)

---

