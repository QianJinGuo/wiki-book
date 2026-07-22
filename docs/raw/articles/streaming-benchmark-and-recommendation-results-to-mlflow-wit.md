---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/streaming-benchmark-and-recommendation-results-to-mlflow-with-amazon-sagemaker-ai
ingested: 2026-07-07
feed_name: AWS China ML
source_published: 2026-07-06
sha256: "83f7454bb3884d2632c1b09cb2ea01358a44bbdaca43462df4ed46dd73408400"
---

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

**Eliminate manual data consolidation:** With native MLflow integration, benchmark and recommendation results from multiple jobs are consolidated under the same experiment name automatically. This removes the need to manually collect metrics, logs, and configurations across separate runs. You can then compare runs side by side to understand how instance type, model configuration, batch size, or speculative decoding affects performance. For example, you can compare `qwen2-0.5b` on `ml.g4dn.12xlarge` versus `ml.p4d.24xlarge`.

**Monitor long-running jobs in real time:** Benchmark and recommendation jobs can take hours. Rather than waiting for completion without visibility, you can now watch metrics stream live into the MLflow UI. Latency and throughput metrics update as each configuration is tested, giving you an observable process from start to finish. We publish live metrics in the metrics section, and they update over time instead of being published only at the end of the job. You can use these metrics to check whether throughput is as expected in the recommendation job and stop it early if it is not.

**Maintain a complete audit trail:** Experiment runs capture the full context: job parameters, timestamps, metrics at checkpoints, and emitted artifacts. This audit trail stays queryable and reproducible for months. You can trace which configuration changes drove improvements, identify performance plateaus, and revisit past decisions with full context.

**Better collaboration and governance:** A shared MLflow experiment becomes the single source of truth for an optimization effort. Team members can review what’s been tried, what worked, and what didn’t, which reduces duplicated effort and supports informed handoffs between shifts or team members.

## Technical walkthrough: Track SageMaker AI benchmarking and recommendations in MLflow

In this example, a customer has deployed `Qwen/Qwen2-0.5B-Instruct` to an Amazon SageMaker AI real-time endpoint using an OpenAI-compatible serving stack on ml.g6.12xlarge. The team has two questions to answer: how the existing Qwen endpoint performs for a lightweight chatbot workload, and what configuration to use for a larger workload with longer prompts and responses.

To make the evaluation reproducible, both the benchmark job and recommendation job write metrics, parameters, and charts to the same SageMaker MLflow experiment. The benchmark job evaluates an existing SageMaker endpoint. The recommendation job evaluates deployment options for the Qwen model artifact stored in Amazon Simple Storage Service (Amazon S3) and returns ranked configurations. We will use a walkthrough notebook to show you how you can set up MLflow with both recommendations using `Qwen/Qwen2-0.5B-Instruct` on `ml.g6.12xlarge` instance for latency optimization

The end-to-end walkthrough typically takes **45–120 minutes** , depending on endpoint readiness, model size, workload configuration, instance availability, and recommendation job search space.

### Prerequisites

This [notebook](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/03-features/gen-ai-inference-recommendations/gen-ai-inference-recommendations-and-benchmarking-mlflow.ipynb>) walks you through how you can set up your MLflow app for benchmark and recommendations jobs experiment tracking. You need to complete the following steps to get started with running this notebook.

  * Set up [Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker/studio/>) for your development environment on Amazon SageMaker AI.
  * Create a [SageMaker MLflow App](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow-app-setup.html>) from SageMaker Unified Studio (SageMaker Unified Studio → MLflow → Create MLflow App).
  * A **SageMaker endpoint** running an OpenAI-compatible model (already InService) for the benchmark job. You can deploy the Qwen 2 0.5B model from the Amazon SageMaker JumpStart Studio UI to get started as shown in the following diagram:  



  * A model artifact in Amazon S3 for the recommendation job.
  * An AWS Identity and Access Management (IAM) execution role with `AmazonSageMakerFullAccess` plus inline policies for MLflow and endpoint invoke access. See the accompanying notebook for IAM role creation steps.



### Key considerations

  * This integration supports SageMaker MLflow Apps and does not stream results to self-hosted MLflow tracking servers.
  * Set `tooling.version` to 0.8.0 or later to use MLflow nested run support.
  * Recommendation jobs provision their own endpoints internally, so do not pass `ComputeSpec.InstanceTypes` unless you have a specific reason to constrain the search space. The execution role must include the required SageMaker, MLflow, Amazon S3, and endpoint invocation permissions. The S3 output bucket must be in the same Region as the job.



For the complete end-to-end notebook, including additional examples with `AIRecommendationJob`, see the step-by-step tutorial.

### Step 1: Set up your environment

Start by setting your environment variables and initializing the SageMaker client.
    
    
    import json
    import time
    import uuid
    
    import boto3
    import botocore.config
    
    # Update these values for your environment
    REGION = "us-west-2"
    ACCOUNT_ID = "<your-account-id>"
    MLFLOW_APP_ARN = "arn:aws:sagemaker:us-west-2:<account-id>:mlflow-app/<app-id>"
    ENDPOINT_NAME = "my-model-endpoint"
    
    sm = boto3.client(
        "sagemaker",
        region_name=REGION,
        config=botocore.config.Config(
            retries={"mode": "standard", "max_attempts": 15}
        ),
    )
    
    # The S3 output bucket must be in the same Region as the job
    S3_OUTPUT_BUCKET = f"mlflow-sagemaker-{REGION}-{ACCOUNT_ID}"

### Step 2: Resolve the execution role

Amazon SageMaker AI uses the execution role to run the benchmark and recommendation jobs. It must have permissions to access SageMaker, invoke endpoints, write job output to Amazon S3, and publish tracking information to the SageMaker MLflow App. Follow the [notebook](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/03-features/gen-ai-inference-recommendations/gen-ai-inference-recommendations-and-benchmarking-mlflow.ipynb>) to create the IAM roles.

The role should include the following permissions:

**Permission area** | **Required access**  
---|---  
SageMaker job execution | `AmazonSageMakerFullAccess`, or a scoped equivalent  
MLflow integration | `sagemaker-mlflow:*`, `sagemaker:CallMlflowAppApi`, `sagemaker:DescribeMlflowApp`  
Endpoint invocation | `sagemaker:InvokeEndpoint`, `sagemaker:InvokeEndpointWithResponseStream`  
S3 output | Read/write access to the configured output bucket  
      
    
    ROLE_NAME = "tutorial-exec-role"
    
    iam = boto3.client("iam")
    role = iam.get_role(RoleName=ROLE_NAME)["Role"]
    ROLE_ARN = role["Arn"]
    
    print(f"Role ARN: {ROLE_ARN}")

Configure the execution role trust policy to allow SageMaker to assume the role. In some environments, you may also need to include the account root principal depending on how the role is created and passed.

### Step 3: Verify the MLflow App and define experiment names

Next, verify that the SageMaker MLflow App is available. Then define a shared experiment name and unique run names for the benchmark and recommendation jobs.

Using the same `MlflowExperimentName` for both jobs makes it easier to compare results in one place.
    
    
    # Verify that the MLflow App is available
    app = sm.describe_mlflow_app(Arn=MLFLOW_APP_ARN)
    MLFLOW_APP_URL = app["Url"]
    
    assert app["Status"] in ("Created", "Updated")
    
    print(f"MLflow URL: {MLFLOW_APP_URL}")
    
    # Define a shared experiment and unique run names
    MLFLOW_EXPERIMENT = "gemma-experiments"
    SESSION_UID = uuid.uuid4().hex[:6]
    
    BENCH_RUN_NAME = f"benchmark-{SESSION_UID}"
    REC_RUN_NAME = f"recommendation-{SESSION_UID}"

### Step 4: Submit the benchmark job

A SageMaker AI benchmark job evaluates an existing endpoint using a workload specification. In this example, the workload uses NVIDIA AIPerf with an OpenAI-compatible API schema.

The key field is `MlflowConfig` in `OutputConfig`. This tells SageMaker to stream benchmark metrics, parameters, and charts directly into your SageMaker MLflow App.
    
    
    # Tokenizer MUST match the deployed model.
    # tooling.version=0.8.0 is the minimum for MLflow nested run support.
    TOKENIZER = "Qwen/Qwen2-0.5B-Instruct"
    bench_workload = {
        "benchmark": {"type": "aiperf"},
        "parameters": {
            "model": TOKENIZER,
            "concurrency": 1,
            "request_count": 3,
            "streaming": True,
            "prompt_input_tokens_mean": 32,
            "prompt_input_tokens_stddev": 8,
            "output_tokens_mean": 16,
            "output_tokens_stddev": 4,
            "random_seed": 42,
        },
        "tooling": {
            "api_standard": "openai",
            "version": "0.8.0",
        },
    }
    
    BENCH_CONFIG = f"mlflow-bench-cfg-{SESSION_UID}"
    BENCH_JOB = f"mlflow-bench-job-{SESSION_UID}"
    
    sm.create_ai_workload_config(
        AIWorkloadConfigName=BENCH_CONFIG,
        AIWorkloadConfigs={
            "WorkloadSpec": {
                "Inline": json.dumps(bench_workload)
            }
        },
    )
    
    sm.create_ai_benchmark_job(
        AIBenchmarkJobName=BENCH_JOB,
        AIWorkloadConfigIdentifier=BENCH_CONFIG,
        RoleArn=ROLE_ARN,
        BenchmarkTarget={
            "Endpoint": {
                "Identifier": ENDPOINT_NAME
            }
        },
        OutputConfig={
            "S3OutputLocation": f"s3://{S3_OUTPUT_BUCKET}/mlflow-tutorial/{BENCH_JOB}/",
            "MlflowConfig": {
                "MlflowResourceArn": MLFLOW_APP_ARN,
                "MlflowExperimentName": MLFLOW_EXPERIMENT,
                "MlflowRunName": BENCH_RUN_NAME,
            },
        },
    )
    
    print(f"Benchmark job submitted: {BENCH_JOB}")

### Step 5: Submit the recommendation job

SageMaker AI recommendation jobs evaluate deployment configurations and recommend options based on your workload and performance target. Unlike benchmark jobs, recommendation jobs provision their own endpoints internally during the evaluation process.

The following example uses the same MLflow experiment name as the benchmark job, so both runs appear together in the SageMaker MLflow App.
    
    
    rec_workload = {
        "benchmark": {"type": "aiperf"},
        "parameters": {
            "prompt_input_tokens_mean": 1600,
            "prompt_input_tokens_stddev": 200,
            "output_tokens_mean": 600,
            "output_tokens_stddev": 100,
            "request_count": 100,
        },
        "tooling": {
            "api_standard": "openai",
            "version": "0.8.0",
        },
    }
    
    REC_CONFIG = f"mlflow-rec-cfg-{SESSION_UID}"
    REC_JOB = f"mlflow-rec-job-{SESSION_UID}"
    
    sm.create_ai_workload_config(
        AIWorkloadConfigName=REC_CONFIG,
        AIWorkloadConfigs={
            "WorkloadSpec": {
                "Inline": json.dumps(rec_workload)
            }
        },
    )
    
    sm.create_ai_recommendation_job(
        AIRecommendationJobName=REC_JOB,
        ModelSource={
            "S3": {
                "S3Uri": MODEL_S3_URI
            }
        },
        OutputConfig={
            "S3OutputLocation": f"s3://{S3_OUTPUT_BUCKET}/mlflow-tutorial/{REC_JOB}/",
            "MlflowConfig": {
                "MlflowResourceArn": MLFLOW_APP_ARN,
                "MlflowExperimentName": MLFLOW_EXPERIMENT,
                "MlflowRunName": REC_RUN_NAME,
            },
        },
        RoleArn=ROLE_ARN,
        AIWorkloadConfigIdentifier=REC_CONFIG,
        PerformanceTarget={
            "Constraints": [
                {
                    "Metric": "ttft-ms"
                }
            ]
        },
        OptimizeModel=False,
    )
    
    print(f"Recommendation job submitted: {REC_JOB}")

### Step 6: Compare results in MLflow

After the jobs complete, open the SageMaker MLflow App and navigate to the experiment you configured. The following code gives you the URL to your MLflow app in the notebook.
    
    
    print(f"Open: {MLFLOW_APP_URL}")

In the experiment view, the parent runs are empty placeholders that exist to show relationships between child runs. You need to expand each parent run to view the nested metrics.
    
    
    benchmark-<uid>        -> Single run with AIPerf benchmark metrics
    recommendation-<uid>   -> Nested run tree with ranked recommendation configurations

The child runs contain the model metrics. To review recommendation job metrics, go to the MLflow Runs page, expand the recommendation job parent run, and then expand the nested child runs until the concurrency rows are visible. The benchmark metrics appear in the Metrics columns for each concurrency run as shown in the following diagram:

To inspect recommendations artifacts, open the **Concurrency=4** run and choose the **Artifacts** tab. In the artifact file tree, expand **exports** and select **outputs.json**. The preview panel shows the artifact file path and JSON output, including request-level fields such as session ID, request timing, output token count, request latency, and response text as shown in the following diagram:

On the Runs page, select the benchmark runs you want to compare, such as the Concurrency=32, Concurrency=16, Concurrency=8, and Concurrency=4 rows. Choose Compare to view metric differences across duration, throughput, output token count, and request latency as shown in the following diagram:

In the Metrics section, use the Show diff only toggle to view only changed metrics. The table compares benchmark metrics such as benchmark duration and end-to-end output token throughput across the selected benchmark or recommendation job results as shown in the following diagram:

## Clean up resources

To avoid ongoing charges, delete the resources you created during this walkthrough. Remove the SageMaker MLflow App from SageMaker Unified Studio and delete the benchmark and recommendation jobs. Terminate any SageMaker endpoints you deployed for testing and remove the S3 output objects if they are no longer needed. If you created a dedicated IAM role for this tutorial, delete it along with its inline policies.

## Conclusion

The MLflow integration for SageMaker AI `BenchmarkJob` and `AIRecommendationJob` makes experiment results easier to track and understand. By streaming results directly into a familiar tracking interface, this integration removes the manual overhead that slows you down and provides real-time monitoring that saves compute costs. It also provides the reproducibility that production machine learning (ML) workflows demand.

Start comparing experiments in seconds. Add `MlflowConfig` to your next benchmark job, open the generated runs in MLflow, and compare metrics such as benchmark duration, throughput, output token count, and request latency across configurations.

_To learn more about Amazon SageMaker AI optimization capabilities, visit the[SageMaker documentation](<https://docs.aws.amazon.com/sagemaker/>) and the [GitHub](<https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/03-features/gen-ai-inference-recommendations/gen-ai-inference-recommendations-and-benchmarking-mlflow.ipynb>) notebook to get started._

* * *

## About the authors

### Mona Mona

[Mona](<https://www.linkedin.com/in/mona-mona/>) currently works as Sr AI/ML specialist Solutions Architect at Amazon. She worked in Google previously as Lead generative AI specialist. She is a published author of three AI books. She has authored multiple blogs on AI/ML and cloud technology and a co-author on a research paper on CORD19 Neural Search which won an award for Best Research Paper at the prestigious AAAI (Association for the Advancement of Artificial Intelligence) conference.

### Lokeshwaran Ravi

Lokeshwaran is a Senior Deep Learning Compiler Engineer at AWS, specializing in ML optimization, model acceleration, and AI security. He focuses on enhancing efficiency, reducing costs, and building secure ecosystems to democratize AI technologies, making cutting-edge ML accessible and impactful across industries.

### Kareem Syed-Mohammed

Kareem is a Product Manager at AWS. He is focuses on enabling Gen AI model development and governance on SageMaker HyperPod. Prior to this, at Amazon Quick Sight, he led embedded analytics, and developer experience. In addition to Quick Sight, he has been with AWS Marketplace and Amazon retail as a Product Manager. Kareem started his career as a developer for call center technologies, Local Expert and Ads for Expedia, and management consultant at McKinsey.

### Shen Teng

Shen is a Software Dev Engineer II at AWS.

### Siddharth Shah

Siddharth is a Principal Engineer at AWS SageMaker, specializing in large-scale model hosting and optimization for Large Language Models. He previously worked on the launch of Amazon Textract, performance improvements in the model-hosting platform, and expedited retrieval systems for Amazon S3 Glacier. Outside of work, he enjoys hiking, video games, and hobby robotics.
