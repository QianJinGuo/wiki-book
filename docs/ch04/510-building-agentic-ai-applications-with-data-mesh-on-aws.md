# Building Agentic AI Applications with Data Mesh on AWS

## Ch04.510 Building Agentic AI Applications with Data Mesh on AWS

> 📊 Level ⭐⭐ | 2.7KB | `entities/agentic-ai-data-mesh-aws-s3-vectors-mcp.md`

# Building Agentic AI Applications with Data Mesh on AWS

AWS official blog showing how to build governed agentic AI applications on a modern data mesh. Core innovation: exposing data mesh as MCP tools via AgentCore Gateway for deterministic agent-to-data access control.

## Core Architecture

Four-layer architecture:
1. **Agent Layer** -- AgentCore Runtime + LangGraph agent, isolated microVM environments
2. **Gateway Layer** -- JWT validation + scope enforcement + Bedrock Guardrails real-time prompt injection detection
3. **Tools Layer** -- 4 Lambda-backed MCP tools (`get_user_tables`, `get_schema`, `run_query`, `kb_search`)
4. **Governed Data Mesh** -- S3 Tables (Iceberg) + Athena + Lake Formation + S3 Vectors

## Three Key Innovations

### 1. S3 Vectors Replacing OpenSearch Serverless
- Native vector storage, supports 2 billion vectors/index
- Cost reduction up to 90% (moderate query frequency workloads)
- Strong write consistency: newly added vectors immediately queryable
- High QPS workloads still recommend OpenSearch Serverless

### 2. S3 Tables + Apache Iceberg
- First object store with built-in Iceberg support
- 10x higher TPS vs self-managed Iceberg
- Automatic compaction, snapshot management, unreferenced file cleanup
- Integrates with SageMaker Lakehouse

### 3. MCP Tools as Data Mesh Exposure Layer
- AgentCore Gateway exposes data mesh as MCP tools
- Lambda-backed interceptors for deterministic access control
- Each agent-to-tool invocation has independent authorization decision

## Agentic AI vs RAG Governance Difference

RAG enforces governance at single checkpoint (metadata-filtered vector retrieval). Agentic AI introduces five-step chain:
1. Discover which tables exist
2. Understand schemas
3. Construct SQL
4. Retrieve from vector stores
5. Synthesize results

Each step requires independent authorization. Single-point metadata filter cannot govern this chain.

## Lake Formation Fine-Grained Security

- **Row-level**: data filter expression `customer_id = :customer_id` restricts agent to current customer records
- **Column-level**: hides sensitive fields like `payment_method`
- **Cell-level**: LF-TBAC tag-based access control
- **Cross-account sharing**: via resource links, no data copying

## Reference

- Source: [Original Article](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/building-agentic-ai-applications-with-a-modern-data-mesh-str.md)
- Related: [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

