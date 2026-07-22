---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/amazon-nova-act-is-now-hipaa-eligible/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-22
sha256: 84d6deb5e4fc
feed_name: AWS China ML
source_published: 2026-05-21T22:22:28Z
---

# Amazon Nova Act is now HIPAA eligible

## [Artificial Intelligence](https://aws.amazon.com/blogs/machine-learning/)

 

Healthcare and life sciences (HCLS) organizations depend on repetitive, manual browser-based tasks for critical workflows like claims processing and referral coordination. While agentic AI can automate these workflows, compliance requirements under the Health Insurance Portability and Accountability Act (HIPAA) have limited adoption where electronically protected health information (ePHI) might be present.Amazon Nova Act now qualifies as a HIPAA eligible service, so you can deploy autonomous, browser-based AI agents to automate complex healthcare workflows in connection with ePHI.

In this post, you will learn what Nova Act offers, how HIPAA eligibility applies to agentic AI, and how to get started.

## **About Amazon Nova Act**

[Amazon Nova Act](https://aws.amazon.com/nova/act/) is available as an AWS service to build and manage fleets of reliable AI agents for automating production UI workflows at scale. Nova Act completes repetitive UI workflows in the browser and escalates to a human supervisor when appropriate. Nova Act also integrates with external tools through API calls, remote [Model Control Protoco](https://modelcontextprotocol.io/docs/getting-started/intro)l (MCP), or agentic frameworks, such as [Strand Agents.](https://strandsagents.com/) You can define workflows by combining the flexibility of natural language with Python code.

Amazon Nova Act helps you automate real-world browser tasks that previously required manual effort. The model can navigate websites, fill out forms, extract information, and complete multi-step workflows on your behalf. For HCLS organizations, this translates to reduced administrative burden, faster claims turnaround, and more consistent execution of routine processes.

## **Why HIPAA eligibility matters for agentic AI**

Unlike models that only generate text, agentic AI systems interact with live systems, access data, and execute workflows that might involve [Protected Health Information (](https://www.ncbi.nlm.nih.gov/books/NBK553131/)PHI). Under the [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/), we manage the security of the underlying infrastructure, and you remain responsible for configuring controls to achieve HIPAA compliance within your deployments.

## **Healthcare use cases**

With HIPAA eligibility, you can now automate appointment scheduling, insurance verification, and prior authorization across provider and payer portals. You can check claim status, submit appeals, and track reimbursements on payer websites without manual intervention. You can also send and track referrals between providers and gather data from multiple systems for compliance reporting.

## **Getting started**

To begin using Nova Act in your HIPAA-eligible environment, complete the following steps:

1.  Execute an [AWS BAA](https://console.aws.amazon.com/) through the [self-service process in the AWS Management Console](https://repost.aws/knowledge-center/activate-artifact-baa-agreement) and designate your account as a HIPAA account.
2.  Review the [Nova Act documentation](https://docs.aws.amazon.com/nova/latest/userguide/what-is-nova.html) for service-specific security configurations.
3.  Implement security controls including [AWS Identity and Access Management (IAM)](https://aws.amazon.com/iam/) access policies, [AWS Key Management Service (AWS KMS)](https://aws.amazon.com/kms/) encryption, and [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) logging.
4.  Conduct a design review using the [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/) before deploying workloads involving ePHI.

For detailed implementation guidance, consider engaging [AWS Professional Services](https://aws.amazon.com/professional-services/) or an AWS generative AI Competency Partner.

## **Things to know**

*   **HIPAA eligibility** – Amazon Nova Act is included in the [HIPAA Eligible Services Reference](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/) list. If you have a signed AWS BAA, you can use Nova Act to process ePHI.
*   **Integration** – Nova Act works with the [Strands Agents](https://strandsagents.com/) framework and integrates with [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/), Amazon CloudWatch, and IAM.
*   **Availability** – Amazon Nova Act is available in the US East (N. Virginia) AWS Region. For a list of available services in each Region, see [AWS Capabilities by Region](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) page.
*   **Pricing** – Visit the [Amazon Nova Act pricing page](https://aws.amazon.com/nova/pricing/) for details.
*   **Compliance note** – HIPAA eligibility means the service is designed for use in accordance with HIPAA requirements. You’re responsible for configuring the service to meet your specific compliance obligations. This announcement isn’t intended to provide legal or compliance advice.

## **Conclusion**

With HIPAA eligibility, you can now bring agentic AI to regulated healthcare environments. [Execute your AWS BAA today](https://console.aws.amazon.com/) and explore the [Nova Act documentation](https://docs.aws.amazon.com/nova-act/latest/userguide/what-is-nova-act.html?) to deploy your first compliant agentic AI workflow.

For more information, visit [AWS Cloud Security — HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/) and the [HIPAA Eligible Services Reference](https://aws.amazon.com/compliance/hipaa-eligible-services-reference/).

## **Further reading**

*   [HIPAA compliance for generative AI solutions on AWS](https://aws.amazon.com/compliance/hipaa-compliance/)
*   [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/)
*   [AWS Well-Architected Framework — Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)

* * *

## About the authors
