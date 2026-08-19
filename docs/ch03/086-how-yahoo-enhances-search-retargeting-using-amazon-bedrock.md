# How Yahoo enhances search retargeting using Amazon Bedrock

## Ch03.086 How Yahoo enhances search retargeting using Amazon Bedrock

> 📊 Level ⭐⭐ | 10.4KB | `entities/how-yahoo-enhances-search-retargeting-using-amazon-bedrock.md`

# How Yahoo enhances search retargeting using Amazon Bedrock

> **Background**: Based on the AWS ML Blog article describing Yahoo's implementation of Amazon Bedrock to enhance Search Retargeting (SRT) capabilities in their omnichannel Demand-Side Platform (DSP).

## Summary

Yahoo modernized the keyword expansion engine powering its Search Retargeting (SRT) product by replacing a legacy Word2Vec + Locality-Sensitive Hashing (LSH) pipeline with a generative AI system built on Amazon Bedrock. After evaluating Amazon Titan, Meta Llama, and Anthropic Claude models, Yahoo selected Claude 3.5 Sonnet v2 as the primary model for keyword expansion. A verification layer converts expanded keywords into embeddings and filters out terms below a similarity threshold, effectively mitigating LLM hallucination. The system launched in production in Q1 2025 and delivers up to 600x improvement in keyword expansion rates and up to 5x growth in addressable audience reach.

## Key Points

- **Legacy limitation**: Word2Vec + LSH suffered from outdated vocabulary, phrase-level matching, purely syntactic similarity, and zero-expansion failures where no new keywords were generated.
- **Model selection**: Yahoo tested Amazon Titan, Meta Llama, and Anthropic Claude via Amazon Bedrock and SageMaker Studio. Claude 3.5 Sonnet v2 was chosen for the best balance of expansion ratio and semantic similarity.
- **Hallucination mitigation**: A verification step converts each expanded keyword into an embedding, computes a similarity score against the original keyword embedding, and drops terms below a defined threshold.
- **Guardrailing pipeline**: Two-stage filtering — sensitive keyword checks applied both before inference (preventing expansion of undesirable seed terms) and after inference (removing sensitive expansions).
- **Production impact**: Launched Q1 2025. Up to 600x increase in keyword expansion rates, 5x growth in audience reach, fivefold improvement in median broad expansion ratio, doubled maximum expansion ratio.
- **Infrastructure choice**: Amazon Bedrock provided serverless access to multiple FMs, eliminating model hosting overhead, supporting batch and real-time inference, and enabling model upgrades via configuration change.

## Deep Analysis

### Legacy Architecture: Word2Vec + LSH

Yahoo's original SRT keyword expansion pipeline used Word2Vec embeddings combined with Locality-Sensitive Hashing (LSH). Advertisers defined audience segments through target keywords, which were canonicalized, embedded, indexed, and expanded via LSH nearest-neighbor search. The expanded set passed through sensitive-term filtering and ranking before being persisted alongside original keywords in an Amazon OpenSearch Service cluster. A separate Batch Scoring workflow evaluated Yahoo users' search histories against this metadata to determine segment membership.

This architecture had four critical shortcomings:

1. **Outdated vocabulary**: Word2Vec models are trained on static corpora and fail to capture emerging terms, brand names, or trending concepts.
2. **Phrase-based matching**: The system operated at the phrase level rather than understanding specific entities, leading to imprecise expansions.
3. **Syntactic rather than semantic similarity**: Word2Vec captures distributional similarity that often correlates with syntax and co-occurrence rather than true semantic meaning.
4. **Zero expansion failures**: In numerous cases, LSH failed to generate any new keywords at all, severely limiting audience reach.

### Modern Architecture: Amazon Bedrock + LLMs

Yahoo replaced Word2Vec + LSH with a generative AI architecture using Amazon Bedrock. Seed keywords are passed to an LLM accessed through Bedrock's serverless API, which generates semantically related keyword expansions. The expanded set then enters the guardrailing pipeline before being persisted for audience matching.

Amazon Bedrock was instrumental to this transformation. It provided serverless access to multiple leading FMs without requiring Yahoo to build or manage custom ML infrastructure. The breadth of models allowed rapid experimentation, while flexible inference options (batch for large-scale offline processing, real-time for latency-sensitive paths) accommodated different workloads.

### LLM Selection Process

Yahoo prototyped and evaluated several models using Amazon SageMaker Studio:

| Model | Outcome |
|---|---|
| Amazon Titan | Evaluated but not selected |
| Meta Llama | Evaluated but not selected |
| Anthropic Claude 3.5 Sonnet v2 | Selected — best balance of expansion ratio and semantic similarity |

The team also factored in computational advertising requirements: sensitive keyword filtering, segment denylists, user privacy preferences, and policy compliance. Claude 3.5 Sonnet v2 consistently produced the most semantically coherent expansions while maintaining an acceptable expansion ratio.

### Hallucination Mitigation Strategy

A key risk with LLMs for keyword expansion is hallucination — generating keywords that are semantically unrelated or nonsensical. Yahoo addressed this with a verification step:

1. Each expanded keyword is converted into an embedding vector.
2. The embedding is compared against the original seed keyword's embedding (cosine similarity).
3. Any expanded keyword below a defined similarity threshold is filtered out.

This ensures only terms semantically aligned with the advertiser's original intent survive, while preserving the creative breadth of LLM generation.

### Guardrailing Pipeline

The full pipeline operates in two phases:

**Pre-inference filtering**: Before seed keywords reach the LLM, they pass through a sensitive keyword check, preventing expansion of undesirable terms.

**Post-inference filtering**: Two sequential checks — (1) embedding similarity scoring as hallucination mitigation, and (2) sensitive keyword filtering on the expanded set.

This creates a robust quality control pipeline maintaining relevance, quality, and compliance.

### Business Impact Results

Production launch: Q1 2025.

| Metric | Improvement |
|---|---|
| Keyword expansion rate | Up to **600x** increase |
| Addressable audience reach | Up to **5x** growth |
| Median broad expansion ratio | **5x** improvement |
| Maximum expansion ratio | **2x** improvement (doubled) |

The LLM-powered system frequently generated hundreds or even thousands of keywords in cases where LSH produced none. This translates into higher relevancy, stronger engagement, and improved conversion rates for advertisers. For Yahoo DSP, the system strengthens its competitive edge in programmatic advertising.

## Practical Lessons

### For Ad Tech Teams

1. **Legacy ML pipelines have hard ceilings**: Word2Vec + LSH is mature but its architectural limits — static vocabularies, syntactic-only matching, zero-expansion failure modes — are inherent. Teams relying on embedding-only nearest-neighbor search should evaluate whether similar ceiling effects limit their systems.

2. **LLMs need domain-specific guardrails**: Generic LLM output filtering is insufficient for computational advertising. Yahoo's dual-stage approach (pre-inference + post-inference filtering) with embedding-based similarity scoring is a transferable pattern for any ad tech use case where accuracy and brand safety are paramount.

3. **Benchmark on both breadth and relevance**: Maximizing one metric at the expense of the other produces poor results. Yahoo's evaluation framework explicitly balanced expansion ratio and semantic similarity. Teams should define composite metrics capturing this trade-off.

### For ML/Infrastructure Teams

4. **Serverless FM access accelerates experimentation**: Amazon Bedrock's breadth of models and zero-infrastructure setup let Yahoo go from concept to production evaluation rapidly without managing GPU instances or model endpoints. Swapping models via configuration rather than re-architecting was a key operational advantage.

5. **Model selection is cross-functional**: Yahoo's evaluation incorporated both technical metrics and advertising-specific constraints (sensitive keywords, denylists, privacy compliance). ML teams should include domain experts in model selection to surface these requirements early.

6. **Hallucination is manageable with embedding verification**: The simple but effective approach of embedding-based similarity thresholding demonstrates that hallucination in structured generation tasks can be mitigated without complex RLHF or human-in-the-loop pipelines. The pattern is general: use the same embedding space for input and output verification.

## Related Entities

- [Amazon Bedrock](../ch11/307-amazon-bedrock.html) — The serverless FM platform used by Yahoo for LLM access and inference
- **AI 广告** — The broader domain of AI-powered advertising technology
- **LLM 评估** — Methodologies for assessing and selecting LLMs for production use cases
- **Search Retargeting** — The advertising technique of targeting users based on search behavior
- **Yahoo DSP** — Yahoo's omnichannel Demand-Side Platform that hosts the SRT product

---

