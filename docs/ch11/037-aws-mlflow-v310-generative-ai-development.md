# AWS Mlflow V310 Generative AI Development

## Ch11.037 AWS Mlflow V310 Generative AI Development

> 📊 Level ⭐⭐ | 14.0KB | `entities/aws-mlflow-v310-generative-ai-development.md`

# Streamlining generative AI development with MLflow v3.10 on Amazon SageMaker AI
Today, we're excited to announce that Amazon SageMaker AI MLflow Apps now support MLflow version 3.10, bringing enhanced capabilities for generative AI development and streamlined experiment tracking to your generative AI workflows. Building on the foundations established with [Amazon SageMaker AI MLflow Apps](<https://aws.amazon.com/blogs/machine-learning/scaling-mlflow-for-enterprise-ai-whats-new-in-sagemaker-ai-with-mlflow/>), this latest version introduces powerful new features for observability, evaluation, and generative AI development that help data scientists and ML engineers accelerate their AI initiatives from experimentation to production.
In this post, we'll explore what's new in MLflow v3.10, walk you through getting started with SageMaker AI MLflow Apps, and how to leverage these enhancements to build generative AI applications.

### **What's new in MLflow v3.10**
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
Choose **Create MLflow App** and enter a name. Here, we have both an [AWS Identity and Access Management (IAM) role](<https://aws.amazon.com/iam/>) and [Amazon Simple Service (Amazon S3)](<https://aws.amazon.com/s3/>) bucket already configured for you using the SageMaker AI Studio domain's defaults. And you only need to modify them in the **Advanced settings** if needed, as shown below.
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

## 深度分析

**1. AWS 正从基础设施提供商向 AI 开发平台战略升维**
MLflow v3.10 的发布标志着 AWS 不再仅是提供 GPU 实例的云基础设施商，而是通过深度集成 MLflow 生态系统，晋升为端到端的 AI 开发平台。 SageMaker Studio + MLflow Apps 的组合拳意味着数据科学家可以在同一环境中完成从实验跟踪、模型训练到生产监控的全流程，而无需维护独立的 MLflow 服务器。这种"平台即服务"的策略正在头部云厂商中形成共识：Google 有 Vertex AI + LangChain 集成，Microsoft 有 Azure AI Studio，而 AWS 通过 SageMaker MLflow Apps 走出了自己的路。

**2. mlflow.genai.evaluation() API：企业级生成式 AI 质量治理的基础设施**
本次更新最具实质性的新功能是 `mlflow.genai.evaluation()` API，它提供了对生成式 AI 输出进行系统性评估的程序化接口，内置 relevance（相关性）、faithfulness（忠实度）、correctness（正确性）和 safety（安全性）四大指标。 在生成式 AI 的生产环境中，由于输出的非确定性，传统的准确率指标难以适用，而人工评估又无法规模化。AWS 引入可编程的自动评估 API，本质上是在为企业级 AI 应用构建可审计的质量基线——这对受监管行业（金融、医疗）的 AI 合规至关重要。

**3. Token 用量可见性：生成式 AI 成本治理的拐点**
v3.10 的可观测性改进中，latency distributions、request counts 和 token usage 的开箱即用仪表板解决了企业采用生成式 AI 的核心痛点之一：成本不可预测性。 当企业从实验走向生产时，推理成本往往在某个时间窗口内突然爆发，而缺乏细粒度的 token 监控意味着无法定位成本源头。SageMaker MLflow Apps 的预构建仪表板将推理成本可视化，直接解决了这一运营盲点，这也是 AI 平台从"实验工具"向"运营工具"演进的标志性信号。

**4. 多云与混合策略：MLflow 作为互操作层**
MLflow 本身是云无关的开源框架，而 AWS 将其托管在 SageMaker 中，意味着 AWS 意图在多云大趋势下抢占 MLflow 这一互操作层的话语权。 企业若已在 SageMaker MLflow 上构建了实验跟踪和评估工作流，迁移到其他云平台的成本将显著增加——这与 AWS 过去通过 DocumentDB 兼容 MongoDB 协议来锁定开发者的策略一脉相承。

## 实践启示

1. **生成式 AI 项目起步时即应集成 mlflow.genai.evaluation()**
   在 POC 阶段就引入自动评估工作流，而非事后补救。建议为每个 LLM 应用配置 relevance 和 faithfulness 作为 baseline 指标，建立质量回归的自动化预警机制。

2. **利用 MLflow Workspaces 组织多团队 AI 治理**
   MLflow v3.10 的 Workspaces 功能提供了跨团队共享和隔离 Artifacts 的结构化方案。大型组织应借此建立统一的 AI 实验注册表，避免重复实验和数据孤岛问题。

3. **在生产环境部署 token 成本监控仪表板**
   借助 v3.10 的预构建 token usage 仪表板建立实时成本可见性，按应用、模型版本和团队维度拆分推理成本，将成本异常检测纳入 CI/CD 流程。

4. **评估迁移至 SageMaker MLflow Apps 的基础设施收益**
   对于已有自托管 MLflow 的团队，SageMaker MLflow Apps 提供了免运维的实验跟踪服务，综合评估迁移收益时应同时计算运维人力成本节约和与 SageMaker 其他服务（JumpStart、Inference Endpoints）的集成效率提升。

5. **关注 mlflow.genai.evaluation() 在受监管行业的合规应用**
   金融和医疗领域的 AI 应用面临模型决策可解释性和审计要求，内置的 faithfulness 和 correctness 指标可作为模型审计文档的自动化数据源，降低合规团队的人工复核成本。

## 相关实体
- [How Amazon Finance Streamlines Regulatory Inquiries By Using](https://github.com/QianJinGuo/wiki/blob/main/entities/how-amazon-finance-streamlines-regulatory-inquiries-by-using.md)
- [Aws Generative Ai Model Agility Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-generative-ai-model-agility-framework.md)
- [Aws Sagemaker Ai Agent Guided Workflows Finetuning](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-sagemaker-ai-agent-guided-workflows-finetuning.md)
- [Aws Bedrock Halliburton Seismic Workflow Genai](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-bedrock-halliburton-seismic-workflow-genai.md)
- [Cost Effective Deployment Of Vision Language Models For Pet Behavior Detection O](https://github.com/QianJinGuo/wiki/blob/main/entities/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-o.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aws-mlflow-v310-generative-ai-development.md)

---

