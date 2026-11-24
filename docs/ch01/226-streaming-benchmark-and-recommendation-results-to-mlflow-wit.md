# Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

> 📊 Level ⭐⭐⭐ | 9.1KB

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/streaming-benchmark-and-recommendation-results-to-mlflow-with-amazon-sagemaker-ai)

## Streaming benchmark and recommendation results to MLflow with Amazon SageMaker AI

Teams benchmarking generative AI models often evaluate dozens of GPU instance types, serving containers, parallelism strategies, and optimization techniques such as speculative decoding before deploying to production. Practitioners can spend weeks navigating configuration decisions and manually piecing together what they tried, what worked, and why. That complexity is exactly why we introduced optimized generative AI inference recommendations for Amazon SageMaker AI: to help teams move from manual trial-and-error to guided, data-driven optimization and benchmarking.

Today, we are adding MLflow integration so teams can stream AI benchmark and recommendation results into a single place to track every experiment. This integration reduces data silos, accelerates iteration cycles, and brings full reproducibility to your inference optimization workflows.

In this post, you learn how to use the new MLflow integration with Amazon SageMaker AI optimized inference recommendation jobs and Amazon SageMaker AI benchmark jobs to automatically stream experiment data into a unified tracking interface.

This integration streams metrics, parameters, and charts into your serverless Amazon SageMaker MLflow App in real time and you get a unified experiment tracking experience.

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

## 深度分析

### Why experiment tracking was the real bottleneck

The core problem this integration attacks is not benchmarking itself but the accounting around it. Teams evaluating generative AI deployments juggle dozens of GPU instance types, serving containers, parallelism strategies, and optimizations such as speculative decoding, and practitioners can spend weeks manually piecing together what was tried, what worked, and why. SageMaker's optimized inference recommendations already turned that trial-and-error into guided, data-driven search — but the resulting evidence lived inside job consoles, creating data silos between recommendation runs, benchmark runs, and whatever tracking the team maintained separately. Streaming results into [Inference Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/inference-optimization.md) workflows via MLflow closes that loop: the artifact of optimization becomes the input to the next decision.

### What actually gets streamed, and how

The integration is wired at job submission: you attach `MlflowConfig` (tracking-server ARN, experiment name, run name) inside the job's `OutputConfig`. From then on, metrics, parameters, and charts stream into the serverless SageMaker MLflow App in real time rather than being published only at job completion. Submitting multiple jobs under the same `MlflowExperimentName` is what enables side-by-side comparison in the experiment view with no manual data wrangling. Two structural details matter when reading results: parent runs are empty relationship placeholders — the real metrics live in nested child runs — and recommendation artifacts such as `outputs.json` carry request-level fields (session ID, timing, output token counts, latency, response text).

### The asymmetry between the two job types

Benchmark jobs and recommendation jobs look similar in the tracking UI but behave differently operationally. A benchmark job evaluates an existing, already-InService endpoint against a workload specification (the walkthrough uses NVIDIA AIPerf with an OpenAI-compatible schema). A recommendation job instead provisions its own endpoints internally while searching deployment options for a model artifact in Amazon S3, returning ranked configurations — optionally constrained by a performance target such as TTFT. Because of that, you should not pass `ComputeSpec.InstanceTypes` on recommendation jobs unless you deliberately want to constrain the search space. Related SageMaker instance-level benchmarking work is covered in [Benchmarking Small Llm Inference Sagemaker G7 Vs G5 G6 Aws 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/benchmarking-small-llm-inference-sagemaker-g7-vs-g5-g6-aws-2026.md).

### Managed boundaries and prerequisites

The integration streams to SageMaker MLflow Apps only — self-hosted MLflow tracking servers are explicitly not supported, which pins this inside the AWS-managed surface rather than the open-source ecosystem (see [Aws Mlflow V310 Generative Ai Development](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-mlflow-v310-generative-ai-development.md) for the broader MLflow release context). Requirements to clear before submitting: `tooling.version` at 0.8.0+ for nested-run support; an execution role with `AmazonSageMakerFullAccess` plus `sagemaker-mlflow:*`, `sagemaker:CallMlflowAppApi`, endpoint-invocation, and S3 read/write permissions; and an S3 output bucket in the same Region as the job. These are the failure points to check first when runs never appear in MLflow.

## 实践启示

1. Make tracking part of the job contract, not a downstream chore: attaching `MlflowConfig` at submission time eliminates post-hoc metric collection entirely — the same principle applies to any experiment pipeline you design.
2. One shared experiment name across heterogeneous job types (benchmark + recommendation) is what makes comparison possible; pair it with unique, session-scoped run names to keep runs separable.
3. Real-time streaming is a cost-control mechanism, not just visibility: live latency and throughput metrics let you stop an underperforming recommendation job early instead of paying for hours of a misconfigured search.
4. Treat the accumulated runs as a durable audit trail — parameters, timestamps, checkpoint metrics, and artifacts stay queryable for months, so you can trace which configuration change drove an improvement long after the job ended.
5. Respect the managed boundary: plan around SageMaker MLflow Apps only, and pre-verify IAM permissions and same-Region S3 output before submitting, since those are the silent prerequisites of the whole flow. For the wider observability picture around SageMaker LLM endpoints, see [Comprehensive Observability For Amazon Sagemaker Ai Llm Infe](https://github.com/QianJinGuo/wiki-public/blob/main/entities/comprehensive-observability-for-amazon-sagemaker-ai-llm-infe.md).
6. Read results at the right granularity: expand parent runs into nested child runs, use the compare view's diff-only mode across concurrency rows, and open run artifacts (e.g. `outputs.json`) when aggregate metrics are not enough.

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

