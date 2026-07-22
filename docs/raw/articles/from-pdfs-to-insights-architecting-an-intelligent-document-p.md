---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/from-pdfs-to-insights-architecting-an-intelligent-document-processing-pipeline-with-aws-generative-ai-services
ingested: 2026-06-13
sha256: 2bcfee1e364641eb80996977dc7a703f2a798353b99d2a0468af663c59d58a93
feed_name: AWS China ML
source_published: 2026-06-12
---

# From PDFs to insights: Architecting an intelligent document processing pipeline with AWS generative AI services

Organizations process millions of documents daily, from insurance claims and invoices to legal contracts and medical records. While traditional optical character recognition (OCR) solutions extract text, they can’t understand context, relationships, or meaning embedded within complex documents. This limitation creates bottlenecks that require manual intervention, increasing processing time and costs while introducing potential errors.

[Amazon Bedrock Data Automation](<https://aws.amazon.com/bedrock/bda/>) (BDA), provides a unified API experience for extracting meaningful insights from multimodal content, including documents, images, videos, and audio files. Unlike traditional solutions that focus on text extraction, BDA understands document context, validates extracted data, and provides confidence scores for accuracy. BDA processes documents through a pipeline that automates complex tasks including document classification, extraction, normalization, and validation. When a document is submitted, BDA automatically splits it along logical boundaries, classifies each section into appropriate document types, and matches them to the correct processing blueprints. This intelligent routing removes the need for manual document sorting and orchestration of multiple AI models. The service supports a wide range of file formats, with support for up to 3,000 pages and 500 MB per API request, making it suitable for processing diverse document types at scale.

This post outlines the development of a cost-effective and scalable intelligent document processing pipeline on AWS, powered by Amazon Bedrock and its features. BDA is a managed service within Amazon Bedrock that automates the extraction of insights from documents. We demonstrate how BDA extracts and analyzes document content, while Strands Agent hosted on Amazon Bedrock AgentCore Runtime coordinate specialized processing tasks, and Amazon Bedrock Knowledge Base enable contextual understanding across multiple documents. By combining these capabilities within a unified architecture, organizations can transform their document processing workflows with minimal development effort.

## Solution overview

Our intelligent document processing pipeline combines generative AI with orchestrated workflows to automatically extract, analyze visual plots, graphs, and charts, and derive insights from documents while maintaining context and relationships across multiple data sources.The solution processes documents through four integrated layers:

  1. **Input processing layer** : Document upload triggers processing orchestration and state machine coordination.
  2. **Extraction and storage layer** : Raw text and table extraction, image and visual element analysis, and scalable data integration.
  3. **Intelligence layer** : Knowledge base ingestion with semantic search, multimodal foundation model (FM) analysis, and large language model (LLM)-powered interpretation.
  4. **Agentic coordination layer** : Coordinator agent and specialized task agents.



## Architecture components

### Input processing layer

The input processing layer forms the foundation of this solution. This layer manages the initial reception and routing of incoming documents. A Document Upload Triggers processing workflows when documents arrive in designated Amazon Simple Storage Service (Amzon S3) buckets, supporting various formats including PDFs, and scanned documents (in PDF).

BDA serves as the core extraction engine in the input processing layer, handling document splitting, classification, and content extraction through a unified API. AWS Step Functions orchestrates the workflow to maximize the capabilities of BDA in the Extraction and Storage Layer, providing operational visibility and control throughout the process. Here’s the detailed orchestration flow:

  * **Document Ingestion** : Files arrive in S3 buckets in various formats. Each format is processed through the unified API, removing the need for format-specific preprocessing.
  * **Metadata Recording** : The workflow records document metadata in Amazon DynamoDB for tracking, audit trails, and reporting. This includes file type, size, submission time, and processing status. 
    * **Page Count Analysis** : The workflow checks page count to improve processing strategies. BDA automatically handles document splitting and can process documents up to 3,000 pages. The page count check in Step Functions helps with setting appropriate timeout values for the asynchronous jobs and monitoring and alerting for unusually large documents.
  * **BDA Processing Invocation** : The workflow launches an asynchronous BDA job using the InvokeDataAutomationAsync API. BDA then automatically: 
    * Splits documents along logical boundaries (up to 20 pages per split).
    * Classifies each section into document types.
    * Matches documents to appropriate blueprints (if using custom output). Blueprints are artifacts configured ahead of time that define the extraction logic and must be set up before BDA processing.
    * Extracts all content including text, tables, forms, and visual elements.
  * **Asynchronous Processing with Task Tokens** : The workflow stores a task token and waits for BDA job completion. This pattern enables efficient resource utilization and allows processing of thousands of documents concurrently.
  * **Error Handling and Routing** : Comprehensive error handling manages different scenarios including successful processing, validation errors, timeouts, and unsupported file types, ensuring no document is lost and all issues are logged for review.



This orchestration approach provides a highly scalable serverless pipeline for automated document analysis with appropriate branching logic and exception management throughout each processing stage.

### Extraction and storage layer

This layer is central to this solution, where BDA serves as the core engine for transforming raw content into structured, actionable data. We provide more details in the following section.

**Amazon Bedrock Data Automation** serves as the primary processing engine, offering two flexible output options:

  * **Standard output** – Provides commonly required information based on data type, including document summaries, extracted text in reading order, table and figure captions, and generative insights. Standard output can be customized through projects to enable or disable specific extraction features like headers, footers, titles, and diagrams based on your processing needs.
  * **Custom output with blueprints** –The idea is to create one blueprint per document type, as you use the same set of instructions to extract common information across documents of the same type. However, across different document types, you need different blueprints for different information. For example, you want to extract different information from a passport than from a bank statement, so these two document types require separate blueprints. All bank statements should be processed with only one blueprint for because regardless of the bank or format, the type of information that you want to extract from bank statements should be the same. Blueprints allow precise control over extracted information by defining specific fields, data formats, and extraction instructions. Projects can contain up to 40 document blueprints, with BDA automatically matching each document to the appropriate blueprint. This enables processing of diverse document types like invoices, contracts, and forms within a single unified workflow.



In addition, BDA provides:

  * Unified API experience for processing multimodal content through a single interface
  * Cross-Region inference capability across multiple Regions for improved processing
  * Built-in safeguards, including visual grounding and confidence scores for accuracy
  * Support for custom blueprints to standardize output formats for specific document types



**Visual analysis processing** uses the capabilities of BDA to extract insights from plots, diagrams, charts, and visual elements that traditional optical character recognition (OCR) solutions can’t interpret. BDA provides image crops as part of the output when doing figure captioning, and it also generates detailed textual descriptions and structured data from these visual elements that are included in the downstream workflow. For example, when BDA processes a chart, it produces:

  * Generated captions describing the chart’s content and purpose
  * Extracted data points and trends from graphs
  * Structural relationships from diagrams and flowcharts
  * Bounding box coordinates linking the visual element to its location in the document



**All document formats in downstream processing** : Every supported document format (PDF, PNG, JPG, TIFF, DOC, DOCX) is processed through the unified API. The extracted content from BDA, including visual element descriptions, can then be manually configured for indexing and vectorization in Amazon Bedrock Knowledge Bases to enable semantic search across diverse document types. Note that BDA also has a built-in integration with Knowledge Bases where it can serve as a parser during document ingestion into a knowledge base, using BDA standard output (no blueprints required). This downstream workflow receives structured JSON outputs from BDA containing all extracted information, enabling consistent processing regardless of the original file format.

**Data extraction** from documents includes:

  * Text extraction in reading order with layout preservation
  * Table structure recognition with cell relationships maintained
  * Form field detection and key-value pair extraction
  * Visual element analysis including charts, graphs, and diagrams with generated captions
  * Bounding box coordinates for precise location tracking of extracted elements
  * Document-level and page-level summaries with context preservation



### Intelligence layer

This layer is the cognitive engine of this solution. Amazon Bedrock Knowledge Bases must be configured to work with Amazon OpenSearch Serverless to transform raw content into actionable insights through semantic search and Retrieval Augmented Generation (RAG) capabilities. The following section provides more details.

Amazon Bedrock Knowledge Bases with Amazon OpenSearch Serverless enables semantic search and RAG workflows by:

  * Indexing processed document content for intelligent querying
  * Maintaining vector embeddings for similarity search across document collections
  * Supporting complex queries that span multiple documents and data sources



**Amazon Bedrock FMs** analyze visual content including chart and graph interpretation, document layout understanding, and cross-modal relationship detection between text and visual components.

### Agentic coordination layer

This layer organizes the intelligence of this solution. Strands Agents on Amazon Bedrock AgentCore Runtime manage the overall processing workflow by routing requests to the appropriate specialized agents based on request type and coordinating cross-agent communication for complex document analysis.

**Specialized task agents** handle specific document processing functions:

  * Market analyst agents for financial market reports and investment documents.
  * Investment advisory agents for portfolio analysis and advisory documentation.
  * External API agents for real-time, third-party data integration through secure API connections to financial data providers, regulatory databases, and market intelligence platforms.
  * Coordinator agents perform cross-reference validation by comparing real-time market data from the external API agents against historical data stored in the Amazon Bedrock knowledge base.



## Implementation architecture

The processing pipeline employs an event-driven approach to document processing, integrating multiple specialized layers into a cohesive workflow. It follows a logical progression where each step builds upon the previous one. This begins with document upload, triggering Amazon S3 events that initiate state machines, and proceeding through multi-modal processing that extracts meaning from diverse content types. The pipeline continues with agent coordination that directs processing based on document characteristics, followed by knowledge base indexing for intelligent retrieval. This methodical flow culminates in the generation and integration of insights with business systems, creating a comprehensive processing journey from raw documents to actionable intelligence.

### Document processing flow

AWS Step Functions orchestrates the document processing pipeline, handling document classification, multi-modal extraction, data validation, and knowledge base integration.

### Agentic interaction flow

The user-facing layer provides intelligent query processing through natural language interaction with the processed document corpus, coordination agent supervision of specialized agents, and the smart distribution of queries to the right processing agents.

## Solution walkthrough

### Use case: Commercial real estate property analysis

A commercial real estate investment firm receives over 200 property evaluation reports monthly. These reports contain:

  * **Property overview documents** with location maps, zoning information, and property descriptions.
  * **Financial analysis spreadsheets** embedded as images within PDFs, showing cash flow projections, cap rates, and ROI calculations.
  * **Market comparison charts** displaying comparable property sales, rental rates, and market trends.
  * **Property photos and floor plans** with annotations and measurements.
  * **Legal documents,** including title reports, environmental assessments, and zoning compliance.
  * **Historical performance graphs** showing occupancy rates, rent rolls, and maintenance costs over time.



_The analyst accesses this solution, uploads the documents to it_

### Implementation

This implementation shows how our generative AI services can transform real estate investment analysis through document processing capabilities by doing the following:

**Document classification** : The system automatically identifies document types, extracts property metadata (including address and square footage), and routes different document sections to the appropriate processing agents.

**Multimodal content extraction** :

  * Market analyst agents process embedded financial charts to extract Net Operating Income projections and capitalization rate trends.
  * Amazon Bedrock Data Automation visual capabilities analyze property photos to identify condition indicators and floor plan efficiency ratios.
  * Cross-document relationship analysis validates projected cash flows with historical performance data.



**Natural language queries** : Investment professionals process information using natural language queries, such as “ _Show me properties with projected IRR above 12% and debt coverage ratios over 1.25″ or “Compare NOI growth projections with actual market performance for similar assets._ ”

### Results

Processing time per property reduced from 3–4 hours to 15-20 minutes for initial screening. Automated extraction removes manual transcription errors while cross-document validation identifies inconsistencies. The firm can process significantly more opportunities and identify attractive investments that might otherwise be overlooked.

**Scalability validation:** This solution has been tested at scale, successfully processing over **50,000** PDF documents concurrently through the BDA pipeline. The solution maintained high accuracy across diverse document types including contracts, financial reports, and technical specifications while processing at scale. The serverless architecture with AWS Step Functions and asynchronous BDA processing enabled this massive parallel processing capability without performance degradation, demonstrating the solution’s readiness for enterprise-scale document processing workloads.

## Deployment

The complete AWS Cloud Development Kit (AWS CDK) implementation provisions the entire architecture with infrastructure as code (IaC) principles. The deployment creates four main stack components aligned with our architecture layers and includes environment-specific configurations for development, staging, and production environments.

## Prerequisites

Before implementing this solution, ensure that you have:

  * An AWS account with appropriate permissions to create IAM roles, AWS Lambda functions, Step Functions, Amazon DynamoDB, Amazon Elastic Container Rregistry (Amazon ECR) and S3 buckets.
  * Access to Amazon Bedrock FMs enabled in the AWS Region where you want to deploy your solution.
  * Amazon Bedrock Data Automation enabled in an available Region. BDA is currently available in eight Regions – Europe (Frankfurt), Europe (London), Europe (Ireland), Asia Pacific (Mumbai), Asia Pacific (Sydney), US West (Oregon), US East (N. Virginia), and AWS GovCloud (US-West) Regions.
  * Basic familiarity with the AWS CDK and Python for infrastructure deployment.
  * Understanding of document processing workflows and business requirements.
  * Sample documents for testing and validation.



The complete CDK implementation is available in our public GitHub repository: [Intelligent Document Processing with Bedrock Agents](<https://github.com/aws-samples/intelligent-document-processing-bedrock-agents>).

To deploy this solution, run the following command:
    
    
    # Quick start deployment
    git clone https://github.com/aws-samples/sample-pdf-to-insights-idp-solution
    cd sample-pdf-to-insights-idp-solution
    ./deploy.sh –profile default –environment UAT

## Cost optimization strategies

The following are thoughtful approaches to managing operational expenses while maintaining the effectiveness of this solution’s processing.

### Intelligent routing

Route documents to appropriate processing levels based on complexity. Simple text documents use basic extraction, while complex documents with tables and images employ more advanced processing techniques.

### Batch processing

Combine multiple documents into a single Amazon Bedrock Data Automation request where appropriate to improve costs while respecting service limits.

### Storage lifecycle management

Implement [Amazon S3 lifecyle policies](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html>) to automatically transition processed documents to lower-cost storage tiers based on access patterns.

## Security and compliance

The architecture incorporates enterprise-grade security through AWS KMS keys for encryption of documents and processing results, AWS PrivateLink connectivity for secure API access within VPC boundaries, and IAM roles with least-privilege access principles across all components.

## Clean up

To avoid ongoing charges, delete the resources created by this solution:

  1. Delete the AWS CDK stacks in reverse order of dependency
  2. Empty and delete S3 buckets containing processed documents
  3. Remove Amazon Bedrock agents and knowledge bases
  4. Delete Amazon CloudWatch Log groups and metrics



To delete all the resources created, run this command:# Cleanup deployment./cleanup.sh –profile default –environment UAT

## Conclusion

Organizations can use Amazon Bedrock Data Automation, combined with an agent-based coordination architecture to automate document processing from a traditional cost center into a strategic business asset. By automatically extracting and analyzing visual plots, graphs, and charts, and deriving insights from documents while maintaining context and relationships across data sources, organizations can unlock value previously trapped in unstructured content.The multilayered architecture provides a foundation for scalable, cost-effective document processing that adapts to varying workloads while maintaining high accuracy. The visual analysis capabilities provide valuable insights embedded in charts, graphs, and images and are captured and made available for business intelligence and decision-making.Start with a focused proof of concept that targets your most common document types and visual analysis requirements. Then, expand the solution as you gain experience with the services and understand your specific accuracy and performance requirements.

To learn more about Amazon Bedrock Data Automation, visit the [Amazon Bedrock Data Automation documentation](<https://docs.aws.amazon.com/bedrock/latest/userguide/bda.html>). For hands-on experience with intelligent document processing, explore the [IDP workshop](<https://github.com/aws-samples/aws-ai-intelligent-document-processing>) on GitHub. The complete CDK implementation code for this architecture is available in the [AWS Samples repository](<https://github.com/aws-samples/intelligent-document-processing-bedrock-agents>) with deployment instructions and configuration examples.

* * *

## About the authors

### Charles Meruwoma

Charles Meruwoma is a Solutions Architect at Amazon Web Services. At AWS, Charles focuses on helping global financial services organizations design and implement cloud-based solutions that drive digital transformation, enhance operational efficiency, optimize cost, accelerate innovation, and achieve strategic business objectives.

### Adeleke Coker

Adeleke Coker is a Global Solutions Architect with AWS. He works with customers globally to provide guidance and technical assistance in deploying production workloads at scale on AWS. In his spare time, he enjoys learning, reading, gaming and watching sport events.
