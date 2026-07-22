sha256: 4ef5cf7f4ab12572046d288928b0e1315b769e72ed328525e001dd14156fe48c
---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/introducing-claude-sonnet-5-on-aws-anthropics-most-capable-sonnet-model
ingested: 2026-07-01
feed_name: AWS China ML
source_published: 2026-06-30
---

# Introducing Claude Sonnet 5 on AWS: Anthropic’s most capable Sonnet model

Today, we’re excited to announce the availability of Anthropic’s most advanced Sonnet model, Claude Sonnet 5, on Amazon Bedrock and [Claude Platform on AWS](<https://aws.amazon.com/blogs/machine-learning/introducing-claude-platform-on-aws-anthropics-native-platform-through-your-aws-account/>). Claude Sonnet 5 is the first Sonnet model of Anthropic’s latest generation and represents a meaningful step forward. It delivers top-tier intelligence at Sonnet pricing for coding, agents, and everyday professional work at scale. With Claude Sonnet 5 on Amazon Bedrock you can build within your existing AWS environment, maintain enterprise security and regional data residency, and scale inference. Claude Sonnet 5 is also available through Claude Platform on AWS, giving you access to Anthropic’s native platform experience and capabilities via the AWS Management Console. Build, test, and deploy with the same APIs, features, and console experience you’d get working with Anthropic directly, unified with AWS billing and authentication.

This post covers the improvements in Sonnet 5 and practical guidance for AI engineers integrating the model into agentic systems and production inference workloads on Amazon Bedrock. See the [documentation](<https://docs.aws.amazon.com/claude-platform/>) for Claude Platform on AWS.

## What makes Claude Sonnet 5 different

Claude Sonnet 5 shows stronger performance across coding, agentic tasks, and professional work. Claude Sonnet 5 brings near-Opus intelligence while maintaining the same balance of capability, cost, and speed, so teams can rely on Sonnet for everyday tasks at scale. Use Claude Sonnet 5 when you need strong reasoning, coding, and agentic reliability at scale without Opus-tier pricing. Use Claude Opus when your task demands the highest reasoning that justifies the cost premium. Sonnet 5 can hold a plan across stages, track what it has done and what remains, and resolve issues with fewer rounds of correction. This leads to more predictable behavior at scale.

In coding, Sonnet 5 is designed to navigate real codebases, land multi-file changes, and carry longer debugging and refactoring tasks through to completion. It writes cleaner, more maintainable code with reduced oversight. For autonomous agents, Claude Sonnet 5 serves as a more reliable backbone for automated operations, handling complex dependency chains and multi-step tool use, making it a strong fit for both customer-facing and internal agents. In professional work, Sonnet 5 synthesizes long, complex, unstructured sources into structured deliverables such as briefs, analyses, and reports. Claude Sonnet 5 is designed as a clear upgrade to Sonnet 4.6.

## Industry use cases

Claude Sonnet 5 is a strong fit for industries where reliability and structured reasoning matter most. For financial services teams, Sonnet 5 powers spreadsheet modeling, financial analysis, and reporting agents that audit their own numbers as they go. This supports end-to-end workflows from data ingestion to validated output. For productivity work, it handles report building and auditing, document drafting, and structured analysis with high consistency. With its computer use capabilities, you can automate browser and desktop workflows that previously required human interaction. For agent and workflow automation, Claude Sonnet 5 serves as the backbone for production agents that call tools and run multi-step jobs unattended.

## Getting started with Claude Sonnet 5 on Amazon Bedrock

You can get started with Claude Sonnet 5 in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>).

  1. In the Amazon Bedrock console, under Test, choose Playground.
  2. For the model, choose Claude Sonnet 5. Now, you can test your complex coding prompt with the model.



Amazon Bedrock console Playground with Claude Sonnet 5 selected

You can also access the model programmatically using the [Anthropic Messages API](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) to call the `bedrock-runtime` through Anthropic SDK or `bedrock-mantle` endpoints, or keep using the [Invoke](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-api.html>) and [Converse API](<https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>) on `bedrock-runtime` through the [AWS Command Line Interface (AWS CLI)](<https://aws.amazon.com/cli/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>) and [AWS SDK](<https://aws.amazon.com/developer/tools/?trk=769a1a2b-8c19-4976-9c45-b6b1226c7d20&sc_channel=el>).

### Prerequisites

  1. Active AWS account with Amazon Bedrock access
  2. AWS CLI installed and configured
  3. Python 3.8+
  4. Boto3 installed: `pip install boto3`
  5. Anthropic SDK installed: `pip install anthropic[bedrock]`
  6. IAM permissions: `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`, and `bedrock:CreateInference`



Here’s a quick example using the AWS SDK for Python (Boto3):
    
    
    import boto3
    import json
    
    # Create a Bedrock Runtime client
    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name="us-east-1"
    )
    
    # Invoke Claude Sonnet 5
    response = bedrock_runtime.invoke_model(
        modelId="us.anthropic.claude-sonnet-5",
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
    print(result["content"][0]["text"])

You can also use Claude Sonnet 5 with the Amazon Bedrock Converse API for a unified multi-model experience:
    
    
    import boto3
    
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
    
    response = bedrock_runtime.converse(
        modelId="us.anthropic.claude-sonnet-5",
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
    
    print(response["output"]["message"]["content"][0]["text"])

You can also use Claude Sonnet 5 with the Anthropic Messages API using the `anthropic[bedrock]` SDK package for a streamlined experience:
    
    
    from anthropic import AnthropicBedrockMantle
    
    # Initialize the Bedrock Mantle client (uses SigV4 auth automatically)
    mantle_client = AnthropicBedrockMantle(aws_region="us-east-1")
    
    # Create a message using the Messages API
    message = mantle_client.messages.create(
        model="anthropic.claude-sonnet-5",
        max_tokens=4096,
        messages=[
            {"role": "user", "content": "Design a distributed architecture on AWS in Python that should support 100k requests per second across multiple geographic regions"}
        ]
    )
    
    print(message.content[0].text)

## Availability

Claude Sonnet 5 is available today on Amazon Bedrock, with the full list of supported AWS Regions available in the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-sonnet-5.html>). Claude Sonnet 5 is also available on the Claude Platform on AWS in North America, South America, Europe, and Asia Pacific.

Give Claude Sonnet 5 a try in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock?trk=d8ec3b19-0f37-4f8c-8c12-189f913e205c&sc_channel=el>), in the [Claude Platform on AWS](<https://console.aws.amazon.com/claude-platform/>), or explore the [Getting Started notebooks](<https://github.com/aws-samples/anthropic-on-aws/tree/main/notebooks>) on GitHub. Sonnet 5 is available at promotional pricing through August 31, 2026. For details, see [Amazon Bedrock pricing](<https://aws.amazon.com/bedrock/pricing/>). You can also unlock Sonnet 5’s full potential by using [Advanced Prompt Optimization](<https://docs.aws.amazon.com/bedrock/latest/userguide/advanced-prompt-optimization-how.html>) on Amazon Bedrock. It takes your current prompts, benchmarks them against your evaluation criteria, and outputs production-ready rewrites.

* * *

## About the authors

### Aamna Najmi

Aamna is a Senior Specialist Solutions Architect for Generative AI focusing on Anthropic models and operationalizing and governing generative AI systems at scale on Amazon Bedrock. She helps ISVs solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. In her spare time, she pursues her passion for experimenting with food and discovering new places.

### Antonio Rodriguez

Antonio is a Principal Generative AI Tech Leader at Amazon Web Services. He helps companies of all sizes solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. Apart from work, he loves to spend time with his family and play sports with his friends.

### Eugenio Soltero

Eugenio is a Sr. Product Marketing Manager for Amazon Bedrock at AWS. With several years of experience in generative AI, he helps customers navigate the evolving landscape of foundation models and generative ai to adopt solutions that deliver measurable value.

### Sofian Hamiti

Sofian is a technology leader with over 12 years of experience building AI solutions, and leading high-performing teams to maximize customer outcomes. He is passionate about empowering diverse talents to drive global impact and achieve their career aspirations.

### Ayan Ray

Ayan is a Principal Partner Solutions Architect and AI Tech Lead at AWS, serving as the Worldwide Tech Lead for Anthropic at AWS. He works at the intersection of cloud architecture and Artificial Intelligence, helping organizations adopt and scale Anthropic’s technologies on AWS.

### Dani Mitchell

Dani is a Sr GenAI Specialist Solutions Architect at AWS and the SA lead for Amazon Bedrock Knowledge Bases. He helps enterprises across the world design and deploy generative AI solutions using Amazon Bedrock and Anthropic’s models and capabilities to build scalable, production-ready applications.
