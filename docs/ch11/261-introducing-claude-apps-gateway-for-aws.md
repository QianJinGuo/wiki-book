# Introducing Claude apps gateway for AWS

## Ch11.261 Introducing Claude apps gateway for AWS

> 📊 Level ⭐⭐ | 3.4KB | `entities/introducing-claude-apps-gateway-for-aws.md`

# Introducing Claude apps gateway for AWS

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-claude-apps-gateway-for-aws.md)

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
  * **Telemetry:** The client stamps a usage metric for every request, and the gateway relays it over OpenTelemetry Protocol (OTLP) to a collector you configure, such as Amazon CloudWatch or Amazon Managed Service for Prometheus in your own account, or a third-party platform. You control where telemetry goes

---

