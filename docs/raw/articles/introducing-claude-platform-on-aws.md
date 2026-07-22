---
title: "Introducing Claude Platform on AWS: Anthropic’s native platform, through your AWS account | Amazon Web Services"
source_url: "introducing-claude-platform-on-aws"
tags: [wechat, article, claude, openai]
ingested: "2026-05-20"
type: raw
sha256: 55250413fb90648708bc08c1316dec2dec2e43be77d0518a3e9edc135ddeebc5
---
---
# Introducing Claude Platform on AWS: Anthropic’s native platform, through your AWS account | Amazon Web Services
# Introducing Claude Platform on AWS: Anthropic’s native platform, through your AWS account
Today, we’re excited to announce the general availability of Claude Platform on AWS. Claude Platform on AWS is a new service that gives customers direct access to Anthropic’s native Claude Platform experience through their AWS account, with no separate credentials, contracts, or billing relationships required. AWS is the first cloud provider to offer access to the native Claude Platform experience.
In this post, we explore how Claude Platform on AWS works and how you can start using it today.
## Claude Platform experience through AWS
With Claude Platform on AWS, you work with the same APIs, features, and console experience available through Anthropic directly. This includes the [Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages), [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) (beta), [advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) (beta), [web search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) and [web fetch](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool), [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) (beta), [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) (beta), [code execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool), [files API](https://platform.claude.com/docs/en/build-with-claude/files) (beta). For the full list of capabilities, see the [Claude Platform documentation](https://platform.claude.com/docs/en/home). 
You access Claude Platform on AWS through familiar AWS features:
        - **Authentication:** You use existing [AWS IAM credentials](https://docs.aws.amazon.com/claude-platform/latest/userguide/authentication.html) to access Claude Platform. No separate accounts or API keys to manage.
        - **Billing**: Usage is billed through AWS Marketplace on a [consumption basis](https://platform.claude.com/docs/en/about-claude/pricing), so you can track and manage AI spending alongside your other AWS services.
        - **Audit**: Activity is captured [in AWS CloudTrail](https://docs.aws.amazon.com/claude-platform/latest/userguide/monitoring.html), so you can monitor, audit, and investigate AI usage the same way you do for any other AWS services.
Claude Platform on AWS is operated by Anthropic, and the underlying requests and data are processed outside the AWS security boundary. This makes it well suited for teams without specific Regional data residency requirements, and complements Claude models on Amazon Bedrock, so you can access Claude through the approach that fits your needs.
![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/ml-20969-image-1.png)
*Figure 1: Sign in to the AWS Management Console and open the *[*Claude Platform on AWS Console*](https://console.aws.amazon.com/claude-platform/)
## Getting started with Claude Platform on AWS
You can activate Claude Platform on AWS through the AWS Marketplace. For step-by-step instructions, see [Set up your account](https://docs.aws.amazon.com/claude-platform/latest/userguide/setup.html). After your account is activated, getting to your first API call takes three steps: create a workspace, authenticate, and call the API.
### Step 1: Create a workspace
With a [workspace](https://platform.claude.com/docs/en/manage-claude/workspaces), you can separate projects, environments, or teams while maintaining centralized billing and administration. It also serves as the primary AWS Identity and Access Management (IAM) resource for Claude Platform on AWS. You grant or deny access to specific workspaces through IAM policies using the workspace ARN. See [IAM policies](https://docs.aws.amazon.com/claude-platform/latest/userguide/iam-policies.html#_example_per_customer_workspace_isolation) for policy examples.
Open the Claude Console from within the [Claude Platform on AWS Console](https://console.aws.amazon.com/claude-platform/) and create a workspace.
*Figure 2: You can find your workspace ID in the *Claude Platform on* AWS Console.*
### Step 2: Authenticate
Claude Platform on AWS supports two authentication methods: IAM with [AWS Signature Version 4,](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html) and API keys. We recommend using [temporary IAM credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#bp-workloads-use-roles) for setups that require a higher level of security, and API keys for exploring Claude Platform on AWS.
To quickly test your setup, you can generate an API key in the Claude Platform on AWS Console:
![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/ml-20969-image-2.png)
*Figure 3: You can generate an API key in the Claude Platform on AWS Console*
Set your API key, base URL, and Workspace ID as environment variables:
```
`# Your API key  
export ANTHROPIC_API_KEY=<YOUR API KEY HERE> 
# Your regional endpoint for Claude Platform on AWS 
export ANTHROPIC_BASE_URL=https://aws-external-anthropic.<YOUR REGION HERE>.api.aws 
# Your workspace ID (find in Claude Platform on AWS Console → Workspaces) 
export ANTHROPIC_WORKSPACE_ID=<YOUR WORKSPACE ID HERE> `
```
### Step 3: Make your first API call
You can now install the [Anthropic Client SDKs](https://platform.claude.com/docs/en/api/client-sdks#quick-installation) and make API calls: 
```
`from anthropic import Anthropic 
import os 
client = Anthropic( 
   default_headers={"anthropic-workspace-id": os.environ["ANTHROPIC_WORKSPACE_ID"]}, 
) 
message = client.messages.create( 
   model="claude-sonnet-4-6", 
   max_tokens=1024, 
   messages=[{"role": "user", "content": "Hello!"}], 
) 
print(message) `
```
See [Getting Started notebooks](https://github.com/aws-samples/anthropic-on-aws/blob/main/claude-platform-on-aws/notebooks/) for more code examples. 
## Claude Platform on AWS in practice
With your setup complete, you can point Claude Code, Claude Cowork, or any other API client at your workspace using the following environment variables or configuration:
```
`export ANTHROPIC_API_KEY=<YOUR API KEY HERE> 
export ANTHROPIC_BASE_URL=https://aws-external-anthropic.<YOUR REGION HERE>.api.aws 
 # For Claude Cowork, set the “anthropic-workspace-id" in your inference configuration. For Claude Code use the following:  
export ANTHROPIC_CUSTOM_HEADERS='{"anthropic-workspace-id":"<YOUR WORKSPACE ID HERE>"}' 
 # For the Anthropic SDK 
export ANTHROPIC_WORKSPACE_ID=<YOUR WORKSPACE ID HERE> `
```
After you’re connected, your clients can use capabilities like web search, MCP connectors, agent skills, code execution, and file uploads through Claude Platform on AWS.
*Figure 4a: Claude Cowork connected to Claude Platform on AWS*
*Figure 4b: Claude Code connected to Claude Platform on AWS*
You can monitor usage in the Claude Console, including breakdowns by workspace, AWS IAM principal, and time period.
![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/ml-20969-image-3.png)
*Figure 5: Usage analytics in the Claude Console*
In your AWS environment, AWS CloudTrail captures requests to Claude Platform on AWS, whether from the Anthropic SDK, Claude Code, or Cowork. Workspace operations are logged as management events by default, and you can enable data event logging to capture inference activity. For details on event types and logging configuration, see [Monitoring and logging](https://docs.aws.amazon.com/claude-platform/latest/userguide/monitoring.html). Because usage is billed through AWS Marketplace, you can monitor costs in AWS Cost Explorer alongside your other cloud services. You can also allocate spending using [resource tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html).
          ![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/ml-20969-image-4.png)
          ![](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/11/ml-20969-image-5.png)
*Figure 6: Example AWS CloudTrail events (left) and AWS Cost Explorer (right) for Claude Platform on AWS*
## Conclusion
With Claude Platform on AWS, your teams get Anthropic’s complete native APIs and features through the same AWS account you already use. Claude Platform on AWS is available in US East (N. Virginia), US East (Ohio), US West (Oregon), Canada (Central), South America (São Paulo), Europe (Dublin), Europe (London), Europe (Frankfurt), Europe (Milan), Europe (Zurich), Europe (Paris), Europe (Stockholm), Asia Pacific (Tokyo), Asia Pacific (Seoul), Asia Pacific (Melborune), Asia, Pacific (Jakarta) and Asia Pacific (Sydney). To get started, open the [Claude Platform on AWS Console](https://console.aws.amazon.com/claude-platform/) or [explore the documentation](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws).
Give Claude Platform on AWS a try today and send feedback to AWS re:Post or through your usual AWS Support contacts.
## About the authors