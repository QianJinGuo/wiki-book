sha256: b7190a26912257dd89d6bedde7f9c47e465ed825091e3e982f5624982973d622
---
source: AWS China ML
source_url: https://aws.amazon.com/blogs/machine-learning/building-bilingual-ner-for-cargo-logistics-with-amazon-bedrock
ingested: 2026-07-01
feed_name: AWS China ML
source_published: 2026-06-30
---

# Building bilingual NER for cargo logistics with Amazon Bedrock

[IBS Software](<https://www.ibsplc.com/>)’s Cargo system processes thousands of bilingual cargo logistics email messages daily. The system extracts critical information such as air waybill (AWB) numbers, flight details, weights, and delivery instructions in both English and Japanese. This added to the complexity of building a robust Named Entity Recognition (NER) solution. Challenges included manual intervention that slowed operations and a trade-off between accuracy and cost. IBS Software needed an AI solution that could accurately identify 23 different entity types across two languages while remaining cost-effective at scale.

After exploring multiple approaches, IBS Software used managed distillation capabilities of Amazon Bedrock to create a production-ready solution. By distilling knowledge from Amazon Nova Pro into the more efficient [Amazon Nova Lite](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-lite.html>) model, IBS Software achieved 95.085 percent F1-Score accuracy while reducing operational costs by 14x. This case study details their journey from facing complex open-source implementations to a successful deployment on AWS that now processes cargo email messages in real time.

In this post, we share the technical approach using token-based distillation, lessons learned, and deployment architecture. If you face similar bilingual NER challenges, you can benefit from IBS Software’s experience with the [Amazon Bedrock](<https://aws.amazon.com/bedrock/model-distillation/>) knowledge distillation capabilities.

## Overview of solution

The goal was to build a bilingual NER system capable of extracting 23 entity types from cargo logistics email messages written in English and Japanese. The key entities include:

  * AWB (Air Waybill) numbers.
  * Flight numbers and routes.
  * Weights (gross, chargeable, dimensional).
  * Dimensions and volume.
  * Commodity descriptions.
  * Shipper and consignee information.
  * Special handling codes.
  * Delivery instructions.



The primary risks included maintaining high accuracy across both languages, managing inference costs at scale, and achieving low latency for real-time processing. With the model distillation capabilities of Amazon Bedrock, you can use smaller, faster, and more cost-effective models. These models deliver accuracy for your use case that is comparable to the most advanced models in Amazon Bedrock.

The following diagram shows the end-to-end bilingual NER workflow on Amazon Bedrock.

_Figure 1: End-to-end bilingual NER workflow on Amazon Bedrock_

## Solution

IBS’s team of nine researchers and engineers spent approximately 4 months developing and deploying this solution. The project timeline included:

  * **Month 1:** Dataset preparation and annotation of 500 bilingual email messages.
  * **Month 2:** Challenges with open-source frameworks (PyTorch, TextBrewer).
  * **Month 3:** Successful distillation using Amazon Bedrock (Nova Pro → Nova Lite).
  * **Month 4:** Production deployment and optimization.



Key tasks completed:

  * Annotated 500 cargo email messages (350 English, 150 Japanese) with 23 entity types.
  * Configured Amazon Bedrock distillation with custom hyperparameters.
  * Trained student model for 4 epochs over 70 steps.
  * Achieved loss reduction from 0.05 to 0.008.
  * Deployed inference endpoint with .eml file processing pipeline.
  * Validated 95.085 percent F1-Score on test set.



IBS Software deployed all infrastructure using Amazon Bedrock managed services, which bypassed the need for custom model hosting infrastructure.

### Challenges with open-source approaches

Initially, the team attempted knowledge distillation using open-source frameworks including PyTorch-based implementations and the TextBrewer library. These approaches failed because of:

  * Complexity in configuring distillation pipelines for bilingual data.
  * Lack of managed infrastructure for training and deployment.
  * Difficulty tuning hyperparameters for token-level distillation.
  * Incompatibility with our production email processing workflow.



For more details on knowledge distillation fundamentals, see [AWS Machine Learning Best Practices](<https://docs.aws.amazon.com/machine-learning/>).

### Amazon Bedrock distillation approach

We pivoted to Amazon Bedrock Model Distillation, using Amazon Nova Pro as the teacher model and Nova Lite as the student model. The key advantages included:

  * Managed training infrastructure with automatic hyperparameter optimization.
  * Native support for token-level distillation.
  * Ease of integration with our email processing pipeline.
  * Built-in monitoring and evaluation metrics.



**Training configuration:**
    
    
    distillation_config = {
        "teacher_model": "amazon.nova-pro-v1:0",
        "student_model": "amazon.nova-lite-v1:0",
        "max_sequence_length": 2048,
        "epochs": 4,
        "training_steps": 70,
        "loss_function": "token_level_kl_divergence"
    }

The training process reduced loss from 0.05 to 0.008 over 70 steps, indicating strong knowledge transfer from teacher to student.

For Amazon Bedrock distillation documentation, see [Customize a model with distillation in Amazon Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-distillation.html>).

### Dataset preparation

Our dataset consisted of 500 real-world cargo logistics email messages:

  * **350 English email messages:** Standard cargo documentation with AWB numbers, flight details, weights, and handling instructions.
  * **150 Japanese email messages:** Similar content with Japanese-specific formatting and terminology.



Each email message was manually annotated for 23 entity types by domain experts familiar with cargo logistics terminology. The annotation process took approximately 3 weeks and supplied high-quality training data for both languages.

### Model evaluation

We evaluated both teacher and student models using F1-Score, the harmonic mean of precision and recall:

**Results:**

Although the base Nova Lite model offered approximately 84 percent overall F1-Score, the teacher model and the customized Nova Lite model achieved an approximately 10 percent uplift in accuracy. The following table shows the F1-Score results.

**Model** | **Overall F1-Score** | **English F1-Score** | **Japanese F1-Score**  
---|---|---|---  
Nova Pro (Teacher) | 97.0% | 97.8% | 96.2%  
Nova Lite (Student) | 95.085% | 96.535% | 93.635%  
  
The distilled Nova Lite model retained 98 percent of the teacher’s performance while providing 14x cost reduction in production inference.

### Error analysis and challenges

We observed that the student model showed a 2.565 percent lower F1-Score on Japanese text than on English text. This gap came primarily from complex kanji character combinations in commodity descriptions, ambiguous entity boundaries in Japanese text without spaces, and the smaller volume of Japanese training data (150 compared to 350 email messages). Multi-line delivery instructions with embedded entities also occasionally caused boundary detection errors.

To overcome these challenges, we augmented Japanese training data with synthetic examples. We also applied post-processing rules for known entity patterns (AWB format, flight number regex) and implemented confidence thresholding to flag low-confidence predictions for human review.

### Deployment workflow

**Note:** The following deployment creates AWS resources that incur charges. Amazon Simple Storage Service (Amazon S3) storage, AWS Lambda invocations, Amazon Bedrock model inference, and Amazon DynamoDB storage all have associated costs. Delete these resources when you no longer need them to avoid ongoing charges.

Our production deployment processes .eml files through the following workflow:

  1. **Email ingestion:** Cargo email messages arrive as .eml files in Amazon S3.
  2. **Preprocessing:** AWS Lambda extracts email body and metadata.
  3. **Inference:** Amazon Bedrock endpoint processes text with distilled Nova Lite model.
  4. **Entity extraction:** Model returns 23 entity types with confidence scores.
  5. **Post-processing:** Validation rules and confidence filtering applied.
  6. **Output:** Structured JSON with extracted entities stored in Amazon DynamoDB.


    
    
    import boto3
    import json
    
    bedrock_runtime = boto3.client('bedrock-runtime')
    
    def extract_entities(email_text):
        response = bedrock_runtime.invoke_model(
            modelId='<custom model arn>',
            body=json.dumps({
                "inputText": email_text,
                "taskType": "NER",
                "entityTypes": [
                    "AWB_NUMBER", "FLIGHT_NUMBER", "WEIGHT_GROSS",
                    "WEIGHT_CHARGEABLE", "DIMENSIONS", "COMMODITY",
                    "SHIPPER", "CONSIGNEE", "HANDLING_CODE",
                    # ... 14 more entity types
                ]
            })
        )
    
        result = json.loads(response['body'].read())
        return result['entities']

For Lambda integration patterns, see [AWS Lambda with Amazon Bedrock](<https://docs.aws.amazon.com/lambda/latest/dg/services-bedrock.html>).

The entire pipeline processes email messages in under 2 seconds with 95.085 percent accuracy, meeting our real-time processing requirements.

## Conclusion

In this post, we showed how IBS Software used Amazon Bedrock managed distillation capabilities to build a cost-effective bilingual NER system for cargo logistics. The system achieves 95.085 percent F1-Score while reducing operational costs by 14x. The distilled Nova Lite model retains 98 percent of the teacher model’s performance, making it ideal for high-volume production workloads.

Our key takeaway was that Amazon Bedrock managed distillation capabilities alleviated the complexity of open-source frameworks. The token-level knowledge distillation preserved accuracy across both English and Japanese, and the 2048-token sequence length accommodated typical cargo email lengths. Production deployment with AWS Lambda and Amazon S3 integration required minimal custom infrastructure.

**Next steps:**

If you’re facing similar bilingual NER challenges, consider:

  1. Start with Amazon Bedrock on-demand foundation models for rapid prototyping.
  2. Invest in high-quality bilingual training data annotation.
  3. Explore model distillation with the training dataset. One limitation of model distillation is that the teacher model and the student model must be within the same model family.



For more information about the topics discussed in this post, see the following resources:

  * [A guide to Amazon Bedrock Model Distillation](<https://aws.amazon.com/blogs/machine-learning/a-guide-to-amazon-bedrock-model-distillation-preview/>)
  * [Accelerating custom entity recognition with Claude tool use in Amazon Bedrock](<https://aws.amazon.com/blogs/machine-learning/accelerating-custom-entity-recognition-with-claude-tool-use-in-amazon-bedrock/>)
  * [Build an AI-powered document processing platform with open-source NER model and LLM on Amazon SageMaker AI](<https://aws.amazon.com/blogs/machine-learning/build-an-ai-powered-document-processing-platform-with-open-source-ner-model-and-llm-on-amazon-sagemaker/>)



If you’re working on bilingual NER or knowledge distillation for your own use case, we’d love to hear about your experience. Share your questions or feedback in the comments.

* * *

## About the authors

 

### Manu Raj L S

Manu is a Principal Consultant, Data Science at IBS Software.

 

### Joshwin Lal Tennyson J S

Joshwin is a Lead AI Engineer at IBS Software.

 

### Basil K

Basil is a Lead Product Architect at IBS Software.

 

### Madhukiran J

Madhukiran is a Sr.Technical Account Manager at AWS Enterprise Support. He supports enterprise customers leverage AWS services like Bedrock, AgentCore, and SageMaker to build innovative solutions. His expertise spans Machine learning, GenAI and Containers (Amazon EKS, Amazon ECS)
