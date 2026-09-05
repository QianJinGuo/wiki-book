---
title: "Govern AI agent tool access with Amazon Bedrock AgentCore Gateway"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/govern-ai-agent-tool-access-with-amazon-bedrock-agentcore-gateway
ingested: 2026-08-22
feed_name: AWS China ML
source_published: 2026-08-21
sha256: 3e736ebb1037c126d05790ece1134d145982d778c757255fda3c135aa07d323d
---

In our conversations with customers over the past months, one pattern keeps recurring. Whether they work with coding agents, autonomous agents, or human-interactive ones, and regardless of workload maturity, we start with the same question: “Which AI agents have access to customer data, who granted it, and what would exposure look like if a credential leaked today?” If nobody in your organization can answer that in under a minute, this post is for you.

When AI agents connect to internal tools without centralized governance, organizations encounter access risks that are difficult to detect. Consider an infrastructure engineer opening a teammate’s laptop to debug a build. In the config folder sits a file named `mcp.json` containing a production database password in plain text, next to a comment that reads TODO: rotate this. The security team has no visibility into which AI agents are reaching internal tools, who granted the access, or what the exposure would be if that credential were inadvertently exposed.

The proposed solution uses Model Context Protocol (MCP)-enabled assistants, including IDE helpers like [Kiro](<https://kiro.dev/>), [Claude Code](<https://docs.anthropic.com/en/docs/claude-code/overview>), Cursor, and AI tools like [Amazon Quick](<https://aws.amazon.com/quick/>). This post focuses on the AWS managed service Amazon Bedrock AgentCore, a platform to build, connect, and optimize agents at scale with any framework or model. With [AgentCore Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) (a capability of Amazon Bedrock AgentCore), you provide a single, secure entry point to your organizational tools for agentic traffic. It relies on [AgentCore Identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html>) (a capability of Amazon Bedrock AgentCore) for secure authentication, authorization, and credential management. To define and enforce security controls for AI agent interactions with tools, you use [AgentCore Policy](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html>). You can then augment the policy with safety and privacy controls using [Amazon Bedrock Guardrails](<https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html>), and build a centralized catalog for organizing, curating, and discovering tools using [AWS Agent Registry](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/registry.html>). Self-hosted options ([Kong Gateway](<https://konghq.com/products/kong-gateway>), [Open Policy Agent](<https://www.openpolicyagent.org/>), [NeMo Guardrails](<https://docs.nvidia.com/nemo/guardrails/home>), and [LangFuse](<https://langfuse.com/>)) also exist, and this post calls them out where relevant.

## The problem

There are five structural breakdown patterns in enterprise systems with MCP deployments, commonly described as: credential sprawl (secrets in every local config), policy drift (N×M configurations diverging silently), audit gaps (no answer to “who invoked what, when”), cost opacity (spend unattributable to teams), and shadow IT (integrations deployed outside review).

Take policy drift as an example. Each AI assistant carries its own `mcp.json`, a local file with backend credentials and tool endpoints, without oversight. A team with 10 assistants connecting to 5 internal APIs maintains 50 independent credential sets, each configured by hand. When a policy changes in one backend, it must be updated in all 50 places.

Recall the earlier question: which assistants access customer data, and who granted it? Most teams respond by building a complete gateway before allowing any AI use, which takes months and ships the wrong thing. We recommend matching controls to actual needs instead.

## The solution: a four-scope maturity journey

A governed gateway provides one governed endpoint, knows who is calling and under what authority, enforces policy at the tool and parameter level, and logs every decision. Teams can also publish tools without tickets. Each scope delivers standalone value while preserving the path to the next.

**Scope 1: Connect.** One governed door so AI agents can reach organizational resources. When MCP credentials sit in local config and security has no inventory, apply SSO authentication, centralize credentials, and enable CloudTrail audit.

**Scope 2: Control.** Know who did what, and scrub sensitive data on the way through. When you can’t answer “who invoked which tool, when, under which policy?”, apply Cedar RBAC/ABAC, PII redaction, 3LO consent, and DCR.

**Scope 3: Catalog.** Let teams find and publish tools themselves, including on-premises ones. When tool registration requires tickets and on-prem systems stay excluded, deploy the Registry, Resources MCP, OPA, and per-tool cost attribution.

**Scope 4: Harden.** Lock down the edge, watch everything, and plan for failure. When you reach over 1,000 users with no circuit breakers, public DNS, and no failover, add private connectivity, governance dashboards, deprecation workflows, and multi-Region failover.

Each scope delivers standalone value. Advance only when the next pain appears. The following figure is a reference for scope decisions.

  
Figure 1: Reference for choosing a scope based on the governance pain point you face

## Solution walkthrough

The following sections build the gateway one scope at a time. Start with the prerequisites, then advance through each scope as new governance questions appear.

### Prerequisites

To follow this post, you need an AWS account with permissions to create [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) and [Amazon Cognito](<https://aws.amazon.com/pm/cognito/>) resources, familiarity with OAuth 2.0 and AWS Identity and Access Management (IAM), basic AWS Command Line Interface (AWS CLI) experience, and an understanding of the [Model Context Protocol (MCP)](<https://modelcontextprotocol.io/specification>).

### Scope 1: Connect, the minimal governed gateway

The following diagram illustrates the minimal topology for Scope 1:

  
Figure 2: MCP clients connect to AgentCore Gateway, Amazon Cognito issues JWTs for authentication, AgentCore Identity manages outbound credentials, and one registered target receives tool calls

**When you need this scope** : 1–20 pilot users, low-risk tools, shadow MCP appearing.

**Key decisions:** Gateway ownership (infrastructure engineering, security, or shared). First tool choice. Whether to mandate gateway-only or coexist with a legacy `mcp.json`.

**What changes**

You stand up AgentCore Gateway with a Cognito-backed JWT authorizer and register one low-risk Lambda target (for example, a read-only ticket search). Authorization stays coarse: any authenticated client can invoke any registered tool. The `mcp.json` gains one new entry alongside existing public resources, emphasizing slow, additive change.

You can bring in your identity provider (IdP), for example Amazon Cognito, and integrate with AgentCore Identity, which handles [Machine-to-Machine (M2M) authentication](<https://aws.amazon.com/blogs/mt/configuring-machine-to-machine-authentication-with-amazon-cognito-and-amazon-api-gateway-part-2/>) through OAuth 2.0, outbound authentication of your AWS resources, or AWS Secrets Manager for API key-based auth. You now know when and which organizational resources were accessed through native [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) Logs and [AWS CloudTrail](<https://aws.amazon.com/cloudtrail/>).

**Client flow**

  1. The assistant bootstraps with a pre-provisioned client_id/client_secret and gateway URL.
  2. Per session, it fetches a Cognito token and attaches the bearer to tools/list and tools/call.
  3. The gateway validates the JWT and routes to the target.
  4. Backend credentials never leave AWS.



**Implementation snippets**.

Create the gateway with a JWT authorizer pointed at your IdP (for example, Cognito) and configure the allowedClients:
    
    
    aws bedrock-agentcore-control create-gateway \
      --name pilot-gateway \
      --role-arn arn:aws:iam::<account-id>:role/GatewayRole \
      --protocol-type MCP \
      --authorizer-type CUSTOM_JWT \
      --authorizer-configuration '{
      "customJWTAuthorizer": {
        "discoveryUrl": "https://cognito-idp.<region>.amazonaws.com/<pool-id>/.well-known/openid-configuration",
        "allowedClients": ["pilot-gateway-client"]
      }
    }'

This command turns Cognito-issued JWTs into the gateway’s only accepted credential.

Then register an AWS Lambda target (for example, a read-only ticket search):
    
    
    aws bedrock-agentcore-control create-gateway-target \
      --gateway-identifier pilot-gateway \
      --name TicketSearch \
      --target-configuration '{
      "mcp": { "lambda": { "lambdaArn": "arn:aws:lambda:<region>:<account-id>:function:ticket-search", "toolSchema": {"inlinePayload": "<tool-schema-json>"} } }
    }'

The Lambda is now reachable as an MCP tool with no client-side wiring. A distributed `mcp.json` replaces the local server entry:
    
    
    {
      "mcpServers": {
        "enterprise-tools-gateway": {
          "url": "https://<gateway-name>.gateway.bedrock-agentcore.<region>.amazonaws.com/mcp",
          "type": "http"
        }
      }
    }

Because the user base is small, distribute this entry to existing `mcp.json` files.

**Rollout**

**Phase 1 (day 1):** Provision a Cognito User Pool. Deploy the gateway. Register one low-risk Lambda target. **Phase 2 (day 2–3):** Distribute the updated `mcp.json` through MDM. Validate end-to-end: token fetch → tools/list → tools/call. **Phase 3 (week 1):** Confirm CloudWatch Logs and CloudTrail entries appear for each invocation.

**Result**. The end-to-end path works, the `mcp.json` now contains an endpoint that reaches org-wide resources, and executives observe that productivity and controls ship together.

After this stage, if you start getting questions such as:

  * Are users passing any PII (personally identifiable information) through tool invocations? How are we preventing that?
  * Do we ask for users’ consent to perform actions on their behalf? How are we verifying accountability?
  * User groups should have different access to tools. Is that possible?



Then you’re ready to expand the scope. If Scope 2 meets your current needs, skip to Considerations for operational guidance.

### Scope 2: Control, identity-aware authorization and guardrails

With the door open, Scope 2 names the caller and scrubs what flows through.

The following diagram shows how identity, policy, and guardrails integrate in Scope 2:

  
Figure 3: Gateway, Identity, and Policy bracketed by request and response interceptors with Amazon Bedrock Guardrails; Identity adds a DCR interface (Lambda and Amazon API Gateway for .well-known endpoints), AWS IAM, and Amazon DynamoDB, and a 3LO elicitation redirects users to the browser for consent

**When:** User base is growing and compliance asks “who did what, under which policy.” You need an answer, with PII scrubbed before it lands.

**Key decisions:** Identity provider selection. Transition auth model (code flow compared to client credentials). LOG_ONLY duration before ENFORCE. First Cedar deny rule.

**What changes**

You shift the gateway from machine-level trust to user-level trust. Clients now get dynamically added to the AgentCore Gateway allowedClients through a [Dynamic Client Registration (DCR)](<https://www.runlayer.com/blog/what-is-dynamic-client-registration>) mechanism. On the first tools/list call to the gateway, the client receives (RFC 9728/8414) metadata to call a DCR shim, which is a Lambda behind Amazon API Gateway that creates a Cognito app client on POST /register and appends the new client_id to AllowedClients through UpdateGateway.

The user signs in using SSO, completing the Authorization Code flow. Now the access token’s sub claim is the actual user. From here, every request carries that user identity. The first security gate, AgentCore Policy, intervenes where Cedar rules apply RBAC based on IdP group claims, token claims, and parameter gates. For example, `DeployCI___invoke` can be restricted to `context.input.environment == "staging"`, allowing or forbidding access to certain users.

If allowed, AgentCore Policy evaluates the request through its native [Amazon Bedrock Guardrails](<https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html>) integration, which applies PII filters, content policies, and prompt-attack detection at the gateway layer without custom code. For structural transforms or ABAC rules beyond what Guardrails covers, a request interceptor Lambda handles the remainder. When the target resource needs the user’s identity toward a SaaS system (for example, GitHub or Figma), AgentCore Identity Credential Providers handle the 3LO Authorization Code flow. The gateway emits an MCP elicitation (-32042 error) so the assistant can walk the user through consent in a browser.

At the response stage, interceptors scrub unintentional data. Every log record carries principal, matched policy ID, guardrail flag, and latency.

**Client flow: M2M to user-delegated**.

  1. The MCP client hits the gateway URL and receives a 401 with WWW-Authenticate.
  2. It follows RFC [9728](<https://datatracker.ietf.org/doc/html/rfc9728>) / [8414](<https://datatracker.ietf.org/doc/html/rfc8414>) / [7591](<https://datatracker.ietf.org/doc/html/rfc7591>) discovery and calls your DCR shim to mint a user-scoped client.
  3. The user signs in through Authorization Code + PKCE against hosted UI (backed by corporate SSO). The token’s sub claim is the actual user.
  4. tools/list returns a catalog filtered by AgentCore Policy. Two users in different groups receive different tool lists.
  5. Invocation flows: Policy, then Request Interceptor, then Guardrails, then target, then Response Interceptor, then Guardrails.
  6. When a target needs the user’s identity for SaaS (GitHub, Slack), the gateway emits a -32042 elicitation with an authorization URL. For targets sharing the inbound identity chain, OBO token exchange replaces the browser redirect entirely. The assistant opens the browser, calls [CompleteResourceTokenAuth](<https://docs.aws.amazon.com/bedrock-agentcore/latest/APIReference/API_CompleteResourceTokenAuth.html>) on consent, and retries.



**Implementation**

Attach the policy engine in LOG_ONLY mode by using the `update-gateway` command.

The following Cedar policy combines RBAC and parameter-level ABAC:
    
    
    // Payments deployers can deploy, but only to staging
    permit (
      principal,
      action == AgentCore::Action::"DeployCI___invoke",
      resource
    )
    when {
      principal.hasTag("groups") &&
      principal.getTag("groups").contains("repo-payments-service") /* Note: for Cognito, the claim is cognito:groups, not groups. Refer to your deployed Gateway Cedar schema for the precise tag names. */ &&
      context.input.environment == "staging"
    };
    
    // Read-only tools are open to any authenticated principal with a group
    permit (
      principal,
      action in [
        AgentCore::Action::"TicketSearch___invoke",
        AgentCore::Action::"DocsSearch___invoke"
      ],
      resource
    ) when { principal.hasTag("groups") };

The first rule pins risky deploys to staging. The second keeps low-risk reads frictionless. The following OpenTelemetry span attributes (emitted to the aws/spans log group) show a Deny decision:
    
    
    {
      "principal": "user:alice@example.com",
      "action": "DeployCI___invoke",
      "resource": "gateway/pilot-gateway/target/DeployCI",
      "decision": "Deny",
      "matchedPolicy": "policy-payments-deploy-staging",
      "reason": "context.input.environment != 'staging'"
    }

That record is the audit trail your compliance team has been asking for.

With native Amazon Bedrock Guardrails integration in AgentCore Policy (shipped July 2026), guardrails are expressed directly inside Cedar policies using the suppressOutput effect and when guardrails condition. The interceptor-Lambda approach remains available for structural transforms that guardrails don’t cover. The following shows the native Cedar approach for PII filtering:
    
    
    {
      "contentPolicyConfig": {
        "filtersConfig": [{ "type": "PROMPT_ATTACK", "inputStrength": "HIGH", "outputStrength": "NONE" }]
      },
      "sensitiveInformationPolicyConfig": {
        "piiEntitiesConfig": [
          { "type": "EMAIL", "action": "ANONYMIZE" },
          { "type": "US_SOCIAL_SECURITY_NUMBER", "action": "BLOCK" },
          { "type": "CREDIT_DEBIT_CARD_NUMBER", "action": "BLOCK" }
        ]
      }
    }

SSNs and card numbers never reach the model. Emails are masked.

Deploy the DCR shim: a Lambda behind Amazon API Gateway that creates Cognito app clients on POST /register and appends new client_id to allowedClients. Serve RFC 9728 .well-known/oauth-protected-resource metadata pointing to Cognito.

Create the 3LO credential provider and attach it to a target. The following is the minimal -32042 elicitation the client must handle:
    
    
    {
      "jsonrpc": "2.0", "id": 7,
      "error": {
        "code": -32042,
        "message": "authorization_required",
        "data": {
          "authorization_url": "https://oauth.example.com/auth?session_uri=urn:session:9f3a",
          "session_uri": "urn:session:9f3a"
        }
      }
    }

When the downstream resource trusts the same identity chain as the inbound token (for example, an internal microservice or a Microsoft Entra ID-protected API), the gateway can use [On-Behalf-Of (OBO) token exchange](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/on-behalf-of-token-exchange.html>) instead. OBO exchanges the inbound access token for a new, scoped token that carries both the user’s identity and the agent’s identity, with no browser redirect and no additional consent flow. Add an `onBehalfOfTokenExchangeConfig` block to the existing OAuth credential provider on the target, and the gateway handles the exchange transparently (RFC 8693 or RFC 7523 depending on your IdP).

**Rollout**

**Phase 1 (day 1–2):** Deploy the DCR shim Lambda and API Gateway endpoint. Update the gateway authorizer to accept dynamically registered clients. **Phase 2 (week 1–2):** Wire AgentCore Policy in LOG_ONLY mode. Deploy Guardrails in detect-only. Monitor aws.agentcore.policy.log_only_decision_flipping_policies to identify policies that would change decisions if promoted. **Phase 3 (week 3+):** Switch Policy to ENFORCE. Switch Guardrails to active blocking. Communicate the SSO consent prompt to users.

**Result**. Auditors get answers: who called which tool, when, under which policy. PII gets scrubbed before the assistant receives responses.

After this stage, if you start getting questions such as:

  * Are platform engineers buried under “please add this tool” tickets? Can users discover and subscribe to tools without filing one?
  * Do users need access to systems that don’t live on AWS, such as on-premises databases, another cloud, or external SaaS?
  * Can finance attribute gateway spend to the team that actually drove it?



Then, you’re ready to expand the scope. If Scope 2 meets your current needs, skip to Considerations for operational guidance.

### Scope 3: Catalog, self-service, registry, and cross-environment reach

Now make it self-serve and reach systems off AWS.

The following diagram shows the expanded architecture for Scope 3, including cross-environment connectivity:

  
Figure 4: Organization resources span on-premises systems reached through AWS PrivateLink or AWS Direct Connect and external SaaS through outbound OAuth; a Discovery block holds AWS Agent Registry with a Resources MCP server, an OPA interceptor joins the request and response paths, and a FinOps block captures AWS Budgets and AWS Cost Explorer

**When:** “add this tool” tickets pile up, or you need reach into another vendor or on-premises. Past 100 users, central catalog and reach beyond AWS are not optional.

**Key decisions:** Self-serve publishing with approval, or ticket-gated. First on-premises or multi-cloud target. OPA for org-wide policy rules, and sophisticated ABAC logic or Cedar only.

**What changes**

You stop being the bottleneck for tool intake, and the gateway extends to systems outside AWS. Tool owners now create a YAML manifest to request new tools and open a pull request that triggers a security scan and platform review. On merge, your continuous integration pipeline calls create-gateway-target and updates the Cedar policy automatically. No ticket required, no manual UpdateGateway.

You can now centralize skills your IDE might need: it queries AWS Agent Registry (now in the `agent-registry` namespace, available in nine AWS Regions) to list skills and download the ones relevant for the task. Administrators govern discoverability through an approval workflow, so people receive only what they need, keeping irrelevant skills out of the assistant’s context and reducing prompt pollution.

When a request leaves the gateway, the target might live anywhere: AWS Lambda, an on-premises database that you reach through Gateway VPC Egress (using `managedVpcResource` or `selfManagedLatticeResource` configurations) with AWS Direct Connect or AWS Site-to-Site VPN behind it, or a SaaS API that you reach through NAT egress with outbound OAuth. The client cannot tell the difference.

Inside the request path, Open Policy Agent (OPA) evaluation is added inside the existing request-interceptor Lambda to cover rules Cedar can’t natively express: time windows, payload content inspection, rate-based access, and change-ticket requirements. A second MCP connection (the Resources MCP server) auto-fetches on session start and distributes organizational context such as steering files, coding standards, prompt templates, release checklists, and on-call runbooks. Every assistant in the org picks up the same context without per-developer config.

For FinOps, Amazon CloudWatch metric filters and AWS Cost Explorer tags attribute cost per tool and per group. Finance can finally answer who drove the bill. The `mcp.json` is now managed centrally, with no way to add your own public configurations, and it is distributed through MDM or a central MCP registry. In addition to the gateway, you also manage IDE admin configuration centrally, which controls behavior.

**Client flow**. Bootstrap matches Scope 2, with no new auth flow. A second `mcp.json` entry for the Resources MCP server is auto-fetched on session start, providing organizational standards and approved skills. Invocation still goes through the gateway. The target might live on-premises or in SaaS, and the client can’t tell. Scope 3 is additive on the client side, making it a low-risk rollout.

**Implementation snippets**.

The following OPA Rego policy handles a rule Cedar cannot natively express. `db_write` is allowed only on weekdays, 09:00 to 17:00 UTC, with a change ticket attached:
    
    
    package mcp.tools
    
    import rego.v1
    
    default allow := false
    
    allow if {
      input.tool == "db_write"
      clock := time.clock(time.now_ns())
      clock[0] >= 9
      clock[0] < 17
      weekday := time.weekday(time.now_ns())
      not weekday in {"Saturday", "Sunday"}
      input.claims.change_ticket_id != ""
    }

OPA handles clock and weekday checks natively, complementing Cedar’s identity and resource-based policies.

The following is a Registry YAML manifest for a new tool:
    
    
    # registry/tools/payment-refund.yaml
    name: PaymentRefund
    owner: payments-platform@example.com
    target:
      type: lambda
      arn: arn:aws:lambda:us-west-2:<account-id>:function:payment-refund
    access:
      allowed_groups: [finance-ops, senior-support]
      environments: [staging] # prod requires separate approval
      risk_tier: high

Tool ownership, access, and risk live in version control alongside the rest of your infrastructure. Your continuous integration pipeline validates the manifest, runs a security scan, opens a pull request for review, and on merge calls create-gateway-target and updates the Cedar policy.

The following Resources MCP server config is distributed to every assistant, exposing tools such as `get_coding_standards`, `get_prompt_library`, `get_release_checklist`, and `get_oncall_runbook`:
    
    
    {
      "mcpServers": {
        "resources-gateway": {
          "url": "https://<gateway-name>.gateway.bedrock-agentcore.<region>.amazonaws.com/mcp/resources",
          "type": "http"
        }
      }
    }

Every assistant in the org now accesses the same coding standards and runbooks without manual setup.

The following command creates a PrivateLink endpoint into the gateway from a virtual private cloud (VPC) that peers with on-premises through AWS Direct Connect:
    
    
    aws ec2 create-vpc-endpoint \
      --vpc-id vpc-0a1b2c3d4e5f67890 \
      --service-name com.amazonaws.<region>.bedrock-agentcore \
      --vpc-endpoint-type Interface \
      --subnet-ids subnet-0aaa1111 subnet-0bbb2222 \
      --security-group-ids sg-0ccc3333

Gateway traffic now stays on the AWS network. From there, AWS Direct Connect handles the on-premises hop. For non-MCP endpoints (A2A agent URLs, legacy REST APIs), HTTP passthrough targets route traffic directly without protocol translation.

The following AWS Budgets alert fires when a tool exceeds a monthly invocation-cost threshold:
    
    
    {
      "BudgetName": "GatewayTool-PaymentRefund",
      "BudgetLimit": { "Amount": "250", "Unit": "USD" },
      "TimeUnit": "MONTHLY",
      "BudgetType": "COST",
      "CostFilters": { "TagKeyValue": ["user:AgentCoreTool$PaymentRefund"] }
    }

Per-tool tagging means finance can attribute spend to the team that owns the tool, not the platform.

**Rollout**

**Phase 1 (week 1):** Set up the YAML manifest schema and CI pipeline. Migrate existing targets to manifest-driven registration. **Phase 2 (week 2–3):** Deploy the OPA interceptor. Create the Resources MCP server. Establish PrivateLink or Direct Connect for on-premises targets. **Phase 3 (week 4+):** Configure cost allocation tags and Budgets alerts. Distribute the updated `mcp.json`. Roll out group by group, starting with teams that filed the most tool-request tickets.

**Result**. The Scope 2 ticket-driven intake is eliminated. Natural-language discovery shortens onboarding, and the gateway reaches on-premises and multi-cloud without lifting workloads.

After this stage, if you start getting questions such as:

  * Is your gateway still reachable from the public internet, and would a regulator be comfortable with that?
  * If your primary Region fails during business hours, what is the documented recovery path users would follow?
  * How many registered tools had zero invocations last quarter, and who is paying to keep them on the books?



Then, you’re ready to expand the scope. If Scope 3 meets your current needs, skip to Considerations for operational guidance.

### Scope 4: Harden, resilience and governance

Catalog and reach are working. Scope 4 hardens the edge and plans for outages.

The following diagram shows the hardened architecture with private ingress and governance dashboards:

  
Figure 5: A new ingress stack with Amazon CloudFront, a CloudFront-restricted Application Load Balancer in a public subnet, a VPC endpoint in a private subnet, PrivateLink, and the gateway; a governance panel holds Amazon Athena, custom dashboards, and a Lambda function that flags unused resources

**When** : AI workloads that require high availability and resilience, heavily regulated industries, or a global user base with low-latency and DR requirements.

**Key decisions:** Circuit breaker blast radius. Active-active or active-passive DR. Gateway SLO target. Deprecation authority ownership.

**What changes**

You harden the perimeter and turn governance into something a regulator can read at a glance. The request now starts inside your corporate network. Your IDE no longer resolves a public gateway hostname. Instead, it routes through Amazon CloudFront at the edge (close to users), which forwards to a CloudFront-restricted Application Load Balancer in a public subnet using a shared-secret header that prevents traffic from bypassing CloudFront. The request then moves through a VPC Endpoint in a private subnet to PrivateLink and finally the gateway. Public DNS exposure is gone, and the gateway is reachable only through your private path. For Runtime-hosted agents, enable inbound-only enforcement so the Runtime rejects any invocation that does not originate from the gateway. This prevents callers from bypassing policy, guardrails, and audit.

The request follows the same Scope 3 path, but now every decision flows into Amazon CloudWatch and AWS CloudTrail where [Amazon Athena](<https://aws.amazon.com/athena/>) queries answer compliance-grade questions. For example: “Which principals had the highest deny rate last week, and which policies denied them?” Custom dashboards surface invocations, latency percentiles, guardrail intervention rates, deny rate per policy, top-denied principals, and an executive compliance view with anomaly alerts.

For global users, Multi-AZ provides strong resilience within a Region. You extend with [Amazon Route 53](<https://aws.amazon.com/route53/>) health-checked failover and a multi-Region active-passive deployment where gateway definitions and registry state replicate through your pipelines. Design tools to be idempotent so the first retry after a DNS failover is safe.

Finally, a nightly deprecation Lambda reads Amazon CloudWatch invocation metrics and opens a pull request for any tool with zero usage over 30 days. Owners are notified, the registry marks the tool, the policy moves to LOG_ONLY, and after 90 days the target is removed. Your gateway never accumulates zombies.

**Client flow**. Auth and discovery stay unchanged from Scope 3. The assistant runs on the corporate network with a route to the gateway’s PrivateLink endpoint, and the hostname might resolve only on-network. With Route 53 failover, a failed request triggers DNS re-resolution and lands in the secondary Region. Clients now additionally handle Deprecation headers (RFC 8594) surfaced to the user, 429 with Retry-After for quota exhaustion, and optionally OpenTelemetry traces correlated through `traceparent` with the gateway’s spans.

**Implementation**.

The following Amazon Route 53 failover record set configures gateway endpoints in two Regions:
    
    
    [
      {
        "Name": "gateway.example.com.", "Type": "CNAME", "SetIdentifier": "primary-us-west-2",
        "Failover": "PRIMARY", "TTL": 30,
        "HealthCheckId": "hc-0123456789abcdef0",
        "ResourceRecords": [{"Value": "dxxxxxxxxxxxxx.cloudfront.net"}]
      },
      {
        "Name": "gateway.example.com.", "Type": "CNAME", "SetIdentifier": "secondary-eu-west-1",
        "Failover": "SECONDARY", "TTL": 30,
        "ResourceRecords": [{"Value": "dyyyyyyyyyyyyy.cloudfront.net"}]
      }
    ]

When the primary health check fails, DNS switches to the secondary Region within one TTL.

The following Amazon Athena query over AWS CloudTrail answers “Which principals had the highest deny rate last week, and which policies denied them?”:
    
    
    SELECT attributes.`aws.agentcore.policy.determining_policies` as policies, COUNT(*) AS denies,
      DATE_TRUNC('day', from_iso8601_timestamp(event_time)) AS day
    FROM aws_spans_export
    WHERE attributes.`aws.agentcore.policy.authorization_decision` = 'DENY'
      AND from_iso8601_timestamp(event_time) > current_date - INTERVAL '7' DAY
    GROUP BY principal, matched_policy, DATE_TRUNC('day', from_iso8601_timestamp(event_time))
    ORDER BY denies DESC
    LIMIT 25;

This CloudWatch Logs Insights query (run against the aws/spans log group with tracing enabled on the gateway) feeds the dashboard tile that surfaces drift before users start filing tickets.

The following AWS Cloud Development Kit (AWS CDK) snippet sets up the CloudFront, CloudFront-restricted Application Load Balancer, and VPC Endpoint stack:
    
    
    distribution = cloudfront.Distribution(self, "GatewayEdge",
        default_behavior=cloudfront.BehaviorOptions(
            origin=origins.LoadBalancerV2Origin(alb,
                custom_headers={"X-Origin-Verify": origin_secret.secret_value.unsafe_unwrap()}),
            allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
            viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        ),
        web_acl_id=waf_acl.attr_arn,)
    
    ec2.InterfaceVpcEndpoint(self, "GatewayEndpoint",
        vpc=vpc, service=ec2.InterfaceVpcEndpointAwsService("bedrock-agentcore.gateway"),
        subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS))

The shared-secret header makes sure traffic only reaches the ALB through CloudFront, not through direct DNS.

The following nightly deprecation Lambda (pseudocode) reads Amazon CloudWatch metrics and opens a deprecation pull request:
    
    
    def handler(event, _ctx):
        for tool in list_registry_tools():
            datapoints = cw.get_metric_statistics(
                Namespace="AWS/BedrockAgentCore",
                MetricName="Invocations",
                Dimensions=[{"Name":"ToolName","Value":tool.name}],
                StartTime=now()-timedelta(days=30), EndTime=now(),
                Period=86400, Statistics=["Sum"],
            )["Datapoints"]
            if sum(p["Sum"] for p in datapoints) == 0:
                open_pr(f"deprecate/{tool.name}",
                    body="No invocations in 30d; moving to LOG_ONLY, removal in 90d.")

Zombie tools get retired automatically through the same code-review process that created them.

**Rollout**

**Phase 1 (week 1–2):** Deploy CloudFront + ALB + VPC Endpoint stack. Update DNS. Validate public endpoint is no longer resolvable. **Phase 2 (week 3–4):** Deploy Athena tables and governance dashboard. Set up Route 53 health checks and failover records. Replicate gateway definitions to secondary Region. **Phase 3 (month 2):** Deploy the deprecation Lambda. Run a failover drill: disable the primary health check and validate DNS switches.

**Result**. Zero-trust network controls, private connectivity, global low-latency access at the edge, and documented recovery paths. Governance becomes a visible product.

That covers the full four-scope build, but most teams don’t need every scope. The rest of this post helps you decide where to stop, provides a real-world example, and covers operational considerations.

## Reference deployment timeline

The following timeline shows how a representative financial services organization walked these four scopes in six months.

**Scope 1 (Week 1).** Two analysts ran Amazon Quick against a staging SQL tool. AgentCore Gateway fronted it with Cognito M2M auth. Infrastructure engineering owned the gateway from day one.

**Scope 2 (Weeks 2–4).** Thirty analysts across three desks. DCR shim, Authorization Code + PKCE, desk-level RBAC, Guardrails for PII, CloudTrail. Switching auth flows mid-rollout was awkward. Compliance’s first audit query returned complete results on the first attempt.

**Scope 3 (Months 2–3).** Two hundred users across five departments. The Registry made tools discoverable. Trading stayed on-premises through Direct Connect. Resources MCP distributed checklists. The ticket queue dropped about 40 percent in two weeks.

**Scope 4 (Month 6).** Bank-wide, 1,000 users. MiFID II required immutable audit and network isolation. PrivateLink removed public DNS. Route 53 failover met the 4-hour RTO.

**Outcome.** Regulators could trace which analyst queried which positions, under which policy. The graduation trigger for each scope was a concrete organizational question, not a predetermined timeline.

## Considerations

These considerations cut across every scope. Note that Amazon Bedrock AgentCore Gateway and Amazon Bedrock Guardrails availability varies by AWS Region. See the [Amazon Bedrock AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/>) for current Region support.

**Gateway operations**. Treat the gateway with operational practices equivalent to your production services from day one. Later changes cost more. Run dev, staging, and production across separate AWS accounts, IdP client IDs, and policy engines, promoted through IaC. Choose one org-wide gateway or per-BU for isolation. Enforce naming at intake. Evaluate new tools on risk tier, data classification, owner SLA, and auth-model fit. Registration flow: request, review, scan, staging, soak, production.

**Security**. Plaintext credentials and unscoped egress create opportunities for inadvertent access. Store credentials in AWS Secrets Manager or HashiCorp Vault with rotation, or eliminate shared secrets entirely by using Private Key JWT client authentication (private key in AWS KMS, every signing operation recorded in CloudTrail). Never store credentials in environment variables. Distribute a centrally managed `mcp.json` through MDM. Block assistant traffic to non-gateway MCP endpoints at the corporate proxy or endpoint detection and response (EDR). Require TLS 1.2+ and AWS Key Management Service (AWS KMS) encryption at rest. Apply AWS IAM Service Control Policies (SCPs) with `aws:CalledViaAWSMCP` or `aws:ViaAWSMCPService` to deny destructive operations invoked through AWS-managed MCP servers (these keys don’t apply to traffic through your own AgentCore Gateway. For your own gateway, restrict the target execution role instead):
    
    
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "DenyDestructiveFromMCP",
        "Effect": "Deny",
        "Action": ["s3:DeleteBucket","kms:ScheduleKeyDeletion","dynamodb:DeleteTable"],
        "Resource": "*",
        "Condition": { "Bool": { "aws:ViaAWSMCPService": "true" } }
      }]
    }

If a Cedar policy slips through review, the SCP backstop blocks the worst outcomes.

**Resilience**. When the gateway is down, all assistants relying on it are unavailable. Every gateway, target, policy, and registry entry ships as code. Federated regional gateways cover data residency (EU, China, Russia). Replicate _policy_ , not _data_. One gateway serves Kiro, Claude Code, Amazon Quick, and Glean.

**Cost**. Cost surprises arrive faster than usage reports. Rate-limit per principal and per tool (natively supported by Gateway configurable rate limiting at no extra charge, with dimensional scoping by JWT claims, targets, and tool names). Set budgets and quotas per group with soft alerts before hard stops. Cache responses for idempotent read tools at the interceptor to reduce redundant invocations. For reference pricing, about 50 developers running 572,000 operations in total per month cost approximately $17 for Gateway and Policy combined (Gateway InvokeTool at $5 per million plus Policy authorization at $25 per million; Identity costs $0 when consumed through Gateway) (refer to the [Amazon Bedrock AgentCore pricing page](<https://aws.amazon.com/bedrock/agentcore/pricing/>) for current rates).

## Clean up resources

If you deployed resources while following this post, remove them to avoid ongoing charges. Delete resources in reverse order of creation to avoid dependency errors.

**Scope 4 resources** :

  1. Delete the Amazon Route 53 failover records and health checks.
  2. Delete the CloudFront distribution.
  3. Delete the Application Load Balancer, target group, and associated security groups.
  4. Delete the VPC Endpoint for `bedrock-agentcore`.
  5. Remove the deprecation Lambda and its CloudWatch Events rule.
  6. Drop the Amazon Athena tables and workgroup.



**Scope 3 resources** :

  1. Delete AWS Budgets alerts and cost allocation tags.
  2. Remove the PrivateLink VPC Endpoint for on-premises connectivity.
  3. Delete the Resources MCP server target from the gateway.
  4. Remove registered tool targets created from YAML manifests.
  5. Delete the OPA interceptor Lambda.



**Scope 2 resources** :

  1. Delete the Guardrails configuration.
  2. Delete the Request and Response Interceptor Lambdas.
  3. Delete the DCR shim Lambda and its Amazon API Gateway endpoint.
  4. Remove Cedar policies from AgentCore Policy.
  5. Delete the DynamoDB table used for ABAC rules.



**Scope 1 resources** :

  1. Delete gateway targets (for example, TicketSearch) using [DeleteGatewayTarget](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteGatewayTarget.html>).
  2. Delete the gateway itself:`aws bedrock-agentcore-control delete-gateway --gateway-identifier pilot-gateway`(see [DeleteGateway](<https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_DeleteGateway.html>)).
  3. Delete the Cognito User Pool app client and, if created for this purpose, the User Pool.
  4. Delete the IAM role used by the gateway (`GatewayRole`).



## Continuous improvement

Governance is a living system.

**Quarterly**. Review deny logs and adjust policies to tighten overly permissive rules and relax those that create friction without reducing risk. Audit PrivateLink endpoints and egress rules. Remove anything unused. Narrow gateway execution roles. Keep Resources MCP content fresh and version steering files. Enforce the deprecation mechanism so your registry has zero zombie tools.

**Monthly**. Review cost anomalies, guardrail intervention spikes, and top-denied principals. A top-denied principal often signals that the policy is too tight.

**Continuously**. Every tool registration and policy change ships as a pull request reviewed by security and platform groups.

## Conclusion

In this post, we walked through a four-scope maturity model for governing AI agent tool access, from a single governed endpoint to enterprise-wide hardening. With this approach, teams ship AI productivity and governance controls together, advancing only when real pain demands it.

If you’re getting started, stand up a Scope 1 gateway in a development account, point one assistant at it, and distribute the new `mcp.json`.

If you need compliance, start with Scope 1 as the foundation (it takes a day), then layer Scope 2: add the DCR shim, wire Cedar in LOG_ONLY, and enable Guardrails in detect-only mode. The two scopes deploy together within a sprint.

If you are scaling production, Scope 3’s registry and self-serve publishing deliver the immediate user-visible gains. Per-tool tagging gives finance attribution. Roll out group by group.

As IDE-driven assistants mature, the same gateway becomes the control plane for autonomous agents. The gateway provides not only tool access but also agent-to-agent task delegation, with every invocation flowing through policy.

Pick the scope that matches today’s pain and use the [Amazon Bedrock AgentCore Gateway developer guide](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) to deploy your first gateway. Start with a single low-risk tool behind the gateway, validate the end-to-end token flow with your identity provider, and expand scope only when you encounter the next governance question from your team.

This guide shows you a sample implementation of how to build a [governance layer and a tools gateway using AgentCore Gateway](<https://github.com/aws-samples/sample-ai-agent-factory/tree/main/enterprise-mcp-governance-gateway>).

### Further reading

  * Read the [Amazon Bedrock AgentCore Gateway documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>).
  * Review the [Model Context Protocol specification](<https://modelcontextprotocol.io/specification>).
  * Read [Govern MCP tools at scale with Kiro and AgentCore Gateway](<https://builder.aws.com/content/3CS1jTWHngGW3IxFXCjcP2T9l8B/govern-mcp-tools-at-scale-with-kiro-and-agentcore-gateway>) on builder.aws.com.
  * Review the [Open Policy Agent and Rego documentation](<https://www.openpolicyagent.org/docs/policy-language/>) for self-hosted policy.
  * Review the [NeMo Guardrails project](<https://github.com/NVIDIA/NeMo-Guardrails>) for self-hosted guardrails.
  * Review the [LangFuse documentation](<https://langfuse.com/docs>) for self-hosted observability.
  * Explore [Amazon Bedrock AgentCore](<https://console.aws.amazon.com/bedrock/>) in the AWS Management Console.
  * Read [Introducing Amazon Bedrock AgentCore Gateway](<https://aws.amazon.com/blogs/machine-learning/introducing-amazon-bedrock-agentcore-gateway-transforming-enterprise-ai-agent-tool-development/>) for the service launch announcement.



* * *

## About the authors

### Talha Chattha

[Talha](<https://www.linkedin.com/in/talha-chattha/>) is a Sr. Agentic AI Specialist SA, based in Stockholm. With 10+ years of experience working with AI, he now helps establish practices to ease the path to production for Agentic AI workloads. Talha is an expert in AgentCore and supports customers across entire EMEA. He is passionate about meta-agents, async patterns, advanced hierarchical solutions and optimized context engineering for agents.

### Mia Chang

[Mia](<https://de.linkedin.com/in/mia-chang>) is a Specialist Solutions Architect for Agentic AI, based in Berlin, Germany. She helps enterprise customers across EMEA design, operationalize, and scale agentic AI workloads, from first agents to production on managed platforms; and hybrid architectures with self-managed infrastructure. Her expertise spans agentic application architecture, agent security and governance, Responsible AI, and platform engineering.
