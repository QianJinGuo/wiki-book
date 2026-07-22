---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-baz-improved-its-ai-agent-code-review-accuracy-using-amazon-bedrock-agentcore
ingested: 2026-06-09
feed_name: AWS China ML
source_published: 2026-06-02
sha256: 72832500bd265195c02adc3d7b68d37d934540796b03664fed8ef27afc9935ae
---

# How Baz improved its AI Agent Code Review accuracy using Amazon Bedrock AgentCore

Code review was always manual and ineffective because of the inherent disconnect between code and product. Developers could review whether code compiled and worked, but not whether it fulfilled all functional and design requirements. In the past, QA teams spent hours manually clicking through preview environments to ensure features behaved as expected, and even more time aligning implementations with design intent. This manual validation slowed delivery, introduced inconsistency, and increased the likelihood of regressions. With the increased velocity of development teams, Baz wanted to automate this missing layer of verification, bringing intent, behavior, and implementation into a single review workflow.

This post walks through how [Baz](<https://baz.co/>) built their Spec Review agent using [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) and [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>). We’ll cover the architecture decisions, implementation details, and the business outcomes they achieved by leveraging these AWS services to automate their code review process

## The key problems Baz is trying to solve

[Baz](<https://baz.co/>) is built to move beyond traditional, diff-only reviews and toward validating whether a feature meets its intended product requirements. Early on, Baz saw that teams struggled with reviews that focused on syntax rather than behaviors, leaving critical questions like “does it work”, “does it match the spec”, “does it behave as intended”, to be answered manually and late in the process. This gap between code and product intent slowed the team down, created design inconsistencies, and required a heavy reliance on undocumented QA internal knowledge Baz set out to close this gap by building agents that could evaluate not just code, but the actual delivered experience.

## Solution overview

The Baz Spec Review agent orchestrates a sophisticated multi-stage validation pipeline: Upon trigger (webhook or manual invocation), it concurrently queries Figma via MCP and Jira through REST APIs to aggregate comprehensive requirement artifacts spanning technical, product, and design specifications. The system then spawns isolated sub-agent workers (one per requirement) tasked with the job of verifying the requirement. This subagent combines code checking via the source code repository with dynamic runtime validation using Amazon Bedrock AgentCore Browser Tool. The subagent interacts with temporary environments, performing DOM inspection, event simulation, and visual testing to ensure the deployed implementation matches both Figma design specifications and behavioral requirements, delivering end-to-end verification across the entire specification-to-implementation lifecycle through AWS native orchestration

The following diagram illustrates the Spec Reviewer architecture, a joint solution from Baz and AWS that enables automated design and product validation within your code review workflow. The entire agentic flow is powered by large language models served through Amazon Bedrock, providing scalable and secure AI inference throughout the pipeline. The flow begins when a GitHub webhook triggers on a new pull request, routing traffic through an Application Load Balancer (ALB) and Network Load Balancer (NLB) into an Amazon EKS cluster. The Baz Platform serves as the central orchestration layer, coordinating the multi-agent review process.

Within the Amazon EKS cluster, Baz’s Spec Review Agent breaks down the validation workflow into specialized subagents. The Specification Subagent, powered by Amazon Bedrock, ingests both visual specifications from Figma and functional specifications from Jira, then decomposes them into discrete requirements – visual requirements (such as spacing, colors, and component hierarchy) and functional requirements (such as acceptance criteria and user story intent).

The Implementation Subagents are the core of this architecture.These Amazon Bedrock powered agents perform deep code analysis against the extracted specifications, but what sets them apart is their integration with Amazon Bedrock AgentCore Browser Use capability. Rather than relying solely on static code analysis, the Implementation Subagents can render the actual implementation in a live Preview Environment and visually validate that the UI matches the intended Figma designs and that functionality behaves as specified in Jira. This combination of code comprehension and browser-based validation enables Baz to catch discrepancies that traditional code review tools would miss entirely.

A Report Generator consolidates findings from all subagents into a coherent review summary. Once the review is complete, findings are distributed to the appropriate channels: comments are posted directly to the GitHub PR, notifications are sent to Slack for team visibility, and identified issues can be automatically linked back to Jira for tracking and resolution.

## How Baz implemented Amazon Bedrock AgentCore to address these challenges

Amazon Bedrock AgentCore became the foundation for building an AI code reviewer capable of validating real product behavior. Its secure, isolated, serverless browser sessions allow the Spec Reviewer agent to open preview environments, navigate through features, and examine UI behavior exactly as a user would. By combining Amazon Bedrock AgentCore runtime to run MCP servers that integrate with ticketing systems, Amazon Bedrock AgentCore Browser tool with lightweight automation and context modules, Baz Reviewer can compare live behavior and code against ticket and design specifications without requiring any browser infrastructure or custom orchestration. Amazon Bedrock AgentCore isolation, sandboxing, and observability help Baz scale multiple MCP servers and allow the agent to safely and reliably perform full-stack validation at scale.

## Enabling intelligent code review with Amazon Bedrock

Amazon Bedrock powers the reasoning and decision-making layer behind the Spec Reviewer agent, enabling it to interpret requirements, understand design intent, and evaluate the relevance of behaviors observed in the browser. By using Amazon Bedrock managed foundation models, the agent can synthesize specification context, analyze UI states, and produce precise, actionable conclusions about whether a feature meets expectations. Amazon Bedrock provides the reliability, security, and scale needed for production-grade agentic workflows, allowing Baz to offload complex interpretation and validation logic to a high-performance LLM while keeping the browser execution isolated within AgentCore. This combination allows the reviewer to bridge the gap between what was intended and what was actually built.

## Conclusion

The Baz Spec Review agent demonstrates how Amazon Bedrock and Amazon Bedrock AgentCore enable organizations to automate product validation workflows that previously required significant manual effort. By leveraging Amazon Bedrock foundation models for requirement interpretation and decision-making, combined with AgentCore secure browser automation capabilities, Baz created a solution that validates implementations against specifications across the entire development lifecycle, reducing reported bugs by up to 50% and time-to-merge by 30–70%

Customers adopting the Spec Reviewer have seen a significant reduction in manual product validation work, with feature verification shifting earlier into the development cycle and occurring automatically on pull requests. Teams report faster reviews, fewer regressions, and higher confidence that changes meet requirements before merging.

* * *

## About the authors

### Guy Eisenkot

**Guy Eisenkot** is the Co-Founder and CEO of Baz. Previously, Guy was the Co-Founder and VP of Product at Bridgecrew, which was acquired by Palo Alto Networks, where he later led Prisma Cloud’s application security business and helped scale its Application Security product line. Before Bridgecrew, he held product leadership focusing on applied machine learning, cloud security, and large-scale security platforms. Guy is passionate about the intersection of AI and software engineering, developer workflows, and building products that reshape how engineering teams operate. Outside of work, he enjoys playing tennis and squash and spending time with his 3 kids.

### Nimrod Kor

**Nimrod Kor** is the Co-Founder and CTO of Baz, where he leads the company’s engineering and AI architecture efforts focused on transforming how developers review and ship code. Before founding Baz, Nimrod worked on cloud infrastructure, developer tooling, and large-scale distributed systems, with a strong focus on performance and developer experience. Passionate about AI-assisted software engineering and open-source development, he actively shares technical insights and builds tools for modern engineering teams. Outside of work, he’s an avid surfer and traveler who spends as much time as possible near the ocean.

### Itay Atas

**Itay Atas** is a Startups Solutions Architect at Amazon Web Services. He works with startups to help them build and design their solutions in the cloud, and is passionate about machine learning and container-based solutions. In his spare time, Itay enjoys hands-on DIY projects and cooking.
