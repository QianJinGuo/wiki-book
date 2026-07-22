---
source: newsletter
source_url: https://dropbox.tech/security/dropbox-mcp-dash-design-code-security
ingested: 2026-06-16
title: "How Dropbox uses MCP and Dash to close the design-to-code security gap"
sha256: a95c4f01d3bfa249c4d278d9307fb34421db6e8cc908f977f726090d7107646b
---

# How Dropbox uses MCP and Dash to close the design-to-code security gap


Markdown Content:
Every security team knows the drill: a new feature goes through design review, a threat model is produced, mitigations are agreed upon, and then development begins. In many cases, by the time implementation reaches code review, the process where engineers review code changes before they go live, the original security requirements are no longer visible in the workflow. A threat model, which outlines potential security risks and the protections a feature should include, often lives in a separate document or system from the code itself.

This separation creates a challenge. Implementation often happens weeks or months after the original security review, making it difficult for reviewers to verify that the agreed-upon security requirements were actually implemented. At Dropbox, we wanted to understand how often this gap appears in practice.

That led us to build a system that combines three technologies: Model Context Protocol, foundational large language models (which we’ll refer to as foundational models), and Dash, the AI capabilities within Dropbox that make it easier to find and understand your team’s content. Together, these technologies automatically retrieve relevant threat models during code review and evaluate whether code changes align with the requirements defined in them. Because Dash already indexes and connects content stored in Dropbox and across our connected applications, the system can draw on years of security reviews and engineering documentation without requiring teams to manually link those sources together.

In this post, we’ll walk through the architecture behind that system, what we learned from analyzing months of threat models, and how we think the same pattern can apply to other forms of design and compliance review.

## The design-to-code gap

Organizations make important decisions about a product long before it ships—such as decisions about threat protection. That said, security reviews only create value if the requirements they produce remain visible throughout the development process. Our engineers wanted to make sure those requirements are upheld as development continues and also identify any gaps.

During a security review, engineers identify potential risks, discuss how a feature could be exploited, and agree on the protections that it should include. Those decisions are recorded in a threat model. But once development begins, those decisions often become separated from the code itself. The threat model lives in a wiki or documentation system, while the code is implemented through pull requests (PRs), the units of work engineers submit for review before changes are merged into a product. Unless someone explicitly links them together, reviewers may never see the security requirements that were agreed upon earlier.

At Dropbox, we maintain threat model documents spanning years of product development. Each one represents hours of security engineering work, but that work only provides ongoing value if reviewers can access it when implementation happens. To understand how often that connection persists, we examined the relationship between threat models and the PRs that implement the features they describe. Through that investigation, we learned that only 12% of implementing PRs link back to their original design review and threat model.

The gap is compounded by how much time often passes between review and implementation. When we measured the interval between design review filing and PR creation across 79 verified pairs, we found that more than half (54%) of implementing PRs weren’t opened until over a month after the review was filed. The median delay was about five weeks, with a long tail stretching beyond 11 months. Only 29% of implementing PRs were opened within the first two weeks of security review.

In other words, there can be a long delay between when security requirements are defined and when the corresponding code is reviewed. By the time reviewers look at the implementation, the decisions made during the security review may be buried in documentation they never open.

**Why existing tools don’t solve this**Once we understood the scope of the gap, the next question was whether existing security tools could close it. For example, while static analysis tools inspect code for known patterns and potential issues, they can only tell you that a security control is present. What they can’t tell you is whether it was implemented according to the requirements agreed upon during design review. They analyze the code itself, not the context or intent behind it.

Organizations often try to address this challenge by asking engineers to link code changes to design reviews or by deploying bots that remind developers to follow review procedures. But these approaches depend on engineers remembering extra steps, and compliance tends to decline over time. What was missing was a way to connect code changes with the security guidance that already exists. We realized the problem wasn’t a lack of security knowledge. Most organizations have invested significant effort in documenting risks and mitigations through threat models. The challenge is making that knowledge available when code is being reviewed.

Our data suggested another opportunity as well. About 15% of design reviews were filed retroactively, meaning the code was built first and the security review came later, often before a broader launch. These cases suggest that some security-sensitive work isn’t always identified as requiring review when it’s implemented. A system that can surface relevant security context _during_ development and not after could help in both directions: connecting code to existing reviews and providing an early signal when additional review may be warranted.

## Using Dash and MCP as a context bridge

We needed a way to connect code under review with the security guidance that already existed elsewhere in the organization. Dash provided a natural starting point. Because it indexes content across connected applications, our collection of threat models was already searchable alongside other engineering documentation. Rather than relying on reviewers to find the right security documentation, we built a system that automatically retrieves relevant threat models when code is submitted for review.

Model Context Protocol (MCP) is what lets the agent access the information it needs. Dash has an MCP server that makes the content it indexes available to other AI tools. In our case, the security review agent uses Dash’s MCP server to search and read the same connected content that powers Dash search, including threat models and related documents. That gives the agent the context it needs without requiring a custom integration for every source system.

![Image 1](https://dropbox.tech/cms/content/dam/dropbox/tech-blog/en-us/2026/june/mcp-dash/diagrams/Diagram%201%20(5).png/_jcr_content/renditions/Diagram%201%20(5).webp)

MCP composes multiple context sources into a single agent session. The model reasons across them to identify gaps between security requirements and implementation.

When a code change is opened for review, the agent retrieves relevant threat models and other supporting context through MCP. The foundational model can then examine both the documented requirements and the proposed code change together. For example, it can recognize that a threat model requires authentication on an endpoint and determine whether the code being introduced actually enforces that requirement.

That ability to reason across multiple sources of information is what distinguishes this approach from traditional static analysis. The system isn’t just inspecting code. It’s comparing implementation against previously documented security decisions.

**Meeting developers where they work**Just as important as the retrieval architecture was where we surfaced the results. Rather than creating a separate security workflow, we integrated the system directly into code review. Engineers review code before it’s merged, so we focused on bringing additional security context into a process that already exists.

This distinction matters because security teams have spent years building tools that generate alerts, comments, and notifications. Developers, in turn, have spent years learning which ones they can safely ignore. The difference between a useful security signal and noise is relevance. A finding tied directly to the code being reviewed is far more likely to be useful than a generic warning that appears on every change.

At the same time, retrieving a threat model is only the first step. Simply placing a security document next to a code review still leaves a human responsible for reading both and determining whether they align. The foundational model performs that comparison automatically, identifying potential gaps between documented requirements and implementation. Human reviewers remain responsible for the final judgment, but the model eliminates much of the manual cross-referencing that would otherwise be required.

## Implementing design-to-code traceability

To validate the approach, we analyzed all 150 of our security design reviews from the previous year and a half and mapped each to its implementing code changes. To do this, we used Dash’s semantic search capabilities, which retrieve related content based on meaning rather than exact keywords or explicit references. The connections exist, but they’re often invisible:

*   Using Dash’s semantic search—the same retrieval capability that powers its user-facing search—we successfully linked 80% of design reviews to their implementing code changes
*   Only 12% of those code changes explicitly reference the design review
*   69% of connections were recoverable only through semantic search, meaning most of the relationship between design reviews and implementation would be invisible through manual references alone

We also evaluated the impact of surfacing threat model context during code review. In our testing, context retrieval consistently surfaced security findings that were invisible without the threat model, including missing controls, contradictions with approved designs, and regressions against known risks. The code was functionally correct in every case. The gaps were only visible when reviewers could compare the implementation against the original requirements.

More importantly, when we examined security incidents, we found cases where the root cause was a security requirement that had been documented during design review but wasn’t enforced in the implementing code. The connection existed; it just wasn't visible at the right moment. These weren’t rare edge cases. They were straightforward requirements that became disconnected from implementation as development progressed.

This is the difference between reviewing code and reviewing implementation against design. The former catches bugs. The latter catches security gaps. And it’s only possible when a model can reason about the relationship between two documents—the threat model and the pull request—rather than analyzing either one in isolation.

## Design principles and what’s next

As we integrate this into our development workflows, we’re designing around a few core principles. Findings must be validated against the actual code before they reach a developer, because false positives destroy trust faster than true positives build it. Every finding should be traceable back to a specific requirement and source document so reviewers can verify the reasoning for themselves. Most findings should be advisory rather than blocking, with escalation reserved for confirmed gaps between approved designs and implementation. And because requirements evolve over time, the system must account for stale context rather than blindly applying outdated guidance.

The architecture isn’t specific to security, either. It’s a general solution for any team that produces design documents and needs to verify they’re reflected in implementation. For example, privacy teams can surface data classification requirements when code touches user data flows. A privacy review that specifies a field must not be logged can be checked against future code changes that handle that field. Platform teams can surface API contracts and compatibility requirements when interfaces change. And compliance teams can surface regulatory requirements when code handles data in regulated jurisdictions.

The common pattern is straightforward: organizations already have documented requirements, but those requirements are often disconnected from the workflows where implementation decisions are made. By combining searchable organizational knowledge, MCP-based retrieval, and foundational models capable of reasoning across multiple sources of context, it’s possible to automatically compare implementation against intent.

The scanning tools and threat models already existed. What we were missing, however, was a way to connect them at the right moment. MCP makes that connection technically feasible. Dash makes it practical. And foundational models make it useful, turning "here’s a relevant document" into "here’s a specific gap between what was required and what was implemented." While security is our first use case, the same pattern can help any team ensure that the decisions made during planning and review are reflected in the systems they ultimately build.

_Acknowledgments: Wei Dai, Jan Nunez, Nicholas Plewtong, Jonathan Hawes, Po-Ning Tseng, Adrian Wood, Steven Kisely, Adam Pindelski, Qingbo Jiang, and the Dash team._

~ ~ ~

_If building innovative products, experiences, and infrastructure excites you, come build the future with us! Visit_[_jobs.dropbox.com_](https://jobs.dropbox.com/)_to see our open roles._

