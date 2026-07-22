---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-gemma-4-models-on-amazon-bedrock
ingested: 2026-06-17
feed_name: AWS China ML
source_published: 2026-06-15
sha256: 14734787f8c387242b90a5870d2fc1edcabb127dd8f0ae102d7134591ff91be8
---

# Introducing Gemma 4 models on Amazon Bedrock

Today, we are announcing the availability of the Gemma 4 family on Amazon Bedrock. Built by Google DeepMind and released under the Apache 2.0 license, Gemma 4 is a family of open-weight models designed with a focus on intelligence-per-parameter across a broad range of deployment scenarios. The family includes three instruction-tuned variants: Gemma 4 31B, Gemma 4 26B-A4B, and Gemma 4 E2B. These cover dense and mixture-of-experts (MoE) architectures, where only a fraction of the model’s parameters activate per request. The variants offer built-in reasoning, native function calling, and multimodal input across text and image.

Independent benchmarks reflect Gemma 4’s intelligence-per-parameter focus: [Artificial Analysis](<https://artificialanalysis.ai/models/gemma-4-31b>) reports an Intelligence Index of 39 for Gemma 4 31B, well above the median of 15 in the 4B–40B open-weights class.

Organizations adopting open-weight foundation models (FMs) for production face a constant trade-off: access the leading models, but without compromising on data protection, regulatory alignment, or operational control. Amazon Bedrock removes that trade-off. It gives you leading open-weight FMs through a fully managed service, with inference running entirely on infrastructure operated by AWS and the security and privacy controls you expect from Amazon Bedrock.

In this post, we walk through how to get started with Gemma 4 models on Amazon Bedrock. We cover the capabilities supported by these models, the service tiers available, how on-demand inference scales to handle your workloads, and the different APIs you can use to access them. With these models, you can build multimodal agents, lightweight applications, document understanding pipelines, and software engineering workflows on Amazon Bedrock. Your prompts and completions are not used to train any models, and your content is not shared with third parties.

## Key capabilities of Gemma 4

The Gemma 4 family on Amazon Bedrock spans a 2.3B-effective-parameter compact model up to a 30.7B-parameter dense model, giving you a choice of variants to match different cost and latency profiles. All variants support a built-in reasoning mode, native function calling for agentic workflows, multimodal input that combines text and image, and out-of-the-box support for over 35 languages with pre-training across 140+. Because the models are open-weight, you can independently evaluate the model architecture and training methodology, benchmark on your own workloads, and fine-tune on proprietary data when customization is required. You can access the models through a fully managed AWS service without provisioning infrastructure, hosting model weights, or operating inference stacks yourself.anno

For the latest list of supported models, refer to the [Amazon Bedrock model catalog](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html>).

### The Gemma 4 family on Amazon Bedrock at a glance

The family includes three instruction-tuned variants optimized for different cost and latency profiles. The following table summarizes the key specifications for each model on Amazon Bedrock:

 

| **Gemma 4 31B** | **Gemma 4 26B-A4B** | **Gemma 4 E2B**  
---|---|---|---  
Model ID | `google.gemma-4-31b` | `google.gemma-4-26b-a4b` | `google.gemma-4-e2b`  
Architecture | Dense | Mixture-of-Experts | Dense (PLE)  
Total / Active parameters | 30.7B | 25.2B / 3.8B active | 5.1B total / 2.3B effective  
Context window | 256K tokens | 256K tokens | 128K tokens  
Modalities | Text, image | Text, image | Text, image  
Reasoning mode | Yes | Yes | Yes  
Function calling | Native | Native | Native  
Service tiers | Standard, Priority, Flex | Standard, Priority, Flex | Standard, Priority, Flex  
  
### Choosing a variant

Select the variant that best matches your workload’s performance and cost requirements. The following table provides guidance on which model to choose based on your use case:

**If your workload is…** | **Choose** | **Why**  
---|---|---  
Reasoning-heavy or coding-heavy with a single dense model | **Gemma 4 31B** | Largest dense variant in the family; strong reasoning and coding performance with a 256K context window.  
Cost-sensitive at high throughput, with knowledge breadth requirements | **Gemma 4 26B-A4B** | MoE design means inference cost and latency closer to a 4B dense model while retaining the knowledge capacity of a much larger one.  
Latency-sensitive, on-device-style, or multimodal classification | **Gemma 4 E2B** | Smallest, fastest variant; suited for lowest-cost or fastest-response multimodal workloads. Set `reasoning_effort=high` for this variant (see _Enable reasoning mode_).  
  
Across the family, Gemma 4 models share a common interface: system prompts, structured tool calling, image input, and a thinking mode that can be toggled per request. You can develop an application against the API surface once and switch between variants based on the cost and latency profile that fits the workload.

### Architecture highlights

All Gemma 4 variants use a hybrid attention design that interleaves local and global attention, supporting long contexts up to 256K tokens on 31B and 26B-A4B while keeping a small memory footprint. The 26B-A4B variant is a mixture-of-experts model: 25.2B total parameters but only 3.8B active per token, giving roughly 4B-class cost and latency with the knowledge capacity of a larger model. The E2B variant uses Per-Layer Embeddings (PLE) to keep its effective parameter count (2.3B of 5.1B total) small, lowering memory and compute cost. For architecture details, refer to the [Gemma 4 model card](<https://ai.google.dev/gemma/docs/core/model_card_4>).

> **Note:** Use the `bedrock-mantle` endpoint for Gemma 4 models.

### Reasoning mode

Gemma 4 includes a built-in reasoning mode. When enabled, the model emits its internal thought process before producing the final answer. On the `bedrock-mantle` endpoint, you enable reasoning through the Responses API `reasoning` parameter, and the thought process is returned as a separate reasoning item alongside the final answer (see _Enable reasoning mode_ in the walkthrough).

In multi-turn conversations, send back only the final answers from previous turns, not their reasoning items. Replaying prior reasoning back to the model can degrade its responses. You can still keep the reasoning in your own logs or audit trail. Strip it from the history you send on the next turn.

## Accessing Gemma 4 models on Amazon Bedrock

You access Gemma 4 models on Amazon Bedrock through the `bedrock-mantle` endpoint, the OpenAI-compatible API purpose-built for the next-generation inference engine for Amazon Bedrock. Its endpoint URL is `https://bedrock-mantle.{region}.api.aws/openai/v1`, and it exposes the Chat Completions and Responses APIs.

It’s helpful to keep the endpoint and the engine distinct: the _engine_ is the underlying serving infrastructure—designed with Model Deployment Account isolation and zero operator access—and the _endpoint_ is the HTTPS API surface you call. The `bedrock-mantle` endpoint is the public API for that next-generation inference engine and exposes its full feature set. For a deeper look at the underlying inference engine, refer to [Exploring the zero operator access design of Amazon Bedrock’s next-generation inference engine](<https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/>).

The `bedrock-mantle` endpoint uses the same interface as the OpenAI Python and TypeScript SDKs, so teams already on those SDKs can switch to Gemma 4 models on Amazon Bedrock by updating only the base URL and model ID. It also supports Amazon Bedrock API keys, projects, and client-side tool calling.

## Get started with Gemma 4 family models on Amazon Bedrock

Complete the following steps to start using Gemma 4 on Amazon Bedrock.

### Prerequisites

To use Gemma 4 models, you need an AWS account with permissions to run inference on the `bedrock-mantle` endpoint. The simplest way to grant these is to attach the AWS managed policy `AmazonBedrockMantleInferenceAccess` to your AWS Identity and Access Management (IAM) principal. It grants read and inference-creation access on Mantle—the permissions the examples in this post need. These include `bedrock-mantle:CreateInference` (which authorizes the Chat Completions and Responses inference calls) and `bedrock-mantle:CallWithBearerToken` (which authorizes calling the endpoint with an Amazon Bedrock API key). For details on creating and managing API keys, refer to [Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>).

If you also need to manage projects, fine-tuning, custom models, and more, attach `AmazonBedrockMantleFullAccess` instead, which grants the full `bedrock-mantle` action set.

### Console playground

The [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock>) includes a chat/text playground where you can quickly test models without writing any code. Follow these steps to load a Gemma 4 model and prepare it for interaction:

  1. Navigate to the Amazon Bedrock console.
  2. From the left menu, choose **Test playgrounds**.
  3. Choose the **Chat/Text** playground.
  4. Choose **Select model** in the upper-left corner of the playground.
  5. From the category list, choose **Google**.
  6. Choose a Gemma 4 model.
  7. Choose **Apply** to load the model.
  8. Verify that the model loaded successfully: the model name appears in the playground header, and the chat interface is ready for input.



To demonstrate Gemma 4 31B’s reasoning and code generation capabilities, try the following prompt in the playground: _“Design a Python microservice that exposes a REST API for managing a task queue. Include error handling, input validation, and write unit tests. Explain your design decisions.”_

### Call the bedrock-mantle endpoint from the OpenAI SDK

The following example uses the OpenAI Python SDK as a client library to call the `bedrock-mantle` endpoint. When using the OpenAI SDK, you need an Amazon Bedrock API key. For production workloads, use short-term API keys. They expire automatically (maximum 12 hours) and inherit the permissions of the IAM role that generated them. If you are already using native AWS credentials and don’t have an API key, the [aws-bedrock-token-generator](<https://pypi.org/project/aws-bedrock-token-generator/>) package generates a short-term bearer token from those credentials.
    
    
    from openai import OpenAI
    
    client = OpenAI(
        api_key="<your-short-term-bedrock-api-key>",
        base_url="https://bedrock-mantle.us-east-1.api.aws/openai/v1",
    )
    
    response = client.chat.completions.create(
        model="google.gemma-4-31b",
        messages=[
            {"role": "user", "content": "Explain the benefits of mixture-of-experts architectures for production inference."}
        ],
        max_tokens=512,
    )
    print(response.choices[0].message.content)

If you are migrating an existing application that already uses the OpenAI SDK format with a different model, the migration typically requires updating only the base URL and the model ID. To control permissions for generating and using API keys, refer to [Control permissions for generating and using Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-permissions.html>).

> **Note:** The code examples in this post read the API key from an environment variable for demonstration only. In production, store and retrieve credentials from a managed secrets service such as [AWS Secrets Manager](<https://docs.aws.amazon.com/secretsmanager/>) or [AWS Systems Manager Parameter Store](<https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html>) rather than environment variables.

### Multimodal input (image)

Because Gemma 4 supports image input across all variants, the same Chat Completions API works for vision tasks. The `bedrock-mantle` endpoint accepts images as inline base64-encoded data URLs or as Amazon Simple Storage Service (Amazon S3) URLs (`s3://`); arbitrary public `https://` image URLs are not supported. The following example reads a local image file, encodes it as a base64 data URL, and includes it in the message content alongside the text prompt:
    
    
    import base64
    
    # Read a local image file and encode it as a base64 data URL.
    with open("chart.png", "rb") as image_file:
        image_b64 = base64.b64encode(image_file.read()).decode("utf-8")
    data_url = f"data:image/png;base64,{image_b64}"
    
    response = client.chat.completions.create(
        model="google.gemma-4-31b",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {"type": "text", "text": "Describe the trend shown in this chart."}
            ]
        }],
    )
    print(response.choices[0].message.content)

Alternatively, you can reference an image stored in Amazon S3 by passing an `s3://` URL in place of the data URL (for example, `{"url": "s3://my-bucket/chart.png"}`). This avoids inlining large images in the request body. For best results, place image content before the text in the prompt, which matches Google DeepMind’s recommended ordering for Gemma 4 multimodal inputs.

### Streaming responses

For chat and agent use cases where you want to surface tokens to the user as they are generated, set `stream=True`. The response becomes an iterator of incremental delta events:
    
    
    stream = client.chat.completions.create(
        model="google.gemma-4-31b",
        messages=[
            {"role": "user", "content": "Write a short poem about distributed systems."}
        ],
        stream=True,
    )
    
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            print(delta, end="", flush=True)
    print()

Streaming uses the same `bedrock-mantle:CreateInference` permission as a non-streaming call—the IAM policy shown earlier already covers it.

### Tool calling

Gemma 4 supports native function calling for agentic workflows. The following example shows a complete tool-calling loop: defining a tool, receiving a tool call from the model, executing the function, and passing the result back.
    
    
    import json
    from openai import OpenAI
    
    client = OpenAI(
        api_key="<your-short-term-bedrock-api-key>",
        base_url="https://bedrock-mantle.us-east-1.api.aws/openai/v1",
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
        model="google.gemma-4-31b",
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
    
            # Step 3: Validate the function name and run it (your implementation)
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
            model="google.gemma-4-31b",
            messages=messages,
            tools=tools,
        )
    
        print(final_response.choices[0].message.content)
    else:
        print(assistant_message.content)

### Responses API

In addition to Chat Completions, the `bedrock-mantle` endpoint supports the OpenAI Responses API, which uses a single `input` field instead of a `messages` list and returns a top-level `output_text` for the generated response. This is a good fit for single-turn generation and for applications already built against the Responses interface:
    
    
    response = client.responses.create(
        model="google.gemma-4-31b",
        input="Explain the benefits of mixture-of-experts architectures for production inference.",
        max_output_tokens=512,
    )
    print(response.output_text)

The Responses API uses the same Amazon Bedrock API key and base URL as the Chat Completions examples; only the method and response shape differ. Use Chat Completions when you need multi-turn message history or client-side tool-calling loops, and the Responses API for streamlined single-turn generation or when you want the model’s reasoning (covered next).

### Enable reasoning mode

Gemma 4 can produce an explicit thought process before its final answer, which is useful for complex multi-step tasks at the cost of more latency and token usage. On the `bedrock-mantle` endpoint, you enable this through the Responses API by setting the `reasoning` parameter. The model returns the thought process as a separate reasoning item in the output, alongside the final answer in `output_text`:
    
    
    response = client.responses.create(
        model="google.gemma-4-31b",
        input="If a train leaves at 3pm at 60 km/h and another leaves an hour later at 90 km/h from the same station, when does the second catch up?",
        reasoning={"effort": "high"},
    )
    
    # Final answer.
    print(response.output_text)
    
    # The thought process is returned as a separate output item of type "reasoning".
    for item in response.output:
        if item.type == "reasoning":
            for block in item.content:
                print(block.text)

The `effort` value (`low`, `medium`, or `high`) controls how much the model reasons before answering. For multi-turn conversations, pass only the final answers back as history—exclude prior reasoning items from the input on the next turn.

For Gemma 4 E2B, we recommend setting `reasoning_effort` to `high`. The smallest variant tends to reason extensively by default, and a high reasoning effort keeps that thinking in the dedicated reasoning channel—improving output quality and preventing reasoning text from leaking into the final answer.

### Recommended sampling parameters

On the `bedrock-mantle` endpoint, sampling is controlled by `temperature` and `top_p`. For Gemma 4, we recommend `temperature=1.0` and `top_p=0.95`, which work well for both reasoning and non-reasoning modes.

## Clean up

On-demand inference incurs charges only when invoked, so there is no infrastructure to tear down. To avoid unintended charges:

  * If you generated short-term Amazon Bedrock API keys for testing, the keys expire automatically (maximum 12 hours). To revoke earlier, [delete the API key](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>) in the console. Deleting an API key immediately revokes access for all applications using that key, so make sure no active applications depend on it before you delete it.
  * If you opted in to the Priority tier for testing, switch back to Standard for non-latency-sensitive traffic by removing the `service_tier` parameter from your invocations.
  * For pricing details by tier and model, refer to [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>).



## Service tiers

Amazon Bedrock offers multiple service tiers to match different workload requirements:

**Tier** | **Best for** | **Characteristics**  
---|---|---  
Priority | Mission-critical, customer-facing workflows that need the fastest response times | Up to 25% better output tokens per second (OTPS) latency compared to Standard. Prioritized ahead of Standard and Flex requests. Premium over standard on-demand pricing. No upfront reservation or commitment.  
Standard | Everyday AI tasks such as content generation, text analysis, and routine document processing | Consistent performance at standard on-demand pricing. Default tier when no tier is specified. No commitment.  
Flex | Workloads that can tolerate longer processing times, such as model evaluations, content summarization, and agentic workflows | Discounted pricing relative to Standard. Higher latency, especially during peak traffic, because Flex requests are processed after Standard. No commitment.  
  
For the latest tier availability per model, refer to the [Amazon Bedrock model catalog](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html>).

## Scaling on-demand inference

When you invoke Gemma 4 models on Amazon Bedrock, requests use on-demand inference (Standard tier) by default, where you pay per token without reserving capacity. On-demand throughput is shared and allocated per AWS Region, so during periods of high regional demand a request might be briefly queued or throttled. Designing for this is important for applications that need to scale reliably in production.

On the `bedrock-mantle` endpoint, there is no requests-per-minute (RPM) quota. Inference is governed by per-model, per-Region token-based quotas—separate input-tokens-per-minute and output-tokens-per-minute limits. Gemma 4 and other open models don’t currently have per-account token quotas published in the Service Quotas console. Their throughput is governed by internal service capacity, so use retry logic with exponential backoff to handle transient throttling. Cached input tokens read through prompt caching don’t count against the input-token quota. For details, see [Quotas for the bedrock-mantle endpoint](<https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html>).

Amazon Bedrock surfaces two HTTP error codes that indicate that a request cannot be served:

**Error** | **What it means** | **What to do**  
---|---|---  
HTTP 429 | A token-per-minute quota for the model has been exceeded. | Reduce the submission rate and retry with exponential backoff; request a quota increase through AWS Support if you consistently hit the limit.  
HTTP 503 | Regional capacity for the model is under pressure. | Retry with exponential backoff for occasional responses; reduce the submission rate for sustained ones.  
  
The distinction between these two responses matters when troubleshooting production traffic. A 429 indicates that a token-per-minute quota has been exceeded and is best addressed by reducing your submission rate or requesting a quota increase through AWS Support. A 503 indicates that regional capacity for the model is under pressure. Following the guidance in the next section to ramp gradually allows applications to continue operating on on-demand inference without disruption.

### Handle one-off 503 responses

Some on-demand inference requests might see occasional 503 responses when the model is in high demand. The recommended way to handle them is exponential backoff with jitter and a bounded retry count. The OpenAI SDK supports this through its built-in `max_retries` setting, which retries failed requests with exponential backoff. The following example configures the client used with the `bedrock-mantle` endpoint:
    
    
    from openai import OpenAI
    
    # Retry transient failures with exponential backoff.
    client = OpenAI(
        api_key="<your-short-term-bedrock-api-key>",
        base_url="https://bedrock-mantle.us-east-1.api.aws/openai/v1",
        max_retries=6,
    )

Backoff and retry is the recommended way to handle these transient responses on the `bedrock-mantle` endpoint.

If 503 responses become sustained, retries alone won’t resolve the issue because the effective request rate is exceeding available capacity for the model. In that case, consider routing latency-sensitive traffic to the Priority tier, which receives preferential processing ahead of Standard and Flex requests during periods of high demand.

### Handle steep traffic ramps

When using Standard tier on-demand inference, your application’s incoming traffic should align with how the model’s regional capacity scales. Sudden, large jumps in request rate are more likely to trigger 503s than gradual increases that the system can accommodate. Whenever you increase the request rate against Gemma 4 models, scale up in measured increments rather than stepping straight to a new target volume. The recommended ramp procedure is as follows:

  1. Start at your target request rate.
  2. If you receive 503 responses, reduce the rate by 50% and continue reducing until requests are succeeding consistently.
  3. Hold at that steady state for 15 minutes.
  4. Increase the rate by 50% and hold for another 15 minutes.
  5. Repeat until you reach your target volume.



As a worked example: if your target is 2,000 RPM and you encounter 503s, reduce to 1,000 RPM, then to 500 if errors persist. Once 500 RPM is steady for 15 minutes, scale to 750, then 1,125, and so on. Skipping the 15-minute hold turns each step-up into a fresh load test.

### Choose the Priority tier for latency-sensitive workloads

Beyond reactive use during sustained 503s, the Priority tier can be a useful lever to reduce occurrences of 503 while continuing to use on-demand inference. Priority delivers up to 25% better output tokens per second compared to Standard, and there is no upfront reservation or commitment. Applications opt in by setting the `service_tier` parameter to `priority` on each invocation, and tiers can be mixed within the same application. Customer-facing prompts, real-time agents, and other user interactions where response time directly affects experience are good candidates for Priority. For background and batch-style work, Standard or Flex is typically the right choice and avoids paying the Priority premium on requests that wouldn’t benefit from it.

### More best practices for production scale

A handful of practices help keep inference workloads running smoothly at scale:

  * Spread large workloads across multiple minutes, rather than firing them in tight bursts, to reduce pressure on regional capacity.
  * When migrating production traffic to a new Gemma 4 model version, use feature flags to ramp the percentage of traffic gradually instead of cutting over all at once.
  * Route asynchronous work—model evaluations, content summarization, agentic backfills—to the Flex tier for improved price-performance.
  * For workloads without data residency requirements, distribute across multiple Regions to improve resilience during regional demand spikes.
  * For workloads expected to grow, plan headroom for two to three times the expected peak as a buffer for traffic surges.



For complete guidance, refer to [Scaling and throughput best practices](<https://docs.aws.amazon.com/bedrock/latest/userguide/scaling-throughput-best-practices.html>) in the Amazon Bedrock User Guide.

### Reduce latency with implicit prompt caching

Gemma 4 models on Amazon Bedrock support implicit prompt caching, which is automatically enabled. Consecutive requests that share a common prompt prefix might result in a cache hit, allowing the model to reuse the cached internal state instead of recomputing it. Cache hits reduce inference latency on the matching tokens, with no code changes or cache markers required.

Implicit prompt caching is available across all on-demand service tiers (Standard, Priority, and Flex), so applications can take advantage of it regardless of how their traffic is routed. Cache hits are not always present on every request, but they are common in workloads with stable prefixes such as multi-turn agents, retrieval-augmented generation, and long-context analysis, where system prompts, tool definitions, or source documents are reused across requests. If you place static content at the front of the prompt and dynamic content at the end, applications can take advantage of caching when it occurs.

## Pricing and availability

At launch, Gemma 4 models are available in four AWS Regions: US East (N. Virginia), US East (Ohio), US West (Oregon), and Europe (Frankfurt). For the latest list, refer to the [Amazon Bedrock model catalog](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html>).

Pricing is per token and varies by model and service tier. For current rates, refer to [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>).

## Conclusion

In this post, we explored the Gemma 4 family on Amazon Bedrock—open-weight models from Google DeepMind covering dense and mixture-of-experts architectures, with built-in reasoning, native function calling, and multimodal input across text and image. We walked through the `bedrock-mantle` endpoint and the security architecture that runs underneath it (Model Deployment Account isolation with zero operator access), and showed how to get started using the OpenAI Python SDK against `bedrock-mantle`. We covered service tiers (Standard, Priority, and Flex), the shared-throughput model for on-demand inference, and how to handle 503 responses and ramp traffic in production.

To get started:

  1. Open the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>) and try Gemma 4 in the Chat/Text playground.
  2. Run the `bedrock-mantle` Python sample in this post against your own data.
  3. Evaluate Gemma 4 31B, 26B-A4B, and E2B on your workloads to choose the variant that fits your cost and latency profile.
  4. For production deployment, review the [Scaling and throughput best practices](<https://docs.aws.amazon.com/bedrock/latest/userguide/scaling-throughput-best-practices.html>) and consider the Priority tier for latency-sensitive traffic.



For more information, refer to the following resources:

  * [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>)
  * [Gemma 4 model card (Google)](<https://ai.google.dev/gemma/docs/core/model_card_4>)
  * [Gemma 4 launch blog (Google)](<https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/>)
  * [Gemma 4 on Hugging Face](<https://huggingface.co/collections/google/gemma-4>)
  * [Amazon Bedrock data protection](<https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html>)
  * [Exploring the zero operator access design of Amazon Bedrock’s next-generation inference engine](<https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/>)
  * [Amazon Bedrock endpoints](<https://docs.aws.amazon.com/general/latest/gr/bedrock.html>)
  * [Amazon Bedrock service tiers](<https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html>)
  * [Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>)
  * [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>)
  * [Artificial Analysis: Gemma 4 31B](<https://artificialanalysis.ai/models/gemma-4-31b>)



* * *

## About the authors

### Aris Tsakpinis

Aris is a Senior Specialist Solutions Architect for Generative AI focusing on open-weight models on Amazon Bedrock and the broader generative AI open-source ecosystem. Alongside his professional role, he is pursuing a PhD in Machine Learning Engineering at the University of Regensburg, where his research focuses on applied natural language processing in scientific domains.

### Alex Thewsey

Alex is a Generative AI Specialist Solutions Architect at AWS, based in Singapore. Alex helps customers across Southeast Asia to design and implement solutions with ML and Generative AI. He also enjoys karting, working with open source projects, and trying to keep up with new ML research.

### Saurabh Trikande

Saurabh is a Senior Product Manager for Amazon Bedrock and Amazon SageMaker Inference. He is passionate about working with customers and partners, motivated by the goal of democratizing AI. He focuses on core challenges related to deploying complex AI applications, inference with multi-tenant models, cost optimizations, and making the deployment of generative AI models more accessible. In his spare time, Saurabh enjoys hiking, learning about innovative technologies, following TechCrunch, and spending time with his family.

### Pradyun Ramadorai

Pradyun is a Principal Engineer at Amazon Bedrock. He focuses on core challenges related to Generative AI applications, scalable LLM inference and optimizations.

### Zohreh Norouzi

Zohreh is a Security Solutions Architect at Amazon Web Services. She helps customers make good security choices and accelerate their journey to the AWS Cloud. She has been actively involved in generative AI security initiatives across APJ, using her expertise to help customers build secure generative AI solutions at scale.
