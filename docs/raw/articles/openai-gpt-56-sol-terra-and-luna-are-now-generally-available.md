---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/openai-gpt-5-6-sol-terra-and-luna-are-now-generally-available-on-amazon-bedrock
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-13
sha256: 2f49a6ce9958912ae20da05fa048c0c3d3a5191578b1cd1b5cd46761dcf74b40
---

# OpenAI GPT-5.6 Sol, Terra, and Luna are now generally available on Amazon Bedrock

_Build with the smartest family of models from OpenAI yet, on Amazon Bedrock’s next-generation inference engine._

Organizations scaling autonomous agents and AI-powered products need frontier intelligence that performs reliably across hundreds of steps, from coding agents shipping production code to cyber security research probing novel attack surfaces to genomics workflows analyzing entire gene sequences end-to-end. These workloads run on sensitive data, demand consistent throughput under unpredictable load, and operate in environments where data residency and security are non-negotiable.

Today, GPT-5.6 Sol, Terra, and Luna from OpenAI are generally available on [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), bringing the smartest family of models from OpenAI yet to Amazon Bedrock’s next-generation inference engine built for high-performance, security and reliability. GPT-5.6 sets a new standard for intelligence and efficiency, so you can solve harder problems in less time and with more intelligence per token. Pricing matches OpenAI first-party rates, and usage counts toward your existing AWS commitments.

## Frontier intelligence from flagship reasoning to fast inference

[GPT-5.6](<https://openai.com/index/gpt-5-6/>) introduces a new naming system from OpenAI: the number identifies the generation, while Sol, Terra, and Luna identify durable capability tiers that can advance on their own cadence.

  * **GPT-5.6 Sol** is the flagship reasoning model and the most powerful from OpenAI to date. According to OpenAI, Sol sets a new state of the art on the Artificial Analysis Coding Agent Index at 80 points (2.8 above the next-best model) while using less than half the output tokens, taking less than half the time, and costing about one-third less, and scores 73.5% on ExploitBench for cybersecurity research versus 47.9% for GPT-5.5 at a comparable output-token budget. On Agents’ Last Exam, an evaluation of long-running professional workflows across 55 fields, Sol sets a new high of 53.6, outperforming the next-best model by 13.1 points. At medium reasoning effort, it still leads by 11.4 points at roughly one-quarter the estimated cost. Sol also introduces max reasoning effort, which lets you dial up compute for complex work. Use Sol for autonomous coding agents, vulnerability research, drug discovery workflows, and tasks that require deep multi-step reasoning.
  * **GPT-5.6 Terra** is the balanced model for everyday production work. It delivers superior performance to GPT-5.5 at a lower cost. Use Terra for code generation, content workflows, structured data extraction, and general-purpose agentic tasks that need strong reasoning without flagship pricing.
  * **GPT-5.6 Luna** is the fast and affordable model. Use Luna for high-volume inference tasks like classification, summarization, routing, and real-time applications where latency and cost per token matter most.



With the three tiers, you can right-size model capability and cost to each workload. GPT-5.6 models complete tasks with fewer output tokens than their predecessors, delivering stronger performance per dollar.

## An inference engine built for scale

Agent traffic is often bursty: one user request can trigger hundreds of model calls, and demand can change quickly as usage grows. Amazon Bedrock’s next-generation inference engine pools capacity to absorb demand spikes while isolating each customer’s throughput. This reduces the need to choose between shared capacity and predictable application performance. In-Region inference keeps requests within the AWS Region that you specify, helping teams meet strict data-residency requirements.

Agentic and multi-step workloads also repeat much of their context between calls. System instructions, tool definitions, and reference files often stay the same while only the latest input changes. GPT-5.6 on Amazon Bedrock introduces prompt caching with explicit cache breakpoints to take advantage of that repetition. You mark the reusable part of a prompt with a cache breakpoint, and Amazon Bedrock reuses the processed context on subsequent requests that share it, so each call pays only for the new work. Cached input is billed at a 90 percent discount and stays available for reuse for at least 30 minutes. This is long enough to cover the burst of calls a single agent run generates without compounding cost as workloads scale.

## Robust safety meets hardware-enforced security

More capable models require stronger safeguards. GPT-5.6 features OpenAI’s most robust safety stack to date, shaped by their most extensive evaluation period yet, combining human red teaming with large-scale automated testing. The safety stack includes model-level refusals for prohibited activity, real-time misuse classifiers, continuous monitoring, and account-level enforcement for persistent patterns.

On Amazon Bedrock, these protections sit on top of hardware-level security. Amazon Bedrock uses a zero-operator access (ZOA) security model enforced at the chip, so no AWS operators can access your prompts or completions. Every model call runs under your AWS Identity and Access Management (IAM) policies, inside your virtual private cloud (VPC), and is logged in AWS CloudTrail. Data perimeter policies prevent exfiltration across account and network boundaries. As required by the model-provider, classifier-flagged traffic data will be retained for up to 30 days for [automated abuse detection](<https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html>).

## More ways to put GPT-5.6 on Amazon Bedrock to work

Alongside GPT‑5.6, OpenAI launched ChatGPT Work, an agent in ChatGPT for larger, multi-step tasks. The updated ChatGPT desktop app for Mac and Windows brings Chat, Work, and Codex together in one experience, with two dedicated agents for different kinds of work:

  * **Work:** The new Work agent is built for bigger, multi-step tasks. It can gather information across apps and files, use the web, create finished materials such as sheets, slides, docs, and Sites, and stay with complex projects for hours. Users can follow its progress, change direction, and approve important actions.
  * **Codex:** Codex remains the powerful coding agent for developers and technical professionals. It can work with local files, repositories, terminals, developer tools, and development environments to write features, fix bugs, run tests, and open pull requests.



Users can configure the app to use GPT-5.6 through the Responses API on Amazon Bedrock. Run the smartest family of models from OpenAI on Amazon Bedrock and get frontier intelligence with the security and scale of AWS.

## Get started today

GPT-5.6 Sol is available in the following [AWS Regions](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html>): US East (N. Virginia) and US East (Ohio). GPT-5.6 Terra and Luna are available in US East (N. Virginia), US East (Ohio), and US West (Oregon).

Get started with Sol, Terra, and Luna in the [Amazon Bedrock Console](<https://us-east-1.console.aws.amazon.com/bedrock-mantle/home?region=us-east-1>) or programmatically through the Responses API. To learn more, see the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html>) and visit the [Amazon Bedrock product page](<https://aws.amazon.com/bedrock/>).

* * *

## About the authors

### Tanvi Girinath

Tanvi is a Product Marketing Manager for Amazon Bedrock at Amazon Web Services (AWS), where she helps customers adopt and scale AI applications and agents with Amazon Bedrock.

### Saurabh Trikande

Saurabh is Senior Product Manager for Amazon Bedrock at Amazon Web Services (AWS). He leads efforts to make inference with frontier models from leading providers performant, secure, and cost-efficient for customers at any scale.

### Chris Dickens

Chris is a Member of Product Staff at OpenAI focused on the OpenAI APIs. His work includes collaboration with AWS on Amazon Bedrock to make OpenAI’s frontier models widely accessible to developers.
