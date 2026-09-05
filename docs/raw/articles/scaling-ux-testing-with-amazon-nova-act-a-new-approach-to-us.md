---
title: "Scaling UX Testing with Amazon Nova Act"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/scaling-ux-testing-with-amazon-nova-act-a-new-approach-to-user-flow-analysis
ingested: 2026-07-24
feed_name: AWS China ML
source_published: 2026-07-14
sha256: 80ce3223d41eb07ffdf7b89db6cca305719e1cf962d5cfcb7e56cdb961842712
---

# Scaling UX testing with Amazon Nova Act: A new approach to user flow analysis

User experience (UX) testing faces multiple challenges that limit an organization’s ability to improve how users interact with their platforms. UX testing evaluates how easily and effectively users can navigate digital interfaces to complete intended tasks, such as finding products, creating accounts, or completing purchases. Unlike traditional Quality Assurance (QA) testing that focuses on functional bugs, UX testing examines user workflows to identify navigation friction and interface elements that impact user satisfaction. Manual testing doesn’t scale. Testers can only evaluate a limited number of user journeys, often focusing on critical paths while edge cases remain unexplored. Further, traditional automation tools require hard-coded scripts that break whenever interfaces change, creating maintenance overhead that limits test coverage. Meanwhile, comprehensive testing across diverse user journeys, device types, and interaction patterns remains prohibitively costly and time-consuming for most organizations.

[Amazon Nova Act](<https://aws.amazon.com/blogs/aws/build-reliable-ai-agents-for-ui-workflow-automation-with-amazon-nova-act-now-generally-available/?trk=33dc490e-0fb2-4cb1-a521-3941c13b64c0&sc_channel=ps>) offers a different approach to these challenges. Nova Act is a multimodal foundation model that can understand and interact with web browser interfaces through vision and action. Unlike scripting tools that rely on predefined element selectors, Nova Act navigates websites intelligently by processing visual information. It analyzes screenshots of web pages just as a human tester would. This makes Nova Act a powerful tool for automated UX testing because it mimics human reasoning when navigating interfaces. The model examines screenshots to understand page layout, identifies interactive elements through visual cues, and makes contextual decisions about which actions to take next. This visual understanding allows Nova Act to adapt to interface changes and handle dynamic content that would break traditional automation tools like Selenium or Playwright. Amazon Nova Act’s reasoning and chain of thought logs provide valuable insight into website design and intuitiveness.

Using generative AI enables parallel execution of comprehensive user flow testing at scale. This solution demonstrates how to build a cloud-deployed UX testing platform that automatically generates test scenarios from documentation, executes user flows at scale using the intelligent navigation capabilities of Nova Act, and provides actionable insights through automated analysis.

## Solution overview

The following diagram highlights a four-part solution, starting with documentation processing and flow discovery and ending with final analysis.  
  
The solution is composed of the following layers:

**Documentation processing layer** – The foundation layer handles test scenario generation:

  * [Amazon Simple Storage Service](<https://aws.amazon.com/pm/serv-s3/>) (Amazon S3) stores your site documentation, user guides, and flow testing specifications. This unstructured content provides the generative AI-powered flow discovery engine with context about your site and how you expect users to interact with it.
  * This documentation is ingested into an [Amazon Bedrock Knowledge Base](<https://aws.amazon.com/bedrock/knowledge-bases/>) for semantic similarity search.
  * [AWS Lambda](<https://aws.amazon.com/lambda/>) uses Claude 4.5 Sonnet in [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) to transform user flows into comprehensive testing scenarios. The system takes a list of tasks, like buying a coffee maker via search or adding a new credit card to your account via the settings menu. For each task, it retrieves relevant information from the knowledge base to understand how to accomplish it on your site. Claude then generates detailed test instructions at multiple levels of granularity, creating the step-by-step interaction paths for Amazon Nova Act to test.



**Orchestration layer** – The orchestration layer manages test execution at scale:

  * [Amazon DynamoDB](<https://aws.amazon.com/dynamodb/>) stores generated test flows with metadata and execution parameters.
  * Amazon DynamoDB Streams triggers batch processing when new flows are available.
  * AWS Lambda functions coordinate test execution and spin up [Amazon Elastic Container Service](<https://aws.amazon.com/ecs/>) (Amazon ECS) tasks for parallel processing.



**Execution layer** – The execution layer runs intelligent user flow testing:

  * Amazon ECS with [AWS Fargate](<https://aws.amazon.com/fargate/>) provides scalable, serverless compute for parallel test execution.
  * Amazon Nova Act agents execute user flows in parallel browser sessions.
  * Real-time interaction logging captures detailed behavioral data for analysis.



**Analysis layer** – The analysis layer transforms test results into metrics:

  * Amazon S3 stores detailed execution chain of thought reasoning logs, screenshots, and behavioral data.
  * AWS Lambda processes results using Amazon Bedrock to analyze flow execution patterns, calculate usability scores, and identify friction points across different instruction granularity levels.
  * Amazon DynamoDB stores the analysis results.
  * The dashboard is presented in a React application.



This architecture introduces three critical generative AI-powered capabilities: an optional intelligent flow discovery from unstructured documentation using Amazon Bedrock Knowledge Base, Nova Act computer use for website testing, and automated results analysis that identifies UX patterns and friction points to inform strategic decisions.

## Setup guide

Before deploying the solution, verify you have the following:

  * [Node.js](<https://nodejs.org/en/download>) v20 or newer.
  * [npm](<https://docs.npmjs.com/downloading-and-installing-node-js-and-npm>) v10.8 or newer.
  * An [AWS account](<https://signin.aws.amazon.com/signup?request_type=register>).
  * The AWS Cloud Development Kit (AWS CDK) set up (for prerequisites and installation instructions, see [Getting started with the AWS CDK](<https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html>)).



### Deployment process

The complete solution and deployment instructions are available in the [aws-samples GitHub repository](<https://github.com/aws-samples/sample-nova-act-ux-testing>).

The solution uses AWS CDK to automate infrastructure deployment:
    
    
    git clone git@github.com:aws-samples/sample-nova-act-ux-testing.git
    cd nova-act-ux-testing
    cp template.env .env
    # Add your Nova Act API key in .env
    # Deploy the solution
    ./deploy.sh

Take note of the outputs printed when the stack deployment is complete. You will need those in the following steps.

## Using the solution

After deployment, you have a few options for creating test flows: automatic generation from documentation, manual flow definition, or a hybrid approach. We suggest the hybrid approach combining the two approaches that we cover: using automatic generation to establish baseline coverage from existing documentation, then supplementing with manually defined flows for specific test cases, new features, or edge scenarios that require precise control.

### Option 1: Automatic flow generation from documentation

The solution uses a Lambda function integrated with Claude 4.5 Sonnet to convert user tasks into detailed testing workflows. To use this system effectively, identify your top user flows and provide them as input, ensuring you include multiple ways of achieving the same goal. For example, if purchasing a coffee maker is a key user journey, include both the search-based approach and the menu navigation method as separate tasks. The system processes each task by consulting the knowledge base to learn the specific implementation details of your website, understanding how these actions are performed within your unique site architecture.

The system then produces testing instructions across three levels of detail, ranging from high-level user goals down to granular step-by-step procedures. Where a basic instruction might state “purchase a highly-rated stainless steel coffee maker,” the detailed version expands this into precise actions like selecting kitchen appliances from the menu, applying material and rating filters, and completing the checkout sequence. For more information, see `lambda/flow_discovery/index.py`.

  1. **Upload documentation** : Place your application documentation, user guides, and flow specifications in the designated S3 bucket. You can find the S3 bucket URL using the CDK stack deployment outputs. The system supports various document formats including user manuals and guides, feature specifications, common user journey docs, and existing test case documentation.
  2. **Upload task specification:** Place your `tasks.json` file in the S3 bucket starting with `uxflowteststack-tasksbucket`. See the project README for the expected JSON format. This will trigger flow discovery.
  3. **Wait for processing** : Processing happens asynchronously after upload. The flow discovery component analyzes your documentation to identify potential user flows and converts them into executable test scenarios. To track processing status, you can review the Lambda processing logs.
  4. **Review generated flows** : Generated flows appear in the DynamoDB table and become available for execution after processing completes.



### Option 2: Manual flow definition

For precise control over test scenarios or when you have specific flows not covered in documentation, you can manually define custom flows by inserting them directly into the DynamoDB table. You can find the table name in the stack outputs. This approach is ideal for testing specific edge cases, validating new features before documentation exists, and testing flows that require specific user context or data. See the README for the required JSON schema.

Key components:

  * `flow_id`: Unique identifier for tracking and results correlation.
  * `starting_url`: The webpage where the test flow begins.
  * `instructions`: Array of natural language steps for Nova Act to execute.
  * `method_name`: Represents a different method to completing a task, such as using the search versus navigation.
  * `gran_n`: Represents a different level of instruction granularity, ranging from high-level instructions like “buy a stainless steel toaster with good ratings via the search” to step-by-step versions.



## Customizing the solution

For applications requiring user authentication, you can configure persistent browser sessions to maintain logged-in states across test runs. This removes the need to re-authenticate for each test execution and enables testing of authenticated user flows. When your tests need to extract structured data from web pages, such as validating form submissions or capturing dynamic content, Nova Act supports Pydantic schemas for reliable data extraction. Nova Act also handles file operations, so you can test upload workflows and validate downloaded content.

Here’s an example of configuring persistent authentication. You can find and modify the Python code that runs the Nova Act flows in Amazon ECS at `ecs/ecs_act_headless/app.py`.
    
    
    with NovaAct(
        starting_page="https://yourapp.com/purchase",
        user_data_dir="/tmp/authenticated-session",
        clone_user_data_dir=False
    ) as nova:
        # Your authenticated test flows run here
        nova.act("search for bananas")
        nova.act("purchase 2 bunches")

For detailed implementation of structured data extraction with Pydantic schemas, file upload/download handling, and authentication setup, refer to the [Nova Act SDK documentation](<https://github.com/aws/nova-act>).

## Execution results

The solution generates the following results for each test execution and stores them in Amazon S3. You can find the raw results in the `flow-test-results-bucket`.

  1. **Summary metrics** (`results_summary.json`):



Each test execution generates a summary file containing high-level metrics about the flow execution. The summary includes duration of each step, number of actions required, success/failure status, and any extracted data.
    
    
    {
        "flow_id": "ecommerce_purchase_flow",
        "batch_id": "batch_12345",
        "timestamp": "2026-07-01T20:50:01.811454",
        "results": [
            {
                "instruction": "search for desk lamp",
                "response": null,
                "metadata": {
                    "num_steps": 3,
                    "duration": 17.57,
                    "success": true
                }
            },
            {
                "instruction": "select the first result",
                "response": null,
                "metadata": {
                    "num_steps": 2,
                    "duration": 11.1,
                    "success": true
                }
            },
            etc...
        ]
    }

  2. **Detailed interaction logs** : The Amazon Nova Act SDK generates detailed HTML reports showing screenshots of what Nova Act observed, the decision-making process and reasoning, and specific actions taken (clicks, scrolls, form inputs).



|   
---|---  
  
## 

## Analysis methods

The Lambda function processes raw execution results and computes metrics across different abstraction layers to calculate raw counts, infrastructure-adjusted signals, and composite quality scores. These metrics power a React dashboard built for multiple audiences and use cases.

The dashboard is organized into different tabs. For example, the **Overview** tab presents the overall health of the test run, with a dedicated error-adjusted panel that separates infrastructure failures from true agent failures. The **Performance & Efficiency **tab breaks down step and flow timing by granularity level, showing how the level of instruction detail affects the quality of the user experience being tested.

The following screenshots show a few key metrics.

## Clean up

To clean up the solution run the following command:
    
    
    cdk destroy

## Conclusion

UX testing traditionally requires significant time and resources, often limiting how thoroughly teams can validate their interfaces. This Amazon Nova Act solution addresses these constraints by automating test execution at scale.

The combination of the Nova Act intelligent browser interaction capabilities and scalable cloud infrastructure creates a new pattern for UX testing. With this pattern, comprehensive flow testing, interface validation, and data-driven UX decisions become practical at scale. Teams can now test more user journeys, catch issues earlier, and iterate faster on their user experiences.

Teams can use the Nova Act automation to test every new feature and interface change thoroughly before release. Instead of limited sample testing, teams can validate entire user journeys across different devices and scenarios. This comprehensive testing approach helps catch UX issues early while reducing both testing costs and time spent manually validating changes.

## Learn more

To learn more, refer to the following resources:

  * [Introducing Amazon Nova Act](<https://labs.amazon.science/blog/nova-act>).
  * [Amazon Nova Act home page](<https://nova.amazon.com/act>).
  * [Amazon Nova Act Python SDK](<https://github.com/aws/nova-act>).
  * [Amazon Nova Act SDK (preview): Path to production for browser automation agents](<https://aws.amazon.com/blogs/machine-learning/amazon-nova-act-sdk-preview-path-to-production-for-browser-automation-agents/>).



* * *

## About the authors

### Reilly Manton

Reilly is a Solutions Architect in AWS Telecoms based in New York, specializing in multimodal generative AI and agentic systems. He focuses on helping customers bring emerging AI capabilities into production, with a particular interest in interoperability protocols and large-scale agentic architectures. Outside of work, Reilly is an avid runner and enjoys contributing to open-source projects.

### Pablo Forero

Pablo is a Solutions Architect in the Telco IBU at AWS, specializing in GenAI/ML and data analysis applications and use cases. With a diverse background in music, psychology, and philosophy, Pablo brings a unique perspective to his work. When he’s not helping customers architect innovative solutions, you can find him tinkering with home robotics, 3D printing, and playing guitar.

### Wesley Petry

Wesley is a Solutions Architect in AWS Telecoms based in the NYC area. He specializes in building and designing generative AI and agentic systems, with a background in serverless and edge computing. Wesley works closely with customers to design AI-powered solutions and is passionate about turning emerging technology into production-ready architectures. Outside of customer engagements, he enjoys speaking at industry events and contributing reference implementations that help other builders get started.

### Vanitha

Vanitha is a Sr. Specialist Solution Architect based in Chicago, specializing in innovative Generative AI and data analytics solutions. She focuses on helping retail and Telco industry organizations harness the power of advanced AI technologies to transform their operations. When she’s not helping customers architect innovative solutions, you can find her teaching or building personal projects creating UI solutions for day-to-day operations. She has over 28 years of experience in technology and cloud architecture, having led various migration and modernization efforts throughout her career. Her current focus is on building production-grade generative AI and analytic solutions — enabling customers to adopt these technologies through hands-on POCs and strategic guidance.
