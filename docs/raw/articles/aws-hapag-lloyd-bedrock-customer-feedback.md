---
title: "aws hapag lloyd bedrock customer feedback"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/how-hapag-lloyd-uses-amazon-bedrock-to-transform-customer-feedback-into-actionable-insights/
tags: [aws-china-blog, agentic-ai]
ingested: 2026-05-08
feed_name: AWS China ML
source_published: 2026-05-05T16:55:42Z
sha256: 0efc81201962
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# How Hapag-Lloyd uses Amazon Bedrock to transform customer feedback into actionable insights
[Hapag-Lloyd](<https://www.hapag-lloyd.com/en/home.html>) stands as one of the world’s leading liner shipping companies, operating a modern fleet of 313 container ships with a total transport capacity of 2.5 million TEU (Twenty-foot Equivalent Unit—a standard unit of measurement for cargo capacity in container shipping). The company maintains a container capacity of 3.7 million TEU, which includes one of the industry’s largest and most modern fleets of reefer containers. With approximately 14,000 employees in the Liner Shipping Segment and more than 400 offices spread across 140 countries, Hapag-Lloyd maintains a robust global presence. Through 133 liner services worldwide, we facilitate reliable connections between more than 600 ports across the continents.
The company’s Digital Customer Experience and Engineering team, distributed between Hamburg and Gdańsk, drives digital innovation by developing and maintaining customer-facing web and mobile products.
Over the past years, the Digital Customer Experience and Engineering team has evolved from a delivery-focused channel into a true digital product driver, with strong customer focus, engineering excellence, and measurable business impact. We take end-to-end ownership of our digital products, combining customer-centric innovation with engineering craft to directly support growth and business outcomes. Building on a modern, independently owned tech stack and a high level of engineering maturity, we are committed to staying at the forefront of technology. Now, we are taking the next step by moving toward becoming AI-native, investing heavily in artificial intelligence as a core capability. This journey is about amplifying powerful engineering with AI to build smarter products, faster innovation, and greater customer value.
## **Understanding user impact.**
So far, our customer feedback analysis process had largely been manual and reactive. Especially ahead of review ceremonies, manually analyzing customer feedback could take hours, sometimes days, when hundreds of ratings and comments needed to be reviewed. Every two weeks, Product Managers exported customer feedback data as CSV files, read through large volumes of comments, and manually categorized sentiment and themes. Although this work was valuable and deeply connected to product decisions, it was also repetitive, time-consuming, and difficult to scale, limiting flexibility whenever faster or deeper insights were needed.
With our generative AI solution, we fundamentally changed this approach. Instead of manually aggregating and interpreting feedback, we now automate the entire workflow: collecting customer comments, extracting sentiment, identifying themes, and surfacing actionable insights. Product Managers and teams can focus less on operational analysis and more on strategy, innovation, and creating exceptional user experiences.
In this post, we walk you through our generative AI–powered feedback analysis solution built using [Amazon Bedrock,](<https://aws.amazon.com/bedrock/?nc1=h_ls>) [Elasticsearch](<https://aws.amazon.com/what-is/elasticsearch/?nc1=h_ls>), and open-source frameworks like [LangChain](<https://python.langchain.com/docs/introduction/>) and [LangGraph](<https://www.langchain.com/langgraph>). Amazon Bedrock is a fully managed service that offers a choice of high-performing foundation models from leading AI companies such as AI21 Labs, Anthropic, Cohere, DeepSeek, Luma, Meta, Mistral AI and Amazon through a single API, along with a broad set of capabilities you need to build generative AI applications with security, privacy, and responsible AI. With this solution, you can automatically ingest customer comments, generate rich summaries, and deliver targeted insights. This allows our product teams to make faster, smarter decisions and drive continuous improvement.
We walk you through the architecture and implementation of this solution, demonstrating how using generative AI foundations, such as orchestration, data management, security, and privacy, allowed us to rapidly build a scalable, production-ready feedback processing pipeline.
## **Solution overview**
AWS architecture for automated feedback processing and analysis, utilizing Lambda functions for data ingestion from Amazon S3, Amazon Bedrock for AI-powered insights accessed by stakeholders via Amazon ECS, and Elasticsearch for indexing and querying feedback data with email notifications via SES.
The solution is built on AWS architecture designed to address these challenges through scalability, maintainability, and security. It is deployed by using [AWS CloudFormation](<https://aws.amazon.com/cloudformation/>).
  1. **Continuous & Quarterly Feedback Collection**
     * Our web and mobile applications serve hundreds of thousands of customers each month.
     * Users can leave a rating plus text comments, helping us understand user experience and improve services.
  2. **Daily Feedback Ingestion & Processing**
     * A [AWS Lambda](<https://aws.amazon.com/lambda/>) function runs once per day to fetch the new feedback entries.
     * We use Amazon Bedrock to c**lassify sentiment** (positive, negative, mixed, or neutral) for each open comment, streamlining downstream analysis.
     * Processed records are indexed in Amazon OpenSearch Service, serving both as our full-text search engine and vector database.
  3. **Interactive feedback exploration via OpenSearch Service**
     * Stakeholders can access real-time feedback insights through OpenSearch Dashboards, giving them a bird’s-eye view of user sentiment, ratings, and trends over time.
     * Starting with high-level visualizations, such as sentiment distribution, rating scores, and feedback volume, users can drill down into specific applications, features, or even individual comments.
     * Dashboards support filtering by time period, comment sentiment, product version, and more, enabling targeted root cause analysis.
     * For example, a Product Manager can visualize how sentiment around a recent app update changed week over week, or zoom into negative comments mentioning a specific feature.
  4. **AI-Powered Internal Chatbot**
     * Our stakeholder-facing chatbot queries the OpenSearch index as its knowledge base.
     * We use [Bedrock Guardrails](<https://aws.amazon.com/bedrock/guardrails/>), to enforce safety and reliability and make sure responses align with our brand and compliance standards.
     * Product managers and support teams can ask natural-language questions, for example, “What pain points do customers mention most often?” and receive instant, context-rich answers.
  5. **Biweekly Insights Report**
     * Every two weeks, a second Lambda function aggregates and analyzes the latest feedback trends.
     * It generates a concise report with key metrics, highlights, and sentiment breakdowns.
     * The report is automatically delivered to our Product Managers and Product Owners, feeding directly into sprint planning and roadmap discussions.
### **Generative AI Orchestration**
Orchestration is a core foundation of our solution, because generative AI workflows typically involve multiple steps that need to be coordinated. In our pipeline, data ingestion and processing steps, such as sentiment analysis, embedding generation, and indexing, are orchestrated using LangChain, which provides modular, reusable components for calling models, transforming data, and integrating with external systems like Amazon OpenSearch Service. For our internal chatbot, we rely on LangGraph to implement a multi-agent architecture. Each assistant is defined declaratively in LangGraph, encapsulating its own logic and tools. This design makes assistants flexible and composable: instead of rigid step-by-step flows, we use an agent-based approach where an LLM selects the right tools and actions dynamically to answer user queries. This gives product managers and support teams a natural, interactive way to explore feedback and related operational insights.
Integration with Amazon Bedrock models is straightforward using LangChain’s native support. For example, our AI-powered internal chatbot uses the Claude Sonnet 4.6 model via Amazon Bedrock. We chose Claude Sonnet 4.6 because it offers frontier performance across coding and agentic workflows. The model excels in multi-turn conversational exchanges and agentic workflows, making it ideal for our internal chatbot that requires reliable performance across single and multi-turn interactions with stakeholders. With its precise workflow management capabilities and ability to serve in both lead agent and subagent roles, Claude Sonnet 4.6 delivers the consistent conversational quality our product managers and support teams need when exploring feedback insights at scale. Additionally, we leverage geographic [Cross-Region Inference Service](<https://docs.aws.amazon.com/bedrock/latest/userguide/geographic-cross-region-inference.html>) (CRIS) endpoint to seamlessly manage unplanned traffic bursts by distributing compute across multiple EU AWS Regions. This cross-region capability ensures our feedback processing pipeline remains resilient during peak usage periods while maintaining consistent performance for our global stakeholder base. The model is configured with guardrails applied directly through LangChain configuration:
    from langchain_aws import ChatBedrockConverse
    def get_chatbot_model():
        return ChatBedrockConverse(
            client=session.client("bedrock-runtime", region_name="eu-central-1", config=config),
            model="eu.anthropic.claude-sonnet-4-6",         guardrail_config={
                "guardrailIdentifier": settings.GUARDRAIL_ID,
                "guardrailVersion": "DRAFT",
                "trace": "enabled"
            }
        )
### **Data Management**
An [AWS Lambda](<https://aws.amazon.com/lambda/>) function runs once per day to fetch the new feedback entries from the feedback repository into [Amazon S3](<https://aws.amazon.com/s3/>), after which the data is categorized with semantic detection through Amazon Bedrock. The data is then indexed in Amazon OpenSearch Service, serving both as our full-text search engine and vector database.
### **Responsible AI**
To responsibly use the solution, we implement safeguards using Amazon Bedrock Guardrails. This allows us to attach **Amazon Bedrock Guardrails** to an AI interaction and enforce content moderation policies and make sure responses align with our brand and compliance standards.
Using AWS CloudFormation, we define guardrail policies as infrastructure-as-code, providing examples of configurations to help block harmful content.
### **Guardrails as Code: CloudFormation**
    ChatbotGuardrail:
      Type: AWS::Bedrock::Guardrail
      Properties:
        Name: guardrail
        Description: Basic guardrail to block violence and harmful content.
        BlockedInputMessaging: "Input blocked by safety policy."
        BlockedOutputsMessaging: "Response blocked by safety policy."
        WordPolicyConfig:
            ManagedWordListsConfig:
              - Type: PROFANITY
        ContentPolicyConfig:
            FiltersConfig:
                - Type: HATE
                  InputStrength: HIGH
                  OutputStrength: HIGH
                  OutputAction: BLOCK
                - Type: INSULTS
                  InputStrength: HIGH
                  OutputStrength: HIGH
                  OutputAction: BLOCK
                - Type: SEXUAL
                  InputStrength: HIGH
                  OutputStrength: HIGH
                  OutputAction: BLOCK
                - Type: VIOLENCE
                  InputStrength: HIGH
                  OutputStrength: HIGH
                  OutputAction: BLOCK
                - Type: MISCONDUCT
                  InputStrength: HIGH
                  OutputStrength: HIGH
                  OutputAction: BLOCK
                - Type: PROMPT_ATTACK
                  InputStrength: NONE
                  OutputStrength: NONE
                  OutputAction: BLOCK
### **Programmatic Input Validation**
We also use Amazon Bedrock Guardrails independently to validate raw user input before passing it to the LLM, helping prevent prompt injection and other misuse:
    def validate_question_with_guardrail(question: str, user_data: UserData) -> bool:
        client = boto3.client('bedrock-runtime')
        response = client.apply_guardrail(
            guardrailIdentifier=settings.GUARDRAIL_ID,
            guardrailVersion='DRAFT',
            source='INPUT',
            content=[{'text': {'text': question}}]
        )
        if response.get("action") == "GUARDRAIL_INTERVENED":
            print(json.dumps(response, indent=4))
            print(
                f"Prompt was blocked. user_id=[{user_data.user_id}] question=[{question}]"
            )
            return False
        return True
With this setup, we have created a more secure, scalable, and explainable pipeline that puts Generative AI to work, responsibly and effectively, across our product feedback lifecycle.
## **Monitoring**
We monitor the parts of the application using Amazon CloudWatch, which collects raw data and processes it into readable, near real-time metrics. We enabled model invocation logging to collect invocation logs, model input data, and model output data for the invocations, enabling collection of full request data, response data, and metadata associated with the calls. Amazon Bedrock also integrates with AWS CloudTrail, which captures API calls for Amazon Bedrock as events. This generates insights that you can use to optimize the applications further like improving response latency or reducing costs.
## **Next Steps**
The solution processes over 15,000 feedback items per month with an accuracy of 95% for sentiment classification on a labeled test dataset. Instead of spending hours reviewing raw feedback, teams can now receive clear, structured summaries in seconds that highlight the most important topics and recurring signals. This helps them move from information to action much faster, making decisions within days rather than weeks. Over time, the reports helped us understand not only when sentiment improved, but also why it didn’t. By continuously monitoring customer feedback, we can react quickly to early signals, adjust decisions, and correct course when needed. In several areas, actions taken based on these insights have already resulted in more positive comments and a noticeable reduction in negative feedback. A strong example is the “Preview” functionality in Shipping Instructions. This feature was prioritized directly in response to a high volume of negative user feedback highlighting the lack of a preview capability. After its release, AI-driven reports allowed us to track user reactions in detail. Feedback related specifically to this feature showed that the previously frequent requests for preview capability were effectively resolved, demonstrating that the core user need had been successfully addressed. At the same time, broader feedback continued to surface other areas for improvement across the application. AI insights also guided future feature planning and prioritization. Based on user comments, we created new OpenSearch Service-based dashboards that help teams quickly verify and analyze issues reported by users. Another example is the ability to upload cargo data via Excel files, a repeatedly requested feature highlighted by AI recommendations. This functionality is now fully available and is expected to significantly reduce manual effort, particularly for large shipments. During review sessions, the stakeholders can now see top positive and negative comments in real time, alongside AI-generated recommendations, creating a far more informed and productive discussion.
This feedback analysis solution is one example of how we are applying generative AI across our processes, and it marks the beginning, not the end, of our AI-native journey. Under our **AI-Native Umbrella Program** , which serves as a single source of truth for AI adoption, our next focus is to establish a shared, robust AI foundation with Amazon Bedrock. By providing standardized infrastructure, security, and guardrails, we aim to enable every role in the department, engineering, product and delivery (PM, PO, SM), UX/design, and operations/support, to create their own AI “spaces” safely and independently while having access to the best in-class foundation models. This setup is designed to lower the barrier to experimentation, streamline discovery, and encourage hands-on exploration of generative AI use cases in day-to-day work. In doing so, we help teams move faster from ideas to impact, while maintaining consistency, responsibility, and scalability across the AI initiatives.
If you want to scale your generative AI applications, you can get started by reading this [Architect a mature generative AI foundation on AWS](<https://aws.amazon.com/blogs/machine-learning/architect-a-mature-generative-ai-foundation-on-aws/>) that dives deeper on the various foundational components that help accelerate the end-to-end generative AI application lifecycle.
* * *
## About the authors
### Aamna Najmi
[Aamna](<http://www.linkedin.com/in/aamnanajmi>) is a Senior Specialist Solutions Architect for Generative AI focusing on Anthropic models and operationalizing and governing generative AI systems at scale on Amazon Bedrock. She helps ISVs solve their challenges, embrace innovation, and create new business opportunities with Amazon Bedrock. In her spare time, she pursues her passion of experimenting with food and discovering new places.
### Anna Rysicka
Anna is a Software Engineer Team Leader at Hapag-Lloyd with over 10 years of experience in the technology industry. She works with the Documentation & Customs Team, focusing on shipment documentation systems including Shipping Instructions and Bill of Lading solutions. She specializes in modern frontend architectures, TypeScript/Vue.js, and user experience design, with a passion for problem-solving and leveraging AI as a collaborative tool for task management and productivity. As part of the DXE AI Native initiative, Anna guides teams into the AI era with tools and motivation to enhance productivity. In her spare time, she experiments with AI projects, enjoys painting, and loves traveling.
### Grzegorz Kaczor
Grzegorz is a Cloud Architect at Hapag-Lloyd and a technology enthusiast with over 18 years of experience in the tech industry. He specializes in leveraging advanced technologies to deliver innovative solutions for organizations. His background spans serverless architectures, security, observability, and compliance posture management. He is currently exploring generative AI and its practical applications in enterprise environments. In his spare time, he enjoys learning, staying active, and spending time with his daughters.