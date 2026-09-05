---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/authoring-dogwood-policies-from-natural-language-in-amazon-bedrock-agentcore
ingested: 2026-08-21
feed_name: AWS China ML
source_published: 2026-08-20
sha256: 3ac56d6f440d82db4de91273f879579871aecc30ab9dd6317e060f1a03a60e22
---

# Authoring Dogwood policies from natural language in Amazon Bedrock AgentCore

AI agents can automate complex workflows but might take actions that don’t align with your organization’s policies or regulatory constraints if used without proper controls. To address this, we built [Policy in Amazon Bedrock AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>) so teams can implement controls that are applied across agents running in [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>). This was recently expanded with new capabilities for enforcing restrictions that constrain agent actions _across time_ , which support policies such as rate limiting, prerequisites and sequential ordering of tool calls, and cumulative effects. These policies are expressed in [Dogwood](<https://github.com/dogwood-policy/dogwood>), an open source governance language, and applied to agent actions in real time by the Dogwood monitor built into the [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>), a capability of Amazon Bedrock AgentCore.

As part of this new launch, we expand the capabilities of [Policy Authoring](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-natural-language.html>), an AI-driven tool to convert natural language policy specification documents into syntactically and semantically correct Dogwood formal specifications. With this new feature, you can generate policies that enforce temporal and trajectory constraints, invoke [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) services to detect inappropriate content in the semantic meaning of free-form text, as well as policies that place restrictions on the input parameters of tools which were available in the previous version of Policy in AgentCore. Whatever your technical background, you can import policy documents written in natural language directly into the policy in Amazon Bedrock AgentCore to safeguard your deployed agentic systems.

In this post, we demonstrate this new capability using examples and provide guidance on how you can use best practices when constructing natural language policies.

## Automated translation of natural language policies to Dogwood

Dogwood policies can be written entirely by hand, and for a small set of controls that is a perfectly reasonable place to start. Policy Authoring works best when you already have rules written in prose and the work in front of you is transcription rather than design. You can provide a document containing a clean set of rules: a list of policies, the rules section of an operating procedure, or a written paragraph of permitted or restricted actions. Authoring is a translator rather than a summarizer, so a document that interleaves its rules with rationale, background, and commentary is better pared down to the rules themselves first.

## Example setting

To keep the examples concrete, let us consider a customer-servicing agent at a retail bank. It verifies callers, files disputes, issues refunds against disputed charges, moves funds between a customer’s own accounts, and can ask a supervisor to approve a charge. Its tools are reached through the AgentCore Gateway, and each takes a small set of arguments and returns a result:

**Tool** | **Purpose** | **Input** | **Output**  
---|---|---|---  
`verify_identity` | Step-up verification of the caller | `{ account: String }` | `{ verified: Bool }`  
`initiate_transfer` | Moves funds between the customer’s accounts | `{ account: String, dest_account: String,  amount: Long }` | `{ confirmation: String }`  
`issue_refund` | Reverses a disputed charge | `{ account: String, charge_id: String, amount: Long }` | `{ refunded: Bool }`  
`file_dispute` | Opens a dispute case | `{ account: String, description: String }` | `{ case_id: String }`  
`request_approval` | Asks a supervisor to approve a charge | `{ charge_id: String }` | `{ approved: Bool }`  
  
Alongside the policy document, authoring takes a schema carrying exactly this information: the tool names, the arguments they accept, and the values they return. That schema is generated from the agent’s Model Context Protocol (MCP) tool manifest, so the policies that come out refer to the same names the agent actually calls. For example, `context.input.amount` in a generated policy is the `amount` argument in the preceding table. Authoring is also given the set of available Amazon Bedrock Guardrails checks, and identity claims that a policy is allowed to reference.

The bank’s compliance team maintains its controls as a written document in the form it already uses for its human staff. The rules that follow are taken from that document, each followed by the Dogwood policy that Policy Authoring produced for it. Two conventions make the output more straightforward to read. Dogwood is default-deny and a `forbid` overrides a `permit`, so a rule that grants a capability becomes a `permit` carrying the conditions, while a rule that limits or caps something becomes a `forbid`. And a condition can examine either the call being decided or what has already happened in the same session. The following examples do both.

## Policy translation examples

The following examples show how the autoformalizer translates natural language policies into Dogwood formulas.

### A constraint on a tool’s arguments

_Refunds might be issued only during business hours, defined as 9:00 AM–5:00 PM UTC, and only for amounts of $2,500 or less._
    
    
    permit ( principal, action == AgentCore::Action::"issue_refund", resource )
    when { context.system.now.toTime() >= duration("9h")
        && context.system.now.toTime() <= duration("17h") }
    when { context.input.amount <= 2500 };

One sentence carrying two independent requirements becomes one policy with two conditions, both of which must hold for a refund to be permitted. `context.input.amount` is the amount argument of the `issue_refund` call as the agent issued it, compared in whatever units the tool declares. The document’s “$2,500” and the tool’s `amount` need to agree on that. The time comparison reads the clock at the moment the call is decided, and neither condition depends on anything the agent did earlier. For more detail on time-based functions like `duration`, see [Time-based policy support](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-time-based.html>).

### A required prior step

_Do not initiate a transfer unless the caller’s identity has been verified for that same account within the previous 15 minutes._
    
    
    permit ( principal, action == AgentCore::Action::"initiate_transfer", resource )
    when temporal {
        formerly within 15m AgentCore::Action::"verify_identity"::response{
            input.account:   context.input.account,
            output.verified: true
        }
    };

This rule cannot be settled from the transfer request alone, so the generated condition looks at what the agent has already done. `formerly within 15m` asks whether the event it describes occurred at any point in the past fifteen minutes. Here, the completion of a `verify_identity` call (`::response`, the result, rather than the call being made) that came back with `verified: true`. Inside an event pattern, a bare `input.account` names a field of that earlier event, while `context.input.account` names one on the call being decided. Setting the two equal is what makes “that same account” precise. A verification of some other account, or one that was attempted and came back unverified, does not satisfy the rule. And because the history examined is the current session’s, the rule needs no separate ID for the caller, which is why `verify_identity` takes only the account.

### A cumulative cap

_Block a transfer if the total amount transferred in the past 12 hours would exceed $50,000._
    
    
    forbid ( principal, action == AgentCore::Action::"initiate_transfer", resource )
    when temporal {
        exists (total: Long). (
            (sum a for (a: Long), (t: Timepoint). where (
                formerly within 12h (
                    AgentCore::Action::"initiate_transfer"::request{ input.amount: a } && tp(t)
                )
            )) == total && total > 50000
        )
    };

Here, the history isn’t searched but added up. The policy takes the amount argument of every transfer in the past 12 hours, sums them, and denies the current call if the running total passes $50,000. Each individual transfer in that window might be small and unremarkable, but the condition instead constrains their aggregate. Note also what the document leaves open: it says “transferred” without saying whether a blocked or failed attempt counts. The translation sums `::request` events, meaning every transfer the agent attempted, which is the safer reading for a cap. However, saying so in the document removes the guess, and that is the subject of the first best practice that follows.

### A rate limit

_The agent might attempt no more than three refunds against the same account within one hour._
    
    
    forbid ( principal, action == AgentCore::Action::"issue_refund", resource )
    when temporal {
        exists (n: Long). (
            (count for (t: Timepoint). where (
                formerly within 1h (
                    AgentCore::Action::"issue_refund"::request{ input.account: context.input.account } && tp(t)
                )
            )) == n && n > 3
        )
    };

This has the same shape as the previous policy, counting events rather than summing a field. The count is restricted to refunds against the account named in the call under consideration, and it includes that call, so the fourth attempt within the hour is the one that is denied. This rule says “attempt” explicitly, so unlike the previous one it leaves nothing to infer: a refund that was denied or that failed still counts against the limit.

### A check on free-form text

_Reject any dispute filing whose description contains a Social Security number._
    
    
    forbid ( principal, action == AgentCore::Action::"file_dispute", resource )
    when {
        BedrockGuardrails::SensitiveInformation(["US_SOCIAL_SECURITY_NUMBER"], [context.input.description])
            .maxConfidenceScore().greaterThanOrEqual(decimal("0.2"))
    };

Some rules are about the meaning of free-form text rather than a structured value, and no comparison on a field will decide them. For these, the generated policy calls an Amazon Bedrock Guardrails check inline, on the field the rule names, and compares the reported confidence against a threshold. This rule states no threshold, so the translation uses the default for that check. When a document does state one (for example, “with high confidence”, or a specific number), that value is carried through instead.

### A rule that draws on more than one kind of condition

_A refund of more than $500 requires a supervisor’s approval for that charge, recorded within the last 30 minutes._
    
    
    forbid ( principal, action == AgentCore::Action::"issue_refund", resource )
    when { context.input.amount > 500 }
    unless temporal {
        formerly within 30m AgentCore::Action::"request_approval"::response{
            input.charge_id: context.input.charge_id,
            output.approved: true
        }
    };

The sentence has two parts that are checked in quite different ways: a threshold on an argument of the current call, and a condition on what has already happened. Both clauses live in the same policy. The rule narrows an existing permission: it denies refunds over $500, and the `unless` clause is the exception that lifts the denial when a matching approval is on record. As in the earlier prerequisite example, the correlation on `charge_id` is what stops an approval for one charge from authorizing a refund on another.

## Best practices

Clear and unambiguous policies result in more predictable behaviors and fewer errors, whether the implementer is a human user or an autonomous agent. As well, this improves the performance of the natural language to Dogwood authoring solution introduced earlier. Next, we review a handful of tips and best practices for constructing natural language policies.

  * **Say whether you mean the attempt or the outcome**. “After a transfer” is ambiguous. “After a transfer succeeds” is not. An attempt is any call the agent issued, including ones that were denied or failed. Only a completed call carries the values the tool returned. Rate limits and cumulative caps are usually about attempts, prerequisites and ordering rules about outcomes.
  * **State the window**. “Recently” has no translation. “Within the past 30 minutes” does. Windows look backward from the call being decided, so if a rule is meant to reset on a calendar boundary rather than slide with the clock, state that explicitly, because it requires a different control.
  * **Name what the rule is keyed to**. “No more than three transfers per hour” does not say whose: three by this caller, or three against this account? Both are expressible, they are different policies, and the sentence chooses neither. Wherever a rule counts, sums, or correlates, name the field that ties the events together.
  * **Give the threshold and its boundary**. “More than three” and “at least three” differ by one action, usually the one the rule exists to stop. The same applies to the confidence levels on content checks.
  * **Review the generated Dogwood policies for correctness**. Each Dogwood policy is returned alongside the sentence it came from, so that you can read the two side by side. While validation can establish that a policy is well-formed and anchored in the right schema, it doesn’t confirm that the policy says what its author meant. That judgment stays with the person who owns the document.



## Knowing what can’t be enforced

While the authoring service can filter out and highlight policies that are incompatible with enforcement by Policy in AgentCore, you should also be aware of the common issues.

  * **It isn’t a rule about an action**. “Agents should always act in the customer’s best financial interest and exercise sound professional judgment.” There’s no condition here on any action, field, or principal. This is a real requirement, and it belongs in the agent’s instructions, its evaluations, and its training, rather than in an authorization engine.
  * **It asks for an action, not a verdict**. “When a dispute description contains a Social Security number, redact it before the note is stored.” A policy engine permits or denies a call. It doesn’t modify one. The neighboring rule that denies a filing containing a Social Security number is expressible and appears among the preceding examples. Redaction is a different control, applied at a different point in the pipeline.
  * **It is outside what the language expresses**. “Deny wire transfers on weekends and U.S. federal bank holidays.” The date and time support in Dogwood covers points in time, offsets, and differences. There is no day-of-week accessor and no holiday calendar. The [Dogwood language](<https://github.com/dogwood-policy/dogwood/tree/main/dogwood-docs/guide>) guide sets out in detail which constructs are available, and it is worth reading through that guidance when a rule is set aside by the policy authoring service, both to confirm the gap and to see whether a nearby formulation is supported.
  * **It’s outside the scope of enforcement**. “A customer might initiate at most ten transfers per day, counted across all of that customer’s concurrent sessions.” Enforcement evaluates a trajectory within a session, so a cap that pools across sessions isn’t something a different phrasing can recover.



In each case the useful output is not a policy but a label indicating that it cannot be translated into Dogwood, which tells you that you should consider alternatives: rewrite it, move it to a different control, or accept that it stays a human process.

## How policy authoring works

The autoformalization pipeline runs in four steps. It begins by _decomposing_ the document. Rules written for a reader are often compound: a numbered clause frequently carries several independent obligations, and a single sentence sometimes carries two, as the preceding business-hours example does. Decomposition splits them into atomic rules, each one a statement about a specific tool or set of tools that can be enforced on its own. Each rule is then _routed_. A rule is either expressible in Dogwood and its constituent monitors, or it is not, and the ones that aren’t are set aside instead of translated, generally because of the four reasons in the previous section. Filtering here before translation attempt keeps an inexpressible rule from becoming a policy that validates cleanly and enforces the wrong thing. The rules that remain are _autoformalized_ into Dogwood, anchored in the tool schema supplied alongside the document. Finally, every candidate policy is _validated_ using the same [Dogwood command-line tools](<https://github.com/dogwood-policy/dogwood/tree/main/dogwood-cli>) that ship with the open source language. This is the part of the pipeline that isn’t a matter of judgment: the compiler is a precise and deterministic authority on whether a policy parses and whether every name in it exists in the schema. Where a candidate is rejected, its diagnostics are handed back and the rule is translated again with those errors in view, for a bounded number of rounds.

What comes out is two collections: the policies that validated for syntax and compatibility with the environment schema along with the atomic natural language rules that generated them, and the atomic natural language rules that were set aside.

## Conclusion

This post demonstrated how Policy Authoring turns a written policy document into Dogwood policies. You’ve seen examples of translations covering constraints on tool arguments, prerequisites, cumulative caps, rate limits, and checks on free-form content. As well, you’ve reviewed the properties that make a natural language rule translate well: a stated window, a named subject, an explicit threshold, and a clear choice between the attempt and the outcome. Dogwood can be written directly, and teams who prefer to work in the language are welcome to keep doing so. Authoring is there for the common case where the rules already exist in prose, to shorten the path from a document you already maintain to a set of policies you can review and deploy.

To get started, see the [Policy in AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>) for creating a policy engine and authoring policies from a document, and the [Dogwood language guide](<https://github.com/dogwood-policy/dogwood/tree/main/dogwood-docs/guide>) if you would like to read or extend the generated policies yourself. For more on how these policies are interpreted and enforced at runtime, see [Securing AI agents with temporal policies in Amazon Bedrock AgentCore](<https://aws.amazon.com/blogs/machine-learning/securing-ai-agents-with-temporal-policies-in-amazon-bedrock-agentcore/>) and [Introducing Dogwood: runtime verification for AI agents](<https://aws.amazon.com/blogs/opensource/introducing-dogwood-runtime-verification-for-ai-agents/>).

_We would also like to acknowledge the remaining Applied Scientists in our team Chao Shang, Sadat Shahriar, Wanyu Du, and Devang Kulshreshtha for their contributions to this launch._

* * *

## About the authors

### Sandesh Swamy

Sandesh is a Senior Applied Scientist at AWS. During his 9-year tenure at Amazon, Sandesh has made key contributions to Alexa, Amazon Q Developer in chat applications, Amazon Q and Bedrock Guardrails with extensive experience in building models as well as safeguarding applications built on top of Large Language Models. He’s currently focused on Agentic safety with both stochastic and deterministic methods.

### Min Bai

Min is a Senior Applied Scientist at AWS Agentic AI where he works on safety mechanisms to improve the reliability and rule following of agentic AI systems. Previously during his 5 years at AWS, Min also has worked on Ground Truth services and LLM Guardrails for multimodal use-cases.

### Rui Dong

Rui is a Senior Applied Scientist at AWS Agentic AI. During her 5 years at AWS, Rui has been a key contributor to several AWS products including Amazon Kendra, Amazon Q Business, and Policy in Amazon Bedrock AgentCore.
