---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-couchbase-built-a-multi-model-ai-architecture-for-capella-iq-with-amazon-bedrock
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-20
sha256: 0dcc0b2918fe924278a54162bd3c91baf1ed61ab686a7057855110cb47ddce95
---

# How Couchbase built a multi-model AI architecture for Capella iQ with Amazon Bedrock

_This post is co-written with Tushar Madaan from Couchbase._

Building an AI-powered developer assistant that can generate database queries, recommend indexes, and support multi-turn conversational workflows requires more than a single large language model (LLM). It demands an inference architecture that is flexible, scalable, and resilient. As enterprise adoption of Capella iQ grew, Couchbase expanded its AI application to support multiple foundation model (FM) providers for greater flexibility, improved operational resilience, and alignment with diverse customer deployment preferences. Couchbase required a model-agnostic inference architecture that could scale through traffic bursts and maintain high availability across AWS Regions without pre-provisioned capacity.

This post describes how Couchbase adopted [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) to power Capella iQ with Anthropic’s Claude family of models, the architectural decisions behind their multi-model approach, and the operational benefits realized in production.

## Solution overview

The following diagram illustrates the production architecture for Capella iQ’s integration with Amazon Bedrock.

_Figure 1 — Couchbase Capella iQ and Amazon Bedrock control plane architecture_

The architecture is hosted within AWS Control Plane spanning two AWS Regions (us-east-1 and us-west-2) for high availability. Within us-east-1, an [Amazon Elastic Kubernetes Service (Amazon EKS)](<https://aws.amazon.com/eks/>) cluster runs the Capella iQ microservices:

  * **cp-api pod** : The primary API service that receives developer requests and orchestrates inference calls. This pod forwards Amazon Bedrock invocations through a virtual private cloud (VPC) interface endpoint.
  * **cp-internal-api pod** : Handles internal service-to-service communication and model routing logic.
  * **cp-ns pod** : Manages namespace-level configuration including model vendor settings, tenant-level overrides, and organization preferences.



An [Amazon Virtual Private Cloud (Amazon VPC) interface endpoint](<https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html>) provides private connectivity from the EKS cluster to the Amazon Bedrock runtime. This endpoint routes inference traffic to infrastructure managed by AWS for Bedrock and supports [Cross-Region Inference (CRIS)](<https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html>) within the US geography across us-east-1, us-east-2, and us-west-2 for automatic failover, load distribution, and improved availability during demand spikes.

### How it works

When a developer interacts with Capella iQ, whether asking for a SQL++ query, requesting an index recommendation, or continuing a multi-turn conversation, the request traverses this pipeline end-to-end:

  1. **Request ingestion** : The developer’s natural language request arrives at the cp-api pod. It handles authentication, retrieves session context, and determines the appropriate prompt template for the request type.
  2. **Inference orchestration** : The cp-api pod assembles the inference payload, constructing the prompt, injecting conversation history for multi-turn context, and applying tenant-specific model configurations from the cp-ns pod. The cp-internal-api pod resolves model vendor selection and organization-level routing overrides.
  3. **Private model invocation** : The cp-api pod forwards the request through the VPC interface endpoint to the Amazon Bedrock runtime. The full prompt and response payload remain within the AWS infrastructure and never traverse the public internet. This design meets enterprise security and data residency requirements.
  4. **Cross-Region inference** : Amazon Bedrock automatically routes inference requests to the optimal US Region (us-east-1, us-east-2, or us-west-2) using Cross-Region Inference, keeping requests within the US geographic boundary. During demand spikes or regional degradation, requests route to available Regions without application-level logic or manual intervention.
  5. **Response delivery** : The model response (generated SQL++, index recommendation, or conversational reply) streams back through the same private path. The cp-api pod applies response normalization and formatting before delivering the result to the developer within the Capella iQ interface. Conversation state is persisted for multi-turn continuity.



This design makes sure that model upgrades or provider changes require only configuration updates at the namespace layer, no code changes, no downtime, and no impact to the developer experience.

## Model evaluation

Before selecting a model for production, the team established a benchmark suite covering all core Capella iQ workflows: SQL++ generation, index recommendations, query explanations, iQ Insights generation, and multi-turn conversations. Multiple models available on Bedrock were evaluated using standardized prompt/response test sets, with scoring focused on four dimensions: functional correctness, determinism, latency, and formatting consistency.

Anthropic’s Claude Sonnet 4.5 achieved approximately 76 percent accuracy on an internal evaluation modeled on [BIRD methodology](<https://bird-bench.github.io/>), meeting the production quality bar across all evaluated workflows with no critical regressions. This validated Claude Sonnet 4.5 as the initial production model for Capella iQ’s diverse workload profile, spanning structured code generation, natural language explanation, and multi-turn reasoning. More importantly, it validated a model evaluation framework that helps Couchbase rapidly qualify and adopt newer models as they become available on Amazon Bedrock.

## The Amazon Bedrock advantage

Amazon Bedrock provides a fully managed, serverless inference environment that removes the need to manage model infrastructure. It offers a growing catalog of foundation models, so Couchbase can evaluate and adopt newer model generations without re-architecting their inference pipeline. Cross-Region Inference delivers built-in resilience and geographic distribution that would otherwise require significant custom engineering.

For Couchbase, single-API access to multiple model families through Amazon Bedrock was a natural fit for their goal of building a provider-agnostic architecture, one where model selection is a configuration choice, not a code change.

Enterprise customers require deployment flexibility and the confidence that inference traffic remains within a well-governed AWS footprint. By integrating with Amazon Bedrock, Couchbase offers customers the benefit of the AWS security posture, data residency controls, and compliance certifications (SOC, HIPAA, ISO) for AI-assisted workflows within Capella iQ.

## Engineering considerations

While Amazon Bedrock simplified much of the infrastructure complexity, building a production-grade multi-model inference layer at enterprise scale introduced its own set of challenges:

**Cross-Region failover testing:** The most significant challenge emerged during validation of cross-Region failover scenarios. Testing that inference traffic routed correctly between us-east-1 and us-west-2 under various failure modes, including partial endpoint degradation and regional throttling, required building custom test harnesses and simulating conditions that are difficult to reproduce in development environments. The team worked closely with AWS to validate that requests would automatically reroute to a healthy Region without impacting response quality or latency, and to tune timeout and retry configurations for production readiness.

**Model benchmarking at scale:** Running comprehensive benchmarks across multiple candidate models introduced complexity in comparing results fairly. Differences in tokenization, context window handling, and response formatting required careful normalization before scores could be meaningfully compared. The team built automated evaluation pipelines to facilitate reproducibility and reduce manual overhead during model selection.

## Lessons learned

• **Provider abstraction pays dividends** : Investing early in a provider abstraction layer enabled Bedrock integration without disrupting the Capella iQ user experience, and maintains long-term flexibility to adopt new models or providers without re-engineering core application logic.

• **Cross-Region inference simplifies operations** : CRIS handled bursty workloads across Regions without pre-provisioned capacity or custom failover logic, improving service availability while reducing operational complexity.

• **Multi-model readiness requires dedicated investment** : Production-grade multi-model support demands sustained investment in benchmarking infrastructure, prompt engineering, and observability. Teams should plan for this as a continuous workstream, not a one-time setup.

## Future plans

Couchbase is actively exploring cost optimization through deployment of fine-tuned smaller models through the Amazon Bedrock [Custom Model Import](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-import.html>) capability. By distilling task-specific knowledge into lightweight models for high-volume, well-bounded workloads (such as index recommendations and query explanation), the team aims to reduce per-inference cost while maintaining the quality. Starting with Claude Sonnet 4.5 and evolving to newer models as they become available, this approach exemplifies the value of a multi-model architecture: choosing the right model for the right task while continuously adopting the latest model advancements within a single managed infrastructure.

## Conclusion

Couchbase’s adoption of Amazon Bedrock for Capella iQ demonstrates how to build a resilient, multi-model AI architecture within a software as a service (SaaS) application. In production, Claude Sonnet 4.5 on Amazon Bedrock achieved approximately 76 percent accuracy across Capella iQ’s core workflows. Latency and throughput targets were met within acceptable margins, with no user-impacting quality regressions observed during controlled traffic testing. End users experience the same quality and responsiveness they expect from Capella iQ, now backed by the managed infrastructure and cross-Region resilience of Amazon Bedrock. With a provider-agnostic architecture and rigorous evaluation framework in place, Couchbase is well positioned to rapidly qualify and adopt newer foundation models, including Claude Sonnet 5 and future generations, as they become available. By investing in provider abstraction, phased rollout, and standardized benchmarking, Couchbase delivered a production-grade implementation that treats model evolution as a configuration choice, not a code change, without disrupting the developer experience.

* * *

## About the authors

### Tushar Madaan

Tushar is an AI Product Manager at Couchbase, focused on building enterprise-grade capabilities across Generative AI, agentic applications, and intelligent data experiences. He works at the intersection of AI strategy, product innovation, and developer experience. Tushar is passionate about translating emerging AI technologies into practical, scalable solutions for real-world business challenges. He also enjoys sharing insights on AI product development and the evolving enterprise AI landscape.

### Ayushi Gupta

Ayushi is a Senior Technical Account Manager at AWS who partners with organizations to architect optimal cloud solutions. She specializes in ensuring business-critical applications operate reliably while balancing performance, security, and cost efficiency. With a passion for GenAI innovation, Ayushi helps customers leverage cloud technologies that deliver measurable business value while maintaining robust data protection and compliance standards.
