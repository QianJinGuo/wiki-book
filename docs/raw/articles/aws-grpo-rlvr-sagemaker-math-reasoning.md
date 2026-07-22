---
title: "aws grpo rlvr sagemaker math reasoning"
source: rss
source_url: [ORIGINAL_URL]
ingested: 2026-05-08
created: 2026-05-08
updated: 2026-05-08
type: raw
tags: [rss, aws, post-training]
summary: GRPO+RLVR双奖励系统：format 0.5 + correctness 1.0 / Qwen2.5-0.5B数学推理3.7x提升 / 8-shot阈值激活规律
sha256: 982f29ad7429
---
# Overcoming reward signal challenges: Verifiable rewards-based reinforcement learning with GRPO on SageMaker AI
Training large language models requires accurate feedback signals, but traditional reinforcement learning (RL) often struggles with reward signal reliability. The quality of these signals directly influences how models learn and make decisions. However, creating robust feedback mechanisms can be complex and error prone. Real-world training scenarios often introduce hidden biases, unintended incentives, and ambiguous success criteria that can derail the learning process, leading to models that behave unpredictably or fail to meet desired objectives.
In this post, you will learn how to implement reinforcement learning with verifiable rewards (RLVR) to introduce verification and transparency into reward signals to improve training performance. This approach works best when outputs can be objectively verified for correctness, such as in mathematical reasoning, code generation, or symbolic manipulation tasks. You will also learn how to layer techniques like Group Relative Policy Optimization (GRPO) and few-shot examples to further improve results. You’ll use the [GSM8K](<https://huggingface.co/datasets/openai/gsm8k/viewer/main/train?row=7294&views%5B%5D=main_train>) dataset (Grade School Math 8K: a collection of grade school math problems) to improve math problem solving accuracy, but the techniques used here can be adapted to a wide variety of other use cases.
## Technical overview
Before diving into implementation, it’s helpful to understand the RL concepts that underpin this approach. RL addresses challenges in model training by establishing a structured feedback system through reward signals. This paradigm enables models to learn through interaction, receiving feedback that guides them toward optimal behavior. RL provides a framework for models to iteratively improve their responses based on clearly defined signals about the quality of their outputs, making it highly effective for training models that interact with users and must adapt their behavior based on outcomes. Traditional RL has highlighted an important consideration: the quality of the reward signal matters significantly. When reward functions are imprecise or incomplete, models can engage in “reward hacking,” finding unintended ways to maximize scores without achieving the desired behavior. Recognizing this limitation has led to the development of more rigorous approaches that focus on creating reliable, well-defined reward functions.
RLVR addresses reward hacking through rule-based feedback defined by the model tuner. It uses programmatic reward functions that automatically score outputs against specific criteria, enabling rapid iteration without the bottleneck of collecting human ratings. These “verifiable” rewards come from objective, reproducible rules, making RLVR ideal for evolving requirements because it learns general optimization strategies and adapts quickly to new scenarios. GRPO is a reinforcement learning algorithm that improves AI model learning by comparing performance within groups rather than across all data at once. It organizes training data into meaningful groups and optimizes performance relative to each group’s baseline, giving appropriate attention to each category. This group-aware optimization reduces training variance, accelerates convergence, and can produce models that perform consistently across various categories. Combining RLVR with GRPO creates a framework where automated rewards guide learning while group-relative optimization helps drive balanced performance.
You define reward functions for different task aspects, and GRPO treats these as distinct groups during training, facilitating simultaneous improvement across dimensions. This combination delivers rapid adaptation and robust performance, ideal for dynamic environments requiring generalization beyond training distribution. Adding few-shot learning enhances this framework in three ways. First, few-shot examples provide templates that show the model what good outputs look like, narrowing the search space for exploration. Second, GRPO leverages these examples by generating multiple candidate responses per prompt and learning from their relative performance within each group. Third, verifiable rewards immediately confirm which approaches succeed. This combination accelerates learning: the model starts with concrete examples of the desired format, explores variations efficiently through group-based comparison, and receives definitive feedback on correctness.
## Solution overview
In this section, you will walk through how to fine-tune a Qwen2.5-0.5B model on SageMaker AI using [Amazon Amazon SageMaker Training Jobs](<https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html>). Amazon SageMaker Training jobs support distributed multi-GPU and multi-node configurations, so you can spin up high-performance clusters on demand, train billion-parameter models faster, and automatically shut down resources when the job finishes.
**Note:** While Qwen2.5-0.5B was selected for this use case, others like code generation will require a larger model (e.g. Qwen2.5-Coder-7B) and subsequently larger training instances.
## Prerequisites
To run the example from this post on Amazon SageMaker AI, you must fulfill the following prerequisites:
  * An AWS account that will contain your AWS resources.
  * An [AWS Identity and Access Management](<https://aws.amazon.com/iam/>) (IAM) role to access SageMaker AI. To learn more about how IAM works with SageMaker AI, see [AWS Identity and Access Management for Amazon SageMaker AI](<https://docs.aws.amazon.com/sagemaker/latest/dg/security-iam.html>).
  * You can run the notebook provided in this post from your preferred development environment, including interactive development environments (IDEs) such as PyCharm or Visual Studio Code, provided your AWS credentials are properly set up and configured to access your AWS account. To set up your local environment, refer to [Configuring settings for the AWS CLI](<https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html>). Optionally, you can use [Amazon SageMaker Studio](<https://aws.amazon.com/sagemaker/studio/>) for straightforward development process on SageMaker AI.
  * If you’re following along with this post, you will need a ml.p4d.24xlarge instance training. You will need access to these SageMaker training instances to run the example training code. If you’re unsure, you can review the [AWS service quotas](<https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html>) on the [AWS Management Console](<http://aws.amazon.com/console>): 
    * Choose Amazon SageMaker as the AWS service under Manage Quotas.
    * Select ml.p4d.24xlarge for training job usage and request an increase at account level.
  * Access to the GitHub repo: <https://github.com/aws-samples/amazon-sagemaker-generativeai>
### Environment set up
You can use your preferred IDE, such as VS Code or PyCharm, but make sure your local environment is configured to work with AWS, as discussed in the prerequisites.
To use [SageMaker Studio JupyterLab spaces](<https://aws.amazon.com/blogs/machine-learning/boost-productivity-on-amazon-sagemaker-studio-introducing-jupyterlab-spaces-and-generative-ai-tools/>) complete the following steps:
  1. On the Amazon SageMaker AI console, choose Domains in the navigation pane, then open your domain.
  2. In the navigation pane under **Applications and IDEs** , choose **Studio**.
  3. On the User profiles tab, locate your user profile, then choose **Launch** and **Studio**.
  4. In Amazon SageMaker Studio, launch an `ml.t3.medium` JupyterLab notebook instance with at least 50 GB of storage.
A large notebook instance isn’t required, because the fine-tuning job will run on a separate ephemeral training instance with GPU acceleration.
  5. To begin fine-tuning, start by cloning the [GitHub repo](<https://github.com/aws-samples/sagemaker-distributed-training-workshop/tree/main/22_dpo_alignment_trl_sagemaker>) and navigating to `3_distributed_training/reinforcement-learning/grpo-with-verifiable-reward` directory, then launch the [model-finetuning-grpo-rlvr.ipynb](<https://github.com/aws-samples/amazon-sagemaker-generativeai/blob/rl-vr/3_distributed_training/reinforcement-learning/grpo-with-verifiable-reward/model-finetuning-grpo-rlvr.ipynb>)
  6. Notebook with a Python 3.12 or higher version kernel
### Prepare the dataset for fine-tuning
Running GRPO with RLVR requires you to have the final answer to each question to calculate reward. First, prepare the data by extracting the final answer for each question.
    dataset = GSM8K(split='train', include_answer=False, include_reasoning=True, few_shot=True, num_shots=8, seed=None, cot=True).dataset.shuffle(seed=42)
    Dataset({
        features: ['question', 'answer', 'prompt', 'final_answer'],
        num_rows: 7473
    })
In addition, this example uses few-shot examples (8 shots) to improve model training performance. For more information on few-shot examples in reinforcement learning, refer to the paper [“Reinforcement Learning for Reasoning in Large Language Models with One Training Example”](<https://arxiv.org/pdf/2504.20571>). While the research paper focuses on single-shot examples, this post will show you both single and multi-shot performance.
Each input will contain 8 examples, followed by the problem to be solved:
    "Question: Mark has $50 and buys a toy that costs $35. How much money does he have left?
    Solution: Let's think step by step. To find out how much money Mark has left, subtract the cost of the toy from the total amount of money Mark has. So, $50 - $35 = $15.
    #### The final answer is 15
    Question: Emily has 3 times as many pencils as Alice. If Alice has 15 pencils, how many pencils does Emily have?
    Solution: Let's think step by step. To find out how many pencils Emily has, we multiply the number of pencils Alice has by 3. Alice has 15 pencils, so Emily has 15 * 3 = 45 pencils.
    #### The final answer is 45
    Question: Jack has collected 12 more marbles than Kevin. If Kevin has 27 marbles, how many marbles does Jack have?
    Solution: Let's think step by step. To find how many marbles Jack has, we add 12 to the number of marbles Kevin has. So, Jack has 27 + 12 = 39 marbles.
    #### The final answer is 39
    Question: There are 24 students in a classroom. If each group must have 4 students, how many groups can be formed?
    Solution: Let's think step by step. To find how many groups can be formed, we divide the number of students by the number of students per group. So, 24 / 4 = 6 groups can be formed.
    #### The final answer is 6
    Question: Samantha baked 40 cookies and wants to divide them equally into bags, with each bag containing 5 cookies. How many bags will Samantha need?
    Solution: Let's think step by step. To find the number of bags needed, divide the total number of cookies by the number of cookies per bag. Thus, 40 divided by 5 equals 8.
    #### The final answer is 8
    Question: A pack of pencils costs $4. If you buy 7 packs, how much will you spend in total?
    Solution: Let's think step by step. The total cost is found by multiplying the cost per pack by the number of packs. Hence, you spend 7 * $4 = $28.
    #### The final answer is 28
    Question: A book has 240 pages, and Sarah reads 20 pages each day. How many days will it take her to finish the book?
    Solution: Let's think step by step. Sarah reads 20 pages per day, so we divide the total pages by the number of pages she reads per day. Therefore, it takes her 240 / 20 = 12 days to finish the book.
    #### The final answer is 12
    Question: A farmer has a total of 80 apples and oranges. If he has 30 apples, how many oranges does he have?
    Solution: Let's think step by step. To determine the number of oranges, we subtract the number of apples from the total number of fruits. So, the number of oranges is 80 - 30 = 50.\n
    #### The final answer is 50
    Question: Mimi picked up 2 dozen seashells on the beach.  Kyle found twice as many shells as Mimi and put them in his pocket. Leigh grabbed one-third of the shells that Kyle found.  How many seashells did Leigh have?
    Solution: Let's think step by step. 
After the data has been prepared, keep 10 percent of the data as a validation set and push both training and validation set to S3.
## The Verifiable Reward Function
This GRPO implementation for mathematical reasoning employs a dual-reward system that provides objective, verifiable feedback during training. This approach leverages the inherent verifiability of mathematical problems to create reliable training signals without requiring human annotation or subjective evaluation.You will implement two complementary reward functions that work together to guide the model toward both correct response formatting and mathematical accuracy of the result:
#### Format Reward Function
This function helps verify the model learns to structure its responses correctly by:
  * **Pattern Matching** : Searches for the specific format `#### The final answer is [number]`
  * **Consistent Scoring** : Awards 0.5 points for proper formatting, 0.0 for incorrect format
  * **Training Signal** : Encourages the model to follow the expected answer structure
    #Format reward function
    def format_reward_func_qa(completions, **kwargs):
        pattern = r"\n#### The final answer is \d+"    
        completion_contents = [completion for completion in completions]    
        matches = [re.search(pattern, content) for content in completion_contents]
        return [0.5 if match else 0.0 for match in matches]
#### Correctness Reward Function
This function provides the core mathematical verification by:
  * **Answer Extraction** : Uses regex to extract numerical answers from formatted responses
  * **Normalization** : Removes common formatting characters (commas, currency symbols, units)
  * **Precision Comparison** : Uses a tolerance of 1e-3 to handle floating-point precision
  * **Binary Scoring** : Awards 1.0 for correct answers, 0.0 for incorrect ones
    #Correctness reward function
    def correctness_reward_func_qa(completions, final_answer, **kwargs):
        rewards = []
        for completion, ground_truth in zip(completions, final_answer):
            try:
                match = re.search(r'####.*?([\d,]+(?:\.\d+)?)', completion)
                if match:
                    answer = match.group(1)
                    for remove_char in [',', '$', '%', 'g']:
                        answer = answer.replace(remove_char, '')
                    if abs(float(answer)-float(ground_truth)) < 1e-3:
                        rewards.append(1.0)
                    else:
                        rewards.append(0.0)
                else:
                    rewards.append(0.0)
            except ValueError:
                rewards.append(0.0)
        return rewards
#### Integrating RLVR with GRPO
The reward functions are integrated into the GRPO training pipeline through the GRPOTrainer:
    rewards_funcs = [format_reward_func_qa, correctness_reward_func_qa]
    trainer = GRPOTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        processing_class=tokenizer,
        peft_config=peft_config,
        reward_funcs=rewards_funcs,
    )
During training, GRPO uses these reward functions to compute policy gradients. First the model generates multiple completions for each mathematical problem. Next, the reward for each response is computed for both reward functions. The format reward function will grant up to 0.5 for proper response structure, and the correctness reward function will grant up to 1.0 for the mathematical accuracy of the answer for a maximum combined reward of 1.5 per completion. Then GRPO compares the completions within groups to identify the best responses. Finally, in the policy update step, the loss function uses reward differences to update model parameters. Higher-rewarded completions increase their probability, while lower-rewarded completions decrease their probability. This relative ranking drives the optimization process.The following example demonstrates how to fine-tune Qwen2.5-0.5B. The recipe is provided in the scripts folder, allowing you to customize it or change the base model. Here you will use GRPO with verifiable rewards using Quantized Low-Rank Adaptation (QLoRA). QLoRA is used here as a technique to reduce training resource requirements and speed up the training process, with a small trade off in accuracy.
    # Model arguments
    model_name_or_path: Qwen/Qwen2.5-0.5B
    tokenizer_name_or_path: Qwen/Qwen2.5-0.5B
    model_revision: main
    torch_dtype: bfloat16
    attn_implementation: flash_attention_2
    bf16: true
    tf32: true
    output_dir: /opt/ml/model/Qwen2.5-0.5B-RL-VR-GRPO
    # Dataset arguments
    train_dataset_id_or_path: /opt/ml/input/data/train/dataset.json
    test_dataset_id_or_path: /opt/ml/input/data/val/dataset.json
    dataset_splits: 'train'
    max_seq_length: 2048
    packing: true
    # LoRA arguments
    use_peft: true
    load_in_4bit: true
    lora_target_modules: ["q_proj", "k_proj", "v_proj", "o_proj", "up_proj", "down_proj", "gate_proj"]
    lora_modules_to_save: ["lm_head", "embed_tokens"] 
    lora_r: 16
    lora_alpha: 16
    # Training arguments
    num_train_epochs: 2
    per_device_train_batch_size: 16
    gradient_accumulation_steps: 2
    gradient_checkpointing: true
    gradient_checkpointing_kwargs:
      use_reentrant: True
    learning_rate: 1.84e-4
    lr_scheduler_type: cosine
    warmup_ratio: 0.1
    # Logging arguments
    logging_strategy: steps
    logging_steps: 5
    report_to:
    - mlflow
    save_strategy: "no"
    seed: 42
### Recipe overview
This recipe implements Group Relative Policy Optimization (GRPO) with verifiable rewards for fine-tuning the Qwen2.5-0.5B model on mathematical reasoning tasks. The recipe uses a dual-reward system that objectively evaluates both answer formatting and mathematical correctness without requiring human annotation.
Important Hyperparameters:
  * `learning_rate`: 1.84e-4 – Learning rate optimized for GRPO training
  * `num_train_epochs`: 2 – Training epochs to avoid overfitting
  * `per_device_train_batch_size`: 16 with gradient_accumulation_steps: 2 – Effective batch size of 32
  * `max_seq_length`: 2048 – Context window for 8-shot prompting
  * `lora_r`: 16 and `lora_alpha`: 16 – LoRA rank and scaling parameters
  * `warmup_ratio`: 0.1 with cosine scheduler – Learning rate scheduling
  * `lora_target_modules` – Targets attention and MLP layers for adaptation
As a next step, you will use a SageMaker AI training job to spin up a training cluster and run the model fine-tuning. The [SageMaker AI Model Trainer](<https://sagemaker.readthedocs.io/en/stable/training/index.html>). ModelTrainer runs training jobs on fully managed infrastructure; handling environment setup, scaling, and artifact management. It also allows you to specify training scripts, input data, and compute resources without manually provisioning servers. Library dependencies can be managed through the `requirements.txt` file in `scripts` folder. ModelTrainer will automatically detect this file and install the listed dependencies at runtime.
First, set up your environment. Here you’ll specify the instance type and number of instances for training and the location of the training container.
    from sagemaker.core import image_uris
    from sagemaker.core.helper.session_helper import Session
    sagemaker_session = Session()
    bucket_name = sagemaker_session.default_bucket()
    default_prefix = sagemaker_session.default_bucket_prefix
    configs = load_sagemaker_config()
    instance_type = "ml.g6.48xlarge"
    instance_count = 1
    config_filename = "Qwen2.5-0.5B.yaml" 
    image_uri = image_uris.retrieve(
        framework="pytorch",
        region=sagemaker_session.boto_session.region_name,
        version="2.7.1",
        instance_type=instance_type,
        image_scope="training"
    )
Next, configure the environment variables, code locations, and data paths:
    from sagemaker.train.configs import (
        CheckpointConfig,
        Compute,
        OutputDataConfig,
        SourceCode,
        StoppingCondition,
    )
    from sagemaker.train.distributed import Torchrun
    from sagemaker.train.model_trainer import ModelTrainer
    env = {}
    env["FI_PROVIDER"] = "efa"
    env["NCCL_PROTO"] = "simple"
    env["NCCL_SOCKET_IFNAME"] = "eth0"
    env["NCCL_IB_DISABLE"] = "1"
    env["NCCL_DEBUG"] = "WARN"
    env["HF_token"] = os.environ['hf_token']
    env["CONFIG_PATH"] = f"recipes/{config_filename}"
    env["MLFLOW_EXPERIMENT_NAME"]= "grpo-rlvr"
    env["MLFLOW_TAGS"] =  '{"source.job": "sm-training-jobs", "source.type": "grpo-rlvr", "source.framework": "pytorch"}'
    env["MLFLOW_TRACKING_URI"] =  MLFLOW_TRACKING_SERVER_ARN
    # Define the script to be run
    source_code = SourceCode(
        source_dir="./scripts",
        requirements="requirements.txt",
        entry_script="run_finetuning.sh",
    )
    # Define the compute
    compute_configs = Compute(
        instance_type=instance_type,
        instance_count=instance_count,
        keep_alive_period_in_seconds=3600,
    )
    # define Training Job Name
    job_name = f"train-{config_filename.split('/')[-1].replace('.', '-').replace('yaml', 'rlvr')}"
    # define OutputDataConfig path
    output_path = f"s3://{bucket_name}/{job_name}"
    # Define the ModelTrainer
    model_trainer = ModelTrainer(
        training_image=image_uri,
        environment=env,
        source_code=source_code,
        base_job_name=job_name,
        compute=compute_configs,
    	stopping_condition=StoppingCondition(max_runtime_in_seconds=18000),
        output_data_config=OutputDataConfig(s3_output_path=output_path),
        checkpoint_config=CheckpointConfig(
            s3_uri=output_path + "/checkpoint", local_path="/opt/ml/checkpoints"
        ),
    )
Set up the channels for training and validation data:
    from sagemaker.train.configs import InputData
    # Pass the input data
    train_input = InputData(
        channel_name="train",
        data_source=train_dataset_s3_path, # S3 path where training data is stored
    )
    val_input = InputData(
        channel_name="val",
        data_source=val_dataset_s3_path, # S3 path where training data is stored
    )
    # Check input channels configured
    data = [train_input, val_input]
Then begin training:`model_trainer.train(input_data_config=data)`The following is the directory structure for source code of this example:
    scripts/
    ├── accelerate_configs/                       # Accelerate configuration files
    ├── run_finetuning.sh      # Launch script for distributed training with Accelerate on SageMaker training jobs
    ├── run_grpo.py               # Main training script for GRPO
    ├── utils/                   # utilities to load data and create prompt
    ├── recipes/                           # Predefined training configuration recipes (YAML)
    └── requirements.txt                   # Python dependencies installed at runtime
To fine-tune across multiple GPUs, the example training script uses Huggingface Accelerate and DeepSpeed ZeRO-3, which work together to train large models more efficiently. Huggingface Accelerate simplifies launching distributed training by automatically handling device placement, process management, and mixed precision settings. DeepSpeed ZeRO-3 reduces memory usage by partitioning optimizer states, gradients, and parameters across GPUs—allowing billion-parameter models to fit and train faster.You can run your GRPO trainer script with Huggingface Accelerate using a simple command like the following:
    NUM_GPUS=$(nvidia-smi --list-gpus | wc -l)
    echo "Detected ${NUM_GPUS} GPUs on the machine"
    # Launch fine-tuning with Accelerate + DeepSpeed (Zero3)
    accelerate launch \
      --config_file accelerate_configs/deepspeed_zero3.yaml \
      --num_processes ${NUM_GPUS} \
      run_grpo.py \
      --config $CONFIG_PATH
## Results
After evaluating the models on 100 test samples, the 8-shot GRPO-trained model achieved 41% accuracy compared to the base model’s 11%, demonstrating a 3.7x improvement in chain-of-thought mathematical reasoning.
The following chart shows a distinct threshold related to context length, revealing an optimal range of samples for reasoning activation. While 0-shot (6%) and 2-shot (3%) configurations performed poorly – even worse than the base model – performance dramatically improved at 4-shot prompting (33%), then peaked at 8-shot context (41%). This non-linear scaling pattern suggests that GRPO training creates reasoning patterns that require a certain number of examples to activate effectively. The model appears to have learned to leverage group comparisons from multiple examples, consistent with GRPO’s group-based policy optimization approach where the model learns to compare and select optimal reasoning paths from multiple generated solutions.
## Extending RLVR to other domains
While this post focused on mathematical reasoning with GSM8K, the RLVR approach generalizes to domains with objectively verifiable outputs. Two promising directions demonstrate this versatility:
### Code generation with execution-based rewards
Code generation provides natural verification through execution. Partial rewards can be awarded when code compiles and runs without errors, while full rewards are achieved when outputs pass comprehensive unit tests. Domain experts specify requirements using natural language prompts, while the reward model automatically evaluates correctness through code execution—alleviating subjective human evaluation.
### Domain-specific text generation with semantic validation
For specialized domains like medical or technical writing, keyword-based rewards can guide models toward appropriate terminology. Partial rewards encourage inclusion of required terms, while full rewards require complete keyword sets in semantically appropriate contexts. For instance, medical text generation can reward outputs that combine diagnostic keywords (“symptoms,” “diagnosis”) with treatment keywords (“therapy,” “medication”) in clinically valid patterns, teaching domain vocabulary through measurable targets. These examples illustrate how verifiable rewards extend beyond mathematical reasoning to tasks where correctness can be programmatically validated, setting up the foundation for broader applications of this training approach.
## Cleaning Up
To clean up your resources to avoid incurring more charges, follow these steps:
  1. [Delete any unused SageMaker Studio resources](<https://docs.aws.amazon.com/sagemaker/latest/dg/studio-updated-jl-admin-guide-clean-up.html>).
  2. Optionally, [delete the SageMaker Studio domain](<https://docs.aws.amazon.com/sagemaker/latest/dg/gs-studio-delete-domain.html>).
  3. [Delete any S3 buckets created](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/delete-bucket.html>)
  4. Verify that your training job isn’t running anymore! To do so, on your SageMaker console, choose Training and check Training jobs.
To learn more about cleaning up your resources provisioned, check out [Clean up](<https://docs.aws.amazon.com/sagemaker/latest/dg/automatic-model-tuning-ex-cleanup.html>).
## Conclusion
In this example you trained a Qwen2.5-0.5B model using GRPO (Group Relative Policy Optimization) on GSM8K: a dataset of 8,500 grade school math word problems that require multi-step arithmetic reasoning and natural language understanding. Each problem includes a question like “ _Janet’s ducks lay 16 eggs per day…_ ” with step-by-step solutions ending in numerical answers, making it ideal for verifiable reward training.
This implementation demonstrates the effectiveness of Reinforcement Learning with Verifiable Rewards (RLVR) for mathematical reasoning tasks. The GRPO-trained Qwen2.5-0.5B model achieved a 3.7x improvement over the base model, reaching 41% accuracy on GSM8K compared to the baseline 11%.The evaluation results validate RLVR as a promising approach for domains with objectively verifiable outcomes, offering an alternative to preference-based training methods. The threshold behavior suggests GRPO learns to leverage group comparisons from multiple examples, consistent with its group-based optimization approach. This work establishes a foundation for applying verifiable reward systems to other domains requiring logical rigor and mathematical accuracy.
For more information on Amazon SageMaker AI fully managed training, refer to [the training section of the SageMaker AI documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/train-model.html>). The supporting code for this post can be found in **[GitHub.](<https://github.com/aws-samples/amazon-sagemaker-generativeai/tree/rl-vr/3_distributed_training/reinforcement-learning/grpo-with-verifiable-reward>)  
**
* * *
## About the authors
**Surya Kari** is a Senior Generative AI Data Scientist at AWS, specializing in developing solutions leveraging state-of-the-art foundation models. He has extensive experience working with advanced language models including DeepSeek-R1, the Llama family, and Qwen, focusing on their fine-tuning and optimization for specific scientific applications. His expertise extends to implementing efficient training pipelines and deployment strategies using AWS SageMaker, enabling the scaling of foundation models from development to production. He collaborates with customers to design and implement generative AI solutions, helping them navigate model selection, fine-tuning approaches, and deployment strategies to achieve optimal performance for their specific use cases.
**Giuseppe Zappia** is a Principal AI/ML Specialist Solutions Architect at AWS, focused on helping large enterprises design and deploy ML solutions on AWS. He has over 20 years of experience as a full stack software engineer, and has spent the past 6 years at AWS focused on the field of machine learning.
**Amin Dashti** is a Senior Data Scientist and researcher at AWS who bridges deep theoretical insight with practical machine learning expertise. With a background in theoretical physics and over seven years of experience, he has designed and deployed scalable models across domains — from predictive analytics and statistical inference in financial systems to cutting-edge applications in computer vision (CV) and natural language processing (NLP).