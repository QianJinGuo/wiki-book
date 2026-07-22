---
source: rss
source_url: https://aws.amazon.com/blogs/machine-learning/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-amazon-sagemaker-ai
ingested: 2026-06-10
feed_name: AWS China ML
source_published: 2026-06-09
sha256: 34df8969fa7cbdbf202e1bf485f75e8aebacb36d981dd081b409ca4e8b3798a6
---

# Scale Robot Reinforcement Learning with NVIDIA Isaac Lab on Amazon SageMaker AI

Physical AI is moving from research into production. Robots are increasingly trained in high-fidelity simulation before being deployed to factories, warehouses, and logistics centers, because training in the real world is slow, expensive, and often unsafe, while GPU-accelerated simulation can compress months of learning into hours.  
  
This shifts the challenge to compute. Reinforcement learning (RL) for complex behaviors like humanoid locomotion on rough terrain is compute-intensive, with single-node training runs stretching from hours to days. Robotics teams need to iterate quickly during research and also run production-grade, long-horizon training jobs without the operational burden of maintaining compute clusters.

In this post, we show how to train robot policies for the Unitree H1 humanoid with NVIDIA Isaac Lab on Amazon SageMaker AI across two compute options: **Amazon SageMaker HyperPod** and **Amazon SageMaker Training Jobs**. The full code of this solution is available in the [accompanying GitHub repository](<https://github.com/awslabs/awsome-distributed-ai/tree/main/3.test_cases/pytorch/nvidia-isaac-lab>).

_Image credit: NVIDIA_

## 1\. Why Amazon SageMaker AI for Physical AI training

Amazon SageMaker AI removes the undifferentiated heavy lifting of managing compute infrastructure for machine learning (ML) training. The service provisions instances, configures drivers and networking, monitors node health, and tears down resources when jobs finish, so engineering effort stays on developing the robot policy rather than on the infrastructure underneath it. This is especially relevant for robot policy RL, which is infrastructure heavy: runs are long, GPU intensive, and often distributed across multiple nodes. Development typically involves two phases: short iterative experiments to tune reward functions, observation spaces, and model architectures, and longer production runs that train a tuned configuration to convergence. SageMaker AI provides two compute options that fit these phases.

### Cluster resiliency and control with SageMaker HyperPod

[SageMaker HyperPod](<https://aws.amazon.com/sagemaker/ai/hyperpod/>) is a purpose-built, managed infrastructure for distributed training and inference of large-scale foundation models. Resiliency is at the core of SageMaker HyperPod. Hardware failures become an issue at scale, and each failure in a multi-node RL run means lost training progress plus time to detect the fault, replace the node, and restart from the last checkpoint. SageMaker HyperPod runs a health-monitoring agent on each node that performs basic and deep health checks. When a fault is detected, it automatically reboots or replaces the faulty instance. With auto-resume functionality, the training job restarts from the last checkpoint after the replacement node is ready, with no manual intervention.

Orchestrated with Amazon Elastic Kubernetes Service (Amazon EKS) or Slurm, HyperPod provides direct access to cluster nodes and a stable environment that persists across runs. The HyperPod observability add-on publishes hundreds of cluster, node, and job metrics to Amazon Managed Service for Prometheus and visualizes them in pre-built Amazon Managed Grafana dashboards. Teams get GPU utilization, memory pressure, network throughput, and task-level performance without setting up a metrics pipeline. HyperPod task governance, built on Kueue, lets administrators carve the cluster into namespace-scoped queues with compute quotas, priorities, and preemption. Allocations can be defined per instance, per whole GPU, or per GPU partition with NVIDIA Multi-Instance GPU (MIG). Fine-grained quotas cover accelerators, vCPU, and memory.

### Ephemeral compute with SageMaker Training Jobs

[SageMaker Training Jobs](<https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html>) are a fully managed, on-demand way to run containerized training workloads without maintaining any long-lived compute. Each job provisions GPU instances, pulls the container from Amazon Elastic Container Registry (Amazon ECR), runs the training script, uploads artifacts to Amazon Simple Storage Service (Amazon S3), and terminates the instances when the job finishes. There is no idle compute cost between runs. This model fits the iteration phase of policy development, where reward functions, observation spaces, and network architectures change frequently between short runs. It is also a good fit for hyperparameter tuning sweeps, where many short runs run in parallel and then release their compute.

## 2\. NVIDIA Isaac Lab and the training task

[NVIDIA Isaac Lab](<https://developer.nvidia.com/isaac/lab>) is an open-source robot learning framework built on [NVIDIA Isaac Sim](<https://developer.nvidia.com/isaac/sim?size=n_6_n&sort-field=featured&sort-direction=desc>). It uses GPU-parallel simulation to run thousands of robot instances simultaneously on one or multiple GPUs, turning what would be months of real-world experience into hours of simulated training. Isaac Lab provides structured APIs to define tasks, observation and action spaces, reward functions, and training loops for both reinforcement learning and imitation learning.

_Image credit: NVIDIA_

The sample training task in this post is `Isaac-Velocity-Rough-H1-v0`, where a [Unitree H1 humanoid robot](<https://www.unitree.com/h1/>) learns to track velocity commands while walking across rough terrain. The robot must coordinate its 19 joints to maintain balance over procedurally generated uneven surfaces. Training uses Proximal Policy Optimization (PPO) through [skrl](<https://skrl.readthedocs.io/>), one of several RL frameworks supported by Isaac Lab. Scaling to multiple nodes multiplies the number of parallel environments, producing more diverse experience per policy update and accelerating convergence. You can extend the scripts and configuration provided in this solution to other robot learning tasks.

## 3\. Solution overview

The solution in the [accompanying GitHub repository](<https://github.com/awslabs/awsome-distributed-ai/tree/main/3.test_cases/pytorch/nvidia-isaac-lab>) consists of two main parts: (1) a single Docker image that runs the training code on both SageMaker HyperPod and SageMaker Training Jobs, and (2) a generator script that renders the Kubernetes manifests and the SageMaker launch script from a shared configuration file. The two service options differ only in how the image is launched: as a Kubernetes `PyTorchJob` on SageMaker HyperPod, or through a `CreateTrainingJob` API call for a SageMaker Training Job.

The H1 locomotion task used here is the same as in the [NVIDIA Isaac Lab on AWS workshop](<https://catalog.us-east-1.prod.workshops.aws/workshops/075ce3fe-6888-4ea9-986e-5bdd1b767ef7/en-US/introduction>), which runs the workload on Amazon Elastic Compute Cloud (Amazon EC2) and AWS Batch. Moving to SageMaker AI keeps the training code unchanged and adds managed clusters, integrated fault recovery, and serverless training job execution.

### Training image

The training container image is built from `nvcr.io/nvidia/isaac-sim:5.1.0`. The provided Dockerfile clones Isaac Lab `v2.3.2`, installs it into Isaac Sim’s bundled Python environment, and copies in the entrypoint script that parses the SageMaker Training Jobs resource config to launch `torchrun`. The full Dockerfile is in `docker/Dockerfile`. Both service options use the same image.

### Experiment tracking

Training metrics are streamed to [Amazon SageMaker managed MLflow](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow.html>) for persistent, searchable experiment tracking across both backends when a tracking server is configured. MLflow is opt-in: leave the tracking URI empty to disable it entirely. Section 4.5 covers the configuration.

### Configuration and the generator script

The generator script is configured through environment-specific variables defined in `config.yaml`. The `generate.py` script reads the configuration and renders the templates in `templates/` into ready-to-apply files under `generated/`.

Running the generator is a single command:
    
    
    python generate.py

The specific files used by each backend are covered in the Section 4 and Section 5 walkthroughs for SageMaker HyperPod and SageMaker Training Jobs respectively.

### Training topology across backends

In the provided solution, both paths end with the same `torchrun` invocation of Isaac Lab’s skrl trainer on the same image. The primary difference is how each environment provides the topology to the container. On SageMaker HyperPod, the Kubeflow Training Operator injects `MASTER_ADDR`, `MASTER_PORT`, `RANK`, and `WORLD_SIZE` into each pod. These describe the pod-level topology (`WORLD_SIZE` is the pod count, `RANK` is the per-pod index). The entrypoint forwards them to `torchrun`, which spawns one process per GPU within each pod. The per-pod launchers rendezvous through `MASTER_ADDR:MASTER_PORT` to form the global process group. On SageMaker Training Jobs, SageMaker writes the host list to `/opt/ml/input/config/resourceconfig.json`, and the container’s entrypoint parses it at startup.

### GPU instance compatibility

Isaac Sim is built on NVIDIA Omniverse and uses the Omniverse RTX Renderer, which requires GPUs with hardware RT Cores. The G family of AWS GPU instances is suitable for Isaac Lab workloads. The P family is not, because it uses data center GPUs without RT Cores. See the [Isaac Sim 5.1 requirements page](<http://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/requirements.html>) for the full list of supported and unsupported hardware.

**Instance family** | **GPU type and generation** | **RT Cores / Isaac Sim compatibility**  
---|---|---  
`ml.g5` | NVIDIA A10G (Ampere) | Yes  
`ml.g6` | NVIDIA L4 (Ada Lovelace) | Yes  
`ml.g6e` | NVIDIA L40S (Ada Lovelace) | Yes  
`ml.g7e` | NVIDIA RTX PRO 6000 (Blackwell) | Yes  
`ml.p4d`, `ml.p4de`, `ml.p5`, `ml.p5e`, `ml.p5en`, `ml.p6-b200`, `ml.p6-b300`, `ml.p6e-gb200` | NVIDIA A100 (Ampere), H100 / H200 (Hopper), B200 / B300 / GB200 (Blackwell) | **No**  
  
The examples in this post use `ml.g6.12xlarge` throughout. You can change the instance type in `config.yaml`. The `ml.g6`, `ml.g6e`, and `ml.g7e` families support Elastic Fabric Adapter (EFA) at the 8xlarge size and above, which gives NCCL a kernel-bypass, RDMA-capable transport for multi-node collectives. Enabling EFA on HyperPod requires the AWS EFA device plugin and requesting `vpc.amazonaws.com/efa` resources in the pod spec. On SageMaker Training Jobs, you must configure EFA in the container image and in the virtual private cloud (VPC) configuration. EFA is automatically configured through the solution for both SageMaker HyperPod and SageMaker Training Jobs backends. The SageMaker Training Job setup is in the [documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-training-efa.html>).

### Setup: Clone the repository and build the image

Two setup steps are shared across both walkthroughs: cloning the accompanying repository and building the training image.

Clone the solution’s repository:
    
    
    git clone https://github.com/awslabs/awsome-distributed-ai.git
    cd awsome-distributed-ai/3.test_cases/pytorch/nvidia-isaac-lab

The repository contains the Dockerfile, the configuration template, the generator, and the entrypoint scripts used by both backends.

Build the image from the repository root and push it to Amazon ECR.

  1. Define the environment variables according to your setup:


    
    
    export AWS_REGION=us-east-1 # your region
    export ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

  2. Check whether the corresponding ECR repository exists, and create it if not:


    
    
    aws ecr describe-repositories --repository-names isaaclab-sagemaker --region "$AWS_REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name isaaclab-sagemaker --region "$AWS_REGION"

  3. Authenticate with Amazon ECR:


    
    
    aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

  4. Build and tag the Docker image:


    
    
    docker build -t isaaclab-sagemaker:5.1.0 -f docker/Dockerfile .
    docker tag isaaclab-sagemaker:5.1.0 $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/isaaclab-sagemaker:5.1.0

  5. Push the Docker image to Amazon ECR:


    
    
    docker push $ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/isaaclab-sagemaker:5.1.0

If you want to use Training Jobs instead, jump to Section 5.

## 4\. Walkthrough: training on SageMaker HyperPod with Amazon EKS

For this walkthrough, we use an existing SageMaker HyperPod cluster orchestrated by Amazon EKS, with a GPU instance group of two `ml.g6.12xlarge` nodes (4× NVIDIA L4 each, 8 GPUs total). The goal is a distributed training job for the H1 locomotion task, with live metrics in [SageMaker managed MLflow](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow.html>) and the resulting checkpoints written to FSx for Lustre.

### 4.1 Prerequisites

The solution requires the following prerequisites to be in place:

  * Sufficient service quota for the cluster and the chosen GPU instance type in the target region. HyperPod clusters consume the corresponding `ml.g6.*` (or other GPU family) quota for _SageMaker HyperPod_. Request an increase through [AWS Service Quotas](<https://console.aws.amazon.com/servicequotas/>) before creating or scaling the cluster.
  * A SageMaker HyperPod cluster orchestrated by Amazon EKS with a GPU instance group of two `ml.g6.12xlarge` nodes. See [Creating a SageMaker HyperPod cluster with Amazon EKS orchestration](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html>).
  * `kubectl` configured against the cluster, and the [Kubeflow Training Operator](<https://github.com/kubeflow/training-operator>) installed in it so that `PyTorchJob` custom resources are recognized.
  * The [FSx for Lustre CSI Driver](<https://github.com/kubernetes-sigs/aws-fsx-csi-driver>) installed, and an Amazon FSx for Lustre file system in the same VPC and subnet as the HyperPod nodes. This file system stores the logs and checkpoints written by the training job.



### 4.2 Configure and generate manifests

  1. Copy the example configuration:


    
    
    cp config.yaml.example config.yaml

  2. Fill in your environment values and AWS account ID, Region, and cluster details:


    
    
    aws:
    account_id: "<AWS-ACCOUNT-ID>" # your 12-digit AWS account ID
    region: "<AWS-REGION>" # e.g. us-east-2
    ecr:
    repository: "isaaclab-sagemaker" # must match the repo you pushed to
    tag: "5.1.0"
    training:
    task: "Isaac-Velocity-Rough-H1-v0"
    max_iterations: 1000 # PPO iterations; bump for production runs
    framework: "skrl" # skrl | rsl_rl | rl_games | sb3
    hyperpod_eks:
    fsx:
    file_system_id: "<FSX-FILE-SYSTEM-ID>"
    dns_name: "<FSX-FILE-SYSTEM-ID>.fsx.<AWS-REGION>.amazonaws.com"
    mount_name: "<FSX-MOUNT-NAME>" # the 8-character FSx mount name
    jobs:
    training_job:
    instance_type: "ml.g6.12xlarge"
    gpus_per_node: 4
    num_nodes: 2 # set to 1 for single node training
    fsx_log_dir: "/fsx/isaaclab-h1/logs"

Important configuration fields include the following:

  * **`aws`, `ecr`** — these are used to form the container image URI (`<account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>`) referenced by every pod and training job. You can set an explicit URI through `hyperpod_eks.image` as an override.
  * **`training.task`** — the Isaac Lab task identifier. You can select a different locomotion or manipulation task by changing this value.
  * **`training.max_iterations`** — the number of PPO iterations. A value of 1000 is sufficient for a smoke test. Production runs for H1 on rough terrain typically require an order of magnitude more.
  * **`hyperpod_eks.fsx`** — the file system ID, DNS name, and mount name of the FSx for Lustre file system. These values are available from the FSx console or the `aws fsx describe-file-systems` command.
  * **`jobs.training_job.fsx_log_dir`** — the directory on FSx where training logs and checkpoints are written.



Generate the manifests by executing the script:
    
    
    python generate.py
    # Config: config.yaml
    # Image: <AWS-ACCOUNT-ID>.dkr.ecr.<AWS-REGION>.amazonaws.com/isaaclab-sagemaker:5.1.0
    # Task: Isaac-Velocity-Rough-H1-v0
    # Iterations:1000
    #
    # Generated: generated/storage.yaml
    # Generated: generated/training-job.yaml
    # Generated: generated/launch-sm-training.py
    # Generated: generated/viz-eks-webrtc-pod.yaml

The following Kubernetes manifests are generated and used in the next parts of the walkthrough:

**Generated file** | **What it is** | **When to apply**  
---|---|---  
`storage.yaml` | `PersistentVolume` and `PersistentVolumeClaim` that bind to your FSx for Lustre file system, exposing it to pods at `/fsx`. | Once per cluster.  
`training-job.yaml` | Kubeflow `PyTorchJob` with a Master replica and `num_nodes - 1` Worker replicas. Runs on one node when `num_nodes: 1` and across multiple nodes otherwise. | Per training run.  
`viz-eks-webrtc-pod.yaml` | Pod that runs Isaac Sim in headless streaming mode alongside a browser-based WebRTC client, for visualizing trained policies. | Optional. Covered in Section 6.  
  
The remaining file, `launch-sm-training.py`, is covered in the SageMaker Training Jobs walkthrough (Section 5).

### 4.3 Deploy shared storage

FSx for Lustre is the storage layer for this walkthrough. It provides parallel, high-throughput writes that handle checkpoints from multiple pods without bottlenecking the training loop, and it lets the training job and the visualization pod use the same volume.

The file `generated/storage.yaml` contains a `PersistentVolume` and `PersistentVolumeClaim` that point at your FSx file system. Apply it to your cluster:
    
    
    kubectl apply -f generated/storage.yaml
    kubectl get pvc isaaclab-fsx-pvc
    # NAME STATUS VOLUME CAPACITY ACCESS MODES
    # isaaclab-fsx-pvc Bound isaaclab-fsx-pv 1200Gi RWX

### 4.4 Launch the training

The file `generated/training-job.yaml` is a Kubeflow `PyTorchJob` with a Master replica and `num_nodes - 1` Worker replicas. With the default `jobs.training_job.num_nodes: 2` in `config.yaml`, it runs across two `ml.g6.12xlarge` nodes (8 GPUs total). Setting `num_nodes: 1` produces a single-node job with no Worker replicas.

When the job starts, the Kubeflow Training Operator injects the standard PyTorch distributed environment variables (`MASTER_ADDR`, `MASTER_PORT`, `RANK`, `WORLD_SIZE`) into each pod. The container launch script passes them to `torchrun`, which handles rendezvous and process group setup:
    
    
    # excerpt from generated/training-job.yaml
    /isaac-sim/python.sh -m torch.distributed.run \
    --nproc_per_node=4 \
    --nnodes=2 \
    --node_rank=$RANK \
    --rdzv_id=isaaclab-job \
    --rdzv_backend=c10d \
    --rdzv_endpoint=$MASTER_ADDR:$MASTER_PORT \
    scripts/reinforcement_learning/skrl/train.py \
    --distributed --task=Isaac-Velocity-Rough-H1-v0 \
    --max_iterations=1000 --headless

Apply the manifest:
    
    
    kubectl apply -f generated/training-job.yaml

Observe the job status:
    
    
    kubectl get pytorchjobs
    # NAME STATE AGE
    # isaaclab-h1 Running 3m
    kubectl logs -f isaaclab-h1-master-0

Early logs show each pod printing its rank, the master address, and the output of `nvidia-smi`. After the workers connect to the master, Isaac Lab loads the scene (which takes a minute or two the first time on each node while asset caches warm up), spawns parallel environments across all available GPUs, and begins logging reward and value loss metrics every few seconds. The entrypoint prints the Kubeflow-injected pod-level topology before handing off to `torchrun`.

The training manifest also checks FSx for an existing `best_agent.pt` at startup. If one is found from a previous run, it passes `--checkpoint` to `train.py` so training resumes from that point rather than starting from scratch. A pod restart or node replacement triggered by HyperPod’s health monitoring automatically continues from the last checkpoint.
    
    
    === Master Node Info ===
    Hostname: isaaclab-h1-master-0
    MASTER_ADDR: isaaclab-h1-master-0
    WORLD_SIZE: 2
    RANK: 0
    GPU 0: NVIDIA L4 (UUID: GPU-dd5102c3-be08-...)
    GPU 1: NVIDIA L4 (UUID: GPU-3c0d70fe-519f-...)
    GPU 2: NVIDIA L4 (UUID: GPU-42485aa5-6a2a-...)
    GPU 3: NVIDIA L4 (UUID: GPU-18f62bef-4155-...)
    === Starting Master (2 nodes, 8 GPUs total, 1000 iterations) ===
    ...
    [INFO][AppLauncher]: Using device: cuda:0
    [INFO]: Scene manager: <class InteractiveScene>
    Number of environments: 4096
    Environment spacing : 2.5
    [INFO]: Time taken for scene creation: 16.30 seconds
    10%|▉ | 118/24000 [00:09<01:02, 17.21it/s]
    ...

Here `WORLD_SIZE: 2` is the pod count, not the global process count. `torchrun` spawns 8 processes in total (4 per pod across 2 pods) after it starts, and inside those processes `WORLD_SIZE` becomes 8.

### 4.5 Track experiments with SageMaker managed MLflow

Training metrics, run parameters (task, iterations, seed), and the final checkpoint directory are forwarded to [Amazon SageMaker managed MLflow](<https://docs.aws.amazon.com/sagemaker/latest/dg/mlflow.html>) for a persistent, searchable experiment store. System metrics such as GPU utilization and CPU/memory usage are sampled by MLflow’s own background thread.

Enabling MLflow is opt-in. When `MLFLOW_TRACKING_URI` is empty (the default), the training script skips every MLflow call. Set the tracking URI and experiment name in `config.yaml`:
    
    
    mlflow:
    tracking_uri: "arn:aws:sagemaker:<AWS-REGION>:<AWS-ACCOUNT-ID>:mlflow-app/<APP-ID>"
    experiment_name: "isaaclab-h1"
    # Only required if the tracking URI is a Studio-scoped MLflow App and the
    # training role is outside that Studio domain. See below.
    assume_role_arn: ""

Regenerate the manifests and relaunch the training job. The training pod logs print the run URL a few seconds after startup:
    
    
    INFO mlflow.tracking.fluent: Experiment with name 'isaaclab-h1' does not exist. Creating a new experiment.
    INFO mlflow.system_metrics.system_metrics_monitor: Started monitoring system metrics.
    ...
    View run 2026-04-27_18-59-29_ppo_torch at:
    [https://mlflow.sagemaker.us-east-2.app.aws/#/experiments/1/runs/<RUN-ID>](<https://mlflow.sagemaker.us-east-2.app.aws/#/experiments/1/runs/<RUN-ID>>)
    View experiment at:
    https://mlflow.sagemaker.us-east-2.app.aws/#/experiments/1

When the run completes, MLflow shuts down the system-metrics thread and the `Training time:` line from skrl appears:
    
    
    Training time: 91.9 seconds
    INFO mlflow.system_metrics.system_metrics_monitor: Stopping system metrics monitoring...
    INFO mlflow.system_metrics.system_metrics_monitor: Successfully terminated system metrics monitoring!

Open the URL, or navigate to the MLflow UI from SageMaker Studio, to see reward curves and value loss update live alongside GPU utilization.

Two authorization models exist for SageMaker managed MLflow:

  * **MLflow tracking server** (`arn:aws:sagemaker:<region>:<account>:mlflow-tracking-server/<name>`): IAM actions under the `sagemaker-mlflow` service prefix govern access. Give the training role `sagemaker-mlflow:*` on the tracking server resource.
  * **Studio MLflow App** (`arn:aws:sagemaker:<region>:<account>:mlflow-app/<id>`): the app is tied to a Studio user profile and authorizes callers through that Studio execution role. Training jobs run under a different role, so they must assume the Studio execution role before each MLflow call. Set `assume_role_arn` to the Studio role ARN. The generator passes it through as `SAGEMAKER_MLFLOW_ASSUME_ROLE_ARN`, and the [sagemaker-mlflow](<https://github.com/aws/sagemaker-mlflow>) plugin handles the `sts:AssumeRole` call on each request. Update the Studio execution role’s trust policy so the training role can assume it, and attach `sts:AssumeRole` to the training role.



## 5\. Walkthrough: training on SageMaker Training Jobs

SageMaker Training Jobs run the same image through a different lifecycle. Each job provisions the requested GPU instances, pulls the image from Amazon ECR, runs the entrypoint, uploads all files that the training script copied into `/opt/ml/model/` to the S3 output path, and terminates the instances.

### 5.1 Prerequisites

  * Sufficient service quota for the cluster and the chosen GPU instance type in the target Region. SageMaker Training Jobs consume the corresponding `ml.g6.*` (or other GPU family) quota for _SageMaker Training Jobs_. Request an increase through [AWS Service Quotas](<https://console.aws.amazon.com/servicequotas/>) before creating or scaling the cluster.
  * An IAM role that SageMaker can assume for the training job, with permissions to pull from your Amazon ECR repository, read the entrypoint from your S3 bucket, and write artifacts back to Amazon S3. See the [SageMaker execution role documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-roles.html>).
  * An S3 bucket for the entrypoint script (input) and the training artifacts (output).
  * The same Amazon ECR image pushed in Section 3. No rebuild is needed.
  * `boto3` installed locally (`pip install boto3`).



### 5.2 Configure

The Training Jobs section of `config.yaml` captures the execution role, the instance type and count, and the output location. The scripts S3 URI and output S3 path auto-derive from the top-level `s3.bucket` value when left empty.
    
    
    s3:
    bucket: "<ISAACLAB-BUCKET>"
    sagemaker_training:
    role_arn: "arn:aws:iam::<AWS-ACCOUNT-ID>:role/<SAGEMAKER-ROLE-NAME>"
    instance_type: "ml.g6.12xlarge"
    instance_count: 2 # SageMaker handles multi node wiring
    volume_size_gb: 200
    max_runtime_seconds: 7200 # hard upper bound for the job

Important configuration fields include the following:

  * **`role_arn`** — the IAM role SageMaker assumes for the job. The role must have `ecr:BatchGetImage`, `s3:GetObject` on the scripts path, and `s3:PutObject` on the output path.
  * **`instance_count`** — the number of instances the job uses. When you set this to more than one, SageMaker launches a multi-node job and populates `resourceconfig.json` on each instance with the host list. The container entrypoint reads this file to derive its rank and the master address, so the same training script is reused without modification.



### 5.3 Upload the entrypoint

SageMaker pulls the entrypoint script from Amazon S3 into each training instance at job start time. Upload it once. Every subsequent job reads from the same location until a new version is uploaded. Replace the bucket name with your chosen Amazon S3 bucket:
    
    
    aws s3 cp scripts/sm-train-entrypoint.sh \
    s3://<ISAACLAB-BUCKET>/scripts/sm-train-entrypoint.sh

### 5.4 Generate and launch

Running `python generate.py` produces a `launch-sm-training.py` script in `generated/` with the image URI, IAM role, S3 paths, and instance configuration pre-populated from `config.yaml`. The script exposes a small CLI for values you can override between runs:
    
    
    python generate.py # refresh generated/
    python generated/launch-sm-training.py # default: 1000 iterations
    python generated/launch-sm-training.py --iterations 1000
    python generated/launch-sm-training.py --dry-run # print job config, don't launch

The launcher calls `CreateTrainingJob` with a timestamp-suffixed job name, the Amazon ECR image, and the S3 entrypoint location. It also passes through the Isaac Sim environment variables the container requires (`ACCEPT_EULA`, `NVIDIA_VISIBLE_DEVICES=all`, `MAX_ITERATIONS`, among others). On success, it prints the job name and a `describe-training-job` command to monitor progress.

### 5.5 Monitor
    
    
    aws sagemaker describe-training-job \
    --training-job-name <TRAINING-JOB-NAME> \
    --query '{Status: TrainingJobStatus, Secondary: SecondaryStatus}'

The `SecondaryStatus` field progresses through `Pending` → `Downloading` → `Training` → `Uploading` → `Completed`:
    
    
    {
    "Status": "InProgress",
    "SecondaryStatus": "Training"
    }

Training logs are streamed to Amazon CloudWatch Logs under the `/aws/sagemaker/TrainingJobs` log group, with one log stream per instance. The SageMaker console links directly from the job page to the stream if you prefer a UI. A successful rank 0 stream starts with the entrypoint’s self-test:
    
    
    === SageMaker Training Job ===
    Hostname: ip-10-0-195-224.us-east-2.compute.internal
    GPU 0: NVIDIA L4 (UUID: GPU-66e3a452-...)
    GPU 1: NVIDIA L4 (UUID: GPU-a075bb9c-...)
    GPU 2: NVIDIA L4 (UUID: GPU-2ba15062-...)
    GPU 3: NVIDIA L4 (UUID: GPU-e25c05a4-...)
    === Resource Config ===
    {"current_host":"algo-1","hosts":["algo-1","algo-2"],"network_interface_name":"eth0"}
    === Training Configuration ===
    CURRENT_HOST=algo-1
    MASTER_HOST=algo-1
    NNODES=2
    NODE_RANK=0
    NPROC=4
    MAX_ITERATIONS=1000
    === Starting Isaac Lab H1 Training ===

When the job finishes, SageMaker packages whatever the entrypoint copied into `/opt/ml/model/` as a `model.tar.gz` and uploads it to the output S3 path. For H1, the archive contains the skrl `logs/` directory with the training checkpoints and `best_agent.pt`.

When you set `sagemaker_training.checkpoint_s3_path` in `config.yaml`, the launcher includes a `CheckpointConfig` that tells SageMaker to continuously sync `/opt/ml/checkpoints` to Amazon S3 during training. The entrypoint symlinks skrl’s log directory to that path, so every checkpoint skrl writes is backed up to Amazon S3 in near-real time. If the job fails or is interrupted, relaunching it with the same `checkpoint_prefix` restores the latest checkpoint and resumes training automatically.

The same **MLflow integration** described in Section 4.5 applies to Training Jobs. When you set `mlflow.tracking_uri`, the generated `launch-sm-training.py` forwards the MLflow environment variables to the training container as part of the `CreateTrainingJob` request, and the training code writes metrics to the same experiment. For Studio MLflow Apps, the training job’s execution role must be listed in the Studio execution role’s trust policy and carry `sts:AssumeRole` in its own permissions.

## 6\. Visualizing trained policies

The repository provides a visualization pod for SageMaker HyperPod that streams the Isaac Sim GUI directly into a browser through WebRTC, using the same FSx volume as the training jobs so any checkpoint produced on HyperPod can be replayed.

### WebRTC streaming on the HyperPod cluster

Isaac Sim includes built-in headless WebRTC streaming. The viz pod bundles two containers sharing the pod network:

  * **`isaacsim`** — the training image, launched with the skrl `play.py` script in live-stream mode. It loads the most recent `best_agent.pt` from the FSx log directory, runs the task with 25 parallel environments, and streams the viewport over WebRTC (signaling on TCP 49100, media on UDP 47998).
  * **`web-viewer`** — a stock `node:22-slim` that scaffolds NVIDIA’s WebRTC client from `@nvidia/create-ov-web-rtc-app`, points it at the Isaac Sim container on `127.0.0.1`, and serves it on TCP 8210.



The viz pod runs on a GPU node in the same cluster and mounts the FSx volume used by the training jobs, so checkpoints produced by a HyperPod run are directly available for replay. The manifest is rendered by `generate.py` into `generated/viz-eks-webrtc-pod.yaml` alongside the training manifests:
    
    
    kubectl apply -f generated/viz-eks-webrtc-pod.yaml
    kubectl logs -f isaacsim-webrtc -c isaacsim # wait for "app ready"

Connectivity needs one extra step: `kubectl port-forward` only supports TCP, but WebRTC media requires UDP. [krelay](<https://github.com/knight42/krelay>) is a `kubectl` plugin that adds UDP forwarding. Install it with the following command:
    
    
    kubectl krew install relay

Start the port forwarding by running the following commands:
    
    
    kubectl relay pod/isaacsim-webrtc \
    8210:8210 49100:49100 47998:47998@udp
    # open <http://localhost:8210> in Chromium

The browser connects to the web viewer sidecar, which negotiates a WebRTC session with the Isaac Sim container and displays the live viewport. To replay a different checkpoint, edit the `isaacsim` container args in the viz pod manifest (or delete the pod and regenerate after updating `training.task` in `config.yaml`).

For team-accessible deployments, replace the local relay with an AWS Network Load Balancer that exposes both the TCP and UDP ports, and set Isaac Sim’s `publicIp` flag to the NLB’s public address.

The provided viz pod is skrl-specific. If you change `framework` in `config.yaml`, update the checkpoint path and play script accordingly.

### Alternative: Amazon EC2 with NICE DCV

If a full Linux desktop is preferable to a browser-based viewer (for example, to run Isaac Sim alongside terminals and a file browser), the [NVIDIA Isaac Lab on AWS workshop](<https://catalog.us-east-1.prod.workshops.aws/workshops/075ce3fe-6888-4ea9-986e-5bdd1b767ef7/en-US/introduction>) walks through setting up a standalone Amazon EC2 GPU instance with NICE DCV and running the same Isaac Lab image interactively over low-latency remote desktop streaming. The checkpoints produced by the SageMaker jobs in this post can be replayed on that instance by mounting the FSx file system or downloading from the S3 bucket.

## 7\. Cost considerations and clean up

The two compute options have different cost shapes. SageMaker HyperPod is a persistent cluster: instances are billed while they are part of the cluster. FSx for Lustre bills hourly per provisioned capacity, and the visualization pod from Section 6 holds a GPU node for as long as it is running. SageMaker Training Jobs bill only for the runtime of each job. See the [SageMaker AI](<https://aws.amazon.com/sagemaker/pricing/>) and [FSx for Lustre](<https://aws.amazon.com/fsx/lustre/pricing/>) pricing pages for current rates.

### 7.1 Clean up

#### SageMaker HyperPod
    
    
    # Delete the training job and visualization pod
    kubectl delete pytorchjob isaaclab-h1
    kubectl delete -f generated/viz-eks-webrtc-pod.yaml

Scale the GPU instance group to zero between sessions to pause instance costs while keeping the cluster configured, or delete the cluster entirely. See [Manage a SageMaker HyperPod cluster](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-manage-cluster.html>).

Deleting the FSx file system permanently removes all training checkpoints and logs stored on it. Download any checkpoints you want to keep before proceeding.
    
    
    # Delete the FSx file system (replace with your file system ID)
    aws fsx delete-file-system --file-system-id <FSX-FILE-SYSTEM-ID>

#### SageMaker Training Jobs

Training Jobs terminate automatically when the job completes or fails. No compute cleanup is required.

The following commands permanently delete training artifacts and checkpoints. Download any files you want to keep before running them.
    
    
    # Delete training artifacts and checkpoints from S3
    aws s3 rm s3://<ISAACLAB-BUCKET>/sm-training-output/ --recursive
    aws s3 rm s3://<ISAACLAB-BUCKET>/sm-training-checkpoints/ --recursive

#### Amazon ECR
    
    
    # Delete the training image from ECR (replace with your region and account)
    aws ecr batch-delete-image \
    --repository-name isaaclab-sagemaker \
    --image-ids imageTag=5.1.0 \
    --region $AWS_REGION

## 8\. Conclusion

As Physical AI workloads move into production, teams need to scale policy training without the operational overhead of managing compute infrastructure. In this post, we showed how SageMaker HyperPod and SageMaker Training Jobs let robotics teams run distributed Isaac Lab training on managed GPU infrastructure, using a single container image and a shared configuration across both compute models.

SageMaker HyperPod offers persistent GPU clusters with resilient, long-running training. SageMaker Training Jobs offer ephemeral, on-demand runs suited to experiments and hyperparameter sweeps. Both run the same container image and the same `torchrun` invocation of the skrl trainer, so switching between them is only a configuration change.

To get started, explore the [accompanying repository](<https://github.com/awslabs/awsome-distributed-ai/tree/main/3.test_cases/pytorch/nvidia-isaac-lab>) to launch your first H1 training run, and extend the pattern to other Isaac Lab tasks (humanoid manipulation, quadrupeds, dexterous hands). To learn more, see the [Amazon SageMaker HyperPod documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod.html>) and the [Amazon SageMaker Training Jobs documentation](<https://docs.aws.amazon.com/sagemaker/latest/dg/how-it-works-training.html>).

* * *

## About the authors

### Roy Allela

Roy is a Senior AI/ML Specialist Solutions Architect at AWS. He helps AWS customers, from startups to large enterprises to train and deploy foundation models efficiently on AWS. He has a background in Microprocessor Engineering passionate about computational optimization problems and improving the performance of AI workloads.

### Nicolas Jourdan

Nicolas is a Specialist Solutions Architect at AWS, where he helps customers unlock the full potential of AI and ML in the cloud. Nicolas has extensive hands-on experience across industries, including autonomous driving, drones, and manufacturing, having worked in roles ranging from research scientist to engineering manager. He has contributed to award-winning research, holds patents in object detection and anomaly detection, and is passionate about applying cutting-edge AI to solve complex real-world problems.
