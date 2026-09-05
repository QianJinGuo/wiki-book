---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-claude-opus-5-on-aws-anthropics-most-capable-opus-model
ingested: 2026-07-26
feed_name: AWS China ML
source_published: 2026-07-24
sha256: ee3226ebd78a9a592d6ae3c144fbc721e70d62263f8c6f644be7e7ac17429579
title: "Introducing Claude Opus 5 on AWS: Anthropic’s most capable Opus model"
---

# Introducing Claude Opus 5 on AWS: Anthropic’s most capable Opus model

Today, we announce the availability of Claude Opus 5 on Amazon Bedrock and Claude Platform on AWS. Claude Opus 5 is Anthropic’s most advanced Opus model and the first in the fifth generation. It is a meaningful step forward, providing improvements across the workflows that teams run in production such as agentic coding, knowledge work, visual understanding, and long-running tasks. According to Anthropic, Claude Opus 5 matches Claude Fable 5’s top-tier intelligence in many domains at Opus-tier pricing.  
  
On Amazon Bedrock, Claude Opus 5 benefits from zero data retention (ZDR) by default, delivering top-tier intelligence without compromising enterprise data governance. Claude Opus 5 is powered by Bedrock’s next-generation inference engine, letting you build within your existing AWS environment, maintain enterprise security and regional data residency, and scale inference with zero operator access.

Claude Opus 5 is also available through Claude Platform on AWS, which supports zero data retention on request and gives you access to Anthropic’s native platform experience and capabilities through the AWS Console. Build, test, and deploy with the same APIs, features, and console experience you get working with Anthropic directly, unified with AWS billing and authentication.

This post covers Opus 5’s improvements and practical guidance for AI engineers integrating the model into agentic systems and production inference workloads on Amazon Bedrock. See the [documentation](<https://docs.aws.amazon.com/claude-platform/>) for Claude Platform on AWS.

## What makes Claude Opus 5 different

According to Anthropic, Claude Opus 5 delivers a step-change in coding. It understands and navigates codebases like an experienced engineer and writes production-quality code while adapting its strategy as it works. It powers dependable long-running agents that work for hours and even overnight, finding paths around obstacles, recovering from errors, and reaching their objectives. For professional work, it brings deeper reasoning to long documents and higher accuracy to complex analysis, with the largest gains on document-heavy enterprise tasks. Together, this adds up to frontier capability at Opus-tier economics.

## Use cases

Claude Opus 5 is a strong fit for industries where precision, reliability, and deep reasoning matter most. For financial services teams, it powers financial workflows with deeper reasoning and end-to-end understanding of context. It handles compliance-sensitive work with more clarity and focus. For agent and workflow automation, it pushes back on flawed instructions and breaks complex jobs into sub-agents that need less oversight. In productivity work, it handles report building and auditing, document drafting, and structured analysis with high consistency. It runs multi-day projects and produces professional-grade outputs.

Claude Opus 5 also improves on Claude Opus 4.8’s cyber capabilities across the board, from coding to cyber security. In higher-risk areas, Opus 5 may fall back to Opus 4.8. Users are notified when this happens, and fallbacks can be configured when using the APIs.

## Getting started with Claude Opus 5 on Amazon Bedrock

You can get started with Claude Opus 5 in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>).

In the Amazon Bedrock console, under Test, choose Playground.

For the model, choose Claude Opus 5. Now, you can test your complex coding prompt with the model.

_Amazon Bedrock console Playground with Claude Opus 5 selected_

You can also access the model programmatically using the [Anthropic Messages API](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) to call `bedrock-runtime` through the Anthropic SDK or `bedrock-mantle` endpoints, or keep using the [Invoke](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-api.html>) and [Converse API](<https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) on `bedrock-runtime` through the [AWS Command Line Interface (AWS CLI)](<https://aws.amazon.com/cli/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>) and [AWS SDK](<https://aws.amazon.com/developer/tools/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>).

### Prerequisites

  * Active AWS account with Amazon Bedrock access.
  * AWS CLI installed and configured.
  * Python 3.8+.
  * Boto3 installed: `pip install boto3`
  * Anthropic SDK installed: `pip install anthropic[bedrock]`
  * IAM permissions: `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, and `bedrock:CreateInference`



Here’s a quick example using the AWS SDK for Python (Boto3):
    
    
    import boto3
    import json
    
    # Create a Bedrock Runtime client
    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name="us-east-1"
    )
    
    # Invoke Claude Opus 5
    response = bedrock_runtime.invoke_model(
        modelId="global.anthropic.claude-opus-5",
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "messages": [
                {
                    "role": "user",
                    "content": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions."
                }
            ]
        })
    )
    
    result = json.loads(response["body"].read())
    print(result["content"][1]["text"])
    

You can also use Claude Opus 5 with the Amazon Bedrock Converse API for a unified multi-model experience:
    
    
    import boto3
    
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
    
    response = bedrock_runtime.converse(
        modelId="global.anthropic.claude-opus-5",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions."
                    }
                ]
            }
        ],
        inferenceConfig={
            "maxTokens": 4096
        }
    )
    
    if 'output' in response:
        blocks = response['output']['message']['content']
        print('\n'.join(b.get('text', '') for b in blocks if 'text' in b))

You can also use Claude Opus 5 with the Anthropic Messages API using the `anthropic[bedrock]` SDK package for a streamlined experience:
    
    
    from anthropic import AnthropicBedrockMantle
    
    # Initialize the Bedrock Mantle client (uses SigV4 auth automatically)
    mantle_client = AnthropicBedrockMantle(aws_region="us-east-1")
    
    # Create a message using the Messages API
    message = mantle_client.messages.create(
        model="anthropic.claude-opus-5",
        max_tokens=4096,
        messages=[
            {"role": "user", "content": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions"}
        ]
    )
    
    print(message.content[1].text)

Claude Opus 5 supports adding and removing tools mid-conversation through `tool_addition` and `tool_removal` content blocks on `role: "system"` messages, instead of re-sending the full top-level tools array. See [Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages-tool-use.html>) for more details.

## Availability

Claude Opus 5 is available today on Amazon Bedrock in Regions including US East (N. Virginia), Asia Pacific (Melbourne), Europe (Ireland), and Europe (Stockholm). See [Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5.html>) for the full list of supported Regions. Claude Opus 5 is also available on the Claude Platform on AWS in North America, South America, Europe, and Asia Pacific.

Give Claude Opus 5 a try in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>), in [Claude Platform on AWS](<https://console.aws.amazon.com/claude-platform/>), or explore the [Getting Started notebooks](<https://github.com/aws-samples/anthropic-on-aws/tree/main/notebooks>) on GitHub. You can also unlock the full potential of Opus 5 by using [Advanced Prompt Optimization](<https://docs.aws.amazon.com/bedrock/latest/userguide/advanced-prompt-optimization-how.html>) on Amazon Bedrock. It takes your current prompts, benchmarks them against your evaluation criteria, and outputs production-ready rewrites.

* * *

## About the authors

### Aamna Najmi

Aamna is a Senior Specialist Solutions Architect for Generative AI focusing on Anthropic models and operationalizing and governing generative AI systems at scale on Amazon Bedrock. She helps ISVs solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. In her spare time, she pursues her passion for experimenting with food and discovering new places.

### Antonio Rodriguez

Antonio is a Principal Generative AI Tech Leader at Amazon Web Services. He helps companies of all sizes solve their challenges, adopt new approaches, and create new business opportunities with Amazon Bedrock. Apart from work, he loves to spend time with his family and play sports with his friends.

### Eugenio Soltero

Eugenio is a Sr. Product Marketing Manager for Amazon Bedrock at AWS. With several years of experience in generative AI, he helps customers navigate the evolving landscape of foundation models and generative AI to adopt solutions that deliver measurable value.

### Sofian Hamiti

Sofian is a technology leader with over 12 years of experience building AI solutions, and leading high-performing teams to maximize customer outcomes. He is passionate about empowering diverse talents to drive global impact and achieve their career aspirations.

### Ayan Ray

Ayan is a Principal Partner Solutions Architect and AI Tech Lead at AWS, serving as the Worldwide Tech Lead for Anthropic at AWS. He works at the intersection of cloud architecture and Artificial Intelligence, helping organizations adopt and scale Anthropic’s technologies on AWS.

### Dani Mitchell

Dani is a Sr GenAI Specialist Solutions Architect at AWS and the SA lead for Amazon Bedrock Knowledge Bases. He helps enterprises across the world design and deploy generative AI solutions using Amazon Bedrock and Anthropic’s models and capabilities to build scalable, production-ready applications.