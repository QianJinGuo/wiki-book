---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/enable-safe-agentic-payments-with-built-in-guardrails-using-amazon-bedrock-agentcore-payments/
ingested: 2026-06-02
feed_name: AWS China ML
source_published: 2026-06-01T17:30:12Z
sha256: 2b297887cce987dd14568b0b8f24412c32b38489452fc9fc9578fe8805adbe48
---

# Enable safe agentic payments with built-in guardrails using Amazon Bedrock AgentCore payments

Agents increasingly take actions on behalf of their end users, whether that’s selecting tools, browsing the web, and calling MCP servers autonomously to achieve a goal. When the tools, MCP endpoints, or web resources an agent reaches are paid, the agent gets stuck without the ability to transact. [Amazon Bedrock AgentCore payments](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html>), announced in preview in partnership with Coinbase and Stripe (Privy), gives agents the ability to access paid resources on the end user’s behalf to complete the task.

Putting real money behind an autonomous system raises a new set of risks. They come from agents acting autonomously over long sessions, model non-determinism, and a wider exposure surface between agent code and the end user’s funds. In this post, we walk through those risks and the guardrails that AgentCore payments combines to address each one.

_AgentCore payments is available in preview in US East (N. Virginia), US West (Oregon), Europe (Frankfurt), and Asia Pacific (Sydney). Features and APIs might change before general availability._

Throughout this post, we use these terms:

  * _End user:_ the human whose money is being spent and on whose behalf the agent transacts.
  * _Developer_ : the AWS customer integrating payment capabilities into their AI agents.
  * _Wallet provider:_ Coinbase Developer Platform (CDP) or Stripe Privy.
  * _Embedded wallet:_ a self-custodial wallet, hosted by the wallet provider, that belongs to the end user.
  * _Payment session:_ a scoped payment context for a single agent interaction, with a configurable budget and time-to-live (TTL).
  * _Developer credentials:_ API keys, secrets, and authorization keys issued by the wallet provider to the developer, used by AgentCore payments to call the wallet provider’s APIs.



In this post, we address several key risks that surface when designing an agentic payment system, and how to address them with the capabilities of AgentCore payments.

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
