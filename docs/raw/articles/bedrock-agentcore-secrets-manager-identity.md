---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/reference-your-own-aws-secrets-manager-secrets-in-amazon-bedrock-agentcore-identity/
ingested: 2026-06-02
feed_name: AWS China ML
source_published: 2026-06-01T22:16:28Z
sha256: 59ab9fcf9525ccb30d11b2162928a4cc0e1955d3db620fb2db6f9f07bc28ed70
---


# Reference your own AWS Secrets Manager secrets in Amazon Bedrock AgentCore Identity

AI agents are only as powerful as the tools they can access. Whether retrieving customer data from a CRM, posting updates to Slack, or querying a GitHub repository, agents need to call external APIs, and that means securely passing credentials at runtime. Getting that right, without hardcoding secrets in code or exposing them in agent prompts, is one of the defining challenges of building production-ready agentic systems.

[Amazon Bedrock AgentCore Identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html>) meets this challenge through credential providers and a token vault that automatically create and manage a secret in [AWS Secrets Manager](<https://aws.amazon.com/secrets-manager/>) in your account for each Outbound credential provider resource. This secret contains either the API key or client secret along with the other metadata for the external identity provider. While AgentCore Identity fully creates and manages these secrets, customers couldn’t configure custom tags, rotation policies, or [customer managed AWS Key Management Service (AWS KMS)](<https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#customer-mgn-key>) key encryption at creation time.

Today, we’re excited to announce the ability to reference a secret in AWS Secrets Manager for AgentCore Identity, so you can reference your own preconfigured secret from Secrets Manager and retain full control over how it is managed. With this ability, you can extend your organization’s existing secrets governance processes to AgentCore. You can provide an existing, preconfigured AWS Secrets Manager secret to use with your [credential provider](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/resource-providers.html>) resources. You retain full control over its encryption configuration, rotation, replication, tags, and resource policies, just as you would manage other secrets in Secrets Manager. You can also choose a secret from another AWS account within the same AWS Region, though cross-Region secret sharing isn’t supported. This also supports secrets brought in through AWS Secrets Manager external connectors, enabling integration with third-party secret managers.

In this post, we will review example use cases, and walk through how to get started configuring your credential provider resources with an existing secret.

## Example use cases

The following are example use cases:

  1. **Your agent accesses an external API your team already has a secret for:** Provide the ARN of that existing secret to your credential provider resources instead of having AgentCore Identity create a new one. You can also reference a secret from another AWS account within the same Region, and secrets brought in through AWS Secrets Manager external connectors are supported, enabling integration with third-party secret managers.
  2. **You would like to rotate your secret for security best practices and want your agent to continue working as you rotate:** When you rotate the secret value, AgentCore Identity retrieves the updated value on its next read. You don’t need to update or recreate the credential provider resources.
  3. **You scope secret access to the intended agent use:** Configure the resource policy on your secret directly in AWS Secrets Manager. You control which AWS Identity and Access Management (IAM) principals can access the secret and scope access conditions.
  4. **Your agent operates in a regulated environment where every credential must be encrypted with your customer managed key:** Create the secret with your customer managed encryption key before providing it to AgentCore Identity. This is especially useful if your organization enforces SCPs and RCPs to help verify that all data is encrypted using customer managed CMKs. By referencing an existing secret, your encryption configuration is fully preserved.
  5. **Your organization requires resource tags on secrets for cost allocation, compliance tracking, or governance auditing:** Create and tag the secret according to your standards before providing it to AgentCore Identity.



To learn more about the secret configuration options available, see the [AWS Secrets Manager User Guide](<https://docs.aws.amazon.com/secretsmanager/latest/userguide/managing-secrets.html>).

## Prerequisites

To follow along, you need the following:

  1. An existing AWS Secrets Manager secret with the API key or OAuth client secret.
  2. IAM permissions to give the AgentCore Identity service principal `secretsmanager:GetSecretValue` access to the secret.
  3. If you’re using a customer managed AWS KMS key, `kms:Decrypt` permission on that key for the service principal.
  4. Access to the Amazon Bedrock AgentCore Identity console or AWS Command Line Interface (AWS CLI).



## Getting started

To reference a secret in AWS Secrets Manager, provide the secret ARN and JSON key when creating your credential provider resources through the AgentCore Identity API. AgentCore Identity retrieves the credential value from the specified JSON key in your secret at runtime.

The following sections show how to create a credential provider resource with a referenced secret using the AWS Management Console, the AWS CLI, or an AI agent.

### Using the console

You can configure a referenced secret when creating new credential provider resources directly from the Amazon Bedrock AgentCore Identity console. The feature supports both API key and OAuth client credential types.

_Figure 1: AgentCore Identity console, creating an Outbound Auth resource with a referenced secret._

### A. Add an API key with a referenced secret

To add an API key with a referenced secret, complete the following steps:

  1. Open the [Amazon Bedrock AgentCore console](<https://console.aws.amazon.com/bedrock-agentcore/>).
  2. In the left navigation pane, choose **Identity**.
  3. In the **Outbound Auth** section, choose **Add Outbound Auth**.
  4. Choose **Add API key**.
  5. Enter a **Name** for your Outbound Auth resource.
  6. Under **API key selection method** , choose **Provide API key via Secrets Manager**.
  7. In the **Secrets Manager ARN** field, enter or choose the ARN of your existing secret. The list displays secrets available in your account. For example: `arn:aws:secretsmanager:us-east-1:123456789012:secret:myApiKeySecret-AbCdEf`.
  8. In the **JSON key** field, specify the key within your Secrets Manager secret that contains the API key value.
  9. Choose **Add**.
  10. Verify that the credential provider was created by checking that it appears in the Outbound Auth list.



_Figure 2: AgentCore Identity console, adding an API key from Secrets Manager._

### B. Add an OAuth client secret with a referenced secret

To add an OAuth client secret with a referenced secret, complete the following steps:

  1. From the **Identity** page, choose **Add Outbound Auth**.
  2. Choose **Add OAuth client**.
  3. Enter a **Name** for your OAuth client (for example, `google-oauth-client-v5fz5`).
  4. Under **Provider** , choose your intended included or custom provider.
  5. Enter your **Client ID** as assigned by the identity provider.
  6. Under **Client secret** , choose **Provide Client secret via Secrets Manager**.
  7. In the **Secrets Manager ARN** field, enter the ARN of the secret that contains your OAuth client secret.
  8. In the **JSON key** field, specify the key within the secret that contains the client secret value.
  9. Choose **Add OAuth Client**.
  10. Verify that the credential provider was created by checking that it appears in the Outbound Auth list.



_Figure 3: AgentCore Identity console, adding an OAuth client secret from Secrets Manager._

### Using the AWS CLI

You can configure a referenced secret when creating a new Outbound Auth resource directly for an OAuth client secret from the AWS CLI as shown in the following code:
    
    
    aws bedrock-agentcore-control create-oauth2-credential-provider \
        --name "google-oauth-client-v5fz5" \
        --credential-provider-vendor "GoogleOauth2" \
        --oauth2-provider-config-input '{
            "googleOauth2ProviderConfig": {
                "clientId": "<clientId>",
                "clientSecretSource": "EXTERNAL",
                "clientSecretConfig": {
                    "secretId": "arn:aws:secretsmanager:us-east-1:123456789012:secret:myGoogleKeySecret-AbCdEf",
                    "jsonKey": "key"
                }
            }
        }'

### Using an AI agent on your desktop

If you’re using an AI coding agent (like [Kiro](<https://kiro.dev/>) or similar), you can prompt it to configure a referenced secret directly:

> _“I have an existing secret in AWS Secrets Manager at ARN arn:aws:secretsmanager:us-east-1:123456789012:secret:my-api-key. Create an OAuth2 credential provider in Amazon Bedrock AgentCore Identity named <client-name>, using GoogleOauth2 as the vendor. The client ID is <clientId>, the client secret source is EXTERNAL, and the secret JSON key is key.”_
> 
> Note: Replace <client-name> and <clientId> with your values.

**Important:** Give AgentCore Identity permission to read your secret by adding a resource policy to the secret that allows the service principal to call `secretsmanager:GetSecretValue`. If your secret is encrypted with a customer managed KMS key, also give the service principal `kms:Decrypt` permission on that key.

## Conclusion

With the ability to reference a secret in AWS Secrets Manager, AgentCore Identity gives you the flexibility to use your existing secrets and secret management practices when configuring outbound auth for your AI agents. You can retain full control over how your credentials are encrypted, rotated, and accessed, while AgentCore Identity handles retrieving them at runtime.

To get started, see the [Amazon Bedrock AgentCore Identity documentation](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html>). For more on secret management, see the [AWS Secrets Manager User Guide](<https://docs.aws.amazon.com/secretsmanager/latest/userguide/>).

* * *

## About the authors

### Swara Gandhi

Swara Gandhi is a Senior Solutions Architect on the AWS Identity Solutions team. She works on building secure and scalable end-to-end identity solutions. She is passionate about everything identity, security, and cloud.

### Satveer Khurpa

Satveer Khurpa is a Sr. WW Specialist Solutions Architect, Amazon Bedrock AgentCore at Amazon Web Services, specializing in agentic AI security with a focus on AgentCore Identity and Security. In this role, he uses his expertise in cloud-based architectures to help clients design and deploy secure agentic AI systems across diverse industries. Satveer applies his deep understanding of agentic AI patterns, identity and access management, and defense-in-depth security principles to architect scalable, secure, and responsible agent-based applications, enabling organizations to unlock new business opportunities while maintaining robust security postures for autonomous AI workloads.
