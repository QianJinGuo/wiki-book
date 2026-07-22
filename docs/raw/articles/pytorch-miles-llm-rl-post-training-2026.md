---
title: "Miles: A PyTorch-Native Stack for Large-Scale LLM RL Post-Training"
source: newsletter
source_url: https://pytorch.org/blog/miles-a-pytorch-native-stack-for-large-scale-llm-rl-post-training/
ingested: 2026-07-01
category: ai-infra
sha256: e9a6649bc377ea16f0f4c8356ec451d57a77b3f6c3819a1bab1c62d2ddf82827
---

# Miles: A PyTorch-Native Stack for Large-Scale LLM RL Post-Training

Miles is RadixArk's open source framework for large-scale LLM RL post-training. It composes SGLang for rollout, NVIDIA Megatron-LM for training, Ray orchestration, and PyTorch-native extensibility behind a small, pluggable trainer, with unified low-precision recipes, MoE-aware rollout/training alignment, fast NVIDIA NCCL/RDMA weight synchronization, observability, and fault tolerance built in — making frontier-scale LLM RL easier to build, reproduce, and operate.

## Why Miles?

Reinforcement learning has become a central part of post-training large language models. But as models become larger, transition from dense to mixture-of-experts (MoE), and run across more distributed and specialized hardware (e.g. NVIDIA Blackwell and Hopper series), RL post-training is no longer just a training loop. It is a distributed systems problem.

A modern LLM RL framework needs to coordinate several moving pieces:
- Rollout workers must generate samples at high throughput
- Trainers must consume those samples efficiently and compute stable policy updates
- The rollout policy and training policy must stay synchronized
- Large MoE models introduce routing behavior that must remain aligned across rollout and training
- Low-precision recipes need to work consistently across the full pipeline
- Long-running jobs need observability, checkpointing, and fault tolerance from the start

Miles was built for this setting. It is built natively on SGLang for high-throughput rollout and integrates deeply with Megatron-LM for scalable training, uses Ray to orchestrate the distributed system, and keeps PyTorch as the common programming and numerical layer throughout the stack. The goal is simple: make large-scale LLM RL training more composable, reproducible, and easier to scale, while keeping the core trainer small enough for researchers and infrastructure teams to customize.

## The Miles Architecture

Miles structures the RL pipeline into four composable layers:

| Layer | Component | Role |
|-------|-----------|------|
| Orchestration | Ray | Distributed job scheduling, fault tolerance |
| Rollout | SGLang | High-throughput inference for sample generation |
| Training | Megatron-LM | Scalable model training with pipeline/model parallelism |
| Common Layer | PyTorch | Numerical computation, model definition, extensibility |

### SGLang for High-Throughput Rollout

SGLang is used as the rollout engine, optimized for high-throughput LLM inference. It handles the sample generation phase of RL, where the model generates responses that are evaluated by the reward model. SGLang's efficient batching and tensor parallelism make it suitable for generating large volumes of training samples quickly.

### Megatron-LM for Scalable Training

Megatron-LM provides the training backbone with support for pipeline parallelism, tensor parallelism, and sequence parallelism. This allows Miles to scale training across hundreds of GPUs while maintaining high utilization. The MoE-aware alignment ensures that routing behavior stays consistent between rollout and training phases.

### Ray for Orchestration

Ray handles distributed job scheduling, resource management, and fault tolerance. Long-running RL training jobs are automatically recovered from node failures, with checkpointing built into the workflow. Ray's distributed scheduler coordinates the rollout workers and training workers across the cluster.

### PyTorch as the Common Layer

PyTorch serves as the unified numerical and model definition layer, allowing researchers to define custom models, loss functions, and training loops without learning framework-specific APIs. The trainer itself is designed to be small and pluggable — the core training logic is separated from the infrastructure scaffolding.

## Key Technical Features

- **Unified low-precision recipes**: FP8, BF16, and INT4 quantization are supported consistently across rollout and training, eliminating precision mismatch bugs
- **MoE-aware alignment**: Router logits are synchronized between rollout and training phases, preventing the policy drift that occurs when MoE routing diverges between inference and training
- **NVIDIA NCCL/RDMA weight synchronization**: Fast weight transfer between rollout workers and training workers over RDMA, minimizing synchronization overhead
- **Built-in observability**: Metrics for rollout throughput, training throughput, policy divergence, and reward trends are exposed via standard monitoring interfaces
- **Fault tolerance**: Ray-based checkpointing and automatic recovery for long-running jobs that may span days or weeks

## Availability

Miles is open source under the Apache 2.0 license. Repository and documentation are available through RadixArk's GitHub organization.

^[raw/articles/pytorch-miles-llm-rl-post-training-2026.md]

→ [[raw/articles/pytorch-miles-llm-rl-post-training-2026|原文存档]]
