---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-and-connecting-a-production-ready-ecommerce-mcp-server-using-amazon-bedrock-agentcore-and-mistral-ai-studio
ingested: 2026-07-09
feed_name: AWS China ML
source_published: 2026-07-08
sha256: "e810d0f6ad1cf612a8f82ceac4b2e4ec61ef44238744d1c9fd0913063b51281a"
---

# Building and connecting a production-ready ecommerce MCP server using Amazon Bedrock AgentCore and Mistral AI Studio

When ecommerce teams need faster time-to-market for AI-powered customer experiences, they face weeks of custom integration work that delays launches and increases security risks. Building and connecting a production-ready AI assistant typically requires custom API code for each client, container infrastructure management, and complex authentication. Amazon Bedrock AgentCore and Mistral AI Studio streamline this process. A production-ready ecommerce Model Context Protocol (MCP) server on Amazon Bedrock AgentCore, connected to Mistral AI Studio, streamlines development. The MCP provides standardized integration protocols, AgentCore Runtime manages containers and validates tokens, and Amazon Cognito handles identity.

In this post, you build and connect that server end to end. You will implement MCP tools, set up two-layer JSON Web Token (JWT) authentication, deploy with AWS Cloud Development Kit (AWS CDK), and connect the result to [Mistral AI’s Vibe](<https://mistral.ai/products/vibe/>). The post also covers prerequisites, solution architecture, best practices for MCP servers and Vibe connectors, and resource cleanup. The ecommerce server that you build supports product search, order placement, review submission, and returns processing using Amazon DynamoDB for data and Amazon Cognito for identity management.

Amazon Bedrock AgentCore is a platform to build, connect, and optimize AI agents at scale. Within it, AgentCore Runtime is the fully managed serverless component for hosting agent and MCP workloads, with session isolation, long-running request support, built-in JWT validation, and observability, so you don’t manage containers, load balancers, or auth middleware. In this post, you build the MCP server with Python and FastMCP, then deploy it to Runtime for managed hosting. Amazon Cognito manages user identity through OAuth 2.1, keeping each customer’s data isolated. With MCP, you write one server that multiple AI clients connect to, rather than building a separate integration for each client. Mistral AI’s Vibe gives users a conversational interface to the server on web, iOS, and Android.

By the end, you will have a working ecommerce MCP server that authenticates users through Amazon Cognito, scopes data access per customer, and responds to natural language queries from Vibe. Because the server uses the MCP standard, other MCP-compatible clients can also connect to it.

To see the solution in action, watch the following demo. Then, explore the full post for a detailed guide on implementing your own production-ready MCP server and querying it from Vibe.

## Prerequisites

You need an [AWS account](<https://aws.amazon.com/account/>) with permissions to create [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>) tables (NoSQL database), [Amazon Cognito](<https://aws.amazon.com/cognito/>) user pools (user identity, OAuth 2.1), AWS Identity and Access Management (IAM) roles, and [Amazon Elastic Container Registry (Amazon ECR)](<https://aws.amazon.com/ecr/>) repositories, and to access [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) (platform for building and running AI agents). For local development tools, install Python 3.10 or later, Node.js 18 or later, AWS CDK (`npm install -g aws-cdk`), the AWS Command Line Interface (AWS CLI) configured with credentials, and the [Amazon Bedrock AgentCore CLI](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html>) (`pip install bedrock-agentcore`). You also need a Mistral AI account with access to Vibe. Docker isn’t required because AgentCore Runtime builds container images in the cloud using AWS CodeBuild.

## Solution overview

We show you how to build an ecommerce MCP server that performs real shopping operations: searching products, placing orders, submitting reviews, and processing returns. You work with three layers:

  1. **Application layer:** The MCP server is a Python application built with [FastMCP](<https://gofastmcp.com/getting-started/welcome>), a framework for building MCP servers. It exposes six ecommerce tools through an `/mcp` endpoint and a `/health` endpoint for monitoring. AgentCore Runtime runs the server as a container.
  2. **Data layer:** Five Amazon DynamoDB tables store ecommerce data: Products, Customers, Orders, Reviews, and Returns. You provision the tables with on-demand capacity for automatic scaling. Global Secondary Indexes support efficient query patterns.
  3. **Security layer:** Two-tier authentication that keeps each customer’s data private. Amazon Cognito serves as the identity provider, AgentCore Runtime validates JWT tokens at the infrastructure level, and the application extracts user-specific attributes to scope data access to the authenticated customer.



You deploy the solution using AWS CDK with four infrastructure stacks. The DynamoDBStack creates the five data tables with indexes and configures them for straightforward teardown in development environments. The CognitoStack provisions the user pool with custom attributes for customer identification and creates OAuth 2.1 app clients configured for Mistral AI Vibe integration. The DataLoaderStack uses an AWS Lambda custom resource to seed the database with realistic test data (50 products, 10 customers, 50 orders, reviews, and returns), so you can test the server immediately after deployment. The AgentCoreRuntimeStack creates an IAM role with the required permissions, provisions an ECR repository for the container image, and stores configuration parameters that the deployment command references.

Figure 1. Request flow architecture for the ecommerce MCP server

The diagram illustrates the request flow when a user interacts with the ecommerce MCP server through Mistral Vibe. Before the first request, the user authenticates through an OAuth 2.1 login flow: Vibe opens a Cognito-hosted login page, the user enters their credentials, and Cognito issues a JWT token that Vibe stores for the session. When a user asks, “Show me my recent orders,” the AI model determines it needs to call the `get_order_history` MCP tool and sends an MCP request over HTTPS to the AgentCore endpoint. The request includes the Bearer JWT token from the OAuth 2.1 login flow. Before reaching the application code, AgentCore’s JWT Validator verifies the token with Cognito User Pool. It checks the signature, expiration, and client authorization, then rejects invalid tokens. Once validated, the request reaches the MCP Server container, which calls Cognito to retrieve the customer ID attribute that links the authenticated user to their ecommerce profile. With the customer identity confirmed, the server queries the relevant DynamoDB tables. The operation is scoped to only that customer’s data to enforce privacy and isolation. The server then sends the structured response back through AgentCore to Vibe, which generates a natural language answer like “You have 2 recent orders: Order #1234 for Wireless Headphones (delivered) and Order #1236 for Laptop Stand (processing).”

This architecture uses layered security. AgentCore Runtime authenticates requests at the infrastructure layer by validating the JWT signature and expiration. The application then uses the authenticated identity to scope data access to that specific customer’s orders, reviews, and returns, so one user can’t access another user’s data. The serverless design scales based on demand, and stateless containers distribute across availability zones.

## Technical walkthrough

In this section, we walk through the key components of the ecommerce MCP server, from project structure and tool definitions to authentication and deployment on Amazon Bedrock AgentCore.

### Project organization

You can find the complete source code and detailed implementation at this [GitHub repo.](<https://github.com/aws-samples/mistral-on-aws/tree/main/MCP/Ecommerce_MCP_Server>) Three main components work together to form the MCP server:

  * The MCP server application lives in the `mcp_server/` directory and contains the core business logic. `server.py` defines the six ecommerce tools using FastMCP decorators and configures the HTTP transport. `utils/auth.py` handles customer identity extraction from JWT tokens. `utils/dynamodb_client.py` provides a clean interface to the five DynamoDB tables, handling common operations like product search, order creation, and review queries.
  * The infrastructure code in `ecommerce-mcp-cdk/` defines the AWS resources using CDK stacks. The DynamoDB stack creates five tables with appropriate indexes for efficient queries. The Cognito stack provisions the user pool with custom attributes and two OAuth clients, one for general API access and one specifically configured for Mistral AI Studio. The `DataLoader` stack seeds the database with realistic test data on first deployment. The `AgentCoreRuntime` stack creates the IAM execution role with appropriate permissions for DynamoDB, Cognito, and Amazon CloudWatch, provisions the ECR repository for container images, and stores configuration values in SSM Parameter Store for reference during deployment.
  * The deployment configuration is captured in `.bedrock_agentcore.yaml`, which is generated by the `agentcore configure` command. This file tells AgentCore where to find the Cognito user pool for JWT validation, which client IDs are authorized to connect, and which request headers should be forwarded to the application.



### Defining MCP tools

You define MCP tools as Python functions decorated with `@mcp.tool()`. The function’s parameters, type hints, and docstring become the tool schema. The AI model reads this schema to decide when and how to call each tool.

Here’s an example showing how the order history tool is defined with authentication:
    
    
    @mcp.tool()
    def get_order_history(limit: int = 10) -> dict:
        """
        Get order history for the authenticated user.
    
        REQUIRES AUTHENTICATION - Pass Authorization header.
    
        Args:
            limit: Maximum number of orders to return
    
        Returns:
            List of past orders with status, product details, and pricing
        """
        customer_id = get_current_customer_id()
        if customer_id == 'anonymous':
            return {"success": False, "error": "Authentication required"}
    
        try:
            orders = db.get_customer_orders(customer_id, limit=limit)
            # Enrich orders with product names
            enriched_orders = []
            for order in orders:
                product_id = order.get('product_id')
                if product_id:
                    product = db.get_product(product_id)
                    if product:
                        order['product_name'] = product.get('name', 'Unknown Product')
                        order['product_category'] = product.get('category', 'Unknown')
                enriched_orders.append(order)
            return {"success": True, "order_count": len(enriched_orders), "orders": enriched_orders}
        except Exception as e:
            return {"success": False, "error": str(e)}

This tool demonstrates several important patterns. The docstring clearly states “REQUIRES AUTHENTICATION” so the AI model understands this tool needs a logged-in user. The first lines check the customer identity and immediately return an error if the user is anonymous. This is defense in depth even though AgentCore Runtime has already validated the JWT at the infrastructure layer. The response enriches order data by joining with product information, returning both machine-readable IDs and human-friendly labels so the AI model can generate natural language responses without making additional calls.

You configure the server for stateless operation, which AgentCore requires for load balancing:
    
    
    mcp = FastMCP("ecommerce-mcp-server")
    mcp_app = mcp.http_app(path="/mcp", stateless_http=True)

### Two-layer authentication

You split authentication across two layers, each with a specific responsibility. AgentCore Runtime owns cryptographic validation. The application code only needs to resolve the validated token into a customer identity.

At the infrastructure layer, AgentCore Runtime validates every JWT before it reaches the application. It verifies the cryptographic signature against Cognito’s public keys and checks the issuer, expiry, and client ID against the allowed list. Invalid tokens are rejected immediately. The application code doesn’t run for unauthenticated requests.

At the application layer, the server resolves the validated JWT into a customer identity. Since OAuth 2.1 tokens don’t include custom attributes in their payload, the server calls Cognito to retrieve the `custom:customer_id` that links the user to their ecommerce data. It uses a dual-method approach to handle different token types:
    
    
    def extract_customer_id_from_token(access_token: str) -> Optional[str]:
        """
        Extract custom:customer_id from a Cognito access token.
    
        Handles OAuth 2.1 tokens using AdminGetUser via IAM.
        """
        cognito = boto3.client('cognito-idp', region_name=AWS_REGION)
    
        # Primary method: AdminGetUser for OAuth 2.1 Authorization Code tokens
        try:
            payload = _decode_jwt_payload(access_token)
            username = payload.get('username') or payload.get('sub')
            user_pool_id = payload.get('iss', '').rstrip('/').split('/')[-1]
    
            if username and user_pool_id:
                user_info = cognito.admin_get_user(
                    UserPoolId=user_pool_id,
                    Username=username
                )
                for attr in user_info['UserAttributes']:
                    if attr['Name'] == 'custom:customer_id':
                        return attr['Value']
        except (ClientError, Exception):
            pass
    
        # Fallback method: get_user() for token types with admin scope
        try:
            user_info = cognito.get_user(AccessToken=access_token)
            for attr in user_info['UserAttributes']:
                if attr['Name'] == 'custom:customer_id':
                    return attr['Value']
        except ClientError:
            pass
    
        return None

The primary method decodes the JWT payload to extract the username and user pool ID, then calls `admin_get_user()` using IAM permissions. This approach handles OAuth 2.1 tokens from Mistral Le Chat. The fallback method calls `get_user()` directly when tokens include admin scope. After it’s retrieved, the customer ID is stored in request context and used by authenticated tools to scope database operations to that user’s data.

Note: AgentCore Identity supports custom claims in JWT tokens, which can forward attributes like `customer_id` directly to your application without an additional API call. For more information, see [Configuring OAuth for AgentCore Runtime](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-oauth.html>) and [Inbound JWT Authorizer](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/inbound-jwt-authorizer.html>). This post uses the explicit `admin_get_user()` approach instead, because it works with OpenID Connect (OIDC)-compatible identity providers and shows the full authentication flow step by step.

### Deployment workflow

Deploying the MCP server involves four steps: infrastructure provisioning, user creation, AgentCore configuration, and container deployment.

**Infrastructure provisioning** uses AWS CDK to create the required resources. Running `cdk deploy --all` from the `ecommerce-mcp-cdk` directory deploys four stacks in sequence. The deployment takes about 5 minutes and outputs the values needed for the next steps. These include the IAM role ARN, ECR repository URI, Cognito discovery URL, and client IDs. These values are also stored in SSM Parameter Store for quick retrieval.

**User creation** seeds the Cognito user pool with demo accounts. The `create_cognito_users.py` script creates ten test users (demo1@example.com through demo10@example.com) and assigns each a unique customer ID that links them to their orders and reviews in DynamoDB.

**AgentCore configuration** tells the runtime how to validate tokens and forward requests. The `agentcore configure` command creates the `.bedrock_agentcore.yaml` file with the necessary settings:
    
    
    agentcore configure \
      -e server.py \
      -p MCP \
      -n ecommerce_mcp_server \
      -er $ROLE_ARN \
      -ecr $ECR_URI \
      -ac '{"customJWTAuthorizer":{"discoveryUrl":"$DISC_URL","allowedClients":["$CLIENT_ID","$MISTRAL_CLIENT_ID"]}}' \
      -rha "Authorization" \
      -r us-west-2 \
      --non-interactive

The key configuration elements in the generated YAML file are:
    
    
    authorizer_configuration:
      customJWTAuthorizer:
        discoveryUrl: https://cognito-idp.us-west-2.amazonaws.com/us-west-2_xxxxx/.well-known/openid-configuration
        allowedClients:
          - xxxxxxxxxxxxxxxxxxxxxxxxxx  # mcp-client
          - yyyyyyyyyyyyyyyyyyyyyyyyyy  # mistral-oauth-client
    request_header_configuration:
      requestHeaderAllowlist:
        - Authorization

The `discoveryUrl` points to Cognito’s OIDC configuration endpoint, where AgentCore fetches the public keys for JWT verification. The `allowedClients` list restricts access to authorized OAuth clients. The `requestHeaderAllowlist` tells AgentCore to forward the Authorization header to the application. Without this setting, requests would appear anonymous.

Container deployment uses the `agentcore deploy` command, which orchestrates a cloud-based build and deployment. AgentCore creates a CodeBuild project in your AWS account, uploads your source code to Amazon Simple Storage Service (Amazon S3), and builds an ARM64 Docker image in CodeBuild. You don’t need Docker installed locally. AgentCore then pushes the image to ECR and calls the Bedrock AgentCore API to create and start the runtime. The first invocation has a cold start of 10 to 20 seconds while the container initializes. Subsequent requests within the session respond in milliseconds.

### The complete flow diagram

> The diagram demonstrates how the solution works across four distinct phases.

Figure 2. Four-phase architecture showing one-time setup, OAuth 2.1 connection flow, and per-request authentication

During the setup phase, a developer runs cdk deploy to create the AWS resources. These include the Cognito User Pool, OAuth app clients, five DynamoDB tables, IAM roles, and SSM parameters. The developer then configures AgentCore Runtime with the Cognito user pool and authorized client IDs, and runs agentcore deploy to build and deploy the MCP server container.

The Connect phase happens once per user session. The user opens Vibe, adds a custom MCP connector with OAuth 2.1, and enters the AgentCore server URL and OAuth credentials. When they click Connect, Mistral discovers the Cognito identity provider and opens a browser popup for login. After the user authenticates, Cognito issues a JWT Bearer token that Mistral stores and automatically refreshes throughout the session.

The Discovery phase also happens once per session, immediately after authentication. Mistral sends a `list_tools()` request to AgentCore with the Bearer token. AgentCore validates the JWT and forwards the request to the MCP Server, which returns the six available tools and their parameter schemas. Mistral now knows which operations the server supports and what arguments each tool accepts.

The Request phase occurs with every interaction. When a user asks “What electronics are in stock under $500?”, Mistral sends an MCP request to AgentCore with the JWT token. AgentCore validates the token with Cognito by checking signature, expiration, and client authorization. Once validated, the request reaches the MCP Server. The server extracts the customer identity from Cognito, queries DynamoDB for the requested data scoped to that customer, and returns formatted results. Mistral then generates a natural language response for the user.

This architecture separates deployment from runtime authentication, validates tokens at the infrastructure layer, discovers available tools before the first request, and scopes data access to the authenticated customer.

## Best practices for MCP implementation

The following guidelines cover building and securing your MCP server on Amazon Bedrock AgentCore, and connecting it safely to Mistral Vibe.

### Building MCP servers with AgentCore

When building MCP servers for deployment on Amazon Bedrock AgentCore, focus on clear tool design, layered security, and production-ready operations.

#### Write tool descriptions that help AI models call the right function

AI models rely heavily on tool descriptions when deciding which function to call. Clear, explicit documentation in your tool’s docstring directly affects how accurately the model selects and invokes tools.

  * Limit tool count per server: Keep each server focused with 5–8 well-defined tools rather than dozens of overlapping functions. Each additional tool increases the model’s decision complexity. If you need more operations, split them across multiple MCP servers grouped by domain (for example, one server for order management and another for product catalog). AI clients like Vibe can connect to multiple servers in a single session.
  * Explicit parameter guidance: Include examples in docstrings (“for example, ‘laptop’, ‘wireless headphones’”) and call out common mistakes (“Do NOT pass ‘in stock’ as query text, use the in_stock_only parameter”).
  * Return structured responses: Include both machine-readable identifiers (order_id, product_id) and human-readable labels (product_name, status) so the model can generate natural responses without follow-up calls.



#### Implement layered security

AgentCore Runtime validates JWTs at the infrastructure layer, but application-level checks are equally important for defense in depth.

  * Validate at the tool level: Check user identity at the start of every protected function, even though AgentCore Runtime blocks unauthenticated requests at the edge. Return clear error messages for anonymous users.
  * Verify data ownership: Before mutations, confirm the resource belongs to the authenticated user (for example, verify `order.customer_id` matches the token’s `customer_id`) to prevent unauthorized access.
  * Apply least privilege IAM: Scope the AgentCore Runtime execution role to specific actions on specific resources. Grant only GetItem, PutItem, Query on named table ARNs, with no wildcard permissions.
  * Enforce tool-call boundaries with AgentCore Policy: Use AgentCore Policy to intercept tool calls before they execute. Define rules that validate which tools can be called, verify that parameters fall within acceptable ranges (for example, limit quantity to 1-100 on order placement), and reject calls that fall outside defined boundaries.
  * Use AgentCore Gateway for API management: Place AgentCore Gateway in front of your runtime to manage rate limiting, request routing, and additional access controls at the API layer.
  * Descope tokens before passing to tools: When forwarding a JWT to a tool, strip it to only the claims the tool needs. Don’t pass the full token with all scopes and attributes. This follows the principle of least privilege for token propagation and limits exposure if a tool is compromised.



#### Build for production operations

AgentCore Runtime manages container orchestration, but your server code should support reliable deployment and troubleshooting.

  * Configure stateless mode: Set `stateless_http=True` in `mcp.http_app()` so AgentCore can distribute requests across container instances without session affinity.
  * Deploy infrastructure as code: Use CDK or Terraform to make your entire stack reproducible. Include `RemovalPolicy` settings appropriate for dev vs production environments.
  * Seed with realistic test data: Include a data loader that populates tables with representative records so you can validate tool behavior immediately after deployment.



### Connecting MCP servers to Mistral Vibe

When connecting MCP servers to Mistral Vibe, verify that each server is trusted, properly authenticated, and scoped to only the permissions it needs.

#### Only add trusted MCP servers

We highly recommend connecting only to your own MCP servers or to trusted, well-documented servers, especially for tools that can run code or access sensitive systems.

Like for any web service, MCP server security starts with security basics. A good server should:

  * Require strong authentication (OAuth, tokens that do expire).
  * Enforce clear authorization rules.
  * Use secure connections and session handling to prevent hijacking.



Before giving a connector access to your sensitive data, make sure the MCP server passes this baseline check.

There are several ways a malicious MCP server can trick you into causing trouble:

  * Prompt injection: Hidden commands or instructions embedded in tool descriptions or metadata can trick the model into performing unintended actions.
  * Tool shadowing and typo squatting: Malicious or lookalike tools with similar names can silently override legitimate ones, leading to unexpected tool call and unintended behavior.
  * Over-exposure: Granting more access or functionality than needed increases your threat surface for no benefit.
  * Privilege escalation through token forwarding: Passing the user’s full JWT to a tool gives that tool the user’s complete privileges. A compromised tool could access resources beyond its scope. Pass only the minimum claims each tool needs.



Even a seemingly harmless tool can become a security risk if it’s deceptive and has been given enough access to your workflows. Of course, this concern doesn’t apply in the case of the ecommerce MCP server we are building ourselves.

Note that if you’re part of an enterprise Vibe plan, we only allow administrators of the plan to add custom connectors to avoid the types of security issues documented in the preceding section.

#### Control the number of MCP connectors enabled

Adding Connectors in Vibe expands what your Mistral models can do, but it also introduces trade-offs. Each new Connector adds complexity that the model must manage. Some Connectors expose dozens of functions. With only 10 Connectors active, the model might have to choose among more than 150 possible functions before deciding which one to call.

More connectors can lead to a higher chance of error, as each additional integration increases the likelihood of misconfigured parameters, wrong tool or function call, or unexpected behaviors. Whenever feasible, we recommend limiting to 5–6 connectors active at a time.

#### Craft clean prompts

Even with the right Connectors, the quality of the output depends heavily on the quality of the input.

Ambiguous prompts lead to poor performance. If your request is vague, the large language model (LLM) might misinterpret the task or provide irrelevant results.

To write better prompts in Vibe:

  * Name the tool and action explicitly: 
    * _“Find the Q2 report”_ _– >_ _“Use Notion to search for Q2 Revenue Report”_
  * Specify parameters: 
    * _“Show me John’s emails” ????_ “ _List Gmail emails from John Smith in the last 7 days”_
  * Define scope/format: 
    * _“Check what’s planned on Monday” ???? “Check Calendar and return only event titles for Monday in a bullet list”_



## Clean up resources

To avoid ongoing charges, remove the resources created in this walkthrough. First, stop the AgentCore Runtime by running `agentcore delete --name ecommerce_mcp_server`. Then tear down the CDK stacks by running `cdk destroy --all` from the `ecommerce-mcp-cdk` directory. This deletes the Amazon DynamoDB tables, Amazon Cognito user pool, IAM roles, Amazon ECR repository, and related resources. The DynamoDB tables use `RemovalPolicy.DESTROY`, so they’re deleted automatically. Verify that the resources have been removed by checking the AWS CloudFormation console.

## Conclusion

This blog post walked through building a production-ready ecommerce MCP server using Amazon Bedrock AgentCore, Amazon DynamoDB, and Amazon Cognito, then connecting it to Mistral AI’s Vibe. We covered how to define MCP tools with clear AI-friendly documentation, implement two-layer authentication where AgentCore validates JWT tokens at the infrastructure level while the application enforces data ownership rules, deploy the solution using CDK infrastructure as code, and establish best practices for both server development and client integration. The complete source code, deployment scripts, and step-by-step guide are available in this [Github repository](<https://github.com/aws-samples/mistral-on-aws/tree/main/MCP/Ecommerce_MCP_Server>).

The patterns in this solution apply to other domains. If you’re new to MCP, clone the repository and deploy the ecommerce server as-is. Experiment with the tools in Vibe to see how MCP request and response cycles work. Then modify a single tool to return data from your own system. If you already run workloads on AgentCore Runtime, replace the ecommerce tools with your domain-specific operations, such as a customer support tool that queries a ticket database or a financial services tool that retrieves transaction records. If you’re preparing for production, add Amazon CloudWatch dashboards for request latency and error rates, integrate AWS WAF for additional request filtering, and use Amazon EventBridge to trigger notifications on order events.

To explore related solutions, check out [AWS for Autonomous Agents](<https://aws.amazon.com/ai/agentic-ai/>) for broader agent architecture patterns, the [Amazon Bedrock AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-get-started-toolkit.html>) for advanced features like memory persistence and policy enforcement, and [Mistral AI’s integration guides](<https://docs.mistral.ai/>) for connecting additional enterprise tools to Vibe. For the AWS services used in this post, see the [Amazon DynamoDB Developer Guide](<https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/>), the [Amazon Cognito Developer Guide](<https://docs.aws.amazon.com/cognito/latest/developerguide/>), the [AWS CDK Developer Guide](<https://docs.aws.amazon.com/cdk/v2/guide/home.html>), the [FastMCP documentation](<https://gofastmcp.com>), and the [Model Context Protocol specification.](<https://modelcontextprotocol.io/specification/2025-11-25>) We’d love to hear how you’re using MCP and AgentCore Runtime in your applications. Share your experiences in the comments or reach out to the AWS AI services team.

* * *

## About the authors

### Ying Hou, PhD

Ying is a Senior Specialist Solutions Architect at Amazon Web Services, focused on Generative AI infrastructure and frameworks. Based in London, she works with customers to pre-train, post-train, and host large language models for inference using AWS infrastructure, with deep expertise in Amazon SageMaker HyperPod. Ying helps organizations design and optimize their ML training and inference workloads at scale, enabling them to get the most out of GPU clusters, distributed training, and efficient model serving on AWS.

### Samuel Barry

Samuel is an Applied Scientist at Mistral AI, where he leads post-training initiatives for frontier language models with a focus on synthetic data generation, evaluation, model scaling, supervised fine-tuning, and reinforcement learning. His work spans both internal model development and strategic customer engagements, contributing to advances in multimodal AI, alignment, and safety while helping deploy cutting-edge AI systems in real-world applications.

### Siddhant Waghjale

Siddhant is an Applied Scientist at Mistral AI, working on pre-training, post-training for language models with a focus on code and cybersecurity use cases. His work spans SFT, RL and building environment generation pipelines for producing training data across a range of tasks.
