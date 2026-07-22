---
title: "How Inscribe uses Amazon Bedrock to stop document fraud in seconds"
type: raw
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-inscribe-uses-amazon-bedrock-to-stop-document-fraud-in-seconds
ingested: 2026-07-03
feed_name: AWS China ML
sha256: f86be9b73bb62b6b83366168c45b64d44fb3567056c88f494f09436b56337e10
---

# How Inscribe uses Amazon Bedrock to stop document fraud in seconds

_This post is co-written with Conor Burke, CTO and Co-Founder at Inscribe_

Fraud now appears in 1 of every 16 documents, and AI-generated forgeries grew 5x from April to December 2025 ([Inscribe’s 2026 State of Document Fraud Report](<https://www.inscribe.ai/reports/2026-document-fraud-report>)). For financial institutions processing thousands of applications daily, this scale of deception creates an impossible challenge. Traditional manual review takes 30 minutes per application and cannot keep pace with rising volumes. More critically, manual processes struggle to detect the evolving tactics that modern fraud tools make possible. Speed alone is not enough. The solution must also catch sophisticated forgeries, deepfakes, and coordinated fraud rings that human reviewers and legacy rule-based systems were never designed to identify.

[Inscribe](<https://www.inscribe.ai/>) has been building AI-powered document fraud detection since 2017 for leading [banks](<https://www.inscribe.ai/industries/banks>), [lenders](<https://www.inscribe.ai/industries/lenders>), and fintechs. In this post, you will learn how Inscribe developed an [agentic AI](<https://www.inscribe.ai/why-inscribe>) system using Amazon Bedrock that reasons across documents the way an expert fraud analyst would. With this new agentic AI system, Inscribe now detects tampered, fabricated, and AI-generated financial documents in under 90 seconds. This is a 20x improvement over traditional manual review, while maintaining the accuracy and explainability required by financial services regulations.

[Amazon Bedrock](<https://aws.amazon.com/bedrock/>) is a fully managed service that offers a choice of high-performing foundation models (FMs) from leading AI companies, such as AI21 Labs, Anthropic, Cohere, Meta, Stability AI, and Amazon through a single API. It also provides a broad set of capabilities you need to build generative AI applications with security, privacy, and responsible AI.

## The challenge

Consider a typical loan application at a mid-sized bank. A customer submits bank statements, pay stubs, tax documents, and identification. A fraud analyst must verify each document’s authenticity, cross-reference information across documents, check for signs of manipulation including increasingly sophisticated deepfakes and AI-generated forgeries, and research the applicant’s employer and address. They must do all of this while maintaining a fast turnaround to avoid losing the customer to competitors.

This manual process creates three compounding challenges:

  * **Scale:** As application volume grows, institutions must hire proportionally more analysts, driving up costs without improving detection accuracy.
  * **Adaptability:** Static fraud detection rules miss sophisticated schemes like deepfakes, AI-generated fake documents, and coordinated identity theft rings.
  * **Consistency:** Different analysts reach different conclusions on similar cases, creating compliance risks and fairness concerns.



The financial stakes are significant. A single missed case can mean millions in direct losses, regulatory exposure for financial crime failures, and reputational consequences that are even harder to recover from. Time-intensive manual reviews delay customer approvals for days, leading to high abandonment rates. Meanwhile, fraudsters continuously change tactics, shifting from AI deepfakes and fabricated documents to synthetic identity fraud, knowing that overworked analysts might miss subtle manipulation signals when processing hundreds of applications daily.

## Solution: Why agentic AI catches what manual review misses

Inscribe built an [AI solution](<https://www.inscribe.ai/why-inscribe>) that works alongside risk and underwriting teams. It automates routine document analysis while flagging complex cases for human review, combining deep domain expertise with [layered detection techniques](<https://www.inscribe.ai/ai-risk-agents>) to uncover what manual review teams and other providers miss.

Think of an agentic AI system as an expert analyst who works from start to finish. It takes a goal, breaks it into steps, uses multiple tools, and works through to completion. Where a basic AI tool might answer a single question, an agentic system coordinates specialized models, calls external APIs when needed, and synthesizes everything into a final decision. For document fraud detection, that means Inscribe’s system does not only flag a suspicious field. It submits a document, routes it through the right models, runs parallel forensic checks, searches the web to verify employer details, cross-references data across the full document set, and generates an audit-ready fraud report without requiring human intervention, completing the process in seconds.

[Foundation models](<https://aws.amazon.com/what-is/foundation-models/>) excel at understanding context, reasoning across documents, and generating natural language explanations, capabilities that are essential for fraud analysis. The key insight that shapes Inscribe’s architecture: no single model is equally suited to every task. Coordinating the right model for each step, rather than applying one model to everything, delivers better results at lower cost.

## How Amazon Bedrock powers multi-model fraud detection

Broad model selection from Amazon Bedrock means Inscribe can choose the right FM for each task without managing separate infrastructure, turning model selection into a configuration choice rather than an integration project.

Serverless scaling handles the significant swings in document processing volume, from quiet overnight hours to business-hour spikes, without requiring Inscribe to provision dedicated serving infrastructure.

Enterprise security and compliance meet the rigorous data protection standards financial services require: encryption covers data in transit and at rest, and AWS Identity and Access Management (IAM) provides fine-grained access control.

Model versioning and governance allow Inscribe to test new model releases in staging environments before promoting to production, which is critical for maintaining consistent fraud detection accuracy.

## Matching models to tasks for speed and cost efficiency

Inscribe evaluated multiple models on Amazon Bedrock, measuring performance, latency, and cost to determine the right model for each fraud detection task.

### Anthropic Claude Haiku 4.5: Reduce costs by 40% without slowing review

You can reduce inference costs by approximately 40% compared to using Claude Sonnet for routine tasks, without sacrificing speed. Inscribe uses Claude Haiku 4.5 for high-volume operations that complete in seconds: document parsing, field extraction, initial classification, and pre-screening checks. The upgrade to Haiku 4.5 delivered improved accuracy while achieving those cost reductions on routine tasks.

### Meta Llama 3.1 70B and Meta Llama 4: Keep transaction analysis fast and cost-efficient

For transaction enrichment and entity extraction, Inscribe uses Meta Llama models. Ivo, Engineering Manager at Inscribe, explains the decision:

> _“We didn’t see much of a difference in terms of performance. The quality of Llama for those tasks was on par with what we wanted, so choosing Llama allowed us to reduce costs without sacrificing quality. Price definitely had a role to play in the final decision.”_

This pragmatic approach, using Llama when performance matches that of more expensive alternatives, delivers significant cost savings on high-volume inference tasks.

### Anthropic Claude Sonnet 4 and 4.5: Catch cross-document fraud patterns

Claude Sonnet serves as the coordination layer, handling the most sophisticated tasks: cross-document fraud analysis, multi-step reasoning workflows, web search integration for employer verification, and natural language generation of audit-ready fraud reports. Sonnet’s extended context window allows it to maintain awareness across entire document sets, identifying patterns that would be invisible when documents are analyzed in isolation.

## How Inscribe scales fraud detection on AWS

Inscribe’s fraud detection system is built on AWS infrastructure designed to deliver speed, reliability, and compliance at scale. Its agentic architecture means the system coordinates specialized models, decides what to analyze next, calls external APIs when needed, and synthesizes everything into a final decision, without human intervention.

Inscribe’s fraud detection architecture on AWS

### Document ingestion and storage

When loan application documents are uploaded via Inscribe’s web interface or API, the documents land in [Amazon Simple Storage Service](<https://aws.amazon.com/pm/serv-s3/>) (Amazon S3), an industry-leading scalable object storage service. The web application, served through [Amazon CloudFront](<https://aws.amazon.com/cloudfront/>) and an [Application Load Balancer](<https://aws.amazon.com/elasticloadbalancing/application-load-balancer/>), creates a processing job and queues it in [Amazon Simple Queue Service](<https://aws.amazon.com/sqs/>) (Amazon SQS). Documents are immediately queued for processing, with no manual handoff required.

### Asynchronous processing

Celery worker processes (a distributed task queue) running on Amazon Elastic Compute Cloud (Amazon EC2) pull jobs from the queue. This queue-based architecture handles traffic spikes without delays. During business hours, more workers scale up automatically, and overnight, capacity scales down to minimize costs. The system provides consistent performance whether you are processing ten applications or ten thousand.

### Text extraction

[Amazon Textract](<https://aws.amazon.com/textract/>) provides baseline optical character recognition (OCR) and text extraction from PDFs and images. Inscribe has increasingly shifted parsing workloads directly to FMs on Amazon Bedrock, delivering more accurate extraction from complex financial documents.

### Multi-model fraud detection pipeline

After Inscribe extracts text, the document flows through multiple FMs on Amazon Bedrock in a coordinated sequence. Claude Haiku performs fast initial parsing and classification. Meta Llama models process transaction data and extract entities. Claude Sonnet conducts cross-document analysis, coordinates web searches for employer verification and address validation, and generates the final fraud assessment. Each model handles what it does best, keeping your review time to seconds.

### Proprietary fraud detection models on Amazon SageMaker AI

In parallel with foundation model analysis, Inscribe runs proprietary machine learning (ML) models hosted on [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>). These models, built entirely in-house and trained on the millions of applications Inscribe processes each year, detect signals that general-purpose large language models (a subset of foundation models) miss: pixel-level forensic analysis to identify digitally altered images, network pattern detection that matches documents against a library of known fraud templates, and visual anomaly detection for manipulated signatures or layouts.

SageMaker AI provides the managed infrastructure for deploying these specialized models at scale, with built-in capabilities for model deployment, automatic scaling, and performance monitoring. Inscribe’s engineering team can focus on refining fraud detection algorithms rather than managing infrastructure, which matters especially as financial crime tactics evolve faster than static rule systems can adapt.

### Results storage, caching, and observability

Inscribe stores both intermediate reasoning traces and final fraud reports in Amazon Relational Database Service (Amazon RDS), providing a reliable audit trail for compliance teams while supporting ongoing model improvements. [Amazon ElastiCache for Valkey](<https://aws.amazon.com/elasticache/what-is-valkey/>) caches short-lived data such as webhook tokens, enforces rate limiting, and manages Celery task metadata. [Amazon MemoryDB](<https://aws.amazon.com/memorydb/>) supports the vector database layer, where transaction embeddings are stored and queried using K-nearest neighbor (KNN) search, a technique that finds the most similar records in a dataset, to power supporting models.

[Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) tracks model performance metrics including inference latency, error rates, token usage, and cost per request. This observability is critical for detecting model drift, changes in prediction accuracy that signal the need for retraining or model updates.

## Results: What you can achieve with Inscribe

The shift to agentic fraud detection powered by Amazon Bedrock has delivered measurable results across Inscribe’s customer base. The following customer examples demonstrate outcomes achieved by organizations using Inscribe’s fraud detection solution.

**Customer** | **Fraud Losses Prevented** | **Review Time Reduction** | **Key Outcome**  
---|---|---|---  
BHG Financial | Millions prevented | 90%+ reduction | Systematic workflow that grows with you  
Logix Federal Credit Union | $3M+ in 8 months | Up to 99% reduction | AI forgery detection  
BCU | $5.6M prevented | Handles volume from 10 to 10,000 applications | Fraud ring detection  
  
### BHG Financial: From manual to systematic

[BHG Financial](<https://www.inscribe.ai/customers/bhg-financial>), a leading financial services company, struggled with a manual document review process that was inconsistent and could not keep pace with growing application volume. After deploying Inscribe, BHG Financial achieved more than a 90% reduction in manual review time and prevented millions in potential fraud losses. Fraud detection shifted from a subjective, analyst-dependent process into a transparent workflow that teams could rely on for every decision, one that grows with application volume without proportional headcount increases.

> _“Inscribe was the inflection point for us. It transformed fraud detection from a manual, subjective process into a scalable, transparent system we can trust every time.”_ — Michael Coomer, Director of Fraud Management, BHG Financial

### Logix Federal Credit Union: $3 million in fraud savings in eight months

[Logix Federal Credit Union](<https://www.inscribe.ai/customers/logix-federal-credit-union>) processes several hundred loan fraud cases annually. Their investigators needed tools that could surface what manual document inspection could not catch, particularly AI-generated forgeries and synthetic documents. Within eight months of deploying Inscribe, Logix prevented more than $3 million in potential loan fraud losses. The team also avoided the time-consuming manual cross-referencing of employer records and specimen documents that had previously slowed every case.

> _“We started using Inscribe in late April last year. And in just eight months, we saw potential loan fraud savings of over $3 million and countless ID theft saves.”_ — Matt Overin, Fraud Risk Management, Logix Federal Credit Union

### BCU: Stopping fraud rings before losses mount

[BCU](<https://www.inscribe.ai/customers/bcu>), a leading credit union, faced a more complex challenge: coordinated fraud rings submitting multiple applications that manual review was not catching. Inscribe gave BCU’s account protection team the cross-application pattern detection needed to surface these schemes early. The outcome was $5.6 million in fraud losses prevented, with the team able to handle growing review volume without adding headcount proportionally.

> _“Some of our largest dollar preventions in the past few years have come directly from Inscribe detections. We’re talking millions in losses prevented, and that’s made a measurable difference in how fast and how confidently we can stop fraud.”_ — Nickie Christianson, Senior Manager, Account Protection Team, BCU

## Conclusion and next steps

Inscribe’s results show what becomes possible when agentic AI applies to document fraud detection workflows. Not only faster review, but a system that reasons, adapts, and catches fraud tactics that did not exist when it was first trained. As foundation models on Amazon Bedrock continue to evolve, the agentic approach means Inscribe can adopt new capabilities without rebuilding core infrastructure, keeping your institution ahead of fraudsters.

The multi-model architecture on Amazon Bedrock also provides a template for other enterprises facing similar challenges. Strategic model selection, supported by Amazon Bedrock’s unified API and serverless scaling, helps you balance quality, speed, and cost across complex AI workflows.

To get started, explore the following resources:

  * To build your own multi-model fraud detection solution, [explore Amazon Bedrock and available foundation models](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html>).
  * To deploy custom ML models at scale, [get started with Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/canvas-custom-models.html>).
  * To see how Inscribe can help your institution prevent document fraud, visit [Inscribe AI](<https://www.inscribe.ai/>).
  * To learn how Anthropic Claude and Meta Llama models perform on Amazon Bedrock, read the [model documentation](<https://aws.amazon.com/bedrock/anthropic/>).
  * To learn more about agentic AI systems, visit the [AWS Agentic AI](<https://aws.amazon.com/ai/agentic-ai/>) page and discover services and capabilities that can help you develop an enterprise-grade agentic AI solution.



* * *

## About the authors

### Conor Burke

[Conor](<https://www.linkedin.com/in/conorbrk/>) is the co-founder and CTO of Inscribe, where he architects the AI systems behind the company’s agentic fraud detection solution. With a background in electronic engineering and risk operations, Conor has led Inscribe’s product development from its earliest fraud detectors to today’s adaptive agentic AI trained on millions of authentic documents. Inscribe now supports many of the largest banks and fastest-growing fintechs in the U.S., catching fraud that legacy systems miss. Conor’s perspective on AI and fraud prevention has been featured in VentureBeat, Forbes, and The Irish Times.

### Venu Kanamatareddy

[Venu](<https://www.linkedin.com/in/venu-kanamatareddy-4395b8165/>) is an AI Specialist Solutions Architect at Amazon Web Services, where he works with high-growth, AI-native startups to design, scale, and operationalize production-grade AI systems. His work spans generative AI, LLM optimization, agentic workflows, and the observability and evaluation of AI systems in production environments. With a career rooted in cloud architecture, distributed systems, and machine learning, he focuses on designing and building AI systems that operate reliably at scale—balancing performance, cost, and production readiness.

### Krati Singh

[Krati](<https://www.linkedin.com/in/krati-singh-25b92720/>) is a Senior Solutions Architect at AWS based in San Francisco Bay Area. She collaborates with FinTech startups, providing architectural guidance on cloud native solutions. Outside of work, Krati enjoys reading, and working on variety of projects with her two kids.
