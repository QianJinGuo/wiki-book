---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-enterprise-search-for-agents-with-amazon-bedrock-managed-knowledge-base
ingested: 2026-07-23
feed_name: AWS China ML
source_published: 2026-07-16
sha256: 74fa6bf82fb698a1154b1113ceaf46e8e632b67c971d93156a4bc69d8b7ff028
---

# Build enterprise search for agents with Amazon Bedrock Managed Knowledge Base

Knowledge bases that ground agents and generative AI applications over your enterprise data are hard to build at scale. Teams typically stitch together connectors, parsers, vector stores, knowledge graphs, and retrieval logic, then operationalize all of it for production. Each piece brings its own challenges. You must decide which data sources to connect and how to parse multimodal document types. You must choose between graph and vector databases, then provision and scale them. You must also handle complex queries that reason across diverse content, and layer on the document-level access control, observability, and security that production demands.

[Amazon Bedrock](<https://aws.amazon.com/bedrock/>) now offers [Managed Knowledge Base](<https://aws.amazon.com/bedrock/knowledge-bases/>) in general availability, a fully managed agentic retrieval solution that handles scaling, high-accuracy retrieval, and document access control on your behalf. You can connect your enterprise data sources or crawl the web and start ingesting. Getting started through the [AWS Management Console](<https://console.aws.amazon.com/>) requires no model selection. Sensible defaults take you from zero to your first retrieval in minutes, compared to the days or weeks typically needed to assemble a comparable pipeline from scratch. When you’re ready to customize, you have control over embedding models, rerankers, chunking strategies, and more.

In this post, we walk through the three pillars that make this possible: simplified setup, smarter retrieval, and production readiness. We also show you [code examples](<https://github.com/aws-samples/amazon-bedrock-samples/blob/main/rag/managed-knowledge-bases/03-use-case-example/01-end-to-end-example-with-ac-gateway/01-bmkb-with-agentcore-gateway.ipynb>) for setting up a knowledge base and retrieving from it.

## Simplified setup

Developers today typically procure and build data ingestion pipelines, vector or graph storage, and retrieval infrastructure separately. This means managing separate infrastructure, separate billing models, separate rate limits, and the complexity of piecing it all together into a coherent pipeline.

Managed Knowledge Base abstracts this complexity away. You configure a knowledge base, and the service handles everything downstream, from ingesting enterprise data through native connectors to managing vector stores on your behalf.

### Native enterprise connectors with ACL support

Managed Knowledge Base includes six native connectors ([Amazon Simple Storage Service](<https://aws.amazon.com/s3/>) (Amazon S3), [Microsoft SharePoint](<https://www.microsoft.com/en-us/microsoft-365/sharepoint/collaboration>), [Atlassian Confluence](<https://www.atlassian.com/software/confluence>), [Google Drive](<https://workspace.google.com/products/drive/>), [Microsoft OneDrive](<https://www.microsoft.com/en-us/microsoft-365/onedrive/online-cloud-storage>), and Web Crawler). It also includes a direct ingestion API for documents that don’t live in a supported source. On subsequent syncs, the service processes only modified or new documents, reducing time, cost, and staleness.

Managed Knowledge Base uses real-time access control list (ACL) checks as an additional layer of security on top of existing pre-retrieval ACL filtering. The pre-filtered documents are transient for the life of the API call and are not visible to large language models (LLMs) or users. This maintains current access controls by checking permissions directly with the authoritative source at query time, rather than relying on potentially stale or incorrectly mapped ACL data.

> _**Syngenta Group** uses Bedrock Managed Knowledge Bases to enable employees to create knowledge bases on demand, syncing data from SharePoint and Confluence for internal knowledge search and agentic RAG applications._  
>  _  – Jason Krohn, Head of Data and AI Technology_
> 
> _**MRH  Trowe** is using Bedrock Managed Knowledge Bases to power an internal AI Copilot that gives employees instant, grounded answers from across our corporate knowledge base — spanning thousands of documents in Confluence and SharePoint, in both English and German. With native connectors and built-in access controls, our teams can search across policies, client documentation, and operational content without building custom retrieval pipelines — accelerating how our employees access the knowledge they need to serve clients.  
>  – Dr. Malte Polley, Teamleader Data Analytics & AI_

### Parsing across multimodal data

Your data fragments across many formats: machine-readable content in web applications, digital files containing embedded images like PDFs, PPTX, and DOCX, scanned documents, and media content such as audio and video. Rather than building separate pipelines for each format, Managed Knowledge Base provides fully managed parsing that automatically selects the right strategy per content type. It handles tables, charts, diagrams, mixed layouts, and media without configuration from you. The service supports visual content documents (PDFs, PPT/PPTX, DOCX) up to 500 MB, audio files up to 2 GB, and video files up to 10 GB.

After the service parses content, it splits the content into segments for retrieval. By default, Managed Knowledge Base decides on the most suitable chunking strategy on your behalf. If you understand your data and want more control, you can choose a custom strategy like fixed-size chunking, where you set the approximate token size, or no chunking, for documents that are already pre-processed or pre-split.

### Service-managed data storage

Choosing a semantic retrieval database is one of the most complex decisions in a knowledge retrieval pipeline. Each option has different performance profiles, pricing models, scaling characteristics, and feature sets. After you choose, you must still provision capacity, configure indices, manage backups, and tune performance over time.

Managed Knowledge Base removes that work entirely with a unified storage layer. The service auto-provisions storage so you don’t decide on vector dimensions or similarity metrics, and it auto scales from gigabytes to terabytes without intervention. Hybrid search combining keyword and semantic retrieval is continuously on, with no separate index configuration to manage. Data is encrypted at rest and in transit using AWS Key Management Service (AWS KMS) keys, either AWS managed or customer managed.

You don’t interact with the underlying storage. Your AWS services handle monitoring, tuning, backups, patching, and capacity management for you.

> _**OpenAI** is using Bedrock Managed Knowledge Bases’ RAG capabilities to ground inference and model responses, reliably and at scale for millions of users, with the right customer context._  
>  _  – Lavanya Singh, Member of Technical Staff, OpenAI_

### Setup in three steps

Let’s look at how to set up a managed knowledge base programmatically. Three API calls are all it takes: create the knowledge base, add a data source, and start ingestion. The following example uses Amazon S3 as the data source with a fully managed embedding model, with no model Amazon Resource Name (ARN), vector store, or chunking configuration required.
    
    
    import boto3
    
    bedrock_agent = boto3.client('bedrock-agent', region_name='us-west-2')
    
    # Step 1: Create a fully managed knowledge base (zero-config)
    kb_response = bedrock_agent.create_knowledge_base(
        name='my-managed-kb',
        description='Product documentation knowledge base',
        roleArn='arn:aws:iam::123456789012:role/BedrockKBRole',
        knowledgeBaseConfiguration={
            'type': 'MANAGED',
            'managedKnowledgeBaseConfiguration': {
                'embeddingModelType': 'MANAGED'
            }
        }
    )
    kb_id = kb_response['knowledgeBase']['knowledgeBaseId']
    
    # Step 2: Add an S3 data source
    ds_response = bedrock_agent.create_data_source(
        knowledgeBaseId=kb_id,
        name='my-s3-docs',
        dataSourceConfiguration={
            'type': 'S3',
            's3Configuration': {
                'bucketArn': 'arn:aws:s3:::amzn-s3-demo-bucket',
                'inclusionPrefixes': ['documents/']
            }
        }
    )
    data_source_id = ds_response['dataSource']['dataSourceId']
    
    # Step 3: Start ingestion
    bedrock_agent.start_ingestion_job(
        knowledgeBaseId=kb_id,
        dataSourceId=data_source_id
    )

## Smarter retrieval

A single retrieval step can’t answer every question. Direct lookups work fine on their own, but comparative analysis, multi-hop reasoning, and research queries need more. Managed Knowledge Base offers two retrieval APIs, each designed for different complexity levels:

  * **Retrieve** returns ranked source chunks with relevance scores and metadata. Use it for direct lookups, FAQ-style questions, and scenarios where low latency is critical. You control the number of results and can apply metadata filters to narrow the search.
  * **Agentic Retrieval** uses a foundation model (FM) to decompose complex queries into sub-queries. It retrieves iteratively across one or more knowledge bases and evaluates whether the results are sufficient before returning them. Agentic Retrieval can also generate a synthesized response using the managed orchestration LLM or a model available on Amazon Bedrock. Use it for comparative analysis, multi-hop questions, research queries, and scenarios that require synthesizing information from multiple sources or documents.



### How Agentic Retrieval works

Comparing two products, tracing a decision across multiple documents, or synthesizing research from different sources requires multiple retrieval steps. You also need to evaluate intermediate results and recognize when you have enough information.

Agentic Retrieval handles this automatically, across one or more knowledge bases. When a query comes in, the service:

  1. **Plans** by analyzing the query and decomposing it into sub-queries, each targeting a specific retriever across your configured knowledge bases.
  2. **Retrieves** by executing sub-queries in parallel against one or multiple knowledge bases.
  3. **Evaluates** whether the results are sufficient. If not, it plans and executes additional retrieval rounds (up to five by default).
  4. **Returns** deduplicated chunks from all iterations, with trace events streaming throughout for full observability.



You can balance accuracy and latency for your use case. The `maxAgentIteration` parameter controls how many rounds the model performs, and you select the foundation model used for planning and evaluation.

The following code shows an example of invoking Agentic Retrieval and processing its streaming response. The request specifies the user’s query, the knowledge base to search, the foundation model to use for planning and evaluation, and the maximum number of retrieval iterations. As the service runs, it streams trace events that show each planning step and sub-query being executed, followed by the final retrieval results:
    
    
    bedrock_runtime = boto3.client('bedrock-agent-runtime', region_name='us-west-2')
    
    response = bedrock_runtime.agentic_retrieve_stream(
        messages=[{
            'role': 'user',
            'content': [{'text': 'Compare the pricing tiers of Product A and Product B'}]
        }],
        retrievers=[{
            'knowledgeBaseRetriever': {
                'knowledgeBaseId': kb_id,
                'maxResults': 10
            }
        }],
        agenticRetrieveConfiguration={
            'foundationModel': {
                'modelArn': 'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-sonnet-4-20250514'
            },
            'maxAgentIteration': 5  # 1-10, default 5
        }
    )
    
    # Trace events stream in real time, then final results arrive
    for event in response['stream']:
        if 'trace' in event:
            trace = event['trace']
            if 'planning' in trace:
                print(f"Planning: {len(trace['planning'].get('actions', []))} sub-queries")
            elif 'retrieval' in trace:
                print(f"Retrieving: {trace['retrieval'].get('input', {}).get('text', '')}")
        elif 'retrievalResults' in event:
            results = event['retrievalResults']['results']
            print(f"\n{len(results)} deduplicated results returned")
            for i, r in enumerate(results[:5], 1):
                print(f"  {i}. {r['content']['text'][:150]}...")

## Production ready

Getting a Retrieval Augmented Generation (RAG) prototype working is one thing. Operating it at scale with proper access control, observability, and security is where many teams stall. Managed Knowledge Base includes [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) integration, document-level access control, and observability out of the box, so you can deploy without building these layers yourself.

### Native AgentCore Gateway integration

Managed Knowledge Bases integrates natively with AgentCore Gateway, giving you a streamlined way to expose your knowledge base to agents. When you add your knowledge base as a target on the gateway, it becomes a tool that agents compatible with the Model Context Protocol (MCP) can discover and invoke automatically. AWS [Identity and Access Management](<https://aws.amazon.com/iam/>) (IAM), routing, and observability are centralized at the gateway. You can also use Managed Knowledge Bases standalone by calling the retrieval APIs directly from your application if that better suits your use case.

AgentCore Gateway adds the following to your Managed Knowledge Bases integration:

  * **Abstracted infrastructure** : Knowledge base IDs are hidden behind the gateway, so agents simply discover and call tools by name, decoupling your agent code from underlying infrastructure.
  * **Framework compatibility** : Agents interact through a standardized MCP endpoint, making your knowledge bases instantly compatible with MCP-aware frameworks, including Strands, LangChain, and CrewAI.
  * **Unified access point** : A single gateway URL becomes the access point for your knowledge bases across your organization, simplifying agent configuration and governance.
  * **Centralized security** : IAM policy at the gateway level replaces per-knowledge-base permissions management, giving you one place to enforce security, audit access, and manage scale.
  * **Transparent operations** : Built-in observability, routing, and authentication are handled for you, so you can add, swap, or scale knowledge bases without changing a single line of agent code.



After you create a gateway and add your knowledge base as a target, MCP-compatible agent frameworks can discover and invoke it without knowing the underlying knowledge base ID:
    
    
    from strands.tools.mcp import MCPClient
    from mcp_proxy_for_aws.client import aws_iam_streamablehttp_client
    
    mcp_client = MCPClient(lambda: aws_iam_streamablehttp_client(
        endpoint=gateway_url,
        aws_region='us-west-2',
        aws_service='bedrock-agentcore',
    ))
    
    with mcp_client:
        # KB tools are auto-discovered via MCP
        tools = mcp_client.list_tools_sync()
        print(f"Available tools: {[t.tool_name for t in tools]}")
    
        # Retrieve (the agent never sees the KB ID)
        result = mcp_client.call_tool_sync(
            'tool_call_1',
            tools[0].tool_name,
            {'retrievalQuery': {'text': 'What is our total revenue?'}},
        )

This pattern works with [Strands](<https://strandsagents.com/>), [LangChain](<https://www.langchain.com/>), [CrewAI](<https://crewai.com/>), or other MCP-compatible frameworks. The gateway handles IAM, routing, and observability transparently.

> _At**Sony** , we’re building an agentic chat platform on Amazon Bedrock AgentCore to help teams get trusted answers from complex enterprise content and live web information. With Bedrock Managed Knowledge Base and Web Search now available as tools in AgentCore, our agents can reason across internal PDFs, presentations, spreadsheets, charts, and tables, going beyond simple vector retrieval, and ground responses in current web information while keeping our data within AWS. The result is a single experience for answering questions across internal knowledge and the web_  
>  _– Masahiro Oba, Senior General Manager, Sony Group Corporation_

### Observability

Every knowledge base query, whether through the SDK or the gateway, automatically publishes metrics to [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) under the `AWS/Bedrock/KnowledgeBases` namespace, including invocations, client and server errors, and throttles. For Agentic Retrieval, trace events stream in real time, showing each planning step, sub-query, and evaluation round. This gives you full visibility into the retrieval process without writing instrumentation code.

For a complete end-to-end walkthrough, check out the [notebook on GitHub](<https://github.com/aws-samples/amazon-bedrock-samples/blob/main/rag/managed-knowledge-bases/03-use-case-example/01-end-to-end-example-with-ac-gateway/01-bmkb-with-agentcore-gateway.ipynb>).

## Where Managed Knowledge Base fits

AWS offers multiple options for building the knowledge retrieval that grounds agents, generative AI applications, and RAG pipelines. The right choice depends on how much control you need versus how much you want managed for you. The following diagram shows where Managed Knowledge Base sits along that spectrum, from the highest level of abstraction ([Amazon Quick](<https://aws.amazon.com/quick/>)) to building your own RAG pipeline from scratch.

If you need to choose your own vector store and assemble the connector workflow yourself, Amazon Bedrock Knowledge Bases remains available. Managed Knowledge Base is for teams that want to focus on their application rather than the underlying infrastructure, with the service handling storage, scaling, and retrieval on your behalf.

## Pricing

Managed Knowledge Bases consolidates pricing into a straightforward, usage-based model rather than spreading costs across multiple capacity units. You pay for storage of your raw data, standard retrieval API calls, and Agentic Retrieval when you need multi-hop reasoning. The multimodal document parser, managed embedding model and managed re-ranker  are all included at no extra cost. If you choose to use a different Amazon Bedrock model for embeddings, re-ranking, or orchestration, standard Bedrock pricing applies for those models.

For complete pricing details and worked examples, see the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>).

## Conclusion

Amazon Bedrock Managed Knowledge Base removes the infrastructure work that sits between your enterprise data and a working retrieval-augmented generation application. Connect your data sources, let the service handle parsing, storage, and indexing, and retrieve using the mode that matches your query complexity.

Document-level access control, real-time ACL checks, and native observability through Amazon CloudWatch are built in, so your knowledge base is ready for production workloads at launch. With native AgentCore Gateway integration, your knowledge bases become tools that MCP-compatible agents can discover and use without custom code.

Managed Knowledge Base is now available in us-east-1 (N. Virginia), us-west-2 (Oregon), eu-west-1 (Dublin), eu-central-1 (Frankfurt), ap-southeast-2 (Sydney), eu-west-2 (London), ap-northeast-1 (Tokyo), and us-gov-west-1 (AWS GovCloud US-West).

To get started, see the [documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/kb-build-managed.html>) or try it out on the [AWS Management Console](<https://console.aws.amazon.com/>).

* * *

## About the authors

### Dani Mitchell

Dani is a Sr GenAI Specialist Solutions Architect at AWS and the SA lead for Amazon Bedrock Knowledge Bases. He helps enterprises across the world design and deploy generative AI solutions using Amazon Bedrock and Anthropic’s models and capabilities to build scalable, production-ready applications.

### Sandeep Singh

Sandeep is a Senior Generative AI Data Scientist at AWS, helping large enterprises innovate with generative AI. He specializes in generative AI, Agentic AI, machine learning, and system design, delivering AI/ML-powered solutions to solve complex business problems across diverse industries.

### Siddhant Sahu

Siddhant is a Sr Product Manager at Amazon Web Services, where he focuses on Bedrock Managed Knowledge Bases. He builds agentic search products that help ISVs and enterprises connect generative AI to their enterprise data.

### Amit Choudhary

Amit is a Principal Product Manager at AWS, where he currently leads Knowledge Bases for Amazon Quick and leads data ingestion capabilities for Amazon Bedrock Knowledge Bases. His work enables secure AI interactions grounded in enterprise knowledge, transforming how organizations use their data for AI-powered insights and decision-making. Previously, he enabled enterprises to securely connect their data sources to Amazon Q Business for user productivity, and built AWS Clean Rooms Differential Privacy, helping enterprises protect user privacy with mathematical guarantees in just a few steps. Outside of work, he enjoys traveling.