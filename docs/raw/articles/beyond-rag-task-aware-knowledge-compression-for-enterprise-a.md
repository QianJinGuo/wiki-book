---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/beyond-rag-task-aware-knowledge-compression-for-enterprise-ai-on-aws
ingested: 2026-07-28
feed_name: AWS China ML
source_published: 2026-07-27
sha256: fbfa4f309b40ea452fa6cf25583ccdc3a251aa95baead25cfd1a423adc67bcf1
---

# Beyond RAG: Task-aware knowledge compression for enterprise AI on AWS

If you’re using [Retrieval-Augmented Generation]() (RAG) for complex analytical tasks that span hundreds of documents, such as financial due diligence or regulatory compliance reviews, you’ve likely hit its ceiling. Similarity search surfaces relevant fragments but often misses cross-document connections. This post shows you how to address that gap using task-aware knowledge compression (TAKC), a technique that pre-compresses entire knowledge bases into task-specific representations deployed on AWS. You can deploy a complete open-source implementation in your own account.  
  
## Task-aware knowledge compression

Consider a private equity firm evaluating a $500 million acquisition of a manufacturing company. The due diligence team must analyze financial statements spanning 12 subsidiaries and 5 years. They also face 200+ supplier contracts, environmental compliance reports from 8 facilities, and 50+ legal cases. When an analyst asks about consolidated financial risks given current supplier terms and pending litigation, RAG’s similarity search cannot surface that response. Hundreds of documents hold the relevant information, and the connections between them share no lexical similarity.

TAKC addresses this type of problem by using an LLM to produce shorter, task-focused summaries of documents, with different summaries for different tasks.

Different tasks require different information from the same document. An annual report compressed for financial analysis needs revenue figures, margins, and cash flow data. The same report compressed for a compliance review needs regulatory citations and violation histories. Generic summarization attempts to cover everything, which dilutes the information density for any specific use case. TAKC compresses documents through the lens of a specific task, keeping what matters and discarding the rest. The Ingestion pipeline section shows how the compression prompt specifies exactly what information to preserve. For production deployments, store task-type prompts in a versioned configuration (such as AWS Systems Manager Parameter Store or a dedicated Amazon Simple Storage Service (Amazon S3) prefix) so that prompt changes are auditable and recompression can be triggered when prompts are updated.

The system compresses documents offline, once per document per task type. At query time, the system retrieves a pre-compressed representation rather than the original document. The system then answers questions using the compressed version instead of the full document. If the compressed representation lacks sufficient detail, the query complexity analyzer routes the question to a lower compression tier that retains more context.

TAKC provides access to the _entire_ knowledge base in compressed form, not just the top-k chunks that a similarity search returns. The system preserves connections between documents because the compression sees documents together. It also produces different compressed outputs for different tasks from the same source material. The financial compression of a 10-K filing looks nothing like the legal risk compression of that same filing. The compression reduces token count by 8x to 64x while targeting task-relevant information for retention.

## Multi-rate compression

Different queries require different levels of fidelity. A question such as “What was Q3 revenue?” needs far less context than a request to analyze relationships between supplier payment terms and quarterly cash flow across subsidiaries.

TAKC addresses this by maintaining four compression tiers for each task type. At the lightest compression (8x), the system retains approximately 87.5% less context. It preserves enough detail for multi-step reasoning and cross-document synthesis. At the medium tier (16x), context reduction reaches approximately 93.8%. This level suits analytical queries with moderate complexity. The high tier (32x) reduces context by approximately 96.9% and serves factual lookups and well-defined questions. At the ultra tier (64x), reduction reaches approximately 98.4%. This level is appropriate for classification tasks and keyword lookups.

A query complexity analyzer routes incoming questions to the appropriate tier based on signals like query length, question type, and presence of analytical language. Straightforward factual questions hit the ultra-compressed cache while complex analytical questions use the lightly compressed cache. This happens transparently to the user.

Most enterprise queries are lookups that can be served from the higher compression tiers at minimal cost. The infrequent complex queries consume larger context budgets only when needed. This tier-based routing complements existing RAG optimizations like metadata filtering and query reformatting, which can narrow the document set before compression is applied. To validate compression quality, compare LLM responses at each tier against responses generated from the full uncompressed document. The reference implementation includes test scripts that run this comparison for your specific task types and documents.

## Architecture on AWS

The implementation runs on AWS as two decoupled serverless pipelines: one for ingestion and one for queries. Figure 1 illustrates both pipelines.

TAKC architecture. The pipeline flow handles data ingestion and compression. The user flow handles authenticated queries

We chose [AWS Lambda]() for compute because each function invocation is short-lived and event-driven. The workload processes data in bursts during ingestion and handles variable query loads between bursts, making serverless a natural fit.

We chose [Amazon API Gateway]() to expose the query interface as a REST endpoint. For caching, we chose [Amazon ElastiCache Serverless]() for reads on composite keys (`takc:{task}:{rate}`) without shard management. [Amazon Cognito]() handles JWT issuance and token refresh without custom auth code, reducing the implementation surface area.

### Ingestion pipeline

When a document lands in Amazon S3 under a task-type prefix (for example, `raw-data/financial/`), an [S3 event notification]() triggers an AWS Lambda function. This function chunks the document into 256-token segments with 50-token overlap to prevent information loss at boundaries. It then invokes a compression Lambda function for each chunk asynchronously, enabling parallel processing. For large-scale ingestion, configure reserved concurrency on the compression function and place an Amazon Simple Queue Service (Amazon SQS) queue between the chunking and compression steps to handle throttling gracefully.

The second function calls [Amazon Bedrock]() to compress the chunks at all four compression tiers. Each compression call includes a task-aware [prompt]() that tells the model what information to preserve:
    
    
    TASK: Financial analysis. Preserve revenue metrics, margins, cash flow, debt obligations, and financial risk indicators.
    COMPRESSION TARGET: Reduce to approximately 1/16 of original length.
    INSTRUCTIONS:
    - Focus on facts and relationships relevant to the task
    - Preserve numerical data and metrics
    - Maintain entities and their attributes
    - Keep causal relationships and dependencies
    - Remove redundant or irrelevant information

The model knows what to preserve because the prompt specifies what matters for the task. That distinction is what makes this task-aware rather than generic compression. The system stores compressed outputs in [Amazon ElastiCache Serverless]() with keys like `takc:financial:medium`, and backs them up to S3 for durability. The Redis OSS data model supports the hierarchical key structure needed for multi-rate cache lookups. Cache entries use a 24-hour TTL and are backed up to S3. If a cache entry is evicted or expires, the query function falls back to the S3 backup and re-populates the cache on read.

### Query pipeline

A user authenticates through [Amazon Cognito](), receives a [JWT](), and sends a query through [Amazon API Gateway](). [AWS WAF]() fronts the API for rate limiting and threat protection. A Lambda function analyzes query complexity using heuristics (keyword signals and query length), retrieves the appropriate compressed cache from Amazon ElastiCache Serverless, and sends the compressed context plus query to Amazon Bedrock for inference. When routing confidence is low, the system defaults to the medium compression tier as a safe fallback.

The higher-cost Bedrock compression calls happen once during ingestion. The query path is a cache lookup plus inference on compressed context.

The stack uses Amazon Bedrock (Anthropic Claude 3 Haiku, Claude 3 Sonnet, and Amazon Titan Text) for compression and [inference](). The model selection is configurable through CDK context values without code changes. AWS Lambda (Python 3.12+) handles data processing and query logic. Amazon ElastiCache Serverless stores the compressed cache, while Amazon S3 holds raw data, chunks, and cache backups ([KMS-encrypted]()). Amazon API Gateway exposes the REST endpoints, and Amazon Cognito provides [JWT-based authentication](). AWS WAF fronts the API with [rate limiting]() and managed security rules. [Amazon CloudWatch]() provides monitoring and metrics, and [AWS Key Management Service (AWS KMS)]() manages encryption keys.

Define the infrastructure as a single [AWS Cloud Development Kit (AWS CDK)]() stack and deploy it with a single command. AWS CDK provides repeatable deployments and lets you customize parameters like compression chunk size, Lambda memory allocation, and ElastiCache storage limits through context values. For production deployments, consider separating stateful resources (S3, ElastiCache, Cognito) into their own stack to reduce blast radius and enable independent lifecycle management of compute and storage layers.

### Cost comparison

Input token usage for a 100,000-token knowledge base queried 1,000 times per day (output tokens are excluded because response length is independent of context size):

**Approach** | **Input tokens per query** | **Daily input tokens** | **Relative input cost**  
---|---|---|---  
Full context | 100,000 | 100,000,000 | 100%  
RAG (top-10 chunks) | ~10,000 | 10,000,000 | 10%  
TAKC Light (8×) | ~12,500 | 12,500,000 | 12.5%  
TAKC Medium (16×) | ~6,250 | 6,250,000 | 6.25%  
TAKC High (32×) | ~3,125 | 3,125,000 | 3.1%  
TAKC Ultra (64×) | ~1,563 | 1,563,000 | 1.6%  
  
The token savings from compression are derived directly from the compression ratios. Actual savings depend on your specific Bedrock model pricing and query patterns.

TAKC requires upfront compression cost through one-time Bedrock calls during ingestion. This cost amortizes for knowledge bases that change infrequently and get queried repeatedly. For knowledge bases that change hourly, RAG’s per-query retrieval model may be more practical.

## When to choose TAKC, RAG, or both

This table summarizes when each approach is the better fit, based on your workload characteristics:

**Factor** | **Favors TAKC** | **Favors RAG**  
---|---|---  
Query type | Cross-document reasoning, synthesis | Narrow factual lookups  
Knowledge base stability | Changes daily or less | Changes hourly or more  
Task predictability | Well-defined task types | Unpredictable query patterns  
Coverage requirement | Must consider full corpus | Only a few documents are relevant  
Source attribution | Not required | Required (user needs to see source)  
Token budget | Tight | Flexible  
  
In practice, a production system often benefits from both. RAG handles quick lookups efficiently. TAKC handles the analytical queries where retrieval-based approaches miss connections. A query complexity analyzer can route between them. Use RAG when users need to trace responses back to specific source documents. For regulated workloads that require both cross-document reasoning and auditability, combine TAKC with RAG: use TAKC for the analytical response and RAG to retrieve the supporting source documents for the audit trail.

## Getting started

### Prerequisites

To deploy this reference implementation, check that you have the following:

  * An AWS account with [Amazon Bedrock]() model access.
  * [AWS CDK CLI]().
  * Python 3.12 or later.
  * Node.js 18 or later.



### Deploy and test

Clone the repository [aws-samples/sample-bedrock-takc-compression]() and deploy the CDK stack:
    
    
    git clone https://github.com/aws-samples/sample-bedrock-takc-compression
    cd sample-bedrock-takc-compression/cdk
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cdk deploy

After deployment completes, test the pipeline:

  1. Upload a document to the S3 bucket: 
         
         aws s3 cp your-document.pdf s3://$(aws cloudformation describe-stacks --stack-name TakcStack \
           --query 'Stacks[0].Outputs[?OutputKey==`DataBucketName`].OutputValue' \
           --output text)/raw-data/financial/

  2. Wait 2-3 minutes for the ingestion pipeline to chunk and compress the document at all four compression tiers.
  3. Query the API endpoint: 
         
         curl -X POST $(aws cloudformation describe-stacks --stack-name TakcStack \
           --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
           --output text)/query \
           -H "Authorization: Bearer $TOKEN" \
           -H "Content-Type: application/json" \
           -d '{"question": "What are the key financial risks?"}'




The system handles chunking, multi-rate compression, caching, and query routing without additional configuration.

### Clean up

To avoid ongoing charges, destroy the CDK stack when you’re done testing. First, empty the S3 bucket because CDK cannot delete buckets that contain objects:
    
    
    aws s3 rm s3://$(aws cloudformation describe-stacks --stack-name TakcStack \
      --query 'Stacks[0].Outputs[?OutputKey==`DataBucketName`].OutputValue' \
      --output text) --recursive

Then destroy the stack:
    
    
    cd sample-bedrock-takc-compression/cdk
    source .venv/bin/activate
    cdk destroy

This removes the Lambda functions, API Gateway, Amazon ElastiCache Serverless cache, Amazon Cognito user pool, WAF web ACL, and Amazon CloudWatch alarms. The KMS key is retained with a 30-day pending deletion window. To schedule its deletion immediately, run the following command:
    
    
    aws kms schedule-key-deletion --key-id <key-id> --pending-window-in-days 7

## Conclusion

Complex analytical tasks that span hundreds of documents require more than fragment retrieval. TAKC offers an approach built for this. Compress the full knowledge base offline through the lens of specific tasks, cache those representations at multiple fidelity levels, and match the right compression tier to each query’s complexity.

The AWS implementation uses Amazon Bedrock for compression and inference, Amazon ElastiCache Serverless for caching, and a fully serverless architecture that scales with demand. Access the reference implementation, CDK infrastructure, and deployment scripts at [aws-samples/sample-bedrock-takc-compression]().

To get started, deploy the CDK stack with your own documents and see how the system responds to different query types. If your workload involves cross-document reasoning over stable knowledge bases, TAKC can reduce token costs while improving response quality.

## References

  * [Amazon Bedrock Documentation]()
  * [Amazon ElastiCache Serverless Documentation]()
  * [Amazon Bedrock prompt engineering guidelines]()



 

* * *

## About the authors

### Dhananjay Karanjkar

Dhananjay is a Senior Lead Consultant at AWS Professional Services, specializing in agentic AI systems, multi-agent orchestration, and generative AI security. He holds two US patents and serves as a Responsible AI Champion, with a background spanning financial services, enterprise consulting, and enterprise-scale AI delivery. When not architecting AI solutions, he trains for triathlons, paints oil portraits, and reads voraciously.

### Sanjay Chaudhari

Sanjay is a Lead Consultant in AWS Professional Services, where he helps customers migrate and modernize their .NET workloads on AWS. He is deeply interested in the evolving landscape of Agentic AI and its potential to transform enterprise workflows. Outside of work, he enjoys travelling and exploring different cuisines.

### Rajeshkumar Kagathara

Rajeshkumar is a Lead Consultant with AWS Professional Services. He helps customers architect, modernize, and deliver scalable cloud-native solutions using AWS services, Java, and Spring Boot. Rajesh is passionate about cloud transformation, enterprise application modernization, and engineering excellence through secure, high-performing architectures. Outside of work, he enjoys playing indoor games and traveling.
