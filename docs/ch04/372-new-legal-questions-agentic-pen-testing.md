# New legal questions: agentic pen testing

## Ch04.372 New legal questions: agentic pen testing

> 📊 Level ⭐⭐ | 7.7KB | `entities/agentic-penetration-testing-legal-questions.md`

# New legal questions: agentic pen testing

> **来源**: bcs.org (British Computer Society)
> **作者**: Richard Hanstock FBCS (Barrister, Deeptech Legal 创始人)
> **发布日期**: 2026-06-02

## 摘要

BCS 发表深度分析文章，探讨 AI Agent 自动化渗透测试带来的四个全新法律问题：prompt injection through target、authorisation delegation、cross-engagement contamination 和 non-determinism。文章指出当前法律框架（如英国 Computer Misuse Act 1990）是为人类决策者设计的，无法直接适用于自主 Agent 的实时决策场景。行业正在通过合同条款"papering over"这些法律空白，但尚未经过司法检验。

## 核心要点

### 1. 传统渗透测试风险的 Agent 化转型

大多数 agentic pen-test 的风险与传统 pen-test 相同，但**交付方式根本不同**：

| 传统方式 | Agent 化方式 |
|----------|-------------|
| 人类测试者凭训练判断停止深入 | Agent 需要 coded rule 在漏洞验证后停止 |
| 人类感知目标负载过高时本能减速 | Agent 需要 contractual rate limits 和 automated stop conditions |
| 人类完成工作后知道自己创建了什么 | Agent 完成后需要他人从 agent 本身产生的日志重建工作 |

### 2. 四个全新法律问题

#### (1) Prompt Injection Through Target

Agent 通过摄取内容来推理，其中部分来自被测应用。如果该内容携带 adversarial instructions，Agent 的行为可被它被雇来检查的系统操纵。**人类测试者不会被阅读网页重新编程，但语言模型 Agent 可以。**

案例：CVE-2025-12420（ServiceNow，CVSS 9.3）——利用硬编码平台密钥和自动 inter-agent trust，允许未认证攻击者冒充任何用户并驱动特权 agentic workflows。Aaron Costello (AppOmni) 称之为"迄今发现的最严重 AI 驱动安全漏洞"。

#### (2) Authorisation 的法律空白

英国 Computer Misuse Act 1990 Section 1 的核心是"person causing a computer to perform a function"是否被授权——该架构为人类决策者设计。当自主 Agent 实时决定探测哪些系统、尝试哪些技术、追踪哪些 findings chain 时：
- 客户对公司的授权**是否延伸到 Agent 自主选择的行为**？
- 公司**能否将其授权委托**给其首选的 agentic testing platform？
- **无判例法**支持任何立场。商业合同开始用 express warranties 填补空白，但未经法院检验。

#### (3) Cross-Engagement Contamination

Agentic 产品通过从工作中学习来改进。针对某一客户的 findings 包含该客户特定安全态势的信息，**使用这些 findings 训练随后测试竞争对手的 Agent** 引发了 pen-test 合同从未需要回答的问题。漏洞数据能否被有意义地 anonymised 是一个技术问题，合同必须建立在诚实回答之上。

#### (4) Non-Determinism

人类测试者编写可重现的步骤，其他测试者可以跟随。语言模型 Agent 可能对同一目标产生不同推理路径。这不是严格的 liability 问题，而是 **deliverable 问题**——无法可靠重现的报告在 remediation、保险索赔或监管报告中是更弱的证据。

### 3. Agent 身份与归属问题

当客户授权一家公司，公司同时 spawn 20 个 sub-agents：**谁做了什么、代表谁、拥有什么权限？事后能否证明？**

两个维度：
- **内部归属**: 审计追踪必须事后重建哪个 agent 采取了哪个行动
- **外部冒充**: 如果 agent 认证薄弱（one-way tokens、shared secrets、static credentials），hostile actor 可冒充合法 agent 在客户认为已授权的测试掩护下进行侦察或利用

Palo Alto Unit 42 (2025-11) 披露的 **agent session smuggling** 攻击利用两个合法 agent 之间的 established cross-agent trust 作为恶意指令的隐蔽通道。OWASP Top 10 for Agentic Applications (2025-12) 将 identity 和 delegation 置于核心——前四大风险中有三个涉及 tool misuse、privilege abuse 和 supply-chain integrity。

### 4. 法律改革动向

- **Automated Vehicles Act 2024** Sections 47-49: 当自动驾驶功能启用时，人类 user-in-charge 免于 driving offences，liability 转向 authorized entity——可类比用于 autonomous security services
- **2025-12 英国政府**: 承诺在 Computer Misuse Act 中为 cybersecurity research 建立 statutory defence
- 行业正在 engagement letters 和 terms of service 中书写自己的"第一版判例法"

## 深度分析

### 1990 年法律框架 vs 2026 年技术现实

Computer Misuse Act 1990 的 "authorised person" 概念预设了一个**人类决策者**在**事先确定的授权范围**内行动。Agentic pen testing 打破了这两个假设：
- Agent 在运行时自主决定行动范围
- 授权的边界是模糊的——客户授权"测试我们的系统"，但 Agent 决定具体探测什么

这种 "authorisation gap" 不仅存在于渗透测试，而是所有 agentic AI 部署面临的根本性法律挑战。对于 [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-threat-models.md) 和 [Agent 内存架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md) 领域，这是一个必须正视的问题。

### Agent 身份的"非人类身份爆炸"

文章指出"non-human identities now vastly outnumber human ones"——这在企业环境中已经是现实。每个 agent instance 有 ephemeral identity，measured in seconds。传统的 identity management（LDAP、Active Directory）完全不适用于这种规模和粒度。

这对 [Agent 内存架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md) 提出了全新要求：需要可审计的、不可伪造的、可追溯到 human principal 的 agent identity 体系。

### 渗透测试作为 Agent 法律问题的"试验场"

渗透测试是探索 agentic AI 法律边界的理想领域，因为：
1. 涉及明确的授权边界
2. 行为具有潜在破坏性
3. 需要可审计性和可重现性
4. 已有成熟的合同和监管框架

在这里暴露的问题（authorisation、identity、liability、non-determinism）将适用于所有高风险 agentic AI 部署。

## 实践启示

1. **合同设计**: Agentic pen-test 合同必须明确覆盖 agent autonomous decision-making、prompt injection 风险、cross-engagement data 使用限制
2. **Agent 身份基础设施**: 部署具有审计追踪能力的 agent identity 系统，确保每个 action 可归属
3. **Rate Limiting 与 Stop Conditions**: 将人类测试者的隐性判断转化为 agent 的显式 coded rules
4. **Non-Determinism 管理**: 在报告中记录 agent reasoning path，增强可重现性
5. **关注法律发展**: 英国 CMA statutory defence 和 Automated Vehicles Act 的类比适用可能成为先例

## 相关实体

- [DeepMind AI Agent 安全](ch04/030-ai-agent.html) — Agent 安全的技术框架
- [CVE 实践](https://github.com/QianJinGuo/wiki/blob/main/entities/getting-cve-without-shipping-slop.md) — 安全研究的实操视角
- [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-threat-models.md) — Agent 安全概念框架
- [Agent 内存架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md) — Agent 身份管理与归属

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agentic-penetration-testing-legal-questions.md)

---

