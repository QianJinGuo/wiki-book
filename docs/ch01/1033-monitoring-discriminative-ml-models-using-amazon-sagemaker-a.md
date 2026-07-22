# Monitoring discriminative ML models using Amazon SageMaker AI with MLflow

## Ch01.1033 Monitoring discriminative ML models using Amazon SageMaker AI with MLflow

> 📊 Level ⭐⭐ | 3.9KB | `entities/monitoring-discriminative-ml-models-using-amazon-sagemaker-a.md`

# Monitoring discriminative ML models using Amazon SageMaker AI with MLflow

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/monitoring-discriminative-ml-models-using-amazon-sagemaker-a.md)

# Monitoring discriminative ML models using Amazon SageMaker AI with MLflow

The effectiveness and accuracy of machine learning (ML) models decreases almost as soon as the training job finishes. Changes in consumer behavior, releases of new products, upgrades in sensor technology, and a shifting economic and political landscape are all examples of uncontrollable factors that change the patterns and probabilities the model learned during training. By actively monitoring models deployed in production for changes in accuracy and baseline statistics, you can intervene before the drop in accuracy becomes problematic. Model monitoring can be combined with AI observability tools that track latency, application availability, and other metrics used to identify problems in the overall system.

This post focuses on discriminative machine learning models used for classification and regression use cases. For generative AI models, see [Production-Ready Real-Time Monitoring Solution for LLMs on Amazon SageMaker AI Endpoint inference](<https://builder.aws.com/content/39pAP53j9mlK9o1NBBjWZ4HMJPl/production-ready-real-time-monitoring-solution-for-llms-on-amazon-sagemaker-ai-endpoint-inference>). The factors that cause a reduction in quality for discriminative ML models can be broadly split into two categories:

  * **Data drift** refers to changes in the statistical properties of the input data. It can be as simple as an unexpected change in an upstream data source that changes a column from integer to float data type, or as complex as entirely new product lines being released. You can measure data drift by calculating baseline statistics for the training dataset and comparing these to the same statistics calculated on data gathered over time in production.
  * **Model drift** refers to changes in the accuracy of predictions produced by the model because the probabilistic patterns learned by the model no longer fit the data coming in. This can be caused, for example, by changes in consumer behavior because of an improving economy. You can measure model drift by gathering the ground truth labels to calculate model quality metrics, and comparing these metrics to the same metrics calculated during the model training process.

Figure 1: How data drift and model drift fit in an ML workflow

[Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/>) is a fully managed machine learning service that helps organizations build, train, deploy, and manage both discriminative and generative ML models. Although SageMaker AI is fully managed, you might need a more customizable approach. For example, you might want to manage the entire modeling life cycle cost-effectively, monitor unique use cases that managed services do not support, or integrate your model monitoring into other UI or observability pipelines. Therefore, this post introduces a model monitoring architecture based on the open source [Evidently Python library](<https://www.evidentlyai.com/evidently-oss>) and [Amaz

---

