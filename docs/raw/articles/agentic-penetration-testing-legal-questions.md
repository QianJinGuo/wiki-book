---
source_url: "https://www.bcs.org/articles-opinion-and-research/new-legal-questions-agentic-pen-testing/"
ingested: 2026-06-26
sha256: b94461cf23a4a001
---

# New legal questions: agentic pen testing


Published Time: 2026-06-02T04:30:00

Markdown Content:
Richard Hanstock FBCS, a barrister and founder of Deeptech Legal, explores the technical and legal considerations surrounding agentic penetration testing.

Most of the risks in an agentic pen-test are risks that pen-testing contracts have handled for three decades. What changes is how each mitigation is actually delivered; where a human tester relies on trained judgement to stop pulling on a thread, [an agent needs a coded rule to cease testing once a vulnerability is verified](https://www.bcs.org/articles-opinion-and-research/agentic-ai-developing-the-skills-and-systems-for-success/). A tester who notices a target wobbling under load will throttle instinctively; an agent needs contractual rate limits and automated stop conditions to do the same thing. When a human finishes a job, they know what they created; when an agent finishes, someone else has to reconstruct the work from logs the agent itself produced.

Frameworks such as the NCSC CHECK scheme and the Penetration Testing Execution Standard describe those risks clearly enough. The work is translating them into technical controls and contract clauses that reinforce each other.

## New problems, no map

The harder problems are the ones pen-testing has no precedent for.

The first is prompt injection through the target itself. An agent reasons by ingesting content, some of it from the application under test. If that content carries adversarial instructions, no matter how it was placed there, the agent's behaviour can be manipulated by the system it was hired to examine. A human pen-tester cannot be reprogrammed by reading a webpage. A language model agent can. In early 2026, Aaron Costello of AppOmni publicly disclosed CVE-2025-12420, a ServiceNow vulnerability scored 9.3 that used a hardcoded platform-wide secret and automatic inter-agent trust to let an unauthenticated attacker impersonate any user and drive privileged agentic workflows. Costello called it ‘the most severe AI-driven security vulnerability uncovered to date’. The contract can name the risk, and it can reallocate the resulting civil liability between firm and customer. [What it cannot do is eliminate the underlying reliability problem](https://www.bcs.org/articles-opinion-and-research/five-ai-risks-it-professionals-should-spot-before-deployment/), or bind the third parties whose systems the agent has touched.

The second is authorisation. Section 1 of the Computer Misuse Act 1990 turns on whether the person causing a computer to perform a function is authorised to do so; Section 17(5) supplies the defence where authorisation has been given. That architecture was drafted in 1990, for a human decision maker. When an autonomous agent decides in real time which systems to probe, which techniques to attempt, and which chains of findings to pursue, it is unsettled whether a customer's authorisation to the firm reaches actions the agent chose for itself. The position is further clouded where the authorisation cannot be delegated by the firm to its preferred agentic testing platform. No reported UK authority addresses these points. Commercial contracts are beginning to paper them over with express warranties that authorisation covers activities carried out autonomously. None of that drafting has been tested in court.

The third is cross-engagement contamination. Agentic products improve by learning from the work they do. Findings against one client contain information about that client's specific security posture, and using those findings to train the agent that then tests a competitor raises issues pen-test contracts have never had to answer. Whether vulnerability data can be meaningfully anonymised is a technical question. The contract has to be built on an honest answer to it.

The fourth is non-determinism. A human tester writes reproducible steps, and another tester can follow them. A language-model agent may produce different reasoning paths against the same target. It is not a liability problem in the strict sense, because non-determinism does not itself cause loss. It is a deliverable problem. A report whose steps to reproduce cannot be reliably followed is weaker evidence for remediation, insurance claims or regulatory reporting.

## Who is the agent?

Identity runs through all of these. If a customer authorises a firm, and the firm spawns twenty sub-agents concurrently, who did what, on whose behalf, and with what permissions? Can any of that be proved afterwards? Each instance has its own identity, often ephemeral, often measured in seconds. In most enterprises, non-human identities now vastly outnumber human ones.

The problem has two sides. The first is internal attribution: the audit trail has to reconstruct, after the event, which agent took which action. The second is harder and less discussed. If authentication between the customer and the pen-testing agent is weak, through one-way tokens, shared secrets or static credentials, there is nothing in principle stopping a hostile actor from impersonating a legitimate agent and conducting reconnaissance or exploitation under cover of a test the customer believes to be authorised.

> For you
> 
> 
> Be part of something bigger,[join BCS, The Chartered Institute for IT](https://www.bcs.org/membership-and-registrations/become-a-member/ "Become a member").

A human impersonator is caught by social context: voice, invoicing, LinkedIn, history. An agent is interacted with through dashboards and API calls. The social layer is stripped out, and the impersonation vector widens exactly where human testing's informal verification would catch it.

In November 2025, Palo Alto's Unit 42 published research on agent session smuggling, in which the established cross-agent trust between two legitimate agents is used as a covert channel for malicious instructions. Unit 42 was careful to note that no flaw exists in the agent-to-agent protocol itself. The exposure comes from the fact that legitimate agents trust each other by default, and attackers have worked out how to get inside that trust.

OWASP's Top 10 for Agentic Applications, published in December 2025, places identity and delegation at the centre: three of the top four listed risks concern tool misuse, privilege abuse and supply-chain integrity. The question OWASP poses, which is the one I put to every agentic pen-testing client, is this: when an agent takes a harmful action, can you prove on whose behalf, and under what authority, it was acting?

## What happens next

The contracts being drafted now will either hold up in court or they won't. Firms in the market, and the regulators watching them, have perhaps a year or two of grace before the first serious dispute puts the drafting in front of a judge. Parliament has, in one adjacent field, already produced a workable template. Under sections 47 to 49 of the Automated Vehicles Act 2024, when a self-driving feature is engaged the human user-in-charge is immune from the manner-of-driving offences and liability runs instead to the authorised entity that put the vehicle on the road. A comparable architecture for autonomous security services is not hard to imagine, and in December 2025 the government committed to a statutory defence for cybersecurity research in the Computer Misuse Act. The appetite for reform is not theoretical.

In the meantime, the industry is writing the first draft of its own case law, in engagement letters and terms of service. The firms, and the jurisdictions, that get the architecture right first will have the most durable advantage. Cybersecurity has always lived with legal uncertainty. The difference is that [the uncertainty is now being baked into the tools themselves](https://www.bcs.org/articles-opinion-and-research/how-ai-could-affect-security/), and we will find out what that means in litigation rather than in policy.

_Richard Hanstock is a barrister and founder of Deeptech Legal, a specialist law firm 
