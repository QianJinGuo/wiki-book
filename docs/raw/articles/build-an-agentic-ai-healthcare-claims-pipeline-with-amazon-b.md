sha256: 661e4fc3ca640636f2e80281858344f1ad71587fdfc371fcdcf6001f250193cb
---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/build-an-agentic-ai-healthcare-claims-pipeline-with-amazon-bedrock-and-aws-healthlake/
ingested: 2026-06-30
feed_name: AWS China ML
source_published: 2026-06-29T17:36:34Z
---

# Build an agentic AI healthcare claims pipeline with Amazon Bedrock and AWS HealthLake

Manually processing paper-based forms remains a significant cost in the healthcare industry. Despite advancements in data extraction of scanned documents and images, human oversight is usually still needed. Entry error by the individual creating the form or lower-confidence extractions from the digitization still must be remediated.

In this post, we show you how to build an automated claims processing pipeline using two key Amazon Bedrock capabilities: [Amazon Bedrock Data Automation](<https://aws.amazon.com/bedrock/bda/>) for intelligent document extraction from healthcare claim forms, and [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>) for hosting an AI agent that validates and transforms the extracted data into FHIR (Fast Healthcare Interoperable Resources) resources in [AWS HealthLake](<https://aws.amazon.com/healthlake/>). You will learn how to combine these services to create an end-to-end workflow that reduces manual processing while maintaining accuracy through automated validation checks.

## Solution overview

The solution demonstrates an automated workflow for processing healthcare claim forms using AI-powered services. When a healthcare provider uploads a CMS-1500 claim form (in PDF format) to an Amazon Simple Storage Service (Amazon S3) bucket, it triggers a processing pipeline starting with [AWS Lambda](<https://aws.amazon.com/pm/lambda/>) that performs three main functions:

  1. Amazon Bedrock Data Automation extracts structured data from the form using intelligent document processing.
  2. An AI agent using [Strands Agents](<https://strandsagents.com/>) running on Amazon Bedrock AgentCore validates this data against existing patient and provider records in AWS HealthLake, checking for completeness and consistency.
  3. If all validations pass, the agent creates a standardized FHIR claim resource in HealthLake. It also generates a technical summary for claims processors and a patient-friendly explanation of the claim status. Both go out as Amazon Simple Notification Service (Amazon SNS) [notifications](<https://aws.amazon.com/sns/>).



This automated workflow helps reduce manual processing time while maintaining accuracy through AI-assisted validation.

_Figure 1: An architectural view of the solution._

The preceding diagram illustrates the following steps:

  1. A submitter uploads a claim document to Amazon S3.
  2. AWS Lambda gets triggered when the file arrives.
  3. Amazon Bedrock Data Automation extracts the information from the document and outputs the result in JSON format.
  4. AWS Lambda then calls AgentCore and passes the document for processing.
  5. AgentCore queries AWS HealthLake, creates the claim, and creates a summary JSON response.
  6. AWS Lambda invokes Amazon SNS to deliver an error response or a success response.



Lambda is used as an event trigger when a document is created in S3 and serves as a deterministic supervisor over the agentic workflow. It validates that each document is processed or sent to a dead letter queue for exception handling.

Bedrock Data Automation streamlines generative AI development and automates workflows involving documents, images, audio, and videos. For document processing, Bedrock Data Automation combines traditional optical character recognition (OCR), machine learning (ML) models, and generative AI to extract data accurately. You can use Blueprints (artifacts) to specify what data to extract from a document and how to extract it. You can use pre-built templates or build custom configurations tailored to your use cases. The output includes confidence scores and bounding box data for the extracted fields and tables. The custom output here produces a predictable JSON representation of the CMS-1500 claim form across its format variations.

AgentCore hosts the Strands agent. The agent uses two tools to interact with HealthLake: `create_fhir_claim` and `search_fhir_resources`.

The agent uses the following workflow:

  1. Find the Insured, Patient, Practitioner, and Coverage information in AWS HealthLake to use as a reference in the claim form. The first attempt uses [direct method calls](<https://strandsagents.com/docs/user-guide/concepts/tools/#direct-method-calls>) and default search parameters. Beyond that, the agent runs the following prompt to check the tool calls and re-attempt searches if necessary:  


> Identify the insured resource, first by looking at prior tool calls. If there is no match, try two more attempts to find a match by using different search parameters from the claim JSON. Focus on high confidence score attributes and report how you found the match.

  2. If the references are found, create a FHIR representation of the claim and send it to AWS HealthLake.
  3. Create a JSON object that captures the work completed. The object includes the claim ID (if one was created), a response for the human processor, and a response for the patient. The processor response acts as an alert or observation. The patient response signals back to the submitter when errors need to be corrected.



## Prerequisites

Before you deploy the solution, make sure you have the following:

  * An AWS account with administrator permissions.
  * Access to Anthropic Claude Sonnet 4.6 on Amazon Bedrock. For more details, see [Access Amazon Bedrock foundation models](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html>).
  * NodeJS version 24 or later.
  * Node Package Manager (npm) version 11.5 or later.
  * Python version 3.13 or later.
  * AWS Cloud Development Kit (AWS CDK) version 2.1025 or later.



## Deploy the solution

The AWS Cloud Development Kit (CDK) and the AgentCore command line interface are used for deployment with the following steps:

  1. Clone the repository: 
         
         git clone https://github.com/aws-samples/sample-agenticidptohealthlake.git

  2. Run the following commands from the repository root: 
         
         npm install
         python -m venv .venv
         source .venv/bin/activate
         pip install -r requirements.txt
         pip install -r requirements.txt --python-version 3.12 --platform manylinux2014_aarch64 --target ./packaging/_dependencies --only-binary=:all:
         cd agentcore
         agentcore configure --entrypoint claimsprocessor.py
         agentcore launch
         python ./bin/package_for_lambda.py
         npx cdk bootstrap
         npx cdk deploy




## Subscribe to the SNS topic to receive notifications

  1. Access the [Amazon SNS console](<https://console.aws.amazon.com/sns/>).
  2. Choose **Topics**.
  3. Choose **Agent-Notifications**.
  4. Choose **Create subscription**.
  5. For protocol, choose **email**.
  6. Enter your email address.
  7. Choose **Create subscription**.
  8. Follow the link in the confirmation notice in your email to confirm your subscription.



## Use the solution

The following sections walk through two scenarios: a failure scenario and a success scenario.

1\. Failure scenario: Simulate a failure by leaving out one of the required reference resources in AWS HealthLake.

The project code includes a `sampledata` folder. Use `load_sampledata.py` to stage some data, where `<data_store_id>` is the `HealthLakeDatastoreArn` from the `cdk deploy` output:
    
    
    python load_sampledata.py <data_store_id> bda_output_insuredid_error.json Patient,Insured,Practitioner

Upload `sample1_cms-1500-P.pdf` to the S3 bucket under a folder named `/input`. We’re intentionally not loading one of the required resources.

This should generate a message similar to the following through SNS:

**_We were unable to process your claim because we couldn’t find your insurance coverage information in our system. Please contact your insurance provider to verify your policy number G4683A with AnyHealth Plus Medicare plan, or call our office to update your coverage information._**

This simulates how the agent recognizes a problem and generates a human-friendly response to the claim failure.

2\. Successful scenario: Simulate successful processing by making sure the required HealthLake resources exist. In this scenario, we insert a data discrepancy for the agent to help us overcome. In the following sample data, the Insured’s ID number has been changed.

Create the missing reference in HealthLake:
    
    
    python load_sampledata.py <data_store_id> bda_output_insuredid_error.json Coverage

Using the preceding steps, reprocess the PDF. You will receive a message like the following through SNS:

_Successfully processed CMS 1500 claim form for patient John Doe with diagnosis of Back Pain M54.9. Patient was identified by DOB (1960-10-10). Insured party Jane Doe was identified by name search after ID search failed due to a discrepancy between claim ID (11-2234-10190) and database ID (11-2234-1019O) – final character differs. Dr.  Jane Smith was identified as the referring physician by ID 123456. Coverage was verified under Medicare policy G4683A issued by AnyHealth Plus. The claim includes 4 procedures: CPT 97810 on 2005-10-15 ($170), CPT 73521 on 2005-10-20 ($120), CPT 98940 on 2005-10-30 ($250), and CPT 97124 on 2005-10-30 ($120), totaling $660._

This message can signal to a human reviewer a quick glance summary of the successful claim and any other observations made by the agent.

## Best practices

**Design-time AI is better than runtime AI.** In this solution, the orchestration logic is known in advance. The document processing steps are predictable, and the initial queries to HealthLake follow a consistent pattern. Because these requirements are well-defined at design time, we explicitly encoded the logic instead of relying on Model Context Protocol (MCP) servers to infer the order of operations at runtime. The result is a more reliable, maintainable solution. To build it, we used Kiro, an agentic IDE that translates natural language specifications into working code. Kiro generated the API calls to Bedrock Data Automation inside Lambda and built the tools inside the agent. By producing precise, targeted code at design time rather than issuing broad, exploratory prompts at runtime, Kiro reduced the number of calls to Bedrock. That helped lower operational costs and shorten the development lifecycle.

**Deterministically supervise the agents.** Using S3 and Lambda in this architecture was intentional. The agent does two basic things: observe the explicit tool calls, and generate the FHIR resource to load into HealthLake. It then reports back to the Lambda function, which acts as the final arbiter of success or failure for the claim.

## Clean up

The following commands can be invoked to remove the solution:
    
    
    cd agentcore
    python cleanup_resources.py
    npx cdk destroy

## Costs

The following lists cost considerations for each service used.

**Note:** The following cost considerations are based on AWS pricing as of the time of publishing and are provided for informational purposes only. Actual costs may vary. For the most current pricing, refer to the respective services’ pricing pages.

  * [AgentCore Runtime](<https://aws.amazon.com/bedrock/agentcore/pricing/>) charges of $0.0895 per vCPU-hour and Memory at $0.00945 per GB-hour will present a nominal per document cost.
  * Amazon Bedrock Data Automation is $0.04 per page for blueprints with 30 fields or less, $0.0005 for every additional field beyond 30.
  * Model charges for the agent using [Anthropic Claude Sonnet 3.7 V1](<https://aws.amazon.com/bedrock/pricing/>). In our test document the tokens are approximately 76 thousand input and 6 thousand output. For on-demand pricing, that’s $0.23/in and $0.09 out or $0.32/document.
  * [AWS HealthLake](<https://aws.amazon.com/healthlake/pricing/>) is charged by storage per hour, at $0.27 per hour for the first 10 GB.
  * [Lambda](<https://aws.amazon.com/lambda/pricing/>), [S3](<https://aws.amazon.com/s3/pricing/>), and [SNS](<https://aws.amazon.com/sns/pricing/>) charges are negligible per document in this architecture.



## Conclusion

While production healthcare claims processing often involves additional steps beyond this solution, this pattern demonstrates the power of integrating AI agents into document workflows. By giving the AI agent direct access to processing tools, it can provide valuable insights in multiple ways: identifying potential claim issues, highlighting areas that need human review, and generating patient-friendly status messages. This AI-assisted approach can help claims processors work more efficiently and reduce processing times while maintaining accuracy. The preceding example showcases a likely scenario: a data discrepancy between the letter _o_ and the number zero. In this situation, the agent navigates the discrepancy and accurately processes the claim.

To learn more about building intelligent document processing solutions, explore the [Amazon Bedrock documentation](<https://docs.aws.amazon.com/bedrock/>) or check out other healthcare solutions in the [AWS Architecture Center](<https://aws.amazon.com/architecture/?ams%23interactive-card-vertical%23pattern-data--831761598.filter=%257B%2522filters%2522%253A%255B%257B%2522id%2522%253A%2522GLOBAL%2523aws-industry.and%2522%252C%2522value%2522%253A%255B%2522healthcare%2522%255D%257D%255D%257D>).

* * *

## About the authors

### Troy Parrett

Troy is a Senior Solutions Architect at AWS aligned to healthcare and life sciences enterprise customers, helping them adopt and leverage cloud strategically with an AI-first mindset. He has a passion for developer experience and specializes in infrastructure as code and other developer disciplines.

### Dave Crumbacher

Dave is a Senior Solutions Architect at AWS, helping customers adopt and modernize on the cloud. He specializes in cloud strategy, application modernization, and AI/ML, delivering architecture guidance to solve complex business and technology challenges across healthcare, manufacturing, and other industries.
