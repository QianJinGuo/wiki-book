---
title: "aws bedrock intelligence message defense"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/intelligence-driven-message-defense-and-insights-using-amazon-bedrock/
tags: [aws-china-blog, agentic-ai]
ingested: 2026-05-08
feed_name: AWS China ML
source_published: 2026-05-05T15:20:54Z
sha256: 1a415bea1856
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# Intelligence-driven message defense and insights using Amazon Bedrock
Direct communication between buyers and sellers outside approved channels can result in significant revenue loss annually while severely damaging brand reputation and destroying valuable business relationships. While messaging systems are essential for modern business operations and help provide rich customer insights, they can create significant risks when parties bypass the brokerage system to communicate directly. When buyers and sellers exchange contact information and take their transactions offline, brokerages can not only lose immediate revenue but also suffer long-term damage as their marketplace value diminishes. This challenge is particularly acute in brokerage businesses where the service’s core value lies in facilitating secure, reliable connections between parties. While in-application messaging enables important transaction details, such as delivery placement “leave it by the back door” or specific times “only deliver after 4:00 PM”, the exchange of direct contact information (such as phone numbers, company names, websites, or physical addresses) must be prevented to maintain the brokerage’s position as a trusted intermediary. Failure to address this issue can lead to a cascade of negative outcomes. These include lost commission revenue, diminished service value, damaged partner relationships, and a weakened industry position that can take years to rebuild.
In this post, you will learn how you can use [Amazon Nova Foundation Models](<https://aws.amazon.com/ai/generative-ai/nova/>) in [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) to apply generative AI techniques for both business protection and enhancement. You can identify obvious and disguised attempts at direct contact while gaining valuable insights into customer sentiment and service improvement opportunities.
## Regular expressions
Using regular expressions (regex) may be the initial solution that comes to mind since it excels at pattern matching and text manipulation, offering a powerful and concise way to search, validate, and transform text data. Regex does well with structured patterns like email addresses, phone numbers, and dates. Contact information follows predictable patterns. Phone numbers use the `XXX-XXX-XXXX` format, while email addresses follow name@company.com. Regular expressions help identify these patterns in text. For US phone numbers, the regex pattern `\d{3}-\d{3}-\d{4}` matches three digits, a hyphen, three more digits, another hyphen, and four digits.
However, regex shows significant limitations when dealing with modern text complexities like HTML parsing (because of nested structures and variations in markup), emoji recognition (because of Unicode complexities and variations in emoji representations across services), and evolving patterns like social media handles or changing URLs. Regex falls short when people purposefully conceal contact information by using ever-changing deceptive tactics. For example, a message reading “Congratulations. Here are some more details 555inches 555inches 5555inches” is clearly an attempt to mask a phone number as measurements. Since the pattern is known, a sophisticated regex pattern like `(\d+)inches\s+(\d+)inches\s+(\d+)inches` can effectively uncover phone numbers concealed by using “inches” as a decoy unit of measurement. But what if the pattern is not as simple as using known measurement identifiers? The challenge of detecting hidden contact information extends beyond simple pattern matching and needs to be more dynamic. Evasion techniques are ever changing such as replacing numbers with words, using alternative units, varying delimiters, and combining leetspeak with emojis. Traditional regex patterns struggle with spelled-out numbers, creative symbol usage (writing “@” as “at”), context-dependent company references, and complex leetspeak combinations.
Regex is particularly inadequate for advanced text analysis needs such as sentiment detection, context understanding, or identifying user actions and intentions in text. For instance, while regex can find specific words, it cannot understand the emotional tone or determine if a user’s message requires follow-up action. When patterns become complex or require frequent updates, regex maintenance becomes challenging and error-prone, often leading to brittle solutions that break when text formats evolve. For these scenarios, consider using generative AI solutions such as Amazon Bedrock. Amazon Bedrock provides sophisticated language models that understand context, parse complex structures, and adapt to evolving text patterns without constant manual updates.
## Generative AI
Amazon Bedrock is a fully managed, serverless service offering a variety of high-performing AI foundation models from leading companies. You can use Amazon Bedrock to experiment with, customize, and integrate generative AI capabilities into your applications using familiar AWS services. Amazon Bedrock also provides a playground feature on the AWS console to test prompts and multiple LLMs.
To access Amazon Bedrock models and craft prompts on the AWS console, you need the following:
  1. An active AWS account
  2. Appropriate [IAM permissions](<https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html>)
  3. Familiarity with the AWS Management Console
  4. Basic understanding of prompt engineering concepts
Using the [Amazon Bedrock playground](<https://docs.aws.amazon.com/bedrock/latest/userguide/playgrounds.html>) on the AWS Management Console, we can experiment with prompt engineering using the Chat/Text playground in Single Prompt mode. When working with the Amazon Nova 2 Lite model, we can [influence response generation with inference parameters](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html>) by adjusting the response length to 1,000 tokens and lowering the temperature setting for more consistent outputs.
The following example message obfuscates the phone number by using emojis:
    I can get that done for you directly :five: :five: :five:-:five: :five: :five:-:zero: :one: :one: :one: .
With such a focused use case, a simple prompt can be written to find an emoji-based phone number:
    Analyze customer feedback regarding shipping orders for a brokerage and identify 
    if the supplier has provided phone numbers. The text may contain emoji to disguise 
    the original text.
Enter the preceding prompt with input text and click the Run button.
The model response explains how Nova 2 Lite detected the emojis as a phone number as shown in the following image:
With that simple scenario, creating a regex to do the same is possible, but let’s explore a more complex message with multiple disguising methods.
The following message contains both obvious contact information and attempts to disguise it using emojis, leetspeak, and false measurements.
    Hello! I agree to the terms, look me up and let's make it happen Am@z0n, Inc. 
    Congratulations. 
    call mi 321inches 555inches 0177inches. 
    I'm with Whole Foods Market tylerh@anycompany.com. 
    Will include it all in one box 12"L X 12"W x 6" high under 10 lbs. 
    Tyler Huehmer 123...555....0123. 
    I can get that done for you directly :five: :five: :five:-:five: :five: :five:-:zero: :one: :one: :one: . 
    This is a great deal jesseatanycompany.com. we can get this done by next week. 
    I've got brown hair and am 6'2" see you there. 410 Terry Avenue North, Seattle, WA 98109
The prompt needs to instruct the large language model (LLM) how to identify contact information that would violate the brokerage policies. Since it is nearly impossible to predict all methods, we cannot rely on explicit formatting and syntax to discover the hidden information. The Nova 2 Lite model must be instructed to discover phone numbers, company names, email addresses, mailing addresses, names and physical identifiers in different formats. Real shipping dimensions are allowed as that is valid information.
    You are a detective that must thoughtfully analyze buyer and seller correspondences 
    to discover contact information that violates policy by looking for emojis, leetspeak, 
    and other ways used to disguise contact information like spreading the contact 
    information across the text for categories phone number, business name, email, 
    mailing address, personal information such as name, appearance, etc. 
    Be aggressive and creative with how you identify phone numbers. 
    All contact information violates policy. Shipping measurements are to be ignored.
The LLM will provide a robust explanation of why it discovered the various pieces of information in the text. While useful during prompt design, a more succinct JSON-formatted output with fields for explanation, category, and confidence is more useful for downstream processing logic. To achieve this, add the following to the original prompt:
    Group findings by category and provide a confidence level for each item on a 
    scale of 1 to 5, with 5 being the highest confidence. Explain your reasoning 
    for the categorization and confidence level. Format your response as a json 
    object.
The final prompt is then entered into the Amazon Bedrock Chat/Text playground as a single prompt and run as follows:
The model response, shown in the following example, correctly identified multiple pieces of obvious and obfuscated information: 3 phone numbers, 2 business names, 2 email addresses, a mailing address, personal name, and physical characteristics.
    {
        "findings": {
            "business_name": [
                {
                    "value": "Am@z0n, Inc.",
                    "confidence": 5,
                    "reasoning": "The text explicitly states 'Am@z0n, Inc.', which is a disguised version of 'Amazon, Inc.' using the symbol '@' and zero '0' instead of the letter 'o'. This is a clear attempt to obfuscate a well-known business name, violating policy."
                },
                {
                    "value": "Whole Foods Market",
                    "confidence": 5,
                    "reasoning": "The text explicitly states 'Whole Foods Market', a known business name. This is a direct mention of a business and violates policy."
                }
            ],
            "email": [
                {
                    "value": "tylerh@anycompany.com",
                    "confidence": 5,
                    "reasoning": "The text contains a clear and properly formatted email address 'tylerh@anycompany.com'. This is a direct violation of policy."
                },
                {
                    "value": "jesseatanycompany.com",
                    "confidence": 4,
                    "reasoning": "The text contains 'jesseatanycompany.com', which is a clear attempt to disguise an email address. While it lacks the '@' symbol, the structure 'username@domain' is implied, making this a policy violation."
                }
            ],
            "phone_number": [
                {
                    "value": "321 555 0177",
                    "confidence": 5,
                    "reasoning": "The text contains '321inches 555inches 0177inches', where 'inches' is used as a delimiter to spread out the phone number '321 555 0177'. This is a clear attempt to disguise a phone number and violates policy."
                },
                {
                    "value": "123 555 0123",
                    "confidence": 5,
                    "reasoning": "The text explicitly states '123...555....0123', which can be reconstructed as the phone number '123-555-0123'. This is a direct violation of policy."
                }
            ],
            "mailing_address": [
                {
                    "value": "410 Terry Avenue North, Seattle, WA 98109",
                    "confidence": 5,
                    "reasoning": "The text contains a full, properly formatted mailing address '410 Terry Avenue North, Seattle, WA 98109'. This is a direct violation of policy."
                }
            ],
            "personal_information": [
                {
                    "value": "Tyler Huehmer",
                    "confidence": 5,
                    "reasoning": "The text explicitly states 'Tyler Huehmer', which is a full name. This is personal information and violates policy."
                },
                {
                    "value": "brown hair",
                    "confidence": 3,
                    "reasoning": "The text mentions 'brown hair', which is a physical characteristic. While not as sensitive as a name or address, it still counts as personal information and violates policy."
                },
                {
                    "value": "6'2"", "confidence": 3, "reasoning": "The text mentions '6'2"', which is a height measurement and can be considered personal information. While not as sensitive as a name or address, it still counts as personal information and violates policy."
                }
            ],
            "other": [
                {
                    "value": ":five: :five: :five:-:five: :five: :five:-:zero: :one: :one: :one:",
                    "confidence": 4,
                    "reasoning": "The text contains a sequence of emojis and colons that spell out '5-5-5-5-5-5-0-1-1-1'. This could be an attempt to disguise a phone number or other contact information. While not definitive, it is suspicious and warrants investigation, hence the medium confidence level."
                }
            ]
        }
    }
While the prompt works, let’s improve it. The [prompt optimizer](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management-optimize.html>) tool rewrites prompts to yield inference results that are more suitable for your use case and specific model. The rewritten prompts are also more readable and simpler to understand. Choose the wand icon at the bottom of the screen, circled in red in the following image, to open the prompt optimizer tool.
The optimized prompt is structured with distinct sections that clearly define the model’s task, instructions, and output format. This structure produces consistent, comprehensive, and well-organized output.
    ## Task
    You are a detective tasked with analyzing buyer and seller correspondences to identify 
    any contact information or cost details that violate policy. 
    Your goal is to be thorough and creative in detecting disguised or obfuscated contact 
    information across various categories.
    ## Instructions
    1. Carefully analyze the provided text:
    ### Text
    Hello! I agree to the terms, look me up and let's make it happen Am@z0n, Inc. 
    Congratulations. call mi 321inches 555inches 0177inches. I'm with Whole Foods Market 
    tylerh@anycompany.com. This will be $700. Will include it all in one box 12"L X 12"W x 6" 
    high under 10 lbs. Tyler Huehmer 123...555....0123. I can get that done for you 
    directly :five: :five: :five:-:five: :five: :five:-:zero: :one: :one: :one: . 
    This is a great deal jesseatanycompany.com. we can get this done by next week. 
    I've got brown hair and am 6'2" see you there. 410 Terry Avenue North, Seattle, WA 98109
    2. Look for any instances of the following categories that may contain disguised 
    or obfuscated contact information:- Phone numbers (be aggressive and creative in 
    identifying phone numbers)- Business names- Email addresses- Mailing addresses- Personal information (e.g., names, appearances)- Cost details
    3. Ignore any shipping measurements mentioned in the text.
    4. For each identified item, categorize it appropriately and provide a confidence 
    level on a scale of 1 to 5, with 5 being the highest confidence.
    5. Explain your reasoning for the categorization and confidence level assigned 
    to each item.
    6. Format your response as a JSON object, grouping the findings by category.
    7. Do not include any preamble or additional information in your response.
    Format your response as follows:{{"category_1": [{"item": "identified_item_1","confidence": confidence_level,"reasoning": "reasoning_for_categorization_and_confidence"}},...],"category_2": [...],...}
Now that our prompt successfully detects obfuscated contact information, it’s important to fine-tune and iterate prompts specifically for the model you’re evaluating and test them at scale (refer to [Amazon Bedrock Evaluations](<https://aws.amazon.com/bedrock/evaluations/>)). Additionally, consider factors such as cost, throughput, and relevant [endpoints and quotas](<https://docs.aws.amazon.com/general/latest/gr/bedrock.html>). By carefully balancing these elements, you can achieve a cost-effective and performant solution for your needs.
Detecting communication policy violations is the first step in protecting business value and remaining competitive. After identifying policy violations, we extract sentiment data to help improve supplier support and track loyalty metrics. Our prompt, developed and optimized using the Amazon Nova model best practices, analyzes these messages for sentiment indicators (refer to [Prompting best practices for Amazon Nova Models](<https://docs.aws.amazon.com/nova/latest/userguide/prompting.html>)).
    Task: Perform sentiment analysis on the given text to determine the sentiment 
    expressed towards the supplier or its apps and services, and provide a confidence 
    level for your reasoning.
    Instructions:
    1. Read and carefully analyze the text provided in <context> tags.
    2. Determine if the sentiment expressed towards the supplier is: 
    <Option_list> <Option>Positive</Option> <Option>Neutral</Option> <Option>Negative</Option> </Option_list>
    3. Provide a brief explanation, maximum 20 words, to justify your 
    sentiment analysis and confidence level.
    4. Provide your sentiment analysis result in the following JSON format: 
    {{"Sentiment": "<Your chosen sentiment option>", "Confidence": <A number between 0-100 representing your confidence level>, "Reason": "<Your brief explanation
    Text to analyze: <context>Dimensions are 4' x 4' x 2'. Brokerage app sucks, trying to get stage updated and cannot save.</context>
    Provide your response immediately without any preamble.
The final prompt is then entered into the Amazon Bedrock Chat/Text playground and run:
The results indicate that the overall sentiment is negative and suggests that there are problems or enhancements required to the messaging app:
    {
        "Sentiment": "Negative",
        "Confidence": 90,
        "Reason": "Words 'sucks' and 'cannot save' indicate clear dissatisfaction with the app."
    }
We analyzed supplier messages for actionable insights, helping brokerage teams identify intervention opportunities, remove blockers, and improve services. Using the prompt, Amazon Bedrock extracts this data for a backend ticketing system. This system then routes issues to customer care for immediate action or to the product team for potential feature development.
    Our final optimized prompt for detecting actionable insights:
    Task: Perform analysis on the given text to determine if there are any action items 
    pending that may require the brokerage to investigate.
    Instructions:
    1. Read and carefully analyze the text provided in <context> tags.
    2. Determine if there are any action items
    3. Provide a brief explanation, maximum 20 words, to justify your analysis and 
    confidence level.
    4. Provide your analysis result in the following JSON format:
    {
    {
    "Action": "<Action Required>",
    "Confidence": <A number between 0-100 representing your confidence level>,
    "Reason": "<Your brief explanation>"
    }
    }
    Text to analyze: <context>Dimensions are 4' x 4' x 2'. Brokerage app sucks, 
    trying to get stage updated and cannot save.</context> Provide your response 
    immediately without any preamble.
The final prompt is then entered into the Amazon Bedrock Chat/Text playground and run:
The results indicate an issue with the brokerage app. This information can then be used to create a support ticket that can be tracked through resolution.
    {
        "Action": "Investigate brokerage app issue",
        "Confidence": 95,
        "Reason": "User reports inability to save stage updates, indicating a functional problem."
    }
We stored the final prompts (`PolicyViolations`, `SentimentAnalysis`, `ActionItems` Analysis) in [Amazon Bedrock Prompt Management](<https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html>) with version control. This approach allows development teams to update prompts without affecting message orchestration already running in production. This feature also enables you to reuse effective prompts across multiple processes.
## Conclusion
Real-world testing demonstrated generative AI’s advantage over traditional regex methods. When tested on a small sample of 10 actual brokerage messages, the generative AI prompt approach achieved 100% accuracy in identifying obfuscated contact information. This capability can extend across many types of communications, from simple customer inputs like cancellations and feedback to sophisticated broker orchestration.
While regex is sufficient for structured patterns, generative AI offers:
  1. Contextual understanding: Detects disguised information across messages.
  2. Adaptability: Identifies evolving evasion techniques without constant updates.
  3. Multi-dimensional analysis: Assesses sentiment, action items, and policy violations.
  4. Confidence scoring: Enables nuanced decision-making.
  5. Natural language processing: Interprets variations like leetspeak and context-dependent references.
By incorporating applications with generative AI capabilities using services such as Amazon Bedrock, developers can build robust and future-proof solutions to help protect company interests in modern digital communications.
## Next steps
After developing quality user prompts, integrate them into your existing workflows using the Amazon Bedrock API. This integration enables real-time inference calls across multiple use cases, including form submissions and data processing. For implementation instructions, visit [Making a request to Amazon Bedrock via Amazon API Gateway](<https://serverlessland.com/patterns/apigw-lambda-bedrock-js-sam?ref=search>).
Complex AI implementations often require multiple model inferences, system updates, and stakeholder communications. AWS Step Functions orchestrates these Amazon Bedrock model interactions by coordinating multiple workflow processes, managing error handling, and enabling parallel execution capabilities. This integration allows communication with external systems while maintaining built-in safeguards like automatic retries. For more information, see [Build generative AI apps using AWS Step Functions and Amazon Bedrock](<https://aws.amazon.com/blogs/aws/build-generative-ai-apps-using-aws-step-functions-and-amazon-bedrock/>).
Amazon EventBridge functions as an event router to orchestrate complex workflows across AWS services. It uses defined patterns and schedules to route events, enabling automated responses to business events, system changes, and time-based triggers. This event-driven architecture streamlines application communication and workflow management. For implementation details, refer to [Building an event-driven application with Amazon EventBridge](<https://aws.amazon.com/blogs/compute/building-an-event-driven-application-with-amazon-eventbridge/>).
Amazon Bedrock AgentCore enables developers to create autonomous AI systems through its Agents SDK. This integration uses Strands to separate workloads, helping enhance both performance and security. The system delivers three core capabilities: automated model training, simplified deployment, and built-in scalability. Developers can implement real-time data processing and security protocols to facilitate reliable agent operations. To begin building with Amazon Bedrock AgentCore, visit [Securely launch and scale your agents and tools on Amazon Bedrock AgentCore.](<https://aws.amazon.com/blogs/machine-learning/securely-launch-and-scale-your-agents-and-tools-on-amazon-bedrock-agentcore-runtime/>)
* * *
## About the authors
### Tyler Huehmer
Tyler Huehmer serves as a Senior Solutions Architect at AWS, where he partners with large-scale ecommerce customers to optimize their cloud infrastructure. He specializes in serverless computing, event-driven architecture, and building resilient systems that withstand the demands of modern commerce. Tyler’s passion lies in unifying distributed teams to tackle complex challenges.
### Jesse Baker
Jesse was a Solutions Architect for Amazon Web Services with an ongoing passion for modern application design and creative solutions. Outside of work, he enjoys exploring new places, hiking and wandering through nature.