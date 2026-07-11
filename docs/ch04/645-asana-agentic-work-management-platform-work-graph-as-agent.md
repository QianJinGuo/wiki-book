# Asana Agentic Work Management Platform — Work Graph as Agentic OS

## Ch04.645 Asana Agentic Work Management Platform — Work Graph as Agentic OS

> 📊 Level ⭐⭐⭐ | 16.9KB | `entities/asana-agentic-work-management-platform-lettertwo.md`

# Asana Agentic Work Management Platform — Work Graph as Agentic OS

> **Background**: 本文是 Asana 2026-06-04 发布「Agentic Work Management Platform」的产品深度报道(来源 The Letter Two),对 Asana CPO Arnab Bose 进行了独家访谈。这是 SaaSpocalypse 时代 Asana 市值腰斩后,以「work graph + 共享记忆 + 治理审计」四个支柱试图重新定义自己为「人-代理 OS」的关键产品转折。Asana 2.0 预计 2026 年夏天全面上线,所有现有客户自动获得 AI Teammate 执行配额和 Dash 访问。

## 三个独有贡献(不应合并到现有 entity)

1. **Work Graph 作为 context graph 的具体形态** — 不是文档/向量/KV cache,而是 18 年项目管理基础设施沉淀的「who does what, by when, why」组织记忆;Glean/Slack/ServiceNow/Atlassian 都在 2025-2026 大谈 agent context,但 Asana 的差异化是它已经把这个 context graph 提前建好了,代理只是后来者。
2. **个人代理 vs 多人代理的产品二元划分** — Dash(你的个人 chief-of-staff,可调用 Teammates)与 AI Teammates(团队工作流内的多人代理,共享记忆)的清晰边界;asymmetric 而不是 symmetric 的「代理编排」是 Asana 对「every worker becomes a manager of AI agents」的设计回答。
3. **垂直应用层打包(Asana Service Management / Command by Asana / Client Management)** — 不是只卖平台,而是 3 个开箱即用的高价值垂直场景(竞品直接对标 ServiceNow/Atlassian + 内部 IT 票务 + 代理商 client onboarding);Asana 明示会「displace 现有 ticketing 产品」而不是补充。

## 核心定位与背景

### 为什么做 Agentic Work Management

Asana 用一组数据点出企业级代理部署的核心矛盾:75% 知识工作者用 AI,但**只有 5% 的组织报告了有意义的效率提升**。CPO Arnab Bose 解释根因:**代理在企业失败是因为缺乏组织记忆(organizational memory)**——不知道谁做什么、什么时候做、为什么做。

Asana 的判断是:18 年项目管理 SaaS 沉淀下来的 Work Graph(任务-责任人-时间-依赖-目标的语义网络)本身就是企业已经拥有的组织记忆数据库,只是没让 AI 代理用过。现在把代理接进来,Work Graph 就成为代理能读懂企业上下文的**事实基础设施**。

> "We created the collaborative work management category. Now we're creating a new category: agentic work management." — Arnab Bose, CPO @ Asana

### 四个结构性优势(Asana 自述,需对照竞品验证)

1. **Work Graph = true context graph** — 跟踪 work + 责任人 + deadline + why,不只是文档/任务列表
2. **Multiplayer interaction model** — 所有代理活动对**整个团队**可见,不只是发起人
3. **Shared memory** — 多个 Teammate 与多个 worker 交互时保留所学,新成员不用重新训练代理
4. **Full audit trail** — 每个代理 action 记录访问了什么、谁拥有代理、运行成本

这四点共同构成了「把代理实验变成可靠记录系统」的组织记忆基础设施——这是 Asana 对「agentic enterprise easy button」的核心定义。

## 产品矩阵(三层架构)

### 第一层:个人助理 — Asana Dash

Dash 是**个人专属**的 AI 助理(明确不叫 Teammate,定位为「你的」助理而非「同事」),可调用所有 Teammate 能力,处理个人工作流。

**典型使用场景** — Bose 自述:每天早 8 点收到一个 morning brief,聚合:
- 过去 24h 未读邮件
- 选定 Slack 频道的未读消息
- 关键项目的状态更新和活动
- 摘要 + 待办 + 待审批

> "All of these things are just helping me get going with my game much faster." — Bose

**与 Teammates 的产品二元划分**:
- Dash = 1:1 (你-助理)
- Teammates = n:n (团队-代理)

这个划分回应了「每个工作者都成为 AI 代理管理者」的现实,提供一个**不对称的代理编排层**:你 → 你的 Dash → 调起团队 Teammates。

### 第二层:下一代 AI Teammates

AI Teammates 2024 年首次推出,2025-09 升级为「同事式」(active 而非 passive),2026-03 全面可用。

**2026-06-04 新一代 Teammates 增强**:
- 重设计 chat interface
- 智能 in-product 推荐「哪个 Teammate 适合这个任务」
- Skills library(团队可扩展 Teammate 能力,捕获可复用工作模式)
- 新集成:Gmail / Outlook / Slack / HubSpot / Figma / Canva(覆盖日常工作流)

**行业垂直 Teammates**(原有 marketing/IT/operations 之外扩展):
- 制造业
- 零售业
- 行业特定的 launch planner(主动扫描 status updates、识别风险、追逐 stakeholder 更新)

设计哲学 — **「人类成为 tastemaker」**:
> "The human being is elevated to being the tastemaker, where they can evaluate if the quality of the remediation is what they want, if they want to run a different play, [or] how they want to do stakeholder management with other human beings." — Bose

代理负责:扫描、识别、追逐、分析
人类负责:判断质量、决策、关系管理

### 第三层:垂直应用(Asana 2.0 的高价值场景)

#### Asana Service Management

- 场景:IT / HR / 设施的 service desk
- 核心:把 support ticketing 和 project management 合并
- 特性:self-learning knowledge base(可改善 case deflection 随时间)
- 关键:如果 case 涉及多个团队,Asana 可以**从 ticket 升格为 project 不丢上下文**
- 竞品:直接对标 **ServiceNow** / **Atlassian** / **Salesforce Agentforce IT Service**

Bose 公开表态:
> "We are seeing a tremendous amount of interest from our customer base in replacing their existing IT ticket management tools with something more modern... In the cases where people buy us, they will be displacing an existing ticketing product."

这是 SaaSpocalypse 时代罕见的「我就是要 displace 现有玩家」宣言,值得跟踪落地数据。

#### Command by Asana

- 场景:软件开发生命周期
- 定位:不是 coding agent、不是 CLI,而是**编排整个开发生命周期的 framework**
- 能力:生成 PRD / 文档化 tickets / 与 coding agents 协作 / 跟踪 PR / 报告 velocity/risk/timeline 给 engineering 和 product leaders
- 含义:Asana 在代理生态中不抢 coding 角色,做**上层 orchestration**(类似平台玩家做 market place)

#### Asana Client Management

- 场景:agency / consulting 的 client onboarding
- 能力:6 个 pre-built 专门化 AI Teammates(client intake / project staging / producing deliverables / status communication)
- 定位:把 6 个 best practice 工作流打包为可立即采用的产品

## 商业背景:SaaSpocalypse 中的 Asana

- Asana 2026-05 刚以 $75M 收购 no-code agentic 开发平台 **StackAI**
- 文中提到「Asana 已被生成式 AI 严重影响」,市值近腰斩(Fortune 2026-05-29 报道)
- Asana 2.0 = 对现有 $800M 客户基础的「reinvent」
- 所有客户自动获得 AI Teammate 执行配额 + Dash 访问 — 降低 procurement 摩擦
- StackAI 整合计划:用户在 StackAI 建的代理,可在 Asana 内作为 AI Teammate 集成,获得 Work Graph + 共享记忆 + 多人协作 + 治理

## 与竞品的差异化(对照表)

| 维度 | Asana Agentic Work Mgmt | ServiceNow | Atlassian | Salesforce Agentforce | Glean |
|------|------------------------|------------|-----------|---------------------|-------|
| **核心 context 来源** | Work Graph (18 年项目管理) | ITSM + CMDB + workflow | Teamwork Graph (2026-05 开放) | Data Cloud + Slack | 企业搜索 / RAG |
| **个人代理** | Dash (chief-of-staff) | Now Assist | Atlassian Intelligence | Agentforce Personal | Glean Assistant |
| **多人代理** | AI Teammates (共享记忆) | AI Specialists | Rovo Agents | Agentforce 360 | Glean Agents |
| **审计/治理** | Full audit trail + cost log | 强(企业级 ITSM 出身) | 中 | 中-强 | 弱(主要搜知识) |
| **垂直打包** | IT / 编程 / 客户管理 | ITSM / HR / 财务 | 软件开发 / 服务管理 | 销售 / 服务 / 营销 | 通用知识工作 |
| **开放/扩展** | StackAI 收购 + Skills library | 自家平台 | 第三方代理开放 | AgentExchange | 第三方 connector |
| **客户基础** | $800M ARR (2026) | 更大($10B+) | 相当规模 | 最大 | 较小(新) |

> Asana 的差异化叙述:已有 18 年「who does what, by when, why」数据 + 现有客户基数;ServiceNow 是「我们就是系统」、Atlassian 是「我们开放 Graph」、Salesforce 是「我们销售全栈」、Glean 是「我们搜全公司」。

## 三个值得跟踪的开放问题

1. **Work Graph 的真实深度** — Asana 自述「true context graph」与 Atlassian Teamwork Graph(2026-05 开放)对「context」的覆盖差异在哪?两者都讲 multi-agent context layer,功能重叠还是分层?
2. **StackAI 整合的实际效果** — $75M 收购的具体技术整合是「用户可在 Asana 内调起 StackAI 代理」,还是「StackAI 平台变 Asana 子产品」?前者是 feature,后者是 product pivot。
3. **「displace 现有 ticketing」的落地** — 公开表态要 displace ServiceNow / Atlassian,实际客户迁移数据(尤其 IT 部门采购周期长 vs Asana 当前以 marketing/operations 为主)需要 2026 Q3-Q4 验证。

## 与现有 wiki 实体的关联

- 与 **[claude-code-large-codebase-harness-configuration](../ch03/075-claude-code.html)** 的关系:Command by Asana 试图用 workflow 框架而非 coding agent 实现「人+代理协作」,与 Claude Code 在 coding 场景的 agentic 思路形成对比(work-graph orchestration vs direct coding agent)
- 与 **[harness-engineering-framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)** 的关系:Asana 的「multiplayer interaction model + shared memory + audit trail」是 enterprise work graph 层的人类-代理协作 OS 案例(对比 Claude Code 是 coding 场景的 agent harness)
- 引用 [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/asana-agentic-work-management-platform-lettertwo.md) 作为唯一 source,做 enterprise agentic work platform 的产品定位基线

## 深度分析

1. **Work Graph 是"事后优势"而非"先发优势"** — Asana 18 年沉淀的项目管理数据(who does what, by when, why)在 AI 时代突然变成了关键资产,因为大语言模型驱动的代理最缺的就是组织上下文记忆。这不是 Asana 主动构建的护城河,而是"存量资产的重估"。竞品(Glean/Slack/ServiceNow/Atlassian)都在 2025-2026 年试图从零搭建 context graph,但 Asana 已经拥有现成的语义网络,代理只是后来者。这解释了为什么 Asana 的差异化叙述是"work graph as agentic OS"而非"我们新发布了一个 AI 功能"。

2. **75% vs 5% 的鸿沟揭示了 AI 采用率的"欺骗性"** — 75% 知识工作者使用 AI 意味着个人生产力工具的渗透率很高,但只有 5% 组织报告有意义的效率提升说明企业级价值几乎不存在。根因不是 AI 能力不足,而是缺乏组织记忆导致代理无法在企业工作流中可靠地发挥作用。这个数据点否定了"AI 采用率 = AI 价值"的线性假设,提醒我们 AI 工具在个人层面的成功和它在组织层面的成功是两件截然不同的事。

3. **asymmetric 代理架构是"人-代理协作 OS"的产品设计答案** — Dash(你 → 你的个人助理)和 AI Teammates(团队 → 多人代理)的二元划分回应了一个根本问题:当每个工作者都成为 AI 代理管理者时,谁来编排这些代理?Asana 的回答是"不对称层级":你调用 Dash,Dash 调用 Teammates。这个设计的巧妙之处在于:它不要求普通工作者直接管理多个代理,而是通过个人助理做了一个代理编排的抽象层,将认知负担保留在个人层级而非组织层级。

4. **"displace 现有 ticketing 产品"的公开宣言是 SaaSpocalypse 生存逻辑的体现** — 在市值腰斩的背景下,Asana 不再满足于"补充"IT 票务工具,而是明确表示要 displace ServiceNow/Atlassian/ Salesforce Agentforce。这是防御性进攻:在一个被压迫的市场里,仅做"更好的项目管理工具"不够活下来,必须切入更大(且已有成熟玩家)的 ITSM 市场。$75M 收购 StackAI + 三个垂直应用 + displace 宣言,构成了一套连贯的生存策略。

5. **Command by Asana 的"上层编排"定位避开了与 coding agent 的正面竞争** — Asana 明确不做 coding agent/CLI,而是做"整个开发生命周期的 orchestration layer"。这类似于平台玩家建 marketplace 而不是应用——Asana 承认自己在代码生成层面的相对弱势,选择在更靠近管理决策层的环节建立控制点。这一定位与 [harness-engineering-framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的思路形成有趣对比:harness 偏向 coding 场景的直接代理控制,而 Asana 选择在工作流层做编排整合。

## 实践启示

1. **重新审视你现有的"工作记录基础设施"** — 如果你的组织已经在使用项目管理工具积累了大量"谁做什么、什么时候做、为什么做"的数据,这些数据在 AI 时代可能是你最有价值的资产之一。评估你的工作流数据是否足够结构化,能否作为组织记忆供 AI 代理使用——这可能是比采购新 AI 工具更高杠杆的投资。

2. **用"组织记忆覆盖率"而非"AI 采用率"评估 AI 投资** — 75% vs 5% 的鸿沟表明,单纯追求 AI 使用率是错误指标。真正的评估维度应该是:在你的组织中,AI 代理能否访问到它需要的所有上下文(责任人、截止时间、依赖关系、变更历史)来可靠地完成工作?从"有多少人在用 AI"转向"有多少 AI 决策有完整上下文",是解锁企业级 AI 价值的关键。

3. **为每个知识工作者提供"个人代理控制面板"** — Dash 的设计逻辑值得借鉴:个人工作者需要一个统一的代理入口来管理多个专业代理,而不是被推入直接管理多个 AI 工具的认知负担。在你的组织中引入类似 Dash 的个人 chief-of-staff 代理,让工作者通过一个界面协调多个专业代理,是降低 AI 采用摩擦的有效路径。

4. **用垂直场景验证 AI 平台价值,而非泛泛推广** — Asana 选择用 IT ticketing(直接对标 ServiceNow)、软件开发生命周期(client 场景)、client onboarding(agency 场景)三个高价值垂直场景来展示 Work Graph + 代理的价值。对于任何想建立 AI 平台的企业,这提供了参照:与其在所有业务线泛推 AI,不如选择几个已经有成熟竞品、数据结构清晰、业务影响大的垂直场景,做出可量化的 displacement 案例。

5. **在 SaaSpocalypse 时代,平台策略需要"displace 宣言"而非"补充宣言"** — Asana 的案例表明,在 SaaS 被 AI 颠覆的时代,仅仅"做得更好"不足以生存。现有的 ITSM/项目管理工具客户不会被"更好的协作工具"打动,除非你提供的是一个他们当前工作流中缺失的核心能力,并且这个能力足够清晰地指向一个现有竞品的 displacement。如果你的 SaaS 产品定位是"AI 时代的补充",需要重新审视你的价值主张是否足够尖锐。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

