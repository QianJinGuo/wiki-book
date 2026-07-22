---
title: "Automate Schema Generation for Intelligent Document Processing"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/automate-schema-generation-for-intelligent-document-processing/
tags: [aws-china-blog, agentic-ai, context-engineering]
review_value: 8
review_confidence: 9
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
date: 2026-05-13
sha256: b7337f233f0aa9872e0a5f3efb923b6f22e5dab5d1bf5ecec146b6eca9a37ec1
---
Title: Automate schema generation for intelligent document processing | Amazon Web Services
URL Source: https://aws.amazon.com/blogs/machine-learning/automate-schema-generation-for-intelligent-document-processing/
Published Time: 2026-05-12T07:54:08-08:00
Markdown Content:
Before you can extract information from documents using intelligent document processing (IDP) techniques, you need a schema for each document class that defines what to extract. But how do you create schemas when you have thousands of documents and don’t know what classes exist? Doing this at scale can take substantial manual effort, making downstream IDP initiatives difficult to justify.
In this post, we’ll show you how our multi-document discovery feature solves this problem. It serves as an automated pre-processing step, analyzing unknown documents, clustering them by type, and generating schemas ready for the [IDP Accelerator](https://aws.amazon.com/blogs/machine-learning/accelerate-intelligent-document-processing-with-generative-ai-on-aws/). You’ll learn how the new capability uses visual embeddings for automatic clustering and agents for schema generation. We’ll also walk you through running the solution on your own document collections.
## IDP Accelerator
The [IDP Accelerator](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws) is a scalable, serverless, open-source solution for automated document processing and information extraction. To customize the solution to your specific document types, it requires a [configuration file](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/docs/configuration.md) where you specify the classes and fields. For a minimal configuration example, see the IDP Accelerator [GitHub repo](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/docs/configuration.md#minimal-configuration-example).
Without a good understanding of your document types, creating this schema can be difficult. The IDP Accelerator includes a [Discovery Module](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/docs/discovery.md) that can bootstrap a class configuration from a single example document. However, you must already know your document classes and be able to identify a representative example document for each class. The multi-document discovery feature introduced in this post removes that prerequisite, accelerating your path to applying the IDP Accelerator to a collection of unlabeled documents.
## Solution overview
The following video shows the solution in the IDP Accelerator Console.
The multi-document discovery feature automates the transformation of unclassified document collections into structured schemas ready for downstream IDP initiatives. This solution is integrated into the IDP accelerator’s existing Discovery Module. It’s a new “Multiple Document” capability alongside the “Single Document” discovery feature. An [AWS Step Functions](https://aws.amazon.com/step-functions/) state machine and [AWS Lambda](https://aws.amazon.com/lambda/) function provide orchestration and serverless compute. The solution processes documents from an [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/s3/) bucket or Zip file upload. Models available through [Amazon Bedrock](https://aws.amazon.com/bedrock/) generate schemas that automatically integrate into the IDP Accelerator configuration file. The following diagram shows the full workflow.
![Image 1: Architecture diagram showing an AWS Multi-Document Discovery Job pipeline that processes raw documents from S3 through embedding, clustering, schema generation with Strands Agents, and schema analysis to produce quality reports.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-2.png)
The discovery job starts by converting each document in [Amazon S3](https://aws.amazon.com/s3/) into a vector embedding using an embedding model available on [Amazon Bedrock](https://aws.amazon.com/bedrock/), then groups similar documents into clusters. An agent built with [Strands Agents](https://strandsagents.com/) and an Amazon Bedrock LLM analyzes each cluster to identify the document type and generate a schema. Finally, a reflection step reviews schemas together to catch overlaps and inconsistencies before your final review.
## Technical details
We’ll walk through each step of the process, highlighting key decisions and implementation details.
### Embedding generation
The workflow creates an embedding for each document, converting visual features into numerical representations. For multi-page documents, only the first page is used. Currently, the workflow uses visual embeddings rather than OCR-based text because visual embeddings capture layout, formatting, and structural cues that distinguish document types, even when the text content is similar. The solution uses [Cohere Embed v4](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-embed-v4.html) through Amazon Bedrock as the default embedding model for the discovery job. The embedding step automatically handles common pain points and obstacles like image compression, retry logic, and rate limiting.
### Document clustering
The multi-document discovery feature learns how many document types are in your collection using the [silhouette score](https://en.wikipedia.org/wiki/Silhouette_(clustering)). In this context, the silhouette score provides a measure of how well-separated the clusters are from one another and how compact documents are within each cluster. Using k-means clustering, the agent tests k values from 2 to 20 by default and selects the grouping with the highest silhouette score. Here k represents the number of distinct document types in your collection. To create meaningful clusters, each must contain at least two documents. If necessary, the upper k bound is reduced below 20 to satisfy this constraint.
### Benchmarking embeddings and clustering
To validate the embedding and clustering approach, we ran experiments with Cohere Embed v4 on the subset of the [OCR-benchmark dataset](https://huggingface.co/datasets/getomni-ai/ocr-benchmark) available in the test set bucket deployed with the IDP Accelerator CloudFormation stack. To find your bucket name, go to the CloudFormation console, select your IDP Accelerator stack, open the Outputs tab, and look for the key `S3TestSetBucketName`.
This dataset consists of single-page document types. The deployed subset contains 293 documents across 9 document types: bank check, commercial lease agreement, credit card statement, delivery note, equipment inspection, glossary, petition form, real estate, and shift schedule.
To evaluate if k-means clustering can correctly identify these groupings using the Cohere embedding model, we tested the silhouette score as a metric for selecting the optimal k value. We ran the first two stages of the pipeline (embedding and clustering) and analyzed the silhouette score across k values ranging from 2 to 20. The following plot shows the silhouette score distribution across these k values. The highest silhouette score occurs at k=9, which matches the ground truth number of document types in the dataset.
![Image 2: Line chart showing silhouette score versus number of clusters (k = 2–20), peaking at k = 9 with a score of approximately 0.43, indicated by a red dashed vertical line.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-3.png)
The TSNE-plot (t-distributed Stochastic Neighbor Embedding plot, a visualization technique that reduces high-dimensional data to 2D space while preserving relationships between data points) shows the visualization of these embeddings in 2-dimensional space, with the cluster classification shown in the legend.
![Image 3: t-SNE scatter plot of document embeddings showing 9 document types forming distinct, well-separated clusters, validating effective embedding quality for document classification.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-4.png)
The clustering achieved a perfect Adjusted Rand Index (ARI) and Normalized Mutual Information (NMI) of 1.0. ARI measures how well the clustering matches the true groupings, while NMI quantifies the amount of information shared between the predicted and actual clusters. Every cluster maps one-to-one to a ground truth document class at 100% purity. These results demonstrate that high-quality multimodal embeddings can enable fully unsupervised document classification. The embeddings accurately separate diverse document types, such as bank checks, real estate forms, and credit card statements, without labeled training data.
**Note:** Performance on this benchmark dataset does not guarantee similar results on your specific document data because the characteristics of your dataset directly influence the quality of the results.
### Agentic schema generation
After the clusters are identified, the pipeline enters the agentic phase. For each cluster, a [Strands Agent](https://strandsagents.com/latest/) is invoked to determine the document type and generate a schema. We chose Strands Agents for its model-driven approach. It gives the model the flexibility to reason through each schema autonomously. The agent needs to strategically visualize documents at various locations within the cluster to capture the full variety before generating a schema. For example, it examines one document near the center, one at the periphery, and one at a middle distance. A more deterministic, fixed sampling approach wouldn’t work here because clustering quality depends heavily on your specific documents. To do this, the agent is equipped with two specialized tools:
*   Cluster Analysis Tool – Retrieves document IDs ordered by distance from the cluster centroid, enabling the agent to sample strategically across the range of variation within the cluster.
*   Document Viewer Tool – Fetches and compresses document images for visual inspection, automatically handling size constraints for the model’s context window.
The agent’s system prompt encodes domain expertise about JSON Schema conventions and [IDP Accelerator configuration](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/tree/main/config_library) requirements. It instructs the agent to:
*   Sample documents strategically, stopping early if confident it has sufficient coverage.
*   Generate JSON Schemas with proper metadata, type definitions, and descriptions.
*   Include IDP Accelerator-specific annotations such as `x-aws-idp-document-type` and `x-aws-idp-evaluation-method`. `x-aws-idp-evaluation-method`is used by the [Stickler](https://github.com/awslabs/stickler)-based evaluation extension.
*   Create reusable `$defs` for common structures like addresses, line items, and tax information.
*   Apply appropriate evaluation methods based on field type: `EXACT` for strings, `NUMERIC_EXACT` for numbers, `LLM` for complex or nested objects.
The tools, prompt, and model equip the agent with capabilities to reason about its own sampling strategy. These agents run in parallel, so you’re not waiting for each cluster to finish before the next one starts _._
### Schema analysis
After each agent independently generates a schema, the schema analysis step evaluates the holistic differentiation between the output. It assesses whether the discovered document groupings are well-separated or overlapping, and whether the generated schemas are complete and consistent. It looks for redundancies or duplication across document types. Based on these findings, it surfaces concrete recommendations such as merging clusters or refining field definitions. It produces a summary report including a human-readable overview of your classes. This quality report is visible to you in the Discovery Job details of the IDP Accelerator.
## Running a job on your documents
To run the multi-document discovery workflow on your own documents, follow these steps in the IDP Accelerator Console.
**Step 1: Create a new configuration**
Start by creating a fresh configuration in the IDP Accelerator Console:
1.   Navigate to the **Configuration** section and select **View/Edit Configuration.**
2.   Choose **Document Schema**>**Wipe All** to create a new empty configuration.
3.   Select **Save as Version**, provide a descriptive **Version Name**, then choose **Save as Version.**
![Image 4: Screenshot of the AWS IDP Document Processing Configuration console showing the Document Schema tab with a "Save as New Version" modal dialog, where the version name "multi-doc-discovery-config" is entered.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-5.png)
**Step 2: Run multi-document discovery**
With your configuration ready, initiate the discovery process:
1.   Navigate to the **Discovery** section and select the **Multiple Documents option.**
2.   Choose the configuration version you just created.
3.   Configure your document source: 
    1.   Select either **S3 Path** or Zip Upload.
    2.   Choose your source bucket.
    3.   Specify the S3 prefix where your documents are stored.
**Note:**Your documents must be added to one of the IDP Accelerator’s existing buckets (Discovery Bucket, Test Bucket, or Input Bucket) to use the Source Bucket option.
1.   Choose **Start Discovery** to trigger the state machine.
## ![Image 5: Screenshot of the AWS IDP Discovery console's Multiple Documents tab, showing the Start Multi-Document Discovery form configured with an S3 path source, "multi-doc-discovery-config" version, and an empty discovery jobs table.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-6.png)
**Step 3: Monitor discovery job and view results**
Track your discovery job progress:
*   A new entry will appear in the **Multi-Document Discovery Jobs** table showing execution status, current step, and metadata.
*   After the job completes, choose the **Source** field to view results:
![Image 6: Screenshot of the AWS IDP Discovery Job Details page showing a completed multi-document discovery job that found 9 clusters in 15 minutes, with the BankCheck class expanded to display its generated JSON Schema.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-7.png)
*   Scroll to the bottom of the Discovery Job Details to access the **Quality Report:**
![Image 7: Screenshot of the AWS IDP Discovery Job results showing the last two discovered classes (MedicalEquipmentInspectionChecklist and DeliveryNote) followed by the Quality Review Report with an overview table of all 9 document clusters and the beginning of a schema quality assessment.](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/05/01/ml-20447-8.png)
The discovered classes and their JSON schemas automatically integrate into your configuration file.
## Best practices for optimal results
Before you run the multi-document discovery job at scale, there are a few best practices worth keeping in mind. Because the workflow currently processes only the first page of each PDF, make sure your input files are single-document files. Multi-document packets aren’t yet supported. After you have initial results, thoroughly review the quality report summary to catch issues like overlapping clusters or uneven document distributions before you finalize your schemas.
## Next steps
Where you go from here depends on what the workflow found in your documents:
*   If your schemas look clean and the quality report shows low overlap: You’re ready to move forward with running IDP at scale on your documents. The schemas are automatically added to the classes field of the IDP Accelerator configuration.
*   If the quality report flagged overlapping clusters, review the recommendations and use them to refine the generated schemas. This might include merging similar schemas into a single class or adjusting field definitions to reduce overlap.
*   If schema quality is inconsistent across clusters: Check whether your document collection has a highly uneven distribution of document types. Running the discovery job on a more balanced subset can help the agent produce more reliable clusters and schemas.
## Conclusion
In this post, we showed you how the multi-document discovery feature solves the challenge of needing schemas before you can process documents but needing to process documents before you can build schemas. The solution combines visual embeddings, automatic clustering, and agentic schema generation with multimodal LLMs. It transforms an opaque collection of unknown documents into structured, review-ready document classes and schemas. You’ve seen how the workflow handles embedding generation, cluster tuning, and parallel classification and schema generation. You’ve also seen how the reflection step gives you a transparent analysis into the agent’s generated output for human review.
We’d love to hear how the multi-document discovery feature works on your document collections. Share your results, questions, or suggestions in the comments below. If you run into issues or want to contribute, open an issue or pull request in the [GitHub repository](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws).
* * *
## About the authors