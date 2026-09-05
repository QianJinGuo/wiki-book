---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/pay-with-confidence-how-solv-labs-built-verifiable-auditable-agent-payments-on-amazon-bedrock-agentcore-payments
ingested: 2026-08-12
feed_name: AWS China ML
source_published: 2026-08-12
sha256: 6bd74e2a24039daaac774dcd137bd8d931ccdfbb6ec4c7da34b97289f7cd35c6
---


# Pay with confidence: How Solv Labs built verifiable, auditable agent payments on Amazon Bedrock AgentCore payments

_This post is co-written with Patrick Duffy from Solv Labs and Houman Shadab from ICME Labs_

Solv Labs built an AI agent-payments workflow using Amazon Bedrock AgentCore payments, a capability of Amazon Bedrock AgentCore, governed by two layers: ORACLE (Solv’s policy engine) and ICME PreFlight for compliance verification. AgentCore payments provides the payment processing infrastructure. ORACLE enforces authorization policies before each transaction. ICME’s verification layer extends AWS Automated Reasoning Checks to make them privacy-preserving, portable, and independently verifiable, with each decision checkable.

As a result, every agent payment runs through three core governance components: ORACLE for pre-authorization decisions, an integrity service running in an AWS Nitro Enclave, and a risk engine for per-transaction pricing. Each transaction completes in under four seconds, covering pre-authorization, governance, and on-chain settlement through Coinbase. Every transaction produces a full audit trail, and that’s well within latency budgets for agentic workloads.

The first time an autonomous agent moves real money on behalf of an enterprise, the question is no longer “Did it work?” It is “Can we prove what just happened?” In a single quarter, four pieces of infrastructure that make that question answerable arrived together: Amazon Bedrock AgentCore payments, AWS Automated Reasoning Checks, AWS Nitro Enclaves used as a per-transaction attester, and the x402 payment standard for agent payments to services.

Amazon introduced Amazon Bedrock AgentCore payments in May 2026, built in partnership with Coinbase and Stripe. It lets AI agents instantly access and pay for what they use, including web content, APIs, MCP servers, and other agents. Spending is governed by the same controls developers already use to operate their agents.

In this post, Solv Labs and policy-verification partner ICME walk through how we built an agent-payments workflow on AgentCore payments where every transaction is governed at execution time, attested inside an AWS Nitro Enclave, risk-priced individually, and fully auditable. We also cover what this pattern unlocks for enterprises running agents in regulated environments.

## The enterprise challenge

When an autonomous system moves money, the operator must prove to auditors, counterparties, and legal that each payment was authorized, priced for the risk it carried, and recorded in a way that holds up to scrutiny. A misconfigured or manipulated agent doesn’t only return a bad answer. It moves money. And the hard part isn’t executing the payment. It’s proving, afterward, that the payment was permitted in the first place.

Enterprise teams consistently struggle with the same gap: when an agent transaction completes, there’s no durable record tying that specific action to the policy that authorized it, the constraints it satisfied, or the risk it carried. Model cards, SOC 2 reports, and after-the-fact reviews describe the _organization_ around the system. They don’t describe the _execution_ of individual decisions. Without that transaction-level binding, operators have no clean way to resolve a dispute, satisfy an auditor, or tell a routine agent action apart from a compromised one.

Solv Labs needed every agent action to be verifiable, risk-priced, and auditable on demand, without slowing agents down or bolting on infrastructure outside the system they already run on.

## Vision

The vision is straightforward: govern every agent payment at execution time and produce a record that various parties (auditors, counterparties, regulators) can verify independently without depending on the operator’s word for it.

This became practical only recently, with AgentCore payments as the payment orchestration layer, Automated Reasoning Checks (ARc) for formal policy evaluation, Nitro Enclaves for hardware attestation, and x402 reaching broad adoption for agent payments. Together, they made governed agent payments an implementation choice rather than a research program.

## Architecture

The workflow runs as a set of specialized components: AgentCore payments in a Solv-operated environment, the ORACLE engine with its Nitro Enclave attester, and policy checks from ICME as an external service. Components only cross trust boundaries through signed, hash-bound artifacts, so the evidence flow holds regardless of how the services are deployed. The workflow attaches to an agent built on Amazon Bedrock AgentCore and is compatible with agents running on AgentCore runtime or custom AgentCore implementations.

  
Figure 1: System architecture. Every agent payment passes through pre-authorization, constraint verification, integrity attestation, and risk pricing before settlement, all native to AgentCore

Every payment runs through five specialized components, each addressing a distinct part of the governance problem.

  * **ORACLE – pre-authorization.** ORACLE evaluates the proposed action against the applicable policy and returns an ALLOW or REVIEW determination before values move, so a policy failure doesn’t produce a settled transaction the operator has to unwind.
  * **PreFlight – independently verifiable policy checks.** ICME’s PreFlight provides the policy check underlying ORACLE’s decision. It produces a small, privacy-preserving proof of that check that a third party can verify without access to the policy or the transaction parameters.
  * **AWS Nitro Enclave – integrity attestation.** An integrity service running in a Nitro Enclave signs the execution record inside a hardware-isolated environment. The attestation document, produced by the Nitro Security Module, binds the signing key to the specific enclave image measurements (PCR0, with PCR1 and PCR2 also included). As a result, a verifier can confirm not just that the record was signed inside an enclave, but inside the specific enclave image Solv Labs has published. Each action is therefore cryptographically attested and bound to the enclave that produced it, so the record can’t be silently rewritten after the fact.
  * **Risk engine – per-transaction pricing.** The risk engine attaches a risk multiplier to each transaction, computed deterministically from the assessed violation signal, so the governance record carries a risk price rather than a flat pass. The multiplier informs downstream review prioritization and, where applicable, pricing of risk transferred to a third party.
  * **Payment processing and settlement.** AgentCore payments processes each payment while enforcing per-session spending limits, keeping the transaction within the budget the end user has authorized. Settlement then completes with on-chain routing through Coinbase.



These components run in a fixed order: ORACLE’s decision, its independently verifiable proof, the hardware attestation, and the per-transaction risk price are all produced before settlement is initiated. The gate is absolute: no decision, no settlement.

  
Figure 2: Transaction sequence. Steps 1–3 produce the governance record before settlement is initiated, and the gate enforces “no decision, no settlement.” End-to-end latency is under four seconds per transaction, with governance overhead under one second

## What the governance layer attests

Each governed payment produces a single signed evidence record binding five things: the policy that was evaluated, the policy-check result and its independently verifiable proof, the hardware-attested execution record, the per-transaction risk price, and the settlement artifacts from AgentCore payments.

It doesn’t attest that the agent’s underlying decision was wise, that the counterparty is solvent, or that the policy itself is correct. Those remain the operator’s responsibility, as for other payments. What it _does_ attest, in a way parties can verify, is that this specific payment was evaluated against this specific policy under these specific constraints at this specific risk price, and that the result of that evaluation is what authorized settlement.

  
Figure 3: Per-transaction evidence record containing execution and policy hashes, constraint result, zero-knowledge proof reference, hardware attestation digests, risk multiplier, and on-chain anchor. Hashes and identifiers are illustrative placeholders. The full record is canonicalized, Ed25519-signed inside the Nitro Enclave, and anchored on-chain

## How AgentCore payments closes the governance gap

Three properties of the service make the workflow operationally clean:

  * **Native to the agent system.** Running inside the same AgentCore environment as the agent, the governance workflow inherits the agent’s identity, gateway, and observability surfaces. Operators don’t run two parallel control planes, which is the configuration where most governance gaps appear in practice.
  * **Infrastructure-level spending limits.** AgentCore payments enforces per-session spending limits independently of anything the agent or policy engine decides. Defense in depth is built in, not assembled.
  * **A single observability surface.** Every decision, attestation, risk price, and settlement is visible through standard AgentCore Observability, a capability of Amazon Bedrock AgentCore, on Amazon CloudWatch logs, metrics, and traces, alongside everything else the agent does.



## Customer perspective: Solv Labs

> _“Before we built this workflow, the thing we couldn’t give an enterprise was a clean answer to why a specific payment was permitted — only assertions about the organization that authorized it. AgentCore payments let us move that answer to the transaction itself: every payment now carries the policy it cleared, the enclave that signed it, and the proof a third party can check. The evidence travels with the transaction.”_

— Patrick Duffy, CEO, Solv Labs

## Customer perspective: ICME

> _“When the verifier of a payment decision isn’t the operator who made it, you need a way to prove the check ran correctly without exposing the policy itself. That’s what ICME adds to AWS Automated Reasoning Checks: every decision comes with a cryptographic proof a counterparty or regulator can verify in under a second without seeing the policy detail or the transaction parameters.”_

— Houman Shadab, Co-Founder, ICME Labs

## Results

The workflow produces a per-transaction, hardware-attested, independently verifiable governance record before settlement of a payment transaction by an agent. Enterprises adopting this pattern on Amazon Bedrock AgentCore payments get the following, per payment transaction, at machine speed:

  * **Verifiable execution on transactions:** Each agent action is cryptographically signed and independently verifiable against a public anchor on the Base networks. Governed payments processed across both decision paths, ALLOW and REVIEW, and both carry the same evidence guarantee. The DENY path, fully implemented and unit-tested in the ORACLE engine, produces a signed refusal record when configured constraints are violated.
  * **Risk pricing:**  Each transaction carries a deterministically computed risk multiplier, so the governance record prices the risk it carried rather than treating every payment as identical. The risk multipliers reflect the engine’s operating point, with outcome calibration accruing as observed executions accumulate.
  * **Independent auditability:**  Each governing decision is anchored on a public blockchain, designed for third-party verification using reference verifier tooling from Solv Labs and ICME, without exposing the policy detail, transaction parameters, or private keys.
  * **Governance at machine speed:**  Transactions complete in under four seconds, covering pre-authorization, governance, payment processing, and on-chain settlement through Coinbase. Governance-call latency holds within the latency budget of the overall transaction.
  * **A single, observable surface:**  Each decision, attestation, and risk price is visible through the same AgentCore Observability on Amazon CloudWatch logs, metrics, and traces operators use for the rest of agent behavior. The record is structured for the people who consume it: Risk and Compliance, Internal Audit, and external auditors and counterparties, each able to verify.



  
Figure 4: The per-transaction evidence stack. All four artifacts are produced before settlement fires and recorded together, and auditors, counterparties, and regulators can verify each element independently without access to the operator’s policy detail, transaction parameters, or private keys

## What this unlocks for enterprises

  * **A clean audit trail per transaction** , produced at the moment of execution rather than reconstructed afterward: what was authorized, under which policy, against which constraints, at what risk price, signed by which enclave, and anchored where.
  * **Evidence that survives a dispute.** When a counterparty, auditor, or regulator asks why a payment was permitted, the answer is a verifiable artifact, not an organizational assertion. This matters most in regulated environments, where evidence-retention obligations attach to each transaction.
  * **Governance at agent speed.** Sub-second governance overhead means enterprises get both control and the throughput agentic workloads require.
  * **Review effort that scales with exceptions, not volume.** Because every transaction carries its own evidence and clears a policy gate before settlement, review shifts from sampling every Nth transaction to investigating the exceptions the evidence itself flags. Oversight work grows with the exception rate, not the transaction rate.
  * **A control cost that fits the budget line you already own.** Running on AgentCore’s native surfaces, there is no parallel control plane to license, integrate, or staff. The marginal cost of governing one more payment is dominated by the AgentCore call itself, with proof and anchoring as marginal cost on top of a line enterprises already pay, not a new line item.
  * **A foundation for the workloads ahead.** The same per-transaction evidence model scales to the volume and diversity of payment actions agentic workloads will generate in production.



## Conclusion

Using Amazon Bedrock AgentCore payments together with ORACLE, PreFlight and an AWS Nitro Enclave attester, Solv Labs built a governed agent-payments workflow in which every transaction is evaluated against policy, attested in hardware, priced for risk, and anchored to a public blockchain, all before settlement fires. For enterprises, that means review effort that scales with exceptions rather than volume, a control cost that fits a budget line they already own, and an audit trail their Risk, Compliance, and Audit functions can each verify without access to the operator’s policy detail, transaction parameters, or private keys. That is what it takes to deploy agent payments in regulated environments without trading speed for control.

To learn more about Amazon Bedrock [AgentCore payments](<https://aws.amazon.com/blogs/machine-learning/technical-deep-dive-agentcore-payments-and-innovation-in-agentic-commerce/>), see the Amazon Bedrock [AgentCore payments documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html>). To explore Solv Labs’ governed agent payments, visit [Solv Labs](<https://www.solvrisk.xyz/>). To learn more about ICME’s PreFlight, visit [ICME](<https://icme.io/>).

* * *

## About the authors

### Patrick Duffy

Patrick is CEO of [Solv Labs](<https://www.solvrisk.xyz/>), where he leads the design of the governed agent-payments workflow and the per-transaction evidence model that makes it independently verifiable.

### Houman Shadab

Houman is a cofounder of [ICME Labs](<https://icme.io/>), the company behind PreFlight, a privacy-preserving verification layer that makes AWS Automated Reasoning Checks independently verifiable in under a second. He focuses on turning that cryptographic rigor into an audit trail that enterprises, compliance teams, and regulators can actually rely on.

### Madhu Samhitha Vangara

Madhu is a Worldwide GenAI Specialist Solutions Architect at AWS, focusing on Agentic AI GTM for Amazon Bedrock AgentCore and Strands Agents. She brings deep enterprise experience translating emerging AI capabilities into measurable customer outcomes. Madhu is a speaker at AI conferences and specializes in production-grade Agentic AI.

### Raju Ansari

Raju is a Senior Software Development Engineer at AWS, specializing in scalable, secure, serverless solutions that simplify data analytics and AI agent development. Currently, he is focused on building foundational AI services, including Amazon Bedrock, which helps developers create intelligent, autonomous applications at scale.

### Chethan Shriyan

Chethan is a Principal Product Manager – Technical at AWS. He has 12+ years of experience in product and business management. Chethan is passionate about building and delivering technology products that create meaningful impact in customers’ lives.

### Wyatt Benno

Wyatt is a technical founder at ICME Labs (<https://icme.io/>), where he leads the research, combining formal methods and cryptography so that every AI agent action ships with a proof rather than a promise. His work centers on how formal verification and zero-knowledge techniques can make autonomous agents provably secure, not just trusted.
