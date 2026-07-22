---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-claude-apps-gateway-for-aws
ingested: 2026-07-09
feed_name: AWS China ML
source_published: 2026-07-08
sha256: "b064b0c356a551b22a8ab359161fa6cc33ef31634e04632f87311ec0d3f5ae4d"
---

# Introducing Claude apps gateway for AWS

Enterprises deploying Claude Code and Claude Desktop across development teams need centralized control over access, cost, and policy. At scale, this is hard to manage: each developer needs an individual credential, settings must be distributed manually, and spend is difficult to track or cap. Without a centralized control point, governance is left to whatever tooling each team can implement independently.  
  
Today, we’re announcing the Claude apps gateway for AWS, a self-hosted control plane that gives organizations a single point of control over access, cost, and policy for Claude Code and Claude Desktop. It replaces the need to provision a separate cloud credential per developer, push settings to every laptop by hand, or stand up separate tooling to track spend. You can deploy it through Amazon Bedrock to keep data within the AWS security boundary, or through Claude Platform on AWS to get the same gateway controls with the native Claude platform experience.

High level overview of Claude apps gateway for AWS

In this post, we show how to set up and run Claude apps gateway for AWS with Amazon Bedrock and Claude Platform on AWS.

## How the Claude apps gateway works

The gateway is delivered by Anthropic inside the same [Claude Code CLI](<https://code.claude.com/docs/en/quickstart>) binary your developers already use. You can run it in one stateless container on your infrastructure, backed by a [PostgreSQL](<https://www.postgresql.org/>) database that stores short-lived sign-in state and rate-limit counters. Because the gateway and the client are built together, the `/login` flow is gateway-aware. The client applies managed settings automatically at sign-in, and policy is enforced consistently on every request.

Onboarding and offboarding follow your existing identity workflows. To grant access, add a developer to your identity provider (IdP). To revoke it, remove them, and their session expires within the configured token lifetime (one hour by default). No long-lived secrets live on developer machines.

Figure 1: Claude apps gateway architecture for AWS

The gateway handles five core responsibilities:

  * **Identity:** The gateway connects to any standards-compliant OpenID Connect (OIDC) identity provider. After a developer signs in through browser single sign-on (SSO), the gateway issues a short-lived token that the CLI uses for all subsequent requests.
  * **Policy:** You define managed settings once on the server. Clients receive policy at sign-in, and the gateway enforces it on every request. You can adjust allowed models, tool permissions, and default settings centrally, scoped by IdP group.
  * **Telemetry:** The client stamps a usage metric for every request, and the gateway relays it over OpenTelemetry Protocol (OTLP) to a collector you configure, such as Amazon CloudWatch or Amazon Managed Service for Prometheus in your own account, or a third-party platform. You control where telemetry goes and how long it’s retained.
  * **Routing:** The gateway holds your upstream credential and routes inference requests to Amazon Bedrock or Claude Platform on AWS on behalf of developers, with optional failover between AWS Regions or across multiple accounts.
  * **Spend caps:** Set daily, weekly, and monthly spend limits per organization, group, or user. When a developer exceeds their cap, the gateway blocks further requests until the period resets or an admin raises the limit.



When Claude apps gateway is used with Amazon Bedrock, inference requests go through Amazon Bedrock in the AWS Regions you configure, maintaining the same data handling and privacy controls as any other Amazon Bedrock workload in your account. When Claude apps gateway is used with Claude Platform on AWS, requests are processed by Anthropic.

### The configuration

The gateway reads a single YAML file at startup. Here’s what a minimal production configuration looks like:

gateway.yaml — the full configuration for an Amazon Bedrock deployment

The file contains six sections and the secrets stay in environment variables. The Bedrock upstream uses the container’s IAM role, so there are no static credentials to manage. To route through Claude Platform on AWS instead, replace the upstreams block:
    
    
    upstreams:
      - provider: anthropicAws
        region: us-east-1
        workspace_id: wrkspc_...
        auth: {} # AWS default credential chain (IAM role)

Model IDs are the same as the Anthropic API (`claude-sonnet-5`, `claude-opus-4-8`). No Amazon Bedrock ARNs or inference profiles needed.

The gateway runs as a stateless container in your private network on [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>), [Amazon Elastic Kubernetes Service (Amazon EKS)](<https://aws.amazon.com/eks/>), or [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>). You place it behind an internal [Application Load Balancer](<https://aws.amazon.com/elasticloadbalancing/>) with a Transport Layer Security (TLS) certificate from [AWS Certificate Manager](<https://aws.amazon.com/certificate-manager/>). [Amazon Relational Database Service (Amazon RDS)](<https://aws.amazon.com/rds/>) for PostgreSQL stores short-lived sign-in state. Developers reach the gateway through your private network, and the gateway uses an IAM task role to call the upstream provider on their behalf.

### Developer sign-in

Once the gateway is deployed, developers run `claude /login`. Administrators push a managed settings file to developer machines via their device management tool that pre-fills the gateway URL, so developers see the Claude apps gateway screen directly.

The Claude apps gateway login screen in Claude Code

They press Enter, and a browser opens with your corporate SSO.

Browser SSO authentication through your identity provider

One sign-in, and they’re connected. The session refreshes silently in the background using OIDC refresh tokens, so developers stay authenticated across restarts without repeated browser logins. If a user is removed from the IdP, their session expires at the next refresh.

### Working with Claude Code

After sign-in, developers use Claude Code exactly as they would with any other authentication method. They write code, run commands, and interact with Claude normally. The difference is invisible to them: every request is authenticated through the gateway, routed through your configured upstream, and governed by the policies you set centrally.

Claude Code responding to a prompt, routed through Amazon Bedrock via the gateway

The `/model` picker shows only the models your policy allows. Beyond model access, policies can control tool permissions, such as restricting file writes or web access. They can also enforce permission rules that developers cannot override locally, and push environment variables or hooks to standardize workflows across teams. Usage is attributed to each developer’s identity, and spend is tracked against their cap. If they leave the company, removing them from the IdP revokes access within the configured session lifetime.

## Conclusion

With the Claude apps gateway for AWS, you can expand Claude Code and Claude Desktop adoption across your organization while managing identity, policy, and cost from one place. Identity flows through your existing IdP, policy is enforced centrally, and cost is attributed per user, with no long-lived secrets on developer machines.

Because the gateway is self-hosted, you can deploy it in any AWS Region and route inference to Amazon Bedrock or Claude Platform on AWS, including cross-Region and cross-account setups. Choose Amazon Bedrock when data must stay within the AWS security boundary, or Claude Platform on AWS for access to Anthropic’s native platform experience with AWS authentication and billing.

To get started, download the [Claude Code CLI](<https://code.claude.com/docs/en/quickstart>) and review the [Claude apps gateway documentation](<https://code.claude.com/docs/en/claude-apps-gateway>). Send feedback to AWS re:Post for Amazon Bedrock or through your usual AWS Support contacts.

* * *

## About the authors

### Dani Mitchell

Dani is a Sr GenAI Specialist Solutions Architect at AWS and the SA lead for Amazon Bedrock Knowledge Bases. He helps enterprises across the world design and deploy generative AI solutions using Amazon Bedrock and Anthropic’s models and capabilities to build scalable, production-ready applications.

### Harshetha Narayan

Harshetha is a Technical Product Marketing Manager for Amazon Bedrock AgentCore at AWS. She helps companies build, deploy, and govern their AI agents at scale. Outside of work, she enjoys hiking and exploring new places.

### Sofian Hamiti

Sofian is a technology leader with over 12 years of experience building AI solutions, and leading high-performing teams to maximize customer outcomes. He is passionate about empowering diverse talents to drive global impact and achieve their career aspirations.

### Ayan Ray

Ayan Ray is a Principal Partner Solutions Architect and AI Tech Lead at AWS, serving as the Worldwide Tech Lead for Anthropic at AWS. He works at the intersection of cloud architecture and Artificial Intelligence, helping organizations adopt and scale Anthropic’s technologies on AWS.
