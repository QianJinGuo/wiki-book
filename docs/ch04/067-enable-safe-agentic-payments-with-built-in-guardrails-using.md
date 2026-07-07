# Enable safe agentic payments with built-in guardrails using Amazon Bedrock

## Ch04.067 Enable safe agentic payments with built-in guardrails using Amazon Bedrock

> 📊 Level ⭐⭐ | 21.0KB | `entities/amazon-bedrock-agentic-payments-guardrails.md`

# Enable safe agentic payments with built-in guardrails using Amazon Bedrock

## The challenge: Safety risks in agentic payments

Several key risks shape how a payments capability for agents has to be designed.

### Runaway spend

Agents are autonomous and long-running. They take decisions on behalf of their end users, often many decisions per session, and they keep running with no human at the keyboard. Without explicit guardrails, a mis-prompted or compromised agent can incur runaway spending.

Large language models (LLMs) are also non-deterministic, so you can’t guarantee that a model won’t misinterpret a response as authorization to spend, or repeat a payment because of an unexpected retry. Spending limits must be defined and enforced outside the model, at the infrastructure layer.

### Lack of end user consent and delegation

The agent can now make payments autonomously, but the end user must retain ultimate control. The end user decides when to delegate spending authority, when to top up the wallet, and when to withdraw funds. The agent must operate with explicit, scoped permission, not a blanket grant, and the end user can revoke that permission when they choose.

### Compromise of developer keys and wallet tokens

An agent transacting on behalf of an end user has two kinds of sensitive material. The first are developer credentials that AgentCore payments uses to call the wallet provider’s APIs (API keys, secrets, and authorization keys). The second are the end user’s embedded wallet keys (which the wallet provider holds in self-custody). Both must stay out of agent code. If those credentials are stored inline in agent code or environment variables, a compromised agent reveals them. The agent shouldn’t handle these credentials directly, and the credentials the system issues for individual payments should be short-lived and bound to a specific session.

### Exposure of the end user’s payment instrument

The end user’s card number, card verification value (CVV), and other personal payment details should never enter the agent’s context. An agent that has visibility into a credit card is a much larger exposure surface than one that doesn’t, and the Payment Card Industry (PCI) standards scope grows accordingly. The agent’s view should stop at “a permission to spend from a user-owned wallet” and go no further.

### Lack of auditability

When something goes wrong, such as an unexpected charge, a denied payment, or a security or finance team asking what happened, there must be a complete, reliable record of what the agent did, on whose behalf, against which limits, and to which merchant. That record must be produced automatically. Relying on agent code to log its own actions isn’t enough.

## Using AgentCore services and controls to address these risks

AgentCore payments integrates with the rest of Amazon Bedrock AgentCore to address these challenges.

The following figure summarizes the guardrails that AgentCore payments enforces on every transaction.

_Figure 1 – Built-in guardrails protect every agent payment. Each is enforced at the infrastructure layer, outside agent code._

### Payment limits and policy for tool access

Every transaction runs inside a payment _session_ , a scoped payment context for a single agent interaction. A payment session has two configurable caps: a maximum spend amount in a specified currency, and an expiry time. Before signing a payment, AgentCore payments checks the request against the session budget. AgentCore payments rejects requests that would push the session past its cap. If signing fails after the service has already deducted from the budget, it rolls the deduction back, so a failed transaction does not consume budget.

The check is deterministic and runs at the infrastructure layer. Prompt injection can’t lift the cap, because the cap is enforced outside the model. The developer configures the limits that match the workload, and AgentCore payments enforces them on every call. We recommend starting with a smaller budget and raising it as the agent proves itself in production.

For tool-level authorization, we recommend exposing paid endpoints through Amazon Bedrock AgentCore Gateway. Every call through AgentCore Gateway is intercepted by Policy in AgentCore, a Cedar-based engine that evaluates the request, including the agent’s identity, the tool name, and the parameters, and decides whether to allow it. The two controls cover different decisions. Policy decides who can call which paid tool and with what parameters. AgentCore payments decides how much that call can spend and for how long. Together, they give developers orthogonal levers for tool access and spend amount.

  * For a walkthrough of creating a payment session with budget and TTL configuration, see [Creating a payment session](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments-create-session.html>) in the Amazon Bedrock AgentCore developer guide.
  * For examples of Cedar policies that scope tool access by agent role and user group, see [Policy in AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>) in the developer guide.

### User control, funding, and delegation

The end user funds the wallet first, then explicitly grants the agent permission to spend, in that order. Funding is an out-of-band action. The end user completes it inside the wallet provider’s portal (Coinbase WalletHub or the Stripe Privy frontend), in a flow the agent has no API into and no visibility into. Even after funds have landed, the agent has no permission to transact until the end user explicitly delegates that authority through the wallet provider’s permission primitive: Coinbase Spend Permissions or Privy Delegated Actions. Funding the wallet and authorizing the agent are two separate decisions, made by the end user, inside the wallet provider’s portal.

The wallets themselves belong to the end user, whether a Coinbase Developer Platform (CDP) embedded wallet or a Stripe Privy embedded wallet. The end user holds the keys. AWS doesn’t, and the developer doesn’t. The end user can revoke the delegation at their discretion. And because the wallet is theirs, they can withdraw funds back to an address they control whenever they want.

### AgentCore Identity and Secrets Manager for credential storage

AgentCore Identity handles security at four layers. We walk through each in the following sections.

#### 1\. Inbound authentication with IAM or SigV4

For inbound access to AgentCore payments, developers configure AWS Identity and Access Management (IAM) or SigV4. The four-role IAM pattern that ships with the service separates the control plane (the APIs that administer and configure AgentCore payments) from the data plane (the APIs that execute transactions).

On the control plane, the _ControlPlaneRole_ administers the service, and the _ManagementRole_ configures payment managers and sessions. The _ManagementRole_ carries an explicit Deny on _ProcessPayment_ , so the credentials a developer uses to set up payments cannot also execute transactions.

On the data plane, the _ProcessPaymentRole_ executes payments, and the service itself assumes the _ResourceRetrievalRole_ to fetch session and credential state at runtime. No single role can both raise a budget and spend against it.

#### 2\. Developer credentials for calling wallet providers

When AgentCore payments calls Coinbase Developer Platform or Stripe Privy on behalf of an end user, it does so with developer credentials such as Coinbase Developer Platform API keys, Stripe Privy app credentials, and the Privy authorization key. AgentCore Identity stores these in its token vault, encrypted at rest and in transit with AWS Key Management Service (AWS KMS). The vault integrates natively with AWS Secrets Manager, so developers can manage rotation and access policy through tooling their security team already uses. Agent code does not handle these developer credentials directly.

#### 3\. End-user wallet addresses kept with the wallet provider

Separate from the developer credentials in the preceding section, each end user has an embedded wallet (a Coinbase Developer Platform wallet or a Stripe Privy wallet) with its own self-custodial wallet address. That wallet address and the keys that control it stay with the end user and the wallet provider, and neither AWS nor the developer ever holds them. AgentCore payments references the wallet by handle, not by key.

#### 4\. Just-in-time tokens for each payment

When AgentCore payments needs to execute a payment, it asks Identity for a scoped token through the _GetResourcePaymentToken_ API. The token is runtime-issued, bound to the payment session, and used for that one operation only. There are no long-lived open payment channels. The runtime denies further transactions after the session’s TTL or budget runs out, and the token used to call a wallet provider only exists for as long as the operation needs it.

### Out-of-band top-up keeps the agent away from sensitive data

When the end user funds their wallet, they enter their credit card, debit card, or bank details inside the wallet provider’s hosted onramp, either Coinbase WalletHub or the Stripe Privy frontend. These surfaces are operated and PCI-scoped by the wallet provider. The agent has no API into them and no UI access to them. Card numbers, expiry dates, CVVs, or Automated Clearing House (ACH) details do not touch agent code, the agent’s prompt context, or AWS services the developer operates.

That isolation matters because it bounds the blast radius. An agent that is compromised through prompt injection, a poisoned tool response, or a model misbehavior cannot extract a card number from a system it doesn’t have access to in the first place. The PCI burden stays with the wallet provider. The only thing the agent operates on is a scoped, revocable permission to spend stablecoin or fiat from the end user’s embedded wallet, and even that permission is bounded by the session limits in the previous section.

From a compliance perspective, this design lets developers ship agentic payment flows without bringing their own systems into PCI scope. The agent’s surface area, and the developer’s compliance scope, are deliberately small. AWS itself isn’t in the funds flow, as money moves between the end user’s embedded wallet and the merchant through the wallet provider’s infrastructure.

### End-to-end insights with AgentCore Observability

AgentCore payments integrates with AgentCore Observability to give developers visibility into the payment lifecycle. The service automatically emits vended logs to your Amazon CloudWatch log group, and vended spans to AWS X-Ray for every data-plane API call.

Every ProcessPayment invocation, whether it succeeds, hits a budget limit, or fails at the wallet layer, is recorded with enough detail to diagnose the issue without reproducing it. Developers can monitor transaction success rates, track spending patterns across agents, and surface errors as they happen.

Payment traces use the same observability infrastructure that developers already rely on for agent behavior. Payment activity appears alongside tool invocations, model calls, and orchestration steps in a single timeline. Operations teams can set CloudWatch alarms on error rates or spend velocity to catch anomalies early.

AgentCore Observability includes prebuilt dashboards that show end-to-end transaction health across agents, sessions, and time periods. Because the payment telemetry also flows into CloudWatch and X-Ray, developers can build their own. A single CloudWatch dashboard can surface total spend by agent, rejection rates by reason (budget exhausted, policy denied, credential expired), and payment latency percentiles. This gives finance, security, and compliance teams the auditability they need without building custom reporting infrastructure.

## Conclusion

With AgentCore payments:

  * The agent doesn’t have access to the end user’s funds or payment instruments.
  * IAM and SigV4 enforce authorization on every inbound call, while the four-role pattern separates the control plane (configuring payments) from the data plane (executing payments) so that no single role can both raise a budget and spend against it.
  * Per-session spending limits and TTLs are enforced at the infrastructure layer—deterministically, outside agent code—so prompt injection can’t lift them.
  * The end user retains custody of their embedded wallet, delegates spending on their own terms, and can revoke or withdraw at any time.
  * Wallet credentials live in an AWS KMS-encrypted token vault and reach the agent only as short-lived, session-scoped tokens issued just in time.
  * AgentCore Observability can emit every transaction to Amazon CloudWatch and AWS X-Ray automatically, giving security and finance teams a full audit trail.
  * Money moves between the end user’s embedded wallet and the merchant through the wallet provider’s infrastructure, not AWS.

With these guardrails in place, agentic payments become a managed capability that is bounded, auditable, and production-ready.

To learn more, visit the [Amazon Bedrock AgentCore product page](<https://aws.amazon.com/bedrock/agentcore/>) and read the [launch announcement](<https://aws.amazon.com/blogs/machine-learning/agents-that-transact-introducing-amazon-bedrock-agentcore-payments-built-with-coinbase-and-stripe/>). For a technical deep dive into agentic commerce patterns, see [Technical deep dive: AgentCore Payments and innovation in agentic commerce](<https://aws.amazon.com/blogs/machine-learning/technical-deep-dive-agentcore-payments-and-innovation-in-agentic-commerce/>).

* * *

## About the authors

### Joshua Smith

Joshua is a Senior Solutions Architect at AWS working with FinTech customers. He is passionate about solving high-scale distributed systems challenges and helping customers build secure, reliable, cost-effective, and AI-enabled solutions including agentic commerce. He has a background in security and systems engineering in early startups, large enterprises, and federal agencies.

### Guy Bachar

Guy is a Senior Solutions Architect at AWS, partnering with financial services companies to design secure, scalable cloud solutions. He specializes in AI-driven innovation, customer experience transformation, and identity and security architecture for enterprise-scale deployments.

## 深度分析

### 1. 基础设施层强制执行：比模型层更可靠的安全范式

传统 AI 安全思路倾向于在 Prompt 层或模型层植入约束，但 AgentCore payments 的核心洞察是：**LLM 的非确定性使其无法承担安全边界职责**。 spending limits、TTL、预算扣减都在 AgentCore payments 服务层以确定性逻辑执行，与模型推理路径完全正交。Prompt injection 能污染模型输入，但无法提升一个在基础设施层被硬编码的会话预算上限。这是 agentic 安全架构的一次范式转移——把可信边界从"模型是否愿意遵守"转移到"基础设施是否强制执行"。

### 2. 四层身份安全模型：纵深防御的完整实践

AgentCore Identity 呈现了一个清晰的四层安全架构：(1) IAM/SigV4 入口认证，(2) AWS KMS 加密的 Token Vault 存储开发者凭证，(3) 钱包地址与密钥彻底分离由钱包提供商保管，(4) JIT 即时令牌每支付仅用一次。每一层对应一个具体的威胁向量——第 1 层防未授权入口，第 2 层防开发者凭证泄露，第 3 层防终端用户钱包被冒用，第 4 层防令牌重放和会话持久化。这种分层设计值得任何涉及敏感操作的 agentic 系统借鉴。

### 3. PCI 合规范围极小化：架构设计而非政策声明

文章明确指出，当资金流经钱包提供商的托管 onramp（Coinbase WalletHub / Stripe Privy frontend）时，PCI 合规责任随之转移给钱包提供商。Agent 代码永远不接触卡片号、CVV 或 ACH 信息，PCI scope 因此不涉及开发者系统。这不是"我们建议您不要收集敏感数据"，而是**架构上物理隔离了敏感数据的接触面**——被 compromise 的 agent 无法从它根本没有 API 入口的系统提取卡片数据。这是一种通过架构设计达成的合规性，而非依赖流程或政策约束。

### 4. 控制平面与数据平面分离：职责分离原则在云原生支付中的落地

四-role IAM 模式的核心价值在于：**没有任何单一角色可以同时提高预算上限和从该预算中支出**。ManagementRole 持有对 ProcessPayment 的显式 Deny，这意味着配置支付的管理员身份无法执行交易。这与金融系统中的"四人原则"（four-eyes principle）异曲同工，是云原生环境下用 IAM 策略语言表达的职责分离安全模型。

### 5. 可观测性作为一等公民：支付轨迹与 Agent 行为轨迹同轨

传统支付系统通常单独建设审计日志，而 AgentCore payments 选择将支付遥测嵌入已有的 CloudWatch / X-Ray 可观测性基础设施中。这意味着运营团队不需要额外部署支付专用监控，而是用同一套工具同时观察 Agent 的工具调用、模型推理和支付交易。这种设计降低了多套系统的心智负担，也让跨领域的异常检测（如"某 Agent 的支付延迟突然增加"）成为可能。

## 实践启示

### 1. 初始预算从严，逐步放宽

文章建议"从较小的预算开始，在 agent 证明自身可靠性后逐步提高"。这同样适用于其他 agentic 安全参数：初始 TTL 宜短、初始工具权限宜窄，待积累足够的运行时行为数据后再扩大边界。这是一个与零信任架构"最小权限原则"一致的操作节奏。

### 2. 资金充值与授权委托必须保持操作上的独立性

终端用户完成钱包充值后，agent 仍然无法直接发起交易——必须经过独立的委托步骤（Coinbase Spend Permissions 或 Privy Delegated Actions）。在设计任何涉及用户资产的 agentic 流程时，应避免"充值即授权"的隐式信任链；应将所有敏感操作分解为独立的、用户主动触发的子步骤，每个子步骤可单独撤销。

### 3. 使用 Cedar Policy + AgentCore payments 实现正交访问控制

Policy in AgentCore（基于 Cedar 引擎）决定"谁可以调用哪个付费工具及参数"，AgentCore payments 决定"该调用可以花费多少和持续多久"。这两个控制机制覆盖不同维度的决策——前者是身份和权限维度的白名单，后者是金额和时间维度的上限。二者叠加给予开发者正交的调控杠杆，在设计复杂的多 Agent 协作场景时，应同时配置这两个维度而不是二选一。

### 4. 借助钱包提供商的 PCI scope 而非自建支付页面

如果业务场景允许，应优先选择嵌入式钱包方案（Coinbase CDP / Stripe Privy）而非自建支付表单。原因不仅是开发成本——而是 PCI scope 的转移：卡片受理页面由钱包提供商运营并保持 PCI 合规，开发者系统由此退出敏感数据接触面。这是在合规成本和安全架构之间的最优解。

### 5. 为支付异常建立专项 CloudWatch 告警

AgentCore Observability 暴露了所有 ProcessPayment 调用的结果（成功、预算耗尽、钱包层失败），开发者应据此配置专项监控：支付错误率突增、单个会话支出速度异常、凭证过期频率等。这些指标应向财务和安全团队同步，而不仅仅由技术团队内部消化——这是因为 agentic 支付的异常往往既是技术事件也是财务事件。

## 相关实体
- [Secure Ai Agents Policy Lambda Interceptors Aws](ch04/147-ai-agent.html)
- [Agentops Operationalize Agentic Ai Amazon Bedrock](../ch11/152-amazon-bedrock.html)
- [Break The Context Window Barrier With Amazon Bedrock Agentcore](ch04/501-amazon-bedrock-agentcore.html)
- [Building Ai Agents For Business Support Using Amazon Bedrock](ch04/072-building-ai-agents-for-business-support-using-amazon-bedrock.html)
- [Building A Secure Auth Code Flow Setup Using Agentcore Gatew](ch04/271-building-a-secure-auth-code-flow-setup-using-agentcore-gatew.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/enable-safe-agentic-payments-with-built-in-guardrails-using-.md)

---

