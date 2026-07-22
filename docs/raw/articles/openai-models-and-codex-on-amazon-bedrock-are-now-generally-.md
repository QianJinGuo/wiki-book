---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/openai-models-and-codex-on-amazon-bedrock-are-now-generally-available/
ingested: 2026-06-02
feed_name: AWS China ML
source_published: 2026-06-01T21:31:12Z
sha256: a0bea7c8155588c0377806b6ad590c4b51892448a10e451269bd6fff9075488a
---

# OpenAI models and Codex on Amazon Bedrock are now generally available

GPT-5.5, GPT-5.4, and Codex are now generally available on Amazon Bedrock. Deploy them in production applications and agents today, on Bedrock’s high performance inference engine.

## Key takeaways 

  * GPT-5.5, the most advanced frontier model from OpenAI, is generally available on Amazon Bedrock. Pricing matches OpenAI first-party rates.


  * Codex on Amazon Bedrock is generally available with pay-per-token pricing. Inference runs through Bedrock, and usage counts toward your existing AWS commitments. 



One month after our [expanded partnership announcement](<https://www.aboutamazon.com/news/aws/bedrock-openai-models>), GPT-5.5, GPT-5.4, and Codex are now generally available on [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), giving you access to frontier models and the OpenAI coding agent for software development. 

Amazon Bedrock is the platform for building and running AI applications and agents at production scale. [OpenAI models on Bedrock](<https://aws.amazon.com/bedrock/openai/>) run on Amazon Bedrock’s next-generation inference engine, built for high performance, reliability, and security. 

**The most capable  OpenAI model on Amazon Bedrock** 

GPT-5.5 grasps your intent faster and handles multi-step tasks autonomously, excelling at writing and debugging code across large code bases, analyzing data, generating documents and spreadsheets, and operating software across multiple tools until a task is complete. The improvements are most significant in agentic coding and knowledge work, where real progress depends on sustaining context and taking action over time.  

Both GPT-5.5 and GPT-5.4 are built for complex, multi-step tasks and are available in the Amazon Bedrock model catalog today. You can call them through the Responses API on Amazon Bedrock and pay the same per-token rate as direct from OpenAI with no additional fees. 

[Bedrock’s inference engine](<https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/>) gives you your own isolated queue with automated capacity management, so your performance stays predictable, even under heavy load. As each request runs, its full state is captured durably and continuously, so if hardware fails or a node restarts mid-call, your request picks back up where it left off instead of starting over. Every call inherits the governance controls you already use across AWS: IAM permissions, VPC and PrivateLink isolation, KMS encryption, and AWS CloudTrail audit logging. Your prompts and responses are not used to train models and are not shared with model providers. These protections extend to GPT-5.5 and GPT-5.4 on Amazon Bedrock. 

> _“At Amgen,  we’re focused on applying advanced AI in ways that may help accelerate the delivery of potential new therapies while equipping our teams with advanced tools. OpenAI’s GPT-5.5 and frontier models offer compelling advances in capability, quality, and consistency that matter in a field where the questions are complex and the standards for scientific accuracy and decision quality are exceptionally high. Making these models available on AWS gives us an important new path to explore and scale those capabilities within the responsible AI framework, including, security, governance, and operational frameworks across the enterprise.”_ 
> 
> _–  Sean Bruich, Senior Vice President, Chief Technology Officer at Amgen_ 

**Accelerate software development with Codex on Amazon Bedrock**   

Codex is the OpenAI coding agent for AI-powered software development. More than 5 million people use Codex every week to write, refactor, debug, test, and validate code across large codebases. Codex holds context across entire repositories, reasons through ambiguous failures, checks assumptions using tools, and carries changes through surrounding code with awareness of how systems connect. With GPT-5.5 powering inference, Codex completes the same work more efficiently and with higher quality compared to prior model versions. 

[Codex on Amazon Bedrock](<https://developers.openai.com/api/docs/guides/amazon-bedrock>) is available through the Codex App, the Codex CLI, and IDE integrations with Visual Studio Code, JetBrains, and Xcode, with all model inference routed through Amazon Bedrock. Inference stays within your selected Region to meet data residency requirements. You pay per token with no seat licenses and no per-developer commitments, so you can get started fast and scale access as you go.   

> _“Autodesk is  the technology platform for the people who design and make the world around us. Workflows like building design are highly iterative, requiring precision, coordination, and continuous refinement across teams. With OpenAI models and Codex now generally available on Amazon Bedrock, our teams are evaluating how frontier AI capabilities and AI-powered development tools on scalable, secure AWS infrastructure can help accelerate development workflows and support more informed decision-making for our customers.”_ 
> 
> _– Ritesh Bansal, VP of Analytics Data, Agentic  AI and AI/ML Platform at Autodesk._ 

## **What’s  next** 

During our expanded partnership announcement, we introduced Amazon Bedrock Managed Agents, powered by OpenAI. Coming soon, it will let you deploy production-ready agents built on the OpenAI agent harness, delivering faster execution, sharper reasoning, and reliable steering of long-running tasks. Every agent will operate with its own identity, log every action for auditability, and run with all model inference on Amazon Bedrock. To stay up to date, sign up through the [interest form](<https://pages.awscloud.com/GLOBAL-ln-GC-openai-bedrock-interest.html>).

We will continue expanding the OpenAI capabilities available on Amazon Bedrock as new advances arrive. That includes Daybreak, the OpenAI vision for changing how software is built and defended. Daybreak, which includes cyber models and Codex Security, is designed to help cyber defenders identify vulnerabilities, review code for risk, and guide remediation across the development lifecycle. When Daybreak becomes available on Bedrock, security teams will be able to adopt it through the governance and operational frameworks they already use on AWS. 

## **Get started**  

GPT-5.5 and GPT-5.4 are available today in the Amazon Bedrock model catalog. Check the [AWS Regions page](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html>) for availability. For documentation and a step-by-step walkthrough, see the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html>) and the [getting started blog](<https://aws.amazon.com/blogs/aws/get-started-with-openai-gpt-5-5-gpt-5-4-models-and-codex-on-amazon-bedrock>). 

* * *

## About the author

### Bharat Sandhu

Bharat Sandhu leads AI/ML marketing for Amazon Web Services, covering silicon, models, training, inference, and agents. His team’s mission is to help customers build, deploy, and scale AI applications and agents faster, more securely, and at lower cost.
