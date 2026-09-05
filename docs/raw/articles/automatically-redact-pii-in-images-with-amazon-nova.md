---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/automatically-redact-pii-in-images-with-amazon-nova
ingested: 2026-07-07
feed_name: AWS China ML
source_published: 2026-07-06
sha256: 75710f4b51480e95e78f7e5292ad6a381fd70c0bb6518d044749981b006a29dd
vxc: 64
---

# Automatically redact PII in images with Amazon Nova

Sharing data internally across teams, externally with partners, or using it for workloads such as machine learning (ML) model training is fundamental to modern business operations. However, when that data contains Personally Identifiable Information (PII), organizations face significant legal and compliance obligations under regulations such as the General Data Protection Regulation (GDPR) and the Payment Card Industry Data Security Standard (PCI DSS). If PII isn’t properly redacted before sharing or processing data, the result can be regulatory penalties, reputational damage, and erosion of customer trust.

PII redaction in real-world image datasets is particularly challenging. Unlike structured text, PII in images can appear in unexpected places and forms: a partial face captured at the edge of a frame, a face reflected on the polished surface of a car, a partially visible street sign that, combined with other visual cues, becomes identifiable, or a document lying on a desk in a wide-angle photo that reveals names, addresses, or ID numbers. These edge cases routinely defeat single-purpose masking tools.

[Amazon Nova](<https://aws.amazon.com/nova/models/?trk=33dc490e-0fb2-4cb1-a521-3941c13b64c0&sc_channel=ps>) is a family of foundation models with advanced vision understanding capabilities, making it a strong candidate to serve as the intelligent coordinator for complex image analysis workflows. Nova interprets image content holistically, reasons about whether something constitutes PII in context, including the subtle and unusual cases described earlier, and directs the entire redaction pipeline from start to finish. By understanding the “what” of PII, Nova coordinates specialized tools to achieve pixel-level precision in redaction while preserving the overall value of the image.

In this post, we present a multi-step pipeline directed by Amazon Nova, which uses its contextual vision reasoning to coordinate complementary tools, including Meta’s open-source Segment Anything Model (SAM 3) deployed on [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/?trk=047fc009-5bd4-4337-800d-8b880665cece&sc_channel=ps&trk=c3974822-373e-499b-9739-834a50722377&sc_channel=ps&ef_id=CjwKCAjwuO_QBhAWEiwAIkVhU_SEPtv0f-b7rSZQYrxPl_-56NFn16ZJoiNS46JpT4hYCiMKhkwu2xoCNY0QAvD_BwE:G:s&s_kwcid=AL!4422!3!795877020716!e!!g!!sagemaker%20ai!23532472972!194311071804&gad_campaignid=23532472972&gclid=CjwKCAjwuO_QBhAWEiwAIkVhU_SEPtv0f-b7rSZQYrxPl_-56NFn16ZJoiNS46JpT4hYCiMKhkwu2xoCNY0QAvD_BwE>) for pixel-level segmentation, and [Amazon Textract](<https://aws.amazon.com/textract/>) for optical character recognition (OCR). This pipeline is designed to provide comprehensive and compliant PII redaction even for challenging edge cases such as fingerprints, ID cards, or license plates in arbitrary orientations.

## Solution overview

This solution uses the following key services to achieve comprehensive PII redaction:

### Nova 2 Lite

Amazon Nova 2 Lite is a fast, cost-effective multimodal foundation model that processes text, images, videos, and documents. Available in [Amazon Bedrock](<https://aws.amazon.com/bedrock>), the model offers strong price-performance and helps enterprises and developers build capable, reliable, and efficient applications. It serves as the central coordinator of this solution, coordinating the entire PII detection and redaction workflow, making decisions at every stage, and coordinating specialized services to achieve comprehensive results.

### Segment Anything Model (SAM 3)

SAM 3 is an open-source segmentation model that detects, segments, and tracks objects in images from text and visual prompts. In this solution, SAM 3 acts as a precision instrument directed by Nova. When Nova identifies visual PII elements, it delegates the segmentation task to SAM 3 to produce exact boundaries for redaction.

SAM 3 segmentation masks overlaid on the original image when prompted with the word ‘flower’ on model playground (https://ai.meta.com/research/sam3/)

### Amazon Textract

Amazon Textract is an ML service that automatically extracts text, handwriting, layout elements, and data from formats such as PDFs, images, tables, and forms. In this pipeline, Amazon Textract serves as Nova’s OCR capability. When Nova determines that an image contains textual PII, it directs Amazon Textract to extract all text content along with their coordinates, which Nova then evaluates to determine what constitutes sensitive information, taking into account context of the entire image.

### PII detection

Common PII items found in images include, but are not limited to:

  * Name.
  * Identification number, such as driver’s license number.
  * Address.
  * Telephone number.
  * Asset information, such as Media Access Control (MAC) address.
  * Property identification number, such as a vehicle identification number (VIN).
  * Personal characteristic, such as facial images.
  * Biometric data, such as fingerprints.



These items can be divided into 2 modalities: textual (name, identification number, address, telephone number, asset information, and property identification number) and visual (personal characteristics and biometric data).

Nova directs a workflow with access to two sub-processes, each identifying either the pixel coordinates of the textual or the visual PII items. Nova first performs an initial assessment of the image to determine what types of PII are present, then intelligently routes the image to the appropriate sub-processes. An AWS Lambda function subsequently obscures the contents at the coordinates identified under Nova’s direction.

This solution is ideal for one-off or batch image pre-processing scenarios where high redaction accuracy is required. Nova 2 Lite’s strong price-performance, low latency, and advanced multimodal reasoning make it well-suited to coordinate this workflow, delivering accurate PII redaction without requiring your organization to have deep machine learning expertise or to fine-tune purpose-built models.

## Prerequisites

To follow along with this solution, you should have:

  * An AWS account.
  * Familiarity with Amazon Bedrock, Amazon SageMaker AI, [Amazon Simple Storage Service](<https://aws.amazon.com/s3/>) (Amazon S3), [AWS Lambda](<https://aws.amazon.com/pm/lambda/?trk=787b43c8-35d2-4537-bf86-d42e7c121401&sc_channel=ps&ef_id=CjwKCAjwjtTNBhB0EiwAuswYhn24Uq2Bt6TTYg3nK2K9N_nKetvrkOs45tJOZ4-kVMJYfk1hZavFShoCVeoQAvD_BwE:G:s&s_kwcid=AL!4422!3!795794141653!e!!g!!amazon%20lambda!23527793966!192204324466&gad_campaignid=23527793966&gbraid=0AAAAADjHtp_DJwRcBBdbHLaptszTVpfxR&gclid=CjwKCAjwjtTNBhB0EiwAuswYhn24Uq2Bt6TTYg3nK2K9N_nKetvrkOs45tJOZ4-kVMJYfk1hZavFShoCVeoQAvD_BwE>), [AWS Step Functions](<https://aws.amazon.com/step-functions/>), [Amazon EventBridge](<https://aws.amazon.com/eventbridge/>), and Amazon Textract.
  * Access to Nova 2 Lite via Amazon Bedrock in your AWS Region.
  * [Deploy SAM 3](<https://github.com/facebookresearch/sam3>) on SageMaker AI.
  * Basic knowledge of AWS Software Development Kits (SDK).
  * Basic understanding of computer vision concepts and image processing.
  * Familiarity with foundation models and prompt engineering techniques.



Please be aware that this solution will incur AWS charges including: S3 storage, Lambda invocations, Step Functions state transitions, SageMaker AI endpoint hosting, Amazon Bedrock API calls, and Amazon Textract API calls. Make sure you understand the pricing for these services in your AWS Region before you create the corresponding resources.

## Solution architecture

This section describes an architectural guidance where Nova drives the image processing workflow and directs parallel textual and visual analysis to identify and redact sensitive information.

### 1\. Document upload and workflow trigger

When you upload an image to the S3 `input/` folder, an S3 event notification triggers an EventBridge rule, which initiates the AWS Step Functions workflow.

### 2\. File validation and initial PII screening

The workflow first validates that your uploaded file type is compatible with Amazon Bedrock supported image formats. After validation, Nova 2 Lite performs its initial assessment of the image, acting as the first line of intelligence to determine whether PII is present. If Nova determines that no PII exists, the workflow exits early and the image is immediately moved to the S3 noPII/ folder, ready for downstream use without further processing. Most business images contain no PII. This early-exit decision by Nova routes away a large number of images at the first and least expensive step. It significantly reduces overall pipeline cost by avoiding unnecessary invocations of downstream services such as Amazon Textract and SAM 3 on SageMaker AI.

### 3\. Parallel PII detection: Visual process

When Nova 2 Lite identifies potential PII, it classifies the detected PII by type, textual, visual, or both, and makes the routing decision for downstream processing. Based on Nova’s classification, the Step Functions workflow selectively invokes one or both specialized processes: the textual process if Nova detected textual PII, the visual process if Nova detected visual PII, or both processes in parallel if Nova identified both types.

The visual process focuses on detecting visual PII elements such as faces and license plates within your image. Under Nova’s direction, SAM 3, deployed on SageMaker AI, is prompted to locate visual PII elements and produce pixel-by-pixel segmentation masks. A segmentation mask is a pixel-level outline that traces the exact shape of an object in an image. It labels each pixel as either belonging to that object or not, similar to a precise digital stencil. Unlike a simple bounding box (a rough rectangle around an object), a segmentation mask follows the true contours of the detected item, allowing redaction of only the sensitive pixels without obscuring surrounding content. This precision approach, guided by Nova’s initial PII classification, helps maintain the image’s value while removing only the sensitive regions. For example, when training ML models on large image datasets, this method helps prevent PII from being passed to the model while preserving your dataset size and non-sensitive visual information.

### 4\. Parallel PII detection: Textual process

The textual process uses Nova’s multimodal reasoning to analyze text embedded within your image with the help of Amazon Textract. First, Amazon Textract identifies pixel-level location of text in images and extracts its content. It provides both axis-aligned bounding box and polygon coordinates for each detected text element, and you can choose which coordinate type best suits your redaction needs. Nova 2 Lite then evaluates each extracted text element, alongside the raw image, to determine which ones contain PII such as names, addresses, or identification numbers. This is where Nova’s contextual intelligence is critical: some text elements, when considered in isolation, might not appear to be PII, but Nova can reason about the surrounding visual context in the image to recognize their sensitive nature. For example, a street name and a street number broken into 2 locations do not constitute PII separately by themselves, but because they both appear in the same image, the full address is visible and should be obscured as PII. As a multimodal model, Nova can process text and image simultaneously to make these nuanced PII determinations. Finally, Amazon Textract returns the coordinates of the text that Nova identified as PII for use in the next step.

### 5\. PII redaction and final verification

After the sub-process(es) complete their analysis under Nova’s direction, their coordinate outputs are passed to the next stage for redaction. Recall that the output from the visual process is segmentation mask coordinates from SAM 3, while the output from the textual process is bounding box or polygon coordinates from Amazon Textract.

A Lambda function merges coordinates returned from the process(es) into a unified set of PII locations across your image. The `RedactPII` Lambda function then obscures the identified regions in the original image using the `Pillow` (`PIL`) library in Python and stores the redacted image in the S3 redacted/ folder.

As a final quality assurance step, Nova 2 Lite performs a comprehensive review of the redacted image to decide if all detected PII has been removed. This final verification uses Nova’s holistic vision understanding to catch any residual sensitive content. If Nova determines that the image is clean, it is moved to the S3 noPII/ folder for downstream use. If Nova still detects PII, the image is moved to a quarantine folder for manual review, designed to help prevent PII from slipping through.

### 6\. Test the solution

To verify that the solution is working correctly, follow these steps:

  1. Use a sample test image containing PII. You can use an AI-generated image.
  2. Upload the image to the S3 originals/ bucket using the AWS Command Line Interface (AWS CLI) or the Amazon S3 console.
  3. Monitor the Step Functions execution on the AWS Step Functions console to track the workflow progress.
  4. Verify the redacted image appears in the S3 redacted/ or humanreview/ folder.
  5. Download the output image from the S3 redacted/ or humanreview/ folder.
  6. Inspect the image to check if PII has been successfully removed, or identify PII elements (for example, niche elements beyond those cited in the “PII detection” section) that require human review.



AI-generated image with textual PII (address) and visual PII (face)

PII elements redacted in the same image by pipeline using bounding box coordinates from Amazon Textract and segmentation mask coordinates from SAM 3

## Clean up

Complete the following steps to clean up your resources when you no longer need this solution. Before proceeding with cleanup, make sure you have backed up any data you need to retain from the S3 buckets. The following steps will permanently delete all resources and data.

  1. Back up any necessary data from the S3 buckets.
  2. Delete the S3 buckets (`originals/`, `noPII/`, `redacted/`, and `humanreview/`)
  3. Delete the SageMaker AI endpoint hosting the SAM 3 model.
  4. Delete the Step Functions state machine.
  5. Delete the Lambda functions (PII detection, redaction, and final verification).
  6. Delete the EventBridge rule configured for S3 event notifications.



## Conclusion

In this post, we demonstrated how Amazon Nova 2 Lite serves as the intelligent coordinator of a serverless, automated pipeline for detecting and redacting PII from images without requiring custom model training or fine-tuning. Nova’s multimodal reasoning drives every decision in the workflow: from initial PII detection and classification, through intelligent routing to specialized tools like Amazon Textract and SAM 3 on Amazon SageMaker AI, to final quality verification of the redacted output. With Nova 2 Lite’s strong price-performance and advanced vision capabilities, organizations can deploy PII redaction at scale while maintaining full compliance with data protection regulations.

This post provides architectural guidance that you can adapt to your specific compliance requirements and deploy in your own AWS account. To get started, explore Amazon Nova models in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>), and refer to the [Amazon Nova documentation](<https://docs.aws.amazon.com/nova/>), the [Amazon Textract documentation](<https://docs.aws.amazon.com/textract/>), and the [Amazon SageMaker AI documentation](<https://docs.aws.amazon.com/sagemaker/>) to deploy the complementary services used in this pipeline.

* * *

## About the authors

### Caroline Des Rochers

Caroline is a Montreal-based bilingual Solutions Architect at Amazon Web Services. She works closely with financial institutions to accelerate their AI and cloud transformation journeys, embrace innovation, and create new business opportunities. Outside work, she’s a passionate skier and cyclist, always ready for new outdoor adventures.

### Caitlin McDonald

Caitlin is a Montreal-based bilingual Solutions Architect at AWS with a development background. Caitlin works with customers to accelerate innovation and advise them through technical challenges. An advocate for practical AI, helping organizations turn AI’s potential into meaningful business outcomes. In her spare time, she enjoys triathlons, hockey, and traveling.

### Karen Lee

Karen is a Solutions Architect at Amazon Web Services, previously based in Hong Kong, now based in Montreal. She works with Independent Software Vendors who provide various technology solutions. Karen frequently travels to see her customers and the many sights of the world.

### Isabelle Charette

Isabelle is a Solutions Architect at AWS, based in Montreal, where she helps customers tackle technical challenges and move faster in the cloud in both English and French. With a background in software development, she brings a builder’s mindset to every engagement. When she’s not at her desk, she’s most likely halfway up a rock face or somewhere in the mountains.

### Eric Borland

Eric is a Senior Solutions Developer on the Prototyping and Customer Engineering (PACE) team within Amazon Web Services Industries (AWSI), based in Barcelona. He builds prototypes for global customers to derisk the most complex parts of their AWS workloads. Outside work, he plays and coaches sports, and enjoys building small startups.
