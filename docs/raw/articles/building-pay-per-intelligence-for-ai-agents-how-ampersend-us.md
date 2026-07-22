---
source_url: "https://aws.amazon.com/blogs/machine-learning/building-pay-per-intelligence-for-ai-agents-how-ampersend-uses-amazon-bedrock-agentcore-payments/"
ingested: 2026-06-26
sha256: 9d8bbd5ec152c284
---

# Building pay-per-intelligence for AI agents: How Ampersend uses Amazon Bedrock AgentCore Payments

_This post was co-written with Kevin Jones from Ampersend (Edge & Node) and Chethan Shriyan from the Amazon Bedrock AgentCore Payments team._

Ampersend and Amazon Bedrock AgentCore Payments are addressing one of the hardest problems in agentic AI. How do autonomous agents pay for services without developers building bespoke billing integrations, credential management, and payment orchestration from scratch? As more services shift to pay-per-use models built for machine consumption, agents need a way to transact programmatically, instantly, and within governed limits using agentic payment protocols like x402.

In this post, you will learn how [Ampersend](<https://ampersend.ai>) built a pay-per-intelligence routing layer on top of [Amazon Bedrock AgentCore Payments](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>). AI agents autonomously route tasks to the most effective model, pay per request, and operate within spending budgets. You will also see how the two-hop payment pattern works end-to-end and how to get started with your own implementation.

## About Ampersend

[Ampersend](<https://ampersend.ai>) (by [Edge & Node](<https://edgeandnode.com>)) is a management platform for agent payments and operations. Ampersend sits between agents and a marketplace of model providers. Their service handles payment routing, settlement, and operations. Agent builders get access to models through a single integration, with no per-provider subscriptions, no contract overhead, and no billing relationships that scale linearly with the number of providers.

Ampersend’s thesis is straightforward: agents should pay for intelligence the same way they already call APIs, programmatically, instantly, and without human intervention.

Ampersend allows AI agents to autonomously pay for intelligence services across multiple model providers through a single integration point, powered by the [x402 open protocol](<https://www.x402.org/>) and Amazon Bedrock AgentCore Payments.

## The challenge: Payment infrastructure for autonomous agents

Agent builders and service providers face complementary sides of the same infrastructure gap.

**For agent builders:** Your agent needs to call a paid large language model (LLM), a paid data API, or a paid content endpoint. You’d need to build wallet management, handle payment signing, implement agentic payment protocols like x402, manage spending limits, and integrate with each provider’s billing. That’s months of infrastructure work before you ship agent logic.

**For applications like Ampersend:** You want to offer agents access to multiple model providers through a single payment channel. But to do that, you need the underlying payment infrastructure to be secure, auditable, and governed, without building wallet custody and spending controls yourself.

AgentCore Payments solves both sides of this. It provides the managed payment infrastructure that agent systems need, and it gives individual agents the ability to transact autonomously within governed limits.

## How Ampersend built a pay-per-intelligence routing layer using AgentCore Payments

Ampersend built a pay-per-intelligence routing layer on top of AgentCore Payments. Here’s the use case:

An agent has a task: summarize a research paper, review a smart contract, analyze on-chain data. The agent calls Ampersend, which publishes a catalog of models organized by capability tier. The agent picks the tier that matches the task complexity, pays per request through AgentCore Payments, and gets the result back. Behind the scenes, Ampersend settles with the upstream model provider using the [Ampersend SDK](<https://ampersend.ai>).

**This creates a two-hop payment routing pattern:**

_Figure 1: Two-hop payment routing — Agent → Ampersend → Model Provider_

### How the two-hop payment flow works

The preceding diagram illustrates the end-to-end payment architecture. Here’s how the key AgentCore Payments components work together in this flow:

**1\. Payment Manager** – The application backend creates a Payment Manager that defines wallet connections and spending policies. This is the governance layer that controls how the agent can spend.

**2\. Payment Session** – Before the agent starts, the backend opens a Payment Session with a budget cap (for example, $0.05). The agent can only transact within this session’s limits.

**3\. ProcessPayment API** – When Ampersend returns an HTTP 402 (payment required), the agent calls ProcessPayment with the x402 payment details. AgentCore signs the USDC authorization using the connected wallet’s credentials, without the agent ever touching private keys.

**4\. Credential Provider (Coinbase CDP)** – AgentCore connects to Coinbase Developer Platform as the wallet credential provider. Coinbase Developer Platform manages the wallet custody and signing infrastructure. The agent assumes a scoped AWS Identity and Access Management (IAM) role (ProcessPaymentRole) that can only call ProcessPayment. The role can’t modify budgets or access wallet keys directly.

**5\. Settlement** – After it’s signed, the payment proof is returned to the agent. The agent retries the original request to Ampersend with the proof attached. Ampersend verifies settlement on-chain (Base network, USDC), then auto-pays the upstream model provider (for example, BlockRun) using the Ampersend SDK. Two settlements occur: Agent to Ampersend, and Ampersend to Model Provider.

From the agent’s point of view, it made one paid request. It doesn’t know or care which provider Ampersend routed to. Ampersend handles provider selection, the second payment, and delivery, all transparently.

## How AgentCore Payments manages the payment lifecycle

[AgentCore Payments](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>) handles the full payment lifecycle so that neither Ampersend nor the agent builder had to build it:

**Managed wallets** – AgentCore connects to [Coinbase CDP](<https://www.coinbase.com/developer-platform>) or [Stripe Privy](<https://www.privy.io/>) wallets as payment connections. No wallet custody infrastructure to build, no key management to maintain. Ampersend connected their credentials once and had funded wallets ready to transact.

**Spending governance** – Session-level budgets are enforced at the infrastructure layer. The application backend sets limits, and the agent transacts within them. If the budget is exhausted, the next payment is rejected cleanly. Agents operate autonomously but within deterministic boundaries they cannot override.

**Native x402 protocol** – When an agent encounters a paid endpoint (HTTP 402), AgentCore handles the [x402](<https://www.x402.org/>) protocol negotiation, wallet authentication, stablecoin payment, and proof delivery without interrupting the agent’s reasoning loop. Both v1 and v2 of the protocol are supported.

**Observability** – Every transaction flows through the same logs, metrics, and traces developers already use in AgentCore. No separate payment monitoring to build.

## What the combination of Ampersend and AgentCore Payments unlocks

Neither system alone addresses the full stack of agentic commerce. Together, they cover routing, settlement, governance, and observability end-to-end.

**Ampersend brings:** intelligent model routing, a provider marketplace, the two-hop settlement pattern that abstracts away provider complexity, and operational tooling for managing agent payment workflows at scale.

**AgentCore Payments brings:** managed wallet infrastructure, deterministic spending governance, native x402 signing and settlement, and the security model that gives autonomous agents the ability to transact without exposing credentials or overriding budgets.

Together, they demonstrate what agentic commerce looks like in practice: an agent that discovers, evaluates, selects, and pays for intelligence services, all within a governed, observable, and auditable framework.

## Results

Ampersend completed the full integration in under two weeks, from initial API calls to end-to-end payment settlement on Base network. Without AgentCore Payments, the team estimated the wallet custody, signing infrastructure, and spending controls alone would have required 3–4 months of engineering effort.

Kevin Jones, who led the integration:

> _“Building multi-agent systems is genuinely complex, and we expected payment infrastructure to be the hardest part of the entire project. AWS AgentCore Payments completely changed that. The integration across a buyer agent with AgentCore, a seller agent with Ampersend, and BlockRun AI for pay-as-you-go LLM inference came together far more smoothly than we anticipated. We wired up the logic and it just worked.”_

Rodrigo Coelho, CEO of Edge & Node:

> _“We built ampersend to be the control layer for agent payments. AgentCore Payments was a natural fit — managed wallets, spending guardrails and x402 settlement let us demonstrate fully autonomous agent-to-agent micropayments in a matter of days.”_

## Conclusion

Ampersend’s integration with AgentCore Payments shows what becomes possible when agent platforms can offload wallet custody, x402 protocol handling, and spending governance to managed infrastructure. Agent builders gain a single payment surface for paid intelligence, and platforms like Ampersend can focus on routing and marketplace logic instead of payment plumbing. The result is autonomous agent-to-agent commerce that is governed, observable, and auditable by default.

## Getting started

Ready to build pay-per-use agent workflows? Here’s how to get started:

**1\. Set up AgentCore Payments** – Follow the [AgentCore CLI quickstart](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html>) to create a Payment Manager, connect a wallet provider, and configure your first payment session with spending limits.

**2\. Integrate with Ampersend** – Visit [ampersend.ai](<https://ampersend.ai>) to explore the model catalog and integrate your agent with Ampersend’s payment routing API.

**3\. Try the tutorials** – Walk through the hands-on [AgentCore Payments workshop and samples](<https://github.com/awslabs/agentcore-samples/tree/main/06-workshops/13-AgentCore-payments>) on GitHub to see working buyer/seller implementations.

To learn more:

> • [Amazon Bedrock AgentCore Payments documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>)
> 
> • [Agents that transact: Amazon Bedrock AgentCore now includes Payments (preview)](<https://aws.amazon.com/about-aws/whats-new/2026/04/amazon-bedrock-agentcore-payments-preview>) – launch announcement
> 
> • [AgentCore Payments samples and workshops on GitHub](<https://github.com/awslabs/agentcore-samples/tree/main/06-workshops/13-AgentCore-payments>)
> 
> • [x402 protocol](<https://www.x402.org/>)
> 
> • [Ampersend](<https://ampersend.ai>)

* * *

## About the authors

### Guy Bachar

Guy is a Senior Solutions Architect at AWS, working with fintech and capital markets firms on agentic AI, autonomous commerce, and cloud transformation. He focuses on building systems where AI agents act on behalf of customers across payments, customer experience, and governance.

### Chethan Shriyan

Chethan is a Principal Product Manager, Technical at AWS, based in Seattle, WA. He brings nearly 13 years of experience in product and business management, including over 7 years at Amazon. He is passionate about building and delivering technology products that create meaningful impact in customers’ lives.

### Kevin Jones

Kevin is a Developer Relations Engineer at Edge & Node, specializing in blockchain technology and decentralized applications (dapps). With over 15 years of experience in deploying production applications, he is passionate about fostering innovation and education in the blockchain space, particularly in dapp development and the promotion of public goods education. Through these engagements, Kevin has significantly contributed to the education and empowerment of developers in the Web3 ecosystem.
