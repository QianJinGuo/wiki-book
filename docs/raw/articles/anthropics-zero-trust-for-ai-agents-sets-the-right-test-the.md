---
title: "Anthropic's Zero Trust for AI Agents Sets the Right Test. The Bearer Token Fails It"
source_url: "https://blog.hello.coop/2026/06/anthropics-zero-trust-for-ai-agents-sets-the-right-test-the-bearer-token-fails-it/"
source: newsletter
ingested: '2026-06-15'
sha256: "b8ccf413bd63a53bba2ea566c811e5e5a1cc776d3e122f7adf25fb61c53c4183"
tags: [newsletter, ai, llm]
ingest_v: 7
ingest_c: 6
ingest_stars: 4
ingest_vxc: 42
---

# Anthropic's Zero Trust for AI Agents Sets the Right Test. The Bearer Token Fails It

> Source: [https://blog.hello.coop/2026/06/anthropics-zero-trust-for-ai-agents-sets-the-right-test-the-bearer-token-fails-it/](https://blog.hello.coop/2026/06/anthropics-zero-trust-for-ai-agents-sets-the-right-test-the-bearer-token-fails-it/)


Published Time: Mon, 15 Jun 2026 15:03:18 GMT

Markdown Content:
_Where the framework stops, and where an agent-native authorization substrate has to begin._

Anthropic’s [_Zero Trust for AI Agents_](https://claude.com/blog/zero-trust-for-ai-agents) is a detailed and well-constructed enterprise security framework, and it is worth reading in full. It gets the starting point right: agents are not chatbots. They interpret goals, choose tools, persist context across sessions, coordinate with other agents, and act. And it states the consequence plainly: traditional access controls will not stop an agent from misusing permissions it legitimately holds. That is the correct frame.

I want to take the framework seriously enough to push on it. Not because it is wrong, but because it contains the exact test that retires its own baseline recommendation.

## The test the document sets for itself

The strongest idea in the document is a design test. When you evaluate any control, the guide says to ask one question:

> does this make the attack impossible, or just tedious?

Anthropic is explicit that controls whose value is friction, such as extra hops, rate limits, non-standard ports, and SMS codes, degrade against an adversary with unlimited patience and near-zero per-attempt cost. The controls that survive share a pattern: cryptographic identity, credentials that cannot be exfiltrated, and network paths that do not exist rather than paths that are merely inconvenient. When in doubt, they say, prefer a control that removes a capability over one that throttles it.

That is the right test. Apply it honestly and it reaches further than the document does.

## Credentials: short-lived tokens are tedious, not impossible

The credential baseline is short-lived, narrowly scoped tokens from an identity provider, hardening to mutual TLS and then to hardware-bound credentials at the top tier. The document is blunt that static API keys and shared service-account passwords should be treated as already compromised, among the first things a model-assisted attacker finds in your code.

But run the baseline through their own test. A short-lived bearer token is a throttle. It shrinks the window during which a stolen secret is useful. It does not remove the secret. The token is still a bearer credential: whoever holds it can use it. Shortening its life raises cost without closing the door. By the document’s own standard, that is tedious, not impossible.

The control that makes credential theft impossible rather than tedious is the one where there is no bearer secret to steal: proof of possession bound to a private key that never leaves the agent. The agent signs its requests. The key is non-exportable. A compromised host yields no reusable credential, because the credential was never a string. It was the ability to produce a signature. HTTP Message Signatures is exactly this, and it is the substrate AAuth is built on.

Worth noting what is absent. The document does not mention DPoP, OAuth Token Exchange, Rich Authorization Requests, or sender-constrained tokens of any kind. It reaches toward non-exfiltratable credentials only at the Advanced tier, and frames that as PKI hardening for high-assurance shops rather than as the recognition that the bearer token itself is the residual flaw at every tier below. Their principle points past their prescription. The honest endpoint of “impossible, not tedious” is to stop issuing secrets that can be carried away.

## Authorization: “the agent has access” is not granular enough

Here is the larger gap, and it is not about how the credential is held. It is about what gets authorized.

The framework describes authorization as a ladder of control families: role-based access control, then attribute-based access control, then continuous authorization, paired with a lifecycle ladder of static roles, dynamic elevation, and just-in-time grants. This is a reasonable taxonomy of access-control categories. What it is not is a mechanism for authorizing a specific call.

In this model the unit of authorization is the agent and the tool. An email agent gets email permissions. A database tool gets read but not write. Attribute-based control adds context such as time of day or a risk score. But the grant is still “this agent may use this tool,” possibly narrowed by coarse attributes. The actual parameters of the call are handled separately, as input validation: reject malformed or suspicious arguments before execution. Validation is a filter against bad input. It is not an authorization decision in which the specific parameters are the thing being authorized.

That distinction is the whole game for agents. “The agent has access to the payments tool” is not a useful grant. “This agent may move at most $3,000, to this payee, once, before Friday” is. The parameters are not noise to be sanitized. They are the authorization context, and they have to be evaluated as such, per request, at the moment the call is made.

This is what AAuth’s R3 provides: constrained calls that are specific about what the parameters may be, where those parameters are the context that gets evaluated. Authorization is bound to the actual operation, not to a standing relationship between an agent and a tool. The document gestures at the right instinct: its Advanced tier asks you to

> evaluate authorization at each action rather than session start.

But it lists this as an aspirational top-tier capability and never says how the evaluation works or what it binds to. The how is the part that matters.

Others responding to the framework have made the same granularity point, framing it as continuous authorization and noting that a generic gateway cannot express a constraint like “search flights and book up to a limit, but never touch payment methods.” The diagnosis is right. The mechanism is where it has to land: the constrained call itself as the authorized artifact, with the parameters as the evaluated context, rather than policy expressiveness bolted onto a gateway.

## Delegation: diagnosed precisely, then under-prescribed

The threat section is sharp on delegation. It names unscoped privilege inheritance, where a manager agent passes its full access context to a worker that should have less, and the confused-deputy amplification, where a low-privilege agent relays plausible instructions to a high-privilege one that executes them without checking the original intent. That is the real shape of multi-agent risk.

The prescribed remedy, though, is detection: establish trust boundaries, verify identity at each hop, and log inter-agent communications to flag unusual delegation patterns for review. Logging is not a delegation model. It tells you afterward that authority leaked. It does not stop authority from leaking.

The document is candid about where this bites in practice. Its own sub-agents can inherit up to the parent’s full permissions, with the distinction captured in telemetry rather than enforced in scope. So the failure mode flagged earlier is present by design, mitigated by visibility.

The removal-not-throttle answer is derived authority. When one agent delegates to another, the sub-agent receives authority that is narrower than the parent’s: purpose-bound, time-bound, scoped to the subtask, and provably so rather than by convention. Delegation that narrows as it travels is the structural fix. Detection is the backstop for when structure fails, not a substitute for it.

## Proof: tamper-evident logs are not authorization

The evidence ladder tops out at immutable, integrity-verified audit trails and full provenance chains. This is good observability. But cryptographic log integrity proves one thing: that the record was not altered. It does not prove that the action was authorized, under whose authority, within what constraint. A perfectly tamper-evident log of an unauthorized action is still a log of an unauthorized action.

What proves authorization is the authorization token itself: a verifiable artifact showing that this specific agent was granted this specific access, for this specific call. Not a log entry you trust because the log is append-only, but an artifact that stands on its own signature and can be checked independently of whoever holds the log.

This is also where I part company with some who are extending the conversation toward identity. The instinct to push delegation evaluation and reconciliation out to the resource and execution boundary recreates the hard problem in a new place. Resources do not have the context to evaluate delegation intent, and asking them to carry full delegation semantics leaks information without buying enforcement. What a resource needs is an anchor: proof that authority existed and that the action is attributable, not the authorization logic itself. The evaluation stays where the context lives. The outcome travels. Credential-vaulting approaches, which keep the bearer token but hold it server-side, sit in a different category again: they proxy the secret rather than eliminate it.

## Binding: the agent does not pop into existence

Underneath all of this sits a concept the framework does not have. It opens with agent identity as the foundation for everything else, and it is right that identity comes first. But it treats the agent’s identity as a starting condition: assign a cryptographic identifier, issue a certificate, attest the hardware. The agent simply exists, already identified, and the controls build outward from there.

Agents do not pop into existence. Someone stood the agent up. A person or an organization created it and delegated some slice of their own authority to it. That act, binding an agent to the principal whose authority it exercises, is the root of the entire chain. It is what makes “under whose authority” a question with an answer. Skip it and agent identity is only a name: cryptographically unforgeable, and connected to no one.

The framework never establishes this binding. It infers the principal after the fact, in two places, both downstream of any decision. The agent’s session carries a user identifier and an organization identifier on its telemetry, so logs can be attributed. And in the confused-deputy case, a high-privilege agent is told it should verify the original user’s intent, with no mechanism for how that intent was bound to the request in the first place. Attribution in a log is not a binding. It is a guess recorded after the action, trusting that whoever wrote the log mapped the agent to the right principal.

This is why “who acted, under whose authority” cannot be answered by adding observability. The answer has to be established at the root and carried forward, not reconstructed at the end. In AAuth the binding is created at enrollment, with confirmed human presence for the initial agent-to-person link, and from then on the agent’s authority traces to a principal by construction. Every constrained call, every delegation, every token resolves back to a party who granted it. The framework’s agent has an identity. It does not yet have a principal. That is the difference between knowing what acted and knowing who is accountable for it.

## This is not a better OAuth. It is fewer primitives.

The reflex in our field is to improve the parts we have: persistent problems met with shorter-lived tokens, weak delegation met with more logging, opaque actions met with better audit. The substrate shift is the opposite move. It deletes primitives rather than tuning them: API keys, bearer tokens, pre-registered clients, redirect-based bootstrapping. It is the difference between a more efficient combustion engine and an electric drivetrain. Not a better carburetor, but no carburetor.

Anthropic moved the conversation to the right ground and wrote down the test that decides it. The bearer token does not pass that test. Neither does authorization at the level of agent-plus-tool, delegation-by-logging, proof-by-immutable-log, or an agent identity with no principal beneath it. Passing the test at the protocol layer is what [AAuth](https://www.aauth.dev/) is for.

