---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagemaker-ai/
feed_name: AWS China ML
title: "Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI"
sha256: a1e70567ba4f7437df8427e0ca43b18cff2c4c4bd61b1fb26f4347e7a9f7ed2e
created: 2026-05-14
updated: 2026-05-14
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 3
tags: [aws, machine-learning, llm]
---
# Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI
Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI | Artificial Intelligence Skip to Main Content Artificial Intelligence Fine-tune LLM with Databricks Unity Catalog and Amazon SageMaker AI When you fine-tune large language models (LLMs) with Amazon SageMaker AI while using Databricks Unity Catalog , you might face unique challenges like how to maintain strict data governance while using best-in-class machine learning (ML) services.
Unity Catalog governs metadata and permissions, while the underlying data resides in Amazon Simple Storage Service (Amazon S3) when you choose AWS as the cloud environment for their Databricks Workspace.
When SageMaker AI Training job accesses that data, you must preserve and not bypass the Unity Catalog’s fine-grained authorization model.
Without a structured integration pattern, you risk inconsistent policy enforcement, audit gaps, and compliance exposure.
For example, if SageMaker AI Training jobs bypass Unity Catalog’s authorization model when reading S3 objects, you lose visibility into which data trained which models.
This creates critical compliance risks particularly in regulated industries and production workloads.
In this post, we demonstrate how to build a secure, complete LLM fine-tuning workflow that integrates Unity Catalog with Amazon SageMaker AI using Amazon EMR Serverless for preprocessing.
The solution shows how to securely access governed data, maintain lineage across services, fine-tune the Ministral-3-3B-Instruct model, and register trained artifacts back into Unity Catalog.
With this approach, you can continue using your existing services while preserving central governance, tracking data lineage without compromising security or compliance requirements.
Solution overview The workflow described in this post accomplishes the following: Reads training data from a Unity Catalog managed table with proper governance controls Preprocesses the data using EMR Serverless with Apache Spark Fine-tunes a Ministral-3-3B-Instruct model using SageMaker AI Training jobs Tracks data lineage in Unity Catalog from source data through to the trained model The following diagram illustrates the architecture: Figure 1: Solution architecture showing data flow between SageMaker AI Studio, EMR Serverless, and Databricks Unity Catalog Component Purpose Amazon SageMaker AI Studio – JupyterLab Space Workflow orchestration and model training Amazon EMR Serverless Spark-based data preprocessing without cluster management Databricks Unity Catalog Metadata catalog, governance, and lineage tracking Hugging Face Access to pre-trained models Amazon S3 Storage for data and model artifacts AWS Secrets Manager Credential management In this solution, users sign in to SageMaker AI Studio and initiate data preprocessing using an EMR Serverless job.
The EMR Serverless job accesses and processes data from a Unity Catalog-managed S3 bucket using Unity Catalog’s Open REST APIs with OAuth credentials stored in AWS Secrets Manager.
After processing the data, create a table in the Unity Catalog with the processed data.
Then, SageMaker AI training job retrieves the Ministral-3-3B-Instruct model from Hugging Face, fine-tunes it on the processed table, and stores the resulting model artifacts back to the Unity Catalog-managed S3 bucket.
Finally, register the model in Unity Catalog and create external data lineage.
This complete workflow integrates SageMaker AI, EMR Serverless, and Databricks Unity Catalog for governed, scalable LLM fine-tuning.
Prerequisites Before you begin, verify that you have the following: Service Requirement Details AWS AWS Account Permissions for following AWS Services Amazon SageMaker AI Amazon EMR Serverless Amazon S3 AWS Secrets Manager AWS Identity and Access Management (IAM) Amazon Virtual Private Cloud (Amazon VPC) Amazon CloudWatch Logs Amazon Elastic Container Registry (Amazon ECR) Amazon VPC VPC and security groups configured with internet access Databricks Set up Unity Catalog for Workspace Set up Unity Catalog for your Workspace .
Set up External Access Set up external data access on your Metastore .
Generate OAuth Credentials Create OAuth credentials (Client ID and secret) for programmatic access to Databricks .
Walkthrough This section walks through the complete process for fine-tuning LLM using data that Unity Catalog governs.
Download the complete notebook LLM_Finetunig_SageMaker_AI_Unity_Catalog.ipynb and run it in SageMaker AI Studio using the following steps: Navigate to the Amazon SageMaker AI Console .
Create a SageMaker Studio Domain using Quick Setup (if you don’t have existing domain).
Create a JupyterLab Space with the following configuration Instance Type: ml.m5.2xlarge Image: Sagemaker Distribution 3.8.0 Storage: 5 GB Upload the downloaded Jupyter notebook.
Open the notebook (select Python3 (ipykernel) as the kernel).
The following sections outline the key steps at a high level.
Refer to the notebook for the full code implementation.
Step 1: AWS setup By the end of this step, you complete following setups.
Requirement Details Amazon S3 Buckets Create an S3 Bucket that will be managed by Unity Catalog and Upload data AWS Secrets Manager Create a Secret to store Databricks OAuth credentials AWS IAM Roles Create a SageMaker AI Execution Role and EMR Serverless job runtime Role S3 bucket setup / Upload dataset The notebook uses SEC EDGAR (U.S.
Securities and Exchange Commission Electronic Data Gathering, Analysis, and Retrieval) filings data for LLM fine-tuning.
SEC EDGAR is the SEC’s public database of corporate filings.
The solution fetches 10-K and 10-Q forms for S&P 500 companies from 2023–2024 through SEC’s public APIs, downloads filing documents, extracts the Risk Factors section, and uploads the data to an Amazon S3 bucket.