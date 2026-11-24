# New and improved Agent governance intelligent workflows

> 📊 Level ⭐⭐⭐ | 10.7KB

> 来源：[原文存档](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-agent-governance-intelligent-workflows-and-connected-app-experiences/)

## 核心要点
- **核心挑战**：组织在扩展 AI Agent 规模时面临核心张力——如何在扩大自动化的同时不失去控制权
- **关键更新**：April 2026 Copilot Studio 更新聚焦于为管理员提供更好的可见性和治理能力，以及扩展 intelligent workflow 功能
- **Microsoft Agent 365 GA**：成为管理所有 Agent 的集中控制平面，实现了跨 Copilot Studio、Microsoft 365 和合作伙伴生态系统的统一治理

## 深度分析

原文是 release note，实质是 Microsoft 把企业 Agent 治理的几个控制平面逐个补齐。显式命名这些平面，才看得清它覆盖了什么、留下了什么。

### 三个控制平面：清单、边界、行为审计

**Plane 1 — lifecycle & inventory（谁在跑什么、归谁）.** Agent 365 GA 把分散的 Agent 收进一个集中控制平面：inventory、permissions、behavior、activity 放在同一处，从而可以 "monitor and govern agents consistently, not just where they're built"，并让 Copilot Studio 的 Agent 与 Microsoft 365、合作伙伴生态共享策略与生命周期监督。 配套改动是把 agent status 搬进 authoring experience，让 authentication gaps 在源头可见。 但原文给的是 visibility，不是 accountability——"谁为这个 Agent 的行为负责"仍未回答。

**Plane 2 — data & boundary（这个 Agent 可以碰什么）.** 载体是 Workflows Agent 新增的 centralized、admin-controlled environment：DLP 策略在环境级统一施加，规模扩大时合规是默认属性（compliant by design），而不是逐个 Agent 打补丁。 MCP server-enabled tools（preview）则被定义为 "staying within Microsoft security, permission, and compliance boundaries"。 这一层工程含量最高：清单可以事后补课，边界必须在第一次写操作之前就存在。

**Plane 3 — behavior & audit（它做了什么、何时必须停下问人）.** 投入主要在 evaluation：从 analytics 生成测试用例、通过 REST API 与 connector 自动化评估，再用 custom metrics 按业务结果（resolution rate、conversion）而非使用量衡量。 审批点落在 "involve users for review and approval within governed processes" 上。 行为平面是唯一把"质量"与"控制"接起来的平面：评估决定 Agent 能不能动，审批决定它在哪一步必须停。

**第四个平面常被忽略：成本.** 原文把管理员的需求并列写成 performance、security、cost 三项，estimator 也扩展到 Dynamics 365 agents；在按 credit 计费的平台上，成本是最硬的一种治理约束——它不需要任何人批准就自动生效。

### 写权限把治理从"合规条目"变成发布门禁

一旦 Agent 开始行动，错误答案就变成系统记录里的状态变更。apps in agents GA 说得直白——用户可 review data、update records、approve requests、create assets in place，Agent 从 informational tool 变成 operational tool。 当写入对象是合同、CRM 记录或审批状态，可逆性下降、爆炸半径上升，代价由下游系统承担而非看见答案的人。治理于是不再是上线 PPT 上的勾选项，而是与代码评审同级的发布门禁：没有清单、没有边界、没有审计轨迹，写权限就不该打开。

与本 wiki 处理 Agent 可靠性的取景一致：[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 把可靠性当作模型之外约束与验证的产物。Governance 是企业尺度的同一件事——policies、DLP 边界、approval checkpoints、evaluation gates 就是 harness，model choice（GPT-5.5 Thinking 等）是可替换组件；两者同处一篇 release note，说明模型能力是升级项、治理能力是准入门。

### 审计日志与审批门禁的工程权衡

Approval gates buy safety with latency, and that tradeoff is quantifiable. Unifi 的合同审查把处理时间从数天压到分钟，靠的是 extract、classify、validate 的确定性步骤。 人工审批铺满每个 step，等于把自动化省下的时间原样交回；更可行的做法是只把门禁放在不可逆、对外承诺或金额敏感的步骤上——这也正是"能单独测试每个 step"的真正用途。

第二项成本是 approval fatigue。没人认真看的审批队列等于橡皮图章，而橡皮图章比没有审批更危险，因为它制造了"已被审计"的假象。Analytics Viewer 只解决了可见性的一半：City of Montreal 的说法是它把 operational visibility 与 agent configuration、publishing 权限干净分开。 但只读洞察不产生对行动的责任——看指标的人和替 Agent 行为签字的人往往不是同一个。第三项成本是归属：Agent 更新一条记录时，作者是发布它的管理员、编排流程的 maker，还是触发它的用户？清单里虽有 permissions、behavior、activity，仍须把每个 Agent 绑定到具名责任人。

### 平台控制平面 vs 协议驱动治理（本节为分析，非原文主张）

以下对比属于分析，不是原文的断言。Microsoft 走 platform-driven 路线：集中控制平面管清单，环境级策略（DLP、admin-controlled environment）管边界，connector 与 Agent Store 目录管能力供给——策略可批量施加、可审计，但治理质量受平台覆盖面限制：原文自己把 "governance scales across the full system" 的前提设为 Agent 365 继续扩展 integrations。

协议驱动路线把同样三个平面拆法不同：边界由工具级 allow-list 表达，[Model Context Protocol](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 让"这个 Agent 能调用哪些工具"成为显式、可版本化的清单，而不是授权界面里点出来的一次性连接；归属由 [Agent Identity Portability](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md) 这类身份层承载，让 Agent 以可验证身份而非某人的凭证出现。风险在另一侧：没有管理员控制台可查，边界是否被遵守取决于每个实现方。现实里企业会走混合：控制平面管清单与跨平台一致性，协议层管动作面最小权限与身份归属——只把治理编码在厂商 UI 里，等于把可迁移性押在供应商路线图上。

### 成熟度差距：面板存在 ≠ 治理被强制执行

原文的动词几乎全是可见性一族：surfaces agent status、clear visibility、visibility into agent inventory, permissions, behavior, and activity、monitor and govern consistently。 可见性是必要的第一步，但面板是描述，不是约束。强制执行的形态是另一种句子：安全姿态有缺口或评估未通过的 Agent 不能发布；超出 DLP 边界的 step 连不上线。

这次更新把界线从"某处看得见"推进到"在一个控制台里看得见并统一施加策略"；但原文没有描述任何把发布权限与安全姿态或评估结果硬绑定的关卡——evaluation 自动化是能力，不是门禁。可行做法是把这份清单当成自有门禁的输入：用 eval API 与 connector 把评估接进 CI，补上 ownership 列，再度量 enforcement 覆盖率而非 dashboard 覆盖率（见 [Evaluation Harness Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)）。

## 实践启示

1. **先建清单与责任人台账，再谈规模.** 以 Agent 365 作为 inventory 系统记录，要求每个 Agent 发布前绑定具名 owner；无 owner 条目按事件处理。
2. **用角色分层拆开可见性与控制权.** 广泛授予 Analytics Viewer 这类只读角色；configuration 与 publishing 权限保持窄口径。
3. **把边界配在环境层，而不是逐个 Agent.** 自动化收进 admin-controlled environment 并在环境级统一施加 DLP；每接入一批新工具（含 preview 阶段的 MCP tools）就重跑一次边界审计。
4. **门禁只放在不可逆步骤，并度量它的代价.** 在写入记录、对外承诺、金额相关或审批类动作前设置 human review，并记录门禁引入的等待时间。
5. **把 evaluation 当作发布门禁，而不是报表.** 用 eval API 与 connector 把评估跑进 CI，用 custom metrics 把 success 定义成 resolution rate、conversion；不通过不进入生产。
6. **把成本治理当成第一道防线.** 部署前用扩展后的 agent usage estimator（含 Dynamics 365 agents）建模 credit 消耗并指定成本责任方；超预算不需要批准就会生效。
## 相关实体
> ai agent platforms topic map（已删除）

- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](https://github.com/QianJinGuo/wiki-public/blob/main/entities/www-networkworld-com-versa-takes-aim-at-fragmented-enterprise-security.md)
- [The UI is dead, long live the agent: ServiceNow goes headless and opens its platform](https://github.com/QianJinGuo/wiki-public/blob/main/entities/the-ui-is-dead-long-live-the-agent-servicenow-goes-headless-and-opens-its-platform.md)
- [The UI is dead, long live the agent: ServiceNow goes headless and opens its platform](https://github.com/QianJinGuo/wiki-public/blob/main/entities/servicenow-ui-is-dead-agent.md)
- [Agent-to-Agent (A2A) 协议标准 — Agent间通信协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/coding-agent-practice.md)
→ [原文存档](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-agent-governance-intelligent-workflows-and-connected-app-experiences/)

---

