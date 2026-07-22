---
title: "Build high-performance generative AI systems with Strands Agents"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-high-performance-generative-ai-systems-with-strands-agents-nvidia-nim-and-amazon-bedrock-agentcore/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-05-26T17:39:46Z
type: article
sha256: 4253c59ea4bf61232d70fcae462ae9f1e8e505584bf347d51c32cbe3ff912217
tags: ['strands-agents', 'aws', 'performance', 'genai', 'architecture']
---
# Build high-performance generative AI systems with Strands Agents, NVIDIA NIM, and Amazon Bedrock AgentCore

Building high-performance generative AI agents requires architecture that can deliver fast inference, coordinate multiple agents, and operate reliably under production workloads. If you are building generative AI agents to automate reviews, power digital assistants, and support complex decision-making workflows, you need these agents to perform well. They must reduce manual effort, respond in near real time, and scale to thousands of interactions without additional infrastructure management. In this post, you’ll learn how to build these high-performance agents on AWS by combining [GPU](https://aws.amazon.com/what-is/gpu/)\-accelerated inference, serverless orchestration, shared memory, and built-in observability. These capabilities are essential when moving from experimental prototypes to systems that deliver consistent business value.

As agent workloads grow in production environments, inference latency can increase significantly under concurrent requests, leading to slower responses and degraded user experience. Stateless execution environments often cause agents to lose conversational or task context between interactions. This results in repeated work or inconsistent outputs. Limited visibility into agent execution makes it difficult to diagnose failures, understand reasoning paths, or control operational costs. These challenges become more pronounced in multi-agent systems, where several agents must run in parallel, share context, and aggregate results.

You’ll build a multi-agent campaign review system that demonstrates parallel reasoning, context persistence, and traceable execution paths using an integrated architecture that combines [NVIDIA NIM](https://developer.nvidia.com/nim) for GPU-accelerated inference. [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) provides managed runtime, shared memory and built-in observability and [Strands Agents](https://strandsagents.com/latest/) provide serverless multi-agent orchestration. This approach supports performance, scalability, and operational insight in production environments. While the example focuses on marketing content review, the same pattern applies to digital assistants, review automation, and retrieval-augmented generation pipelines.

To make these concepts concrete, the following sections walk through a reference architecture and implementation that demonstrates how these components work together in practice.

## Solution overview

You will build a system that consists of three specialized agents that operate in parallel. A persona reviewer agent evaluates campaign content from multiple audience perspectives and produces resonance scores. A validator agent checks the content against legal and brand guidelines. A finalizer agent aggregates the outputs and produces a consolidated set of recommendations. You submit documents through a [React](https://react.dev/) based frontend, which asynchronously polls for results and displays agent feedback as it becomes available.

Our solution uses hosted NVIDIA NIM APIs available via [build.nvidia.com](https://build.nvidia.com/) to deliver high-performance, GPU-accelerated inference as a fully managed service. These endpoints run optimized large language models on NVIDIA-managed GPU backends. These backends use technologies such as [Compute Unified Device Architecture (CUDA),](https://developer.nvidia.com/cuda/toolkit) and [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) to provide low-latency, high-throughput responses for agent workflows. By exposing [OpenAI](https://openai.com/)\-compatible Chat Completion APIs, NIM integrates with the Strands-based multi-agent orchestration layer without requiring model-specific adaptations.

You’ll implement agent orchestration using Strands Agents, AWS’s multi-agent framework for coordinating tool-based reasoning workflows. With Strands, you can model agent interactions explicitly, making it easier to manage parallel execution, control flow, and aggregation of results across multiple agents. You package the Strands orchestrator and specialized agents together as a Docker container and deploy them into Amazon Bedrock AgentCore Runtime. AgentCore Runtime provides a managed execution environment with checkpointing and recovery capabilities. These features help your agents recover gracefully from interruptions and scale to thousands of concurrent invocations without manual infrastructure management.

You use Amazon Bedrock AgentCore Observability to provide detailed visualizations of each step in the agent workflow, enabling developers to inspect execution paths, audit intermediate outputs, and debug performance bottlenecks. You can monitor operational metrics such as latency, token usage, and error rates through [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/). This visibility helps you understand agent behavior and identify performance bottlenecks in production.

You also use Amazon Bedrock AgentCore Memory for shared context across agent invocations and to provide support for multi-turn conversations. You can extend this implementation to provide an AI assistant natural language interface because AgentCore Memory provides built-in support for storing conversational state and history.

One of the core aspects of this solution is ease of deployment into Bedrock AgentCore Runtime using an [AWS Serverless Application Model (AWS SAM)](https://aws.amazon.com/serverless/sam/) template. You invoke an [Amazon API Gateway](https://aws.amazon.com/api-gateway/) interface provisioned by the template that then packages and deploys your Strands agents and all their dependencies along with enabling AgentCore Observability and AgentCore Memory.

The following architecture diagram shows how NVIDIA NIM, Strands Agents, and Amazon Bedrock AgentCore work together to support inference, orchestration, memory, and observability in your deployment.

[![architecture diagram describing the multi agent strands and agentcore deployment](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-1.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-1.png)

## Prerequisites

Before you can deploy this solution, you’ll need to set up your development environment with the following tools as prerequisites.

1.  Install the [AWS Command Line Interface](https://aws.amazon.com/cli) (AWS CLI).
2.  Install the [AWS SAM CLI v1.100.0+](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
3.  Install [Docker v20.x+](https://docs.docker.com/engine/install/).
4.  Install [Node.js v18.x+](https://nodejs.org/)
5.  Install [Python v3.11+](https://www.python.org/downloads/)

## Dependencies

The Strands Agents implementation also needs to have the following dependencies that are packaged in the DockerFile:

*   AWS Strands multi-agent framework: strands-agents
*   Strands agent tools and utilities: strands-agents-tools
*   HTTP library for API calls: requests
*   Amazon Bedrock agent core functionality: bedrock-agentcore
*   AWS SDK for Python: boto3

## Deploy the solution

Now that you understand the architecture, the following steps walk you through deploying the solution in your AWS environment. Note that using NVIDIA NIM requires accepting the NVIDIA AI Enterprise EULA (available during AWS Marketplace subscription or NGC registration).

Our solution is available for download on the [GitHub repo](https://github.com/aws-samples/sample-agentic-genai-agentcore/tree/main/aws-genai-campaign-review-strands-agentcore). Use the following step-by-step guidance also outlined exactly in the [Deployment section](https://github.com/aws-samples/sample-agentic-genai-agentcore/blob/main/aws-genai-campaign-review-strands-agentcore/DEPLOYMENT.md) of the GitHub repo to deploy and access the solution in your AWS environment:

### Step 1: Clone the repository

```
git clone <respository url>
cd aws-genai-campaign-review-strands-agentcore
```

### Step 2: Configure AWS credentials

Configure AWS CLI:

Verify credentials:

```
aws sts get-caller-identity
```

### Step 3: Set up an Amazon DynamoDB persona table

Make script executable:

```
chmod +x scripts/setup_persona_table.sh
```

Run setup script:

```
./scripts/setup_persona_table.sh
```

### Step 4: Build the AWS SAM application

### Step 5: Deploy infrastructure

Use a guided deployment and follow the prompts to provide your stack name, agent name, AWS region and accept the default values for other areas.

### Step 6: Get deployment outputs

Get API endpoints:

```
aws cloudformation describe-stacks --stack-name <Your stack name> --query 'Stacks[0].Outputs' --output table
```

Save these values:

*   ApiEndpoint – HTTP API URL
*   CampaignOrchestratorApi – Agent API URL
*   CloudFrontURL – Front-end URL
*   FrontendBucket – S3 bucket for front end

### Step 7: Deploy agent to AgentCore Runtime

This deploys your Strands agent to Bedrock AgentCore and writes the Agent ARN to Systems Manager:

```
curl -X POST <DeployAgentApiEndpoint> -H "Content-Type: application/json" -d '{"action":"deploy","agent_name":"<your agent name>"}'
```

This takes approximately 5 minutes. The API Gateway times out (29 seconds) but the AWS Lambda function continues running.

Monitor progress:

```
aws logs tail /aws/lambda/deploy-agentcore --region <your AWS region> –follow
```

Wait until you see: _Agent Core Runtime is READY! and Wrote Agent ARN to SSM._

Verify:

```
aws ssm get-parameter --name /agentcore/<your agent name>/agent-arn --region <your AWS region>
```

### Step 8: Configure front-end environment

```
PI_URL=$(aws cloudformation describe-stacks --stack-name <your stack name> --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text)

AGENT_API_URL=$(aws cloudformation describe-stacks --stack-name <your stack name> -review --query 'Stacks[0].Outputs[?OutputKey==`CampaignOrchestratorApi`].OutputValue' --output text)
```

Create .env file

```
cat > .env << EOF
VITE_API_URL=$API_URL
VITE_AGENT_API_URL=$AGENT_API_URL
VITE_AWS_REGION= <your AWS region>
EOF
```

### Step 9: Build and deploy front end

Install dependencies:

Build frontend:

Get frontend bucket name:

```
FRONTEND_BUCKET= $(aws cloudformation describe-stacks --stack-name unified-campaign-review --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' --output text)
```

Deploy to S3:

```
aws s3 sync dist/ s3://$FRONTEND_BUCKET --delete
```

Invalidate CloudFront cache (optional, for updates):

```
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].DomainName=='${FRONTEND_BUCKET}.s3.us-west-2.amazonaws.com'].Id" --output text)

aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

### Step 10: Access the application

Get CloudFront URL:

```
aws cloudformation describe-stacks --stack-name unified-campaign-review --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' --output text
```

Open the URL in your browser to access the application. Use this [campaign\_brief.md](https://github.com/aws-samples/sample-agentic-genai-agentcore/blob/main/aws-genai-campaign-review-strands-agentcore/campaign_brief.md) file as the sample campaign document and upload it on the left panel. You will then be able to view the campaign review output from the multi-agent orchestration in the right panel as shown below:

[![campaign upload user interface with a left panel to upload a campaign brief and the right panel to view the agent generated review](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-2.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-2.png)

Navigate to the [Bedrock AgentCore Observability console](https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#gen-ai-observability/agent-core?region=us-west-2) and select your agent for a detailed visualization of each step in your agent workflow as shown below:

[![agentcore observability dashboard describing the spans, traces and sessions for the agent invocations](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-3.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/02/image-ml-20164-3.png)

## Clean up

To avoid recurring charges, clean up your AWS account after trying the solution.

1.  Delete the AWS CloudFormation stack:

```
sam delete --stack-name unified-campaign-review
```

2.  Delete the DynamoDB table:

```
aws dynamodb delete-table --table-name PersonaTable --region us-west-2
```

## Conclusion

In this post, you learned how to build a production-ready generative AI agent system by combining NVIDIA NIM for GPU-accelerated inference with Amazon Bedrock AgentCore and Strands Agents on AWS for serverless orchestration. By separating inference from agent coordination, this architecture supports independent scaling, shared context across agent interactions, and detailed visibility into execution and performance.

The approach in this post provides a practical foundation for multi-agent systems that require parallel reasoning, context persistence, and operational insight. Whether you’re building review automation, digital assistants, or other agent-driven applications, the pattern demonstrated here helps you move from experimental prototypes to systems that can be deployed, observed, and scaled reliably on AWS.

* * *

## About the authors

[![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2025/04/28/bacchus.jpg)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2025/04/23/photo-phonetool-150x150-1.jpg)**Kanishk Mahajan** is Principal – AI/ML with AWS Professional Services. In this role, he leads GenAI and agentic transformations for some of AWS largest customers in Telco and Media & Entertaintment.

[![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/04/Akshay-photo-100x122.png)](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/04/Akshay-photo.png)**Akshay Parkhi** is a Machine Learning Engineer at Amazon Web Services with over 16 years of experience leading enterprise transformation across SAP, cloud, DevOps, and AI/ML. He architects and scales production-grade AI and agentic systems that power critical business outcomes in complex, real-world environments.
