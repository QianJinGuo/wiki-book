---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/unlocking-ai-flexibility-in-europe-a-guide-to-cross-region-inference-for-eu-data-processing-and-model-access
ingested: 2026-06-09
feed_name: AWS China ML
source_published: 2026-06-08
sha256: 53d3f1b3f97474c449f0b4eb783ecf636d54b0302decdc6b34d54ae5a3596a6f
---

# Unlocking AI flexibility in Europe: A guide to cross-region inference for EU data processing and model access

With access to the latest [generative AI models](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html>) and high-performance accelerated compute in high global demand, AWS customers need tools to take advantage of [model availability](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html>) and capacity across multiple AWS Regions, while still meeting their security and privacy requirements. [cross-Region Inference (CRIS)](<https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html>) on [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) meets these needs by automatically routing requests across multiple AWS Regions within predefined geographic boundaries. This allows generative AI applications to consume broad capacity in the geography, helping customers to build more resilient applications that reflect their geographic intricacies.  
  
In this post, we dive deeper into cross-Region Inference (CRIS) and explain how customers in Europe can benefit. We highlight features, services, and resources that AWS offers customers to help them align with the local data protection and processing requirements. This includes the General Data Protection Regulation (GDPR) that might apply to their activities while using CRIS.

## Cross-Region inference profiles

Cross-Region Inference (CRIS) is a managed capability in [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) that routes model inference requests within supported AWS Regions. Inference profiles are a resource in Amazon Bedrock that define the Regions where the requests can be routed to. These profiles route requests within certain sets of Regions. CRIS routing is designed to optimize model throughput at lowest possible latency overhead.

Amazon Bedrock has introduced system-defined inference profiles. These inference profiles are named after the model and the geographic Regions that they support. These profiles help Amazon Bedrock consumers use the AWS global-scale footprint to build their generative AI solutions. To understand how a cross-Region inference profile handles inference requests, it’s important to understand the following key concepts:

**Source Region** – The Region from which you make the API request that specifies the inference profile.

**Destination Region** – A Region to which the Amazon Bedrock service can route the request from your source Region.

System-defined CRIS profiles have either a global or a geographic scope. In the next sections, we explain the global and EU geographic scopes and how customers can use the different profiles to help to navigate their regulatory and compliance obligations.

### Global inference

Global inference profiles route model inference requests to any supported AWS commercial Regions. Input prompts are transmitted to a destination Region for serving the model inference, model outputs are generated in the destination Region and returned to the source Region. Data transmitted during cross-Region inference is [encrypted and remains within the secure AWS network](<https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html>). The destination Region is automatically selected to optimize for available model capacity and return the response with minimal overhead.

By using all available supported Regions, generative AI applications using global inference profiles are more resilient to any potential capacity shortages during peak hours or other Regional model availability issues. Several models are also available at a [discounted price](<https://aws.amazon.com/bedrock/pricing/>) through global CRIS as compared to direct in-Region or geographic CRIS invocation, making global inference even more attractive.

### EU geography-based inference

[Geographic CRIS (Geo CRIS)](<https://docs.aws.amazon.com/bedrock/latest/userguide/geographic-cross-region-inference.html>) are system-defined inference profiles that differ from global inference profiles. These profiles attach models to a geography, serving copies of the same model from different Regions defined within the profile. Different Geo CRIS profiles are available for Amazon Bedrock customers to choose from based on their requirements. In this section, we highlight the EU-specific inference profiles (EU CRIS).

EU CRIS profiles have been created to help customers on EU residency topics. CRIS can only optimize traffic within a set of destination Regions. For EU CRIS, all destination Regions lie within the European Union. Requests originating from outside of the EU can also be optimized with EU CRIS. Such requests have source Region outside of the European Union. For such requests, CRIS optimizes inference within the EU Regions in addition to respective source Regions. Customers using the EU CRIS profile will have the following effects:

  * Requests from a source Region that lies in the EU can only be routed to other AWS Regions with the European Union.
  * Requests from EU source Regions can’t get routed to non-EU Regions while using EU CRIS. For example, Zurich and London aren’t considered as destination Regions for such requests.
  * Requests originating from London Region can only be routed between available EU Regions and London Region.
  * Requests from Zurich Region can only be routed between available EU Regions and Zurich Region.
  * For requests originating from outside of the EU, using EU CRIS: the optimizations only consider the source Region and the EU Regions.



## Security and control with cross-Region inference

The security of customer data is [our highest priority](<https://aws.amazon.com/security/culture-of-security/>) at AWS, and this is reflected in the design of Amazon Bedrock cross-Region inference too.

The AWS-to-AWS traffic flows, such as Region-to-Region (inclusive of Edge Locations and AWS Direct Connect paths), will always traverse AWS-operated backbone paths. Data transmitted during cross-Region operations remains on the AWS network and doesn’t traverse the public internet. AWS encrypts data in transit between AWS Regions.Consumer applications must explicitly indicate in code when invoking models for cross-Region inference, by providing a CRIS profile ID in place of a plain model ID. For example, the following code snippet shows two invocations of the Amazon Nova Lite model – one using EU CRIS and one using global CRIS:
    
    
    import boto3
    import json
    
    from botocore.exceptions import ClientError
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="eu-south-1") # Source Region: Milan
    
    model_id = "eu.amazon.nova-2-lite-v1:0" 
    # Amazon Nova Lite EU CRIS profile ID
    # Request can be processed within available destination Regions in EU CRIS
    
    response = bedrock_runtime.converse(modelId=model_id, messages=[...], additionalModelRequestFields={...}) 
    
    
    model_id = "global.amazon.nova-2-lite-v1:0" 
    # Amazon Nova Lite Global CRIS profile ID
    # Request can be processed by any AWS Commercial Region
    
    response = bedrock_runtime.converse(modelId=model_id, messages=[...], additionalModelRequestFields={...}) 
    

Geographic inference profiles, and therefore the EU inference profile, are static. This means AWS won’t add more Regions to the profile. If a new destination Region must be added to a geographic specific profile, including EU CRIS, Amazon Bedrock will publish a new geographic specific profile with a new inference profile id.

Data protection by design is a key concept introduced in the GDPR. With [AWS Identity and Access Management (AWS IAM)](<https://aws.amazon.com/iam/>), customers can securely control access to their AWS resources and data, including which applications are permitted to access data or invoke different foundation models or CRIS profiles on Amazon Bedrock. IAM can help customers comply with this requirement by allowing only authorized administrators, users, and applications to get access to AWS resources and data. IAM helps to enforce least privilege principles to control who can access your data in your source Region. This helps prevent content that customers don’t want to be processed in a destination Region from being included in the input prompts. [Securing Amazon Bedrock cross-Region inference](<https://aws.amazon.com/blogs/machine-learning/securing-amazon-bedrock-cross-region-inference-geographic-and-global/>) shares more on detail on configuring Geographic and global profiles and IAM.

## Transparency and auditability

Many data processing regulations require the controller or consumer to maintain a record of data processing activities. Both Global and Geographic CRIS can achieve this.

With [AWS CloudTrail,](<https://aws.amazon.com/cloudtrail/>) customers can continuously monitor AWS account activity. CloudTrail captures a history of the AWS API calls for the customer account, including API calls made through the AWS Management Console, the AWS SDKs, the command line tools, and higher-level AWS services. Specifically with Amazon Bedrock, the metadata of every call to an API counted as a [management event](<https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html#service-name-data-events-cloudtrail>) is logged by default. This includes model invocation APIs like Converse and InvokeModel, but only their metadata, not the actual payloads. These logs are accessible from the past 90 days under **Event History** when filtering for event source “bedrock.amazonaws.com”. For an ongoing record of events, you can [configure CloudTrail](<https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html>) to store these events longer.

When examining relevant events in CloudTrail, customers can see source and destination Regions of the model invocation, with the inferenceRegion field in the additionalEventData section showing where the request was actually processed.

Optionally, customers can choose to enable [Model Invocation Logging](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html>). This feature collects detailed information about every call in your account’s source Region, including the full request, response, and metadata. Customers can send the logs to Amazon CloudWatch Logs or Amazon Simple Storage Service (Amazon S3). Model invocation logging remains off by default, and customers must enable it explicitly if needed.

When using cross-Region inference, Amazon CloudWatch, AWS CloudTrail and Model Invocation Logging continue to record log entries only in the _source Region_ of the customer AWS account where the request originated. This design streamlines monitoring and logging management and maintains local data processing requirements by storing logs in the source location, regardless of which destination Region actually processes the request.

### How can I check available CRIS profiles?

Customers interested in checking available system profiles have the following possibilities:

  1. Use [this official documentation page](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html>) that lists all system-defined inference profiles and associated source and destination Regions.
  2. See available inference profiles a source Region by navigating to cross-Region inference in the AWS Console page. The following screenshot shows this [console page for London](<https://eu-west-2.console.aws.amazon.com/bedrock/home?region=eu-west-2#/inference-profiles>) (eu-west-2).

Amazon Bedrock > cross-Region inference

  3. Use AWS SDKs, such as Boto3, as shown by the following code snippet:


    
    
    # pip install boto3
    import boto3
    region = "eu-central-1" # Frankfurt Region
    bedrock = boto3.client('bedrock', region_name=region)
    system_response = bedrock.list_inference_profiles(typeEquals='SYSTEM_DEFINED')
    #https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock/client/list_inference_profiles.html

## Inference profiles and local data processing

Many customers have local data processing requirements and need transparency into where their data is processed. This also applies to both global inference profiles and geographic inference profiles.

AWS customers can use AWS services to process personal data (as defined in the GDPR) that is uploaded to the AWS services under their AWS accounts (customer data) in [compliance with the GDPR](<https://aws.amazon.com/blogs/security/all-aws-services-gdpr-ready/>).

Amazon Bedrock is one of the many services in scope for the [CISPE Data Protection Code of Conduct](<https://aws.amazon.com/compliance/services-in-scope/CISPE/>). This provides an independent verification and an added level of assurance to our customers that our cloud services can be used in compliance with the General Data Protection Regulation (GDPR). The CISPE Code is the first pan-European data protection code of conduct for cloud infrastructure service providers. In May 2021, the CISPE Code was approved by the European Data Protection Board (EDPB), acting on behalf of the 27 data protection authorities across Europe. In June 2021, the Code was formally adopted by the CNIL, acting as the lead supervisory authority.

AWS customers can continue to use AWS services to transfer customer data from the EEA to non-EEA countries that haven’t received an adequacy decision from the European Commission (including the United States) in compliance with the GDPR. While both global and geographic CRIS profiles can help customers consume model inference, they also give customers a choice for their inference compliance requirements and risk posture.

At AWS, our highest priority is securing customer data, and we implement rigorous technical and organizational measures to protect its confidentiality, integrity, and availability, regardless of which [AWS Region](<https://aws.amazon.com/about-aws/global-infrastructure/regions_az/?p=ngi&loc=2>) the customer has selected. We know that transparency matters to our customers. We list the AWS services that involve a data transfer of customer data on our [Privacy Features](<https://aws.amazon.com/compliance/privacy-features/>) webpage.

As the regulatory and legislative landscape evolves, we remain committed to helping our customers continue to enjoy the benefits of AWS services wherever they operate. For more information, see our [customer update on the EU-US Privacy Shield](<https://aws.amazon.com/blogs/security/customer-update-aws-and-the-eu-us-privacy-shield/>) and our blog posts on the [Supplementary Addendum to the AWS Data Processing Addendum](<https://aws.amazon.com/blogs/security/aws-and-eu-data-transfers-strengthened-commitments-to-protect-customer-data/>).

## Conclusion

Cross-Region inference (CRIS) allows generative AI applications to access models that might not be available in their primary AWS Region. It increases resiliency to unplanned traffic bursts or Region-specific capacity shortages, while maintaining the highest levels of trust, privacy, and security.

In this post we showed how CRIS can be used while respecting EU local data processing requirements. Amazon Bedrock offers the flexibility for customers to select global or geographically constrained cross-Region inference profiles, depending on the needs of their specific use-case. Both approaches align to data protection regulations like the GDPR, but allow customers greater flexibility in meeting their workload requirements and risk appetite.

AWS strives to continuously bring new services into the scope of its compliance programs to help you meet your architectural and regulatory needs. AWS teams are there to help you evaluate risk and create data privacy impact assessments. Contact [your AWS account team](<https://pages.awscloud.com/global-ln-gc-400-ai-contact-us.html>) for questions about your AI workloads and cross-Region Inference. To learn more about our compliance and security programs, see [AWS Compliance Programs](<https://aws.amazon.com/compliance/programs/>).

* * *

## About the authors

### Muhammad Hamza Usmani

[Muhammad Hamza Usmani](<author LinkedIn>) works on GTM topics for Amazon Bedrock pan EMEA. He is passionate about working with customers and partners, motivated by the goal of harnessing model in-context learning capabilities to help businesses unlock new value from generative AI.

### Margo Cronin

[Margo Cronin](<author LinkedIn>) is an EMEA Principal Solutions Architect specializing in Security & Compliance. She is based out of Zurich Switzerland. Her interests include security, privacy, cryptography and compliance. She is passionate about her work unblocking security challenges for AWS customers’ enabling their successful cloud journeys. She is an author of the “AWS User Guide to Financial Services Regulations and Guidelines in Switzerland”

### Alex Thewsey

[Alex Thewsey](<author LinkedIn>) is a Generative AI Specialist Solutions Architect at AWS, based in Singapore. Alex helps customers across Southeast Asia to design and implement solutions with ML and Generative AI. He also enjoys karting, working with open source projects, and trying to keep up with new ML research.

### Saurabh Trikande

[Saurabh Trikande](<author LinkedIn>) is a Senior Product Manager for Amazon Bedrock and Amazon SageMaker Inference. He is passionate about working with customers and partners, motivated by the goal of democratizing AI. He focuses on core challenges related to deploying complex AI applications, inference with multi-tenant models, cost optimizations, and making the deployment of generative AI models more accessible. In his spare time, Saurabh enjoys hiking, learning about innovative technologies, following TechCrunch, and spending time with his family.
