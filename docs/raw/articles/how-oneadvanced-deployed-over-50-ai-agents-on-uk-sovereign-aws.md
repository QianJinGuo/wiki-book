---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-oneadvanced-deployed-over-50-ai-agents-on-uk-sovereign-aws
ingested: 2026-08-12
feed_name: AWS China ML
source_published: 2026-08-12
sha256: 2f09b2bae3292c61b4897a7d1a1c6147b8ce6d4a974659a6750845cc83f4080f
---


# How OneAdvanced deployed over 50 AI agents on UK-sovereign AWS

_This post is co-authored with OneAdvanced team_  
  
Deploying AI agents on a United Kingdom (UK)-sovereign AWS architecture requires careful decisions about model hosting, data residency, and agent orchestration. OneAdvanced, a UK-based enterprise software provider serving over 10,000 customers, needed to deliver AI capabilities while making sure that no data would leave the UK. At the time, the specific models they wanted, Llama 4 Maverick and Llama Guard 4, weren’t yet available through managed services in the UK region. OneAdvanced took a different path: self-hosting open-weight large language models (LLMs) on AWS infrastructure they fully control.

In this post, we describe how OneAdvanced built a UK-sovereign AI solution using Llama 4 Maverick and Llama Guard 4 on [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/>). The solution pairs a Retrieval Augmented Generation (RAG) pipeline backed by [Amazon Aurora PostgreSQL-Compatible Edition](<https://aws.amazon.com/rds/aurora/>) with the [pgvector](<https://github.com/pgvector/pgvector>) extension, over 50 specialized agents powered by [Strands Agents SDK](<https://github.com/strands-agents/sdk-python>), and a tool layer running on [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>). We walk through the architecture, key implementation decisions, and results.

## The challenge: Data sovereignty and model hosting

OneAdvanced provides sector-focused software as a service (SaaS) solutions to organizations in healthcare, legal, and many other regulated industries. Their customers handle sensitive data daily, including patient records, legal case files, and compliance documentation. These customers expect that AI tooling meets strict data residency, security, and privacy standards.

As Andrew Henderson, CTO of OneAdvanced, explains in the [OneAdvanced AI launch video](<https://www.youtube.com/watch?v=a091czAG2fA>):

> _“Data sovereignty, particularly in the UK, is a hard requirement for many of our customers, especially those in the public sector and highly regulated industries. They need to know exactly where their data is, who has access to it, and that it resides within the UK’s legal and regulatory framework to support total compliance and trust.”_

OneAdvanced initially prototyped with [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) and saw rapid results within a two-week sprint: chat completion, an Amazon Bedrock Agent for querying UK statute law, Snowflake data integration, and chart generation.

However, to meet their sovereignty requirements, OneAdvanced needed to host models exclusively in their own UK-based AWS accounts. At the time of the engagement, the models they wanted, Llama 4 Maverick and Llama Guard 4, weren’t yet available through AWS managed services in the UK region. Self-hosting meant deploying, serving, and scaling these models while building a production-grade solution around them. This included content moderation, document retrieval, agent orchestration, and a no-code agent builder for non-technical users.

## Solution overview

The following diagram shows the high-level architecture of the OneAdvanced AI solution.

  
Figure 1: High-level architecture of the OneAdvanced UK-sovereign AI solution

This architecture enabled OneAdvanced to achieve full UK data sovereignty and rapid agent deployment, supporting their ISO 42001 certification for AI governance while maintaining complete control over their model serving infrastructure.

The solution consists of four components. [vLLM](<https://github.com/vllm-project/vllm>) serves Llama 4 Maverick (FP8) and Llama Guard 4 on Amazon SageMaker AI, running on `p5.48xlarge` instances in the London (`eu-west-2`) region. Over 50 Strands agents run on Amazon ECS, each with its own system prompt, tool configuration, and optional input form, with agent configuration stored in [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>). Documents uploaded to [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>) are converted to markdown, chunked, and embedded into pgvector for retrieval. Llama Guard 4 checks user inputs for harmful content before the request reaches the main model.

A typical request flows like this: the user sends a message, and Llama Guard checks it for harmful content (evaluated before the main inference model). The request routes to the appropriate Strands agent on Amazon ECS. The agent calls tools and retrieves relevant documents from pgvector and Amazon S3 as needed, or invokes specialist tools including web search.

## Prerequisites

To self-host an AI model on AWS, you need the following resources and skills:

  * An AWS account with access to `p5.48xlarge` instances in your target Region. For information about requesting GPU instance quota, refer to the [Amazon SageMaker AI Developer Guide](<https://docs.aws.amazon.com/sagemaker/latest/dg/regions-quotas.html>).
  * Intermediate knowledge of deploying containers on Amazon ECS and managing storage with Amazon S3. For getting started, refer to the [Amazon ECS Developer Guide](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html>).
  * Access to your chosen AI model weights (Llama 4 Maverick and Llama Guard 4 require license acceptance on [Hugging Face](<https://huggingface.co/meta-llama>)).
  * Experience with Python-based machine learning (ML) frameworks and container orchestration.
  * A PostgreSQL database with the pgvector extension enabled for vector similarity search.



## Model deployment on Amazon SageMaker AI

OneAdvanced serves Llama 4 Maverick (`meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`) and Llama Guard 4 (`meta-llama/Llama-Guard-4-12B`) using vLLM on Amazon SageMaker AI endpoints. They deploy on `p5.48xlarge` instances in the London region, using Hugging Face models with [AWS Deep Learning Containers](<https://aws.amazon.com/machine-learning/containers/>).

Longer context windows drove the move to P5 instances. OneAdvanced targets 120K–128K token context lengths to support use cases like large document analysis and multi-turn conversations. During the advisory engagement with AWS, load testing with vLLM on P5 instances validated that the infrastructure could handle their throughput requirements. OneAdvanced started on `p4d.24xlarge` instances and moved to `p5.48xlarge` for production, also taking advantage of reserved instance discounts on GPU compute.

Llama Guard 4 replaced an earlier deployment of Llama Guard 3 after OneAdvanced observed high false rejection rates with the previous version. The guard model runs serially before the main model, screening user inputs for harmful content before inference begins.

## Building over 50 agents with Strands Agents SDK

A distinctive aspect of the OneAdvanced solution is its agent library: over 50 task-specific agents spanning healthcare, legal, HR, marketing, logistics, and more. Agents include a Care Incident Response assistant, a Clinical Safety Bulletin generator, a scheme of work generator for education, an operational scenario simulation, a performance review assistant, a Document Comparison tool, and an AWS Architect Agent, among many others. OneAdvanced went from their first agent to over 50 in only three weeks, with most agents built in less than a day.

OneAdvanced evaluated several agentic frameworks, including LangChain, LangGraph, and others, before choosing Strands Agents SDK. The decision came down to a few factors: Strands takes a model-first approach with no rigid workflow definitions, it supports turn-taking and interview-style interactions, and it allowed OneAdvanced to move quickly from idea to deployed agent. As Nick Heap, Principal Software Engineer at OneAdvanced, explains:

> _“Post-evaluation, Strands stood out as the clear frontrunner for the project. Its comprehensive suite of tools not only met our requirements but also offered a future-proof solution that closely aligned with our in-house vision.”_

Each agent is defined with a system prompt, a set of tools, and an optional structured input form. Agents are containerized and deployed on Amazon ECS, with runtime configuration stored in Amazon DynamoDB. Users browse the agent catalog and select the one that fits their task.

OneAdvanced also built a no-code agent builder that non-developers can use to create and configure agents through a visual interface. Users define the agent’s persona, design input forms with drag-and-drop fields, write system prompts with references to form fields (using an @ syntax to inject form values), and select from a library of available tools. This design makes agent creation accessible to product managers, clinicians, and business analysts without writing code.

Agents draw from a shared tool library that includes calculator, chart creation, file content reader, mermaid diagram generator, organization and personal knowledge search, spreadsheet query (including Snowflake integration), text file query, UK statute law search, and web search (opt-in per organization and per user query). For example, an agent can query a Snowflake database and then generate a chart from the results in a single interaction.

OneAdvanced also uses sub-agents and advanced agentic patterns to maintain the context window across complex interactions. A notable design pattern is the interview-style agent. Some agents, like the Strategic Thinking assistant, ask structured questions before providing advice: “Question 1 of 3: What specific pain points does your AI solution aim to address?” This builds context through turn-taking rather than expecting users to provide everything upfront. Focused, guided interactions produce better outcomes than open-ended prompts.

## RAG pipeline

The RAG system gives agents access to both personal and organization-level document collections. Users upload documents through the file management interface into either a personal space or a shared organization space on Amazon S3. Documents are converted to markdown and chunked into 2,048-token segments before embedding into pgvector for vector similarity search. For longer documents, recursive summarization handles content that exceeds the chunk size.

For embeddings, OneAdvanced uses the `intfloat/multilingual-e5-large-instruct` model, chosen for its strong multilingual support and instruction-following capabilities. Rather than adopting an off-the-shelf RAG framework, OneAdvanced built their own retrieval system, internally called “Llamadex,” giving them full control over the pipeline. They initially chose pgvector for its simplicity and the speed it offered in getting to production. As the solution matures, OneAdvanced is reviewing this strategy to evaluate alternatives.

When an agent needs to answer a question grounded in uploaded documents, it calls the appropriate retrieval tool, “Personal knowledge search” or “Organization knowledge search,” which queries pgvector and returns relevant chunks along with source references. Users can see exactly which documents were used to generate a response, supporting transparency and trust.

## Security and responsible AI

Security runs through every layer of the OneAdvanced AI solution, a direct consequence of serving customers who handle sensitive data daily in sectors like health and legal.

The infrastructure runs in the London AWS Region. No user data leaves the UK. No user queries or responses are retained or used for model training. As Nick Heap wrote:

> _“An AI service that is only hosted in the UK and data is not used to train the AI model and OneAdvanced engineers do not have access to the data.”_

Uploaded documents in personal and organization spaces are fully isolated and not readable even by OneAdvanced staff. Llama Guard 4 screens user inputs for harmful content before they reach the main model. Privacy controls are customizable at organizational levels. On the infrastructure side, [Amazon GuardDuty](<https://aws.amazon.com/guardduty/>) provides threat detection on the Amazon S3 document storage layer.

OneAdvanced holds ISO 42001 certification for AI governance—a certification they report being among the first organizations in the UK and Europe to achieve. They’re also a signatory to the EU AI Pact, reflecting a proactive approach to responsible AI across their products and operations.

## Results

Through the AWS advisory engagement, OneAdvanced went from prototype to production on a UK-sovereign AI solution. OneAdvanced deployed Llama 4 Maverick on P5 instances in the London region, giving them full control over model serving infrastructure with no data leaving the UK. They built and shipped over 50 Strands agents in only three weeks, covering use cases across healthcare, legal, HR, marketing, and more. The solution has been running in production since July 2025, serving customers for over a year. It met its target performance metrics. OneAdvanced publicly launched this as the UK’s first private sovereign AI for business, with no user data retained, trained on, or logged. The engagement received a 5/5 customer satisfaction score.

> _“We really appreciate and enjoyed the engagement. We learned a lot which helped us launch a unique offering to the market powered and supported by our strategic partner. Thank you very much to all involved directly and indirectly.”_

— Alex Savage, Head of Integration, OneAdvanced

## Conclusion and next steps

In this post, we showed how OneAdvanced built a UK-sovereign AI solution by self-hosting Llama 4 Maverick and Llama Guard 4 on Amazon SageMaker AI, orchestrating over 50 specialized agents with Strands Agents SDK on Amazon ECS, and grounding responses in customer documents through a RAG pipeline backed by pgvector. The result is a production AI solution that meets strict data sovereignty requirements while delivering practical AI capabilities to enterprise customers in regulated industries.

OneAdvanced has recently implemented an evaluation framework using LLM-as-a-judge with sentiment analysis for continuous quality improvement. Their roadmap also includes backend systems to help users refine their prompts, and running parallel LLM models during version transitions to maintain stability for end users.

If you’re considering a similar approach, start by evaluating your data sovereignty requirements and identifying which models you need to self-host. OneAdvanced began with a two-week prototype on Amazon Bedrock to validate their use cases before committing to self-hosted infrastructure. For more information about deploying models on Amazon SageMaker AI, refer to the [Amazon SageMaker AI Developer Guide](<https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html>). To get started with agentic workflows, visit the [Strands Agents SDK](<https://github.com/strands-agents/sdk-python>) on GitHub.

To read more about OneAdvanced’s journey building their AI solution, see Nick Heap’s post [The AI race and how we fully embraced velocity](<https://careers.oneadvanced.com/employee-stories/the_ai_race_how_we_fully_embraced_velocity/>) on the OneAdvanced careers blog.

If you have a similar use case and would like to explore sovereign AI deployment on AWS, contact your [AWS account team](<https://aws.amazon.com/contact-us/>).

* * *

## About the authors

### Astrid Bowser

Astrid is a Principal Product Manager at OneAdvanced, shaping the OneAdvanced Platform Data and AI initiatives. With degrees in Computer Science and an MBA, she seamlessly blends technical expertise with strategic business acumen. Committed to focussing efforts on developing problem solving solutions with the responsible use of AI, she was Co-Chair of OneAdvanced’s AI Steering Committee, defining and driving the company’s AI-focused vision, including being part of the team driving the objective to be one of the first companies in the UK to secure the new ISO 42001 AI Systems Management standard for OneAdvanced.

### Alex Savage

Alex is an Engineering Manager at OneAdvanced based near London, specialising in scalable enterprise platforms, trusted regional AI and agent systems, and API integration strategies. With a strong background in software engineering and cloud infrastructure, he has helped architect and deliver the UK’s sovereign AI platform from the ground up, driven secure integration standards across the organisation, and provided technical leadership that spans diverse business units—from platform development to cross-functional enablement in healthcare, education, legal and customer experience.

### Nick Heap

Nick is a Principal Software Engineer at OneAdvanced, where he helps drive innovation across emerging technologies, AI, cloud platforms, DevOps, and software engineering practices. With extensive experience spanning software architecture, API development, automation, data analytics, and platform modernisation, Nick is known for solving complex technical challenges, mentoring development teams, and championing best practices that improve both developer experience and business outcomes. A passionate advocate for continuous improvement and technology innovation, he works across teams to accelerate digital transformation and deliver scalable, high-quality solutions for customers.

### Babs Khalidson

Babs is a machine learning engineer at the AWS Generative AI Innovation Center in London, where he specializes in fine-tuning large language models, building AI agents, and model deployment solutions. He has over 7 years of experience in artificial intelligence and machine learning across finance and cloud computing, with expertise spanning from research to production deployment.

### Giuseppe Mascellaro

Giuseppe is a Senior Applied Scientist at the AWS Generative AI Innovation Center, where he helps customers design and deploy generative AI solutions, from agentic systems and RAG applications to real-time multimodal AI. He holds an MSc from Politecnico di Milano and has over 8 years of experience in AI/ML, with research published at AAAI.

### Dr Anil Giri

Anil is a Solutions Architect at AWS, specializing in helping ISV customers build generative AI applications and serverless architectures. He is passionate about guiding clients toward innovative, scalable solutions powered by cutting-edge cloud technology.
