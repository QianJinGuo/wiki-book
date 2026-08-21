---
title: "Reduce RAG costs on Amazon Bedrock with query-aware compression"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/reduce-rag-costs-on-amazon-bedrock-with-query-aware-compression
ingested: 2026-08-22
feed_name: AWS China ML
source_published: 2026-08-21
sha256: 8e2a3d5ea2a4405e883b77312b63ee265fec7f007e33de7e36b7ea21dd28eb08
---

Input tokens sent to the foundation model (FM) on every call are often a meaningful part of the cost of running [Retrieval Augmented Generation (RAG)](<https://aws.amazon.com/what-is/retrieval-augmented-generation/>) at scale. Query-aware compression offers one way to reduce how many of them reach the model. [Amazon Bedrock](<https://aws.amazon.com/bedrock/?trk=7ecf60df-6136-414c-a7c3-6aa4d2d6019f&sc_channel=ps&ef_id=EAIaIQobChMIypH5r4fBlQMVqEx_AB1OvwmNEAAYASAAEgIGTfD_BwE&gads_camp=23532472972&gads_ag=194311072004&gads_ad=795877020842&gads_kw=amazon%20bedrock&gads_matchtype=e&gads_network=g&gads_device=c&gads_geo=9026933&gad_campaignid=23532472972&gbraid=0AAAAADjHtp8ByFw1VLhJ9bdURylYSJ7dd&gclid=EAIaIQobChMIypH5r4fBlQMVqEx_AB1OvwmNEAAYASAAEgIGTfD_BwE>) provides the [foundation models](<https://aws.amazon.com/what-is/foundation-models/>) and features to build RAG applications. RAG retrieval usually tunes for high recall, returning a broad set of potentially relevant chunks so the primary model has thorough source material to work with. This design helps builders feel confident that the right information is available at inference time. As workloads scale, builders often look for ways to optimize the cost-performance tradeoff by reducing the number of input tokens the primary model processes while maintaining answer quality. The open, composable architecture of Amazon Bedrock supports custom post-retrieval processing steps that refine what reaches the primary model.

In this post, we describe a post-retrieval customization pattern that achieves significant input-token reduction, and therefore cost savings, while preserving answer quality. It’s compatible with RAG retrievers on Amazon Bedrock, including Amazon Bedrock [Knowledge Bases](<https://aws.amazon.com/bedrock/knowledge-bases/>). As a secondary benefit, removing irrelevant context reduces the surface area for hallucination. After retrieval but before the final answer call, a smaller, lower-cost model on Amazon Bedrock filters retrieved chunks against the user’s query. The primary model then receives the filtered context and generates the answer.

We cover the pattern’s architecture at a high level, show the core Amazon Bedrock implementation in a [AWS Lambda](<https://aws.amazon.com/pm/lambda/?trk=2abe6167-e3db-40c4-a9fa-b283e7b4d7c8&sc_channel=ps&ef_id=EAIaIQobChMI0eez9oXBlQMVVTfUAR2_2xb9EAAYASAAEgI-OvD_BwE&gads_camp=23527793912&gads_ag=191938386622&gads_ad=802094701896&gads_kw=amazon%20lambda&gads_matchtype=e&gads_network=g&gads_device=c&gads_geo=9026933&gad_campaignid=23527793912&gbraid=0AAAAADjHtp8GsQ-cK5F5U0jJWeu2our88&gclid=EAIaIQobChMI0eez9oXBlQMVVTfUAR2_2xb9EAAYASAAEgI-OvD_BwE>) function, walk through the cost model and the latency tradeoff, and describe how we evaluated answer quality. We also look at how this pattern can layer on top of existing Amazon Bedrock capabilities like [prompt caching](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html>), Amazon Bedrock [Intelligent Prompt Routing](<https://aws.amazon.com/bedrock/intelligent-prompt-routing/>), and the Rerank API for compounding cost savings.

## Prerequisites

To implement the solution, complete the following prerequisite steps:

  1. Have an active [AWS account](<https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fportal.aws.amazon.com%2Fbilling%2Fsignup%2Fresume&client_id=signup>).
  2. Create an [AWS Identity and Access Management](<https://aws.amazon.com/iam/>) (IAM) role for the Lambda function to access Amazon Bedrock. For instructions, refer to [Create a role to delegate permissions to an AWS service](<https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-service.html>).
  3. Add policy permissions to the IAM role.
  4. Amazon Bedrock model access in your AWS Region for the two models in the cascade: a smaller compression model (Anthropic Claude Haiku in this post) and a primary model (Anthropic Claude Sonnet). [Request access](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html>) on the Amazon Bedrock console under Model access.



## How query-aware compression reduces RAG costs on Amazon Bedrock

A RAG flow using traditional RAG infrastructure or frameworks looks like:

  1. The application embeds the user query.
  2. The vector index returns the top-k chunks (commonly 5–20).
  3. Optionally, a reranker reorders those chunks by relevance.
  4. All retrieved chunks are concatenated into the prompt.
  5. The primary model generates the answer.



Retrieved context scales with top-k and chunk size: retrieving 5–20 chunks at typical chunk sizes puts many technical-documentation and legal RAG workloads in the range of several thousand input tokens per query. Reducing the per-query token count can yield meaningful cost savings.

## Architecture overview

A smaller model reads the retrieved chunks alongside the query and outputs only the verbatim spans relevant to the question. We use Claude Haiku in this post, but the pattern works with other small/primary model pairs within a model family on Amazon Bedrock. Both the compression call and the primary model’s answer call run inside a single AWS Lambda function. Upstream, a retriever embeds the query and returns the top-k chunks. An Amazon Bedrock knowledge base, the fully managed RAG capability backed by Amazon OpenSearch Serverless, is one such retriever. The Lambda function receives those chunks as input and returns the final answer. The compression call is the only step added to a standard RAG flow.

Because the smaller model costs less per token than the primary model, trimming the context before the expensive answer call is where the savings come from. How large those savings are comes down to two things.

The following diagram shows the solution architecture.

  
Figure 1: Query-aware context compression architecture on Amazon Bedrock

**The flow proceeds through the following steps:**

  1. The user submits a query to the application.
  2. The application sends the query to the retriever, which searches the vectorized knowledge sources.
  3. The retriever returns the top-k chunks (full retrieved context) to the application.
  4. The application passes the query and all retrieved chunks to an AWS Lambda function, which sends them to a smaller model (Claude Haiku) through the Amazon Bedrock Converse API. This is the compression call.
  5. The smaller model outputs only the verbatim spans relevant to the query (the compressed context).
  6. The Lambda function sends the query and the compressed context to the primary model (Claude Sonnet) through the Converse API. This is the answer call.
  7. The primary model generates the final answer, which the application returns to the user.



### Why this works economically

The economics depend on two factors: the price ratio between the small and primary models on Amazon Bedrock, and the compression ratio the smaller model achieves.

For a single RAG query with `R` retrieved input tokens, a compression ratio of `c` (where `c` > 1), a final answer output of `A` tokens, and per-token prices `P_small_in` / `P_small_out` (smaller model input and output price) and `P_large_in` / `P_large_out` (primary model input and output price):

 

**Stage** | **Baseline** | **With compression** | **What happens**  
---|---|---|---  
Smaller model reads chunks | — | `R` × `P_small_in` | The smaller model receives the query and all retrieved chunks as input  
Smaller model writes compressed output | — | `(R/c)` × `P_small_out` | The smaller model outputs only the verbatim spans relevant to the query  
Primary model reads context | `R` × `P_large_in` | `(R/c)` × `P_large_in` | The primary model receives the context as input to generate the answer  
Primary model writes answer | `A` × `P_large_out` | `A` × `P_large_out` | The primary model generates the final answer for the user  
Total | `R·P_large_in + A·P_large_out` | `R·P_small_in + (R/c)·P_small_out + (R/c)·P_large_in + A·P_large_out`  
  
The compression call adds the input and output cost of the smaller model. Savings come from sending `R/c` instead of `R` tokens to the primary model. The economics favor compression when:

  * Retrieved context is large (the savings on the larger model dominate).
  * The price ratio between large and small is high (Sonnet/Opus paired with Haiku).
  * A meaningful portion of the retrieved content can be trimmed for a given query without affecting answer quality.



## Implementation on Amazon Bedrock

The pattern fits between retrieval and the final answer call. We implement it as a single AWS Lambda function that orchestrates the two Amazon Bedrock model invocations using the Converse API. The function receives the user query and the retrieved chunks as its input event.

### The compression prompt

The compression prompt is the most important part of the implementation. It must instruct the smaller model to extract spans rather than summarize, forbid paraphrasing and rewriting, and preserve enough surrounding context for citations to remain accurate.
    
    
    COMPRESSION_SYSTEM_PROMPT = """You extract evidence from retrieved documents.
    You will receive a user QUESTION and a list of CHUNKS.
    
    Your job:
    1. For each chunk, identify the spans (verbatim sentences or short paragraphs)
    that contain evidence directly relevant to answering the QUESTION.
    2. Output ONLY those spans, copied verbatim from the source. Do not paraphrase,
    summarize, or rewrite.
    3. Preserve chunk identifiers so the downstream system can cite sources.
    4. If a chunk contains no relevant evidence, output the chunk identifier
    followed by NO_RELEVANT_EVIDENCE.
    
    Output format (strict):
    [CHUNK_ID: <id>]
    <verbatim span 1>
    <verbatim span 2>
    [CHUNK_ID: <id>]
    NO_RELEVANT_EVIDENCE
    
    Do not add commentary, headings, conclusions, or your own words. Only verbatim
    spans from the source chunks, grouped by chunk identifier."""

### The Lambda function

The function takes the user query and the retrieved chunks, reads the two model IDs from environment variables, and initializes an Amazon Bedrock Runtime client configured with adaptive retries. It then makes two calls through the Bedrock Converse API: the first to the smaller model to compress the chunks, and the second to the primary model to generate the answer from the compressed evidence. The compression call runs at temperature 0.0, which keeps the extraction deterministic so the smaller model copies spans as they appear in the source:

Step 1: Compress. The smaller model filters the retrieved chunks.
    
    
    compressed = bedrock.converse(
        modelId=COMPRESSION_MODEL_ID,
        system=[{"text": COMPRESSION_SYSTEM_PROMPT}],
        messages=[{"role": "user",
                   "content": [{"text": f"QUESTION:\n{query}\n\nCHUNKS:\n{chunks}"}]}],
        inferenceConfig={"temperature": 0.0},
    )

Step 2: Answer. The primary model reasons over the filtered evidence.
    
    
    answer = bedrock.converse(
        modelId=ANSWER_MODEL_ID,
        system=[{"text": "Answer using only the evidence provided. Cite sources."}],
        messages=[{"role": "user",
                   "content": [{"text": f"QUESTION:\n{query}\n\nEVIDENCE:\n{compressed}"}]}],
    )

**Note:** The prompts are an example and should be adapted to your documents and question types.

## Methodology

Before recommending this pattern, we evaluated it empirically. The benchmark covered:

  * A corpus of more than 500,000 documents spanning 9 enterprise source types, including chat messages, email, issue-tracker tickets, shared-drive documents, CRM records, meeting transcripts, code repositories, and wiki pages.
  * A set of 500 questions across 10 categories, ranging from narrow factual lookups to broader multi-part questions, including both precisely worded and more informally phrased queries.
  * Multiple compression conditions: no compression (baseline), compression, and rerank-plus-compression.
  * Each query run through baseline and optimized pipelines, with answers scored by a [large language model](<https://aws.amazon.com/what-is/large-language-model/>) (LLM) judge.
  * Quality scoring across four dimensions (correctness, completeness, citation accuracy, and conciseness) against a reference answer. Faithfulness was tracked separately, checking each answer’s claims against the evidence the primary model received.



These figures describe one corpus, one domain, and one query distribution. Results on your own documents and queries will differ.

## Results

The following table summarizes the headline results across the queries, comparing the baseline, compression, and rerank + compression pipelines.

**Metric** | **Baseline** | **Compression** | **Rerank + Compression**  
---|---|---|---  
**Cost** | 100% (ref) | 67% | 64%  
**Tokens to model** | 100% (ref) | 12% | 10%  
**Latency** | 0% (ref) | +19% (slower) | +12% (slower)  
**Quality (composite, 4 dims)** | 100% (ref) | 97.5% | 97.6%  
**Hallucination rate** | 51% | −7 pts | −13 pts  
  
The following figures come from the benchmark. Results on your own corpus, queries, and model choices will differ. The following figure shows the average of query cost saving (left axis, percentage versus baseline) and the reduction in context sent to the primary model (right axis, times fewer tokens). Compression achieved a 33 percent cost saving or 8.6× fewer tokens. Rerank + compression reached 36 percent cost saving and 10.1× fewer tokens.

  
Figure 2: Cost savings and reduction in context tokens sent to the primary model

The following figure shows the LLM-judge scores (1–5) across the four answer-quality dimensions for each pipeline. Correctness stays within 0.07 of baseline across conditions. Completeness and citation accuracy are slightly lower under compression, while conciseness is slightly higher.

  
Figure 3: LLM-judge scores across the 4 answer-quality dimensions by pipeline

The following figure shows the hallucination rate for each pipeline, measured as the share of answers containing at least one claim not supported by the reference. The baseline is 51 percent, compression 44 percent, and rerank + compression 38 percent.

  
Figure 4: Hallucination rate by pipeline

The following figure shows the cost saving versus baseline for the typical-query set and the hard-query set. Compression moves from 37 percent to 26 percent, and rerank + compression from 40 percent to 30 percent between the two sets.

  
Figure 5: Cost savings for the typical-query and hard-query sets

## Considerations for production use

Three things must be weighed before this pattern is adopted: the latency of the added compression call, the impact on answer quality, and whether the workload is a fit. Each is covered in the following sections.

### Latency

Adding a smaller-model call introduces one extra step in the path. Claude Haiku is optimized for speed, and because the primary model then processes a smaller, focused context, part of that added time is recovered on the answer call. The total end-to-end latency is the compression call plus the answer call on the focused context. Net impact depends on how compute-bound the primary model is on the original context size.

For latency-critical surfaces (sub-second chat), measure with your own context sizes before deploying.

### Quality

Compression involves a few factors worth deliberate engineering.

**Dimension** | **Design consideration** | **How the pattern handles it**  
---|---|---  
Factual consistency | The primary model should receive all the evidence it needs | The prompt instructs faithful, verbatim extraction of all query-relevant evidence  
Citation preservation | Spans stay tied to their source chunk | `[CHUNK_ID: <id>]` markers carried through the prompt  
Faithful extraction | Output stays verbatim from the source | `temperature=0.0`, “verbatim only” instruction, optional post-hoc span validation  
Multi-step reasoning | Evidence chains stay intact for analytical questions | The compression model preserves more spans when the question draws on multiple sources  
Numerical reasoning | Specific numbers are retained | The “verbatim only” instruction preserves numbers and calculations as they appear in the source  
  
### Choosing the smaller model

A few considerations can help guide the selection of the smaller model:

  * **Relative pricing.** The savings of this pattern depend on the price ratio between the smaller model and the primary model. A lower relative price for the smaller model leaves more room for net savings once the cost of the compression call is included. Amazon Bedrock model families span a range of price points, with current rates available on the [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>) page.
  * **Inference speed.** The compression call is added to the request path, so a smaller model optimized for fast inference limits the additional latency.
  * **Model-family alignment.** Selecting the smaller and primary models from the same family keeps formatting, chunk markers, and instruction handling consistent across both calls. Claude Haiku with Claude Sonnet, and Amazon Nova Micro with Amazon Nova Pro, are examples of such pairings on Amazon Bedrock. For model availability by Region, refer to [Supported models by AWS Region in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html>).



### Recommended evaluation approach before deploying

  * Assemble an evaluation set of representative queries from your application logs (de-identified), covering both narrow lookups and broader multi-fact questions in the proportion they occur in production.
  * Run the baseline and compressed pipelines on the same retrieval results, so the comparison reflects only the effect of compression.
  * Score both sets of answers on the dimensions that matter for the workload, such as correctness, completeness, and citation accuracy against a reference answer, along with faithfulness against the evidence the primary model received, which surfaces claims not supported by that evidence.
  * Set acceptance thresholds that fit the workload, and promote the configuration after it meets them.



For production deployments, [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) can provide additional content filtering and grounding validation as complementary controls alongside the compression pattern.

### Where this pattern fits well

The pattern provides value when three conditions line up. Retrieved context is large, the primary model is the expensive part of the call, and the question is narrow relative to the breadth of what was retrieved. The following scenarios share these characteristics.

  * **Regulated-industry compliance and policy assistants.** Utilities, financial services, insurance, and healthcare keep long bulletins, tariffs, and policy documents where a single section answers most questions. Retrieval pulls whole bulletins (8,000–15,000 tokens) but the analyst needs one clause. Verbatim extraction preserves the exact regulatory wording and the source ID, which matters when the answer has to be defensible in an audit.
  * **Customer-support copilots over a large product knowledge base.** Top-k is set high so the assistant is less likely to miss an edge case, meaning most tickets retrieve far more than they need. A “how do I reset X” or “what’s the fee for Y” ticket usually resolves from one or two paragraphs buried in a long article. Compression cuts the per-ticket inference cost without touching the retrieval strategy support engineers already trust. At support volumes (hundreds of thousands of tickets a month), small per-query savings accumulate quickly.
  * **Internal engineering and operations assistants over runbooks and wikis.** Confluence, SharePoint, and runbook RAG retrieves large chunks because internal docs are verbose and loosely structured. Questions are usually specific (“which IAM role does service Z assume”, “what’s the rollback step for migration N”). The answer is a few lines. The surrounding policy and background is not needed for the response.
  * **Financial research and earnings-call analysis.** Retrieved chunks are dense (10-K sections, transcript paragraphs) and questions are pointed (“what did the CFO say about FX exposure in Q3”). Compression preserves the analyst’s ability to quote the source verbatim while reducing the per-query cost on the larger model.



This pattern is likely worth a prototype if most of these are true for your workload:

  * Average retrieved context per query exceeds roughly 5,000 tokens.
  * The primary model’s input tokens are expensive enough that a 3–10× reduction in context is material.
  * Most questions are narrow relative to the volume retrieved, rather than broad “summarize everything” requests.
  * Your latency budget can absorb one extra model call (a few hundred milliseconds to approximately 1 second).
  * You have, or can build, an evaluation set to compare quality before and after.



If your workload is sub-second conversational chat with small retrieved context, this pattern may not be the best fit. Consider Amazon Bedrock features like prompt caching and Intelligent Prompt Routing, which provide more value with less added latency.

## Conclusion

The pattern fits into RAG pipelines built on Amazon Bedrock: A single Lambda function between retrieval and the final model call compresses context and fine-tunes cost and quality for your specific workload.

The compression prompt handles both simple lookups and complex multi-source questions without requiring separate routing logic. Combined with existing features like prompt caching, Intelligent Prompt Routing, and the Rerank API, this approach delivers compounding optimizations across the full RAG pipeline.

You can use this pattern behind a feature flag, measure it on your real query distribution, and tune the compression prompts to match your domain.

To get started, refer to the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>) and the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>) for current model costs.

* * *

## About the authors

### Aakanksha Veesam

Aakanksha is a Delivery Consultant and AI/ML Engineer at Amazon Web Services (AWS) Professional Services, based in Dallas, Texas. She specializes in designing and building production machine learning and generative AI solutions for enterprise customers, helping organizations operationalize scalable, fit-for-purpose AI systems on AWS.

### Amit Maindola

Amit is a Senior Data Architect with AWS ProServe team focused on data engineering, analytics, and AI/ML at Amazon Web Services. He helps customers in their digital transformation journey and enables them to build highly scalable, robust, and secure cloud-based analytical solutions on AWS to gain timely insights and make critical business decisions.
