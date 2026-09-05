---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/building-ai-agents-for-business-support-using-amazon-bedrock-agentcore/
ingested: 2026-05-28
feed_name: AWS China ML
source_published: 2026-05-27T20:06:34Z
review_value: 7
review_confidence: 8
sha256: fd9a817d234ba9fbd5726533c5e9751d1c94e477b02dd8e2273be95c08f82656
---

# Building AI agents for business support using Amazon Bedrock AgentCore

 

Developing AI agents for business support presents unique challenges that many organizations face when trying to automate routine HR tasks. Works Human Intelligence (WHI) develops, sells, and supports the integrated HR system “COMPANY” for major Japanese corporations and public interest corporations.

In this post, we share how the [AWS Generative AI Innovation Center (GenAIIC)](https://aws.amazon.com/generative-ai/innovation-center/) collaborated with Works Human Intelligence (WHI) to build two AI agents using [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agents/). We discuss the challenges encountered and the solutions that reduced costs by up to 97% while improving operational efficiency.

Customers using HR systems must respond to numerous situations, such as organizational changes, revisions to HR systems, and updates to employee information. For organizations facing similar challenges with HR system operations, AI agents can significantly reduce workload and improve productivity. When WHI embarked on building products using AI agents, several challenges arose. To resolve these issues, we at GenAIIC worked closely with the WHI team to provide new perspectives and support in creating a high-quality product.The scope of this project covers two AI agents designed to support the work of operational departments. The Commuting Allowance Agent handles the approval of commuting allowance applications that arise during events like moving. The Browser Operation Agent “COMPANY” on behalf of the customer. We discuss the challenges and solutions for these two agents in the following sections.

## Commuting allowance agent

This agent automates the approval of commuting allowance applications, which is a routine task that arises during events like employee relocations.

### Challenge

The Commuting Allowance Agent supports the routine task of approving commuting allowance applications. WHI was already proceeding with a proof of concept (PoC) using LangGraph, [Amazon Elastic Container Service (Amazon ECS](https://aws.amazon.com/ecs/)), and [AWS Fargate](https://aws.amazon.com/fargate/). However, because [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) was released during development, the team began considering a migration. WHI wanted to work with us to build a solution with AgentCore that would realize an AI agent integrated with “COMPANY”. Additionally, they wanted to migrate to an integrated multi-agent environment and implement authentication and authorization using AWS Fargate and [Amazon Cognito](https://aws.amazon.com/cognito/), which were currently under development.

### Solution overview

The Commuting Allowance Agent was being developed using LangGraph and Amazon ECS, but the team had concerns about the monolithic configuration where everything ran as the same Amazon ECS task. Therefore, we worked together to change the architecture so that sub-agents are launched individually on the AgentCore Runtime. Because multi-tenancy support was required, we decided to manage tenants using [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) and Amazon Cognito to maintain the flexibility for WHI to build and manage it.

### Architecture

Slack serves as the entry point for calling the Commuting Allowance Agent, so the system is designed to perform authentication at the time of the call, and then the appropriate sub-agents process the request.

![dolphin-architecture](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/28/ML-20255-IMAGE-1.png)

### Results and impact

With AgentCore becoming generally available (GA) during the project, we were able to use it effectively. While the Commuting Allowance Agent continues to use LangGraph, we modified it so that sub-agents run on a separate Runtime. This change facilitates the future expansion of sub-agents. We are also considering changing the supervisor agent that bundles the sub-agents to Strands Agents in the future. Additionally, although WHI previously hosted Langfuse to check the status of agents, incurring operational costs, switching to AgentCore Observability has reduced this burden.

## Browser operation agent

This agent uses a browser to access the HR system, check content, perform operations, and collect evidence on behalf of customers.

### Challenge

The second agent uses a browser to access “COMPANY”, checks the content, performs operations, and acquires evidence. Construction was proceeding with LangGraph and Playwright Model Context Protocol (MCP). The team confirmed an 88% reduction in browser operation tokens through the following approaches:

*   Removing past unnecessary parts from the agent loop (conversation history between AI and Playwright MCP).
*   Removing unnecessary parts for browser operation from the return values of Playwright MCP.
*   Using prompt caching for the TOOL part.

However, because it relied on a proprietary implementation, the team faced challenges such as difficulty in migrating to Strands Agents. They were also considering methods to further reduce tokens. It was in this context that GenAIIC began collaborating with WHI.

### Solution overview

We built the agent using Strands Agents. After testing several browser operation tools and confirming successful processing, we focused on reducing the number of tokens used. The workflow begins by searching for the optimal operation template from the knowledge base according to user instructions. Next, it replaces placeholders in the acquired template with information obtained from another knowledge base to create an operation manual. The agent then operates the browser based on this manual to check the current information. Based on the information obtained (such as CSV), it creates a change proposal and presents it to the user. Finally, upon user approval, it operates the browser again based on the change proposal to execute the changes.Although a basic workflow is defined, the agent can flexibly handle cases where user input is insufficient or where only partial tasks are performed, based on its own autonomous judgment.

### Architecture

Access to “COMPANY” from the agent is restricted by IP address. To address this, we placed the AgentCore Runtime within a virtual private cloud (VPC) and configured it to access through a fixed IP address using a NAT gateway. We also built a knowledge base to store operation templates and auxiliary information for creating operation procedures. We used an [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/) bucket to save short-term information.

![c-sox-architecture](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/28/ML-20255-IMAGE-2.png)

### Results and impact

The Browser Operation Agent was built using Strands Agents. We tested browser operation tools including browser-use, Playwright, and fast playwright, confirming that fast playwright consumed the fewest tokens. In addition, by collaborating on improvements such as using Amazon Bedrock prompt caching and modifying system prompts, we succeeded in reducing the cost per process by up to 97%.The main improvement measures were as follows:

*   Using prompt caching for user messages: Enabled Amazon Bedrock’s prompt caching feature ($14.5 -> $2.1).
*   Optimizing agent behavior: Improved sub-agent prompts to reduce unnecessary operations ($2.1 -> $1.0).
*   Changing models: Changed the model from Claude Sonnet 4.5 to Haiku 4.5 ($1.0 -> $0.4).

Through these improvements, we optimized costs while successfully handling more complex tasks. These include scenarios that execute multiple changes in succession or scenarios where the agent asks the human questions when instructions are ambiguous.

## Conclusion

Through our collaboration, we succeeded in moving the AI agent execution infrastructure to the AgentCore Runtime and can now check operational status using AgentCore Observability. WHI members have stated that using AgentCore has significantly streamlined development, as log checking is now performed through a managed service. Furthermore, adopting Strands Agents for the Browser Agent allowed us to realize a flexibly behaving agent with minimal implementation. In this post, we described how building AI agents can support routine tasks. Our work together has allowed WHI to reach a state where they can focus on developing business logic. AgentCore includes the Runtime, which serves as the execution foundation, and other features, so we are considering future utilization with WHI. Additionally, the behavior and cost of AI agents change with the model used. Through this project, we confirmed that the processes work as expected. We plan to continue evaluating models and optimizing costs.

To experience how Amazon Bedrock AgentCore simplifies AI agent development , visit our [Getting Started Guide](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agentcore-get-started-toolkit.html) or the [Hands-on Lab](https://github.com/aws-samples/sample-getting-started-with-amazon-agentcore). Whether you are looking to automate routine tasks, build multi-agent workflows, or optimize model costs using features like prompt caching, AWS has the tools to support you.

* * *

## About the authors
