---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-yahoo-enhances-search-retargeting-using-amazon-bedrock
ingested: 2026-07-31
feed_name: AWS China ML
source_published: 2026-07-30
sha256: 6e8a7302ba07dc38ab5a3aa27d1b65134a76f0e3e4fd29262f29b164a7f218db
---

# How Yahoo enhances search retargeting using Amazon Bedrock

Connecting user search intent with relevant ad experiences across channels is a longstanding challenge in digital advertising. Advertisers need sophisticated ways to reach audiences based on their demonstrated interests and behaviors, particularly their search activity, which is one of the strongest signals of user intent. Traditional keyword expansion approaches often struggle with outdated vocabulary, limited semantic understanding, and inability to capture the nuanced meaning behind search queries.

The [Yahoo](<https://www.yahooinc.com/>) omnichannel Demand-Side Platform (DSP) addresses these challenges by providing advertisers with advanced technology, premium supply access, vast scale, and trusted consumer relationships. A DSP lets advertisers purchase ad inventory across multiple exchanges and channels through a single interface. Yahoo DSP enhances this capability with sophisticated audience targeting powered by advertiser-defined rules, machine learning (ML), and generative AI.

At the heart of this targeting is the concept of an audience segment: a group of users who share specific interests, demographics, or behaviors and can be targeted collectively in advertising campaigns. These segments are passed to targeting systems for ad serving, making sure that users are matched with the most relevant advertiser campaigns.

In this post, we demonstrate how Yahoo implemented [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) to enhance their Search Retargeting (SRT) capabilities in the Yahoo DSP ad tech suite. SRT is a core audience targeting solution that helps advertisers reach users based on their historical search behavior, bridging search intent with display, video, and native advertising. Beyond targeting keywords entered on Yahoo Search, SRT uses AI to identify and engage users who demonstrate intent through search activity both on Yahoo and across integrated partner systems.

## Business challenges

Previously, the Yahoo SRT architecture used the Word2Vec embedding model combined with locality-sensitive hashing (LSH) to expand advertiser keywords. This multi-step process involved canonicalizing keywords, generating embeddings, indexing them, performing LSH searches, filtering sensitive terms, and ranking the results.

However, the Word2Vec + LSH approach had several limitations:

  * **Outdated vocabulary** : It didn’t always reflect current terms.
  * **Phrase-based searches** : It focused on phrases rather than specific entities.
  * **Syntactic similarity** : Expansion relied on syntactic rather than semantic meaning.
  * **Zero expansion** : In some cases, it failed to generate any new keywords.



We addressed these challenges by deploying generative AI–powered SRT keyword expansion using Amazon Bedrock and large language models (LLMs). This enhancement generates more relevant, semantically rich keyword expansions, helping advertisers reach larger and more precise audiences.

## Solution overview

Before introducing the solution, it’s useful to review the legacy SRT workflow, illustrated in the following diagram. Advertisers begin by defining each segment through a set of target keywords. This metadata is stored in a SQL database. The backend system then performs keyword expansion, generating semantically related terms to increase audience reach and improve advertiser outcomes. Both the original and expanded keyword sets are persisted in an [Amazon OpenSearch Service](<https://aws.amazon.com/opensearch-service/>) cluster. Another workflow called Batch Scoring evaluates Yahoo users’ search histories against this segment metadata to determine segment membership.

## Modernized with generative AI

Recognizing the limitations of the legacy approach, our goal was to refresh keyword expansion with a modern generative AI solution. Amazon Bedrock made this work possible. By offering serverless access to a broad selection of leading foundation models (FMs), Amazon Bedrock helped our teams experiment with multiple LLMs, including Amazon Nova, Meta Llama, and Anthropic’s Claude, without building custom infrastructure.

In evaluating new approaches, we also factored in critical considerations for computational advertising, including:

  * Filtering of sensitive keywords.
  * Segment denylists.
  * User privacy preferences.
  * Policy compliance requirements.



The following diagram illustrates the updated architecture using Amazon Bedrock and generative AI.

## LLM selection and results

During the LLM selection and evaluation process, we prototyped and assessed several models using [Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker/ai/studio/>), including Amazon Titan, Meta Llama, and Anthropic’s Claude. Ultimately, Anthropic’s Claude 3.5 Sonnet v2 was selected as the most effective model for search keyword expansion, balancing both expansion ratio and semantic similarity.

In the evaluation process, we observed hallucination behaviors from the LLMs. To reduce hallucinations and maintain quality, we introduced a verification step. Expanded keywords generated by the LLM are converted into embeddings and compared with the original set. Keywords falling below a similarity threshold are filtered out, making sure only the most relevant terms are retained. This validation step is central to maintaining accuracy and trust in the workflow.

When deployed through Amazon Bedrock, Claude 3.5 Sonnet v2 demonstrated substantially superior expansion capabilities compared to the legacy LSH method, frequently generating hundreds or even thousands of keywords in cases where LSH produced none. The median broad expansion ratio improved fivefold, and the maximum expansion ratio doubled, even under strict similarity thresholds. See the following graph.

Overall, generative AI–based keyword expansion increases the number of keywords retrieved and makes sure they are semantically relevant, significantly enhancing search user targeting.

_LLM keyword expansion ratio vs.  cosine similarity score._

### Guardrailing keyword expansion in generative AI workflows

When we first designed our SRT keyword expansion workflow, we focused solely on the expansion step, taking seed keywords and generating a broader set of related terms using generative AI models. This approach worked, but it also introduced challenges:

  * In some cases, the model over-expanded, producing a large set of keywords.
  * Rare or ambiguous seed keywords sometimes resulted in unrelated or noisy expansions.



This highlighted the need for a quality control mechanism. To address this, we introduced embedding generation and similarity scoring:

  1. Embedding and similarity check. 
     * For each expanded keyword, we generate an embedding.
     * We then compute a similarity score against the original keyword’s embedding.
     * Only keywords above a defined similarity threshold are retained.
     * This makes sure that expanded keywords remain semantically aligned with the original intent.
  2. Sensitive keyword guardrails. 
     * In addition to semantic filtering, we also apply checks for sensitive keywords.
     * Filtering happens before inference (to avoid expansion of undesirable terms) and after inference (to remove sensitive expansions).



By combining semantic similarity scoring with sensitive keyword filtering, we created a guardrailed keyword expansion pipeline. This approach preserves the breadth and creativity of generative AI–driven expansion while maintaining relevance, quality, and compliance.

## Business value and impact

This generative AI–based enhanced keyword expansion capability launched in production in Q1 2025.

### Value to advertisers

Advertisers benefit from significantly broader and more precise audience reach. The LLM-powered expansion logic increases the pool of candidate keywords while filtering for quality, leading to campaigns that align more closely with user intent. This translates into higher relevancy, stronger engagement, and improved conversion rates.

### Value to Yahoo DSP

From a system perspective, the new system delivers substantial scale improvements:

  * Up to 600 times increase in keyword expansion rates.
  * Up to 5 times growth in addressable audience reach.
  * Gains in campaign performance and conversions.



By modernizing keyword expansion with LLMs, Yahoo DSP is better positioned to drive value for advertisers while strengthening its competitive edge in the programmatic environment.

## Why Amazon Bedrock

Amazon Bedrock provided serverless access to multiple leading FMs, including Amazon Nova, Meta Llama, and Anthropic’s Claude, without requiring the Yahoo team to build or manage complex infrastructure. This capability helped us experiment rapidly, scale our workloads, and deploy flexibly.

  * **Breadth of models** – Amazon Bedrock helped us experiment quickly with multiple leading FMs.
  * **No infrastructure management** – Amazon Bedrock provides serverless access to LLMs, removing the need for model hosting, scaling, or patching.
  * **Flexible inference options** – Amazon Bedrock provides both batch and real-time inference options for quick and flexible prototyping and decision making.
  * **Straightforward model upgrades with Amazon Bedrock** – Switching to a newer or more advanced model version is a configuration change. Amazon Bedrock’s architecture abstracts away the underlying infrastructure and compatibility challenges, so teams can adopt updated models with minimal effort.



## Conclusion

In this post, we highlighted how SRT serves as a core product offering on Yahoo DSP and how we transformed keyword expansion using generative AI. By using Amazon Bedrock, our teams gained serverless access to multiple leading LLMs without the overhead of managing infrastructure. This capability helped us expand advertisers’ original keywords into semantically rich, high-quality sets, increasing both the size and precision of the targeting audience.

Replacing the legacy Word2Vec and LSH workflow with Amazon Bedrock–powered LLMs delivered more accurate, contextually relevant keyword expansions. The new approach drives stronger campaign performance, higher conversion rates, and greater operational flexibility. Amazon Bedrock made this transformation possible, helping Yahoo DSP scale faster and more efficiently in AI-driven advertising.

To learn more, see the [Amazon Bedrock detail page](<https://aws.amazon.com/bedrock/>) and the [Amazon Bedrock User Guide](<https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html>). To start building, open the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>).

* * *

## About the authors

### Jessica Young

Jessica is a Director of Software Engineering at Yahoo, where she leads engineering teams building AI/ML solutions on large-scale distributed systems. She brings extensive hands-on experience building production AI/ML systems, with deep expertise in natural language processing, recommendation engines, and Big Data ecosystems. She is equally passionate about understanding machines and understanding people, driven by a deep curiosity for emerging technologies while remaining committed to fostering a people-first culture that values individuals not merely as resources, but as human beings.

### Sujyothi Adiga

Sujyothi is a Principal Software Development Engineer at Yahoo, with engineering experience across Yahoo Small Business, Search, and Yahoo Ads. She builds machine learning and AI-driven solutions for contextual and audience-based ad targeting systems, focusing on large-scale content understanding. Her work spans generative AI, model distillation, and distributed data pipelines using AWS services, including Amazon EMR, Amazon Bedrock, and Amazon SageMaker. She has helped architect end-to-end contextual targeting solutions for Yahoo Ads and has contributed to patent filings and peer-reviewed machine learning research in multilingual content classification.

### Jonathan Ji

Jonathan is a Principal Software Engineer at Yahoo DSP, where he leads teams that design, research, and build agentic AI assistant and search products. He partners closely with product, science, and engineering leaders to take generative AI from prototype to production. At Yahoo, he has developed innovative products and services powered by generative AI agents, large language models, MCP tools, text and image search, machine learning, sketch estimation, and large-scale processing and distributed query platforms.

### Daniel Li

Daniel is a Senior Solutions Architect at Amazon Web Services, where he partners with strategic customers to design scalable cloud, data, and generative AI solutions. With over 20 years of experience spanning engineering and enterprise strategy, Daniel has led major cloud migration, modernization, and AI/ML initiatives, helping customers translate business goals into pragmatic technology roadmaps and accelerate their adoption of generative AI on AWS.
