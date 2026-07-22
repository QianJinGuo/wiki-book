---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-highly-scalable-serverless-langgraph-multi-agent-system/
ingested: 2026-06-01
sha256: 7c1658637bd7ef5f
---

# Build highly scalable serverless LangGraph multi-agent systems in AWS with Amazon Bedrock AgentCore

Generative AI has rapidly evolved from experimental prototypes into systems that are expected to operate reliably in production, at scale, and under real-world performance constraints. As organizations move beyond demos and proofs of concept, they increasingly encounter challenges related to inference latency, scalability, state management, and operational visibility. Building high-performance AI agents today requires more than powerful models and demands an implementation that can deliver consistent performance, preserve context across interactions, and provide deep observability into how agents reason and behave in production.

In this post, we provide a solution to build highly scalable, serverless multi-agent generative AI systems on AWS using [LangGraph Agents](https://www.langchain.com/langgraph) as orchestrators integrated with [Amazon Bedrock AgentCore Memory](https://aws.amazon.com/bedrock/agentcore/) and [Amazon Bedrock AgentCore Observability.](https://aws.amazon.com/bedrock/agentcore/)

Our approach for building highly scalable serverless multi-agent orchestrations combines serverless technologies such as [AWS Lambda](https://aws.amazon.com/lambda/) and [AWS Step Functions](https://aws.amazon.com/step-functions/). These services can be used by developers to build LangGraph agents that scale automatically, respond to events in real time, and remove infrastructure management. This makes them ideal for dynamic, bursty agent workloads. By combining these services, you can orchestrate complex multi-tool agent workflows with durable state management, retries, and fine-grained cost control.

LangGraph’s explicit graph-based execution model enables deterministic coordination, parallelism, and conditional routing between agents, making complex multi-agent workflows more straightforward to reason and debug. By separating orchestration logic from agent behavior, you can use LangGraph to add, remove, or evolve specialized agents independently while maintaining a clear, auditable execution path. This is especially valuable for production systems that require predictable behavior, extensibility, and structured control over multi-agent reasoning.

AgentCore Observability extends these capabilities by providing detailed visibility into each invocation, capturing model inputs/outputs, latency, and tool-chain metrics across distributed serverless components. Integrated memory services from AgentCore Memory enable agents to maintain short-term conversational context and long-term knowledge across sessions.

## Solution overview

Our serverless LangGraph and AgentCore based multi-agent orchestration system solution is a generative AI-powered multi-agent campaign review system that orchestrates human reviews using diverse personas that enable marketing campaigns to resonate authentically with target audiences while maintaining legal alignment and brand standards. It consists of three specialized AI agents that analyze the marketing campaign in parallel – a persona reviewer agent reviews content from diverse demographic perspectives and provides resonance scoring, a validator agent verifies legal alignment and brand guideline adherence, while a finalizer agent then synthesizes feedback into actionable recommendations. Users upload campaign documents through a [React](https://react.dev/) frontend that also polls for results and displays reviews as they become available.

We use LangGraph to implement the orchestrator and specialized agents by modeling the system as a stateful execution graph. Each node represents a discrete agent function specifically persona review, compliance validation, and feedback synthesis—and edges define the control flow between these steps. The orchestrator is implemented as the supervising graph that routes execution, triggers parallel branches for specialized agents, and collects their outputs for final aggregation.The LangGraph orchestrator and specialized agents are together packaged as a Docker container.

We use AWS Lambda as the serverless managed runtime in AWS for our Strands agents to scale automatically, respond to events in real time, and remove infrastructure management. Our orchestrator agent displays its functionality as REST interfaces provided by [Amazon API Gateway](https://aws.amazon.com/api-gateway/).

Our Agent implementation uses AgentCore Observability to provide detailed visualizations of each step in the agent workflow, enabling developers to inspect execution paths, audit intermediate outputs, and debug performance bottlenecks. Within AgentCore Observability, we provide real-time visibility within Amazon CloudWatch into operational performance dashboards and telemetry for key metrics such as traces, session count, latency, duration, token usage, and error rates.

We use AgentCore Memory for two key use cases within our Agent implementation specifically for multi-agent shared memory to provide both context and shared memory across independent agent runs and to provide support for multi-turn conversations. You can extend this implementation to provide an AI assistant natural language interface as our implementation using AgentCore Memory provides built-in support for storing conversational state and history. The following architecture diagram illustrates the various components of our solution.

[![architecture diagram describing the multi agent langgraph and agentcore deployment](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-201651.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-201651.png)

## Prerequisites

Complete the following prerequisites:

1.  Verify [model access in Amazon Bedrock.](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) In this solution, we use Anthropic’s Claude 4.5 Sonnet on Amazon Bedrock.
2.  Install the [AWS Command Line Interface](https://aws.amazon.com/cli) (AWS CLI).
3.  Install the [AWS SAM CLI v1.100.0+](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
4.  Install [Docker v20.x+](https://docs.docker.com/engine/install/).
5.  Install [Node.js v18.x+](https://nodejs.org/)
6.  Install [Docker v20.x+](https://docs.docker.com/get-docker/)
7.  Install [Python v3.11+](https://www.python.org/downloads/)

## Dependencies

Our Strands Agents implementation has the following dependencies that are packaged in the Dockerfile:

1.  langchain>=0.2.0
2.  langgraph==0.3.31
3.  langgraph-prebuilt~=0.1.8
4.  langgraph-sdk~=0.1.61
5.  langchain-aws>=0.2.18
6.  langchain\_tavily
7.  requests
8.  bedrock-agentcore
9.  boto3

## Deploy the solution

You can download the solution from our [GitHub repo](https://github.com/aws-samples/sample-agentic-genai-agentcore/tree/main). Use the following step-by-step guidance also outlined exactly in the README of the GitHub repo to deploy and access the solution in your AWS environment:

Step 1: Clone the repository  
`git clone <respository url>`

`cd aws-genai-campaign-review-langgraph`

### Step 2: Configure AWS credentials

_Configure AWS CLI:_

`aws configure`

_Verify credentials:_

`aws sts get-caller-identity`

### Step 3: Set up an Amazon DynamoDB persona table

_Make script executable:_

`chmod +x scripts/setup_persona_table.sh`

_Run setup script:_

`./scripts/setup_persona_table.sh`

### Step 4: Build the AWS SAM application

`sam build`

### Step 5: Deploy infrastructure

_Use a guided deployment and follow the prompts to provide your stack name, agent name, AWS region and accept the default values for other areas._

`sam deploy --guided`

### Step 6: Get deployment outputs

_Get API endpoints:_

`aws cloudformation describe-stacks --stack-name <your stack name> --query 'Stacks[0].Outputs' --output table`

_Save these values:_

*   ApiEndpoint – API URL
*   CampaignOrchestratorApi – Agent API URL
*   CloudFrontURL – Front-end URL
*   FrontendBucket – S3 bucket for front end

### Step 8: Configure front-end environment

_Get values from CloudFormation outputs:_

``API_URL=$(aws cloudformation describe-stacks --stack-name <your stack name> --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text)``

``AGENT_API_URL=$(aws cloudformation describe-stacks --stack-name <your stack name> -review --query 'Stacks[0].Outputs[?OutputKey==`CampaignOrchestratorApi`].OutputValue' --output text)``

_Create .env file:_

`cat > .env << EOF`

`VITE_API_URL=$API_URL`

`VITE_AGENT_API_URL=$AGENT_API_URL`

`VITE_AWS_REGION= <your AWS region>`

`EOF`

### Step 9: Build and deploy front end

_Install dependencies:_

`npm install`

_Build frontend:_

`npm run build`

_Get frontend bucket name:_

``FRONTEND_BUCKET= $(aws cloudformation describe-stacks --stack-name <your stack name> --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' --output text)``

_Deploy to S3:_

```
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete
```

_Invalidate CloudFront cache (optional, for updates):_

`DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName=='${FRONTEND_BUCKET}.s3.us-west-2.amazonaws.com'].Id" --output text)`

`aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"`

### Step 10: Access the application

_Get CloudFront URL:_

``aws cloudformation describe-stacks --stack-name <your stack name> --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' --output text``

Open the URL in your browser to access the application. Use this [campaign\_brief.md](https://github.com/aws-samples/sample-agentic-genai-agentcore/blob/main/aws-genai-campaign-review-strands-agentcore/campaign_brief.md) file as the sample campaign document and upload it on the left panel. You will then be able to view the campaign review output from the multi-agent orchestration in the right panel. Navigate to the [Bedrock AgentCore Observability console](https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#gen-ai-observability/agent-core?region=us-west-2) and select your agent for a detailed visualization of each step in your agent workflow as shown below

[![agentcore observability dashboard describing the spans, traces and sessions for the agent invocations](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/agentcoreobservability-langgraph-1024x547.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/agentcoreobservability-langgraph.png)

## Clean up

To avoid recurring charges, clean up your account after trying the solution.

1.  Delete CloudFormation stack

`sam delete --stack-name <your stack name>`

2.  Delete DynamoDB table

`aws dynamodb delete-table --table-name PersonaTable --region <your aws region>`

## Conclusion

In this post, we showed how combining LangGraph, Amazon Bedrock AgentCore, and serverless AWS services helps teams to build highly scalable, production-ready multi-agent generative AI systems. By using LangGraph’s explicit graph-based execution model for orchestration and AWS Lambda based runtimes for execution, developers can coordinate complex, parallel agent workflows with deterministic control flow, automatic scaling, and minimal operational overhead. Integrated AgentCore Memory and Observability address two of the most common challenges in real-world agent deployments—state management and visibility—by providing shared, durable context across agent runs and deep insight into agent behavior, performance, and cost.

Together, these capabilities form a repeatable architectural pattern for building enterprise-grade AI agents on AWS. Whether you’re implementing campaign review systems, digital assistants, or other multi-agent reasoning workflows, this approach allows you to decouple orchestration from execution, scale elastically with demand, and maintain full transparency into how agents reason and interact. By using LangGraph for structured orchestration and Amazon Bedrock AgentCore for managed runtime, memory, and observability, you can confidently move from experimental prototypes to reliable, scalable generative AI systems in production.

* * *

## About the authors

[![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2025/04/28/bacchus.jpg)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2025/04/23/photo-phonetool-150x150-1.jpg)**Kanishk Mahajan** is Principal – AI/ML with AWS Professional Services. In this role, he leads GenAI and agentic transformations for some of AWS largest customers in Telco and Media & Entertaintment.

[![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/04/Akshay-photo-100x122.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/04/Akshay-photo.png)**Akshay Parkhi** is a Machine Learning Engineer at Amazon Web Services with over 16 years of experience leading enterprise transformation across SAP, cloud, DevOps, and AI/ML. He architects and scales production-grade AI and agentic systems that power critical business outcomes in complex, real-world environments.