---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a-deployments/
feed_name: AWS China ML
title: "Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments"
sha256: 0a7515dac40d1659792733f344d43ec6b8deed368ead66d0c617bb05d318ae20
created: 2026-05-14
updated: 2026-05-14
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 3
tags: [aws, machine-learning, llm]
---
# Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments
Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments | Artificial Intelligence Skip to Main Content Artificial Intelligence Securing AI agents: How AWS and Cisco AI Defense scale MCP and A2A deployments Model Context Protocol (MCP) adoption has accelerated rapidly since its introduction in November 2024.
Enterprises now manage dozens to hundreds of MCP servers—tools that extend AI agent capabilities by connecting them to external data sources and APIs.
The Agent-to-Agent (A2A) Protocol followed in April 2025, enabling autonomous agents to communicate directly without human intervention.
More recently, Agent Skills emerged across enterprise infrastructure.
This growth has created three security gaps: teams lack visibility into which tools and agents are deployed, manual security reviews can’t scale to match deployment velocity, and compliance frameworks require audit trails that don’t exist for autonomous AI agents.
Organizations face risks from unvetted MCP servers, A2A agents, and Skills: inadvertent access to sensitive data systems, compliance violations under SOX and GDPR frameworks that can result in regulatory penalties, and operational disruptions when vulnerable tools or malicious agents are discovered post-deployment.
Security teams report that manual review processes can add several weeks to each AI application deployment, creating a backlog that grows as AI adoption accelerates.
Audit failures from incomplete tool and agent tracking create regulatory exposure that compliance teams struggle to quantify.
The Cisco and AWS partnership addresses three challenges enterprises face when scaling AI agents: visibility gaps, security bottlenecks, and compliance risks.
In this post, we explore how you can overcome AI security challenges through automated scanning and unified governance.
Enterprise challenges and how Cisco and AWS address them Through strategic collaboration, AWS and Cisco AI Defense provide comprehensive, automated security scanning for every MCP server, AI agent, and Agent Skill in the enterprise.
AI Registry , an AWS-backed open-source project, integrates with Cisco AI Defense to bring: Tool sprawl and visibility Organizations deploying MCP servers and AI agents face a fundamental visibility challenge.
Teams often add servers and agents ad-hoc across cloud and on-premises infrastructure, making it nearly impossible for security teams to maintain oversight.
With dozens or even hundreds of tools and agents running without centralized governance, organizations lose visibility into what tools are available, which agents are communicating with each other, who’s using them, and whether they pose security risks.
The AI Registry solves this through unified registration and discovery.
Every MCP server, AI agent and Skill is registered in a single control plane, providing complete visibility.
Beyond visibility, Cisco AI Defense integration provides added protection.
Supply chain security at scale Third-party MCP servers and A2A agents can contain vulnerabilities, malicious code, or insecure patterns that manual review can’t catch at scale.
When a new server or agent is added to the registry, security scanning happens automatically before an AI component can access it.
The scanner analyzes each MCP tool and A2A agent card and Agent Skill, generating detailed security reports.
If issues are found, the component is automatically marked as disabled with a security-pending tag, requiring administrator review before granting access.
This applies equally whether you’re registering an MCP server that provides database access, or an A2A agent that orchestrates multi-step workflows across your infrastructure.
“Security is a foundational requirement for enterprise AI adoption.
By partnering with AWS on the AI Registry, Cisco AI Defense helps customers achieve comprehensive visibility and protection across their entire MCP server and agent ecosystems.
The ability to scan open registries allows even small organizations to benefit from enterprise-grade security intelligence.” – Akshay Bhargava, VP of AI Product, AI Software and Platform at Cisco.
Compliance and security review bottlenecks Security reviews traditionally create deployment bottlenecks, slowing agent rollout.
Automated scanning with human review (in case of security vulnerabilities being found) enables self-service onboarding with built-in security guardrails.
This transforms a manual, slow process into an automated one that helps with faster onboarding of new MCP servers, agents, and Skills.
“The partnership between AWS and Cisco AI Defense demonstrates how open collaboration accelerates enterprise innovation.
The MCP Gateway Registry provides teams with a unified control plane for both agent and server governance, while Cisco’s scanning capabilities bring production-ready security to the MCP environment.