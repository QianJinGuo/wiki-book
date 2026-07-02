# Agent 安全三步法：先 Harness、再 Governance、最后 Identity（顺序反了一切白做）

## Ch04.163 Agent 安全三步法：先 Harness、再 Governance、最后 Identity（顺序反了一切白做）

> 📊 Level ⭐⭐ | 12.4KB | `entities/agent-security-three-step-sequence-harness-governance-identity-crewai.md`

# Agent 安全三步法：先 Harness、再 Governance、最后 Identity

> **核心论点**：当前 Agent 安全市场在解决**第 3 步**（identity / auth / runtime monitoring），但**正确顺序是 Harness（第 1 步）→ Governance（第 2 步）→ Identity（第 3 步）**。把 Identity 当起点是 Fortune 500 反复踩的坑——花 3 个月建 IAM，发现要 secure 的 agent 根本不能可靠运行。

> **来源**：CrewAI Blog（blog.crewai.com），发布于 2026-04-02，原文链接：[You're building agent security in the wrong order](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/youre-building-agent-security-in-the-wrong-order.md)

## 现象：所有人都在解第 3 步

2 周内 Agent 安全市场爆发：
- Runtime identity enforcement for autonomous agents
- 完整 platform：discovering shadow agents + revoking permissions in real time
- 严肃团队、扎实工程

> "I respect the work. But they're all solving step three." 

## 错位序列：Fortune 500 的典型失败

**典型剧本**（CrewAI 2 年观察 + 数 B 执行量）：

1. 团队拿到 mandate："部署 AI agents"
2. **CISO 立即问安全、董事会要合规答案**
3. 团队**从安全开始**：IAM policies、authorization scopes、runtime monitoring
4. 在 agent 周围建了完整 security stack
5. **然后**才真的去跑 agent
6. 现实：agent 找不到对的 tool、state 在 step 间漂移、多 agent 协调每次 handoff 都崩
7. 安全层完美——**被 secure 的东西本身不能工作**

**实际观察案例**：某 Fortune 500 来找 CrewAI，前团队 3 个月**只**做了 enterprise agentic IAM，compliance 文档精美，plug agent 进去发现 harness 根本不存在。

> "The security layer is solid. The thing it's securing doesn't work." 

## 正确序列：三步依次

### 第 1 步：Harness（基础）

**内容**：memory、efficient tool usage、state across steps（不漂移）、failure 时的反应（surface to human vs hallucinate）

**关键问题自检**：
- "I am optimizing for the right thing?"
- "You might find out you don't have something worth securing yet."

**CrewAI Flows 架构的设计动机**（在此场景中）：
- **确定性路由**（deterministic routing）
- **可观察执行**（observable execution）
- **escalation paths wired in before** 给工作流不同 agency 等级

> "Build the harness first, make it boring but make it reliable." 

### 第 2 步：Governance（架构而非合规 checkbox）

**前置条件**：Harness 可靠之后

**定义内容**：
- 哪些 data agent 能 touch
- 哪些 operation 需要 human sign-off
- audit trail 位置
- agent 允许做的范围

**重要纠偏**：governance **不是** compliance checkbox——**是架构**。它会 shape：
- 整体 workflow 怎么跑
- 如何 escalate
- 如何把 trust 设计进系统

### 第 3 步：Identity and Auth（zero trust / least privilege）

**前置条件**：知道 agent 做什么、能 touch 什么

**当序列对的时候**：
- Zero trust、least privilege、runtime scoping **正确落地**——因为在 known surface area 上 enforce
- **不是**猜不可预测的 agent 会尝试什么

**行业现状诊断**：
> "Some might advocate pouring money into step three while most teams haven't finished step one." 

## 为什么大家把顺序搞反了

**根因：security 是 enterprise 的 buying gate**

- 团队用 security 故事打开预算
- 厂商跟随需求
- Harness 问题**没有 deadline**——只是 staging 中的 quiet failures，最终在 production 变得很大声
- 现实：vendor 做的产品是**好产品、解真实问题**，**但**它们需要 harness 存在才能真正生效

## 给客户的建议（来自 CrewAI）

> "Build the harness first, make it boring but make it reliable, make it something you can describe to a security team in one sentence: 'here's exactly what this agent does, here's exactly where it can fail, here's exactly what happens when it fails.'" 

**判断标准**（3 个 "exactly"）：
1. 这个 agent 做什么
2. 哪里会失败
3. 失败时发生什么

**生产级 agent 团队的共同点**：顺序对了。Security step 做它该做的——有一个**真实且可理解**的东西去 secure。Governance 自然落位，surface area 已知，能定义匹配现实的 policy。

> "The difference is almost never intelligence, it's mostly sequence. Start at step one." 

## 与 wiki 现有实体的差异化

| 维度 | 本实体（CrewAI 安全序列） | 现有 agent-security-* 实体 |
|------|------------------------|--------------------------|
| **核心论点** | 安全**顺序**——harness 先于 identity | agent 安全**能力**——检测、defense、policy |
| **问题域** | Enterprise 部署路径选择 | 攻击/防御模式、攻击面分析 |
| **指导行动** | 不**先**做 IAM | 做 IAM 的时候**如何**做 |
| **来源** | CrewAI 商业实践观察 | 安全社区研究、paper、厂商方案 |
| **互补关系** | 任何 secure agent 前必读 | 本实体执行后的技术参考 |

**关键互补点**：
- `[Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](ch04/150-ai.md)` — MCP supply chain 攻击模型（**怎么攻击**）
- `[Secure Ai Agents Policy Lambda Interceptors Aws](ch04/150-ai.md)` — Policy + Lambda 实现 runtime interception（**怎么防御**）
- 本实体（**什么时候**做）— security 落地的**序列决策**问题

## 实践启示（5 条可执行项）

1. **接到 "deploy agent" mandate 时**，第一周用**一句话**回答："这个 agent 做什么 / 哪里会失败 / 失败时发生什么"——能回答才能进入第 2 步
2. **拒绝在 harness 不存在时**建完整 IAM——3 个月 IAM 而后才发现没有可 secure 的东西是真实失败模式
3. **Governance 当架构而非合规**——它会 shape workflow 怎么跑、怎么 escalate、信任怎么嵌入
4. **第 3 步 identity** 应该在**已知 surface area 上 enforce**，不是猜"不可预测 agent 会尝试什么"
5. **审计安全决策序列**——记录每一项 security 投入位于序列哪一步，避免倒序投资

## 与相关 entity 的关系

- `[Agent Development Crawl Walk Run Crewai Iterative](ch04/150-ai.md)` — 同作者上一篇（CrewAI 迭代方法论）：先做一件事、上生产、积累数据
- `[Agent Harness Engineering Survey 2026](ch03/044-agent.md)` — Harness Engineering 综述：harness 是什么、为什么重要
- `[Ai Agents Security Survey Attack Defense](ch04/150-ai.md)` — Agent 安全 attack/defense survey（不同问题域）

## 深度分析

### 1. 三步序列：安全→治理→身份的递进框架
CrewAI 的 agent 安全框架将安全防护分为三个递进层次：安全（防护攻击）→ 治理（控制行为）→ 身份（验证授权）。这一递进模型的核心洞察是：安全是基础但不够，治理是运行时约束，身份是跨系统的信任锚点。

### 2. Harness 层作为安全的第一道防线
Harness（工具系统）是 agent 安全的第一道防线——限制 agent 可调用的工具集就是限制其攻击面。这与 `Agent Harness Architecture Deep Dive Aksahy` 中"harness 决定 AI 的实际能力边界"的论点一致。

### 3. 治理框架的运行时约束
治理层解决的是"agent 在运行时应遵守什么规则"——包括工具调用审批、资源使用限制、行为边界。与 `Aws Bedrock Ops Alert` 的自动化运维治理思路互补。

### 4. 身份层解决多 agent 系统的信任问题
当多个 agent 协作时，身份验证变得关键——哪个 agent 有权访问哪个数据源？哪个 agent 可以执行高风险操作？

### 5. 与 `Xz Utils Backdoor Maintainer Trust Hijack 2 Years On` 的联系
xz 后门事件从反面验证了身份层的重要性——如果开源项目的维护者身份验证更严格（多签、多因素认证），后门植入的难度会显著增加。

## 实践启示

### 1. Agent 安全：从 harness 层开始限制攻击面
先限制 agent 可调用的工具集，再做运行时治理，最后做身份验证——这个顺序确保每层都有前一层的基础。

### 2. 治理规则：从最危险的工具开始
先对高风险工具（文件系统、网络、数据库）实施审批机制，再逐步扩展到中低风险工具。

### 3. 多 agent 系统：每个 agent 有独立身份
不要让所有 agent 共享同一身份——每个 agent 应有独立的权限集和审计日志，使异常行为可追溯到具体 agent。

### 4. 定期审计 agent 的权限膨胀
agent 的权限随时间增长（新工具、新数据源）——定期审查权限是否仍与实际需求匹配，移除不再使用的权限。

### 5. 将安全三步框架纳入 agent 开发的 Crawl-Walk-Run
Crawl 阶段验证 harness 限制，Walk 阶段引入治理规则，Run 阶段实施身份验证——与 `Agent Development Crawl Walk Run Crewai Iterative` 的渐进式开发模式对齐。

## 原文链接

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/youre-building-agent-security-in-the-wrong-order.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

