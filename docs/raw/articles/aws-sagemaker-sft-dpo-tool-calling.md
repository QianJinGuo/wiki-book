---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/improve-your-agents-tool-calling-accuracy-with-sft-and-dpo-on-amazon-sagemaker-ai
ingested: 2026-06-07
feed_name: AWS China ML
source_published: 2026-06-03
sha256: bfd855cc46b24a0477d42b636ec8ca5fb1e108affbffb692976518f2eda395e4
---

# Improve your agent’s tool-calling accuracy with SFT and DPO on Amazon SageMaker AI

AI agents can autonomously handle complex, multi-step tasks, but their effectiveness depends on calling the right tools to retrieve information or take action. When an agent picks the wrong tool, formats parameters incorrectly, or breaks a workflow chain, task completion times grow, error rates rise, support costs increase, and user experiences degrade. As more organizations move agentic applications from pilot to production, having agents that select the right tool for each request is essential for reliable automation.

In this post, you learn how to use Supervised Fine-Tuning (SFT) and Direct Preference Optimization (DPO) together to improve the tool-calling accuracy of a small language model (SLM). The example uses Amazon SageMaker AI training jobs, so you can focus on training code instead of managing your own training infrastructure. You also learn how to evaluate tool-calling accuracy and compare a base model to several fine-tuned variants, so you can make data-driven decisions about model quality.

## Fine-tuning methodologies

Supervised fine-tuning involves curating a high-quality dataset that aligns closely with the model’s intended function, providing explicit examples of how the model should perform certain tasks or interact with specific tools. This method is particularly effective for teaching the model to recognize the nuances of tool-specific language, commands, and constraints.

Direct Preference Optimization refines these interactions by incorporating human feedback or predefined objectives directly into the training loop. DPO aligns the model’s output more closely with target outcomes by emphasizing a preference for certain types of responses or behaviors over others. The training data in DPO contains a “like this, not like that” preference, which optimizes the same goals as reinforcement learning without reward functions or reward models. This approach reduces resource requirements and training time while maintaining quality.

Source: [arXiv:2305.18290](<https://arxiv.org/abs/2305.18290>) **[cs.LG]**

For example, the HuggingFace TRL library for DPO takes training samples in the following format:
    
    
    {
        "prompt": ["<array of input samples>"],
        "chosen": "<complete preferred response (j)>",  # rated better than k
        "rejected": "<complete non-preferred response (k)>",  # rated worse than j
    }

This feedback-driven approach allows for iterative improvement of the model’s tool-interaction capabilities based on real-world usage patterns in the training data.

Together, SFT and DPO form a robust framework for fine-tuning language models to interface with a wide range of digital tools. By using these techniques, you can build AI systems that understand and generate human-like text and that perform complex tasks by autonomously interacting with external applications, broadening the scope and utility of AI in both consumer and enterprise environments.

To understand the costs associated with Amazon SageMaker Studio notebooks and Amazon SageMaker AI training jobs, refer to the [SageMaker AI pricing page](<https://aws.amazon.com/sagemaker/ai/pricing/>).

## Solution overview

In this section, we walk through how to fine-tune Qwen3 1.7B on [Amazon SageMaker AI training jobs](<https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html>), a fully managed service that supports distributed multi-GPU and multi-node configurations. With SageMaker AI training jobs, you can spin up high-performance clusters on demand, train billion-parameter models faster, and automatically shut down resources when the job finishes. Metrics from infrastructure and from inside the training loop are sent to [MLflow on SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow.html>) for later analysis.

## Prerequisites

To fine-tune function-calling models on SageMaker AI, you need the following prerequisites:

  * An AWS account that contains your AWS resources.
  * An [AWS Identity and Access Management](<https://aws.amazon.com/iam/>) (IAM) role to access SageMaker AI. To learn more about how IAM works with SageMaker AI, see [AWS Identity and Access Management for Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/security-iam.html>).
  * A development environment configured to access your AWS account. You can run the notebook from your preferred environment, including integrated development environments (IDEs) such as PyCharm or Visual Studio Code. To set up your local environment, refer to [Configuring settings for the AWS Command Line Interface (AWS CLI)](<https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html>). We recommend [Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker/studio/>) for a streamlined experience on SageMaker AI.
  * To track your experiments in SageMaker AI with MLflow, follow the [instructions in the SageMaker AI documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow-app-setup.html>).
  * Access to the SageMaker AI compute instances used in this post. We use SageMaker AI training jobs and a single `ml.p4d.24xlarge` instance for training. To check your quota, review the [AWS service quotas](<https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html>) in the [AWS Management Console](<http://aws.amazon.com/console>). 
    * View the [SageMaker AI ml.p4d.24xlarge for training job usage quota](<https://console.aws.amazon.com/servicequotas/home/services/sagemaker/quotas/L-09B4A649>) in the Service Quotas console.
    * If the **Applied account-level quota value** is 0, request an increase at the account level of 1.
  * Access to the [GitHub repository](<https://github.com/aws-samples/amazon-sagemaker-generativeai/tree/main/6_use_cases/usecases/function-calling-sft-dpo>) for this post.



### Set up your environment

In the following sections, we run the code from a [SageMaker Studio JupyterLab notebook instance](<https://aws.amazon.com/blogs/machine-learning/boost-productivity-on-amazon-sagemaker-studio-introducing-jupyterlab-spaces-and-generative-ai-tools/>). You can also use your preferred IDE, such as VS Code or PyCharm. Make sure your local environment is configured to work with AWS, as listed in the prerequisites.

Complete the following steps to set up your environment:

  1. On the SageMaker AI console, choose **Domains** in the navigation pane, then open your domain.
  2. In the navigation pane under **Applications and IDEs** , choose **Studio**.
  3. On the **User profiles** tab, locate your user profile, then choose **Launch** and **Studio**.
  4. In SageMaker Studio, launch an `ml.t3.medium` JupyterLab notebook instance with at least 50 GB of storage. A large notebook instance isn’t required because the fine-tuning job runs on a separate ephemeral training job instance with NVIDIA accelerators.
  5. To begin fine-tuning, clone the [GitHub repository](<https://github.com/aws-samples/amazon-sagemaker-generativeai/tree/main/6_use_cases/usecases/function-calling-sft-dpo>): `git clone https://github.com/aws-samples/amazon-sagemaker-generativeai.git`.
  6. Navigate to the `6_use_cases/usecases/function-calling-sft-dpo` directory.
  7. Launch the [`run_training_job.ipynb`](<http://22_dpo_alignment_trl_sagemaker/run_training_job.ipynb>) notebook with a Python 3.12 or higher version kernel.



## Dataset preparation

Choosing and creating the right dataset is an important first step in fine-tuning foundation models (FMs). This example uses the [When2Call](<https://huggingface.co/datasets/nvidia/When2Call>) dataset published by NVIDIA, a benchmark designed to evaluate tool-calling decision-making for FMs. It includes when to generate a tool call, when to ask follow-up questions, when to indicate that the question can’t be answered with the tools provided, and what to do if the question seems to require tool use but a tool call can’t be made.

The evaluation code and synthetic data generation scripts used to generate the datasets are in NVIDIA’s [GitHub repository](<https://github.com/NVIDIA/When2Call>).

The datasets contain three different parts.

  1. Dataset for supervised fine-tuning (SFT), which contains 15,000 samples. 
         
         from datasets import load_dataset
         train_sft_ds = load_dataset("nvidia/When2Call", "train_sft")
         train_sft_ds
         DatasetDict({
             train: Dataset({
                 features: ['tools', 'messages'],
                 num_rows: 15000
             })

  2. Dataset for preference alignment, which uses Direct Preference Optimization (DPO) in this example. This data contains 9,000 samples. 
         
         from datasets import load_dataset
         train_pref_ds = load_dataset("nvidia/When2Call", "train_pref")
         train_pref_ds
         
         DatasetDict({
             train: Dataset({
                 features: ['tools', 'messages', 'chosen_response', 'rejected_response'],
                 num_rows: 9000
             })
         })

  3. The dataset for testing performance has two files: Multi-Choice Question evaluation (`mcq`) and LLM-as-a-judge (`llm_judge`), which is a subset of the MCQ evaluation set and can be downloaded as a single `DatasetDict`. 
         
         from datasets import load_dataset
         test_ds = load_dataset("nvidia/When2Call", "test")
         test_ds
         
         DatasetDict({
             llm_judge: Dataset({
                 features: ['uuid', 'source', 'source_id', 'question', 'correct_answer', 'answers', 'target_tool', 'tools', 'orig_tools', 'orig_question', 'held_out_param'],
                 num_rows: 300
             })
             mcq: Dataset({
                 features: ['uuid', 'source', 'source_id', 'question', 'correct_answer', 'answers', 'target_tool', 'tools', 'orig_tools', 'orig_question', 'held_out_param'],
                 num_rows: 3652
             })
         })




For this use case, we need to do a bit of preprocessing on the dataset to match the expected formats for TRL’s [`SFTTrainer`](<https://huggingface.co/docs/trl/main/en/sft_trainer#trl.SFTTrainer>) and [`DPOTrainer`](<https://huggingface.co/docs/trl/main/en/dpo_trainer>). To do that, we need to build a system prompt that contains the list of available tools and add the system prompt to the `messages` lists from the original dataset.
    
    
    def generate_and_tokenize_prompt(data_point):
        """
        Generates a tool using prompt based on patient information.
    
        Args:
            data_point (dict): Dictionary containing target and meaning_representation keys
    
        Returns:
            dict: Dictionary containing the formatted prompt
        """
        full_prompt = f"""
        You are a helpful assistant with access to the following tools or function calls. Your task is to produce a sequence of tools or function calls necessary to generate response to the user utterance. Use the following tools or function calls as required:
        {data_point["tools"]}
        """
        return {"system_prompt": full_prompt.strip()}
    
    dstrain_sft = dstrain_sft.map(
        generate_and_tokenize_prompt,
        batched=False
    
    convos=[]
    for mess, sys in zip(dstrain_sft['train']['messages'], dstrain_sft['train']['system_prompt']):
        message = {
            "content": f"{sys}",
            "role": "system"
        }
        convos.append([message, mess[0], mess[1]])
    dstrain_sft = dstrain_sft.rename_column("messages", "messages_1")
    dstrain_sft['train'] = dstrain_sft['train'].add_column("messages", convos)

In addition to what we did for SFT, we need to prepare the data for DPO. The `DPOTrainer` from TRL accepts a specific format that includes columns labeled as `chosen` and `rejected` in addition to `messages`, so we need to create the `messages` column and rename `chosen_response` and `rejected_response`.
    
    
    ds_train_pref = ds_train_pref.map(
        generate_and_tokenize_prompt,
        batched=False
    
    ds_train_pref = ds_train_pref.rename_column("chosen_response", "chosen")
    ds_train_pref = ds_train_pref.rename_column("rejected_response", "rejected")

Now, save the SFT and DPO datasets in Amazon Simple Storage Service (Amazon S3) to make them available for training.
    
    
    # save train_dataset to s3 using our SageMaker session
    input_path = f's3://{sagemaker_session.default_bucket()}/datasets/nvidia_function_calling'
    
    # Save datasets to s3
    # We will fine tune only with 20 records due to limited compute resource for the workshop
    dstrain_sft["train"].to_json(f"{input_path}/train/dataset.json", orient="records")
    sft_dataset_s3_path = f"{input_path}/train/dataset.json"
    ds_train_pref["train"].to_json(f"{input_path}/pref/dataset.json", orient="records")
    perf_dataset_s3_path = f"{input_path}/pref/dataset.json"
    # ds_train_pref["train"].to_json(f"{input_path}/pref/dataset.json", orient="records")
    # perf_dataset_s3_path = f"{input_path}/pref/dataset.json"
    print(f"Training data uploaded to:")
    print(sft_dataset_s3_path)
    print(f"DPO data uploaded to:")
    print(perf_dataset_s3_path)
    print(f"https://s3.console.aws.amazon.com/s3/buckets/{sagemaker_session.default_bucket()}/?region={sagemaker_session.boto_region_name}&prefix={input_path.split('/', 3)[-1]}/")

## Supervised fine-tuning (SFT) on the base model

The following example demonstrates how to fine-tune the Qwen3-1.7B model. The repository contains the recipe in the `scripts` directory, where you can modify the base model and training parameters for SFT. This example uses a [Spectrum-based](<https://aws.amazon.com/blogs/machine-learning/using-spectrum-fine-tuning-to-improve-fm-training-efficiency-on-amazon-sagemaker-ai/>) fine-tuning recipe, but you can also use other PEFT techniques like LoRA or QLoRA.

The recipe contains the configuration for the model and training parameters:
    
    
    # Model arguments
    model_name_or_path: Qwen/Qwen3-1.7B
    tokenizer_name_or_path: Qwen/Qwen3-1.7B
    model_revision: main
    torch_dtype: bfloat16
    attn_implementation: flash_attention_2
    bf16: true
    tf32: true
    output_dir: /opt/ml/model/Qwen3-1.7B-function-calling
    
    # Dataset arguments
    dataset_id_or_path: /opt/ml/input/data/dataset/dataset.json
    max_seq_length: 2048
    packing: true
    
    # Spectrum arguments
    spectrum_config_path: /opt/ml/input/data/code/spectrum-layer/snr_results_Qwen-Qwen3-1.7B_unfrozenparameters_50percent.yaml
    
    # Training arguments
    num_train_epochs: 10
    per_device_train_batch_size: 4
    gradient_accumulation_steps: 2
    gradient_checkpointing: true
    gradient_checkpointing_kwargs:
      use_reentrant: true
    learning_rate: 5.0e-5
    lr_scheduler_type: cosine
    warmup_ratio: 0.1
    
    # Logging arguments
    logging_strategy: steps
    logging_steps: 5
    report_to:
    - wandb
    save_strategy: "no" # "epoch"
    seed: 42
    
    # Hugging Face Hub
    push_to_hub: false
    # hub_model_id: # if not defined same as output_dir
    hub_strategy: every_save

### Create a training job with SageMaker AI ModelTrainer

Next, we use a SageMaker AI training job to spin up a training cluster and run the model fine-tuning. The [SageMaker AI Python SDK `ModelTrainer` APIs](<https://sagemaker.readthedocs.io/en/stable/api/training/model_trainer.html>) run training jobs on fully managed infrastructure, handling environment setup, scaling, and artifact management. By using `ModelTrainer`, you can specify training scripts, input data, and compute resources without manually provisioning servers.

First, configure the training environment:
    
    
    from sagemaker.config import load_sagemaker_config
    configs = load_sagemaker_config()
    from sagemaker.modules.train import ModelTrainer
    from sagemaker.modules.configs import Compute, SourceCode, InputData, StoppingCondition, CheckpointConfig
    env = {}
    env["FI_PROVIDER"] = "efa"
    env["NCCL_PROTO"] = "simple"
    env["NCCL_SOCKET_IFNAME"] = "eth0"
    env["NCCL_IB_DISABLE"] = "1"
    env["NCCL_DEBUG"] = "WARN"
    env["HF_token"] = os.environ['hf_token'] #required for gated models, can be omitted for others
    env["data_location"] = sft_dataset_s3_path

To enable experiment tracking in MLflow, supply the MLflow tracking server ARN to the job.
    
    
    # MLflow tracker
    tracking_server_arn = "<YOUR MLFLOW TRACKING ARN>"
    env["MLFLOW_TRACKING_ARN"] = tracking_server_arn

The `Compute` section of the training setup determines the infrastructure requirements for training. In the `SourceCode` section, we define the local paths to code that will be imported into the training job.
    
    
    compute = Compute(
        instance_count=1,
        instance_type= "ml.p4d.24xlarge",
        volume_size_in_gb=96,
        keep_alive_period_in_seconds=3600,
    )
    
    source_code = SourceCode(
        source_dir="./scripts",
        requirements="requirements.txt",
        entry_script="run_training_sft.sh",
    )

The following is the directory structure for fine-tuning on SageMaker AI training jobs. We also provide the `requirements.txt` file in the `scripts` directory, which `ModelTrainer` automatically detects and installs the listed dependencies at runtime. For advanced scenarios such as disabling build isolation, you can provide a bash script as the entry point to run shell commands prior to starting training.
    
    
    scripts/
    ├── accelerate_configs/ # Accelerate configuration files
    ├── run_training_sft.sh # Launch script for distributed training with Accelerate on SageMaker training jobs
    ├── run_training_dpo.sh # Launch script for distributed training with Accelerate on SageMaker training jobs
    ├── run_sft.py # Main training script for supervised fine-tuning (SFT)
    ├── run_dpo.py # Main training script for Direct Preference Optimization (DPO)
    ├── recipes/ # Predefined training configuration recipes (YAML)
    └── requirements.txt # Python dependencies installed at runtime

Next, specify the Amazon Elastic Container Registry (Amazon ECR) location for the training container, where to store model checkpoints, and what to name the SageMaker AI training job. These values are supplied to the `ModelTrainer` API to configure the job.
    
    
    image_uri = f"763104351884.dkr.ecr.{sagemaker_session.boto_session.region_name}.amazonaws.com/pytorch-training:2.8.0-gpu-py312-cu129-ubuntu22.04-sagemaker"
    
    checkpoint_s3_path = f"s3://{bucket_name}/function-calling-sft-checkpoints/checkpoints"
    
    job_prefix = f"model-trainer-distributed-function-calling-sft"
    
    model_trainer = ModelTrainer(
        training_image=image_uri,
        compute=compute,
        hyperparameters=hyperparameters,
        environment=env,
        source_code=source_code,
        stopping_condition=StoppingCondition(
            max_runtime_in_seconds=90000,
        ),
        checkpoint_config=CheckpointConfig(
            s3_uri=f"{checkpoint_s3_path}/{job_prefix}",
        ),
        base_job_name=job_prefix
    
    )

Finally, configure the input data parameters for where the training data resides and start the SFT training job with `.train()`.
    
    
    training_data = InputData(
        channel_name="training_dataset",
        data_source=sft_dataset_s3_path,
    )
    
    model_trainer.train(input_data_config=[training_data], wait=True)

To fine-tune across multiple GPUs, we use [Hugging Face Accelerate](<https://huggingface.co/docs/accelerate/index>) and [DeepSpeed ZeRO-3](<https://huggingface.co/docs/accelerate/v0.10.0/en/deepspeed>), which work together to train models across multiple GPUs or nodes more efficiently. Hugging Face Accelerate streamlines distributed training launches by automatically handling device placement, process management, and mixed precision settings. DeepSpeed ZeRO-3 reduces memory usage by partitioning optimizer states, gradients, and parameters across GPUs, so billion-parameter models fit and train faster.

You can run your `SFTTrainer` script with Hugging Face Accelerate using a command like the following:
    
    
    NUM_GPUS=$(nvidia-smi --list-gpus | wc -l)
    echo "Detected ${NUM_GPUS} GPUs on the machine"
    accelerate launch \
        --config_file accelerate_configs/deepspeed_zero3.yaml \
        --num_processes ${NUM_GPUS} run_sft.py \
        --config receipes/Qwen3-0.6B-spectrum.yaml

With the SFT model artifact ready, you can now use that as a base model for DPO training. The DPO training recipe looks similar to the SFT one with a few small changes.

  * `beta` – This is a DPO-specific hyperparameter, typically bound between 0–2, that controls how aggressively the model adopts new preferences. A value closer to 0 is more aggressive and a value closer to 2 is more conservative. A typical starting point is 0.1 to 0.5, which can drive significant changes in behavior. However, this can lead to high variance or even degradation. The optimal value is highly dependent on the dataset.
  * `learning_rate` – DPO benefits from lower learning rates (for example, 5e-7) with a `warmup_ratio` to prevent overfitting. This value contrasts with the SFT `learning_rate` from the previous run of 5e-5. Although this example uses a constant `lr_scheduler_type`, cosine annealing is another common option.
  * `batch_size` – Large batch sizes tend to perform better. The batch size in this example is intentionally small to reduce resource requirements.


    
    
    # Model arguments
    model_name_or_path: /opt/ml/input/model/Qwen3-1.7B-function-calling/
    tokenizer_name_or_path: Qwen/Qwen3-1.7B
    model_revision: main
    torch_dtype: bfloat16
    attn_implementation: flash_attention_2
    bf16: true
    tf32: true
    output_dir: /opt/ml/model/sft-dpo-qwen-3-1.7b-function-calling
    
    # Dataset arguments
    dataset_id_or_path: /opt/ml/input/data/dataset/dataset.json
    
    # Training arguments
    beta: 0.1 # hyperparameter that controls how much the fine-tuned model is allowed to diverge from its original, reference model
    max_length: 1536
    max_prompt_length: 768
    loss_type: sigmoid
    num_train_epochs: 10
    per_device_train_batch_size: 2
    gradient_accumulation_steps: 8
    gradient_checkpointing: true
    gradient_checkpointing_kwargs:
      use_reentrant: true
    learning_rate: 5.0e-7
    lr_scheduler_type: constant
    warmup_ratio: 0.03
    
    # Logging arguments
    logging_strategy: steps
    logging_steps: 5
    report_to:
    - mlflow
    save_strategy: "no"
    seed: 42

Optionally, you can provide a combination of loss values to perform [Mixed Preference Optimization](<https://arxiv.org/abs/2403.19443>), which allows for the combination and weighting of multiple loss types. In this example, there is SFT training data and DPO training data that are run separately. If you only have DPO training data, you can use MPO with the `sft` loss type to use the `accepted` column in the DPO data for SFT. If possible, providing separate, unique datasets results in a larger corpus of data and better results.
    
    
    # MPO (Mixed Preference Optimization): Combines DPO (sigmoid) for preference and BCO (bco_pair) for quality
    
    loss_type : ["sigmoid", "bco_pair", "sft"], # Loss types to combine
    loss_weights : [0.8, 0.2, 1.0] # Corresponding weights, as used in the MPO paper

If `loss_weights` is omitted, all loss types will have equal weights (1.0 by default).

## Direct Preference Optimization (DPO) training on the SFT-trained model

In the DPO example, we show how you can pass configuration data into the training container as hyperparameters or as environment variables. The former is picked up in the training script with `TRLParser` and the latter with Python `os.environ` references.

The DPO training configuration is defined as follows:
    
    
    from sagemaker.config import load_sagemaker_config
    from sagemaker.modules.train import ModelTrainer
    from sagemaker.modules.configs import Compute, SourceCode, InputData, StoppingCondition, CheckpointConfig
    
    configs = load_sagemaker_config()
    
    env = {}
    env["FI_PROVIDER"] = "efa"
    env["NCCL_PROTO"] = "simple"
    env["NCCL_SOCKET_IFNAME"] = "eth0"
    env["NCCL_IB_DISABLE"] = "1"
    env["NCCL_DEBUG"] = "WARN"
    env["HF_token"] = os.environ['hf_token'] #required for gated models, can be omitted for others
    env["data_location"] = perf_dataset_s3_path
    env["model_location"] = model_data
    
    # MLflow tracker
    tracking_server_arn = "<YOUR MLFLOW TRACKING ARN>"
    env["MLFLOW_TRACKING_ARN"] = tracking_server_arn
    
    compute = Compute(
        instance_count=1,
        instance_type= "ml.p4d.24xlarge",
        volume_size_in_gb=96,
        keep_alive_period_in_seconds=3600,
    )
    
    image_uri = f"763104351884.dkr.ecr.{sagemaker_session.boto_session.region_name}.amazonaws.com/pytorch-training:2.8.0-gpu-py312-cu129-ubuntu22.04-sagemaker"
    
    checkpoint_s3_path = f"s3://{bucket_name}/function-calling-dpo-checkpoints/checkpoints"
    
    job_prefix = f"model-trainer-distributed-function-calling-dpo"
    
    hyperparameters = {
        "dataset_path": "/opt/ml/input/data/dataset",
        "model_dir": "/opt/ml/model",
    }
    
    source_code = SourceCode(
        source_dir="./scripts",
        requirements="requirements.txt",
        entry_script="run_training_dpo.sh",
    )
    
    model_trainer = ModelTrainer(
        training_image=image_uri,
        compute=compute,
        hyperparameters=hyperparameters,
        environment=env,
        source_code=source_code,
        stopping_condition=StoppingCondition(
            max_runtime_in_seconds=90000,
        ),
        checkpoint_config=CheckpointConfig(
            s3_uri=f"{checkpoint_s3_path}/{job_prefix}",
        ),
        base_job_name=job_prefix
    
    )
    
    training_data = InputData(
        channel_name="training_dataset",
        data_source=perf_dataset_s3_path,
    )

Then kick off the training job for DPO:
    
    
    model_trainer.train(input_data_config=[training_data], wait=True)

## Results

We ran the experiment for three different models, using the [NVIDIA-provided script for evaluation](<https://github.com/NVIDIA/When2Call>), with the following results. Among the base models, Qwen3-0.6B was the strongest performer out of the box despite being the smallest, beating Qwen3-1.7B by approximately 6 percent and Llama-3.2-3B-instruct by approximately 1 percent.

After a cycle of fine-tuning, the rankings change. The Qwen3-1.7B model gains approximately 19 percent in accuracy and outperforms the others by approximately 4–7 percent. The round of preference optimization was also effective, adding another approximately 10.5 percent accuracy and ending the experiment in the lead by approximately 8–9 percent over the other models.

This shows the effectiveness of a multi-step approach to model customization. Qwen3-1.7B gained 30 percent in overall accuracy and performed 9 percent better than the Llama-3.2-3B model, which has almost twice the parameter count. Achieving similar or better performance with a smaller model can reduce cost and improve throughput when it is time to host the model.

**Model** | **Tuning Technique** | **Acc-Norm**  
---|---|---  
Llama 3.2 3B Instruct | Base | 46.50%  
Llama 3.2 3B Instruct | Spectrum SFT | 53.41%  
Llama 3.2 3B Instruct | Spectrum SFT + DPO | **62.67%**  
Qwen3-0.6B | Base | 47.64%  
Qwen3-0.6B | Spectrum SFT | 56.10%  
Qwen3-0.6B | Spectrum SFT + DPO | **62.02%**  
Qwen3-1.7B | Base | 41.57%  
Qwen3-1.7B | Spectrum SFT | 60.43%  
Qwen3-1.7B | Spectrum SFT + DPO | **71.06%**  
  
## Clean up

To avoid incurring charges for resources you no longer need, complete the following clean-up steps:

  * Delete any SageMaker AI training jobs you launched. Training jobs that complete successfully don’t continue to incur charges, but you can clean up records from the SageMaker AI console or with the AWS CLI.
  * Remove the datasets you uploaded to Amazon S3: 
        
        aws s3 rm s3://<your-bucket>/datasets/nvidia_function_calling/ --recursive

  * Stop or delete the SageMaker Studio JupyterLab notebook instance to avoid idle charges.
  * Delete any model checkpoints stored in Amazon S3 that you no longer need.



## Conclusion

In this post, we showed how to improve an agent’s tool-calling accuracy by combining supervised fine-tuning (SFT) with Direct Preference Optimization (DPO) on Amazon SageMaker AI. SFT uses labeled datasets to refine model parameters, so the model develops a foundational understanding by learning from expert-annotated examples. DPO then aligns the model’s outputs with human preferences or specific performance criteria through direct feedback, without the need to define reward functions.

By integrating these two methodologies, you get a better-performing model that benefits from the structured, knowledge-driven approach of SFT and the adaptability and user-centered refinement of DPO. The result is a model that is more accurate, more relevant, and better aligned with how users want it to behave.

For more examples on fine-tuning foundation models, visit the [SageMaker AI generative AI samples GitHub repository](<https://github.com/aws-samples/amazon-sagemaker-generativeai>). For more information about training models in SageMaker AI, see the [SageMaker AI documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/train-model.html>).

* * *

## About the authors

### Amin Dashti

[Amin](<https://www.linkedin.com/in/PLACEHOLDER>) is a Senior Data Scientist and researcher at AWS who bridges deep theoretical insight with practical machine learning expertise. With a background in theoretical physics and over eight years of experience, he has designed and deployed scalable models across domains, including predictive analytics and statistical inference in financial systems and applications in computer vision (CV) and natural language processing (NLP).

### Giuseppe Zappia

[Giuseppe](<https://www.linkedin.com/in/PLACEHOLDER>) is a Principal Generative AI Specialist Solutions Architect at AWS, focused on helping large enterprises design and deploy generative AI solutions on AWS. He has over 20 years of experience as a full stack software engineer and has spent the past 7 years at AWS focused on the field of AI.
