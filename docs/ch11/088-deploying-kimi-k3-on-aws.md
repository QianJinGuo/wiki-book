# Deploying Kimi K3 on AWS

## Ch11.088 Deploying Kimi K3 on AWS

> 📊 Level ⭐⭐ | 10.7KB | `entities/deploying-kimi-k3-on-aws.md`

# Deploying Kimi K3 on AWS

> **Background**: Based on the AWS ML Blog article "Deploying Kimi K3 on AWS" (2026-07-27), covering the deployment of Moonshot AI's 2.8T parameter MoE model on AWS infrastructure via SageMaker HyperPod and EKS.

## 摘要

This entity synthesizes the official AWS deployment guide for Kimi K3, the first open-weight model to reach the 3-trillion-parameter class. It documents two production-grade deployment paths — Amazon SageMaker HyperPod (managed inference operator) and Amazon EKS (self-managed Kubernetes) — both requiring p6-b300 instances with NVIDIA B300 Blackwell Ultra GPUs. The deployment leverages a vLLM day-0 container, MXFP4 quantized weights, and tensor parallelism across 8 GPUs. This entity complements the wiki's existing coverage on Kimi K3's architecture, open-source release, and industry implications. 第 2 来源（Wafer, 2026-08）补充了 AMD MI355X 硬件路径：Kimi K3 在 8xMI355X（TP8）上达到 952 tok/s/node 聚合吞吐，性能每美元 48 tok/s/$，显著优于 B300（33）与 B200（7），并记录了 ROCm 上 speculative decode 的修复。

## 核心要点

- **First open-weight 3T model**: Kimi K3 is the first publicly available open-weight system at the 3-trillion-parameter scale, making frontier-level intelligence accessible for self-hosted deployments.
- **p6-b300 exclusively required**: The model needs `ml.p6-b300.48xlarge` instances (8× NVIDIA B300 Blackwell Ultra GPUs) with high-bandwidth interconnects for tensor-parallel inference.
- **Two capacity procurement mechanisms**: Flexible Training Plans (HyperPod, committed reservations) and Capacity Blocks (EKS, time-bound reservations) both secure scarce p6-b300 GPU capacity.
- **vLLM day-0 container**: Moonshot AI and the vLLM team co-delivered a dedicated inference container (`vllm/vllm-openai:kimi-k3`) with native MoE support, MXFP4 quantization, and K3-specific kernel fusion.
- **Dual deployment approaches**: SageMaker HyperPod provides a managed, YAML-driven path via the Inference Operator; EKS offers full Kubernetes control via Terraform-based provisioning.
- **OpenAI-compatible API**: The endpoint exposes `/v1/chat/completions`, invocable via the OpenAI Python SDK or cURL with zero code changes.
- **MXFP4 weights as deployment enabler**: The 4-bit format compresses 2.8T parameters from ~5.6 TB (FP16) to ~1.4 TB, making single-instance deployment feasible.
- **Production cleanup required**: Ephemeral GPU capacity must be actively managed — release training plans, terminate Capacity Blocks, and delete cluster resources to avoid runaway costs.
- **AMD MI355X 替代路径（2nd source）**: 8xMI355X（TP8）提供 952 tok/s/node，perf/dollar 48 tok/s/$ 碾压 B300/B200，是成本敏感团队的第三种部署选项。

## 深度分析

### Model Specifications

| Attribute | Value |
|---|---|
| Total Parameters | 2.8 Trillion |
| Active per Token | 104 Billion |
| Architecture | MoE (896 experts, 16 active) |
| Context Window | 1 Million Tokens |
| Modality | Text + Vision (native) |
| Weight Format | MXFP4 |
| Serving Engine | vLLM (`vllm/vllm-openai:kimi-k3`) |
| Required Instance | `ml.p6-b300.48xlarge` (8× B300 GPU) |
| Tensor Parallelism | 8 (full sharding) |

### Deployment Architecture: HyperPod vs. EKS

**SageMaker HyperPod with Inference Operator** provides the highest level of abstraction. The Inference Operator — installed automatically during HyperPod cluster creation with EKS orchestration — manages model downloads (from Hugging Face), container scheduling, health checks, and endpoint lifecycle. Deployment steps:

1. Create a HyperPod cluster via SageMaker AI console with EKS orchestration and `ml.p6-b300.48xlarge` worker nodes.
2. Procure a **Flexible Training Plan** — a committed capacity reservation guaranteeing p6-b300 availability in the target AZ.
3. Apply an `InferenceEndpointConfig` YAML manifest (model: `moonshotai/Kimi-K3`, image: `vllm/vllm-openai:kimi-k3`, tensor-parallel-size: 8, env: `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1`).

The complete YAML is available in the [aws-samples GitHub repo](https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml). The Inference Operator handles everything after `kubectl apply`.

**Amazon EKS** offers full Kubernetes control via the [AI on EKS](https://github.com/awslabs/ai-on-eks) project, which provides Terraform modules and Helm charts. The six-step process: provision cluster → reserve **Capacity Blocks** for p6-b300 → install NVIDIA GPU drivers → deploy vLLM via Helm → expose endpoint via LoadBalancer → validate. Serving arguments mirror the HyperPod path.

Both approaches converge on the same vLLM serving stack with key optimization choices: `--tensor-parallel-size 8` (mandatory for the 2.8T model), `--enable-prefix-caching` (critical for 1M context), `--enable-auto-tool-choice --tool-call-parser kimi_k3` (native function calling), `--reasoning-parser kimi_k3` (thinking mode), and the `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1` environment variable (custom kernel fusion for Gated MLA + LatentMoE tails).

### Significance and Capacity Economics

Kimi K3's AWS deployment marks several milestones: it breaks the 1T-parameter ceiling for open-weight models, signals production readiness through a full deployment walkthrough, demonstrates vLLM ecosystem maturity via day-0 container delivery, and validates MoE viability at extreme scale (27:1 sparsity ratio ensures infrastructure scales with active ~104B parameters, not total 2.8T).

The p6-b300 instance class is a constrained resource. Flexible Training Plans suit sustained 24/7 workloads; Capacity Blocks suit testing and short-term evaluations. Practitioners should plan procurement weeks in advance.

## 第 2 来源 — Wafer: Running Kimi K3 on AMD MI355X (2026-08-03)

> vxc=49 (v=7 c=7 s=3)。同 artifact（Kimi K3 部署）不同硬件平台（AMD MI355X vs AWS B300/B200），MERGE 为 2nd source。互补角度 6 条：

1. **AMD MI355X 作为 2.8T 模型的容量替代**：Kimi K3（2.8T 参数）权重 + 1M token KV cache 超过单 B200 节点（8x192GB）容量，此前只能选 B300（288GB/GPU）或双 B200 节点（TP16）；MI355X 同样 288GB/GPU，单价约为 B300 的 2.4 折、B200 的 1.7 折。
2. **实测吞吐数据**：1,024-token 输入 / 400-token 输出基准下，8xMI355X（TP8）达 952 tok/s/node、单流 118 tok/s——聚合吞吐是双节点 TP16 B200（498 tok/s 总量 ≈249/node）的 3.8 倍，单流解码为 1.3 倍；B300 聚合吞吐仍高 1.65 倍但价格贵 2.4 倍。
3. **性能/美元量化**：峰值聚合 48 tok/s/$（MI355X, $2.50/GPU-hr）vs 33（B300, $6.00）vs 7（B200, $4.25）——MI355X 在 perf/dollar 上碾压 Blackwell。
4. **B200 劣势的根因**：Kimi K3 无法装入单 8x192GB 节点，双节点 TP16 在 decode 关键路径付出跨节点 all-reduce 代价（RoCE v2 ~195 Gb/s）；MI355X 的 HBM 容量聚焦在此规模首次转化为可测优势。
5. **Speculative decode 路径**：K3 出厂零 draft tensors（无 MTP/EAGLE），唯一投机路径是外部 block-diffusion draft（RadixArk Kimi-K3-DSpark）；CUDA 直接运行，ROCm 上 sglang accept-sampling verifier 因 gfx950 缺 top-k renorm kernel 触发 `NameError: top_k_renorm_prob`，用单函数 PyTorch 修复（sort + masked_fill + rescale）注入 ROCm sampling 分支。
6. **AMD day-0 支持缩短工程差距**：AMD 为 Kimi K3 提供 day-0 支持，配合 agent 驱动的 kernel 优化正在弥合与 NVIDIA 的软件差距。

### 对部署决策的影响

Kimi K3 的部署矩阵从「只能选 AWS p6-b300」扩展为三硬件选项：B300（最高吞吐）、B200 双节点（中间）、MI355X（最佳 perf/dollar）。对成本敏感且能接受软件工程的团队，MI355X 是新的经济选择；speculative decode 的 ROCm 修复案例也提示 AMD 路径仍需内核级排障投入。

## 实践启示

1. **Plan GPU capacity well ahead**: p6-b300 instances require reservations — neither Flex Training Plans nor Capacity Blocks are available on-demand.
2. **MXFP4 is a deployment enabler**: Without 4-bit quantization, the 2.8T model would need 5.6 TB GPU memory. MXFP4 + MoE sparsity makes single-instance deployment viable.
3. **The vLLM container is the critical path dependency**: Ensure your cluster can pull `vllm/vllm-openai:kimi-k3` and has network access to Hugging Face or S3 for weights.
4. **Choose your abstraction level**: HyperPod for managed experience with minimal Kubernetes expertise; EKS for teams with existing K8s infrastructure needing fine-grained control.
5. **OpenAI API compatibility reduces integration friction**: Swap in Kimi K3 by changing only `base_url` in existing OpenAI SDK code.
6. **Track vLLM upstream merges**: The day-0 `kimi-k3` tag will eventually merge into the main vLLM container — monitor upstream to avoid depending on a stale custom tag.
7. **评估 AMD 路径的 perf/dollar**（2nd source）：MI355X 每美元吞吐是 B300 的约 1.5 倍、B200 的约 6.9 倍，但需承担 ROCm 内核级排障成本；B300 仍是最高吞吐选择。

## 相关实体

- [Kimi K3 2.8T Open Source Model 2026](../ch01/1416-kimi-k3.html) — Architectural deep dive on KDA, Attention Residuals, Stable LatentMoE, and GPU compiler innovations
- [Kimi K3 2 8T Params Open Source](../ch01/889-kimi-k3-2-8t.html) — Coverage of the open-source release and model availability on Hugging Face
- [Kimi K3 The Open Weights Escalation](../ch01/608-kimi-k3-the-open-weights-escalation.html) — Industry analysis on geopolitical and competitive implications of open-weight 3T models
- **SageMaker HyperPod** — SageMaker HyperPod managed infrastructure for large-scale ML workloads
- [Vllm](../ch01/883-vllm.html) — The vLLM inference engine powering the Kimi K3 serving stack
- [Moe Architecture](../ch01/1443-moe-architecture.html) — Mixture of Experts architecture pattern used by Kimi K3 and other large-scale models
- [Amd Free Gpu Deepseek R1 Private Deployment](../ch01/1465-deepseek.html) — AMD 上部署开源模型的先例

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/deploying-kimi-k3-on-aws.md) · [第 2 来源原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/kimi-k3-mi355x-amd-deployment-wafer.md)

---

