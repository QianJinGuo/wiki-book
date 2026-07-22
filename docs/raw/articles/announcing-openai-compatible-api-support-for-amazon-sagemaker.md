---
title: Announcing OpenAI-compatible API support for Amazon SageMaker AI Endpoints
type: source
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/announcing-openai-compatible-api-support-for-amazon-sagemaker-ai-endpoints
tags: [aws-china-blog, agentic-ai, context-engineering]
url: https://aws.amazon.com/blogs/machine-learning/announcing-openai-compatible-api-support-for-amazon-sagemaker-ai-endpoints
sha256: 0eceb2b55eb6
created: 2026-05-21
updated: 2026-05-21
---



# Announcing OpenAI-compatible API support for Amazon SageMaker AI endpoints

 

Today, Amazon SageMaker AI introduces OpenAI-compatible API support for real-time inference endpoints. If you use the OpenAI SDK, LangChain, or Strands Agents, you can now invoke models on SageMaker AI by changing only your endpoint URL. You don’t need a custom client, a SigV4 wrapper, or code rewrites.

## Overview

With this launch, SageMaker AI endpoints expose an `/openai/v1` path that accepts Chat Completions requests and returns responses as is from the container, including streaming. OpenAI endpoints are turned on for all endpoints and inference components using standard SageMaker AI APIs and SDK.

SageMaker AI routes based on the endpoint name in the URL, so any OpenAI-compatible client works out of the box. You can now create time-limited bearer tokens for your endpoints and use them with your OpenAI clients.

For a working example that includes deployment and invocation, see the accompanying [notebook on GitHub](https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/03-features/openai/sagemaker-inference-openai-api.ipynb).

> “We run AI coding agents that use multiple LLM providers through an LLM gateway (Bifrost) speaking the OpenAI chat completions protocol. The bearer token feature lets us add SageMaker as a drop-in OpenAI-compatible inference endpoint — no custom SigV4 signing — so it works natively with our gateway, Vercel AI SDK, and standard OpenAI clients.” says Giorgio Piatti (AI/ML Engineer – [Caffeine.AI](https://caffeine.ai/))

## Use cases

### Agentic workflows on owned infrastructure

If you build multi-step AI agents with frameworks like Strands Agents or LangChain, you can now run those workflows entirely on your own SageMaker AI endpoints. Your agents call models using the same OpenAI-compatible interface they were built on, but inference runs on dedicated GPU instances in your own account.

### Multi-model hosting with a single interface

If you run multiple models—for example, Llama for general tasks, a fine-tuned Mistral for domain-specific work, and a smaller model for classification—you can host all of them on a single SageMaker AI endpoint using inference components. Each model gets its own resource allocation, and every one is callable through the same OpenAI SDK. You don’t need separate API clients or routing logic in application code.

### Serving fine-tuned models without code changes

If you fine-tune open source models for your specific use case, you can deploy them on SageMaker AI and call them through the same OpenAI-compatible interface that your applications already use. The only change is the endpoint URL. The rest of the application—the SDK calls, the streaming logic, the prompt formatting—stays the same.

## Solution overview

In this post, we walk through the following:

1.  How bearer token authentication works with SageMaker AI endpoints.
2.  Deploying and invoking a single-model endpoint.
3.  Deploying and invoking inference components for multi-model deployments.
4.  Integration with the Strands Agents framework.

### Prerequisites

To follow along with this walkthrough, you must have the following:

*   An AWS account with permissions to create SageMaker AI endpoints.
*   The SageMaker Python SDK (`pip install sagemaker`).
*   The OpenAI Python SDK (`pip install openai`).
*   A model stored in Amazon Simple Storage Service (Amazon S3). For example, Qwen3-4B downloaded from Hugging Face.
*   An AWS Identity and Access Management (IAM) execution role to create the endpoints, with the `AmazonSageMakerFullAccess` policy.
*   An IAM execution role with the `sagemaker:CallWithBearerToken` and `sagemaker:InvokeEndpoint` permissions to invoke the endpoint.

### Authentication with bearer tokens

SageMaker AI OpenAI-compatible endpoints use bearer token authentication. The SageMaker Python SDK includes a token generator that creates time-limited tokens (valid for up to 12 hours) from your existing AWS credentials. No additional secrets or API keys are required.

The token contains your role or user credentials, and it requires the `sagemaker:CallWithBearerToken` and `sagemaker:InvokeEndpoint` action permissions.

### Generate a token

Use the following Python script to generate a token.

```
from sagemaker.core.token_generator import generate_token
from datetime import timedelta

token = generate_token(region="us-west-2", expiry=timedelta(minutes=5))
```

The token generator uses whatever AWS credentials are available in your environment: IAM user credentials, an instance profile on Amazon Elastic Compute Cloud (Amazon EC2), or an AWS IAM Identity Center (SSO) session.

The `generate_token` function generates a time-limited bearer token for authenticating with SageMaker APIs. By default, tokens are valid for 12 hours, though you can override this with the `expiry` parameter using a `timedelta` value anywhere between 1 second and 12 hours. The function accepts a region, an optional `aws_credentials_provider`, and the expiry duration. If no AWS Region is provided, it falls back to the `AWS_REGION` environment variable. If no credentials provider is supplied, it resolves credentials using the default AWS credential chain, which searches multiple sources, including environment variables, `~/.aws/credentials`, `~/.aws/config`, container credentials, and instance profiles. For the full resolution order, see the [Boto3 credentials documentation](https://docs.aws.amazon.com/boto3/latest/guide/configuration.html).

### Auto-refresh tokens for long-running applications

For applications that run continuously, you can implement an auto-refreshing pattern using `httpx` so that a fresh token is generated on each request:

```
import httpx
from sagemaker.core.token_generator import generate_token

class SageMakerAuth(httpx.Auth):
    def __init__(self, region: str):
        self.region = region

    def auth_flow(self, request):
        request.headers["Authorization"] = f"Bearer {generate_token(region=self.region)}"
        yield request

http_client = httpx.Client(auth=SageMakerAuth(region="us-west-2"))
```

### IAM permissions

The IAM role or user invoking the endpoint needs the following permissions:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "sagemaker:InvokeEndpoint",
            "Resource": "arn:aws:sagemaker:<REGION>:<ACCOUNT_ID>:endpoint/<ENDPOINT_NAME>"
        },
        {
            "Effect": "Allow",
            "Action": "sagemaker:CallWithBearerToken",
            "Resource": "*"
        }
    ]
}
```

As a best practice, always restrict the `Resource` to specific endpoint ARNs for `InvokeEndpoint` rather than using a wildcard. The bearer token generated from this role has the same level of access, so a narrowly scoped policy limits the blast radius if a token is inadvertently exposed. Note that `CallWithBearerToken` requires a wildcard (`"*"`) for the `Resource` field. It doesn’t support resource-level restrictions.

### How the token works

The bearer token is a base64-encoded SigV4 pre-signed URL. When you call `generate_token`, the SageMaker AI SDK constructs a request to the SageMaker AI service for the `CallWithBearerToken` action, signs it locally using your AWS credentials, and encodes the resulting signed URL as a portable token string. No network call is made during token generation. The signing happens entirely on the client side. When you present this token to a SageMaker AI endpoint, the service decodes it, validates the SigV4 signature, verifies that the token hasn’t expired, and confirms that the originating IAM identity has the required permissions. The token’s effective lifetime is the lesser of the expiry value and the remaining validity of the AWS credentials used to sign it.

**Security best practice:** The bearer token carries the same authorization as the underlying AWS credentials used to generate it. Treat tokens with the same care as credentials. Scope the IAM role used for token generation to the minimum permissions required, specifically `sagemaker:InvokeEndpoint` and `sagemaker:CallWithBearerToken` on only the endpoint ARNs that the caller needs to access. Don’t generate tokens from roles with expansive permissions, such as those granted by `AdministratorAccess` or `SageMakerFullAccess` managed policies.

Don’t store tokens on disk, in environment variables, in configuration files, in databases, or in distributed caches. Don’t log tokens, and only transmit them over encrypted communication protocols such as HTTPS. Token generation is a local operation with no network overhead, so the recommended practice is to generate a fresh token at the point of use or use the auto-refreshing `httpx.Auth` pattern shown in the preceding example. This avoids the risk of token leakage and helps you use a token with maximum remaining validity. As a best practice, set the token expiry to the shortest duration your workload requires.

### Deploy a single-model endpoint

A single-model endpoint hosts one model and serves requests directly. The following example deploys Qwen3-4B using the SageMaker AI vLLM Deep Learning Container on an `ml.g6.2xlarge` instance.

Note: SageMaker AI endpoints incur charges while in service, regardless of traffic. For more details, see the [Amazon SageMaker AI pricing page](https://aws.amazon.com/sagemaker-ai/pricing/).

```
import boto3
import sagemaker
import time
from sagemaker.core.helper.session_helper import Session
from sagemaker.core.helper.session_helper import get_execution_role

# AWS configuration
REGION = "us-west-2"

# Automatically resolve account ID and default SageMaker execution role
session = Session(boto_session=boto3.Session(region_name=REGION))
ACCOUNT_ID = boto3.client("sts", region_name=REGION).get_caller_identity()["Account"]
EXECUTION_ROLE = get_execution_role(sagemaker_session=session)

# HF Model ID
MODEL_HF_ID = "Qwen/Qwen3-4B"

# SageMaker vLLM Deep Learning Container
VLLM_IMAGE = f"763104351884.dkr.ecr.{REGION}.amazonaws.com/vllm:0.20.2-gpu-py312-cu130-ubuntu22.04-sagemaker"

# Instance type (1x NVIDIA L4 GPU)
INSTANCE_TYPE = "ml.g6.2xlarge"

sagemaker_client = boto3.client("sagemaker", region_name=REGION)

print(f"Region: {REGION}")
print(f"Account ID: {ACCOUNT_ID}")
print(f"Execution role: {EXECUTION_ROLE}")
print(f"Model HF ID: {MODEL_HF_ID}")
```

```
import time

TIMESTAMP = str(int(time.time()))
SME_MODEL_NAME = f"openai-compat-sme-model-{TIMESTAMP}"
SME_ENDPOINT_CONFIG_NAME = f"openai-compat-sme-epc-{TIMESTAMP}"
SME_ENDPOINT_NAME = f"openai-compat-sme-ep-{TIMESTAMP}"

print(f"Timestamp suffix: {TIMESTAMP}")
print(f"Model: {SME_MODEL_NAME}")
print(f"Endpoint config: {SME_ENDPOINT_CONFIG_NAME}")
print(f"Endpoint: {SME_ENDPOINT_NAME}")

sagemaker_client.create_model(
    ModelName=SME_MODEL_NAME,
    ExecutionRoleArn=EXECUTION_ROLE,
    PrimaryContainer={
        "Image": VLLM_IMAGE,
        "Environment": {
            "HF_MODEL_ID": MODEL_HF_ID,
            "SM_VLLM_TENSOR_PARALLEL_SIZE": "1",
            "SM_VLLM_MAX_NUM_SEQS": "4",
            "SM_VLLM_ENABLE_AUTO_TOOL_CHOICE": "true",
            "SM_VLLM_TOOL_CALL_PARSER": "hermes",
            "SAGEMAKER_ENABLE_LOAD_AWARE": "1",
        },
    },
)
print(f"Model created: {SME_MODEL_NAME}")

sagemaker_client.create_endpoint_config(
    EndpointConfigName=SME_ENDPOINT_CONFIG_NAME,
    ProductionVariants=[
        {
            "VariantName": "variant1",
            "ModelName": SME_MODEL_NAME,
            "InstanceType": INSTANCE_TYPE,
            "InitialInstanceCount": 1,
        }
    ],
)
print(f"Endpoint configuration created: {SME_ENDPOINT_CONFIG_NAME}")

sagemaker_client.create_endpoint(
    EndpointName=SME_ENDPOINT_NAME,
    EndpointConfigName=SME_ENDPOINT_CONFIG_NAME,
)
print(f"Endpoint creation initiated: {SME_ENDPOINT_NAME}")

print("Waiting for endpoint to reach InService status (this takes 5-10 minutes)...")
waiter = sagemaker_client.get_waiter("endpoint_in_service")
waiter.wait(
    EndpointName=SME_ENDPOINT_NAME,
    WaiterConfig={"Delay": 30, "MaxAttempts": 40},
)
print(f"Endpoint is InService: {SME_ENDPOINT_NAME}")
```

The endpoint transitions to `InService` status within a few minutes. When ready, it serves both the standard SageMaker AI `/invocations` path and the OpenAI-compatible path at `/openai/v1/chat/completions`.

### Invoke a single-model endpoint

With the endpoint in service, invoke it using the OpenAI Python SDK. The base URL follows this format:

```
https://runtime.sagemaker.<REGION>.amazonaws.com/endpoints/<ENDPOINT_NAME>/openai/v1
```

```
from openai import OpenAI
from sagemaker.core.token_generator import generate_token

REGION = "us-west-2"

sme_base_url = f"https://runtime.sagemaker.{REGION}.amazonaws.com/endpoints/{SME_ENDPOINT_NAME}/openai/v1"

client = OpenAI(
    base_url=sme_base_url,
    api_key=generate_token(region=REGION)
)

print(f"Base URL: {sme_base_url}")

stream = client.chat.completions.create(
    model="",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain how transformers work in machine learning, in three sentences."},
    ],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
print()
```

The `model` field is passed through to the container. Because SageMaker AI routes requests based on the endpoint name in the URL, you can keep this field empty or set it to match the model name your container expects.

### Deploy an inference component endpoint

With inference components, you can host multiple models on a single endpoint, each with dedicated compute resource allocations. With inference components, the model is associated with the component rather than the endpoint configuration:

```
IC_MODEL_NAME = f"openai-compat-ic-model-{TIMESTAMP}"
IC_ENDPOINT_CONFIG_NAME = f"openai-compat-ic-epc-{TIMESTAMP}"
IC_ENDPOINT_NAME = f"openai-compat-ic-ep-{TIMESTAMP}"
IC_NAME = f"openai-compat-ic-qwen3-4b-{TIMESTAMP}"

print(f"Model: {IC_MODEL_NAME}")
print(f"Endpoint config: {IC_ENDPOINT_CONFIG_NAME}")
print(f"Endpoint: {IC_ENDPOINT_NAME}")
print(f"Inference comp: {IC_NAME}")

sagemaker_client.create_model(
    ModelName=IC_MODEL_NAME,
    ExecutionRoleArn=EXECUTION_ROLE,
    PrimaryContainer={
        "Image": VLLM_IMAGE,
        "Environment": {
            "HF_MODEL_ID": MODEL_HF_ID,
            "SM_VLLM_TENSOR_PARALLEL_SIZE": "1",
            "SM_VLLM_MAX_NUM_SEQS": "4",
            "SM_VLLM_ENABLE_AUTO_TOOL_CHOICE": "true",
            "SM_VLLM_TOOL_CALL_PARSER": "hermes",
            "SAGEMAKER_ENABLE_LOAD_AWARE": "1",
        },
    },
)
print(f"Model created: {IC_MODEL_NAME}")

sagemaker_client.create_endpoint_config(
    EndpointConfigName=IC_ENDPOINT_CONFIG_NAME,
    ExecutionRoleArn=EXECUTION_ROLE,
    ProductionVariants=[
        {
            "VariantName": "variant1",
            "InstanceType": INSTANCE_TYPE,
            "InitialInstanceCount": 1,
        }
    ],
)
print(f"Endpoint configuration created: {IC_ENDPOINT_CONFIG_NAME}")

sagemaker_client.create_endpoint(
    EndpointName=IC_ENDPOINT_NAME,
    EndpointConfigName=IC_ENDPOINT_CONFIG_NAME,
)
print(f"Endpoint creation initiated: {IC_ENDPOINT_NAME}")

print("Waiting for endpoint to reach InService status (this takes 5-10 minutes)...")
waiter = sagemaker_client.get_waiter("endpoint_in_service")
waiter.wait(
    EndpointName=IC_ENDPOINT_NAME,
    WaiterConfig={"Delay": 30, "MaxAttempts": 40},
)
print(f"Endpoint is InService: {IC_ENDPOINT_NAME}")

sagemaker_client.create_inference_component(
    InferenceComponentName=IC_NAME,
    EndpointName=IC_ENDPOINT_NAME,
    VariantName="variant1",
    Specification={
        "ModelName": IC_MODEL_NAME,
        "ComputeResourceRequirements": {
            "MinMemoryRequiredInMb": 1024,
            "NumberOfCpuCoresRequired": 2,
            "NumberOfAcceleratorDevicesRequired": 1,
        },
    },
    RuntimeConfig={"CopyCount": 1},
)
print(f"Inference component creation initiated: {IC_NAME}")

print("Waiting for inference component to reach InService status...")
while True:
    desc = sagemaker_client.describe_inference_component(InferenceComponentName=IC_NAME)
    status = desc["InferenceComponentStatus"]
    if status == "InService":
        print(f"Inference component is InService: {IC_NAME}")
        break
    elif status == "Failed":
        raise RuntimeError(f"Inference component failed: {desc.get('FailureReason', 'unknown')}")
    time.sleep(30)
```

You can create additional inference components on the same endpoint to host multiple models with independent scaling and resource allocation.

### Invoke inference components

To invoke a specific inference component, include its name in the URL path:

```
https://runtime.sagemaker.<REGION>.amazonaws.com/endpoints/<ENDPOINT>/inference-components/<IC_NAME>/openai/v1
```

The following example shows two inference components on a shared endpoint, each targeted by a separate OpenAI client that shares a connection pool:

```
import httpx
from openai import OpenAI
from sagemaker.core.token_generator import generate_token

shared_http = httpx.Client()

client_a = OpenAI(
    base_url=(
        f"https://runtime.sagemaker.{REGION}.amazonaws.com"
        f"/endpoints/{IC_ENDPOINT_NAME}/inference-components/{IC_NAME}/openai/v1"
    ),
    api_key=generate_token(region=REGION),
    http_client=shared_http,
)

response = client_a.chat.completions.create(
    model="",
    messages=[{"role": "user", "content": "What is 42 * 3? Reply with the number."}],
)
print(f"Response: {response.choices[0].message.content}")
print(f"Connection pool active: shared_http is reusable across multiple IC clients")
```

The shared `httpx.Client` allows both OpenAI client instances to reuse the same TLS sessions and connection pool.

### Integrate with Strands Agents

Strands Agents is an open source SDK for building AI agents. Because Strands Agents supports OpenAI-compatible model providers, you can now run multi-agent workflows entirely on your own SageMaker AI infrastructure. This gives you the flexibility of agentic applications with the control of dedicated endpoints. Your data never leaves your account, and you choose exactly which model version your agents run.

```
from openai import AsyncOpenAI
from strands import Agent, tool
from strands.models.openai import OpenAIModel
from sagemaker.core.token_generator import generate_token

@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return str(eval(expression))

strands_client = AsyncOpenAI(
    base_url=f"https://runtime.sagemaker.{REGION}.amazonaws.com/endpoints/{SME_ENDPOINT_NAME}/openai/v1",
    api_key=generate_token(region=REGION),
)

model = OpenAIModel(client=strands_client, model_id="", params={"temperature": 0.7})

coder = Agent(
    model=model,
    system_prompt=(
        "You are an expert Python developer. Write clean, well-documented "
        "Python code with type hints. Output ONLY the code, no explanation."
    ),
    tools=[calculator],
)

reviewer = Agent(
    model=model,
    system_prompt=(
        "You are a senior code reviewer. Review Python code for correctness, "
        "performance, and PEP 8 style. Give a concise review with specific suggestions."
    ),
    tools=[calculator],
)
```

## Clean up

To avoid ongoing charges, delete your endpoints and associated resources when you’re done. SageMaker AI endpoints incur costs while in service, regardless of whether they are receiving traffic.

```
import boto3
sagemaker_client = boto3.client("sagemaker", region_name="us-west-2")

sagemaker_client.delete_inference_component(InferenceComponentName="<IC_NAME>")
sagemaker_client.delete_endpoint(EndpointName="<ENDPOINT_NAME>")
sagemaker_client.delete_endpoint_config(EndpointConfigName="<ENDPOINT_CONFIG_NAME>")
sagemaker_client.delete_model(ModelName="<MODEL_NAME>")
```

## Conclusion

With OpenAI-compatible API support, Amazon SageMaker AI removes the integration barrier between where most AI applications are today and the infrastructure they need to scale. You can keep your existing code, use any OpenAI-compatible framework, and run inference on dedicated endpoints with the GPU, scaling, and data residency controls you need. To get started, deploy a model on a SageMaker AI real-time endpoint using a [supported container](https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints-openai-compatible.html#realtime-endpoints-openai-compatible-containers), install the [SageMaker Python SDK](https://sagemaker.readthedocs.io/), and point your OpenAI client at the endpoint URL. To learn more, see [Use SageMaker AI with OpenAI-compatible APIs](https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints-openai-compatible.html) in the _Amazon SageMaker AI Developer Guide_, or open the [Amazon SageMaker AI console](https://console.aws.amazon.com/sagemaker/) to create your first endpoint.

* * *

## About the authors
