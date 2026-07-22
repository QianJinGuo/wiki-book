---
source_url: "https://aws.amazon.com/blogs/machine-learning/shared-infrastructure-isolated-tenants-pool-model-multi-tenancy-with-amazon-bedrock-agentcore/""
ingested: 2026-06-26
sha256: 0c8f2863071971af
---

Shared infrastructure, isolated tenants: Pool model multi-tenancy with Amazon Bedrock AgentCore | Artificial Intelligence

Shared infrastructure, isolated tenants: Pool model multi-tenancy with Amazon Bedrock AgentCore

 

 
by 

Ashley Chen

 and 

Sushanth Mangalore

 
on 
23 JUN 2026

 
in 

Advanced (300)

, 

Amazon API Gateway

, 

Amazon Bedrock AgentCore

, 

AWS Lambda

, 

Technical How-to

 

Permalink

 

 Share

 

 

 

 

 

 

 

 

 

 

 

 
Building multi-tenant AI applications presents new architectural challenges. You need complete tenant isolation between customers, different service tiers with different capabilities, granular cost tracking, and observability per tenant. Without these, you could risk exposing customer data, not providing appropriate quality of service to your customers or running up unforeseen costs.

 
In this post, you will learn patterns for implementing production-ready multi-tenant systems using Amazon Bedrock AgentCore. You will see these patterns demonstrated through healthcare AI agents that serve multiple clinics and hospitals. While the post uses healthcare as the example domain, the architectural patterns and implementation techniques apply broadly to various multi-tenant AI applications. Whether you’re building SaaS platforms, enterprise solutions serving multiple business units, or managed services for different customer organizations, you can use these architectural patterns to build your solution.

 
What you’ll learn

 

 
How to implement complete tenant isolation in agentic applications using native AWS capabilities.

 
Patterns for service tier differentiation with minimal custom code.

 
Techniques for granular cost attribution per tenant.

 
Best practices for scalable multi-tenant AI architectures.

 

 
This blog post is part 2 of the series, Building multi-tenant agents with Amazon Bedrock AgentCore. 
Part 1
 explores design considerations for architecting multi-tenant agentic applications and the framework needed to address SaaS architecture challenges with&nbsp;Amazon Bedrock AgentCore.

 
GitHub repo for the sample code: 
https://github.com/aws-samples/sample-agentcore-and-multitenancy-blog

 
Solution overview

 
This solution demonstrates how to use native capabilities of Amazon Bedrock AgentCore to achieve complete tenant isolation using AWS-managed services. The architecture implements a three-level hierarchy: Tier → Tenant → User, where you enforce isolation at every layer through documents in knowledge base, memory, model access, and cost tracking. A tiering strategy is a common pattern in SaaS applications where tenants are grouped into distinct service tiers based on their needs – such as Basic and Premium, usage patterns, or pricing plans. Each tier defines a set of features and quality of service available to tenants within that group. This approach allows SaaS providers to serve a diverse customer base with differentiated experiences while maintaining operational efficiency.

 
Healthcare AI assistant example

 
To see how this works in practice, the example solution implements two service tiers for tier-based differentiation:

 

 

Basic Tier
: Designed for small clinics and practices that primarily need straightforward document search and retrieval. Because these tasks are well-suited to a smaller, cost-effective model, this tier uses Mistral Ministral 3 8B Instruct, keeping costs low while still delivering accurate results for simple queries.

 

Premium Tier
: Designed for hospitals and specialty centers that require complex clinical analysis. This tier uses OpenAI GPT OSS 120B with advanced reasoning capabilities for accurate tool selection, including the web search tool which is only available to premium tier customers.

 

 
Within each tier, this solution uses a 
pool isolation model
, where tenants share the same underlying infrastructure and compute resources rather than having dedicated, siloed resources per tenant. The pool model maximizes resource utilization and simplifies operations, while tenant isolation is enforced through logical separation mechanisms such as scoped identifiers, access policies, and data partitioning. Combining a tiering strategy with a pool model enables you to balance cost efficiency with the flexibility to offer differentiated service levels.

 
Architecture

 
Let’s look at how primitives from AgentCore come together to solve these multi-tenancy challenges. The following diagram illustrates the multi-tenant architecture for the solution, showing how requests flow from authenticated users through tier-specific agents to isolated document storage:

 

 

Figure 1: Multi-tenant architecture with hierarchical isolation (Tier → Tenant → User).

 
The solution consists of these key components:

 

 

Amazon Cognito

: Manages user authentication and stores tenant metadata (tier, clinic_id, role) in JSON Web Token (JWT) claims. These claims are extracted and propagated as tenant context through the request payload, enabling each downstream component to scope its operations to the correct tenant.

 

Amazon API Gateway

: Routes requests and enforces tier-based rate limiting via usage plans

 

AWS Lambda

: Extracts tenant context and invokes the corresponding Amazon Bedrock AgentCore agent

 

AgentCore
 components
: Runtime (agent execution), Memory (conversation state), Identity (agent identity management), Gateway (tool server), and Policy (agent action boundary)

 

Amazon Simple Storage Service
 (Amazon S3)
: Stores clinical documents in tier-separated buckets with hierarchical prefix structure for tenant isolation

 

Amazon Bedrock Knowledge Bases

: Provides semantic search with metadata filtering to scope queries to the requesting tenant’s documents

 

Amazon Bedrock project

: Enables per-tier cost tracking via cost allocation tags

 

 
Solution walkthrough

 
This section describes the key aspects of the solution. You run the deploy script to set up the infrastructure and application for the solution. The code excerpts in this section are only used to describe how the key aspects of the architecture are being addressed by components of the solution. There is no need to run any commands or execute any code snippets shown here.

 
Amazon Bedrock AgentCore components

 
The architecture leverages six core Bedrock AgentCore capabilities to implement multi-tenancy:

 

AgentCore Runtime
: AgentCore Runtime provides the compute for the agents in this solution, with each agent session execution in an isolated micro-VM for tenant-level compute isolation. It hosts separate agent instances per tier, each configured with tier-appropriate models and capabilities.

 

 

# Agent configuration
config = TIER_CONFIG.get(tier, TIER_CONFIG["basic"])
model_id = config["default_model"]

# Project ID is fetched from SSM
project_id = get_ssm_parameter(config["project_ssm"])

# Passed to OpenAIModel (premium tier) targeting the inference endpoint
self.model = OpenAIModel(
 client_args={"base_url": mantle_base_url, "api_key": api_key, "project": project_id},
 model_id=model_id,
)

 

 

AgentCore Identity
: AgentCore Identity secures the multi-tenant architecture with a unified JWT-based authentication model. The Cognito ID token validates the user at both the Runtime and Gateway boundaries, while tool Lambdas mint their own scoped credentials for downstream data access.

 
Each AgentCore Runtime is configured with an inbound JWT authorizer that validates Cognito ID tokens before agent code execution. The ID token carries tenant metadata as custom claims:

 

 

 

 

Claim

 

Example Value

 

Purpose

 

 

 
sub

 
a4589458-8011-…

 
Unique user identifier (Cognito UUID)

 

 

 
iss

 

https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AbCdEfG

 
Token issuer, validated by AgentCore Runtime

 

 

 
aud

 
7rfbikfsm51j…

 
Web client ID, validated by Runtime’s allowedAudience

 

 

 
token_use

 
id

 
Identifies this as an ID token (not access token)

 

 

 
exp

 
1745446200

 
Expiration timestamp (default: 1 hour from issue)

 

 

 
cognito:username

 

dr.foster@hospital-a.com

 
Login username, used as user_id for memory isolation

 

 

 
custom:tier

 
premium

 
Routes to correct model, knowledge base, and gateway

 

 

 
custom:clinic_id

 
hospital-a

 
This is tenant ID. Enforces data isolation across KB, memory, and Amazon DynamoDB

 

 

 
custom:role

 
physician

 
Role-based access control (future extensibility)

 

 

 

 
The authorizer is configured during agent deployment:

 

 

AUTHORIZER_CONFIG='{"customJWTAuthorizer":{"discoveryUrl":"'$COGNITO_DISCOVERY_URL'","allowedAudience":["'$COGNITO_WEB_CLIENT_ID'"]}}'

agentcore configure --entrypoint main.py \
 --name healthcare_basic \
 --authorizer-config "$AUTHORIZER_CONFIG" \
 --request-header-allowlist "Authorization"

 

 
The AgentCore Gateway is also configured with JWT authorization, using the same Cognito discovery URL and audience. When the agent calls the gateway, it forwards the user’s original JWT as a Bearer token for validation, along with tenant context headers (X-Tier, X-Clinic-ID, X-S3-Prefix). The gateway validates the token, then propagates the tenant headers to the target Lambda via metadataConfiguration.

 
The target Lambda never receives or processes the user’s JWT directly. Instead, it reads the trusted tenant headers (trusted because only authenticated requests pass the gateway’s CUSTOM_JWT authorizer) and assumes a TVM (Token Vending Machine) role with session tags derived from those headers. The TVM role’s ABAC policy restricts DynamoDB access using dynamodb:LeadingKeys conditions, ensuring each tenant can only query their own clinic’s data at the IAM level, not just application-level filtering.

 

AgentCore Memory
: Conversation history cannot leak between tenants or between multiple users within a tenant. The solution enforces memory isolation at two layers: application-level scoping and IAM-backed Attribute-Based Access Control (ABAC).

 
At the application layer, AgentCore Memory uses a hierarchical namespace structure with a composite actor_id to organize conversation data per tenant:

 

 

actor_id = f"{tier}-{clinic_id}-{user_id}"
# Example: "basic-clinic-a-dr.smith@clinic-a.com"

 

 
Namespaces separate different types of memory:

 

 

clinic/{actor_id}/facts/{session_id} # SEMANTIC --- clinical facts
clinic/{actor_id}/preferences # PREFERENCES -- user preferences

 

 
To enforce isolation at the infrastructure level, the solution uses a Token Vending Machine (TVM) pattern with ABAC. At runtime, the agent assumes a TVM role with Tier, ClinicId, and UserId as session tags, receiving temporary credentials scoped to that tenant’s namespace:

 

 

sts = boto3.client("sts", region_name=region)

response = sts.assume_role(
 RoleArn=tvm_role_arn,
 RoleSessionName=f"mem-{tier}-{clinic_id}-{user_id}",
 DurationSeconds=900,
 Tags=[
 {"Key": "Tier", "Value": tier},
 {"Key": "ClinicId", "Value": clinic_id},
 {"Key": "UserId", "Value": user_id},
 ],
 TransitiveTagKeys=["Tier", "ClinicId", "UserId"],
)

# Create a scoped boto3 session from the temporary credentials
scoped_session = boto3.Session(
 aws_access_key_id=response["Credentials"]["AccessKeyId"],
 aws_secret_access_key=response["Credentials"]["SecretAccessKey"],
 aws_session_token=response["Credentials"]["SessionToken"],
)

# Build a MemoryClient backed by scoped credentials
memory_client = MemoryClient(region_name=region)
memory_client.gmcp_client = scoped_session.client("bedrock-agentcore-control")
memory_client.gmdp_client = scoped_session.client("bedrock-agentcore")

 

 
The TVM role’s trust policy ensures only the agent execution role can assume it, and that all three session tags are present:

 

 

AssumeRolePolicyDocument:
 Statement:
 - Effect: Allow
 Principal:
 AWS: !GetAtt RuntimeAgentCoreRole.Arn
 Action:
 - sts:AssumeRole
 - sts:TagSession
 Condition:
 StringLike:
 aws:RequestTag/Tier: "?*"
 aws:RequestTag/ClinicId: "?*"
 aws:RequestTag/UserId: "?*"

 

 

AgentCore
 
Gateway
: AgentCore Gateway transforms static Lambda functions into dynamic, context-aware agent tools using the Model Context Protocol (MCP). Model Context Protocol is an open-source standard for connecting AI agents to external tools.

 
AgentCore Gateway eliminates the need to build custom tool orchestration logic. Without this, you would need to manually integrate APIs into agent workflows. This involves writing custom code to parse API specifications, handle authentication, manage transformations, implement error handling, and propagate tenant context.

 
The Lambda function exposes two tools through the Gateway:

 

 

patient_context
: Retrieve patient demographics and medical history from the PatientMetadata DynamoDB table.

 

clinic_config
: Get clinic configuration and provider information from the ClinicConfig DynamoDB table.

 

 
As mentioned previously, tenant identity is propagated throughout each component. The agent initializes its MCP Gateway client with tenant-scoped headers (X-Tier, X-Clinic-ID, X-S3-Prefix), so every tool call through the gateway automatically carries tenant context, enforcing data isolation at the gateway layer without per-tool filtering logic. This link provides more information about 
gateway headers
.

 

 

# Define Lambda as MCP target
lambda_target_config = {
 "mcp": {
 "lambda": {
 "lambdaArn": lambda_function_arn,
 "toolSchema": {"inlinePayload": api_specification}
 }
 }
}

# Create gateway with AWS IAM authorization
# The agent's Runtime execution role authenticates via SigV4
gateway = gateway_client.create_gateway(
 name="healthcare-basic-gw",
 roleArn=execution_role_arn,
 protocolType="MCP",
 authorizerType="AWS_IAM",
 description="Healthcare Clinical Document Processing Gateway",
)

# Add Lambda target with tenant header propagation
metadata_config = {
 "allowedRequestHeaders": [
 "X-Tier",
 "X-Clinic-ID",
 "X-S3-Prefix"
 ]
}

credential_config = [{"credentialProviderType": "GATEWAY_IAM_ROLE"}]

create_target_response = gateway_client.create_gateway_target(
 gatewayIdentifier=gateway_id,
 name=f"HealthcareLambda-{tier.title()}",
 targetConfiguration=lambda_target_config,
 credentialProviderConfigurations=credential_config,
 metadataConfiguration=metadata_config,
)

 

 
The gateway supports three authentication mechanisms:

 

 

IAM role:
 For AWS service integrations.

 

Custom JWT:
 For tenant-aware tools (what we’re using).

 

OAuth:
 For third-party API integrations.

 

 

AgentCore Policy:
 AgentCore Policy enforces tier-specific action boundaries on gateway tools using 
Cedar
 authorization policies. The solution creates a shared policy engine attached to both the basic and premium gateways in ENFORCE mode. For the basic tier, a Cedar policy restricts the patient_context tool to business hours (8 AM–6 PM) by evaluating the request_hour field from the tool’s input. The agent must call current_time first and pass the current hour, and the policy engine denies the call if the hour falls outside the allowed window. For the premium tier, the policy permits patient_context unconditionally, giving hospitals 24/7 access. Both tiers get explicit permits for the clinic_config tool since it exposes non-sensitive configuration data. This approach moves access control out of application code and into declarative Cedar policies evaluated at the gateway layer, so tier differentiation is enforced before the Lambda function ever executes.

 

 

# Cedar policy: basic tier --- restrict patient_context to business hours
permit(
 principal is AgentCore::OAuthUser,
 action == AgentCore::Action::"HealthcareLambda-Basic___patient_context",
 resource == AgentCore::Gateway::"{gateway_arn}"
)
when {
 context.input has request_hour &amp;&amp;
 context.input.request_hour &gt;= 8 &amp;&amp;
 context.input.request_hour &lt; 18
};

# Cedar policy: premium tier --- 24/7 patient_context access
permit(
 principal is AgentCore::OAuthUser,
 action == AgentCore::Action::"HealthcareLambda-Premium___patient_context",
 resource == AgentCore::Gateway::"{gateway_arn}"
)
when {
 context.input has patient_id
};

 

 

AgentCore
 
Observability
: AgentCore’s observability integration uses OpenTelemetry baggage to propagate tenant metadata through the entire request lifecycle. OpenTelemetry baggage is a key-value store which lets you propagate additional data alongside trace context. The solution sets tenant identifiers as baggage at the AgentCore Runtime entrypoint, so every downstream span and log entry carries tenant attribution:

 

 

from opentelemetry import baggage, context

# Set tenant context in OTel baggage (at AgentCore Runtime entrypoint)
ctx = baggage.set_baggage("tier", tier)
ctx = baggage.set_baggage("clinic_id", clinic_id, context=ctx)
ctx = baggage.set_baggage("actor_id", actor_id, context=ctx)
context.attach(ctx)

 

 
For example, you can use 
Amazon CloudWatch Logs Insights
 to track volume of requests per clinic

 

 

-- Request volume per clinic from the API Gateway Lambda proxy logs
fields @timestamp, @message
| filter @message like /Tier:/
| parse @message *"*Tier: *, Clinic ID: *, User ID: *, Role: **"* as tier, clinic_id, user_id, role
| stats count() as request_count by clinic_id, tier
| sort request_count desc

 

 
Combined with Bedrock Projects for per-tier cost attribution and structured usage logging for per-clinic token tracking, this gives you tenant-level visibility across model usage, agent execution, and memory operations.

 
Key multi-tenancy implementation patterns

 
This section describes how the solution achieves the core patterns for implementing multi-tenancy with Amazon Bedrock AgentCore.

 
1. Data isolation via per-tier S3 buckets

 
In the healthcare solution example, the system creates a separate S3 bucket per service tier, with tenant-specific prefixes within each bucket. Each tier’s Knowledge Base has its own dedicated S3 bucket, providing bucket-level isolation between tiers. Within each bucket, hierarchical prefixes organize tenant data, enabling isolation through path-based access control and Knowledge Base metadata filtering:

 

 

s3://healthcare-basic-kb-{suffix}/
├── basic-tier/
│ ├── clinic-a/
│ │ ├── appointment-notes/
│ │ ├── lab-results/
│ │ ├── patient-intake/
│ │ └── prescriptions/
│ ├── clinic-b/
│ ├── clinic-c/
│ └── clinic-d/

s3://healthcare-premium-kb-{suffix}/
├── premium-tier/
│ ├── hospital-a/
│ │ ├── surgical-notes/
│ │ ├── pathology-reports/
│ │ └── imaging-studies/
│ ├── hospital-b/
│ ├── clinic-e/
│ └── clinic-f/

 

 
Within each bucket, the S3 prefix is constructed from tenant identity extracted from Cognito JWT claims (custom:tier, custom:clinic_id). This prefix is then used in two ways: it’s passed as an X-S3-Prefix header on every MCP Gateway tool call for gateway-level enforcement, and the document retrieval tool enforces isolation through 
Amazon Bedrock Knowledge Base
 metadata filter on clinic_id:

 

 

response = client.retrieve(
 knowledgeBaseId=kb_id,
 retrievalQuery={"text": query},
 retrievalConfiguration={
 "vectorSearchConfiguration": {
 "filter": {"equals": {"key": "clinic_id", "value": clinic_id}},
 }
 },
)

 

 
2. Cost attribution via Bedrock Projects and structured usage logging

 
Cost attribution operates at two levels: per-tier through Bedrock Projects, and per-clinic through structured usage logging.

 

Per-tier attribution with Bedrock Projects
: Each tier has a dedicated Bedrock Project tagged with cost allocation metadata (CostCenter, Tier, Application). The project ID is passed on every inference request through the Bedrock Mantle endpoint, so all model invocation costs are automatically segmented by tier in AWS Cost Explorer.

 

 

# Project configuration per tier
TIER_PROJECTS = {
 "basic": {
 "name": "Healthcare-Basic",
 "tags": {
 "Application": "HealthcareDemo",
 "Tier": "Basic",
 "Environment": "demo",
 "CostCenter": "HC-Basic",
 },
 },
 "premium": {
 "name": "Healthcare-Premium",
 "tags": {
 "Application": "HealthcareDemo",
 "Tier": "Premium",
 "Environment": "demo",
 "CostCenter": "HC-Premium",
 },
 },
}

 

 
At runtime, the agent passes the project ID on every inference request through the Bedrock Mantle (OpenAI-compatible) endpoint. This means every model invocation is automatically tagged with the tier’s cost metadata:

 

 

# Project ID loaded from SSM at agent initialization
project_id = get_ssm_parameter(config["project_ssm"])

self.model = OpenAIModel(
 client_args={
 "base_url": mantle_base_url,
 "api_key": api_key,
 "project": project_id, # Tags every inference call for cost attribution
 },
 model_id=model_id,
)

 

 
Once you activate cost allocation tags in AWS Billing (tags may take up to 24 hours to propagate), you can filter and group inference costs by CostCenter, Tier, or Application in AWS Cost Explorer. This gives you per-tier cost visibility. For example, comparing the cost of running Ministral 3 8B Instruct for basic tier clinics against GPT OSS 120B for premium tier hospitals.

 

Per-clinic attribution with structured usage logging:
 Bedrock Projects have a limit of 1,000 per account and are recommended for application-level boundaries. For per-clinic cost granularity, the solution logs token usage after each agent invocation as structured JSON with the tenant context already flowing through the system:

 

 

def _log_usage(self, result) -&gt; None:
 usage = result.metrics.accumulated_usage
 logger.info(json.dumps({
 "event": "inference_usage",
 "tier": self.tier,
 "clinic_id": self.clinic_id,
 "user_id": self.user_id,
 "model_id": self.model_id,
 "input_tokens": usage.get("inputTokens", 0),
 "output_tokens": usage.get("outputTokens", 0),
 "total_tokens": usage.get("totalTokens", 0),
 }))

 

 
The Strands SDK automatically tracks token consumption (input, output, and cache metrics) on every agent invocation through the AgentResult.metrics object. By pairing this with the clinic_id from the tenant context, each log entry attributes token usage to a specific clinic. These logs land in CloudWatch and can be queried with Logs Insights to compute per-clinic usage:

 

 

fields @timestamp, clinic_id, tier, model_id, input_tokens, output_tokens
| filter event = "inference_usage"
| stats sum(input_tokens) as total_input,
 sum(output_tokens) as total_output,
 count() as invocations
 by clinic_id, tier
| sort total_output desc

 

 
To estimate costs, you can multiply the token counts by the published per-token pricing for each model.

 
3. Rate limiting via API Gateway

 
The rate limiting for each tier is enforced using API Gateway 
usage plans
. The solution uses separate usage plans per tier with the following configuration:

 

 

basic-tier-plan:
 throttle: {rate_limit: 2, burst_limit: 5}
 quota: {limit: 50, period: DAY}

premium-tier-plan:
 throttle: {rate_limit: 10, burst_limit: 20}
 quota: {limit: 500, period: DAY}

 

 
Cleanup

 
To avoid ongoing charges, you can delete the deployed resources when you no longer need them. A 
cleanup.sh
 helper script (under the scripts/ folder) is provided to assist with the cleanup of resources created for this solution.

 
Conclusion

 
Building multi-tenant AI applications requires careful attention to data isolation, service differentiation, cost attribution, and scalability. Amazon Bedrock AgentCore provides a robust foundation for addressing these requirements through native platform capabilities. The key takeaway from this implementation is that multi-tenancy doesn’t require complex application-level isolation logic. By combining AWS services like Cognito for identity, S3 prefixes for data isolation, API Gateway for rate limiting, Bedrock Projects and structured logging for cost attribution and Bedrock AgentCore for AI orchestration, you can build secure, scalable, and cost-effective multi-tenant AI applications with minimal custom code. You can apply these patterns to any multi-tenant agentic applications you are building.

 
Further reading

 

 
View the complete source code on 
GitHub

 

Learn more about Amazon Bedrock AgentCore

 

Building multi-tenant agents with Amazon Bedrock AgentCore

 

 

 

 

 

 

 

 

 

 

 

 
About the authors

 

 

 

 

 

 
Ashley Chen

 
Ashley is a Solutions Architect at Amazon Web Services, based in Washington DC. She works with ISV customers to design and build scalable solutions on AWS, with a focus on data engineering, analytics, and agentic AI. Ashley is a member of the ISV and SaaS Technical Field Communities and an AI-DLC Champion, advocating for human-in-the-loop development methodology. She enjoys creating hands-on workshop content. Prior to AWS, Ashley worked as a cloud engineer at a SaaS company, building and operating cloud-native solutions. Outside of work, she is a classical flutist.

 

 

 

 

 

 
Sushanth Mangalore

 
Sushanth is a Solutions Architect at Amazon Web Services, based in Chicago, IL. He is a technologist helping organizations build solutions on AWS to achieve their key business objectives. He is passionate about software architecture and advocates modern technologies like containers and serverless. Sushanth is a speaker at AWS events like re:Invent and summits, and enjoys writing technical content. Prior to AWS, Sushanth spent several years as a developer and architect for large enterprises, building solutions across many technologies and business domains.
