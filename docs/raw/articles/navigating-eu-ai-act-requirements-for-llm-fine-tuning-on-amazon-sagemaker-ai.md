---
title: "Navigating EU AI Act Requirements for LLM Fine-Tuning"
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/navigating-eu-ai-act-requirements-for-llm-fine-tuning-on-amazon-sagemaker-ai/
tags: [aws-china-blog, agentic-ai, context-engineering]
review_value: 8
review_confidence: 9
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
date: 2026-05-13
sha256: f975e5636d5f27e3b35226f45dc09f2315eb7af93bcc09a8dde1eda1e7624989
---
Title: Navigating EU AI Act requirements for LLM fine-tuning on Amazon SageMaker AI | Amazon Web Services
URL Source: https://aws.amazon.com/blogs/machine-learning/navigating-eu-ai-act-requirements-for-llm-fine-tuning-on-amazon-sagemaker-ai/
Published Time: 2026-05-12T07:48:52-08:00
Markdown Content:
The EU AI Act requires organizations fine-tuning large language models (LLMs) to track computational resources measured in floating-point operations (FLOPs) to determine compliance obligations. As customers increasingly fine-tune LLMs for domain-specific use cases, we hear a common question: how do I know if my training job triggers new regulatory obligations?
[Amazon SageMaker AI](https://aws.amazon.com/sagemaker/ai/) provides a managed machine learning (ML) service for building, training, and deploying models. This solution uses [Amazon SageMaker Training](https://aws.amazon.com/sagemaker/ai/train/) jobs to run fine-tuning workloads on fully managed infrastructure. SageMaker Training jobs handle resource provisioning, scaling, and cluster management, with built-in support for distributed training, integration with [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) and [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/) for governance, and automatic decommissioning of compute resources after training completes. The Fine-Tuning FLOPs Meter extends these capabilities with purpose-built compliance tracking that integrates into your existing SageMaker AI pipelines.
In this post, we show you how to set up FLOPs tracking during LLM fine-tuning using the open source Fine-Tuning [FLOPs Meter toolkit](https://github.com/aws-samples/amazon-sagemaker-generativeai/blob/main/0_model_customization_recipes/README.md) on Amazon SageMaker AI. You learn how to determine your compliance status with a single configuration flag and generate audit-ready documentation.
## EU AI Act and FLOPs tracking requirements
On August 2, 2025, the EU AI Act introduced [new requirements](https://ec.europa.eu/newsroom/dae/redirection/document/118340) for organizations working with general-purpose artificial intelligence (GPAI) models. If you’re fine-tuning an LLM, you must determine whether your modifications reclassify you from a downstream user (an organization that uses an existing model without substantial modification) to a GPAI model provider (an organization legally responsible for a model’s compliance). The classification depends on how much compute your fine-tuning consumes, measured in FLOPs.
The one-third rule distinguishes between minor modifications and substantial retraining. The rationale behind the 30% threshold: regulatory analysis determined that using more than one-third of the original training compute typically results in significant behavioral changes to the model, effectively creating a new model with different risks that warrant full provider obligations. Most organizations use scenario 2 in the following table because model providers rarely publish exact training FLOPs. Unless you have documented pretraining compute from your model provider, the default threshold of 3.3×10²² FLOPs applies. There are 3 applicable scenarios and thresholds to consider:
**Scenario****Threshold**
Pretraining compute is known and ≥ 10²³ FLOPs 30% of the actual pretraining compute
Pretraining compute is unknown or < 10²³ FLOPs Default threshold of 3.3×10²² FLOPs
Systemic Risk Models (Pre-training FLOPs ≥ 1025 FLOPs)3.3×1024 FLOPs (if base compute is unknown)
The Fine-Tuning FLOPs Meter automatically determines which scenario applies based on whether you provide the `PRETRAIN_FLOPS` environment variable. To help you quickly determine which threshold path applies, use the following decision flow:
**Step 1: Do you know your base model’s pretraining FLOPs?**
*   **No:** Proceed directly to the **Default Threshold** of 3.3×10²² FLOPs.
*   **Yes:** Move to the next evaluation step.
**Step 2: Evaluate pretraining compute scale**
If you know your pretraining compute, compare it against the following orders of magnitude:
1.   **Is pretraining compute ≥ 10 25 FLOPs?**
    *   **Yes:** You fall under the **Systemic Risk Threshold.**Use a threshold of 3.3×10 24 FLOPs.
    *   **No:**Move to the next question.
2.   **Is pretraining compute ≥ 10²³ FLOPs?**
    *   **Yes:** Use a **Relative Threshold**of 30% of actual pretraining compute.
    *   **No:** Proceed to the **Default Threshold** of 3.3×10²² FLOPs.
For example, fine-tuning Llama-3-70B (pretrained with an estimated minimum of 1.5×10²⁴ FLOPs) sets the threshold at 4.5×10²³ FLOPs. Exceeding this threshold means you take on the full obligations of a GPAI model provider. Those obligations include delivering detailed architecture and training process disclosures, providing a public-facing list of data sources used, and demonstrating compliance with EU copyright law. If you don’t comply, you might face fines up to €15 million or 3% of your global annual turnover, whichever is higher.
## The challenge of manual FLOPs tracking
These thresholds present three compliance challenges:
1.   FLOPs formulas are complex and differ depending on whether you’re doing full fine-tuning or using parameter-efficient methods (training approaches like Low-Rank Adaptation (LoRA) that update only a small subset of model parameters).
2.   The applicable threshold is hard to determine because pretraining compute figures are rarely published.
3.   Maintaining an audit trail (a permanent record of compliance metrics for regulatory review) across multiple training jobs adds operational overhead.
Incorrect calculations change whether you operate as a downstream user or face classification as a full GPAI model provider. The Fine-Tuning FLOPs Meter automates the tracking process, addressing these challenges.
## Solution overview
The Fine-Tuning FLOPs Meter is an open source toolkit, available in the [Amazon SageMaker Generative AI recipes repository](https://github.com/aws-samples/amazon-sagemaker-generativeai/tree/main/0_model_customization_recipes), that integrates into [Hugging Face](https://huggingface.co/) training workflows on Amazon SageMaker AI. It tracks computational resources across the entire fine-tuning lifecycle. The following diagram illustrates the compliance workflow.
![Image 1: Diagram describing fine-tuning FLOPs Meter compliance workflow including pre-training estimation, runtime tracking and post-training audit trail](https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/30/ML-20303-image-1.png)
Figure 1. Fine-Tuning FLOPs Meter compliance workflow
The toolkit covers three stages of the fine-tuning lifecycle, with runtime tracking as the core capability.
**First stage:** an optional pre-training estimation utility lets you compare expected FLOPs across training methods (LoRA, Spectrum, Full) before you launch a job.
**Second stage:** runtime tracking, the main feature, uses a Hugging Face `TrainerCallback` to calculate FLOPs in real time during training using both architecture-based analytics and hardware-based GPU monitoring through NVIDIA Management Library (NVML).
**Third stage:** a post-training audit trail automatically stores complete compliance metrics in JSON format. You can persist results to [Amazon Simple Storage Service (Amazon S3)](https://aws.amazon.com/pm/serv-s3/) or [Amazon DynamoDB](https://aws.amazon.com/dynamodb/).
You can opt in with a single configuration line (`compute_flops: true`). The FLOPs Meter includes parameter-efficient awareness using an enhanced formula to accurately estimate for full, LoRA, and Spectrum fine-tuning approaches. It generates audit-ready compliance documentation covering the fields required for EU AI Act reporting, and it performs automated threshold comparison that helps determine the applicable regulatory threshold and flags whether your fine-tuning job exceeds it.
## Technical implementation
The following subsections cover how FLOPs are calculated and how the tracking integrates with your training workflow on Amazon SageMaker AI.
### Prerequisites
You must complete the following prerequisites before you can run the FLOPs Meter walkthrough:
1.   Make the following quota increase request for SageMaker AI. For this use case, you need a minimum of 1 ml.g5.4xlarge instance (with 1 x NVIDIA A10G GPU). On the [Service Quotas](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html) console, request the SageMaker AI quota **G5 instances (_ml.g5.4xlarge_) for training job usage: 1**
2.   Create an [AWS Identity and Access Management](https://aws.amazon.com/iam/) (IAM) [role](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-roles.html#:~:text=the%20following%20procedures.-%5B%E2%80%A6%5Dxecution%20role,-Use%20the%20following%20() with managed policies `AmazonSageMakerFullAccess` and `AmazonS3FullAccess` to give required access to SageMaker AI to run the examples.
3.   Assign the following policy as a trust relationship to your IAM role:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "sagemaker.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```
JSON
1.   (Optional) Create an [Amazon SageMaker Studio](https://aws.amazon.com/sagemaker/ai/studio/) domain (refer to [Use quick setup for](https://docs.aws.amazon.com/sagemaker/latest/dg/onboard-quick-start.html)[Amazon SageMaker AI](https://docs.aws.amazon.com/sagemaker/latest/dg/onboard-quick-start.html)) to access [Jupyter notebooks](https://docs.aws.amazon.com/sagemaker/latest/dg/studio-updated-jl-user-guide.html) with the preceding role. You can also use JupyterLab in your local setup.
These permissions grant broad access and are not recommended for use in production environments. For guidance on defining more fine-grained permissions, refer to the [SageMaker AI Developer Guide](https://docs.aws.amazon.com/sagemaker/).
### FLOPs calculation formulas
For compliance reporting, use the analytical method (`Flops_architecture`) as your primary metric. The toolkit also calculates a hardware-based upper bound for conservative reporting. Both methods run automatically. The following sections describe the implementation details.
The EU AI Act guidelines (Section A.2.1) describe two approaches for estimating training compute:
1.   **Architecture-based approach** (analytical):
The standard EU formula for dense transformers is:
`C ≈ 6 × P × D`
Where `P` is the number of parameters and `D` is the number of training tokens. This assumes full fine-tuning, where all parameters are trainable.
An enhanced formula accounts for parameter-efficient methods:
`F_ft = (4 × N_total + 2 × N_trainable) × tokens_processed`
Here’s the breakdown:
*   4 × `N_total` — forward pass (2×) plus backward pass gradient computation through each layer (2×), including frozen ones
*   2 × `N_trainable` — gradient computation with respect to trainable weights only
For full fine-tuning where `N_total = N_trainable`, this reduces to `6 × N × D`, which is equivalent to the EU formula. For LoRA or Spectrum, it provides a more accurate (and lower) estimate, reflecting that fewer parameters receive gradient updates.
1.   **Hardware-based approach** (upper bound):
This approach uses the following formula:
`C = N_gpus × L × H × U`
Where `N_gpus` is the number of GPUs, `L` is training duration in seconds, `H` is peak theoretical performance (FLOPs), and `U` is utilization. The FLOPs Meter uses _U = 1.0_ (100% utilization) to produce a conservative upper bound via NVML GPU monitoring.
### Threshold logic
The toolkit implements the EU AI Act threshold logic in `determine_compliance_threshold()`:
```
EU_AI_ACT_GPAI_THRESHOLD = 1e23                     # 10²³ FLOPs
EU_AI_ACT_DEFAULT_THRESHOLD = 3.3e22                # One-third of 10²³
if pretrain_flops is None or pretrain_flops < EU_AI_ACT_GPAI_THRESHOLD:
    threshold = EU_AI_ACT_DEFAULT_THRESHOLD         # "default_3.3e22"
else:
    threshold = 0.30 * pretrain_flops               # "30pct_of_actual_pretraining"
```
Python
### Integration with SageMaker Training jobs
The FLOPs Meter works as a Hugging Face `TrainerCallback`. To activate tracking, add a single line in the recipe YAML:
```
compute_flops: true
```
YAML
At training launch, the training script (`sft.py`) checks this flag and, if activated, initializes the `FlopsMeterCallback`with model parameter counts and an optional `PRETRAIN_FLOPS` environment variable. A custom `TokenCountingSFTTrainer` replaces the standard `SFTTrainer` to count non-padding tokens at each training step.
```
n_total = sum(p.numel() for p in model.parameters())
n_trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
flops_cb = FlopsMeterCallback(
    pad_token_id=tokenizer.pad_token_id,
    pretrain_flops=pretrain_flops,       # from PRETRAIN_FLOPS env var
    sample_nvml=True,
    n_total=n_total,
    n_trainable=n_trainable,
    model_name=model_args.model_name_or_path,
    num_epochs=training_args.num_train_epochs,
)
```
Python
At training completion, the callback computes both analytical and hardware FLOPs, determines the applicable threshold, and writes a `flops_meter.json` file to `/opt/ml/output/`. The pipeline’s `ProcessTrainingOutputs` step then uploads the results to Amazon S3 and persists them to Amazon DynamoDB for audit trail purposes.
## Walkthrough
The following walkthrough uses **meta-llama/Llama-3.2-3B-Instruct** (3.21 billion parameters). Because Meta has not published exact pretraining FLOPs for this model, the default threshold path applies: 3.3×10²² as the compliance threshold.
### Pre-Training estimation (optional)
A standalone estimation utility (`estimate_flops.py`) compares expected FLOPs across training methods (LoRA, Spectrum, and full fine-tuning) before you launch a job. This is useful for planning: it shows how close a given configuration comes to the compliance threshold, helping you make informed decisions about training method and dataset size. The estimation utility is separate from the core runtime tracking and you can run it independently in a notebook.
### Runtime tracking
During training, the `FlopsMeterCallback` tracks FLOPs in real time. This is where the actual compliance measurement happens. When training begins (`on_train_begin`), the callback captures model parameter counts (`N_total, N_trainable`), starts an NVML GPU monitoring thread, and records the start timestamp. As training progresses, non-padding tokens are counted per batch at each substep (`on_substep_end`) and aggregated across GPUs in distributed training. When training completes (`on_train_end`), the callback computes architecture-based FLOPs from the accumulated token count, stops NVML monitoring to calculate the hardware upper bound, determines the applicable threshold, and writes the complete metrics to `flops_meter.json`.
A recipe configuration for Llama-3.2-3B with LoRA and FLOPs tracking activated:
```
model_name_or_path: meta-llama/Llama-3.2-3B-Instruct
dataset_id_or_path: your-dataset.jsonl
use_peft: true
compute_flops: true
per_device_train_batch_size: 8
num_train_epochs: 10
learning_rate: 2e-5
peft_config:
  r: 8
  lora_alpha: 16
  target_modules: ["q_proj", "v_proj"]
```
YAML
In your Amazon SageMaker AI notebook or Python script, use the `ModelTrainer` class from the SageMaker Python SDK v3 to launch the training job as a SageMaker Training job:
```
from sagemaker.modules.configs import Compute, SourceCode
from sagemaker.modules.train import ModelTrainer
training_instance_type = "ml.g5.4xlarge"
pytorch_image_uri = sagemaker.image_uris.retrieve(
    framework="pytorch",
    region=sess.boto_session.region_name,
    version="2.7.1",
    instance_type=training_instance_type,
    image_scope="training",
)
source_code = SourceCode(
    source_dir="./sagemaker_code",
    command="bash sm_accelerate_train.sh --config hf_recipes/meta-llama/Llama-3.2-3B-Instruct--vanilla-peft-qlora.yaml",
)
compute = Compute(
    instance_type=training_instance_type,
    instance_count=1,
    volume_size_in_gb=300,
)
model_trainer = ModelTrainer(
    training_image=pytorch_image_uri,
    source_code=source_code,
    compute=compute,
    role=role,
    environment={
        "FLOPS_METER_NVML": "1",
    },
)
model_trainer.train()
```
Python
Because pretraining FLOPs are not known for this model, the `PRETRAIN_FLOPS` environment variable is omitted. The default threshold is applied automatically.
### Compliance documentation
At training completion, the callback generates a `flops_meter.json` file containing the metrics needed for regulatory documentation:
```
{
  "Flops_architecture": "1.45e+13",
  "Flops_hardware": "1.52e+15",
  "Flops_original": null,
  "N_total": 1585294704,
  "N_trainable": 680094720,
  "threshold_type": "default_3.3e22",
  "threshold_value": "3.30e+22",
  "pct_of_pretrain": 0.000000439,
  "exceeds_30pct": false,
  "tokens_processed": 2150,
  "model_name": "meta-llama/Llama-3.2-3B-Instruct",
  "num_epochs": 10,
  "training_duration_seconds": 245.30,
  "gpu_name": "NVIDIA A10G",
  "instance_type": "ml.g5.4xlarge",
  "training_job_name": "pipelines-abc123-TrainingStep-xyz789",
  "recipe_config": "hf_recipes/meta-llama/Llama-3.2-3B-Instruct--vanilla-peft-qlora.yaml"
}
```
JSON
Use `Flops_architecture` as your primary compliance metric. It accurately reflects your actual training configuration. `Flops_hardware` provides a conservative upper bound and can serve as a safety margin for extra-cautious reporting. For most regulatory purposes, the analytical value is sufficient.
Other key fields include `threshold_type`, which indicates which threshold rule was applied (`default_3.3e22` since pretraining FLOPs are unknown), `exceeds_30pct` as a boolean flag for quick compliance assessment, and `Flops_original`, which is null when pretraining FLOPs are not provided.
The pipeline automatically uploads this file to Amazon S3 and stores it in Amazon DynamoDB, creating a persistent audit trail across training runs.
### What if you exceed the threshold?
If your compliance report shows `exceeds_30pct: true`, you’re classified as a GPAI model provider under the EU AI Act. Your next steps would include: (1) document your model architecture and training process, (2) prepare a public-facing list of training data sources, (3) demonstrate EU copyright law compliance, and (4) consider consulting with legal counsel familiar with EU AI regulations. Note that there are additional obligations if your GPAI model is classified as Systemic Risk. You might also consider reducing your training scope (fewer epochs, smaller dataset, or switching to LoRA) to stay below the threshold.
### Scaling to production workloads
This example used a small dataset for demonstration purposes (2,150 tokens). In production, you typically process millions of tokens. For example, fine-tuning Llama-3.2-3B on 1 million tokens with LoRA results in approximately 6.7×10¹⁸ FLOPs, still well below the 3.3×10²² threshold. However, full fine-tuning on the same dataset consumes approximately 1.9×10¹⁹ FLOPs, bringing you closer to the threshold.
As a rule of thumb, compliance concern starts when your FLOPs reach 10²¹ or higher, about 3% of the default threshold. At that point, we recommend running the pre-training estimation tool before each job to verify you are aligned with compliance standards. For most LoRA fine-tuning jobs on models under 10B parameters, you remain well below the threshold even with millions of training tokens.
## Getting started
The FLOPs Meter is available as part of the [Amazon SageMaker Generative AI recipes repository](https://github.com/atselikov/amazon-sagemaker-generativeai/blob/main/0_model_customization_recipes/README.md).
## Prerequisites
Before you begin, make sure you have:
*   An AWS account with Amazon SageMaker AI access
*   AWS Command Line Interface (AWS CLI) configured with appropriate credentials
*   Python 3.11 or later installed
*   Familiarity with Hugging Face Transformers and PyTorch
## Procedure
To start FLOPs tracking:
1.   Clone the repository:
`git clone https://github.com/aws-samples/amazon-sagemaker-generativeai.git`
Code
1.   Open your recipe configuration file (for example, `hf_recipes/meta-llama/Llama-3.2-3B-Instruct--vanilla-peft-qlora.yaml`) and add the following line:
`compute_flops: true`
Code
1.   (Optional) If you know the pretraining FLOPs for your base model, set the environment variable:
`export PRETRAIN_FLOPS="1.5e24" # Example: Llama-3-70B`
Code
1.   Launch your training job on Amazon SageMaker AI: 
    *   Open your SageMaker AI notebook or Python script.
    *   Configure the `PyTorch Estimator` (see the code example in the Walkthrough section).
    *   Run `estimator.fit()` to start the training job.
2.   After training completes, review the generated `flops_meter.json` file in your Amazon S3 output location. You should see a JSON file containing FLOPs metrics, threshold determination, and compliance status.
For a deeper look at the implementation, see the [source code for flops_meter.py.](https://github.com/aws-samples/amazon-sagemaker-generativeai/blob/main/0_model_customization_recipes/supervised_finetuning/sagemaker_code/utils/flops_meter.py)
## Clean up
To avoid ongoing charges, delete the resources you created:
1.   Stop running SageMaker AI training jobs: 
    *   Open the [Amazon SageMaker AI console](https://console.aws.amazon.com/sagemaker/ai)
    *   Navigate to **Training** and go to**Training jobs**
    *   Select **Running Jobs** and choose **Stop**
2.   Delete Amazon S3 outputs: 
    *   Open the [Amazon S3 console](https://console.aws.amazon.com/s3/)
    *   Navigate to your training output bucket
    *   Select the `flops_meter.json` files and choose **Delete**
    *   Or delete the entire bucket if you created it specifically for this walkthrough
3.   Delete the Amazon DynamoDB table if you created one specifically for this walkthrough: 
    *   Open the [Amazon DynamoDB console](https://console.aws.amazon.com/dynamodb/)
    *   Select the table and choose **Delete**
4.   Remove SageMaker AI endpoints if you deployed your fine-tuned model
## Conclusion
In this post, we showed you how to implement FLOPs tracking during LLM fine-tuning on Amazon SageMaker AI. You learned how the Fine-Tuning FLOPs Meter calculates computational resources using both analytical and hardware-based methods, how it applies the one-third rule to help determine regulatory thresholds, and how to generate audit-ready JSON documentation with a single configuration flag.
With this tooling, you can focus on building models while maintaining full transparency into your computational footprint.
To get started, clone the [repository](https://github.com/aws-samples/amazon-sagemaker-generativeai) and run the pre-training estimation tool with your planned model and dataset. For more information about building compliance-aligned AI systems on AWS, see the [Amazon SageMaker AI documentation](https://docs.aws.amazon.com/sagemaker/).
* * *
## About the authors