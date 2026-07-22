---

title: "Introducing Claude Platform on AWS: Anthropic's native platform, through your AWS account"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-claude-platform-on-aws-anthropics-native-platform-through-your-aws-account/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-12
feed_name: AWS China ML
source_published: 2026-05-11T18:43:03Z
score: 63
value: 7
confidence: 9
review: strong
stars: 5
sha256: 3fa46ab51756799adf54560cb446a8957fd59630d8f08758752c3be1c9edee05

---
# Introducing Claude Platform on AWS: Anthropic's native platform, through your AWS account
Today, we're excited to announce the general availability of Claude Platform on AWS. Claude Platform on AWS is a new service that gives customers direct access to Anthropic's native Claude Platform experience through their AWS account, with no separate credentials, contracts, or billing relationships required. AWS is the first cloud provider to offer access to the native Claude Platform experience.
In this post, we explore how Claude Platform on AWS works and how you can start using it today.
## Claude Platform experience through AWS
With Claude Platform on AWS, you work with the same APIs, features, and console experience available through Anthropic directly. This includes the [Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages), [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) (beta), [advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) (beta), [web search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) and [web fetch](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool), [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) (beta), [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) (beta), [code execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool), [files API](https://platform.claude.com/docs/en/build-with-claude/files) (beta). For the full list of capabilities, see the [Claude Platform documentation](https://platform.claude.com/docs/en/home).
You access Claude Platform on AWS through familiar AWS features:
- **Authentication:** You use existing [AWS IAM credentials](https://docs.aws.amazon.com/claude-platform/latest/userguide/authentication.html) to access Claude Platform. No separate accounts or API keys to manage.
- **Billing** : Usage is billed through AWS Marketplace on a [consumption basis](https://platform.claude.com/docs/en/about-claude/pricing), so you can track and manage AI spending alongside your other AWS services.
- **Audit** : Activity is captured [in AWS CloudTrail](https://docs.aws.amazon.com/claude-platform/latest/userguide/monitoring.html), so you can monitor, audit, and investigate AI usage the same way you do for any other AWS services.
Claude Platform on AWS is operated by Anthropic, and the underlying requests and data are processed outside the AWS security boundary. This makes it well suited for teams without specific Regional data residency requirements, and complements Claude models on Amazon Bedrock, so you can access Claude through the approach that fits your needs.
## Getting started with Claude Platform on AWS
You can activate Claude Platform on AWS through the AWS Marketplace. For step-by-step instructions, see [Set up your account](https://docs.aws.amazon.com/claude-platform/latest/userguide/setup.html). After your account is activated, getting to your first API call takes three steps: create a workspace, authenticate, and call the API.
### Step 1: Create a workspace
With a [workspace](https://platform.claude.com/docs/en/manage-claude/workspaces), you can separate projects, environments, or teams while maintaining centralized billing and administration. It also serves as the primary AWS Identity and Access Management (IAM) resource for Claude Platform on AWS. You grant or deny access to specific workspaces through IAM policies using the workspace ARN.
### Step 2: Authenticate
Claude Platform on AWS supports two authentication methods: IAM with AWS Signature Version 4, and API keys. We recommend using temporary IAM credentials for setups that require a higher level of security, and API keys for exploring Claude Platform on AWS.
### Step 3: Make your first API call
You can now install the [Anthropic Client SDKs](https://platform.claude.com/docs/en/api/client-sdks#quick-installation) and make API calls:
```python
from anthropic import Anthropic
import os
client = Anthropic(
    default_headers={"anthropic-workspace-id": os.environ["ANTHROPIC_WORKSPACE_ID"]},
)
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
print(message)
```
## Claude Platform on AWS in practice
With your setup complete, you can point Claude Code, Claude Cowork, or any other API client at your workspace. After you're connected, your clients can use capabilities like web search, MCP connectors, agent skills, code execution, and file uploads through Claude Platform on AWS.
You can monitor usage in the Claude Console, including breakdowns by workspace, AWS IAM principal, and time period. AWS CloudTrail captures requests to Claude Platform on AWS, and usage is billed through AWS Marketplace.
## Conclusion
Claude Platform on AWS is available in US East (N. Virginia), US East (Ohio), US West (Oregon), Canada (Central), South America (São Paulo), Europe (Dublin), Europe (London), Europe (Frankfurt), Europe (Milan), Europe (Zurich), Europe (Paris), Europe (Stockholm), Asia Pacific (Tokyo), Asia Pacific (Seoul), Asia Pacific (Melbourne), Asia Pacific (Jakarta), Asia Pacific (Sydney).
→ [[raw/articles/introducing-claude-platform-on-aws-anthropics-native-platfor|原文存档]]