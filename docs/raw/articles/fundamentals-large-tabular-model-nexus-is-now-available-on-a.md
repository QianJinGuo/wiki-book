---
created: '2026-06-07'
feed_name: AWS China ML
ingested: '2026-06-07'
review_confidence: 8
review_recommendation: strong
review_value: 8
sha256: c21cc2209567ba08645b41b140f08c48d6206515026371951181b79b54bb86b2
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/fundamentals-large-tabular-model-nexus-is-now-available-on-amazon-sagemaker-jumpstart
tags:
- article
title: Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker
  JumpStart
type: source
updated: '2026-06-07'
---

# Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker JumpStart

Today, we’re announcing support for Fundamental’s NEXUS model on [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>). With this launch, you can deploy a foundation model (FM) purpose-built for tabular data prediction. This model helps your enterprise generate accurate, deterministic predictions from structured data in days instead of months.

In this post, we show you how to get started with NEXUS on [Amazon SageMaker JumpStart](<https://aws.amazon.com/sagemaker/ai/jumpstart/>), walk through the deployment process, and demonstrate how to run predictions against your enterprise datasets.

## What is NEXUS?

NEXUS is a foundation model developed by [Fundamental](<https://fundamental.tech/>) and built for tabular data prediction. Large language models (LLMs) are designed for text, and traditional machine learning (ML) approaches require extensive feature engineering and model training. NEXUS takes a different approach. It’s pre-trained on billions of real-world prediction tasks across structured datasets, so it arrives already knowing how to find signal in your data.

As a Large Tabular Model, NEXUS is built for structured data analysis and offers these key innovations:

  * **Deterministic architecture** – Probabilistic LLMs might provide different answers to identical queries. NEXUS produces consistent, reproducible results for each individual prediction.
  * **Native tabular understanding** – Trained on billions of tables, NEXUS natively processes numbers, categories, dates, and unstructured text without manual feature engineering.
  * **Non-sequential reasoning** – Most AI models predict sequential data (for example, the next word or the next pixel). NEXUS analyzes multi-dimensional relationships in enterprise tables. For example, when predicting customer churn, NEXUS understands how multiple factors (transaction frequency, support tickets, and economic indicators) impact the likelihood of attrition.



## Why existing approaches fall short

The most valuable enterprise data sits in tables such as spreadsheets, enterprise resource planning (ERP) systems, customer relationship management (CRM) systems, and relational databases. Many critical business decisions depend on predictions made against this data. However, today’s tools have significant limitations:

  * **Traditional ML** takes teams of data scientists 3–6 months to build, train, and deploy a model for a single use case. You face a constant trade-off between quality and quantity of predictions.
  * **LLMs** are non-deterministic, producing different answers on the same dataset. They lose numerical context during tokenization, which leads to inaccurate results on structured data and requires complex guardrails to mitigate these issues.



NEXUS is architected for tabular data and provides advantages such as the following:

  * **Permutation invariance** – Recognizes that changing column order doesn’t change meaning, which differs from how transformers handle data.
  * **Billion-row capability** – Processes massive datasets without truncation or sampling.
  * **Cross-schema reasoning** – Connects related data across disparate tables automatically.
  * **Autonomous data cleaning** – Resolves incomplete entries (for example, NEXUS can still make predictions even when entries are missing).



## How NEXUS works on Amazon SageMaker AI

The following figure illustrates the end-to-end flow for deploying and running predictions with NEXUS on SageMaker AI.

NEXUS runs on a dedicated, single-tenant, network-isolated GPU instance within the SageMaker AI managed environment. The workflow consists of the following steps:

  1. **Subscribe and deploy** – Subscribe to the NEXUS model package on [AWS Marketplace](<https://aws.amazon.com/marketplace>), then deploy it as a SageMaker AI managed inference endpoint on an `ml.p5en.48xlarge` instance (8× NVIDIA H200 GPUs).
  2. **Install the SDK** – Install the Fundamental Python SDK and connect it to your SageMaker endpoint. The SDK provides a familiar scikit-learn compatible API with `NEXUSClassifier` and `NEXUSRegressor` estimators.
  3. **Upload data to Amazon S3** – The SDK serializes your tabular data and uploads it to an [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>) bucket in your account.
  4. **Train a model** – Call `clf.fit(X_train, y_train)` to train. NEXUS handles data cleanup and feature engineering automatically, with no manual pipeline required.
  5. **Generate predictions** – Call `clf.predict(X_test)` for deterministic predictions or `clf.predict_proba(X_test)` for probability estimates. Results are stored back in your Amazon S3 bucket.



Your data stays in your AWS environment throughout this process. The endpoint is network-isolated and single-tenant, which makes NEXUS suitable for enterprise workloads with sensitive data.

## Get started with NEXUS on Amazon SageMaker AI

To get started, navigate to [Amazon SageMaker JumpStart](<https://aws.amazon.com/sagemaker/ai/jumpstart/>), search for _Fundamental NEXUS_ , and choose from the following:

  * Base model (pre-trained on over 10B tabular rows).
  * Industry-specific variants (finance, healthcare, and manufacturing).



## Enterprise use cases transforming industries

Tabular data is the backbone of enterprise decision-making, from financial ledgers to patient records to supply chain logs. NEXUS is purpose-built for this data and helps you go from raw structured data to production-grade predictions without extensive feature engineering or model training. The following are a few representative use cases where NEXUS can create value.

### Financial services

  * **Fraud detection** – Analyzes transaction patterns across millions of accounts.
  * **Credit risk modeling** – Processes loan portfolios with automated feature extraction.
  * **Regulatory compliance** – Extracts structured data from unstructured regulatory filings.



### Healthcare

  * **Clinical trial matching** – Identifies eligible patients across electronic health record (EHR) systems.
  * **Drug discovery** – Analyzes biological assay data for compound screening.
  * **Patient risk stratification** – Predicts readmission risks using intensive care unit (ICU) time-series data.



### Manufacturing and supply chain

  * **Predictive maintenance** – Forecasts equipment failures from sensor data.
  * **Demand forecasting** – Anticipates inventory needs across global distribution networks.
  * **Supplier risk analysis** – Evaluates vendor reliability using procurement history.



### Retail and ecommerce

  * **Churn prediction** – Identifies at-risk customers by using purchase history and browsing behavior.
  * **Dynamic pricing** – Optimizes prices based on competitor data and inventory levels.
  * **Cart abandonment analysis** – Helps you understand why customers leave items in online carts.



## Why choose NEXUS on Amazon SageMaker AI

Deploying a model is only half the equation. The infrastructure you run it on determines how quickly you can move from experimentation to production. SageMaker AI provides a managed, secure, and scalable environment for running NEXUS at enterprise scale. Together, NEXUS and AWS reduce undifferentiated heavy lifting so your data scientists can focus on business outcomes rather than infrastructure management.

  * **Accelerated time-to-value** – Pre-built containers and scripts reduce deployment time.
  * **Cost efficiency** – The managed infrastructure of SageMaker AI reduces operational overhead.
  * **Scalability** – Automatically scales to petabyte-scale datasets.
  * **Compliance ready** – Meets GDPR, HIPAA, and SOC 2 requirements by default.
  * **Continuous learning** – Native integration with [Amazon SageMaker Pipelines](<https://aws.amazon.com/sagemaker/pipelines/>) for model retraining.
  * **Multiplex support** – Supports multiple fit and predict operations on a single SageMaker AI endpoint, which removes the need for dedicated resources for each use case.



## Strategic AWS partnership

Fundamental has entered a strategic partnership with AWS to accelerate enterprise adoption:

  * **Native integration** – Deploy NEXUS directly from AWS Marketplace.
  * **Secure infrastructure** – Runs on the AWS secure, compliant cloud environment.
  * **Enterprise support** – Dedicated AWS Solutions Architects for implementation guidance.



## Next steps

Ready to transform your data-driven decisions?

  * [Contact the Fundamental team](<https://fundamental.tech/contact#topsales>) to learn more.
  * Try the [managed example notebook](<https://github.com/Fundamental-Technologies/fundamental-cookbook/tree/main/examples>) in a JupyterLab space on Amazon SageMaker AI.



## Conclusion

In this post, we showed how NEXUS model support on Amazon SageMaker AI helps you unlock new insights from your structured data assets. Whether you’re predicting equipment failures, optimizing supply chains, or detecting financial fraud, NEXUS provides deterministic, scalable capabilities for your enterprise prediction workloads.

To learn more, see the following resources:

  * [Fundamental NEXUS documentation](<https://github.com/Fundamental-Technologies/fundamental-cookbook/tree/main/examples>)
  * [Amazon SageMaker AI Developer Guide](<https://docs.aws.amazon.com/sagemaker/latest/dg/what-is-sagemaker.html>)



* * *

## About the authors

### Vivek Gangasani

Vivek is a Worldwide Leadfor Solutions Architecture, SageMaker Inference. He leads Solution Architecture, Technical Go-to-Market (GTM) and Outbound Product strategy for SageMaker Inference. He also helps enterprises and startups deploy and optimize a GenAI models and build AI workflows with SageMaker and GPUs. Currently, he is focused on developing strategies and content for optimizing inference performance and use-cases such as Agentic workflows, RAG, etc.

### Hazim Qudah

Hazim is an AI/ML Specialist Solutions Architect at Amazon Web Services. He enjoys helping customers build and adopt AI/ML solutions using AWS technologies and best practices. Prior to his role at AWS, he spent many years in technology consulting with customers across many industries and geographies. In his free time, he enjoys running and playing with his dogs!

### Jimmy Shah

Jimmy is a Principal Specialist for SageMaker AI at AWS. He is part of the team that leads outbound product management and Technical Go-to-Market (GTM) strategy for SageMaker AI, with a focus on the financial services segment. Currently, he is focused on developing strategies and content for SLM fine-tuning and deployment, agentic AI, and inference optimization use cases.
