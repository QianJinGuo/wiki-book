---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/run-minimax-models-on-amazon-bedrock
feed_name: AWS China ML
ingested: 2026-07-10
sha256: 18e3197c0bc0cfed71965643ec6a0891f3eb739f55de959ed17a0afea8793d11
source_published: 2026-07-06
---

# Run MiniMax models on Amazon Bedrock

Organizations are increasingly adopting open-weight foundation models (FMs) to power production AI workloads, from agentic coding assistants to long-context document analysis. As these workloads move from experimentation to enterprise deployment, two requirements shape every model selection decision: the model must deliver the capabilities the workload demands, and the inference environment must support the organization’s security and compliance requirements. Customers are looking for ways to access frontier third-party models without compromising on data protection, regulatory alignment, or operational control.

To address this need, Amazon Bedrock offers a fully managed service for accessing leading FMs from independent model providers, with inference running entirely on AWS-operated infrastructure. Your prompts and completions are not used to train any models, and your content is not shared with the model providers.

The [MiniMax](<https://minimax.io>) family is available on Amazon Bedrock, giving you three open-weight models to match different production workloads. The family is purpose-built for software engineering and agentic use cases. The newest model on Amazon Bedrock, [MiniMax M2.5](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-minimax-minimax-m2-5.html>), is trained specifically for agent-native execution. The following sections cover what each model offers and how to choose between them.

In this post, we walk through how to get started with MiniMax models on Amazon Bedrock, including the capabilities supported by these models, the service tiers available, how on-demand inference scales to handle your workloads, and the different APIs you can use to access them. Using these models, customers can build agentic applications, long-context document analysis pipelines, and software engineering workflows, all backed by the security and operational guarantees of AWS.

## About MiniMax

[MiniMax](<https://minimax.io/>) is a global AI technology company that develops multimodal foundation models with a research emphasis on efficient architectures for production-scale workloads. Its M2 family of large language models is available on Amazon Bedrock as fully managed open-weight models, built around a mixture-of-experts (MoE) architecture where only a small fraction of total parameters activate per token, delivering the knowledge capacity of a much larger dense model at a fraction of the inference cost.

The M2 family delivers strong performance on coding and agentic workloads, with M2.5 purpose-built for agent-native execution through training that emphasizes tool-calling, multi-step task decomposition, and long-horizon coding tasks. Because the models are open-weight, you can independently evaluate the model architecture and training methodology, run your own benchmarks on representative workloads, and fine-tune on proprietary data when customization is required. You can do all of this through a fully managed AWS service, without provisioning infrastructure, hosting model weights, or operating inference stacks.

For the full model catalog, see the [MiniMax models on Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-minimax.html>).

## MiniMax models on Amazon Bedrock

Amazon Bedrock supports three models from the MiniMax M2 family. MiniMax M2 (`minimax.minimax-m2`) was the first to launch, establishing the core capabilities of the series with strong multilingual text generation, solid reasoning and coding performance, and a 1 million token context window. MiniMax M2.1 (`minimax.minimax-m2.1`) followed, adding targeted improvements to reasoning depth, coding accuracy, and instruction following. MiniMax M2.5 (`minimax.minimax-m2.5`) is the newest model available on Amazon Bedrock and is trained specifically for agent-native execution. Amazon Bedrock continues to expand its catalog of MiniMax models as new versions become available. For the latest list, refer to the [Amazon Bedrock model documentation for MiniMax](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-minimax.html>). The following table summarizes the key differences.

| **MiniMax M2** | **MiniMax M2.1** | **MiniMax M2.5**  
---|---|---|---  
**Model ID** | `minimax.minimax-m2` | `minimax.minimax-m2.1` | `minimax.minimax-m2.5`  
**Context window** | 1M tokens | 196K tokens | 196K tokens  
**Max output tokens** | 8K | 8K | 8K  
**Training focus** | Multilingual, reasoning, coding | Improved reasoning, coding, instruction following | Agent-native, reinforcement learning (RL) on agentic scaffolds  
**Service tiers** | Standard, Priority, Flex | Standard, Priority, Flex | Standard, Priority, Flex  
**Best for** | Long-context or multilingual, general-purpose | Complex instruction-following or multi-step reasoning | Agentic, tool-calling, or coding-heavy  
  
MiniMax M2.5 uses a [mixture-of-experts](<https://huggingface.co/MiniMaxAI/MiniMax-M2>) (MoE) architecture with 230 billion total parameters and 10 billion active per token. For inference cost, the MoE routing mechanism is the key factor. It provides the knowledge capacity of a 230B model while consuming compute proportional to only 10B active parameters per forward pass.

## Two endpoints for accessing MiniMax models on Amazon Bedrock

Amazon Bedrock provides two endpoints for invoking MiniMax models: `bedrock-mantle` and `bedrock-runtime`.

The Amazon `bedrock-mantle` endpoint (`https://bedrock-mantle.{region}.api.aws/v1`) is the public API for Amazon Bedrock’s next-generation inference engine. It uses the Chat Completions API, the same interface as the OpenAI Python and TypeScript SDKs, so teams already on that SDK can switch to MiniMax models on Amazon Bedrock by updating the base URL and model ID. It supports Amazon Bedrock API keys, projects, and client-side tool calling. For most workloads, we recommend the `bedrock-mantle` endpoint.

The `bedrock-runtime` endpoint (`https://bedrock-runtime.{region}.amazonaws.com`) uses the Converse and InvokeModel APIs via the AWS SDK. Use this endpoint for native Amazon Bedrock features such as Guardrails, Agents, Flows, and model evaluation, which are currently available through `bedrock-runtime`.

In the following sections, we demonstrate both endpoints, starting with the recommended `bedrock-mantle` endpoint and the Chat Completions API.

## Getting started with MiniMax M2.5 in Amazon Bedrock

Complete the following steps to start using MiniMax M2.5 in Amazon Bedrock.

### Console playground

  1. Navigate to the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>) and select **Chat/Text playground** from the left menu under the **Test** section.
  2. Choose **Select model** in the center of the playground.
  3. Choose **MiniMax** from the category list, then select **MiniMax M2.5**.
  4. Choose **Apply** to load the model.
  5. Confirm that the model loaded. The model name appears in the playground header and the chat interface is ready for input.



To demonstrate M2.5’s reasoning and code generation capabilities, try the following prompt in the playground:

_“Design a Python microservice that exposes a REST API for managing a task queue. Include error handling, input validation, and write unit tests. Explain your design decisions.”_

### Using the bedrock-mantle endpoint (recommended)

#### Prerequisites

For the `bedrock-mantle` endpoint, you need an [Amazon Bedrock API key](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>) or AWS credentials configured for SigV4. To provide access to the `bedrock-mantle` endpoint, use the following minimum policy:
    
    
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "BedrockMantleInference",
                "Effect": "Allow",
                "Action": [
                    "bedrock-mantle:CreateInference",
                    "bedrock-mantle:Get*",
                    "bedrock-mantle:List*"
                ],
                "Resource": "arn:aws:bedrock-mantle:us-east-1:111122223333:project/*"
            },
            {
                "Sid": "BedrockMantleApiKeyAccess",
                "Effect": "Allow",
                "Action": "bedrock-mantle:CallWithBearerToken",
                "Resource": "*"
            }
        ]
    }

Replace 111122223333 with your AWS account ID, and scope the AWS Region to the Regions that you use. The first statement covers SigV4 authentication. The second covers Amazon Bedrock API key (bearer token) authentication. If you only use SigV4, you can omit the second statement. To control which identities can generate or use Amazon Bedrock API keys, see [Control permissions for generating and using Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-permissions.html>). To restrict your organization to approved models only, use a [service control policy (SCP)](<https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>).

The following example uses the [OpenAI Python SDK](<https://github.com/openai/openai-python>) as a client library to call the `bedrock-mantle` endpoint. When using the OpenAI SDK, you need an [Amazon Bedrock API key.](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>) For production workloads, use short-term API keys, which expire automatically (maximum 12 hours) and inherit the permissions of the AWS Identity and Access Management (IAM) role that generated them. If you’re already using AWS credentials and don’t have an API key, the [aws-bedrock-token-generator](<https://pypi.org/project/aws-bedrock-token-generator/>) package generates a short-term bearer token from those credentials.

**Note:** The code examples in this post invoke MiniMax M2.5, and each model invocation incurs per-token charges. See the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>) for current rates.
    
    
    import boto3
    from openai import OpenAI
    
    # Retrieve the Amazon Bedrock API key from AWS Secrets Manager
    secrets_client = boto3.client("secretsmanager", region_name="us-east-1")
    api_key = secrets_client.get_secret_value(SecretId="bedrock-api-key")["SecretString"]
    
    client = OpenAI(
        base_url="https://bedrock-mantle.us-east-1.api.aws/v1",
        api_key=api_key,
    )
    
    response = client.chat.completions.create(
        model="minimax.minimax-m2.5",
        messages=[
            {"role": "user", "content": "Explain the benefits of mixture-of-experts architectures for production inference."}
        ],
        max_tokens=512,
    )
    
    print(response.choices[0].message.content)

**Note:** These examples retrieve the Amazon Bedrock API key from [AWS Secrets Manager](<https://docs.aws.amazon.com/secretsmanager/>). For local development, you can instead read the key from an environment variable, but avoid that pattern in production. Use AWS Secrets Manager or another secrets store.

#### Tool calling

MiniMax M2.5 is designed for agentic workflows, making it well-suited for tool-calling scenarios. In a tool-calling workflow, you define functions (tools) that the model can invoke, the model decides when to call them based on the user’s request, and your application runs the function and returns the result for the model to incorporate into its final response.

The following example demonstrates this pattern end to end. We define a `get_weather` tool, send a user message, let the model request the tool call, run the function with mock data, and pass the result back so the model can generate a natural-language answer.
    
    
    import json
    import boto3
    from openai import OpenAI
    
    # Retrieve the Amazon Bedrock API key from AWS Secrets Manager
    secrets_client = boto3.client("secretsmanager", region_name="us-east-1")
    api_key = secrets_client.get_secret_value(SecretId="bedrock-api-key")["SecretString"]
    
    client = OpenAI(
        base_url="https://bedrock-mantle.us-east-1.api.aws/v1",
        api_key=api_key,
    )
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City and country (e.g., Seattle, US)"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "Temperature unit"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
    
    # Step 1: Send the user request with tool definitions
    messages = [
        {"role": "user", "content": "What's the weather like in Seattle?"}
    ]
    
    response = client.chat.completions.create(
        model="minimax.minimax-m2.5",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    
    assistant_message = response.choices[0].message
    
    # Step 2: Check if the model wants to call a tool
    if assistant_message.tool_calls:
        messages.append(assistant_message)
    
        for tool_call in assistant_message.tool_calls:
            function_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
    
            # Step 3: Validate function name and run
            if function_name == "get_weather":
                location = arguments.get("location", "Unknown")
                unit = arguments.get("unit", "fahrenheit")
                result = {
                    "location": location,
                    "temperature": 18 if unit == "celsius" else 64,
                    "unit": unit,
                    "condition": "Partly cloudy",
                    "humidity": 72,
                }
            else:
                result = {"error": f"Unknown function: {function_name}"}
    
            # Step 4: Return the function result to the model
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result),
            })
    
        # Step 5: Get the final response incorporating tool results
        final_response = client.chat.completions.create(
            model="minimax.minimax-m2.5",
            messages=messages,
            tools=tools,
        )
    
        print(final_response.choices[0].message.content)
    else:
        print(assistant_message.content)

### Using the bedrock-runtime endpoint (boto3)

#### Prerequisites

For the `bedrock-runtime` endpoint, you need AWS credentials configured (IAM user or role) with permission to invoke the model. Use the following minimum policy:
    
    
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "bedrock:InvokeModel",
                    "bedrock:InvokeModelWithResponseStream"
                ],
                "Resource": "arn:aws:bedrock:us-east-1::foundation-model/minimax.minimax-m2.5"
            }
        ]
    }

For production deployments, scope the Resource to the specific Regions you use. To restrict your organization to approved models only, use a [service control policy (SCP)](<https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html>).

The following example sends a single-turn request to MiniMax M2.5 using the [AWS SDK for Python (Boto3)](<https://boto3.amazonaws.com/v1/documentation/api/latest/index.html>) with the Converse API and prints the model’s response:
    
    
    import boto3
    
    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    
    response = client.converse(
        modelId="minimax.minimax-m2.5",
        messages=[{
            "role": "user",
            "content": [{"text": "What is mixture of experts?"}]
        }],
        inferenceConfig={"maxTokens": 2048, "temperature": 1.0, "topP": 0.95},
    )
    
    content_blocks = response["output"]["message"]["content"]
    response_text = next(
        (block["text"] for block in content_blocks if "text" in block),
        None
    )
    
    if response_text:
        print(response_text)
    else:
        print("No text response.")

**Note:** On the Converse API, MiniMax M2.5 returns a `reasoningContent` block before the `text` block. The code iterates through the content blocks to extract the final text response.

### Using the AWS CLI

You can also access MiniMax M2.5 from your terminal using the [AWS Command Line Interface (AWS CLI)](<https://aws.amazon.com/cli/>):
    
    
    aws bedrock-runtime converse \
      --model-id minimax.minimax-m2.5 \
      --messages '[{"role":"user","content":[{"text":"Type_Your_Prompt_Here"}]}]' \
      --inference-config '{"maxTokens":2048}' \
      --region us-east-1

## Service tiers

Amazon Bedrock offers multiple [service tiers](<https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html>) to match different workload requirements:

**Tier** | **Best for** | **Characteristics** | **MiniMax M2.5 support**  
---|---|---|---  
**Priority** | Mission-critical, customer-facing workflows that need the fastest response times | Up to 25% better output tokens per second (OTPS) latency compared to Standard. Prioritized ahead of Standard and Flex requests. Premium over standard on-demand pricing. No upfront reservation or commitment. | Yes  
**Standard** | Everyday AI tasks such as content generation, text analysis, and routine document processing | Consistent performance at standard on-demand pricing. Default tier when no tier is specified. No commitment. | Yes  
**Flex** | Workloads that can tolerate longer processing times, such as model evaluations, content summarization, and agentic workflows | Discounted pricing relative to Standard. Higher latency, especially during peak traffic, since Flex requests are processed after Standard. No commitment. | Yes  
  
**Note:** The Reserved tier isn’t currently available for MiniMax models. For updates on Reserved tier availability, contact your AWS account team.

## Scaling on-demand inference

When you invoke MiniMax models on Amazon Bedrock, requests use on-demand inference (Standard tier) by default, where you pay per token without reserving capacity. On-demand throughput is shared and allocated per AWS Region, so during periods of high regional demand a request may be briefly queued or throttled. Designing for this is important for applications that need to scale reliably in production.

On the `bedrock-mantle` endpoint, there is no requests-per-minute (RPM) quota. Throughput is governed by token-based limits rather than request counts. MiniMax models don’t currently have per-account token quotas published in the Service Quotas console, so their throughput is managed by the endpoint’s internal scheduling and capacity. Use retry logic with exponential backoff to handle transient throttling. Cached input tokens read through prompt caching don’t count against the input-token quota. For details, see [Quotas for the bedrock-mantle endpoint](<https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html>).

**Error** | **What it means** | **What to do**  
---|---|---  
HTTP 429 | A token-per-minute quota for the model has been exceeded. | Reduce the submission rate and retry with exponential backoff. Request a quota increase through AWS Support if you consistently hit the limit.  
HTTP 503 | Regional capacity for the model is under pressure. | Retry with exponential backoff for transient errors. Reduce the submission rate for sustained errors.  
  
The two errors call for different responses. For a 429, reduce your submission rate or request a quota increase through AWS Support. For a 503, retry transient errors and ramp gradually, as described in the following section.

**Handle one-off 503 responses.** Some on-demand inference requests may see occasional 503 responses when the model is in high demand, and the recommended way to handle them is exponential backoff with jitter and a bounded retry count. The AWS SDK and most popular HTTP clients support this through standard retry configuration. The following example uses Boto3:
    
    
    import boto3
    from botocore.config import Config
    
    config = Config(retries={"total_max_attempts": 6, "mode": "standard"})
    client = boto3.client("bedrock-runtime", config=config)

If 503 responses become sustained, retries alone won’t resolve the issue because the effective request rate is exceeding available capacity for the model. In that case, consider routing latency-sensitive traffic to the Priority tier, which receives preferential processing ahead of Standard and Flex requests during periods of high demand.

**Handle steep traffic ramps.** When using Standard tier on-demand inference, your application’s incoming traffic should align with how the model’s regional capacity scales. Sudden, large jumps in request rate are more likely to trigger 503s than gradual increases that the system can accommodate. Whenever you increase the request rate against MiniMax models, scale up in measured increments rather than stepping straight to a new target volume. The recommended ramp procedure is:

  1. Start at your target request rate.
  2. If you receive 503 responses, reduce the rate by 50 percent, and continue reducing until requests are succeeding consistently.
  3. Hold at that steady state for 15 minutes.
  4. Increase the rate by 50 percent and hold for another 15 minutes.
  5. Repeat until you reach your target volume.



As a worked example, if your target is 2,000 requests per minute and you encounter 503s, you would reduce to 1,000, then to 500 if errors persist. After 500 is steady for 15 minutes, you scale to 750, then 1,125, and so on. The 15-minute hold is the part most teams skip, and it’s the part that matters most. Without it, every step up is essentially a fresh load test.

**Choose the Priority tier for latency-sensitive workloads.** Beyond reactive use during sustained 503s, the Priority tier can be a useful lever to reduce occurrences of 503 while continuing to use on-demand inference. Priority delivers up to 25 percent better output tokens per second compared to Standard, and there is no upfront reservation or commitment. Applications opt in by setting the `service_tier` parameter to `priority` on each invocation, and tiers can be mixed within the same application. Customer-facing prompts, real-time agents, and other user interactions where response time directly affects experience are good candidates for Priority. For background and batch-style work, Standard or Flex is typically the right choice and avoids paying the Priority premium on requests that wouldn’t benefit from it.

**Additional best practices for production scale.** A handful of additional practices help keep inference workloads running smoothly at scale. Spreading large workloads across multiple minutes, rather than firing them in tight bursts, reduces pressure on Regional capacity. When migrating production traffic to a new MiniMax model version, you can use feature flags to ramp the percentage of traffic gradually instead of cutting over all at once. Asynchronous work, such as model evaluations, content summarization, and agentic backfills, can be routed to the Flex tier, which is designed for cost-effective processing of latency-tolerant workloads. For workloads without data residency requirements, distributing across multiple Regions improves resilience during regional demand spikes. For workloads expected to grow, planning headroom for two to three times the expected peak provides a buffer for traffic surges.

For complete guidance, see [Scaling and throughput best practices](<https://docs.aws.amazon.com/bedrock/latest/userguide/scaling-throughput-best-practices.html>) in the Amazon Bedrock User Guide.

## Reducing latency with implicit prompt caching

MiniMax models on Amazon Bedrock support implicit prompt caching. When consecutive requests share a common prompt prefix, this might result in a cache hit, allowing the model to reuse the cached internal state instead of recomputing it. Cache hits reduce inference latency on the matching tokens, with no changes to your code and no cache markers required.

Implicit prompt caching is available across all on-demand service tiers (Standard, Priority, and Flex), so applications can take advantage of it regardless of how their traffic is routed. Cache hits are not guaranteed on every request, but they are common in workloads with stable prefixes. Examples include multi-turn agents, retrieval-augmented generation pipelines, and long-context analysis workflows where system prompts, tool definitions, or source documents are reused across requests. To maximize cache hit rates, place static content (system prompts, tool definitions, reference documents) at the beginning of the prompt and dynamic content (user messages, variable context) at the end.

## Clean up

On-demand inference incurs charges only when you invoke a model, so there is no infrastructure to tear down. To avoid unintended charges, consider the following:

  * If you generated short-term Amazon Bedrock API keys for testing, they expire automatically within 12 hours. To revoke one sooner, delete the API key in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>). Deleting a key immediately revokes access for any application using it, so confirm no active applications depend on it first.
  * If you opted in to the Priority tier for testing, remove the `service_tier` parameter from your requests to return to Standard pricing for traffic that isn’t latency-sensitive.



## Pricing and availability

MiniMax M2.5 is available in 14 AWS Regions: US East (N. Virginia), US East (Ohio), US West (Oregon), Europe (Frankfurt), Europe (Stockholm), Europe (Milan), Europe (Ireland), Europe (London), Asia Pacific (Tokyo), Asia Pacific (Mumbai), Asia Pacific (Sydney), Asia Pacific (Jakarta), Asia Pacific (Melbourne), and South America (São Paulo). Requests are served in the Region you call. Cross-Region inference (Geo and Global) is not currently available for MiniMax models. For the latest list, see the [supported Regions page](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html>).

Pricing is per token and varies by model and service tier. For current rates, see [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>).

## Conclusion

In this post, we walked through how to get started with MiniMax M2 family models on Amazon Bedrock. We explored the two inference endpoints, `bedrock-mantle` and `bedrock-runtime`, demonstrated tool calling with the Chat Completions API, covered service tier options for matching workload requirements, and discussed scaling strategies including implicit prompt caching for latency reduction.

To get started:

  * Open the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>) and try MiniMax M2.5 in the Chat/Text playground.
  * Run the `bedrock-mantle` Python sample from this post against your own data.
  * Evaluate MiniMax M2, M2.1, and M2.5 on your workloads to choose the model that fits your cost and latency profile.
  * For production deployment, review the [Scaling and throughput best practices](<https://docs.aws.amazon.com/bedrock/latest/userguide/scaling-throughput-best-practices.html>) and consider the Priority tier for latency-sensitive traffic.



## Resources

For more information, refer to the following resources:

  * [Amazon Bedrock User Guide](<https://docs.aws.amazon.com/bedrock/latest/userguide/>)
  * [MiniMax models on Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-minimax.html>)
  * [MiniMax M2.5 model card](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-minimax-minimax-m2-5.html>)
  * [MiniMax M2.1 model card](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-minimax-minimax-m2-1.html>)
  * [MiniMax M2 model card](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-minimax-minimax-m2.html>)
  * [Amazon Bedrock endpoints](<https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html>)
  * [Quotas for the bedrock-mantle endpoint](<https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html>)
  * [Scaling and throughput best practices](<https://docs.aws.amazon.com/bedrock/latest/userguide/scaling-throughput-best-practices.html>)
  * [Amazon Bedrock service tiers](<https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html>)
  * [Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>)
  * [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>)



* * *

## About the authors

### Zohreh Norouzi

Zohreh is a Security Solutions Architect at Amazon Web Services. She helps customers make good security choices and accelerate their journey to the AWS Cloud. She has been actively involved in AI security initiatives across APJ, using her expertise to help customers build secure AI solutions at scale.

### Saurabh Trikande

Saurabh is a Senior Product Manager for Amazon Bedrock and Amazon SageMaker Inference. He is passionate about working with customers and partners, motivated by the goal of democratizing AI. He focuses on core challenges related to deploying complex AI applications, inference with multi-tenant models, cost optimizations, and making the deployment of generative AI models more accessible. In his spare time, Saurabh enjoys hiking and exploring new cuisines.

### Aris Tsakpinis

Aris is a Senior Specialist Solutions Architect for Generative AI focusing on open-weight models on Amazon Bedrock and the broader generative AI open-source ecosystem. Alongside his professional role, he is pursuing a PhD in Machine Learning Engineering at the University of Regensburg, where his research focuses on applied natural language processing in scientific domains.

### Pradyun Ramadorai

Pradyun is a Principal Engineer at Amazon Bedrock. He focuses on core challenges related to Generative AI applications, scalable LLM inference and optimizations.
