# Building Blocks for Foundation Model Training and Inference on AWS

## Ch11.117 Building Blocks for Foundation Model Training and Inference on AWS

> 📊 Level ⭐⭐ | 8.7KB | `entities/building-blocks-for-foundation-model-training-and-inference-on-aws.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/building-blocks-for-foundation-model-training-and-inference-on-aws.md)

## 核心摘要
AWS 提供从 P5 (H100/H200) 到 P6 (B200/B300) 的 GPU 实例家族，配合 EFA v2/v3/v4 OS-bypass 网络和 FSx for Lustre 分层存储，构成基础模型训练和推理的完整基础设施层。
资源编排层面，Slurm 和 Kubernetes 代表两种路线：Slurm 以作业级原子调度适合 HPC 风格的大规模训练；Kubernetes 以声明式 API 适合云原生部署，但需要 Kueue/Volcano/KAI Scheduler 补齐作业级调度和拓扑感知。
ML 软件栈从内核驱动 → CUDA → NCCL( aws-ofi-nccl ) → PyTorch → 分布式训练框架（Transformers/Megatron/veRL）和推理框架（vLLM/SGLang），每一层都需正确配置才能高效运行。

## 深度分析
### 三重扩展定律的基础设施含义
文章指出 scaling 已从单一预训练曲线演化为三重扩展 regimes：预训练、后训练（RLHF/SFT）、测试时计算（long-thinking、search）。这三个 regimes 共同强化而非分化基础设施需求——都要求紧耦合加速计算、高带宽低延迟网络和可扩展分布式存储。
这对 AWS 基础设施设计的启示是：P 系列的 GPU 迭代（H100 → H200 → B200 → B300）沿着峰值 Tensor 吞吐、显存容量/带宽、互联带宽三个轴同时扩展。从 H100 (80GB HBM3, 3.35TB/s) 到 B300 (288GB HBM3e, 8TB/s)，显存容量提升 3.6×；NVLink 聚合带宽从 7.2TB/s 翻倍到 14.4TB/s；EFA 从 v2 升级到 v4，端到端网络延迟持续优化。

### 通信瓶颈的关键性
文章强调随着模型规模扩大，step time 越来越被集体通信和内存移动主导，而非原始计算吞吐。这在 MoE 模型中尤为突出：expert parallelism 依赖 all-to-all 通信进行 token 分发，每个 GPU 与 expert-parallel group 中所有其他 GPU 交换数据，通信量随专家并行度线性增长。
NVLink domain 的大小因此成为首要约束因素。UltraServers 通过 GB200 NVL72 平台将 NVLink domain 扩展到 72 GPU (13.4TB aggregate HBM3e)，使通信密集型工作负载能在 NVLink fabric 内部完成，减少对 EFA 跨节点网络的依赖。

### Slurm vs Kubernetes 的架构取舍
Slurm 采用作业级原子调度——512 GPU 训练任务需同时分配 64 个 8-GPU 节点，任何一个节点失败则整个作业不启动。这种设计天然适合大规模分布式训练的死锁避免和资源弹性管理。
Kubernetes 的 pod 级调度在多节点训练场景下存在根本缺陷：部分 rank 启动而其他 rank Pending 会导致 GPU 空闲或死锁。Kueue 作为 admission controller 在调度层面实现作业级gang 调度和公平份额，而 Volcano/KAI Scheduler 则在 placement 层面实现拓扑感知。KAI Scheduler 特别针对 NVLink/NVSwitch 深度的 GPU 优化放置，这对于通信密集型训练至关重要。
HyperPod EKS 模式的 checkpointless training 通过 P2P 状态复制替代周期性 checkpoint 写入共享存储，结合弹性训练动态调整资源，对大规模训练可靠性有显著影响。

### 推理框架的分化趋势
vLLM 的 PagedAttention 和 SGLang 的 RadixAttention 代表了两种 KV cache 管理策略：PagedAttention 通过分页虚拟内存减少碎片化；RadixAttention 则实现跨请求的自动前缀复用和 cache-aware 负载均衡。两者都支持 tensor parallelism 以处理单 GPU 显存不足的模型。
NVIDIA Dynamo 的 disaggregated serving 将 prefill 和 decode 阶段分离到不同 GPU pool，需要高效的 KV cache 跨实例传输。NIXL（Inference Xfer Library）提供了统一的 point-to-point 传输 API，跨越 HBM/DRAM/NVMe/分布式存储多种内存层和 NVLink/InfiniBand/Ethernet 多种互联。

## 实践启示
### 基础设施选型决策框架
选择 GPU 实例代际时，应同步评估三个维度：HBM 容量（决定单卡可容纳的模型规模）、NVLink 域内带宽（决定同节点集合通信效率）、EFA 跨节点带宽（决定扩展到多节点时的通信效率）。对于 MoE 模型或 expert parallelism 敏感的工作负载，优先考虑 UltraServers 提供的更大 NVLink domain。
EFA 版本演进带来的延迟优化（v2→v3 降低 35%，v3→v4 再降低 18%）对于 all-to-all 密集型 MoE 训练有直接影响，选型时应优先使用 P6 实例的 EFAv4。

### 存储层次设计
30TB NVMe instance store 作为热数据层用于训练 checkpoint 写入；FSx for Lustre 提供共享命名空间和与 S3 的自动 lazy loading 集成；S3 作为持久化层。关键设计决策是 checkpoint 频率和大小的权衡——频繁 checkpoint 增加存储带宽压力但不丢进度，少写 checkpoint 则在故障时重算成本高。HyperPod 的 checkpointless training 提供了一种替代思路。

### 资源编排选型
Slurm 路线适合以训练为中心的 HPC 风格集群，AWS ParallelCluster 或 SageMaker HyperPod Slurm 模式提供成熟方案，backfill 调度和多因子优先级队列对多租户训练环境友好。
Kubernetes 路线适合需要统一云原生应用和 ML 工作负载的场景，推荐 HyperPod EKS + Kueue + Karpenter 组合实现作业级调度和多租户配额管理。对于通信密集型训练，注意选择支持 topology-aware placement 的调度器。

### 分布式训练框架选择
HuggingFace Transformers + Accelerate 适合微调和中等规模训练，注重易用性和模型兼容性；NVIDIA Megatron Core 适合对规模效率有极致追求的场景，提供 3D 并行（tensor/pipeline/expert）和 FP8 混合精度优化；veRL 适合 RLHF 类后训练工作负载，HybridFlow 架构允许训练和推理引擎共享权重避免同步开销。

### 可观测性建设
DCGM-Exporter 暴露 GPU 指标中，SM activity (DCGM_FI_PROF_SM_ACTIVE) 比基础 utilization 更准确反映计算效率；ECC 单比特错误率加速上升往往是双比特错误的前兆；XID 63/64/94/95 触发即时节点替换。EFA 驱动级统计（retransmits、timeouts）结合 NCCL_DEBUG=INFO 可定位网络层瓶颈。
生产环境推荐 AMP (Managed Prometheus) + AMG (Managed Grafana) 组合消除运维负担，同时保持与现有 Prometheus exporters 和 Grafana dashboards 的兼容性。

## 相关实体
- [Foundation Model Building Blocks](/ch03-082-foundation-model-building-blocks/)
- [AWS Model Agility: 6步LLM跨代际迁移框架](/ch11-143-aws-generative-ai-model-agility-framework/)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](/ch04-144-用-kiro构建-ai-基于-aws-基础设施快速构建企业级-agentic-ai-平台-亚马逊aws官方博客/)
- [SQS+Lambda异步管道：2000并发0%限流的工程细节](/ch11-084-aws-bedrock-serverless-async-inference-sqs-lambda/)
- [EC2 Capacity Blocks：GPU短期容量决策指南](/ch11-190-aws-ec2-capacity-blocks-gpu-ml/)
- [SageMaker容量感知推理：实例池+优先级Fallback](/ch01-301-aws-sagemaker-capacity-aware-inference-fallback/)
- [AI Infra 系统性拆解：传统后台工程师视角](/ch01-285-tencent-ai-infra-backend-engineer-s-guide-to-ai-system-hard/)
- [基于 Amazon WorkSpaces Applications 快速搭建企业级应用培训环境](/ch11-023-基于-amazon-workspaces-applications-快速搭建企业级应用培训环境/)
- [End To End Encrypted Ml Inference With Amazon Sagemaker Ai A](/ch11-044-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a/)
- notes on pretraining parallelisms and failed training runs.
- MOC

---

