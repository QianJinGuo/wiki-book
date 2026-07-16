# Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台

## Ch04.136 Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台

> 📊 Level ⭐⭐ | 14.2KB | `entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台-v2.md`

## 相关实体
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)
- [Boris Cherny — 从 IDE 到 Agent 控制台](../ch03/046-agent.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/458-claude-code-harness-deep-understanding.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Harness如何支撑Agent在生产环境稳定运行？](../ch05/099-harness.html)
- [Claude Code 可控性：软规则无法变成硬约束](../ch03/076-claude-code.html)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)
- [Martin Fowler AI 研发 Harness：非确定性承重层](../ch05/099-harness.html)
- [Agent Reliability: Context Drift & Tool Calling Hallucination](../ch03/046-agent.html)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](../ch05/052-harness-engineering.html)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](../ch05/099-harness.html)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [AutoResearch：多 Agent 自动化软件开发](../ch03/046-agent.html)
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md)
- [Agent Harness 架构](../ch05/039-agent-harness.html)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](../ch03/076-claude-code.html)
- [Agent 自我改进的六条路](../ch03/046-agent.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Claude Code 设计原则与对照分析](../ch03/076-claude-code.html)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](../ch07/006-claude-code-skills-mcp-rules.html)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch03/076-claude-code.html)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/391-agent-skills.html)
- [Claude Code 源码核心机制详解](../ch03/076-claude-code.html)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/076-claude-code.html)
- [Claude Code MCP Server](../ch07/027-claude-code-mcp-server.html)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](../ch01/459-claude.html)
- [Claude Code 开发负责人：为何放弃 RAG 而选择 Agentic Search](../ch03/076-claude-code.html)
- [Agent架构关键变化：Harness正在成为新后端](../ch05/099-harness.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/046-agent.html)- - [Agent 原理、架构与工程实践](../ch03/046-agent.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)
## 核心观点
Boris Cherny 在 Sequoia AI Ascent 2026 上的访谈，提出了一个关键命题：**开发工具的中心正在从 IDE 里的光标，慢慢挪到管理 Agent 工作流的那块控制台上。**
这个转变的深层含义是：以前问的是"AI 能不能帮工程师更快地写代码"，现在问题变成了"人怎么把目标讲清楚，Agent 怎么持续执行，系统怎么记录过程，风险动作怎么审批，最后结果怎么验证和回滚"。

## 深度分析
### 1. 产品悬置与能力跨越
Claude Code 的爆发不像传统 SaaS 那种一步步验证需求、慢慢打磨 PMF 的路径。它更像是先赌模型能力会越过某个点，然后提前把产品形态放在那里。前半年不好用，不代表方向错了；等模型能力上来，原来有点超前的交互突然就成立了。
这背后是一个重要的产品规律：**当能力溢出之后，产品形态才突然成立**。AI 编程工具的真正窗口不是"模型还不够好的时候"，而是"模型能力刚刚跨过某个临界点"的时候。

### 2. 代码生成正在变便宜，软件工程没有变简单
Boris 那句"coding 已经 100% solved"要拆开理解。代码生成在主流场景里确实变强了，但工程里的治理、验证、责任边界还在。
弱一点的补全工具最多写坏几行代码。一个能读仓库、改文件、跑命令、连 Slack、查数据库、修 CI、开 PR 的 Agent，已经不是普通插件了——它更像一个新的工程参与者。
**代码生成正在快速变便宜，软件工程没有因此变简单。** 很多时候反而是反过来的，Agent 能做的越多，治理问题暴露得越早。

### 3. 开发工具交互界面的根本迁移
从输入预测到自主代理，是一张很直观的图。输入预测时代，模型更像一个跟着光标走的补全器。自主代理时代，它开始自己读上下文、找文件、跑命令、修失败、再把结果交给人审查。
旧的开发路径是：人理解需求 → 人打开文件 → 人写代码 → 人跑测试 → 人修 bug → 人提交 PR。
新的路径更接近：人定义目标 → Agent 读取上下文 → Agent 制定计划 → Agent 修改代码 → Agent 运行测试 → Agent 根据失败继续修 → 人审查 diff、命令、风险和最终结果 → 人决定是否合并。
这里最关键的变化不是代码作者换了，而是**人的控制点换了**。过去开发者主要控制文件、函数、命令和光标。现在很多时候，开发者控制的是目标、约束、权限、预算、验证和审查。

### 4. Loop：Agent 从回答者变成执行者的关键
普通 AI 对话是：**我问一次，你答一次，上下文停在那里。**
Agent Loop 是：**我定义目标，你定期观察，你持续执行，你发现异常，你尝试修复，你记录过程，你把关键结果推给我，我只在需要判断、审批、取舍的时候介入。**
Boris 现在很多任务已经不是"一次 prompt 得到一次回答"。比如盯 PR，自动修 CI，自动 rebase；比如持续观察某个测试是不是 flaky；比如每隔一段时间从 Twitter 把对 Claude Code 的反馈拉回来，聚类整理之后再发给他。这些事都不是聊天，它们更像长期跑着的工作进程。

### 5. SaaS 从前台入口退到后台能力层
AI 会削弱 switching cost 和 process power，网络效应、规模经济、独占资源这些仍然有效。
但很多 SaaS 不会消失，它们会从人的前台入口，退到 Agent 的后台能力层。过去人每天打开 CRM、Jira、Notion、Google Docs、Excel、ERP、BI，在不同界面之间切来切去。Agent 出现以后，用户可能只在一个工作台里说话，Agent 成了入口。

### 6. 模型升级很快，组织升级没那么快
Anthropic 内部真正领先的地方，不一定是模型本身，而是组织流程。Agent 会通过 Slack 和其他人的 Agent 沟通，SQL 由模型写，代码也大量由模型生成。
很多公司现在的问题是：**模型接进来了，组织没变**。工程师还是按老流程排需求、写代码、提测、上线、修线上问题。AI 只是某个环节里的辅助工具。
模型升级可能几周一次，组织升级往往按季度、按年算。所以"大家都能拿到同一个模型"，不代表差距会很快抹平。更慢的是流程、责任、权限、文化和评估体系。

### 7. 工程师能力从"亲手生产代码"转向"拥有系统结果"
写代码只是工程工作的一部分。更难的是：什么问题值得做，需求背后真正约束是什么，哪些方案现在能落地，哪些风险不能接受，这个变更会不会影响旧用户，哪个指标能证明它真的变好，什么时候该停下来，什么时候要推翻重来。
Agent 可以生成代码，但它很难自动拥有这些上下文。尤其在复杂业务里，最值钱的不是"知道某个 API 怎么写"，而是知道这套系统为什么长成这样，哪些历史约束还没消失，哪些业务规则不能靠表面文档理解。

## 实践启示
### 给工程师的建议
1. **把含糊需求整理成 Agent 可以执行的规格** — 这是最基础的架构能力
2. **把大任务切成几个互不污染的工作单元** — 涉及到上下文隔离和状态管理
3. **判断 Agent 的方案是否漏了关键边界** — 需要深厚的领域知识
4. **设计测试和评估，让结果自己说话** — 验证能力变得更重要
5. **看懂 diff 背后的架构影响** — 代码审查的维度变了
6. **区分哪些动作可以自动，哪些需要人工确认** — 权限和风险管理
7. **把一次成功经验沉淀成团队 Skill 或 Runbook** — 过程资产化

### 给组织的建议
1. **重新思考团队拓扑** — 从专业孤岛之间互相交接，变成每个角色都保留自己的专业深度，同时具备一点把想法落成软件的能力
2. **建立 Agent 使用边界和审批流程** — 不是模型能力问题，是组织设计问题
3. **设计成本预算和计量体系** — 按人算还是按任务算
4. **建立 Loop 故障停机权限** — 谁有权限停掉一个跑坏的 Loop
5. **重新定义"优秀工程师"** — Boris 自己说："Someone has to prompt the Claudes, talk to customers, coordinate with other teams, decide what to build next. Engineering is changing and great engineers are more important than ever."

### 技术判断
1. **MCP 和 Computer Use 都重要** — 有稳定接口的系统通过 MCP、API、CLI 暴露能力；没有接口、没有文档的老系统短期可能要靠 Computer Use 兜底
2. **能被安全调用的系统会继续留在工作流里** — 企业软件竞争维度变了：从界面、流程、模板、审批体验，转向能力目录、权限边界、数据质量、审计记录和被 Agent 调用时的可靠性
3. **小团队速度优势被放大** — 当构建成本下降，小团队从 0 到 1 的速度会变快；而大组织要改流程、改权限、改考核、改协作习惯，速度不会跟模型升级一样快

### 一句话总结
**软件开发的交互界面正在从编辑器交互变成工作流控制。AI 走到 Agent 这一步，最后还是要回到人怎么组织工作。**

---

