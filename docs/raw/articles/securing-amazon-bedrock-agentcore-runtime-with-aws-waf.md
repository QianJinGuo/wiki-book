---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/securing-amazon-bedrock-agentcore-runtime-with-aws-waf
ingested: 2026-07-09
feed_name: AWS China ML
source_published: 2026-07-08
sha256: "9430b088950adf8a0e0e7baca3638551c254056bb4a28a36863c771093646421"
---

# Securing Amazon Bedrock AgentCore Runtime with AWS WAF

When you deploy generative AI agents with [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) as production API endpoints, you might want to enforce web application firewall policies, rate limiting, protection against common web threats, or audit controls via [AWS WAF](<https://aws.amazon.com/waf/>).

AWS WAF integrates with Elastic Load Balancing [Application Load Balancers](<https://aws.amazon.com/elasticloadbalancing/application-load-balancer/>) (ALBs), [Amazon CloudFront](<https://aws.amazon.com/cloudfront/>) distributions, and [Amazon API Gateway](<https://aws.amazon.com/api-gateway/>) REST APIs. Amazon CloudFront is designed for caching and content delivery. Since agent invocations are real-time and dynamic, caching doesn’t apply. Amazon API Gateway adds its own authentication and request transformation layer, which can create a double-authentication problem with the built-in SigV4 and OAuth handling in AgentCore. That leaves an internet-facing ALB as the integration point: It passes headers through transparently, supports VPC-internal routing, and attaches directly to an AWS WAF WebACL. From there, you route traffic to AgentCore through a VPC Interface Endpoint for the Bedrock AgentCore data plane service.

This is where the challenge appears. ALBs require health checks to verify that backend targets are responsive. But AgentCore Runtime requires authentication, SigV4 or OAuth, on API calls, including health check requests. Standard ALB health checks send unauthenticated requests, so they fail out of the box. You need a way to make health checks work without credentials while still passing authenticated production traffic through to AgentCore.

This post shows you two architecture patterns that address this problem. Both use an internet-facing ALB with AWS WAF and route traffic through a VPC Interface Endpoint to AgentCore Runtime. Pattern 1 places an [AWS Lambda](<https://aws.amazon.com/lambda/>) proxy between the ALB and the VPC Endpoint, giving you full control over request transformation. Pattern 2 targets the VPC Endpoint ENI IP addresses directly from the ALB, removing the Lambda hop entirely. You also learn how to close the direct-access backdoor with a resource policy so that traffic flows through AWS WAF only. Both patterns have been tested end-to-end with SigV4 and OAuth (Amazon Cognito JWT) authentication.

## Architecture overview

The two patterns share a common foundation. A client application sends an authenticated request, either a SigV4 signature or an OAuth Bearer token, to an internet-facing ALB. AWS WAF inspects the request before the ALB forwards it to VPC Endpoint ENIs on HTTPS port 443. AgentCore validates the authentication and routes the request to the runtime container on its internal port 8080. The difference between the patterns is what sits between the ALB and the VPC Endpoint.

High-level architecture, Client → AWS WAF → ALB → VPC Endpoint (PrivateLink) → AgentCore Runtime container

The architecture has four components:

  1. **AWS WAF** attaches to the ALB and provides rate limiting, SQL injection protection, XSS filtering, and bot control through managed rule groups like AWSManagedRulesCommonRuleSet.
  2. **ALB** is internet-facing with an HTTPS listener on port 443, routing traffic to VPC Endpoint ENI IP targets.
  3. **[VPC Interface Endpoint](<https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html>)** (`com.amazonaws.<region>.bedrock-agentcore`) provides private connectivity to AgentCore through PrivateLink.
  4. **AgentCore Runtime** is the managed container running your agent code, listening on internal port 8080 and supporting both SigV4 and OAuth authentication.



_**Note:** Use `com.amazonaws.<region>.bedrock-agentcore` (data plane) for Runtime invocations. There are three separate endpoint services: bedrock-agentcore (data plane for Runtime, Memory, Tools), bedrock-agentcore-control (control plane), and bedrock-agentcore.gateway (Gateway only). Using the wrong endpoint will not route to your Runtime._

## Prerequisites

To follow along with this walkthrough, you need:

  * An AWS account with Amazon Bedrock AgentCore enabled.
  * An AgentCore Runtime deployed (public or VPC mode).
  * A VPC with public and private subnets across at least two Availability Zones.
  * An AWS Certificate Manager (ACM) certificate in the same Region, for the ALB’s HTTPS listener.
  * An [Amazon Cognito](<https://aws.amazon.com/cognito/>) User Pool (for the OAuth pattern) or AWS credentials (for the SigV4 pattern).
  * Familiarity with ALB, VPC Endpoints, and AWS WAF.



The following sections describe two patterns for integrating AWS WAF with AgentCore. If you need request transformation, custom logging, or authentication translation between the ALB and AgentCore, start with Pattern 1. If you want the simplest architecture with the lowest latency and no additional components, skip to Pattern 2.

## Pattern 1: ALB with Lambda proxy

In this pattern, a Lambda function sits behind the ALB and forwards requests, including the authentication header, to AgentCore through the VPC Endpoint. The Lambda function gives you a compute layer where you can transform requests, translate between authentication methods, or add custom logging before the request reaches AgentCore.

Pattern 1 architecture, Client (JWT) → AWS WAF → ALB → Lambda Proxy → VPC → VPC Endpoint → AgentCore Runtime (OAuth authorizer)

Choose Pattern 1 if you need:

  * Request transformation, header manipulation, payload changes, or protocol translation.
  * Custom logging or audit trails at the proxy layer.
  * Translation between multiple authentication methods.
  * An explicit compute layer between the ALB and backend (some security policies require this).



### Create the VPC Endpoint

Create a VPC Interface Endpoint for the AgentCore data plane service in your private subnets:
    
    
    aws ec2 create-vpc-endpoint \
      --vpc-id vpc-xxxxxxxxx \
      --service-name com.amazonaws.us-east-1.bedrock-agentcore \
      --vpc-endpoint-type Interface \
      --subnet-ids subnet-aaaa subnet-bbbb \
      --security-group-ids sg-xxxxxxxxx

_Note: VPC Interface Endpoints incur hourly charges per Availability Zone plus data processing charges per GB. See[VPC pricing](<https://aws.amazon.com/vpc/pricing/>)._

Configure the VPC Endpoint security group to allow inbound HTTPS (port 443) only from the ALB’s security group. This restricts access so that traffic routed through the ALB can reach the VPC Endpoint. For example:
    
    
    aws ec2 authorize-security-group-ingress \
      --group-id <vpce-sg-id> \
      --protocol tcp \
      --port 443 \
      --source-group <alb-sg-id>

### Create the Lambda proxy

The Lambda function receives requests from the ALB and forwards them to AgentCore through the VPC Endpoint. For OAuth, it passes the Authorization header (the Bearer token) through unchanged, along with the original request path and body, so the JWT reaches AgentCore as-is. For SigV4, the signature is bound to the original request host and becomes invalid after the request is forwarded to the VPC Endpoint, so the proxy re-signs the request using its own execution-role credentials.

The following Python snippet shows the core forwarding logic. The function reads the Authorization header from the ALB event, constructs the target URL using the VPC Endpoint DNS name, and forwards the request with the original headers and body intact. This forwarding path works as-is for OAuth Bearer tokens. SigV4 requests require the additional re-signing step, which is included in the accompanying repository.
    
    
    import json
    import urllib3
    import os
    
    http = urllib3.PoolManager()
    VPCE_DNS = os.environ["VPCE_DNS_NAME"]
    
    def handler(event, context):
        path = event.get("path", "/")
        headers = event.get("headers", {})
        body = event.get("body", "")
        method = event.get("httpMethod", "POST")
    
        target_url = f"https://{VPCE_DNS}{path}"
    
        resp = http.request(
            method,
            target_url,
            headers={
                "Authorization": headers.get("authorization", ""),
                "Content-Type": headers.get("content-type", "application/json"),
            },
            body=body,
        )
    
        return {
            "statusCode": resp.status,
            "headers": {"Content-Type": "application/json"},
            "body": resp.data.decode("utf-8"),
        }

For brevity, the preceding snippet focuses on the forwarding logic. The complete production-ready implementation, including SigV4 signing, query string handling, ALB health check responses, and structured error handling, is available in the [accompanying GitHub repository](<https://github.com/aws-samples/sample-bedrock-agentcore-waf-patterns/blob/main/lambda/sigv4_proxy.py>).

_Note: The Lambda proxy incurs charges per request and for compute duration (GB-seconds). See[AWS Lambda pricing](<https://aws.amazon.com/lambda/pricing/>)._

### Configure ALB with Lambda target group

Create a Lambda target group, register the proxy function, and create an HTTPS listener on the ALB. The ALB handles TLS termination and forwards the decrypted request to the Lambda function.

_Note: Application Load Balancers incur hourly charges plus Load Balancer Capacity Unit (LCU) charges based on traffic. See[Elastic Load Balancing pricing](<https://aws.amazon.com/elasticloadbalancing/pricing/>)._

### Attach AWS WAF

Associate an AWS WAF WebACL with the ALB. A typical starting configuration includes AWSManagedRulesCommonRuleSet for protection against common web threats, a rate-based rule to throttle excessive requests per source IP, and AWSManagedRulesBotControlRuleSet if your agents are exposed to browser-based clients. You can add or remove managed rule groups based on your threat model. These are examples, not a prescriptive minimum.

_Note: AWS WAF incurs charges per WebACL per month, per rule, and per million requests inspected. See[AWS WAF pricing](<https://aws.amazon.com/waf/pricing/>)._

_**Note:** Lambda target groups don’t use path-based health checks. The ALB verifies the function is invocable by calling it directly, so no special health check configuration is needed._

### Pattern 1 trade-offs

**Aspect** | **Impact**  
---|---  
Latency | Adds 50–200 ms per request (Lambda cold start). Mitigate with provisioned concurrency.  
Cost | Lambda invocation cost per request.  
Complexity | Additional component to deploy, monitor, and maintain.  
Flexibility | Full control over request/response transformation and custom logging.  
  
_**Note:** The Lambda proxy adds approximately 50–200 ms of latency per request. For latency-sensitive workloads, consider Pattern 2, which removes this overhead._

## Pattern 2: ALB directly to VPC Endpoint

In this pattern, the ALB targets the VPC Endpoint ENI IP addresses directly on HTTPS port 443. There is no Lambda function and no Network Load Balancer. The ALB passes authentication headers through to AgentCore transparently. This architecture has fewer components and removes the Lambda proxy hop.

Pattern 2 architecture, Client (JWT or SigV4) → AWS WAF → ALB → VPC Endpoint ENIs (HTTPS 443) → AgentCore Runtime

Choose Pattern 2 if you want:

  * A simpler architecture with fewer components.
  * No request transformation between the ALB and AgentCore.
  * Minimal latency with no additional hops.
  * Your client application to handle SigV4 or OAuth signing directly.



### Create the VPC Endpoint

Create a VPC Interface Endpoint for com.amazonaws.<region>.bedrock-agentcore in your private subnets, using the same command shown in Pattern 1, Step 1.

### Retrieve the VPC Endpoint ENI IP addresses

Get the private IP addresses of the ENIs created by the VPC Endpoint. These IPs become the targets for your ALB target group.
    
    
    # Get the ENI IDs
    aws ec2 describe-vpc-endpoints \
      --vpc-endpoint-ids vpce-xxxxxxxxx \
      --query "VpcEndpoints[0].NetworkInterfaceIds"
    
    # Get the private IPs
    aws ec2 describe-network-interfaces \
      --network-interface-ids eni-aaaa eni-bbbb \
      --query "NetworkInterfaces[].PrivateIpAddress"

### Create an IP target group with a health check

This step is the key configuration that makes Pattern 2 work. Create an IP-type target group on HTTPS port 443 with a health check that doesn’t require authentication.
    
    
    aws elbv2 create-target-group \
      --name agentcore-vpce-tg \
      --target-type ip \
      --protocol HTTPS \
      --port 443 \
      --vpc-id vpc-xxxxxxxxx \
      --health-check-protocol HTTPS \
      --health-check-port 443 \
      --health-check-path / \
      --matcher HttpCode=200-499

_Note: This target group is available at no additional cost, but the associated Application Load Balancer incurs hourly plus LCU charges, and the VPC Interface Endpoint incurs hourly and data processing charges. See[Elastic Load Balancing pricing](<https://aws.amazon.com/elasticloadbalancing/pricing/>)._

The health check uses path / with a matcher of 200–499. AgentCore returns a 404 on / because it isn’t a valid API path, but the ALB accepts responses in the 200–499 range as healthy. This works because the goal is to verify that the VPC Endpoint is responding. The specific status code doesn’t matter. This approach requires no authentication for health checks.

### Register the targets

Register the VPC Endpoint ENI IPs as targets:
    
    
    aws elbv2 register-targets \
      --target-group-arn <tg-arn> \
      --targets Id=10.0.1.100,Port=443 Id=10.0.2.200,Port=443

### Create the HTTPS listener

Create an HTTPS listener on the ALB that forwards to the target group. The ALB handles TLS termination using your ACM certificate:
    
    
    aws elbv2 create-listener \
      --load-balancer-arn <alb-arn> \
      --protocol HTTPS \
      --port 443 \
      --certificates CertificateArn=<acm-cert-arn> \
      --default-actions Type=forward,TargetGroupArn=<tg-arn>

### Attach AWS WAF

Associate an AWS WAF WebACL with the ALB, using the same approach described in Pattern 1, Step 4.

### How authentication passes through the ALB

The ALB passes the Authorization header through without modification. Both SigV4 signatures and OAuth Bearer tokens reach AgentCore transparently.

For SigV4 (AWS SDK), point the SDK to the ALB endpoint URL. The SDK handles signing automatically:
    
    
    import boto3
    
    client = boto3.client(
        "bedrock-agentcore",
        endpoint_url="https://<alb-dns>"
    )
    
    response = client.invoke_agent_runtime(
        agentRuntimeArn="arn:aws:bedrock-agentcore:...",
        payload='{"input": "hello"}'
    )

For OAuth (browser or curl), pass the JWT as a Bearer token:
    
    
    curl -X POST https://<alb-dns>/runtimes/<runtime-arn>/invocations \
      -H "Authorization: Bearer <jwt>" \
      -H "Content-Type: application/json" \
      -d '{"input": "hello"}'

_**Note:** When using the client_credentials grant in Amazon Cognito, the JWT contains a client_id claim but no aud claim. Configure the AgentCore OAuth authorizer with allowedClients (which matches client_id) instead of allowedAudience._

### Pattern 2 trade-offs

**Aspect** | **Impact**  
---|---  
Latency | No Lambda latency overhead, direct passthrough.  
Cost | No additional compute cost.  
Complexity | Minimal components, ALB + VPC Endpoint only.  
Flexibility | No request transformation capability.  
  
## Closing the direct-access backdoor with resource policies

Both patterns require a resource policy to help prevent direct access to AgentCore that bypasses AWS WAF. Without this policy, users with valid credentials can call the AgentCore public endpoint directly, circumventing AWS WAF protections.

Without resource policy (left): direct access bypasses AWS WAF. With resource policy (right): only VPC Endpoint traffic is allowed.

The resource policy uses two statements. The first statement allows InvokeAgentRuntime only when the request originates from your specific VPC Endpoint (aws:SourceVpce condition). The second statement denies InvokeAgentRuntime for requests not originating from that VPC Endpoint, with aws:ViaAWSService set to false to avoid blocking internal AgentCore service calls.

Apply the policy using the put-resource-policy API:

The following is an example resource-policy.json file:
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "AllowVPCEOnly",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "bedrock-agentcore:InvokeAgentRuntime",
          "Resource": "<runtime-arn>",
          "Condition": {
            "StringEquals": {
              "aws:SourceVpce": "<vpce-id>"
            }
          }
        },
        {
          "Sid": "DenyDirectAccess",
          "Effect": "Deny",
          "Principal": "*",
          "Action": "bedrock-agentcore:InvokeAgentRuntime",
          "Resource": "<runtime-arn>",
          "Condition": {
            "StringNotEquals": {
              "aws:SourceVpce": "<vpce-id>"
            },
            "Bool": {
              "aws:ViaAWSService": "false"
            }
          }
        }
      ]
    }
    
    
    aws bedrock-agentcore-control put-resource-policy \
      --resource-arn <runtime-arn> \
      --policy file://resource-policy.json

### Verifying the resource policy

After applying the resource policy, verify that direct access is blocked and AWS WAF-routed access works. The following table shows the expected results:

**Test** | **Expected result**  
---|---  
OAuth through ALB → VPC Endpoint | 200 OK, request flows through WAF and VPC Endpoint  
OAuth direct to AgentCore public endpoint | 403, not authorized to perform bedrock-agentcore:InvokeAgentRuntime  
SigV4 to OAuth-configured runtime | 403, Authorization method mismatch  
No authentication through ALB | 401, Missing Authentication Token  
  
## Defense in depth: Security layers

Both patterns provide multiple layers of security. Each layer addresses a different threat vector, and together they form a defense-in-depth posture for your agent runtime. The following figure and table show how these layers stack from the outermost perimeter (AWS WAF) to the innermost control (VPC Endpoint Policy). A request must pass through every layer before reaching your agent runtime.

Defense-in-depth layers, AWS WAF → ALB Security Group → VPC Endpoint Security Group → AgentCore Authentication → Resource Policy → VPC Endpoint Policy

**Layer** | **Protection** | **Applies to**  
---|---|---  
AWS WAF | Rate limiting, SQL injection, XSS, bot control, geo-blocking | Both patterns  
ALB Security Group | Network-level access control, HTTPS 443 only from allowed sources | Both patterns  
VPC Endpoint Security Group | Restricts inbound to ALB security group only | Both patterns  
AgentCore Authentication | SigV4 or OAuth required on every invocation | Both patterns  
Resource Policy | Denies access not originating from the VPC Endpoint | Both patterns  
VPC Endpoint Policy (optional) | Restricts to specific IAM principals or actions | Both patterns  
  
## Choosing between the patterns

The following table summarizes the key differences to help you choose the right approach.

**Criteria** | **Pattern 1 (Lambda Proxy)** | **Pattern 2 (Direct VPC Endpoint)**  
---|---|---  
Components | WAF + ALB + Lambda + VPC Endpoint | WAF + ALB + VPC Endpoint  
Additional latency | 50–200 ms | No Lambda hop  
Additional cost | Lambda invocations | None  
Request transformation | Yes, full control | No  
Health check approach | Lambda handles health | Path / with matcher 200–499  
Authentication | Lambda forwards token | ALB passes through transparently  
Complexity | Medium | Low  
Start here if… | You need custom logic or multi-auth translation | You want the simplest, lowest-latency option  
  
Before selecting a pattern, review the following considerations that apply to both architectures. These affect how you configure authentication, networking, and endpoint routing.

## Important considerations

**Port 443 only.** The VPC Endpoint exposes only HTTPS 443. Port 8080 (the container’s internal port) is not accessible through the VPC Endpoint. AgentCore routes 443 → 8080 internally.

**Private DNS not required.** The ALB targets VPC Endpoint ENI IPs directly, so Private DNS on the VPC Endpoint is not required for either pattern.

**OAuth blocks SigV4.** When an AgentCore Runtime is configured with an OAuth authorizer, SigV4 requests are rejected with “Authorization method mismatch.” Choose one authentication method per runtime.

**VPC Endpoint service selection.** Use bedrock-agentcore for Runtime data plane. The bedrock-agentcore.gateway endpoint is for AgentCore Gateway only and will not route to your Runtime.

**ENI IP stability.** VPC Endpoint ENI IPs are stable but can change if the endpoint is recreated. Monitor target health and update targets if IPs change.

## Cleanup

If you created resources while following along, delete them to avoid ongoing charges. Remove the resource policy first, then disassociate the AWS WAF WebACL from the ALB. Delete the ALB (listener and target groups first, then the load balancer), the VPC Interface Endpoint, and associated security groups. For Pattern 1, delete the Lambda function. If you created a test AgentCore Runtime or Amazon Cognito User Pool, note that deleting these permanently removes agent configurations and users respectively.

For a detailed cleanup sequence with commands, see the repository [README](<https://github.com/aws-samples/sample-bedrock-agentcore-waf-patterns/blob/main/README.md>).

## Conclusion

You now have two tested architecture patterns for placing AWS WAF in front of Amazon Bedrock AgentCore Runtime. Pattern 2 (direct VPC Endpoint) has fewer components, no Lambda latency overhead, and no extra cost for most use cases. Pattern 1 (Lambda proxy) adds flexibility when you need request transformation or custom authentication logic between the ALB and AgentCore.

Regardless of which pattern you choose, apply a resource policy to close the direct-access backdoor so that traffic flows through AWS WAF. Combined with VPC Endpoint security groups and the built-in authentication in AgentCore, these patterns provide defense in depth for your AI agent deployments.

To learn more, explore the following resources:

  * [GitHub repository](<https://github.com/aws-samples/sample-bedrock-agentcore-waf-patterns/>).
  * [Amazon Bedrock AgentCore documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is.html>).
  * [VPC Interface Endpoints for AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/vpc-interface-endpoints.html>).
  * [Resource-based policies for AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-based-policies.html>).
  * [AWS WAF Developer Guide](<https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html>).
  * [Protecting your gateway with AWS WAF](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-waf.html>)



* * *

## About the authors

### Puneeth Ranjan Komaragiri

Puneeth is a Principal Technical Account Manager at AWS. He is particularly passionate about monitoring and observability, cloud financial management, and generative AI. In his current role, Puneeth collaborates closely with customers, using his expertise to help them design and architect their cloud workloads for optimal scale and resilience.

### Nitin Eusebius

Nitin is a Principal Solutions Architect and Generative AI Tech Lead at AWS. He works with executive and technology leaders on enterprise transformation, cloud strategy, and AI engineering, including the adoption of generative and agentic AI. With over 20 years of experience across enterprise technology, cloud architecture, and large-scale digital platforms, Nitin helps organizations design secure, resilient, and production-ready systems.

### Varshini Nerusu

Varshini is a Senior Technical Account Manager at AWS, specializing in the Retail & Consumer Packaged Goods industry. She works with customers to drive operational excellence, adopt emerging technologies like Generative AI, and build resilient, cost-efficient architectures on AWS. With experience spanning cloud operations, cost optimization, and AI adoption, Varshini helps customers accelerate their cloud transformation and design workloads for scale.
