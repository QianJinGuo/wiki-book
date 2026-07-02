# You're building agent security in the wrong order

## Ch04.327 You're building agent security in the wrong order

> 📊 Level ⭐⭐ | 8.0KB | `entities/youre-building-agent-security-in-the-wrong-order.md`

# You're building agent security in the wrong order

CrewAI 创始人提出的 Agent 安全建设顺序论：企业普遍先建安全层（IAM/授权/监控），再补 Harness（记忆/工具/状态管理），顺序反了。正确顺序是 Harness → Governance → Identity & Auth。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/youre-building-agent-security-in-the-wrong-order.md)

## 摘要

这篇文章直击 Agent 安全建设中的核心矛盾：**安全是企业的预算入口（buying gate），但安全层所保护的东西——Agent 本身——还没有可靠运行。** 财富 500 强公司花了三个月实施完整的企业级 Agent IAM，拥有"漂亮的合规文档"，但接入 Agent 后发现 Harness 不存在。这不是能力问题，而是排序问题。

## 核心要点

### 三步正确顺序

1. **Harness（先建）**：记忆、高效工具使用、跨步骤状态不漂移。出错时 Agent 是上报人类还是幻觉绕过？——先确保你有一个"值得保护的东西"。
2. **Governance（再建）**：Harness 可靠后，定义 Agent 能做什么、能碰什么数据、哪些操作需要人类签字、审计日志在哪。这不是合规复选框，而是架构决策——它会塑造工作流、升级路径和信任设计。
3. **Identity & Auth（最后）**：此时你知道 Agent 做什么、允许碰什么。零信任、最小权限、运行时范围限定——所有安全规则都落在已知的攻击面上，而非猜测一个不可预测的 Agent 可能尝试什么。

### 顺序错位的根本原因

- **安全是企业购买入口**：团队用安全故事解锁预算，厂商跟随需求。
- **Harness 问题没有截止日期**：它只在 staging 环境中造成安静失败，最终在生产环境中变得非常响亮——但那时已经晚了。
- **厂商不是在犯错**：Agent 治理是真实需求，身份工作是必要的。产品解决的是真实问题。但它们无法在 Harness 缺位时发挥作用。

### CrewAI Flows 的 Harness 实践

CrewAI 的 Flows 架构通过确定性路由、可观测执行和升级路径来解决 Harness 问题。关键设计：在赋予工作流不同层级的自主性之前，先把升级路径接好。不是出于偏执，而是因为看到了跳过这步的后果。

## 深度分析

### 1. "值得安全保护的东西"——Agent 安全的本体论前提

这篇文章提出的核心问题是本体论级别的：在讨论"如何保护 Agent"之前，先问"Agent 是否是一个稳定的、可描述的、行为可预测的系统"。如果 Agent 的工具选择随机漂移、状态跨步骤丢失、错误时幻觉绕过而非上报，那么在这个不稳定的系统上叠加 IAM 和审计，等于给流沙地基装防盗门——门本身没问题，但门框随时会塌。

### 2. Harness Engineering 是 Agent 安全的前置依赖

这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 框架的核心理念完全一致：**Harness 不是安全的替代品，而是安全的必要前提。** 文章中的"Make it boring but make it reliable"——让 Agent 的行为可预测到"无聊"的程度——正是 Harness 的定义。一个可靠的 Harness 让安全团队能用一句话描述："这是 Agent 做的事、这是它可能失败的地方、这是失败时会发生什么。" 这句话是所有安全策略的语义基础。

### 3. 预算驱动 vs 问题驱动的建设顺序错位

企业用安全故事解锁预算（预算驱动），但 Agent 的实际问题是运行可靠性（问题驱动）。这两个驱动力方向相反。文章指出 Harness 问题"没有截止日期"——这是关键洞察。安全合规有审计日期、有合规窗口，所以自然获得优先级；Harness 的失败在 staging 中安静，直到生产环境才爆发，所以总是被推迟。这解释了为什么几乎所有企业都犯了相同的顺序错误。

### 4. Governance 作为架构而非合规

文章最被低估的洞察是："Don't think of this step as a compliance checkbox, but architecture instead." Governance 的本质不是"检查 Agent 是否合规"，而是"设计 Agent 的行为边界"。当 Governance 被视为架构时，它会塑造工作流的升级路径、错误处理和人类监督点——这些恰恰是 Harness 的核心组件。这意味着 Step 2（Governance）实际上是对 Step 1（Harness）的形式化和制度化。

### 5. "已知攻击面"是 Identity & Auth 的生效条件

第三步（Identity & Auth）在 Harness + Governance 之后的根本原因：零信任和最小权限需要已知的攻击面。在 Harness 缺位时，Agent 的行为不可预测，定义"最小权限"等于猜测；在 Governance 到位后，Agent 的行为边界已确定，权限规则可以精确匹配现实。文章用一句精炼的话总结："You're not guessing at what an unpredictable agent might try."

## 实践启示

1. **先让 Agent 可靠运行，再谈安全**：如果一个 Agent 在 staging 环境中都无法稳定完成三个连续步骤，给它配 IAM 策略是在浪费时间。先通过确定性路由、可观测执行和升级路径建立 Harness。
2. **用一句话测试 Harness 成熟度**：能否对安全团队说"这是 Agent 做的事、这是它可能失败的地方、这是失败时会发生什么"？如果说不出来，Harness 还没到位，不要进入 Governance 阶段。
3. **在安全预算中分出 Harness 建设**：不要把所有预算投到 IAM 和审计上。安全预算的 40% 应该用于 Harness 建设（状态管理、工具可靠性、错误升级路径），这不是安全让步，而是安全的基础设施投资。
4. **Governance 文档应描述 Agent 行为边界而非合规检查项**：每条 Governance 规则都应该对应一个具体的 Agent 行为模式，而不是一个抽象的合规要求。
5. **生产环境中的"安静失败"是最危险的信号**：如果 Agent 在 staging 中偶尔产生不一致结果但没触发告警，这就是 Harness 缺失的明确信号。不要等它在生产中变得"非常响亮"才行动。

### 相关实体

- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/150-ai.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](ch04/150-ai.md)
- [Tencentdb Agent Memory Context Offloading](ch03/044-agent.md)
- [how developers can build agentic agreement workflows on docu](ch04/272-how-developers-can-build-agentic-agreement-workflows-on-docu.md)

---

