---
tags: [wechat, article, claude, openai]
title: "Overcoming reward signal challenges: Verifiable rewards-based reinforcement learning with GRPO on SageMaker AI"
url: https://aws.amazon.com/blogs/machine-learning/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learning-with-grpo-on-sagemaker-ai/
source: rss
feed_name: AWS China ML
sha256: 2a65480be49de2b4e571f89cc5b904038fc5e76edc0c8f80073ab89d9b2ffb09
---
<p>Training large language models requires accurate feedback signals, but traditional reinforcement learning (RL) often struggles with reward signal reliability. The quality of these signals directly influences how models learn and make decisions. However, creating robust feedback mechanisms can be complex and error prone. Real-world training scenarios often introduce hidden biases, unintended incentives, and ambiguous success criteria that can derail the learning process, leading to models that behave unpredictably or fail to meet desired objectives.</p> 
<p>In this post, you will learn how to implement reinforcement learning with verifiable rewards (RLVR) to introduce verification and transparency into reward signals to improve training performance. This approach works best when outputs can be objectively verified for correctness, such as in mathematical reasoning, code generation, or symbolic manipulation tasks. You will also learn how to layer techniques like Group Relative Policy Optimization (GRPO) and few-shot examples to further improve results. You’ll use the <a href="https://huggingface.co/datasets/openai/gsm8k/viewer/main/train?row=7294&amp;views%5B%5D=main_train" target="_blank" rel="noopener noreferrer">GSM8K</a> dataset (Grade School Math 8K: a collection of grade school math problems) to improve math problem solving accuracy, but the techniques used here can be adapted to a wide variety of other use cases.</p> 
<h2>Technical overview</h2> 
<p>Before diving into implementation, it’s helpful to understand the RL concepts that underpin this approach. RL addresses challenges in model training by establishing a structured feedback system through reward signals. This paradigm enables models to learn through interaction, receiving feedback that guides them toward optimal behavior. RL provides a framework for models to iteratively improve their responses based on clearly defined signals about the quality of their outputs, making it highly effective for training models that interact with users and must adapt their behavior based on outcomes. Traditional RL has highlighted an important consideration: the quality of the reward signal matters significantly. When reward functions are imprecise or incomplete, models can engage in “reward hacking,” finding unintended ways to maximize scores without achieving the desired behavior. Recognizing this limitation has led to the development of more rigorous approaches that focus on creating reliable, well-defined reward functions.</p> 
<p>RLVR addresses reward hacking through rule-based feedback defined by the model tuner. It uses programmatic reward functions that automatically score outputs against specific criteria, enabling rapid iteration without the bottleneck of collecting human ratings. These “verifiable” rewards come from objective, reproducible rules, making RLVR ideal for evolving requirements because it learns general optimization strategies and adapts quickly to new scenarios. GRPO is a reinforcement learning algorithm that improves AI model learning by comparing performance within groups rather than across all data at once. It organizes training data into meaningful groups and optimizes performance relative to each group’s baseline, giving appropriate attention to each category. This group-aware optimization reduces training variance, accelerates convergence, and can produce models that perform consistently across various categories. Combining RLVR with GRPO creates a framework where automated rewards guide learning while group-relative optimization helps drive balanced performance.</p> 
<p>You define reward functions for different task aspects, and GRPO treats these as distinct groups during training, facilitating simultaneous improvement across dimensions. This combination delivers rapid adaptation and robust performance, ideal for dynamic environments requiring generalization beyond training distribution. Adding few-shot learning enhances this framework in three ways. First, few-shot examples provide templates that show the model what good outputs look like, narrowing the search space for exploration. Second, GRPO leverages these examples by generating multiple candidate responses per prompt and learning from their relative performance within each group. Third, verifiable rewards immediately confirm which approaches succeed. This combination accelerates learning: the model starts with concrete examples of the desired format, explores variations efficiently through group-based comparison, and receives definitive feedback on correctness.</p> 
<h2>Solution overview</h2> 
<p>In this section, you will walk through how to fine-tune a Qwen2.5-0.5B model on SageMaker AI using <a href="https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html" target="_blank" rel="noopener noreferrer">Amazon Amazon SageMaker Training Jobs</a>. Amazon SageMaker Training jobs support distributed multi-GPU and multi-node configurations, so you can spin up high-performance clusters on demand, train billion-parameter models faster, and automatically shut down resources when the job finishes.</p> 
<p><strong>Note:</strong> While Qwen2.5-0.5B was selected for this use case, others like code generation will require a larger model (e.g. Qwen2.5-Coder-7B) and subsequently larger training instances.</p> 
<p><img loading="lazy" class="alignnone wp-image-130107 size-full" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/30/image-1-12.png" alt="" width="1466" height="1062"></p> 
<h2>Prerequisites</h2> 
<p>To run the example from this post on Amazon SageMaker AI, you must fulfill the following prerequisites:</p> 
<ul> 
 <li>An AWS account that will contain your AWS resources.</li> 
 <li>An <a href="https://aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer">AWS Identity and Access Management</a> (IAM) role to access SageMaker AI. To learn more about how IAM works with SageMaker AI, see <a href="https://docs.aws.amazon.com/sagemaker/latest/dg/security-iam.html" target="_blank" rel="noopener noreferrer">AWS Identity and Access Management for Amazon SageMaker AI</a>.</li> 
 <li>You can run the notebook provided in this post from your preferred development environment, including interactive development environments (IDEs) such as PyCharm or Visual Studio Code, provided your AWS credentials are properly set up and configured to access your AWS account. To set up your local environment, refer to <a href="https://docs.aws.amazon.com/cli/v1/userguide/cli-chap-configure.html" target="_blank" rel="noopener noreferrer">Configuring settings for the AWS CLI</a>. Optionally, you can use <a href="https://aws.amazon.com/sagemaker/studio/" target="_blank" rel="noopener noreferrer">Amazon SageMaker Studio</a> for straightforward development process on SageMaker AI.</li> 
 <li>If you’re following along with this post, you will need a ml.p4d.24xlarge instance training. You will need access to these SageMaker training instances to run the example training code. If you’re unsure, you can review the <a href="https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html" target="_blank" rel="noopener noreferrer">AWS service quotas</a> on the <a href="http://aws.amazon.com/console" target="_blank" rel="noopener noreferrer">AWS Management Console</a>: 
 <ul> 
 <li>Choose Amazon SageMaker as the AWS service under Manage Quotas.</li> 
 <li>Select ml.p4d.24xlarge for training job usage and request an increase at account level.</li> 
 </ul> </li> 
 <li>Access to the GitHub repo: <a href="https://github.com/aws-samples/amazon-sagemaker-generativeai" target="_blank" rel="noopener noreferrer">https://github.com/aws-samples/amazon-sagemaker-generativeai</a></li> 
</ul> 
<h3>Environment set up</h3> 
<p>You can use your preferred IDE, such as VS Code or PyCharm, but make sure your local environment is configured to work with AWS, as discussed in the prerequisites.</p> 
<p>To use <a href="https://aws.amazon.com/blogs/machine-learning/boost-productivity-on-amazon-sagemaker-studio-introducing-jupyterlab-spaces-and-generative-ai-tools/" target="_blank" rel="noopener noreferrer">SageMaker Studio JupyterLab spaces</a> complete the following steps:</p> 
<ol> 
 <li>On the Amazon SageMaker AI console, choose Domains in the navigation pane, then open your domain.</li> 
 <li>In the navigation pane under <strong>Applications and IDEs</strong>, choose <strong>Studio</strong>.</li> 
 <li>On the User profiles tab, locate your user profile, then choose <strong>Launch</strong> and <strong>Studio</strong>.</li> 
 <li>In Amazon SageMaker Studio, launch an <code>ml.t3.medium</code> JupyterLab notebook instance with at least 50 GB of storage.</li> 
</ol> 
<p>A large notebook instance isn’t required, because the fine-tuning job will run on a separate ephemeral training instance with GPU acceleration.</p> 
<ol start="5"> 
 <li>To begin fine-tuning, start by cloning the <a href="https://github.com/aws-samples/sagemaker-distributed-training-workshop/tree/main/22_dpo_alignment_trl_sagemaker" target="_blank" rel="noopener noreferrer">GitHub repo</a> and navigating to&nbsp;<code>3_distributed_training/reinforcement-learning/grpo-with-verifiable-reward</code>&nbsp;directory, then launch the <a href="https://github.com/aws-samples/amazon-sagemaker-generativeai/blob/rl-vr/3_distributed_training/reinforcement-learning/grpo-with-verifiable-reward/model-finetuning-grpo-rlvr.ipynb" target="_blank" rel="noopener noreferrer">model-finetuning-grpo-rlvr.ipynb</a></li> 
 <li>Notebook with a Python 3.12 or higher version kernel</li> 
</ol> 
<h3>Prepare the dataset for fine-tuning</h3> 
<p>Running GRPO with RLVR requires you to have the final answer to each question to calculate reward. First, prepare the data by extracting the final answer for each question.</p> 
<div class="hide-language"> 
 <pre><code class="lang-css">dataset = GSM8K(split='train', include_answer=False, include_reasoning=True, few_shot=True, num_shots=8, seed=None, cot=True).dataset.shuffle(seed=42)
Dataset({
&nbsp;&nbsp; &nbsp;features: ['question', 'answer', 'prompt', 'final_answer'],
&nbsp;&nbsp; &nbsp;num_rows: 7473
})</code></pre> 
</div> 
<p>In addition, this example uses few-shot examples (8 shots) to improve model training performance. For more information on few-shot examples in reinforcement learning, refer to the paper <a href="https://arxiv.org/pdf/2504.20571" target="_blank" rel="noopener noreferrer">“Reinforcement Learning for Reasoning in Large Language Models with One Training Example”</a>. While the research paper focuses on single-shot examples, this post will show you both single and multi-shot performance.</p> 
<p>Each input will contain 8 examples, followed by the problem to be solved:</p> 
<div class="hide-language"> 
 <pre><code class="lang-python">"Question: Mark has $50 and buys a toy that costs $35. How much money does he have left?
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
Question: Mimi picked up 2 dozen seashells on the beach. &nbsp;Kyle found twice as many shells as Mimi and put them in his pocket. Leigh grabbed one-third of the shells that Kyle found. &nbsp;How many seashells did Leigh have?
Solution: Let's think step by step. </code></pre> 
</div> 
<p>After the data has been prepared, keep 10 percent of the data as a validation set and push both training and validation set to S3.</p> 
<h2>The Verifiable Reward Function</h2> 
<p>This GRPO implementation for mathematical reasoning employs a dual-reward system that provides objective, verifiable feedback during training. This approach leverages the inherent verifiability of mathematical problems to create reliable training signals without requiring human annotation or subjective evaluation.You will implement two complementary reward functions that work together to guide the model toward both correct response formatting and mathematical accuracy of the result:</p> 
<h4>Format Reward Function</h4> 
<p>This function helps verify the model learns to structure its responses correctly by:</p> 
<ul> 
 <li><strong>Pattern Matching</strong>: Searches for the specific format <code>#### The final answer is [number]</code></li> 
 <li><strong>Consistent Scoring</strong>: Awards 0.5 points for proper formatting, 0.0 for incorrect format</li> 
 <li><strong>Training Signal</strong>: Encourages the model to follow the expected answer structure</li> 
</ul> 
<div class="hide-language"> 
 <pre><code class="lang-python">#Format reward function
def format_reward_func_qa(completions, **kwargs):
&nbsp;&nbsp; &nbsp;pattern = r"\n#### The final answer is \d+" &nbsp; &nbsp;
&nbsp;&nbsp; &nbsp;completion_contents = [completion for completion in completions] &nbsp; &nbsp;
&nbsp;&nbsp; &nbsp;matches = [re.search(pattern, content) for content in completion_contents]
&nbsp;&nbsp; &nbsp;return [0.5 if match else 0.0 for match in matches]</code></pre> 
</div> 
<h4>Correctness Reward Function</h4> 
<p>This function provides the core mathematical verification by:</p> 
<ul> 
 <li><strong>Answer Extraction</strong>: Uses regex to extract numerical answers from formatted responses</li> 
 <li><strong>Normalization</strong>: Removes common formatting characters (commas, currency symbols, units)</li> 
 <li><strong>Precision Comparison</strong>: Uses a tolerance of 1e-3 to handle floating-point precision</li> 
 <li><strong>Binary Scoring</strong>: Awards 1.0 for correct answers, 0.0 for incorrect ones</li> 
</ul> 
<div class="hide-language"> 
 <pre><code class="lang-python">#Correctness reward function
def correctness_reward_func_qa(completions, final_answer, **kwargs):
&nbsp;&nbsp; &nbsp;rewards = []
&nbsp;&nbsp; &nbsp;
&nbsp;&nbsp; &nbsp;for completion, ground_truth in zip(completions, final_answer):
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;try:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;match = re.search(r'####.*?([\d,]+(?:\.\d+)?)', completion)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;if match:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;answer = match.group(1)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;for remove_char in [',', '$', '%', 'g']:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;answer = answer.replace(remove_char, '')
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;if abs(float(answer)-float(ground_truth)) &lt; 1e-3:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;rewards.append(1.0)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;else:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;rewards.append(0.0)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;else:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;rewards.append(0.0)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;except ValueError:
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;rewards.append(0.0)
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp;&nbsp; &nbsp;return rewards</code></pre> 
</div> 
<h4>Integrating RLVR with GRPO</h4> 
<p>The reward functions are integrated into the GRPO training pipeline through the GRPOTrainer:</p> 
<div class="hide-language"> 
 <pre><code class="lang-code">rewards_funcs = [format_reward_func_qa, correctness_reward_func_qa]
trainer = GRPOTrainer(
&nbsp;&nbsp; &nbsp;model=model,
&nbsp;&nbsp; &nbsp;args=training_args,
&nbsp;&nbsp; &nbsp;train_dataset=train_dataset,
&nbsp;&nbsp; &nbsp;eval_dataset=test_dataset,
&nbsp;&nbsp; &nbsp;processing_class=tokenizer,
&nbsp;&nbsp; &nbsp;peft_config=peft_config,
&nbsp;&nbsp; &nbsp;reward_funcs=rewards_funcs,
)</code></pre> 
</div> 
<p>During training, GRPO uses these reward functions to compute policy gradients. First the model generates multiple completions for each mathematical problem. Next, the reward for each response is computed for both reward functions. The format reward function will grant up to 0.5 for proper response structure, and the correctness reward function will grant up to 1.0 for the mathematical accuracy of the answer for a maximum combined reward of 1.5 per completion. Then GRPO compares the completions within groups to identify the best responses. Finally, in the policy update step, the loss function uses reward differences to update model parameters. Higher-rewarded completions increase their probability, while lower-rewarded completions decrease their probability. This relative ranking drives the optimization process.The following example demonstrates how to fine-tune Qwen2.5-0.5B. The recipe is provided in the scripts folder, allowing you to customize it or change the base model. Here you will use GRPO with verifiable rewards using Quantized Low-Rank Adaptation (QLoRA). QLoRA is used here as a technique to reduce training resource requirements and speed up the training process, with a small trade off in accuracy.</p> 
<div class="hide-language"> 
 <pre><code class="lang-code"># Model arguments
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
&nbsp;&nbsp;use_reentrant: True
learning_rate: 1.84e-4
lr_scheduler_type: cosine
warmup_ratio: 0.1
# Logging arguments
logging_strategy: steps
logging_steps: 5
report_to:
- mlflow
save_strategy: "no"
seed: 42</code></pre> 
</div> 
<h3>Recipe overview</h3> 
<p>This recipe implements Group Relative Policy Optimization (GRPO) with verifiable rewards for fine-tuning the Qwen2.5-0.5B model on mathematical reasoning tasks. The recipe uses a dual-reward system that objectively evaluates both answer formatting and mathematical correctness without requiring human annotation.</p> 
<p>Important Hyperparameters:</p> 
<ul> 
 <li><code>learning_rate</code>: 1.84e-4 – Learning rate optimized for GRPO training</li> 
 <li><code>num_train_epochs</code>: 2 – Training epochs to avoid overfitting</li> 
 <li><code>per_device_train_batch_size</code>: 16 with gradient_accumulation_steps: 2 – Effective batch size of 32</li> 
 <li><code>max_seq_length</code>: 2048 – Context window for 8-shot prompting</li> 
 <li><code>lora_r</code>: 16 and <code>lora_alpha</code>: 16 – LoRA rank and scaling parameters</li> 
 <li><code>warmup_ratio</code>: 0.1 with cosine scheduler – Learning rate scheduling</li> 
 <li><code>lora_target_modules</code> – Targets attention and MLP layers for adaptation</li> 
</ul> 
<p>As a next step, you will use a SageMaker AI training job to spin up a training cluster and run the model fine-tuning. The <a href="https://sagemaker.readthedocs.io/en/stable/training/index.html" target="_blank" rel="noopener noreferrer">SageMaker AI Model Trainer</a>. ModelTrainer runs training jobs on fully managed infrastructure; handling environment setup, scaling, and artifact management. It also allows you to specify training scripts, input data, and compute resources without manually provisioning servers. Library dependencies can be managed through the <code>requirements.txt</code> file in <code>scripts</code> folder. ModelTrainer will automatically detect this file and install the listed dependencies at runtime.</p> 
<p>First, set up your environment. Here you’ll specify the instance type and number of instances for training and the location of the training container.</p> 
<div class="hide-language"> 
 <pre><code class="lang-python">from sagemaker.core import image_uris
from sagemaker.core.helper.session_helper import Session
sagemaker_session = Session()
bucket_name = sagemaker_session.default_bucket()
default_prefix = sagemaker_session.default_bucket_prefix
configs = load_sagemaker_config()
instance_type = "ml.g6.48xlarge"
instance_count = 1
config_filename = "Qwen2.5-0.5B.yaml" 
image_uri = image_uris.retrieve(
&nbsp;&nbsp; &nbsp;framework="pytorch",
&nbsp;&nbsp; &nbsp;region=sagemaker_session.boto_session.region_name,
&nbsp;&nbsp; &nbsp;version="2.7.1",
&nbsp;&nbsp; &nbsp;instance_type=instance_type,
&nbsp;&nbsp; &nbsp;image_scope="training"
)</code></pre> 
</div> 
<p>Next, configure the environment variables, code locations, and data paths:</p> 
<div class="hide-language"> 
 <pre><code class="lang-python">from sagemaker.train.configs import (
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
env["MLFLOW_TAGS"] = &nbsp;'{"source.job": "sm-training-jobs", "source.type": "grpo-rlvr", "source.framework": "pytorch"}'
env["MLFLOW_TRACKING_URI"] = &nbsp;MLFLOW_TRACKING_SERVER_ARN
# Define the script to be run
source_code = SourceCode(
&nbsp;&nbsp; &nbsp;source_dir="./scripts",
&nbsp;&nbsp; &nbsp;requirements="requirements.txt",
&nbsp;&nbsp; &nbsp;entry_script="run_finetuning.sh",
)
# Define the compute
compute_configs = Compute(
&nbsp;&nbsp; &nbsp;instance_type=instance_type,
&nbsp;&nbsp; &nbsp;instance_count=instance_count,
&nbsp;&nbsp; &nbsp;keep_alive_period_in_seconds=3600,
)
# define Training Job Name
job_name = f"train-{config_filename.split('/')[-1].replace('.', '-').replace('yaml', 'rlvr')}"
# define OutputDataConfig path
output_path = f"s3://{bucket_name}/{job_name}"
# Define the ModelTrainer
model_trainer = ModelTrainer(
&nbsp;&nbsp; &nbsp;training_image=image_uri,
&nbsp;&nbsp; &nbsp;environment=env,
&nbsp;&nbsp; &nbsp;source_code=source_code,
&nbsp;&nbsp; &nbsp;base_job_name=job_name,
&nbsp;&nbsp; &nbsp;compute=compute_configs,
 stopping_condition=StoppingCondition(max_runtime_in_seconds=18000),
&nbsp;&nbsp; &nbsp;output_data_config=OutputDataConfig(s3_output_path=output_path),
&nbsp;&nbsp; &nbsp;checkpoint_config=CheckpointConfig(
&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;s3_uri=output_path + "/checkpoint", local_path="/opt/ml/checkpoints"
&nbsp;&nbsp; &nbsp;),
)</code></pre> 
</div> 
<p>Set up the channels for training and validation data:</p> 
<div class="hide-language"> 
 <pre><code class="lang-python">from sagemaker.train.configs import InputData
# Pass the input data
train_input = InputData(
&nbsp;&nbsp; &nbsp;channel_name="train",
&nbsp;&nbsp; &nbsp;data_source=train_dataset_s3_path, # S3 path where training data is stored
)
val_input = InputData(
&nbsp;&nbsp; &nbsp;channel_name="val",
&nbsp;&nbsp; &nbsp;data_source=val_dataset_s3_path, # S3 path where training data is stored
)
# Check input channels configured
data = [train_input, val_input]</code></pre> 
</div> 
<p>Then begin training:<code>model_trainer.train(input_data_config=data)</code>The following is the directory structure for source code of this example:</p> 
<div class="hide-language"> 
 <pre><code class="lang-code">scripts/
├── accelerate_configs/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Accelerate configuration files
├── run_finetuning.sh&nbsp;&nbsp; &nbsp; &nbsp;# Launch script for distributed training with Accelerate on SageMaker training jobs
├── run_grpo.py &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;# Main training script for GRPO
├── utils/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;# utilities to load data and create prompt
├── recipes/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Predefined training configuration recipes (YAML)
└── requirements.txt &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; # Python dependencies installed at runtime</code></pre> 
</div> 
<p>To fine-tune across multiple GPUs, the example training script uses Huggingface Accelerate and DeepSpeed ZeRO-3, which work together to train large models more efficiently. Huggingface Accelerate simplifies launching distributed training by automatically handling device placement, process management, and mixed precision settings. DeepSpeed ZeRO-3 reduces memory usage by partitioning optimizer states, gradients, and parameters across GPUs—allowing billion-parameter models to fit and train faster.You can run your GRPO trainer script with Huggingface Accelerate using a simple command like the following:</p> 
<div class="hide-language"> 
 <pre><code class="lang-css">NUM_GPUS=$(nvidia-smi --list-gpus | wc -l)
echo "Detected ${NUM_GPUS} GPUs on the machine"
# Launch fine-tuning with Accelerate + DeepSpeed (Zero3)
accelerate launch \
&nbsp;&nbsp;--config_file accelerate_configs/deepspeed_zero3.yaml \
&nbsp;&nbsp;--num_processes ${NUM_GPUS} \
&nbsp;&nbsp;run_grpo.py \
&nbsp;&nbsp;--config $CONFIG_PATH</code></pre> 
</div> 
<h2>Results</h2> 
<p>After evaluating the models on 100 test samples, the 8-shot GRPO-trained model achieved 41% accuracy compared to the base model’s 11%, demonstrating a 3.7x improvement in chain-of-thought mathematical reasoning.</p> 
<p><img loading="lazy" class="alignnone wp-image-130108 size-full" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/30/image-2-1.jpg" alt="" width="1332" height="558"></p> 
<p>The following chart shows a distinct threshold related to context length, revealing an optimal range of samples for reasoning activation. While 0-shot (6%) and 2-shot (3%) configurations performed poorly – even worse than the base model – performance dramatically improved at 4-shot prompting (33%), then peaked at 8-shot context (41%). This non-linear scaling pattern suggests that GRPO training creates reasoning patterns that require a certain number of examples to activate effectively. The model appears to have learned to leverage group comparisons from multiple examples, consistent with GRPO’s group-based policy optimization approach where the model learns to compare and select optimal reasoning paths from multiple generated solutions.</p> 
<p><img loading="lazy" class="alignnone size-full wp-image-130109" src="https://d2908q01vomqb2.cloudfront.net/f1f836cb4ea6efb2a0b1b99f41ad8b103eff4b59/2026/04/30/image-3-1.jpg" alt="" width="2030" height="792"></p> 
<h2>Extending RLVR to other domains</h2> 
<p>While this post focused on mathematical reasoning with GSM8K, the RLVR approach generalizes to domains with objectively verifiable outputs. Two promising directions demonstrate this versatility:</p> 
<h3>Code generation with execution-based rewards</h3> 
<p>Code generation provides natural verification through execution. Partial rewards can be awarded when code compiles and runs without errors, while full rewards are achieved when outputs pass comprehensive unit tests. Domain experts specify requirements using natural language prompts, while the reward model automatically