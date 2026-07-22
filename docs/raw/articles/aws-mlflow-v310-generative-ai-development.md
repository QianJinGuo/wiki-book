---
title: "aws mlflow v310 generative ai development"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/streamlining-generative-ai-development-with-mlflow-v3-10-on-amazon-sagemaker-ai/
tags: [aws-china-blog, agentic-ai]
ingested: 2026-05-08
feed_name: AWS China ML
source_published: 2026-05-05T16:55:18Z
sha256: f165aff2402e
type: raw
created: 2026-05-10
updated: 2026-05-10
---
# Streamlining generative AI development with MLflow v3.10 on Amazon SageMaker AI
Today, we’re excited to announce that Amazon SageMaker AI MLflow Apps now support MLflow version 3.10, bringing enhanced capabilities for generative AI development and streamlined experiment tracking to your generative AI workflows. Building on the foundations established with [Amazon SageMaker AI MLflow Apps](<https://aws.amazon.com/blogs/machine-learning/scaling-mlflow-for-enterprise-ai-whats-new-in-sagemaker-ai-with-mlflow/>), this latest version introduces powerful new features for observability, evaluation, and generative AI development that help data scientists and ML engineers accelerate their AI initiatives from experimentation to production.
In this post, we’ll explore what’s new in MLflow v3.10, walk you through getting started with SageMaker AI MLflow Apps, and how to leverage these enhancements to build generative AI applications.
### **What’s new in MLflow v3.10**
MLflow 3.10 introduces a set of targeted improvements to the MLflow ecosystem that extend the tracing and observability capabilities established in MLflow 3.0, with a particular focus on generative AI application development and agentic workflows. On the generative AI front, this release delivers improved tracing for complex multi-turn workflows, tighter integration with popular LLM frameworks and libraries, and streamlined logging for generative AI interactions and invocations. Evaluation receives a substantial upgrade through the mlflow.genai.evaluation() API, which provides a programmatic interface for systematically measuring and maintaining generative AI quality across the development-to-production lifecycle with built-in metrics covering relevance, faithfulness, correctness, and safety—all of which integrate seamlessly with SageMaker AI workflows.
Observability improvements include more granular trace filtering and search, richer metadata capture for debugging and root-cause analysis, and [pre-built performance dashboards](<https://mlflow.org/docs/latest/genai/tracing/observe-with-traces/dashboard/>) that surface workload level metrics—latency distributions, request counts, quality scores, and [token usage](<https://mlflow.org/docs/latest/genai/tracing/token-usage-cost/>)—at a glance without manual chart configuration, giving teams running production workloads clear visibility into operational costs while [MLflow workspaces](<https://mlflow.org/docs/latest/self-hosting/workspaces/>) provide a structured way to organize MLflow artifacts across teams and projects, as shown below.
These improvements coupled with SageMaker AI provide an enterprise-grade generative AI infrastructure, making it straightforward to track experiments, monitor generative AI performance, and maintain governance across AI applications at scale.
## Getting started with SageMaker AI MLflow App v3.10
For new users, creating a SageMaker AI MLflow App is straightforward through the [SageMaker Studio console](<https://docs.aws.amazon.com/sagemaker/latest/dg/studio-updated-launch.html>), AWS CLI, or API. The default configuration automatically provisions MLflow 3.10, giving you immediate access to all the latest capabilities.
You can get started with fully managed MLflow 3.10 on Amazon SageMaker AI MLflow Apps through the [AWS Management Console](<https://aws.amazon.com/console/>), [AWS Command Line Interface](<https://aws.amazon.com/cli/>) (AWS CLI), or [API](<https://docs.aws.amazon.com/boto3/latest/reference/services/sagemaker/client/create_mlflow_app.html>).
### Prerequisites
To get started, you need:
  * An AWS account with billing enabled
  * An [Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker-ai/studio/>) AI domain. To create a domain, refer to [Guide to getting set up with Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/gs.html>).
Next, navigate to [Amazon SageMaker AI Studio console](<https://console.aws.amazon.com/sagemaker?trk=c4ea046f-18ad-4d23-a1ac-cdd1267f942c&sc_channel=el>) and select the MLflow application.
Choose **Create MLflow App** and enter a name. Here, we have both an [AWS Identity and Access Management (IAM) role](<https://aws.amazon.com/iam/>) and [Amazon Simple Service (Amazon S3)](<https://aws.amazon.com/s3/>) bucket already configured for you using the SageMaker AI Studio domain’s defaults. And you only need to modify them in the **Advanced settings** if needed, as shown below.
Once created, you receive an MLflow [Amazon Resource Name (ARN)](<https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html>) for connecting and you can immediately start using the newly created SageMaker AI MLflow App with MLflow v3.10 along with your existing code or you can follow along below to connect your code with SageMaker AI MLflow Apps.
To begin tracking your experiments with your newly created SageMaker AI MLflow App, you need to install both [MLflow ](<https://pypi.org/project/mlflow/>)and the AWS [SageMaker MLflow plugin](<https://pypi.org/project/sagemaker-mlflow/>) in your environment. You can use [SageMaker Studio managed Jupyter Lab](<https://docs.aws.amazon.com/sagemaker/latest/dg/studio-updated-jl-user-guide-create-space.html>), [SageMaker Studio Code Editor](<https://docs.aws.amazon.com/sagemaker/latest/dg/code-editor-use-studio.html>), a local integrated development environment (IDE), or other supported environment where your AI workloads operate with SageMaker AI MLFlow Apps.
To install both the Python packages using pip:
`pip install mlflow==3.10.1 sagemaker-mlflow==0.3.0`
To connect and start logging your AI experiments, parameters, and models directly to SageMaker AI MLflow Apps, see the code snippet below to get started with your workload. Note, replace the [Amazon Resource Name](<https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html>) (ARN) with your SageMaker AI MLflow App ARN below.
    import mlflow
    # Connect to your SageMaker MLflow App
    mlflow_app_arn = "<your-mlflow-app-arn>"
    mlflow.set_tracking_uri(mlflow_app_arn)
    # Set your experiment
    mlflow.set_experiment("your_genai_experiment")
    # Your existing code continues to work with enhanced capabilities
    # New features are automatically available
## Migration
If you have an existing MLflow Tracking Server or App hosted on SageMaker or elsewhere you can migrate to a new 3.10 app by following the instructions in the blog post [Migrate MLflow tracking servers to Amazon SageMaker AI with serverless MLflow](<https://aws.amazon.com/blogs/machine-learning/migrate-mlflow-tracking-servers-to-amazon-sagemaker-ai-with-serverless-mlflow/>).
## Conclusion
The introduction of MLflow v3.10 in Amazon SageMaker AI MLflow Apps represents a significant step forward in making enterprise AI development more efficient, observable, and manageable. Get started with by Amazon SageMaker AI MLflow Apps by visiting [Amazon SageMaker AI Studio](<https://aws.amazon.com/sagemaker/ai/studio/>) and creating your first MLflow App.
The new MLflow v3.10 is also supported in [Amazon SageMaker AI serverless model customization](<https://aws.amazon.com/sagemaker/ai/model-customization/>) and [SageMaker Unified Studio](<https://aws.amazon.com/sagemaker/unified-studio/>), and for additional workflow flexibility.
Share your feedback with us through [AWS re:Post for SageMaker](<https://repost.aws/tags/TA4iqFhPFhQHmnuCzD_r_5Ow/amazon-sage-maker>) or your usual AWS Support contacts.
* * *
## About the authors
### Sandeep Raveesh
Sandeep Raveesh is a GenAI GTM Specialist Solutions Architect at AWS. He works with customers through their LLM training, inference, and observability. He focuses on product development helping AWS build and solve industry challenges in the generative AI space. You can connect with Sandeep on LinkedIn to learn about generative AI solutions.
### Dana Benson
Dana Benson is a Software Development Manager working in SageMaker AI ML and LLM observability. Prior to joining AWS, Dana developed Smart Home behaviors for Alexa.
### Ruidi Peng
Ruidi Peng is a Software Development Engineer at AWS. He works on the Amazon SageMaker MLflow team, focusing on AI/ML and LLM observability. Ruidi is passionate about building scalable infrastructure that helps customers monitor and gain insights into their machine learning workloads. In his free time, he enjoys going for hikes and exploring the outdoors.