---
source: rss
source_url: N/A
ingested: 2026-06-01
sha256: 26b759995bb49644
---



# Technical deep dive: AgentCore payments and innovation in agentic commerce

 

The industry is entering a world where billions of generative AI agents operate autonomously, acting on behalf of humans, making decisions, and completing tasks without human intervention. To support this shift, [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) provides a modular, fully managed platform that helps developers build, deploy, and operate generative AI agents at scale. By abstracting the complexities of server management, security, and integrations, AgentCore acts as the foundational infrastructure layer, relieving developers to focus on what matters most: the agent’s logic.

This agentic world is already reshaping how content, APIs, and software as a service (SaaS) providers operate. Automated traffic is increasingly surpassing human traffic on the web, and agentic AI is a fast-growing segment. Business models are rewritten so that publishers and API providers shift to pay-per-use models tailored for agent access. Publishers and content delivery networks (CDNs) are beginning to block and monetize agent traffic. APIs are shifting toward pay-per-use models tailored for agentic traffic. This rising trend points to a future where billions of agents autonomously access billions of endpoints, dynamically selecting services and transacting in real time to get the job done.

Although AI agents can accomplish complex tasks through APIs, MCPs, and web browsing, they encounter a wall when accessing paid services and content. Accessing external services requires subscribing to and managing separate billing accounts with each provider, creating significant overhead. Compounding this, most API calls and content accesses are worth only cents, yet traditional payment methods like credit cards include a fixed per-transaction fee (for example, USD $0.30), making them economically unviable for high-frequency microtransactions. Wiring together third-party wallets, payment orchestration, agentic protocol support such as [x402](https://www.x402.org/) (one of the popular machine-to-machine payment protocols), edge case handling, and end-to-end observability can take months of work. Beyond integration complexity, developers must build governance and budget guardrails from scratch to help prevent runaway spending, and meet the strict security and regulatory compliance requirements that payment flows demand.

[Amazon Bedrock AgentCore payments](https://aws.amazon.com/blogs/machine-learning/agents-that-transact-introducing-amazon-bedrock-agentcore-payments-built-with-coinbase-and-stripe/) is purpose-built to address this complexity. Now available in preview, it provides instant payments to paid external services with no manual billing setup per provider, stablecoin support for cost-effective microtransactions that make sub-cent transactions economically viable, and configurable spending guardrails that give you fine-grained control over agent budgets and transaction limits. In this post, we walk you through a technical deep dive of AgentCore payments.

## Introducing Amazon Bedrock AgentCore payments

Amazon Bedrock AgentCore payments is the first managed service within Amazon Bedrock AgentCore that helps AI agents autonomously execute microtransaction payments for paid APIs, MCPs, and content with a few lines of code. It provides stablecoin support for cost-effective microtransactions and configurable guardrails to control agent spending, reducing developer effort from months to days. Built on the security foundation of AgentCore, this fully managed service accelerates time-to-market for agentic payment workflows. The following diagram illustrates the preview capabilities of AgentCore payments and how it interacts with related AgentCore services.

![Diagram showing AgentCore Payments capabilities: payment manager, payment connector, payment instrument, payment session, and ProcessPayment API.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-1.png)

_Figure 1: AgentCore payments capabilities._

At its core, AgentCore payments offers a straightforward API that abstracts the complexity of payments processing. Agents can transact with supported merchants regardless of their payment provider, network, or underlying protocol through a single API call. AgentCore payments also provides intelligent payment orchestration, real-time budget enforcement, and end-to-end observability. The next section takes a technical deep dive into why agentic payments are uniquely challenging, and how AgentCore payments addresses each of these challenges.

## Challenges

To build a payment capability that works for agent developers, the team mapped out the key challenges and questions developers face when enabling their agent to pay for paid APIs, MCPs, and content.

### How do I fund my agent?

The first critical hurdle for a developer is figuring out how to fund the agent that powers their agent’s transactions. Because real money is at stake, this isn’t only a plumbing problem, it’s a security problem. Integrating with a third-party payment wallet is an obvious choice, but developers must verify that authentication keys aren’t compromised. They must confirm that the right access controls are in place to govern who can perform operations on the wallet, that authentication mechanisms are robust and tamper-proof, and that additional layers of security exist throughout the system to protect against unauthorized access and fraud.

For secure authentication of payment wallets, AgentCore payments uses [AgentCore Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity-overview.html). Developers create a payment connector, which is a payment provider-specific integration resource. This automatically provisions a payment credential provider in AgentCore Identity, which stores payment credentials in a secure token vault and mints tokenized access tokens without exposing raw credentials. This credential provider is specifically designed for high-performance, secure digital signatures. It supports `EdDSA`, `ECDSA`, and `ES256` for wallet operations with payment providers. The cryptographic material lives in AWS Secrets Manager and isn’t returned from APIs. Each payment connector is associated with a unique AgentCore workload identity. The workload identity is used to obtain a workload-scoped, one-time-use access token from the AgentCore credential provider system. The cryptographic binding between workload identity and user context provides multi-tenant isolation.

On the inbound side, the service enforces dual authentication, OAuth and AWS SigV4, within the same request pipeline for accessing AgentCore payments APIs, providing a flexible security layer. For OAuth invocations, the inbound bearer token is validated against AgentCore Identity, and JWT claims are extracted to derive user identity for downstream operations. For SigV4, the request signature is validated using AWS Identity and Access Management (IAM).

![Diagram showing AgentCore Payments using AgentCore Identity to securely store payment credentials in AWS Secrets Manager and issue scoped, one-time-use access tokens to agents.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-2.png)

_Figure 2: Secure credential storage for AgentCore payments and AgentCore Identity._

### Which payment protocol should I pick, and what do I need to build on top of it?

The agentic payments landscape is fragmented across numerous competing protocols, leaving developers overwhelmed and unclear on which one fits their specific use case. Ramping up on a single protocol demands significant time and effort because each comes with its own nuances (versioning, authentication flows, transaction models) that developers must understand before building anything production-ready. Beyond protocol selection, developers must also construct their own abstraction layer to handle these complexities. The effort compounds as the permutations grow: building across multiple wallet providers (each with different auth and wallet APIs), payment networks, and protocols turns what seems like a single integration into a sprawling matrix of combinations.

To address this, AgentCore payments supports payment orchestration, a core engine purpose-built to power the complexities of agentic payments. It sits between your AI agent and payment providers, exposing a single `processPayment` interface that takes a payment request and returns a payment proof that an agent can present to access paid services. AgentCore payments abstracts protocol complexity by automatically managing multi-step payment flows, retries, and edge cases across popular agentic payment protocols like x402. It handles variations across protocol versions (for example, x402 v1 and v2 differ in how payment requirements are structured and what fields are expected), transforming those into crypto-network-specific transaction data, implementing payment proof generation algorithms, and signing transactions securely through provider APIs while enforcing the spend limits you configured. The orchestrator is architected around a pluggable model where each payment protocol and provider is implemented as an independent interface. This means adding support for a new protocol doesn’t require changes to the core orchestration logic or the developer-facing API. Developers continue calling the same `processPayment` interface, and the orchestrator routes to the right connector and protocol handler based on the payment requirements.

![Diagram of the AgentCore Payments orchestration engine routing a single processPayment call to different connectors and protocol handlers based on payment requirements.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-3.png)

_Figure 3: AgentCore payments payment orchestration engine._

### How do I verify that my agent doesn’t go off the rails in spending?

Agents are autonomous by nature, which means unconstrained spending is a real possibility. Developers need mechanisms to enforce spending limits in real time, deterministically, so an agent operating on behalf of a user or business can’t exceed predefined budgets, whether at the session level or user level. Without these guardrails, a single runaway agent interaction could result in significant unintended costs.

When an agent works on a user request like booking a trip, it might initiate multiple payments in parallel (flights, hotel, car rental) drawing from the same budget simultaneously. If one operation reads the available balance before another has finished writing, the result is stale state and overspending. Under real concurrent load, this isn’t an edge case, it’s expected behavior, and getting it wrong is a fast way to break customer trust. AgentCore payments provides built-in spending limit enforcement at the infrastructure level, designed to operate at scale. A spend limit is configured as part of the payment session, a scoped, time-bounded context for agent payment activity with built-in spending limit enforcement, before a transaction is processed. From that point, every `processPayment` call goes through a three-phase transaction workflow: first, the available spending limit is reserved by deducting the requested amount atomically. Then the payment is processed through the provider. Finally, the transaction is committed on success or rolled back on failure, restoring the reserved amount to the available balance. Whether it’s a single agent or thousands transacting against the same budget simultaneously, there are no stale reads, no overwrites, and no overspending. Developers get spend control at scale without building custom concurrency or locking logic.

![Diagram of the three-phase atomic budget check used by AgentCore Payments: reserve, process, and commit or roll back.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-4.png)

_Figure 4: Three-phase protocol for atomic budget check._

### How do I audit my agent’s spending and measure success?

For an agent that is transacting autonomously, developers need full visibility into its payment behavior. This means the ability to review and audit every transaction the agent has made, trace spending back to specific sessions or tasks, and access high-level metrics on payment operations such as total spend, transaction success rates, and cost-per-task. Without robust observability, developers are unable to optimize costs, detect anomalies, or demonstrate return on investment.

AgentCore payments removes that burden. It delivers a three-pillar vended observability system (metrics, logs, and traces) published directly into your AWS account with zero instrumentation code required. Every API operation automatically emits Amazon CloudWatch metrics for success counts, failure counts, and latency, dimensioned by operation and payment resources. `processPayment` additionally emits spend amount by token type so you can track exactly what your agents are spending by each token type. Structured logs are delivered through an asynchronous, batched pipeline, each carrying the payment resource context and request ID for end-to-end correlation. Distributed traces are built on W3C trace context propagation with OpenTelemetry-compatible spans. These spans are enriched with payment-specific attributes, including spend amount, remaining budget, and credential provider telemetry that surfaces the multi-step signing chain’s performance on the top-level span. Together, this gives developers and businesses full visibility into every payment event with traceability across the entire execution stack, providing transparency and control over what their agents are doing with money.

![Diagram showing AgentCore Payments emitting metrics, logs, and distributed traces directly into the customer’s AWS account.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-5.png)

_Figure 5: AgentCore payments service-emitted observability._

## Getting started with Amazon Bedrock AgentCore payments

To get started, see the [prerequisites](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments-prerequisites.html) in the AgentCore payments documentation. You can set up and use AgentCore payments through multiple interfaces:

*   AWS SDK for Python (Boto3).
*   AWS Management Console.
*   [Amazon Bedrock AgentCore SDK](https://github.com/aws/bedrock-agentcore-sdk-python).
*   [Strands Agents](https://strandsagents.com/docs/community/plugins/agentcore-payments/) and plugin for agent-native integration with built-in x402 hooks.

The following section highlights code snippets that demonstrate how to set up and use Amazon Bedrock AgentCore payments.

### One-time configuration

Before registering with AgentCore payments, you need API credentials from your payment provider. For Stripe, retrieve your secret API key from the Stripe Dashboard under Developers → API Keys. For Coinbase, create a CDP API key from the Coinbase Developer Platform, which issues a key name and private key pair.

AgentCore payments uses these credentials to create a payment connector, a provider-specific integration that serves as the bridge between AgentCore payments and your chosen provider. The payment connector is registered under a payment manager, the top-level entity that groups your connectors and instruments together and provides a unified execution engine that manages the payment flow, from wallet provisioning through payment processing.

You provide these credentials once during this setup. AgentCore Identity then assumes responsibility for credential storage, using a secure token vault so credentials aren’t exposed at runtime. The agent itself has no access to the raw credentials. Token rotation is handled transparently by the infrastructure, while you maintain full control over the credential provider’s access permissions. Only authorized roles have access to generating one-time, short-lived tokens using AgentCore Identity. The following code performs the one-time setup in a single call [using the AgentCore SDK](https://github.com/aws/bedrock-agentcore-sdk-python/tree/main/src/bedrock_agentcore/payments).

```
from bedrock_agentcore.payments import PaymentClient

# Create PaymentClient
payment_client = PaymentClient(region_name="us-west-2")

# Create payment manager with connector and credential provider
response = payment_client.create_payment_manager_with_connector(
    payment_manager_name="myPaymentManager",
    payment_manager_description="myPaymentManager description",
    authorizer_type="AWS_IAM",
    role_arn=ROLE_ARN,
    payment_connector_config={
        "name": "myPaymentConnector",
        "description": "myPaymentConnector description",
        "payment_credential_provider_config": {
            "name": "myCoinbasePaymentCredential",
            "credential_provider_vendor": "<PROVIDER>",
            "credentials": {
                "api_key_id": API_KEY,
                "api_key_secret": API_KEY_SECRET,
                "wallet_secret": WALLET_SECRET,
            },
        },
    }
)

# Extract details from response
payment_manager_arn = response["paymentManager"]["paymentManagerArn"]
payment_connector_id = response["paymentManager"]["paymentConnectorId"]
```

### Set up the payment instrument

With the payment manager set up, you create a _payment instrument_ by referencing the payment manager and payment connector. Payment instruments are what your agent uses to transact autonomously. A payment instrument is essentially an embedded wallet, a self-custodial wallet address backed by the payment provider but managed by the end user.

After it’s created, the instrument must be funded, and signing authorization must be granted before the agent can transact. These are end-user actions that should be completed before using the payment instrument in your agent. The flow is specific to the payment provider:

*   **Coinbase** – You receive a `redirectUrl` in the payment instrument response, which points to the Coinbase-hosted WalletHub. Redirect your user there to grant signing permission and transfer funds.
*   **Stripe** – You use a provided URL template to host a front-end page where end users can take the same actions.

Both providers support three flows:

*   **Crypto-to-crypto** – Transfer from an existing crypto wallet.
*   **Fiat-to-crypto** – Transfer from a credit or debit card, or from third-party wallets like Apple Pay, through a hosted UI.
*   **Delegated signing** – The agent signs on behalf of the user using a delegated key.

```
from bedrock_agentcore.payments import PaymentManager

# Initialize manager
manager = PaymentManager(
    payment_manager_arn=payment_manager_arn,
    region_name="us-west-2"
)
instrument = manager.create_payment_instrument(
    user_id="test-user-123",
    payment_connector_id="codeverifymycoinbaseconnector-sfp0lynfjc",
    payment_instrument_type="EMBEDDED_CRYPTO_WALLET",
    payment_instrument_details={
        "embeddedCryptoWallet": {
            "network": "ETHEREUM",
            "linkedAccounts": [{
                "email": {
                    "emailAddress": "test@example.com"
                }
            }]
        }
    },
)
```

### Create a payment session

You create a payment session scoped to the funded instrument and the end user, with optional explicit payment limits and timeout. This session is the agent’s financial boundary; it defines exactly how much can be spent and for how long. The session ID and instrument ID are passed to the agent when its task begins. The agent can’t extend its session, and can’t spend beyond the session payment limits.

```
# Create a payment session
session_response = manager.create_payment_session(
    user_id="test-user-123",
    limits={
        "maxSpendAmount": {
            "value": "100.00",
            "currency": "USD"
        }
    },
    expiry_time_in_minutes=60
)
```

### Process payments autonomously

When the agent receives a user task, it might call paid endpoints for services, APIs, or content. Those paid endpoints respond with a `402 Payment Required` status to the agent. AgentCore payments understands the x402 payment protocol, including both x402 version 1 and version 2, and knows exactly how to generate the payment proof an agent needs to unlock the service.

The agent calls `ProcessPayment`, passing in the session ID, instrument ID, and the x402 payment payload. Behind the scenes, AgentCore payments orchestrates payment processing. It extracts the attributes needed to carry out cryptographic transactions, applies the payment-limits guardrails, and signs the transaction to generate a payment proof. This careful choreography helps verify that even when multiple agents are transacting at the same time against the same session, the budget is not overspent.

```
payment_response = manager.process_payment(
    user_id="user-123",
    payment_session_id=PAYMENT_SESSION_ID,
    payment_instrument_id=PAYMENT_INSTRUMENT_ID,
    payment_input={
        "cryptoX402": {
            "version": "1",
            "payload": {
                "scheme": "exact",
                "network": "base-sepolia",
                "maxAmountRequired": "5000",
                "resource": "https://premiousEndpoint",
                "description": "Premium AI joke generation",
                "mimeType": "application/json",
                "payTo": PAY_TO_ADDRESS,
                "maxTimeoutSeconds": 300,
                "asset": "0xxxxxxxxxxxxxxxxxxxxxxxx",
                "extra": {"name": "USDC", "version": "2"},
            },
        }
    }
)
```

## Use cases for AgentCore payments

With the payment stack in place, your agent can process x402 payments through a single `ProcessPayment` call. The same building blocks (third-party wallets, session-scoped budgets, and the x402 protocol) support a range of agentic workloads.

**Workload**

**What the agent does**

**How it pays**

**Research agent**

Queries multiple premium data sources within a budget to compile analysis.

Calls paid APIs over HTTP or MCP. The payment plugin handles 402 detection, signing, and retry for each source.

**Financial analysis agent**

Accesses market data, trading services, and proprietary databases behind paywalls.

Uses the same payment pattern across different merchants, all through one payment stack.

**Browser agent**

Navigates paywalled websites to extract content from many sites.

Intercepts 402 in a headless browser session, pays, and injects the proof header on retry.

**Pay-per-intelligence agent**

Routes tasks to the best-fit AI model and pays per token.

Pays the model provider on each call instead of maintaining model subscriptions.

**On-demand storage agent**

Provisions temporary storage with pay-per-use pricing.

Pays for compute and storage resources at request time, with no pre-allocated capacity.

Each workload uses the same developer-facing API. The difference is what the agent does with the content it paid for, not how it pays. The following example walks through a research agent that can pay for paid content.

### Deep dive: AI-powered research assistant

A financial analyst asks their AI agent: _“Analyze Amazon’s stock and compare it to industry benchmarks.”_

The agent needs three paid sources: a financial data API (USD $0.50 per query), a supply chain analytics vendor (USD $1.20 per report), and a benchmark database (USD $0.80 per dataset). The application backend creates a session with a USD $10.00 budget and passes the session ID and instrument ID to the agent.

![Architecture diagram of a research assistant: user query, AI agent, x402-protected merchant services, AgentCore Payments infrastructure (ProcessPayment API, payment session with budget tracker, signing layer, authentication, observability, guardrails), and payment providers Coinbase CDP and Stripe Privy.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/21/ML-21056-6.png)

_Figure 6: Research assistant architecture showing the end-to-end payment flow._

The agent calls each merchant service. Each returns HTTP 402. AgentCore payments checks the session budget atomically, signs the transaction through the configured wallet provider, and returns a cryptographic proof. The agent retries with the proof and receives the paid content. Three merchants, three payments, one API call each. Total spend is USD $2.50 out of the USD $10.00 budget, with USD $7.50 remaining. The analyst receives the full analysis without manual intervention.

The developer’s entire contribution to the payment flow is a few lines of plugin configuration. The agent’s logic is entirely about research quality: which sources to query, how to synthesize findings, and when to stop.

**Works with any framework and any model.** This flow is the same regardless of how you build the agent. With Strands Agents, the built-in `AgentCorePaymentsPlugin` handles payment processing automatically. For other frameworks, `ProcessPayment` is a standard REST call. The same applies to model selection. Whether the agent reasons with Anthropic Claude, OpenAI GPT, Google Gemini, or Meta Llama, the payment flow is identical.

**Composes with the rest of Amazon Bedrock AgentCore.** Because payments operate at the tool-call layer, they work naturally with other AgentCore services. Start with the preceding research agent example, then layer on the following:

*   **AgentCore Gateway** – Discover paid MCP tools on Coinbase x402 Bazaar without per-provider registration. A single payment stack provides access to over 10,000 endpoints.
*   **AgentCore Memory** – Store research results across sessions. If the agent already purchased the supply chain report yesterday, memory retrieves the result.
*   **AgentCore Tools** – Use managed tools such as Browser and Code Interpreter within the same workflow. The Browser tool navigates paywalled websites and pays for content inline. The Code Interpreter processes the paid data: running analysis, generating charts, and transforming datasets. The `ProcessPayment` API is the same regardless of which tool triggers the payment.
*   **AgentCore Runtime** – Deploy the agent using `agentcore deploy`. The `ProcessPaymentRole` is enforced at the infrastructure level.

Adding more AgentCore features requires no changes to the payment configuration. With the payment infrastructure managed, you can focus on improving the agent itself: adding new data sources, refining synthesis logic, and expanding to new domains. The AgentCore services listed here are not exhaustive. As the service grows, the same payment primitives extend to new capabilities.

## Clean up

Clean up the resources after use, and see [AgentCore pricing](https://aws.amazon.com/bedrock/agentcore/pricing/) for more details on cost.

## Conclusion

In this post, we walked through how AgentCore payments handles the payment infrastructure so you can invest your time where it matters: building agents that can transact at scale. The same payment stack that powers a single research assistant scales to a multi-agent system deployed on AgentCore with per-agent budgets, multi-provider wallets, and full observability.

To start experimenting, the [AgentCore payments samples repository](https://github.com/awslabs/agentcore-samples/tree/main/06-workshops/13-AgentCore-payments/00-getting-started) walks you through the full developer journey. The samples also include end-to-end use-case patterns such as agents paying for data, paying for APIs, and paying for content as a starting point for your own agentic payment workflows.

Get started with these resources:

*   [AgentCore payments documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html)
*   [AgentCore payments FSI Symposium Keynote](https://www.youtube.com/watch?v=uQpTC2PcWbI&t=3421s)
*   [AgentCore payments samples: tutorials and end-to-end use-case patterns](https://github.com/awslabs/agentcore-samples/tree/main/06-workshops/13-AgentCore-payments)
*   [Amazon Bedrock AgentCore documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html), to explore Gateway, Memory, Tools, and Runtime and extend your agent’s capabilities.

[AgentCore payments](https://aws.amazon.com/blogs/machine-learning/agents-that-transact-introducing-amazon-bedrock-agentcore-payments-built-with-coinbase-and-stripe/) is available in preview. Start building agents that can transact.

* * *

## About the authors
