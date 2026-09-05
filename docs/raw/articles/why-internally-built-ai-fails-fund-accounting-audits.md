---
source: newsletter
source_url: https://www.maybern.com/post/why-internally-built-ai-fails-fund-accounting-audits
tags: [article]
title: Why Internally-Built AI Fails Fund Accounting Audits
sha256: 977892b943073cfb9cfac1f8a82ea7e454655fdbeee3f736c3d93734df02a1b1
fetcher: jina
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 4
ingested: 2026-05-15
---
Published Time: 2026-05-07T13:42:35.043Z
Markdown Content:
On this page
COSO's 2026 generative-AI guidance and PCAOB AS 2201 raised the audit bar for AI in fund accounting. Internally-built AI cannot answer the two questions every auditor will now ask: can you prove what the AI saw, and can you prove it's the same system that ran last quarter. Audit-ready AI in fund accounting is an architecture decision: AI used at build time to generate validated logic, deterministic code at run time, tamper-evident audit trails, and platform-level maker/checker.
Key Takeaways
*   COSO's February 2026 generative-AI guidance and PCAOB AS 2201 created two questions every auditor now asks of AI in scope: _Can you prove what the AI saw?_ and _Can you prove it's the same system that ran last quarter?_
*   Internally-built AI, such as a general-purpose chat tool wrapped around a fund close, cannot answer either question. Session histories are editable, models drift silently, outputs are non-deterministic, and there is no version-controlled change governance.
*   Handing the build to IT does not transfer the compliance assertion. Finance still owns it, and IT now maintains AI logic for a workflow it does not perform.
*   Audit-ready AI in fund accounting is an architecture decision: AI used at build time to generate validated logic, deterministic code at run time, tamper-evident audit trails, and platform-level maker/checker.
## The audit standard caught up to the technology
In private fund accounting, every close is a control test. When AI enters that close, whether through a vendor product, a homegrown agent, or a large language model wrapped around a spreadsheet, the question is no longer whether the math is right. It is whether the math is provable, reproducible, and governed under the same standards your auditor applies to every other system in scope.
That bar moved in February 2026, when COSO published _Achieving Effective Internal Control Over Generative AI_. Read alongside PCAOB AS 2201, which governs how auditors test internal controls over financial reporting, the practical effect is two questions every auditor will now ask of an AI used in your close.
**Can you prove what the AI saw?** An immutable, tamper-evident record of inputs, the logic applied, the model version, and the reviewer.
**Can you prove it's the same system that ran last quarter?** Reproducibility and change governance across closes, so the system that produced your March numbers is demonstrably the same system that produced your June numbers, or the change is documented and re-validated.
These are not novel control concepts. They are the same change-management and reproducibility tests every other system in your control universe has to pass. What is new is the recognition that most internally-built AI, by its construction, cannot pass them.
![Image 1: The two-question audit test for AI in a fund close. Question 1, Can you prove what the AI saw? — PCAOB AS 2201 evidence requirement. Question 2, Can you prove it's the same system that ran last quarter? — COSO 2026 reproducibility requirement.](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fca11d9eb3e1c467bd3b77_fig1-two-questions.png)
## Where internally-built AI breaks down
Six recurring failure modes show up when finance teams or IT departments build AI on top of fund accounting workflows.
‍
![Image 2: Six failure modes that recur across internal AI builds for fund accounting: no immutable audit trail, silent model drift, non-deterministic outputs, no change governance, hand it to IT does not transfer risk, every change reopens every question.](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fca2a05da1b656287ec41f_fig2-failure-modes.png)
## Each failure triggers a clause; an architecture answers it
![Image 3: Each failure mode mapped to the audit standard it triggers and the architectural answer. Three columns connected by arrows: failure mode, audit standard, architectural answer.](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fca2e534dd18e7f10f6fb8_fig3-mapping-table.png)
## What auditable AI architecture looks like
The pattern that holds up under audit has very little to do with the AI hype cycle. It looks closer to how every other system in your control universe is engineered.
![Image 4: The build-time / run-time architectural split. AI generates validated logic once at build time; deterministic code executes at run time on every close. Five control layers underneath every transaction: tamper-evident audit trail (PCAOB AS 2201), determinism (COSO 2026), versioning and rollback (change management), platform-level maker/checker (SOX-equivalent), governed platform for agents (agentic era).](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fca3204874ebc944450e7e_fig4-architecture.png)
‍**AI at build time, not run time.** The defensible use of AI in fund accounting is to generate validated logic at build time: the rule engine for a waterfall, the allocation logic for a fund-of-one, the GP economic split. Once that logic is validated, the run-time engine is deterministic code. Same inputs, same outputs, every cycle. There is no live LLM call touching your fund calculations.
**Tamper-evident audit trail tied to a logic version.** Every transaction produces a read-only record of the inputs, the logic applied, the version of that logic, and the reviewer. The record is non-editable by construction. Auditors test the record under PCAOB AS 2201 scrutiny and close the test.
**Determinism instead of hallucination management.** Fund-accounting math is deterministic by nature. Catch-up provisions, preferred returns, management-fee waterfalls, and GP/LP allocations are rule-bound calculations, not probabilistic guesses. An auditable architecture enforces that determinism rather than asking the team to manage hallucination risk on every close.
**Version control with rollback.** Every change to fund logic is versioned, sandbox-tested before going live, and documented with full change-management evidence. Prior versions remain accessible. Re-validation is built into the workflow, not bolted on after the auditor's first finding.
**Platform-level maker/checker.** Segregation of duties is enforced at the system, not in email or chat. Every output flows through a structured review workflow with role-based permissions before it posts. This is the SOX-equivalent control auditors test. Email and Slack approvals do not pass that test.
**A governed platform for the agentic era.** As AI agents handle more fund-management workflows, the platform those agents run inside is the control. The agent processes the transaction; the platform records, governs, and proves it. Without that governance, the agent is a prompt-and-pray workflow. With it, the agent is an auditable system component.
## How Maybern approaches this
Maybern is built on this architecture. AI is used at build time to generate validated fund-accounting logic. Run time is deterministic code; no live LLM call touches a fund calculation. Every transaction produces a tamper-evident, read-only record of the inputs, the logic version, and the reviewer. Logic changes are versioned, sandbox-tested, and rollback-capable. Maker/checker workflows are enforced at the platform level.
![Image 5: Build-versus-buy contrast. Left, internal build with editable session history, silent drift, non-deterministic outputs, no version control, email and Slack approvals, and compounding re-validation cost. Right, governed Maybern platform with tamper-evident records, build-time AI plus deterministic run time, same inputs and outputs every close, version-controlled logic with rollback, role-enforced platform-level maker/checker, and re-validation built into the workflow.](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fca3847d0fe6e312717c2c_fig5-build-vs-buy.png)
‍
Funds use Maybern as the auditable middle and back office for waterfall calculations, allocations, fee runs, and reporting. As more of those workflows shift to agent execution, Maybern is the governed platform those agents run inside.
The objection we hear most often is _"we'll just have IT build this internally."_ The architecture above is not what an IT team builds in a quarter on top of a general-purpose model and a spreadsheet. It is what years of fund-accounting engineering looks like, executed against a moving audit standard. That is the build-versus-buy question worth asking.
## Architecture, not feature
Audit readiness is an architecture decision, not a feature added before the auditor arrives. Internally-built AI cannot answer the two questions every auditor will now ask: _Can you prove what the AI saw?_ and _Can you prove it's the same system that ran last quarter?_ An auditable architecture answers both, every fund, every close, every time.
[Download Resource](https://cdn.prod.website-files.com/649c8fb8964f3f59b7f03510/69fc9937e0c556aa5fc1f3fc_Why-Homebrew-AI-Breaks-in-Fund-Accounting.pdf)
FAQs
## Frequently asked questions
Quick reference for this topic.
01
### What is COSO's 2026 generative-AI guidance?
COSO published Achieving Effective Internal Control Over Generative AI in February 2026. The guidance applies generative-AI-specific control considerations to COSO's existing Integrated Framework on Internal Control, with particular focus on reproducibility, change management, and the evidence required to test AI-driven controls.
02
### What does PCAOB AS 2201 require when AI is in scope?
PCAOB Auditing Standard 2201, An Audit of Internal Control Over Financial Reporting That Is Integrated with an Audit of Financial Statements, governs how auditors test internal controls over financial reporting. When AI is part of a control, AS 2201 requires the auditor to obtain sufficient evidence that the control operated effectively across the period, which depends on the AI being reproducible and the audit trail being verifiable.
03
### Can an internally-built AI agent meet COSO 2026?
It can, but the engineering required is substantial: version-controlled logic, deterministic execution, tamper-evident audit trails, platform-level maker/checker, sandbox testing, and rollback. Most internal builds that wrap a general-purpose model around a close process do not meet these requirements as constructed.
04
### What is the difference between using AI at build time and at run time?
At build time, AI is used to generate validated logic. For example, an AI-assisted process can produce the rule engine for a waterfall calculation. Once validated, that logic is executed as deterministic code on every close. At run time, no live AI call is made. The same inputs always produce the same outputs.
05
### Can deterministic AI eliminate hallucination risk in fund accounting?
Fund-accounting math is deterministic by nature. When the run-time engine is deterministic code rather than a live language-model call, hallucination is not a risk surface. The control test reduces to reproducibility, which the architecture provides by construction.