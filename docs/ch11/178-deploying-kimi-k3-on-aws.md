# Deploying Kimi K3 on AWS

## Ch11.178 Deploying Kimi K3 on AWS

> 📊 Level ⭐⭐ | 7.6KB | `entities/deploying-kimi-k3-on-aws.md`

# Deploying Kimi K3 on AWS

> **Background**: Based on the AWS ML Blog article "Deploying Kimi K3 on AWS" (2026-07-27), covering the deployment of Moonshot AI's 2.8T parameter MoE model on AWS infrastructure via SageMaker HyperPod and EKS.

## 摘要

This entity synthesizes the official AWS deployment guide for Kimi K3, the first open-weight model to reach the 3-trillion-parameter class. It documents two production-grade deployment paths — Amazon SageMaker HyperPod (managed inference operator) and Amazon EKS (self-managed Kubernetes) — both requiring p6-b300 instances with NVIDIA B300 Blackwell Ultra GPUs. The deployment leverages a vLLM day-0 container, MXFP4 quantized weights, and tensor parallelism across 8 GPUs. This entity complements the wiki's existing coverage on Kimi K3's architecture, open-source release, and industry implications.

## 核心要点

- **First open-weight 3T model**: Kimi K3 is the first publicly available open-weight system at the 3-trillion-parameter scale, making frontier-level intelligence accessible for self-hosted deployments.
- **p6-b300 exclusively required**: The model needs `ml.p6-b300.48xlarge` instances (8× NVIDIA B300 Blackwell Ultra GPUs) with high-bandwidth interconnects for tensor-parallel inference.
- **Two capacity procurement mechanisms**: Flexible Training Plans (HyperPod, committed reservations) and Capacity Blocks (EKS, time-bound reservations) both secure scarce p6-b300 GPU capacity.
- **vLLM day-0 container**: Moonshot AI and the vLLM team co-delivered a dedicated inference container (`vllm/vllm-openai:kimi-k3`) with native MoE support, MXFP4 quantization, and K3-specific kernel fusion.
- **Dual deployment approaches**: SageMaker HyperPod provides a managed, YAML-driven path via the Inference Operator; EKS offers full Kubernetes control via Terraform-based provisioning.
- **OpenAI-compatible API**: The endpoint exposes `/v1/chat/completions`, invocable via the OpenAI Python SDK or cURL with zero code changes.
- **MXFP4 weights as deployment enabler**: The 4-bit format compresses 2.8T parameters from ~5.6 TB (FP16) to ~1.4 TB, making single-instance deployment feasible.
- **Production cleanup required**: Ephemeral GPU capacity must be actively managed — release training plans, terminate Capacity Blocks, and delete cluster resources to avoid runaway costs.

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

## 实践启示

1. **Plan GPU capacity well ahead**: p6-b300 instances require reservations — neither Flex Training Plans nor Capacity Blocks are available on-demand.
2. **MXFP4 is a deployment enabler**: Without 4-bit quantization, the 2.8T model would need 5.6 TB GPU memory. MXFP4 + MoE sparsity makes single-instance deployment viable.
3. **The vLLM container is the critical path dependency**: Ensure your cluster can pull `vllm/vllm-openai:kimi-k3` and has network access to Hugging Face or S3 for weights.
4. **Choose your abstraction level**: HyperPod for managed experience with minimal Kubernetes expertise; EKS for teams with existing K8s infrastructure needing fine-grained control.
5. **OpenAI API compatibility reduces integration friction**: Swap in Kimi K3 by changing only `base_url` in existing OpenAI SDK code.
6. **Track vLLM upstream merges**: The day-0 `kimi-k3` tag will eventually merge into the main vLLM container — monitor upstream to avoid depending on a stale custom tag.

## 相关实体

- [Kimi K3 2.8T Open Source Model 2026](../ch01/231-kimi-k3.html) — Architectural deep dive on KDA, Attention Residuals, Stable LatentMoE, and GPU compiler innovations
- [Kimi K3 2 8T Params Open Source](../ch01/875-kimi-k3-2-8t.html) — Coverage of the open-source release and model availability on Hugging Face
- [Kimi K3 The Open Weights Escalation](../ch01/718-kimi-k3-the-open-weights-escalation.html) — Industry analysis on geopolitical and competitive implications of open-weight 3T models
- **SageMaker HyperPod** — SageMaker HyperPod managed infrastructure for large-scale ML workloads
- [Vllm](../ch01/1224-vllm.html) — The vLLM inference engine powering the Kimi K3 serving stack
- [Moe Architecture](../ch01/1408-moe-architecture.html) — Mixture of Experts architecture pattern used by Kimi K3 and other large-scale models

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/deploying-kimi-k3-on-aws.md)

---

