# Simplify model selection in Amazon Bedrock with the open source Model Profiler

## Ch11.243 Simplify model selection in Amazon Bedrock with the open source Model Profiler

> 📊 Level ⭐⭐ | 4.2KB | `entities/simplify-model-selection-in-amazon-bedrock-with-the-open-sou.md`

# Simplify model selection in Amazon Bedrock with the open source Model Profiler

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/simplify-model-selection-in-amazon-bedrock-with-the-open-sou.md)

# Simplify model selection in Amazon Bedrock with the open source Model Profiler

Generative AI adoption is accelerating across industries, and [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) provides a managed service for building production-ready AI applications. With access to more than 100 foundation models from providers such as Anthropic, OpenAI, Meta, Mistral AI, Cohere, and Amazon, teams have the flexibility to choose the right model for each use case.

But choice comes with complexity. Comparing models across capabilities, pricing, regional availability, context window limits and throughput isn’t straightforward. That information is scattered across console pages, documentation, and regional API calls. For organizations evaluating models for new workloads, optimizing cost and performance, or migrating from other AI systems, this fragmented discovery process slows experimentation and delays production decisions.

The [Amazon Bedrock Model Profiler](<https://github.com/aws-samples/sample-bedrock-migration-and-modernization-tools/tree/main/bedrock-model-profiler>) addresses this gap. This open source tool aggregates model metadata from multiple AWS APIs and external sources into a single, searchable interface. With advanced filtering, side-by-side comparisons, and detailed model cards, teams can explore the full Amazon Bedrock catalog and make informed, data-driven decisions by easing the manual search effort across various documents and model cards.

In this post, you’ll learn what the Model Profiler provides, the real-world scenarios it supports, and how to deploy it in your own environment in under five minutes.

## Solution overview

The Model Profiler is a web application that lets you browse, filter, and compare every foundation model available on Amazon Bedrock in one place. Instead of navigating multiple console pages and documentation sites, you get a single interface with model cards, side-by-side comparisons, regional availability maps, and pricing breakdowns updated daily.

Model Profiler showing the Model Explorer interface

Behind the interface, a fully automated serverless pipeline collects and processes data from seven distinct sources: five AWS APIs and two public URLs. This keeps the catalog accurate without manual intervention.

**Source** | **Type** | **Auth** | **Data Collected**  
---|---|---|---  
Amazon Bedrock ListFoundationModels API | AWS API | IAM (Sigv4) | Model specifications, capabilities, modalities, and regional availability across 33 regions  
AWS Price List API | AWS API | IAM (Sigv4) | On-demand, batch, and reserved-tier pricing across three service codes  
AWS Service Quotas API | AWS API | IAM (Sigv4) | Tokens-per-minute (TPM) limits, requests-per-minute (RPM) quotas, and throughput constraints  
Amazon Bedrock ListInferenceProfiles API | AWS API | IAM (Sigv4) | Cross-region inference configurations and geographic scopes  
Amazon Bedrock Mantle API | AWS API | IAM (Sigv4) | Mantle inference availabi

---

