# Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台

## Ch04.087 Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台

> 📊 Level ⭐⭐ | 16.9KB | `entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md`

# Boris Cherny 新访谈：IDE → Agent 控制台
## 核心观点
Boris Cherny（Anthropic Claude Code 负责人）在 Sequoia AI Ascent 2026 访谈中，系统性地阐述了开发工具的范式转变：从 IDE（人类在画布上操作）到 Agent 控制台（AI 是主要执行者，人是审阅者和方向设定者）。这不仅是 Claude Code 一家的产品变化，而是软件工程控制点的一次整体迁移。

## 产品悬置：能力溢出后产品形态才成立
Claude Code 的爆发不像传统 SaaS 逐步验证 PMF，而是先赌模型能力越过某个点，提前把产品形态放在那里。前半年不好用不代表方向错；等 Opus 4 之后模型能力上来，原来超前的交互突然就成立了。这种"产品悬置"策略要求团队对模型能力曲线有坚定预判，而非等待 PMF 信号。

## Claude Code 的成长路径
| 阶段 | 状态 |
|---|---|
| Anthropic Labs 三人小组起步 | 早期探索 |
| 前半年几乎没有 PMF | 产品验证期 |
| Opus 4 之后曲线突然起飞 | 能力临界点突破 |
| 现在：从手机管理几百个 Agent | 规模化运营 |

## 深度分析
### 从输入预测到自主代理的根本转变
传统 AI 编程工具范式中，模型是"跟着光标走的补全器"——人在 IDE 里停下，模型补下一行。这是输入预测（input prediction）模式，人是中心，模型是加速器。
Claude Code 的定位是 agentic coding system——可以读取代码库、跨文件修改、运行测试、在修改文件或执行命令前请求明确权限。这使得模型成为一个自主的工作空间参与者，而非预测下一个 token 的工具。
这个转变的核心不是代码作者换了，而是**人的控制点换了**。过去开发者主要控制文件、函数、命令和光标；现在开发者控制的是目标、约束、权限、预算、验证和审查。

### Agent Loop：从"一次 prompt 得到一次回答"到持续工作进程
Boris 描述的工作场景已经超越传统对话：盯 PR 并自动修 CI、自动 rebase、持续观察测试是否 flaky、每隔一段时间从 Twitter 把对 Claude Code 的反馈拉回来聚类整理。这些不是聊天，是长期运行的工作进程（long-running work processes）。
普通 AI 对话模式是：问一次，答一次，上下文停在那里。Agent Loop 模式是：定义目标，Agent 定期观察、持续执行、发现异常、尝试修复、记录过程、把关键结果推给人，人只在需要判断、审批、取舍的时候介入。
这意味着开发工具需要展示的不只是"模型说了什么"，还要让人看见：Agent 正在做什么、跑到哪一步、失败几次、改了哪些文件、调用了哪些工具、花了多少 Token、有没有触碰危险资源、哪些动作需要人工确认。

### 代码生成变便宜，但软件工程没有变简单
Boris 自己说"coding 已经 100% solved"，但这句话需要拆开理解。Claude Code 主栈是 TypeScript 和 React，踩在模型最熟悉的分布里；Boris 在 Anthropic 内部用着最新模型、最新工具、最新流程，整个团队都围绕 Claude Code 重建了工作方式。在这个环境下把代码执行交给 Agent 是合理的。
但对于其他场景——跑了三十年的 C++ 系统、强合规的银行核心、嵌入式固件项目、上线窗口极窄的生产系统——问题不只是"代码能不能生成"，还要回答：历史设计为什么是今天这样、哪些边界不能动、变更怎么过审、数据风险怎么隔离、失败以后谁来负责。
**代码生成正在快速变便宜，软件工程没有因此变简单。** Agent 能做的越多，治理问题暴露得越早。

### SaaS 从前台入口退到 Agent 后台能力层
过去人每天打开 CRM、Jira、Notion、Google Docs、Excel、ERP、BI 在不同界面之间切来切去。Agent 出现后，用户可能只在一个工作台里说"查一下这个客户最近三个月的沟通记录，把风险点列出来，更新 CRM，生成跟进计划，同步到 Slack"。这时 Salesforce、Jira、Google Docs 都还在，但人不一定再直接操作它们——Agent 成了入口。
MCP（Model Context Protocol）和 Computer Use 正在重塑知识工作入口：有稳定接口的系统通过 MCP、API、CLI 暴露能力；没有接口、没有文档、甚至只能点界面的老系统，短期可能靠 Computer Use 兜底。核心逻辑是：外部系统要变成 Agent 可理解、可调用、可审计、可治理的能力。

### 组织升级比模型升级慢得多
Anthropic 内部真正领先的地方，不一定是模型本身，而是组织流程。Agent 会通过 Slack 和其他人的 Agent 沟通，SQL 由模型写，代码也大量由模型生成。但这种状态不能直接照搬到银行、医院、制造业、政务系统，甚至也不能照搬到已经运转十年的中大型 SaaS 公司。
很多公司现在的问题是：模型接进来了，组织没变。工程师还是按老流程排需求、写代码、提测、上线、修线上问题，AI 只是某个环节里的辅助工具。模型升级几周一次，组织升级往往按季度、按年算。

### 工程师能力从"亲手生产代码"转向"拥有系统结果"
Agent 可以生成代码，但它很难自动拥有复杂业务上下文。尤其在复杂业务里，最值钱的不是"知道某个 API 怎么写"，而是知道这套系统为什么长成这样、哪些历史约束还没消失、哪些业务规则不能靠表面文档理解。
这意味着工程师的日常会越来越体现在：把含糊需求整理成 Agent 可执行的规格、把大任务切成互不污染的工作单元、判断 Agent 方案是否漏了关键边界、设计测试和评估让结果自己说话、看懂 diff 背后的架构影响、区分哪些动作可以自动哪些需要人工确认、把一次成功经验沉淀成团队 Skill 或 Runbook。

### MCP 与 Computer Use 的互补定位
MCP 和 Computer Use 代表了 Agent 接入外部系统的两条不同路径：有稳定接口的系统通过 MCP、API、CLI 暴露能力；没有接口、没有文档、甚至只能点界面的老系统，短期可能要靠 Computer Use 兜底。核心逻辑是：外部系统要变成 Agent 可理解、可调用、可审计、可治理的能力。实践中，团队应优先为高频使用的系统开发 MCP 集成，长期看那些无法通过 API 访问的系统需要单独的自动化方案。

### 模型升级周期与组织升级周期的错配
Anthropic 内部真正领先的地方不只是模型本身，而是组织流程——Agent 通过 Slack 和其他人的 Agent 沟通，SQL 由模型写，代码大量由模型生成。但很多公司的问题是：模型接进来了，组织没变。工程师还是按老流程排需求、写代码、提测、上线、修线上问题，AI 只是某个环节里的辅助工具。这种错配不会因为模型升级自动解决——模型升级几周一次，组织升级往往按季度、按年算。

### 小团队速度优势被放大，但大组织迁移成本不可忽视
当构建成本下降，小团队从 0 到 1 的速度会变快。大组织要改流程、改权限、改考核、改协作习惯，速度不会跟模型升级一样快。但这个说法要打边界——它不是说大公司一定输，而是说大组织如果要迁移到 Agent 工作方式，需要提前规划组织变革路径，而非期望组织在引入 Agent 后自动适应。

## 实践启示
### 1. 以 Loop 而非会话为粒度设计工作流
传统 AI 辅助编程以"一次 prompt 得到一次回答"为单位，但 Agent 时代应该以 Loop 为设计单元。一个 Loop 包含：定义目标 → Agent 定期观察 → 持续执行 → 异常处理 → 结果审查 → 人工决策点。团队应该识别哪些任务是适合常驻 Loop 的（如盯 PR、修 CI、监控测试），哪些需要人工触发，而非将 Agent 简单嵌入现有单次交互流程。

### 2. 重新定义开发工具的度量指标
当 Agent 成为主要执行者，传统的代码行数、commit 频率等指标逐渐失效。新的度量维度包括：Agent 完成任务的成功率、Loop 持续运行的时间、Token 消耗效率、风险动作人工确认率、Agent 产出被接受 vs 拒绝的比例。这些指标更能反映 AI-native 开发团队的效能。

### 3. 构建 Skills 和 Runbooks 作为团队过程资产
Boris 提到把一次成功经验沉淀成团队 Skill 或 Runbook。这不是传统的 SOP 文档，而是能被 Agent 理解和执行的技能条目。团队应该开始系统性地积累 Skills：什么场景用什么 Agent、什么约束不能逾越、什么信号说明 Agent 方案可能有问题。这些过程资产的丰富程度会成为团队 AI 能力的关键分水岭。

### 4. 渐进式引入 Agent 进入工程链路
对于组织来说，不建议一次性全面部署 Agent。应该从低风险、高重复性的任务开始：自动修 CI、整理文档、查日志、开 PR 描述、SQL 查询。逐步积累对 Agent 能力和边界的体感，再扩展到更高风险区域。每个扩展阶段都需要明确：Agent 的权限边界是什么、谁审查输出、失败时谁负责。

### 5. 重视 Harness 而非仅关注模型本身
Claude Code 的成功不完全取决于模型能力，Harness（模型外那层运行底座）同样关键：工具怎么定义、上下文怎么取、状态怎么留、权限怎么管、失败怎么恢复。模型差距在缩小，但 Harness 差距在放大。同一个模型放进不同 Coding Agent，体感差距往往不在模型本身，而在 Harness。

### 6. 工程师角色的重新定位
"程序员变成管理 Agent"这句话有道理，但如果只停在这层会漏掉一部分变化。更准确地说，软件开发的交互界面正在从编辑器交互变成工作流控制。工程师的价值更多落到目标设定、边界定义、验证设计、风险管控和系统所有权上。这些能力过去也重要，只是经常被大量手写代码的工作量盖住。

### 7. 将"领域知识沉淀"纳入团队核心资产
Boris 提到"最值钱的不是知道某个 API 怎么写，而是知道这套系统为什么长成这样"。这意味着团队应该把领域知识——历史设计决策、边界约束、业务规则——纳入和代码同等重要的资产位置。具体做法包括：建立 Architecture Decision Records（ADR）记录关键设计选择、维护业务规则百科而非只靠代码注释、确保新工程师 onboarding 时理解"为什么"而非只了解"是什么"。这些知识难以被当前 Agent 自动捕获，需要团队主动维护。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台-v2.md)

## 相关实体
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch04/503-agent.md)
- [Boris Cherny — 从 IDE 到 Agent 控制台](ch04/503-agent.md)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/245-skill.md)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](ch01/380-claude.md)
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](ch03/073-claude-code.md)
- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](ch04/245-skill.md)
- [Cat Wu — Anthropic Claude Code/Cowork产品负责人](ch03/073-claude-code.md)
- [Claude Code 工具设计演化](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md)
- [Mythos for Offensive Security: XBOW's Evaluation](https://github.com/QianJinGuo/wiki/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md)
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](ch04/150-ai.md)
- [claude-code-agent-view](ch09/001-claude-code-agent-view.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch01/378-claude-code-harness-deep-understanding.md)
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](ch04/503-agent.md)
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](ch04/150-ai.md)
- [两万字详解Claude Code源码核心机制](ch03/073-claude-code.md)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Claude Opus 4.7 发布分析](ch01/671-claude-opus-4-7.md)
- [Anthropic Claude Managed Agents 平台正式发布](ch04/503-agent.md)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch03/073-claude-code.md)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](ch07/006-claude-code-skills-mcp-rules-source-analysis.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](ch03/073-claude-code.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](ch03/073-claude-code.md)
- [Claude Code MCP Server](ch07/025-claude-code-mcp-server.md)
- [Anthropic 14 个 Agent Skills 设计模式](ch04/245-skill.md)
- [Anthropic Computer Use 最佳实践](ch01/689-anthropic-computer-use.md)
- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](ch03/073-claude-code.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch04/503-agent.md)- [Harness如何支撑Agent在生产环境稳定运行？](ch04/503-agent.md)
- [claude code 一周年回顾：boris cherny + cat wu 对话](ch03/073-claude-code.md)

---

