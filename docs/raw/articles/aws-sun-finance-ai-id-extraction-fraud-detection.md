---
title: "aws sun finance ai id extraction fraud detection"
source: rss
source_url: [ORIGINAL_URL]
ingested: 2026-05-08
created: 2026-05-08
updated: 2026-05-08
type: raw
tags: [rss, aws, post-training]
summary: Textract+Claude混合方案：79.7%→90.8%准确率 / 91%成本降低 / 每月330万次评估
sha256: fa5c52979599
---
# Sun Finance automates ID extraction and fraud detection with generative AI on AWS
_This post was co-authored with Krišjānis Kočāns, Kaspars Magaznieks, Sergei Kiriasov from Sun Finance Group_
If you process identity documents at scale—loan applications, account openings, compliance checks—you’ve likely hit the same wall: traditional optical character recognition (OCR) gets you partway there, but extraction errors still push a large share of applications into manual review queues. Add fraud detection to the mix, and the manual workload compounds.
Sun Finance, a Latvian fintech founded in 2017, operates as a technology-first online lending marketplace across nine countries. The company processes a new loan request every 0.63 seconds and delivers more than 4 million evaluations monthly. In one of their highest-volume industries, with 80,000 monthly applications for microloans, approximately 60% of applications required manual operator review. Sun Finance partnered with the [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>) to rebuild the pipeline. Within 35 business days of handover, the solution was live in production. The following timeline shows the full project journey from kickoff to production launch.
The project moved through four milestones over 107 business days. The AWS Generative AI Innovation Center engagement ran 32 days from kickoff (August 26, 2025) to final presentation (October 9, 2025), followed by 26 days for technical handover (November 14, 2025). Sun Finance then took 35 business days to move the solution into production, including a 14-day production freeze over the holiday period (December 18 – January 7), and went live on January 22, 2026.
In this post, we show how Sun Finance used [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), [Amazon Textract](<https://aws.amazon.com/textract/>), and [Amazon Rekognition](<https://aws.amazon.com/rekognition/>) to build an AI-powered identity verification (IDV) pipeline. The solution improved extraction accuracy from 79.7% to 90.8%, cut per-document costs by 91%, and reduced processing time from up to 20 hours to under 5 seconds. You’ll learn how combining specialized OCR with large language model (LLM) structuring outperformed using either tool alone. You’ll also learn how to architect a serverless fraud detection system using vector similarity search.
## The Identity Verification Challenge
Sun Finance had built its first IDV automation in 2019 using [Amazon Rekognition](<https://aws.amazon.com/rekognition/>) and [Amazon Textract](<https://aws.amazon.com/textract/>). As the company expanded into developing regions, the system’s limitations became hard to ignore.
This region presented unique challenges with language and document complexity. Processing documents in both English and a local language proved difficult for traditional OCR systems. The local language text remains underrepresented in traditional OCR training datasets, causing frequent extraction errors. Sun Finance also needed to handle 7 different ID types, each with different layouts and formats.
The manual workload was primarily driven by OCR errors. Of the 60% of applications requiring manual review, approximately 80% of cases stemmed from mismatches between extracted information and customer-entered data. Critically, 60% of these mismatches were OCR errors, not customer mistakes. The remaining 20% of manual interventions related to fraud detection flags.
Fraud detection added another layer of complexity. About 10% of daily requests were actual fraudulent applications. Fraudsters used similar images with distinctive patterns to bypass basic controls while submitting multiple loan applications. Identifying these patterns required time-intensive manual review across numerous images.
Cost and speed constraints blocked expansion. The per-document cost and approximately 3 full-time equivalents (FTEs) dedicated to manual verification in this region alone meant the unit economics blocked expansion into industries with lower-value microloans. Processing times ranged from under 10 minutes for automated cases to 20 hours for manual reviews outside business hours.
## Solution overview
The AWS Generative AI Innovation Center ran a 6-week proof-of-concept (September–October 2025) focused on one high-volume industry. The team built two AI-powered solutions: an ID extraction system and a fraud detection system. Both were deployed as a fully serverless architecture on AWS.The solution uses the following key services:
  * [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) – For AI structuring and visual analysis using Anthropic’s Claude Sonnet 4, and vector generation using Amazon Titan Multimodal Embeddings.
  * [Amazon Textract](<https://aws.amazon.com/textract/>) – For primary OCR text extraction from identity documents.
  * [Amazon Rekognition](<https://aws.amazon.com/rekognition/>) – For fallback OCR, face detection, and face masking.
  * [Amazon S3 Vectors](<https://aws.amazon.com/s3/vectors/>) – For serverless vector similarity search against known fraud patterns.
  * [AWS Step Functions](<https://aws.amazon.com/step-functions/>) – For orchestrating parallel fraud detection workflows.
  * [AWS Lambda](<https://aws.amazon.com/lambda/>) – For serverless compute across both pipelines.
The following diagram illustrates the solution architecture.
_Sun Finance API architecture showing ID extraction and fraud detection routes_
The architecture exposes two API routes through Amazon API Gateway, with loan application data stored in Amazon Simple Storage Service (Amazon S3):
  1. **`/extract-id` route (ID extraction).** An AWS Lambda function receives the ID image and sends it to Amazon Textract for primary OCR. If Amazon Textract returns low-confidence results, the system falls back to Amazon Rekognition for OCR. The extracted text is then passed to Amazon Bedrock (Claude Sonnet 4), which structures it into standardized JSON fields.
  2. **`/detect-fraud` route (fraud detection).** An AWS Lambda function triggers an AWS Step Functions workflow that runs two checks in parallel: 
     * **Background similarity** — Amazon Rekognition masks the face from the selfie image, then Amazon Bedrock Titan Multimodal Embeddings generates a vector representation of the background. This vector is queried against Amazon S3 Vectors to find matches with known fraud patterns.
     * **Visual pattern detection** — Amazon Bedrock (Claude Sonnet 4) analyzes the image for screen photo artifacts and digital manipulation.
Both results feed into a Lambda-based risk assessment function that produces a combined fraud score as JSON.
  3. **Fraud ingestion pipeline (right side).** Confirmed fraud images are ingested from Amazon S3 through a Lambda function. The images are processed by Amazon Rekognition for face masking, vectorized by Amazon Bedrock Titan Embeddings, and stored in Amazon S3 Vectors. This grows the reference database over time.
## Prerequisites
To implement a similar solution, you need the following:
  * An [AWS account](<https://aws.amazon.com/free/>) with permissions to create and manage [AWS Lambda](<https://aws.amazon.com/lambda/>), [AWS Step Functions](<https://aws.amazon.com/step-functions/>), [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), [Amazon Textract](<https://aws.amazon.com/textract/>), [Amazon Rekognition](<https://aws.amazon.com/rekognition/>), and [Amazon S3 Vectors](<https://aws.amazon.com/s3/vectors/>) resources.
  * [Amazon Bedrock model access](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html>) enabled for Anthropic Claude Sonnet 4 and Amazon Titan Multimodal Embeddings in your AWS Region.
  * [Terraform](<https://www.terraform.io/>) installed for infrastructure deployment.
  * Familiarity with Python and serverless architectures.
  * A dataset of identity document images for testing and validation.
## Solution walkthrough
This section walks through the two core pipelines: ID extraction and fraud detection.
### ID extraction pipeline
The ID extraction system didn’t arrive at its final design on day one. The team iterated through three distinct approaches over four weeks, and each failure pointed toward the next improvement. The following diagram shows how the pipeline evolved from a single Claude Sonnet 4 via Amazon Bedrock approach at 61.8% accuracy to the final multi-tier design at 90.8%.
_ID extraction: evolution of approaches showing three iterations from 61.8% to 90.8% accuracy_
**Approach 1: Claude Sonnet 4 alone (61.8% accuracy).** The team’s first attempt sent ID images directly to Anthropic’s Claude Sonnet 4 via [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) and asked it to extract fields as JSON. The results were disappointing: 61.8% overall accuracy, with ID number extraction at only 43%. The core issue was the model’s built-in safety protocols for handling personally identifiable information (PII). Claude is trained to limit processing of sensitive PII found on identity documents like driver’s licenses, passports, and national IDs. When presented with real ID images, the model triggered these privacy safeguards and refused to extract information from some files, which directly impacted performance. Additionally, even when extraction succeeded, certain fields (like ID numbers) showed poor accuracy because the model prioritized safety over precise character recognition on sensitive documents.
The takeaway: while Claude excels at general document analysis and OCR tasks, its built-in privacy protections make it unsuitable for direct extraction from identity documents containing PII.
**Approach 2: Amazon Textract + Claude structuring (85% accuracy).** The breakthrough came when the team separated OCR from structuring. [Amazon Textract](<https://aws.amazon.com/textract/>) handled raw text extraction from ID images. Claude Sonnet 4 then structured the output into 7 standardized fields: document type, date of birth, name, surname, middle name, ID number, and expiry date. This single change produced an 11.6% accuracy jump.
This approach worked because Amazon Textract, as a specialized OCR service, doesn’t have the same PII refusal mechanisms as Claude, so it reliably extracted text from every ID image without triggering safety protocols. Once the text was extracted, Claude could focus on what it does best: intelligent structuring. Claude excelled at handling local language text with diacritical marks, inferring missing information from context, and applying document-specific extraction rules. These are tasks that traditional OCR alone couldn’t handle. By working with already-extracted text rather than raw ID images, Claude avoided its safety constraints.
The takeaway: separating concerns allowed each tool to operate within its design parameters: Amazon Textract for reliable OCR and Claude for intelligent structuring.
**Approach 3: Multi-tier OCR + validation (90.8% accuracy).** The final iteration added [Amazon Rekognition](<https://aws.amazon.com/rekognition/>) as a fallback for images where Amazon Textract struggled (typically low-quality scans, unusual document angles, or damaged IDs) plus validation rules for ID number formatting, date standardization, and document type normalization.
The multi-tier architecture works as follows. Amazon Textract handles primary OCR. Amazon Rekognition provides backup extraction when Amazon Textract confidence is low. Claude structures the combined output, and validation rules catch formatting errors that slip through. ID numbers get padded to the correct length based on document type, and dates are standardized to YYYY-MM-DD format. These validation rules proved critical. They caught edge cases where OCR extracted correct characters but in inconsistent formats.
The following chart shows the weekly accuracy progression across 585 test images. The team didn’t beat the baseline until Week 4, when they added Amazon Textract. Each iteration revealed new failure modes that informed the next architectural improvement.
_ID extraction: the journey to 90.8% accuracy showing weekly progress_
The takeaway: combining specialized OCR tools (Amazon Textract + Amazon Rekognition) with LLM structuring (Claude) and validation rules beats using a single tool alone for document extraction.
### Fraud detection pipeline
The fraud detection system uses [AWS Step Functions](<https://aws.amazon.com/step-functions/>) to run two detection methods in parallel, then combines their scores into a final risk assessment.
**Visual pattern detection.** Claude Sonnet 4 via [Amazon Bedrock](<https://aws.amazon.com/bedrock/>) analyzes submitted selfie images for signs of fraud: screen photos (visible bezels, scan lines, moiré patterns), screen glare and reflections, and digital manipulation artifacts. Images scoring 85% confidence or higher are flagged. The system ignores normal characteristics like blur, compression artifacts, and standard cropping to reduce false positives. Screen photo detection works well, with 95%+ confidence on known patterns.
**Background similarity analysis.** This component catches fraud rings, which are groups of fraudsters submitting selfies from the same location. The pipeline works in three steps. First, [Amazon Rekognition](<https://aws.amazon.com/rekognition/>) masks faces to focus on the background. Then, [Amazon Titan](<https://aws.amazon.com/bedrock/titan/>) Multimodal Embeddings generates a 1024-dimensional vector of the background. Finally, [Amazon S3 Vectors](<https://aws.amazon.com/s3/vectors/>) searches for matches against known fraud patterns.
The team tested both text-based and visual embeddings for similarity search. Text embeddings (having Claude describe the background, then comparing descriptions) achieved 91% accuracy but only 27.8% precision and 21.7% recall. Visual embeddings performed far better: 96% accuracy, 80% precision, and 52% recall.
_Background similarity: visual features approach showing the pipeline and text vs visual embedding comparison_
**Risk assessment.** The scoring algorithm weighs visual pattern detection (50%) and background similarity (50%) equally. Scores of 75+ indicate high-confidence fraud, 38–74 indicate medium confidence, and below 38 is classified as legitimate. The parallel execution architecture processes images in 3–5 seconds, down from 6–8 seconds when run sequentially.
### Serverless architecture
The entire solution runs on [AWS Lambda](<https://aws.amazon.com/lambda/>), [AWS Step Functions](<https://aws.amazon.com/step-functions/>), and [Amazon API Gateway](<https://aws.amazon.com/api-gateway/>). This design lets the team modify individual Lambda functions, test changes immediately, and deploy updates without downtime. This was critical during a 6-week engagement where the approach changed weekly.
Authentication uses [Amazon Cognito](<https://aws.amazon.com/cognito/>) with AWS SigV4 request signing. [AWS WAF](<https://aws.amazon.com/waf/>) protects against common web security issues. Data is encrypted at rest with [AWS Key Management Service (AWS KMS)](<https://aws.amazon.com/kms/>) and in transit via TLS 1.2+. The infrastructure is defined in Terraform and passed security audits with 25 findings analyzed: 14 false positives, 9 justified exceptions, and 2 deferred for production.
## Results
The proof-of-concept delivered measurable improvements across accuracy, speed, fraud detection, and cost.
### ID extraction performance
The system was evaluated against 585 ID images:
**Metric** | **Baseline** | **New solution** | **Improvement**  
---|---|---|---  
Name | 84.93% | 87.72% | +2.79%  
Date of birth | 81.25% | 90.80% | +9.55%  
Document type | 78.43% | 96.40% | +17.97%  
ID number | 74.32% | 89.40% | +15.08%  
Overall accuracy | 79.73% | 90.80% | +11.07%  
ID number extraction, previously the weakest field at 74.32%, improved by over 15 percentage points. Document type classification reached 96.4%. Average processing time: 4.42 seconds per document.
### Fraud detection performance
The combined end-to-end fraud detection pipeline (visual pattern detection plus background similarity) achieved 81% accuracy with 59% recall and 83% specificity.
_Fraud detection results: 81% accuracy, 59% recall, 83% specificity_
The 59% recall means the system catches about 6 in 10 fraud cases. The conservative thresholds reflect a business reality: false positives create customer friction, while missed fraud can be caught through other controls. As the fraud pattern database grows with confirmed cases, recall improves.
### Cost and speed
The new solution reduced costs and processing time across both pipelines.
**Component** | **Cost reduction**  
---|---  
ID extraction (Amazon Textract + Amazon Rekognition + Claude) | 91% reduction vs. previous solution  
Fraud detection (Claude Sonnet 4 + Amazon Titan Embeddings + Amazon S3 Vectors) | 3–5 seconds per image  
The ID extraction cost represents a 91% reduction from the previous solution. This makes it economically viable to serve industries with lower-value microloans. The fraud detection pipeline completes in 3–5 seconds per image.
### Operational impact
Beyond accuracy and cost, the solution changed how Sun Finance operates day-to-day:
  * **Manual intervention** projected to drop from 60% to 30% of applications, cutting the review workload in half.
  * **Staffing** projected to decrease from approximately 3 FTEs to approximately 1 FTE for this industry.
  * **Region expansion** now economically viable for low-value loan economies.
  * **Adaptability** —adding a new document type or language requires prompt engineering and validation, not retraining specialized models.
## Scalability and expansion
The solution’s architecture was designed for rapid expansion. Sun Finance operates across nine countries, and the serverless design enables industry-specific deployments without infrastructure duplication. Adding a new economy requires configuration updates and redeployment. The team updates Claude Sonnet 4 prompts via Amazon Bedrock and defines document-specific validation rules, then tests against a validation dataset. These configuration changes require redeploying the Lambda functions through the continuous integration and continuous delivery (CI/CD) pipeline using Terraform. The fraud detection system uses two complementary methods. Visual pattern detection via Claude Sonnet 4 identifies screen photos and digital manipulation. These techniques are largely universal across industries. Background similarity analysis using Amazon S3 Vectors catches fraud rings by comparing backgrounds against known patterns, with confirmed fraud cases added to improve detection over time.
The modular architecture enables continuous enhancement. The [AWS Step Functions](<https://aws.amazon.com/step-functions/>) orchestration allows adding new fraud detection methods as parallel Lambda functions without disrupting existing checks. These could be capabilities like EXIF metadata analysis, device fingerprinting, and geolocation validation. Each would integrate as additional parallel checks without requiring architectural changes.
## Lessons learned
Five practical takeaways from the engagement:
**OCR + LLM beats LLM alone.** Claude Sonnet 4 via Amazon Bedrock on its own achieved 61.8% accuracy for ID extraction, which was below the existing baseline. Adding Amazon Textract for raw text extraction and using Claude only for structuring jumped accuracy to 85%. The LLM is good at understanding context and normalizing messy data. It’s not as reliable at precise character-by-character recognition from images.
**Multi-tier OCR delivers resilience.** The cascading approach uses Amazon Textract as primary and Amazon Rekognition as a fallback. No single OCR service handled every edge case, but the combination added minimal cost while helping avoid complete failures on challenging images.
**Fraud detection needs multiple methods.** Visual pattern detection catches screen photos at 95%+ confidence. Background similarity catches fraud rings through location patterns. But background similarity only achieves 55% recall on seen patterns and drops to 16.7% on novel patterns. Neither method alone is sufficient, and the system improves as more confirmed fraud cases are added to the database.
**Start simple, add complexity when metrics demand it.** The team achieved a 91% cost reduction by using Amazon Textract as primary OCR instead of Claude for everything. They called `AnalyzeID` only when specific fields were missing and cached embeddings for fraud detection. Reserve expensive models for tasks where they’re actually needed.
**Serverless enables rapid iteration.** The parallel execution in [AWS Step Functions](<https://aws.amazon.com/step-functions/>) cut fraud detection latency by 40% with minimal code changes. The ability to modify and deploy individual Lambda functions without downtime was critical during a 6-week engagement where the approach evolved weekly.
## Next steps
Sun Finance plans to build on the proof-of-concept in several directions.
  * **Expand visual detection.** The current system only checks for screen photos. It misses cartoons, illustrations, and AI-generated images. Expanding the detection prompt is the lowest-effort, highest-impact improvement.
  * **More training data.** Continuous collection of confirmed fraud cases and diverse background patterns will directly improve background similarity recall beyond the current 55% on seen patterns.
  * **Additional fraud signals.** Integrating EXIF metadata analysis, device fingerprinting, and geolocation validation would add detection paths that don’t depend on visual analysis. This is particularly valuable for novel fraud patterns.
  * **Multi-language expansion.** Expanding to Sun Finance’s other economies in countries across Southeast Asia, Africa, Latin America, and Europe requires language-specific prompt engineering and validation rules. Claude’s multilingual capabilities provide a starting point, and the team is building a configuration framework to enable expansion without code changes.
## Clean up
If you implement a similar proof-of-concept, delete the following resources when you’re done to avoid ongoing charges:
  * AWS Lambda functions created for the ID extraction and fraud detection pipelines.
  * AWS Step Functions state machines.
  * Amazon S3 buckets and Amazon S3 Vectors vector indexes used for fraud pattern storage.
  * Amazon API Gateway REST APIs.
  * Amazon Cognito user pools.
  * AWS WAF web access control lists (ACLs).
  * Any Amazon Bedrock provisioned throughput (if configured).
You can delete these resources through the [AWS Management Console](<https://aws.amazon.com/console/>) or by running `terraform destroy` if you deployed the infrastructure using Terraform.
## Conclusion
In this post, we showed how Sun Finance combined Amazon Textract, Amazon Rekognition, and Amazon Bedrock to build an AI-powered identity verification pipeline. The solution improved extraction accuracy from 79.7% to 90.8%, cut per-document costs by 91%, and reduced processing time from up to 20 hours to under 5 seconds. The core architectural pattern, using specialized OCR for text extraction and an LLM for intelligent structuring, applies to document processing workflows where traditional OCR falls short. The serverless fraud detection system demonstrates how you can combine visual analysis with vector similarity search to catch fraud patterns at scale.
For customers applying for a microloan, that’s the difference between waiting a day and getting an answer while they’re still on their phone.
> _“Thank you to the AWS Generative AI Innovation Center team for an outstanding partnership and truly exceptional results. What initially felt like an ambitious — almost unrealistic — target has been transformed into a secure, production-ready solution delivering measurable gains in accuracy, speed, and cost efficiency. In particular, the AI-powered fraud detection capability — combining visual pattern recognition and background similarity analysis — represents a major step forward in protecting our portfolio while maintaining a seamless customer experience. The impact on our operations and risk management framework is immediate and significant, and we deeply appreciate the expertise, dedication, and execution excellence that made this possible.”_
> 
> — Agris Vaselāns, Group CRO, Sun Finance
To learn how generative AI can improve your document processing and fraud detection workflows, visit the [Amazon Bedrock product page](<https://aws.amazon.com/bedrock/>) or connect with the [AWS Generative AI Innovation Center](<https://aws.amazon.com/ai/generative-ai/innovation-center/>). For more on OCR and document processing, refer to the [Amazon Textract Developer Guide](<https://docs.aws.amazon.com/textract/latest/dg/what-is.html>).
We’d love to hear about your experience with document processing and fraud detection. Share your thoughts in the comments section.
* * *
## **About the authors**
**Babs Khalidson** is a Deep Learning Architect at the AWS Generative AI Innovation Centre in London, where he specializes in fine-tuning large language models, building AI agents, and model deployment solutions. He has over 6 years of experience in artificial intelligence and machine learning across finance and cloud computing, with expertise spanning from research to production deployment.
**Vushesh Babu Adhikari** is a Data scientist at the AWS Generative AI Innovation center in London with extensive expertise in developing Gen AI solutions across diverse industries. He has over 7 years of experience spanning across a diverse set of industries including Finance , Telecom , Information Technology with specialized expertise in Machine learning & Artificial Intelligence.
**Luisa Bertoli** is an AI Strategist at the AWS Generative AI Innovation Center. She works with large organizations on their AI strategy, adoption, and multi-year transformation plans, helping them move from experimentation to scalable, high-impact implementations. She has deep financial services domain expertise, built over years of designing and developing AI and ML products in the industry.
**Kimmo Isosomppi** is a Senior Solutions Architect at AWS in Helsinki, Finland. He helps enterprise customers across the Nordic and Baltic regions turn complex cloud and AI challenges into production-ready solutions, with particular expertise in generative AI, agentic AI architectures, and cloud security. He brings over two decades of experience across gaming, financial services, retail, and the public sector.
**Seppo Kalliomaki** is an Account Executive at AWS in Tallinn, Estonia, specializing in enterprise cloud adoption and AI transformation across the Nordic and Baltic regions. Since 2017, he has helped organizations in their cloud journey and implement generative AI solutions, with particular expertise in banking modernization, Public Sector services, and emerging AI use cases. Seppo works closely with renewing cloud strategy, migration planning, and AI adoption with AWS enterprise customers.
**Nicolas Metallo** is a Senior Deep Learning Architect at the AWS Generative AI Innovation Center in Madrid. He designs and implements GenAI solutions using Amazon Bedrock and SageMaker, including fine-tuning LLMs, deploying multi-agent systems, and leading technical GTM for sovereign AI initiatives across EMEA.
**Krišjānis Kočāns** leads fraud prevention data science at Sun Finance Group across 14 countries in 4 continents, building fraud detection systems from scratch while driving Gen AI adoption.
**Kaspars Magaznieks** is Head of Fraud at Sun Finance – leading Fraud prevention Team, building fraud prevention framework, fraud prevention policy. Kaspars has more than 10 years’ experience in fraud prevention working in global, fast paced lending companies!
**Sergei Kiriasov** is Head of Risk Technology at Sun Finance, responsible for shaping and delivering the technology behind credit risk decision-making. Leading cross-functional collaboration between Risk and IT, ensures robust architecture, efficient processes, and scalable solutions that empower data science, fraud prevention, and portfolio teams. With 15+ years in technology, drives innovation and operational excellence across risk systems.