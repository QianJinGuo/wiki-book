---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/get-started-with-openai-gpt-5-6-sol-terra-and-luna-on-amazon-bedrock
ingested: 2026-07-26
feed_name: AWS China ML
source_published: 2026-07-24
sha256: 2701f18984819f2e2a193c1e0ca0ab4609f4086aee505fe8da53d330a12759ee
title: "Get started with OpenAI GPT-5.6 Sol, Terra, and Luna on Amazon Bedrock"
---

|---|---  
**Sol** | openai.gpt-5.6-sol | Autonomous coding, security research, scientific analysis, and deep multi-step reasoning | US East (N. Virginia), US East (Ohio)  
**Terra** | openai.gpt-5.6-terra | General-purpose production workloads that balance reasoning, performance, and cost | US East (N. Virginia), US East (Ohio), US West (Oregon)  
**Luna** | openai.gpt-5.6-luna | High-volume, latency-sensitive workloads such as classification, summarization, and routing | US East (N. Virginia), US East (Ohio), US West (Oregon)  
  
All three models support text and image input, text output, a 272K-token context window, and the Responses API. They also support `none`, `low`, `medium`, `high`, `xhigh`, and `max` reasoning effort, so you can switch models without changing your API integration.

## Accessing GPT-5.6 through the bedrock-mantle endpoint

You access GPT-5.6 models through the OpenAI Responses API on the `bedrock-mantle` endpoint. The base URL is `https://bedrock-mantle.{region}.api.aws`, and the Responses API is served at `/openai/v1/responses`. Replace `{region}` with a supported AWS Region, such as `us-east-1`. This `openai/v1` path is specific to the OpenAI models. The endpoint works with the OpenAI Python and TypeScript SDKs. To run an existing OpenAI SDK application on Amazon Bedrock, replace the OpenAI base URL with the bedrock-mantle endpoint, use the corresponding Amazon Bedrock model ID, and authenticate with an [Amazon Bedrock API key](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>) or AWS credentials.

### Security and data handling

Every model call runs under your [AWS Identity and Access Management (IAM)](<https://aws.amazon.com/iam/>) policies, inside your virtual private cloud (VPC), and is logged in [AWS CloudTrail](<https://aws.amazon.com/cloudtrail/>). In-Region inference keeps requests within the AWS Region you specify, which helps teams meet data-residency requirements.

GPT-5.6 Sol, Terra, and Luna are third-party models from OpenAI, made available on Amazon Bedrock and subject to [the OpenAI terms](<https://aws.amazon.com/legal/bedrock/third-party-models/>). For these OpenAI models, classifier-flagged traffic is retained for up to 30 days for automated offline [abuse detection](<https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html>). Retained inputs and outputs are stored and processed by AWS and are not shared with the model provider unless you opt in. You control retention configuration through [data retention](<https://docs.aws.amazon.com/bedrock/latest/userguide/data-retention.html>) mode.

## Get started with GPT-5.6 on Amazon Bedrock

Complete the following steps to start using GPT-5.6 on Amazon Bedrock.

### Prerequisites

To use GPT-5.6 models, you need an AWS account with permissions to run inference on the bedrock-mantle endpoint. One way to grant these is to attach the AWS managed policy AmazonBedrockMantleInferenceAccess to your IAM principal. It grants the read and inference-creation access the examples in this post need, including bedrock-mantle:CreateInference and bedrock-mantle:CallWithBearerToken.

Install the OpenAI Python SDK, version 2.45.0 or later:
    
    
    pip install "openai>=2.45.0"

You authenticate with an API key. There are two options for authenticating the OpenAI SDK.

  1. **Auto-refreshing short-term key:** The OpenAI SDK’s native BedrockOpenAI client takes a token provider that generates a short-term key from your AWS credentials and refreshes it before each request. The examples in this post use this client. 
         
         from aws_bedrock_token_generator import provide_token
         from openai import BedrockOpenAI
         region = "us-east-1"
         
         client = BedrockOpenAI(
             aws_region=region,
             bedrock_token_provider=lambda: provide_token(region=region),
         )

  2. **Short-term key from an environment variable:** Set the key on AWS_BEARER_TOKEN_BEDROCK and pass it to the client. Because this key isn’t refreshed, it expires after at most 12 hours. For production, use the auto-refreshing option or store the key in AWS Secrets Manager. 
         
         import os
         from openai import OpenAI
         
         client = OpenAI(
             base_url="https://bedrock-mantle.us-east-1.api.aws/openai/v1",
             api_key=os.environ["AWS_BEARER_TOKEN_BEDROCK"],
         )




### Run your first inference with the Responses API

Using the BedrockOpenAI client from the previous step, call GPT-5.6 Terra through the Responses API. The Responses API uses a single `input` field and returns the generated text in `output_text`.
    
    
    response = client.responses.create(
        model="openai.gpt-5.6-terra",
        input="Explain the benefits of prompt caching for agentic workloads.",
        max_output_tokens=512,
        store=False,
    )
    
    print(response.output_text)

To move an existing OpenAI SDK application to GPT-5.6 on Amazon Bedrock, update the base URL and the model ID.

### Control reasoning effort

GPT-5.6 models can spend additional reasoning tokens on complex, multi-step tasks before answering, which improves results but increases latency and cost. Set the level with the reasoning parameter. Sol, Terra, and Luna support `none`, `low`, `medium`, `high`, `xhigh`, and `max`. Match the level to the task.
    
    
    response = client.responses.create(
        model="openai.gpt-5.6-sol",
        input="A train leaves at 3 PM at 60 km/h. Another leaves an hour later at "
        "90 km/h from the same station. When does the second catch up?",
        reasoning={"effort": "high"},
    )
    
    print(response.output_text)

### Call tools

GPT-5.6 supports tool calling, which lets the model request tools you define and use their results to complete a request. The following example demonstrates client-side tool calling, where your application runs the tool and returns the result to the model. It defines a get_weather tool and completes one round-trip. The model requests the tool, your application runs it and returns the result, and the model produces the final answer.
    
    
    import json
    
    tools = [
        {
            "type": "function",
            "name": "get_weather",
            "description": "Get the current weather for a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City and country (for example, Seattle, US)",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                        "description": "Temperature unit",
                    },
                },
                "required": ["location"],
            },
        }
    ]
    
    # Step 1: Send the user request with the tool definition.
    input_list = [{"role": "user", "content": "What's the weather like in Seattle?"}]
    
    response = client.responses.create(
        model="openai.gpt-5.6-terra",
        input=input_list,
        tools=tools,
    )
    
    # Step 2: Carry the model's output (including any reasoning items) into the next turn.
    input_list += response.output
    
    # Step 3: Run each requested function and append its result.
    for item in response.output:
        if item.type == "function_call":
            args = json.loads(item.arguments)
            result = {
                "location": args["location"],
                "temperature": 64,
                "condition": "Partly cloudy",
            }
            input_list.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": json.dumps(result),
                }
            )
    
    # Step 4: Ask the model for the final response, incorporating the tool result.
    final_response = client.responses.create(
        model="openai.gpt-5.6-terra",
        input=input_list,
        tools=tools,
    )
    
    print(final_response.output_text)

Because GPT-5.6 models reason before responding, pass the model’s output items (which can include reasoning) back in the next request, as the preceding example does when it appends `response.output` to the `input` list.

For production deployments, use [Amazon Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>) to implement safeguards customized to your use cases and responsible AI policies.

### Try GPT-5.6 on the console

GPT-5.6 models run on the next-generation inference engine, which has a [new Amazon Bedrock console experience](<https://console.aws.amazon.com/bedrock-mantle/>) optimized for the bedrock-mantle endpoint and its OpenAI-compatible and Anthropic-compatible APIs.

This experience is project-based. You create a project, assign models, configure API keys, and evaluate models side by side before writing application code. Complete the following steps to try GPT-5.6 without leaving the console:

  1. Open the [new Amazon Bedrock console](<https://console.aws.amazon.com/bedrock-mantle/>) in a Region where the models are available, such as US East (N. Virginia). If you are in the existing console, choose **Try the new Bedrock console**.
  2. Create a project, or open an existing one.
  3. In the model catalog, review the available GPT, Claude, and open-weight models. You can compare up to three models side by side on capabilities, modalities, context window, pricing, and Regional availability.
  4. Choose a GPT-5.6 model to add it to your project.
  5. Start an evaluation, enter a prompt, and review the model’s response. You can select up to three models to compare responses to the same prompt.



The following screenshot shows the model catalog in the new Amazon Bedrock console, where you can browse and compare GPT-5.6 and other models.

## Reduce cost with GPT-5.6 prompt caching

Agentic and multi-step workloads repeat much of their context between calls. System instructions, tool definitions, and reference files often stay the same while only the latest input changes. GPT-5.6 supports prompt caching in two modes on Amazon Bedrock. Implicit caching is on by default, so eligible requests are cached automatically without code changes. Explicit caching lets you mark cache breakpoints for precise control over which parts of a prompt are cached. In both modes, prompt caching reduces the cost of repeatedly processing shared context as request volume grows.

With a cache breakpoint, you mark the end of a reusable prompt prefix. On a subsequent request that shares that prefix, Amazon Bedrock reuses the processed context, and each call pays full price only for the new work. Cached input is billed at a 90% discount compared to uncached input tokens, and tokens written to cache are billed at 1.25 times the uncached input rate. For current rates, see the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>). Cached content stays available for reuse for at least 30 minutes, long enough to cover the burst of calls a single agent run generates. Each breakpoint requires a prefix of at least 1,024 tokens, and you can set up to four cache checkpoints per request. If a prefix is shorter than the minimum, the request still succeeds, but nothing is cached and `cached_tokens` stays zero.

### Explicit caching with cache breakpoints

To cache a prefix, add a `prompt_cache_breakpoint` to the content block that ends the reusable section, and set `prompt_cache_options` to `explicit` mode. Setting a consistent `prompt_cache_key` across requests routes them to the same cache and improves match reliability. In the following example, the system instruction is cached, and the user’s question comes after the breakpoint so it can change without invalidating the cached prefix. The same request is sent twice to show a cache write followed by a cache read.
    
    
    # Replace with your real system instructions and reference content.
    # The cached prefix must be at least 1,024 tokens, or nothing is cached.
    system_prompt = "You are a technical support agent for Example Corp. ...(1,024+ tokens)..."
    
    def ask(question):
        return client.responses.create(
            model="openai.gpt-5.6-terra",
            prompt_cache_key="support-agent:system-prompt-v1",
            prompt_cache_options={"mode": "explicit"},
            input=[
                {
                    "type": "message",
                    "role": "developer",
                    "content": [
                        {
                            "type": "input_text",
                            "text": system_prompt,
                            # Cache everything up to this breakpoint (the system instruction).
                            "prompt_cache_breakpoint": {"mode": "explicit"},
                        }
                    ],
                },
                {
                    "type": "message",
                    "role": "user",
                    "content": [{"type": "input_text", "text": question}],
                },
            ],
        )
    
    # First call: writes the prefix to cache.
    first = ask("How do I configure single sign-on?")
    print("write:", first.usage.input_tokens_details.cache_write_tokens)
    
    # Second call with the same prefix and cache key: read the prefix from cache.
    second = ask("How do I reset a password?")
    print("read: ", second.usage.input_tokens_details.cached_tokens)
    print(second.output_text)

The system_prompt here is an abbreviated placeholder. Replace it with real content of at least 1,024 tokens. With a large enough prefix, the first call reports a nonzero `cache_write_tokens` and the second a nonzero `cached_tokens`, confirming the prefix was reused. Explicit mode is a good fit for agentic loops with a large, stable prefix, where you want full control over what gets cached.

### Implicit caching

If you don’t set `prompt_cache_options`, GPT-5.6 uses implicit caching, the default mode. Amazon Bedrock places an automatic cache breakpoint on the latest message and honors any explicit breakpoints you add, so a stable prompt prefix can be reused across requests without any change to your input structure. This is the quickest way to benefit from caching. Keep static content (system instructions, tool definitions, reference documents) at the front of the prompt and variable content at the end, set a consistent `prompt_cache_key` for related requests, and the endpoint reuses the processed prefix when it matches.

The following example uses implicit caching. It sets no `prompt_cache_options` and no breakpoint, and reuses the `system_prompt` from the previous example (replace it with real content of at least 1,024 tokens) with a consistent `prompt_cache_key`:
    
    
    response = client.responses.create(
        model="openai.gpt-5.6-terra",
        prompt_cache_key="support-agent:kb-v1",
        input=[
            {
                "type": "message",
                "role": "developer",
                # Static content first so it forms a stable, cacheable prefix.
                "content": [{"type": "input_text", "text": system_prompt}],
            },
            {
                "type": "message",
                "role": "user",
                "content": [{"type": "input_text", "text": "How do I configure single sign-on?"}],
            },
        ],
    )
    
    print(response.output_text)

The trade-off is control. In implicit mode, you don’t decide exactly where the cacheable boundary falls. Implicit caching suits chat and Retrieval Augmented Generation (RAG) workloads with a naturally stable prefix, while explicit caching suits agentic loops where you want to pin a large, known prefix and avoid unnecessary cache writes. Billing is the same in both modes. Cache reads receive the 90% discount, and cache writes are billed at 1.25 times the uncached input rate. For current rates, see the [Amazon Bedrock pricing page](<https://aws.amazon.com/bedrock/pricing/>). To turn caching off for a request, set `prompt_cache_options` to `explicit` mode without adding any breakpoints.

### Monitor and evaluate your cache hit rate

Each response reports cache activity in the usage object. The `input_tokens_details.cached_tokens` field is the number of input tokens read from cache, and `cache_write_tokens` is the number written. Because `cached_tokens` is already part of the total `input_tokens`, you get the cached-input ratio by dividing `cached_tokens` by `input_tokens`:
    
    
    usage = response.usage
    details = usage.input_tokens_details
    
    cached = getattr(details, "cached_tokens", 0) or 0
    cache_write = getattr(details, "cache_write_tokens", 0) or 0
    
    total_input = usage.input_tokens
    hit_rate = cached / total_input if total_input else 0.0
    
    print(f"Cached tokens: {cached}")
    print(f"Written tokens: {cache_write}")
    print(f"Total input: {total_input}")
    print(f"Cache hit rate: {hit_rate:.1%}")

A cache hit appears in the usage object as `cached_tokens` greater than zero and `cache_write_tokens` of zero. A zero `cache_write_tokens` alone doesn’t confirm a hit, since you also see it when nothing was cached. Cache hits aren’t guaranteed on every request, even with an identical prefix, so measure `cached_tokens` across calls rather than expecting a hit on any single one.

To track cache performance across many requests, aggregate `cached_tokens` and `cache_write_tokens` from each response in your application logging. The bedrock-mantle endpoint publishes account, project, and model token metrics to Amazon CloudWatch under the AWS/BedrockMantle namespace, but it does not publish a cache-specific metric, so the response usage object is the authoritative source for cache measurement.

## Use GPT-5.6 with Codex

Codex is the OpenAI coding agent for developers. It works with local files, repositories, terminals, and development environments to write features, fix bugs, run tests, and open pull requests. You can run Codex from the command line (Codex CLI), as an IDE extension for Visual Studio Code and JetBrains, or in the ChatGPT desktop app. Each of these can route its model inference to Amazon Bedrock so it runs in your AWS account with In-Region processing and the access controls described earlier.

To point Codex at Amazon Bedrock, set the model and provider in your `~/.codex/config.toml` file. The new Amazon Bedrock console also includes a **Clients** section that generates these connection instructions for you.
    
    
    model = "openai.gpt-5.6-sol"
    model_provider = "amazon-bedrock"
    [model_providers.amazon-bedrock.aws]
    region = "us-east-1"

Codex authenticates with an API key or your AWS SDK credentials. If you set `AWS_BEARER_TOKEN_BEDROCK`, Codex uses it first. Otherwise it falls back to the AWS SDK credential chain. The ChatGPT desktop app and the IDE extension might not inherit your shell environment, so place the variables they need in `~/.codex/.env`:
    
    
    AWS_BEARER_TOKEN_BEDROCK=<your-api-key>

Restart the app or extension after you change `~/.codex/config.toml` or `~/.codex/.env`. If you run the Codex CLI instead, you can export the same variable in your shell rather than using the `.env` file. Codex routes inference through the bedrock-mantle endpoint in supported commercial AWS Regions. For coding tasks, higher reasoning effort suits complex refactoring and debugging, while a lower level keeps routine edits fast.

The following screenshot shows Codex in the ChatGPT desktop app configured to run a GPT-5.6 model on Amazon Bedrock.

Codex in the ChatGPT desktop app running GPT-5.6 on Amazon Bedrock

You can change the reasoning effort in the ChatGPT desktop app, choosing between Light, Medium, High, and Extra High for a task. The following screenshot shows the reasoning-effort selector.

Choosing the reasoning effort for a Codex task in the ChatGPT desktop app

## Quotas and scaling

When you invoke GPT-5.6 models, requests use on-demand inference on the Standard service tier, where you pay per token without reserving capacity.

Inference on the bedrock-mantle endpoint is governed by two per-model, per-Region quotas, one for input tokens per minute and one for output tokens per minute. There is no requests-per-minute quota. Cached input tokens read through prompt caching do not count against the input-tokens-per-minute quota, which is one more reason caching helps at scale. If a token-per-minute quota is exceeded, the endpoint returns an HTTP 429 response. Handle transient throttling with exponential backoff and a bounded retry count, which the OpenAI SDK supports through its `max_retries` setting. For more information, refer to [Quotas for the bedrock-mantle endpoint](<https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html>).

One recommended way to handle transient throttling is exponential backoff with a bounded retry count. The OpenAI SDK supports this through its `max_retries` setting:
    
    
    from aws_bedrock_token_generator import provide_token
    from openai import BedrockOpenAI
    
    region = "us-east-1"
    
    client = BedrockOpenAI(
        aws_region=region,
        bedrock_token_provider=lambda: provide_token(region=region),
        max_retries=6,
    )

To reduce throttling on sustained high volume, spread large workloads across multiple minutes rather than firing them in tight bursts, and increase request rates gradually so throughput can track regional capacity.

## Clean up

On-demand inference incurs charges only when you invoke a model, so there is no infrastructure to tear down. To avoid unintended charges:

  * If you generated a short-term API key, it expires automatically within 12 hours. To revoke one sooner, delete the API key in the new Amazon Bedrock console. Deleting a key immediately revokes access for any application using it, so confirm no active applications depend on it first.
  * Each model invocation incurs per-token charges. For current rates, refer to [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>).



## Conclusion

In this post, we showed how to get started with OpenAI GPT-5.6 Sol, Terra, and Luna on Amazon Bedrock. We covered how to choose a variant, how to run inference through the Responses API on the bedrock-mantle endpoint, how to control reasoning effort and call tools, how to reduce cost with explicit prompt caching and measure your cache hit rate, and how to connect the OpenAI Codex coding agent. We also walked through quotas and scaling for the endpoint.

To get started:

  1. Open the [new Amazon Bedrock console](<https://console.aws.amazon.com/bedrock-mantle/>), create a project, and evaluate a GPT-5.6 model against your prompts.
  2. Run the Responses API sample from this post against your own data.
  3. Add an explicit cache breakpoint to a repeated prompt prefix and measure the cache hit rate.
  4. Evaluate Sol, Terra, and Luna on your workloads to choose the variant that fits your cost and latency profile.



For more information, refer to the following resources:

  * [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>)
  * [OpenAI model cards on Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html>)
  * [Prompt caching for faster model inference](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html>)
  * [Quotas for the bedrock-mantle endpoint](<https://docs.aws.amazon.com/bedrock/latest/userguide/quotas-mantle.html>)
  * [Amazon Bedrock API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>)
  * [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>)



To discuss how GPT-5.6 on Amazon Bedrock can support your workloads, [contact an AWS Representative](<https://aws.amazon.com/contact-us/>).

* * *

## About the authors

### Zohreh Norouzi

Zohreh is a Senior Security Solutions Architect at Amazon Web Services (AWS). She helps customers make good security choices and accelerate their journey to the AWS Cloud. She has been actively involved in AI security initiatives, using her expertise to help customers build secure AI solutions at scale.

### Koushik Kethamakka

Koushik is a Principal Software Engineer at AWS, currently focused on inference at scale as part of Amazon Mantle, the foundational infrastructure for hosting large models across AWS. Previously at AWS, Koushik built Amazon Bedrock Evaluations and Amazon Bedrock Guardrails, focused on LLM evaluations and safety. Before that, he contributed to building AI/ML services including Amazon Lex and Amazon Bedrock, with expertise spanning product and system design, LLM hosting, evaluations, and fine-tuning. Prior to AWS, Koushik built real-time ML fraud prevention systems for Amazon.com. He holds an MS from the University of Houston.

### Saurabh Trikande

Saurabh is a Senior Product Manager for Amazon Bedrock and Amazon SageMaker Inference. He is passionate about working with customers and partners, motivated by the goal of democratizing AI. He focuses on deploying complex AI applications, inference with multi-tenant models, and cost optimizations.

### Kamalesh Palanisamy

Kamalesh is a Software Engineer at AWS, focused on scalable model inference and safety orchestration for AWS Mantle. He works on model onboarding, inference optimization, and reliable serving infrastructure for large generative AI models.

### Manish Rathaur

Manish is a Senior Manager, Product for Amazon Bedrock.

### Chris Dickens

Chris is a Member of Product Staff at OpenAI focused on the OpenAI APIs. His work includes collaboration with AWS on Amazon Bedrock to make OpenAI’s frontier models widely accessible to developers.