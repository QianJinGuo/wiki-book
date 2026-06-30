# Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker JumpStart

## Ch01.235 Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker JumpStart

> 📊 Level ⭐⭐ | 15.7KB | `entities/aws-fundamentals-large-tabular-model-nexus-is-now-available-on-amazon-sagemaker-jump.md`

type: entity
- raw/articles/fundamentals-large-tabular-model-nexus-is-now-available-on-a
tags: [aws, ml]
- article
- open-models
- aws
- amazon-bedrock
title: Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker
  JumpStart
type: entity
updated: '2026-06-08'
---
type: entity
# Fundamental’s Large Tabular Model NEXUS is now available on Amazon SageMaker JumpStart

## 相关实体
- [Openai Models Codex Amazon Bedrock Ga](ch04/310-ai.md)
- [Announcing Openai Compatible Api Support For Amazon Sagemaker](ch04/310-ai.md)
- [Fine Tune Llm With Databricks Unity Catalog And Amazon Sagemaker](ch01/890-llm.md)
- [End To End Encrypted Ml Inference Sagemaker Fhe](https://github.com/QianJinGuo/wiki/blob/main/entities/end-to-end-encrypted-ml-inference-sagemaker-fhe.md)
- [Amazon Sagemaker Qualcomm Ai Hub Edge Npu Deployment](ch04/310-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/fundamentals-large-tabular-model-nexus-is-now-available-on-a.md)

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

## 深度分析

### NEXUS 的技术创新定位

NEXUS 代表了一种新兴的模型范式——Large Tabular Model（LaTaM），它介于传统机器学习和语言模型之间，专门解决结构化数据预测问题。传统的梯度提升模型（如 XGBoost、LightGBM）虽然在 Kaggle 竞赛中表现优异，但每个新场景仍需从头训练。NEXUS 通过在大规模表格数据上进行元预训练，将"如何在表格中寻找预测信号"这一能力直接编码到模型权重中，实现了开箱即用的泛化能力。

从架构层面看，NEXUS 的三个核心创新——确定性架构、原生表格理解和非顺序推理——直接针对 LLM 在结构化数据上的三大缺陷： token 化过程中数字精度丢失、概率采样导致结果不稳定、以及将表格行当作序列强行建模的概念错位。这种设计选择使 NEXUS 在企业级预测场景中具备了替代传统 AutoML 方案的潜力。

### SageMaker 集成的战略价值

选择 SageMaker 作为部署平台并非偶然。SageMaker 提供的 ml.p5en.48xlarge 实例（配备 8× NVIDIA H200 GPUs）能够满足 NEXUS 处理十亿行级别数据所需的算力需求，同时其托管环境降低了运维复杂度。对于企业而言，关键在于 NEXUS 的单租户、网络隔离特性与 SageMaker 的合规基础设施工具链形成互补——GDPR、HIPAA、SOC 2 合规不再需要额外定制。

更重要的是，AWS 与 Fundamental 的战略伙伴关系意味着 NEXUS 可以直接从 AWS Marketplace 订阅，省去了自行联系供应商谈判采购的流程。这种"一键部署"模式将企业采用 AI 能力的门槛从"数月数据科学工程"压缩到"几次 API 调用"。 

### 企业采用路径的可行性评估

从文章披露的定价信息（ml.p5en.48xlarge 实例成本）和 SDK 设计（scikit-learn 兼容 API）来看，NEXUS 的目标用户是拥有专职数据科学团队的中大型企业，而非小型团队或个人开发者。其行业变体（金融、医疗、制造）进一步暗示了垂直行业定制化路线。 

对于已有成熟 AutoML 实践的企业，NEXUS 的核心价值在于缩短概念验证周期——传统 ML 流程需要 3-6 个月，NEXUS 可以压缩到数天。但这种速度优势是否值得付出额外的云计算成本和供应商锁定风险，需要企业根据自身场景的预测量级和时效要求进行权衡。

## 实践启示

### 立即可行的行动项

**1. 评估内部表格数据资产规模** — 在考虑部署 NEXUS 前，首先盘点企业现有的结构化数据：ERP 系统、CRM 数据库、日志表等。NEXUS 的十亿行处理能力意味着它最适合数据量在百万行以上且当前依赖手工特征工程的场景。如果数据量较小，传统 ML 可能更具成本效益。

**2. 试用 Base Model 而非直接上行业变体** — SageMaker JumpStart 提供 Base Model 和行业变体两个选项。建议先在 Base Model 上用已有数据集跑一次端到端预测（分类或回归），验证模型在具体业务指标上的表现，再决定是否需要行业定制版本。这样可以避免过早锁定在特定垂直场景。

**3. 利用 multiplex support 复用单一端点** — NEXUS 支持在同一 SageMaker 端点上运行多个 fit/predict 操作，这意味着一个 ml.p5en.48xlarge 实例可以服务于多个业务线或多个预测场景。建议在架构设计阶段就规划多业务线共享策略，以分摊硬件成本。

**4. 对接 Amazon SageMaker Pipelines 实现自动化模型更新** — NEXUS 原生集成 SageMaker Pipelines，适合构建定时重新训练的工作流。对于需求随时间漂移的预测场景（如欺诈检测、需求预测），建议利用这一特性建立自动化再训练管道，减少模型衰减风险。

**5. 验证数据安全与合规要求** — 虽然文章强调 NEXUS 满足 GDPR、HIPAA、SOC 2 合规，但企业仍需自行验证数据不出 VPC 的承诺是否满足内部合规审查。建议在上生产前与 AWS Solutions Architect 沟通具体的合规证明文件。

---

