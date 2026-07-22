---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/object-detection-with-amazon-nova-2-lite/
ingested: 2026-06-03
feed_name: AWS China ML
review_value: 7
review_confidence: 7
review_recommendation: strong
review_stars: 4
sha256: bc1074e9c3343a6766bc1e18652b7289a67d7fe510ebf4fdbdc4c701021fe9be
---

# Object detection with Amazon Nova 2 Lite


# Object detection with Amazon Nova 2 Lite

Traditional computer vision solutions can require significant upfront investment. Setting up data pipelines, model training infrastructure, compute resources, and a dedicated data science team is often prohibitive for small companies or teams. [Amazon Nova 2 Lite](<https://aws.amazon.com/nova/>), available through Amazon Bedrock, provides an appealing alternative solution. This multimodal foundation model detects objects through natural language prompts with no training required. Specify “vehicle”, “person”, or “dent”, and Nova returns precise bounding box coordinates in structured JSON format.

In this post, we’ll walk through implementing object detection with Amazon Nova 2 Lite. You’ll learn how to deploy an object detection application using [Amazon Bedrock](<https://aws.amazon.com/bedrock/>), [AWS Lambda](<https://aws.amazon.com/lambda/>), and [Amazon API Gateway](<https://aws.amazon.com/api-gateway/>). You’ll also learn how to craft effective prompts, process structured JSON output, and visualize results. We explore practical applications across manufacturing, agriculture, and logistics.

## Solution overview

Before you begin, make sure you have the following:

**AWS account and permissions**

  * Active AWS account with Amazon Bedrock access enabled
  * IAM permissions for `bedrock:InvokeModel`
  * Access to Amazon Nova 2 Lite model in your region
  * AWS Command Line Interface (AWS CLI) configured (for deployment)



**Development environment** (for local testing)

  * Python 3.8 or later
  * AWS SDK for Python (Boto3) version 1.28.0+
  * Python Imaging Library (PIL/Pillow)



**Installation:**
    
    
    pip install boto3 pillow

**Estimated costs**

  * Amazon Bedrock: $0.0003 per thousand input tokens, $0.0025 per thousand output tokens
  * Typical image: 230 input tokens (~$0.000069 per image) & ~200 output tokens (~$0.0005 per image)
  * Example: 10,000 images ≈ $5.69
  * AWS Lambda, Amazon API Gateway: Pay-per-use (minimal for testing)



**Time estimate:** 30-45 minutes

The object detection solution uses four main steps to identify and localize objects in images.

**Steps:**

  1. **Prompt engineering** – Structure the prompt to specify objects and expected JSON output format
  2. **Amazon Bedrock** – Call Amazon Bedrock to access Amazon Nova 2 Lite without managing infrastructure, and extract bounding box information from the response
  3. **Coordinate processing** – Convert [Nova’s normalized coordinates (0-1000 scale)](<https://docs.aws.amazon.com/nova/latest/userguide/modalities-image.html>) to pixel positions
  4. **Visualization** – Render bounding boxes on images for validation



You send an image and a list of objects to detect through [Amazon Bedrock’s Converse API](<https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html>). Amazon Nova 2 Lite analyzes the image and returns a JSON response with bounding box coordinates for each detected object. You then convert the normalized coordinates (0-1000 scale) to pixel positions based on your image dimensions. Finally, you visualize results by drawing bounding boxes on the original image.

Deploy object detection in as little as hours – no model training, machine learning (ML) expertise, or infrastructure management required.

### Prompt

Prompt engineering plays an important role in achieving accurate detections. The prompt template (shown in the following example) contains a carefully crafted instruction set that specifies key requirements. Two variables in the prompt template: `elements` and `schema` are dynamically constructed based on detected object types, allowing the prompt template to handle arbitrary object categories without modifications.
    
    
    # Object Detection and Localization
    
    ## Objective
    
    Your task is to detect and localize objects in the target image with high precision and recall.
    
    ## Instruction
    
    - The objects to be detected are: {elements}
    
    - Analyze the provided target image and return only the reasoning and a JSON object with bounding box data for detected objects
    
    - Think step-by-step and then provide precise bounding box coordinates for each detection
    
    - Detect all instances of the specified objects
    
    - Fit bounding boxes tightly around each object
    
    - Do not output duplicate bounding boxes
    
    - Coordinates should use the format [x_min, y_min, x_max, y_max] where:
    
      * (x_min, y_min) is the top-left corner of the bounding box
    
      * (x_max, y_max) is the bottom-right corner of the bounding box
    
    ## Output Requirements and Examples
    
    The JSON output should strictly follow this structure including the word json:
    
    ```json
    
    {schema}
    
    ```
    
    ### Example JSON Structure:
    
    ```json
    
    {{
    "car": [{{
        "bbox": [321, 432, 543, 876],
    }}],
    "pedestrian": [{{
        "bbox": [432, 543, 654, 987],
    }},
    {{
        "bbox": [123, 234, 345, 678],
    }}],
    // Continue for all detected elements...
    }}
    
    ```
    
    Briefly explain the detection results and provide the specified JSON format wrapped within triple backticks.

For full implementation details, see our [GitHub repository](<https://github.com/aws-samples/sample-object-detection-nova-2-lite>).

## Example: Street scene detection

We tested Nova 2 Lite on a street scene image. Without any training or fine-tuning, we ask Nova to detect two object types: “vehicle” and “stop sign”.

As shown in Figure 1, Nova accurately detects not only obvious objects but also those that are small, distant, or partially occluded. The bounding boxes fit tightly around object boundaries with minimal gaps. Nova achieves this accuracy using only basic object names like “vehicle” and “stop sign” without any detailed descriptions.

_  
Figure 1. Bounding boxes generated by Amazon Nova 2 Lite for two object types: “vehicle” and “stop sign”._

## Deploy in the cloud

Amazon Bedrock provides API access to Amazon Nova 2 Lite, which means you can invoke it from any AWS compute service. Choose the service that best fits your workload.

### Choosing your compute platform

For event-driven workloads and API endpoints, AWS Lambda provides automatic scaling and a pay-per-invocation model that eliminates idle costs. If you need more control over your runtime environment or have long-running processes, [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>) gives you full flexibility to configure instances exactly as needed. Use [Amazon Elastic Container Service (Amazon ECS)](<https://aws.amazon.com/ecs/>) or [Amazon Elastic Kubernetes Service (Amazon EKS)](<https://aws.amazon.com/eks/>) for container-based deployments with automatic scaling.

Regardless of which compute service you choose, they all call the same Amazon Bedrock Converse API to interact with Nova models. This consistency makes it straightforward to integrate object detection into your existing infrastructure or to migrate between compute platforms as your requirements evolve.

### Building an object detection application

We built a sample serverless web application that showcases object detection with Amazon Nova 2 Lite. This proof of concept includes a web interface, secure infrastructure, and automatic scaling. You can deploy it to your own AWS account in minutes.

The application follows a serverless-first architecture using multiple AWS services working in concert. [Amazon CloudFront](<https://aws.amazon.com/cloudfront/>) serves the single-page application from a private Amazon Simple Storage Service (Amazon S3) bucket, providing global distribution and HTTPS enforcement through Origin Access Control. When a user uploads an image and specifies objects to detect, the front end sends the request to Amazon API Gateway, which routes it to an AWS Lambda function.

The Lambda function acts as the orchestration layer, calling Amazon Bedrock’s Converse API to send the image and detection prompt to Amazon Nova 2 Lite. Nova returns normalized bounding box coordinates for each detected object, which the Lambda function converts to pixel positions and renders as annotated boxes on the image. The annotated result flows back through the same path: Lambda to API Gateway to the front end. Users then see their image with detected objects highlighted.

Amazon CloudFront distributes the front end globally. API Gateway routes requests to Lambda, which calls Amazon Bedrock to run object detection. This architecture scales automatically and keeps each component focused on one job.

_Figure 2. Serverless object detection sample application architecture_

### Try it yourself

The complete source code, including all AWS Cloud Development Kit (AWS CDK) infrastructure definitions and the Lambda function, is available in the [GitHub repository](<https://github.com/aws-samples/sample-object-detection-nova-2-lite>). After you install the AWS CLI and AWS CDK and enable Amazon Nova 2 Lite access in the Amazon Bedrock console, deployment is straightforward.

This serverless pattern demonstrates how quickly you can build AI applications with Nova models. Because it’s all infrastructure as code, you can version control your entire application stack and deploy it consistently across multiple environments or AWS accounts.

## Clean up

To avoid ongoing charges, delete the resources created in this walkthrough.

**If you deployed the sample application:**
    
    
    # Delete the AWS CloudFormation stack
    cdk destroy
    
    # Verify resources are removed
    aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE

**Manual cleanup (if needed):**

  1. Delete the Amazon S3 bucket and contents
  2. Remove AWS Lambda functions
  3. Delete Amazon API Gateway endpoints
  4. Remove Amazon CloudFront distribution



**Cost implications:** Amazon Bedrock API calls are pay-per-use with no ongoing infrastructure costs. Once you delete the deployment resources, you only incur charges when making API calls.

## Practical applications

The following examples show how Amazon Nova 2 Lite applies to real-world use cases across industries.

### Manufacturing quality control

A metal fabrication facility processes 10,000 parts monthly. Each defective part that ships costs $50-200 in returns and rework. The significant upfront investment for training traditional computer vision models is often prohibitive for their operation.

With Amazon Nova 2 Lite, the facility automates quality inspection. They specify defects like “scratch”, “dent”, or “rust spot”, and the system identifies them automatically. Analyzing 5 images per part costs approximately $8 per month.

### Precision agriculture

A 5,000-acre farm captures weekly drone images during the 20-week growing season to detect crop issues early. Early detection prevents over-application of chemicals and crop damage.

The farm specifies: “diseased leaf”, “pest damage”, “fungus”. Processing 1.2 million high-resolution images per season costs roughly $200.

The same approach enables GPS-guided equipment to detect obstructions (for example, “vehicle”, “equipment”, “debris”), potentially allowing autonomous field operations.

### Logistics and fulfillment

Distribution centers identify damaged packages by specifying: “torn box”, “crushed package”, “water damage”. Systems automatically flag items for inspection and route them to quality control areas, ensuring consistent standards across operations.

This approach extends to inventory monitoring (for example, “empty shelf”, “misplaced item”) and safety compliance (for example, “hard hat”, “safety vest”, “safety glasses”), making computer vision accessible to operations of any size.

## Conclusion

In this post, we showed how Amazon Nova 2 Lite makes object detection accessible. By specifying object names through natural language prompts, you can deploy computer vision applications in hours instead of months, without managing any infrastructure. It delivers object detection performance through a single API with a pay-as-you-go cost structure and no machine learning (ML) expertise needed.

Ready to try it? Deploy the sample application from our [GitHub repository](<https://github.com/aws-samples/sample-object-detection-nova-2-lite>), or explore Amazon Nova models in the [Amazon Bedrock console](<https://console.aws.amazon.com/bedrock/>).

* * *

## About the authors

**Peter Yu** is a Senior Data Scientist at the AWS Generative AI Innovation Center, where he develops innovative generative AI solutions and partners with customers to unlock new possibilities across their business. He previously consulted at McKinsey & Company, delivering ML and data science solutions to drive business impact.

**Joyee Zhao** is a Senior Delivery Consultant within the AWS Professional Services team. In this role, she partners with enterprise customers to architect and deliver cloud-native solutions for their business-critical applications, focusing on areas such as application modernization, migration strategies, and operational excellence across complex digital transformation initiatives.

**Robert Stolz** is a Solutions Architect at AWS where he works with customers in the Financial Services Industry to drive business value through cloud adoption and AI solutions.

