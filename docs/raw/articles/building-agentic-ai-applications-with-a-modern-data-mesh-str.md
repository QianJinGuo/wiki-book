---
source_url: "https://aws.amazon.com/blogs/machine-learning/building-agentic-ai-applications-with-a-modern-data-mesh-strategy-on-aws/"
ingested: 2026-06-26
sha256: 5ae2440f14a1c1a0
---

# Building agentic AI applications with a modern data mesh strategy on AWS

When a customer service agent autonomously queries order databases, retrieves return policies, and synthesizes answers, it needs governed access to multiple data sources across your organization. Building agentic AI applications on a modern data mesh requires fine-grained access control enforced at every layer of the data interaction chain. AI agents that autonomously discover database schemas, construct SQL queries, and synthesize data from multiple sources expose governance gaps that the single-checkpoint model built for Retrieval Augmented Generation (RAG) can’t address. Organizations need controls from tool discovery through query execution to response synthesis.

In an earlier post, [Build secure RAG applications with AWS serverless data lakes](<https://aws.amazon.com/blogs/machine-learning/build-secure-rag-applications-with-aws-serverless-data-lakes/>), we showed how to enforce fine-grained access control (FGAC) over RAG by filtering vector search results using metadata such as business domain and security classification. That approach worked because RAG’s data interaction was simple: retrieve chunks from a pre-built vector index, filter by metadata, and present results.

This post shows how to build a governed, serverless data mesh on AWS that provides the secure, scalable data foundation production agentic AI requires. The architecture extends the original with three key changes:

  1. Replacing Amazon OpenSearch Serverless with [Amazon S3 Vectors](<https://aws.amazon.com/s3/features/vectors/>) for cost-optimized knowledge bases, which can reduce vector storage and query costs by up to 90% compared to specialized vector database solutions in moderate query-frequency workloads.
  2. Replacing general-purpose Amazon Simple Storage Service (Amazon S3) with [Amazon S3 Tables](<https://aws.amazon.com/s3/features/tables/>) (with built-in Apache Iceberg support) governed by [AWS Lake Formation](<https://aws.amazon.com/lake-formation/>), delivering up to 10 times higher transactions per second compared to self-managed Iceberg tables, with fine-grained row, column, and cell-level security.
  3. Exposing the data mesh as Model Context Protocol (MCP) tools through [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) with AWS Lambda-backed interceptors for deterministic access control at every agent-to-tool invocation.



## Prerequisites

To implement this architecture, you need the following:

  * An [AWS account](<https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/>) with administrator access.
  * [AWS Identity and Access Management (IAM)](<https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html>) permissions to create roles, policies, Lambda functions, S3 Tables table buckets, Amazon Athena workgroups, and Lake Formation configurations.
  * Familiarity with [AWS Lake Formation](<https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html>) concepts (data lake administrator, LF-Tags, data filters).
  * An [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html>) enabled account with model access configured.
  * [Amazon Bedrock AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-agentcore.html>) access configured in your account.
  * The [AWS Command Line Interface (AWS CLI)](<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>) v2 installed and configured.



## Architecture overview

The following diagram illustrates the end-to-end flow from customer request through governed data access and back. Each layer enforces its own authorization controls, so no single point of failure can expose unauthorized data. The architecture diagram shows four layers: Agent Layer with AgentCore Runtime and LangGraph agent, Gateway Layer with request and response interceptors, Tools Layer with four Lambda-backed MCP tools (`get_user_tables`, `get_schema`, `run_query`, `kb_search`), and Governed Data Mesh with S3 Tables, Athena, Lake Formation, and S3 Vectors. The arrows show data flow from customer through agent to governed data sources.

  1. Agent Layer – The customer interacts with AgentCore Runtime, a secure, serverless hosting environment that deploys agents in isolated microVM environments with session isolation. The agent runs within the LangGraph framework, which integrates with MCP tools through the MCPClient class.
  2. Gateway Layer – The Gateway includes a request interceptor that performs JSON Web Token (JWT) validation and scope enforcement, a response interceptor that handles tool filtering, data redaction, and audit logging, and AgentCore Policy with Bedrock Guardrails that evaluates inputs and outputs of every tool invocation for prompt injection, harmful content, and sensitive information exposure in real time.
  3. Tools Layer – Four Lambda-backed MCP tools (`get_user_tables`, `get_schema`, `run_query`, and `kb_search`) provide governed data access.
  4. Governed Data Mesh – S3 Tables (Iceberg) registered in the [AWS Glue Data Catalog](<https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html>) (s3tablescatalog), Amazon Athena with workgroup cost controls, Lake Formation enforcing row/column/cell-level security, and S3 Vectors powering the Amazon Bedrock Knowledge Bases.



## Why agentic AI requires a new governance model

The RAG architecture enforced governance at a single checkpoint: metadata-filtered vector retrieval. That approach served RAG workloads well. Agentic patterns introduce additional steps, creating a multi-step chain where each step requires its own authorization decision. In RAG, the system queries one pre-built vector index with metadata filters at retrieval time. In agentic AI, the system discovers which tables exist, understands schemas, constructs SQL, retrieves from vector stores, and synthesizes results.

A metadata filter at a single retrieval boundary cannot govern this five-step chain. Vector databases synchronize permissions periodically, meaning revocations aren’t immediately reflected. This is an unacceptable gap when an agent is autonomously acting on data. Complex identity permissions such as role hierarchies, attribute-based access, and row-level filters can’t be expressed as straightforward metadata key-value pairs on vector chunks.

These limitations motivate the shift to a governed data mesh architecture where authorization is enforced natively at each data access layer.

## Building a governed serverless data mesh

A [data mesh](<https://aws.amazon.com/what-is/data-mesh/>) decentralizes data ownership to domain teams while centralizing governance and discoverability. On AWS, domain teams own their data products end-to-end, the AWS Glue Data Catalog provides centralized metadata discovery, and [Lake Formation](<https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html>) enforces permissions with grant/revoke semantics across databases, tables, columns, rows, and cells.

Each producer domain resides in its own AWS account. Producers register data products in a central governance account, a dedicated AWS account that hosts the authoritative AWS Glue Data Catalog and Lake Formation permission policies for the entire organization. Data is shared through [Lake Formation cross-account sharing](<https://docs.aws.amazon.com/lake-formation/latest/dg/cross-account-permissions.html>). No data is copied. Only metadata is linked through resource links in consumer catalogs. At query time, Lake Formation verifies permissions and issues temporary credentials to the query engine. [Tag-based access control (LF-TBAC)](<https://docs.aws.amazon.com/lake-formation/latest/dg/tag-based-access-control.html>) scales this dynamically. Administrators assign LF-Tags like `classification=PII` or `department=customer_service` to resources and grant permissions based on those tags.

The following subsections describe how we implement the two data layers of this mesh. First, we cover transactional Iceberg tables for structured data (order records, customer profiles) governed by Lake Formation row and column security. Then, we describe the vector store for unstructured knowledge (policies, FAQs) that powers semantic search.

### S3 Tables with Apache Iceberg for transactional data

For our customer service agent, the Order Management domain team publishes order and customer data using [Amazon S3 Tables](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables.html>). S3 Tables is the first cloud object store with built-in Apache Iceberg support, delivering up to 10 times higher transactions per second compared to self-managed Iceberg tables on general-purpose S3 buckets. It automatically handles compaction, snapshot management, and unreferenced file removal.

S3 Tables integrates with [Amazon SageMaker Lakehouse](<https://docs.aws.amazon.com/sagemaker-lakehouse-architecture/latest/userguide/what-is-smlh.html>), which populates the AWS Glue Data Catalog and federates access through Lake Formation. The three data products (`customer_orders`, `customer_profiles`, and `interaction_history`) are queryable from Amazon Athena, governed by Lake Formation permissions, and automatically compacted by S3 Tables.

Lake Formation [data filters](<https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html>) enforce row-level security so the agent can only access records belonging to the authenticated customer. A data filter on `customer_orders` with the row filter expression `customer_id = :customer_id` restricts every query to the current customer’s records, regardless of how the agent constructs its SQL. The `run_query` Lambda function injects the authenticated customer’s identity as a session parameter before submitting queries to Athena. Column-level security hides sensitive fields like `payment_method` and `billing_address` from query results entirely.

### Building a knowledge base with Amazon S3 Vectors

Structured data alone is not enough. Customers need answers drawn from unstructured knowledge (product manuals, return policies, frequently asked questions (FAQs), and troubleshooting guides) that require semantic search capabilities.

[Amazon S3 Vectors](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors.html>) provides native vector storage and querying support as a fully serverless service. It supports up to 2 billion vectors per index and provides strong write consistency, meaning newly added vectors are immediately queryable.

### Cost advantages of S3 Vectors

Customers who use the knowledge base feature in [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html>) can select S3 Vectors as a vector store, which can reduce costs by up to 90 percent compared to specialized vector database solutions in moderate query-frequency workloads. For high queries-per-second (QPS) workloads requiring single-digit millisecond latency, Amazon OpenSearch Serverless remains the better fit. AWS provides single-step export from S3 Vectors to Amazon OpenSearch Serverless collections for workloads that outgrow the S3 Vectors performance profile.

S3 Vectors supports [filterable metadata](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-metadata-filtering.html>) (string, number, boolean, list types with operators like `$eq`, `$ne`, `$gt`, `$in`, `$and`, `$or`) and non-filterable metadata for larger contextual data returned with results. In our use case, documents are stored with filterable metadata keys like `product_category` and `document_type`, which supports targeted semantic search. The following example shows a metadata filter that retrieves only electronics return policies:
    
    
    {"$and": [{"product_category": {"$eq": "electronics"}}, {"document_type": {"$eq": "return_policy"}}]}

## Exposing the data mesh with AgentCore Gateway

With the governed data mesh and knowledge base in place, the next challenge is exposing these capabilities to the AI agent in a secure, discoverable, and standardized way. This section covers the tools, interceptors, and identity propagation patterns that make this possible.

[AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) provides a centralized layer for managing how AI agents connect to tools. It consolidates authentication, observability, and policy enforcement into a single endpoint. The Gateway converts Lambda functions, APIs, and existing MCP servers into MCP-compatible tools with protocol translation, inbound OAuth authorization, and outbound credential management. Agents connect through streamable HTTP transport with an OAuth Bearer token.

### Four core data tools

Four Lambda-backed MCP tools provide governed data access through the Gateway. `get_user_tables` queries the AWS Glue Data Catalog filtered by Lake Formation permissions to return authorized tables. `get_schema` retrieves column names, types, and descriptions for a specified table. `run_query` validates SQL against a read-only allowlist, injects customer identity for row-level filtering, and executes through Athena with byte-scan cost limits. `kb_search` performs metadata-filtered semantic search against the Knowledge Bases in Amazon Bedrock.

With the launch of Amazon Bedrock Managed Knowledge Base, knowledge bases are now available as a native pre-built target type in AgentCore Gateway. This means you can expose a knowledge base through the Gateway without a custom Lambda function thee Gateway automatically generates IAM roles, provides built-in observability and evaluation metrics, and enforces policies via AgentCore Policy. In this architecture, we use a custom `Lambda-backed kb_search` tool to demonstrate how Gateway interceptors enforce fine-grained authorization and metadata filtering at the tool invocation boundary. For production workloads where custom interceptor logic is not required, the native Managed KB target type reduces operational overhead by eliminating the Lambda function entirely while retaining MCP compatibility and AgentCore Policy enforcement.

The following JSON shows the tool schema registration for `run_query`.
    
    
    {
      "name": "run_query",
      "description": "Executes a read-only SQL query against governed Iceberg tables via Amazon Athena with byte-scan limits and Lake Formation row-level security.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "sql": {"type": "string", "description": "A read-only SQL SELECT statement."},
          "database": {"type": "string", "description": "The Glue Data Catalog database name."}
        },
        "required": ["sql", "database"]
      }
    }

Deploying the MCP tools and interceptors:

  1. Clone the AgentCore Gateway interceptor samples repository.
  2. For each Lambda function (`get_user_tables`, `get_schema`, `run_query`, `kb_search`, request interceptor, response interceptor), create the function using the AWS CLI: 
         
         aws lambda create-function --function-name get_user_tables \
             --runtime python3.12 --handler lambda_function.lambda_handler \
             --role arn:aws:iam::ACCOUNT_ID:role/mcp-tool-role \
             --zip-file fileb://function.zip

  3. Attach the IAM policies defined in the repository’s policies/ directory to each function’s execution role.
  4. Register the Lambda functions as MCP tool targets in AgentCore Gateway. For instructions, see Registering tool targets.
  5. Attach the request and response interceptors to the gateway. For instructions, see the [AgentCore Gateway interceptor samples](<https://github.com/awslabs/agentcore-samples>).



Note: For complete Lambda function source code, IAM policies, and deployment instructions for all four MCP tools and both interceptors, see the [AgentCore Gateway interceptor samples](<https://github.com/awslabs/agentcore-samples>).

### Interceptors for deterministic access control

[AgentCore Gateway interceptors](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-interceptors.html>) are custom Lambda functions that enforce authorization at two stages in the request-response lifecycle. Interceptors act as middleware that inspects, transforms, or blocks requests and responses flowing through the Gateway. A request interceptor executes before the Gateway calls the target Lambda, and a response interceptor executes after the target responds but before results reach the caller.

Interceptor patterns solve distinct security challenges at each stage:

**Pattern** | **Challenge solved** | **How**  
---|---|---  
JWT scope-based tool invocation control | Unauthorized tool access | Request interceptor decodes JWT scope claim and blocks unauthorized `tools/call` invocations  
Dynamic tool filtering | Tool discovery leakage | Response interceptor removes unauthorized tools from `tools/list` based on per-user scopes  
Act-on-behalf identity propagation | Privilege escalation / [confused deputy](<https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html>)] | Each hop receives a separate, scoped-down token (for example, Order tool gets only `order:read`; KB tool gets only `kb:search`)  
  
The authorization check is intentionally minimal:
    
    
    def check_tool_authorization(scopes, tool, target):
        if target in scopes:
            return True
        return f"{target}:{tool}" in scopes

For dynamic tool filtering, the response interceptor filters the `tools/list` response:
    
    
    def lambda_handler(event, context):
        gateway_response = event['mcp']['gatewayResponse']
        auth_header = gateway_response['headers'].get('Authorization', '')
        token = auth_header.replace('Bearer ', '')
        claims = decode_jwt_payload(token)
        scopes = claims.get('scope', '').split()
        tools = gateway_response['body']['result'].get('tools', [])
        filtered_tools = [t for t in tools if check_tool_authorization(
            scopes, t['name'].split('___')[1], t['name'].split('___')[0])]
        return {
            "interceptorOutputVersion": "1.0",
            "mcp": {
                "transformedGatewayResponse": {
                    "statusCode": 200,
                    "headers": {"Authorization": auth_header},
                    "body": {"result": {"tools": filtered_tools}}
                }
            }
        }

For act-on-behalf tokens, each token includes an `Act: Agent` field establishing a clear chain of responsibility. An unauthorized downstream tool can’t reuse an overly privileged token to access other tools.

Gateway interceptors enforce authorization deterministically at the tool invocation boundary before the model sees or executes tools. However, the agent’s SQL construction still depends on model behavior. The Athena byte-scan limits, read-only IAM policies, and Lake Formation row filters serve as compensating controls that bound the scope of malformed queries the model might produce.

## Agent request flow: the customer service scenario in action

Throughout this post, a customer service scenario demonstrates the architecture at work. A customer contacts support and asks: “Where is my order #12345, and can I still return the headphones I bought last week?” The agent needs to query governed Iceberg tables for order status, retrieve return policies from a vector knowledge base, and synthesize a complete response while respecting cost guardrails and regulatory constraints. Row-level security is critical because each row in the `customer_orders` table represents a specific customer’s order. Without row-level filtering, an agent acting on behalf of Customer A could inadvertently access Customer B’s order history, shipping details, or purchase patterns.

The following steps trace the complete interaction through each governance layer as shown in the following diagram:

  1. Tool Discovery – The agent calls the Gateway’s `tools/list` endpoint. The response interceptor filters the tool list based on the representative’s JWT scopes, returning four authorized tools.
  2. Table Discovery – Next, `get_user_tables` is invoked. The request interceptor validates the JWT and confirms the `order:read` scope. The Lambda returns three tables: `customer_orders`, `customer_profiles`, and `interaction_history`.
  3. Schema Discovery – A `get_schema` call on `customer_orders` reveals columns `order_id`, status, `ship_date`, `estimated_delivery`, and `product_name`. Lake Formation column-level security excludes `payment_method` and `billing_address`, making these columns invisible to the agent.
  4. Query Execution – The constructed query SELECT `order_id`, status, `ship_date`, `estimated_delivery` FROM `customer_orders` WHERE `order_id` = ‘12345’ is submitted through `run_query`, which injects the authenticated customer’s identity to resolve the Lake Formation row filter. The Athena workgroup enforces a `BytesScannedCutoffPerQuery` limit (for example, 100 MB), and the read-only IAM policy denies mutating AWS Glue actions. The result: order #12345 shipped March 20, estimated delivery March 25.
  5. Knowledge Base Retrieval – Simultaneously, `kb_search` runs with query “return policy for electronics” and metadata filter {“`product_category`”: {“$eq”: “electronics”}}. The returned policy states: “Electronics may be returned within 30 days of purchase in original packaging for a full refund.”
  6. Response Synthesis – The final response combines both results: “Your order #12345 shipped on March 20 and is estimated to arrive by March 25. Regarding the headphones, our electronics return policy allows returns within 30 days of purchase in original packaging. I can initiate a return for you. Would you like to proceed?”



Authorization was enforced at different layers at each step using Gateway interceptors for steps 1–2, Lake Formation for steps 3–4, Athena workgroup limits for step 4, and S3 Vectors metadata filtering for step 5. This defense in depth approach reduces the risk that a failure in a single control exposes unauthorized data.

## Query governance and security guardrails

Robust governance is essential for agents that autonomously construct SQL. This section describes the five overlapping layers of protection that collectively constrain what an agent can query, how much data it can scan, and what information reaches the model.

The first layer is Athena workgroup cost controls. Every agent query executes within a dedicated [Athena workgroup](<https://docs.aws.amazon.com/athena/latest/ug/workgroups-create-update-delete.html>) configured with a `BytesScannedCutoffPerQuery` limit. If a query exceeds this threshold, Athena cancels it automatically. The `EnforceWorkGroupConfiguration` setting helps prevent the agent from bypassing these limits. Per-workgroup aggregate data usage alerts trigger Amazon Simple Notification Service (Amazon SNS) notifications when total data scanned exceeds thresholds.

The second layer is Data Definition Language (DDL) prevention through read-only IAM policies. The Lambda execution role carries an explicit deny for mutating Glue Data Catalog actions (`glue:CreateTable`, `glue:DeleteTable`, `glue:UpdateTable`, and partition-level equivalents). Lake Formation adds an additional DDL gatekeeper: a principal can’t create databases or tables unless explicitly granted those permissions.

The third layer is Lake Formation fine-grained access. Security policies at five levels of granularity (database, table, column, row, and cell) are enforced natively across Amazon Athena, Amazon Redshift Spectrum, AWS Glue extract, transform, and load (ETL), and Amazon EMR at no additional charge. For more information, see [Lake Formation data filtering](<https://docs.aws.amazon.com/lake-formation/latest/dg/data-filtering.html>).

The fourth layer is Gateway interceptors. Request interceptors enforce JWT scope-based authorization before tool execution. Response interceptors filter tool lists and redact sensitive data from query results.

The fifth layer is [Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html>) Guardrails enforced through AgentCore Policy at the Gateway. Rather than applying content safety controls only at the model inference boundary, Guardrails are now integrated directly into the AgentCore Policy Engine, where they evaluate the inputs and outputs of every authorized agent action and every call to a gateway target  including tools, agents and models in real time. This means prompt injection attacks, harmful content, and sensitive information exposure are detected and blocked before they reach downstream systems, not merely caught on the way back from the model. The Policy Engine enforces these guardrails deterministically at the gateway layer alongside the interceptor-based access controls described earlier, creating a unified enforcement point for both authorization and content safety. For workloads that require additional model-layer controls, Amazon Bedrock Guardrails can still be applied at the model inference boundary as a complementary defense. 

**Why Gateway-level guardrails are preferable for agentic workloads******

In a traditional RAG architecture, applying guardrails exclusively at the model inference boundary is sufficient because data interactions follow a single retrieval-then-generate pattern. The model is the only component that synthesizes information, so filtering its output catches all policy violations. In agentic architectures, however, the agent autonomously invokes multiple tools, constructs queries, and synthesizes results across several hops before any model response is generated. A guardrail that only evaluates the final model output cannot prevent a malicious or manipulated input from reaching a tool invocation for e.g., a prompt injection embedded in a tool response could influence subsequent tool calls before the model ever produces a final answer. By enforcing guardrails at the Gateway via AgentCore Policy, every agent-to-tool interaction is evaluated in real time, providing defense at the point of action rather than only at the point of output. 

**Trade-offs with the alternative approach******

Applying guardrails solely at model inference offers simplicity: a single integration point with no changes to tool infrastructure. However, this approach introduces three gaps for agentic patterns. First, it creates a temporal blind spot harmful content can propagate through intermediate tool calls before reaching the model output boundary. Second, it cannot enforce tool-specific policies (for e.g.xample, blocking certain query patterns for the run_query tool while allowing them for kb_search). Third, it relies entirely on the model’s cooperation to surface tool outputs for evaluation, which is not guaranteed in multi-step reasoning chains. The Gateway-based approach eliminates these gaps by evaluating every request and response at the tool invocation boundary, enabling per-tool policy customization, real-time blocking of prompt injection in tool inputs, and deterministic enforcement independent of model behavior. 

No single layer is solely responsible. Defense in depth, applied at different layers from network to application to model, is designed to help prevent a failure in a single control from exposing unauthorized data. 

## Verify your implementation

After deploying the architecture, validate each governance layer:

  1. Call the Gateway’s `tools/list` endpoint with a scoped JWT token that includes the `order:read` scope.
  2. Verify that only authorized tools appear in the response.
  3. Call the Gateway’s `tools/list` endpoint with a token missing the `order:read` scope.
  4. Verify that `get_user_tables` is not returned in the response.
  5. Invoke `get_user_tables`.
  6. Verify that the response contains only the tables your Lake Formation permissions allow.
  7. Verify that tables from other domains are not visible in the response.
  8. Run `run_query` with a query against `customer_orders` for the authenticated customer.
  9. Verify that results contain only records for the authenticated customer ID.
  10. Run `run_query` with a query attempting to access another customer’s records.
  11. Verify that the query returns an empty result set.
  12. Run `get_schema` on `customer_orders`.
  13. Verify that `payment_method` and `billing_address` are not listed in the response.
  14. Submit a query that would scan more than the `BytesScannedCutoffPerQuery` limit.
  15. Verify that Athena cancels the query and returns an error.
  16. Invoke `kb_search` with a metadata filter.
  17. Verify that results match only the specified category.



If you encounter errors, check Amazon CloudWatch Logs for the Lambda functions and verify that IAM roles have the correct permissions.

## Clean up

To avoid ongoing charges, delete the following resources after you finish exploring this architecture:

  1. Lambda functions – Delete the four MCP tool functions (`get_user_tables`, `get_schema`, `run_query`, `kb_search`) and the two interceptor functions. For instructions, see [Deleting Lambda functions](<https://docs.aws.amazon.com/lambda/latest/api/API_DeleteFunction.html>).
  2. AgentCore Gateway – Delete the gateway and its registered targets. For instructions, see [Deleting a gateway](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteGateway.html>).
  3. Amazon Athena workgroup – Delete the dedicated agent workgroup (this doesn’t delete query results stored in S3). For instructions, see [Deleting a workgroup](<https://docs.aws.amazon.com/athena/latest/ug/deleting-workgroups.html>).
  4. Amazon S3 Tables table bucket – Warning: This permanently deletes all data in the Iceberg tables (customer orders, profiles, interaction history). Delete the table bucket containing the Iceberg tables. For instructions, see [Deleting a table bucket](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables-buckets-delete.html>).
  5. Amazon S3 Vectors index – This permanently deletes all knowledge base content (product manuals, policies, FAQs). Delete the vector index and its associated S3 bucket. For instructions, see [Deleting a vector index](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-index-delete.html>).
  6. Amazon Bedrock Knowledge Bases – Delete the knowledge base configuration. For instructions, see [Deleting a knowledge base](<https://docs.aws.amazon.com/bedrock/latest/userguide/kb-delete.html>).
  7. Lake Formation permissions – Revoke Lake Formation grants. For instructions, see [Revoking permissions](<https://docs.aws.amazon.com/lake-formation/latest/APIReference/API_RevokePermissions.html>).
  8. Lake Formation data filters — Remove data filters created for row-level security. For instructions, see [Managing data filters](<https://docs.aws.amazon.com/lake-formation/latest/dg/managing-filters.html>).
  9. AWS Glue Data Catalog — Delete the s3tablescatalog database, registered tables, and any resource links created for cross-account sharing. For instructions, see [Deleting databases and tables](<https://docs.aws.amazon.com/athena/latest/ug/drop-database.html>).
  10. IAM roles and policies – Delete the execution roles and policies created for this architecture. For instructions, see [Deleting IAM roles](<https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage_delete.html>).



## Conclusion

The shift from RAG to agentic AI expands the governance surface area. RAG required a single metadata-filtered retrieval checkpoint. Agentic AI introduces autonomous schema discovery, SQL construction, multi-source synthesis, and tool invocation, each requiring its own authorization control. This post demonstrated how to address that expanded surface area with a governed data mesh on AWS that combines Amazon S3 Tables for transactional storage with Lake Formation security, Amazon S3 Vectors for cost-optimized semantic search, AgentCore Gateway interceptors for deterministic tool-level authorization, Athena workgroup controls for query cost governance, and Amazon Bedrock Guardrails for content safety at model inference. Together, these layers support production deployment for highly regulated industries where compliance requires defense in depth at every data access decision point.

## Next steps

To start building your own governed agent architecture, take the following actions:

  * Deploy the interceptor patterns from the [AgentCore Gateway interceptor samples](<https://github.com/awslabs/agentcore-samples>) to implement JWT-based tool authorization in your own environment.
  * Set up a governed data product by following the [Amazon S3 Tables getting started guide](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables-getting-started.html>) and configuring Lake Formation row-level security for your use case.
  * Build a cost-optimized knowledge base using the [Amazon S3 Vectors documentation](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors.html>).
  * Connect your S3 Vectors knowledge base to Knowledge Base in Amazon Bedrock for semantic retrieval. For instructions, see Creating a knowledge base in the [Bedrock documentation.](<https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent_CreateKnowledgeBase.html>)
  * Review the [AgentCore Gateway documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) to understand how to register your own Lambda-backed MCP tools and configure OAuth authorization.



* * *

## About the authors

### Venkata Sistla

Venkata is a Senior Specialist Solutions Architect on the Worldwide team at AWS, bringing over 15 years of experience in cloud architecture. He specializes in designing and implementing enterprise-scale AI/ML systems across multiple industry verticals, helping organizations transform complex data challenges into competitive advantages through innovative cloud solutions. His cross-industry expertise enables him to architect highly scalable infrastructures that accelerate machine learning initiatives and deliver measurable business outcomes. A dedicated mentor and technical leader, he is passionate about driving technological excellence and empowering teams to push the boundaries of what’s possible with cloud and AI.

### Aamna Najmi

Aamna is a Senior Specialist Solutions Architect for Generative AI focusing on Anthropic models and operationalizing and governing generative AI systems at scale on Amazon Bedrock. She helps ISVs solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. In her spare time, she pursues her passion for experimenting with food and discovering new places.

### Prachi Gupta

Prachi is a data and AI specialist with over 9 years of experience building enterprise-scale cloud architectures. She serves as a Senior Specialist Solutions Architect on AWS’s Worldwide team, where she specializes in Data, Analytics, and AI/ML, with deep expertise in Apache Iceberg and Amazon S3 Tables, helping organizations cut through data complexity to deliver measurable business outcomes. A technical speaker, trainer, and mentor, she delivers sessions at events like AWS re:Invent and Summits while enabling teams to grow their skills and confidence in data and AI. Outside of work, she fosters and advocates for rescue animals, explores the outdoors, or can be found lost in a good book.
