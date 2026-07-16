# Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

## Ch01.1079 Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

> 📊 Level ⭐⭐ | 3.5KB | `entities/streaming-benchmark-and-recommendation-results-to-mlflow-wit.md`

# Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/streaming-benchmark-and-recommendation-results-to-mlflow-wit.md)

# Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

Teams benchmarking generative AI models often evaluate dozens of GPU instance types, serving containers, parallelism strategies, and optimization techniques such as speculative decoding before deploying to production. Practitioners can spend weeks navigating configuration decisions and manually piecing together what they tried, what worked, and why. That complexity is exactly why we introduced [optimized generative AI inference recommendations for Amazon SageMaker AI](<https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-ai-now-supports-optimized-generative-ai-inference-recommendations/>): to help teams move from manual trial-and-error to guided, data-driven optimization and benchmarking.

Today, we are adding MLflow integration so teams can stream AI benchmark and recommendation results into a single place to track every experiment. This integration reduces data silos, accelerates iteration cycles, and brings full reproducibility to your inference optimization workflows.

In this post, you learn how to use the new MLflow integration with [Amazon SageMaker AI optimized inference recommendation jobs](<https://docs.aws.amazon.com/sagemaker/latest/dg/generative-ai-inference-recommendations.html>) and [Amazon SageMaker AI benchmark jobs](<https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_CreateAIBenchmarkJob.html>) to automatically stream experiment data into a unified tracking interface.

This integration streams metrics, parameters, and charts into your serverless [Amazon SageMaker MLflow App](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow-app-setup.html>) in real time and you get a unified experiment tracking experience.

## Solution overview

With this release, when you submit an optimized inference recommendation job or a benchmarking job, Amazon SageMaker AI automatically streams results into a SageMaker MLflow app of your choice. Submit multiple jobs to the same MLflow experiment, and you can select them in the MLflow experiment view to compare side by side, with no manual data wrangling required.

The following diagram shows how you can set up MLflow with your benchmarking and recommendation jobs:

You follow these steps to set up MLflow with your existing recommendations and benchmarking jobs:

  * **Create an MLflow App** : In your AWS account, open Amazon SageMaker Studio. Then go to **MLflow** and choose **Create MLflow App**.
  * **Grant permissions:** Add `sagemaker-mlflow:*` on the MLflow App ARN to your job’s execution role.
  * **Pass`MlflowConfig`** when creating your benchmark or recommendation job.

## Benefits of this implementation

Some of the benefits of this implementation are:

**Eliminate manual data consolidation:** With native MLflow integration, benchmark and recommendation results from multiple jobs are consolidated under the same experiment name automatically. This removes the need to manually collect m

---

